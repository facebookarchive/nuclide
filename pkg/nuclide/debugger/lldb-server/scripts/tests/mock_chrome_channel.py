# Copyright (c) 2015-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the license found in the LICENSE file in
# the root directory of this source tree.

"""
Mock module/function to swap in for chromedebugger's send_notifications.

Captures notifications for later analysis.
"""

class MockChromeChannel(object):

    def __init__(self, running_signal, stopped_sigal):
        self._running_signal = running_signal
        self._stopped_sigal = stopped_sigal
        self.sent_notifications = []

    def send_notification(self, method, result=None):
        self.sent_notifications.append({'method': method, 'params': result})
        if method == 'Debugger.resumed':
            self._running_signal.set()
        elif method == 'Debugger.paused':
            self._stopped_sigal.set()

    def enable(self):
        pass
