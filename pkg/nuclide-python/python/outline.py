# Copyright (c) 2015-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the license found in the LICENSE file in
# the root directory of this source tree.

from _ast import AST
from ast import parse
import json
import sys

#
# Converts a python source from stdin to JSON formatted AST on stdout.
#


def ast_to_json(node):
    assert isinstance(node, AST)
    result = {}
    result['kind'] = node.__class__.__name__
    for attr in dir(node):
        if attr.startswith("_"):
            continue
        result[attr] = get_value(getattr(node, attr))

    return result


def get_value(value):
    if value is None:
        return value
    if isinstance(value, (int, basestring, float, long, complex, bool)):
        return value
    if isinstance(value, list):
        return [get_value(x) for x in value]
    if isinstance(value, AST):
        return ast_to_json(value)
    else:
        raise Exception(
            "unknown case for '%s' of type '%s'" % (value, type(value)))


if __name__ == '__main__':
    print json.dumps(ast_to_json(parse(sys.stdin.read())), indent=4)
