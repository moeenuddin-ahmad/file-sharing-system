import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
} from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';

@WebSocketGateway(8080, {
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log('Client connected:', client.id);
  }

  handleDisconnect(client: Socket) {
    console.log('Client disconnected:', client.id);
  }

  @SubscribeMessage('ping')
  handlePing(@MessageBody() payload: any): string {
    console.log('Ping received:', payload);
    return 'pong';
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: any,
  ): string {
    client.join(payload.roomName);
    return 'Room joined successfully';
  }

  @SubscribeMessage('sendMessage')
  handleSendMessage(
    @MessageBody() payload: { roomName: string; message: string },
    @ConnectedSocket() client: Socket,
  ): string {
    this.server.to(payload.roomName).emit('receiveMessage', payload.message);
    return 'Message sent successfully';
  }
}
