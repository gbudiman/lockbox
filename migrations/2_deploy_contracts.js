var LockboxFactory = artifacts.require("LockboxFactory");

module.exports = function(deployer) {
  deployer.deploy(LockboxFactory);
};
