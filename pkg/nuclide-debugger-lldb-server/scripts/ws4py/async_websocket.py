# -*- coding: utf-8 -*-
__doc__ = """
WebSocket implementation that relies on two new Python
features:

* asyncio to provide the high-level interface above transports
* yield from to delegate to the reading stream whenever more
  bytes are required

You can use these implementations in that context
and benefit from those features whilst using ws4py.

Strictly speaking this module probably doesn't have to
be called async_websocket but it feels this will be its typical
usage and is probably more readable than
delegated_generator_websocket_on_top_of_asyncio.py
"""
import asyncio
import types

from ws4py.websocket import WebSocket as _WebSocket
from ws4py.messaging import Message

__all__ = ['WebSocket', 'EchoWebSocket']

class WebSocket(_WebSocket):
    def __init__(self, proto):
        """
        A :pep:`3156` ready websocket handler that works
        well in a coroutine-aware loop such as the one provided
        by the asyncio module.

        The provided `proto` instance is a
        :class:`asyncio.Protocol` subclass instance that will
        be used internally to read and write from the
        underlying transport.

        Because the base :class:`ws4py.websocket.WebSocket`
        class is still coupled a bit to the socket interface,
        we have to override a little more than necessary
        to play nice with the :pep:`3156` interface. Hopefully,
        some day this will be cleaned out.
        """
        _WebSocket.__init__(self, None)
        self.started = False
        self.proto = proto

    @property
    def local_address(self):
        """
        Local endpoint address as a tuple
        """
        if not self._local_address:
            self._local_address = self.proto.reader.transport.get_extra_info('sockname')
            if len(self._local_address) == 4:
                self._local_address = self._local_address[:2]
        return self._local_address

    @property
    def peer_address(self):
        """
        Peer endpoint address as a tuple
        """
        if not self._peer_address:
            self._peer_address = self.proto.reader.transport.get_extra_info('peername')
            if len(self._peer_address) == 4:
                self._peer_address = self._peer_address[:2]
        return self._peer_address

    def once(self):
        """
        The base class directly is used in conjunction with
        the :class:`ws4py.manager.WebSocketManager` which is
        not actually used with the asyncio implementation
        of ws4py. So let's make it clear it shan't be used.
        """
        raise NotImplemented()

    def close_connection(self):
        """
        Close the underlying transport
        """
        @asyncio.coroutine
        def closeit():
            yield from self.proto.writer.drain()
            self.proto.writer.close()
        asyncio.async(closeit())

    def _write(self, data):
        """
        Write to the underlying transport
        """
        @asyncio.coroutine
        def sendit(data):
            self.proto.writer.write(data)
            yield from self.proto.writer.drain()
        asyncio.async(sendit(data))

    @asyncio.coroutine
    def run(self):
        """
        Coroutine that runs until the websocket
        exchange is terminated. It also calls the
        `opened()` method to indicate the exchange
        has started.
        """
        self.started = True
        try:
            self.opened()
            reader = self.proto.reader
            while True:
                data = yield from reader.read(self.reading_buffer_size)
                if not self.process(data):
                    return False
        finally:
            self.terminate()

        return True

class EchoWebSocket(WebSocket):
    def received_message(self, message):
        """
        Automatically sends back the provided ``message`` to
        its originating endpoint.
        """
        self.send(message.data, message.is_binary)
