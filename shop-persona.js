// shop-persona.js — вкладка магазина "Персона"

export function renderShopPersona(info) {
    const el = document.querySelector("#shop-tab-persona");
    if (!el) return;

    // Пример цен — потом подставишь реальные
    const PRICE_HEAL = 50;
    const PRICE_FEED = 20;
    const PRICE_YOUNG = 120;
    const PRICE_GENDER = 200;

    el.innerHTML = `
        <div style="font-size:15px;">

            <!-- БАЗОВЫЕ УСЛУГИ -->
            <div class="shop-line">
                <span>Вылечить мою пешку</span>
                <span class="shop-price">
                    ${PRICE_HEAL} <img src="img/catcoin.png" class="kat-icon">
                </span>
                <button class="shop-btn" data-action="heal_full">
                    ${PRICE_HEAL} <img src="img/catcoin.png" class="kat-icon">
                </button>
            </div>

            <div class="shop-line">
                <span>Кормить мою пешку</span>
                <span class="shop-price">
                    ${PRICE_FEED} <img src="img/catcoin.png" class="kat-icon">
                </span>
                <button class="shop-btn" data-action="feed">
                    ${PRICE_FEED} <img src="img/catcoin.png" class="kat-icon">
                </button>
            </div>

            <div class="shop-line">
                <span>Омолодить на 5 лет</span>
                <span class="shop-price">
                    ${PRICE_YOUNG} <img src="img/catcoin.png" class="kat-icon">
                </span>
                <button class="shop-btn" data-action="age_minus_5">
                    ${PRICE_YOUNG} <img src="img/catcoin.png" class="kat-icon">
                </button>
            </div>

            <div class="shop-line">
                <span>Сменить пол</span>
                <span class="shop-price">
                    ${PRICE_GENDER} <img src="img/catcoin.png" class="kat-icon">
                </span>
                <button class="shop-btn" data-action="gender_swap">
                    Сменить пол
                </button>
            </div>

            <hr style="margin:12px 0; border-color:#444;">

            <!-- ДОБАВИТЬ ЧЕРТУ -->
            <h3 style="margin:6px 0;">Добавить черту характера</h3>

            <div id="trait-tabs" style="margin-bottom:8px;">
                <button data-trait-tab="good">Хорошие</button>
                <button data-trait-tab="bad">Плохие</button>
                <button data-trait-tab="neutral">Нейтральные</button>
                <button data-trait-tab="situational">Ситуативные</button>
            </div>

            <div id="trait-content">
                <div class="trait-tab" id="trait-tab-good"></div>
                <div class="trait-tab" id="trait-tab-bad"></div>
                <div class="trait-tab" id="trait-tab-neutral"></div>
                <div class="trait-tab" id="trait-tab-situational"></div>
            </div>

        </div>
    `;

    // Активируем первую вкладку
    document.querySelector('#trait-tab-good')?.classList.add('active');

    document.querySelectorAll('#trait-tabs button').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.traitTab;

            document.querySelectorAll('.trait-tab').forEach(t => t.classList.remove('active'));
            const target = document.querySelector('#trait-tab-' + tab);
            if (target) target.classList.add('active');
        });
    });

    // Позже сюда добавим загрузку трейтов из Supabase
}
