const fs = require('fs')
const path = require('path')
const basePath = './courseHero'
const config = require('../config/courseHero')
const DbClient = require('../mongodb')


const curdate = getCurDate()
const filePath = path.resolve(basePath + '/feeds/' + curdate);

let idHash = {}
let documents = []

fs.readdir(filePath, (err, files) => {
    console.log(filePath,files)
    if (files && files.length) {
        for (jsonFile of files) {
            if (jsonFile != 'visited.json') {
                const jsonPath = path.resolve(basePath + '/feeds/' + curdate + '/' + jsonFile)
                let txt = fs.readFileSync(jsonPath)
                if (txt) {
                    let jsonObj = JSON.parse(txt)
                    processListObj(jsonObj, idHash)
                }
            }
        }
        insertOrUpdateDocuments(documents)
    }
})




function getCurDate() {
    let date = new Date()
    let y = date.getFullYear()
    let m = date.getMonth() + 1
    let d = date.getDate()
    return '' + y + (m < 10 ? '0' + m : m + '') + (d < 10 ? '0' + d : d + '')
}

function processListObj (obj, idHash) {
    let list = obj && obj.results || []
    for (item of list) {
        try {
            let document = {}
            document.type = item.core.type
            document.date = item.core.date
            document.title = item.core.text
            document.short_title = item.core.title
            document.url = item.core.url
            document.source_id= item.question.question_id
            
            let hash = (document.type || '') + document.source_id
            if (hash in idHash) continue
            idHash[hash] = 1
            if (!document.source_id) {
                console.error('无id：' + JSON.stringify(item))
            }

            if (item.taxonomy && item.taxonomy.course) {
                document.course_id = item.taxonomy.course.course_id
                document.course_num = item.taxonomy.course.course_num
                document.course_url = item.taxonomy.course.course_url
            }
            if (item.taxonomy && item.taxonomy.department) {
                document.dept_id = item.taxonomy.department.dept_id
                document.dept_no = item.taxonomy.department.dept_acro
                document.department_url = item.taxonomy.department.dept_url
            }
            if (item.taxonomy && item.taxonomy.school) {
                document.school_id = item.taxonomy.school.school_id
                document.school_name = item.taxonomy.school.school_name
                document.school_url = item.taxonomy.school.school_url
            }
            if (item.taxonomy && item.taxonomy.subject) {
                document.subject_id = item.taxonomy.subject.subject_id
                document.subject_name = item.taxonomy.subject.subject_name
            }
            // console.log(document)
            documents.push(document)
        } catch (e) {
            console.error(e)
            console.error('报错：', item)
        }
    }
}

async function insertOrUpdateDocuments (documents) {
    let mongoClient = await new DbClient()
    const db = mongoClient.client.db(config.mongo.dbName)
    const collection = 'cousehero_question'
    for (doc of documents) {
        let type = doc.type
        let source_id = doc.source_id 
        let [err, result] = await mongoClient.findDocuments(db, collection, {type, source_id})
        console.log(result)
        if (!result.length) {
            let [err, result] = await mongoClient.insertDocuments(db, collection, [doc])
            if (err) {
                console.error('插入失败')
            }
            if (result.length) {
                let hash = (doc.type || '') + doc.source_id
                if (hash in idHash) continue
                idHash[hash] = 1
            }
        } else {
            let [err, result] = await mongoClient.updateDocument(db, collection, {type, source_id}, doc)
            if (err) {
                console.error('更新失败')
            }
            if (result.length) {
                let hash = (doc.type || '') + doc.source_id
                if (hash in idHash) continue
                idHash[hash] = 1
            }
        }
    }
    mongoClient.client.close()
}