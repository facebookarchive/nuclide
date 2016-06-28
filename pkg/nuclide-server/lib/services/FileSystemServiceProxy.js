"use strict";

let Observable, trackOperationTiming;

module.exports = _client => {
  const remoteModule = {};

  remoteModule.exists = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "path",
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 43
        },
        kind: "string"
      }
    }]).then(args => _client.callRemoteFunction("FileSystemService/exists", "promise", args)).then(value => _client.unmarshal(value, {
      location: {
        type: "source",
        fileName: "FileSystemService.js",
        line: 43
      },
      kind: "boolean"
    }));
  }

  remoteModule.findNearestFile = function (arg0, arg1) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "fileName",
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 47
        },
        kind: "string"
      }
    }, {
      name: "pathToDirectory",
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 47
        },
        kind: "string"
      }
    }]).then(args => _client.callRemoteFunction("FileSystemService/findNearestFile", "promise", args)).then(value => _client.unmarshal(value, {
      location: {
        type: "source",
        fileName: "FileSystemService.js",
        line: 47
      },
      kind: "nullable",
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 47
        },
        kind: "string"
      }
    }));
  }

  remoteModule.lstat = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "path",
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 55
        },
        kind: "string"
      }
    }]).then(args => _client.callRemoteFunction("FileSystemService/lstat", "promise", args)).then(value => _client.unmarshal(value, {
      location: {
        type: "source",
        fileName: "FileSystemService.js",
        line: 55
      },
      kind: "named",
      name: "fs.Stats"
    }));
  }

  remoteModule.mkdir = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "path",
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 64
        },
        kind: "string"
      }
    }]).then(args => _client.callRemoteFunction("FileSystemService/mkdir", "promise", args)).then(value => _client.unmarshal(value, {
      location: {
        type: "source",
        fileName: "FileSystemService.js",
        line: 64
      },
      kind: "void"
    }));
  }

  remoteModule.mkdirp = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "path",
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 75
        },
        kind: "string"
      }
    }]).then(args => _client.callRemoteFunction("FileSystemService/mkdirp", "promise", args)).then(value => _client.unmarshal(value, {
      location: {
        type: "source",
        fileName: "FileSystemService.js",
        line: 75
      },
      kind: "boolean"
    }));
  }

  remoteModule.chmod = function (arg0, arg1) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "path",
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 82
        },
        kind: "string"
      }
    }, {
      name: "mode",
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 82
        },
        kind: "number"
      }
    }]).then(args => _client.callRemoteFunction("FileSystemService/chmod", "promise", args)).then(value => _client.unmarshal(value, {
      location: {
        type: "source",
        fileName: "FileSystemService.js",
        line: 82
      },
      kind: "void"
    }));
  }

  remoteModule.newFile = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "filePath",
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 93
        },
        kind: "string"
      }
    }]).then(args => _client.callRemoteFunction("FileSystemService/newFile", "promise", args)).then(value => _client.unmarshal(value, {
      location: {
        type: "source",
        fileName: "FileSystemService.js",
        line: 93
      },
      kind: "boolean"
    }));
  }

  remoteModule.readdir = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "path",
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 112
        },
        kind: "string"
      }
    }]).then(args => _client.callRemoteFunction("FileSystemService/readdir", "promise", args)).then(value => _client.unmarshal(value, {
      location: {
        type: "source",
        fileName: "FileSystemService.js",
        line: 112
      },
      kind: "array",
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 112
        },
        kind: "named",
        name: "FileWithStats"
      }
    }));
  }

  remoteModule.realpath = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "path",
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 141
        },
        kind: "string"
      }
    }]).then(args => _client.callRemoteFunction("FileSystemService/realpath", "promise", args)).then(value => _client.unmarshal(value, {
      location: {
        type: "source",
        fileName: "FileSystemService.js",
        line: 141
      },
      kind: "string"
    }));
  }

  remoteModule.resolveRealPath = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "path",
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 149
        },
        kind: "string"
      }
    }]).then(args => _client.callRemoteFunction("FileSystemService/resolveRealPath", "promise", args)).then(value => _client.unmarshal(value, {
      location: {
        type: "source",
        fileName: "FileSystemService.js",
        line: 149
      },
      kind: "string"
    }));
  }

  remoteModule.rename = function (arg0, arg1) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "sourcePath",
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 156
        },
        kind: "string"
      }
    }, {
      name: "destinationPath",
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 156
        },
        kind: "string"
      }
    }]).then(args => _client.callRemoteFunction("FileSystemService/rename", "promise", args)).then(value => _client.unmarshal(value, {
      location: {
        type: "source",
        fileName: "FileSystemService.js",
        line: 156
      },
      kind: "void"
    }));
  }

  remoteModule.move = function (arg0, arg1) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "sourcePaths",
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 163
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 163
          },
          kind: "string"
        }
      }
    }, {
      name: "destDir",
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 163
        },
        kind: "string"
      }
    }]).then(args => _client.callRemoteFunction("FileSystemService/move", "promise", args)).then(value => _client.unmarshal(value, {
      location: {
        type: "source",
        fileName: "FileSystemService.js",
        line: 163
      },
      kind: "void"
    }));
  }

  remoteModule.copy = function (arg0, arg1) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "sourcePath",
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 174
        },
        kind: "string"
      }
    }, {
      name: "destinationPath",
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 174
        },
        kind: "string"
      }
    }]).then(args => _client.callRemoteFunction("FileSystemService/copy", "promise", args)).then(value => _client.unmarshal(value, {
      location: {
        type: "source",
        fileName: "FileSystemService.js",
        line: 174
      },
      kind: "boolean"
    }));
  }

  remoteModule.rmdir = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "path",
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 191
        },
        kind: "string"
      }
    }]).then(args => _client.callRemoteFunction("FileSystemService/rmdir", "promise", args)).then(value => _client.unmarshal(value, {
      location: {
        type: "source",
        fileName: "FileSystemService.js",
        line: 191
      },
      kind: "void"
    }));
  }

  remoteModule.rmdirAll = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "paths",
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 195
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 195
          },
          kind: "string"
        }
      }
    }]).then(args => _client.callRemoteFunction("FileSystemService/rmdirAll", "promise", args)).then(value => _client.unmarshal(value, {
      location: {
        type: "source",
        fileName: "FileSystemService.js",
        line: 195
      },
      kind: "void"
    }));
  }

  remoteModule.stat = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "path",
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 223
        },
        kind: "string"
      }
    }]).then(args => _client.callRemoteFunction("FileSystemService/stat", "promise", args)).then(value => _client.unmarshal(value, {
      location: {
        type: "source",
        fileName: "FileSystemService.js",
        line: 223
      },
      kind: "named",
      name: "fs.Stats"
    }));
  }

  remoteModule.unlink = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "path",
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 230
        },
        kind: "string"
      }
    }]).then(args => _client.callRemoteFunction("FileSystemService/unlink", "promise", args)).then(value => _client.unmarshal(value, {
      location: {
        type: "source",
        fileName: "FileSystemService.js",
        line: 230
      },
      kind: "void"
    }));
  }

  remoteModule.readFile = function (arg0, arg1) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "path",
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 246
        },
        kind: "string"
      }
    }, {
      name: "options",
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 246
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 246
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 246
            },
            name: "flag",
            type: {
              location: {
                type: "source",
                fileName: "FileSystemService.js",
                line: 246
              },
              kind: "string"
            },
            optional: true
          }]
        }
      }
    }]).then(args => _client.callRemoteFunction("FileSystemService/readFile", "promise", args)).then(value => _client.unmarshal(value, {
      location: {
        type: "source",
        fileName: "FileSystemService.js",
        line: 247
      },
      kind: "named",
      name: "Buffer"
    }));
  }

  remoteModule.isNfs = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "path",
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 258
        },
        kind: "string"
      }
    }]).then(args => _client.callRemoteFunction("FileSystemService/isNfs", "promise", args)).then(value => _client.unmarshal(value, {
      location: {
        type: "source",
        fileName: "FileSystemService.js",
        line: 258
      },
      kind: "boolean"
    }));
  }

  remoteModule.writeFile = function (arg0, arg1, arg2) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "path",
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 299
        },
        kind: "string"
      }
    }, {
      name: "data",
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 299
        },
        kind: "string"
      }
    }, {
      name: "options",
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 300
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 300
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 300
            },
            name: "encoding",
            type: {
              location: {
                type: "source",
                fileName: "FileSystemService.js",
                line: 300
              },
              kind: "string"
            },
            optional: true
          }, {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 300
            },
            name: "mode",
            type: {
              location: {
                type: "source",
                fileName: "FileSystemService.js",
                line: 300
              },
              kind: "number"
            },
            optional: true
          }, {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 300
            },
            name: "flag",
            type: {
              location: {
                type: "source",
                fileName: "FileSystemService.js",
                line: 300
              },
              kind: "string"
            },
            optional: true
          }]
        }
      }
    }]).then(args => _client.callRemoteFunction("FileSystemService/writeFile", "promise", args)).then(value => _client.unmarshal(value, {
      location: {
        type: "source",
        fileName: "FileSystemService.js",
        line: 300
      },
      kind: "void"
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
  }], ["FileWithStats", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "FileSystemService.js",
      line: 24
    },
    name: "FileWithStats",
    definition: {
      location: {
        type: "source",
        fileName: "FileSystemService.js",
        line: 24
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 25
        },
        name: "file",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 25
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 26
        },
        name: "stats",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 26
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 26
            },
            kind: "named",
            name: "fs.Stats"
          }
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 27
        },
        name: "isSymbolicLink",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 27
          },
          kind: "boolean"
        },
        optional: false
      }]
    }
  }], ["exists", {
    kind: "function",
    name: "exists",
    location: {
      type: "source",
      fileName: "FileSystemService.js",
      line: 43
    },
    type: {
      location: {
        type: "source",
        fileName: "FileSystemService.js",
        line: 43
      },
      kind: "function",
      argumentTypes: [{
        name: "path",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 43
          },
          kind: "string"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 43
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 43
          },
          kind: "boolean"
        }
      }
    }
  }], ["findNearestFile", {
    kind: "function",
    name: "findNearestFile",
    location: {
      type: "source",
      fileName: "FileSystemService.js",
      line: 47
    },
    type: {
      location: {
        type: "source",
        fileName: "FileSystemService.js",
        line: 47
      },
      kind: "function",
      argumentTypes: [{
        name: "fileName",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 47
          },
          kind: "string"
        }
      }, {
        name: "pathToDirectory",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 47
          },
          kind: "string"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 47
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 47
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 47
            },
            kind: "string"
          }
        }
      }
    }
  }], ["lstat", {
    kind: "function",
    name: "lstat",
    location: {
      type: "source",
      fileName: "FileSystemService.js",
      line: 55
    },
    type: {
      location: {
        type: "source",
        fileName: "FileSystemService.js",
        line: 55
      },
      kind: "function",
      argumentTypes: [{
        name: "path",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 55
          },
          kind: "string"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 55
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 55
          },
          kind: "named",
          name: "fs.Stats"
        }
      }
    }
  }], ["mkdir", {
    kind: "function",
    name: "mkdir",
    location: {
      type: "source",
      fileName: "FileSystemService.js",
      line: 64
    },
    type: {
      location: {
        type: "source",
        fileName: "FileSystemService.js",
        line: 64
      },
      kind: "function",
      argumentTypes: [{
        name: "path",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 64
          },
          kind: "string"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 64
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 64
          },
          kind: "void"
        }
      }
    }
  }], ["mkdirp", {
    kind: "function",
    name: "mkdirp",
    location: {
      type: "source",
      fileName: "FileSystemService.js",
      line: 75
    },
    type: {
      location: {
        type: "source",
        fileName: "FileSystemService.js",
        line: 75
      },
      kind: "function",
      argumentTypes: [{
        name: "path",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 75
          },
          kind: "string"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 75
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 75
          },
          kind: "boolean"
        }
      }
    }
  }], ["chmod", {
    kind: "function",
    name: "chmod",
    location: {
      type: "source",
      fileName: "FileSystemService.js",
      line: 82
    },
    type: {
      location: {
        type: "source",
        fileName: "FileSystemService.js",
        line: 82
      },
      kind: "function",
      argumentTypes: [{
        name: "path",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 82
          },
          kind: "string"
        }
      }, {
        name: "mode",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 82
          },
          kind: "number"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 82
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 82
          },
          kind: "void"
        }
      }
    }
  }], ["newFile", {
    kind: "function",
    name: "newFile",
    location: {
      type: "source",
      fileName: "FileSystemService.js",
      line: 93
    },
    type: {
      location: {
        type: "source",
        fileName: "FileSystemService.js",
        line: 93
      },
      kind: "function",
      argumentTypes: [{
        name: "filePath",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 93
          },
          kind: "string"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 93
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 93
          },
          kind: "boolean"
        }
      }
    }
  }], ["readdir", {
    kind: "function",
    name: "readdir",
    location: {
      type: "source",
      fileName: "FileSystemService.js",
      line: 112
    },
    type: {
      location: {
        type: "source",
        fileName: "FileSystemService.js",
        line: 112
      },
      kind: "function",
      argumentTypes: [{
        name: "path",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 112
          },
          kind: "string"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 112
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 112
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 112
            },
            kind: "named",
            name: "FileWithStats"
          }
        }
      }
    }
  }], ["realpath", {
    kind: "function",
    name: "realpath",
    location: {
      type: "source",
      fileName: "FileSystemService.js",
      line: 141
    },
    type: {
      location: {
        type: "source",
        fileName: "FileSystemService.js",
        line: 141
      },
      kind: "function",
      argumentTypes: [{
        name: "path",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 141
          },
          kind: "string"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 141
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 141
          },
          kind: "string"
        }
      }
    }
  }], ["resolveRealPath", {
    kind: "function",
    name: "resolveRealPath",
    location: {
      type: "source",
      fileName: "FileSystemService.js",
      line: 149
    },
    type: {
      location: {
        type: "source",
        fileName: "FileSystemService.js",
        line: 149
      },
      kind: "function",
      argumentTypes: [{
        name: "path",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 149
          },
          kind: "string"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 149
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 149
          },
          kind: "string"
        }
      }
    }
  }], ["rename", {
    kind: "function",
    name: "rename",
    location: {
      type: "source",
      fileName: "FileSystemService.js",
      line: 156
    },
    type: {
      location: {
        type: "source",
        fileName: "FileSystemService.js",
        line: 156
      },
      kind: "function",
      argumentTypes: [{
        name: "sourcePath",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 156
          },
          kind: "string"
        }
      }, {
        name: "destinationPath",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 156
          },
          kind: "string"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 156
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 156
          },
          kind: "void"
        }
      }
    }
  }], ["move", {
    kind: "function",
    name: "move",
    location: {
      type: "source",
      fileName: "FileSystemService.js",
      line: 163
    },
    type: {
      location: {
        type: "source",
        fileName: "FileSystemService.js",
        line: 163
      },
      kind: "function",
      argumentTypes: [{
        name: "sourcePaths",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 163
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 163
            },
            kind: "string"
          }
        }
      }, {
        name: "destDir",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 163
          },
          kind: "string"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 163
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 163
          },
          kind: "void"
        }
      }
    }
  }], ["copy", {
    kind: "function",
    name: "copy",
    location: {
      type: "source",
      fileName: "FileSystemService.js",
      line: 174
    },
    type: {
      location: {
        type: "source",
        fileName: "FileSystemService.js",
        line: 174
      },
      kind: "function",
      argumentTypes: [{
        name: "sourcePath",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 174
          },
          kind: "string"
        }
      }, {
        name: "destinationPath",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 174
          },
          kind: "string"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 174
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 174
          },
          kind: "boolean"
        }
      }
    }
  }], ["rmdir", {
    kind: "function",
    name: "rmdir",
    location: {
      type: "source",
      fileName: "FileSystemService.js",
      line: 191
    },
    type: {
      location: {
        type: "source",
        fileName: "FileSystemService.js",
        line: 191
      },
      kind: "function",
      argumentTypes: [{
        name: "path",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 191
          },
          kind: "string"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 191
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 191
          },
          kind: "void"
        }
      }
    }
  }], ["rmdirAll", {
    kind: "function",
    name: "rmdirAll",
    location: {
      type: "source",
      fileName: "FileSystemService.js",
      line: 195
    },
    type: {
      location: {
        type: "source",
        fileName: "FileSystemService.js",
        line: 195
      },
      kind: "function",
      argumentTypes: [{
        name: "paths",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 195
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 195
            },
            kind: "string"
          }
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 195
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 195
          },
          kind: "void"
        }
      }
    }
  }], ["stat", {
    kind: "function",
    name: "stat",
    location: {
      type: "source",
      fileName: "FileSystemService.js",
      line: 223
    },
    type: {
      location: {
        type: "source",
        fileName: "FileSystemService.js",
        line: 223
      },
      kind: "function",
      argumentTypes: [{
        name: "path",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 223
          },
          kind: "string"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 223
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 223
          },
          kind: "named",
          name: "fs.Stats"
        }
      }
    }
  }], ["unlink", {
    kind: "function",
    name: "unlink",
    location: {
      type: "source",
      fileName: "FileSystemService.js",
      line: 230
    },
    type: {
      location: {
        type: "source",
        fileName: "FileSystemService.js",
        line: 230
      },
      kind: "function",
      argumentTypes: [{
        name: "path",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 230
          },
          kind: "string"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 230
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 230
          },
          kind: "void"
        }
      }
    }
  }], ["readFile", {
    kind: "function",
    name: "readFile",
    location: {
      type: "source",
      fileName: "FileSystemService.js",
      line: 246
    },
    type: {
      location: {
        type: "source",
        fileName: "FileSystemService.js",
        line: 246
      },
      kind: "function",
      argumentTypes: [{
        name: "path",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 246
          },
          kind: "string"
        }
      }, {
        name: "options",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 246
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 246
            },
            kind: "object",
            fields: [{
              location: {
                type: "source",
                fileName: "FileSystemService.js",
                line: 246
              },
              name: "flag",
              type: {
                location: {
                  type: "source",
                  fileName: "FileSystemService.js",
                  line: 246
                },
                kind: "string"
              },
              optional: true
            }]
          }
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 247
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 247
          },
          kind: "named",
          name: "Buffer"
        }
      }
    }
  }], ["isNfs", {
    kind: "function",
    name: "isNfs",
    location: {
      type: "source",
      fileName: "FileSystemService.js",
      line: 258
    },
    type: {
      location: {
        type: "source",
        fileName: "FileSystemService.js",
        line: 258
      },
      kind: "function",
      argumentTypes: [{
        name: "path",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 258
          },
          kind: "string"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 258
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 258
          },
          kind: "boolean"
        }
      }
    }
  }], ["writeFile", {
    kind: "function",
    name: "writeFile",
    location: {
      type: "source",
      fileName: "FileSystemService.js",
      line: 299
    },
    type: {
      location: {
        type: "source",
        fileName: "FileSystemService.js",
        line: 299
      },
      kind: "function",
      argumentTypes: [{
        name: "path",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 299
          },
          kind: "string"
        }
      }, {
        name: "data",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 299
          },
          kind: "string"
        }
      }, {
        name: "options",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 300
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 300
            },
            kind: "object",
            fields: [{
              location: {
                type: "source",
                fileName: "FileSystemService.js",
                line: 300
              },
              name: "encoding",
              type: {
                location: {
                  type: "source",
                  fileName: "FileSystemService.js",
                  line: 300
                },
                kind: "string"
              },
              optional: true
            }, {
              location: {
                type: "source",
                fileName: "FileSystemService.js",
                line: 300
              },
              name: "mode",
              type: {
                location: {
                  type: "source",
                  fileName: "FileSystemService.js",
                  line: 300
                },
                kind: "number"
              },
              optional: true
            }, {
              location: {
                type: "source",
                fileName: "FileSystemService.js",
                line: 300
              },
              name: "flag",
              type: {
                location: {
                  type: "source",
                  fileName: "FileSystemService.js",
                  line: 300
                },
                kind: "string"
              },
              optional: true
            }]
          }
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 300
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 300
          },
          kind: "void"
        }
      }
    }
  }]])
});