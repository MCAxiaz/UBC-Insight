/**
 * Created by Axiaz on 2017-03-27.
 */

function sure() {
    var r = confirm('Are you ready to submit?');
    if (r == true) {
        doStuff();
    } else {
        alert('cancel');
    }
}

function doStuff() {

    var details = [
        "courses_dept",
        "courses_id",
        "courses_section",
        "courses_avg",
        "courses_instructor",
        "courses_title",
        "courses_pass",
        "courses_fail",
        "courses_audit",
        "courses_uuid",
        "courses_year"
    ];

    var grouping = [
        "courses_dept",
        "courses_id"
    ];

    var query = {
        "WHERE": {
        },
        "OPTIONS": {
            "COLUMNS": details,
            "FORM": "TABLE"
        }
    };

    var filter = [];

    var form = document.getElementById("main-form");
    var formData = new FormData(form);

    var dept = formData.get("deptToggle");
    if (dept == 1) {
        var deptVal = formData.get("department");
        if (isEmpty(deptVal)) {
            emptyFieldAlert();
            return;
        }
        filter.push({"IS": {"courses_dept": deptVal}});
    }

    var instructor = formData.get("profToggle");
    if (instructor == 1) {
        var profVal = formData.get("profName");
        if (isEmpty(profVal)) {
            emptyFieldAlert();
            return;
        }
        filter.push({"IS": {"courses_instructor": profVal}});
    }

    var group = formData.get("sectionsToggle");


    if (group == 1) {



        var tf = {
            GROUP: ["courses_dept", "courses_id"],
            APPLY: []
        };

        //size filter
        var size = formData.get("sizeToggle");
        if (size == 1) {
            var compType = formData.get("compType");
            var sizeVal = formData.get("size");

            if (isEmpty(sizeVal)) {
                emptyFieldAlert();
                return;
            }

            if (sizeVal.match("[^0-9]") != null) {
                alert('Size must be a non-negative integer');
                return;
            }

            sizeVal = parseInt(sizeVal);

            switch (compType) {
                case "1":
                    filter.push({"GT": {"courses_size": sizeVal}});
                    break;
                case "2":
                    filter.push({"EQ": {"courses_size": sizeVal}});
                    break;
                case "3":
                    filter.push({"LT": {"courses_size": sizeVal}})
            }
        }

        //title filter
        var title = formData.get("titleToggle");
        if (title == 1) {
            var titleVal = formData.get("title");
            if (isEmpty(titleVal)) {
                emptyFieldAlert();
                return;
            }
            filter.push({"IS": {"courses_title": titleVal}});
        }


        var sort = {
            dir: "UP",
            keys: []
        };
        var orderKeys = [];
        var mostFail = formData.get("byFail");
        if (mostFail == 1) {
            tf.APPLY.push({
                "totalFail": {
                    "SUM": "courses_fail"
                }
            });
            grouping.push("totalFail");
            orderKeys.push("totalFail");
        }

        var mostPass = formData.get("byPass");
        if (mostPass == 1) {
            tf.APPLY.push({
                "totalPass": {
                    "SUM": "courses_pass"
                }
            });
            grouping.push("totalPass");
            orderKeys.push("totalPass");
        }

        var avgGrade = formData.get("byGrade");
        if (avgGrade == 1) {
            tf.APPLY.push({
                "avgGrade": {
                    "AVG": "courses_avg"
                }
            });
            grouping.push("avgGrade");
            orderKeys.push("avgGrade");
        }


        var sortOrder = formData.get("sortOrder");
        if (sortOrder == 2) {
            sort.dir = "DOWN";
        }

        sort.keys = orderKeys;


        query.OPTIONS.COLUMNS = grouping;

        if (orderKeys.length > 0)
            query.OPTIONS.ORDER = sort;


        query.TRANSFORMATIONS = tf;

    }

    if (filter.length > 0) {
        var typeOfQuery = formData.get("queryType");
        if (typeOfQuery == 1)
            query.WHERE.AND = filter;
        else
            query.WHERE.OR = filter;
    }

    $.ajax({
        url: 'http://localhost:63342/query',
        type: 'POST',
        data: JSON.stringify(query),
        dataType: 'json',
        crossOrigin: true,
        cache: false,
        contentType: 'application/json'
    }).done( function(data){
        generateTable(data.result, query.OPTIONS.COLUMNS);
    }).fail( function(err){
        alert(err.responseText);
        console.log(err);
    });

}


function generateTable(data, columns) {
    var tbl_body = document.createElement("tbody");
    var odd_even = false;

    if (data == null || data.length == 0)
    {
        alert("No Result Found, Please Try Search Something Else");
        document.getElementById("tblResults").innerHTML = '';
        document.getElementById("result").style.display = "none";
    }
    else {
        document.getElementById("result").style.display = "";
        if ($('#tblResults').children().length > 0)
        {
            document.getElementById("tblResults").innerHTML = '';
        }
        $.each(data, function () {
            var tbl_row = tbl_body.insertRow();
            tbl_row.className = odd_even ? "odd" : "even";
            $.each(this, function (k, v) {
                var cell = tbl_row.insertCell();
                cell.appendChild(document.createTextNode(v.toString()));
            });
            odd_even = !odd_even;
        });


        var table = document.getElementById("tblResults");
        var header = table.createTHead();
        var row = header.insertRow(0);
        var i = 0;
        $.each(columns, function () {
            var cell = row.insertCell();
            cell.innerHTML = "<strong>" + columns[i].toString() + "</strong>";
            i++;
        });

        //document.getElementById("tblResults").appendChild(tbl_head);
        document.getElementById("tblResults").appendChild(tbl_body);
        window.location = "#result";
        // $("#tblResults").appendChild(tbl_body);
    }
}


function isEmpty(someField) {
    return (someField.trim() == "");
}

function emptyFieldAlert() {
    alert("Please fill out the field");
}
