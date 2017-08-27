const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const five = require('johnny-five');

const app = express();
const httpServer = http.Server(app);
const io = socketIo(httpServer);

let lastValue = '';

io.on('connection', function (socket) {
  updateClients(lastValue);

  socket.on('message', (m) => {
    socket.emit('message', { message: 'How Are You?' });
  });
});

var port = process.env.PORT || 3000;

httpServer.listen(port, () => console.log('listening in http://localhost:' + port));

const board = five.Board({
  port: '/dev/ttyACM0'
});

const bytesToString = (bytes) => {
  return bytes
    .map((code) => code === 255 ? 32 : code)
    .map((code) => String.fromCharCode(code))
    .join('')
    .replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
  };

const updateClients = (value) => {
  let list = value.split('|');

  if (list[0]) {
    io.emit('rfid', list[0]);

    io.emit('access', list[0] === '20:41:C2:80');
  }

  if (list[1]) {
    io.emit('humidity', Number(list[1]));
  }

  if (list[2]) {
    io.emit('temperature', Number(list[2]));
  }
};

board.on('ready', function () {
  this.i2cConfig();

  const onChange = (bytes, value) => {
    if (value != lastValue) {
      lastValue = value;
      io.emit('message', { message: value });
      updateClients(value);
      // console.log("Bytes read: ", JSON.stringify(bytes));
      // console.log("Value read: ", value);
    }
  };

  this.i2cRead(0x08, 0x00, 32, (bytes) => {
    let value = bytesToString(bytes);
    if (value) onChange(bytes, value);
  });
});
