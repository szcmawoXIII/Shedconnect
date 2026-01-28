// persona.js — вкладка "Персона"

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

// соответствие WorkType → Skills (как в RimWorld)
const workTypeToSkills = {
    "врач": ["Medicine"],
    "уход": ["Medicine"],
    "надзор": ["Social"],
    "насили": ["Shooting", "Melee"],
    "квалифицированная": ["Construction", "Mining", "Cooking", "Plants", "Crafting"]
};

// определяем, какие навыки должны быть заблокированы
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

    // безопасное приведение типов
    const p = info.persona && typeof info.persona === "object" ? info.persona : {};
    const skills = info.skills && typeof info.skills === "object" ? info.skills : {};
    const passions = info.passions && typeof info.passions === "object" ? info.passions : {};
    const traits = Array.isArray(info.traits)
        ? info.traits.filter(t => typeof t === "string")
        : [];

    // чистим disabled
    const rawDisabled = Array.isArray(p.disabled) ? p.disabled : [];
    const disabledClean = rawDisabled.reduce((acc, d) => {
        if (typeof d === "string") {
            const t = d.trim();
            if (t !== "") acc.push(t);
        }
        return acc;
    }, []);

    // определяем заблокированные навыки
    const blockedSkills = getBlockedSkills(disabledClean);

    const leftHtml = [];

    if (typeof p.gender === "string") leftHtml.push(`<div><b>Пол:</b> ${p.gender}</div>`);
    if (typeof p.age === "number") leftHtml.push(`<div><b>Возраст:</b> ${p.age}</div>`);
    if (typeof p.xenotype === "string") leftHtml.push(`<div><b>Ксенотип:</b> ${p.xenotype}</div>`);

    if (traits.length) {
        leftHtml.push(`<h3>Черты:</h3>`);
        leftHtml.push(traits.map(t => `<div>[${t}]</div>`).join(""));
    }

    // 🔥 Показываем ровно то, что пришло из RimWorld
    if (disabledClean.length) {
        leftHtml.push(`<h3>Недоступные работы:</h3>`);
        leftHtml.push(disabledClean.map(d => `<div>[${d}]</div>`).join(""));
    }

    // рендер навыков
    const skillsHtml = Object.entries(skills)
        .filter(([_, lvl]) => typeof lvl === "number")
        .map(([name, lvl]) => {
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
