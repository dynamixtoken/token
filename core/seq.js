//import winston from 'winston';
//import { SeqTransport } from '@datalust/winston-seq';

var process = "";
var logger = null;

export function init(SEQ_URL, SEQ_API, processName) {
	/*logger = winston.createLogger({
	  transports: [
		new SeqTransport({
		  serverUrl: SEQ_URL,
		  apiKey: SEQ_API,
		  onError: (e => { console.error(e) }),
		})
	  ]
	});
	*/
	process = processName;
}


export function log(message, data) {
	if(data == null)
		data = {};
	data.process = process;
	
	//logger.info(message, data);
	console.info(message);
}

export function debug(message, data) {
	if(data == null)
		data = {};
	data.process = process;

	//logger.info(message, data);
	console.debug(message);
}

export function error(message, data) {
	if(data == null)
		data = {};
	data.process = process;

	//logger.error(message, data);
	console.error(message);
}
