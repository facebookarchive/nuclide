# Copyright (c) 2015-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the license found in the LICENSE file in
# the root directory of this source tree.

import fs
import logging
import os
import os.path
import platform_checker
import re
import sys

from fs import symlink

APM_PATH  = 'Contents/Resources/app/apm/bin/apm'
ATOM_SH_PATH = 'Contents/Resources/app/atom.sh'
NPM_PATH  = 'Contents/Resources/app/apm/node_modules/.bin/npm'

DEFAULT_ATOM_LOCATION_OS_X = '/Applications/Atom.app'


def add_args_for_env_setup(parser):
    '''Add parser options needed for add_node_executables_to_path().

    This helps ensure consistency across the CLIs for Nuclide's scripts.
    '''
    parser.add_option('--atom-app-dir', type=str, help='Atom.app directory')


def add_node_executables_to_path(parser, include_apm=True):
    '''Updates `os.environ['PATH']` based on the arguments.

    This should be done before running the business logic for a script. This avoids the tedium of
    passing a custom env variable down to all uses of subprocess.check_call().
    '''
    options, _ = parser.parse_args(sys.argv[1:])
    atom_app_dir = options.atom_app_dir

    _verify_node()

    if atom_app_dir:
        # If --atom-app-dir has been specified explicitly, use that.
        if platform_checker.is_os_x():
            _install_apm_and_npm_os_x(atom_app_dir)
        else:
            raise Exception('TODO: set $PATH from %s on %s' % (atom_app_dir, sys.platform))
    elif _is_path_env_variable_set_appropriately(include_apm):
        # Use the default $PATH if it appears to be set correctly.
        pass
    elif platform_checker.is_os_x() and os.path.isdir(DEFAULT_ATOM_LOCATION_OS_X):
        _install_apm_and_npm_os_x(DEFAULT_ATOM_LOCATION_OS_X)
    else:
        raise Exception('Unable to find node/npm/apm executables on $PATH. ' +
            'If you do not believe apm is necessary, try passing --no-atom.')


def _verify_node():
    '''Ensures that Node v4.1.1 or later is on the user's $PATH.'''
    # As noted in _install_apm_and_npm_os_x(), ultimately that function should be responsible for
    # doing this work.

    # First, check for the presence of node. Make sure it is at least v4.1.1.
    node_executable = platform_checker.get_node_executable()
    if _is_executable_on_path(node_executable):
        node_version = fs.cross_platform_check_output([node_executable, '--version']).rstrip()
        major, minor, patch = re.match(r'^v(\d+)\.(\d+)\.(\d+)$', node_version).group(1, 2, 3)
        if (int(major), int(minor), int(patch)) >= (4, 1, 1):
            return

    raise Exception('Must install Node v4.1.1 or later. Not found in %s' % os.environ['PATH'])


def _install_apm_and_npm_os_x(atom_app_dir):
    '''Appends the versions of apm and npm bundled with Atom to the $PATH.'''
    # https://github.com/atom/apm/issues/312 needs to get fixed so we can pull the version
    # of Node from Atom.app. Once it is fixed, 'Contents/Resources/app/apm/bin/node' should
    # appear in this list.
    #
    # More importantly, rather than try to find these paths under /Applications/Atom.app,
    # it would be better to get the realpath of `which apm` and find the paths under there, which
    # should work in a cross-platform way. (The current solution is too specific to OS X.)
    paths = [
        APM_PATH,
        NPM_PATH,
    ]
    paths = map(lambda path: os.path.join(atom_app_dir, path), paths)
    dirs = map(os.path.dirname, paths)
    path_env_dirs = list(set(dirs))
    path_elements = os.pathsep.join(path_env_dirs)

    # Add to the end of the $PATH because /Applications/Atom.app/Contents/Resources/app/apm/bin
    # includes a version of node that is not >=0.12.0, so we don't want that version to shadow the
    # "good" version of Node.
    logging.info('Adding the following to $PATH: %s', path_elements)
    env = os.environ
    env['PATH'] = env['PATH'] + os.pathsep + path_elements

    # `apm` relies on `atom` to run tests (https://fburl.com/66859218),
    # so we need to install it as well.
    logging.info('Install atom.sh from Atom.app directory...')
    atom_sh_path = os.path.join(atom_app_dir, ATOM_SH_PATH)
    symlink(atom_sh_path, os.path.join(atom_app_dir, 'bin', 'atom'))
    env['PATH'] += os.pathsep + os.path.join(atom_app_dir, 'bin')
    # `atom.sh` needs ATOM_PATH to locate Atom.app (https://fburl.com/66863817).
    env['ATOM_PATH'] = os.path.dirname(atom_app_dir)

    return env


def _is_path_env_variable_set_appropriately(include_apm):
    executables = [platform_checker.get_node_executable(), 'npm']
    if include_apm:
        executables += ['apm']
    for executable in executables:
        if not _is_executable_on_path(executable):
            return False
    return True


def _is_executable_on_path(executable):
    for path in os.environ['PATH'].split(os.pathsep):
        # Is there any chance that `path` needs to be escaped?
        full_path = os.path.join(path, executable)
        if os.path.isfile(full_path) and os.access(full_path, os.X_OK):
            return True
    return False


def create_atom_app_dir(atom_zip_file):
    # TODO(mbolin): Clean up temp_dir at the end of execution.
    temp_dir = tempfile.mkdtemp()
    extract_zip(atom_zip_file, temp_dir)
    return os.path.join(temp_dir, 'Atom.app')
