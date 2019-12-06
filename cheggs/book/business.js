const puppeteer = require('puppeteer');
const helper = require('../../utils/helper')
const cookie = 'C=0; O=0; V=f2c915e643799e402218f01374714e175d23f42340c0c8.44355660; _pxvid=ac283131-a1ec-11e9-b1f5-0242ac12000e; _sdsat_oneTrustCookie=,0_179421,snc,0_189848,0_182337,prf,0_189849,fnc,0_182338,trg,0_182339,0_182867,0_182340,0_182341,0_182866,0_189806,0_189847,0_188114,0_178769,0_186627,; _sdsat_oneTrustPerformanceCookie=true; _sdsat_isAdobeOptOut=false; _sdsat_oneTrustTargetingCookie=true; adobeujs-optin=%7B%22aam%22%3Atrue%2C%22adcloud%22%3Atrue%2C%22aa%22%3Atrue%2C%22campaign%22%3Atrue%2C%22ecid%22%3Atrue%2C%22livefyre%22%3Atrue%2C%22target%22%3Atrue%2C%22videoaa%22%3Atrue%7D; _ga=GA1.2.180307044.1562637356; _gcl_au=1.1.1547386291.1562637356; s_ecid=MCMID%7C06478841358910807100770655455556145811; aam_tnt=aam%3D2053348; aam_uuid=06450375704403830360774608678386093737; _fbp=fb.1.1562637357307.2009243997; LPVID=A5OWVmMzY0MTcwN2I5MzY1; cto_lwid=d45a1996-9e29-498e-8443-4a0a7ea5d620; __gads=ID=35aca0fa16b51899:T=1562637410:S=ALNI_MamPIqTsiuUAqjvYz6THM89ODBn_Q; csrftoken=qugQyPFWHVJcGTm6kCYk4a4Q3tvTpuvHX8rLeAi6yXeR4Wsyw9kOi1aCosklE5VX; U=759d607867123d4b3c537c063ce6929a; aamsc=aam%3D2053348%2Caam%3D2756555%2Caam%3D10684699; exp=A311C%7CA579I%7CA586B%7CA591B%7CA783B%7CA799B%7CA803B%7CC008A%7CP569C%7CP570C%7CP571C%7CA919C%7CA229A%7CA224D%7CA690B%7CA223B%7CA704B%7CP781A%7CA560B%7CP265J%7CA594A%7CA924B%7CA117C%7CA538A; sessionid=fxorf8gh9u2lb024k7mzfno0prj1ke87; _hjid=97613900-1930-406a-a4a6-0457d8aaeb90; id_token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodWIuY2hlZ2cuY29tIiwic3ViIjoiODZlNjI1MmEtNTFmYS00YTgxLWFkYTMtMGE5YTA0ZWM0NTY1IiwiYXVkIjoiQ0hHRyIsImV4cCI6MTU3OTE5MzMwMiwiaWF0IjoxNTYzNDIzMzAyLCJlbWFpbCI6IjUzMjg2MTA0N0BxcS5jb20ifQ.L47XKgdra1P8pc-mX5Oo1pPbEBULT7tuo-b9J3vqsTg; mbox=PC#935bbbe7b97748f9b0d36b4835d5b953.22_20#1626674310|session#245da5b7c4814db89b2005c0e6ceaee8#1563431369; PHPSESSID=f50470e6nn2ouulc1nlmie0ilk; user_geo_location=%7B%22country_iso_code%22%3A%22CN%22%2C%22country_name%22%3A%22China%22%2C%22region%22%3A%2223%22%2C%22region_full%22%3A%22Shanghai%22%2C%22city_name%22%3A%22Shanghai%22%7D; AMCVS_3FE7CBC1556605A77F000101%40AdobeOrg=1; _sdsat_testPrepUserStatus=; _sdsat_uvn=f2c915e643799e402218f01374714e175d23f42340c0c8.44355660; _sdsat_userSHA1Email=a678e522d10fee95c795460e3ba67d4b105dc0a1; _sdsat_clickTaleOverride=; _gid=GA1.2.1958047549.1564574792; SU=FD9RrOazxoH9fz6QcELzTiACI2H81ZHbLWJgHuuigO2fv_TwRsndqGr0jErzNYUfAT12KUWYQdfhsMyfUqExottjcA-Hw0wQbwyNjvnQspK7dXF7oUI31OcjgG5fhDlI; CSessionID=fbf3da16-270b-4150-bc58-1c4eccd755b8; expkey=20294C115D92E5318C3FDF6D76D0ED75; _sdsat_mathSubscriptionStatus=; _sdsat_cheggUserUUID=; _sdsat_authState=; _sdsat_cheggStudySubscriptionStatus=; _sdsat_geolocCountry=; _sdsat_cheggUserUUIDMC=; AMCV_3FE7CBC1556605A77F000101%40AdobeOrg=-715282455%7CMCIDTS%7C18109%7CMCMID%7C06478841358910807100770655455556145811%7CMCAAMLH-1565246675%7C11%7CMCAAMB-1565246675%7CRKhpRz8krg2tLO6pguXWp5olkAcUniQYPHaMWWgdJ3xzPWQmdj0y%7CMCOPTOUT-1564649075s%7CNONE%7CMCAID%7CNONE%7CvVersion%7C4.2.0%7CMCCIDH%7C890535661; LPSID-51961742=I0BW8ZIDSUqT9f3a7JLDBQ; _pxff_tm=1; _px=BDYop68nxJywbqoflrS9wNaDPXf4JPLIc62P9Dl0Co2RW8Yr2LRq9uCFA/oLWH5nX7CflxAE6DJQn5Srv/dP+Q==:1000:S4Fhi7gDGM/MKDp6s63MkuC96uOw1rzI1X3M2QYDh4hRmzpm+6syCzxBfnXDSoGCrZg0nbyze2pCAPDEfgm2UFuj1GHXBPRyLoPi4/fvVML+RyIyxW2qGmVa3q4qsl4QqjA+lTxPK7uHOjvKJxZHx43Wv1aWWdqQH/zyrBhZ9Adt9rpKkIqGdN+AR5Uj3xLcwsWmAw/EqVXUBt6NprG1xEarMPghfgJdd2Fhx4zpGS0aDn7fOOLcds+IQpLja4PGwrGcLruSeok70ziUra2cjw==; _px3=7b8bd405cbe954134fee08a88d48eded34cf100954ce837e5b176f30efbb46b2:BDYop68nxJywbqoflrS9wNaDPXf4JPLIc62P9Dl0Co2RW8Yr2LRq9uCFA/oLWH5nX7CflxAE6DJQn5Srv/dP+Q==:1000:Nv6XaNPTqBpwbvqAE9iBTAz5iuyGPLrQ9a3T8sbgEaBcHJYTFfLt3U2KF90kqWX1nMgnqBKw8uDvMe6Hb4hMmVzSDuSwl+Qpg+rekeLJffIz3mj3k1TqcLxn9A7xvOFc+AbvbW1BFsBfbh33MavCrBOQdcQ99F2Y6PiY5rHfrLE=; __CT_Data=gpv=27&ckp=tld&dm=chegg.com&apv_79_www33=27&cpv_79_www33=27; OptanonConsent=landingPath=NotLandingPage&datestamp=Thu+Aug+01+2019+14%3A46%3A13+GMT%2B0800+(%E4%B8%AD%E5%9B%BD%E6%A0%87%E5%87%86%E6%97%B6%E9%97%B4)&version=5.0.0&EU=false&AwaitingReconsent=false&groups=0_179421%3A1%2Csnc%3A1%2C0_189848%3A1%2C0_182337%3A1%2Cprf%3A1%2C0_189849%3A1%2Cfnc%3A1%2C0_182338%3A1%2Ctrg%3A1%2C0_182339%3A1%2C0_182867%3A1%2C0_182340%3A1%2C0_182341%3A1%2C0_182866%3A1%2C0_189806%3A1%2C0_189847%3A1%2C0_188114%3A1%2C0_178769%3A1%2C0_186627%3A1; eupubconsent=BOkmWsTOkmWsTAcABBENCXwAAAAoR7__f_93_8_v1_Z_NuzvOt_j_ef93VW8fPIvcEtzhY5dXuvUzxc4m_0PRc9ycgx85eprGsoxQ7qCsG6ROgd-xt__3ziXFohLgAAAAAAAAAAAAA; s_pers=%20buFirstVisit%3Dtb%252Ccs%252Ccore%252Cwt%252Cmath%252Cothers%252Ctut%252Ctp%252Cebk%7C1722485889321%3B%20gpv_v6%3Dchegg%257Cweb%257Cebk%257Cseo%257Cetextbook%2520landing%7C1564643773336%3B; s_sess=%20buVisited%3Dtb%252Cebk%3B%20s_sq%3D%3B%20s_ptc%3D%3B%20cheggCTALink%3Dfalse%3B%20SDID%3D0BA97B469E3EEF1B-3CD13547B80000D7%3B%20s_cc%3Dtrue%3B'

const baseURL = 'https://www.chegg.com/'


const main = async () => {
    let opt = {
        offset: 0,
        limit: 50,
        keyword: 'economic'
    }
    const browser = await puppeteer.launch({
        headless: false,
        timeout : 300000,
        defaultViewport: {
            width: 1600,
            height: 1200
        }
    });

    // _pxvid=ac283131-a1ec-11e9-b1f5-0242ac12000e; 
    // const page = await browser.newPage();
    // page.setExtraHTTPHeaders({
        // cookie: cookie,
        // referer: 'https://www.chegg.com/etextbooks/',
        // 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36'
    // })
    // await page.goto('https://www.chegg.com/etextbooks/', {
    //     timeout: 300000
    // });
    // let curCookies = await page.cookies()
    // let curCookieStr = helper.getCookieFromArray(curCookies)
    // console.log('cookies:', curCookieStr)
    // const links = await page.evaluate(resultSelector => {
    //     const anchors = document.querySelectorAll(resultSelector)
    //     return Array.from(anchors).map(e => {
    //         let name = e.innerHTML
    //         return {
    //             link: e.getAttribute('href'),
    //             name
    //         }
    //     })
    // }, '.ebook-cat-a a')
    // console.log(links)
    // for (e of links) {
        let page = await browser.newPage();
        page.setExtraHTTPHeaders({
            // cookie: curCookieStr,
            referer: 'https://www.chegg.com/etextbooks/',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36'
        })
        await delay(() => page.goto('https://www.chegg.com/etextbooks/business-and-economics-3/1', {
            timeout: 300000
        }), 1000);

        const hrefElement = await page.$('.category-list a');
        await hrefElement.click();
    // }
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
