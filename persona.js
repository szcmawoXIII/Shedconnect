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
    Artistic: "Искусство",
    Medicine: "Медицина",
    Social: "Общение",
    Intellectual: "Умственный труд"
};

const orderedSkills = [
    "Shooting", "Melee", "Construction", "Mining",
    "Cooking", "Plants", "Animals", "Crafting",
    "Artistic", "Medicine", "Social", "Intellectual"
];

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

    const disabledClean = Array.isArray(p.disabled)
        ? p.disabled.filter(x => typeof x === "string")
        : [];

    const blockedSkills = new Set(
        Array.isArray(info.disabledSkills)
            ? info.disabledSkills
            : []
    );

    const leftHtml = [];

    if (p.gender) leftHtml.push(`<div><b>Пол:</b> ${p.gender}</div>`);
    if (p.age) leftHtml.push(`<div><b>Возраст:</b> ${p.age}</div>`);
    if (p.xenotype) leftHtml.push(`<div><b>Ксенотип:</b> ${p.xenotype}</div>`);

    if (traits.length) {
        leftHtml.push(`<h3>Черты:</h3>`);
        leftHtml.push(traits.map(t => `<div>[${t}]</div>`).join(""));
    }

    if (disabledClean.length) {
        leftHtml.push(`<h3>Недоступно:</h3>`);
        leftHtml.push(disabledClean.map(d => `<div>[${d}]</div>`).join(""));
    }

    const skillsHtml = orderedSkills
        .map(name => {
            const lvl = skills[name];
            if (typeof lvl !== "number") return "";

            const blocked = blockedSkills.has(name);
            const displayValue = blocked ? "—" : lvl;

            const passion =
                blocked ? "" :
                passions[name] === 1 ? "🔥" :
                passions[name] === 2 ? "🔥🔥" : "";

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
        <div class="center-columns">
            <div class="col-left" style="font-size:15px;">
                ${leftHtml.join("")}
            </div>

            <div class="col-right" style="font-size:14px;">
                ${skillsHtml}
            </div>
        </div>
    `;
}
