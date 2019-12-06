const config = require('../../config/chegg')
const DbClient = require('../../mongodb')
const puppeteer = require('puppeteer')
const helper = require('../../utils/helper')

const domain = 'https://www.chegg.com/'


let db
let mongoClient
let browser
let page


async function delay(func, delay) {
    await new Promise((res, rej) => {
        setTimeout(async () => {
            let v = await func()
            return res(v)
        }, delay)
    })
}

async function insertDocument (category, document) {
    if (!db) db = mongoClient.client.db(config.mongo.dbName)
    const collection = 'chegg_textbook_study_' + category
    console.log(collection, document)
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

async function start () {
    mongoClient = await new DbClient(config)
    if (!db) db = mongoClient.client.db(config.mongo.dbName)
    const categories = ['_mathematics', '_history', '_business-and-economics' , '']
    // for (let category of categories) {
    //     const collectionName = 'chegg_textbook' + category
    //     let [err, list] = await mongoClient.findDocuments(db, collectionName, '*')
    //     if (!err) {
    //         for (let book of list) {
    //             const bookName = book.title
    //             await fetchStudyBook(bookName, category.replace('_', ''))
    //         }
    //     }
    // }
    await login()
    await continueBreakFetch ('/homework-help/calculus-8-edition-solutions-9781285740621', '/homework-help/calculus-8-edition-solutions-9781285740621', '/homework-help/calculus-8th-edition-chapter-1.r-problem-18e-solution-9781285740621','CH1.R', '18E', 'mathematics')
}

async function login () {
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
    await page.goto(`https://www.chegg.com/auth?action=login`, {
        timeout: 24*3600*1000
    })
    await page.waitForSelector('.credentials-container', {
        timeout: 24*3600*1000
    })

    await page.type('#emailForSignIn',"532861047@qq.com");
    await page.type('#passwordForSignIn','ABCabc123');

    await page.click('.login-button');


    await page.waitForSelector('.heroimg', {
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
}


async function continueBreakFetch (source_id, baseLink, link ,chapter, questionIndex, category) {
    if (!db) db = mongoClient.client.db(config.mongo.dbName)
    const collection = 'chegg_textbook_study_' + category

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
    page.setExtraHTTPHeaders({
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36'
    })
    let [err, result] = await mongoClient.findDocuments(db, collection, {source_id})
    if (!err && result[0]) {
        let record = result [0]
        await fetchStudy({link}, page, record, chapter, baseLink, category, questionIndex)
    }
}

async function fetchStudyBook (bookName, category) {
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
    await page.goto(`https://www.chegg.com/search/${encodeURIComponent(bookName)}/study#p=1`, {
        timeout: 24*3600*1000
    });

    await page.waitForSelector('.C-search-serp-federated', {
        timeout: 24*3600*1000
    })

    let nextLink = await page.evaluate(resultSelector => {
        const nextLinkEle = document.querySelector(resultSelector) && document.querySelector(resultSelector).querySelector('a')
        if (nextLinkEle) {
            return {link: nextLinkEle.getAttribute('href').replace(/\?.*/, '')}
        } else {
            return null
        }
    }, '.C-fed-serp-tbs-book-inline')
    console.log('nextLink:', nextLink)
    if (nextLink) {
        const record = {chapters: {}}
        await fetchStudy(nextLink, page, record, '', nextLink.link, category)
    } else {
        page.close()
    }
}

async function fetchStudy (curLink, page, record, chapter, baseLink, category, curQuestionIndex) {
    console.log(curLink, chapter, curQuestionIndex)
    let cookieList = await page.cookies()
    let cookie = helper.getCookieFromArray(cookieList)
    curLink = domain + curLink.link
    page.setExtraHTTPHeaders({
        cookie: cookie,
        // referer: 'https://www.chegg.com/etextbooks/',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36',
        'upgrade-insecure-requests': '1',
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
        'accept-encoding': 'gzip, deflate, br',
        'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8',
    })
    await page.goto(curLink, {
        timeout: 24*3600*1000
    })

    await page.waitForSelector('.solution-player', {
        timeout: 24*3600*1000
    })

    
    let cha = await page.evaluate(([resultSelector, chapter]) => {
        // console.log(111, resultSelector, chapter)
        const res = {}
        let curCha
        const options = document.querySelector(resultSelector) && document.querySelector(resultSelector).querySelectorAll('option')
        for (var i = 0; i < options.length; i++) {
            if (!chapter || chapter == options[i].innerText) {
                curCha = options[i]
                break
            }
        }
        if (curCha) {
            res.chapter = curCha.innerText
        }
        const nextCha = curCha && curCha.nextElementSibling
        if (nextCha && nextCha.tagName.toLowerCase() == 'option') {
            res.nextCha = {
                chapter: nextCha.innerText,
                chapterIndex: nextCha.innerText
            }
        }
        return res
    }, ['.player-chapter', chapter])
    let nextChapter = cha.nextCha
    if (cha.chapter && !record.chapters[cha.chapter]) {
        record.chapters[cha.chapter] = []
    }
    if (!chapter) {
        chapter = cha.chapter
        let bookInfo = await page.evaluate(([resultSelector]) => {
            const container = document.querySelector(resultSelector)
            const bookInfo = {
                title: '',
                version: '',
                isbn: '',
                isbn13: '',
                author: '',
                cover: ''
            }
            if (container) {
                let title = container.querySelector('.title') && container.querySelector('.title').innerText || ''
                bookInfo.title = title.split('|')[0]
                bookInfo.version = title.split('|')[1]
                bookInfo.cover = container.querySelector('.book-cover') && container.querySelector('.book-cover').getAttribute('src').replace(/^.*\/\//, 'https://') || ''

                let infos = container.querySelectorAll('.item')
                for (var i = 0; i < infos.length; i++) {
                    let info = infos[i]
                    let label = info.querySelector('.label')
                    let value = info.querySelector('.value')
                    if (label && label.innerText.toUpperCase().indexOf('ISBN-13') >= 0) {
                        bookInfo.isbn13 = value.innerText
                    } else if (label && label.innerText.toUpperCase().indexOf('ISBN') >= 0) {
                        bookInfo.isbn = value.innerText
                    } else if (label && label.innerText.toUpperCase().indexOf('AUTHOR') >= 0) {
                        bookInfo.author = value.innerText
                    }
                }
            }
            return bookInfo
        }, ['.corresponding-textbook'])
        Object.assign(record, bookInfo)
    }
    
    let question = {title: '', steps: []}
    let questionTitle = await page.evaluate(resultSelector => {
        const title = document.querySelector(resultSelector) && document.querySelector(resultSelector).querySelector('.question')
        if (title) {
            let content = fixUrl(title.innerHTML)
            return { content }
        } else {
            return {}
        }
        function fixUrl (rawContent) {
            if (rawContent.match(/src="\/\//)) {
                rawContent = rawContent.replace(/src="\/\//g, 'src="https://')
            }
            return rawContent
        }
    }, '.textbook-question-area')
    if (questionTitle.content) {
        question.title = questionTitle.content
    }

    let questionIndex = await page.evaluate(([resultSelector, curQuestionIndex]) => {
        const res = {}
        const lis = document.querySelector(resultSelector) && document.querySelector(resultSelector).querySelectorAll('option')
        let indexEle
        for (var i = 0; i < lis.length; i++) {
            if(!curQuestionIndex || lis[i].innerText == curQuestionIndex) {
                indexEle = lis[i]
                break
            }
        }
        if (indexEle) {
            let content = indexEle.innerText
            res.questionIndex = content
        }
        if (indexEle && indexEle.nextElementSibling && indexEle.nextElementSibling.tagName.toLowerCase() == 'option') {
            res.nextLink = {
                link: indexEle.nextElementSibling.getAttribute('value'),
                questionIndex:  indexEle.nextElementSibling.innerText
            }
        }
        return res
    }, ['.player-problem', curQuestionIndex || ''])
    if (questionIndex.questionIndex) {
        question.questionIndex = questionIndex.questionIndex
    }
    let nextLink = questionIndex.nextLink

    let questionStep = await page.evaluate(resultSelector => {
        const steps = document.querySelector(resultSelector) && document.querySelector(resultSelector).querySelectorAll('li')
        if (steps && steps.length) {
            let result = []
            for (var i = 0; i < steps.length; i++) {
                result.push ({
                    content: fixUrl(steps[i].querySelector('.step-content') && steps[i].querySelector('.step-content').innerHTML || ''),
                    comments: fixUrl(steps[i].querySelector('.step-comments') && steps[i].querySelector('.step-comments').innerHTML || ''), 
                })
            }
            return result
        } else {
            return []
        }
        function fixUrl (rawContent) {
            if (rawContent.match(/src="\/\//)) {
                rawContent = rawContent.replace(/src="\/\//g, 'src="https://')
            }
            return rawContent
        }
    }, '.solution-player-steps')
    if (questionStep && questionStep.length) {
        question.steps = questionStep
        record.chapters[chapter].push(question)
    }

    if (nextLink) {
        insertDocument(category, {
            category,
            source_id: baseLink,
            ...record
        })
        await fetchStudy (nextLink, page, record, chapter, baseLink, category, nextLink.questionIndex) 
    } else if (nextChapter) {
        let nextChaSymbol = nextChapter.chapter && nextChapter.chapter.replace('CH', '').toLowerCase() // CH1.R -> 1.r
        // https://www.chegg.com/homework-help/calculus-8th-edition-solutions-9781285741550?trackid=fb84b6e93103&strackid=1269475311c9&ii=1
        // https://www.chegg.com/homework-help/calculus-8th-edition-chapter-1.r-solutions-9781285741550
        nextLink = baseLink.replace(/-solutions/, '-chapter-' + nextChaSymbol + '-solutions')
        insertDocument(category, {
            category,
            source_id: baseLink,
            ...record
        })
        await fetchStudy ({ link: nextLink }, page, record, nextChapter.chapterIndex, baseLink, category) 
    } else {
        console.log(record)
        insertDocument(category, {
            category,
            source_id: baseLink,
            ...record
        })
    }
}

start()