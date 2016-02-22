# Copyright (c) 2015-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the license found in the LICENSE file in
# the root directory of this source tree.

""" Entry point for using the Python LLDB Chrome DevTools bridge as a
stand-alone application.
"""

from __future__ import print_function

# Should be first for LLDB package to be added to search path.
from find_lldb import lldb

from chromedebugger import ChromeDevToolsDebuggerApp
import argparse
import sys
import os
from logging_helper import log_debug


def parseArgs():
    parser = argparse.ArgumentParser(
        description='Python LLDB Chrome DevTools Bridge')
    parser.add_argument('--port', type=int, default=0,
                        help='Port for the server to bind. (default: any)')
    parser.add_argument('--basepath', type=str, default='.',
                        help='Path against which to resolve relative paths.')
    parser.add_argument('--interactive', '-i', type=str,
                        help='Interactive mode.')

    attach_group = parser.add_mutually_exclusive_group()
    attach_group.add_argument('--pname', '-n', type=str,
                              help='Attach to process with name.')
    attach_group.add_argument('--pid', '-p', type=int,
                              help='Attach to process with pid.')

    launch_group = parser.add_argument_group()
    launch_group.add_argument('--executable_path', '-e', type=str,
                              help='The executable path to launch.')
    launch_group.add_argument('--launch_arguments', '-args', type=str,
                              help='Launch arguments.')
    return parser.parse_args()


def interactive_loop(debugger):
    while (True):
        sys.stdout.write('dbg> ')
        command = sys.stdin.readline().rstrip()
        if len(command) == 0:
            continue
        elif command == 'q':
            debugger.Destroy(debugger)
            log_debug('bye~')
            break
        elif command == 'b':
            debugger.GetSelectedTarget().process.Stop()
        else:
            debugger.HandleCommand(command)


def main():
    args = parseArgs()
    debugger = lldb.SBDebugger.Create()
    if args.pname:
        debugger.HandleCommand('process attach -n %r' % args.pname)
    elif args.pid:
        debugger.HandleCommand('process attach -p %d' % args.pid)

    # Run a script command in the interpreter, this seems to be necessary as
    # things like assembly seems to not be available from the script
    # environment otherwise.
    debugger.HandleCommand('script 1')

    # Turn on auto-confirm so LLDB does not block forever querying users for
    # command confirmations.
    lldb.SBDebugger.SetInternalVariable('auto-confirm', 'true',
                                        debugger.GetInstanceName())

    try:
        app = ChromeDevToolsDebuggerApp(debugger,
                                        port=args.port,
                                        basepath=args.basepath)
        log_debug('Port: %s' % app.debug_server.server_port)
        if args.interactive:
            app.start_nonblocking()
            interactive_loop(debugger)
        else:
            app.start_blocking()
    except KeyboardInterrupt:  # Force app to exit on Ctrl-C.
        os._exit(1)


if __name__ == '__main__':
    main()
