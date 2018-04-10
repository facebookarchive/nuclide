"""
Used only for REPL Completion.
"""

import inspect
import os

from jedi import common
from jedi.parser.fast import FastParser
from jedi.evaluate import compiled
from jedi.cache import underscore_memoization


class MixedObject(object):
    """
    A ``MixedObject`` is used in two ways:

    1. It uses the default logic of ``parser.tree`` objects,
    2. except for getattr calls. The names dicts are generated in a fashion
       like ``CompiledObject``.

    This combined logic makes it possible to provide more powerful REPL
    completion. It allows side effects that are not noticable with the default
    parser structure to still be completeable.

    The biggest difference from CompiledObject to MixedObject is that we are
    generally dealing with Python code and not with C code. This will generate
    fewer special cases, because we in Python you don't have the same freedoms
    to modify the runtime.
    """
    def __init__(self, evaluator, obj, node_name):
        self._evaluator = evaluator
        self.obj = obj
        self.node_name = node_name
        self.definition = node_name.get_definition()

    @property
    def names_dict(self):
        return LazyMixedNamesDict(self._evaluator, self)

    def names_dicts(self, search_global):
        # TODO is this needed?
        assert search_global is False
        return [self.names_dict]

    def api_type(self):
        mappings = {
            'expr_stmt': 'statement',
            'classdef': 'class',
            'funcdef': 'function',
            'file_input': 'module',
        }
        return mappings[self.definition.type]

    def __repr__(self):
        return '<%s: %s>' % (type(self).__name__, repr(self.obj))

    def __getattr__(self, name):
        return getattr(self.definition, name)


class MixedName(compiled.CompiledName):
    """
    The ``CompiledName._compiled_object`` is our MixedObject.
    """
    @property
    @underscore_memoization
    def parent(self):
        return create(self._evaluator, getattr(self._compiled_obj.obj, self.name))

    @parent.setter
    def parent(self, value):
        pass  # Just ignore this, Name tries to overwrite the parent attribute.

    @property
    def start_pos(self):
        if isinstance(self.parent, MixedObject):
            return self.parent.node_name.start_pos

        # This means a start_pos that doesn't exist (compiled objects).
        return (0, 0)


class LazyMixedNamesDict(compiled.LazyNamesDict):
    name_class = MixedName


def parse(grammar, path):
    with open(path) as f:
        source = f.read()
    source = common.source_to_unicode(source)
    return FastParser(grammar, source, path)


def _load_module(evaluator, path, python_object):
    module = parse(evaluator.grammar, path).module
    python_module = inspect.getmodule(python_object)

    evaluator.modules[python_module.__name__] = module
    return module


def find_syntax_node_name(evaluator, python_object):
    try:
        path = inspect.getsourcefile(python_object)
    except TypeError:
        # The type might not be known (e.g. class_with_dict.__weakref__)
        return None
    if path is None or not os.path.exists(path):
        # The path might not exist or be e.g. <stdin>.
        return None

    module = _load_module(evaluator, path, python_object)

    if inspect.ismodule(python_object):
        # We don't need to check names for modules, because there's not really
        # a way to write a module in a module in Python (and also __name__ can
        # be something like ``email.utils``).
        return module

    name_str = python_object.__name__
    if name_str == '<lambda>':
        return None  # It's too hard to find lambdas.

    names = module.used_names[name_str]
    names = [n for n in names if n.is_definition()]

    try:
        code = python_object.__code__
        # By using the line number of a code object we make the lookup in a
        # file pretty easy. There's still a possibility of people defining
        # stuff like ``a = 3; foo(a); a = 4`` on the same line, but if people
        # do so we just don't care.
        line_nr = code.co_firstlineno
    except AttributeError:
        pass
    else:
        line_names = [name for name in names if name.start_pos[0] == line_nr]
        # There's a chance that the object is not available anymore, because
        # the code has changed in the background.
        if line_names:
            return line_names[-1]

    # It's really hard to actually get the right definition, here as a last
    # resort we just return the last one. This chance might lead to odd
    # completions at some points but will lead to mostly correct type
    # inference, because people tend to define a public name in a module only
    # once.
    return names[-1]


@compiled.compiled_objects_cache('mixed_cache')
def create(evaluator, obj):
    name = find_syntax_node_name(evaluator, obj)
    if name is None:
        return compiled.create(evaluator, obj)
    else:
        return MixedObject(evaluator, obj, name)
