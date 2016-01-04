#!/usr/bin/env python

# Copyright (c) 2015-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the license found in the LICENSE file in
# the root directory of this source tree.

'''
Checks that the versions of all dependent programs are correct.
The list of dependent programs is in ./dependencies.json.
'''

import logging
import os
import os.path

# Set up the logging early on in the process.
logging.basicConfig(level=logging.INFO, format='%(message)s')

import fs
from json_helpers import json_dump, json_load

def get_dependencies_filename():
    return os.path.join(os.path.dirname(__file__), 'dependencies.json')

def load_dependencies():
    return json_load(get_dependencies_filename())

def write_dependencies(dependencies):
    json_dump(dependencies, get_dependencies_filename())

def check_dependency(binary, expected_version):
    # Since flow v0.18.1 `--version` was deprecated in favor a `version` command
    cmd = [binary, '--version'] if binary != 'flow' else [binary, 'version']
    actual_version = fs.cross_platform_check_output(cmd).rstrip()
    if actual_version != expected_version:
        raise Exception(('Incorrect %s version. Found %s, expected %s. ' +
                         'Use the --no-version option to ignore this test.') %
                        (binary, actual_version, expected_version))

def check_dependencies(include_apm):
    dependencies = load_dependencies()
    for dependency_name in dependencies.keys():
        dependency = dependencies[dependency_name]
        if include_apm or not dependency['clientOnly']:
            check_dependency(dependency['dependency'],
                             dependency.get('version-output', dependency['version']))

def get_atom_version():
    return load_dependencies()['atom']['version']

def get_flow_version():
    return load_dependencies()['flow']['version']

def set_atom_version(new_atom_version):
    dependencies = load_dependencies()
    dependencies['atom']['version'] = new_atom_version
    write_dependencies(dependencies)

def set_flow_version(new_flow_version):
    dependencies = load_dependencies()
    dependencies['flow']['version'] = new_flow_version
    dependencies['flow']['version-output'] = (
        'Flow, a static type checker for JavaScript, version ' + new_flow_version)
    write_dependencies(dependencies)
