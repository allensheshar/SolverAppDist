const { param } = require("jquery");

//Funcion Adicional para seleccionar el texto de un elemento DOM
$.extend({
    SelectText: function (node) {
        if (document.body.createTextRange) {
            const range = document.body.createTextRange();
            range.moveToElementText(node);
            range.select();
        } else if (window.getSelection) {
            const selection = window.getSelection();
            const range = document.createRange();
            range.selectNodeContents(node);
            selection.removeAllRanges();
            selection.addRange(range);
        } else {
            console.warn("Could not select text in node: Unsupported browser.");
        }
    },
    ReplaceString: function(str, find, replace) {
        return str.replace(new RegExp(find, 'g'), replace);
    },
    GetConfigAjaxPetition: function () {

        var _arguments = $.GetArgs({}, arguments);
        var _token = $.CreateToken();
        var _type = _arguments.type || 'POST';
        var _contentType = _arguments.contentType || 'text/plain';
        var _dataType = _arguments.dataType || 'json';
        var _uriData = _arguments.uriData || $.solver.services.api + '/Service/';
        var _config = {};
        var _connectTo = _arguments.connectTo || ''
        var _petition = {
            token: _token,
            browser: $.ConvertObjectToArr($.browser),
            session: $.ConvertObjectToArr($.solver.session),
            petitions: []
        };
        if (_connectTo != '') {
            _petition.connectTo = _connectTo;
        };
        var _options = null;
        var _start = function () {
            //Agregate petitions
            if (typeof _arguments.onStart === 'function') _arguments.onStart();
            //Agregamos Peticiones
            for (var item in $.solver.petitions) {
                var _object = $.solver.petitions[item];
                if (_object.state == 0) {
                    _object.state = 1;
                    _petition.petitions.push(_object);
                };
            };
            //
            _options = JSON.stringify(_petition);
        };
        var _ready = function (_result) {
            //Validate Web Page or Direct Attention
            if (typeof _arguments.onReady === 'function') _arguments.onReady(_result);
        };
        var _error = function (textStatus, error) {
            //Add Error
            var objErr = { textStatus: textStatus, error: error };
            //Si existe Evento OnError
            if (typeof _arguments.onError === 'function') _arguments.onError(objErr);
        };
        var _before = function () {
            //Si existe Evento onBefore
            if (typeof _arguments.onBefore === 'function') _arguments.onBefore();
        };

        if ($.browser.mobile) {
            _contentType = "application/json; charset=utf-8";
        };

        //Inicializar
        _start();

        //Configuracion Ajax
        _config = {
            type: _type,
            url: _uriData,
            data: _options,
            dataType: _dataType,
            contentType: _contentType,
            traditional: true,
            processData: false,
            global: true,
            async: false,
            cache: false,
            beforeSend: _before,
            success: _ready,
            error: _error,
            //dataFilter: _dataFilter,
            xhrFields: {
                withCredentials: false
            },
            crossDomain: true,
            headers: { 'Authorization': 'Berer dXN1YXJpbzpjbGF2ZQ==' },
        };

        return _config;

    }
});

//Funcion Adicionales Varias
$.fn.extend({
    LimitChar: function (NumLimit, Action, Negative) {
        if (typeof Action == 'undefined') {
            Action = function (control, value) { };
        };
        if (typeof Negative == 'undefined') {
            Negative = function (control, value) { };
        };
        return this.each(function () {
            var total_call = 0;
            $(this).unbind('keyup');
            $(this).bind('keyup', function (event) {
                var total_char = $(this).val().length;
                if (total_char == NumLimit) {
                    total_call++;
                    if (total_call == 1) {
                        Action($(this), $(this).val(), event);
                    };
                } else {
                    if (total_call > 0) {
                        total_call = 0;
                    };
                    Negative($(this), $(this).val());
                };
            });
        });
    },
    CreateFilter: function (name, nameControl, queryName) {

        let control = $(this);
        let countSelect = 0;
        let rowSelectComplete = [];
        let count = 0;

        control.append(`
            ${name}: <label id="lblSeleccionado${nameControl}" style="color:red; font-size:11px;font-weight:600;">0</label> <span style="color:red; font-size:11px;font-weight:600;">Seleccionado(s).</span>
            <div class="entorno-control">
                <div class="form-check-inline inline-block">
                    <label class="form-check-label">
                        <input name="check${nameControl}" id="check${nameControl}" type="checkbox" checked class="form-check-input position-relative top-2" />Todos
                    </label>
                </div>
                <button id="btn${nameControl}" type="button" class="btn btn-primary btn-sm">Selec. ${name}</button>                
                <input type="hidden" id="rowsSelect${nameControl}" />               
            </div>
        `);

        $("#lblSeleccionado" + nameControl).text() === "0" ? $("#lblSeleccionado" + nameControl).text("Todos") : parseInt($("#lblSeleccionado" + nameControl).text())

        control.find('#btn' + nameControl).click(function () {

            $('#check' + nameControl).prop('checked', false);

            require(['bootbox', 'alertify', 'helper', 'jqwidgets'], function (bootbox, alertify) {

                let templateForm = `
	                <form name=formFilter${nameControl} class="form-horizontal">
		                <div class="alert alert-info" style="padding:.75rem 0">
                            <div class="form-check" style="padding-left:0; display: none;">
                                <div class="row" style="margin-left:0; margin-right:0;">
                                    <label class="col-1 col-form-label">Estado: </label>
                                    <div class="col-11 col-form-label">
                                        <label class="custom-control custom-radio inline-block" style="padding-left:0;  margin-bottom:0;">
                                            <input name="radioEstado" id="radioTodos${nameControl}" checked style="position:relative; top:2px;" type="radio" value="Todos" />
                                            <span class="custom-control-indicator"></span>
                                            <span class="custom-control-description">Todos</span>
                                        </label>
                                        &nbsp;/&nbsp;
                                        <label class="custom-control custom-radio inline-block" style="padding-left:0;  margin-bottom:0;">
                                            <input name="radioEstado" id="radioActivo${nameControl}" style="position:relative; top:2px;" type="radio" value="*" />
                                            <span class="custom-control-indicator"></span>
                                            <span class="custom-control-description">Activo</span>
                                        </label>
                                        &nbsp;/&nbsp;
                                        <label class="custom-control custom-radio inline-block" style="padding-left:0; margin-bottom:0;">
                                            <input name="radioEstado" id="radioInactivo${nameControl}" style="position:relative; top:2px;" type="radio" value="&" />
                                            <span class="custom-control-indicator"></span>
                                            <span class="custom-control-description">Inactivo</span>
                                        </label>                                                                        
                                    </div>              
                                </div>                                
                            </div>
                            
			                <div class='col-sm-12'>
				                <div class=''>
					                <div class='input-group'>
                                        <div class='input-group-append' style='position:absolute; z-index:9999; left:0;'>
							                <span id='btn-filter' class='btn-sm btn-default btn-block btn-filter'>
								                <i class='fa fa-search' aria-hidden='true'></i>
							                </span>
						                </div>
						                <input type='text' style='padding-left:1.6rem; border-top-left-radius: .2rem; border-bottom-left-radius: .2rem;' class='form-control form-control-sm' id='_buscar' name='_buscar' placeholder='Buscar por nombre...' autocomplete='off' /> 						                
					                </div>
				                </div>
			                </div>
		                </div>
	                </form>
	                <div id=tName${nameControl}></div> 
	                <div id=table${nameControl}>Cargando información ...</div>
                    <span style="color:red; font-size:11px;font-weight:600;">Selección Múltiple: 'Ctrl + click'</span>
                `
                let inputRadioEstado = '';
                $('#radioTodos' + nameControl).attr('checked', 'checked');

                var dialog = bootbox.dialog({
                    title: name,
                    message: templateForm,
                    size: 'large',
                    animate: true,
                    buttons: {
                        ok: {
                            label: "Aceptar",
                            className: 'btn-info',
                            callback: function () {

                                let _total = $("#table" + nameControl).jqxDataTable('getSelection').length;

                                if (_total === 0) {
                                    alertify.error('Selecciona algún registro');
                                    return false;
                                } else {
                                    var selection = $("#table" + nameControl).jqxDataTable('getSelection');

                                    for (var i = 0; i < selection.length; i++) {
                                        var rowData = selection[i];
                                        rowSelectComplete.push({ id: rowData["Codigo"], name: rowData["Nombre"] });
                                        countSelect++;
                                    }
                                }

                                $("#lblSeleccionado" + nameControl).text(countSelect);
                                $('#check' + nameControl).prop('checked', false);

                                let rowId = "";
                                rowSelectComplete.forEach(function (item) {
                                    rowId += item.id + ",";
                                });

                                $('#rowsSelect' + nameControl).val(rowId.toString().substring(0, rowId.toString().length - 1));
                            }
                        },
                        cancel: {
                            label: "Cancelar",
                            className: 'btn-danger',
                            callback: function () {
                                if (countSelect === 0) {
                                    $('#check' + nameControl).prop('checked', true);
                                }
                            }
                        }
                    }
                });

                dialog.on('shown.bs.modal', function () {

                    if (nameControl === "Proveedor" || nameControl === "Articulo" || nameControl === "Local") {
                        $(".form-check").css("display", "block");
                    }

                    if (rowSelectComplete.length > 0) {
                        rowSelectComplete.forEach(function (item) {
                            $("div#tName" + nameControl).append("<span class='badge badge-pill badge-primary' style='margin-right:.2rem;'>" + item.name + "<span style='display:none;'>" + item.id + "</span> &nbsp;&nbsp; <a href='' style='cursor:pointer; text-decoration:none;' class='remove-item-select badge badge-light'> X </a> </span>");
                        })

                        $('#table' + nameControl).css('margin-top', '1rem');
                    } else {
                        $('#table' + nameControl).css('margin-top', '0');
                    }

                    function obtenerItemsData(nameControl) {
                        let itemsData = {};

                        switch (nameControl) {
                            case 'PersonaProveedor':
                                itemsData = {
                                    BUSCAR: function () {
                                        return $('input#_buscar').val() || '';
                                    },
                                    FILASELECCIONADA: function () {
                                        return $('#rowsSelect' + nameControl).val().split(',').toString() || '';
                                    }
                                }
                                break;
                            case 'Proveedor':
                            case 'Articulo':
                            case 'Local':
                                itemsData = {
                                    BUSCAR: function () {
                                        return $('input#_buscar').val() || '';
                                    },
                                    FILASELECCIONADA: function () {
                                        return $('#rowsSelect' + nameControl).val().split(',').toString() || '';
                                    },
                                    ESTADO: function () {
                                        return (inputRadioEstado === '' ? '%' : inputRadioEstado) || ('');
                                    }
                                }
                                break;
                            case 'LocalIngreso':
                            case 'ArticulosCategoria':
                            case 'Usuarios':
                            case 'Vendedores':
                                itemsData = {
                                    BUSCAR: function () {
                                        return $('input#_buscar').val() || '';
                                    },
                                    FILASELECCIONADA: function () {
                                        return $('#rowsSelect' + nameControl).val().split(',').toString() || '';
                                    }
                                }
                                break;
                            case 'Linea':
                            case 'Clase':
                            case 'SubLinea':
                                itemsData = {
                                    BUSCAR: function () {
                                        return $('input#_buscar').val() || '';
                                    },
                                    FILTROTIPOARTICULO: function () {
                                        return $('#_selectTipoArticulos').val() || '%';
                                    },
                                    FILASELECCIONADA: function () {
                                        return $('#rowsSelect' + nameControl).val().split(',').toString() || '';
                                    }
                                }
                                break;
                            default: `Lo sentimos hubo un error ${nameControl} items.`;
                        }

                        return itemsData;
                    }

                    function obtenerHiddensData(nameControl) {
                        let hiddensData = [];

                        switch (nameControl) {
                            case 'PersonaProveedor':
                                hiddensData = ['Codigo'];
                                break;
                            case 'Proveedor':
                            case 'Linea':
                            case 'SubLinea':
                            case 'Clase':
                            case 'Vendedores':
                                hiddensData = ['Codigo'];
                                break;
                            case 'Articulo':
                            case 'LocalIngreso':
                            case 'Usuarios':
                            case 'Local':
                                hiddensData = [];
                                break;
                            case 'ArticulosCategoria':
                                hiddensData = ['Orden'];
                                break;
                            default: `Lo sentimos hubo un error ${nameControl} hiddens.`;
                        }

                        return hiddensData;
                    }

                    function obtenerSortData(nameControl) {
                        let sortData = {};

                        switch (nameControl) {
                            case 'PersonaProveedor':
                                sortData = {
                                    Nombre: 'ASC'
                                }
                            case 'Proveedor':
                            case 'Articulo':
                                sortData = {
                                    Estado: 'ASC',
                                    Nombre: 'ASC'
                                }
                                break;
                            case 'LocalIngreso':
                            case 'Usuarios':
                            case 'Local':
                                sortData = {
                                    Codigo: 'ASC'
                                }
                                break;
                            case 'Linea':
                            case 'SubLinea':
                            case 'Clase':
                            case 'Vendedores':
                                sortData = {
                                    Nombre: 'ASC'
                                }
                                break;
                            case 'ArticulosCategoria':
                                sortData = {
                                    Orden: 'ASC'
                                }
                                break;
                            default: `Lo sentimos hubo un error ${nameControl} sorts.`;
                        }

                        return sortData;
                    }

                    function obtenerColumnsData(nameControl) {
                        let columsData = {};

                        switch (nameControl) {
                            case 'Proveedor':
                                columsData = {
                                    Nombre: {
                                        width: '45%',
                                        cellsAlign: 'center'
                                    },
                                    Nacionalidad: {
                                        width: '18%',
                                        cellsAlign: 'center',
                                        resizable: false
                                    },
                                    Procedencia: {
                                        width: '17%',
                                        cellsAlign: 'center',
                                        resizable: false
                                    },
                                    Estado: {
                                        width: '10%',
                                        cellsAlign: 'center',
                                        resizable: false
                                    },
                                    Tipo_Codigo: {
                                        text: 'Tipo Cod.',
                                        width: '10%',
                                        cellsAlign: 'center',
                                        resizable: false
                                    },
                                }
                                break;
                            case 'Articulo':
                                columsData = {
                                    Codigo: {
                                        text: 'Código',
                                        width: '12%',
                                        cellsAlign: 'center',
                                        resizable: false
                                    },
                                    Nombre: {
                                        width: '22%',
                                        cellsAlign: 'center'
                                    },
                                    Nacionalidad: {
                                        width: '13%',
                                        cellsAlign: 'center',
                                        resizable: false
                                    },
                                    Procedencia: {
                                        width: '13%',
                                        cellsAlign: 'center',
                                        resizable: false
                                    },
                                    Estado: {
                                        width: '10%',
                                        cellsAlign: 'center',
                                        resizable: false
                                    },
                                    Categoria: {
                                        text: 'Categoría',
                                        width: '10%',
                                        cellsAlign: 'center',
                                        resizable: false
                                    },
                                    Tipo_Unidad: {
                                        text: 'Tipo Unidad',
                                        width: '10%',
                                        cellsAlign: 'center',
                                        resizable: false
                                    },
                                    Tipo_Articulo: {
                                        text: 'Tipo Artículo',
                                        width: '10%',
                                        cellsAlign: 'center',
                                        resizable: false
                                    },
                                }
                                break;
                            case 'LocalIngreso':
                            case 'Local':
                                columsData = {
                                    Codigo: {
                                        text: 'Código',
                                        width: '8%',
                                        cellsAlign: 'center',
                                        resizable: false
                                    },
                                    Nombre: {
                                        width: '78%',
                                        cellsAlign: 'center'
                                    },
                                    Abreviatura: {
                                        width: '14%',
                                        cellsAlign: 'center',
                                        resizable: false
                                    },
                                }
                                break;
                            case 'Linea':
                            case 'SubLinea':
                            case 'Clase':
                            case 'Vendedores':
                            case 'PersonaProveedor':
                                columsData = {
                                    Nombre: {
                                        width: '100%',
                                        cellsAlign: 'center'
                                    }
                                }
                                break;
                            case 'ArticulosCategoria':
                                columsData = {
                                    Codigo: {
                                        text: 'Código',
                                        width: '8%',
                                        cellsAlign: 'center',
                                        resizable: false
                                    },
                                    Nombre: {
                                        width: '92%',
                                        cellsAlign: 'center'
                                    }
                                }
                                break;
                            case 'Usuarios':
                                columsData = {
                                    Codigo: {
                                        text: 'Código',
                                        width: '20%',
                                        cellsAlign: 'center',
                                        resizable: false
                                    },
                                    Nombre: {
                                        width: '80%',
                                        cellsAlign: 'center'
                                    }
                                }
                                break;
                            default: `Lo sentimos hubo un error ${nameControl} columns.`;
                        }

                        return columsData;
                    }

                    // crear tabla
                    $('#table' + nameControl).CreateTable({
                        query: queryName,
                        items: obtenerItemsData(nameControl),
                        hiddens: obtenerHiddensData(nameControl),
                        sortColumn: obtenerSortData(nameControl),
                        columns: obtenerColumnsData(nameControl),
                        config: {
                            pageSize: 50,
                            height: 350,
                            selectionMode: 'multipleRows'
                        }
                    });

                    // filtro de busqueda
                    $('#_buscar').on("keyup", function () {
                        if (count > 0)
                            clearTimeout(count);

                        var value = $(this).val().toLowerCase();
                        $('input#_buscar').val(value)
                        count = setTimeout(filtroTabla, 350);
                    });

                    function filtroTabla() {
                        $("#table" + nameControl).jqxDataTable('render');
                    }

                    // eliminar items seleccionados
                    $('.remove-item-select').click(function (e) {

                        alertify.confirm('Confirmar Acción', 'Seguro de eliminar este item seleccionado?', function () {
                            let id = e.target.parentElement.childNodes[1].textContent;

                            const flagElement = rowSelectComplete.find(function (element) {
                                return element.id === id;
                            })

                            if (flagElement !== "undefined") {
                                let index = rowSelectComplete.findIndex(function (element) {
                                    return flagElement === element;
                                })

                                rowSelectComplete.splice(index, 1);
                                countSelect--;
                                $("#lblSeleccionado" + nameControl).text(countSelect);

                                let rowId = "";
                                rowSelectComplete.forEach(function (item) {
                                    rowId += item.id + ",";
                                });
                                $('#rowsSelect' + nameControl).val(rowId.toString().substring(0, rowId.toString().length - 1));
                                e.target.parentElement.remove();
                                $("#table" + nameControl).jqxDataTable('render');
                                alertify.success('Eliminado correctamente');
                                $("#lblSeleccionado" + nameControl).text() === "0" ? $("#lblSeleccionado" + nameControl).text("Todos") : parseInt($("#lblSeleccionado" + nameControl).text())
                            }

                        }, function () {
                            console.log('Operacion cancelada...');
                        }).set('labels', { ok: 'Si', cancel: 'No' }).set('defaultFocus', 'cancel');

                        e.preventDefault();
                    })

                    $('form[name=formFilter' + nameControl).submit(function () {
                        $("#table" + nameControl).jqxDataTable('render');
                        return false;
                    });

                });

                dialog.on('hidden.bs.modal', function (e) {
                    if (countSelect === 0) {
                        $('#check' + nameControl).prop('checked', true);
                    }
                })

                // checkbox change
                $('#check' + nameControl).change(function () {
                    if ($('#check' + nameControl).is(':checked')) {
                        alertify.confirm('Confirmar Acción', 'Seguro de seleccionar a todos?', function () {
                            $("#rowsSelect" + nameControl).val("");
                            $("#lblSeleccionado" + nameControl).text(0);
                            $("#lblSeleccionado" + nameControl).text() === "0" ? $("#lblSeleccionado" + nameControl).text("Todos") : parseInt($("#lblSeleccionado" + nameControl).text())
                            countSelect = 0;
                            rowSelectComplete = [];
                        }, function () {
                            $('#check' + nameControl).prop('checked', false);
                            console.log('Operacion cancelada...');
                        }).set('labels', { ok: 'Si', cancel: 'No' }).set('defaultFocus', 'cancel');
                    }
                });

                // change radio Estado
                $('input[type=radio][name=radioEstado]').change(function () {

                    if (nameControl === 'Local') {
                        if (this.value === 'Todos') {
                            inputRadioEstado = '%';
                        }
                        else if (this.value === '*') {
                            inputRadioEstado = '&';
                        }
                        else if (this.value === '&') {
                            inputRadioEstado = '*';
                        }
                    } else {
                        if (this.value === 'Todos') {
                            inputRadioEstado = '%';
                        }
                        else {
                            inputRadioEstado = this.value;
                        }
                    }

                    $("#table" + nameControl).jqxDataTable('render');
                });

            });
        });

    },
    OnlyNumeric: function () {
        return this.each(function () {
            $(this).unbind('keydown');
            $(this).bind('keydown', function (event) {
                if (event.keyCode == 8 || event.keyCode == 46 || event.keyCode == 9 || event.keyCode == 37 || event.keyCode == 39) {
                } else {
                    if (!((event.keyCode >= 48 && event.keyCode <= 57) || (event.keyCode >= 96 && event.keyCode <= 105))) {
                        event.preventDefault();
                    };
                };
            });
        });
    },
    OnlyText: function () {
        return this.each(function () {
            $(this).unbind('keydown');
            $(this).bind('keydown', function (event) {
                if (event.keyCode == 8 || event.keyCode == 46 || event.keyCode == 9 || event.keyCode == 37 || event.keyCode == 39) {
                } else {
                    if (((event.keyCode >= 48 && event.keyCode <= 57) || (event.keyCode >= 96 && event.keyCode <= 105))) {
                        event.preventDefault();
                    };
                };
            });
        });
    },
    AutoHeight: function () {
        return this.each(function () {

            var _distanceObjectTop = $(this).offset().top;

            $(this).css({
                'min-height': `calc(100vh - (${_distanceObjectTop}px + 2.2rem))`
            });

        })
    }
});

//Funcion Adicional para la creacion/eliminar de modulos/menus y opciones, que se crean en un elemento DOM.
//Generar data de opciones desde query (modelo: GET_FULL_MODULES) / por defecto debe existe un div con clase: .zone-opciones
$.AddOption = function (_site, row, level, selected, editer, autochecked) {

    var _editer = editer || 'S';
    var _selected = selected || 'N';
    var _autocked = autochecked || 'N';
    var _level = level || 1;
    var _row = row || {};
    var parent = _site || '.zone-opciones';
    var ul;
    var uid = _row.UID || $.CreateToken();
    var token = _row.C_OPCION || $.CreateToken();
    var index = 0;
    var parentToken = $(parent).attr('id') || '';
    var parentIndex = $(parent).attr('data-index-show') || '';
    var parentUid = $(parent).attr('data-uid') || '';
    var parentFK = $(parent).attr('data-uid') || '';
    var parentFK_1 = $(parent).attr('data-uid') || '';
    var _text = '';
    var _accion = '';
    var _title = '';
    var _method = 1;
    var classIconNumber = '';
    var classItemLevel = '';
    var textActionLink = '';
    var textActionEditLink = '';
    var ULToken = '';
    var _flag_movil = '';
    var _iconImg = '';
    var _htmlIcon = '';
    var fnOrdenItem = function (_object, _refer) {

        var parentIndex = _refer || $(_object).attr('data-index');
        var childIndex = 0;

        if (parentIndex != '') parentIndex += '.';

        if ($(_object).children('li').length) {
            $(_object).children('li').each(function () {

                var _itemLi = $(this);

                childIndex++;
                _itemLi.attr('data-index-show', parentIndex + childIndex);
                _itemLi.attr('data-index', childIndex);
                _itemLi.find('span.bagdge-num').text(parentIndex + childIndex);

                if ($(this).children('ul').length) {
                    fnOrdenItem($(this).children('ul'), parentIndex + childIndex);
                };

            });
        };

    };

    //Determine is Checked
    if (_row._CHECKED == 'S') _autocked = _row._CHECKED;

    //Determine from Parent
    if ($(parent).find('ul').length) {
        ul = $(parent).find('ul').first();
    }
    else {

        ULToken = $.CreateToken();
        $(parent).append('<ul data-index="' + parentIndex + '" class="inner-items ' + ULToken + '"></ul>');
        ul = $(parent).find('ul');

        $('ul.' + ULToken).sortable({
            handle: '.bagdge-num',
            update: function (event, ui) {
                fnOrdenItem($(this));
            }
        });

    };
    if (parentIndex != '') parentIndex += '.';

    //Get Last Index Count li
    index = ul.children("li").length;
    index++;
    uid = uid.substring(0, 5);

    //for return index modulo
    if (typeof _row._INDEX_MODULO != 'undefined') index = _row._INDEX_MODULO;

    //Change Class Icon Number
    if (_level == -1) {
        classIconNumber = 'badge-danger'; classItemLevel = 'level-00'; textActionLink = ''; _text = 'Ingrese su texto aquí'; _accion = '';
    };
    if (_level == 1) {
        classIconNumber = 'badge-danger'; classItemLevel = 'level-01'; textActionLink = 'Agregar Menú'; _text = 'Nuevo Módulo'; _accion = '/Modulo';
    };
    if (_level == 2) {
        classIconNumber = 'badge-success'; classItemLevel = 'level-02'; textActionLink = 'Agregar Opción'; _text = 'Nuevo Menú'; _accion = '';
    };
    if (_level >= 3) {
        classIconNumber = 'badge-info'; classItemLevel = 'level-03'; textActionLink = 'Agregar Sub Opción'; _text = 'Nuevo Opción'; _accion = '/Controlador/Accion';
        parentFK_1 = $(parent).closest('li.level-01').attr('data-uid');
        if ($(parent).hasClass('level-02')) {
            parentUid = '';
        };
        if ($(parent).hasClass('level-03')) {
            parentFK = $(parent).closest('li.level-02').attr('data-uid');
        };
    };

    if (typeof _row.ETIQUETA != 'undefined') _text = _row.ETIQUETA;
    if (typeof _row.ACCION != 'undefined') _accion = _row.ACCION;
    if (typeof _row._METHOD != 'undefined') _method = _row._METHOD;
    if (typeof _row.TITULO_PAGINA != 'undefined') _title = _row.TITULO_PAGINA;
    if (typeof _row.FLAG_MOVIL != 'undefined') _flag_movil = _row.FLAG_MOVIL;
    if (typeof _row.ICON_LOGO != 'undefined') _iconImg = _row.ICON_LOGO;
    if (_row.ICON_LOGO === null) _iconImg = '';
    if (typeof _row.HTML_ICON != 'undefined') _htmlIcon = _row.HTML_ICON;

    //Remove Mensaje Previus
    if ($(parent).find('div.message').length) $(parent).find('div.message').remove();

    //Create Item in List
    ul.append(`<li class="option ${classItemLevel}" id="${token}" 
                    data-state="*"
                    data-uid="${uid}" 
                    data-fk-1="${parentFK_1}" 
                    data-fk="${parentFK}" 
                    data-parent-uid="${parentUid}" 
                    data-method="${_method}" 
                    data-index-show="${parentIndex}${index}" 
                    data-index="${index}" 
                    data-parent="${parentToken}"
                    data-logo="${_iconImg}">
                    <div class="text"><span class="badge bagdge-num ${classIconNumber}">${parentIndex}${index}</span></div>
                </li>`);

    //guardamos objeto en el dom del html;
    ul.find('li#' + token)[0].args = { row: _row };

    //Create text
    if (_level == -1) {
        ul.find('li#' + token).find('div.text').append(`<span class="editer text-name">${_text}</span>`);
    };
    if (_level == 1) {
        ul.find('li#' + token).find('div.text').append(`
            <span class="editer text-name">${_text}</span>
            <strong>PATH:</strong> <span class="editer text-accion">${_accion}</span>
            <strong>¿SOLO MOVIL?</strong> <span><input class="text-flagmovil" type="checkbox" ${(_flag_movil == '*' ? 'checked' : '')}/></span>
        `);
    };
    if (_level == 2) {
        ul.find('li#' + token).find('div.text').append(`<span class="editer text-name">${_text}</span>`);
    };
    if (_level >= 3) {
        ul.find('li#' + token).find('div.text').append(`
            <span class="editer text-name">${_text}</span>
            <strong>ACCIÓN</strong> <span class="editer text-accion">${_accion}</span>
            <strong>TITULO PÁGINA</strong> <span class="editer text-title">${_title}</span>
            <strong>ICONO HTML</strong> <span class="editer text-html-icon"></span> <span class="ml-2 text-html-icon-view"></span>
        `);
        ul.find('li#' + token).find('span.text-html-icon').text(_htmlIcon);
        ul.find('li#' + token).find('span.text-html-icon-view').html(_htmlIcon);
    };

    //Agregate Actions
    if (_selected == 'N') {

        ul.find('li#' + token).find('div.text').append('<a href="#" data-parent="#' + token + '" class="float-right add-element delete text-danger" style="margin-left:0.5rem;">Eliminar <i class="fa fa-trash" aria-hidden="true"></i></a>');
        ul.find('li#' + token).find('div.text').find('a.delete').click(function (e) {
            $.DeleteOption($(this).closest('li'));
            e.preventDefault();
        });

        if (textActionLink != '') {
            //accion para agregar items
            ul.find('li#' + token).find('div.text').append(`
                <a href="#" data-parent="#${token}" class="float-right add-element add">${textActionLink} <i class="fa fa-plus-circle" aria-hidden="true"></i></a>
            `);
            ul.find('li#' + token).find('div.text').find('a.add').click(function (e) {
                var _site = $(this).attr('data-parent') || '.zone-opciones';
                $.AddOption(_site, null, (_level + 1), _selected, _editer, _autocked);
                e.preventDefault();
            });
        };

        //accion para cargar logo
        ul.find('li#' + token).find('div.text').append(`
            <a href="#" data-parent="#${token}" class="float-right add-element image mr-1 text-success">Cargar Icono <i class="fa fa-picture-o" aria-hidden="true"></i></a>
        `);
        ul.find('li#' + token).find('div.text').find('a.image').click(function (e) {
            var _site = $(this).attr('data-parent') || '.zone-opciones';
            $.UploadFile({
                destino: 'App',
                extFiles: ['jpg', 'png'],
                onReady: function (token) {
                    $(_site).attr('data-logo', token);
                },
                onError: function (error) {

                    require(["sweetalert"], function (Swal) {
                        Swal.fire(
                            'Error de Carga',
                            error.msg,
                            'warning'
                        );
                    });

                }
            });
            e.preventDefault();
        });

    };

    if (_selected == 'S') {
        ul.find('li#' + token).attr('data-state', '&');
        ul.find('li#' + token).attr('data-checked', '&');
        ul.find('li#' + token).find('div.text').append('<span class="float-right"><input type="checkbox" name="' + token + '" value="" /></span>');
        ul.find('li#' + token).find('div.text').find('input[type=checkbox]').click(function (e) {

            var parent = $(this).closest('li.option');
            var child = $(parent).find('li.option');

            if ($(this).is(':checked')) {

                parent.attr('data-state', '*');
                parent.attr('data-checked', '*');

                child.attr('data-state', '*');
                child.attr('data-checked', '*');


                child.find('input[type=checkbox]').each(function () {
                    $(this)[0].checked = true;
                });

            } else {

                parent.attr('data-state', '&');
                parent.attr('data-checked', '&');

                child.attr('data-state', '&');
                child.attr('data-checked', '&');

                child.find('input[type=checkbox]').each(function () {
                    $(this)[0].checked = false;
                });

            }

        });
        if (_autocked == 'S') {
            ul.find('li#' + token).attr('data-state', '*');
            ul.find('li#' + token).attr('data-checked', '*');
            ul.find('li#' + token).find('div.text').find('input[name=' + token + ']')[0].checked = true;
            if (_flag_movil == '*') ul.find('li#' + token).find('div.text').find('.text-flagmovil')[0].checked = true;
        };
    };

    //Set Actions on Editer Content
    if (_editer == 'S') {
        ul.find('li#' + token).find('span.editer').attr('contenteditable', 'true').bind('focusin', function () {
            $.SelectText(this);
        });
        ul.find('li#' + token).find('span.editer').bind('keypress', function (e) {
            if (e.which == 13) {
                return false;
            };
        });
        ul.find('li#' + token).find('span.editer').first().focus();
    };

    if (_editer == 'N') {
        $(ul.find('li#' + token).find('div.text').find('.text-flagmovil')[0]).attr("disabled", true);
    }
};
$.DeleteOption = function (_object) {

    require(["alertify"], function (alertify) {

        var TotalSubOptions = $(_object).find('li.option').length;
        var ActionDelete = function () {
            var _method = $(_object).attr('data-method') || 1;
            if (_method == 2) {
                $(_object).attr('data-state', '&');
                $(_object).find('li.option').attr('data-state', '&');
                $(_object).addClass('d-none');
                alertify.success('Opcion programada para eliminar, debe guardar para aplicar los cambios.');
            };
            if (_method == 1) {
                $(_object).find('li.option').remove();
                $(_object).remove();
                alertify.success('Registro Eliminado.');
            };
        };
        var TextDelete = "";

        if (TotalSubOptions != 0) {
            TextDelete = "Esta opcion tiene elementos dependientes.<br /> ¿Seguro de eliminar esta Opción?";
        } else {
            TextDelete = "¿Seguro de eliminar esta Opción?";
        };

        alertify.confirm('Confirmar Acción', TextDelete, function () {
            ActionDelete();
        }, function () {
            console.log('Operacion guardar cancelada...');
        }).set('labels', { ok: 'Si', cancel: 'No' });

    });

};
$.GenerateOptions = function (result, initial, selected, editer, autochecked) {

    var _initial = initial || '.zone-opciones';
    var _cmodulo = '';
    var _cmenu = '';
    var _data = result.rows || result || [];

    $(_initial).html('');

    if (_data.length == 0) {
        $(_initial).html('<i class="fa fa-exclamation" aria-hidden="true"></i> No hay nada que mostrar.');
    };

    for (var item in _data) {

        var inRow = _data[item];
        var data_modulo = {};
        var data_menu = {};
        var data_opcion = {};
        if (typeof inRow._METHOD == 'undefined') inRow._METHOD = 2;
        if (typeof inRow._CHECKED == 'undefined') inRow._CHECKED = 'N';

        //Modulo
        if (_cmodulo != inRow.C_MODULO) {

            _cmodulo = inRow.C_MODULO;

            data_modulo.UID = _cmodulo;
            data_modulo.C_OPCION = 'MO' + _cmodulo;
            data_modulo.ETIQUETA = inRow.NOMBRE_MODULO;
            data_modulo.ACCION = inRow.PATH_MODULO;
            data_modulo._METHOD = inRow._METHOD;
            data_modulo.C_OPCION_PADRE = _initial;
            data_modulo._CHECKED = inRow._CHECKED;
            data_modulo.FLAG_MOVIL = inRow.FLAG_MOVIL;
            data_modulo.ICON_LOGO = inRow.ICON_MO;
            data_modulo._INDEX_MODULO = inRow.ORDEN_MODULO;

            $.AddOption(data_modulo.C_OPCION_PADRE, data_modulo, 1, selected, editer, autochecked);

        };

        //Menu
        if (_cmenu != inRow.C_MENU) {

            _cmenu = inRow.C_MENU;

            data_menu.UID = _cmenu;
            data_menu.C_OPCION = 'ME' + _cmenu;
            data_menu.ETIQUETA = inRow.NOMBRE_MENU;
            data_menu.ACCION = '';
            data_menu._METHOD = inRow._METHOD;
            data_menu.C_OPCION_PADRE = _initial + ' #MO' + inRow.C_MENU_PADRE;
            data_menu._CHECKED = inRow._CHECKED;
            data_menu.ICON_LOGO = inRow.ICON_ME;
            data_menu._INDEX_MENU = inRow.ORDEN_MENU;

            $.AddOption(data_menu.C_OPCION_PADRE, data_menu, 2, selected, editer, autochecked);

        };

        //Opcion
        data_opcion.UID = inRow.C_OPCION;
        data_opcion.C_OPCION = 'OP' + inRow.C_OPCION;
        data_opcion.ETIQUETA = inRow.ETIQUETA;
        data_opcion.ACCION = inRow.ACCION;
        data_opcion._METHOD = inRow._METHOD;
        data_opcion._CHECKED = inRow._CHECKED;
        data_opcion.TITULO_PAGINA = inRow.TITULO_PAGINA;
        data_opcion.ICON_LOGO = inRow.ICON_OM;
        data_opcion._INDEX_OPCION = inRow.ORDEN_OPCION;
        data_opcion.HTML_ICON = inRow.C_HTML_ICON;

        if (inRow.C_OPCION_PADRE == '') data_opcion.C_OPCION_PADRE = _initial + ' #ME' + inRow.C_MENU;
        if (inRow.C_OPCION_PADRE != '') data_opcion.C_OPCION_PADRE = _initial + ' #OP' + inRow.C_OPCION_PADRE;

        $.AddOption(data_opcion.C_OPCION_PADRE, data_opcion, 3, selected, editer, autochecked);

    }

};

require(['validate'], function () {

    //Nueva Validacion
    jQuery.validator.addMethod("validarRUC", function (value, element) {

        var esValido = false;
        var ruc = value.replace(/[-.,[\]()\s]+/g, "");
        var rucValido = function (ruc) {
            if (!(ruc >= 1e10 && ruc < 11e9
                || ruc >= 15e9 && ruc < 18e9
                || ruc >= 2e10 && ruc < 21e9))
                return false;
            for (var suma = -(ruc % 10 < 2), i = 0; i < 11; i++, ruc = ruc / 10 | 0)
                suma += (ruc % 10) * (i % 7 + (i / 7 | 0) + 1);
            return suma % 11 === 0;
        };

        if ((ruc = Number(ruc)) && ruc % 1 === 0 && rucValido(ruc)) {
            esValido = true;
        };

        return esValido;

    }, "El RUC ingresado no es válido.");

    // Validar que (start date) no sea mayor que (end date)
    jQuery.validator.addMethod("dateGreaterThan", function (value, _element, params) {

        let esValido = true;
        let moment = require("moment");

        let startDate = $(params).val();
        let endDate = value;

        if (startDate.length > 0) {
            let momentDesde = moment(startDate, "DD/MM/YYYY");
            let momentHasta = moment(endDate, "DD/MM/YYYY");
            if (momentDesde > momentHasta) {
                esValido = false;
            };
        };

        return esValido;

    }, "Este campo no puede ser menor que fecha desde");

    //Validar correo electronico
    jQuery.validator.addMethod('validarCorreo', function (value) {
        let esValido = true;
        const regex = /[\w-\.]{2,}@([\w-]{2,}\.)*([\w-]{2,}\.)[\w-]{2,4}/;
        if (value === '' || value === null) {
            esValido = true;
        } else {
            if (regex.test(value.trim())) {
                esValido = true;
            } else {
                esValido = false;
            }
        }
        return esValido;
    }, 'La dirección de correo no es válida');

    //Ejecutar un Query
    jQuery.validator.addMethod('runQuery', function (value, element, params) {
        /*console.log(value, element, params);*/
        var validacion = 0;
        var config = $.GetConfigAjaxPetition({
            onStart: function () {
                if (typeof params.onStart === 'function') params.onStart();
            },
            onReady: function (_result) {
                if (typeof params.onReady === 'function') {
                    validacion = params.onReady(_result);
                };
            },
            connectTo: params.connectTo
        });

        $.ajax(config);

        return validacion;

    },"Ha ocurrido un error al recuperar datos.");

});
