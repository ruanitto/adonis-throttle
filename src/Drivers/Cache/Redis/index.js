'use strict'

/**
 * adonis-throttle
 *
 * (c) Andrew Jo <andrewjo@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
const { promisify } = require('util')

const Cache = require('..')

class Redis extends Cache {
  /**
   * Namespaces to inject by IoC container.
   *
   * @attribute inject
   * @return {Array}
   */
  static get inject() {
    return ['Adonis/Src/Config', 'Adonis/Addons/Redis'];
  }

  constructor(Config, Redis) {
    super()

    const config = Config.merge('throttle.redis', {
      port: 6379,
      host: '127.0.0.1'
    })

    this.redis = Redis.namedConnection('__adonis__throttle', config)
    this.getAsync = promisify(this.redis.get).bind(this.redis)
  }

  /**
   * Generate cache.
   * @param {String} key
   * @param {Mixed} value
   * @param {Integer} milliseconds
   *
   * @return {TimeoutPointer}
   */
  async put(key, value, milliseconds) {
    await this.redis.set(key, value, 'px', milliseconds)
  }

  /**
   * Get stored data by key.
   * @param {String} key
   *
   * @return {Mixed}
   */
  async get(key) {
    // return this.redis.get(key)
    return await this.getAsync(key)
  }

  /**
   * Get number of seconds left until cache data is cleared.
   * @param {String} key
   *
   * @return {Integer}
   */
  async secondsToExpiration(key) {
    // Coerce to integer
    return await this.redis.ttl(key) >>> 0;
  }

  /**
   * Increment stored value by one.
   * @param {String} key
   *
   * @return {Cache}
   */
  async increment(key) {
    await this.redis.incr(key)
    return this
  }

  /**
   * Increment expiration of stored data by number of seconds.
   * @param {String} key
   * @param {Integer} seconds
   *
   * @return {Cache}
   */
  async incrementExpiration(key, seconds) {
    await this.redis.expire(key, seconds)
    return this
  }
}

module.exports = Redis
