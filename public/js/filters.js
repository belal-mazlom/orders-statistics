/**
 * Created by belalmazlom on 12/26/15.
 */
var storesSelected = -1;
var orderStatus = -1;
var timeframe = -1;

$(function(){
    $('.filter-slider-btn').click(function (e) {
        $('body').toggleClass("page-quick-sidebar-open");
    });
    $('.close-filter').click(function (e) {
        $('body').toggleClass("page-quick-sidebar-open");
    });

    $("#stores-list").select2({
        placeholder: "Specify store ...",
        width: null
    });
    $("#order-status-list").select2({
        placeholder: "Specify order status ...",
        width: null
    });

    $("#timeframe-list").select2({
        placeholder: "Specify time frame ...",
        width: null,
        minimumResultsForSearch: -1
    });

    $("#stores-list").change(function () {
        storesSelected = $(this).val();
        if (storesSelected == null)
            storesSelected = -1;
    })

    $("#order-status-list").change(function () {
        orderStatus = $(this).val();
        if (orderStatus == null)
            orderStatus = -1;
    });

    $("#timeframe-list").change(function () {
        timeframe = $(this).val();
        if (timeframe == null)
            timeframe = -1;
    });

    $('.filter-btn').click(function () {
        if (typeof(grid) != 'undefined') {
            grid.getDataTable().ajax.reload();
        } else {
            requestData();
        }
    });

    $('.reset-filter-btn').click(function () {
        $("#stores-list").select2('val', '');
        $("#timeframe-list").select2('val', '-1');
        $("#order-status-list").select2('val', '');

        $.get('/data/reset-filters', function(){
            if (typeof(grid) != 'undefined') {
                grid.getDataTable().ajax.reload();
            } else {
                requestData();
            }
        });
    });

    if ($('input[name="selected-stores"]').length) {
        var stores = $('input[name="selected-stores"]').val().split(",");
        $("#stores-list").select2('val', stores);

        if ($('input[name="selected-timeframe"]').length) {
            $("#timeframe-list").select2('val', $('input[name="selected-timeframe"]').val());
        }
        if ($('input[name="selected-orderstatus"]').length) {
            var stautss = $('input[name="selected-orderstatus"]').val().split(",");
            $("#order-status-list").select2('val', stautss);
        }

        if (typeof(grid) != 'undefined') {
            grid.getDataTable().ajax.reload();
        } else {
            requestData();
        }
    }
});