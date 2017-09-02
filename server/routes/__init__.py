#!/usr/bin/env python
#coding=utf8

import os
import sys
from flask import Blueprint
from flask import session, Response, request, render_template, send_from_directory
from functools import wraps
sys.path.append("..")
from db.users import User
from mylog import logging

routes = Blueprint('routes', __name__)
root_dir = os.getcwd()+'/public'

def check_auth():
    if not session.has_key('sess'):
        return None
    u = User.findbysess(session['sess'])
    return u

def authenticate():
    response_data = {}
    response_data['status'] = 1
    response_data['msg'] = {}
    return Response(json.dumps(response_data), mimetype='application/json')

def requires_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        u = check_auth()
        if not u:
            return authenticate()
        return f(u, *args, **kwargs)
    return decorated

# xxx: import之后, 函数都在一个名字空间下, 所以不能重名, 与routes方式不同
from .index import *
from .user import *
from .medicine import *
from .stockin import *
from .stockout import *
from .case import *
from .prescribe import *
from .history import *