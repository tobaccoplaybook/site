
var fs 		= require('fs');
var util	= require('util');
var path 	= require('path');
var glob 	= require('glob');
var chalk 	= require('chalk');
var moment 	= require('moment');
var rmrf  	= require('rmrf');
var pack 	= require('../package.json');

var config  = {};
var configured = false;

// content builder
var content_builder 	= require('./content_builder');

// page builders
var builders = [
	require('./builders/articles'),
	require('./builders/index'),
	require('./builders/rss'),
	require('./builders/pages'),
];

module.exports.configure = function( conf ){
	config = conf;
	configured = true;
}

module.exports.run = function(cb){
	if( !configured ){
		console.log( chalk.red('Buildsystem not configured, exiting') );
		return;
	}

	/// shorthand
	var SRC = config.contentSource;
	var OUT = config.buildDestination;

	/// start timer
	var hrstart = process.hrtime();
	
	/// get top-level directories in $SRC directory (languages)
	var lang = fs.readdirSync(SRC).filter(function(itm) {
		if( itm == '.git' ){
			return false;
		}else{
    		return fs.statSync(path.join(SRC, itm)).isDirectory();
    	}
  	});

	/// create structure to hold all data
	var content = {'languages':lang};

	/// populate
	lang.map( (language) => {
		
		if( !fs.existsSync(OUT+language) ){
			// make sure the out-directory exists
			fs.mkdirSync(OUT+language);
		}else{
			// make sure the out-directory is empty
			rmrf(OUT+language);
			fs.mkdirSync(OUT+language);
		}

		/// arguments
		console.log('');
		console.log( chalk.yellow('Parsing "'+ language +'" arguments:') );
		glob.sync( SRC + language + "/arguments/*.md", {} ).map( function(filename){
			var doc = content_builder.article(filename, language, config);
			if( doc !== false ){
				content[language] = content[language] || [];
				content[language].push( doc );
			}
		});

		/// generic pages
		['pages', 'front'].map( (section) => {
			content[section] 			= content[section] || [];
			content[section][language] 	= content[section][language] || [];
			glob.sync( SRC + language + "/"+ section +"/*.md", {} ).map( function(filename){
				var doc = content_builder.generic(filename, language, config );
				if( doc !== false ){			
					content[section][language].push( doc );
				}
			});
		});

		/// local config (index.md)
		var localConfig = content_builder.generic(SRC + language + "/index.md", language, config );
		delete localConfig.url; delete localConfig.guid; delete localConfig.body;
		content.locals = content.locals || {};
		content.locals[language] = localConfig;

		config.package_version = pack.version;


		// Tags
		let global_tags = [];
		let global_tags_stats = {};
		let global_tags_found = [];

		content[language].map( (doc) => {
			if( doc.meta.tags){
				doc.meta.tags.map( (tag) => {
				
					//console.log('TAGLOOP', tag);	
					
					if( !global_tags_stats[ tag["lcname"] ] ){
						global_tags_stats[ tag["lcname"] ] = Object.assign({}, tag, {count:1});
					}
					
					if( global_tags_found.indexOf( tag["lcname"] ) < 0 ){
						global_tags_found.push( tag["lcname"] );
						global_tags.push(tag);
					}else{
						global_tags_stats[ tag["lcname"] ].count ++;
					}
				});
			}
		});
		content.tags_global = content.tags_global || {};
		content.tags_global[language] = global_tags;

		content.tags_shorlist = content.tags_shorlist || {};
		content.tags_shorlist[language] = Object.keys(global_tags_stats)
			.filter( (t) => global_tags_stats[t].count > 1 )
			.map( (t) => global_tags_stats[t] );
	

		// Related
		// Find arguments with similar tags
		console.time('related');
		content[language].map( (doc) => {
			//console.log('finding related docs for doc', doc.meta.argumentId);
			let myTags = doc.meta.tags;
			let related = [];
			let related_found = [];
			content[language].map( (otherDoc) => {
				if( otherDoc.meta.argumentId != doc.meta.argumentId ){
					let otherTags = otherDoc.meta.tags;
					myTags.forEach( (t) => {
						otherTags.forEach( (ot) => {
							if( ot.lcname === t.lcname ){
								if( related_found.indexOf(otherDoc.meta.argumentId) < 0 ){
									related_found.push(otherDoc.meta.argumentId);
								
									related.push({
										img: otherDoc.meta.coverImageHref,
										//short: otherDoc.meta.short,
										short: otherDoc.meta.title,
										link: otherDoc.url
									});
								}
							}
						});
					});
				}
			});
			//console.log('> related', related);
			doc.related = related;
			doc.has_related = related.length > 0;
			/*
			doc.related = [
				{img:"../lib/dummy.jpg", short:"[SHORT] arge pictorial pack warnings"}
			];
			*/
		});
		console.timeEnd('related');

	});
	//console.log('content.tags_global', content.tags_global);
	//console.log('content.tags_shorlist', content.tags_shorlist);

	//console.log('content[language][0]', content['en'][0]);

	
	/// Build site
	console.log('');
	console.log( chalk.yellow('Rebuilding site:') );
	builders.map( (fn) => fn(config, content) );

	// stop timer
	var hrend = process.hrtime(hrstart);
	var lapse = hrend[0]+'s '+(hrend[1]/1000000)+'ms';
	console.log( chalk.green('Done'), lapse, 'at', moment().format('YYMMDD hh:mm:ss') );

	if( cb ) cb(lapse);
}
