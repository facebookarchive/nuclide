# Copyright (c) 2015-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the license found in the LICENSE file in
# the root directory of this source tree.

import codecs
import collections
import json
import sys

class ChainedError(Exception):
    def __init__(self, message, cause):
        super(ChainedError, self).__init__(message + ', caused by ' + repr(cause))
        self.cause = cause


def json_dump(obj, path):
    with open(path, 'w') as f:
        # Separators must be specified to avoid trailing whitespace.
        # Python is dumb: http://bugs.python.org/issue16333.
        json.dump(obj, f, indent=2, separators=(',', ': '), sort_keys=True)

        # Make sure all files we write out end with a trailing newline.
        f.write('\n')


def json_load(path):
    try:
        # We use codecs here because sometimes Python decides to use the ascii
        # codec and chokes on utf-8 characters. This has bitten us in the past.
        with codecs.open(path, 'r', 'utf-8') as f:
            if sys.version_info >= (2, 7):
                # object_pairs_hook=... preserves member order iteration in the resulting objects
                # Member order is used by package linting
                #
                # However, this is Python 2.7 only, so we conditionally enable it
                return json.load(f, object_pairs_hook=collections.OrderedDict)
            else:
                return json.load(f)

    except ValueError as e:
        raise ChainedError('Error loading JSON from file: %s' % path, e)


def json_loads(str):
    return json.loads(str)
