var DEBUG   = 0;
var fs 		= require('fs');
var path 	= require('path');
var chalk 	= require('chalk');
var moment 	= require('moment');
var mustache= require('mustache');

var md 		= require('markdown-it')();

var header	= fs.readFileSync( __dirname + '/../partials/header.html').toString();
var footer 	= fs.readFileSync( __dirname + '/../partials/footer.html').toString();
var tpl 	= fs.readFileSync( __dirname + '/../partials/aux.html').toString();

function lowercaseFirstLetter(string) {
    return string.charAt(0).toLowerCase() + string.slice(1);
}

module.exports = function(config, content){
	//console.log('AUX');
	//console.log('aux', content.aux);
	
	content.languages.map( (lang) => {
		content['aux'][lang].map( (itm) => {
		
			var props  = Object.assign({}, itm, config, {body:md.render(itm.body)}, {aux:content.aux[lang]});

			var result = mustache.render(header, props);
			result += mustache.render(tpl, props);
			result += mustache.render(footer, props);

			var destination = path.join(config.buildDestination, lang, itm.url);
			console.log( chalk.yellow(' > writing'), chalk.green('AUX'), destination);
			fs.writeFileSync(destination, result);
		});
	});
}