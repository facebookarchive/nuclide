# Copyright (c) 2015-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the license found in the LICENSE file in
# the root directory of this source tree.

import time

def retryable(num_retries=0, sleep_time=0, exponential=False):
    """
    A decorator for retrying a function call. The function will be called
    until it succeeds or num_tries times reached.
    The function must raise an exception to signify failure.

    num_retries     - number of tries before giving up
    sleep_time      - number of seconds to sleep between each falure
    exponential     - progressively double sleep_time between retries
    """
    def _decorator(fn):
        def _wrapper(*args, **kwargs):
            run = 0
            cur_sleep_time = sleep_time
            exception = None
            while run <= num_retries:
                run += 1
                try:
                    return fn(*args, **kwargs)
                except Exception as e:
                    exception = e
                    time.sleep(cur_sleep_time)
                    cur_sleep_time = cur_sleep_time * 2 if exponential else cur_sleep_time
            raise exception
        return _wrapper
    return _decorator
