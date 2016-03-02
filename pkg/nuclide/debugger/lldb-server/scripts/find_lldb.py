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
from logging_helper import log_debug


def _get_lldb_python_path():
    if sys.platform == 'darwin':
        # Update pythonpath with likely location in the active Xcode app bundle.
        developer_dir = subprocess.check_output(['xcode-select', '--print-path'])
        return os.path.join(
            developer_dir.strip(),
            '../SharedFrameworks/LLDB.framework/Resources/Python')
    elif sys.platform.startswith('linux'):
        # Assume to be Facebook linux devserver.
        # TODO: make this configurable.
        return '/mnt/gvfs/third-party2/lldb/b5c928011d9f1f372e3f58d4f0ef658372ce48f4/3.8.0.rc3/centos6-native/ff04b3a/lib/python2.7/site-packages'
    else:
        raise Exception('Failure to find lldb python binding: unknown platform.')


def find_lldb():
    # Try to import, perhaps the paths are set up.
    try:
        import lldb
        return lldb
    except:
        pass

    # Search python binding with heuristics.
    lldb_pythonpath = _get_lldb_python_path()
    sys.path.append(lldb_pythonpath)

    # Try again.
    import lldb
    log_debug('find_lldb: %s' % str(lldb))
    return lldb

lldb = find_lldb()
