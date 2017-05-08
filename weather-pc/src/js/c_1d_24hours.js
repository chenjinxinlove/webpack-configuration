//整点实况曲线
setAirData(observe24h_data);

function setAirData(observe24h_data){
	//主体
	var BHtml2= '<div class="tabs"><h2>整点天气实况</h2><p id="currHour"></p><p class="second"><b id="detailHour"></b></p><ul><li class="aqi_on on" data-role="air">空气质量</li><li class="p2" data-role="tem">温度</li><li class="sd" data-role="humidity">相对湿度</li><li class="js" data-role="rain">降水量</li><li class="fl" data-role="wind">风力风向</li></ul></div><div class="split"></div><div class="chart"><div id="hourHolder"><div class="xLabel"></div><div class="yLabel"></div><div class="result"></div><div class="showData"></div></div><em>(h)</em><b id="wd"></b> <b id="tem">℃</b> <b id="pm10">(μg/m³)</b> <b id="sd">(%)</b> <b id="js">(mm)</b> <b id="fl">(级)</b><p class="air detail">空气质量指数：简称AQI，是定量描述空气质量状况的无量纲指数。（数据由环保部提供）</p><p class="humidity">相对湿度：空气中实际水汽压与当时气温下的饱和水汽压之比，以百分比（%）表示。</p><p class="pm10 tem">温度：表示大气冷热程度的物理量，气象上给出的温度是指离地面1.5米高度上百叶箱中的空气温度。</p><p class="rain">降水量：某一时段内的未经蒸发、渗透、流失的降水，在水平面上积累的深度，以毫米（mm）为单位。 </p><p class="wind">风力风向：空气的水平运动，风力是风吹到物体上所表示出力量的大小，风向指风的来向。</p><div class="aqiColorExp clearfix"><span class="span1">优</span> <span class="span2">良</span> <span class="span3">轻度</span> <span class="span4">中度</span> <span class="span5">重度</span> <span class="span6">严重</span></div>';
	var $weatherChart = $('#weatherChart').html(BHtml2);

	//绘制表格
	//$('#hourHolder').html('<div class="xLabel"></div><div class="yLabel"></div><div class="result"></div><div class="showData"></div>');
	Raphael.fn.drawGrid = function(x, y, w, h, hv, color) {
		color = color || "#000";
		var path = ["M", Math.round(x) + .5, Math.round(y) + .5, "L", Math.round(x + w) + .5, Math.round(y) + .5],
			rowHeight = h / hv;
		for (var i = 1; i <= hv; i++) {
			path = path.concat(["M", Math.round(x) + .5, Math.round(y + i * rowHeight) + .5, "H", Math.round(x + w) + .5]);
			
		}
		return this.path(path.join(',')).attr({
			stroke: color,
			fill: "#fff"
		});
	};
	//多边形定义
	Raphael.fn.polygon = function(x, y, s) {
		var path = ["M", x, y, "L", x - s * Math.sin(15), y+3, x, y - s * Math.sin(15) * 2, x + s * Math.sin(15), y+3, "z"];
		return this.path(path.join(","));
	}

	var rowNum = 6,
		paper = null;
	//分析数据
	var isInvalid = function(val,isWind){
		//风数据为0是为不合法
		return val == '' || val == 'null' || isWind && val == 0;
	}
	var adjustData = {
		length: 0,
		date: [],
		air: [],
		airSum:0,
		tem:[],
		temSum:0,
		humidity: [],
		humiditySum:0,
		rain: [],
		rainSum: 0,
		windLevel: [],
		windAngle: [],
		windDirection: [],
		windSum:0,
		flagData: {
			air: {
				max: 0,
				min: 0
			},
			tem:{
				max: 0,
				min: 0
			},
			humidity: {
				max: 0,
				min: 0
			},
			rain: {
				max: 0,
				min: 0
			},
			wind: {
				max: 0,
				min: 0
			}
		},
		min: {
			air: 0,
			tem:0,
			humidity: 0,
			rain: 0,
			wind: 0
		},
		max: {
			air: 0,
			tem:0,
			humidity: 0,
			rain: 0,
			wind: 12
		},
		step: {
			air: 0,
			tem:1,
			humidity: 1,
			rain: 1,
			wind: 2
		},
		invalid: {
			air: [],
			tem: [],
			humidity: [],
			rain: [],
			wind: []
		},
		init: function(data) {
			//数据初始化
			var arr = data.od.od2;
			this.length = 25;
			for (var i = this.length-1; i >= 0; i--) {
				var d = arr[i];
				//时间
				this.date.push(d.od21); 
				//空气质量
				if (isInvalid(d.od28)){//空气质量无效数据
					this.invalid.air.push(i); //od28->0d27
				}
				this.air.push(d.od28);
				//温度
				if (isInvalid(d.od22)){
					this.invalid.tem.push(i); //温度无效数据
				}
				this.tem.push(d.od22); 
				//湿度
				if (isInvalid(d.od27)){
					this.invalid.humidity.push(i); //湿度无效数据
				}
				this.humidity.push(d.od27); 
				//降雨
				if (isInvalid(d.od26)){
					this.invalid.rain.push(i); //降雨无效数据
				}	
				this.rain.push(d.od26); 
				//风力
				if (isInvalid(d.od25,true)){
					this.invalid.wind.push(i); //风力无效数据
				}
				this.windLevel.push(d.od25); 
				this.windAngle.push(d.od23); //风向（角度）
				this.windDirection.push(d.od24); //风向（描述）
				this.rainSum += parseFloat(d.od26) || 0; //处理不合法数据NaN
				this.airSum += parseFloat(d.od28)|| 0;
				this.temSum += parseFloat(d.od22)|| 0;
				this.humiditySum += parseFloat(d.od27)|| 0;
				this.windSum += parseFloat(d.od25)|| 0;

			}
			//过滤不合法数据
			//zk modify,加默认值，防止"null"等不合法数据影响
			var formateNumArr = function(arr,defaultVal){
				var a = [];
				$.each(arr,function(i,v){
					if(!isNaN(v)){
						a.push(v);
					}else{
						a.push(defaultVal);
						arr[i] = '';//对不合法数据进行清空处理
					}
				});
				return a;
			}
			var MAX = adjustData.max,
				MIN = adjustData.min;
			var _getMin = function(arr){
				var n = 99;
				for (var i = 0; i < arr.length; i++) {
					if(arr[i] && Number(arr[i]) < n){
						n = arr[i];
					}
				};
				return n!=99&&n||'';
				// return Math.min.apply(Math,arr);
			}
				
			// var _getMax = function(arr){
			// 	return Math.max.apply(Math,arr);
			// }
			function _getMax(arr){
				var n = -99;
				for (var i = 0; i < arr.length; i++) {
					if(arr[i] && Number(arr[i]) > n){
						n = arr[i];
					}
				};
				return n!=-99&&n||'';
			}
			var _getFloor = function(val){
				return Math.floor(val);
			}
			var _getCeil = function(val){
				return Math.ceil(val);
			}
			var _flagData = adjustData.flagData;
			
			// _flagData.air.min = _getMin( formateNumArr(adjustData.air,MIN.air)); //空气质量最小值
			_flagData.air.max = _getMax( formateNumArr(adjustData.air,MAX.air)); //空气质量最大值

			_flagData.tem.min = _getMin( formateNumArr(adjustData.tem,MIN.tem)); //温度最小值
			_flagData.tem.max = _getMax( formateNumArr(adjustData.tem,MAX.tem)); //温度最大值

			
			_flagData.rain.min = _getMin( formateNumArr(adjustData.rain,MIN.rain)); //降水量最小值
			_flagData.rain.max = _getMax( formateNumArr(adjustData.rain,MAX.rain)); //降水量最大值
			_flagData.humidity.min = _getMin( formateNumArr(adjustData.humidity,MIN.humidity)); //湿度最小值
			_flagData.humidity.max = _getMax( formateNumArr(adjustData.humidity,MAX.humidity)); //湿度量最大值
			_flagData.wind.min = _getMin( formateNumArr(adjustData.windLevel,MIN.wind)); //风力最小值
			_flagData.wind.max = _getMax( formateNumArr(adjustData.windLevel,MAX.wind)); //风力最大值

			adjustData.min.air = _getFloor(adjustData.flagData.air.min); //空气质量最小值
			adjustData.min.tem = _getFloor(adjustData.flagData.tem.min); //温度最小值
			adjustData.min.rain = _getFloor(adjustData.flagData.rain.min); //降水量最小值
			adjustData.min.humidity = _getFloor(adjustData.flagData.humidity.min); //湿度最小值

			adjustData.max.air = _getFloor(adjustData.flagData.air.max); //空气质量最大值
			adjustData.max.tem = _getFloor(adjustData.flagData.tem.max); //温度最大值
			adjustData.max.rain = _getCeil(adjustData.flagData.rain.max); //降水量最大值
			adjustData.max.humidity = _getCeil(adjustData.flagData.humidity.max); //湿度最大值

			//设置step
			adjustData.min.air = adjustData.min.air - adjustData.step.air;
			if (adjustData.min.humidity - adjustData.step.humidity >= 0)
				adjustData.min.humidity -= adjustData.step.humidity;
			if (adjustData.min.rain - adjustData.step.rain >= 0)
				adjustData.min.rain -= adjustData.step.rain;
			if (adjustData.min.tem - adjustData.step.tem >= 0)
				adjustData.min.tem -= adjustData.step.tem;
			
			if ((adjustData.max.air - adjustData.min.air) / rowNum > adjustData.step.air) {
				adjustData.step.air = _getCeil((adjustData.max.air - adjustData.min.air) / rowNum);
			}
			if ((adjustData.max.humidity - adjustData.min.humidity) / rowNum > adjustData.step.humidity) {
				adjustData.step.humidity = _getCeil((adjustData.max.humidity - adjustData.min.humidity) / rowNum);
			}
			if ((adjustData.max.rain - adjustData.min.rain) / rowNum > adjustData.step.rain) {
				adjustData.step.rain = _getCeil((adjustData.max.rain - adjustData.min.rain) / rowNum);
			}
			if ((adjustData.max.tem - adjustData.min.tem) / rowNum > adjustData.step.tem) {
				adjustData.step.tem = _getCeil((adjustData.max.tem - adjustData.min.tem) / rowNum);
			}
			adjustData.max.air = adjustData.min.air + adjustData.step.air * rowNum;
			adjustData.max.humidity = adjustData.min.humidity + adjustData.step.humidity * rowNum;
			adjustData.max.tem = adjustData.min.tem + adjustData.step.tem * rowNum;

			//设置湿度极大值为100%
			if (adjustData.max.humidity > 100) {
				adjustData.max.humidity = 100;
				adjustData.min.humidity = adjustData.max.humidity - adjustData.step.humidity * rowNum;
			}
			adjustData.max.rain = adjustData.min.rain + adjustData.step.rain * rowNum;
		}
	};
	adjustData.init(observe24h_data);
	var zh = addNum(adjustData.rain[0], adjustData.rain[1], adjustData.rain[2], adjustData.rain[3], adjustData.rain[4], adjustData.rain[5], adjustData.rain[6], adjustData.rain[7], adjustData.rain[8], adjustData.rain[9], adjustData.rain[10], adjustData.rain[11], adjustData.rain[12], adjustData.rain[13], adjustData.rain[14], adjustData.rain[15], adjustData.rain[16], adjustData.rain[17], adjustData.rain[18], adjustData.rain[19], adjustData.rain[20], adjustData.rain[21], adjustData.rain[22], adjustData.rain[23], adjustData.rain[24]);
	var $split = $weatherChart.find('.split').append('<p class="air on">AQI最高值: '+adjustData.flagData.air.max+'</p><p class="tem">最高气温: '+adjustData.flagData.tem.max+'℃ , 最低气温: '+adjustData.flagData.tem.min+'℃</p><p class="humidity">最大相对湿度: '+adjustData.flagData.humidity.max+'%</p><p class="wind">最大风力: '+adjustData.flagData.wind.max+'级</p><p class="rain">总降水量：'+zh+'mm</p>');
	function sum(arr){
		var sum = 0;
		for (var i = arr.length - 1; i >= 0; i--) {
			sum += Number(arr[i]);
		};
		return Math.floor(sum*10)/10;
	}
	function addNum(num1,num2,num3,num4,num5,num6,num7,num8,num9,num10,num11,num12,num13,num14,num15,num16,num17,num18,num19,num20,num21,num22,num23,num24){var sq1,sq2,sq3,sq4,sq5,sq6,sq7,sq8,sq9,sq10,sq11,sq12,sq13,sq14,sq15,sq16,sq17,sq18,sq19,sq20,sq21,sq22,sq23,sq24,m;try{sq1=num1.toString().split(".")[1].length}catch(e){sq1=0}try{sq2=num2.toString().split(".")[1].length}catch(e){sq2=0}try{sq3=num3.toString().split(".")[1].length}catch(e){sq3=0}try{sq4=num4.toString().split(".")[1].length}catch(e){sq4=0}try{sq5=num5.toString().split(".")[1].length}catch(e){sq5=0}try{sq6=num6.toString().split(".")[1].length}catch(e){sq6=0}try{sq7=num7.toString().split(".")[1].length}catch(e){sq7=0}try{sq8=num8.toString().split(".")[1].length}catch(e){sq8=0}try{sq9=num9.toString().split(".")[1].length}catch(e){sq9=0}try{sq10=num10.toString().split(".")[1].length}catch(e){sq10=0}try{sq11=num11.toString().split(".")[1].length}catch(e){sq11=0}try{sq12=num12.toString().split(".")[1].length}catch(e){sq12=0}try{sq13=num13.toString().split(".")[1].length}catch(e){sq13=0}try{sq14=num14.toString().split(".")[1].length}catch(e){sq14=0}try{sq15=num15.toString().split(".")[1].length}catch(e){sq15=0}try{sq15=num15.toString().split(".")[1].length}catch(e){sq15=0}try{sq16=num16.toString().split(".")[1].length}catch(e){sq16=0}try{sq17=num17.toString().split(".")[1].length}catch(e){sq17=0}try{sq18=num18.toString().split(".")[1].length}catch(e){sq18=0}try{sq19=num19.toString().split(".")[1].length}catch(e){sq19=0}try{sq20=num20.toString().split(".")[1].length}catch(e){sq20=0}try{sq21=num21.toString().split(".")[1].length}catch(e){sq21=0}try{sq22=num22.toString().split(".")[1].length}catch(e){sq22=0}try{sq23=num23.toString().split(".")[1].length}catch(e){sq23=0}try{sq24=num24.toString().split(".")[1].length}catch(e){sq24=0}
    m = Math.pow(10,Math.max(sq1,sq2,sq3,sq4,sq5,sq6,sq7,sq8,sq9,sq10,sq11,sq12,sq13,sq14,sq15,sq16,sq17,sq18,sq19,sq20,sq21,sq22,sq23,sq24));
    return (num1 * m + num2 * m+ num3 * m+ num4 * m+ num5 * m+ num6 * m+ num7 * m+ num8 * m+ num9 * m+ num10 * m+ num11 * m+ num12 * m+ num13 * m+ num14 * m+ num15 * m+ num16 * m+ num17 * m+ num18 * m+ num19 * m+ num20 * m+ num21 * m+ num22 * m+ num23 * m+ num24 * m) / m;
}

	var observe24hGraph = {
		width: 0,
		height: 0,
		leftgutter: 0,
		bottomgutter: 0,
		topgutter: 0,
		rightgutter: 0,
		rowNum: 0,
		colNum: 0,
		cellHeight: 0,
		cellWidth: 0,
		grid: null,
		rects: null,
		shap: null,
		path: null,
		init: function(obj) {
			var temp_Label = [];
			this.width = obj.width;
			this.height = obj.height;
			this.leftgutter = obj.leftgutter;
			this.bottomgutter = obj.bottomgutter;
			this.topgutter = obj.topgutter;
			this.rightgutter = obj.rightgutter;
			this.rowNum = obj.rowNum;
			this.colNum = obj.colNum;
			this.cellHeight = (this.height - this.topgutter - this.bottomgutter) / this.rowNum;
			this.cellWidth = (this.width - this.leftgutter - this.rightgutter) / this.colNum;
			paper = Raphael(obj.container, observe24hGraph.width, observe24hGraph.height);
			this.grid = paper.drawGrid(observe24hGraph.leftgutter, observe24hGraph.topgutter, observe24hGraph.width - observe24hGraph.leftgutter - observe24hGraph.rightgutter, observe24hGraph.height - observe24hGraph.topgutter - observe24hGraph.bottomgutter, observe24hGraph.rowNum, "#eee");
			this.rects = paper.set();
			this.rects1 = paper.set();
			this.shap = paper.set();
			//绘制柱状区域和横坐标
			
			for (var i = 0, ii = this.colNum; i < ii; i++) {
				//绘制柱状区域
				observe24hGraph.rects.push(paper.rect(observe24hGraph.leftgutter + observe24hGraph.cellWidth * i, observe24hGraph.topgutter, observe24hGraph.cellWidth, observe24hGraph.height - observe24hGraph.bottomgutter - observe24hGraph.topgutter).attr({
					stroke: "#fff",
					fill: "#fafafb",
					opacity: 1
				}));
				//绘制横坐标
				temp_Label.push("<span>" + obj.date[i] + "</span>");
			}
			$(".xLabel").html(temp_Label.join(""));
		},
		drawGraph: function(obj) {
			//绘制y坐标
			var temp_labels = [],
				step = obj.step,
				unit = obj.unit,
				max = obj.max,
				min = obj.min,
				cellWidth = this.cellWidth,
				cellHeight = this.cellHeight,
				topgutter = this.topgutter,
				leftgutter = this.leftgutter,
				height = this.height - topgutter - this.bottomgutter;

			for (var i = 0; i <= this.rowNum; i++) {
				if(i!=1&&i!=3&&i!=5){
					temp_labels.unshift("<span>" + (min + i * step) + "</span>");
				}
			}
			$(obj.container).html(temp_labels.join(""));
			//zk modify,不处理不合法数据
			if(obj.data.length == obj.invalid.length){
				return;
			}
			var leftgutter = this.leftgutter,
				cellWidth = this.cellWidth,
				r = obj.r || 0,
				y0 = this.height - this.bottomgutter;

			var $container = $(obj.dataContainer);
			
			switch (obj.shap) {
				case 'rect':
					var rectStyle = [];
					for (var i = 0, ii = this.colNum; i < ii; i++) {
						var x = Math.round(leftgutter + cellWidth * (i + .5)) + 0.5,
							y = Math.round(cellHeight * ((max - obj.data[i]) / step) + topgutter);

						var _stroke = '#fff'
							,_fill;
						if (unit =='') {

							if (obj.data[i] <= 50) {
								_fill = '#9dca80';
							} else if (obj.data[i] <= 100) {
								_fill = '#f7da64';
							} else if (obj.data[i] <= 150) {
								_fill = '#f29e39';
							} else if (obj.data[i] <= 200) {
								_fill = '#da555d';
							} else if (obj.data[i] <= 300) {
								_fill = '#b9377a';
							} else{
								_fill = '#881326';
							}
						}else{
							_fill = '#ffbc57';
						}
						
						if(_stroke && _fill){
							rectStyle.push({
								stroke: _stroke,
								"stroke-width": 1,
								fill: _fill
							});
						}
						observe24hGraph.rects[i].attr({opacity: '0'});//柱状图，隐藏背景柱状
						this.shap.push(paper.rect((x - cellWidth * 0.5)+4, y0, 16, 0,8).attr(rectStyle[i]));
						this.shap[i].animate({
							height: (height - y + topgutter+8),
							transform: ["t0," + (-y0 + y)]
						}, 500);
						//鼠标事件
						(function(i, x, y, d) {
							if (d != "" && d != 0) {
								var _show = function(){
									observe24hGraph.shap[i].attr({
										fill: "#f68c39"
									});
									$container.css({
										background: '#f68d39'
									});
									if (unit =='') {
										$container.html(d + unit+"<i class='tooltips'></i>");
									}else{
										$container.html(d + unit+"<i class='tooltips'></i>");
									};

									var _width = $container.width();
									var _left = x + 2;
									$container.css({
										"top": y-25,
										"left": _left
									}).show();
								}
								var _hide = function(){
									observe24hGraph.shap[i].attr(rectStyle[i]);
									$container.hide();
								}
								observe24hGraph.rects[i].hover(_show, _hide)
								observe24hGraph.shap[i].hover(_show, _hide)
							}
						})(i, x, y, obj.data[i]);
					}
					break;
				default:
					var Style = [],
						crossLine = paper.path().attr({
							stroke: "#076ea8",
							"stroke-width": 1
						}),
						pathCount = obj.invalid.length + 1,
						initPath = new Array(pathCount),
						path = new Array(pathCount),
						bgpp = new Array(pathCount),//阴影
						pathIndex = 0;
						this.path = new Array(pathCount);
					var initY = Math.round(cellHeight * ((max - min) / step) + topgutter);//阴影
					for (var i = 0, ii = this.colNum; i < ii; i++) {
						var x = Math.round(leftgutter + cellWidth * (i + .5)) + 0.5,
							y = Math.round(cellHeight * ((max - obj.data[i]) / step) + topgutter);

						if (obj.data[i] == "")
							pathIndex++;
						else {
							if (i == 0 || obj.data[i - 1] == "") {
								path[pathIndex] = ["M", x, y, "L", x, y];								
								bgpp[pathIndex] = ["M", x, initY, "L", x, y, "L", x, y];
								initPath[pathIndex] = ["M", x, initY, "L", x, initY];
							}
							if (i != 0 && obj.data[i + 1] != "" && obj.data[i - 1] != "") {
								var Y0 = Math.round(cellHeight * (max - obj.data[i - 1]) / step + topgutter),
									X0 = Math.round(leftgutter + cellWidth * (i - .5)),
									Y2 = Math.round(cellHeight * (max - obj.data[i + 1]) / step + topgutter),
									X2 = Math.round(leftgutter + cellWidth * (i + 1.5));
								path[pathIndex] = path[pathIndex].concat(X0, Y0, x, y, X2, Y2);
								bgpp[pathIndex] = bgpp[pathIndex].concat(X0, Y0, x, y, X2, Y2);
								initPath[pathIndex] = initPath[pathIndex].concat(X0, initY, x, initY, X2, initY);
							}
							if(obj.data[i + 1] == ""){
								bgpp[pathIndex] = bgpp[pathIndex].concat([x, y, x, y, "L", x, initY, "z"]);
							}

						}
						if (obj.shap == 'dot') {
							var _color,_fill;
							if (unit == "μg/m³" || unit =='') {
								
								if (obj.data[i] <= 50) {
									_color = '#6ac6ce';
								} else if (obj.data[i] <= 100) {
									_color = '#78ba60';
								} else if (obj.data[i] <= 150) {
									_color = '#f4b212';
								} else if (obj.data[i] <= 200) {
									_color = '#e24e31';
								} else if (obj.data[i] <= 300) {
									_color = '#ce1c5b';
								} else{
									_color = '#880b20';
								}
							}else if (unit == "℃") {
								_color = '#ff9900';
								_fill = "#fff"

							}else {
								_color = '#206cbd';
							}
							if(_color){
								//温度圆点周边为白色
								if(_fill=="#fff"){
									Style.push({
										fill: _color,
										stroke: _fill,
										"stroke-width": 1
									});
								}else{
									Style.push({
										fill: _color,
										stroke: _color,
										"stroke-width": 1
									});
								}
							}
							this.shap.push(paper.circle(x, y0, r).attr(Style[i]));
						} else {
							if (i == 0){
								Style.push({
									fill: "#8ec2f1",
									stroke: "#8ec2f1",
									"stroke-width": 1
								});
							}
							this.shap.push(paper.polygon(x, y0+3, r).attr(Style[0]));
						}
						if (obj.data[i] == "")
							this.shap[i].hide();
						if (obj.shap == 'dot') {
							this.shap[i].animate({
								cy: y
							}, 500).attr({
								cy: y
							});
						} else {
							this.shap[i].animate({
								transform: ["t0," + (-y0 + y) + "r" + (obj.angle[i]-180)]//处理角度
							}, 500);
						}
					}
					for (var p = 0; p < pathCount; p++) {
						if(!initPath[p]){
							continue;
						}
						if(p==pathCount-1&&unit == "%"){
							bgpp[p] =bgpp[p].concat([x, y, x, y, "L", x, initY, "z"]);
						}
						this.path[p] = paper.path(initPath[p]);
						if(unit == "%"){
							this.path[p].attr({stroke: "none", opacity: 1, fill: "#ddf0fb"}).hide();
							this.path[p].animate({
								path: bgpp[p]
							}, 470).show();						
						}else if(unit == "℃"){
							this.path[p].attr({stroke: "#ff9900","stroke-width": 2,"stroke-linejoin": "round"}).hide();
							this.path[p].animate({
								path: path[p]
							}, 470).show();
						}else{
							this.path[p].attr({stroke: "#dedede","stroke-width": 2,"stroke-linejoin": "round"}).hide();
							this.path[p].animate({
								path: path[p]
							}, 470).show();
						}
					}
					for (var d = 0, dd = this.colNum; d < dd; d++) {
						if(!this.shap[d]){
							continue;
						}
						this.shap[d].toFront();
					}
					//重新绘制矩形，做hover事件，主要针对阴影部分没有hover事件问题
					for (var i = 0, ii = this.colNum; i < ii; i++) {
						//绘制柱状区域
						observe24hGraph.rects1.push(paper.rect(observe24hGraph.leftgutter + observe24hGraph.cellWidth * i, observe24hGraph.topgutter, observe24hGraph.cellWidth, observe24hGraph.height - observe24hGraph.bottomgutter - observe24hGraph.topgutter).attr({
							stroke: "none",
							fill: "#fff",
							opacity: 0
						}));
					}
					for (var i = 0, ii = this.colNum; i < ii; i++) {
						var x = Math.round(leftgutter + cellWidth * (i + .5)) + 0.5,
							y = Math.round(cellHeight * ((max - obj.data[i]) / step) + topgutter);
						if(unit == "%"){
							observe24hGraph.shap.hide();
						}
						//鼠标事件
						(function(i, x, y, d, desc) {
							var _show = function() {
								/*crossLine.attr({
									path: ["M", x, 0, "V", observe24hGraph.height - 25, "M", 10, y + 0.5, "H", observe24hGraph.width]
								}).show();*/

								if(unit == "%"||unit == "℃"){
									$container.css({
										background: '#206cbd'
									});
									$container.html(desc + d + unit+"<i class='tooltipsB'></i>");
								}else{
									$container.css({
										background: '#f68d39'
									});
									$container.html(desc + d + unit+"<i class='tooltips'></i>");
								}
								var _width = $container.width();
								var _left = x + 2;
								if (_width + x > 660) {
									_left = x;
								}
								$container.css({
									"top": y-35,
									"left": _left
								}).show();								
								if(unit == "级"){
									observe24hGraph.shap[i].attr({
										fill: "#f68c39",
										stroke: "#f68c39",
										"stroke-width": 1
									});
								}
								observe24hGraph.shap[i].show();
							}
							var _hide = function() {
								// crossLine.hide();
								$(obj.dataContainer).hide();
								if(unit == "%"){
									observe24hGraph.shap[i].hide();
								}
								if(unit == "级"){
									observe24hGraph.shap[i].attr({
										fill: "#8ec2f1",
										stroke: "#8ec2f1",
										"stroke-width": 1
									});
								}
							}
							if (d != "") {
								observe24hGraph.rects1[i].hover(_show, _hide)
							}
							observe24hGraph.shap[i].hover(_show, _hide)
						})(i, x, y, obj.data[i], obj.desc && obj.desc[i] || '');
					}
					break;
			}

		}
	}
	var dataConf = {
		"width": 630,
		"height": 130,
		"leftgutter": 42,
		"bottomgutter": 40,
		"topgutter": 10,
		"rightgutter": 10,
		"rowNum": rowNum,
		"colNum": adjustData.length,
		"container": "hourHolder",
		"date": adjustData.date
	}
	var graphConf = {
		"shap": "rect",
		"container": ".yLabel",
		"dataContainer": ".showData",
		"min": adjustData.min.air,
		"max": adjustData.max.air,
		"data": adjustData.air,
		"unit": "",//μg/m³
		"invalid": adjustData.invalid.air,
		"step": adjustData.step.air,
		"r": 3
	}
	//初始化温度图表
	observe24hGraph.init(dataConf);
	observe24hGraph.drawGraph(graphConf);
	function getNewestData(dataArr){
		var arr = dataArr;
		var l = arr.length-1;
		while(arr[l]=='' && l>0){
			--l;
		}
		return arr[l];
	}
	var dataLen = adjustData.length;
	function isEmpty(invalidDataArr){
		return invalidDataArr.length == dataLen;
	}
	//观察台
	
	var $currHour = $("#currHour");
	var $detailHour = $("#detailHour");
	var $result = $("#hourHolder .result");
	var newTemperature = getNewestData(adjustData.air);
	$("#weatherChart .tabs ul li").hover(function(){
		var tc = $(this).attr('class');
		if (tc.length>3) return;
		$(this).attr('class',$(this).attr('data-role')+' '+tc);
	},function(){	
		$(this).removeClass($(this).attr('data-role'));
	}).click(function() {
		var $colExp = $('.aqiColorExp');
		if ($(this).hasClass("on")) return;
		var prev = $(this).siblings(".on");
		var data_role = $(this).attr("data-role");
		var prev_data_role = prev.attr("data-role");
		prev.attr("class", prev.attr("class").replace("_on", "")).removeClass("on");
		$(this).attr("class", $(this).attr("class") + "_on").addClass("on");
		$result.hide();
		$weatherChart.find('.split').children().filter('.'+data_role).addClass('on').siblings().removeClass('on');
		var invalidData = adjustData.invalid;
		var _graphConf;
		//console.log(adjustData,invalidData)
		switch (data_role) {
			case 'humidity':
				$('#sd').show().siblings('b').hide();
				$colExp.hide()
				var humiditySum = adjustData.humiditySum;
				if (isNaN(humiditySum) || humiditySum == 0 || isEmpty(invalidData.humidity) ) {
					//$detailHour.html("总降水量:暂无数据");
					$result.html("暂无数据").show();
					$('.split .humidity').hide();
				}
				_graphConf = $.extend({},graphConf,{
					"shap": "dot",
					"min": adjustData.min.humidity,
					"max": adjustData.max.humidity,
					"data": adjustData.humidity,
					"unit": "%",//"%"
					"invalid": invalidData.humidity,
					"step": adjustData.step.humidity
				});

				break;
			case 'tem':
				$('#tem').show().siblings('b').hide();
				$colExp.hide()
				var temSum = adjustData.temSum;
				if (isNaN(temSum) || temSum == 0 || isEmpty(invalidData.tem) ) {
					//$detailHour.html("总降水量:暂无数据");
					$result.html("暂无数据").show();
					$('.split .tem').hide();
				}
				_graphConf = $.extend({},graphConf,{
					"shap": "dot",
					"min": adjustData.min.tem,
					"max": adjustData.max.tem,
					"data": adjustData.tem,
					"unit": "℃",//℃
					"invalid": invalidData.tem,
					"step": adjustData.step.tem
				});
				break;
			
			case 'air':
				$('#wd').show().siblings('b').hide();
				var newestVal = getNewestData(adjustData.air);
				$colExp.show()
				var airSum = adjustData.airSum;
				if (isNaN(airSum) || airSum == 0 || isEmpty(invalidData.air) ) {
					//$detailHour.html("总降水量:暂无数据");
					$result.html("暂无数据").show();
					$('.split .air').hide();
				}
				break;
			case 'rain':
				$('#js').show().siblings('b').hide();
				var newestVal = getNewestData(adjustData.rain);
				var rainSum = adjustData.rainSum;
				if (isNaN(rainSum) || rainSum == 0 || isEmpty(invalidData.rain) ) {
					//$detailHour.html("总降水量:暂无数据");
					$result.html("24小时内无降水数据").show();
				}
				$colExp.hide();
				_graphConf = $.extend({},graphConf,{
					"min": adjustData.min.rain,
					"max": adjustData.max.rain,
					"data": adjustData.rain,
					"unit": "mm",//"mm"
					"step": adjustData.step.rain,
					"invalid": invalidData.rain
				});
				break;
			case 'wind':
				$('#fl').show().siblings('b').hide();
				$colExp.hide()
				var windSum = adjustData.windSum;
				if (isNaN(windSum) || windSum == 0 || isEmpty(invalidData.wind) ) {
					//$detailHour.html("总降水量:暂无数据");
					$result.html("暂无数据").show();
					$('.split .wind').hide();
				}
				_graphConf = $.extend({},graphConf,{
					"shap": "polygon",
					"min": adjustData.min.wind,
					"max": adjustData.max.wind,
					"data": adjustData.windLevel,
					"angle": adjustData.windAngle,
					"direction": adjustData.windDirection,
					'desc': adjustData.windDirection, // .windDirection
					"unit": "级",//"级"
					"invalid": invalidData.wind,
					"step": adjustData.step.wind,
					"r": 8
				})
				break;
		}
		paper.remove();
		observe24hGraph.init(dataConf);
		observe24hGraph.drawGraph(_graphConf || graphConf);
		$("#weatherChart .chart .detail").removeClass("detail");
		$("#weatherChart .chart").find("." + data_role).addClass("detail");
	})
	
	var hasApiNum = false;
	// 空气质量
	/*$.each(observe24h_data.od.od2,function(i,v){
		if(v.od28){
			hasApiNum = true;
		}
	})*/
	if(!hasApiNum){
		$('#weatherChart [data-role=air]').hide().next().click();
	}
}	

 
 