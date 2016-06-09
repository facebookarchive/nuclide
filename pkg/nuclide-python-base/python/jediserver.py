# Copyright (c) 2015-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the license found in the LICENSE file in
# the root directory of this source tree.

import getpass
import hashlib
import json
import logging
import os
import sys
import tempfile
import time
import traceback
from logging import FileHandler
from optparse import OptionParser
import jedi
from jedi.evaluate.representation import InstanceElement
import outline

LOGGING_DIR = 'nuclide-%s-logs/python' % getpass.getuser()


class JediServer:

    def __init__(self, src):
        self.src = src
        self.logger = logging.getLogger()
        self.input_stream = sys.stdin
        self.output_stream = sys.stdout

    def run(self):
        self.init_logging()
        while True:
            line = self.input_stream.readline()
            res = self.process_request(line)
            json.dump(res, self.output_stream)
            # Use \n to signal the end of the response.
            self.output_stream.write('\n')
            self.output_stream.flush()

    def generate_log_name(self, value):
        hash = hashlib.md5(value).hexdigest()[:10]
        return os.path.basename(value) + '-' + hash + '.log'

    def init_logging(self):
        # Be consistent with the main Nuclide logs.
        log_dir = os.path.join(tempfile.gettempdir(), LOGGING_DIR)
        if not os.path.exists(log_dir):
            os.makedirs(log_dir)
        handler = FileHandler(os.path.join(log_dir, self.generate_log_name(self.src)))
        handler.setFormatter(logging.Formatter(
            'nuclide-jedi-py %(asctime)s: [%(name)s] %(message)s'
        ))
        self.logger.addHandler(handler)
        self.logger.setLevel(logging.INFO)
        self.logger.info('starting for ' + self.src)

    def process_request(self, line):
        start_time = time.time()

        req = json.loads(line)
        id, data = req['id'], req['args']
        method = req['method']
        res = {'type': 'response', 'id': id, 'result': {}}

        try:
            if method == 'get_completions':
                res['result']['completions'] = self.get_completions(self.make_script(data))
            elif method == 'get_definitions':
                res['result']['definitions'] = self.get_definitions(self.make_script(data))
            elif method == 'get_references':
                res['result']['references'] = self.get_references(self.make_script(data))
            elif method == 'get_outline':
                res['result']['items'] = outline.get_outline(self.src, data['contents'])
            else:
                res['type'] = 'error-response'
                del res['result']
                res['error'] = 'Unknown method to jediserver.py: %s.' % method
        except:
            res['type'] = 'error-response'
            del res['result']
            res['error'] = traceback.format_exc()

        self.logger.info('Finished %s request in %.2lf seconds.',
                         method, time.time() - start_time)
        return res

    def make_script(self, req_data):
        return jedi.api.Script(
            source=req_data['contents'], line=req_data['line'] + 1,
            column=req_data['column'], path=self.src)

    def get_description(self, completion):
        description = completion.docstring()
        # If docstring is not available, attempt to generate a function signature
        # with params.
        if description == '' and hasattr(completion, 'params'):
            description = '%s(%s)' % (
                completion.name,
                ', '.join(p.description for p in completion.params)
            )
        return description

    def get_completions(self, script):
        results = []
        completions = script.completions()
        for completion in completions:
            result = {
                'type': completion.type,
                'text': completion.name,
                'description': self.get_description(completion),
            }
            # Return function params if completion has params (thus is a function).
            if hasattr(completion, 'params'):
                result['params'] = [p.description for p in completion.params]

            # Check for decorators on functions.
            if completion.type == 'function' and not completion.in_builtin_module():
                definition = completion._name.get_definition()
                if isinstance(definition, InstanceElement):
                    decorated_func = definition.get_decorated_func()
                    if decorated_func.decorates is not None:
                        # If a function has a property decorator, treat it as a property
                        # instead of a method.
                        if str(decorated_func.base.name) == 'property':
                            del result['params']
                            result['type'] = 'property'
            results.append(result)
        return results

    def get_definitions(self, script):
        results = []
        definitions = script.goto_assignments()

        for definition in definitions:
            if not definition.module_path:
                continue
            result = self.serialize_definition(definition)
            results.append(result)
        return results

    def get_references(self, script):
        results = []
        references = script.usages()

        for ref in references:
            if not ref.module_path:
                continue
            result = self.serialize_definition(ref)
            parent = self.get_significant_parent(ref)
            if parent is not None:
                result['parentName'] = parent.name
            results.append(result)
        return results

    def serialize_definition(self, definition):
        return {
            'text': definition.name,
            'type': definition.type,
            'file': definition.module_path,
            'line': definition.line - 1,
            'column': definition.column
        }

    def get_significant_parent(self, definition):
        curr = definition.parent()
        while curr is not None:
            if curr.type == 'function' or curr.type == 'class':
                return curr
            # Since results are already grouped by module, there is no point in
            # returning a parent for a module-level reference.
            elif curr.type == 'module':
                return None
            curr = definition.parent()
        return None


if __name__ == '__main__':
    parser = OptionParser()
    parser.add_option('-s', '--source', dest='src', default='')
    (opts, _) = parser.parse_args()

    JediServer(opts.src).run()
