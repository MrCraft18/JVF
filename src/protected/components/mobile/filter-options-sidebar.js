class FilterOptionsSidebar extends HTMLElement {
    constructor() {
        super()

        this.attachShadow({ mode: 'open' })

        this.$shadowRoot = $(this.shadowRoot)

        const styles = /*css*/`
            input {
	            padding: 0px;
	            margin: 0px;
	            border: 0px;
            }

            input[type="number"]::-webkit-outer-spin-button,
            input[type="number"]::-webkit-inner-spin-button {
                -webkit-appearance: none;
                margin: 0;
            }

            input[type="number"] {
                -moz-appearance: textfield;
            }

            input:focus {
            	outline: none;
            }

            h5 {
                margin: 0px;
            }

            .background {
                position: absolute;
                top: 0px;
                left: 0px;
                height: 100%;
                width: 100%;
                z-index: 999;
                background-color: rgba(0, 0, 0, 0.5);
                opacity: 0;
                display: none;
                transition: opacity 0.3s ease-in-out;
            }

            .sidebar-container {
                z-index: 1000;
                background-color: var(--dark-color-1);
                position: absolute;
                top: 0px;
                left: -80vw;
                height: 100%;
                width: 80vw;
                transition: left 0.3s ease-in-out;
                overflow-y: scroll;
            }

            .accordion-title {
                background-color: var(--color-4);
                padding: 0px 5vw;
                height: 7vh;
                display: flex;
                flex-direction: row;
                align-items: center;
                justify-content: space-between;
                color: white;
            }

            .sidebar-container svg {
                fill: white;
            }

            .accordion-title svg, .sub-accordion-title svg {
                aspect-ratio: 1 / 1;
                height: 25%;
                transition: transform 0.3s ease-in-out;
            }

            .accordion-content {
                background-color: var(--dark-color-1);
                color: var(--dark-color-2);
                display: grid;
                grid-template-rows: 0fr;
                transition: grid-template-rows 0.3s ease-in-out;
            }

            .accordion-content > div {
                overflow-y: hidden;
                background-color: inherit;
            }

            .accordion-item {
                background-color: inherit;
                height: 6vh;
                display: flex;
                flex-direction: row;
                align-items: center;
                justify-content: space-between;
                padding: 0px 8vw;
                font-size: 1.2rem;
            }

            .accordion-item:not(:last-child) {
                border-bottom: 1px solid var(--dark-color-9);
            }

            .sub-accordion-title {
                justify-content: space-between;
                background-color: var(--dark-color-9);
            }

            .search {
                justify-content: space-around;
                padding: 0px;
            }

            .search input {
                height: 60%;
                width: 50%;
                border-radius: 8px;
                padding-left: 9px;
                font-size: 1rem;
                background-color: var(--dark-color-8);
                color: white;
            }

            .toggle-all {
                height: 60%;
                width: 30%;
                border-radius: 8px;
                padding: 0px 9px;
                display: grid;
                place-items: center;
                color: white;
                background-color: var(--color-4);
                white-space: nowrap;
                font-size: 4.2vw;
            }

            .content-search-container {
                max-height: 44vh;
                overflow-y: scroll;
            }

            .number-input {
                width: 15%;
                height: 50%;
                padding: 0px 5px;
                font-size: 1rem;
                font-weight: 500;
                border-radius: 8px;
                border: 2px solid rgb(150, 150, 150);
                background-color: var(--dark-color-8);
                color: var(--dark-color-2);
            }

            .remove {
                height: 55%;
                background-color: red;
                border-radius: 6px;
                padding: 6px;
                box-sizing: border-box;
            }

            .hover:hover:active {
                filter: brightness(90%);
                cursor: pointer;
            }
        `

        this.$shadowRoot.append(/*html*/`
            <style>${styles}</style>
        `)
    }

    async connectedCallback() {
        if (this.hasRendered) return this.reinsertedCallback()

        window.savedQueryPromise = api.get('/user').then(response => response.data.dealsQuery)
        .catch(error => {
            console.error('Request Error:', error)

            $('<notification-banner></notification-banner>')[0].apiError(error, 'Get User Query')
        })

        const savedQuery = await window.savedQueryPromise

        const DealsList = $('deals-list')[0]

        if (savedQuery) DealsList.fetchAndInsertDeals(savedQuery) 

        window.optionsPromise = api.get(`/queryOptions${savedQuery?.blacklistedStates ? `?blacklistedStates=${savedQuery.blacklistedStates}` : ''}`).then(response => response.data)
        .catch(error => {
            console.error('Request Error:', error)

            $('<notification-banner></notification-banner>')[0].apiError(error, 'Get Options')
        })

        const options = await window.optionsPromise

        this.$shadowRoot.append(/*html*/`
            <div class="background"></div>
            
            <div class="sidebar-container">
                <div class="accordion-title" group="dealTypes">
                    <h4>Deal Types</h4>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="6.4 8.98 11.2 6.62"><path d="m8.12 9.29 3.88 3.88 3.88-3.88c.39-.39 1.02-.39 1.41 0s.39 1.02 0 1.41l-4.59 4.59c-.39.39-1.02.39-1.41 0l-4.59-4.59c-.39-.39-.39-1.02 0-1.41.39-.38 1.03-.39 1.42 0z"></path></svg>
                </div>
                <div class="accordion-content">
                    <div>
                        <div class="accordion-item toggle hover" key="SFH Deal">
                            <h5>SFH Deal</h5>
                            <input type="checkbox" ${savedQuery?.dealTypes?.includes('SFH Deal') || !savedQuery ? 'checked' : ''}>
                        </div>

                        <div class="accordion-item toggle hover" key="Land Deal">
                            <h5>Land Deal</h5>
                            <input type="checkbox" ${savedQuery?.dealTypes?.includes('Land Deal') || !savedQuery ? 'checked' : ''}>
                        </div>
                    </div>
                </div>

                <div class="accordion-title" group="labels">
                    <h4>Labels</h4>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="6.4 8.98 11.2 6.62"><path d="m8.12 9.29 3.88 3.88 3.88-3.88c.39-.39 1.02-.39 1.41 0s.39 1.02 0 1.41l-4.59 4.59c-.39.39-1.02.39-1.41 0l-4.59-4.59c-.39-.39-.39-1.02 0-1.41.39-.38 1.03-.39 1.42 0z"></path></svg>
                </div>
                <div class="accordion-content">
                    <div>
                        ${options.labels.map(label => /*html*/`
                            <div class="accordion-item toggle hover" key="${label}">
                                <h5>${label}</h5>
                                <input type="checkbox" ${savedQuery?.dealTypes?.includes('SFH Deal') || !savedQuery ? 'checked' : ''}>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="accordion-title" group="neededInfo">
                    <h4>Needed Info</h4>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="6.4 8.98 11.2 6.62"><path d="m8.12 9.29 3.88 3.88 3.88-3.88c.39-.39 1.02-.39 1.41 0s.39 1.02 0 1.41l-4.59 4.59c-.39.39-1.02.39-1.41 0l-4.59-4.59c-.39-.39-.39-1.02 0-1.41.39-.38 1.03-.39 1.42 0z"></path></svg>
                </div>
                <div class="accordion-content">
                    <div>
                        <div class="accordion-item sub-accordion-title" key="neededSFHInfo">
                            <h5>SFH Deals</h5>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="6.4 8.98 11.2 6.62"><path d="m8.12 9.29 3.88 3.88 3.88-3.88c.39-.39 1.02-.39 1.41 0s.39 1.02 0 1.41l-4.59 4.59c-.39.39-1.02.39-1.41 0l-4.59-4.59c-.39-.39-.39-1.02 0-1.41.39-.38 1.03-.39 1.42 0z"></path></svg>
                        </div>
                        <div class="accordion-content">
                            <div>
                                <div class="accordion-item toggle hover" key="street">
                                    <h5>Street</h5> <input type="checkbox" ${savedQuery?.neededSFHInfo?.includes('street') ? 'checked' : ''}>
                                </div>

                                <div class="accordion-item toggle hover" key="city">
                                    <h5>City</h5>
                                    <input type="checkbox" ${savedQuery?.neededSFHInfo?.includes('city') ? 'checked' : ''}>
                                </div>

                                <div class="accordion-item toggle hover" key="state">
                                    <h5>State</h5>
                                    <input type="checkbox" ${savedQuery?.neededSFHInfo?.includes('state') ? 'checked' : ''}>
                                </div>

                                <div class="accordion-item toggle hover" key="zip">
                                    <h5>Zip</h5>
                                    <input type="checkbox" ${savedQuery?.neededSFHInfo?.includes('zip') ? 'checked' : ''}>
                                </div>

                                <div class="accordion-item toggle hover" key="price">
                                    <h5>Price</h5>
                                    <input type="checkbox" ${savedQuery?.neededSFHInfo?.includes('price') ? 'checked' : ''}>
                                </div>

                                <div class="accordion-item toggle hover" key="arv">
                                    <h5>ARV</h5>
                                    <input type="checkbox" ${savedQuery?.neededSFHInfo?.includes('arv') ? 'checked' : ''}>
                                </div>
                            </div>
                        </div>

                        <div class="accordion-item sub-accordion-title" key="neededLandInfo">
                            <h5>Land Deals</h5>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="6.4 8.98 11.2 6.62"><path d="m8.12 9.29 3.88 3.88 3.88-3.88c.39-.39 1.02-.39 1.41 0s.39 1.02 0 1.41l-4.59 4.59c-.39.39-1.02.39-1.41 0l-4.59-4.59c-.39-.39-.39-1.02 0-1.41.39-.38 1.03-.39 1.42 0z"></path></svg>
                        </div>
                        <div class="accordion-content">
                            <div>
                                <div class="accordion-item toggle hover" key="street">
                                    <h5>Street</h5>
                                    <input type="checkbox" ${savedQuery?.neededLandInfo?.includes('street') ? 'checked' : ''}>
                                </div>

                                <div class="accordion-item toggle hover" key="city">
                                    <h5>City</h5>
                                    <input type="checkbox" ${savedQuery?.neededLandInfo?.includes('city') ? 'checked' : ''}>
                                </div>

                                <div class="accordion-item toggle hover" key="state">
                                    <h5>State</h5>
                                    <input type="checkbox" ${savedQuery?.neededLandInfo?.includes('state') ? 'checked' : ''}>
                                </div>

                                <div class="accordion-item toggle hover" key="zip">
                                    <h5>Zip</h5>
                                    <input type="checkbox" ${savedQuery?.neededLandInfo?.includes('zip') ? 'checked' : ''}>
                                </div>

                                <div class="accordion-item toggle hover" key="price">
                                    <h5>Price</h5>
                                    <input type="checkbox" ${savedQuery?.neededLandInfo?.includes('price') ? 'checked' : ''}>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="accordion-title" group="states">
                    <h4>States</h4>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="6.4 8.98 11.2 6.62"><path d="m8.12 9.29 3.88 3.88 3.88-3.88c.39-.39 1.02-.39 1.41 0s.39 1.02 0 1.41l-4.59 4.59c-.39.39-1.02.39-1.41 0l-4.59-4.59c-.39-.39-.39-1.02 0-1.41.39-.38 1.03-.39 1.42 0z"></path></svg>
                </div>
                <div class="accordion-content">
                    <div>
                        <div class="accordion-item search">
                            <input type="text" placeholder="Search">
                            <div class="toggle-all">Toggle All</div>
                        </div>
                        <div class="content-search-container">
                            ${options.states.map(state => /*html*/`
                                <div class="accordion-item toggle hover" key="${state}">
                                    <h5>${state}</h5>
                                    <input type="checkbox" ${!savedQuery?.blacklistedStates?.includes(state) ? 'checked' : ''}>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>

                <div class="accordion-title" group="cities">
                    <h4>Cities</h4>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="6.4 8.98 11.2 6.62"><path d="m8.12 9.29 3.88 3.88 3.88-3.88c.39-.39 1.02-.39 1.41 0s.39 1.02 0 1.41l-4.59 4.59c-.39.39-1.02.39-1.41 0l-4.59-4.59c-.39-.39-.39-1.02 0-1.41.39-.38 1.03-.39 1.42 0z"></path></svg>
                </div>
                <div class="accordion-content">
                    <div>
                        <div class="accordion-item search">
                            <input type="text" placeholder="Search">
                            <div class="toggle-all">Toggle All</div>
                        </div>
                        <div class="content-search-container">
                            ${options.cities.map(city => /*html*/`
                                <div class="accordion-item toggle hover" key="${city}">
                                    <h5>${city}</h5>
                                    <input type="checkbox" ${!savedQuery?.blacklistedStates?.includes(city) ? 'checked' : ''}>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>

                <div class="accordion-title" group="postedAge">
                    <h4>Posted Age</h4>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="6.4 8.98 11.2 6.62"><path d="m8.12 9.29 3.88 3.88 3.88-3.88c.39-.39 1.02-.39 1.41 0s.39 1.02 0 1.41l-4.59 4.59c-.39.39-1.02.39-1.41 0l-4.59-4.59c-.39-.39-.39-1.02 0-1.41.39-.38 1.03-.39 1.42 0z"></path></svg>
                </div>
                <div class="accordion-content">
                    <div>
                        <div class="accordion-item number" key="daysOld">
                            <h5>Newer Than Days</h5>
                            <input type="number" class="number-input">
                        </div>
                    </div>
                </div>

                <div class="accordion-title" group="blacklisted-authors">
                    <h4>Blocked Authors</h4>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="6.4 8.98 11.2 6.62"><path d="m8.12 9.29 3.88 3.88 3.88-3.88c.39-.39 1.02-.39 1.41 0s.39 1.02 0 1.41l-4.59 4.59c-.39.39-1.02.39-1.41 0l-4.59-4.59c-.39-.39-.39-1.02 0-1.41.39-.38 1.03-.39 1.42 0z"></path></svg>
                </div>
                <div class="accordion-content">
                    <div>
                        ${savedQuery.blacklistedAuthors.map(author => /*html*/`
                            <div class="accordion-item active" key="${author.id}">
                                <h5>${author.name}</h5>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="remove hover" viewBox="4.47 4.47 7.05 7.05"><path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/></svg>
                            </div>
                        `).join('')}

                        ${!savedQuery.blacklistedAuthors.length ? /*html*/`<div class="accordion-item no-blocked-authors">No Blocked Authors</div>` : ''}
                    </div>
                </div>
            </div>
        `)

        this.$shadowRoot.find('.background').on('click', event => {
            const background = $(event.target)
            const sidebarContainer = this.$shadowRoot.find('.sidebar-container')

            sidebarContainer.css({ left: '-80vw' })
            background.css({ opacity: '0' })

            event.target.addEventListener('transitionend', () => {
                background.hide()
            }, { once: true })

            //Add custom event
            this.dispatchEvent(new Event('sidebarClose'))
        })

        this.$shadowRoot.find('.accordion-title, .sub-accordion-title').on('click', event => {
            const title = $(event.currentTarget)
            const content = $(event.currentTarget).next('.accordion-content')

            if (content.height() > 0) {
                title.find('svg').css({ transform: 'rotate(0deg)' })

                content.css({ 'grid-template-rows': '0fr' })
            } else {
                title.find('svg').css({ transform: 'rotate(-180deg)' })

                content.css({ 'grid-template-rows': '1fr' })
            }
        })

        this.setAccordionItemEventListeners()

        this.$shadowRoot.find('.search').on('input', event => {
            const inputText = event.target.value.toLowerCase()

            const itemsContainer = $(event.target).parent().next()

            if (inputText === "") {
                itemsContainer.find('> [key]').show()
            } else {
                itemsContainer.find('> [key]').each((_, element) => {
                    if (!$(element).text().toLowerCase().includes(inputText)) {
                        $(element).hide()
                    } else {
                        $(element).show()
                    }
                })
            }
        })

        this.$shadowRoot.find('.toggle-all').on('click', event => {
            const itemsContainer = $(event.target).parent().next()

            const totalItems = itemsContainer.children().length
            const checkedItems = itemsContainer.children().filter((_, element) => $(element).find('input').prop('checked')).length

            itemsContainer.children().each((_, element) => {
                const inputElement = $(element).find('input')[0]
                inputElement.checked = (totalItems / 2) > checkedItems
            })

            this.dispatchEvent(new CustomEvent('valueChange', {
                detail: { group: $(event.target).closest('.search').parent().parent().prev()[0].getAttribute('group'), key: null, value: null }
            }))
        })

        this.$shadowRoot.find('.active > svg').on('click', event => {
            const group = $(event.target).closest('.accordion-content').prev()[0].getAttribute('group')

            $(event.currentTarget).closest('.accordion-item').remove()

            this.dispatchEvent(new CustomEvent('valueChange', {
                detail: { group, key: null, value: null }
            }))
        })

        $(this).on('valueChange', event => {
            //If state options is changed then update the city options list for available cities of selected states
            if (event.detail.group === 'states') {
                const selectedStates = this.getGroupItems('states')
                .filter(item => item.value === true)
                .map(item => item.key)
                .join(',')

                api.get(`/cityOptions?states=${selectedStates}`).then(response => {
                    const cities = response.data

                    const citiesGroupElement = this.$shadowRoot.find(`[group=${group}]`).next('content-search-container')

                    citiesGroupElement.html(cities.map(city => /*html*/`
                        <div class="option-item toggle hover" key="${city}">
                            <h4>${city}</h4>
                            <input type="checkbox" ${!savedQuery?.blacklistedCities?.includes(city) ? 'checked' : ''}>
                        </div>
                    `).join(''))

                    this.setOptionItemEventListeners(citiesGroupElement)
                })
            }
        })

        if (!savedQuery) DealsList.fetchAndInsertDeals(DealsList.getQueryParameters())

        DealsList.insertDealCounts(DealsList.getQueryParameters())

        this.hasRendered = true
    }

    setAccordionItemEventListeners(element) {
        const parentElement = element || this.$shadowRoot

        parentElement.find('input[type="checkbox"]').off('click').on('click', event => {
            event.stopPropagation()
        })

        parentElement.find('.accordion-item').has('> input[type="checkbox"]').off('click').on('click', event => {
            const checkbox = $(event.currentTarget).find('input')[0]

            checkbox.checked = !checkbox.checked

            checkbox.dispatchEvent(new Event('change'))
        })

        parentElement.find('[key] > input').off('change').on('change', event => {
            const input = $(event.target)

            const group = input.closest('.accordion-content').prev()[0].getAttribute('group')

            const key = input.closest('.accordion-item')[0].getAttribute('key')

            const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value

            this.dispatchEvent(new CustomEvent('valueChange', {
                detail: { group, key, value }
            }))
        })
    }

    openSidebar() {
        const background = this.$shadowRoot.find('.background')
        const sidebarContainer = this.$shadowRoot.find('.sidebar-container')

        background.css({ display: 'block' })

        setTimeout(() => {
            background.css({ opacity: '1' })
        }, 5)

        sidebarContainer.css({ left: '0px' })
    }

    getGroupItems(group) {
        return this.$shadowRoot.find(`[group="${group}"]`).next().find('.accordion-item').map((_, element) => {
            if ($(element).hasClass('toggle')) {
                return {
                    key: element.getAttribute('key'),
                    value: $(element).find('input')[0].checked
                }
            }

            if ($(element).hasClass('number')) {
                return {
                    key: element.getAttribute('key'),
                    value: $(element).find('input')[0].value
                }
            }

            if ($(element).hasClass('active')) {
                return {
                    key: element.getAttribute('key'),
                    value: $(element).find('h5').text()
                }
            }
        }).get()
    }

    getItemValue(group, key) {
        const input = this.$shadowRoot.find(`[group="${group}"]`).next().find(`[key="${key}"]`).find('input')[0]

        return input.type === 'checkbox' ? input.checked : input.value
    }

    reinsertedCallback() {

    }
}

customElements.define('filter-options-sidebar', FilterOptionsSidebar)
