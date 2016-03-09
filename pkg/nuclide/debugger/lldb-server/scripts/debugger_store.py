# Copyright (c) 2015-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the license found in the LICENSE file in
# the root directory of this source tree.

from file_manager import FileManager
import serialize
from remote_objects import RemoteObjectManager
from modules import ModuleSourcePathUpdater
from thread_manager import ThreadManager


class DebuggerStore:
    '''Provides a central place for all debugger related managers.
    '''
    def __init__(self, channel, debugger, is_attach, basepath='.'):
        '''
        channel: channel to send client chrome notification message.
        debugger: lldb SBDebugger object.
        '''

        self._channel = channel
        self._debugger = debugger
        self._is_attach = is_attach
        self._file_manager = FileManager(channel)
        self._remote_object_manager = RemoteObjectManager()
        self._location_serializer = serialize.LocationSerializer(
            self._file_manager, basepath)
        self._module_source_path_updater = ModuleSourcePathUpdater(
            self._debugger.GetSelectedTarget(), self._file_manager, basepath)
        self._thread_manager = ThreadManager(self)

    @property
    def channel(self):
        return self._channel

    @property
    def debugger(self):
        return self._debugger;

    @property
    def is_attach(self):
        return self._is_attach

    @property
    def thread_manager(self):
        return self._thread_manager

    @property
    def file_manager(self):
        return self._file_manager

    @property
    def remote_object_manager(self):
        return self._remote_object_manager

    @property
    def location_serializer(self):
        return self._location_serializer

    @property
    def module_source_path_updater(self):
        return self._module_source_path_updater
