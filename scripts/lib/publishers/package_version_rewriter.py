# Copyright (c) 2015-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the license found in the LICENSE file in
# the root directory of this source tree.

from npm import DEPENDENCIES_KEYS

def update_package_json_versions(package_name, package, nuclide_npm_dependencies, new_version):
    ''' Updates the version numbers of all nuclide packages mentioned in a
        loaded package's dependencies from 0.0.0 to 0.0.new_version.
    '''
    nil_semver = '0.0.0'
    new_semver = '0.0.%d' % new_version
    if package['version'] != nil_semver:
        raise AssertionError('Local package %s was not at version 0.0.0' % package_name)
    package['version'] = new_semver

    # Update the versions of our local dependencies accordingly.
    for dependency_key in DEPENDENCIES_KEYS:
        if not dependency_key in package:
            continue
        for (dependency, version) in package[dependency_key].items():
            if dependency not in nuclide_npm_dependencies:
                continue
            if version != nil_semver:
                raise AssertionError('Local dependency %s in package %s was not at version 0.0.0' %
                                     dependency, package_name)
            package[dependency_key][dependency] = new_semver
    return package
