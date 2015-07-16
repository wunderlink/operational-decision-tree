


var DTS = require('../index.js')

var treeData = require('./binary.json')

var conditions = {
	conditionAge: function (opts, data, cb) {
    if (eval(data.age+opts.operator+opts.value)){
      return cb(null, true)
    }
    return cb(null, false)
  },
	conditionCountry: function (opts, data, cb) {
    if (data.nationality === opts.value) {
      return cb(null, true)
    }
    return cb(null, false)
  }
}

var opts = {
  conditions: conditions,
  decider: function (result) {
    if (result) {
      return 1
    } else {
      return 0
    }
  }
}

var person = {
  name: "Bob",
  age: 37,
  nationality: 'US'
}


var DecisionTree = new DTS(opts)
DecisionTree.run(treeData, person, function (err, result) {
  if (err) console.error("ERROR", err)
  console.log("RESULT", result)
})
