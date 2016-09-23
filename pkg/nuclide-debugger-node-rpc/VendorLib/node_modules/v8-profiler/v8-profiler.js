var pack = require('./package.json');
var binding = require('./' + [
  'build',
  'profiler',
  'v' + pack.version,
  ['node', 'v' + process.versions.modules, process.platform, process.arch].join('-'),
  'profiler.node'
].join('/'));

var Stream = require('stream').Stream,
    inherits = require('util').inherits;

function Snapshot() {}

Snapshot.prototype.getHeader = function() {
  return {
    typeId: this.typeId,
    uid: this.uid,
    title: this.title
  }
}

/**
 * @param {Snapshot} other
 * @returns {Object}
 */
Snapshot.prototype.compare = function(other) {
  var selfHist = nodesHist(this),
      otherHist = nodesHist(other),
      keys = Object.keys(selfHist).concat(Object.keys(otherHist)),
      diff = {};

  keys.forEach(function(key) {
    if (key in diff) return;

    var selfCount = selfHist[key] || 0,
        otherCount = otherHist[key] || 0;

    diff[key] = otherCount - selfCount;
  });

  return diff;
};

function ExportStream() {
  Stream.Transform.call(this);
  this._transform = function noTransform(chunk, encoding, done) {
    done(null, chunk);
  }
}
inherits(ExportStream, Stream.Transform);

/**
 * @param {Stream.Writable|function} dataReceiver
 * @returns {Stream|undefined}
 */
Snapshot.prototype.export = function(dataReceiver) {
  dataReceiver = dataReceiver || new ExportStream();

  var toStream = dataReceiver instanceof Stream,
      chunks = toStream ? null : [];

  function onChunk(chunk, len) {
    if (toStream) dataReceiver.write(chunk);
    else chunks.push(chunk);
  }

  function onDone() {
    if (toStream) dataReceiver.end();
    else dataReceiver(null, chunks.join(''));
  }

  this.serialize(onChunk, onDone);

  return toStream ? dataReceiver : undefined;
};

function nodes(snapshot) {
  var n = snapshot.nodesCount, i, nodes = [];
  for (i = 0; i < n; i++) {
    nodes[i] = snapshot.getNode(i);
  }
  return nodes;
};

function nodesHist(snapshot) {
  var objects = {};
  nodes(snapshot).forEach(function(node){
    var key = node.type === "Object" ? node.name : node.type;
    objects[key] = objects[node.name] || 0;
    objects[key]++;
  });
  return objects;
};

function CpuProfile() {}

CpuProfile.prototype.getHeader = function() {
  return {
    typeId: this.typeId,
    uid: this.uid,
    title: this.title
  }
}

CpuProfile.prototype.export = function(dataReceiver) {
  dataReceiver = dataReceiver || new ExportStream();

  var toStream = dataReceiver instanceof Stream;
  var error, result;

  try {
    result = JSON.stringify(this);
  } catch (err) {
    error = err;
  }

  process.nextTick(function() {
    if (toStream) {
      if (error) {
        dataReceiver.emit('error', error);
      }

      dataReceiver.end(result);
    } else {
      dataReceiver(error, result);
    }
  });

  return toStream ? dataReceiver : undefined;
};

var startTime, endTime;
var activeProfiles = [];

var profiler = {
  /*HEAP PROFILER API*/

  get snapshots() { return binding.heap.snapshots; },

  takeSnapshot: function(name, control) {
    if (typeof name == 'function') {
      control = name;
      name = '';
    }

    if (typeof control !== 'function') {
      control = function noop() {};
    }

    name = '' + name;

    var snapshot = binding.heap.takeSnapshot(name, control);
    snapshot.__proto__ = Snapshot.prototype;
    snapshot.title = name;
    return snapshot;
  },

  deleteAllSnapshots: function () {
    Object.keys(binding.heap.snapshots).forEach(function(key) {
      binding.heap.snapshots[key].delete();
    });
  },

  startTrackingHeapObjects: function() {
    binding.heap.startTrackingHeapObjects();
  },

  stopTrackingHeapObjects: function() {
    binding.heap.stopTrackingHeapObjects();
  },

  getHeapStats: function(iterator, callback) {
    if (typeof iterator !== 'function')
      iterator = function noop() {};

    if (typeof callback !== 'function')
      callback = function noop() {};

    return binding.heap.getHeapStats(iterator, callback)
  },

  getObjectByHeapObjectId: function(id) {
    id = parseInt(id, 10);
    if (isNaN(id)) return;

    return binding.heap.getObjectByHeapObjectId(id);
  },

  getHeapObjectId: function(value) {
    if (!arguments.length) return;
    return binding.heap.getHeapObjectId(value);
  },

  /*CPU PROFILER API*/

  get profiles() { return binding.cpu.profiles; },

  startProfiling: function(name, recsamples) {
    if (activeProfiles.length == 0 && typeof process._startProfilerIdleNotifier == "function")
      process._startProfilerIdleNotifier();

    if (typeof name == 'boolean') {
      recsamples = name;
      name = '';
    }

    recsamples = recsamples === undefined ? true : Boolean(recsamples);
    name = '' + name;

    if (activeProfiles.indexOf(name) < 0)
      activeProfiles.push(name)

    startTime = Date.now();
    binding.cpu.startProfiling(name, recsamples);
  },

  stopProfiling: function(name) {
    var index = activeProfiles.indexOf(name);
    if (name && index < 0)
      return;

    var profile = binding.cpu.stopProfiling(name);
    endTime = Date.now();
    profile.__proto__ = CpuProfile.prototype;
    if (!profile.startTime) profile.startTime = startTime;
    if (!profile.endTime) profile.endTime = endTime;

    if (name)
      activeProfiles.splice(index, 1);
    else
      activeProfiles.length = activeProfiles.length - 1;

    if (activeProfiles.length == 0 && typeof process._stopProfilerIdleNotifier == "function")
      process._stopProfilerIdleNotifier();

    return profile;
  },

  setSamplingInterval: function(num) {
    if (activeProfiles.length) {
      throw new Error('setSamplingInterval must be called when there are no profiles being recorded.');
    }

    num = parseInt(num, 10) || 1000;
    binding.cpu.setSamplingInterval(num);
  },

  deleteAllProfiles: function() {
    Object.keys(binding.cpu.profiles).forEach(function(key) {
      binding.cpu.profiles[key].delete();
    });
  }
};

module.exports = profiler;
process.profiler = profiler;
