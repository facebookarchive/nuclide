"use strict";

let Observable, trackOperationTiming;

module.exports = _client => {
  const remoteModule = {};

  remoteModule.watchFile = function (arg0) {
    return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
      name: "filePath",
      type: {
        location: {
          type: "source",
          fileName: "FileWatcherService.js",
          line: 45
        },
        kind: "named",
        name: "NuclideUri"
      }
    }]).then(args => _client.callRemoteFunction("FileWatcherService/watchFile", "observable", args))).concatMap(id => id).concatMap(value => _client.unmarshal(value, {
      location: {
        type: "source",
        fileName: "FileWatcherService.js",
        line: 45
      },
      kind: "named",
      name: "WatchResult"
    }));
  }

  remoteModule.watchDirectory = function (arg0) {
    return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
      name: "directoryPath",
      type: {
        location: {
          type: "source",
          fileName: "FileWatcherService.js",
          line: 49
        },
        kind: "named",
        name: "NuclideUri"
      }
    }]).then(args => _client.callRemoteFunction("FileWatcherService/watchDirectory", "observable", args))).concatMap(id => id).concatMap(value => _client.unmarshal(value, {
      location: {
        type: "source",
        fileName: "FileWatcherService.js",
        line: 49
      },
      kind: "named",
      name: "WatchResult"
    }));
  }

  remoteModule.watchDirectoryRecursive = function (arg0) {
    return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
      name: "directoryPath",
      type: {
        location: {
          type: "source",
          fileName: "FileWatcherService.js",
          line: 94
        },
        kind: "named",
        name: "NuclideUri"
      }
    }]).then(args => _client.callRemoteFunction("FileWatcherService/watchDirectoryRecursive", "observable", args))).concatMap(id => id).concatMap(value => _client.unmarshal(value, {
      location: {
        type: "source",
        fileName: "FileWatcherService.js",
        line: 95
      },
      kind: "string"
    }));
  }

  return remoteModule;
};

Object.defineProperty(module.exports, "inject", {
  value: function () {
    Observable = arguments[0];
    trackOperationTiming = arguments[1];
  }
});
Object.defineProperty(module.exports, "defs", {
  value: new Map([["Object", {
    kind: "alias",
    name: "Object",
    location: {
      type: "builtin"
    }
  }], ["Date", {
    kind: "alias",
    name: "Date",
    location: {
      type: "builtin"
    }
  }], ["RegExp", {
    kind: "alias",
    name: "RegExp",
    location: {
      type: "builtin"
    }
  }], ["Buffer", {
    kind: "alias",
    name: "Buffer",
    location: {
      type: "builtin"
    }
  }], ["fs.Stats", {
    kind: "alias",
    name: "fs.Stats",
    location: {
      type: "builtin"
    }
  }], ["NuclideUri", {
    kind: "alias",
    name: "NuclideUri",
    location: {
      type: "builtin"
    }
  }], ["WatchResult", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "FileWatcherService.js",
      line: 22
    },
    name: "WatchResult",
    definition: {
      location: {
        type: "source",
        fileName: "FileWatcherService.js",
        line: 22
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "FileWatcherService.js",
          line: 23
        },
        name: "path",
        type: {
          location: {
            type: "source",
            fileName: "FileWatcherService.js",
            line: 23
          },
          kind: "named",
          name: "NuclideUri"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "FileWatcherService.js",
          line: 24
        },
        name: "type",
        type: {
          location: {
            type: "source",
            fileName: "FileWatcherService.js",
            line: 24
          },
          kind: "string"
        },
        optional: false
      }]
    }
  }], ["watchFile", {
    kind: "function",
    name: "watchFile",
    location: {
      type: "source",
      fileName: "FileWatcherService.js",
      line: 45
    },
    type: {
      location: {
        type: "source",
        fileName: "FileWatcherService.js",
        line: 45
      },
      kind: "function",
      argumentTypes: [{
        name: "filePath",
        type: {
          location: {
            type: "source",
            fileName: "FileWatcherService.js",
            line: 45
          },
          kind: "named",
          name: "NuclideUri"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "FileWatcherService.js",
          line: 45
        },
        kind: "observable",
        type: {
          location: {
            type: "source",
            fileName: "FileWatcherService.js",
            line: 45
          },
          kind: "named",
          name: "WatchResult"
        }
      }
    }
  }], ["watchDirectory", {
    kind: "function",
    name: "watchDirectory",
    location: {
      type: "source",
      fileName: "FileWatcherService.js",
      line: 49
    },
    type: {
      location: {
        type: "source",
        fileName: "FileWatcherService.js",
        line: 49
      },
      kind: "function",
      argumentTypes: [{
        name: "directoryPath",
        type: {
          location: {
            type: "source",
            fileName: "FileWatcherService.js",
            line: 49
          },
          kind: "named",
          name: "NuclideUri"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "FileWatcherService.js",
          line: 49
        },
        kind: "observable",
        type: {
          location: {
            type: "source",
            fileName: "FileWatcherService.js",
            line: 49
          },
          kind: "named",
          name: "WatchResult"
        }
      }
    }
  }], ["watchDirectoryRecursive", {
    kind: "function",
    name: "watchDirectoryRecursive",
    location: {
      type: "source",
      fileName: "FileWatcherService.js",
      line: 93
    },
    type: {
      location: {
        type: "source",
        fileName: "FileWatcherService.js",
        line: 93
      },
      kind: "function",
      argumentTypes: [{
        name: "directoryPath",
        type: {
          location: {
            type: "source",
            fileName: "FileWatcherService.js",
            line: 94
          },
          kind: "named",
          name: "NuclideUri"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "FileWatcherService.js",
          line: 95
        },
        kind: "observable",
        type: {
          location: {
            type: "source",
            fileName: "FileWatcherService.js",
            line: 95
          },
          kind: "string"
        }
      }
    }
  }]])
});