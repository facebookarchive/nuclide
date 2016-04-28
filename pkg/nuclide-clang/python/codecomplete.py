# Copyright (c) 2015-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the license found in the LICENSE file in
# the root directory of this source tree.

from clang import cindex

import heapq
import logging
import re
import time
from itertools import imap, islice


OPERATOR_OVERLOAD_RE = re.compile('^operator[^\w]')

# Cache values for speed.
CURSOR_KIND_DESTRUCTOR = cindex.CursorKind.DESTRUCTOR.value
CURSOR_KIND_CXX_METHOD = cindex.CursorKind.CXX_METHOD.value
CURSOR_KIND_MACRO = cindex.CursorKind.MACRO_DEFINITION.value


logger = logging.getLogger(__name__)


# Wraps cindex.CodeCompletionResult
class CompletionResult:

    def __init__(self, completion_result):
        self._result = completion_result
        self._priority = None
        self._typed_name = None

    @property
    def priority(self):
        """
        Clang's ranking isn't very good. We downrank the following:
        - Operator overloads
        - Destructors
        - Macros
        - Methods prefixed underscores
        """
        if self._priority is not None:
            return self._priority

        priority = self._result.string.priority
        kind = self._result.cursorKind
        if kind == CURSOR_KIND_DESTRUCTOR:
            priority += 50
        elif kind == CURSOR_KIND_MACRO:
            priority += 25
        elif kind == CURSOR_KIND_CXX_METHOD:
            typed_name = self.typed_name
            if typed_name.startswith('_'):
                priority += 25
            elif OPERATOR_OVERLOAD_RE.match(typed_name):
                priority += 100
        self._priority = priority
        return priority

    @property
    def typed_name(self):
        """
        A completion results contains exactly one TypedText chunk, representing
        what autocompletion input should be matched against.
        """
        if self._typed_name is not None:
            return self._typed_name

        self._typed_name = ''
        for chunk in self._result.string:
            if chunk.isKindTypedText():
                self._typed_name = chunk.spelling
                break
        return self._typed_name

    @property
    def kind(self):
        try:
            return self._result.kind.name
        except:
            # Function argument completions return a special cursor kind:
            #   CXCursor_OverloadCandidate = 700
            # This isn't declared in the LLVM Python bindings (yet).
            # TODO(hansonw): remove when this is upstreamed
            if self._result.cursorKind == 700:
                return 'OVERLOAD_CANDIDATE'
            return 'UNKNOWN'

    def to_dict(self):
        chunks = []
        spelling = ''
        result_type = ''

        # We want to know which chunks are placeholders.
        completion_string = self._result.string
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
                'isPlaceHolder':
                    chunk.isKindPlaceHolder() or chunk.kind.name == 'CurrentParameter',
                'kind': str(chunk.kind),
            })

        briefComment = completion_string.briefComment
        return {
            'spelling': spelling,
            'chunks': chunks,
            'result_type': result_type,
            'cursor_kind': self.kind,
            'brief_comment': briefComment and briefComment.spelling,
        }


# Wraps cindex.CodeCompletionResults
class CompletionResults:

    def __init__(self, completion):
        # Keep reference to original results object alive.
        self._completion = completion
        self._results = map(CompletionResult, list(completion.results))

    def getResults(self, prefix, limit):
        if prefix == '':
            matches = self._results
        else:
            matches = [x for x in self._results if x.typed_name.startswith(prefix)]

        return [x.to_dict() for x in heapq.nsmallest(
            limit or len(matches), matches, key=lambda x: x.priority)]


class CompletionCache:

    def __init__(self, absolute_path, translation_unit, clang_lib):
        self._absolute_path = absolute_path
        self._translation_unit = translation_unit
        self._clang_lib = clang_lib
        self.invalidate()

    def get_completions(self, line, column, prefix, contents=None, limit=None):
        completions = self._lookup(line, column)
        if completions is None:
            completions = _get_completions(
                self._translation_unit,
                self._absolute_path,
                line,
                column,
                contents
            )
            self._update(line, column, completions)
        # completions may still be None if there was a clang parsing error.
        if completions is None:
            return []
        return completions.getResults(prefix, limit)

    def invalidate(self):
        self._last_line = None
        self._last_column = None
        self._completions = None

    def _lookup(self, line, column):
        if line == self._last_line and column == self._last_column:
            return self._completions
        return None

    def _update(self, line, column, completions):
        self._last_line = line
        self._last_column = column
        self._completions = completions


def _get_completions(
    translation_unit,
    absolute_path,
    line,
    column,
    contents=None,
):
    unsaved_files = []
    if contents:
        contents_as_str = contents.encode('utf8')
        unsaved_files.append((absolute_path, contents_as_str))

    start_time = time.time()
    completion = translation_unit.codeComplete(
        absolute_path, line, column, unsaved_files,
        include_macros=True, include_brief_comments=True)
    if completion is None:
        return None
    logger.info(
        'codeComplete returned %d completions in %.3lf secs',
        len(completion.results),
        time.time() - start_time,
    )

    wrapper = CompletionResults(completion)
    return wrapper
