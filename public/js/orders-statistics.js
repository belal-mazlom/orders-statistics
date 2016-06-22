/**
 * Created by belalmazlom on 12/19/15.
 */
$(document).ready(function () {
    Highcharts.setOptions({
        lang: {
            thousandsSep: ','
        }
    });
    requestData();
});

function requestData() {
    $.ajax({
        url: '/statistics/orders_data',
        data: {
            'stores-selected': storesSelected,
            'timeframe': timeframe,
            'order-status': orderStatus
        },
        type: 'POST',
        dataType: 'JSON',
        success: function (data) {
            //calc totals
            var total = 0.0;
            for (var i = 0; i < data.series.length; i++) {
                for(var j = 0; j < data.series[i].data.length;j++){
                    total += data.series[i].data[j];
                }
            }

            $(".total-values").html("Totals: $ " + (total).formatMoney(0, '.', ','));

            showOrdersData(data);
        }
    });
}

function showOrdersData(data) {
    $('#orders-values-chart').highcharts({
        chart: {
            style: {
                fontFamily: 'Open Sans'
            }
        },
        title: {
            text: 'Monthly Orders Values',
            x: -20 //center
        },
        subtitle: {
            text: 'Orders by payment type',
            x: -20
        },
        xAxis: {
            categories: data.categories
        },
        yAxis: {
            title: {
                text: 'Values'
            },
            plotLines: [{
                value: 0,
                width: 1,
                color: '#808080'
            }]
        },
        tooltip: {
            valuePrefix: '$',
            pointFormat: '{series.name}: <b>{point.y}</b>'
        },
        legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'middle',
            borderWidth: 0
        },
        series: data.series
    });
}