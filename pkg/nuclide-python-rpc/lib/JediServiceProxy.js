"use strict";

let Observable;

module.exports = _client => {
  const remoteModule = {};

  remoteModule.get_completions = function (arg0, arg1, arg2, arg3) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "src",
      type: {
        location: {
          type: "source",
          fileName: "JediService.js",
          line: 77
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "contents",
      type: {
        location: {
          type: "source",
          fileName: "JediService.js",
          line: 78
        },
        kind: "string"
      }
    }, {
      name: "line",
      type: {
        location: {
          type: "source",
          fileName: "JediService.js",
          line: 79
        },
        kind: "number"
      }
    }, {
      name: "column",
      type: {
        location: {
          type: "source",
          fileName: "JediService.js",
          line: 80
        },
        kind: "number"
      }
    }]).then(args => {
      return _client.callRemoteFunction("get_completions", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "JediService.js",
          line: 81
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 81
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "JediService.js",
              line: 81
            },
            kind: "named",
            name: "JediCompletion"
          }
        }
      });
    });
  };

  remoteModule.get_definitions = function (arg0, arg1, arg2, arg3) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "src",
      type: {
        location: {
          type: "source",
          fileName: "JediService.js",
          line: 86
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "contents",
      type: {
        location: {
          type: "source",
          fileName: "JediService.js",
          line: 87
        },
        kind: "string"
      }
    }, {
      name: "line",
      type: {
        location: {
          type: "source",
          fileName: "JediService.js",
          line: 88
        },
        kind: "number"
      }
    }, {
      name: "column",
      type: {
        location: {
          type: "source",
          fileName: "JediService.js",
          line: 89
        },
        kind: "number"
      }
    }]).then(args => {
      return _client.callRemoteFunction("get_definitions", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "JediService.js",
          line: 90
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 90
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "JediService.js",
              line: 90
            },
            kind: "named",
            name: "JediDefinition"
          }
        }
      });
    });
  };

  remoteModule.get_references = function (arg0, arg1, arg2, arg3) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "src",
      type: {
        location: {
          type: "source",
          fileName: "JediService.js",
          line: 95
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "contents",
      type: {
        location: {
          type: "source",
          fileName: "JediService.js",
          line: 96
        },
        kind: "string"
      }
    }, {
      name: "line",
      type: {
        location: {
          type: "source",
          fileName: "JediService.js",
          line: 97
        },
        kind: "number"
      }
    }, {
      name: "column",
      type: {
        location: {
          type: "source",
          fileName: "JediService.js",
          line: 98
        },
        kind: "number"
      }
    }]).then(args => {
      return _client.callRemoteFunction("get_references", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "JediService.js",
          line: 99
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 99
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "JediService.js",
              line: 99
            },
            kind: "named",
            name: "JediReference"
          }
        }
      });
    });
  };

  remoteModule.get_outline = function (arg0, arg1) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "src",
      type: {
        location: {
          type: "source",
          fileName: "JediService.js",
          line: 104
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "contents",
      type: {
        location: {
          type: "source",
          fileName: "JediService.js",
          line: 105
        },
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("get_outline", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "JediService.js",
          line: 106
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 106
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "JediService.js",
              line: 106
            },
            kind: "named",
            name: "JediOutlineItem"
          }
        }
      });
    });
  };

  remoteModule.add_paths = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "paths",
      type: {
        location: {
          type: "source",
          fileName: "JediService.js",
          line: 111
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 111
          },
          kind: "string"
        }
      }
    }]).then(args => {
      return _client.callRemoteFunction("add_paths", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "JediService.js",
          line: 112
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 112
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "JediService.js",
              line: 112
            },
            kind: "string"
          }
        }
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
  }], ["atom$Point", {
    kind: "alias",
    name: "atom$Point",
    location: {
      type: "builtin"
    }
  }], ["atom$Range", {
    kind: "alias",
    name: "atom$Range",
    location: {
      type: "builtin"
    }
  }], ["JediCompletion", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "JediService.js",
      line: 16
    },
    name: "JediCompletion",
    definition: {
      location: {
        type: "source",
        fileName: "JediService.js",
        line: 16
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "JediService.js",
          line: 17
        },
        name: "type",
        type: {
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 17
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "JediService.js",
          line: 18
        },
        name: "text",
        type: {
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 18
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "JediService.js",
          line: 19
        },
        name: "description",
        type: {
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 19
          },
          kind: "string"
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "JediService.js",
          line: 20
        },
        name: "params",
        type: {
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 20
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "JediService.js",
              line: 20
            },
            kind: "string"
          }
        },
        optional: true
      }]
    }
  }], ["JediDefinition", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "JediService.js",
      line: 23
    },
    name: "JediDefinition",
    definition: {
      location: {
        type: "source",
        fileName: "JediService.js",
        line: 23
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "JediService.js",
          line: 24
        },
        name: "type",
        type: {
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 24
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "JediService.js",
          line: 25
        },
        name: "text",
        type: {
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 25
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "JediService.js",
          line: 26
        },
        name: "file",
        type: {
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 26
          },
          kind: "named",
          name: "NuclideUri"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "JediService.js",
          line: 27
        },
        name: "line",
        type: {
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 27
          },
          kind: "number"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "JediService.js",
          line: 28
        },
        name: "column",
        type: {
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 28
          },
          kind: "number"
        },
        optional: false
      }]
    }
  }], ["JediReference", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "JediService.js",
      line: 31
    },
    name: "JediReference",
    definition: {
      location: {
        type: "source",
        fileName: "JediService.js",
        line: 31
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "JediService.js",
          line: 32
        },
        name: "type",
        type: {
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 32
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "JediService.js",
          line: 33
        },
        name: "text",
        type: {
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 33
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "JediService.js",
          line: 34
        },
        name: "file",
        type: {
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 34
          },
          kind: "named",
          name: "NuclideUri"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "JediService.js",
          line: 35
        },
        name: "line",
        type: {
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 35
          },
          kind: "number"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "JediService.js",
          line: 36
        },
        name: "column",
        type: {
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 36
          },
          kind: "number"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "JediService.js",
          line: 37
        },
        name: "parentName",
        type: {
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 37
          },
          kind: "string"
        },
        optional: true
      }]
    }
  }], ["Position", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "JediService.js",
      line: 40
    },
    name: "Position",
    definition: {
      location: {
        type: "source",
        fileName: "JediService.js",
        line: 40
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "JediService.js",
          line: 41
        },
        name: "line",
        type: {
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 41
          },
          kind: "number"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "JediService.js",
          line: 42
        },
        name: "column",
        type: {
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 42
          },
          kind: "number"
        },
        optional: false
      }]
    }
  }], ["JediFunctionItem", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "JediService.js",
      line: 45
    },
    name: "JediFunctionItem",
    definition: {
      location: {
        type: "source",
        fileName: "JediService.js",
        line: 45
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "JediService.js",
          line: 46
        },
        name: "kind",
        type: {
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 46
          },
          kind: "string-literal",
          value: "function"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "JediService.js",
          line: 47
        },
        name: "name",
        type: {
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 47
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "JediService.js",
          line: 48
        },
        name: "start",
        type: {
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 48
          },
          kind: "named",
          name: "Position"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "JediService.js",
          line: 49
        },
        name: "end",
        type: {
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 49
          },
          kind: "named",
          name: "Position"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "JediService.js",
          line: 50
        },
        name: "children",
        type: {
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 50
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "JediService.js",
              line: 50
            },
            kind: "named",
            name: "JediOutlineItem"
          }
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "JediService.js",
          line: 51
        },
        name: "docblock",
        type: {
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 51
          },
          kind: "string"
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "JediService.js",
          line: 52
        },
        name: "params",
        type: {
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 52
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "JediService.js",
              line: 52
            },
            kind: "string"
          }
        },
        optional: true
      }]
    }
  }], ["JediClassItem", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "JediService.js",
      line: 55
    },
    name: "JediClassItem",
    definition: {
      location: {
        type: "source",
        fileName: "JediService.js",
        line: 55
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "JediService.js",
          line: 56
        },
        name: "kind",
        type: {
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 56
          },
          kind: "string-literal",
          value: "class"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "JediService.js",
          line: 57
        },
        name: "name",
        type: {
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 57
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "JediService.js",
          line: 58
        },
        name: "start",
        type: {
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 58
          },
          kind: "named",
          name: "Position"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "JediService.js",
          line: 59
        },
        name: "end",
        type: {
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 59
          },
          kind: "named",
          name: "Position"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "JediService.js",
          line: 60
        },
        name: "children",
        type: {
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 60
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "JediService.js",
              line: 60
            },
            kind: "named",
            name: "JediOutlineItem"
          }
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "JediService.js",
          line: 61
        },
        name: "docblock",
        type: {
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 61
          },
          kind: "string"
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "JediService.js",
          line: 63
        },
        name: "params",
        type: {
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 63
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "JediService.js",
              line: 63
            },
            kind: "string"
          }
        },
        optional: true
      }]
    }
  }], ["JediStatementItem", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "JediService.js",
      line: 66
    },
    name: "JediStatementItem",
    definition: {
      location: {
        type: "source",
        fileName: "JediService.js",
        line: 66
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "JediService.js",
          line: 67
        },
        name: "kind",
        type: {
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 67
          },
          kind: "string-literal",
          value: "statement"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "JediService.js",
          line: 68
        },
        name: "name",
        type: {
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 68
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "JediService.js",
          line: 69
        },
        name: "start",
        type: {
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 69
          },
          kind: "named",
          name: "Position"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "JediService.js",
          line: 70
        },
        name: "end",
        type: {
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 70
          },
          kind: "named",
          name: "Position"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "JediService.js",
          line: 71
        },
        name: "docblock",
        type: {
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 71
          },
          kind: "string"
        },
        optional: true
      }]
    }
  }], ["JediOutlineItem", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "JediService.js",
      line: 74
    },
    name: "JediOutlineItem",
    definition: {
      location: {
        type: "source",
        fileName: "JediService.js",
        line: 74
      },
      kind: "union",
      types: [{
        location: {
          type: "source",
          fileName: "JediService.js",
          line: 45
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 46
          },
          name: "kind",
          type: {
            location: {
              type: "source",
              fileName: "JediService.js",
              line: 46
            },
            kind: "string-literal",
            value: "function"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 47
          },
          name: "name",
          type: {
            location: {
              type: "source",
              fileName: "JediService.js",
              line: 47
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 48
          },
          name: "start",
          type: {
            location: {
              type: "source",
              fileName: "JediService.js",
              line: 48
            },
            kind: "named",
            name: "Position"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 49
          },
          name: "end",
          type: {
            location: {
              type: "source",
              fileName: "JediService.js",
              line: 49
            },
            kind: "named",
            name: "Position"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 50
          },
          name: "children",
          type: {
            location: {
              type: "source",
              fileName: "JediService.js",
              line: 50
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "JediService.js",
                line: 50
              },
              kind: "named",
              name: "JediOutlineItem"
            }
          },
          optional: true
        }, {
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 51
          },
          name: "docblock",
          type: {
            location: {
              type: "source",
              fileName: "JediService.js",
              line: 51
            },
            kind: "string"
          },
          optional: true
        }, {
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 52
          },
          name: "params",
          type: {
            location: {
              type: "source",
              fileName: "JediService.js",
              line: 52
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "JediService.js",
                line: 52
              },
              kind: "string"
            }
          },
          optional: true
        }]
      }, {
        location: {
          type: "source",
          fileName: "JediService.js",
          line: 55
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 56
          },
          name: "kind",
          type: {
            location: {
              type: "source",
              fileName: "JediService.js",
              line: 56
            },
            kind: "string-literal",
            value: "class"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 57
          },
          name: "name",
          type: {
            location: {
              type: "source",
              fileName: "JediService.js",
              line: 57
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 58
          },
          name: "start",
          type: {
            location: {
              type: "source",
              fileName: "JediService.js",
              line: 58
            },
            kind: "named",
            name: "Position"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 59
          },
          name: "end",
          type: {
            location: {
              type: "source",
              fileName: "JediService.js",
              line: 59
            },
            kind: "named",
            name: "Position"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 60
          },
          name: "children",
          type: {
            location: {
              type: "source",
              fileName: "JediService.js",
              line: 60
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "JediService.js",
                line: 60
              },
              kind: "named",
              name: "JediOutlineItem"
            }
          },
          optional: true
        }, {
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 61
          },
          name: "docblock",
          type: {
            location: {
              type: "source",
              fileName: "JediService.js",
              line: 61
            },
            kind: "string"
          },
          optional: true
        }, {
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 63
          },
          name: "params",
          type: {
            location: {
              type: "source",
              fileName: "JediService.js",
              line: 63
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "JediService.js",
                line: 63
              },
              kind: "string"
            }
          },
          optional: true
        }]
      }, {
        location: {
          type: "source",
          fileName: "JediService.js",
          line: 66
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 67
          },
          name: "kind",
          type: {
            location: {
              type: "source",
              fileName: "JediService.js",
              line: 67
            },
            kind: "string-literal",
            value: "statement"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 68
          },
          name: "name",
          type: {
            location: {
              type: "source",
              fileName: "JediService.js",
              line: 68
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 69
          },
          name: "start",
          type: {
            location: {
              type: "source",
              fileName: "JediService.js",
              line: 69
            },
            kind: "named",
            name: "Position"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 70
          },
          name: "end",
          type: {
            location: {
              type: "source",
              fileName: "JediService.js",
              line: 70
            },
            kind: "named",
            name: "Position"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 71
          },
          name: "docblock",
          type: {
            location: {
              type: "source",
              fileName: "JediService.js",
              line: 71
            },
            kind: "string"
          },
          optional: true
        }]
      }],
      discriminantField: "kind"
    }
  }], ["get_completions", {
    kind: "function",
    name: "get_completions",
    location: {
      type: "source",
      fileName: "JediService.js",
      line: 76
    },
    type: {
      location: {
        type: "source",
        fileName: "JediService.js",
        line: 76
      },
      kind: "function",
      argumentTypes: [{
        name: "src",
        type: {
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 77
          },
          kind: "named",
          name: "NuclideUri"
        }
      }, {
        name: "contents",
        type: {
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 78
          },
          kind: "string"
        }
      }, {
        name: "line",
        type: {
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 79
          },
          kind: "number"
        }
      }, {
        name: "column",
        type: {
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 80
          },
          kind: "number"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "JediService.js",
          line: 81
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 81
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "JediService.js",
              line: 81
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "JediService.js",
                line: 81
              },
              kind: "named",
              name: "JediCompletion"
            }
          }
        }
      }
    }
  }], ["get_definitions", {
    kind: "function",
    name: "get_definitions",
    location: {
      type: "source",
      fileName: "JediService.js",
      line: 85
    },
    type: {
      location: {
        type: "source",
        fileName: "JediService.js",
        line: 85
      },
      kind: "function",
      argumentTypes: [{
        name: "src",
        type: {
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 86
          },
          kind: "named",
          name: "NuclideUri"
        }
      }, {
        name: "contents",
        type: {
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 87
          },
          kind: "string"
        }
      }, {
        name: "line",
        type: {
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 88
          },
          kind: "number"
        }
      }, {
        name: "column",
        type: {
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 89
          },
          kind: "number"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "JediService.js",
          line: 90
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 90
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "JediService.js",
              line: 90
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "JediService.js",
                line: 90
              },
              kind: "named",
              name: "JediDefinition"
            }
          }
        }
      }
    }
  }], ["get_references", {
    kind: "function",
    name: "get_references",
    location: {
      type: "source",
      fileName: "JediService.js",
      line: 94
    },
    type: {
      location: {
        type: "source",
        fileName: "JediService.js",
        line: 94
      },
      kind: "function",
      argumentTypes: [{
        name: "src",
        type: {
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 95
          },
          kind: "named",
          name: "NuclideUri"
        }
      }, {
        name: "contents",
        type: {
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 96
          },
          kind: "string"
        }
      }, {
        name: "line",
        type: {
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 97
          },
          kind: "number"
        }
      }, {
        name: "column",
        type: {
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 98
          },
          kind: "number"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "JediService.js",
          line: 99
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 99
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "JediService.js",
              line: 99
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "JediService.js",
                line: 99
              },
              kind: "named",
              name: "JediReference"
            }
          }
        }
      }
    }
  }], ["get_outline", {
    kind: "function",
    name: "get_outline",
    location: {
      type: "source",
      fileName: "JediService.js",
      line: 103
    },
    type: {
      location: {
        type: "source",
        fileName: "JediService.js",
        line: 103
      },
      kind: "function",
      argumentTypes: [{
        name: "src",
        type: {
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 104
          },
          kind: "named",
          name: "NuclideUri"
        }
      }, {
        name: "contents",
        type: {
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 105
          },
          kind: "string"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "JediService.js",
          line: 106
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 106
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "JediService.js",
              line: 106
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "JediService.js",
                line: 106
              },
              kind: "named",
              name: "JediOutlineItem"
            }
          }
        }
      }
    }
  }], ["add_paths", {
    kind: "function",
    name: "add_paths",
    location: {
      type: "source",
      fileName: "JediService.js",
      line: 110
    },
    type: {
      location: {
        type: "source",
        fileName: "JediService.js",
        line: 110
      },
      kind: "function",
      argumentTypes: [{
        name: "paths",
        type: {
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 111
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "JediService.js",
              line: 111
            },
            kind: "string"
          }
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "JediService.js",
          line: 112
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "JediService.js",
            line: 112
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "JediService.js",
              line: 112
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "JediService.js",
                line: 112
              },
              kind: "string"
            }
          }
        }
      }
    }
  }]])
});