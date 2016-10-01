# Copyright (c) 2015-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the license found in the LICENSE file in
# the root directory of this source tree.

'''There is no shebang for this file: it must be run as an argument to `python`.
'''

if __name__ == '__main__':
    '''This should be run via `python main.py <unix.sock> <prog.py> <arg1> ...`.
    '''
    import debugger
    import sys
    path_to_socket = sys.argv[1]
    del sys.argv[0]  # Hide "main.py" from argument list.
    del sys.argv[0]  # Hide path_to_socket from argument list.
    debugger.debug(path_to_socket)
