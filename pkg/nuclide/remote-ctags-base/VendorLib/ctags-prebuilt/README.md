# ctags-prebuilt

[![Build Status](https://travis-ci.org/zertosh/ctags-prebuilt.svg?branch=master)](https://travis-ci.org/zertosh/ctags-prebuilt)

Self-sufficient fork of [node-tags](https://travis-ci.org/atom/node-ctags) prebuilt for Mac and Linux. Read all about ctags [here](http://ctags.sourceforge.net/).

## About

`ctags-prebuilt` includes prebuilt binaries of [node-tags](https://travis-ci.org/atom/node-ctags) for Mac and Linux for major versions of node.js and io.js. It's meant for use in [Atom packages](https://atom.io/packages) where your end-user might not have a proper build toolchain.

This module isn't meant to be built by the end-user. It doesn't include the necessary files for it. 

## Building

```
$ npm version patch
$ git push --follow-tags
# wait for travis to build
$ npm publish
```

## Installing

```sh
npm install ctags-prebuilt
```

## Usage in Atom Packages

Atom looks in a package's `node_modules` for `.node` files to check for compatibility. Since `ctags-prebuilt` different binaries that are not compatible with your target platform, it's important that you *copy* this library into package directory, instead of including in `dependencies`.

## Documentation

### findTags(tagsFilePath, tag, [options], callback)

Get all tags matching the tag specified from the tags file at the path.

* `tagsFilePath` - The string path to the tags file.

* `tag` - The string name of the tag to search for.

* `options` - An optional options object containing the following keys:

  * `caseInsensitive` - `true` to include tags that match case insensitively,
    (default: `false`)
  * `partialMatch` - `true` to include tags that partially match the given tag
    (default: `false`)

* `callback` - The function to call when complete with an error as the first
             argument and an array containing objects that have `name` and
             `file` keys and optionally a `pattern` key if the tag file
             specified contains tag patterns.

#### Example

```js
const ctags = require('ctags');

ctags.findTags('/Users/me/repos/node/tags', 'exists', (error, tags=[]) => {
  for (tag of tags) {
    console.log(`${tag.name} is in ${tag.file}`);
  }
});
```

### createReadStream(tagsFilePath, [options])

Create a read stream to a tags file.

The stream returned will emit `data` events with arrays of tag objects
that have `name` and `file` keys and optionally a `pattern` key if the tag file
specified contains tag patterns.

An `error` event will be emitted if the tag file cannot be read.

An `end` event will be emitted when all the tags have been read.

* `tagsFilePath` - The string path to the tags file.

* `options` - An optional object containing the following keys.

  * `chunkSize` - The number of tags to read at a time (default: `100`).

Returns a stream.

#### Example

```js
const ctags = require('ctags');

const stream = ctags.createReadStream('/Users/me/repos/node/tags');
stream.on('data', (tags) => {
  for (tag of tags) {
    console.log(`${tag.name} is in ${tag.file} with pattern: ${tag.pattern}`);
  }
});
```
