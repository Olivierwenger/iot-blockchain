var IterableAccess = artifacts.require("./IterableAccess.sol");
var IotAuth = artifacts.require("./IotAuth.sol");

module.exports = function(deployer) {
  deployer.deploy(IterableAccess, {gas: 300000000});
  deployer.link(IterableAccess, IotAuth);
  deployer.deploy(IotAuth, {gas: 300000000});

};