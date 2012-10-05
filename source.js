// ==UserScript==
// @name          	IMDb Movie Collection Manager - by Futuros
// @namespace    	http://userscripts.org/
// @description   	Improvements for IMDB My Movies. Now you can REALLY use the imdb page to manage your Must-See lists and collections 
// @copyright		2008+, Futuros
// @license 		Creative Commons Attribution-Share Alike 3.0 Netherlands License; http://creativecommons.org/licenses/by-nc-sa/3.0/nl/
// @version       	2.1.3
// @date		2010-05-13
// @include       	http://*imdb.com/*
// @include       	http://*imdb.de/*
// @exclude       	http://i.imdb.com/*
// @exclude       	http://*imdb.com/images/*
// @exclude       	http://*imdb.de/images/*
// ==/UserScript==

var Script = {
	name:    	'IMDb Movie Collection Manager',
	version:	'2.1.3',
	id:		36797
};

/* Changelog:
2.1.3 (2010.05.13)
	- Fix: 		Add extra debug level for better diagnostics
	- Fix:		More feedback in notification window when rebuilding cache
	- Fix:		Better debug info when running script
	- Features:	New configuration options (see config variable)
2.1.2 (2009.09.25)
	- Bugfix:	The new menu design broke the code to obtain the username
2.1.1 (2009.09.02)
	- Bugfix:	Problem with the verification of an added category
	- Bugfix:  	Problem with getMovie function
2.1.0 (2009.08.27)
	- Feature: 	Styled category menu. Switches between on/off per category
	- Feature: 	Update movie status based on Ajax response. Less ajax calls needed.
	- Feature: 	Rebuild movies cache through context menu.
	- Feature:	Update page and cache on Vote
	- Feature:	Script now runs on details pages, episode list etc.
	- Feature: 	Script Auto updater
	- Fix: 		Custom getElementsByClassName function. FF2 is now supported.
	- Fix:		Support for /Title? tags
	- Fix:		Support for imdb.de, uk.imdb.com, us.imdb.com, italian.imdb.com
2.0.5 (2009.08.12)
	- Bugfix: 2.0.4. didnt fix the problem. It's fixed now.        
2.0.4 (2009.08.03)
	- Bugfix: problem with getting username due to an update by IMDb
2.0.3 (2009.05.22)
	- added a warning for a third party cookies problem
2.0.2 (2009.05.05)
	- when changing a single category it took the status from the checkbox instead of the movieObj
2.0.1 (2009.05.05)
	- fixed a small bug. Script didn't start when going back to a page after
	  a visit to the my movies page
2.0.0 (2009.05.04)
	- Tag movie links on external pages
	- REQ: Made the appearance more suitable for different skins (stylish)
	- REQ: The Category names in the forms have been changed to links. To quickly add/remove to/from single categories
	- Pulldown menu's for all movie titles
	- Automatically clean the recycle bin after a movies has been deleted
	- Update the categories without page reload
	- Cleaned up some of the code
	- hideActionBox is no longer included
1.1.0 (2008.11.14)
	- Solved some issues with empty movie lists
1.0.0 (2008.11.10)
	- First public release
*/
/* Todo:
2.2.0
	Features
		- Add a script configurator
		- Diagnostics script to test if the script is functioning properly (eg. "display options" in my movies section)
		- Rebuild cache automatically every x days
		- Add highlights on other peoples my movies lists	
	Fixes
		- Redesign notification window. + Make it closable
		- Make movies and votes parsing more robust (reg. "display options" on mymovies)
		- Layout issues for the pulldown menu in external pages
		- Resolve issues with multiple links to the same movie. Currently only the first one gets an pulldown menu otherwise there will be problems with duplicate form id's
		- Get rid of hardcoded pulldown limit (currently 1000)
		- Recommendation links are not highlighted on title pages

2.3.0
	Features
		- Add a domain editor to the configurator (requires script to run globally (not sure about this))
		- Vote for movie via pulldown (low prio)
		- Remote login functionality
	Fixes
		- improve code documentation (low prio)
		- Check for double entries in the mymovies lists
		- Performance optimizations
		- Use HTML5 instead of GM functions
		- Write each xhr call to debug log (3)
*/
/*
	Got some ideas? Leave a comment!!
*/

// Configuration
var CONFIG = {
	cleanup: 10,			// Should automatically empty recycle bin when more then this many items in recycle bin. 0 = off
	header: {				// Configuration options for the title name on the movie title page
		highlight: {
			show: true,			// Highlight the title name if in menu or voted for
			color: {
				background: 'silver',	// Background color of the highlight
				text: '',				// not implemented
		}	},
		vote: true,			// Show what you have voted for the movie
		labels: {
			color: {
				background: '', // not implemented
				text: '#606060',// text color of the labels
			},
			show: true,			// show labels on top of the page
			goto: true,			// use links to go to the mymovies lists instead of deleting from that category
			confirmation: true	// ask for confirmation when deleting a category with a link; NB: only used when goto:false
	}	},
	links: {				// Configuration options for the links
		pulldown: true, 		// append a pulldown menu with categories to every movie link
		highlight: {
			show: true,			// Highlight the title name if in menu or voted for
			color: {
				background: '#ddddbf',	// Background color of the highlight
				text: '',				// not implemented
		}	},
		vote: true,			// Show what you have voted for the movie
		labels: {
			color: {
				background: '', // not implemented
				text: '#606060',// text color of the labels
			},
			show: true,			// show labels after the links
			goto: false,		// use links to go to the mymovies lists instead of deleting from that category
			confirmation: true	// ask for confirmation when deleting a category with a link; NB: only used when goto:false
	}	},
	vote: {
			high: {text: 'white', bg: 'green'},
			medium: {text: 'black', bg: '#FFCC00'},
			low: {text: 'white', bg: 'red'},
	},
	debug:{
		level: 0,			// prints info to the error console; level 0: nothing (best performance & useability), 1: basic log messages, 2: all debug messages, 3: debug info for scriptwriter; 
		popup: false		// show notifications when something gets deleted or updated 
}	};

var IMAGES = {
	checked: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAGrSURBVDjLvZPZLkNhFIV75zjvYm7VGFNCqoZUJ+roKUUpjRuqp61Wq0NKDMelGGqOxBSUIBKXWtWGZxAvobr8lWjChRgSF//dv9be+9trCwAI/vIE/26gXmviW5bqnb8yUK028qZjPfoPWEj4Ku5HBspgAz941IXZeze8N1bottSo8BTZviVWrEh546EO03EXpuJOdG63otJbjBKHkEp/Ml6yNYYzpuezWL4s5VMtT8acCMQcb5XL3eJE8VgBlR7BeMGW9Z4yT9y1CeyucuhdTGDxfftaBO7G4L+zg91UocxVmCiy51NpiP3n2treUPujL8xhOjYOzZYsQWANyRYlU4Y9Br6oHd5bDh0bCpSOixJiWx71YY09J5pM/WEbzFcDmHvwwBu2wnikg+lEj4mwBe5bC5h1OUqcwpdC60dxegRmR06TyjCF9G9z+qM2uCJmuMJmaNZaUrCSIi6X+jJIBBYtW5Cge7cd7sgoHDfDaAvKQGAlRZYc6ltJlMxX03UzlaRlBdQrzSCwksLRbOpHUSb7pcsnxCCwngvM2Rm/ugUCi84fycr4l2t8Bb6iqTxSCgNIAAAAAElFTkSuQmCC',
	unchecked: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAIhSURBVDjLlZPrThNRFIWJicmJz6BWiYbIkYDEG0JbBiitDQgm0PuFXqSAtKXtpE2hNuoPTXwSnwtExd6w0pl2OtPlrphKLSXhx07OZM769qy19wwAGLhM1ddC184+d18QMzoq3lfsD3LZ7Y3XbE5DL6Atzuyilc5Ciyd7IHVfgNcDYTQ2tvDr5crn6uLSvX+Av2Lk36FFpSVENDe3OxDZu8apO5rROJDLo30+Nlvj5RnTlVNAKs1aCVFr7b4BPn6Cls21AWgEQlz2+Dl1h7IdA+i97A/geP65WhbmrnZZ0GIJpr6OqZqYAd5/gJpKox4Mg7pD2YoC2b0/54rJQuJZdm6Izcgma4TW1WZ0h+y8BfbyJMwBmSxkjw+VObNanp5h/adwGhaTXF4NWbLj9gEONyCmUZmd10pGgf1/vwcgOT3tUQE0DdicwIod2EmSbwsKE1P8QoDkcHPJ5YESjgBJkYQpIEZ2KEB51Y6y3ojvY+P8XEDN7uKS0w0ltA7QGCWHCxSWWpwyaCeLy0BkA7UXyyg8fIzDoWHeBaDN4tQdSvAVdU1Aok+nsNTipIEVnkywo/FHatVkBoIhnFisOBoZxcGtQd4B0GYJNZsDSiAEadUBCkstPtN3Avs2Msa+Dt9XfxoFSNYF/Bh9gP0bOqHLAm2WUF1YQskwrVFYPWkf3h1iXwbvqGfFPSGW9Eah8HSS9fuZDnS32f71m8KFY7xs/QZyu6TH2+2+FAAAAABJRU5ErkJggg==',
	loading: 'data:image/gif;base64,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%3D%3D',
};

// Styles
GM_addStyle('/* Inserted By Greasemonkey userscript (IMDb Movie Collection Manager - by Futuros): */'
	+'.imcm_highlight_header {font-weight: bold; color: black !important; background-color:'+CONFIG.header.highlight.color.background+';}'
	+'.imcm_highlight_links {font-weight: bold; color: black !important; background-color:'+CONFIG.links.highlight.color.background+';}'
	+'.imcm_catlist { width: 120px; color: black; text-align:left;}'
	+'.imcm_hide {display:none; height: 0px;}'
	+'.imcm_failed {border-color: red!important; background-color:pink!important;}'
	+'.imcm_notification {visibility: hidden; font-family: helvetica, verdana; height: 150px; width: 240px; font-size:.8em; position: fixed; right: 100px; top: 150px; color: #000; padding: 5px; background-color: #1188ff; border: 2px solid #77ddff; border-bottom-color: #2244ff; border-right-color: #2244ff; overflow: auto;}'
	+'.imcm_label_links {padding: 5px; color: '+CONFIG.links.labels.color.text+' !important;}'
	+'.imcm_label_header {padding: 5px; color: '+CONFIG.header.labels.color.text+' !important;}'
	+'.imcm_vote {margin:2px; padding-left:2px; padding-right:2px;}'
	+'#tn15title .imcm_vote {font-size:1.5em;font-weight:bold;padding-right:5px;padding-left:5px; margin-left:0px;}'
	+'.imcm_high {background-color: '+CONFIG.vote.high.bg+'; color: '+CONFIG.vote.high.text+';}'
	+'.imcm_medium {background-color: '+CONFIG.vote.medium.bg+'; color: '+CONFIG.vote.medium.text+';}'
	+'.imcm_low {background-color: '+CONFIG.vote.low.bg+'; color: '+CONFIG.vote.high.text+';}'
	+'.imcm_pulldown_wrapper {position: relative;}'
	+'.imcm_pulldown_link {position: relative;padding:0 5px 0 5px; font-size:.8em;cursor:pointer;}'
	+'.imcm_pulldown {position:absolute; top:.9em; right:0px; background-color: white; border: 1px solid black;}'
	+'.imcm_close {position:absolute; top:2px; right:5px; font-weight:bolder; background-color: white;cursor:pointer;}'
	+'.imcm_menu {width:120px;margin: 0; padding:0px; list-style: none;}'
	+'.imcm_menu li{font-weight:bolder;background-image:url('+IMAGES.unchecked+');padding: 2px 21px;background-repeat:no-repeat;background-position:2px center;height:16px;display:block;cursor:pointer;cursor:hand;margin:auto;}'
	+'.imcm_menu li:hover{background-color:#ddd!important;}'
	+'.imcm_menu li.checked{background-color:#eee;background-image:url('+IMAGES.checked+');}'
	+'.imcm_menu li.busy{background-color:#fff !important;color:gray;cursor:wait!important;background-image:url('+IMAGES.loading+')!important;}'
);

// Global variabels
var movies; // object with all the movies in the my movies list
var categories; // object with all the categories
var notification; // obj to show notifications 
var page; // object with info about the current page
var activePulldown;
var pulldowns =1000;
var deleted = false;

l = function(v,p){p=p||3; if(CONFIG.debug.level>=p)log('['+p+'] '+v);}
e = function(v){if(typeof console=='object'){console.error(v);}else{GM_log('[error] '+v);}}
log = function(v){if(typeof console=='object'){console.log(v);}else{GM_log(v);}}

/*
 * Get the movie info based on a address string
 */
function getMovieInfo(address) {
	tid = address.match(/(?:(?:www|us|italian|uk)\.)?imdb.(?:com|de)(?:(?:\/title\/tt)|(?:\/Title\?))(\d+)\/(?:\w+\/?)?$/);
	if (!tid) return false;
	m = getMovie(tid[1]);
	if(page.isType(page.TYPE.title) && page.movie && m.id == page.movie.id)return false; // important! Check if page.movie because the page is being checked against this function to.
	return m;
}
/*
 * Get a movie object based on a movie id.
 * @return MovieObj
 */
function getMovie(id){
	var movie = movies.get(id);
	if(!movie){
		movie = movies.add({'tid':id}); //Create an empty object with only a id
	}
	return movie;
}

/*
 * Create a menu element with all the categories as list items.
 * @param 	movie	a MovieObj which the form field will add/remove to the categories
 * @return	html	returns a html menu element or false if a menu with the id already exists.
 */
function createCategoriesMenu(movie){
	var menu = document.createElement('ul');
	menu.name = 'cats_'+movie;
	menu.setAttribute("movid", movie.id);
	mid = 'changeMenu_'+movie.id;
	if(document.getElementById(mid)!=null){ // make sure there is only one menu per page
		return false;
	}
	menu.id = mid;
	menu.className='imcm_menu movie'+movie.id;
	for(var i in categories.array){
		a = categories.array[i];
		if(a[1] == 'Recycle Bin' || a[1].toLowerCase() == 'pending')continue;
		li = document.createElement('li');
		li.title = 'Add/Remove: '+a[1];
		li.setAttribute("catid", a[0]);
		li.innerHTML = a[1];
		menu.appendChild(li);
		if(movie.hasCategory(a[0])){
			li.addEventListener('click', menuClickHandler, false); 
			addClassName(li,'checked');
		} else {
			li.addEventListener('click', menuClickHandler, false); 
		}
	}
	return menu;
}

function menuClickHandler(ev){
	var node = ev.currentTarget;
	if(hasClassName(node, 'busy')){ return false;}
	movie = getMovie(node.parentNode.getAttribute('movid'));
	catid = node.getAttribute('catid');
	l('catid: '+catid);
	addClassName(node, 'busy');
	
	// check if the checked status of the form is the same as the movie object.
	if(movie.hasCategory(catid)!=hasClassName(node,'checked')){
		notification.error('The checkbox status is not the same as the information in the movie cache.</p><p>Reload the page and try again.<br />If the problem persists try rebuilding the cache (context menu OR visit imdb.com/mymovies).');
		e('(line:250) wrong status for movie: '+movie.id+' and catid: '+catid);
		ev.preventDefault();
		return false;
	}
	
	if(movie.hasCategory(catid)){
		executeChange(movie, {'type': 'delete', 'old':catid, 'tid':movie.id, 'cid': movie.getControlId(catid)}, function(responseDetails){ notification.debug('Movie deleted', 2000);}, node);	
	} else {
		executeChange(movie, {'type': 'add', 'new':catid, 'tid':movie.id},	function(responseDetails){notification.debug('Movie added', 2000);}, node);
	}
	ev.preventDefault();
}

/*
 * Appends labels for all the categories the movie belongs to, to the node
 * Also add a pulldown menu with categories if CONFIG requires so
 *
 * @param {HtmlElement} node The node where the categories need to be appended to
 * @param {MovieObj} movie The movie corresponding with the node
 * @return Whether or not the node got highlighted as a result of this function
 * @type boolean
 */
function appendCategoryLinks(node, movie){
	var isHeader = node.tagName!='A';
	addClassName(node, 'label_node movie'+movie.id);
	highlighted = updateCategoryLinks(node, movie);
	if(CONFIG.links.pulldown && !isHeader && (changeMenu = createCategoriesMenu(movie))){
		pd = document.createElement('div');
		pd.appendChild(changeMenu);
		pd.className = 'imcm_pulldown imcm_hide imcm_catlist';
		pd.addEventListener('mouseover', function(ev){activePulldown=null;}, false);
		pd.addEventListener('mouseout', function(ev){activePulldown=ev.currentTarget;}, false);
		pd.style.zIndex=pulldowns--;
		x = document.createElement('a');
		x.innerHTML = 'x';
		x.className = 'imcm_close';
		x.addEventListener('click', function(ev){addClassName(ev.currentTarget.parentNode, 'imcm_hide'); ev.preventDefault();},false);
		pd.appendChild(x);
		pdlink = document.createElement('a');
		pdlink.className = 'imcm_pulldown_link';
		pdlink.innerHTML = '&#9660;';
		pdlink.addEventListener('click', function(ev){pd=ev.currentTarget.nextSibling;activePulldown=pd;removeClassName(pd, 'imcm_hide'); ev.preventDefault();},false);
		pdwrap = document.createElement('span');
		pdwrap.className='imcm_pulldown_wrapper';
		pdwrap.appendChild(pdlink);
		pdwrap.appendChild(pd);
		node.parentNode.insertBefore(pdwrap, node.nextSibling);
	}
	return highlighted;
}

/*
 * Remove all labels and/or vote currently on the node. Reapply the labels and/or vote according to the new movie object
 * Add the highlight class to the node if it has categories or votes
 *
 * @param {HtmlElement} node The node where the categories need to be appended to
 * @param {MovieObj} movie The movie corresponding with the node
 * @return Whether or not the node got highlighted as a result of this function
 * @type boolean
 */

function updateCategoryLinks(node,movie){
	var isHeader = node.tagName!='A';
	var CFG = isHeader ? CONFIG.header : CONFIG.links;
	
	// Remove nodes currently added to the nodes parentnode
	links = getElementsByClassName('imcm_label', false, node.parentNode);
	var i = -1;
	while (current = links[(i+=1)]) {
		current.parentNode.removeChild(current);
	}
	
	if(movie.isActive()){
		if(isHeader){
			addClassName(node, 'imcm_highlight_header');
		} else {
			addClassName(node, 'imcm_highlight_links');
		}
		
		// internal function to append label
		appendLabel = function(nd, type, value){
			if(type=='vote'){
				var tag = document.createElement('span');	
				addClassName(tag, 'imcm_vote imcm_label');
				(value >= 8) ? addClassName(tag, 'imcm_high') : ((value <5) ? addClassName(tag, 'imcm_low') : addClassName(tag, 'imcm_medium'));

				tag.innerHTML = value;
			} else {
				var tag = document.createElement('a');	
				if(isHeader){
					addClassName(tag, 'imcm_label imcm_label_header');
				} else {
					addClassName(tag, 'imcm_label imcm_label_links');
				}
				var catid = value;
				if(catid==categories.getId('Recycle Bin'))return;
				var cname = categories.getName(catid);		
				tag.setAttribute("href",'#'+catid);
				tag.setAttribute("catid", catid);
				if(CFG.labels.goto){
					tag.title = 'Go to the movie list for category: '+cname;
					tag.addEventListener('click', function(ev){ev.preventDefault();window.location='http://www.imdb.com/mymovies/list?l='+catid;}, false);
				} else {
					tag.title = 'Delete movie from category: '+cname;
					tag.addEventListener('click', function(ev){var node = ev.currentTarget; if(!CFG.labels.confirmation || confirm('Delete movie from '+node.innerHTML+'?')){executeChange(movie, {'type': 'delete', 'old':node.getAttribute('catid'), 'tid':movie.id, 'cid': movie.getControlId(node.getAttribute('catid'))}, function(responseDetails){ notification.debug('Movie deleted', 2000);})}ev.preventDefault();}, false); 
				}
				tag.innerHTML = cname;
			}
			sibling=node.nextSibling;
			if(sibling && hasClassName(sibling, 'imcm_pulldown_wrapper'))sibling=sibling.nextSibling;
			node.parentNode.insertBefore(tag, sibling);
		} // end of function
		
		if(CFG.labels.show && movie.category.length>0){
			for(j=0;j<movie.category.length;j++){
				this.appendLabel(node, 'cat', movie.category[j][0]);
			}
		}
		if(CFG.vote && movie.vote>0){
			this.appendLabel(node, 'vote', movie.vote);
		}
		return true;
	} else {
		if(isHeader){
			removeClassName(node, 'imcm_highlight_header');
		} else {
			removeClassName(node, 'imcm_highlight_links');
		}
		return false;
	}	
}

/*
 * Update the status of the movie for all links refering to the specified movie.
 */
function updateStatus(movie){
	l('Updating all links and headers for movie: '+movie.id,2);
	movieNodes = getElementsByClassName('movie'+movie.id, null, document);
	for(i=0;i<movieNodes.length;i++){
		node = movieNodes[i];
		if(hasClassName(node, 'label_node')){
			updateCategoryLinks(node,movie);
		} else if(hasClassName(node, 'imcm_menu')){
			elms = node.getElementsByTagName('li');
			for (h=0;h<elms.length;h++){
				if(movie.hasCategory(elms[h].getAttribute('catid'))){
					addClassName(elms[h], 'checked');
				} else {
					removeClassName(elms[h], 'checked');
				}
			}
		}
	}	
	setTimeout(function(){if(activePulldown){addClassName(activePulldown,'imcm_hide');}},500);
}	

/*
 * Creates an ajax call for the action
 */
function executeChange(movie, action, callback, menu){
	// callback function
	cb = function(response){
		if(response.status!=200)return false;
		if(action.type=="delete"){
			rx = new RegExp("<input type=\"checkbox\" name=\"e\" value=\"(\\\d+):"+movie.id+"\"","i");
			if(!rx.test(response.responseText)){
				l('failed to delete movie');
				return false;
			}
			l('delete: '+movie+' from '+action.old);
			movie.deleteCategory(action.old);
			deleted=true;
		} else {
			rx = new RegExp("\\/popup\\/mmnote\\?id=(\\\d+):"+movie.id, "i");
			m = response.responseText.match(rx);
			l('match: '+m);
			if(!m){l('failed to add movie');return false;}
			cid=m[1];
			l('add: '+movie+' to '+action.new+':'+cid);
			movie.addCategory(action.new, cid);
		}
		movies.save();
		if(menu && menu!=false){
			if(action.type=='add'){
				addClassName(menu, 'checked');
			} else {
				removeClassName(menu, 'checked');			
			}
			removeClassName(menu, 'busy');
		}
		updateStatus(movie);
		cleanup();
		if(callback)callback(true);
	}; // end of callback function
	switch(action.type){
		case 'add':
			url = 'http://www.imdb.com/mymovies/list';
			data = 'l='+action.new+'&add='+movie.id+'&a=1';
		break;
		case 'delete':
			data = 'l='+action.old+'&e='+action.cid+':'+movie.id+'&to='+categories.getId('Recycle Bin')+'&action=Move&a=1';
			url = 'http://www.imdb.com/mymovies/list';
		break;
	}
	l('xhr: '+action.type+': '+url+'?'+data,3);
	postXhr(url,data,cb);
}

function postXhr(url, data, cb){
	GM_xmlhttpRequest({
		method : 'POST',
		url    : url,
		headers: {'Content-type':'application/x-www-form-urlencoded',
					 'Cookie': document.cookie},
		data   : encodeURI(data),
		onload : cb,
	});
}

function saveVote(evt){
	vu = document.getElementById('voteuser');
	if(!vu)return false;
	vote = (vote = vu.innerHTML.match(/^(\d{1,2})$/)) ? parseInt(vote[1]) : 0;
	movie = getMovie(page.movie.id);
	if(movie.vote!=vote){
		movie.setVote(vote);
		movies.save();
		l('Vote changed to '+movie.vote,1);
		updateStatus(movie);
	}
}

/*
 * Update the list with movies
 */
function rebuildMovieList(command) {
	if(command){
		l('Rebuilding cache - manual request',2);
		notification.write('Updating the movie list.');
	} else if(!page.isType(page.TYPE.mymovies)){
		l('Building cache on first script run',1);
		notification.write('Because it\'s the first time this script is run the movie list needs to be updated.');
	} else {
		l('Rebuilding cache - on mymovies page',2);	
	}
	movies.clear();
	requestVotingHistory(command);
}

/*
 * Process categories
 */
function processCategories(data, command) {
	var showNotification = CONFIG.debug.popup || !page.isType(page.TYPE.mymovies) || command;
	/*--- set categories ---*/
	var catArray = [];
	var cats = data.match(/<tr.id=".+".+>\n.+/gi); //Return category/list name and id container
	if(cats && (cats = cats[0].match(/value="\d+">[\w\s]+/gi))){
		for(var i=1;i<cats.length;i++){
			c = cats[i].match(/="(\d+)">([\w\s]+)/);
			//if('MyMovies: PENDING'!=c[2])continue;
			//Old style IMDB MyMovies list are now just standard lists prefixed with MyMovies.
			c[2]=c[2].replace("MyMovies: ",""); //regex to remove "MyMovies: " prefix
			catArray.push([c[1],c[2]]);
		}
		categories.set(catArray);
		l('Categories updated. '+categories.array.length+' categorie(s) found',1);
		if(showNotification){notification.write('Categories updated<br />'+categories.array.length+' categorie(s) found', 3000,true);}
	} else {e('(line:504) Failed to obtain categories from the xhr result page');	}
}

/*
  * Process the movie list dashboard
  */
function processMyMovies(data, command) {
	processCategories(data, command);
	processmovieList(data, command);
	
	/*--- update page ---*/
	if(showNotification){notification.write('Movie list updated<br />'+movies.array.length+' movie(s) found', 5000,true);}
	//Refresh script + page
	if(!page.isType(page.TYPE.mymovies) && !command){initScript(4);}
	if(command){
		// TODO: recreate page
		if(CONFIG.debug.level<=1){window.location.reload();}
		else{l('Debug is enabled. So refresh manually');}
	}
}

/*
  * Process movie list
  */
 function processMovieList(data, command) {
	/*--- set movies ---*/
	var movs = data.match(/<a href=".title.tt[0]*\d+.*\n.*/gi);
	var movcount=0;
	if(movs){
		for (var i=0; i < movs.length; i++) {
			m = movs[i];
			if (!m) continue;
			m2 = m.match(/list\?l=(\d+).*\n.*popup\/mmnote\?id=(\d+):(\d+)/);
			if (!m2||m2[1]==categories.getId('Recycle Bin')||m2[1]==categories.getId('Pending')) continue;	
			movies.add({'tid': m2[3], 'categoryid':m2[1], 'controlid':m2[2]});
			movcount++;
		}
		movies.save();
		l('Movie list updated. '+movcount+' movie(s) found', 1);
	} else { e('(line:519) Failed to obtain movies from the xhr result page');}
}

/*
  * Process vote history
  */
function processVoteHistory(data, command) {
	var movs = data.match(/<a href=".title.tt[0]*\d+.*\n.*/gi);
	if(movs && movs!=null){
		for (var i=0; i < movs.length; i++) {
	      m = movs[i];
	      if (!m) continue;
			m2 = m.match(/<a href=".title.tt(\d+)\/.*\n.*\n.*\n<td class="your_ratings"><a>(\d{1,2})/);
			if (!m2) continue;	
			movies.add({'tid': m2[1], 'vote':m2[2]});
		}	
		movies.save();
		notification.write('Votes updated<br />'+movies.array.length+' vote(s) found', 3000,true);
		l('Vote history updated. '+movies.array.length+' vote(s) found',1);
	}else{e('(line:545) Failed to obtain votes from xhr result page');}
	requestMyMovies(command);
}

function requestVotingHistory(command){
	// Get Voting history list
	GM_xmlhttpRequest({
		method : 'GET',
		url    : 'http://www.imdb.com/list/ratings?view=compact',
		onload : function(responseDetails) { processVoteHistory(responseDetails.responseText, command);},
		onerror: function(responseDetails) { e('failed to get vote history');notification.write('Failed to update vote history', 3000)}
	});
}

function requestMyMovies(command){
	// MyMovies dashboard
	GM_xmlhttpRequest({
		method : 'GET',
		url    : 'http://www.imdb.com/mymovies/list?a=1',
		onload : function(responseDetails) { processMyMovies(responseDetails.responseText, command); },
		onerror: function(responseDetails) { e('failed to get movie list');notification.write('Failed to update movie list', 3000)}
	});
}

function requestUsername(){
	//Get the username from the page
	GM_xmlhttpRequest({
		method : 'GET',
		url    : 'http://www.imdb.com/',
		onload : function(responseDetails) {
			acc = responseDetails.responseText.match(/\b(\w+)(?=&#x27;s account)/i);
			if(acc){
				page.user=acc[1];	
				initScript(2);
			}else {
				e('(line:567) Failed to get imdb username');
				notification.write('Failed to get imdb username.<br />Make sure you have third party cookies turned on.');
			}
		},
		onerror: function(responseDetails) { e('(line:571) Failed to get imdb username');notification.write('Failed to get imdb username', 3000)}
	});
}

function cleanup(){
	if(CONFIG.cleanup && deleted && !page.isType(page.TYPE.external)){
		// only 1 in 10 times to save server
		if(Math.random()>0.1)return false;
		l('Send Ajax request to delete movies from recycle bin',2);
		GM_xmlhttpRequest({
			method : 'POST',
			url    : 'http://www.imdb.com/mymovies/list',
			headers: {'Content-type':'application/x-www-form-urlencoded', 'Cookie': document.cookie},
			data   : encodeURI('l='+categories.getId('Recycle Bin')+'&action=Empty+Recycle+Bin'),
			onload : function(responseDetails) { l('emptied the recycle-bin',1);deleted=false; },
			onerror: function(responseDetails) { e('failed to empty the recycle bin');}
		});
	}
}

/*
  * Create a notification object
  */
function Notification(){
	this.notification, this.timer;
	
	this.init = function(){
		this.notification = document.createElement("div");
		this.notification.className = 'imcm_notification';
		this.notification.addEventListener('click', this.clicked.bind(this), false);
		document.body.appendChild(this.notification);
	}
	
	this.write = function(text, maxtime, append){
		if(this.timer)clearTimeout(this.timer);
		this.notification.innerHTML = (append)?this.notification.innerHTML+'<br/>'+text : text;
		this.show();
		if(maxtime>0){
			this.timer=setTimeout(this.hide.bind(this),maxtime);
		}
	}
	
	this.debug = function(text, maxtime){
		if(CONFIG.debug.popup)this.write(text, maxtime);
	}
	this.error = function(text){
		this.write('<h3>ERROR:</h3><p>'+text+'</p>');
	}
	this.show = function(){
		this.notification.style.visibility = 'visible';
	}
	
	this.hide = function(){
		this.notification.style.visibility = 'hidden';
	}
	
	this.clicked = function(ev){
		this.hide();
	}
	this.init();
}

/*
 * Object: Used to manage the movie list
 */
function MovieList(){
	this.array = [];
	this.name = page.getUser()+'_movies';
	var obj = this;
	
	/*
	  * Load the stored value
	  */
	this.load = function(){
		var stored = GM_getValue('imdb+_'+this.name); //read from browser
		if(stored != undefined){		
			this.toArray(stored);
		}		
	}
	
	this.save = function(){
		var store = this.toString();
		GM_setValue('imdb+_'+this.name, store); //write to browser
	}
	
	this.clear = function(){
		this.array = [];
	}
	
	//remove all the movies with only categories. And empty categories for movies with a vote
	this.clearCategories = function(){
		if((i=this.array.length)>0){		
			do{
				i--;
				obj = this.array[i];
				if(obj.hasVote()){
					obj.clearCategories();
				} else {
					this.array.splice(i,1);
				}
			}
			while(i>0)
		}

	}
	
	/*
	  * Change the object with the new array and store the value
	  */
	this.set = function(value){
		this.array = value;
		this.save();
	}

	this.add = function(value){
		movie = new MovieObj(value);
		if(exists = this.get(movie)){
			exists.merge(movie);
			return exists;
		} else {
			this.array.push(movie);
			return movie;
		}
	}
	
	/*
	  * Get a movie object
	  * Id can be a id or an MovieObject
	  */
	this.get = function(id){
		if((i=this.array.length)>0){		
			do{
				if(this.array[i-1].equals(id))return this.array[i-1];
				i--;
			}
			while(i>0)
		}
		return false;
	}
	
	/*
	  * String to Array
	  */
	this.toArray = function(string) {
		var arr = string.split('|');
		var array = new Array();
		
		var i=arr.length;
		if(i>0){
			do{
				array.push(new MovieObj(arr[i-1]));
				i--;
			}
			while(i>0) 		
		}
		this.array = array;
	}

	/*
	  * Array to String
	  */
	this.toString = function() {
		var string = '';
		var i=this.array.length;
		if(i>0){
			do{
				string += "|"+this.array[i-1].toString();
				i--;
			}
			while(i>0) 		
			string = string.substring(1);
		}
		return string;
	}
}

function MovieObj(){
	this.category = []; // catid controlid pair
	
	if(arguments.length==0)return false;
	if(typeof arguments[0] == 'string'){
		arr = arguments[0].split("-");
		this.id = arr[0];
		this.vote = parseInt(arr[1]);		
		var i=arr.length;
		while(i>2){
			this.category.push(arr[i-1].split(':'));
			i--;
		}
	} else {
		//from object {tid, categoryid, controlid}, vote
		obj = arguments[0];
		this.id = arguments[0].tid;
		this.vote = arguments[0].vote || 0;
		if(obj.categoryid && obj.controlid)	this.category.push([obj.categoryid,obj.controlid]);
	}

	this.isActive = function(){
		return this.category.length > 0 || this.vote > 0;
	}
	
	this.hasCategory = function(id){
		if(this.category.length<=0)return false;
		for(var i=0;i<this.category.length;i++){
			if(this.category[i][0]==id)return true;
		}
		return false;
	}
	
	this.hasVote = function(){
		return (this.vote!=0);
	}
	
	this.setVote = function(vote){
		this.vote = vote;
	}
	
	this.merge = function(obj){
		if(!this.equals(obj))return false;
		if(obj.vote!=false) this.vote = obj.vote;
		if(obj.category.length){
			this.category = this.category.concat(obj.category);
		}
	}
	
	this.addCategory = function(categoryId, controlId){
		this.category.push([categoryId,controlId]);
	}
	
	this.deleteCategory = function(id){
		if(this.category.length<=0)return false;
		for(var i=0;i<this.category.length;i++){
			if(this.category[i][0]==id){
				this.category.splice(i,1);
				return true;
			}
		}
		return false;	
	}

	this.moveCategory = function(oldCategoryId, newCategoryId, controlId){
		this.addCategory(newCategoryId, controlId);
		this.deleteCategory(oldCategoryId);
	}

	this.categoryList = function(){
		var catList = [];
		for(var i=0;i<this.category.length;i++){
			catList.push(this.category[i][0]);
		}
		return catList.sort();
	}
	
	this.clearCategories = function(){
		this.category = [];
	}
	
	this.getControlId = function(category){
		for(var i=0;i<this.category.length;i++){
			if(this.category[i][0]==category){
				return this.category[i][1];
			}
		}
		e('(line:833) Failed to get control id for movie:'+this.id+' and category:'+category);
		return false;
	}

	this.equals = function(obj){
		if(obj instanceof MovieObj){
			return this.id === obj.id;
		} else {
			return this.id==obj;
		}
	}

	this.toString = function(){
		var string = [this.id,this.vote];
		if(this.category.length>0){
			for(var i=0;i<this.category.length;i++){
				string.push(this.category[i].join(':'));
			}
		}
		return string.join('-');
	}
}

/*
 * Object: Used to manage the movie list
 */
function CategoryList(){
	this.string = "";
	this.array = [];
	this.name = 'imdb+_'+page.getUser()+'_categories';
	var obj = this;
	
	/*
	  * Get the stored value
	  */
	this.get = function(){
		var stored = GM_getValue(this.name); //read from browser
		if(stored != undefined){		
			this.string = stored;
			this.array = this.toArray();
		}		
	}
	
	/*
	  * Change the object with the new array and store the value
	  */
	this.set = function(value){
		this.array = value;
		this.string = this.toString();
		GM_setValue(this.name, this.string); //write to browser
	}

	/*
	  * String to Array
	  */
	this.toArray = function() {
		var arr = this.string.split('|');
		var array = new Array();
		
		var i=arr.length;
		do{
			arr2 = arr[i-1].split("-");
			array.push([arr2[0],arr2[1]]);
			i--;
		}
		while(i>0) 		
		
		return array;
	}

	/*
	  * Array to String
	  */
	this.toString = function() {
		var string = '';
		if(this.array.length==0)return string;
		for(var i in this.array){
			a = this.array[i];
			string += "|"+a[0]+"-"+a[1];
		}
		return string.substring(1);
	}

	/*
	  * Get a cat id by a name
	  */
	this.getId = function(name){
		for(var i in this.array){
			a = this.array[i];
			if(a[1]==name)return a[0];
		}
		return false;
	}

	/*
	  * Get a name by id
	  */
	this.getName = function(id){
		for(var i in this.array){
			a = this.array[i];
			if(a[0]==id)return a[1];
		}
		return false;
	}
	
	// get the value at script start
	this.get();
}

/*
 * Object to handle information about the page if it is a title page
 * There are different types of pages
 * title:		Movie title page /title/tt* || /Title?
 * mymovies:	Movie list page /mymovies/list*
 * imdb:		IMDB Page with movie links
 * external:	External page; not implemented yet
 */
function Page(){
	this.TYPE = {title: 0, mymovies: 1, imdb: 2, external: 3}
	this.user, this.type, this.loc, this.movie, this.header;
	
	this.initType = function(){
		this.loc = document.location.href;
		if(this.loc.search(/^http(s)?:\/\/.*\.imdb\.(com|de)\//)==-1){
			this.type = this.TYPE.external;
		} else	if(this.loc.search(/\/mymovies\/list/)!=-1){
			this.type = this.TYPE.mymovies;
		} else if(this.loc.search(/(\/title\/tt\d+)|(\/Title\?\d+)/)!=-1){
			this.type = this.TYPE.title;
		} else {
			this.type = this.TYPE.imdb;
		}
		l('Page type: '+this.getTypeName());
	}

	this.initUser = function(){
		if(this.user)return true;
		var account = document.getElementById('nb15personal') || document.getElementById('nb_personal');
		if (account) {
			var result = account.innerHTML.match(/\s*([^>]+)'s account/i);
			if (result && result[1]) {
				this.user = result[1];
				return true;
			}
		}
		return false;
	}

	this.initTitle = function(){
		if(!this.isType(this.TYPE.title) || !this.initMovie())return false;
		h1s = document.getElementsByTagName('h1');
		if(h1s.length==1){
			this.header=h1s[0];
			return true;
		} else {
			e('(line:801) no header found on page with type title');
			return false;
		}
	}

	this.initMovie = function(){
		return this.movie = getMovieInfo(this.loc);
	}
	
	this.getUser = function(){
		return this.user;
	}
	
	this.freshMovie = function(){
		this.initMovie();
		return this.movie;
	}
	
	this.isType = function(type){
		return this.type==type;
	}
	
	this.isActive = function(){
		return this.isType(this.TYPE.title) && this.movie && this.movie.isActive();
	}
	this.getTypeName = function(){
		for(var i in this.TYPE){
			if(this.TYPE[i]==this.type)return i;
		}
		return undefined;
	}
}

/*---------------------- START UTIL FUNCTIONS ---------------------------------*/
(function () {
    function toArray(pseudoArray) {
        var result = [];
        for (var i = 0; i < pseudoArray.length; i++)
            result.push(pseudoArray[i]);
        return result;
    }
    if(!Function.prototype.bind){
		Function.prototype.bind = function (object) {
			var method = this;
			var oldArguments = toArray(arguments).slice(1);
			return function () {
				var newArguments = toArray(arguments);
				return method.apply(object, oldArguments.concat(newArguments));
			};
		}
	}
	if(!Function.prototype.bindAsEventListener){
		Function.prototype.bindAsEventListener = function (object) {
			var method = this;
			var oldArguments = toArray(arguments).slice(1);
			return function (event) {
				return method.apply(object, [event || window.event].concat(oldArguments));
			};
		}
	}
})();

addClassName = function(element, className) {if(!element.className){element.className=className;return;} var arr = element.className.split(' '); var nameUpper = className.toUpperCase(); for(var i=0; i<arr.length; i++){if(nameUpper==arr[i].toUpperCase())return;}arr.push(className);element.className = arr.join(' ');}
removeClassName = function(element, className){if(!element.className){return;} var arr = element.className.split(' '); var nameUpper = className.toUpperCase(); for(var i=0; i<arr.length; i++){if(nameUpper==arr[i].toUpperCase()){arr.splice(i,1);i--;}}element.className = arr.join(' ');}  
hasClassName = function(element, className) {if(!element.className){return false;} var arr = element.className.split(' '); var nameUpper = className.toUpperCase(); for(var i=0; i<arr.length; i++){if(nameUpper==arr[i].toUpperCase())return true;}return false;}
/*
        Developed by Robert Nyman, http://www.robertnyman.com
        Code/licensing: http://code.google.com/p/getelementsbyclassname/
*/      
var getElementsByClassName = function (className, tag, elm){
        if (document.getElementsByClassName) {
                getElementsByClassName = function (className, tag, elm) {
                        elm = elm || document;
                        var elements = elm.getElementsByClassName(className),
                                nodeName = (tag)? new RegExp("\\b" + tag + "\\b", "i") : null,
                                returnElements = [],
                                current;
                        //if(!tag) return elements;
						for(var i=0, il=elements.length; i<il; i+=1){
                                current = elements[i];
                                if(!nodeName || nodeName.test(current.nodeName)) {
                                        returnElements.push(current);
                                }
                        }
                        return returnElements;
                };
        }
        else if (document.evaluate) {
                getElementsByClassName = function (className, tag, elm) {
                        tag = tag || "*";
                        elm = elm || document;
                        var classes = className.split(" "),
                                classesToCheck = "",
                                xhtmlNamespace = "http://www.w3.org/1999/xhtml",
                                namespaceResolver = (document.documentElement.namespaceURI === xhtmlNamespace)? xhtmlNamespace : null,
                                returnElements = [],
                                elements,
                                node;
                        for(var j=0, jl=classes.length; j<jl; j+=1){
                                classesToCheck += "[contains(concat(' ', @class, ' '), ' " + classes[j] + " ')]";
                        }
                        try     {
                                elements = document.evaluate(".//" + tag + classesToCheck, elm, namespaceResolver, 0, null);
                        }
                        catch (e) {
                                elements = document.evaluate(".//" + tag + classesToCheck, elm, null, 0, null);
                        }
                        while ((node = elements.iterateNext())) {
                                returnElements.push(node);
                        }
                        return returnElements;
                };
        }
        else {
                getElementsByClassName = function (className, tag, elm) {
                        tag = tag || "*";
                        elm = elm || document;
                        var classes = className.split(" "),
                                classesToCheck = [],
                                elements = (tag === "*" && elm.all)? elm.all : elm.getElementsByTagName(tag),
                                current,
                                returnElements = [],
                                match;
                        for(var k=0, kl=classes.length; k<kl; k+=1){
                                classesToCheck.push(new RegExp("(^|\\s)" + classes[k] + "(\\s|$)"));
                        }
                        for(var l=0, ll=elements.length; l<ll; l+=1){
                                current = elements[l];
                                match = false;
                                for(var m=0, ml=classesToCheck.length; m<ml; m+=1){
                                        match = classesToCheck[m].test(current.className);
                                        if (!match) {
                                                break;
                                        }
                                }
                                if (match) {
                                        returnElements.push(current);
                                }
                        }
                        return returnElements;
                };
        }
        return getElementsByClassName(className, tag, elm);
};

/*---------------------- END Common functions ---------------------------------*/

/*
 * Function called to start the script.
 */
function initScript(step){
	if(window.location != window.parent.location)return false; //page not in iframe
	step = step?step:1;
	//STEP 1:
	if(step<=1){
		l('Initialize script: '+document.location.href, 2);
		if (!GM_xmlhttpRequest) {
			alert('Please upgrade to the latest version of Greasemonkey (>= v0.2.6)');
			return;
		}
		notification = new Notification();
		page = new Page();
		page.initType();
	} 
	//STEP 2:
	if (step<=2){
		l('Initialize username' ,2);
		if(!page.initUser()){
			if(page.isType(page.TYPE.external)){
				l('External page. Request username through Ajax',2);
				requestUsername();
			} else {
				e('(line:1160) No user is logged in');
				notification.write('You need to <a href="http://www.imdb.com/register/login">log in</a> to IMDb for this script to work ', 5000);
			}
			return;
		}
		l('Username initialized: '+page.getUser(),1);
	}
	//STEP 3:
	if(step<=3){
		l('Load movies and categories from cache',2);
		movies = new MovieList();
		movies.load();
		l('Movies loaded from cache: '+movies.array.length,1);
		categories = new CategoryList();
		l('Categories loaded from cache: '+categories.array.length,1);
		if ((movies.array.length==0 && categories.array.length==0)||page.isType(page.TYPE.mymovies)){
			l('Movies OR categories is empty. Rebuilding cache',2);
			rebuildMovieList(false);
			return;
		}
	}
	//STEP 4:
	if (page.initTitle()){ 	
	/* Title page */	
		// when the user votes the page should be updated
		if(vu = document.getElementById('voteuser')){
			vu.addEventListener('DOMNodeInserted',  function(){setTimeout(saveVote,0);}, true); // settimeout is required due to a bug in greasemonkey
		}
		appendCategoryLinks(page.header, page.movie);
		l('Adding category menu to the title page', 2);
		if(!(actionBox = document.getElementById('action-box'))){e('(line:1190) Action-box (in the left menu on IMDb could not be found. Could not add categories menu');return false;}
		var catDiv = document.createElement('div');
		catDiv.className = 'imcm_catlist';	
		catDiv.appendChild(createCategoriesMenu(page.movie));
		actionBox.parentNode.insertBefore(catDiv,actionBox.nextSibling);
	} 
	/* Any page except of My movies page: Change the links on the page */		
	if(movies.array.length==0 || categories.array.length==0)return;
	var links = document.getElementsByTagName('a');
	linkCount=0;
	activeLinks=0;
	for (var i=0; i < links.length; i++) {
		var link = links[i];
		if(movie = getMovieInfo(link.href)){
			if(appendCategoryLinks(link, movie)){activeLinks++;}
			linkCount++;			
		}
	}
	if(linkCount){
		l(linkCount+' imdb links found',1);
		l(activeLinks+' links highlighted',2);
	}
	if(CONFIG.pulldown){
		document.body.addEventListener('click', function(){if(activePulldown!=null){addClassName(activePulldown, 'imcm_hide');}}, true);
	}
	GM_registerMenuCommand(Script.name+' - Rebuild cache', function(){rebuildMovieList(true);});
}

try
{
	function updateCheck(forced)
	{
		if ((forced) || (parseInt(GM_getValue('SUC_last_update', '0')) + 86400000 <= (new Date().getTime()))) // Checks once a day (24 h * 60 m * 60 s * 1000 ms)
		{
			try
			{
				GM_xmlhttpRequest(
				{
					method: 'GET',
					url: 'http://userscripts.org/scripts/source/'+Script.id+'.meta.js?'+new Date().getTime(),
					headers: {'Cache-Control': 'no-cache'},
					onload: function(resp)
					{
						var remote_version, rt;					
						rt=resp.responseText;
						
						GM_setValue('SUC_last_update', new Date().getTime()+'');
						remote_version=/@version\s*(.*?)\s*$/m.exec(rt)[1];
						
						if (remote_version > Script.version)
						{
							if(confirm('There is an update available for the Greasemonkey script "'+Script.name+'."\nWould you like to install now?'))
							{
								GM_openInTab('http://userscripts.org/scripts/source/'+Script.id+'.user.js');
							}
						}
						else if (forced)
						{
							alert('No update is available for "'+Script.name+'."');
						}
					}
				});
			}
			catch (err)
			{
				if (forced)
					alert('An error occurred while checking for updates:\n'+err);
			}
		}
	}
	GM_registerMenuCommand(Script.name + ' - Update check', function()
	{
		updateCheck(true);
	});
	updateCheck(false);
}
catch(err)
{}

initScript();
