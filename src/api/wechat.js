/**
 * @Author: liupeng
 * @Description: 
 * @Date: 2023-12-14 17:24:45
 * @LastEditTime: 2024-02-01 11:09:39
 * @FilePath: \SkyDo\ui\src\api\wechat.js
 */
import { post, get } from '@/utils/request';


export default class Wechat {
  /**
 * 获取后端服务地址
 * @returns
 */
  static async notifier(userid,msg) {
    return post('/notifier', {
      userid,
      msg,
    });
  }

}