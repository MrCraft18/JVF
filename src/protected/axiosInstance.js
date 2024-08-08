const api = axios.create({
    baseURL: new URL(window.location).origin + '/api',
    withCredentials: true
})

api.interceptors.request.use(async config => {
    if (!api.token || new Date() >= new Date(JSON.parse(atob(api.token.split('.')[1])).exp * 1000)) {
        console.log('Grabbing new Key')
        api.token = await axios.post('/auth/accessToken').then(response => response.data.accessToken)
    }

    config.headers.Authorization = `Bearer ${api.token}`

    return config
})

api.accessToken = async () => {
    if (!api.token) {
        api.token = await axios.post('/auth/accessToken').then(response => response.data.accessToken)
    }

    return api.token
}