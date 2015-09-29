# Copyright (c) 2015-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the license found in the LICENSE file in
# the root directory of this source tree.

import logging
import os
import platform_checker
import subprocess

from multiprocessing import Pool, cpu_count

APM_TEST_WRAPPER = os.path.realpath(os.path.join(os.path.dirname(__file__),
                                                 'run-apm-test-with-timeout'))

class JsTestRunner(object):
    def __init__(self, package_manager, include_apm=True, packages_to_test=[], verbose=False):
        self._package_manager = package_manager
        self._include_apm = include_apm
        self._packages_to_test = packages_to_test
        self._verbose = verbose

    def run_tests(self):
        apm_tests = []
        npm_tests = []
        flow_tests = []

        for package_config in self._package_manager.get_configs():
            if package_config['excludeTestsFromContinuousIntegration']:
                continue

            test_runner = package_config['testRunner']
            if test_runner == 'apm' and not self._include_apm:
                continue

            pkg_path = package_config['packageRootAbsolutePath']
            name = package_config['name']

            if self._packages_to_test and name not in self._packages_to_test:
                continue

            test_args = (test_runner, pkg_path, name)
            test_bucket = npm_tests if test_runner == 'npm' else apm_tests
            test_bucket.append(test_args)

            if package_config['flowCheck']:
                flow_tests.append(('flow', pkg_path, name, self._verbose))

        if platform_checker.is_windows():
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

        if parallel_tests:
            pool = Pool(processes=cpu_count())
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
    if test_runner == 'apm':
        test_args = ['node', '--harmony', APM_TEST_WRAPPER, pkg_path]
    else:
        test_args = ['npm', 'test']

    proc = subprocess.Popen(
            test_args,
            cwd=pkg_path,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            shell=platform_checker.is_windows())
    stdout = []
    for line in proc.stdout:
        # line is a bytes string literal in Python 3.
        logging.info('[%s test %s]: %s', test_runner, name, line.rstrip().decode('utf-8'))
        stdout.append(line)
    proc.wait()

    if proc.returncode:
        logging.info('TEST FAILED: %s\nstdout:\n%s', name, '\n'.join(stdout))
        raise Exception('TEST FAILED: %s test %s' % (test_runner, name))
    else:
        logging.info('TEST PASSED: %s', name)

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
