function empty(val) {
    return (val === '' || val === null || val === undefined || val === false || val === '0' || val === 0);
}

var UserAgent = navigator.userAgent.toLowerCase();
var Browser = {
    version: (UserAgent.match( /.+(?:rv|it|ra|ie)[\/: ]([\d.]+)/ ) || [])[1],
    MobileSafari: !!UserAgent.match(/Apple.*Mobile.*Safari/),
    Safari: /webkit/.test(UserAgent),
    Opera: /opera/.test(UserAgent),
	IE: /msie/.test(UserAgent) && !/opera/.test(UserAgent),
	Mozilla: /mozilla/.test(UserAgent) && !/(compatible|webkit)/.test(UserAgent)
}

var DOM = {
        
    ready: function(fn) {
        var done = false, top = true,

        win = window, doc = win.document, root = doc.documentElement,

        add = doc.addEventListener ? 'addEventListener' : 'attachEvent',
        rem = doc.addEventListener ? 'removeEventListener' : 'detachEvent',
        pre = doc.addEventListener ? '' : 'on',

        init = function(e) {
            if (e.type == 'readystatechange' && doc.readyState != 'complete') return;
            (e.type == 'load' ? win : doc)[rem](pre + e.type, init, false);
            if (!done && (done = true)) fn.call(win, e.type || e);
        },

        poll = function() {
            try { root.doScroll('left'); } catch(e) { setTimeout(poll, 50); return; }
            init('poll');
        };

        if (doc.readyState == 'complete') fn.call(win, 'lazy');
        else {
            if (doc.createEventObject && root.doScroll) {
                try { top = !win.frameElement; } catch(e) { }
                if (top) poll();
            }
            doc[add](pre + 'DOMContentLoaded', init, false);
            doc[add](pre + 'readystatechange', init, false);
            win[add](pre + 'load', init, false);
        }
    },
    
    get: function(selector) {
        var sel = selector.substring(0, 1);
        var name = selector.substring(1);
        switch (sel) {
            case '#':
                return this.getById(name);
            case '.':
                return this.getByClass(name);
            default:
                return this.getByTag(name);
        }
    },
       
    getById: function(elemId) {
        return document.getElementById(elemId);
    },
    
    getByClass: function(className) {
        return document.getElementsByClassName(className);
    },
    
    getByTag: function(tagName) {
        return document.getElementsByTagName(tagName);
    },
       
    query: function(query) {
        return document.querySelector(query);
    },
    
    queryAll: function(query) {
        return document.querySelectorAll(query);
    }
}
var $d = DOM;

var addEvent, removeEvent;
if (window.addEventListener) {
    addEvent = function(obj, type, fn) {
        obj.addEventListener(type, fn, false);
    }
    removeEvent = function(obj, type, fn) {
        obj.removeEventListener(type, fn, false);
    }
} else if (document.attachEvent) {
    addEvent = function(obj, type, fn) {
        var eProp = type + fn;
        obj['e' + eProp] = fn;
        obj[eProp] = function() {
            obj['e' + eProp](window.event);
        }
        obj.attachEvent('on' + type, obj[eProp]);
    }
    removeEvent = function(obj, type, fn) {
        var eProp = type + fn;
        obj.detachEvent('on' + type, obj[eProp]);
        obj[eProp] = null;
        obj["e" + eProp] = null;
    }
}
function cancelEvent(event) {
    if (event.preventDefault) {
        event.preventDefault();
    } else {
        event.returnValue = false;
    }
}

var HTMLElement = {
    haveClass: function(elem, className){
		return (new RegExp("(^|\\s+)"+className+"(\\s+|$)", "g")).test(elem.className);
	},

    addClass: function(elem, className){
		if(!HTMLElement.haveClass(elem, className))
			{elem.className += ((elem.className)?' ':'') + className;}
    },

    removeClass: function(elem, className){
        elem.className = elem.className.replace(
        new RegExp("(^|\\s+)"+className+"(\\s+|$)"), ' ').replace(/^\s+/, '').replace(/\s+$/, '');
    },
	
	getStyle: function(elem, estilo){
		var valor = null;
		try{
			valor = document.defaultView.getComputedStyle(elem, null)[estilo];
		} catch(exc){
			try{
				valor = elem.currentStyle[estilo];
			}catch(exc2){
				valor = elem.style[estilo];
			}
		}
		return valor;
	},
	
	setStyle: function(elem, estilo, valor){
		if(estilo == 'opacity'){
			if(Browser.IE){
				valor = parseInt(valor*100);
				valor = 'alpha(opacity='+valor+')';
				estilo = 'filter';
			}
		}
		
		elem.style[estilo] = valor;
	},
	
	getElementPosition: function(elem){

        var left = 0, top = 0, results;
        if (elem != null && elem != undefined){
            var parent       = elem.parentNode,
                offsetChild  = elem,
                offsetParent = elem.offsetParent,
                doc          = elem.ownerDocument,
                safari2      = Browser.Safari && parseInt(Browser.version) < 522 && !/adobeair/i.test(UserAgent),
                fixed        = HTMLElement.getStyle(elem, 'position') == "fixed";

            if ( elem.getBoundingClientRect ) {
                var box = elem.getBoundingClientRect();

                add(box.left + Math.max(doc.documentElement.scrollLeft, doc.body.scrollLeft),
                    box.top  + Math.max(doc.documentElement.scrollTop,  doc.body.scrollTop));

                add( -doc.documentElement.clientLeft, -doc.documentElement.clientTop );

            } else {

                add( elem.offsetLeft, elem.offsetTop );

                while ( offsetParent ) {
                    add( offsetParent.offsetLeft, offsetParent.offsetTop );

                    if ( Browser.Mozilla && !/^t(able|d|h)$/i.test(offsetParent.tagName) || Browser.Safari && !safari2 )
                        border( offsetParent );

                    if ( !fixed && HTMLElement.getStyle(offsetParent, 'position') == "fixed" )
                        fixed = true;

                    offsetChild  = /^body$/i.test(offsetParent.tagName) ? offsetChild : offsetParent;
                    offsetParent = offsetParent.offsetParent;
                }

                while ( parent && parent.tagName && !/^body|html$/i.test(parent.tagName) ) {
           
                    if ( !/^inline|table.*$/i.test(HTMLElement.getStyle(parent, 'display')) )

                        add( -parent.scrollLeft, -parent.scrollTop );


                    if ( Browser.Mozilla && HTMLElement.getStyle(parent, 'overflow') != "visible" )
                        border( parent );


                    parent = parent.parentNode;
                }

                if ( (safari2 && (fixed || HTMLElement.getStyle(offsetChild, 'position') == "absolute")) ||
                    (Browser.Mozilla && HTMLElement.getStyle(offsetChild, 'position') != "absolute") )
                        add( -doc.body.offsetLeft, -doc.body.offsetTop );


                if ( fixed )
                    add(Math.max(doc.documentElement.scrollLeft, doc.body.scrollLeft),
                        Math.max(doc.documentElement.scrollTop,  doc.body.scrollTop));
            }


            results = { y: top, x: left };
        }
        function border(elem) {
            add(Number(HTMLElement.getStyle(elem, 'borderLeftWidth')), Number(HTMLElement.getStyle(elem, 'borderTopWidth')));
        }

        function add(l, t) {
            left += parseInt(l, 10) || 0;
            top += parseInt(t, 10) || 0;
        }

        return results;
    }
}


var Event = {
    fix: function(e){
        try{
            if(!e){
                throw "Evento recebido não suportado pelo Browser";
            }
        } catch(exc){
            e = null;
            try{
                e = window.event;
            } catch(exc2){
                e = null;
            }
        } finally {
            return e;
        }
    },


    getMouseButton: function(e){
        e = Event.fix(e);
        var num = 0;
        if(!e.which && e.button){
            num = (e.button & 1 ? 1 : ( e.button & 2 ? 3 : ( e.button & 4 ? 2 : 0 ) ));
        } else {
            num = e.which;
        }

        return num;
    },
	
    getScroll: function(){
		var doc = document.documentElement,
			body = document.body,
        	sLeft = (doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc.clientLeft || 0),
       		sTop = (doc && doc.scrollTop || body && body.scrollTop || 0) - (doc.clientTop || 0);

        return {x: sLeft, y: sTop};
    },

    getMousePosition: function(e){
        var evento = Event.fix(e),
			xPos = evento.clientX,
        	yPos = evento.clientY;

        return {x: xPos, y: yPos};
    },

    getMouseLocation: function(e){
        var Coor = Event.getMousePosition(e),
        	Scroll = Event.getScroll(),
        	xPos = Scroll.x + Coor.x,
        	yPos = Scroll.y + Coor.y;

        return {x: xPos, y: yPos};
    },
	
	getModifiers: function(e){
		e = Event.fix(e);
		var s = e.shiftKey?"1":"0",
			a = e.altKey?"1":"0",
			c = e.ctrlKey?"1":"0";
		return(s+a+c);
	},
	
	register: function(elem, on, callback){
		var pre = elem['on'+on];
		if(pre != null && pre != undefined){
			elem['on'+on] = function(){
				pre.call();
				callback.call();
			}
		} else {
			elem['on'+on] = function(){
				callback.call();
			}
		}
	}
}

NodeList.prototype.getChecked = function() {
    for (var i = 0, l = this.length; i < l; i++) {
        if (this[i].checked) {
            return this[i];
        }
    }
    return undefined;
}

if (
        Object.defineProperty && Object.getOwnPropertyDescriptor &&
        Object.getOwnPropertyDescriptor(Element.prototype, "textContent") &&
        !Object.getOwnPropertyDescriptor(Element.prototype, "textContent").get
)
(function() {
    var innerText = Object.getOwnPropertyDescriptor(Element.prototype, "innerText");
    Object.defineProperty(
            Element.prototype, "textContent",
            {

                get : function() {
                    return innerText.get.call(this)
                },
                set : function(x) {
                    return innerText.set.call(this, x)
                }
           }
    );
})();

if (!Function.prototype.bind) {
    Function.prototype.bind = function (oThis) {
        if (typeof this !== "function") {

            throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
        }

        var aArgs = Array.prototype.slice.call(arguments, 1), 
            fToBind = this, 
            fNOP = function () {},
            fBound = function () {
            return fToBind.apply(this instanceof fNOP && oThis
                   ? this
                   : oThis,
                   aArgs.concat(Array.prototype.slice.call(arguments)));
            };

            fNOP.prototype = this.prototype;
            fBound.prototype = new fNOP();

            return fBound;
    };
}

String.prototype.lPad = function(length, padString) {
    if (padString === undefined || padString === null) {
        padString = ' ';
    }
    var str = this;
    while (str.length < length) {
        str = padString + str;
    }
    return str;
}

String.prototype.rPad = function(length, padString) {
    if (padString === undefined || padString === null) {
        padString = ' ';
    }
    var str = this;
    while (str.length < length) {
        str = str + padString;
    }
    return str;
}

Number.prototype.zeroFill = function(numZeros) {
    var n = Math.abs(this);
    var zeros = Math.max(0, numZeros - Math.floor(n).toString().length);
    var zeroString = Math.pow(10, zeros).toString().substr(1);
    if (this < 0) {
        zeroString = '-' + zeroString;
    }
    return zeroString+n;
}

Date.prototype.toBR = function() {
    return ("0" + this.getDate()).slice(-2) + '/' + ("0" + (this.getMonth() + 1)).slice(-2) + '/' + this.getFullYear();
}

Date.prototype.toUS = function() {
    return this.getFullYear() + '-' + ("0" + (this.getMonth() + 1)).slice(-2) + '-' + ("0" + this.getDate()).slice(-2);
}

function dt2br(dateUS) {
    return dateUS.split('-').reverse().join('/');
}

function dt2us(dateBR) {
    return dateBR.split('/').reverse().join('-');
}

function getChecked(group) {
    for (var i = 0, l = group.length; i < l; i++) {
        if (group[i].checked) {
            return group[i];
        }
    }
    return undefined;
}

function isNumeric(e) {
    var k = e.keyCode ? e.keyCode : e.which;
    return [8, 46, 108, 110, 188, 190].indexOf(k) > -1 || (k >= 48 && k <= 57) || (k >= 96 && k <= 105);
}


function number_format (number, decimals, dec_point, thousands_sep) {
    var n = number, prec = decimals;
 
    var toFixedFix = function (n,prec) {
        var k = Math.pow(10,prec);        return (Math.round(n*k)/k).toString();
    };
 
    n = !isFinite(+n) ? 0 : +n;
    prec = !isFinite(+prec) ? 0 : Math.abs(prec);    var sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep;
    var dec = (typeof dec_point === 'undefined') ? '.' : dec_point;
 
    var s = (prec > 0) ? toFixedFix(n, prec) : toFixedFix(Math.round(n), prec); //fix for IE parseFloat(0.55).toFixed(0) = 0;
     var abs = toFixedFix(Math.abs(n), prec);
    var _, i;
 
    if (abs >= 1000) {
        _ = abs.split(/\D/);        i = _[0].length % 3 || 3;
 
        _[0] = s.slice(0,i + (n < 0)) +
              _[0].slice(i).replace(/(\d{3})/g, sep+'$1');
        s = _.join(dec);    } else {
        s = s.replace('.', dec);
    }
 
    var decPos = s.indexOf(dec);    if (prec >= 1 && decPos !== -1 && (s.length-decPos-1) < prec) {
        s += new Array(prec-(s.length-decPos-1)).join(0)+'0';
    }
    else if (prec >= 1 && decPos === -1) {
        s += dec+new Array(prec).join(0)+'0';    }
    return s;
}

var Grid = {
    msgDelete: 'Deseja realmente deletar este registro?',
    
    editar: function(id){
        location.href = 'edit.php?id='+id;
    },
    
    inserir: function(){
        location.href = 'edit.php';
    },
    
    deletar: function(id){
        var flag = true;
        if (Grid.msgDelete != '') {
            flag = confirm(Grid.msgDelete);
        }
        if (flag) {
            location.href = 'delete.php?id='+id;
        }
    }
};

function Dialog(msg, classe, tempo){
    var div = document.createElement('div');
    div.className = 'x-dialog '+classe;
    div.innerHTML = msg;
    
    document.body.appendChild(div);
    
    var remove = function(){
        div.className += ' x-dialog-hide';
    }
    
    if(!tempo){
        tempo = 7000;
    }
    
    setTimeout(remove, tempo);
}

var Decimal = {
	formatToDb: function(valor) {
	    if (valor === null || valor === undefined) {
	        valor = 0;
	    }
		valor = valor.toString();
		valor = valor.replace(".", ""); // RETIRA O PONTO
		valor = valor.replace(",", "."); // NO LUGAR DA VIRGULA INSERE O PONTO
		return valor;
	},

	formatToUse: function(valor, tipo) {
	    if (valor === null || valor === undefined) {
            valor = 0;
        }
		if (tipo) {
			if (tipo == 0) {
				casas = CASAS_DECIMAIS;
			} else if (tipo == 1) {
				casas = CASAS_DECIMAIS_PRECO;
			}  else if (tipo == 2) {
			    casas = CASAS_DECIMAIS_QUANTIDADE;
			}
		} else {
			casas = CASAS_DECIMAIS;
		}
		valor = number_format(valor, casas, SEPARADOR_DECIMAL, SEPARADOR_MILHAR);
		return valor;
	}	
};

var jsPadrao = {
	is_int: function(){
		$('.is_int').validation({ type: 'int' });
	},

	is_decimal: function(seletor){
		if (seletor == undefined || seletor == null) {
			seletor = '';
		}
		$(seletor+' .is_decimal').unmaskMoney();
		$(seletor+' .is_quantidade').unmaskMoney();
		$(seletor+' .is_preco').unmaskMoney();
		$(seletor+' .is_decimal').maskMoney({thousands:SEPARADOR_MILHAR, decimal:SEPARADOR_DECIMAL, precision:CASAS_DECIMAIS});
		$(seletor+' .is_quantidade').maskMoney({thousands:SEPARADOR_MILHAR, decimal:SEPARADOR_DECIMAL, precision:CASAS_DECIMAIS_QUANTIDADE, allowNegative:true});
		$(seletor+' .is_preco').maskMoney({thousands:SEPARADOR_MILHAR, decimal:SEPARADOR_DECIMAL, precision:CASAS_DECIMAIS_PRECO});
		$(seletor+' .is_decimal, '+seletor+' .is_quantidade, '+seletor+' .is_preco').mask();
	},

	is_date: function(){
		$('.is_date')
		    .unmasked()
		    .datepicker({
    			showOn: 'button',
    			buttonImage: '../img/icons/calendar.gif',
    			buttonImageOnly: true,
    			buttonText: 'Calend�rio'
		    })
		    .masked("99/99/9999");
	},
	
	is_date_min: function(){
	    $('.is_date_min')
	        .unmasked()
	        .datepicker({
	            dateFormat: 'dd/mm',
    	        showOn: 'button',
    	        buttonImage: '../img/icons/calendar.gif',
    	        buttonImageOnly: true,
    	        buttonText: 'Calend�rio'
    	    })
    	    .masked("99/99");
	},

	is_hora: function(){
		$('.is_hora').masked('99:99');
	},

	is_hora_completa: function(){
		$('.is_hora_completa').masked('99:99:99');
	},

	is_fone: function(){
		$('.is_fone').masked('(99)99999999');
	},

	is_cep: function(){
		$('.is_cep').masked('99999-999');
	},

	goFirst: function(){
		setTimeout(function(){
			try{
				$('input:not(:submit, :button, :hidden), textarea, select').get(0).focus();
			}catch(exc){}
		}, 100);
	}
};

$(document).ready(function(){
	$.datepicker.regional['pt-BR'] = {
		closeText: 'Fechar',
		prevText: '&#x3c;Anterior',
		nextText: 'Pr&oacute;ximo&#x3e;',
		currentText: 'Hoje',
		monthNames: ['Janeiro','Fevereiro','Mar&ccedil;o','Abril','Maio','Junho', 'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'],
		monthNamesShort: ['Jan','Fev','Mar','Abr','Mai','Jun', 'Jul','Ago','Set','Out','Nov','Dez'],
		dayNames: ['Domingo','Segunda-feira','Ter&ccedil;a-feira','Quarta-feira','Quinta-feira','Sexta-feira','S&aacute;bado'],
		dayNamesShort: ['Dom','Seg','Ter','Qua','Qui','Sex','S&aacute;b'],
		dayNamesMin: ['Dom','Seg','Ter','Qua','Qui','Sex','S&aacute;b'],
		dateFormat: 'dd/mm/yy',
		firstDay: 0,
		isRTL: false
	};
	$.datepicker.setDefaults($.datepicker.regional['pt-BR']);
	jsPadrao.is_int();
	jsPadrao.is_decimal();
	jsPadrao.is_date();
	jsPadrao.is_date_min();
	jsPadrao.is_hora();
	jsPadrao.is_hora_completa();
	jsPadrao.is_fone();
	jsPadrao.is_cep();
	jsPadrao.goFirst();
});
