import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';
import { BcryptServices } from 'src/common/services/bcrypt.utils';
import { JwtServices } from 'src/common/services/jwt.utls';
import { MailServices } from 'src/common/services/mail.utils';

@Injectable()
export class UsersService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly bcryptService: BcryptServices,
    private readonly jwtService: JwtServices,
    private readonly mailService: MailServices,
  ) {}

  async create(createUserDto: Prisma.UserCreateInput) {
    createUserDto.password = await this.bcryptService.hashPassword(
      createUserDto.password,
    );
    return this.databaseService.user.create({ data: createUserDto });
  }

  async login(
    loginUserDto: Pick<Prisma.UserCreateInput, 'email' | 'password'>,
  ) {
    const user = await this.databaseService.user.findUnique({
      where: { email: loginUserDto.email },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const isPasswordValid = await this.bcryptService.comparePassword(
      loginUserDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }
    const { accessToken, refreshToken } = await this.jwtService.generateToken({
      id: user.id,
      email: user.email,
    });
    await this.databaseService.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });
    return { user, accessToken, refreshToken };
  }

  findAll() {
    return this.databaseService.user.findMany();
  }

  async findOne(id: number) {
    const user = await this.databaseService.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(id: number, updateUserDto: Prisma.UserUpdateInput) {
    if (updateUserDto.password && typeof updateUserDto.password === 'string') {
      updateUserDto.password = await this.bcryptService.hashPassword(
        updateUserDto.password,
      );
    }
    return this.databaseService.user.update({
      where: { id },
      data: updateUserDto,
    });
  }

  async remove(id: number) {
    return this.databaseService.user.delete({ where: { id } });
  }

  async forgetPassword(email: string) {
    const user = await this.databaseService.user.findUnique({
      where: { email },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const resetToken = await this.jwtService.generateResetToken({
      id: user.id,
      email: user.email,
    });

    const resetLink = `http://localhost:3000/reset-password?token=${resetToken}`;

    const htmlContent = `
      <h1>Reset Your Password</h1>
      <p>Hello ${user.name},</p>
      <p>Please click the link below to reset your password. This link will expire in 10 seconds:</p>
      <a href="${resetLink}">Reset Password</a>
    `;

    await this.mailService.sendMail(
      user.email,
      'Reset Your Password',
      htmlContent,
    );

    return { message: 'Reset link sent to your email', resetToken };
  }

  async resetPassword(token: string, newPassword: string) {
    const payload = await this.jwtService.verifyToken(token);
    if (!payload.email) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const hashedPassword = await this.bcryptService.hashPassword(newPassword);

    await this.databaseService.user.update({
      where: { email: payload.email },
      data: { password: hashedPassword },
    });

    return { message: 'Password reset successfully' };
  }

  async refresh(accessTokenDTO: string, refreshTokenDTO: string) {
    try {
      // First, verify the access token
      const accessTokenPayload =
        await this.jwtService.verifyToken(accessTokenDTO);

      const user = await this.databaseService.user.findUnique({
        where: { id: accessTokenPayload.id },
      });

      return {
        message: 'Access token is still valid',
        user,
        accessToken: accessTokenDTO,
        refreshToken: refreshTokenDTO,
      };
    } catch (error) {
      const refreshTokenPayload =
        await this.jwtService.verifyToken(refreshTokenDTO);

      const user = await this.databaseService.user.findUnique({
        where: { id: refreshTokenPayload.id },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Security check: Match the stored refresh token to prevent reuse of old tokens
      if (user.refreshToken !== refreshTokenDTO) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const { accessToken, refreshToken } = await this.jwtService.generateToken(
        {
          id: user.id,
          email: user.email,
        },
      );

      await this.databaseService.user.update({
        where: { id: user.id },
        data: { refreshToken },
      });

      return { user, accessToken, refreshToken };
    }
  }
}
