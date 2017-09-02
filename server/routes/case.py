#!/usr/bin/env python
# coding=utf8

import sys
reload(sys)
sys.setdefaultencoding('utf8')
import json
import math
import re
import moment
from datetime import datetime, timedelta
from flask import session, Response, request, render_template, send_from_directory
from . import routes, root_dir, requires_auth
from bson import ObjectId
sys.path.append("..")
from db.users import User
from db.cases import Case
from db.stockins import Stockin
from db.stockouts import Stockout
from db.medicines import Medicine
from db.notifications import Notification
from mylog import logging
from util.cjsonencoder import CJsonEncoder
from util.str2bool import str2bool

@routes.route('/api/case/list', methods=['POST'])
@requires_auth
def case_list(u):
    body = request.get_json()
    searchfeedback = body['searchfeedback'].strip()
    searchkey = body['searchkey'].strip()
    searchtype = body['searchtype'].strip()
    searchgender = body['searchgender']
    searchageflag = str2bool(body['searchageflag'])
    daterangeflag = str2bool(body['daterangeflag'])

    ps = body['ps']
    pn = body['pn'] - 1

    if ps < 0:
        ps = 10

    if pn < 0:
        pn = 0

    begin = ps * pn

    cond = {}
    print searchfeedback
    if searchfeedback == "fb0":
        cond['feedback'] = 0
    elif searchfeedback == "fb1":
        cond['feedback'] = 1
    elif searchfeedback == "fb2":
        cond['feedback'] = 2
    elif searchfeedback == "fb3":
        cond['feedback'] = 3
    elif searchfeedback == "fb4":
        cond['feedback'] = 4
    elif searchfeedback == "fb5":
        cond['feedback'] = 5

    if searchkey != '':
        cond[searchtype] = re.compile(searchkey)

    if searchgender != 'all':
        cond['gender'] = searchgender

    if searchageflag:
        try:
            searchagelow = int(body['searchagelow'])
            searchagehigh = int(body['searchagehigh'])
        except Exception, e:
            searchagelow = 0
            searchagehigh = 100

        cond['ageAbs'] = {'$gte':searchagelow,'$lte':searchagehigh}

    if daterangeflag:
        daterange = body['daterange']
        fromdate = moment.date(daterange[0])
        enddate = moment.date(daterange[1])
        cond['date'] = {'$gte':fromdate.done(),'$lte':enddate.done()}

    cases = Case.findbypage(cond, ps, begin)
    total = Case.count(cond)

    response_data = {}
    response_data['status'] = 0
    response_data['msg'] = {
        'data': cases,
        'total': total
    }
    return Response(json.dumps(response_data, cls=CJsonEncoder), mimetype='application/json')


@routes.route('/api/case/names', methods=['POST'])
@requires_auth
def case_names(u):
    body = request.get_json()
    searchkey = body['searchkey'].strip()

    names = []
    items = Case.find10items(searchkey)

    for item in items:
        if not item['name'] in names:
            names.append(item['name'])

    response_data = {}
    response_data['status'] = 0
    response_data['msg'] = {
        'names': names,
        'cases': items,
    }
    return Response(json.dumps(response_data, cls=CJsonEncoder), mimetype='application/json')


@routes.route('/api/case/infoById', methods=['POST'])
@requires_auth
def case_infobyid(u):
    body = request.get_json()
    _id = body['_id'].strip()

    case = Case.findbyid(_id)

    response_data = {}
    response_data['status'] = 0
    response_data['msg'] = case
    return Response(json.dumps(response_data, cls=CJsonEncoder), mimetype='application/json')


@routes.route('/api/case/remove', methods=['POST'])
@requires_auth
def case_removebyid(u):
    body = request.get_json()
    _id = body['_id'].strip()

    Case.removebyid(_id)

    u['casenum'] = u['casenum'] - 1

    if u['casenum'] < 0:
        logging.error("casenum less then zero")
        u['casenum'] = 0

    User.save(u)

    response_data = {}
    response_data['status'] = 0
    response_data['msg'] = {}
    return Response(json.dumps(response_data), mimetype='application/json')

@routes.route('/api/case/feedback', methods=['POST'])
@requires_auth
def case_feedback(u):
    body = request.get_json()
    _id = body['_id'].strip()
    feedback = body['feedback']

    if not isinstance(feedback, int):
        response_data = {}
        response_data['status'] = 1
        response_data['msg'] = "反馈超出范围"
        return Response(json.dumps(response_data), mimetype='application/json')

    c = Case.findbyid(_id)

    if not c:
        response_data = {}
        response_data['status'] = 1
        response_data['msg'] = "病例不存在"
        return Response(json.dumps(response_data), mimetype='application/json')

    if feedback < 0 or feedback > 5:
        response_data = {}
        response_data['status'] = 1
        response_data['msg'] = "反馈超出范围"
        return Response(json.dumps(response_data), mimetype='application/json')

    c['feedback'] = feedback
    Case.save(c)

    response_data = {}
    response_data['status'] = 0
    response_data['msg'] = {}
    return Response(json.dumps(response_data), mimetype='application/json')

@routes.route('/api/case/modify', methods=['POST'])
@requires_auth
def case_modify(u):
    body = request.get_json()

    response_data = {}
    response_data['status'] = 1
    response_data['msg'] = {}

    if not body.has_key('_id'):
        response_data['msg'] = '病例不存在'
        return Response(json.dumps(response_data), mimetype='application/json')

    onecase = Case.findbyid(body['_id']);

    if not onecase:
        response_data['msg'] = '病例不存在'
        return Response(json.dumps(response_data), mimetype='application/json')

    if not body.has_key('medicines'):
        response_data['msg'] = 'medicines is empty'
        return Response(json.dumps(response_data), mimetype='application/json')

    onecase['first'] = str2bool(body['first'])

    # xxx: 无论如何转换成整数
    body["age"] = int(body["age"])

    # 就诊日期减去年龄就是生日, 这样复诊的时候, 年龄可以自动计算,
    #birthdate = datetime.strptime(body["date"], "%Y-%m-%dT%H:%M:%S.%fZ")
    birthdate = moment.date(body["date"])

    if body["ageUnit"] == "year":
        birthdate = birthdate.subtract(years=body["age"])
    elif body["ageUnit"] == "month":
        birthdate = birthdate.subtract(months=body["age"])
    elif body["ageUnit"] == "day":
        birthdate = birthdate.subtract(days=body["age"])

    birthdate = birthdate.done() # xxx: 转成datetime
    onecase["birthdate"] = birthdate

    diagnosises = []

    for i in range(4):
        if body.has_key('diagnosis' + str(i)):
            diagnosises.append(body['diagnosis' + str(i)])
            del body['diagnosis' + str(i)]

    if len(diagnosises) != 0:
        body["diagnosises"] = diagnosises

    for key in onecase:
        if body.has_key(key) and key not in ["_id", "topicid", "birthdate", "created", "lastmod"]:
            onecase[key] = body[key]

    # xxx: 转换日期
    onecase["date"] = moment.date(body["date"]).done()

    try:
        Case.save(onecase)
    except Exception, e:
        response_data = {}
        response_data['status'] = 1
        response_data['msg'] = "修改病例失败"
        return Response(json.dumps(response_data), mimetype='application/json')

    # xxx: 编辑病例的时候不处理药品出货问题

    response_data = {}
    response_data['status'] = 0
    response_data['msg'] = {}
    return Response(json.dumps(response_data), mimetype='application/json')


@routes.route('/api/case/new', methods=['POST'])
@requires_auth
def case_new(u):
    body = request.get_json()
    response_data = {}
    response_data['status'] = 1
    response_data['msg'] = {}

    if not body.has_key('topicid'):
        logging.error('topicid is empty')
        response_data['msg'] = 'topicid is empty'
        return Response(json.dumps(response_data), mimetype='application/json')

    if body['topicid'] != None:
        body['topicid'] = ObjectId(body['topicid'])

    if not body.has_key('first'):
        logging.error('first is empty')
        response_data['msg'] = 'first is empty'
        return Response(json.dumps(response_data), mimetype='application/json')

    body['first'] = str2bool(body['first'])

    if not body.has_key('medicines'):
        logging.error('medicines is empty')
        response_data['msg'] = 'medicines is empty'
        return Response(json.dumps(response_data), mimetype='application/json')

    for medicine in body["medicines"]:
        if not medicine.has_key('name'):
            logging.error('name or tradename is empty')
            response_data['msg'] = 'name or tradename is empty'
            return Response(json.dumps(response_data), mimetype='application/json')

        if not medicine.has_key('standard'):
            logging.error('standard is empty')
            response_data['msg'] = 'standard is empty'
            return Response(json.dumps(response_data), mimetype='application/json')

    # xxx: 无论如何转换成整数
    body["age"] = int(body["age"])

    # 就诊日期减去年龄就是生日, 这样复诊的时候, 年龄可以自动计算,
    #birthdate = datetime.strptime(body["date"], "%Y-%m-%dT%H:%M:%S.%fZ")
    birthdate = moment.date(body["date"])

    if body["ageUnit"] == "year":
        birthdate = birthdate.subtract(years=body["age"])
    elif body["ageUnit"] == "month":
        birthdate = birthdate.subtract(months=body["age"])
    elif body["ageUnit"] == "day":
        birthdate = birthdate.subtract(days=body["age"])

    birthdate = birthdate.done() # xxx: 转成datetime
    body["birthdate"] = birthdate

    body["diagnosises"] = []

    for i in range(4):
        if body.has_key('diagnosis' + str(i)):
            body['diagnosises'].append(body['diagnosis' + str(i)])

    # xxx: 转换日期
    body["date"] = moment.date(body["date"]).done()

    try:
        Case.new(body)
    except Exception, e:
        response_data = {}
        response_data['status'] = 1
        response_data['msg'] = "新建病例失败"
        return Response(json.dumps(response_data), mimetype='application/json')

    # 必须在添加病例之后
    for medicine in body['medicines']:
        name = medicine["name"]
        tradename = ""

        if name.find("(") and name.find(")"):
            matchs = re.match("(.*)\((.*)\)", name)
            name = matchs.group(1)
            tradename = matchs.group(2)

        m = Medicine.find_one({'name':name,'tradename':tradename})

        if m != None:
            if m["remain"] > 0:
                Stockout.new({
                    "name": medicine["name"],
                    "standard": medicine["standard"],
                    "dose": medicine["dose"],
                    "unit": medicine["unit"],
                    "price": medicine["price"],
                    "freqdaily": medicine["freqdaily"],
                    "days": medicine["days"],
                    "total": medicine["total"],
                    "money": medicine["money"]
                })

                total = float(medicine["total"])
                units = m["prices"].keys()

                if medicine['unit'] in units:
                    unit = medicine['unit']
                    maxunit = units[0]
                    minnumber = m["prices"][maxunit]["number"]

                    for key in units:
                        if m["prices"][key]["number"] < minnumber:
                            minnumber = m["prices"][key]["number"]

                    m["remain"] = m["remain"] - (total * float(minnumber) / float(m["prices"][unit]["number"]))

                    if m["remain"] < 0:
                        m["remain"] = 0

                        Notification.new({
                            "title":"药品",
                            "content":u""+medicine["name"]+" 缺货"
                        })

                    Medicine.save(m)

    # 病人年龄范围统计
    ageidx = User.ageidx(body["age"], body["ageUnit"])
    u['agerange'][ageidx] = u['agerange'][ageidx] + 1

    u['casenum'] = u['casenum'] + 1
    User.save(u)

    response_data['status'] = 0
    response_data['msg'] = {}
    return Response(json.dumps(response_data), mimetype='application/json')


@routes.route('/api/case/topic', methods=['POST'])
@requires_auth
def case_topic(u):
    body = request.get_json()
    topicid = body['topicid'].strip()

    cases = [case for case in Case.find({'topicid':ObjectId(topicid)})]

    response_data = {}
    response_data['status'] = 0
    response_data['msg'] = cases
    return Response(json.dumps(response_data, cls=CJsonEncoder), mimetype='application/json')
