var Q = require('q');

module.exports = {
  // `pcall` takes a function that takes a set of arguments and
  // a callback (NON-Node.js style) and turns it into a promise
  // that gets resolved with the arguments to the callback.
  pcall: function(fn) {
    var deferred = Q.defer();
    var callback = function() {
      deferred.resolve(Array.prototype.slice.call(arguments)[0]);
    };
    var newArgs = Array.prototype.slice.call(arguments, 1);
    newArgs.push(callback);
    fn.apply(null, newArgs);
    return deferred.promise;
  }
};
