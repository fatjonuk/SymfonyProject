<script src="{{ asset('bundles/salletp/js/google_charts_loader.js') }}"></script>
//Barres
   


   //piechart
      google.charts.load('current', {'packages':['corechart']});
      google.charts.setOnLoadCallback();

    function loadEditor2(){

      var data = google.visualization.arrayToDataTable([
          ['Year', 'Sales', 'Expenses', 'Profit'],
          ['2014', 1000, 400, 200],
          ['2015', 1170, 460, 250],
          ['2016', 660, 1120, 300],
          ['2017', 1030, 540, 350]
        ]);

        var option = {  
            title: 'Toppings I Like On My Pizza'};


                  // Create a dashboard.
        var dashboard = new google.visualization.Dashboard(
            document.getElementById('dashboard_div'));

         // Create a range slider, passing some options
        var donutRangeSlider = new google.visualization.ControlWrapper({
          'controlType': 'NumberRangeFilter',
          'containerId': 'filter_div',
          'options': {
            'filterColumnLabel': 'Sales'
          }
        });

      // Create the chart to edit.
           var wrapper = new google.visualization.ChartWrapper({
    chartType: 'ColumnChart',
    dataTable: data,
    options: option,
    containerId: 'vis_div2'
  });

     dashboard.bind(donutRangeSlider, wrapper);

      chartEditor = new google.visualization.ChartEditor();
      google.visualization.events.addListener(chartEditor, 'ok', redrawChart2);
      chartEditor.openDialog(wrapper, {});

    }
    // On "OK" save the chart to a <div> on the page.
    function redrawChart2(){
      chartEditor.getChartWrapper().draw(document.getElementById('vis_div2'));
    }




//tableau
           google.charts.load('current', {'packages':['table']});
      google.charts.setOnLoadCallback(drawTable);

      function drawTable() {
        var data = new google.visualization.DataTable();
        data.addColumn('number', 'Numero Dossier');
        data.addColumn('string', 'Nom');
        data.addColumn('string', 'Prenom');
        data.addColumn('number', 'Code Cabinet');
        data.addRows([
          [125,'Ukaj','Fatjon', 35240]
        ]);

        var table = new google.visualization.Table(document.getElementById('table_div'));

        table.draw(data, {showRowNumber: true, width: '100%', height: '100%'});
      }




            // Load the Visualization API and the piechart package.
      





