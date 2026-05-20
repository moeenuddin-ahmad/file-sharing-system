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
import { JwtServices } from 'src/common/services/jwt.utls';

@WebSocketGateway(8080, {
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly jwtService: JwtServices) {}

  private onlineUsers = new Map<number, Socket>();

  async handleConnection(client: Socket) {
    const handshake = client.handshake;
    const token = handshake.auth?.token || handshake.query?.token;
    if (!token) {
      client.disconnect();
      return;
    }

    try {
      const payload = await this.jwtService.verifyToken(token as string);

      if (!payload) {
        console.log('Invalid token');
        client.disconnect();
        return;
      }

      this.onlineUsers.set(payload.id, client);
      console.log(`User ${payload.id} connected`);
    } catch (error) {
      console.log('JWT Verification Error:', error.message);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    for (const [userId, socket] of this.onlineUsers.entries()) {
      if (socket.id === client.id) {
        this.onlineUsers.delete(userId);
        console.log(`User ${userId} disconnected`);
        break;
      }
    }
  }

  joinUserToFileSpace(userId: number, fileSpaceId: number) {
    const client = this.onlineUsers.get(userId);
    if (client) {
      client.join(`space_${fileSpaceId}`);
    }
  }

  leaveUserFromFileSpace(userId: number, fileSpaceId: number) {
    const client = this.onlineUsers.get(userId);
    if (client) {
      client.leave(`space_${fileSpaceId}`);
    }
  }

  getActiveUsersInFileSpace(fileSpaceId: number): number[] {
    const roomName = `space_${fileSpaceId}`;
    const ids: number[] = [];
    for (const [userId, socket] of this.onlineUsers.entries()) {
      if (socket.rooms.has(roomName)) {
        ids.push(userId);
      }
    }
    return ids;
  }

  informFileSpace(fileSpaceId: number) {
    this.server.to(`space_${fileSpaceId}`).emit('update-file');
  }

  @SubscribeMessage('ping')
  handlePing(@MessageBody() payload: any): string {
    console.log('Ping received:', payload, this.onlineUsers);
    return 'pong';
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
