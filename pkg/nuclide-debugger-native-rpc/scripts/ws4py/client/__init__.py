# -*- coding: utf-8 -*-
from base64 import b64encode
from hashlib import sha1
import os
import socket
import ssl

from ws4py import WS_KEY, WS_VERSION
from ws4py.exc import HandshakeError
from ws4py.websocket import WebSocket
from ws4py.compat import urlsplit

__all__ = ['WebSocketBaseClient']

class WebSocketBaseClient(WebSocket):
    def __init__(self, url, protocols=None, extensions=None,
                 heartbeat_freq=None, ssl_options=None, headers=None):
        """
        A websocket client that implements :rfc:`6455` and provides a simple
        interface to communicate with a websocket server.

        This class works on its own but will block if not run in
        its own thread.

        When an instance of this class is created, a :py:mod:`socket`
        is created. If the connection is a TCP socket,
        the nagle's algorithm is disabled.

        The address of the server will be extracted from the given
        websocket url.

        The websocket key is randomly generated, reset the
        `key` attribute if you want to provide yours.

        For instance to create a TCP client:

        .. code-block:: python

           >>> from websocket.client import WebSocketBaseClient
           >>> ws = WebSocketBaseClient('ws://localhost/ws')


        Here is an example for a TCP client over SSL:

        .. code-block:: python

           >>> from websocket.client import WebSocketBaseClient
           >>> ws = WebSocketBaseClient('wss://localhost/ws')


        Finally an example of a Unix-domain connection:

        .. code-block:: python

           >>> from websocket.client import WebSocketBaseClient
           >>> ws = WebSocketBaseClient('ws+unix:///tmp/my.sock')

        Note that in this case, the initial Upgrade request
        will be sent to ``/``. You may need to change this
        by setting the resource explicitely before connecting:

        .. code-block:: python

           >>> from websocket.client import WebSocketBaseClient
           >>> ws = WebSocketBaseClient('ws+unix:///tmp/my.sock')
           >>> ws.resource = '/ws'
           >>> ws.connect()

        You may provide extra headers by passing a list of tuples
        which must be unicode objects.

        """
        self.url = url
        self.host = None
        self.scheme = None
        self.port = None
        self.unix_socket_path = None
        self.resource = None
        self.ssl_options = ssl_options or {}
        self.extra_headers = headers or []

        self._parse_url()

        if self.unix_socket_path:
            sock = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM, 0)
        else:
            # Let's handle IPv4 and IPv6 addresses
            # Simplified from CherryPy's code
            try:
                family, socktype, proto, canonname, sa = socket.getaddrinfo(self.host, self.port,
                                                                            socket.AF_UNSPEC,
                                                                            socket.SOCK_STREAM,
                                                                            0, socket.AI_PASSIVE)[0]
            except socket.gaierror:
                family = socket.AF_INET
                if self.host.startswith('::'):
                    family = socket.AF_INET6

                socktype = socket.SOCK_STREAM
                proto = 0
                canonname = ""
                sa = (self.host, self.port, 0, 0)

            sock = socket.socket(family, socktype, proto)
            sock.setsockopt(socket.IPPROTO_TCP, socket.TCP_NODELAY, 1)
            sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            if hasattr(socket, 'AF_INET6') and family == socket.AF_INET6 and \
              self.host.startswith('::'):
                try:
                    sock.setsockopt(socket.IPPROTO_IPV6, socket.IPV6_V6ONLY, 0)
                except (AttributeError, socket.error):
                    pass

        WebSocket.__init__(self, sock, protocols=protocols,
                           extensions=extensions,
                           heartbeat_freq=heartbeat_freq)

        self.stream.always_mask = True
        self.stream.expect_masking = False
        self.key = b64encode(os.urandom(16))

    # Adpated from: https://github.com/liris/websocket-client/blob/master/websocket.py#L105
    def _parse_url(self):
        """
        Parses a URL which must have one of the following forms:

        - ws://host[:port][path]
        - wss://host[:port][path]
        - ws+unix:///path/to/my.socket

        In the first two cases, the ``host`` and ``port``
        attributes will be set to the parsed values. If no port
        is explicitely provided, it will be either 80 or 443
        based on the scheme. Also, the ``resource`` attribute is
        set to the path segment of the URL (alongside any querystring).

        In addition, if the scheme is ``ws+unix``, the
        ``unix_socket_path`` attribute is set to the path to
        the Unix socket while the ``resource`` attribute is
        set to ``/``.
        """
        # Python 2.6.1 and below don't parse ws or wss urls properly. netloc is empty.
        # See: https://github.com/Lawouach/WebSocket-for-Python/issues/59
        scheme, url = self.url.split(":", 1)

        parsed = urlsplit(url, scheme="http")
        if parsed.hostname:
            self.host = parsed.hostname
        elif '+unix' in scheme:
            self.host = 'localhost'
        else:
            raise ValueError("Invalid hostname from: %s", self.url)

        if parsed.port:
            self.port = parsed.port

        if scheme == "ws":
            if not self.port:
                self.port = 80
        elif scheme == "wss":
            if not self.port:
                self.port = 443
        elif scheme in ('ws+unix', 'wss+unix'):
            pass
        else:
            raise ValueError("Invalid scheme: %s" % scheme)

        if parsed.path:
            resource = parsed.path
        else:
            resource = "/"

        if '+unix' in scheme:
            self.unix_socket_path = resource
            resource = '/'

        if parsed.query:
            resource += "?" + parsed.query

        self.scheme = scheme
        self.resource = resource

    @property
    def bind_addr(self):
        """
        Returns the Unix socket path if or a tuple
        ``(host, port)`` depending on the initial
        URL's scheme.
        """
        return self.unix_socket_path or (self.host, self.port)

    def close(self, code=1000, reason=''):
        """
        Initiate the closing handshake with the server.
        """
        if not self.client_terminated:
            self.client_terminated = True
            self._write(self.stream.close(code=code, reason=reason).single(mask=True))

    def connect(self):
        """
        Connects this websocket and starts the upgrade handshake
        with the remote endpoint.
        """
        if self.scheme == "wss":
            # default port is now 443; upgrade self.sender to send ssl
            self.sock = ssl.wrap_socket(self.sock, **self.ssl_options)

        self.sock.connect(self.bind_addr)

        self._write(self.handshake_request)

        response = b''
        doubleCLRF = b'\r\n\r\n'
        while True:
            bytes = self.sock.recv(128)
            if not bytes:
                break
            response += bytes
            if doubleCLRF in response:
                break

        if not response:
            self.close_connection()
            raise HandshakeError("Invalid response")

        headers, _, body = response.partition(doubleCLRF)
        response_line, _, headers = headers.partition(b'\r\n')

        try:
            self.process_response_line(response_line)
            self.protocols, self.extensions = self.process_handshake_header(headers)
        except HandshakeError:
            self.close_connection()
            raise

        self.handshake_ok()
        if body:
            self.process(body)

    @property
    def handshake_headers(self):
        """
        List of headers appropriate for the upgrade
        handshake.
        """
        headers = [
            ('Host', '%s:%s' % (self.host, self.port)),
            ('Connection', 'Upgrade'),
            ('Upgrade', 'websocket'),
            ('Sec-WebSocket-Key', self.key.decode('utf-8')),
            ('Sec-WebSocket-Version', str(max(WS_VERSION)))
            ]
        
        if self.protocols:
            headers.append(('Sec-WebSocket-Protocol', ','.join(self.protocols)))

        if self.extra_headers:
            headers.extend(self.extra_headers)

        if not any(x for x in headers if x[0].lower() == 'origin'):

            scheme, url = self.url.split(":", 1)
            parsed = urlsplit(url, scheme="http")
            if parsed.hostname:
                self.host = parsed.hostname
            else:
                self.host = 'localhost'
            origin = scheme + '://' + parsed.hostname
            if parsed.port:
                origin = origin + ':' + str(parsed.port)
            headers.append(('Origin', origin))

        return headers

    @property
    def handshake_request(self):
        """
        Prepare the request to be sent for the upgrade handshake.
        """
        headers = self.handshake_headers
        request = [("GET %s HTTP/1.1" % self.resource).encode('utf-8')]
        for header, value in headers:
            request.append(("%s: %s" % (header, value)).encode('utf-8'))
        request.append(b'\r\n')

        return b'\r\n'.join(request)

    def process_response_line(self, response_line):
        """
        Ensure that we received a HTTP `101` status code in
        response to our request and if not raises :exc:`HandshakeError`.
        """
        protocol, code, status = response_line.split(b' ', 2)
        if code != b'101':
            raise HandshakeError("Invalid response status: %s %s" % (code, status))

    def process_handshake_header(self, headers):
        """
        Read the upgrade handshake's response headers and
        validate them against :rfc:`6455`.
        """
        protocols = []
        extensions = []

        headers = headers.strip()

        for header_line in headers.split(b'\r\n'):
            header, value = header_line.split(b':', 1)
            header = header.strip().lower()
            value = value.strip().lower()

            if header == 'upgrade' and value != 'websocket':
                raise HandshakeError("Invalid Upgrade header: %s" % value)

            elif header == 'connection' and value != 'upgrade':
                raise HandshakeError("Invalid Connection header: %s" % value)

            elif header == 'sec-websocket-accept':
                match = b64encode(sha1(self.key.encode('utf-8') + WS_KEY).digest())
                if value != match.lower():
                    raise HandshakeError("Invalid challenge response: %s" % value)

            elif header == 'sec-websocket-protocol':
                protocols = ','.join(value)

            elif header == 'sec-websocket-extensions':
                extensions = ','.join(value)

        return protocols, extensions
