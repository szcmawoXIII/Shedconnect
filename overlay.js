// overlay.js — стабильная версия под Supabase
console.log("OVERLAY.JS + SUPABASE v5 (stable)");

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
// ИНИЦИАЛИЗАЦИЯ DOM (вкладки и кнопки) ПОСЛЕ ЗАГРУЗКИ
// ===============================

document.addEventListener("DOMContentLoaded", () => {
    // Переключение вкладок
    document.querySelectorAll('#tabs button').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;

            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            const target = document.querySelector('#tab-' + tab);
            if (target) target.classList.add('active');
        });
    });

    const firstTab = document.querySelector('#tab-persona');
    if (firstTab) firstTab.classList.add('active');

    // Кнопка обновления списка
    const refreshBtn = document.querySelector("#refresh-list");
    if (refreshBtn) refreshBtn.onclick = loadPawnList;

    // Стартовая загрузка
    loadPawnList();
});

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

function renderPawnList(list) {
    const container = document.querySelector("#pawn-list");
    if (!container) return;

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

    const nameEl = document.querySelector("#pawn-name");
    const balEl = document.querySelector("#pawn-balance");

    if (nameEl) nameEl.textContent = user;
    if (balEl) balEl.textContent = "—";

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
        const nameEl = document.querySelector("#pawn-name");
        if (nameEl) nameEl.textContent = "Пешка не найдена";
        return;
    }

    updatePawnInfo(data);
}

function normalizeHealthPercent(healthSummary) {
    if (!healthSummary) return 0;

    let raw = String(healthSummary).trim().replace("%", "").replace(",", ".");
    let value = parseFloat(raw);

    if (isNaN(value)) return 0;

    // Если пришло 0–1 → считаем, что это доля и умножаем на 100
    if (value <= 1) value *= 100;

    return Math.max(0, Math.min(100, value));
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

    const nameEl = document.querySelector("#pawn-name");
    if (nameEl) nameEl.textContent = info.user;

    // Портрет
    if (info.portrait && info.portrait.length > 10) {
        const portrait = document.querySelector(".portrait-inner");
        if (portrait) {
            portrait.style.backgroundImage = `url(data:image/png;base64,${info.portrait})`;
            portrait.style.backgroundSize = "cover";
            portrait.style.backgroundPosition = "center";
        }
    }

    // Полоски
    const healthPercent = normalizeHealthPercent(info.healthSummary);
    setBar("#pawn-health-fill", healthPercent);

    let mood = info.needs?.Mood ?? info.needs?.mood ?? 0;
    if (mood <= 1) mood = mood * 100;
    setBar("#pawn-mood-fill", mood);

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

    const clamped = Math.max(0, Math.min(100, percent || 0));
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

        if (payload.new.user?.toLowerCase() === currentPawn.toLowerCase()) {
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
