const env = 'pro' //process.env.NODE_ENV
const config = require('../../config/chegg')[env].mongo
const DbClient = require('../../mongodb')
const puppeteer = require('puppeteer')
const helper = require('../../utils/helper')

const domain = 'https://www.chegg.com/'



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

async function insertDocument (category, documents) {
    if (!db) db = mongoClient.client.db(config.dbName)
    const collection = 'chegg_textbook_study_' + category
    console.log(collection, documents)
    for (let document of documents) {
        let [err, result] = await mongoClient.findDocuments(db, collection, {questionId: document.questionId})
        if (!result.length) {
            let [err, result] = await mongoClient.insertDocuments(db, collection, [document])
            if (err) {
                console.log(err)
            }
        } else {
            let [err, result] = await mongoClient.updateDocument(db, collection, {questionId: document.questionId}, document)
            if (err) {
                console.error('更新失败')
                console.log(err)
            }
        }
    }
}

async function start (bookContinueIndex, chapterContinueIndex, questionContinueIndex) {
    mongoClient = await new DbClient(config)
    await login()
    console.log(mongoClient.client)
    if (!db) db = mongoClient.client.db(config.dbName)
    const categories = [ '_mathematics','_business-and-economics', '_history']
    for (let category of categories) {
        const collectionName = 'chegg_textbook' + category
        let [err, list] = await mongoClient.findDocuments(db, collectionName, '*')
        if (!err) {
            for (var i = 0; i < list.length; i++ ) {
                console.log(list[i], i, bookContinueIndex)
                if (bookContinueIndex >= 0 && i < bookContinueIndex) continue
                let book = list[i]
                const bookName = book.title
                await fetchStudyBook(bookName, category.replace('_', ''), chapterContinueIndex, questionContinueIndex)
                if (bookContinueIndex && bookContinueIndex == i) {
                    chapterContinueIndex = null
                    questionContinueIndex = null
                }
            }
        }
    }
    
    // await continueBreakFetch ('/homework-help/calculus-8-edition-solutions-', '/homework-help/calculus-8-edition-solutions-9781285741550', '/homework-help/calculus-8-edition-solutions-9781285741550','', '', 'mathematics')
    if (browser) {
        await browser.close();
    }
    if(mongoClient) {
        mongoClient.close()
    }
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
    await page.goto(`https://www.chegg.com/auth?action=login&redirect=https%3A%2F%2Fwww.chegg.com%2Fstudy`, {
        timeout: 24*3600*1000
    })
    await page.waitForSelector('.credentials-container', {
        timeout: 24*3600*1000
    })

    // await page.type('#emailForSignIn',"22gf@yopmail.com");
    // await page.type('#passwordForSignIn','Abc1233');

    await page.type('#emailForSignIn',"527n@yopmail.com");
    await page.type('#passwordForSignIn','Abc123');

    // await page.click('.login-button');


    // await page.waitForSelector('#autosuggest-input', {
    //     timeout: 24*3600*1000
    // })
    await page.waitForNavigation({
        timeout: 24*3600*1000,
        waitUntil: 'domcontentloaded'
    });
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


async function continueBreakFetch (book_id, baseLink, link ,chapter, questionIndex, category) {
    console.log('logined')
    if (!db) db = mongoClient.client.db(config.dbName)
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
    let record
    let [err, result] = await mongoClient.findDocuments(db, collection, {book_id})
    if (!err && result.length) {
        record = result[0]
        chapter = record.chapterId,
        questionIndex = record.questionid
    }
    await fetchStudy({link}, page, chapter, baseLink, category, questionIndex)
}

async function fetchStudyBook (bookName, category, chapterContinueIndex, questionContinueIndex) {
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
        referer: 'https://www.chegg.com/auth?action=login&redirect=https%3A%2F%2Fwww.chegg.com%2Fstudy',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36',
        'upgrade-insecure-requests': '1',
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
        'accept-encoding': 'gzip, deflate, br',
        'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8',
    })
    CUR_URL = `https://www.chegg.com/search/${encodeURIComponent(bookName)}/study#p=1`
    console.log('pageSearchLink:', CUR_URL)
    await page.goto(CUR_URL, {
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
        let baseLink = nextLink.link
        if (!db) db = mongoClient.client.db(config.dbName)
        const collection = 'chegg_textbook_study_' + category
        let [err, result] = await mongoClient.findDocuments(db, collection, {book_id: baseLink})
        if ((!err && !result.length) || chapterContinueIndex) { // 如果传入章节的断点就必须继续爬
            await fetchStudy(nextLink, page, chapterContinueIndex, nextLink.link, category, questionContinueIndex)
        }
    } else {
        page.close()
    }
}

async function fetchStudy (curLink, page, chapter, baseLink, category, curQuestionIndex) {
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

    await page.waitForSelector('.steps', {
        timeout: 24*3600*1000
    })

    let bookInfo = await page.evaluate(([resultSelector, baseLink]) => {
        const container = document.querySelector(resultSelector)
        const bookInfo = {
            book_title: '',
            version: '',
            isbn: '',
            isbn13: '',
            author: '',
            cover: ''
        }
        if (container) {
            let isbn = baseLink.match(/-(\d{10,})/) && baseLink.match(/-(\d{10,})/)[1]
            let isbn13 = ''
            if (isbn && isbn.length == 13) {
                isbn13 = isbn
                isbn = ''
            }

            // if (!isbn13 && document.querySelector("[property='og:url']") && document.querySelector("[property='og:url']").getAttribute('content'))  {
            //     isbn13 = document.querySelector("[property='og:url']").getAttribute('content').match(/.*-(.*)\?/) && document.querySelector("[property='og:url']").getAttribute('content').match(/.*-(.*)\?/)[1]
            // }
            let title = container.querySelector('.book-title-name') && container.querySelector('.book-title-name').innerText || ''
            let version = container.querySelector('.book-title-name') && container.querySelector('.edition-text').innerText || ''
            bookInfo.book_title = title
            bookInfo.version = version
            bookInfo.isbn = isbn
            bookInfo.isbn13 = isbn13
        }
        return bookInfo
    }, ['.book-info', baseLink])
    bookInfo.book_id = baseLink
    
    let cha = await page.evaluate(([resultSelector]) => {
        const res = {}
        let allChaptersEle =  document.querySelectorAll('.chapter')
        let allChapters = []

        for (var i = 0; i < allChaptersEle.length; i++) {
            allChapters.push({
                chapter: allChaptersEle[i].querySelector('h2') && allChaptersEle[i].querySelector('h2').innerText.replace(/Chapter\s*/, ''),
                id:  allChaptersEle[i].getAttribute('data-id')
            })
        }
        res.allChapters = allChapters
        return res
    }, ['.chapters'])

    console.log('all chapters:', cha, chapter)
    let allChapters = cha.allChapters
    let curChapterIndex = -1
    if (chapter) {
        curChapterIndex = allChapters.findIndex(e => e.chapter == chapter)
    }
    for (var i = 0; i < allChapters.length; i++) {
        let curChapter = allChapters[i]
        if (i < curChapterIndex) {
            continue
        }
        await fetchChapter (curChapter.id,curChapter.chapter, baseLink, category, chapter, curQuestionIndex, bookInfo)
        if (chapter && curChapterIndex == i) {
            curQuestionIndex = null
        }
    }
}

async function fetchChapter (chapterId,chapterSymbol, baseLink, category, beginChapter, beginQuestionSymbol, bookInfo) {
    let questionsForDb = []
    await page.evaluate(([cid]) => {
        const curChapterQuestionsEle = document.querySelector('[data-id="' + cid + '"')
        if (curChapterQuestionsEle.className.indexOf('open') < 0) {
            curChapterQuestionsEle && curChapterQuestionsEle.querySelector('h2') && curChapterQuestionsEle.querySelector('h2').click()
        }
    }, [chapterId])

    await page.waitForSelector('[data-id="' + chapterId + '"] li', {
        timeout: 24*3600*1000
    })

    let chapterQuestions = await page.evaluate(([resultSelector]) => {
        const curChapterQuestionsEle = document.querySelectorAll(resultSelector)
        let chapterQuestions = []
        for (var i = 0; i < curChapterQuestionsEle.length; i++) {
            chapterQuestions.push({
                id: curChapterQuestionsEle[i].getAttribute('data-id')
            })
        }
        return chapterQuestions
    }, ['[data-id="' + chapterId + '"] li'])

    console.log('chapter questions:', chapterQuestions)
    // let visitedQuestionIndex = -1
    // if (curQuestionIndex) {
    //     visitedQuestionIndex = chapterQuestions.findIndex(e => e.id == curQuestionIndex)
    // }
    let beginIndex = -1
    if (beginChapter == chapterSymbol && beginQuestionSymbol) {
        beginIndex = chapterQuestions.findIndex(e => e.id == beginQuestionSymbol)
    }

    for (var i = 0; i < chapterQuestions.length; i++) {
        
        if (i < beginIndex) continue

        console.log('trigger click:', chapterId, chapterQuestions[i].id, new Date())
        await page.click('[data-id="' + chapterId + '"] [data-id="' + chapterQuestions[i].id + '"]');
        await page.evaluate(([cid, qid]) => {
            const curChapterQuestionsEle = document.querySelector('[data-id="' + cid + '"') && document.querySelector('[data-id="' + cid + '"').querySelector('[data-id="'+ qid + '"]')
            curChapterQuestionsEle && curChapterQuestionsEle.click()
        }, [chapterId, chapterQuestions[i].id])

        await page.waitForSelector('.steps li,.no-solution', {
            timeout: 24*3600*1000
        })
        await delay (async () => {
            await fetchQuestion (chapterSymbol, questionsForDb, chapterQuestions[i].id, baseLink, category, bookInfo )
        } , 60000)
    }
    insertDocument(category, questionsForDb)
}

async function fetchQuestion (chapterSymbol, questionsForDb, questionSymbol, baseLink, category, bookInfo) {
    let question = {problem: '', steps: [], questionSymbol, chapterId: chapterSymbol, category, baseLink, ...bookInfo, questionId: `${bookInfo.book_id}_${chapterSymbol}_${questionSymbol}`}
    console.log('start question:', questionSymbol)
    let questionDetail = await page.evaluate(resultSelector => {
        const problem = document.querySelector('.problem-html')
        const steps = document.querySelectorAll(resultSelector)
        let problemHTML = ''
        let stepsList = []
        if (problem) {
            problemHTML = problem.querySelector('.question') && problem.querySelector('.question').innerHTML || problem.innerHTML
        }
        if (steps && steps.length) {
            for (var i = 0; i < steps.length; i++) {
                stepsList.push ({
                    content: fixUrl(steps[i].querySelector('.step-html') && steps[i].querySelector('.step-html').innerHTML || ''),
                    comments: fixUrl(steps[i].querySelector('.comment-box') && steps[i].querySelector('.comment-box').innerHTML || ''), 
                })
            }
        }
        
        return {
            problemHTML,
            stepsList
        }

        function fixUrl (rawContent) {
            if (rawContent.match(/src="\/\//)) {
                rawContent = rawContent.replace(/src="\/\//g, 'src="https://')
            }
            return rawContent
        }
    }, '.steps li')
    if (questionDetail) {
        question.problem = questionDetail.problemHTML
        question.steps = questionDetail.stepsList
        questionsForDb.push(question)
    }
}
start(3, 'P')
// start(0, '16.R', '') // TODO: calculus 12.4