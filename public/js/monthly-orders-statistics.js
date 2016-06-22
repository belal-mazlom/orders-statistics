/**
 * Created by belalmazlom on 12/19/15.
 */
$(document).ready(function () {
    Highcharts.setOptions({
        lang: {
            thousandsSep: ','
        }
    });

    $('input[name="charttype"]').change(function () {
        requestDataMonthlyOrders($(this).val());
        $(".export-btn").attr("href", "/export/monthly-orders-statistics?type=" + $(this).val());
    });
    requestDataMonthlyOrders(1);
});

function requestData() {
    requestDataMonthlyOrders($('input[name="charttype"]:checked').val());
}

function requestDataMonthlyOrders(type) {
    $.ajax({
        url: '/statistics/monthly_orders_data',
        type: 'POST',
        data: {
            'type': type,
            'stores-selected': storesSelected,
            'timeframe': timeframe,
            'order-status': orderStatus
        },
        dataType: 'JSON',
        success: function (data) {
            var total = 0.0;
            for (var i = 0; i < data.length; i++) {
                total += data[i][1];
            }

            if (type == 2) {
                $(".total-values").html("Totals: $ " + (total).formatMoney(0, '.', ','));
            } else {
                $(".total-values").html("Totals: " + (total).formatMoney(0, '.', ','));
            }

            showCountriesData(data, type);
        }
    });
}

function showCountriesData(data, type) {
    $('#monthly-orders-chart').highcharts({
        chart: {
            type: 'column'
        },
        title: {
            text: (type == 1 ? 'Monthly total orders' : 'Monthly values orders')
        },
        subtitle: {
            text: ''
        },
        xAxis: {
            type: 'category',
            labels: {
                rotation: -45,
                style: {
                    fontSize: '13px',
                    fontFamily: 'Verdana, sans-serif'
                }
            }
        },
        yAxis: {
            min: 0,
            title: {
                text: (type == 1 ? 'Total orders' : 'Order values')
            }
        },
        legend: {
            enabled: false
        },
        tooltip: {
            valuePrefix: (type == 1 ? '' : '$'),
            pointFormat: (type == 1 ? 'Total orders' : 'Order values') + ': <b>{point.y}</b>'
        },
        series: [{
            name: 'total_orders',
            data: data
        }]
    });
}


