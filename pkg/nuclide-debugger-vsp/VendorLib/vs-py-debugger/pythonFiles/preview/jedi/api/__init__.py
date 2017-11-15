"""
The API basically only provides one class. You can create a :class:`Script` and
use its methods.

Additionally you can add a debug function with :func:`set_debug_function`.
Alternatively, if you don't need a custom function and are happy with printing
debug messages to stdout, simply call :func:`set_debug_function` without
arguments.

.. warning:: Please, note that Jedi is **not thread safe**.
"""
import os
import warnings
import sys

from jedi._compatibility import unicode
from jedi.parser import load_grammar
from jedi.parser import tree
from jedi.parser.fast import FastParser
from jedi.parser.utils import save_parser
from jedi import debug
from jedi import settings
from jedi import common
from jedi import cache
from jedi.api import classes
from jedi.api import interpreter
from jedi.api import usages
from jedi.api import helpers
from jedi.api.completion import Completion
from jedi.evaluate import Evaluator
from jedi.evaluate import representation as er
from jedi.evaluate import imports
from jedi.evaluate.param import try_iter_content
from jedi.evaluate.helpers import get_module_names
from jedi.evaluate.sys_path import get_venv_path
from jedi.evaluate.iterable import unpack_tuple_to_dict

# Jedi uses lots and lots of recursion. By setting this a little bit higher, we
# can remove some "maximum recursion depth" errors.
sys.setrecursionlimit(2000)


class NotFoundError(Exception):
    """A custom error to avoid catching the wrong exceptions.

    .. deprecated:: 0.9.0
       Not in use anymore, Jedi just returns no goto result if you're not on a
       valid name.
    .. todo:: Remove!
    """


class Script(object):
    """
    A Script is the base for completions, goto or whatever you want to do with
    |jedi|.

    You can either use the ``source`` parameter or ``path`` to read a file.
    Usually you're going to want to use both of them (in an editor).

    The script might be analyzed in a different ``sys.path`` than |jedi|:

    - if `sys_path` parameter is not ``None``, it will be used as ``sys.path``
      for the script;

    - if `sys_path` parameter is ``None`` and ``VIRTUAL_ENV`` environment
      variable is defined, ``sys.path`` for the specified environment will be
      guessed (see :func:`jedi.evaluate.sys_path.get_venv_path`) and used for
      the script;

    - otherwise ``sys.path`` will match that of |jedi|.

    :param source: The source code of the current file, separated by newlines.
    :type source: str
    :param line: The line to perform actions on (starting with 1).
    :type line: int
    :param column: The column of the cursor (starting with 0).
    :type column: int
    :param path: The path of the file in the file system, or ``''`` if
        it hasn't been saved yet.
    :type path: str or None
    :param encoding: The encoding of ``source``, if it is not a
        ``unicode`` object (default ``'utf-8'``).
    :type encoding: str
    :param source_encoding: The encoding of ``source``, if it is not a
        ``unicode`` object (default ``'utf-8'``).
    :type encoding: str
    :param sys_path: ``sys.path`` to use during analysis of the script
    :type sys_path: list

    """
    def __init__(self, source=None, line=None, column=None, path=None,
                 encoding='utf-8', source_path=None, source_encoding=None,
                 sys_path=None):
        if source_path is not None:
            warnings.warn("Use path instead of source_path.", DeprecationWarning)
            path = source_path
        if source_encoding is not None:
            warnings.warn("Use encoding instead of source_encoding.", DeprecationWarning)
            encoding = source_encoding

        self._orig_path = path
        # An empty path (also empty string) should always result in no path.
        self.path = os.path.abspath(path) if path else None

        if source is None:
            # TODO add a better warning than the traceback!
            try:
                with open(path) as f:
                    source = f.read()
            except UnicodeDecodeError:
                with open(path, encoding=encoding) as f:
                    source = f.read()

        self._source = common.source_to_unicode(source, encoding)
        self._code_lines = common.splitlines(self._source)
        line = max(len(self._code_lines), 1) if line is None else line
        if not (0 < line <= len(self._code_lines)):
            raise ValueError('`line` parameter is not in a valid range.')

        line_len = len(self._code_lines[line - 1])
        column = line_len if column is None else column
        if not (0 <= column <= line_len):
            raise ValueError('`column` parameter is not in a valid range.')
        self._pos = line, column
        self._path = path

        cache.clear_time_caches()
        debug.reset_time()
        self._grammar = load_grammar(version='%s.%s' % sys.version_info[:2])
        if sys_path is None:
            venv = os.getenv('VIRTUAL_ENV')
            if venv:
                sys_path = list(get_venv_path(venv))
        self._evaluator = Evaluator(self._grammar, sys_path=sys_path)
        debug.speed('init')

    def _get_module(self):
        cache.invalidate_star_import_cache(self._path)
        parser = FastParser(self._grammar, self._source, self.path)
        save_parser(self.path, parser, pickling=False)

        module = self._evaluator.wrap(parser.module)
        imports.add_module(self._evaluator, unicode(module.name), module)
        return parser.module

    @property
    def source_path(self):
        """
        .. deprecated:: 0.7.0
           Use :attr:`.path` instead.
        .. todo:: Remove!
        """
        warnings.warn("Use path instead of source_path.", DeprecationWarning)
        return self.path

    def __repr__(self):
        return '<%s: %s>' % (self.__class__.__name__, repr(self._orig_path))

    def completions(self):
        """
        Return :class:`classes.Completion` objects. Those objects contain
        information about the completions, more than just names.

        :return: Completion objects, sorted by name and __ comes last.
        :rtype: list of :class:`classes.Completion`
        """
        debug.speed('completions start')
        completion = Completion(
            self._evaluator, self._get_module(), self._code_lines,
            self._pos, self.call_signatures
        )
        completions = completion.completions()
        debug.speed('completions end')
        return completions

    def goto_definitions(self):
        """
        Return the definitions of a the path under the cursor.  goto function!
        This follows complicated paths and returns the end, not the first
        definition. The big difference between :meth:`goto_assignments` and
        :meth:`goto_definitions` is that :meth:`goto_assignments` doesn't
        follow imports and statements. Multiple objects may be returned,
        because Python itself is a dynamic language, which means depending on
        an option you can have two different versions of a function.

        :rtype: list of :class:`classes.Definition`
        """
        leaf = self._get_module().name_for_position(self._pos)
        if leaf is None:
            leaf = self._get_module().get_leaf_for_position(self._pos)
            if leaf is None:
                return []
        definitions = helpers.evaluate_goto_definition(self._evaluator, leaf)

        names = [s.name for s in definitions]
        defs = [classes.Definition(self._evaluator, name) for name in names]
        # The additional set here allows the definitions to become unique in an
        # API sense. In the internals we want to separate more things than in
        # the API.
        return helpers.sorted_definitions(set(defs))

    def goto_assignments(self, follow_imports=False):
        """
        Return the first definition found, while optionally following imports.
        Multiple objects may be returned, because Python itself is a
        dynamic language, which means depending on an option you can have two
        different versions of a function.

        :rtype: list of :class:`classes.Definition`
        """
        def filter_follow_imports(names):
            for name in names:
                definition = name.get_definition()
                if definition.type in ('import_name', 'import_from'):
                    imp = imports.ImportWrapper(self._evaluator, name)
                    for name in filter_follow_imports(imp.follow(is_goto=True)):
                        yield name
                else:
                    yield name

        names = self._goto()
        if follow_imports:
            names = filter_follow_imports(names)

        defs = [classes.Definition(self._evaluator, d) for d in set(names)]
        return helpers.sorted_definitions(defs)

    def _goto(self):
        """
        Used for goto_assignments and usages.
        """
        name = self._get_module().name_for_position(self._pos)
        if name is None:
            return []
        return list(self._evaluator.goto(name))

    def usages(self, additional_module_paths=()):
        """
        Return :class:`classes.Definition` objects, which contain all
        names that point to the definition of the name under the cursor. This
        is very useful for refactoring (renaming), or to show all usages of a
        variable.

        .. todo:: Implement additional_module_paths

        :rtype: list of :class:`classes.Definition`
        """
        temp, settings.dynamic_flow_information = \
            settings.dynamic_flow_information, False
        try:
            user_stmt = self._get_module().get_statement_for_position(self._pos)
            definitions = self._goto()
            if not definitions and isinstance(user_stmt, tree.Import):
                # For not defined imports (goto doesn't find something, we take
                # the name as a definition. This is enough, because every name
                # points to it.
                name = user_stmt.name_for_position(self._pos)
                if name is None:
                    # Must be syntax
                    return []
                definitions = [name]

            if not definitions:
                # Without a definition for a name we cannot find references.
                return []

            if not isinstance(user_stmt, tree.Import):
                # import case is looked at with add_import_name option
                definitions = usages.usages_add_import_modules(self._evaluator,
                                                               definitions)

            module = set([d.get_parent_until() for d in definitions])
            module.add(self._get_module())
            names = usages.usages(self._evaluator, definitions, module)

            for d in set(definitions):
                names.append(classes.Definition(self._evaluator, d))
        finally:
            settings.dynamic_flow_information = temp

        return helpers.sorted_definitions(set(names))

    def call_signatures(self):
        """
        Return the function object of the call you're currently in.

        E.g. if the cursor is here::

            abs(# <-- cursor is here

        This would return the ``abs`` function. On the other hand::

            abs()# <-- cursor is here

        This would return an empty list..

        :rtype: list of :class:`classes.CallSignature`
        """
        call_signature_details = \
            helpers.get_call_signature_details(self._get_module(), self._pos)
        if call_signature_details is None:
            return []

        with common.scale_speed_settings(settings.scale_call_signatures):
            definitions = helpers.cache_call_signatures(
                self._evaluator,
                call_signature_details.bracket_leaf,
                self._code_lines,
                self._pos
            )
        debug.speed('func_call followed')

        return [classes.CallSignature(self._evaluator, d.name,
                                      call_signature_details.bracket_leaf.start_pos,
                                      call_signature_details.call_index,
                                      call_signature_details.keyword_name_str)
                for d in definitions if hasattr(d, 'py__call__')]

    def _analysis(self):
        self._evaluator.is_analysis = True
        self._evaluator.analysis_modules = [self._get_module()]
        try:
            for node in self._get_module().nodes_to_execute():
                if node.type in ('funcdef', 'classdef'):
                    if node.type == 'classdef':
                        continue
                        raise NotImplementedError
                    er.Function(self._evaluator, node).get_decorated_func()
                elif isinstance(node, tree.Import):
                    import_names = set(node.get_defined_names())
                    if node.is_nested():
                        import_names |= set(path[-1] for path in node.paths())
                    for n in import_names:
                        imports.ImportWrapper(self._evaluator, n).follow()
                elif node.type == 'expr_stmt':
                    types = self._evaluator.eval_element(node)
                    for testlist in node.children[:-1:2]:
                        # Iterate tuples.
                        unpack_tuple_to_dict(self._evaluator, types, testlist)
                else:
                    try_iter_content(self._evaluator.goto_definitions(node))
                self._evaluator.reset_recursion_limitations()

            ana = [a for a in self._evaluator.analysis if self.path == a.path]
            return sorted(set(ana), key=lambda x: x.line)
        finally:
            self._evaluator.is_analysis = False


class Interpreter(Script):
    """
    Jedi API for Python REPLs.

    In addition to completion of simple attribute access, Jedi
    supports code completion based on static code analysis.
    Jedi can complete attributes of object which is not initialized
    yet.

    >>> from os.path import join
    >>> namespace = locals()
    >>> script = Interpreter('join("").up', [namespace])
    >>> print(script.completions()[0].name)
    upper
    """

    def __init__(self, source, namespaces, **kwds):
        """
        Parse `source` and mixin interpreted Python objects from `namespaces`.

        :type source: str
        :arg  source: Code to parse.
        :type namespaces: list of dict
        :arg  namespaces: a list of namespace dictionaries such as the one
                          returned by :func:`locals`.

        Other optional arguments are same as the ones for :class:`Script`.
        If `line` and `column` are None, they are assumed be at the end of
        `source`.
        """
        try:
            namespaces = [dict(n) for n in namespaces]
        except Exception:
            raise TypeError("namespaces must be a non-empty list of dicts.")

        super(Interpreter, self).__init__(source, **kwds)
        self.namespaces = namespaces

        parser_module = super(Interpreter, self)._get_module()
        self._module = interpreter.MixedModule(self._evaluator, parser_module, self.namespaces)

    def _get_module(self):
        return self._module


def defined_names(source, path=None, encoding='utf-8'):
    """
    Get all definitions in `source` sorted by its position.

    This functions can be used for listing functions, classes and
    data defined in a file.  This can be useful if you want to list
    them in "sidebar".  Each element in the returned list also has
    `defined_names` method which can be used to get sub-definitions
    (e.g., methods in class).

    :rtype: list of classes.Definition

    .. deprecated:: 0.9.0
       Use :func:`names` instead.
    .. todo:: Remove!
    """
    warnings.warn("Use call_signatures instead.", DeprecationWarning)
    return names(source, path, encoding)


def names(source=None, path=None, encoding='utf-8', all_scopes=False,
          definitions=True, references=False):
    """
    Returns a list of `Definition` objects, containing name parts.
    This means you can call ``Definition.goto_assignments()`` and get the
    reference of a name.
    The parameters are the same as in :py:class:`Script`, except or the
    following ones:

    :param all_scopes: If True lists the names of all scopes instead of only
        the module namespace.
    :param definitions: If True lists the names that have been defined by a
        class, function or a statement (``a = b`` returns ``a``).
    :param references: If True lists all the names that are not listed by
        ``definitions=True``. E.g. ``a = b`` returns ``b``.
    """
    def def_ref_filter(_def):
        is_def = _def.is_definition()
        return definitions and is_def or references and not is_def

    # Set line/column to a random position, because they don't matter.
    script = Script(source, line=1, column=0, path=path, encoding=encoding)
    defs = [classes.Definition(script._evaluator, name_part)
            for name_part in get_module_names(script._get_module(), all_scopes)]
    return sorted(filter(def_ref_filter, defs), key=lambda x: (x.line, x.column))


def preload_module(*modules):
    """
    Preloading modules tells Jedi to load a module now, instead of lazy parsing
    of modules. Usful for IDEs, to control which modules to load on startup.

    :param modules: different module names, list of string.
    """
    for m in modules:
        s = "import %s as x; x." % m
        Script(s, 1, len(s), None).completions()


def set_debug_function(func_cb=debug.print_to_stdout, warnings=True,
                       notices=True, speed=True):
    """
    Define a callback debug function to get all the debug messages.

    If you don't specify any arguments, debug messages will be printed to stdout.

    :param func_cb: The callback function for debug messages, with n params.
    """
    debug.debug_function = func_cb
    debug.enable_warning = warnings
    debug.enable_notice = notices
    debug.enable_speed = speed
