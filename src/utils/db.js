/**
 * @Author: liupeng
 * @Description: 
 * @Date: 2024-01-25 09:39:11
 * @LastEditTime: 2024-03-12 15:42:18
 * @FilePath: \SkyDo\ui\src\utils\db.js
 */
import { uniqueId, reverse, sortBy, groupBy } from 'lodash';
import * as XLSX from 'xlsx';
import { BaseDirectory, exists, writeTextFile, readTextFile, writeBinaryFile, createDir } from '@tauri-apps/api/fs';
import { getNowDate, getNowDateTime } from '@/utils/common';
import { save, message } from '@tauri-apps/api/dialog';
import { type as getOSType } from '@tauri-apps/api/os';

let db;
let AppData;

const DEFAULT_TODO_LIST = [
  { content: "“单击”下方空处，创建一个Todo", isOverdue: false },
  { content: "“双击”Todo，表示已完成", isOverdue: false },
  { content: "“单击”Todo，可进行更改或删除", isOverdue: false },
  { content: "“长按”Todo，可进行拖动排序", isOverdue: false },
  { content: "“单击”闹钟图标或使用 @插入ETA", isOverdue: false }
].map(item => ({
  todo_date: getNowDate(),
  todo_datetime: getNowDateTime(),
  id: uniqueId('todo_'),
  ...item
}));

const DEFAULT_DONE_LIST = [
  {
    done_date: getNowDate(),
    done_datetime: getNowDateTime(),
    todo_date: getNowDate(),
    todo_datetime: getNowDateTime(),
    content: "hello SkyDo!",
    id: "272aa857-bd53-44fb-b6fc-49d4ef595ade",
  }
];

const DB = {
  async initDB() {
    try {
      const osType = await getOSType();
      // AppData = osType === 'Windows_NT' ? BaseDirectory.Resource : BaseDirectory.AppData;
      if (osType === 'Windows_NT') {
        await createDir('com.SkyDo.top', { dir: BaseDirectory.AppData, recursive: true })
      }
      AppData = BaseDirectory.AppData

      const isDBExist = await exists('db.json', { dir: AppData });
      console.debug('检查db文件是否存在:', isDBExist);

      if (!isDBExist) {
        await this._createDefaultDB(osType);
      }

      const contents = await readTextFile('db.json', { dir: AppData });
      db = JSON.parse(contents);
      this._ensureIDs('todoList');
      this._ensureIDs('doneList');
    } catch (error) {
      console.error('初始化数据库时出错:', error);
    }
  },

  _ensureIDs(listName) {
    db[listName].forEach(item => {
      if (!item.id) item.id = uniqueId(`${listName.slice(0, -4)}_`);
    });
  },

  async _createDefaultDB(osType) {
    const defaultData = {
      todoList: DEFAULT_TODO_LIST,
      doneList: DEFAULT_DONE_LIST,
      settings: {
        autoStart: true,
        wechatNotificationEnabled: false,
        alwaysOnTop: false,
        osType,
        dataDir: AppData
      }
    };

    await writeTextFile('db.json', JSON.stringify(defaultData), { dir: AppData });
  },

  get(key) {
    console.log('db.get', key, db[key]);
    return db[key];
  },

  async set(key, value) {
    db[key] = value;
    await this._saveDB();
  },

  async insert(key, value) {
    value.id = value.id || uniqueId(`${key}_`);
    db[key].push(value);
    await this._saveDB();
  },

  async removeById(key, id) {
    db[key] = db[key].filter(item => item.id !== id);
    await this._saveDB();
  },

  async restoreById(id) {
    const itemIndex = db['doneList'].findIndex(item => item.id === id);
    if (itemIndex !== -1) {
      const restoredItem = db['doneList'].splice(itemIndex, 1)[0];
      db['todoList'].push(restoredItem);
      await this._saveDB();
    }
  },

  async groupBy(key, prop) {
    const sortedArray = reverse(sortBy(db[key], prop));
    return groupBy(sortedArray, prop);
  },

  async exportExcel() {
    try {
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(db.todoList), "Todo List");
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(db.doneList), "Done List");

      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const filePath = await save({
        defaultPath: 'SkyDo.xlsx',
        filters: [{ name: 'Excel Files', extensions: ['xls', 'xlsx'] }]
      });

      if (filePath) {
        await writeBinaryFile({ path: filePath, contents: new Uint8Array(wbout) });
        await message(`Excel文件已成功导出: ${filePath}`);
      }
    } catch (error) {
      console.error('导出Excel文件时出错:', error);
    }
  },

  async _saveDB() {
    await writeTextFile('db.json', JSON.stringify(db), { dir: AppData });
  }
};

// DB.initDB();
export default DB;
