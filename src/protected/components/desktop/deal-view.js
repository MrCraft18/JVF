import './label-dropdown.js'
import './notification-banner.js'

class DealView extends HTMLElement {
    constructor() {
        super()

        this.attachShadow({ mode: 'open' })

        this.$shadowRoot = $(this.shadowRoot)

        const styles = /*css*/`
            :host(*) {
                position: fixed;
                left: calc(min(40vw, 600px) + min(25vw, 400px));
                width: auto;
                height: 100vh;
            }

            h4 {
                margin: 0px;
            }

            #content {
                height: 100%;
                width: 100%;
                display: flex;
                flex-direction: column;
                z-index: 1;
                max-height: 100vh;
            }

            .post-container {
                flex-grow: 1;
                padding: 1.5vw;
                padding: 12px;
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
                margin-left: 20px;
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
                padding: 0px 12px;
                height: 230px;
                display: grid;
                grid-template-rows: 2fr 2fr 2fr 4fr;
                grid-template-columns: 2.7fr 2.7fr 3fr;
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

            .buttons {
                grid-area: 4 / 1 / 6 / 4;
            }

            .info-grid > div:not(.buttons) {
                display: flex;
                align-items: center;
                margin: 5px 0px;
                background-color: var(--dark-color-9);
                filter: brightness(85%);
                border-radius: 7px;
                color: var(--dark-color-2);
            }

            .info-grid > div:not(.buttons, .price-to-arv) {
                flex-direction: row;
                justify-content: center;
            }

            .address > span {
                font-size: 1.1rem;
                font-weight: 600;
                white-space: nowrap;
            }

            .price, .arv, .address {
                padding: 0.5vh;
            }

            .price > :first-child, .arv > :first-child  {
                margin-right: 3vw;
                font-size: 1.1rem;
            }

            .price-to-arv > :first-child {
                font-size: 1.1rem;
            }

            .price > :last-child , .arv > :last-child, .price-to-arv > :last-child {
                font-size: 1.2rem;
                font-weight: 600;
            }

            .price-to-arv {
                padding: 0.5vh 0.8vw;
                justify-self: center;
                flex-direction: column;
                justify-content: space-around;
            }

            .hover:hover {
                cursor: pointer;
                filter: brightness(90%);
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

            .facebook-button {
                border: 4px solid var(--color-3);
                height: 65%;
                box-sizing: border-box;
                background-color: var(--color-4);
                padding: 1.5vh;
                align-content: center;
                border-radius: 8px;
            }

            .facebook-button a {
                color: var(--dark-color-2);
                text-decoration: none;
                font-weight: 500;
            }
        `

        this.$shadowRoot.append(/*html*/`
            <style>${styles}</style>
        `)
    }

    connectedCallback() {
        if (this.hasRendered) return this.reinsertedCallback()

        this.$shadowRoot.append('<div id="content"></div>')

        const query = new URLSearchParams(window.location.search)

        const dealID = query.get('id')

        if (!dealID) {
            this.$shadowRoot.find('#content').html(/*html*/`
                <span id="no-deal">No Deal Selected</span> 
            `)
        } else {
            this.renderDeal(dealID)
        }
        this.hasRendered = true
    }

    reinsertedCallback() {
        const query = new URLSearchParams(window.location.search)

        const dealID = query.get('id')

        if (!dealID) {
            this.$shadowRoot.find('#content').html(/*html*/`
                <span id="no-deal">No Deal Selected</span> 
            `)
        } else {
            this.renderDeal(dealID)
        }
    }

    renderDeal(dealID) {
        api.get(`/deal?id=${dealID}`).then(response => {
            const deal = response.data

            console.log(deal)

            const postContainerHTML = /*html*/`
                <div class="post-container">
                    <div class="post">
                        <div class="post-header">
                            <span class="author-name">${deal.post.author.name}</span>
                            <span class="timestamp">${new Date(deal.post.createdAt).toLocaleString('en-US', { timeZone: 'America/Chicago', year: '2-digit', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true, })}</span>
                        </div>

                        <div class="post-body">
                            <div class="text">
                                <span>${(`${deal.post.text || ''}${deal.post.attachedPost?.text ? `\n${deal.post.attachedPost.text}` : ''}`).replaceAll('\n', '<br>')}</span>
                            </div>

                            <!-- <div class="images">
                                ${deal.post.images.map(imageURL => /*html*/`
                                        <img src="${imageURL}">
                                `).join('')}
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
                        <span>Price/ARV:</span>
                        <span>${deal.price && deal.arv ? `${Math.round((deal.price / deal.arv) * 100)}%` : '?'}</span>
                    </div>

                    <div class="buttons">
                        <label-dropdown
                            _id="${deal._id}"
                            defaultOption="${deal.label}"
                            options="Unchecked Checked"
                        ></label-dropdown>

                        <div class="facebook-button hover">
                            <a href="https://www.facebook.com/groups/${deal.post.group.id}/posts/${deal.post.id}" target="_blank"><h4>Facebook Link</h4></a>
                        </div>
                    </div>
                </div>
            `

            this.$shadowRoot.find('#content').html(postContainerHTML)
        })
        .catch(error => {
            console.error('Request Error:', error)

            $('<notification-banner></notification-banner>')[0].apiError(error, 'Get Deal')
        })
    }
}

customElements.define('deal-view', DealView)
