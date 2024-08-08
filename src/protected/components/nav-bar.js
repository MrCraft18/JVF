class NavBar extends HTMLElement {
    constructor() {
        super()

        const styles = /*css*/`
            nav-bar {
                position: fixed;
                bottom: 0px;
                height: 8vh;
                width: 100%;
                display: flex;
                flex-direction: row;
                justify-content: space-around;
                align-items: center;
                z-index: 0;
            }

            .nav-button {
                background-color: var(--primary-color);
                height: 75%;
                aspect-ratio: 1 / 1;
                display: flex;
                justify-content: center;
                align-items: center;
                filter: brightness(80%);
                border-radius: 10px;
            }

            .nav-icon {
                height: 80%;
                width: 80%;
                opacity: 1.0;
            }
        `

        $('head').append(/*html*/`
            <style>${styles}</style>
        `)
    }

    connectedCallback() {
        this.style.setProperty('background-color', 'var(--primary-color)')

        this.innerHTML = /*html*/`
            <div id="dashboard-button" class="nav-button primary-color">
                <img class="nav-icon" src="/icons/dashboard.svg" alt="Dash">
            </div>
            <div id="todo-button" class="nav-button primary-color">
                <img class="nav-icon" src="/icons/todo.svg" alt="To-Do">
            </div>
            <a href="/mobile/deals" class="nav-button primary-color">
                <img class="nav-icon" src="/icons/deals.svg" alt="Deals">
            </a>
            <div id="chat-button" class="nav-button primary-color">
                <img class="nav-icon" src="/icons/chat.svg" alt="Chat">
            </div>
        `
    }
}

customElements.define('nav-bar', NavBar)