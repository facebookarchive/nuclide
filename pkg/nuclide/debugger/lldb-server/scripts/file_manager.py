# Copyright (c) 2015-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the license found in the LICENSE file in
# the root directory of this source tree.

"""Handles sending files and file-like entities to the client.

The client expects a `Debugger.scriptParsed` message for each file. The client
may then request the file contents using `Debugger.getScriptSource`.

The server may send down virtual "files" which are not real files on disk, such
as assembly code of functions.
"""

import abc
import os.path
import urllib
import urlparse


class FileManager:
    def __init__(self, socket):
        """Initialize a File Manager for a given connection.

        Args:
            socket (DebuggerWebSocket): socket to send file notifications
        """
        self.socket = socket
        self.registered_files = {}
        self.files_by_client_url = {}

    def register_filelike(self, filelike):
        """Registers a FileLike instance.

        Args:
            filelike (FileLike): a FileLike instance.

        Returns:
            FileLike: an interned instance representing the same object.
        """
        assert isinstance(filelike, FileLike)
        if filelike.script_id not in self.registered_files:
            self.registered_files[filelike.script_id] = filelike
            self.files_by_client_url[filelike.client_url] = filelike
            self.socket.send_notification('Debugger.scriptParsed', {
                'scriptId': filelike.script_id,
                'url': filelike.client_url,
                'startLine': 0,
                'startColumn': 0,
                'endLine': 0,
                'endColumn': 0,
            })
        return self.registered_files[filelike.script_id]

    def get_by_script_id(self, script_id):
        return self.registered_files.get(script_id, None)

    def get_by_client_url(self, client_url):
        return self.files_by_client_url.get(client_url, None)


class FileLike:
    __metaclass__ = abc.ABCMeta

    @abc.abstractproperty
    def script_id(self):
        """Client-side (internal) identifier for this file.

        Also used by the server as a unique identifier for disambiguation
        """
        raise NotImplementedError()

    @abc.abstractproperty
    def script_source(self):
        """Source code as a string."""
        raise NotImplementedError()

    @abc.abstractproperty
    def client_url(self):
        """Client-side URL representation of this file."""
        raise NotImplementedError()

    @abc.abstractproperty
    def server_obj(self):
        """Underlying server representation fo this file."""
        raise NotImplementedError()


class FunctionAssembly(FileLike):
    def __init__(self, target, sbsymbol):
        self._target = target
        self.symbol = sbsymbol

    @property
    def script_id(self):
        return '<ASM:' + hex(self.symbol.addr.GetLoadAddress(self._target)) + '>'

    @property
    def script_source(self):
        return '\n'.join([
            str(inst)
            for inst in self.symbol.instructions
        ])

    @property
    def client_url(self):
        # Not using urlparse here as it does not handle unknown schemes well.
        return 'lldb://asm/' + urllib.quote(self.symbol.name)

    @property
    def server_obj(self):
        return self.symbol

    def get_line_for_pc(self, pc):
        """Get the instruction line of the current program counter."""
        line_number = 0
        for inst in self.symbol.GetInstructions(self._target):
            # Get the smallest addr not greater than the program counter.
            if inst.GetAddress().GetLoadAddress(self._target) >= pc.GetLoadAddress(self._target):
                return line_number
            else:
                line_number += 1
        return line_number


class File(FileLike):
    """Representation of actual source files.

    As the client works best with absolute paths, and the files on the server
    may be relativized with respect to a base dir, we maintain a lookup to map
    between the two.
    """
    def __init__(self, sbfilespec, abspath):
        """Initializes a File.

        Args:
            sbfilespec (SBFileSpec): lldb.SBFileSpec object representation.
            abspath (str): Absolute path to the file.
        """
        self._filespec = sbfilespec
        self._abspath = abspath

    @property
    def script_id(self):
        return '<FILE:' + self._abspath + '>'

    @property
    def script_source(self):
        with open(self._abspath, 'r') as f:
            return f.read()

    @property
    def client_url(self):
        return urlparse.urljoin('file://', self._abspath)

    @property
    def server_obj(self):
        return self._filespec

    @staticmethod
    def from_filespec(sbfilespec, basepath='.'):
        abspath = os.path.normpath(os.path.join(basepath, sbfilespec.fullpath))
        return File(sbfilespec, abspath)


__all__ = [
    File,
    FileManager,
    FunctionAssembly,
]
