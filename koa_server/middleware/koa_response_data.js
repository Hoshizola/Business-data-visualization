//处理业务逻辑，读取某个json文件数据
const path = require('path')
const fileUtils = require('../utils/file_utils')
module.exports = async (ctx, next) => {
    //url => localhose:8888/api/seller
    const url = ctx.request.url
    let filePath = url.replace('/api','')
    filePath = '../data' + filePath + '.json'
    filePath = path.join(__dirname, filePath)
    try{
        let result = await fileUtils.getFileJsonData(filePath)
        ctx.response.body = result
    }catch(error){
        let errorMsg = {
            message: '读取文件内容失败',
            status: 404
        }
        ctx.response.body = JSON.stringify(errorMsg)
    }
    
    await next() 
}