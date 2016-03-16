# -*- coding: utf-8 -*-
__doc__ = """
Add WebSocket support to the built-in WSGI server
provided by the :py:mod:`wsgiref`. This is clearly not
meant to be a production server so please consider this
only for testing purpose.

Mostly, this module overrides bits and pieces of
the built-in classes so that it supports the WebSocket
workflow.

.. code-block:: python

    from wsgiref.simple_server import make_server
    from ws4py.websocket import EchoWebSocket
    from ws4py.server.wsgirefserver import WSGIServer, WebSocketWSGIRequestHandler
    from ws4py.server.wsgiutils import WebSocketWSGIApplication

    server = make_server('', 9000, server_class=WSGIServer,
                         handler_class=WebSocketWSGIRequestHandler,
                         app=WebSocketWSGIApplication(handler_cls=EchoWebSocket))
    server.initialize_websockets_manager()
    server.serve_forever()

.. note::
   For some reason this server may fail against autobahntestsuite.
"""
import logging
import sys
from wsgiref.handlers import SimpleHandler
from wsgiref.simple_server import WSGIRequestHandler, WSGIServer as _WSGIServer
from wsgiref import util

util._hoppish = {}.__contains__

from ws4py.manager import WebSocketManager
from ws4py import format_addresses
from ws4py.server.wsgiutils import WebSocketWSGIApplication
from ws4py.compat import get_connection

__all__ = ['WebSocketWSGIHandler', 'WebSocketWSGIRequestHandler',
           'WSGIServer']

logger = logging.getLogger('ws4py')

class WebSocketWSGIHandler(SimpleHandler):
    def setup_environ(self):
        """
        Setup the environ dictionary and add the
        `'ws4py.socket'` key. Its associated value
        is the real socket underlying socket.
        """
        SimpleHandler.setup_environ(self)
        self.environ['ws4py.socket'] = get_connection(self.environ['wsgi.input'])
        self.http_version = self.environ['SERVER_PROTOCOL'].rsplit('/')[-1]

    def finish_response(self):
        """
        Completes the response and performs the following tasks:

        - Remove the `'ws4py.socket'` and `'ws4py.websocket'`
          environ keys.
        - Attach the returned websocket, if any, to the WSGI server
          using its ``link_websocket_to_server`` method.
        """
        ws = None
        if self.environ:
            self.environ.pop('ws4py.socket', None)
            ws = self.environ.pop('ws4py.websocket', None)

        try:
            SimpleHandler.finish_response(self)
        except:
            if ws:
                ws.close(1011, reason='Something broke')
            raise
        else:
            if ws:
                self.request_handler.server.link_websocket_to_server(ws)

class WebSocketWSGIRequestHandler(WSGIRequestHandler):
    def handle(self):
        """
        Unfortunately the base class forces us
        to override the whole method to actually provide our wsgi handler.
        """
        self.raw_requestline = self.rfile.readline()
        if not self.parse_request(): # An error code has been sent, just exit
            return

        # next line is where we'd have expect a configuration key somehow
        handler = WebSocketWSGIHandler(
            self.rfile, self.wfile, self.get_stderr(), self.get_environ()
        )
        handler.request_handler = self      # backpointer for logging
        handler.run(self.server.get_app())

class WSGIServer(_WSGIServer):
    def initialize_websockets_manager(self):
        """
        Call thos to start the underlying websockets
        manager. Make sure to call it once your server
        is created.
        """
        self.manager = WebSocketManager()
        self.manager.start()

    def shutdown_request(self, request):
        """
        The base class would close our socket
        if we didn't override it.
        """
        pass

    def link_websocket_to_server(self, ws):
        """
        Call this from your WSGI handler when a websocket
        has been created.
        """
        self.manager.add(ws)

    def server_close(self):
        """
        Properly initiate closing handshakes on
        all websockets when the WSGI server terminates.
        """
        if hasattr(self, 'manager'):
            self.manager.close_all()
            self.manager.stop()
            self.manager.join()
            delattr(self, 'manager')
        _WSGIServer.server_close(self)

if __name__ == '__main__':
    from ws4py import configure_logger
    configure_logger()

    from wsgiref.simple_server import make_server
    from ws4py.websocket import EchoWebSocket

    server = make_server('', 9000, server_class=WSGIServer,
                         handler_class=WebSocketWSGIRequestHandler,
                         app=WebSocketWSGIApplication(handler_cls=EchoWebSocket))
    server.initialize_websockets_manager()
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        server.server_close()
