// overlay.js — версия под Supabase
console.log("OVERLAY.JS + SUPABASE v1 (from WS)");

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

document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll('#tabs button').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;

            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            const target = document.querySelector('#tab-' + tab);
            if (target) target.classList.add('active');
        });
    });

    document.querySelector('#tab-persona')?.classList.add('active');

    const refreshBtn = document.querySelector("#refresh-list");
    if (refreshBtn) refreshBtn.onclick = loadPawnList;

    loadPawnList();
});

// ===============================
// СПИСОК ПЕШЕК (pawns)
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
        document.querySelector("#pawn-balance").textContent = "—";
        updateActionButton(false, user);
        return;
    }

    updatePawnInfo(data);
}

function normalizeHealthPercent(value) {
    if (!value) return 0;
    let raw = String(value).replace("%", "").replace(",", ".");
    let num = parseFloat(raw);
    if (isNaN(num)) return 0;
    return num <= 1 ? num * 100 : num;
}

function updatePawnInfo(info) {
    if (!info || info.found === false) {
        document.querySelector("#pawn-name").textContent = "Пешка не найдена";
        document.querySelector("#pawn-balance").textContent = "—";
        updateActionButton(false, currentPawn);
        return;
    }

    // JSON-поля (jsonb уже приходят объектами, но подстрахуемся)
    function ensure(obj, fallback) {
        if (obj == null) return fallback;
        if (typeof obj === "string") {
            try { return JSON.parse(obj); } catch { return fallback; }
        }
        return obj;
    }

    info.persona = ensure(info.persona, {});
    info.needs = ensure(info.needs, {});
    info.healthParts = ensure(info.healthParts, []);
    info.skills = ensure(info.skills, {});
    info.passions = ensure(info.passions, {});
    info.disabledSkills = ensure(info.disabledSkills, []);
    info.capacities = ensure(info.capacities, {});
    info.thoughts = ensure(info.thoughts, []);
    info.traits = ensure(info.traits, []);

    document.querySelector("#pawn-name").textContent = info.user;

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
    const health = normalizeHealthPercent(info.healthSummary);
    setBar("#pawn-health-fill", health);

    let mood = info.needs?.Mood ?? info.needs?.mood ?? 0;
    if (mood <= 1) mood = mood * 100;
    setBar("#pawn-mood-fill", mood);

    // Вкладки
    renderPersona(info);
    renderNeeds(info);
    renderHealth(info);

    updateActionButton(true, info.user);
}

// ===============================
// БАЛАНС (таблица balances)
// ===============================

async function loadBalance(user) {
    if (!user) return;

    const { data, error } = await supabase
        .from("balances")
        .select("balance")
        .eq("user", user)
        .single();

    if (error || !data) {
        document.querySelector("#pawn-balance").textContent = "—";
        return;
    }

    updateBalance({ user, balance: data.balance });
}

function updateBalance(data) {
    if (!data || !data.user || !currentPawn) return;
    if (data.user.toLowerCase() !== currentPawn.toLowerCase()) return;

    const el = document.querySelector("#pawn-balance");
    if (!el) return;

    el.innerHTML = `<img src="img/catcoin.png" class="kat-icon">Каты: ${data.balance}`;
}

// ===============================
// КНОПКИ ДЕЙСТВИЙ (пока только визуал)
// ===============================

function updateActionButton(exists, user) {
    const spawnBtn = document.querySelector("#spawn-pawn-btn");
    const deleteBtn = document.querySelector("#delete-pawn-btn");
    if (!spawnBtn || !deleteBtn) return;

    if (!exists) {
        spawnBtn.style.display = "inline-block";
        deleteBtn.style.display = "none";
        spawnBtn.onclick = () => {
            console.log("spawn requested for", user, "(реализация через бота/сервер)");
        };
    } else {
        spawnBtn.style.display = "none";
        deleteBtn.style.display = "inline-block";
        deleteBtn.onclick = () => {
            console.log("execute requested for", user, "(реализация через бота/сервер)");
        };
    }
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
// REALTIME: ОБНОВЛЕНИЕ ПЕШЕК И БАЛАНСОВ
// ===============================

supabase
    .channel("pawns-realtime")
    .on("postgres_changes", { event: "UPDATE", schema: "public", table: "pawns" }, payload => {
        if (!currentPawn || !payload.new) return;
        if (payload.new.user?.toLowerCase() === currentPawn.toLowerCase()) {
            updatePawnInfo(payload.new);
        }
        loadPawnList();
    })
    .subscribe();

supabase
    .channel("balances-realtime")
    .on("postgres_changes", { event: "UPDATE", schema: "public", table: "balances" }, payload => {
        if (!currentPawn || !payload.new) return;
        updateBalance(payload.new);
    })
    .subscribe();

// ===============================
// РЕЗЕРВНОЕ АВТО-ОБНОВЛЕНИЕ
// ===============================

setInterval(() => {
    if (!currentPawn) return;
    loadPawnInfo(currentPawn);
    loadBalance(currentPawn);
}, 2000);
