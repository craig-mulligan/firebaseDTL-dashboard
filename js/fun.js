function average (arr)
{
  return _.reduce(arr, function(memo, num)
  {
    return memo + num;
  }, 0) / arr.length;
}

var ref = new Firebase("https://temp-tracker.firebaseio.com/");

    ref.once("value", function(snapshot, callback) {
      var years = [];
      var temps = [];
      var dailyTemps = [];
      labels = [];

      years = snapshot.val();
      // series = array to hold every years temps
      series = [];
      yearObj = {};
      labels = [];
      $.each(years, function (index) {
        var year = years[index];
        // yearloop
        var d = 1;
        // currentYear is used in the tooltip in the follow loop
        currentYear = index;
          $.each(year, function (index) {
            var day = year[index];
            var labels = _.keys(day);
            var totalDays = _.keys(year).length;
              // dayCount = number of days recorded per year
               l = 1;
                $.each(day, function (index) {
                  var logCount = _.keys(day).length;
                  var log = day[index];
                  dailyTemps.push(log.temp);
                  if (logCount == l) {
                    var dailyAvg = average(dailyTemps);
                    temps.push(dailyAvg);
                    dailyTemps = [];
                  }
                  l++;
                }); //day loop
            // after the last day of the year push the years temps to series array and cleary year temp array
            if (totalDays == d) {
                    // if its last day for the year push the years temps to series.
                    var yearObj = { 'name': 'Year: '+ currentYear, "data":temps};
                    series.push(yearObj);
                    // clear obj
                    yearObj = {};
                    // clear temps for the new year
                    temps = [];
                    // clear labels for new year
              }
            d++;
          }); //year loop
      }); //years loop
        new Chartist.Line('.ct-chart', {
        // TODO: once got proper data set labels
        labels: ['1', '2', '3', '4'],
        series: series,
        });
        var easeOutQuad = function (x, t, b, c, d) {
        return -c * (t /= d) * (t - 2) + b;
      };

      var $chart = $('.ct-chart');

      var $toolTip = $chart
        .append('<div class="tooltip"></div>')
        .find('.tooltip')
        .hide();

      $chart.on('mouseenter', '.ct-point', function() {
        var $point = $(this),
          value = $point.attr('ct:value'),
          seriesName = $point.parent().attr('ct:series-name');

        $point.animate({'stroke-width': '50px'}, 300, easeOutQuad);
        $toolTip.html(seriesName + '<br>' + value).show();
      });

      $chart.on('mouseleave', '.ct-point', function() {
        var $point = $(this);

        $point.animate({'stroke-width': '20px'}, 300, easeOutQuad);
        $toolTip.hide();
      });

      $chart.on('mousemove', function(event) {
        $toolTip.css({
          left: event.offsetX - $toolTip.width() / 2 - 10,
          top: event.offsetY - $toolTip.height() - 0,
        });
      });


    }, function (errorObject) {
      console.log("The read failed: " + errorObject.code);
    });


      
  function todayAction(ref, cb) {
    // this is responsible for getting all data for the today panel
    ref.startAt().limitToFirst(1).on("child_added", function(snapshot) {
      cb(snapshot.val());
      var year = snapshot.val();
      var todayArray = [];
      var todayLabels = [];
        $.each(year, function (index) {
          var today = year[index];
          $.each(today, function (index) {
          var log = today[index];
          todayArray.push(log.temp);
          todayLabels.push(log.time);
          });
        });
      var avg = average(todayArray);
      $('#avg').text(avg.toFixed(2));
      setcolor(avg, '#avg');
      setcolor(_.last(todayArray).toFixed(2), '#current');
      $('#total').html('calculated from <b>' + todayArray.length + '</b> readings');
      $('#current').text(_.last(todayArray).toFixed(2));
      $('#timeStamp').html('Recorded at: <b>' + _.last(todayLabels) +'</b>');
      $('#min').html(_.min(todayArray));
      $('#max').html(_.max(todayArray));
    });
  }
 
  function go() {
    todayAction(ref, function(val) {
    });
  }

  function setcolor(value, selector) {
    if (value < 10) {
      $(selector).addClass('low');
    } else if (value > 20 ) {
      $(selector).addClass('high');
    } else {
      $(selector).addClass('mid');
    }
  }
  go();