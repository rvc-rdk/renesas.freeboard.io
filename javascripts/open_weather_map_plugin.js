(function()
{
	var openWeatherMapDatasource = function (settings, updateCallback)
	{
		var self = this;
		var refreshTimer;
		var currentSettings = settings;

		function createRefreshTimer(interval)
		{
			if(refreshTimer)
			{
				clearInterval(refreshTimer);
			}

			refreshTimer = setInterval(function()
			{
				self.updateNow();
			}, interval);
		}
		
		createRefreshTimer(currentSettings.refresh_time * 1000);
		
		self.getData = function ()
		{
			if ((currentSettings.latitude != '') && (currentSettings.longitude != '')) 
			{
				var url = "http://api.openweathermap.org/data/2.5/weather?lat=";
				url += currentSettings.latitude;
				url += "&lon=";
				url += currentSettings.longitude;
				url += "&units=";
				url += currentSettings.units;
				
				$.ajax ({
					type: "POST",
					dataType: "JSONP",
					url:  url + "&callback=?",
					success: function (data) {
						updateCallback(data);
					},
					error: function (xhr, status, error) {
					}
				 
				});
			}
		}

		self.onSettingsChanged = function(newSettings)
		{
			currentSettings = newSettings;
			self.updateNow();
		}

		self.updateNow = function()
		{
			self.getData();
		}

		self.onDispose = function()
		{
			clearInterval(refreshTimer);
			refreshTimer = undefined;
		}
	};
	
	freeboard.loadDatasourcePlugin({
		"type_name"   : "open_weather_map",
		"display_name": "Open Weather Map API",
        	"description" : "",

		"external_scripts" : [
			//"https://dweet.io/client/dweet.io.min.js"
		],
		"settings"    : [
			{
				"name"        : "latitude",
				"display_name": "Latitude",
				"type"        : "calculated"
			},
			{
				"name"        : "longitude",
				"display_name": "Longitude",
				"type"        : "calculated"
			},
			{
				"name"        : "units",
				"display_name": "Units",
				"type"        : "option",
				"default"     : "imperial",
				"options": [
					{
						"name" : "Imperial",
						"value": "imperial"
					},
					{
						"name" : "Metric",
						"value": "metric"
					}
				]
			},
			{
				"name"         : "refresh_time",
				"display_name" : "Refresh Time",
				"type"         : "number",
				"description"  : "seconds",
				"default_value": 5
			}
		],
		newInstance   : function(settings, newInstanceCallback, updateCallback)
		{
			newInstanceCallback(new openWeatherMapDatasource(settings, updateCallback));
		}
	})
}());
