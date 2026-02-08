// needs.js — вкладка "Нужды" с RimWorld‑стильными прогресс-барами

const needNamesRu = {
    Food: "Сытость",
    Rest: "Сон",
    Recreation: "Удовлетворённость",
    Beauty: "Окружение",
    Comfort: "Комфорт",
    Outdoors: "Свежий воздух",
    Mood: "Настроение"
};

export function renderNeeds(info) {
    const container = document.querySelector("#tab-needs");
    if (!container) return;

    if (!info) {
        container.innerHTML = "Пешка не найдена";
        return;
    }

    const rawNeeds = info.needs || {};
    const thoughts = info.thoughts || [];

    // -------------------------------
    // НОРМАЛИЗАЦИЯ НУЖД
    // -------------------------------
    const needs = {};

    for (let [key, val] of Object.entries(rawNeeds)) {
        let cleanKey = key
            .replace("Need_", "")
            .replace(/Need$/i, "")
            .replace(/_/g, "")
            .toLowerCase();

        cleanKey = cleanKey.charAt(0).toUpperCase() + cleanKey.slice(1);

        if (typeof val === "string") {
            val = val.replace("%", "").replace(",", ".");
        }
        val = parseFloat(val);
        if (isNaN(val)) continue;

        if (val <= 1) val = val * 100;

        needs[cleanKey] = Math.max(0, Math.min(100, val));
    }

    // -------------------------------
    // ЛЕВАЯ КОЛОНКА — RIMWORLD БАРЫ
    // -------------------------------
    const needsLeft = Object.entries(needs)
        .filter(([name]) => needNamesRu[name])
        .map(([name, percent]) => {
            const ru = needNamesRu[name];

            return `
                <div style="margin-bottom: 12px;">
                    <div style="font-size: 15px; margin-bottom: 2px;">
                        ${ru} — ${Math.round(percent)}%
                    </div>

                    <div class="rw-bar">
                        <div class="rw-bar-fill" style="width:${percent}%;"></div>
                        <span class="rw-bar-label">${Math.round(percent)}%</span>
                    </div>
                </div>
            `;
        })
        .join("");

    // -------------------------------
    // ПРАВАЯ КОЛОНКА — МЫСЛИ
    // -------------------------------
    const grouped = {};

    for (const t of thoughts) {
        if (!t || !t.label) continue;
        const key = t.label.trim().toLowerCase();
        if (!grouped[key]) grouped[key] = { label: t.label, total: 0, count: 0 };
        grouped[key].total += t.moodOffset ?? 0;
        grouped[key].count++;
    }

    const merged = Object.values(grouped)
        .filter(t => Math.abs(t.total) > 0.01)
        .sort((a, b) => b.total - a.total);

    const thoughtsRight = merged
        .map(t => {
            const color =
                t.total > 0 ? "#6aff6a" :
                t.total < 0 ? "#ff6a6a" :
                "#cccccc";

            const count = t.count > 1 ? ` x${t.count}` : "";

            return `
                <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                    <span>${t.label}${count}</span>
                    <span style="color:${color}; font-weight:bold;">
                        ${t.total > 0 ? "+" : ""}${t.total}
                    </span>
                </div>
            `;
        })
        .join("");

    // -------------------------------
    // ВЫВОД
    // -------------------------------
    container.innerHTML = `
        <div class="center-columns">
            <div class="col-left" style="font-size:15px;">
                ${needsLeft}
            </div>

            <div class="col-right" style="font-size:15px;">
                ${thoughtsRight}
            </div>
        </div>
    `;
}
