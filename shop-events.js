export function renderShopEvents(info) {
    const el = document.querySelector("#shop-tab-events");
    if (!el) return;

    el.innerHTML = `
        <div class="events-coming-soon">

            <div class="events-box">
                <img src="img/clock.png" class="events-icon">

                <div class="events-title">Ивенты появятся в версии 2.0</div>

                <div class="events-text">
                    Мы готовим новую систему событий: рейды, подарки, баффы, дебаффы,
                    погодные аномалии и многое другое. Всё будет доступно прямо из чата.
                </div>

                <div class="events-sub">
                    Следите за обновлениями — скоро будет жарко.
                </div>
            </div>

        </div>
    `;
}
