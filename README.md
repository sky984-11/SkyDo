<!--
 * @Author: liupeng
 * @Description: 
 * @Date: 2023-11-28 14:07:56
 * @LastEditTime: 2024-03-12 15:02:37
 * @FilePath: \SkyDo\README.md
-->
## 简介

一个高效简洁的待办事项程序，帮助您快速记录和完成重要的任务和计划，并且可通过微信进行任务提醒。
持续迭代中...有bug欢迎反馈，反馈邮箱：1269861316@qq.com

## 技术栈

前端技术：Vue2 + vite作为前端框架，用于构建用户界面。采用tauri进行程序打包
后端技术：Python3和Flask作为后端框架，用于提供微信API接口。


## 下载链接
https://wwb.lanzoue.com/iHg9o1p4zt5a
密码:3abj

## 优点

1. 界面干净，简洁，无任何广告
2. 体积小巧，不到5M
3. 可以使用微信接收任务提醒(因为目前用的微信测试号，所以暂时仅前100人可使用)
4. 自定义主题
5. 开机自启
6. 所有数据均存储在本地，避免安全隐患

## 版本迭代记录
### V0.5.1
- [x] 🔴 增加自定义主题功能

### V0.5.2
- [x] 🔴 增加背景删除功能 

### V0.5.3
- [x] 🟡 自定义背景base64存储json导致的性能问题修复
- [x] 🟡 修复done界面更换背景后日期不显示问题

### V0.5.4
- [x] 🟡 代码性能优化

### V0.5.8
- [x] 🔴 完成的任务恢复后数据错误

### V0.5.10
- [x] 🔴 修复开机自启后数据无法加载的问题

## 使用指南

### Todo界面
![image](https://github.com/sky984-11/SkyDo/assets/58068214/38a11fd6-8bd5-48b1-90ee-fcd383c36e0f)


### Done
![image](https://github.com/sky984-11/SkyDo/assets/58068214/220a2bfb-bac0-4696-aa72-3efab54dbbba)


### settings
*微信通知功能需要关注微信公众号获取微信id，将微信id复制到微信通知选项下的输入框中即可实现微信通知*
![image](https://github.com/sky984-11/SkyDo/assets/58068214/61e3e525-4097-46dc-b0b9-0cec186a4a51)


## 后续开发

- [ ] 专项待办功能，可以设置一个专项分组，给这个分组添加需要通知的对象，然后这个分组下创建的任务到了设置的eta时间就会对设置的对象进行通知。(场景:比如说“学习”这个任务，在这个分组下就都是学习相关的任务,可以设置其他人的微信ID，进行学习任务分配)
- [ ] 增加事项导出功能
- [ ] 增加数据分析功能，对历史事项进行分析汇总，生成报告
- [ ] 针对于循环的待办事项，后续增加定时功能(可通过微信通知)

