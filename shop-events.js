export function renderShopEvents(info) {
    const el = document.querySelector("#shop-tab-events");
    if (!el) return;

    el.innerHTML = `
        <h3>Ивенты</h3>
        <div>Здесь будут ивенты, которые можно купить.</div>
    `;
}
