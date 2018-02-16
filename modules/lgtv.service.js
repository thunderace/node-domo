// mqtt
const MQTT_NODE_DOMO_LOG = 'home/domo/log/nodedomo';
var client;

var wol = require("node-wol");
var lgtv = require("lgtv2")({
//  url: 'ws://lgwebostv:3000'
  url: 'ws://192.168.0.42:3000'
});

function init(mqttClient) {
  client = mqttClient;
}

function logMqtt(msg) {  
  if (client) {
    client.publish(MQTT_NODE_DOMO_LOG, msg); 
  } else {
    console.log("ERROR: client is null");
  }
}

// LGTV ---------------------------------------------
// LGwebOSTV B4:E6:2A:38:31:46 192.168.0.42

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

lgtv.on('error', function (err) {
  console.log(err);
});

lgtv.on('connect', function () {
	var msg = 'LGTV connected';
  client.publish(MQTT_NODE_DOMO_LOG, msg);
  console.log(msg);
  
  lgtv.subscribe('ssap://audio/getVolume', function (err, res) {
      if (res.changed.indexOf('volume') !== -1) { 
        msg = 'volume changed '+ res.volume;
        client.publish(MQTT_NODE_DOMO_LOG, msg);
      }
      if (res.changed.indexOf('muted') !== -1) { 
        msg = 'mute changed '+ res.muted;
        client.publish(MQTT_NODE_DOMO_LOG, msg);
      }
  });
});

lgtv.on('close', function () {
	var msg = 'LGTV disconnected';
  client.publish(MQTT_NODE_DOMO_LOG, msg);
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
    } else if (cmd == "hdmi1") {
      lgtv.request('ssap://tv/switchInput', {inputId: "HDMI_1"});
    } else if (cmd == "hdmi2") {
      lgtv.request('ssap://tv/switchInput', {inputId: "HDMI_2"});
    } else if (cmd == "hdmi3") {
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

module.exports = {
  init: init,
  execCmdLgTv: execCmdLgTv,
}