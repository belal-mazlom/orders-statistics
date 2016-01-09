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
        requestDataCountries($(this).val());
    });
    requestDataCountries(1);
});

function requestData(){
    requestDataCountries($('input[name="charttype"]:checked').val());
}

function requestDataCountries(type) {
    $.ajax({
        url: '/statistics/countries_data',
        type: 'POST',
        data: {
            'type': type,
            'stores-selected': storesSelected,
            'timeframe': timeframe,
            'order-status': orderStatus
        },
        dataType: 'JSON',
        success: function (data) {
            showCountriesData(data, type);
        }
    });
}

function showCountriesData(data, type) {
    $('#countries-chart').highcharts({
        chart: {
            type: 'column'
        },
        title: {
            text: 'Most order countries'
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
            valueSuffix: (type == 1 ? '' : '$'),
            pointFormat: (type == 1 ? 'Total orders' : 'Order values') + ': <b>{point.y}</b>'
        },
        series: [{
            name: 'total_orders',
            data: data,
            dataLabels: {
                enabled: true,
                rotation: -90,
                color: '#FFFFFF',
                align: 'right',
                y: 10, // 10 pixels down from the top
                format: (type == 1 ? '' : '{point.y:,.0f}$'),
                style: {
                    fontSize: '13px',
                    fontFamily: 'Verdana, sans-serif'
                }
            }
        }]
    });
}


