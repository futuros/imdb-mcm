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
			redirect: true,			// use links to go to the mymovies lists instead of deleting from that list
			confirmation: true,	// ask for confirmation when deleting a list with a link; NB: only used when goto:false
	},	},
	links: {				// Configuration options for the links
		pulldown: true, 		// append a pulldown menu with lists to every movie link
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
			redirect: false,		// use links to go to the mymovies lists instead of deleting from that list
			confirmation: true	// ask for confirmation when deleting a list with a link; NB: only used when goto:false
	}	},
	vote: {
			high: {text: 'white', bg: 'green'},
			medium: {text: 'black', bg: '#FFCC00'},
			low: {text: 'white', bg: 'red'},
	},
	debug:{
		level: 0,			// prints info to the error console; level 0: nothing (best performance & useability), 1: basic log messages, 2: all debug messages, 3: debug info for scriptwriter; 
		popup: true,		// show notifications when something gets deleted or updated 
		test: false,//(document.location.href.indexOf('tt0278090')!=-1), //automatically go to test mode on Test movie page,			// use test data instead of real data. 
}	};

var IMAGES = {
	checked: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAGrSURBVDjLvZPZLkNhFIV75zjvYm7VGFNCqoZUJ+roKUUpjRuqp61Wq0NKDMelGGqOxBSUIBKXWtWGZxAvobr8lWjChRgSF//dv9be+9trCwAI/vIE/26gXmviW5bqnb8yUK028qZjPfoPWEj4Ku5HBspgAz941IXZeze8N1bottSo8BTZviVWrEh546EO03EXpuJOdG63otJbjBKHkEp/Ml6yNYYzpuezWL4s5VMtT8acCMQcb5XL3eJE8VgBlR7BeMGW9Z4yT9y1CeyucuhdTGDxfftaBO7G4L+zg91UocxVmCiy51NpiP3n2treUPujL8xhOjYOzZYsQWANyRYlU4Y9Br6oHd5bDh0bCpSOixJiWx71YY09J5pM/WEbzFcDmHvwwBu2wnikg+lEj4mwBe5bC5h1OUqcwpdC60dxegRmR06TyjCF9G9z+qM2uCJmuMJmaNZaUrCSIi6X+jJIBBYtW5Cge7cd7sgoHDfDaAvKQGAlRZYc6ltJlMxX03UzlaRlBdQrzSCwksLRbOpHUSb7pcsnxCCwngvM2Rm/ugUCi84fycr4l2t8Bb6iqTxSCgNIAAAAAElFTkSuQmCC',
	unchecked: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAIhSURBVDjLlZPrThNRFIWJicmJz6BWiYbIkYDEG0JbBiitDQgm0PuFXqSAtKXtpE2hNuoPTXwSnwtExd6w0pl2OtPlrphKLSXhx07OZM769qy19wwAGLhM1ddC184+d18QMzoq3lfsD3LZ7Y3XbE5DL6Atzuyilc5Ciyd7IHVfgNcDYTQ2tvDr5crn6uLSvX+Av2Lk36FFpSVENDe3OxDZu8apO5rROJDLo30+Nlvj5RnTlVNAKs1aCVFr7b4BPn6Cls21AWgEQlz2+Dl1h7IdA+i97A/geP65WhbmrnZZ0GIJpr6OqZqYAd5/gJpKox4Mg7pD2YoC2b0/54rJQuJZdm6Izcgma4TW1WZ0h+y8BfbyJMwBmSxkjw+VObNanp5h/adwGhaTXF4NWbLj9gEONyCmUZmd10pGgf1/vwcgOT3tUQE0DdicwIod2EmSbwsKE1P8QoDkcHPJ5YESjgBJkYQpIEZ2KEB51Y6y3ojvY+P8XEDN7uKS0w0ltA7QGCWHCxSWWpwyaCeLy0BkA7UXyyg8fIzDoWHeBaDN4tQdSvAVdU1Aok+nsNTipIEVnkywo/FHatVkBoIhnFisOBoZxcGtQd4B0GYJNZsDSiAEadUBCkstPtN3Avs2Msa+Dt9XfxoFSNYF/Bh9gP0bOqHLAm2WUF1YQskwrVFYPWkf3h1iXwbvqGfFPSGW9Eah8HSS9fuZDnS32f71m8KFY7xs/QZyu6TH2+2+FAAAAABJRU5ErkJggg==',
	loading: 'data:image/gif;base64,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%3D%3D',
};

//Global variabels
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
 * Create a menu element with all the movielists as list items.
 * @param 	movie	a MovieObj which the form field will add/remove to the items
 * @return	html	returns a html menu element or false if a menu with the id already exists.
 */
function createListsMenu(movie){
	var menu = $('<ul></ul>', {
		name:    'cats_'+movie.id,
		'movid': movie.id,
		'class': 'imcm_menu movie'+movie.id,
	});	
	for(var i in Lists.array){
		var a = Lists.array[i];
		let li = $('<li></li>', {
			title:  'Add/Remove: '+a[1],
			'catid': a[0],
			html: a[1],
		})
		.click(function(){
			var node = $(this);
			if(node.hasClass('busy')){return false;}
			movie = Movies.get(node.parent().attr('movid'));
			node.addClass('busy');
			IMDB.reqMovieAction(movie,node.attr('catid'))
				.success(function(){node.toggleClass('checked',this.movie.hasList(this.data.list_id));})
				.complete(function(){node.removeClass('busy');});
			return false;
		})		
		.toggleClass('checked', movie.hasList(a[0]))
		.appendTo(menu);
	}
	return menu;
}

/*
 * Appends labels for all the movielists the movie belongs to, to the node
 * Also add a pulldown menu with movielists if CONFIG requires so
 *
 * @param {HtmlElement} node The node where the movielists need to be appended to
 * @param {MovieObj} movie The movie corresponding with the node
 * @return Whether or not the node got highlighted as a result of this function
 * @type boolean
 */
function appendListLinks(node, movie){
	var isHeader = !node.is('A');
	node.addClass('label_node movie'+movie.id);
	highlighted = updateListLinks(node, movie);
	if(CONFIG.links.pulldown && !isHeader && (changeMenu = createListsMenu(movie))){
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
 * Add the highlight class to the node if it has movielists or votes
 *
 * @param {HtmlElement} node The node where the movielists need to be appended to
 * @param {MovieObj} movie The movie corresponding with the node
 * @return Whether or not the node got highlighted as a result of this function
 * @type boolean
 */

function updateListLinks(node,movie){
	var isHeader = !node.is('A');
	var CFG = isHeader ? CONFIG.header : CONFIG.links;
	// Remove nodes currently added to the nodes parentnode
	node.parent().find('.imcm_label').remove();
	if(movie.isActive()){ // if the movie contains a vote or is added to a movielist
		node.addClass('imcm_highlight');
		if(CFG.labels.show && movie.lists.length>0){ // show the movieList labels
			var listIds = movie.getListIds();
			for(var j=0; j<listIds.length;j++){
				// append the movieList label 
				var settings = {'class':'imcm_label', listId: listIds[j][0]};
				settings.html = Lists.getName(settings.listId);
				settings.href = '#'+settings.listId;
				if(CFG.labels.redirect){ // onclick redirect to movielist
					settings.title = 'Go to the movielist: '+settings.html;
					settings.click = function(){
						Notification.error('This is not yet working. Movielist id:'+$(this).attr('catid'));	
						//window.location='http://www.imdb.com/mymovies/list?l='+catid;
					};
				} else { // onclick, ask to remove from movielist
					settings.title = 'Delete movie from list: '+settings.html;
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
	$('.movie'+movie.id+'.label_node').each(function(){updateListLinks($(this),movie);});
	$('.movie'+movie.id+'.imcm_menu').find('li').each(function(){
		$(this).toggleClass('checked', movie.hasList($(this).attr('catid')));
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
	onInit: false,
	
	/*
	 * Temporary function to test the IMDB api in isolation
	 */
	test: function(commands){
		var test = commands || prompt('What do we need to test?','Votes,Lists');
		if(!test)return;
		Movies.clear();
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
			Movies.add({tid: response[i].const, vote: response[i].you_rated});
		};
		l2(response.length+' votes found');
		Movies.save();
	},
	reqLists: function(){
		return IMDB.xhr({
				url: 'list/_ajax/lists',
				data: {'list_type':'Titles'}
		});
	},
	parseLists: function(response){
		let cats = [];
		if(response.status!='200')return;
		for(var i=0, j=response.lists.length; i<j; i++){
			let item = response.lists[i];
			if(item.state=='OK'){
				cats.push([item.list_id,item.name.replace("MyMovies: ","")]);
			}
		}
		// watchlist is ommited
		cats.push([IMDB.watchlistId, 'Watchlist']);
		// save the movielists
		Lists.set(cats);
	},
	reqHLists: function(){
		return IMDB.xhr({url: 'user/'+IMDB.authorId+'/lists?tab=all&filter=titles',});
	},
	parseHLists: function(response){
		let cats = [];
		$response = $(response);
		$response.find('.your_lists .lists tr.row').each(function(){
			var $row = $(this);
			var id = $row.attr('id');
			var name = $row.find('.name a').html().replace("MyMovies: ","");
			var count = parseInt($row.find('.name span').html().match(/\((\d+)/)[1]);
			cats.push([id,name,count]);
		});
		// watchlist is ommited
		var watchlistCount = $response.find('div.watchlist b a').html().match(/\((\d+)\)/);
		watchlistCount = (watchlistCount)?parseInt(watchlistCount[1]):50;
		cats.push([IMDB.watchlistId, 'Watchlist', watchlistCount]);
		// save the movielists
		Lists.set(cats);
	},
	/*
	 * For loop over the different movielists
	 * Calls reqMovieList for each
	 */
	reqMovieLists: function(){
		var calls = [];
		Lists.array.forEach(function(elm,index, arr){
			l3('req Movielist['+elm[0]+']: '+elm[1]);
			//calls.push(IMDB.reqMovieList(elm[0]));
			var start=1;
			while(start<elm[2]){
				calls.push(IMDB.reqHtmlList(elm[0],start));
				start+=250;
			}
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
			Movies.add({tid: response[i].const, listId: list_id, controlId: 1});
		}
	},
	reqHtmlList: function(listId,start){
		start = start || 1;
		return IMDB.xhr({
			url: 'list/'+listId+'/?view=compact',
			data: {'start':start, list_id:listId},
		});
	},
	parseHtmlList: function(response){
		var listId = this.data.list_id;
		var $response = $(response);
		$response.find('.list.compact table tr').each(function(index){
			if(index==0)return;
			$row = $(this);
			var rate = $row.find('.rating-list');
			if(rate && rate.attr('id')){
				var tt=rate.attr('id').split('|')[0];
				Movies.add({tid:tt, listId:listId,controlId:$row.attr('data-item-id')});
			}
		});
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
		if(movie.hasList(list_id)){
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
				this.movie.deleteList(this.data.list_id);
			} else { //succesfully added
				this.movie.addList(this.data.list_id,response.list_item_id);
			}
			Movies.save();
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
		Movies.clear(); // clear the current cache.
		$.when(IMDB.reqAuthorId(),IMDB.reqSecurityCheck()).done(function(){
			$.when(IMDB.reqHLists()).done(function(){
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
		if(Movies.array.length && Lists.array.length && IMDB.authorId && IMDB.check && IMDB.watchlistId){
			Movies.save();
			Notification.write('<b>Cache rebuild</b><br />Lists: '+Lists.array.length+'<br />Movies: '+Movies.array.length, 8000,true);
			if(onInit){ // if the rebuild script was started on page init
				Page.initCaches(); // reinitialize the page
			} else if(!CONFIG.debug.test){
				window.setTimeout(window.location.reload,1000); //reload the page
			}
		} else {
			Log.error('Something whent wrong while getting movies information from IMDB.');
			Notification.error('Something went wrong trying to rebuild the cache. Please try again.');
		}
	},
	/*
	 * If any request from IMDB.rebuild fails this function is called
	 */
	failed: function(){
		IMDB.onInit=null; // reset onInit boolean
		Notification.write('<b>Cache rebuild</b><br />Lists: '+Lists.array.length+'<br />Movies: '+Movies.array.length, 8000,true);
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
		this._node = $('<div class="imcm_notification"></div>')
			.appendTo('body')
			.click(this._hide);
	},
	_write:function(text, maxtime, append){
		if(this._timer)clearTimeout(this._timer);
		if(append)
			this._node.append('<br />'+text);
		else
			this._node.html(text);
		this._show();
		if(maxtime>0){
			this._timer=setTimeout(this._hide,maxtime);
		}
	},
	write:function(text, maxtime, append){
		if(!this._node)this._init();
		this._node.removeClass('error');
		this._write(text,maxtime,append);
	},
	debug: function(text, maxtime){
		if(CONFIG.debug.popup)this.write(text, maxtime);
	},
	error: function(text){
		if(!this._node)this._init();
		this._node.addClass('error');
		this._write('<h3>ERROR:</h3><p>'+text+'</p>');
	},
	_show: function(){
		this._node.show('slow');
	},
	
	_hide: function(){
		Notification._node.hide('slow');
	}
};

/*
 * Object: Used to manage the movie list
 */
var Movies ={
	array: [],
	
	/*
	  * Load the stored value
	  */
	load: function(){
		return this.toArray(Storage.get('movies','[]'));
	},
	
	save: function(){
		return Storage.set('movies', this.toString()); //write to browser
	},
	
	clear: function(){
		this.array = [];
	},
		
	add: function(value){
		movie = new MovieObj(value);
		if(exists = this.exists(movie)){
			return exists.merge(movie);
		} else {
			this.array.push(movie);
			return movie;
		}
	},
	
	/*
	  * Checks if a movie exists in the array
	  * @return {boolean} False if not exists, movieObj
	  */
	exists: function(movie){
		if((i=this.array.length)>0){		
			do{
				if(this.array[i-1].equals(movie))return this.array[i-1];
				i--;
			}
			while(i>0)
		}
		return false;
	},
	
	get: function(id){
		if(movie = this.exists(id))
			return movie;
		else
			return this.add({tid: id});
	},
	
	getByAddress: function(address) {
		tid = address.match(/(?:(?:www|us|italian|uk)\.)?imdb.(?:com|de)(?:(?:\/title\/tt)|(?:\/Title\?))(\d+)\/(?:\w+\/?)?$/);
		if (!tid) return false;
		return this.get(tid[1]);
	},
	
	/*
	  * String to Array
	  */
	toArray: function(string) {
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
		return this.array = array;
	},

	/*
	  * Array to String
	  */
	toString: function() {
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
	},
}

function MovieObj(){
	this.lists = []; // catid controlid pair
	
	if(arguments.length==0)return false;
	if(typeof arguments[0] == 'string'){ // construct a new movieObj based on a string: tid-vote-list1:control1-list2:control2-listN:controlN
		arr = arguments[0].split("-");
		this.id = arr[0].replace("tt","");
		this.vote = parseInt(arr[1]);		
		var i=arr.length;
		while(i>2){
			this.lists.push(arr[i-1].split(':'));
			i--;
		}
	} else {
		//from object {tid:, listId, controlId, vote}
		var obj = arguments[0];
		this.id = obj.tid.replace("tt","");
		this.vote = obj.vote || 0;
		if(obj.listId && obj.controlId)	this.lists.push([obj.listId,obj.controlId]);
	}

	this.isActive = function(){
		return this.lists.length > 0 || this.vote > 0;
	}
	
	this.hasList = function(id){
		if(this.lists.length<=0)return false;
		for(var i=0;i<this.lists.length;i++){
			if(this.lists[i][0]==id)return true;
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
		if(obj.lists.length){
			this.lists = this.lists.concat(obj.lists);
		}
	}
	
	this.addList = function(listId, controlId){
		this.lists.push([listId,controlId]);
	}
	
	this.deleteList = function(id){
		if(this.lists.length<=0)return false;
		for(var i=0;i<this.lists.length;i++){
			if(this.lists[i][0]==id){
				this.lists.splice(i,1);
				return true;
			}
		}
		return false;	
	}

	this.getListIds = function(){
		var lists = [];
		for(var i=0;i<this.lists.length;i++){
			lists.push(this.lists[i][0]);
		}
		return lists.sort();
	}
	
	this.getControlId = function(list){
		for(var i=0;i<this.lists.length;i++){
			if(this.lists[i][0]==list)
				return this.lists[i][1];
		}
		Log.error('(line:833) Failed to get control id for movie:'+this.id+' and list:'+list);
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
		if(this.lists.length>0){
			for(var i=0;i<this.lists.length;i++){
				string.push(this.lists[i].join(':'));
			}
		}
		return string.join('-');
	}
}

/*
 * Object: Used to manage the movie list
 * keeps all the movie lists in an array with key:value is movielistid:name
 * @todo: Rename to MovieLists
 */
var Lists = {
	array: [],
	
	/*
	  * Get the stored value
	  */
	load: function(){
		return this.array = JSON.parse(Storage.get('lists','[]'));
	},
	
	/*
	  * Change the object with the new array and store the value
	  */
	set: function(value){
		this.array = value;
		Storage.set('lists', JSON.stringify(this.array));
	},

	/*
	  * Get a cat id by a name
	  */
	getId: function(name){
		for(var i in this.array){
			a = this.array[i];
			if(a[1]==name)return a[0];
		}
		return false;
	},

	/*
	  * Get a name by id
	  */
	getName: function(id){
		for(var i in this.array){
			a = this.array[i];
			if(a[0]==id)return a[1];
		}
		return false;
	}
}

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
		this.initType();
	},
	
	initType: function(){
		this.loc = document.location.href;
		if(this.loc.search(/^http(s)?:\/\/.*\.imdb\.(com|de)\//)==-1){
			this.type = this.TYPE.external;
		} else	if(this.loc.search(/\/user/)!=-1){
			this.type = this.TYPE.mymovies;
		} else	if(this.loc.search(/\/list/)!=-1){
			this.type = this.TYPE.mymovies;
		} else if(this.loc.search(/(\/title\/tt\d+)|(\/Title\?\d+)/)!=-1){
			this.type = this.TYPE.title;
		} else {
			this.type = this.TYPE.imdb;
		}
		l1('Page type: '+this.type);
		this.initUser();
	},
	/*
	 * Get the Username
	 * @TODO: Rewrite with jquery
	 */
	initUser: function(){
		l2('Initialize username' ,2);
		if(!this.user){
			var account = document.getElementById('nb15personal') || document.getElementById('nb_personal');
			if (account) {
				var result = account.innerHTML.match(/\s*([^>]+)'s account/i);
				if (result && result[1]) {
					this.user = result[1];
				} else {
					if(this.isType(this.TYPE.external)){
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
		l1('Username initialized: '+this.user);
		this.initMenus();
	},
	initMenus: function(){
		l3('Init menus');
		//if(this.isType(this.TYPE.mymovies)){ //mymovies page
			
			 //@TODO: Add button/menu for cache reload 
			 //We should reload the cache on every page view.
			 //We can add a button in the top corner. And if we push it the cache gets reloaded.
			 //
		//}
		this.initCaches();
	},
	initCaches: function(){
		if(IMDB.setAuthorId(Storage.get('authorId')) && IMDB.setWatchlist(Storage.get('watchlistId')) && IMDB.setSecurity(Storage.get('securityCheck'))){
			l2('Load movies and lists from cache');
			Lists.load();
			Movies.load();
			l1('Movies loaded from cache: '+Movies.array.length);
			l1('Lists loaded from cache: '+Lists.array.length);
			if(Movies.array.length!=0 && Lists.array.length!=0){
				return this.initLinks();
			}
		}
		IMDB.rebuild(true);
		return false;
	},
	initLinks: function(){
		l2('init links on page');
		linkCount=0;
		activeLinks=0;
		var mov = this.getMovie();
		$('A').each(function(){
			var movie;
			if((movie = Movies.getByAddress(this.href)) && !movie.equals(mov)){
				if(appendListLinks($(this), movie)){activeLinks++;}
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
		this.start();
	},
	start: function(){
		l3('start switcher');
		switch(this.type){
			case this.TYPE.title:
				this.startTitle();
			break;
			case this.TYPE.mymovies:
				//this.startMymovies();
			break;
			case this.TYPE.imdb:
				//this.startOther();
			break;
			case this.TYPE.external:
				//this.startExternal();
			break;
		}
	},
	startTitle: function(){
		l3('start title page');
		if(movie = this.getMovie()){ //Title page
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
						Movies.save();
						l2('Vote changed to '+movie.vote);
						updateStatus(movie);
					}
				} // else {do nothing, just a hover over the votes}
			});
			// --end of vote code
			
			appendListLinks($('h1').first(), movie);
			l2('Adding list menu to the title page');

			$('<div />').addClass('imcm_catlist aux-content-widget-2')
				.append(createListsMenu(movie))
				.prependTo('#maindetails_sidebar_bottom');
			
			if(CONFIG.debug.test)IMDB.test();
		}
	},
	isType: function(type){
		return this.type==type;
	},
	getMovie: function(){
		return this.movie = this.movie || Movies.getByAddress(this.loc); 
	}
};

var Storage = {
		prefix: function(key){
			return [Script.name, Page.user, key].join('***');
		},
		
		remove:function(key) {
		  localStorage.removeItem(this.prefix(key));
		},
		
		get:function(key, def) {
		  let val = localStorage.getItem(this.prefix(key));
		  return (null === val && 'undefined' != typeof def) ? def:val;
		},
		
		list:function() {
		  let prefixLen = this.prefix('').length;
		  let values = [];
		  for (var i = 0; i < localStorage.length; i++) {
		    let k = localStorage.key(i);
		    if (k.substr(0, prefixLen) === this.prefix('')) {
		      values.push(k.substr(prefixLen));
		    }
		  }
		  return values;
		},
		
		set: function(key, val) {
		  localStorage.setItem(this.prefix(key), val);
		}
};

window.IMDB_MCM = {
		Page: Page,
		IMDB: IMDB,
		Movies: Movies,
		Lists: Lists,
		Notification: Notification,
		Storage: Storage,
		log: Log.show,
};

Page.init();