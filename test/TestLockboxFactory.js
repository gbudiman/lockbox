var LockboxFactory = artifacts.require('LockboxFactory')

contract('LockboxFactory', async(accounts) => {
  let admin = accounts[0]
  let customer = accounts[1]
  let other_admin = accounts[2]
  let instance

  beforeEach('setup contract before each test', async() => {
    instance = await LockboxFactory.deployed()
  })

  it('should have non-zero admin address', async() => {
    assert(await instance.get_current_admin(), admin)
  })

  it('should assign shared secret correctly', async() => {
    await instance.assign_shared_secret('sekrit', { from: customer })
    let returned_secret = await instance.get_shared_secret({from: customer})
    assert(returned_secret, instance)
  })

  it('should not have admin overrideable', async() => {
    try {
      await instance.claim_admin({from: customer})
      assert.fail('Expecting transaction revert')
    } catch(error) {
      assert.isAbove(error.message.search('revert'), 0)
    }
  })

  contract('contract manipulation', async() => {
    beforeEach('setup secret', async() => {
      await instance.assign_shared_secret('will be invalidated', { from: customer })
    })

    it('should be able to be invalidated by admin', async() => {
      await instance.set_validity_period(customer, 30, { from: admin })
      assert(await instance.get_validity_period(customer), 30)
      assert(await instance.get_shared_secret({ from: customer }), 'INVALID')
    })

    it('should not be extendable', async() => {
      try {
        await instance.set_validity_period(customer, parseInt(Date.now() / 1000) + 10, { from: admin })
        assert.fail('Secret can be invalidated, but not extended into the future')
      } catch(error) {
        assert.isAbove(error.message.search('revert'), 0)
      }
    })

    it('should override existing shared secret', async() => {
      let s1 = await instance.assign_shared_secret('hello world')
      assert(await instance.get_shared_secret(), 'hello world')
      let s2 = await instance.assign_shared_secret('updated world')
      assert(await instance.get_shared_secret(), 'updated world')
    })
  })

  contract('admin transfer', async() => {
    beforeEach('set next admin', async() => {
      let current_admin = await instance.get_current_admin()
      await instance.transfer_admin(other_admin, {from: admin})
    })

    it('should reject admin transfer from invalid transferee', async() => {
      try {
        await instance.claim_admin({from: customer})
        assert.fail('Transfer can only be done to designated transferee')
      } catch(error) {
        assert.isAbove(error.message.search('revert'), 0)
      }
    })

    it('should allow admin transfer', async() => {
      await instance.claim_admin({from: other_admin})
      assert.isOk(await instance.is_admin.call({from: other_admin}))
    })
  })
})