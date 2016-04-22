# Copyright (c) 2015-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the license found in the LICENSE file in
# the root directory of this source tree.

import os
import json
from logging_helper import log_debug, log_error


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
        self._message_id = 0;

    def __del__(self):
        if self._is_interactive:
            return
        self._file.close()

    def _send_output_message(self, level, text, is_sync):
        """ Send an output notification to Nuclide through ipc.
        """
        if self._is_interactive:
            return

        self._message_id += 1
        message = {
            'id': self._message_id,
            'type': 'Nuclide.userOutput',
            'isSync': is_sync,
            'message': {
                'level': level,
                'text': text,
            }
        }
        message_in_json = json.dumps(message, ensure_ascii=False)
        log_debug('send_output_message: %s' % message_in_json)
        self._file.write(message_in_json + '\n')
        self._file.flush()

    def send_output_message_async(self, level, text):
        self._send_output_message(level, text, is_sync=False)

    def send_output_message_sync(self, level, text):
        self._send_output_message(level, text, is_sync=True)

        # Wait from response from client.
        response = self._file.readline()
        log_debug('Ipc response: %s' % response)
        response_object = json.loads(response)
        if int(response_object['message_id']) != self._message_id:
            log_error('Get wrong ipc response: %s' % response)
