#!/usr/bin/env python
#coding=utf8

import os
import json
from datetime import datetime
from flask import session, Response, request, render_template, send_from_directory, make_response
from functools import wraps, update_wrapper
from . import routes, root_dir
from config import config

UPLOAD_FOLDER = config.data["imagepath"]
ALLOWED_EXTENSIONS = set(['png', 'jpg', 'jpeg'])

@routes.route('/static/js/<path:filename>')
def serve_js_static(filename):
    return send_from_directory(os.path.join(root_dir, 'static', 'js'), filename)

@routes.route('/static/css/<path:filename>')
def serve_css_static(filename):
    return send_from_directory(os.path.join(root_dir, 'static', 'css'), filename)

@routes.route('/static/media/<path:filename>')
def serve_media_static(filename):
    return send_from_directory(os.path.join(root_dir, 'static', 'media'), filename)

@routes.route('/images/<path:monthdir>/<path:filename>')
def serve_picpath_images(monthdir, filename):
    return send_from_directory(os.path.join(UPLOAD_FOLDER, monthdir), filename)

@routes.route('/images/<path:filename>')
def serve_avatar_images(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

def nocache(view):
    @wraps(view)
    def no_cache(*args, **kwargs):
        response = make_response(view(*args, **kwargs))
        response.headers['Last-Modified'] = datetime.now()
        response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, post-check=0, pre-check=0, max-age=0'
        response.headers['Pragma'] = 'no-cache'
        response.headers['Expires'] = '-1'
        return response

    return update_wrapper(no_cache, view)

@routes.route('/')
# @nocache
def index():
    return send_from_directory(root_dir, 'index.html')

@routes.route('/<path:filename>')
def all(filename):
    return send_from_directory(root_dir, filename)