export const game_agent_level: number = 1;
export const game_member_level: number = 2;
export const game_gold_multiple: number = 1000;
export const game_ratio_multiple: number = 1000;
export const game_share_multiple: number = 1000;

export const game_area_multiple = {
  banker: 0.95,
  player: 1,
  dragon: 0.97,
  tiger: 0.97,
  tie: 8,
  bankerPair: 11,
  playerPair: 11
}

export const game_area_multiple_sk = {
  banker: 1,
  player: 1,
  dragon: 1,
  tiger: 1,
  tie: 8,
  bankerPair: 11,
  playerPair: 11
}

export enum GAME_CHIP_RECORD_TYPE {
  All,  SAVE, TAKE,OUT, INTO,
}
export enum GAME_MONEY_TYPE {
  CASH, CHIP
}
export const GAME_NAME: any = {
  bac: '百家乐',
  lh: '龙虎斗',
  ox: '牛牛',
  sg: '三公',
  sl: '双联',
  tz: '筒子',
  zjh: '炸金花'
}
/** @description 计算结果的游戏 */
export const CALCULATE_RESULT_GAME: string[] = ['bac', 'lh'];

export enum TABLE_RUNNING_MODIFY_TYPE {
  ADMIN_ADD = 1, ADMIN_UPT = 2, ADMIN_DEL = 3, TABLE_UPT
}