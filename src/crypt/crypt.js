import sodium from 'libsodium-wrappers-sumo'

class Crypt {
  /**
   * @returns string[] ['0000', '1111', '2222', ...]
   */
  async generateRescueCode() {
    await sodium.ready

    let code = []
    for (let nodes = 6; nodes--;) {
      code.push(sodium.randombytes_uniform(10000).toString().padStart(4, '0'))
    }

    return code
  }

  getTextualIdentity(encrypedUnlockKey, additionalData) {
    const charset = '23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz'

    let data = new Uint8Array(73)
    data.set(additionalData, 0)
    data.set(encrypedUnlockKey, 25)
    data.reverse()

    let result = []
    for (let i = 0; i < data.length; i++) {
      let number = data[i]
      do {
        let remainder = number % 56
        let quotient = number / 56
        result.push(charset[remainder])
        number = quotient
      } while (number > 0)
    }

    return result.join('')
  }

  async enscryptIterations(password, salt, logN, iterations, step) {
    await sodium.ready
    step = step || (() => { })

    const N = Math.pow(2, logN)
    const result = new Uint8Array(sodium.crypto_pwhash_scryptsalsa208sha256_ll(password, salt, N, 256, 1, 32))
    const max = iterations

    while (iterations-- > 1) {
      step(max - iterations, max)

      await this.idleUI()
      this.xor(result, sodium.crypto_pwhash_scryptsalsa208sha256_ll(password, result, N, 256, 1, 32))
    }

    step(max, max)
    return result
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  async idleUI() {
    return new Promise(resolve => requestIdleCallback(resolve))
  }

  async generateIdentity(rescueCode, password, salt, rawIdentity, step) {
    await sodium.ready

    const rawUnlockKey = rawIdentity || sodium.randombytes_buf(32)
    const enscryptSalt = salt || sodium.randombytes_buf(16)
    const additionalData = new Uint8Array(25)
    const enscryptedCode = await this.enscryptIterations(password || rescueCode.join(''), enscryptSalt, 9, 120, step)

    additionalData.set([73, 0, 2, 0], 0)
    additionalData.set(enscryptSalt, 4)
    additionalData.set([9, 120, 0, 0, 0], 20)

    const result = {
      unlock: await this.aesGcmEncrypt(rawUnlockKey, additionalData, enscryptedCode, new Uint8Array(12)),
      access: await this.enhash(rawUnlockKey),
      // salt and raw unlock should never be passed out of here, just doing that now for testing purposes
      salt: enscryptSalt,
      rawUnlock: rawUnlockKey
    }

    result.textual = this.getTextualIdentity(result.unlock, additionalData)

    this.whipeMemory(rawUnlockKey)
    return result
  }

  /**
   * https://developers.google.com/web/updates/2012/06/How-to-convert-ArrayBuffer-to-and-from-String
   */
  ab2str(buf) {
    return String.fromCharCode.apply(null, new Uint16Array(buf))
  }

  str2ab(str) {
    var buf = new ArrayBuffer(str.length * 2) // 2 bytes for each char
    var bufView = new Uint16Array(buf)
    for (var i = 0, strLen = str.length; i < strLen; i++) {
      bufView[i] = str.charCodeAt(i)
    }
    return buf
  }

  async aesGcm(action, data, additionalData, password, iv) {
    const cData = { name: 'AES-GCM', iv: iv }

    if (additionalData !== null) {
      cData.additionalData = additionalData
    }

    return crypto.subtle.importKey(
      'raw',
      password,
      {
        name: 'AES-GCM',
        length: 256
      },
      false,
      [action]
    )
      .then(key => crypto.subtle[action](cData, key, data))
      .then(encr => new Uint8Array(encr))
  }

  async aesGcmEncrypt(data, additionalData, password, iv) {
    return this.aesGcm('encrypt', data, additionalData, password, iv)
  }

  async aesGcmDecrypt(data, additionalData, password, iv) {
    return this.aesGcm('decrypt', data, additionalData, password, iv)
  }

  async enhash(input) {
    return this.shaChain(input, 16)
  }

  async shaChain(input, length) {
    await sodium.ready

    const output = new Uint8Array(32)

    for (let i = 16; i--;) {
      input = sodium.crypto_hash_sha256(input)
      this.xor(output, input)
    }

    return output
  }

  xor(a, b) {
    for (let i = 0; i < a.length; i++) {
      a[i] = a[i] ^ b[i]
    }
  }

  whipeMemory(data) {
    data.map(() => 0)
  }
}

export default new Crypt()
