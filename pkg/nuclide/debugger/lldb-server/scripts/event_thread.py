# Copyright (c) 2015-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the license found in the LICENSE file in
# the root directory of this source tree.

import lldb
import serialize
from threading import Thread
from logging_helper import log_debug


class LLDBListenerThread(Thread):
    '''Implement lldb event pumping and process state update.
    The process state updates are converted into Chrome debugger notification to update UI.
    '''
    should_quit = False

    def __init__(self, debugger_store, is_attach):
      Thread.__init__(self)
      self.daemon = True
      self._debugger_store = debugger_store
      self._listener = debugger_store.debugger.GetListener()
      # Send scriptPaused for each souce files.
      self._debugger_store.module_source_path_updater.modules_updated()

      process = debugger_store.debugger.GetSelectedTarget().process
      self._add_listener_to_process(process)
      if is_attach:
          self._broadcast_process_state(process)
      self._add_listener_to_target(process.target)

    def _add_listener_to_target(self, target):
        # Listen for breakpoint/watchpoint events (Added/Removed/Disabled/etc).
        broadcaster = target.GetBroadcaster()
        mask = lldb.SBTarget.eBroadcastBitBreakpointChanged | lldb.SBTarget.eBroadcastBitWatchpointChanged | lldb.SBTarget.eBroadcastBitModulesLoaded
        broadcaster.AddListener(self._listener, mask)

    def _add_listener_to_process(self, process):
        # Listen for process events (Start/Stop/Interrupt/etc).
        broadcaster = process.GetBroadcaster()
        mask = lldb.SBProcess.eBroadcastBitStateChanged
        broadcaster.AddListener(self._listener, mask)

    def _sendPausedNotification(self, thread):
        params = {
          "callFrames": self._debugger_store.thread_manager.get_thread_stack(thread),
          "reason": serialize.StopReason_to_string(thread.GetStopReason()),
          "data": {},
        }
        self._debugger_store.channel.send_notification('Debugger.paused', params)

    def _broadcast_process_state(self, process):
        # Reset the object group so old frame variable objects don't linger
        # forever.
        log_debug('_broadcast_process_state, process state: %d' % process.state)
        self._debugger_store.thread_manager.release()
        if process.state == lldb.eStateStepping or process.state == lldb.eStateRunning:
            self._debugger_store.channel.send_notification('Debugger.resumed', None)
        elif process.state == lldb.eStateExited:
            log_debug('Process exited: %s' % process.GetExitDescription())
            self.should_quit = True
        else:
            self._debugger_store.thread_manager.update(process)
            thread = process.GetSelectedThread()
            log_debug('thread.GetStopReason(): %s' % serialize.StopReason_to_string(thread.GetStopReason()))
            self._sendPausedNotification(thread)

    def _breakpoint_event(self, event):
        breakpoint = lldb.SBBreakpoint.GetBreakpointFromEvent(event)
        for location in self._debugger_store.location_serializer.get_breakpoint_locations(breakpoint):
            params = {
                'breakpointId': str(breakpoint.id),
                'location': location,
            }
            self._debugger_store.channel.send_notification('Debugger.breakpointResolved', params)

    def _watchpoint_event(self, event):
        # TODO(williamsc) Add support for sending watchpoint change events.
        pass

    def run(self):
        while not self.should_quit:
            event = lldb.SBEvent()
            if self._listener.WaitForEvent(1, event):
                if event.GetType() == lldb.SBTarget.eBroadcastBitModulesLoaded:
                    self._debugger_store.module_source_path_updater.modules_updated()
                elif lldb.SBProcess.EventIsProcessEvent(event):
                    self._broadcast_process_state(lldb.SBProcess.GetProcessFromEvent(event))
                elif lldb.SBBreakpoint.EventIsBreakpointEvent(event):
                    self._breakpoint_event(event)
                elif lldb.SBWatchpoint.EventIsWatchpointEvent(event):
                    self._watchpoint_event(event)
