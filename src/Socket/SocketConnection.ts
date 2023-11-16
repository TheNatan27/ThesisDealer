import {Server} from 'socket.io';
import express from 'express';
import {createServer} from 'node:http';
import {logger} from '../Shared/Logger';
import path from 'node:path';
import {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from './SocketTypes';

export class SockerConnetion {
  readonly frontend = express();
  readonly frontendServer = createServer(this.frontend);
  readonly io = new Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >(this.frontendServer);
  readonly frontendPort = 30010;

  constructor() {
    this.frontend.get('/', (request, response) => {
      response.sendFile(path.join(__dirname, 'b../../Pages/index.html'));
    });
    this.io.on('connection', socket => {
      logger.info('a user is connected');
      socket.on('disconnect', () => {
        logger.info('user disconnected');
      });
      socket.emit('basicEmit', 1, '2');
    });
  }

  async startListening() {
    this.frontend.listen(this.frontendPort, () => {
      logger.info('Frontend available at http://localhost:30010');
    });
  }
}
