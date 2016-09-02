# Copyright (c) 2015-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the license found in the LICENSE file in
# the root directory of this source tree.


def local_references(translation_unit, path, line, column):
    return {
        'cursor_name': '',
        'cursor_kind': '',
        'references': [],
    }
