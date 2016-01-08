# Copyright (c) 2015-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the license found in the LICENSE file in
# the root directory of this source tree.

"""
Mock module/function to swap in for chromedebugger's send_notifications.

Captures notifications for later analysis.
"""

class MockServer(object):

    def __init__(self):
        self.sent_notifications = []

    def send_notification(self, method, result=None):
        self.sent_notifications.append({'method': method, 'params': result})
