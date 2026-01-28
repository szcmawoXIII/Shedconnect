// overlay.js — стабильная версия под Supabase
console.log("OVERLAY.JS + SUPABASE v4 (stable)");

import { createClient } from "https://esm.sh/@supabase/supabase-js";
import { renderPersona } from "./persona.js";
import { renderNeeds } from "./needs.js";
import { renderHealth } from "./health.js";

// ===============================
// НАСТРОЙКИ SUPABASE
// ===============================

const SUPABASE_URL = "https://fezlfobvavcxpwzovsoz.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_HjeSTZJOE2JEKBfuG1BxAQ_8oj30LvD";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let currentPawn = null;

// ===============================
// ПЕРЕКЛЮЧЕНИЕ ВКЛАДОК
// ===============================

document.querySelectorAll('#tabs button').forEach(btn => {
    btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;

        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelector('#tab-' + tab).classList.add('active');
    });
});

document.querySelector('#tab-persona').classList.add('active');

// ===============================
// ЗАГРУЗКА СПИСКА ПЕШЕК
// ===============================

async function loadPawnList() {
    const { data, error } = await supabase
        .from("pawns")
        .select("user")
        .order("user", { ascending: true });

    if (error) {
        console.error("Ошибка загрузки списка пешек:", error);
        return;
    }

    renderPawnList(data?.map(x => x.user) ?? []);
}

document.querySelector("#refresh-list").onclick = loadPawnList;

function renderPawnList(list) {
    const container = document.querySelector("#pawn-list");
    container.innerHTML = "";

    if (!list || list.length === 0) {
        container.innerHTML = "<i>Нет активных пешек</i>";
        return;
    }

    list.forEach(user => {
        const btn = document.createElement("button");
        btn.textContent = user;
        btn.onclick = () => selectPawn(user);
        container.appendChild(btn);
    });
}

// ===============================
// ВЫБОР ПЕШКИ
// ===============================

async function selectPawn(user) {
    currentPawn = user;

    document.querySelector("#pawn-name").textContent = user;
    document.querySelector("#pawn-balance").textContent = "—";

    await loadPawnInfo(user);
    await loadBalance(user);
}

// ===============================
// ЗАГРУЗКА ИНФОРМАЦИИ О ПЕШКЕ
// ===============================

async function loadPawnInfo(user) {
    const { data, error } = await supabase
        .from("pawns")
        .select("*")
        .eq("user", user)
        .single();

    if (error || !data) {
        document.querySelector("#pawn-name").textContent = "Пешка не найдена";
        return;
    }

    updatePawnInfo(data);
}

function updatePawnInfo(info) {
    if (!info) return;

    // Защита от отсутствующих полей
    info.needs ??= {};
    info.healthParts ??= [];
    info.persona ??= {};
    info.skills ??= {};
    info.passions ??= {};
    info.disabledSkills ??= [];

    document.querySelector("#pawn-name").textContent = info.user;

    // Портрет
    if (info.portrait && info.portrait.length > 10) {
        const portrait = document.querySelector(".portrait-inner");
        portrait.style.backgroundImage = `url(data:image/png;base64,${info.portrait})`;
        portrait.style.backgroundSize = "cover";
        portrait.style.backgroundPosition = "center";
    }

    // Полоски
    let health = parseFloat(info.healthSummary?.replace("%", "").replace(",", ".")) || 0;
    setBar("#pawn-health-fill", health);

    let mood = info.needs?.Mood ?? info.needs?.mood ?? 0;
    setBar("#pawn-mood-fill", mood * 100);

    // Вкладки
    renderPersona(info);
    renderNeeds(info);
    renderHealth(info);
}

// ===============================
// ЗАГРУЗКА БАЛАНСА
// ===============================

async function loadBalance(user) {
    const { data, error } = await supabase
        .from("balances")
        .select("balance")
        .eq("user", user)
        .single();

    if (error || !data) return;

    updateBalance({ user, balance: data.balance });
}

function updateBalance(data) {
    if (!data || !data.user) return;
    if (!currentPawn) return;

    if (data.user.toLowerCase() !== currentPawn.toLowerCase()) return;

    const el = document.querySelector("#pawn-balance");
    if (!el) return;

    el.innerHTML = `<img src="img/catcoin.png" class="kat-icon">Каты: ${data.balance}`;
}

// ===============================
// ХЕЛПЕР ДЛЯ ПОЛОСОК
// ===============================

function setBar(selector, percent) {
    const el = document.querySelector(selector);
    if (!el) return;

    const clamped = Math.max(0, Math.min(100, percent));
    el.style.width = clamped + "%";
}

// ===============================
// REALTIME: ТОЛЬКО UPDATE (без мигания)
// ===============================

supabase
    .channel("pawns-realtime")
    .on("postgres_changes", { event: "UPDATE", schema: "public", table: "pawns" }, payload => {
        if (!currentPawn) return;
        if (!payload.new) return;

        if (payload.new.user.toLowerCase() === currentPawn.toLowerCase()) {
            updatePawnInfo(payload.new);
        }

        loadPawnList();
    })
    .subscribe();

// ===============================
// АВТО-ОБНОВЛЕНИЕ (резервное)
// ===============================

setInterval(() => {
    if (!currentPawn) return;
    loadPawnInfo(currentPawn);
    loadBalance(currentPawn);
}, 2000);

// ===============================
// ЗАПУСК
// ===============================

loadPawnList();
