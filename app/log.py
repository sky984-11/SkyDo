###########
 # @Author: liupeng
 # @Description: 日志记录器
 # @Date: 2023-11-30 08:45:33
 # @LastEditTime: 2024-02-01 08:49:33
 # @FilePath: \SkyDo\app\log.py
###########
import inspect
import logging
from logging.handlers import TimedRotatingFileHandler
from datetime import datetime

today = datetime.today().strftime('%Y%m%d')

class MyLogger:
    """
      日志记录器
      log_file:日志文件路径,默认为此目录下的SkyDo.log
      isPrint:是否启用控制台打印,启用的话写入日志的同时也会在控制台打印一遍
    """

    _instance = None

    def __new__(cls, log_file=f'./SkyDo.log'):
        if not cls._instance:
            cls._instance = super().__new__(cls)
            logging.basicConfig(
                filename=log_file,
                level=logging.INFO,
                format="%(asctime)s - %(levelname)s - %(message)s",
                encoding="utf-8",
            )
            handler = TimedRotatingFileHandler(filename=log_file, when='midnight', backupCount=30)
            handler.suffix = '%Y%m%d.log'
            formatter = logging.Formatter("%(asctime)s - %(levelname)s - %(message)s")
            handler.setFormatter(formatter)
            logging.getLogger().addHandler(handler)
        return cls._instance

    @staticmethod
    def _get_caller_name():
        current_frame = inspect.currentframe()
        caller_frame = inspect.getouterframes(current_frame)[2]
        caller_name = caller_frame[3]
        return caller_name

    @staticmethod
    def info(msg, isPrint=False):
        if isPrint:
            print(msg)

        caller_name = MyLogger._get_caller_name()
        log_message = f"{caller_name} - {msg}"
        logging.info(log_message)

    @staticmethod
    def error(msg, isPrint=False):
        if isPrint:
            print(msg)

        caller_name = MyLogger._get_caller_name()
        log_message = f"{caller_name} - {msg}"
        logging.error(log_message)

    @staticmethod
    def warning(msg, isPrint=False):
        if isPrint:
            print(msg)

        caller_name = MyLogger._get_caller_name()
        log_message = f"{caller_name} - {msg}"
        logging.warning(log_message)

    @staticmethod
    def debug(msg, isPrint=False):
        if isPrint:
            print(msg)

        caller_name = MyLogger._get_caller_name()
        log_message = f"{caller_name} - {msg}"
        logging.debug(log_message)


log = MyLogger()
