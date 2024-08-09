import './sorting-dropdown.js'
import './filter-options-sidebar.js'

class DealsList extends HTMLElement {
    constructor() {
        super()

        const styles = /*css*/`
            deals-list {
                position: fixed;
                top: ${$('title-bar').outerHeight()}px;
                bottom: ${$('nav-bar').outerHeight()}px;
                width: 100%;
                display: flex;
                flex-direction: column;
                max-height: calc(100vh - (${$('title-bar').outerHeight()}px + ${$('nav-bar').outerHeight()}px));
                z-index: 1;
            }

            #top-bar {
                background-color: var(--primary-color);
                width: 100%;
                height: 10vh;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                flex-shrink: 0;
                align-items: center;
                padding-top: 1vh;
                padding-bottom: 1vh;
            }

            #searchbar {
                width: 85%;
                height: 3.5vh;
                border-radius: 8px;
                font-size: 100%;
                padding: 0.5vw;
                padding-left: 3vw;
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
                --option-button-background-color: var(--highlight-color);
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
            }

            #filter-button h4 {
                margin: 0px;
                margin-left: 4vw;
            }

            #filter-button svg {
                aspect-ratio: 1 / 1;
                height: 60%;
            }

            .hover:hover:active {
                cursor: pointer;
                filter: brightness(95%);
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

            #list-container {
                width: 100%;
                overflow-y: scroll;
            }

            .deal-list-item {
                width: 100%;
                height: 120px;
                padding: 1vw;
                font-size: 1.1rem;
                box-sizing: border-box;
                background-color: rgb(75, 112, 245);
                display: grid;
                grid-template-rows: 1fr 1fr 1fr 1fr;
                grid-template-columns: 1fr 4.5fr 4.5fr;
            }

            .deal-list-item:not(:last-child) {
                border-bottom: solid rgba(76, 59, 207, 0.5) 2px;
            }

            .deal-list-item > div {
                overflow: hidden;
            }

            .deal-list-item > div:not(.icons-container) {
                margin: auto 0.8vw;
                padding: 0.1vh 1.5vw;
                background-color: var(--secondary-color);
                filter: brightness(85%);
                border-radius: 4px;
            }

            .icons-container {
                display: flex;
                flex-direction: column;
                justify-content: space-around;
                align-items: center;
                grid-area: 1 / 1 / 5 / 2;
            }

            .icons-container > svg {
                width: 85%;
                aspect-ratio: 1 / 1;
                box-sizing: border-box;
                padding: 4px;
                border-radius: 6px;
                background-color: var(--secondary-color);
                filter: brightness(85%);
            }

            .checkbox-container {
                width: 85%;
                aspect-ratio: 1 / 1;
                border-radius: 6px;
                border: 2px solid black;
                box-sizing: border-box;
                overflow: hidden;
            }

            .check {
                height: 100%;
                width: 100%;
                background-color: var(--secondary-color);
                filter: brightness(85%);
                display: flex;
                justify-content: center;
                align-items: center;
            }

            .check svg {
                height: 70%;
                width: 70%;
            }

            .deal-address {
                font-size: 1.2rem;
                display: flex;
                align-items: center;
                min-width: 0px;
                font-weight: 800;
                grid-area: 1 / 2 / 2 / 4;
            }

            .deal-author {
                display: flex;
                align-items: center;
                min-width: 0px;
                grid-area: 2 / 2 / 3 / 3;
            }

            .deal-asking {
                display: flex;
                justify-content: space-between;
                align-items: center;
                min-width: 0px;
                grid-area: 2 / 3 / 3 / 4;
            }

            .deal-arv {
                display: flex;
                justify-content: space-between;
                align-items: center;
                min-width: 0px;
                grid-area: 3 / 3 / 4 / 4;
            }

            .deal-ratio {
                display: flex;
                justify-content: space-between;
                align-items: center;
                min-width: 0px;
                grid-area: 3 / 2 / 4 / 3;
            }

            .deal-date {
                display: flex;
                justify-content: center;
                align-items: center;
                min-width: 0px;
                grid-area: 4 / 3 / 5 / 4;
            }

            .deal-label {
                display: flex;
                justify-content: center;
                align-items: center;
                min-width: 0px;
                grid-area: 4 / 2 / 5 / 3;
            }

            .deal-list-item span {
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
            }

            .deal-info-field {
                font-size: 1rem;
                font-weight: 400;
            }

            .deal-info-value {
                font-size: 1.1rem;
                font-weight: 500;
            }
        `

        $('head').append(/*html*/`
            <style>${styles}</style>
        `)
    }

    async connectedCallback() {
        //Get User query params and then set them in sorting-dropdown and filter-options-sidebar.

        const accessToken = await api.accessToken()

        const savedQuery = JSON.parse(atob(accessToken.split('.')[1])).user.dealsQuery

        this.innerHTML = /*html*/`
            <div id="top-bar">
                <input id="searchbar" type="text" placeholder="Search">
                <div id="options-container">
                    <div id="filter-button" class="hover">
                        <!-- Filter SVG -->
                         <svg viewBox="4 4 40.02 40">
                            <g id="Layer_2" data-name="Layer 2">
                                <g id="invisible_box" data-name="invisible box">
                                    <rect width="48" height="48" fill="none"/>
                                </g>
                                <g id="icons_Q2" data-name="icons Q2">
                                    <path d="M41.8,8H21.7A6.2,6.2,0,0,0,16,4a6,6,0,0,0-5.6,4H6.2A2.1,2.1,0,0,0,4,10a2.1,2.1,0,0,0,2.2,2h4.2A6,6,0,0,0,16,16a6.2,6.2,0,0,0,5.7-4H41.8A2.1,2.1,0,0,0,44,10,2.1,2.1,0,0,0,41.8,8Z"/>
                                    <path d="M41.8,22H37.7A6.2,6.2,0,0,0,32,18a6,6,0,0,0-5.6,4H6.2a2,2,0,1,0,0,4H26.4A6,6,0,0,0,32,30a6.2,6.2,0,0,0,5.7-4h4.1a2,2,0,1,0,0-4Z"/>
                                    <path d="M41.8,36H24.7A6.2,6.2,0,0,0,19,32a6,6,0,0,0-5.6,4H6.2a2,2,0,1,0,0,4h7.2A6,6,0,0,0,19,44a6.2,6.2,0,0,0,5.7-4H41.8a2,2,0,1,0,0-4Z"/>
                                </g>
                            </g>
                        </svg>

                        <h4>Filter</h4>
                    </div>

                    <sorting-dropdown
                        id="sort-by"
                        defaultOption="${savedQuery?.sort || 'Date'}"
                        options="Date Asking ARV Price/ARV"
                        defaultOrder="${savedQuery?.order || 'descending'}"
                    ></sorting-dropdown>
                </div>
            </div>

            <div id="list-container"></div>
        `

        $(this).append(/*html*/`
            <filter-options-sidebar></filter-options-sidebar>
        `)

        $('filter-options-sidebar')[0].createLayout([
            {
                title: 'Deal Types',
                group: 'dealTypes',
                items: [
                    {
                        label: 'SFH Deal',
                        key: 'SFH Deal',
                        type: 'checkbox',
                        value: savedQuery ? savedQuery.dealTypes.split(',').includes('SFH Deal') : true
                    },
                    {
                        label: 'Land Deal',
                        key: 'Land Deal',
                        type: 'checkbox',
                        value: savedQuery ? savedQuery.dealTypes.split(',').includes('Land Deal') : true
                    },
                ]
            },
            {
                title: 'Labels',
                group: 'labels',
                items: await api.get('/labelOptions').then(response => response.data.map(label => ({
                    label: label,
                    key: label,
                    type: 'checkbox',
                    value: savedQuery ? savedQuery.labels.split(',').includes(label) : true
                })))
            },
            {
                title: 'Needed Info',
                group: 'neededInfo',
                items: [
                    {
                        label: 'SFH Deals',
                        group: 'neededSFHInfo',
                        type: 'sub-accordion',
                        items: [
                            {
                                label: 'Street',
                                key: 'street',
                                type: 'checkbox',
                                value: savedQuery ? savedQuery.neededSFHInfo.split(',').includes('street') : false
                            },
                            {
                                label: 'City',
                                key: 'city',
                                type: 'checkbox',
                                value: savedQuery ? savedQuery.neededSFHInfo.split(',').includes('city') : false
                            },
                            {
                                label: 'State',
                                key: 'state',
                                type: 'checkbox',
                                value: savedQuery ? savedQuery.neededSFHInfo.split(',').includes('state') : false
                            },
                            {
                                label: 'Zip',
                                key: 'zip',
                                type: 'checkbox',
                                value: savedQuery ? savedQuery.neededSFHInfo.split(',').includes('zip') : false
                            },
                            {
                                label: 'Price',
                                key: 'price',
                                type: 'checkbox',
                                value: savedQuery ? savedQuery.neededSFHInfo.split(',').includes('price') : false
                            },
                            {
                                label: 'ARV',
                                key: 'arv',
                                type: 'checkbox',
                                value: savedQuery ? savedQuery.neededSFHInfo.split(',').includes('arv') : false
                            }
                        ]
                    },
                    {
                        label: 'Land Deals',
                        group: 'neededLandInfo',
                        type: 'sub-accordion',
                        items: [
                            {
                                label: 'Street',
                                key: 'street',
                                type: 'checkbox',
                                value: savedQuery ? savedQuery.neededLandInfo.split(',').includes('street') : false
                            },
                            {
                                label: 'City',
                                key: 'city',
                                type: 'checkbox',
                                value: savedQuery ? savedQuery.neededLandInfo.split(',').includes('city') : false
                            },
                            {
                                label: 'State',
                                key: 'state',
                                type: 'checkbox',
                                value: savedQuery ? savedQuery.neededLandInfo.split(',').includes('state') : false
                            },
                            {
                                label: 'Zip',
                                key: 'zip',
                                type: 'checkbox',
                                value: savedQuery ? savedQuery.neededLandInfo.split(',').includes('zip') : false
                            },
                            {
                                label: 'Price',
                                key: 'price',
                                type: 'checkbox',
                                value: savedQuery ? savedQuery.neededLandInfo.split(',').includes('price') : false
                            }
                        ]
                    }
                ]
            },
            {
                title: 'States',
                group: 'states',
                searchbar: true,
                items: await api.get('/stateOptions').then(response => response.data.map(state => ({
                    label: state,
                    key: state,
                    type: 'checkbox',
                    value: savedQuery ? savedQuery.states.split(',').includes(state) : true
                })))
            },
            {
                title: 'Cities',
                group: 'cities',
                searchbar: true,
                items: await api.get('/cityOptions').then(response => response.data.map(city => ({
                    label: city,
                    key: city,
                    type: 'checkbox',
                    value: savedQuery ? savedQuery.cities.split(',').includes(city) : true
                })))
            },
            {
                title: 'Posted Age',
                group: 'postedAge',
                items: [
                    {
                        label: 'Newer Than Days',
                        key: 'daysOld',
                        type: 'number',
                        value: savedQuery ? savedQuery.daysOld : ''
                    }
                ]
            },
            {
                title: 'Blacklisted Authors',
                group: 'blacklistedAuthors',
                searchbar: true,
                items: await api.get('/authorOptions').then(response => response.data
                    .sort((a, b) => a.name
                    .localeCompare(b.name)).map(author => ({
                        label: author.name,
                        key: author.id,
                        type: 'checkbox',
                        value: savedQuery ? savedQuery.blacklistedAuthors.split(',').includes(author.id) : false
                })))
            }
        ])

        $('#filter-button').on('click', () => {
            $('filter-options-sidebar')[0].openSidebar()
        })

        let sidebarOptionChanged = false

        $('filter-options-sidebar').on('sidebarClose', () => {
            if (sidebarOptionChanged) this.queryDeals()
            sidebarOptionChanged = false
        })

        $('filter-options-sidebar').on('valueChange', async event => {
            sidebarOptionChanged = true

            if (event.detail.group === 'states') {
                const FilterOptionsSidebar = document.querySelector('filter-options-sidebar')

                const selectedStates = FilterOptionsSidebar.getGroupItems('states')
                .filter(item => item.value === true)
                .map(item => item.key)
                .join(',')

                const cityItems = await api.get(`/cityOptions?states=${selectedStates}`).then(response => response.data.map(city => ({
                    label: city,
                    key: city,
                    type: 'checkbox',
                    value: true
                })))

                FilterOptionsSidebar.buildGroupItems('cities', cityItems, { searchbar: true })
            }
        })

        $('sorting-dropdown').on('orderToggle', () => {
            this.queryDeals()
        })

        $('sorting-dropdown').on('optionChange', () => {
            this.queryDeals()
        })

        this.queryDeals()
    }

    queryDeals() {
        const listContainerDiv = $('#list-container')

        listContainerDiv.html('')

        const FilterOptionsSidebar = document.querySelector('filter-options-sidebar')
        const SortingDropdown = document.querySelector('sorting-dropdown')

        const body = {
            limit: 30,
            sort: SortingDropdown.selectedOption,
            order: SortingDropdown.orderDirection,
        }

        for (const parameter of ['dealTypes', 'labels', 'neededSFHInfo', 'neededLandInfo', 'states', 'cities', 'blacklistedAuthors']) {
            body[parameter] = FilterOptionsSidebar.getGroupItems(parameter)
                .filter(item => item.value === true)
                .map(item => item.key)
                .join(',');
        }

        if (FilterOptionsSidebar.getItemValue('postedAge', 'daysOld')) body.daysOld = FilterOptionsSidebar.getItemValue('postedAge', 'daysOld')

        api.post('/deals', body).then(response => {
            const deals = response.data

            console.log(deals)

            for (const deal of deals) {
                listContainerDiv.append(/*html*/`
                    <div id="${deal._id}" class="deal-list-item hover">
                        <div class="icons-container">
                            ${
                                deal.category === 'SFH Deal' ?
                                '<svg version="1.0" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" viewBox="640.5 670.12 3838.98 3718.38"><g transform="translate(0.000000,5120.000000) scale(0.100000,-0.100000)" fill="#000000" stroke="none"><path d="M25365 44480 c-225 -49 -407 -146 -585 -314 -250 -237 -1655 -1569 -1750 -1661 -63 -61 -333 -317 -600 -570 -651 -618 -4235 -4021 -5175 -4914 l-530 -504 -3 1752 -2 1751 -2890 0 -2890 0 0 -4498 0 -4498 -642 -610 c-353 -335 -919 -872 -1258 -1194 -339 -322 -1004 -954 -1479 -1405 -922 -876 -948 -903 -1036 -1080 -88 -178 -120 -318 -120 -520 0 -325 107 -586 335 -816 393 -398 1012 -460 1473 -147 82 56 90 63 837 773 752 714 2231 2118 3565 3385 484 459 1150 1092 1480 1405 330 314 1541 1464 2690 2555 1150 1091 2356 2237 2680 2545 1121 1065 1786 1696 3275 3110 822 781 1801 1710 2174 2065 374 355 682 645 686 645 6 0 520 -486 1960 -1855 217 -207 935 -888 1595 -1515 1441 -1368 2037 -1934 2570 -2440 220 -210 1073 -1019 1895 -1800 1508 -1432 2372 -2252 3480 -3305 333 -316 1001 -951 1485 -1410 929 -882 2440 -2317 3565 -3385 371 -353 698 -662 727 -688 234 -206 564 -311 876 -278 277 30 514 144 707 340 168 170 266 350 316 581 23 106 25 342 5 445 -34 174 -111 346 -213 484 -65 86 -16 40 -4688 4476 -938 890 -2148 2040 -2690 2554 -542 515 -1433 1361 -1980 1881 -547 519 -1256 1192 -1575 1495 -319 303 -1079 1025 -1690 1605 -610 580 -1328 1262 -1595 1515 -465 442 -2592 2462 -3537 3359 -249 236 -485 454 -525 484 -96 72 -270 156 -394 189 -138 36 -393 43 -529 13z"/><path d="M25500 38924 c-57 -11 -129 -38 -189 -71 -61 -34 -126 -92 -451 -408 -69 -67 -357 -344 -640 -616 -2288 -2198 -4707 -4523 -4810 -4624 -69 -66 -474 -456 -900 -866 -702 -675 -2629 -2527 -5070 -4873 -503 -484 -977 -939 -1053 -1012 -148 -142 -210 -224 -248 -325 l-24 -64 -3 -9118 c-2 -8042 0 -9126 13 -9183 46 -198 201 -364 400 -427 l70 -22 4515 0 4515 0 5 5525 c5 5106 6 5528 22 5566 67 168 159 272 303 342 127 61 -158 57 3645 57 3803 0 3518 4 3645 -57 144 -70 236 -174 303 -342 16 -38 17 -460 22 -5566 l5 -5525 4515 0 4515 0 70 22 c199 63 354 229 400 427 13 57 15 1134 13 9128 l-3 9063 -27 74 c-47 129 -92 183 -338 403 -124 110 -520 487 -880 837 -902 876 -5172 5025 -7480 7266 -1048 1017 -2065 2005 -2260 2195 -1519 1480 -2138 2076 -2193 2111 -85 55 -172 80 -287 84 -52 2 -106 1 -120 -1z"/></g></svg>'
                                : '<svg version="1.0" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" viewBox="17.2 51.25 477.62 409.63"><g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)" fill="#000000" stroke="none"><path d="M2883 4599 c-210 -35 -391 -194 -465 -408 -19 -54 -23 -87 -23 -181 0 -99 4 -125 27 -187 l26 -73 -27 0 c-15 0 -54 -7 -86 -15 -173 -44 -320 -162 -393 -315 -51 -107 -66 -184 -59 -303 7 -115 34 -196 99 -293 84 -126 222 -219 372 -251 174 -37 377 17 507 134 l39 35 0 -686 0 -686 85 0 85 0 0 686 0 685 48 -39 c239 -199 578 -186 797 32 117 117 178 258 178 416 1 164 -51 296 -165 416 -88 92 -204 155 -323 175 -61 11 -75 16 -71 29 42 126 47 157 43 265 -6 128 -27 202 -89 296 -130 202 -368 308 -605 268z m178 -169 c115 -21 235 -105 293 -205 41 -69 59 -149 54 -240 -4 -75 -9 -91 -72 -226 -37 -79 -70 -150 -73 -156 -4 -10 12 -13 58 -13 35 0 115 -5 178 -10 137 -11 212 -42 295 -120 169 -160 171 -437 4 -603 -165 -166 -431 -167 -593 -3 -28 29 -85 110 -129 184 -43 73 -82 134 -86 137 -4 3 -46 -60 -93 -138 -123 -205 -203 -273 -356 -299 -166 -28 -347 57 -434 205 -88 150 -72 349 39 484 89 109 191 148 412 159 84 4 152 10 152 14 0 4 -29 68 -64 141 -35 74 -69 155 -75 181 -51 216 89 443 308 500 78 20 110 21 182 8z"/><path d="M683 1368 l-511 -853 1194 -3 c657 -1 1731 -1 2388 0 l1194 3 -511 853 -512 852 -342 0 -343 0 0 -85 0 -85 294 0 293 0 402 -669 c220 -368 404 -676 407 -685 6 -15 -181 -16 -2076 -16 -1895 0 -2082 1 -2076 16 3 9 187 317 407 685 l402 669 718 0 719 0 0 85 0 85 -768 0 -767 0 -512 -852z"/></g></svg>'
                            }

                            <div class="checkbox-container">
                                ${
                                    deal.verified ? /*html*/`
                                    <div class="check">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="bi bi-check" viewBox="4.08 4.75 8.17 6.5"><path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425z"/></svg>
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
                            <span class="deal-info-value">${deal.price ? (deal.price >= 1000000 ? `$${(deal.price / 1000000).toFixed(3)}M` : `$${deal.price.toLocaleString('en-US')}`) : 'Unknown'}</span>
                        </div>

                        ${deal.category === 'SFH Deal' ? /*html*/`
                            <div class="deal-ratio">
                                <span class="deal-info-field">Price/ARV: </span>
                                <span class="deal-info-value">${deal.priceToARV ? `${Math.round(deal.priceToARV * 100)}%` : 'Unknown'}</span>
                            </div>

                            <div class="deal-arv">
                                <span class="deal-info-field">Est. ARV: </span>
                                <span class="deal-info-value">${deal.arv ? (deal.arv >= 1000000 ? `$${(deal.arv / 1000000).toFixed(3)}M` : `$${deal.arv.toLocaleString('en-US')}`) : 'Unknown'}</span>
                            </div>
                        ` : ''}

                        <div class="deal-label">
                            <span class="deal-info-value">${deal.label}</span>
                        </div>

                        <div class="deal-date">
                            <span class="deal-info-value">${new Date(deal.post.createdAt).toLocaleString('en-US', { timeZone: 'America/Chicago', year: '2-digit', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true, })}</span>
                        </div>
                    </div>
                `)
            }

            listContainerDiv.find('.deal-list-item').on('click', event => {
                window.location.href = `/deal/?id=${event.currentTarget.id}`
            })
        })
    }
}

customElements.define('deals-list', DealsList)