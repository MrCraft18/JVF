history.customCache = {}

function pushHistoryState(href) {
    $('body').find('*').each((index, element) => {
        if (element.scrollTop) element.setAttribute('scrollTop', element.scrollTop)
        if (element.scrollLeft) element.setAttribute('scrollLeft', element.scrollLeft)

        if (element.shadowRoot) handleShadowRoot(element)

        function handleShadowRoot(element) {
            $(element.shadowRoot).find('*').each((index, element) => {
                if (element.scrollTop) element.setAttribute('scrollTop', element.scrollTop)
                if (element.scrollLeft) element.setAttribute('scrollLeft', element.scrollLeft)

                if (element.shadowRoot) handleShadowRoot(element)
            })
        }
    })

    history.customCache[window.location.href] = $('body').contents()

    history.pushState({}, '', href)
}

function restoreHistoryState(state) {
    $('body').html(state)

    $('body').find('*').each((index, element) => {
        if (element.getAttribute('scrollTop')) element.scrollTop = element.getAttribute('scrollTop')
        if (element.getAttribute('scrollLeft')) element.scrollLeft = element.getAttribute('scrollLeft')

        if (element.shadowRoot) handleShadowRoot(element)

        function handleShadowRoot(element) {
            $(element.shadowRoot).find('*').each((index, element) => {
                if (element.getAttribute('scrollTop')) element.scrollTop = element.getAttribute('scrollTop')
                if (element.getAttribute('scrollLeft')) element.scrollLeft = element.getAttribute('scrollLeft')

                if (element.shadowRoot) handleShadowRoot(element)
            })
        }
    })
}

async function urlLocationHandler() {
    function device() {
        return window.matchMedia("(max-width: 767px)").matches ? 'mobile' : 'desktop'
    }

    const location = window.location.pathname === '/' ? '/deals-list' : window.location.pathname

    await axios.get(`/pages${location}/${device()}.html`).then(response => {
        const page = response.data.replaceAll('\n', '')

        $('body').html(page)

        $(page).each((index, element) => {
            import(`/components/${device()}/${element.tagName.toLowerCase()}.js`)
        })

        history.customCache[window.location.href] = $('body').contents()
    }).catch(error => {
        if (error.response) {
            if (error.response.status === 401 || error.response.status === 403) window.location.pathname = '/login'

            if (error.response.status === 404) $('body').html(/*html*/`
                <div style="height: 100vh; width: 100vw; display: flex; align-items: center; justify-content: center; font-size: 2rem; color: white;">
                    Page Not Found :<
                </div>
            `)
        }
    })
}

window.onpopstate = (event) => {
    console.log(event.target.location.href)

    console.log(history.customCache[event.target.location.href])

    if (history.customCache[event.target.location.href]) {
        restoreHistoryState(history.customCache[event.target.location.href])
    } else {
        urlLocationHandler()
    }
}