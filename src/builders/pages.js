var DEBUG   = 0;
var fs 		= require('fs');
var path 	= require('path');
var chalk 	= require('chalk');
var moment 	= require('moment');
var mustache= require('mustache');

var md 		= require('markdown-it')();


function lowercaseFirstLetter(string) {
    return string.charAt(0).toLowerCase() + string.slice(1);
}

module.exports = function(config, content){

	var header	= fs.readFileSync( __dirname + '/../partials/header.html').toString();
	var pagetop = fs.readFileSync( __dirname + '/../partials/pagetop.html').toString();
	var footer 	= fs.readFileSync( __dirname + '/../partials/footer.html').toString();
	var tpl 	= fs.readFileSync( __dirname + '/../partials/pages.html').toString();
	//console.log('pages', content.pages);

	content.languages.map( (lang) => {
		content['pages'][lang].map( (itm) => {

			var extra = {
				t_lang: (lang === 'en') ? 'Русский' : 'English',
				t_url:  (lang === 'en') ? '/ru/'+itm.url : '/en/'+itm.url,
				localizedDesc: 		config.feedOptions[lang].description,
				localizedKeywords: 	config.feedOptions[lang].categories,
			}

			/// Prepare UI-Strings
			var strings = {};
			Object.keys(config.strings).map( (k) => {
				strings[k] = config.strings[k][ (lang === 'en') ? 0 : 1];
			});
			//console.log('strings', strings);

			var props  = Object.assign({}, itm, config, {body:md.render(itm.body)}, {pages:content.pages[lang]}, extra, strings);

			/// switch title and documentDateDisplay so
			props.title = props.documentDateDisplay;
			props.documentDateDisplay = itm.title;

			var result = mustache.render(header, props);
			result += mustache.render(pagetop, props);
			result += mustache.render(tpl, props);
			result += mustache.render(footer, props);

			var destination = path.join(config.buildDestination, lang, itm.url);
			var short_destination = path.join(lang, itm.url);
			console.log( chalk.yellow(' > writing'), chalk.green('PAGE'), short_destination);
			fs.writeFileSync(destination, result);
		});
	});
}
