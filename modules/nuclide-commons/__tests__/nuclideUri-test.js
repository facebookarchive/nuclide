"use strict";

function _nuclideUri() {
  const data = _interopRequireWildcard(require("../nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

var _path = _interopRequireDefault(require("path"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *  strict-local
 * @format
 */
// eslint-disable-next-line nuclide-internal/prefer-nuclide-uri
describe('nuclide-uri', () => {
  const localUri = '/usr/local/file';
  const badRemoteUriNoPath = 'nuclide://fb.com';
  const atomUri = 'atom://bla/bla';

  const remoteUri = _nuclideUri().default.createRemoteUri('fb.com', '/usr/local');

  const remoteUriWithSpaces = _nuclideUri().default.createRemoteUri('fb.com', '/a b/c d');

  const remoteUriWithHashes = _nuclideUri().default.createRemoteUri('fb.co.uk', '/ab/#c.d  #');

  const localArchiveUri = '/etc/file.zip!a';

  const remoteArchiveUri = _nuclideUri().default.createRemoteUri('fb.com', '/file.zip!a.txt');

  const endsWithExclamationUri = '/module/!! WARNING !!';
  const archiveSuffixUri = '/etc/file.zip!';
  it('isRemote', () => {
    expect(_nuclideUri().default.isRemote('/')).toBe(false);
    expect(_nuclideUri().default.isRemote(remoteUri)).toBe(true);
    expect(_nuclideUri().default.isRemote(atomUri)).toBe(false);
    expect(_nuclideUri().default.isRemote(localArchiveUri)).toBe(false);
    expect(_nuclideUri().default.isRemote(remoteArchiveUri)).toBe(true);
    expect(_nuclideUri().default.isRemote(endsWithExclamationUri)).toBe(false);
  });
  it('isLocal', () => {
    expect(_nuclideUri().default.isLocal('/')).toBe(true);
    expect(_nuclideUri().default.isLocal(remoteUri)).toBe(false);
    expect(_nuclideUri().default.isLocal('C:\\abc')).toBe(true);
    expect(_nuclideUri().default.isLocal(atomUri)).toBe(false);
    expect(_nuclideUri().default.isLocal(localArchiveUri)).toBe(true);
    expect(_nuclideUri().default.isLocal(remoteArchiveUri)).toBe(false);
    expect(_nuclideUri().default.isLocal(endsWithExclamationUri)).toBe(true);
  });
  it('createRemoteUri', () => {
    expect(remoteUri).toBe('nuclide://fb.com/usr/local');
    expect(remoteUriWithSpaces).toBe('nuclide://fb.com/a b/c d');
    expect(remoteArchiveUri).toBe('nuclide://fb.com/file.zip!a.txt');
  });
  it('join', () => {
    expect(_nuclideUri().default.join.bind(null, badRemoteUriNoPath, '../foo')).toThrow();
    expect(_nuclideUri().default.join('/usr/local', 'bin')).toBe('/usr/local/bin');
    expect(_nuclideUri().default.join(remoteUri, 'bin')).toBe('nuclide://fb.com/usr/local/bin');
    expect(_nuclideUri().default.join(localArchiveUri, 'b.txt')).toBe('/etc/file.zip!a/b.txt');
    expect(_nuclideUri().default.join(endsWithExclamationUri, 'b.txt')).toBe('/module/!! WARNING !!/b.txt');
    expect(_nuclideUri().default.join('/usr/local', '..')).toBe('/usr');
    expect(_nuclideUri().default.join(remoteUri, '..')).toBe('nuclide://fb.com/usr');
    expect(() => _nuclideUri().default.join(archiveSuffixUri)).toThrow();
  });
  it('archiveJoin', () => {
    expect(_nuclideUri().default.archiveJoin('/file.zip', 'a.txt')).toBe('/file.zip!a.txt');
    expect(() => _nuclideUri().default.archiveJoin(archiveSuffixUri, 'a.txt')).toThrow();
    expect(() => _nuclideUri().default.archiveJoin('/dir', 'a.txt')).toThrow();
  });
  describe('parsing remote', () => {
    it('handles simple paths', () => {
      expect(_nuclideUri().default.getHostname(remoteUri)).toBe('fb.com');
      expect(_nuclideUri().default.getPath(remoteUri)).toBe('/usr/local');
    });
    it('does not encode space characters', () => {
      expect(_nuclideUri().default.getHostname(remoteUriWithSpaces)).toBe('fb.com');
      expect(_nuclideUri().default.getPath(remoteUriWithSpaces)).toBe('/a b/c d');
    });
    it('treats hash symbols as literals, part of the path', () => {
      const parsedUri = _nuclideUri().default.parse(remoteUriWithHashes);

      expect(parsedUri.hostname).toBe('fb.co.uk');
      expect(parsedUri.path).toBe('/ab/#c.d  #');
    });
    it('throws when given an illegal URI', () => {
      expect(() => _nuclideUri().default.getHostname(archiveSuffixUri)).toThrow();
      expect(() => _nuclideUri().default.getPath(archiveSuffixUri)).toThrow();
      expect(() => _nuclideUri().default.parse(archiveSuffixUri)).toThrow();
    });
  });
  it('parsing local', () => {
    expect(() => _nuclideUri().default.getHostname(localUri)).toThrow();
    expect(() => _nuclideUri().default.getHostname(localArchiveUri)).toThrow();
    expect(_nuclideUri().default.getPath(localUri)).toBe(localUri);
    expect(_nuclideUri().default.getPath(localArchiveUri)).toBe(localArchiveUri);
    expect(_nuclideUri().default.getPath(remoteArchiveUri)).toBe('/file.zip!a.txt');
    expect(_nuclideUri().default.getPath(endsWithExclamationUri)).toBe(endsWithExclamationUri);
    expect(() => _nuclideUri().default.getPath('nuclide://host/archive.zip!')).toThrow();
    expect(() => _nuclideUri().default.parseRemoteUri(localUri)).toThrow();
  });
  it('basename', () => {
    expect(_nuclideUri().default.basename('/')).toBe('');
    expect(_nuclideUri().default.basename('/abc')).toBe('abc');
    expect(_nuclideUri().default.basename('/abc/')).toBe('abc');
    expect(_nuclideUri().default.basename('/abc/def')).toBe('def');
    expect(_nuclideUri().default.basename('/abc/def/')).toBe('def');
    expect(_nuclideUri().default.basename('nuclide://host/')).toBe('');
    expect(_nuclideUri().default.basename('nuclide://host/abc')).toBe('abc');
    expect(_nuclideUri().default.basename('nuclide://host/abc/')).toBe('abc');
    expect(_nuclideUri().default.basename('nuclide://host/abc/def')).toBe('def');
    expect(_nuclideUri().default.basename('nuclide://host/abc/def/')).toBe('def');
    expect(_nuclideUri().default.basename('nuclide://host/a c/d f')).toBe('d f');
    expect(_nuclideUri().default.basename('/z.zip!abc')).toBe('abc');
    expect(_nuclideUri().default.basename('/z.zip!abc/')).toBe('abc');
    expect(_nuclideUri().default.basename('/z.zip!abc/def')).toBe('def');
    expect(_nuclideUri().default.basename('/abc/def!ghi')).toBe('def!ghi');
    expect(_nuclideUri().default.basename('/abc/def.txt!ghi')).toBe('def.txt!ghi');
    expect(_nuclideUri().default.basename('nuclide://host/z.zip!abc')).toBe('abc');
    expect(_nuclideUri().default.basename('nuclide://host/z.zip!abc/')).toBe('abc');
    expect(_nuclideUri().default.basename('nuclide://host/z.zip!abc/def')).toBe('def');
    expect(_nuclideUri().default.basename('C:\\')).toBe('');
    expect(_nuclideUri().default.basename('C:\\abc')).toBe('abc');
    expect(_nuclideUri().default.basename('C:\\abc\\')).toBe('abc');
    expect(_nuclideUri().default.basename('C:\\abc\\def')).toBe('def');
    expect(_nuclideUri().default.basename('C:\\abc\\def\\')).toBe('def');
    expect(_nuclideUri().default.basename('\\abc\\def')).toBe('def');
    expect(_nuclideUri().default.basename('\\abc\\def\\')).toBe('def');
    expect(_nuclideUri().default.basename('C:\\z.zip!abc')).toBe('abc');
    expect(_nuclideUri().default.basename('C:\\z.zip!abc\\')).toBe('abc');
    expect(_nuclideUri().default.basename('C:\\z.zip!abc\\def')).toBe('def');
    expect(_nuclideUri().default.basename('C:\\abc\\def!ghi')).toBe('def!ghi');
    expect(_nuclideUri().default.basename('C:\\abc\\def.txt!ghi')).toBe('def.txt!ghi');
    expect(_nuclideUri().default.basename('\\z.zip!abc')).toBe('abc');
    expect(_nuclideUri().default.basename('\\z.zip!abc\\')).toBe('abc');
    expect(_nuclideUri().default.basename('\\z.zip!abc\\def')).toBe('def');
    expect(_nuclideUri().default.basename('\\abc\\def!ghi')).toBe('def!ghi');
    expect(_nuclideUri().default.basename('\\abc\\def.txt!ghi')).toBe('def.txt!ghi');
    expect(() => _nuclideUri().default.basename(archiveSuffixUri)).toThrow();
  });
  it('dirname', () => {
    expect(_nuclideUri().default.dirname('/')).toBe('/');
    expect(_nuclideUri().default.dirname('/abc')).toBe('/');
    expect(_nuclideUri().default.dirname('/abc/')).toBe('/');
    expect(_nuclideUri().default.dirname('/abc/def')).toBe('/abc');
    expect(_nuclideUri().default.dirname('/abc/def/')).toBe('/abc');
    expect(_nuclideUri().default.dirname('nuclide://host/')).toBe('nuclide://host/');
    expect(_nuclideUri().default.dirname('nuclide://host/abc')).toBe('nuclide://host/');
    expect(_nuclideUri().default.dirname('nuclide://host/abc/')).toBe('nuclide://host/');
    expect(_nuclideUri().default.dirname('nuclide://host/abc/def')).toBe('nuclide://host/abc');
    expect(_nuclideUri().default.dirname('nuclide://host/abc/def/')).toBe('nuclide://host/abc');
    expect(_nuclideUri().default.dirname('nuclide://host/a c/d f')).toBe('nuclide://host/a c');
    expect(_nuclideUri().default.dirname('/z.zip!abc')).toBe('/z.zip');
    expect(_nuclideUri().default.dirname('/z.zip!abc/')).toBe('/z.zip');
    expect(_nuclideUri().default.dirname('/z.zip!abc/def')).toBe('/z.zip!abc');
    expect(_nuclideUri().default.dirname('/abc/def!ghi')).toBe('/abc');
    expect(_nuclideUri().default.dirname('/abc/def.txt!ghi')).toBe('/abc');
    expect(_nuclideUri().default.dirname('nuclide://host/z.zip!abc')).toBe('nuclide://host/z.zip');
    expect(_nuclideUri().default.dirname('nuclide://host/z.zip!abc/')).toBe('nuclide://host/z.zip');
    expect(_nuclideUri().default.dirname('nuclide://host/z.zip!abc/def')).toBe('nuclide://host/z.zip!abc');
    expect(_nuclideUri().default.dirname('C:\\')).toBe('C:\\');
    expect(_nuclideUri().default.dirname('C:\\abc')).toBe('C:\\');
    expect(_nuclideUri().default.dirname('C:\\abc\\')).toBe('C:\\');
    expect(_nuclideUri().default.dirname('C:\\abc\\def')).toBe('C:\\abc');
    expect(_nuclideUri().default.dirname('C:\\abc\\def\\')).toBe('C:\\abc');
    expect(_nuclideUri().default.dirname('\\abc\\def')).toBe('\\abc');
    expect(_nuclideUri().default.dirname('\\abc\\def\\')).toBe('\\abc');
    expect(_nuclideUri().default.dirname('C:\\z.zip!abc')).toBe('C:\\z.zip');
    expect(_nuclideUri().default.dirname('C:\\z.zip!abc/')).toBe('C:\\z.zip');
    expect(_nuclideUri().default.dirname('C:\\z.zip!abc/def')).toBe('C:\\z.zip!abc');
    expect(_nuclideUri().default.dirname('C:\\abc\\def!ghi')).toBe('C:\\abc');
    expect(_nuclideUri().default.dirname('C:\\abc\\def.txt!ghi')).toBe('C:\\abc');
    expect(_nuclideUri().default.dirname('\\z.zip!abc')).toBe('\\z.zip');
    expect(_nuclideUri().default.dirname('\\z.zip!abc/')).toBe('\\z.zip');
    expect(_nuclideUri().default.dirname('\\z.zip!abc/def')).toBe('\\z.zip!abc');
    expect(_nuclideUri().default.dirname('\\abc\\def!ghi')).toBe('\\abc');
    expect(_nuclideUri().default.dirname('\\abc\\def.txt!ghi')).toBe('\\abc');
    expect(() => _nuclideUri().default.dirname(archiveSuffixUri)).toThrow();
  });
  it('extname', () => {
    expect(_nuclideUri().default.extname('/abc')).toBe('');
    expect(_nuclideUri().default.extname('/abc.')).toBe('.');
    expect(_nuclideUri().default.extname('/abc.txt')).toBe('.txt');
    expect(_nuclideUri().default.extname('/abc/def.html')).toBe('.html');
    expect(_nuclideUri().default.extname('/abc/def/')).toBe('');
    expect(_nuclideUri().default.extname('/abc/def.dir/')).toBe('.dir');
    expect(_nuclideUri().default.extname('nuclide://host/')).toBe('');
    expect(_nuclideUri().default.extname('nuclide://host/abc')).toBe('');
    expect(_nuclideUri().default.extname('nuclide://host/abc.txt')).toBe('.txt');
    expect(_nuclideUri().default.extname('nuclide://host/abc.')).toBe('.');
    expect(_nuclideUri().default.extname('nuclide://host/abc/')).toBe('');
    expect(_nuclideUri().default.extname('nuclide://host/abc/def')).toBe('');
    expect(_nuclideUri().default.extname('nuclide://host/abc/def.js')).toBe('.js');
    expect(_nuclideUri().default.extname('/z.zip!abc')).toBe('');
    expect(_nuclideUri().default.extname('/z.zip!abc.zip')).toBe('.zip');
    expect(_nuclideUri().default.extname('/abc.txt!def')).toBe('.txt!def');
    expect(_nuclideUri().default.extname('C:\\')).toBe('');
    expect(_nuclideUri().default.extname('C:\\abc')).toBe('');
    expect(_nuclideUri().default.extname('C:\\abc\\')).toBe('');
    expect(_nuclideUri().default.extname('C:\\abc.')).toBe('.');
    expect(_nuclideUri().default.extname('C:\\abc.js')).toBe('.js');
    expect(_nuclideUri().default.extname('C:\\abc\\def')).toBe('');
    expect(_nuclideUri().default.extname('C:\\abc\\def\\')).toBe('');
    expect(_nuclideUri().default.extname('C:\\abc\\def.')).toBe('.');
    expect(_nuclideUri().default.extname('C:\\abc\\def.html')).toBe('.html');
    expect(_nuclideUri().default.extname('\\abc\\def')).toBe('');
    expect(_nuclideUri().default.extname('\\abc\\def.dir\\')).toBe('.dir');
    expect(_nuclideUri().default.extname('\\abc\\def.')).toBe('.');
    expect(_nuclideUri().default.extname('\\abc\\def.xml')).toBe('.xml');
    expect(_nuclideUri().default.extname('C:\\z.zip!abc')).toBe('');
    expect(_nuclideUri().default.extname('C:\\z.zip!abc.zip')).toBe('.zip');
    expect(_nuclideUri().default.extname('C:\\abc.txt!def')).toBe('.txt!def');
    expect(_nuclideUri().default.extname('\\z.zip!abc')).toBe('');
    expect(_nuclideUri().default.extname('\\z.zip!abc.zip')).toBe('.zip');
    expect(_nuclideUri().default.extname('\\abc.txt!def')).toBe('.txt!def');
    expect(() => _nuclideUri().default.extname(archiveSuffixUri)).toThrow();
  });
  it('getParent', () => {
    expect(_nuclideUri().default.getParent(localUri)).toBe('/usr/local');
    expect(_nuclideUri().default.getParent(remoteUri)).toBe('nuclide://fb.com/usr');
    expect(_nuclideUri().default.getParent('/etc/file.zip!a')).toBe('/etc/file.zip');
    expect(_nuclideUri().default.getParent(localArchiveUri)).toBe('/etc/file.zip');
    expect(_nuclideUri().default.getParent(remoteArchiveUri)).toBe('nuclide://fb.com/file.zip');
    expect(_nuclideUri().default.getParent(endsWithExclamationUri)).toBe('/module');
    expect(_nuclideUri().default.getParent('/abc/def!ghi')).toBe('/abc');
    expect(() => _nuclideUri().default.getParent(archiveSuffixUri)).toThrow();
  });
  it('contains', () => {
    expect(_nuclideUri().default.contains('/usr/local', localUri)).toBe(true);
    expect(_nuclideUri().default.contains('nuclide://fb.com/usr', remoteUri)).toBe(true);
    expect(_nuclideUri().default.contains('/foo/bar/', '/foo/bar/abc.txt')).toBe(true);
    expect(_nuclideUri().default.contains('/foo/bar', '/foo/bar/')).toBe(true);
    expect(_nuclideUri().default.contains('/foo/bar/', '/foo/bar/')).toBe(true);
    expect(_nuclideUri().default.contains('/foo/bar/', '/foo/bar')).toBe(true);
    expect(_nuclideUri().default.contains('/z.zip', '/z.zip!abc')).toBe(true);
    expect(_nuclideUri().default.contains('nuclide://fb.com/z.zip', 'nuclide://fb.com/z.zip!abc')).toBe(true);
    expect(_nuclideUri().default.contains('/z.zip!abc', '/z.zip!abc/def')).toBe(true);
    expect(_nuclideUri().default.contains('nuclide://fb.com/z.zip!abc', 'nuclide://fb.com/z.zip!abc/def')).toBe(true);
    expect(_nuclideUri().default.contains('/abc', '/abc!def')).toBe(false);
    expect(() => _nuclideUri().default.contains(archiveSuffixUri, '/foo/bar')).toThrow();
    expect(() => _nuclideUri().default.contains('/foo/bar', archiveSuffixUri)).toThrow();
  });
  it('collapse', () => {
    expect(_nuclideUri().default.collapse(['/a', '/b'])).toEqual(['/a', '/b']);
    expect(_nuclideUri().default.collapse(['/a/b/c/d', '/a', '/a/b'])).toEqual(['/a']);
    expect(_nuclideUri().default.collapse(['/a', '/a/b', '/a/b/c'])).toEqual(['/a']);
    expect(_nuclideUri().default.collapse(['/a/b.zip', '/a/b.zip!c', '/a/b.zip!c/d'])).toEqual(['/a/b.zip']);
    expect(_nuclideUri().default.collapse(['/a/b.zip!c', '/a/b.zip!c/d', '/a/b.zip!c/d/e'])).toEqual(['/a/b.zip!c']);
    expect(_nuclideUri().default.collapse(['/a/c', '/a/c/d', '/a/b', '/a/b/c/d/e'])).toEqual(['/a/c', '/a/b']);
    expect(_nuclideUri().default.collapse(['/a/be', '/a/b'])).toEqual(['/a/be', '/a/b']);
    expect(_nuclideUri().default.collapse(['nuclide://fb.com/usr/local', 'nuclide://fb.com/usr/local/test', 'nuclide://facebook.com/usr/local/test'])).toEqual(['nuclide://fb.com/usr/local', 'nuclide://facebook.com/usr/local/test']);
  });
  it('normalize', () => {
    expect(_nuclideUri().default.normalize(localUri)).toBe(localUri);
    expect(_nuclideUri().default.normalize(remoteUri)).toBe(remoteUri);
    expect(_nuclideUri().default.normalize.bind(null, badRemoteUriNoPath)).toThrow();
    expect(_nuclideUri().default.normalize('/usr/local/..')).toBe('/usr');
    expect(_nuclideUri().default.normalize('nuclide://fb.com/usr/local/..')).toBe('nuclide://fb.com/usr');
    expect(_nuclideUri().default.normalize('/a b/c d/..')).toBe('/a b');
    expect(_nuclideUri().default.normalize('/a/b.zip!c/..')).toBe('/a/b.zip');
    expect(_nuclideUri().default.normalize('/a/b.zip!c/d/../../..')).toBe('/a');
    expect(_nuclideUri().default.normalize('/a/b!c/..')).toBe('/a');
    expect(() => _nuclideUri().default.normalize(archiveSuffixUri)).toThrow();
  });
  it('relative', () => {
    expect(() => _nuclideUri().default.relative(localUri, remoteUri)).toThrow();
    expect(_nuclideUri().default.relative(_nuclideUri().default.dirname(remoteUri), remoteUri)).toBe('local');
    expect(_nuclideUri().default.relative(remoteUri, _nuclideUri().default.dirname(remoteUri))).toBe('..');
    expect(_nuclideUri().default.relative(_nuclideUri().default.dirname(remoteUriWithSpaces), remoteUriWithSpaces)).toBe('c d');
    expect(_nuclideUri().default.relative(remoteUriWithSpaces, _nuclideUri().default.dirname(remoteUriWithSpaces))).toBe('..');
    expect(_nuclideUri().default.relative(_nuclideUri().default.dirname(localUri), localUri)).toBe('file');
    expect(_nuclideUri().default.relative(localUri, _nuclideUri().default.dirname(localUri))).toBe('..');
    expect(_nuclideUri().default.relative(_nuclideUri().default.dirname(localArchiveUri), localArchiveUri)).toBe('a');
    expect(_nuclideUri().default.relative(localArchiveUri, _nuclideUri().default.dirname(localArchiveUri))).toBe('..');
    expect(_nuclideUri().default.relative(_nuclideUri().default.dirname(endsWithExclamationUri), endsWithExclamationUri)).toBe('!! WARNING !!');
    expect(_nuclideUri().default.relative(endsWithExclamationUri, _nuclideUri().default.dirname(endsWithExclamationUri))).toBe('..');
    expect(_nuclideUri().default.relative('/a/b.zip!c', '/a/b.zip!d')).toBe('../d');
    expect(_nuclideUri().default.relative('/a/b!c', '/a/b!d')).toBe('../b!d');
    expect(() => _nuclideUri().default.relative(archiveSuffixUri, 'foo')).toThrow();
  });
  it('nuclideUriToDisplayString', () => {
    expect(_nuclideUri().default.nuclideUriToDisplayString(localUri)).toBe(localUri);
    expect(_nuclideUri().default.nuclideUriToDisplayString(remoteUri)).toBe('fb.com:/usr/local');
    expect(_nuclideUri().default.nuclideUriToDisplayString(localArchiveUri)).toBe('/etc/file.zip!a');
    expect(_nuclideUri().default.nuclideUriToDisplayString(remoteArchiveUri)).toBe('fb.com:/file.zip!a.txt');
    expect(_nuclideUri().default.nuclideUriToDisplayString(endsWithExclamationUri)).toBe('/module/!! WARNING !!');
    expect(() => _nuclideUri().default.nuclideUriToDisplayString(archiveSuffixUri)).toThrow();
  });
  describe('isRoot', () => {
    it('plain posix root', () => expect(_nuclideUri().default.isRoot('/')).toBe(true));
    it('double root', () => expect(_nuclideUri().default.isRoot('//')).toBe(false));
    it('/abc', () => expect(_nuclideUri().default.isRoot('/abc')).toBe(false));
    it('abc', () => expect(_nuclideUri().default.isRoot('abc')).toBe(false));
    it('abc/def', () => expect(_nuclideUri().default.isRoot('abc/def')).toBe(false));
    it('/file.zip!', () => expect(() => _nuclideUri().default.isRoot('/file.zip!')).toThrow());
    it('/file.zip!abc', () => expect(_nuclideUri().default.isRoot('/file.zip!abc')).toBe(false));
    it('remote root', () => expect(_nuclideUri().default.isRoot('nuclide://host/')).toBe(true));
    it('remote root with port', () => expect(_nuclideUri().default.isRoot('nuclide://host/')).toBe(true));
    it('remote non-root', () => expect(_nuclideUri().default.isRoot('nuclide://host/abc')).toBe(false));
    it('remote non-root no port', () => {
      expect(_nuclideUri().default.isRoot('nuclide://host/abc')).toBe(false);
    });
    it('win diskless root', () => expect(_nuclideUri().default.isRoot('\\')).toBe(true));
    it('win diskless double root', () => expect(_nuclideUri().default.isRoot('\\\\')).toBe(false));
    it('win diskless non-root', () => expect(_nuclideUri().default.isRoot('\\abc')).toBe(false));
    it('win diskful root', () => expect(_nuclideUri().default.isRoot('C:\\')).toBe(true));
    it('win diskful double root', () => expect(_nuclideUri().default.isRoot('C:\\\\')).toBe(false));
    it('win diskful non-root', () => expect(_nuclideUri().default.isRoot('C:\\abc')).toBe(false));
    it('win relative', () => expect(_nuclideUri().default.isRoot('abc\\def')).toBe(false));
    it('throws on illegal URIs', () => {
      expect(() => _nuclideUri().default.basename(archiveSuffixUri)).toThrow();
    });
  });
  it('adds a proper suffix when needed', () => {
    expect(_nuclideUri().default.ensureTrailingSeparator('/')).toBe('/');
    expect(_nuclideUri().default.ensureTrailingSeparator('/abc')).toBe('/abc/');
    expect(_nuclideUri().default.ensureTrailingSeparator('/abc/')).toBe('/abc/');
    expect(_nuclideUri().default.ensureTrailingSeparator('/abc/def')).toBe('/abc/def/');
    expect(_nuclideUri().default.ensureTrailingSeparator('/abc/def/')).toBe('/abc/def/');
    expect(_nuclideUri().default.ensureTrailingSeparator('nuclide://host')).toBe('nuclide://host/');
    expect(_nuclideUri().default.ensureTrailingSeparator('nuclide://host/')).toBe('nuclide://host/');
    expect(_nuclideUri().default.ensureTrailingSeparator('nuclide://host/abc')).toBe('nuclide://host/abc/');
    expect(_nuclideUri().default.ensureTrailingSeparator('nuclide://host/abc/def')).toBe('nuclide://host/abc/def/');
    expect(_nuclideUri().default.ensureTrailingSeparator('nuclide://host/abc/def/')).toBe('nuclide://host/abc/def/');
    expect(_nuclideUri().default.ensureTrailingSeparator('C:\\')).toBe('C:\\');
    expect(_nuclideUri().default.ensureTrailingSeparator('C:\\abc')).toBe('C:\\abc\\');
    expect(_nuclideUri().default.ensureTrailingSeparator('C:\\abc\\')).toBe('C:\\abc\\');
    expect(_nuclideUri().default.ensureTrailingSeparator('C:\\abc\\def')).toBe('C:\\abc\\def\\');
    expect(_nuclideUri().default.ensureTrailingSeparator('C:\\abc\\def\\')).toBe('C:\\abc\\def\\');
    expect(_nuclideUri().default.ensureTrailingSeparator('\\abc\\def')).toBe('\\abc\\def\\');
    expect(_nuclideUri().default.ensureTrailingSeparator('\\abc\\def\\')).toBe('\\abc\\def\\');
    expect(() => _nuclideUri().default.ensureTrailingSeparator(archiveSuffixUri)).toThrow();
  });
  it('properly removes suffix when needed', () => {
    expect(_nuclideUri().default.trimTrailingSeparator('/')).toBe('/');
    expect(_nuclideUri().default.trimTrailingSeparator('//')).toBe('/');
    expect(_nuclideUri().default.trimTrailingSeparator('/abc')).toBe('/abc');
    expect(_nuclideUri().default.trimTrailingSeparator('/abc/')).toBe('/abc');
    expect(_nuclideUri().default.trimTrailingSeparator('/abc/def')).toBe('/abc/def');
    expect(_nuclideUri().default.trimTrailingSeparator('/abc/def/')).toBe('/abc/def');
    expect(_nuclideUri().default.trimTrailingSeparator('nuclide://host/')).toBe('nuclide://host/');
    expect(_nuclideUri().default.trimTrailingSeparator('nuclide://host//')).toBe('nuclide://host/');
    expect(_nuclideUri().default.trimTrailingSeparator('nuclide://host/')).toBe('nuclide://host/');
    expect(_nuclideUri().default.trimTrailingSeparator('nuclide://host//')).toBe('nuclide://host/');
    expect(_nuclideUri().default.trimTrailingSeparator('nuclide://host/abc')).toBe('nuclide://host/abc');
    expect(_nuclideUri().default.trimTrailingSeparator('nuclide://host/abc/')).toBe('nuclide://host/abc');
    expect(_nuclideUri().default.trimTrailingSeparator('nuclide://host/abc/def')).toBe('nuclide://host/abc/def');
    expect(_nuclideUri().default.trimTrailingSeparator('nuclide://host/abc/def/')).toBe('nuclide://host/abc/def');
    expect(_nuclideUri().default.trimTrailingSeparator('C:\\')).toBe('C:\\');
    expect(_nuclideUri().default.trimTrailingSeparator('C:\\\\')).toBe('C:\\');
    expect(_nuclideUri().default.trimTrailingSeparator('C:\\abc')).toBe('C:\\abc');
    expect(_nuclideUri().default.trimTrailingSeparator('C:\\abc\\')).toBe('C:\\abc');
    expect(_nuclideUri().default.trimTrailingSeparator('C:\\abc\\def')).toBe('C:\\abc\\def');
    expect(_nuclideUri().default.trimTrailingSeparator('C:\\abc\\def\\')).toBe('C:\\abc\\def');
    expect(_nuclideUri().default.trimTrailingSeparator('\\')).toBe('\\');
    expect(_nuclideUri().default.trimTrailingSeparator('\\\\')).toBe('\\');
    expect(_nuclideUri().default.trimTrailingSeparator('\\abc\\def')).toBe('\\abc\\def');
    expect(_nuclideUri().default.trimTrailingSeparator('\\abc\\def\\')).toBe('\\abc\\def');
    expect(() => _nuclideUri().default.trimTrailingSeparator(archiveSuffixUri)).toThrow();
  });
  it('isAbsolute', () => {
    expect(_nuclideUri().default.isAbsolute('/abc')).toBe(true);
    expect(_nuclideUri().default.isAbsolute('/abc/def')).toBe(true);
    expect(_nuclideUri().default.isAbsolute('nuclide://host/')).toBe(true);
    expect(_nuclideUri().default.isAbsolute('nuclide://host/abc')).toBe(true);
    expect(_nuclideUri().default.isAbsolute('nuclide://host/abc/def')).toBe(true);
    expect(_nuclideUri().default.isAbsolute('C:\\abc')).toBe(true);
    expect(_nuclideUri().default.isAbsolute('C:\\abc\\def')).toBe(true);
    expect(_nuclideUri().default.isAbsolute('\\abc')).toBe(true);
    expect(_nuclideUri().default.isAbsolute('\\abc\\def')).toBe(true);
    expect(_nuclideUri().default.isAbsolute('abc')).toBe(false);
    expect(_nuclideUri().default.isAbsolute('abc/def')).toBe(false);
    expect(_nuclideUri().default.isAbsolute('abc\\def')).toBe(false);
    expect(() => _nuclideUri().default.isAbsolute(archiveSuffixUri)).toThrow();
  });
  it('resolve', () => {
    expect(_nuclideUri().default.resolve('/abc')).toBe('/abc');
    expect(_nuclideUri().default.resolve('/abc', '..')).toBe('/');
    expect(_nuclideUri().default.resolve('/abc', '..', '..')).toBe('/');
    expect(_nuclideUri().default.resolve('/abc', '../..')).toBe('/');
    expect(_nuclideUri().default.resolve('/abc/def')).toBe('/abc/def');
    expect(_nuclideUri().default.resolve('/abc/def', 'ghi')).toBe('/abc/def/ghi');
    expect(_nuclideUri().default.resolve('/abc/def', '..', 'ghi')).toBe('/abc/ghi');
    expect(_nuclideUri().default.resolve('/abc/def', '../ghi')).toBe('/abc/ghi');
    expect(_nuclideUri().default.resolve('/abc/def', '/ghi')).toBe('/ghi');
    expect(_nuclideUri().default.resolve('/z.zip!abc')).toBe('/z.zip!abc');
    expect(_nuclideUri().default.resolve('/z.zip!abc', '..')).toBe('/z.zip');
    expect(_nuclideUri().default.resolve('/z.zip!abc', '..', '..')).toBe('/');
    expect(_nuclideUri().default.resolve('/z.zip!abc', '../..')).toBe('/');
    expect(_nuclideUri().default.resolve('/z.zip!abc', 'def')).toBe('/z.zip!abc/def');
    expect(_nuclideUri().default.resolve('/z.zip!abc', '..', 'def')).toBe('/z.zip!def');
    expect(_nuclideUri().default.resolve('/z.zip!abc', '../def')).toBe('/z.zip!def');
    expect(_nuclideUri().default.resolve('/z.zip!abc', '/def')).toBe('/def');
    expect(_nuclideUri().default.resolve('/dir/file!abc')).toBe('/dir/file!abc');
    expect(_nuclideUri().default.resolve('/dir/file!abc', '..')).toBe('/dir');
    expect(_nuclideUri().default.resolve('/dir/file!abc', '..', '..')).toBe('/');
    expect(_nuclideUri().default.resolve('/dir/file!abc', '../..')).toBe('/');
    expect(_nuclideUri().default.resolve('/dir/file!abc', 'def')).toBe('/dir/file!abc/def');
    expect(_nuclideUri().default.resolve('/dir/file!abc', '..', 'def')).toBe('/dir/def');
    expect(_nuclideUri().default.resolve('/dir/file!abc', '../def')).toBe('/dir/def');
    expect(_nuclideUri().default.resolve('/dir/file!abc', '/def')).toBe('/def');
    expect(_nuclideUri().default.resolve('nuclide://host/')).toBe('nuclide://host/');
    expect(_nuclideUri().default.resolve('nuclide://host/', '..')).toBe('nuclide://host/');
    expect(_nuclideUri().default.resolve('nuclide://host/abc')).toBe('nuclide://host/abc');
    expect(_nuclideUri().default.resolve('nuclide://host/abc', '..')).toBe('nuclide://host/');
    expect(_nuclideUri().default.resolve('nuclide://host/abc', '..', '..')).toBe('nuclide://host/');
    expect(_nuclideUri().default.resolve('nuclide://host/abc', '../..')).toBe('nuclide://host/');
    expect(_nuclideUri().default.resolve('nuclide://host/abc/def', 'ghi')).toBe('nuclide://host/abc/def/ghi');
    expect(_nuclideUri().default.resolve('nuclide://host/abc/def', '../ghi')).toBe('nuclide://host/abc/ghi');
    expect(_nuclideUri().default.resolve('nuclide://host/abc/def', '..', 'ghi')).toBe('nuclide://host/abc/ghi');
    expect(_nuclideUri().default.resolve('nuclide://host/abc/def', '/ghi')).toBe('nuclide://host/ghi');
    expect(_nuclideUri().default.resolve('C:\\abc')).toBe('C:\\abc');
    expect(_nuclideUri().default.resolve('C:\\abc', '..')).toBe('C:\\');
    expect(_nuclideUri().default.resolve('C:\\abc', '..', '..')).toBe('C:\\');
    expect(_nuclideUri().default.resolve('C:\\abc', '..\\..')).toBe('C:\\');
    expect(_nuclideUri().default.resolve('C:\\abc', 'def')).toBe('C:\\abc\\def');
    expect(_nuclideUri().default.resolve('C:\\abc', '..\\def')).toBe('C:\\def');
    expect(_nuclideUri().default.resolve('C:\\abc', '..', 'def')).toBe('C:\\def');
    expect(_nuclideUri().default.resolve('\\abc', 'def')).toBe('\\abc\\def');
    expect(_nuclideUri().default.resolve('\\abc', '..\\def')).toBe('\\def');
    expect(_nuclideUri().default.resolve('\\abc', '..', 'def')).toBe('\\def');
  });
  describe('expandHomeDir()', () => {
    it('expands ~ to HOME', () => {
      expect(_nuclideUri().default.expandHomeDir('~')).toBe(process.env.HOME);
    });
    it('expands ~/ to HOME', () => {
      const HOME = process.env.HOME;
      expect(HOME).not.toBeNull();
      expect(_nuclideUri().default.expandHomeDir('~/abc')).toBe(_path.default.posix.join(HOME, 'abc'));
    });
    it('keeps ~def to ~def', () => {
      expect(_nuclideUri().default.expandHomeDir('~def')).toBe('~def');
    });
    it('throws on illegal URIs', () => {
      expect(() => _nuclideUri().default.expandHomeDir(archiveSuffixUri)).toThrow();
    });
  });
  it('detects Windows and Posix paths properly', () => {
    expect(_nuclideUri().__TEST__._pathModuleFor('/')).toEqual(_path.default.posix);
    expect(_nuclideUri().__TEST__._pathModuleFor('/abc')).toEqual(_path.default.posix);
    expect(_nuclideUri().__TEST__._pathModuleFor('/abc/def')).toEqual(_path.default.posix);
    expect(_nuclideUri().__TEST__._pathModuleFor('/abc.txt')).toEqual(_path.default.posix);
    expect(_nuclideUri().__TEST__._pathModuleFor('nuclide://host')).toEqual(_path.default.posix);
    expect(_nuclideUri().__TEST__._pathModuleFor('nuclide://host/')).toEqual(_path.default.posix);
    expect(_nuclideUri().__TEST__._pathModuleFor('nuclide://host/abc')).toEqual(_path.default.posix);
    expect(_nuclideUri().__TEST__._pathModuleFor('nuclide://host/abc/def')).toEqual(_path.default.posix);
    expect(_nuclideUri().__TEST__._pathModuleFor('nuclide://host/abc/def.txt')).toEqual(_path.default.posix);
    expect(_nuclideUri().__TEST__._pathModuleFor('C:\\')).toEqual(_path.default.win32);
    expect(_nuclideUri().__TEST__._pathModuleFor('C:\\abc')).toEqual(_path.default.win32);
    expect(_nuclideUri().__TEST__._pathModuleFor('C:\\abc\\def')).toEqual(_path.default.win32);
    expect(_nuclideUri().__TEST__._pathModuleFor('C:\\abc\\def.txt')).toEqual(_path.default.win32);
    expect(_nuclideUri().__TEST__._pathModuleFor('D:\\abc\\aaa bbb')).toEqual(_path.default.win32);
    expect(_nuclideUri().__TEST__._pathModuleFor('\\abc\\def')).toEqual(_path.default.win32); // Default to Posix

    expect(_nuclideUri().__TEST__._pathModuleFor('abcdef')).toEqual(_path.default.posix);
  });
  it('properly converts file URIs to local paths', () => {
    expect(_nuclideUri().default.uriToNuclideUri('\\abc\\def')).toEqual(null);
    expect(_nuclideUri().default.uriToNuclideUri('file://somehost/file/path')).toEqual('/file/path');
    expect(_nuclideUri().default.uriToNuclideUri('file:///foo/bar/buck-out/flavor%231%232%233%2Cabc')).toEqual('/foo/bar/buck-out/flavor#1#2#3,abc');
    expect(_nuclideUri().default.uriToNuclideUri('file:///file/path/file_%25.ext')).toEqual('/file/path/file_%.ext');
    expect(_nuclideUri().default.uriToNuclideUri('file://C:\\some\\file\\path')).toEqual('C:\\some\\file\\path');
  });
  it('properly converts local paths to file URIs', () => {
    expect(_nuclideUri().default.nuclideUriToUri('/foo/bar/file.ext')).toEqual('file:///foo/bar/file.ext');
    expect(_nuclideUri().default.nuclideUriToUri('/foo/bar/buck-out/flavor#1#2#3,abc')).toEqual('file:///foo/bar/buck-out/flavor%231%232%233%2Cabc');
    expect(_nuclideUri().default.nuclideUriToUri('/file/path/file_%.ext')).toEqual('file:///file/path/file_%25.ext');
  });
  it('properly handles backslash-containing remote URIs', () => {
    expect(_nuclideUri().default.getPath('nuclide://host/aaa\\bbb.txt')).toBe('/aaa\\bbb.txt');
    expect(_nuclideUri().default.getPath('nuclide://host/dir/aaa\\bbb.txt')).toBe('/dir/aaa\\bbb.txt');
    expect(_nuclideUri().default.getPath('nuclide://host/one\\two\\file.txt')).toBe('/one\\two\\file.txt');
  });
  it('correctly distinguishes paths that refer to files in an archive', () => {
    expect(_nuclideUri().default.isInArchive('abc')).toBe(false);
    expect(_nuclideUri().default.isInArchive('/abc')).toBe(false);
    expect(_nuclideUri().default.isInArchive('nuclide://host/abc')).toBe(false);
    expect(_nuclideUri().default.isInArchive('abc.zip')).toBe(false);
    expect(_nuclideUri().default.isInArchive('abc.jar')).toBe(false);
    expect(_nuclideUri().default.isInArchive('abc.zip!def')).toBe(true);
    expect(_nuclideUri().default.isInArchive('abc.jar!def')).toBe(true);
    expect(_nuclideUri().default.isInArchive('/abc.zip!def')).toBe(true);
    expect(_nuclideUri().default.isInArchive('/abc.jar!def')).toBe(true);
    expect(_nuclideUri().default.isInArchive('C:\\abc.zip!def')).toBe(true);
    expect(_nuclideUri().default.isInArchive('C:\\abc.jar!def')).toBe(true);
    expect(_nuclideUri().default.isInArchive('nuclide://host/abc.zip!def')).toBe(true);
    expect(_nuclideUri().default.isInArchive('nuclide://host/abc.jar!def')).toBe(true);
  });
  it('reports first ancestor outside archive', () => {
    expect(_nuclideUri().default.ancestorOutsideArchive('abc')).toBe('abc');
    expect(_nuclideUri().default.ancestorOutsideArchive('/abc')).toBe('/abc');
    expect(_nuclideUri().default.ancestorOutsideArchive('nuclide://host/abc')).toBe('nuclide://host/abc');
    expect(_nuclideUri().default.ancestorOutsideArchive('abc.zip')).toBe('abc.zip');
    expect(_nuclideUri().default.ancestorOutsideArchive('abc.jar')).toBe('abc.jar');
    expect(_nuclideUri().default.ancestorOutsideArchive('abc.zip!def')).toBe('abc.zip');
    expect(_nuclideUri().default.ancestorOutsideArchive('abc.jar!def')).toBe('abc.jar');
    expect(_nuclideUri().default.ancestorOutsideArchive('/abc.zip!def')).toBe('/abc.zip');
    expect(_nuclideUri().default.ancestorOutsideArchive('/abc.jar!def')).toBe('/abc.jar');
    expect(_nuclideUri().default.ancestorOutsideArchive('C:\\abc.zip!def')).toBe('C:\\abc.zip');
    expect(_nuclideUri().default.ancestorOutsideArchive('C:\\abc.jar!def')).toBe('C:\\abc.jar');
    expect(_nuclideUri().default.ancestorOutsideArchive('nuclide://host/abc.zip!def')).toBe('nuclide://host/abc.zip');
    expect(_nuclideUri().default.ancestorOutsideArchive('nuclide://host/abc.jar!def')).toBe('nuclide://host/abc.jar');
  });
});