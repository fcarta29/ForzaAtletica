 $(function() {
    var button = $("button")

    // handle click and add class
    button.on("click", function() {
    	var that = this;
    	$(that).prop("disabled",true);
        $('#result').html("Getting data...");
        clearTable();
        requestCrossDomain('https://green2.kingcounty.gov/lake-buoy/', function(results) {
         var tempDom =$('<output>').append($.parseHTML(results));
         var data = $(tempDom).find("#ctl00_kcMasterPagePlaceHolder_c_MetHiddenField");
         if (data && data.length > 0) {
                 readBouyData(data[0].value);
          $('#result').html("");
         } else {
             $('#result').html("No data found!");
         }
         $(that).prop("disabled",false);
      });
    })
});

// Accepts a url and a callback function to run.
function requestCrossDomain(site, callback) {

    // If no url was passed, exit.
    if (!site) {
        alert('No site was passed.');
        return false;
    }

    // Take the provided url, and add it to a YQL query. Make sure you encode it!
    //var yql = 'https://query.yahooapis.com/v1/public/yql?q=' + encodeURIComponent(
    //'select * from html where url="' + site + '"'
    //"select * from htmlstring where url='" + site) + '&format=xml&callback=cbFunc';

    var yql = "select * from htmlstring where url='" + site + "' AND xpath='//div'";

    var resturl = "https://query.yahooapis.com/v1/public/yql?q="
            + encodeURIComponent(yql) + "&format=json"
            + "&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys";




    // Request that YSQL string, and run a callback function.
    // Pass a defined function to prevent cache-busting.
    $.getJSON(resturl, cbFunc);

    function cbFunc(data) {
        // If we have something to work with...
        if (data.query.results.result) {
            // Strip out all script tags, for security reasons.
            // BE VERY CAREFUL. This helps, but we should do more. 
            data = data.query.results.result;
            //.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');

            // If the user passed a callback, and it
            // is a function, call it, and send through the data var.
            if (typeof callback === 'function') {
                callback(data);
            }
        }
        // Else, Maybe we requested a site that doesn't exist, and nothing returned.
        else throw new Error('Nothing returned from getJSON.');
    }
}

function readBouyData(bouyData) {
    var bouyArray = bouyData.split(";");
    $.each(bouyArray, function(bouyKey, bouyValue) {
        if (bouyValue.substr(-1) === "Y") {
            addActiveBouy(bouyValue);
        } else {
            addInactiveBouy(bouyValue);
        }
    });
}

function addActiveBouy(activeBouyData) {
    var table = $("#bouyDataTable");
    var row = $("<tr/>");
    var bouyDataArray = [];
    var bouyDataArrayTmp = activeBouyData.split(/(\s+)/);
    $.each(bouyDataArrayTmp, function(key, value) {
        if (value.trim().length > 0) {  // ignore whitespace...prob should just fix regex on split
            bouyDataArray.push(value);
        }
    });
    // only support limited format data
    if (bouyDataArray.length != 15) {
        addUnknownFormatBouy(activeBouyData);
    } else {
        var name = bouyDataArray[0];
        var collectDate = bouyDataArray[1] + " " + bouyDataArray[2] + " " + bouyDataArray[3];
        var airTemperature = bouyDataArray[4];
        var windSpeed = bouyDataArray[5];
        var windDirection = bouyDataArray[6] + " " + bouyDataArray[7];
        var temperature = bouyDataArray[8];
        var profileDate = bouyDataArray[9] + " " + bouyDataArray[10] + " " + bouyDataArray[11];
        var latitude = bouyDataArray[12];
        var longitude = bouyDataArray[13];
        var activeInd = bouyDataArray[14];

        // Add data to addTableData
        addTableData(name,row);
        addTableData(collectDate,row);
        addTableDataForTemp(airTemperature,row);
        addTableDataForWindSpeed(windDirection,windSpeed,row);
        addTableDataForTemp(temperature,row);
        addTableData(profileDate,row);
        addTableData(latitude,row);
        addTableData(longitude,row);
        addTableData(activeInd,row);
        table.append(row);
    }
}

function addInactiveBouy(inactiveBouyData) {
    var table = $("#bouyDataTable");
    var row = $("<tr/>");
    var bouyDataArray = [];
    var bouyDataArrayTmp = inactiveBouyData.split(/(\s+)/);
    $.each(bouyDataArrayTmp, function(key, value) {
        if (value.trim().length > 0) {  // ignore whitespace...prob should just fix regex on split
            bouyDataArray.push(value);
        }
    });
    // only support limited format data
    if (bouyDataArray.length != 6 && bouyDataArray.length != 7) {
        addUnknownFormatBouy(inactiveBouyData);
    } else {
        var name = bouyDataArray[0] + " " + bouyDataArray[1];
        if (bouyDataArray.length == 6) {
            var latitude = bouyDataArray[3];
            var longitude = bouyDataArray[4];
            var activeInd = bouyDataArray[5];
        } else {
            name = name + " " + bouyDataArray[2];
            var latitude = bouyDataArray[4];
            var longitude = bouyDataArray[5];
            var activeInd = bouyDataArray[6];
        }

        // Add data to addTableData
        addTableData(name,row);
        addTableData("-",row);
        addTableData("-",row);
        addTableData("-",row);
        addTableData("-",row);
        addTableData("-",row);
        addTableData(latitude,row);
        addTableData(longitude,row);
        addTableData(activeInd,row);
        
        table.append(row);
    }
}

function addUnknownFormatBouy(unknownBouyData) {
    var div = $("#unknownBouyData");
    div.append($("<span/>").text("Unknown Data Format: " + unknownBouyData));
}

function addTableData(data, row) {
    row.append($("<td/>").text(data));
}

function addTableDataForTemp(temperature, row) {
	 var tmp = temperature + " " + String.fromCharCode(176) + "C (" + Math.round(32 + temperature*9/5) + " " + String.fromCharCode(176) + "F)";
     addTableData(tmp,row);
}

function addTableDataForWindSpeed(windDirection, windSpeed, row) {
    var wind = windDirection + " " + windSpeed + " m/sec (" + Math.round(windSpeed * 3600/1609.344) + " mph)";
    addTableData(wind,row);
}

function clearTable() {
    $("#bouyDataTable").html("");
}
