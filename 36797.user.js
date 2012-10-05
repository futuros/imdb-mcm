// ==UserScript==
// @name          	IMDb Movie Collection Manager - by Futuros
// @namespace    	http://userscripts.org/
// @description   	Improvements for IMDB My Movies. Now you can REALLY use the imdb page to manage your Must-See lists and collections 
// @copyright		2008+, Futuros
// @license 		Creative Commons Attribution-Share Alike 3.0 Netherlands License; http://creativecommons.org/licenses/by-nc-sa/3.0/nl/
// @version       	3.0.0
// @date		2010-05-13
// @include       	http://*imdb.com/*
// @include       	http://*imdb.de/*
// @exclude       	http://i.imdb.com/*
// @exclude       	http://*imdb.com/images/*
// @exclude       	http://*imdb.de/images/*
// @grant			none
// ==/UserScript==

var Script = {
	name:    	'IMDb Movie Collection Manager',
	version:	'3.0.0',
	id:		36797
};

/* Changelog:
3.0.0 ()
	- Fix: 		Make the script work again with the new imdb layout and movie lists
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
	header: {				// Configuration options for the title name on the movie title page
		highlight: {
			show: true,			// Highlight the title name if in menu or voted for
			color: {
				background: 'silver',	// Background color of the highlight
				text: '',				// not implemented
		},	},
		vote: true,			// Show what you have voted for the movie
		labels: {
			color: {
				background: '', // not implemented
				text: '#606060',// text color of the labels
			},
			show: true,			// show labels on top of the page
			redirect: true,			// use links to go to the mymovies lists instead of deleting from that category
			confirmation: true,	// ask for confirmation when deleting a category with a link; NB: only used when goto:false
	},	},
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
			redirect: false,		// use links to go to the mymovies lists instead of deleting from that category
			confirmation: true	// ask for confirmation when deleting a category with a link; NB: only used when goto:false
	}	},
	vote: {
			high: {text: 'white', bg: 'green'},
			medium: {text: 'black', bg: '#FFCC00'},
			low: {text: 'white', bg: 'red'},
	},
	debug:{
		level: 3,			// prints info to the error console; level 0: nothing (best performance & useability), 1: basic log messages, 2: all debug messages, 3: debug info for scriptwriter; 
		popup: true,		// show notifications when something gets deleted or updated 
		test: (document.location.href.indexOf('tt0278090')!=-1), //automatically go to test mode on Test movie page,			// use test data instead of real data. 
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
var activePulldown;
var pulldowns =1000;

l = function(v,p){p=p||3; if(CONFIG.debug.level>=p)log('['+p+'] '+v);};
e = function(v){if(typeof console=='object'){console.error(v);}else{GM_log('[error] '+v);}};
log = function(v){if(typeof console=='object'){console.info(v);}else{GM_log(v);}};

/*
 * Get the movie info based on a address string
 */
function getMovieInfo(address) {
	tid = address.match(/(?:(?:www|us|italian|uk)\.)?imdb.(?:com|de)(?:(?:\/title\/tt)|(?:\/Title\?))(\d+)\/(?:\w+\/?)?$/);
	if (!tid) return false;
	m = getMovie(tid[1]);
	if(Page.isType(Page.TYPE.title) && Page.movie && m.id == Page.movie.id)return false; // important! Check if page.movie because the page is being checked against this function to.
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
		if(a[1] == 'Recycle Bin' || a[1] == 'Pending')continue;
		li = document.createElement('li');
		li.title = 'Add/Remove: '+a[1];
		li.setAttribute("catid", a[0]);
		li.innerHTML = a[1];
		menu.appendChild(li);
		if(movie.hasCategory(a[0])){
			addClassName(li,'checked');
		}
		li.addEventListener('click', menuClickHandler, false); 
	}
	return menu;
}

/*
 *  Click handler for movie list menu's
 */
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
	IMDB.reqMovieAction(movie,catid,node);
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
			var tag;
			if(type=='vote'){
				tag = document.createElement('span');	
				addClassName(tag, 'imcm_vote imcm_label');
				(value >= 8) ? addClassName(tag, 'imcm_high') : ((value <5) ? addClassName(tag, 'imcm_low') : addClassName(tag, 'imcm_medium'));

				tag.innerHTML = value;
			} else {
				tag = document.createElement('a');	
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
				if(CFG.labels.redirect){
					tag.title = 'Go to the movie list for category: '+cname;
					tag.addEventListener('click', function(ev){
							ev.preventDefault();
							window.location='http://www.imdb.com/mymovies/list?l='+catid;
					}, false);
				} else {
					tag.title = 'Delete movie from category: '+cname;
					tag.addEventListener('click', function(ev){
						var node = ev.currentTarget;
						if(!CFG.labels.confirmation || confirm('Delete movie from '+node.innerHTML+'?')){
							IMDB.reqMovieAction(movie,node.getAttribute('catid')); 
						}
					},false);
				}
				tag.innerHTML = cname;
			}
			sibling=node.nextSibling;
			if(sibling && hasClassName(sibling, 'imcm_pulldown_wrapper'))sibling=sibling.nextSibling;
			node.parentNode.insertBefore(tag, sibling);
		}; // end of function
		
		if(CFG.labels.show && movie.category.length>0){
			for(var j=0; j<movie.category.length;j++){
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
	for(var i=0;i<movieNodes.length;i++){
		node = movieNodes[i];
		if(hasClassName(node, 'label_node')){
			updateCategoryLinks(node,movie);
		} else if(hasClassName(node, 'imcm_menu')){
			elms = node.getElementsByTagName('li');
			for (var h=0;h<elms.length;h++){
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

function saveVote(evt){
	vu = document.getElementById('voteuser');
	if(!vu)return false;
	vote = (vote = vu.innerHTML.match(/^(\d{1,2})$/)) ? parseInt(vote[1]) : 0;
	movie = getMovie(Page.movie.id);
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
	} else if(!Page.isType(Page.TYPE.mymovies)){
		l('Building cache on first script run',1);
		notification.write('Because it\'s the first time this script is run the movie list needs to be updated.');
	} else {
		l('Rebuilding cache - on mymovies page',2);	
	}
	movies.clear();
	IMDB.reqVotes();
	IMDB.reqLists(!command); //!command -> means initScript
}

/*
 * IMDB API object
 * This object is used for interaction with the IMDB website through AJAX
 * Every getMethodName should call the xhr function which sends the response to parseMethodName.
 * 		getMethodName: function getMethodName(){} // only use this format.
 * actionMethodName does not have a callback
 */
var IMDB = {
	prefix: 'http://www.imdb.com/',	
	authorId:'ur13251114',
	check: {name:'49e6c',value:'0c36'},
	counter: { req:0, resp:0}, // counts the number of outstanding/incomming getVotes,getLists,getMovieList calls.
	onInit: false,
	/*
	 * Temporary function to test the IMDB api in isolation
	 */
	test: function(){
		var test = prompt('What do we need to test?','Votes,Lists');
		tests = test.split(',');
		for(i=0,len=tests.length;i<len;i++){
			func= IMDB['req'+tests[i]];
			if(typeof func == 'function')func();
		}
	},
	/*
	 * Requests the votes in a csv format
	 */
	reqVotes: function(){
		if(!IMDB.authorId) throw "authorIdUnknownException";
		var request = {url:'list/export', method:'GET'};
		request.param = {'list_id':'ratings','author_id':IMDB.authorId};
		l(request);
		IMDB.xhr(request);
	},
	/*
	 * Parse the response from the reqVotes call
	 * @param {Object} response The response object from the (succesfull) Ajax call
	 */
	parseVotes: function(response){
		var votesFound=0;
		IMDB.parseCSV(response.responseText, function(lineObj,index){
			movies.add({tid: lineObj.const, vote: lineObj.you_rated});
			votesFound=index+1;
		});
		l(votesFound+' votes found');
		movies.save();
	},
	reqLists: function(onInit){
		if(onInit)IMDB.onInit=true;
		request = {url: 'list/_ajax/wlb_dropdown', method:'GET'};
		request.param = {'tconst':'tt0278090'};
		IMDB.xhr(request);
	},
	parseLists: function(response){
		let cats = [];
		let list = JSON.parse(response.responseText);
		if(!list.items)return;
		for(i=0, j=list.items.length; i<j; i++){
			let item = list.items[i];
			cats.push([item.data_list_id,item.wlb_text.replace("MyMovies: ","")]);
		}
		// watchlist is ommited
		cats.push(['watchlist', 'Watchlist']);
		// save the categories
		categories.set(cats);
		// load the movies for the categories
		IMDB.reqMovieLists();
	},
	/*
	 * For loop over the different categories
	 * Calls reqMovieList for each
	 */
	reqMovieLists: function(){
		categories.array.forEach(function(elm,index, arr){
			l('req Movielist['+elm[0]+']: '+elm[1]);
			IMDB.reqMovieList(elm[0]);
		});
	},
	reqMovieList: function(listId){
		let request = {url: 'list/export', method:'GET'};
		request.param = {'list_id':listId, 'author_id':IMDB.authorId};
		IMDB.xhr(request);
	},
	/*
	 * 
	 */
	parseMovieList: function(response,request){
		IMDB.parseCSV(response.responseText, function(lineObj,index){
			movies.add({tid: lineObj.const, categoryid: request.param.list_id, controlid: 1});
			moviesFound = index+1;
		});
		movies.save();
	},
	/*
	 * 
	 */
	reqMovieAction: function(movie,list_id,handle){
		let request = {url:'list/_ajax/edit'};
		request.param = {
				'const':'tt'+movie.id,
				'list_id':list_id,
				'ref_tag':'title',
		};
		if(movie.hasCategory(list_id)){
			request.param.action='delete';
			request.param.list_item_id=movie.getControlId();
		}
		request.param[IMDB.check.name]=IMDB.check.value;
		request.movie = movie;
		if(handle)request.handle = handle;
		IMDB.xhr(request);
	},
	parseMovieAction: function(response, request){
		json = JSON.parse(response.responseText);
		if(json.status=='200'){
			if(request.param.action=='delete'){ //succesfully deleted
				request.movie.deleteCategory(request.param.list_id);
			} else { //succesfully added
				request.movie.addCategory(request.param.list_id,json.list_item_id);
			}
			movies.save();
			if(request.handle){
				if(request.param.action=='add' && request.movie.hasCategory(request.param.list_id)){
					addClassName(request.handle, 'checked');
				} else if(request.param.action==null && !request.movie.hasCategory(request.param.list_id)){
					removeClassName(request.handle, 'checked');			
				}
			}
			updateStatus(movie);
		}
		removeClassName(request.handle, 'busy');
	},
	/* yet to implement */
	reqAuthorId: function(){},
	parseAuthorId: function(response,request){},
	reqUsername: function(){},
	parseUsername: function(response,request){},
	reqSecurityCheck: function(){},
	parseSecurityCheck: function(response,request){},
	
	/*
	 * Ajax call to IMDB website
	 * 
	 */
	xhr: function(request){
		if(!request.callback){ // if callback is not supplied 
			var callbackName =  IMDB.findProp(function(p){return IMDB[p]===IMDB.xhr.caller;}).substr(3); // create a callback fuction based on the property name of the function calling imdb.xhr 
			l('cn '+callbackName);
			request.callback = IMDB['parse'+callbackName];
			if(callbackName == 'Votes' || callbackName == 'MovieList'){
				IMDB.counter.req++; //increment the number of outstanding calls
			}
		}
		if(typeof request.callback != 'function') throw "invalidCallbackException";
		
		// create a callback function(response, request) to the function request.calback
		request.onload = function(response){
			request.callback(response,request);
			// if all requests completed
			if(callbackName && (callbackName == 'Votes' || callbackName == 'MovieList')){
				if(IMDB.counter.req==1+IMDB.counter.resp++)
					IMDB.finished();
			}
		}; 
		
		request.url = IMDB.prefix+request.url;
		if(request.param)request.data = IMDB.serialize(request.param);
		request.headers = {'Cookie': document.cookie};
		if(request.method=='GET'){
			request.url += (request.param)? '?'+request.data : '';
		} else {
			request.data = encodeURI(request.data);
			request.method = 'POST';
			request.headers['Content-type'] = 'application/x-www-form-urlencoded';
		}
		request.onerror = function(r){e(r.responseText);};
		if(CONFIG.debug.test && !confirm('ajax: '+request.method+' data to: '+request.url))return;
		GM_xmlhttpRequest(request);
	},
	/*
	 * This function is called if all the movies are loaded from the IMDB pages
	 */
	finished: function(){
		l('init: '+onInit);
		let onInit = IMDB.onInit;
		IMDB.onInit=null; // reset forced boolean
		IMDB.counter={}; // reset the counters
		l('init: '+onInit);
		if(onInit){ // if the rebuild script was started on page init
			notification.write('<b>Cache rebuild</b><br />Lists: '+categories.array.length+'<br />Movies: '+movies.array.length, 3000,true);
			Page.initMenus(); // reinitialize the page
		} else {
			window.location.reload(); //reload the page
		}
	},
	/*
	 * Helper function to parse through a csv file.
	 * Calls callback(lineObj) for every line in the csv file
	 * @TODO improve function based on http://code.google.com/p/jquery-csv/source/browse/src/jquery.csv.js
	 * @todo: remove first and last \" from each line
	 */
	parseCSV: function(text,callback){
		var lines = text.split(/\r\n|\n/);
		l(lines.length+' lines');
		var headers = lines.shift().replace(/\s/g,'_').toLowerCase().split('","');
		var count=0;
	    while(lines.length){
	    	data = lines.shift().split('","');
	    	if (data.length == headers.length) {
                var line = {};
                for (var j=0; j<headers.length; j++) {
                	line[headers[j]] = data[j].replace(/\"/g,'');
                }
    	    	callback(line,count++);
	        }
	    }
	},

	serialize: function(obj, prefix){
	    var str = [];
	    for(var p in obj) {
	        var k = prefix ? prefix + "[" + p + "]" : p, v = obj[p];
	        str.push(typeof v == "object" ? 
	            serialize(v, k) :
	            encodeURIComponent(k) + "=" + encodeURIComponent(v));
	    }
	    return str.join("&");
	},
	/*
	 * Loops over all the properties if callback returns true return the property
	 * @return property name
	 */
    findProp: function(callback){
        for(p in IMDB){
            if (IMDB.hasOwnProperty(p) && callback(p))
               return(p);
        }
        return false;
    }
};

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
	this.name = Page.user+'_movies';
	var obj = this;
	
	/*
	  * Load the stored value
	  */
	this.load = function(){
		if(CONFIG.debug.test){
			this.toArray('0278090-1-2:2');
			return;
		}
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
	if(typeof arguments[0] == 'string'){ // construct a new movieObj based on a string: tid-vote-category1-category2-categoryN
		arr = arguments[0].split("-");
		this.id = arr[0].replace("tt","");
		this.vote = parseInt(arr[1]);		
		var i=arr.length;
		while(i>2){
			this.category.push(arr[i-1].split(':'));
			i--;
		}
	} else {
		//from object {tid:, categoryid, vote}
		obj = arguments[0];
		this.id = arguments[0].tid.replace("tt","");
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

	this.moveCategory = function(oldCategoryId, newCategoryId){
		e('Call to deprecated function MovieObj.moveCategory');
		this.addCategory(newCategoryId);
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
 * keeps all the movie lists in an array with key:value is movielistid:name
 * @todo: Rename to MovieLists
 * @todo: Extend from array/object --> iterable
 */
function CategoryList(){
	this.string = "";
	this.array = [];
	this.name = 'imdb+_'+Page.user+'_categories';
	var obj = this;
	
	/*
	  * Get the stored value
	  */
	this.get = function(){
		if(CONFIG.debug.test){
			this.string = '2-test_category';
			this.array = this.toArray();
			return;
		}
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
};

/*
 * Object to handle information about the page if it is a title page
 * There are different types of pages
 * title:		Movie title page /title/tt* || /Title?
 * mymovies:	Movie list page /mymovies/list*
 * imdb:		IMDB Page with movie links
 * external:	External page; not implemented yet
 */
var Page = {
	TYPE: {title: 0, mymovies: 1, imdb: 2, external: 3},
	
	init: function(){
		if(window.location != window.parent.location)return false; //page not in iframe
		l('Initialize script: '+document.location.href, 2);
		notification = new Notification();
		Page.initType();
	},
	
	initType: function(){
		Page.loc = document.location.href;
		if(Page.loc.search(/^http(s)?:\/\/.*\.imdb\.(com|de)\//)==-1){
			Page.type = Page.TYPE.external;
		} else	if(Page.loc.search(/\/user/)!=-1){
			Page.type = Page.TYPE.mymovies;
		} else	if(Page.loc.search(/\/list/)!=-1){
			Page.type = Page.TYPE.mymovies;
		} else if(Page.loc.search(/(\/title\/tt\d+)|(\/Title\?\d+)/)!=-1){
			Page.type = Page.TYPE.title;
		} else {
			Page.type = Page.TYPE.imdb;
		}
		l('Page type: '+Page.type);
		Page.initUser();
	},
	/*
	 * Get the Username
	 * Get the AuthorId
	 * Get the Security Checks
	 */
	initUser: function(){
		l('Initialize username' ,2);
		if(!Page.user){
			var account = document.getElementById('nb15personal') || document.getElementById('nb_personal');
			if (account) {
				var result = account.innerHTML.match(/\s*([^>]+)'s account/i);
				if (result && result[1]) {
					Page.user = result[1];
				} else {
					if(Page.isType(Page.TYPE.external)){
						l('External page. Send them to IMDB',2);
						notification.write('You need to visit an IMDB page first before you can use this script on external sites. <a href="http://www.imdb.com/">Imdb.com</a>', 5000);
					} else {
						e('(line:1160) No user is logged in');
						notification.write('You need to <a href="http://www.imdb.com/register/login">log in</a> to IMDb for this script to work ', 5000);
					}
					return;
				}
			}
		}
		l('Username initialized: '+Page.user,1);
		Page.initMenus();
	},
	initMenus: function(){
		l('Init menus',2);
		//if(Page.isType(Page.TYPE.mymovies)){ //mymovies page
			
			 //@TODO: Add button/menu for cache reload 
			 //We should reload the cache on every page view.
			 //We can add a button in the top corner. And if we push it the cache gets reloaded.
			 //
		//}
		Page.initCaches();
	},
	initCaches: function(){
		l('Load movies and categories from cache',2);
		movies = new MovieList();
		movies.load();
		l('Movies loaded from cache: '+movies.array.length,1);
		categories = new CategoryList();
		l('Categories loaded from cache: '+categories.array.length,1);
		if(movies.array.length==0 || categories.array.length==0){
			l('Movies OR categories are empty. Rebuilding cache',2);
			//IMDB.rebuild(false);
			rebuildMovieList();
			return;
		} else {
			Page.initLinks();
		}
	},
	initLinks: function(){
		Page.start(); //we need to start this first otherwise the script fails
		l('init links on page',2);
		var links = document.getElementsByTagName('a');
		linkCount=0;
		activeLinks=0;
		l('links found:'+links.length);
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
		l('eind links');
		//Page.start();
	},
	start: function(){
		l('start switcher');
		switch(Page.type){
			case Page.TYPE.title:
				Page.startTitle();
			break;
			case Page.TYPE.mymovies:
				Page.startMymovies();
			break;
			case Page.TYPE.imdb:
				Page.startOther();
			break;
			case Page.TYPE.external:
				Page.startExternal();
			break;
		}
	},
	startTitle: function(){
		l('start title page');
		if(Page.initHeader()){ //Title page
			// when the user votes the page should be updated
			if(vu = document.getElementById('voteuser')){
				vu.addEventListener('DOMNodeInserted',  function(){setTimeout(saveVote,0);}, true); // settimeout is required due to a bug in greasemonkey
			}
			appendCategoryLinks(Page.header, Page.movie);
			l('Adding category menu to the title page', 2);
			if(!(sideBar = document.getElementById('maindetails_sidebar_bottom'))){e('(line:1237) maindetails_sidebar_bottom could not be found. Could not add categories menu');return false;}
			var catDiv = document.createElement('div');
			catDiv.className = 'imcm_catlist aux-content-widget-2';	
			catDiv.appendChild(createCategoriesMenu(Page.movie));
			sideBar.insertBefore(catDiv,sideBar.firstChild);
			
			if(CONFIG.debug.test)IMDB.test();
		}
	},
	initHeader: function(){
		l('init header');
		if(!Page.isType(Page.TYPE.title) || !Page.initMovie())return false;
		h1s = document.getElementsByTagName('h1');
		if(h1s.length==1){
			Page.header=h1s[0];
			l('header found');
			return true;
		} else {
			e('(line:801) no header found on page with type title');
			return false;
		}
	},
	initMovie: function(){
		l('init movie');
		return Page.movie = getMovieInfo(Page.loc);
	},
	isType: function(type){
		return Page.type==type;
	}
};

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

function GM_addStyle(aCss) {
	  'use strict';
	  let head = document.getElementsByTagName('head')[0];
	  if (head) {
	    let style = document.createElement('style');
	    style.setAttribute('type', 'text/css');
	    style.textContent = aCss;
	    head.appendChild(style);
	    return style;
	  }
	  return null;
	}

	const GM_log = console.log;

// This naive implementation will simply fail to do cross-domain requests,
// just like any javascript in any page would.
function GM_xmlhttpRequest(aOpts) {
  'use strict';
  let req = new XMLHttpRequest();

  __setupRequestEvent(aOpts, req, 'abort');
  __setupRequestEvent(aOpts, req, 'error');
  __setupRequestEvent(aOpts, req, 'load');
  __setupRequestEvent(aOpts, req, 'progress');
  __setupRequestEvent(aOpts, req, 'readystatechange');

  req.open(aOpts.method, aOpts.url, !aOpts.synchronous,
      aOpts.user || '', aOpts.password || '');
  if (aOpts.overrideMimeType) {
    req.overrideMimeType(aOpts.overrideMimeType);
  }
  if (aOpts.headers) {
    for (let prop in aOpts.headers) {
      if (Object.prototype.hasOwnProperty.call(aOpts.headers, prop)) {
        req.setRequestHeader(prop, aOpts.headers[prop]);
      }
    }
  }
  let body = aOpts.data ? aOpts.data : null;
  if (aOpts.binary) {
    return req.sendAsBinary(body);
  } else {
    return req.send(body);
  }
}

function __setupRequestEvent(aOpts, aReq, aEventName) {
  'use strict';
  if (!aOpts['on' + aEventName]) return;

  aReq.addEventListener(aEventName, function(aEvent) {
    let responseState = {
      responseText: aReq.responseText,
      responseXML: aReq.responseXML,
      readyState: aReq.readyState,
      responseHeaders: null,
      status: null,
      statusText: null,
      finalUrl: null
    };
    switch (aEventName) {
      case "progress":
        responseState.lengthComputable = aEvent.lengthComputable;
        responseState.loaded = aEvent.loaded;
        responseState.total = aEvent.total;
        break;
      case "error":
        break;
      default:
        if (4 != aReq.readyState) break;
        responseState.responseHeaders = aReq.getAllResponseHeaders();
        responseState.status = aReq.status;
        responseState.statusText = aReq.statusText;
        break;
    }
    aOpts['on' + aEventName](responseState);
  });
}

const __GM_STORAGE_PREFIX = [
    '', GM_info.script.namespace, GM_info.script.name, ''].join('***');

// All of the GM_*Value methods rely on DOM Storage's localStorage facility.
// They work like always, but the values are scoped to a domain, unlike the
// original functions.  The content page's scripts can access, set, and
// remove these values.  A
function GM_deleteValue(aKey) {
  'use strict';
  localStorage.removeItem(__GM_STORAGE_PREFIX + aKey);
}

function GM_getValue(aKey, aDefault) {
  'use strict';
  let val = localStorage.getItem(__GM_STORAGE_PREFIX + aKey);
  if (null === val && 'undefined' != typeof aDefault) return aDefault;
  return val;
}

function GM_listValues() {
  'use strict';
  let prefixLen = __GM_STORAGE_PREFIX.length;
  let values = [];
  for (let i = 0; i < localStorage.length; i++) {
    let k = localStorage.key(i);
    if (k.substr(0, prefixLen) === __GM_STORAGE_PREFIX) {
      values.push(k.substr(prefixLen));
    }
  }
  return values;
}

function GM_setValue(aKey, aVal) {
  'use strict';
  localStorage.setItem(__GM_STORAGE_PREFIX + aKey, aVal);
}
function GM_registerMenu(){return;}
function GM_openInTab(){return;}

Page.init();
