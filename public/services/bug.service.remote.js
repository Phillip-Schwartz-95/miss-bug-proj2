const BASE_URL = '/api/bug/'

export const bugService = {
    query,
    getById,
    save,
    remove,
    getDefaultFilter,
    getTotalBugs
}

function query(filterBy) {
    return axios.get(BASE_URL, { params: filterBy })
        .then(res => res.data).catch(console.error)

}

function getById(bugId) {
    return axios.get(BASE_URL + bugId)
        .then(res => res.data)
}

function remove(bugId) {
    return axios.delete(BASE_URL + bugId)
        .then(res => res.data).catch(console.error)
}

function save(bug) {
    console.log(bug);
    
    

    if (bug._id) {
        return axios.put(BASE_URL, bug).then(res => res.data)
            .catch(console.error)
    } else {
        return axios.post(BASE_URL, bug).then(res => res.data).catch(console.error)
    }
}



function getDefaultFilter() {
    return { txt: '', minSeverity: 0 ,pageIdx: 0, sortBy: '', sortDir: -1}
}

function getTotalBugs(){
    return axios.get(BASE_URL+'totalBugs')
        .then(res => res.data)
}