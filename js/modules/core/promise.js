/**
 * Promise
 */
thin.define("Promise", ["PromiseState"], function () {
	function isPromise() {

	}

	var PromiseState = {
		PENDING: 0,
		FULFILLED: 1,
		REJECTED: 2
	};

	function Promise() {
		this._resolves = [];
		this._rejects = [];
		this._readyState = PromiseState.PENDING;
		this._data = null;
		this._reason = null;
	}

	Promise.prototype = {
		then: function (onFulfilled, onRejected) {
			var deferred = new Defer();

			function fulfill(data) {
				var ret = onFulfilled ? onFulfilled(data) : data;
				if (isPromise(ret)) {
					ret.then(function (data) {
						deferred.resolve(data);
					});
				} else {
					deferred.resolve(ret);
				}
				return ret;
			}

			if (this._readyState === PromiseState.PENDING) {
				this._resolves.push(fulfill);

				if (onRejected) {
					this._rejects.push(onRejected);
				} else {
					//为了让reject向后传递
					this._rejects.push(function (reason) {
						deferred.reject(reason);
					});
				}
			} else if (this._readyState === PromiseState.FULFILLED) {
				var self = this;
				setTimeout(function () {
					fulfill(self._data);
				});
			}
			return deferred.promise;
		},

		otherwise: function (onRejected) {
			return this.then(undefined, onRejected);
		}
	};

	function Defer() {
		this.promise = new Promise();
	}

	Defer.prototype = {
		resolve: function (data) {
			var promise = this.promise;
			if (promise._readyState != PromiseState.PENDING) {
				return;
			}

			promise._readyState = PromiseState.FULFILLED;
			promise._data = data;

			promise._resolves.forEach(function (handler) {
				handler(data);
			});
		},

		reject: function (reason) {
			var promise = this.promise;
			if (promise._readyState != PromiseState.PENDING) {
				return;
			}
			promise._readyState = PromiseState.REJECTED;
			promise._reason = reason;

			var handler = promise._rejects[0];
			if (handler) {
				handler(reason);
			}
		}
	};

	return {
		defer: function(){
			return new Defer();
		},

		all: function(promises){
			var deferred = Defer();

			var n = 0, result = [];
			promises.forEach(function(promise){
				promise.then(function(ret){
					result.push(ret);
					n++;

					if(n >= promises.length){
						deferred.resolve(result);
					}
				});
			});

			return deferred.promise;
		},

		any: function(promises){
			var deferred = Defer();

			promises.forEach(function(promise){
				promise.then(function(ret){
					deferred.resolve(ret);
				});
			});

			return deferred.promise;
		}
	};
});