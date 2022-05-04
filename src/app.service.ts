import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { TableDocument } from './schemas/table.schema';
import { TableUserDocument } from './schemas/table_user.schema';
import { TableGuestDocument } from './schemas/table_guest.schema';
import { TableRecordDocument } from './schemas/table_record';
import { TableGuestBettingDocument } from './schemas/table_guest_betting.schema';
import { TableSettlementDocument } from './schemas/table_settlement.schema';
import {
  CALCULATE_RESULT_GAME,
  game_area_multiple,
  game_area_multiple_sk, GAME_CHIP_RECORD_TYPE,
  game_gold_multiple, GAME_MONEY_TYPE, GAME_NAME,
  game_ratio_multiple,
} from './constant/game.constant';
import { AdminUserDocument } from './schemas/admin_user.schema';
import { AdminMenuDocument } from './schemas/admin_menu.schema';
import { AdminRoleDocument } from './schemas/admin_role.schema';
import { AdminPermissionDocument } from './schemas/admin_permission.schema';
import { AdminRoleMenuDocument } from './schemas/admin_role_menu';
import { AdminRolePermissionDocument } from './schemas/admin_role_permission';
import { AdminUserRoleDocument } from './schemas/admin_user_role';
import { TableGuestCurrencyDocument } from './schemas/table_guest_currency.schema';
import { TableGuestBorrowingDocument } from './schemas/table_guest_borrowing.schema';
import { TableGuestChipRecordDocument } from './schemas/table_guest_chip.schema';
import { TableGuestSettlementDocument } from './schemas/table_guest_settlement.schema';

@Injectable()
export class AppService {
  constructor(
    @InjectModel('Table') private tableModel: Model<TableDocument>,
    @InjectModel('TableUser') private tableUserModel: Model<TableUserDocument>,
    @InjectModel('TableRecord') private tableRunRecordModel: Model<TableRecordDocument>,
    @InjectModel('TableSettlement') private tableSettlementRecordModel: Model<TableSettlementDocument>,

    @InjectModel('TableGuest') private tableGuestModel: Model<TableGuestDocument>,
    @InjectModel('TableGuestBetting') private bettingRecordModel: Model<TableGuestBettingDocument>,
    @InjectModel('TableGuestCurrency') private tableGuestCurrencyModel: Model<TableGuestCurrencyDocument>,
    @InjectModel('TableGuestBorrowing') private tableGuestBorrowingModel: Model<TableGuestBorrowingDocument>,
    @InjectModel('TableGuestChipRecord') private tableGuestChipRecordModel: Model<TableGuestChipRecordDocument>,
    @InjectModel('TableGuestSettlement') private tableGuestSettlementModel: Model<TableGuestSettlementDocument>,

    @InjectModel('AdminUser') private adminUserModel: Model<AdminUserDocument>,
    @InjectModel('AdminMenu') private adminMenuModel: Model<AdminMenuDocument>,
    @InjectModel('AdminRole') private adminRoleModel: Model<AdminRoleDocument>,
    @InjectModel('AdminRoleMenu') private adminRoleMenuModel: Model<AdminRoleMenuDocument>,
    @InjectModel('AdminUserRole') private adminUserRoleModel: Model<AdminUserRoleDocument>,
    @InjectModel('AdminPermission') private adminPermissionModel: Model<AdminPermissionDocument>,
    @InjectModel('AdminRolePermission') private adminRolePermissionModel: Model<AdminRolePermissionDocument>,
  ) { }

  async findTable(where?: any): Promise<any> {
    return await this.tableModel
      .find(where || {})
      .exec();
  }
  async findTableOne(where: any): Promise<any> {
    return await this.tableModel
      .findOne(where)
      .exec();
  }
  async createTable(arr: any[]): Promise<any> {
    return await this.tableModel.create(arr.map(val => {
      val.createTimeDate = new Date();
      val.modifyTimeDate = new Date();
      return val;
    }));
  }
  async updateTable(params: any, where?: any): Promise<any> {
    params.modifyTimeDate = new Date();
    return await this.tableModel
      .updateMany(params)
      .where(where || {})
      .exec();
  }
  async deleteTable(ids: string[]): Promise<any> {
    return await this.tableModel
      .deleteMany({
        _id: { $in: ids.map(val => new Types.ObjectId(val) ) }
      })
      .exec();
  }

  async findTableUser(): Promise<any> {
    return await this.tableUserModel.find()
      .populate('table')
      .exec();
  }
  async findTableUserOne(where: any): Promise<any> {
    return await this.tableUserModel
      .findOne(where)
      .populate('table')
      .exec();
  }
  async createTableUser(arr: any[]): Promise<any> {
    return await this.tableUserModel.create(arr.map(val => {
      val.createTimeDate = new Date();
      val.modifyTimeDate = new Date();
      return val;
    }));
  }
  async updateTableUser(params, where?: any): Promise<any> {
    params.modifyTimeDate = new Date();
    return await this.tableUserModel
      .updateOne(params)
      .where(where || {})
      .exec();
  }
  async deleteTableUser(ids): Promise<any> {
    return await this.tableUserModel.deleteMany({
      _id: { $in: ids.map(id => new Types.ObjectId(id)) }
    }).exec();
  }

  async findTableRunRecord(where?: any): Promise<any> {
    return await this.tableRunRecordModel
      .find(where || {})
      .exec();
  }
  async findTableRunRecordOne(where: any): Promise<any> {
    return await this.tableRunRecordModel
      .findOne(where)
      .exec();
  }
  async createTableRunRecord(arr: any[]): Promise<any> {
    return await this.tableRunRecordModel.create(arr.map(val => {
      val.createTimeDate = new Date();
      val.modifyTimeDate = new Date();
      return val;
    }))
  }
  async updateTableRunRecord(params: any, where?: any): Promise<any> {
    params.modifyTimeDate = new Date();
    return await this.tableRunRecordModel
      .updateMany(params)
      .where(where || {})
      .exec();
  }

  /** @description 需要优化 */
  async findTableSettlementRecord(offset: number, limit: number, where?: any): Promise<any> {
    let match: any = {};
    if (!!where && !!where.game) {
      if (!!match.$and)
        match.$and = [...match.$and, { 'table.game': where.game }]
      else match.$and = [{ 'table.game': where.game }];
    }
    if (!!where && !isNaN(where.tableNum)) {
      if (!!match.$and)
        match.$and = [...match.$and, { 'table.tableNum': where.tableNum }]
      else match.$and = [{ 'table.tableNum': where.tableNum }];
    }
    if (!!where && !!where.scopeTimeDate) {
      if (!!match.$and)
        match.$and = [...match.$and, { overTimeDate: {
            $gte: new Date(where.scopeTimeDate[0]),
            $lte: new Date(where.scopeTimeDate[1])
          }}]
      else match.$and = [{ overTimeDate: {
          $gte: new Date(where.scopeTimeDate[0]),
          $lte: new Date(where.scopeTimeDate[1])
        }}];
    }
    let pipeline: any[] = [
      {
        $lookup: {
          from: 'table',
          localField: 'table',
          foreignField: '_id',
          pipeline: [
            { $project: { _id: 0, game: 1, tableNum: 1 }}
          ],
          as: 'table'
        }
      },
      { $match: match },
      { $sort: { _id: -1 } }
    ];
    if (!!offset) pipeline = [...pipeline, { $skip: offset }]
    if (!!limit) pipeline = [...pipeline, { $limit: limit }]
    return this.tableSettlementRecordModel.aggregate(pipeline).exec().then(async rs => {
      let statistical = { totalWin: 0 };
      for (let k in GAME_NAME) statistical[`${k}TotalWin`] = 0;
      for (let i = 0; i < rs.length; ++i) {
        let value: number = rs[i].totalWinChip + rs[i].totalWinCash;
        statistical.totalWin += value;
        statistical[`${rs[i].table[0].game}TotalWin`] += value;
      }
      return {
        statistical,
        list: rs.map(val => {
          val.table = val.table[0];
          return val;
        }),
        total: await this.tableSettlementRecordModel.count(match),

      }
    });
  }
  async createTableSettlementRecord(arr: any[]): Promise<any> {
    return await this.tableSettlementRecordModel.create(arr.map(val => {
      val.createTimeDate = new Date();
      val.modifyTimeDate = new Date();
      return val;
    }))
  }

  async findGuestUser(offset: number, limit: number, where?: any): Promise<any> {
    let match: any = {};
    let pipelineMatch: any = {};
    if (!!where && !!where.account) {
      const user = await this.tableGuestModel.findOne({
        account: where.account
      });
      if (!user) return { list: [], total: 0, statistical: {} };
      match = {
        $and: [
          { $or: [{ account: where.account }, { agent: user._id }] }
        ]
      }
    }

    if (!!where && !isNaN(where.level)) {
      if (!!match.$and)
        match.$and = [...match.$and, { level: where.level }]
      else match.$and = [{ level: where.level }];
    }
    if (!!where && !isNaN(where.status)) {
      if (!!match.$and)
        match.$and = [...match.$and, { status: where.status }]
      else match.$and = [{ status: where.status }];
    }
    if (!!where && !!where.scopeTimeDate) {
      pipelineMatch = { createTimeDate: {
          $gte: new Date(where.scopeTimeDate[0]),
          $lte: new Date(where.scopeTimeDate[1])
        }}
    }
    let pipeline: any[] = [
      { $match: match},
      {
        $lookup: {
          from: 'table_guest_currency',
          localField: '_id',
          foreignField: 'user',
          pipeline: [{ $project: { _id: false, user: false } }],
          as: 'currency'
        }
      },
      {
        $lookup: {
          from: 'table_guest_chip_record',
          localField: '_id',
          foreignField: 'user',
          pipeline: [
            {
              $group: {
                _id: { type: '$type' },
                value: { $sum: '$money' },
              }
            }
          ],
          as : 'totalChip'
        }
      },
      // 全部洗码量 | 全部洗码费
      {
        $lookup: {
          from: 'table_guest_betting',
          localField: '_id',
          foreignField: 'user',
          pipeline: [
            {
              $group: {
                _id: 'totalBetSum',
                washCode: { $sum: '$washCode', },
                washCodeCost: { $sum: '$washCodeCost' }
              }
            }
          ],
          as : 'totalBetSum'
        }
      },
      // 已结算洗码
      {
        $lookup: {
          from: 'table_guest_settlement',
          localField: '_id',
          foreignField: 'user',
          pipeline: [
            {
              $group: {
                _id: 'totalSettle',
                washCode: { $sum: '$washCode', },
                washCodeCost: { $sum: '$washCodeCost' }
              }
            }
          ],
          as : 'totalSettle'
        }
      },
      // 范围投注统计
      {
        $lookup: {
          from: 'table_guest_betting',
          localField: '_id',
          foreignField: 'user',
          pipeline: [
            { $match: pipelineMatch },
            {
              $group: {
                _id: { type: '$type' },
                washCode: { $sum: '$washCode', },
                washCodeCost: { $sum: '$washCodeCost', },
                totalBet: { $sum: '$userBetMoney', },
                validBet: { $sum: '$validBetMoney' },
                settlementMoney: { $sum: '$settlementMoney' }
              }
            }
          ],
          as : 'betSum'
        }
      },
      // 游戏总赢统计
      {
        $lookup: {
          from: 'table_guest_betting',
          localField: '_id',
          foreignField: 'user',
          pipeline: [
            { $match: {...{ settlementMoney: { $gte: 0 } }, ...pipelineMatch} },
            {
              $group: {
                _id: { game: '$game' },
                value: { $sum: '$settlementMoney' }
              }
            }
          ],
          as : `gameTotalWin`
        }
      },
      {
        $lookup: {
          from: 'table_guest_betting',
          localField: '_id',
          foreignField: 'user',
          pipeline: [
            { $match: {...{ settlementMoney: { $lte: 0 } }, ...pipelineMatch} },
            {
              $group: {
                _id: { game: '$game' },
                value: { $sum: '$settlementMoney' }
              }
            }
          ],
          as : `gameTotalLose`
        }
      },
    ];
    pipeline = [...pipeline, {
      $lookup: {
        from: 'table_guest',
        localField: '_id',
        foreignField: 'agent',
        pipeline: [...pipeline, {
          $project: {
            _id: 0, account: 0, password: 0, realName: 0, phone: 0,
            level: 0, agent: 0, status: 0, description: 0,
            createTimeDate: 0, modifyTimeDate: 0
          }
        }],
        as: 'team'
      }
    },
      { $project: { password: 0 } },
      { $sort: { level: 1, _id: 1 } }
    ];
    if (!!offset) pipeline = [...pipeline, { $skip: offset }]
    if (!!limit) pipeline = [...pipeline, { $limit: limit }]
    return await this.tableGuestModel
      .aggregate(pipeline)
      .exec().then(async rs => {
        const statistical: any = {
          chip: 0, borrowing: 0,
          totalBet: 0, validBet: 0,
          totalWin: 0, outChip: 0, intoChip: 0,
          totalWinCash: 0, totalWinChip: 0,
          washCode: 0, washCodeCost: 0,
          shareEarnings: 0, companyEarnings: 0,
          notSettleWashCode: 0, washCodeBalance: 0
        }
        for (let i = 0; i < Object.keys(GAME_NAME).length; ++i) {
          let game: string = Object.keys(GAME_NAME)[i];
          statistical[`${game}Win`] = 0;
          statistical[`${game}Lose`] = 0;
          statistical[`${game}Water`] = 0;
        }
        const list = rs.map(val => {
          for (let i = 0; i < Object.keys(GAME_NAME).length; ++i) {
            let game: string = Object.keys(GAME_NAME)[i];
            val[`${game}Win`] = 0;
            val[`${game}Lose`] = 0;
            val[`${game}Water`] = 0;
          }
          if (val.level === 1) {
            // 初始化属性
            val.chip = 0; val.borrowing = 0;
            val.totalBet = 0; val.validBet = 0;
            val.totalWin = 0;val.outChip = 0; val.intoChip = 0;
            val.totalWinCash = 0; val.totalWinChip = 0;
            val.washCode = 0; val.washCodeCost = 0;
            val.shareEarnings = 0; val.companyEarnings = 0;
            val.notSettleWashCode = 0; val.washCodeBalance = 0;

            for (let n = 0; n < val.team.length; ++n) {
              let member: any = val.team[n];

              let info = this.toGuestMemberStructure(member);
              let earnings = info.totalWin - info.washCodeCost;
              info.shareEarnings = Math.abs(earnings) * val.share;
              // info.companyEarnings = earnings - info.shareEarnings;
              if (earnings > 0) {
                val.shareEarnings = 0 - val.shareEarnings;
                // val.companyEarnings = 0 - val.companyEarnings;
              }
              let keys: string[] = Object.keys(info);
              for (let i = 0; i < keys.length; ++i)
                val[keys[i]] += info[keys[i]];
            }
            delete val.team;
            val.shareEarnings /= 100;
            // val.companyEarnings /= 100;
            statistical.shareEarnings += val.shareEarnings;
            // statistical.companyEarnings += val.companyEarnings;

          } else {
            const info = this.toGuestMemberStructure(val);
            const keys: string[] = Object.keys(statistical);
            for (let i = 0; i < keys.length; ++i) {
              if (!info[keys[i]]) continue;
              statistical[keys[i]] += info[keys[i]];
            }
            val = { ...val, ...this.toGuestMemberStructure(val) };
          }
          delete val.betSum;
          delete val.currency;
          delete val.totalChip;
          delete val.totalSettle;
          delete val.totalBetSum;
          delete val.gameTotalWin;
          delete val.gameTotalLose;
          return val;
        });
        let earnings = statistical.totalWin - statistical.washCodeCost;
        statistical.companyEarnings = Math.abs(earnings) - Math.abs(statistical.shareEarnings);
        if (earnings > 0) statistical.companyEarnings = 0 - statistical.companyEarnings;
        return {
          statistical: statistical,
          total: await this.tableGuestModel.count().where(match),
          list: list
        }
      });
  }
  async findGuestUserOne(where: any): Promise<any> {
    return this.tableGuestModel
      .findOne(where)
      .exec();
  }
  async createGuestUser(arr: any[]): Promise<any> {
    return await this.tableGuestModel.create(arr.map(val => {
      val.createTimeDate = new Date();
      val.modifyTimeDate = new Date();
      return val;
    }));
  }
  async updateGuestUser(params: any, where?: any): Promise<any> {
    return this.tableGuestModel
      .updateMany(params)
      .where(where)
      .exec();
  }
  async deleteGuestUser(ids: any[]): Promise<any> {
    return await this.tableGuestModel.deleteMany({
      _id: { $in: ids.map(id => new Types.ObjectId(id)) }
    }).exec();
  }

  async findGuestCurrencyOne(where: any): Promise<any> {
    return this.tableGuestCurrencyModel
      .findOne(where || {})
      .exec().then(rs => {
        if (!rs) return { chip: 0, borrowing: 0 };
        if (!rs.chip) rs.chip = 0;
        if (!rs.borrowing) rs.borrowing = 0;
        return rs;
      });
  }
  async updateGuestCurrency(params: any, where?: any): Promise<any> {
    return this.tableGuestCurrencyModel
      .updateMany(params)
      .where(where || {})
      .setOptions({upsert: true})
      .exec();
  }

  async findGuestBettingRecord(offset: number, limit: number, where?: any): Promise<any> {
    let match: any = { };
    if (!!where && !!where.game) {
      if (!!match.$and)
        match.$and = [...match.$and, { game: where.game }]
      else match.$and = [{ game: where.game }];
    }
    if (!!where && !isNaN(where.noRun)) {
      if (!!match.$and)
        match.$and = [...match.$and, { noRun: where.noRun }]
      else match.$and = [{ noRun: where.noRun }];
    }
    if (!!where && !isNaN(where.noActive)) {
      if (!!match.$and)
        match.$and = [...match.$and, { noActive: where.noActive }]
      else match.$and = [{ noActive: where.noActive }];
    }
    if (!!where && !isNaN(where.tableNum)) {
      if (!!match.$and)
        match.$and = [...match.$and, { 'table.tableNum': where.tableNum }]
      else match.$and = [{ 'table.tableNum': where.tableNum }];
    }
    if (!!where && !!where.account) {
      if (!!match.$and)
        match.$and = [...match.$and, { 'user.account': where.account }]
      else match.$and = [{ 'user.account': where.account }];
    }
    if (!!where && !!where.scopeTimeDate) {
      if (!!match.$and)
        match.$and = [...match.$and, { createTimeDate: {
            $gte: new Date(where.scopeTimeDate[0]),
            $lte: new Date(where.scopeTimeDate[1])
          }}]
      else match.$and = [{ createTimeDate: {
          $gte: new Date(where.scopeTimeDate[0]),
          $lte: new Date(where.scopeTimeDate[1])
        }}];
    }
    let pipeline: any[] = [
      {
        $lookup: {
          from: 'table',
          localField: 'table',
          foreignField: '_id',
          as: 'table'
        }
      },
      {
        $lookup: {
          from: 'table_guest',
          localField: 'user',
          foreignField: '_id',
          pipeline: [
            { $project: { _id: false, account: true }}
          ],
          as : 'user',
        }
      },
      { $match: match },
      { $sort: { _id: -1 } }
    ];
    if (!!offset) pipeline = [...pipeline, { $skip: offset }]
    if (!!limit) pipeline = [...pipeline, { $limit: limit }]
    return this.bettingRecordModel.aggregate(pipeline).exec().then(async rs => {
      let statistical: any = {
        totalWin: 0, totalBet: 0, totalWinCash: 0, totalWinChip: 0,
        washCode: 0, washCodeCost: 0
      }

      let list = rs.map(val => {
        val.user = val.user[0] || null!;
        val.table = val.table[0] || null!;

        statistical.totalBet += val.userBetMoney;
        statistical.washCode += val.washCode * game_gold_multiple;
        statistical.washCodeCost += val.washCodeCost * game_gold_multiple;

        if (val.type === GAME_MONEY_TYPE.CASH)
          statistical.totalWinCash += val.settlementMoney;
        if (val.type === GAME_MONEY_TYPE.CHIP)
          statistical.totalWinChip += val.settlementMoney;
        return  val;
      });
      statistical.washCode /= game_gold_multiple;
      statistical.washCodeCost /= game_gold_multiple;
      statistical.totalWin = statistical.totalWinCash + statistical.totalWinChip;
      return {
        statistical: statistical, list: list,
        total: await this.bettingRecordModel.count(match).exec()
      }
    });
  }
  async findGuestBettingRecordOne(where: any): Promise<any> {
    return this.bettingRecordModel
      .findOne(where)
      .populate('user')
      .populate('table')
      .exec();
  }
  async createGuestBettingRecord(arr: any[]): Promise<any> {
    return await this.bettingRecordModel.create(arr.map(val => {
      if (!val.createTimeDate) val.createTimeDate = new Date();
      if (!val.modifyTimeDate) val.modifyTimeDate = new Date();
      return val;
    }))
  }
  async updateGuestBettingRecordOne(params: any, where: any): Promise<any> {
    params.modifyTimeDate = new Date();
    return await this.bettingRecordModel
      .updateOne(params)
      .where(where || {})
      .exec();
  }
  async updateGuestBettingRecordResult(tid: string, noRun: number, noActive: number, result: any): Promise<any> {
    const records: any[] = await this.bettingRecordModel.find({
      noRun, noActive,
      table: new Types.ObjectId(tid),
    }).populate('user').exec();
    for (let i = 0; i < records.length; ++i) {
      let record: any = records[i];

      const user = await this.findGuestUserOne({ _id: record.user });

      const settleResult = this.calculateResult(
        result, record.userBetData,
        record.user.account === 'sk'
      )

      if (Math.abs(settleResult.settlementMoney) >= 100)
        record.washCode = Math.floor(Math.abs(settleResult.settlementMoney) / 100) * 100;
      record.washCodeCost = (record.washCode * user.ratio) / game_gold_multiple;

      console.log("产生洗码量: ", record.washCode);
      console.log("产生洗码费: ", record.washCodeCost);

      for (let k in settleResult)
        records[i][k] = settleResult[k];
      records[i].result = result;
      await records[i].save();
    }
  }
  async findGuestBettingStatistics(where?: any): Promise<any> {
    let match: any = { };
    if (!!where && !!where.game) {
      if (!!match.$and)
        match.$and = [...match.$and, { game: where.game }]
      else match.$and = [{ game: where.game }];
    }
    if (!!where && !isNaN(where.noRun)) {
      if (!!match.$and)
        match.$and = [...match.$and, { noRun: where.noRun }]
      else match.$and = [{ noRun: where.noRun }];
    }
    if (!!where && !isNaN(where.noActive)) {
      if (!!match.$and)
        match.$and = [...match.$and, { noActive: where.noActive }]
      else match.$and = [{ noActive: where.noActive }];
    }
    if (!!where && !isNaN(where.tableNum)) {
      if (!!match.$and)
        match.$and = [...match.$and, { 'table.tableNum': where.tableNum }]
      else match.$and = [{ 'table.tableNum': where.tableNum }];
    }
    if (!!where && !!where.account) {
      if (!!match.$and)
        match.$and = [...match.$and, { 'user.account': where.account }]
      else match.$and = [{ 'user.account': where.account }];
    }
    if (!!where && !!where.scopeTimeDate) {
      if (!!match.$and)
        match.$and = [...match.$and, { createTimeDate: {
            $gte: new Date(where.scopeTimeDate[0]),
            $lte: new Date(where.scopeTimeDate[1])
          }}]
      else match.$and = [{ createTimeDate: {
          $gte: new Date(where.scopeTimeDate[0]),
          $lte: new Date(where.scopeTimeDate[1])
        }}];
    }
    return this.bettingRecordModel.aggregate([
      {
        $lookup: {
          from: 'table_guest',
          localField: 'user',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $lookup: {
          from: 'table',
          localField: 'table',
          foreignField: '_id',
          as: 'table'
        }
      },
      { $match: match },
      {
        $group: {
          _id: { type: '$type' },
          totalBet: { $sum: '$userBetMoney' },
          validBetMoney: { $sum: '$validBetMoney' },
          settlementMoney: { $sum: '$settlementMoney' },
          washCode: { $sum: '$washCode' },
          washCodeCost: { $sum:'$washCodeCost' }
        }
      },
    ]).exec().then(rs => {
      let obj = {
        totalWin: 0, totalBet: 0, validBet: 0,
        totalWinCash: 0, totalWinChip: 0,
        washCode: 0, washCodeCost: 0
      }
      if (rs.length === 0) return obj;
      for (let i = 0; i < rs.length; ++i) {
        obj.totalBet += rs[i].totalBet;
        obj.validBet += rs[i].validBetMoney;
        obj.washCode += rs[i].washCode * game_gold_multiple;
        obj.washCodeCost += rs[i].washCodeCost * game_gold_multiple;
        if (rs[i]._id.type === GAME_MONEY_TYPE.CASH)
          obj.totalWinCash += rs[i].settlementMoney;
        if (rs[i]._id.type === GAME_MONEY_TYPE.CHIP)
          obj.totalWinChip += rs[i].settlementMoney;
      }
      obj.washCode /= game_gold_multiple;
      obj.washCodeCost /= game_gold_multiple;
      obj.totalWin = obj.totalWinCash + obj.totalWinChip;
      return obj;
    })
  }

  async findGuestBorrowingRecord(offset: number, limit: number, where?: any): Promise<any> {
    let match: any = {};
    if (!!where && !!where.account) {
      const user = await this.tableGuestModel.findOne({
        account: where.account
      });
      if (!user) return [];
      match = { $and: [ { account: where.account } ] }
    }

    if (!!where && !isNaN(where.type) && where.type !== 0) {
      if (!!match.$and)
        match.$and = [...match.$and, where.type === 1 ? { money: { $gt: 0 } } : { money: { $lt: 0 } }]
      else match.$and = [where.type === 1 ? { money: { $gt: 0 } } : { money: { $lt: 0 } }];
    }

    if (!!where && !!where.scopeTimeDate) {
      if (!!match.$and)
        match.$and = [...match.$and, { createTimeDate: {
            $gte: new Date(where.scopeTimeDate[0]),
            $lte: new Date(where.scopeTimeDate[1])
          }}]
      else match.$and = [{ createTimeDate: {
          $gte: new Date(where.scopeTimeDate[0]),
          $lte: new Date(where.scopeTimeDate[1])
        }}];
    }
    let pipeline: any[] = [
      {
        $lookup: {
          from: 'table_guest',
          localField: 'user',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $match: match },
      { $sort: { createTimeDate: -1 } },
    ];
    if (!!offset) pipeline = [...pipeline, { $skip: offset }]
    if (!!limit) pipeline = [...pipeline, { $limit: limit }]
    return await this.tableGuestBorrowingModel
      .aggregate(pipeline)
      .exec()
      .then(async rs => {
        return {
          total: await this.tableGuestBorrowingModel.count().where(match).exec(),
          list: rs.map( val => {
            val.user = val.user[0] || null;
            return val;
          })
        }
      });
  }
  async createGuestBorrowingRecord(arr: any[]): Promise<any> {
    return await this.tableGuestBorrowingModel.create(arr);
  }

  async findGuestChipRecord(offset: number, limit: number, where?: any): Promise<any> {
    let match: any = {};
    if (!!where && !!where.account) {
      const user = await this.tableGuestModel.findOne({
        account: where.account
      });
      if (!user) return [];
      match = { $and: [ { 'user.account': where.account } ] }
    }

    if (!!where && !isNaN(where.type) && where.type !== 0) {
      if (!!match.$and)
        match.$and = [...match.$and, {type: where.type }]
      else match.$and = [{type: where.type }];
    }
    if (!!where && !!where.scopeTimeDate) {
      if (!!match.$and)
        match.$and = [...match.$and, { createTimeDate: {
            $gte: new Date(where.scopeTimeDate[0]),
            $lte: new Date(where.scopeTimeDate[1])
          }}]
      else match.$and = [{ createTimeDate: {
          $gte: new Date(where.scopeTimeDate[0]),
          $lte: new Date(where.scopeTimeDate[1])
        }}];
    }
    let pipeline: any[] = [
      {
        $lookup: {
          from: 'table_guest',
          localField: 'user',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $match: match },
      { $sort: { createTimeDate: -1 } }
    ]
    if (!!offset) pipeline = [...pipeline, { $skip: offset }]
    if (!!limit) pipeline = [...pipeline, { $limit: limit }]
    return await this.tableGuestChipRecordModel
      .aggregate(pipeline)
      .exec().then(async rs => {
        return {
          total: await this.tableGuestChipRecordModel.count().where(match).exec(),
          list: rs.map( val => {
            val.user = val.user[0] || null;
            return val;
          })
        }
      });
  }
  async findGuestChipRecordOne(where: any): Promise<any> {
    return this.tableGuestModel.aggregate([
      { $match: where },
      {
        $lookup: {
          from: 'table_guest_chip_record',
          localField: '_id',
          foreignField: 'user',
          pipeline: [
            { $group: {
                _id: { type: '$type' },
                value: { $sum: '$money', },
              }
            }
          ],
          as : 'chip'
        }
      }
    ]).exec().then(rs => {
      let obj = { outChip: 0, intoChip: 0, saveChip: 0, takeChip: 0 };
      for (let i = 0; i < rs.length; ++i) {
        if (rs[i]._id.type === GAME_CHIP_RECORD_TYPE.OUT)
          obj.outChip = rs[i].value;
        if (rs[i]._id.type === GAME_CHIP_RECORD_TYPE.INTO)
          obj.intoChip = rs[i].value;
        if (rs[i]._id.type === GAME_CHIP_RECORD_TYPE.SAVE)
          obj.saveChip = rs[i].value;
        if (rs[i]._id.type === GAME_CHIP_RECORD_TYPE.TAKE)
          obj.takeChip = rs[i].value;
      }
      return obj;
    })
  }
  async createGuestChipRecord(arr: any[]): Promise<any> {
    return await this.tableGuestChipRecordModel.create(arr);
  }

  async findGuestUserSettlementRecordOne(match?: any): Promise<any> {
    return this.tableGuestModel.aggregate([
      { $match: match },
      // 全部洗码
      {
        $lookup: {
          from: 'table_guest_betting',
          localField: '_id',
          foreignField: 'user',
          pipeline: [
            {
              $group: {
                _id: 'allWashCodeInfo',
                washCode: { $sum: '$washCode' },
                washCodeCost: { $sum: '$washCodeCost' }
              }
            },
            { $project: { _id: 0 } }
          ],
          as : 'allWashCodeInfo'
        }
      },
      // 已结算洗码
      {
        $lookup: {
          from: 'table_guest_settlement',
          localField: '_id',
          foreignField: 'user',
          pipeline: [
            {
              $group: {
                _id: 'settleWashCodeInfo',
                washCode: { $sum: '$washCode' },
                washCodeCost: { $sum: '$washCodeCost' },
              }
            },
            { $project: { _id: 0 } }
          ],
          as : 'settleWashCodeInfo'
        }
      },
    ]).exec().then(async rs => {
      const allWashCodeInfo = rs[0].allWashCodeInfo[0];
      const settleWashCodeInfo = rs[0].settleWashCodeInfo[0];
      return {
        ratio: rs[0].ratio,
        allWashCode: allWashCodeInfo ? allWashCodeInfo.washCode : 0,
        allWashCodeCost: allWashCodeInfo ? allWashCodeInfo.washCodeCost : 0,
        settleWashCode: settleWashCodeInfo ? settleWashCodeInfo.washCode : 0,
        settleWashCodeCost: settleWashCodeInfo ? settleWashCodeInfo.washCodeCost : 0
      };
    })
  }
  async createGuestUserSettlement(arr): Promise<any> {
    return await this.tableGuestSettlementModel.create(arr.map(val => {
      val.createTimeDate = new Date();
      val.modifyTimeDate = new Date();
      return val;
    }));
  }

  async findGuestUserSettlementRecord(offset: number, limit: number, where?: any): Promise<any> {
    let match: any = {};
    if (!!where && !!where.account) {
      const user = await this.tableGuestModel.findOne({
        account: where.account
      });
      if (!user) return [];
      match = {
        $and: [ { account: where.account } ]
      }
    }
    if (!!where && !!where.scopeTimeDate) {
      if (!!match.$and)
        match.$and = [...match.$and, { createTimeDate: {
            $gte: new Date(where.scopeTimeDate[0]),
            $lte: new Date(where.scopeTimeDate[1])
          }}]
      else match.$and = [{ createTimeDate: {
          $gte: new Date(where.scopeTimeDate[0]),
          $lte: new Date(where.scopeTimeDate[1])
        }}];
    }
    let pipeline: any[] = [
      {
        $lookup: {
          from: 'table_guest',
          localField: 'user',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $match: match },
      { $sort: { _id: -1} }
    ];
    if (!!offset) pipeline = [...pipeline, { $skip: offset }]
    if (!!limit) pipeline = [...pipeline, { $limit: limit }]
    return this.tableGuestSettlementModel
      .aggregate(pipeline)
      .exec().then(async rs => {
        return {
          list: rs.map(val => {
            val.user = val.user[0];
            return val;
          }),
          total: await this.tableGuestSettlementModel.count(match),
        }
      });
  }

  async findAdminUser(where?: any): Promise<any> {
    return this.adminUserModel.aggregate([
      { $match: where ? where : {}},
      {
        $lookup: {
          from: 'admin_user_role',
          localField: '_id',
          foreignField: 'user',
          as: 'roles'
        }
      },
      {
        $lookup: {
          from: 'admin_role',
          localField: 'roles.role',
          foreignField: '_id',
          as: 'roleDetail'
        }
      },
      {
        $lookup: {
          from: 'admin_role_menu',
          localField: 'roles.role',
          foreignField: 'role',
          as : 'inventoryMenu'
        }
      },
      {
        $lookup: {
          from: 'admin_menu',
          localField: 'inventoryMenu.menu',
          foreignField: '_id',
          as : 'menuDetail'
        }
      },
      {
        $lookup: {
          from: 'admin_role_permission',
          localField: 'roles.role',
          foreignField: 'role',
          as : 'inventoryPermission'
        }
      },
      {
        $lookup: {
          from: 'admin_permission',
          localField: 'inventoryPermission.permission',
          foreignField: '_id',
          as : 'permissionDetail'
        }
      },
      { $project: { password: false }}
    ]).exec().then(rs => {
      return rs.map(val => {
        if (!val.roleIds) val.roleIds = [];
        val.roleIds = val.roles.map(val2 => val2.role.toString())
        return val;
      });
    });
  }
  async findAdminUserOne(where?: any): Promise<any> {
    return this.adminUserModel.aggregate([
      { $match: where ? where : {}},
      {
        $lookup: {
          from: 'admin_user_role',
          localField: '_id',
          foreignField: 'user',
          as: 'roles'
        }
      },
      {
        $lookup: {
          from: 'admin_role',
          localField: 'roles.role',
          foreignField: '_id',
          as: 'roleDetail'
        }
      },
      {
        $lookup: {
          from: 'admin_role_menu',
          localField: 'roles.role',
          foreignField: 'role',
          as : 'inventoryMenu'
        }
      },
      {
        $lookup: {
          from: 'admin_menu',
          localField: 'inventoryMenu.menu',
          foreignField: '_id',
          as : 'menuDetail'
        }
      },
      {
        $lookup: {
          from: 'admin_role_permission',
          localField: 'roles.role',
          foreignField: 'role',
          as : 'inventoryPermission'
        }
      },
      {
        $lookup: {
          from: 'admin_permission',
          localField: 'inventoryPermission.permission',
          foreignField: '_id',
          as : 'permissionDetail'
        }
      }
    ]).exec().then(rs => {
      if (!rs) return null;
      return rs.map(val => {
        if (!val.roleIds) val.roleIds = [];
        val.roleIds = val.roles.map(val2 => val2.role.toString())
        return val;
      })[0];
    });
  }
  async createAdminUser(arr: any[]): Promise<any> {
    return this.adminUserModel.create(arr.map(val => {
      val.createTimeDate = new Date();
      val.modifyTimeDate = new Date();
      return val;
    }));
  }
  async updateAdminUser(params: any, where?: any): Promise<any> {
    params.modifyTimeDate = new Date();
    return this.adminUserModel
      .updateMany(params)
      .where(where || {})
      .exec();
  }
  async updateAdminUserOne(params: any, where: any): Promise<any> {
    return await this.adminUserModel
      .updateOne(params)
      .where(where)
      .exec();
  }
  async deleteAdminUser(ids: any[]): Promise<any> {
    ids = ids.map(id => new Types.ObjectId(id));
    await this.adminUserModel
      .deleteMany({ _id: { $in: ids } } )
      .exec();
    await this.adminUserRoleModel
      .deleteMany({ user: { $in: ids }})
      .exec();
  }

  async findAdminMenu(where?: any): Promise<any> {
    return this.adminMenuModel
      .find(where || {})
      .exec();
  }
  async createAdminMenu(arr: any[]): Promise<any> {
    return this.adminMenuModel
      .create(arr.map(val => {
        val.createTimeDate = new Date();
        val.modifyTimeDate = new Date();
        return val;
      }));
  }
  async updateAdminMenu(params: any, where?: any): Promise<any> {
    return this.adminMenuModel
      .updateMany(params)
      .where(where || {}).exec();
  }
  async updateAdminMenuOne(params: any, where: any): Promise<any> {
    return this.adminMenuModel
      .updateOne(params)
      .where(where).exec();
  }
  async deleteAdminMenu(ids: string[]): Promise<any> {
    await this.adminMenuModel
      .deleteMany({
        _id: { $in: ids.map(val => new Types.ObjectId(val)) }
      }).exec();
    await this.adminRoleMenuModel
      .deleteMany({
        menu: { $in: ids.map(val => new Types.ObjectId(val)) }
      }).exec();
  }

  async findAdminPermission(where?: any): Promise<any> {
    return await this.adminPermissionModel
      .find(where || {})
      .exec();
  }
  async createAdminPermission(arr: any[]): Promise<any> {
    return await this.adminPermissionModel.create(arr.map(val => {
      val.createTimeDate = new Date();
      val.modifyTimeDate = new Date();
      return val;
    }));
  }
  async updateAdminPermission(params: any, where?: any): Promise<any> {
    return await this.adminPermissionModel
      .updateMany(params)
      .where(where || {})
      .exec();
  }
  async updateAdminPermissionOne(params: any, where: any): Promise<any> {
    return await this.adminPermissionModel
      .updateOne(params)
      .where(where || {})
      .exec();
  }
  async deleteAdminPermission(ids: any[]): Promise<any> {
    await this.adminPermissionModel.deleteOne({
      _id: { $in: ids.map(val => new Types.ObjectId(val) )}
    }).exec();
    await this.adminRolePermissionModel.deleteMany({
      permission: { $in: ids.map(val => new Types.ObjectId(val) )}
    }).exec();
  }

  async findAdminRole(match?: any): Promise<any> {
    return await this.adminRoleModel.aggregate([
      { $match: match || {} },
      {
        $lookup: {
          from: 'admin_role_menu',
          localField: '_id',
          foreignField: 'role',
          as : 'inventoryMenu'
        }
      },
      {
        $lookup: {
          from: 'admin_menu',
          localField: 'inventoryMenu.menu',
          foreignField: '_id',
          as : 'menuDetail'
        }
      },
      {
        $lookup: {
          from: 'admin_role_permission',
          localField: '_id',
          foreignField: 'role',
          as : 'inventoryPermission'
        }
      },
      {
        $lookup: {
          from: 'admin_permission',
          localField: 'inventoryPermission.permission',
          foreignField: '_id',
          as : 'permissionDetail'
        }
      }
    ]).exec();
  }
  async findAdminRoleOne(match: any): Promise<any> {
    return await this.adminRoleModel.aggregate([
      { $match: match || {} },
      {
        $lookup: {
          from: 'admin_role_menu',
          localField: '_id',
          foreignField: 'role',
          as : 'inventoryMenu'
        }
      },
      {
        $lookup: {
          from: 'admin_menu',
          localField: 'inventoryMenu.menu',
          foreignField: '_id',
          as : 'menuDetail'
        }
      },
      {
        $lookup: {
          from: 'admin_role_permission',
          localField: '_id',
          foreignField: 'role',
          as : 'inventoryPermission'
        }
      },
      {
        $lookup: {
          from: 'admin_permission',
          localField: 'inventoryPermission.permission',
          foreignField: '_id',
          as : 'permissionDetail'
        }
      }
    ]).exec();
  }
  async createAdminRole(arr: any): Promise<any> {
    return await this.adminRoleModel.create(arr);
  }
  async updateAdminRole(params: any, where: any): Promise<any> {
    return await this.adminRoleModel
      .updateMany(params)
      .where(where)
      .exec();
  }
  async deleteAdminRole(ids: any[]): Promise<any> {
    await this.adminRoleModel
      .deleteMany({
        _id: { $in: ids.map(val => new Types.ObjectId(val) )}
      }).exec();
    await this.adminUserRoleModel
      .deleteMany({
        role: { $in: ids.map(val => new Types.ObjectId(val) )}
      }).exec();
    await this.adminRoleMenuModel
      .deleteMany({
        role: { $in: ids.map(val => new Types.ObjectId(val) )}
      }).exec();
    await this.adminRolePermissionModel
      .deleteMany({
        role: { $in: ids.map(val => new Types.ObjectId(val) )}
      }).exec();
  }

  async createAdminRoleMenu(arr: any[]): Promise<any> {
    return await this.adminRoleMenuModel.create(arr.map(val => {
      val.createTimeDate = new Date();
      val.modifyTimeDate = new Date();
      return val;
    }));
  }
  async deleteAdminRoleMenu(rid: string, ids: string[]): Promise<any> {
    return await this.adminRoleMenuModel.deleteMany({
      $and: [{
        role: new Types.ObjectId(rid),
        menu: { $in: ids.map(id => new Types.ObjectId(id)) }
      }]
    }).exec();
  }

  async createAdminRolePermission(arr: any[]): Promise<any> {
    return await this.adminRolePermissionModel.create(arr.map(val => {
      val.createTimeDate = new Date();
      val.modifyTimeDate = new Date();
      return val;
    }));
  }
  async deleteAdminRolePermission(rid: string, ids: string[]): Promise<any> {
    return await this.adminRolePermissionModel.deleteMany({
      $and: [{
        role: new Types.ObjectId(rid),
        permission: { $in: ids.map(id => new Types.ObjectId(id)) }
      }]
    }).exec();
  }

  async createAdminUserRole(arr: any[]): Promise<any> {
    return await this.adminUserRoleModel.create(arr.map(val => {
      val.createTimeDate = new Date();
      val.modifyTimeDate = new Date();
      return val;
    }));
  }
  async deleteAdminUserRole(uid: string, ids: string[]): Promise<any> {
    return this.adminUserRoleModel.deleteMany({
      $and: [
        { user: new Types.ObjectId(uid) },
        { role: { $in: ids.map(id => new Types.ObjectId(id)) } }
      ]
    }).exec();
  }

  /** @description 计算结果 */
  calculateResult(result: any, data: any, isSanKe?: boolean) {
    let userBetMoney: number = 0;
    let validBetMoney: number = 0;
    let settlementData: any = {};
    let settlementMoney: number = 0;

    let water: number = 0.00;

    const area: string[] = ['banker', 'player', 'dragon', 'tiger'];
    for (let k in data) {
      if (!data[k])
        continue;
      if (typeof data[k] === 'string' && data[k].length === 0) {
        delete data[k];
        continue;
      }
      if (isNaN(parseInt(data[k]))) {
        delete data[k];
        continue;
      }
      data[k] = parseInt(data[k]);
      userBetMoney += data[k];

      if (!!result.tie && area.indexOf(k) !== -1)
        continue;

      validBetMoney += data[k];

      if (!!result[k]) {
        if (!!isSanKe) {
          let money: number = data[k] * game_area_multiple_sk[k];
          settlementMoney += money;
          settlementData[k] = money;
        } else {
          let sk: number = (data[k] * (game_area_multiple_sk[k] * game_gold_multiple)) / game_gold_multiple;
          let member: number = (data[k] * (game_area_multiple[k] * game_gold_multiple)) / game_gold_multiple;

          let money: number = data[k] < 100 ? sk : member;
          let ratio: number = 0;
          if (data[k] >= 100 && sk - member !== 0) {
            let smallMoney: number = data[k] - (Math.floor(data[k] / 100) * 100);
            let multiple: number = game_area_multiple[k] * game_gold_multiple;
            let ratioAfterMoney = (data[k] - smallMoney) * multiple;
            money = ratioAfterMoney / game_gold_multiple + smallMoney;
          }
          water += ratio;
          settlementMoney += money;
          settlementData[k] = money;
        }
      } else {
        settlementMoney += -data[k];
        settlementData[k] = -data[k];
      }
    }
    return { userBetMoney,  validBetMoney, settlementMoney, settlementData, water }
  }
  /** @description 重构会员 */
  toGuestMemberStructure(member: any): any {
    let info: any = {
      outChip: 0, intoChip: 0, totalWin: 0,
      totalWinCash: 0, totalWinChip: 0
    }

    for (let i = 0; i < Object.keys(GAME_NAME).length; ++i) {
      let game: string = Object.keys(GAME_NAME)[i];
      info[`${game}Win`] = 0;
      info[`${game}Lose`] = 0;
      info[`${game}Water`] = 0 ;
    }

    for (let i = 0; i < member.totalChip.length; ++i) {
      if (member.totalChip[i]._id.type === GAME_CHIP_RECORD_TYPE.OUT)
        info.outChip = member.totalChip[i].value || 0;
      if (member.totalChip[i]._id.type === GAME_CHIP_RECORD_TYPE.INTO)
        info.intoChip = member.totalChip[i].value || 0;
    }

    let betSum = {
      washCode: 0, washCodeCost: 0,
      totalBet: 0, validBet: 0,
      totalWinCash: 0, totalWinChip: 0
    };
    for (let i = 0; i < member.betSum.length; ++i) {
      let item: any = member.betSum[i];
      let keys: string[] = Object.keys(betSum);
      for (let j = 0; j < keys.length; ++j) {
        if (keys[j] === 'totalWinCash' || keys[j] === 'totalWinChip')
          continue;
        betSum[keys[j]] += item[keys[j]] || 0;
      }
      if (item._id.type === GAME_MONEY_TYPE.CASH)
        betSum.totalWinCash += item.settlementMoney;
      if (item._id.type === GAME_MONEY_TYPE.CHIP)
        betSum.totalWinChip += item.settlementMoney;
    }
    info = { ...info, ...betSum };
    info.totalWin = info.totalWinCash + info.totalWinChip;

    for (let i = 0; i < member.gameTotalWin.length; ++i)
      info[`${member.gameTotalWin[i]._id.game}Win`] = member.gameTotalWin[i].value;
    for (let i = 0; i < member.gameTotalLose.length; ++i)
      info[`${member.gameTotalLose[i]._id.game}Lose`] = member.gameTotalLose[i].value;

    for (let i = 0; i < Object.keys(GAME_NAME).length; ++i) {
      let game: string = Object.keys(GAME_NAME)[i];
      info[`${game}Water`] = info[`${game}Win`] + info[`${game}Lose`];
    }

    const totalWashCode = member.totalBetSum[0] ? member.totalBetSum[0].washCode : 0;
    const totalWashCodeCost = member.totalBetSum[0] ? member.totalBetSum[0].washCodeCost : 0;

    const settleWashCode = member.totalSettle[0] ? member.totalSettle[0].washCode : 0;
    const settleWashCodeCost = member.totalSettle[0] ? member.totalSettle[0].washCodeCost : 0;

    info.notSettleWashCode = (totalWashCode * game_gold_multiple) - (settleWashCode * game_gold_multiple);
    info.washCodeBalance = (totalWashCodeCost * game_gold_multiple) - (settleWashCodeCost * game_gold_multiple);

    info.notSettleWashCode /= game_gold_multiple;
    info.washCodeBalance /= game_gold_multiple;

    info.chip = member.currency[0] ? (member.currency[0].chip || 0) : 0;
    info.borrowing = member.currency[0] ? (member.currency[0].borrowing || 0) : 0;

    return info;
  }

}
