var Crawler = require("crawler").Crawler;
var fs = require('fs');

var outputFile = 'output.json';
var args = [];
var visitedURL = [];
var exFiles = ['.gif', '.jpg', '.jpeg', '.png', '.pdf', '.css', '.js', '.doc'];

var output = {
  crawled: [],
  excluded: [],
  contents: []
};

var allowedDomains = {
  'Test': ['http://yixinxia.com', 'http://acuherbxia.com'],
  'US': ['http://www.volusion.com', 'http://support.volusion.com/', 'http://experts.volusion.com/']
}

process.argv.forEach(function (val, index, array) {
  args.push(val);
});

var siteName = args[2];
var keywords = args[3];

var c = new Crawler({
  "maxConnections":10,

  "callback":function(error,result,$) {
    if(error){
      console.log(error);
    }else{

      console.log('Started: ' + result.request.href);

      $('body *:not(:has(*))').each(function(i, v) {
          if(v.innerHTML.toLowerCase().indexOf(keywords.toLowerCase()) > -1){

            var outputTemp = {
              'href': result.request.href,
              'content': v.innerHTML
            };

            output.contents.push(outputTemp);

            fs.writeFile(outputFile, JSON.stringify(output, null, 4), function(err) {
                if(err) {
                  console.log(err);
                } else {
                  console.log("JSON saved to " + outputFile);
                }
            });
          }
      });

      $("a").each(function(index,a) {

        var link = a.href;
        var linkDomain = link.substr(0, siteName.length);
        var relDir = link.substr(link.lastIndexOf('/')+1, link.length);
        var asset=false;

        $.each(exFiles, function(i, v){
          if(link.indexOf(v)>-1){
            asset=true;
          }
        });

        if((linkDomain === siteName) && (relDir.substr(0,1)!=='#') && (asset===false)){
          if(visitedURL.indexOf(a.href) === -1){
            visitedURL.push(a.href);
            console.log('Crawling: ' + a.href);
            output.crawled.push(a.href);
            c.queue(a.href);
          }
        }else{
          //output.excluded.push(a.href);
        }
      });

    }



  }
});


c.queue(siteName);
