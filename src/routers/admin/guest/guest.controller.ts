import { Controller, HttpException, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
import { AdminService } from '../admin.service';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from '../../user/user.service';
import { Types } from 'mongoose';
import { TableService } from '../../table/table.service';
import { CALCULATE_RESULT_GAME, GAME_CHIP_RECORD_TYPE, game_ratio_multiple } from '../../../constant/game.constant';
import { Encrypt } from '../../../utils/encrypt';

@Controller('guest')
export class GuestController {
  constructor(
    private userService: UserService,
    private tableService: TableService,
    private adminService: AdminService,
  ) {
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/user/list/plus')
  async getUserListV1(@Req() req): Promise<any> {
    let { offset, limit, where } = req.body;
    return await this.adminService.findGuestUserPlus(offset, limit, where);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('user/create')
  async createGuestUser(@Req() req): Promise<any> {
    const { account, password, realName, phone, level, share, ratio, status, agent } = req.body;
    const user = await this.userService.findTableGuestOne({
      account
    });
    console.log("user: ", user);
    if (!!user) throw new HttpException({
      errCode: 10001, mssage: '该账号已存在，请重新输入账号'
    }, HttpStatus.OK);
    let params: any = {
      account, realName,
      phone, level, status,
      password: Encrypt.md5(password).toLocaleUpperCase()
    }
    if (level === 1) params.share = share;
    else if (level === 2) params.ratio = ratio;

    if (agent) {
      const agent_user = await this.userService.findTableGuestOne({
        _id: new Types.ObjectId(agent)
      });
      if (!agent_user) throw new HttpException({
        errCode: 10002, message: '该代理账号不存在，请查证后重试'
      }, HttpStatus.OK);
      params.agent = new Types.ObjectId(agent);
    }

    await this.adminService.createGuestUser([ params ]);
    return { message: 'ok' };
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/user/update')
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

    return this.adminService.updateGuestUser(params, {
      _id: new Types.ObjectId(id)
    });
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/user/delete')
  async deleteGuestUser(@Req() req): Promise<any> {
    const { ids } = req.body;
    await this.adminService.deleteGuestUser(ids);
    return { message: 'ok' }
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('borrowing')
  async borrowing(@Req() req): Promise<any> {
    const { offset, limit, where } = req.body;
    return await this.adminService.findTableGuestBorrowing(offset, limit, where);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('chip/record')
  async getChipRecord(@Req() req): Promise<any> {
    const { offset, limit, where } = req.body;
    return await this.adminService.findTableGuestChipRecord(offset, limit, where);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('user/borrowing/out')
  async borrowingMoneyOut(@Req() req): Promise<any> {
    const { id, money } = req.body;
    const currency: any = await this.adminService
      .findTableGuestCurrencyOne(id);
    // 防止不存在更新
    await this.adminService.updateTableGuestCurrency({
      $inc: { borrowing: money }
    }, { user: new Types.ObjectId(id) });
    await this.adminService.createTableGuestBorrowing([{
      user: new Types.ObjectId(id),
      before: currency.borrowing,
      money: money,
      after: currency.borrowing + money
    }])
    return { message: 'ok' };
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('user/borrowing/into')
  async borrowingMoneyInto(@Req() req): Promise<any> {
    const { id, money } = req.body;
    const currency: any = await this.adminService
      .findTableGuestCurrencyOne(id);
    if (currency.borrowing <= 0) throw new HttpException({
      errCode: -1, message: '该会员并没有签单金额，不可以进行平单操作！'
    }, HttpStatus.OK);
    // 防止不存在更新
    await this.adminService.updateTableGuestCurrency({
      $inc: { borrowing: -money }
    }, { user: new Types.ObjectId(id) });
    await this.adminService.createTableGuestBorrowing([{
      user: new Types.ObjectId(id),
      before: currency.borrowing,
      money: -money,
      after: currency.borrowing - money
    }])
    return { message: 'ok' };
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('user/chip/out')
  async chipOut(@Req() req): Promise<any> {
    const { id, money } = req.body;
    await this.adminService.createTableGuestChipRecord([{
      user: new Types.ObjectId(id),
      type: GAME_CHIP_RECORD_TYPE.OUT,
      money: money,
    }])
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('user/chip/into')
  async chipInto(@Req() req): Promise<any> {
    const { id, money } = req.body;
    const outMoney = await this.adminService.findChipOutMoney(id);
    if (outMoney <= 0) throw new HttpException({
      errCode: 1000002, message: '该用户并没有购买筹码'
    }, HttpStatus.OK);
    await this.adminService.createTableGuestChipRecord([{
      user: new Types.ObjectId(id),
      type: GAME_CHIP_RECORD_TYPE.INTO,
      money: money,
    }])
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('user/chip/save')
  async chipSave(@Req() req): Promise<any> {
    const { id, money } = req.body;
    const currency: any = await this.adminService
      .findTableGuestCurrencyOne(id);
    // 防止不存在更新
    await this.adminService.updateTableGuestCurrency({
      $inc: { chip: money }
    }, { user: new Types.ObjectId(id) });
    await this.adminService.createTableGuestChipRecord([{
      user: new Types.ObjectId(id),
      type: GAME_CHIP_RECORD_TYPE.SAVE,
      before: currency.chip,
      money: money,
      after: currency.chip + money
    }])
    return { message: 'ok' };
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('user/chip/take')
  async chipTake(@Req() req): Promise<any> {
    const { id, money } = req.body;
    console.log("req.body: ", req.body);
    const currency: any = await this.adminService
      .findTableGuestCurrencyOne(id);
    console.log("currency: ", await this.adminService
      .findTableGuestCurrencyOne(id));
    if (currency.chip <= 0) throw new HttpException({
      errCode: -1, message: '该会员没有存入筹码！'
    }, HttpStatus.OK);
    // 防止不存在更新
    await this.adminService.updateTableGuestCurrency({
      $inc: { chip: -money }
    }, { user: new Types.ObjectId(id) });
    await this.adminService.createTableGuestChipRecord([{
      user: new Types.ObjectId(id),
      type: GAME_CHIP_RECORD_TYPE.TAKE,
      before: currency.chip,
      money: -money,
      after: currency.chip - money
    }])
    return { message: 'ok' };
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('user/betting')
  async getGuestUserBetting(@Req() req): Promise<any> {
    let { offset, limit, where } = req.body;
    return await this.adminService.findGuestBettingPage(
      offset, limit, where
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('user/betting/create')
  async createGuestUserBetting(@Req() req): Promise<any> {
    const { uid, tid } = req.user;
    let {
      type, table, noRun, noActive,
      account, userBetData
    } = req.body;
    for (let k in userBetData) {
     if (typeof userBetData[k] === 'string' && userBetData[k].length === 0)
        delete userBetData[k];
      else if (isNaN(parseInt(userBetData[k])))
        delete userBetData[k];
      else userBetData[k] = parseInt(userBetData[k]);
    }
    const tableInfo = await this.tableService.findTableOne({
      _id: new Types.ObjectId(table)
    });
    if (!tableInfo) throw new HttpException({
      errCode: -1, message: '台面不存在，请查证后重试！'
    }, HttpStatus.OK);
    const userInfo = await this.adminService.findGuestUserOne({
      account: account
    });
    if (!userInfo) throw new HttpException({
      errCode: -1, message: '用户不存在，请查证后重试！'
    }, HttpStatus.OK);
    console.log("userInfo: ", userInfo);
    const tableRecord = await this.tableService.findTableRecordOne({
      table: tableInfo._id, noRun, noActive
    });
    if (!tableRecord) throw new HttpException({
        errCode: -1, message: `${tableInfo.game === 'bac' ? '百家乐' : '龙虎斗'} ${tableInfo.tableNum} ${noRun}靴 ${noActive}铺未开牌`
      }, HttpStatus.OK);
    let billResult: any;
    if (CALCULATE_RESULT_GAME.indexOf(tableInfo.game) !== -1) {
      billResult = {
        ...this.tableService.calculateResult(
          tableRecord.result, userBetData, account === 'sk'
        ),
        ... {
          game: tableInfo.game, noRun, noActive, table: tableInfo._id,
          type: isNaN(type) ? 0 : type, result: tableRecord.result,
          user: userInfo._id, userBetData
        }
      };
    } else {
      let result = {};
      let userBetData: any = {};
      let settlementData: any = {};
      billResult = {
        game: tableInfo.game, noRun, noActive, table: new Types.ObjectId(tid),
        type: isNaN(type) ? 0 : type, result,
        user: userInfo._id, userBetData,
        userBetMoney: 0, validBetMoney: 0, settlementData,
        settlementMoney: userBetData.win !== 0 ? userBetData.win : 0 - userBetData.lose,
        createTimeDate: new Date(), modifyTimeDate: new Date()
      }
    }
    if (billResult.userBetMoney <= 0) throw new HttpException({
      errCode: -1, message: '该投注记录金额不能为0'
    }, HttpStatus.OK);
    console.log("billResult: ", billResult);
    await this.tableService.createTableBetting([billResult]);

    return { message: 'ok' };
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('user/betting/update')
  async updateGuestUserBetting(@Req() req): Promise<any> {
    let { id, type, result, account, userBetData } = req.body;
    for (let k in userBetData) {
      if (typeof userBetData[k] === 'string' && userBetData[k].length === 0)
        delete userBetData[k];
      else if (isNaN(parseInt(userBetData[k])))
        delete userBetData[k];
      else userBetData[k] = parseInt(userBetData[k]);
    }

    const record = await this.adminService.findGuestBettingOne({
      _id: new Types.ObjectId(id)
    });
    if (!record) throw new HttpException({
      errCode: 10000, message: '记录不存在'
    }, HttpStatus.OK);

    let params: any = {};
    if (record.type !== type)
      params.type = type;
    if (record.account !== account)
      params.account = account;

    if (CALCULATE_RESULT_GAME.indexOf(record.game) !== -1) {
      let isUserBetDataChanged: boolean = false;
      for (let k in record.userBetData) {
        if (record.userBetData[k] !== userBetData[k]) {
          isUserBetDataChanged = true;
          break;
        }
      }

      if (!!isUserBetDataChanged)
        params.userBetData = userBetData;

      params = {...params, ...this.tableService.calculateResult(
          result || record, userBetData, account === 'sk'
        )};

      await this.tableService.updateTableBettingOne(params, {
        _id: new Types.ObjectId(id)
      });

      if (!!result) {
        await this.tableService.updateTableRecord({ result }, {
          table: record.table._id, noRun: record.noRun, noActive: record.noActive
        });
        await this.tableService.resetTableBetting(
          record.table._id.toString(), record.noRun, record.noActive, result
        );
      }
    } else {
      if (userBetData.win !== 0 && userBetData.lose !== 0) throw new HttpException({
        errCode: -1, message: '输赢只能填写任意一项'
      }, HttpStatus.OK);
      params.settlementMoney = userBetData.win > 0 ? userBetData.win : -userBetData.lose;
      await this.tableService.updateTableBettingOne(params, {
        _id: new Types.ObjectId(id)
      });
    }

    return { message: 'ok' };
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/user/settlement')
  async guestUserSettlement(@Req() req): Promise<any> {
    const { id, money, description } = req.body;
    const washCodeInfo = await this.adminService.findGuestUserSettlementById(id);
    const settlementCode = parseFloat(((money / washCodeInfo.ratio) * game_ratio_multiple).toFixed(2));
    if (washCodeInfo.allWashCode - washCodeInfo.settleWashCode <= settlementCode)
      throw new HttpException({
        errCode: -1, message: '洗码费余额不足'
      }, HttpStatus.OK);
    await this.adminService.createGuestUserSettlement([{
      user: new Types.ObjectId(id),
      washCode: settlementCode,
      washCodeCost: parseFloat(((settlementCode * washCodeInfo.ratio) / game_ratio_multiple).toFixed(2)),
      description
    }])
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/user/settlement/list')
  async getGuestUserSettlement(@Req() req): Promise<any> {
    let { offset, limit, where } = req.body;
    return this.adminService.findGuestUserSettlementPage(
      offset, limit, where
    );
  }
}
