
function share(id){
	/// urls from https://blog.bufferapp.com/social-media-icons

	var ww = 700, wh=500;

	var servicenames = {tw: 'Twitter', fb: 'Facebook', gp: 'GooglePlus', li: 'LinkedIn' };
	var services = {
		tw: {url:'https://twitter.com/intent/tweet?riginal_referer=%URL%&text=%TXT%&url=%URL%&via=who'},
		fb: {url:'https://www.facebook.com/sharer/sharer.php?u=%0'},
		gp: {url:'https://plus.google.com/share?url=%URL%'},
		li: {url:'https://www.linkedin.com/shareArticle?mini=true&url=%URL%&title=%TXT%'},
	};
	var conf = services[id];
	conf.url = conf.url.replace(/%URL%/g, window.location.href);
	//conf.url = conf.url.replace(/%TXT%/g, document.title.replace(/_/g, ' ') );

	//var txt = document.title;
	var txt = document.getElementsByName("description")[0].content || document.title;
	conf.url = conf.url.replace(/%TXT%/g, txt );


	//console.log('share', id, servicenames[id], conf, conf.url);

	track({
		hitType: 'social',
		socialNetwork: servicenames[id],
		socialAction: 'Share',
		socialTarget: window.location.href
	});

	if( id === 'fb'){
		var winTop  = (screen.height-wh)/2;
        var winLeft = (screen.width-ww)/2;
        var title   = document.title.replace(/_/g, ' ');
        var descr   = '';
        var url     = window.location.href;
        var image   = '';

        window.open('http://www.facebook.com/sharer.php?s=100&p[title]=' + title + '&p[summary]=' + descr + '&p[url]=' + url + '&p[images][0]=' + image, 'sharer', 'top=' + winTop + ',left=' + winLeft + ',toolbar=0,status=0,width=' + ww + ',height=' + wh);

	}else{
		var topleft = "top="+ (screen.height-wh)/2 +",left="+  (screen.width-ww)/2;
		window.open(conf.url,'share-'+id, "resizable,scrollbars,status,width=700,height=500,"+topleft);
	}
}

function subscribe(){
	//window.open("//who.us4.list-manage.com/subscribe/post?u=bb832ff4c9f8efad547ffcf69&amp;id=9a54f5fae2");
	window.open("//who.us4.list-manage.com/subscribe/?u=bb832ff4c9f8efad547ffcf69&amp;id=9a54f5fae2");
	track({
		hitType: 'social',
		socialNetwork: 'Mailinglist',
		socialAction: 'subscribe',
		socialTarget: window.location.href
	});
}

function track( payload ){
	try {
		ga('send', payload);
		ga('baseio.send', payload);
	}catch(e){
		//console.log('GA Track, Error:', e);
	}
}

var current_tag = '';
var filterwrap = document.getElementById("filter");
var filterlist = document.getElementById("filterlist");
var scrolly = 0;

var filters = [];
function addFilter(tag){
	console.log('addFilter', tag);
	if( filters.indexOf(tag) > -1 ){
		console.log('addFilter -> clearFilter');
		clearFilter(tag);
		return;
	}
	filters.push( tag );
	filters = filters.filter( onlyUnique );
	document.location.hash = "#"+ filters.join(",");
}
function clearFilter(tag){
	console.log('clearFilter', tag);
	filters = filters.filter( onlyUnique );
	filters = deleteItem(filters, tag);
	document.location.hash = "#"+ filters.join(",");
	markTag();
}
function clearFilters(){
	filters = [];
	document.location = document.location.href.split('#')[0];
}
function markTag(){
	if( document.location.hash || filters.length ){
		filters = document.location.hash.replace("#", '').split(",");//replace('#','tag-');
		//console.log('markTag() filters ', filters);
		filterwrap.style.display = "block";
		document.getElementsByClassName("item")[0].classList.remove("itemlarge");
		Array.prototype.forEach.call(document.getElementsByClassName("filter_hide"), function(elm) {
			elm.style.display = "none";
		});
		setTimeout(function(){
			window.scrollTo(0, scrolly);
		}, 1);

	}else{
		//console.log('no filters');
		filterwrap.style.display = "none";
		document.getElementsByClassName("item")[0].classList.add("itemlarge");
		Array.prototype.forEach.call(document.getElementsByClassName("filter_hide"), function(elm) {
			elm.style.display = "block";
		});
		return;
	}


	var filters_str = filters.map( (f) => {
		return "<li class='active' onclick='clearFilter(\""+ f +"\");'>"+ (f.replace(/_/g, ' ')) +"</li>";
	});
	filterlist.innerHTML = filters_str.join("");

	var active = document.querySelectorAll('a');
	Array.prototype.forEach.call(active, function(elm, index) {
		elm.parentElement.classList.remove('active');
	});

	var all = document.getElementsByClassName('argument');
	Array.prototype.forEach.call(all, function(elm, index) {
		var found = false;
		filters.map( (f) => {
			if( elm.classList.contains("tag-"+ f) ){
				found = true;
				var active = document.querySelectorAll('a[data-tagname="'+ f + '"]');
				Array.prototype.forEach.call(active, function(elm, index) {
					elm.parentElement.className = 'active';
					//elm.onclick = clearFilter(f);
				});
			}
		});
		if( found ){
			elm.style.display = 'block';
			elm.classList.add('active');
		}else{
			elm.style.display = 'none';
			elm.classList.remove('active');
		}
	});
}

function onlyUnique(value, index, self) { 
    return self.indexOf(value) === index;
}
function deleteItem(arr, item){
	var index = arr.indexOf(item);
	if (index > -1) {
    	arr.splice(index, 1);
	}
	return arr;
}

window.onload = function() {

	//console.log('onload');

	window.onscroll = function(){
		scrolly = window.scrollY;
	}

	var addr = window.location.href.split(/\//g)[3];

	var lang = getCookie('lang');
	//console.log('#0 addr lang:', addr, 'cookie lang:', lang);

	if( addr === '' ){


		if( addr === '' ) addr = lang;

		// url wins over cookie
		if( addr !== lang ) lang = addr;

		// sanitise
		if( lang === '' && lang !== 'en' && lang !== 'ru' ){
			//console.log('#1 using def lang (en), lang was:', lang );
			lang = 'en'; // default
		}

		// this is the pre-index, rewrite to $lang
		setCookie('lang', lang)
		var dest = window.location.href + lang;
		//console.log('#2 rewrite', dest);
		window.location.href = dest;
		return;

	}else{
		//console.log('#3 not pre-index, update cookie to', addr);
		setCookie('lang', addr);
	}

	//console.log('#4');


	var subbtn = document.getElementById("subscribebtn");
	if(subbtn){
		subbtn.addEventListener("click", subscribe);
	}

	/*
	var sharebtn = document.getElementById("sharebtn")
	if(sharebtn){
		sharebtn.addEventListener("click", function(){
			sharingPanels.style.opacity = sharingPanels.style.opacity > 0 ? 0.0 : 1.0;
		});
	}
	
	if( window.location.href.indexOf("/index.html") > -1){
		//if( document.location.hash ){
			//markTag()
		//}
		//window.onhashchange = markTag;
	}
	*/

	if( window.location.href.substr(-1) == '/' || window.location.href.indexOf("/index.html") > -1){
		//document.getElementsByClassName("item")[0].classList.add("itemlarge");
		//console.log('JA');
		markTag();
		window.onhashchange = markTag;
		limitList();
	}

	//

	(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  	(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  	m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  	})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

	ga('create', 'UA-83761303-1', 'auto');
	//ga('send', 'pageview');

	ga('create', 'UA-84155730-1', {'name':'baseio'});
	//ga('baseio.send', 'pageview');

	track('pageview');
}


var limitListCount = 1;
var limitListIncrement = 2;
function limitList( scroll ){
	limitListCount += limitListIncrement;
	var all = document.getElementsByClassName('argument');
	console.log('limitListCount', limitListCount);


	var lastElm = 0;
	Array.prototype.forEach.call(all, function(elm, index) {
		if( index < limitListCount ){
			elm.classList.remove("hidden");
			lastElm = elm;
		}
	});

	//console.log('lastElm.getBoundingClientRect().top', lastElm.getBoundingClientRect().top);
	if( scroll) window.scrollTo(0, lastElm.getBoundingClientRect().top + window.scrollY)

}











function toggleMenu(){
	//var el = document.getElementById("menu");
	//el.className = (el.className === 'closed') ? '' : 'closed';

	document.getElementById("sharingMenu").classList.remove("hidden");
}


/// Cookie utils
/// Cookies are *only* used to detect wich language the user prefers,
/// so the correct index can be loaded on next visit
function setCookie(key, val) {
    var d = new Date();
    var exdays = 365;
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    var path = "/";
    document.cookie = key + "=" + val + "; " + expires + "; domain=" + document.domain + "; path=" + path;
}

function getCookie(key){
    var name = key + "=";
    var ca = document.cookie.split(';');
    //console.log('ca', ca);
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];

        while( c.charAt(0) === ' '){
            c = c.substring(1);
        }

        if( c.indexOf(name) === 0){
        	return c.substring(name.length,c.length);
        }
    }
    return "";
}

function clearCookie(name, domain, path){
    var domain = domain || document.domain;
    var path = path || "/";
    document.cookie = name + "=; expires=" + +new Date + "; domain=" + domain + "; path=" + path;
}
