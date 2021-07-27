const Reward = artifacts.require("TestReward");

contract('Reward', (accounts) => {
  it('should put 10000 Token in the owner account', async () => {
    const r = await Reward.deployed(10000);
    const balance = await r.balanceOf.call(accounts[0]);

    assert.equal(balance.valueOf(), 10000, "10000 wasn't in the owner account");
  });
  
  it('should transfert 1000 tokens between 3 non excluded accounts (0% Reward Taxe)', async () => {
    const r = await Reward.deployed(10000);

	const accountOneBalanceBefore = (await r.balanceOf.call(accounts[0])).toNumber();
    const accountTwoBalanceBefore = (await r.balanceOf.call(accounts[1])).toNumber();
    const accountThreeBalanceBefore = (await r.balanceOf.call(accounts[2])).toNumber();

    const amount = 1000;
	const fee = 0;
    await r.transfer(accounts[0], accounts[1], amount, fee);
    await r.transfer(accounts[0], accounts[2], amount, fee);

	const accountOneBalanceAfter = (await r.balanceOf.call(accounts[0])).toNumber();
    const accountTwoBalanceAfter = (await r.balanceOf.call(accounts[1])).toNumber();
    const accountThreeBalanceAfter = (await r.balanceOf.call(accounts[2])).toNumber();
	
    assert.equal(accountOneBalanceAfter, accountOneBalanceBefore - amount - amount,  "Amount wasn't correctly taken from the accountOne");
    assert.equal(accountTwoBalanceAfter, accountTwoBalanceBefore + amount, "Amount wasn't correctly sent to the accountTwo");
    assert.equal(accountThreeBalanceAfter, accountThreeBalanceBefore + amount, "Amount wasn't correctly sent to the accountThree");
  });
  
  it('should transfert 1000 tokens between 3 non excluded accounts (10% Reward Taxe)', async () => {
    const r = await Reward.deployed(10000);

	const accountOneBalanceBefore = (await r.balanceOf.call(accounts[0])).toNumber();
    const accountTwoBalanceBefore = (await r.balanceOf.call(accounts[1])).toNumber();
    const accountThreeBalanceBefore = (await r.balanceOf.call(accounts[2])).toNumber();

    const amount = 1000;
	const fee = 10;

    await r.transfer(accounts[0], accounts[1], amount, fee);
    await r.transfer(accounts[0], accounts[2], amount, fee);

	const accountOneBalanceAfter = (await r.balanceOf.call(accounts[0])).toNumber();
    const accountTwoBalanceAfter = (await r.balanceOf.call(accounts[1])).toNumber();
    const accountThreeBalanceAfter = (await r.balanceOf.call(accounts[2])).toNumber();
	
    assert.ok(accountOneBalanceAfter > accountOneBalanceBefore - amount - amount,  "Amount wasn't correctly taken from the accountOne");
    assert.ok(accountTwoBalanceAfter > accountTwoBalanceBefore + amount - (amount * fee / 100), "Amount wasn't correctly sent to the accountTwo");
    assert.ok(accountThreeBalanceAfter > accountThreeBalanceBefore + amount - (amount * fee / 100), "Amount wasn't correctly sent to the accountThree");
  });
  
  
  it('should exclude AccountOne + AccountFour from reward', async () => {
    const r = await Reward.deployed(10000);
	
	const accountOneBalanceBefore = (await r.balanceOf.call(accounts[0])).toNumber();
    const accountTwoBalanceBefore = (await r.balanceOf.call(accounts[1])).toNumber();
    const accountThreeBalanceBefore = (await r.balanceOf.call(accounts[2])).toNumber();

	await r.excludeAccountFromRewards(accounts[0]);
	await r.excludeAccountFromRewards(accounts[3]);
	
	const balanceInfoAccountOne = await r.accountBalance(accounts[0]);
	const balanceInfoAccountFour = await r.accountBalance(accounts[3]);
	
	const accountOneBalanceAfter = (await r.balanceOf.call(accounts[0])).toNumber();
    const accountTwoBalanceAfter = (await r.balanceOf.call(accounts[1])).toNumber();
    const accountThreeBalanceAfter = (await r.balanceOf.call(accounts[2])).toNumber();

    assert.equal(accountOneBalanceAfter, accountOneBalanceBefore, "AccountOne not correctly excluded");
	
    assert.equal(true, balanceInfoAccountOne[2], "AccountOne excludedFromReward should be true");
    assert.equal(true, balanceInfoAccountFour[2], "AccountFour excludedFromReward should be true");
  });
  
  it('should transfert 1000 tokens between from excluded account to 3 mixed non excluded and excluded accounts (10% Reward Taxe)', async () => {
    const r = await Reward.deployed(10000);

	const accountOneBalanceBefore = (await r.balanceOf.call(accounts[0])).toNumber();
    const accountTwoBalanceBefore = (await r.balanceOf.call(accounts[1])).toNumber();
    const accountThreeBalanceBefore = (await r.balanceOf.call(accounts[2])).toNumber();
    const accountFourBalanceBefore = (await r.balanceOf.call(accounts[3])).toNumber();

    const amount = 1000;
	const fee = 10;

    await r.transfer(accounts[0], accounts[1], amount, fee);
    await r.transfer(accounts[0], accounts[2], amount, fee);
    await r.transfer(accounts[0], accounts[3], amount, fee);

	const accountOneBalanceAfter = (await r.balanceOf.call(accounts[0])).toNumber();
    const accountTwoBalanceAfter = (await r.balanceOf.call(accounts[1])).toNumber();
    const accountThreeBalanceAfter = (await r.balanceOf.call(accounts[2])).toNumber();
    const accountFourBalanceAfter = (await r.balanceOf.call(accounts[3])).toNumber();
		
    assert.equal(accountOneBalanceAfter, accountOneBalanceBefore - amount - amount - amount,  "Amount wasn't correctly taken from the accountOne");
    assert.equal(accountFourBalanceAfter, accountFourBalanceBefore + amount - (amount * fee / 100),  "Amount wasn't correctly sent to the accountFour");
    assert.ok(accountTwoBalanceAfter > accountTwoBalanceBefore + amount - (amount * fee / 100), "Amount wasn't correctly sent to the accountTwo");
    assert.ok(accountThreeBalanceAfter > accountThreeBalanceBefore + amount - (amount * fee / 100), "Amount wasn't correctly sent to the accountThree");
  });
  
  it('should include AccountFour in reward', async () => {
    const r = await Reward.deployed(10000);
	
    const accountTwoBalanceBefore = (await r.balanceOf.call(accounts[1])).toNumber();
    const accountThreeBalanceBefore = (await r.balanceOf.call(accounts[2])).toNumber();
    const accountFourBalanceBefore = (await r.balanceOf.call(accounts[3])).toNumber();

	await r.includeAccountInRewards(accounts[3]);
	
	const balanceInfoAccountFour = await r.accountBalance(accounts[3]);
	
    const accountTwoBalanceAfter = (await r.balanceOf.call(accounts[1])).toNumber();
    const accountThreeBalanceAfter = (await r.balanceOf.call(accounts[2])).toNumber();
	const accountFourBalanceAfter = (await r.balanceOf.call(accounts[3])).toNumber();

    assert.ok(accountFourBalanceAfter > accountFourBalanceBefore, "AccountFour not correctly excluded");
	
    assert.equal(false, balanceInfoAccountFour[2], "AccountFour excludedFromReward should be false");
  });
  
  it('should exclude AccountFour from reward', async () => {
    const r = await Reward.deployed(10000);
	
    const accountTwoBalanceBefore = (await r.balanceOf.call(accounts[1])).toNumber();
    const accountThreeBalanceBefore = (await r.balanceOf.call(accounts[2])).toNumber();
    const accountFourBalanceBefore = (await r.balanceOf.call(accounts[3])).toNumber();

	await r.excludeAccountFromRewards(accounts[3]);
	
	const balanceInfoAccountFour = await r.accountBalance(accounts[3]);
	
    const accountTwoBalanceAfter = (await r.balanceOf.call(accounts[1])).toNumber();
    const accountThreeBalanceAfter = (await r.balanceOf.call(accounts[2])).toNumber();
	const accountFourBalanceAfter = (await r.balanceOf.call(accounts[3])).toNumber();

    assert.ok(accountFourBalanceAfter <= accountFourBalanceBefore, "AccountFour not correctly excluded");
	
    assert.equal(true, balanceInfoAccountFour[2], "AccountFour excludedFromReward should be false");
  });
  
  it('should transfert 500 tokens from Excluded to Excluded', async () => {
    const r = await Reward.deployed(10000);
	
	const A1Before = (await r.balanceOf.call(accounts[0])).toNumber();
	const A4Before = (await r.balanceOf.call(accounts[3])).toNumber();

	const amount = 500;
	const fee = 10;

    await r.transfer(accounts[0], accounts[3], amount, fee);
	
	const A1After = (await r.balanceOf.call(accounts[0])).toNumber();
	const A4After = (await r.balanceOf.call(accounts[3])).toNumber();

	assert.equal(A1After, A1Before - amount,  "Amount wasn't correctly taken from the AccountOne");
    assert.equal(A4After, A4Before + amount - (amount * fee / 100),  "Amount wasn't correctly sent to the AccountFour");
  });
  
  it('should transfert 500 tokens from Non Excluded to Non Excluded', async () => {
    const r = await Reward.deployed(10000);
	
	const A2Before = (await r.balanceOf.call(accounts[1])).toNumber();
	const A3Before = (await r.balanceOf.call(accounts[2])).toNumber();

	const amount = 500;
	const fee = 10;

    await r.transfer(accounts[1], accounts[2], amount, fee);
	
	const A2After = (await r.balanceOf.call(accounts[1])).toNumber();
	const A3After = (await r.balanceOf.call(accounts[2])).toNumber();
	
	assert.ok(A2After < A2Before, "Amount wasn't correctly taken from the AccountTow");
	assert.ok(A3After > A3Before, "Amount wasn't correctly sent to the AccountThree");
  });
  
  it('should transfert 500 tokens from Excluded to Non excluded', async () => {
    const r = await Reward.deployed(10000);
	
	const A1Before = (await r.balanceOf.call(accounts[0])).toNumber();
	const A3Before = (await r.balanceOf.call(accounts[2])).toNumber();

	const amount = 500;
	const fee = 10;

    await r.transfer(accounts[0], accounts[2], amount, fee);
	
	const A1After = (await r.balanceOf.call(accounts[0])).toNumber();
	const A3After = (await r.balanceOf.call(accounts[2])).toNumber();
	
	assert.equal(A1After, A1Before - amount,  "Amount wasn't correctly taken from the AccountOne");
	assert.ok(A3After > A3Before, "Amount wasn't correctly sent to the AccountThree");
  });
  
  it('should transfert 500 tokens from Non Excluded to Excluded', async () => {
	const r = await Reward.deployed(10000);
	
	const A1Before = (await r.balanceOf.call(accounts[0])).toNumber();
	const A3Before = (await r.balanceOf.call(accounts[2])).toNumber();

	const amount = 500;
	const fee = 10;
	
    await r.transfer(accounts[2], accounts[0], amount, fee);
	
	const A1After = (await r.balanceOf.call(accounts[0])).toNumber();
	const A3After = (await r.balanceOf.call(accounts[2])).toNumber();
	
	assert.equal(A1After, A1Before + amount - (amount * fee / 100),  "Amount wasn't correctly sent to the AccountOne");
	assert.ok(A3After < A3Before, "Amount wasn't correctly taken from the AccountThree");	
  });
  
  it('should transfert all tokens - no fee', async () => {
    const r = await Reward.deployed(10000);
	
	const A2Before = (await r.balanceOf.call(accounts[2])).toNumber();

    await r.transfer(accounts[0], accounts[5], 500, 0);
    await r.transfer(accounts[5], accounts[0], 500, 0);
    await r.transfer(accounts[2], accounts[0], A2Before, 0);
	
	const A5After = (await r.balanceOf.call(accounts[5])).toNumber();
	const A2After = (await r.balanceOf.call(accounts[2])).toNumber();

    assert.equal(A5After, 0,  "0 tokens should be on account5");
    assert.equal(A2After, 0,  "0 tokens should be on account2");
  });
  
  it('should transfert all tokens - with fee', async () => {
    const r = await Reward.deployed(10000);
	
    await r.transfer(accounts[0], accounts[5], 500, 10);
    await r.transfer(accounts[0], accounts[2], 500, 10);
	
	const ba5 = (await r.balanceOf.call(accounts[5])).toNumber();
	await r.transfer(accounts[5], accounts[0], ba5, 10);
	
	const ba2 = (await r.balanceOf.call(accounts[2])).toNumber();
    await r.transfer(accounts[2], accounts[0], ba2, 10);
	
	const A5After = (await r.balanceOf.call(accounts[5])).toNumber();
	const A2After = (await r.balanceOf.call(accounts[2])).toNumber();

    assert.equal(A5After, 0,  "0 tokens should be on account5");
    assert.equal(A2After, 0,  "0 tokens should be on account2");
  });
  
});