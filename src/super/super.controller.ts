import { Controller, HttpException, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Types } from 'mongoose';
import { Encrypt } from '../utils/encrypt';
import { AppService } from '../app.service';
import { JwtService } from '@nestjs/jwt';
import {
  CALCULATE_RESULT_GAME,
  game_gold_multiple,
  game_member_level,
  game_ratio_multiple,
} from '../constant/game.constant';

@Controller('super')
export class SuperController {
  constructor(
    private readonly jwtService: JwtService,
    private readonly appService: AppService,
  ) { }

  /** @description 登录超级系统 */
  @Post('/login')
  private async login(@Req() req): Promise<any> {
    const { account, password } = req.body;
    const user = await this.appService.findTableUserOne({ account });
    if (!user) throw new HttpException({
      errCode: -1, message: '账号不存在，请重新输入！'
    }, HttpStatus.OK);
    const passMD5 = Encrypt.md5(password).toLocaleUpperCase();
    if (user.password !== passMD5) throw new HttpException({
      errCode: -1, message: '登录密码错误，请重新输入！'
    }, HttpStatus.OK);
    if (!user.table) throw new HttpException({
      errCode: -1, message: '账号未分配台面，请联系管理员！'
    }, HttpStatus.OK);
    return {
      access_token: this.jwtService.sign({
        uid: user._id.toString(),
        tid: user.table._id.toString(),
        scope: ['super'],
      }, {
        expiresIn: `${3600 * 6}s`
      }),
      refresh_token: this.jwtService.sign({
        uid: user._id.toString(),
      }, {
        expiresIn: `${3600 * 24 * 30}s`
      })
    }
  }

  /** @description 验证超级密码 */
  @UseGuards(AuthGuard('jwt'))
  @Post('/valid/super/pass')
  private async validSuperPass(@Req() req): Promise<any> {
    const { uid, tid } = req.user;
    const { pass } = req.body;
    const table = await this.appService.findTableOne({
      _id: new Types.ObjectId(tid)
    });
    let passMD5 = Encrypt.md5(pass).toLocaleUpperCase();
    if (table.superPass !== passMD5) throw new HttpException({
      errCode: -1, message: '管理员密码错误'
    }, HttpStatus.OK);
    return { message: 'ok' };
  }

  /** @description 获取基础信息 */
  @UseGuards(AuthGuard('jwt'))
  @Post('/base/info')
  private async getBaseInfo(@Req() req): Promise<any> {
    const { tid } = req.user;
    const table = await this.appService.findTableOne({
      _id: new Types.ObjectId(tid)
    });
    return {
      table, record: await this.appService.findTableRunRecord({
        table: table._id, noRun: table.noRun
      }).then(rs => rs.map(val => val.result))
    }
  }

  /** @description 获取设置信息 */
  @UseGuards(AuthGuard('jwt'))
  @Post('/setting/info')
  private async getSettingInfo(@Req() req): Promise<any> {
    const { tid } = req.user;
    const table = await this.appService.findTableOne({
      _id: new Types.ObjectId(tid)
    });
    console.log("time: ", [ table.initTimeDate, new Date() ])
    const statistics = await this.appService.findGuestBettingStatistics({
      tableNum: table.tableNum, scopeTimeDate: [ table.initTimeDate, new Date() ]
    });

    return {
      ...statistics,
      ...{
        initCash: table.initCash, initChip: table.initChip,
        middleCash: table.middleCash, middleChip: table.middleChip,
        initTimeDate: table.initTimeDate, overTimeDate: table.overTimeDate
      }
    }
  }

  /** @description 台面初始 */
  @UseGuards(AuthGuard('jwt'))
  @Post('/init')
  private async init(@Req() req): Promise<any> {
    const { tid } = req.user;
    const { cash, chip } = req.body;
    await this.appService.updateTable({
      initCash: parseInt(cash),
      initChip: parseInt(chip),
      initTimeDate: new Date()
    }, {
      _id: new Types.ObjectId(tid)
    })
    return { message: "ok" };
  }

  /** @description 台面结算 */
  @UseGuards(AuthGuard('jwt'))
  @Post('/settlement')
  private async settlement(@Req() req): Promise<any> {
    const { tid } = req.user;
    const table = await this.appService.findTableOne({
      _id: new Types.ObjectId(tid)
    });
    const statistics = await this.appService.findGuestBettingStatistics({
      tableNum: table.tableNum, scopeTimeDate: [ table.initTimeDate, new Date() ]
    });
    const overTimeDate = new Date();
    await this.appService.updateTable({
      initCash: 0, initChip: 0,
      middleCash: 0, middleChip: 0,
      overTimeDate
    }, { _id: new Types.ObjectId(tid) });
    await this.appService.createTableSettlementRecord([{
      table: new Types.ObjectId(tid),
      initCash: table.initCash,
      initChip: table.initChip,
      middleCash: table.middleCash,
      middleChip: table.middleChip,
      totalWin: statistics.totalWin,
      totalWinCash: statistics.totalWinCash,
      totalWinChip: statistics.totalWinChip,
      initTimeDate: table.initTimeDate, overTimeDate
    }]);
    return { message: 'ok' };
  }

  /** @description 创建新场次 */
  @UseGuards(AuthGuard('jwt'))
  @Post('/create/new/run')
  private async createRun(@Req() req): Promise<any> {
    const { uid, tid } = req.user;
    await this.appService.updateTable({ $inc: { noRun: 1 } }, {
      _id: new Types.ObjectId(tid)
    });
    return { message: 'ok' };
  }

  /** @description 检查客人是否存在 */
  @UseGuards(AuthGuard('jwt'))
  @Post('/check/guest/user/exists')
  private async checkGuestUserExists(@Req() req): Promise<any> {
    const { account } = req.body;
    const user = await this.appService.findGuestUserOne({ account, level: game_member_level });
    if (!user) throw new HttpException({
      errCode: -1, message: '会员不存在，请查证后重试！'
    }, HttpStatus.OK);
    return { uid: user._id.toString() }
  }

  /** @description 获取客人投注列表 */
  @UseGuards(AuthGuard('jwt'))
  @Post('/guest/user/betting/list')
  private async getGuestUserBettingList(@Req() req): Promise<any> {
    const { uid, tid } = req.user;
    const { where } = req.body;
    const table = await this.appService.findTableOne({
      _id: new Types.ObjectId(tid)
    });
    console.log("table: ", table);
    return await this.appService.findGuestBettingRecord(null, null, {
      ...where, ...{ game: table.game, tableNum: table.tableNum }
    });
  }

  /** @description 创建投注 */
  @UseGuards(AuthGuard('jwt'))
  @Post('/submit/result')
  private async submitResult(@Req() req): Promise<any> {
    const { uid, tid } = req.user;
    let { noActive, result, bills } = req.body;
    const table = await this.appService.findTableOne({
      _id: new Types.ObjectId(tid)
    });
    if (!table) throw new HttpException({
      errCode: -1, message: '该台面不存在，请查证后重试！'
    }, HttpStatus.OK);
    let billResult: any[] = [];
    if (CALCULATE_RESULT_GAME.indexOf(table.game) !== -1) {
      for (let i = 0; i < bills.length; ++i) {
        let val = bills[i];
        let userBetData: any = Object.assign({}, val);

        delete userBetData.uid;
        delete userBetData.type;
        delete userBetData.account;

        const user = await this.appService.findGuestUserOne({
          _id: new Types.ObjectId(val.uid), level: game_member_level
        });

        const settleResult = this.appService.calculateResult(
          result, userBetData, val.account === 'sk'
        );
        let washCode: number = 0;
        if (Math.abs(settleResult.settlementMoney) >= 100)
          washCode = Math.floor(Math.abs(settleResult.settlementMoney) / 100) * 100;
        let washCodeCost: number = (washCode * user.ratio) / game_gold_multiple;

        console.log("产生洗码量: ", washCode);
        console.log("产生洗码费: ", washCodeCost);
         if (settleResult.userBetMoney > 0) {
           billResult = [...billResult, {
             ...settleResult, ...{
               washCode, washCodeCost,
               game: table.game, noRun: table.noRun, noActive,
               table: new Types.ObjectId(tid),
               type: isNaN(val.type) ? 0 : val.type, result,
               user: new Types.ObjectId(val.uid), userBetData,
               createTimeDate: new Date(), modifyTimeDate: new Date()
             }}]
         }
      }
    } else {
      billResult = bills.map(val => {
        result = {};
        let userBetData = {};
        let settlementData = {};
        return {
          washCode: 0, washCodeCost: 0,
          game: table.game, noRun: table.noRun, noActive, table: new Types.ObjectId(tid),
          type: isNaN(val.type) ? 0 : val.type, result,
          user: new Types.ObjectId(val.uid), userBetData,
          userBetMoney: 0, validBetMoney: 0, settlementData,
          settlementMoney: val.win !== 0 ? val.win : 0 - val.lose,
          createTimeDate: new Date(), modifyTimeDate: new Date()
        }
      })
    }
    await this.appService.createTableRunRecord([{
      table: new Types.ObjectId(tid),
      noRun:table.noRun , noActive, result
    }]);
    billResult.length !== 0 &&
    await this.appService.createGuestBettingRecord(billResult);

    return { message: 'ok' };
  }

  /** @description 更新结果 */
  @UseGuards(AuthGuard('jwt'))
  @Post('/modify/result')
  private async modifyResult(@Req() req): Promise<any> {
    const { uid, tid } = req.user;
    const { noActive, result } = req.body;
    const table = await this.appService.findTableOne({
      _id: new Types.ObjectId(tid)
    });
    await this.appService.updateTableRunRecord({ result }, {
      noRun: table.noRun, noActive,
      table: new Types.ObjectId(tid)
    });
    await this.appService.updateGuestBettingRecordResult(
      tid, table.noRun, noActive, result
    );
    return { message: 'ok' };
  }

  /** @description 增加中间货币 */
  @UseGuards(AuthGuard('jwt'))
  @Post('/add/middle/currency')
  private async addMiddleCurrency(@Req() req): Promise<any> {
    const { tid } = req.user;
    const { cash, chip } = req.body;
    await this.appService.updateTable({ $inc: {
      middleCash: parseInt(cash), middleChip: parseInt(chip)
    }}, { _id: new Types.ObjectId(tid) });

    return { message: 'ok' };
  }
}
