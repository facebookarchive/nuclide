# -*- coding: utf-8 -*-
import threading

from ws4py.client import WebSocketBaseClient

__all__ = ['WebSocketClient']

class WebSocketClient(WebSocketBaseClient):
    def __init__(self, url, protocols=None, extensions=None, heartbeat_freq=None,
                 ssl_options=None, headers=None):
        """
        .. code-block:: python

           from ws4py.client.threadedclient import WebSocketClient

           class EchoClient(WebSocketClient):
               def opened(self):
                  for i in range(0, 200, 25):
                     self.send("*" * i)

               def closed(self, code, reason):
                  print(("Closed down", code, reason))

               def received_message(self, m):
                  print("=> %d %s" % (len(m), str(m)))

           try:
               ws = EchoClient('ws://localhost:9000/echo', protocols=['http-only', 'chat'])
               ws.connect()
           except KeyboardInterrupt:
              ws.close()

        """
        WebSocketBaseClient.__init__(self, url, protocols, extensions, heartbeat_freq,
                                     ssl_options, headers=headers)
        self._th = threading.Thread(target=self.run, name='WebSocketClient')
        self._th.daemon = True

    @property
    def daemon(self):
        """
        `True` if the client's thread is set to be a daemon thread.
        """
        return self._th.daemon

    @daemon.setter
    def daemon(self, flag):
        """
        Set to `True` if the client's thread should be a daemon.
        """
        self._th.daemon = flag

    def run_forever(self):
        """
        Simply blocks the thread until the
        websocket has terminated.
        """
        while not self.terminated:
            self._th.join(timeout=0.1)

    def handshake_ok(self):
        """
        Called when the upgrade handshake has completed
        successfully.

        Starts the client's thread.
        """
        self._th.start()

if __name__ == '__main__':
    from ws4py.client.threadedclient import WebSocketClient

    class EchoClient(WebSocketClient):
        def opened(self):
            def data_provider():
                for i in range(0, 200, 25):
                    yield "#" * i

            self.send(data_provider())

            for i in range(0, 200, 25):
                self.send("*" * i)

        def closed(self, code, reason):
            print(("Closed down", code, reason))

        def received_message(self, m):
            print("#%d" % len(m))
            if len(m) == 175:
                self.close(reason='bye bye')

    try:
        ws = EchoClient('ws://localhost:9000/ws', protocols=['http-only', 'chat'],
                        headers=[('X-Test', 'hello there')])
        ws.connect()
        ws.run_forever()
    except KeyboardInterrupt:
        ws.close()
