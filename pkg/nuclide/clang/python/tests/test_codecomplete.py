# Copyright (c) 2015-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the license found in the LICENSE file in
# the root directory of this source tree.

import unittest
import codecomplete


class CompletionCacheTestCase(unittest.TestCase):

    def runTest(self):
        self.call_count = 0
        def mock_get_completions(translation_unit, absolute_path, line, column, prefix, contents=None):
            self.call_count += 1
            return filter(
                lambda x: x['spelling'].startswith(prefix),
                [{'spelling': 'f'}, {'spelling': 'g'}],
            )
        codecomplete._get_completions = mock_get_completions

        cache = codecomplete.CompletionCache('test.cpp', {})
        self.assertEqual(cache.get_completions(1, 1, ''), [
            {'spelling': 'f'},
            {'spelling': 'g'},
        ])
        self.assertEqual(self.call_count, 1)

        # Same location, longer prefix = cache hit.
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

        # Or using a shorter prefix.
        self.assertEqual(cache.get_completions(2, 2, ''), [
            {'spelling': 'f'},
            {'spelling': 'g'},
        ])
        self.assertEqual(self.call_count, 5)
