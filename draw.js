import * as sc from './core/sc.js';
import * as seq from './core/seq.js';

seq.init(process.env.SEQ_URL, process.env.SEQ_API, 'draw:lottery');
seq.log('Start Draw Lottery\n\r');

// *********************************
// Get Current Lottery
// *********************************
var lottery = await sc.getCurrentLottery();
seq.log(`Current Lottery: ${lottery.id}`);
seq.log(lottery);

if(lottery.endTime == 0) {
	seq.log('End Draw - Lottery is not over');
	process.exit(0);
}
// Check If lottery is end
const now = Math.floor((new Date()).getTime()/1000);
if(now < lottery.endTime) {
	seq.log('End Draw - Lottery is not over');
	process.exit(0);
}
	
// *********************************
// Draw Current Lottery
// *********************************
if(lottery.status == 0) {
	seq.log(`Draw Lottery: ${lottery.id}`);
	await sc.draw(lottery.id);
}

lottery = await sc.getCurrentLottery();
seq.log(`Current Lottery: ${lottery.id}`);
seq.log(lottery);

// *********************************
// Calcul Winners Per Bracket
// *********************************
var tickets = await sc.getTickets(lottery);
seq.log(`Ticket Length: ${tickets.length}`);

var winnersPerBracket = [];
for(var i = 0; i < 6; i++) {
	winnersPerBracket[i] = tickets.filter(t => t.matchNumber == (i+1)).length;
}

seq.log(`Winners Per Bracket: ${winnersPerBracket}`);

if(lottery.status == 1) {
	seq.log(`Set Winners Per Bracket`);
	await sc.winners(lottery.id, winnersPerBracket);
}

lottery = await sc.getCurrentLottery();

// *********************************
// Create New Lottery
// *********************************
if(lottery.status == 2) {
	await sc.create();
	lottery = await sc.getCurrentLottery();
	seq.log(`New Lottery: ${lottery.id}`);
	seq.log(lottery);
}

seq.log('End Draw Lottery');
process.exit(0);