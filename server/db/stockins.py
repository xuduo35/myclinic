#!/usr/bin/env python
# coding=utf8

import sys
import json
import math
import random
from datetime import datetime
from bson import ObjectId
import re
from . import dbclient
sys.path.append("..")
from database import DataBase
from mylog import logging

_ = None

class StockinClass(DataBase):
    def __init__(self):
        global _
        _ = super(StockinClass, self)
        _.__init__('stockins')

    def new(self, stockin):
        _.new({
            "name": stockin["name"],
            "tradename": stockin["tradename"],
            "standard": stockin["standard"],
            "price": stockin["price"],
            "number": stockin["number"]
        })

        return False


    def find(self, searchkey, begin, limit):
        if searchkey == '':
            logging.error('searchkey is empty')
            return False

        cond = {}
        cond['name'] = re.compile(searchkey)

        result = []

        for stockin in _.find(cond).skip(begin).limit(limit):
            result.append(stockin)

        return result

Stockin = StockinClass()