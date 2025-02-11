class DashboardContainer extends HTMLElement {
    constructor() {
        super()

        this.attachShadow({ mode: 'open' })

        this.$shadowRoot = $(this.shadowRoot)

        const styles = /*css*/`
            :host {
                position: fixed;
                top: ${$('title-bar').outerHeight()}px;
                bottom: ${$('nav-bar').outerHeight()}px;
                width: 100%;
                display: flex;
                max-height: calc(100vh - (6vh + 8vh));
                z-index: 1;
            }

            span {
                align-self: center;
                text-align: center;
                color: var(--dark-color-2);
                font-size: 5.5vw;
                width: 100%;
            }
        `

        this.$shadowRoot.append(/*html*/`
            <style>${styles}</style>
        `)
    }

    connectedCallback() {
        $('title-bar')[0].backButton = false

        if (this.hasRendered) return

        this.$shadowRoot.append(/*html*/`
            <span>This component does not exist yet.</span>
        `)

        this.hasRendered = true
    }
}

customElements.define('dashboard-container', DashboardContainer)