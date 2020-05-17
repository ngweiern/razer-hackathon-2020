var base_color = "white";
var active_color = "rgb(237, 40, 70)";

var child = 1;
var length = $("section").length - 1;
let amountToConvert;
let amountConverted;
$("#back").addClass("disabled");
$("#submit").addClass("disabled");

$("section").not("section:nth-of-type(1)").hide();
$("section").not("section:nth-of-type(1)").css('transform', 'translateX(100px)');

var svgWidth = length * 200 + 24;
$("#svg_wrap").html(
    '<svg version="1.1" id="svg_form_time" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 ' +
    svgWidth +
    ' 24" xml:space="preserve"></svg>'
);

function makeSVG(tag, attrs) {
    var el = document.createElementNS("http://www.w3.org/2000/svg", tag);
    for (var k in attrs) el.setAttribute(k, attrs[k]);
    return el;
}

for (i = 0; i < length; i++) {
    var positionX = 12 + i * 200;
    var rect = makeSVG("rect", {x: positionX, y: 9, width: 200, height: 6});
    document.getElementById("svg_form_time").appendChild(rect);
    // <g><rect x="12" y="9" width="200" height="6"></rect></g>'
    var circle = makeSVG("circle", {
        cx: positionX,
        cy: 12,
        r: 12,
        width: positionX,
        height: 6
    });
    document.getElementById("svg_form_time").appendChild(circle);
}

var circle = makeSVG("circle", {
    cx: positionX + 200,
    cy: 12,
    r: 12,
    width: positionX,
    height: 6
});
document.getElementById("svg_form_time").appendChild(circle);

$("circle:nth-of-type(1)").css("fill", active_color);

function handleExchangeRate(data) {
    const allRows = data.split(/\r?\n|\r/);
    const startDate = $("#start-date").val();
    const startDateArray = startDate.split(' ');
    const startMon = startDateArray[0][0] + startDateArray[0].substring(1, 3)
    const startYear = startDateArray[1]
    const startDateInput = startMon + " " + startYear

    for (let singleRow = 0; singleRow < allRows.length; singleRow++) {
        if (singleRow === 0) {
            continue;
        }

        const rowCells = allRows[singleRow].split('|');
        if (rowCells[0] === startDateInput) {
            forecastedValue = amountToConvert / Number.parseFloat(rowCells[1]);
            minForecastedValue = Math.round(forecastedValue * 0.95)
            maxForecastedValue = Math.round(forecastedValue * 1.02)
            $("#savings").text(`$${Math.round(amountConverted-minForecastedValue)}`)
            $(".converted-amount-forecasted").text(`$${minForecastedValue} - $${maxForecastedValue}`)
            $("#final-page-forecast").text(`$${Math.round(forecastedValue * 0.98)} - $${Math.round(forecastedValue * 1.01)}`)
            $("#final-savings").text(`$${Math.round(amountConverted-forecastedValue * 0.98)}`)
        }
    }
}

function getFx() {
    amountToConvert = $("#amount-required").val()
    let fromCurrency = $('#from-currency').find(":selected").val().split(',')
    let fromCurrencyCode = fromCurrency[0]
    let fromCurrencyChar = fromCurrency[1]

    let toCurrency = $('#to-currency').find(":selected").val().split(',')
    let toCurrencyCode = toCurrency[0]
    let toCurrencyChar = toCurrency[1]

    $.ajax({
        headers: {"Accept": "application/json"},
        url: "http://localhost:5000/getCurrentFx",
        crossDomain: true,
        data: {
            "dest_currency": fromCurrencyCode,
            "source_currency": toCurrencyCode,
            "amount": amountToConvert,
            "markup_rate": 0.05
        },
        cache: false,
        type: "GET",
        success: function (response) {

            amountConverted = response.destinationAmount
            $("#converted-amount-current").text(`$${Math.round(amountConverted)}`).css({"display": "block"})

            handleNextPageTransit();
            transitFromCurrentPage();

            $.ajax({
                url: `data/forecast_sgd_${toCurrencyChar.toLowerCase()}.csv`,
                dataType: 'text',
            }).done(handleExchangeRate);

        },
        error: function (xhr) {

        }
    })
}

function transitFromCurrentPage() {
    $("#svg_form_time rect").css("fill", active_color);
    $("#svg_form_time circle").css("fill", active_color);

    var circle_child = child + 1;
    $("#svg_form_time rect:nth-of-type(n + " + child + ")").css(
        "fill",
        base_color
    );
    $("#svg_form_time circle:nth-of-type(n + " + circle_child + ")").css(
        "fill",
        base_color
    );
    var currentSection = $("section:nth-of-type(" + child + ")");
    currentSection.fadeIn();
    currentSection.css('transform', 'translateX(0)');
    currentSection.prevAll('section').css('transform', 'translateX(-100px)');
    currentSection.nextAll('section').css('transform', 'translateX(100px)');
    $('section').not(currentSection).hide();
}

function handleBackPageTransit() {
    $("#next").removeClass("disabled");
    $('#submit').addClass("disabled");
    if (child <= 2) {
        $(this).addClass("disabled");
    }
    if (child > 1) {
        child--;
    }
}

function handleNextPageTransit() {
    $("#back").removeClass("disabled");
    if (child >= length) {
        $('#next').addClass("disabled");
        $('#submit').removeClass("disabled");
    }
    if (child <= length) {
        child++;
    }
}

$(".button").click(function () {
    var id = $(this).attr("id");
    if (id == "next") {
        if (child === 1) {
            getFx();
        } else {
            handleNextPageTransit();
            transitFromCurrentPage()
        }

    } else if (id == "back") {
        handleBackPageTransit();
        transitFromCurrentPage();
    }
});

$.ajax({
    url: 'data/currency_code.csv',
    dataType: 'text',
}).done(handleCurrencyCodes);

function handleCurrencyCodes(data) {
    var allRows = data.split(/\r?\n|\r/);

    for (var singleRow = 0; singleRow < allRows.length; singleRow++) {
        if (singleRow === 0) {
            continue;
        }

        var rowCells = allRows[singleRow].split('|');

        $('#to-currency').append(`<option value="${rowCells[3]},${rowCells[2]}">${rowCells[1]} (${rowCells[2]})</option>`);
    }
}

window.onload = function () {
    $('.date-picker').datepicker({
        changeMonth: true,
        changeYear: true,
        showButtonPanel: true,
        dateFormat: 'MM yy',
        onClose: function (dateText, inst) {
            $(this).datepicker('setDate', new Date(inst.selectedYear, inst.selectedMonth, 1));
        }
    });

    $(".date-picker").datepicker().datepicker("setDate", new Date());
}