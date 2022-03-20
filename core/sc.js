import ethers from 'ethers';
import dotenv from 'dotenv/config';
import * as seq from './seq.js';
import fs from 'fs';

const wallet_operator = new ethers.Wallet(process.env.OWNER_OPERATOR_PRIVATE);
const wallet_nft = new ethers.Wallet(process.env.OWNER_NFT_PRIVATE);
const provider = process.env.BSC_RPC_NODE != "" ? new ethers.providers.JsonRpcProvider(process.env.BSC_RPC_NODE) : new ethers.providers.WebSocketProvider(process.env.BSC_WSS_NODE);			
const lottery_operator = wallet_operator.connect(provider);
const nft_operator = wallet_nft.connect(provider);

const tokenFile = fs.readFileSync('./token/DynamixLottery.json');
const tokenCode = JSON.parse(tokenFile);
const smartContract = new ethers.Contract(process.env.LOTTERY_TOKEN, tokenCode.abi, lottery_operator);

const tokenNFTFile = fs.readFileSync('./token/DynamixLotteryNFT.json');
const tokenNFTCode = JSON.parse(tokenNFTFile);
const smartContractNFT = new ethers.Contract(process.env.LOTTERY_NFT, tokenNFTCode.abi, nft_operator);

const MAX_BULK = 100;
const NEXT_LOTTERY_MIN = 10;

// Get Current Lottery Id
export async function getCurrentLottery() {
	var lotteryId = await smartContract.currentLotteryId();
	var lottery = await smartContract.viewLottery(lotteryId);
	
	return {
		id: lotteryId.toString(),
        status: lottery.status,
        startTime: lottery.startTime.toNumber(),
        endTime: lottery.endTime.toNumber(),
        firstTicketId: lottery.firstTicketId.toString(),
        lastTicketId: lottery.lastTicketId.toString(),
        amount: lottery.amount.toString(),
        winningNumber: lottery.winningNumber
	};
}

// Get Tickets Lottery
export async function getTickets(lottery) {
	var length = parseInt(lottery.lastTicketId) - parseInt(lottery.firstTicketId);
	var tickets = [];
	var from = 0;
	var to = 0;
	
	for(var lot = 0; lot < (length / MAX_BULK); lot++) {
		from = parseInt(lottery.firstTicketId) + lot * MAX_BULK;
		to = from + MAX_BULK;
		
		seq.log(`Get Tickets: ${from} -> ${to}`);
		var res = await smartContract.viewTickets(lottery.id, from, to);
		
		for(var i = 0; i < res.length; i++) {
			tickets.push({
				number: res[i].number,
				matchNumber: res[i]. matchNumber,
				player: res[i].player,
				claimed: res[i].claimed,
			});
		}
	}
	
	return tickets;
}

// Draw Lottery
export async function draw(lotteryId) {
	var rd = Math.floor(Math.random() * (10000 - 1000 + 1) + 100);
	var tx = await smartContract.draw(lotteryId, rd);
	var receipt = await tx.wait();

	seq.log(`Transaction receipt : https://www.bscscan.com/tx/${receipt.logs[0].transactionHash}`);
}

// Create New Lottery
export async function create() {
	const now = new Date();
	const next = Math.floor(now.setMinutes(now.getMinutes() + NEXT_LOTTERY_MIN) / 1000);
	
	var tx = await smartContract.createLottery(next);
	var receipt = await tx.wait();

	seq.log(`Transaction receipt : https://www.bscscan.com/tx/${receipt.logs[0].transactionHash}`);
}


// Calcul Winners Per Bracket
export async function winners(lotteryId, winnersPerBracket) {
	var tx = await smartContract.calculWinnersPerBracket(lotteryId, winnersPerBracket, [2, 3, 5, 15, 25, 50]);
	var receipt = await tx.wait();

	seq.log(`Transaction receipt : https://www.bscscan.com/tx/${receipt.logs[0].transactionHash}`);
}

// Reset NFT Owner
export async function resetNFTOwner(nftIds) {
	var tx = await smartContractNFT.resetNFTOwner(nftIds);
	var receipt = await tx.wait();

	seq.log(`Transaction receipt : https://www.bscscan.com/tx/${receipt.transactionHash}`);
}

// Add NFT Owner
export async function addNFTOwner(nftPlayers) {
	var tx = await smartContractNFT.addNFTOwner(nftPlayers);
	var receipt = await tx.wait();

	seq.log(`Transaction receipt : https://www.bscscan.com/tx/${receipt.transactionHash}`);
}