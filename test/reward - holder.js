const Reward = artifacts.require("TestReward");

contract('Holders', (accounts) => {
  it('should have 0 holder', async () => {
    const r = await Reward.deployed(10000);
	
    const holder = await r.holders.call();

	assert.equal(holder.toNumber(), 0, "holder is not 0");
  });
  
  it('should have 2 holders', async () => {
    const r = await Reward.deployed(10000);
	
	const amount = 1000;

    await r.transfer(accounts[0], accounts[1], amount, 0);
    await r.transfer(accounts[0], accounts[2], amount, 10);
	
    const holder = await r.holders.call();

	assert.equal(holder.toNumber(), 2, "holder is not 2");
  });
  
  it('should have 1 holder', async () => {
    const r = await Reward.deployed(10000);
	
	const amount = (await r.balanceOf.call(accounts[1])).toNumber();

    await r.transfer(accounts[1], accounts[0], amount, 0);
    const holder = await r.holders.call();

	assert.equal(holder.toNumber(), 1, "holder is not 1");
  });
  
  it('should have 5 holders', async () => {
    const r = await Reward.deployed(10000);
	
	const amount = 100;

	// Transfert to 3 new holders
	await r.transfer(accounts[0], accounts[3], amount, 0);
	await r.transfer(accounts[0], accounts[4], amount, 10);
	await r.transfer(accounts[0], accounts[5], amount, 0);

	const amount3 = (await r.balanceOf.call(accounts[3])).toNumber();
	const amount4 = (await r.balanceOf.call(accounts[4])).toNumber();
	
	// Account 3 Transfert all tokens to Account0 (one holder less)
    await r.transfer(accounts[3], accounts[0], amount3, 10);
	
	// Account 4 Transfert all tokens to Account6 (one holder less, one more)
    await r.transfer(accounts[4], accounts[6], amount4, 10);
	
	// Account 5 Transfert somes tokens to others Accounts (2 holders more)
    await r.transfer(accounts[5], accounts[7], 25, 10);
    await r.transfer(accounts[5], accounts[8], 25, 10);

    const holder = await r.holders.call();

	assert.equal(holder.toNumber(), 5, "holder is not 5");
  });
  
});