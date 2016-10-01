# Copyright (c) 2015-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the license found in the LICENSE file in
# the root directory of this source tree.

'''This Python script is very simple for integration testing the debugger.

We want to perform simple assertions about stack frames, breakpoints, etc.
'''


def main():
    a = 2
    b = 3
    c = a + b
    d = c * c

if __name__ == '__main__':
    main()
