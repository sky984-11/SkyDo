<!--
 * @Author: liupeng
 * @Description: 
 * @Date: 2024-01-30 15:53:35
 * @LastEditTime: 2024-09-12 14:15:31
 * @FilePath: \SkyDo\ui\src\views\Settings.vue
-->
<template>
  <div class="settings">
    <el-form ref="settings" :model="settings" :rules="rules" label-width="80px">
      <el-form-item label="开机自启">
        <el-switch v-model="settings.autoStart" @change="handleAutoStartChange" />
      </el-form-item>

      <el-form-item label="置顶窗口">
        <el-switch v-model="settings.alwaysOnTop" @change="handleAlwaysOnTopChange" />
      </el-form-item>

      <el-form-item label="专项分组">
        <el-row>
          <el-col :span="11">
            <el-select v-model="settings.defaultGroup" size="mini" @change="changeDefaultGroup">
              <el-option v-for="group in groups" :key="group" :label="group" :value="group">
              </el-option>
            </el-select>
          </el-col>

          <el-col :span="13">
            <i class="el-icon-circle-plus-outline" @click="addGroup"
              style="font-size: 25px;margin-top: 10px;margin-left: 5px; cursor: pointer;"></i>
          </el-col>

        </el-row>



      </el-form-item>

      <el-form-item label="背景设置">
        <el-upload class="avatar-uploader" action="" :on-remove="handleRemove" :http-request="Upload"
          :file-list="settings.fileList">
          <el-image v-if="imageUrl" :src="imageUrl" class="avatar" fit="cover"></el-image>
          <i v-else class="el-icon-plus avatar-uploader-icon"></i>
        </el-upload>
      </el-form-item>



    </el-form>
  </div>
</template>

<script>
import DB from "@/utils/db";
import { enable, disable } from "tauri-plugin-autostart-api";
import { appWindow } from '@tauri-apps/api/window';

import { createDir, exists, writeBinaryFile } from '@tauri-apps/api/fs';

export default {
  data() {
    return {
      rules: {
        wechatNotificationId: [
          { required: true, message: '请先关注以下公众号获取用户ID', trigger: 'blur' }
        ],
      }
    };
  },
  props: {
    imageUrl: {
      type: String,
      default: ""
    },
    settings: {
      type: Object,
      default: {}
    },
    groups: {
      type: Array,
    }
  },
  created() {
    // console.log(this.groups)


  },
  methods: {
    async handleAutoStartChange(value) {
      // 处理开机自启设置的逻辑
      this.settings['autoStart'] = value
      DB.set("settings", this.settings);
      if (value) {
        await enable();
      } else {
        disable();
      }
    },
    async handleWechatNotificationEnabledChange(value) {
      this.settings['wechatNotificationEnabled'] = value
      DB.set("settings", this.settings);
    },
    async handleAlwaysOnTopChange(value) {
      // 处理窗口置顶的逻辑
      this.settings['alwaysOnTop'] = value
      DB.set("settings", this.settings);
      await appWindow.setAlwaysOnTop(value);
    },

    // 背景图片上传
    Upload(data) {

      this.blobToUint8Array(data.file).then(async (uint8Array) => {
        // 上传时默认创建images目录
        await createDir('images', { dir: this.settings['dataDir'], recursive: true });
        // 写入图片到images目录下
        await writeBinaryFile('images/' + data.file.name, uint8Array, { dir: this.settings['dataDir'] });
        //判断文件是否成功写入
        let isImagesExit = await exists('images/' + data.file.name, { dir: this.settings['dataDir'] });
        if (isImagesExit) {
          // 设置背景图片的方法交给父组件实现
          this.$emit('setBackgroupImage', 'images', data.file.name,)
        }
      })
    },
    // 背景图片删除
    handleRemove(file, fileList) {
      this.settings['imageName'] = null
      this.settings['fileList'] = []
      DB.set("settings", this.settings);
      window.location.reload();
    },
    convertImageToBase64(image) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();

        // 当读取完成时调用onload事件
        reader.onloadend = () => resolve(reader.result);

        // 如果发生错误则调用onerror事件
        reader.onerror = (e) => reject(new Error('Failed to read image'));

        // 开始读取文件
        reader.readAsDataURL(image);
      });
    },
    blobToUint8Array(blob) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
          const arrayBuffer = reader.result;
          const uint8Array = new Uint8Array(arrayBuffer);

          resolve(uint8Array);
        };

        reader.onerror = (error) => {
          reject(error);
        };

        reader.readAsArrayBuffer(blob);
      });
    },

    changeDefaultGroup(group){
      DB.set("defaultGroup", group)
    },

    addGroup() {
      this.$prompt('请输入分组', '添加', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        customClass: 'add-group-class'
      }).then(({ value }) => {
        this.groups.unshift(value)
        DB.set("groups", this.groups);

      })
    }
  },
};
</script>

<style scoped>
div /deep/.el-form-item__label {
  color: white;
}


.avatar-uploader /deep/ .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.avatar-uploader /deep/ .el-upload:hover {
  border-color: #409EFF;
}


.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}

.avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style>


<style>
.add-group-class {
  width: max-content !important;
}
</style>