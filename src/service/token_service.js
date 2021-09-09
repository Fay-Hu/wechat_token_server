const CONFIG = require('../../config');
const TOKEN = CONFIG.token;
const FileService = require('./file_service');
const AccessToken = require('../model/access_token');
const JSApiTicket = require('../model/jsapi_ticket');

const fs = require('fs');
const path = require('path');
const axios = require('axios').default; // 为了获取类型推断
const dayjs = require('dayjs');

const storePath = path.resolve(CONFIG.application().wechatTokenFile);

// ?grant_type=client_credential&appid=APPID&secret=APPSECRET
const getAccessTokenUrl = "https://api.weixin.qq.com/cgi-bin/token";

const getJSApiTicketUrl = "https://api.weixin.qq.com/cgi-bin/ticket/getticket";

/**
 * 获取 access_token
 * @param {boolean} forceUpdate 强制获取新的access_token，默认 false
 * @returns {Promise<AccessToken>}
 */
function getAccessToken(forceUpdate = false) {
    return new Promise((resolve, reject) => {
        let now = new Date().getTime();
        let token = null;
        if (!forceUpdate) {
            token = readAccessToken();
        } else {
            console.log('|| 强制更新 access_token')
        }
        // access_token 已存储在文件中，且未过期
        if (token && token.expires_in && token.timestamp && now < token.timestamp + token.expires_in * 1000) {
            console.log('|| access_Token 尚未过期! 过期时间: %s', dayjs(token.timestamp + token.expires_in * 1000).format(("YYYY-MM-DD HH:mm:ss")));
            resolve(token);
        } else {
            if (token && token.timestamp)
                console.log('|| access_Token 已过期! 上次获取时间: %s', dayjs(token.timestamp).format("YYYY-MM-DD HH:mm:ss"));
            updateAccessToken().then(val => {
                resolve(val)
            }).catch(err => {
                reject(err)
            })
        }
    })
}

/**
 * 更新并返回 access_token
 * @returns {Promise<AccessToken>}
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
            let data = res.data;
            console.log(data);
            if (data.errcode) { // 微信返回错误码
                reject(data)
            } else {
                data.timestamp = timestamp;
                storeAccessToken(JSON.stringify(data));
                resolve(data);
            }
        }).catch(err => {
            console.log(err);
            reject(err);
        })
    })
}

/**
 * 将 access_token 存储到文件中
 * @param {string} jsonString 对象JSON化的字符串
 * @returns 
 */
function storeAccessToken(jsonString) {
    console.log('|| Write to storePath: ' + storePath);
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
 * 读取文件中保存的 access_token
 * @returns {AccessToken}
 */
function readAccessToken() {
    console.log('|| Read from storePath: ' + storePath);
    if (fs.existsSync(storePath)) {
        console.log('|| 找到了wechatToken存储文件')
        return JSON.parse(fs.readFileSync(storePath));
    }
    else {
        console.log('|| 未找到wechatToken存储文件')
        return null;
    }
}

/**
 * 获取 jsapi_ticket
 * @param {boolean} forceupdate  强制获取新的 jsapi_ticket，默认 false
 * @returns 
 */
function getJSApiTicket(forceupdate = false) {
    return new Promise((resolve, reject) => {
        updateJsApiTicket().then((result) => {
            resolve(result)
        }).catch((err) => {
            reject(err)
        });
    })
}

/**
 * 更新并返回 jsapi_ticket
 * @returns {Promise<JSApiTicket>}
 */
function updateJsApiTicket() {
    return new Promise((resolve, reject) => {
        getAccessToken().then((result) => {
            console.log('access_token: %o', result.access_token);
            axios.get(getJSApiTicketUrl, {
                params: {
                    access_token: result.access_token,
                    type: "jsapi"
                }
            }).then((val) => {
                console.log('url: ' + val.config.url);
                /** @type {JSApiTicket} */
                let data = val.data;
                console.log(data);
                if (data.errorcode) {   // 40001: access_token 无效或已过期
                    reject(data);
                } else {
                    resolve(data);
                }
            }).catch((err) => {
                reject(err);
            });
        }).catch((error) => {
            reject(error);
        });
    })
}

module.exports = {
    getAccessToken: getAccessToken,
    updateAccessToken: updateAccessToken,
    storeAccessToken: storeAccessToken,
    readAccessToken: readAccessToken,
    getJSApiTicket: getJSApiTicket,
    updateJsApiTicket: updateJsApiTicket,
}