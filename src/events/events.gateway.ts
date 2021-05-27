import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'ws';
import { User } from '../models/User.model';
import { PRIVATE_KEY } from '../config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from '../models/Message.model';
import * as jwt from 'jsonwebtoken';

type EWebSocket = {
  unique: string;
  authority?: {
    token?: string;
    user?: User;
  };
} & WebSocket;

@WebSocketGateway(3001, { transports: ['websocket'] })
export class EventsGateway {
  @WebSocketServer()
  server: Server;
  clients: EWebSocket[] = [];

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
  ) {}

  afterInit() {
    this.server.addListener('connection', (_ws) => {
      const ws = _ws as any as EWebSocket;
      ws.unique = Math.random().toString(36);
      this.clients.push(ws);

      _ws.on('message', this.handleMessage.bind(this, ws));
      _ws.on('close', () => {
        this.clients = this.clients.filter(
          (client) => client.unique !== ws.unique,
        );
      });
    });
  }

  handleMessage(ws: EWebSocket, message: string) {
    try {
      const json = JSON.parse(message) as {
        type: 'auth' | 'push_message' | 'history';
        payload: string;
      };

      switch (json.type) {
        case 'auth':
          return this.auth(ws, json.payload);
        case 'push_message':
          return this.pushMessage(ws, json.payload);
        case 'history':
          return this.history(ws, json.payload);
      }
    } catch {}
  }

  async history(ws: EWebSocket, count: string) {
    if (!ws.authority) return;

    const take = Math.max(1, Math.min(100, parseInt(count, 10)));

    const messages = await this.messageRepository.find({
      order: {
        id: 'DESC',
      },
      relations: ['user'],
      take,
    });

    for (const message of messages) {
      ws.send(
        JSON.stringify({
          type: 'message',
          payload: {
            message: message.message,
            userId: message.userId,
            username: message.user.username,
          },
        }),
      );
    }
  }

  async pushMessage(ws: EWebSocket, message: string) {
    if (!ws.authority) return;

    const entity = await this.messageRepository.save(
      this.messageRepository.create({
        userId: ws.authority.user.id,
        message,
      }),
    );

    const result = JSON.stringify({
      type: 'message',
      payload: { message: entity.message, userId: entity.userId },
    });

    this.clients.forEach((client) => {
      client.send(result);
    });
  }

  async auth(ws: EWebSocket, token: string) {
    const data = await new Promise(
      (res: (v: { username: string }) => void, rej) => {
        jwt.verify(token, PRIVATE_KEY, (err, result: any) =>
          err ? rej(err) : res(result),
        );
      },
    );

    const user = await this.userRepository.findOne({
      where: {
        username: data.username,
      },
    });

    if (!user) return;

    ws.authority = {
      token: token,
      user,
    };

    ws.send(
      JSON.stringify({ type: 'auth', payload: { username: data.username } }),
    );
  }
}
