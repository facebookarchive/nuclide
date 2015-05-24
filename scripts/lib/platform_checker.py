# Copyright (c) 2015-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the license found in the LICENSE file in
# the root directory of this source tree.

import os
import sys


def is_os_x():
    return sys.platform == 'darwin'


def is_windows():
    return os.name == 'nt'


def get_node_executable():
    if is_windows():
        return 'node.exe'
    else:
        return 'node'
