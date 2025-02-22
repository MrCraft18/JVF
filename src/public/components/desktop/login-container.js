import './notification-banner.js'

class LoginContainer extends HTMLElement {
    constructor() {
        super()

        this.attachShadow({ mode: 'open' })

        this.$shadowRoot = $(this.shadowRoot)

        const styles = /*css*/`
            #login-form {
                position: fixed;
                top: 10vh;
                height: 45vh;
                width: 40%;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                align-items: center;
            }

            h1 {
                text-align: center;
                margin: 0px;
                color: white;
                background-color: var(--color-4);
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
                color: white;
                background-color: var(--dark-color-8);
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
                background-color: var(--color-4);
                color: white;
                font-size: 1.3rem;
                font-weight: 700;
                border: 0px;
            }

            #login-button:hover {
                filter: brightness(85%);
                cursor: pointer;
            }
        `

        this.$shadowRoot.append(/*html*/`
            <style>${styles}</style>
        `)

        this.$shadowRoot.append(/*html*/`
            <div style="height: 100vh; width: 100vw; display: flex; justify-content: center; align-items: center;">
                <form id="login-form" class="container">
                    <h1>REventures</h1>

                    <div>
                        <input id="first-name" type="text" placeholder="First Name" name="firstName" required>
                        <input id="last-name" type="text" placeholder="Last Name" name="lastName" required>
                        <input id="password" type="password" placeholder="Password" name="password" required>
                        <button id="login-button" type="submit">Login</button>
                    </div>
                </form>
            </div>
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
                window.location.href = '/deals-list'
            })
            .catch(error => {
                console.error('Request Error:', error)

                $('<notification-banner></notification-banner>')[0].apiError(error, 'Login')
            })
        })
    }
}

customElements.define('login-container', LoginContainer)
