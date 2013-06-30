
/**
 * Promise
 */
thin.module("Promise", [], function() {

	var defer = function () {
		var pending = [];
		var value;

		var deferred = {
			resolve: function (val) {
				if (pending) {
					var callbacks = pending;
					pending = undefined;
					value = ref(val);

					if (callbacks.length) {
						callLater(function () {
							var callback;
							for (var i = 0, ii = callbacks.length; i < ii; i++) {
								callback = callbacks[i];
								value.then(callback[0], callback[1]);
							}
						});
					}
				}
			},

			reject: function (reason) {
				deferred.resolve(reject(reason));
			},

			promise: {
				then: function (callback, errback) {
					var result = defer();

					var wrappedCallback = function (value) {
						try {
							result.resolve((callback || defaultCallback)(value));
						} catch (e) {
							exceptionHandler(e);
							result.reject(e);
						}
					};

					var wrappedErrback = function (reason) {
						try {
							result.resolve((errback || defaultErrback)(reason));
						} catch (e) {
							exceptionHandler(e);
							result.reject(e);
						}
					};

					if (pending) {
						pending.push([wrappedCallback, wrappedErrback]);
					} else {
						value.then(wrappedCallback, wrappedErrback);
					}

					return result.promise;
				},

				always: function (callback) {
					function makePromise(value, resolved) {
						var result = defer();
						if (resolved) {
							result.resolve(value);
						} else {
							result.reject(value);
						}
						return result.promise;
					}

					function handleCallback(value, isResolved) {
						var callbackOutput = null;
						try {
							callbackOutput = (callback || defaultCallback)();
						} catch (e) {
							return makePromise(e, false);
						}
						if (callbackOutput && callbackOutput.then) {
							return callbackOutput.then(function () {
								return makePromise(value, isResolved);
							}, function (error) {
								return makePromise(error, false);
							});
						} else {
							return makePromise(value, isResolved);
						}
					}

					return this.then(function (value) {
						return handleCallback(value, true);
					}, function (error) {
						return handleCallback(error, false);
					});
				}
			}
		};

		return deferred;
	};

	var ref = function (value) {
		if (value && value.then) return value;
		return {
			then: function (callback) {
				var result = defer();
				nextTick(function () {
					result.resolve(callback(value));
				});
				return result.promise;
			}
		};
	};

	var reject = function (reason) {
		return {
			then: function (callback, errback) {
				var result = defer();
				nextTick(function () {
					result.resolve((errback || defaultErrback)(reason));
				});
				return result.promise;
			}
		};
	};

	var when = function (value, callback, errback) {
		var result = defer(),
			done;

		var wrappedCallback = function (value) {
			try {
				return (callback || defaultCallback)(value);
			} catch (e) {
				exceptionHandler(e);
				return reject(e);
			}
		};

		var wrappedErrback = function (reason) {
			try {
				return (errback || defaultErrback)(reason);
			} catch (e) {
				exceptionHandler(e);
				return reject(e);
			}
		};

		callLater(function () {
			ref(value).then(function (value) {
				if (done) return;
				done = true;
				result.resolve(ref(value).then(wrappedCallback, wrappedErrback));
			}, function (reason) {
				if (done) return;
				done = true;
				result.resolve(wrappedErrback(reason));
			});
		});

		return result.promise;
	};

	function defaultCallback(value) {
		return value;
	}

	function defaultErrback(reason) {
		return reject(reason);
	}

	function all(promises) {
		var deferred = defer(),
			counter = 0,
			results = isArray(promises) ? [] : {};

		forEach(promises, function (promise, key) {
			counter++;
			ref(promise).then(function (value) {
				if (results.hasOwnProperty(key)) return;
				results[key] = value;
				if (!(--counter)) deferred.resolve(results);
			}, function (reason) {
				if (results.hasOwnProperty(key)) return;
				deferred.reject(reason);
			});
		});

		if (counter === 0) {
			deferred.resolve(results);
		}

		return deferred.promise;
	}

});