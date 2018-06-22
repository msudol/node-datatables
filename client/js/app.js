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

App.prototype.loadMenu = function (loc, url, callback) {
    $(loc).load(url, callback);
};

// this example gets the columns in a semi-dynamic way
$(document).ready(function () {
     
    app = new App();
    
    var main = $("#main");
    
    app.loadMenu("#navHeader", "menu/menu.html", function() {
        // inspect the newly loaded menu to make it active
        var el = $("#nav_header");
        console.log("Menu loaded");
    });
    
    
    var currentTable = $("#currentTable");
    
    if (currentTable) {
        var load = currentTable.data("load");
        console.log(load);
        app.getData("http://localhost:3000/api/dfind/" + load + "/query/%7B%7D", function ( data ) {
            var columns = [];
            console.log(data.data[0]);
            //data = JSON.parse(data);
            columnNames = Object.keys(data.data[0]);
            for (var i in columnNames) {
                columns.push({data: columnNames[i], title: columnNames[i], defaultContent: "<i>Not set</i>"});
            }
            var table = $('#currentTable').DataTable({
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
    

});
