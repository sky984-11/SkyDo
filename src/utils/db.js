/**
 * @Author: liupeng
 * @Description: 
 * @Date: 2024-01-25 09:39:11
 * @LastEditTime: 2024-03-12 15:42:18
 * @FilePath: \SkyDo\ui\src\utils\db.js
 */
import uniqueId from 'lodash/uniqueId';
import reverse from 'lodash/reverse';
import sortBy from 'lodash/sortBy';
import groupBy from 'lodash/groupBy';

import * as XLSX from 'xlsx';
// import exportCsv from './csv'

import { BaseDirectory, exists, writeTextFile, readTextFile,writeBinaryFile } from '@tauri-apps/api/fs';

import { getNowDate, getNowDateTime } from "@/utils/common";
import { save,message } from '@tauri-apps/api/dialog';

let db;
const AppData = BaseDirectory.AppData

const DB = {
  async initDB() {
    // 检查db文件是否存在,不存在则创建
    
    const isDBExit = await exists('db.json', { dir: AppData });
    if (!isDBExit) {
      await writeTextFile('db.json', JSON.stringify({
        todoList: [
          {
            todo_date: getNowDate(),
            todo_datetime: getNowDateTime(),
            content: "“单击”下方空处，创建一个Todo",
            isOverdue:false
          },
          {
            todo_date: getNowDate(),
            todo_datetime: getNowDateTime(),
            content: "“双击”Todo，表示已完成",
            isOverdue:false
          },
          {
            todo_date: getNowDate(),
            todo_datetime: getNowDateTime(),
            content: "“单击”Todo，可进行更改或删除",
            isOverdue:false
          },
          {
            todo_date: getNowDate(),
            todo_datetime: getNowDateTime(),
            content: "“长按”Todo，可进行拖动排序",
            isOverdue:false
          },
          {
            todo_date: getNowDate(),
            todo_datetime: getNowDateTime(),
            content: "“单击”闹钟图标插入ETA",
            isOverdue:false
          },
        ],
        doneList: [
          {
            done_date: getNowDate(),
            done_datetime: getNowDateTime(),
            todo_date: getNowDate(),
            todo_datetime: getNowDateTime(),
            content: "hello SkyDo!",
            id: "272aa857-bd53-44fb-b6fc-49d4ef595ade",
          },
        ],
        settings: {autoStart: true,wechatNotificationEnabled:false,alwaysOnTop:false},
      }), { dir: AppData });
    }

    const contents = await readTextFile('db.json', { dir: AppData});
    db = JSON.parse(contents)

    db.todoList.forEach(item => {
      item.id = uniqueId();
    });

    db.doneList.forEach(item => {
      item.id = uniqueId();
    });
  },

  
  get(key) {
    return db[key];
  },
  async set(key, value) {
    db[key] = value
    await writeTextFile('db.json', JSON.stringify(db), { dir: AppData });
  },
  async insert(key, value) {
    db[key].push(value)
    await writeTextFile('db.json', JSON.stringify(db), { dir: AppData });
  },
  async removeById(key, id) {
    const index = db[key].findIndex(item => item.id === id);
    if (index !== -1) {
      db[key].splice(index, 1);
    }
    await writeTextFile('db.json', JSON.stringify(db), { dir:AppData });
  },
  async groupby(key, prop) {
    const sortedArray = reverse(sortBy(db[key], prop));
    const groupedTodoList = groupBy(sortedArray, prop);
    return groupedTodoList

  },

  async exportExecl() {
    const todoList = db.todoList;
    const doneList = db.doneList;
  
    // 将对象数据转换为工作表
    const wsTodo = XLSX.utils.json_to_sheet(todoList);
    const wsDone = XLSX.utils.json_to_sheet(doneList);
  
    // 创建新的工作簿并附加工作表
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, wsTodo, "todo");
    XLSX.utils.book_append_sheet(wb, wsDone, "done");
  
    // 将工作簿转换为二进制数据
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  
    // 使用 Tauri 的 writeBinaryFile 写入 Excel 文件
    const filePath = await save({
      defaultPath:'SkyDo.xlsx',
      filters: [{
        name: 'xls*',
        extensions: ['xls', 'xlsx']
      }]
    });
    await writeBinaryFile({
      path: filePath,
      contents: new Uint8Array(wbout),
    });
    await message('Excel 文件已成功导出,请查看文件:' + filePath);
  }
};
DB.initDB()
export default DB;
