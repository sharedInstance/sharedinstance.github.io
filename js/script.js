document.documentElement.classList.add("js");

document.addEventListener("DOMContentLoaded", function() {
	document.querySelector("#js-navbutton").addEventListener("click", function(e) {
		document.body.classList.toggle("nav-showing");
		e.preventDefault();
	});
});
