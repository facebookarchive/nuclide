'use strict';

var _uri;

function _load_uri() {
  return _uri = _interopRequireWildcard(require('../lib/uri'));
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

describe('uri', () => {
  describe('dedupeUris', () => {
    it('linux paths', () => {
      expect((_uri || _load_uri()).dedupeUris(['/bbb/ccc/ddd', '/bbb/ccc', '/aaa/bbb', '/aaa/ccc'])).toEqual(['/aaa/bbb', '/aaa/ccc', '/bbb/ccc']);
    });

    it('remote paths', () => {
      expect((_uri || _load_uri()).dedupeUris(['nuclide://host/bbb/ccc/ddd', 'nuclide://host/bbb/ccc', 'nuclide://host/aaa/bbb', 'nuclide://host/aaa/ccc'])).toEqual(['nuclide://host/aaa/bbb', 'nuclide://host/aaa/ccc', 'nuclide://host/bbb/ccc']);
    });

    it('diskless windows paths', () => {
      expect((_uri || _load_uri()).dedupeUris(['\\bbb\\ccc\\ddd', '\\bbb\\ccc', '\\aaa\\bbb', '\\aaa\\ccc'])).toEqual(['\\aaa\\bbb', '\\aaa\\ccc', '\\bbb\\ccc']);
    });

    it('windows paths with a disk', () => {
      expect((_uri || _load_uri()).dedupeUris(['C:\\bbb\\ccc\\ddd', 'C:\\bbb\\ccc', 'C:\\aaa\\bbb', 'C:\\aaa\\ccc'])).toEqual(['C:\\aaa\\bbb', 'C:\\aaa\\ccc', 'C:\\bbb\\ccc']);
    });
  });
}); /**
     * Copyright (c) 2015-present, Facebook, Inc.
     * All rights reserved.
     *
     * This source code is licensed under the license found in the LICENSE file in
     * the root directory of this source tree.
     *
     *  strict-local
     * @format
     */