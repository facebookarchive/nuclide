#http://ipython.org/ipython-doc/3/development/messaging.html

from __future__ import division, print_function
import base64
import contextlib
from datetime import datetime
from distutils.version import StrictVersion
import os
import shutil
import subprocess
import unittest
import types
import warnings
try:
    from Queue import Empty  # Python 2
except ImportError:
    from queue import Empty  # Python 3
try:
    from StringIO import StringIO as BytesIO  # Python 2
except ImportError:
    from io import BytesIO  # Python 3

# The great "support IPython 2, 3, 4" strat begins
try:
    import jupyter
except ImportError:
    jupyter_era = False
else:
    jupyter_era = True

if jupyter_era:
    # Jupyter / IPython 4.x
    from jupyter_client import KernelManager

else:
    from IPython.kernel import KernelManager

# End of the great "support IPython 2, 3, 4" strat

def _check_ipynb():
    kernel_manager = KernelManager()
    kernel_manager.start_kernel()
    kernel_client = kernel_manager.client()
    kernel_client.start_channels()

    try:
        # IPython 3.x
        kernel_client.wait_for_ready()
        iopub = kernel_client
        shell = kernel_client
    except AttributeError:
        # Ipython 2.x
        # Based on https://github.com/paulgb/runipy/pull/49/files
        iopub = kernel_client.iopub_channel
        shell = kernel_client.shell_channel
        shell.get_shell_msg = shell.get_msg
        iopub.get_iopub_msg = iopub.get_msg

    successes = 0
    failures = 0
    errors = 0

    report = ''
    _execute_code("print('Hello World')", shell, iopub, timeout=1)

    kernel_client.stop_channels()
    kernel_manager.shutdown_kernel()

    passed = not (failures or errors)

    print(report)

def _execute_code(code, shell, iopub, timeout=300):
    """
    Execute a block of python code in a kernel

    Parameters
    ----------
    cell : str
        The code to be executed in a python kernel
    shell : IPython.kernel.blocking.channels.BlockingShellChannel
        The shell channel which the cell is submitted to for execution.
    iopub : IPython.kernel.blocking.channels.BlockingIOPubChannel
        The iopub channel used to retrieve the result of the execution.
    timeout : int
        The number of seconds to wait for the execution to finish before giving
        up.

    """

    # Execute input
    #shell.execute("10+20")
    # msg_id = shell.execute("print(1)\nimport time\ntime.sleep(10)\nprint(11)")
    # print(msg_id)
    # msg_id = shell.execute("1+2")
    # print(msg_id)
    # msg_id = shell.execute("print(2)\nimport time\ntime.sleep(10)\nprint(22)")
    # print(msg_id)

    msg_id = shell.execute("print(2)\nimport time\ntime.sleep(10)\nprint(x)")
    print(msg_id)

    # Poll for iopub messages until no more messages are available
    while True:
        try:
            exe_result = shell.get_shell_msg(timeout=0.5)
            print('exe_result')
            print(exe_result)
            print('')
        except Empty:
            pass

        try:
            msg = iopub.get_iopub_msg(timeout=0.5)
            print('get_iopub_msg')
            print('msg')
            print(msg)
            print('')
        except Empty:
            pass

_check_ipynb()