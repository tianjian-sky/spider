const getCookieFromArray = (list) => {
    let output = ''
    for(item of list) {
        output += `${item.name}=${item.value};`
    }
    return output
}

module.exports = {
    getCookieFromArray
}