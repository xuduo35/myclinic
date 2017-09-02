#!/usr/bin/env python
#coding=utf8

import sys
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

class HistoryClass(DataBase):
    def __init__(self):
        global _
        _ = super(HistoryClass, self)
        _.__init__('historys')

    def fieldscheck(self, model):
        if model["topicid"] != None:
            _.assertid(model["topicid"])
        _.assertint(model["age"])
        _.assertdate(model["date"])
        _.assertdate(model["birthdate"])

    def new(self, history, created=None):
        self.fieldscheck(history)

        _id = _.new(
            {
                "topicid": history["topicid"],
                "name": history["name"],
                "date": history["date"],
                "idnumber": history["idnumber"],
                "gender": history["gender"],
                "age": history["age"],
                "ageUnit": history["ageUnit"],
                "birthdate": history["birthdate"],
                "phone": history["phone"],
                "address": history["address"],
                "ethnic": history["ethnic"],
                "education": history["education"],
                "occupation": history["occupation"],
                "text": history["text"],
                "feedback": 0,
            },
            created,
            )

        if not history["topicid"]:
            h = _.find_one({"_id": _id})

            if h == None:
                return False

            h["topicid"] = _id
            _.save(h)

    def save(self, history):
        _.assertid(history["_id"])
        self.fieldscheck(history)

        _.save(history)

History = HistoryClass()