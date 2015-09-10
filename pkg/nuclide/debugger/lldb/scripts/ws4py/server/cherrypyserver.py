# -*- coding: utf-8 -*-
__doc__ = """
WebSocket within CherryPy is a tricky bit since CherryPy is
a threaded server which would choke quickly if each thread
of the server were kept attached to a long living connection
that WebSocket expects.

In order to work around this constraint, we take some advantage
of some internals of CherryPy as well as the introspection
Python provides.

Basically, when the WebSocket handshake is complete, we take over
the socket and let CherryPy take back the thread that was
associated with the upgrade request.

These operations require a bit of work at various levels of
the CherryPy framework but this module takes care of them
and from your application's perspective, this is abstracted.

Here are the various utilities provided by this module:

 * WebSocketTool: The tool is in charge to perform the
                  HTTP upgrade and detach the socket from
                  CherryPy. It runs at various hook points of the
                  request's processing. Enable that tool at
                  any path you wish to handle as a WebSocket
                  handler.

 * WebSocketPlugin: The plugin tracks the instanciated web socket handlers.
                    It also cleans out websocket handler which connection
                    have been closed down. The websocket connection then
                    runs in its own thread that this plugin manages.

Simple usage example:

.. code-block:: python
    :linenos:

    import cherrypy
    from ws4py.server.cherrypyserver import WebSocketPlugin, WebSocketTool
    from ws4py.websocket import EchoWebSocket

    cherrypy.config.update({'server.socket_port': 9000})
    WebSocketPlugin(cherrypy.engine).subscribe()
    cherrypy.tools.websocket = WebSocketTool()

    class Root(object):
        @cherrypy.expose
        def index(self):
            return 'some HTML with a websocket javascript connection'

        @cherrypy.expose
        def ws(self):
            pass

    cherrypy.quickstart(Root(), '/', config={'/ws': {'tools.websocket.on': True,
                                                     'tools.websocket.handler_cls': EchoWebSocket}})


Note that you can set the handler class on per-path basis,
meaning you could also dynamically change the class based
on other envrionmental settings (is the user authenticated for ex).
"""
import base64
from hashlib import sha1
import inspect
import threading

import cherrypy
from cherrypy import Tool
from cherrypy.process import plugins
from cherrypy.wsgiserver import HTTPConnection, HTTPRequest

from ws4py import WS_KEY, WS_VERSION
from ws4py.exc import HandshakeError
from ws4py.websocket import WebSocket
from ws4py.compat import py3k, get_connection, detach_connection
from ws4py.manager import WebSocketManager

__all__ = ['WebSocketTool', 'WebSocketPlugin']

class WebSocketTool(Tool):
    def __init__(self):
        Tool.__init__(self, 'before_request_body', self.upgrade)

    def _setup(self):
        conf = self._merged_args()
        hooks = cherrypy.serving.request.hooks
        p = conf.pop("priority", getattr(self.callable, "priority",
                                         self._priority))
        hooks.attach(self._point, self.callable, priority=p, **conf)
        hooks.attach('before_finalize', self.complete,
                     priority=p)
        hooks.attach('on_end_resource', self.cleanup_headers,
                     priority=70)
        hooks.attach('on_end_request', self.start_handler,
                     priority=70)

    def upgrade(self, protocols=None, extensions=None, version=WS_VERSION,
                handler_cls=WebSocket, heartbeat_freq=None):
        """
        Performs the upgrade of the connection to the WebSocket
        protocol.

        The provided protocols may be a list of WebSocket
        protocols supported by the instance of the tool.

        When no list is provided and no protocol is either
        during the upgrade, then the protocol parameter is
        not taken into account. On the other hand,
        if the protocol from the handshake isn't part
        of the provided list, the upgrade fails immediatly.
        """
        request = cherrypy.serving.request
        request.process_request_body = False

        ws_protocols = None
        ws_location = None
        ws_version = version
        ws_key = None
        ws_extensions = []

        if request.method != 'GET':
            raise HandshakeError('HTTP method must be a GET')

        for key, expected_value in [('Upgrade', 'websocket'),
                                     ('Connection', 'upgrade')]:
            actual_value = request.headers.get(key, '').lower()
            if not actual_value:
                raise HandshakeError('Header %s is not defined' % key)
            if expected_value not in actual_value:
                raise HandshakeError('Illegal value for header %s: %s' %
                                     (key, actual_value))

        version = request.headers.get('Sec-WebSocket-Version')
        supported_versions = ', '.join([str(v) for v in ws_version])
        version_is_valid = False
        if version:
            try: version = int(version)
            except: pass
            else: version_is_valid = version in ws_version

        if not version_is_valid:
            cherrypy.response.headers['Sec-WebSocket-Version'] = supported_versions
            raise HandshakeError('Unhandled or missing WebSocket version')

        key = request.headers.get('Sec-WebSocket-Key')
        if key:
            ws_key = base64.b64decode(key.encode('utf-8'))
            if len(ws_key) != 16:
                raise HandshakeError("WebSocket key's length is invalid")

        protocols = protocols or []
        subprotocols = request.headers.get('Sec-WebSocket-Protocol')
        if subprotocols:
            ws_protocols = []
            for s in subprotocols.split(','):
                s = s.strip()
                if s in protocols:
                    ws_protocols.append(s)

        exts = extensions or []
        extensions = request.headers.get('Sec-WebSocket-Extensions')
        if extensions:
            for ext in extensions.split(','):
                ext = ext.strip()
                if ext in exts:
                    ws_extensions.append(ext)

        location = []
        include_port = False
        if request.scheme == "https":
            location.append("wss://")
            include_port = request.local.port != 443
        else:
            location.append("ws://")
            include_port = request.local.port != 80
        location.append('localhost')
        if include_port:
            location.append(":%d" % request.local.port)
        location.append(request.path_info)
        if request.query_string != "":
            location.append("?%s" % request.query_string)
        ws_location = ''.join(location)

        response = cherrypy.serving.response
        response.stream = True
        response.status = '101 Switching Protocols'
        response.headers['Content-Type'] = 'text/plain'
        response.headers['Upgrade'] = 'websocket'
        response.headers['Connection'] = 'Upgrade'
        response.headers['Sec-WebSocket-Version'] = str(version)
        response.headers['Sec-WebSocket-Accept'] = base64.b64encode(sha1(key.encode('utf-8') + WS_KEY).digest())
        if ws_protocols:
            response.headers['Sec-WebSocket-Protocol'] = ', '.join(ws_protocols)
        if ws_extensions:
            response.headers['Sec-WebSocket-Extensions'] = ','.join(ws_extensions)

        addr = (request.remote.ip, request.remote.port)
        ws_conn = get_connection(request.rfile.rfile)
        request.ws_handler = handler_cls(ws_conn, ws_protocols, ws_extensions,
                                         request.wsgi_environ.copy(),
                                         heartbeat_freq=heartbeat_freq)

    def complete(self):
        """
        Sets some internal flags of CherryPy so that it
        doesn't close the socket down.
        """
        self._set_internal_flags()

    def cleanup_headers(self):
        """
        Some clients aren't that smart when it comes to
        headers lookup.
        """
        response = cherrypy.response
        if not response.header_list:
            return

        headers = response.header_list[:]
        for (k, v) in headers:
            if k[:7] == 'Sec-Web':
                response.header_list.remove((k, v))
                response.header_list.append((k.replace('Sec-Websocket', 'Sec-WebSocket'), v))

    def start_handler(self):
        """
        Runs at the end of the request processing by calling
        the opened method of the handler.
        """
        request = cherrypy.request
        if not hasattr(request, 'ws_handler'):
            return

        addr = (request.remote.ip, request.remote.port)
        ws_handler = request.ws_handler
        request.ws_handler = None
        delattr(request, 'ws_handler')

        # By doing this we detach the socket from
        # the CherryPy stack avoiding memory leaks
        detach_connection(request.rfile.rfile)

        cherrypy.engine.publish('handle-websocket', ws_handler, addr)

    def _set_internal_flags(self):
        """
        CherryPy has two internal flags that we are interested in
        to enable WebSocket within the server. They can't be set via
        a public API and considering I'd want to make this extension
        as compatible as possible whilst refraining in exposing more
        than should be within CherryPy, I prefer performing a bit
        of introspection to set those flags. Even by Python standards
        such introspection isn't the cleanest but it works well
        enough in this case.

        This also means that we do that only on WebSocket
        connections rather than globally and therefore we do not
        harm the rest of the HTTP server.
        """
        current = inspect.currentframe()
        while True:
            if not current:
                break
            _locals = current.f_locals
            if 'self' in _locals:
               if type(_locals['self']) == HTTPRequest:
                   _locals['self'].close_connection = True
               if type(_locals['self']) == HTTPConnection:
                   _locals['self'].linger = True
                   # HTTPConnection is more inner than
                   # HTTPRequest so we can leave once
                   # we're done here
                   return
            _locals = None
            current = current.f_back

class WebSocketPlugin(plugins.SimplePlugin):
    def __init__(self, bus):
        plugins.SimplePlugin.__init__(self, bus)
        self.manager = WebSocketManager()

    def start(self):
        self.bus.log("Starting WebSocket processing")
        self.bus.subscribe('stop', self.cleanup)
        self.bus.subscribe('handle-websocket', self.handle)
        self.bus.subscribe('websocket-broadcast', self.broadcast)
        self.manager.start()

    def stop(self):
        self.bus.log("Terminating WebSocket processing")
        self.bus.unsubscribe('stop', self.cleanup)
        self.bus.unsubscribe('handle-websocket', self.handle)
        self.bus.unsubscribe('websocket-broadcast', self.broadcast)

    def handle(self, ws_handler, peer_addr):
        """
        Tracks the provided handler.

        :param ws_handler: websocket handler instance
        :param peer_addr: remote peer address for tracing purpose
        """
        self.manager.add(ws_handler)

    def cleanup(self):
        """
        Terminate all connections and clear the pool. Executed when the engine stops.
        """
        self.manager.close_all()
        self.manager.stop()
        self.manager.join()

    def broadcast(self, message, binary=False):
        """
        Broadcasts a message to all connected clients known to
        the server.

        :param message: a message suitable to pass to the send() method
          of the connected handler.
        :param binary: whether or not the message is a binary one
        """
        self.manager.broadcast(message, binary)

if __name__ == '__main__':
    import random
    cherrypy.config.update({'server.socket_host': '127.0.0.1',
                            'server.socket_port': 9000})
    WebSocketPlugin(cherrypy.engine).subscribe()
    cherrypy.tools.websocket = WebSocketTool()

    class Root(object):
        @cherrypy.expose
        @cherrypy.tools.websocket(on=False)
        def ws(self):
            return """<html>
        <head>
          <script type='application/javascript' src='https://ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js'> </script>
          <script type='application/javascript'>
            $(document).ready(function() {
              var ws = new WebSocket('ws://192.168.0.10:9000/');
              ws.onmessage = function (evt) {
                 $('#chat').val($('#chat').val() + evt.data + '\\n');
              };
              ws.onopen = function() {
                 ws.send("Hello there");
              };
              ws.onclose = function(evt) {
                $('#chat').val($('#chat').val() + 'Connection closed by server: ' + evt.code + ' \"' + evt.reason + '\"\\n');
              };
              $('#chatform').submit(function() {
                 ws.send('%(username)s: ' + $('#message').val());
                 $('#message').val("");
                 return false;
              });
            });
          </script>
        </head>
        <body>
        <form action='/echo' id='chatform' method='get'>
          <textarea id='chat' cols='35' rows='10'></textarea>
          <br />
          <label for='message'>%(username)s: </label><input type='text' id='message' />
          <input type='submit' value='Send' />
          </form>
        </body>
        </html>
        """ % {'username': "User%d" % random.randint(0, 100)}

        @cherrypy.expose
        def index(self):
            cherrypy.log("Handler created: %s" % repr(cherrypy.request.ws_handler))

    cherrypy.quickstart(Root(), '/', config={'/': {'tools.websocket.on': True,
                                                   'tools.websocket.handler_cls': EchoWebSocketHandler}})
