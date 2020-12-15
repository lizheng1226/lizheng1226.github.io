var mapArea = [
    ['Japan', 0],
    ['Rest of World', 1],
    ['Europe', 2],
    ['Africa', 3],
    ['North America', 4],
    ['South America', 5],
    ['Oceania', 6],
];

var nameMap = {}, mapKeys = [], mapData = [], areaTotal = {};

function fmt(floatValue, len) {
    len = len || 1;
    return parseFloat(floatValue.toFixed(len)) || 0;
}

function parse(floatValue){
    return parseFloat(floatValue) || 0;
}

function setNameMap(json) {
    nameMap = {};
    json.features.forEach(function (item) {
        var prop = item.properties;
        //nameMap[prop['hc-key']] = prop['name'];
        nameMap[prop['name']] = prop['hc-key'];
    });
    nameMap['Japan'] = nameMap['Asia'];
}

function countByArea() {
    var result = {}, keys = [];
    mapArea.forEach(function (item) {
        var key = item[0];
        result[key] = 0;
        keys.push(key);
    });
    currentData.forEach(function (item) {
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            if (item[key]) {
                result[key] += parse(item[key]);
            }
        }
    });
    result['global'] = result['North America'] + result['Europe'] + result['Japan'] + result['Rest of World'];
    areaTotal = result;
    mapData = [];
    keys.forEach(function (key) {
        var hcKey = nameMap[key];
        mapData.push([hcKey, parse(result[key].toFixed(2))]);
    });
    console.log(mapData);
    console.log(result)
    return result;
    //console.log(JSON.stringify(mapData));
}

function showMap() {
    Highcharts.mapChart('global-map', {
        title: {
            text: "Total Regional Sales(in millions) by " + currentType.toUpperCase(),
        },
        subtitle: {
            text: 'Source: <a href="https://www.kaggle.com/sidtwr/videogames-sales-dataset">Video Games Sales Dataset</a>'
        },
        mapNavigation: {
            enabled: true,
            buttonOptions: {
                verticalAlign: 'bottom'
            }
        },
        colorAxis: {
            min: 0,
            stops: [
                [0, '#eee'],
                [0.5, Highcharts.getOptions().colors[0]],
                [1, Highcharts.Color(Highcharts.getOptions().colors[0]).brighten(-0.5).get()]
            ]
        },
        series: [{
            data: mapData,
            mapData: geoJson,
            joinBy: 'hc-key',
            name: currentType.toUpperCase(),
            states: {
                hover: {
                    color: '#a4edba'
                },
            },
            dataLabels: {
                enabled: false,
                format: '{point.name}'
            }
        }]
    });
    var td = document.querySelectorAll("#table tbody td");
    td[0].innerHTML = fmt(areaTotal['North America']) + " million";
    td[1].innerHTML = fmt(areaTotal['Europe']) + " million";
    td[2].innerHTML = fmt(areaTotal['Japan']) + " million";
    td[3].innerHTML = fmt(areaTotal['Rest of World']) + " million";
    td[4].innerHTML = fmt(areaTotal['global']) + " million";
}

function changeType() {
    var sel = document.getElementById("type-sel");
    var i = sel.selectedIndex;
    var value = sel.options[i].value;
    if (value == "xbox") {
        currentData = XBoxData;
    } else {
        currentData = PS4Data;
    }
    currentType = value;
    countByArea();
    showMap();
}

function countByGenre(data, top) {
    var result = {};
    data.forEach(function (item) {
        var key = item.Genre;
        if (!result[key]) {
            result[key] = 0;
        }
        result[key]++;
    });
    var array = [];
    for (var key in result) {
        array.push({
            name: key,
            y: result[key]
        });
    };
    array.sort(function (a, b) {
        return b.y - a.y;
    });
    if (top) {
        array = array.splice(0, top);
    }
    return array;
}

function showPieChart(elId, data, title) {
    var array = countByGenre(data, 10);
    Highcharts.chart(elId, {
        chart: {
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false,
            type: 'pie'
        },
        title: {
            text: title
        },
        subtitle: {
            text: 'Source: <a href="https://www.kaggle.com/sidtwr/videogames-sales-dataset">Video Games Sales Dataset</a>'
        },
        tooltip: {
            pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: true,
                    format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                    style: {
                        color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                    }
                }
            }
        },
        series: [{
            name: title,
            colorByPoint: true,
            data: array
        }]
    });
}

function countByPublisher(xbox, ps4, top){
    var result = {};
    xbox.forEach(function (item) {
        var key = item.Publisher;
        if (!result[key]) {
            result[key] = {xbox: 0, ps4: 0, total: 0};
        }
        result[key].xbox += parse(item.Global);
        result[key].total += parse(item.Global);
    });
    ps4.forEach(function (item) {
        var key = item.Publisher;
        if (!result[key]) {
            result[key] = {xbox: 0, ps4: 0, total: 0};
        }
        result[key].ps4 += parse(item.Global);
        result[key].total += parse(item.Global);
    });
    var array = [];
    for (var key in result) {
        array.push({
            name: key,
            xbox: result[key].xbox,
            ps4: result[key].ps4,
            total: result[key].total
        });
    };
    array.sort(function (a, b) {
        return b.total - a.total;
    });
    if (top) {
        array = array.splice(0, top);
    }
    return array;
}

function showBarChart(){
    var array = countByPublisher(XBoxData, PS4Data, 10);
    var legend = [], xbox = [], ps4 = [];
    array.forEach(function(item){
        legend.push(item.name);
        xbox.push(fmt(item.xbox));
        ps4.push(fmt(item.ps4));
    });
    Highcharts.chart('bar-chart', {
        chart: {
            type: 'bar'
        },
        title: {
            text: 'Top 10 Game Makers Breakdown'
        },
        subtitle: {
            text: 'Source: <a href="https://www.kaggle.com/sidtwr/videogames-sales-dataset">Video Games Sales Dataset</a>'
        },
        xAxis: {
            categories: legend
        },
        yAxis: {
            min: 0,
            title: {
                text: 'Total Global Sales(in millions)'
            }
        },
        legend: {
            align: "center",
        },
        colors: ["#0e7a0d", " #006FCD"],
        plotOptions: {
            series: {
                stacking: 'normal'
            }
        },
        series: [{
            name: 'XBox',
            data: xbox
        }, {
            name: 'PS4',
            data: ps4
        }]
    });
}

function countByGame(xbox, ps4, top){
    var result = {};
    xbox.forEach(function (item) {
        var key = item.Game;
        if (!result[key]) {
            result[key] = {xbox: 0, ps4: 0, total: 0};
        }
        result[key].xbox += parse(item.Global) || 0;
        result[key].total += parse(item.Global) || 0;
    });
    ps4.forEach(function (item) {
        var key = item.Game;
        if (!result[key]) {
            result[key] = {xbox: 0, ps4: 0, total: 0};
        }
        result[key].ps4 += parse(item.Global) || 0;
        result[key].total += parse(item.Global);
    });
    var array = [];
    for (var key in result) {
        array.push({
            name: key,
            xbox: result[key].xbox,
            ps4: result[key].ps4,
            total: result[key].total
        });
    };
    array.sort(function (a, b) {
        return b.total - a.total;
    });
    if (top) {
        array = array.splice(0, top);
    }
    return array;
}

function showBarChart2(){
    var array = countByGame(XBoxData, PS4Data, 10);
    var legend = [], xbox = [], ps4 = [];
    array.forEach(function(item){
        legend.push(item.name);
        xbox.push(fmt(item.xbox));
        ps4.push(fmt(item.ps4));
    });
    console.log(legend, xbox, ps4);
    Highcharts.chart('bar-chart2',{
        chart: {
            type: 'column'
        },
        title: {
            text: 'Top 10 selling games'
        },
        subtitle: {
            text: 'Source: <a href="https://www.kaggle.com/sidtwr/videogames-sales-dataset">Video Games Sales Dataset</a>'
        },
        xAxis: {
            categories: legend,
            crosshair: true,
            title: {
                text: 'Games'
            }
        },
        yAxis: {
            min: 0,
            title: {
                text: 'Total Global Sales(in millions)'
            }
        },
        colors: ["#0e7a0d", " #006FCD"],
        plotOptions: {
            column: {
                borderWidth: 0
            }
        },
        series: [{
            name: 'XBox',
            data: xbox
        }, {
            name: 'PS4',
            data: ps4
        }]
    });
}

function countByYear(xbox, ps4, top){
    var result = {};
    xbox.forEach(function (item) {
        var key = item.Year;
        if (!result[key]) {
            result[key] = {xbox: 0, ps4: 0, total: 0};
        }
        result[key].xbox += parse(item.Global);
        result[key].total += parse(item.Global);
    });
    ps4.forEach(function (item) {
        var key = item.Year;
        if (!result[key]) {
            result[key] = {xbox: 0, ps4: 0, total: 0};
        }
        result[key].ps4 += parse(item.Global);
        result[key].total += parse(item.Global);
    });
    console.log(result);
    var array = [];
    for (var key in result) {
        array.push({
            name: key,
            xbox: result[key].xbox,
            ps4: result[key].ps4,
            total: result[key].total
        });
    };
    array.sort(function (a, b) {
        return a.name - b.name;
    });
    if (top) {
        array = array.splice(0, top);
    }
    return array;
}

function showAreaChart(){
    var array = countByYear(XBoxData, PS4Data, 10);
    var legend = [], xbox = [], ps4 = [];
    array.forEach(function(item){
        legend.push(item.name);
        xbox.push(fmt(item.xbox));
        ps4.push(fmt(item.ps4));
    });
    //console.log(array, legend, xbox, ps4);
    Highcharts.chart('area-chart',{
        chart: {
            type: 'area'
        },
        title: {
            text: 'Total Global Sales Breakdown by Year'
        },
        subtitle: {
            text: 'Source: <a href="https://www.kaggle.com/sidtwr/videogames-sales-dataset">Video Games Sales Dataset</a>'
        },
        xAxis: {
            categories: legend,
            crosshair: true,
            allowDecimals: false,
            title: {
                text: 'Year'
            }
        },
        yAxis: {
            title: {
                text: 'Total Global Sales(in millions)'
            },
        },
        colors: [" #006FCD", "#0e7a0d"],
        plotOptions: {
            area: {
                // stacking: "normal",
                lineColor: '#666666',
                marker: {
                    enabled: false,
                    symbol: 'circle',
                    radius: 2,
                    states: {
                        hover: {
                            enabled: true
                        }
                    }
                }
            }
        },
        series: [{
            name: 'PS4',
            data: ps4
        }, {
            name: 'XBox',
            data: xbox
        }]
    });
}

var currentType = "xbox", currentData = [];

window.onload = function () {
    document.getElementById("type-sel").onchange = changeType;
    setNameMap(geoJson);
    changeType();
    showPieChart('pie-xbox', XBoxData, 'Distribution of Genre by XBox');
    showPieChart('pie-ps4', PS4Data, 'Distribution of Genre by PS4');
    showBarChart();
    showBarChart2();
    showAreaChart();
};