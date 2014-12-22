/**
 *
 * Created by hch on 2014/11/15.
 */

(function ($) {
    function plugin(name, prototype) {
        var constructor = function (options, element) {
            this.options = options || {};
            this.element = $(element);
            if (this._create) this._create();
            if (this._init) this._init();
        };
        constructor.prototype = $.extend({
            _on: function (element, handlers) {
                var _this = this;
                $.each(handlers, function (event, handler) {
                    element.bind(event, function () {
                        handler.apply(_this, arguments);
                    });
                });
            }
        }, prototype);
        $.fn[name] = $.fn[name] || function (options) {
            var isMethodCall = typeof options === 'string';
            var args = Array.prototype.slice.call(arguments, 1);
            var ret = undefined;
            this.each(function (i) {
                var r = undefined;
                var ins = $.data(this, name);
                if (isMethodCall) {
                    if (!ins) $.error('not initialized yet');
                    if (!$.isFunction(ins[options]) || options.charAt(0) === '_')
                        $.error('no such method: ' + options);
                    r = ins[options].apply(ins, args);
                } else {
                    if (ins) {
                        if (ins._init) r = ins._init();
                    } else {
                        r = ins = new constructor(options, this);
                        $.data(this, name, ins);
                    }
                }
                if (i == 0) ret = r;
            });
            return ret;
        }
    }

    plugin('mipt', {
        _create: function () {
            var _this = this;
            this.element.addClass('mipt');
            this.input = $('<input type="text">').appendTo(this.element);
            this.element.click(function (e) {
                if (e.target == this) _this.input.focus();
                var el = $(e.target);
                if (el.hasClass('del')) {
                    el.parent().remove();
                }
            });
            this.ruler = $('<span class="W">').appendTo(this.element);
            if (this.options.autocomplete) {
                this.dropdown = $('<ul class="dropdown">')
                    .hide().appendTo(this.element);
                this._updateDropdown(null);
            }
            this._on(this.input, {
                keyup: function (e) {
                    if (e.keyCode == 13 || e.keyCode == 38 || e.keyCode == 40)
                        return;

                    this._updateInputWidth();
                    var val = this.input.val();
                    if (this.options.autocomplete) {
                        this._updateDropdown(val);
                        this._showDropdown();
                    }
                },
                keydown: function (e) {
                    if (e.keyCode == 13) {
                        if (this.options.autocomplete) {
                            var sel = this.dropdown.find('.sel');
                            if (sel.length != 0) {
                                this.input.val(sel.html());
                                this._updateInputWidth();
                                if (this.options.autocomplete.onSelected) {
                                    var v = sel.data('val');
                                    this.options.autocomplete.onSelected
                                        .call(this, v);
                                    this._addItem(v);
                                }
                                if (this.dropdown) this._closeDropdown();
                            }
                        } else {
                            var val = $.trim(this.input.val());
                            if (val != '') this._addItem(val);
                        }
                    } else if (e.keyCode == 38) {
                        this._highlightPrevMenu();
                        this._updateInputWidth();
                        e.preventDefault();
                    } else if (e.keyCode == 40) {
                        this._highlightNextMenu();
                        this._updateInputWidth();
                        e.preventDefault();
                    }
                }
            });
        },
        _updateInputWidth: function () {
            var val = this.input.val();
            this.ruler.html(val);
            this.input.width(this.ruler.width() + 16);
        },
        _updateDropdown: function (val) {
            var data = this.options.autocomplete.data;
            if (!data) return;

            if (val) {
                var regx = new RegExp(val);
                data = $.map(data, function (val, i) {
                    var l = val;
                    if (typeof l == 'object')
                        l = val.label || 'label' + i;
                    if (regx.test(l)) return val;
                });
            }

            this.dropdown.html('');
            var _this = this;
            $.each(data, function (i, v) {
                var label = v;
                if (typeof v == 'object')
                    label = v.label || 'label ' + i;
                var li = $('<li>').html(label).data('val', v)
                    .appendTo(_this.dropdown);
            });
        },
        _showDropdown: function () {
            if (this.isDropdownShown) return;
            this.dropdown.show();
            var off = this.input.offset();
            var h = this.input.outerHeight();
            this.dropdown.css('left', off.left + 'px');
            this.dropdown.css('top', (off.top + h) + 'px');
            this.isDropdownShown = true;
        },
        _closeDropdown: function () {
            this.dropdown.find('li').removeClass('sel');
            this.dropdown.hide();
            this.isDropdownShown = false;
        },
        _highlightPrevMenu: function () {
            if (!this.isDropdownShown)
                this._showDropdown();
            var sel = this.dropdown.find('.sel').prev();
            if (sel.length == 0)
                sel = this.dropdown.children(':last');
            this.dropdown.children().removeClass('sel');
            sel.addClass('sel');
            this.input.val(sel.html());
        },
        _highlightNextMenu: function () {
            if (!this.isDropdownShown)
                this._showDropdown();
            var sel = this.dropdown.find('.sel').next();
            if (sel.length == 0)
                sel = this.dropdown.children(':first');
            this.dropdown.children().removeClass('sel');
            sel.addClass('sel');
            this.input.val(sel.html());
        },
        addItem: function (v) {
            this._addItem(v);
        },
        _addItem: function (v) {
            var label = v;
            if (typeof v == 'object')
                label = v.label || 'label ';
            var find = false;
            this.element.children('span.item').each(function (i, span) {
                if ($(span).text() == label) {
                    find = span;
                    return false;
                }
            });
            if (find) {
                this._blink(label);
                return;
            }
            var item = $('<span class="item">').data('val', v).html(label)
                .insertBefore(this.input);
            $('<i class="del fa fa-times">').appendTo(item);
            this.input.val('');
        },
        _blink: function (v) {
            this.element.children('span.item').each(function (i, span) {
                if ($(span).text() == v) {
                    $(span).blink();
                }
            });
        },
        data: function () {
            var a = $.map(this.element.children('span.item'),
                function (span) {
                    return $(span).data('val');
                });
            return a;
        }
    });


    plugin('dialog', {
        _create: function () {
            this._create_overlay();
            this._create_wrapper();
            this._createButtons();
            this._initEventHandler();
            this.show();
        },
        _createButtons: function () {
            if (!this.options.buttons) return;

            var buttonSet = $('<div>')
                .addClass('dlg_btn_set')
                .appendTo(this.wrapper);

            var that = this;

            $.each(this.options.buttons, function(name, fn) {
                var button = $('<button>')
                    .html(name)
                    .appendTo(buttonSet);

                that._on(button, {
                    click: function (e) {
                        fn(e, this);
                        this._close();
                    }
                });
            });
        },
        _create_wrapper: function () {
            this.wrapper = $('<div class="dlg">').hide()
                .appendTo(document.body);

            var title = $('<div class="dlg_title">')
                .appendTo(this.wrapper)
                .html(this.options.title || '');


            var close_btn = $('<a>')
                .addClass('dlg_close_btn')
                .attr('href', 'javascript:;')
                .appendTo(title);


            $('<i>')
                .addClass('fa')
                .addClass('fa-times')
                .appendTo(close_btn);


            var content = $('<div>')
                .addClass('dlg_content')
                .appendTo(this.wrapper);

            this.element.appendTo(content);
        },
        _create_overlay: function () {
            var overlay = $('.global_overlay');
            if (overlay.length == 0) {
                overlay = $('<div>')
                    .addClass('global_overlay')
                    .appendTo(document.body);
            }
            this.overlay = overlay.hide();
        },
        _initEventHandler: function () {
            var btn = this.wrapper.find('.dlg_close_btn');

            this._on(btn, {
                click: function () {
                    this._close();
                }
            });
        },
        show: function () {
            this.overlay.show();
            this.wrapper.show();
            var w = this.wrapper.width();
            var h = this.wrapper.height();
            this.wrapper.css('left', '50%');
            this.wrapper.css('top', '50%');
            this.wrapper.css('margin-left', (-w / 2) + 'px');
            this.wrapper.css('margin-top', (-h / 2) + 'px');
        },
        _close: function () {
            this.overlay.hide();
            this.wrapper.hide();
        }
    });


    $.fn.blink = function () {
        var _this = this;
        var bak = this.css('color');
        var i = 0;
        var colors = ['#ff0', '#f00'];
        var t = setInterval(function () {
            _this.css('color', colors[i % 2]);
            if (i++ > 5) {
                clearTimeout(t);
                _this.css('color', bak);
            }
        }, 100);

    }
})(jQuery);
