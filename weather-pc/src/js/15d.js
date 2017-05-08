function dw(drawBaseOb, obj) {
    var xr = drawBaseOb.xr;
    var line = drawBaseOb.line;
    var color = obj.color, dotColor = obj.dotColor, dotDiameter = obj.dotDiameter, dotStrokeColor = obj.dotStrokeColor, dotStroke = obj.dotStroke, opacity = obj.opacity;
    PADDING = obj.PADDING, W = obj.W, H = obj.H, r = Raphael(drawBaseOb.id, W, H), textStyle = obj.textStyle, values = obj.values, len = values.length;
    var valuesMax = Math.max.apply({}, values),
      valuesMin = Math.min.apply({}, values);
    var valuesInt = valuesMax - valuesMin;
    function sY(y) {
      if (!xr) {
        return H - PADDING.top - ((H - PADDING.top - PADDING.buttom - 20) / valuesInt ) * (y - valuesMin)
      } else {
        return H - PADDING.top - 20 - ((H - PADDING.top - PADDING.buttom - 20) / valuesInt ) * (y - valuesMin)
      }
    }
    //xy 坐标转换
    function translate(x, y) {
      return [
        PADDING.left + (W - PADDING.left - PADDING.right) / (values.length - 1) * x,
        sY(y)
      ];
    }
    var p = [["M"].concat(translate(0, values[0]))],
      X = [],
      Y = [],
      blankets = r.set(),
      buttons = r.set(),
    //边距
      w = (W - PADDING) / values.length,
      isDrag = -1,
      start = null,
    //设置颜色与线宽
      sub = r.path().attr({stroke: "none", fill: color, opacity: opacity});
    var path;
    if (line) {
      path = r.path().attr({stroke: color, "stroke-width": 2});
    } else {
      path = r.path().attr({stroke: color, "stroke-width": 0});
    }
    var unhighlight = function () {
    };
    var lenght;
    for (i = 0, lenght = values.length - 1; i < lenght; i++) {
      var xy = translate(i, values[i]),
        xy1 = translate(i + 1, values[i + 1]),
        f;
      X[i] = xy[0];
      Y[i] = xy[1];
      (f = function (i, xy) {
        var attrObg;
        if (line){
          attrObg = {
            fill: dotColor,
            stroke: dotStrokeColor,
            "stroke-width": dotStroke
          }
        }else{
          if (!i) {
            attrObg = {
              fill: 'RGB(194,194,195)',
              stroke: 'RGB(194,194,195)',
              "stroke-width": '1',
            }
          }else{
            attrObg = {
              fill: dotColor,
              stroke: dotStrokeColor,
              "stroke-width": dotStroke
            }
          }
        }

        buttons.push(r.circle(xy[0], xy[1], dotDiameter).attr(attrObg));

      })(i, xy);
      if (i == lenght - 1) {
        f(i + 1, xy1);
      }
    }
    xy = translate(lenght, values[lenght]);
    X.push(xy[0]);
    Y.push(xy[1]);
    if (!line) {
      if (!xr) {
        var text = r.text(X[0], Y[0] - 20, values[0] + '°C');
        text.attr({
          "fill": "RGB(194,194,195)", "font-size": "16px", "text-anchor": "center"
        });
      } else {
        var text = r.text(X[0], Y[0] + 20, values[0] + '°C');
        text.attr({
          "fill": "RGB(194,194,195)", "font-size": "14px", "text-anchor": "center"
        });
      }
    }else{
      var text = r.text(X[0], Y[i] + 40, values[i] + '°C');
      text.attr(textStyle);
    }

    for (i = 1, lenght = values.length; i < lenght; i++) {
      if (!xr) {
        var text = r.text(X[i], Y[i] - (obj.fontWz || 15), values[i] + '°C');
        text.attr(textStyle);
      } else {
        var text = r.text(X[i], Y[i] + (obj.fontWz || 15), values[i] + '°C');
        text.attr(textStyle);
      }
    }
    //画图
    function drawPath() {
      var p = [];
      for (var j = 1, jj = X.length; j < jj; j++) {
        p.push(X[j], Y[j]);
      }
      p = ["M", X[0], Y[0], "R"].concat(p);
      var subaddon;
      if (xr) {
        subaddon = "L" + (W - PADDING.left) + "," + 0 + ",42," + (0) + "z";
      } else {
        subaddon = "L" + (W - PADDING.left) + "," + (H - PADDING.buttom) + ",42," + (H - PADDING.top) + "z";
      }

      path.attr({path: p});
      sub.attr({path: p + subaddon});

    }
    drawPath();
  }




var drawNoneBlue = {
    color: "rgba(254,240,208,0.8)",//背景颜色
    dotColor: '#e7924c',//点颜色
    dotDiameter: 3,//点的大小
    dotStrokeColor: '#fff',//点的外围颜色
    dotStroke: '1', //点的外圈的宽度
    opacity: 1,//透明度
    PADDING: {left: 42, top: 5, right: 42, buttom: 5},//图表的内边距
    W: 687,//图表宽度
    H: 50,//图表高度
    textStyle: {"fill": "#333", "font-size": "16x", "text-anchor": "center"},//设置文字样式
    values: [17, 14, 16, 18, 15, 16, 18, 20]//数据
  };
  var drawNoneBlueq = {
    color: "rgba(254,240,208,0.8)",//背景颜色
    dotColor: '#999',//点颜色
    dotDiameter: 2,//点的大小
    dotStrokeColor: '#fff',//点的外围颜色
    dotStroke: '0', //点的外圈的宽度
    opacity: 1,//透明度
    PADDING: {left: 42, top: 5, right: 42, buttom: 5},//图表的内边距
    W: 687,//图表宽度
    H: 50,//图表高度
    textStyle: {"fill": "#999", "font-size": "14px", "text-anchor": "center"},//设置文字样式
    values: [17, 14, 16, 18, 15, 16, 18, 20]//数据
  };


dw({
      id: 'drawTFF', //id
      xr: 'xr',//判断上下
      line: ''//判断是否是画线
    }, drawNoneBlueq);
    dw({
      id: 'drawOFF', //id
      xr: '',//判断上下
      line: ''//判断是否是画线
    }, drawNoneBlue)
$('.click_wrap_f > li').on('hover', function(){
  var index = $(this).index();
  var blues = $('.blue-item');
  blues.removeClass('active');
  $(blues[index]).addClass('active');
  var items = $('.date-bottom-blue');
    var blues = $('.blue-item');
    items.removeClass('date-bottom-active');
    $(items[index]).addClass('date-bottom-active');
    var itemacEle = $('.item-active').clone();
    $('.item-active').detach();
    blues.removeClass('active');
    $(blues[index]).append(itemacEle).addClass('active')

})