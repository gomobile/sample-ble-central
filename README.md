BLE-Central
============================
A sample application that demonstrates how to scan, connect, read and write data to a central from a Bluetooth Low Energy (BLE) peripheral via a service and it's specific characteristic.

###Scan for all BLE peripherals
```javascript
ble.scan([], 5, app.onDiscoverDevice, app.onError);
```

###Scan for BLE peripherals with Service UUID "FC00"
```javascript
ble.scan(['FC00'], 5, app.onDiscoverDevice, app.onError);

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
}
```



Intel(R) XDK 
-------------------------------------------
This sample is part of the Intel(R) XDK. 
Download the Intel(R) XDK at http://software.intel.com/en-us/html5. To see the technical details of the sample, 
please visit the sample article page at TBA.


Important App Files
---------------------------
* index.html
* index.css
* index.js
* screenshot.png
* app.json
* README.md