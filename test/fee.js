const Contract = artifacts.require("TestFee");

contract('Fee', (accounts) => {
  it('should be a pair', async () => {
	const c = await Contract.deployed();
	await c.setPair(accounts[2], true);
	
	const a1b = await c.isBuy(accounts[1]);
	const a1s = await c.isSell(accounts[1]);

	const a2b = await c.isBuy(accounts[2]);
	const a2s = await c.isSell(accounts[2]);

    assert.equal(false, a1b, "account 1 should not be a pair address");
    assert.equal(false, a1s, "account 1 should not be a pair address");
    assert.equal(true, a2b, "account 2 should be a pair address");
    assert.equal(true, a2s, "account 2 should be a pair address");
  });
  
  it('should not be pair', async () => {
	const c = await Contract.deployed();
	await c.setPair(accounts[2], false);
	
	const a1b = await c.isBuy(accounts[1]);
	const a1s = await c.isSell(accounts[1]);

	const a2b = await c.isBuy(accounts[2]);
	const a2s = await c.isSell(accounts[2]);

    assert.equal(false, a1b, "account 1 should not be a pair address");
    assert.equal(false, a1s, "account 1 should not be a pair address");
    assert.equal(false, a2b, "account 2 should not be a pair address");
    assert.equal(false, a2s, "account 2 should not be a pair address");
  });
  
  it('should get rewards depending holders', async () => {
	const c = await Contract.deployed();

    assert.equal(2, (await c.getRewardFee(500)).toNumber(), "for 500 holders should be 2% reward fee");
    assert.equal(2, (await c.getRewardFee(1000)).toNumber(), "for 1000 holders should be 2% reward fee");
    assert.equal(3, (await c.getRewardFee(2000)).toNumber(), "for 2000 holders should be 3% reward fee");
    assert.equal(3, (await c.getRewardFee(5000)).toNumber(), "for 5000 holders should be 3% reward fee");
    assert.equal(4, (await c.getRewardFee(7000)).toNumber(), "for 7000 holders should be 4% reward fee");
    assert.equal(4, (await c.getRewardFee(10000)).toNumber(), "for 10000 holders should be 4% reward fee");
    assert.equal(6, (await c.getRewardFee(35000)).toNumber(), "for 35000 holders should be 6% reward fee");
    assert.equal(6, (await c.getRewardFee(50000)).toNumber(), "for 50000 holders should be 6% reward fee");
    assert.equal(8, (await c.getRewardFee(1000000)).toNumber(), "for 1000000 holders should be 8% reward fee");
  });
  
  it('should set fee before PreSale', async () => {
	const c = await Contract.deployed();
	await c.beforePreSale();
	
	const sellFee = await c.sellFee.call();
	const buyFee = await c.buyFee.call();

    assert.equal(0, sellFee, "sell Fee should be 0");
    assert.equal(0, buyFee, "sell Fee should be 0");
  });
  
  it('should set fee after PreSale', async () => {
	const c = await Contract.deployed();
	await c.afterPreSale();
	
	const sellFee = await c.sellFee.call();
	const buyFee = await c.buyFee.call();

    assert.equal(15, sellFee, "sell Fee should be 0");
    assert.equal(14, buyFee, "sell Fee should be 0");
  });
  
  it('should get Hold Fee depending hold time', async () => {
	const c = await Contract.deployed();
	await c.afterPreSale();
	
	var now = ((new Date()).getTime() / 1000).toFixed() - 1000; 
	
	assert.equal(15, (await c.getHoldFee(now)).toNumber(), "for few seconds should be 15% fee");
	assert.equal(15, (await c.getHoldFee(now - 100000)).toNumber(), "for few days should be 15% fee");
	assert.equal(15, (await c.getHoldFee(now - 600800)).toNumber(), "for < 1 week should be 15% fee");
	assert.equal(13, (await c.getHoldFee(now - 2590000)).toNumber(), "for < 1 month should be 13% fee");
	assert.equal(11, (await c.getHoldFee(now - 15550000)).toNumber(), "for < 6 months should be 11% fee");
	assert.equal(9, (await c.getHoldFee(now - 25552000)).toNumber(), "for > 6 months should be 9% fee");
  });
  
  it('should get buy fee depending holders (beforePreSale)', async () => {
	const c = await Contract.deployed();
	await c.beforePreSale();

	const buy2000 = await c.getBuyFee(2000, 500); 
	const buy1500 = await c.getBuyFee(1500, 12000); 

    assert.equal(0, buy2000[0].toNumber(), "beforePreSale rewardFee should be 0");
    assert.equal(0, buy2000[1].toNumber(), "beforePreSale tokenToTeam should be 0");
    assert.equal(2000, buy2000[2].toNumber(), "beforePreSale tokenToOwner should be 2000");
	
    assert.equal(0, buy1500[0].toNumber(), "beforePreSale rewardFee should be 0");
    assert.equal(0, buy1500[1].toNumber(), "beforePreSale tokenToTeam should be 0");
    assert.equal(1500, buy1500[2].toNumber(), "beforePreSale tokenToOwner should be 1500");
  });
  
  it('should get buy fee depending holders (afterPreSale)', async () => {
	const c = await Contract.deployed();
	await c.afterPreSale();

	const buy2000 = await c.getBuyFee(2000, 589); 
	const buy1500 = await c.getBuyFee(1500, 9785); 
	const buy5000 = await c.getBuyFee(5000, 1234567); 

    assert.equal(2, buy2000[0].toNumber(), "for 589 holders, rewardFee should be 2%");
    assert.equal(240, buy2000[1].toNumber(), "for 589 holders and 2000 tokens, tokenToTeam should be 240");
    assert.equal(1760, buy2000[2].toNumber(), "for 589 holders and 2000 tokens, tokenToOwner should be 1760");
	
    assert.equal(4, buy1500[0].toNumber(), "for 9785 holders, rewardFee should be 4%");
    assert.equal(150, buy1500[1].toNumber(), "for 9785 holders and 1500 tokens, tokenToTeam should be 150");
    assert.equal(1350, buy1500[2].toNumber(), "for 9785 holders and 1500 tokens, tokenToOwner should be 1350");
	
    assert.equal(8, buy5000[0].toNumber(), "for 1 234 567 holders, rewardFee should be 8%");
    assert.equal(300, buy5000[1].toNumber(), "for 1 234 567 holders and 5000 tokens, tokenToTeam should be 300");
    assert.equal(4700, buy5000[2].toNumber(), "for 1 234 567 holders and 5000 tokens, tokenToOwner should be 4700");
  });
  
  it('should get sell fee depending hold time (beforePreSale)', async () => {
	const c = await Contract.deployed();
	await c.beforePreSale();

	var now = ((new Date()).getTime() / 1000).toFixed() - 1000; 

	const sell2000 = await c.getSellFee(2000, now); 
	const sell1500 = await c.getSellFee(1500, (now - 2590000)); // < 1 month

    assert.equal(0, sell2000[0].toNumber(), "beforePreSale tokenToBuyBack should be 0");
    assert.equal(0, sell2000[1].toNumber(), "beforePreSale tokenToTeam should be 0");
    assert.equal(2000, sell2000[2].toNumber(), "beforePreSale tokenToOwner should be 2000");
	
    assert.equal(0, sell1500[0].toNumber(), "beforePreSale tokenToBuyBack should be 0");
    assert.equal(0, sell1500[1].toNumber(), "beforePreSale tokenToTeam should be 0");
    assert.equal(1500, sell1500[2].toNumber(), "beforePreSale tokenToOwner should be 1500");
  });
  
  it('should get sell fee depending hold time (afterPreSale)', async () => {
	const c = await Contract.deployed();
	await c.afterPreSale();

	var now = ((new Date()).getTime() / 1000).toFixed() - 1000; 

	const sell2000 = await c.getSellFee(2000, now); 
	const sell1500 = await c.getSellFee(1500, (now - 2590000)); // < 1 month
	const sell5000 = await c.getSellFee(5000, (now - 25552000)); // > 6 month

	assert.equal(165, sell2000[0].toNumber(), "for fews seconds hold and 2000 tokens, tokenToBuyBack should be 165");
    assert.equal(135, sell2000[1].toNumber(), "for fews seconds hold and 2000 tokens, tokenToTeam should be 135");
    assert.equal(1700, sell2000[2].toNumber(), "for fews seconds hold and 2000 tokens, tokenToOwner should be 1700");
  });
  
  it('should change team address', async () => {
	const c = await Contract.deployed();
	
	const teamAddress = await c.teamAddress.call();
	//const marketAddress = await c.marketAddress.call();
	//const devAddress = await c.devAddress.call();
	
	await c.setTeamAddress("0x0000000000000000000000000000000000000010");
	//await c.setMarketAddress("0x0000000000000000000000000000000000000011");
	//await c.setDevAddress("0x0000000000000000000000000000000000000012");
	
	const newTeamAddress = await c.teamAddress.call();
	//const newMarketAddress = await c.marketAddress.call();
	//const newDevAddress = await c.devAddress.call();

	assert.notEqual(teamAddress, newTeamAddress, "teamAddress should be changed");
	//assert.notEqual(marketAddress, newMarketAddress, "marketAddress should be changed");
	//assert.notEqual(devAddress, newDevAddress, "devAddress should be changed");
	
	assert.equal("0x0000000000000000000000000000000000000010", newTeamAddress, "teamAddress should be changed");
	//assert.equal("0x0000000000000000000000000000000000000011", newMarketAddress, "marketAddress should be changed");
	//assert.equal("0x0000000000000000000000000000000000000012", newDevAddress, "devAddress should be changed");
  });
  
});