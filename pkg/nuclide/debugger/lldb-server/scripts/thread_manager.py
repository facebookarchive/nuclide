# Copyright (c) 2015-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the license found in the LICENSE file in
# the root directory of this source tree.

import lldb
from remote_objects import ValueListRemoteObject


CALL_STACK_OBJECT_GROUP = 'thread_stack'


class ThreadManager(object):
    """Manages all the threads in target process.

    The client expects one `Debugger.threadCreated` message for each thread.
    """
    def __init__(self, socket, location_serializer, remote_object_manager):
        """Initialize a ThreadManager for a given connection.

        Args:
            socket (DebuggerWebSocket): socket to send thread update notification.
            location_serializer: serialize frame location into JSON.
            remote_object_manager: manage the local variables in stack frame.
        """
        self._socket = socket
        self._location_serializer = location_serializer
        self._remote_object_manager = remote_object_manager

    def update(self, process):
        """Update threads status for input process."""
        threads_array = []
        for thread in process.threads:
            status_stream = lldb.SBStream()
            thread.GetStatus(status_stream)

            description_stream = lldb.SBStream()
            thread.GetDescription(description_stream)

            threads_array.append({
                'id': thread.GetThreadID(),
                'name': thread.GetName(),
                'status': status_stream.GetData(),
                'description': description_stream.GetData(),
                'stop_reason': thread.GetStopReason(),
                'location': self._location_serializer.get_frame_location(thread.GetSelectedFrame()),
            })

        params = {
            'owningProcessId': process.id,
            'stopThreadId': process.GetSelectedThread().GetThreadID(),
            'threads': threads_array,
        }
        self._socket.send_notification('Debugger.threadsUpdated', params)

    def get_thread_stack(self, thread):
        """Fetch serialized callstack for input thread."""
        result = []
        for frame in thread.frames:
            # SBFrame.GetVariables(arguments, locals, statics, in_scope_only)
            variables = frame.GetVariables(True, True, True, False)
            local_variables = self._remote_object_manager.add_object(
                ValueListRemoteObject(
                    variables,
                    self._remote_object_manager.get_add_object_func(CALL_STACK_OBJECT_GROUP)),
                CALL_STACK_OBJECT_GROUP)
            target = frame.GetThread().GetProcess().GetTarget()
            offset = frame.GetPCAddress().GetLoadAddress(target) \
                - frame.GetSymbol().GetStartAddress().GetLoadAddress(target)
            result.append({
                'callFrameId': "%d.%d" % (frame.thread.idx, frame.idx),
                'functionName': "%s +%x" % (frame.name, offset),
                'location': self._location_serializer.get_frame_location(frame),
                'scopeChain': [{
                    'object': local_variables.serialized_value,
                    'type': 'local',
                }],
            })
        return result
