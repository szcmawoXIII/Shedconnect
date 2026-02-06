// shop-persona.js — динамический магазин "Персона"

import { createClient } from "https://esm.sh/@supabase/supabase-js";

const SUPABASE_URL = "https://fezlfobvavcxpwzovsoz.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_HjeSTZJOE2JEKBfuG1BxAQ_8oj30LvD";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function renderShopPersona(info) {
    const el = document.querySelector("#shop-tab-persona");
    if (!el) return;

    // Загружаем товары из таблицы shop_persona
    const { data, error } = await supabase
        .from("shop_persona")
        .select("*")
        .eq("enabled", true)
        .order("id", { ascending: true });

    if (error) {
        console.error("Ошибка загрузки товаров магазина:", error);
        el.innerHTML = `<div style="color:#f66;">Ошибка загрузки магазина</div>`;
        return;
    }

    if (!data || data.length === 0) {
        el.innerHTML = `<div>Товары магазина отключены.</div>`;
        return;
    }

    // Генерируем HTML для каждого товара
    const html = data
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

    el.innerHTML = `<div style="font-size:15px;">${html}</div>`;
}
