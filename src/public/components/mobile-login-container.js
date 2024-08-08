class MobileLoginContainer extends HTMLElement {
    constructor() {
        super()

        this.attachShadow({ mode: 'open' })

        this.$shadowRoot = $(this.shadowRoot)

        const styles = /*css*/`
            #login-form {
                position: fixed;
                top: 10vh;
                height: 45vh;
                width: 100%;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                align-items: center;
            }

            h1 {
                margin: 0px;
                color: white;
                background-color: var(--secondary-color);
                padding: 5px 10px;
                border-radius: 10px;
            }

            #login-form > div {
                width: 85%;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                align-items: center;
            }

            #login-form > div > :not(:last-child) {
                margin-bottom: 2vh;
            }

            input {
                box-sizing: border-box;
                padding: 0px;
                border: 4px solid var(--highlight-color);
                outline: 0px;
                width: 100%;
                height: 6vh;
                font-size: 1.3rem;
                padding-left: 8px;
                border-radius: 8px;
            }

            #password {
                grid-area: 2 / 1 / 3 / 3;
            }

            #login-button {
                padding: 12px 10vw;
                border-radius: 8px;
                background-color: var(--highlight-color);
                font-size: 1.3rem;
                font-weight: 700;
                border: 0px;
            }

            #login-button:hover:active {
                filter: brightness(85%);
                cursor: pointer;
            }
        `

        this.$shadowRoot.append(/*html*/`
            <style>${styles}</style>
        `)

        this.$shadowRoot.append(/*html*/`
            <form id="login-form" class="container">
                <h1>Joint Venture Finder</h1>

                <div>
                    <input id="first-name" type="text" placeholder="First Name" name="firstName" required>
                    <input id="last-name" type="text" placeholder="Last Name" name="lastName" required>
                    <input id="password" type="password" placeholder="Password" name="password" required>
                    <button id="login-button" type="submit">Login</button>
                </div>
            </form>
        `)

        this.$shadowRoot.find('#login-form').on('submit', event => {
            event.preventDefault()

            const formData = new FormData(event.target)

            axios.post('/auth/login', {
                name: {
                    first: formData.get('firstName'),
                    last: formData.get('lastName')
                },
                password: formData.get('password')
            })
            .then(() => {
                window.location.href = '/mobile/deals'
            })
            .catch(error => {
                console.error('Auth Login Request Error:', error)
            })
        })
    }
}

customElements.define('mobile-login-container', MobileLoginContainer)