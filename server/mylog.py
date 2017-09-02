#coding:utf-8

import sys
import re
import subprocess
import logging
import socket, time
from logging.handlers import TimedRotatingFileHandler

# CRITICAL > ERROR > WARNING > INFO > DEBUG > NOTSET

LOG_FILE = "./logs/myclinic.txt"
#logging.basicConfig(format='%(asctime)s %(levelname)s %(message)s',datefmt='%Y-%m-%d %I:%M:%S',filemode='w')   #for term print

logger = logging.getLogger()
logger.setLevel(logging.DEBUG)
fh = TimedRotatingFileHandler(LOG_FILE,when='h',interval=24,backupCount=30)
datefmt = '%Y-%m-%d %H:%M:%S'
format_str = '%(asctime)s %(filename)s[line:%(lineno)d] %(levelname)s %(message)s'
#formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
formatter = logging.Formatter(format_str, datefmt)
fh.setFormatter(formatter)
logger.addHandler(fh)

# define Handler(>=INFO) to sys.stderr
console = logging.StreamHandler()
console.setLevel(logging.DEBUG)

# print format
formatter = logging.Formatter('%(asctime)s %(filename)s[line:%(lineno)d] %(levelname)s %(message)s', '%a, %d %b %Y %H:%M:%S')
console.setFormatter(formatter)

# add Handler to root logger
logging.getLogger('').addHandler(console)