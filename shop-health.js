export function renderShopHealth(info) {
    const el = document.querySelector("#shop-tab-health");
    if (!el) return;

    el.innerHTML = `
        <h3>Здоровье</h3>
        <div>Здесь будут товары, связанные со здоровьем.</div>
    `;
}
