const Contract = artifacts.require("Dynamix");

contract('Dynamix', (accounts) => {
  it('owner should have 100000 tokens', async () => {
	const c = await Contract.deployed();
    const balance = await c.balanceOf.call(accounts[0]);
	
    assert.equal(balance.toNumber(), 100000, "100000 token should be to owner");
  });
  
  it('standard transfert (no fees) - 10 000 tokens from account0 to account2', async () => {
	const c = await Contract.deployed();
	
    await c.transfer(accounts[2], 10000, { from: accounts[0] });
	
	const ba0 = await c.balanceOf.call(accounts[0]);
	const ba2 = await c.balanceOf.call(accounts[2]);
	
    assert.equal(ba0.toNumber(), 90000, "90 000 tokens should be on account0");
    assert.equal(ba2.toNumber(), 10000, "10 000 tokens should be on account2");
  });

  it('buy transfert (beforePreSale) - 2000 tokens from account2 to account3', async () => {
	const c = await Contract.deployed();
	
	await c.beforePreSale();
	await c.setPair(accounts[2], true); // Set account2 as pair
	
    await c.transfer(accounts[3], 2000, { from: accounts[2] });
	
	const ba2 = await c.balanceOf.call(accounts[2]);
	const ba3 = await c.balanceOf.call(accounts[3]);
	
    assert.equal(ba2.toNumber(), 8000, "8000 tokens should be on account2");
    assert.equal(ba3.toNumber(), 2000, "2000 tokens should be on account3");
  });
  
  it('sell transfert (beforePreSale) - 1500 tokens from account3 to account2', async () => {
	const c = await Contract.deployed();
	
	await c.beforePreSale();
	await c.setPair(accounts[2], true); // Set account2 as pair
	
    await c.transfer(accounts[2], 1500, { from: accounts[3] });
	
	const ba2 = await c.balanceOf.call(accounts[2]);
	const ba3 = await c.balanceOf.call(accounts[3]);
	
    assert.equal(ba2.toNumber(), 9500, "1500 tokens should be on account2");
    assert.equal(ba3.toNumber(), 500, "1500 tokens should be on account3");
  });
  
  it('buy transfert (afterPreSale) - 3000 tokens from account2 to account3', async () => {
	const c = await Contract.deployed();
	
	await c.afterPreSale();
	await c.setPair(accounts[2], true); // Set account2 as pair
	
    await c.transfer(accounts[3], 3000, { from: accounts[2] });
	
	const ba2 = await c.balanceOf.call(accounts[2]);
	const ba3 = await c.balanceOf.call(accounts[3]);
	const bteam = await c.balanceOf.call((await c.teamAddress.call()));
	
    assert.ok(ba2.toNumber() > 6500, "more than 8500 tokens should be on account2");
    assert.ok(ba3.toNumber() <= 3500, "less than 3500 tokens should be on account3");
    assert.equal(bteam.toNumber(), 360, "360 tokens should be on team"); // 3000 * (14% buy fee - 2% reward fee)
  });
  
  it('sell transfert (afterPreSale) - 1500 tokens from account3 to account2', async () => {
	const c = await Contract.deployed();
	
	await c.afterPreSale();
	await c.setPair(accounts[2], true); // Set account2 as pair
	
    await c.transfer(accounts[2], 1500, { from: accounts[3] });
	
	const ba2 = await c.balanceOf.call(accounts[2]);
	const ba3 = await c.balanceOf.call(accounts[3]);
	const bteam = await c.balanceOf.call((await c.teamAddress.call()));
	const bbuyback = await c.balanceOf.call(c.address);
	
    assert.equal(ba2.toNumber(), 7778, "7778 tokens should be on account2"); // 1500 * 15% = 1275 + 6500 + rewards
    assert.equal(ba3.toNumber(), 1589, "1589 tokens should be on account3"); // -1500 + rewards
    assert.equal(bteam.toNumber(), 462, "462 tokens should be on team"); // 225 * 45% = 101 + 360 = 462
    assert.equal(bbuyback.toNumber(), 123, "123 tokens should be on buyback"); // 225 * 55% = 123
  });
  
  it('sell transfert (afterPreSale) - all tokens from account3 to account2', async () => {
	const c = await Contract.deployed();
	
	await c.afterPreSale();
	await c.setPair(accounts[2], true); // Set account2 as pair
	
	const amount = await c.balanceOf.call(accounts[3]);
	
    await c.transfer(accounts[2], amount, { from: accounts[3] });
    await c.transfer(accounts[4], amount, { from: accounts[2] });
	
	const ba3 = await c.balanceOf.call(accounts[3]);
	const ba4 = await c.balanceOf.call(accounts[4]);
		
    assert.equal(ba3.toNumber(), 0, "0 tokens should be on account3"); 
    assert.equal(ba4.toNumber(), 1372, "1372 tokens should be on account4"); 
  });
  
  it('buy transfert - timestamp should change', async () => {
	const c = await Contract.deployed();

	const a3Before = await c.accountBalance(accounts[3]);
	await c.transfer(accounts[3], 1000, { from: accounts[2] });
	const a3After = await c.accountBalance(accounts[3]);

	assert.ok(a3After[3].toNumber() > a3Before[3].toNumber(), "account3 timestamp should be changed");
  });
  
  it('sell transfert - timestamp should not change', async () => {
	const c = await Contract.deployed();

	const a3Before = await c.accountBalance(accounts[3]);
	await c.transfer(accounts[2], 100, { from: accounts[3] });
	const a3After = await c.accountBalance(accounts[3]);

	assert.equal(a3After[3].toNumber(), a3Before[3].toNumber(), "account3 timestamp should not be changed");
  });
  
  it('standard transfert - timestamp should not change', async () => {
	const c = await Contract.deployed();

	const a3Before = await c.accountBalance(accounts[3]);
	await c.transfer(accounts[5], 100, { from: accounts[3] });
	const a3After = await c.accountBalance(accounts[3]);

	assert.equal(a3After[3].toNumber(), a3Before[3].toNumber(), "account3 timestamp should not be changed");
  });
});