//import './loader.js'

class InfoIssue extends HTMLElement {
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
                color: var(--dark-color-2);
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
                align-items: center;
            }

            .modal {
                background-color: var(--dark-color-1);
                /*height: 80vh;*/
                /*max-width: 40vw;*/
                border-radius: 12px;
                /*margin-top: 15vh;*/
                display: flex;
                flex-direction: column;
                justify-content: space-around;
                align-items: center;
                padding: 0px 2.5vw;
            }

            .title {
                color: var(--dark-color-2);
                margin: 2vh 0px;
            }

            .option {
                background-color: var(--dark-color-9);
                border-radius: 8px;
                padding: 12px 18px;
                display: flex;
                flex-direction: row;
                align-items: center;
                margin-bottom: 1vh;
            }

            .option > input[type="checkbox"] {
                margin: 0px;
                margin-right: 16px;
            }

            .other-input {
                font-size: 1rem;
            }

            .other-input:focus {
                outline: 0px; 
            }

            .option > h5 {
                /*max-width: 30vw;*/
            }
            
            .submit-button {
                background-color: var(--color-4);
                color: white;
                padding: 12px 16px;
                display: flex;
                justify-content: center;
                align-items: center;
                border-radius: 8px;
                font-weight: 600;
                font-size: 0.9rem;
                margin-bottom: 1vh;
            }

            .submit-loader {
                height: 50%;
                --loader-color: lightgrey;
            }

            .hover:hover {
                cursor: pointer;
                filter: brightness(90%);
            }
        `

        this.$shadowRoot.append(/*html*/`
            <style>${styles}</style>
        `)

        this.$shadowRoot.append(/*html*/`
            <div class="modal-container">
                <div class="modal">
                    <h4 class="title">Information Issue</h4>

                    <div class="option hover">
                        <input type="checkbox">
                        <h5>This is not an Off Market Deal</h5>
                    </div>

                    <div class="option hover">
                        <input type="checkbox">
                        <h5>This is a ${$('deal-view')[0].deal.category === "SFH Deal" ? 'Land' : 'SFH'} Deal</h5>
                    </div>

                    <div class="option hover">
                        <input type="checkbox">
                        <h5>Incorrect Street Name</h5>
                    </div>

                    <div class="option hover">
                        <input type="checkbox">
                        <h5>Incorrect Street Number</h5>
                    </div>

                    <div class="option hover">
                        <input type="checkbox">
                        <h5>Incorrect City</h5>
                    </div>

                    <div class="option hover">
                        <input type="checkbox">
                        <h5>Incorrect State</h5>
                    </div>

                    <div class="option hover">
                        <input type="checkbox">
                        <h5>Incorrect ZIP</h5>
                    </div>

                    <div class="option hover">
                        <input type="checkbox">
                        <h5>Incorrect Price</h5>
                    </div>

                    <div class="option hover">
                        <input type="checkbox">
                        <h5>Incorrect ARV</h5>
                    </div>

                    <div class="option hover">
                        <input type="checkbox">
                        <input class="other-input" placeholder="Other">
                    </div>

                    <div class="submit-button hover">Submit</div>
                </div>
            </div>
        `)

        this.$shadowRoot.find('.modal-container').on('click', event => {
            if (event.target === event.currentTarget) $(this).remove()
        })

        this.$shadowRoot.find('input[type="checkbox"]').on('click', event => {
            event.stopPropagation()
        })

        this.$shadowRoot.find('.option').has('> input[type="checkbox"]').on('click', event => {
            if (event.target.getAttribute('placeholder') === 'Other') return

            const checkbox = $(event.currentTarget).find('input')[0]

            checkbox.checked = !checkbox.checked
        })

        this.$shadowRoot.find('.submit-button').on('click', async event => {
            const selectedIssues = $(event.currentTarget).closest('.modal').find('input[type="checkbox"]:checked').map((_, element) => {
                if ($(element).parent().find('.other-input')[0]) {
                    return $(element).parent().find('.other-input').val()
                } else {
                    return $(element).parent().find('h5').text()
                }
            }).get() 

            console.log(selectedIssues)

            if (selectedIssues.length) {
                api.post('/dealIssue', { id: $('deal-view')[0].deal._id, selectedIssues }).then(() => {
                    this.$shadowRoot.find('.modal').html('<h3 class="title">Issue Submitted</h3>')

                    $($('deal-view')[0].shadowRoot).find('.issue-icon').attr('class', '.has-issue-raised')
                }).catch(error => {
                    console.error('Request Error:', error)

                    $('<notification-banner></notification-banner>')[0].apiError(error, 'Get Deal')
                })
            }
        })
    }
}

customElements.define('info-issue', InfoIssue)
