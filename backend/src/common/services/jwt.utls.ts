import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtServices {
  constructor(private readonly jwtService: JwtService) {}

  async generateToken(payload: any) {
    return {
      accessToken: this.jwtService.sign(payload, { expiresIn: '1d' }),
      refreshToken: this.jwtService.sign(payload, { expiresIn: '7d' }),
    };
  }

  async generateResetToken(payload: any) {
    return this.jwtService.sign(payload, { expiresIn: '10s' });
  }

  async verifyToken(token: string) {
    return this.jwtService.verify(token);
  }
}
