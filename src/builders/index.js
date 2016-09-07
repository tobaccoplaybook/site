var DEBUG   = 0;
var fs 		= require('fs');
var path 	= require('path');
var chalk 	= require('chalk');
var moment 	= require('moment');
var mustache= require('mustache');
var md 		= require('markdown-it')();


module.exports = function(config, content){

	var header  = fs.readFileSync( __dirname + '/../partials/header.html').toString();
	var pagetop = fs.readFileSync( __dirname + '/../partials/pagetop.html').toString();
	var front   = fs.readFileSync( __dirname + '/../partials/front.html').toString();
	var footer  = fs.readFileSync( __dirname + '/../partials/footer.html').toString();

	content.languages.map( (lang) => {


		/// the Teaser is a little special
		var t = md.render( content.front[lang][0].body );
		t = t
			.replace(/<p>/g, '<p><span>')
			.replace(/<\/p>/g, '</span></p>');
		t += '<p><a href="introduction.html">'+ config.strings.read_more[ (lang === 'en') ? 0 : 1] +'...</a></p>';

		var docs = [];

		content[lang].map( (itm) => {
			docs.push( Object.assign({}, itm.meta, {url:itm.url}) );
		});
		if( DEBUG > 0 ) console.log('DOCS', docs );

		var extra = {
			title: 'Index',
			documentDateDisplay: '', //date of last update?',
			t_lang: (lang === 'en') ? 'Русский' : 'English',
			t_url:  (lang === 'en') ? '/ru/index.html' : '/en/index.html',
			coverImageHref: config.frontimage,
			teaser: t,
		}

		/// Prepare UI-Strings
		var strings = {};
		Object.keys(config.strings).map( (k) => {
			strings[k] = config.strings[k][ (lang === 'en') ? 0 : 1];
		});
		//console.log('strings', strings);


		var props = Object.assign({}, extra, {language:lang}, {docs:docs}, {aux:content.aux[lang]}, config, strings);
		
		var result = mustache.render(header, props);

		/// Set title for cover display
		//props.title = config.sitetitle[(lang === 'en') ? 0 : 1];
		props.title = "ex"+ content.locals[ lang ].title;

		result += mustache.render(pagetop, props)
			+ mustache.render(front,  props)
			+ mustache.render(footer, props);

		var destination = path.normalize( config.buildDestination + lang + '/index.html' );
		console.log( chalk.yellow(' > writing'), chalk.green('IDX'), destination);
		fs.writeFileSync(destination, result );

	});
}