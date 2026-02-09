export function renderShopEvents(info) {
    const el = document.querySelector("#shop-tab-events");
    if (!el) return;

    el.innerHTML = `
        <div class="events-wrapper">

            <div class="events-panel">

                <div class="events-header">
                    <img src="img/event_future.png" class="events-header-icon">
                    <div class="events-header-title">Магазин ивентов</div>
                </div>

                <div class="events-divider"></div>

                <div class="events-body">
                    <div class="events-coming-title">Готовится обновление 2.0</div>

                    <div class="events-coming-text">
                        Мы создаём новую систему событий, которая позволит зрителям
                        влиять на происходящее в колонии: вызывать рейды, дарить ресурсы,
                        менять погоду, усиливать или ослаблять пешек, запускать цепочки
                        случайных событий и многое другое.
                    </div>

                    <div class="events-coming-sub">
                        Всё это появится в версии <span class="events-highlight">2.0</span>.
                        Следите за обновлениями — впереди много интересного.
                    </div>
                </div>

                <div class="events-footer">
                    <div class="events-footer-line"></div>
                    <div class="events-footer-text">Система ивентов находится в разработке</div>
                    <div class="events-footer-line"></div>
                </div>

            </div>

        </div>
    `;
}
