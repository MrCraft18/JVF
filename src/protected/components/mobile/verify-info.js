class VerifyInfo extends HTMLElement {
    constructor() {
        super()

        this.attachShadow({ mode: 'open' })

        this.$shadowRoot = $(this.shadowRoot)

        const styles = /*css*/`
            h3, h4, h5 {
                margin: 0px;
            }

            :host {
                height: 65%;
            }

            .button {
                background-color: var(--highlight-color);
                height: 100%;
                display: flex;
                flex-direction: row;
                align-items: center;
                padding: 0px 4vw;
                border-radius: 8px;
            }

            .button h4 {
                white-space: nowrap;
            }

            .checkbox-container {
                margin-left: 3vw;
                height: 1.6em;
                width: 1.6em;
                border-radius: 4px;
                border: 2px solid black;
                box-sizing: border-box;
                overflow: hidden;
            }

            .check {
                height: 100%;
                width: 100%;
                background-color: var(--primary-color);
                display: flex;
                justify-content: center;
                align-items: center;
            }

            .check svg {
                height: 75%;
                width: 75%;
            }

            .modal-container {
                position: fixed;
                z-index: 5;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                overflow: auto;
                background-color: rgba(0, 0, 0, 0.5);
                display: flex;
                justify-content: center;
                display: none;
            }

            .modal {
                background-color: white;
                height: 60vh;
                width: 70vw;
                border-radius: 8px;
                margin-top: 15vh;
                display: flex;
                flex-direction: column;
                justify-content: space-around;
                align-items: center;
                padding: 0px 4vw;
            }

            .field-grid {
                height: 70%;
                width: 100%;
                display: grid;
                grid-template-rows: repeat(8, minmax(0, 1fr));
                grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
            }

            .field-name {
                align-self: center;
                font-size: 1.1rem;
            }

            .field-value {
                align-self: center;
                justify-self: center;
                width: 100%;
                height: 60%;
                box-sizing: border-box;
                font-size: 1rem;
            }

            .dropdown-container {
                height: 100%;
                position: relative;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
            }

            .dropdown-button {
                height: 80%;
                width: 100%;
                display: flex;
                flex-direction: row;
                align-items: center;
                background-color: var(--highlight-color);
                border-radius: 6px;
                padding: 0px 3vw;
                box-sizing: border-box;
            }

            .dropdown-button h4 {
                flex-grow: 1;
                text-align: center;
                font-size: 1rem
            }

            .dropdown-button svg {
                height: 40%;
                aspect-ratio: 1 / 1;
            }

            .dropdown-options {
                border-radius: 6px;
                overflow: hidden;
                position: absolute;
                top: 100%;
                width: 100%;
                border: 1px solid black;
                font-weight: 500;
                display: none;
            }

            .dropdown-item {
                padding: 1.5vh 0px;
                text-align: center;
                background-color: white;
            }

            .submit-button {
                background-color: var(--highlight-color);
                padding: 1.5vh;
                border-radius: 8px;
                font-weight: 600;
                margin-bottom: 3vh;
            }

            .button:hover:active, .dropdown-button:hover:active, .dropdown-item:hover:active, .submit-button:hover:active {
                cursor: pointer;
                filter: brightness(95%);
            }
        `

        this.$shadowRoot.append(/*html*/`
            <style>${styles}</style>
        `)

        this.$shadowRoot.append(/*html*/`
            <div class="button">
                <h4>Verify Info</h4>

                <div class="checkbox-container">
                    ${
                        this.getAttribute('verified') === 'true' ? /*html*/`
                            <div class="check">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="bi bi-check" viewBox="4.08 4.75 8.17 6.5"><path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425z"/></svg>
                            </div>
                        ` : ''
                    }
                </div>
            </div>

            <div class="modal-container">
                <div class="modal">
                    <div class="field-grid">
                        <div class="field-name">Category:</div>
                        <div class="dropdown-container">
                            <div class="dropdown-button">
                                <h4>SFH Deal</h4>

                                <!-- Dropdown SVG -->
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="6.4 8.98 11.2 6.62"><path d="m8.12 9.29 3.88 3.88 3.88-3.88c.39-.39 1.02-.39 1.41 0s.39 1.02 0 1.41l-4.59 4.59c-.39.39-1.02.39-1.41 0l-4.59-4.59c-.39-.39-.39-1.02 0-1.41.39-.38 1.03-.39 1.42 0z"></path></svg>
                            </div>

                            <div class="dropdown-options">
                                <div class="dropdown-item">SFH Deal</div>
                                <div class="dropdown-item">Land Deal</div>
                                <div class="dropdown-item">None</div>
                            </div>
                        </div>

                        <div class="field-name">Price:</div>
                        <input class="field-value" type="text" value="100000">

                        <div class="field-name">ARV:</div>
                        <input class="field-value" type="text" value="1000000">

                        <div class="field-name">Street Number:</div>
                        <input class="field-value" type="text" value="1304">

                        <div class="field-name">Street Name:</div>
                        <input class="field-value" type="text" value="Shalimar Dr">

                        <div class="field-name">City:</div>
                        <input class="field-value" type="text" value="Fort Worth">

                        <div class="field-name">State:</div>
                        <input class="field-value" type="text" value="TX">

                        <div class="field-name">ZIP:</div>
                        <input class="field-value" type="text" value="76131">
                    </div>

                    <div class="submit-button">Submit Info</div>
                </div>
            </div>
        `)

        this.$shadowRoot.find('.dropdown-button').on('click', () => {
            this.$shadowRoot.find('.dropdown-options').slideToggle('fast')
        })

        this.$shadowRoot.find('.dropdown-item').on('click', event => {
            const dropdownItemDiv = $(event.target)

            this.$shadowRoot.find('.dropdown-button > h4').text(dropdownItemDiv.text())

            this.$shadowRoot.find('.dropdown-options').slideUp('fast')
        })

        this.$shadowRoot.find('.button').on('click', () => {
            this.$shadowRoot.find('.modal-container').css({'display': 'flex'})
        })

        this.$shadowRoot.find('.modal-container').on('click', event => {
            if (event.target === event.currentTarget) {
                $(event.target).hide()
            }
        })

        this.$shadowRoot.find('.submit-button').on('click', () => {
            this.$shadowRoot.find('.modal-container').hide()
        })
    }
}

customElements.define('verify-info', VerifyInfo)