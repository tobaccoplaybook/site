var path 	= require('path');
var gitlog 	= require('gitlog');
var moment 	= require('moment');

// See: https://github.com/domharrington/node-gitlog
var gitcfg = { 
	repo: path.normalize(__dirname + '/../'),
	//repo: path.normalize(__dirname + '/../_site/'),
	number: 10,
	fields: ['hash', 'authorName', 'authorEmail', 'authorDate', 'subject', 'body']
};


module.exports = function(filename, language, config){

	//console.log('getCommitHistory for', filename, "with CONF:", config);

	// get all
	var commits = gitlog(gitcfg);

	// remove those not concerning $filename
	commits = commits.filter( (itm) => {
		//return itm.files.indexOf(file) > -1;
		var idx = itm.files.indexOf(filename);
		var action = itm.status[idx]; // D, M, A
		return idx > -1 && action !== 'D';
	});
	//console.log('commits', commits);

	if( commits.length < 1 ){
		return {
			auditTrail: config.strings.first_commit[ language === 'en' ? 0 : 1 ] // 'This is the first commit.'
		};
	}


	// https://github.com/fndn/who-fctc-stories/commits/52ddaa17ea2044eb2eee37fb5b56dc88a130d7a3/articles/000-partial.md
	// https://github.com/fndn/who-fctc-stories/commit/07d42d3081a05cb330d222a169be943a411a8fd6?short_path=ff2eb5a#diff-ff2eb5ab1a092d8faa114db776f1dd7c

	// show commits with this file -> historyLink
	// https://github.com/fndn/who-fctc-stories/commits/master/articles/000-partial.md


	// show diff (the key is to make single file commits (at least for the articles))
	// https://github.com/fndn/who-fctc-stories/commit/f356472af40151c8d27dcd81bfbbe831e78b11ee#articles/000-partial.md


	var commitList = commits.map( (itm) => {

		var idx = itm.files.indexOf(filename);
		var action = itm.status[idx]; // D, M, A
		
		var label_deleted 	= 'Deleted';
		var label_modified 	= config.strings.modified[ language === 'en' ? 0:1];
		var label_added 	= config.strings.added[ language === 'en' ? 0:1];

		itm.action = action === 'D' ? label_deleted : action === 'M' ? label_modified : label_added;
		//itm.action = action === 'D' ? 'Deleted' : action === 'M' ? 'Modified' : 'Added';

		delete itm.files;
		delete itm.status;

		itm.date = moment().utc(itm.authorDate).format();
		//itm.date = moment("2016-06-10 08:53:59 +0200").format("YYMMDD HH:mm")

		//itm.commitslink = 'https://github.com/fndn/who-fctc-stories/commits/'+ itm.hash +'/'+ file;
		itm.commitslink = 'https://github.com/tobaccoplaybook/site/commit/'+ itm.hash +'?diff=split';

		itm.message = itm.action 
			+' by '+ itm.authorName +' &lt;'+ itm.authorEmail +'&gt;'
			+' on '+ itm.date 
			+'<br />message: "'+ itm.subject +'"'
			+'<br /><a target="_blank" href="'+ itm.commitslink +'">commits</a>';

		itm.shortmessage = '<a target="_blank" href="'+ itm.commitslink +'">'+ itm.action +'</a> on '+ itm.date;

		//console.log('itm', itm);
		return itm;
	});

	var historylink   = 'https://github.com/tobaccoplaybook/site/commit/'+ commitList[0].hash +'#'+ filename;
	var revisionslink = 'https://github.com/tobaccoplaybook/site/commit/'+ commitList[0].hash +'?diff=split';
	var lastLink      = commitList[0].shortmessage;

	var auditTrail    = 'Last '+ lastLink +'. See <a target="_blank" href="'+ historylink +'">History</a> and <a target="_blank" href="'+ revisionslink +'">Revisions</a>'


	var result = {auditTrail: auditTrail, commitList:commitList};
	//console.log('result', result);
	return result;
}