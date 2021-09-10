class SignatureConfig {
    /** 【用于签名】ticket */
    jsapi_ticket;
    /** 【用于签名】生成签名的随机串，不长于32位 */
    noncestr;
    /** 【用于签名】生成签名的时间戳 */
    timestamp;
    /** 【用于签名】URL页面路径，带参数，不带#以及后面的内容 */
    url;
    /** 签名 */
    signature;
    /** 公众号的唯一标识 */
    appId;

    /**
     * 签名与配置部分内容合体。注意，用于签名的属性都是小写
     * @param {string} jsapi_ticket
     * @param {string} noncestr 
     * @param {number} timestamp 
     * @param {string} url 
     * @param {string} signature 
     * @param {string} appId 
     */
    constructor(jsapi_ticket, noncestr, timestamp, url, signature, appId) {
        this.jsapi_ticket = jsapi_ticket;
        this.noncestr = noncestr;
        this.timestamp = timestamp;
        this.url = url;
        this.signature = signature;
        this.appId = appId;
    }
}

module.exports = SignatureConfig;