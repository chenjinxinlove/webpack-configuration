	var html = "";
	for (var i = 0; i < 24; i++) {
		if (i == 1) {
			html += '<li class="cur"><div class="time">08时</div><div class="weather svnicon01"></div><div class="charts"></div><div class="wind">西南风</div><div class="windL">>3级</div></li>';
		} else {
			html += '<li><div class="time">08时</div><div class="weather svnicon01 weather-02"></div><div class="charts"></div><div class="wind">西南风</div><div class="windL">>3级</div></li>';
		}
	};
	$('#weatherALL').html(html);
	var chartsLiWidth = $("#weatherALL").width() / 24;
	//左右按钮事件
	$(".rightBtn").click(function() {
		var nowLeft = $("#weatherALL").position().left;
		var maxLeft = -chartsLiWidth * (24 - 13);
		if (nowLeft > maxLeft) {
			$(".leftBtn").removeClass('dis');
			nowLeft = nowLeft - chartsLiWidth * 3;
			if (nowLeft <= maxLeft) {
				$(".rightBtn").addClass('dis');
				nowLeft = maxLeft
			}
			if (!$("#weatherALL").is(":animated")) {
				$("#weatherALL").animate({
					"left": nowLeft + "px"
				});
				$("#chartLine").animate({
					"left": nowLeft + "px"
				});
			}
		}
	});
	$(".leftBtn").click(function() {
		$(".rightBtn").removeClass('dis');
		var nowLeft = $("#weatherALL").position().left;
		var maxLeft = 0;
		if (nowLeft < maxLeft) {
			nowLeft = nowLeft + chartsLiWidth * 3;
			if (nowLeft >= maxLeft) {
				$(".leftBtn").addClass('dis');
				nowLeft = maxLeft
			}
			if (!$("#weatherALL").is(":animated")) {
				$("#weatherALL").animate({
					"left": nowLeft + "px"
				});
				$("#chartLine").animate({
					"left": nowLeft + "px"
				});
			}
		}
	});
	$(".closeHelp").click(function() {
		$(".helpShow").addClass('dis');
		$(".closeRainMsg").removeClass('dis');
		$(".helpIcon").removeClass('dis');
	});
	$(".closeBox").click(function() {
		$(".togetherWeatherBox").addClass('dis');
	});
	$(".togetherWeather").click(function() {
		$(".togetherWeatherBox").removeClass('dis');
	});
	$(".helpIcon").click(function() {
		$(".helpIcon").addClass('dis');
		$(".helpShow").removeClass('dis');
		$(".closeRainMsg").addClass('dis');
	});
	$(".closeRainMsg").click(function() {
		$(".rainMsg").addClass('dis');
	});