class loaderComponent extends HTMLElement {
    constructor() {
        super()

        this.attachShadow({ mode: 'open' })

        this.$shadowRoot = $(this.shadowRoot)

        const styles = /*css*/`
            .loader {
              height: 100%;
              aspect-ratio: 1;
              display: grid;
              border-radius: 50%;
              background:
                linear-gradient(0deg ,var(--loader-color, black) 30%,#0000 0 70%,var(--loader-color, black) 0) 50%/8% 100%,
                linear-gradient(90deg,var(--loader-color, black) 25% 30%,#0000 0 70%,var(--loader-color, black) 0) 50%/100% 8%;
              background-repeat: no-repeat;
              animation: l23 1s infinite steps(12);
            }

            .loader::before,
            .loader::after {
               content: "";
               grid-area: 1/1;
               border-radius: 50%;
               background: inherit;
               opacity: 0.915;
               transform: rotate(30deg);
            }

            .loader::after {
               opacity: 0.83;
               transform: rotate(60deg);
            }

            @keyframes l23 {
              100% {transform: rotate(1turn)}
            }
        `

        this.$shadowRoot.append(/*html*/`
            <style>${styles}</style>
        `)

        this.$shadowRoot.append(/*html*/`
            <div class="loader"></div>
        `)
    }
}

customElements.define('loader-component', loaderComponent)
