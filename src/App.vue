<template>
  <div id="app" :class="{ unfocused: ignoreMouse }" :style="backgroundStyle">
    <div class="mask"></div>
    <div class="drag-nav" data-tauri-drag-region>
      <b>{{ appName }}</b>
      <i>Powered by sky丿L鹏</i>
    </div>
    <div class="nav" data-tauri-drag-region>
      <div class="link" data-tauri-drag-region>
        <router-link :settings="settings" draggable="false" to="/">Todo</router-link> |
        <router-link draggable="false" to="/done">Done</router-link>
      </div>
      <!-- 设置功能，后面添加tabs->应用设置->开机自启，通过路由实现，跳转后需要一个开关返回上级 -->
      <div class="tools" data-tauri-drag-region>
        <!-- <i class="el-icon-document" @click="exportExecl()"></i> -->
        <i class="el-icon-setting" @click="settingsRouter"></i>
      </div>
    </div>
    <div class="main scrollbar scrollbar-y">
      <transition name="fade-transform" mode="out-in">
        <router-view :settings="settings" :imageUrl="backgroundImage" @setBackgroupImage="handleSetBackgroundImage" />
      </transition>
    </div>

  </div>
</template>

<script>
import { isDev } from '@/utils/env.js';
import DB from "@/utils/db";
import { createDir, BaseDirectory, exists, readBinaryFile, writeBinaryFile } from '@tauri-apps/api/fs';

export default {
  data() {
    return {
      appName: 'SkyDo',
      ignoreMouse: false,
      // 背景图片
      backgroundImage: null,
      settings: {},
    };
  },
  computed: {
    backgroundStyle() {
      return {
        backgroundImage: `url('${this.backgroundImage}')`,
        backgroundSize: 'cover', // 覆盖整个元素
        backgroundPosition: 'center', // 居中显示

      };
    }
  },
  methods: {
    settingsRouter() {
      if (this.$route.path !== '/settings') {
        this.$router.push({ name: 'Settings' }).catch(err => {
          // 忽略 NavigationDuplicated 错误
          if (err.name !== 'NavigationDuplicated') {
            // 如果有其他类型的错误，可能需要处理或记录
            console.error(err);
          }
        });
      }
    },

    exportExecl() { 
      DB.exportExecl();
    },


  async handleSetBackgroundImage(dir, filename) {
    const readImages = await readBinaryFile(dir + '/' + filename, { dir: BaseDirectory.AppData });
    let blob = new Blob([readImages]);
    this.backgroundImage = URL.createObjectURL(blob);
    this.settings['imageName'] = filename;
    this.settings['fileList'] = [{ name: filename }]
    DB.set("settings", this.settings);
  },

  async initList() {
    try {
      await DB.initDB();
      this.getSettingsList();
    } catch (error) {
      console.error(error);
    }
  },

  async getSettingsList() {
    const list = DB.get("settings");
    this.settings = list
    let isImagesExit = await exists('images/' + list.imageName, { dir: BaseDirectory.AppData });
    if (isImagesExit) {
      const readImages = await readBinaryFile('images/' + list.imageName, { dir: BaseDirectory.AppData });
      let blob = new Blob([readImages]);
      this.backgroundImage = URL.createObjectURL(blob);
    }
  },
},
created() {
  // 正式版本禁用右键
  if (!isDev()) {
    window.addEventListener("contextmenu", (e) => e.preventDefault(), false);
  }

  this.initList()
},
};
</script>

<style scoped>
#app {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  border-radius: 5px;
}

#app .mask {
  display: none;
  position: absolute;
  z-index: 999;
  width: 100%;
  height: 100%;
}

#app .drag-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 20px;
  padding: 0 20px;
  box-sizing: border-box;
  font-size: 12px;
}

#app .drag-nav b,
#app .drag-nav i {
  color: rgba(255, 255, 255, 0.3);
}

#app .nav {
  display: flex;
  justify-content: space-between;
  height: 26px;
  padding: 0 20px;
  color: #cccccc;
  user-select: none;
}

#app .nav .link a {
  font-weight: bold;
  color: #cccccc;
  text-decoration: none;
}

#app .nav .link a.router-link-exact-active {
  font-size: 20px;
  color: #ffffff;
}

#app .nav .link a:hover {
  color: rgba(255, 255, 255, 0.6);
}

#app .nav .tools i {
  font-size: 20px;
  line-height: 26px;
  padding: 0 5px;
  cursor: pointer;
}

#app .main {
  flex: 1;
  margin: 10px 0;
  overflow-y: auto;
}

#app .main:hover::-webkit-scrollbar-thumb {
  display: block;
}

#app.unfocused {
  opacity: 0.8;
}

#app.unfocused .mask {
  display: block;
}

#app.unfocused .tools {
  z-index: 1000;
}
</style>
