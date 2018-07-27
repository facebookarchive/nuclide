/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @format
 */

/* eslint-disable */
/* eslint no-console: 0 */

// $FlowIgnore
import fuse from 'fuse-bindings';
import thrift from 'thrift';
import LRU from 'lru-cache';
import RemoteFileSystemService from '../../../gen-nodejs/RemoteFileSystemService';

export class MountedFileSystem {
  _root: string;
  _mountPath: string;
  _client: thrift.Client;
  _connection: thrift.Connection;
  _cache: LRU<string, Object>;

  constructor(
    root: string,
    mountPath: string,
    client: thrift.Client,
    connection: thrift.Connection,
  ) {
    this._root = root;
    this._mountPath = mountPath;
    this._client = client;
    this._connection = connection;
    this._cache = LRU({
      max: 2000,
    });

    fuse.mount(mountPath, this._fuseMethods(), this._fuse_error.bind(this));
    process.on('SIGINT', this._handleSIGINT.bind(this));
  }

  _handleSIGINT(): void {
    fuse.unmount(this._mountPath, err => {
      if (err) {
        console.log(err);
        console.log('filesystem at ' + this._mountPath + ' not unmounted', err);
      } else {
        console.log('filesystem at ' + this._mountPath + ' unmounted');
      }

      process.exit();
    });
  }

  _fuse_error(err: Error): void {
    console.error('Error: ', err);
    if (err != null) {
      throw err;
    }
    console.log('filesystem mounted on ' + this._root);
  }

  _fuse_readdir(path: string, cb: (number, ?string) => void) {
    let fullPath;

    if (path === '/') {
      fullPath = this._root + path;
    } else {
      fullPath = this._root + path + '/';
    }
    console.log('readdir(%s)', path);
    this._client.readDirectory(fullPath).then(dir => {
      console.log(dir);
      dir.forEach(file => {
        const key = fullPath + file.fname;
        const value = {
          ...file.fstat,
          mtime: new Date(file.fstat.mtime),
          atime: new Date(file.fstat.atime),
          ctime: new Date(file.fstat.ctime),
        };
        this._cache.set(key, value);
        console.log(key + ':' + JSON.stringify(this._cache.get(key)));
      });
      return cb(0, dir.map(file => file.fname));
    });
  }

  _fuse_getattr(path: string, cb: (number, ?Object) => void) {
    console.log('getattr(%s)', path);
    const fullPath = this._root + path;
    const cached = this._cache.get(fullPath);

    if (cached != null) {
      console.log(`${fullPath}: cache hit`);
      setTimeout(() => {
        cb(0, cached);
      });
      return;
    }

    console.log(`${fullPath}: cache miss`);

    this._client
      .stat(fullPath)
      .then(stat => {
        cb(0, {
          mtime: new Date(stat.mtime),
          atime: new Date(stat.atime),
          ctime: new Date(stat.ctime),
          nlink: 1,
          size: stat.fsize,
          mode: stat.ftype === 1 ? 33188 : 16877,
          uid: process.getuid ? process.getuid() : 0,
          gid: process.getgid ? process.getgid() : 0,
        });
      })
      .catch(e => {
        console.error(path + ': ' + JSON.stringify(e));
        cb(fuse.ENOENT);
      });
  }

  _fuse_read(
    path: string,
    fd: number,
    buf: Buffer,
    len: number,
    pos: number,
    cb: number => void,
  ) {
    console.log('read(%s, %d, %d, %d)', path, fd, len, pos);
    this._client
      .readFile(this._root + path)
      .then(content => {
        buf.write(content.slice(pos, pos + len).toString());
        cb(content.length);
      })
      .catch(e => {
        console.log(e);
        cb(fuse.ENOENT);
      });
  }

  _fuse_write(
    path: string,
    fd: number,
    buf: Buffer,
    len: number,
    pos: number,
    cb: number => void,
  ) {
    console.log('write(%s, %d, %d, %d)', path, fd, len, pos);
    this._client
      .writeFile(this._root + path, buf, {overwrite: true})
      .then(() => {
        cb(buf.length);
      })
      .catch(e => {
        console.log(e);
        cb(fuse.ENOENT);
      });
  }

  _fuse_unimpl(...args: Array<any>) {
    const name = args[0];
    const cb = args[args.length - 1];
    const argString = args.slice(1, args.length - 2).join(',');

    console.log(`${name}(${argString}): unimplemented`);
    cb(0);
  }

  _fuseMethods(): Object {
    return {
      readdir: this._fuse_readdir.bind(this),
      getattr: this._fuse_getattr.bind(this),
      read: this._fuse_read.bind(this),
      write: this._fuse_write.bind(this),
      flush: this._fuse_unimpl.bind(this, 'flush'),
      init: this._fuse_unimpl.bind(this, 'init'),
      error: this._fuse_unimpl.bind(this, 'error'),
      access: this._fuse_unimpl.bind(this, 'access'),
      fsyncdir: this._fuse_unimpl.bind(this, 'fsyncdir'),
      truncate: this._fuse_unimpl.bind(this, 'truncate'),
      ftruncate: this._fuse_unimpl.bind(this, 'ftruncate'),
      readlink: this._fuse_unimpl.bind(this, 'readlink'),
      chown: this._fuse_unimpl.bind(this, 'chown'),
      mknod: this._fuse_unimpl.bind(this, 'mknod'),
      rename: this._fuse_unimpl.bind(this, 'rename'),
      create: this._fuse_unimpl.bind(this, 'create'),
      open: this._fuse_unimpl.bind(this, 'open'),
      release: this._fuse_unimpl.bind(this, 'release'),
      chmod: this._fuse_unimpl.bind(this, 'chmod'),
    };
  }

  static async create(
    root: string,
    mountPath: string,
    port: number,
  ): Promise<MountedFileSystem> {
    const connection = thrift.createConnection('localhost', port, {
      transport: thrift.TBufferedTransport(),
      protocol: thrift.TBinaryProtocol(),
    });
    const client = thrift.createClient(RemoteFileSystemService, connection);
    return Promise.resolve(
      new MountedFileSystem(root, mountPath, client, connection),
    );
  }
}
