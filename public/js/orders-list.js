/**
 * Created by belalmazlom on 12/21/15.
 */

var grid;
var TableAjax = function () {
    var handleRecords = function () {
        grid = new Datatable();
        grid.init({
            src: $("#datatable_orders"),
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
                    "url": "/orders/data", // ajax source
                    "data": function ( d ) {
                        d['stores-selected'] = storesSelected;
                        d['timeframe'] = timeframe;
                        d['order-status'] = orderStatus;
                    }
                },
                columns: [
                    {mData: 'title', 'orderable': false},
                    {mData: 'order_id', 'orderable': false},
                    {mData: 'customer_name', 'orderable': false},
                    {mData: 'customer_email', 'orderable': false},
                    {mData: 'subtotal', 'orderable': false},
                    {mData: 'total', 'orderable': false},
                    {mData: 'currency', 'orderable': false},
                    {mData: 'payment_code', 'orderable': false},
                    {mData: 'state', 'orderable': false},
                    {mData: 'shipping_method', 'orderable': false},
                    {mData: 'country_code', 'orderable': false},
                    {mData: 'create_date', 'orderable': false},
                ]
                // set first column as a default sort by asc
            }
        });

    };
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