/** @description temp app service */

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import Mongoose, { Model, Types } from 'mongoose';
import { TableDocument } from './schemas/table.schema';
import { TableUserDocument } from './schemas/table_user.schema';
import { GuestDocument } from './schemas/guest.schema';
import { TableRunningRecordDocument } from './schemas/table_running_record';
import { GuestBettingRecordDocument } from './schemas/guest_betting_record.schema';
import { TableSettlementRecordDocument } from './schemas/table_settlement_record.schema';
import {
  CALCULATE_RESULT_GAME, game_agent_level,
  game_area_multiple,
  game_area_multiple_sk, GAME_CHIP_RECORD_TYPE,
  game_gold_multiple, game_member_level, GAME_MONEY_TYPE, GAME_NAME,
  game_xm_multiple, TABLE_RUNNING_MODIFY_TYPE,
} from './constant/game.constant';
import { AdminUserDocument } from './schemas/admin_user.schema';
import { AdminMenuDocument } from './schemas/admin_menu.schema';
import { AdminRoleDocument } from './schemas/admin_role.schema';
import { AdminPermissionDocument } from './schemas/admin_permission.schema';
import { AdminRoleMenuDocument } from './schemas/admin_role_menu';
import { AdminRolePermissionDocument } from './schemas/admin_role_permission';
import { AdminUserRoleDocument } from './schemas/admin_user_role';
import { GuestCurrencyDocument } from './schemas/guest_currency.schema';
import { GuestBorrowingRecordDocument } from './schemas/guest_borrowing_record.schema';
import { GuestChipRecordDocument } from './schemas/guest_chip_record.schema';
import { GuestSettlementRecordDocument } from './schemas/guest_settlement_record.schema';
import { SuperLoginTokenDocument } from './schemas/super_login_token';
import * as mongoose from 'mongoose';
import { TableRunModifyRecordDocument } from './schemas/table_running_modify_record';
import { GuestBetModifyRecordDocument } from './schemas/guest_betting_modify_record.schema';


@Injectable()
export class AppService {
  constructor(
    @InjectModel('SuperLoginToken') private superLoginTokenModel: Model<SuperLoginTokenDocument>,

    @InjectModel('Table') private tableModel: Model<TableDocument>,
    @InjectModel('TableUser') private tableUserModel: Model<TableUserDocument>,
    @InjectModel('TableRunningRecord') private tableRunRecordModel: Model<TableRunningRecordDocument>,
    @InjectModel('TableRunModifyRecord') private tableRunModifyRecordModel: Model<TableRunModifyRecordDocument>,
    @InjectModel('TableSettlementRecord') private tableSettlementRecordModel: Model<TableSettlementRecordDocument>,

    @InjectModel('Guest') private guestModel: Model<GuestDocument>,
    @InjectModel('GuestCurrency') private guestCurrencyModel: Model<GuestCurrencyDocument>,
    @InjectModel('GuestChipRecord') private tableGuestChipRecordModel: Model<GuestChipRecordDocument>,
    @InjectModel('GuestBettingRecord') private guestBetRecordModel: Model<GuestBettingRecordDocument>,
    @InjectModel('GuestBorrowingRecord') private guestBorrowingRecordModel: Model<GuestBorrowingRecordDocument>,
    @InjectModel('GuestBetModifyRecord') private guestBetModifyRecordModel: Model<GuestBetModifyRecordDocument>,
    @InjectModel('GuestSettlementRecord') private tableGuestSettlementRecordModel: Model<GuestSettlementRecordDocument>,

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
      return val;
    }));
  }
  async updateTable(params: any, where?: any): Promise<any> {
    return await this.tableModel
      .updateMany(params)
      .where(where || {})
      .exec();
  }
  async deleteTable(ids: string[]): Promise<any> {
    let tables = await this.tableModel.find({
      _id: { $in: ids.map(val => new Types.ObjectId(val) ) }
    }).exec();
    for (let i = 0; i < tables.length; ++i) {
      let table = tables[i];
      await this.guestBetRecordModel.deleteMany({
        table: table._id
      });
      await this.tableRunRecordModel.deleteMany({
        table: table._id
      });
      await table.deleteOne();
    }
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
      return val;
    }));
  }
  async updateTableUser(params, where?: any): Promise<any> {
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

  async findTableRunRecord(offset: number, limit: number, where?: any): Promise<any> {
    let match: any = { };
    if (!!where && !!where.game) {
      if (!!match.$and)
        match.$and = [...match.$and, { 'table.game': where.game }]
      else match.$and = [{ 'table.game': where.game }];
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
          pipeline: [{ $project: { _id: false, user: false } }],
          as: 'table'
        }
      },
      { $match: match },
    ]
    console.log("$match.and: ", match.$and);
    let countPipeline = [...[], ...pipeline, { $count: 'count' }];
    if (!!offset) pipeline = [...pipeline, { $skip: offset }];
    if (!!limit) pipeline = [...pipeline, { $limit: limit }];
    // let promises = [await this.tableRunRecordModel.aggregate(pipeline).exec()]
    // if (offset !== null && limit !== null) promises = [
    //     ...promises,
    //     await this.tableRunRecordModel.aggregate(countPipeline).exec()
    //   ];
    return await Promise.all([
      await this.tableRunRecordModel.aggregate(pipeline).exec(),
      await this.tableRunRecordModel.aggregate(countPipeline).exec(),
    ]).then((rs) => {
      console.log("length: ", rs[1]);
      return {
        list: rs[0].filter(val => {
          return !!val.table && !!val.table[0];
        }).map(val => {
          val.table = val.table[0] || null!;
          return  val;
        }) || [],
        // statistical: await this.findGuestBettingStatistics(where),
        total: rs[1] && rs[1].length !== 0 ? rs[1][0].count : 0
      }
    })
  }
  async findTableRunRecordOne(where: any): Promise<any> {
    return await this.tableRunRecordModel
      .findOne(where)
      .exec();
  }
  async createTableRunRecord(arr: any[]): Promise<any> {
    return await this.tableRunRecordModel.create(arr);
  }
  async createTableRunRecordOne(params: any): Promise<any> {
    return await this.tableRunRecordModel.create(params);
  }
  async updateTableRunRecord(params: any, where?: any): Promise<any> {
    return await this.tableRunRecordModel
      .updateMany(params)
      .where(where || {})
      .exec();
  }
  async deleteTableRunRecord(ids: string[]): Promise<any> {
    let records = await this.tableRunRecordModel.find({
      _id: { $in: ids.map(id => new Types.ObjectId(id)) }
    });
    let del = [];
    for (let i = 0; i < records.length; ++i) {
      let record = records[i];
      await this.createTableRunModifyRecord([{
        table: record.table, noRun: record.noRun,
        oldNoActive: record.noActive,
        type: TABLE_RUNNING_MODIFY_TYPE.ADMIN_DEL,
        oldResult: record.result, createTimeDate: new Date()
      }]);
      await record.deleteOne();
      del = [...del, record._id.toString()];
    }
    return del;
  }

  async findTableRunModifyRecord(offset: number, limit: number, where?: any): Promise<any> {
    let match: any = { };
    if (!!where && !!where.game) {
      if (!!match.$and)
        match.$and = [...match.$and, { 'table.game': where.game }]
      else match.$and = [{ 'table.game': where.game }];
    }
    // if (!!where && !isNaN(where.noRun)) {
    //   if (!!match.$and)
    //     match.$and = [...match.$and, { noRun: where.noRun }]
    //   else match.$and = [{ noRun: where.noRun }];
    // }
    // if (!!where && !isNaN(where.noActive)) {
    //   if (!!match.$and)
    //     match.$and = [...match.$and, { noActive: where.noActive }]
    //   else match.$and = [{ noActive: where.noActive }];
    // }
    if (!!where && !isNaN(where.tableNum)) {
      if (!!match.$and)
        match.$and = [...match.$and, { 'table.tableNum': where.tableNum }]
      else match.$and = [{ 'table.tableNum': where.tableNum }];
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
    console.log("$and: ", match.$and)
    let pipeline: any[] = [
      {
        $lookup: {
          from: 'table',
          localField: 'table',
          foreignField: '_id',
          pipeline: [{ $project: { _id: false, user: false } }],
          as: 'table'
        }
      },
      { $match: match },
    ]
    let countPipeline = [...[], ...pipeline, { $count: 'count' }];
    if (!!offset) pipeline = [...pipeline, { $skip: offset }];
    if (!!limit) pipeline = [...pipeline, { $limit: limit }];
    return await this.tableRunModifyRecordModel.aggregate([{
      $facet: {
        list: pipeline,
        total: countPipeline,
      }
    }]).exec().then(rs => {
      console.log("rs: ", rs);
      return {
        list: rs[0].list.filter(val => {
          return !!val.table && !!val.table[0];
        }).map(val => {
          val.table = val.table[0] || null!;
          return  val;
        }) || [],
        total: rs[0].total.length === 0 ? 0 : rs[0].total[0].count
      }
    })
  }
  async createTableRunModifyRecord(arr: any[]): Promise<any> {
    return await this.tableRunModifyRecordModel.create(arr.map(val => {
      if (!val.createTimeDate) val.createTimeDate = new Date();
      return val;
    }))
  }

  /** @description 需要优化 */
  async findTableSettlementRecord(offset: number, limit: number, where?: any): Promise<any> {
    let match: any = {};
    if (!!where && !!where.game) {
      if (!!match.$and)
        match.$and = [...match.$and, { 'table.game': where.game }]
      else match.$and = [{ 'table.game': where.game }];
    }
    if (!!where && !isNaN(parseInt(where.tableNum))) {
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
            { $project: { _id: 1, game: 1, tableNum: 1 }}
          ],
          as: 'table'
        }
      },
      { $match: match },
      { $sort: { _id: -1 } }
    ];
    let countPipeline = [...[], ...pipeline, { $count: 'count' }];
    if (!!offset) pipeline = [...pipeline, { $skip: offset }]
    if (!!limit) pipeline = [...pipeline, { $limit: limit }]
    return await Promise.all([
      await this.tableSettlementRecordModel.aggregate(pipeline).exec(),
      await this.tableSettlementRecordModel.aggregate(countPipeline).exec(),
    ]).then(async (rs) => {
      let statistical = { totalWin: 0 };
      for (let k in GAME_NAME)
        statistical[`${k}TotalWin`] = 0;

      let list = [];
      let settlementRecords = rs[0] || [];
      for (let i = 0; i < settlementRecords.length; ++i) {
        let val: any = Object.assign({}, settlementRecords[i]);
        if (!val.table) continue;
        const records = await this.guestBetRecordModel.aggregate([
          {
            $match: {
              table: val.table[0]._id,
              createTimeDate: {
                $gte: val.initTimeDate,
                $lte: val.overTimeDate
              }
            }
          },
          {
            $group: {
              _id: { type: '$type' },
              settlementMoney: { $sum: '$settlementMoney' },
            }
          }
        ]).exec();

        val.totalWin = 0;
        val.totalWinCash = 0;
        val.totalWinChip = 0;
        for (let j = 0; j < records.length; ++j) {
          if (records[j]._id.type === GAME_MONEY_TYPE.CASH)
            val.totalWinCash = records[j].settlementMoney;
          if (records[j]._id.type === GAME_MONEY_TYPE.CHIP)
            val.totalWinChip = records[j].settlementMoney;
        }

        val.table = val.table[0];
        val.totalWin += val.totalWinChip + val.totalWinCash;

        statistical.totalWin += val.totalWin;
        statistical[`${val.table.game}TotalWin`] += val.totalWin;

        list = [...list, val];
      }

      return {
        list, statistical,
        total: rs[1] && rs[1].length !== 0 ? rs[1][0].count : 0
      }
    })
  }
  async createTableSettlementRecord(arr: any[]): Promise<any> {
    return await this.tableSettlementRecordModel.create(arr.map(val => {
      val.createTimeDate = new Date();
      return val;
    }))
  }

  async findGuestUser(offset: number, limit: number, where?: any): Promise<any> {
    let match: any = {};
    let pipelineMatch: any = {};
    if (!!where && !!where.account) {
      const agent = await this.guestModel.findOne({
        account: { $regex: eval(`/^${where.account}$/i`) },
        level: game_agent_level
      });
      match = { $and: [] };
      if (!!agent)
        match.$and = [...match.$and, { $or: [{ account: { $regex: eval(`/^${where.account}$/i`) } }, { agent: agent._id }] }];
      else
        match.$and = [...match.$and, { account: { $regex: eval(`/^${where.account}$/i`) } }];
    }

    if (!!where && !isNaN(where.level)) {
      if (where.level !== 3) {
        if (!!match.$and)
          match.$and = [...match.$and, { level: where.level }]
        else match.$and = [{ level: where.level }];
      } else {
        if (!!match.$and)
          match.$and = [...match.$and, { agent: { $exists: 0 } }, { level: game_member_level }]
        else match.$and = [{ agent: { $exists: 0 } }, { level: game_member_level }];
      }
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
          from: 'guest_currency',
          localField: '_id',
          foreignField: 'user',
          pipeline: [{ $project: { _id: false, user: false } }],
          as: 'currency'
        }
      },
      {
        $lookup: {
          from: 'guest_chip_record',
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
      }
    ];
    pipeline = [...pipeline, {
      $lookup: {
        from: 'guest',
        localField: '_id',
        foreignField: 'agent',
        pipeline: [
          ...pipeline.filter(val => {
            return !val.$match;
          }), {
            $project: {
              _id: 1, account: 0, password: 0, realName: 0, phone: 0,
              level: 0, agent: 0, status: 0, description: 0,
              createTimeDate: 0, modifyTimeDate: 0
            }
          }],
        as: 'team'
      }
    },
      { $sort: { level: 1, _id: 1 } },
      { $project: { password: 0 } }
    ];
    if (!!offset) pipeline = [...pipeline, { $skip: offset }]
    if (!!limit) pipeline = [...pipeline, { $limit: limit }]
    return await this.guestModel
      .aggregate(pipeline)
      .exec().then(async rs => {
        let list: any[] = [];
        for (let i = 0; i < rs.length; ++i) {
          let val = rs[i];
          if (val.level === 1) {
            // 初始化属性
            val.chip = 0; val.borrowing = 0;
            val.totalBet = 0; val.validBet = 0;
            val.totalWin = 0;val.outChip = 0; val.intoChip = 0;
            val.totalWinCash = 0; val.totalWinChip = 0;
            val.washCode = 0; val.washCodeCost = 0;
            val.earnings = 0; val.companyEarnings = 0;
            val.notSettleWashCode = 0; val.washCodeBalance = 0;
            for (let i = 0; i < Object.keys(GAME_NAME).length; ++i) {
              let game: string = Object.keys(GAME_NAME)[i];
              val[`${game}Win`] = 0;
              val[`${game}Lose`] = 0;
              val[`${game}Water`] = 0;
            }

            let team = val.team;
            for (let j = 0; j < team.length; ++j) {
              let member: any = team[j];
              member.betRecords = /*await this.guestBetRecordModel.find({
                ...pipelineMatch, ...{ user: member._id }
              })*/await this.guestBetRecordModel.aggregate([
                { $match: {...pipelineMatch, ...{ user: member._id }} },
                { $project: {
                    game: 1, type: 1, washCode: 1, washCodeCost: 1,
                    userBetMoney: 1, settlementMoney: 1
                  }}
              ]) || [];
              let structure = this.toGuestMemberStructure(member);
              let keys: string[] = Object.keys(structure);
              for (let k = 0; k < keys.length; ++k)
                val[keys[k]] += structure[keys[k]];
              delete member.betRecords;
            }
            let totalWin: number = val.totalWin > 0 ? 0 - val.totalWin : Math.abs(val.totalWin);
            let earnings = totalWin - val.washCodeCost;
            val.earnings = earnings * (val.profitRate / 100);
            val.companyEarnings = Math.abs(earnings * game_gold_multiple) - Math.abs(val.earnings * game_gold_multiple);
            if (earnings < 0) val.companyEarnings = 0 - val.companyEarnings;
            val.companyEarnings /= game_gold_multiple;
            delete val.team;
          } else {
            val.betRecords = /*await this.guestBetRecordModel.find({
                ...pipelineMatch, ...{ user: val._id }
              })*/await this.guestBetRecordModel.aggregate([
              { $match: {...pipelineMatch, ...{ user: val._id }} },
              { $project: {
                  game: 1, type: 1, washCode: 1, washCodeCost: 1,
                  userBetMoney: 1, settlementMoney: 1
                }}
            ]) || [];
            let structure = this.toGuestMemberStructure(val);
            val = { ...val, ...structure };
          }
          delete val.betRecords;

          delete val.betSum;
          delete val.currency;
          delete val.totalChip;
          delete val.gameTotalWin;
          delete val.gameTotalLose;
          val.washCodeCost = parseFloat(val.washCodeCost.toFixed(2));
          val.washCodeBalance = parseFloat(val.washCodeBalance.toFixed(2));
          val.notSettleWashCode = parseFloat(val.notSettleWashCode.toFixed(2));
          if (!!val.earnings) val.earnings = parseFloat(val.earnings.toFixed(2));
          if (!!val.companyEarnings) val.companyEarnings = parseFloat(val.companyEarnings.toFixed(2));
          list = [...list, val];
        }
        return {
          list: list,
          total: await this.guestModel.count().where(match),
        }
      });
  }
  async findGuestUserOne(where: any): Promise<any> {
    return this.guestModel
      .findOne(where)
      .exec();
  }
  async createGuestUser(arr: any[]): Promise<any> {
    return await this.guestModel.create(arr.map(val => {
      val.createTimeDate = new Date();
      return val;
    }));
  }
  async updateGuestUser(params: any, where?: any): Promise<any> {
    console.log("params: ", params);
    return this.guestModel
      .updateMany(params)
      .where(where)
      .exec();
  }
  async deleteGuestUser(ids: any[]): Promise<any> {
    await this.guestModel.deleteMany({
      _id: { $in: ids.map(id => new Types.ObjectId(id)) }
    }).exec();
    await this.guestBetRecordModel.deleteMany({
      user: { $in: ids.map(id => new Types.ObjectId(id)) }
    }).exec();
    await this.guestBorrowingRecordModel.deleteMany({
      user: { $in: ids.map(id => new Types.ObjectId(id)) }
    }).exec();
    await this.tableGuestChipRecordModel.deleteMany({
      user: { $in: ids.map(id => new Types.ObjectId(id)) }
    }).exec();
    await this.guestCurrencyModel.deleteMany({
      user: { $in: ids.map(id => new Types.ObjectId(id)) }
    }).exec();
    await this.tableGuestSettlementRecordModel.deleteMany({
      user: { $in: ids.map(id => new Types.ObjectId(id)) }
    }).exec();
  }
  async findGuestUserStatistics(where?: any) {
    let match: any = {};
    let pipelineMatch: any = {};
    if (!!where && !!where.account) {
      const agent = await this.guestModel.findOne({
        account: { $regex: eval(`/^${where.account}$/i`) },
        level: game_agent_level
      });
      match = { $and: [] };
      if (!!agent)
        match.$and = [...match.$and, { $or: [{ account: { $regex: eval(`/^${where.account}$/i`) } }, { agent: agent._id }] }];
      else
        match.$and = [...match.$and, { account: { $regex: eval(`/^${where.account}$/i`) } }];
    }
    if (!!where && !isNaN(where.level)) {
      if (where.level !== 3) {
        if (!!match.$and)
          match.$and = [...match.$and, { level: where.level }]
        else match.$and = [{ level: where.level }];
      } else {
        if (!!match.$and)
          match.$and = [...match.$and, { agent: { $exists: 0 } }, { level: game_member_level }]
        else match.$and = [{ agent: { $exists: 0 } }, { level: game_member_level }];
      }
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
          from: 'guest_currency',
          localField: '_id',
          foreignField: 'user',
          as: 'currency'
        }
      },
      {
        $lookup: {
          from: 'guest_chip_record',
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
      }
    ];
    const sqa = match.$and ? match.$and.findIndex(item => item.level === 1) : -1;
    if (sqa !== -1) pipeline = [...pipeline, {
      $lookup: {
        from: 'guest',
        localField: '_id',
        foreignField: 'agent',
        pipeline: [
          ...pipeline.filter(val => {
            return !val.$match;
          }), { $project: {
              _id: 1, account: 0, password: 0, realName: 0, phone: 0,
              level: 0, agent: 0, status: 0, description: 0,
              createTimeDate: 0, modifyTimeDate: 0
            }
          }],
        as: 'team'
      }
    }
    ];
    return await this.guestModel
      .aggregate(pipeline)
      .exec().then(async rs => {
        const statistical: any = {
          chip: 0, borrowing: 0,
          totalBet: 0, validBet: 0,
          totalWin: 0, outChip: 0, intoChip: 0,
          totalWinCash: 0, totalWinChip: 0,
          washCode: 0, washCodeCost: 0,
          earnings: 0, companyEarnings: 0,
          notSettleWashCode: 0, washCodeBalance: 0
        }
        for (let i = 0; i < Object.keys(GAME_NAME).length; ++i) {
          let game: string = Object.keys(GAME_NAME)[i];
          statistical[`${game}Win`] = 0;
          statistical[`${game}Lose`] = 0;
          statistical[`${game}Water`] = 0;
        }

        for (let i = 0; i < rs.length; ++i) {
          let val: any = rs[i];
          for (let j = 0; j < Object.keys(GAME_NAME).length; ++j) {
            let game: string = Object.keys(GAME_NAME)[j];
            val[`${game}Win`] = 0;
            val[`${game}Lose`] = 0;
            val[`${game}Water`] = 0;
          }
          if (val.level === 1) {
            let team = val.team || [];
            if (sqa === -1) {
              team = [];
              for (let j = 0; j < rs.length; ++j) {
                if ((rs[j].agent || "").toString() === val._id.toString())
                  team = [...team, rs[j]];
              }
            }
            let totalWin: number = 0;
            let washCodeCost: number = 0;
            for (let j = 0; j < team.length; ++j) {
              let member: any = team[j];
              member.betRecords = /*await this.guestBetRecordModel.find({
                ...pipelineMatch, ...{ user: member._id }
              })*/await this.guestBetRecordModel.aggregate([
                { $match: {...pipelineMatch, ...{ user: member._id }} },
                { $project: {
                    game: 1, type: 1, washCode: 1, washCodeCost: 1,
                    userBetMoney: 1, settlementMoney: 1
                  }}
              ]) || [];

              let structure = this.toGuestMemberStructure(member);
              let keys: string[] = Object.keys(structure);
              console.log("structure: ", structure);
              for (let k = 0; k < keys.length; ++k) {
                if (!!isNaN(structure[keys[k]])) continue;
                if (keys[k] === 'totalWin')
                  totalWin += structure[keys[k]];
                else if (keys[k] === 'washCodeCost')
                  washCodeCost += structure[keys[k]];
                else {
                  if (sqa !== -1) {
                    if (keys[k] === 'totalWinCash' || keys[k] === 'totalWinChip')
                      statistical[keys[k]] += structure[keys[k]] > 0 ? 0 - structure[keys[k]] : Math.abs(structure[keys[k]]);
                    else statistical[keys[k]] += structure[keys[k]];
                  }
                }
              }
              delete member.betRecords;
            }
            totalWin = totalWin > 0 ? 0 - totalWin : Math.abs(totalWin);
            let earnings = totalWin - washCodeCost;
            // statistical.washCodeCost += washCodeCost;
            statistical.earnings += earnings * val.profitRate;
            if (sqa !== -1) statistical.totalWin += totalWin;
          } else {
            val.betRecords = /*await this.guestBetRecordModel.find({
              ...pipelineMatch, ...{ user: val._id }
            })*/await this.guestBetRecordModel.aggregate([
              { $match: {...pipelineMatch, ...{ user: val._id }} },
              { $project: {
                  game: 1, type: 1, washCode: 1, washCodeCost: 1,
                  userBetMoney: 1, settlementMoney: 1
                }}
            ]) || [];

            const structure = this.toGuestMemberStructure(val);
            for (let j = 0; j < Object.keys(GAME_NAME).length; ++j) {
              let game: string = Object.keys(GAME_NAME)[j];
              structure[`${game}Water`] = structure[`${game}Lose`] - structure[`${game}Win`];
            }
            const keys: string[] = Object.keys(structure);
            for (let j = 0; j < keys.length; ++j) {
              if (!structure[keys[j]]) continue;
              if (keys[j] === 'totalWinCash' || keys[j] === 'totalWinChip' || keys[j] === 'totalWin')
                statistical[keys[j]] += structure[keys[j]] > 0 ? 0 - structure[keys[j]] : Math.abs(structure[keys[j]]);
              else
                statistical[keys[j]] += structure[keys[j]];
            }
            val = { ...val, ...structure };
          }
        }
        // statistical.totalWin = statistical.totalWinChip + statistical.totalWinCash;
        statistical.washCodeCost = parseFloat(statistical.washCodeCost.toFixed(2));
        statistical.washCodeBalance = parseFloat(statistical.washCodeBalance.toFixed(2));

        statistical.earnings /= 100;
        let earnings = (statistical.totalWin * game_gold_multiple) - (statistical.washCodeCost * game_gold_multiple);
        statistical.companyEarnings = Math.abs(earnings) - Math.abs(statistical.earnings * game_gold_multiple);
        if (earnings < 0) statistical.companyEarnings = 0 - statistical.companyEarnings;
        statistical.companyEarnings /= game_gold_multiple;

        return statistical;
      });
  }

  async findSuperLoginTokenOne(where: any): Promise<any> {
    return this.superLoginTokenModel
      .findOne(where || {})
      .exec();
  }
  async createSuperLoginToken(arr: any[]): Promise<any> {
    return this.superLoginTokenModel.create(arr);
  }
  async updateSuperLoginToken(params: any, where: any): Promise<any> {
    return this.superLoginTokenModel
      .updateMany(params)
      .where(where)
      .exec();
  }
  async deleteSuperLoginToken(where?: any): Promise<any> {
    return this.superLoginTokenModel
      .deleteMany(where || {})
      .exec();
  }

  async findGuestCurrencyOne(where: any): Promise<any> {
    return this.guestCurrencyModel
      .findOne(where || {})
      .exec().then(rs => {
        if (!rs) return {
          chip: 0,
          borrowing: 0,
          washCode: 0,
          washCodeCost: 0
        };
        if (!rs.chip) rs.chip = 0;
        if (!rs.borrowing) rs.borrowing = 0;
        if (!rs.washCode) rs.washCode = 0;
        if (!rs.washCodeCost) rs.washCodeCost = 0;
        return rs;
      });
  }
  async updateGuestCurrency(params: any, where?: any): Promise<any> {
    return this.guestCurrencyModel
      .updateMany(params)
      .where(where || {})
      .setOptions({ upsert: true })
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
        match.$and = [...match.$and, { 'user.account': { $regex: eval(`/^${where.account}$/i`) } }]
      else match.$and = [{ 'user.account': { $regex: eval(`/^${where.account}$/i`) } }];
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
    console.log("match: ", match.$and);
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
          from: 'guest',
          localField: 'user',
          foreignField: '_id',
          pipeline: [
            { $project: { _id: 1, account: 1, xmRate: 1 }}
          ],
          as : 'user',
        }
      },
      { $match: match },
      { $sort: { createTimeDate: 1 } }
    ];
    let countPipeline = [...[], ...pipeline, { $count: 'count' }];
    if (!!offset) pipeline = [...pipeline, { $skip: offset }];
    if (!!limit) pipeline = [...pipeline, { $limit: limit }];
    return this.guestBetRecordModel.aggregate([{
      $facet: {
        list: pipeline,
        total: countPipeline,
      }
    }]).exec().then(async rs => {
      console.log("rs: ", rs);
      // rs = !!rs[0] ? rs : [{ list: [], total: [] }];
      return {
        list: rs[0].list.map(val => {
          val.user = val.user[0] || null!;
          val.table = val.table[0] || null!;
          return  val;
        }) || [],
        statistical: await this.findGuestBettingStatistics(where),
        total: rs[0].total.length === 0 ? 0 : rs[0].total[0].count
      }
    });
  }
  async findGuestBettingRecordOne(where: any): Promise<any> {
    return this.guestBetRecordModel
      .findOne(where)
      .populate('user')
      .populate('table')
      .exec();
  }
  async createGuestBettingRecord(arr: any[]): Promise<any> {
    return await this.guestBetRecordModel.create(arr);
  }
  async updateGuestBettingRecordOne(params: any, where: any): Promise<any> {
    return await this.guestBetRecordModel
      .updateOne(params)
      .where(where || {})
      .exec();
  }
  async updateGuestBettingRecordResult(tid: string, noRun: number, noActive: number, result: any): Promise<any> {
    const records: any[] = await this.guestBetRecordModel.find({
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

      let washCode: number = settleResult.washCode;
      let washCodeCost: number = 0;
      if (record.user.account !== 'sk')
        washCodeCost = (washCode * user.xmRate) / game_gold_multiple;

      console.log("产生洗码量: ", washCode);
      console.log("产生洗码费: ", washCodeCost);

      await this.updateGuestCurrency({
        $inc: {
          washCode: washCode - record.washCode,
          washCodeCost: washCodeCost - record.washCodeCost,
        }
      }, { user: user._id });

      record.washCode = washCode;
      record.washCodeCost = washCodeCost;

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
    return this.guestBetRecordModel.aggregate([
      {
        $lookup: {
          from: 'guest',
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
  async deleteGuestBettingRecord(ids: string[]): Promise<any> {
    let records = await this.guestBetRecordModel.find({
      _id: { $in: ids.map(id => new Types.ObjectId(id)) }
    }).exec();
    let ms = [];
    for (let i = 0; i < records.length; ++i) {
      const record = records[i];
      const washCode = record.washCode;
      const washCodeCost = record.washCodeCost;
      await this.updateGuestCurrency({
        $inc: { washCode: -washCode, washCodeCost: -washCodeCost }
      }, { user: record.user });
      ms = [...ms, {
        game: record.game, table: record.table,
        noRun: record.noRun, noActive: record.noActive,
        oldType: record.type, oldUser: record.user,
        oldResult: record.result,
        oldUserBetData: record.userBetData,
        oldUserBetMoney: record.userBetMoney,
        oldSettlementData: record.settlementData,
        oldSettlementMoney: record.settlementMoney,
      }]
      await record.deleteOne();
    }
    await this.createGuestBetModifyRecord(ms);
    return ;
  }

  async findGuestBetModifyRecord(offset: number, limit: number, where?: any): Promise<any> {
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
        match.$and = [...match.$and, { 'user.account': { $regex: eval(`/^${where.account}$/i`) } }]
      else match.$and = [{ 'user.account': { $regex: eval(`/^${where.account}$/i`) } }];
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
          from: 'guest',
          localField: 'oldUser',
          foreignField: '_id',
          pipeline: [
            { $project: { _id: 1, account: 1, xmRate: 1 }}
          ],
          as : 'oldUser',
        }
      },
      {
        $lookup: {
          from: 'guest',
          localField: 'newUser',
          foreignField: '_id',
          pipeline: [
            { $project: { _id: 1, account: 1, xmRate: 1 }}
          ],
          as : 'newUser',
        }
      },
      { $match: match },
      { $sort: { createTimeDate: 1 } }
    ];
    let countPipeline = [...[], ...pipeline, { $count: 'count' }];
    if (!!offset) pipeline = [...pipeline, { $skip: offset }];
    if (!!limit) pipeline = [...pipeline, { $limit: limit }];
    return this.guestBetModifyRecordModel.aggregate([{
      $facet: {
        list: pipeline,
        total: countPipeline,
      }
    }]).exec().then(async rs => {
      console.log("rs: ", rs);
      return {
        list: rs[0].list.map(val => {
          val.table = val.table ? val.table[0] : null!;
          val.oldUser = val.oldUser ? val.oldUser[0] :  null!;
          val.newUser = val.newUser ? val.newUser[0] :  null!;
          return  val;
        }) || [],
        total: rs[0].total.length === 0 ? 0 : rs[0].total[0].count
      }
    });
  }
  async createGuestBetModifyRecord(arr: any[]): Promise<any> {
    return await this.guestBetModifyRecordModel.create(arr.map(val => {
      if (!val.createTimeDate) val.createTimeDate = new Date();
      return val;
    }))
  }

  async findGuestBorrowingRecord(offset: number, limit: number, where?: any): Promise<any> {
    let match: any = {};
    if (!!where && !!where.account) {
      const user = await this.guestModel.findOne({
        account: { $regex: eval(`/^${where.account}$/i`) }
      });
      if (!user) return { total: 0, list: [] };
      match = { $and: [ { 'user.account': { $regex: eval(`/^${where.account}$/i`) } } ] }
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
          from: 'guest',
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
    return await this.guestBorrowingRecordModel
      .aggregate(pipeline)
      .exec()
      .then(async rs => {
        return {
          total: await this.guestBorrowingRecordModel.count().where(match).exec(),
          list: rs.map( val => {
            val.user = val.user[0] || null;
            return val;
          })
        }
      });
  }
  async createGuestBorrowingRecord(arr: any[]): Promise<any> {
    return await this.guestBorrowingRecordModel.create(arr);
  }

  async findGuestChipRecord(offset: number, limit: number, where?: any): Promise<any> {
    let match: any = {};
    if (!!where && !!where.account) {
      const user = await this.guestModel.findOne({
        account: { $regex: eval(`/^${where.account}$/i`) }
      });
      if (!user) return {total: 0, list: []};
      match = { $and: [ { 'user.account': { $regex: eval(`/^${where.account}$/i`) } } ] }
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
          from: 'guest',
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
    return this.guestModel.aggregate([
      { $match: where },
      {
        $lookup: {
          from: 'guest_chip_record',
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
    return this.guestModel.aggregate([
      { $match: match },
      // 全部洗码
      {
        $lookup: {
          from: 'guest_betting_record',
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
          from: 'guest_settlement_record',
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
        xmRate: rs[0].xmRate,
        allWashCode: allWashCodeInfo ? allWashCodeInfo.washCode : 0,
        allWashCodeCost: allWashCodeInfo ? allWashCodeInfo.washCodeCost : 0,
        settleWashCode: settleWashCodeInfo ? settleWashCodeInfo.washCode : 0,
        settleWashCodeCost: settleWashCodeInfo ? settleWashCodeInfo.washCodeCost : 0
      };
    })
  }
  async createGuestUserSettlement(arr): Promise<any> {
    return await this.tableGuestSettlementRecordModel.create(arr.map(val => {
      val.createTimeDate = new Date();
      return val;
    }));
  }

  async findGuestUserSettlementRecord(offset: number, limit: number, where?: any): Promise<any> {
    let match: any = {};
    if (!!where && !!where.account) {
      const user = await this.guestModel.findOne({
        account: { $regex: eval(`/^${where.account}$/i`) }
      });
      if (!user) return { list: [], total: 0 };
      match = {
        $and: [ { 'user.account': { $regex: eval(`/^${where.account}$/i`) } } ]
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
          from: 'guest',
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
    return this.tableGuestSettlementRecordModel
      .aggregate(pipeline)
      .exec().then(async rs => {
        return {
          list: rs.map(val => {
            val.user = val.user[0];
            return val;
          }),
          total: await this.tableGuestSettlementRecordModel.count(match),
        }
      });
  }
  async findGuestUserSettlementStatistics(where?: any): Promise<any> {
    let match: any = {};
    if (!!where && !!where.account) {
      const user = await this.guestModel.findOne({
        account: { $regex: eval(`/^${where.account}$/i`) }
      });
      if (!user) return { list: [], total: 0 };
      match = {
        $and: [ { 'user.account': { $regex: eval(`/^${where.account}$/i`) } } ]
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
          from: 'guest',
          localField: 'user',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $match: match },
      {
        $group: {
          _id: null,
          totalWashCode: { $sum: '$washCode' },
          totalWashCodeCost: { $sum: '$washCodeCost' },
        }
      }
    ];
    return this.tableGuestSettlementRecordModel
      .aggregate(pipeline)
      .exec().then(async rs => {
        console.log("rs: ", rs);
        let statistics = { totalWashCode: 0, totalWashCodeCost: 0 }
        for (let i = 0; i < rs.length; ++i) {
          statistics.totalWashCode += rs[i].totalWashCode;
          statistics.totalWashCodeCost += rs[i].totalWashCodeCost;
        }
        return statistics;
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
      return val;
    }));
  }
  async updateAdminUser(params: any, where?: any): Promise<any> {
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

  /** @description 添加投注订单 */
  public async addBettingBill(
    tid: string, game: string, result: any,
    noRun: number, noActive: number, bills: any[],
    session?: any
  ): Promise<any> {

  }
  /** @description 计算结果 */
  calculateResult(result: any, data: any, isSanKe?: boolean) {
    let userBetMoney: number = 0;
    let validBetMoney: number = 0;
    let settlementData: any = {};
    let settlementMoney: number = 0;

    let water: number = 0.00;
    let washCode: number = 0.00;

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

          let tempWater: number = 0;
          let money: number = data[k] < 100 ? sk : member;
          if (data[k] >= 100 && sk - member !== 0) {
            let smallMoney: number = data[k] - (Math.floor(data[k] / 100) * 100);
            let multiple: number = game_area_multiple[k] * game_gold_multiple;
            let afterMoney = (data[k] - smallMoney) * multiple;
            money = afterMoney / game_gold_multiple + smallMoney;

            tempWater = sk - money;
          }
          water += tempWater;
          washCode += data[k] >= 100 ? Math.floor((data[k] - tempWater) / 100) * 100 : 0;

          settlementMoney += money;
          settlementData[k] = money;
        }
      } else {
        settlementMoney += -data[k];
        settlementData[k] = -data[k];
        if (!isSanKe && data[k] >= 100)
          washCode += Math.floor(data[k] / 100) * 100;
      }
    }
    return { userBetMoney,  validBetMoney, settlementMoney, settlementData, water, washCode }
  }
  /** @description 重构会员 */
  toGuestMemberStructure(member: any): any {
    let info: any = {
      outChip: 0, intoChip: 0, totalWin: 0,
      totalWinCash: 0, totalWinChip: 0,
      washCode: 0, washCodeCost: 0,
      totalBet: 0, validBet: 0,
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
    for (let i = 0; i < member.betRecords.length; ++i) {
      let record = member.betRecords[i];
      info.washCode += record.washCode || 0;
      info.washCodeCost += record.washCodeCost || 0;
      info.totalBet += record.userBetMoney || 0;
      info.validBet += record.validBetMoney || 0;
      if (record.type === GAME_MONEY_TYPE.CASH)
        info.totalWinCash += record.settlementMoney || 0;
      if (record.type === GAME_MONEY_TYPE.CHIP)
        info.totalWinChip += record.settlementMoney || 0;
      if (record.settlementMoney > 0)
        info[`${record.game}Win`] += Math.abs(record.settlementMoney) || 0;
      else
        info[`${record.game}Lose`] += Math.abs(record.settlementMoney) || 0;
      info[`${record.game}Water`] += record.settlementMoney || 0;
    }

    info.totalWin = info.totalWinCash + info.totalWinChip;

    info.chip = member.currency[0] ? (member.currency[0].chip || 0) : 0;
    info.borrowing = member.currency[0] ? (member.currency[0].borrowing || 0) : 0;
    info.notSettleWashCode = member.currency[0] ? (member.currency[0].washCode || 0) : 0;
    info.washCodeBalance = member.currency[0] ? (member.currency[0].washCodeCost || 0) : 0;
    return info;
  }
}
