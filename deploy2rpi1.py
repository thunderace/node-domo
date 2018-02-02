#!/usr/bin/PYTHON
# -*- coding: utf-8 -*-

from ftplib import FTP
import os

localDir = '.'
remoteDir = '/var/www/node-domo'    

def copyDirToFtp(ftp, localDir, remoteDir):
    print("\ncopy files from "+localDir+" to "+remoteDir)
    if os.path.isdir(localDir):
      for f in os.listdir(localDir):
        print(f)
        filePath = os.path.join(localDir, f)
        if os.path.isdir(filePath):
          if not filePath.endswith(".git") and not filePath.endswith("node_modules"):
            ftp.cwd(remoteDir)
            #ftp.mkd(f);
            copyDirToFtp(ftp, filePath, remoteDir+"/"+f)
        else:
          fh = open(filePath, 'rb')
          ftp.cwd(remoteDir)
          ftp.storbinary('STOR %s' % f, fh)
    else:
      print("Source dir does not exist")    
    print("copy ended\n")

def deleteAllFiles(ftp):
  for n in ftp.nlst():
    try:
      if n not in ('.','..'):
        print('Working on..'+n)
        try:
          ftp.delete(n)
          print('Deleted...'+n)
        except Exception:
          print(n+' Not deleted, we suspect its a directory, changing to '+n)
          ftp.cwd(n)
          deleteAllFiles(ftp)
          ftp.cwd('..')
          print('Trying to remove directory ..'+n)
          ftp.rmd(n)
          print('Directory, '+n+' Removed')
    except Exception:
      print('Trying to remove directory ..'+n)
      ftp.rmd(n)
      print('Directory, '+n+' Removed')
             
def connect_ftp(localDir, remoteDir):
    host = '82.66.49.29'
    port = 8132
    usr = 'root'
    pwd = 'tetris'
    
    ftp = FTP()
    print("connection to server")
    ftp.connect(host, port)
    ftp.login(usr, pwd)
    print("connection ok")
    
    os.chdir(localDir)
    localDir = os.getcwd()
    
    ftp.cwd(remoteDir)
    
    copyDirToFtp(ftp, localDir, remoteDir)
        
    ftp.quit()
    ftp.close()
    print("connection closed")
    
connect_ftp(localDir, remoteDir)
