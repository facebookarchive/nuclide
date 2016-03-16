# Copyright (c) 2015-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the license found in the LICENSE file in
# the root directory of this source tree.

import shutil
import tempfile
import subprocess
import os


class TestExecutable(object):
    """Manages compilation and cleanup of a test executable target for lldb."""
    def __init__(self, source_contents, extension, extra_flags=[]):
        self._temp_dir = tempfile.mkdtemp()
        self._executable_path = os.path.join(self._temp_dir, 'process.out')
        self._source_path = os.path.join(self._temp_dir, 'process' + extension)
        with open(self._source_path, 'w') as file:
            file.write(source_contents)
        subprocess.check_call([
            'clang', '-g', self._source_path,
            '-o', self._executable_path
        ] + extra_flags)

    def clean_up(self):
        shutil.rmtree(self._temp_dir)

    @property
    def source_path(self):
        return self._source_path

    @property
    def executable_path(self):
        return self._executable_path
