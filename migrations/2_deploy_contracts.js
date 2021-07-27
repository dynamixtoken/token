const Ownable = artifacts.require("Ownable");
const SafeMath = artifacts.require("SafeMath");
const Reward = artifacts.require("Reward");
const Holder = artifacts.require("Holder");
const Swap = artifacts.require("Swap");
const TestReward = artifacts.require("TestReward");
const TestFee = artifacts.require("TestFee");
const Dynamix = artifacts.require("Dynamix");

module.exports = function(deployer) {	
	deployer.deploy(TestReward, 10000);
	deployer.deploy(TestFee);
	deployer.deploy(Dynamix, 100000);
};