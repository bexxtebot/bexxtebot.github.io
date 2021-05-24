// GLOBAL REQUIREMENTS
const env_vars = require('./env_var.js');
const tmi = require('tmi.js');

//creates client instance and connects; this allows the program to read chat messages
const client = new tmi.Client({
	options: { debug: true },
	connection: {
		reconnect: true,
		secure: true
	},
	identity: {
		username: env_vars.BOT_NAME,
		password: env_vars.TWITCH_OAUTH_TOKEN
	},
	channels: [env_vars.CHANNEL_NAME]
});

client.connect();e

// sets name color and greets chat
const setup = require('./setup.js');
setup.configure(client);

// COOLDOWNS
const cooldowns = [];

const cooldown = ms => {
	return new Promise(resolve => {
		setTimeout(() => {
			resolve(true);
		}, ms);
	});
};

async function createCooldown(cmd, ms = 10000) {
	// adds cooldown to array
	cooldowns.push(cmd);

	// calls 10 sec cooldown, waits for return
	const done = await cooldown(ms);

	// checks that cooldown is done
	if (done) {
		// removes command from array
		cooldowns.splice(cooldowns.indexOf(cmd), 1);
	}
}

// child process tingz; exec function runs a shell script
const { exec } = require('child_process');

// this is the function that actually reads every message; desicions on how the bot acts are contained within
client.on('message', (channel, tags, message, self) => {
	// PARAMETER DESCRIPTIONS
	//console.log(channel); // the channel the chat is in; should match env_vars.CHANNEL_NAME
	//console.log(tags); // contains metadata about the message and the user who sent it; bexxtebot tags below as example.
	/*
  {
    'badge-info': { subscriber: '1' },
    badges: { moderator: '1', subscriber: '0' },
    color: '#FF69B4',
    'display-name': 'BexxteBot',
    'emote-sets': '0,301288873',
    mod: true,
    subscriber: true,
    'user-type': 'mod',
    'badge-info-raw': 'subscriber/1',
    'badges-raw': 'moderator/1,subscriber/0',
    username: 'bexxtebot',
    emotes: { '302574576': [ '43-51' ] },
    'emotes-raw': '302574576:43-51',
    'message-type': 'chat'
  }
  */
	//console.log(message); // contains the actual message content as a string
	//console.log(self); // true if the bot sent the message, false otherwise

	if (tags.username === 'moobot') {
		const randNum = Math.floor(Math.random() * 30);

		switch (randNum) {
			case 0:
			case 1:
			case 2:
				client.say(channel, 'grrrrr');
				return;
			case 3:
				client.say(channel, 'hisssssss');
				return;
			default:
				return;
		}
	}

	// MODERATION

  for (const term of env_vars.FORBIDDEN_TERMS) {
    if (message.includes(term) /* && tags.mod === false*/) {
      client.timeout(channel, tags.username, 60, 'used a forbidden term');
      return;
    }
  }
	
  
  

	// is the user who sent the message a mod
	const isMod = tags.mod;

	// lowercase everything to make matching easier
	message = message.toLowerCase();

	// lurk command; allows for use of !lurk anywhere in a message; no global cooldown
	if (
		message === '!lurk' || 
    message.startsWith('!lurk ') ||
		message.endsWith(' !lurk') ||
		message.includes(' !lurk ')
	) {
		client.say(
			channel,
			`${
				tags.username
			} is now lurkin in the chat shadows. Stay awhile and enjoy! bexxteCozy`
		);
		return;
	}

	// all other commands begin with '!'; any other messages can be ignored
	if (self || !message.startsWith('!')) return;

	// remove the !
	let command = message.slice(1);

	// if we make it this far, parse out what the command is
	if (command.indexOf(' ') !== -1) {
		command = command.slice(0, command.indexOf(' '));
	}

  // command must be listed and active in env_var.js
  if (! env_vars.ACTIVE_COMMANDS.includes(command)) {
    return;
  }

	// check for cooldowns, but not if user is a mod
	if (!isMod) {
		if (cooldowns !== []) {
			for (const cmd of cooldowns) {
				if (command === cmd) {
					return;
				}
			}
		}
	}

	//
	// BASIC COMMANDS
	//

  // bttv command
	if (command === 'bttv') {
		createCooldown(command);

		client.say(
			channel,
			`Install bttv here (https://betterttv.com/) to use these cool emotes: 
      blobDance 
      monkaTOS 
      catblobDance 
      hypeE 
      think3D 
      HYPERS  
      elmoFire 
      WEEWOO 
      WELCOME 
      nutButton 
      ChefsKiss 
      AerithBop 
      KEKW 
      OhMyPoggies 
      peepoRiot
      HoldIt`
		);
		return;
	}

  // commands command lol
	if (command === 'commands') {
		createCooldown(command);

		client.say(
			channel,
			"Want to see all of the commands at my disposal? Head to https://commands.tonichaelmight.repl.co for a full list. I'm still learning new things, so check back every now and then to see if there's anything new!"
		);
	}

  // discord command
	if (command === 'discord') {
		createCooldown(command);

		client.say(
			channel,
			'​Join the Basement Party and hang out offline here: https://discord.gg/bdMQHsd'
		);
		return;
	}

	// follow command
	if (command === 'follow') {
		createCooldown(command);

		client.say(
			channel,
			'Hit the <3 to follow and get notified whenever I go live! It also makes my cold heart a little bit warmer!'
		);
		return;
	}

  // music command
	if (command === 'music') {
		createCooldown(command);

		if (env_vars.PLAYLIST.length > 0) {
			client.say(channel, `Today's playlist is ${env_vars.PLAYLIST}`);
		}

		return;
	}

  // prime command
	if (command === 'prime') {
		createCooldown(command);

		client.say(
			channel,
			'​Link your amazon prime to twitch and get a free sub every month, ya nerds'
		);
		return;
	}

	// raid command
	if (command === 'raid' && isMod) {
		createCooldown(command, 2000); //two seconds

		client.say(
			channel,
			`​Welcome and thank you for the raid! When people raid, they sadly don't count to twitch averages, so it would be a big help if you could get rid of the '?referrer=raid' in the url! I appreciate you so much! bexxteLove`
		);
		return;
	}

  // shoutout command
	if (command === 'so' && isMod) {
		// creates variable for shoutout-ee
		const soee = message.slice(4);

		// eliminates messages with more than one word after the command
		if (soee.indexOf(' ') !== -1) {
			return;
		}

		// a twitch username must be between 4 and 25 characters
		if (soee.length < 4 || soee.lenth > 25) {
			return;
		}

		// cannot shout yourself out
		if (soee === tags.username) {
			client.say(
				channel,
				`Nice try @${soee}, you can't give yourself a shoutout!`
			);
			return;
		}

		// cannot shoutout streamer
		if (soee === env_vars.CHANNEL_NAME) {
			client.say(
				channel,
				`@${
					env_vars.CHANNEL_NAME
				} is pretty cool, but she doesn't need a shoutout on her own channel.`
			);
			return;
		}

		// get channel information
		exec(
			`curl -X GET "https://api.twitch.tv/helix/search/channels?query=${soee}" \
      -H 'Authorization: Bearer ${env_vars.BEXXTEBOT_TOKEN}' \
      -H 'Client-id: ${env_vars.CLIENT_ID}'`,
			(error, stdout, stderr) => {
				if (error) {
					console.error(`exec error: ${error}`);
					return;
				}
				// output is entire search data
				let channelData = `${stdout}`;
				// parses to JSON
				channelData = JSON.parse(channelData);

				// isolates the channel we need; ideally it is the first channel
				for (const channel of channelData.data) {
					if (channel.broadcaster_login === soee) {
						channelData = channel;
						break;
					}
				}

				// console.log(channelData);

				/* sample channel data
        {
          broadcaster_language: '',
          broadcaster_login: 'bexxtebot',
          display_name: 'BexxteBot',
          game_id: '0',
          game_name: '',
          id: '688448029',
          is_live: false,
          tag_ids: [],
          thumbnail_url: 'https://static-cdn.jtvnw.net/user-default-pictures-uv/de130ab0-def7-11e9-b668-784f43822e80-profile_image-300x300.png',
          title: '',
          started_at: ''
        }
        */

				// if there is no exact match, no shoutout
				if (!channelData.broadcaster_login) {
					return;
				}

				// if there is no game data, do a simple shoutout
				if (channelData.game_name === '' || !channelData.game_name) {
					client.say(
						channel,
						`Everyone go check out @${channelData.display_name} at twitch.tv/${channelData.broadcaster_login}! bexxteLove`
					);
					return;
				}

				// determine if streamer is live
				if (channelData.is_live) {
					if (channelData.game_name === 'Just Chatting') {
						client.say(
							channel,
							`Everyone go check out @${channelData.display_name} at twitch.tv/${channelData.broadcaster_login}! They are currently "${channelData.game_name}" bexxteLove`
						);
						return;
					} else {
						client.say(
							channel,
							`Everyone go check out @${channelData.display_name} at twitch.tv/${channelData.broadcaster_login}! They are currently playing "${channelData.game_name}" bexxteLove`
						);
						return;
					}
					// or offline
				} else {
					if (channelData.game_name === 'Just Chatting') {
						client.say(
							channel,
							`Everyone go check out @${channelData.display_name} at twitch.tv/${channelData.broadcaster_login}! They were last seen "${channelData.game_name}" bexxteLove`
						);
						return;
					} else {
						client.say(
							channel,
							`Everyone go check out @${channelData.display_name} at twitch.tv/${channelData.broadcaster_login}! They were last seen playing "${channelData.game_name}" bexxteLove`
						);
						return;
					}
				}
			}
		);

		return;
	}

	// sub command
	if (command === 'sub') {
		createCooldown(command);

		client.say(
			channel,
			'​Want ad-free viewing, cute bat emotes, and a cool tombstone next to your name? Hit the subscribe button to support the stream bexxteLove'
		);
		return;
	}	

  // uptime command
	if (command === 'uptime') {
		createCooldown(command);

		//const streamer = 'matthallplays';
		const streamer = env_vars.CHANNEL_NAME;

		exec(
			`curl -X GET "https://api.twitch.tv/helix/search/channels?query=${streamer}" \
      -H 'Authorization: Bearer ${env_vars.BEXXTEBOT_TOKEN}' \
      -H 'Client-id: ${env_vars.CLIENT_ID}'`,
			(error, stdout, stderr) => {
				if (error) {
					console.error(`exec error: ${error}`);
					return;
				}
				// output is entire search data
				let channelData = `${stdout}`;
				// parses to JSON
				channelData = JSON.parse(channelData);

				// isolates the channel we need; ideally it is the first channel
				for (const channel of channelData.data) {
					if (channel.broadcaster_login === streamer) {
						channelData = channel;
						break;
					}
				}

				if (!channelData.is_live) {
					client.say(
						channel,
						`Sorry, doesn't look like ${streamer} is live right now. Check back again later!`
					);
					return;
				}

				const currentTime = Date.now();
			  console.log(currentTime);

				const startTime = Date.parse(channelData.started_at);
				// console.log(startTime);

				let elapsedTime = currentTime - startTime;
				// console.log(elapsedTime);

				const hours = Math.floor(elapsedTime / (60000 * 60));
				elapsedTime = elapsedTime % (60000 * 60);

				const minutes = Math.floor(elapsedTime / 60000);
				elapsedTime = elapsedTime % 60000;

				const seconds = Math.floor(elapsedTime / 1000);

				client.say(
					channel,
					`${streamer} has been live for ${
						hours === 0 ? '' : `${hours} hours, `
					}${minutes} minutes and ${seconds} seconds.`
				);
				return;
			}
		);
	}

	// whomst command
	if (command === 'whomst') {
		createCooldown(command, 2000); //two seconds

		client.say(
			channel,
			"​I'm a Variety Streamer mostly streaming RPGs, Horror, and Indie stuff because I'm not good at Battle Royale FPS games and can't commit to MMOs. You can catch me live five to six nights a week at 7:30pm EST! We do Spooky Sunday with horror/suspense games every Sunday!"
		);
		return;
	}


  //
	// SPECIAL COMMANDS
	//


  // ban command
  if (command === 'ban') {
    // eliminates messages that are too short or too long to contain a valid username
    if (message.length < 9 || message.length > 30) {
      return;
    }

    // argument is everything after the command + ' '
    const username = message.slice(5);

    // eliminate messages with more than one word following the command
    if (username.indexOf(' ') !== -1) {
      return;
    }

    createCooldown(command);

    client.say(channel, `@${username} if the Twitch API would let me, I would ban you from this chat, but know that you are already banned from my heart. </3`);
    return;
  }

  // BLM command
  if (command === 'blm') {
    createCooldown(command);

    client.say(channel, 'Black Lives Matter. Follow this link to learn about ways you can support the movement: https://blacklivesmatters.carrd.co/')
  }

  // content warning command
  if (command === 'cw') {
    createCooldown(command);

    if (env_vars.CONTENT_WARNING) {
      client.say(channel, `${env_vars.CONTENT_WARNING}`);
    } else {
      client.say(channel, 'The streamer has not designated any content warnings for this game.');
    }

    return;
  }

	// stap command
	if (command === 'stap') {
		createCooldown(command);

		client.say(
			channel,
			'​stop flaming ok! I dnt ned all da negatwiti yo ar geveng me right nau! bexxteGun'
		);
		return;
	}

  // mute command
  if (command === 'mute') {
    createCooldown(command);

    for (let i = 0; i < 3; i++) {
      client.say(channel, `@${env_vars.CHANNEL_NAME.toUpperCase()} HEY QUEEN 👸👸👸 YOU'RE MUTED`);
    }
    
    return;
  }

  // raiding command
	if (command === 'raiding' && isMod) {
		// filter out messages with more than one word after the command
		if (message.slice(9).indexOf(' ') !== -1) {
			return;
		} else {
			// gets argument from message
			const argument = message.slice(9);

			// output based on argument
			switch (argument) {
				case 'cozy':
					client.say(channel, 'Cozy Raid bexxteCozy bexxteCozy');
					return;
				case 'love':
					client.say(channel, 'Bexxters Raid bexxteLove bexxteLove');
					return;
				case 'kiwi':
					client.say(channel, 'Kindred Kiwi Raid bexxteLove bexxteLove');
					return;
				case 'vibe':
					client.say(channel, 'Bexxters Raid bexxteBop bexxteBop');
					return;
				case 'aggro':
					client.say(channel, 'Bexxters Raid bexxteGun bexxteGun');
					return;
				default:
					client.say(
						channel,
						'The !raiding command can be followed by any of these: cozy, love, kiwi, vibe, aggro'
					);
					return;
			}
		}
	}

	// welcome command
	if (command === 'welcome') {
		createCooldown(command);

		client.say(channel, 'his has bondage to you too owo WELCOME');
		return;
	}


	//
	// EXPERIMENTS
	//

	// hello command; takes one argument
	if (command === 'hello') {
		// '!hello ' is 7 characters and a twitch username must be at least 4 characters
		if (message.length >= 11) {
			// only one argument allowed, which no trailing spaces && a twitch username can have a maximum of 25 characters
			if (
				message.slice(7).indexOf(' ') === -1 &&
				message.slice(7).length <= 25
			) {
				const recipient = message.slice(7);
				client.say(channel, `${tags.username} says 'Hello', @${recipient}`);
				return;
				// break out for more than one word after/argument too long
			} else {
				return;
			}

			// messages under 11 characters do not have enough characters to contain a valid username
		} else {
			return;
		}
	}

	// fortune command
	if (command === 'fortune') {
		createCooldown(command);

		return;
	}

  // bexxtebot command
	if (command === 'bexxtebot') {
		createCooldown(command);

		client.say(
			channel,
			'Hey there everyone, my name is BexxteBot! I am a custom chat bot designed specifically for this channel; if you see me do or say anything crazy, make sure to let @bexxters or @tonichaelmight know so that it can be fixed ASAP. Happy Chatting! bexxteLove'
		);
		return;
	}

  // socials command
  if (command === 'socials') {
    createCooldown(command);

    client.say(channel, `Come follow me on these other platforms as well!         
    Twitter: ${env_vars.TWITTER}      
    TikTok: ${env_vars.TIK_TOK}`)
  }

	// validate command
	if (command === 'validate') {
		createCooldown(command, 5000);

		// all the nice things bexxteBot has to say
		const validations = [
			'You are valid!!',
			'You matter!',
			'You are important!',
			'You are beautiful!',
      'You a boss ass bitch!'
		];

		// generates a random index from validations
		function getRandomValidation() {
			return Math.floor(Math.random() * validations.length);
		}

		// get three random indices; make sure they're all different
		let v1, v2, v3;

		v1 = getRandomValidation();

		while (!v2 || v2 === v1) {
			v2 = getRandomValidation();
		}

		while (!v3 || v3 === v1 || v3 === v2) {
			v3 = getRandomValidation();
		}

		// she gives you three validation phrases
		client.say(
			channel,
			`@${tags.username}
                          ${validations[v1]}
                          ${validations[v2]}
                          ${validations[v3]}`
		);
		return;
	}


  //
	// PEOPLE
	//

	// marta command
	if (command === 'marta') {
		createCooldown(command, 5000); // 5 seconds

		client.say(
			channel,
			'​Check out (and maybe commission) our UwUest mod and amazing artist Marta over at https://twitter.com/_martuwu or https://martuwuu.carrd.co/ or https://twitch.tv/martuwu_'
		);
		return;
	}

	// tim command
	if (command === 'tim') {
		createCooldown(command, 5000); // 5 seconds

		client.say(
			channel,
			'​my partner of 6 years. person I complain to when my stream randomly dies. pretty cool dude.'
		);
		return;
	}

	// michael command
	if (command === 'michael') {
		createCooldown(command, 5000); // 5 seconds

		client.say(
			channel,
			"Humor King tonichaelmight aka my best friend for over half my life??? we're old."
		);
		return;
	}

	//yackie command
	if (command === 'yackie') {
		createCooldown(command, 5000); // 5 seconds

		client.say(
			channel,
			'​Check out one of my bestest buds and overall cool gal Jackie at twitch.tv/broocat !'
		);
		return;
	}
  

	//
	// TESTING
	//

	// test command
	if (command === 'test') {
		createCooldown(command);

		client.say(
			channel,
			`@${tags.username}, if you see this, the bot is working!`
		);
		return;
	}
});

///////////////////////////////////
//TIMER
///////////////////////////////////

// connects timer module
const timer_file = require('./timer.js');
const timer = timer_file.timer;

// runs timer
timer(client);

/* EMOTES
bexxteCozy 
bexxteXcite 
bexxteBop 
bexxteGun 
bexxteLove
*/
