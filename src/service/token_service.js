const CONFIG = require('../../config');
const TOKEN = CONFIG.token;
const FileService = require('./file_service');

const fs = require('fs');
const path = require('path');
const axios = require('axios').default; // 为了获取类型推断

const storePath = path.resolve('../../', CONFIG.application().wechatTokenFile);

// ?grant_type=client_credential&appid=APPID&secret=APPSECRET
const getAccessTokenUrl = "https://api.weixin.qq.com/cgi-bin/token";

/**
 * 获取access_token
 * @returns {Promise<{access_token:string,expires_in:number,timestamp:number}>}
 */
function getAccessToken() {
    return new Promise((resolve, reject) => {
        /** @type {{access_token:string,expires_in:number,timestamp:number}} */
        let token = readAccessToken();
        let now = new Date().getTime();
        // access_token 已存储在文件中，且未过期
        if (token && token.expires_in && token.timestamp && now < token.timestamp + token.expires_in) {
            resolve(token);
        } else {
            updateAccessToken().then(val => {
                resolve(val)
            }).catch(err => {
                reject(err)
            })
        }
    })
}

/**
 * 更新access_token
 * @returns {Promise<{access_token:string,expires_in:number,timestamp:number}>}
 */
function updateAccessToken() {
    return new Promise((resolve, reject) => {
        let timestamp = new Date().getTime();
        axios.get(getAccessTokenUrl, {
            params: {
                grant_type: "client_credential",
                appid: TOKEN().appid,
                secret: TOKEN().appsecret,
            }
        }).then(res => {
            console.log(res);
            res.timestamp = timestamp;
            storeAccessToken(res);
            resolve(res)
        }).catch(err => {
            console.log(err);
            reject(err);
        })
    })
}

/**
 * 将AccessToken存储到文件中
 * @param {string} jsonString 对象JSON化的字符串
 * @returns 
 */
function storeAccessToken(jsonString) {
    console.log('storePath：' + storePath);
    if (fs.existsSync(storePath)) {
        fs.writeFileSync(storePath, jsonString);
        return true;
    } else if (FileService.mkdirsSync(path.dirname(storePath))) {
        fs.writeFileSync(storePath, jsonString);
        return true;
    } else {
        return false;
    }
}

/**
 * 读取文件中保存的AccessToken
 * @returns 
 */
function readAccessToken() {
    console.log('storePath：' + storePath);
    if (fs.existsSync(storePath))
        return JSON.parse(fs.readFileSync(storePath));
    else return null;
}

module.exports = {
    getAccessToken: getAccessToken,
    updateAccessToken: updateAccessToken,
    storeAccessToken: storeAccessToken,
    readAccessToken: readAccessToken,
}