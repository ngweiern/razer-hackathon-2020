var base_color = "white";
var active_color = "rgb(237, 40, 70)";

var child = 1;
var length = $("section").length - 1;
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

$(".button").click(function () {
    $("#svg_form_time rect").css("fill", active_color);
    $("#svg_form_time circle").css("fill", active_color);
    var id = $(this).attr("id");
    if (id == "next") {
        $("#back").removeClass("disabled");
        if (child >= length) {
            $(this).addClass("disabled");
            $('#submit').removeClass("disabled");
        }
        if (child <= length) {
            child++;
        }
    } else if (id == "back") {
        $("#next").removeClass("disabled");
        $('#submit').addClass("disabled");
        if (child <= 2) {
            $(this).addClass("disabled");
        }
        if (child > 1) {
            child--;
        }
    }
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
});


$.ajax({
    url: 'data/currency_code.csv',
    dataType: 'text',
}).done(successFunction);

function successFunction(data) {
    var allRows = data.split(/\r?\n|\r/);
    // var table = '<table>';
    for (var singleRow = 0; singleRow < allRows.length; singleRow++) {
        if (singleRow === 0) {
            continue;
        }
        // else {
        //     table += '<tr>';
        // }
        var rowCells = allRows[singleRow].split('|');
        // for (var rowCell = 0; rowCell < rowCells.length; rowCell++) {
        //     if (singleRow === 0) {
        //         table += '<th>';
        //         table += rowCells[rowCell];
        //         table += '</th>';
        //     } else {
        //         table += '<td>';
        //         table += rowCells[rowCell];
        //         table += '</td>';
        //     }
        // }
        // if (singleRow === 0) {
        //     table += '</tr>';
        //     table += '</thead>';
        //     table += '<tbody>';
        // } else {
        //     table += '</tr>';
        // }
        $('#from-currency').append(`<option value="${rowCells[3]}">${rowCells[1]} (${rowCells[2]})</option>`);
        $('#to-currency').append(`<option value="${rowCells[3]}">${rowCells[1]} (${rowCells[2]})</option>`);
    }
    // table += '</tbody>';
    // table += '</table>';
}
