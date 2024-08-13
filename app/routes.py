###########
 # @Author: liupeng
 # @Description: 
 # @Date: 2024-02-01 08:50:19
 # @LastEditTime: 2024-02-02 14:17:58
 # @FilePath: \SkyDo\app\routes.py
###########
from flask import request, jsonify
from run import app
import requests
import json,os

from log import log
from wechat import Get,Post,Reply,Token
from cache import MyCache

caches = MyCache()




def handle_subscribe():
  """微信关注事件及回复事件处理"""
  if request.method == "GET": 
      message = Get(request)
      message.verify()
        
      return message.return_code  
  
  elif request.method == "POST":
        
      post_message = Post(request)
      reply = Reply(request)
      # print(post_message.MsgType,post_message.xml)
      if post_message.MsgType == 'event' and post_message.xml.find("Event").text == 'subscribe':
            
          user_id = post_message.FromUserName
          content = post_message.Content
          reply.text(f"欢迎关注！您的用户ID是：{user_id}")
          return reply.xml
      else:
          # 其他类型的消息，回复默认消息
            
          reply.text("暂不支持该回复")
          return reply.xml

def send_notifier():
    '''发送模板信息'''
    token = caches.get('Token')
    if token== None:
        caches.set('Token',Token().getToken,7200)
        token = caches.get('Token')
        
    templateid = 'fVSu3fJoTeacB0Cai2Z6QwOsrRbvQw4WwkLjju6-0nc'
    json_data = request.get_json()
    log.info(f'get token:{token}')
    userid = json_data.get('userid')
    msg = {
        "msg":{"value":json_data.get('msg'),"color":"#173177"},
    }
    
    url = f"https://api.weixin.qq.com/cgi-bin/message/template/send?access_token={token}"
    body = {
        "touser": userid,
        "template_id": templateid,
        "data": msg,
    }
    log.info(f'send notifier:{body}')
    data1 = bytes(json.dumps(body, ensure_ascii=False).encode('utf-8'))
    response = requests.post(url, data=data1)
    result = response.json()
    return result