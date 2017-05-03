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
          line: 43
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
          line: 43
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
          line: 53
        },
        kind: "string"
      }
    }, {
      name: "pathToDirectory",
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 54
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
          line: 96
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
          line: 96
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
          line: 105
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
          line: 105
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
          line: 116
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
          line: 116
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
          line: 123
        },
        kind: "string"
      }
    }, {
      name: "mode",
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 123
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
          line: 123
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
          line: 134
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
          line: 134
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
          line: 147
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
          line: 147
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 147
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
          line: 176
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
          line: 176
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
          line: 184
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
          line: 184
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
          line: 192
        },
        kind: "string"
      }
    }, {
      name: "destinationPath",
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 193
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
          line: 194
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
          line: 202
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 202
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
          line: 203
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
          line: 204
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
          line: 218
        },
        kind: "string"
      }
    }, {
      name: "destinationPath",
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 219
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
          line: 220
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
          line: 233
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
          line: 233
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
          line: 237
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 237
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
          line: 237
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
          line: 265
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
          line: 265
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
          line: 272
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
          line: 272
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
          line: 289
        },
        kind: "string"
      }
    }, {
      name: "options",
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 290
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 290
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 290
            },
            name: "flag",
            type: {
              location: {
                type: "source",
                fileName: "FileSystemService.js",
                line: 290
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
          line: 291
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
          line: 300
        },
        kind: "string"
      }
    }, {
      name: "options",
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 301
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 301
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 301
            },
            name: "flag",
            type: {
              location: {
                type: "source",
                fileName: "FileSystemService.js",
                line: 301
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
          line: 302
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
          line: 309
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
          line: 309
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
          line: 355
        },
        kind: "string"
      }
    }, {
      name: "data",
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 356
        },
        kind: "string"
      }
    }, {
      name: "options",
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 357
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 357
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 357
            },
            name: "encoding",
            type: {
              location: {
                type: "source",
                fileName: "FileSystemService.js",
                line: 357
              },
              kind: "string"
            },
            optional: true
          }, {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 357
            },
            name: "mode",
            type: {
              location: {
                type: "source",
                fileName: "FileSystemService.js",
                line: 357
              },
              kind: "number"
            },
            optional: true
          }, {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 357
            },
            name: "flag",
            type: {
              location: {
                type: "source",
                fileName: "FileSystemService.js",
                line: 357
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
          line: 358
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
        line: 30
      },
      name: "DirectoryEntry",
      definition: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 30
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
            line: 30
          },
          kind: "boolean"
        }, {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 30
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
    },
    findNearestFile: {
      kind: "function",
      name: "findNearestFile",
      location: {
        type: "source",
        fileName: "FileSystemService.js",
        line: 52
      },
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 52
        },
        kind: "function",
        argumentTypes: [{
          name: "fileName",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 53
            },
            kind: "string"
          }
        }, {
          name: "pathToDirectory",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 54
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
        line: 96
      },
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 96
        },
        kind: "function",
        argumentTypes: [{
          name: "path",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 96
            },
            kind: "string"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 96
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 96
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
        line: 105
      },
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 105
        },
        kind: "function",
        argumentTypes: [{
          name: "path",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 105
            },
            kind: "string"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 105
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 105
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
        line: 116
      },
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 116
        },
        kind: "function",
        argumentTypes: [{
          name: "path",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 116
            },
            kind: "string"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 116
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 116
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
        line: 123
      },
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 123
        },
        kind: "function",
        argumentTypes: [{
          name: "path",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 123
            },
            kind: "string"
          }
        }, {
          name: "mode",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 123
            },
            kind: "number"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 123
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 123
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
        line: 134
      },
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 134
        },
        kind: "function",
        argumentTypes: [{
          name: "filePath",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 134
            },
            kind: "string"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 134
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 134
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
        line: 147
      },
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 147
        },
        kind: "function",
        argumentTypes: [{
          name: "path",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 147
            },
            kind: "string"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 147
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 147
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "FileSystemService.js",
                line: 147
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
        line: 176
      },
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 176
        },
        kind: "function",
        argumentTypes: [{
          name: "path",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 176
            },
            kind: "string"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 176
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 176
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
        line: 184
      },
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 184
        },
        kind: "function",
        argumentTypes: [{
          name: "path",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 184
            },
            kind: "string"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 184
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 184
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
          name: "sourcePath",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 192
            },
            kind: "string"
          }
        }, {
          name: "destinationPath",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 193
            },
            kind: "string"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 194
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 194
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
        line: 201
      },
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 201
        },
        kind: "function",
        argumentTypes: [{
          name: "sourcePaths",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 202
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "FileSystemService.js",
                line: 202
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
              line: 203
            },
            kind: "string"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 204
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 204
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
        line: 217
      },
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 217
        },
        kind: "function",
        argumentTypes: [{
          name: "sourcePath",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 218
            },
            kind: "string"
          }
        }, {
          name: "destinationPath",
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
            line: 220
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 220
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
        line: 233
      },
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 233
        },
        kind: "function",
        argumentTypes: [{
          name: "path",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 233
            },
            kind: "string"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 233
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 233
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
        line: 237
      },
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 237
        },
        kind: "function",
        argumentTypes: [{
          name: "paths",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 237
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "FileSystemService.js",
                line: 237
              },
              kind: "string"
            }
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 237
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 237
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
        line: 265
      },
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 265
        },
        kind: "function",
        argumentTypes: [{
          name: "path",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 265
            },
            kind: "string"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 265
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 265
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
        line: 272
      },
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 272
        },
        kind: "function",
        argumentTypes: [{
          name: "path",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 272
            },
            kind: "string"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 272
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 272
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
        line: 288
      },
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 288
        },
        kind: "function",
        argumentTypes: [{
          name: "path",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 289
            },
            kind: "string"
          }
        }, {
          name: "options",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 290
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "FileSystemService.js",
                line: 290
              },
              kind: "object",
              fields: [{
                location: {
                  type: "source",
                  fileName: "FileSystemService.js",
                  line: 290
                },
                name: "flag",
                type: {
                  location: {
                    type: "source",
                    fileName: "FileSystemService.js",
                    line: 290
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
            line: 291
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 291
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
              line: 300
            },
            kind: "string"
          }
        }, {
          name: "options",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 301
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "FileSystemService.js",
                line: 301
              },
              kind: "object",
              fields: [{
                location: {
                  type: "source",
                  fileName: "FileSystemService.js",
                  line: 301
                },
                name: "flag",
                type: {
                  location: {
                    type: "source",
                    fileName: "FileSystemService.js",
                    line: 301
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
            line: 302
          },
          kind: "observable",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 302
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
        line: 309
      },
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 309
        },
        kind: "function",
        argumentTypes: [{
          name: "path",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 309
            },
            kind: "string"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 309
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 309
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
        line: 354
      },
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 354
        },
        kind: "function",
        argumentTypes: [{
          name: "path",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 355
            },
            kind: "string"
          }
        }, {
          name: "data",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 356
            },
            kind: "string"
          }
        }, {
          name: "options",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 357
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "FileSystemService.js",
                line: 357
              },
              kind: "object",
              fields: [{
                location: {
                  type: "source",
                  fileName: "FileSystemService.js",
                  line: 357
                },
                name: "encoding",
                type: {
                  location: {
                    type: "source",
                    fileName: "FileSystemService.js",
                    line: 357
                  },
                  kind: "string"
                },
                optional: true
              }, {
                location: {
                  type: "source",
                  fileName: "FileSystemService.js",
                  line: 357
                },
                name: "mode",
                type: {
                  location: {
                    type: "source",
                    fileName: "FileSystemService.js",
                    line: 357
                  },
                  kind: "number"
                },
                optional: true
              }, {
                location: {
                  type: "source",
                  fileName: "FileSystemService.js",
                  line: 357
                },
                name: "flag",
                type: {
                  location: {
                    type: "source",
                    fileName: "FileSystemService.js",
                    line: 357
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
            line: 358
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 358
            },
            kind: "void"
          }
        }
      }
    }
  }
});