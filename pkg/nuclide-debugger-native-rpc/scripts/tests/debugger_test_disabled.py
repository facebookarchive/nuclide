# Copyright (c) 2015-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the license found in the LICENSE file in
# the root directory of this source tree.

from ..find_lldb import lldb

from ..debugger_domain import DebuggerDomain
from ..thread_manager import CALL_STACK_OBJECT_GROUP
from ..debugger_store import DebuggerStore
from ..event_thread import LLDBListenerThread
from mock_chrome_channel import MockChromeChannel
from mock_ipc_channel import MockIpcChannel
from mock_remote_objects import MockRemoteObject
from test_executable import TestExecutable
import os
import shutil
import subprocess
import sys
import tempfile
import unittest
import time
import threading

lldb_debugger = lldb.SBDebugger.Create()

class DebuggerTestCase(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        from pkg_resources import resource_string
        cls.test_executable = TestExecutable(
            resource_string(__name__, 'process.c'),
            '.c')

    @classmethod
    def tearDownClass(cls):
        cls.test_executable.clean_up()
        lldb.SBDebugger.Destroy(lldb_debugger)

    def setUp(self):
        self.target = lldb_debugger.CreateTargetWithFileAndArch(
            self.__class__.test_executable.executable_path,
            lldb.LLDB_ARCH_DEFAULT)

        self.running_signal = threading.Event()
        self.stopped_signal = threading.Event()
        self.chrome_channel = MockChromeChannel(self.running_signal, self.stopped_signal)
        self.ipc_channel = MockIpcChannel()
        self.debugger_store = DebuggerStore(
            lldb_debugger,
            self.chrome_channel,
            self.ipc_channel,
            is_attach=False)
        self.debugger = DebuggerDomain(None, debugger_store = self.debugger_store)

    def tearDown(self):
        self.target = None
        self.chrome_channel = None
        self.debugger_store = None
        self.debugger = None
        self.running_signal = None
        self.stopped_signal = None

        if self.event_thread:
            self.event_thread.should_quit = True
            self.event_thread.join()
            self.event_thread = None


    def assertIsPaused(self):
        self.assertTrue(lldb_debugger.GetSelectedTarget().process.is_stopped)

    def launch_debugging(self, stop_at_entry):
        error = lldb.SBError()
        listener = lldb.SBListener('Chrome Dev Tools Listener')
        target = lldb_debugger.GetSelectedTarget()
        process = target.Launch (listener,
                        None,      # argv
                        None,      # envp
                        None,      # stdin_path
                        None,      # stdout_path
                        None,      # stderr_path
                        None,      # working directory
                        0,         # launch flags
                        stop_at_entry,      # Stop at entry
                        error)     # error
        self.event_thread = LLDBListenerThread(self.debugger_store, is_attach=False)
        self.event_thread.start()
        return process

    def wait_for_process_running(self):
        self.running_signal.wait()
        self.running_signal.clear()

    def wait_for_process_stop(self):
        self.stopped_signal.wait()
        self.stopped_signal.clear()

    def test_breakpoint_at_line(self):
        process = self.launch_debugging(stop_at_entry=True)
        self.wait_for_process_stop()
        self.debugger.handle('enable', {})
        self.debugger.handle('setBreakpointByUrl', {
            'lineNumber': 13,
            'url': 'file://' + os.path.realpath(self.__class__.test_executable.source_path)
        })

        process.Continue()
        self.wait_for_process_running()
        self.wait_for_process_stop()

        frame = process.GetSelectedThread().frame[0]
        self.assertEquals(frame.name, 'main')
        self.assertEquals(frame.line_entry.line, 14)

        sent_breakpoint_notification = False
        for notification in self.chrome_channel.sent_notifications:
            if notification['method'] == 'Debugger.breakpointResolved':
                sent_breakpoint_notification = True
                break
        self.assertTrue(sent_breakpoint_notification)

    def test_turn_off_breakpoints(self):
        self.test_breakpoint_at_line()
        self.debugger.handle('setBreakpointsActive', {'active': False})
        had_breakpoint = False
        for bp in lldb_debugger.GetSelectedTarget().breakpoint_iter():
            self.assertFalse(bp.enabled)
            had_breakpoint = True
        self.assertTrue(had_breakpoint)

    def test_toggle_breakpoints(self):
        self.test_turn_off_breakpoints()
        self.debugger.handle('setBreakpointsActive', {'active': True})
        had_breakpoint = False
        for bp in lldb_debugger.GetSelectedTarget().breakpoint_iter():
            self.assertTrue(bp.enabled)
            had_breakpoint = True
        self.assertTrue(had_breakpoint)

    def test_resume(self):
        self.test_breakpoint_at_line()
        self.debugger.handle('resume', {})
        self.wait_for_process_running()

    def test_pause(self):
        self.launch_debugging(stop_at_entry=False)
        self.debugger.handle('pause', {})
        self.assertTrue(lldb_debugger.GetSelectedTarget().process.is_alive)
        self.assertTrue(lldb_debugger.GetSelectedTarget().process.is_stopped)

    def test_stepping(self):
        # Use test_breakpoint_at_line to stop at line 14, the entry to test_function().
        self.test_breakpoint_at_line()

        self.debugger.handle('stepInto', {})
        self.wait_for_process_running()
        self.wait_for_process_stop()
        frame = lldb_debugger.GetSelectedTarget().process.GetSelectedThread().frame[0]
        self.assertEquals(frame.name, 'test_function')
        self.assertEquals(frame.line_entry.line, 7)

        self.debugger.handle('stepOut', {})
        self.wait_for_process_running()
        self.wait_for_process_stop()
        frame = lldb_debugger.GetSelectedTarget().process.GetSelectedThread().frame[0]
        self.assertEquals(frame.name, 'main')
        self.assertEquals(frame.line_entry.line, 14)

        self.debugger.handle('stepOver', {})
        self.wait_for_process_running()
        self.wait_for_process_stop()
        frame = lldb_debugger.GetSelectedTarget().process.GetSelectedThread().frame[0]
        self.assertEquals(frame.name, 'main')
        self.assertEquals(frame.line_entry.line, 16)

    def test_reset_callstack_object_group_on_stop(self):
        self.launch_debugging(stop_at_entry=True)
        self.wait_for_process_stop()
        self.debugger.handle('enable', {})
        self.debugger.handle('setBreakpointByUrl', {
            'lineNumber': 13,
            'url': 'file://' + os.path.realpath(self.__class__.test_executable.source_path)
        })
        obj = self.debugger_store.remote_object_manager.add_object(
            MockRemoteObject(),
            CALL_STACK_OBJECT_GROUP)
        self.assertIsNotNone(
            self.debugger_store.remote_object_manager.get_object(obj.id),
            "Object should exist in remote_object_manager")

        # Resume and hit next stop.
        self.debugger.handle('resume', {})
        self.wait_for_process_running()
        self.wait_for_process_stop()

        self.assertIsNone(
            self.debugger_store.remote_object_manager.get_object(obj.id),
            "Object should no longer exist in remote_object_manager")

    def test_debugger_pause_notification_returns_call_frames(self):
        lldb_debugger.GetSelectedTarget().BreakpointCreateByName('main')
        self.launch_debugging(stop_at_entry=False)

        self.wait_for_process_stop()
        scope = None
        for notification in self.chrome_channel.sent_notifications:
            print notification
            if notification['method'] != 'Debugger.paused':
                continue
            for frame in notification['params']['callFrames']:
                if frame['functionName'].startswith('main'):
                    object_id = frame['scopeChain'][0]['object']['objectId']
                    scope = self.debugger_store.remote_object_manager.get_object(object_id)
        self.assertIsNotNone(scope)
        self.assertEqual(
            list(sorted(x['name'] for x in scope.properties['result'])),
            ['argc', 'argv'])

if __name__ == '__main__':
    unittest.main()
