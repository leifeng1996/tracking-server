import { Controller, Get, HttpException, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TableService } from './table.service';
import { UserService } from '../user/user.service';
import { Types } from 'mongoose';
import { Encrypt } from '../../utils/encrypt';
import { CALCULATE_RESULT_GAME, game_gold_multiple } from '../../constant/game.constant';

@Controller('table')
export class TableController {
  constructor(
    private readonly userService: UserService,
    private readonly tableService: TableService
  ) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('init')
  async init(@Req() req): Promise<any> {
    const { uid, tid } = req.user;
    const table = await this.tableService
      .findTableOne({
        _id: new Types.ObjectId(tid)
      });
    const record = await this.tableService
      .findTableRecordResult(tid, table.noRun)
    delete table.createTimeDate;
    delete table.modifyTimeDate;
    return { table, record }
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('new/run')
  async newRun(@Req() req): Promise<any> {
    const { tid } = req.user;
    await this.tableService.updateTable({
      $inc: { noRun: 1 }
    }, { _id: new Types.ObjectId(tid)}).then(rs => {
      return {}
    });
    return { message: 'ok' };
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('submit/result')
  async submitResult(@Req() req): Promise<any> {
    const { uid, tid } = req.user;
    let { game, noRun, noActive, result, bills } = req.body;
    let billResult: any[];
    if (CALCULATE_RESULT_GAME.indexOf(game) !== -1) {
      billResult = bills.map(val => {
        let userBetData: any = Object.assign({}, val);
        delete userBetData.uid;
        delete userBetData.type;
        delete userBetData.account;

        return {
          ...this.tableService.calculateResult(
            result, userBetData, val.account === 'sk'
          ), ...{
            game, noRun, noActive, table: new Types.ObjectId(tid),
            type: isNaN(val.type) ? 0 : val.type, result,
            user: new Types.ObjectId(val.uid), userBetData,
            createTimeDate: new Date(), modifyTimeDate: new Date()
          }};
      }).filter(val => val.userBetMoney > 0);
    } else {
      billResult = bills.map(val => {
        result = {};
        let userBetData = {};
        let settlementData = {};
        return {
          game, noRun, noActive, table: new Types.ObjectId(tid),
          type: isNaN(val.type) ? 0 : val.type, result,
          user: new Types.ObjectId(val.uid), userBetData,
          userBetMoney: 0, validBetMoney: 0, settlementData,
          settlementMoney: val.win !== 0 ? val.win : 0 - val.lose,
          createTimeDate: new Date(), modifyTimeDate: new Date()
        }
      })
    }
    await this.tableService.createTableRecord([{
      table: new Types.ObjectId(tid),
      noRun, noActive, result
    }]);

    billResult.length !== 0 &&
    await this.tableService.createTableBetting(billResult);

    return { message: 'ok' };
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('modify/result')
  async modifyResult(@Req() req): Promise<any> {
    const { uid, tid } = req.user;
    const { noActive, result } = req.body;
    const table = await this.tableService.findTableOne({
      _id: new Types.ObjectId(tid)
    });
    await this.tableService.updateTableRecord({ result }, {
      table: new Types.ObjectId(tid), noRun: table.noRun, noActive: noActive + 1,
      modifyTimeDate: new Date()
    });
    await this.tableService.resetTableBetting(
      new Types.ObjectId(tid), table.noRun, noActive + 1, result
    );
    return { message: 'ok' };
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('check/user/exists')
  async checkIsUserExists(@Req() req): Promise<any> {
    const { account } = req.body;
    return await this.userService.findTableGuestOne({
      account
    }).then(user => {
      if (!user) throw new HttpException({
        errCode: 10001,
        message: "该用户不存在"
      }, HttpStatus.OK);
      return { uid: user._id.toString() };
    })
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('bet/record')
  async findUserBetRecord(@Req() req): Promise<any> {
    const { uid, tid } = req.user;
    const { account, noRun, startNoActive, endNoActive, status, startTime, endTime } = req.body;

    let where: any = { };
    where.$and = [{ table: new Types.ObjectId(tid) }];
    if (!!account) {
      const user = await this.userService.findTableGuestOne({
        account
      });
      if (!user) where.user = new Types.ObjectId();
      else where.user = user._id;
    }
    where.$and = [...where.$and, {
      createTimeDate: {
        $gte: new Date(`${startTime}:00`),
        $lte: new Date(`${endTime}:00`)
      }
    }];
    if (noRun) where.$and = [...where.$and, { noRun }];
    if (!!startNoActive && !!endNoActive) {
      where.$and = [...where.$and, {
        noActive: {
          $gte: startNoActive,
          $lte: endNoActive
        }
      }];
    } else if (!!startNoActive && !endNoActive) {
      where.$and = [...where.$and, { noActive: startNoActive }];
    }
    return await this.tableService.findTableBetting(where);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('setting/info')
  async findTableSettingInfo(@Req() req): Promise<any> {
    const { tid } = req.user;
    const table = await this.tableService.findTableOne({
      _id: new Types.ObjectId(tid)
    });
    const totalWin = await this.tableService.findTableGuestTotalWin(
      tid, table.openTimeDate
    );
    console.log("totalWin: ", totalWin);
    return {
      openCash: table.openCash, openChip: table.openChip,
      middleCash: table.middleCash, middleChip: table.middleChip,
      totalWinCash: totalWin.cash, totalWinChip: totalWin.chip,
      openTimeDate: table.openTimeDate, overTimeDate: table.overTimeDate
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('open')
  async openTableSettingMoney(@Req() req): Promise<any> {
    const { tid } = req.user;
    const { cash, chip } = req.body;
    await this.tableService.updateTable({
      openCash: parseInt(cash),
      openChip: parseInt(chip),
      openTimeDate: new Date()
    }, {
      _id: new Types.ObjectId(tid)
    })
    return { message: "ok" };
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('settlement')
  async settlementTable(@Req() req): Promise<any> {
    const { tid } = req.user;
    const table = await this.tableService.findTableOne({
      _id: new Types.ObjectId(tid)
    });
    const totalWin = await this.tableService.findTableGuestTotalWin(
      tid, table.openTimeDate
    );
    console.log("totalWin: ", totalWin);
    const overTimeDate = new Date();
    await this.tableService.createTableSettlement([{
      table: new Types.ObjectId(tid),
      openCash: table.openCash,
      openChip: table.openChip,
      middleCash: table.middleCash,
      middleChip: table.middleChip,
      totalWinCash: totalWin.cash,
      totalWinChip: totalWin.chip,
      openTimeDate: table.openTimeDate, overTimeDate
    }]);
    await this.tableService.updateTable({
      openCash: 0, openChip: 0, middleCash: 0, middleChip: 0, overTimeDate
    }, {
      _id: new Types.ObjectId(tid)
    });
    return { message: 'ok' };
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('add/middle/currency')
  async addTableMiddleCurrency(@Req() req): Promise<any> {
    const { tid } = req.user;
    const { cash, chip } = req.body;
    await this.tableService.updateTable({
      $inc: { middleCash: parseInt(cash), middleChip: parseInt(chip) }
    }, {
      _id: new Types.ObjectId(tid)
    })
    return { message: 'ok' }
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('valid/super/pass')
  async validSuperPass(@Req() req): Promise<any> {
    const { uid, tid } = req.user;
    const { superPass } = req.body;
    const table = await this.tableService.findTableOne({
      _id: new Types.ObjectId(tid)
    });
    if (table.superPass !== Encrypt.md5(superPass).toLocaleUpperCase())
      throw new HttpException({
        errCode: 4000001, message: '超级密码错误'
      }, HttpStatus.OK);
    return { message: 'ok' };
  }
}
