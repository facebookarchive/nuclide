"use strict";

let Observable;

module.exports = _client => {
  const remoteModule = {};

  remoteModule.exists = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "path",
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 46
        },
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("FileSystemService/exists", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 46
        },
        kind: "boolean"
      });
    });
  };

  remoteModule.findNearestFile = function (arg0, arg1) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "fileName",
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 55
        },
        kind: "string"
      }
    }, {
      name: "pathToDirectory",
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 55
        },
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("FileSystemService/findNearestFile", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 55
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 55
          },
          kind: "string"
        }
      });
    });
  };

  remoteModule.findNearestAncestorNamed = function (arg0, arg1) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "fileName",
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 66
        },
        kind: "string"
      }
    }, {
      name: "pathToDirectory",
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 67
        },
        kind: "named",
        name: "NuclideUri"
      }
    }]).then(args => {
      return _client.callRemoteFunction("FileSystemService/findNearestAncestorNamed", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 68
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 68
          },
          kind: "named",
          name: "NuclideUri"
        }
      });
    });
  };

  remoteModule.findFilesInDirectories = function (arg0, arg1) {
    return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
      name: "searchPaths",
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 78
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 78
          },
          kind: "named",
          name: "NuclideUri"
        }
      }
    }, {
      name: "fileName",
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 79
        },
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("FileSystemService/findFilesInDirectories", "observable", args);
    })).concatMap(id => id).concatMap(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 80
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 80
          },
          kind: "named",
          name: "NuclideUri"
        }
      });
    }).publish();
  };

  remoteModule.lstat = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "path",
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 94
        },
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("FileSystemService/lstat", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 94
        },
        kind: "named",
        name: "fs.Stats"
      });
    });
  };

  remoteModule.mkdir = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "path",
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 103
        },
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("FileSystemService/mkdir", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 103
        },
        kind: "void"
      });
    });
  };

  remoteModule.mkdirp = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "path",
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 114
        },
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("FileSystemService/mkdirp", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 114
        },
        kind: "boolean"
      });
    });
  };

  remoteModule.chmod = function (arg0, arg1) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "path",
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 121
        },
        kind: "string"
      }
    }, {
      name: "mode",
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 121
        },
        kind: "number"
      }
    }]).then(args => {
      return _client.callRemoteFunction("FileSystemService/chmod", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 121
        },
        kind: "void"
      });
    });
  };

  remoteModule.newFile = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "filePath",
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 132
        },
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("FileSystemService/newFile", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 132
        },
        kind: "boolean"
      });
    });
  };

  remoteModule.readdir = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "path",
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 145
        },
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("FileSystemService/readdir", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 145
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 145
          },
          kind: "named",
          name: "DirectoryEntry"
        }
      });
    });
  };

  remoteModule.realpath = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "path",
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 173
        },
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("FileSystemService/realpath", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 173
        },
        kind: "string"
      });
    });
  };

  remoteModule.resolveRealPath = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "path",
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 181
        },
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("FileSystemService/resolveRealPath", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 181
        },
        kind: "string"
      });
    });
  };

  remoteModule.rename = function (arg0, arg1) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "sourcePath",
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 188
        },
        kind: "string"
      }
    }, {
      name: "destinationPath",
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 188
        },
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("FileSystemService/rename", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 188
        },
        kind: "void"
      });
    });
  };

  remoteModule.move = function (arg0, arg1) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "sourcePaths",
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
    }, {
      name: "destDir",
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 195
        },
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("FileSystemService/move", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 195
        },
        kind: "void"
      });
    });
  };

  remoteModule.copy = function (arg0, arg1) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "sourcePath",
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 206
        },
        kind: "string"
      }
    }, {
      name: "destinationPath",
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 206
        },
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("FileSystemService/copy", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 206
        },
        kind: "boolean"
      });
    });
  };

  remoteModule.rmdir = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "path",
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 219
        },
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("FileSystemService/rmdir", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 219
        },
        kind: "void"
      });
    });
  };

  remoteModule.rmdirAll = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "paths",
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 223
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 223
          },
          kind: "string"
        }
      }
    }]).then(args => {
      return _client.callRemoteFunction("FileSystemService/rmdirAll", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 223
        },
        kind: "void"
      });
    });
  };

  remoteModule.stat = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "path",
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 251
        },
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("FileSystemService/stat", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 251
        },
        kind: "named",
        name: "fs.Stats"
      });
    });
  };

  remoteModule.unlink = function (arg0) {
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
    }]).then(args => {
      return _client.callRemoteFunction("FileSystemService/unlink", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 258
        },
        kind: "void"
      });
    });
  };

  remoteModule.readFile = function (arg0, arg1) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "path",
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 275
        },
        kind: "string"
      }
    }, {
      name: "options",
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 276
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 276
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 276
            },
            name: "flag",
            type: {
              location: {
                type: "source",
                fileName: "FileSystemService.js",
                line: 276
              },
              kind: "string"
            },
            optional: true
          }]
        }
      }
    }]).then(args => {
      return _client.callRemoteFunction("FileSystemService/readFile", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 277
        },
        kind: "named",
        name: "Buffer"
      });
    });
  };

  remoteModule.createReadStream = function (arg0, arg1) {
    return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
      name: "path",
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 286
        },
        kind: "string"
      }
    }, {
      name: "options",
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 287
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 287
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 287
            },
            name: "flag",
            type: {
              location: {
                type: "source",
                fileName: "FileSystemService.js",
                line: 287
              },
              kind: "string"
            },
            optional: true
          }]
        }
      }
    }]).then(args => {
      return _client.callRemoteFunction("FileSystemService/createReadStream", "observable", args);
    })).concatMap(id => id).concatMap(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 288
        },
        kind: "named",
        name: "Buffer"
      });
    }).publish();
  };

  remoteModule.isNfs = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "path",
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 295
        },
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("FileSystemService/isNfs", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 295
        },
        kind: "boolean"
      });
    });
  };

  remoteModule.writeFile = function (arg0, arg1, arg2) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "path",
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 337
        },
        kind: "string"
      }
    }, {
      name: "data",
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 337
        },
        kind: "string"
      }
    }, {
      name: "options",
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 338
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 338
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 338
            },
            name: "encoding",
            type: {
              location: {
                type: "source",
                fileName: "FileSystemService.js",
                line: 338
              },
              kind: "string"
            },
            optional: true
          }, {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 338
            },
            name: "mode",
            type: {
              location: {
                type: "source",
                fileName: "FileSystemService.js",
                line: 338
              },
              kind: "number"
            },
            optional: true
          }, {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 338
            },
            name: "flag",
            type: {
              location: {
                type: "source",
                fileName: "FileSystemService.js",
                line: 338
              },
              kind: "string"
            },
            optional: true
          }]
        }
      }
    }]).then(args => {
      return _client.callRemoteFunction("FileSystemService/writeFile", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 338
        },
        kind: "void"
      });
    });
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
    DirectoryEntry: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "FileSystemService.js",
        line: 29
      },
      name: "DirectoryEntry",
      definition: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 29
        },
        kind: "tuple",
        types: [{
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 30
          },
          kind: "string"
        }, {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 31
          },
          kind: "boolean"
        }, {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 32
          },
          kind: "boolean"
        }]
      }
    },
    exists: {
      kind: "function",
      name: "exists",
      location: {
        type: "source",
        fileName: "FileSystemService.js",
        line: 46
      },
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 46
        },
        kind: "function",
        argumentTypes: [{
          name: "path",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 46
            },
            kind: "string"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 46
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 46
            },
            kind: "boolean"
          }
        }
      }
    },
    findNearestFile: {
      kind: "function",
      name: "findNearestFile",
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
          name: "fileName",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 55
            },
            kind: "string"
          }
        }, {
          name: "pathToDirectory",
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
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "FileSystemService.js",
                line: 55
              },
              kind: "string"
            }
          }
        }
      }
    },
    findNearestAncestorNamed: {
      kind: "function",
      name: "findNearestAncestorNamed",
      location: {
        type: "source",
        fileName: "FileSystemService.js",
        line: 65
      },
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 65
        },
        kind: "function",
        argumentTypes: [{
          name: "fileName",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 66
            },
            kind: "string"
          }
        }, {
          name: "pathToDirectory",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 67
            },
            kind: "named",
            name: "NuclideUri"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 68
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 68
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "FileSystemService.js",
                line: 68
              },
              kind: "named",
              name: "NuclideUri"
            }
          }
        }
      }
    },
    findFilesInDirectories: {
      kind: "function",
      name: "findFilesInDirectories",
      location: {
        type: "source",
        fileName: "FileSystemService.js",
        line: 77
      },
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 77
        },
        kind: "function",
        argumentTypes: [{
          name: "searchPaths",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 78
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "FileSystemService.js",
                line: 78
              },
              kind: "named",
              name: "NuclideUri"
            }
          }
        }, {
          name: "fileName",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 79
            },
            kind: "string"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 80
          },
          kind: "observable",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 80
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "FileSystemService.js",
                line: 80
              },
              kind: "named",
              name: "NuclideUri"
            }
          }
        }
      }
    },
    lstat: {
      kind: "function",
      name: "lstat",
      location: {
        type: "source",
        fileName: "FileSystemService.js",
        line: 94
      },
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 94
        },
        kind: "function",
        argumentTypes: [{
          name: "path",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 94
            },
            kind: "string"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 94
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 94
            },
            kind: "named",
            name: "fs.Stats"
          }
        }
      }
    },
    mkdir: {
      kind: "function",
      name: "mkdir",
      location: {
        type: "source",
        fileName: "FileSystemService.js",
        line: 103
      },
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 103
        },
        kind: "function",
        argumentTypes: [{
          name: "path",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 103
            },
            kind: "string"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 103
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 103
            },
            kind: "void"
          }
        }
      }
    },
    mkdirp: {
      kind: "function",
      name: "mkdirp",
      location: {
        type: "source",
        fileName: "FileSystemService.js",
        line: 114
      },
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 114
        },
        kind: "function",
        argumentTypes: [{
          name: "path",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 114
            },
            kind: "string"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 114
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 114
            },
            kind: "boolean"
          }
        }
      }
    },
    chmod: {
      kind: "function",
      name: "chmod",
      location: {
        type: "source",
        fileName: "FileSystemService.js",
        line: 121
      },
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 121
        },
        kind: "function",
        argumentTypes: [{
          name: "path",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 121
            },
            kind: "string"
          }
        }, {
          name: "mode",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 121
            },
            kind: "number"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 121
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 121
            },
            kind: "void"
          }
        }
      }
    },
    newFile: {
      kind: "function",
      name: "newFile",
      location: {
        type: "source",
        fileName: "FileSystemService.js",
        line: 132
      },
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 132
        },
        kind: "function",
        argumentTypes: [{
          name: "filePath",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 132
            },
            kind: "string"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 132
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 132
            },
            kind: "boolean"
          }
        }
      }
    },
    readdir: {
      kind: "function",
      name: "readdir",
      location: {
        type: "source",
        fileName: "FileSystemService.js",
        line: 145
      },
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 145
        },
        kind: "function",
        argumentTypes: [{
          name: "path",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 145
            },
            kind: "string"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 145
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 145
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "FileSystemService.js",
                line: 145
              },
              kind: "named",
              name: "DirectoryEntry"
            }
          }
        }
      }
    },
    realpath: {
      kind: "function",
      name: "realpath",
      location: {
        type: "source",
        fileName: "FileSystemService.js",
        line: 173
      },
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 173
        },
        kind: "function",
        argumentTypes: [{
          name: "path",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 173
            },
            kind: "string"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 173
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 173
            },
            kind: "string"
          }
        }
      }
    },
    resolveRealPath: {
      kind: "function",
      name: "resolveRealPath",
      location: {
        type: "source",
        fileName: "FileSystemService.js",
        line: 181
      },
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 181
        },
        kind: "function",
        argumentTypes: [{
          name: "path",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 181
            },
            kind: "string"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 181
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 181
            },
            kind: "string"
          }
        }
      }
    },
    rename: {
      kind: "function",
      name: "rename",
      location: {
        type: "source",
        fileName: "FileSystemService.js",
        line: 188
      },
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 188
        },
        kind: "function",
        argumentTypes: [{
          name: "sourcePath",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 188
            },
            kind: "string"
          }
        }, {
          name: "destinationPath",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 188
            },
            kind: "string"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 188
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 188
            },
            kind: "void"
          }
        }
      }
    },
    move: {
      kind: "function",
      name: "move",
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
          name: "sourcePaths",
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
        }, {
          name: "destDir",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 195
            },
            kind: "string"
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
    },
    copy: {
      kind: "function",
      name: "copy",
      location: {
        type: "source",
        fileName: "FileSystemService.js",
        line: 206
      },
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 206
        },
        kind: "function",
        argumentTypes: [{
          name: "sourcePath",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 206
            },
            kind: "string"
          }
        }, {
          name: "destinationPath",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 206
            },
            kind: "string"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 206
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 206
            },
            kind: "boolean"
          }
        }
      }
    },
    rmdir: {
      kind: "function",
      name: "rmdir",
      location: {
        type: "source",
        fileName: "FileSystemService.js",
        line: 219
      },
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 219
        },
        kind: "function",
        argumentTypes: [{
          name: "path",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 219
            },
            kind: "string"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 219
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 219
            },
            kind: "void"
          }
        }
      }
    },
    rmdirAll: {
      kind: "function",
      name: "rmdirAll",
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
          name: "paths",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 223
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "FileSystemService.js",
                line: 223
              },
              kind: "string"
            }
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
            kind: "void"
          }
        }
      }
    },
    stat: {
      kind: "function",
      name: "stat",
      location: {
        type: "source",
        fileName: "FileSystemService.js",
        line: 251
      },
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 251
        },
        kind: "function",
        argumentTypes: [{
          name: "path",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 251
            },
            kind: "string"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 251
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 251
            },
            kind: "named",
            name: "fs.Stats"
          }
        }
      }
    },
    unlink: {
      kind: "function",
      name: "unlink",
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
            kind: "void"
          }
        }
      }
    },
    readFile: {
      kind: "function",
      name: "readFile",
      location: {
        type: "source",
        fileName: "FileSystemService.js",
        line: 274
      },
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 274
        },
        kind: "function",
        argumentTypes: [{
          name: "path",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 275
            },
            kind: "string"
          }
        }, {
          name: "options",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 276
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "FileSystemService.js",
                line: 276
              },
              kind: "object",
              fields: [{
                location: {
                  type: "source",
                  fileName: "FileSystemService.js",
                  line: 276
                },
                name: "flag",
                type: {
                  location: {
                    type: "source",
                    fileName: "FileSystemService.js",
                    line: 276
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
            line: 277
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 277
            },
            kind: "named",
            name: "Buffer"
          }
        }
      }
    },
    createReadStream: {
      kind: "function",
      name: "createReadStream",
      location: {
        type: "source",
        fileName: "FileSystemService.js",
        line: 285
      },
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 285
        },
        kind: "function",
        argumentTypes: [{
          name: "path",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 286
            },
            kind: "string"
          }
        }, {
          name: "options",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 287
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "FileSystemService.js",
                line: 287
              },
              kind: "object",
              fields: [{
                location: {
                  type: "source",
                  fileName: "FileSystemService.js",
                  line: 287
                },
                name: "flag",
                type: {
                  location: {
                    type: "source",
                    fileName: "FileSystemService.js",
                    line: 287
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
            line: 288
          },
          kind: "observable",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 288
            },
            kind: "named",
            name: "Buffer"
          }
        }
      }
    },
    isNfs: {
      kind: "function",
      name: "isNfs",
      location: {
        type: "source",
        fileName: "FileSystemService.js",
        line: 295
      },
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 295
        },
        kind: "function",
        argumentTypes: [{
          name: "path",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 295
            },
            kind: "string"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 295
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 295
            },
            kind: "boolean"
          }
        }
      }
    },
    writeFile: {
      kind: "function",
      name: "writeFile",
      location: {
        type: "source",
        fileName: "FileSystemService.js",
        line: 337
      },
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 337
        },
        kind: "function",
        argumentTypes: [{
          name: "path",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 337
            },
            kind: "string"
          }
        }, {
          name: "data",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 337
            },
            kind: "string"
          }
        }, {
          name: "options",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 338
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "FileSystemService.js",
                line: 338
              },
              kind: "object",
              fields: [{
                location: {
                  type: "source",
                  fileName: "FileSystemService.js",
                  line: 338
                },
                name: "encoding",
                type: {
                  location: {
                    type: "source",
                    fileName: "FileSystemService.js",
                    line: 338
                  },
                  kind: "string"
                },
                optional: true
              }, {
                location: {
                  type: "source",
                  fileName: "FileSystemService.js",
                  line: 338
                },
                name: "mode",
                type: {
                  location: {
                    type: "source",
                    fileName: "FileSystemService.js",
                    line: 338
                  },
                  kind: "number"
                },
                optional: true
              }, {
                location: {
                  type: "source",
                  fileName: "FileSystemService.js",
                  line: 338
                },
                name: "flag",
                type: {
                  location: {
                    type: "source",
                    fileName: "FileSystemService.js",
                    line: 338
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
            line: 338
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 338
            },
            kind: "void"
          }
        }
      }
    }
  }
});