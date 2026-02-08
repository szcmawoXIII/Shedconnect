// overlay.js — финальная стабильная версия, синхронизированная с supabase-client.js

import { supabase } from "./supabase-client.js";

console.log("OVERLAY.JS + SUPABASE FINAL HARD v3");

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
        .select("*")
        .order("id", { ascending: true });

    if (error) {
        console.error("Ошибка загрузки списка пешек:", error);
        return;
    }

    const list = document.querySelector("#pawn-list");
    list.innerHTML = "";

    data.forEach(pawn => {
        const btn = document.createElement("button");
        btn.textContent = pawn.name;
        btn.onclick = () => loadPawn(pawn.id);
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
        .eq("id", id)
        .single();

    if (error) {
        console.error("Ошибка загрузки пешки:", error);
        return;
    }

    currentPawnInfo = data;

    renderPawn(data);
    renderHealth(data);
    renderShop(data);
}

// ===============================
// РЕНДЕР ОСНОВНОЙ ИНФОРМАЦИИ
// ===============================

function renderPawn(info) {
    document.querySelector("#pawn-name").textContent = info.name;

    const portrait = document.querySelector("#pawn-portrait .portrait-inner");
    portrait.style.background = `url("${info.portrait}") center/cover no-repeat`;

    // Потребности
    const needs = tryParse(info.needs, {});
    updateBar("food", needs.food);
    updateBar("rest", needs.rest);
    updateBar("joy", needs.joy);
    updateBar("mood", needs.mood, true);
}

function updateBar(name, value, isMood = false) {
    const fill = document.querySelector(`#bar-${name} .rw-bar-fill`);
    const label = document.querySelector(`#bar-${name} .rw-bar-label`);

    if (!fill || !label) return;

    const pct = clamp(value * 100, 0, 100);
    fill.style.width = pct + "%";

    if (isMood) fill.classList.add("mood");

    label.textContent = Math.round(pct) + "%";
}

// ===============================
// РЕНДЕР ВКЛАДКИ "ЗДОРОВЬЕ"
// ===============================

function renderHealth(info) {
    const container = document.querySelector("#health-list");
    container.innerHTML = "";

    const parts = tryParse(info.healthParts, []);

    parts.forEach(p => {
        const row = document.createElement("div");
        row.className = "health-row";
        row.innerHTML = `
            <div class="health-name">${p.label}</div>
            <div class="health-severity">${p.severity}</div>
        `;
        container.appendChild(row);
    });
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

        document.querySelector(`#tab-${tab}`).classList.add("active");
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

        document.querySelector(`#shop-tab-${tab}`).classList.add("active");
    };
});
