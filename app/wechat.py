###########
 # @Author: liupeng
 # @Description: 
 # @Date: 2024-02-01 09:04:13
 # @LastEditTime: 2024-02-01 11:04:08
 # @FilePath: \SkyDo\app\wechat.py
###########

import hashlib  
from config import BaseConfig
from lxml import etree  
from flask import make_response, request
import time,requests,json

class Message(object):  
    def __init__(self, req):  
        self.request = req  
        # 填写自己的微信token等内容
        self.token = BaseConfig.TOKEN 
        self.AppID = BaseConfig.AppID
        self.AppSecret = BaseConfig.AppSecret 

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
        if self.timestamp is None or self.nonce is None:
            # 处理缺少参数的情况
            self.return_code = 'Missing parameters'
            return

        data = sorted([self.token, self.timestamp, self.nonce])
        string = ''.join(data).encode('utf-8')
        hashcode = hashlib.sha1(string).hexdigest()
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

# 接口token
class Token():
    def __init__(self):
        self.apiEndpoint = 'https://api.weixin.qq.com/cgi-bin/token'
        self.AppID = BaseConfig.AppID
        self.AppSecret = BaseConfig.AppSecret 

    # api调用
    def openApi(self, url: str, params: dict = None, headers: dict = None, method: str = "GET", contentType: str = "json") -> dict:
        if method == "GET":
            # ssl警告忽略
            requests.packages.urllib3.disable_warnings()
            # verify=False忽略ssl证书
            response = requests.get(
                 self.apiEndpoint + url, params=params, headers=headers, verify=False)
            return json.loads(response.text)

    # 获取token
    @property
    def getToken(self, grant_type='client_credential'):
        tokenJson = self.openApi(
            "",
            params={
                "appid": self.AppID,
                "secret": self.AppSecret,
                "grant_type": grant_type
            },
        )
        try:
            return tokenJson['access_token']
        except:
            print(tokenJson)
