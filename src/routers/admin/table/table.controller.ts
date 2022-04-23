import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AdminService } from '../admin.service';
import { AuthGuard } from '@nestjs/passport';
import { Encrypt } from '../../../utils/encrypt';
import { Types } from 'mongoose';

@Controller('table')
export class TableController {
  constructor(
    private adminService: AdminService
  ) { }

  @UseGuards(AuthGuard('jwt'))
  @Post('list')
  async getTableList(@Req() req): Promise<any> {
    return await this.adminService.findTable();
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('create')
  async createTable(@Req() req): Promise<any> {
    let params = req.body;
    params.openCash = 0;
    params.openChip = 0;
    params.middleCash = 0;
    params.middleChip = 0;
    params.openTimeDate = new Date('1999-02-01 00:00:00');
    params.overTimeDate = new Date('1999-01-01 00:00:00');
    params.superPass = Encrypt.md5(params.superPass).toLocaleUpperCase();
    return await this.adminService.createTable(params);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('update')
  async updateTable(@Req() req): Promise<any> {
    const params = req.body;
    if (params.superPass.length < 6) delete params.superPass;
    params.modifyTimeDate = new Date();
    return await this.adminService.updateTable(params);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('delete')
  async deleteTable(@Req() req): Promise<any> {
    const { ids } = req.body;
    return await this.adminService.deleteTable(ids);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/user/list')
  async getTableUserList(@Req() req): Promise<any> {
    return await this.adminService.findTableUser();
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/user/create')
  async createTableUser(@Req() req): Promise<any> {
    const params = req.body;
    params.table = new Types.ObjectId(params.tableId);
    delete params.tableId;
    params.password = Encrypt.md5(params.password).toLocaleUpperCase()
    return await this.adminService.createTableUser([params]);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/user/update')
  async updateTableUser(@Req() req): Promise<any> {
    const { id, password, realName, tableId } = req.body;
    const user = await this.adminService.findTableUserOne({
      _id: new Types.ObjectId(id)
    });
    let params: any = {};
    if (password.length >= 6 &&
      user.password !==  Encrypt.md5(password).toLocaleUpperCase())
      params.password = Encrypt.md5(password).toLocaleUpperCase();
    if (user.realName !== realName)
      params.realName = realName;
    if (user.table !== new Types.ObjectId(tableId))
      params.table = new Types.ObjectId(tableId)
    params.modifyTimeDate = new Date();
    return await this.adminService.updateTableUser({
      realName, table: new Types.ObjectId(tableId),
      modifyTimeDate: new Date()
    }, {
      _id: new Types.ObjectId(id)
    });
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/user/delete')
  async deleteTableUser(@Req() req): Promise<any> {
    const { ids } = req.body;
    return await this.adminService.deleteTableUser(ids);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/settlement/list')
  async getTableSettlement(@Req() req): Promise<any> {
    let { offset, limit, where } = req.body;
    return await this.adminService.findTableSettlementPage(
      offset, limit, where
    );
  }
}
