/**
 * Created by belalmazlom on 12/21/15.
 */
var grid;
var TableAjax = function () {
    var handleRecords = function () {
        grid = new Datatable();
        grid.init({
            src: $("#datatable_stores"),
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
                    "url": "/stores/data", // ajax source
                    "data": function ( d ) {
                        d['title'] = $('[name="title"]').val();
                        d['url'] = $('[name="url"]').val();
                    }
                },
                columns: [
                    {mData: 'title', 'orderable': false},
                    {mData: 'url', 'orderable': false},
                    {mData: 'last_update', 'orderable': false},
                    {mData: 'status', 'orderable': false, "render": function ( data, type, row ) { return data == 1?'<span class="label label-sm label-success"> Connected </span>':'<span class="label label-sm label-danger"> No access </span>'; }},
                    {mData: 'actions', 'orderable': false, "render": function ( data, type, row ) { return '<a href="javascript:;" class="btn blue-hoki btn-sync" data-id="' + data + '" ><i class="fa fa-search"></i> Sync now</a>'; }},
                ]
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
    $(document).on("click", ".btn-sync", function(){
        var btn = $(this);
        var storeId = btn.attr("data-id");
        //show Preloader
        $.ajax({
            url: '/data/request-orders',
            data: {id: storeId},
            success: function(data){
                btn.parent().prev().prev().html(data);
            }
        });
    });

    $('[name="title"]').keypress(function(e){
        if(e.which == 13) {
            grid.getDataTable().ajax.reload();
        }
    });

    $('[name="url"]').keypress(function(e){
        if(e.which == 13) {
            grid.getDataTable().ajax.reload();
        }
    });
});