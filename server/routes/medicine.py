#!/usr/bin/env python
#coding=utf8

import sys
import json
import math
import re
import moment
from datetime import datetime, timedelta
from bson import ObjectId
from flask import session, Response, request, render_template, send_from_directory
from . import routes, root_dir, requires_auth
sys.path.append("..")
from db.users import User
from db.medicines import Medicine
from db.stockins import Stockin
from db.stockouts import Stockout
from mylog import logging
from util.cjsonencoder import CJsonEncoder

@routes.route('/api/medicine/list', methods=['POST'])
@requires_auth
def medicine_list(u):
    body = request.get_json()
    searchkey = body['searchkey'].strip()
    searchorder = body['searchorder'].strip()

    ps = body['ps']
    pn = body['pn'] - 1

    if ps < 0:
        ps = 10

    if pn < 0:
        pn = 0

    begin = ps * pn

    medicines = Medicine.find(searchkey, searchorder, begin, ps)
    total = Medicine.count(searchkey)

    response_data = {}
    response_data['status'] = 0
    response_data['msg'] = {
        'data': medicines,
        'total': total
    }

    return Response(json.dumps(response_data, cls=CJsonEncoder), mimetype='application/json')


@routes.route('/api/medicine/names', methods=['POST'])
@requires_auth
def medicine_names(u):
    body = request.get_json()

    searchkey = body['searchkey'].strip()

    cond = {'name': re.compile(searchkey)} if searchkey != '' else {}
    medicines = Medicine.findbypage(cond, 10, 0)

    response_data = {}
    response_data['status'] = 0
    response_data['msg'] = medicines
    return Response(json.dumps(response_data, cls=CJsonEncoder), mimetype='application/json')

@routes.route('/api/medicine/info', methods=['POST'])
@requires_auth
def medicine_info(u):
    body = request.get_json()
    name = body['name'].strip()
    tradename = body['tradename'].strip()

    medicine = Medicine.find_one({'name':name, 'tradename':tradename})

    if not medicine:
        response_data = {}
        response_data['status'] = 1
        response_data['msg'] = "药物不存在"
        return Response(json.dumps(response_data, cls=CJsonEncoder), mimetype='application/json')

    response_data = {}
    response_data['status'] = 0
    response_data['msg'] = medicine
    return Response(json.dumps(response_data, cls=CJsonEncoder), mimetype='application/json')

@routes.route('/api/medicine/infobyid', methods=['POST'])
@requires_auth
def medicine_infobyid(u):
    body = request.get_json()
    id = body['_id'].strip()

    response_data = {}
    response_data['status'] = 1
    response_data['msg'] = '没有找到'

    if id != '':
        medicine = Medicine.findbyid(id)
        response_data['status'] = 0
        response_data['msg'] = medicine

    return Response(json.dumps(response_data, cls=CJsonEncoder), mimetype='application/json')

@routes.route('/api/medicine/remove', methods=['POST'])
@requires_auth
def medicine_remove(u):
    body = request.get_json()
    id = body['_id'].strip()

    if id != '':
        Medicine.removebyid(id)

        u['medsnum'] = u['medsnum'] - 1

        if u['medsnum'] < 0:
            logging.error("medsnum less then zero")
            u['medsnum'] = 0

        User.save(u)

    response_data = {}
    response_data['status'] = 0 if id != '' else 1
    response_data['msg'] = {}
    return Response(json.dumps(response_data, cls=CJsonEncoder), mimetype='application/json')

@routes.route('/api/medicine/modify', methods=['POST'])
@requires_auth
def medicine_modify(u):
    body = request.get_json()

    # xxx: 两个字段必须同时存在
    if body.has_key('name') or body.has_key('tradename'):
        if not body.has_key('name') or not body.has_key('tradename'):
            response_data = {}
            response_data['status'] = 1
            response_data['msg'] = '药品名和商品名必须同时存在!'
            return Response(json.dumps(response_data, cls=CJsonEncoder), mimetype='application/json')

        body['name'] = body['name'].strip()
        body['tradename'] = body['tradename'].strip()

        if (body['name'].find("(") >= 0) or (body['name'].find(")") >= 0):
            response_data = {}
            response_data['status'] = 1
            response_data['msg'] = '药品名字不合法!'
            return Response(json.dumps(response_data, cls=CJsonEncoder), mimetype='application/json')

        if (body['tradename'].find("(") >= 0) or (body['tradename'].find(")") >= 0):
            response_data = {}
            response_data['status'] = 1
            response_data['msg'] = '药品商品名不合法!'
            return Response(json.dumps(response_data, cls=CJsonEncoder), mimetype='application/json')

        m = Medicine.find_one({'name':body['name'],'tradename':body['tradename'],'_id':{'$ne':ObjectId(body['_id'])}})

        if m != None:
            response_data = {}
            response_data['status'] = 1
            response_data['msg'] = '相同名字药品已经存在!'
            return Response(json.dumps(response_data, cls=CJsonEncoder), mimetype='application/json')

    m = Medicine.findbyid(body['_id'])

    if not m:
        response_data = {}
        response_data['status'] = 1
        response_data['msg'] = '药物不存在'
        return Response(json.dumps(response_data, cls=CJsonEncoder), mimetype='application/json')

    keys = ["name", "tradename", "standard", "type", "stdprice", "remain", "link", "spec", "defaultUnit", "usage", "prices"]

    for key in keys:
      if body.has_key(key):
        m[key] = body[key]

    Medicine.save(m)

    response_data = {}
    response_data['status'] = 0
    response_data['msg'] = {}
    return Response(json.dumps(response_data, cls=CJsonEncoder), mimetype='application/json')

@routes.route('/api/medicine/new', methods=['POST'])
@requires_auth
def medicine_new(u):
    body = request.get_json()

    response_data = {}
    response_data['status'] = 1
    response_data['msg'] = {}

    if body.has_key('name') or body.has_key('tradename'):
        if not body.has_key('name') or not body.has_key('tradename'):
            response_data = {}
            response_data['status'] = 1
            response_data['msg'] = '药品名和商品名必须同时存在!'
            return Response(json.dumps(response_data, cls=CJsonEncoder), mimetype='application/json')

        body['name'] = body['name'].strip()
        body['tradename'] = body['tradename'].strip()

        if (body['name'].find("(") >= 0) or (body['name'].find(")") >= 0):
            response_data = {}
            response_data['status'] = 1
            response_data['msg'] = '药品名字不合法!'
            return Response(json.dumps(response_data, cls=CJsonEncoder), mimetype='application/json')

        if (body['tradename'].find("(") >= 0) or (body['tradename'].find(")") >= 0):
            response_data = {}
            response_data['status'] = 1
            response_data['msg'] = '药品商品名不合法!'
            return Response(json.dumps(response_data, cls=CJsonEncoder), mimetype='application/json')

        m = Medicine.find_one({'name':body['name'],'tradename':body['tradename']})

        if m != None:
            response_data = {}
            response_data['status'] = 1
            response_data['msg'] = '相同名字药品已经存在!'
            return Response(json.dumps(response_data, cls=CJsonEncoder), mimetype='application/json')

    if not body.has_key('standard'):
        logging.error('standard is empty')
        response_data['msg'] = 'standard is empty'
        return Response(json.dumps(response_data), mimetype='application/json')

    if not body.has_key('type'):
        logging.error('type is empty')
        response_data['msg'] = 'type is empty'
        return Response(json.dumps(response_data), mimetype='application/json')

    if not body.has_key('prices') or len(body['prices'].keys()) == 0:
        logging.error('prices is empty')
        response_data['msg'] = 'prices is empty'
        return Response(json.dumps(response_data), mimetype='application/json')

    body['stdprice'] = float(body['stdprice'])

    response_data['status'] = 0
    Medicine.new(body)

    u['medsnum'] = u['medsnum'] + 1
    User.save(u)

    return Response(json.dumps(response_data, cls=CJsonEncoder), mimetype='application/json')

@routes.route('/api/medicine/stock', methods=['POST'])
@requires_auth
def medicine_stock(u):
    body = request.get_json()

    _id = body["_id"].strip()
    stockmedprice = float(body["stockmedprice"])
    stockmednumber = float(body["stockmednumber"])

    response_data = {}
    response_data['status'] = 1
    response_data['msg'] = {}

    medicine = Medicine.findbyid(_id)

    if not medicine:
        return Response(json.dumps(response_data, cls=CJsonEncoder), mimetype='application/json')

    medicine["remain"] = medicine["remain"] + stockmednumber
    Medicine.save(medicine)

    Stockin.new({
        "name": medicine["name"],
        "tradename": medicine["tradename"],
        "standard": medicine["standard"],
        "price": stockmedprice,
        "number": stockmednumber
    })

    return Response(json.dumps(response_data, cls=CJsonEncoder), mimetype='application/json')
