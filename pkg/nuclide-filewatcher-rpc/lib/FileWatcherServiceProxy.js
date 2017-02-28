"use strict";

let Observable;

module.exports = _client => {
  const remoteModule = {};

  remoteModule.watchFile = function (arg0) {
    return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
      name: "filePath",
      type: {
        location: {
          type: "source",
          fileName: "FileWatcherService.js",
          line: 46
        },
        kind: "named",
        name: "NuclideUri"
      }
    }]).then(args => {
      return _client.callRemoteFunction("FileWatcherService/watchFile", "observable", args);
    })).concatMap(id => id).concatMap(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "FileWatcherService.js",
          line: 46
        },
        kind: "named",
        name: "WatchResult"
      });
    }).publish();
  };

  remoteModule.watchDirectory = function (arg0) {
    return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
      name: "directoryPath",
      type: {
        location: {
          type: "source",
          fileName: "FileWatcherService.js",
          line: 50
        },
        kind: "named",
        name: "NuclideUri"
      }
    }]).then(args => {
      return _client.callRemoteFunction("FileWatcherService/watchDirectory", "observable", args);
    })).concatMap(id => id).concatMap(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "FileWatcherService.js",
          line: 50
        },
        kind: "named",
        name: "WatchResult"
      });
    }).publish();
  };

  remoteModule.watchDirectoryRecursive = function (arg0) {
    return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
      name: "directoryPath",
      type: {
        location: {
          type: "source",
          fileName: "FileWatcherService.js",
          line: 92
        },
        kind: "named",
        name: "NuclideUri"
      }
    }]).then(args => {
      return _client.callRemoteFunction("FileWatcherService/watchDirectoryRecursive", "observable", args);
    })).concatMap(id => id).concatMap(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "FileWatcherService.js",
          line: 93
        },
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
        line: 23
      },
      name: "WatchResult",
      definition: {
        location: {
          type: "source",
          fileName: "FileWatcherService.js",
          line: 23
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "FileWatcherService.js",
            line: 24
          },
          name: "path",
          type: {
            location: {
              type: "source",
              fileName: "FileWatcherService.js",
              line: 24
            },
            kind: "named",
            name: "NuclideUri"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "FileWatcherService.js",
            line: 25
          },
          name: "type",
          type: {
            location: {
              type: "source",
              fileName: "FileWatcherService.js",
              line: 25
            },
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
        line: 46
      },
      type: {
        location: {
          type: "source",
          fileName: "FileWatcherService.js",
          line: 46
        },
        kind: "function",
        argumentTypes: [{
          name: "filePath",
          type: {
            location: {
              type: "source",
              fileName: "FileWatcherService.js",
              line: 46
            },
            kind: "named",
            name: "NuclideUri"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "FileWatcherService.js",
            line: 46
          },
          kind: "observable",
          type: {
            location: {
              type: "source",
              fileName: "FileWatcherService.js",
              line: 46
            },
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
        line: 50
      },
      type: {
        location: {
          type: "source",
          fileName: "FileWatcherService.js",
          line: 50
        },
        kind: "function",
        argumentTypes: [{
          name: "directoryPath",
          type: {
            location: {
              type: "source",
              fileName: "FileWatcherService.js",
              line: 50
            },
            kind: "named",
            name: "NuclideUri"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "FileWatcherService.js",
            line: 50
          },
          kind: "observable",
          type: {
            location: {
              type: "source",
              fileName: "FileWatcherService.js",
              line: 50
            },
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
        line: 91
      },
      type: {
        location: {
          type: "source",
          fileName: "FileWatcherService.js",
          line: 91
        },
        kind: "function",
        argumentTypes: [{
          name: "directoryPath",
          type: {
            location: {
              type: "source",
              fileName: "FileWatcherService.js",
              line: 92
            },
            kind: "named",
            name: "NuclideUri"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "FileWatcherService.js",
            line: 93
          },
          kind: "observable",
          type: {
            location: {
              type: "source",
              fileName: "FileWatcherService.js",
              line: 93
            },
            kind: "string"
          }
        }
      }
    }
  }
});