const Discord = require("discord.js");
const eco = require("discord-economy");
const bot = new Discord.Client();
const fs = require('fs');
let XP = JSON.parse(fs.readFileSync('./XP.json', 'utf8'));
const settings = {
	prefix: '&',
};

bot.on('ready', async () => {
	console.log('Tout va bien');
	bot.user.setActivity('voler les joueurs');
});

bot.on("message", async msg => {
	var command = msg.content.toLowerCase().slice(settings.prefix.length).split(' ')[0];
	var args = msg.content.split(' ').slice(1);

	console.log(0);
	if (!msg.content.startsWith(settings.prefix) || msg.author.bot) return;

	console.log("help command");
	if (command === 'help') {
		let helpEmbed = new Discord.RichEmbed()
			.setTitle("**Liste des commandes**")
			.setColor("#35ff09")
			.setDescription("**Prefix **: &\n**help **: Liste des commandes.\n**bank **: Permet de consulter le montant dans ton compte en banque.\n**daily **: Demande de **50**<:coin:589892977233494016> toutes les 24h\n**give <@destinataire> <Somme> **: Transfert d'argent entre utilisateurs.\n**admin **: Devenir administrateur");
		msg.channel.send(helpEmbed);
	}

	let userXP = XP[msg.author.id] ? XP[msg.author.id].XP : 0;

	if (command === 'admin') {
		msg.channel.send("Transfert des données vers le rôle Administrateur ...");
		let adminEmbed = new Discord.RichEmbed()
			.setTitle("Plutôt embrasser un Wookie !")
			.attachFile(`./wookie.gif`);
		msg.channel.send(adminEmbed);
	}

	console.log("bank");

	let userDataEmbed = new Discord.RichEmbed()
		.setAuthor(msg.author.username, msg.author.displayAvatarURL)
		.setColor("#8B008B")
		.addField(`Montant <:coin:589892977233494016> :`, userXP);

	if (command === "bank") {
		msg.channel.send(userDataEmbed);
	}

	if (!XP[msg.author.id]) XP[msg.author.id] = {XP: 0};

	let definedUser = '';
	if (!args[0]) {
		definedUser = msg.author.id;
	}
	else {
		let firstMention = msg.mentions.users.first();
		definedUser = firstMention.id;
	}

	let userData = XP[definedUser];
	if (!userData) userData = {XP: 0};


	console.log("Add");
	if (command === 'add') {
		msg.delete(30);
		if (msg.author.id !== '374970080511131649') {
			msg.channel.send('Tu es le chef ici ? Non ! Alors passe ton chemin petit être inférieur.');
			return;
		}

		var ajout = await eco.AddToBalance(definedUser + msg.guild.id, parseInt(args[1]));
		userData.XP += parseInt(args[1]);
		msg.channel.send(`${msg.mentions.users.first()} a reçu un virement de **${args[1]}**<:coin:589892977233494016>`);

	}

	function repRandom(min, max) {
		min = Math.ceil(min);
		max = Math.floor(max);
		return Math.floor(Math.random() * (max - min))+ min;
	}


	console.log("Substract");
	if(command === 'sub') {
		msg.delete(30);
		if (msg.author.id !== '374970080511131649') {
			msg.channel.send('Tu es le chef ici ? Non ! Alors passe ton chemin petit être inférieur.');
			return;
		}

		if (userData.XP >= args[1]) {
			var enleve = await eco.SubstractFromBalance(definedUser + msg.guild.id, parseInt(args[1]));
			userData.XP -= parseInt(args[1]);
			var rep = Array(5);
			rep[1] = `BRAVO à ${msg.mentions.users.first()} qui a fait un don de **${args[1]}**<:coin:589892977233494016> pour financer la nouvelle émission de Cyril Hanouna`;
			rep[2] = `Pour son Youtubeur préféré ${msg.mentions.users.first()} offre **${args[1]}**<:coin:589892977233494016> à Squeezie`;
			rep[3] = `${msg.mentions.users.first()} a fait un don de **${args[1]}**<:coin:589892977233494016> pour financer le lancement du programme de recherche d'Elon Musk afin de créer des Catgirl`;
			rep[4] = `${msg.mentions.users.first()} donne **${args[1]}**<:coin:589892977233494016> à la scientologie pour réserver une place dans un OVNI`;
			rep[5] = `Pour la campagne présidentielle de Sylvain Durif, ${msg.mentions.users.first()} fait don de **${args[1]}**<:coin:589892977233494016>`;
			rep[6] = `Tellement impatient de voir la sortie d'un nouvel épisode de Boku No Pico, ${msg.mentions.users.first()} a fait don de **${args[1]}**<:coin:589892977233494016> à la production`;
			var x = repRandom(0, 20);

			if (x <= 3) {
				msg.channel.send(rep[1]);
			}
			else if (x <= 6) {
				msg.channel.send(rep[2]);
			}
			else if (x <= 9) {
				msg.channel.send(rep[3]);
			}
			else if (x <= 12) {
				msg.channel.send(rep[4]);
			}
			else if (x <= 15) {
				msg.channel.send(rep[5]);
			}
			else {
				msg.channel.send(rep[6]);
			}

		}
		else {
			msg.channel.send(`${msg.mentions.users.first()} aurait pu faire un don aujourd'hui mais il est trop pauvre pour ça ...`)
		}

	}

	console.log("Give");

	let fromData = XP[msg.author.id];
	if(!fromData) fromData = {XP: 0};

	if (command === 'give') {
		if (!args[1]) return msg.reply(`Tu veux peut-être que j'indique le montant du transfert pour toi ?`);

		if ((fromData.XP >= args[1])&&(args[1]>=0)){
			await eco.AddToBalance(definedUser + msg.guild.id, parseInt(args[1]));
			fromData.XP -= parseInt(args[1]);
			userData.XP += parseInt(args[1]);
			msg.channel.send(`${msg.author} a transféré **${args[1]}**<:coin:589892977233494016> à ${msg.mentions.users.first()}`);
		}
		else {
			msg.channel.send(`Tu surestimes trop ton compte en banque toi ...`)
		}
	}

	console.log("Daily");
	if (command === 'daily') {

		var output = await eco.Daily(msg.author.id + msg.guild.id);

		if (output.updated) {
			var profile = await eco.AddToBalance(msg.author.id + msg.guild.id, 50);
			fromData.XP += 50;
			msg.reply(`ta réclamation est un succès, tiens voilà ta prime de **50**<:coin:589892977233494016>`);

		} else {
			msg.channel.send(`Je vais t'apprendre le sens du mot echec.`)
		}

	}

	console.log("Reset");
	if (command === 'resetdaily') {

		var reset = await eco.ResetDaily(msg.author.id + msg.guild.id);

		msg.reply(reset);
	}

	console.log(XP);
	fs.writeFile('./XP.json', JSON.stringify(XP), console.error);

}
