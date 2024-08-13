# -*- coding: UTF-8 -*-  
  
import hashlib  
import time  
import json
  
from flask import make_response, Flask, request  # 这些是本例中所有用到的库  
from lxml import etree  

import requests
  
class Message(object):  
    def __init__(self, req):  
        self.request = req  
        # 填写自己的微信token等内容
        self.token = 'SkyDo'  
        self.AppID = 'wxfcaa7ecade1496bf'  
        self.AppSecret = '264e811d16af5f8eb29b5c93a9e52a20'  
  
# 验证来自微信的信息  
class Get(Message):  
    def __init__(self, req):  
        super(Get, self).__init__(req)  
        self.signature = req.args.get('signature')  # 这里分别获取传入的四个参数  
        self.timestamp = req.args.get('timestamp')  
        self.nonce = req.args.get('nonce')  
        self.echostr = req.args.get('echostr')  
        self.return_code = 'Invalid'  
  
    def verify(self):  
        data = sorted([self.token, self.timestamp, self.nonce])  # 字典排序  
        string = ''.join(data).encode('utf-8')  # 拼接成字符串  
        hashcode = hashlib.sha1(string).hexdigest()  # sha1加密  
        if self.signature == hashcode:  
            self.return_code = self.echostr  
  
  
# 获取用户发来的信息  
class Post(Message):  
    def __init__(self, req):  
        super(Post, self).__init__(req)  
        self.xml = etree.fromstring(request.get_data())  
        self.MsgType = self.xml.find("MsgType").text  
        self.ToUserName = self.xml.find("ToUserName").text  
        self.FromUserName = self.xml.find("FromUserName").text  
        self.CreateTime = self.xml.find("CreateTime").text  
        self.MsgId = self.xml.find("MsgId").text if self.xml.find("MsgId") is not None else '抱歉，暂未支持此消息。'
  
        hash_table = {  
            'text': ['Content'],  
            'image': ['PicUrl', 'MediaId'],  
            'voice': ['MediaId', 'Format'],  
            'video': ['MediaId', 'ThumbMediaId'],  
            'shortvideo': ['MediaId', 'ThumbMediaId'],  
            'location': ['Location_X', 'Location_Y', 'Scale', 'Label'],  
            'link': ['Title', 'Description', 'Url'],  
            'event': [],  # 添加一个空列表来处理event类型的消息
        }  
        attributes = hash_table[self.MsgType]  
        self.Content = self.xml.find("Content").text if 'Content' in attributes else '抱歉，暂未支持此消息。'  
        self.PicUrl = self.xml.find("PicUrl").text if 'PicUrl' in attributes else '抱歉，暂未支持此消息。'  
        self.MediaId = self.xml.find("MediaId").text if 'MediaId' in attributes else '抱歉，暂未支持此消息。'  
        self.Format = self.xml.find("Format").text if 'Format' in attributes else '抱歉，暂未支持此消息。'  
        self.ThumbMediaId = self.xml.find("ThumbMediaId").text if 'ThumbMediaId' in attributes else '抱歉，暂未支持此消息。'  
        self.Location_X = self.xml.find("Location_X").text if 'Location_X' in attributes else '抱歉，暂未支持此消息。'  
        self.Location_Y = self.xml.find("Location_Y").text if 'Location_Y' in attributes else '抱歉，暂未支持此消息。'  
        self.Scale = self.xml.find("Scale").text if 'Scale' in attributes else '抱歉，暂未支持此消息。'  
        self.Label = self.xml.find("Label").text if 'Label' in attributes else '抱歉，暂未支持此消息。'  
        self.Title = self.xml.find("Title").text if 'Title' in attributes else '抱歉，暂未支持此消息。'  
        self.Description = self.xml.find("Description").text if 'Description' in attributes else '抱歉，暂未支持此消息。'  
        self.Url = self.xml.find("Url").text if 'Url' in attributes else '抱歉，暂未支持此消息。'  
        self.Recognition = self.xml.find("Recognition").text if 'Recognition' in attributes else '抱歉，暂未支持此消息。'  
  
  
# 回复用户的信息  
class Reply(Post):  
    def __init__(self, req):  
        super(Reply, self).__init__(req)  
        self.xml = f'<xml><ToUserName><![CDATA[{self.FromUserName}]]></ToUserName>' \
        f'<FromUserName><![CDATA[{self.ToUserName}]]></FromUserName>' \
        f'<CreateTime>{str(int(time.time()))}</CreateTime>'  
  
    def text(self, Content):  
        self.xml += f'<MsgType><![CDATA[text]]></MsgType>' \
        f'<Content><![CDATA[{Content}]]></Content></xml>'  
  
    def image(self, MediaId):  
        pass  
  
    def voice(self, MediaId):  
        pass  
  
    def video(self, MediaId, Title, Description):  
        pass  
  
    def music(self, ThumbMediaId, Title='', Description='', MusicURL='', HQMusicUrl=''):  
        pass  
  
    def reply(self):  
        response = make_response(self.xml)  
        response.content_type = 'application/xml'  
        return response  
  
  
app = Flask(__name__)  
  
  
@app.route("/wechat", methods=["GET", "POST"])  
def index():  
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

  
if __name__ == "__main__":  
    app.run(host='0.0.0.0',port=3001)
