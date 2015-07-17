


var DTS = require('../index.js')

var treeData = require('./arbitrary-tree.json')


var conditions = {
  conditionPercent: function (opts, data, cb) {
    var threshold = 0 
    for (var i in opts.split) {
      console.log("V", i, opts.split[i])
      threshold += opts.split[i]
      if (data.random < threshold) {
        return cb(null, i)
      }   
    }   
    return cb(new Error('conditionPercent did not find a match!'))
  },
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
  conditions: conditions
}

var person = {
  name: "Bob",
  age: 37,
  nationality: 'US',
  random: Math.floor(Math.random()*100)
}

var DecisionTree = new DTS(opts)
DecisionTree.run(treeData, person, function (err, result) {
  if (err) console.error("ERROR", err)
  console.log("RESULT", result)
})

