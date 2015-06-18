# Copyright (c) 2015-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the license found in the LICENSE file in
# the root directory of this source tree.

import json

from json_helpers import json_load
from nuclide_config import NUCLIDE_CONFIG
from package_manager import PackageManager

# These Atom packages will be excluded from installation.
PACKAGES_TO_EXCLUDE = set([
    # Note that it is important to exclude the nuclide-installer from the list.
    'nuclide-installer',
])

def generate_config():
    # Enumerate and alpha-sort the Atom packages that nuclide-installer should install.
    package_manager = PackageManager()

    # TODO(mbolin): Consider adding an entry for linter@0.12.1. The problems are:
    # (1) It seems like linter is being deprecated in favor of linter-plus.
    # (2) We probably do not want to override the user's version of linter if it
    #     is already installed. We need some way to annotate this special behavior
    #     in the config.
    packages = []

    for config in package_manager.get_configs():
        if not config['isNodePackage']:
            name = config['name']
            if not name in PACKAGES_TO_EXCLUDE:
                packages.append(name)
    packages.sort()

    # Find the version of Nuclide that is being published.
    nuclide_build_info = json_load(NUCLIDE_CONFIG)
    default_version = nuclide_build_info['nextVersion']

    # Create the JSON data for the config.
    config_json = {
      'packages': map(lambda package_name: {'name': package_name, 'version': semver_version}, packages),
    }

    # Return the serialized JSON.
    return json.dumps(config_json, indent=2, separators=(',', ': '), sort_keys=True)
