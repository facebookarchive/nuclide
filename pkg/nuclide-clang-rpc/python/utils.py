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


# Compilation flags often contain symlinks.
# Nuclide can't open these remotely, so resolve them to the real path.
def resolve_file(file):
    if file is None:
        return None
    return resolve_file_name(file.name)


def resolve_file_name(file_name):
    if os.path.islink(file_name):
        return os.path.realpath(file_name)
    return file_name


# Converts a Clang `SourceLocation` into a dict.
def location_dict_relative(location):
    return {
        'line': location.line - 1,
        'column': location.column - 1,
    }


def location_dict(location):
    res = location_dict_relative(location)
    res['file'] = resolve_file(location.file)
    return res


# Converts a Clang `SourceRange` into a dict.
def range_dict_relative(source_range):
    # Clang indexes for line and column are 1-based.
    return {
        'start': location_dict_relative(source_range.start),
        'end': location_dict_relative(source_range.end),
    }


def range_dict(source_range):
    res = range_dict_relative(source_range)
    res['file'] = resolve_file(source_range.start.file)
    return res
