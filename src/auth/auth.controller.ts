import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private jwtService: JwtService,
  ) {}

  @Post('register')
  async register(
    @Body('name') name: string,
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user: User = await this.authService.create({
      name,
      email,
      password: hashedPassword,
    });

    delete user.password;
    return user;
  }

  @Post('login')
  async login(
    @Body('email') email: string,
    @Body('password') password: string,
    @Res({
      passthrough: true,
    })
    res: Response,
  ) {
    const user: User = await this.authService.findOne({ email });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const jwt = await this.jwtService.signAsync({ id: user.id });

    res.cookie('jwt', jwt, {
      httpOnly: true,
    });

    return {
      message: 'success',
    };
  }

  @Get('user')
  async me(@Req() req: Request) {
    try {
      const cookie = req.cookies['jwt'];
      const data = await this.jwtService.verifyAsync(cookie);

      if (!data) {
        throw new UnauthorizedException();
      }

      const user = await this.authService.findOne(data.id);
      const { password, ...result } = user;
      return result;
    } catch (err) {
      throw new UnauthorizedException();
    }
  }

  @Post('logout')
  async logout(
    @Res({
      passthrough: true,
    })
    res: Response,
  ) {
    res.clearCookie('jwt');
    return {
      message: 'successfully logged out',
    };
  }
}
