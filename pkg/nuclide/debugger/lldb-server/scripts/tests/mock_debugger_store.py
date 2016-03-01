
# Copyright (c) 2015-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the license found in the LICENSE file in
# the root directory of this source tree.

from mock_notification_channel import MockNotificationChannel


class MockDebuggerStore:
    def __init__(self):
        self._channel = MockNotificationChannel()

    @property
    def channel(self):
        return self._channel
