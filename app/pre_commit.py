###########
 # @Author: liupeng
 # @Description: git提交前的钩子文件
 # @Date: 2024-02-02 10:21:58
 # @LastEditTime: 2024-02-02 10:40:50
 # @FilePath: \SkyDo\app\pre_commit.py
###########

import json
from packaging.version import Version

# JSON文件路径
file_path = 'D:\\Gitea\\SkyDo\\ui\\src-tauri\\tauri.conf.json'

# 读取JSON文件
with open(file_path, 'r', encoding='utf-8') as file:
    data = json.load(file)

# 获取当前版本号
current_version = data['package']['version']

# 使用packaging库来解析和增加版本号
version = Version(current_version)
new_version = '.'.join(str(x) for x in (version.major, version.minor, version.micro + 1))

# 更新版本号
data['package']['version'] = new_version

# 将更新后的数据写回JSON文件
with open(file_path, 'w', encoding='utf-8') as file:
    json.dump(data, file, indent=2)

print(f"Version updated from {current_version} to {new_version}.")
 