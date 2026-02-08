// shop-persona.js — магазин "Персона"

import { createClient } from "https://esm.sh/@supabase/supabase-js";

const SUPABASE_URL = "https://fezlfobvavcxpwzovsoz.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_HjeSTZJOE2JEKBfuG1BxAQ_8oj30LvD";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Цена операций
const TRAIT_PRICE = 1000;

export async function renderShopPersona(info) {
    const el = document.querySelector("#shop-tab-persona");
    if (!el) return;

    if (!info) {
        el.innerHTML = `<div>Пешка не выбрана</div>`;
        return;
    }

    // Загружаем список трейтов из базы
    const { data: traits, error } = await supabase
        .from("traits")
        .select("label_ru, enabled")
        .order("label_ru", { ascending: true });

    if (error) {
        el.innerHTML = `<div style="color:#f66;">Ошибка загрузки трейтов</div>`;
        return;
    }

    const enabledTraits = traits.filter(t => t.enabled);

    // Текущие трейт пешки
    const pawnTraits = Array.isArray(info.traits) ? info.traits : [];

    // HTML списка доступных трейтов
    const traitListHtml = enabledTraits
        .map(t => `<div class="trait-item">${t.label_ru}</div>`)
        .join("");

    // HTML списка трейтов пешки
    const pawnTraitListHtml = pawnTraits
        .map(t => `<div class="trait-item">${t}</div>`)
        .join("");

    el.innerHTML = `
        <div style="font-size:15px;">

            <h3>Добавить черту</h3>

            <div class="shop-line">
                <input id="trait-add-input" class="rw-input" placeholder="Введите название трейта">
                <button id="trait-add-btn" class="rw-button">
                    ${TRAIT_PRICE} <img src="img/catcoin.png" class="kat-icon">
                </button>
            </div>

            <div class="trait-list-box">
                ${traitListHtml}
            </div>

            <hr>

            <h3>Удалить черту</h3>

            <div class="shop-line">
                <input id="trait-remove-input" class="rw-input" placeholder="Введите название трейта">
                <button id="trait-remove-btn" class="rw-button">
                    ${TRAIT_PRICE} <img src="img/catcoin.png" class="kat-icon">
                </button>
            </div>

            <div class="trait-list-box">
                ${pawnTraitListHtml}
            </div>

        </div>
    `;

    // ============================
    // ОБРАБОТЧИКИ КНОПОК
    // ============================

    document.querySelector("#trait-add-btn").onclick = async () => {
        const trait = document.querySelector("#trait-add-input").value.trim();
        if (!trait) return;

        await buyTrait(info.user_id, info.user, "trait_add", trait);
    };

    document.querySelector("#trait-remove-btn").onclick = async () => {
        const trait = document.querySelector("#trait-remove-input").value.trim();
        if (!trait) return;

        await buyTrait(info.user_id, info.user, "trait_remove", trait);
    };
}

// ============================
// ПОКУПКА ТРЕЙТА
// ============================

async function buyTrait(user_id, username, command, trait) {
    // 1. Проверяем баланс
    const { data: balRow } = await supabase
        .from("balances")
        .select("balance")
        .eq("user_id", user_id)
        .single();

    if (!balRow || balRow.balance < TRAIT_PRICE) {
        alert("Недостаточно катов!");
        return;
    }

    // 2. Списываем деньги
    await supabase
        .from("balances")
        .update({ balance: balRow.balance - TRAIT_PRICE })
        .eq("user_id", user_id);

    // 3. Отправляем команду в игру
    await supabase.from("commands").insert({
        user_id,
        viewer: username,
        command,
        args: { trait }
    });

    alert("Команда отправлена!");
}
