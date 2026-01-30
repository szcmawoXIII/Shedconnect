export function renderShopPersona(info) {
    const el = document.querySelector("#shop-tab-persona");
    if (!el) return;

    el.innerHTML = `
<div>Здесь будут товары, связанные с персонажем.</div>
    `;
}
