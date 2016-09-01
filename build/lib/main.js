
function share(id){
	/// urls from https://blog.bufferapp.com/social-media-icons
	
	var ww = 700, wh=500;

	var services = {
		tw: {url:'https://twitter.com/intent/tweet?riginal_referer=%URL%&text=%TXT%&url=%URL%&via=who'},
		fb: {url:'https://www.facebook.com/sharer/sharer.php?u=%0'},
		gp: {url:'https://plus.google.com/share?url=%URL%'},
		li: {url:'https://www.linkedin.com/shareArticle?mini=true&url=%URL%&title=%TXT%'},
	};
	var conf = services[id];
	conf.url = conf.url.replace(/%URL%/g, window.location.href);
	conf.url = conf.url.replace(/%TXT%/g, document.title.replace(/_/g, ' ') );

	console.log('share', id, conf, conf.url);

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
	window.open("//base.us13.list-manage.com/subscribe/?u=57aa79f1090691d1e473f3ac5&amp;id=fc24ece223");
}


function markTag(){
	var h = document.location.hash.replace('#','tag-');
	var all = document.getElementsByClassName('argument');
	Array.prototype.forEach.call(all, function(elm, index) {
		if( elm.className.split(" ").indexOf(h) === -1 ){
			elm.style.opacity = 0.2;
			//elm.style.display = 'none';
		}else{
			elm.style.opacity = 1;
			//elm.style.display = 'block';
		}
	});
}

window.onload = function() {

	//console.log('onload');

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
	
	var sharebtn = document.getElementById("sharebtn")
	if(sharebtn){
		sharebtn.addEventListener("click", function(){
			sharingPanels.style.opacity = sharingPanels.style.opacity > 0 ? 0.0 : 1.0;
		});
	}
	
	//if( window.location.href.indexOf("/tags.html") > -1 ){
		if( document.location.hash ){  
			markTag()
		}
		window.onhashchange = markTag;
	//}

}

function toggleMenu(){
	var el = document.getElementById("menu");
	el.className = (el.className === 'closed') ? '' : 'closed';
}

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