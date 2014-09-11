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
    'US': ['http://www.volusion.com', 'http://volusion.com'],
    'UK': ['http://www.volusion.co.uk', 'http://volusion.co.uk'],
    'Mozu': ['http://www.mozu.com', 'http://mozu.com'],
    'Experts': ['http://experts.volusion.com/', 'http://www.experts.volusion.com/'],
    'Support': ['http://support.volusion.com/', 'http://www.support.volusion.com/'],
    'currentDomain': ''
};

var expectedKeywords = {
    'Test': ['Houston', 'Esheng'],
    'Billion': ['$15', '15 billion', '$14', '14 billion']
}

process.argv.forEach(function (val, index, array) {
    args.push(val);
});

var siteName = allowedDomains[args[2]];
var keywords = expectedKeywords[args[3]];

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
    },
    'alreadyMatch': function(url){
        if (visitedURL.indexOf(url) === -1) {
            return true;
        }else{
            return false;
        }
    },
    'keywordsMatch': function($, content){
        var temp = false;
        $.each(keywords, function(i,v){
            if (content.toLowerCase().indexOf(v.toLowerCase()) > -1) {
                temp = true;
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

            console.log('Crawling: ' + result.request.href);

            $('body *:not(:has(*))').each(function (i, v) {

                var keywordsCheck = reuse.keywordsMatch($, v.innerHTML);

                if(keywordsCheck){
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
                var alreadyCheck = reuse.alreadyMatch(link);

                if ((domainCheck) && (poundCheck) && (excCheck) && (alreadyCheck)) {
                    visitedURL.push(link);
                    console.log('Target: ' + link);
                    output.crawled.push(link);
                    c.queue(link);
                } else {
                    //output.excluded.push(a.href);
                }
            });

        }


    }
});

if((siteName) && (keywords) && (args[2] !== 'currentDomain')){
    c.queue(siteName);
}else{
    console.log('Arguments incorrect. Please redefine.')
}

