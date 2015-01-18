function fetchJSONFile(path, callback) {
    var httpRequest = new XMLHttpRequest();
    console.log('step 1');
    httpRequest.onreadystatechange = function () {
        if (httpRequest.readyState === 4) {
            if (httpRequest.status === 200) {
                var data = httpRequest.responseText; //JSON.parse(httpRequest.responseText);

                console.log(data.length);
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
    fetchJSONFile('json/cheese.json', function (data) {
        //console.log('data = '+data);  
        extractEntity(data);
    });
    console.log('test');
});

function extractEntity(data) {

    console.log(JSON.parse(data));
    var entityArray = JSON.parse(data);
    var minValue;
    var maxValue;
    var totalValue=0;
    for (i = 0; i < entityArray.segments.length; i++) {
        console.log(i);
        totalValue+=entityArray.segments[i].value;
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
    console.log(minValue + "--" + maxValue+"--"+totalValue);

    var pieChart = document.querySelector("#pieChart");
    var context = pieChart.getContext("2d");
    if (pieChart) {
        //draw pie chart
        context.clearRect(0, 0, pieChart.width, pieChart.height);
        //set the styles in case others have been set
        setDefaultStyles(context);
        var cx = (pieChart.width) / 2;
        var cy = (pieChart.height) / 2;
        var radius = 200;
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
            if (entityArray.segments[i].value == minValue) 
            { 
                context.arc(cx, cy, radius*1.1, currentAngle, endAngle, false);
             } else {
               
                if (entityArray.segments[i].value == maxValue) 
                {
                    context.arc(cx, cy, radius*0.9, currentAngle, endAngle, false);
                } else 
                {    
                    context.arc(cx, cy, radius, currentAngle, endAngle, false);
                }
            }
            context.lineTo(cx, cy);
            context.fill();

        //Now draw the lines that will point to the values
            context.save();
            context.translate(cx, cy);//make the middle of the circle the (0,0) point
            context.strokeStyle = "black";
            context.lineWidth = 1;
            context.beginPath();
            //angle to be used for the lines
            var midAngle = (currentAngle + endAngle)/2;//middle of two angles
            context.moveTo(0,0);//this value is to start at the middle of the circle
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
            context.fillText(entityArray.segments[i].label, 15, 10 );
            //context.rotate(currentAngle-endAngle);
            context.restore();
            
            //update the currentAngle
            currentAngle = endAngle;

        }
    }

    var barChart = document.querySelector("#barChart");
    if (barChart) {
        //draw bar chart
    }
}

function setDefaultStyles(context){
  //set default styles for canvas
  context.strokeStyle = "#333";	//colour of the lines
  context.lineWidth = 3;
  context.font = "bold 16pt Arial";
  context.fillStyle = "#900";	//colour of the text
  context.textAlign = "left";
}