


var DTS = require('../index.js')

var treeData = require('./arbitrary-tree.json')



var person = {
  name: "Bob",
  age: 37,
  nationality: 'US',
  random: function (condition, subjectData, cb) {
    cb(null, Math.floor(Math.random()*100))
  }
}

var conditionOpts = {
  percentageSplit: {
    hit: function (subjectData, cb) {
      console.log("HIT!")
      cb(null)
    },
    run: function (subjectData, cb) {
      console.log("RUN!")
      var result = 2
      cb(null, result)
    }
  }
}

var DecisionTree = new DTS({conditionOpts:conditionOpts})
DecisionTree.run(treeData, person, function (err, result) {
  if (err) console.error("ERROR", err)
  console.log("RESULT", result)
})

