import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
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
      const roomName = `space_${fileSpaceId}`;
      client.join(roomName);
      // active users list needs refreshing
      this.server.to(roomName).emit('update-active-users');
    }
  }

  leaveUserFromFileSpace(userId: number, fileSpaceId: number) {
    const client = this.onlineUsers.get(userId);
    if (client) {
      const roomName = `space_${fileSpaceId}`;
      client.leave(roomName);
      // active users list needs refreshing
      this.server.to(roomName).emit('update-active-users');
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
    console.log({ ids });
    return ids;
  }

  informFileSpace(fileSpaceId: number) {
    const roomName = `space_${fileSpaceId}`;
    this.server.to(roomName).emit('update-file');
  }
}
