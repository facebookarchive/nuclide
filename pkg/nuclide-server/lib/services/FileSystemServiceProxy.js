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
          line: 50
        },
        kind: "string"
      }
    }, {
      name: "pathToDirectory",
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 50
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
          line: 50
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 50
          },
          kind: "string"
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
          line: 55
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 55
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
          line: 56
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
          line: 57
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 57
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
          line: 71
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
          line: 71
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
          line: 80
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
          line: 80
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
          line: 91
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
          line: 91
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
          line: 98
        },
        kind: "string"
      }
    }, {
      name: "mode",
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 98
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
          line: 98
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
          line: 109
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
          line: 109
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
          line: 128
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
          line: 128
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 128
          },
          kind: "named",
          name: "FileWithStats"
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
          line: 156
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
          line: 156
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
          line: 164
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
          line: 164
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
          line: 171
        },
        kind: "string"
      }
    }, {
      name: "destinationPath",
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 171
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
          line: 171
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
          line: 178
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 178
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
          line: 178
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
          line: 178
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
          line: 189
        },
        kind: "string"
      }
    }, {
      name: "destinationPath",
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 189
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
          line: 189
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
          line: 202
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
          line: 202
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
          line: 206
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 206
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
          line: 206
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
          line: 234
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
          line: 234
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
          line: 241
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
          line: 241
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
          line: 258
        },
        kind: "string"
      }
    }, {
      name: "options",
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 259
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 259
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 259
            },
            name: "flag",
            type: {
              location: {
                type: "source",
                fileName: "FileSystemService.js",
                line: 259
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
          line: 260
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
          line: 269
        },
        kind: "string"
      }
    }, {
      name: "options",
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 270
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 270
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 270
            },
            name: "flag",
            type: {
              location: {
                type: "source",
                fileName: "FileSystemService.js",
                line: 270
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
          line: 271
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
          line: 278
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
          line: 278
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
          line: 320
        },
        kind: "string"
      }
    }, {
      name: "data",
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 320
        },
        kind: "string"
      }
    }, {
      name: "options",
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 321
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 321
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 321
            },
            name: "encoding",
            type: {
              location: {
                type: "source",
                fileName: "FileSystemService.js",
                line: 321
              },
              kind: "string"
            },
            optional: true
          }, {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 321
            },
            name: "mode",
            type: {
              location: {
                type: "source",
                fileName: "FileSystemService.js",
                line: 321
              },
              kind: "number"
            },
            optional: true
          }, {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 321
            },
            name: "flag",
            type: {
              location: {
                type: "source",
                fileName: "FileSystemService.js",
                line: 321
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
          line: 321
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
    FileWithStats: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "FileSystemService.js",
        line: 29
      },
      name: "FileWithStats",
      definition: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 29
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 30
          },
          name: "file",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 30
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 31
          },
          name: "stats",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 31
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "FileSystemService.js",
                line: 31
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
            line: 32
          },
          name: "isSymbolicLink",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 32
            },
            kind: "boolean"
          },
          optional: false
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
        line: 50
      },
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 50
        },
        kind: "function",
        argumentTypes: [{
          name: "fileName",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 50
            },
            kind: "string"
          }
        }, {
          name: "pathToDirectory",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 50
            },
            kind: "string"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 50
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 50
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "FileSystemService.js",
                line: 50
              },
              kind: "string"
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
        line: 54
      },
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 54
        },
        kind: "function",
        argumentTypes: [{
          name: "searchPaths",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 55
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "FileSystemService.js",
                line: 55
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
              line: 56
            },
            kind: "string"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 57
          },
          kind: "observable",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 57
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "FileSystemService.js",
                line: 57
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
        line: 71
      },
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 71
        },
        kind: "function",
        argumentTypes: [{
          name: "path",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 71
            },
            kind: "string"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 71
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 71
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
        line: 80
      },
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 80
        },
        kind: "function",
        argumentTypes: [{
          name: "path",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 80
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
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 80
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
        line: 91
      },
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 91
        },
        kind: "function",
        argumentTypes: [{
          name: "path",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 91
            },
            kind: "string"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 91
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 91
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
        line: 98
      },
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 98
        },
        kind: "function",
        argumentTypes: [{
          name: "path",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 98
            },
            kind: "string"
          }
        }, {
          name: "mode",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 98
            },
            kind: "number"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 98
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 98
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
        line: 109
      },
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 109
        },
        kind: "function",
        argumentTypes: [{
          name: "filePath",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 109
            },
            kind: "string"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 109
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 109
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
        line: 128
      },
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 128
        },
        kind: "function",
        argumentTypes: [{
          name: "path",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 128
            },
            kind: "string"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 128
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 128
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "FileSystemService.js",
                line: 128
              },
              kind: "named",
              name: "FileWithStats"
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
          name: "path",
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
        line: 164
      },
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 164
        },
        kind: "function",
        argumentTypes: [{
          name: "path",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 164
            },
            kind: "string"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 164
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 164
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
        line: 171
      },
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 171
        },
        kind: "function",
        argumentTypes: [{
          name: "sourcePath",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 171
            },
            kind: "string"
          }
        }, {
          name: "destinationPath",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 171
            },
            kind: "string"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 171
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 171
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
        line: 178
      },
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 178
        },
        kind: "function",
        argumentTypes: [{
          name: "sourcePaths",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 178
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "FileSystemService.js",
                line: 178
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
              line: 178
            },
            kind: "string"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 178
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 178
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
        line: 189
      },
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 189
        },
        kind: "function",
        argumentTypes: [{
          name: "sourcePath",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 189
            },
            kind: "string"
          }
        }, {
          name: "destinationPath",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 189
            },
            kind: "string"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 189
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 189
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
        line: 202
      },
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 202
        },
        kind: "function",
        argumentTypes: [{
          name: "path",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 202
            },
            kind: "string"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 202
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 202
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
          name: "paths",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 206
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "FileSystemService.js",
                line: 206
              },
              kind: "string"
            }
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
        line: 234
      },
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 234
        },
        kind: "function",
        argumentTypes: [{
          name: "path",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 234
            },
            kind: "string"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 234
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 234
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
        line: 241
      },
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 241
        },
        kind: "function",
        argumentTypes: [{
          name: "path",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 241
            },
            kind: "string"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 241
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 241
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
        line: 257
      },
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 257
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
        }, {
          name: "options",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 259
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "FileSystemService.js",
                line: 259
              },
              kind: "object",
              fields: [{
                location: {
                  type: "source",
                  fileName: "FileSystemService.js",
                  line: 259
                },
                name: "flag",
                type: {
                  location: {
                    type: "source",
                    fileName: "FileSystemService.js",
                    line: 259
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
            line: 260
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 260
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
        line: 268
      },
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 268
        },
        kind: "function",
        argumentTypes: [{
          name: "path",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 269
            },
            kind: "string"
          }
        }, {
          name: "options",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 270
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "FileSystemService.js",
                line: 270
              },
              kind: "object",
              fields: [{
                location: {
                  type: "source",
                  fileName: "FileSystemService.js",
                  line: 270
                },
                name: "flag",
                type: {
                  location: {
                    type: "source",
                    fileName: "FileSystemService.js",
                    line: 270
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
            line: 271
          },
          kind: "observable",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 271
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
        line: 278
      },
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 278
        },
        kind: "function",
        argumentTypes: [{
          name: "path",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 278
            },
            kind: "string"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 278
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 278
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
        line: 320
      },
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 320
        },
        kind: "function",
        argumentTypes: [{
          name: "path",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 320
            },
            kind: "string"
          }
        }, {
          name: "data",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 320
            },
            kind: "string"
          }
        }, {
          name: "options",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 321
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "FileSystemService.js",
                line: 321
              },
              kind: "object",
              fields: [{
                location: {
                  type: "source",
                  fileName: "FileSystemService.js",
                  line: 321
                },
                name: "encoding",
                type: {
                  location: {
                    type: "source",
                    fileName: "FileSystemService.js",
                    line: 321
                  },
                  kind: "string"
                },
                optional: true
              }, {
                location: {
                  type: "source",
                  fileName: "FileSystemService.js",
                  line: 321
                },
                name: "mode",
                type: {
                  location: {
                    type: "source",
                    fileName: "FileSystemService.js",
                    line: 321
                  },
                  kind: "number"
                },
                optional: true
              }, {
                location: {
                  type: "source",
                  fileName: "FileSystemService.js",
                  line: 321
                },
                name: "flag",
                type: {
                  location: {
                    type: "source",
                    fileName: "FileSystemService.js",
                    line: 321
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
            line: 321
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 321
            },
            kind: "void"
          }
        }
      }
    }
  }
});