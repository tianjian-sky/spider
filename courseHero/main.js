const api = require('./api')
const axios = require('axios')
const https = require('https')
const puppeteer = require('puppeteer');

const main = async () => {
    let opt = {
        offset: 0,
        limit: 50,
        keyword: 'economic'
    }
    // 1. 爬取资源列表目录
    // try {
    //     let req = await api.getAssetsList(opt)
    //     console.log(req)
    // } catch (e) {
    //     console.log(e)
    // }
   

    // const options = {
    //     hostname: 'www.coursehero.com',
    //     port: 443,
    //     path: '/',
    //     method: 'GET'
    //   };
      
    //   const req = https.request(options, (res) => {
    //     console.log('statusCode:', res.statusCode);
    //     console.log('headers:', res.headers);
      
    //     res.on('data', (d) => {
    //       process.stdout.write(d);
    //     });
    //   });
      
    //   req.on('error', (e) => {
    //     console.error(e);
    //   });
    //   req.end();
    const browser = await puppeteer.launch({
        headless: false,
        timeout : 300000,
        defaultViewport: {
            width: 1600,
            height: 1200
        }
    });
    const page = await browser.newPage();
    await page.goto('https://www.coursehero.com/subjects/business/', {
        timeout: 300000
    });
    const links = await page.evaluate(resultSelector => {
        const anchors = document.querySelectorAll(resultSelector)
        return Array.from(anchors).map(e => {
            let name = e.innerHTML
            return {
                link: e.getAttribute('href'),
                name
            }
        })
    }, '.ch-taxonomy-list-resource-summary a:nth-child(2)')
    console.log(links)
    for (e of links) {
        const cat1 = e.name
        let page = await browser.newPage();
        await delay(() => page.goto('https://www.coursehero.com' + e.link, {
            timeout: 300000
        }), 1200);
        let links2 = await page.evaluate(resultSelector => {
            const anchors = document.querySelectorAll(resultSelector)
            return Array.from(anchors).map(e => {
                let name = e.innerHTML
                return {
                    link: e.getAttribute('href'),
                    name
                }
            })
        }, '#subject-taxonomy-qa-container .ch-product-details-title a')
        console.log(links2)
        for (qlink of links2) {
            const page = await browser.newPage();
            await delay(() => page.goto('https://www.coursehero.com' + qlink.link, {
                timeout: 300000
            }), 1200)
            let document = await page.evaluate(resultSelector => {
                const body = document.querySelector(resultSelector)
                const title = body.querySelector('.abRemoveTitle') && body.querySelector('.abRemoveTitle').innerText
                const abstract = body.querySelector('.abPRemoveTitle') && body.querySelector('.abPRemoveTitle').innerHTML
                return {
                    title,
                    abstract
                }
            }, 'body')
            document.subject1 = 'business'
            document.subject2 = cat1
            console.log(document)
            page.close()
        }
        page.close()
    }
}

main()

async function getQuestions (link, param) {

}


async function delay(func, delay) {
    await new Promise((res, rej) => {
        setTimeout(async () => {
            let v = await func()
            return res(v)
        }, delay)
    })
} 
