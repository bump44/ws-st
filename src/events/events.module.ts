import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventsGateway } from './events.gateway';
import { Message } from '../models/Message.model';
import { User } from '../models/User.model';

@Module({
  imports: [TypeOrmModule.forFeature([User, Message])],
  providers: [EventsGateway],
})
export class EventsModule {}
