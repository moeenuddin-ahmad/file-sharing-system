import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';
import { BcryptServices } from 'src/common/services/bcrypt.utils';
import { JwtServices } from 'src/common/services/jwt.utls';

@Injectable()
export class UsersService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly bcryptService: BcryptServices,
    private readonly jwtService: JwtServices,
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
    const accessToken = await this.jwtService.generateToken({
      id: user.id,
      email: user.email,
    });
    return { user, accessToken };
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

  remove(id: number) {
    return this.databaseService.user.delete({ where: { id } });
  }
}
