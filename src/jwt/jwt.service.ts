import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtService {
  createJwtToken(userId: string): string {
    const secret = process.env.JWT_SECRET_KEY || 'default_secret';
    const token = jwt.sign({ userId }, secret, {
      expiresIn: '1h',
    });
    return token;
  }
}
