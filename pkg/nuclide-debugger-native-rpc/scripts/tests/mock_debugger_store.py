# Copyright (c) 2015-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the license found in the LICENSE file in
# the root directory of this source tree.

from mock_chrome_channel import MockChromeChannel


class MockDebuggerStore:
    def __init__(self):
        self._chrome_channel = MockChromeChannel()

    @property
    def chrome_channel(self):
        return self._chrome_channel
