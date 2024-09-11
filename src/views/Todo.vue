<!--
 * @Author: liupeng
 * @Description: 
 * @Date: 2024-01-25 09:18:01
 * @LastEditTime: 2024-09-11 12:50:12
 * @FilePath: \SkyDo\ui\src\views\Todo.vue
-->
<template>
  <div class="root" @click="add">
    <draggable class="list" v-model="todoList" v-bind="dragOptions" @start="drag = true" @end="drag = false"
      :disabled="editIndex !== -1">
      <transition-group type="transition" :name="!drag ? 'flip-list' : null">
        <div class="item" v-for="(todo, index) in todoList" :key="'todo' + index" @dblclick.stop="done($event, index)"
          @click.stop="editing(index)">
          <p v-if="index !== editIndex" :style="{ color: todo.isOverdue ? 'red' : 'white' }">{{ index + 1 }}.{{
            todo.content }}</p>
          <div class="edit" v-else>
            <input v-model="todo.content" v-focus @click.stop="return false;" @keyup.27="cancel(index)"
              @keyup.13="edited" spellcheck="false" @input="handleInputChange(index, $event)" />
            <i class="iconfont icon-select" @click.stop="edited"></i>
            <i class="iconfont icon-close" @click.stop="clear(index)"></i>
            <el-tooltip class="item" effect="dark" :content="todo.eta" :disabled="!todo.eta" placement="top">
              <i class="el-icon-alarm-clock" @click.stop="alarm(index)"></i>
            </el-tooltip>

          </div>
        </div>
      </transition-group>
    </draggable>
  </div>
</template>
<script>
import draggable from "vuedraggable";
import CursorSpecialEffects from "@/utils/fireworks";

import debounce from 'lodash/debounce';

import DB from "@/utils/db";
import { notification } from "@/utils/notification";

import { getNowDate, getNowDateTime, formatDateTime } from "@/utils/common";

export default {
  name: "Todo",
  components: {
    draggable,
  },
  data() {
    return {
      todoList: null,
      intervalId: null,
      drag: false,
      editIndex: -1,
      tempItem: null,
      dblclick: false,
      // 时间格式校验
      datePattern: /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/

    };
  },
  props: {
    settings: {
      type: Object,
      default: {}
    }
  },
  methods: {
    // 定时检查eta时间
    checkEta() {
      const now = new Date().getTime();
      // console.log(this.todoList)
      if (this.todoList) {
        this.todoList.forEach(todo => {
          // 已经设置了eta字段，并且eta字段时间格式正确，并且该待办事项没有过期
          if (todo.eta && this.datePattern.test(todo.eta) && !todo.isOverdue) {
            const eta = new Date(todo.eta).getTime();

            if (now >= eta) {
              this.$set(todo, 'isOverdue', true); // 使用Vue的$set方法确保响应式更新
              notification('任务过期提醒', `任务${todo.content}已过期,ETA时间:${todo.eta}`);
            } else {
              todo.isOverdue = false;
            }
          }
        });
      }

    },
    async initTodoList() {
      try {
        await DB.initDB();
        this.getTodoList();
      } catch (error) {
        console.error(error);
      }
    },

    // 语音播报初始化
    initSpeak() {

    },

    getTodoList() {
      const list = DB.get("todoList");
      console.log('getTodoList',list)
      this.todoList = list;
    },
    add() {
      if (this.editIndex !== -1) {
        this.edited();
        return;
      }

      this.todoList.push({
        todo_date: getNowDate(),
        todo_datetime: getNowDateTime(),
        content: "",
        isOverdue: false
      });
      const index = this.todoList.length - 1;
      this.tempItem = Object.assign({}, this.todoList[index]);
      this.editIndex = index;
    },
    editing(index) {
      setTimeout(() => {
        if (this.dblclick) {
          return;
        }

        if (this.editIndex !== -1) {
          this.edited();
        }

        // 编辑时写入eta时间
        const todo = Object.assign({}, this.todoList[index]);
        if (todo.eta) {
          todo.content += ` @${todo.eta}`;
        }
        this.todoList[index] = todo

        this.tempItem = todo;
        this.editIndex = index;
      }, 220);
    },
    edited() {
      if (this.editIndex === -1) {
        return;
      }

      const todo = this.todoList[this.editIndex];

      if (!todo.content.trim()) {
        this.todoList.splice(this.editIndex, 1);
      } else {
        this.todoList = this.todoList.map((p, i) => {
          if (i === this.editIndex) {
            var pattern = /\s@(\d{4}-\d{2}-\d{2}\s\d{2}:\d{2})/;
            var match = p.content.match(pattern);

            if (match) {
              var datetime = match[1]; // 获取匹配到的时间字符串
              var newContent = p.content.replace(pattern, ''); // 移除匹配到的部分

              // 在原来的基础上增加日期属性
              return {
                content: newContent,
                todo_datetime: getNowDateTime(),
                todo_date: getNowDate(),
                eta: datetime,
                isOverdue: false
              };
            } else {
              // 当没有匹配到正则表达式时，清空 eta 字段的数据
              return {
                content: p.content,
                todo_datetime: getNowDateTime(),
                todo_date: getNowDate(),
                eta: "",
                isOverdue: false
              };
            }
          }
          return p;
        });
      }

      this.editIndex = -1;
      DB.set("todoList", this.todoList);
    },
    cancel(index) {
      this.$set(this.todoList, index, this.tempItem);
      this.edited();
    },
    clear(index) {
      if (!this.todoList[index].content) {
        this.edited();
        return;
      }

      this.todoList[index].content = "";
    },
    alarm(index) {
      if (this.todoList[index].content && this.todoList[index].content != "") {
        // 如果已有eta时间则直接赋值即可
        if (this.todoList[index].eta && this.datePattern.test(this.todoList[index].eta)) {
          this.todoList[index].content = this.todoList[index].content + ' @' + this.todoList[index].eta
          return
        }

        // 如果文本中未匹配到 @，则想文本中插入 @
        if (this.todoList[index].content.indexOf(' @') === -1) {
          var now = new Date();

          // 增加一个小时
          now.setHours(now.getHours() + 1);

          var formattedTime = formatDateTime(now);
          this.todoList[index].content = this.todoList[index].content + ' @' + formattedTime

        }
        return;
      }
    },
    done(event, index) {
    if (this.editIndex !== -1 || this.dblclick) return;

    this.dblclick = true;
    setTimeout(() => { this.dblclick = false; }, 500);

    CursorSpecialEffects.handleMouseDown(event);

    const doneItem = Object.assign({ done_date: getNowDate(), done_datetime: getNowDateTime() }, this.todoList[index]);

    DB.insert("doneList", doneItem);
    this.todoList.splice(index, 1);
    DB.set("todoList", this.todoList);
  },


    // 监听输入的内容，如果输入 @开头则在后面增加时间
    handleInputChange: debounce(function (index, event) {
      const inputValue = event.target.value;
      if (inputValue.endsWith(' @')) {
        var now = new Date();

        // 增加一个小时
        now.setHours(now.getHours() + 1);

        // 格式化时间为指定格式
        var formattedTime = formatDateTime(now);
        this.todoList[index].content += formattedTime;

      }
    }, 300),
  },
  computed: {
    dragOptions() {
      return {
        animation: 200,
        group: "description",
        disabled: false,
        ghostClass: "ghost",
      };
    },
  },
  mounted() {
    this.checkEta();
    this.intervalId = setInterval(() => {
      this.checkEta(); // 每分钟调用一次检查ETA的函数
    }, 30 * 1000); // 设置为每30s执行一次
  },
  beforeDestroy() {
    clearInterval(this.intervalId);
  },
  mounted() {
    this.initTodoList();
    this.initSpeak()
  },
  directives: {
    focus: {
      inserted: function (el) {
        el.focus();
      },
    },
  },
};
</script>

<style scoped>

* {
  color: #ffffff;
}

.root {
  width: 100%;
  min-height: 100%;
  box-sizing: border-box;
  padding: 0 15px 28px 15px;
}

.root .list .item {
  height: 28px;
}

.root .list .item p {
  width: 100%;
  height: 100%;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  cursor: pointer;
  user-select: none;
  line-height: 28px;
}

.root .list .item .edit {
  display: flex;
  width: 100%;
  height: 100%;
  justify-content: space-between;
}

.root .list .item .edit input {
  flex: 1;
  height: 100%;
  outline: none;
  border: none;
  background: transparent;
  font-size: 16px;
  line-height: 28px;
}

.root .list .item .edit i {
  line-height: 28px;
  padding: 0 5px;
  cursor: pointer;
}

.root .list .item:hover p {
  color: rgba(255, 255, 255, 0.6);
}

.flip-list-move {
  transition: transform 0.5s;
}

.no-move {
  transition: transform 0s;
}

.ghost {
  opacity: 0.5;
}
</style>
