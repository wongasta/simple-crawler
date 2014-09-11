var Crawler = require("crawler").Crawler;
var fs = require('fs');

var outputFile = 'output.json';

var args = [];
var output = {};

process.argv.forEach(function (val, index, array) {
  args.push(val);
});

var siteName = args[2];
var keywords = args[3];

var c = new Crawler({
  "maxConnections":10,

  "callback":function(error,result,$) {

    fs.writeFile(outputFile, JSON.stringify(result), function(err) {
        if(err) {
          console.log(err);
        } else {
          console.log("JSON saved to " + outputFile);
        }
    });

  }
});


c.queue(siteName);
