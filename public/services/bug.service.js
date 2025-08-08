
const BASE_URL = '/api/bug/'

export const bugService = {
    query,
    getById,
    save,
    remove,
    getTotalBugs,
    getDefaultFilter,
}

function query(filterBy = {}) {
    const queryStr = new URLSearchParams()

    for (const key in filterBy) {
        const value = filterBy[key]
        if (Array.isArray(value)) {
            value.forEach(val => queryStr.append(key, val))
        } else {
            queryStr.append(key, value)
        }
    }

    return axios.get(`${BASE_URL}?${queryStr.toString()}`)
        .then(res => res.data)
}

function getById(bugId) {
    return axios.get(`${BASE_URL}${bugId}`)
        .then(res => res.data)
}

function remove(bugId) {
    if (!bugId) return Promise.reject(new Error('Bug ID is required'))
    return axios.delete(`${BASE_URL}${bugId}`)
}

function save(bug) {
    const url = bug._id ? `${BASE_URL}${bug._id}` : BASE_URL
    const method = bug._id ? 'put' : 'post'

    return axios[method](url, bug)
        .then(res => res.data)
}

function getTotalBugs(filterBy = {}) {
    return axios.get('/api/bug/count', { params: filterBy })
        .then(res => ({ total: res.data.total }))
}

function getDefaultFilter() {
    return { txt: '', minSeverity: 0 }
}
