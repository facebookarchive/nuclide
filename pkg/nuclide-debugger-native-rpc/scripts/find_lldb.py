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


_lldb = None
_custom_lldb_python_path = None


def _get_xcode_lldb_relative_path(xcode_path):
    return 'Library/PrivateFrameworks/LLDB.framework/Resources/Python' \
            if os.path.basename(xcode_path) == 'CommandLineTools' \
            else '../SharedFrameworks/LLDB.framework/Resources/Python'


def _add_fb_default_lldb_python_path():
    try:
        from fb_lldb import _add_default_lldb_python_path
        _add_default_lldb_python_path()
    except ImportError:
        # Non-fb environment, swallow.
        pass


def _add_default_lldb_python_path():
    if sys.platform == 'darwin':
        # Update pythonpath with likely location in the active Xcode app bundle.
        developer_dir = subprocess.check_output(['xcode-select', '--print-path'])
        xcode_path = developer_dir.strip()
        default_lldb_python_path = (os.path.join(
            xcode_path,
            _get_xcode_lldb_relative_path(xcode_path)))
        log_debug('find_lldb, default: %s' % default_lldb_python_path)
        sys.path.append(default_lldb_python_path)
    _add_fb_default_lldb_python_path()


def _add_custom_lldb_python_path():
    log_debug('find_lldb, custom: %s' % _custom_lldb_python_path)
    lldb_python_path, _ = os.path.split(_custom_lldb_python_path)
    sys.path.insert(0, lldb_python_path)


def set_custom_lldb_path(lldb_python_path):
    global _custom_lldb_python_path
    _custom_lldb_python_path = lldb_python_path


def _get_lldb_import_error_message():
    if sys.platform == 'darwin':
        return 'Cannot find lldb: make sure you have Xcode installed' \
            ' or specify lldb python binding in the path.'
    else:
        return 'Cannot find lldb: make sure you have lldb in your path.'


def get_lldb():
    global _lldb
    if _lldb:
        return _lldb

    try:
        _add_default_lldb_python_path()
        # _add_custom_lldb_python_path() must be called after
        # _add_default_lldb_python_path() to take precedence.
        _add_custom_lldb_python_path()

        import lldb
        _lldb = lldb
        log_debug('find_lldb: %s' % str(lldb))
        return _lldb
    except ImportError, error:
        log_error(_get_lldb_import_error_message())
        os._exit(2)
