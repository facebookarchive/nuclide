# Copyright (c) 2015-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the license found in the LICENSE file in
# the root directory of this source tree.

import os


HEADER_EXTENSIONS = ['.h', '.hh', '.hpp', '.hxx', '.h++']
def is_header_file(src):
    _, ext = os.path.splitext(src)
    return ext in HEADER_EXTENSIONS


def resolve_file(file):
    if file is None:
        return None
    return file.name


# Converts a Clang `SourceRange` into a dict.
def range_dict(source_range):
    # Clang indexes for line and column are 1-based.
    return {
        'file': resolve_file(source_range.start.file),
        'start': {
            'line': source_range.start.line - 1,
            'column': source_range.start.column - 1,
        },
        'end': {
            'line': source_range.end.line - 1,
            'column': source_range.end.column - 1,
        }
    }


# Converts a Clang `SourceLocation` into a dict.
def location_dict(location):
    return {
        'file': resolve_file(location.file),
        'line': location.line - 1,
        'column': location.column - 1,
    }
