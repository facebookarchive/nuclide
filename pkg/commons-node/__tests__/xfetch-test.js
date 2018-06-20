'use strict';

var _fs = _interopRequireDefault(require('fs'));

var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('../../../modules/nuclide-commons/fsPromise'));
}

var _http = _interopRequireDefault(require('http'));

var _xfetch;

function _load_xfetch() {
  return _xfetch = _interopRequireDefault(require('../xfetch'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('xfetch', () => {
  beforeEach(() => {
    // Normally we get a stubbed version during tests.
    jest.spyOn(require('../system-info'), 'isRunningInTest').mockReturnValue(false);
  });

  it('is the correct module', () => {
    if (typeof atom === 'undefined') {
      expect((_xfetch || _load_xfetch()).default).toBe(require('node-fetch'));
    } else {
      expect((_xfetch || _load_xfetch()).default).toBe(global.fetch);
    }
  });

  it('rejects a connection error', async () => {
    let errorThrown;
    try {
      await (0, (_xfetch || _load_xfetch()).default)('http://0.0.0.0:62222');
    } catch (err) {
      errorThrown = err;
    }
    if (typeof atom === 'undefined') {
      expect(errorThrown).toMatchSnapshot('if');
    } else {
      expect(errorThrown).toMatchSnapshot('else');
    }
  });

  describe('with a connection', () => {
    let server;
    let port;

    beforeEach(() => {
      server = _http.default.createServer((req, res) => {
        _fs.default.readFile(req.url, 'utf8', (err, contents) => {
          if (err) {
            res.statusCode = 404;
            res.end('Not found', 'utf8');
          } else {
            res.setHeader('Content-Type', 'text/plain;charset=utf8');
            res.end(contents, 'utf8');
          }
        });
      }).listen(0);
      port = server.address().port;
    });

    afterEach(() => {
      if (!server) {
        throw new Error('Invariant violation: "server"');
      }

      server.close();
    });

    it('can do a 2xx GET request', async () => {
      await (async () => {
        const realFilename = __filename;
        const response = await (0, (_xfetch || _load_xfetch()).default)(`http://0.0.0.0:${port}${realFilename}`);
        expect(response.ok).toBe(true);

        const text = await response.text();
        const contents = await (_fsPromise || _load_fsPromise()).default.readFile(realFilename, 'utf8');
        expect(text).toEqual(contents);
      })();
    });

    it('can do a 404 GET request', async () => {
      await (async () => {
        // eslint-disable-next-line no-path-concat
        const nonexistingFilename = __filename + 'XXX';
        const response = await (0, (_xfetch || _load_xfetch()).default)(`http://0.0.0.0:${port}${nonexistingFilename}`);
        expect(response.ok).toBe(false);
        expect(response.status).toBe(404);
        expect(response.statusText).toBe('Not Found');
      })();
    });
  });
}); /**
     * Copyright (c) 2015-present, Facebook, Inc.
     * All rights reserved.
     *
     * This source code is licensed under the license found in the LICENSE file in
     * the root directory of this source tree.
     *
     * 
     * @format
     */