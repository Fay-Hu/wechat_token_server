class JSApiTicket {
    /** 错误码，默认0 */
    errorcode;
    /** 错误信息，默认ok */
    errmsg;
    /** 临时票据 */
    ticket;
    /** 过期时间，一般7200，单位秒 */
    expires_in;

    /**
     * JS-SDK 临时票据，用于生成权限验证的签名
     * @param {number} errorcode 
     * @param {string} errmsg 
     * @param {string} ticket 
     * @param {number} expires_in 
     */
    constructor(errorcode, errmsg, ticket, expires_in) {
        this.errorcode = errorcode;
        this.errmsg = errmsg;
        this.ticket = ticket;
        this.expires_in = expires_in;
    }
}

module.exports = JSApiTicket;