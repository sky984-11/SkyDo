<template>
  <div class="root"  @click.stop="toggleEditId()">
    <div class="list" v-for="(value, key) in doneGroupList" :key="key">
      <div class="group">{{ getDateStr(key) }}</div>
      <div
        class="item"
        v-for="(done, index) in value"
        :key="done.id"
        @click.stop="toggleEditId(done.id)"
      >
        <p>{{ index + 1 }}.{{ done.content }}</p>
        <i
          v-if="editId === done.id"
          class="iconfont icon-back"
          @click.stop="restore(done)"
        ></i>
        <i
          v-if="editId === done.id"
          class="iconfont icon-close"
          @click.stop="remove(done)"
        ></i>
      </div>
    </div>
  </div>
</template>



<script>
import DB from "@/utils/db";
import { getDateStr } from "@/utils/common";
export default {
  name: "Done",
  data() {
    return {
      doneGroupList: null,
      editId: "",
    };
  },
  methods: {
    async initTodoList() {
      try {
        await this.getDoneList();
      } catch (error) {
        console.error(error);
      }
    },
    getDateStr,
    async getDoneList() {
      const list = await DB.groupby("doneList", "done_date");
      console.log(list)
      this.doneGroupList = list;
      },
    toggleEditId(id) {
      this.editId = this.editId === id ? "" : id;
    },
    restore(done) {
      DB.insert("todoList", {
        todo_date: done.todo_date,
        todo_datetime: done.todo_datetime,
        content: done.content,
      });

      DB.removeById("doneList", done.id);

      this.getDoneList();
    },
    remove(done) {
      DB.removeById("doneList", done.id);

      this.getDoneList();
    },
  },
  created() {
    this.initTodoList();
  },
};
</script>

<style  scoped>
.root {
  width: 100%;
  min-height: 100%;
  box-sizing: border-box;
  padding: 0 15px 28px 15px;
}

.root .list .group {
  top: 0;
  z-index: 999;
  height: 224px;
  line-height: 180px;
  box-sizing: border-box;
  color: rgba(204, 204, 204, 0.8);
  font-size: 35px;
  text-align: center;
  user-select: none;
}

.root .list .item {
  display: flex;
  height: 28px;
}

.root .list .item p {
  width: 100%;
  height: 100%;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  line-height: 28px;
  cursor: pointer;
}

.root .list .item i {
  line-height: 28px;
  padding: 0 5px;
  cursor: pointer;
}

.root .list .item:hover p {
  color: rgba(255, 255, 255, 0.6);
}
</style>
