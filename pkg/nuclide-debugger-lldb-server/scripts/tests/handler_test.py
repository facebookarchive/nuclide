# Copyright (c) 2015-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the license found in the LICENSE file in
# the root directory of this source tree.

from ..handler import *
import os
import sys
import unittest

class TestDomain(HandlerDomain):
    """
    Domain that already has a name defined for convenience.
    """
    @property
    def name(self):
        return 'Test'

class HandlerDomainSetTestCase(unittest.TestCase):

    def setUp(self):
        self.set = HandlerDomainSet()

    def test_duplicate_domain_name(self):
        domain_args = {
            'debugger_store': None,
        }
        with self.assertRaises(AssertionError):
            self.set.register_domains([
                TestDomain(**domain_args),
                TestDomain(**domain_args),
            ])

    def test_no_domain(self):
        with self.assertRaises(UndefinedDomainError):
            self.set.handle('Test.working', {})

    def test_no_handler(self):
        self.set.register_domains([TestDomain(None)])
        with self.assertRaises(UndefinedHandlerError):
            self.set.handle('Test.notThere', {})

    def test_bad_methods(self):
        with self.assertRaises(HandlerParseError):
            self.set.handle('Test', {})
        with self.assertRaises(HandlerParseError):
            self.set.handle('Test.too.many', {})

class HandlerDomainTestCase(unittest.TestCase):

    def test_handler(self):
        class WorkingDomain(TestDomain):
            @handler()
            def working(self, params):
                return {'ok': True}

        set = HandlerDomainSet(WorkingDomain(debugger_store=None))
        self.assertEquals(set.handle('Test.working', {}), {'ok': True})
