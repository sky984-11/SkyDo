###########
# @Description: 路由配置
# @Date: 2022-10-19 13:03:08
 # @LastEditTime: 2024-02-01 10:20:13
 # @FilePath: \SkyDo\app\router.py
# @Author: liupeng
###########

from flask_cors import CORS
from flask import Blueprint
# 实例
from routes import *



# 创建蓝图
b1 = Blueprint('b1', __name__)
# 解决跨域问题
CORS(b1)

##################################### SkyDo start #####################################
# 微信关注及回复事件
b1.route('/wechat', methods=["GET", "POST"])(handle_subscribe)
# 微信模板通知
b1.route('/notifier', methods=["POST"])(send_notifier)

# 用户注销
# b1.route('/api/user/del/<int:user_id>', methods=['DELETE'])(delete_user)
# 用户退出
# b1.route('/api/user/logout', methods=['GET'])(logout)
#####################################  SkyDo end  #####################################