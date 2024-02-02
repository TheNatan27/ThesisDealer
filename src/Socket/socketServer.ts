import express from 'express';
import {createServer} from 'node:http';
import {logger} from '../Shared/Logger';
import {Server} from 'socket.io';
import {join} from 'node:path';

const app = express();
const socketServer = createServer(app);
export const io = new Server(socketServer, {
  cors: {
    origin: 'http://localhost:3000',
  },
});

app.get('/', (request, response) => {
  response.sendFile(join(__dirname, '../../Pages/index.html'));
});

export async function startListening() {
  socketServer.listen(30010, () => {
    logger.info('Socket server running at http://localhost:30010');
  });
}

io.on('track-deployment-debug', message => {
  logger.warn(`track debug ${message}`);
});

io.on('connection', socket => {
  logger.debug('a  user connected');

  socket.on('chat message', message => {
    logger.warn(`message received ${message}`);
    io.emit('chat message', message);
  });

  socket.on('track-deployment-debug', message => {
    logger.warn(`track debug received ${message}`);
  });
});
