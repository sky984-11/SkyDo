/*
 * @Description: 信息通知组件
 * @Author: sky
 * @Date: 2024-08-14 15:34:12
 * @LastEditTime: 2024-08-23 17:58:57
 * @LastEditors: sky
 */

import { isPermissionGranted, requestPermission, sendNotification } from '@tauri-apps/api/notification';

export async function notification(title, body) {
  let permissionGranted = await isPermissionGranted();
  if (!permissionGranted) {
    const permission = await requestPermission();
    permissionGranted = permission === 'granted';
  }
  if (permissionGranted) {
    sendNotification({ title, body });
    console.log('sendNotification', title, body);
  }
}