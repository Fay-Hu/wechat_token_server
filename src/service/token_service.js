const CONFIG = require('../../config');
const TOKEN = CONFIG.token;
const FileService = require('./file_service');
const AccessToken = require('../model/access_token');
const JSApiTicket = require('../model/jsapi_ticket');
const CryptoService = require('./crypto_service');
const SignatureConfig = require('../model/signature_config');

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
                storeAccessToken(data);
                resolve(data);
            }
        }).catch(err => {
            console.log(err);
            reject(err);
        })
    })
}

/**
 * 获取 jsapi_ticket
 * @param {boolean} forceUpdate  强制获取新的 jsapi_ticket，默认 false
 * @returns {Promise<JSApiTicket>}
 */
function getJSApiTicket(forceUpdate = false) {
    return new Promise((resolve, reject) => {
        let now = new Date().getTime();
        let ticket = null;
        if (!forceUpdate) {
            ticket = readJSApiTicket();
        } else {
            console.log('|| 强制更新 jsapi_ticket')
        }
        // access_token 已存储在文件中，且未过期
        if (ticket && ticket.expires_in && ticket.timestamp && now < ticket.timestamp + ticket.expires_in * 1000) {
            console.log('|| jsapi_ticket 尚未过期! 过期时间: %s', dayjs(ticket.timestamp + ticket.expires_in * 1000).format(("YYYY-MM-DD HH:mm:ss")));
            resolve(ticket);
        } else {
            if (ticket && ticket.timestamp)
                console.log('|| jsapi_ticket 已过期! 上次获取时间: %s', dayjs(ticket.timestamp).format("YYYY-MM-DD HH:mm:ss"));
            updateJsApiTicket().then(val => {
                resolve(val)
            }).catch(err => {
                reject(err)
            })
        }
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
            let timestamp = new Date().getTime();
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
                    data.timestamp = timestamp;
                    storeJSApiTicket(data);
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

/**
 * 将 access_token 存储到文件中
 * @param {AccessToken} data access_token 对象
 * @returns 
 */
function storeAccessToken(data) {
    return storeToCacheFile(data, 'AccessToken');
}
/**
 * 读取文件中保存的 access_token
 * @returns {AccessToken}
 */
function readAccessToken() {
    return readFromCacheFile('AccessToken');
}

/**
 * 将 jsapi_ticket 存储到文件中
 * @param {JSApiTicket} data jsapi_ticket 对象
 * @returns 
 */
function storeJSApiTicket(data) {
    return storeToCacheFile(data, 'JSApiTicket');
}
/**
 * 读取文件中保存的 jsapi_ticket
 * @returns {JSApiTicket}
 */
function readJSApiTicket() {
    return readFromCacheFile('JSApiTicket');
}

/**
 * 写入文件缓存
 * @param {object} data 值
 * @param {string} [propName] 属性名
 * @returns 
 */
function storeToCacheFile(data, propName) {
    console.log('|| Write to storePath: %s', storePath);
    if (fs.existsSync(storePath) || FileService.mkdirsSync(path.dirname(storePath))) {
        let storage = readFromCacheFile() || {};    // 为空，则默认写为空对象
        if (propName)
            storage[propName] = data;
        else
            storage = data;
        fs.writeFileSync(storePath, JSON.stringify(storage, null, '\t'));   // 美化一下
        return true;
    } else {
        return false;
    }
}

/**
 * 读取文件缓存
 * @param {string} [propName] 要读取的属性名，为空时读取全部
 * @returns
 */
function readFromCacheFile(propName) {
    console.log('|| Read from storePath: ' + storePath);
    if (fs.existsSync(storePath)) {
        console.log('|| 缓存文件存在')
        let data = JSON.parse(fs.readFileSync(storePath));
        if (propName)
            return data[propName];
        else
            return data;
    }
    else {
        console.log('|| 未找到缓存文件')
        return null;
    }
}

/**
 * 获取签名，nonceStr 不长于32位
 * @param {string} url 需要用签名的网址
 * @returns {Promise<SignatureConfig>}
 */
function getSignature(url) {
    return new Promise((resolve, reject) => {
        getJSApiTicket().then((result) => {
            let jsapi_ticket = result.ticket;
            let noncestr = CryptoService.nonceStr();
            let timestamp = new Date().getTime();
            let str = `jsapi_ticket=${jsapi_ticket}&noncestr=${noncestr}&timestamp=${timestamp}&url=${url}`;
            let signature = CryptoService.sha1(str);
            let sObj = new SignatureConfig(jsapi_ticket, noncestr, timestamp, url, signature, TOKEN().appid);
            resolve(sObj);
        }).catch((err) => {
            reject(err);
        });
    })
}


module.exports = {
    getAccessToken,
    updateAccessToken,
    storeAccessToken,
    readAccessToken,
    getJSApiTicket,
    updateJsApiTicket,
    getSignature,
}