class TitleBar extends HTMLElement {
    constructor() {
        super()

        this.attachShadow({ mode: 'open' })

        this.$shadowRoot = $(this.shadowRoot)

        document.addEventListener('all-components-loaded', this.onComponentsLoaded?.bind(this))

        const styles = /*css*/`
            :host {
                position: fixed;
                top: 0px;
	            height: 6vh;
	            width: 100%;
                display: flex;
                flex-direction: row;
                align-items: center;
                justify-content: center;
                padding-left: 3.5vw;
                padding-right: 3.5vw;
                box-sizing: border-box;
                background-color: var(--primary-color);
            }

            :host > * {
                width: 30%;
            }
            h3, h4 {
                margin: 0px;
            }

            h4 {
                font-size: 1.2rem;
            }

            #page-title {
                text-align: center;
            }

            #settings {
                display: flex;
                flex-direction: row;
                justify-content: flex-end;
                height: 50%;
                aspect-ratio 1 / 1;
                cursor: pointer;
            }

            #settings svg {
                height: 100%;
                aspect-ratio: 1 / 1;
            }
        `

        this.$shadowRoot.append(/*html*/`
            <style>${styles}</style>
        `)

        this.$shadowRoot.append(/*html*/`
            <h3>JVF</h3>
            <h4 id="page-title">Deals</h4>
            <div id="settings">
                <svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="2.25 2 11.52 12"><path d="m2.26726 6.15309c.26172-.80594.69285-1.54574 1.26172-2.1727.09619-.10602.24711-.14381.38223-.0957l1.35948.484c.36857.13115.77413-.06004.90584-.42703.01295-.03609.02293-.07316.02982-.1108l.259-1.41553c.02575-.14074.13431-.25207.27484-.28186.41118-.08714.83276-.13146 1.25987-.13146.42685 0 .84818.04427 1.25912.1313.14049.02976.24904.14102.27485.28171l.25973 1.41578c.07022.38339.43924.63751.82434.5676.0379-.00688.0751-.01681.1113-.02969l1.3595-.48402c.1351-.04811.286-.01032.3822.0957.5689.62696 1 1.36676 1.2618 2.1727.0441.13596.0015.28502-.1079.3775l-1.1019.93152c-.2983.25225-.3348.69756-.0815.99463.0249.02921.0522.05635.0815.08114l1.1019.93153c.1094.09248.152.24154.1079.37751-.2618.80598-.6929 1.54578-1.2618 2.17268-.0962.106-.2471.1438-.3822.0957l-1.3595-.484c-.3685-.1311-.7741.0601-.90581.427-.01295.0361-.02293.0732-.02985.111l-.25971 1.4157c-.02581.1407-.13436.2519-.27485.2817-.41094.087-.83227.1313-1.25912.1313-.42711 0-.84869-.0443-1.25987-.1315-.14053-.0298-.24909-.1411-.27484-.2818l-.25899-1.4155c-.07022-.3834-.43928-.6375-.82433-.5676-.03787.0069-.0751.0168-.11128.0297l-1.35954.484c-.13512.0481-.28604.0103-.38223-.0957-.56887-.6269-1-1.3667-1.26172-2.17268-.04415-.13597-.00158-.28503.10783-.37751l1.1019-.93152c.29835-.25225.33484-.69756.08151-.99463-.02491-.02921-.05217-.05635-.0815-.08114l-1.10191-.93153c-.10941-.09248-.15198-.24154-.10783-.3775zm3.98268 1.84685c0 .9665.7835 1.75 1.75 1.75s1.75-.7835 1.75-1.75-.7835-1.75-1.75-1.75-1.75.7835-1.75 1.75z" fill="#212121"/></svg>
            </div>
        `)
    }
}

customElements.define('title-bar', TitleBar)