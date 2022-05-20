/*
 * @Author: FORMAT-qi
 * @Date: 2022-05-02 11:45:36
 * @LastEditors: FORMAT-qi
 * @LastEditTime: 2022-05-02 12:51:33
 * @Description:
 */
import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  SetMetadata, HttpException,
} from '@nestjs/common';
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";
import { JwtStrategy } from '../strategy/jwt.strategy';
import { JwtService } from '@nestjs/jwt';
import { AppService } from '../app.service';
import { Types } from 'mongoose';

@Injectable()
export class SuperJwtAuthGuard extends AuthGuard("jwt") {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
    private appService: AppService
  ) {
    super();
  }
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    // token对比
    const request = context.switchToHttp().getRequest();
    const authorization = request["headers"].authorization || void 0;
    let tokenNotTimeOut = true;
    if (authorization) {
      const token = authorization.split(" ")[1]; // authorization: Bearer xxx
      try {
        let payload: any = this.jwtService.decode(token);
        const user = await this.appService.findSuperLoginTokenOne({
          user: new Types.ObjectId(payload.uid), token
        });
        if (!user) throw new UnauthorizedException("请重新登录");
      } catch (err) {
        tokenNotTimeOut = false;
        throw new UnauthorizedException("请重新登录");
      }
    }
    return tokenNotTimeOut && (super.canActivate(context) as boolean);
  }


  handleRequest(err, user, info) {
    // You can throw an exception based on either "info" or "err" arguments
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
// 生成跳过检测装饰器
export const IS_PUBLIC_KEY = "isPublic";
export const SkipAuth = () => SetMetadata(IS_PUBLIC_KEY, true);

