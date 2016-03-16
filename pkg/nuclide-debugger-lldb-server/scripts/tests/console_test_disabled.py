# Copyright (c) 2015-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the license found in the LICENSE file in
# the root directory of this source tree.

import os
import sys
import unittest

from ..console_domain import ConsoleDomain
from mock_debugger_store import MockDebuggerStore

class ConsoleDomainTestCase(unittest.TestCase):
    def setUp(self):
        self.debugger_store = MockDebuggerStore()
        self.console = ConsoleDomain(debugger_store = self.debugger_store)

    def test_enable_response(self):
        self.assertEquals(self.console.handle('enable', {}), {})
        self.assertTrue(self.console.enabled)

    def test_disable_response(self):
        self.assertEquals(self.console.handle('disable', {}), {})
        self.assertFalse(self.console.enabled)

    def _validate_message(self, notification, text, repeats):
        self.assertEquals(notification['method'], 'Console.messageAdded')
        self.assertEquals(notification['params']['message']['text'], text)

    def _validate_repeat_notification(self, notification, repeats):
        self.assertEquals(notification['method'], 'Console.messageRepeatCountUpdated')
        self.assertEquals(notification['params']['count'], repeats)

    def test_single_message(self):
        self.assertEquals(self.console.handle('enable', {}), {})
        self.assertTrue(self.console.enabled)

        self.console.log(self.debugger_store.chrome_channel, 'test')
        self.assertEquals(len(self.debugger_store.chrome_channel.sent_notifications), 1)

        self._validate_message(self.debugger_store.chrome_channel.sent_notifications[0], 'test', 1)

    def test_single_message_repeat_disabled(self):
        self.assertFalse(self.console.enabled)

        self.console.log(self.debugger_store.chrome_channel, 'test')
        self.console.log(self.debugger_store.chrome_channel, 'test')

        self.console.handle('enable', {})
        self.assertTrue(self.console.enabled)

        self.assertEquals(len(self.debugger_store.chrome_channel.sent_notifications), 1)

        self._validate_message(self.debugger_store.chrome_channel.sent_notifications[0], 'test', 1)

    def test_single_message_repeat_enabled(self):
        self.console.handle('enable', {})
        self.assertTrue(self.console.enabled)

        self.console.log(self.debugger_store.chrome_channel, 'test')
        self.console.log(self.debugger_store.chrome_channel, 'test')
        self.assertEquals(len(self.debugger_store.chrome_channel.sent_notifications), 2)

        self._validate_message(self.debugger_store.chrome_channel.sent_notifications[0], 'test', 0)
        self._validate_repeat_notification(self.debugger_store.chrome_channel.sent_notifications[1], 1)

    def test_multiple_different_messages(self):
        self.console.handle('enable', {})
        self.assertTrue(self.console.enabled)

        self.console.log(self.debugger_store.chrome_channel, 'test1')
        self.console.log(self.debugger_store.chrome_channel, 'test2')
        self.console.log(self.debugger_store.chrome_channel, 'test3')
        self.assertEquals(len(self.debugger_store.chrome_channel.sent_notifications), 3)

        self._validate_message(self.debugger_store.chrome_channel.sent_notifications[0], 'test1', 0)
        self._validate_message(self.debugger_store.chrome_channel.sent_notifications[1], 'test2', 0)
        self._validate_message(self.debugger_store.chrome_channel.sent_notifications[2], 'test3', 0)

    def test_repeat_sandwich(self):
        self.console.handle('enable', {})
        self.assertTrue(self.console.enabled)

        self.console.log(self.debugger_store.chrome_channel, 'test1')
        self.console.log(self.debugger_store.chrome_channel, 'test2')
        self.console.log(self.debugger_store.chrome_channel, 'test2')
        self.console.log(self.debugger_store.chrome_channel, 'test1')
        self.assertEquals(len(self.debugger_store.chrome_channel.sent_notifications), 4)

        self._validate_message(self.debugger_store.chrome_channel.sent_notifications[0], 'test1', 0)
        self._validate_message(self.debugger_store.chrome_channel.sent_notifications[1], 'test2', 0)
        self._validate_repeat_notification(self.debugger_store.chrome_channel.sent_notifications[2], 1)
        self._validate_message(self.debugger_store.chrome_channel.sent_notifications[3], 'test1', 0)
