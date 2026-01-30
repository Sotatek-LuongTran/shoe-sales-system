import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from 'src/database/repositories/user.repository';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { UserRole } from 'src/database/entities/user.entity';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly usersRepo: UserRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    const existing = await this.usersRepo.findByEmail(createUserDto.email) 
    if (existing) {
        throw new BadRequestException('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = await this.usersRepo.create({
        email: createUserDto.email,
        name: createUserDto.name,
        password_hash: hashedPassword,
        role: UserRole.USER,
        deletedAt: null,
    })

    return {
        user: {
            userId: user.id,
            email: user.email,
            name: user.name,
        },
        message: "User registered successfully"
    }
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersRepo.findByEmail(loginDto.email)
    if (!user) {
        throw new UnauthorizedException('Invalid credentials')
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password_hash)
    if (!isPasswordValid) {
        throw new UnauthorizedException('Password is wrong')
    }

    if (user.deletedAt !== null) {
        throw new UnauthorizedException('You have been deactivated')
    }

    const payload = { sub: user.id, role: user.role };
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: this.configService.get('JWT_EXPIRES_IN'),
    });

    return {
        accessToken: accessToken,
        message: "User log in successfully"
    };
  }
}
