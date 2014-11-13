(function(){
'use strict';
var tempLog = angular.module('tempLog', ["firebase"]);

	function average (arr) {
	  return _.reduce(arr, function(memo, num)
	  {
	    return memo + num;
	  }, 0) / arr.length;
	}
	// controller gets data for most recent day for each device
	tempLog.controller('probesController', function($scope, $firebase){
    	var ref = new Firebase("https://resplendent-fire-1683.firebaseio.com/");
			var probes = [];
			ref.once("value", function(snapshot, callback) {
			  // probes holds array of probe objects
		      var devices = snapshot.val();
		      var todayArray = [];
		      var todayLabels = [];
		      var ProbeObjs = {}; //ProbeObjs holds this probes latest readings
		      var device_id = _.keys(devices);
		      var d = 0; //device counter
		      $.each(devices, function (index) {
		        var year = devices[index];
		        $.each(year, function (index) {
		          var today = year[index];
		          var day = 1; //day counter
			          $.each(today, function (index) {
			          	if (day == 1) {
			          		var log = today[index];
			          		var probe_id = [];
			          		var latestTime = '';
				            $.each(log, function (index){
				            	var probe = log[index];
				            	latestTime = log[index].time;
				            	var probe_id = _.keys(probe.temp);
				            	$.each(probe.temp, function (index) {
				            		 todayArray.push(probe.temp[index]);
				            	});
				            });
				            console.log(latestTime);
				            ProbeObjs = { 
				            	"device_id": device_id[d], 
				            	"today": todayArray, 
				            	"current":_.last(todayArray).toFixed(2), 
				            	"currentTime": latestTime,
				            	"avg":average(todayArray).toFixed(2), 
				            	"total": todayArray.length,
				            	'max':_.max(todayArray), 
				            	'min':_.min(todayArray),
				            };
				            probes.push(ProbeObjs);
				            todayArray = [];
				        }
				        day++;
			          });
		        });
		         d++;
		         ProbeObjs ={};
		      });
			$(".container").removeClass('render');
			$(".loading").fadeOut();
			$('.probes').fadeIn();
			// loads in data once they have be loaded
			$scope.probes = probes;
			});

			var sync = $firebase(ref);
			// create a synchronized object, all server changes are downloaded in realtime
			var ProbesObj = sync.$asObject();
			$scope.probes = ProbesObj;
		}); //controller
})();

