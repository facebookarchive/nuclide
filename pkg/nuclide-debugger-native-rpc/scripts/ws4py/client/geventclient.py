# -*- coding: utf-8 -*-
import copy

import gevent
from gevent import Greenlet
from gevent.queue import Queue

from ws4py.client import WebSocketBaseClient

__all__ = ['WebSocketClient']

class WebSocketClient(WebSocketBaseClient):
    def __init__(self, url, protocols=None, extensions=None, ssl_options=None, headers=None):
        """
        WebSocket client that executes the
        :meth:`run() <ws4py.websocket.WebSocket.run>` into a gevent greenlet.

        .. code-block:: python

          ws = WebSocketClient('ws://localhost:9000/echo', protocols=['http-only', 'chat'])
          ws.connect()

          ws.send("Hello world")

          def incoming():
            while True:
               m = ws.receive()
               if m is not None:
                  print str(m)
               else:
                  break

          def outgoing():
            for i in range(0, 40, 5):
               ws.send("*" * i)

          greenlets = [
             gevent.spawn(incoming),
             gevent.spawn(outgoing),
          ]
          gevent.joinall(greenlets)
        """
        WebSocketBaseClient.__init__(self, url, protocols, extensions,
                                     ssl_options=ssl_options, headers=headers)
        self._th = Greenlet(self.run)

        self.messages = Queue()
        """
        Queue that will hold received messages.
        """

    def handshake_ok(self):
        """
        Called when the upgrade handshake has completed
        successfully.

        Starts the client's thread.
        """
        self._th.start()

    def received_message(self, message):
        """
        Override the base class to store the incoming message
        in the `messages` queue.
        """
        self.messages.put(copy.deepcopy(message))

    def closed(self, code, reason=None):
        """
        Puts a :exc:`StopIteration` as a message into the
        `messages` queue.
        """
        # When the connection is closed, put a StopIteration
        # on the message queue to signal there's nothing left
        # to wait for
        self.messages.put(StopIteration)

    def receive(self):
        """
        Returns messages that were stored into the
        `messages` queue and returns `None` when the
        websocket is terminated or closed.
        """
        # If the websocket was terminated and there are no messages
        # left in the queue, return None immediately otherwise the client
        # will block forever
        if self.terminated and self.messages.empty():
            return None
        message = self.messages.get()
        if message is StopIteration:
            return None
        return message
