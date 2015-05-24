#!/usr/bin/env python

# Copyright (c) 2015-present, Facebook, Inc.
# All rights reserved.
#
# This source code is licensed under the license found in the LICENSE file in
# the root directory of this source tree.

import getpass
import json
import nuclide_server_manager
import os
import socket
import subprocess
import sys
import tempfile
import unittest

from nuclide_server_test_base import NuclideServerTestBase
from nuclide_server_manager import NuclideServerManager

WORK_DIR = os.path.dirname(os.path.realpath(__file__))
TARGET_SCRIPT= os.path.join(WORK_DIR, 'nuclide_server_manager.py')
VERSION_FILE = os.path.join(WORK_DIR, '../VERSION_INFO')

class NuclideServerManagerTest(NuclideServerTestBase):

    def cleanup(self):
        super(NuclideServerManagerTest, self).cleanup()
        # Delete version file.
        if os.path.isfile(VERSION_FILE):
            os.remove(VERSION_FILE)

    def verify_key(self, text):
        self.assertTrue('BEGIN RSA PRIVATE KEY' in text)
        self.assertTrue('END RSA PRIVATE KEY' in text)

    def verify_cert(self, text):
        self.assertTrue('BEGIN CERTIFICATE' in text)
        self.assertTrue('END CERTIFICATE' in text)

    def verify_nuclide_server_output(self, args, version, workspace, port, secure):
        p = subprocess.Popen(args, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        out, err = p.communicate()

        # Verify return code and version in output.
        self.assertEquals(0, p.returncode, err)
        json_ret = json.loads(out)
        self.assertEquals(str(version), json_ret['version'])
        # Verify workspace gets resolved.
        self.assertEquals(os.path.realpath(workspace), json_ret['workspace'])
        if port is not None:
            self.assertEquals(port, json_ret['port'])

        if secure:
            self.assertTrue('key' in json_ret)
            self.verify_key(json_ret['key'])
            self.assertTrue('cert' in json_ret)
            self.verify_cert(json_ret['cert'])
            self.assertTrue('ca' in json_ret)
            self.verify_cert(json_ret['ca'])
            hostname = '%s.nuclide.%s' % (getpass.getuser(), socket.gethostname())
            self.assertEquals(hostname, json_ret['hostname'])
        return json_ret['port']

    def call_nuclide_server_twice_and_verify(self, version1, workspace,
        version2=None, port=None, secure=False):
        # Generate version file.
        with open(VERSION_FILE, 'w') as f:
            json.dump({'Version': version1}, f)

        args = [TARGET_SCRIPT]
        if port is not None:
            args.append('-p')
            args.append(str(port))

        args.append('-w')
        args.append(workspace)

        # Set timeout
        args.append('-t')
        args.append('20')

        if secure:
            args.append('-d')
            # Send the test certs files to temp dir.
            args.append(tempfile.gettempdir())
        else:
            args.append('-k')

        # Suppress nohup logging.
        # See nuclide_server.py for details.
        args.append('-q')

        # Get the port from the started Nuclide server, and verify it later.
        port = self.verify_nuclide_server_output(args, version1, workspace, port, secure)

        if version2 is None:
            version2 = version1
        else:
            # Overwrite the version file to test upgrade.
            with open(VERSION_FILE, 'w') as f:
                json.dump({'Version': version2}, f)

        self.verify_nuclide_server_output(args, version2, workspace, port, secure)

    def test_nuclide_server_manager_on_http(self):
        self.call_nuclide_server_twice_and_verify(version1=12, port=9090, workspace='.')
        self.call_nuclide_server_twice_and_verify(version1=9, port=9091, workspace='..')
        manager = NuclideServerManager({})
        servers = manager.list_servers()
        self.assertEquals(len(servers), 2)
        port0 = servers[0].port
        port1 = servers[1].port
        # A good enough test.
        self.assertEquals(port0+port1, 9090+9091)

    def test_upgrade(self):
        self.call_nuclide_server_twice_and_verify(version1=9, version2=12, port=9090, workspace='.')

    # This tests the find open port feature and uses http.
    def test_find_open_port(self):
        # Without specifying the port, it will find an open port and start the server.
        self.call_nuclide_server_twice_and_verify(version1=9, workspace='..')

    def test_find_open_port_and_upgrade(self):
        # Nuclide server shall be able to find open port and upgrade it on the same port.
        self.call_nuclide_server_twice_and_verify(version1=9, version2=12, workspace='.')

    def test_nuclide_server_manager_on_https(self):
        self.call_nuclide_server_twice_and_verify(version1=12, workspace='.', secure=True)
        manager = NuclideServerManager({})
        servers = manager.list_servers()
        self.assertEquals(len(servers), 1)
        # Must be one of the open ports.
        self.assertTrue(servers[0].port in nuclide_server_manager.OPEN_PORTS)

    def test_common_name(self):
        parser = nuclide_server_manager.get_option_parser()
        # Start a Nuclide server using default parameters.
        # It will get a default common name like user.nuclide.host
        options, _ = parser.parse_args([])
        manager = NuclideServerManager(options)
        self.assertEquals(len(manager.list_servers()), 0)
        self.assertEquals(manager.start_nuclide(), 0)
        self.assertEquals(len(manager.list_servers()), 1)
        # Change the default common name and verify it upgrades the existing server.
        options, _ = parser.parse_args(['-n', 'localhost']);
        manager = NuclideServerManager(options)
        self.assertEquals(manager.start_nuclide(), 0)
        servers = manager.list_servers()
        self.assertEquals(len(servers), 1)
        # Verify the new common name.
        self.assertEquals(servers[0].get_common_name(), 'localhost')

if __name__ == '__main__':
    unittest.main()
