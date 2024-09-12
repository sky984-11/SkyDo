<template>
    <div v-if="visible" :style="menuStyle" class="context-menu">
      <ul>
        <li @click="onOptionClick(option)" v-for="(option, index) in options" :key="index">
          {{ option.label }}
        </li>
      </ul>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        visible: false,
        menuStyle: {
          position: 'absolute',
          top: '0px',
          left: '0px',
        },
        options: [],
        contextData: null, // 用于存储点击区域的上下文数据
      };
    },
    methods: {
      showMenu(event, options, contextData) {
        this.options = options;
        this.contextData = contextData; // 存储上下文数据
        this.visible = true;
        this.menuStyle.top = `${event.clientY}px`;
        this.menuStyle.left = `${event.clientX}px`;
      },
      hideMenu() {
        this.visible = false;
      },
      onOptionClick(option) {
        if (option.action && typeof option.action === 'function') {
          option.action(this.contextData); // 将上下文数据传递给回调函数
        }
        this.hideMenu();
      },
    },
    mounted() {
      document.addEventListener('click', this.hideMenu);
    },
    beforeDestroy() {
      document.removeEventListener('click', this.hideMenu);
    },
  };
  </script>
  
  <style scoped>
  .context-menu {
    background-color: rgba(0, 0, 0, 0.6);
    border: 1px solid #ccc;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    z-index: 1000;
  }
  
  .context-menu ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  
  .context-menu li {
    padding: 8px 12px;
    cursor: pointer;
  }
  
  .context-menu li:hover {
    background-color: rgba(0, 0, 0, 0.6);
  }
  </style>
  