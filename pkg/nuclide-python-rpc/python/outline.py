# Copyright (c) 2015-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the license found in the LICENSE file in
# the root directory of this source tree.

import jedi
from parso.python.tree import ImportFrom


def serialize_names(names):
    return list(filter(None, [serialize_name(n) for n in names]))


def serialize_name(name):
    result = {}

    if name.type == 'class' or name.type == 'function':
        result['name'] = name.name
        try:
            result['params'] = [p.name for p in name.params]
        except AttributeError:
            # Properties don't have params.
            result['params'] = []
        result['children'] = (
            serialize_names(name.defined_names())
            if name.type == 'class' else [])
    elif name.type == 'statement':
        # Don't include underscore assignments in outline.
        if name.name == '_':
            return None
        result['name'] = name.name
    else:
        return None

    definition = name._name.tree_name.get_definition()
    # Do not include imported definitions.
    if isinstance(definition, ImportFrom):
        return None

    (start_line, start_column) = definition.start_pos
    (end_line, end_column) = definition.end_pos

    result['start'] = {
        'line': start_line,
        'column': start_column,
    }

    result['end'] = {
        'line': end_line,
        'column': end_column,
    }

    result['kind'] = name.type

    return result


def get_outline(src, contents):
    names = jedi.api.names(source=contents, path=src)
    # Only iterate through top-level definitions.
    names = filter(lambda name: name.parent().type == 'module', names)
    return serialize_names(names)
