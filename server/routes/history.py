#!/usr/bin/env python
# coding=utf8

import sys
import json
import math
import re
import moment
from datetime import datetime, timedelta
from flask import session, Response, request, render_template, send_from_directory
from . import routes, root_dir, requires_auth
from bson import ObjectId
sys.path.append("..")
from db.historys import History
from mylog import logging
from util.cjsonencoder import CJsonEncoder
from util.str2bool import str2bool

@routes.route('/api/history/list', methods=['POST'])
@requires_auth
def history_list(u):
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

    historys = History.findbypage(cond, ps, begin)
    total = History.count(cond)

    response_data = {}
    response_data['status'] = 0
    response_data['msg'] = {
        'data': historys,
        'total': total
    }
    return Response(json.dumps(response_data, cls=CJsonEncoder), mimetype='application/json')

@routes.route('/api/history/infoByTopicId', methods=['POST'])
@requires_auth
def history_infobyid(u):
    body = request.get_json()
    topicid = body['topicid'].strip()

    history = History.find_one({"topicid":ObjectId(topicid)})

    response_data = {}

    if history != None:
        response_data['status'] = 0
        response_data['msg'] = history
    else:
        response_data['status'] = 1
        response_data['msg'] = "病程记录不存在"

    return Response(json.dumps(response_data, cls=CJsonEncoder), mimetype='application/json')


@routes.route('/api/history/remove', methods=['POST'])
@requires_auth
def history_removebyid(u):
    body = request.get_json()
    id = body['_id'].strip()

    History.removebyid(id)

    response_data = {}
    response_data['status'] = 0
    response_data['msg'] = {}
    return Response(json.dumps(response_data), mimetype='application/json')

@routes.route('/api/history/feedback', methods=['POST'])
@requires_auth
def history_feedback(u):
    body = request.get_json()
    _id = body['_id'].strip()
    feedback = body['feedback']

    if not isinstance(feedback, int):
        response_data = {}
        response_data['status'] = 1
        response_data['msg'] = "反馈超出范围"
        return Response(json.dumps(response_data), mimetype='application/json')

    h = History.findbyid(_id)

    if not h:
        response_data = {}
        response_data['status'] = 1
        response_data['msg'] = "病程记录不存在"
        return Response(json.dumps(response_data), mimetype='application/json')

    if feedback < 0 or feedback > 5:
        response_data = {}
        response_data['status'] = 1
        response_data['msg'] = "反馈超出范围"
        return Response(json.dumps(response_data), mimetype='application/json')

    h['feedback'] = feedback
    History.save(h)

    response_data = {}
    response_data['status'] = 0
    response_data['msg'] = {}
    return Response(json.dumps(response_data), mimetype='application/json')

@routes.route('/api/history/modify', methods=['POST'])
@requires_auth
def history_modify(u):
    body = request.get_json()
    response_data = {}
    response_data['status'] = 1
    response_data['msg'] = {}

    if not body.has_key('_id'):
        response_data['msg'] = '病程记录不存在'
        return Response(json.dumps(response_data), mimetype='application/json')

    history = History.findbyid(body['_id']);

    if not history:
        response_data['msg'] = '病程记录不存在'
        return Response(json.dumps(response_data), mimetype='application/json')

    history["text"] = body["text"]
    History.save(history)

    response_data = {}
    response_data['status'] = 0
    response_data['msg'] = {}
    return Response(json.dumps(response_data), mimetype='application/json')

@routes.route('/api/history/new', methods=['POST'])
@requires_auth
def history_new(u):
    body = request.get_json()
    response_data = {}
    response_data['status'] = 1
    response_data['msg'] = {}

    if not body.has_key('topicid'):
        response_data['msg'] = 'topicid不能为空'
        return Response(json.dumps(response_data), mimetype='application/json')

    history = History.find_one({"topicid":ObjectId(body["topicid"])})

    if history != None:
        history['text'] = body['text']
        History.save(history)

        response_data = {}
        response_data['status'] = 0
        response_data['msg'] = {}
        return Response(json.dumps(response_data), mimetype='application/json')

    body["topicid"] = ObjectId(body["topicid"])
    body["age"] = int(body["age"])
    body["birthdate"] = moment.date(body["birthdate"]).done()

    History.new(body)

    response_data = {}
    response_data['status'] = 0
    response_data['msg'] = {}
    return Response(json.dumps(response_data), mimetype='application/json')
