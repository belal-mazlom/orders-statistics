/**
 * Created by belalmazlom on 12/19/15.
 */
$(document).ready(function() {
    requestData();
});

function requestData(){
    $.ajax({
        url: '/statistics/shipping_data',
        data: {
            'stores-selected': storesSelected,
            'timeframe': timeframe,
            'order-status': orderStatus
        },
        type: 'POST',
        dataType: 'JSON',
        success: function(data){
            showShippingData(data);
        }
    });
}

function showShippingData(data){
    $('#shipping-chart').highcharts({
        chart: {
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false,
            type: 'pie'
        },
        title: {
            text: ''
        },
        subtitle: {
            text: 'Most Shipping types used',
            x: -20
        },
        tooltip: {
            headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
            pointFormat: '{point.name}: <b>{point.percentage:.1f}%</b>'
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: false
                },
                showInLegend: true
            }
        },
        series: [{
            name: 'Shipping',
            colorByPoint: true,
            data: data
        }]
    });
}