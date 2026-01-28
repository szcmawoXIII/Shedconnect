// health.js — вкладка "Здоровье"

export function renderHealth(info) {
    const container = document.querySelector("#tab-health");
    if (!container) return;

    if (!info) {
        container.innerHTML = "Пешка не найдена";
        return;
    }

    const pain = info.pain || "";
    const capacities = info.capacities || {};
    const parts = info.healthParts || [];

    const left = [];

    if (pain) {
        left.push(`<div style="margin-bottom:10px;"><b>Боль:</b> ${pain}</div>`);
    }

    const capsHtml = Object.entries(capacities)
        .map(([name, val]) => `
            <div style="margin-bottom:8px; display:flex; justify-content:space-between;">
                <span>${name}</span>
                <span>${Math.round((val ?? 0) * 100)}%</span>
            </div>
        `)
        .join("");

    left.push(capsHtml);

    const normalized = parts.map(h => ({
        part: h.part && h.part.trim() !== "" ? h.part : "Все тело",
        hediff: h.hediff,
        bleeding: h.bleeding,
        prosthetic: h.prosthetic
    }));

    const prostheticByPart = new Map();
    for (const h of normalized) {
        if (!h.prosthetic) continue;
        prostheticByPart.set(h.part, h);
    }

    const hierarchy = [
        "рука",
        "предплеч",
        "кисть",
        "палец",
        "бедро",
        "голень",
        "стопа"
    ];

    function partDepth(partName) {
        const p = partName.toLowerCase();
        for (let i = 0; i < hierarchy.length; i++) {
            if (p.includes(hierarchy[i])) return i;
        }
        return 999;
    }

    const upperProstheticParts = new Set();
    for (const [partA] of prostheticByPart.entries()) {
        let hidden = false;
        const depthA = partDepth(partA);

        for (const [partB] of prostheticByPart.entries()) {
            if (partA === partB) continue;
            const depthB = partDepth(partB);

            if (depthB < depthA) {
                const sideA = partA.split(" ")[0];
                const sideB = partB.split(" ")[0];
                if (sideA === sideB) {
                    hidden = true;
                    break;
                }
            }
        }

        if (!hidden) upperProstheticParts.add(partA);
    }

    const filtered = normalized.filter(h => {
        if (h.prosthetic && !upperProstheticParts.has(h.part)) return false;

        for (const up of upperProstheticParts) {
            const side = up.split(" ")[0];
            if (!h.part.startsWith(side)) continue;

            const dUp = partDepth(up);
            const dCur = partDepth(h.part);

            if (dCur > dUp) return false;
        }

        return true;
    });

    const grouped = {};
    for (const h of filtered) {
        if (!grouped[h.part]) grouped[h.part] = [];
        grouped[h.part].push(h);
    }

    const order = [
        "Все тело",
        "Голова", "Череп", "Лицо", "Шея",
        "Правое ухо", "Левое ухо",
        "Правый глаз", "Левый глаз",
        "Правая рука", "Левая рука",
        "Правое предплечье", "Левое предплечье",
        "Правая кисть", "Левая кисть",
        "Правый палец", "Левый палец",
        "Правое бедро", "Левое бедро",
        "Правая голень", "Левая голень",
        "Правая стопа", "Левая стопа"
    ];

    const sortedParts = Object.keys(grouped).sort((a, b) => {
        const ia = order.findIndex(x => a.startsWith(x));
        const ib = order.findIndex(x => b.startsWith(x));
        return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
    });

    let right = "";

    for (const part of sortedParts) {
        const list = grouped[part];

        if (part === "Все тело") {
            const first = list[0];
            const bleed = first.bleeding ? " 💧" : "";
            right += `<div style="margin-bottom:4px;"><b>Все тело:</b> ${first.hediff}${bleed}</div>`;

            for (let i = 1; i < list.length; i++) {
                const h = list[i];
                const bleed2 = h.bleeding ? " 💧" : "";
                right += `
                    <div style="margin-left:25px; margin-bottom:3px;">
                        ${h.hediff}${bleed2}
                    </div>
                `;
            }
            continue;
        }

        const woundGroups = {};
        for (const h of list) {
            const key = h.hediff + "|" + h.bleeding;
            if (!woundGroups[key]) woundGroups[key] = { ...h, count: 0 };
            woundGroups[key].count++;
        }

        const wounds = Object.values(woundGroups);

        const first = wounds[0];
        const bleed = first.bleeding ? "💧" : "";
        const count = first.count > 1 ? ` x${first.count}` : "";

        right += `<div style="margin-bottom:4px;"><b>${part}:</b> ${first.hediff}${count} ${bleed}</div>`;

        for (let i = 1; i < wounds.length; i++) {
            const w = wounds[i];
            const bleed2 = w.bleeding ? "💧" : "";
            const count2 = w.count > 1 ? ` x${w.count}` : "";

            right += `
                <div style="margin-left:25px; margin-bottom:3px;">
                    ${w.hediff}${count2} ${bleed2}
                </div>
            `;
        }
    }

    container.innerHTML = `
        <div style="display:flex; gap:40px;">
            <div style="flex:1; font-size:15px;">
                ${left.join("")}
            </div>

            <div style="flex:1.3; font-size:15px;">
                ${right}
            </div>
        </div>
    `;
}
