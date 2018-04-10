"""
Searching for names with given scope and name. This is very central in Jedi and
Python. The name resolution is quite complicated with descripter,
``__getattribute__``, ``__getattr__``, ``global``, etc.

If you want to understand name resolution, please read the first few chapters
in http://blog.ionelmc.ro/2015/02/09/understanding-python-metaclasses/.

Flow checks
+++++++++++

Flow checks are not really mature. There's only a check for ``isinstance``.  It
would check whether a flow has the form of ``if isinstance(a, type_or_tuple)``.
Unfortunately every other thing is being ignored (e.g. a == '' would be easy to
check for -> a is a string). There's big potential in these checks.
"""
from itertools import chain

from jedi._compatibility import unicode
from jedi.parser import tree
from jedi import debug
from jedi import common
from jedi.common import unite
from jedi import settings
from jedi.evaluate import representation as er
from jedi.evaluate import dynamic
from jedi.evaluate import compiled
from jedi.evaluate import docstrings
from jedi.evaluate import pep0484
from jedi.evaluate import iterable
from jedi.evaluate import imports
from jedi.evaluate import analysis
from jedi.evaluate import flow_analysis
from jedi.evaluate import param
from jedi.evaluate import helpers
from jedi.evaluate.cache import memoize_default


def filter_after_position(names, position):
    """
    Removes all names after a certain position. If position is None, just
    returns the names list.
    """
    if position is None:
        return names

    names_new = []
    for n in names:
        # Filter positions and also allow list comprehensions and lambdas.
        if n.start_pos[0] is not None and n.start_pos < position \
                or isinstance(n.get_definition(), (tree.CompFor, tree.Lambda)):
            names_new.append(n)
    return names_new


def filter_definition_names(names, origin, position=None):
    """
    Filter names that are actual definitions in a scope. Names that are just
    used will be ignored.
    """
    if not names:
        return []

    # Just calculate the scope from the first
    stmt = names[0].get_definition()
    scope = stmt.get_parent_scope()

    if not (isinstance(scope, er.FunctionExecution) and
            isinstance(scope.base, er.LambdaWrapper)):
        names = filter_after_position(names, position)
    names = [name for name in names if name.is_definition()]

    # Private name mangling (compile.c) disallows access on names
    # preceeded by two underscores `__` if used outside of the class. Names
    # that also end with two underscores (e.g. __id__) are not affected.
    for name in list(names):
        if name.value.startswith('__') and not name.value.endswith('__'):
            if filter_private_variable(scope, origin):
                names.remove(name)
    return names


class NameFinder(object):
    def __init__(self, evaluator, scope, name_str, position=None):
        self._evaluator = evaluator
        # Make sure that it's not just a syntax tree node.
        self.scope = evaluator.wrap(scope)
        self.name_str = name_str
        self.position = position
        self._found_predefined_if_name = None

    @debug.increase_indent
    def find(self, scopes, attribute_lookup):
        """
        :params bool attribute_lookup: Tell to logic if we're accessing the
            attribute or the contents of e.g. a function.
        """
        # TODO rename scopes to names_dicts

        names = self.filter_name(scopes)
        if self._found_predefined_if_name is not None:
            return self._found_predefined_if_name

        types = self._names_to_types(names, attribute_lookup)

        if not names and not types \
                and not (isinstance(self.name_str, tree.Name) and
                         isinstance(self.name_str.parent.parent, tree.Param)):
            if not isinstance(self.name_str, (str, unicode)):  # TODO Remove?
                if attribute_lookup:
                    analysis.add_attribute_error(self._evaluator,
                                                 self.scope, self.name_str)
                else:
                    message = ("NameError: name '%s' is not defined."
                               % self.name_str)
                    analysis.add(self._evaluator, 'name-error', self.name_str,
                                 message)

        debug.dbg('finder._names_to_types: %s -> %s', names, types)
        return types

    def scopes(self, search_global=False):
        if search_global:
            return global_names_dict_generator(self._evaluator, self.scope, self.position)
        else:
            return ((n, None) for n in self.scope.names_dicts(search_global))

    def names_dict_lookup(self, names_dict, position):
        def get_param(scope, el):
            if isinstance(el.get_parent_until(tree.Param), tree.Param):
                return scope.param_by_name(str(el))
            return el

        search_str = str(self.name_str)
        try:
            names = names_dict[search_str]
            if not names:  # We want names, otherwise stop.
                return []
        except KeyError:
            return []

        names = filter_definition_names(names, self.name_str, position)

        name_scope = None
        # Only the names defined in the last position are valid definitions.
        last_names = []
        for name in reversed(sorted(names, key=lambda name: name.start_pos)):
            stmt = name.get_definition()
            name_scope = self._evaluator.wrap(stmt.get_parent_scope())

            if isinstance(self.scope, er.Instance) and not isinstance(name_scope, er.Instance):
                # Instances should not be checked for positioning, because we
                # don't know in which order the functions are called.
                last_names.append(name)
                continue

            if isinstance(name_scope, compiled.CompiledObject):
                # Let's test this. TODO need comment. shouldn't this be
                # filtered before?
                last_names.append(name)
                continue

            if isinstance(stmt, er.ModuleWrapper):
                # In case of REPL completion, we can infer modules names that
                # don't really have a definition (because they are really just
                # namespaces). In this case we can just add it.
                last_names.append(name)
                continue

            if isinstance(name, compiled.CompiledName) \
                    or isinstance(name, er.InstanceName) and isinstance(name._origin_name, compiled.CompiledName):
                last_names.append(name)
                continue

            if isinstance(self.name_str, tree.Name):
                origin_scope = self.name_str.get_parent_until(tree.Scope, reverse=True)
                scope = self.name_str
                check = None
                while True:
                    scope = scope.parent
                    if scope.type in ("if_stmt", "for_stmt", "comp_for"):
                        try:
                            name_dict = self._evaluator.predefined_if_name_dict_dict[scope]
                            types = set(name_dict[str(self.name_str)])
                        except KeyError:
                            continue
                        else:
                            if self.name_str.start_pos < scope.children[1].end_pos:
                                # It doesn't make any sense to check if
                                # statements in the if statement itself, just
                                # deliver types.
                                self._found_predefined_if_name = types
                            else:
                                check = flow_analysis.break_check(self._evaluator, self.scope,
                                                                  origin_scope)
                                if check is flow_analysis.UNREACHABLE:
                                    self._found_predefined_if_name = set()
                                else:
                                    self._found_predefined_if_name = types
                            break
                    if isinstance(scope, tree.IsScope) or scope is None:
                        break
            else:
                origin_scope = None

            if isinstance(stmt.parent, compiled.CompiledObject):
                # TODO seriously? this is stupid.
                continue
            check = flow_analysis.break_check(self._evaluator, name_scope,
                                              stmt, origin_scope)
            if check is not flow_analysis.UNREACHABLE:
                last_names.append(name)

            if check is flow_analysis.REACHABLE:
                break

        if isinstance(name_scope, er.FunctionExecution):
            # Replace params
            return [get_param(name_scope, n) for n in last_names]
        return last_names

    def filter_name(self, names_dicts):
        """
        Searches names that are defined in a scope (the different
        `names_dicts`), until a name fits.
        """
        names = []
        for names_dict, position in names_dicts:
            names = self.names_dict_lookup(names_dict, position)
            if names:
                break

        debug.dbg('finder.filter_name "%s" in (%s): %s@%s', self.name_str,
                  self.scope, names, self.position)
        return list(self._clean_names(names))

    def _clean_names(self, names):
        """
        ``NameFinder.filter_name`` should only output names with correct
        wrapper parents. We don't want to see AST classes out in the
        evaluation, so remove them already here!
        """
        for n in names:
            definition = n.parent
            if isinstance(definition, (compiled.CompiledObject,
                iterable.BuiltinMethod)):
                # TODO this if should really be removed by changing the type of
                #      those classes.
                yield n
            elif definition.type in ('funcdef', 'classdef', 'file_input'):
                yield self._evaluator.wrap(definition).name
            else:
                yield n

    def _check_getattr(self, inst):
        """Checks for both __getattr__ and __getattribute__ methods"""
        result = set()
        # str is important, because it shouldn't be `Name`!
        name = compiled.create(self._evaluator, str(self.name_str))
        with common.ignored(KeyError):
            result = inst.execute_subscope_by_name('__getattr__', name)
        if not result:
            # This is a little bit special. `__getattribute__` is in Python
            # executed before `__getattr__`. But: I know no use case, where
            # this could be practical and where jedi would return wrong types.
            # If you ever find something, let me know!
            # We are inversing this, because a hand-crafted `__getattribute__`
            # could still call another hand-crafted `__getattr__`, but not the
            # other way around.
            with common.ignored(KeyError):
                result = inst.execute_subscope_by_name('__getattribute__', name)
        return result

    def _names_to_types(self, names, attribute_lookup):
        types = set()

        # Add isinstance and other if/assert knowledge.
        if isinstance(self.name_str, tree.Name):
            # Ignore FunctionExecution parents for now.
            flow_scope = self.name_str
            until = flow_scope.get_parent_until(er.FunctionExecution)
            while not isinstance(until, er.FunctionExecution):
                flow_scope = flow_scope.get_parent_scope(include_flows=True)
                if flow_scope is None:
                    break
                # TODO check if result is in scope -> no evaluation necessary
                n = check_flow_information(self._evaluator, flow_scope,
                                           self.name_str, self.position)
                if n:
                    return n

        for name in names:
            new_types = _name_to_types(self._evaluator, name, self.scope)
            if isinstance(self.scope, (er.Class, er.Instance)) and attribute_lookup:
                types |= set(self._resolve_descriptors(name, new_types))
            else:
                types |= set(new_types)
        if not names and isinstance(self.scope, er.Instance):
            # handling __getattr__ / __getattribute__
            return self._check_getattr(self.scope)

        return types

    def _resolve_descriptors(self, name, types):
        # The name must not be in the dictionary, but part of the class
        # definition. __get__ is only called if the descriptor is defined in
        # the class dictionary.
        name_scope = name.get_definition().get_parent_scope()
        if not isinstance(name_scope, (er.Instance, tree.Class)):
            return types

        result = set()
        for r in types:
            try:
                desc_return = r.get_descriptor_returns
            except AttributeError:
                result.add(r)
            else:
                result |= desc_return(self.scope)
        return result


def _get_global_stmt_scopes(evaluator, global_stmt, name):
    global_stmt_scope = global_stmt.get_parent_scope()
    module = global_stmt_scope.get_parent_until()
    for used_name in module.used_names[str(name)]:
        if used_name.parent.type == 'global_stmt':
            yield evaluator.wrap(used_name.get_parent_scope())


@memoize_default(set(), evaluator_is_first_arg=True)
def _name_to_types(evaluator, name, scope):
    types = []
    typ = name.get_definition()
    if typ.isinstance(tree.ForStmt):
        types = pep0484.find_type_from_comment_hint_for(evaluator, typ, name)
        if types:
            return types
    if typ.isinstance(tree.WithStmt):
        types = pep0484.find_type_from_comment_hint_with(evaluator, typ, name)
        if types:
            return types
    if typ.isinstance(tree.ForStmt, tree.CompFor):
        container_types = evaluator.eval_element(typ.children[3])
        for_types = iterable.py__iter__types(evaluator, container_types, typ.children[3])
        types = check_tuple_assignments(evaluator, for_types, name)
    elif isinstance(typ, tree.Param):
        types = _eval_param(evaluator, typ, scope)
    elif typ.isinstance(tree.ExprStmt):
        types = _remove_statements(evaluator, typ, name)
    elif typ.isinstance(tree.WithStmt):
        types = evaluator.eval_element(typ.node_from_name(name))
    elif isinstance(typ, tree.Import):
        types = imports.ImportWrapper(evaluator, name).follow()
    elif typ.type == 'global_stmt':
        for s in _get_global_stmt_scopes(evaluator, typ, name):
            finder = NameFinder(evaluator, s, str(name))
            names_dicts = finder.scopes(search_global=True)
            # For global_stmt lookups, we only need the first possible scope,
            # which means the function itself.
            names_dicts = [next(names_dicts)]
            types += finder.find(names_dicts, attribute_lookup=False)
    elif isinstance(typ, tree.TryStmt):
        # TODO an exception can also be a tuple. Check for those.
        # TODO check for types that are not classes and add it to
        # the static analysis report.
        exceptions = evaluator.eval_element(name.get_previous_sibling().get_previous_sibling())
        types = set(chain.from_iterable(evaluator.execute(t) for t in exceptions))
    else:
        if typ.isinstance(er.Function):
            typ = typ.get_decorated_func()
        types = set([typ])
    return types


def _remove_statements(evaluator, stmt, name):
    """
    This is the part where statements are being stripped.

    Due to lazy evaluation, statements like a = func; b = a; b() have to be
    evaluated.
    """
    types = set()
    # Remove the statement docstr stuff for now, that has to be
    # implemented with the evaluator class.
    #if stmt.docstr:
        #res_new.append(stmt)

    check_instance = None
    if isinstance(stmt, er.InstanceElement) and stmt.is_class_var:
        check_instance = stmt.instance
        stmt = stmt.var

    pep0484types = \
        pep0484.find_type_from_comment_hint_assign(evaluator, stmt, name)
    if pep0484types:
        return pep0484types
    types |= evaluator.eval_statement(stmt, seek_name=name)

    if check_instance is not None:
        # class renames
        types = set([er.get_instance_el(evaluator, check_instance, a, True)
                     if isinstance(a, (er.Function, tree.Function))
                     else a for a in types])
    return types


def _eval_param(evaluator, param, scope):
    res_new = set()
    func = param.get_parent_scope()

    cls = func.parent.get_parent_until((tree.Class, tree.Function))

    from jedi.evaluate.param import ExecutedParam, Arguments
    if isinstance(cls, tree.Class) and param.position_nr == 0 \
            and not isinstance(param, ExecutedParam):
        # This is where we add self - if it has never been
        # instantiated.
        if isinstance(scope, er.InstanceElement):
            res_new.add(scope.instance)
        else:
            inst = er.Instance(evaluator, evaluator.wrap(cls),
                               Arguments(evaluator, ()), is_generated=True)
            res_new.add(inst)
        return res_new

    # Instances are typically faked, if the instance is not called from
    # outside. Here we check it for __init__ functions and return.
    if isinstance(func, er.InstanceElement) \
            and func.instance.is_generated and str(func.name) == '__init__':
        param = func.var.params[param.position_nr]

    # Add pep0484 and docstring knowledge.
    pep0484_hints = pep0484.follow_param(evaluator, param)
    doc_params = docstrings.follow_param(evaluator, param)
    if pep0484_hints or doc_params:
        return list(set(pep0484_hints) | set(doc_params))

    if isinstance(param, ExecutedParam):
        return res_new | param.eval(evaluator)
    else:
        # Param owns no information itself.
        res_new |= dynamic.search_params(evaluator, param)
        if not res_new:
            if param.stars:
                t = 'tuple' if param.stars == 1 else 'dict'
                typ = list(evaluator.find_types(evaluator.BUILTINS, t))[0]
                res_new = evaluator.execute(typ)
        if param.default:
            res_new |= evaluator.eval_element(param.default)
        return res_new


def check_flow_information(evaluator, flow, search_name, pos):
    """ Try to find out the type of a variable just with the information that
    is given by the flows: e.g. It is also responsible for assert checks.::

        if isinstance(k, str):
            k.  # <- completion here

    ensures that `k` is a string.
    """
    if not settings.dynamic_flow_information:
        return None

    result = set()
    if flow.is_scope():
        # Check for asserts.
        try:
            names = reversed(flow.names_dict[search_name.value])
        except (KeyError, AttributeError):
            names = []

        for name in names:
            ass = name.get_parent_until(tree.AssertStmt)
            if isinstance(ass, tree.AssertStmt) and pos is not None and ass.start_pos < pos:
                result = _check_isinstance_type(evaluator, ass.assertion(), search_name)
                if result:
                    break

    if isinstance(flow, (tree.IfStmt, tree.WhileStmt)):
        potential_ifs = [c for c in flow.children[1::4] if c != ':']
        for if_test in reversed(potential_ifs):
            if search_name.start_pos > if_test.end_pos:
                return _check_isinstance_type(evaluator, if_test, search_name)
    return result


def _check_isinstance_type(evaluator, element, search_name):
    try:
        assert element.type in ('power', 'atom_expr')
        # this might be removed if we analyze and, etc
        assert len(element.children) == 2
        first, trailer = element.children
        assert isinstance(first, tree.Name) and first.value == 'isinstance'
        assert trailer.type == 'trailer' and trailer.children[0] == '('
        assert len(trailer.children) == 3

        # arglist stuff
        arglist = trailer.children[1]
        args = param.Arguments(evaluator, arglist, trailer)
        lst = list(args.unpack())
        # Disallow keyword arguments
        assert len(lst) == 2 and lst[0][0] is None and lst[1][0] is None
        name = lst[0][1][0]  # first argument, values, first value
        # Do a simple get_code comparison. They should just have the same code,
        # and everything will be all right.
        classes = lst[1][1][0]
        call = helpers.call_of_leaf(search_name)
        assert name.get_code(normalized=True) == call.get_code(normalized=True)
    except AssertionError:
        return set()

    result = set()
    for cls_or_tup in evaluator.eval_element(classes):
        if isinstance(cls_or_tup, iterable.Array) and cls_or_tup.type == 'tuple':
            for typ in unite(cls_or_tup.py__iter__()):
                result |= evaluator.execute(typ)
        else:
            result |= evaluator.execute(cls_or_tup)
    return result


def global_names_dict_generator(evaluator, scope, position):
    """
    For global name lookups. Yields tuples of (names_dict, position). If the
    position is None, the position does not matter anymore in that scope.

    This function is used to include names from outer scopes. For example, when
    the current scope is function:

    >>> from jedi._compatibility import u, no_unicode_pprint
    >>> from jedi.parser import ParserWithRecovery, load_grammar
    >>> parser = ParserWithRecovery(load_grammar(), u('''
    ... x = ['a', 'b', 'c']
    ... def func():
    ...     y = None
    ... '''))
    >>> scope = parser.module.subscopes[0]
    >>> scope
    <Function: func@3-5>

    `global_names_dict_generator` is a generator.  First it yields names from
    most inner scope.

    >>> from jedi.evaluate import Evaluator
    >>> evaluator = Evaluator(load_grammar())
    >>> scope = evaluator.wrap(scope)
    >>> pairs = list(global_names_dict_generator(evaluator, scope, (4, 0)))
    >>> no_unicode_pprint(pairs[0])
    ({'func': [], 'y': [<Name: y@4,4>]}, (4, 0))

    Then it yields the names from one level "lower". In this example, this
    is the most outer scope. As you can see, the position in the tuple is now
    None, because typically the whole module is loaded before the function is
    called.

    >>> no_unicode_pprint(pairs[1])
    ({'func': [<Name: func@3,4>], 'x': [<Name: x@2,0>]}, None)

    After that we have a few underscore names that are part of the module.

    >>> sorted(pairs[2][0].keys())
    ['__doc__', '__file__', '__name__', '__package__']
    >>> pairs[3]  # global names -> there are none in our example.
    ({}, None)
    >>> pairs[4]  # package modules -> Also none.
    ({}, None)

    Finally, it yields names from builtin, if `include_builtin` is
    true (default).

    >>> pairs[5][0].values()                              #doctest: +ELLIPSIS
    [[<CompiledName: ...>], ...]
    """
    in_func = False
    while scope is not None:
        if not (scope.type == 'classdef' and in_func):
            # Names in methods cannot be resolved within the class.

            for names_dict in scope.names_dicts(True):
                yield names_dict, position
                if hasattr(scope, 'resets_positions'):
                    # TODO This is so ugly, seriously. However there's
                    #      currently no good way of influencing
                    #      global_names_dict_generator when it comes to certain
                    #      objects.
                    position = None
            if scope.type == 'funcdef':
                # The position should be reset if the current scope is a function.
                in_func = True
                position = None
        scope = evaluator.wrap(scope.get_parent_scope())

    # Add builtins to the global scope.
    for names_dict in evaluator.BUILTINS.names_dicts(True):
        yield names_dict, None


def check_tuple_assignments(evaluator, types, name):
    """
    Checks if tuples are assigned.
    """
    for index, node in name.assignment_indexes():
        iterated = iterable.py__iter__(evaluator, types, node)
        for _ in range(index + 1):
            try:
                types = next(iterated)
            except StopIteration:
                # We could do this with the default param in next. But this
                # would allow this loop to run for a very long time if the
                # index number is high. Therefore break if the loop is
                # finished.
                types = set()
                break
    return types


def filter_private_variable(scope, origin_node):
    """Check if a variable is defined inside the same class or outside."""
    instance = scope.get_parent_scope()
    coming_from = origin_node
    while coming_from is not None \
            and not isinstance(coming_from, (tree.Class, compiled.CompiledObject)):
        coming_from = coming_from.get_parent_scope()

    # CompiledObjects don't have double underscore attributes, but Jedi abuses
    # those for fakes (builtins.pym -> list).
    if isinstance(instance, compiled.CompiledObject):
        return instance != coming_from
    else:
        return isinstance(instance, er.Instance) and instance.base.base != coming_from
