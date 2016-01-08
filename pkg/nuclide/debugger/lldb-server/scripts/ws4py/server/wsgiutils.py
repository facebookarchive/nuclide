# -*- coding: utf-8 -*-
__doc__ = """
This module provides a WSGI application suitable
for a WSGI server such as gevent or wsgiref for instance.

:pep:`333` couldn't foresee a protocol such as
WebSockets but luckily the way the initial
protocol upgrade was designed means that we can
fit the handshake in a WSGI flow.

The handshake validates the request against
some internal or user-provided values and
fails the request if the validation doesn't
complete.

On success, the provided WebSocket subclass
is instanciated and stored into the
`'ws4py.websocket'` environ key so that
the WSGI server can handle it.

The WSGI application returns an empty iterable
since there is little value to return some
content within the response to the handshake.

A server wishing to support WebSocket via ws4py
should:

- Provide the real socket object to ws4py through the
  `'ws4py.socket'` environ key. We can't use `'wsgi.input'`
  as it may be wrapper to the socket we wouldn't know
  how to extract the socket from.
- Look for the `'ws4py.websocket'` key in the environ
  when the application has returned and probably attach
  it to a :class:`ws4py.manager.WebSocketManager` instance
  so that the websocket runs its life.
- Remove the `'ws4py.websocket'` and `'ws4py.socket'`
  environ keys once the application has returned.
  No need for these keys to persist.
- Not close the underlying socket otherwise, well,
  your websocket will also shutdown.

.. warning::

  The WSGI application sets the `'Upgrade'` header response
  as specified by :rfc:`6455`. This is not tolerated by
  :pep:`333` since it's a hop-by-hop header.
  We expect most servers won't mind.
"""
import base64
from hashlib import sha1
import logging
import sys

from ws4py.websocket import WebSocket
from ws4py.exc import HandshakeError
from ws4py.compat import unicode, py3k
from ws4py import WS_VERSION, WS_KEY, format_addresses

logger = logging.getLogger('ws4py')

__all__ = ['WebSocketWSGIApplication']

class WebSocketWSGIApplication(object):
    def __init__(self, protocols=None, extensions=None, handler_cls=WebSocket):
        """
        WSGI application usable to complete the upgrade handshake
        by validating the requested protocols and extensions as
        well as the websocket version.

        If the upgrade validates, the `handler_cls` class
        is instanciated and stored inside the WSGI `environ`
        under the `'ws4py.websocket'` key to make it
        available to the WSGI handler.
        """
        self.protocols = protocols
        self.extensions = extensions
        self.handler_cls = handler_cls

    def make_websocket(self, sock, protocols, extensions, environ):
        """
        Initialize the `handler_cls` instance with the given
        negociated sets of protocols and extensions as well as
        the `environ` and `sock`.

        Stores then the instance in the `environ` dict
        under the `'ws4py.websocket'` key.
        """
        websocket = self.handler_cls(sock, protocols, extensions,
                                     environ.copy())
        environ['ws4py.websocket'] = websocket
        return websocket

    def __call__(self, environ, start_response):
        if environ.get('REQUEST_METHOD') != 'GET':
            raise HandshakeError('HTTP method must be a GET')

        for key, expected_value in [('HTTP_UPGRADE', 'websocket'),
                                    ('HTTP_CONNECTION', 'upgrade')]:
            actual_value = environ.get(key, '').lower()
            if not actual_value:
                raise HandshakeError('Header %s is not defined' % key)
            if expected_value not in actual_value:
                raise HandshakeError('Illegal value for header %s: %s' %
                                     (key, actual_value))

        key = environ.get('HTTP_SEC_WEBSOCKET_KEY')
        if key:
            ws_key = base64.b64decode(key.encode('utf-8'))
            if len(ws_key) != 16:
                raise HandshakeError("WebSocket key's length is invalid")

        version = environ.get('HTTP_SEC_WEBSOCKET_VERSION')
        supported_versions = b', '.join([unicode(v).encode('utf-8') for v in WS_VERSION])
        version_is_valid = False
        if version:
            try: version = int(version)
            except: pass
            else: version_is_valid = version in WS_VERSION

        if not version_is_valid:
            environ['websocket.version'] = unicode(version).encode('utf-8')
            raise HandshakeError('Unhandled or missing WebSocket version')

        ws_protocols = []
        protocols = self.protocols or []
        subprotocols = environ.get('HTTP_SEC_WEBSOCKET_PROTOCOL')
        if subprotocols:
            for s in subprotocols.split(','):
                s = s.strip()
                if s in protocols:
                    ws_protocols.append(s)

        ws_extensions = []
        exts = self.extensions or []
        extensions = environ.get('HTTP_SEC_WEBSOCKET_EXTENSIONS')
        if extensions:
            for ext in extensions.split(','):
                ext = ext.strip()
                if ext in exts:
                    ws_extensions.append(ext)

        accept_value = base64.b64encode(sha1(key.encode('utf-8') + WS_KEY).digest())
        if py3k: accept_value = accept_value.decode('utf-8')
        upgrade_headers = [
            ('Upgrade', 'websocket'),
            ('Connection', 'Upgrade'),
            ('Sec-WebSocket-Version', '%s' % version),
            ('Sec-WebSocket-Accept', accept_value),
            ]
        if ws_protocols:
            upgrade_headers.append(('Sec-WebSocket-Protocol', ', '.join(ws_protocols)))
        if ws_extensions:
            upgrade_headers.append(('Sec-WebSocket-Extensions', ','.join(ws_extensions)))

        start_response("101 Switching Protocols", upgrade_headers)

        self.make_websocket(environ['ws4py.socket'],
                            ws_protocols,
                            ws_extensions,
                            environ)

        return []
