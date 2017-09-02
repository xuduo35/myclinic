#!/usr/bin/env python
#coding=utf8

import sys
import json
from datetime import date
from datetime import datetime
from bson import ObjectId
sys.path.append("..")

class CJsonEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, datetime):
            return obj.strftime('%Y-%m-%d %H:%M:%S')
        elif isinstance(obj, date):
            return obj.strftime('%Y-%m-%d')
        elif isinstance(obj, ObjectId):
            return str(obj)
        else:
            return json.JSONEncoder.default(self, obj)

if __name__ == '__main__':
    d = {'now': datetime.now(), 'today': date.today(), 'i': 100}
    ds = json.dumps(d, cls=CJsonEncoder)
    print "ds type:", type(ds), "ds:", ds
    l = json.loads(ds)
    print "l  type:", type(l), "ds:", l