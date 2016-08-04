# -*- coding: utf-8 -*-
__doc__ = """
The manager module provides a selected classes to
handle websocket's execution.

Initially the rationale was to:

- Externalize the way the CherryPy server had been setup
  as its websocket management was too tightly coupled with
  the plugin implementation.
- Offer a management that could be used by other
  server or client implementations.
- Move away from the threaded model to the event-based
  model by relying on `select` or `epoll` (when available).


A simple usage for handling websocket clients:

.. code-block:: python

    from ws4py.client import WebSocketBaseClient
    from ws4py.manager import WebSocketManager

    m = WebSocketManager()

    class EchoClient(WebSocketBaseClient):
        def handshake_ok(self):
            m.add(self)  # register the client once the handshake is done

        def received_message(self, msg):
            print str(msg)

    m.start()

    client = EchoClient('ws://localhost:9000/ws')
    client.connect()

    m.join()  # blocks forever

Managers are not compulsory but hopefully will help your
workflow. For clients, you can still rely on threaded, gevent or
tornado based implementations of course.
"""
import logging
import select
import threading
import time

from ws4py import format_addresses
from ws4py.compat import py3k

logger = logging.getLogger('ws4py')

class SelectPoller(object):
    def __init__(self, timeout=0.1):
        """
        A socket poller that uses the `select`
        implementation to determines which
        file descriptors have data available to read.

        It is available on all platforms.
        """
        self._fds = []
        self.timeout = timeout

    def release(self):
        """
        Cleanup resources.
        """
        self._fds = []

    def register(self, fd):
        """
        Register a new file descriptor to be
        part of the select polling next time around.
        """
        if fd not in self._fds:
            self._fds.append(fd)

    def unregister(self, fd):
        """
        Unregister the given file descriptor.
        """
        if fd in self._fds:
            self._fds.remove(fd)

    def poll(self):
        """
        Polls once and returns a list of
        ready-to-be-read file descriptors.
        """
        if not self._fds:
            time.sleep(self.timeout)
            return []

        r, w, x = select.select(self._fds, [], [], self.timeout)
        return r

class EPollPoller(object):
    def __init__(self, timeout=0.1):
        """
        An epoll poller that uses the ``epoll``
        implementation to determines which
        file descriptors have data available to read.

        Available on Unix flavors mostly.
        """
        self.poller = select.epoll()
        self.timeout = timeout

    def release(self):
        """
        Cleanup resources.
        """
        self.poller.close()

    def register(self, fd):
        """
        Register a new file descriptor to be
        part of the select polling next time around.
        """
        try:
            self.poller.register(fd, select.EPOLLIN | select.EPOLLPRI)
        except IOError:
            pass

    def unregister(self, fd):
        """
        Unregister the given file descriptor.
        """
        self.poller.unregister(fd)

    def poll(self):
        """
        Polls once and yields each ready-to-be-read
        file-descriptor
        """
        events = self.poller.poll(timeout=self.timeout)
        for fd, event in events:
            if event | select.EPOLLIN | select.EPOLLPRI:
                yield fd

class KQueuePoller(object):
    def __init__(self, timeout=0.1):
        """
        An epoll poller that uses the ``epoll``
        implementation to determines which
        file descriptors have data available to read.

        Available on Unix flavors mostly.
        """
        self.poller = select.epoll()
        self.timeout = timeout

    def release(self):
        """
        Cleanup resources.
        """
        self.poller.close()

    def register(self, fd):
        """
        Register a new file descriptor to be
        part of the select polling next time around.
        """
        try:
            self.poller.register(fd, select.EPOLLIN | select.EPOLLPRI)
        except IOError:
            pass

    def unregister(self, fd):
        """
        Unregister the given file descriptor.
        """
        self.poller.unregister(fd)

    def poll(self):
        """
        Polls once and yields each ready-to-be-read
        file-descriptor
        """
        events = self.poller.poll(timeout=self.timeout)
        for fd, event in events:
            if event | select.EPOLLIN | select.EPOLLPRI:
                yield fd

class WebSocketManager(threading.Thread):
    def __init__(self, poller=None):
        """
        An event-based websocket manager. By event-based, we mean
        that the websockets will be called when their
        sockets have data to be read from.

        The manager itself runs in its own thread as not to
        be the blocking mainloop of your application.

        The poller's implementation is automatically chosen
        with ``epoll`` if available else ``select`` unless you
        provide your own ``poller``.
        """
        threading.Thread.__init__(self)
        self.lock = threading.Lock()
        self.websockets = {}
        self.running = False

        if poller:
            self.poller = poller
        else:
            if hasattr(select, "epoll"):
                self.poller = EPollPoller()
                logger.info("Using epoll")
            else:
                self.poller = SelectPoller()
                logger.info("Using select as epoll is not available")

    def __len__(self):
        return len(self.websockets)

    def __iter__(self):
        if py3k:
            return iter(self.websockets.values())
        else:
            return self.websockets.itervalues()

    def __contains__(self, ws):
        fd = ws.sock.fileno()
        # just in case the file descriptor was reused
        # we actually check the instance (well, this might
        # also have been reused...)
        return self.websockets.get(fd) is ws

    def add(self, websocket):
        """
        Manage a new websocket.

        First calls its :meth:`opened() <ws4py.websocket.WebSocket.opened>`
        method and register its socket against the poller
        for reading events.
        """
        if websocket in self:
            return
        
        logger.info("Managing websocket %s" % format_addresses(websocket))
        websocket.opened()
        with self.lock:
            fd = websocket.sock.fileno()
            self.websockets[fd] = websocket
            self.poller.register(fd)

    def remove(self, websocket):
        """
        Remove the given ``websocket`` from the manager.

        This does not call its :meth:`closed() <ws4py.websocket.WebSocket.closed>`
        method as it's out-of-band by your application
        or from within the manager's run loop.
        """
        if websocket not in self:
            return
        
        logger.info("Removing websocket %s" % format_addresses(websocket))
        with self.lock:
            fd = websocket.sock.fileno()
            self.websockets.pop(fd, None)
            self.poller.unregister(fd)

    def stop(self):
        """
        Mark the manager as terminated and
        releases its resources.
        """
        self.running = False
        with self.lock:
            self.websockets.clear()
            self.poller.release()

    def run(self):
        """
        Manager's mainloop executed from within a thread.

        Constantly poll for read events and, when available,
        call related websockets' `once` method to
        read and process the incoming data.

        If the :meth:`once() <ws4py.websocket.WebSocket.once>`
        method returns a `False` value, its :meth:`terminate() <ws4py.websocket.WebSocket.terminate>`
        method is also applied to properly close
        the websocket and its socket is unregistered from the poller.

        Note that websocket shouldn't take long to process
        their data or they will block the remaining
        websockets with data to be handled. As for what long means,
        it's up to your requirements.
        """
        self.running = True
        while self.running:
            with self.lock:
                polled = self.poller.poll()

            if not self.running:
                break

            for fd in polled:
                if not self.running:
                    break
                
                ws = self.websockets.get(fd)
                
                if ws and not ws.terminated:
                    if not ws.once():
                        with self.lock:
                            fd = ws.sock.fileno()
                            self.websockets.pop(fd, None)
                            self.poller.unregister(fd)

                        if not ws.terminated:
                            logger.info("Terminating websocket %s" % format_addresses(ws))
                            ws.terminate()

    def close_all(self, code=1001, message='Server is shutting down'):
        """
        Execute the :meth:`close() <ws4py.websocket.WebSocket.close>`
        method of each registered websockets to initiate the closing handshake.
        It doesn't wait for the handshake to complete properly.
        """
        with self.lock:
            logger.info("Closing all websockets with [%d] '%s'" % (code, message))
            for ws in iter(self):
                ws.close(code=code, reason=message)

    def broadcast(self, message, binary=False):
        """
        Broadcasts the given message to all registered
        websockets, at the time of the call.

        Broadcast may fail on a given registered peer
        but this is silent as it's not the method's
        purpose to handle websocket's failures.
        """
        with self.lock:
            websockets = self.websockets.copy()
            if py3k:
                ws_iter = iter(websockets.values())
            else:
                ws_iter = websockets.itervalues()

        for ws in ws_iter:
            if not ws.terminated:
                try:
                    ws.send(message, binary)
                except:
                    pass
