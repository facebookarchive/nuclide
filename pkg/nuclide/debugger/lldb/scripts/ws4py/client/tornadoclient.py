# -*- coding: utf-8 -*-
import ssl

from tornado import iostream, escape
from ws4py.client import WebSocketBaseClient
from ws4py.exc import HandshakeError

__all__ = ['TornadoWebSocketClient']

class TornadoWebSocketClient(WebSocketBaseClient):
    def __init__(self, url, protocols=None, extensions=None,
                 io_loop=None, ssl_options=None, headers=None):
        """
        .. code-block:: python

            from tornado import ioloop

            class MyClient(TornadoWebSocketClient):
                def opened(self):
                    for i in range(0, 200, 25):
                        self.send("*" * i)

                def received_message(self, m):
                    print((m, len(str(m))))

                def closed(self, code, reason=None):
                    ioloop.IOLoop.instance().stop()

            ws = MyClient('ws://localhost:9000/echo', protocols=['http-only', 'chat'])
            ws.connect()

            ioloop.IOLoop.instance().start()
        """
        WebSocketBaseClient.__init__(self, url, protocols, extensions,
                                     ssl_options=ssl_options, headers=headers)
        if self.scheme == "wss":
            self.sock = ssl.wrap_socket(self.sock, do_handshake_on_connect=False, **self.ssl_options)
            self.io = iostream.SSLIOStream(self.sock, io_loop, ssl_options=self.ssl_options)
        else:
            self.io = iostream.IOStream(self.sock, io_loop)
        self.io_loop = io_loop

    def connect(self):
        """
        Connects the websocket and initiate the upgrade handshake.
        """
        self.io.set_close_callback(self.__connection_refused)
        self.io.connect((self.host, int(self.port)), self.__send_handshake)

    def _write(self, b):
        """
        Trying to prevent a write operation
        on an already closed websocket stream.

        This cannot be bullet proof but hopefully
        will catch almost all use cases.
        """
        if self.terminated:
            raise RuntimeError("Cannot send on a terminated websocket")

        self.io.write(b)

    def __connection_refused(self, *args, **kwargs):
        self.server_terminated = True
        self.closed(1005, 'Connection refused')

    def __send_handshake(self):
        self.io.set_close_callback(self.__connection_closed)
        self.io.write(escape.utf8(self.handshake_request),
                      self.__handshake_sent)

    def __connection_closed(self, *args, **kwargs):
        self.server_terminated = True
        self.closed(1006, 'Connection closed during handshake')

    def __handshake_sent(self):
        self.io.read_until(b"\r\n\r\n", self.__handshake_completed)

    def __handshake_completed(self, data):
        self.io.set_close_callback(None)
        try:
            response_line, _, headers = data.partition(b'\r\n')
            self.process_response_line(response_line)
            protocols, extensions = self.process_handshake_header(headers)
        except HandshakeError:
            self.close_connection()
            raise

        self.opened()
        self.io.set_close_callback(self.__stream_closed)
        self.io.read_bytes(self.reading_buffer_size, self.__fetch_more)

    def __fetch_more(self, bytes):
        try:
            should_continue = self.process(bytes)
        except:
            should_continue = False

        if should_continue:
            self.io.read_bytes(self.reading_buffer_size, self.__fetch_more)
        else:
            self.__gracefully_terminate()

    def __gracefully_terminate(self):
        self.client_terminated = self.server_terminated = True

        try:
            if not self.stream.closing:
                self.closed(1006)
        finally:
            self.close_connection()

    def __stream_closed(self, *args, **kwargs):
        self.io.set_close_callback(None)
        code = 1006
        reason = None
        if self.stream.closing:
            code, reason = self.stream.closing.code, self.stream.closing.reason
        self.closed(code, reason)
        self.stream._cleanup()

    def close_connection(self):
        """
        Close the underlying connection
        """
        self.io.close()

if __name__ == '__main__':
    from tornado import ioloop

    class MyClient(TornadoWebSocketClient):
        def opened(self):
            def data_provider():
                for i in range(0, 200, 25):
                    yield "#" * i

            self.send(data_provider())

            for i in range(0, 200, 25):
                self.send("*" * i)

        def received_message(self, m):
            print("#%d" % len(m))
            if len(m) == 175:
                self.close()

        def closed(self, code, reason=None):
            ioloop.IOLoop.instance().stop()
            print(("Closed down", code, reason))

    ws = MyClient('ws://localhost:9000/ws', protocols=['http-only', 'chat'])
    ws.connect()

    ioloop.IOLoop.instance().start()
