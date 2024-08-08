class TitleBar extends HTMLElement {
    constructor() {
        super()

        const styles = /*css*/`
            title-bar {
                position: fixed;
                top: 0px;
	            height: 6vh;
	            width: 100%;
	            display: flex;
	            flex-direction: row;
	            align-items: center;
	            justify-content: space-between;
                padding-left: 3.5vw;
                padding-right: 3.5vw;
                box-sizing: border-box;
            }

            title-bar h4 {
                font-size: 1.2rem;
            }

            #settings {
                height: 50%;
                aspect-ratio 1 / 1;
                cursor: pointer;
            }
        `

        $('head').append(/*html*/`
            <style>${styles}</style>
        `)
    }

    connectedCallback() {
        this.style.setProperty('background-color', 'var(--primary-color)')

        const img = $('<img>', {
            id: 'settings',
            src: '/icons/settings.svg',
            alt: 'Settings'
        }).on('load', () => {
            this.innerHTML = /*html*/`
                <h3>JVF</h3>
                <h4>Deals</h4>
                ${img.prop('outerHTML')}
            `
        })
    }
}

customElements.define('title-bar', TitleBar)