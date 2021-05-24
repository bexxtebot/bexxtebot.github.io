const env_vars = require('./env_var.js');
let randomIndex;

// these are things that we want on a timer
const phrases = [
  '​Join the Basement Party and hang out offline here: https://discord.gg/bdMQHsd',

  'Link your amazon prime to twitch and get a free sub every month, ya nerds',

  'Hit the <3 to follow and get notified whenever I go live! It also makes my cold heart a little bit warmer!',

  '​Want ad-free viewing, cute bat emotes, and a cool tombstone next to your name? Hit the subscribe button to support the stream bexxteLove',

  'Hey there everyone, my name is BexxteBot! I am a custom chat bot designed specifically for this channel; if you see me do or say anything crazy, make sure to let @bexxters or @tonichaelmight know so that it can be fixed ASAP. Happy Chatting! bexxteLove',

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

];

// chooses a random phrase
function saySomethingRandom() {

  // if randomIndex has not been assigned, it can be any value
  if (!randomIndex) {
    randomIndex = Math.floor(Math.random() * phrases.length);
  // otherwise, we want to make sure it does not repeat the previous message
  } else {
    const prevIndex = randomIndex;
    while (prevIndex === randomIndex) {
      randomIndex = Math.floor(Math.random() * phrases.length);
    }
  }
  
  // returns the random phrase within 12 - 35 minutes
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(phrases[randomIndex]);
    }, Math.floor(Math.random() * 1380000) + 720000);
  });
}


// exports function
exports.timer = async function (client) {

  while (true) {

    // gets the result of promise and chats it
    const msg = await saySomethingRandom();
    client.say(env_vars.CHANNEL_NAME, msg);

  }

}