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
        $.fn[name] = function (options) {
            var isMethodCall = typeof options === 'string';
            var args = Array.prototype.slice.call(arguments, 1);
            this.each(function () {
                var ins = $.data(this, name);
                if (isMethodCall) {
                    if (!ins) $.error('not initialized yet');
                    if (!$.isFunction(ins[options]) || options.charAt(0) === '_')
                        $.error('no such method: ' + options);
                    ins[options].apply(ins, args);
                } else {
                    if (ins) {
                        if (ins._init) ins._init();
                    } else {
                        ins = new constructor(options, this);
                        $.data(this, name, ins);
                    }
                }
            });
        }
    }

    plugin('mipt', {
        _create: function () {
            var _this = this;
            this.element.addClass('mipt');
            this.input = $('<input>').appendTo(this.element);
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
                        var sel = this.dropdown.find('.sel');
                        if (sel.length == 0) {
                            var val = this.input.val();
                            if (!this.options.autocomplete)
                                this._addItem(val);
                        } else {
                            this.input.val(sel.html());
                            this._updateInputWidth();
                            if (this.options.autocomplete.onSelected) {
                                var v = sel.data('val');
                                this.options.autocomplete.onSelected
                                    .call(this, v);
                                this._addItem(v);
                            }
                        }
                        if (this.dropdown) this._closeDropdown();
                    } else if (e.keyCode == 38) {
                        if (!this.isDropdownShown) return;
                        var sel = this.dropdown.find('.sel').prev();
                        if (sel.length == 0)
                            sel = this.dropdown.children(':last');
                        this.dropdown.children().removeClass('sel');
                        sel.addClass('sel');
                        this.input.val(sel.html());
                        this._updateInputWidth();
                        e.preventDefault();
                    } else if (e.keyCode == 40) {
                        if (!this.isDropdownShown) return;
                        var sel = this.dropdown.find('.sel').next();
                        if (sel.length == 0)
                            sel = this.dropdown.children(':first');
                        this.dropdown.children().removeClass('sel');
                        sel.addClass('sel');
                        this.input.val(sel.html());
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
        _addItem: function (v) {
            var label = v;
            if (typeof v == 'object')
                label = v.label || 'label ' + i;
            var find = false;
            this.element.children('span.item').each(function (i, span) {
                if ($(span).text() == label) {
                    find = true;
                    return false;
                }
            });
            if (find) return;
            var item = $('<span class="item">').data(v).html(label)
                .insertBefore(this.input);
            $('<i class="del fa fa-times">').appendTo(item);
        }
    });
})(jQuery);
