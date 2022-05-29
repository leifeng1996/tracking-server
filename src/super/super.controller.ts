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
  game_ratio_multiple, TABLE_RUNNING_MODIFY_TYPE,
} from '../constant/game.constant';
import { SuperJwtAuthGuard } from '../guard/super.jwt.guard';

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
    const access_token: string = this.jwtService.sign({
      uid: user._id.toString(),
      tid: user.table._id.toString(),
      scope: ['super'],
    }, {
      expiresIn: `${3600 * 6}s`
    });
    const refresh_token: string = this.jwtService.sign({
      uid: user._id.toString(),
    }, {
      expiresIn: `${3600 * 24 * 30}s`
    });
    const existsToken = await this.appService.findSuperLoginTokenOne({
      user: user._id
    });
    if (existsToken) {
      await this.appService.updateSuperLoginToken({
        token: access_token
      }, {
        user: user._id
      });
    } else {
      await this.appService.createSuperLoginToken([{
        user: user._id, token: access_token
      }]);
    }

    return { access_token, refresh_token };
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
      errCode: -1, message: '超级密码错误'
    }, HttpStatus.OK);
    return { message: 'ok' };
  }

  /** @description 获取基础信息 */
  @UseGuards(SuperJwtAuthGuard)
  @Post('/base/info')
  private async getBaseInfo(@Req() req): Promise<any> {
    const { tid } = req.user;
    const table = await this.appService.findTableOne({
      _id: new Types.ObjectId(tid)
    });
    return {
      table, record: await this.appService.findTableRunRecord(null, null, {
        game: table.game, tableNum: table.tableNum,
        noRun: table.noRun
      }).then(rs => (rs.list || []).map(val => val.result))
    }
  }

  /** @description 获取设置信息 */
  @UseGuards(SuperJwtAuthGuard)
  @Post('/setting/info')
  private async getSettingInfo(@Req() req): Promise<any> {
    const { tid } = req.user;
    const table = await this.appService.findTableOne({
      _id: new Types.ObjectId(tid)
    });
    const statistics = await this.appService.findGuestBettingStatistics({
      game: table.game, tableNum: table.tableNum,
      scopeTimeDate: [ table.initTimeDate, new Date() ]
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
  @UseGuards(SuperJwtAuthGuard)
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
  @UseGuards(SuperJwtAuthGuard)
  @Post('/settlement')
  private async settlement(@Req() req): Promise<any> {
    const { tid } = req.user;
    const table = await this.appService.findTableOne({
      _id: new Types.ObjectId(tid)
    });
    const statistics = await this.appService.findGuestBettingStatistics({
      game: table.game, tableNum: table.tableNum,
      scopeTimeDate: [ table.initTimeDate, new Date() ]
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
  @UseGuards(SuperJwtAuthGuard)
  @Post('/create/new/run')
  private async createRun(@Req() req): Promise<any> {
    const { uid, tid } = req.user;
    await this.appService.updateTable({ $inc: { noRun: 1 } }, {
      _id: new Types.ObjectId(tid)
    });
    return { message: 'ok' };
  }

  /** @description 检查客人是否存在 */
  @UseGuards(SuperJwtAuthGuard)
  @Post('/check/guest/user/exists')
  private async checkGuestUserExists(@Req() req): Promise<any> {
    const { account } = req.body;
    const user = await this.appService.findGuestUserOne({
      account: { $regex: eval(`/^${account}$/i`) },
      level: game_member_level
    });
    if (!user) throw new HttpException({
      errCode: -1, message: '会员不存在，请查证后重试！'
    }, HttpStatus.OK);
    return { uid: user._id.toString(), account: user.account }
  }

  /** @description 获取客人投注列表 */
  @UseGuards(SuperJwtAuthGuard)
  @Post('/guest/user/betting/list')
  private async getGuestUserBettingList(@Req() req): Promise<any> {
    const { uid, tid } = req.user;
    const { where } = req.body;
    const table = await this.appService.findTableOne({
      _id: new Types.ObjectId(tid)
    });
    return await this.appService.findGuestBettingRecord(null, null, {
      ...where, ...{ game: table.game, tableNum: table.tableNum }
    });
  }

  /** @description 创建投注 */
  @UseGuards(SuperJwtAuthGuard)
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

    const record = await this.appService.findTableRunRecordOne({
      table: new Types.ObjectId(tid),
      noRun: table.noRun , noActive,
    });
    if (!!record) return {
      record: await this.appService.findTableRunRecord(null, null, {
        game: table.game, tableNum: table.tableNum,
        noRun: table.noRun
      }).then(rs => (rs.list || []).map(val => val.result)),
      message: "检查到重复提交.同步当靴记录"
    }

    let billResult: any[] = [];
    if (CALCULATE_RESULT_GAME.indexOf(table.game) !== -1) {
      for (let i = 0; i < bills.length; ++i) {
        let val = bills[i];
        let userBetData: any = Object.assign({}, val);

        delete userBetData.uid;
        delete userBetData.type;
        delete userBetData.account;
        delete userBetData.description;

        const user = await this.appService.findGuestUserOne({
          _id: new Types.ObjectId(val.uid), level: game_member_level
        });

        const settleResult = this.appService.calculateResult(
          result, userBetData, val.account === 'sk'
        );
        let washCode: number = settleResult.washCode;
        let washCodeCost: number = 0;
        if (val.account !== 'sk')
          washCodeCost = (washCode * user.ratio) / game_gold_multiple;

        console.log("产生洗码量: ", washCode);
        console.log("产生洗码费: ", washCodeCost);

        await this.appService.updateGuestCurrency({
          $inc: { washCode, washCodeCost }
        }, { user: user._id });

         if (settleResult.userBetMoney > 0) {
           billResult = [...billResult, {
             ...settleResult, ...{
               washCode, washCodeCost,
               game: table.game, noRun: table.noRun, noActive,
               table: new Types.ObjectId(tid),
               type: isNaN(val.type) ? 0 : val.type, result,
               user: new Types.ObjectId(val.uid), userBetData,
               description: val.description || "",
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
          description: val.description || "",
          createTimeDate: new Date(), modifyTimeDate: new Date()
        }
      })
    }

    await this.appService.createTableRunRecordOne({
      table: new Types.ObjectId(tid),
      noRun:table.noRun , noActive, result,
      createTimeDate: new Date(), modifyTimeDate: new Date()
    });
    billResult.length !== 0 &&
    await this.appService.createGuestBettingRecord(billResult);

    return { message: 'ok' };
  }

  /** @description 更新结果 */
  @UseGuards(SuperJwtAuthGuard)
  @Post('/modify/result')
  private async modifyResult(@Req() req): Promise<any> {
    const { uid, tid } = req.user;
    const { noActive, result } = req.body;
    const table = await this.appService.findTableOne({
      _id: new Types.ObjectId(tid)
    });
    if (!table) throw new HttpException({
      errCode: -1, message: "该台面不存在"
    }, HttpStatus.OK);

    const record = await this.appService.findTableRunRecordOne({
      noRun: table.noRun, noActive,
      table: new Types.ObjectId(tid)
    });
    if (!record) throw new HttpException({
      errCode: -1, message: "该记录不存在"
    }, HttpStatus.OK);

    await this.appService.updateTableRunRecord({ result }, {
      noRun: table.noRun, noActive,
      table: new Types.ObjectId(tid)
    });
    await this.appService.updateGuestBettingRecordResult(
      tid, table.noRun, noActive, result
    );
    let modifyParams: any = {
      table: record.table, noRun: record.noRun,
      type: TABLE_RUNNING_MODIFY_TYPE.ADMIN_UPT,
      oldResult: record.result,
      oldNoActive: record.noActive
    };
    modifyParams.newResult = result;
    await this.appService.createTableRunModifyRecord([ modifyParams ]);

    return { message: 'ok' };
  }

  /** @description 增加中间货币 */
  @UseGuards(SuperJwtAuthGuard)
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
