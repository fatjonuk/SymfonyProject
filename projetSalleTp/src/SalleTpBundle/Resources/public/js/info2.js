
    google.charts.load('current', {packages: ['charteditor']});
    google.charts.setOnLoadCallback(loadEditor);
    var chartEditor = null;
    
    function loadEditor() {
      // Create the chart to edit.
      var wrapper = new google.visualization.ChartWrapper({
         'chartType':'LineChart',
         'dataTable':'[['Mois', 'IRM', 'SCANNER'],
         ['JAN',18,25],
          ['FEV',15,20]]', 
         'options': {'title':'Population Density (people/km^2)', 'legend':'none'}
      });
      chartEditor = new google.visualization.ChartEditor();
      google.visualization.events.addListener(chartEditor, 'ok', redrawChart);
      chartEditor.openDialog(wrapper, {});
    }

    // On "OK" save the chart to a <div> on the page.
    function redrawChart(){
      chartEditor.getChartWrapper().draw(document.getElementById('vis_div'));
    }

  </script>