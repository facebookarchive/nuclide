# Copyright (c) 2015-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the license found in the LICENSE file in
# the root directory of this source tree.

from ..find_lldb import lldb

from ..debugger import DebuggerDomain, CALL_STACK_OBJECT_GROUP
from ..file_manager import FileManager
from ..remote_objects import RemoteObjectManager, RemoteObject
from mock_server import MockServer
from mock_remote_objects import MockRemoteObject
from test_executable import TestExecutable
import os
import shutil
import subprocess
import sys
import tempfile
import unittest


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

    def setUp(self):
        self.lldb_debugger = lldb.SBDebugger.Create()
        self.lldb_debugger.CreateTargetWithFileAndArch(
            self.__class__.test_executable.executable_path,
            lldb.LLDB_ARCH_DEFAULT)

        self.server = MockServer()
        file_manager = FileManager(self.server)
        self.remote_object_manager = RemoteObjectManager()
        self.debugger = DebuggerDomain(None, file_manager,
                                       self.remote_object_manager,
                                       debugger=self.lldb_debugger,
                                       socket=self.server)

    def tearDown(self):
        lldb.SBDebugger.Destroy(self.lldb_debugger)

    def assertIsPaused(self):
        self.assertTrue(self.lldb_debugger.GetSelectedTarget().process.is_stopped)

    def test_breakpoint_at_line(self):
        self.lldb_debugger.SetAsync(False)

        self.lldb_debugger.GetTargetAtIndex(0).BreakpointCreateByName('main')

        process = self.lldb_debugger.GetSelectedTarget().LaunchSimple(None, None, os.getcwd())
        self.debugger.handle('enable', {})
        self.debugger.handle('setBreakpointByUrl', {
            'lineNumber': 13,
            'url': 'file://' + self.__class__.test_executable.source_path
        })

        process.Continue()

        self.assertIsPaused()

        frame = self.lldb_debugger.GetSelectedTarget().process.GetSelectedThread().frame[0]
        self.assertEquals(frame.name, 'main')
        self.assertEquals(frame.line_entry.line, 14)

        sent_breakpoint_notification = False
        for notification in self.server.sent_notifications:
            if notification['method'] == 'Debugger.breakpointResolved':
                sent_breakpoint_notification = True
                break

        self.assertTrue(sent_breakpoint_notification)

    def test_turn_off_breakpoints(self):
        self.test_breakpoint_at_line()
        self.debugger.handle('setBreakpointsActive', {'active': False})
        had_breakpoint = False
        for bp in self.lldb_debugger.GetSelectedTarget().breakpoint_iter():
            self.assertFalse(bp.enabled)
            had_breakpoint = True
        self.assertTrue(had_breakpoint)

    def test_toggle_breakpoints(self):
        self.test_turn_off_breakpoints()
        self.debugger.handle('setBreakpointsActive', {'active': True})
        had_breakpoint = False
        for bp in self.lldb_debugger.GetSelectedTarget().breakpoint_iter():
            self.assertTrue(bp.enabled)
            had_breakpoint = True
        self.assertTrue(had_breakpoint)

    def test_resume(self):
        self.test_breakpoint_at_line()
        self.debugger.handle('resume', {})
        # Continue through to the end of the program.
        # Because LLDB is not in Async mode, the debugger will block until
        # the process finishes.
        self.assertFalse(self.lldb_debugger.GetSelectedTarget().process.is_alive)

    def test_pause(self):
        self.lldb_debugger.SetAsync(True)
        self.lldb_debugger.GetSelectedTarget().LaunchSimple(None, None, os.getcwd())
        self.debugger.handle('pause', {})
        self.assertTrue(self.lldb_debugger.GetSelectedTarget().process.is_alive)
        self.assertTrue(self.lldb_debugger.GetSelectedTarget().process.is_stopped)

    def test_stepping(self):
        # Use test_breakpoint_at_line to stop at line 14, the entry to test_function().
        self.test_breakpoint_at_line()

        self.debugger.handle('stepInto', {})
        frame = self.lldb_debugger.GetSelectedTarget().process.GetSelectedThread().frame[0]
        self.assertEquals(frame.name, 'test_function')
        self.assertEquals(frame.line_entry.line, 7)

        self.debugger.handle('stepOut', {})
        frame = self.lldb_debugger.GetSelectedTarget().process.GetSelectedThread().frame[0]
        self.assertEquals(frame.name, 'main')
        self.assertEquals(frame.line_entry.line, 14)

        self.debugger.handle('stepOver', {})
        frame = self.lldb_debugger.GetSelectedTarget().process.GetSelectedThread().frame[0]
        self.assertEquals(frame.name, 'main')
        self.assertEquals(frame.line_entry.line, 16)

    def test_reset_callstack_object_group_on_stop(self):
        self.lldb_debugger.SetAsync(False)
        self.lldb_debugger.GetSelectedTarget().LaunchSimple(None, None, os.getcwd())
        obj = self.remote_object_manager.add_object(
            MockRemoteObject(),
            CALL_STACK_OBJECT_GROUP)
        self.assertIsNotNone(
            self.remote_object_manager.get_object(obj.id),
            "Object should exist in remote_object_manager")
        self.debugger.handle('enable', {})
        self.assertIsNone(
            self.remote_object_manager.get_object(obj.id),
            "Object should no longer exist in remote_object_manager")

    def test_debugger_pause_notification_returns_call_frames(self):
        self.lldb_debugger.SetAsync(False)
        self.lldb_debugger.GetTargetAtIndex(0).BreakpointCreateByName('main')
        self.lldb_debugger.GetSelectedTarget().LaunchSimple(None, None, os.getcwd())
        self.debugger.handle('enable', {})

        scope = None
        for notification in self.server.sent_notifications:
            if notification['method'] != 'Debugger.paused':
                continue
            for frame in notification['params']['callFrames']:
                if frame['functionName'].startswith('main'):
                    object_id = frame['scopeChain'][0]['object']['objectId']
                    scope = self.remote_object_manager.get_object(object_id)
        self.assertIsNotNone(scope)
        self.assertEqual(
            list(sorted(x['name'] for x in scope.properties['result'])),
            ['argc', 'argv'])
