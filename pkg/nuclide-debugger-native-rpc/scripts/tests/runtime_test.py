# Copyright (c) 2015-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the license found in the LICENSE file in
# the root directory of this source tree.

from ..find_lldb import lldb
from ..runtime_domain import RuntimeDomain
from mock_notification_channel import MockChromeChannel
from mock_remote_objects import MockRemoteObject
from pkg_resources import resource_string
from test_executable import TestExecutable
import os
import unittest
from ..debugger_store import DebuggerStore

class NoProcessMixin(object):
    """Mixin to set up a runtime domain without a target process."""
    def setUp(self):
        super(NoProcessMixin, self).setUp()
        self.debugger = lldb.SBDebugger.Create()
        self.debugger_store = DebuggerStore(self.debugger, None, None, is_attach=False)
        self.runtime_domain = RuntimeDomain(debugger_store = self.debugger_store)


class RealProcessMixin(object):
    """Mixin to set up a runtime domain with a real process."""
    @classmethod
    def setUpClass(cls):
        super(RealProcessMixin, cls).setUpClass()
        cls.test_executable = TestExecutable(
            resource_string(__name__, 'runtime_test_process.mm'),
            '.mm',
            extra_flags=['-framework', 'Foundation'])

    @classmethod
    def tearDownClass(cls):
        super(RealProcessMixin, cls).tearDownClass()
        cls.test_executable.clean_up()

    def setUp(self):
        super(RealProcessMixin, self).setUp()
        self.debugger = lldb.SBDebugger.Create()
        self.debugger.CreateTargetWithFileAndArch(
            self.__class__.test_executable.executable_path,
            lldb.LLDB_ARCH_DEFAULT)
        self.debugger.SetAsync(False)
        # Stop in a line with all expressions in scope.
        self.debugger.GetSelectedTarget().BreakpointCreateByLocation(
            self.__class__.test_executable.source_path, 45)
        self.process = self.debugger.GetSelectedTarget().LaunchSimple(
            None, None, os.getcwd())
        self.assertTrue(self.debugger.GetSelectedTarget().process.is_stopped)

        mock_channel = MockChromeChannel
        self.debugger_store = DebuggerStore(self.debugger, mock_channel, None, is_attach=False)
        self.runtime_domain = RuntimeDomain(debugger_store = self.debugger_store)

    def tearDown(self):
        super(RealProcessMixin, self).tearDown()
        lldb.SBDebugger.Destroy(self.debugger)


class RuntimeDomainConsoleTest(NoProcessMixin, unittest.TestCase):
    def test_should_return_correctly_formatted_result(self):
        result = self.runtime_domain.evaluate({
            'objectGroup': 'console',
            'expression': 'target list',
        })
        self.assertEqual({
            'result': {
                'value': 'No targets.\n',
            },
            'wasThrown': False,
        }, result)


class RuntimeDomainWatchTest(RealProcessMixin, unittest.TestCase):
    def setUp(self):
        super(RuntimeDomainWatchTest, self).setUp()
        self.longMessage = True

    def test_should_return_correctly_formatted_success_result(self):
        actual = self.runtime_domain.evaluate({
            'objectGroup': 'watch-group',
            'expression': '1 + 2',
        })
        self.assertEqual({
            'result': {
                'type': 'object',
                'description': '(int) 3',
            },
            'wasThrown': False,
        }, actual)

    def test_should_return_correctly_formatted_failure_result(self):
        actual = self.runtime_domain.evaluate({
            'objectGroup': 'watch-group',
            'expression': '1 + variable_that_does_not_exist',
        })
        self.assertDictContainsSubset({
            'result': {
                'type': 'text',
            },
            'wasThrown': True,
        }, actual)
        self.assertIn('exceptionDetails', actual)
        self.assertIn('text', actual['exceptionDetails'])

    def test_should_return_correctly_formatted_NSString(self):
        actual = self.runtime_domain.evaluate({
            'objectGroup': 'watch-group',
            'expression': 'make',
        })
        self.assertIn('Porsche', actual['result']['description'],
            'should contain string content')

    def test_should_return_correctly_formatted_pointer(self):
        actual = self.runtime_domain.evaluate({
            'objectGroup': 'watch-group',
            'expression': 'argv',
        })
        self.assertIn('(char **)', actual['result']['description'])

        obj = self.debugger_store.remote_object_manager.get_object(actual['result']['objectId'])
        self.assertEqual(1, len(obj.properties['result']),
            'should have one target')

        # argv will contain the path to the executable
        argument = self.__class__.test_executable.executable_path
        obj_level1_target_result = obj.properties['result'][0];
        self.assertIn('(char *)',
            obj_level1_target_result['value']['description'],
            'target should have correct type string')
        self.assertIn(argument,
            obj_level1_target_result['value']['description'],
            'target should have correct string content')

        obj_level1_target = self.debugger_store.remote_object_manager.get_object(
            obj_level1_target_result['value']['objectId']);
        self.assertEqual(1, len(obj_level1_target.properties['result']),
            'should have one target')

        obj_level2_target_result = obj_level1_target.properties['result'][0];
        self.assertIn('(char)',
            obj_level2_target_result['value']['description'],
            'target should have correct type string')
        self.assertIn(argument[0],
            obj_level2_target_result['value']['description'],
            'target should have correct string content')

    def test_should_return_correctly_formatted_NSArray(self):
        actual = self.runtime_domain.evaluate({
            'objectGroup': 'watch-group',
            'expression': 'germanMakes_array',
        })
        self.assertIn('NSArray', actual['result']['description'])

        obj = self.debugger_store.remote_object_manager.get_object(
            actual['result']['objectId'])
        self.assertEqual(3, len(obj.properties['result']),
            'should have three children')

        first_child = obj.properties['result'][0]
        self.assertIn('Mercedes-Benz',
            first_child['value']['description'],
            'first child description should contain its string content')
        self.assertIn('NSCFConstantString',
            first_child['value']['description'],
            'first child description should contain its type string')

        second_child = obj.properties['result'][1]
        self.assertIn('Porsche', second_child['value']['description'],
            'second child description should contain its string content')

        third_child = obj.properties['result'][2]
        self.assertIn('Volkswagen', third_child['value']['description'],
            'third child description should contain its string content')

    def test_should_return_correctly_formatted_NSSet(self):
        actual = self.runtime_domain.evaluate({
            'objectGroup': 'watch-group',
            'expression': 'americanMakes_set',
        })
        self.assertIn('NSSet', actual['result']['description'])

        obj = self.debugger_store.remote_object_manager.get_object(
            actual['result']['objectId'])
        self.assertEqual(3, len(obj.properties['result']),
            'should have three children')

        first_child = obj.properties['result'][0]
        self.assertIn('Ford', first_child['value']['description'],
            'first child description should contain its string content')
        self.assertIn('NSCFConstantString', first_child['value']['description'],
            'first child description should contain its type string')

        second_child = obj.properties['result'][1]
        self.assertIn('General Motors', second_child['value']['description'],
            'second child description should contain its string content')

        third_child = obj.properties['result'][2]
        self.assertIn('Chrysler', third_child['value']['description'],
            'third child description should contain its string content')

    def test_should_return_objc_ivars_and_superclass_of_objc_instances(self):
        actual = self.runtime_domain.evaluate({
            'objectGroup': 'watch-group',
            'expression': '(ObjcClassWithIvars *)[ObjcClassWithIvars new]',
        })
        self.assertIn('ObjcClassWithIvars', actual['result']['description'])
        obj = self.debugger_store.remote_object_manager.get_object(
            actual['result']['objectId'])
        self.assertEqual(2, len(obj.properties['result']),
            'should have two properties')
        first_prop = obj.properties['result'][0]
        self.assertEqual('NSObject', first_prop['name'],
            'first property should be superclass')
        second_prop = obj.properties['result'][1]
        self.assertEqual('_arrayValue', second_prop['name'],
            'second property should be _arrayValue')
        self.assertIn('NSArray', second_prop['value']['description'],
            'second property should have NSArray in description')

class RuntimeDomainPropertiesTest(NoProcessMixin, unittest.TestCase):
    def test_get_properties_returns_properties_of_simple_object(self):
        mock_props = {
            'result': [{'name': 'foo', 'value': {'type': 'undefined'}}],
        }

        test_object = MockRemoteObject()
        test_object.properties = mock_props

        self.debugger_store.remote_object_manager.add_object(test_object)
        result = self.runtime_domain.getProperties({
            'objectId': test_object.id
        })
        self.assertEqual(mock_props, result)
