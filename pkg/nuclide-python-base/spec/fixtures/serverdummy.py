# Copyright (c) 2015-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the license found in the LICENSE file in
# the root directory of this source tree.

# Note: this file has intentionally invalid references to test autocompletion
import os
from decorated import Test


hello = os.path.isab
potato = 5
potato2 = po
potato3 = potato

a = Test()
a.t

test_parent_name = 'hello'


def test_fn():
    print(test_parent_name)
