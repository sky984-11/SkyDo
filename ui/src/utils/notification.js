/**
 * @Author: liupeng
 * @Description: 信息通知组件
 * @Date: 2024-01-19 16:44:49
 * @LastEditTime: 2024-01-19 16:57:07
 * @FilePath: \TProxy\ui\src\utils\notification.js
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
  }
}