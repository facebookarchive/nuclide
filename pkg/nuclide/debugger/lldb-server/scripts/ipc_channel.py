# Copyright (c) 2015-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the license found in the LICENSE file in
# the root directory of this source tree.

import os
import json
from logging_helper import log_debug


class IpcChannel:
    '''Provides an ipc channel to communicate with Nuclide JS.
    '''
    def __init__(self, is_interactive):
        self._is_interactive = is_interactive
        if self._is_interactive:
            return

        IPC_CHANNEL_FD = 4
        buffering = 1  # 1 means line-buffered.
        self._file = os.fdopen(IPC_CHANNEL_FD, 'r+', buffering)

    def __del__(self):
        if self._is_interactive:
            return
        self._file.close()

    def send_output_message(self, level, text):
        """ Send an output notification to Nuclide through ipc.
        """
        if self._is_interactive:
            return
        message = {
            'type': 'Nuclide.userOutput',
            'message': {
                'level': level,
                'text': text,
            }
        }
        message_in_json = json.dumps(message);
        log_debug('send_output_message: %s' % message_in_json)
        self._file.write(message_in_json + '\n')
