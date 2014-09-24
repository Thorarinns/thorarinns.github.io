$(function (){
	$("#body").children().hide();
	$("#frontD").fadeIn(1000);

	$(".navbar-nav li").click(function () {
		$(".navbar-nav li.active").removeClass('active')
		this.className = "active";

		$("#body").children().hide();
		$("#"+this.firstChild.id+"D").fadeIn(1000);
			
	})

});