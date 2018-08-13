var LockboxFactory = artifacts.require('LockboxFactory')

contract('LockboxFactory', async(accounts) => {
  it('should assign shared secret correctly', async() => {
    let instance = await LockboxFactory.deployed()
    let meta = instance
    let customer = accounts[1]
    await instance.assign_shared_secret('sekrit', { from: customer })
    //let x = await meta.get_validity_period.call()
    meta.get_validity_period.call(customer).then(x => {
      console.log('Valp = ' + x)
    })
    //console.log(x)
  })
})