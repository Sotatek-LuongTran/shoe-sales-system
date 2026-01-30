import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import type { JwtModuleOptions } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { AuthenticationService } from "./authentication.service";
import { AuthenticationController } from "./authentication.controller";
import { JwtStrategy } from "./jwt.strategy";

@Module({
    imports: [
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService): JwtModuleOptions => ({
                secret: configService.get<string>('JWT_SECRET') ?? '',
                signOptions: { 
                    expiresIn: (configService.get<string>('JWT_EXPIRES_IN') ?? '1h') as any 
                },
            }),
        }),
    ],
    providers: [AuthenticationService, JwtStrategy],
    controllers: [AuthenticationController],
    exports: [AuthenticationService],
})
export class AuthenticationModule {}