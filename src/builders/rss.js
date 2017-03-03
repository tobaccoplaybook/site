var DEBUG   = 0;
var fs 		= require('fs');
var path 	= require('path');
var chalk 	= require('chalk');
var RSS 	= require('rss');
var moment 	= require('moment');


module.exports = function(config, content){
	content.languages.map( (lang) => {

		var opts = Object.assign({}, config.feedOptions.general, config.feedOptions[lang] );
		opts.feed_url = config.domain + lang +'/feed.xml';
		opts.site_url = config.domain + lang +'/index.html';
		
		if( DEBUG > 0 ){
			console.log('RSS opts', opts);
			//console.log('RSS doc meta', content['en'][0]);
		}

		var feed = new RSS(opts);

		content[lang].map( (doc) => {
			feed.item({
				title: doc.meta.title,
				guid: doc.meta.guid,
				date: doc.meta.documentDateISO,
				description: doc.meta.keymessage,
				url:  config.domain + lang +'/'+ doc.url,
			});
		});

		var xml = feed.xml({indent: true});
		var destination = path.normalize( config.buildDestination + lang + '/feed.xml' );
		var short_destination = path.join(lang, "feed.xml");
		console.log( chalk.yellow(' > writing'), chalk.green('RSS '), short_destination);
		fs.writeFileSync(destination, xml );
	});
}
