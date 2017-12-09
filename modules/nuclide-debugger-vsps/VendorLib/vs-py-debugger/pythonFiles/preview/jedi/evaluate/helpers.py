import copy
from itertools import chain

from jedi.parser import tree


def deep_ast_copy(obj, parent=None, new_elements=None):
    """
    Much, much faster than copy.deepcopy, but just for Parser elements (Doesn't
    copy parents).
    """

    if new_elements is None:
        new_elements = {}

    def copy_node(obj):
        # If it's already in the cache, just return it.
        try:
            return new_elements[obj]
        except KeyError:
            # Actually copy and set attributes.
            new_obj = copy.copy(obj)
            new_elements[obj] = new_obj

        # Copy children
        new_children = []
        for child in obj.children:
            typ = child.type
            if typ in ('newline', 'operator', 'keyword', 'number', 'string',
                       'indent', 'dedent', 'endmarker', 'error_leaf'):
                # At the moment we're not actually copying those primitive
                # elements, because there's really no need to. The parents are
                # obviously wrong, but that's not an issue.
                new_child = child
            elif typ == 'name':
                new_elements[child] = new_child = copy.copy(child)
                new_child.parent = new_obj
            else:  # Is a BaseNode.
                new_child = copy_node(child)
                new_child.parent = new_obj
            new_children.append(new_child)
        new_obj.children = new_children

        # Copy the names_dict (if there is one).
        try:
            names_dict = obj.names_dict
        except AttributeError:
            pass
        else:
            try:
                new_obj.names_dict = new_names_dict = {}
            except AttributeError:  # Impossible to set CompFor.names_dict
                pass
            else:
                for string, names in names_dict.items():
                    new_names_dict[string] = [new_elements[n] for n in names]
        return new_obj

    if isinstance(obj, tree.BaseNode):
        new_obj = copy_node(obj)
    else:
        # Special case of a Name object.
        new_elements[obj] = new_obj = copy.copy(obj)

    if parent is not None:
        new_obj.parent = parent
    return new_obj


def call_of_leaf(leaf, cut_own_trailer=False):
    """
    Creates a "call" node that consist of all ``trailer`` and ``power``
    objects.  E.g. if you call it with ``append``::

        list([]).append(3) or None

    You would get a node with the content ``list([]).append`` back.

    This generates a copy of the original ast node.

    If you're using the leaf, e.g. the bracket `)` it will return ``list([])``.

    # TODO remove cut_own_trailer option, since its always used with it. Just
    #      ignore it, It's not what we want anyway. Or document it better?
    """
    trailer = leaf.parent
    # The leaf may not be the last or first child, because there exist three
    # different trailers: `( x )`, `[ x ]` and `.x`. In the first two examples
    # we should not match anything more than x.
    if trailer.type != 'trailer' or leaf not in (trailer.children[0], trailer.children[-1]):
        if trailer.type == 'atom':
            return trailer
        return leaf

    power = trailer.parent
    index = power.children.index(trailer)
    power = deep_ast_copy(power)
    if cut_own_trailer:
        cut = index
    else:
        cut = index + 1
    power.children[cut:] = []

    if power.type == 'error_node':
        start = index
        while True:
            start -= 1
            if power.children[start].type != 'trailer':
                break
        transformed = tree.Node('power', power.children[start:])
        transformed.parent = power.parent
        return transformed

    return power


def get_names_of_node(node):
    try:
        children = node.children
    except AttributeError:
        if node.type == 'name':
            return [node]
        else:
            return []
    else:
        return list(chain.from_iterable(get_names_of_node(c) for c in children))


def get_module_names(module, all_scopes):
    """
    Returns a dictionary with name parts as keys and their call paths as
    values.
    """
    if all_scopes:
        dct = module.used_names
    else:
        dct = module.names_dict
    return chain.from_iterable(dct.values())


class FakeImport(tree.ImportName):
    def __init__(self, name, parent, level=0):
        super(FakeImport, self).__init__([])
        self.parent = parent
        self._level = level
        self.name = name

    def get_defined_names(self):
        return [self.name]

    def aliases(self):
        return {}

    @property
    def level(self):
        return self._level

    @property
    def start_pos(self):
        return 0, 0

    def paths(self):
        return [[self.name]]

    def is_definition(self):
        return True


class FakeName(tree.Name):
    def __init__(self, name_str, parent=None, start_pos=(0, 0), is_definition=None):
        """
        In case is_definition is defined (not None), that bool value will be
        returned.
        """
        super(FakeName, self).__init__(tree.zero_position_modifier, name_str, start_pos)
        self.parent = parent
        self._is_definition = is_definition

    def get_definition(self):
        return self.parent

    def is_definition(self):
        if self._is_definition is None:
            return super(FakeName, self).is_definition()
        else:
            return self._is_definition


class LazyName(FakeName):
    def __init__(self, name, parent_callback, is_definition=None):
        super(LazyName, self).__init__(name, is_definition=is_definition)
        self._parent_callback = parent_callback

    @property
    def parent(self):
        return self._parent_callback()

    @parent.setter
    def parent(self, value):
        pass  # Do nothing, super classes can try to set the parent.
