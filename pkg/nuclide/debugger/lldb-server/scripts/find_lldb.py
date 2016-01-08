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


def find_lldb():
    # Try to import, perhaps the paths are set up.
    try:
        import lldb
        return lldb
    except:
        pass

    # Update pythonpath with likely location in the active Xcode app bundle.
    developer_dir = subprocess.check_output(['xcode-select', '--print-path'])
    lldb_pythonpath = os.path.join(
        developer_dir.strip(),
        '../SharedFrameworks/LLDB.framework/Resources/Python')
    sys.path.append(lldb_pythonpath)

    # Try again.
    import lldb
    return lldb

lldb = find_lldb()
