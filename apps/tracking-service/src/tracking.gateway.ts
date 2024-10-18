import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway()
export class TrackingGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('updateLocation')
  handleLocationUpdate(client: any, payload: any): void {
    this.server.emit(`locationUpdate:${payload.bookingId}`, payload.location);
  }
}
