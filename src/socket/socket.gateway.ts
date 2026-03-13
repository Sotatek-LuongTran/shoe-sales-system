import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class SocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;

    if (!userId) {
      client.disconnect();
      return;
    }

    client.join(userId);

    // console.log(`User ${userId} connected with socket ${client.id}`);
    console.log('User connected');
    console.log('Socket:', client.id);
    console.log('User room:', userId);
    console.log('Rooms:', [...client.rooms]);
  }

  handleDisconnect(client: Socket) {
    console.log('User disconnected: ' + client.id);
  }
}
