class AccessToken {

    /** @property 微信SDK access_token 字符串 */
    access_token;
    /** @property 过期时间，单位：秒 */
    expires_in;
    /** @property 申请时间戳，单位：毫秒 */
    timestamp;

    /**
     * AccessToken 格式化对象
     * @param {string} access_token 微信SDK access_token 字符串
     * @param {number} expires_in 过期时间，单位：秒
     * @param {number} timestamp 申请时间戳，单位：毫秒
     */
    constructor(access_token, expires_in, timestamp) {
        this.access_token = access_token;
        this.expires_in = expires_in;
        this.timestamp = timestamp;
    }
}

module.exports = AccessToken;