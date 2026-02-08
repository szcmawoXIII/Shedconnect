// shop-persona.js — магазин "Персона"

import { createClient } from "https://esm.sh/@supabase/supabase-js";

const SUPABASE_URL = "https://fezlfobvavcxpwzovsoz.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_HjeSTZJOE2JEKBfuG1BxAQ_8oj30LvD";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Какие action соответствуют новым товарам
const NEW_ACTIONS = {
    add: "trait_add",
    remove: "trait_remove"
};

export async function renderShopPersona(info) {
    const el = document.querySelector("#shop-tab-persona");
    if (!el) return;

    if (!info) {
        el.innerHTML = `<div>Пешка не выбрана</div>`;
        return;
    }

    // ============================
    // 1. Загружаем старые товары
    // ============================
    const { data: shopItems, error: shopError } = await supabase
        .from("shop_persona")
        .select("*")
        .eq("enabled", true)
        .order("id", { ascending: true });

    let shopHtml = "";

    if (shopError) {
        shopHtml = `<div style="color:#f66;">Ошибка загрузки магазина</div>`;
    } else if (!shopItems || shopItems.length === 0) {
        shopHtml = `<div>Товары магазина отключены.</div>`;
    } else {
        shopHtml = shopItems
            .filter(item => !["trait_add", "trait_remove"].includes(item.action))
            .map(item => {
                return `
                    <div class="shop-line">
                        <span>${item.label}</span>
                        <button class="rw-button" data-action="${item.action}">
                            ${item.price} <img src="img/catcoin.png" class="kat-icon">
                        </button>
                    </div>
                `;
            })
            .join("");
    }

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
    // 3. Загружаем цены новых товаров
    // ============================
    const priceAdd = shopItems?.find(x => x.action === NEW_ACTIONS.add)?.price ?? 0;
    const priceRemove = shopItems?.find(x => x.action === NEW_ACTIONS.remove)?.price ?? 0;

    // ============================
    // 4. Рендер магазина
    // ============================
    el.innerHTML = `
        <div style="font-size:15px;">
            ${shopHtml}

            <hr>

            <h3 style="margin-bottom:6px;">Добавить черту</h3>

            <div class="shop-line" style="font-size:13px;">
                <input id="trait-add-input" class="rw-input" placeholder="Введите название трейта">
                <button id="trait-add-btn" class="rw-button">
                    ${priceAdd} <img src="img/catcoin.png" class="kat-icon">
                </button>
            </div>

            <button id="toggle-trait-list" class="rw-button" style="margin-top:5px; font-size:12px;">
                Показать список трейтов
            </button>

            <div id="trait-list-box" style="display:none; margin-top:5px; font-size:12px;">
                ${traitListHtml}
            </div>

            <hr>

            <h3 style="margin-bottom:6px;">Удалить черту</h3>

            <div class="shop-line" style="font-size:13px;">
                <input id="trait-remove-input" class="rw-input" placeholder="Введите название трейта">
                <button id="trait-remove-btn" class="rw-button">
                    ${priceRemove} <img src="img/catcoin.png" class="kat-icon">
                </button>
            </div>

            <button id="toggle-pawn-trait-list" class="rw-button" style="margin-top:5px; font-size:12px;">
                Показать черты пешки
            </button>

            <div id="pawn-trait-list-box" style="display:none; margin-top:5px; font-size:12px;">
                ${pawnTraitListHtml}
            </div>
        </div>
    `;

    // ============================
    // 5. Обработчики кнопок
    // ============================

    document.querySelector("#trait-add-btn").onclick = async () => {
        const trait = document.querySelector("#trait-add-input").value.trim();
        if (!trait) return;
        await sendCommand(info.user_id, info.user, NEW_ACTIONS.add, trait);
    };

    document.querySelector("#trait-remove-btn").onclick = async () => {
        const trait = document.querySelector("#trait-remove-input").value.trim();
        if (!trait) return;
        await sendCommand(info.user_id, info.user, NEW_ACTIONS.remove, trait);
    };

    document.querySelector("#toggle-trait-list").onclick = () => {
        const box = document.querySelector("#trait-list-box");
        const btn = document.querySelector("#toggle-trait-list");
        const visible = box.style.display === "block";
        box.style.display = visible ? "none" : "block";
        btn.textContent = visible ? "Показать список трейтов" : "Скрыть список трейтов";
    };

    document.querySelector("#toggle-pawn-trait-list").onclick = () => {
        const box = document.querySelector("#pawn-trait-list-box");
        const btn = document.querySelector("#toggle-pawn-trait-list");
        const visible = box.style.display === "block";
        box.style.display = visible ? "none" : "block";
        btn.textContent = visible ? "Показать черты пешки" : "Скрыть черты пешки";
    };
}

// ============================
// ОТПРАВКА КОМАНДЫ В ИГРУ
// ============================

async function sendCommand(user_id, username, command, trait) {
    await supabase.from("commands").insert({
        user_id,
        viewer: username,
        command,
        args: { trait }
    });

    alert("Команда отправлена!");
}
