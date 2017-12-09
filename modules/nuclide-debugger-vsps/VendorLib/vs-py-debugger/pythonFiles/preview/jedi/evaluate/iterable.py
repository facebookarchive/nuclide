"""
Contains all classes and functions to deal with lists, dicts, generators and
iterators in general.

Array modifications
*******************

If the content of an array (``set``/``list``) is requested somewhere, the
current module will be checked for appearances of ``arr.append``,
``arr.insert``, etc.  If the ``arr`` name points to an actual array, the
content will be added

This can be really cpu intensive, as you can imagine. Because |jedi| has to
follow **every** ``append`` and check wheter it's the right array. However this
works pretty good, because in *slow* cases, the recursion detector and other
settings will stop this process.

It is important to note that:

1. Array modfications work only in the current module.
2. Jedi only checks Array additions; ``list.pop``, etc are ignored.
"""
from jedi.common import unite, safe_property
from jedi import debug
from jedi import settings
from jedi._compatibility import use_metaclass, unicode, zip_longest
from jedi.parser import tree
from jedi.evaluate import compiled
from jedi.evaluate import helpers
from jedi.evaluate.cache import CachedMetaClass, memoize_default
from jedi.evaluate import analysis
from jedi.evaluate import pep0484
from jedi import common


class IterableWrapper(tree.Base):
    def is_class(self):
        return False

    @memoize_default()
    def _get_names_dict(self, names_dict):
        builtin_methods = {}
        for cls in reversed(type(self).mro()):
            try:
                builtin_methods.update(cls.builtin_methods)
            except AttributeError:
                pass

        if not builtin_methods:
            return names_dict

        dct = {}
        for names in names_dict.values():
            for name in names:
                name_str = name.value
                try:
                    method = builtin_methods[name_str, self.type]
                except KeyError:
                    dct[name_str] = [name]
                else:
                    parent = BuiltinMethod(self, method, name.parent)
                    dct[name_str] = [helpers.FakeName(name_str, parent, is_definition=True)]
        return dct


class BuiltinMethod(IterableWrapper):
    """``Generator.__next__`` ``dict.values`` methods and so on."""
    def __init__(self, builtin, method, builtin_func):
        self._builtin = builtin
        self._method = method
        self._builtin_func = builtin_func

    def py__call__(self, params):
        return self._method(self._builtin)

    def __getattr__(self, name):
        return getattr(self._builtin_func, name)


def has_builtin_methods(cls):
    cls.builtin_methods = {}
    for func in cls.__dict__.values():
        try:
            cls.builtin_methods.update(func.registered_builtin_methods)
        except AttributeError:
            pass
    return cls


def register_builtin_method(method_name, type=None):
    def wrapper(func):
        dct = func.__dict__.setdefault('registered_builtin_methods', {})
        dct[method_name, type] = func
        return func
    return wrapper


@has_builtin_methods
class GeneratorMixin(object):
    type = None

    @register_builtin_method('send')
    @register_builtin_method('next')
    @register_builtin_method('__next__')
    def py__next__(self):
        # TODO add TypeError if params are given.
        return unite(self.py__iter__())

    @memoize_default()
    def names_dicts(self, search_global=False):  # is always False
        gen_obj = compiled.get_special_object(self._evaluator, 'GENERATOR_OBJECT')
        yield self._get_names_dict(gen_obj.names_dict)

    def py__bool__(self):
        return True

    def py__class__(self):
        gen_obj = compiled.get_special_object(self._evaluator, 'GENERATOR_OBJECT')
        return gen_obj.py__class__()


class Generator(use_metaclass(CachedMetaClass, IterableWrapper, GeneratorMixin)):
    """Handling of `yield` functions."""

    def __init__(self, evaluator, func, var_args):
        super(Generator, self).__init__()
        self._evaluator = evaluator
        self.func = func
        self.var_args = var_args

    def py__iter__(self):
        from jedi.evaluate.representation import FunctionExecution
        f = FunctionExecution(self._evaluator, self.func, self.var_args)
        return f.get_yield_types()

    def __getattr__(self, name):
        if name not in ['start_pos', 'end_pos', 'parent', 'get_imports',
                        'doc', 'docstr', 'get_parent_until',
                        'get_code', 'subscopes']:
            raise AttributeError("Accessing %s of %s is not allowed."
                                 % (self, name))
        return getattr(self.func, name)

    def __repr__(self):
        return "<%s of %s>" % (type(self).__name__, self.func)


class Comprehension(IterableWrapper):
    @staticmethod
    def from_atom(evaluator, atom):
        bracket = atom.children[0]
        if bracket == '{':
            if atom.children[1].children[1] == ':':
                cls = DictComprehension
            else:
                cls = SetComprehension
        elif bracket == '(':
            cls = GeneratorComprehension
        elif bracket == '[':
            cls = ListComprehension
        return cls(evaluator, atom)

    def __init__(self, evaluator, atom):
        self._evaluator = evaluator
        self._atom = atom

    def _get_comprehension(self):
        # The atom contains a testlist_comp
        return self._atom.children[1]

    def _get_comp_for(self):
        # The atom contains a testlist_comp
        return self._get_comprehension().children[1]

    @memoize_default()
    def _eval_node(self, index=0):
        """
        The first part `x + 1` of the list comprehension:

            [x + 1 for x in foo]
        """
        comp_for = self._get_comp_for()
        # For nested comprehensions we need to search the last one.
        from jedi.evaluate.representation import InstanceElement
        node = self._get_comprehension().children[index]
        if isinstance(node, InstanceElement):
            # This seems to be a strange case that I haven't found a way to
            # write tests against. However since it's my new goal to get rid of
            # InstanceElement anyway, I don't care.
            node = node.var
        last_comp = list(comp_for.get_comp_fors())[-1]
        return helpers.deep_ast_copy(node, parent=last_comp)

    def _nested(self, comp_fors):
        evaluator = self._evaluator
        comp_for = comp_fors[0]
        input_node = comp_for.children[3]
        input_types = evaluator.eval_element(input_node)

        iterated = py__iter__(evaluator, input_types, input_node)
        exprlist = comp_for.children[1]
        for i, types in enumerate(iterated):
            evaluator.predefined_if_name_dict_dict[comp_for] = \
                unpack_tuple_to_dict(evaluator, types, exprlist)
            try:
                for result in self._nested(comp_fors[1:]):
                    yield result
            except IndexError:
                iterated = evaluator.eval_element(self._eval_node())
                if self.type == 'dict':
                    yield iterated, evaluator.eval_element(self._eval_node(2))
                else:
                    yield iterated
            finally:
                del evaluator.predefined_if_name_dict_dict[comp_for]

    @memoize_default(default=[])
    @common.to_list
    def _iterate(self):
        comp_fors = tuple(self._get_comp_for().get_comp_fors())
        for result in self._nested(comp_fors):
            yield result

    def py__iter__(self):
        return self._iterate()

    def __repr__(self):
        return "<%s of %s>" % (type(self).__name__, self._atom)


@has_builtin_methods
class ArrayMixin(object):
    @memoize_default()
    def names_dicts(self, search_global=False):  # Always False.
        # `array.type` is a string with the type, e.g. 'list'.
        scope = compiled.builtin_from_name(self._evaluator, self.type)
        # builtins only have one class -> [0]
        scopes = self._evaluator.execute_evaluated(scope, self)
        names_dicts = list(scopes)[0].names_dicts(search_global)
        #yield names_dicts[0]
        yield self._get_names_dict(names_dicts[1])

    def py__bool__(self):
        return None  # We don't know the length, because of appends.

    def py__class__(self):
        return compiled.builtin_from_name(self._evaluator, self.type)

    @safe_property
    def parent(self):
        return self._evaluator.BUILTINS

    @property
    def name(self):
        return FakeSequence(self._evaluator, [], self.type).name

    @memoize_default()
    def dict_values(self):
        return unite(self._evaluator.eval_element(v) for k, v in self._items())

    @register_builtin_method('values', type='dict')
    def _imitate_values(self):
        items = self.dict_values()
        return create_evaluated_sequence_set(self._evaluator, items, sequence_type='list')
        #return set([FakeSequence(self._evaluator, [AlreadyEvaluated(items)], 'tuple')])

    @register_builtin_method('items', type='dict')
    def _imitate_items(self):
        items = [set([FakeSequence(self._evaluator, (k, v), 'tuple')])
                 for k, v in self._items()]

        return create_evaluated_sequence_set(self._evaluator, *items, sequence_type='list')


class ListComprehension(Comprehension, ArrayMixin):
    type = 'list'

    def py__getitem__(self, index):
        all_types = list(self.py__iter__())
        result = all_types[index]
        if isinstance(index, slice):
            return create_evaluated_sequence_set(
                self._evaluator,
                unite(result),
                sequence_type='list'
            )
        return result


class SetComprehension(Comprehension, ArrayMixin):
    type = 'set'


@has_builtin_methods
class DictComprehension(Comprehension, ArrayMixin):
    type = 'dict'

    def _get_comp_for(self):
        return self._get_comprehension().children[3]

    def py__iter__(self):
        for keys, values in self._iterate():
            yield keys

    def py__getitem__(self, index):
        for keys, values in self._iterate():
            for k in keys:
                if isinstance(k, compiled.CompiledObject):
                    if k.obj == index:
                        return values
        return self.dict_values()

    def dict_values(self):
        return unite(values for keys, values in self._iterate())

    @register_builtin_method('items', type='dict')
    def _imitate_items(self):
        items = set(FakeSequence(self._evaluator,
                    (AlreadyEvaluated(keys), AlreadyEvaluated(values)), 'tuple')
                    for keys, values in self._iterate())

        return create_evaluated_sequence_set(self._evaluator, items, sequence_type='list')


class GeneratorComprehension(Comprehension, GeneratorMixin):
    pass


class Array(IterableWrapper, ArrayMixin):
    mapping = {'(': 'tuple',
               '[': 'list',
               '{': 'dict'}

    def __init__(self, evaluator, atom):
        self._evaluator = evaluator
        self.atom = atom
        self.type = Array.mapping[atom.children[0]]
        """The builtin name of the array (list, set, tuple or dict)."""

        c = self.atom.children
        array_node = c[1]
        if self.type == 'dict' and array_node != '}' \
                and (not hasattr(array_node, 'children')
                     or ':' not in array_node.children):
            self.type = 'set'

    @property
    def name(self):
        return helpers.FakeName(self.type, parent=self)

    def py__getitem__(self, index):
        """Here the index is an int/str. Raises IndexError/KeyError."""
        if self.type == 'dict':
            for key, value in self._items():
                for k in self._evaluator.eval_element(key):
                    if isinstance(k, compiled.CompiledObject) \
                            and index == k.obj:
                        return self._evaluator.eval_element(value)
            raise KeyError('No key found in dictionary %s.' % self)

        # Can raise an IndexError
        if isinstance(index, slice):
            return set([self])
        else:
            return self._evaluator.eval_element(self._items()[index])

    def __getattr__(self, name):
        if name not in ['start_pos', 'get_only_subelement', 'parent',
                        'get_parent_until', 'items']:
            raise AttributeError('Strange access on %s: %s.' % (self, name))
        return getattr(self.atom, name)

    # @memoize_default()
    def py__iter__(self):
        """
        While values returns the possible values for any array field, this
        function returns the value for a certain index.
        """
        if self.type == 'dict':
            # Get keys.
            types = set()
            for k, _ in self._items():
                types |= self._evaluator.eval_element(k)
            # We don't know which dict index comes first, therefore always
            # yield all the types.
            for _ in types:
                yield types
        else:
            for value in self._items():
                yield self._evaluator.eval_element(value)

            additions = check_array_additions(self._evaluator, self)
            if additions:
                yield additions

    def _values(self):
        """Returns a list of a list of node."""
        if self.type == 'dict':
            return unite(v for k, v in self._items())
        else:
            return self._items()

    def _items(self):
        c = self.atom.children
        array_node = c[1]
        if array_node in (']', '}', ')'):
            return []  # Direct closing bracket, doesn't contain items.

        if tree.is_node(array_node, 'testlist_comp'):
            return array_node.children[::2]
        elif tree.is_node(array_node, 'dictorsetmaker'):
            kv = []
            iterator = iter(array_node.children)
            for key in iterator:
                op = next(iterator, None)
                if op is None or op == ',':
                    kv.append(key)  # A set.
                else:
                    assert op == ':'  # A dict.
                    kv.append((key, next(iterator)))
                    next(iterator, None)  # Possible comma.
            return kv
        else:
            return [array_node]

    def __repr__(self):
        return "<%s of %s>" % (type(self).__name__, self.atom)


class _FakeArray(Array):
    def __init__(self, evaluator, container, type):
        self.type = type
        self._evaluator = evaluator
        self.atom = container


class ImplicitTuple(_FakeArray):
    def __init__(self, evaluator, testlist):
        super(ImplicitTuple, self).__init__(evaluator, testlist, 'tuple')
        self._testlist = testlist

    def _items(self):
        return self._testlist.children[::2]


class FakeSequence(_FakeArray):
    def __init__(self, evaluator, sequence_values, type):
        """
        type should be one of "tuple", "list"
        """
        super(FakeSequence, self).__init__(evaluator, sequence_values, type)
        self._sequence_values = sequence_values

    def _items(self):
        return self._sequence_values


def create_evaluated_sequence_set(evaluator, *types_order, **kwargs):
    """
    ``sequence_type`` is a named argument, that doesn't work in Python2. For backwards
    compatibility reasons, we're now using kwargs.
    """
    sequence_type = kwargs.pop('sequence_type')
    assert not kwargs

    sets = tuple(AlreadyEvaluated(types) for types in types_order)
    return set([FakeSequence(evaluator, sets, sequence_type)])


class AlreadyEvaluated(frozenset):
    """A simple container to add already evaluated objects to an array."""
    def get_code(self, normalized=False):
        # For debugging purposes.
        return str(self)


class MergedNodes(frozenset):
    pass


class FakeDict(_FakeArray):
    def __init__(self, evaluator, dct):
        super(FakeDict, self).__init__(evaluator, dct, 'dict')
        self._dct = dct

    def py__iter__(self):
        yield set(compiled.create(self._evaluator, key) for key in self._dct)

    def py__getitem__(self, index):
        return unite(self._evaluator.eval_element(v) for v in self._dct[index])

    def _items(self):
        for key, values in self._dct.items():
            # TODO this is not proper. The values could be multiple values?!
            yield key, values[0]


class MergedArray(_FakeArray):
    def __init__(self, evaluator, arrays):
        super(MergedArray, self).__init__(evaluator, arrays, arrays[-1].type)
        self._arrays = arrays

    def py__iter__(self):
        for array in self._arrays:
            for types in array.py__iter__():
                yield types

    def py__getitem__(self, index):
        return unite(self.py__iter__())

    def _items(self):
        for array in self._arrays:
            for a in array._items():
                yield a

    def __len__(self):
        return sum(len(a) for a in self._arrays)


def unpack_tuple_to_dict(evaluator, types, exprlist):
    """
    Unpacking tuple assignments in for statements and expr_stmts.
    """
    if exprlist.type == 'name':
        return {exprlist.value: types}
    elif exprlist.type == 'atom' and exprlist.children[0] in '([':
        return unpack_tuple_to_dict(evaluator, types, exprlist.children[1])
    elif exprlist.type in ('testlist', 'testlist_comp', 'exprlist',
                           'testlist_star_expr'):
        dct = {}
        parts = iter(exprlist.children[::2])
        n = 0
        for iter_types in py__iter__(evaluator, types, exprlist):
            n += 1
            try:
                part = next(parts)
            except StopIteration:
                analysis.add(evaluator, 'value-error-too-many-values', part,
                             message="ValueError: too many values to unpack (expected %s)" % n)
            else:
                dct.update(unpack_tuple_to_dict(evaluator, iter_types, part))
        has_parts = next(parts, None)
        if types and has_parts is not None:
            analysis.add(evaluator, 'value-error-too-few-values', has_parts,
                         message="ValueError: need more than %s values to unpack" % n)
        return dct
    elif exprlist.type == 'power' or exprlist.type == 'atom_expr':
        # Something like ``arr[x], var = ...``.
        # This is something that is not yet supported, would also be difficult
        # to write into a dict.
        return {}
    elif exprlist.type == 'star_expr':  # `a, *b, c = x` type unpackings
        # Currently we're not supporting them.
        return {}
    raise NotImplementedError


def py__iter__(evaluator, types, node=None):
    debug.dbg('py__iter__')
    type_iters = []
    for typ in types:
        try:
            iter_method = typ.py__iter__
        except AttributeError:
            if node is not None:
                analysis.add(evaluator, 'type-error-not-iterable', node,
                             message="TypeError: '%s' object is not iterable" % typ)
        else:
            type_iters.append(iter_method())
            #for result in iter_method():
                #yield result

    for t in zip_longest(*type_iters, fillvalue=set()):
        yield unite(t)


def py__iter__types(evaluator, types, node=None):
    """
    Calls `py__iter__`, but ignores the ordering in the end and just returns
    all types that it contains.
    """
    return unite(py__iter__(evaluator, types, node))


def py__getitem__(evaluator, types, trailer):
    from jedi.evaluate.representation import Class
    result = set()

    trailer_op, node, trailer_cl = trailer.children
    assert trailer_op == "["
    assert trailer_cl == "]"

    # special case: PEP0484 typing module, see
    # https://github.com/davidhalter/jedi/issues/663
    for typ in list(types):
        if isinstance(typ, Class):
            typing_module_types = \
                pep0484.get_types_for_typing_module(evaluator, typ, node)
            if typing_module_types is not None:
                types.remove(typ)
                result |= typing_module_types

    if not types:
        # all consumed by special cases
        return result

    for index in create_index_types(evaluator, node):
        if isinstance(index, (compiled.CompiledObject, Slice)):
            index = index.obj

        if type(index) not in (float, int, str, unicode, slice):
            # If the index is not clearly defined, we have to get all the
            # possiblities.
            for typ in list(types):
                if isinstance(typ, Array) and typ.type == 'dict':
                    types.remove(typ)
                    result |= typ.dict_values()
            return result | py__iter__types(evaluator, types)

        for typ in types:
            # The actual getitem call.
            try:
                getitem = typ.py__getitem__
            except AttributeError:
                analysis.add(evaluator, 'type-error-not-subscriptable', trailer_op,
                             message="TypeError: '%s' object is not subscriptable" % typ)
            else:
                try:
                    result |= getitem(index)
                except IndexError:
                    result |= py__iter__types(evaluator, set([typ]))
                except KeyError:
                    # Must be a dict. Lists don't raise KeyErrors.
                    result |= typ.dict_values()
    return result


def check_array_additions(evaluator, array):
    """ Just a mapper function for the internal _check_array_additions """
    if array.type not in ('list', 'set'):
        # TODO also check for dict updates
        return set()

    is_list = array.type == 'list'
    try:
        current_module = array.atom.get_parent_until()
    except AttributeError:
        # If there's no get_parent_until, it's a FakeSequence or another Fake
        # type. Those fake types are used inside Jedi's engine. No values may
        # be added to those after their creation.
        return set()
    return _check_array_additions(evaluator, array, current_module, is_list)


@memoize_default(default=set(), evaluator_is_first_arg=True)
@debug.increase_indent
def _check_array_additions(evaluator, compare_array, module, is_list):
    """
    Checks if a `Array` has "add" (append, insert, extend) statements:

    >>> a = [""]
    >>> a.append(1)
    """
    debug.dbg('Dynamic array search for %s' % compare_array, color='MAGENTA')
    if not settings.dynamic_array_additions or isinstance(module, compiled.CompiledObject):
        debug.dbg('Dynamic array search aborted.', color='MAGENTA')
        return set()

    def check_additions(arglist, add_name):
        params = list(param.Arguments(evaluator, arglist).unpack())
        result = set()
        if add_name in ['insert']:
            params = params[1:]
        if add_name in ['append', 'add', 'insert']:
            for key, nodes in params:
                result |= unite(evaluator.eval_element(node) for node in nodes)
        elif add_name in ['extend', 'update']:
            for key, nodes in params:
                for node in nodes:
                    types = evaluator.eval_element(node)
                    result |= py__iter__types(evaluator, types, node)
        return result

    from jedi.evaluate import representation as er, param

    def get_execution_parent(element):
        """ Used to get an Instance/FunctionExecution parent """
        if isinstance(element, Array):
            node = element.atom
        else:
            # Is an Instance with an
            # Arguments([AlreadyEvaluated([_ArrayInstance])]) inside
            # Yeah... I know... It's complicated ;-)
            node = list(element.var_args.argument_node[0])[0].var_args.trailer
        if isinstance(node, er.InstanceElement) or node is None:
            return node
        return node.get_parent_until(er.FunctionExecution)

    temp_param_add, settings.dynamic_params_for_other_modules = \
        settings.dynamic_params_for_other_modules, False

    search_names = ['append', 'extend', 'insert'] if is_list else ['add', 'update']
    comp_arr_parent = get_execution_parent(compare_array)

    added_types = set()
    for add_name in search_names:
        try:
            possible_names = module.used_names[add_name]
        except KeyError:
            continue
        else:
            for name in possible_names:
                # Check if the original scope is an execution. If it is, one
                # can search for the same statement, that is in the module
                # dict. Executions are somewhat special in jedi, since they
                # literally copy the contents of a function.
                if isinstance(comp_arr_parent, er.FunctionExecution):
                    if comp_arr_parent.start_pos < name.start_pos < comp_arr_parent.end_pos:
                        name = comp_arr_parent.name_for_position(name.start_pos)
                    else:
                        # Don't check definitions that are not defined in the
                        # same function. This is not "proper" anyway. It also
                        # improves Jedi's speed for array lookups, since we
                        # don't have to check the whole source tree anymore.
                        continue
                trailer = name.parent
                power = trailer.parent
                trailer_pos = power.children.index(trailer)
                try:
                    execution_trailer = power.children[trailer_pos + 1]
                except IndexError:
                    continue
                else:
                    if execution_trailer.type != 'trailer' \
                            or execution_trailer.children[0] != '(' \
                            or execution_trailer.children[1] == ')':
                        continue
                power = helpers.call_of_leaf(name, cut_own_trailer=True)
                # InstanceElements are special, because they don't get copied,
                # but have this wrapper around them.
                if isinstance(comp_arr_parent, er.InstanceElement):
                    power = er.get_instance_el(evaluator, comp_arr_parent.instance, power)

                if evaluator.recursion_detector.push_stmt(power):
                    # Check for recursion. Possible by using 'extend' in
                    # combination with function calls.
                    continue
                try:
                    if compare_array in evaluator.eval_element(power):
                        # The arrays match. Now add the results
                        added_types |= check_additions(execution_trailer.children[1], add_name)
                finally:
                    evaluator.recursion_detector.pop_stmt()
    # reset settings
    settings.dynamic_params_for_other_modules = temp_param_add
    debug.dbg('Dynamic array result %s' % added_types, color='MAGENTA')
    return added_types


def check_array_instances(evaluator, instance):
    """Used for set() and list() instances."""
    if not settings.dynamic_array_additions:
        return instance.var_args

    ai = _ArrayInstance(evaluator, instance)
    from jedi.evaluate import param
    return param.Arguments(evaluator, [AlreadyEvaluated([ai])])


class _ArrayInstance(IterableWrapper):
    """
    Used for the usage of set() and list().
    This is definitely a hack, but a good one :-)
    It makes it possible to use set/list conversions.

    In contrast to Array, ListComprehension and all other iterable types, this
    is something that is only used inside `evaluate/compiled/fake/builtins.py`
    and therefore doesn't need `names_dicts`, `py__bool__` and so on, because
    we don't use these operations in `builtins.py`.
    """
    def __init__(self, evaluator, instance):
        self._evaluator = evaluator
        self.instance = instance
        self.var_args = instance.var_args

    def py__iter__(self):
        try:
            _, first_nodes = next(self.var_args.unpack())
        except StopIteration:
            types = set()
        else:
            types = unite(self._evaluator.eval_element(node) for node in first_nodes)
            for types in py__iter__(self._evaluator, types, first_nodes[0]):
                yield types

        module = self.var_args.get_parent_until()
        if module is None:
            return
        is_list = str(self.instance.name) == 'list'
        additions = _check_array_additions(self._evaluator, self.instance, module, is_list)
        if additions:
            yield additions


class Slice(object):
    def __init__(self, evaluator, start, stop, step):
        self._evaluator = evaluator
        # all of them are either a Precedence or None.
        self._start = start
        self._stop = stop
        self._step = step

    @property
    def obj(self):
        """
        Imitate CompiledObject.obj behavior and return a ``builtin.slice()``
        object.
        """
        def get(element):
            if element is None:
                return None

            result = self._evaluator.eval_element(element)
            if len(result) != 1:
                # For simplicity, we want slices to be clear defined with just
                # one type.  Otherwise we will return an empty slice object.
                raise IndexError
            try:
                return list(result)[0].obj
            except AttributeError:
                return None

        try:
            return slice(get(self._start), get(self._stop), get(self._step))
        except IndexError:
            return slice(None, None, None)


def create_index_types(evaluator, index):
    """
    Handles slices in subscript nodes.
    """
    if index == ':':
        # Like array[:]
        return set([Slice(evaluator, None, None, None)])
    elif tree.is_node(index, 'subscript'):  # subscript is a slice operation.
        # Like array[:3]
        result = []
        for el in index.children:
            if el == ':':
                if not result:
                    result.append(None)
            elif tree.is_node(el, 'sliceop'):
                if len(el.children) == 2:
                    result.append(el.children[1])
            else:
                result.append(el)
        result += [None] * (3 - len(result))

        return set([Slice(evaluator, *result)])

    # No slices
    return evaluator.eval_element(index)
