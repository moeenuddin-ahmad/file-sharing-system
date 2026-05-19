import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtServices {
  constructor(private readonly jwtService: JwtService) {}

  async generateToken(payload: any) {
    return this.jwtService.sign(payload, { expiresIn: '1d' });
  }

  async verifyToken(token: string) {
    return this.jwtService.verify(token);
  }
}
