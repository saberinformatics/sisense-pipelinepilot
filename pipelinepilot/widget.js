
prism.registerWidget("pipelinepilot", {

	name: "pipelinepilot",
	family: "Web Services",
    title: "Pipeline Pilot",
	iconSmall: "/plugins/pipelinepilot/widget.png",
	styleEditorTemplate: "/plugins/pipelinepilot/styler.html",
	style: {
		plpurl: '';
		rowlimit: 2500
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

			// items
			//if (!prism.$jaql.isMeasure(metadataItem) && widget.metadata.panel("items").items.length <= 25) {

				return "items";
			//}

		},

		// returns true/ reason why the given item configuration is not/supported by the widget
		isSupported: function (items) {

			return this.rankMetadata(items, null, null) > -1;
		},

		// ranks the compatibility of the given metadata items with the widget
		rankMetadata: function (items, type, subtype) {

			var a = prism.$jaql.analyze(items);

			// require 1 to 25 dimensions 
			//if ((a.dimensions.length > 0 && a.dimensions.length <= 25)) {

				return 0;
			//}

			return -1;
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
				query.count = 2500;
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
		var $lmnt = $(event.element);

		// Clear out any old elements
		$lmnt.empty();
		// give it an ID
		$lmnt.attr('id') = 'plpcontent_' + widget.oid;

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
			rlimit = 2500;
		}

		/******************************
		**	PUT EVERYTHING TOGETHER  **
		******************************/

		// Run Pipeline Pilot
		// send data to it
		// run its scripts
		// apply its css styles
		// display its html or other output
		//(arr, widget.oid, rlimit, numeric_cols);
		
		
		// Run a PLP protocol using a URL, insert protocol output 
		// into an HTML element (e.g. #appcontent_).

		// Notes:
		// * semantic (whole) breaks sisense table headers - load piecemeal without "table" in plp protocols -
		//	- or what do we actually do in plp table components? 
		// * is it possible to apply css to a single div?
		// * two or more plp widgets in a dashboard - any problems?
		// * plp 2018 - any new js or css includes to parse?
		// * if the user is not logged in show a button to raise a pop-up window then refresh the dashboard window
		// * cross-origin instructions in the plp install - v2018 vs older - different steps


		function plpUrlRunner(url, elementselector) {

		  $.ajaxSetup({  // cross-site scripting
			xhrFields: {
			  withCredentials: true
			}
		  });
		  $.support.cors = true;

		  var login_url = 'http://saberwin:9944/protocols/Web%20Services/Saber/Notebook/Utilities/Internals/Check%20Session?$streamdata=result'; // check session

		  $.ajax({
			url: probe_url,
			cache: false,
			success: function(value){ // PLP responded
			  if(value == 0) { // logged in to PLP already
				$.get(url) // run the app
					 .success(function(str) {
						 // if a complete HTML doc (with head) is passed, extract its body content
						 if (str.indexOf('</body>') > -1) {
							 str = str.split("<body")[1].split(">").slice(1).join(">").split("</body>")[0];
						 }
						 var el = $( '<div></div>' );
						 el.html(str);
						 // Internalize and load all JS scripts required in PLP script tags
						 var scripts = $('script[src*="/lang/javascript/"],script[src*="/waf/js/"],script[src*="/reporting/extjs/"],script[src*="/reporting/jslatest/"],script[src*="/reporting/javascript/"]', el);
						 // Internalize and load all CSS required in PLP link rel tags
						 var css = $('link[rel="stylesheet"][href*="/reporting/css/"]', el);
						 $("<style></style>").appendTo(css); // dummy to ensure the loop runs

						 css.each(function(){ $('head').append($(this)); }).promise().done(function() {
						   scripts.each(function(){
							 var reg=/(jquery.min.js|semantic.min.js)/g; // exclusion list
							 if (reg.test($(this).attr('src'))) {} else { $.getScript($(this).attr('src')); }
						   }).promise().done(function() {
							   if (/\.json$/.test(url)) {$(elementselector).html(JSON.stringify(str));} else {$(elementselector).html(str);}
						   }); // run scripts then populate div
						 });
					 })
					 .error(function(xhr, status, error) {
						  $(elementselector).addClass('ui negative message');
						  var x = '';
						  if (xhr.responseText) {
							  x = '<div class="ui red icon message"><i class="frown icon"></i><div class="content"><div class="header">Error</div><p>An application error occurred calling the Pipeline Pilot server. Check that the protocol completes successfully.</p></div></div>' + xhr.responseText.replace(/\n/g, '<br/>')
						  } else {
							  x = '<div class="ui red icon message"><i class="frown icon"></i><div class="content"><div class="header">Error</div><p>An application error occurred calling the Pipeline Pilot server. Check that you are using the correct server name, port and protocol ID.</p></div></div>';
						  }
						  $(elementselector).html(x);
					 });
			  } else {
				$(elementselector).addClass('ui negative message');
				$(elementselector).html('Pipeline Pilot refused the connection. ' + value);
			  }
			},
			error: function() {
			  $(elementselector).addClass('ui yellow message');
			  $(elementselector).html('<div class="ui yellow icon message"><i class="lock icon"></i><div class="content"><div class="header">Sign in Required</div><p>Log in to Pipeline Pilot webport (using its full server name e.g. name.domain.com) in another window then reload this page.</p></div></div>');
			}
		  });
		}		
		
		plpRunner(widget.style.plpurl, 'plpcontent_' + widget.oid);
		
		
	} // render method
}); // prism.registerWidget
	

	