# Copyright (c) 2015-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the license found in the LICENSE file in
# the root directory of this source tree.

import os
import subprocess
import unittest

from nuclide_server import NuclideServer
from nuclide_server_manager import NuclideServerManager

class NuclideServerTestBase(unittest.TestCase):

    def setUp(self):
        NuclideServer.script_path = \
            os.path.join(os.path.dirname(__file__), 'mock', NuclideServer.script_name)
        NuclideServerManager.version_file = \
            os.path.join(os.path.dirname(__file__), 'mock', 'version.json')
        self.cleanup()

    def tearDown(self):
        self.cleanup()

    def cleanup(self):
        NuclideServerManager.stop_all()
        # Delete the mock version file.
        if os.path.isfile(NuclideServerManager.version_file):
            os.remove(NuclideServerManager.version_file)
