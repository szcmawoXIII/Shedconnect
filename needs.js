// needs.js — вкладка "Нужды"

const needNamesRu = {
    Food: "Сытость",
    Rest: "Сон",
    Recreation: "Удовлетворённость",
    Beauty: "Окружение",
    Comfort: "Комфорт",
    Outdoors: "Свежий воздух"
};

export function renderNeeds(info) {
    const container = document.querySelector("#tab-needs");
    if (!container) return;

    if (!info) {
        container.innerHTML = "Пешка не найдена";
        return;
    }

    const needs = info.needs || {};
    const thoughts = info.thoughts || [];

    // 🔧 Нормализация ключей нужд
    const normalizedNeeds = {};
    for (const [key, val] of Object.entries(needs)) {
        const clean = key
            .replace("Need_", "")
            .replace(/^\w/, c => c.toUpperCase());
        normalizedNeeds[clean] = val;
    }

    const needsLeft = Object.entries(normalizedNeeds)
        .filter(([name]) => needNamesRu[name])
        .map(([name, val]) => {
            const ru = needNamesRu[name];
            const percent = Math.round((val <= 1 ? val * 100 : val));

            return `
                <div style="margin-bottom: 10px;">
                    <div style="font-size: 15px; display:flex; justify-content:space-between;">
                        <span>${ru}</span>
                        <span>${percent}%</span>
                    </div>

                    <div class="need-bar">
                        <div class="need-bar-fill" style="width:${percent}%;"></div>
                    </div>
                </div>
            `;
        })
        .join("");

    // ------------------ мысли ------------------

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
