#!/usr/bin/env python3

# Copyright (c) 2015-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the license found in the LICENSE file in
# the root directory of this source tree.

import argparse
import logging
import os
import sys
import textwrap
from distutils.spawn import find_executable as which

CODE_FOLDER_NAME_MAP = {
    "js:node": "gen-nodejs",
    "java": "gen-java",
    "php": "gen-php"
}
logging.basicConfig(level=logging.INFO, format="%(message)s")


def add_header(fpath):
    header = texwrap.dedent(
        """/**
        * Copyright (c) 2017-present, Facebook, Inc."
        * All rights reserved."
        *"
        * This source code is licensed under the BSD-style license found in the"
        * LICENSE file in the root directory of this source tree. An additional grant"
        * of patent rights can be found in the PATENTS file in the same directory."
        *
        * @generated
        */

        """
    )

    with open(fpath, "r") as f:
        content = f.read()

    with open(fpath, "w") as f:
        f.write(header + content)


def add_copyright_headers_to_code_files(folder_path):
    for fname in os.listdir(folder_path):
        fpath = os.path.join(folder_path, fname)
        if os.path.isdir(fpath):
            add_copyright_headers_to_code_files(fpath)
        elif os.path.isfile(fpath):
            add_header(fpath)


def run_thrift(language):
    logging.info("Compiling thrift file into source code")
    os.system(f"thrift --gen {language} -r filesystem.thrift")
    folder_name = CODE_FOLDER_NAME_MAP[args.language]
    add_copyright_headers_to_code_files(os.path.join(os.getcwd(), folder_name))


def main():
    parser = argparse.ArgumentParser(
        description="Generate thrift code for remote file system service"
    )

    parser.add_argument(
        "-l",
        "--lan",
        action="store",
        dest="language",
        choices=["js:node", "java", "php", "python", "perl", "ruby"],
        default="js:node",
        help="Compile thrift to given language.",
    )

    args = parser.parse_args()
    if not which("thrift"):
        print(
            "thrift is not installed. See https://thrift.apache.org/ to install."
        )
        exit(1)

    run_thrift(args.language)


if __name__ == "__main__":
    main()
