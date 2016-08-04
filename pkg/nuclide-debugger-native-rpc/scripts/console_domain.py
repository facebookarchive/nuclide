# Copyright (c) 2015-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the license found in the LICENSE file in
# the root directory of this source tree.

"""
Defines methods for the Console domain.
https://developer.chrome.com/devtools/docs/protocol/1.1/console
"""
from handler import HandlerDomain, handler

class ConsoleDomain(HandlerDomain):
    enabled = False
    last_message = None

    def __init__(self, **kwargs):
        self.messages = []
        super(ConsoleDomain, self).__init__(**kwargs)

    @property
    def name(self):
        return 'Console'

    def flush_messages(self):
        if not self.enabled:
            return

        for message in self.messages:
            if self.last_message and self.last_message['text'] is message['text']:
                self.last_message['repeatCount'] += 1
                params = {'count': self.last_message['repeatCount']}
                self.debugger_store.chrome_channel.send_notification('Console.messageRepeatCountUpdated', params)
            else:
                self.debugger_store.chrome_channel.send_notification('Console.messageAdded', {'message': message} )
                self.last_message = message
        self.messages = []

    @handler()
    def enable(self, params):
        self.enabled = True
        self.flush_messages()
        return {}

    @handler()
    def disable(self, params):
        self.enabled = False
        return {}

    @handler()
    def clear_messages(self, params):
        self.messages = []
        self.debugger_store.chrome_channel.send_notification('Console.messagesCleared')

    def log(self, server, message):
        # Get either the last message in the queue or None.
        last_message = (self.messages or [None])[-1]

        if last_message and last_message['text'] is message:
            last_message['repeatCount'] += 1
        else:
            new_message = {'text': message, 'repeatCount': 0}
            self.messages.append(new_message)
        self.flush_messages()
