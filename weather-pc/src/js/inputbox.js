/**
 * jQuery InputBox - A Custom Select/Checkbox/Radio Plugin
 * ------------------------------------------------------------------
 *
 * jQuery InputBox is a plugin for custom Select/Checkbox/Radio Plugin.
 *
 * @version        1.1.0
 * @since          2013.09.27
 * @author         charles.yu
 *
 * ------------------------------------------------------------------
 *
 *  eg:
 *	1、Select
 *  //class: selected 表示默认选中,如有多个selected默认选中第一个
 *  <div name="city" type="selectbox">
 *		<div class="opts">
 *			<a href="javascript:;" val="050101">苏州</a>
 *			<a href="javascript:;" val="050101" class="selected">无锡</a>
 *			<a href="javascript:;" val="050101" class="selected">常州</a>
 *		</div>
 *	</div>
 *  $('div[name="city"]').inputbox();
 *
 *	2、Checkbox  
 *	//class: all 表示是全选|全不选按钮，如果是全选按钮，则其"name"为控制对象的"name+All"; checked 表示默认选中  
 *	<div class="cbt all" name="checkAll" type="checkbox"></div>
 *  <div class="cbt checked" name="check"  type="checkbox" val="1" ></div>
 *	<div class="cbt checked" name="check"  type="checkbox" val="2" ></div>
 *	<div class="cbt" name="check"  type="checkbox" val="3"></div>
 *  $('.cbt').inputbox();
 *
 *	3、Radio
 *  //class: checked 表示默认选中，如有多个selected默认选中最后一个
 *	<div name="rbt checked" type="radiobox" val="cn"></div><span>中文</span>
 *	<div name="rbt" type="radiobox" val="en"></div><span>英文</span>
 *	$('div[name="rbt"]').inputbox();
 */
;(function($){
	var opts = {};
		   
	var selectbox = {
		//初始化自定义selectbox
		init: function(o) {
			var $o = $(o),
				_name = $o.attr('name'),
				_selectValue = $o.find('.opts > a.selected').attr('val')? $o.find('.opts > a.selected').attr('val'):$o.find('.opts > a:first').attr('val'),
				_selectHtml = $o.find('.opts > a.selected').html()? $o.find('.opts > a.selected').html():$o.find('.opts > a:first').html();
				
			$o.addClass('sb');
			$o.append($('<div class="sb_icon arrow" />')).append($('<input type="hidden" name="' + _name + '" value="' + _selectValue + '">'));
			$('<div class="selected">' + _selectHtml + '</div>').insertBefore($o.children(':first'));
			
			$o.children('.opts').show();
			var optsWidth = $o.children('.opts').width();
			
			if(optsWidth == 0){
				var optsChildWidth = [];
				var tempWidth = 0;
				$o.children('.opts').children('a').each(function(){
					optsChildWidth.push($(this).width());
				});
				for(var i=0; i<optsChildWidth.length ; i++){
					if(optsChildWidth[i] > tempWidth)
						tempWidth = optsChildWidth[i]
				}
				optsWidth = tempWidth + 10;
			}
			$o.children('.opts').hide();
			$o.children('.opts').css('width', (optsWidth + 15));
	
			var _width = (opts.width != 'auto')? opts.width : $o.children('.opts').width();
			//var _width = (opts.width != 'auto')? opts.width : ($o.width() > 0 ? $o.width() : $o.children('.opts').width());
			
			$o.css({'width': _width, 'height': opts.height}).find('div.selected').css({'height': opts.height, 'line-height': opts.height +'px'});
			$o.find('.sb_icon').css({'top': ($o.height() - $o.find('.sb_icon').height())/2});
			
			$o.off('click').on('click', selectbox.toggle);
			$o.off('click', '.opts > a').on('click', '.opts > a', selectbox.select);
			$o.find('.opts').off('mouseenter mouseleave').on('mouseenter', selectbox.mouseenter).on('mouseleave', selectbox.mouseleave);
			$(document).off('click', selectbox.hide).on('click', selectbox.hide);

		},
		toggle: function(e) {
			e.stopPropagation();
			var $o = $(this);
			var $opts = $o.children('.opts');
			
			$o.find('a.selected').removeClass('none');
			selectbox.hide(null, $('.sb').not($o));
			$o.toggleClass('sb_active');
			$opts.css({
				'width': Math.max($opts.width(), $o.width()),
				'top': $o.height(),
				'left': - parseInt($o.css('border-left-width'))
			}).toggle($o.hasClass('sb_active'));

		},
		hide: function(e, objs) {
			var $o = objs ? objs : $('.sb');
			$o.removeClass('sb_active').children('.opts').hide().find('a.selected').removeClass('none');	
		},
		select: function(e) {
			e.stopPropagation();
			var $o = $(this).parents('.sb:first');
			$o.trigger('click');
			$o.find('a.selected').removeClass('selected');
			$(this).addClass('selected');
			$o.find('div.selected').html($(this).html());
			$o.find('input').val($(this).attr('val'));
		},
		mouseenter: function(e){
			e.stopPropagation();
			var $o = $(this);
			$o.find('a.selected').addClass('none');
		},
		mouseleave: function(e){
			e.stopPropagation();
			var $o = $(this);
			$o.find('a.selected').removeClass('none');
		}
	};
	
	var checkbox = {
		//初始化checkbox
		init: function(o) {
			var $o = $(o),
				_name = $o.attr('name'),
				_value = $o.attr('val')? $o.attr('val'): '',
				_isChecked = $o.hasClass('checked')? true : false;
			
			$o.addClass('cb');
			$o.append($('<input type="hidden" name="' + _name + '" value="' + _value + '" />'));
			$o.click(checkbox.toggle);
			if($o.hasClass('all')) $o.click(checkbox.allOrNone);
			if(_isChecked){
				$o.removeClass('checked'); 
				$o.click();
			}
		},
		toggle: function(e) {
			$(this).toggleClass('cb_active').children().attr('checked', ($(this).hasClass('cb_active') ? true : false));
		},
		allOrNone: function(e) {
			var cbAllName = $(this).attr('name');
			if(cbAllName.length > 3){
				var cbOneName = cbAllName.substring(0, cbAllName.length - 3);
				var isChecked = $(this).hasClass('cb_active')? true : false;
				if(isChecked){
					$('.cb[name='+ cbOneName +']').not($('.cb_active[name='+ cbOneName +']')).click();
				}else{
					$('.cb_active[name='+ cbOneName +']').click();
				}
			}
		}
	};
	
	var radiobox = {
		//初始化radiobox
		init: function(o) {
			var $o = $(o),
				_name = $o.attr('name'),
				_value = $o.attr('val')? $o.attr('val'): '';
				_isChecked = $o.hasClass('checked')? true : false;
				
			$o.addClass('rb');
			$o.append($('<input type="hidden" name="' + _name + '" value="' + _value + '" />'));
			$o.click(radiobox.toggle);
			if(_isChecked){
				$o.removeClass('checked'); 
				$o.click();
			}
		},
		toggle: function() {
			var $o = $(this),
				_name = $o.attr('name');
				
			$('[name="'+ _name +'"]').removeClass('rb_active').children().attr('checked', false);
			$o.addClass('rb_active').children().attr('checked', true);
		}
	},
	
	_init = function(o){
		var type = $(o).attr('type');
		if(type == 'selectbox'){
			selectbox.init(o);
		}else if(type == 'checkbox'){
			checkbox.init(o);
		}else if(type == 'radiobox'){
			radiobox.init(o);
		}
	};
	
	$.fn.inputbox = function(options){
        opts = $.extend({}, $.fn.inputbox.defaults, options);

        return this.each(function(){
            _init(this);
        });
    };

    $.fn.inputbox.defaults = {
		//type: 'selectbox',//selectbox|checkbox|radiobox
		width : 'auto',
		height : 24
    };
})(jQuery);

;(function($){
	var opts = {}, ids = [], optsArray = [], that, currentOpts = {};
	
	var pcData = {'provinces':[]},//省市数据
		caData = {'cities':[]};//市区数据
	var defaultStr = '<a href="javascript:void(0);" val="-1">请选择</a>',
		defaultId = -1,
		defaultName = '请选择';
	
	//处理取回的数据
	function handleData(datas){
		var tempArr = [];
		var tempProvinces = [];
		var tempCities = [];
		var tempAreas = [];
		var reProvince=/^[0-9]{2}0{4}$/;//省的格式:前2位为'01~99'，后4位为'0000'  例：010000
		var reCity=/^[0-9]{4}0{2}$/;//城市的格式:前2位为'01~99',中间2位'01~99',后2位为'00' 例:010100
		var reArea=/^[0-9]{6}$/;//区的格式:前2位为'01~99',中间2位'01~99',后2位为'01~99' 例:010101
		
		//循环取得的数据，添加到用于存放省、市、区的临时数组中
		for(var i=0; i<datas.length; i++){
			tempArr = datas[i].split(':');
			if(reProvince.test(tempArr[0])){
				tempProvinces.push({'id':tempArr[0],'name':tempArr[1], 'cities':[]});
			}else if(reCity.test(tempArr[0])){
				tempCities.push({'id':tempArr[0],'name':tempArr[1], 'areas':[]});
			}else if(reArea.test(tempArr[0])){
				tempAreas.push({'id':tempArr[0],'name':tempArr[1], 'towns':[]});
			}
		}
		
		//将城市信息添加到对应省份中去
		for(var i=0; i<tempProvinces.length; i++){
			var pId = tempProvinces[i].id.substring(0,2);
			for(var j=0; j<tempCities.length; j++){
				if(tempCities[j].id.substring(0,2) == pId){
					tempProvinces[i].cities.push(tempCities[j]);
				}
			}
		}
		
		//将区信息添加到对应城市中去
		for(var i=0; i<tempCities.length; i++){
			var cId = tempCities[i].id.substring(0,4);
			for(var j=0; j<tempAreas.length; j++){
				if(tempAreas[j].id.substring(0,4) == cId){
					tempCities[i].areas.push(tempAreas[j]);
				}
			}
		}
		
		pcData.provinces = tempProvinces;
		caData.cities = tempCities;
		
	};
	
	function showProvince(obj, selectPId){
		var tempStr = defaultStr;
		var tempId = defaultId;
		var tempName = defaultName;
		var _provinces = pcData.provinces;
		var _cities = [];
		if(_provinces.length > 0){
			for(var i=0; i<_provinces.length; i++){
				if(selectPId && selectPId == _provinces[i].id){
					tempStr += '<a href="javascript:void(0);" val="' + _provinces[i].id + '" class="selected">' + _provinces[i].name + '</a>';
					tempId = _provinces[i].id;
					tempName = _provinces[i].name;
					_cities = _provinces[i].cities;
				}else{
					tempStr += '<a href="javascript:void(0);" val="' + _provinces[i].id + '">' + _provinces[i].name + '</a>';
				}
			}
		}
		
		$(obj).find('div[name="province"]').html('<div class="opts">'+ tempStr +'</div');
		$(obj).find('div[name="province"]').inputbox({'width':currentOpts.width, 'height':currentOpts.height});

		return _cities;
	};
	
	function showCity(obj, cities, selectCId){
		var tempStr = defaultStr;
		var tempId = defaultId;
		var tempName = defaultName;
		var _cities = cities? cities : [];
		var _areas = [];

		if(_cities.length > 0){
			for(var i=0; i<_cities.length; i++){
				if(selectCId && selectCId == _cities[i].id){
					tempStr += '<a href="javascript:void(0);" val="' + _cities[i].id + '" class="selected">' + _cities[i].name + '</a>';	
					tempId = _cities[i].id;
					tempName = _cities[i].name;
					_areas = _cities[i].areas;
				}else{
					tempStr += '<a href="javascript:void(0);" val="' + _cities[i].id + '">' + _cities[i].name + '</a>';
				}
			}
		}
		
		$(obj).find('div[name="city"]').html('<div class="opts">'+ tempStr +'</div');
		$(obj).find('div[name="city"]').inputbox({'width':currentOpts.width, 'height':currentOpts.height});
		
		return _areas;
	};
	
	function showArea(obj, areas, selectAId){
		var tempStr = defaultStr;
		var tempId = defaultId;
		var tempName = defaultName
		var _areas = areas? areas : [];
		var _towns = [];
		
		if(_areas.length > 0){
			for(var i=0; i<_areas.length; i++){
				if(selectAId && selectAId == _areas[i].id){
					tempStr += '<a href="javascript:void(0);" val="' + _areas[i].id + '" class="selected">' + _areas[i].name + '</a>';
					tempId = _areas[i].id;
					tempName = _areas[i].name;
					_towns = _areas[i].towns;
				}else{
					tempStr += '<a href="javascript:void(0);" val="' + _areas[i].id + '">' + _areas[i].name + '</a>';
				}
			}
		}
		
		$(obj).find('div[name="area"]').html('<div class="opts">'+ tempStr +'</div');
		$(obj).find('div[name="area"]').inputbox({'width':currentOpts.width, 'height':currentOpts.height});

		return _towns;
	};

	function createInterval(){
		var spid = $(that).find('input[name="province"]').val();
		var scid = $(that).find('input[name="city"]').val();
		var said = $(that).find('input[name="area"]').val();
		var _that = that;
	
		var checkValChange = setInterval(function(){
		
			var _spid = $(_that).find('input[name="province"]').val(),
				_scid = $(_that).find('input[name="city"]').val(),
				_said = $(_that).find('input[name="area"]').val();
				
			if(optsArray.length > 0){
				for(var i=0; i<optsArray.length; i++){
					if(_that == optsArray[i].obj){
						
						currentOpts = optsArray[i].opts;
						
						//监听省份变化，改变城市的值
						if(optsArray[i].ids.spid != _spid){
							optsArray[i].ids.spid = _spid;
							if(_spid == -1){
								showCity(_that);
							}
							for(var j=0; j< pcData.provinces.length; j++){
								if(_spid == pcData.provinces[j].id){
									showCity(_that, pcData.provinces[j].cities);
									break;
								}
							}
							$(_that).find('input[name="area"]').val(-1);
						}
						//监听城市变化，改变区的值
						if(optsArray[i].ids.scid != _scid){
							optsArray[i].ids.scid = _scid;
							if(_scid == -1){
								showArea(_that);
							}
							for(var j=0; j< caData.cities.length; j++){
								if(_scid == caData.cities[j].id){
									showArea(_that, caData.cities[j].areas);
									break;
								}
							}
						}
						
						break;
					}
				}
			}
		},10);	
	};

	function init(){
		handleData(opts.data);
		currentOpts = opts;
		var spid = $(that).find('.province').val();
		var scid = $(that).find('.city').val();
		var said = $(that).find('.area').val();
		
		var ps = showProvince(that, spid);
		var cs = showCity(that, ps, scid);
		var as = showArea(that, cs, said);
		
		optsArray.push({obj:that, opts:opts, ids:{spid:spid, scid:scid, said:said}});
		createInterval();
	};
	
	$.fn.ganged = function(options){
        opts = $.extend({}, $.fn.ganged.defaults, options);

        return this.each(function(){
			that = this;
            init();
        });
    };

    $.fn.ganged .defaults = {
		data : [],
		width : 'auto',
		height : 24
    };
})(jQuery);