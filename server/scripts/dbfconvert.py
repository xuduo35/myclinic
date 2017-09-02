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
from mylog import logging
from util.cjsonencoder import CJsonEncoder
from util.str2bool import str2bool

u = User.find_one({'name':'admin'})

def cleanfield(field):
    return "" if field==None else field.strip('"').strip(',').strip('.')

table = DBF(sys.argv[1])

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

    married = 'unknown'

    if record[u"婚姻状况"] == "未婚":
        gender = "no"
    elif record[u"婚姻状况"] == "已婚":
        gender = "yes"

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

    if record[u"日期"].year < 1900:
        continue

    mydatestr = record[u"日期"].strftime('%Y-%m-%d')+" "+record[u"时间"].replace(" ", "0")
    mydate = datetime.strptime(mydatestr, '%Y-%m-%d %H:%M:%S')

    birthdate = moment.date(mydatestr)

    if ageUnit == "year":
        birthdate = birthdate.subtract(years=age)
    elif ageUnit == "month":
        birthdate = birthdate.subtract(months=age)
    elif ageUnit == "day":
        birthdate = birthdate.subtract(days=age)

    birthdate = birthdate.done() # xxx: 转成datetime

    idx = 0
    medicines = []

    for medicine in record[u"处方笺"].split("\n"):
        fields = medicine.split("\t")
        if idx == 0:
            #print fields[6], cleanfield(record[u"初步诊断"])
            idx = idx + 1
            continue

        if len(fields) < 10:
            continue

        doseunit = fields[3]

        dose = 0
        unit = ""

        doses = re.findall(r"\d+", doseunit)
        units = re.findall(r"\D+", doseunit)

        if len(doses) > 0 and len(units) > 0:
            dose = int(doses[0])
            unit = "".join(units).strip('"').strip(',').strip('.')

        freqdaily = int(float(fields[4]))

        if freqdaily < 0:
            freqdaily = 0

        days = 0

        if len(fields[5]) > 1:
            days = int(float(fields[5]))

        medicines.append({
            "name": cleanfield(fields[1]),
            "standard": "",
            "dose": dose,
            "unit": unit,
            "price": 0,
            "freqdaily": freqdaily,
            "days": days,
            "total": float('%.2f' % (dose*freqdaily*days)),
            "money": 0,
            "prices": {},
            "usage": cleanfield(fields[6]),
            })
        idx = idx + 1
        #print json.dumps(fields, cls=CJsonEncoder, encoding='UTF-8', ensure_ascii=False, indent=2)

    #print json.dumps(medicines, cls=CJsonEncoder, encoding='UTF-8', ensure_ascii=False, indent=2)

    topicid = None

    if record[u"病案号"] in caseids:
        print cleanfield(record[u"姓名"])
        topicid = casetopicids[record[u"病案号"]]

    _id = Case.new(
        {
            "topicid": topicid,
            "name": cleanfield(record[u"姓名"]),
            "first": True if record[u"初复诊"]=="初诊" else False,
            "date": mydate,
            "idnumber": cleanfield(record[u"身份证"]),
            "gender": gender,
            "age": age,
            "ageUnit": ageUnit,
            "birthdate": birthdate,
            "phone": cleanfield(record[u"电话"]),
            "email": "",
            "address": cleanfield(record[u"单位"]),
            "ethnic": "未知" if record[u"民族"]=="" or record[u"民族"]==None else record[u"民族"],
            "education": cleanfield(record[u"文化"]),
            "married": married,
            "occupation": cleanfield(record[u"职业"]),
            "complaint": cleanfield(record[u"主诉"]),
            "curr_complaint": cleanfield(record[u"现病史"]),
            "past_complaint": cleanfield(record[u"既往史"]),
            "allergic": cleanfield(record[u"药物过敏史"]),
            "experience": cleanfield(record[u"个人史"]),
            "marriage": cleanfield(record[u"婚育史"]),
            "menses": cleanfield(record[u"月经史"]),
            "family": cleanfield(record[u"家庭史"]),
            "physical": cleanfield(record[u"体格检查"]),
            "examination": cleanfield(record[u"辅助检查"]),
            "exampics": [],
            "diagnosises": [cleanfield(record[u"初步诊断"])],
            "medicines": medicines,
            "pictures": [],
        },
        nowtime - timedelta(seconds=(tablelen-current))
        )

    if not record[u"病案号"] in caseids:
        caseids.append(record[u"病案号"])
        casetopicids[record[u"病案号"]] = _id

    u['casenum'] = u['casenum'] + 1

    ageidx = User.ageidx(age, ageUnit)
    u['agerange'][ageidx] = u['agerange'][ageidx] + 1

    User.save(u)

    current = current + 1

    #print json.dumps(record, cls=CJsonEncoder, encoding='UTF-8', ensure_ascii=False, indent=2)