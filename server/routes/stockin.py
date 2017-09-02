#!/usr/bin/env python
#coding=utf8

import sys
import json
import math
import re
import moment
from datetime import datetime, timedelta
from flask import session, Response, request, render_template, send_from_directory
from . import routes, root_dir, requires_auth
sys.path.append("..")
from db.stockins import Stockin
from mylog import logging
from util.cjsonencoder import CJsonEncoder
from util.str2bool import str2bool

@routes.route('/api/stockin/list', methods=['POST'])
@requires_auth
def stockin_list(u):
    body = request.get_json()
    searchkey = body['searchkey'].strip()
    daterangeflag = str2bool(body['daterangeflag'])

    ps = body['ps']
    pn = body['pn'] - 1

    if ps < 0:
        ps = 10

    if pn < 0:
        pn = 0

    begin = ps * pn
    cond = {'name': re.compile(searchkey)} if searchkey != '' else {}

    if daterangeflag:
        daterange = body['daterange']
        fromdate = moment.date(daterange[0])
        enddate = moment.date(daterange[1])
        cond['created'] = {'$gte':fromdate.done(),'$lte':enddate.done()}

    stockins = Stockin.findbypage(cond, ps, begin)
    total = Stockin.count(cond)

    response_data = {}
    response_data['status'] = 0
    response_data['msg'] = {
        'data': stockins,
        'total': total
    }
    return Response(json.dumps(response_data, cls=CJsonEncoder), mimetype='application/json')

@routes.route('/api/stockin/remove', methods=['POST'])
@requires_auth
def stockin_infobyid(u):
    body = request.get_json()
    id = body['_id']#.trim()

    Stockin.removebyid(id)

    response_data = {}
    response_data['status'] = 0
    response_data['msg'] = {}
    return Response(json.dumps(response_data), mimetype='application/json')

