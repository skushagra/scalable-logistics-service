import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Booking {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  vehicleType: string;

  @Column()
  pickupLocation: string;

  @Column()
  dropOffLocation: string;

  @Column('decimal', { precision: 10, scale: 2 })
  estimatedCost: number;

  @Column()
  status: string;

  @Column('decimal', { precision: 9, scale: 6, nullable: true })
  pickupLatitude: number;

  @Column('decimal', { precision: 9, scale: 6, nullable: true })
  pickupLongitude: number;

  @Column('decimal', { precision: 9, scale: 6, nullable: true })
  dropOffLatitude: number;

  @Column('decimal', { precision: 9, scale: 6, nullable: true })
  dropOffLongitude: number;

  @Column({ nullable: true })
  driverId: number;
}
