import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Driver {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  licenseNumber: string;

  @Column()
  vehicleType: string;

  @Column({ default: false })
  isAvailable: boolean;

  @Column('decimal', { precision: 9, scale: 6, nullable: true })
  currentLatitude: number;

  @Column('decimal', { precision: 9, scale: 6, nullable: true })
  currentLongitude: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  get currentLocation() {
    return {
      latitude: this.currentLatitude,
      longitude: this.currentLongitude,
    };
  }
}
