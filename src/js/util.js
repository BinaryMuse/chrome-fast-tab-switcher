var Q = require('q');

module.exports = {
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
