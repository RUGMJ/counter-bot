import { Client, Intents } from 'discord.js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const client = new Client({
	intents: [
		Intents.FLAGS.GUILDS,
		Intents.FLAGS.GUILD_MESSAGES,
		Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
		Intents.FLAGS.DIRECT_MESSAGES,
	],
});

let db = fs.readFileSync('./db.json');
let dbParsed = JSON.parse(db.toString());
console.log(db);

let { currentNum, lastUser } = dbParsed;

client.on('messageCreate', message => {
	if (!message.guild) {
		currentNum = 0;
		lastUser = null;
	} else {
		if (message.channel.id !== process.env.channelId) return;
		const number = Number.parseInt(message.content);

		if (isNaN(number)) {
			message.delete();
			return;
		}

		if (currentNum + 1 !== number) {
			message.delete();
			return;
		}

		if (lastUser === message.author.id) {
			message.delete();
			return;
		}
		// message.react('✅');
		currentNum++;
		lastUser = message.author.id;
	}
	client.user?.setActivity({ name: `Current Number: ${currentNum}` });
	dbParsed.currentNum = currentNum;
	dbParsed.lastUser = lastUser;
	fs.writeFileSync('./db.json', JSON.stringify(dbParsed));
});

client.on('ready', () => {
	console.log(
		`https://discord.com/api/oauth2/authorize?client_id=${client.application?.id}&permissions=8&scope=applications.commands%20bot`,
	);
});

client.login(process.env.token);
