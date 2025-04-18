const api = axios.create({
    baseURL: new URL(window.location).origin + '/api',
    withCredentials: true
})

api.interceptors.request.use(async config => {
    await api.tokenPromise

    if (!api.token || new Date() >= new Date(JSON.parse(atob(api.token.split('.')[1])).exp * 1000) - 5000) {
        console.log('Grabbing new Key')
        api.tokenPromise = axios.post('/auth/accessToken').then(response => response.data.accessToken)
        api.token = await api.tokenPromise
    }

    config.headers.Authorization = `Bearer ${api.token}`

    return config
})

api.accessToken = async () => {
    if (!api.token) {
        api.tokenPromise = axios.post('/auth/accessToken').then(response => response.data.accessToken)
        api.token = await api.tokenPromise
    }

    return api.token
}

api.interceptors.response.use(response => response, error => {
    if (error.response.status === 401 || error.response.status === 403) window.location.pathname = '/login'

    if (error.response) {
        if (error.response.status === 502) {

        }
    } else if (error.request) {
        console.log('No response received:', error.request)
    } else {
        console.log('Error setting up request:', error.message)
    }

    return Promise.reject(error)
})
