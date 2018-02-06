/*
pm2 start /var/www/node-domo/server.js
pm2 stop /var/www/node-domo/server.js
pm2 restart /var/www/node-domo/server.js
node /var/www/node-domo/server.js
*/

"use strict";
const VERSION = '29/01/2018 16:20'
const VERSION_MSG = 'Serveur node-domo version '+VERSION
console.log(VERSION_MSG);

var compression = require('compression');
var express = require("express"); 
var bodyParser = require("body-parser");
var app = express(); 
var fs = require('fs');
//var mysql = require('mysql');
var moment = require('moment');
var http = require('http');


//TODO CONST
var configNodejsDomo = "configNodejsDomo.json"

var dbService = require('./modules/db.service.js');
var domoService = require('./modules/domo.service.js');
var telegramService = require('./modules/telegram.service.js');

// Init ---------------------------------------------
app.use(compression()); 
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.set('json spaces', 0);

// Access-Control-Allow-Origin
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});


/*
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

*/
/*
// Commands ---------------------------------------------
var configdomo = {};

function loadConfigDomo(configFileName) {
  fs.readFile(configFileName, 'utf8', function (err, data) {
		if (err) {
			console.log(err);
		} else {
			console.log(msg);
			try {
			  configdomo = JSON.parse(data);
  			var msg = "Config loading from " + configFileName+" version "+configdomo.version;
  			client.publish(MQTT_NODEDOMOLOG, msg);
			} catch(ex) {
				msg = "Error parsing config file from " + configFileName;
				client.publish(MQTT_NODEDOMOLOG, msg);
				console.log(msg+ex.toString());
			}
		}
  });
}

function initConfigDomo() {
  var configFileName = __dirname + "/api/res/" + configNodejsDomo;
	loadConfigDomo(configFileName);
	fs.watchFile(configFileName, (curr, prev) => {
		loadConfigDomo(configFileName);
  });	
}

initConfigDomo();

// Find a command by id
function findCommandInCategory(id, category) {
	if (category.commandCategories != undefined) {
		for(var ic=0; ic<category.commandCategories.length; ic++) {
			var category1 = category.commandCategories[ic];
			var command = findCommandInCategory(id, category1);
			if (command != null) {
				return command;
			}
		}
	}
	if (category.commands != undefined) {
		for(var i=0; i<category.commands.length; i++) {
			if (category.commands[i].id == id) {
					return category.commands[i];
			}
		}
	}
  return null;
}

function findCommand(id) {
	if (configdomo.commandCategories != undefined) {
		for(var ic=0; ic<configdomo.commandCategories.length; ic++) {
			var category = configdomo.commandCategories[ic];
			var command = findCommandInCategory(id, category);
			if (command != null) {
				return command;
			}
		}
	}
  return null;
}

var lastMessages = [];

// Find a trigger mqtt
function findTriggerMqtt(topic, payload) {
  var trigger = null;
  var t1 = Date.now();
  var i = payload.toString().indexOf(" FreeMem");
	if (i>=0) { 
    payload = payload.substring(0, i);
  }

	if (configdomo && configdomo.triggers != undefined) {
		var payload1 = payload.replace(/\"/g, "'");
		for(var i=0; i<configdomo.triggers.length; i++) {
			if ((topic == null || configdomo.triggers[i].topic == topic)) {
        if (configdomo.triggers[i].payload == "*" || configdomo.triggers[i].payload == payload || configdomo.triggers[i].payload == payload1) {
          trigger = configdomo.triggers[i];
			    console.log(">> trigger found: ["+trigger.command.id+"]");
          
          // Debounce. Attention ! debounce not working for trigger.payload = "*"
          if (lastMessages.length>0) { // && trigger.debounce
            for(var j=0;j<lastMessages.length && trigger;j++) {
              var lastMessage = lastMessages[j];
              if (lastMessage.message.topic == topic && lastMessage.message.payload == payload) {
                var t = t1-lastMessage.date;
                if (trigger.debounce) {
                  if (t<trigger.debounce) {
                    console.log(">> debounce on: delta last cmd="+t+"ms");
                    trigger = null;
                  } else { 
                    console.log(">> debounce off: delta last cmd="+t+"ms");
                  }    
                } else { 
                  console.log(">> no trigger debounce");
                }                
              }
            }
          }
				}
			}
		}
	}
  // clean lastMessages and add lastMessage
  while (lastMessages.length>30) {
    lastMessages.shift();
  }
  lastMessages.push({ "message": { "topic": topic, "payload": payload }, "date": t1 });
  return trigger;
}

var mapStatus = new Map();

function setStatus(id, value) {
	mapStatus.set(id, value); 
  var msg = "setStatus "+id+"="+value;
}

function getStatus(id) {
	var v = mapStatus.get(id);
  return v;
}

function toggleStatus(id) {
	var v = getStatus(id);
	if (v == undefined) { v=0; }
  if (v == 1) { v=0; } else { v=1; }
  setStatus(id, v);
	return v;
}

// Command execution
function runCommand(command, logMqtt=true) {
	try {
		if (command == null) { return; }
    if (logMqtt) { 
      client.publish(MQTT_NODEDOMOLOG, "Exec command: "+command.id); 
    }
    
    if (command.setStatus!=undefined) {
      for(var i=0; i<command.setStatus.length; i++) {
        var vSetStatus = command.setStatus[i];
        setStatus(vSetStatus.key, vSetStatus.value);
      }	         
    }
      
		if (command.type == "cmdCommand") {
			console.log("cmdCommand "+command.id);
			var macro = findCommand(command.id);
			if (macro != null) {
				runCommand(macro, false);
			} else {
				console.log("cmdCommand error: macro not found");
			}
		}
    
		if (command.type == "cmdComposite") {
			console.log("cmdComposite ");
			runCommands(command.commands);
			return;
		}
    
		if (command.type == "cmdMqtt") {
			console.log("cmdMqtt "+command.topic+" "+command.payload);
			client.publish(command.topic, command.payload);
      return;
		}
    
		if (command.type == "cmdWait") {
			console.log("cmdWait "+command.duration);
			var waitTill = new Date(new Date().getTime() + command.duration);
			while(waitTill > new Date()){}
		}

		if (command.type == "cmdToggle") {
			console.log("cmdToggle "+command.id);
      var id = command.id;
      if (command.key!=undefined) { id = command.key; }
			var v = toggleStatus(id);
			if (v) {
				runCommand(command.commandOn);
			} else {
				runCommand(command.commandOff);
			}
		}
	} catch(ex) {
		console.log("Exception (runCommand) "+ex);
	}
}

// Commands execution
function runCommands(commands) {
	if (commands == undefined) { return; }
  for(var i=0; i<commands.length; i++) {
		var command = commands[i];
		runCommand(command);
	}	
}
*/

// MQTT ---------------------------------------------
// 82.66.49.29:1880/mqtt?topic=home/domo/nodedomo/cmd&payload=macro.test2
var mqtt = require('mqtt');
const MQTT_URL = 'http://82.66.49.29:1883';
const MQTT_DOMO = 'home/domo/'
const MQTT_NODEDOMO = 'home/domo/nodedomo'
const MQTT_NODEDOMOCMD = 'home/domo/nodedomo/cmd'
const MQTT_NODEDOMOLOG = 'home/domo/log/nodedomo'
const MQTT_NODEDOMOTVLG = 'home/domo/nodedomo/tvlg'

//var client = mqtt.connect(MQTT_URL, {clientId: 'NodejsDomoServer'});
var client = mqtt.connect(MQTT_URL);

domoService.init(__dirname + "/api/res/" + configNodejsDomo, client);
telegramService.init(client, domoService);


client.on('connect', function () {
	console.log("Connected to mqtt server "+MQTT_URL);
  client.subscribe(MQTT_DOMO+'#');
  client.publish(MQTT_NODEDOMOLOG, 'Node domo server started '+VERSION);
});
 
client.on('message', function (topic, message) {
	if (message.toString().lastIndexOf('wdmqtt')>=0) { return; }
  console.log("MQTT "+topic.toString() + " "+ message.toString());
	
	// cmd
	if (topic.toString().indexOf(MQTT_NODEDOMOCMD)>=0) { 
		console.log("MQTT exec [" + message.toString()+"]");
		domoService.runCommand({"type":"cmdCommand","id":message.toString()});
		return;
	}
	if (topic.toString().indexOf(MQTT_NODEDOMOTVLG)>=0) { 
		console.log("MQTT exec TVLG [" + message.toString()+"]");
		execCmdLgTv(message.toString());
		return;
	}
	
	// trigger
	var trigger = domoService.findTriggerMqtt(topic.toString(), message.toString());
	if (trigger != null) {
		console.log("exec trigger " + message.toString());
		domoService.runCommand(trigger.command);
	}
});


// LGTV ---------------------------------------------
// LGwebOSTV B4:E6:2A:38:31:46 192.168.0.42

var wol = require("node-wol");
function wolLgTv() {
  console.log("WOL LG TV");
  wol.wake("B4:E6:2A:38:31:46", function(error) {
    if (error) {
      console.log("WOL LG TV error:"+error);
      return;
    }
  });
}
//var magicPacket = wol.createMagicPacket("B4:E6:2A:38:31:46");

var lgtv = require("lgtv2")({
//  url: 'ws://lgwebostv:3000'
  url: 'ws://192.168.0.42:3000'
});

lgtv.on('error', function (err) {
  console.log(err);
});

lgtv.on('connect', function () {
	var msg = 'LGTV connected';
  client.publish(MQTT_NODEDOMOLOG, msg);
  console.log(msg);
  
  lgtv.subscribe('ssap://audio/getVolume', function (err, res) {
      if (res.changed.indexOf('volume') !== -1) { 
        msg = 'volume changed '+ res.volume;
        client.publish(MQTT_NODEDOMOLOG, msg);
      }
      if (res.changed.indexOf('muted') !== -1) { 
        msg = 'mute changed '+ res.muted;
        client.publish(MQTT_NODEDOMOLOG, msg);
      }
  });
});

lgtv.on('close', function () {
	var msg = 'LGTV disconnected';
  client.publish(MQTT_NODEDOMOLOG, msg);
  console.log(msg);
});

// cmd ex: 
// system/turnOff, audio/volumeUp, audio/volumeDown, 
// lgtv.request('ssap://audio/setMute', {mute: true});
// tv/switchInput
// com.webos.service.tv.display/set3DOn / Off
// lgtv.request('ssap://system.launcher/launch', {id: 'netflix'});
// system.launcher/close
// lgtv.request('ssap://system.notifications/createToast', {message: 'Hello World!'});
// "ssap://system.launcher/open", {target: url}
// "ssap://tv/getChannelList"
// "ssap://tv/getCurrentChannel"
// "ssap://tv/openChannel", {channelId: channel} (such as eg 0_13_7_0_0_1307_0)
// "ssap://tv/getExternalInputList"
// <--- received: {"type":"response","id":"input_1","payload": {"devices":[{"id":"SCART_1","label":"AV1","port":1,"appId":"com.webos.app.externalinput.scart","icon":"http://lgsmarttv.lan:3000/resources/f84946f3119c23cda549bdcf6ad02a89c73f7682/scart.png","modified":false,"autoav":false,"currentTVStatus":"","subList":[],"subCount":0,"connected":false,"favorite":false},{...}, {...}],"returnValue":true}}
// "ssap://tv/switchInput", {inputId: input}
function execCmdLgTv(cmd) {
 	try {
    if (cmd == "system/turnOn") {
      wolLgTv();
    } else if (cmd == "volume0" || cmd == "vol0") {
      lgtv.request('ssap://audio/setVolume', {volume: 0});
    } else if (cmd == "mute.on") {
      lgtv.request('ssap://audio/setMute', {mute: true});
    } else if (cmd == "mute.off") {
      lgtv.request('ssap://audio/setMute', {mute: false});
    } else if (cmd == "input.hdmi1") {
      lgtv.request('ssap://tv/switchInput', {inputId: "HDMI_1"});
    } else if (cmd == "input.hdmi2") {
      lgtv.request('ssap://tv/switchInput', {inputId: "HDMI_2"});
    } else if (cmd == "input.hdmi3") {
      lgtv.request('ssap://tv/switchInput', {inputId: "HDMI_3"});
    } else {
      // 'ssap://system/turnOff'
      lgtv.request('ssap://'+cmd, function (err) {
        console.log("LGTV error "+err);
      });
    }
	} catch(ex) {
		console.log("LGTV exception "+ex);
	} 
}

function sendCmdLgTv(cmd, res) {
  var msg = "LGTV send cmd ["+cmd+"]";
  execCmdLgTv(cmd);
	console.log(msg);
  res.send({content:msg});
}



// api
app.use("/api", express.static(__dirname + "/api"));
// Arborescence app
app.use("/", express.static(__dirname + "/app"));

// Site Web ----------------------------------------
// index.html
app.get("/", function (req, res) { 
  console.log("get('/'): index.html");
  res.sendFile(__dirname + "/app/index.html"); 
}); 

// API ---------------------------------------------

// api commandes
// draffault.fr:8888/api/cmd?cmd=salon.1.on
// draffault.fr:8888/api/cmd?cmd=salon.1.off
app.get("/api/cmd", function(req, res, next) {
  try {
    var cmd = req.query.cmd;
    if (cmd == undefined) { 
      console.log("(api /api/cmd) Erreur: pas de parametre cmd");
    } else {
      console.log("(api /api/cmd) exec cmd"+cmd);
      domoService.runCommand({"type":"cmdCommand","id":cmd});
      res.send({"result":"ok"});
    }
  }
  catch(ex) {
    console.log("(api /api/cmd) exception "+ex);
    res.send("exception");
  }
});

// api lgtv
// draffault.fr:8888/api/lgtv?cmd=system/turnOn
// draffault.fr:8888/api/lgtv?cmd=system/turnOff
app.get("/api/lgtv", function(req, res, next) {
	var cmd = req.query.cmd;
  if (cmd == undefined) { 
	  console.log("(api /api/lgtv) Erreur: pas de parametre cmd");
	} else {
		sendCmdLgTv(cmd, res);
	}
});

// api states
// draffault.fr:8888/api/statuses
app.get("/api/statuses", function(req, res, next) {
  var r = JSON.stringify([...domoService.getMapStatus().entries()]); 
  //client.publish(MQTT_NODEDOMOLOG, "Statuses:"+r);
  res.send(r);
});

// draffault.fr:8888/api/status?id=salon.1
// draffault.fr:8888/api/status?url=http://82.66.49.29:8182/donnees
app.get("/api/status", function(req, res, next) {
  try {
    var url = req.query.url;
    var id = req.query.id;
    if (url != undefined) { 
      //console.log("(api /api/status) appel "+url);
      var req = http.request({
        host: "draffault.fr",
        path: "/donnees",
        port: "8182"
      }, function(response) {
        console.log("(api /api/status) appel ok "+response);
//        res.send({"status":"undefined"}); //TODO response);
        res.send("undefined");
      });
      req.end();  
    } else if (id != undefined) {
      var s=""+getStatus(id);
      console.log("(api /api/status) id="+id+" status="+s);
//      res.send({"status":getStatus(id)});
      res.send(s);
    } else {
//      res.send({"status":"undefined"});
        res.send("undefined");
    }
  }
  catch(ex) {
    console.log("(api /api/status) exception "+ex);
    res.send("exception");
  }
});

// configdomo
app.post("/api/configdomo", function(req,res) { 
  var data = req.body;
  var outputFilename = __dirname + "/api/res/configdomowww.json";
  fs.writeFile(outputFilename, JSON.stringify(data, null, 2), function(err) {
      if(err) {
        console.log(err);
      } else {
        console.log("JSON saved to " + outputFilename);
      }
  });  
  res.send(); 
}); 

// post mqtt
app.post("/api/mqtt", function(req, res) { 
  try {
    var topic = req.query.topic;
    var payload = req.query.payload;
    
    if (topic != undefined && payload != undefined) {
      client.publish(topic, payload);
      res.send("ok");
    }
    else {
      res.send("topic or payload parameters missing");
    }
  }
  catch(ex) {
    console.log("(api /api/mqtt) exception "+ex);
    res.send("exception");
  }
}); 

// mqtts
app.get("/api/mqtts", function(req, res) { 
  dbService.getBOFromDB("domo", "mqtt", "*", req, res, "ORDER BY date DESC LIMIT 200");
}); 

// edf
app.get("/api/edf/:duree", function(req, res) { 
  var duree = req.params.duree;
  var t1 = new Date();
  var datedebut = new Date();
  datedebut.setDate(datedebut.getDate()-duree/24);
  var datedebuts = moment(datedebut).format("YYYY-MM-DD HH:mm");
  var condition = "WHERE time>='"+datedebuts+"' ORDER BY time DESC";
  console.log("RÃ©cupÃ©ration donnÃ©es edf dÃ©but="+datedebuts+" durÃ©e="+duree+"h");
  dbService.getBOFromDB("teleinfo", "teleinfo", "time, PAPP", req, res, condition);
}); 


// 82.66.49.29:8888/api/edf1?duree=24&date=2017-11-23 10:28
app.get("/api/edf1", function(req, res) { 
  try {
    var duree = req.query.duree;
    var dateParam = req.query.date;
//    var t1 = new Date();
    var datedebut = new Date();
    
    if (dateParam != undefined) { 
      datedebut = new Date(dateParam);
      console.log("dateParam="+dateParam+" datedebut="+moment(datedebut).format("YYYY-MM-DD HH:mm"));
    } else {
      datedebut.setDate(datedebut.getDate()-duree/24);
    }
    var datefin = new Date(datedebut);
    datefin.setDate(datedebut.getDate()+duree/24);
    var datedebuts = moment(datedebut).format("YYYY-MM-DD HH:mm");
    var datefins = moment(datefin).format("YYYY-MM-DD HH:mm");
    
    console.log("RÃ©cupÃ©ration donnÃ©es edf dÃ©but="+datedebuts+" fin="+datefins+" durÃ©e="+duree+"h");
    var condition = "WHERE time>='"+datedebuts+"' AND time<='"+datefins+"' ORDER BY time DESC";
    dbService.getBOFromDB("teleinfo", "teleinfo", "time, PAPP", req, res, condition);
  }
  catch(ex) {
    console.log("(api /api/edf1) exception "+ex);
    res.send("exception");
  }
}); 

    
// Mesures
// http://82.66.49.29:8888/api/mesure?nom=home/domo/esp00/capteurs&duree=720
app.get("/api/mesure", function(req, res) { 
  var duree = req.query.duree;
  if (duree == undefined) { duree= 24; }
//  var t1 = new Date();
  var datedebut = new Date();
  datedebut.setDate(datedebut.getDate()-duree/24);
  var datedebuts = moment(datedebut).format("YYYY-MM-DD HH:mm");
  var condition = "WHERE date>='"+datedebuts+"' ";
  var nom = req.query.nom;
  if (nom != undefined) { condition = condition + "AND nom LIKE '"+nom+"' ";}
  condition = condition + "ORDER BY date DESC";
  console.log("RÃ©cupÃ©ration donnÃ©es edf dÃ©but="+datedebuts+" durÃ©e="+duree+"h");
  dbService.getBOFromDB("domo", "mesure", "*", req, res, condition);
}); 

app.listen(8888);
console.log("Serveur node-domo started on port 8888.");
