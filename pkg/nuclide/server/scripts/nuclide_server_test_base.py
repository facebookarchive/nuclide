# Copyright (c) 2015-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the license found in the LICENSE file in
# the root directory of this source tree.

import os
import subprocess
import unittest

from nuclide_server_manager import NuclideServerManager

class NuclideServerTestBase(unittest.TestCase):

    def setUp(self):
        self.cleanup()

    def tearDown(self):
        self.cleanup()

    def cleanup(self):
        NuclideServerManager.stop_all()
