// Requires stuff
const fs = require("fs");
const Twit = require("twit");
const Discord = require("discord.js");

// Load config
let config = {
	consumer_key: process.env.TWITTER_CONSUMER_KEY,
	consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
	access_token: process.env.TWITTER_ACCESS_TOKEN,
	access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
	discord_token: process.env.DISCORD_TOKEN,
	user: process.env.TWITTER_USER
};

// Check if any config value is null
let isConfigured = !Object.keys(config).some(key => {
	if (config[key] == undefined || config[key] == null) return true;
});

if (!isConfigured) {
	let data;
	try {
		data = JSON.parse(fs.readFileSync(__dirname + "/config.json"));
	} catch (e) {
		throw new Error("Failed to read config file: " + e.message);
	}
	isConfigured = !Object.keys(config).some(key => {
		if (data[key] == undefined || data[key] == null) return true;
	});
	if (!isConfigured) {
		throw new Error("Configuration is incomplete");
	}
	config = data;
}

const twitterClient = new Twit({
	consumer_key: config.consumer_key,
	consumer_secret: config.consumer_secret,
	access_token: config.access_token,
	access_token_secret: config.access_token_secret,
	timeout_ms: 60 * 1000,
	strictSSL: true
});
const discordClient = new Discord.Client();

discordClient.on("ready", () => {
	console.log(`Logged in as ${discordClient.user.tag}!`);
});

discordClient.on("message", msg => {
	twitterClient.post(
		"direct_messages/new",
		{
			screen_name: config.user,
			text: msg
		},
		e => {
			if (e) {
				throw new Error(e.message);
			}
		}
	);

	if (msg.content === "ping") {
		msg.reply("Pong!");
	}
});

discordClient.login(config.discord_token);
