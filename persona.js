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

    const disabledList = Array.isArray(p.disabled) ? p.disabled : [];

    const violentDisabled =
        disabledList.some(d => typeof d === "string" && d.toLowerCase().includes("насили")) ?? false;

    const leftHtml = [];

    if (p.gender) leftHtml.push(`<div><b>Пол:</b> ${p.gender}</div>`);
    if (p.age) leftHtml.push(`<div><b>Возраст:</b> ${p.age}</div>`);
    if (p.xenotype) leftHtml.push(`<div><b>Ксенотип:</b> ${p.xenotype}</div>`);

    if (traits.length) {
        leftHtml.push(`<h3>Черты:</h3>`);
        leftHtml.push(traits.map(t => `<div>[${t}]</div>`).join(""));
    }

    // 🔥 Исправлено: фильтрация только строк
    const disabledClean = disabledList.filter(d => typeof d === "string" && d.trim() !== "");

    if (disabledClean.length) {
        leftHtml.push(`<h3>Недоступные работы:</h3>`);
        leftHtml.push(disabledClean.map(d => `<div>[${d}]</div>`).join(""));
    }

    const skillsHtml = Object.entries(skills)
        .map(([name, lvl]) => {
            const isViolenceSkill = (name === "Shooting" || name === "Melee");
            const isBlocked = violentDisabled && isViolenceSkill;

            const displayValue = isBlocked ? "—" : lvl;

            const passion =
                isBlocked
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
