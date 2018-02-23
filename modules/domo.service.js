var fs = require('fs');
var http = require('http');
var unirest = require('unirest');
var exec = require('child_process').exec;

var configdomo = {};
var mapStatus = new Map();
var lastMessages = [];
var versionMsg;

var isLogEnabled = false;

const MQTT_NODE_DOMO_INV_CMD = 'home/domo/inventory/cmd';

const CMD_VERSION = "version";
const CMD_INVENTORY = "inventory";
const CMD_REBOOT = "reboot";

// mqtt
const MQTT_NODE_DOMO_LOG = 'home/domo/log/nodedomo';
var client;

function log(msg) {
  if (isLogEnabled) {
    console.log(msg);
  }
}

function init(configFileName, mqttClient, pVersionMsg, pIsLogEnabled) {
  isLogEnabled = pIsLogEnabled;
  configdomo = {};    
  client = mqttClient;
  versionMsg = pVersionMsg;
  initConfigDomo(configFileName);
  doInventory();
}

function logMqtt(msg) {  
  if (client) {
    client.publish(MQTT_NODE_DOMO_LOG, msg); 
  } else {
    console.log("ERROR: client is null");
  }
}

function initConfigDomo(configFileName) {
  loadConfigDomo(configFileName);
  
  fs.watchFile(configFileName, (curr, prev) => {
    loadConfigDomo(configFileName);
  });	
}

function loadConfigDomo(configFileName) {
  fs.readFile(configFileName, 'utf8', function (err, data) {
    if (err) {
      console.log(err);
    } else {
      var msg;
      try {
        configdomo = JSON.parse(data);
        msg = "Config loading from " + configFileName + " version " + configdomo.version;
      } catch (ex) {
        msg = "Error parsing config file from " + configFileName;
      }
      logMqtt(msg);
    }
  });
}

  
// Find a command by id
function findCommandInCategory(id, category) {
	if (category.commandCategories != undefined) {
		for (var ic = 0; ic < category.commandCategories.length; ic++) {
			var category1 = category.commandCategories[ic];
			var command = findCommandInCategory(id, category1);
			if (command != null) {
				return command;
			}
		}
	}
	if (category.commands != undefined) {
		for (var i = 0; i < category.commands.length; i++) {
			if (category.commands[i].id == id) {
					return category.commands[i];
			}
		}
	}
  return null;
}

function findCommand(id) {
	if (configdomo.commandCategories != undefined) {
		for (var ic = 0; ic < configdomo.commandCategories.length; ic++) {
			var category = configdomo.commandCategories[ic];
			var command = findCommandInCategory(id, category);
			if (command != null) {
				return command;
			}
		}
	}
  return null;
}

// Find an mqtt trigger with debounce
function findMqttTrigger(topic, payload) {
  var trigger = null;
  var t1 = Date.now();
  var i = payload.toString().indexOf(" FreeMem");
	if (i >= 0) { 
    payload = payload.substring(0, i);
  }

	if (configdomo && configdomo.triggers != undefined) {
		var payload1 = payload.replace(/\"/g, "'");
		for (var i = 0; i < configdomo.triggers.length; i++) {
			if ((topic == null || configdomo.triggers[i].topic == topic)) {
        if (configdomo.triggers[i].payload == "*" || 
          configdomo.triggers[i].payload == payload || 
          configdomo.triggers[i].payload == payload1) {
          trigger = configdomo.triggers[i];
			    console.log(">> trigger found: [" + trigger.command.id + "]");
          
          // Debounce. Attention ! debounce not working for trigger.payload = "*"
          if (lastMessages.length > 0) { // && trigger.debounce
            for (var j = 0;j < lastMessages.length && trigger; j++) {
              var lastMessage = lastMessages[j];
              if (lastMessage.message.topic == topic && lastMessage.message.payload == payload) {
                var t = t1 - lastMessage.date;
                if (trigger.debounce) {
                  if (t < trigger.debounce) {
                    console.log(">> debounce on: delta last cmd=" + t + "ms");
                    trigger = null;
                  } else { 
                    console.log(">> debounce off: delta last cmd=" + t + "ms");
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
  while (lastMessages.length > 30) {
    lastMessages.shift();
  }
  lastMessages.push({ "message": { "topic": topic, "payload": payload }, "date": t1 });
  return trigger;
}

// Statuses
function setStatus(id, value) {
	mapStatus.set(id, value); 
}

function getStatus(id) {
	var v = mapStatus.get(id);
  return v;
}

function toggleStatus(id) {
	var v = getStatus(id);
	if (v == undefined) { v = 0; }
  if (v == 1) { v = 0; } else { v = 1; }
  setStatus(id, v);
	return v;
}

function getMapStatus() { 
  return mapStatus;
}

// Commands
function runCommand(command, logMqtt = true) {
	try {
		if (command == undefined || command == null) { return; }
    
    if (logMqtt) { 
      client.publish(MQTT_NODE_DOMO_LOG, "Exec command: " + command.id); 
    }
    
    if (command.setStatus != undefined) {
      for (var i = 0; i < command.setStatus.length; i++) {
        var vSetStatus = command.setStatus[i];
        setStatus(vSetStatus.key, vSetStatus.value);
      }	         
    }
      
		if (command.type == "cmdCommand") {
			console.log("cmdCommand " + command.id);
			var configCommand = findCommand(command.id);
			if (configCommand != null) {
				runCommand(configCommand, false);
			} else {
        
        if (command.id == CMD_VERSION) {
          client.publish(MQTT_NODE_DOMO_LOG, versionMsg);
        }
        else if (command.id == CMD_INVENTORY) {
          doInventory();
        }
        else if (command.id == CMD_REBOOT) {
          client.publish(MQTT_NODE_DOMO_LOG, "domo-node-server rebooting...");
          exec('sudo pm2 restart /var/www/node-domo/server.js', (error, stdout, stderr) => {
            console.log(`${stdout}`);
            console.log(`${stderr}`);
            if (error !== null) {
                console.log(`exec error: ${error}`);
            }
          });
        }        
        else {
				  console.log("cmdCommand error: command not found");
        }
			}
		}
    
		if (command.type == "cmdComposite") {
			console.log("cmdComposite ");
			runCommands(command.commands);
			return;
		}
    
		if (command.type == "cmdMqtt") {
			console.log("cmdMqtt " + command.topic + " " + command.payload);
			client.publish(command.topic, command.payload);
      return;
		}
    
		if (command.type == "cmdWait") {
			console.log("cmdWait " + command.duration);
			var waitTill = new Date(new Date().getTime() + command.duration);
			while (waitTill > new Date()) {}
		}

		if (command.type == "cmdToggle") {
			console.log("cmdToggle " + command.id);
      var id = command.id;
      if (command.key != undefined) { id = command.key; }
			var v = toggleStatus(id);
			if (v) {
				runCommand(command.commandOn);
			} else {
				runCommand(command.commandOff);
			}
		}
	} catch (ex) {
		console.log("Exception (runCommand) " + ex);
	}
}

function runCommands(commands) {
	if (commands == undefined) { return; }
  for (var i = 0; i < commands.length; i++) {
		var command = commands[i];
		runCommand(command);
	}	
}


// Inventory
var mapDevices = new Map();

function setDevice(id, value) {
	mapDevices.set(id, value); 
  console.log(">> Device [" + id + "]=" + JSON.stringify(value));
}

function getDevice(id) {
	return mapDevices.get(id);
}

function getMapDevices() { 
  return mapDevices;
}

function saveInventory(inventory) {
//  console.log(">> saveInventory "+JSON.stringify(inventory)+" id="+inventory.id);
  if (inventory != undefined && inventory.id != undefined) {
    setDevice(inventory.id, inventory);
    if (inventory.wsUrl != undefined && inventory.invWS != undefined) {
      var wsInv = "http://" + inventory.wsUrl + inventory.invWS;
      if (wsInv.indexOf("://") == -1) {
        wsInv += "http://";
      }
      console.log(">> call inventory ws:" + wsInv);
      
      unirest.get(wsInv).end(function (response) {
        try {
          console.log(response.body);
          var inventory1 = JSON.parse(response.body);
          setDevice(inventory1.id, inventory1);
        }
        catch (ex) {
          console.log("Exception " + ex);
        }
      });
    }
  }
}

function doInventory() {
  mapDevices = new Map();
  client.publish(MQTT_NODE_DOMO_INV_CMD, "inventory");  
}

module.exports = {
  init: init,
  initConfigDomo: initConfigDomo,
  loadConfigDomo: loadConfigDomo,
  runCommand: runCommand,
  runCommands: runCommands,
  findMqttTrigger: findMqttTrigger,
  findCommand: findCommand,
  getMapStatus: getMapStatus,
  getMapDevices: getMapDevices,
  saveInventory: saveInventory,
}