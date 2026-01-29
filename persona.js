// persona.js — RimWorld‑корректная версия

// Русские названия навыков
const skillNamesRu = {
    Shooting: "Дальний бой",
    Melee: "Ближний бой",
    Construction: "Строительство",
    Mining: "Горное дело",
    Cooking: "Кулинария",
    Plants: "Растениеводство",
    Animals: "Животноводство",
    Crafting: "Ремесло",
    Artistic: "Искусство",
    Medicine: "Медицина",
    Social: "Общение",
    Intellectual: "Умственный труд"
};

// RimWorld порядок навыков
const orderedSkills = [
    "Shooting",
    "Melee",
    "Construction",
    "Mining",
    "Cooking",
    "Plants",
    "Animals",
    "Crafting",
    "Artistic",
    "Medicine",
    "Social",
    "Intellectual"
];

// WorkType → Skills (как в RimWorld)
const workTypeToSkills = {
    "насилие": ["Shooting", "Melee"],
    "врач": ["Medicine"],
    "уход": ["Medicine"],
    "надзор": ["Social"],
    "квалифицированная работа": [
        "Construction", "Mining", "Cooking", "Plants", "Crafting"
    ]
};

// Определяем заблокированные навыки
function getBlockedSkills(disabledList) {
    const lower = disabledList.map(d => d.toLowerCase());
    const blocked = new Set();

    for (const [key, skills] of Object.entries(workTypeToSkills)) {
        if (lower.some(d => d.includes(key))) {
            skills.forEach(s => blocked.add(s));
        }
    }
    return blocked;
}

export function renderPersona(info) {
    const container = document.querySelector("#tab-persona");
    if (!container) return;

    if (!info) {
        container.innerHTML = "Пешка не найдена";
        return;
    }

    const p = info.persona || {};
    const skills = info.skills || {};
    const passions = info.passions || {};
    const traits = Array.isArray(info.traits) ? info.traits : [];

    // Чистим disabled
    const disabledClean = Array.isArray(p.disabled)
        ? p.disabled.filter(x => typeof x === "string" && x.trim() !== "")
        : [];

    // Определяем заблокированные навыки
    const blockedSkills = getBlockedSkills(disabledClean);

    // Левая колонка
    const leftHtml = [];

    if (p.gender) leftHtml.push(`<div><b>Пол:</b> ${p.gender}</div>`);
    if (p.age) leftHtml.push(`<div><b>Возраст:</b> ${p.age}</div>`);
    if (p.xenotype) leftHtml.push(`<div><b>Ксенотип:</b> ${p.xenotype}</div>`);

    if (traits.length) {
        leftHtml.push(`<h3>Черты:</h3>`);
        leftHtml.push(traits.map(t => `<div>[${t}]</div>`).join(""));
    }

    if (disabledClean.length) {
        leftHtml.push(`<h3>Недоступные работы:</h3>`);
        leftHtml.push(disabledClean.map(d => `<div>[${d}]</div>`).join(""));
    }

    // Правая колонка — навыки
    const skillsHtml = orderedSkills
        .map(name => {
            const lvl = skills[name];
            if (typeof lvl !== "number") return "";

            const blocked = blockedSkills.has(name);
            const displayValue = blocked ? "—" : lvl;

            const passion =
                blocked
                    ? ""
                    : passions[name] === 1 ? "🔥"
                    : passions[name] === 2 ? "🔥🔥"
                    : "";

            return `
                <div style="
                    display: grid;
                    grid-template-columns: 1fr auto auto;
                    gap: 6px;
                    margin-bottom: 3px;
                ">
                    <div>${skillNamesRu[name] || name}</div>
                    <div style="text-align:right;">${passion}</div>
                    <div style="text-align:right;">${displayValue}</div>
                </div>
            `;
        })
        .join("");

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
