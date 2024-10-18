import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';

@WebSocketGateway()
export class TrackingGateway {
  @WebSocketServer()
  server: Server;

  private client: ClientProxy;

  constructor() {
    // Initialize Redis client for microservice communication
    this.client = ClientProxyFactory.create({
      transport: Transport.REDIS,
      options: { host: 'localhost', port: 6379 },
    });
  }

  @SubscribeMessage('subscribeToTracking')
  handleSubscription(client: any, data: { bookingId: string }) {
    client.join(`tracking-room-${data.bookingId}`);
  }

  // Listen for location updates from Tracking Service
  async handleLocationUpdates() {
    const trackingUpdates = this.client.send({ cmd: 'subscribe_tracking' }, {});

    trackingUpdates.subscribe((update) => {
      this.server
        .to(`tracking-room-${update.bookingId}`)
        .emit('locationUpdate', update.location);
    });
  }
}
