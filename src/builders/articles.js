var DEBUG   = 0;
var fs 		= require('fs');
var path 	= require('path');
var chalk 	= require('chalk');
var mustache= require('mustache');
var md 		= require('markdown-it')({linkify:true}).use(require('markdown-it-footnote'));


module.exports = function(config, content){
	
	var header	= fs.readFileSync( __dirname + '/../partials/header.html').toString();
	var pagetop = fs.readFileSync( __dirname + '/../partials/pagetop.html').toString();
	var footer 	= fs.readFileSync( __dirname + '/../partials/footer.html').toString();
	var article = fs.readFileSync( __dirname + '/../partials/article.html').toString();
	var pn_tpl 	= fs.readFileSync( __dirname + '/../partials/prevnext.html').toString();
	
	content.languages.map( (lang) => {	
		content[lang].map( (itm, idx) => {

			/// build prev-next navigation
			let pidx = idx > 0 ? idx-1 : content[lang].length-1;
			let nidx = idx < content[lang].length-1 ? idx+1 : 0;
			var prevnext = {
				p_url:   content[lang][pidx].url,
				p_title: content[lang][pidx].meta.title,
				n_url:   content[lang][nidx].url,
				n_title: content[lang][nidx].meta.title
			};

			/// article filenames are prefixed with a 3-digit number (010),
			/// that stays the same accross languages.
			/// check if there's a version of this doc available in the other language,
			/// if so, link to it, otherwise: link to the other-language' index.
			let doc_id = content[lang][idx].url.split('-')[0];
			let other_lang = (lang === 'en') ? 'ru' : 'en';
			let other_exists = content[other_lang].filter( (doc) => doc.url.split('-')[0] === doc_id);
			var translated = {
				t_url: (other_exists.length > 0) 
					? '/'+ other_lang +'/'+ other_exists[0].url
					: '/'+ other_lang +'/index.html',
				t_lang: (lang === 'en') ? "Русский" : 'English',
				t_urllang: other_lang,
				localizedDesc: 		config.feedOptions[lang].description,
				localizedKeywords: 	config.feedOptions[lang].categories,
			};

			/// Prepare UI-Strings
			var strings = {};
			Object.keys(config.strings).map( (k) => {
				strings[k] = config.strings[k][ (lang === 'en') ? 0 : 1];
			});
			//console.log('strings', strings);


			var props = Object.assign({}, itm.meta, translated, prevnext, {aux:content.aux[lang]}, config, strings);
			if( DEBUG > 0 ) console.log('props', props);

			/// begin with the page header
			var result = mustache.render(header, props);

			result += mustache.render(pagetop, props);
			
			/// render the prev- next navigation
			var pn_parsed = mustache.render(pn_tpl, props);

			/// convert the itm md to html
			var body = md.render(itm.text);

			/// (re)move first h1 from the article text to props, so we can display it on the cover
			props.headline = body.split("\n").slice(0,1)[0].replace('<h1>', '').replace('</h1>','');
			props.body = body.split("\n").slice(1).join("\n"); // ?

			/// inject prev- next navigation at the top of the article
			props.body = pn_parsed + props.body;

			/// render the page template
			var page = mustache.render(article, props);

			/// inject prev- next navigation before the footnotes section
			var parts = page.split('<hr class="footnotes-sep">');
			page = parts[0]+
				'<hr class="footnotes-sep">'+
				pn_parsed+
				'<hr class="footnotes-sep" style="margin-top: 2rem;">'+
				parts[1];

			/// add to output
			result += page;
			
			/// add footer
			result += mustache.render(footer, props);

			var destination = path.join(config.buildDestination, itm.meta.language, itm.url);
			//var destination = path.join(config.buildDestination, itm.meta.language, itm.meta.slug +'.html');

			console.log( chalk.yellow(' > writing'), chalk.green('ARG'), destination);
			fs.writeFileSync(destination, result);
		});
	});
}
