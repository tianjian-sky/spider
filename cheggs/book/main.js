/**
 * 
 * 爬取chegg的教材列表 
 * 网站被反爬机制recaptcha保护，所以不定时会弹出验证窗口，需要人工处理。
 * 
 */
const config = require('../../config/chegg')
const DbClient = require('../../mongodb')

const puppeteer = require('puppeteer') // TODO:
const helper = require('../../utils/helper')

let browser
let MAIN_CATEGORY

const main = async () => {
    browser = await puppeteer.launch({
        headless: false,
        timeout : 24*3600*1000,
        defaultViewport: {
            width: 1600,
            height: 1200
        }
    });

    // _pxvid=ac283131-a1ec-11e9-b1f5-0242ac12000e; 
    const page = await browser.newPage();
    page.setExtraHTTPHeaders({
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36'
    })
    await page.goto('https://www.chegg.com/etextbooks/', {
        timeout: 24*3600*1000
    });
    
    let ck2 = await page.cookies()
    let cs2 = helper.getCookieFromArray(ck2)
    await page.waitForSelector('.ebook-cat-a a',{
        timeout: 3600000
    })
    const links = await page.evaluate(resultSelector => {
        const anchors = document.querySelectorAll(resultSelector)
        return Array.from(anchors).map(e => {
            let name = e.innerHTML
            return {
                link: e.getAttribute('href'),
                name
            }
        })
    }, '.ebook-cat-a a')

    /**
     * 目录入口，商科，工科
     */
    MAIN_CATEGORY = 'history'
    for (e of links) {
        // if (e.link.indexOf('business-and-economics') <0) continue
        if (e.link.indexOf(MAIN_CATEGORY) <0) continue
        await fetchBookList({link: e.link}, null,  MAIN_CATEGORY)
        page.close()
    }
    // await fetchBookList({link: 'https://www.chegg.com/etextbooks/business-and-economics-3/3'}, null, MAIN_CATEGORY)
    // page.close()
}

main()


async function delay(func, delay) {
    await new Promise((res, rej) => {
        setTimeout(async () => {
            let v = await func()
            return res(v)
        }, delay)
    })
} 

async function fetchBookList(qlink, pageInstance, category) {
    const page = pageInstance || await browser.newPage();
    let cookieList = await page.cookies()
    let cookie = helper.getCookieFromArray(cookieList)
    page.setExtraHTTPHeaders({
        cookie: cookie,
        referer: 'https://www.chegg.com/etextbooks/',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36',
        'upgrade-insecure-requests': '1',
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
        'accept-encoding': 'gzip, deflate, br',
        'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8',
    })
    await delay(() => page.goto(qlink.link, {
        timeout: 24*3600*1000
    }), 3000)

    await page.waitForSelector('.TextbooksCategory',{
        timeout: 3600000
    })
console.log(1, category)
    let books = await page.evaluate(resultSelector => {
        const book = {
            isbn: '',
            ean: ''
        }
        const books = []
        const bookLinks = document.querySelectorAll(resultSelector)
        
        for (bookLink of bookLinks) {
            let imgUrl = bookLink.querySelector('img') && bookLink.querySelector('img').getAttribute('src') || ''
            if (imgUrl.indexOf('http:') < 0) {
                imgUrl = 'http:' + imgUrl
            }
            let url = bookLink.querySelector('a') && bookLink.querySelector('a').getAttribute('href') || ''
            let title = bookLink.querySelector('.title') && bookLink.querySelector('.title').getAttribute('title') || ''
            let author = bookLink.querySelector('.author') && bookLink.querySelector('.author').innerText || ''
            let version = bookLink.querySelector('.author') && bookLink.querySelector('.author').nextElementSibling && bookLink.querySelector('.author').nextElementSibling.innerText || ''
            books.push({
                url,
                ean: bookLink.getAttribute('data-ean') || '',
                isbn: bookLink.getAttribute('data-isbn') || '',
                cover: imgUrl,
                title,
                version,
                author,
                source_id: url.replace('https://www.chegg.com/textbooks/',''),
                category: 'history'
            })
        }
        return books
    }, 'article')

    for (book of books) {
        // const page = await browser.newPage();
        // let cookieList = await page.cookies()
        // let cookie = helper.getCookieFromArray(cookieList)
        // page.setExtraHTTPHeaders({
        //     cookie: cookie,
        //     referer: 'https://www.chegg.com/etextbooks/',
        //     'user-agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36'
        // })
        // await delay(() => page.goto(book.url, {
        //     timeout: 24*3600*1000
        // }), 1200)
        // await page.waitForSelector('.chg-container',{
        //     timeout: 3600000
        // })
        // let bookDetail = await page.evaluate(resultSelector => {
        //     const container = document.querySelector(resultSelector)
        //     return {
        //         source_id: location.href.replace('https://www.chegg.com/textbooks/',''),
        //         title: container.querySelector('.name') && container.querySelector('.name').innerText || '',
        //         version: container.querySelector('.edition') && container.querySelector('.edition').innerText || '',
        //         author: container.querySelector('.author-link') && container.querySelector('.author-link').innerText || '',
        //         isbn: container.querySelector('[itemprop="isbn"]') && container.querySelector('[itemprop="isbn"]').innerText || '',
        //         isbn13: container.querySelectorAll('.pdp-details-row')[2] && container.querySelectorAll('.pdp-details-row')[2].querySelector('.pdp-details-value') && container.querySelectorAll('.pdp-details-row')[2].querySelector('.pdp-details-value').innerText || '',
        //         cover: container.querySelector('.book-cover') && container.querySelector('.book-cover').getAttribute('src') || ''
        //     }
        // }, 'body')
        // book = Object.assign(book, bookDetail)
        console.log('book:', book)
        await insertOrUpdateDocuments(book, 'history')
        // page.close()
    }
    await page.waitForSelector('.page-link.next',{
        timeout: 30000
    })
    let nextLink = await page.evaluate(resultSelector => {
        console.log('a', resultSelector)
        const nextLinkEle = document.querySelector(resultSelector)
        console.log('nextLink:', nextLinkEle)
        if (nextLinkEle) {
            return {link: nextLinkEle.getAttribute('href')}
        } else {
            return null
        }
    }, '.page-link.next')
    console.log('nextLink:', nextLink)
    if (nextLink) {
        await fetchBookList(nextLink, page, 'history')
    } else {
        page.close()
    }
}

async function insertOrUpdateDocuments (doc, category) {
    let mongoClient = await new DbClient()
    const db = mongoClient.client.db(config.mongo.dbName)
    const collection = 'chegg_textbook_' + category
    let type = doc.type
    let source_id = doc.source_id 
    let [err, result] = await mongoClient.findDocuments(db, collection, {source_id})
    if (!result.length) {
        let [err, result] = await mongoClient.insertDocuments(db, collection, [doc])
        if (err) {
            console.error('插入失败')
        }
        if (result.length) {
            let hash = (doc.type || '') + doc.source_id
            if (!(hash in idHash)) {
                idHash[hash] = 1
            }
        }
    } else {
        let [err, result] = await mongoClient.updateDocument(db, collection, {type, source_id}, doc)
        if (err) {
            console.error('更新失败')
        }
        if (result.length) {
            let hash = (doc.type || '') + doc.source_id
            if (!(hash in idHash)){
                idHash[hash] = 1
            }
        }
    }
    mongoClient.client.close()
}
