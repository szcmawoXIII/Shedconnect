// shop-persona.js — магазин "Персона"

import { createClient } from "https://esm.sh/@supabase/supabase-js";

const SUPABASE_URL = "https://fezlfobvavcxpwzovsoz.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_HjeSTZJOE2JEKBfuG1BxAQ_8oj30LvD";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Новые товары
const ACTION_ADD = "trait_add";
const ACTION_REMOVE = "trait_remove";

export async function renderShopPersona(info) {
    const el = document.querySelector("#shop-tab-persona");
    if (!el) return;

    if (!info) {
        el.innerHTML = `<div>Пешка не выбрана</div>`;
        return;
    }

    // ============================
    // 1. Загружаем товары магазина
    // ============================
    const { data: shopItems } = await supabase
        .from("shop_persona")
        .select("*")
        .eq("enabled", true)
        .order("id", { ascending: true });

    const priceAdd = shopItems?.find(x => x.action === ACTION_ADD)?.price ?? 0;
    const priceRemove = shopItems?.find(x => x.action === ACTION_REMOVE)?.price ?? 0;

    const oldItemsHtml = shopItems
        .filter(item => ![ACTION_ADD, ACTION_REMOVE].includes(item.action))
        .map(item => `
            <div class="shop-line">
                <span>${item.label}</span>
                <button class="rw-button" data-action="${item.action}">
                    ${item.price} <img src="img/catcoin.png" class="kat-icon">
                </button>
            </div>
        `)
        .join("");

    // ============================
    // 2. Загружаем список трейтов
    // ============================
    const { data: traits } = await supabase
        .from("traits")
        .select("label_ru, enabled")
        .order("label_ru", { ascending: true });

    const enabledTraits = traits?.filter(t => t.enabled) ?? [];
    const pawnTraits = Array.isArray(info.traits) ? info.traits : [];

    const traitListHtml = enabledTraits
        .map(t => `<div class="trait-item-small">${t.label_ru}</div>`)
        .join("");

    const pawnTraitListHtml = pawnTraits
        .map(t => `<div class="trait-item-small">${t}</div>`)
        .join("");

    // ============================
    // 3. Рендер магазина
    // ============================
    el.innerHTML = `
        <div style="font-size:14px;">
            ${oldItemsHtml}

            <hr>

            <h3 style="margin-bottom:4px; font-size:14px;">Добавить черту</h3>

            <div class="shop-line" style="gap:6px;">
                <input id="trait-add-input" class="rw-input trait-input" placeholder="Трейт">
                <button id="trait-add-dropdown" class="rw-button trait-drop">▼</button>
                <span class="trait-price">${priceAdd}</span>
                <img src="img/catcoin.png" class="kat-icon">
                <button id="trait-add-btn" class="rw-button">OK</button>
            </div>

            <div id="trait-list-box" class="trait-list-box" style="display:none;">
                ${traitListHtml}
            </div>

            <hr>

            <h3 style="margin-bottom:4px; font-size:14px;">Удалить черту</h3>

            <div class="shop-line" style="gap:6px;">
                <input id="trait-remove-input" class="rw-input trait-input" placeholder="Трейт">
                <button id="trait-remove-dropdown" class="rw-button trait-drop">▼</button>
                <span class="trait-price">${priceRemove}</span>
                <img src="img/catcoin.png" class="kat-icon">
                <button id="trait-remove-btn" class="rw-button">OK</button>
            </div>

            <div id="pawn-trait-list-box" class="trait-list-box" style="display:none;">
                ${pawnTraitListHtml}
            </div>
        </div>
    `;

    // ============================
    // 4. Обработчики
    // ============================

    // Показ списка трейтов
    document.querySelector("#trait-add-dropdown").onclick = () => {
        toggleBox("#trait-list-box");
    };

    document.querySelector("#trait-remove-dropdown").onclick = () => {
        toggleBox("#pawn-trait-list-box");
    };

    // Клик по трейту → автозаполнение
    document.querySelectorAll("#trait-list-box .trait-item-small").forEach(elm => {
        elm.onclick = () => {
            document.querySelector("#trait-add-input").value = elm.textContent.trim();
        };
    });

    document.querySelectorAll("#pawn-trait-list-box .trait-item-small").forEach(elm => {
        elm.onclick = () => {
            document.querySelector("#trait-remove-input").value = elm.textContent.trim();
        };
    });

    // Отправка команд
    document.querySelector("#trait-add-btn").onclick = async () => {
        const trait = document.querySelector("#trait-add-input").value.trim();
        if (!trait) return;
        await sendCommand(info.user_id, info.user, ACTION_ADD, trait);
    };

    document.querySelector("#trait-remove-btn").onclick = async () => {
        const trait = document.querySelector("#trait-remove-input").value.trim();
        if (!trait) return;
        await sendCommand(info.user_id, info.user, ACTION_REMOVE, trait);
    };
}

// ============================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ============================

function toggleBox(selector) {
    const box = document.querySelector(selector);
    box.style.display = box.style.display === "block" ? "none" : "block";
}

async function sendCommand(user_id, username, command, trait) {
    await supabase.from("commands").insert({
        user_id,
        viewer: username,
        command,
        args: { trait }
    });

    alert("Команда отправлена!");
}
