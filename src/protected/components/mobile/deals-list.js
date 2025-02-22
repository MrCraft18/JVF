import './sorting-dropdown.js'
import './deal-view.js'
import './notification-banner.js'

class DealsList extends HTMLElement {
    constructor() {
        super()

        this.attachShadow({ mode: 'open' })

        this.$shadowRoot = $(this.shadowRoot)

        const styles = /*css*/`
            :host {
                position: fixed;
                top: ${$('title-bar').outerHeight()}px;
                bottom: 0px;
                width: 100%;
                display: flex;
                flex-direction: column;
                align-items: center;
                max-height: calc(100vh - ${$('title-bar').outerHeight()}px);
                z-index: 1;
                background-color: var(--dark-color-1);
            }

            #top-bar {
                background-color: var(--dark-color-1);
                width: 100%;
                height: 13vh;
                display: grid;
                grid-template-rows: 2fr 2fr 1fr;
                grid-template-columns: 1fr;
                flex-shrink: 0;
                align-items: center;
                justify-items: center;
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
                align-self: center;
                width: 85%;
                height: 4vh;
                border-radius: 8px;
                font-size: 100%;
                padding: 0.5vw 3vw;
                color: white;
                background-color: var(--dark-color-8);
            }

            #searchbar:focus {
                outline: 2px solid rgb(64, 46, 122);
            }

            #options-container {
                height: 4vh;
                width: 100%;
                display: flex;
                flex-direction: row;
                justify-content: space-around;
                --option-button-background-color: var(--color-4);
                --option-button-border-radius: 8px;
                --option-button-height: 100%;
                --option-button-padding: 3vw;
                --option-button-border-radius: 100px;
            }

            #filter-button {
                background-color: var(--option-button-background-color);
                border-radius: var(--option-button-border-radius);
                height: var(--option-button-height);
                padding-left: var(--option-button-padding);
                padding-right: 4vw;
                display: flex;
                flex-direction: row;
                justify-content: center;
                align-items: center;
                color: white;
            }

            #filter-button h4 {
                margin: 0px;
                margin-left: 4vw;
            }

            #filter-button svg {
                aspect-ratio: 1 / 1;
                height: 60%;
                fill: white;
            }

            .hover:hover:active {
                cursor: pointer;
                filter: brightness(90%);
            }

            #sort-by {
                height: var(--option-button-height);
                --dropdown-button-background-color: var(--option-button-background-color);
                --dropdown-button-padding: var(--option-button-padding);
                --dropdown-button-border-radius: var(--option-button-border-radius);
                --dropdown-options-border-radius: 10px;
                --dropdown-options-margin-top: 0.8vh;
                --dropdown-item-font-size: 0.9rem;
            }

            #deal-count {
                color: var(--dark-color-2);
                font-size: 1.2rem;
                font-weight: 500;
            }

            #list-container {
                overflow-y: scroll;
                    height: 100%;
            }

            .deal-list-item {
                background-color: var(--dark-color-1);
                color: var(--dark-color-2);
                width: 100%;
                height: 120px;
                padding: 1vw;
                font-size: 1.1rem;
                box-sizing: border-box;
                display: grid;
                grid-template-rows: 1fr 1fr 1fr 1fr;
                grid-template-columns: 1fr 4.5fr 4.5fr;
            }

            .deal-list-item > div {
                box-sizing: border-box;
                overflow: hidden;
            }

            .deal-list-item > div:not(.icons-container), .icons-container > svg {
                background-color: inherit;
                filter: brightness(95%);
            }

            .deal-list-item > div:not(.icons-container) {
                margin: auto 0.8vw;
                padding: 0.1vh 1.5vw;
                border-radius: 4px;
            }

            .icons-container {
                background-color: inherit;
                display: flex;
                flex-direction: column;
                justify-content: space-around;
                align-items: center;
                grid-area: 1 / 1 / 5 / 2;
            }

            .icons-container > svg, .checkbox-container {
                height: 30%;
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

            .checkbox-container {
                border: 2px solid var(--dark-color-8);
                overflow: hidden;
            }

            .check {
                height: 100%;
                width: 100%;
                background-color: var(--dark-color-9);
                display: flex;
                justify-content: center;
                align-items: center;
            }

            .check svg {
                fill: var(--dark-color-2);
                height: 70%;
                width: 70%;
            }

            .deal-address, .deal-author, .deal-asking, .deal-arv, .deal-ratio, .deal-date, .deal-label {
                display: flex;
                min-width: 0px;
                align-items: center;
            }

            .deal-address {
                font-size: 4.5vw;
                font-weight: 800;
                grid-area: 1 / 2 / 2 / 4;
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
                font-size: 4vw;
                font-weight: 400;
            }

            .deal-info-value {
                font-size: 4.5vw;
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
        $('title-bar')[0].backButton = false

        if (this.hasRendered) return this.reinsertedCallback() //Add function to only call when this is true. This should only occur when its reinstated from a cache.

        const savedQuery = await window.savedQueryPromise

        console.log(savedQuery)

        this.$shadowRoot.append(/*html*/`
            <div id="top-bar">
                <input id="searchbar" type="text" placeholder="Search">

                <div id="options-container">
                    <div id="filter-button" class="hover">
                        <!-- Filter SVG -->
                         <svg viewBox="4 4 40.02 40"><g id="Layer_2" data-name="Layer 2"><g id="invisible_box" data-name="invisible box"><rect width="48" height="48" fill="none" /></g><g id="icons_Q2" data-name="icons Q2"><path d="M41.8,8H21.7A6.2,6.2,0,0,0,16,4a6,6,0,0,0-5.6,4H6.2A2.1,2.1,0,0,0,4,10a2.1,2.1,0,0,0,2.2,2h4.2A6,6,0,0,0,16,16a6.2,6.2,0,0,0,5.7-4H41.8A2.1,2.1,0,0,0,44,10,2.1,2.1,0,0,0,41.8,8Z"/><path d="M41.8,22H37.7A6.2,6.2,0,0,0,32,18a6,6,0,0,0-5.6,4H6.2a2,2,0,1,0,0,4H26.4A6,6,0,0,0,32,30a6.2,6.2,0,0,0,5.7-4h4.1a2,2,0,1,0,0-4Z"/><path d="M41.8,36H24.7A6.2,6.2,0,0,0,19,32a6,6,0,0,0-5.6,4H6.2a2,2,0,1,0,0,4h7.2A6,6,0,0,0,19,44a6.2,6.2,0,0,0,5.7-4H41.8a2,2,0,1,0,0-4Z"/></g></g></svg>

                        <h4>Filter</h4>
                    </div>

                    <sorting-dropdown
                        id="sort-by"
                        defaultOption="${savedQuery?.sort || 'Date'}"
                        options="Date Asking ARV Price/ARV"
                        defaultOrder="${savedQuery?.order || 'descending'}"
                    ></sorting-dropdown>
                </div>

                <span id="deal-count">...</span>
            </div>

            <div id="list-container"></div>
        `)

        this.$shadowRoot.find('#filter-button').on('click', () => {
            $('filter-options-sidebar')[0].openSidebar()
        })

        let sidebarOptionChanged = false

        $('filter-options-sidebar').on('valueChange', () => {
            sidebarOptionChanged = true
        })

        $('filter-options-sidebar').on('sidebarClose', () => {
            if (sidebarOptionChanged) this.refreshDealsList()
            sidebarOptionChanged = false
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

            //And not already loading new deals
            if (listContainerDiv.scrollHeight - scrollPos <= threshold && !this.loadingDeals && this.next !== null) {
                this.fetchAndInsertDeals(this.getQueryParameters())
            }
        })

        this.hasRendered = true
    }

    getQueryParameters() {
        const FilterOptionsSidebar = $('filter-options-sidebar')[0]
        const SortingDropdown = this.$shadowRoot.find('sorting-dropdown')[0]

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

        if (FilterOptionsSidebar.getItemValue('postedAge', 'daysOld')) body.daysOld = FilterOptionsSidebar.getItemValue('postedAge', 'daysOld')

        return body
    }

    async fetchAndInsertDeals(body) {
        this.loadingDeals = true

        if (this.next) body.next = this.next

        api.post('/deals', body).then(response => {
            const { deals, next } = response.data

            this.next = next

            console.log(deals)

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
        this.loadingDeals = true

        const body = this.getQueryParameters()

        body.limit = this.$shadowRoot.find('#list-container').children().length

        api.post('/deals', body).then(response => {
            const { deals, next } = response.data

            this.next = next

            console.log(deals)

            const listContainerDivContent = $()

            if (deals.length) {
                for (const deal of deals) {
                    listContainerDivContent.push(dealDiv(deal)[0])
                }

                this.$shadowRoot.find('#list-container').html(listContainerDivContent)
            } else {
                listContainerDiv.html(/*html*/`
                    <div id="meme">
                        <img src="https://i.imgflip.com/8zyf2r.jpg"/>
                    </div>
                `)
            }

            this.loadingDeals = false
        })
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

                <div class="checkbox-container">
                    ${
                        deal.verified ? /*html*/`
                            <div class="check ${deal.category === 'SFH Deal' ? 'sfh' : 'land'}">
                                <svg xmlns="http://www.w3.org/2000/svg" class="bi bi-check" viewBox="4.08 4.75 8.17 6.5"><path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425z"/></svg>
                            </div>
                        ` : ''
                    }
                </div>
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

        $('deal-view').css('z-index', '2')

        $('deal-view')[0].populateDeal()

        //pushHistoryState(`/deals-list/deal?id=${event.currentTarget.id}`)
        // Add deal-view
        //history.customCache[window.location.href] = $('body').contents()
    })
}
