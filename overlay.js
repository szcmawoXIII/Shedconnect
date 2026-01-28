// overlay.js — стабильная версия под Supabase
console.log("OVERLAY.JS + SUPABASE FINAL v3");

import { createClient } from "https://esm.sh/@supabase/supabase-js";
import { renderPersona } from "./persona.js";
import { renderNeeds } from "./needs.js";
import { renderHealth } from "./health.js";

const SUPABASE_URL = "https://fezlfobvavcxpwzovsoz.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_HjeSTZJOE2JEKBfuG1BxAQ_8oj30LvD";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let currentPawn = null;

// ===============================
// ВКЛАДКИ
// ===============================

document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll('#tabs button').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;

            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.querySelector('#tab-' + tab).classList.add('active');
        });
    });

    document.querySelector('#tab-persona')?.classList.add('active');

    document.querySelector("#refresh-list").onclick = loadPawnList;

    loadPawnList();
});

// ===============================
// СПИСОК ПЕШЕК
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
        return;
    }

    updatePawnInfo(data);
}

function tryParse(obj, fallback) {
    if (obj == null) return fallback;
    if (typeof obj === "string") {
        try { return JSON.parse(obj); }
        catch { return fallback; }
    }
    return obj;
}

function normalizeHealthPercent(value) {
    if (!value) return 0;
    let raw = String(value).replace("%", "").replace(",", ".");
    let num = parseFloat(raw);
    if (isNaN(num)) return 0;
    return num <= 1 ? num * 100 : num;
}

function updatePawnInfo(info) {
    info.found = true;

    info.persona = tryParse(info.persona, {});
    info.needs = tryParse(info.needs, {});
    info.healthParts = tryParse(info.healthParts, []);
    info.skills = tryParse(info.skills, {});
    info.passions = tryParse(info.passions, {});
    info.disabledSkills = tryParse(info.disabledSkills, []);
    info.capacities = tryParse(info.capacities, {});
    info.thoughts = tryParse(info.thoughts, []);
    info.traits = tryParse(info.traits, []);

    document.querySelector("#pawn-name").textContent = info.user;

    if (info.portrait && info.portrait.length > 10) {
        const portrait = document.querySelector(".portrait-inner");
        portrait.style.backgroundImage = `url(data:image/png;base64,${info.portrait})`;
        portrait.style.backgroundSize = "cover";
        portrait.style.backgroundPosition = "center";
    }

    const health = normalizeHealthPercent(info.healthSummary);
    setBar("#pawn-health-fill", health);

    let mood = info.needs.Mood ?? info.needs.mood ?? 0;
    if (mood <= 1) mood *= 100;
    setBar("#pawn-mood-fill", mood);

    renderPersona(info);
    renderNeeds(info);
    renderHealth(info);
}

// ===============================
// БАЛАНС
// ===============================

async function loadBalance(user) {
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
    if (!data || !currentPawn) return;
    if (data.user.toLowerCase() !== currentPawn.toLowerCase()) return;

    document.querySelector("#pawn-balance").innerHTML =
        `<img src="img/catcoin.png" class="kat-icon">Каты: ${data.balance}`;
}

// ===============================
// ПОЛОСЫ
// ===============================

function setBar(selector, percent) {
    const el = document.querySelector(selector);
    if (!el) return;
    const clamped = Math.max(0, Math.min(100, percent || 0));
    el.style.width = clamped + "%";
}

// ===============================
// REALTIME
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
