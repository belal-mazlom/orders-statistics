/**
 * Created by belalmazlom on 12/21/15.
 */



var TableAjax = function () {
    var handleRecords = function () {
        var grid = new Datatable();
        grid.init({
            src: $("#datatable_users"),
            onSuccess: function (grid) {
            },
            onError: function (grid) {
            },
            dataTable: { // here you can define a typical datatable settings from http://datatables.net/usage/options
                "lengthMenu": [
                    [10, 20, 50, 100, 150, -1],
                    [10, 20, 50, 100, 150, "All"] // change per page values here
                ],
                "pageLength": 10, // default record count per page
                "ajax": {
                    "url": "/users/data", // ajax source
                },
                columns: [
                    {mData: 'username', 'orderable': false},
                    {mData: 'email', 'orderable': false},
                    {mData: 'active', 'orderable': false, "render": function ( data, type, row ) { return data == 1?'<span class="label label-sm label-success"> Active </span>':'<span class="label label-sm label-danger"> Disabled </span>'; }}
                ]
                 // set first column as a default sort by asc
            }
        });

    }

    return {
        //main function to initiate the module
        init: function () {
            handleRecords();
        }
    };
}();

$(function(){
    TableAjax.init();
});