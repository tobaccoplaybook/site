var path 	= require('path');
var fs 		= require('fs');
var chalk 	= require('chalk');
var gitlog 	= require('gitlog');
var moment 	= require('moment');
var musta   = require('mustache');
var request = require('sync-request');

var cwd = process.cwd();

// See: https://github.com/domharrington/node-gitlog
var gitcfg = { 
	repo: cwd,
	number: 40,
	fields: ['hash', 'authorDate']
};

var allCommits = gitlog(gitcfg);

module.exports = function(filename, language, config){

	var filename = filename.split(cwd)[1].slice(1);

	// remove those not concerning $filename
	var commits = allCommits.filter( (itm) => {
		if( !itm.files ) return false;

		var idx = itm.files.indexOf(filename);		
		var action = itm.status[idx]; // D, M, A
		return idx > -1 && action !== 'D';
	});
	//console.log('2#commits', commits);

	if( commits.length < 1 ){
		return {auditTrailLink: config.strings.first_commit[ language === 'en' ? 0 : 1 ] }; // 'This is the first commit.'
	}
	
	var itm 	= commits[0]; // most recent commit
	var idx 	= itm.files.indexOf(filename);


	var date 		= moment().utc(itm.authorDate).format("MMMM Do, YYYY");
	var historyUrl 	= config.githubRepo + 'commit/'+ itm.hash;
	var revisionUrl = config.githubRepo + 'commits/master/'+ filename;

	var tpl 	= config.strings.auditLinkShort[ language === 'en' ? 0:1];

	if( config.deepGithubDiffLinks ){

		tpl 	= config.strings.auditLinkLong[ language === 'en' ? 0:1];

		try {
			var diff = fs.readFileSync( config.cacheDirectory + itm.hash );
		}catch( e ){
			var res  = request('GET', historyUrl); // SYNC!!!
			var body = res.getBody().toString();
			diff = body.split('data-path="'+ filename)[0].split('<a name="').pop().split('"></a>')[0];
			fs.writeFileSync( config.cacheDirectory + itm.hash, diff );
			console.log( chalk.yellow('Added github revision page to Cache'), diff);
		}
		historyUrl += '#'+ diff;		
	}
	var historyLink  = '<a target="_blank" href="'+ historyUrl +'">';
		historyLink += config.strings.History[ language === 'en' ? 0:1] +'</a>';

	var revisionLink = '<a target="_blank" href="'+ revisionUrl +'">';
		revisionLink+= config.strings.Revisions[ language === 'en' ? 0:1] +'</a>';

	var props 	= {date, historyLink, revisionLink};
	var msg 	= musta.render( tpl, props );
	
	return {auditTrailLink: msg};
}