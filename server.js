/*
pm2 start /var/www/node-domo/server.js
pm2 stop /var/www/node-domo/server.js
pm2 restart /var/www/node-domo/server.js
node /var/www/node-domo/server.js
*/

// test 2

"use strict";
var compression = require('compression');
var express = require("express"); 
var bodyParser = require("body-parser");
var app = express(); 
var fs = require('fs');
var moment = require('moment');
var http = require('http');
var ip = require("ip");
var wifiName = require('wifi-name');

var dbService = require('./modules/db.service.js');
var domoService = require('./modules/domo.service.js');
var telegramService = require('./modules/telegram.service.js');
var lgtvService = require('./modules/lgtv.service.js');

var serverId = "node-domo-server-" + new Date().getTime(); 
const VERSION = '23/02/2018 12:16';
var versionMsg = 'Serveur ' + serverId + ' ' + VERSION;
const CONFIG_FILENAME = "configNodejsDomo.json";

console.log(versionMsg);

var isLogEnabled = false;
var isMqttLogEnabled = false;


// MQTT ---------------------------------------------
// 82.66.49.29:1880/mqtt?topic=home/domo/nodedomo/cmd&payload=macro.test2
var mqtt = require('mqtt');

const MQTT_URL = 'http://82.66.49.29:1883';
const MQTT_DOMO = 'home/domo/';
const MQTT_NODE_DOMO = 'home/domo/nodedomo';
const MQTT_NODE_DOMO_CMD = 'home/domo/nodedomo/cmd';
const MQTT_NODE_DOMO_LOG = 'home/domo/log/nodedomo';
const MQTT_NODE_DOMO_TVLG = 'home/domo/nodedomo/tvlg';

const MQTT_NODE_DOMO_INV_CMD = 'home/domo/inventory/cmd';
const MQTT_NODE_DOMO_INV_RES = 'home/domo/inventory/res';

//var client = mqtt.connect(MQTT_URL, {clientId: 'NodejsDomoServer'});
var client = mqtt.connect(MQTT_URL);

var wifiSSID = "-";
wifiName().then(name => {
  wifiSSID = name;
});

client.on('connect', function () {
	console.log("Connected to mqtt server " + MQTT_URL);
  client.subscribe(MQTT_DOMO + '#');
  client.publish(MQTT_NODE_DOMO_LOG, 'Node domo server started ' + VERSION);
});
 
client.on('message', function (topic, message) {
	if (message.toString().lastIndexOf('wdmqtt') >= 0) { return; }
  if (isMqttLogEnabled) {
    console.log("MQTT " + topic.toString() + " " + message.toString());
  }
  
  // bdd log
  var query = "INSERT INTO `domo`.`mqtt` (`topic`,`payload`) VALUES ('" + topic.toString() + "', '" + message.toString() + "');";
  dbService.execDBQuery("domo", query, null, null);
	
	// cmd
	if (topic.toString().indexOf(MQTT_NODE_DOMO_CMD) >= 0) { 
		console.log("MQTT exec [" + message.toString() + "]");
		domoService.runCommand({ "type": "cmdCommand", "id": message.toString() });
		return;
	}
	if (topic.toString().indexOf(MQTT_NODE_DOMO_TVLG) >= 0) { 
		console.log("MQTT exec TVLG [" + message.toString() + "]");
		lgtvService.execCmdLgTv(message.toString());
		return;
	}
	// inventory
	if (topic.toString().indexOf(MQTT_NODE_DOMO_INV_CMD) >= 0) { 
		console.log("MQTT inventory cmd");
    var s = '{';
    s += '"id": "' + serverId + '", ';
    s += '"status": "OK", ';
    s += '"version": "' + VERSION + '", ';
    s += '"WIFI": "' + wifiSSID + '", ';
    s += '"IP": "' + ip.address() + '", ';
    s += '"mqttUrl": "' + MQTT_NODE_DOMO_CMD + '", ';
    s += '"commands": [';
    s += '{"type":"command", "label": "Version", "command": {"type":"cmdMqtt", "topic": "home/domo/nodedomo/cmd", "payload": "version"}},';
    s += '{"type":"command", "label": "Reboot", "command": {"type":"cmdMqtt", "topic": "home/domo/nodedomo/cmd", "payload": "reboot"}},';
    s += '{"type":"command", "label": "Inventaire", "command": {"type":"cmdMqtt", "topic": "home/domo/nodedomo/cmd", "payload": "inventory"}}';
    s += ']';
    s += '}';
    client.publish(MQTT_NODE_DOMO_INV_RES, s);
		return;
	}
	if (topic.toString().indexOf(MQTT_NODE_DOMO_INV_RES) >= 0) { 
//		console.log("MQTT inventory response: " + message.toString());
    domoService.saveInventory(JSON.parse(message.toString()));
		return;
	}
	
	// trigger
	var trigger = domoService.findMqttTrigger(topic.toString(), message.toString());
	if (trigger != null) {
		console.log("exec trigger " + message.toString());
		domoService.runCommand(trigger.command);
	}
});


// App ---------------------------------------------
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

// Site Web ----------------------------------------
// index.html
app.get("/", function (req, res) { 
  console.log("get('/'): index.html");
  res.sendFile(__dirname + "/app/index.html"); 
}); 
// Arborescence app
app.use("/", express.static(__dirname + "/app"));

// API ---------------------------------------------

//TODO nu ? /api/res ok
// api
app.use("/api", express.static(__dirname + "/api"));

// api cmd
// draffault.fr:8888/api/cmd?cmd=salon.1.on
// draffault.fr:8888/api/cmd?cmd=salon.1.off
app.get("/api/cmd", function(req, res, next) {
  try {
    var cmd = req.query.cmd;
    if (cmd == undefined) { 
      console.log("(api /api/cmd) Erreur: pas de parametre cmd");
    } else {
      console.log("(api /api/cmd) exec cmd" + cmd);
      domoService.runCommand({ "type": "cmdCommand", "id": cmd });
      res.send({ "result": "ok" });
    }
  }
  catch (ex) {
    console.log("(api /api/cmd) exception " + ex);
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
    var msg = "LGTV send cmd [" + cmd + "]";
    lgtvService.execCmdLgTv(cmd);
    console.log(msg);
    res.send({ content: msg });
	}
});

// api states
// draffault.fr:8888/api/statuses
app.get("/api/statuses", function(req, res, next) {
  var r = JSON.stringify([...domoService.getMapStatus().entries()]); 
  //client.publish(MQTT_NODE_DOMO_LOG, "Statuses:"+r);
  res.send(r);
});

// draffault.fr:8888/api/status?id=salon.1
// draffault.fr:8888/api/status?url=http://82.66.49.29:8182/donnees
app.get("/api/status", function(req, res, next) {
  try {
    var url = req.query.url;
    var id = req.query.id;
    if (url != undefined) { 
      var req1 = http.request({
        host: "draffault.fr",
        path: "/donnees",
        port: "8182"
      }, function(response) {
        console.log("(api /api/status) appel ok " + response);
        res.send("undefined");
      });
      req1.end();  
    } else if (id != undefined) {
      var s = "" + domoService.getStatus(id);
      console.log("(api /api/status) id=" + id + " status=" + s);
      res.send(s);
    } else {
        res.send("undefined");
    }
  }
  catch (ex) {
    console.log("(api /api/status) exception " + ex);
    res.send("exception");
  }
});

// configdomo
app.post("/api/configdomo", function(req, res) { 
  var data = req.body;
  var outputFilename = __dirname + "/api/res/configdomowww.json";
  fs.writeFile(outputFilename, JSON.stringify(data, null, 2), function(err) {
      if (err) {
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
  catch (ex) {
    console.log("(api /api/mqtt) exception " + ex);
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
  var datedebut = new Date();
  datedebut.setDate(datedebut.getDate() - duree / 24);
  var datedebuts = moment(datedebut).format("YYYY-MM-DD HH:mm");
  var condition = "WHERE time>='" + datedebuts + "' ORDER BY time DESC";
  console.log("Récupération données edf début=" + datedebuts + " durée=" + duree + "h");
  dbService.getBOFromDB("teleinfo", "teleinfo", "time, PAPP", req, res, condition);
}); 

// edf1
// 82.66.49.29:8888/api/edf1?duree=24&date=2017-11-23 10:28
app.get("/api/edf1", function(req, res) { 
  try {
    var duree = req.query.duree;
    var dateParam = req.query.date;
    var datedebut = new Date();
    
    if (dateParam != undefined) { 
      datedebut = new Date(dateParam);
      console.log("dateParam=" + dateParam + " datedebut=" + moment(datedebut).format("YYYY-MM-DD HH:mm"));
    } else {
      datedebut.setDate(datedebut.getDate() - duree / 24);
    }
    var datefin = new Date(datedebut);
    datefin.setDate(datedebut.getDate() + duree / 24);
    var datedebuts = moment(datedebut).format("YYYY-MM-DD HH:mm");
    var datefins = moment(datefin).format("YYYY-MM-DD HH:mm");
    
    console.log("Récupération données edf début=" + datedebuts + " fin=" + datefins + " durée=" + duree + "h");
    var condition = "WHERE time>='" + datedebuts + "' AND time<='" + datefins + "' ORDER BY time DESC";
    dbService.getBOFromDB("teleinfo", "teleinfo", "time, PAPP", req, res, condition);
  }
  catch (ex) {
    console.log("(api /api/edf1) exception " + ex);
    res.send("exception");
  }
}); 
    
// mesure
// http://82.66.49.29:8888/api/mesure?nom=home/domo/esp00/capteurs&duree=720
app.get("/api/mesure", function(req, res) { 
  var duree = req.query.duree;
  if (duree == undefined) { duree = 24; }
  var datedebut = new Date();
  datedebut.setDate(datedebut.getDate() - duree / 24);
  
  var datedebuts = moment(datedebut).format("YYYY-MM-DD HH:mm");
  var condition = "WHERE date>='" + datedebuts + "' ";
  var nom = req.query.nom;
  if (nom != undefined) { condition = condition + "AND nom LIKE '" + nom + "' ";}
  condition = condition + "ORDER BY date DESC";
  console.log("Récupération données edf début=" + datedebuts + " durée=" + duree + "h");
  dbService.getBOFromDB("domo", "mesure", "*", req, res, condition);
}); 

// api devices
// draffault.fr:8888/api/devices
app.get("/api/devices", function(req, res, next) {
  var arrDevices = [];
  var arrKeys = Array.from(domoService.getMapDevices().keys());
  arrKeys.sort();
  arrKeys.forEach(function(key) {
    arrDevices.push(domoService.getMapDevices().get(key));
  });
  res.send(JSON.stringify(arrDevices));
});

// App services
dbService.init(isLogEnabled);
domoService.init(__dirname + "/api/res/" + CONFIG_FILENAME, client, versionMsg, isLogEnabled);
telegramService.init(client, domoService);
lgtvService.init(client);

// Server start
app.listen(8888);
console.log("Serveur node-domo started on port 8888.");
