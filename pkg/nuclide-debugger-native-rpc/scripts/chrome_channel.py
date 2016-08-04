# Copyright (c) 2015-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the license found in the LICENSE file in
# the root directory of this source tree.

import json
from logging_helper import log_debug


class ChromeChannel:
    '''Provides caching and flush capability for sending Chrome debugger notifications.
    '''
    def __init__(self):
        self._caches = []
        self._socket = None
        self._channelAvailable = False

    def send_notification(self, method, params=None):
        """ Send a notification over the socket to a Chrome Dev Tools client.
        """
        notification_in_json = json.dumps({'method': method, 'params': params}, ensure_ascii=False)
        log_debug('send_notification: %s' % notification_in_json)

        if self._channelAvailable:
            self._send_helper(notification_in_json)
        else:
            self._caches.append(notification_in_json)

    def setSocket(self, socket):
        self._socket = socket

    def enable(self):
        self._channelAvailable = True
        self._flush()

    def _flush(self):
        for message in self._caches:
            self._send_helper(message)
        self._caches[:] = [] # Clear cache.

    def _send_helper(self, message):
        assert self._socket, "setSocket() must be called first."
        self._socket.send(message)
