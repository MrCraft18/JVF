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

            .deselect-all {
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

            .accordion-title:hover:active, .accordion-item:not(.search):active, .deselect-all:hover:active {
                filter: brightness(90%);
                cursor: pointer;
            }
        `

        this.$shadowRoot.append(/*html*/`
            <style>${styles}</style>
        `)
    }

    createLayout(config) {
        this.$shadowRoot.append(/*html*/`
            <div class="background"></div>

            <div class="sidebar-container">
                ${config.map(accordion => /*html*/`
                    <div class="accordion-title" group="${accordion.group}">
                        <h4>${accordion.title}</h4>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="6.4 8.98 11.2 6.62"><path d="m8.12 9.29 3.88 3.88 3.88-3.88c.39-.39 1.02-.39 1.41 0s.39 1.02 0 1.41l-4.59 4.59c-.39.39-1.02.39-1.41 0l-4.59-4.59c-.39-.39-.39-1.02 0-1.41.39-.38 1.03-.39 1.42 0z"></path></svg>
                    </div>

                    <div class="accordion-content">
                        <div>
                            ${accordion.searchbar ? /*html*/`
                                <div class="accordion-item search">
                                    <input type="text" placeholder="Search">
                                    <div class="deselect-all">Deselect All</div>
                                </div>

                                <div class="content-search-container">
                            ` : ''}

                            ${accordion.items.map(item => {
                                if (item.type === 'checkbox') return /*html*/`
                                    <div class="accordion-item" key="${item.key}">
                                        <h5>${item.label}</h5>
                                        <input type="checkbox" ${item.value ? 'checked': ''}>
                                    </div>
                                `

                                if (item.type === 'number') return /*html*/`
                                    <div class="accordion-item" key="${item.key}">
                                        <h5>${item.label}</h5>
                                        <input type="number" class="number-input">
                                    </div>
                                `

                                if (item.type === 'sub-accordion') return /*html*/`
                                    <div class="accordion-item sub-accordion-title" group="${item.group}">
                                        <h5>${item.label}</h5>
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="6.4 8.98 11.2 6.62"><path d="m8.12 9.29 3.88 3.88 3.88-3.88c.39-.39 1.02-.39 1.41 0s.39 1.02 0 1.41l-4.59 4.59c-.39.39-1.02.39-1.41 0l-4.59-4.59c-.39-.39-.39-1.02 0-1.41.39-.38 1.03-.39 1.42 0z"></path></svg>
                                    </div>

                                    <div class="accordion-content">
                                        <div>
                                            ${item.items.map(subItem => {
                                                if (subItem.type === 'checkbox') return /*html*/`
                                                    <div class="accordion-item" key="${subItem.key}">
                                                        <h5>${subItem.label}</h5>
                                                        <input type="checkbox" ${subItem.value ? 'checked': ''}>
                                                    </div>
                                                `
                                                if (subItem.type === 'number') return /*html*/`
                                                    <div class="accordion-item" key="${subItem.key}">
                                                        <h5>${subItem.label}</h5>
                                                        <input type="number" class="number-input">
                                                    </div>
                                                `
                                            }).join('')}
                                        </div>
                                    </div>
                                `
                            }).join('')}

                            ${accordion.searchbar ? /*html*/`
                                </div>
                            ` : ''}
                        </div>
                    </div>
                `).join('')}
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

        this.$shadowRoot.find('input[type="checkbox"]').on('click', event => {
            event.stopPropagation()
        })

        this.$shadowRoot.find('.accordion-item').has('> input').on('click', event => {
            const checkbox = $(event.currentTarget).find('input')[0]

            checkbox.checked = !checkbox.checked

            checkbox.dispatchEvent(new Event('change'))
        })

        this.$shadowRoot.find('[key] > input').on('change', event => {
            const input = $(event.target)

            const group = input.closest('.accordion-content').prev()[0].getAttribute('group')

            const key = input.closest('.accordion-item')[0].getAttribute('key')

            const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value

            this.dispatchEvent(new CustomEvent('valueChange', {
                detail: { group, key, value }
            }))
        })

        this.$shadowRoot.find('.search').on('input', event => {
            const inputText = event.target.value.toLowerCase()

            const itemsContainer = $(event.target).parent().next()

            if (inputText === "") {
                itemsContainer.find('> [key]').show()
            } else {
                itemsContainer.find('> [key]').each((index, element) => {
                    if (!$(element).text().toLowerCase().includes(inputText)) {
                        $(element).hide()
                    } else {
                        $(element).show()
                    }
                })
            }
        })

        this.$shadowRoot.find('.deselect-all').on('click', event => {
            const itemsContainer = $(event.target).parent().next()

            itemsContainer.children().each((index, element) => {
                const inputElement = $(element).find('input')[0]
                inputElement.checked = false
                inputElement.dispatchEvent(new Event('change'))
            })
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

    options() {
        const result = {}

        this.$shadowRoot.find('.accordion-title').each((index, element) => {
            const obj = {}

            $(element).next().find('> div > [key]').each((index, element) => {
                obj[element.getAttribute('key')] = getValue(element)
            })

            result[element.getAttribute('key')] = obj
        })

        return result



        function getValue(element) {
            if ($(element).is('.sub-accordion-title')) {
                return extractSubAccordion(element)
            }

            const input = $(element).find('input')[0]

            switch (input.type) {
                case 'number':
                    return input.value

                case 'checkbox':
                    return input.checked
            }
        }

        function extractSubAccordion(element) {
            const obj = {}

            $(element).next().find('> div > [key]').each((index, element) => {
                obj[element.getAttribute('key')] = getValue(element)
            })

            return obj
        }
    }



    getGroupItems(group) {
        return this.$shadowRoot.find(`[group="${group}"]`).next().find('.accordion-item[key]').map((index, element) => ({
            key: element.getAttribute('key'),
            value: $(element).find('input')[0].type === 'checkbox' ? $(element).find('input')[0].checked : $(element).find('input')[0].value
        })).get()
    }



    getItemValue(group, key) {
        const input = this.$shadowRoot.find(`[group="${group}"]`).next().find(`[key="${key}"]`).find('input')[0]

        return input.type === 'checkbox' ? input.checked : input.value
    }



    buildGroupItems(group, items, { searchbar = false }) {
        const accoridonContentDiv = this.$shadowRoot.find(`[group=${group}]`).next()

        accoridonContentDiv.html(/*html*/`
            <div>
                ${searchbar ? /*html*/`
                    <div class="accordion-item search">
                        <input type="text" placeholder="Search">
                    </div>
                    <div class="content-search-container">
                ` : ''}

                ${items.map(item => {
                    if (item.type === 'checkbox') return /*html*/`
                        <div class="accordion-item" key="${item.key}">
                            <h5>${item.label}</h5>
                            <input type="checkbox" ${item.value ? 'checked': ''}>
                        </div>
                    `
                    if (item.type === 'number') return /*html*/`
                        <div class="accordion-item" key="${item.key}">
                            <h5>${item.label}</h5>
                            <input type="number" class="number-input">
                        </div>
                    `
                    if (item.type === 'sub-accordion') return /*html*/`
                        <div class="accordion-item sub-accordion-title" group="${item.group}">
                            <h5>${item.label}</h5>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="6.4 8.98 11.2 6.62"><path d="m8.12 9.29 3.88 3.88 3.88-3.88c.39-.39 1.02-.39 1.41 0s.39 1.02 0 1.41l-4.59 4.59c-.39.39-1.02.39-1.41 0l-4.59-4.59c-.39-.39-.39-1.02 0-1.41.39-.38 1.03-.39 1.42 0z"></path></svg>
                        </div>
                        <div class="accordion-content">
                            <div>
                                ${item.items.map(subItem => {
                                    if (subItem.type === 'checkbox') return /*html*/`
                                        <div class="accordion-item" key="${subItem.key}">
                                            <h5>${subItem.label}</h5>
                                            <input type="checkbox" ${subItem.value ? 'checked': ''}>
                                        </div>
                                    `
                                    if (subItem.type === 'number') return /*html*/`
                                        <div class="accordion-item" key="${subItem.key}">
                                            <h5>${subItem.label}</h5>
                                            <input type="number" class="number-input">
                                        </div>
                                    `
                                }).join('')}
                            </div>
                        </div>
                    `
                }).join('')}

                ${searchbar ? /*html*/`
                    </div>
                ` : ''}
            </div>
        `)
    }
}

customElements.define('filter-options-sidebar', FilterOptionsSidebar)