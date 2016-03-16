# Copyright (c) 2015-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the license found in the LICENSE file in
# the root directory of this source tree.

"""Remote objects is an RPC system from the chrome debugger client.

RemoteObjects are assigned IDs so that the client can query and operate on
them. They are assigned to named groups and kept around on the server until the
client requests that they are released.
"""

import abc
from functools import partial


class RemoteObjectManager:
    def __init__(self):
        self.objects = {}
        self.group_to_object_ids = {}
        self.next_object_id = 1

    def add_object(self, obj, group=None):
        """Add a RemoteObject into the manager with a fresh ID.

        The object is stored until explicity removed by releaseObjectGroup or
        releaseObject.
        """
        obj.id = "RemoteObjectManager.%d" % self.next_object_id
        self.next_object_id += 1
        self.objects[obj.id] = obj
        if group is not None:
            if group not in self.group_to_object_ids:
                self.group_to_object_ids[group] = set()
            self.group_to_object_ids[group].add(obj.id)
        return obj

    def get_add_object_func(self, group):
        """Returns a function that can be used to add an object to this
        RemoteObjectManager with a specific associated group.
        """
        return partial(self.add_object, group=group)

    def get_object(self, object_id):
        return self.objects.get(object_id, None)

    def release_object_group(self, group):
        """Release all objects in a group."""
        if group in self.group_to_object_ids:
            for object_id in self.group_to_object_ids[group]:
                if object_id in self.objects:
                    del self.objects[object_id]
            del self.group_to_object_ids[group]


class RemoteObject:
    """Base class of objects that can be passed to the client."""
    __metaclass__ = abc.ABCMeta

    @property
    def id(self):
        return self._id

    @id.setter
    def id(self, value):
        self._id = value

    @abc.abstractproperty
    def serialized_value(self):
        pass

    @abc.abstractproperty
    def properties(self):
        """Returns properties in inspector API's Runtime.getProperties format.
        """
        pass


class ValueListRemoteObject(RemoteObject):
    """Remote object containing multiple SBValues as properties."""
    def __init__(self, values, add_object_func):
        """
        Args:
            values: list of SBValue objects
            add_object_func: See RemoteObjectManager.get_add_object_func
        """
        self._values = values
        self._add_object_func = add_object_func

    @property
    def serialized_value(self):
        return {
            'type': 'object',
            'objectId': self.id
        }

    @property
    def properties(self):
        import value_serializer  # delayed import to break circular dependency

        property_descriptors = []
        for value in self._values:
            property_descriptors.append({
                'name': value.name,
                'value': value_serializer.serialize_value(
                    value,
                    self._add_object_func),
            })
        return {
            'result': property_descriptors,
        }
