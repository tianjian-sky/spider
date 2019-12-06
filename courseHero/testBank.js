const env = 'dev' //process.env.NODE_ENV
const config = require('../config/courseHero')[env]
console.log(config, env)
const DbClient = require('../mongodb')
const puppeteer = require('puppeteer')
const helper = require('../utils/helper')

const domain = 'https://www.coursehero.com/'



console.log(process.env.NODE_ENV)

let db
let mongoClient
let browser
let page
let CUR_URL

async function delay(func, delay) {
    await new Promise((res, rej) => {
        setTimeout(async () => {
            let v = await func()
            return res(v)
        }, delay)
    })
}

async function insertDocument (documents) {
    if (!db) db = mongoClient.client.db(config.mongo.dbName)
    const collection = 'chegg_textbook_study_' // TODO:
    console.log(collection, documents)
    for (let document of documents) {
        let [err, result] = await mongoClient.findDocuments(db, collection, {source_id: document.source_id})
        if (!result.length) {
            let [err, result] = await mongoClient.insertDocuments(db, collection, [document])
            if (err) {
                console.log(err)
            }
        } else {
            let [err, result] = await mongoClient.updateDocument(db, collection, {source_id: document.source_id}, document)
            if (err) {
                console.error('更新失败')
                console.log(err)
            }
        }
    }
}

async function start (pageContinueIndex) {
    mongoClient = await new DbClient(config)
    await login()
    if (!db) db = mongoClient.client.db(config.mongo.dbName)
    if (browser) {
        await browser.close();
    }
    if(mongoClient) {
        mongoClient.close()
    }
    
    await page.waitForSelector('.Find', {
        timeout: 24*3600*1000
    })

    await page.type('.Find',"test bank");

    await page.waitForSelector('.resultsItemContainer', {
        timeout: 24*3600*1000
    })

    let cookieList = await page.cookies()
    let cookie = helper.getCookieFromArray(cookieList)
    page.setExtraHTTPHeaders({
        cookie: cookie,
        // referer: 'https://www.chegg.com/etextbooks/',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36',
        'upgrade-insecure-requests': '1',
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
        'accept-encoding': 'gzip, deflate, br',
        'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8',
    })
    fetchPage()
}

async function login () {
    let cookieList, cookie
    if (!browser) {
        browser = await puppeteer.launch({
            headless: false,
            timeout : 24*3600*1000,
            defaultViewport: {
                width: 1600,
                height: 1200
            }
        })
    }
    if (!page) {
        page = await browser.newPage();
    }
    await page.goto(`https://www.coursehero.com/`, {
        timeout: 24*3600*1000
    })
    cookieList = await page.cookies()
    cookie = helper.getCookieFromArray(cookieList)
    page.setExtraHTTPHeaders({
        cookie: cookie,
        // referer: 'https://www.chegg.com/etextbooks/',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36',
        'upgrade-insecure-requests': '1',
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
        'accept-encoding': 'gzip, deflate, br',
        'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8',
    })
    await page.waitForSelector('#ch_login_button', {
        timeout: 24*3600*1000
    })

    let bookInfo = await page.evaluate(() => {
        const btn = document.querySelector('#ch_login_button')
        btn.click()
    })

    await page.waitForNavigation({
        timeout: 24*3600*1000,
        waitUntil: 'domcontentloaded'
    })

    cookieList = await page.cookies()
    cookie = helper.getCookieFromArray(cookieList)
    page.setExtraHTTPHeaders({
        cookie: cookie,
        // referer: 'https://www.chegg.com/etextbooks/',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36',
        'upgrade-insecure-requests': '1',
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
        'accept-encoding': 'gzip, deflate, br',
        'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8',
    })

    // await page.type('#email-address-field',"fsmdbnf@outlook.com");
    // await page.type('#password-field','kkkkkk');

    await page.waitForNavigation({
        timeout: 24*3600*1000,
        waitUntil: 'domcontentloaded'
    })
}

async function fetchPage (curLink, page ) {
    let detailList = await page.evaluate(resultSelector => {
        const nextLinkEle = document.querySelectorAll(resultSelector)
        let res = []
        if (nextLinkEle && nextLinkEle.length) {
            for (var i = 0; i < nextLinkEle.length; i++) {
                res.push({
                    link: nextLinkEle[i].getAttribute('href')
                })
            }
        }
        return res
    }, '.snippetLink')
    console.log('1级路径:', detailList)
    if (detailList) {
        for (var i = 0; i < detailList.length; i++) {
            let detailLink = detailList[i]
            let baseLink = detailLink.link
            if (!db) db = mongoClient.client.db(config.mongo.dbName)
            const collection = 'courseHero_test_bank'
            let [err, result] = await mongoClient.findDocuments(db, collection, {source_id: baseLink})
            if ((!err && !result.length)) { // 如果传入章节的断点就必须继续爬
                let documents = []
                await fetchDoc(detailLink, documents)
                insertDocument(documents)
            }
        }
    }
    let nextLink = await page.evaluate(resultSelector => {
        const nextLinkEle = document.querySelector(resultSelector)
        if (nextLinkEle) {
            nextLinkEle.click()
        }
    }, '.next')
    await fetchPage(page)
}


async function fetchDoc (curLink, page , documents) {
    let cookieList = await page.cookies()
    let cookie = helper.getCookieFromArray(cookieList)
    curLink = domain + curLink.link
    page.setExtraHTTPHeaders({
        cookie: cookie,
        referer: CUR_URL,
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36',
        'upgrade-insecure-requests': '1',
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
        'accept-encoding': 'gzip, deflate, br',
        'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8',
    })
    await page.goto(curLink, {
        timeout: 24*3600*1000
    })

    await page.waitForSelector('.bdp_body_container', {
        timeout: 24*3600*1000
    })

    let bookInfo = await page.evaluate(() => {
        const container = document.querySelector('.bdp_body_container')
        let title = document.querySelector('.bdp_title_heading') && document.querySelector('.bdp_title_heading').innerText
        let school = document.querySelector('[data-cha-target-name="tagged_school_link"]') && document.querySelector('[data-cha-target-name="tagged_school_link"]').innerText
        let author = document.querySelector('[itemprop="author"]') && document.querySelector('[itemprop="author"]').innerText
        const bookInfo = {
            title,
            school,
            author
        }
        return bookInfo
    })
    bookInfo.source_id = curLink
    documents.push(boookInfo)
}

start('', '')