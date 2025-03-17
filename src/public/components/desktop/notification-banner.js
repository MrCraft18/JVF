class NotificationBanner extends HTMLElement {
    constructor() {
        super()

        this.attachShadow({ mode: 'open' })

        this.$shadowRoot = $(this.shadowRoot)

        const styles = /*css*/`
            :host {
                position: fixed;
                top: 8vh;
                height: 60px;
                width: 100%;
                box-sizing: border-box;
                padding: 0px 2vw;
                z-index: 20000;
            }

            .banner {
                height: 100%;
                border-radius: 8px;
                display: flex;
                font-size: 1.4rem;
                align-items: center;
                flex-direction: row;
                padding: 0px 1vw;
                box-shadow: 5px 5px 10px rgba(0, 0, 0, 0.25);
            }

            .banner span {
                width: 100%;
                text-align: left;
                flex-grow: 1;
                font-weight: 500;
            }

            .banner svg {
                height: 30%;
                aspect-ratio: 1 / 1;
                padding: 1.5vh;
                border-radius: 1vw;
            }

            svg:hover {
                cursor: pointer;
                background-color: inherit;
                filter: brightness(90%);
            }
        `

        this.$shadowRoot.append(/*html*/`
            <style>${styles}</style>
        `)

        $('body').find('notification-banner').remove()
    }

    // connectedCallback() {
    //     this.$shadowRoot.append(/*html*/`
    //         <div class="banner" style="background-color: ${this.getAttribute('background-color')}; color: ${this.getAttribute('color')};">
    //             <span>${this.getAttribute('text')}</span>
    //             <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="bi bi-x" viewBox="4.47 4.47 7.05 7.05"><path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/></svg>
    //         </div>
    //     `)

    //     this.$shadowRoot.find('svg').on('click', () => {
    //         $(this).remove()
    //     })
    // }

    apiError(error, errorName) {
        console.log(error)
        const errorText = (() => {
            if (error.response.data.code === 502) return 'Network Error: Try Reloading Page'

            if (error.response) {
                if (error.response.data === 401 || error.response.data === 403) return 'Authentication Error: Try Reloading Page'

                if (error.response.data) return error.response.data

                if (error.response.status) return `${errorName} Error: HTTP Code ${error.response.status}`
            }

            if (error.code) return `${errorName} Error: Axios Code ${error.code}`

            return `Unknown ${errorName} Error`
        })()

        this.$shadowRoot.append(/*html*/`
            <div class="banner" style="background-color: red; color: white;">
                <span>${errorText}</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="bi bi-x" viewBox="4.47 4.47 7.05 7.05"><path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/></svg>
            </div>
        `)

        this.$shadowRoot.find('svg').on('click', () => {
            $(this).remove()
        })

        $('body').append($(this))
    }
}

customElements.define('notification-banner', NotificationBanner)
