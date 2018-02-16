// mqtt
const MQTT_NODE_DOMO_LOG = 'home/domo/log/nodedomo';
var client;
var domoService;


function init(mqttClient, pDomoService) {
  client = mqttClient;
  domoService = pDomoService;
}

function logMqtt(msg) {  
  if (client) {
    client.publish(MQTT_NODE_DOMO_LOG, msg); 
  } else {
    console.log("ERROR: client is null");
  }
}

// Telegram Bot --------------------------------------------------
const token = '462682835:AAHRlPRSZosdvazBacJyG1YNDwb43VA_svw';

// telegraf
const Telegraf = require('telegraf')
const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')

const { reply } = Telegraf
const bot = new Telegraf(token)

bot.start((ctx) => {
  console.log('started:', ctx.from.id)
  return ctx.reply('Bienvenue a Domo!')
})
bot.command('help', (ctx) => ctx.reply('Try send a sticker!'))
bot.hears('hi', (ctx) => ctx.reply('Hey there!'))
bot.hears(/buy/i, (ctx) => ctx.reply('Buy-buy!'))
bot.on('sticker', (ctx) => ctx.reply('ðŸ‘'))

bot.hears(/cmd (.+)/, ({ match, reply }) => {
  var cmd=match[1];
  domoService.runCommand({"type":"cmdCommand","id":cmd});
  reply("Execution commande "+cmd+" ok");
})

bot.command('menu', (ctx) => {
  return ctx.reply('<b>Menu Domo</b>', Extra.HTML().markup((m) =>
    m.inlineKeyboard([
      m.callbackButton('Maison', 'mnMaison'),
      m.callbackButton('Media', 'mnMedia'),
      m.callbackButton('Salon', 'mnSalon'),
      m.callbackButton('Studio', 'mnStudio'),
      m.callbackButton('Webcam', 'mnWebcam')
    ])))   
})


bot.action('mnDomo', (ctx, next) => {  
  return ctx.editMessageText('<b>Menu Domo</b>', Extra.HTML().markup((m) =>
    m.inlineKeyboard([
      [
        m.callbackButton('Home', 'mnMaison'),
        m.callbackButton('Media', 'mnMedia'),
        m.callbackButton('Salon', 'mnSalon'),
        m.callbackButton('Studio', 'mnStudio'),
        m.callbackButton('Webcam', 'mnWebcam')
      ]    
    ])))  
})

bot.action('mnWebcam', (ctx, next) => {  
  ctx.replyWithPhoto(
      { url: "http://draffault.fr:8200/image.jpg?user=admin&password=tetris" }
  )  
  
  return ctx.reply('<b>Menu Domo</b>', Extra.HTML().markup((m) =>
    m.inlineKeyboard([
      [
        m.callbackButton('Home', 'mnMaison'),
        m.callbackButton('Media', 'mnMedia'),
        m.callbackButton('Salon', 'mnSalon'),
        m.callbackButton('Studio', 'mnStudio'),
        m.callbackButton('Webcam', 'mnWebcam')
      ]    
    ])))  
})

bot.action('mnMaison', (ctx, next) => {  
  return ctx.editMessageText('<b>Menu Maison</b>', Extra.HTML().markup((m) =>
    m.inlineKeyboard([
      [
        m.callbackButton('Maison', 'mnDummy'),
        m.callbackButton('Media', 'mnMedia'),
        m.callbackButton('Salon', 'mnSalon'),
        m.callbackButton('Studio', 'mnStudio'),
        m.callbackButton('Webcam', 'mnWebcam')
      ],    
      [
        m.callbackButton('Volets Bas', '/cmd volets.down'),
        m.callbackButton('Volets Haut', '/cmd volets.up')
      ],
      [
        m.callbackButton('Jardin On', 'Jardin On'),
        m.callbackButton('Jardin Off', 'Jardin Off')
      ],
      [
        m.callbackButton('Retour', 'mnDomo')
      ]    
    ])))  
})

bot.action('mnMedia', (ctx, next) => {  
  return ctx.editMessageText('<b>Menu Media</b>', Extra.HTML().markup((m) =>
    m.inlineKeyboard([
      [
        m.callbackButton('Maison', 'mnMaison'),
        m.callbackButton('Media', 'mnDummy'),
        m.callbackButton('Salon', 'mnSalon'),
        m.callbackButton('Studio', 'mnStudio'),
        m.callbackButton('Webcam', 'mnWebcam')
      ],        
      [
        m.callbackButton('@TV On', '/cmd tvon'),
        m.callbackButton('@TV Off', '/cmd tvoff')
      ],
      [
        m.callbackButton('Ampli On', '/cmd ampli.on'),
        m.callbackButton('Ampli Off', '/cmd ampli.off'),
        m.callbackButton('Ampli Mute', '/cmd ampli.mute'),        
      ],
      [
        m.callbackButton('HDMI 1', '/cmd hdmi.1'),
        m.callbackButton('HDMI 2', '/cmd hdmi.2'),        
        m.callbackButton('HDMI 3', '/cmd hdmi.3')
      ],
      [
        m.callbackButton('Retour', 'mnDomo')
      ]
    ])))  
})

bot.action('mnSalon', (ctx, next) => {  
  return ctx.editMessageText('<b>Menu Salon</b>', Extra.HTML().markup((m) =>
    m.inlineKeyboard([
      [
        m.callbackButton('Maison', 'mnMaison'),
        m.callbackButton('Media', 'mnMedia'),
        m.callbackButton('Salon', 'mnDummy'),
        m.callbackButton('Studio', 'mnStudio'),
        m.callbackButton('Webcam', 'mnWebcam')
      ],    
      [
        m.callbackButton('1 On', '/cmd salon.1.on'),
        m.callbackButton('1 Off', '/cmd salon.1.off')
      ],
      [
        m.callbackButton('2 On', '/cmd salon.2.on'),
        m.callbackButton('2 Off', '/cmd salon.2.off')
      ],
      [
        m.callbackButton('3 On', '/cmd salon.3.on'),
        m.callbackButton('3 Off', '/cmd salon.3.off')
      ],
      [
        m.callbackButton('4 On', '/cmd salon.4.on'),
        m.callbackButton('4 Off', '/cmd salon.4.off')
      ],
      [
        m.callbackButton('Retour', 'mnDomo')
      ]
    ])))  
})

bot.action('mnStudio', (ctx, next) => {  
  return ctx.editMessageText('<b>Menu Studio</b>', Extra.HTML().markup((m) =>
    m.inlineKeyboard([
      [
        m.callbackButton('Home', 'mnMaison'),
        m.callbackButton('Media', 'mnMedia'),
        m.callbackButton('Salon', 'mnSalon'),
        m.callbackButton('Studio', 'mnDummy'),
        m.callbackButton('Webcam', 'mnWebcam')
      ],        
      [
        m.callbackButton('1 On', '/cmd studio.1.on'),
        m.callbackButton('1 Off', '/cmd studio.1.off')
      ],
      [
        m.callbackButton('2 On', '/cmd studio.2.on'),
        m.callbackButton('2 Off', '/cmd studio.2.off')
      ],
      [
        m.callbackButton('3 On', '/cmd studio.3.on'),
        m.callbackButton('3 Off', '/cmd studio.3.off')
      ],
      [
        m.callbackButton('4 On', '/cmd studio.4.on'),
        m.callbackButton('4 Off', '/cmd studio.4.off')
      ],
      [
        m.callbackButton('Retour', 'mnDomo')
      ]
    ])))  
})

bot.command('webcam', (ctx) => {
  return ctx.replyWithPhoto(
    { url: "http://draffault.fr:8200/image.jpg?user=admin&password=tetris" }
  )
})

bot.action(/.+/, (ctx) => {
  var resp = ctx.match[0];
  if (resp.indexOf("mnDummy")>-1) {
    return ctx.answerCbQuery("")
  }
  if (resp.indexOf("/cmd ")>-1) {
    var cmd=resp.split(" ")[1];
    domoService.runCommand({"type":"cmdCommand","id":cmd});
    return ctx.answerCbQuery("Execution commande "+cmd+" ok")
  }
  return ctx.answerCbQuery(`Commande ${ctx.match[0]} inconnue`)
})

bot.startPolling();


module.exports = {
  init: init,
}