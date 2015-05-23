(function () {
	freeboard.loadDatasourcePlugin({
		type_name: "openweathermap",
		display_name: "Open Weather Map API",
		settings: [
			{
				name: "location",
				display_name: "Location",
				type: "text",
				description: "Example: London, UK"
			},
			{
				name: "units",
				display_name: "Units",
				type: "option",
				default: "imperial",
				options: [
					{
						name: "Imperial",
						value: "imperial"
					},
					{
						name: "Metric",
						value: "metric"
					}
				]
			},
			{
				name: "refresh",
				display_name: "Refresh Every",
				type: "number",
				suffix: "seconds",
				default_value: 5
			}
		],
		newInstance: function (settings, newInstanceCallback, updateCallback) {
			newInstanceCallback(new openWeatherMapDatasource(settings, updateCallback));
		}
	});

	var openWeatherMapDatasource = function (settings, updateCallback) {
  	var self = this;
  	var updateTimer = null;
  	var currentSettings = settings;
  		
  	function updateRefresh(refreshTime) {
  		if (updateTimer) {
  			clearInterval(updateTimer);
  		}
  		
  		updateTimer = setInterval(function () {
  			self.updateNow();
  		}, refreshTime);
  	}
  	
  	function toTitleCase(str) {
  		return str.replace(/\w\S*/g, function (txt) {
  			return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  		});
  	}
  	
  	updateRefresh(currentSettings.refresh * 1000);
  	
  	this.updateNow = function () {
  		$.ajax({
  			url: "http://api.openweathermap.org/data/2.5/weather?q=" + encodeURIComponent(currentSettings.location) + "&units=" + currentSettings.units,
  			dataType: "JSONP",
  			success: function (data) {
  				// Rejigger our data into something easier to understand
  				var newData = {
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
  	
  	this.onDispose = function () {
  		clearInterval(updateTimer);
  		updateTimer = null;
  	}
  	
  	this.onSettingsChanged = function (newSettings) {
  		currentSettings = newSettings;
  		self.updateNow();
  		updateRefresh(currentSettings.refresh * 1000);
  	}
  }
}());
