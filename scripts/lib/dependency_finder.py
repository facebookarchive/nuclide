# Copyright (c) 2015-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the license found in the LICENSE file in
# the root directory of this source tree.

import logging
import os
import shutil
from fs import mkdirs
from github import is_recognized_github_uri, add_github_uri_to_output_dir
from semver import find_version_in_range
from json_helpers import json_load


class DependencyFinder(object):
    def __init__(self, package_manager, dot_npm_directory):
        self._package_manager = package_manager
        self._dot_npm_directory = dot_npm_directory

    def write_dependencies(self, output_dir):
        package_to_version_set = {}
        for config in self._package_manager.get_configs():
            src_path = config['packageRootAbsolutePath']
            package_json = os.path.join(src_path, 'package.json')
            self._process_package_json(package_json,
                                       package_to_version_set,
                                       include_dev_dependencies=True)

        # Write deps based on package_to_version_set.
        # Leveraging semver from npm makes this fairly straightforward.
        for package, versions in package_to_version_set.items():
            package_dir = os.path.join(self._dot_npm_directory, package)
            if not os.path.isdir(package_dir):
                raise Exception('ERROR: Could not find directory for package %s at %s' % (package, package_dir))
            available_versions = os.listdir(package_dir)
            for version in versions:
                if is_recognized_github_uri(version):
                    add_github_uri_to_output_dir(version, output_dir, package)
                    continue

                semver_range = version if version != 'latest' else '*'
                matching_versions = find_version_in_range(available_versions, semver_range)
                if not matching_versions:
                    # Note that there are other valid version formats, such as local dependencies
                    # and URL formats that we have not added logic for
                    # (https://docs.npmjs.com/files/package.json#git-urls-as-dependencies).
                    # Currently, we can get away with this because these formats are not used by our
                    # transitive dependencies, so we may have to expand what we support in the
                    # future.
                    raise Exception('No package found for %s@%s' % (package, version))
                else:
                    # By default, we pick the newest version available.
                    desired_version = matching_versions[-1]

                    if version == 'latest':
                        logging.warn(
                            'Warning: choosing "latest" among what is locally available for %s: (%s).',
                            package,
                            desired_version)
                    src_dir = os.path.join(package_dir, desired_version)
                    dest_dir = os.path.join(output_dir, package, desired_version)
                    if not os.path.isdir(dest_dir):
                        mkdirs(os.path.dirname(dest_dir))
                        shutil.copytree(src_dir, dest_dir)

    def _process_package_json(self,
                              package_json,
                              package_to_version_set,
                              include_dev_dependencies=False):
        all_deps = self._package_manager.get_deps(package_json, include_dev_dependencies)
        for dep, version in all_deps.items():
            version_set = None
            if dep in package_to_version_set:
                version_set = package_to_version_set[dep]
            else:
                version_set = set()
                package_to_version_set[dep] = version_set
            version_set.add(version)

        # Recurse on keys of all_deps.
        node_modules = os.path.join(os.path.dirname(package_json), 'node_modules')
        for dep in all_deps:
            dep_directory = os.path.join(node_modules, dep)
            if not os.path.isdir(dep_directory):
                # Presumably `npm install` did not create this directory because there is already
                # an ancestor directory with a node_modules that already has this version of the
                # library.
                continue

            dep_package_json = os.path.join(dep_directory, 'package.json')
            # Do not include devDependencies for transitive dependencies.
            self._process_package_json(dep_package_json, package_to_version_set)
