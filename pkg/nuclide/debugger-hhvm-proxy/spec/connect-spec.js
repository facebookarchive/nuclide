'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */


var net = require('net');
var {makeDbgpMessage} = require('../lib/utils');
var {getFirstConnection} = require('../lib/connect');

var payload1 =
`<init
  xmlns="urn:debugger_protocol_v1"
  xmlns:xdebug="http://xdebug.org/dbgp/xdebug"
  fileuri="file://test1.php"
  language="PHP"
  protocol_version="1.0"
  appid="1"
  idekey="username1">

  <engine version=""><![CDATA[xdebug]]></engine>
  <author>
    <![CDATA[HHVM]]>
  </author>
  <url>
    <![CDATA[http://hhvm.com/]]>
  </url>
  <copyright>
    <![CDATA[Copyright (c) 2002-2013 by Derick Rethans]]>
  </copyright>
</init>`;

var payload2 =
`<init
  xmlns="urn:debugger_protocol_v1"
  xmlns:xdebug="http://xdebug.org/dbgp/xdebug"
  fileuri="file://test2.php"
  language="PHP"
  protocol_version="1.0"
  appid="2"
  idekey="username2">

  <engine version=""><![CDATA[xdebug]]></engine>
  <author>
    <![CDATA[HHVM]]>
  </author>
  <url>
    <![CDATA[http://hhvm.com/]]>
  </url>
  <copyright>
    <![CDATA[Copyright (c) 2002-2013 by Derick Rethans]]>
  </copyright>
</init>`;

describe('debugger-hhvm-proxy connect', () => {

    it('getFirstConnection', () => {

      // Note: Ensure this is different ports used in other tests.
      var port = 7779;

      var hadError = false;
      var hadConnection = false;

      var connectionPromise;
      var client;

      runs(() => {
        connectionPromise = getFirstConnection(port, null, null, null);
        client = net.connect({port}, () => { hadConnection = true; });
        client.on('error', () => { hadError = true; });

        client.write(makeDbgpMessage(payload1));
      });

      waitsForPromise(async () => {
        var dbgpSocket = await connectionPromise;
        dbgpSocket.destroy();

        expect(hadConnection).toBe(true);
        expect(hadError).toBe(false);
        client.destroy();
      });
    });

    it('getFirstConnection filtering', () => {
      // Note: Ensure this is different ports used in other tests.
      var port = 7780;

      var connectionComplete = false;

      var connectionPromise = getFirstConnection(port, 2, 'username2', 'test2.php').then(connection => {
        connectionComplete = true;
        return connection;
      });

      // Client with different pid should fail to complete connection
      // and should close the socket immediately.
      var hadError1 = false;
      var hadConnection1 = false;
      var hadEnd1 = false;
      var hadClose1 = false;
      var client1 = net.connect({port}, () => { hadConnection1 = true; });

      runs(() => {
        client1.on('error', () => { hadError1 = true; });
        client1.on('close', () => { hadClose1 = true; });
        client1.on('end', () => { hadEnd1 = true; });
        client1.write(makeDbgpMessage(payload1));
      });
      waitsFor(() => hadClose1);
      runs(() => {
        expect(hadConnection1).toBe(true);
        expect(hadError1).toBe(false);
        expect(hadEnd1).toBe(true);
        expect(hadClose1).toBe(true);
        expect(connectionComplete).toBe(false);

        client1.destroy();
      });

      // Client with correct pid should complete the connection.
      var hadError2 = false;
      var hadConnection2 = false;
      var hadEnd2 = false;
      var hadClose2 = false;
      var client2 = net.connect({port}, () => { hadConnection2 = true; });
      runs(() => {
        client2.on('error', () => { hadError2 = true; });
        client2.on('end', () => { hadEnd2 = true; });
        client2.on('close', () => { hadClose2 = true; });
        client2.write(makeDbgpMessage(payload2));
      });
      waitsForPromise(async () => {
        var dbgpSocket = await connectionPromise;
        expect(connectionComplete).toBe(true);
        expect(hadClose2).toBe(false);
        expect(hadEnd2).toBe(false);
        expect(hadConnection2).toBe(true);
        expect(hadError2).toBe(false);

        dbgpSocket.destroy();
        client2.destroy();
      });
    });

    // TODO: Add tests for connection errors.
});
