export function renderShopEvents(info) {
    const el = document.querySelector("#shop-tab-events");
    if (!el) return;

    el.innerHTML = `
        <div>Здесь будут ивенты, которые можно купить.</div>
    `;
}
