
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
    	return fs.statSync(path.join(SRC, itm)).isDirectory();
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
		glob.sync( SRC + language + "/arguments/*.md", {} ).map( function(itm){
			var filename = SRC + itm.split(SRC)[1];
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
			glob.sync( SRC + language + "/"+ section +"/*.md", {} ).map( function(itm){
				var filename = SRC + itm.split(SRC)[1];
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
	});
	
	/// Build site
	console.log( chalk.yellow('Rebuilding:') );
	builders.map( (fn) => fn(config, content) );

	// stop timer
	var hrend = process.hrtime(hrstart);
	var lapse = hrend[0]+'s '+(hrend[1]/1000000)+'ms';
	console.log( chalk.green('Done'), lapse, 'at', moment().format('YYMMDD hh:mm:ss') );

	if( cb ) cb(lapse);
}
