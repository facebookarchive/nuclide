#!/usr/bin/env python

# Copyright (c) 2015-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the license found in the LICENSE file in
# the root directory of this source tree.

import unittest

import utils
from package_manager import PackageManager, NUCLIDE_PATH


class PackageManagerTest(unittest.TestCase):

    def test_get_eslintable_files(self):
        actual = PackageManager().get_eslintable_files()
        actual.sort()
        expected = utils.check_output([
            'node', '-p',
            '''
            require("eslint/lib/util/glob-util")
                .listFilesToProcess(["**/*.js"])
                .map(f => f.filename)
                .join("\\n")
            '''
        ], cwd=NUCLIDE_PATH).strip().split('\n')
        expected.sort()
        self.assertEqual(actual, expected)


if __name__ == '__main__':
    unittest.TextTestRunner(verbosity=2).run(
        unittest.TestLoader().loadTestsFromTestCase(PackageManagerTest)
    )
