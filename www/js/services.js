angular.module('starter.services', [])

.factory('blePerpheralsService', function() {

	var selectedDeviceId = "";
	var serviceId = "";
	var characteristicId = "";
	var selectedDeviceId = "";

	return {
		getSelectedDeviceId : function() {
			return selectedDeviceId;
		},
		setSelectedDeviceId : function(id) {
			selectedDeviceId = id;
		},
		getSelectedDeviceName : function() {
			return selectedDeviceName;
		},
		setSelectedDeviceName : function(name) {
			selectedDeviceName = name;
		},
		getServiceId : function() {
			return serviceId;
		},
		setServiceId : function(id) {
			serviceId = id;
		},
		getCharacteristicId : function() {
			return characteristicId;
		},
		setCharacteristicId : function(id) {
			characteristicId = id;
		},
		onError: function(reason) {
        	alert("ERROR: " + reason);
    	}
	}
});