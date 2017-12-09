"""
Basically a parser that is faster, because it tries to parse only parts and if
anything changes, it only reparses the changed parts. But because it's not
finished (and still not working as I want), I won't document it any further.
"""
import re
from itertools import chain

from jedi._compatibility import use_metaclass
from jedi import settings
from jedi.parser import ParserWithRecovery
from jedi.parser import tree
from jedi.parser.utils import underscore_memoization, parser_cache
from jedi import debug
from jedi.parser.tokenize import (source_tokens, NEWLINE,
                                  ENDMARKER, INDENT, DEDENT)

FLOWS = 'if', 'else', 'elif', 'while', 'with', 'try', 'except', 'finally', 'for'


class FastModule(tree.Module):
    type = 'file_input'

    def __init__(self, module_path):
        super(FastModule, self).__init__([])
        self.modules = []
        self.reset_caches()
        self.names_dict = {}
        self.path = module_path

    def reset_caches(self):
        self.modules = []
        try:
            del self._used_names  # Remove the used names cache.
        except AttributeError:
            pass  # It was never used.

    @property
    @underscore_memoization
    def used_names(self):
        return MergedNamesDict([m.used_names for m in self.modules])

    @property
    def global_names(self):
        return [name for m in self.modules for name in m.global_names]

    @property
    def error_statements(self):
        return [e for m in self.modules for e in m.error_statements]

    def __repr__(self):
        return "<fast.%s: %s@%s-%s>" % (type(self).__name__, self.name,
                                        self.start_pos[0], self.end_pos[0])

    # To avoid issues with with the `parser.ParserWithRecovery`, we need
    # setters that do nothing, because if pickle comes along and sets those
    # values.
    @global_names.setter
    def global_names(self, value):
        pass

    @error_statements.setter
    def error_statements(self, value):
        pass

    @used_names.setter
    def used_names(self, value):
        pass


class MergedNamesDict(object):
    def __init__(self, dicts):
        self.dicts = dicts

    def __iter__(self):
        return iter(set(key for dct in self.dicts for key in dct))

    def __getitem__(self, value):
        return list(chain.from_iterable(dct.get(value, []) for dct in self.dicts))

    def items(self):
        dct = {}
        for d in self.dicts:
            for key, values in d.items():
                try:
                    dct_values = dct[key]
                    dct_values += values
                except KeyError:
                    dct[key] = list(values)
        return dct.items()

    def values(self):
        lst = []
        for dct in self.dicts:
            lst += dct.values()
        return lst


class CachedFastParser(type):
    """ This is a metaclass for caching `FastParser`. """
    def __call__(self, grammar, source, module_path=None):
        if not settings.fast_parser:
            return ParserWithRecovery(grammar, source, module_path)

        pi = parser_cache.get(module_path, None)
        if pi is None or isinstance(pi.parser, ParserWithRecovery):
            p = super(CachedFastParser, self).__call__(grammar, source, module_path)
        else:
            p = pi.parser  # pi is a `cache.ParserCacheItem`
            p.update(source)
        return p


class ParserNode(object):
    def __init__(self, fast_module, parser, source):
        self._fast_module = fast_module
        self.parent = None
        self._node_children = []

        self.source = source
        self.hash = hash(source)
        self.parser = parser
        if source:
            self._end_pos = parser.module.end_pos
        else:
            self._end_pos = 1, 0

        try:
            # With fast_parser we have either 1 subscope or only statements.
            self._content_scope = parser.module.subscopes[0]
            # A parsed node's content will be in the first indent, because
            # everything that's parsed is within this subscope.
            self._is_class_or_def = True
        except IndexError:
            self._content_scope = parser.module
            self._is_class_or_def = False
        else:
            self._rewrite_last_newline()

        # We need to be able to reset the original children of a parser.
        self._old_children = list(self._content_scope.children)

    def is_root_node(self):
        return self.parent is None

    def _rewrite_last_newline(self):
        """
        The ENDMARKER can contain a newline in the prefix. However this prefix
        really belongs to the function - respectively to the next function or
        parser node. If we don't rewrite that newline, we end up with a newline
        in the wrong position, i.d. at the end of the file instead of in the
        middle.
        """
        c = self._content_scope.children
        if tree.is_node(c[-1], 'suite'):  # In a simple_stmt there's no DEDENT.
            end_marker = self.parser.module.children[-1]
            # Set the DEDENT prefix instead of the ENDMARKER.
            c[-1].children[-1].prefix = end_marker.prefix
            end_marker.prefix = ''

    def __repr__(self):
        module = self.parser.module
        try:
            return '<%s: %s-%s>' % (type(self).__name__, module.start_pos, module.end_pos)
        except IndexError:
            # There's no module yet.
            return '<%s: empty>' % type(self).__name__

    @property
    def end_pos(self):
        return self._end_pos[0] + self.parser.position_modifier.line, self._end_pos[1]

    def reset_node(self):
        """
        Removes changes that were applied in this class.
        """
        self._node_children = []
        scope = self._content_scope
        scope.children = list(self._old_children)
        try:
            # This works if it's a MergedNamesDict.
            # We are correcting it, because the MergedNamesDicts are artificial
            # and can change after closing a node.
            scope.names_dict = scope.names_dict.dicts[0]
        except AttributeError:
            pass

    def close(self):
        """
        Closes the current parser node. This means that after this no further
        nodes should be added anymore.
        """
        # We only need to replace the dict if multiple dictionaries are used:
        if self._node_children:
            dcts = [n.parser.module.names_dict for n in self._node_children]
            # Need to insert the own node as well.
            dcts.insert(0, self._content_scope.names_dict)
            self._content_scope.names_dict = MergedNamesDict(dcts)
            endmarker = self.parser.get_parsed_node().children[-1]
            assert endmarker.type == 'endmarker'
            last_parser = self._node_children[-1].parser
            endmarker.start_pos = last_parser.get_parsed_node().end_pos

    @property
    def _indent(self):
        if self.is_root_node():
            return 0

        return self.parser.module.children[0].start_pos[1]

    def add_node(self, node, start_line, indent):
        """
        Adding a node means adding a node that was either just parsed or one
        that can be reused.
        """
        # Content that is not a subscope can never be part of the current node,
        # because it's basically a sister node, that sits next to it and not
        # within it.
        if (self._indent >= indent or not self._is_class_or_def) and \
                not self.is_root_node():
            self.close()
            return self.parent.add_node(node, start_line, indent)

        # Changing the line offsets is very important, because if they don't
        # fit, all the start_pos values will be wrong.
        m = node.parser.module
        node.parser.position_modifier.line = start_line - 1
        self._fast_module.modules.append(m)
        node.parent = self

        self._node_children.append(node)

        # Insert parser objects into current structure. We only need to set the
        # parents and children in a good way.
        scope = self._content_scope
        for child in m.children:
            child.parent = scope
            scope.children.append(child)

        return node

    def all_sub_nodes(self):
        """
        Returns all nodes including nested ones.
        """
        for n in self._node_children:
            yield n
            for y in n.all_sub_nodes():
                yield y

    @underscore_memoization  # Should only happen once!
    def remove_last_newline(self):
        self.parser.remove_last_newline()


class FastParser(use_metaclass(CachedFastParser)):
    _FLOWS_NEED_SPACE = 'if', 'elif', 'while', 'with', 'except', 'for'
    _FLOWS_NEED_COLON = 'else', 'try', 'except', 'finally'
    _keyword_re = re.compile('^[ \t]*(def |class |@|(?:%s)|(?:%s)\s*:)'
                             % ('|'.join(_FLOWS_NEED_SPACE),
                                '|'.join(_FLOWS_NEED_COLON)))

    def __init__(self, grammar, source, module_path=None):
        # set values like `tree.Module`.
        self._grammar = grammar
        self.module_path = module_path
        self._reset_caches()
        self.update(source)

    def _reset_caches(self):
        self.module = FastModule(self.module_path)
        self.root_node = self.current_node = ParserNode(self.module, self, '')

    def get_parsed_node(self):
        return self.module

    def update(self, source):
        # Variables for testing purposes: It is important that the number of
        # parsers used can be minimized. With these variables we can test
        # against that.
        self.number_parsers_used = 0
        self.number_of_splits = 0
        self.number_of_misses = 0
        self.module.reset_caches()
        self.source = source
        try:
            self._parse(source)
        except:
            # FastParser is cached, be careful with exceptions.
            self._reset_caches()
            raise

    def _split_parts(self, source):
        """
        Split the source code into different parts. This makes it possible to
        parse each part seperately and therefore cache parts of the file and
        not everything.
        """
        def gen_part():
            text = ''.join(current_lines)
            del current_lines[:]
            self.number_of_splits += 1
            return text

        def just_newlines(current_lines):
            for line in current_lines:
                line = line.lstrip('\t \n\r')
                if line and line[0] != '#':
                    return False
            return True

        # Split only new lines. Distinction between \r\n is the tokenizer's
        # job.
        # It seems like there's no problem with form feed characters here,
        # because we're not counting lines.
        self._lines = source.splitlines(True)
        current_lines = []
        is_decorator = False
        # Use -1, because that indent is always smaller than any other.
        indent_list = [-1, 0]
        new_indent = False
        parentheses_level = 0
        flow_indent = None
        previous_line = None
        # All things within flows are simply being ignored.
        for i, l in enumerate(self._lines):
            # Handle backslash newline escaping.
            if l.endswith('\\\n') or l.endswith('\\\r\n'):
                if previous_line is not None:
                    previous_line += l
                else:
                    previous_line = l
                continue
            if previous_line is not None:
                l = previous_line + l
                previous_line = None

            # check for dedents
            s = l.lstrip('\t \n\r')
            indent = len(l) - len(s)
            if not s or s[0] == '#':
                current_lines.append(l)  # Just ignore comments and blank lines
                continue

            if new_indent and not parentheses_level:
                if indent > indent_list[-2]:
                    # Set the actual indent, not just the random old indent + 1.
                    indent_list[-1] = indent
                new_indent = False

            while indent < indent_list[-1]:  # -> dedent
                indent_list.pop()
                # This automatically resets the flow_indent if there was a
                # dedent or a flow just on one line (with one simple_stmt).
                new_indent = False
                if flow_indent is None and current_lines and not parentheses_level:
                    yield gen_part()
                flow_indent = None

            # Check lines for functions/classes and split the code there.
            if flow_indent is None:
                m = self._keyword_re.match(l)
                if m:
                    # Strip whitespace and colon from flows as a check.
                    if m.group(1).strip(' \t\r\n:') in FLOWS:
                        if not parentheses_level:
                            flow_indent = indent
                    else:
                        if not is_decorator and not just_newlines(current_lines):
                            yield gen_part()
                    is_decorator = '@' == m.group(1)
                    if not is_decorator:
                        parentheses_level = 0
                        # The new indent needs to be higher
                        indent_list.append(indent + 1)
                        new_indent = True
                elif is_decorator:
                    is_decorator = False

            parentheses_level = \
                max(0, (l.count('(') + l.count('[') + l.count('{') -
                        l.count(')') - l.count(']') - l.count('}')))

            current_lines.append(l)

        if previous_line is not None:
            current_lines.append(previous_line)
        if current_lines:
            yield gen_part()

    def _parse(self, source):
        """ :type source: str """
        added_newline = False
        if not source or source[-1] != '\n':
            # To be compatible with Pythons grammar, we need a newline at the
            # end. The parser would handle it, but since the fast parser abuses
            # the normal parser in various ways, we need to care for this
            # ourselves.
            source += '\n'
            added_newline = True

        next_code_part_end_line = code_part_end_line = 1
        start = 0
        nodes = list(self.root_node.all_sub_nodes())
        # Now we can reset the node, because we have all the old nodes.
        self.root_node.reset_node()
        self.current_node = self.root_node
        last_end_line = 1

        for code_part in self._split_parts(source):
            next_code_part_end_line += code_part.count('\n')
            # If the last code part parsed isn't equal to the current end_pos,
            # we know that the parser went further (`def` start in a
            # docstring). So just parse the next part.
            if code_part_end_line == last_end_line:
                self._parse_part(code_part, source[start:], code_part_end_line, nodes)
            else:
                self.number_of_misses += 1
                # Means that some lines where not fully parsed. Parse it now.
                # This is a very rare case. Should only happens with very
                # strange code bits.
                while last_end_line < next_code_part_end_line:
                    code_part_end_line = last_end_line
                    # We could calculate the src in a more complicated way to
                    # make caching here possible as well. However, this is
                    # complicated and error-prone. Since this is not very often
                    # called - just ignore it.
                    src = ''.join(self._lines[code_part_end_line - 1:])
                    self._parse_part(code_part, src, code_part_end_line, nodes)
                    last_end_line = self.current_node.end_pos[0]
                debug.dbg("While parsing %s, starting with line %s wasn't included in split.",
                          self.module_path, code_part_end_line)
                #assert code_part_end_line > last_end_line
                # This means that the parser parsed faster than the last given
                # `code_part`.
                debug.dbg('While parsing %s, line %s slowed down the fast parser.',
                          self.module_path, code_part_end_line)

            code_part_end_line = next_code_part_end_line
            start += len(code_part)

            last_end_line = self.current_node.end_pos[0]

        if added_newline:
            self.current_node.remove_last_newline()

        # Now that the for loop is finished, we still want to close all nodes.
        node = self.current_node
        while node is not None:
            node.close()
            node = node.parent

        debug.dbg('Parsed %s, with %s parsers in %s splits.'
                  % (self.module_path, self.number_parsers_used,
                     self.number_of_splits))

    def _parse_part(self, source, parser_code, code_part_end_line, nodes):
        """
        Side effect: Alters the list of nodes.
        """
        h = hash(source)
        for index, node in enumerate(nodes):
            if node.hash == h and node.source == source:
                node.reset_node()
                nodes.remove(node)
                parser_code = source
                break
        else:
            tokenizer = FastTokenizer(parser_code)
            self.number_parsers_used += 1
            p = ParserWithRecovery(self._grammar, parser_code, self.module_path, tokenizer=tokenizer)

            end = code_part_end_line - 1 + p.module.end_pos[0]
            used_lines = self._lines[code_part_end_line - 1:end - 1]
            code_part_actually_used = ''.join(used_lines)

            node = ParserNode(self.module, p, code_part_actually_used)

        indent = len(parser_code) - len(parser_code.lstrip('\t '))

        self.current_node.add_node(node, code_part_end_line, indent)
        self.current_node = node


class FastTokenizer(object):
    """
    Breaks when certain conditions are met, i.e. a new function or class opens.
    """
    def __init__(self, source):
        self.source = source
        self._gen = source_tokens(source, use_exact_op_types=True)
        self._closed = False

        # fast parser options
        self.current = self.previous = NEWLINE, '', (0, 0)
        self._in_flow = False
        self._is_decorator = False
        self._first_stmt = True
        self._parentheses_level = 0
        self._indent_counter = 0
        self._flow_indent_counter = 0
        self._returned_endmarker = False
        self._expect_indent = False

    def __iter__(self):
        return self

    def next(self):
        """ Python 2 Compatibility """
        return self.__next__()

    def __next__(self):
        if self._closed:
            return self._finish_dedents()

        typ, value, start_pos, prefix = current = next(self._gen)
        if typ == ENDMARKER:
            self._closed = True
            self._returned_endmarker = True
            return current

        self.previous = self.current
        self.current = current

        if typ == INDENT:
            self._indent_counter += 1
            if not self._expect_indent and not self._first_stmt and not self._in_flow:
                # This does not mean that there is an actual flow, it means
                # that the INDENT is syntactically wrong.
                self._flow_indent_counter = self._indent_counter - 1
                self._in_flow = True
            self._expect_indent = False
        elif typ == DEDENT:
            self._indent_counter -= 1
            if self._in_flow:
                if self._indent_counter == self._flow_indent_counter:
                    self._in_flow = False
            else:
                self._closed = True
            return current

        previous_type = self.previous[0]
        if value in ('def', 'class') and self._parentheses_level:
            # Account for the fact that an open parentheses before a function
            # will reset the parentheses counter, but new lines before will
            # still be ignored. So check the prefix.

            # TODO what about flow parentheses counter resets in the tokenizer?
            self._parentheses_level = 0
            # We need to simulate a newline before the indent, because the
            # open parentheses ignored them.
            if re.search('\n\s*', prefix):
                previous_type = NEWLINE

        # Parentheses ignore the indentation rules. The other three stand for
        # new lines.
        if previous_type in (NEWLINE, INDENT, DEDENT) \
                and not self._parentheses_level and typ not in (INDENT, DEDENT):
            if not self._in_flow:
                if value in FLOWS:
                    self._flow_indent_counter = self._indent_counter
                    self._first_stmt = False
                elif value in ('def', 'class', '@'):
                    # The values here are exactly the same check as in
                    # _split_parts, but this time with tokenize and therefore
                    # precise.
                    if not self._first_stmt and not self._is_decorator:
                        return self._close()

                    self._is_decorator = '@' == value
                    if not self._is_decorator:
                        self._first_stmt = False
                        self._expect_indent = True
                elif self._expect_indent:
                    return self._close()
                else:
                    self._first_stmt = False

        if value in '([{' and value:
            self._parentheses_level += 1
        elif value in ')]}' and value:
            # Ignore closing parentheses, because they are all
            # irrelevant for the indentation.
            self._parentheses_level = max(self._parentheses_level - 1, 0)
        return current

    def _close(self):
        if self._first_stmt:
            # Continue like nothing has happened, because we want to enter
            # the first class/function.
            if self.current[1] != '@':
                self._first_stmt = False
            return self.current
        else:
            self._closed = True
            return self._finish_dedents()

    def _finish_dedents(self):
        if self._indent_counter:
            self._indent_counter -= 1
            return DEDENT, '', self.current[2], ''
        elif not self._returned_endmarker:
            self._returned_endmarker = True
            return ENDMARKER, '', self.current[2], self._get_prefix()
        else:
            raise StopIteration

    def _get_prefix(self):
        """
        We're using the current prefix for the endmarker to not loose any
        information. However we care about "lost" lines. The prefix of the
        current line (indent) will always be included in the current line.
        """
        cur = self.current
        while cur[0] == DEDENT:
            cur = next(self._gen)
        prefix = cur[3]

        # \Z for the end of the string. $ is bugged, because it has the
        # same behavior with or without re.MULTILINE.
        return re.sub(r'[^\n]+\Z', '', prefix)
