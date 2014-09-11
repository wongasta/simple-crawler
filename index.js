var Crawler = require("crawler").Crawler;
var fs = require('fs');

var outputFile = 'output.json';
var args = [];
var visitedURL = [];
var exFiles = ['.gif', '.jpg', '.jpeg', '.png', '.pdf', '.css', '.js', '.doc', '.docx'];

var output = {
    crawled: [],
    excluded: [],
    contents: []
};

var allowedDomains = {
    'Test': ['http://yixinxia.com', 'http://www.yixinxia.com', 'http://acuherbxia.com', 'http://www.acuherbxia.com'],
    'US': ['http://www.volusion.com', 'http://support.volusion.com/', 'http://experts.volusion.com/'],
    'currentDomain': ''
}

process.argv.forEach(function (val, index, array) {
    args.push(val);
});

var siteName = allowedDomains[args[2]];
var keywords = args[3];

var reuse = {
    'domainMatch': function ($,url) {
        var temp = false;
        $.each(siteName, function(i,v){
            if(url.indexOf(v) > -1){
                temp = true;
                return false;
            }
        });

        return temp;
    },
    'poundMatch': function (url) {
        var relDir = url.substr(url.lastIndexOf('/') + 1, url.length);
        if (relDir.substr(0, 1) !== '#') {
            return true;
        } else {
            return false;
        }
    },
    'excMatch': function ($, url) {
        var temp = true;
        var path = url.substr(allowedDomains.currentDomain.length, url.length);
        $.each(exFiles, function (i, v) {
            if (path.indexOf(v) > -1) {
                temp = false;
            }
        });
        return temp;
    }
};

var c = new Crawler({
    "maxConnections": 10,

    "callback": function (error, result, $) {
        if (error) {
            console.log(error);
        } else {

            console.log('Started: ' + result.request.href);

            $('body *:not(:has(*))').each(function (i, v) {
                if (v.innerHTML.toLowerCase().indexOf(keywords.toLowerCase()) > -1) {

                    var outputTemp = {
                        'href': result.request.href,
                        'content': v.innerHTML
                    };

                    output.contents.push(outputTemp);

                    fs.writeFile(outputFile, JSON.stringify(output, null, 4), function (err) {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log("JSON saved to " + outputFile);
                        }
                    });
                }
            });

            $("a").each(function (index, a) {

                var link = a.href;
                var domainCheck = reuse.domainMatch($, link);
                var poundCheck = reuse.poundMatch(link);
                var excCheck = reuse.excMatch($, link);

                if ((domainCheck) && (poundCheck) && (excCheck)) {
                    if (visitedURL.indexOf(a.href) === -1) {
                        visitedURL.push(a.href);
                        console.log('Crawling: ' + a.href);
                        output.crawled.push(a.href);
                        c.queue(a.href);
                    }
                } else {
                    //output.excluded.push(a.href);
                }
            });

        }


    }
});


c.queue(siteName);
