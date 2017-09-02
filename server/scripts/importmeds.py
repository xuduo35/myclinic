#!/usr/bin/env python
#coding=utf8

import os
import sys
import json
from datetime import datetime, timedelta
sys.path.append('.')
from db.users import User
from db.medicines import Medicine
from mylog import logging

def store(configfile, data):
  with open(configfile, 'w') as json_file:
      json_file.write(json.dumps(data))

def load(configfile):
  with open(configfile) as json_file:
      data = json.load(json_file)
  return data

u = User.find_one({'name': 'admin'})

if not u:
  print "please create user admin first"
  sys.exit(0)

yaopins = load('../client/src/yaopin.json')
nowtime = datetime.utcnow()

for i in range(0, len(yaopins)):
  # print json.dumps(yaopins[i], encoding='UTF-8', ensure_ascii=False)
  yaopins[i]['defaultUnit'] = yaopins[i]['prices'].keys()[0]
  yaopins[i]['usage'] = ''
  yaopins[i]['usefreq'] = 0

  Medicine.new(yaopins[i], nowtime - timedelta(seconds=i))
  u['medsnum'] = u['medsnum'] + 1

User.save(u)