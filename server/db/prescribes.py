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
from db.database import DataBase

_ = None

class PrescribeClass(DataBase):
    def __init__(self):
        global _
        _ = super(PrescribeClass, self)
        _.__init__('prescribes')

    def fieldscheck(self, model):
        _.assertlist(model["medicines"])

    def new(self, prescribe):
        self.fieldscheck(prescribe)

        p = _.find_one({'name':prescribe["name"]})

        if not p:
            return _.new({
                "name": prescribe["name"],
                "desc": prescribe["desc"],
                "medicines": prescribe["medicines"]
            })
        else:
            for key in ["name", "desc", "medicines"]:
              if prescribe.has_key(key):
                p[key] = prescribe[key]

            return _.save(p)

        return None

    def save(self, prescribe):
        _.assertid(prescribe["_id"])
        self.fieldscheck(prescribe)

        _.save(prescribe)

Prescribe = PrescribeClass()