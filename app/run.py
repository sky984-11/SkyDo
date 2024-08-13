###########
 # @Description: 运行文件
 # @Date: 2022-10-19 13:03:08
 # @LastEditTime: 2024-02-02 14:06:24
 # @FilePath: \SkyDo\app\run.py
 # @Author: liupeng
###########
from flask import Flask
# from flask_migrate import Migrate

import platform
# 获取当前系统(windows/linux)
SYSTEM = platform.system()


app = Flask(__name__)

# 根据平台加载不同的配置文件
if SYSTEM == 'Windows':
    
    app.config.from_object("config.DevelopmentConfig")
else:
    app.config.from_object("config.ProductionConfig")




if __name__ == '__main__':
    from router import b1
    # 加载路由
    app.register_blueprint(b1)
    app.run("0.0.0.0")