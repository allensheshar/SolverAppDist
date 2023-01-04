require(["helper", "extras", "controls"], function () {
    require(["alertify", "moment", "bootbox"], function (alertify, moment, bootbox) {
        alertify.set('notifier', 'position', 'top-center');

        const empresa = $.solver.session.SESSION_EMPRESA;

        let tblTipoParametro = '#tblTipoParametro';
        let tblParametroGeneral = '#tblParametroGeneral';
        let operacion = '';

        const fnObtenerAlerta = function (message) {
            alertify.alert()
                .setting({
                    'title': 'Mensaje del sistema',
                    'message': message,
                }).show();
        };
        const fnGetFormEditer = function (url, tipo) {
            var _title = "Nuevo tipo de parametro general";
            if (tipo.length != 0) {
                _title = "Editar tipo de parametro general";
            };
            $.GetData({
                title: _title,
                uriData: url,
                location: 'float',
                type: 'GET',
                isPage: true,
                onReady: function (object, modal) {

                    $(modal).find('.modal-dialog').css({ 'max-width': '80%' });
                    $(object).find('.number-input').on('input', function () {
                        this.value = this.value.replace(/[^0-9]/g, '');
                    });

                    $('form[name=frmRegistroParametroGeneral]').ValidForm({
                        type: -1,
                        onError: function (error) {
                            $.CloseStatusBar();
                            $.ShowError({ error: error });
                        },
                        onDone: function (form, controls) {
                            _controls = controls;
                            if (tipo != '') {
                                $(_controls._tipo_parametro).val(tipo);
                                $(_controls._tipo_parametro).attr('readonly', 'readonly').css({ 'pointer-events': 'none' });
                            }
                            const fnClassEditer = function (row, datafield, value, rowdata) {
                                if (rowdata.MODO == 1 || rowdata.MODO == 2) return 'editedRow';
                            };
                            $(object).find(tblParametroGeneral).CreateGrid({
                                query: 'tbl_cuenta_mantenimiento_parametrogeneral_parametros',
                                items: {
                                    TIPO: function () {
                                        return tipo || '';
                                    }
                                },
                                hiddens: ['TIPO_PARAMETRO'],
                                columns: {
                                    '_rowNum': {
                                        text: '#',
                                        width: '30',
                                        cellsAlign: 'center',
                                        hidden: false,
                                        pinned: true,
                                        editable: false,
                                        sortable: false
                                    },
                                    'C_PARAMETRO_GENERAL': {
                                        text: 'Cod. general',
                                        cellsAlign: 'center',
                                        editable: false,
                                        width: 100,
                                    },
                                    'DESCRIPCION_PARAMETRO': {
                                        text: 'Descripción',
                                        width: 200,
                                    },
                                    'CODIGO_PARAMETRO': {
                                        text: 'Cod. parámetro',
                                        cellsAlign: 'center',
                                        width: 130,
                                    },
                                    'CODIGO_PARAMETRO_2': {
                                        text: 'Cod. parámetro 2',
                                        cellsAlign: 'center',
                                        width: 130,
                                    },
                                    'CODIGO_PARAMETRO_3': {
                                        text: 'Cod. parámetro 3',
                                        cellsAlign: 'center',
                                        width: 130,
                                    },
                                    'CODIGO_PARAMETRO_4': {
                                        text: 'Cod. parámetro 4',
                                        cellsAlign: 'center',
                                        width: 130
                                    },
                                    'CODIGO_PARAMETRO_5': {
                                        text: 'Cod. parámetro 5',
                                        cellsAlign: 'center',
                                        width: 130,
                                        format: 'n'
                                    },
                                    'CODIGO_PARAMETRO_6': {
                                        text: 'Cod. parámetro 6',
                                        cellsAlign: 'center',
                                        width: 130
                                    },
                                    'CODIGO_PARAMETRO_7': {
                                        text: 'Cod. parámetro 7',
                                        cellsAlign: 'center',
                                        width: 130
                                    },
                                    'FLAG_ESTADO': {
                                        text: 'Estado',
                                        columntype: 'dropdownlist',
                                        createeditor: function (row, value, editor) {
                                            const estados = [
                                                { value: "*", label: "Activo" },
                                                { value: "&", label: "Inactivo" }
                                            ];
                                            const estadoSource =
                                            {
                                                datatype: "array",
                                                datafields: [
                                                    { name: 'label', type: 'string' },
                                                    { name: 'value', type: 'string' }
                                                ],
                                                localdata: estados
                                            };
                                            const myadapter = new $.jqx.dataAdapter(estadoSource, { autoBind: true });
                                            editor.jqxDropDownList({ source: myadapter, displayMember: 'label', valueMember: 'value' });
                                        },
                                        cellclassname: fnClassEditer,
                                        width: 100,
                                        cellsAlign: 'center'
                                    }
                                },
                                config: {
                                    virtualmode: false,
                                    height: 600,
                                    pageSize: 999999,
                                    columnsresize: true,
                                    editable: true,
                                    sortable: false,
                                    pageable: false
                                }
                            });
                            $(object).find(tblParametroGeneral).on('bindingcomplete', function () {
                                $(object).find(tblParametroGeneral).jqxGrid('selectrow', 0);
                                $(object).find(tblParametroGeneral).on("cellvaluechanged", function (event) {
                                    if (event.args.newvalue != event.args.oldvalue) {
                                        var row = event.args.rowindex;
                                        if ($(tblParametroGeneral).jqxGrid('getrows')[row].MODO != 1) $(tblParametroGeneral).jqxGrid('getrows')[row].MODO = 2;
                                    }
                                });
                            });
                            $(object).find('#btnNuevoParametro').bind('click', function (e) {
                                if (operacion == 'Nuevo') {
                                    if ($('#_tipo_parametro').val() != '') {
                                        fnBuscarTipoParametro();
                                    }
                                    else {
                                        alertify.error('Ingrese un Tipo de Parámetro.');
                                    }
                                }
                                else {
                                    const fila = $(object).find(tblParametroGeneral).jqxGrid('getrows').length;
                                    var objParametro = {
                                        _rowNum: fila + 1,
                                        MODO: 1,
                                        C_PARAMETRO_GENERAL: '',
                                        TIPO_PARAMETRO: $('#_tipo_parametro').val(),
                                        DESCRIPCION_PARAMETRO: '',
                                        CODIGO_PARAMETRO: '',
                                        CODIGO_PARAMETRO_2: '',
                                        FLAG_ESTADO: 'Activo'
                                    };
                                    $(object).find(tblParametroGeneral).jqxGrid('addrow', null, objParametro);
                                    $(object).find(tblParametroGeneral).jqxGrid('selectrow', fila);
                                    $(object).find(tblParametroGeneral).jqxGrid('ensurerowvisible', fila);
                                }
                            });
                            $(object).find("#btnGuardar").bind('click', function (e) {

                                if ($(object).find(tblParametroGeneral).jqxGrid('getrows') == 0) fnObtenerAlerta('Por favor agregue items al detalle');
                                else if ($(object).find('#_tipo_parametro').val() == '') fnObtenerAlerta('Por favor ingrese el tipo de parametro');
                                else {
                                    var inserts = $(object).find(tblParametroGeneral).jqxGrid('getrows').filter(x => x['MODO'] == 1);
                                    var update = $(object).find(tblParametroGeneral).jqxGrid('getrows').filter(x => x['MODO'] == 2);
                                    $.each(inserts, function (i, parametro) {
                                        var type = 1;
                                        var objInsetParametro = {
                                            C_PARAMETRO_GENERAL: '',
                                            TIPO_PARAMETRO: $(object).find('#_tipo_parametro').val(),
                                            DESCRIPCION_PARAMETRO: parametro.DESCRIPCION_PARAMETRO,
                                            CODIGO_PARAMETRO: parametro.CODIGO_PARAMETRO,
                                            CODIGO_PARAMETRO_2: parametro.CODIGO_PARAMETRO_2,
                                            CODIGO_PARAMETRO_3: parametro.CODIGO_PARAMETRO_3,
                                            CODIGO_PARAMETRO_4: parametro.CODIGO_PARAMETRO_4,
                                            CODIGO_PARAMETRO_5: parametro.CODIGO_PARAMETRO_5,
                                            CODIGO_PARAMETRO_6: parametro.CODIGO_PARAMETRO_6,
                                            CODIGO_PARAMETRO_7: parametro.CODIGO_PARAMETRO_7,
                                            FLAG_ESTADO: parametro.FLAG_ESTADO == 'Activo' ? '*' : '&',
                                        };
                                        var extInsetParametro = {
                                            C_PARAMETRO_GENERAL: {
                                                action: {
                                                    name: 'GetNextId',
                                                    args: $.ConvertObjectToArr({
                                                        max_length: 5
                                                    })
                                                }
                                            }
                                        };
                                        $.AddPetition({
                                            table: 'PARAMETRO_GENERAL',
                                            type: type,
                                            items: $.ConvertObjectToArr(objInsetParametro, extInsetParametro)
                                        });
                                    });
                                    $.each(update, function (i, parametro) {
                                        var type = 2;
                                        var condition = `C_PARAMETRO_GENERAL = '${parametro['C_PARAMETRO_GENERAL']}'`;
                                        var objUpdateParametro = {
                                            C_PARAMETRO_GENERAL: parametro.C_PARAMETRO_GENERAL,
                                            TIPO_PARAMETRO: $(object).find('#_tipo_parametro').val(),
                                            DESCRIPCION_PARAMETRO: parametro.DESCRIPCION_PARAMETRO,
                                            CODIGO_PARAMETRO: parametro.CODIGO_PARAMETRO,
                                            CODIGO_PARAMETRO_2: parametro.CODIGO_PARAMETRO_2,
                                            CODIGO_PARAMETRO_3: parametro.CODIGO_PARAMETRO_3,
                                            CODIGO_PARAMETRO_4: parametro.CODIGO_PARAMETRO_4,
                                            CODIGO_PARAMETRO_5: parametro.CODIGO_PARAMETRO_5,
                                            CODIGO_PARAMETRO_6: parametro.CODIGO_PARAMETRO_6,
                                            CODIGO_PARAMETRO_7: parametro.CODIGO_PARAMETRO_7,
                                            FLAG_ESTADO: parametro.FLAG_ESTADO == 'Activo' ? '*' : '&',
                                        };
                                        $.AddPetition({
                                            table: 'PARAMETRO_GENERAL',
                                            type: type,
                                            condition: condition,
                                            items: $.ConvertObjectToArr(objUpdateParametro)
                                        });
                                    });
                                    $.SendPetition({
                                        connectToLogin: 'S',
                                        onReady: function (result) {
                                            $.CloseStatusBar();
                                            alertify.success('Se guardó correctamente.');
                                            $('form[name=filtrosRegParametroGeneral]').submit();
                                            bootbox.hideAll();
                                        },
                                        onBefore: function () {
                                            $.DisplayStatusBar({ message: 'Guardando cambios...' });
                                        },
                                        onError: function (_error) {
                                            $.CloseStatusBar();
                                            $.ShowError({ error: _error });
                                        }
                                    });
                                }
                                e.preventDefault();
                            });
                        },
                        onReady: function (result, controls, form) { }
                    });

                    $('.bootbox .modal-dialog').draggable({
                        handle: '.modal-header'
                    });
                    $('.bootbox .modal-header').css('cursor', 'move');
                }
            });
        };
        const fnBuscarTipoParametro = function () {
            $.GetQuery({
                query: ['q_cuenta_mantenimiento_parametrogeneral_duplicado'],
                items: [{ TIPO: function () { return $('#_tipo_parametro').val(); } }],
                onError: function (error) {
                    $.CloseStatusBar();
                    $.ShowError({ error: error });
                },
                onReady: function (result) {
                    if (result[0].Column1 == 0) {
                        const fila = $(tblParametroGeneral).jqxGrid('getrows').length;
                        var objParametro = {
                            _rowNum: fila + 1,
                            MODO: 1,
                            C_PARAMETRO_GENERAL: '',
                            TIPO_PARAMETRO: $('#_tipo_parametro').val(),
                            DESCRIPCION_PARAMETRO: '',
                            CODIGO_PARAMETRO: '',
                            CODIGO_PARAMETRO_2: '',
                            FLAG_ESTADO: 'Activo'
                        };
                        $(tblParametroGeneral).jqxGrid('addrow', null, objParametro);
                        $(tblParametroGeneral).jqxGrid('selectrow', fila);
                        $(tblParametroGeneral).jqxGrid('ensurerowvisible', fila);
                    }
                    else {
                        alertify.error('El Tipo Parámetro ingresado ya existe.');
                    }
                }
            });
        }
        const cargarTablas = function () {
            $(tblTipoParametro).CreateGrid({
                query: 'tbl_cuenta_mantenimiento_parametrogeneral_tipoparametro',
                items: {
                    BUSCAR: function () {
                        return $('#_buscar').val() || '';
                    },
                    MONEDA: function () {
                        return $('#_moneda').val() || '';
                    },
                    CUENTA: function () {
                        return $('#_cuenta').val() || '';
                    },
                    C_EMPRESA: function () {
                        return empresa;
                    }
                },
                sortcolumn: 'FECHA_MODIFICACION',
                sortdirection: 'DESC',
                columns: {
                    '_rowNum': {
                        text: '#',
                        width: '30',
                        cellsAlign: 'center',
                        hidden: false,
                        pinned: true,
                        editable: false,
                        sortable: false
                    },
                    'TIPO_PARAMETRO': {
                        text: 'Tipo de Parámetro',
                        width: 500,
                    },
                    'FECHA_MODIFICACION': {
                        text: 'Fecha Modificación',
                        width: 150
                    }
                },
                config: {
                    height: 600,
                    columnsresize: true
                }
            });
        };

        const actionNuevo = function () {
            operacion = 'Nuevo';
            fnGetFormEditer($.solver.baseUrl + "/Programador/ParametroGeneralRegistro/", '');
        }

        const actionEditar = function () {
            operacion = 'Editar';
            var index = $(tblTipoParametro).jqxGrid('getselectedrowindex');
            let tipo = $(tblTipoParametro).jqxGrid('getRows')[index].TIPO_PARAMETRO;
            fnGetFormEditer($.solver.baseUrl + "/Programador/ParametroGeneralRegistro/", tipo);
        }

        $('form[name=filtrosRegParametroGeneral]').ValidForm({
            type: -1,
            onReady: function (result, controls, form) {
                $(tblTipoParametro).jqxGrid('updatebounddata')
            },
            onDone: function () {
                cargarTablas();

                $('#btnAction').CreateActions({
                    text: 'Acciones',
                    class: 'btn btn-sm btn-orange',
                    actions: {
                        'Nuevo': {
                            callback: actionNuevo,
                            icon: 'fa fa-plus-circle'
                        },
                        'Editar': {
                            callback: actionEditar,
                            icon: 'fa fa-pencil'
                        }
                    }
                })
            }
        });

    });
});