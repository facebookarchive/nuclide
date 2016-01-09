# Copyright (c) 2015-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the license found in the LICENSE file in
# the root directory of this source tree.

import logging
import os
import platform_checker
import shutil
import subprocess
import sys

from multiprocessing import Pool, cpu_count

APM_TEST_WRAPPER = os.path.realpath(os.path.join(os.path.dirname(__file__),
                                                 'run-apm-test-with-timeout.js'))
RETRY_LIMIT = 3
BAD_TEST_OUTPUT = "TextEditorScrollView scrolled when it shouldn't have."

class JsTestRunner(object):
    def __init__(self, package_manager, include_apm=True, packages_to_test=[], verbose=False, run_in_band=False):
        self._package_manager = package_manager
        self._include_apm = include_apm
        self._packages_to_test = packages_to_test
        self._run_in_band = run_in_band
        self._verbose = verbose

    def run_integration_tests(self):
        run_integration_tests_with_clean_state(self._package_manager.get_nuclide_path())

    def run_tests(self):
        apm_tests = []
        npm_tests = []
        serial_only_tests = []
        # Even if the npm/apm tests are disabled, we should still honor the Flow check.
        flow_tests = [('flow', self._package_manager.get_nuclide_path(), 'nuclide')]

        for package_config in self._package_manager.get_configs():
            pkg_path = package_config['packageRootAbsolutePath']
            name = package_config['name']

            # We run the tests in Nuclide/spec in a separate integration test step.
            if name == 'nuclide':
                continue

            if package_config['excludeTestsFromContinuousIntegration']:
                continue

            test_runner = package_config['testRunner']
            if test_runner == 'apm' and not self._include_apm:
                continue

            if self._packages_to_test and name not in self._packages_to_test:
                continue

            test_args = (test_runner, pkg_path, name)
            if package_config['testsCannotBeRunInParallel']:
              test_bucket = serial_only_tests
            elif test_runner == 'npm':
              test_bucket = npm_tests
            else:
              test_bucket = apm_tests
            test_bucket.append(test_args)

        if self._run_in_band or platform_checker.is_windows():
            # We run all tests in serial on Windows because Python's multiprocessing library has issues:
            # https://docs.python.org/2/library/multiprocessing.html#windows
            parallel_tests = []
            serial_tests = npm_tests + apm_tests + flow_tests
        else:
            # Currently, all tests appear to be able to be run in parallel. We keep this code
            # here in case we have to special-case any tests (on a short-term basis) to be run
            # serially after all of the parallel tests have finished.
            parallel_tests = npm_tests + apm_tests + flow_tests
            serial_tests = []
        serial_tests += serial_only_tests

        if parallel_tests:
            pool = Pool(processes=max(1, cpu_count() - 2))
            results = [pool.apply_async(run_test, args=test_args) for test_args in parallel_tests]
            for async_result in results:
                async_result.wait()
                if not async_result.successful():
                    raise async_result.get()

        for test_args in serial_tests:
            (test_runner, pkg_path, name) = test_args
            run_test(test_runner, pkg_path, name)


def run_test(test_runner, pkg_path, name, verbose=False):
    if test_runner == 'flow':
        run_flow_check(pkg_path, name, verbose)
    else:
        run_js_test(test_runner, pkg_path, name)

def run_js_test(test_runner, pkg_path, name):
    """Run `apm test` or `npm test` in the given pkg_path."""

    logging.info('Running `%s test` in %s...', test_runner, pkg_path)

    # In Atom 1.2+, "apm test" exits with an error when there is no "spec" directory
    if test_runner == 'apm' and not os.path.isdir(os.path.join(pkg_path, 'spec')):
        logging.info('NO TESTS TO RUN FOR: %s', name)
        return

    if test_runner == 'apm':
        test_args = ['node', '--harmony', APM_TEST_WRAPPER, pkg_path]
    else:
        test_args = ['npm', 'test']

    for tries in xrange(0, RETRY_LIMIT):
        proc = subprocess.Popen(
                test_args,
                cwd=pkg_path,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                shell=platform_checker.is_windows())
        retry = False
        stdout = []
        for line in proc.stdout:
            # line is a bytes string literal in Python 3.
            logging.info('[%s test %s]: %s', test_runner, name, line.rstrip().decode('utf-8'))
            stdout.append(line)
            # There are some loglines that correlate highly to test failures due to a bug in atom,
            # so we retry the test if we see this bad test output.  See: D2809659 for an explanation.
            if test_runner == 'apm' and tries < RETRY_LIMIT - 1 and BAD_TEST_OUTPUT in line:
                logging.info('[%s test %s]: %s: %s', test_runner, name, 'Aborting test due to bad output', BAD_TEST_OUTPUT)
                retry = True
                break
        proc.wait()

        if retry:
            continue

        if proc.returncode:
            logging.info('TEST FAILED: %s\nstdout:\n%s', name, '\n'.join(stdout))
            raise Exception('TEST FAILED: %s test %s' % (test_runner, name))
        else:
            logging.info('TEST PASSED: %s', name)
        break

def run_flow_check(pkg_path, name, show_all):
    """Run a flow typecheck in the given pkg_path."""
    logging.info('Running `flow check` in %s...', pkg_path)
    test_args = ['flow', 'check']
    if show_all:
        test_args.append('--show-all-errors')

    proc = subprocess.Popen(
            test_args,
            cwd=pkg_path,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            shell=platform_checker.is_windows())
    stdout = []
    for line in proc.stdout:
        # line is a bytes string literal in Python 3.
        logging.info('[flow check %s]: %s', name, line.rstrip().decode('utf-8'))
        stdout.append(line)
    proc.wait()

    if proc.returncode:
        logging.info('FLOW CHECK FAILED: %s\nstdout:\n%s', name, '\n'.join(stdout))
        raise Exception('FLOW CHECK FAILED: flow test %s' % name)
    else:
        logging.info('FLOW CHECK PASSED: %s', name)

def run_integration_tests_with_clean_state(path_to_nuclide):
    test_dir = os.path.join(path_to_nuclide, 'spec')
    test_dir_backup = os.path.join(path_to_nuclide, 'spec-backup');

    # Copy test_dir and its contents to backup so we can restore it later.
    shutil.copytree(test_dir, test_dir_backup)

    try:
        # Remove all files in test_dir leaving directory structure intact.
        for root, subdirs, files in os.walk(test_dir):
            # Whitelist "lib" subdirectories.
            if 'lib' in subdirs:
                subdirs.remove('lib')
            for name in files:
                os.remove(os.path.join(root, name))

        # One by one, copy each test in test_dir_backup into test_dir, run the test, and then remove that file.
        for root, subdirs, files in os.walk(test_dir_backup):
            # Whitelist "lib" subdirectories.
            if 'lib' in subdirs:
                subdirs.remove('lib')
            for name in files:
                # Copy file.
                src_path_list = os.path.join(root, name).split(os.path.sep)
                dest_path_list = map(lambda piece: piece if piece != 'spec-backup' else 'spec', src_path_list)
                dest = os.path.sep + os.path.join(*dest_path_list)
                shutil.copy(os.path.join(root, name), dest)

                # Run test.
                run_js_test('apm', path_to_nuclide, os.path.basename(dest))

                # Remove file.
                os.remove(dest)
    finally:
        # Clean up by restoring the backup.
        shutil.rmtree(test_dir)
        shutil.copytree(test_dir_backup, test_dir)
        shutil.rmtree(test_dir_backup)
