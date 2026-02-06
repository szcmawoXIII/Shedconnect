// ======================================================
// 1. ПОЛУЧАЕМ UID И ЛОГИН ИЗ URL И ЗАПИСЫВАЕМ В SUPABASE
// ======================================================

const params = new URLSearchParams(window.location.search);
const uid = params.get("uid");
const login = params.get("login");

const SUPABASE_URL = "https://fezlfobvavcxpwzovsoz.supabase.co";
const SUPABASE_KEY = "sb_publishable_HjeSTZJOE2JEKBfuG1BxAQ_8oj30LvD";

// Универсальная вставка с игнорированием ошибок UNIQUE
async function safeInsert(table, body) {
    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
            method: "POST",
            headers: {
                "apikey": SUPABASE_KEY,
                "Authorization": `Bearer ${SUPABASE_KEY}`,
                "Content-Type": "application/json",
                "Prefer": "return=representation"
            },
            body: JSON.stringify(body)
        });

        const json = await res.json();
        console.log(`INSERT ${table}:`, json);
    } catch (err) {
        console.error(`Ошибка вставки в ${table}:`, err);
    }
}

// Если пришли uid + login → создаём записи
if (uid && login) {
    console.log("Получены данные Twitch:", { uid, login });

    // 1) Создаём пешку
    safeInsert("pawns", {
        user: login,
        user_id: uid,
        found: false,
        healthSummary: "0",
        traits: [],
        skills: {},
        passions: {},
        needs: {},
        thoughts: [],
        pain: "",
        capacities: {},
        healthParts: [],
        persona: {},
        portrait: "",
        disabledSkills: []
    });

    // 2) Создаём баланс
    safeInsert("balances", {
        user: login,
        user_id: uid,
        balance: 0
    });
}

// ======================================================
// 2. ТВОЙ ПОЛНЫЙ ОВЕРЛЕЙ (БЕЗ ИЗМЕНЕНИЙ)
// ======================================================

console.log("OVERLAY.JS + SUPABASE FINAL HARD v3");

// ====== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ======

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

function setBar(selector, percent) {
    const el = document.querySelector(selector);
    if (!el) return;
    const clamped = Math.max(0, Math.min(100, percent || 0));
    el.style.width = clamped + "%";
}

// ======================================================
// 3. SUPABASE REST API (БЕЗ SDK)
// ======================================================

async function sbSelect(table, params = {}) {
    const url = new URL(`${SUPABASE_URL}/rest/v1/${table}`);
    for (const [k, v] of Object.entries(params)) {
        url.searchParams.set(k, v);
    }
    const res = await fetch(url, {
        headers: {
            "apikey": SUPABASE_KEY,
            "Authorization": `Bearer ${SUPABASE_KEY}`
        }
    });
    return res.json();
}

async function sbInsert(table, body) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
        method: "POST",
        headers: {
            "apikey": SUPABASE_KEY,
            "Authorization": `Bearer ${SUPABASE_KEY}`,
            "Content-Type": "application/json",
            "Prefer": "return=representation"
        },
        body: JSON.stringify(body)
    });
    return res.json();
}

// ======================================================
// 4. СПИСОК ПЕШЕК
// ======================================================

async function loadPawnList() {
    const data = await sbSelect("pawns", {
        select: "user",
        order: "user.asc"
    });

    renderPawnList(data || []);
}

function renderPawnList(list) {
    const container = document.querySelector("#pawn-list");
    if (!container) return;

    container.innerHTML = "";

    if (!list || list.length === 0) {
        container.innerHTML = "<i>Нет активных пешек</i>";
        return;
    }

    list.forEach(x => {
        const user = x.user;
        const btn = document.createElement("button");
        btn.textContent = user;
        btn.className = "rw-button";
        btn.onclick = () => selectPawn(user);
        container.appendChild(btn);
    });
}

// ======================================================
// 5. ВЫБОР ПЕШКИ
// ======================================================

let currentPawn = null;

async function selectPawn(user) {
    currentPawn = user;

    document.querySelector("#pawn-name").textContent = user;
    document.querySelector("#shop-balance").textContent = "—";

    await loadPawnInfo(user);
    await loadBalance(user);
}

// ======================================================
// 6. ЗАГРУЗКА ПЕШКИ
// ======================================================

async function loadPawnInfo(user) {
    const data = await sbSelect("pawns", {
        select: "*",
        user: `eq.${user}`
    });

    const pawn = data?.[0];

    if (!pawn) {
        document.querySelector("#pawn-name").textContent = "Пешка не найдена";
        clearTabs();
        return;
    }

    updatePawnInfo(pawn);
}

function clearTabs() {
    ["#tab-persona", "#tab-needs", "#tab-health"].forEach(id => {
        const el = document.querySelector(id);
        if (el) el.innerHTML = "";
    });
}

function updatePawnInfo(info) {
    info.persona = tryParse(info.persona, {}) || {};
    info.needs = tryParse(info.needs, {}) || {};
    info.healthParts = tryParse(info.healthParts, []) || [];
    info.skills = tryParse(info.skills, {}) || {};
    info.passions = tryParse(info.passions, {}) || {};
    info.disabledSkills = tryParse(info.disabledSkills, []) || [];
    info.capacities = tryParse(info.capacities, {}) || {};
    info.thoughts = tryParse(info.thoughts, []) || [];
    info.traits = tryParse(info.traits, []) || [];
    info.pain = info.pain ?? "";
    info.healthSummary = info.healthSummary ?? "0";

    document.querySelector("#pawn-name").textContent = info.user;

    if (info.portrait && info.portrait.length > 10) {
        const portrait = document.querySelector(".portrait-inner");
        if (portrait) {
            portrait.style.backgroundImage = `url(data:image/png;base64,${info.portrait})`;
            portrait.style.backgroundSize = "cover";
            portrait.style.backgroundPosition = "center";
        }
    }

    const health = normalizeHealthPercent(info.healthSummary);
    setBar("#pawn-health-fill", health);

    let mood = info.needs.Mood ?? info.needs.mood ?? 0;
    if (mood <= 1) mood *= 100;
    setBar("#pawn-mood-fill", mood);

    if (window.renderPersona) renderPersona(info);
    if (window.renderNeeds) renderNeeds(info);
    if (window.renderHealth) renderHealth(info);

    if (window.renderShopPersona) renderShopPersona(info);
    if (window.renderShopHealth) renderShopHealth(info);
    if (window.renderShopEvents) renderShopEvents(info);
}

// ======================================================
// 7. БАЛАНС
// ======================================================

async function loadBalance(user) {
    const data = await sbSelect("balances", {
        select: "balance,user",
        user: `eq.${user}`
    });

    const row = data?.[0];
    if (!row) {
        document.querySelector("#shop-balance").textContent = "—";
        return;
    }

    updateBalance(row);
}

function updateBalance(data) {
    if (!data || !currentPawn) return;
    if (data.user.toLowerCase() !== currentPawn.toLowerCase()) return;

    document.querySelector("#shop-balance").innerHTML =
        `<img src="img/catcoin.png" class="kat-icon"> ${data.balance}`;
}

// ======================================================
// 8. ИНИЦИАЛИЗАЦИЯ
// ======================================================

document.addEventListener("DOMContentLoaded", () => {
    document.querySelector("#refresh-list").onclick = loadPawnList;

    document.querySelectorAll('#tabs button').forEach(btn => {
        btn.onclick = () => {
            const tab = btn.dataset.tab;
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.querySelector('#tab-' + tab).classList.add('active');
        };
    });

    document.querySelector('#tab-persona').classList.add('active');

    document.querySelectorAll('#shop-tabs button').forEach(btn => {
        btn.onclick = () => {
            const tab = btn.dataset.shopTab;
            document.querySelectorAll('.shop-tab').forEach(t => t.classList.remove('active'));
            document.querySelector('#shop-tab-' + tab).classList.add('active');
        };
    });

    document.querySelector('#shop-tab-persona').classList.add('active');

    loadPawnList();
});

// ======================================================
// 9. ПОЛЛИНГ (вместо realtime)
// ======================================================

setInterval(() => {
    if (!currentPawn) return;
    loadPawnInfo(currentPawn);
    loadBalance(currentPawn);
}, 2000);
