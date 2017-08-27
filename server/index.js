const http = require('http');
const socketIo = require('socket.io');
const five = require('johnny-five');

const httpServer = http.Server();
const io = socketIo(httpServer);


const port = process.env.PORT || 3000;

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

board.on('ready', function () {
  let lastValue = '';
  const servo = new five.Servo(10);
  this.i2cConfig();

  const updateClients = (value) => {
    let list = value.split('|');

    if (list[0]) {
      io.emit('rfid', list[0]);

      if (list[0] === '20:41:C2:80') {
        io.emit('access', true);
        servo.center();
        setTimeout(() => servo.min(), 5000);
      } else {
        io.emit('access', false);
        servo.min();
      }
    }

    if (list[1]) {
      io.emit('humidity', Number(list[1]));
    }

    if (list[2]) {
      io.emit('temperature', Number(list[2]));
    }
  };

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

  servo.min();

  io.on('connection', (socket) => {
    updateClients(lastValue);

    socket.on('message', (m) => {
      socket.emit('message', { message: 'How Are You?' });
    });
  });
});
