#!/usr/bin/env python
#coding=utf8

import sys
import json
import math
import random
from datetime import datetime
from bson import ObjectId
import re
from database import DataBase
sys.path.append("..")
from mylog import logging

_ = None

class MedicineClass(DataBase):
  def __init__(self):
    global _
    _ = super(MedicineClass, self)
    _.__init__('medicines')

  def fieldscheck(self, model):
      _.assertnumber(model["stdprice"])
      _.assertnumber(model["remain"])
      _.assertint(model["usefreq"])
      _.assertdict(model["prices"])

  def new(self, medicine, created=None):
    if not medicine.has_key('remain'):
      medicine['remain'] = 0

    if not medicine.has_key('link'):
      medicine['link'] = ''

    if not medicine.has_key('spec'):
      medicine['spec'] = ''

    if not medicine.has_key('defaultUnit'):
      medicine['defaultUnit'] = ''

    if not medicine.has_key('usage'):
      medicine['usage'] = ''

    if not medicine.has_key('usefreq'):
      medicine['usefreq'] = 0

    self.fieldscheck(medicine)

    _.new(
      {
        "name": medicine['name'],
        "tradename": medicine['tradename'],
        "standard": medicine['standard'],
        "type": medicine['type'],
        "stdprice": medicine['stdprice'],
        "remain": medicine['remain'],
        "link": medicine['link'],
        "spec": medicine['spec'],
        "prices": medicine['prices'],
        "defaultUnit": medicine['defaultUnit'],
        'usage': medicine['usage'],
        'usefreq': medicine['usefreq'], # 被使用次数
      },
      created
    )

    return True

  def save(self, medicine):
    _.assertid(medicine["_id"])
    self.fieldscheck(medicine)

    _.save(medicine)

  def find(self, searchkey, searchorder, begin, limit):
    result = []
    cond = {}
    sortby = "lastmod"

    if searchkey != '':
      cond['$or'] = [{
        'name': re.compile(searchkey)
      }, {
        'tradename': re.compile(searchkey)
      }]

    if searchorder == 'remain':
      sortby = "remain"
    elif searchorder == 'usefreq':
      sortby =  "usefreq"
    elif searchorder == 'stockout':
      sortby = "lastmod"

    return [medicine for medicine in _.find(cond).skip(begin).limit(limit).sort(sortby, -1)]

  def count(self, searchkey):
    cond = {}

    if searchkey != '':
      cond['$or'] = [{
        'name': re.compile(searchkey)
      }, {
        'tradename': re.compile(searchkey)
      }]

    # xxx: 忽略排序
    return _.count(cond)

Medicine = MedicineClass()