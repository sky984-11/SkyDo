<template>
  <el-row type="flex" justify="space-between" data-tauri-drag-region>
    <el-col data-tauri-drag-region :span="18">
      <span :class="{ master: isTodoSelected, slave: !isTodoSelected }" @click="selectItem(true)">
        ToDo
      </span>
      <span :class="{ slave: isTodoSelected, master: !isTodoSelected }" @click="selectItem(false)">
        Done
      </span>
    </el-col>

    <!-- 设置按钮 -->
    <el-col :span="6" class="right-align">
      <div>
        <i class="el-icon-setting icon"></i>
      </div>
    </el-col>
  </el-row>
</template>

<script>
export default {
  data() {
    return {
      isTodoSelected: true, // 初始默认选中 ToDo
    };
  },
  methods: {
    selectItem(isTodo) {
      this.isTodoSelected = isTodo; // 切换选择状态
    },
  },
};
</script>

<style>
.right-align {
  display: flex;
  justify-content: flex-end;
}

.icon {
  font-size: 24px;
  color: rgba(255, 255, 255, 0.8);
}

.master {
  font-size: 25px;
  font-weight: bold;
  color: #fff;
  cursor: pointer;
}

.slave {
  font-size: 20px;
  font-weight: bold;
  color: #c0c0c0;
  cursor: pointer;
}
</style>
