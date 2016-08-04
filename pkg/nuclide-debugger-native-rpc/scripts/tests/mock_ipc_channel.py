# Copyright (c) 2015-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the license found in the LICENSE file in
# the root directory of this source tree.

"""
Mock module/function to swap in for chromedebugger's ipc_channel
"""

class MockIpcChannel(object):

    def __init__(self):
        pass

    def send_output_message_sync(self, level, text):
        pass

    def send_output_message_async(self, level, text):
        pass
