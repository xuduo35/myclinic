#!/usr/bin/env python
#coding=utf8

import os
import sys
reload(sys)
sys.setdefaultencoding('utf8')
import json
from datetime import datetime, timedelta
import re
import moment
from dbfread import DBF
from bson import ObjectId
sys.path.append('.')
from db.users import User
from db.cases import Case
from db.historys import History
from mylog import logging
from util.cjsonencoder import CJsonEncoder
from util.str2bool import str2bool

u = User.find_one({'name':'admin'})

def cleanfield(field):
    return "" if field==None else field.strip('"').strip(',').strip('.')

table = DBF(sys.argv[1],char_decode_errors='ignore')

current = 0
tablelen = len(table)
nowtime = datetime.utcnow()

caseids = []
casetopicids = {}

for record in table:
    print current, tablelen

    gender = "unknown"

    if record[u"性别"] == "男":
        gender = "male"
    elif record[u"性别"] == "女":
        gender = "female"

    age = record[u'年龄']
    agestrs = re.findall(r"\d+", age)

    if len(agestrs) == 0:
        agestr = "0"
    else:
        agestr = agestrs[0]

    if '天' in age:
        age = int(agestr)
        ageUnit = 'day'
    elif '月' in age:
        age = int(agestr)
        ageUnit = 'month'
    else:
        age = int(agestr)
        ageUnit = 'year'

    married = 'unknown'

    if record[u"婚姻状况"] == "未婚":
        gender = "no"
    elif record[u"婚姻状况"] == "已婚":
        gender = "yes"

    if not record[u"病程记录"]:
        continue

    matchs = re.search(r"([0-9\s][0-9.\s]+[0-9])\s+([0-9][0-9:\s]+[0-9])", record[u"病程记录"])

    if not matchs:
        print json.dumps(record, cls=CJsonEncoder, encoding='UTF-8', ensure_ascii=False, indent=2) + ","
        continue

    datestr = matchs.group(1).replace(" ", "").replace(".", "-")[0:10]
    timestr = matchs.group(2).replace(" ", "")[0:8]

    if not re.search(r"\d\d\d\d-\d\d-\d\d", datestr) or not re.search(r"\d\d:\d\d:\d\d", timestr):
        print json.dumps(record, cls=CJsonEncoder, encoding='UTF-8', ensure_ascii=False, indent=2) + ","
        continue

    try:
        mydate = datetime.strptime(datestr + " " + timestr, '%Y-%m-%d %H:%M:%S')
    except Exception, e:
        print json.dumps(record, cls=CJsonEncoder, encoding='UTF-8', ensure_ascii=False, indent=2) + ","
        continue

    birthdate = moment.date(datestr + " " + timestr)

    if ageUnit == "year":
        birthdate = birthdate.subtract(years=age)
    elif ageUnit == "month":
        birthdate = birthdate.subtract(months=age)
    elif ageUnit == "day":
        birthdate = birthdate.subtract(days=age)

    birthdate = birthdate.done() # xxx: 转成datetime

    topicid = None

    thecase = Case.find_one({'name':record[u'姓名'],'gender':gender,'address':record[u'住址']})
    if thecase and (thecase['_id'] == thecase['topicid']):
        topicid = thecase['_id']

    History.new(
        {
            "topicid": topicid,
            "name": cleanfield(record[u"姓名"]),
            "date": moment.date(datestr + " " + timestr).done(),
            "idnumber": cleanfield(record[u"身份证"]),
            "gender": gender,
            "age": age,
            "ageUnit": ageUnit,
            "birthdate": birthdate,
            "phone": cleanfield(record[u"电话"]),
            "address": cleanfield(record[u"住址"]),
            "ethnic": "未知" if record[u"民族"]=="" or record[u"民族"]==None else record[u"民族"],
            "education": cleanfield(record[u"文化"]),
            "occupation": cleanfield(record[u"职业"]),
            "text": cleanfield(record[u"病程记录"]),
        },
        nowtime - timedelta(seconds=(tablelen-current))
    )

    current = current + 1

    #print json.dumps(record, cls=CJsonEncoder, encoding='UTF-8', ensure_ascii=False, indent=2)