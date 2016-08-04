# Copyright (c) 2015-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the license found in the LICENSE file in
# the root directory of this source tree.

from ..remote_objects import RemoteObjectManager, RemoteObject
from mock_remote_objects import MockRemoteObject
import unittest


class RemoteObjectManagerTestCase(unittest.TestCase):
    def setUp(self):
        self.remote_object_manager = RemoteObjectManager()

    def test_can_add_and_retrieve_object(self):
        obj = self.remote_object_manager.add_object(MockRemoteObject())
        self.assertIsInstance(obj, RemoteObject)
        self.assertIs(self.remote_object_manager.get_object(obj.id), obj)

    def test_can_release_object_group(self):
        obj_test_1 = self.remote_object_manager.add_object(MockRemoteObject(), 'test')
        obj_test_2 = self.remote_object_manager.add_object(MockRemoteObject(), 'test')
        obj_not_test = self.remote_object_manager.add_object(MockRemoteObject(), 'not_test')
        self.assertIs(self.remote_object_manager.get_object(obj_test_1.id), obj_test_1)
        self.assertIs(self.remote_object_manager.get_object(obj_test_2.id), obj_test_2)
        self.assertIs(self.remote_object_manager.get_object(obj_not_test.id), obj_not_test)
        self.remote_object_manager.release_object_group('test')
        self.assertIsNone(self.remote_object_manager.get_object(obj_test_1.id))
        self.assertIsNone(self.remote_object_manager.get_object(obj_test_2.id))
        self.assertIsNotNone(self.remote_object_manager.get_object(obj_not_test.id))

    def test_get_add_object_func_adds_object_to_given_group(self):
        add_to_test_group = self.remote_object_manager.get_add_object_func('test')
        obj_test = add_to_test_group(MockRemoteObject())
        self.assertIs(self.remote_object_manager.get_object(obj_test.id), obj_test)
        self.remote_object_manager.release_object_group('test')
        self.assertIsNone(self.remote_object_manager.get_object(obj_test.id))
