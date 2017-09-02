#!/usr/bin/env python
#coding=utf8

import sys
import json
from datetime import date
from datetime import datetime
from bson import ObjectId
sys.path.append("..")

def str2bool(str):
    if isinstance(str, bool):
        return str

    return (True if str == 'True' else False)