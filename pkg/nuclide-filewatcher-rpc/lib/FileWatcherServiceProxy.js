"use strict";

let Observable;

module.exports = _client => {
  const remoteModule = {};

  remoteModule.watchFile = function (arg0) {
    return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
      name: "filePath",
      type: {
        kind: "named",
        name: "NuclideUri"
      }
    }])).switchMap(args => {
      return _client.callRemoteFunction("FileWatcherService/watchFile", "observable", args);
    }).concatMap(value => {
      return _client.unmarshal(value, {
        kind: "named",
        name: "WatchResult"
      });
    }).publish();
  };

  remoteModule.watchFileWithNode = function (arg0) {
    return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
      name: "filePath",
      type: {
        kind: "named",
        name: "NuclideUri"
      }
    }])).switchMap(args => {
      return _client.callRemoteFunction("FileWatcherService/watchFileWithNode", "observable", args);
    }).concatMap(value => {
      return _client.unmarshal(value, {
        kind: "named",
        name: "WatchResult"
      });
    }).publish();
  };

  remoteModule.watchDirectory = function (arg0) {
    return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
      name: "directoryPath",
      type: {
        kind: "named",
        name: "NuclideUri"
      }
    }])).switchMap(args => {
      return _client.callRemoteFunction("FileWatcherService/watchDirectory", "observable", args);
    }).concatMap(value => {
      return _client.unmarshal(value, {
        kind: "named",
        name: "WatchResult"
      });
    }).publish();
  };

  remoteModule.watchDirectoryRecursive = function (arg0) {
    return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
      name: "directoryPath",
      type: {
        kind: "named",
        name: "NuclideUri"
      }
    }])).switchMap(args => {
      return _client.callRemoteFunction("FileWatcherService/watchDirectoryRecursive", "observable", args);
    }).concatMap(value => {
      return _client.unmarshal(value, {
        kind: "string"
      });
    }).publish();
  };

  return remoteModule;
};

Object.defineProperty(module.exports, "inject", {
  value: function () {
    Observable = arguments[0];
  }
});
Object.defineProperty(module.exports, "defs", {
  value: {
    Object: {
      kind: "alias",
      name: "Object",
      location: {
        type: "builtin"
      }
    },
    Date: {
      kind: "alias",
      name: "Date",
      location: {
        type: "builtin"
      }
    },
    RegExp: {
      kind: "alias",
      name: "RegExp",
      location: {
        type: "builtin"
      }
    },
    Buffer: {
      kind: "alias",
      name: "Buffer",
      location: {
        type: "builtin"
      }
    },
    "fs.Stats": {
      kind: "alias",
      name: "fs.Stats",
      location: {
        type: "builtin"
      }
    },
    NuclideUri: {
      kind: "alias",
      name: "NuclideUri",
      location: {
        type: "builtin"
      }
    },
    atom$Point: {
      kind: "alias",
      name: "atom$Point",
      location: {
        type: "builtin"
      }
    },
    atom$Range: {
      kind: "alias",
      name: "atom$Range",
      location: {
        type: "builtin"
      }
    },
    WatchResult: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "FileWatcherService.js",
        line: 26
      },
      name: "WatchResult",
      definition: {
        kind: "object",
        fields: [{
          name: "path",
          type: {
            kind: "named",
            name: "NuclideUri"
          },
          optional: false
        }, {
          name: "type",
          type: {
            kind: "string"
          },
          optional: false
        }]
      }
    },
    watchFile: {
      kind: "function",
      name: "watchFile",
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
          name: "filePath",
          type: {
            kind: "named",
            name: "NuclideUri"
          }
        }],
        returnType: {
          kind: "observable",
          type: {
            kind: "named",
            name: "WatchResult"
          }
        }
      }
    },
    watchFileWithNode: {
      kind: "function",
      name: "watchFileWithNode",
      location: {
        type: "source",
        fileName: "FileWatcherService.js",
        line: 55
      },
      type: {
        location: {
          type: "source",
          fileName: "FileWatcherService.js",
          line: 55
        },
        kind: "function",
        argumentTypes: [{
          name: "filePath",
          type: {
            kind: "named",
            name: "NuclideUri"
          }
        }],
        returnType: {
          kind: "observable",
          type: {
            kind: "named",
            name: "WatchResult"
          }
        }
      }
    },
    watchDirectory: {
      kind: "function",
      name: "watchDirectory",
      location: {
        type: "source",
        fileName: "FileWatcherService.js",
        line: 70
      },
      type: {
        location: {
          type: "source",
          fileName: "FileWatcherService.js",
          line: 70
        },
        kind: "function",
        argumentTypes: [{
          name: "directoryPath",
          type: {
            kind: "named",
            name: "NuclideUri"
          }
        }],
        returnType: {
          kind: "observable",
          type: {
            kind: "named",
            name: "WatchResult"
          }
        }
      }
    },
    watchDirectoryRecursive: {
      kind: "function",
      name: "watchDirectoryRecursive",
      location: {
        type: "source",
        fileName: "FileWatcherService.js",
        line: 111
      },
      type: {
        location: {
          type: "source",
          fileName: "FileWatcherService.js",
          line: 111
        },
        kind: "function",
        argumentTypes: [{
          name: "directoryPath",
          type: {
            kind: "named",
            name: "NuclideUri"
          }
        }],
        returnType: {
          kind: "observable",
          type: {
            kind: "string"
          }
        }
      }
    }
  }
});