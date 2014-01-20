(function(document, window, undefined) {
	document.documentElement.classList.add("js");

	$("#js-navbutton").on("click", function(e) {
		document.body.classList.toggle("nav-showing");
		e.preventDefault();
	});
})(document, window);
