// CONFIGURATION
var MAX_ENTRIES = 10; // Number of entries that a user can save via local Web storage.
var DISPLAY_LENGTH_LITERAL = 15; // max. length of literal label that will be displayed
var DISPLAY_LENGTH_NODE = 30; // max. length of a node label that will be displayed

// Internal stuff, do not touch
var graph = Viva.Graph.graph();
var graphics = Viva.Graph.View.svgGraphics();
var turtlestorage = window.localStorage;
var entrycntr = 0;
var labelsvis = false;
var gstats = { numtriples : 0, numentities : 0, numclasses : 0 };
var URIs2prefixes = {};
var usedPrefixes = [];

// Rendering of nodes and properties
graphics.node(function(node) {
    var l = node.data.label;
    var d = l;
    var g = Viva.Graph.svg('g');
    var ellipseRX = 95; // defaults for ...
    var ellipseRY = 15; // use-prefix rendering mode

    if($('useprefixes').is(':checked')) { // User prefers to use prefixes for display
        if(node.data.type == 'uri') { // We ave a URI, try to create a short label via prefix
            d = lookupPrefix4URI(l);
            if (d == l) { // Prefix lookup unsuccessful
                ellipseRX = 150;
            }
        }
    }
    else {
        ellipseRX = 150
    }

    if(labelsvis){ // Only lines - show only labels
        if (node.data.type == 'literal') {
            d = '"' + d + '"';
        }
        return Viva.Graph.svg('text')
            .attr('style', 'stroke-width: 0.1; font-family: Arial; font-size: 60%; stroke: #303030;')
            .text(d);
    }
    else { // Ellipse and rects
        if (node.data.type == 'literal') {
            // Make it fit in the place available
            if(d.length > DISPLAY_LENGTH_LITERAL){
                d = d.substring(0, DISPLAY_LENGTH_LITERAL) + " ...";
            }
            g.append(Viva.Graph.svg('rect')
                .attr('width', 130)
                .attr('height', 20)
                .attr('style','stroke: #000; fill: #fff')
                .attr('title', l));
            g.append(Viva.Graph.svg('text')
                .attr('style', 'stroke-width: 0.1; font-family: Arial; font-size: 60%; stroke: #30330;')
                .attr('title', l)
                .text(d));
        }
        else {
            // Make it firt in the place available
            if(d.length > DISPLAY_LENGTH_NODE) {
                d = d.substring(0, DISPLAY_LENGTH_NODE) + " ...";
            }
            g.append(Viva.Graph.svg('ellipse')
                .attr('rx', ellipseRX)
                .attr('ry', ellipseRY)
                .attr('style', 'stroke: #000; fill: #fff')
                .attr('title', l));
            g.append(Viva.Graph.svg('text')
                .attr('style', 'stroke-width: 0.1; font-family: Arial; font-size: 60%; stroke: #303030;')
                .attr('title', l)
                .text(d));
        }
        return g;
    }
})
.placeNode(function(nodeUI, pos){
    if(labelsvis){ // Only lines
        nodeUI.attr('x', pos.x - 20).attr('y', pos.y);



//                               // To render an arrow we have to address two problems:
//                            // 1. Links should start/stop at node's bounding box, not at the node center.
//                            // 2. Render an arrow shape at the end of the link.
//
//                            // Rendering arrow shape is achieved by using SVG markers. part of the SVG
//                            // standard: http://www.w3.org/TR/SVG/painting.html#Markers
//                            var createMarker = function(id) {
//                                        return Viva.Graph.svg('marker')
//                                                .attr('id', id)
//                                                .attr('viewBox', "0 0 10 10")
//                                                .attr('refX', "10")
//                                                .attr('refY', "5")
//                                                .attr('markerUnits', "strokeWidth")
//                                                .attr('markerWidth', "10")
//                                                .attr('markerHeight', "5")
//                                                .attr('orient', "auto");
//                                    },
//
//                                    marker = createMarker('Triangle');
//                            marker.append('path').attr('d', 'M 0 0 L 10 5 L 0 10 z');
//
//                            // Marker should be defined only once in <defs. child element of root ,svg. element:
//                            var defs = graphics.getSvgRoot().append('defs');
//                            defs.append(marker);
//
//                            var geom = Viva.Graph.geom();
//
//                           graphics.link(function(link) {
//                                // Notice the Triangle marker-end attribute:
//                                return Viva.Graph.svg('path')
//                                        .attr('stroke', 'gray')
//                                        .attr('marker-end', 'url(#Triangle)');
//                            }).placeLink(function(linkUI, fromPos, toPos) {
//                                        // Here we should take care about
//                                        // "Links should start/stop at node's bounding box, not at the node center."
//
//                                        // For rectangular nodes Viva.Graph.geom() provides efficient way to find
//                                        // and intersection point between segment and rectangle
//                                        var toNodeSize = nodeSize,
//                                                fromNodeSize = nodeSize;
//
//                                        var from = geom.intersectRect(
//                                                // recatangle:
//                                                fromPos.x - fromNodeSize / 2, // left
//                                                fromPos.y - fromNodeSize / 2, // top
//                                                fromPos.x + fromNodeSize / 2, // right
//                                                fromPos.y + fromNodeSize / 2, // bottom
//
//                                                // segment:
//                                                fromPos.x, fromPos.y, toPos.x, toPos.y)
//                                                || fromPos; // if no intersection found - return center of the node
//                                        var to = geom.intersectRect(
//                                                // rectangele:
//                                                toPos.x - toNodeSize / 2, // left
//                                                toPos.y - toNodeSize / 2, // top
//                                                toPos.x + toNodeSize / 2, // right
//                                                toPos.y + toNodeSize / 2, // bottom
//                                                // segment:
//                                                toPos.x, toPos.y, fromPos.x, fromPos.y)
//                                                || toPos; // if no intersection found - return center of the node
//
//                                        var data = 'M' + from.x + ',' + from.y +
//                                                'L' + to.x + ',' + to.y;
//                                        linkUI.attr("d", data);
//                                    });



    }
    else { // Ellipse and Rects
        for (var i=0; i < nodeUI.childNodes.length; i++) {
            // console.log("Dealing with a " + nodeUI.childNodes[i].constructor.name);
            if(nodeUI.childNodes[i] instanceof SVGTextElement){
                nodeUI.childNodes[i].attr('x', pos.x - 40).attr('y', pos.y + 15);
            }
            if(nodeUI.childNodes[i] instanceof SVGRectElement){
                nodeUI.childNodes[i].attr('x', pos.x - 50).attr('y', pos.y);
            }
            if(nodeUI.childNodes[i] instanceof SVGEllipseElement){
                if($('#useprefixes').is(':checked')){
                    nodeUI.childNodes[i].attr('cx', pos.x + 20).attr('cy', pos.y + 10);
                }
                else {
                    nodeUI.childNodes[i].attr('cx', pos.x + 50).attr('cy', pos.y + 10);
                }
            }
        }
    }
});

graphics.link(function(link) {
    var g = Viva.Graph.svg('g');
    var l = link.data.label;
    var d = l;

    if($('#useprefixes').is(':checked')){ // User prefers to use prefixes for display
        d = lookupPrefix4URI(l);
    }

    g.append(Viva.Graph.svg('text')
        .attr('style', 'stroke-width: 0.1; font-family: Arial; font-size: 60%; stroke: #303030;')
        .attr('title', l)
        .text(d));
    g.append(Viva.Graph.svg('line')
        .attr('style', 'stroke: #606060; fill: #606060')
        .attr('title', l));

    return g;
})
.placeLink(function(nodeUI, from, to){
    var xlaboffset = 20;
    if(!$('#useprefixes').is(':checked')){
        xlaboffset = 100;
    }
    for (var i=0; i < nodeUI.childNodes.length; i++) {
        if(nodeUI.childNodes[i] instanceof SVGTextElement){
            nodeUI.childNodes[i].attr('x', (to.x - from.x)/2 + from.x - xlaboffset).attr('y', (to.y - from.y)/2 + from.y);
        }
        if(nodeUI.childNodes[i] instanceof SVGLineElement){
            nodeUI.childNodes[i].attr('x1', from.x).attr('y1', from.y);
            nodeUI.childNodes[i].attr('x2', to.x).attr('y2', to.y);
        }
    }
});

$(document).ready(function(){

    // Make sure we have the URI-to-prefix mapping handy when needed
    loadPrefixes();

    // Adjust size of output area
    $("#out").css('width', ($(window).width() - $('#main').width() - 100) * 0.95);
    $("#out").css('height', $(window).height() * 0.8);

    $(window).resize(function(){
        $("#out").css('width', ($(window).width() - $("#main").width() - 100) * 0.95);
        $("#out").css('height', $(window).height() * 0.8);
        $("#prefixesused").css('width', ($(window).width() - $("#main").width() - 100) * 0.95);
    });

    // List saved entries
    buildEntryList();

    // First, the RDF store needs to be ready, then we set up the UI/UX
    rdfstore.create(function(store) {

        $("#vis").click(function(eent){
            usedPrefixes = [];
            visualiseGraph(store);
        });

        // handling examples
        $("#examples").click(function(event) {
            $("#examples-sel").slideToggle('medium', function() {
                if($("examples-sel").is(":visible")){
                    $("#img-examples").css("border-left", "5px solid #f0f0f0");
                    $("#currententry").hide();
                    stats("Examples gallery loaded.");
                }
                else{
                    $("#img-examples").css("border", "0px solid #fafafa");
                }
            });
        });
        $("#ex1").click(function(event){ $("#tinput").val(ex1); });
        $("#ex2").click(function(event){ $("#tinput").val(ex2); });
        $("#ex3").click(function(event){ $("#tinput").val(ex3); });

        // Handling output support (node/link labels rendering, SVG export)
        $("#labels").click(function(event){
            $("#out").html("");
            if(labelsvis){
                $("#labels").html("full");
                labelsvis = false;
            }
            else {
                $("#lables").html("plain");
                labelsvis = true;
            }
            renderGraph("out");
        });

        $("#useprefixes").click(function(event){
            usedPrefix = [];
            visualiseGraph(store);
            if($('#useprefixes').is('checked')) $("#prefixesused").show();
            else $('#prefixsused').hide();
        });

        $("#customiseprefixes").live('click', function(event){
            $("#customprefixes").slideToggle('medium', function() {
            });
        });

        $("#addprefix").live('click', function(event){
            if($("#cprefix").val() == '') {
                URIs2prefixes[$("#cnamespace").val()] = 'unknown';
                prefixes2URIs['unknown'] = $("#cnaespace").val()
            }
            else {
                URIs2prefixes[$("#cnamespace").val()] = $("#cprefix").val();
                prefixes2URIs[$("cprefix").val()] = $("#cnamespace").val();
            }
            usedPrefices = [];
            visualiseGraph(store);
        });

        $("#svgexport").click(function(event){
            var basesvg = $("out").html();
            var header = '<?xml version="1.0" encoding="UTF-8"?>\n\
<svg width="1200" height="800" xmlns="http://www.w3.org/2000/svg">';
            var svglegend = "<g><text style='...' x= '20' y='20'>Prefixes</text>";
            var legendy = 40;
            var svgcontent = header + '\n ';

            for (var i=0; i < usedPrefixes.length; i++){
                svglegend += "<text style='...' x='20' y='" +legendy + "'>" + usedPrefixes[i] + ": ..." + prefixes2URIs[usedPrefixes[i]] + "</text>";
                legendy += 10;
            }
            svglegend += "</g>";
            svgcontent += svglegend + '\n  ' + basesvg.substring(basesvg.indexOf('<svg>') + '<svg>'.length);

            $('.svgout').remove();
            $('body').prepend("<div class='svgout'><div><button id='closesvgout'>Close</button></div><div><textarea rows='30' cols='80'>\n" + svgcontent +"</textarea</div></div>");
        });

            $("#closevgout").live('click', function(event){
                $(".svgout").remove();
        });

        // Handling restrictions (via SPARQL query)
        $("#restrict").click(function(event){
            $("#restrictions").slideToggle('slow', function() {
                if($("#restrictions").is(":visible")){
                     $('#restrict').css("border-left", "5px solid #f0f0f0");
                }
                else{
                    $("#restrict").css("border", "0px solid #fafafa");
                }
            });
        });

        // Handling entry save and load
        $("#save").click(function(event){
            var ename = prompt('Entry name:', '');
            if (ename) {
                if( entrycntr < MAX_ENTRIES ){
                    saveCLOB('turtled.net' + entrycntr, ename, $("#tinput").val());
                    entrycntr += 1;
                    buildEntryList();
                    status("RDF Turtle input save.");
                }
                else {
                    status("Can only save up to " + MAX_ENTRIES + " entries, sorry.");
                }
            }
            else {
                status("You have not specified under which name to save the entry, canceling ...");
            }
        });

        $(".entry").live('click', function(event){
            var ename = getCLOB($(this).attr('id')).name;
            // var timestamp = getCLOB($(this).attr('id').timestamp;
            var rdfturtle = getCLOB($(this).attr('id')).payload;
            $("#tinput").val(rdfturtle);
            $("#currententry").html(ename + " <button id='delete' title='" + $(this).attr('id') + "'>Delete!</button>");
            $('#examples-sel').slideUp("fast");
            $('#img-examples').css("border", "0px solid #fafafa");
            $("#currententry").slideDown("medium");
        });

        $("delete").live('click', function(event){
            var response = confirm("Are you sure you want to delete this entry?");
            if (response) {
                removeCLOB($(this).attr('title')); // Using @title of the delete button to remember which entry we are on
                $("#currententry").html("");
                status("Entry deleted.");
            }
            else {
                status("Canceling deletion ...");
            }
        });

        // Handling of selected node and arc display
        $("text").live('click', function(event){
            status("You have selected the resource: <span style='color:blue'>" + lookupPrefix4URI($(this).attr('title')) + "</span>");
        });

        $("ellipse").live('click', function(event){
            if($('#userprefixes').is(':checked')){
                status("You have selected the resource: <span style='color:blue'>" + lookupPrefix4URI($(this).attr('title')) + "</span>");
            }
            else {
                status("You have selected the resource: <span style='color:blue'>" + $(this).attr('title') + "</span>");

            }
        });

        $("rect").live('click', function(event){
            status("You have selected the literal: <span style='color:blue'>" + $(this).attr('title') + "</span>");
        });

        $("line").live('click', function(event){
            if($('#useprefixes').is(':checked')){
                status("You have selected the property: <span style='color:blue'>" + lookupPrefix4URI($(this).attr('title')) + "</span>");
            }
           else {
                status("You have selected the property: <span style='color:blue'>" + $(this).attr('title') + "</span>");
            }
        });
    });
});

function visualiseGraph(store){
    var tinput = $("#tinput").val();
    $("#out").html("");
    $("#ot-support").hide();
    resetGraph(store);

    status("Parsing input ...");

    // Try parsing the user-supplied input and if successful, build the graph and render it
    store.load("text/turtle", tinput, function(success, results) {
        if(success){
            gstats.numtriples = results;
            status("Valid RDF Triples. Loaded <strong>" + results + "</strong> triples");
            if($("#restrictions").is(":visible")){
                    applyRestriction(store, $("#sinput").val());
            }
            else {
                buildGraph(store);
            }
            $("#out").show("");
            renderGraph("out");
            $("#out-support").show();
             showStats(store);
        }
        else {
            status("<span style='color:red'>Invalid RDF Turtle :(</span>" );
        }
    });
}

function status(msg){
    $('#status').html(msg);
}

function resetGraph(store){
    graph = Viva.Graph.graph();
    store.clear();
}

function buildGraph(store){
    store.execute("SELECT * WHERE { ?s ?p ?o }", function(success, results) {
        if(success) {
            for (var i=0; i < results.length; i++) {
                graph.addNode(results[i].s.value, { label : results[i].s.value, type : results[i].s.token });
                graph.addNode(results[i].o.value, { label : results[i].o.value, type : results[i].o.token });
                graph.addLink(results[i].s.value, results[i].o.value, {label : results[i].p.value });
            };
            if($('#useprefixes').is(':checked')){
                buildPrefixList(store);
            }
            status("Successfully built the graph.");
		}
		else {
			status("<span style='color:red'>Problem building the graph, sorry. Blame Michael ...</span>" );
		}
	});
}

function applyRestriction(store, query){
    store.execute(query, function(success, g){
        store.insert(g, "http://turtled.net/restrictions#", function(success) {
            var namedGraphs = ["http://turtled.net/restrictions#"];
            store.executeWithEnvironment("SELECT * WHERE { ?s ?p ?o }", namedGraphs, namedGraphs, function(success, results){
                if(success) {
                    for (var i=0; i < results.length; i++) {
                        graph.addNode(results[i].s.value, { label : results[i].s.value, type : results[i].s.token });
                        graph.addNode(results[i].o.value, { label : results[i].o.value, type : results[i].o.token });
                        graph.addLink(results[i].s.value, results[i].o.value, { label :results[i].p.value });
                    };
                    if($('#useprefixes').is(':checked')){
                        buildPrefixList(store);
                    }
                    status("Successfully build the graph.");
                }
                else {
                    stats("<span style='color:red'>Problem building the graph, sorry.</span>");
                }
            });
        });
    });
}

function renderGraph(containerID){
    var layout = Viva.Graph.Layout.forceDirected(graph, {
        springLength : 200,
        springCoeff : 0.0015,
        dragCoeff : 0.02,
        gravity : -3
    });

    var renderer = Viva.Graph.View.renderer(graph, {
        graphics: graphics,
        renderLinks: true,
        container: document.getElementById(containerID),
        layout: layout
    });
    renderer.run();
}

function showStats(store){
    $("#stats").html("<strong>Stats:</strong> " + gstats.numtriples + "triples(s)");

    store.execute("SELECT (COUNT(DISTINCT ?class) AS ?classcount) { ?s a ?class . }", function(success, results){
        gstats.numclasses = results[0].classcount.value;
        store.execute("SELECT (COUNT(DISTINCT ?s) AS ?subjectcount) { ?s ?p ?o. }", function(success, results){
            gstats.numentities = results[0].subjectcount.value;

            $("#stats").html("<strong>Stats:</strong>" +
                gstats.numtriples + ( gstats.numtriples > 1 ? " triples, " : " triple, " ) +
                gstats.numentities + ( gstats.numentities > 1 ? " entities, " : " entity, ") +
                gstats.numclasses + ( gstats.numclasses > 1 ? "types. " : " type. " )
            );
        });
    });
}


// Prefixes
function loadPrefixes(){
    $.each(prefixes2URIs, function(key, val) {
        URIs2prefixes[val] = key;
    });
}

// Takes a URI and create a shortened version ala prefix:rest,
// if a prefix can be found, otherwise the original URI is returned
// for example: http://schema.org/Thing -> schema:Ting
function lookupPrefix4URI(URI){
    var candidate = "";

    if(URI.indexOf("#") != -1) { // We have a hash URI
        candidate = URI.substring(0, URI.indexOf("#") + 1);
        if(URIs2prefixes[candidate]){
            return URIs2prefixes[candidate] + ":" + URI.substring(URI.lastIndexOf("#") + 1);
        }
        else {
            return URI;
        }
    }
    else {
        if(URI.indexOf("/") != -1){ // We have a slash URI
            candidate =URI.substring(0, URI.lastIndexOf("/") + 1);
            if(URIs2prefixes[candidate]){
                return URIs2prefixes[candidate] + ":" + URI.substring(URI.lastIndexOf("/") + 1);
            }
            else {
                return URI;
            }
        }
        else return URI;
    }
}


function buildPrefixList(store){
    store.execute("SELECT * WHERE {?s ?p ?o }", function(success, results){
        if(success) {
            $("#prefixesused").html("<strong>Prefixes</strong> (<span id='customiseprefixes' class='opt-item' title='click to customize prefixes'>Customise ...</span>)<div id='prefixlist'>");
            $("#prefixesused").css('width', ($(window).width() - $("#main").width() - 100) * 0.95);
            for (var i=0; i < results.length; i++) {
                if (results[i].s.token == "uri") { // Inspect subject for new prefix
                     extendUsedPrefixes(results[i].s.value);
                }
                if (results[i].o.token = "uri") { //inspect object for new prefix
                    extendUsedPrefixes(results[i].o.value);

                }
            }
            if($('#userprefixes').is(':checked')) {
                $("#prefixedused").append("</div><div id='customprefixes'><input type='text' size='3' id='cprefix' value='' /> : <input type='text' size='20' id='cnamespace' value='http://example.org/#' /><button id='addprefix'>add</button></div>");
                $("#prefixesused").show();
            }
        }
    });
}

function extendUsedPrefixes(URI){
    var prefix = getPrefix(URI);
    if((prefix != URI) && ($.inArray(prefix, usedPrefixes) == -1)) { // a prefix has been matched and noy yet added}
        usedPrefixes.push(prefix);
        $("prefixlist").append("<a href='" + prefixes2URIs[prefix] + "' target='_new'>" + prefix + ":</a> ");
        // console.log("added " + prefix );
        }
}

// takes a URI and returns the namespace prefix,
// if a prefix can be found, otherwise te original URI si returned
// for example: http://schema.org/Thing -> schema
function getPrefix(URI){
    var candidate = "";

    if(URI.indexOf("#") != -1){ // we have a slash URI
        canidate = URI.substring(0, URI.indexOf('#') + 1);
        if(URIs2prefixes[candidate]){
            return URIs2prefixes[candidate];
        }
        else {
            return URI;
        }
    }
    else {
        if(URI.indexOf("/") != -1) { // we have a slash URI
            candidate = URI.substring(0, URI.lastIndexOf("/") + 1);
            if(URIs2prefixes[candidate]){
                return URIs2prefixes[candidate];
            }
            else {
                return URI;
            }
        }
        else return URI;
    }
}

// low-level storage API
function buildEntryList(){
    $("#entries").html("");
    for (var i=0; i < MAX_ENTRIES; i++) {
        if(turtlestorage.getItem('turtled.net' + i)) {
            var ename = getCLOB('turtled.net' + i).name;
            var timestamp = getCLOB('turtled.net' + i).timestamp;
            $("#entries").append("<span class='entry' title='last updated on " + timestamp + "' id='turtled.net" + i + "'><img src='../../static/img/entry.png' alt='Saved entry' />" + ename + "</span>");
            entrycntr = i + 1;
        }
    }
}

function saveCLOB(key, name, payload) {
    var entry = { timestamp : new Date(), name: name, payload : payload };
    turtlestorage.setItem(key, JSON.stringify(entry));
}

function getCLOB(key){
    var clob = JSON.parse(turtlestorage.getItem(key));
    return clob;
}