import './label-dropdown.js'
import './notification-banner.js'
import './info-issue.js'

class DealView extends HTMLElement {
    constructor() {
        super()

        this.attachShadow({ mode: 'open' })

        this.$shadowRoot = $(this.shadowRoot)

        const styles = /*css*/`
            :host(*) {
                position: fixed;
                left: calc(min(40vw, 650px) + min(30vw, 450px));
                right: 0;
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
                padding: 0px 1.5vw;
                padding: 12px;
                box-sizing: border-box;
                overflow-y: auto;
            }

            .post {
                height: 100%;
                width: 100%;
                border-radius: 8px;
                background-color: var(--dark-color-9);
                display: flex;
                flex-direction: column;
                color: var(--dark-color-2);
            }

            .post-header {
                flex-shrink: 0;
                width: 100%;
                min-height: 60px;
                height: 10%;
                /*border-bottom: 2px solid var(--dark-color-1);*/
                display: grid;
                grid-template-rows: 1fr 1fr;
                grid-template-columns: minmax(0, 4fr) minmax(0, 3fr);
                box-sizing: border-box;
                padding: 5px 18px; 
            }

            .author-name, .timestamp {
                display: flex;
                align-items: center;
            }

            .author-name {
                grid-area: 1 / 1 / 2 / 2;
                font-size: 1.1rem;
                font-weight: 600;
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
            }

            .timestamp {
                grid-area: 2 / 1 / 3 / 2;
            }

            .icons-container {
                grid-area: 1 / 2 / 3 / 3;
                display: flex;
                justify-content: flex-end;
                align-items: center;
            }

            .icons-container > svg {
                height: 60%;
                aspect-ratio: 1 / 1;
                box-sizing: border-box;
                padding: 3px;
                border-radius: 6px;
            }

            .block-author {
                border-radius: 6px;
                color: var(--dark-color-5);
                height: 60%;
                box-sizing: border-box;
                padding: 0px 3%;
                font-weight: 600;
                display: flex;
                align-items: center;
                white-space: nowrap;
                border: 2px solid var(--dark-color-5);
            }

            .blocked {
                height: 60%;
                box-sizing: border-box;
                border-radius: 6px;
                color: var(--dark-color-8);
                padding: 3%;
                font-weight: 600;
                border: 2px solid var(--dark-color-8);
            }

            .issue-icon {
                border: 2px solid var(--dark-color-5);
                fill: var(--dark-color-5);
                margin-left: 5%;
            }

            .deal-type {
                margin: 0px 18px;
                margin-bottom: 1vh;
                border-radius: 10px;
                font-size: 1.1rem;
                font-weight: 600;
                text-align: center;
                padding: 0.6vh 0px;
            }

            .sfh {
                border: 2px solid var(--dark-color-3);
                color: var(--dark-color-3);
            }

            .land {
                border: 2px solid var(--dark-color-4);
                color: var(--dark-color-4);
            }

            .post-body {
                flex-grow: 1;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                overflow-y: auto;
            }

            .text {
                padding: 18px;
                padding-top: 0px;
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
                <h2 id="no-deal" style="color: var(--dark-color-2); margin: auto; align-self: center;">No Deal Selected</h2> 
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
                <div id="no-deal">No Deal Selected</div> 
            `)
        } else {
            this.renderDeal(dealID)
        }
    }

    renderDeal(dealID) {
        api.get(`/deal?id=${dealID}`).then(response => {
            const deal = response.data

            this.deal = deal

            console.log(deal)

            const postContainerHTML = /*html*/`
                <div class="post-container">
                    <div class="post">
                        <div class="post-header">
                            <span class="author-name">${deal.post.author.name}</span>
                            <span class="timestamp">${new Date(deal.post.createdAt).toLocaleString('en-US', { timeZone: 'America/Chicago', year: '2-digit', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true, })}</span>
                            <div class="icons-container">
                                <!--<div class="block-author hover">Block Author</div>-->
                                <!--<div class="blocked">Blocked</div>-->
                                <svg class="issue-icon hover" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 16" id="issue"><g id="Octicons"><g id="issue-opened"><path id="Shape" d="M7 2.3c3.14 0 5.7 2.56 5.7 5.7s-2.56 5.7-5.7 5.7A5.71 5.71 0 0 1 1.3 8c0-3.14 2.56-5.7 5.7-5.7zM7 1C3.14 1 0 4.14 0 8s3.14 7 7 7 7-3.14 7-7-3.14-7-7-7zm1 3H6v5h2V4zm0 6H6v2h2v-2z"></path></g></g></svg>
                            </div>
                        </div>

                        <span class="deal-type ${deal.category === "SFH Deal" ? "sfh" : "land"}">${deal.category}</span>

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

            this.$shadowRoot.find('.issue-icon').on('click', () => {
                $('body').append('<info-issue></info-issue>')
            })

            window.savedQueryPromise.then(savedQuery => {
                if (savedQuery.blacklistedAuthors.find(blacklistedAuthor => blacklistedAuthor.id === deal.post.author.id)) {
                    this.$shadowRoot.find('.icons-container').prepend('<div class="blocked">Blocked</div>')
                } else {
                    this.$shadowRoot.find('.icons-container').prepend('<div class="block-author hover">Block Author</div>')

                    this.$shadowRoot.find('.block-author').on('click', event => {
                        $(event.currentTarget).replaceWith('<div class="blocked">Blocked</div>')

                        const element = $(/*html*/`
                            <div class="option-item active" key="${deal.post.author.id}">
                                <h4>${deal.post.author.name}</h4>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="remove hover" viewBox="4.47 4.47 7.05 7.05"><path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/></svg>
                            </div>
                        `)

                        element.find('svg').on('click', event => {
                            const group = $(event.target).closest('[group]')[0].getAttribute('group')

                            $(event.currentTarget).closest('.option-item').remove()

                            $('filter-options-sidebar')[0].dispatchEvent(new CustomEvent('valueChange', {
                                detail: { group, key: null, value: null }
                            }))
                        })

                        $($('filter-options-sidebar')[0].shadowRoot).find('[group="blacklisted-authors"]').append(element)

                        $('deals-list')[0].refreshDealsList()
                    })
                }
            })
        })
        .catch(error => {
            console.error('Request Error:', error)

            $('<notification-banner></notification-banner>')[0].apiError(error, 'Get Deal')
        })
    }
}

customElements.define('deal-view', DealView)
