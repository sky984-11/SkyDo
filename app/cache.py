###########
 # @Author: liupeng
 # @Description: 缓存器
 # @Date: 2024-02-02 10:51:09
 # @LastEditTime: 2024-02-02 11:25:21
 # @FilePath: \SkyDo\app\cache.py
###########
import diskcache

class MyCache:
    """缓存管理器"""

    def __init__(self, cache_path='.'):
        self.cache = diskcache.Cache(cache_path)

    def set(self, key, value,expire=7200):
        """设置缓存"""
        self.cache.set(key, value,expire)

    def get(self, key):
        """获取缓存"""
        return self.cache.get(key)
    
    def top(self, limit=50):
        """获取部分缓存,默认50条"""
        # 获取所有缓存项的键
        all_keys = self.cache.iterkeys()

        # 用于计数的变量和保存结果的字典
        count = 0
        items = {}
        for key in all_keys:
            value = self.cache.get(key)
            items[key] = value
            count += 1
            if count == int(limit):
                break

        return items


    def exists(self, key):
        """判断键是否存在"""
        return key in self.cache

    def close(self):
        """关闭缓存"""
        self.cache.close()

    def __enter__(self):
        """进入上下文时触发"""
        return self

    def __exit__(self, exc_type, exc_value, traceback):
        """离开上下文时触发"""
        self.close()
