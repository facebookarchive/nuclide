# Copyright (c) 2015-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the license found in the LICENSE file in
# the root directory of this source tree.

import logging
from npm import DEPENDENCIES_KEYS
import os
from json_helpers import json_load, json_dump

NIL_SEMVER = '0.0.0'


def new_semver(new_version):
    return '0.0.%d' % new_version


def update_package_json_versions(package_name, package, nuclide_npm_dependencies, new_version):
    ''' Updates the version numbers of all nuclide packages mentioned in a
        loaded package's dependencies from 0.0.0 to 0.0.new_version.
    '''
    if package['version'] != NIL_SEMVER:
        raise AssertionError('Local package %s was not at version 0.0.0' % package_name)
    package['version'] = new_semver(new_version)

    # Update the versions of our local dependencies accordingly.
    for dependency_key in DEPENDENCIES_KEYS:
        if not dependency_key in package:
            continue
        for (dependency, version) in package[dependency_key].items():
            if dependency not in nuclide_npm_dependencies:
                continue
            if version != NIL_SEMVER:
                raise AssertionError('Local dependency %s in package %s was not at version 0.0.0' %
                                     dependency, package_name)
            package[dependency_key][dependency] = new_semver(new_version)
    return package


def rewrite_shrinkwrap_file(package_dir, package, dependent_packages, new_version):
    package_name = package['name']
    shrinkwrap_file = os.path.join(package_dir, 'npm-shrinkwrap.json')
    # TODO(peterhal): Remove this test once we have shrinkwraps in place for all packages
    if os.path.isfile(shrinkwrap_file):
        shrinkwrap = json_load(shrinkwrap_file)
        shrinkwrap = update_shrinkwrap_json_versions(package_name, shrinkwrap,
            dependent_packages, new_version)
        shrinkwrap = filter_shrinkwrap_dependencies(shrinkwrap, package)
        # Write the adjusted shrinkwrap file back to the temporary directory and publish it.
        json_dump(shrinkwrap, shrinkwrap_file)


# Remove any dependencies from shrinkwrap files which are dev only
def filter_shrinkwrap_dependencies(shrinkwrap, package):
    if 'dependencies' not in shrinkwrap:
        # If there's no dependencies to filter, then we're done.
        return shrinkwrap
    deps = set()
    for dependency_key in DEPENDENCIES_KEYS:
        if dependency_key != 'devDependencies' and dependency_key in package:
            deps = deps.union(package[dependency_key].keys())
    for dependent_name in shrinkwrap['dependencies'].keys():
        if dependent_name not in deps:
            shrinkwrap['dependencies'].pop(dependent_name, None)
    return shrinkwrap


def update_shrinkwrap_json_versions(package_name, shrinkwrap, dependent_packages, new_version):
    if shrinkwrap['version'] != NIL_SEMVER:
        raise AssertionError('Local shrinkwrap %s was not at version 0' % package_name)
    shrinkwrap['version'] = new_semver(new_version)

    return update_dependencies_versions(package_name, shrinkwrap, dependent_packages, new_version)


def update_dependencies_versions(package_name, shrinkwrap, dependent_packages, new_version):
    if 'dependencies' not in shrinkwrap:
        return shrinkwrap
    for (dependent_name, dependent_package) in shrinkwrap['dependencies'].items():
        if dependent_name not in dependent_packages:
            continue
        if dependent_package['version'] != NIL_SEMVER:
            raise AssertionError('Shrinkwrap dependency %s in package %s was not at version 0' %
                                 dependent_name, package_name)
        shrinkwrap['dependencies'][dependent_name] = new_semver(new_version)
    return shrinkwrap
