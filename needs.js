export function renderNeeds(info) {
    const root = document.getElementById("needs");
    if (!root) return;

    const needs = info.needs;

    const sorted = Object.entries(needs)
        .sort((a, b) => a[1] - b[1]);

    root.innerHTML = `
        <div class="needs-list">
            ${sorted.map(([name, value]) => `
                <div class="need-row">
                    <div class="need-name">${name}</div>
                    <div class="need-bar">
                        <div class="need-fill" style="width:${Math.floor(value * 100)}%"></div>
                    </div>
                    <div class="need-value">${Math.floor(value * 100)}%</div>
                </div>
            `).join("")}
        </div>
    `;
}
