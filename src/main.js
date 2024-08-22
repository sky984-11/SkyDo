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


import { Icon,Row,Col,Input,Tabs,TabPane,Tooltip ,Form,FormItem,Switch,Upload,Image} from 'element-ui';


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

Vue.use(Image);
Vue.use(Upload);





new Vue({
  router,
  render: (h) => h(App),
}).$mount('#app');
