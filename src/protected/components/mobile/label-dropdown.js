class LabelDropdown extends HTMLElement {
    constructor() {
        super()

        this.attachShadow({ mode: 'open' })

        this.$shadowRoot = $(this.shadowRoot)

        const styles = /*css*/`
            :host {
                position: relative;
                z-index: 3;
                height: 65%;
            }

            .unchecked {
                border: 4px solid var(--dark-color-3);
                color: var(--dark-color-3);
            }

            .checked {
                border: 4px solid var(--dark-color-4);
                color: var(--dark-color-4);
            }

            .dropdown-button {
                background-color: var(--dark-color-1);
                filter: brightness(95%);
                display: flex;
                flex-direction: row;
                align-items: center;
                padding: 0px 1.8vh;
                height: 100%;
                border-radius: 8px;
                box-sizing: border-box;
            }

            .dropdown-button h4 {
                text-align: center;
                margin: 0px;
            }

            .dropdown-button svg {
                margin-left: 2vw;
                height: 1em;
                aspect-ratio: 1 / 1;
                fill: currentColor;
                transform: rotate(-180deg);
                transition: transform 0.3s ease-in-out;
            }

            .dropdown-options {
                width: 100%;
                position: absolute;
                bottom: 100%;
                display: none;
                margin-bottom: 9px;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
                overflow: hidden;
            }

            .dropdown-item {
                padding: 1vh 2vh;
                background-color: white;
                height: 5vh;
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
                font-size: 1rem;
            }
        `

        this.$shadowRoot.append(/*html*/`
            <style>${styles}</style>
        `)

        this.$shadowRoot.append(/*html*/`
            <div class="dropdown-options">
                ${this.getAttribute('options').split(' ').map(option => /*html*/`
                    <div class="dropdown-item"><h5>${option}</h5></div>
                `).join('')}
            </div>

            <div class="dropdown-button ${this.getAttribute('defaultOption').toLowerCase()}">
                <h4>${this.getAttribute('defaultOption')}</h4>

                <!-- Dropdown SVG -->
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="6.4 8.98 11.2 6.62"><path d="m8.12 9.29 3.88 3.88 3.88-3.88c.39-.39 1.02-.39 1.41 0s.39 1.02 0 1.41l-4.59 4.59c-.39.39-1.02.39-1.41 0l-4.59-4.59c-.39-.39-.39-1.02 0-1.41.39-.38 1.03-.39 1.42 0z"></path></svg>
            </div>
        `)

        this.selectedOption = this.getAttribute('defaultOption')
        this.hasBeenClicked = false

        this.$shadowRoot.find('.dropdown-button').on('click', () => {
            if (!this.hasBeenClicked && this.selectedOption === 'Unchecked') {
                api.post('/changeLabel', {
                    id: this.getAttribute('_id'),
                    label: 'Checked'
                }).then(() => {
                    console.log(`Changed Label of ${this.getAttribute('_id')} to ${'Checked'}`)

                    this.$shadowRoot.find('.dropdown-button > h4').text('Checked')

                    this.selectedOption = 'Checked'

                    this.$shadowRoot.find('.dropdown-button').attr('class', `dropdown-button checked`)
                })
                .catch(error => {
                    console.error('Request Error:', error)

                    $('<notification-banner></notification-banner>')[0].apiError(error, 'Change Label')
                })
            } else {
                this.$shadowRoot.find('.dropdown-options').slideToggle('fast')

                console.log(this.$shadowRoot.find('.dropdown-options').height())

                if (this.$shadowRoot.find('.dropdown-options').height() < 5) {
                    this.$shadowRoot.find('svg').css({ transform: 'rotate(0deg)' })
                } else {
                    this.$shadowRoot.find('svg').css({ transform: 'rotate(-180deg)' })
                }
            }

            this.hasBeenClicked = true
        })

        this.$shadowRoot.find('.dropdown-item').on('click', async event => {
            const dropdownItemDiv = $(event.target)

            this.$shadowRoot.find('.dropdown-options').slideUp('fast')

            api.post('/changeLabel', {
                id: this.getAttribute('_id'),
                label: dropdownItemDiv.text()
            }).then(() => {
                console.log(`Changed Label of ${this.getAttribute('_id')} to ${dropdownItemDiv.text()}`)

                this.$shadowRoot.find('.dropdown-button > h4').text(dropdownItemDiv.text())

                if (this.selectedOption != dropdownItemDiv.text()) this.selectedOption = dropdownItemDiv.text()

                this.$shadowRoot.find('.dropdown-button').attr('class', `dropdown-button ${dropdownItemDiv.text().toLowerCase()}`)
            })
            .catch(error => {
                console.error('Request Error:', error)

                $('<notification-banner></notification-banner>')[0].apiError(error, 'Change Label')
            })
        })
    }

    connectedCallback() {
        if (this.hasRendered) return

        this.setAttribute('tabindex', '0')

        this.selectedOption = this.getAttribute('defaultOption')

        const dropdownButtonTitle = this.$shadowRoot.find('.dropdown-button>h4')

        const widths = this.getAttribute('options').split(' ').map(option => {
            dropdownButtonTitle.text(option)
            return dropdownButtonTitle.width()
        })

        dropdownButtonTitle.width(Math.max(...widths))

        dropdownButtonTitle.text(this.selectedOption)

        this.addEventListener('focusout', (event) => {
            if (!this.contains(event.relatedTarget)) this.$shadowRoot.find('.dropdown-options').slideUp('fast')
        })

        this.hasRendered = true
    }
}

customElements.define('label-dropdown', LabelDropdown)