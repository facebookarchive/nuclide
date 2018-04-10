"""
Loads functions that are mixed in to the standard library. E.g. builtins are
written in C (binaries), but my autocompletion only understands Python code. By
mixing in Python code, the autocompletion should work much better for builtins.
"""

import os
import inspect
import types

from jedi._compatibility import is_py3, builtins, unicode, is_py34
from jedi.parser import ParserWithRecovery, load_grammar
from jedi.parser import tree as pt
from jedi.evaluate.helpers import FakeName

modules = {}


MethodDescriptorType = type(str.replace)
# These are not considered classes and access is granted even though they have
# a __class__ attribute.
NOT_CLASS_TYPES = (
    types.BuiltinFunctionType,
    types.CodeType,
    types.FrameType,
    types.FunctionType,
    types.GeneratorType,
    types.GetSetDescriptorType,
    types.LambdaType,
    types.MemberDescriptorType,
    types.MethodType,
    types.ModuleType,
    types.TracebackType,
    MethodDescriptorType
)

if is_py3:
    NOT_CLASS_TYPES += (
        types.MappingProxyType,
        types.SimpleNamespace
    )
    if is_py34:
        NOT_CLASS_TYPES += (types.DynamicClassAttribute,)


class FakeDoesNotExist(Exception):
    pass


def _load_faked_module(module):
    module_name = module.__name__
    if module_name == '__builtin__' and not is_py3:
        module_name = 'builtins'

    try:
        return modules[module_name]
    except KeyError:
        path = os.path.dirname(os.path.abspath(__file__))
        try:
            with open(os.path.join(path, 'fake', module_name) + '.pym') as f:
                source = f.read()
        except IOError:
            modules[module_name] = None
            return
        grammar = load_grammar(version='3.4')
        module = ParserWithRecovery(grammar, unicode(source), module_name).module
        modules[module_name] = module

        if module_name == 'builtins' and not is_py3:
            # There are two implementations of `open` for either python 2/3.
            # -> Rename the python2 version (`look at fake/builtins.pym`).
            open_func = search_scope(module, 'open')
            open_func.children[1] = FakeName('open_python3')
            open_func = search_scope(module, 'open_python2')
            open_func.children[1] = FakeName('open')
        return module


def search_scope(scope, obj_name):
    for s in scope.subscopes:
        if str(s.name) == obj_name:
            return s


def get_module(obj):
    if inspect.ismodule(obj):
        return obj
    try:
        obj = obj.__objclass__
    except AttributeError:
        pass

    try:
        imp_plz = obj.__module__
    except AttributeError:
        # Unfortunately in some cases like `int` there's no __module__
        return builtins
    else:
        if imp_plz is None:
            # Happens for example in `(_ for _ in []).send.__module__`.
            return builtins
        else:
            try:
                return __import__(imp_plz)
            except ImportError:
                # __module__ can be something arbitrary that doesn't exist.
                return builtins


def _faked(module, obj, name):
    # Crazy underscore actions to try to escape all the internal madness.
    if module is None:
        module = get_module(obj)

    faked_mod = _load_faked_module(module)
    if faked_mod is None:
        return None

    # Having the module as a `parser.representation.module`, we need to scan
    # for methods.
    if name is None:
        if inspect.isbuiltin(obj):
            return search_scope(faked_mod, obj.__name__)
        elif not inspect.isclass(obj):
            # object is a method or descriptor
            try:
                objclass = obj.__objclass__
            except AttributeError:
                return None
            else:
                cls = search_scope(faked_mod, objclass.__name__)
                if cls is None:
                    return None
                return search_scope(cls, obj.__name__)
    else:
        if obj == module:
            return search_scope(faked_mod, name)
        else:
            try:
                cls_name = obj.__name__
            except AttributeError:
                return None
            cls = search_scope(faked_mod, cls_name)
            if cls is None:
                return None
            return search_scope(cls, name)


def memoize_faked(obj):
    """
    A typical memoize function that ignores issues with non hashable results.
    """
    cache = obj.cache = {}

    def memoizer(*args, **kwargs):
        key = (obj, args, frozenset(kwargs.items()))
        try:
            result = cache[key]
        except TypeError:
            return obj(*args, **kwargs)
        except KeyError:
            result = obj(*args, **kwargs)
            if result is not None:
                cache[key] = obj(*args, **kwargs)
            return result
        else:
            return result
    return memoizer


@memoize_faked
def _get_faked(module, obj, name=None):
    obj = type(obj) if is_class_instance(obj) else obj
    result = _faked(module, obj, name)
    if result is None or isinstance(result, pt.Class):
        # We're not interested in classes. What we want is functions.
        raise FakeDoesNotExist
    else:
        # Set the docstr which was previously not set (faked modules don't
        # contain it).
        doc = '"""%s"""' % obj.__doc__  # TODO need escapes.
        suite = result.children[-1]
        string = pt.String(pt.zero_position_modifier, doc, (0, 0), '')
        new_line = pt.Newline('\n', (0, 0), '')
        docstr_node = pt.Node('simple_stmt', [string, new_line])
        suite.children.insert(2, docstr_node)
        return result


def get_faked(module, obj, name=None, parent=None):
    faked = _get_faked(module, obj, name)
    faked.parent = parent
    return faked


def is_class_instance(obj):
    """Like inspect.* methods."""
    try:
        cls = obj.__class__
    except AttributeError:
        return False
    else:
        return cls != type and not issubclass(cls, NOT_CLASS_TYPES)
