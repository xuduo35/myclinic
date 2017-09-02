#!/usr/bin/env python
# coding=utf8

import sys
import types
import json
import math
import random
import numbers
import re
from datetime import datetime, date
from bson import ObjectId
from . import dbclient
sys.path.append("..")
from mylog import logging

class DataBase(object):
    def __init__(self, name):
        self.db = dbclient[name]
        self.db.ensure_index('created', unique=True)

    def insert(self, *args, **kwargs):
        return self.db.insert(*args, **kwargs)

    def insert_one(self, *args, **kwargs):
        return self.db.insert_one(*args, **kwargs)

    def find(self, *args, **kwargs):
        return self.db.find(*args, **kwargs)

    def find_one(self, *args, **kwargs):
        return self.db.find_one(*args, **kwargs)

    def remove(self, *args, **kwargs):
        return self.db.remove(*args, **kwargs)

    def update(self, *args, **kwargs):
        return self.db.update(*args, **kwargs)

    def count(self, *args, **kwargs):
        return self.db.count(*args, **kwargs)

    def aggregate(self, *args, **kwargs):
        return self.db.aggregate(*args, **kwargs)

    # xxx: 类型检查
    def assertdate(self, field):
        if not isinstance(field, date):
            raise Exception("not a date")
            return False
        return True

    def assertbool(self, field):
        if not isinstance(field, bool):
            raise Exception("not a bool")
            return False
        return True

    def assertint(self, field):
        if not isinstance(field, int):
            raise Exception("not a int")
            return False
        return True

    def assertfloat(self, field):
        if not isinstance(field, float):
            raise Exception("not a float")
            return False
        return True

    def assertnumber(self, field):
        if not isinstance(field, numbers.Number):
            raise Exception("not a numbers.Number")
            return False
        return True

    def assertlist(self, field):
        if not isinstance(field, list):
            raise Exception("not a list")
            return False
        return True

    def assertdict(self, field):
        if not isinstance(field, dict):
            raise Exception("not a dict")
            return False
        return True

    def assertid(self, field):
        if not isinstance(field, ObjectId):
            raise Exception("not a ObjectId")
            return False
        return True

    def assertstring(self, field):
        # str没办法处理unicode
        # if not isinstance(field, str):
        #     raise Exception("not a string")
        #     return False
        return True

    # xxx: 扩充数据库操作
    def new(self, model, created=None):
        if type(model) is types.DictType:
            model['lastmod'] = datetime.utcnow()

            if created != None:
                model['created'] = created
            else:
                model['created'] = datetime.utcnow()

            obj = self.db.insert_one(model)
            return obj.inserted_id

        logging.error('model is illegal')

        return None

    def findbypage(self, cond = None, limit = 10, skip = 0):
        return [value for value in self.db.find(cond).sort('created', -1).skip(skip).limit(limit)]

    def findbyid(self, _id):
        return self.db.find_one({'_id': ObjectId(_id)})

    def removebyid(self, _id):
        return self.db.remove({'_id': ObjectId(_id)})

    def save(self, model):
        if not model.has_key('_id'):
            logging.error('_id is empty')
            return

        obj = { key: model[key] for key in model if key not in ['_id', 'lastmod'] }
        obj['lastmod'] = datetime.utcnow()

        self.db.update({'_id': model['_id']}, {'$set': obj}, multi=True)

    def countbytype(self, searchkey, searchtype = 'name'):
        cond = {}
        cond[searchtype] = re.compile(searchkey)
        return self.db.count(cond)

    def find10items(self, searchkey, searchtype = 'name'):
        cond = {}
        cond[searchtype] = re.compile(searchkey)

        return [item for item in self.db.find(cond).limit(10)]
