/* global angular */
/* global ble  */
/* jshint browser: true , devel: true*/

angular.module('starter.controllers', [])

.controller('HomeCtrl', function($scope, $interval, $timeout, $state, blePerpheralsService) {

	$scope.deviceId = "";
	var seconds = 5;
	var tempArray = [];
	$scope.scanStatus = {
		phase 	: "",
		text	: ""
	};
	var timeReduction;

	$scope.isScanBtnDisabled = false;

	/*Description: Add discovered device to tempArray*/
	var onDiscoverDevice = function(device) {
	    console.log(JSON.stringify(device));
	 	//Add device to array
	 	tempArray.push(device);
	};

	/*Description: Set device list and make visible*/
	var setDeviceList = function(){
		$interval.cancel(timeReduction)
		$scope.scanStatus.phase = "complete";
		$scope.scanStatus.text = "Scan Complete";
		$scope.blePeripherals = tempArray;
		angular.element(document.querySelectorAll("#peripheral-list")).removeClass("hidden");
	}

	/*Description: Scan for all BLE peripheral devices or for devices with a specific service UUID*/
	$scope.scan = function(serviceId) {
		seconds = 5;
		$scope.scanStatus.phase = "in-progress";
		$scope.scanStatus.text = "Scanning for devices....(5s left)";
		tempArray = [];
		angular.element(document.querySelectorAll("#peripheral-list")).addClass("hidden");
		if(serviceId !== undefined){
			if((serviceId.length !== 0) || (serviceId.replace(/\s/g, '').length)) { //Not spaces or empty
				console.log("Scan for Service UUID "+serviceId);
				blePerpheralsService.setServiceId(serviceId);
				//BLE Cordova plugin
				ble.scan([serviceId.toUpperCase()], seconds, onDiscoverDevice, blePerpheralsService.onError);
			}
		}
		else {
			console.log("Scan for all");
			//BLE Cordova plugin
			ble.scan([], seconds, onDiscoverDevice, blePerpheralsService.onError);
		}
		$scope.isScanBtnDisabled = true;

		var secondsLeft = seconds;

		//Set interval to visibly display the remaining seconds
		var timeReduction = $interval(function() {
			secondsLeft = secondsLeft - 1;
			if(secondsLeft > 0) {
				$scope.scanStatus.text = "Scanning for devices....(" + secondsLeft + "s left)";
			}
		}, 1000)

		//Set Timeout for applying device info to cards
		$timeout(setDeviceList, (seconds*1000));

	}

	/*Description: Connect to BLE peripheral*/
	$scope.connect = function(id, name) {
		blePerpheralsService.setSelectedDeviceId(id);
		blePerpheralsService.setSelectedDeviceName(name);
		var onConnect = function() {
			$scope.navigateTo("connection");
		}
		ble.connect(blePerpheralsService.getSelectedDeviceId(), onConnect, blePerpheralsService.onError);
	}

	/*Description: Transition to desired state/View*/
	$scope.navigateTo = function(stateName) {
		$state.go(stateName);
	}

})

.controller('ConnectionCtrl', function($scope, $state, $ionicModal, blePerpheralsService) {
	
	/*Ionic Modal Events and functions*/
	$ionicModal.fromTemplateUrl('templates/communication-req-modal.html', {
		scope: $scope,
		animation: 'slide-in-up'
	}).then(function(modal) {
		$scope.modal = modal;
	});

	$scope.openModal = function() {
		$scope.modal.show();
	};

	$scope.$on('modal.shown', function() {
  		console.log('Modal is shown!');
  		$scope.serviceUuid = blePerpheralsService.getServiceId();
	});

	$scope.closeModal = function(serviceUuid, characteristicUuid) {
		blePerpheralsService.setServiceId(serviceUuid);
		blePerpheralsService.setCharacteristicId(characteristicUuid);
		$scope.modal.hide();
	};

	//Cleanup the modal when we're done with it!
	$scope.$on('$destroy', function() {
		$scope.modal.remove();
	});

	$scope.$on('$ionicView.enter', function(){ //This is fired twice in a row
        console.log("Connection view entered.");
		$scope.deviceName = blePerpheralsService.getSelectedDeviceName();
        $scope.openModal();
    });

	$scope.$on('$ionicView.beforeLeave', function(){ //This is fired twice in a row
        console.log("Before Connection view left.");
        $scope.disconnect();
    });    

	/*
    Description: Convert String to ArrayBuffer 
	*/
	var stringToBytes = function(string) {
	   var array = new Uint8Array(string.length);
	   for (var i = 0, l = string.length; i < l; i++) {
	       array[i] = string.charCodeAt(i);
	    }
	    return array.buffer;
	}

	/*
	    Description: Convert ArrayBuffer to String
	*/
	var bytesToString = function(buffer) {
	    return String.fromCharCode.apply(null, new Uint8Array(buffer));
	}

	/*onRead callback*/
	var onRead = function(data) {
		console.log("data read");
        var str = bytesToString(data);
        console.log(str);
        //Add str to element on connection state/view
        $scope.$apply(function(){ //Access scope from outside function
        	$scope.dataMessage = str;
        });
	}

	/*Description: Read Data from a BLE connected peripheral*/
	$scope.readData = function() {
        //read(device_id, service_uuid, characteristic_uuid, success_function, failure_function)
        ble.read(blePerpheralsService.getSelectedDeviceId(), blePerpheralsService.getServiceId(), blePerpheralsService.getCharacteristicId(), onRead, blePerpheralsService.onError);
    }

    /*onWrite callback*/
	var onWrite = function() {
	    console.log("data written to BLE peripheral");
	}

    /*Description: Write data to BLE peripheral*/
    $scope.writeData = function() {
        console.log("writeData");
        var str = "Hello from mobile device!!!";
        console.log(stringToBytes(str));
        ble.write(blePerpheralsService.getSelectedDeviceId(), blePerpheralsService.getServiceId(), blePerpheralsService.getCharacteristicId(), stringToBytes(str), onWrite, blePerpheralsService.onError);
    }

	/*Description: Transition to home View and reset peripheral list*/
	var backToHome = function () {
		console.log("Connection disconnected");
		$scope.navigateTo("home");
		$scope.blePeripherals = [];
	};

	/*Description: Disconnect from the BLE peripheral*/
	$scope.disconnect = function() {
	    ble.disconnect(blePerpheralsService.getSelectedDeviceId(), backToHome, blePerpheralsService.onError);
	};

	$scope.navigateTo = function(stateName) {
		$state.go(stateName);
	}

});
