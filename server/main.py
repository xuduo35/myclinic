#!/usr/bin/env python
#coding=utf8

import os
import sys
from flask import Flask
from routes import *
from db.users import User
from mylog import logging
from config import config

User.createadmin()

app = Flask(__name__)
app.secret_key = 'F12Zr47j\3yX R~X@H!jmM]Lwf/,?KT'
app.register_blueprint(routes)

# No cacheing at all for API endpoints.
@app.after_request
def add_header(response):
    # response.cache_control.no_store = True
    if 'Cache-Control' not in response.headers:
        response.headers['Cache-Control'] = 'no-store'
    else:
        response.cache_control.max_age = 300
    return response

serverport = config.data["serverport"]

if __name__ == '__main__':
    if len(sys.argv) > 1:
        serverport=int(sys.argv[1])

    logging.info('running on port %d' % serverport)

    app.run(host='0.0.0.0', port=serverport, threaded=True, debug=True)