#coding:utf-8

import json
from mylog import logging

class ConfigClass:
  configfile = "./config.json"

  def __init__(self):
    logging.info("loading configuration fron 'config.json'...")

  def store(self, data):
    with open(self.configfile, 'w') as json_file:
        json_file.write(json.dumps(data))

  def load(self):
    with open(self.configfile) as json_file:
        data = json.load(json_file)

    self.data = data

config = ConfigClass()

config.load()