# Copyright (c) 2015-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the license found in the LICENSE file in
# the root directory of this source tree.

"""Ensures lldb can be imported by adding likely paths to the search path.

This should be imported before any module that tries to import lldb.
"""
import os
import subprocess
import sys
from logging_helper import log_debug, log_error


def _get_default_lldb_python_path():
    if sys.platform == 'darwin':
        try:
            # Update pythonpath with likely location in the active Xcode app bundle.
            developer_dir = subprocess.check_output(['xcode-select', '--print-path'])
            return os.path.join(
                developer_dir.strip(),
                '../SharedFrameworks/LLDB.framework/Resources/Python')
        except:
            log_error('Cannot find lldb: make sure you have Xcode installed or lldb in the path.')
            os._exit(2)
    elif sys.platform.startswith('linux'):
        # Assume to be Facebook linux devserver.
        # TODO: make this configurable.
        return '/mnt/gvfs/third-party2/lldb/d51c341932343d3657b9fa997f3ed7d72775d98d/3.8.0.rc3/' \
            'centos6-native/ff04b3a/lib/python2.7/site-packages'
    else:
        raise Exception('Failure to find lldb python binding: unknown platform.')

_custom_lldb_python_path = None


def set_custom_lldb_path(lldb_python_path):
    global _custom_lldb_python_path
    _custom_lldb_python_path = lldb_python_path

_lldb = None


def get_lldb():
    global _lldb
    if _lldb:
        return _lldb

    lldb_python_path = _custom_lldb_python_path if _custom_lldb_python_path \
        else _get_default_lldb_python_path()
    sys.path.insert(0, lldb_python_path)
    import lldb
    _lldb = lldb
    return _lldb
