/*
 * OpenWeatherMap data source for RDKRL78G14 dashboard
 * */
(function()
{
	freeboard.loadDatasourcePlugin({
		type_name   : "open_weather_map",
		display_name: "Open Weather Map API",
        description : "",

		external_scripts : [
			//"https://dweet.io/client/dweet.io.min.js"
		],
		settings    : [
			{
				name         : "name",
				display_name : "Name",
				type         : "text",
				default_value: "OpenWeatherMap",
				description  : ""
			},
			{
				name        : "latitude",
				display_name: "Latitude",
				type        : "calculated"
			},
			{
				name        : "longitude",
				display_name: "Longitude",
				type        : "calculated"
			},
			{
				name        : "units",
				display_name: "Units",
				type        : "option",
				default     : "imperial",
				options: [
					{
						name : "Imperial",
						value: "imperial"
					},
					{
						name : "Metric",
						value: "metric"
					}
				]
			},
			{
				name         : "refresh_time",
				display_name : "Refresh Time",
				type         : "number",
				description  : "seconds",
				default_value: 5
			}
		],
		newInstance   : function(settings, newInstanceCallback, updateCallback)
		{
			newInstanceCallback(new myDatasourcePlugin(settings, updateCallback));
		}
	});

	var openWeatherMapDatasource = function(settings, updateCallback)
	{
		var self = this;
		var refreshTimer;
		var currentSettings = settings;

		function getData()
		{
			if ((currentSettings.latitude != '') && (currentSettings.longitude != '')) 
			{
				$.ajax ({
					url: "http://api.openweathermap.org/data/2.5/weather?lat=" + currentSettings.latitude + "&lon=" + currentSettings.longitude + "&units=" + currentSettings.units,
					dataType: "JSONP",
					success: function (data) {
						var newData = 
						{
							place_name: data.name,
							sunrise: (new Date(data.sys.sunrise * 1000)).toLocaleTimeString(),
							sunset: (new Date(data.sys.sunset * 1000)).toLocaleTimeString(),
							conditions: toTitleCase(data.weather[0].description),
							current_temp: data.main.temp,
							high_temp: data.main.temp_max,
							low_temp: data.main.temp_min,
							pressure: data.main.pressure,
							humidity: data.main.humidity,
							wind_speed: data.wind.speed,
							wind_direction: data.wind.deg
						};
					updateCallback(newData);
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
			getData();
		}

		self.onDispose = function()
		{
			clearInterval(refreshTimer);
			refreshTimer = undefined;
		}

		createRefreshTimer(currentSettings.refresh_time);
	}
}());
