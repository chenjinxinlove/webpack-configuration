var H = {
	_getArrMax: function(arr) {
		return Math.max.apply(Math, arr) || null;
	},
	_getArrMin: function(arr) {
		return Math.min.apply(Math, arr) || null;
	},
	len: 0,
	arrTem: [],
	_clearArr: function() {
		this.arrTem = [];
		this.arrCircle = [];
		this.arrPath = [];
	},
	_initWeaData: function(DataLIneY) { //参数为  一天的数组
		this._clearArr();
		this.arrTem = this.arrTem.concat(DataLIneY);
		this.len = this.arrTem.length;
		//生成 svg的circle数据  和 path的线数据
		var temMin = this._getArrMin(this.arrTem); //求出这一组温度的最大最小值
		var temMax = this._getArrMax(this.arrTem);
		//temD 一摄氏度 = X像素高
		if (temMin != temMax) {
			var temD = (this.height - 40) / (temMax - temMin);
		} else {
			var temD = (this.height - 40) / 1;
		}
		this.cel_w = this.width / this.len;
		var that = this;
		$.each(this.arrTem, function(i, v) {
			var circleX = that.cel_w * i + that.cel_w / 2;
			var circleY = (temMax - that.arrTem[i]) * temD +5;
			that.arrCircle.push({
				'x': circleX,
				'y': circleY
			});
			that.arrPath.push([circleX, circleY]);
		})
		this.svgPath = this.arrPath.join(',');
	},
	arrPath: [],
	width: 680,
	height: 70,
	cel_w: 0,
	svgPath: '',
	arrCircle: []
}

function CREAT_H_obj(options) {
	$.extend(this, options);
}
CREAT_H_obj.prototype = H;

//画曲线
function getAnchors(p1x, p1y, p2x, p2y, p3x, p3y) {
	var l1 = (p2x - p1x) / 2,
		l2 = (p3x - p2x) / 2,
		a = Math.atan((p2x - p1x) / Math.abs(p2y - p1y)),
		b = Math.atan((p3x - p2x) / Math.abs(p2y - p3y));
	a = p1y < p2y ? Math.PI - a : a;
	b = p3y < p2y ? Math.PI - b : b;
	var alpha = Math.PI / 2 - ((a + b) % (Math.PI * 2)) / 2,
		dx1 = l1 * Math.sin(alpha + a),
		dy1 = l1 * Math.cos(alpha + a),
		dx2 = l2 * Math.sin(alpha + b),
		dy2 = l2 * Math.cos(alpha + b);
	return {
		x1: p2x - dx1,
		y1: p2y + dy1,
		x2: p2x + dx2,
		y2: p2y + dy2
	};
}
function DrawLine(options, preNum,gapNum) {
	var Line = new CREAT_H_obj(options);
	Line._initWeaData(Line.lineData || []);
	var paper = Raphael(Line.domId.replace('#', ''), Line.width, Line.height);
	var prevLine = [];
	var nextLine = [];
	for(var i=0;i<preNum+2;i++){
		if(i==0){
			prevLine = ["M", Line.arrPath[i][0], Line.arrPath[i][1], "C", Line.arrPath[i][0], Line.arrPath[i][1]];
		}else{
			var a = getAnchors(Line.arrPath[i-1][0], Line.arrPath[i-1][1], Line.arrPath[i][0], Line.arrPath[i][1], Line.arrPath[i+1][0], Line.arrPath[i+1][1]);
			prevLine = prevLine.concat([a.x1, a.y1, Line.arrPath[i][0], Line.arrPath[i][1], a.x2, a.y2]);
		}
	}
	for(var i=preNum+1;i<Line.arrPath.length;i++){
		if(i==preNum+1){
			nextLine = ["M", Line.arrPath[i][0]+gapNum, Line.arrPath[i][1], "C", Line.arrPath[i][0]+gapNum, Line.arrPath[i][1]];
		}else if(i==Line.arrPath.length-1){
			nextLine = nextLine.concat([Line.arrPath[i][0]-gapNum, Line.arrPath[i][1],Line.arrPath[i][0]-gapNum, Line.arrPath[i][1]]);	
		}else{
			var a = getAnchors(Line.arrPath[i-1][0], Line.arrPath[i-1][1], Line.arrPath[i][0], Line.arrPath[i][1], Line.arrPath[i+1][0], Line.arrPath[i+1][1]);
			nextLine = nextLine.concat([a.x1, a.y1, Line.arrPath[i][0]-gapNum, Line.arrPath[i][1],"M",Line.arrPath[i][0]+gapNum, Line.arrPath[i][1],"C", a.x2, a.y2]);
		}
	}
	paper.path('M10,20').attr({"stroke":Line.lineColor,"stroke-width":Line.lineStrokewidth,"opacity":"0.3","path":prevLine});
	paper.path('M10,20').attr({"stroke": Line.lineColor,"stroke-width":Line.lineStrokewidth,"path":nextLine});
	//底线 
	/*paper.path('M10,20').attr({
		"stroke": Line.lineColor,
		"stroke-width": Line.lineStrokewidth,
		"path": "M" + Line.arrPath.slice(Line.pastNumber + preNum, Line.arrPath.length).join(',')
	});*/
	//前线
	/*paper.path('M10,20').attr({
		"stroke": Line.lineColor,
		'stroke-dasharray': '- ',
		"stroke-width": Line.lineStrokewidth,
		"opacity": "0.3",
		"path": "M" + Line.arrPath.slice(0, Line.pastNumber + preNum + 1).join(',')
	});*/
	var objCircle = [],
		space; //存储点circle对象的 数组
	for (var i = 0; i <= Line.len - 1; i++) {
		var circleX = Line.arrCircle[i].x;
		var circleY = Line.arrCircle[i].y;
		if (options.position == 'up') {
			var space = -25;
		} else {
			var space = 25;
		}
		var circleColor = options.circleColor;
		if (i < options.pastNumber + preNum) {
			objCircle.push(paper.circle(10, circleY, options.circleWidth).attr({
				'fill': circleColor,
				"opacity": "0.3",
				'stroke': "#fff",
				"stroke-width": 1,
				'cx': circleX - options.circleWidth
			}));
			paper.text(circleX - 8, circleY + space, Line.lineData[i] + '°' || '').attr({
				"fill": "#aaa",
				"font-size": "18px",
				"text-anchor": "start"
			});
		} else {
			objCircle.push(paper.circle(10, circleY, options.circleWidth).attr({
				'fill': circleColor,
				'stroke': "#fff",
				"stroke-width": 1,
				'cx': circleX
			}));
			paper.text(circleX - 8, circleY + space, Line.lineData[i] + '°' || '').attr({
				"fill": "#fff",
				"font-size": "18px",
				"text-anchor": "start"
			});
		};
	}
}
var data = [3, 8, 16, 24, 13, 21, 22, 15, 10, 3, 4, 16, 10, 13, 3, 31, 6, 11, 14, 23, 25, 21, 28, 30]
new DrawLine({
	domId: '#chartLine',
	width: 1320,
	height: 100,
	lineData: data, //温度数据
	circleColor: '#f88e3a',
	circleWidth: 3,
	lineColor: '#f88e3a',
	lineStrokewidth: 2,
	pastNumber: 1,
	position: 'down',
	animate: 0
}, -1,0);