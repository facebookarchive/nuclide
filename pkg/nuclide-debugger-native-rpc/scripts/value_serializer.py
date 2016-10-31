# Copyright (c) 2015-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the license found in the LICENSE file in
# the root directory of this source tree.

"""In charge of expression evaluation handling and serialization.
"""
from find_lldb import get_lldb
import remote_objects


def get_value_description(value):
    """Format the SBValue into follow format: ([type]) [summary/description/value]
    The result is space-trimmed so that if any field above does not exist will be omitted.
    """
    #TODO[jeffreytan] Send type/value/description triplet and
    # customize watch/locals window UI to display them in separate columns;
    # this will allow user to edit the expression value
    # instead the whole format string.
    return '({0}) {1}'.format(value.type.name,
                                (value.summary or value.description or value.value or '')).strip()


def serialize_value(value, add_object_func):
    """Serialize an SBValue into a RemoteObject JSON structure.

    Args:
        value: the SBValue to serialize
        add_object_func: function taking and returning a RemoteObject instance,
            that registers the object in an remote object manager.
    """
    # Resolve dynamic type.
    if value.IsDynamic():
        value = value.dynamic

    for value_handler in VALUE_HANDLERS:
        result = value_handler.handle(value, add_object_func)
        if result is not None:
            return result

    # Treat as primitive build-in types.
    return {
        'type': 'object',
        'description': get_value_description(value),
    }


class ValueHandler(object):
    """Base class for all ValueHandlers.
    """
    @classmethod
    def handle(cls, value, add_object_func):
        return None


class ExpandableValueHandler(ValueHandler):
    """ValueHandler for all expandable types with sub-fields.
    """
    @classmethod
    def handle(cls, value, add_object_func):
        if value.num_children > 0:
            obj = add_object_func(ExpandableSBValueRemoteObject(value, add_object_func))
            return obj.serialized_value
        return None


class ExpandableSBValueRemoteObject(remote_objects.RemoteObject):
    """Generic RemoteObject for expandable objects, like C++/ObjectC class/interface.
    These objects have sub-fields and derive their descriptions from object descriptions.
    """
    def __init__(self, value, add_object_func):
        self._value = value
        self._add_object_func = add_object_func

    @property
    def serialized_value(self):
        return {
            'objectId': self.id,
            'type': 'object',
            'description': get_value_description(self._value),
        }

    @property
    def properties(self):
        property_descriptors = []
        for i in xrange(0, self._value.num_children):
            # GetChildAtIndex(idx, use_dynamic, can_create_synthetic)
            member = self._value.GetChildAtIndex(i, False, False)
            if member.IsValid():
                property_descriptors.append({
                    'name': member.name,
                    'value': serialize_value(member, self._add_object_func),
                })
        return {
            'result': property_descriptors,
        }


class CppStructValueHandler(ValueHandler):
    """ValueHandler for C++ struct type.
    """
    @classmethod
    def handle(cls, value, add_object_func):
        lldb = get_lldb()
        if (value.type.type == lldb.eTypeClassStruct or
                ((value.type.type == lldb.eTypeClassTypedef) and
                 (value.type.GetCanonicalType().type == lldb.eTypeClassStruct))):
            obj = add_object_func(CppStructSBValueRemoteObject(value, add_object_func))
            return obj.serialized_value
        return None


class CppStructSBValueRemoteObject(ExpandableSBValueRemoteObject):
    """RemoteObject for C++ struct.
    """
    def __init__(self, value, add_object_func):
        ExpandableSBValueRemoteObject.__init__(self, value, add_object_func)

    @property
    def serialized_value(self):
        if self._value.type.name == '__lldb_autogen_nspair':
            #TODO[jeffreytan]: lldb will generate internal type '__lldb_autogen_nspair'
            # for key/value pair in dictionary, we replace it with more meaningful string here.
            # Ideally we should fetch the underlying value content and display
            # (key, value) so user does not need to expand one more level to examine content.
            description = 'key/value pair'
        else:
            description = get_value_description(self._value)

        return {
            'objectId': self.id,
            'type': 'object',
            'description': description
        }


class DereferenceableValueHandler(ValueHandler):
    @classmethod
    def handle(cls, value, add_object_func):
        lldb = get_lldb()
        """ValueHandler for dereferenceable types
        """
        DEREF_TYPE_CLASSES = [
            lldb.eTypeClassPointer,
            # TODO[jeffreytan]: I do not think ObjectC/C++ support reference yet
            # so disable for now(enable it when we support classic C++).
            # lldb.eTypeClassReference,
        ]

        if value.type.type in DEREF_TYPE_CLASSES:
            obj = add_object_func(DereferenceableSBValueRemoteObject(value, add_object_func))
            return obj.serialized_value
        return None


class DereferenceableSBValueRemoteObject(remote_objects.RemoteObject):
    """RemoteObject for dereferenceable value, like pointer and reference.
    These objects can be further dereferenced to examine their target values.
    """
    def __init__(self, value, add_object_func):
        self._value = value
        self._add_object_func = add_object_func

    @property
    def serialized_value(self):
        return {
            'objectId': self.id,
            'type': 'object',
            'description': get_value_description(self._value),
        }

    @property
    def properties(self):
        property_descriptors = []
        value_deref = self._value.deref
        if value_deref.IsValid():
            property_descriptors.append({
                'name': value_deref.name,
                'value': serialize_value(value_deref, self._add_object_func),
            })
        return {
            'result': property_descriptors,
        }


VALUE_HANDLERS = [
    ExpandableValueHandler(),
    DereferenceableValueHandler(),
    CppStructValueHandler(),
]
