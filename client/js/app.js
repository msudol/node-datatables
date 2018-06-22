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
    var self = this;
    
    var currentTable = $(selector);
    var currentUrl = 'http://localhost:3000/api/dfind/' + tableName + '/query/%7B%7D';
    
    if (currentTable) {
        self.getData(currentUrl, function (data) {
            //console.log(data);
            var columns = [];
            var columnNames = Object.keys(data.data[0]);
            for (var i in columnNames) {
                columns.push({data: columnNames[i], title: columnNames[i], defaultContent: "<i>Not set</i>"});
            }
            // init table
            self.activeTable = $(selector).DataTable({
                data: data.data,
                columns: columns,
                dom: 'Bfrtip',
                select: {
                    style: "single",
                    items: "row",
                    blurable: true
                }                   
            });
            // set the url for this table
            self.activeTable.ajax.url(currentUrl);
            
            // programmatically add buttons based on things
            self.activeTable.button().add(0, {
                action: function (e, dt, button, config) {
                    console.log("Refreshing");
                    self.activeTable.ajax.reload(function (data) { 
                        console.log("Refresh complete");
                        console.log(data);
                    });
                },
                text: 'Refresh'
            });
            
            if (tableName == "root") {
            self.activeTable.button().add(1, {
                    extend: 'selectedSingle',
                    text: 'Open Selected Table',
                    action: function ( e, dt, button, config ) {
                        var tableRow = dt.row( { selected: true } ).data();
                        self.activeTable.destroy();
                        console.log(tableRow.name); 
                        self.loadTable(selector, tableRow.name);
                    }
                });  
            }
            
            /*table.button().add(1, {
                extend: 'selectNone',
                text: 'Deselect'
            });      */        
            
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
            //console.log($(this).data("action"));
            app.action($(this).data("action"));
        }
    });
    
    app.mainDiv.show();
    app.tableDiv.hide();
    
    // load the root table
    app.loadTable("#currentTable", "root");

});
