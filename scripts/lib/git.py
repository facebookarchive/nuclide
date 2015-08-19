# Copyright (c) 2015-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the license found in the LICENSE file in
# the root directory of this source tree.

import fs
import os
import shutil
import subprocess

class Git (object):
    '''Abstraction around the git executable, with a basic (and non-exhaustive) list of operations.
    '''
    def __init__(self, verbose=False):
        self._verbose = verbose

    # TODO (jpearce) Convert the Github class to use these functions
    def clone(self, repository, directory, clean=False):
        '''Clones a repository address like git@github.com:facebook/nuclide.git into a directory,
           optionally cleaning out its current contents if present.
        '''
        if clean:
            shutil.rmtree(directory, ignore_errors=True)
        self._execute(['clone', repository, directory])

    def pull(self, repository_directory):
        self._execute(['pull'], repository_directory)

    def checkout(self, repository_directory, branch_or_tag, create=False):
        cmd_args = ['checkout', branch_or_tag]
        if create:
            cmd_args.insert(1, '-b')
        self._execute(cmd_args, repository_directory)

    def add_all(self, repository_directory):
        self._execute(['add', '-A'], repository_directory)

    def commit_all(self, repository_directory, message):
        self.add_all(repository_directory)
        self._execute(['commit', '-a', '-m', message], repository_directory)

    def push_to_master(self, repository_directory):
        self._execute(['push', 'origin', 'HEAD:master'], repository_directory)

    def push_to_repository(self, repository_directory, repository, refspec):
        self._execute(['push', repository, refspec], repository_directory)

    def get_head(self, repository_directory):
        ''' Returns hash of current local HEAD commit. '''
        return self._execute(['show-ref', '--head', '--heads', '-s', 'HEAD'],
                             repository_directory).strip()

    def get_tag(self, repository_directory, tag):
        ''' Returns hash of specified tag. '''
        return self._execute(['show-ref', '--tags', '-s', tag], repository_directory)

    def get_tags(self, repository_directory):
        ''' Returns an array of tag/commit hash tuples for the specified repo. '''
        output = self._execute(['show-ref', '--tags'], repository_directory)
        # This command lists tags starting with '/refs/tags'; name starts from the 11th character
        return [(tag[10:], cmt) for (cmt, tag) in [line.split(' ') for line in output.splitlines()]]

    def add_tag(self, repository_directory, tag_name, tag_message):
        self._execute(['tag', '-a', tag_name, '-m', tag_message], repository_directory)

    def push_tag(self, repository_directory, tag_name):
        self._execute(['push', 'origin', tag_name], repository_directory)

    def merge(self, repository_directory, commit):
        self._execute(['merge', commit], repository_directory)

    def add_remote(self, repository_directory, name, url):
        self._execute(['remote', 'add', name, url], repository_directory)

    # TODO (jpearce) Reconcile this with the similar function in the neighouring Npm class
    def _execute(self, cmd_args, repository_directory=None):
        cmd_args.insert(0, 'git')
        if repository_directory:
            cmd_args.insert(1, '-C')
            cmd_args.insert(2, repository_directory)

        if self._verbose:
            output = fs.cross_platform_check_output(cmd_args, stderr=subprocess.STDOUT)
            print output
        else:
            with open(os.devnull, 'w') as devnull:
                output = fs.cross_platform_check_output(cmd_args, stderr=devnull)
        return output
