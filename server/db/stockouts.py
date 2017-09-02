#!/usr/bin/env python
# coding=utf8

import sys
import json
import math
import random
import re
from datetime import datetime
from bson import ObjectId
from . import dbclient
sys.path.append("..")
from mylog import logging
from database import DataBase

_ = None

class StockoutClass(DataBase):
    def __init__(self):
        global _
        _ = super(StockoutClass, self)
        _.__init__('stockouts')

    def fieldscheck(self, model):
        _.assertstring(model["name"])
        _.assertstring(model["standard"])
        _.assertnumber(model["dose"])
        _.assertstring(model["unit"])
        _.assertnumber(model["price"])
        _.assertstring(model["freqdaily"])
        _.assertnumber(model["days"])
        _.assertnumber(model["total"])
        _.assertnumber(model["money"])

    def new(self, stockout):
        self.fieldscheck(stockout)

        _.new({
            "name": stockout["name"],
            "standard": stockout["standard"],
            "dose": stockout["dose"],
            "unit": stockout["unit"],
            "price": stockout["price"],
            "freqdaily": stockout["freqdaily"],
            "days": stockout["days"],
            "total": stockout["total"],
            "money": stockout["money"]
        })

        return True

    def find(self, searchkey, begin, limit):
        result = []
        cond = {}
        if searchkey == '':
            logging.error('searchkey is empty')
            return False

        cond['name'] = re.compile(searchkey)

        for stockout in _.find(cond).skip(begin).limit(limit):
            result.append(stockout)

        return result

Stockout = StockoutClass()