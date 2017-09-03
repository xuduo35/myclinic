#!/usr/bin/env python
#coding=utf8

import sys
import json
import math
import re
import random
from datetime import datetime
from bson import ObjectId
from . import dbclient
sys.path.append("..")
from mylog import logging
from database import DataBase

_ = None

class CaseClass(DataBase):
    def __init__(self):
        global _
        _ = super(CaseClass, self)
        _.__init__('cases')

    def fieldscheck(self, model):
        _.assertdate(model["date"])
        _.assertbool(model["first"])
        _.assertint(model["age"])
        _.assertdate(model["birthdate"])
        _.assertlist(model["exampics"])
        _.assertlist(model["diagnosises"])
        _.assertlist(model["medicines"])
        _.assertlist(model["pictures"])

        if model["topicid"] != None:
            _.assertid(model["topicid"])

    def new(self, case, created=None):
        self.fieldscheck(case)

        if case["ageUnit"] == 'day':
            ageAbs = case["age"]/365.0
        elif case["ageUnit"] == 'month':
            ageAbs = case["age"]/12.0
        elif case["ageUnit"] == 'year':
            ageAbs = case["age"]*1.0

        _id = _.new(
            {
                "topicid": case["topicid"],
                "name": case["name"],
                "first": case["first"],
                "date": case["date"],
                "idnumber": case["idnumber"],
                "gender": case["gender"],
                "age": case["age"],
                "ageUnit": case["ageUnit"],
                "ageAbs": ageAbs,
                "birthdate": case["birthdate"],
                "phone": case["phone"],
                "email": case["email"],
                "address": case["address"],
                "ethnic": case["ethnic"],
                "education": case["education"],
                "married": case["married"],
                "occupation": case["occupation"],
                "complaint": case["complaint"],
                "curr_complaint": case["curr_complaint"],
                "past_complaint": case["past_complaint"],
                "allergic": case["allergic"],
                "experience": case["experience"],
                "marriage": case["marriage"],
                "menses": case["menses"],
                "family": case["family"],
                "physical": case["physical"],
                "examination": case["examination"],
                "exampics": case["exampics"],
                "diagnosises": case["diagnosises"],
                "medicines": case["medicines"],
                "pictures": case["pictures"],
                "feedback": 0,
                "fetchflag": False, # xxx: 已经导入的数据可能并不存在这一字段
            },
            created,
        )

        if case["topicid"] == None:
            c = _.find_one({"_id": _id})

            if c == None:
                return False

            c["topicid"] = _id
            _.save(c)

        return _id

    def save(self, case):
        _.assertid(case["_id"])
        self.fieldscheck(case)

        ageAbs = 0

        if case["ageUnit"] == 'day':
            ageAbs = case["age"]/365.0
        elif case["ageUnit"] == 'month':
            ageAbs = case["age"]/12.0
        elif case["ageUnit"] == 'year':
            ageAbs = case["age"]*1.0

        case['ageAbs'] = ageAbs

        if case["topicid"] != None:
            _.assertid(case["topicid"])

        _.save(case)

Case = CaseClass()