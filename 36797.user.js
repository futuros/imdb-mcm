// ==UserScript==
// @name          	IMDb Movie Collection Manager - by Futuros
// @namespace    	http://userscripts.org/
// @description   	Improvements for IMDB My Movies. Now you can REALLY use the imdb page to manage your Must-See lists and collections 
// @copyright		2008+, Futuros
// @license 		Creative Commons Attribution-Share Alike 3.0 Netherlands License; http://creativecommons.org/licenses/by-nc-sa/3.0/nl/
// @version       	3.0beta
// @match			http://*.imdb.com/*
// @match			http://*.imdb.de/*
// @exclude       	http://i.imdb.com/*
// @exclude       	http://*imdb.com/images/*
// @exclude       	http://*imdb.de/images/*
// @require			http://ajax.googleapis.com/ajax/libs/jquery/1.8.2/jquery.min.js
// @grant			none
// @updateURL       https://github.com/futuros/imdb-mcm/blob/master/36797.meta.js
// @downloadURL     https://github.com/futuros/imdb-mcm/blob/master/36797.user.js
// ==/UserScript==

var Script = {
	name: 'IMDb Movie Collection Manager',
};

/* 
	Go to: http://userscripts.org/scripts/show/36797
	   or: http://github.com/futuros/imdb-mcm
	
	Got some ideas? Found a bug?
	Leave a comment or submit on issue!!

	Changelog: http://github.com/futuros/imdb-mcm/blob/master/changelog.txt
	Roadmap:   http://github.com/futuros/imdb-mcm/blob/master/roadmap.txt

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
		level: 2,			// prints info to the error console; level 0: nothing (best performance & useability), 1: basic log messages, 2: all debug messages, 3: debug info for scriptwriter; 
		popup: true,		// show notifications when something gets deleted or updated 
		test: (document.location.href.indexOf('tt0278090')!=-1), //automatically go to test mode on Test movie page,			// use test data instead of real data. 
}	};

var IMAGES = {
	checked: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAGrSURBVDjLvZPZLkNhFIV75zjvYm7VGFNCqoZUJ+roKUUpjRuqp61Wq0NKDMelGGqOxBSUIBKXWtWGZxAvobr8lWjChRgSF//dv9be+9trCwAI/vIE/26gXmviW5bqnb8yUK028qZjPfoPWEj4Ku5HBspgAz941IXZeze8N1bottSo8BTZviVWrEh546EO03EXpuJOdG63otJbjBKHkEp/Ml6yNYYzpuezWL4s5VMtT8acCMQcb5XL3eJE8VgBlR7BeMGW9Z4yT9y1CeyucuhdTGDxfftaBO7G4L+zg91UocxVmCiy51NpiP3n2treUPujL8xhOjYOzZYsQWANyRYlU4Y9Br6oHd5bDh0bCpSOixJiWx71YY09J5pM/WEbzFcDmHvwwBu2wnikg+lEj4mwBe5bC5h1OUqcwpdC60dxegRmR06TyjCF9G9z+qM2uCJmuMJmaNZaUrCSIi6X+jJIBBYtW5Cge7cd7sgoHDfDaAvKQGAlRZYc6ltJlMxX03UzlaRlBdQrzSCwksLRbOpHUSb7pcsnxCCwngvM2Rm/ugUCi84fycr4l2t8Bb6iqTxSCgNIAAAAAElFTkSuQmCC',
	unchecked: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAIhSURBVDjLlZPrThNRFIWJicmJz6BWiYbIkYDEG0JbBiitDQgm0PuFXqSAtKXtpE2hNuoPTXwSnwtExd6w0pl2OtPlrphKLSXhx07OZM769qy19wwAGLhM1ddC184+d18QMzoq3lfsD3LZ7Y3XbE5DL6Atzuyilc5Ciyd7IHVfgNcDYTQ2tvDr5crn6uLSvX+Av2Lk36FFpSVENDe3OxDZu8apO5rROJDLo30+Nlvj5RnTlVNAKs1aCVFr7b4BPn6Cls21AWgEQlz2+Dl1h7IdA+i97A/geP65WhbmrnZZ0GIJpr6OqZqYAd5/gJpKox4Mg7pD2YoC2b0/54rJQuJZdm6Izcgma4TW1WZ0h+y8BfbyJMwBmSxkjw+VObNanp5h/adwGhaTXF4NWbLj9gEONyCmUZmd10pGgf1/vwcgOT3tUQE0DdicwIod2EmSbwsKE1P8QoDkcHPJ5YESjgBJkYQpIEZ2KEB51Y6y3ojvY+P8XEDN7uKS0w0ltA7QGCWHCxSWWpwyaCeLy0BkA7UXyyg8fIzDoWHeBaDN4tQdSvAVdU1Aok+nsNTipIEVnkywo/FHatVkBoIhnFisOBoZxcGtQd4B0GYJNZsDSiAEadUBCkstPtN3Avs2Msa+Dt9XfxoFSNYF/Bh9gP0bOqHLAm2WUF1YQskwrVFYPWkf3h1iXwbvqGfFPSGW9Eah8HSS9fuZDnS32f71m8KFY7xs/QZyu6TH2+2+FAAAAABJRU5ErkJggg==',
	loading: 'data:image/gif;base64,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%3D%3D',
};

//Global variabels
var movies; // object with all the movies in the my movies list
var categories; // object with all the categories
var activePulldown;
var pulldowns =1000;

this.$ = this.jQuery = jQuery.noConflict(true);
var Log = {
	array: [],
	show: function(singleLine){
		if(singleLine){
			return Log.array;
		}
		Log.array.forEach(function(msg){console.log(msg)});
		return false;
	},
	add: function(msg){
		Log.array.push(msg);
		return msg;
	},
	error: console.error,
};
// some log shorthand codes
var	l = (CONFIG.debug.level>0) ? console.info : Log.add, l1= l,	l2= (CONFIG.debug.level>=2) ? console.info : Log.add, l3= (CONFIG.debug.level>=3) ? console.info : Log.add,	_c = console.log, _d = console.debug;

// Styles
$('head').append('<style type="text/css">/* Inserted By Greasemonkey userscript ('+Script.name+'): */\
	h1.imcm_highlight {font-weight: bold; color: black !important; background-color:'+CONFIG.header.highlight.color.background+';} \
	a.imcm_highlight {font-weight: bold; color: black !important; background-color:'+CONFIG.links.highlight.color.background+';} \
	.imcm_catlist { width: auto; color: black; text-align:left;} \
	.imcm_hide {display:none; height: 0px;} \
	.imcm_failed {border-color: red!important; background-color:pink!important;} \
	.imcm_notification {background-color:#BCC4F5;padding:4px 10px 6px; font-color:black;font-size:0.8em; font-family: verdana,sans-serif; display:none; z-index:99999; position:fixed; top:0px; left: 5%; height: auto; width: 90%; border-radius: 0 0 5px 5px;border-right:2px solid #eee; border-left: 2px solid #eee; border-bottom:2px solid #eee; transparency:80%; box-shadow:0 2px 4px rgba(0,0,0,0.1);} \
	.error {background-color: #F5A4AC; font-color: #DE1024; font-weight:bolder;} \
	a.label_node .imcm_label {padding: 5px; color: '+CONFIG.links.labels.color.text+' !important;} \
	h1.label_node .imcm_label {padding: 5px; color: '+CONFIG.header.labels.color.text+' !important;} \
	.imcm_vote {margin:2px; padding-left:2px; padding-right:2px;} \
	#tn15title .imcm_vote {font-size:1.5em;font-weight:bold;padding-right:5px;padding-left:5px; margin-left:0px;} \
	.imcm_high {background-color: '+CONFIG.vote.high.bg+'; color: '+CONFIG.vote.high.text+';} \
	.imcm_medium {background-color: '+CONFIG.vote.medium.bg+'; color: '+CONFIG.vote.medium.text+';} \
	.imcm_low {background-color: '+CONFIG.vote.low.bg+'; color: '+CONFIG.vote.high.text+';} \
	.imcm_pulldown_wrapper {position: relative;} \
	.imcm_pulldown_link {position: relative;padding:0 5px 0 5px; font-size:.8em;cursor:pointer;} \
	.imcm_pulldown {position:absolute; top:.9em; right:0px; background-color: white; border: 1px solid black;} \
	.imcm_pulldown a {position:absolute; top:2px; right:2px; font-size:12px; line-height:12px; font-weight:bolder; background-color: white;cursor:pointer;border:1px solid black; border-radius: 10px 10px 10px 10px;padding:0 3px 1px;} \
	.imcm_menu { min-width:130px;margin: 0; padding:0px; list-style: none;} \
	.imcm_menu li{font-weight:bolder;background-image:url('+IMAGES.unchecked+');padding: 2px 21px;background-repeat:no-repeat;background-position:2px center;height:16px;display:block;cursor:pointer;cursor:hand;margin:auto;} \
	.imcm_menu li:hover{background-color:#ddd!important;} \
	.imcm_menu li.checked{background-color:#eee;background-image:url('+IMAGES.checked+');} \
	.imcm_menu li.busy{background-color:#fff !important;color:gray;cursor:wait!important;background-image:url('+IMAGES.loading+')!important;} \
</style>');

/*
 * Create a menu element with all the categories as list items.
 * @param 	movie	a MovieObj which the form field will add/remove to the categories
 * @return	html	returns a html menu element or false if a menu with the id already exists.
 */
function createCategoriesMenu(movie){
	var menu = $('<ul></ul>', {
		name:    'cats_'+movie.id,
		'movid': movie.id,
		'class': 'imcm_menu movie'+movie.id,
	});	
	for(var i in categories.array){
		var a = categories.array[i];
		let li = $('<li></li>', {
			title:  'Add/Remove: '+a[1],
			'catid': a[0],
			html: a[1],
		})
		.click(function(){
			node = $(this);
			if(node.hasClass('busy')){return false;}
			movie = movies.get(node.parent().attr('movid'));
			node.addClass('busy');
			IMDB.reqMovieAction(movie,node.attr('catid'))
				.success(function(){node.toggleClass('checked',this.movie.hasCategory(this.data.list_id));})
				.complete(function(){node.removeClass('busy');});
			return false;
		})		
		.toggleClass('checked', movie.hasCategory(a[0]))
		.appendTo(menu);
	}
	return menu;
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
	var isHeader = !node.is('A');
	node.addClass('label_node movie'+movie.id);
	highlighted = updateCategoryLinks(node, movie);
	if(CONFIG.links.pulldown && !isHeader && (changeMenu = createCategoriesMenu(movie))){
		$('<span />').addClass('imcm_pulldown_wrapper')
		.append(
			$('<div />', {
				'class':'imcm_pulldown imcm_catlist',
				mouseover: function(ev){activePulldown=null;}, 
				mouseout: function(ev){activePulldown=this;},
				css: {'zIndex': pulldowns--}
			}).hide()
			.append(changeMenu)
			.append($('<a>x</a>').click(function(){$(this).parent().hide('slow');activePulldown=null;return false;}))
		).append(
			$('<a class="imcm_pulldown_link">&#9660;</a>')
			.click(function(){var ap=$(this).parent().find('.imcm_pulldown');if(activePulldown){$(activePulldown).hide();} activePulldown=ap;ap.show('slow');return false;})
		).insertAfter(node);
		$(document).click(function(){$(activePulldown).hide('slow');activePulldown=null;});
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
	var isHeader = !node.is('A');
	var CFG = isHeader ? CONFIG.header : CONFIG.links;
	// Remove nodes currently added to the nodes parentnode
	node.parent().find('.imcm_label').remove();
	if(movie.isActive()){ // if the movie contains a vote or is added to a movielist
		node.addClass('imcm_highlight');
		if(CFG.labels.show && movie.category.length>0){ // show the movieList labels
			for(var j=0; j<movie.category.length;j++){
				// append the movieList label 
				var settings = {'class':'imcm_label', catid: movie.category[j][0]};
				settings.html = categories.getName(settings.catid);
				settings.href = '#'+settings.catid;
				if(CFG.labels.redirect){ // onclick redirect to movielist
					settings.title = 'Go to the movie list for category: '+settings.html;
					settings.click = function(){
						Notification.error('This is not yet working. Movielist id:'+$(this).attr('catid'));	
						//window.location='http://www.imdb.com/mymovies/list?l='+catid;
					};
				} else { // onclick, ask to remove from movielist
					settings.title = 'Delete movie from category: '+settings.html;
					settings.click = function(){
						if(!CFG.labels.confirmation || confirm('Delete movie from '+$(this).html()+'?')){
							IMDB.reqMovieAction(movie,$(this).attr('catid')); 
						}
						return false;
					};
				}
				$('<a />', settings).insertAfter(node);
			}
		} //end: add movieList label
		// Add a vote to the node
		if(CFG.vote && movie.vote>0){
			var className = (movie.vote >= 8) ? 'imcm_high' : ((movie.vote <5) ? 'imcm_low' :'imcm_medium');
			tag = $('<span />').addClass('imcm_vote imcm_label '+className)
			.html(movie.vote)
			.insertAfter(node);
		}
		return true; // movie should be highlighted
	} else { // movie should not be highlighted
		node.removeClass('imcm_highlight');
		return false;
	}	
}

/*
 * Update the status of the movie for all links refering to the specified movie.
 */
function updateStatus(movie){
	l2('Updating all links and headers for movie: '+movie.id);
	$('.movie'+movie.id+'.label_node').each(function(){updateCategoryLinks($(this),movie);});
	$('.movie'+movie.id+'.imcm_menu').find('li').each(function(){
		$(this).toggleClass('checked', movie.hasCategory($(this).attr('catid')));
	});
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
	_const: 'tt0278090', // random valid const.
	authorId:null,
	watchlistId:null,
	check:null,
	counter: { req:0, resp:0}, // counts the number of outstanding/incomming getVotes,getLists,getMovieList calls.
	onInit: false,
	/*
	 * Temporary function to test the IMDB api in isolation
	 */
	test: function(commands){
		var test = commands || prompt('What do we need to test?','Votes,Lists');
		if(!test)return;
		movies.clear();
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
		return IMDB.xhr({
			url: 'list/export',
			data: {'list_id':'ratings', 'author_id':IMDB.authorId},
			dataFilter: IMDB.csvFilter,
		});
	},
	/*
	 * Parse the response from the reqVotes call
	 * @param {Object} response The response object from the (succesfull) Ajax call
	 */
	parseVotes: function(response){
		for(var i=0,j=response.length;i<j;i++){
			movies.add({tid: response[i].const, vote: response[i].you_rated});
		};
		l2(response.length+' votes found');
		movies.save();
	},
	reqLists: function(){
		return IMDB.xhr({
				url: 'list/_ajax/wlb_dropdown',
				data: {'tconst':IMDB._const}
		});
	},
	parseLists: function(response){
		let cats = [];
		if(!response.items)return;
		for(var i=0, j=response.items.length; i<j; i++){
			let item = response.items[i];
			cats.push([item.data_list_id,item.wlb_text.replace("MyMovies: ","")]);
		}
		// watchlist is ommited
		cats.push([IMDB.watchlistId, 'Watchlist']);
		// save the categories
		categories.set(cats);
	},
	/*
	 * For loop over the different categories
	 * Calls reqMovieList for each
	 */
	reqMovieLists: function(){
		var calls = [];
		categories.array.forEach(function(elm,index, arr){
			l3('req Movielist['+elm[0]+']: '+elm[1]);
			calls.push(IMDB.reqMovieList(elm[0]));
		});
		return $.when.apply($,calls);
	},
	reqMovieList: function(listId){
		return IMDB.xhr({
					url: 'list/export',
					data: {'list_id':listId, 'author_id':IMDB.authorId},
					dataFilter: IMDB.csvFilter,
		});
	},
	/*
	 * 
	 */
	parseMovieList: function(response){
		let list_id=this.data.list_id;
		for(var i=0,j=response.length;i<j;i++){
			movies.add({tid: response[i].const, categoryid: list_id, controlid: 1});
		}
		movies.save();
	},
	/*
	 * 
	 */
	reqMovieAction: function(movie,list_id){
		let request = {url:'list/_ajax/edit', type:'POST'};
		request.data = {
				'const':'tt'+movie.id,
				'list_id':list_id,
				'ref_tag':'title',
		};
		if(movie.hasCategory(list_id)){
			request.data.action='delete';
			request.data.list_item_id=movie.getControlId(list_id);
		}
		request.data[IMDB.check.name]=IMDB.check.value;
		request.movie = movie;
		return IMDB.xhr(request);
	},
	parseMovieAction: function(response){
		if(response.status=='200'){
			if(this.data.action=='delete'){ //succesfully deleted
				this.movie.deleteCategory(this.data.list_id);
			} else { //succesfully added
				this.movie.addCategory(this.data.list_id,response.list_item_id);
			}
			movies.save();
			updateStatus(movie);
		}
	},
	reqAuthorId: function(){
		return IMDB.xhr({
			url: 'widget/recommendations/_ajax/get_title_info',
			data: {'tconst':IMDB._const},
			type: 'POST',
		});
	},
	parseAuthorId: function(response){
		if(response.status=='200'){
			Storage.set('authorId', IMDB.authorId = response.rating_info.uconst);
		}
	},

	reqSecurityCheck: function(){
		return IMDB.xhr({
			url: 'list/_ajax/watchlist_has',
			data: {'consts':[IMDB._const]},
			type: 'POST',
		});
	},
	parseSecurityCheck: function(response){
		if(response.status=='200'){
			Storage.set('watchlistId', IMDB.watchlistId = response.list_id);
			Storage.set('securityCheck', IMDB.check = response.extra);
		}
	},
	
	/*
	 * Ajax call to IMDB website
	 * 
	 */
	xhr: function(request){
		request.type = request.type||'GET';
		request.url = IMDB.prefix+request.url;
		if(CONFIG.debug.test && !confirm('ajax: '+request.type+' data to: '+request.url))return;

		if(!request.callback){ // if callback is not supplied 
			var callbackName = IMDB.findProp(function(p){return IMDB[p]===IMDB.xhr.caller;}).substr(3); // create a callback fuction based on the property name of the function calling imdb.xhr 
			request.callback = IMDB['parse'+callbackName];
		}
		if(typeof request.callback != 'function') throw "invalidCallbackException";
		
		request.success = request.callback;
		request.headers = {'Cookie': document.cookie};
		request.error = function(r){Log.error(r.responseText);};
		let settings = request;
		settings.context=request;
		return $.ajax(settings);
	},
	/*
	 * Rebuild all caches.
	 * @param {boolean} onInit: whether or not the call came from the Page.initCache
	 */
	rebuild: function(onInit){
		if(onInit){ // Automatic request on script init
			IMDB.onInit=true;
			l1('Building cache on first script run');
			Notification.write('Because it\'s the first time this script is run the movie list needs to be updated.');
		} else { // Manuel request
			l2('Rebuilding cache - manual request');
			Notification.write('Updating the movie list.');
		}
		movies.clear(); // clear the current cache.
		$.when(IMDB.reqAuthorId(),IMDB.reqSecurityCheck()).done(function(){
			$.when(IMDB.reqLists()).done(function(){
				$.when(IMDB.reqMovieLists(),IMDB.reqVotes())
					.done(IMDB.finished)
					.fail(IMDB.failed);
			}).fail(IMDB.failed);
		}).fail(IMDB.failed);
	},
	/*
	 * This function is called if all the movies are loaded from the IMDB pages
	 */
	finished: function(){
		l2('All callbacks for the rebuild script have finished');
		let onInit = IMDB.onInit;
		IMDB.onInit=null; // reset onInit boolean
		if(onInit){ // if the rebuild script was started on page init
			Notification.write('<b>Cache rebuild</b><br />Lists: '+categories.array.length+'<br />Movies: '+movies.array.length, 8000,true);
			Page.initCaches(); // reinitialize the page
		} else {
			if(!CONFIG.debug.test){
				window.location.reload(); //reload the page
			}
		}
	},
	/*
	 * If any request from IMDB.rebuild fails this function is called
	 */
	failed: function(){
		IMDB.onInit=null; // reset onInit boolean
		Notification.write('<b>Cache rebuild</b><br />Lists: '+categories.array.length+'<br />Movies: '+movies.array.length, 8000,true);
		Log.error('Some request failed',this);
	},
	/*
	 * Transform CSV data in Array with Objects{name:value,...}
	 */
	csvFilter: function(data,dataType){
		var lines = data.split(/\r\n|\n/);
		var result = [];
		var headers = lines.shift().replace(/\s/g,'_').toLowerCase().split('","');
	    while(lines.length){
	    	data = lines.shift().split('","');
	    	if (data.length == headers.length) {
                var line = {};
                for (var j=0; j<headers.length; j++) {
                	line[headers[j]] = data[j].replace(/\"/g,'');
                }
    	    	result.push(line);
	        }
	    }
	    return result;
	},
	setWatchlist: function(value){
		return IMDB.watchlistId = value; 
	},
	setSecurity: function(value){
		return IMDB.check = value; 
	},
	setAuthorId: function(value){
		return IMDB.authorId = value; 
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
var Notification = {
	_timer:null,	
	_init: function(){
		Notification._node = $('<div class="imcm_notification"></div>');
		Notification._node.appendTo('body')
			.on('click', Notification._hide);
	},
	_write:function(text, maxtime, append){
		if(Notification._timer)clearTimeout(Notification._timer);
		if(append)
			Notification._node.append('<br />'+text);
		else
			Notification._node.html(text);
		Notification._show();
		if(maxtime>0){
			Notification._timer=setTimeout(Notification._hide,maxtime);
		}
	},
	write:function(text, maxtime, append){
		if(!Notification._node)Notification._init();
		Notification._node.removeClass('error');
		Notification._write(text,maxtime,append);
	},
	debug: function(text, maxtime){
		if(CONFIG.debug.popup)Notification.write(text, maxtime);
	},
	error: function(text){
		if(!Notification._node)Notification._init();
		Notification._node.addClass('error');
		Notification._write('<h3>ERROR:</h3><p>'+text+'</p>');
	},
	_show: function(){
		Notification._node.show('slow');
	},
	
	_hide: function(){
		Notification._node.hide('slow');
	}
};

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
		var stored = Storage.get('imdb+_'+this.name); //read from browser
		if(stored != undefined)		
			this.toArray(stored);
	}
	
	this.save = function(){
		var store = this.toString();
		Storage.set('imdb+_'+this.name, store); //write to browser
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
		if(exists = this.exists(movie)){
			return exists.merge(movie);
		} else {
			this.array.push(movie);
			return movie;
		}
	}
	
	/*
	  * Checks if a movie exists in the array
	  * @return {boolean} False if not exists, movieObj
	  */
	this.exists = function(movie){
		if((i=this.array.length)>0){		
			do{
				if(this.array[i-1].equals(movie))return this.array[i-1];
				i--;
			}
			while(i>0)
		}
		return false;
	}
	
	this.get = function(id){
		if(movie = this.exists(id))
			return movie;
		else
			return this.add({tid: id});
	}
	
	this.getByAddress = function(address) {
		tid = address.match(/(?:(?:www|us|italian|uk)\.)?imdb.(?:com|de)(?:(?:\/title\/tt)|(?:\/Title\?))(\d+)\/(?:\w+\/?)?$/);
		if (!tid) return false;
		return this.get(tid[1]);
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
		var obj = arguments[0];
		this.id = obj.tid.replace("tt","");
		this.vote = obj.vote || 0;
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
		if(!this.equals(obj))return this;
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
			if(this.category[i][0]==category)
				return this.category[i][1];
		}
		Log.error('(line:833) Failed to get control id for movie:'+this.id+' and category:'+category);
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
	
	/*
	  * Get the stored value
	  */
	this.get = function(){
		var stored = Storage.get(this.name); //read from browser
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
		Storage.set(this.name, this.string); //write to browser
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
		l2('Initialize script: '+document.location.href);
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
		l1('Page type: '+Page.type);
		Page.initUser();
	},
	/*
	 * Get the Username
	 * Get the AuthorId
	 * Get the Security Checks
	 */
	initUser: function(){
		l2('Initialize username' ,2);
		if(!Page.user){
			var account = document.getElementById('nb15personal') || document.getElementById('nb_personal');
			if (account) {
				var result = account.innerHTML.match(/\s*([^>]+)'s account/i);
				if (result && result[1]) {
					Page.user = result[1];
				} else {
					if(Page.isType(Page.TYPE.external)){
						l2('External page. Send them to IMDB',2);
						Notification.write('You need to visit an IMDB page first before you can use this script on external sites. <a href="http://www.imdb.com/">Imdb.com</a>');
					} else {
						Log.error('(line:1160) No user is logged in');
						Notification.write('You need to <a href="http://www.imdb.com/register/login">log in</a> to IMDb for this script to work ');
					}
					return;
				}
			}
		}
		l1('Username initialized: '+Page.user);
		Page.initMenus();
	},
	initMenus: function(){
		l3('Init menus');
		//if(Page.isType(Page.TYPE.mymovies)){ //mymovies page
			
			 //@TODO: Add button/menu for cache reload 
			 //We should reload the cache on every page view.
			 //We can add a button in the top corner. And if we push it the cache gets reloaded.
			 //
		//}
		Page.initCaches();
	},
	initCaches: function(){
		if(IMDB.setAuthorId(Storage.get('authorId')) && IMDB.setWatchlist(Storage.get('watchlistId')) && IMDB.setSecurity(Storage.get('securityCheck'))){
			l2('Load movies and categories from cache');
			movies = new MovieList();
			movies.load();
			l1('Movies loaded from cache: '+movies.array.length);
			categories = new CategoryList();
			l1('Categories loaded from cache: '+categories.array.length);
			if(movies.array.length!=0 && categories.array.length!=0){
				window.IMDB_MCM.Movies = movies;
				window.IMDB_MCM.Categories = categories;
				return Page.initLinks();
			}
		}
		IMDB.rebuild(true);
		return false;
	},
	initLinks: function(){
		l2('init links on page');
		linkCount=0;
		activeLinks=0;
		$('A').each(function(){
			var movie;
			if((movie = movies.getByAddress(this.href)) && !movie.equals(Page.getMovie())){
				if(appendCategoryLinks($(this), movie)){activeLinks++;}
				linkCount++;			
			}
		});
		if(linkCount){
			l3(linkCount+' imdb links found');
			l2(activeLinks+' links highlighted');
		}
		if(CONFIG.pulldown){
			document.body.addEventListener('click', function(){if(activePulldown!=null){$(activePulldown).addClass('imcm_hide');}}, true);
		}
		Page.start();
	},
	start: function(){
		l3('start switcher');
		switch(Page.type){
			case Page.TYPE.title:
				Page.startTitle();
			break;
			case Page.TYPE.mymovies:
				//Page.startMymovies();
			break;
			case Page.TYPE.imdb:
				//Page.startOther();
			break;
			case Page.TYPE.external:
				//Page.startExternal();
			break;
		}
	},
	startTitle: function(){
		l3('start title page');
		if(movie = Page.getMovie()){ //Title page
			// when the user votes the page should be updated
			var submitted = false;
			var deleting = false;
			$('.rating-cancel').on('click', function(){deleting =true;});
			$('.rating-cancel').on('DOMSubtreeModified', function(){
				if($(this).hasClass('rating-pending')){ // a vote has been submitted, waiting for result
					submitted=true;
				} else if(submitted){ // node no longer marked as pending, but something was submitted
					vote = (deleting)?0:$(this).prev().children().first().html();
					submitted=deleting=false;
					if(movie.vote!=vote){
						movie.setVote(vote);
						movies.save();
						l2('Vote changed to '+movie.vote);
						updateStatus(movie);
					}
				} // else {do nothing, just a hover over the votes}
			});
			// --end of vote code
			
			appendCategoryLinks($('h1').first(), movie);
			l2('Adding category menu to the title page');

			$('<div />').addClass('imcm_catlist aux-content-widget-2')
				.append(createCategoriesMenu(movie))
				.prependTo('#maindetails_sidebar_bottom');
			
			if(CONFIG.debug.test)IMDB.test();
		}
	},
	isType: function(type){
		return Page.type==type;
	},
	getMovie: function(){
		Page.movie = Page.movie || movies.getByAddress(Page.loc); 
		return Page.movie;
	}
};

var Storage = {
		prefix: ['', Script.name, ''].join('***'),
		
		remove:function(key) {
		  localStorage.removeItem(Storage.prefix + key);
		},
		
		get:function(key, def) {
		  let val = localStorage.getItem(Storage.prefix + key);
		  return (null === val && 'undefined' != typeof def) ? def:val;
		},
		
		list:function() {
		  let prefixLen = Storage.prefix.length;
		  let values = [];
		  for (var i = 0; i < localStorage.length; i++) {
		    let k = localStorage.key(i);
		    if (k.substr(0, prefixLen) === Storage.prefix) {
		      values.push(k.substr(prefixLen));
		    }
		  }
		  return values;
		},
		
		set: function(key, val) {
		  localStorage.setItem(Storage.prefix + key, val);
		}
};

window.IMDB_MCM = {
		Page: Page,
		IMDB: IMDB,
		//Movies: movies, doesnt work because it needs to be instantiated
		//Lists: categories, idem
		Notification: Notification,
		Storage: Storage,
		log: Log.show,
};

Page.init();