#!/usr/bin/env python
#coding=utf8

import os
import sys
import json
import math
import socket
import platform
import moment
from datetime import datetime, timedelta
from flask import session, Response, request, render_template, send_from_directory
from . import routes, root_dir, requires_auth
sys.path.append("..")
from db.users import User
from db.cases import Case
from db.notifications import Notification
from mylog import logging
from config import config
from util.cjsonencoder import CJsonEncoder

UPLOAD_FOLDER = config.data["imagepath"]
ALLOWED_EXTENSIONS = set(['png', 'jpg', 'jpeg', 'gif'])

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@routes.route('/api/user/login', methods=['POST'])
def user_login():
    body = request.get_json()
    name = body['name'].strip()
    pwd = body['pwd'].strip()

    if name == '' or pwd == '':
        response_data = {}
        response_data['status'] = 1
        response_data['msg'] = "用户名密码不能为空!"
        return Response(json.dumps(response_data), mimetype='application/json')

    u = User.find(name, pwd)

    if not u:
        response_data = {}
        response_data['status'] = 1
        response_data['msg'] = "用户名或密码错误不存在!"
        return Response(json.dumps(response_data), mimetype='application/json')

    session['sess'] = u['sess']

    response_data = {}
    response_data['status'] = 0
    response_data['msg'] = {}
    return Response(json.dumps(response_data), mimetype='application/json')

@routes.route('/api/user/logout', methods=['POST'])
@requires_auth
def user_logout(u):
    session.clear()

    response_data = {}
    response_data['status'] = 0
    response_data['msg'] = {}
    return Response(json.dumps(response_data), mimetype='application/json')

@routes.route('/api/user/profile', methods=['POST'])
@requires_auth
def user_profile(u):
    msg = {
        'notinum': Notification.count({}),
        'avatar': u['avatar']
    }
    response_data = {}
    response_data['status'] = 0
    response_data['msg'] = msg
    return Response(json.dumps(response_data, cls=CJsonEncoder), mimetype='application/json')

@routes.route('/api/user/setting', methods=['POST'])
@requires_auth
def user_setting(u):
    body = request.get_json()

    if not body.has_key('oldpwd'):
        response_data = {}
        response_data['status'] = 1
        response_data['msg'] = 'oldpwd is empty'
        return Response(json.dumps(response_data), mimetype='application/json')

    if not body.has_key('pwd'):
        response_data = {}
        response_data['status'] = 1
        response_data['msg'] = 'pwd is empty'
        return Response(json.dumps(response_data), mimetype='application/json')

    if u['pwd'] != body['oldpwd']:
        response_data = {}
        response_data['status'] = 1
        response_data['msg'] = '旧密码正确'
        return Response(json.dumps(response_data), mimetype='application/json')

    u['pwd'] = body['pwd'].strip()
    u['sess'] = User.generate_session_id()
    User.save(u)

    response_data = {}
    response_data['status'] = 0
    response_data['msg'] = {}
    return Response(json.dumps(response_data), mimetype='application/json')

localIP = "127.0.0.1"

if platform.system() != "Windows":
    localIP = "127.0.0.1"
else:
    localIP = socket.gethostbyname(socket.gethostname())

@routes.route('/api/site/home', methods=['POST'])
@requires_auth
def site_home(u):
    response_data = {}
    response_data['status'] = 0
    response_data['msg'] = 'http://'+localIP+':'+str(config.data['serverport'])
    return Response(json.dumps(response_data, cls=CJsonEncoder), mimetype='application/json')

@routes.route('/api/dashboard/stats', methods=['POST'])
@requires_auth
def dashboard_stats(u):
    msg = {
      'casenum': u['casenum'],
      'picsnum': u['picsnum'],
      'medsnum': u['medsnum'],
      'presnum': u['presnum'],
      'notifications': [], # xxx: 返回前面10条就好
      'fromstr': "从" + datetime.now().strftime("%Y-%m-%d %X") + "开始到现在",
      'agerange': u['agerange'],
      'recentdates': [],
      'recentcases': [],
      'serverurl': 'http://'+localIP+':'+str(config.data['serverport'])
    }

    datenums = {}
    thatday = moment.now()

    for i in range(0, 50):
        datenums[thatday.format('YYYY-MM-DD')] = 0
        thatday.subtract(days=1)

    thatday = moment.now()
    beforetime = moment.now().subtract(days=49) # xxx

    for value in Case.find({'date':{'$gt':beforetime.done(),'$lte':moment.now().done()}},{"date":1}):
        datestr = value['date'].strftime('%Y-%m-%d')
        datenums[datestr] = datenums[datestr] + 1

    # xxx: 使用aggregate速度并没有更快
    # aggres = Case.aggregate([
    #     { "$match": {'date':{'$gt':beforetime.done(),'$lte':moment.now().done()}} },
    #     { "$group": {
    #         "_id": {
    #             "year": { "$year": "$date" },
    #             "month": { "$month": "$date" },
    #             "day": { "$dayOfMonth": "$date" },
    #         },
    #         "totalCount": { "$sum": 1 }
    #     }},
    # ])

    # for aggr in aggres:
    #     datestr = moment.date([aggr["_id"]["year"], aggr["_id"]["month"], aggr["_id"]["day"]]).format('YYYY-MM-DD')
    #     datenums[datestr] = aggr["totalCount"]

    for i in range(0, 50):
        datestr = thatday.format('YYYY-MM-DD')
        msg['recentdates'].insert(0, datestr)
        msg['recentcases'].insert(0, datenums[datestr])
        thatday.subtract(days=1)

    msg["notifications"] = Notification.findbypage()

    response_data = {}
    response_data['status'] = 0
    response_data['msg'] = msg
    return Response(json.dumps(response_data, cls=CJsonEncoder), mimetype='application/json')

@routes.route('/api/notification/clear', methods=['POST'])
@requires_auth
def notification_clear(u):
    Notification.remove()

    response_data = {}
    response_data['status'] = 0
    response_data['msg'] = {}
    return Response(json.dumps(response_data), mimetype='application/json')

@routes.route('/api/picture/upload', methods=['POST'])
@requires_auth
def picture_upload(u):
    if 'file' not in request.files:
        response_data = {}
        response_data['status'] = 1
        response_data['msg'] = "没有文件存在"
        return Response(json.dumps(response_data), mimetype='application/json')

    myfile = request.files['file']

    if myfile.filename == '':
        response_data = {}
        response_data['status'] = 1
        response_data['msg'] = "没有文件存在"
        return Response(json.dumps(response_data), mimetype='application/json')

    if not allowed_file(myfile.filename):
        response_data = {}
        response_data['status'] = 1
        response_data['msg'] = "不支持的文件格式"
        return Response(json.dumps(response_data), mimetype='application/json')

    now = moment.now()
    monthstr = now.format('YYYY-MM')
    monthdir = os.path.join(UPLOAD_FOLDER, monthstr)
    filename = "pic-" + now.format('YYYY-MM-DD-HH-mm-ss') + ".jpg"

    if not os.path.exists(monthdir):
        os.mkdir(monthdir)

    myfile.save(os.path.join(monthdir, filename))

    u['picsnum'] = u['picsnum'] + 1
    User.save(u)

    response_data = {}
    response_data['status'] = 0
    response_data['msg'] = "/images/" + monthstr + "/" + filename
    return Response(json.dumps(response_data), mimetype='application/json')

@routes.route('/api/avatar/upload', methods=['POST'])
@requires_auth
def avatar_upload(u):
    if 'avatar' not in request.files:
        response_data = {}
        response_data['status'] = 1
        response_data['msg'] = "没有文件存在"
        return Response(json.dumps(response_data), mimetype='application/json')

    myfile = request.files['avatar']

    if myfile.filename == '':
        response_data = {}
        response_data['status'] = 1
        response_data['msg'] = "没有文件存在"
        return Response(json.dumps(response_data), mimetype='application/json')

    if not allowed_file(myfile.filename):
        response_data = {}
        response_data['status'] = 1
        response_data['msg'] = "不支持的文件格式"
        return Response(json.dumps(response_data), mimetype='application/json')

    filename = "avatar.jpg"
    filepath = os.path.join(UPLOAD_FOLDER, filename)

    os.unlink(filepath)
    myfile.save(filepath)

    u['avatar'] = "/images/" + filename
    User.save(u)

    response_data = {}
    response_data['status'] = 0
    response_data['msg'] = ['avatar']
    return Response(json.dumps(response_data), mimetype='application/json')

@routes.route('/api/picture/remove', methods=['POST'])
@requires_auth
def picture_remove(u):
    body = request.get_json()

    if not body.has_key("picpath"):
        response_data = {}
        response_data['status'] = 1
        response_data['msg'] = "picpath is empty"
        return Response(json.dumps(response_data), mimetype='application/json')

    if not body["picpath"].startswith('/images/'):
        response_data = {}
        response_data['status'] = 1
        response_data['msg'] = "picpath is illegal"
        return Response(json.dumps(response_data), mimetype='application/json')

    filepath = os.path.join(UPLOAD_FOLDER, body["picpath"][8:])
    os.unlink(filepath)

    u['picsnum'] = u['picsnum'] - 1

    if u['picsnum'] < 0:
        logging.error("picsnum less then zero")
        u['picsnum'] = 0

    User.save(u)

    response_data = {}
    response_data['status'] = 0
    response_data['msg'] = {}
    return Response(json.dumps(response_data), mimetype='application/json')
