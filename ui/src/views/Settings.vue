<!--
 * @Author: liupeng
 * @Description: 
 * @Date: 2024-01-30 15:53:35
 * @LastEditTime: 2024-02-05 11:10:01
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

      <el-form-item label="背景设置">
        <el-upload class="avatar-uploader" action="" :on-remove="handleRemove" :http-request="Upload"
          :file-list="settings.fileList">
          <el-image v-if="imageUrl" :src="imageUrl" class="avatar" fit="cover"></el-image>
          <i v-else class="el-icon-plus avatar-uploader-icon"></i>
        </el-upload>
      </el-form-item>

      <el-form-item label="微信通知" prop="wechatNotificationEnabled">
        <el-switch v-model="settings.wechatNotificationEnabled" @change="handleWechatNotificationEnabledChange" />
      </el-form-item>

      <el-form-item prop="wechatNotificationId" label="通知ID" v-if="settings.wechatNotificationEnabled">
        <el-input style="width: 75%;" size="mini" v-model="settings.wechatNotificationId"
          @input="handleInputChange(settings.wechatNotificationId)" />
      </el-form-item>

      <el-tooltip class="item" effect="dark" content="请先扫码关注公众号获取ID(微信通知功能目前仅前100人可使用)" placement="right">
        <img v-if="settings.wechatNotificationEnabled" style="margin-left: 25%;" src="/wechat.png"
          alt="扫码关注公众号，后面通过公众号实现微信提醒">
      </el-tooltip>

    </el-form>
  </div>
</template>

<script>
import DB from "@/utils/db";
import { enable, disable } from "tauri-plugin-autostart-api";
import { appWindow } from '@tauri-apps/api/window';
import debounce from 'lodash/debounce';

import { createDir,BaseDirectory, exists, readBinaryFile, writeBinaryFile } from '@tauri-apps/api/fs';

export default {
  data() {
    return {
      // settings: {},
      rules: {
        wechatNotificationId: [
          { required: true, message: '请先关注以下公众号获取用户ID', trigger: 'blur' }
        ],
      }
    };
  },
  props:{
    imageUrl: {
      type: String,
      default:""
    },
    settings:{
      type: Object,
      default:{}
    }
  },
  created() {

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
        await createDir('images', { dir: BaseDirectory.Resource, recursive: true });
        // 写入图片到images目录下
        await writeBinaryFile('images/' + data.file.name, uint8Array, { dir: BaseDirectory.Resource });
        //判断文件是否成功写入
        let isImagesExit = await exists('images/' + data.file.name, { dir: BaseDirectory.Resource });
        if (isImagesExit) {
          // 设置背景图片的方法交给父组件实现
          this.$emit('setBackgroupImage','images',data.file.name,)
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

    // 微信id入库
    handleInputChange: debounce(function (value) {
      this.settings['wechatNotificationId'] = value
      DB.set("settings", this.settings);
    }, 300),
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
