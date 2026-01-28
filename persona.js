export function renderPersona(info) {
    const root = document.getElementById("persona");
    if (!root) return;

    const p = info.persona;

    root.innerHTML = `
        <div class="persona-block">
            <div><b>Пол:</b> ${p.gender}</div>
            <div><b>Возраст:</b> ${p.age}</div>
            <div><b>Ксенотип:</b> ${p.xenotype}</div>
            <div><b>Фракция:</b> ${p.faction}</div>
            <div><b>Происхождение:</b> ${p.origin}</div>
            <div><b>Детство:</b> ${p.childhood}</div>
            <div><b>Взрослая жизнь:</b> ${p.adulthood}</div>

            <div class="persona-disabled">
                <b>Неспособности:</b>
                ${p.disabled.length === 0 
                    ? "<span>Нет</span>"
                    : p.disabled.map(x => `<div class="disabled-item">${x}</div>`).join("")}
            </div>
        </div>
    `;
}
