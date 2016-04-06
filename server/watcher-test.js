var settings = require('../package.json');
var Watcher = require('./watcher');

var watcher = new Watcher();

watcher.on('ready', function(data) {
  console.log("🖥 👀 👍");
});
watcher.on('scored', function(data) {
  console.log(data);
});

watcher.init();
