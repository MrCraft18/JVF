import './sorting-dropdown.js'
import './deal-view.js'
import './notification-banner.js'

class DealsList extends HTMLElement {
    constructor() {
        super()

        this.attachShadow({ mode: 'open' })

        this.$shadowRoot = $(this.shadowRoot)

        const styles = /*css*/`
            :host(*) {
                position: fixed;
                left: min(450px, 30vw);
                width: 40vw;
                max-width: 650px;
                height: 100vh;
                display: flex;
                flex-direction: column;
                align-items: center;
                border-right: 2px solid var(--dark-color-9);
                box-sizing: border-box;
            }

            #top-bar {
                background-color: var(--dark-color-1);
                width: 100%;
                min-height: 4.5vh;
                max-height: 4.5vh;
                display: flex;
                flex-direction: row;
                align-items: center;
                justify-content: space-around;
            }

            input {
        	    padding: 0px;
        	    margin: 0px;
        	    border: 0px;
            }

            input:focus {
            	outline: none;
            }

            #searchbar {
                width: 45%;
                height: 80%;
                border-radius: 8px;
                font-size: 100%;
                padding: 0px 1rem;
                color: white;
                background-color: var(--dark-color-8);
            }

            #searchbar:focus {
                outline: 2px solid rgb(64, 46, 122);
            }

            .hover:hover {
                cursor: pointer;
                filter: brightness(90%);
            }

            #sort-by {
                height: 80%;
                --dropdown-button-background-color: var(--color-4);
                --dropdown-button-padding: 1rem;
                --dropdown-button-border-radius: 100px;
                --dropdown-options-border-radius: 10px;
                --dropdown-options-margin-top: 0.8vh;
                --dropdown-item-font-size: 0.9rem;
            }

            #deal-count {
                color: var(--dark-color-2);
                font-size: 1.2rem;
                font-weight: 500;
                margin-bottom: 4px;
            }

            #list-container {
                overflow-y: scroll;
                height: 100%;
                width: 100%;
            }

            .deal-list-item {
                background-color: var(--dark-color-1);
                color: var(--dark-color-2);
                width: 100%;
                height: 120px;
                padding: 4px;
                font-size: 1.1rem;
                box-sizing: border-box;
                display: grid;
                grid-template-rows: 1fr 1fr 1fr 1fr;
                grid-template-columns: 0.8fr 4.5fr 4.5fr;
            }

            .deal-list-item > div {
                box-sizing: border-box;
                overflow: hidden;
            }

            .deal-list-item > div:not(.icons-container), .icons-container > svg {
                background-color: inherit;
                filter: brightness(90%);
            }

            .deal-list-item > div:not(.icons-container) {
                margin: auto 4px;
                padding: 0.1vh 0.6rem;
                border-radius: 4px;
            }

            .icons-container {
                background-color: inherit;
                display: flex;
                flex-direction: column;
                justify-content: space-around;
                align-items: center;
                grid-area: 2 / 1 / 5 / 2;
            }

            .icons-container > svg {
                height: 50%;
                aspect-ratio: 1 / 1;
                border-radius: 6px;
                box-sizing: border-box;
                background-color: inherit;
            }

            .icons-container > svg {
                padding: 4px;
            }

            .sfh-icon {
                fill: var(--dark-color-3);
                border: 2px solid var(--dark-color-3);
            }

            .land-icon {
                fill: var(--dark-color-4);
                border: 2px solid var(--dark-color-4);
            }

            .deal-address, .deal-author, .deal-asking, .deal-arv, .deal-ratio, .deal-date, .deal-label {
                display: flex;
                min-width: 0px;
                align-items: center;
            }

            .deal-address {
                font-weight: 800;
                grid-area: 1 / 1 / 2 / 4;
            }

            .deal-author {
                grid-area: 2 / 2 / 3 / 3;
            }

            .deal-asking {
                justify-content: space-between;
                grid-area: 2 / 3 / 3 / 4;
            }

            .deal-arv {
                justify-content: space-between;
                grid-area: 3 / 3 / 4 / 4;
            }

            .deal-ratio {
                justify-content: space-between;
                grid-area: 3 / 2 / 4 / 3;
            }

            .red {
                color: var(--dark-color-5);
            }

            .yellow {
                color: var(--dark-color-6);
            }

            .green {
                color: var(--dark-color-4);
            }

            .deal-date {
                justify-content: center;
                grid-area: 4 / 3 / 5 / 4;
            }

            .deal-label {
                justify-content: center;
                grid-area: 4 / 2 / 5 / 3;
            }

            .unchecked {
                border: 2px solid var(--dark-color-3);
                color: var(--dark-color-3);
            }

            .checked {
                border: 2px solid var(--dark-color-4);
                color: var(--dark-color-4);
            }

            .deal-list-item span {
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
            }

            .deal-info-field {
                font-weight: 400;
            }

            .deal-info-value {
                font-weight: 500;
            }

            #no-deals {
                color: var(--dark-color-2);
                height: 60%;
                width: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
            }
        `

        this.$shadowRoot.append(/*html*/`
            <style>${styles}</style>
        `)
    }

    async connectedCallback() {
        if (this.hasRendered) return this.reinsertedCallback() //Add function to only call when this is true. This should only occur when its reinstated from a cache.

        //Get User query params and then set them in sorting-dropdown and filter-options-sidebar.

        const savedQuery = await window.savedQueryPromise

        this.$shadowRoot.append(/*html*/`
            <div id="top-bar">
                <input id="searchbar" type="text" placeholder="Search">

                <sorting-dropdown
                    id="sort-by"
                    defaultOption="${savedQuery?.sort || 'Date'}"
                    options="Date Asking ARV Price/ARV"
                    defaultOrder="${savedQuery?.order || 'descending'}"
                ></sorting-dropdown>
            </div>

            <span id="deal-count">...</span>

            <div id="list-container"></div>
        `)

        $('filter-options-sidebar').on('valueChange', () => {
            this.refreshDealsList()
        })

        this.$shadowRoot.find('sorting-dropdown').on('orderToggle', () => {
            this.refreshDealsList()
        })

        this.$shadowRoot.find('sorting-dropdown').on('optionChange', () => {
            this.refreshDealsList()
        })

        let searchTimer
        this.$shadowRoot.find('#searchbar').on('input', () => {
            if (searchTimer) {
                clearTimeout(searchTimer)
            }

            searchTimer = setTimeout(() => {
                this.refreshDealsList()
            }, 300)
        })

        this.$shadowRoot.find('#list-container').on('scroll', event => {
            const listContainerDiv = event.currentTarget

            const scrollPos = listContainerDiv.scrollTop + listContainerDiv.clientHeight
            const threshold = 2000

            if (listContainerDiv.scrollHeight - scrollPos <= threshold && !this.loadingDeals && this.next !== null) {
                this.fetchAndInsertDeals(this.getQueryParameters())
            }
        })

        this.hasRendered = true
    }

    //TODO: This has to be reworked to grab the parameters from the filter-sidebar component
    getQueryParameters() {
        const SortingDropdown = this.$shadowRoot.find('sorting-dropdown')[0]
        const FilterOptionsSidebar = $('filter-options-sidebar')[0]
        
        const body = {
            limit: 30,
            sort: SortingDropdown.selectedOption,
            order: SortingDropdown.orderDirection,
            ...(this.$shadowRoot.find('#searchbar').val() && { text: this.$shadowRoot.find('#searchbar').val() })
        }

        body['blacklistedLabels'] = FilterOptionsSidebar.getGroupItems('labels')
        .filter(item => item.value === false)
        .map(item => item.key)

        body['blacklistedStates'] = FilterOptionsSidebar.getGroupItems('states')
        .filter(item => item.value === false)
        .map(item => item.key)

        body['blacklistedCities'] = FilterOptionsSidebar.getGroupItems('cities')
        .filter(item => item.value === false)
        .map(item => item.key)

        body['blacklistedAuthors'] = FilterOptionsSidebar.getGroupItems('blacklisted-authors')
        .map(item => ({
            id: item.key,
            name: item.value
        }))

        for (const parameter of ['dealTypes', 'neededSFHInfo', 'neededLandInfo']) {
            body[parameter] = FilterOptionsSidebar.getGroupItems(parameter)
                .filter(item => item.value === true)
                .map(item => item.key)
        }

        if (FilterOptionsSidebar.getItemValue('postedAge', 'daysOld')) body.daysOld = parseInt(FilterOptionsSidebar.getItemValue('postedAge', 'daysOld'))

        console.log(body)

        return body
    }

    async fetchAndInsertDeals(body) {
        this.loadingDeals = true

        if (this.next) body.next = this.next

        api.post('/deals', body).then(response => {
            const { deals, next } = response.data

            this.next = next

            //console.log(deals)

            const listContainerDiv = this.$shadowRoot.find('#list-container')

            if (deals.length) {
                for (const deal of deals) {
                    listContainerDiv.append(dealDiv(deal))
                }
            } else {
                listContainerDiv.html(/*html*/`
                    <h3 id="no-deals">No Deals Found</h3>
                `)
            }

            this.loadingDeals = false
        })
        .catch(error => {
            console.error('Request Error:', error)

            $('<notification-banner></notification-banner>')[0].apiError(error, 'Deals Load')
        })
    }

    async insertDealCounts() {
        this.$shadowRoot.find('#deal-count').text('...')

        api.post('/dealCounts', this.getQueryParameters()).then(response => {
            const { queryCount, totalCount } = response.data
            this.$shadowRoot.find('#deal-count').text(`${queryCount} out of ${totalCount}`)
        })
        .catch(error => {
            console.error('Request Error:', error)

            $('<notification-banner></notification-banner>')[0].apiError(error, 'Deal Counts')
        })
    }

    refreshDealsList() {
        this.next = null
        this.$shadowRoot.find('#list-container').html('')
        this.fetchAndInsertDeals(this.getQueryParameters())
        this.insertDealCounts()
    }

    reinsertedCallback() {

    }
}

customElements.define('deals-list', DealsList)

function dealDiv(deal) {
    return $(/*html*/`
        <div id="${deal._id}" class="deal-list-item hover">
            <div class="icons-container">
                ${
                    deal.category === 'SFH Deal' ?
                    '<svg class="sfh-icon" version="1.0" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" viewBox="640.5 670.12 3838.98 3718.38"><g transform="translate(0.000000,5120.000000) scale(0.100000,-0.100000)" stroke="none"><path d="M25365 44480 c-225 -49 -407 -146 -585 -314 -250 -237 -1655 -1569 -1750 -1661 -63 -61 -333 -317 -600 -570 -651 -618 -4235 -4021 -5175 -4914 l-530 -504 -3 1752 -2 1751 -2890 0 -2890 0 0 -4498 0 -4498 -642 -610 c-353 -335 -919 -872 -1258 -1194 -339 -322 -1004 -954 -1479 -1405 -922 -876 -948 -903 -1036 -1080 -88 -178 -120 -318 -120 -520 0 -325 107 -586 335 -816 393 -398 1012 -460 1473 -147 82 56 90 63 837 773 752 714 2231 2118 3565 3385 484 459 1150 1092 1480 1405 330 314 1541 1464 2690 2555 1150 1091 2356 2237 2680 2545 1121 1065 1786 1696 3275 3110 822 781 1801 1710 2174 2065 374 355 682 645 686 645 6 0 520 -486 1960 -1855 217 -207 935 -888 1595 -1515 1441 -1368 2037 -1934 2570 -2440 220 -210 1073 -1019 1895 -1800 1508 -1432 2372 -2252 3480 -3305 333 -316 1001 -951 1485 -1410 929 -882 2440 -2317 3565 -3385 371 -353 698 -662 727 -688 234 -206 564 -311 876 -278 277 30 514 144 707 340 168 170 266 350 316 581 23 106 25 342 5 445 -34 174 -111 346 -213 484 -65 86 -16 40 -4688 4476 -938 890 -2148 2040 -2690 2554 -542 515 -1433 1361 -1980 1881 -547 519 -1256 1192 -1575 1495 -319 303 -1079 1025 -1690 1605 -610 580 -1328 1262 -1595 1515 -465 442 -2592 2462 -3537 3359 -249 236 -485 454 -525 484 -96 72 -270 156 -394 189 -138 36 -393 43 -529 13z"/><path d="M25500 38924 c-57 -11 -129 -38 -189 -71 -61 -34 -126 -92 -451 -408 -69 -67 -357 -344 -640 -616 -2288 -2198 -4707 -4523 -4810 -4624 -69 -66 -474 -456 -900 -866 -702 -675 -2629 -2527 -5070 -4873 -503 -484 -977 -939 -1053 -1012 -148 -142 -210 -224 -248 -325 l-24 -64 -3 -9118 c-2 -8042 0 -9126 13 -9183 46 -198 201 -364 400 -427 l70 -22 4515 0 4515 0 5 5525 c5 5106 6 5528 22 5566 67 168 159 272 303 342 127 61 -158 57 3645 57 3803 0 3518 4 3645 -57 144 -70 236 -174 303 -342 16 -38 17 -460 22 -5566 l5 -5525 4515 0 4515 0 70 22 c199 63 354 229 400 427 13 57 15 1134 13 9128 l-3 9063 -27 74 c-47 129 -92 183 -338 403 -124 110 -520 487 -880 837 -902 876 -5172 5025 -7480 7266 -1048 1017 -2065 2005 -2260 2195 -1519 1480 -2138 2076 -2193 2111 -85 55 -172 80 -287 84 -52 2 -106 1 -120 -1z"/></g></svg>'
                    : '<svg class="land-icon" version="1.0" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" viewBox="88.83 185.17 623.38 430.83"><g transform="translate(0.000000,800.000000) scale(0.100000,-0.100000)" stroke="none"><path d="M3075 6130 c-235 -60 -440 -225 -550 -444 -69 -138 -88 -223 -88 -391 0 -228 45 -400 173 -660 132 -270 308 -509 620 -845 l51 -55 90 95 c50 52 144 162 210 243 481 595 655 1151 487 1555 -97 233 -295 413 -543 492 -103 33 -337 38 -450 10z m342 -415 c28 -13 69 -42 91 -64 151 -156 108 -413 -86 -508 -49 -24 -69 -28 -142 -28 -73 0 -92 4 -137 28 -157 82 -221 258 -150 412 16 33 40 73 55 89 94 100 242 129 369 71z"/><path d="M2672 4123 c-62 -80 -711 -905 -811 -1031 -58 -74 -110 -140 -114 -148 -7 -12 109 -14 822 -14 l830 0 222 288 c123 158 268 346 324 417 55 72 137 177 180 233 44 57 112 145 152 195 l71 92 -246 3 -247 3 -25 -33 c-162 -209 -378 -457 -474 -546 -67 -62 -82 -59 -188 46 -114 110 -270 286 -377 425 -45 59 -84 107 -86 107 -2 0 -16 -17 -33 -37z"/><path d="M4339 3883 c-118 -153 -219 -284 -223 -290 -6 -10 262 -13 1327 -13 l1335 0 158 268 c87 147 164 277 172 290 l14 22 -1284 0 -1284 0 -215 -277z"/><path d="M3484 2778 c-274 -354 -544 -703 -602 -777 -57 -74 -106 -140 -109 -148 -4 -11 234 -13 1488 -11 l1494 3 462 784 c255 431 463 786 463 788 0 1 -607 3 -1349 3 l-1350 0 -497 -642z"/><path d="M1255 2324 c-192 -245 -356 -454 -364 -464 -13 -20 -6 -20 826 -20 l838 0 350 451 c193 249 354 458 358 465 7 12 -123 14 -825 14 l-833 -1 -350 -445z"/></g></svg>'
                }
            </div>

            <div class="deal-address">
                <span>${deal.address.streetNumber ? `${deal.address.streetNumber} ` : ''}${deal.address.streetName ? `${deal.address.streetName}, ` : ''}${deal.address.city ? `${deal.address.city}, ` : ''}${deal.address.state ? `${deal.address.state} `: ''}${deal.address.zip || ''}</span>
            </div>

            <div class="deal-author">
                <span class>${deal.post.author.name}</span>
            </div>

            <div class="deal-asking">
                <span class="deal-info-field">Asking: </span>
                <span class="deal-info-value">${deal.price ? (deal.price >= 1000000 ? `$${(deal.price / 1000000).toFixed(3)}M` : `$${deal.price.toLocaleString('en-US')}`) : '?'}</span>
            </div>

                ${deal.category === 'SFH Deal' ? /*html*/`
                <div class="deal-ratio">
                    <span class="deal-info-field">Price/ARV: </span>
                    <span class="deal-info-value ${deal.priceToARV ? (deal.priceToARV.toFixed(2) > 0.65 ? 'red' : deal.priceToARV.toFixed(2) > 0.45 ? 'yellow' : 'green') : ''}">
                        ${deal.priceToARV ? `${Math.round(deal.priceToARV * 100)}%` : '?'}
                    </span>
                </div>

                <div class="deal-arv">
                    <span class="deal-info-field">Est. ARV: </span>
                    <span class="deal-info-value">${deal.arv ? (deal.arv >= 1000000 ? `$${(deal.arv / 1000000).toFixed(3)}M` : `$${deal.arv.toLocaleString('en-US')}`) : '?'}</span>
                </div>
            ` : ''}

            <div class="deal-label ${deal.label.toLowerCase()}">
                <span class="deal-info-value">${deal.label}</span>
            </div>

            <div class="deal-date">
                <span class="deal-info-value">${new Date(deal.post.createdAt).toLocaleString('en-US', { year: '2-digit', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true, })}</span>
            </div>
        </div>
    `).on('click', event => {
        const url = new URL(window.location.href)
        url.searchParams.set('id', event.currentTarget.id)
        
        window.history.replaceState({}, '', url.toString())

        $('deal-view')[0].renderDeal(event.currentTarget.id)
    })
}
