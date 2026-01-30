export function renderShopHealth(info) {
    const el = document.querySelector("#shop-tab-health");
    if (!el) return;

    el.innerHTML = `
        <div>Здесь будут товары, связанные со здоровьем.</div>
    `;
}
