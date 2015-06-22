# Copyright (c) 2015-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the license found in the LICENSE file in
# the root directory of this source tree.

import json

from json_helpers import json_load
from nuclide_config import NUCLIDE_CONFIG

# These Atom packages will be excluded from installation.
PACKAGES_TO_EXCLUDE = set([
    # Note that it is important to exclude the nuclide-installer from the list.
    # We don't want it to try to install itself!
    'nuclide-installer',
])

def generate_config(semver_version, apm_package_names):
    # TODO(mbolin): Consider adding an entry for linter@0.12.1. The problems are:
    # (1) It seems like linter is being deprecated in favor of linter-plus.
    # (2) We probably do not want to override the user's version of linter if it
    #     is already installed. We need some way to annotate this special behavior
    #     in the config.
    packages = []

    for name in apm_package_names:
        if not name in PACKAGES_TO_EXCLUDE:
            packages.append(name)
    packages.sort()

    # Create the JSON data for the config.
    config_json = {
      'packages': map(lambda package_name: {'name': package_name, 'version': semver_version}, packages),
    }

    # Return the serialized JSON in a form that it is ready to be written to a file.
    return json.dumps(config_json, indent=2, separators=(',', ': '), sort_keys=True) + '\n'
