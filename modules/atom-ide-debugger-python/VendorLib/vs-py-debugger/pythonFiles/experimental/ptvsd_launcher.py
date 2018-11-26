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

# Source Copied from https://github.com/Microsoft/PTVS/blob/master/Python/Product/PythonTools/ptvsd_launcher.py
"""
Starts Debugging, expected to start with normal program
to start as first argument and directory to run from as
the second argument.
"""

__author__ = "Microsoft Corporation <ptvshelp@microsoft.com>"
__version__ = "3.2.0.0"

import os
import os.path
import sys
import traceback

# Arguments are:
# 1. VS debugger port to connect to.
# 2. '-g' to use the installed ptvsd package, rather than bundled one.
# 3. '--nodebug' to launch without debugging.
# 4. '-m' or '-c' to override the default run-as mode. [optional]
# 5. Startup script name.
# 6. Script arguments.

port_num = int(sys.argv[1])
del sys.argv[0:2]

# Use bundled ptvsd or not?
bundled_ptvsd = True
if sys.argv and sys.argv[0] == '-g':
    bundled_ptvsd = False
    del sys.argv[0]

# Use bundled ptvsd or not?
no_debug = False
if sys.argv and sys.argv[0] == '--nodebug':
    no_debug = True
    del sys.argv[0]

# set run_as mode appropriately
run_as = 'script'
if sys.argv and sys.argv[0] == '-m':
    run_as = 'module'
    del sys.argv[0]
if sys.argv and sys.argv[0] == '-c':
    run_as = 'code'
    del sys.argv[0]

# preserve filename before we del sys
filename = sys.argv[0]

# fix sys.path to be the script file dir
sys.path[0] = ''

if not bundled_ptvsd and (sys.platform == 'cli' or sys.version_info < (2, 7) or
    (sys.version_info >= (3, 0) and sys.version_info < (3, 4))):
    # This is experimental debugger incompatibility. Exit immediately.
    # This process will be killed by VS since it does not see a debugger
    # connect to it. The exit code we will get there will be wrong.
    # 687: ERROR_DLL_MIGHT_BE_INCOMPATIBLE
    sys.exit(687)

# Load the debugger package
try:
    ptvs_lib_path = None
    if bundled_ptvsd:
        ptvs_lib_path = os.path.join(os.path.dirname(__file__), 'ptvsd')
        sys.path.insert(0, ptvs_lib_path)
    try:
        import ptvsd
        import ptvsd.debugger as vspd
        ptvsd_loaded = True
    except ImportError:
        ptvsd_loaded = False
        raise
    vspd.DONT_DEBUG.append(os.path.normcase(__file__))
except:
    traceback.print_exc()
    if not bundled_ptvsd and not ptvsd_loaded:
        # This is experimental debugger import error. Exit immediately.
        # This process will be killed by VS since it does not see a debugger
        # connect to it. The exit code we will get there will be wrong.
        # 126 : ERROR_MOD_NOT_FOUND
        sys.exit(126)
    print('''
Internal error detected. Please copy the above traceback and report at
https://github.com/Microsoft/vscode-python/issues/new

Press Enter to close. . .''')
    try:
        raw_input()
    except NameError:
        input()
    sys.exit(1)
finally:
    if ptvs_lib_path:
        sys.path.remove(ptvs_lib_path)

if no_debug:
    vspd.run(filename, port_num, run_as, *sys.argv[1:])
else:
    # and start debugging
    vspd.debug(filename, port_num, '', '', run_as)
