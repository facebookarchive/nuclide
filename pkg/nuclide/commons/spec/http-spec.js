'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import type {Server} from 'http';

const invariant = require('assert');
const fs = require('fs');
const {fsPromise, httpPromise} = require('../lib/main');
const http = require('http');
const path = require('path');
let server: ?Server;
let port;


function createSimpleServer(): Server {
  // $FlowIssue
  server = http.createServer((req, res) => {
    const fileName = path.basename(req.url);
    if (fileName === 'echo') { // A special path that just echoes back the request headers.
      res.end(JSON.stringify(req.headers));
    } else {
      const filePath = path.join(__dirname, 'fixtures', fileName);
      fs.readFile(filePath, {encoding: 'utf8'}, (err, contents) => {
        if (err) {
          res.statusCode = 404;
          res.end('Not found', 'utf8');
        } else {
          res.setHeader('Content-Type', 'text/html;charset=utf8' );
          res.end(contents, 'utf8');
        }
      });
    }
  }).listen(0);

  const connections = {};

  server.on('connection', (conn) => {
    const key = conn.remoteAddress + ':' + conn.remotePort;
    connections[key] = conn;
    conn.on('close', () => {
      delete connections[key];
    });
  });

  server.destroy = (cb) => {
    invariant(server);
    server.close(cb);
    for (const key in connections) {
      connections[key].destroy();
    }
  };

  return server;
}

async function testGetStaticFile(fileName: string): Promise<void> {

  let content = await httpPromise.get(`http://localhost:${port}/${fileName}`);

  let expected = await fsPromise.readFile(path.join(__dirname, 'fixtures', fileName),
      {encoding: 'utf8'});

  expect(content).toEqual(expected);

  const tempfile = await fsPromise.tempfile();
  await httpPromise.download(`http://localhost:${port}/${fileName}`,
      tempfile);

  content = await fsPromise.readFile(tempfile, {encoding: 'utf8'});
  expected = await fsPromise.readFile(path.join(__dirname, 'fixtures', fileName),
      {encoding: 'utf8'});

  expect(content).toEqual(expected);
}

async function testGetFailure(url: string): Promise<void> {
  let error;
  try {
    await httpPromise.get(url);
  } catch (e) {
    error = e;
  }
  expect(!!(error)).toBe(true);

  error = null;
  const tempfile = await fsPromise.tempfile();
  try {
    await httpPromise.download(url, tempfile);
  } catch (e) {
    error = e;
  }
  expect(!!(error)).toBe(true);
}

describe('Async http get/download test suite', () => {

  beforeEach(() => {
    server = createSimpleServer();
    port = server.address().port;
  });

  afterEach(() => {
    invariant(server);
    server.close();
  });

  it('returns a Promise that resolves to the content from a valid endpoint', () => {
    waitsForPromise(async () => {
      await testGetStaticFile('test');
    });
  });

  it('returns a Promise that resolves to the content, echoing custom headers', () => {
    waitsForPromise(async () => {
      const requestHeaders = {
        foo: 'bar',
        baz: 'qux',
      };
      const content = await httpPromise.get(`http://localhost:${port}/echo`, requestHeaders);
      const responseHeaders = JSON.parse(content);
      Object.keys(requestHeaders).forEach(header => {
        expect(responseHeaders[header]).toEqual(requestHeaders[header]);
      });
    });
  });

  it('returns a rejected Promise when it fails to get content from an invalid endpoint', () => {
    waitsForPromise(async () => {
      await testGetFailure(`http://localhost:${port}/InvalidPath`);
      await testGetFailure(`http://invalidhost:${port}/InvalidPath`);
    });
  });
});
