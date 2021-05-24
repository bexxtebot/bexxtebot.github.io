const env_vars = require('./env_var.js');

function waitThenColor() {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve('HotPink');
    }, 2000);
  });
}

exports.configure = async function (client) {
  let c = await waitThenColor();
  
  // ensures she's always hot
  client.color(env_vars.CHANNEL_NAME, c);

  // let's everyone know a bad bitch just showed up
  // client.say(env_vars.CHANNEL_NAME, 'new patch who dis??? somethin just got updated uwu');
}