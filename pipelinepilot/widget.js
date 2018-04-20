
prism.registerWidget("pipelinepilot", {

	name: "pipelinepilot",
	family: "Web Services",
	title: "Pipeline Pilot",
	iconSmall: "/plugins/pipelinepilot/widget.png",
	styleEditorTemplate: "/plugins/pipelinepilot/styler.html",
	style: {
		plpurl: 'http://myserver:myport/my-protocol-url-here',
		rowlimit: 50000
	},
	data:  {

		selection: [],
		defaultQueryResult: {
		},
		panels: [

			{
				name: 'items',
				type: 'visible',
				itemAttributes: ["color"],
				
				metadata: {
					types: ['dimensions'],
					maxitems: 25
				}
			},
			{
				name: 'filters',
				type: 'filters',
				metadata: {
					types: ['dimensions'],
					maxitems: -1
				}
			}
		],
		
		allocatePanel: function (widget, metadataItem) {
				return "items";

		},

		// returns true/ reason why the given item configuration is not/supported by the widget
		isSupported: function (items) {

			return this.rankMetadata(items, null, null) > -1;
		},

		// ranks the compatibility of the given metadata items with the widget
		rankMetadata: function (items, type, subtype) {
			return 0;
		},

		// populates the metadata items to the widget
		populateMetadata: function (widget, items) {

			var a = prism.$jaql.analyze(items);

			// allocating dimensions
			widget.metadata.panel("items").push(a.dimensions);

			// allocating filters
			widget.metadata.panel("filters").push(a.filters);
		},

		// builds a jaql query from the given widget
		buildQuery: function (widget) {
	    
			// building jaql query object from widget metadata 
			var query = { datasource: widget.datasource, metadata: [] };

			// pushing items
			widget.metadata.panel("items").items.forEach(function (item) {

				query.metadata.push(item);
			});

			// series - dimensions
			widget.metadata.panel('filters').items.forEach(function (item) {

				item = $$.object.clone(item, true);
				item.panel = "scope";

				query.metadata.push(item);
			});

			if (widget.style.rowlimit && widget.style.rowlimit*1 && parseInt(widget.style.rowlimit)) { // numeric and non-zero
				query.count = parseInt(widget.style.rowlimit);
			} else {
				query.count = 50000;
			}
			query.offset = 0;

			return query;
		},

		// prepares widget-specific query result from a given result data-table
		processResult: function (widget, queryResult) {
			return queryResult;
		}
	},
	render: function (widget, event) {

		// Get widget body (dom element)
		var $lmnt = $(event.element);//.find('.widget-body');

		// Clear out any old elements
		$lmnt.empty();
		// give it an ID
		$lmnt.attr('id', 'plpcontent_' + widget.oid);

		// Reshape data
		var results = widget.rawQueryResult;
		if (results) {
			var hs = results.headers;
		} else {
			hs = [];
			return;
		}
		numeric_cols = [];
		for (var i = 0; i < hs.length; i++) {
			if (results.metadata[i].jaql.datatype == 'numeric') {
				numeric_cols.push(hs[i]);
			}
		}
		
		arr = [];

		results.values.forEach(function(r){
			obj = {};
			for (var i = 0; i < hs.length; i++) {
				var key = hs[i];
				if (r[i].data == 'N\\A' && results.metadata[i].jaql.datatype == 'numeric') {
					obj[key] = null;
				//} else if (r[i].data == 'N\\A') {
					//obj[key] = r[i].data;
				} else {
					obj[key] = r[i].data;
				}
			}
			arr.push(obj);
		});

		if (widget.style.rowlimit && widget.style.rowlimit*1 && parseInt(widget.style.rowlimit)) { // numeric and non-zero
			rlimit = parseInt(widget.style.rowlimit);
		} else {
			rlimit = 50000;
		}

		/******************************
		**	PUT EVERYTHING TOGETHER  **
		******************************/

		// Notes:
		// DataTables from PLP will show unstyled search and pagination - to avoid conflicts with built-in Sisense tables
		// * two or more plp widgets in a dashboard - any problems?
		// Cross-domain CORS instructions for PLP - v2018 vs older - different steps

		function plpUrlRunner(url, elementselector, data) {

		  $.ajaxSetup({  // cross-site scripting
			xhrFields: {
			  withCredentials: true
			}
		  });
		  $.support.cors = true;

		  var s = widget.style.plpurl.split('/'); var plpserverroot = s[0] + '//' + s[2];
		  var login_url = plpserverroot + '/auth/launchjob?$protocol=Components/Semantic+UI/Utilities/Internals/PLP+Login+Pop-Up&$streamfile='; // plp login prompt
		  var probe_url = plpserverroot + '/auth/launchjob?$protocol=Components/Semantic+UI/Utilities/Internals/Check+Session'; // check session

		  function popupwindow(cururl, url, title, w, h) {
			var left = (screen.width/2)-(w/2);
			var top = (screen.height/2)-(h/2);
			popupWindow =  window.open(url, title, 'toolbar=no, location=no, \
									 directories=no, status=no, menubar=no, \
									 scrollbars=no, resizable=no, copyhistory=no, \
									 width='+w+', height='+h+', top='+top+', left='+left);

			function settimer() {var timer = setInterval(function() { if(popupWindow.closed) { clearInterval(timer); window.location.href = cururl; alert(cururl); window.location.reload(true); }}, 100);}
			popupWindow.addEventListener('load', settimer(), true); 
		  } 
		  
		  $(elementselector).html('<p><i class="inline big disabled loading spinner icon"></i></p>');
		  
		  $.ajax({
			url: probe_url + '&__PoolID=MOL',
			cache: false,
			success: function(value){ // PLP responded
			  if(value == 0) { // logged in to PLP already
			    $.getScript(plpserverroot + '/reporting/jslatest/reportCore.js'); // for forms; should load in time for results
				$.post(url + '&__PoolID=MOL', data) // run the app
					 .success(function(str) {
						 // if a complete HTML doc (with head) is passed, extract its head content
						 if (str.indexOf('</head>') > -1) {
							 strh = str.split("<head")[1].split(">").slice(1).join(">").split("</head>")[0];
						 } else {
							 strh = '';
						 }
						 var elh = $( '<div></div>' );
						 elh.html(strh);

						 // if a complete HTML doc (with head) is passed, extract its body content
						 if (str.indexOf('</body>') > -1) {
							 str = str.split("<body")[1].split(">").slice(1).join(">").split("</body>")[0];
						 }
						 var el = $( '<div></div>' );
						 el.html(str);

						 var scripts = $();
						 var css = $();
						 
						 // Internalize and load all JS scripts required in PLP script tags
						 var scriptsh = $('script[src*="/lang/javascript/"],script[src*="/waf/js/"],script[src*="/reporting/extjs/"],script[src*="/reporting/jslatest/"],script[src*="/reporting/javascript/"],script[src*="/semantic/assets/"]', elh);
						 // Internalize and load all CSS required in PLP link rel tags
						 var cssh = $('link[rel="stylesheet"][href*="/reporting/css/"],link[rel="stylesheet"][href*="/semantic/assets/"]', elh);

						 var scriptsb = $('script[src*="/lang/javascript/"],script[src*="/waf/js/"],script[src*="/reporting/extjs/"],script[src*="/reporting/jslatest/"],script[src*="/reporting/javascript/"],script[src*="/semantic/assets/"]', el);
						 // Internalize and load all CSS required in PLP link rel tags
						 var cssb = $('link[rel="stylesheet"][href*="/reporting/css/"],link[rel="stylesheet"][href*="/semantic/assets/"]', el);

						 $("<style></style>").appendTo(css); // dummy to ensure the loop runs
						 cssh.appendTo(css);
						 cssb.appendTo(css);

						 scriptsh.appendTo(scripts);
						 scriptsb.appendTo(scripts);

						 css.each(function(){ $('head').append($(this)); }).promise().done(function() {
						   scripts.each(function(){ // run scripts then populate div
							 var reg=/(jquery.min.js)/g; // exclusion list
							 if (reg.test($(this).attr('src'))) {} else { $.getScript($(this).attr('src')); }
						   }).promise().done(function() {
								// run all embedded script tags
								$('script', elh).each(function (index, element) { eval(element.innerHTML); });
								$('script', el).each(function (index, element) { eval(element.innerHTML); });

								// all done, now fill the container with content
								if (/\.json$/.test(url)) {
									$(elementselector).html(JSON.stringify(str));
								} else {
									try{$(elementselector).html(str);} catch(e){} finally{
									   // add all <style> blocks to the widget container
										$('style', elh).appendTo($(elementselector));
										$('style', el).appendTo($(elementselector));
										
										$(elementselector).css("overflow-y", "scroll").addClass('ui basic segment').removeClass('raised very padded tertiary inverted red');
									}
								}

						   });
						 });
						 
					 })
					 .error(function(xhr, status, error) {
						  $(elementselector).css("overflow-y", "scroll").addClass('ui raised very padded tertiary inverted red segment');
						  var x = '';
						  if (xhr.responseText) {
							  x = '<h2 class="ui red header">Error</h2><p>An application error occurred executing a job on the Pipeline Pilot server. Was the protocol found and did it <b>complete</b> successfully?</p>' + xhr.responseText.replace(/\n/g, '<br/>')
						  } else {
							  x = '<h2 class="ui red header">Error</h2><p>An application error occurred calling the Pipeline Pilot server. Check that you are using the <b>correct server name, port and protocol ID</b>.</p>';
						  }
						  $(elementselector).html(x);
					 });
			  } else {
				$(elementselector).css("overflow-y", "scroll").addClass('ui raised very padded tertiary inverted red segment');
				$(elementselector).html('<h2 class="ui red header">Error</h2><p>Pipeline Pilot refused the connection.</p><p>'+value+'</p>');
			  }
			},
			error: function() {
			  $(elementselector).addClass('ui raised very padded tertiary inverted yellow segment');
			  $(elementselector).html('<h2 class="ui header">Log in to Pipeline Pilot</h2><p><a id="login'+widget.oid+'" href="#">Click here</a> to log in.</p>');
			  $('#' + 'login'+widget.oid).on('click', function(){ 
				popupwindow(window.location.href, login_url + '&__PoolID=MOL', 'Log In', 600, 400); 
			});
			}
		  });
		}		
		
		// Call Pipeline Pilot. Data structure example:
		//       results: { 
        //			"fname": n, 
        //			"fdata": somejson or base64
		//		}
		// Each PLP global variable (protocol parameter) is a (named!) item in the data object.
      

		data = {
			"headers": JSON.stringify(hs), 
			"metadata": JSON.stringify(results.metadata), 
			"values": JSON.stringify(arr)
		}

		plpUrlRunner(widget.style.plpurl, '#plpcontent_' + widget.oid, data);
		
		
	} // render method
}); // prism.registerWidget
	

	