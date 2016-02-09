# Copyright (c) 2015-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the license found in the LICENSE file in
# the root directory of this source tree.

import lldb
import serialize
from threading import Thread


class LLDBListenerThread(Thread):
    '''Implement lldb event pumping and process state update.
    The process state updates are converted into Chrome debugger notification to update UI.
    '''
    should_quit = False

    def __init__(self, server, location_serializer, remote_object_manager,
                 module_source_path_updater, thread_manager, process):
      Thread.__init__(self)
      self.daemon = True

      self.server = server
      self.location_serializer = location_serializer
      self.remote_object_manager = remote_object_manager
      self.module_source_path_updater = module_source_path_updater
      self.listener = lldb.SBListener('Chrome Dev Tools Listener')
      self.thread_manager = thread_manager

      self._add_listener_to_process(process)
      self._broadcast_process_state(process)

      self._add_listener_to_target(process.target)

    def _add_listener_to_target(self, target):
        # Listen for breakpoint/watchpoint events (Added/Removed/Disabled/etc).
        broadcaster = target.GetBroadcaster()
        mask = lldb.SBTarget.eBroadcastBitBreakpointChanged | lldb.SBTarget.eBroadcastBitWatchpointChanged | lldb.SBTarget.eBroadcastBitModulesLoaded
        broadcaster.AddListener(self.listener, mask)

    def _add_listener_to_process(self, process):
        # Listen for process events (Start/Stop/Interrupt/etc).
        broadcaster = process.GetBroadcaster()
        mask = lldb.SBProcess.eBroadcastBitStateChanged
        broadcaster.AddListener(self.listener, mask)

    def _broadcast_process_state(self, process):
        # Reset the object group so old frame variable objects don't linger
        # forever.
        self.thread_manager.release()
        if process.state == lldb.eStateStepping or process.state == lldb.eStateRunning:
            self.server.send_notification('Debugger.resumed', None)
        else:
            thread = process.GetSelectedThread()
            self.thread_manager.update(process)
            params = {
              "callFrames": self.thread_manager.get_thread_stack(thread),
              "reason": serialize.StopReason_to_string(thread.GetStopReason()),
              "data": {},
            }
            self.server.send_notification('Debugger.paused', params)

    def _breakpoint_event(self, event):
        breakpoint = lldb.SBBreakpoint.GetBreakpointFromEvent(event)
        for location in self.location_serializer.get_breakpoint_locations(breakpoint):
            params = {
                'breakpointId': str(breakpoint.id),
                'location': location,
            }
            self.server.send_notification('Debugger.breakpointResolved', params)

    def _watchpoint_event(self, event):
        # TODO(williamsc) Add support for sending watchpoint change events.
        pass

    def run(self):
        while not self.should_quit:
            event = lldb.SBEvent()
            if self.listener.WaitForEvent(1, event):
                if event.GetType() == lldb.SBTarget.eBroadcastBitModulesLoaded:
                    self.module_source_path_updater.modules_updated()
                elif lldb.SBProcess.EventIsProcessEvent(event):
                    self._broadcast_process_state(lldb.SBProcess.GetProcessFromEvent(event))
                elif lldb.SBBreakpoint.EventIsBreakpointEvent(event):
                    self._breakpoint_event(event)
                elif lldb.SBWatchpoint.EventIsWatchpointEvent(event):
                    self._watchpoint_event(event)
