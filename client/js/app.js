var App = function () {
    // constructor function
};

// getData calls on a url and a callback to get ajax response from the API
App.prototype.getData = function (url, callback) {
    $.ajax({
      url: url,
      success: callback
    });
};

// loadMenu into selector (jquery)
App.prototype.loadMenu = function (selector, url, callback) {
    $(selector).load(url, callback);
};

// load table of tableName into selector 
App.prototype.loadTable = function (selector, tableName) {
    
    var currentTable = $(selector);
    if (currentTable) {
        app.getData("http://localhost:3000/api/dfind/" + tableName + "/query/%7B%7D", function (data) {
            var columns = [];
            console.log(data.data[0]);
            //data = JSON.parse(data);
            columnNames = Object.keys(data.data[0]);
            for (var i in columnNames) {
                columns.push({data: columnNames[i], title: columnNames[i], defaultContent: "<i>Not set</i>"});
            }
            var table = $(selector).DataTable({
                data: data.data,
                columns: columns,
                dom: 'Bfrtip',
                buttons: [
                    {
                        extend: 'selectedSingle',
                        text: 'Log selected data',
                        action: function ( e, dt, button, config ) {
                            console.log( dt.row( { selected: true } ).data() );
                        }
                    },
                    {
                        extend: 'selectNone',
                        text: 'Deselect'
                    },
                    {   
                        text: 'Refresh',
                        action: function (e, dt, node, config ) {
                            table.ajax.reload();
                        }
                    }
                ],
                select: {
                    style: "single",
                    items: "row",
                    blurable: true
                }                   
            });
        });     
    }    
};

App.prototype.action = function (action, args) {
    
    switch (action) {
        case "showTables":
            this.mainDiv.hide();
            this.tableDiv.show();  
            break;
        default: 
            console.log("Action with no values");     
    }
    
};

App.prototype.toggleView = function (on, off) {
    this.mainDiv.toggle();
    this.tableDiv.toggle();  
};

App.prototype.defineDivs = function (main, tables) {
    this.mainDiv = $(main);
    this.tableDiv = $(tables);
};

// When the page loads, initialize things
$(document).ready(function () {
     
    app = new App();
    
    app.loadMenu("#navHeader", "menu/menu.html", function() {
        // inspect the newly loaded menu to make it active
        var el = $("#nav_header");
        console.log("Menu loaded");
    });
    
    app.defineDivs("#app_main", "#app_tables");
    
    // action watcher
    $("#app_body").on("click", '.action', function (event) {
        event.preventDefault();
        if ($(this).hasClass("disabled")) {
            return;
        } else {
            console.log($(this).data("action"));
            app.action($(this).data("action"));
        }
    });
    
    app.mainDiv.show();
    app.tableDiv.hide();
    
    // load the root table
    app.loadTable("#currentTable", "root");

});
