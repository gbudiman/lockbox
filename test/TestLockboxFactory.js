var LockboxFactory = artifacts.require('LockboxFactory')

contract('LockboxFactory', async(accounts) => {
  let admin_address = accounts[0]
  let customer = accounts[1]
  let instance

  beforeEach('setup contract before each test', async() => {
    instance = await LockboxFactory.deployed()
    try {
      await instance.set_admin(admin_address)
    } catch(error) {
      if (error.message.search('revert') < 0) {
        throw('Administration error')
      }
    }
  })

  it('should have non-zero admin address', async() => {
    assert(await instance.get_admin(), admin_address)
  })

  it('should assign shared secret correctly', async() => {
    
    await instance.assign_shared_secret('sekrit', { from: customer })
    let returned_secret = await instance.get_validity_period.call(customer)
    assert(returned_secret, instance)
  })

  it('should not have admin overrideable', async() => {
    try {
      await instance.set_admin(customer)
      assert.fail('Expecting transaction revert')
    } catch(error) {
      assert.isAbove(error.message.search('revert'), 0)
    }
  })

  describe('contract manipulation', async() => {
    beforeEach('setup secret', async() => {
      await instance.assign_shared_secret('will be invalidated', { from: customer })
    })

    it('should be able to be invalidated by admin', async() => {
      await instance.set_validity_period(customer, 30, { from: admin_address })
      assert(await instance.get_validity_period(customer), 30)
    })

    it('should not be extendable', async() => {
      try {
        await instance.set_validity_period(customer, parseInt(Date.now() / 1000) + 10, { from: admin_address })
        assert.fail('Secret can be invalidated, but not extended into the future')
      } catch(error) {
        assert.isAbove(error.message.search('revert'), 0)
      }
    })
  })
})