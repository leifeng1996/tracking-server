import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AdminUserDocument } from '../../schemas/admin_user.schema';
import { AdminMenuDocument } from '../../schemas/admin_menu.schema';
import { AdminRoleDocument } from '../../schemas/admin_role.schema';
import { AdminPermissionDocument } from '../../schemas/admin_permission.schema';
import { AdminRoleMenuDocument } from '../../schemas/admin_role_menu';
import { AdminRolePermissionDocument } from '../../schemas/admin_role_permission';
import { TableDocument } from '../../schemas/table.schema';
import {
  CALCULATE_RESULT_GAME,
  GAME_CHIP_RECORD_TYPE,
  game_gold_multiple,
  GAME_NAME,
  game_ratio_multiple,
} from '../../constant/game.constant';
import { TableGuestBettingDocument } from '../../schemas/table_guest_betting.schema';
import { TableGuestBorrowingDocument } from '../../schemas/table_guest_borrowing.schema';
import { TableGuestCurrencyDocument } from '../../schemas/table_guest_currency.schema';
import { TableGuestChipRecordDocument } from '../../schemas/table_guest_chip.schema';
import { AdminUserRoleDocument } from '../../schemas/admin_user_role';
import { TableSettlementDocument } from '../../schemas/table_settlement.schema';
import { TableGuestSettlementDocument } from '../../schemas/table_guest_settlement.schema';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel('AdminUser') private adminUserModel: Model<AdminUserDocument>,
    @InjectModel('AdminMenu') private adminMenuModel: Model<AdminMenuDocument>,
    @InjectModel('AdminRole') private adminRoleModel: Model<AdminRoleDocument>,
    @InjectModel('AdminPermission') private adminPermissionModel: Model<AdminPermissionDocument>,
    @InjectModel('AdminRoleMenu') private adminRoleMenuModel: Model<AdminRoleMenuDocument>,
    @InjectModel('AdminRolePermission') private adminRolePermissionModel: Model<AdminRolePermissionDocument>,

    @InjectModel('Table') private tableModel: Model<TableDocument>,
    @InjectModel('TableUser') private tableUserModel: Model<TableDocument>,
    @InjectModel('TableSettlement') private tableSettlementModel: Model<TableSettlementDocument>,

    @InjectModel('TableGuest') private tableGuestModel: Model<TableDocument>,
    @InjectModel('TableGuestBetting') private tableGuestBetting: Model<TableGuestBettingDocument>,
    @InjectModel('TableGuestCurrency') private tableGuestCurrencyModel: Model<TableGuestCurrencyDocument>,
    @InjectModel('TableGuestBorrowing') private tableGuestBorrowingModel: Model<TableGuestBorrowingDocument>,
    @InjectModel('TableGuestChipRecord') private tableGuestChipRecordModel: Model<TableGuestChipRecordDocument>,
    @InjectModel('AdminUserRole') private adminUserRoleModel: Model<AdminUserRoleDocument>,
    @InjectModel('TableGuestSettlement') private tableGuestSettlementModel: Model<TableGuestSettlementDocument>,
  ) { }

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
  async createAdminUser(arr): Promise<any> {
    return this.adminUserModel.create(arr.map(val => {
      val.createTimeDate = new Date();
      val.modifyTimeDate = new Date();
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
  async deleteAdminUser(ids: any): Promise<any> {
    ids = ids.map(id => new Types.ObjectId(id));
    await this.adminUserModel
      .deleteMany({ _id: { $in: ids } } )
      .exec();
    await this.adminUserRoleModel
      .deleteMany({ user: { $in: ids }})
      .exec();
    return true;
  }
  async findAdminMenu(): Promise<any> {
    return this.adminMenuModel.find().exec();
  }
  async createMenu(menu): Promise<any> {
    return this.adminMenuModel.create(menu);
  }
  async updateMenu(menu): Promise<any> {
    const _id: Types.ObjectId = new Types.ObjectId(menu.id);
    delete menu.id;
    return this.adminMenuModel.updateOne(menu).where({ _id }).exec();
  }
  async deleteMenu(id: string): Promise<any> {
    await this.adminMenuModel.deleteOne({
      _id: new Types.ObjectId(id)
    }).exec();
    return;
  }
  async deleteMenuMultiple(ids: any[]): Promise<any> {
    ids = ids.map(id => new Types.ObjectId(id));
    // 删除菜单
    await this.adminMenuModel.deleteMany({
      $or: [
        { _id: { $in: ids } },
        { parent: { $in: ids }}
      ]
    }).exec();
    // 删除权限
    // 删除角色绑定菜单
    // 删除角色绑定权限
    return;
  }

  async findAdminPermission(): Promise<any> {
    return await this.adminPermissionModel.find().exec();
  }
  async createAdminPermission(arr): Promise<any> {
    return await this.adminPermissionModel.create(arr);
  }
  async updateAdminPermission(params: any): Promise<any> {
    const id: Types.ObjectId = new Types.ObjectId(params.id);
    delete params.id;
    return await this.adminPermissionModel.updateOne(params).where({
      _id: new Types.ObjectId(id)
    }).exec();
  }
  async deleteAdminPermission(id: string): Promise<any> {
    return await this.adminPermissionModel.deleteOne({
      _id: new Types.ObjectId(id)
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
  async findAdminRoleById(id: string): Promise<any> {
    return await this.adminRoleModel.aggregate([
      { $match: { _id: new Types.ObjectId(id) }},
      {
        $lookup: {
          from: 'admin_role_menu',
          localField: '_id',
          foreignField: 'role',
          as : 'inventoryMenu'
        }
      },/*
      {
        $lookup: {
          from: 'admin_menu',
          localField: 'inventoryMenu.menu',
          foreignField: '_id',
          as : 'menuDetail'
        }
      }*/
      {
        $lookup: {
          from: 'admin_role_permission',
          localField: '_id',
          foreignField: 'role',
          as : 'inventoryPermission'
        }
      },/*
      {
        $lookup: {
          from: 'admin_permission',
          localField: 'inventoryPermission.permission',
          foreignField: '_id',
          as : 'permissionDetail'
        }
      }*/
    ]).exec().then( rs => {
      console.log("rs: ", rs);
      return rs;
    })
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
  async deleteAdminRole(where: any): Promise<any> {
    return await this.adminRoleModel
      .deleteMany(where)
      .exec();
  }
  async deleteAdminRoleMultiple(ids: any[]): Promise<any> {
    ids = ids.map(id => new Types.ObjectId(id));
    return await this.adminRoleModel.deleteMany({
      _id: { $in: ids }
    }).exec();
  }

  async createAdminRoleMenu(arr: any): Promise<any> {
    return await this.adminRoleMenuModel.create(arr);
  }
  async deleteAdminRoleMenu(rid: string, ids: string[]): Promise<any> {
    return await this.adminRoleMenuModel.deleteMany({
      $and: [{
        role: new Types.ObjectId(rid),
        menu: { $in: ids.map(id => new Types.ObjectId(id)) }
      }]
    }).exec();
  }
  async createAdminRolePermission(arr: any): Promise<any> {
    return await this.adminRolePermissionModel.create(arr);
  }
  async deleteAdminRolePermission(rid: string, ids: string[]): Promise<any> {
    return await this.adminRolePermissionModel.deleteMany({
      $and: [{
        role: new Types.ObjectId(rid),
        permission: { $in: ids.map(id => new Types.ObjectId(id)) }
      }]
    }).exec();
  }

  async createAdminUserRole(arr: any): Promise<any> {
    return await this.adminUserRoleModel.create(arr);
  }
  async deleteAdminUserRole(uid, ids: string[]): Promise<any> {
    return this.adminUserRoleModel.deleteMany({
      $and: [
        { user: new Types.ObjectId(uid) },
        { role: { $in: ids.map(id => new Types.ObjectId(id)) }}
      ]
    }).exec();
  }

  async findTable(): Promise<any> {
    return await this.tableModel.find().exec();
  }
  async createTable(params): Promise<any> {
    return await this.tableModel.create(params);
  }
  async updateTable(params): Promise<any> {
    const _id = new Types.ObjectId(params.id);
    delete params.id;
    return await this.tableModel.updateOne(params).where({
      _id
    }).exec();
  }
  async deleteTable(ids): Promise<any> {
    ids = ids.map(id => new Types.ObjectId(id));
    return await this.tableModel.deleteMany({
      _id: { $in: ids }
    }).exec();
  }

  async findTableUser(): Promise<any> {
    return await this.tableUserModel.find()
      .populate('table', '_id game tableNum')
      .exec().then(rs => {
        return rs;
      });
  }
  async findTableUserOne(where?: any): Promise<any> {
    return await this.tableUserModel.findOne(where || {})
      .populate('table', '_id game tableNum')
      .exec();
  }
  async createTableUser(arr): Promise<any> {
    return await this.tableUserModel.create(arr);
  }
  async updateTableUser(params, where?: any): Promise<any> {
    return await this.tableUserModel
      .updateOne(params)
      .where(where || {})
      .exec();
  }
  async deleteTableUser(ids): Promise<any> {
    ids = ids.map(id => new Types.ObjectId(id));
    return await this.tableUserModel.deleteMany({
      _id: { $in: ids }
    }).exec();
  }

  async findGuestUser(where?: any): Promise<any> {
    return this.tableGuestModel.find(where || {}).exec();
  }
  async findGuestUserOne(where: any): Promise<any> {
    return this.tableGuestModel.findOne(where).exec();
  }
  async findGuestUserPlus(offset: number, limit: number, where?: any): Promise<any> {
    let match: any = {};
    let pipelineMatch: any = {};
    if (!!where && !!where.account) {
      const user = await this.tableGuestModel.findOne({
        account: where.account
      });
      if (!user) return [];
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

    let pipeline = [
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
            { $match: { type: GAME_CHIP_RECORD_TYPE.OUT }},
            { $group: {
                _id: 'outChip',
                value: {
                  $sum: '$money',
                },
              }
            },
            { $project: { _id: 0 } }
          ],
          as : 'outChip'
        }
      },
      {
        $lookup: {
          from: 'table_guest_chip_record',
          localField: '_id',
          foreignField: 'user',
          pipeline: [
            { $match: { type: GAME_CHIP_RECORD_TYPE.INTO }},
            { $group: {
                _id: 'intoChip',
                value: {
                  $sum: '$money',
                },
              }
            },
            { $project: { _id: 0 } }
          ],
          as : 'intoChip'
        }
      },
      // 全部洗码
      {
        $lookup: {
          from: 'table_guest_betting',
          localField: '_id',
          foreignField: 'user',
          pipeline: [
            {
              $group: {
                _id: 'allWashCode',
                value: {
                  $sum: '$validBetMoney',
                },
              }
            },
            { $project: { _id: 0 } }
          ],
          as : 'allWashCode'
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
                _id: 'settleWashCode',
                value: {
                  $sum: '$washCode',
                },
              }
            },
            { $project: { _id: 0 } }
          ],
          as : 'settleWashCode'
        }
      },
      // 现金总输赢
      {
        $lookup: {
          from: 'table_guest_betting',
          localField: '_id',
          foreignField: 'user',
          pipeline: [
            { $match: {...{ type: 0 }, ...pipelineMatch} },
            {
              $group: {
                _id: 'totalWinCash',
                value: {
                  $sum: '$settlementMoney',
                },
              }
            },
            { $project: { _id: 0 } }
          ],
          as : 'totalWinCash'
        }
      },
      // 筹码总输赢
      {
        $lookup: {
          from: 'table_guest_betting',
          localField: '_id',
          foreignField: 'user',
          pipeline: [
            { $match: {...{ type: 1 }, ...pipelineMatch} },
            {
              $group: {
                _id: 'totalWinChip',
                value: {
                  $sum: '$settlementMoney',
                },
              }
            },
            { $project: { _id: 0 } }
          ],
          as : 'totalWinChip'
        }
      },
      // 总投注
      {
        $lookup: {
          from: 'table_guest_betting',
          localField: '_id',
          foreignField: 'user',
          pipeline: [
            { $match: pipelineMatch },
            {
              $group: {
                _id: 'totalBet',
                value: {
                  $sum: '$userBetMoney',
                },
              }
            },
            { $project: { _id: 0 } }
          ],
          as : 'totalBet'
        }
      },
      // 有效投注
      {
        $lookup: {
          from: 'table_guest_betting',
          localField: '_id',
          foreignField: 'user',
          pipeline: [
            { $match: pipelineMatch },
            {
              $group: {
                _id: 'validBet',
                value: {
                  $sum: '$validBetMoney',
                },
              }
            },
            { $project: { _id: 0 } }
          ],
          as : 'validBet'
        }
      }
    ];
    for (let k in GAME_NAME) {
      pipeline = [...pipeline,
        {
          $lookup: {
            from: 'table_guest_betting',
            localField: '_id',
            foreignField: 'user',
            pipeline: [
              { $match: {...{ game: k, settlementMoney: { $gte: 0 } }, ...pipelineMatch} },
              {
                $group: {
                  _id: `${k}Win`,
                  value: {
                    $sum: '$settlementMoney',
                  },
                }
              },
              { $project: { _id: 0 } }
            ],
            as : `${k}Win`
          }
        },
        {
          $lookup: {
            from: 'table_guest_betting',
            localField: '_id',
            foreignField: 'user',
            pipeline: [
              { $match: {...{ game: k, settlementMoney: { $lte: 0 } }, ...pipelineMatch} },
              {
                $group: {
                  _id: `${k}Lose`,
                  value: {
                    $sum: '$settlementMoney',
                  },
                }
              },
              { $project: { _id: 0 } }
            ],
            as: `${k}Lose`
          }
        }];
    }
    return await this.tableGuestModel.aggregate([...[{ $match: match}], ...pipeline,
      {
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
      // 取出掉password
      {
        $project: {
          password: 0
        }
      },
      { $sort: { level: 1, _id: 1 } },
      { $skip: offset },
      { $limit: limit }
    ]).exec().then(async rs => {
      const statistical = await this.tableGuestModel.aggregate([...[{ $match: match}], ...pipeline,
        {
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
        }
      ]).exec().then(rs => {
        let values = {
          outChip: 0, intoChip: 0, totalWinCash: 0, totalWinChip: 0,
          totalBet: 0, validBet: 0, washCodeCost: 0, notSettleWashCode: 0,
          washCodeBalance: 0, totalWin: 0, chip: 0, borrowing: 0, companyEarnings: 0,
          shareEarnings: 0
        }
        for (let k in GAME_NAME) {
          values[`${k}Win`] = 0;
          values[`${k}Lose`] = 0
          values[`${k}Water`] = 0
        }
        for (let i = 0; i < rs.length; ++i) {
          let val = rs[i];
          if (val.level === 2) {
            val.outChip = val.outChip[0] ? val.outChip[0].value : 0;
            const intoChip = val.intoChip[0] ? val.intoChip[0].value : 0;
            val.intoChip = intoChip - val.outChip;

            val.totalWinCash = val.totalWinCash[0] ? val.totalWinCash[0].value : 0;
            val.totalWinChip = val.totalWinChip[0] ? val.totalWinChip[0].value : 0;

            val.totalBet = val.totalBet[0] ? val.totalBet[0].value : 0;
            val.validBet = val.validBet[0] ? val.validBet[0].value : 0;

            for (let k in GAME_NAME) {
              val[`${k}Win`] = val[`${k}Win`][0] ? val[`${k}Win`][0].value : 0;
              val[`${k}Lose`] = val[`${k}Lose`][0] ? val[`${k}Lose`][0].value : 0;
              val[`${k}Water`] = val[`${k}Win`] - Math.abs(val[`${k}Lose`]);
            }

            val.washCodeCost = (val.validBet * (val.ratio * game_gold_multiple) / game_ratio_multiple) / game_ratio_multiple;
            const allWashCode = val.allWashCode[0] ? val.allWashCode[0].value : 0;
            const settleWashCode = val.settleWashCode[0] ? val.settleWashCode[0].value : 0;

            val.notSettleWashCode = parseFloat((allWashCode - settleWashCode).toFixed(2));
            val.washCodeBalance = (val.notSettleWashCode * val.ratio);
            val.washCodeBalance = parseFloat((val.washCodeBalance / game_ratio_multiple).toFixed(2))
            val.totalWin = val.totalWinCash + val.totalWinChip;

            val.chip = val.currency[0] ? (val.currency[0].chip || 0): 0;
            val.borrowing = val.currency[0] ? (val.currency[0].borrowing || 0) : 0;

            for (let k in values)
              if (!isNaN(val[k]))
                values[k] += val[k];
          } else {
            val.totalWinCash = 0;val.totalWinChip = 0;
            val.totalBet = 0;val.validBet = 0;
            val.washCodeCost = 0;val.shareEarnings = 0;
            val.companyEarnings = 0;val.notSettleWashCode = 0;
            val.washCodeBalance = 0;val.outChip = 0; val.intoChip = 0;
            for (let i = 0; i < val.team.length; ++i) {
              const info = val.team[i];
              for (let k in info) {
                if (k === 'ratio') continue;
                if (i === 0) val[k] = 0;
                if (!info[k][0] || !info[k][0].value) continue;
                val[k] += Number(info[k][0].value);
                if (k === 'currency') {
                  val.chip += info.currency[0] ? (info.currency[0].chip || 0): 0;
                  val.borrowing += info.currency[0] ? (info.currency[0].borrowing || 0) : 0;
                }
                if (k === 'out') {
                  const outChip = info.outChip[0] ? info.outChip[0].value : 0;
                  const intoChip = info.intoChip[0] ? info.intoChip[0].value : 0;
                  val.intoChip += intoChip - outChip;
                }

                if (k === 'validBet') {
                  let cost: number = (info[k][0].value * (info.ratio * game_gold_multiple)) / game_ratio_multiple;
                  if (isNaN(val.washCodeCost))
                    val.washCodeCost = cost;
                  else
                    val.washCodeCost += cost;
                }
              }

              const allWashCode = info.allWashCode[0] ? info.allWashCode[0].value : 0;
              const settleWashCode = info.settleWashCode[0] ? info.settleWashCode[0].value : 0;
              val.notSettleWashCode += allWashCode - settleWashCode;
              val.washCodeBalance += ((allWashCode - settleWashCode) * info.ratio) || 0;
            }
            val.washCodeCost = parseFloat((val.washCodeCost / game_gold_multiple).toFixed(2))

            val.washCodeBalance = parseFloat((val.washCodeBalance / game_ratio_multiple).toFixed(2));
            val.notSettleWashCode = parseFloat(val.notSettleWashCode.toFixed(2));

            val.totalWin = val.totalWinCash + val.totalWinChip;
            let earnings = Math.abs(val.totalWin * 1000) - (val.washCodeCost * 1000);

            for (let k in GAME_NAME) {
              console.log("type: ", typeof val[`${k}Win`])
              if (typeof val[`${k}Win`] === 'object')
                val[`${k}Win`] = 0;
              if (typeof val[`${k}Lose`] === 'object')
                val[`${k}Lose`] = 0;
              val[`${k}Water`] = val[`${k}Win`] - Math.abs(val[`${k}Lose`]);
              if (CALCULATE_RESULT_GAME.indexOf(k) !== -1) continue;
              earnings -= val[`${k}Water`] * game_gold_multiple;
            }

            val.shareEarnings = parseFloat((((earnings * val.share) / 100) / 1000).toFixed(2));
            val.companyEarnings = parseFloat((((earnings * (100 - val.share)) / 100) / 1000).toFixed(2));
            if (val.totalWin > 0) {
              val.shareEarnings = 0 - val.shareEarnings;
              val.companyEarnings = 0 - val.companyEarnings;
            }
            values.shareEarnings += val.shareEarnings;
            values.companyEarnings += val.companyEarnings;
          }
        }
        return values;
      });
      return {
        statistical,
        total: await this.tableGuestModel.count().where(match),
        list: rs.map(val => {
          if (val.level === 2) {
            val.outChip = val.outChip[0] ? val.outChip[0].value : 0;
            const intoChip = val.intoChip[0] ? val.intoChip[0].value : 0;
            val.intoChip = intoChip - val.outChip;

            val.totalWinCash = val.totalWinCash[0] ? val.totalWinCash[0].value : 0;
            val.totalWinChip = val.totalWinChip[0] ? val.totalWinChip[0].value : 0;

            val.totalBet = val.totalBet[0] ? val.totalBet[0].value : 0;
            val.validBet = val.validBet[0] ? val.validBet[0].value : 0;

            for (let k in GAME_NAME) {
              val[`${k}Win`] = val[`${k}Win`][0] ? val[`${k}Win`][0].value : 0;
              val[`${k}Lose`] = val[`${k}Lose`][0] ? val[`${k}Lose`][0].value : 0;
              val[`${k}Water`] = val[`${k}Win`] - Math.abs(val[`${k}Lose`]);
            }

            val.washCodeCost = (val.validBet * (val.ratio * game_gold_multiple) / game_ratio_multiple) / game_ratio_multiple;
            const allWashCode = val.allWashCode[0] ? val.allWashCode[0].value : 0;
            const settleWashCode = val.settleWashCode[0] ? val.settleWashCode[0].value : 0;

            val.notSettleWashCode = parseFloat((allWashCode - settleWashCode).toFixed(2));
            val.washCodeBalance = (val.notSettleWashCode * val.ratio);
            val.washCodeBalance = parseFloat((val.washCodeBalance / game_ratio_multiple).toFixed(2))
            val.totalWin = val.totalWinCash + val.totalWinChip;

            val.chip = val.currency[0] ? (val.currency[0].chip || 0): 0;
            val.borrowing = val.currency[0] ? (val.currency[0].borrowing || 0) : 0;
          } else {
            val.totalWinCash = 0;val.totalWinChip = 0;
            val.totalBet = 0;val.validBet = 0;
            val.washCodeCost = 0;val.shareEarnings = 0;
            val.companyEarnings = 0;val.notSettleWashCode = 0;
            val.washCodeBalance = 0;val.outChip = 0; val.intoChip = 0;
            for (let i = 0; i < val.team.length; ++i) {
              const info = val.team[i];
              for (let k in info) {
                if (k === 'ratio') continue;
                if (i === 0) val[k] = 0;
                if (!info[k][0] || !info[k][0].value) continue;
                val[k] += Number(info[k][0].value);
                if (k === 'currency') {
                  val.chip += info.currency[0] ? (info.currency[0].chip || 0): 0;
                  val.borrowing += info.currency[0] ? (info.currency[0].borrowing || 0) : 0;
                }
                if (k === 'out') {
                  const outChip = info.outChip[0] ? info.outChip[0].value : 0;
                  const intoChip = info.intoChip[0] ? info.intoChip[0].value : 0;
                  val.intoChip += intoChip - outChip;
                }

                if (k === 'validBet') {
                  let cost: number = (info[k][0].value * (info.ratio * game_gold_multiple)) / game_ratio_multiple;
                  if (isNaN(val.washCodeCost))
                    val.washCodeCost = cost;
                  else
                    val.washCodeCost += cost;
                }
              }

              const allWashCode = info.allWashCode[0] ? info.allWashCode[0].value : 0;
              const settleWashCode = info.settleWashCode[0] ? info.settleWashCode[0].value : 0;
              val.notSettleWashCode += allWashCode - settleWashCode;
              val.washCodeBalance += ((allWashCode - settleWashCode) * info.ratio) || 0;
            }
            val.washCodeCost = parseFloat((val.washCodeCost / game_gold_multiple).toFixed(2))

            val.washCodeBalance = parseFloat((val.washCodeBalance / game_ratio_multiple).toFixed(2));
            val.notSettleWashCode = parseFloat(val.notSettleWashCode.toFixed(2));

            val.totalWin = val.totalWinCash + val.totalWinChip;
            let earnings = Math.abs(val.totalWin * 1000) - (val.washCodeCost * 1000);

            for (let k in GAME_NAME) {
              console.log("type: ", typeof val[`${k}Win`])
             if (typeof val[`${k}Win`] === 'object')
               val[`${k}Win`] = 0;
              if (typeof val[`${k}Lose`] === 'object')
                val[`${k}Lose`] = 0;
              val[`${k}Water`] = val[`${k}Win`] - Math.abs(val[`${k}Lose`]);
              if (CALCULATE_RESULT_GAME.indexOf(k) !== -1) continue;
              earnings -= val[`${k}Water`] * game_gold_multiple;
            }

            val.shareEarnings = parseFloat((((earnings * val.share) / 100) / 1000).toFixed(2));
            val.companyEarnings = parseFloat((((earnings * (100 - val.share)) / 100) / 1000).toFixed(2));
            if (val.totalWin > 0) {
              val.shareEarnings = 0 - val.shareEarnings;
              val.companyEarnings = 0 - val.companyEarnings;
            }
            delete val.team;
          }
          return val;
        })
      }
    });
  }
  async createGuestUser(arr: any): Promise<any> {
    return await this.tableGuestModel.create(arr);
  }
  async updateGuestUser(params: any, where?: any): Promise<any> {
    return this.tableGuestModel.updateMany(params).where(where).exec();
  }
  async deleteGuestUser(ids: any[]): Promise<any> {
    ids = ids.map(id => new Types.ObjectId(id));
    return await this.tableGuestModel.deleteMany({
      _id: { $in: ids }
    }).exec();
  }

  async findTableGuestCurrencyOne(id: string): Promise<any> {
    return await this.tableGuestCurrencyModel.findOne({
      user: new Types.ObjectId(id)
    }).exec().then(rs => {
      console.log("rs: ", rs);
      if (!rs) return { chip: 0, borrowing: 0 };
      if (!rs.chip) rs.chip = 0;
      if (!rs.borrowing) rs.borrowing = 0;
      return rs;
    });
  }
  async updateTableGuestCurrency(params: any, where?: any): Promise<any> {
    return await this.tableGuestCurrencyModel
      .updateOne(params)
      .setOptions({ upsert: true, new: true, setDefaultsOnInsert: true })
      .where(where || {})
      .exec();
  }

  async findChipOutMoney(id: string): Promise<any> {
    return this.tableGuestModel.aggregate([
      { $match: { _id: new Types.ObjectId(id)}},
      {
        $lookup: {
          from: 'table_guest_chip_record',
          localField: '_id',
          foreignField: 'user',
          pipeline: [
            { $match: { type: GAME_CHIP_RECORD_TYPE.OUT }},
            { $group: {
                _id: 'money',
                value: {
                  $sum: '$money',
                },
              }
            },
            { $project: { _id: 0 } }
          ],
          as : 'outMoney'
        }
      }
    ]).exec().then(rs => {
      if (
        !rs || rs.length === 0 ||
        !rs[0].outMoney || rs[0].outMoney.length === 0
      ) return 0;
      return rs[0].outMoney[0].value;
    })
  }
  async findChipIntoMoney(id: string): Promise<any> {
    return this.tableGuestModel.aggregate([
      { $match: { _id: new Types.ObjectId(id)}},
      {
        $lookup: {
          from: 'table_guest_chip_record',
          localField: '_id',
          foreignField: 'user',
          pipeline: [
            { $match: { type: GAME_CHIP_RECORD_TYPE.INTO }},
            { $group: {
                _id: 'money',
                value: {
                  $sum: '$money',
                },
              }
            },
            { $project: { _id: 0 } }
          ],
          as : 'intoMoney'
        }
      }
    ]).exec().then(rs => {
      if (
        !rs || rs.length === 0 ||
        !rs[0].intoMoney || rs[0].intoMoney.length === 0
      ) return 0;
      return rs[0].intoMoney[0].value;
    })
  }
  async findTableGuestChipRecord(offset: number, limit: number, where?: any): Promise<any> {
    let match: any = {};
    if (!!where && !!where.account) {
      const user = await this.tableGuestModel.findOne({
        account: where.account
      });
      if (!user) return [];
      match = { $and: [ { 'user.account': where.account } ] }
    }

    if (!!where && !isNaN(where.type)) {
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
    return await this.tableGuestChipRecordModel.aggregate([
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
      { $skip: offset },
      { $limit: limit }
    ]).exec().then(async rs => {
      return {
        total: await this.tableGuestChipRecordModel.count().where(match).exec(),
        list: rs.map( val => {
          val.user = val.user[0] || null;
          return val;
        })
      }
    });
  }
  async createTableGuestChipRecord(arr: any[]): Promise<any> {
    return await this.tableGuestChipRecordModel.create(arr);
  }

  async findTableGuestBorrowing(offset: number, limit: number, where?: any): Promise<any> {
    let match: any = {};
    if (!!where && !!where.account) {
      const user = await this.tableGuestModel.findOne({
        account: where.account
      });
      if (!user) return [];
      match = { $and: [ { account: where.account } ] }
    }

    if (!!where && !isNaN(where.type)) {
      if (!!match.$and)
        match.$and = [...match.$and, where.type === 1 ? { money: { $gte: 0 } } : { money: { $lte: 0 } }]
      else match.$and = [where.type === 1 ? { money: { $gte: 0 } } : { money: { $lte: 0 } }];
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
    return await this.tableGuestBorrowingModel.aggregate([
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
      { $skip: offset },
      { $limit: limit }
    ]).exec().then(async rs => {
      return {
        total: await this.tableGuestBorrowingModel.count().where(match).exec(),
        list: rs.map( val => {
          val.user = val.user[0] || null;
          return val;
        })
      }
    });
  }
  async createTableGuestBorrowing(arr: any[]): Promise<any> {
    return await this.tableGuestBorrowingModel.create(arr);
  }

  async findGuestBetting(where?: any): Promise<any> {
    return this.tableGuestBetting
      .find(where || {})
      .populate('user')
      .populate('table')
      .exec();
  }
  async findGuestBettingOne(where: any): Promise<any> {
    return this.tableGuestBetting
      .findOne(where)
      .populate('user')
      .populate('table')
      .exec();
  }
  async findGuestBettingPage(offset: number, limit: number, where?: any): Promise<any> {
    let match: any = { };
    console.log("where: ", where);
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
    return this.tableGuestBetting.aggregate([
      {
        $lookup: {
          from: 'table',
          localField: 'table',
          foreignField: '_id',
          // pipeline: [
          //   { $project: { _id: false, tableNum: true }}
          // ],
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
      { $sort: { _id: -1 } },
      { $skip: offset },
      { $limit: limit }
    ]).exec().then(async rs => {
      const statistical = await this.tableGuestBetting.aggregate([
        { $match: match },
        {
          $lookup: {
            from: 'table_guest',
            localField: 'user',
            foreignField: '_id',
            as: 'guests'
          }
        },
        {
          $project: {
            _id: 0, type: 1,
            userBetMoney: 1, settlementMoney: 1,
            validBetMoney: 1, waterMoney: {
              $multiply: [ '$validBetMoney',  game_ratio_multiple, 0.009 ],
            }
          }
        },
        {
          $group: {
            _id: { type: '$type' },
            betMoney: { $sum: '$userBetMoney' },
            settlementMoney: { $sum: '$settlementMoney' },
            waterMoney: { $sum: '$waterMoney'}
          }
        }
      ]).exec().then(async rs => {
        let obj = { betMoney: 0, cashMoney: 0, chipMoney: 0, waterMoney: 0 };
        for (let i = 0; i < rs.length; ++i) {
          let item = rs[i];
          obj.betMoney += item.betMoney;
          if (item._id.type === 0) {
            obj.waterMoney += item.waterMoney;
            obj.cashMoney += item.settlementMoney;
          } else {
            obj.waterMoney += item.waterMoney;
            obj.chipMoney += item.settlementMoney;
          }
        }
        obj.waterMoney /= game_ratio_multiple;
        return obj;
      });
      return {
        statistical,
        total: await this.tableGuestBetting.count(match),
        list: rs.map(val => {
          val.user = val.user[0] || null!;
          val.table = val.table[0] || null!;
          return  val;
        })
      }
    });
  }

  async findTableSettlementPage(offset: number, limit: number, where?: any): Promise<any> {
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
    console.log("match: ", match.$and[0]);
    return this.tableSettlementModel.aggregate([
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
      { $sort: { _id: -1 } },
      { $skip: offset },
      { $limit: limit }
    ]).exec().then(async rs => {
      const statistical = await this.tableSettlementModel.aggregate([
        {
          $lookup: {
            from: 'table',
            localField: 'table',
            foreignField: '_id',
            pipeline: [
              { $project: { _id: 0, game: 1, tableNum: 1 }},
            ],
            as: 'table'
          }
        },/*
        {
          $group: {
            _id: null,
            totalWinCash: { $sum: "$totalWinCash"},
            totalWinChip: { $sum: "$totalWinChip"}
          }
        },*/
        { $match: match }
      ]).exec().then(async rs => {
        console.log("rs: ", rs);
        let obj = { totalWin: 0 };
        for (let k in GAME_NAME) obj[`${k}TotalWin`] = 0;
        for (let i = 0; i < rs.length; ++i) {
          let value: number = rs[i].totalWinChip + rs[i].totalWinCash;
          obj.totalWin += value;
          console.log("rs[0].table[0].game: ", rs[i].table[0].game);
          obj[`${rs[i].table[0].game}TotalWin`] += value;
        }
        console.log("obj: ", obj);
        return obj;
      })
      return {
        statistical,
        list: rs.map(val => {
          val.table = val.table[0];
          return val;
        }),
        total: await this.tableSettlementModel.count(match),

      }
    });
  }

  async findGuestUserSettlementById(id: string): Promise<any> {
    return this.tableGuestModel.aggregate([
      { $match: { _id: new Types.ObjectId(id) }},
      // 全部洗码
      {
        $lookup: {
          from: 'table_guest_betting',
          localField: '_id',
          foreignField: 'user',
          pipeline: [
            {
              $group: {
                _id: 'allWashCode',
                value: {
                  $sum: '$validBetMoney',
                },
              }
            },
            { $project: { _id: 0 } }
          ],
          as : 'allWashCode'
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
                _id: 'settleWashCode',
                value: {
                  $sum: '$washCode',
                },
              }
            },
            { $project: { _id: 0 } }
          ],
          as : 'settleWashCode'
        }
      },
    ]).exec().then(async rs => {
      console.log(rs[0])
      if (!rs[0]) return null;
      return {
        ratio: rs[0].ratio,
        allWashCode: rs[0].allWashCode[0] ? rs[0].allWashCode[0].value : 0,
        settleWashCode: rs[0].settleWashCode[0] ? rs[0].settleWashCode[0].value : 0,
      }
    })
  }
  async createGuestUserSettlement(arr): Promise<any> {
    return await this.tableGuestSettlementModel.create(arr);
  }

  async findGuestUserSettlementPage(offset: number, limit: number, where?: any): Promise<any> {
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
    console.log("match: ", match.$and[0]);
    return this.tableGuestSettlementModel.aggregate([
      {
        $lookup: {
          from: 'table_guest',
          localField: 'user',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $match: match },
      { $sort: { _id: -1} },
      { $skip: offset },
      { $limit: limit }
    ]).exec().then(async rs => {
      return {
        list: rs.map(val => {
          val.user = val.user[0];
          return val;
        }),
        total: await this.tableGuestSettlementModel.count(match),

      }
    });
  }
}
