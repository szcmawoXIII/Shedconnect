// persona.js — вкладка "Персона" (RimWorld‑логика)

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

export function renderPersona(info) {
    const container = document.querySelector("#tab-persona");
    if (!container) return;

    if (!info) {
        container.innerHTML = "Пешка не найдена";
        return;
    }

    // Жёсткая нормализация
    const p = info.persona && typeof info.persona === "object" ? info.persona : {};
    const skills = info.skills && typeof info.skills === "object" ? info.skills : {};
    const passions = info.passions && typeof info.passions === "object" ? info.passions : {};
    const traits = Array.isArray(info.traits)
        ? info.traits.filter(t => typeof t === "string")
        : [];

    // disabled — список недоступных работ (WorkType), как в RimWorld
    const rawDisabled = Array.isArray(p.disabled) ? p.disabled : [];
    const disabledClean = rawDisabled
        .filter(d => typeof d === "string")
        .map(d => d.trim())
        .filter(d => d !== "");

    // disabledSkills — точный список заблокированных навыков из мода
    const blockedSkills = new Set(
        Array.isArray(info.disabledSkills)
            ? info.disabledSkills.filter(s => typeof s === "string")
            : []
    );

    // Левая колонка
    const leftHtml = [];

    if (typeof p.gender === "string") {
        leftHtml.push(`<div><b>Пол:</b> ${p.gender}</div>`);
    }
    if (typeof p.age === "number") {
        leftHtml.push(`<div><b>Возраст:</b> ${p.age}</div>`);
    }
    if (typeof p.xenotype === "string") {
        leftHtml.push(`<div><b>Ксенотип:</b> ${p.xenotype}</div>`);
    }

    if (traits.length) {
        leftHtml.push(`<h3>Черты:</h3>`);
        leftHtml.push(traits.map(t => `<div>[${t}]</div>`).join(""));
    }

    if (disabledClean.length) {
        leftHtml.push(`<h3>Недоступные работы:</h3>`);
        leftHtml.push(disabledClean.map(d => `<div>[${d}]</div>`).join(""));
    }

    // Правая колонка — навыки в RimWorld‑порядке
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
