//!Function Flow:
//? Delcare variable as global Static
//? Define functions
//? Run everything inside $(document).ready(function(){})

//todo=>Global State:

let foodData = [];
let currentMonth;
let selectedStart;
let selectedEnd;

//todo=>Data Layer:

const fruitsList = ["Apple", "Banana", "Orange"];
const vegetablesList = ["Carrot", "Tomato", "Spinach"];
const meatList = ["Chicken", "Beef", "Fish"];

function getRandomItems(list,count){
    let result = [];
    for(let i=0;i<count;i++)
        result.push(list[Math.floor(Math.random() * list.length)]);
    return result;
}

function generateFoodData(startDate,endDate){
    foodData = []; //always reset the list before using them in a function

    let current = moment(startDate);

    
    while (current <= endDate) {

        let fruitsCount = Math.floor(Math.random() * 10);
        let vegCount = Math.floor(Math.random() * 10);
        let meatGrams = Math.floor(Math.random() * 3);

        foodData.push({
            date: current.format("YYYY-MM-DD"),
            fruits: fruitsCount,
            vegetables: vegCount,
            meat: meatGrams,

            fruitItems: getRandomItems(fruitsList, fruitsCount),
            vegetableItems: getRandomItems(vegetablesList, vegCount),
            meatItems: getRandomItems(meatList,meatGrams)
        });

        current.add(1, 'days');
    }

}

//todo=>Chart Layer:

function renderChart() {

    if (!currentMonth) return;

    let monthStart = currentMonth.clone().startOf('month');
    let monthEnd = currentMonth.clone().endOf('month');

    let filtered = foodData.filter(item => {
        let d = moment(item.date);
        return d >= monthStart && d <= monthEnd;
    });

    let categories = filtered.map(d => d.date);
    let fruits = filtered.map(d => d.fruits);
    let vegetables = filtered.map(d => d.vegetables);
    let meat = filtered.map(d => d.meat);

    $("#monthTitle").text(currentMonth.format("MMMM YYYY"));

    Highcharts.chart('chartContainer', {
        chart: { type: 'column' },
        title: { text: 'Food Data' },

        xAxis: { categories },

        yAxis: {
            title: { text: 'Food to consume' }
        },

        plotOptions: {
            series: {
                point: {
                    events: {
                        click: function () {
                            showDayDetails(this.category);
                        }
                    }
                }
            }
        },

        series: [
            { name: 'Fruits', data: fruits },
            { name: 'Vegetables', data: vegetables },
            { name: 'Meat (grams)', data: meat }
        ]
    });

     pieChart(filtered);

    updateNavButtons();
}


//todo=>Pie Chart:

function pieChart(filteredData){

    let totalFruits = filteredData.reduce((sum,d)=>sum + d.fruits,0);
    let totalVeg = filteredData.reduce((sum, d) => sum + d.vegetables, 0);
    let totalMeat = filteredData.reduce((sum, d) => sum + d.meat, 0);

    Highcharts.chart('pieContainer', {
    chart: {
        type: 'pie'
    },
    title: {
        text: 'Food diet based on the date selected'
    },
    // subtitle: {
    //     text: 'Click the slices to view versions. Source: <a href="http://statcounter.com" target="_blank">statcounter.com</a>'
    // },

    accessibility: {
        announceNewData: {
            enabled: true
        },
        point: {
            valueSuffix: '%'
        }
    },

    plotOptions: {
        pie: {
            borderRadius: 5,
            dataLabels: [{
                enabled: true,
                distance: 15,
                format: '{point.name}'
            }, {
                enabled: true,
                distance: '-30%',
                filter: {
                    property: 'percentage',
                    operator: '>',
                    value: 5
                },
                format: '{point.y:.1f}%',
                style: {
                    fontSize: '0.9em',
                    textOutline: 'none'
                }
            }],
            states: {
                inactive: {
                    opacity: 0.8
                }
            }
        }
    },

    tooltip: {
        headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
        pointFormat: '<span style="color:{point.color}">{point.name}</span>: ' +
            '<b>{point.y:.2f}%</b> of total<br/>'
    },

    series: [{
        
    name: 'Total',
            colorByPoint: true,
            data: [
                { name: 'Fruits', y: totalFruits },
                { name: 'Vegetables', y: totalVeg },
                { name: 'Meat', y: totalMeat }
            ]

    }]

    });

}

//todo=>UI Layer:

function updateMessage(start, end) {

    $('#dateMessage').html( `The diet plan between <span id="dateSpan"> 
        ${start} - ${end} 
        </span> are given below:`);
}

function expandUI() {
    $('.date').addClass('expanded');
    $('#prevBtn, #nextBtn').show();
}

function resetUI() {

    $('.date').removeClass('expanded');

    $('#prevBtn, #nextBtn').hide();

    $('#chartContainer').empty();
    $('#monthTitle').text('');

    $('#dateMessage').text("Select date range to view your diet plan");

     $('#pieContainer').hide().empty();
}

//todo=>Helper Function:

function showDayDetails(date) {

    let dayData = foodData.find(d => d.date === date);

    alert(
        "Date: " + date +
        "\n\nFruits (" + dayData.fruits + "): " + dayData.fruitItems.join(", ") +
        "\nVegetables (" + dayData.vegetables + "): " + dayData.vegetableItems.join(", ") +
        "\nMeat("+ dayData.meat +"): " +dayData.meatItems 
    );
}

function updateNavButtons() {
    $('#prevBtn').prop('disabled', currentMonth.isSame(selectedStart, 'month'));
    $('#nextBtn').prop('disabled', currentMonth.isSame(selectedEnd, 'month'));
}

//todo=>Employee Table :

function loadEmployeeTable() {

    function loadTable(employees) {

        $("#employeeTable tbody").empty();

        employees.forEach(function(emp) {
            let row = `
            <tr>
                <td>${emp.id}</td>
                <td>${emp.employee_name}</td>
                <td>${emp.employee_salary}</td>
                <td>${emp.employee_age}</td>
            </tr>`;
            $("#employeeTable tbody").append(row);
        });

        if ($.fn.DataTable.isDataTable('#employeeTable')) {
            $('#employeeTable').DataTable().destroy();
        }

        $("#employeeTable").DataTable({
            pageLength: 5,
            lengthMenu: [5, 10, 20, 50]
        });
    }

    let storedData = JSON.parse(localStorage.getItem("employees"));

    if (storedData) {
        loadTable(storedData);
    }

    $.ajax({
        url: "https://dummy.restapiexample.com/api/v1/employees",
        method: "GET",

        success: function(response) {
            let employees = response.data;
            localStorage.setItem("employees", JSON.stringify(employees));
            loadTable(employees);
        },

        error: function() {
            let employees = JSON.parse(localStorage.getItem("employees"));
            if (employees) loadTable(employees);
            else alert("No data available");
        }
    });
}

//todo=>Date selection :

function handleApply(picker) {

    let diffMonths = picker.endDate.diff(picker.startDate, 'months', true);

    if (diffMonths > 3) {
        alert("You can select only up to 3 Months ❌");
        return;
    }

    selectedStart = picker.startDate;
    selectedEnd = picker.endDate;

    generateFoodData(selectedStart, selectedEnd);

    currentMonth = selectedStart.clone().startOf('month');

    renderChart();

    updateMessage(
        picker.startDate.format('DD/MM/YYYY'),
        picker.endDate.format('DD/MM/YYYY')
    );

    expandUI();

    $('#pieContainer').fadeIn(400);
}

//todo=>Rendering all in ready()

$(document).ready(function () {

    // ✅ Load table
    loadEmployeeTable();

    // ✅ DatePicker
    $('#datefilter').daterangepicker({
        autoUpdateInput: true,
        locale: { format: 'DD/MM/YYYY' },
        minDate: moment(),
        maxDate: '12/31/2030',
        showDropdowns: true
    });

    $('#datefilter').val('');

    // ✅ Events
    $('#datefilter').on('apply.daterangepicker', function (ev, picker) {
        handleApply(picker);
    });

    $('#datefilter').on('cancel.daterangepicker', function () {
        $(this).val('');
        resetUI();
    });

    $('#nextBtn').click(function () {
        currentMonth.add(1, 'month');
        renderChart();
    });

    $('#prevBtn').click(function () {
        currentMonth.subtract(1, 'month');
        renderChart();
    });

    // ✅ Logout
    $("#logout").click(function(){
        window.location.href="login.html";
    });
});







// ----------------------------------------------------------------------------------------------------------

// const fruitsList = ["Apple", "Banana", "Orange"];
// const vegetablesList = ["Carrot", "Tomato", "Spinach"];
// const meatList = ["Chicken", "Beef", "Fish"];

// let foodData = [];

// function getRandomItems(list,count){
//     let result = [];

//     for(i=0;i<count;i++)
//         result.push(list[Math.floor(Math.random() * list.length)]);
    
//     return result;
// }

// function generateFoodData(startDate, endDate) {

//     let current = moment(startDate);

//     while (current <= endDate) {

//         let fruitsCount = Math.floor(Math.random()*10);
//         let vegCount = Math.floor(Math.random()*10);
//         let meatGrams = Math.floor(Math.random()*10);

//         foodData.push({
//             date : current.format("YYYY-MM-DD"),
//             fruits : fruitsCount,
//             vegetables : vegCount,
//             meat : meatGrams,
            
//         // ✅ IMPORTANT: match count with actual items
//             fruitItems: getRandomItems(fruitsList, fruitsCount),
//             vegetableItems: getRandomItems(vegetablesList, vegCount)
//             meatItems: getRandomItems(meatList,meatGrams)

//         })
        
//         current.add(1, 'days');
//     }
// }


// let currentMonth;
// let selectedStart, selectedEnd;

// function renderChart() {

//     let monthStart = currentMonth.clone().startOf('month');
//     let monthEnd = currentMonth.clone().endOf('month');

//     let filtered = foodData.filter(item => {
//         let d = moment(item.date);
//         return d >= monthStart && d <= monthEnd;
//     });

//     let categories = filtered.map(d => d.date);
//     let fruits = filtered.map(d => d.fruits);
//     let vegetables = filtered.map(d => d.vegetables);
//     let meat = filtered.map(d => d.meat);

//     document.getElementById("monthTitle").innerText =
//         currentMonth.format("MMMM YYYY");

//     Highcharts.chart('chartContainer', {
//         chart: { type: 'column' },
//         title: { text: 'Food Data' },
//         xAxis: { categories: categories },
//         yAxis: {
//             title:{
//                 text : 'Food to consume'
//             }
//         },
        
//     plotOptions: {
//         series: {
//             point: {
//                 events: {
                    
// click: function () {

//     let clickedDate = this.category;

//     let dayData = foodData.find(d => d.date === clickedDate);

    
// alert(
//         "Date: " + clickedDate +
//         "\n\nFruits (" + dayData.fruits + "): " + (dayData.fruitItems.join(", ") || "None") +
//         "\nVegetables (" + dayData.vegetables + "): " + (dayData.vegetableItems.join(", ") || "None") +
//         "\nMeat: " + dayData.meat + " grams"
//     )

// }

//                 }
//             }
//         }
//     },

//         series: [
//             { name: 'Fruits', data: fruits },
//             { name: 'Vegetables', data: vegetables },
//             {name: 'Meat', data: meat}
//         ]
//     });

//     // ✅ control button visibility
//     $('#prevBtn').prop('disabled', currentMonth.isSame(selectedStart, 'month'));
//     $('#nextBtn').prop('disabled', currentMonth.isSame(selectedEnd, 'month'));
      
     
// }


//    //nav buttons for chart
//     $('#nextBtn').click(function () {
//     currentMonth.add(1, 'month');
//     renderChart();
//     });

//     $('#prevBtn').click(function () {
//     currentMonth.subtract(1, 'month');
//     renderChart();
//     });




// $(document).ready(function(){             //runs when the html page is fully loaded 

//      //Date Picker
//   $('#datefilter').daterangepicker({
//       autoUpdateInput: true,
//       locale: {
//         //   cancelLabel: 'Clear',
//         format :'DD/MM/YYYY'
//       },
//     //   opens: 'center',
//       drops: 'down',
//       minDate: moment(),
//       maxDate: '12/31/2030',
//       showDropdowns : true
//   });

//   // ✅ CLEAR DEFAULT VALUE
//   $('#datefilter').val('');



// $('#datefilter').on('apply.daterangepicker', function(ev, picker) {

//     let diffMonths = picker.endDate.diff(picker.startDate,'months',true);

//     // ✅ VALIDATION
//     if (diffMonths > 3) {
//         alert("You can select only up to 3 Months ❌");
//         $(this).val('');
//         return;
//     }

//     // ✅ Main logic
//     selectedStart = picker.startDate;
//     selectedEnd = picker.endDate;

//     foodData = [];
//     generateFoodData(selectedStart, selectedEnd);

//     currentMonth = selectedStart.clone().startOf('month');

//     renderChart();

//     // ✅ IMPORTANT: SET INPUT VALUE
    
    
// const drp = $(this).data('daterangepicker');

//     drp.setStartDate(picker.startDate);
//     drp.setEndDate(picker.endDate);

//     $(this).val(
//         picker.startDate.format('MM/DD/YYYY') +
//         ' - ' +
//         picker.endDate.format('MM/DD/YYYY')
//     );

    
// // ✅ ✅ UPDATE PARAGRAPH TEXT ✅
//     $('#dateMessage').html(
//         `The diet plan between <span id="dateSpan"> ${picker.startDate.format('DD/MM/YYYY')} - ${picker.endDate.format('DD/MM/YYYY')} </span> are given below:`
//     );
//         //$("<span>"+ value +<"/span>")
//     // console.log("Messgae Update")

//     // ✅ expand container
// $('.date').addClass('expanded');

// // ✅ show buttons
// $('#prevBtn, #nextBtn').show();

// });



// $('#datefilter').on('cancel.daterangepicker', function() {
//     $(this).val('');

    
// // ✅ shrink container back
//     $('.date').removeClass('expanded');

//     // ✅ hide buttons again
//     $('#prevBtn, #nextBtn').hide();

    
//  // ✅ Reset message
//     $('#dateMessage').text(
//         "Select date range to view your diet plan"
//     );

    
// // ✅ ✅ REMOVE CHART
//     $('#chartContainer').empty();

//     // ✅ clear month title
//     $('#monthTitle').text('');



    

// });

  
//     //Logout
//     $("#logout").click(function(){
//     window.location.href="login.html";
//                 })

//     //DataTable + API
//     function loadTable(employees){         //used to display employee data in the table

//         $("#employeeTable tbody").empty(); // clear table to avoid duplicate data

//         employees.forEach(function(emp){   //used to iterate each emp [forEach]

//             //used to create row dynamically using string template
//             let row = `                    
//             <tr>
//                 <td>${emp.id}</td>
//                 <td>${emp.employee_name}</td>
//                 <td>${emp.employee_salary}</td>
//                 <td>${emp.employee_age}</td>
//             </tr>
//             `;

//             $("#employeeTable tbody").append(row); //used to add row to table[row --> <tbody>]
//         });

        
//  if ($.fn.DataTable.isDataTable('#employeeTable')) {
//         $('#employeeTable').DataTable().destroy();
//     }


//         //applying datatable[converts table into datatable which has pagination,search,sorting]
//         $("#employeeTable").DataTable(
//                                 {
//                                     pageLength: 5,
//                                     lengthMenu: [5, 10, 20, 50]
//                                 }
// );
//     } //end of loadTable()


//         let storedData = JSON.parse(localStorage.getItem("employees")); //get the saved data from local storage if the data is stored  

//         if(storedData){             //if data is there pass the data to the loadTable 
//             loadTable(storedData);
//         }


//     // API call
//     $.ajax({        //if the data is not stored in localStorage ,fetch/get the data from the api
//         url: "https://dummy.restapiexample.com/api/v1/employees",
//         method: "GET",

//         // When api is success 
//         success: function(response){

//             let employees = response.data;  //get the data from the api and store data in localStorage
//             localStorage.setItem("employees", JSON.stringify(employees));

//             //after storing the data ,pass the data to loadTable 
//             loadTable(employees);
//         },
        
//         //if api is failed due to API blocked (429)many users ,load/save the data in localstorage try to get the data from localstorage 
//         error: function(){

//             // ✅ get from localStorage if API fails due to (429)
//             let employees = JSON.parse(localStorage.getItem("employees"));

//             if(employees){
//                 loadTable(employees);
//             } else {
//                 alert("No data available ");
//             }
//         }

//     });


   

// });




