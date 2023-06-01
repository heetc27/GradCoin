const GradCoin = artifacts.require("GradCoin");

module.exports = function(deployer) {
  deployer.deploy(GradCoin);
};

