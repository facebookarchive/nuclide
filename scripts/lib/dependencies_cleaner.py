# Copyright (c) 2015-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the license found in the LICENSE file in
# the root directory of this source tree.

import logging
import platform_checker

from multiprocessing import cpu_count, Pool

class DependenciesCleaner(object):
    '''Delete dependencies for npm/apm packages, exploiting parallelism.'''
    def __init__(self, npm, package_map):
        self._npm = npm
        self._package_map = package_map

    def clean(self):
        import datetime
        start = datetime.datetime.now()
        logging.info('START CLEAN: %s', start)

        if platform_checker.is_windows():
            # Python's multiprocessing library has issues on Windows, so it seems easiest to avoid it:
            # https://docs.python.org/2/library/multiprocessing.html#windows
            self._do_serial_clean()
        else:
            self._do_multiprocess_clean()

        end = datetime.datetime.now()
        logging.info('FINISH CLEAN: %s', end)
        logging.info('PackageManager.clean_dependencies() took %s seconds.', (end - start).seconds)

    def _do_serial_clean(self):
        for package_name in self._package_map:
            clean_dependencies((self._npm, self._package_map[package_name])) 

    def _do_multiprocess_clean(self):
        params = []
        for package_name in self._package_map:
            params.append((self._npm , self._package_map[package_name]))

        pool = Pool(cpu_count())
        pool.map(clean_dependencies, params)


# Although not documented, the pool.map only accept single parameter passing to the target function.
# So we pass in the npm and package_config as a tuple.
def clean_dependencies(payload):
    npm = payload[0]
    package_config = payload[1]

    name = package_config['name']
    logging.info('Cleaning dependencies for package %s...', name)
    npm.clean_dependencies(package_config['packageRootAbsolutePath'])
    logging.info('Done cleaning dependencies for %s', name)
