const fs = require('fs');
const path = require('path');

/**
 * 删除文件
 * @param {string} filePath 绝对路径
 * @returns 文件不存在为 0，文件存在为 1
 */
exports.fileDelete = function (filePath) {
    return new Promise((resolve, reject) => {
        try {
            // 判断文件是否存在，若不存在直接返回删除成功
            if (!fs.existsSync(filePath)) resolve(0);
            // 删除文件不用在乎文件是否存在
            else fs.rm(filePath, { force: true }, err => {
                if (err) reject(err);
                else resolve(1);
            });
        } catch (e) {
            console.log(e);
            reject(e);
        }
    })
}

/**
 * 获取文件存储的根文件夹
 * @param {string} fileRoot 文件存储根目录
 * @returns {string}
 */
exports.getFileRoot = function (fileRoot) {
    if (!fileRoot) fileRoot = '/../files';
    fileRoot = path.normalize(fileRoot);
    let absoluteFileRoot = path.resolve(__dirname, '../../', fileRoot);
    return absoluteFileRoot;
}

/**
 * 获取文件存放目录的路径
 * @param {string} tid 
 * @param {string} skuId 
 * @param {number} [orderItemNo]
 */
exports.getImageDir = function (tid, skuId, orderItemNo = 1) {
    return `/${tid}/${skuId}_${orderItemNo}`;
}

/** 递归创建目录 异步方法 */
exports.mkdirs = function (dirname, callback) {
    fs.access(dirname, function (err) {
        if (err.code == "ENOENT") { // 目录不存在
            // console.log(path.dirname(dirname));  
            mkdirs(path.dirname(dirname), function () {
                fs.mkdir(dirname, callback);
                console.log('在' + path.dirname(dirname) + '目录创建好' + dirname + '目录');
            });
        } else {
            callback();
        }
    });
}

/** 递归创建目录 同步方法 */
exports.mkdirsSync = function (dirname) {
    try {
        fs.accessSync(dirname);
        return true;
    } catch (err) {
        if (mkdirsSync(path.dirname(dirname))) {
            fs.mkdirSync(dirname);
            return true;
        }
    }
}