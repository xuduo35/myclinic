#!/usr/bin/env python
#coding=utf8

import sys
import json
import math
import re
from datetime import datetime, timedelta
from flask import session, Response, request, render_template, send_from_directory
from . import routes, root_dir, requires_auth
from bson import ObjectId
sys.path.append("..")
from db.users import User
from db.prescribes import Prescribe
import db.stockins as Stockin
from mylog import logging
from util.cjsonencoder import CJsonEncoder

@routes.route('/api/prescribe/list', methods=['POST'])
@requires_auth
def prescribe_list(u):
    body = request.get_json()
    searchkey = body['searchkey'].strip()
    ps = body['ps']
    pn = body['pn'] - 1

    if ps < 0:
        ps = 10

    if pn < 0:
        pn = 0

    begin = ps * pn
    cond = {'name': re.compile(searchkey)} if searchkey != '' else {}

    prescribes = Prescribe.findbypage(cond, ps, begin)
    total = Prescribe.countbytype(searchkey)

    response_data = {}
    response_data['status'] = 0
    response_data['msg'] = {
        'data': prescribes,
        'total': total
    }
    return Response(json.dumps(response_data, cls=CJsonEncoder), mimetype='application/json')

@routes.route('/api/prescribe/names', methods=['POST'])
@requires_auth
def prescribe_names(u):
    body = request.get_json()
    searchkey = body['searchkey'].strip()

    names = []
    items = Prescribe.find10items(searchkey)

    for item in items:
        if not item['name'] in names:
            names.append(item['name'])

    response_data = {}
    response_data['status'] = 0
    response_data['msg'] = names
    return Response(json.dumps(response_data, cls=CJsonEncoder), mimetype='application/json')

@routes.route('/api/prescribe/info', methods=['POST'])
@requires_auth
def prescribe_info(u):
    body = request.get_json()
    name = body['name'].strip()

    prescribe = Prescribe.find_one({'name':name})

    if not prescribe:
        response_data = {}
        response_data['status'] = 1
        response_data['msg'] = "处方不存在"
        return Response(json.dumps(response_data, cls=CJsonEncoder), mimetype='application/json')

    response_data = {}
    response_data['status'] = 0
    response_data['msg'] = prescribe['medicines']
    return Response(json.dumps(response_data, cls=CJsonEncoder), mimetype='application/json')

@routes.route('/api/prescribe/remove', methods=['POST'])
@requires_auth
def prescribe_infobyid(u):
    body = request.get_json()
    id = body['_id'].strip()

    Prescribe.removebyid(id)

    u['presnum'] = u['presnum'] - 1

    if u['presnum'] < 0:
        logging.error("presnum less then zero")
        u['presnum'] = 0

    User.save(u)

    response_data = {}
    response_data['status'] = 0
    response_data['msg'] = {}
    return Response(json.dumps(response_data), mimetype='application/json')

@routes.route('/api/prescribe/new', methods=['POST'])
@requires_auth
def prescribe_new(u):
    body = request.get_json()
    name = body["name"].strip()
    desc = body["desc"]
    medicines = body["medicines"]

    if name == '':
        logging.error('name is empty')
        response_data = {}
        response_data['status'] = 1
        response_data['msg'] = "名字不能为空"
        return Response(json.dumps(response_data), mimetype='application/json')

    if type(medicines) != type([]):
        logging.error('medicines is not list')
        response_data = {}
        response_data['status'] = 1
        response_data['msg'] = "药品格式不对"
        return Response(json.dumps(response_data), mimetype='application/json')

    Prescribe.new({
        "name": name,
        "desc": desc,
        "medicines": medicines
    })

    u['presnum'] = u['presnum'] + 1
    User.save(u)

    response_data = {}
    response_data['status'] = 0
    response_data['msg'] = {}
    return Response(json.dumps(response_data), mimetype='application/json')

@routes.route('/api/prescribe/modify', methods=['POST'])
@requires_auth
def prescribe_modify(u):
    body = request.get_json()

    if not body.has_key('_id'):
        response_data = {}
        response_data['status'] = 1
        response_data['msg'] = "处方不存在"
        return Response(json.dumps(response_data), mimetype='application/json')

    prescribe = Prescribe.findbyid(body['_id'].strip())

    if body.has_key('name'):
        p = Prescribe.find_one({'name':body['name'],'_id':{'$ne':ObjectId(body['_id'])}})

        if p != None:
            response_data = {}
            response_data['status'] = 1
            response_data['msg'] = "同名处方已经存在"
            return Response(json.dumps(response_data), mimetype='application/json')

        prescribe['name'] = body['name']

    if body.has_key('desc'):
        prescribe['desc'] = body['desc']

    if body.has_key('medicines'):
        prescribe['medicines'] = body['medicines']

    try:
        Prescribe.save(prescribe)
    except Exception, e:
        response_data = {}
        response_data['status'] = 1
        response_data['msg'] = "更新处方失败"
        return Response(json.dumps(response_data), mimetype='application/json')

    response_data = {}
    response_data['status'] = 0
    response_data['msg'] = "更新处方失败"
    return Response(json.dumps(response_data), mimetype='application/json')
