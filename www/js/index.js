/* global mainPage, deviceList, scanButton, dataInfo */
/* global detailPage, dataInfo, readButton, disconnectButton */
/* global ble  */
/* jshint browser: true , devel: true*/
'use strict';

var app = {
    initialize: function() {
        this.bindEvents();
        detailPage.hidden = true;
    },
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        scanButton.addEventListener('touchstart', this.refreshDeviceList, false);
        readButton.addEventListener('touchstart', this.readData, false);
        writeButton.addEventListener('touchstart', this.writeData, false);
        disconnectButton.addEventListener('touchstart', this.disconnect, false);
        deviceList.addEventListener('click', this.connect, false); // assume not scrolling
    },
    onDeviceReady: function() {
        app.refreshDeviceList();
    },
    refreshDeviceList: function() {
        deviceList.innerHTML = ''; // empties the list
        console.log("scan for peripherals");
        // scan for all devices
        //ble.scan([], 5, app.onDiscoverDevice, app.onError);
        // scan for devices with service UUID FC00
        ble.scan(['FC00'], 5, app.onDiscoverDevice, app.onError);
    },
    onDiscoverDevice: function(device) {

        console.log(JSON.stringify(device));
        var listItem = document.createElement('li'),
            html = '<b>' + device.name + '</b><br/>' +
                'RSSI: ' + device.rssi + '&nbsp;|&nbsp;' +
                device.id;

        listItem.dataset.deviceId = device.id;  
        listItem.dataset.deviceName = device.name;
        listItem.innerHTML = html;
        deviceList.appendChild(listItem);

    },
    connect: function(e) {
        alert("Device Name: "+e.target.dataset.deviceName);
        var deviceId = e.target.dataset.deviceId,
            onConnect = function() {
                readButton.dataset.deviceId = deviceId;
                writeButton.dataset.deviceId = deviceId;
                disconnectButton.dataset.deviceId = deviceId;
                app.showDetailPage();
            };

        ble.connect(deviceId, onConnect, app.onError);
    },
    readData: function(event) {
        console.log("readData");
        var deviceId = event.target.dataset.deviceId;
        //read(device_id, service_uuid, characteristic_uuid, success_function, failure_function)
        ble.read(deviceId, "FC00", "FC0F", app.onRead, app.onError);
    },
    onRead: function(data) {
        console.log("data Found");
        console.log(data);
        var a = bytesToString(data);
        console.log(a);
        dataInfo.innerHTML = a;
    },
    writeData: function(event) {
        console.log("writeData");
        var deviceId = event.target.dataset.deviceId;
        var str = "Hello from your mobile device";
        console.log(stringToBytes(str));
        ble.write(deviceId, "FC00", "FC0F", stringToBytes(str), app.onWrite, app.onError);
    },
    onWrite: function() {
        console.log("data written");
    },
    disconnect: function(event) {
        var deviceId = event.target.dataset.deviceId;
        ble.disconnect(deviceId, app.showMainPage, app.onError);
    },
    showMainPage: function() {
        mainPage.hidden = false;
        detailPage.hidden = true;
    },
    showDetailPage: function() {
        mainPage.hidden = true;
        detailPage.hidden = false;
    },
    onError: function(reason) {
        alert("ERROR: " + reason);
    }
};

/*
    Description: Convert String to ArrayBuffer 
*/
function stringToBytes(string) {
   var array = new Uint8Array(string.length);
   for (var i = 0, l = string.length; i < l; i++) {
       array[i] = string.charCodeAt(i);
    }
    return array.buffer;
}

/*
    Description: Convert ArrayBuffer to String
*/
function bytesToString(buffer) {
    return String.fromCharCode.apply(null, new Uint8Array(buffer));
}