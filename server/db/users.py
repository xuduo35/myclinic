#!/usr/bin/env python
#coding=utf8

import sys
import string
import random
import json
import math
import random
from datetime import datetime
from bson import ObjectId
from . import dbclient
sys.path.append("..")
from mylog import logging
from database import DataBase

_ = None

class UserClass(DataBase):
    def __init__(self):
        global _
        _ = super(UserClass, self)
        _.__init__('users')

    def generate_session_id(self):
        length = 16
        chars = string.ascii_letters + string.digits
        return ''.join(random.choice(chars) for i in range(length))

    def createadmin(self):
        count = _.count({})

        if count < 1:
            _.insert({
                'name': 'admin',
                'pwd': '123456',
                'sess': self.generate_session_id(),
                'avatar': 'defaultavatar.jpg',
                'casenum': 0,
                'picsnum': 0,
                'medsnum': 0,
                'presnum': 0,
                'notinum': 0,
                'agerange': [0, 0, 0, 0, 0, 0], # 0~1, 1~6, 7~14, 15~30, 30~50, 50~
                'lastmod': datetime.utcnow(),
                'created': datetime.utcnow(),
                })

    def find(self, name, pwd):
        u = _.find_one({'name': name, 'pwd': pwd})
        return u

    def findbysess(self, sess):
        u = _.find_one({'sess': sess})
        return u

    def save(self, u):
        _.assertid(u["_id"])
        _.save(u)

    def ageidx(self, age, ageUnit):
        ageidx = 0
        ageyear = 0

        if ageUnit == "year":
            ageyear = age
        elif ageUnit == "month":
            ageyear = int(age/12)
        elif ageUnit == "day":
            ageyear = int(age/365)

        if ageyear <= 1:
            ageidx = 0
        elif ageyear <=6:
            ageidx = 1
        elif ageyear <=14:
            ageidx = 2
        elif ageyear <=30:
            ageidx = 3
        elif ageyear <=50:
            ageidx = 4
        else:
            ageidx = 5

        return ageidx

User = UserClass()