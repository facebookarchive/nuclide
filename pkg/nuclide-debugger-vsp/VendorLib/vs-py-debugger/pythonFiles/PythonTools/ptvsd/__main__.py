# Python Tools for Visual Studio
# Copyright(c) Microsoft Corporation
# All rights reserved.
# 
# Licensed under the Apache License, Version 2.0 (the License); you may not use
# this file except in compliance with the License. You may obtain a copy of the
# License at http://www.apache.org/licenses/LICENSE-2.0
# 
# THIS CODE IS PROVIDED ON AN  *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS
# OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY
# IMPLIED WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
# MERCHANTABLITY OR NON-INFRINGEMENT.
# 
# See the Apache Version 2.0 License for specific language governing
# permissions and limitations under the License.

__author__ = "Microsoft Corporation <ptvshelp@microsoft.com>"
__version__ = "3.0.0.0"

import os
import sys
from optparse import OptionParser
from ptvsd.visualstudio_py_util import exec_file
from ptvsd.visualstudio_py_debugger import DONT_DEBUG
from ptvsd.attach_server import PTVS_VER, DEFAULT_PORT, enable_attach, wait_for_attach

parser = OptionParser(prog = 'ptvsd', usage = 'Usage: %prog [<option>]... <file> [- <args>]', version = '%prog ' + PTVS_VER)
parser.add_option('-s', '--secret', metavar = '<secret>', help = 'restrict server to only allow clients that specify <secret> when connecting')
parser.add_option('-i', '--interface', default = '0.0.0.0', metavar = '<ip-address>', help = 'listen for debugger connections on interface <ip-address>')
parser.add_option('-p', '--port', type='int', default = DEFAULT_PORT, metavar = '<port>', help = 'listen for debugger connections on <port>')
parser.add_option('--certfile', metavar = '<file>', help = 'Enable SSL and use PEM certificate from <file> to secure connection')
parser.add_option('--keyfile', metavar = '<file>', help = 'Use private key from <file> to secure connection (requires --certfile)')
parser.add_option('--no-output-redirection', dest = 'redirect_output', action = 'store_false', default = True, help = 'do not redirect stdout and stderr to debugger')
parser.add_option('--wait', dest = 'wait', action = 'store_true', default = False, help = 'wait for a debugger to attach before executing')

argv = sys.argv[1:]
script_argv = []
if '-' in argv:
    script_argv = argv[argv.index('-') + 1:]
    del argv[argv.index('-'):]

(opts, args) = parser.parse_args(argv)
if not args and not script_argv:
    parser.error('<file> not specified')
if args:
    script_argv.insert(0, args[0])
if opts.keyfile and not opts.certfile:
    parser.error('--keyfile requires --certfile')

enable_attach(opts.secret, (opts.interface, opts.port), opts.certfile, opts.keyfile, opts.redirect_output)
if opts.wait:
    wait_for_attach()

DONT_DEBUG.append(os.path.normcase(__file__))

sys.argv = script_argv
exec_file(script_argv[0], {'__name__': '__main__'})