const five = require('johnny-five');
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
  this.i2cConfig();

  const onChange = (bytes, value) => {
    console.log("Bytes read: ", JSON.stringify(bytes));
    console.log("Value read: ", value);
  };

  this.i2cRead(0x08, 0x00, 32, (bytes) => {
    let value = bytesToString(bytes);
    if (value) onChange(bytes, value);
  });
});
