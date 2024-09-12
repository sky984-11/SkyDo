/*
 * @Description: 
 * @Author: sky
 * @Date: 2024-08-14 15:34:12
 * @LastEditTime: 2024-09-12 13:39:37
 * @LastEditors: sky
 */
/**
 * @Author: liupeng
 * @Description: 
 * @Date: 2023-12-06 15:51:54
 * @LastEditTime: 2024-02-04 15:35:32
 * @FilePath: \SkyDo\ui\src\main.js
 */
import Vue from 'vue';
import router from "./router";
import App from './App.vue';

import 'element-ui/lib/theme-chalk/index.css';

import "./style/index.css";
import "./assets/iconfont/iconfont.css";

// ,MessageBox,Message
import { Icon,Row,Col,Input,Tabs,TabPane,Tooltip ,Form,FormItem,Switch,Upload,Image,Notification,Select,Option,MessageBox} from 'element-ui';


Vue.use(Icon);
Vue.use(Row);
Vue.use(Col);
Vue.use(Input);
Vue.use(Tabs);
Vue.use(TabPane);
Vue.use(Tooltip);
Vue.use(Form);
Vue.use(FormItem);
Vue.use(Switch);
Vue.use(Select);
Vue.use(Option);

Vue.use(Image);
Vue.use(Upload);
// Vue.prototype.$alert = MessageBox.alert;
// Vue.prototype.$message = Message;
Vue.prototype.$notify = Notification;
Vue.prototype.$prompt = MessageBox.prompt;



new Vue({
  router,
  render: (h) => h(App),
}).$mount('#app');
