import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AuthController } from './controllers/auth.controller';
import { EventsModule } from './events/events.module';
import { Message } from './models/Message.model';
import { User } from './models/User.model';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'user',
      password: 'password',
      database: 'db',
      entities: [User, Message],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([User, Message]),
    EventsModule,
  ],
  controllers: [AppController, AuthController],
  providers: [],
})
export class AppModule {}
