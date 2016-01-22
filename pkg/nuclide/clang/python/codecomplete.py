# Copyright (c) 2015-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the license found in the LICENSE file in
# the root directory of this source tree.

from clang.cindex import *

import logging
import re
from itertools import imap, islice


OPERATOR_OVERLOAD_RE = re.compile('^operator[^\w]')


logger = logging.getLogger(__name__)


class CompletionCache:

    def __init__(self, absolute_path, translation_unit):
        self._absolute_path = absolute_path
        self._translation_unit = translation_unit
        self.invalidate()

    def get_completions(self, line, column, prefix, contents=None, limit=None):
        results = self._lookup(line, column, prefix)
        if results is None:
            results = _get_completions(
                self._translation_unit,
                self._absolute_path,
                line,
                column,
                prefix,
                contents
            )
            self._update(line, column, prefix, results)
        return list(islice(results, limit))

    def invalidate(self):
        self._last_line = None
        self._last_column = None
        self._last_prefix = None
        self._last_result = None

    def _lookup(self, line, column, prefix):
        if (line == self._last_line and column == self._last_column and
            prefix.startswith(self._last_prefix)):
            if prefix == self._last_prefix:
                return self._last_result
            return (result for result in self._last_result
                    if result['spelling'].startswith(prefix))
        return None

    def _update(self, line, column, prefix, result):
        self._last_line = line
        self._last_column = column
        self._last_prefix = prefix
        self._last_result = result


def _get_completions(translation_unit, absolute_path, line, column, prefix, contents=None):
    unsaved_files = []
    if contents:
        contents_as_str = contents.encode('utf8')
        unsaved_files.append((absolute_path, contents_as_str))

    results = translation_unit.codeComplete(
        absolute_path, line, column, unsaved_files)
    if results is None:
        return []

    completions = []
    for result in results.results:
        completion_string = result.string
        # From Index.h: Smaller values indicate higher-priority (more likely)
        # completions.
        if completion_string.priority > 50:
            continue

        first_token = _getFirstNonResultTypeTokenChunk(completion_string)
        if not first_token or (prefix and not first_token.startswith(prefix)):
            continue

        completions.append(result)

    completions.sort(key=_resultPriority)
    return map(_processResult, completions)


# Strongly downrank destructors and operator overloads.
# Slightly downrank methods with a leading underscore (typically private).
def _resultPriority(result):
    priority = result.string.priority
    kind = _getKind(result)
    if kind == CursorKind.DESTRUCTOR:
        priority += 50
    elif kind == CursorKind.CXX_METHOD:
        first_chunk = _getFirstNonResultTypeTokenChunk(result.string)
        if first_chunk is not None:
            if first_chunk.startswith('_'):
                priority += 25
            elif OPERATOR_OVERLOAD_RE.match(first_chunk):
                priority += 100
    return priority


def _processResult(completion_result):
    chunks = []
    spelling = ''
    result_type = ''

    # We want to know which chunks are placeholders.
    completion_string = completion_result.string
    for chunk in completion_string:
        # A piece of text that describes something about the result but
        # should not be inserted into the buffer. (e.g. const modifier)
        if chunk.isKindInformative():
            continue

        # There should be at most one ResultType chunk and it should tell us
        # type of suggested expression. For example, if a method call is
        # suggested, this chunk will be equal to the method return type.
        # Obviously, we don't want that chunk in spelling.
        if chunk.isKindResultType():
            result_type = chunk.spelling
            continue

        spelling += chunk.spelling
        chunks.append({
            'spelling': chunk.spelling,
            'isPlaceHolder': chunk.isKindPlaceHolder(),
        })

    cursor_kind = _getKind(completion_result)
    if cursor_kind is None:
        kind_name = 'UNKNOWN'
    else:
        kind_name = cursor_kind.name

    return {
        'spelling': spelling,
        'chunks': chunks,
        'result_type': result_type,
        'first_token': _getFirstNonResultTypeTokenChunk(completion_string),
        'cursor_kind': kind_name,
    }


def _getFirstNonResultTypeTokenChunk(completion_string):
    for chunk in completion_string:
        if not chunk.isKindResultType():
            return chunk.spelling
    return None


# Some cursor kinds aren't known to libclang yet.
def _getKind(completion_result):
    try:
        return completion_result.kind
    except:
        return None
