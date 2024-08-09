import './label-dropdown.js'
import './verify-info.js'

class DealView extends HTMLElement {
    constructor() {
        super()

        const styles = /*css*/`
            deal-view {
                position: fixed;
                top: ${$('title-bar').outerHeight()}px;
                bottom: ${$('nav-bar').outerHeight()}px;
                width: 100%;
                display: flex;
                flex-direction: column;
                max-height: calc(100vh - (8vh + 6vh));
                z-index: 1;
            }

            .post-container {
                background-color: var(--primary-color);
                height: 70%;
                padding: 1.5vw;
                box-sizing: border-box;
            }

            .post {
                height: 100%;
                width: 100%;
                border-radius: 8px;
                background-color: var(--secondary-color);
                filter: brightness(100%);
                display: flex;
                flex-direction: column;
            }

            .post-header {
                flex-shrink: 0;
                width: 100%;
                height: 13%;
                border-bottom: 2px solid var(--color-4);
                display: grid;
                grid-template-rows: 1fr 1fr;
                grid-template-columns: 4fr 3fr;
            }

            .author-name, .timestamp {
                margin-left: 4vw;
                display: flex;
                align-items: center;
            }

            .author-name {
                grid-area: 1 / 1 / 2 / 2;
                font-size: 1.1rem;
                font-weight: 500;
                margin-top: 1vh;
            }

            .timestamp {
                grid-area: 2 / 1 / 3 / 2;
                margin-bottom: 1vh;
            }

            .facebook-button {
                grid-area: 1 / 2 / 3 / 3;
                align-self: center;
                justify-self: center;
                background-color: rgb(8, 102, 255);
                padding: 1.2vh;
                border-radius: 8px;
                border: 1px solid rgb(5, 67, 168);
            }

            .facebook-button a {
                color: black;
                text-decoration: none;
                font-weight: 500;
            }

            .post-body {
                flex-grow: 1;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                overflow-y: auto;
            }

            .text {
                padding: 3vw;
            }

            .images {
                min-height: 40vh;
                margin: 2vw;
                display: flex;
                flex-direction: row;
                border-radius: 5px;
                overflow-x: scroll;
            }

            .image-container img {
                height: 100%;
            }

            .info-grid {
                box-sizing: border-box;
                padding-top: 0.8vh;
                flex-shrink: 0;
                width: 100%;
                height: 30%;
                display: grid;
                grid-template-rows: 2fr 2fr 2fr 2fr 4fr;
                grid-template-columns: 2.7fr 2.7fr 1fr;
                background-color: var(--primary-color);
            }

            .address {
                grid-area: 1 / 1 / 2 / 4;
            }

            .price {
                grid-area: 2 / 1 / 3 / 3;
            }

            .arv {
                grid-area: 3 / 1 / 4 / 3;
            }

            .price-to-arv {
                grid-area: 2 / 3 / 4 / 4;
            }

            .deal-type {
                grid-area: 4 / 1 / 5 / 4;
            }

            .buttons {
                grid-area: 5 / 1 / 6 / 4;
            }

            .info-grid > div:not(.buttons) {
                display: flex;
                flex-direction: row;
                justify-content: center;
                align-items: center;
                margin: auto 2vw;
                background-color: var(--primary-color);
                filter: brightness(85%);
                border-radius: 7px;
            }

            .address > span {
                font-size: 1.1rem;
                font-weight: 600;
            }

            .price-to-arv > span {
                font-size: 1.3rem;
                font-weight: 600;
            }

            .price, .arv, .address, .deal-type {
                padding: 0.5vh;
            }

            .price > :first-child, .arv > :first-child {
                margin-right: 3vw;
                font-size: 1.1rem;
            }

            .price > :last-child , .arv > :last-child {
                font-size: 1.2rem;
                font-weight: 600;
            }

            .price-to-arv {
                justify-self: center;
                padding: 2.2vw 1.5vw;
            }

            .deal-type {
                margin: auto;
                font-size: 1.1rem;
                font-weight: 600;
            }

            .buttons {
                display: flex;
                flex-direction: row;
                justify-content: space-around;
                align-items: center;
            }
        `

        $('head').append(/*html*/`
            <style>${styles}</style>
        `)
    }

    async connectedCallback() {
        const query = new URLSearchParams(window.location.search)

        if (!query.get('id')) window.location.href = '/deals'

        const deal = await api.get(`/deal?id=${query.get('id')}`).then(response => response.data)

        $(this).attr('id', deal._id)

        console.log(deal)

        this.innerHTML = /*html*/`
            <div class="post-container">
                <div class="post">
                    <div class="post-header">
                        <span class="author-name">${deal.post.author.name}</span>
                        <span class="timestamp">${new Date(deal.post.createdAt).toLocaleString('en-US', { timeZone: 'America/Chicago', year: '2-digit', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true, })}</span>

                        <div class="facebook-button">
                            <a href="https://www.facebook.com/groups/${deal.post.group.id}/posts/${deal.post.id}" target="_blank">Facebook Link</a>
                        </div>
                    </div>

                    <div class="post-body">
                        <div class="text">
                            <span>${deal.post.text.replaceAll('\n', '<br>')}</span>
                        </div>

                        <!-- <div class="images">
                            ${
                                deal.post.images.map(imageURL => /*html*/`
                                    <img src="${imageURL}">
                                `).join('')
                            }

                            <img src="https://scontent-dfw5-1.xx.fbcdn.net/v/t39.30808-6/453884092_10160252875534053_4233656324536154436_n.jpg?stp=dst-jpg_s600x600&_nc_cat=103&ccb=1-7&_nc_sid=aa7b47&_nc_ohc=cqH5gOOnKBYQ7kNvgFKgsk2&_nc_ht=scontent-dfw5-1.xx&cb_e2o_trans=t&oh=00_AYDlj-mS4rjzD3XCFg6FpXcPatD-9j8Lh-bY8GZ_eX2vug&oe=66B3AE95">

                            <img src="https://scontent-dfw5-1.xx.fbcdn.net/v/t39.30808-6/453746918_10160252875504053_183775604910916250_n.jpg?stp=dst-jpg_s600x600&_nc_cat=101&ccb=1-7&_nc_sid=aa7b47&_nc_ohc=mYmLeAOAnmUQ7kNvgHsjZGf&_nc_ht=scontent-dfw5-1.xx&cb_e2o_trans=t&oh=00_AYArPkdLTmY8x1Qpq_xlRq4Ip4v61_M_ppWJY6CFRgROcg&oe=66B3D418">
                        </div> -->
                    </div>
                </div>
            </div>

            <div class="info-grid">
                <div class="address">
                    <span>${deal.address.streetNumber ? `${deal.address.streetNumber} ` : ''}${deal.address.streetName ? `${deal.address.streetName}, ` : ''}${deal.address.city ? `${deal.address.city}, ` : ''}${deal.address.state ? `${deal.address.state} `: ''}${deal.address.zip || ''}</span>
                </div>

                <div class="price">
                    <span>Asking:</span>
                    <span>${deal.price ? `$${deal.price.toLocaleString('en-US')}` : 'Unknown'}</span>
                </div>

                <div class="arv">
                    <span>Est. ARV:</span>
                    <span>${deal.arv ? `$${deal.arv.toLocaleString('en-US')}` : 'Unknown'}</span>
                </div>

                <div class="price-to-arv">
                    <span>${deal.priceToARV ? `${Math.round(deal.priceToARV * 100)}%` : '?'}</span>
                </div>

                <div class="deal-type">
                    <span>${deal.category}</span>
                </div>

                <div class="buttons">
                    <label-dropdown
                        defaultOption="${deal.label}"
                        options="Unchecked Checked"
                    ></label-dropdown>
                    <verify-info
                        verified="${deal.verified}"
                    ></verify-info>
                </div>
            </div>
        `
    }
}

customElements.define('deal-view', DealView)