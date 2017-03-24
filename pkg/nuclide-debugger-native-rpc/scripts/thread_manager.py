# Copyright (c) 2015-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the license found in the LICENSE file in
# the root directory of this source tree.

from find_lldb import get_lldb
from remote_objects import ValueListRemoteObject


CALL_STACK_OBJECT_GROUP = 'thread_stack'
MAX_STOP_REASON_DESCRIPTION_LENGTH = 1024


class ThreadManager(object):
    """Manages all the threads in target process.

    The client expects one `Debugger.threadCreated` message for each thread.
    """
    def __init__(self, debugger_store):
        """Initialize a ThreadManager for a given connection.
        """
        self._debugger_store = debugger_store
        self._previousStopThreadId = None
        self._threadSwitchMessage = None

    def update_thread_switch_message(self, process):
        stopThreadId = process.GetSelectedThread().GetThreadID()
        if self._previousStopThreadId is not None and self._previousStopThreadId != stopThreadId:
            self._threadSwitchMessage = "Active thread switched from thread {0} to thread {1}" \
                .format(self._previousStopThreadId, stopThreadId)
        else:
            self._threadSwitchMessage = None
        self._previousStopThreadId = stopThreadId

    def send_threads_updated(self, process):
        """Update threads status for input process."""
        threads_array = []
        lldb = get_lldb()
        stopThreadId = process.GetSelectedThread().GetThreadID()
        for thread in process.threads:
            description_stream = lldb.SBStream()
            thread.GetDescription(description_stream)
            frame = thread.GetSelectedFrame()
            location = self._debugger_store.location_serializer \
                .get_frame_location(frame)
            threads_array.append({
                'id': thread.GetThreadID(),
                'name': thread.GetName(),
                'address': self._get_frame_name(frame),
                'location': location,
                'hasSource': self._debugger_store.location_serializer.has_source(frame),
                'stopReason': self.get_thread_stop_description(thread),
                'description': description_stream.GetData(),
            })
        params = {
            'owningProcessId': process.id,
            'stopThreadId': stopThreadId,
            'threads': threads_array,
        }
        self._debugger_store.chrome_channel.send_notification('Debugger.threadsUpdated', params)

    def get_thread_stack(self, thread):
        """Fetch serialized callstack for input thread."""
        result = []
        for frame in thread.frames:
            # SBFrame.GetVariables(arguments, locals, statics, in_scope_only)
            variables = frame.GetVariables(True, True, False, True)
            local_variables = self._debugger_store.remote_object_manager.add_object(
                ValueListRemoteObject(
                    variables,
                    self._debugger_store.remote_object_manager.
                    get_add_object_func(CALL_STACK_OBJECT_GROUP)),
                CALL_STACK_OBJECT_GROUP)
            scopeChainObject = local_variables.serialized_value
            scopeChainObject.update({'description': 'Locals'})
            result.append({
                'callFrameId': "%d.%d" % (frame.thread.idx, frame.idx),
                'functionName': self._get_frame_name(frame),
                'location': self._debugger_store.location_serializer.get_frame_location(frame),
                'hasSource': self._debugger_store.location_serializer.has_source(frame),
                'scopeChain': [{
                    'object': scopeChainObject,
                    'type': 'local',
                }],
            })
        return result

    def get_thread_stop_description(self, thread):
        return thread.GetStopDescription(MAX_STOP_REASON_DESCRIPTION_LENGTH)

    def _get_frame_name(self, frame):
        target = frame.GetThread().GetProcess().GetTarget()
        offset = frame.GetPCAddress().GetLoadAddress(target) \
            - frame.GetSymbol().GetStartAddress().GetLoadAddress(target)
        return "%s +%x" % (frame.name, offset)

    def get_thread_switch_message(self):
        return self._threadSwitchMessage

    def release(self):
        self._debugger_store.remote_object_manager.release_object_group(CALL_STACK_OBJECT_GROUP)
