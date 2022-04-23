import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { TableUser, TableUserDocument } from '../../schemas/table_user.schema';
import { Encrypt } from '../../utils/encrypt';
import { TableGuest, TableGuestDocument } from '../../schemas/table_guest.schema';
import { AdminUser, AdminUserDocument } from '../../schemas/admin_user.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel('AdminUser') private adminUserModel: Model<AdminUserDocument>,
    @InjectModel('TableUser') private tableUserModel: Model<TableUserDocument>,
    @InjectModel('TableGuest') private tableGuestModel: Model<TableGuestDocument>,

  ) {}

  async findTableUser(where?: any): Promise<any> {
    return await this.tableUserModel
      .find(where || {})
      .exec();
  }

  async findTableUserOne(where: any): Promise<any> {
    return await this.tableUserModel
      .findOne(where)
      .exec();
  }

  async findAdminUser(where?: any): Promise<any> {
    return await this.adminUserModel
      .findOne(where || {})
      .exec();
  }

  async findAdminUserOne(where: any): Promise<any> {
    return await this.adminUserModel
      .findOne(where)
      .exec();
  }

  async findTableGuest(where?: any): Promise<any> {
    return await this.tableGuestModel
      .find(where || {})
      .exec();
  }
  async findTableGuestOne(where: any): Promise<any> {
    return await this.tableGuestModel
      .findOne(where)
      .exec();
  }
}
