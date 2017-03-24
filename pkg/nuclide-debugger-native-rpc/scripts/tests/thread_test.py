# Copyright (c) 2015-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the license found in the LICENSE file in
# the root directory of this source tree.

from ..find_lldb import lldb
from ..thread_manager import ThreadManager
from ..debugger_store import DebuggerStore
from mock_chrome_channel import MockChromeChannel
from test_executable import TestExecutable
import os
import shutil
import subprocess
import sys
import tempfile
import unittest


class ThreadTestCase(unittest.TestCase):

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

        self.chrome_channel = MockChromeChannel()
        self.ipc_channel = MockIpcChannel()
        debugger_store = DebuggerStore(
            self.lldb_debugger,
            self.chrome_channel,
            self.ipc_channel,
            is_attach=False)
        self.thread_manager = ThreadManager(debugger_store)

    def tearDown(self):
        lldb.SBDebugger.Destroy(self.lldb_debugger)

    def test_update_thread_list(self):
        self.lldb_debugger.SetAsync(False)
        self.lldb_debugger.GetTargetAtIndex(0).BreakpointCreateByName('main')
        self.lldb_debugger.GetSelectedTarget().LaunchSimple(None, None, os.getcwd())
        self._debugger_store.thread_manager.update_thread_switch_message(process)
        self._debugger_store.thread_manager.send_threads_updated(process)
        for notification in self.chrome_channel.sent_notifications:
            if notification['method'] == 'Debugger.threadsUpdated':
                self.assertEquals(len(notification['params']['threads']), 1)
                thread = notification['params']['threads'][0]
                self.assertEquals(thread['stop_reason'], 3)
                self.assertEquals(thread['location']['lineNumber'], 11)
                self.assertEquals('process.c' in thread['location']['scriptId'], True)
                break

    def test_get_thread_stack(self):
        self.lldb_debugger.SetAsync(False)
        self.lldb_debugger.GetTargetAtIndex(0).BreakpointCreateByName('main')
        self.lldb_debugger.GetSelectedTarget().LaunchSimple(None, None, os.getcwd())
        current_thread = self.lldb_debugger.GetSelectedTarget().process.GetSelectedThread()
        thread_stack = self.thread_manager.get_thread_stack(current_thread)
        current_frame = thread_stack[0]
        self.assertEquals(current_frame['callFrameId'], '1.0')
        self.assertEquals('main' in current_frame['functionName'], True)
        self.assertEquals('process.c' in current_frame['location']['scriptId'], True)
