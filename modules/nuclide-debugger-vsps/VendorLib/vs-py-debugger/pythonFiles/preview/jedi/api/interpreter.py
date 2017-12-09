"""
TODO Some parts of this module are still not well documented.
"""
import copy

from jedi.cache import underscore_memoization
from jedi.evaluate import helpers
from jedi.evaluate.representation import ModuleWrapper
from jedi.evaluate.compiled import mixed


class MixedModule(object):
    resets_positions = True
    type = 'mixed_module'

    def __init__(self, evaluator, parser_module, namespaces):
        self._evaluator = evaluator
        self._namespaces = namespaces

        self._namespace_objects = [type('jedi_namespace', (), n) for n in namespaces]
        self._wrapped_module = ModuleWrapper(evaluator, parser_module)
        # Usually we are dealing with very small code sizes when it comes to
        # interpreter modules. In this case we just copy the whole syntax tree
        # to be able to modify it.
        self._parser_module = copy.deepcopy(parser_module)

        for child in self._parser_module.children:
            child.parent = self

    def names_dicts(self, search_global):
        for names_dict in self._wrapped_module.names_dicts(search_global):
            yield names_dict

        for namespace_obj in self._namespace_objects:
            m = mixed.MixedObject(self._evaluator, namespace_obj, self._parser_module.name)
            for names_dict in m.names_dicts(False):
                yield names_dict

    def __getattr__(self, name):
        return getattr(self._parser_module, name)


class LazyName(helpers.FakeName):
    def __init__(self, evaluator, module, name, value):
        super(LazyName, self).__init__(name)
        self._module = module
        self._evaluator = evaluator
        self._value = value
        self._name = name

    def is_definition(self):
        return True

    @property
    @underscore_memoization
    def parent(self):
        """
        Creating fake statements for the interpreter.

        Here we are trying to link back to Python code, if possible. This means
        we try to find the python module for a name (not the builtin).
        """
        return mixed.create(self._evaluator, self._value)

    @parent.setter
    def parent(self, value):
        """Needed because the super class tries to set parent."""
