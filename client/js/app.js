/* app.js */

var App = function () {
    // get the configuration data for this app
    this.host = window.location.origin;
    this.fieldsToHide = ["_id", "_created", "_modified", "group", "settings"];
};

// useful conversion function
App.prototype.formDataToJSON = function (formData) {
    var convertedJSON = {};
    formData.forEach(function (value, key) {
        convertedJSON[key] = value;
    });
    return convertedJSON;
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
App.prototype.loadTable = function (selector, tableName, tableDesc) {
    var self = this;
    this.activeSelector = selector;
    this.currentTableName = tableName;
    var currentTable = $(selector);
    
    //TODO: this url and port may change - make configurable
    var currentUrl = self.host + '/api/dfind/' + tableName + '/query/%7B%7D';
    
    var tableTitle = tableDesc || tableName;
    if (tableTitle === "root") {
        tableTitle = "Available Tables";
    }
    $("#tableName").html(tableTitle);
    
    if (currentTable) {
        self.getData(currentUrl, function (data) {
            console.log("Table data: " + data);
            
            // if there is data.data we can build a table.
            if (data.data) {
                var columns = [];
                var columnNames = Object.keys(data.data[0]);
                for (var i in columnNames) {
                    var isVis = true;
                    var isSearch = true;
                    // hide the _id field and others
                    if (app.fieldsToHide.includes(columnNames[i])) {
                        isVis = false;
                        isSearch = false;
                    }                    
                    columns.push({data: columnNames[i], title: columnNames[i], visible: isVis, searchable: isSearch, defaultContent: "<i>Not set</i>"});
                }
                // init table
                self.activeTable = $(selector).DataTable({
                    data: data.data,
                    columns: columns,
                    dom: 'Bfrtip',
                    buttons: [
                        {
                            extend: 'excelHtml5',
                            exportOptions: {
                                columns: ':visible'
                            }
                        },
                        {
                            extend: 'csvHtml5',
                            exportOptions: {
                                columns: ':visible'
                            }
                        },                        
                        {
                            extend: 'pdfHtml5',
                            exportOptions: {
                                columns: ':visible'
                            }
                        },                        
                    ],
                    "language": {
                      "emptyTable": "No data available in table"
                    },              
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
                            console.log(tableRow.name + " - " + tableRow.desc); 
                            $(self.activeSelector).html("");
                            self.loadTable(selector, tableRow.name, tableRow.desc);
                        }
                    });  
                }

                if (tableName != "root") {
                    self.activeTable.button().add(0, {
                        action: function (e, dt, button, config) {
                            //console.log("Table Name: " + tableName + "  Fields: " + columnNames);
                            $("#formModal").modal('show');
                            var htmlData = '<input type="hidden" id="formAction" name="formAction" value="addRow">';
                            for (var i in columnNames) {
                                if (!app.fieldsToHide.includes(columnNames[i])) {
                                    htmlData += `<div class="form-group"> 
                                                    <label for="form_${columnNames[i]}">${columnNames[i]}</label>
                                                    <input type="text" class="form-control" id="${columnNames[i]}" name="${columnNames[i]}" placeholder="Enter Data" required>
                                                </div>`;
                                }
                            }
                            $("#action-modal-body").html(htmlData);
                        },
                        text: 'Add Row'
                    }); 
                    
                    self.activeTable.button().add(1, {
                        action: function (e, dt, button, config) {
                            var tableRow = dt.row( { selected: true } ).data();
                            console.log(tableRow._id);
                            var rowid = tableRow._id;
                            $("#formModal").modal('show');
                            var htmlData = '<input type="hidden" id="formAction" name="formAction" value="editRow">';
                            htmlData += '<input type="hidden" id="rowid" name="rowid" value="' + rowid + '">';
                            for (var i in columnNames) {
                                if (!app.fieldsToHide.includes(columnNames[i])) {
                                    htmlData += `<div class="form-group"> 
                                                    <label for="form_${columnNames[i]}">${columnNames[i]}</label>
                                                    <input type="text" class="form-control" id="${columnNames[i]}" name="${columnNames[i]}" value="${tableRow[columnNames[i]]}" required>
                                                </div>`;
                                }
                            }
                            $("#action-modal-body").html(htmlData);
                        },
                        text: 'Edit Row'
                    });                     

                    self.activeTable.button().add(2, {
                        extend: 'selectedSingle',
                        text: 'Delete',
                        action: function ( e, dt, button, config ) {
                            var tableRow = dt.row( { selected: true } ).data();
                            console.log(tableRow._id); 
                            
                            $.get(self.host + "/api/remove/" + tableName + "/query/%7B%22_id%22:%22" + tableRow._id + "%22%7D", function (data) {
                                self.activeTable.ajax.reload(function () { 
                                    //console.log("Refreshing table");
                                });
                                console.log(data);
                            });                            
                        }
                    });                      
                }
            
                /*table.button().add(1, {
                    extend: 'selectNone',
                    text: 'Deselect'
                });      */  
            } else {
                //TODO: what to do if there is no data?
                $(self.activeSelector).html("No data");
            }
        });     
    }    
};

App.prototype.action = function (action, args) {
    var self = this;
    switch (action) {
        case "showTables":
            this.mainDiv.hide();
            this.tableDiv.show();  
            if (args) {
                self.activeTable.destroy();
                $(self.activeSelector).html("");
                self.loadTable(self.activeSelector, args);
            }
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

// handle form submission - with data 
App.prototype.handleForm = function (data) {
    var self = this;
    var action = data.formAction;
    // exists for query
    var rowid = data.rowid;
    console.log("Handling form submission");
    console.log("Row ID: " + rowid);
    // what am i doing here? cleaning up the object?
    delete data.formAction;
    delete data.rowid;
    var htmlData = JSON.stringify(data);
    switch (action) {
        case "addRow":
            console.log(encodeURIComponent(htmlData));
            $.get(self.host + "/api/insert/" + self.currentTableName + "/doc/" + encodeURIComponent(htmlData), function (data) {
                self.activeTable.ajax.reload(function () { 
                    //console.log("Refreshing table");
                });
            });   
            break;
        case "editRow":
            console.log(encodeURIComponent(htmlData));
            $.get(self.host + "/api/update/" + self.currentTableName + "/query/%7B%22_id%22:%22" + rowid + "%22%7D" + "/update/" +  encodeURIComponent(htmlData) + "/opts/%7B%22multi%22%3A%22false%22%2C%22upsert%22%3A%22false%22%7D", function (data) {
                self.activeTable.ajax.reload(function () { 
                    //console.log("Refreshing table");
                });
            });   
            break;            
        default: 
            console.log("No form action");
    }
};

// When the page loads, initialize things
$(document).ready(function () {
     
    app = new App();
    
    // load menu
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
            var action = $(this).data("action");
            var args = $(this).data("args");
            app.action(action, args);
        }
    });
    
    // form modal watcher
    $("#modalForm").submit(function (event) {
        event.preventDefault();
        var formData = new FormData(event.target);
        var formDataJson = app.formDataToJSON(formData);
        $("#formModal").modal('hide');
        app.handleForm(formDataJson); 
        //TODO: handle errors that might occur in the api query
    });
    
    app.mainDiv.show();
    app.tableDiv.hide();
    
    // load the root table
    app.loadTable("#currentTable", "root", "Available Tables");

});
