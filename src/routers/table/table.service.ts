import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { TableUserDocument } from '../../schemas/table_user.schema';
import { TableDocument } from '../../schemas/table.schema';
import { TableRecordDocument } from '../../schemas/table_record';
import { TableGuestBetting, TableGuestBettingDocument } from '../../schemas/table_guest_betting.schema';
import { game_area_multiple, game_area_multiple_sk } from '../../constant/game.constant';
import { TableSettlementDocument } from '../../schemas/table_settlement.schema';
import { TableGuestDocument } from '../../schemas/table_guest.schema';
@Injectable()
export class TableService {
  constructor(
    @InjectModel('Table') private tableModel: Model<TableDocument>,
    @InjectModel('TableUser') private tableUserModel: Model<TableUserDocument>,
    @InjectModel('TableGuest') private tableGuestModel: Model<TableGuestDocument>,
    @InjectModel('TableRecord') private tableRecordModel: Model<TableRecordDocument>,
    @InjectModel('TableGuestBetting') private tableBettingModel: Model<TableGuestBettingDocument>,
    @InjectModel('TableSettlement') private tableSettlementModel: Model<TableSettlementDocument>,
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
  async updateTable(params: any, where?: any): Promise<any> {
    return await this.tableModel
      .updateMany(params)
      .where(where || {})
      .exec();
  }

  async findTableRecord(where?: any): Promise<any> {
    return await this.tableRecordModel
      .find(where || {})
      .exec();
  }
  async findTableRecordOne(where: any): Promise<any> {
    return await this.tableRecordModel
      .findOne(where)
      .exec();
  }
  async findTableRecordResult(tid: string, noRun: number): Promise<any> {
    return await this.tableRecordModel
      .aggregate([
        { $match: { table: new Types.ObjectId(tid), noRun }},
        { $project: { _id: false, result: true } },
      ]).exec().then(rs => rs.map(val => val.result ));
  }
  async createTableRecord(arr: any[]): Promise<any> {
    return await this.tableRecordModel.create(arr);
  }
  async updateTableRecord(params: any, where?: any): Promise<any> {
    return await this.tableRecordModel
      .updateMany(params)
      .where(where || {})
      .exec();
  }

  async findTableBetting(where?: any): Promise<any> {
    return await this.tableBettingModel
      .find(where || {})
      .populate('user')
      .populate('table')
      .exec();
  }
  async findTableBettingOne(where: any): Promise<any> {
    return await this.tableBettingModel
      .find(where)
      .exec();
  }
  async findTableGuestTotalWin(tid, openTimeDate: Date): Promise<any> {
    let where = {
      table: new Types.ObjectId(tid),
      createTimeDate: { $gte: openTimeDate, $lte: new Date() }
    };

    console.log("where: ", where);
    return await this.tableBettingModel.aggregate([
      { $match: where },
      {
        $group: {
          _id: { type: '$type' },
          value: { $sum: '$settlementMoney' }
        }
      }
    ]).exec().then(async rs => {
      let obj = { cash: 0, chip: 0 };
      for (let i = 0; i < rs.length; ++i) {
        if (rs[i]._id.type === 0)
          obj.cash += rs[i].value;
        else
          obj.chip += rs[i].value;
      }
      return obj;
    });
  }
  async createTableBetting(arr: any[]): Promise<any> {
    return await this.tableBettingModel
      .create(arr.map(val =>{
        val.createTimeDate = new Date();
        val.modifyTimeDate = new Date();
        return val;
      }));
  }
  async updateTableBetting(params: any, where?: any): Promise<any> {
    return await this.tableBettingModel
      .updateMany(params)
      .where(where || {})
      .exec();
  }
  async updateTableBettingOne(params: any, where: any): Promise<any> {
    params.modifyTimeDate = new Date();
    return await this.tableBettingModel
      .updateOne(params)
      .where(where || {})
      .exec();
  }
  async resetTableBetting(tid, noRun, noActive, result): Promise<any> {
    const records: any[] = await this.tableBettingModel.find({
      table: new Types.ObjectId(tid), noRun, noActive
    }).populate('user').exec();
    for (let i = 0; i < records.length; ++i) {
      const settlement = this.calculateResult(
        result, records[i].userBetData,
        records[i].user.account === 'sk'
      )
      for (let k in settlement)
        records[i][k] = settlement[k];
      records[i].result = result;
      await records[i].save();
    }
    return ;
  }

  async findTableSettlement(where?: any): Promise<any> {
    return await this.tableSettlementModel
      .find(where || {})
      .exec();
  }
  async findTableSettlementOne(where: any): Promise<any> {
    return await this.tableSettlementModel
      .find(where)
      .exec();
  }
  async createTableSettlement(arr: any[]): Promise<any> {
    return await this.tableSettlementModel.create(arr);
  }


  /** @description 计算结果 */
  calculateResult(result: any, data: any, isSanKe?: boolean) {
    let userBetMoney: number = 0;
    let validBetMoney: number = 0;
    let settlementData: any = {};
    let settlementMoney: number = 0;

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
          let money: number = data[k] * game_area_multiple[k];
          settlementMoney += money;
          settlementData[k] = money;
        }
      } else {
        settlementMoney += -data[k];
        settlementData[k] = -data[k];
      }
    }
    return { userBetMoney,  validBetMoney, settlementMoney, settlementData }
  }
}
