# Copyright (c) 2015-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the license found in the LICENSE file in
# the root directory of this source tree.

import errno
import os
import platform_checker
import shutil
import subprocess

def extract_zip(zip_path, extract_path):
    args = ['unzip', zip_path, '-d', extract_path]
    with open(os.devnull, 'w') as f:
        subprocess.check_call(args, stdout=f, stderr=subprocess.STDOUT)

def create_zip(src_folder, dst_file, append=False):
    # `zip` will update the dst_file with contents in src_foler if dst_file exists.
    if not append and os.path.exists(dst_file):
        os.remove(dst_file)
    args = ['zip', '-r', '-y', dst_file, '.']
    with open(os.devnull, 'w') as f:
        subprocess.check_call(args, cwd=src_folder, stdout=f, stderr=subprocess.STDOUT)

def mkdirs(path):
    """Recursively creating directories and won't throw exception if the path already exists.
    """
    try:
        os.makedirs(path)
    except OSError as e:
        if e.errno == os.errno.EEXIST and os.path.isdir(path):
            pass
        else:
            raise e

def symlink(src, dest):
    """Create symlink from src to dest, create directory if dest's dirname doesn't exist, won't
       throw exception if dest already exists and its symlink points to src.
    """
    dest_dir = os.path.dirname(dest)
    if not os.path.isdir(dest_dir):
        os.makedirs(dest_dir)
    if (not os.path.islink(dest) or
        os.path.realpath(os.path.join(dest_dir, src)) != os.path.realpath(dest)):
        try:
            if platform_checker.is_windows() and os.path.isdir(src):
                cross_platform_check_output(['mklink', '/J', '/D', dest, src])
            else:
                os.symlink(src, dest)
        except OSError as e:
            if e.errno == errno.EEXIST:
                os.remove(dest)
                os.symlink(src, dest)

def enhanced_remove(src):
    """Remove the src if it is a regular file, a symbolic link or a directory.
    """
    if os.path.isfile(src) or os.path.islink(src):
        os.unlink(src)
    elif os.path.isdir(src):
        shutil.rmtree(src)
    else:
        raise Exception('%s is nether a file, a symbolic link nor a drectory' % src)

def cross_platform_check_output(cmd_args, **kwargs):
    ''' This is a subprocess.check_output() implementation providing cross-platform support
    '''

    # Unfortunately, it appears that shell=True must be used on Windows to behave like it does on
    # OS X and Linux: https://bugs.python.org/issue17023. Alternatively, we could try to get the
    # full path to the executable, but that seems like a pain.
    if platform_checker.is_windows():
        kwargs['shell'] = True

    kwargs['stdout'] = subprocess.PIPE
    process = subprocess.Popen(cmd_args, **kwargs)
    stdout, stderr = process.communicate()
    returncode = process.returncode

    if returncode:
        raise subprocess.CalledProcessError(returncode, cmd_args, output=stdout)

    return stdout
