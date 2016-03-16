# -*- coding: utf-8 -*-
#
# Redistribution and use in source and binary forms, with or without
# modification, are permitted provided that the following conditions are
# met:
#
#     * Redistributions of source code must retain the above copyright
# notice, this list of conditions and the following disclaimer.
#     * Redistributions in binary form must reproduce the above
# copyright notice, this list of conditions and the following disclaimer
# in the documentation and/or other materials provided with the
# distribution.
#     * Neither the name of ws4py nor the names of its
# contributors may be used to endorse or promote products derived from
# this software without specific prior written permission.
#
# THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
# "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
# LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
# A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
# OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
# SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
# LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
# DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
# THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
# (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
# OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
#
import logging
import logging.handlers as handlers

__author__ = "Sylvain Hellegouarch"
__version__ = "0.3.5"
__all__ = ['WS_KEY', 'WS_VERSION', 'configure_logger', 'format_addresses']

WS_KEY = b"258EAFA5-E914-47DA-95CA-C5AB0DC85B11"
WS_VERSION = (8, 13)

def configure_logger(stdout=True, filepath=None, level=logging.INFO):
    logger = logging.getLogger('ws4py')
    logger.setLevel(level)
    logfmt = logging.Formatter("[%(asctime)s] %(levelname)s %(message)s")

    if filepath:
        h = handlers.RotatingFileHandler(filepath, maxBytes=10485760, backupCount=3)
        h.setLevel(level)
        h.setFormatter(logfmt)
        logger.addHandler(h)

    if stdout:
        import sys
        h = logging.StreamHandler(sys.stdout)
        h.setLevel(level)
        h.setFormatter(logfmt)
        logger.addHandler(h)

    return logger

def format_addresses(ws):
    me = ws.local_address
    peer = ws.peer_address
    if isinstance(me, tuple) and isinstance(peer, tuple):
        me_ip, me_port = ws.local_address
        peer_ip, peer_port = ws.peer_address
        return "[Local => %s:%d | Remote => %s:%d]" % (me_ip, me_port, peer_ip, peer_port)

    return "[Bound to '%s']" % me
