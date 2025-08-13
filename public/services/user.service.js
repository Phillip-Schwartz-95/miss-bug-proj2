const BASE_URL = '/api/user/'

export const userService = {
    remove,
    query,
    getById,
    getEmptyCredentials,
    getUserWithBugs
}

function query() {
    return axios.get(BASE_URL)
        .then(res => res.data)
}

function remove(userId) {
    return axios.delete(BASE_URL + userId)
        .then(res => res.data)
}

function getById(userId) {
    return axios.get(BASE_URL + userId)
        .then(res => res.data)
}

function getUserWithBugs(userId) {
    return axios.get(BASE_URL + userId + '?getBugs=true')
        .then(res => res.data)
        .then(console.log)
}

function getEmptyCredentials() {
    return {
        username: '',
        password: '',
        fullname: ''
    }
}