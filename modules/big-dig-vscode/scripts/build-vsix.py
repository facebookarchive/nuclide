#!/usr/bin/env python3

# Copyright (c) 2015-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the license found in the LICENSE file in
# the root directory of this source tree.

'''
Utility to package the VS Code big-dig extension into a *.vsix file.
'''

import atexit
from distutils.version import LooseVersion
import json
import optparse
import os
import os.path
import re
import subprocess
from subprocess import DEVNULL
import shutil
import sys
import tempfile
import time
from pathlib import Path
import traceback
import distutils.dir_util
import zipfile

if sys.version_info[0] != 3 or sys.version_info[1] < 6:
    raise Exception("Must be using Python 3.6+")

# A bug in older Yarn versions causes missing dependencies with workspaces.
MIN_YARN_VERSION = '1.7.0'
RELEASE_TRANSPILE = './modules/nuclide-node-transpiler/bin/release-transpile.js'


class Options(object):
    pass


def eprint(*args, **kwargs):
    print(*args, file=sys.stderr, **kwargs)


def shortPath(path):
    '''Returns a 'prettier' path: relative to the cwd rather than root'''
    try:
        return path.relative_to(Path.cwd())
    except Exception:
        return path


def parse_arguments(argv):
    parser = optparse.OptionParser(
        usage='%prog [options]',
        description='Builds a *.vsix extension package for vscode')
    parser.add_option(
        '--force',
        action='store_true', dest='ignore_dirty', default=False,
        help='Proceed even if the repository has changes or unknown files.')
    parser.add_option(
        '-o',
        '--out',
        type='str', default='big-dig-vscode.vsix',
        help='Location for the generated VSIX file.')
    return parser.parse_args(argv[1:])


def makeTempDir(prefix):
    '''
    Creates a temporary directory and returns its path. Ensures the
    directory is deleted upon normal program exit.
    '''
    tmp = tempfile.mkdtemp(prefix=prefix)

    def rm_temps():
        shutil.rmtree(tmp)
    atexit.register(rm_temps)
    return Path(tmp)


def assert_clean_repository():
    '''Verifies that the repository has no changes and no untracked files.'''
    print('Verifying that the repository is clean...')
    # This should work in both hg and git repositories.
    if subprocess.call(['hg', 'root'], stdout=DEVNULL, stderr=DEVNULL) == 0:
        status_output = subprocess.check_output(['hg', 'status'])
    else:
        status_output = subprocess.check_output(['git', 'status', '--porcelain'])
    if status_output != b'':
        eprint('There are uncommitted changes in this repository.')
        eprint('Please commit or revert all changes before running.')
        exit(1)


def vsce(target, output):
    '''
    Runs `vsce package` in the current directory and returns the path to the
    generated *.vsix file.
    '''
    print('Running vsce...')
    subprocess.check_output(['vsce', 'package', '-o', output], cwd=target)


def loadGlobFile(path):
    '''Reads a list of glob patterns from the given file'''
    if path.exists():
        return path.read_text().split()
    else:
        return []


class NuclideRoot:
    '''
    Represents the nuclide root directory. Internally, this creates a temporary
    copy of the root directory so that transpilation and other mutating operators
    do not change the original. Use `resolvePath` to rebase a path to the copy.
    '''
    def __init__(self, nuclidePath):
        self.nuclidePath = nuclidePath

    def setupNodeModules(self):
        '''Essentially calls `yarn install` from the nuclide root'''
        print('Install node_modules in Nuclide...')
        installer = self._yarnCommand()
        subprocess.check_call([installer, '--offline'], cwd=self.nuclidePath)

    def _yarnCommand(self):
        root = self.nuclidePath.parent
        install_path = root / 'third-party' / 'yarn' / 'yarn'
        return str(install_path) if install_path.exists() else 'yarn'

    def transpile(self):
        '''Transpiles nuclide and all modules'''
        self._nuclideTranspilePath = makeTempDir('nuclide-root.')
        print('Creating copy of Nuclide root at {}...'.format(self._nuclideTranspilePath))
        distutils.dir_util.copy_tree(
            str(self.nuclidePath),
            str(self._nuclideTranspilePath),
            preserve_mode=1,
            preserve_symlinks=1,
            preserve_times=1,
        )
        print('Transpiling modules...')
        subprocess.check_call(
            [
                'node',
                RELEASE_TRANSPILE,
                '--overwrite',
                'modules',
            ],
            cwd=self._nuclideTranspilePath,
            env=dict(os.environ, NUCLIDE_TRANSPILE_ENV='production-modules'),
        )

    def installNodeModules(self, target):
        '''
        Installs modules/ to the target node_modules/ directory.
        '''
        print('Installing node_modules into {}...'.format(target))
        installer = self._yarnCommand()
        subprocess.check_call(
            [installer, '--offline', '--production', '--modules-folder', str(target)],
            cwd=self._nuclideTranspilePath,
        )

    # Bumps the versions to something reasonable.
    def bumpVersion(self, options):
        # Create a unique version based on the current timestamp.
        # The final version will be look like 1.2.3-1521748389.
        version = os.environ.get('npm_package_version')
        # Remove the existing pre-release version, if any.
        prerelease_index = version.index('-')
        if prerelease_index >= 0:
            version = version[:prerelease_index]
        version = '%s-%d' % (version, round(time.time()))

        package_json = self.resolvePath(options.packagePath / 'package.json')
        with open(package_json, 'r') as file:
            obj = json.load(file)
            obj['version'] = version
        with open(package_json, 'w') as file:
            json.dump(obj, file, indent=2)

        server_json = self.resolvePath(options.serverPath / 'package.json')
        with open(server_json, 'r+') as file:
            obj = json.load(file)
            obj['version'] = version
        with open(server_json, 'w') as file:
            json.dump(obj, file, indent=2)

        return version

    def resolvePath(self, path):
        '''
        Returns the equivalent path, but in the temporary copy of the nuclide
        root.
        '''
        return self._nuclideTranspilePath / path.relative_to(self.nuclidePath)


def buildVsix(nuclide, options):
    '''
    Creates a vsix package of the module in `packagePath` at `options.outputPath`.
    '''
    path = nuclide.resolvePath(options.packagePath)
    nuclide.installNodeModules(path / 'node_modules')

    # vsce doesn't like symlinks in node_modules.
    # Use 'cp -LR' to reify the symlinks.
    vsceTmp = makeTempDir('vsce')
    print('Reifying symlinks for vsce')
    # big-dig-vscode is a circular link back to 'path'.
    os.unlink(str(path / 'node_modules' / 'big-dig-vscode'))
    subprocess.check_call(['cp', '-LR', str(path), str(vsceTmp)])

    vsce(vsceTmp / path.name, options.outputPath)


def buildServer(nuclide, version, options):
    '''
    Creates a zip archive of the transpiled big-dig-vscode-server and returns a path
    to the file. The file is temporary and will be deleted upon exit, so it
    must be copied somewhere to remain persistent.
    '''
    print('Creating zip archive of {}'.format(options.serverName))
    serverTmp = makeTempDir(prefix=options.serverName)
    serverZip = serverTmp / (options.serverName + '.zip')
    subprocess.check_output([
        'node',
        options.packagePath / 'scripts' / 'production-server-zip.js',
        version,
        serverZip,
    ])
    return serverZip


def run(options):
    print('Package: ' + options.packageName)
    print('Server: ' + options.serverName)
    print('Nuclide path: ' + str(options.nuclidePath))
    print('Package path: ' + str(options.packagePath))
    print('Server path: ' + str(options.serverPath))
    print('Output path: ' + str(options.outputPath))

    if not options.ignoreDirty:
        assert_clean_repository()

    nuclide = NuclideRoot(options.nuclidePath)
    nuclide.setupNodeModules()
    nuclide.transpile()
    version = nuclide.bumpVersion(options)

    buildVsix(nuclide, options)
    outputPath = options.outputPath

    # Install the server into the package
    serverZip = buildServer(nuclide, version, options)
    with zipfile.ZipFile(str(outputPath), mode='a') as pkg:
        serverDest = Path('extension/resources') / (options.serverName + '.zip')
        print('Writing server into {} under {}'.format(shortPath(outputPath), serverDest))
        pkg.write(str(serverZip), str(serverDest))

    print('Build successful!')
    print(f'Version: {version}')
    shasum = subprocess.check_output(
        ['shasum', '-a', '256', str(outputPath)],
    ).decode('utf-8').split()[0]
    print(f'SHA-256 sum of {outputPath}: {shasum}')


def main(argv):
    try:
        options = Options()
        npm_user_agent = os.environ.get('npm_config_user_agent')
        if npm_user_agent is None:
            eprint('Do not run this script directly: instead run `yarn vsix`.')
            exit(1)
        yarn_version_match = re.match('yarn/(\S+)', str(npm_user_agent))
        yarn_version = yarn_version_match.groups()[0] if yarn_version_match else None
        if yarn_version is None or LooseVersion(yarn_version) < MIN_YARN_VERSION:
            eprint('Yarn >=v%s is required. Current version: %s' % (MIN_YARN_VERSION, yarn_version))
            exit(1)
        options.packageName = os.environ.get('npm_package_name')
        options.serverName = options.packageName + '-server'
        scriptDir = Path(__file__).parent.resolve()
        options.nuclidePath = scriptDir.parent.parent.parent
        options.packagePath = scriptDir.parent
        options.serverPath = options.nuclidePath / 'modules' / 'big-dig-vscode-server'

        cmdOpts, otherArgs = parse_arguments(argv)
        options.ignoreDirty = cmdOpts.ignore_dirty
        options.outputPath = Path(cmdOpts.out).resolve()

        run(options)
    except Exception as err:
        eprint('Unexpected error.')
        eprint(err)
        traceback.print_exc()
        exit(1)


if __name__ == "__main__":
    main(sys.argv)
