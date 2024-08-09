class SortingDropdown extends HTMLElement {
    constructor() {
        super()

        this.attachShadow({ mode: 'open' })

        this.$shadowRoot = $(this.shadowRoot)

        const styles = /*css*/`
            :host {
                z-index: 3;
            }

            .dropdown-button-container {
                background-color: var(--dropdown-button-background-color, blue);
                border-radius: var(--dropdown-button-border-radius, 0px);
                overflow: hidden;
                height: 100%;
                display: flex;
                flex-direction: row;
                align-items: center;
            }

            .dropdown-button {
                background-color: inherit;
                padding-left: var(--dropdown-button-padding, 0px);
                padding-right: 2vw;
                height: 100%;
                display: flex;
                flex-direction: row;
                justify-content: space-between;
                align-items: center;
            }

            .dropdown-button h4 {
                white-space: nowrap;
                width: auto;
                margin: 0px;
                margin-left: 2vw;
                text-align: center
            }

            .dropdown-button svg {
                height: 55%;
                aspect-ratio: 1 / 1;
            }

            .order-button {
                background-color: inherit;
                border-left: 1.5px solid black;
                height: 100%;
                padding-left: 2vw;
                padding-right: 3vw;
                display: flex;
                justify-content: center;
                align-items: center;
            }

            .order-button svg {
                height: 50%;
                aspect-ratio: 1 / 1;
                transition: transform 0.3s ease-in-out;
            }

            .dropdown-options {
                display: none;
                margin-top: var(--dropdown-options-margin-top, 8px);
                border-radius: var(--dropdown-options-border-radius, inherit);
                overflow: hidden;
                box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
                overflow: hidden;
            }

            .dropdown-item {
                background-color: var(--dropdown-item-background-color, white);
                height: var(--dropdown-item-height, 5vh);
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .dropdown-item:hover:active, .dropdown-button:hover:active, .order-button:hover:active {
                cursor: pointer;
                filter: brightness(95%);
            }

            .dropdown-item h5 {
                margin: 0px;
                font-size: var(--dropdown-item-font-size, 1rem);
            }
        `

        this.$shadowRoot.append(/*html*/`
            <style>${styles}</style>
        `)

        this.orderDirection = this.getAttribute('defaultOrder') || 'ascending'
        this.selectedOption = this.getAttribute('defaultOption')

        this.$shadowRoot.append(/*html*/`
            <div class="dropdown-button-container">
                <div class="dropdown-button">
                    <!-- Dropdown SVG -->
                    <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
                        <path d="m304 416h-64a16 16 0 0 0 -16 16v32a16 16 0 0 0 16 16h64a16 16 0 0 0 16-16v-32a16 16 0 0 0 -16-16zm-128-64h-48v-304a16 16 0 0 0 -16-16h-32a16 16 0 0 0 -16 16v304h-48c-14.19 0-21.37 17.24-11.29 27.31l80 96a16 16 0 0 0 22.62 0l80-96c10.02-10.05 2.89-27.31-11.33-27.31zm256-192h-192a16 16 0 0 0 -16 16v32a16 16 0 0 0 16 16h192a16 16 0 0 0 16-16v-32a16 16 0 0 0 -16-16zm-64 128h-128a16 16 0 0 0 -16 16v32a16 16 0 0 0 16 16h128a16 16 0 0 0 16-16v-32a16 16 0 0 0 -16-16zm128-256h-256a16 16 0 0 0 -16 16v32a16 16 0 0 0 16 16h256a16 16 0 0 0 16-16v-32a16 16 0 0 0 -16-16z" />
                    </svg>
                    <h4></h4>
                </div>
                <div class="order-button">
                    <svg style="${this.orderDirection === 'descending' ? 'transform: rotate(180deg);' : ''}" fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="4.77 3.77 5.47 7.23">
                        <path clip-rule="evenodd" d="m7.50001 3.79291 2.70709 2.7071-.70709.70711-1.5-1.5v5.29288h-1v-5.29288l-1.5 1.5-.70711-.70711z" fill="#000" fill-rule="evenodd"></path>
                    </svg>
                </div>
            </div>
            <div class="dropdown-options">
                ${this.getAttribute('options').split(' ').map(option => /*html*/`
                    <div class="dropdown-item"><h5>${option}</h5></div>
                `).join('')}
            </div>
        `)

        const dropdownButtonTitle = this.$shadowRoot.find('.dropdown-button>h4')

        const widths = this.getAttribute('options').split(' ').map(option => {
            dropdownButtonTitle.text(option)
            return dropdownButtonTitle.width()
        })

        dropdownButtonTitle.width(Math.max(...widths))

        dropdownButtonTitle.text(this.selectedOption)

        this.$shadowRoot.find('.dropdown-button').on('click', () => {
            this.$shadowRoot.find('.dropdown-options').slideToggle('fast')
        })

        this.$shadowRoot.find('.dropdown-item').on('click', event => {
            const dropdownItemDiv = $(event.target)

            this.$shadowRoot.find('.dropdown-button > h4').text(dropdownItemDiv.text())

            if (this.selectedOption != dropdownItemDiv.text()) {
                this.selectedOption = dropdownItemDiv.text()

                this.dispatchEvent(new Event('optionChange'))
            }

            this.$shadowRoot.find('.dropdown-options').slideUp('fast')
        })

        this.$shadowRoot.find('.order-button').on('click', event => {
            this.$shadowRoot.find('.dropdown-options').slideUp('fast')

            const orderButtonDiv = $(event.currentTarget)

            if (this.orderDirection === 'ascending') {
                orderButtonDiv.find('svg').css({ transform: 'rotate(180deg)' })

                this.orderDirection = 'descending'
            } else {
                orderButtonDiv.find('svg').css({ transform: 'rotate(0deg)' })

                this.orderDirection = 'ascending'
            }

            this.dispatchEvent(new Event('orderToggle'))
        })

        $(document).on('click', event => {
            if (!$(event.target).is(this)) {
                this.$shadowRoot.find('.dropdown-options').slideUp('fast')
            }
        })
    }

    setOption(option) {
        this.$shadowRoot.find('.dropdown-button > h4').text(option)

        this.selectedOption = option

        this.dispatchEvent(new Event('optionChange'))
    }

    setOrder(direction) {
        const orderButtonDiv = this.$shadowRoot.find('.order-button')

        if (direction === 'ascending') {
            orderButtonDiv.find('svg').css({ transform: 'rotate(0deg)' })

            this.orderDirection = 'ascending'
        } else {
            orderButtonDiv.find('svg').css({ transform: 'rotate(180deg)' })

            this.orderDirection = 'descending'
        }

        this.dispatchEvent(new Event('orderChange'))
    }
}

customElements.define('sorting-dropdown', SortingDropdown)