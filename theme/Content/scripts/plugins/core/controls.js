$.fn.extend({

    CreateListBox: function () {

        var _arguments = $.GetArgs({}, arguments);
        var _items = _arguments.items || {};
        var _connectTo = _arguments.connectTo || '';
        var _connectToLogin = _arguments.connectToLogin || 'S';
        var _getMethod = _arguments.GetMethod || 'refresh';
        var _dataMethod = _arguments.DataMethod || null;
        var _height = _arguments.height || 0;

        return this.each(function () {

            var _form = $(this).closest('form');
            var _controlParent = $(this);
            var _token = $.CreateToken();
            var _tokenSearch = $.CreateToken();
            var _data = $(_controlParent).GetDataAtrributte();
            var _query = $(_controlParent).attr('data-query') || '';
            var _value = $(_controlParent).attr('data-value') || '';
            var _field = $(_controlParent).attr('data-field') || '';
            var _actions = $(_controlParent).attr('data-actions') || '';
            var _text = $(this).attr('data-text') || '';
            var _multiselect = $(_controlParent).attr('data-multiSelect') || false;
            var _autoselect = $(_controlParent).attr('data-autoSelect') || false;
            var _dataFull = [];
            var _dataFilter = [];
            var _fnCreateItems = null;
            var _fnGetSelectedItems = null;
            var _fnSearchItems = null;

            if (typeof $(_controlParent)[0].args == 'undefined') {
                $(_controlParent)[0].args = { data: null, filter: null, selected: 0, _fnCreateItems: null, _fnGetSelectedItems: null, _fnSearchItems: null, _fnOnSelected: null, _fnOnSearch: null, _fnOnReady: null };
            };
            if ($(_controlParent)[0].args._fnCreateItems == null) {
                $(_controlParent)[0].args._fnCreateItems = function (disabledAutoSelect) {

                    var _tokenList = $.CreateToken();
                    var listBoxGroup = null;
                    var _countSelected = 0;
                    var _dataFilter = $(_controlParent)[0].args.filter;
                    var _autoAutoAjustList = function (_state) {

                        var _dataFull = JSON.parse(JSON.stringify($(_controlParent)[0].args.data));
                        var _dataOnSelect = null;

                        for (var item in _dataFull) {
                            var _inRow = _dataFull[item];
                            if (typeof _inRow._selected == 'undefined') _inRow._selected = false;
                            _inRow._selected = _state;
                        };

                        $(_controlParent)[0].args.data = _dataFull;
                        $(_controlParent)[0].args.filter = JSON.parse(JSON.stringify(_dataFull));

                        $(_controlParent).val('');
                        $('input#' + _tokenSearch).val('');

                        _dataFull = JSON.parse(JSON.stringify($(_controlParent)[0].args.data));
                        _dataFilter = JSON.parse(JSON.stringify($(_controlParent)[0].args.filter));

                        _fnCreateItems(true);

                        _dataOnSelect = _fnGetSelectedItems();
                        if (typeof $(_controlParent)[0].args._fnOnSelected === 'function') $(_controlParent)[0].args._fnOnSelected(_controlParent, _dataOnSelect);

                    };

                    if (!$('#' + _token).find('ul.list-group').length) {
                        $('#' + _token).find('.body').append('<ul id="' + _tokenList + '" class="list-group rounded-0 border-bottom-0"></ul>');

                        if (_actions == 'S') {
                            $('#' + _token).append('<div style="background: #ebeff3;"><div class="row row-actions"></div></div>');
                            $('#' + _token).find('.row-actions').append('<div class="col-6"><a href="#" class="deselecc">Deselecc.</a></div>');
                            $('#' + _token).find('.row-actions').append('<div class="col-6 text-right"><a href="#" class="todos">Todos</a></div>');

                            $('#' + _token).find('.row-actions').find('a.deselecc').click(function () {
                                _autoAutoAjustList(false);
                                return false;
                            });
                            $('#' + _token).find('.row-actions').find('a.todos').click(function () {
                                _autoAutoAjustList(true);
                                return false;
                            });
                        };

                    };

                    listBoxGroup = $('#' + _token).find('ul.list-group');
                    listBoxGroup.html('');

                    for (var item in _dataFilter) {

                        var _inRow = _dataFilter[item];
                        var _itemToken = $.CreateToken();
                        var _isActive = '';

                        if (_autoselect && typeof (disabledAutoSelect) == 'undefined') {
                            _isActive = 'active';
                            _countSelected++;
                        };

                        if (typeof _inRow._selected != 'undefined') {
                            if (_inRow._selected == true) {
                                _isActive = 'active';
                                _countSelected++;
                            };
                        };

                        listBoxGroup.append('<li id="' + _itemToken + '" data-index="' + item + '" style="font-size:0.8rem;" class="list-group-item rounded-0 p-0 pl-1 pr-1 border-left-0 border-right-0 ' + _isActive + '">' + _inRow[_field] + '</li>');

                        //Evento Click Item
                        $('#' + _itemToken).click(function () {
                            var _dataOnSelect = null;
                            //Activamos Item
                            if (!_multiselect) {
                                $(listBoxGroup).find('li.list-group-item').removeClass('active');
                                $(this).addClass('active');
                            } else {
                                if ($(this).hasClass('active')) {
                                    $(this).removeClass('active');
                                } else {
                                    $(this).addClass('active');
                                };
                            };
                            //Obtenemos Elementos Seleccionados
                            _dataOnSelect = _fnGetSelectedItems();
                            //Llamamos a evento OnSelect
                            if (typeof $(_controlParent)[0].args._fnOnSelected === 'function') $(_controlParent)[0].args._fnOnSelected(_controlParent, _dataOnSelect);
                        });

                    };

                    $('#' + _token).find('.body').find('.sin-datos').remove();
                    if (_dataFilter.length == 0) {
                        $('#' + _token).find('.body').append('<div class="sin-datos" style="position: absolute;text-align: center;display:table;width:100%;height: 100%;"><div style="display: table-cell;vertical-align: middle;">No hay datos que mostrar</div></div>');
                    };

                    _fnGetSelectedItems();

                };
            };
            if ($(_controlParent)[0].args._fnGetSelectedItems == null) {
                $(_controlParent)[0].args._fnGetSelectedItems = function () {

                    var listBoxGroup = $('#' + _token).find('ul.list-group');
                    var _dataSelect = [];
                    var _dataSelectRow = {};
                    var _dataSelectOfSet = '';
                    var _dataFilter = $(_controlParent)[0].args.filter;

                    //Obtenemos Elementos Seleccionados
                    $(listBoxGroup).find('li.active').each(function () {
                        var _indexItem = $(this).attr('data-index');
                        _dataSelectRow = JSON.parse(JSON.stringify(_dataFilter[_indexItem]));
                        _dataSelect.push(_dataSelectRow);
                    });

                    //Asignamos Seleccion al Control Padre
                    for (var item in _dataSelect) {
                        var inRow = _dataSelect[item];
                        if (_dataSelectOfSet.length != 0) _dataSelectOfSet += ',';
                        _dataSelectOfSet += inRow[_value];
                    };

                    if (_value.length != 0) $(_controlParent).val(_dataSelectOfSet);

                    //Regresamos Dato
                    if (!_multiselect) {
                        $(_controlParent)[0].args['selected'] = 1;
                        $(_controlParent)[0].args['selectedData'] = _dataSelectOfSet;
                        return _dataSelectRow;
                    } else {
                        $(_controlParent)[0].args['selected'] = _dataSelect.length;
                        $(_controlParent)[0].args['selectedData'] = _dataSelect;
                        return _dataSelect;
                    };

                };
            };
            if ($(_controlParent)[0].args._fnSearchItems == null) {
                $(_controlParent)[0].args._fnSearchItems = function (valueSearch) {

                    var _filterDataFull = [];
                    var _valueSearch = valueSearch || '';
                    var _dataFull = $(_controlParent)[0].args.data;

                    //Convertir a Mayusculas
                    _valueSearch = _valueSearch.toUpperCase();

                    //Buscamos coincidencias
                    for (var item in _dataFull) {
                        var inRow = _dataFull[item];
                        var inCellValue = inRow[_field].toUpperCase();
                        if (inCellValue.indexOf(_valueSearch) > -1) {
                            _filterDataFull.push(JSON.parse(JSON.stringify(inRow)));
                        }
                    };

                    //Asignamos busqueda al filtro
                    $(_controlParent)[0].args.filter = JSON.parse(JSON.stringify(_filterDataFull));
                    if (valueSearch.length == 0) {
                        $(_controlParent)[0].args.filter = JSON.parse(JSON.stringify(_dataFull));
                    };

                    //Creamos items
                    _fnCreateItems();

                    //Llamamos a evento OnSelect
                    if (typeof $(_controlParent)[0].args.onSearch === 'function') $(_controlParent)[0].args.onSearch(_filterDataFull);

                    return _filterDataFull;

                };
            };

            _fnCreateItems = $(_controlParent)[0].args._fnCreateItems;
            _fnGetSelectedItems = $(_controlParent)[0].args._fnGetSelectedItems;
            _fnSearchItems = $(_controlParent)[0].args._fnSearchItems;

            if (typeof _arguments.onSelect === 'function') $(_controlParent)[0].args._fnOnSelected = _arguments.onSelect;
            if (typeof _arguments.onSearch === 'function') $(_controlParent)[0].args._fnOnSearch = _arguments.onSearch;
            if (typeof _arguments.onReady === 'function') $(_controlParent)[0].args._fnOnReady = _arguments.onReady;

            _items = $.extend(_items, _data);

            $(_controlParent).hide();

            if (typeof _items.tokenlistbox == 'undefined') {

                $(_controlParent).attr('data-tokenListBox', _token);
                $(_controlParent).attr('data-tokenListBoxSearch', _tokenSearch);
                $(_controlParent).wrap('<div id="' + _token + '" class="card rounded-0 listbox-solver mb-0"></div>');

                if (_height > 0) $('#' + _token).css({ height: _height });
                $('#' + _token).append(`
                    <div class="card-header header p-0 pt-1 pb-1 rounded-0">
                        <div class="input-group rounded-0 input-group-sm">
                            <div class="input-group-prepend rounded-0">
                                <span class="input-group-text rounded-0 border-0" id="span_${_tokenSearch}"><i class="fa fa-search" aria-hidden="true"></i></span>
                            </div>
                            <input data-nosend="1" id="${_tokenSearch}" name="${_tokenSearch}" type="text" class="form-control rounded-0 border-0" placeholder="Ingresa tu búsqueda" aria-describedby="span${_tokenSearch}">
                        </div>
                    </div>
                    <div class="body" style="position:relative;">
                    </div>
                `);
                $('input#' + _tokenSearch).keyup(function () {
                    _fnSearchItems($(this).val());
                });

            } else {

                _token = $(_controlParent).attr('data-tokenListBox');
                _tokenSearch = $(_controlParent).attr('data-tokenListBoxSearch');

            };

            //Metodo Refresh
            if (_getMethod == 'refresh') {
                $(_controlParent).val('');
                $('input#' + _tokenSearch).val('');
                $.GetQuery({
                    connectTo: _connectTo,
                    connectToLogin: _connectToLogin,
                    query: [_query],
                    items: [_items],
                    onBefore: function () {

                        var _data = _form.data("task") || {};
                        var _name = _form.attr('name') || $.CreateToken();

                        _data[_name] = 1;
                        _form.data("task", _data);

                    },
                    onReady: function (_result) {

                        var _name = _form.attr('name') || $.CreateToken();
                        var _dataFull = [];

                        _dataFull = JSON.parse(JSON.stringify(_result));

                        if (_text.length != 0) {
                            for (var item in _dataFull) {
                                var _inRow = _dataFull[item];
                                if (typeof _inRow._selected == 'undefined') _inRow._selected = false;
                                if (_inRow[_value] == _text) {
                                    _inRow._selected = true;
                                };
                            };
                        };

                        _dataFilter = JSON.parse(JSON.stringify(_dataFull));

                        $(_controlParent)[0].args.data = _dataFull;
                        $(_controlParent)[0].args.filter = _dataFilter;

                        _fnCreateItems();

                        if (_form.length) {
                            _form.data("task")[_name] = 0;
                        }

                        //if (typeof _arguments.onReady === 'function') _arguments.onReady(_controlParent);
                        if (typeof $(_controlParent)[0].args._fnOnReady === 'function') $(_controlParent)[0].args._fnOnReady(_controlParent);

                    },
                    onError: function () {

                    }
                });
            };

            //Metodo Agregar Datos
            if (_getMethod == 'addData') {
                if (_dataMethod != null) {

                    var _temporyArray = [];
                    var _dataFull = $(_controlParent)[0].args.data;
                    var _dataFilter = $(_controlParent)[0].args.filter;

                    $('input#' + _tokenSearch).val('');

                    if ($.isArray(_dataMethod)) {
                        _temporyArray = _dataMethod;
                    } else {
                        if (typeof _dataMethod == 'object') _temporyArray.push(_dataMethod);
                    };

                    _dataFull = $.merge(_dataFull, _temporyArray);
                    _dataFilter = $.merge(_dataFilter, _temporyArray);

                    $(_controlParent)[0].args.data = _dataFull;
                    $(_controlParent)[0].args.filter = _dataFilter;

                    _fnCreateItems();

                };
            };

            //Seleccionar elemntos
            if (_getMethod == 'selectData') {
                if (_dataMethod != null) {

                    var _dataFull = JSON.parse(JSON.stringify($(_controlParent)[0].args.data));

                    //debugger;

                    for (var item in _dataFull) {
                        var _inRow = _dataFull[item];
                        if (typeof _inRow._selected == 'undefined') _inRow._selected = false;
                        _inRow._selected = false;
                        if (_dataMethod.indexOf(_inRow[_value]) != -1) {
                            _inRow._selected = true;
                        };
                    };

                    _dataFilter = _dataFull;

                    $(_controlParent).val('');
                    $('input#' + _tokenSearch).val('');

                    $(_controlParent)[0].args.data = _dataFull;
                    $(_controlParent)[0].args.filter = JSON.parse(JSON.stringify(_dataFull));

                    _fnCreateItems();

                }
            };

            //Metodo Limpiar Data
            if (_getMethod == 'clearData') {
                $(_controlParent).val('');
                $('input#' + _tokenSearch).val('');
                $(_controlParent)[0].args.data = [];
                $(_controlParent)[0].args.filter = [];
                _dataFull = [];
                _dataFilter = [];
                _fnCreateItems();
            };

            //Redibujar con la data local
            if (_getMethod == 'repaint') {

                var _dataFull = JSON.parse(JSON.stringify($(_controlParent)[0].args.data));
                for (var item in _dataFull) {
                    var _inRow = _dataFull[item];
                    if (typeof _inRow._selected == 'undefined') _inRow._selected = false;
                    _inRow._selected = false;
                    if (_text.length != 0) {
                        if (_inRow[_value] == _text) {
                            _inRow._selected = true;
                        };
                    };
                };

                $(_controlParent)[0].args.data = _dataFull;
                $(_controlParent)[0].args.filter = JSON.parse(JSON.stringify(_dataFull));

                $(_controlParent).val('');
                $('input#' + _tokenSearch).val('');
                _dataFull = JSON.parse(JSON.stringify($(_controlParent)[0].args.data));
                _dataFilter = JSON.parse(JSON.stringify($(_controlParent)[0].args.filter));
                _fnCreateItems();
            };

            //Metodo Limpiar Data
            if (_getMethod == 'getTotal') {
                return $(_controlParent)[0].args['selected'];
            };

        });

    },

    CreateAutocomplete: function () {

        var _arguments = $.GetArgs({}, arguments);
        var _items = _arguments.items || {};
        var _connectTo = _arguments.connectTo || '';
        var _connectToLogin = _arguments.connectToLogin || 'S';

        return this.each(function () {

            var _form = $(this).closest('form');
            var _control = $(this);
            var _data = $(_control).GetDataAtrributte();
            var _query = $(_control).attr('data-query') || '';
            var _field = $(_control).attr('data-field') || '';

            var options = {
                url: function (phrase) {
                    return $.solver.api + "/DataGrid/" + _query + "/";
                },
                listLocation: 'data',
                getValue: function (element) {
                    return element[_field];
                },
                ajaxSettings: {
                    dataType: "json",
                    method: "POST",
                    data: {}
                },
                preparePostData: function (data) {

                    var tempData = $.extend(_data, {
                        pagenum: 0,
                        pagesize: 10,
                        TypeTo: 0
                    });

                    tempData['buscar'] = function () {
                        return _control.val();
                    };

                    data.filters = {};
                    data.items = $.ConvertObjectToArr(tempData);
                    data.sorters = {};

                    //data.items = $.extend(data.items, $.ConvertObjectToArr(_data));

                    return JSON.stringify(data);
                },
                requestDelay: 400,
                list: {
                    maxNumberOfElements: 5,
                    //sort: {
                    //    enabled: true
                    //},
                    onClickEvent: function () {
                        var selected = $(_control).getSelectedItemData();
                        $(_control)[0].args._fnOnSelected(selected);
                    },
                    onSelectItemEvent: function () {
                        var selected = $(_control).getSelectedItemData();
                        $(_control)[0].args._fnOnSelected(selected);
                    },
                    onKeyEnterEvent: function () {
                        var selected = $(_control).getSelectedItemData();
                        $(_control)[0].args._fnOnSelected(selected);
                    },
                    //onLoadEvent: function () {
                    //    if ($(destino).length) $(destino).val(0);
                    //}
                },
                //placeholder: placeholder,
                theme: 'bootstrap',
                highlightPhrase: true
            };

            if (typeof $(_control)[0].args == 'undefined') {
                $(_control)[0].args = { _fnOnSelected: null };
            };
            if (typeof _arguments.onSelect === 'function') $(_control)[0].args._fnOnSelected = _arguments.onSelect;

            _control.easyAutocomplete(options);

        });

    },

    CreateActions: function () {

        var _arguments = $.GetArgs({}, arguments);
        var _actions = _arguments.actions || {};
        var _text = _arguments.text || 'Acciones disponibles';
        var _class = _arguments.class || 'btn-sm btn-success';

        return this.each(function () {
            var _control = $(this);
            var _token = $.CreateToken();

            _control.addClass('dropdown');
            _control.addClass('d-inline-block');

            _control.append(`<button class="btn ${_class} dropdown-toggle mb-1 mr-2" type="button" id="${_token}" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">${_text} </button>`);
            _control.append('<div id="menu-' + _token + '" class="dropdown-menu" aria-labelledby="dropdownMenuButton"></div>');

            for (var item in _actions) {
                var _action = _actions[item];
                var _actionToken = _action.token || $.CreateToken();
                var _subclass = _action.subClass || ''
                var _element = _action.element || ''

                if (typeof _action.text == 'undefined') _action.text = item;
                if (typeof _action.icon == 'undefined') _action.icon = 'fa fa-plus-circle';

                if (_element == '') {
                    $('#menu-' + _token).append('<a id="' + _actionToken + '" class="dropdown-item small-dropdown-item ' + _subclass + '" href="#" data-ref="' + item + '"><i class="' + _action.icon + ' medium-icon"></i>&nbsp;&nbsp; ' + _action.text + '</a>');
                    $('a#' + _actionToken).click(function (e) {

                        var _ref = $(this).attr('data-ref');
                        var _action = _actions[_ref] || {};

                        if (typeof _action.callback == 'function') {
                            _action.callback();
                        };

                        e.preventDefault();

                    });
                }
                else {
                    $('#menu-' + _token).append(_element);
                }
            }

            if (typeof _arguments.onReady === 'function') _arguments.onReady();

        });

    }

});
