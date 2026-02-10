// shop-persona.js — магазин "Персона"

import { createClient } from "https://esm.sh/@supabase/supabase-js";

const SUPABASE_URL = "https://fezlfobvavcxpwzovsoz.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_HjeSTZJOE2JEKBfuG1BxAQ_8oj30LvD";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const ACTION_ADD = "trait_add";
const ACTION_REMOVE = "trait_remove";
const ACTION_SKILL_UP = "skill";

// ============================
// КОПИРОВАНИЕ В БУФЕР
// ============================
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).catch(err => console.error("Clipboard error:", err));
}

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

    // Верхние товары (все, кроме trait_add, trait_remove, skill)
    const regularItems = (shopItems ?? []).filter(
        item => ![ACTION_ADD, ACTION_REMOVE, ACTION_SKILL_UP].includes(item.action)
    );

    const regularItemsHtml = regularItems
        .map(item => `
            <div class="shop-line">
                <span>${item.label}</span>
                <button class="rw-button trait-price-btn shop-copy-btn" data-copy="!${item.action}">
                    ${item.price} <img src="img/catcoin.png" class="kat-icon">
                </button>
            </div>
        `)
        .join("");

    // Нижние товары — берём напрямую из таблицы
    const itemAdd = shopItems?.find(x => x.action === ACTION_ADD);
    const itemRemove = shopItems?.find(x => x.action === ACTION_REMOVE);
    const itemSkill = shopItems?.find(x => x.action === ACTION_SKILL_UP);

    // ============================
    // 2. Загружаем список трейтов
    // ============================
    const { data: traits } = await supabase
        .from("traits")
        .select("label_ru, description_ru, enabled")
        .order("label_ru", { ascending: true });

    const enabledTraits = traits?.filter(t => t.enabled) ?? [];
    const pawnTraits = Array.isArray(info.traits) ? info.traits : [];

    const traitDescriptions = {};
    enabledTraits.forEach(t => {
        traitDescriptions[t.label_ru] = t.description_ru || "";
    });

    // ============================
    // СПИСОК НАВЫКОВ
    // ============================
    const skillList = [
        "Дальний бой",
        "Ближний бой",
        "Строительство",
        "Горное дело",
        "Кулинария",
        "Растениеводство",
        "Животноводство",
        "Ремесло",
        "Искусство",
        "Медицина",
        "Общение",
        "Умственный труд"
    ];

    // ============================
    // 3. Рендер магазина
    // ============================
    el.innerHTML = `
        <div style="font-size:14px;">

            <!-- ВЕРХНИЕ ТОВАРЫ -->
            ${regularItemsHtml}

            <hr>

            <!-- ПОВЫШЕНИЕ НАВЫКА -->
            ${itemSkill ? `
                <h3 style="margin-bottom:4px; font-size:14px;">${itemSkill.label}</h3>

                <div class="shop-line">
                    <input id="skill-up-input" class="rw-input trait-input" 
                           style="width:220px;" placeholder="Навык" readonly>

                    <button id="skill-up-dropdown" class="rw-button trait-drop">▼</button>

                    <button id="skill-up-btn" class="rw-button trait-price-btn">
                        ${itemSkill.price} <img src="img/catcoin.png" class="kat-icon">
                    </button>
                </div>

                <div id="skill-list-box" class="trait-list-box" style="display:none;"></div>

                <hr>
            ` : ""}

            <!-- ДОБАВИТЬ ЧЕРТУ -->
            ${itemAdd ? `
                <h3 style="margin-bottom:4px; font-size:14px;">Добавить черту</h3>

                <div class="shop-line">
                    <input id="trait-add-input" class="rw-input trait-input" placeholder="Трейт">
                    <button id="trait-add-dropdown" class="rw-button trait-drop">▼</button>

                    <button id="trait-add-btn" class="rw-button trait-price-btn">
                        ${itemAdd.price} <img src="img/catcoin.png" class="kat-icon">
                    </button>
                </div>

                <div id="trait-list-box" class="trait-list-box" style="display:none;"></div>

                <hr>
            ` : ""}

            <!-- УДАЛИТЬ ЧЕРТУ -->
            ${itemRemove ? `
                <h3 style="margin-bottom:4px; font-size:14px;">Удалить черту</h3>

                <div class="shop-line">
                    <input id="trait-remove-input" class="rw-input trait-input" placeholder="Трейт">
                    <button id="trait-remove-dropdown" class="rw-button trait-drop">▼</button>

                    <button id="trait-remove-btn" class="rw-button trait-price-btn">
                        ${itemRemove.price} <img src="img/catcoin.png" class="kat-icon">
                    </button>
                </div>

                <div id="pawn-trait-list-box" class="trait-list-box" style="display:none;"></div>
            ` : ""}

        </div>
    `;

    // ============================
    // 4. Tooltip — ВСЕГДА в body
    // ============================
    let tooltip = document.querySelector("#trait-tooltip");
    if (!tooltip) {
        tooltip = document.createElement("div");
        tooltip.id = "trait-tooltip";
        tooltip.className = "trait-tooltip";
        document.body.appendChild(tooltip);
    }

    function attachTooltipToList(selector) {
        document.querySelectorAll(`${selector} .trait-item-small`).forEach(el => {
            const name = el.textContent.trim();
            const desc = traitDescriptions[name];

            el.addEventListener("mouseenter", e => {
                if (!desc) return;

                tooltip.textContent = desc;
                tooltip.style.display = "block";

                const rect = e.target.getBoundingClientRect();
                tooltip.style.left = rect.right + 12 + "px";
                tooltip.style.top = rect.top + "px";
            });

            el.addEventListener("mouseleave", () => {
                tooltip.style.display = "none";
            });
        });
    }

    // ============================
    // 5. Автоподсказки (трейты)
    // ============================
    function filterTraits(inputSelector, listSelector, list) {
        const value = document.querySelector(inputSelector).value.trim().toLowerCase();
        const box = document.querySelector(listSelector);

        if (!value) {
            box.style.display = "none";
            return;
        }

        const filtered = list.filter(t =>
            t.toLowerCase().includes(value)
        );

        if (filtered.length === 0) {
            box.style.display = "none";
            return;
        }

        box.innerHTML = filtered
            .map(t => `<div class="trait-item-small">${t}</div>`)
            .join("");

        box.style.display = "block";

        attachTooltipToList(listSelector);

        box.querySelectorAll(".trait-item-small").forEach(el => {
            el.onclick = () => {
                document.querySelector(inputSelector).value = el.textContent.trim();
                box.style.display = "none";
            };
        });
    }

    if (itemAdd) {
        document.querySelector("#trait-add-input").oninput = () =>
            filterTraits("#trait-add-input", "#trait-list-box", enabledTraits.map(t => t.label_ru));
    }

    if (itemRemove) {
        document.querySelector("#trait-remove-input").oninput = () =>
            filterTraits("#trait-remove-input", "#pawn-trait-list-box", pawnTraits);
    }

    // ============================
    // 6. Кнопки ▼ (трейты + навыки)
    // ============================

    // ▼ навыки
    if (itemSkill) {
        document.querySelector("#skill-up-dropdown").onclick = () => {
            const box = document.querySelector("#skill-list-box");
            box.style.display = box.style.display === "block" ? "none" : "block";

            if (box.style.display === "block") {
                box.innerHTML = skillList
                    .map(s => `<div class="trait-item-small">${s}</div>`)
                    .join("");

                box.querySelectorAll(".trait-item-small").forEach(el => {
                    el.onclick = () => {
                        document.querySelector("#skill-up-input").value = el.textContent.trim();
                        box.style.display = "none";
                    };
                });
            }
        };
    }

    // ▼ добавить черту
    if (itemAdd) {
        document.querySelector("#trait-add-dropdown").onclick = () => {
            const box = document.querySelector("#trait-list-box");
            box.style.display = box.style.display === "block" ? "none" : "block";

            if (box.style.display === "block") {
                box.innerHTML = enabledTraits
                    .map(t => `<div class="trait-item-small">${t.label_ru}</div>`)
                    .join("");

                attachTooltipToList("#trait-list-box");

                box.querySelectorAll(".trait-item-small").forEach(el => {
                    el.onclick = () => {
                        document.querySelector("#trait-add-input").value = el.textContent.trim();
                        box.style.display = "none";
                    };
                });
            }
        };
    }

    // ▼ удалить черту
    if (itemRemove) {
        document.querySelector("#trait-remove-dropdown").onclick = () => {
            const box = document.querySelector("#pawn-trait-list-box");
            box.style.display = box.style.display === "block" ? "none" : "block";

            if (box.style.display === "block") {
                box.innerHTML = pawnTraits
                    .map(t => `<div class="trait-item-small">${t}</div>`)
                    .join("");

                attachTooltipToList("#pawn-trait-list-box");

                box.querySelectorAll(".trait-item-small").forEach(el => {
                    el.onclick = () => {
                        document.querySelector("#trait-remove-input").value = el.textContent.trim();
                        box.style.display = "none";
                    };
                });
            }
        };
    }

    // ============================
    // 7. Копирование команд
    // ============================

    // верхние товары
    document.querySelectorAll(".shop-copy-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const cmd = btn.dataset.copy;
            if (cmd) copyToClipboard(cmd);
        });
    });

    // добавление трейта
    if (itemAdd) {
        document.querySelector("#trait-add-btn").onclick = () => {
            const trait = document.querySelector("#trait-add-input").value.trim();
            if (!trait) return;
            copyToClipboard(`!trait add ${trait}`);
        };
    }

    // удаление трейта
    if (itemRemove) {
        document.querySelector("#trait-remove-btn").onclick = () => {
            const trait = document.querySelector("#trait-remove-input").value.trim();
            if (!trait) return;
            copyToClipboard(`!trait remove ${trait}`);
        };
    }

    // повышение навыка
    if (itemSkill) {
        document.querySelector("#skill-up-btn").onclick = () => {
            const skill = document.querySelector("#skill-up-input").value.trim();
            if (!skill) return;
            copyToClipboard(`!skill ${skill}`);
        };
    }
}
