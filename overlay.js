// overlay.js — версия без использования поля id

import { supabase } from "./supabase-client.js";

console.log("OVERLAY.JS — NO ID MODE");

// ===============================
// УТИЛИТЫ
// ===============================

function tryParse(json, fallback) {
    try {
        return JSON.parse(json);
    } catch {
        return fallback;
    }
}

function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
}

// ===============================
// ГЛОБАЛЬНОЕ СОСТОЯНИЕ
// ===============================

let currentPawnId = null;
let currentPawnInfo = null;

// ===============================
// ЗАГРУЗКА СПИСКА ПЕШЕК
// ===============================

async function loadPawnList() {
    const { data, error } = await supabase
        .from("pawns")
        .select("*");

    if (error) {
        console.error("Ошибка загрузки списка пешек:", error);
        return;
    }

    const list = document.querySelector("#pawn-list");
    list.innerHTML = "";

    data.forEach(pawn => {
        const btn = document.createElement("button");
        btn.textContent = pawn.user;
        btn.onclick = () => loadPawn(pawn.user_id);
        list.appendChild(btn);
    });
}

document.querySelector("#refresh-list").onclick = loadPawnList;

// ===============================
// ЗАГРУЗКА ОДНОЙ ПЕШКИ
// ===============================

async function loadPawn(id) {
    currentPawnId = id;

    const { data, error } = await supabase
        .from("pawns")
        .select("*")
        .eq("user_id", id)
        .single();

    if (error) {
        console.error("Ошибка загрузки пешки:", error);
        return;
    }

    currentPawnInfo = data;

    renderPawn(data);
    renderNeeds(data);
    renderHealth(data);
    renderShop(data);
}

// ===============================
// РЕНДЕР ОСНОВНОЙ ИНФОРМАЦИИ
// ===============================

function renderPawn(info) {
    document.querySelector("#pawn-name").textContent = info.user;

    const portrait = document.querySelector("#pawn-portrait .portrait-inner");
    portrait.style.background = `url("${info.portrait}") center/cover no-repeat`;

    const needs = tryParse(info.needs, {});
    updateBar("health", info.healthSummary ?? 1);
    updateBar("mood", needs.Joy ?? 1, true);
}

function updateBar(name, value, isMood = false) {
    const fill = document.querySelector(`#pawn-${name}-fill`);
    const label = document.querySelector(`#pawn-${name}-bar .rw-bar-label`);

    if (!fill || !label) return;

    const pct = clamp(value * 100, 0, 100);
    fill.style.width = pct + "%";

    if (isMood) fill.classList.add("mood");

    label.textContent = Math.round(pct) + "%";
}

// ===============================
// РЕНДЕР НУЖД
// ===============================

function renderNeeds(info) {
    const el = document.querySelector("#tab-needs");
    const needs = tryParse(info.needs, {});

    el.innerHTML = `
        <div class="needs-list">
            ${Object.entries(needs)
                .map(([k, v]) => `
                    <div class="rw-bar">
                        <div class="rw-bar-fill" style="width:${v * 100}%"></div>
                        <span class="rw-bar-label">${k}</span>
                    </div>
                `)
                .join("")}
        </div>
    `;
}

// ===============================
// РЕНДЕР ЗДОРОВЬЯ
// ===============================

function renderHealth(info) {
    const el = document.querySelector("#tab-health");
    const parts = tryParse(info.healthParts, []);

    el.innerHTML = parts.length === 0
        ? `<div>Повреждений нет</div>`
        : parts.map(p => `
            <div class="health-row">
                <div class="health-name">${p.label}</div>
                <div class="health-severity">${p.severity}</div>
            </div>
        `).join("");
}

// ===============================
// РЕНДЕР МАГАЗИНА
// ===============================

import { renderShopPersona } from "./shop-persona.js";

function renderShop(info) {
    renderShopPersona(info);
}

// ===============================
// ИНИЦИАЛИЗАЦИЯ
// ===============================

loadPawnList();

// ===============================
// ПЕРЕКЛЮЧЕНИЕ ВКЛАДОК
// ===============================

document.querySelectorAll("#tabs button").forEach(btn => {
    btn.onclick = () => {
        const tab = btn.dataset.tab;

        document.querySelectorAll("#content .tab").forEach(t => {
            t.classList.remove("active");
        });

        const target = document.querySelector(`#tab-${tab}`);
        if (target) target.classList.add("active");
    };
});

// ===============================
// ПЕРЕКЛЮЧЕНИЕ ВКЛАДОК МАГАЗИНА
// ===============================

document.querySelectorAll("#shop-tabs button").forEach(btn => {
    btn.onclick = () => {
        const tab = btn.dataset.tab;

        document.querySelectorAll("#shop-content .shop-tab").forEach(t => {
            t.classList.remove("active");
        });

        const target = document.querySelector(`#shop-tab-${tab}`);
        if (target) target.classList.add("active");
    };
});
