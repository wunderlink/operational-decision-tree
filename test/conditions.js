
module.exports = { 
  conditionBasic: function (opts, data, cb) {
    if (data.value > 0) {
      return cb(null, true)
    }   
    return cb(null, false)
  },  
  conditionOpts: function (opts, data, cb) {
    if (opts.value > data.value) {
      return cb(null, true)
    }   
    return cb(null, false)
  },  
  conditionAge: function (opts, data, cb) {
    if (eval(data.age+opts.operator+opts.value)){
      return cb(null, true)
    }   
    return cb(null, false)
  },  
  conditionAsync: function (opts, data, cb) {
    setTimeout( function () {
      return cb(null, false)
    }, 1000 )
  },  
  conditionPercent: function (opts, data, cb) {
    threshold = 0 
    for (var i in opts.split) {
      threshold += opts.split[i]
      if (data.random < threshold) {
        return cb(null, i)
      }   
    }   
    return cb(new Error('conditionPercent did not find a match!'))
  }
}

