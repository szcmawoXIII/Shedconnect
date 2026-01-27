// overlay.js — финальная версия, связанная с модом через WebSocket
// БЕЗ хранения валюты, БЕЗ начисления, только отображение баланса,
// который приходит от Twitch‑бота через мод.

console.log("OVERLAY.JS FINAL v1");

// Вкладки
import { renderPersona } from "./persona.js";
import { renderNeeds } from "./needs.js";
import { renderHealth } from "./health.js";

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
// WEBSOCKET К МОДУ
// ===============================

// Локально: ws://localhost:17172
// На стриме: ws://IP_СТРИМЕРА:17172
const socket = new WebSocket("ws://localhost:3001");

socket.onopen = () => {
    console.log("[OVERLAY] WebSocket открыт");
    requestPawnList();
};

socket.onmessage = (event) => {
    let data;
    try {
        data = JSON.parse(event.data);
    } catch {
        return;
    }

    switch (data.type) {
        case "all_pawns":
            renderPawnList(data.pawns);
            break;

        case "pawn_info":
            updatePawnInfo(data.info);
            break;

        case "balance_update":
            updateBalance(data);
            break;
    }
};

socket.onerror = (e) => {
    console.error("[OVERLAY] WebSocket error", e);
};

socket.onclose = () => {
    console.warn("[OVERLAY] WebSocket закрыт");
};

// ===============================
// СПИСОК ПЕШЕК
// ===============================

function requestPawnList() {
    if (socket.readyState !== WebSocket.OPEN) return;

    socket.send(JSON.stringify({
        type: "all_pawns"
    }));
}

document.querySelector("#refresh-list").onclick = requestPawnList;

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

function selectPawn(user) {
    currentPawn = user;

    document.querySelector("#pawn-name").textContent = user;
    document.querySelector("#pawn-balance").textContent = "—";

    if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
            type: "pawn_info",
            user
        }));

        // <<< ДОБАВЛЕНО >>>
        socket.send(JSON.stringify({
            type: "balance_request",
            user
        }));
    }
}

// ===============================
// ОБНОВЛЕНИЕ ПЕШКИ
// ===============================

function updatePawnInfo(info) {
    if (!info || !info.found) {
        document.querySelector("#pawn-name").textContent = "Пешка не найдена";
        document.querySelector("#pawn-balance").textContent = "—";
        return;
    }

    document.querySelector("#pawn-name").textContent = info.user;

    // Портрет
    if (info.portrait) {
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
// ОБНОВЛЕНИЕ БАЛАНСА (от Twitch‑бота)
// ===============================

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
// АВТО-ОБНОВЛЕНИЕ ПЕШКИ
// ===============================

setInterval(() => {
    if (!currentPawn) return;
    if (socket.readyState !== WebSocket.OPEN) return;

    socket.send(JSON.stringify({
        type: "pawn_info",
        user: currentPawn
    }));
}, 2000);



