class FilterOptionsSidebar extends HTMLElement {
    constructor() {
        super()

        this.attachShadow({ mode: "open" })

        this.$shadowRoot = $(this.shadowRoot)

        const styles = /*css*/`
            :host(*) {
                position: fixed;
                height: 100vh;
                width: 25vw;
                max-width: 400px;
                display: flex;
                flex-direction: column;
                /*background-color: var(--dark-color-9);*/
                border-right: 2px solid var(--dark-color-9);
                box-sizing: border-box;
            }

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

            h4 {
                margin: 0px;
            }

            .hover:hover {
                cursor: pointer;
                filter: brightness(90%);
            }

            #title {
                height: 13vh;
                width: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            #title > h1 {
                margin: auto;
                color: var(--dark-color-2);
                background-color: var(--dark-color-9);
                padding: 18px;
                border-radius: 6px;
            }

            #options-container {
                width: 100%;
                height: 100%;
                overflow-y: scroll;
                display: flex;
                flex-direction: column;
                align-items: center;
                color: var(--dark-color-2);
                padding-bottom: 6px;
            }

            .options-group {
                width: 90%;
                overflow: hidden;
                border-radius: 8px;
                flex-shrink: 0;
            }

            .options-group:not(:last-child) {
                margin-bottom: 12px;
            }

            .options-title, .sub-options-title {
                justify-content: center;
                padding: 14px 0px;
            }

            .options-title {
                background-color: var(--color-4);
            }

            .sub-options-title {
                background-color: var(--dark-color-9);
            }

            .option-item {
                flex-direction: row;
                align-items: center;
                background-color: var(--dark-color-9);
            }

            .toggle, .number {
                height: 50px;
                justify-content: space-between;
                padding: 0px 20px;
            }

            .number-input {
                width: 10%;
                height: 50%;
                padding: 0px 5px;
                font-size: 1rem;
                border-radius: 8px;
                border: 2px solid rgb(150, 150, 150);
                background-color: var(--dark-color-8);
                color: var(--dark-color-2);
            }

            .searchbar {
                height: 60px;
                justify-content: space-around;
            }

            .searchbar input {
                border-radius: 6px;
                height: 65%;
                width: 50%;
                padding-left: 6px;
                font-size: 1rem;
                background-color: var(--dark-color-8);
                color: white;
            }

            .toggle-all {
                background-color: var(--color-4);
                height: 65%;
                padding: 0px 14px;
                border-radius: 8px;
                display: flex;
                justify-content: center;
                align-items: center;
            }

            .search-content-container {
                width: 100%;
                max-height: 400px;
                overflow-y: scroll;
            }

            .options-title, .option-item, .sub-options-title {
                display: flex;
                flex-shrink: 0;
            }

            .sub-options-group {
                width: 100%;
            }
        `;

        this.$shadowRoot.append(/*html*/`
            <style>${styles}</style>
        `)
    }

    async connectedCallback() {
        if (this.hasRendered) return

        this.$shadowRoot.append(/*html*/`
            <div id="title">
                <h1>REventure</h1>
            </div> 
        `)

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
            <div id="options-container">
                <div class="options-group" group="dealTypes">
                    <div class="options-title"><h4>Deal Types</h4></div> 
                    <div class="option-item toggle hover" key="SFH Deal">
                        <h4>SFH Deal</h4>
                        <input type="checkbox" ${savedQuery?.dealTypes?.includes('SFH Deal') || !savedQuery ? 'checked' : ''}>
                    </div>
                    <div class="option-item toggle hover" key="Land Deal">
                        <h4>Land Deal</h4>
                        <input type="checkbox" ${savedQuery?.dealTypes?.includes('Land Deal') || !savedQuery ? 'checked' : ''}>
                    </div>
                </div>

                <div class="options-group" group="labels">
                    <div class="options-title"><h4>Labels</h4></div> 
                    ${options.labels.map(label => /*html*/`
                        <div class="option-item toggle hover" key="checked">
                            <h4>${label}</h4>
                            <input type="checkbox" ${!savedQuery?.blacklistedLabels?.includes(label) || !savedQuery ? 'checked' : ''}>
                        </div>
                    `).join('')}
                </div>

                <div class="options-group" group="neededInfo">
                    <div class="options-title"><h4>Needed Info</h4></div> 
                    <div class="sub-options-group" group="neededSFHInfo">
                        <div class="sub-options-title"><h4>SFH</h4></div>
                        <div class="option-item toggle hover" key="street">
                            <h4>Street</h4>
                            <input type="checkbox" ${savedQuery?.neededSFHInfo?.includes('street') ? 'checked' : ''}>
                        </div>

                        <div class="option-item toggle hover" key="city">
                            <h4>City</h4>
                            <input type="checkbox" ${savedQuery?.neededSFHInfo?.includes('city') ? 'checked' : ''}>
                        </div>

                        <div class="option-item toggle hover" key="state">
                            <h4>State</h4>
                            <input type="checkbox" ${savedQuery?.neededSFHInfo?.includes('state') ? 'checked' : ''}>
                        </div>

                        <div class="option-item toggle hover" key="zip">
                            <h4>Zip</h4>
                            <input type="checkbox" ${savedQuery?.neededSFHInfo?.includes('zip') ? 'checked' : ''}>
                        </div>

                        <div class="option-item toggle hover" key="price">
                            <h4>Price</h4>
                            <input type="checkbox" ${savedQuery?.neededSFHInfo?.includes('price') ? 'checked' : ''}>
                        </div>

                        <div class="option-item toggle hover" key="arv">
                            <h4>ARV</h4>
                            <input type="checkbox" ${savedQuery?.neededSFHInfo?.includes('arv') ? 'checked' : ''}>
                        </div>
                    </div>

                    <div class="sub-options-group" group="neededLandInfo">
                        <div class="sub-options-title"><h4>Land</h4></div>
                        <div class="option-item toggle hover" key="street">
                            <h4>Street</h4>
                            <input type="checkbox" ${savedQuery?.neededLandInfo?.includes('street') ? 'checked' : ''}>
                        </div>

                        <div class="option-item toggle hover" key="city">
                            <h4>City</h4>
                            <input type="checkbox" ${savedQuery?.neededLandInfo?.includes('city') ? 'checked' : ''}>
                        </div>

                        <div class="option-item toggle hover" key="state">
                            <h4>State</h4>
                            <input type="checkbox" ${savedQuery?.neededLandInfo?.includes('state') ? 'checked' : ''}>
                        </div>

                        <div class="option-item toggle hover" key="zip">
                            <h4>Zip</h4>
                            <input type="checkbox" ${savedQuery?.neededLandInfo?.includes('zip') ? 'checked' : ''}>
                        </div>

                        <div class="option-item toggle hover" key="price">
                            <h4>Price</h4>
                            <input type="checkbox" ${savedQuery?.neededLandInfo?.includes('price') ? 'checked' : ''}>
                        </div>
                    </div>
                </div>

                <div class="options-group" group="states">
                    <div class="options-title"><h4>States</h4></div>
                    <div class="option-item searchbar">
                        <input type="text" placeholder="Search">
                        <h4 class="toggle-all hover">Toggle All</h4>
                    </div>
                    <div class="search-content-container">
                        ${options.states.map(state => /*html*/`
                            <div class="option-item toggle hover" key="${state}">
                                <h4>${state}</h4>
                                <input type="checkbox" ${!savedQuery?.blacklistedStates?.includes(state) ? 'checked' : ''}>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="options-group" group="cities">
                    <div class="options-title"><h4>Cities</h4></div>
                    <div class="option-item searchbar">
                        <input type="text" placeholder="Search">
                        <h4 class="toggle-all hover">Toggle All</h4>
                    </div>
                    <div class="search-content-container">
                        ${options.cities.map(city => /*html*/`
                            <div class="option-item toggle hover" key="${city}">
                                <h4>${city}</h4>
                                <input type="checkbox" ${!savedQuery?.blacklistedCities?.includes(city) ? 'checked' : ''}>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="options-group" group="postedAge">
                    <div class="options-title"><h4>Posted Age</h4></div>
                    <div class="option-item number" key="daysOld">
                        <h4>Newer Than Days</h4>
                        <input type="number" class="number-input">
                    </div>
                </div>

                <div class="options-group" group="authors">
                    <div class="options-title"><h4>Blacklisted Authors</h4></div>
                    <div class="search-content-container">
                        ${!savedQuery ? '' : savedQuery.blacklistedAuthors.map(blacklistedAuthor => /*html*/`
                            <div class="option-item toggle hover" key="${blacklistedAuthor.id}">
                                <h4>${blacklistedAuthor.name}</h4>
                                <input type="checkbox">
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `)

        this.setOptionItemEventListeners()

        this.$shadowRoot.find('.toggle-all').off('click').on('click', event => {
            const itemsContainer = $(event.target).parent().next()

            const totalItems = itemsContainer.children().length
            const checkedItems = itemsContainer.children().filter((_, element) => $(element).find('input').prop('checked')).length

            itemsContainer.children().each((_, element) => {
                const inputElement = $(element).find('input')[0]
                inputElement.checked = (totalItems / 2) > checkedItems
            })

            this.dispatchEvent(new CustomEvent('valueChange', {
                detail: { group: $(event.target).closest('[group]')[0].getAttribute('group'), key: null, value: null }
            }))
        })

        this.$shadowRoot.find('input[type="text"]').on('input', event => {
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

        $(this).on('valueChange', event => {
            //If state options is changed then update the city options list for available cities of selected states
            if (event.detail.group === 'states') {
                const selectedStates = this.getGroupItems('states')
                .filter(item => item.value === true)
                .map(item => item.key)
                .join(',')

                api.get(`/cityOptions?states=${selectedStates}`).then(response => {
                    const cities = response.data
                    
                    const citiesGroupElement = this.$shadowRoot.find('[group="cities"] .search-content-container')

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

    setOptionItemEventListeners(element) {
        const parentElement = element || this.$shadowRoot

        parentElement.find('input[type="checkbox"]').off('click').on('click', event => {
            event.stopPropagation()
        })

        parentElement.find('.option-item').has('> input[type="checkbox"]').off('click').on('click', event => {
            const checkbox = $(event.currentTarget).find('input')[0]

            checkbox.checked = !checkbox.checked

            checkbox.dispatchEvent(new Event('change'))
        })

        parentElement.find('[key] > input').off('change').on('change', event => {
            const input = $(event.target)

            const group = input.closest('[group]')[0].getAttribute('group')

            const key = input.closest('[key]')[0].getAttribute('key')

            const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value

            this.dispatchEvent(new CustomEvent('valueChange', {
                detail: { group, key, value }
            }))
        })
    }

    getGroupItems(group) {
        return this.$shadowRoot.find(`[group="${group}"]`).find('.option-item').map((_, element) => ({
            key: element.getAttribute('key'),
            value: $(element).find('input')[0].type === 'checkbox' ? $(element).find('input')[0].checked : $(element).find('input')[0].value
        })).get()
    }



    getItemValue(group, key) {
        const input = this.$shadowRoot.find(`[group="${group}"] [key="${key}"]`).find('input')[0]

        return input.type === 'checkbox' ? input.checked : input.value
    }
}

customElements.define("filter-options-sidebar", FilterOptionsSidebar)
