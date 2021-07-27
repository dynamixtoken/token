const Reward = artifacts.require("TestReward");

contract('Reward - Timestamp', (accounts) => {
  it('should put timestamp in the owner account', async () => {
    var now = (new Date()).getTime() / 1000 - 500; // -500 for contract execution delay

	const r = await Reward.deployed(10000);
	const b = await r.accountBalance(accounts[0]);

    assert.ok(b[3].toNumber() >= now, "timestamp not set correctly to owner account");
  });
});