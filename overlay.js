// overlay.js
// Главный контроллер интерфейса
console.log("OVERLAY.JS REAL FILE LOADED v3");

import { renderPersona } from "./persona.js";
import { renderNeeds } from "./needs.js";
import { renderHealth } from "./health.js";

let currentPawn = null;

// ===============================
// ЭКОНОМИКА (localStorage)
// ===============================

function loadBalance(user) {
    if (!user) return 0;
    const raw = localStorage.getItem("balances");
    if (!raw) return 0;

    try {
        const data = JSON.parse(raw);
        return data[user] ?? 0;
    } catch {
        return 0;
    }
}

function saveBalance(user, amount) {
    if (!user) return;
    const raw = localStorage.getItem("balances");
    const data = raw ? JSON.parse(raw) : {};

    data[user] = amount;
    localStorage.setItem("balances", JSON.stringify(data));
}

function addBalance(user, amount) {
    const current = loadBalance(user);
    const updated = current + amount;
    saveBalance(user, updated);
    return updated;
}

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
// WEBSOCKET
// ===============================

const socket = new WebSocket("ws://localhost:3001");

socket.onopen = () => loadPawnList();

socket.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.event === "pawn_info") {
        updatePawnInfo(data.info);
    }

    if (data.event === "all_pawns") {
        renderPawnList(data.pawns);
    }
};

// ===============================
// КНОПКИ ДЕЙСТВИЙ (исправлено под HTML)
// ===============================

function updateActionButton(exists, user) {
    const spawnBtn = document.querySelector("#spawn-pawn-btn");
    const deleteBtn = document.querySelector("#delete-pawn-btn");

    if (!spawnBtn || !deleteBtn) return;

    if (!exists) {
        spawnBtn.style.display = "inline-block";
        deleteBtn.style.display = "none";

        spawnBtn.onclick = () => {
            socket.send(JSON.stringify({
                command: "spawn",
                user
            }));
        };
    } else {
        spawnBtn.style.display = "none";
        deleteBtn.style.display = "inline-block";

        deleteBtn.onclick = () => {
            socket.send(JSON.stringify({
                command: "execute",
                user
            }));
        };
    }
}

// ===============================
// СПИСОК ПЕШЕК
// ===============================

function loadPawnList() {
    socket.send(JSON.stringify({ command: "all_pawns" }));
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

function selectPawn(user) {
    currentPawn = user;

    const bal = loadBalance(user);
    document.querySelector("#pawn-balance").innerHTML =
        `<img src="img/catcoin.png" class="kat-icon">Каты: ${bal}`;

    updateActionButton(false, user);

    socket.send(JSON.stringify({
        command: "pawn_info",
        user
    }));
}

// ===============================
// ОБНОВЛЕНИЕ ПЕШКИ
// ===============================

function updatePawnInfo(info) {
    if (!info || !info.found) {
        document.querySelector("#pawn-name").textContent = "Пешка не найдена";
        document.querySelector("#pawn-balance").textContent = "—";

        updateActionButton(false, currentPawn);
        return;
    }

    document.querySelector("#pawn-name").textContent = info.user;

    const balance = loadBalance(info.user);
    document.querySelector("#pawn-balance").innerHTML =
        `<img src="img/catcoin.png" class="kat-icon">Каты: ${balance}`;

    // Портрет пешки
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

    updateActionButton(!!info.exists, info.user);
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
        command: "pawn_info",
        user: currentPawn
    }));
}, 2000);

// ===============================
// АВТО-НАЧИСЛЕНИЕ 100 КАТОВ В МИНУТУ
// ===============================

setInterval(() => {
    if (!currentPawn) return;

    const newBalance = addBalance(currentPawn, 100);
    document.querySelector("#pawn-balance").innerHTML =
        `<img src="img/catcoin.png" class="kat-icon">Каты: ${newBalance}`;

}, 60 * 1000); // 1 минута
