# Copyright (c) 2015-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the license found in the LICENSE file in
# the root directory of this source tree.

import unittest
from .. import codecomplete


class MockCompletionResult:
    def __init__(self, typed_name, priority):
        self.typed_name = typed_name
        self.priority = priority

    def to_dict(self):
        return {'spelling': self.typed_name}


def mock_completion_results(results):
    class MockClangCompletion:
        def __init__(self):
            self.results = []
    mock_results = codecomplete.CompletionResults(MockClangCompletion())
    mock_results._results = results
    return mock_results


class CompletionResultsTestCase(unittest.TestCase):

    def test_empty_prefix(self):
        results = mock_completion_results([
            MockCompletionResult('a', 5),
            MockCompletionResult('b', 10),
            MockCompletionResult('c', 1),
        ])
        # Make sure we order by priority.
        self.assertEqual(
            results.getResults('', None),
            [{'spelling': 'c'}, {'spelling': 'a'}, {'spelling': 'b'}],
        )
        self.assertEqual(
            results.getResults('', 1),
            [{'spelling': 'c'}],
        )

    def test_prefix_matching(self):
        results = mock_completion_results([
            MockCompletionResult('aa', 5),
            MockCompletionResult('ab', 4),
            MockCompletionResult('b', 10),
            MockCompletionResult('B', 1),
            MockCompletionResult('~c', 1),
        ])
        self.assertEqual(
            results.getResults('a', None),
            [{'spelling': 'ab'}, {'spelling': 'aa'}],
        )
        self.assertEqual(
            results.getResults('aa', None),
            [{'spelling': 'aa'}],
        )
        self.assertEqual(
            results.getResults('B', None),
            [{'spelling': 'B'}, {'spelling': 'b'}],
        )
        self.assertEqual(
            results.getResults('~', None),
            [{'spelling': '~c'}],
        )
        self.assertEqual(
            results.getResults('~c', None),
            [{'spelling': '~c'}],
        )
        self.assertEqual(results.getResults(' ', None), [])
        self.assertEqual(results.getResults('c', None), [])
        self.assertEqual(results.getResults('d', None), [])
        self.assertEqual(results.getResults('bb', None), [])


class CompletionCacheTestCase(unittest.TestCase):

    def test_cache(self):
        self.call_count = 0

        def mock_get_completions(*args):
            self.call_count += 1
            return mock_completion_results([
                MockCompletionResult('f', 1),
                MockCompletionResult('g', 1),
            ])
        codecomplete._get_completions = mock_get_completions

        cache = codecomplete.CompletionCache('test.cpp', {}, {})
        self.assertEqual(cache.get_completions(1, 1, ''), [
            {'spelling': 'f'},
            {'spelling': 'g'},
        ])
        self.assertEqual(self.call_count, 1)

        # Querying the same location should hit the cache.
        self.assertEqual(cache.get_completions(1, 1, ''), [
            {'spelling': 'f'},
            {'spelling': 'g'},
        ])
        self.assertEqual(cache.get_completions(1, 1, 'f'), [
            {'spelling': 'f'},
        ])
        self.assertEqual(cache.get_completions(1, 1, 'g'), [
            {'spelling': 'g'},
        ])
        self.assertEqual(self.call_count, 1)

        # Invalidating the cache should trigger a new fetch.
        cache.invalidate()
        self.assertEqual(cache.get_completions(1, 1, 'f'), [
            {'spelling': 'f'},
        ])
        self.assertEqual(self.call_count, 2)

        # Or changing the location.
        self.assertEqual(cache.get_completions(2, 1, 'f'), [
            {'spelling': 'f'},
        ])
        self.assertEqual(self.call_count, 3)

        self.assertEqual(cache.get_completions(2, 2, 'f'), [
            {'spelling': 'f'},
        ])
        self.assertEqual(self.call_count, 4)
