# Copyright (c) 2015-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the license found in the LICENSE file in
# the root directory of this source tree.

"""In charge of expression evaluation handling and serialization.
"""
import lldb
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
    # Resolve dynamic type
    if value.type.name == 'id':
        value = value.dynamic

    for value_handler in VALUE_HANDLERS:
        result = value_handler.handle(value, add_object_func)
        if result is not None:
            return result

    # primitive build-in types
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


class GenericObjCValueHandler(ValueHandler):
    """ValueHandler for all Object-C types
    """
    OBJC_TYPE_CLASSES = [
        lldb.eTypeClassObjCInterface,
        lldb.eTypeClassObjCObject,
        # TODO[jeffreytan]: investigate if eTypeClassObjCObjectPointer should handled
        # by GenericObjCValueHandler or DereferenceableValueHandler
        lldb.eTypeClassObjCObjectPointer,
    ]

    @classmethod
    def handle(cls, value, add_object_func):
        if cls.can_handle_type(value.type):
            obj = add_object_func(GenericClassSBValueRemoteObject(value, add_object_func))
            return obj.serialized_value
        return None

    @classmethod
    def can_handle_type(cls, type_):
        return (
            type_.type in cls.OBJC_TYPE_CLASSES or
            type_.type == lldb.eTypeClassTypedef and type_.name == 'id'
        )


class GenericClassSBValueRemoteObject(remote_objects.RemoteObject):
    """Generic Class RemoteObject for C++/Object-C class/interface.
    These objects have fields and derive their descriptions from object descriptions.
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


class CppTypeValueHandler(ValueHandler):
    """ValueHandler for C++ objects, like struct, class etc...
    """
    @classmethod
    def handle(cls, value, add_object_func):
        if (value.type.type == lldb.eTypeClassStruct or
                ((value.type.type == lldb.eTypeClassTypedef) and
                 (value.type.GetCanonicalType().type == lldb.eTypeClassStruct))):
            obj = add_object_func(CppStructSBValueRemoteObject(value, add_object_func))
            return obj.serialized_value
        # TODO[jeffreytan]: support other C++ types like class/union/enumeration etc..
        return None


class CppStructSBValueRemoteObject(GenericClassSBValueRemoteObject):
    """RemoteObject for C++ struct.
    """
    def __init__(self, value, add_object_func):
        GenericClassSBValueRemoteObject.__init__(self, value, add_object_func)

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
    """ValueHandler for dereferenceable types
    """
    DEREF_TYPE_CLASSES = [
        lldb.eTypeClassPointer,
        #TODO[jeffreytan]: I do not think ObjectC/C++ support reference yet
        # so disable for now(enable it when we support classic C++).
        #lldb.eTypeClassReference,
    ]

    @classmethod
    def handle(cls, value, add_object_func):
        if value.type.type in cls.DEREF_TYPE_CLASSES:
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
    GenericObjCValueHandler(),
    DereferenceableValueHandler(),
    CppTypeValueHandler(),
]
