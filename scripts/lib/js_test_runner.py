# Copyright (c) 2015-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the license found in the LICENSE file in
# the root directory of this source tree.

import logging
import multiprocessing
import os
import re
import subprocess
import time

MAX_WORKERS = max(1, multiprocessing.cpu_count() - 1)

class JsTestRunner(object):
    def __init__(
            self,
            package_manager,
            include_apm=True,
            packages_to_test=None,
            verbose=False,
            parallel=False,
            continue_on_errors=False,
    ):
        self._package_manager = package_manager
        self._include_apm = include_apm
        self._packages_to_test = packages_to_test
        self._parallel = parallel
        self._verbose = verbose
        self._continue_on_errors = continue_on_errors

    def run_integration_tests(self):
        nuclide_dir = self._package_manager.get_nuclide_path()

        spec_files = [
            os.path.join(root, f)
            for root, _, files in os.walk(os.path.join(nuclide_dir, 'spec'))
            for f in files
            if f.endswith('-spec.js')
        ]

        # Integration tests only run serially:
        for spec_file in spec_files:
            run_test(
                ['atom', '--dev', '--test', spec_file],
                nuclide_dir,
                os.path.basename(spec_file),
                retryable=True,
                continue_on_errors=self._continue_on_errors
            )

    def run_unit_tests(self):
        for package_name in self._packages_to_test:
            if not self._package_manager.is_local_dependency(package_name):
                raise Exception(
                    '%s is not a valid nuclide package name' % package_name)

        parallel_tests = []
        serial_tests = []

        for package_config in self._package_manager.get_configs():
            pkg_path = package_config['packageRootAbsolutePath']
            name = package_config['name']
            test_runner = package_config['testRunner']

            if package_config['excludeTestsFromContinuousIntegration']:
                continue

            if self._packages_to_test and name not in self._packages_to_test:
                continue

            if test_runner == 'apm' and not self._include_apm:
                continue

            if package_config['testsCannotBeRunInParallel'] or not self._parallel:
                test_bucket = serial_tests
            else:
                test_bucket = parallel_tests

            if test_runner == 'npm':
                test_cmd = ['npm', 'test']
                retryable = False
            elif test_runner == 'apm':
                test_cmd = ['apm', 'test']
                retryable = True
            else:
                raise Exception('Unknown test runner "%s"' % test_runner)

            test_args = (test_cmd, pkg_path, name, retryable, self._continue_on_errors)
            test_bucket.append(test_args)

        if len(parallel_tests):
            logging.info('Starting %s workers for %s tests...',
                         MAX_WORKERS,
                         len(parallel_tests))
            pool = multiprocessing.Pool(processes=MAX_WORKERS)
            results = [
                pool.apply_async(
                    run_test,
                    args=test_args,
                ) for test_args in parallel_tests
            ]
            for async_result in results:
                async_result.wait()
                if not async_result.successful():
                    raise async_result.get()

        if len(serial_tests):
            logging.info('Running %s tests serially...', len(serial_tests))
            for test_args in serial_tests:
                run_test(*test_args)


def run_test(
        test_cmd,
        pkg_path,
        name,
        retryable,
        continue_on_errors,
):
    """Run test_cmd in the given pkg_path."""
    logging.info('Running `%s` in %s...', ' '.join(test_cmd), pkg_path)

    # In Atom 1.2+, "apm test" exits with an error when there is no "spec" directory
    if test_cmd == ['apm', 'test'] and not os.path.isdir(os.path.join(pkg_path, 'spec')):
        logging.info('NO TESTS TO RUN FOR: %s', name)
        return

    proc = subprocess.Popen(
        test_cmd,
        cwd=pkg_path,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        shell=False)
    stdout = []
    for line in iter(proc.stdout.readline, ''):
        # line is a bytes string literal in Python 3.
        if not is_log_noise(line):
            logging.info('[%s %s]: %s', test_cmd[0], name, line.rstrip().decode('utf-8'))
        stdout.append(line)
    proc.wait()

    if proc.returncode:
        logging.info(
            'TEST FAILED: %s (exit code: %d)\nstdout:\n%s',
            name,
            proc.returncode,
            '\n'.join(stdout),
        )
        if retryable and is_retryable_error('\n'.join(stdout)):
            logging.info('RETRYING TEST: %s', name)
            time.sleep(3)
            run_test(test_cmd, pkg_path, name, False, continue_on_errors)
            return
        if not continue_on_errors:
            raise Exception('TEST FAILED: %s %s (exit code: %d)' %
                            (test_cmd[0], name, proc.returncode))
    else:
        logging.info('TEST PASSED: %s', name)

def is_retryable_error(output):
    errors = [
        # Atom 1.5.3 for sure, maybe later ones too:
        r'Atom\.app/atom:\s+line 117:\s+\d+\s+Segmentation fault: 11',
        r'Atom\.app/atom:\s+line 117:\s+\d+\s+Abort trap: 6',
        # Atom 1.6.1 for sure:
        r'Atom\.app/atom:\s+line 117:\s+\d+\s+Illegal instruction: 4',
        # Atom 1.6.2 for sure:
        r'Atom\.app/atom:\s+line 117:\s+\d+\s+Bus error: 10',
    ]
    return any(re.search(error, output) for error in errors)


def is_log_noise(line):
    patterns = [
        # Confirmed in Atom 1.7.3:
        r'^\[\d+:\d+/\d+:WARNING:resource_bundle\.cc\(503\)\] '
        r'locale resources are not loaded$',

        # Confirmed in Atom 1.7.3:
        r'^\[\d+:\d+/\d+:WARNING:resource_bundle\.cc\(305\)\] '
        r'locale_file_path\.empty\(\) for locale English$',
    ]
    return any(re.search(pattern, line) for pattern in patterns)
