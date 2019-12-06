const https = require('http')
const axios = require('axios')

const request = (opt) => {
    let method = 'GET'
    const query = 'a'
    const trackid = '7b22c0b38a7c'
    const strackid = '0adde3291980'
    const search_data = '%7B%22chgsec%22%3A%22searchsection%22%2C%22chgsubcomp%22%3A%22serp%22%2C%22state%22%3A%22NoState%22%2C%22profile%22%3A%22textbooks-srp%22%2C%22page-number%22%3A' + opt.pageNum + '%7D'
    const token = '522e4268628bac6d2d9bcb496478a240'
    const event = 'serp'
    const headers = {
        cookie: 'C=0; O=0; V=f2c915e643799e402218f01374714e175d23f42340c0c8.44355660; _pxvid=ac283131-a1ec-11e9-b1f5-0242ac12000e; _sdsat_oneTrustCookie=,0_179421,snc,0_189848,0_182337,prf,0_189849,fnc,0_182338,trg,0_182339,0_182867,0_182340,0_182341,0_182866,0_189806,0_189847,0_188114,0_178769,0_186627,; _sdsat_oneTrustPerformanceCookie=true; _sdsat_isAdobeOptOut=false; _sdsat_oneTrustTargetingCookie=true; adobeujs-optin=%7B%22aam%22%3Atrue%2C%22adcloud%22%3Atrue%2C%22aa%22%3Atrue%2C%22campaign%22%3Atrue%2C%22ecid%22%3Atrue%2C%22livefyre%22%3Atrue%2C%22target%22%3Atrue%2C%22videoaa%22%3Atrue%7D; _ga=GA1.2.180307044.1562637356; _gcl_au=1.1.1547386291.1562637356; s_ecid=MCMID%7C06478841358910807100770655455556145811; aam_tnt=aam%3D2053348; aam_uuid=06450375704403830360774608678386093737; _fbp=fb.1.1562637357307.2009243997; LPVID=A5OWVmMzY0MTcwN2I5MzY1; cto_lwid=d45a1996-9e29-498e-8443-4a0a7ea5d620; __gads=ID=35aca0fa16b51899:T=1562637410:S=ALNI_MamPIqTsiuUAqjvYz6THM89ODBn_Q; csrftoken=qugQyPFWHVJcGTm6kCYk4a4Q3tvTpuvHX8rLeAi6yXeR4Wsyw9kOi1aCosklE5VX; U=759d607867123d4b3c537c063ce6929a; aamsc=aam%3D2053348%2Caam%3D2756555%2Caam%3D10684699; _hjid=97613900-1930-406a-a4a6-0457d8aaeb90; mbox=PC#935bbbe7b97748f9b0d36b4835d5b953.22_20#1626674310|session#245da5b7c4814db89b2005c0e6ceaee8#1563431369; user_geo_location=%7B%22country_iso_code%22%3A%22CN%22%2C%22country_name%22%3A%22China%22%2C%22region%22%3A%2223%22%2C%22region_full%22%3A%22Shanghai%22%2C%22city_name%22%3A%22Shanghai%22%7D; AMCVS_3FE7CBC1556605A77F000101%40AdobeOrg=1; _sdsat_testPrepUserStatus=; _sdsat_uvn=f2c915e643799e402218f01374714e175d23f42340c0c8.44355660; _sdsat_userSHA1Email=a678e522d10fee95c795460e3ba67d4b105dc0a1; _sdsat_clickTaleOverride=; _gid=GA1.2.1958047549.1564574792; _sdsat_mathSubscriptionStatus=; LPSID-51961742=I0BW8ZIDSUqT9f3a7JLDBQ; WRIgnore=true; PHPSESSID=elok45c0i2or9md6hcqvs3ltni; CSessionID=82f2b433-54ee-427c-9fef-7c436136013e; exp=A311C%7CA579I%7CA586B%7CA591B%7CA783B%7CA799B%7CA803B%7CC008A%7CP569C%7CP570C%7CP571C%7CA919C%7CA229A%7CA224D%7CA690B%7CA223B%7CA704B%7CP781A%7CA560B%7CP265J%7CA594A%7CA609C%7CA608A%7CA924B%7CA117C%7CA538A; expkey=C8D1FBB6825C8016F7A90B84D909D75A; sessionid=ka9jbh0g4ornghcpv8k2p0tc7vb3b9dv; AMCV_3FE7CBC1556605A77F000101%40AdobeOrg=-715282455%7CMCIDTS%7C18109%7CMCMID%7C06478841358910807100770655455556145811%7CMCAAMLH-1565254061%7C11%7CMCAAMB-1565254061%7CRKhpRz8krg2tLO6pguXWp5olkAcUniQYPHaMWWgdJ3xzPWQmdj0y%7CMCOPTOUT-1564656461s%7CNONE%7CMCAID%7CNONE%7CvVersion%7C4.2.0%7CMCCIDH%7C890535661; _sdsat_cheggUserUUID=; _sdsat_authState=; _sdsat_cheggStudySubscriptionStatus=; _sdsat_geolocCountry=; _gat=1; _sdsat_cheggUserUUIDMC=; _px=+lfoXd900LxpJRyGPKlxB1yIFNt30/AHr97u2oxFefHvQv+qU18xkwSSwPaTd5iNP/VeX/6OZK3JHBp6LKmlyg==:1000:afeYcL5sMftyyVaTQEimTSojMCYVYTVT9Ldh2mw5vNSOYWcVCOtRSZOauyv6ulMv/uvWbIPwJMUdx077akDIi2HnOPq5e+G+aIp57ZLIqSyuwSWQ22QLFTlHY1bSAUHCsyh8S9wXdavDu4mRcqeZawN9PFJeJ4cx7jnCP8ukF4eG77yUBEjEJG/fXLVm4uu4HrKlL73tSZvqiq7GJ3zipPF8KI5YvzuXIWj4u5x8hLgA3tywrTAc0sT35Hw1Jn1ZG/JHoheWfy7acFmw+nCVTw==; _px3=003e25af84ad00cb2546f2d2872e7eb75032eb941900b46ecbeb56ddae44ce0f:+lfoXd900LxpJRyGPKlxB1yIFNt30/AHr97u2oxFefHvQv+qU18xkwSSwPaTd5iNP/VeX/6OZK3JHBp6LKmlyg==:1000:xqX8ejj9k7eSBWryVhAxE94pWMV6uZMk2gTtBlxYm7ET1vDuJLwzZlFN7Nrz6NaoYaluUL6eqTFgsxc4SNT7v0QDN6y1z/rOCI++LbFVzlTp3H9EafVn/W08XACkTBDTp+crvM9d36+Fg8cCtFBjuE8eODeXBy7GRjrg47tfr9g=; __CT_Data=gpv=53&ckp=tld&dm=chegg.com&apv_79_www33=53&cpv_79_www33=53; _gali=autosuggest-input; s_pers=%20buFirstVisit%3Dtb%252Ccs%252Ccore%252Cwt%252Cmath%252Cothers%252Ctut%252Ctp%252Cebk%7C1722485889321%3B%20gpv_v6%3Dchegg%257Cweb%257Ctb%257Cseo%257Crent%7C1564651082939%3B; s_sess=%20buVisited%3Dtb%252Cebk%252Ccore%3B%20s_cc%3Dtrue%3B%20s_ptc%3D0.00%255E%255E0.00%255E%255E0.00%255E%255E0.00%255E%255E0.62%255E%255E0.05%255E%255E1.64%255E%255E0.09%255E%255E2.37%3B%20cheggCTALink%3Dfalse%3B%20SDID%3D38CEF009E2B11D84-0079FC40B9CB79A9%3B%20s_sq%3Dcheggincglobal%253D%252526c.%252526a.%252526activitymap.%252526page%25253Dchegg%2525257Cweb%2525257Ctb%2525257Cseo%2525257Crent%252526link%25253DSubmit%252526region%25253DBODY%252526pageIDType%25253D1%252526.activitymap%252526.a%252526.c%252526pid%25253Dchegg%2525257Cweb%2525257Ctb%2525257Cseo%2525257Crent%252526pidt%25253D1%252526oid%25253Dhttps%2525253A%2525252F%2525252Fwww.chegg.com%2525252Fetextbooks%2525252Fbusiness-and-economics-3%25252523%252526ot%25253DA%3B; OptanonConsent=landingPath=NotLandingPage&datestamp=Thu+Aug+01+2019+16%3A48%3A04+GMT%2B0800+(%E4%B8%AD%E5%9B%BD%E6%A0%87%E5%87%86%E6%97%B6%E9%97%B4)&version=5.0.0&EU=false&AwaitingReconsent=false&groups=0_179421%3A1%2Csnc%3A1%2C0_189848%3A1%2C0_182337%3A1%2Cprf%3A1%2C0_189849%3A1%2Cfnc%3A1%2C0_182338%3A1%2Ctrg%3A1%2C0_182339%3A1%2C0_182867%3A1%2C0_182340%3A1%2C0_182341%3A1%2C0_182866%3A1%2C0_189806%3A1%2C0_189847%3A1%2C0_188114%3A1%2C0_178769%3A1%2C0_186627%3A1; eupubconsent=BOkmoivOkmoivAcABBENCXwAAAAoR7__f_93_8_v1_Z_NuzvOt_j_ef93VW8fPIvcEtzhY5dXuvUzxc4m_0PRc9ycgx85eprGsoxQ7qCsG6ROgd-xt__3ziXFohLgAAAAAAAAAAAAA',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36',

    }
    let loc = `https://www.chegg.com/_ajax/federated/search?query=${query}&trackid=${trackid}&strackid=${strackid}&search_data=${search_data}&token=${token}&event=${event}`
    return axios({
        method,
        headers,
        url: loc,
        // data: opt.data || null
    });
}

async function start () {
    let resp =request(1).then(resp => {
        console.log(resp)
    })
    // console.log(1, resp.textbooks)
}

start()
