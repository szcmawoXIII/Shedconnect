console.log("OVERLAY.JS FIXED RIGHT BALANCE v1");

import { createClient } from "https://esm.sh/@supabase/supabase-js";
import { renderPersona } from "./persona.js";
import { renderNeeds } from "./needs.js";
import { renderHealth } from "./health.js";
import { renderShopPersona } from "./shop-persona.js";
import { renderShopHealth } from "./shop-health.js";
import { renderShopEvents } from "./shop-events.js";

const supabase = createClient(
    "https://fezlfobvavcxpwzovsoz.supabase.co",
    "sb_publishable_HjeSTZJOE2JEKBfuG1BxAQ_8oj30LvD"
);

let currentPawn = null;

document.addEventListener("DOMContentLoaded", () => {

    document.querySelectorAll('#tabs button').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.querySelector('#tab-' + btn.dataset.tab)?.classList.add('active');
        });
    });
    document.querySelector('#tab-persona')?.classList.add('active');

    document.querySelectorAll('#shop-tabs button').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.shop-tab').forEach(t => t.classList.remove('active'));
            document.querySelector('#shop-tab-' + btn.dataset.shopTab)?.classList.add('active');
        });
    });
    document.querySelector('#shop-tab-persona')?.classList.add('active');

    document.querySelector("#refresh-list").onclick = loadPawnList;

    loadPawnList();
});

async function loadPawnList() {
    const { data } = await supabase.from("pawns").select("user").order("user", { ascending: true });
    renderPawnList(data?.map(x => x.user) ?? []);
    if (data && data.length > 0) selectPawn(data[0].user);
}

function renderPawnList(list) {
    const c = document.querySelector("#pawn-list");
    c.innerHTML = "";
    if (!list || list.length === 0) {
        c.innerHTML = "<i>Нет активных пешек</i>";
        return;
    }
    list.forEach(user => {
        const btn = document.createElement("button");
        btn.textContent = user;
        btn.className = "rw-button";
        btn.onclick = () => selectPawn(user);
        c.appendChild(btn);
    });
}

async function selectPawn(user) {
    currentPawn = user;
    document.querySelector("#pawn-name").textContent = user;
    document.querySelector("#shop-balance").textContent = "—";
    await loadPawnInfo(user);
    await loadBalance(user);
}

async function loadPawnInfo(user) {
    const { data } = await supabase.from("pawns").select("*").eq("user", user).single();
    if (!data) return;
    updatePawnInfo(data);
}

function tryParse(obj, fallback) {
    if (obj == null) return fallback;
    if (typeof obj === "string") {
        try { return JSON.parse(obj); } catch { return fallback; }
    }
    return obj;
}

function normalizeHealthPercent(v) {
    let n = parseFloat(String(v).replace("%", "").replace(",", "."));
    return isNaN(n) ? 0 : (n <= 1 ? n * 100 : n);
}

function updatePawnInfo(info) {
    info.persona = tryParse(info.persona, {});
    info.needs = tryParse(info.needs, {});
    info.healthParts = tryParse(info.healthParts, []);
    info.skills = tryParse(info.skills, {});
    info.passions = tryParse(info.passions, {});
    info.disabledSkills = tryParse(info.disabledSkills, []);
    info.capacities = tryParse(info.capacities, {});
    info.thoughts = tryParse(info.thoughts, []);
    info.traits = tryParse(info.traits, []);

    if (info.portrait) {
        const p = document.querySelector(".portrait-inner");
        p.style.backgroundImage = `url(data:image/png;base64,${info.portrait})`;
        p.style.backgroundSize = "cover";
        p.style.backgroundPosition = "center";
    }

    setBar("#pawn-health-fill", normalizeHealthPercent(info.healthSummary));
    let mood = info.needs.Mood ?? info.needs.mood ?? 0;
    if (mood <= 1) mood *= 100;
    setBar("#pawn-mood-fill", mood);

    renderPersona(info);
    renderNeeds(info);
    renderHealth(info);

    renderShopPersona(info);
    renderShopHealth(info);
    renderShopEvents(info);
}

async function loadBalance(user) {
    const { data } = await supabase.from("balances").select("balance").eq("user", user).single();
    if (!data) return;
    updateBalance(data.balance);
}

function updateBalance(balance) {
    document.querySelector("#shop-balance").innerHTML =
        `<img src="img/catcoin.png" class="kat-icon"> ${balance}`;
}

function setBar(sel, percent) {
    const el = document.querySelector(sel);
    el.style.width = Math.max(0, Math.min(100, percent)) + "%";
}
