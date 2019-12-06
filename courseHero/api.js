const https = require('https')
const axios = require('axios')

const request = (url, opt) => {
    let method = opt.method || 'GET'
    let loc = 'https://www.coursehero.com' + url
    return axios({
        method,
        url: loc,
        data: opt.data || null
    });
}

const getAssetsList = (opt) => {
    return request('/api/v2/search/', {
        method: 'POST',
        data: {
            "client": "web",
            "query": opt.keyword,
            "previous_search_id": 540509022,
            "search_id": null,
            "search_key": null,
            "trigger": "sort",
            "view": "list_w",
            "source": null,
            "location": {
                "lat": null,
                "long": null,
                "city": null,
                "state": null,
                "zip": null,
                "auto": true
            },
            "filters": {
                "type": [
                    "course",
                    "document",
                    "question"
                ],
                "doc_type": [],
                "course": null,
                "subject": null
            },
            "sort": "created",
            "limit": opt.limit,
            "offset": opt.offset,
            "suggestion": null
        }
    })
}

module.exports = {
    request,
    getAssetsList
}