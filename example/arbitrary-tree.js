


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

var DecisionTree = new DTS()
DecisionTree.run(treeData, person, function (err, result) {
  if (err) console.error("ERROR", err)
  console.log("RESULT", result)
})

