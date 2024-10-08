import './label-dropdown.js'
import './verify-info.js'
import './notification-banner.js'

class DealView extends HTMLElement {
    constructor() {
        super()

        this.attachShadow({ mode: 'open' })

        this.$shadowRoot = $(this.shadowRoot)

        const styles = /*css*/`
            :host {
                position: fixed;
                top: ${$('title-bar').outerHeight()}px;
                bottom: ${$('nav-bar').outerHeight()}px;
                width: 100%;
                display: flex;
                flex-direction: column;
                max-height: calc(100vh - (6vh + 8vh));
                z-index: 1;
            }

            .post-container {
                flex-grow: 1;
                padding: 1.5vw;
                box-sizing: border-box;
                overflow-y: auto;
            }

            .post {
                height: 100%;
                width: 100%;
                border-radius: 8px;
                background-color: var(--dark-color-9);
                filter: brightness(100%);
                display: flex;
                flex-direction: column;
                color: var(--dark-color-2);
            }

            .post-header {
                flex-shrink: 0;
                width: 100%;
                height: clamp(60px, 13%, 1000000000px);
                border-bottom: 2px solid var(--dark-color-1);
                display: grid;
                grid-template-rows: 1fr 1fr;
                grid-template-columns: minmax(0, 4fr) minmax(0, 3fr);
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
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
                display: block;
            }

            .timestamp {
                grid-area: 2 / 1 / 3 / 2;
                margin-bottom: 1vh;
            }

            .facebook-button {
                grid-area: 1 / 2 / 3 / 3;
                align-self: center;
                justify-self: center;
                background-color: var(--color-4);
                padding: 1.2vh;
                border-radius: 8px;
            }

            .facebook-button a {
                color: var(--dark-color-2);
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
                height: clamp(230px, 30%, 100000px);
                display: grid;
                grid-template-rows: 2fr 2fr 2fr 2fr 4fr;
                grid-template-columns: 2.7fr 2.7fr 1fr;
                background-color: var(--dark-color-1);
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
                background-color: var(--dark-color-9);
                filter: brightness(85%);
                border-radius: 7px;
                color: var(--dark-color-2);
            }

            .address > span {
                font-size: 1.1rem;
                font-weight: 600;
                white-space: nowrap;
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

        this.$shadowRoot.append(/*html*/`
            <style>${styles}</style>
        `)
    }

    async connectedCallback() {
        $('title-bar')[0].backButton = '/deals-list'

        if (this.hasRendered) return

        const query = new URLSearchParams(window.location.search)

        const dealID = query.get('id')

        if (!dealID) window.location.href = '/deals'

        api.get(`/deal?id=${dealID}`).then(response => {
            const deal = response.data

            console.log(deal)

            this.$shadowRoot.append(/*html*/`
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
                                <span>${(`${deal.post.text || ''}${deal.post.attachedPost?.text ? `\n${deal.post.attachedPost.text}` : ''}`).replaceAll('\n', '<br>')}</span>
                            </div>

                            <!-- <div class="images">
                                ${
                                    deal.post.images.map(imageURL => /*html*/`
                                        <img src="${imageURL}">
                                    `).join('')
                                }
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
                            _id="${deal._id}"
                            defaultOption="${deal.label}"
                            options="Unchecked Checked"
                        ></label-dropdown>

                        <verify-info
                            verified="${deal.verified}"
                            dealID="${deal._id}"
                            category="${deal.category}"
                            price="${deal.price || ''}"
                            arv="${deal.arv || ''}"
                            streetNumber="${deal.address.streetNumber || ''}"
                            streetName="${deal.address.streetName || ''}"
                            city="${deal.address.city || ''}"
                            state="${deal.address.state || ''}"
                            zip="${deal.address.zip || ''}"
                        ></verify-info>
                    </div>
                </div>
            `)
        })
        .catch(error => {
            console.error('Request Error:', error)

            $('<notification-banner></notification-banner>')[0].apiError(error, 'Get Deal')
        })

        this.hasRendered = true
    }
}

customElements.define('deal-view', DealView)