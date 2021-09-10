const { createHash } = require('crypto');
let uuidV4 = require('uuid').v4;
/**
 * @param {string} algorithm
 * @param {any} content
 *  @return {string}
 */
const encrypt = (algorithm, content) => {
    let hash = createHash(algorithm)
    hash.update(content)
    return hash.digest('hex')
}
/**
 * @param {any} content
 *  @return {string}
 */
const sha1 = (content) => encrypt('sha1', content)

/**
 * 获取 uuid（v4）去掉横杠，刚好32位
 * @returns {string}
 */
const nonceStr = () => {
    let newStr = uuidV4().replace(/-/g, "a");
    console.log('nonceStr: ' + newStr);
    return newStr;
}

module.exports = { encrypt, sha1, nonceStr }