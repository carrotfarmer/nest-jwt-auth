import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RegisterDto } from './dto/register-dto.dto';
import { User } from './user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(data: RegisterDto): Promise<User> {
    return this.userRepository.save(data);
  }

  async findOne(ctx: { email: string }): Promise<User> {
    return this.userRepository.findOne(ctx);
  }
}
