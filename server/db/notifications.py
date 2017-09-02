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

class NotificationClass(DataBase):
    def __init__(self):
        global _
        _ = super(NotificationClass, self)
        _.__init__('notifications')

    def fieldscheck(self, model):
        _.assertstring(model["title"])
        _.assertstring(model["content"])

    def new(self, notification):
        self.fieldscheck(notification)

        _id = _.new({
            "title": notification["title"],
            "content": notification["content"]
        })

        return True


Notification = NotificationClass()