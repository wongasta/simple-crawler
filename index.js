/*
/Simple Site Keyword Search Crawler
/Author: Yixin Xia
/Company: Volusion
/Date: 9-11-2014
/Version: Beta 1.0
/Desc: Crawls through listed of allowed domains, searching for specific keywords in body tags, then atomically writes to local JSON file.
*/

//Declare needed modules.
//crawler can be installed via npm install crawler
var Crawler = require("crawler").Crawler;
var fs = require('fs');

//Declare empty arrays
var args = [];
var visitedURL = [];

//Specify excluded files and output file dir here
var outputFile = 'output.json';
var exFiles = ['.gif', '.jpg', '.jpeg', '.png', '.pdf', '.css', '.js', '.doc', '.docx'];

//Declare empty output array that will be written to file
var output = {
    crawled: [],
    excluded: [],
    contents: []
};

//Array and key of various domain listings that will be crawled through - 3rd arg it takes in (node index.js US Billion - as example)
var allowedDomains = {
    'Test': ['http://yixinxia.com', 'http://www.yixinxia.com', 'http://acuherbxia.com', 'http://www.acuherbxia.com'],
    'US': ['http://www.volusion.com', 'http://volusion.com'],
    'UK': ['http://www.volusion.co.uk', 'http://volusion.co.uk'],
    'Mozu': ['http://www.mozu.com', 'http://mozu.com'],
    'Experts': ['http://experts.volusion.com/', 'http://www.experts.volusion.com/'],
    'Support': ['http://support.volusion.com/', 'http://www.support.volusion.com/'],
    'currentDomain': ''
};

//Array and key of various keywords listings that will be searched through - 3rd arg it takes in (node index.js US Billion - as example)
var expectedKeywords = {
    'Test': ['Houston', 'Esheng'],
    'Billion': ['$15', '15 billion', '$14', '14 billion']
}

//Push all the user input args into array and assign them to var
process.argv.forEach(function (val, index, array) {
    args.push(val);
});
var siteName = allowedDomains[args[2]];
var keywords = expectedKeywords[args[3]];

//Reusable functions goes here
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
    },
    'writeToFile': function(content){
        fs.writeFile(outputFile, JSON.stringify(content, null, 4), function (err) {
            if (err) {
                console.log(err);
            } else {
                //console.log("JSON saved to " + outputFile);
            }
        });
    }
};

//Define the crawler object
var c = new Crawler({
    "maxConnections": 10,

    //Massive spaghetti callback function
    "callback": function (error, result, $) {
        if (error) {
            console.log(error);
        } else {

            console.log('Crawling: ' + result.request.href);

            //Iterate through each DOM elements without children elements
            $('body *:not(:has(*))').each(function (i, v) {

                //Check to see if the DOM element contain keywords
                var keywordsCheck = reuse.keywordsMatch($, v.innerHTML);

                if(keywordsCheck){
                    //Create temp object to be pushed to output.json
                    var outputTemp = {
                        'href': result.request.href,
                        'content': v.innerHTML
                    };

                    output.contents.push(outputTemp);

                    //Upon every instance of searched keyword the crawler will write to output file via fs module
                    reuse.writeToFile(output);
                }

            });

            //Search through every anchor links and
            $("a").each(function (index, a) {

                var link = a.href;
                //See if the anchor link domain is allowed
                var domainCheck = reuse.domainMatch($, link);
                //See if the anchor link is not #
                var poundCheck = reuse.poundMatch(link);
                //See if the anchor does not links to exlcuded file types
                var excCheck = reuse.excMatch($, link);
                //See if the anchor is not already crawled
                var alreadyCheck = reuse.alreadyMatch(link);

                if ((domainCheck) && (poundCheck) && (excCheck) && (alreadyCheck)) {
                    //Push the
                    visitedURL.push(link);
                    console.log('Target: ' + link);
                    output.crawled.push(link);
                    //Upon every instance of crawled url the crawler will write to output file via fs module
                    reuse.writeToFile(output);
                    //Recursively crawl through approved links
                    c.queue(link);
                } else {
                    //Can push in list of excluded URL, can be very verbose though in output json file
                    //output.excluded.push(a.href);
                }
            });

        }


    }
});

//If user's arg are not found then it will return error
if((siteName) && (keywords) && (args[2] !== 'currentDomain')){
    //Kick off the crawling process
    c.queue(siteName);
}else{
    console.log('Arguments incorrect. Please redefine.')
}

