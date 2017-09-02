#!/usr/bin/env python
#coding=utf8

from pymongo import MongoClient
import pymongo

# MongoClient is threadsafe/autoreconnect
def GetDb():
    client = MongoClient('localhost', 27017)
    db = client.myclinic
    return db

dbclient = GetDb()