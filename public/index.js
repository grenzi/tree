/**
 * Created by gager on 12/5/2015.
 */
"use strict";


//Loading tree
$(function(){
    //https://github.com/mar10/fancytree/wiki
    // Create the tree inside the <div id="tree"> element
    //fancytree options http://wwwendt.de/tech/fancytree/demo/#sample-configurator.html
    $("#tree").fancytree({
        source: { url: "/zynxfull.json", dataType: "json" },
        lazyLoad: function(event, data) {
            data.result = { url: "/zynxfull.json", dataType: "json" };
        },
        activeVisible: true, // Make sure, active nodes are visible (expanded).
        aria: false, // Enable WAI-ARIA support.
        autoActivate: true, // Automatically activate a node when it is focused (using keys).
        autoCollapse: false, // Automatically collapse all siblings, when a node is expanded.
        autoScroll: true, // Automatically scroll nodes into visible area.
        clickFolderMode: 4, // 1:activate, 2:expand, 3:activate and expand, 4:activate (dblclick expands)
        checkbox: false, // Show checkboxes.
        debugLevel: 2, // 0:quiet, 1:normal, 2:debug
        disabled: false, // Disable control
        focusOnSelect: true, // Set focus when node is checked by a mouse click
        generateIds: false, // Generate id attributes like <span id='fancytree-id-KEY'>
        idPrefix: "zyn_", // Used to generate node id´s like <span id='fancytree-id-<key>'>.
        icon: true, // Display node icons.
        keyboard: true, // Support keyboard navigation.
        keyPathSeparator: "/", // Used by node.getKeyPath() and tree.loadKeyPath().
        minExpandLevel: 1, // 1: root node is not collapsible
        quicksearch: false, // Navigate to next node by typing the first letters.
        selectMode: 2, // 1:single, 2:multi, 3:multi-hier
        tabbable: true, // Whole tree behaves as one single control
        extensions: ["table"],
        titlesTabbable: false, // Node titles can receive keyboard focus
        table: {
            indentation: 20,      // indent 20px per node level
            nodeColumnIdx: 1
        },
        renderColumns: function(event, data){renderZynxColumn(event,data);},
        postProcess: function(event, data) {
            parseZynxJson(event, data);
        }
    });//fancytree
}); //on doc ready function()


//this is called to build the titles. it can offload some work from the server controller
function calcZynxTitle(n){

    n.title = "ERROR PROCESSING ITEM!!!";

    if (n.data.itemtype == "Section" || n.data.itemtype=="Reminder")
    {
        if (n.data.term == undefined)
            n.title = "<span class='zynx-title-textoverride'>"+coalesce(n.data.textoverride)+" </span>";
        else
            n.title = "<span class='zynx-title-term'>"+coalesce(n.data.term)+" </span>";
    }//if section
    if (n.data.itemtype == "Orderable" || n.data.itemtype == "Medication")
    {
        //is this a detail record?
        if (n.extraClasses.indexOf('zynx-detail') > -1)
        {
            n.title = "<span class='zynx-title-itemdetail'>"+coalesce(n.data.itemdetail)+" </span>";
        }
        else //not detail
        {
            if (n.data.term == "CHS Non Med - Dummy term" || n.data.term== "CHS Med - Dummy term")
            {
                n.title = "<span class='zynx-title-textoverride'>"+coalesce(n.data.textoverride)+" </span>";
                n.title += "<span class='zynx-title-itemdetail'>"+coalesce(n.data.itemdetail)+" </span>";
            }
            else //not detail, not dummy term
                n.title = "<span class='zynx-title-term'>"+coalesce(n.data.term)+" </span>";

            n.title += "<span class='zynx-title-additionalinfo'>"+coalesce(n.data.additionalinfo)+" </span>";
        }
    }//if orderable

    var i;
    if (n.children != undefined && n.children.length > 0)
        for (i=0; i< n.children.length; i++)
            calcZynxTitle(n.children[i]);


}

function parseZynxJson(event, data) {
    var i;
    for (i=0; i<data.response.length; i++)
        calcZynxTitle(data.response[i]);
    return data;
}
//this is called to help build the table row. the tr td exists as part of the node itself, so we're really dealling
//with the controls data structure, which is actually great.
function renderZynxColumn(event, data) {
    var node = data.node;
    var $tdList = $(node.tr).find(">td");
    $tdList.eq(0).text(node.getIndexHier()).html("icons");
    if (node.data.url != undefined)
    {
        var anchor = '<a href="' +node.data.url+'" target="_blank">';
        if (node.data.url.indexOf('zynx') > -1)
            anchor += 'Evidence';
        else
            anchor += 'Source';
        anchor += '</a>';
        $tdList.eq(2).html(anchor);
    }
    $tdList.eq(3).html("<button>actions!</button>");
}


//from http://wwwendt.de/tech/fancytree/demo/#sample-api.html
function getTreeAsJson() {
    // Convert the whole tree into an dictionary
    var tree = $("#tree").fancytree("getTree");
    var d = tree.toDict(true);
    $('#console').html(syntaxHighlight(d));
}


//helper functions
function coalesce(str)
{
    //var whatIWant = undefined || "well defined"; // is "well defined"
    return str || '';
}

function syntaxHighlight(json) {
    if (typeof json != 'string') {
        json = JSON.stringify(json, undefined, 2);
    }
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        var cls = 'number';
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'key';
            } else {
                cls = 'string';
            }
        } else if (/true|false/.test(match)) {
            cls = 'boolean';
        } else if (/null/.test(match)) {
            cls = 'null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
    });
}

