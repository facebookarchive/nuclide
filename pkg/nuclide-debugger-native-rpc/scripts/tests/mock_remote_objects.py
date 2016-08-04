# Copyright (c) 2015-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the license found in the LICENSE file in
# the root directory of this source tree.

from ..remote_objects import RemoteObject


class MockRemoteObject(RemoteObject):
    def __init__(self):
        self._properties = {'result': []}
        self._serialized_value = {'type': 'undefined'}

    @property
    def serialized_value(self):
        return self._serialized_value

    @serialized_value.setter
    def serialized_value(self, value):
        self._serialized_value = value

    @property
    def properties(self):
        return self._properties

    @properties.setter
    def properties(self, properties):
        self._properties = properties
