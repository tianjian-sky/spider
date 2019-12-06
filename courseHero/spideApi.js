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
   

    const options = {
        hostname: 'www.coursehero.com',
        port: 443,
        path: '/',
        method: 'GET'
      };
      
      const req = https.request(options, (res) => {
        console.log('statusCode:', res.statusCode);
        console.log('headers:', res.headers);
      
        res.on('data', (d) => {
          process.stdout.write(d);
        });
      });
      
      req.on('error', (e) => {
        console.error(e);
      });
      req.end();
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
