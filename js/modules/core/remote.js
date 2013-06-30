thin.define("AJAX", [], function () {
	var XHR = window.XMLHttpRequest || function () {
		try {
			return new ActiveXObject("Msxml2.XMLHTTP.6.0");
		} catch (e1) {
		}
		try {
			return new ActiveXObject("Msxml2.XMLHTTP.3.0");
		} catch (e2) {
		}
		try {
			return new ActiveXObject("Msxml2.XMLHTTP");
		} catch (e3) {
		}
		//throw ngError(19, "This browser does not support XMLHttpRequest.");
	};

	function getURL(url, callback) {
		var xhr = new XHR();
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4) {
				if (xhr.status == 200) {
					callback(xhr.responseText);
				} else {
					alert('There was a problem with the request.');
				}
			}
		};
		xhr.open("GET", url);
	}


	var AJAX = {
		get: getURL
	};

	return AJAX;
});