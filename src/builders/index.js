var DEBUG   = 0;
var fs 		= require('fs');
var path 	= require('path');
var chalk 	= require('chalk');
var moment 	= require('moment');
var mustache= require('mustache');


module.exports = function(config, content){

	var header  = fs.readFileSync( __dirname + '/../partials/header.html').toString();
	var pagetop = fs.readFileSync( __dirname + '/../partials/pagetop.html').toString();
	var front   = fs.readFileSync( __dirname + '/../partials/front.html').toString();
	var footer  = fs.readFileSync( __dirname + '/../partials/footer.html').toString();

	content.languages.map( (lang) => {

		var docs = [];

		content[lang].map( (itm) => {
			docs.push( Object.assign({}, itm.meta, {url:itm.url}) );
		});
		if( DEBUG > 0 ) console.log('DOCS', docs );

		var extra = {
			headline: config.sitename,
			documentDateDisplay: '{xxdate of last update}',
			t_lang: (lang === 'en') ? 'Русский' : 'English',
			t_url:  (lang === 'en') ? '/ru/index.html' : '/en/index.html',
			title: 'index',
			coverImageHref: config.frontimage
		}

		var props = Object.assign({}, extra, {language:lang}, {docs:docs}, {aux:content.aux[lang]}, config);
		
		var result = mustache.render(header, props)
		+ mustache.render(pagetop, props)
		+ mustache.render(front,  props)
		+ mustache.render(footer, props);

		var destination = path.normalize( config.buildDestination + lang + '/index.html' );
		console.log( chalk.yellow(' > writing'), chalk.green('IDX'), destination);
		fs.writeFileSync(destination, result );

	});
}