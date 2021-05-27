import {
  Body,
  Controller,
  ForbiddenException,
  NotFoundException,
  Post,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoginDto, RegisterDto } from '../dtos';
import { User } from '../models/User.model';
import { PRIVATE_KEY } from '../config';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

@Controller('/auth')
export class AuthController {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  @Post('/login')
  async login(@Body() loginDto: LoginDto) {
    const { username, password } = loginDto;

    const user = await this.userRepository.findOne({
      where: {
        username,
      },
    });

    if (!user) throw new NotFoundException();

    const isPasswordsCompared = await bcrypt.compare(password, user.password);

    if (!isPasswordsCompared) throw new ForbiddenException();

    const accessToken = await this.genAccessToken(user);

    return {
      token: accessToken,
    };
  }

  @Post('/register')
  async register(@Body() registerDto: RegisterDto) {
    const { username, password } = registerDto;

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await this.userRepository.save(
      this.userRepository.create({
        username,
        password: passwordHash,
      }),
    );

    const accessToken = await this.genAccessToken(user);

    return {
      token: accessToken,
    };
  }

  protected async genAccessToken(user: User) {
    return new Promise((res, rej) =>
      jwt.sign(
        { username: user.username },
        PRIVATE_KEY,
        (err: Error, result: string) => (err ? rej(err) : res(result)),
      ),
    );
  }
}
