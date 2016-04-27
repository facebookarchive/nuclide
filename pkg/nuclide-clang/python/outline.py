#!/usr/bin/env python

# Copyright (c) 2015-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the license found in the LICENSE file in
# the root directory of this source tree.

from __future__ import print_function

from clang.cindex import Config, CursorKind, Index
from utils import range_dict_relative

import json
import os
import sys

# Function/method cursor kinds.
FUNCTION_KINDS = set([
    'FUNCTION_DECL',
    'FUNCTION_TEMPLATE',
    'CXX_METHOD',
    'CONSTRUCTOR',
    'DESTRUCTOR',
    'OBJC_INSTANCE_METHOD_DECL',
    'OBJC_CLASS_METHOD_DECL',
])

# Class-like cursors.
CLASS_KINDS = set([
    'STRUCT_DECL',
    'UNION_DECL',
    'CLASS_DECL',
    'ENUM_DECL',
    'OBJC_INTERFACE_DECL',
    'OBJC_CATEGORY_DECL',
    'OBJC_PROTOCOL_DECL',
    'OBJC_IMPLEMENTATION_DECL',
    'OBJC_CATEGORY_IMPL_DECL',
    'CLASS_TEMPLATE',
    'CLASS_TEMPLATE_PARTIAL_SPECIALIZATION',
    'NAMESPACE',
])

# (Possibly external) members of CLASS_KINDS.
MEMBER_KINDS = set([
    'CXX_METHOD',
    'CONSTRUCTOR',
    'DESTRUCTOR',
    'FIELD_DECL',
    'VAR_DECL',
    'ENUM_CONSTANT_DECL',
])

# Variables and fields.
VAR_KINDS = set([
    'OBJC_IVAR_DECL',
    'FIELD_DECL',
    'VAR_DECL',
])

# Record any of the cursor types listed above.
ALL_KINDS = FUNCTION_KINDS | CLASS_KINDS | MEMBER_KINDS | VAR_KINDS


def visit_cursor(path, cursor):
    # Skip symbols from other files.
    if cursor.location.file is None or cursor.location.file.name != path:
        return None

    kind = cursor.kind.name
    if kind not in ALL_KINDS:
        return None

    # Names of function parameters.
    params = None
    # Names of template parameters.
    tparams = None
    children = None
    name = cursor.spelling
    # Display types for variables and typedefs.
    cursor_type = cursor.type.spelling if kind in VAR_KINDS else None
    if kind in FUNCTION_KINDS:
        # We can't use displayname as it also includes the arguments.
        params = []
        tparams = []
        for child in cursor.get_children():
            if child.kind == CursorKind.PARM_DECL:
                # Use the param name, but fall back to the raw type if unnamed.
                params.append(child.spelling or child.type.spelling)
            elif child.kind == CursorKind.TEMPLATE_TYPE_PARAMETER:
                tparams.append(child.spelling)
            # TODO(hansonw): non-type and "template template" params?

    if kind in MEMBER_KINDS:
        # Name should be fully qualified if outside the parent.
        if cursor.semantic_parent != cursor.lexical_parent:
            name = cursor.semantic_parent.spelling + '::' + name
    elif kind in CLASS_KINDS:
        # Include template information.
        name = cursor.displayname
        children = []
        for child in cursor.get_children():
            child_outline = visit_cursor(path, child)
            if child_outline is not None:
                children.append(child_outline)

    ret = {
        'name': name,
        'cursor_kind': kind,
        'cursor_type': cursor_type,
        'extent': range_dict_relative(cursor.extent),
        'params': params,
        'tparams': tparams,
        'children': children,
    }
    return {k: v for k, v in ret.items() if v is not None}


def get_outline(translation_unit, path):
    result = []
    root_cursor = translation_unit.cursor
    for child in root_cursor.get_children():
        child_outline = visit_cursor(path, child)
        if child_outline is not None:
            result.append(child_outline)
    return result
