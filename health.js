export function renderHealth(info) {
    const root = document.getElementById("health");
    if (!root) return;

    const parts = info.healthParts;

    const grouped = {};
    for (const h of parts) {
        if (!grouped[h.part]) grouped[h.part] = [];
        grouped[h.part].push(h);
    }

    const sortedParts = Object.keys(grouped).sort();

    root.innerHTML = `
        <div class="health-block">
            <div class="health-summary">
                <b>Общее здоровье:</b> ${info.healthSummary}
            </div>

            <div class="health-pain">
                <b>Боль:</b> ${info.pain}
            </div>

            ${sortedParts.map(part => `
                <div class="health-part">
                    <div class="health-part-title">${part}</div>
                    <div class="health-part-list">
                        ${grouped[part].map(h => `
                            <div class="health-row">
                                <span class="health-name">${h.hediff}</span>
                                ${h.bleeding ? `<span class="health-bleeding">Кровотечение</span>` : ""}
                                ${h.prosthetic ? `<span class="health-prosthetic">Протез</span>` : ""}
                            </div>
                        `).join("")}
                    </div>
                </div>
            `).join("")}
        </div>
    `;
}
