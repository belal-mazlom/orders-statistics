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
                    "data": function (d) {
                        d['title'] = $('[name="title"]').val();
                        d['url'] = $('[name="url"]').val();
                        d['storeStatus'] = $('.store-status-list').val();
                    }
                },
                columns: [
                    {mData: 'title', 'orderable': false},
                    {mData: 'url', 'orderable': false},
                    {mData: 'last_update', 'orderable': false},
                    {
                        mData: 'status', 'orderable': false, "render": function (data, type, row) {
                        return data == 1 ? '<span class="label label-sm label-success"> Connected </span>' : '<span class="label label-sm label-danger"> No access </span>';
                    }
                    },
                    {
                        mData: 'actions', 'orderable': false, "render": function (data, type, row) {
                        return '<a href="javascript:;" class="btn blue btn-outline btn-sync" data-id="' + data + '" ><i class="fa fa-search"></i> Sync now</a><button type="button" class="btn green btn-outline edit-btn" data-id="' + data + '" >Edit</button><button type="button" class="btn red btn-outline delete-btn" data-id="' + data + '">Delete</button>';
                    }
                    },
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

$(function () {
    TableAjax.init();
    $(document).on("click", ".btn-sync", function () {
        var btn = $(this);
        var storeId = btn.attr("data-id");
        //show Preloader
        $.ajax({
            url: '/data/request-orders',
            data: {id: storeId},
            success: function (data) {
                btn.parent().prev().prev().html(data);
            }
        });
    });

    $(document).on("click", ".edit-btn", function () {
        var $btn = $(this);
        var storeId = $btn.attr("data-id");

        bootbox.dialog({
                title: "Edit store",
                message: '<div class="row">  ' +
                '<div class="col-md-12"> ' +
                '<form class="form-horizontal"> ' +
                '<div class="form-group"> ' +
                '<label class="col-md-4 control-label" for="title">Title</label> ' +
                '<div class="col-md-7"> ' +
                '<input id="title-field" name="title" type="text" placeholder="Store title" class="form-control input-md" value="' + $btn.parent().prev().prev().prev().prev().html() + '" /> ' +
                '</div></div>' +
                '<div class="form-group"> ' +
                '<label class="col-md-4 control-label" for="name">URL</label> ' +
                '<div class="col-md-7"> ' +
                '<input id="url-field" name="url" type="text" placeholder="Store URL" class="form-control input-md" value="' + $btn.parent().prev().prev().prev().html() + '"/> ' +
                '</div></div>' +
                '</div> </div>' +
                '</form> </div></div>',
                buttons: {
                    cancel: {
                        label: "Cancel",
                        className: "btn-default"
                    },
                    success: {
                        label: "Save",
                        className: "btn-success",
                        callback: function () {
                            var title = $('#title-field').val();
                            var url = $('#url-field').val();
                            if (title.length < 1 || url.length < 1) {
                                return false;
                            }

                            $.ajax({
                                url: "/stores/update",
                                data: {
                                    title: title,
                                    url: url,
                                    id: storeId
                                },
                                type: "POST",
                                dataType: "JSON",
                                success: function (data) {
                                    grid.getDataTable().ajax.reload();
                                }
                            });
                        }
                    }
                }
            }
        );
    });

    $(document).on("click", ".delete-btn", function () {
        var $btn = $(this);
        var storeId = $btn.attr("data-id");

        bootbox.confirm("Are you sure to delete store? It will remove related orders!", function (response) {
            if (response) {
                $.ajax({
                    url: '/stores/delete',
                    data: {
                        id: storeId
                    },
                    type: 'POST',
                    dataType: 'JSON',
                    success: function (data) {
                        grid.getDataTable().ajax.reload();
                    }
                });
            }
        });
    });

    $('[name="title"]').keypress(function (e) {
        if (e.which == 13) {
            grid.getDataTable().ajax.reload();
        }
    });

    $('[name="url"]').keypress(function (e) {
        if (e.which == 13) {
            grid.getDataTable().ajax.reload();
        }
    });

    $('.store-status-list').change(function () {
        grid.getDataTable().ajax.reload();
    });

});