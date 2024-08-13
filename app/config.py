###########
 # @Description: 全局配置文件
 # @Date: 2022-11-03 17:50:27
 # @LastEditTime: 2024-02-02 13:47:11
 # @FilePath: \SkyDo\app\config.py
 # @Author: liupeng
###########

class BaseConfig(object):
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JSON_AS_ASCII = False
    static_folder='./static'
    TOKEN = 'SkyDo'
    AppID = 'wxfcaa7ecade1496bf'
    AppSecret = '264e811d16af5f8eb29b5c93a9e52a20'  
 
 
class ProductionConfig(BaseConfig):
    SQLALCHEMY_DATABASE_URI = 'sqlite://///home/ubuntu/SkyDo/app/SkyDo.db' 
    SERVER_NAME="113.31.114.236:3001"
    DEBUG=False
 
 
class DevelopmentConfig(BaseConfig):
    SQLALCHEMY_DATABASE_URI = 'sqlite:///SkyDo.db' 
    SERVER_NAME = "127.0.0.1:3001"
    DEBUG = True

    