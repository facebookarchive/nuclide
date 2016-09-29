# Copyright (c) 2015-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the license found in the LICENSE file in
# the root directory of this source tree.

from __future__ import print_function

import logging
from clang.cindex import Cursor, CursorKind, SourceRange
from ctypes import c_void_p, c_int, CFUNCTYPE
from utils import range_dict_relative, CXCursorAndRangeVisitor


logger = logging.getLogger('references')


def local_references(libclang, translation_unit, path, line, column):
    source_location = translation_unit.get_location(path, (line, column))
    cursor = Cursor.from_location(translation_unit, source_location)
    if cursor is None:
        return None
    if cursor.referenced is not None:
        cursor = cursor.referenced
    if cursor.kind == CursorKind.NO_DECL_FOUND:
        return None

    references = []

    def visitor(_context, cursor, source_range):
        references.append(range_dict_relative(source_range))
        return 1  # continue

    visitor_obj = CXCursorAndRangeVisitor()
    visitor_obj.visit = CFUNCTYPE(c_int, c_void_p, Cursor, SourceRange)(visitor)
    libclang.clang_findReferencesInFile(cursor, source_location.file, visitor_obj)
    return {
        'cursor_name': cursor.spelling,
        'cursor_kind': cursor.kind.name,
        'references': references,
    }
