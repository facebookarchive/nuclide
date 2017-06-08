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
        kind: "named",
        name: "NuclideUri"
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

  remoteModule.findNearestAncestorNamed = function (arg0, arg1) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "fileName",
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 54
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
          line: 56
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 56
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
          line: 66
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 66
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
          line: 67
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
          line: 68
        },
        kind: "array",
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
    }).publish();
  };

  remoteModule.lstat = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "path",
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 84
        },
        kind: "named",
        name: "NuclideUri"
      }
    }]).then(args => {
      return _client.callRemoteFunction("FileSystemService/lstat", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 84
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
          line: 93
        },
        kind: "named",
        name: "NuclideUri"
      }
    }]).then(args => {
      return _client.callRemoteFunction("FileSystemService/mkdir", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 93
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
          line: 104
        },
        kind: "named",
        name: "NuclideUri"
      }
    }]).then(args => {
      return _client.callRemoteFunction("FileSystemService/mkdirp", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 104
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
          line: 111
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "mode",
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 111
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
          line: 111
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
          line: 122
        },
        kind: "named",
        name: "NuclideUri"
      }
    }]).then(args => {
      return _client.callRemoteFunction("FileSystemService/newFile", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 122
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
          line: 136
        },
        kind: "named",
        name: "NuclideUri"
      }
    }]).then(args => {
      return _client.callRemoteFunction("FileSystemService/readdir", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 137
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 137
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
          line: 166
        },
        kind: "named",
        name: "NuclideUri"
      }
    }]).then(args => {
      return _client.callRemoteFunction("FileSystemService/realpath", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 166
        },
        kind: "named",
        name: "NuclideUri"
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
          line: 174
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
          line: 174
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
          line: 182
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "destinationPath",
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 183
        },
        kind: "named",
        name: "NuclideUri"
      }
    }]).then(args => {
      return _client.callRemoteFunction("FileSystemService/rename", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 184
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
          line: 192
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 192
          },
          kind: "named",
          name: "NuclideUri"
        }
      }
    }, {
      name: "destDir",
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 193
        },
        kind: "named",
        name: "NuclideUri"
      }
    }]).then(args => {
      return _client.callRemoteFunction("FileSystemService/move", "promise", args);
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

  remoteModule.copy = function (arg0, arg1) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "sourcePath",
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 208
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "destinationPath",
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 209
        },
        kind: "named",
        name: "NuclideUri"
      }
    }]).then(args => {
      return _client.callRemoteFunction("FileSystemService/copy", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 210
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
          line: 223
        },
        kind: "named",
        name: "NuclideUri"
      }
    }]).then(args => {
      return _client.callRemoteFunction("FileSystemService/rmdir", "promise", args);
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

  remoteModule.rmdirAll = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "paths",
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 227
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 227
          },
          kind: "named",
          name: "NuclideUri"
        }
      }
    }]).then(args => {
      return _client.callRemoteFunction("FileSystemService/rmdirAll", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 227
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
          line: 255
        },
        kind: "named",
        name: "NuclideUri"
      }
    }]).then(args => {
      return _client.callRemoteFunction("FileSystemService/stat", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 255
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
          line: 262
        },
        kind: "named",
        name: "NuclideUri"
      }
    }]).then(args => {
      return _client.callRemoteFunction("FileSystemService/unlink", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 262
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
          line: 279
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "options",
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 280
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 280
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 280
            },
            name: "flag",
            type: {
              location: {
                type: "source",
                fileName: "FileSystemService.js",
                line: 280
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
          line: 281
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
          line: 290
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "options",
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 291
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 291
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 291
            },
            name: "flag",
            type: {
              location: {
                type: "source",
                fileName: "FileSystemService.js",
                line: 291
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
          line: 292
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
          line: 299
        },
        kind: "named",
        name: "NuclideUri"
      }
    }]).then(args => {
      return _client.callRemoteFunction("FileSystemService/isNfs", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 299
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
          line: 345
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "data",
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 346
        },
        kind: "string"
      }
    }, {
      name: "options",
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 347
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 347
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 347
            },
            name: "encoding",
            type: {
              location: {
                type: "source",
                fileName: "FileSystemService.js",
                line: 347
              },
              kind: "string"
            },
            optional: true
          }, {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 347
            },
            name: "mode",
            type: {
              location: {
                type: "source",
                fileName: "FileSystemService.js",
                line: 347
              },
              kind: "number"
            },
            optional: true
          }, {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 347
            },
            name: "flag",
            type: {
              location: {
                type: "source",
                fileName: "FileSystemService.js",
                line: 347
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
          line: 348
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
            kind: "named",
            name: "NuclideUri"
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
    findNearestAncestorNamed: {
      kind: "function",
      name: "findNearestAncestorNamed",
      location: {
        type: "source",
        fileName: "FileSystemService.js",
        line: 53
      },
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 53
        },
        kind: "function",
        argumentTypes: [{
          name: "fileName",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 54
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
            kind: "named",
            name: "NuclideUri"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 56
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 56
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "FileSystemService.js",
                line: 56
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
          name: "searchPaths",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 66
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "FileSystemService.js",
                line: 66
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
              line: 67
            },
            kind: "string"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 68
          },
          kind: "observable",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 68
            },
            kind: "array",
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
    lstat: {
      kind: "function",
      name: "lstat",
      location: {
        type: "source",
        fileName: "FileSystemService.js",
        line: 84
      },
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 84
        },
        kind: "function",
        argumentTypes: [{
          name: "path",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 84
            },
            kind: "named",
            name: "NuclideUri"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 84
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 84
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
          name: "path",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 93
            },
            kind: "named",
            name: "NuclideUri"
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
        line: 104
      },
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 104
        },
        kind: "function",
        argumentTypes: [{
          name: "path",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 104
            },
            kind: "named",
            name: "NuclideUri"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 104
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 104
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
        line: 111
      },
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 111
        },
        kind: "function",
        argumentTypes: [{
          name: "path",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 111
            },
            kind: "named",
            name: "NuclideUri"
          }
        }, {
          name: "mode",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 111
            },
            kind: "number"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 111
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 111
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
        line: 122
      },
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 122
        },
        kind: "function",
        argumentTypes: [{
          name: "filePath",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 122
            },
            kind: "named",
            name: "NuclideUri"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 122
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 122
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
        line: 135
      },
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 135
        },
        kind: "function",
        argumentTypes: [{
          name: "path",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 136
            },
            kind: "named",
            name: "NuclideUri"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 137
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 137
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "FileSystemService.js",
                line: 137
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
        line: 166
      },
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 166
        },
        kind: "function",
        argumentTypes: [{
          name: "path",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 166
            },
            kind: "named",
            name: "NuclideUri"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 166
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 166
            },
            kind: "named",
            name: "NuclideUri"
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
          name: "path",
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
          name: "sourcePath",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 182
            },
            kind: "named",
            name: "NuclideUri"
          }
        }, {
          name: "destinationPath",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 183
            },
            kind: "named",
            name: "NuclideUri"
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
          name: "sourcePaths",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 192
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "FileSystemService.js",
                line: 192
              },
              kind: "named",
              name: "NuclideUri"
            }
          }
        }, {
          name: "destDir",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 193
            },
            kind: "named",
            name: "NuclideUri"
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
    copy: {
      kind: "function",
      name: "copy",
      location: {
        type: "source",
        fileName: "FileSystemService.js",
        line: 207
      },
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 207
        },
        kind: "function",
        argumentTypes: [{
          name: "sourcePath",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 208
            },
            kind: "named",
            name: "NuclideUri"
          }
        }, {
          name: "destinationPath",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 209
            },
            kind: "named",
            name: "NuclideUri"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 210
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 210
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
            kind: "named",
            name: "NuclideUri"
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
    rmdirAll: {
      kind: "function",
      name: "rmdirAll",
      location: {
        type: "source",
        fileName: "FileSystemService.js",
        line: 227
      },
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 227
        },
        kind: "function",
        argumentTypes: [{
          name: "paths",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 227
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "FileSystemService.js",
                line: 227
              },
              kind: "named",
              name: "NuclideUri"
            }
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 227
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 227
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
        line: 255
      },
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 255
        },
        kind: "function",
        argumentTypes: [{
          name: "path",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 255
            },
            kind: "named",
            name: "NuclideUri"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 255
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 255
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
        line: 262
      },
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 262
        },
        kind: "function",
        argumentTypes: [{
          name: "path",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 262
            },
            kind: "named",
            name: "NuclideUri"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 262
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 262
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
              line: 279
            },
            kind: "named",
            name: "NuclideUri"
          }
        }, {
          name: "options",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 280
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "FileSystemService.js",
                line: 280
              },
              kind: "object",
              fields: [{
                location: {
                  type: "source",
                  fileName: "FileSystemService.js",
                  line: 280
                },
                name: "flag",
                type: {
                  location: {
                    type: "source",
                    fileName: "FileSystemService.js",
                    line: 280
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
            line: 281
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 281
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
        line: 289
      },
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 289
        },
        kind: "function",
        argumentTypes: [{
          name: "path",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 290
            },
            kind: "named",
            name: "NuclideUri"
          }
        }, {
          name: "options",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 291
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "FileSystemService.js",
                line: 291
              },
              kind: "object",
              fields: [{
                location: {
                  type: "source",
                  fileName: "FileSystemService.js",
                  line: 291
                },
                name: "flag",
                type: {
                  location: {
                    type: "source",
                    fileName: "FileSystemService.js",
                    line: 291
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
            line: 292
          },
          kind: "observable",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 292
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
            kind: "named",
            name: "NuclideUri"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 299
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 299
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
        line: 344
      },
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 344
        },
        kind: "function",
        argumentTypes: [{
          name: "path",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 345
            },
            kind: "named",
            name: "NuclideUri"
          }
        }, {
          name: "data",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 346
            },
            kind: "string"
          }
        }, {
          name: "options",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 347
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "FileSystemService.js",
                line: 347
              },
              kind: "object",
              fields: [{
                location: {
                  type: "source",
                  fileName: "FileSystemService.js",
                  line: 347
                },
                name: "encoding",
                type: {
                  location: {
                    type: "source",
                    fileName: "FileSystemService.js",
                    line: 347
                  },
                  kind: "string"
                },
                optional: true
              }, {
                location: {
                  type: "source",
                  fileName: "FileSystemService.js",
                  line: 347
                },
                name: "mode",
                type: {
                  location: {
                    type: "source",
                    fileName: "FileSystemService.js",
                    line: 347
                  },
                  kind: "number"
                },
                optional: true
              }, {
                location: {
                  type: "source",
                  fileName: "FileSystemService.js",
                  line: 347
                },
                name: "flag",
                type: {
                  location: {
                    type: "source",
                    fileName: "FileSystemService.js",
                    line: 347
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
            line: 348
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 348
            },
            kind: "void"
          }
        }
      }
    }
  }
});