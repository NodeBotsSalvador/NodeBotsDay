import { Component } from '@angular/core';
import { Socket } from 'ng-socket-io';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  humidity: string;
  temperature: string;
  access: boolean = null;
  rfid: string;
  lastTimeoutId: any;

  constructor(private socket: Socket) {
    this.socket.connect();

    this.socket.emit('message', { message: 'Hello World' });
    this.socket.on('message', (m) => console.log(m));

    this.socket.on('humidity', (humidity) => this.humidity = humidity);
    this.socket.on('temperature', (temperature) => this.temperature = temperature);
    this.socket.on('rfid', (rfid) => {
      this.rfid = rfid;
      this.clearAccess();
    });
    this.socket.on('access', (access) => this.access = access);
  }

  clearAccess() {
    if (this.lastTimeoutId) {
      clearTimeout(this.lastTimeoutId);
    }

    this.lastTimeoutId = setTimeout(() => {
      this.rfid = null;
      this.access = null;
    }, 5000);
  }

}
