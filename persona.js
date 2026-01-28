// persona.js
// Вкладка "Персона" — без портрета

const skillOrder = [
    "Melee",
    "Mining",
    "Plants",
    "Social",
    "Animals",
    "Cooking",
    "Artistic",
    "Crafting",
    "Medicine",
    "Shooting",
    "Construction",
    "Intellectual"
];

const skillNamesRu = {
    Shooting: "Дальний бой",
    Melee: "Ближний бой",
    Construction: "Строительство",
    Mining: "Горное дело",
    Cooking: "Кулинария",
    Plants: "Растениеводство",
    Animals: "Животноводство",
    Crafting: "Ремесло",
    Artistic: "Творчество",
    Medicine: "Медицина",
    Social: "Общение",
    Intellectual: "Умственный труд"
};

// соответствие навыков → работ RimWorld
const skillToWorkType = {
    Shooting: "Охота",
    Melee: "Охота",
    Construction: "Строитель",
    Mining: "Шахтёр",
    Cooking: "Повар",
    Plants: "Садовод",
    Animals: "Животновод",
    Crafting: "Ремесло",
    Artistic: "Кузнец",
    Medicine: "Доктор",
    Social: "Социальная работа",
    Intellectual: "Исследования"
};

export function renderPersona(info) {
    const container = document.querySelector("#tab-persona");
    if (!container) return;

    if (!info || !info.found) {
        container.innerHTML = "Пешка не найдена";
        return;
    }

    const p = info.persona || {};
    const skills = info.skills || {};
    const passions = info.passions || {};
    const disabledWorks = p.disabled || [];

    // Левая колонка
    const leftHtml = [];

    if (p.gender) leftHtml.push(`<div><b>Пол:</b> ${p.gender}</div>`);
    if (p.age) leftHtml.push(`<div><b>Возраст:</b> ${p.age}</div>`);
    if (p.xenotype) leftHtml.push(`<div><b>Ксенотип:</b> ${p.xenotype}</div>`);

    if (info.traits?.length) {
        leftHtml.push(`<h3>Черты:</h3>`);
        leftHtml.push(info.traits.map(t => `<div>[${t}]</div>`).join(""));
    }

    if (disabledWorks.length) {
        const clean = disabledWorks.filter(d => d.trim() !== "");
        if (clean.length) {
            leftHtml.push(`<h3>Недоступные работы:</h3>`);
            leftHtml.push(clean.map(d => `<div>[${d}]</div>`).join(""));
        }
    }

    // Правая колонка — навыки в правильном порядке
    const skillsHtml = skillOrder.map(name => {
        const workType = skillToWorkType[name];
        const isBlocked = disabledWorks.some(d => d.toLowerCase().includes(workType.toLowerCase()));

        const lvl = skills[name];
        const passion = passions[name];

        const displayValue = isBlocked ? "—" : lvl;

        const passionIcon =
            isBlocked
                ? ""
                : passion === 1 ? "🔥"
                : passion === 2 ? "🔥🔥"
                : "";

        return `
            <div style="
                display: grid;
                grid-template-columns: 1fr auto auto;
                gap: 6px;
                margin-bottom: 3px;
            ">
                <div>${skillNamesRu[name] || name}</div>
                <div style="text-align:right;">${passionIcon}</div>
                <div style="text-align:right;">${displayValue}</div>
            </div>
        `;
    }).join("");

    container.innerHTML = `
        <div style="display: flex; gap: 25px;">
            <div style="flex: 1; font-size: 15px;">
                ${leftHtml.join("")}
            </div>

            <div style="flex: 1; font-size: 14px;">
                ${skillsHtml}
            </div>
        </div>
    `;
}
