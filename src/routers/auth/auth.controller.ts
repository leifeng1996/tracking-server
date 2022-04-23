import { Controller, HttpException, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { Encrypt } from '../../utils/encrypt';
import { Types } from 'mongoose';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService
  ) {
  }

  @Post('login/table')
  async loginTable(@Req() req: Request): Promise<any> {
    const { account, password } = req.body;
    const user =  await this.userService.findTableUserOne({
      account
    });
    console.log("user: ", user);
    if (!user) throw new HttpException({
      errCode: 1000001, message: '账号不存在'
    }, HttpStatus.OK);
    if (user.password !== Encrypt.md5(password).toLocaleUpperCase()) throw new HttpException({
      errCode: 1000002, message: '登录密码错误'
    }, HttpStatus.OK);
    if (!user.table) throw new HttpException({
      errCode: 1000005, message: '该账号未分配台桌'
    }, HttpStatus.OK);
    const createAt: number = new Date().getTime();
    return {
      access_token: this.jwtService.sign({
        uid: user._id.toString(),
        tid: user.table.toString(),
        scope: ['table'],
        createAt: createAt
      }, {
        expiresIn: `${3600 * 6}s`
      }),
      refresh_token: this.jwtService.sign({
        uid: user._id.toString(),
        createAt: createAt
      }, {
        expiresIn: `${3600 * 24 * 30}s`
      })
    }
  }

  @Post('login/admin')
  async loginAdmin(@Req() req: Request): Promise<any> {
    const { account, password } = req.body;
    console.log("body: ", req.body);
    const user = await this.userService.findAdminUserOne({
      account
    });
    if (!user) throw new HttpException({
      errCode: 10001, message: '该账号不存在，请查证后重试！'
    }, HttpStatus.OK);
    if (user.password !== Encrypt.md5(password).toLocaleUpperCase()) throw new HttpException({
      errCode: 10002, message: '该账号密码错误，请查证后重试！'
    }, HttpStatus.OK);
    const createAt: number = new Date().getTime();
    return {
      access_token: this.jwtService.sign({
        uid: user._id.toString(),
        scope: ['admin'],
        createAt: createAt
      }, {
        expiresIn: `${3600 * 24 * 30}s`
      }),
      refresh_token: this.jwtService.sign({
        uid: user._id.toString(),
        createAt: createAt
      }, {
        expiresIn: `${3600 * 24 * 30}s`
      })
    }
  }

  @Post('refresh/token/table')
  async refreshToken(@Req() req): Promise<any> {
    const { refresh_token } = req.body;
    let refresh: any = this.jwtService.decode(refresh_token);
    if (!refresh) throw new HttpException({
      errCode: 401, message: '令牌无效'
    }, HttpStatus.UNAUTHORIZED);
    return this.userService.findTableUserOne({
      _id: new Types.ObjectId(refresh.uid)
    }).then((user) => {
      if (!user) throw new HttpException({
        errCode: 1000001, message: '账号或密码错误'
      }, HttpStatus.OK);
      if (!user.tableId) throw new HttpException({
        errCode: 1000005, message: '该账号未分配台桌'
      }, HttpStatus.OK);
      const createAt: number = new Date().getTime();
      return {
        access_token: this.jwtService.sign({
          uid: user._id.toString(),
          tid: user.tableId.toString(),
          createAt: createAt
        }, {
          expiresIn: `${3600 * 6}s`
        }),
        refresh_token: this.jwtService.sign({
          uid: user._id.toString(),
          createAt: createAt
        }, {
          expiresIn: `${3600 * 24 * 30}s`
        })
      }
    })
  }
}
