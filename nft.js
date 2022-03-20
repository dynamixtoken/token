import * as sc from './core/sc.js';
import * as seq from './core/seq.js';
import fs from 'fs';

seq.init(process.env.SEQ_URL, process.env.SEQ_API, 'nft:lottery');
seq.log('Start NFT Update\n\r');

const nftFile = fs.readFileSync('./nft-owner.json');
const nfts = JSON.parse(nftFile);

// *********************************
// Reset NFT Owner
// *********************************
seq.log('Reset NFT Owner');
var nftids = [];
for(var i = 0; i < nfts.length; i++) 
	nftids.push(nfts[i].id);

await sc.resetNFTOwner(nftids);

// *********************************
// Add NFT Owner
// *********************************
seq.log('Add NFT Owner');
var nftOwners = [];
for(var i = 0; i < nfts.length; i++) {
	nftOwners.push({
		player: nfts[i].owner,
		nft: nfts[i].powers,
		nftIds: [nfts[i].id]
	});
}

await sc.addNFTOwner(nftOwners);

seq.log('End NFT Update');
process.exit(0);