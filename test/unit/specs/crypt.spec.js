import crypt from '../../../src/crypt/crypt'
import base64js from 'base64-js'

describe('crypt.generateRescueCode', () => {
  it('should generate a code with 24 numbers and 5 hyphens', async() => {
    const key = await crypt.generateRescueCode()
    expect(key.join('-')).to.be.length(29).and.to.match(/^\d{4}(-\d{4}){5}$/)
  })
})

describe('crypt.generateIdentity', () => {
  it('should generate the proper identity given known input', async () => {
    const identity = await crypt.generateIdentity(
      '1198-8748-7132-2838-8318-7570'.split('-'),
      'Zingo-Bingo-Slingo-Dingo',
      base64js.toByteArray('WmrhWiOj+vLK7P1oY+dihA=='),
      base64js.toByteArray('RARINOWDRB3/9PbvDnAjh6zDUCna0eq0vxTlczDiwVw='))

    expect(identity.textual).to.equal('q26T8gSsD6xqfhwWgd6KGraLYL8uRcZzxLAfxSVyRfWJRZZks222ABNk9msXEcLUvdc3uc242K')
  }).timeout(10000)
})
