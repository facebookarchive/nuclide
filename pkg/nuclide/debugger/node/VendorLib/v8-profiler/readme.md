[![Build Status](https://secure.travis-ci.org/node-inspector/v8-profiler.png?branch=master)](http://travis-ci.org/node-inspector/v8-profiler)
[![Build status](https://ci.appveyor.com/api/projects/status/hhgloy5smkl5i8fd/branch/master?svg=true)](https://ci.appveyor.com/project/3y3/v8-profiler/branch/master)
[![npm version](https://badge.fury.io/js/v8-profiler.svg)](http://badge.fury.io/js/v8-profiler)

v8-profiler provides [node](http://github.com/ry/node) bindings for the v8
profiler and integration with [node-inspector](http://github.com/dannycoates/node-inspector)

## Installation
```sh
npm install v8-profiler
```
## Usage
```js
var profiler = require('v8-profiler');
```
## API
`takeSnapshot([name])` - returns new HEAP Snapshot instance. `name` is optional argument, by default snapshot name will be constructed from his uid.

`deleteAllSnapshots()` - works as described in name.

```js
var snapshot1 = profiler.takeSnapshot('1');
var snapshot2 = profiler.takeSnapshot();
profiler.deleteAllSnapshots();
```

`startProfiling([name], [recsamples])` - start CPU profiling. `name` is optional argument, by default profile name will be constructed from his uid. `recsamples` is true by default.

`stopProfiling([name])` - returns new CPU Profile instance. There is no strictly described behavior for usage without `name` argument.

`setSamplingInterval([num])` - Changes default CPU profiler sampling interval to the specified number of microseconds. Default interval is 1000us. This method must be called when there are no profiles being recorded. If called without arguments it resets interval to default.

`deleteAllProfiles()` - works as described in name.

```js
profiler.startProfiling('', true);
setTimeout(function() {
  var profile = profiler.stopProfiling('');
  profiler.deleteAllProfiles();
}, 1000);
```

### HEAP Snapshot API
`Snapshot.getHeader()` - provides short information about snapshot.

`Snapshot.compare(snapshot)` - creates HEAP diff for two snapshots.

`Snapshot.delete()` - removes snapshot from memory.

`Snapshot.export([callback])` - provides simple export API for snapshot. `callback(error, data)` receives serialized snapshot as second argument. (Serialization is not equal to `JSON.stringify` result).

If callback will not be passed, `export` returns transform stream.

`Snapshot.serialize` - low level serialization method. Look `Snapshot.export` source for usage example.

```js
var fs = require('fs');
var profiler = require('v8-profiler');
var snapshot1 = profiler.takeSnapshot();
var snapshot2 = profiler.takeSnapshot();

console.log(snapshot1.getHeader(), snapshot2.getHeader());

console.log(snapshot1.compare(snapshot2));

// Export snapshot to file file
snapshot1.export(function(error, result) {
  fs.writeFileSync('snapshot1.json', result);
  snapshot1.delete();
});

// Export snapshot to file stream
snapshot2.export()
  .pipe(fs.createWriteStream('snapshot2.json'))
  .on('finish', snapshot2.delete);
```

## CPU Profile API
`Profile.getHeader()` - provides short information about profile.

`Profile.delete()` - removes profile from memory.

`Profile.export([callback])` - provides simple export API for profile. `callback(error, data)` receives serialized profile as second argument. (Serialization is equal to `JSON.stringify` result).

```js
var fs = require('fs');
var profiler = require('v8-profiler');
profiler.startProfiling('1', true);
var profile1 = profiler.stopProfiling();
profiler.startProfiling('2', true);
var profile2 = profiler.stopProfiling();

console.log(snapshot1.getHeader(), snapshot2.getHeader());

profile1.export(function(error, result) {
  fs.writeFileSync('profile1.json', result);
  profile1.delete();
});

profile2.export()
  .pipe(fs.createWriteStream('profile2.json'))
  .on('finish', function() {
    profile2.delete();
  });
```

## node-inspector

Cpu profiles can be viewed and heap snapshots may be taken and viewed from the
profiles panel.
