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

// this example gets the columns in a semi-dynamic way
$(document).ready(function () {
     
    app = new App();
    
    app.getData("http://localhost:3000/api/dfind/root/query/%7B%7D", function ( data ) {
        var columns = [];
        console.log(data.data[0]);
        //data = JSON.parse(data);
        columnNames = Object.keys(data.data[0]);
        for (var i in columnNames) {
            columns.push({data: columnNames[i], title: columnNames[i]});
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
    
});
