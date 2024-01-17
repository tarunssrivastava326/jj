const express = require('express');
const fs = require('fs');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const port = process.env.YOUR_PORT || process.env.PORT || 4000;;
var http = require('http').createServer(app);
var corsOptions = {
    allowedHeaders: [
        'X-ACCESS_TOKEN',
        'Access-Control-Allow-Origin',
        'Authorization',
        'Origin',
        'x-requested-with',
        'Content-Type',
        'Content-Range',
        'Content-Disposition',
        'Content-Description',
    ],
    credentials: true,
    methods: 'GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE',
    origin: [
        'http://localhost:5000',
        'http://10.84.16.7:5000',
        'http://10.84.16.7:4000'
    ],
    preflightContinue: false
};

// Allow all origins
const corsOpts = cors(corsOptions);
app.use(corsOpts);
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// Start node server
http.listen(port, () => {
    console.log('Server Listening to port ' + port)
});

// Devices
app.get('/devices', (req, res) => {
    res.sendFile(__dirname + '/json/devices.json');
});

app.post('/deviceConnect', (req, res) => {
    res.sendFile(__dirname + '/json/deviceConnect.json');
});

app.post('/deviceMeta', (req, res) => {
    res.sendFile(__dirname + '/json/deviceMeta.json');
});

app.get('/deviceInfo', (req, res) => {
    res.sendFile(__dirname + '/json/deviceInfo.json');
});

app.get('/deviceConfig', (req, res) => {
    res.sendFile(__dirname + '/json/deviceConfig.json');
});

app.put('/deviceCheckin', (req, res) => {
    res.sendFile(__dirname + '/json/deviceCheckin.json');
});

app.post('/deleteDevice', (req, res) => {
    res.sendFile(__dirname + '/json/deleteDevice.json');
});

app.post('/deleteDevices', (req, res) => {
    res.sendFile(__dirname + '/json/deleteDevices.json');
});

app.put('/updateDeviceConfig', (req, res) => {
    var deviceList = [];
    fs.readFile(__dirname + '/json/devices.json', 'utf8', (err, data) => {
        if (err) {
          console.error(err);
          return;
        }
        deviceList = JSON.parse(data).data;
        const isDevicePresent = deviceList.filter(device => device.id === req.body.id);
        if(isDevicePresent.length < 1) {
            res.status(404).send('Device Not Found');
            return;
        }
        deviceList.forEach(device => {
            if (device.id === req.body.id) {
                device.client.primary = req.body.primary;
                device.client.secondary = req.body.secondary;
                device.client.serverMode = req.body.serverMode;
                device.client.pollInterval = req.body.pollInterval;
                device.majorName = req.body.majorName;
                device.minorName = req.body.minorName;
                device.description = req.body.description;
            }
        });
        let dataToUpdate = {
            status: "success",
            data: deviceList,
            columnMeta: {
                defaultColumns: [
                    {key: "serial", value: "Serial"},
                    {key: "firmwareVersion", value: "FW Ver."},
                    {key: "lastCheckin", value: "Last Check-in"},
                    {key: "status", value: "Status"}
                ],
                allColumns: [
                    { key: "serial", value: "Serial" },
                    { key: "firmwareVersion", value: "FW Ver." },
                    { key: "lastCheckin", value: "Last Check-in" },
                    { key: "status", value: "Status" },
                    { key: "platform", value: "Platform" },
                    { key: "unitId", value: "Unit ID" },
                    { key: "majorName", value: "Major Name" },
                    { key: "minorName", value: "Minor Name" },
                    { key: "model", value: "Model" },
                    { key: "remoteHost", value: "Remote Host" }
                ]
            }
        };
        let updateData = JSON.stringify(dataToUpdate, null, 4);
        fs.writeFile('json/devices.json', updateData, (err) => {
            if (err) throw err;
            return res.status(200).json({
                status: 200,
                message: "Device Data Updated Successfully"
            });
        });
    });

});


// User Administration
app.get('/users', (req, res) => {
    res.status(200).sendFile(__dirname + '/json/users.json');
});

app.get('/userData', (req, res) => {
    var usersList = [];
    var selectedUser = {};
    var response = {};
    fs.readFile(__dirname + '/json/users.json', 'utf8', (err, data) => {
        if (err) {
          console.error(err);
          return;
        }
        usersList = JSON.parse(data);
        usersList.forEach(user => {
            if (user.id === req.query.id) {
                selectedUser = user;
            } 
        });
        if(!selectedUser) {
            res.status(404).send('User Not Found');
            return;
        }
        response = {
            status: 'success',
            data: selectedUser
        };
        res.status(200).send(JSON.stringify(response));
    });
});

app.post('/addUser', (req, res) => {
    fs.readFile(__dirname + '/json/users.json', 'utf8', (err, data) => {
        if (err) {
          console.error(err);
          return;
        }
        usersList = JSON.parse(data);
        const userData = {
            id: randomStr(16, 'qwerty098765'),
            username: req.body.firstName.toLowerCase() + '.' + req.body.lastName.toLowerCase(),
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            role: req.body.role,
            emailVerified: false,
            attributes: {
                devices: req.body.deviceList
            }
        }
        usersList.push(userData)
        let updateData = JSON.stringify(usersList, null, 4);
        fs.writeFile('json/users.json', updateData, (err) => {
            if (err) throw err;
            return res.status(200).json({
                status: 200,
                message: "User Added Successfully"
            });
        });
    });
});

app.post('/modifyUser', (req, res) => {
    fs.readFile(__dirname + '/json/users.json', 'utf8', (err, data) => {
        if (err) {
          console.error(err);
          return;
        }
        usersList = JSON.parse(data);
        const isUserPresent = usersList.filter(user => user.id === req.body.id);
        if(isUserPresent.length < 1) {
            res.status(404).send('User Not Found');
            return;
        }
        usersList.forEach(user => {
            if (user.id === req.body.id) {
                user.firstName = req.body.firstName;
                user.lastName = req.body.lastName;
                user.email = req.body.email;
                user.role = req.body.role;
                user.attributes = {
                    devices: req.body.deviceList
                };
            }
        });
        let updateData = JSON.stringify(usersList, null, 4);
        fs.writeFile('json/users.json', updateData, (err) => {
            if (err) throw err;
            return res.status(200).json({
                status: 200,
                message: "User Data Updated Successfully"
            });
        });
    });
});

app.post('/deleteUsers', (req, res) => {
    res.sendFile(__dirname + '/json/users.json');
});

app.post('/deleteUser', (req, res) => {
    res.sendFile(__dirname + '/json/deleteUser.json');
});

// Project Management
app.get('/projects', (req, res) => {
    res.sendFile(__dirname + '/json/projects.json');
});

function randomStr(len, arr) {
    let ans = '';
    for (let i = len; i > 0; i--) {
        ans +=
            arr[(Math.floor(Math.random() * arr.length))];
    }
    return ans;
}