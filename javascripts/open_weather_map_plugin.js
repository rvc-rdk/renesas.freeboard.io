(function()
{
	freeboard.loadDatasourcePlugin({
		type_name   : "open_weather_map",
		display_name: "Open Weather Map Used for RDKRL78G14",
        	description : "",
        	external_scripts:[
        		"https://dweet.io/client/dweet.io.min.js"
        	],
		settings: [
			{
				name        : "datasource",
				display_name: "Data Source name",
				type        : "text"
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
		newInstance: function(settings, newInstanceCallback, updateCallback) {
			newInstanceCallback(new openWeatherMapDatasource(settings, updateCallback));
		}
	});
	
	var openWeatherMapDatasource = function (settings, updateCallback) {
		var self = this;
		var refreshTimer = null;
		var currentSettings = settings;

		function updateRefreshTimer(interval) {
			if(refreshTimer)
			{
				clearInterval(refreshTimer);
			}

			refreshTimer = setInterval(function() {
				self.updateNow();
			}, interval);
		}
		
		updateRefreshTimer(currentSettings.refresh_time * 1000);
		
		this.updateNow = function() {
			var thing_name = freeboard.getDatasourceSettings(currentSettings.datasource).thing_id;
			var latitude = null;
			var longitude = null;
			if (thing_name != '') {
				dweetio.get_latest_dweet_for(thing_name, function(err, dweet){
					var dweet = dweet[0]; // Dweet is always an array of 1
					latitude = dweet.content.Latitude;
					longitude = dweet.content.Longitude;
				});
			}
			else {
				return;
			}
			
			setTimeout(function(){
				if ((latitude != '') && (longitude != '')) {
					var url = "https://thingproxy.freeboard.io/fetch/";
					var url_target = "http://api.openweathermap.org/data/2.5/weather?lat=";
					url_target += latitude;
					url_target += "&lon=";
					url_target += longitude;
					url_target += "&units=";
					url_target += currentSettings.units;
					
					url += encodeURI(url_target);
					
					$.ajax({
						url:  url,
						dataType: "JSONP",
						success: function (data) {
							updateCallback(data);
						},
						error: function (xhr, status, error) {
						}
					});
				}
				else {
					var location = null;
					var url = "https://thingproxy.freeboard.io/fetch/";
					var openweathermap_url = "http://api.openweathermap.org/data/2.5/weather?q=";
					var freegeoid_url = "https://freegeoip.net/json/";
					$.ajax({
						url: freegeoid_url,
						dataType: "JSONP",
						success: function (data) {
							if (data.city != ''){
								location = data.city;
							}
							else {
								location = data.country_name;
							}
						},
						error: function (xhr, status, error) {
							
						}
					});
					openweater_url += location;
					url += encodeURI(openweathermap_url);
					$.ajax({
						url:  url,
						dataType: "JSONP",
						success: function (data) {
							updateCallback(data);
						},
						error: function (xhr, status, error) {
						}
					});
				}
			}, 500);
		}

		self.onSettingsChanged = function(newSettings) {
			currentSettings = newSettings;
			updateRefreshTimer(currentSettings.refresh_time * 1000);
			self.updateNow();
		}

		self.onDispose = function() {
			clearInterval(refreshTimer);
			refreshTimer = undefined;
		}
	}
}());
