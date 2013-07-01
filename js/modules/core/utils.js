
thin.define("Utils", [], function() {
	function uuid() {
		return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
			var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
			return v.toString(16);
		});
	};

	var lowercase = function(string){return isString(string) ? string.toLowerCase() : string;};
	var uppercase = function(string){return isString(string) ? string.toUpperCase() : string;};

	function isUndefined(value){return typeof value == 'undefined';}
	function isDefined(value){return typeof value != 'undefined';}

	function isObject(value){return value != null && typeof value == 'object';}
	function isString(value){return typeof value == 'string';}
	function isNumber(value){return typeof value == 'number';}
	function isBoolean(value){return typeof value == 'boolean';}
	function isDate(value){return toString.apply(value) == '[object Date]';}
	function isArray(value) {return toString.apply(value) == '[object Array]';}
	function isFunction(value){return typeof value == 'function';}



	function copy(source, destination){
		if (isWindow(source) || isScope(source)) {
			throw ngMinErr('cpws', "Can't copy! Making copies of Window or Scope instances is not supported.");
		}

		if (!destination) {
			destination = source;
			if (source) {
				if (isArray(source)) {
					destination = copy(source, []);
				} else if (isDate(source)) {
					destination = new Date(source.getTime());
				} else if (isObject(source)) {
					destination = copy(source, {});
				}
			}
		} else {
			if (source === destination) throw ngMinErr('cpi', "Can't copy! Source and destination are identical.");
			if (isArray(source)) {
				destination.length = 0;
				for ( var i = 0; i < source.length; i++) {
					destination.push(copy(source[i]));
				}
			} else {
				var h = destination.$$hashKey;
				forEach(destination, function(value, key){
					delete destination[key];
				});
				for ( var key in source) {
					destination[key] = copy(source[key]);
				}
				setHashKey(destination,h);
			}
		}
		return destination;
	}

	function shallowCopy(src, dst) {
		dst = dst || {};

		for(var key in src) {
			if (src.hasOwnProperty(key) && key.substr(0, 2) !== '$$') {
				dst[key] = src[key];
			}
		}

		return dst;
	}

	function equals(o1, o2) {
		if (o1 === o2) return true;
		if (o1 === null || o2 === null) return false;
		if (o1 !== o1 && o2 !== o2) return true; // NaN === NaN
		var t1 = typeof o1, t2 = typeof o2, length, key, keySet;
		if (t1 == t2) {
			if (t1 == 'object') {
				if (isArray(o1)) {
					if ((length = o1.length) == o2.length) {
						for(key=0; key<length; key++) {
							if (!equals(o1[key], o2[key])) return false;
						}
						return true;
					}
				} else if (isDate(o1)) {
					return isDate(o2) && o1.getTime() == o2.getTime();
				} else {
					if (isScope(o1) || isScope(o2) || isWindow(o1) || isWindow(o2)) return false;
					keySet = {};
					for(key in o1) {
						if (key.charAt(0) === '$' || isFunction(o1[key])) continue;
						if (!equals(o1[key], o2[key])) return false;
						keySet[key] = true;
					}
					for(key in o2) {
						if (!keySet[key] &&
							key.charAt(0) !== '$' &&
							o2[key] !== undefined &&
							!isFunction(o2[key])) return false;
					}
					return true;
				}
			}
		}
		return false;
	}

	function makeMap(str){
		var obj = {}, items = str.split(","), i;
		for ( i = 0; i < items.length; i++ )
			obj[ items[i] ] = true;
		return obj;
	}

	/*
	 * @param {Object|Array} obj Object to iterate over.
	 * @param {Function} iterator Iterator function.
	 * @param {Object=} context Object to become context (`this`) for the iterator function.
	 * @returns {Object|Array} Reference to `obj`.
	 */
	function forEach(obj, iterator, context) {
		var key;
		if (obj) {
			if (isFunction(obj)){
				for (key in obj) {
					if (key != 'prototype' && key != 'length' && key != 'name' && obj.hasOwnProperty(key)) {
						iterator.call(context, obj[key], key);
					}
				}
			} else if (obj.forEach && obj.forEach !== forEach) {
				obj.forEach(iterator, context);
			} else if (isArrayLike(obj)) {
				for (key = 0; key < obj.length; key++)
					iterator.call(context, obj[key], key);
			} else {
				for (key in obj) {
					if (obj.hasOwnProperty(key)) {
						iterator.call(context, obj[key], key);
					}
				}
			}
		}
		return obj;
	}

	return {
		uuid: uuid,
		isUndefined: isUndefined,
		isDefined: isDefined,
		isObject: isObject,
		isString: isString,
		isNumber: isNumber,
		isBoolean: isBoolean,
		isDate: isDate,
		isArray: isArray,
		isFunction: isFunction,
		copy: copy,
		shallowCopy: shallowCopy,
		equals: equals,
		makeMap: makeMap,
		forEach: forEach
	};
});

thin.define("DOMUtil", [], function() {
	function create() {
		return document.createElement;
	}

	function remove() {
	}

	function getByAttr() {
		document.getAnonymousElementByAttribute()
	}

	function fragment(str) {
		var frag = document.createDocumentFragment();
		frag.innerHTML = str;
		return frag;
	}

	return {
		"create": create,
		"get": document.getElementById,
		"getByAttr": getByAttr,
		"remove": remove,
		"fragment": fragment
	};
});