#!/usr/bin/env python3.6

# Copyright (c) 2015-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the license found in the LICENSE file in
# the root directory of this source tree.

'''
Utility to quickly test *.vsix packages with vscode.
'''

import atexit
import optparse
import os
import os.path
import subprocess
import shutil
import sys
import tempfile


def parse_arguments(argv):
    parser = optparse.OptionParser(
        usage='usage %prog [options] [file.vsix ...]',
        description='Quick testing of vsix packages with vscode. By default, this will create a '
        'fresh (temporary) profile and run with only the extensions you specify.')
    parser.add_option(
        '--fresh-start',
        action='store_true', dest='fresh', default=True,
        help='start with a clean-slate of extensions and user-settings. ')
    parser.add_option(
        '-u', '--use-current-profile',
        action='store_false', dest='fresh',
        help='install the extensions alongside your current vscode profile. '
        'Warning: if you specify a *.vsix extension that is already installed, it will NOT be '
        'restored upon completion of this script.')
    parser.add_option(
        '--code-insiders',
        action='store_true', dest='insiders', default=True,
        help='run with code-insiders')
    parser.add_option(
        '-p', '--code-public',
        action='store_false', dest='insiders',
        help='run the public version of code')
    return parser.parse_args(argv[1:])


def assert_files_exist(files, err_code=1):
    '''If any of the files do not exist, then exit'''
    try:
        for filename in files:
            if not os.path.isfile(filename):
                raise Exception('File {} does not exist.'.format(filename))
    except Exception as err:
        print(err)
        exit(err_code)


class CodeExec:
    def __init__(self, insiders, fresh):
        if insiders:
            self._code_exec = 'code-insiders'
        else:
            self._code_exec = 'code'

        if fresh:
            user_dir = tempfile.mkdtemp(prefix='try-vsix.')
            extensions_dir = os.path.join(user_dir, 'extensions')
            os.mkdir(extensions_dir)
            self._user_dir_args = ['--user-data-dir', user_dir, '--extensions-dir', extensions_dir]
            print('Created temporary vscode user directory at {}'.format(user_dir))

            def rm_temps():
                print('Removing temp user directory: {}'.format(user_dir))
                shutil.rmtree(user_dir)
            atexit.register(rm_temps)
        else:
            self._user_dir_args = []

    def run_code(self, args):
        return subprocess.check_output([self._code_exec] + self._user_dir_args + args)

    def get_exts(self):
        '''Returns the set of installed extensions (by name)'''
        return set(self.run_code(['--list-extensions']).decode('utf-8').split())

    def install_ext(self, ext_file):
        '''Installs an extension (by filename)'''
        self.run_code(['--install-extension', ext_file])

    def uninstall_ext(self, ext_name):
        '''Uninstalls the extension (by name)'''
        self.run_code(['--uninstall-extension', ext_name])

    def launch(self, proposed_api_exts=None):
        '''Run vscode and await its close.'''
        if proposed_api_exts is None:
            proposed_api_exts = []
        args = []
        # Specify which extensions should use vscode's proposed API.
        args += [x for ext in proposed_api_exts for x in ['--enable-proposed-api', ext]]
        # Launch in a new window and await its close
        args += ['--new-window', '--wait']
        self.run_code(args)


def runCode(options, extension_files):
    assert_files_exist(extension_files)
    code = CodeExec(options.insiders, options.fresh)

    # Will be used to determine the names of the newly-installed extensions (by delta).
    original_exts = code.get_exts()

    # Install the extensions
    for ext_file in extension_files:
        print('Installing extension from {}'.format(ext_file))
        code.install_ext(ext_file)

    # Determine which extensions were installed (by name).
    new_exts = code.get_exts() - original_exts
    if len(new_exts) > 0:
        print('Extensions installed:')
        print('  ' + '\n  '.join(new_exts))

    # Launch vscode and wait for its return.
    print('Launching code...')
    code.launch(proposed_api_exts=new_exts)

    if not options.fresh:
        # Uninstall extensions manually.
        for ext_name in new_exts:
            print('Uninstalling extension {}'.format(ext_name))
            code.uninstall_ext(ext_name)


def main(argv):
    options, extension_files = parse_arguments(argv)
    runCode(options, extension_files)

if __name__ == "__main__":
    main(sys.argv)
