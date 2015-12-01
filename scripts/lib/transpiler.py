# Copyright (c) 2015-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the license found in the LICENSE file in
# the root directory of this source tree.

import fs
import json_helpers
import os
import platform_checker


def has_babel_pragma(first_line):
    return first_line.startswith("'use babel'") or first_line.startswith('"use babel"')


def is_babel_file(path):
    if not path.endswith('.js'):
        return False

    with open(path, 'r') as f:
        first_line = f.readline()
        return has_babel_pragma(first_line)


class Transpiler(object):
    '''Transpiles the Babel files that can be transpiled before publishing.'''

    @staticmethod
    def create_transpiler(path_to_nuclide_repo, transpile_script):
        '''Creates a new Transpiler object.

        Args:
            path_to_nuclide_repo: Path to directory that contains the pkg/ and scripts/
                subdirectories. It is used to locate the config files that determine which Babel
                files should not get transpiled.
            transpile_script: Path to script that takes a file path for a Babel file and returns
                the transpiled output (using the same Babel transpilation options as Atom).
        '''

        # Keys are package names. (Note these could be Node or Atom packages.)
        # Values are arrays of relative paths under the package that identify paths that should not
        # be transpiled.
        exclude_from_transpilation = {}
        entries = json_helpers.json_load(
                os.path.join(path_to_nuclide_repo,
                'pkg/nuclide/server/services-3.json'))
        for entry in entries:
            # For service framework v3 config entry, skip transpile the implementation
            # file only if the definition file is omitted.
            if entry.get('definition'):
                continue
            exclude_file = entry['implementation']

            if os.path.isfile(os.path.join(path_to_nuclide_repo, 'pkg/nuclide/server', exclude_file)):
                package_name = 'nuclide-server'
                relative_path = exclude_file
            else:
                index = exclude_file.index('/')
                package_name = exclude_file[:index]
                relative_path = exclude_file[index + 1:]

            if package_name not in exclude_from_transpilation:
                paths = []
                exclude_from_transpilation[package_name] = paths
            else:
                paths = exclude_from_transpilation[package_name]
            paths.append(relative_path)

        return Transpiler(exclude_from_transpilation, transpile_script)


    def __init__(self, exclude_from_transpilation, transpile_script):
        self._exclude_from_transpilation = exclude_from_transpilation
        self._transpile_script = transpile_script


    def transpile_in_place(self, package_name, path_to_package):
        '''Transpile all Babel files under path_to_package except those in node_modules/ or spec/.'''
        to_exclude = set()
        entries = self._exclude_from_transpilation.get(package_name, [])
        for entry in entries:
            to_exclude.add(os.path.join(path_to_package, entry))

        for (current_path, dirs, files) in os.walk(path_to_package):
            # Do not try to transpile a package's dependencies or its tests.
            if 'node_modules' in dirs:
                dirs.remove('node_modules')
            if 'spec' in dirs:
                dirs.remove('spec')

            for f in files:
                path = os.path.join(current_path, f)
                if path not in to_exclude and is_babel_file(path):
                    self._do_transpile(path)


    def _do_transpile(self, babel_file):
        # Store output in memory and then use it to overwrite the original file.
        transpiled_js = fs.cross_platform_check_output([
            platform_checker.get_node_executable(),
            self._transpile_script,
            babel_file,
        ])

        # Note that the generated file will often still start with 'use babel', in which case we
        # want to strip that line to ensure that Atom does not try to transpile the file again.
        # Note that this is not always the case. The transpiled file might start with:
        #
        #     Object.defineProperty(exports, '__esModule', {
        #
        # in which case stripping the first line would leave the file in an unparseable state.
        end_of_first_line = transpiled_js.index('\n')
        first_line = transpiled_js[:end_of_first_line]
        if has_babel_pragma(first_line):
            transpiled_js = transpiled_js[end_of_first_line + 1:]

        with open(babel_file, 'w') as f:
            f.write(transpiled_js)
