# Copyright (c) Microsoft Corporation. All rights reserved.
# Licensed under the MIT License. See LICENSE in the project root
# for license information.

from ptvsd._remote import (
    attach as ptvsd_attach,
    enable_attach as ptvsd_enable_attach,
    _pydevd_settrace,
)
from ptvsd.wrapper import debugger_attached

WAIT_TIMEOUT = 1.0

DEFAULT_HOST = '0.0.0.0'
DEFAULT_PORT = 5678

_debug_current_thread = None
_pending_threads = set()


def wait_for_attach(timeout=None):
    """If a remote debugger is attached, returns immediately. Otherwise,
    blocks until a remote debugger attaches to this process, or until the
    optional timeout occurs.

    Parameters
    ----------
    timeout : float, optional
        The timeout for the operation in seconds (or fractions thereof).
    """
    debugger_attached.wait(timeout)


def enable_attach(address=(DEFAULT_HOST, DEFAULT_PORT), redirect_output=True):
    """Enables a client to attach to this process remotely to debug Python code.

    Parameters
    ----------
    address : (str, int), optional
        Specifies the interface and port on which the debugging server should
        listen for TCP connections. It is in the same format as used for
        regular sockets of the `socket.AF_INET` family, i.e. a tuple of
        ``(hostname, port)``. On client side, the server is identified by the
        Qualifier string in the usual ``'hostname:port'`` format, e.g.:
        ``'myhost.cloudapp.net:5678'``. Default is ``('0.0.0.0', 5678)``.
    redirect_output : bool, optional
        Specifies whether any output (on both `stdout` and `stderr`) produced
        by this program should be sent to the debugger. Default is ``True``.

    Notes
    -----
    This function returns immediately after setting up the debugging server,
    and does not block program execution. If you need to block until debugger
    is attached, call `ptvsd.wait_for_attach`. The debugger can be detached
    and re-attached multiple times after `enable_attach` is called.

    Only the thread on which this function is called, and any threads that are
    created after it returns, will be visible in the debugger once it is
    attached. Any threads that are already running before this function is
    called will not be visible.
    """
    if is_attached():
        return
    debugger_attached.clear()

    # Ensure port is int
    port = address[1]
    address = (address[0], port if type(port) is int else int(port))

    ptvsd_enable_attach(
        address,
        redirect_output=redirect_output,
    )


def attach(address, redirect_output=True):
    """Attaches this process to the debugger listening on a given address.

    Parameters
    ----------
    address : (str, int), optional
        Specifies the interface and port on which the debugger is listening
        for TCP connections. It is in the same format as used for
        regular sockets of the `socket.AF_INET` family, i.e. a tuple of
        ``(hostname, port)``.
    redirect_output : bool, optional
        Specifies whether any output (on both `stdout` and `stderr`) produced
        by this program should be sent to the debugger. Default is ``True``.
    """
    if is_attached():
        return
    debugger_attached.clear()

    # Ensure port is int
    port = address[1]
    address = (address[0], port if type(port) is int else int(port))

    ptvsd_attach(address, redirect_output=redirect_output)


# TODO: Add disable_attach()?


def is_attached():
    """Returns ``True`` if debugger is attached, ``False`` otherwise."""
    return debugger_attached.isSet()


def break_into_debugger():
    """If a remote debugger is attached, pauses execution of all threads,
    and breaks into the debugger with current thread as active.
    """
    if not is_attached():
        return

    import sys
    _pydevd_settrace(
        suspend=True,
        trace_only_current_thread=True,
        patch_multiprocessing=False,
        stop_at_frame=sys._getframe().f_back,
    )
