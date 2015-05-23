(function()
{
	var openWeatherMapDatasource = function (settings, updateCallback)
	{
		var self = this;
		var refreshTimer;
		var currentSettings = settings;

		function updateRefreshTimer(interval)
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
		
		updateRefreshTimer(currentSettings.refresh_time * 1000);
		
		function getData()
		{
			if ((currentSettings.latitude != '') && (currentSettings.longitude != '')) 
			{
				var url = "https://thingproxy.freeboard.io/fetch/"
				var url_target += "http://api.openweathermap.org/data/2.5/weather?lat=";
				url_target += currentSettings.latitude;
				url_target += "&lon=";
				url_target += currentSettings.longitude;
				url_target += "&units=";
				url_target += currentSettings.units;
				
				url += encodeURI(url_target);
				
				$.ajax ({
					url:  url,
					dataType: "JSONP",
					type: "GET",
					success: function (data) {
						updateCallback(data);
					},
					error: function (xhr, status, error) {
						self.updateNow();
					}
				 
				});
			}
		}

		self.onSettingsChanged = function(newSettings)
		{
			currentSettings = newSettings;
			updateRefreshTimer(currentSettings.refresh_time * 1000);
			self.updateNow();
		}

		self.updateNow = function()
		{
			getData();
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
