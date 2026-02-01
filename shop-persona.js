export function renderShopPersona(info) {
    const el = document.querySelector("#shop-tab-persona");
    if (!el) return;

    const PRICE_HEAL = 50;
    const PRICE_FEED = 20;
    const PRICE_YOUNG = 120;
    const PRICE_GENDER = 200;

    el.innerHTML = `
        <div style="font-size:15px;">

            <div class="shop-line">
                <span>Вылечить мою пешку</span>
                <button class="rw-button" data-action="heal_full">
                    ${PRICE_HEAL} <img src="img/catcoin.png" class="kat-icon">
                </button>
            </div>

            <div class="shop-line">
                <span>Кормить мою пешку</span>
                <button class="rw-button" data-action="feed">
                    ${PRICE_FEED} <img src="img/catcoin.png" class="kat-icon">
                </button>
            </div>

            <div class="shop-line">
                <span>Омолодить на 5 лет</span>
                <button class="rw-button" data-action="age_minus_5">
                    ${PRICE_YOUNG} <img src="img/catcoin.png" class="kat-icon">
                </button>
            </div>

            <div class="shop-line">
                <span>Сменить пол</span>
                <button class="rw-button" data-action="gender_swap">
                    ${PRICE_GENDER} <img src="img/catcoin.png" class="kat-icon">
                </button>
            </div>

        </div>
    `;
}
