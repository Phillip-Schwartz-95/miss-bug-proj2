const BASE_URL = '/api/bug/'

export const bugService = {
    query,
    getById,
    save,
    remove,
    getTotalBugs,
    getDefaultFilter,
}

function query(filterBy) {
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
    return axios.get(BASE_URL + bugId)
        .then(res => res.data)
}

function remove(bugId) {
    const url = BASE_URL + bugId + '/remove'
    return axios.get(url)
}

function save(bug) {
    let queryParams = `?title=${encodeURIComponent(bug.title)}&description=${encodeURIComponent(bug.description)}&severity=${bug.severity}`
    if (bug._id) queryParams += `&_id=${bug._id}`
    return axios.get(BASE_URL + 'save/' + queryParams)
        .then(res => res.data)
}

function getTotalBugs(filterBy = {}) {
    return axios.get('/api/bug/count', { params: filterBy })
        .then(res => ({ total: res.data.total }))
}

function getDefaultFilter() {
    return { txt: '', minSeverity: 0 }
}