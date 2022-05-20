import { Controller, Get, HttpException, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AppService } from '../app.service';
import { Encrypt } from '../utils/encrypt';
import { AuthGuard } from '@nestjs/passport';
import { Types } from 'mongoose';
import {
  CALCULATE_RESULT_GAME,
  game_agent_level,
  GAME_CHIP_RECORD_TYPE,
  game_gold_multiple, game_member_level, game_ratio_multiple,
} from '../constant/game.constant';
import supertest from 'supertest';

@Controller('admin')
export class AdminController {
  constructor(
    private readonly jwtService: JwtService,
    private readonly appService: AppService,
  ) { }

  /** @description 系统迭代数据接口 */
  @Get('/versionUpdate')
  private async washCodeToCurrency(): Promise<any> {
    await this.appService.versionUpdate();
    return { message: 'ok' }
  }

  /** @description 登录后台系统 */
  @Post('/login')
  private async login(@Req() req): Promise<any> {
    const { account, password } = req.body;
    const user = await this.appService.findAdminUserOne({
      account
    });
    if (!user) throw new HttpException({
      errCode: -1, message: '该账号不存在，请查证后重试！'
    }, HttpStatus.OK);
    const passMD5 = Encrypt.md5(password).toLocaleUpperCase();
    if (user.password !== passMD5) throw new HttpException({
      errCode: 10002, message: '该账号密码错误，请查证后重试！'
    }, HttpStatus.OK);
    return {
      access_token: this.jwtService.sign({
        uid: user._id.toString(),
        scope: ['admin']
      }, { expiresIn: `${3600 * 24 * 30}s` }),
      refresh_token: this.jwtService.sign({
        uid: user._id.toString(),
      }, { expiresIn: `${3600 * 24 * 30}s` })
    }
  }

  /** @description 获取用户信息 */
  @UseGuards(AuthGuard('jwt'))
  @Post('/access')
  private async getAccess(@Req() req): Promise<any> {
    const { uid } = req.user;
    const user = await this.appService.findAdminUserOne({
      _id: new Types.ObjectId(uid)
    });
    if (!user) throw new HttpException({
      errCode: 100001, message: '用户不存在,请查证后重试!'
    }, HttpStatus.OK);

    let permission: string[] = [];
    let isSuper: boolean = user.roleDetail.findIndex(item => item.name === 'ROLE_ADMIN') !== -1;
    if (!!isSuper) {
      permission = await this.appService.findAdminPermission().then(rs => {
        return rs.map(val => val.name);
      });
    } else {
      let pd: any[] = user.permissionDetail;
      for (let j = 0; j < pd.length; ++j) {
        if (permission.indexOf(pd[j].name) === -1)
          permission = [...permission, pd[j].name];
      }
    }
    return { uid: user._id.toString(), account: user.account, access: permission }
  }

  /** @description 获取系统用户 */
  @UseGuards(AuthGuard('jwt'))
  @Post('/sys/user/list')
  async getAdminUserList(@Req() req): Promise<any> {
    return this.appService.findAdminUser();
  }

  /** @description 创建系统用户 */
  @UseGuards(AuthGuard('jwt'))
  @Post('/sys/user/create')
  async createAdminUser(@Req() req): Promise<any> {
    const { account, password, roleIds, description } = req.body;
    const user = await this.appService.findAdminUserOne({ account });
    if (user) throw new HttpException({
      errCode: 10001, message: '该账号已存在'
    }, HttpStatus.OK);

    return await this.appService.createAdminUser([{
        account, password: Encrypt.md5(password).toLocaleUpperCase(),
        description
    }]).then(async rs => {
        let arr = roleIds.map(val => {
          return { user: rs[0]._id, role: new Types.ObjectId(val) };
        });
        arr.length !== 0 && await this.appService.createAdminUserRole(arr);
        return { message: 'ok' };
      })
  }

  /** @description 更新系统用户 */
  @UseGuards(AuthGuard('jwt'))
  @Post('/sys/user/update')
  async updateAdminUser(@Req() req): Promise<any> {
    const { id, password, roleIds, status, description } = req.body;
    const user = await this.appService.findAdminUserOne({
      _id: new Types.ObjectId(id)
    });
    if (!user) throw new HttpException({
      errCode: 10001, message: '该用户不存在'
    }, HttpStatus.OK);

    let params: any = {};
    if (!isNaN(status) && user.status !== status)
      params.status = status;
    if (!!description)
      params.description = description;

    const passMD5: string = Encrypt.md5(password || '').toLocaleUpperCase();
    if (!!password && user.password !== passMD5)
      params.password = passMD5;
    let addArr = roleIds
      .filter(val => user.roleIds.indexOf(val) === -1)
      .map(val => {
        return { user: user._id, role: new Types.ObjectId(val) };
      });
    let delArr = user.roleIds.filter(val => roleIds.indexOf(val) === -1);
    await this.appService.updateAdminUserOne(params, { _id: user._id });
    addArr.length !== 0 && await this.appService.createAdminUserRole(addArr);
    delArr.length !== 0 && await this.appService.deleteAdminUserRole(
      user._id.toString(), delArr
    );
    return { message: '更新用户成功' };
  }

  /** @description 删除系统用户 */
  @UseGuards(AuthGuard('jwt'))
  @Post('/sys/user/delete')
  async deleteAdminUser(@Req() req): Promise<any> {
    const { ids } = req.body;
    return await this.appService.deleteAdminUser(ids);
  }

  /** @description 获取菜单 */
  @UseGuards(AuthGuard('jwt'))
  @Post('/sys/menu/list')
  async getAdminMenuList(@Req() req): Promise<any> {
    const { uid } = req.user;
    const user = await this.appService.findAdminUserOne({
      _id: new Types.ObjectId(uid)
    });
    if (!user) throw new HttpException({
      errCode: -1, message: '用户不存在,请查证后重试!'
    }, HttpStatus.OK);
    let isSuper: boolean = user.roleDetail.findIndex(item => item.name === 'ROLE_ADMIN') !== -1;
    return isSuper ? await this.appService.findAdminMenu() : user.menuDetail;
  }

  /** @description 创建菜单 */
  @UseGuards(AuthGuard('jwt'))
  @Post('/sys/menu/create')
  async createAdminMenu(@Req() req): Promise<any> {
    let { menu, parentId } = req.body;
    if (!!parentId) menu.parent = new Types.ObjectId(parentId);
    await this.appService.createAdminMenu([menu]);
    return { message: 'ok' };
  }

  /** @description 更新菜单 */
  @UseGuards(AuthGuard('jwt'))
  @Post('/sys/menu/update')
  async updateAdminMenu(@Req() req): Promise<any> {
    let { id, menu } = req.body;
    await this.appService.updateAdminMenu(menu, {
      _id: new Types.ObjectId(id)
    });
    return { message: 'ok' };
  }

  /** @description 删除菜单 */
  @UseGuards(AuthGuard('jwt'))
  @Post('/sys/menu/delete')
  async deleteAdminMenu(@Req() req): Promise<any> {
    const { ids } = req.body;
    await this.appService.deleteAdminMenu(ids)
    return { message: 'ok' };
  }

  /** @description 获取权限 */
  @UseGuards(AuthGuard('jwt'))
  @Post('/sys/permission/list')
  async getAdminPermissionList(@Req() req): Promise<any> {
    const { uid } = req.user;
    const user = await this.appService.findAdminUserOne({
      _id: new Types.ObjectId(uid)
    });
    if (!user) throw new HttpException({
      errCode: 100001, message: '用户不存在,请查证后重试!'
    }, HttpStatus.OK);
    let isSuper: boolean = user.roleDetail.findIndex(item => item.name === 'ROLE_ADMIN') !== -1;
    return isSuper ? await this.appService.findAdminPermission() : user.permissionDetail;
  }

  /** @description 创建权限 */
  @UseGuards(AuthGuard('jwt'))
  @Post('/sys/permission/create')
  async createAdminPermission(@Req() req): Promise<any> {
    const { permission, parentId } = req.body;
    await this.appService.createAdminPermission([{
      ...permission, ...{ parent: new Types.ObjectId(parentId) }
    }]);
    return { message: 'ok' };
  }

  /** @description 更新权限 */
  @UseGuards(AuthGuard('jwt'))
  @Post('/sys/permission/update')
  async updateAdminPermission(@Req() req): Promise<any> {
    const { id, permission } = req.body;
    await this.appService.updateAdminPermission(permission, {
      _id: new Types.ObjectId(id)
    });
    return { message: 'ok' };
  }

  /** @description 删除权限 */
  @UseGuards(AuthGuard('jwt'))
  @Post('/sys/permission/delete')
  async deleteAdminPermission(@Req() req): Promise<any> {
    const { ids } = req.body;
    await this.appService.deleteAdminPermission(ids);
    return { message: 'ok' };
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/sys/role/list')
  async getAdminRoleList(@Req() req): Promise<any> {
    return await this.appService.findAdminRole();
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/sys/role/create')
  async createAdminRole(@Req() req): Promise<any> {
    const params = req.body;
    await this.appService.createAdminRole([params]);
    return { message: 'ok' };
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/sys/role/update')
  async updateAdminRole(@Req() req): Promise<any> {
    let { id, name, desc } = req.body;
    await this.appService.updateAdminRole({
      name, desc
    }, { _id: new Types.ObjectId(id) });
    return { message: 'ok' };
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/sys/role/delete')
  async deleteAdminRole(@Req() req): Promise<any> {
    const { ids } = req.body;
    return await this.appService.deleteAdminRole(ids);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/sys/role/permission/update')
  async updateAdminRolePermission(@Req() req): Promise<any> {
    let { id, menuIds, permissionIds } = req.body;
    const roles = await this.appService.findAdminRoleOne({
      _id: new Types.ObjectId(id)
    }) || [];
    const role = roles.length === 1 ? roles[0] : null;
    if (role === null) return ;
    const addRoleMenu =  menuIds.filter(val =>
      role.inventoryMenu.findIndex(
        item => item.menu.toString() === val
      ) === -1
    );
    const delRoleMenu =  role.inventoryMenu.filter(val =>
      menuIds.findIndex(
        item => item === val.menu.toString()
      ) === -1
    ).map( val => val.menu);
    const addRolePermission = permissionIds.filter(val =>
      role.inventoryPermission.findIndex(
        item => item.permission.toString() === val
      ) === -1
    );
    const delRolePermission = role.inventoryPermission.filter(val =>
      permissionIds.findIndex(
        item => item === val.permission.toString()
      ) === -1
    ).map( val => val.permission);
    console.log(addRoleMenu, delRoleMenu, addRolePermission, delRolePermission);
    await this.appService.createAdminRoleMenu(addRoleMenu.map( val => {
      return { role: new Types.ObjectId(id),  menu: new Types.ObjectId(val) }
    }));
    await this.appService.deleteAdminRoleMenu(id, delRoleMenu);

    await this.appService.createAdminRolePermission(addRolePermission.map( val => {
      return { role: new Types.ObjectId(id),  permission: new Types.ObjectId(val) }
    }));
    await this.appService.deleteAdminRolePermission(id, delRolePermission);
    return { message: "ok" };
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/table/list')
  async getTableList(@Req() req): Promise<any> {
    return await this.appService.findTable();
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/table/create')
  async createTable(@Req() req): Promise<any> {
    let params = req.body;
    const table = await this.appService.findTableOne({
      game: params.game, tableNum: params.tableNum
    });
    if (!!table) throw new HttpException({
      errCode: -1, message: "台面已存在"
    }, HttpStatus.OK);
    params.superPass = Encrypt.md5(params.superPass).toLocaleUpperCase();
    return await this.appService.createTable([{
      ...params, ...{
        initCash: 0, initChip:0, middleCash: 0, middleChip: 0,
        initTimeDate: new Date('1999-02-01 00:00:00'),
        overTimeDate: new Date('1999-01-01 00:00:00'),
        superPass: Encrypt.md5(params.superPass).toLocaleUpperCase()
      }
    }]);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/table/update')
  async updateTable(@Req() req): Promise<any> {
    const { id, data } = req.body;
    // if (!!data.superPass && data.superPass !== 6) throw new HttpException({
    //   errCode: -1, message: "超级密码只能是六位数字"
    // }, HttpStatus.OK);

    data.superPass = Encrypt.md5(data.superPass).toLocaleUpperCase();
    data.modifyTimeDate = new Date();
    return await this.appService.updateTable(data, {
      _id: new Types.ObjectId(id)
    });
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/table/delete')
  async deleteTable(@Req() req): Promise<any> {
    const { ids } = req.body;
    return await this.appService.deleteTable(ids);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/table/user/list')
  async getTableUserList(@Req() req): Promise<any> {
    return await this.appService.findTableUser();
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/table/user/create')
  async createTableUser(@Req() req): Promise<any> {
    const params = req.body;
    const user = await this.appService.findTableUserOne({
      account: params.account
    });
    if (!!user) throw new HttpException({
      errCode: -1, message: "该台面用户已存在"
    }, HttpStatus.OK);

    params.table = new Types.ObjectId(params.tableId);
    delete params.tableId;
    params.password = Encrypt.md5(params.password).toLocaleUpperCase()
    return await this.appService.createTableUser([params]);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/table/user/update')
  async updateTableUser(@Req() req): Promise<any> {
    const { id, password, realName, tableId } = req.body;
    const user = await this.appService.findTableUserOne({
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
    return await this.appService.updateTableUser({
      realName, table: new Types.ObjectId(tableId),
      modifyTimeDate: new Date()
    }, {
      _id: new Types.ObjectId(id)
    });
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/table/user/delete')
  async deleteTableUser(@Req() req): Promise<any> {
    const { ids } = req.body;
    return await this.appService.deleteTableUser(ids);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/table/settlement/list')
  async getTableSettlement(@Req() req): Promise<any> {
    let { offset, limit, where } = req.body;
    return await this.appService.findTableSettlementRecord(
      offset, limit, where
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/table/running/record')
  async getTableRunningRecord(@Req() req): Promise<any> {
    let { offset, limit, where } = req.body;
    return await this.appService.findTableRunRecord(offset, limit, where);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/guest/user/list')
  async getGuestUserList(@Req() req): Promise<any> {
    let { offset, limit, where } = req.body;
    return await this.appService.findGuestUser(offset, limit, where);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/guest/user/statistics')
  async getGuestUserStatistics(@Req() req): Promise<any> {
    let { where } = req.body;
    return await this.appService.findGuestUserStatistics(where);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/guest/user/create')
  async createGuestUser(@Req() req): Promise<any> {
    const { account, password, realName, phone, level, share, ratio, status, agent } = req.body;
    const user = await this.appService.findGuestUserOne({
      account, level
    });
    if (!!user) throw new HttpException({
      errCode: -1, message: '该账号已存在，请重新输入账号'
    }, HttpStatus.OK);

    let params: any = {
      account, realName,
      phone, level, status,
      password: Encrypt.md5(password).toLocaleUpperCase()
    }

    if (level === 1) params.share = share;
    else if (level === 2) params.ratio = ratio;

    if (agent) {
      if (level === game_agent_level) throw new HttpException({
        errCode: -1, message: "代理下级暂不支持添加下级代理"
      }, HttpStatus.OK);
      const agent_user = await this.appService.findGuestUserOne({
        _id: new Types.ObjectId(agent), level: game_agent_level
      });
      if (!agent_user) throw new HttpException({
        errCode: -1, message: '该代理账号不存在，请查证后重试'
      }, HttpStatus.OK);
      params.agent = new Types.ObjectId(agent);
    }
    await this.appService.createGuestUser([ params ]);
    return { message: 'ok' };
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/guest/user/update')
  async updateGuestUser(@Req() req): Promise<any> {
    const {
      id, password, realName, phone, level, share,
      ratio, description, status
    } = req.body;
    let params: any = { realName, phone, description, status };
    if (level === 1) params.share = share;
    else if (level === 2) params.ratio = ratio;
    if (!!password && password.length >= 6)
      params.password = Encrypt.md5(password).toLocaleUpperCase();

    return this.appService.updateGuestUser(params, {
      _id: new Types.ObjectId(id)
    });
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/guest/user/delete')
  async deleteGuestUser(@Req() req): Promise<any> {
    const { ids } = req.body;
    await this.appService.deleteGuestUser(ids);
    return { message: 'ok' }
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/guest/user/borrowing/out')
  async borrowingMoneyOut(@Req() req): Promise<any> {
    const { id, money, description } = req.body;
    const currency: any = await this.appService.findGuestCurrencyOne({
        user: new Types.ObjectId(id)
      });
    await this.appService.updateGuestCurrency({
      $inc: { borrowing: money }
    }, { user: new Types.ObjectId(id) });
    await this.appService.createGuestBorrowingRecord([{
      user: new Types.ObjectId(id),
      before: currency.borrowing,
      money: money,
      after: currency.borrowing + money,
      description: description || ''
    }])
    return { message: 'ok' };
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/guest/user/borrowing/into')
  async borrowingMoneyInto(@Req() req): Promise<any> {
    const { id, money, description } = req.body;
    const currency: any = await this.appService.findGuestCurrencyOne({
        user: new Types.ObjectId(id)
    });
    if (currency.borrowing <= 0) throw new HttpException({
      errCode: -1, message: '该会员并没有签单金额，不可以进行平单操作！'
    }, HttpStatus.OK);
    // 防止不存在更新
    await this.appService.updateGuestCurrency({
      $inc: { borrowing: -money }
    }, { user: new Types.ObjectId(id) });
    await this.appService.createGuestBorrowingRecord([{
      user: new Types.ObjectId(id),
      before: currency.borrowing,
      money: -money,
      after: currency.borrowing - money,
      description: description || ''
    }])
    return { message: 'ok' };
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/guest/user/chip/out')
  async chipOut(@Req() req): Promise<any> {
    const { id, money, description } = req.body;
    await this.appService.createGuestChipRecord([{
      user: new Types.ObjectId(id),
      type: GAME_CHIP_RECORD_TYPE.OUT,
      money: money,
      description: description || ''
    }])
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/guest/user/chip/into')
  async chipInto(@Req() req): Promise<any> {
    const { id, money, description } = req.body;
    const chipRecord = await this.appService.findGuestChipRecordOne({
      _id: new Types.ObjectId(id)
    });
    // if (chipRecord.outChip <= 0) throw new HttpException({
    //   errCode: 1000002, message: '该用户并没有购买筹码'
    // }, HttpStatus.OK);
    await this.appService.createGuestChipRecord([{
      user: new Types.ObjectId(id),
      type: GAME_CHIP_RECORD_TYPE.INTO,
      money: money,
      description: description || ''
    }])
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/guest/user/chip/save')
  async chipSave(@Req() req): Promise<any> {
    const { id, money, description } = req.body;
    const currency: any = await this.appService.findGuestCurrencyOne({
      user: new Types.ObjectId(id)
    });
    // 防止不存在更新
    await this.appService.updateGuestCurrency({
      $inc: { chip: money }
    }, { user: new Types.ObjectId(id) });
    await this.appService.createGuestChipRecord([{
      user: new Types.ObjectId(id),
      type: GAME_CHIP_RECORD_TYPE.SAVE,
      before: currency.chip,
      money: money,
      after: currency.chip + money,
      description: description || ''
    }])
    return { message: 'ok' };
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/guest/user/chip/take')
  async chipTake(@Req() req): Promise<any> {
    const { id, money, description } = req.body;
    const currency: any = await this.appService.findGuestCurrencyOne({
      user: new Types.ObjectId(id)
    });
    if (currency.chip <= 0) throw new HttpException({
      errCode: -1, message: '该会员存码不足！'
    }, HttpStatus.OK);
    // 防止不存在更新
    await this.appService.updateGuestCurrency({
      $inc: { chip: -money }
    }, { user: new Types.ObjectId(id) });
    await this.appService.createGuestChipRecord([{
      user: new Types.ObjectId(id),
      type: GAME_CHIP_RECORD_TYPE.TAKE,
      before: currency.chip,
      money: -money,
      after: currency.chip - money,
      description: description || ''
    }])
    return { message: 'ok' };
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/guest/user/betting/list')
  async getGuestUserBettingPage(@Req() req): Promise<any> {
    let { offset, limit, where } = req.body;
    return await this.appService.findGuestBettingRecord(
      offset, limit, where
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/guest/user/betting/create')
  async createGuestUserBetting(@Req() req): Promise<any> {
    const { uid, tid } = req.user;
    let { type, table, noRun, noActive, account, userBetData, description } = req.body;

    console.log("userBetData: ", userBetData);
    const tableInfo = await this.appService.findTableOne({
      _id: new Types.ObjectId(table)
    });
    if (!tableInfo) throw new HttpException({
      errCode: -1, message: '台面不存在，请查证后重试！'
    }, HttpStatus.OK);

    const user = await this.appService.findGuestUserOne({
      account: account, level: game_member_level
    });
    if (!user) throw new HttpException({
      errCode: -1, message: '用户不存在，请查证后重试！'
    }, HttpStatus.OK);

    if(tableInfo.game === 'bac' || tableInfo.game === 'lh') {
      for (let k in userBetData) {
        if (typeof userBetData[k] === 'string' && userBetData[k].length === 0)
          delete userBetData[k];
        else if (isNaN(parseInt(userBetData[k])))
          delete userBetData[k];
        else userBetData[k] = parseInt(userBetData[k]);
      }
    } else {
      for (let k in userBetData) {
        if (typeof userBetData[k] === 'string' && userBetData[k].length === 0)
          userBetData[k] = 0;
        else if (isNaN(parseInt(userBetData[k])))
          userBetData[k] = 0;
        else userBetData[k] = Math.abs(parseInt(userBetData[k]));
      }
      console.log("userBetData2: ", userBetData);
    }

    const tableRecord = await this.appService.findTableRunRecordOne({
      table: tableInfo._id, noRun, noActive
    });
    if (!tableRecord) throw new HttpException({
      errCode: -1, message: `${tableInfo.game === 'bac' ? '百家乐' : '龙虎斗'} ${tableInfo.tableNum} ${noRun}靴 ${noActive}铺未开牌`
    }, HttpStatus.OK);

    let billResult: any = null;
    if (CALCULATE_RESULT_GAME.indexOf(tableInfo.game) !== -1) {
      const settleResult = this.appService.calculateResult(
        tableRecord.result, userBetData, account === 'sk'
      );

      let washCode: number = settleResult.washCode;
      let washCodeCost: number = 0;
      if (account !== 'sk')
        washCodeCost = (washCode * user.ratio) / game_gold_multiple;

      await this.appService.updateGuestCurrency({
        $inc: { washCode, washCodeCost }
      }, { user: user._id });

      if (settleResult.userBetMoney > 0) billResult = {
        ...settleResult, ...{
          table: tableInfo._id,
          game: tableInfo.game,
          noRun, noActive,
          washCode, washCodeCost,
          type: isNaN(type) ? 0 : type,
          result: tableRecord.result,
          user: user._id, userBetData,
          description: description || "",
          createTimeDate: tableRecord.createTimeDate, modifyTimeDate: new Date()
        }}
    } else billResult = {
      table: tableInfo._id,
      game: tableInfo.game,
      noRun, noActive,
      washCode: 0, washCodeCost: 0,
      type: isNaN(type) ? 0 : type, result: {},
      user: user._id, userBetData: {},
      userBetMoney: 0, settlementData: {},
      settlementMoney: userBetData.win > 0 ? userBetData.win : 0 - userBetData.lose,
      description: description || "",
      createTimeDate: tableRecord.createTimeDate, modifyTimeDate: new Date()
    }
    billResult !== null &&
    await this.appService.createGuestBettingRecord([billResult]);
    return { message: 'ok' };
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/guest/user/betting/update')
  async updateGuestUserBetting(@Req() req): Promise<any> {
    let { id, type, result, account, userBetData, description } = req.body;

    const record = await this.appService.findGuestBettingRecordOne({
      _id: new Types.ObjectId(id)
    });
    if (!record) throw new HttpException({
      errCode: -1, message: `投注记录不存在`
    }, HttpStatus.OK);

    const user = await this.appService.findGuestUserOne({
      account, level: game_member_level
    });
    if (!user) throw new HttpException({
      errCode: -1, message: "该用户不存在，请查证后重试！"
    }, HttpStatus.OK);

    if(CALCULATE_RESULT_GAME.indexOf(record.game) !== -1) {
      for (let k in userBetData) {
        if (typeof userBetData[k] === 'string' && userBetData[k].length === 0)
          delete userBetData[k];
        else if (isNaN(parseInt(userBetData[k])))
          delete userBetData[k];
        else userBetData[k] = Math.abs(parseInt(userBetData[k]));
      }
    } else {
      for (let k in userBetData) {
        if (typeof userBetData[k] === 'string' && userBetData[k].length === 0)
          userBetData[k] = 0;
        else if (isNaN(parseInt(userBetData[k])))
          userBetData[k] = 0;
        else userBetData[k] = Math.abs(parseInt(userBetData[k]));
      }
    }

    let params: any = { description: description || "" };
    if (record.type !== type)
      params.type = type;
    if (record.user.account !== account)
      params.user = user._id;

    if (CALCULATE_RESULT_GAME.indexOf(record.game) !== -1) {
      let isUserBetDataChanged: boolean = false;
      for (let k in record.userBetData) {
        if (record.userBetData[k] !== userBetData[k]) {
          isUserBetDataChanged = true;
          break;
        }
      }
      if (!!params.user || !!isUserBetDataChanged) {
        params.userBetData = userBetData;
        const currency = await this.appService.findGuestCurrencyOne({ _id: user._id });
        currency.washCode -= record.washCode;
        currency.washCodeCost -= record.washCodeCost;

        const settleResult = this.appService.calculateResult(
          result || record.result, userBetData, account === 'sk'
        );

        let washCode: number = settleResult.washCode;
        let washCodeCost: number = 0;
        if (account !== 'sk')
          washCodeCost = (washCode * user.ratio) / game_gold_multiple;

        currency.washCode += washCode;
        currency.washCodeCost += washCodeCost;
        await this.appService.updateGuestCurrency({
          washCode: currency.washCode,
          washCodeCost: currency.washCodeCost,
        }, { user: user._id });

        params = {...params, ...settleResult, ...{washCode, washCodeCost}};
      }

      await this.appService.updateGuestBettingRecordOne(params, {
        _id: new Types.ObjectId(id)
      });

      if (!!result) {
        await this.appService.updateTableRunRecord({ result }, {
          table: record.table._id, noRun: record.noRun, noActive: record.noActive
        });
        await this.appService.updateGuestBettingRecordResult(
          record.table._id.toString(), record.noRun, record.noActive, result
        );
      }
    } else {
      if (userBetData.win !== 0 && userBetData.lose !== 0) throw new HttpException({
        errCode: -1, message: '输赢只能填写任意一项'
      }, HttpStatus.OK);
      params.settlementMoney = userBetData.win > 0 ? userBetData.win : 0 - userBetData.lose;
      await this.appService.updateGuestBettingRecordOne(params, {
        _id: new Types.ObjectId(id)
      });
    }

    return { message: 'ok' };
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/guest/user/betting/delete')
  async deleteGuestUserBetting(@Req() req): Promise<any> {
    let { ids } = req.body;
    await this.appService.deleteGuestBettingRecord(ids);
    return { message: 'ok' };
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/guest/user/settlement')
  async guestUserSettlement(@Req() req): Promise<any> {
    const { id, money, description } = req.body;
    if (isNaN(money)) throw new HttpException({
      errCode: -1, message: '无效的金额'
    }, HttpStatus.OK);
    const user = await this.appService.findGuestUserOne({
      _id: new Types.ObjectId(id), level: game_member_level
    });
    if (!user) throw new HttpException({
      errCode: -1, message: '该用户不存在,请稍后重试！'
    }, HttpStatus.OK);

    const currency = await this.appService.findGuestCurrencyOne({
      user: new Types.ObjectId(id)
    });
    if (currency.washCodeCost < money) throw new HttpException({
      errCode: -1, message: '洗码费余额不足'
    }, HttpStatus.OK);
    const settleCode = parseFloat((money / (user.ratio / game_ratio_multiple)).toFixed(2));
    currency.washCode -= settleCode;
    currency.washCodeCost -= money;
    await this.appService.updateGuestCurrency({
      washCode: currency.washCode,
      washCodeCost: currency.washCodeCost
    }, { user: user._id })
    return await this.appService.createGuestUserSettlement([{
      user: new Types.ObjectId(id),
      washCode: settleCode,
      washCodeCost: money,
      description: description || ''
    }]).then(rs => {
      return {
        settleCode: parseFloat(settleCode.toFixed(2)),
        settleCodeCost: parseFloat(money.toFixed(2)),
        notSettleCode: parseFloat(currency.washCode.toFixed(2)),
        notSettleCodeCost: parseFloat(currency.washCodeCost.toFixed(2)),
        settleTimeDate: rs[0].createTimeDate
      }
    })
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/guest/user/borrowing/list')
  async getBorrowingRecordList(@Req() req): Promise<any> {
    const { offset, limit, where } = req.body;
    return await this.appService.findGuestBorrowingRecord(offset, limit, where);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/guest/user/chip/list')
  async getChipRecordList(@Req() req): Promise<any> {
    const { offset, limit, where } = req.body;
    return await this.appService.findGuestChipRecord(
      offset, limit, where
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/guest/user/settlement/list')
  async getGuestUserSettlementRecordList(@Req() req): Promise<any> {
    let { offset, limit, where } = req.body;
    return this.appService.findGuestUserSettlementRecord(
      offset, limit, where
    );
  }

}
