<template>
  <div id="app" :class="{ unfocused: ignoreMouse }" :style="backgroundStyle" >
    <div class="mask"></div>
    <div class="drag-nav" data-tauri-drag-region>
      <b>{{ appName }}</b>
      <i>Powered by sky丿L鹏</i>
    </div>
    <div class="nav" data-tauri-drag-region>
      <div class="link" data-tauri-drag-region @contextmenu.prevent="onRightClick($event, settings.defaultGroup)">
        <router-link :settings="settings" draggable="false" to="/" >{{ settings.defaultGroup ? settings.defaultGroup : 'Todo'}}</router-link> |
        <router-link draggable="false" to="/done">Done</router-link>
      </div>

      <div class="tools" data-tauri-drag-region>
        <i class="el-icon-document" @click="exportExecl()"></i>
        <i class="el-icon-setting" @click="settingsRouter"></i>
      </div>
    </div>
    <div class="main scrollbar scrollbar-y">
      <transition name="fade-transform" mode="out-in">
        <router-view :settings="settings" :groups="groups" :imageUrl="backgroundImage" @setBackgroupImage="handleSetBackgroundImage" />
      </transition>
    </div>
    <ContextMenu ref="contextMenu"/>
  </div>
</template>

<script>
import { isDev } from '@/utils/env.js';
import DB from "@/utils/db";
import { exists, readBinaryFile } from '@tauri-apps/api/fs';
import { getVersion, getName } from '@tauri-apps/api/app';
import { fetch } from '@tauri-apps/api/http';
import { appWindow } from '@tauri-apps/api/window';

import ContextMenu from '@/components/ContextMenu.vue';

export default {
  components: {
    ContextMenu,
  },
  data() {
    return {
      appName: '',
      ignoreMouse: false,
      // 背景图片
      backgroundImage: null,
      settings: {},
      groups:[]
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
    onRightClick(event,item) {
      const options = [
        { label: '切换分组', action: this.changeGroup},
      ];
      this.$refs.contextMenu.showMenu(event, options,item);
    },


    changeGroup(item){
      console.log(item)
    },
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
      DB.exportExcel();
    },


    async handleSetBackgroundImage(dir, filename) {
      const readImages = await readBinaryFile(dir + '/' + filename, { dir: this.settings['dataDir'] });
      let blob = new Blob([readImages]);
      this.backgroundImage = URL.createObjectURL(blob);
      this.settings['imageName'] = filename;
      this.settings['fileList'] = [{ name: filename }]
      DB.set("settings", this.settings);
    },

    async initList() {
      try {
        const appName = await getName();
        const appVersion = await getVersion();
        this.appName = appName + ' v' + appVersion;

        await DB.initDB();
        await this.getSettingsList();
        await this.getGroups()

        if (this.settings['alwaysOnTop']) {
          appWindow.setAlwaysOnTop(this.settings['alwaysOnTop']);
        }

        let response = await fetch('https://mirror.ghproxy.com/https://github.com/sky984-11/SkyDo/releases/download/updater/latest.json', {
          method: 'GET',
          timeout: 30,
        });

        if (!response.ok) {
          // 如果请求失败，尝试直接从GitHub获取数据
          const backupResponse = await fetch('https://github.com/sky984-11/SkyDo/releases/download/updater/latest.json', {
            method: 'GET',
            timeout: 30,
          });
          if (!backupResponse.ok) throw new Error('无法获取更新信息');
          response = backupResponse;
        }

        const updateData = response.data

        if (appVersion != updateData.version) {
          const updateStr = `
                <div>
                  <p>
                    <strong>新版本：</strong>${updateData.version}<br>
                    <strong>更新时间：</strong>${updateData.pub_date}<br>
                    <strong>Windows下载链接：</strong><a href="${updateData.platforms['windows-x86_64']['url']}" target="_blank">${updateData.platforms['windows-x86_64']['url']}</a><br>
                    <strong>Linux下载链接：</strong><a href="${updateData.platforms['linux-x86_64']['url']}" target="_blank">${updateData.platforms['linux-x86_64']['url']}</a><br>
                    <strong>More：</strong><a href="https://github.com/sky984-11/SkyDo/releases" target="_blank">https://github.com/sky984-11/SkyDo/releases</a><br>
                  </p>
                  <p><strong>更新内容：</strong><br>${updateData.notes}</p>
                </div>
      `;

          this.$notify({
            title: appName + '版本更新通知',
            message: updateStr,
            duration: 0,
            type: 'warning',
            dangerouslyUseHTMLString: true
          });

        }
      } catch (error) {
        console.error(error);
      }


    },

    async getSettingsList() {
      const list = DB.get("settings");
      this.settings = list

      if (list.imageName) {
        let isImagesExit = await exists('images/' + list.imageName, { dir: list['dataDir'] });
        if (isImagesExit) {
          const readImages = await readBinaryFile('images/' + list.imageName, { dir: list['dataDir'] });
          let blob = new Blob([readImages]);
          this.backgroundImage = URL.createObjectURL(blob);
        }
      }

    },

    async getGroups() {
      const list = DB.get("groups");
      this.groups = list
    },
  },
  created() {
    // 正式版本禁用右键
    if (!isDev()) {
      // window.addEventListener("contextmenu", (e) => e.preventDefault(), false);
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
  color: #ffffff;
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
