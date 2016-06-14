#!/usr/bin/env python

# Copyright (c) 2015-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the license found in the LICENSE file in
# the root directory of this source tree.

from __future__ import print_function

import math
import multiprocessing
import subprocess
import sys

from package_manager import NUCLIDE_PATH, PackageManager
from utils import EXIT_KEYBOARD_INTERRUPT

MAX_WORKERS = max(1, multiprocessing.cpu_count() - 1)


def run_eslint(max_warnings, files):
    try:
        cmd = ['node_modules/.bin/eslint']
        if max_warnings is not None:
            cmd.append('--max-warnings=%s' % max_warnings)
        cmd.extend(files)
        proc = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            cwd=NUCLIDE_PATH,
            shell=False
        )
        out, err = proc.communicate()
        proc.wait()
    except KeyboardInterrupt:
        pass
    else:
        # eslint prints lint errors/warnings to stdout
        return (out, err, proc.returncode)


def eslint_all(max_warnings=None):
    files = PackageManager().get_eslintable_files()
    pool = multiprocessing.Pool(processes=MAX_WORKERS)

    results = []
    for i in range(0, MAX_WORKERS):
        chunk = files[i::MAX_WORKERS]
        results.append(
            pool.apply_async(run_eslint, args=(max_warnings, chunk))
        )

    ret = ['', '', 0]
    for async_result in results:
        try:
            # Without a timeout, we can't catch the KeyboardInterrupt
            async_result.wait(timeout=300)
        except KeyboardInterrupt:
            pool.terminate()
            pool.join()
            return ('', '', EXIT_KEYBOARD_INTERRUPT)
        if not async_result.successful():
            raise async_result.get()
        else:
            out, err, returncode = async_result.get()
            ret[0] += out
            ret[1] += err
            ret[2] = ret[2] or returncode

    return tuple(ret)


def main():
    out, err, returncode = eslint_all(max_warnings=0)
    if out:
        print(out, file=sys.stderr)
    if err:
        print(err, file=sys.stderr)
    sys.exit(returncode)


if __name__ == '__main__':
    main()
