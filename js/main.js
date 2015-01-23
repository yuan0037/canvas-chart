
function createAJAXObj() {
    'use strict';
    try {
        return new XMLHttpRequest();
    } catch (er1) {
        try {
            return new ActiveXObject("Msxml3.XMLHTTP");
        } catch (er2) {
            try {
                return new ActiveXObject("Msxml2.XMLHTTP.6.0");
            } catch (er3) {
                try {
                    return new ActiveXObject("Msxml2.XMLHTTP.3.0");
                } catch (er4) {
                    try {
                        return new ActiveXObject("Msxml2.XMLHTTP");
                    } catch (er5) {
                        try {
                            return new ActiveXObject("Microsoft.XMLHTTP");
                        } catch (er6) {
                            return false;
                        }
                    }
                }
            }
        }
    }
}
function sendRequest(url, callback, postData) {
    'use strict';
    var req = createAJAXObj(), method = (postData) ? "POST" : "GET";
    if (!req) {
        return;
    }
    req.open(method, url, true);
    //req.setRequestHeader('User-Agent', 'XMLHTTP/1.0');
    if (postData) {
        req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    }
    req.onreadystatechange = function () {
        if (req.readyState !== 4) {
            return;
        }
        if (req.status !== 200 && req.status !== 304) {
            return;
        }
        callback(req);
    }
    req.send(postData);
}


function fetchJSONFile(path, callback) {
    var httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = function () {
        if (httpRequest.readyState === 4) {
            if (httpRequest.status === 200) {
                var data = httpRequest.responseText; //JSON.parse(httpRequest.responseText);

                //console.log(data.length);
                //                for (var i = 0; i < obj.length; i++) {
                //                    console.log(obj[i].value);
                //                }
                if (callback) callback(data);
            }
        }
    };
    httpRequest.open('GET', path);
    httpRequest.send();
}

document.addEventListener('DOMContentLoaded', function () {
//    fetchJSONFile('json/cheese.json', function (data) {
//        //console.log('data = '+data);  
//        extractEntity(data);    
    sendRequest('json/cheese.json', myCallBack);
});

function myCallBack(data){
    extractEntity(data);
}
function myPostData(data){
}
function extractEntity(data) {
    //console.log(JSON.parse(data.responseText));
    var entityArray = JSON.parse(data.responseText);
    var minValue;
    var maxValue;
    var totalValue = 0;
    for (i = 0; i < entityArray.segments.length; i++) {
        totalValue += entityArray.segments[i].value;
        // console.log(entity);
        if (i == 0) {
            //initialize minValue and maxValue;
            minValue = entityArray.segments[i].value;
            maxValue = entityArray.segments[i].value;
        } else {
            if (minValue > entityArray.segments[i].value)
                minValue = entityArray.segments[i].value;
            if (maxValue < entityArray.segments[i].value)
                maxValue = entityArray.segments[i].value;
        }
    }
    //console.log(minValue + "--" + maxValue + "--" + totalValue);

    var pieChart = document.querySelector("#pieChart");
    var context = pieChart.getContext("2d");
    if (pieChart) {
        //draw pie chart
        context.clearRect(0, 0, pieChart.width, pieChart.height);
        //set the styles in case others have been set
        setDefaultStyles(context);
        var cx = (pieChart.width) / 2;
        var cy = (pieChart.height) / 2;
        var radius = 100;
        var currentAngle = 0;

        for (var i = 0; i < entityArray.segments.length; i++) {

            var pct = entityArray.segments[i].value / totalValue;
            //create colour 0 - 16777216 (2 ^ 24) based on the percentage
            var clr = entityArray.segments[i].color;

            var endAngle = currentAngle + (pct * (Math.PI * 2));
            //draw the arc
            context.moveTo(cx, cy);
            context.beginPath();
            context.fillStyle = clr;
            if (entityArray.segments[i].value == minValue) {
                context.arc(cx, cy, radius * 1.1, currentAngle, endAngle, false);
            } else {

                if (entityArray.segments[i].value == maxValue) {
                    context.arc(cx, cy, radius * 0.9, currentAngle, endAngle, false);
                } else {
                    context.arc(cx, cy, radius, currentAngle, endAngle, false);
                }
            }
            context.lineTo(cx, cy);
            context.fill();

            //Now draw the lines that will point to the values
            context.save();
            context.translate(cx, cy); //make the middle of the circle the (0,0) point
            context.strokeStyle = "black";
            context.lineWidth = 1;
            context.beginPath();
            //angle to be used for the lines
            var midAngle = (currentAngle + endAngle) / 2; //middle of two angles
            context.moveTo(0, 0); //this value is to start at the middle of the circle
            //to start further out...
            var dx = Math.cos(midAngle) * (0.8 * radius);
            var dy = Math.sin(midAngle) * (0.8 * radius);
            context.moveTo(dx, dy);
            //ending points for the lines
            var dx = Math.cos(midAngle) * (radius + 30); //30px beyond radius
            var dy = Math.sin(midAngle) * (radius + 30);
            context.lineTo(dx, dy);
            context.stroke();
            //put the canvas back to the original position
            context.font = "bold 12pt Arial";
            context.translate(dx, dy);
            context.rotate(midAngle);
            context.fillText(entityArray.segments[i].label, 15, 10);
            //context.rotate(currentAngle-endAngle);
            context.restore();

            //update the currentAngle
            currentAngle = endAngle;

        }
    }

    var barChart = document.querySelector("#barChart");
    if (barChart) {
        //draw bar chart
        var context = barChart.getContext("2d");
        //clear the canvas
        context.clearRect(0, 0, barChart.width, barChart.height);
        //set the styles in case others have been set
        setDefaultStyles(context);
        //the percentage of each value will be used to determine the height of the bars.
        var graphHeight = 400; //bottom edge of the graph
        var offsetX = 10; //space away from left edge of canvas to start drawing.
        var barWidth = 20; //width of each bar in the graph
        var spaceBetweenPoints = 40; //how far apart to make each x value.
        //start at values[1].
        //values[0] is the moveTo point.
        var x = offsetX + 30; //left edge of first rectangle
        //var y = offsetY - (graphHeight * (values[0]/100));
        //start a new path
        
        for (var i = 0; i < entityArray.segments.length; i++) {
            context.beginPath();
            var pct = entityArray.segments[i].value / totalValue;
            var barHeight = (graphHeight * pct);
            //(x, y) coordinates for a rectangle are the top, left values unless you do negative values for w, h
            var clr = entityArray.segments[i].color;
            
            context.rect(x, graphHeight - 1, barWidth, -1 * barHeight);
            context.fillStyle = clr;
            context.fill();
            //for the first point the moveTo and lineTo values are the same
            //All the labels for the bars are going above the bars
            var lbl = Math.round(pct * 100).toString()+"%";
            lbl=entityArray.segments[i].label;
            //context.rotate(Math.PI*2);
//            
//            context.stroke(); //draw lines around bars
//            context.fill;
            
            context.fillText(lbl, x-25, graphHeight - barHeight - 30 - 1);
            x = x + barWidth + spaceBetweenPoints;
            
            
            //move the x value for the next point
        }

        
       // context.fill(); //fill colours inside the bars
        
        context.strokeStyle = "#999";
        context.lineWidth = 1;
        context.beginPath();
        context.moveTo(offsetX, barChart.height - graphHeight);
        context.lineTo(offsetX, graphHeight);
        context.lineTo(barChart.width - offsetX, graphHeight);
        context.stroke();
    }

}

function setDefaultStyles(context) {
    //set default styles for canvas
    context.strokeStyle = "#333"; //colour of the lines
    context.lineWidth = 3;
    context.font = "16pt Arial";
    context.fillStyle = "#900"; //colour of the text
    context.textAlign = "left";
}