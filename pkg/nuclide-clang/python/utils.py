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
    realpath = os.path.realpath(file.name)
    # If the file itself is a symlink, always resolve it.
    # Otherwise, do not resolve '/mnt' paths, since Nuclide can't open them remotely.
    # TODO(hansonw): this is a hack! Remove when we support arbitrary filesystem paths.
    if os.path.islink(file.name) or not realpath.startswith('/mnt'):
        return realpath
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
