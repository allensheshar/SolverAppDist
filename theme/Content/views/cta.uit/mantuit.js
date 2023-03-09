require(["helper", "extras", 'bootstrap-select', 'fileinput.es'], function () {
    require(["alertify", "bootbox", "moment"], function (alertify, bootbox, moment) {
        alertify.set('notifier', 'position', 'top-center');

        var editable = true;
        if ($.solver.basePath == '/auditoriat') editable = false;

        // VARIABLES
        const tblMantUIT = $('#tblMantUIT');

        // TABLAS
        const fnObtenerAlerta = function (message) {
            alertify.alert()
                .setting({
                    'title': 'Mensaje del Sistema',
                    'message': message,
                }).show();
        }
        const validarFormatoFecha = function (fecha, index, column) {
            var RegExPattern = /^\d{1,2}\/\d{1,2}\/\d{2,4}$/;
            if ((fecha.match(RegExPattern)) && (fecha != '')) { }
            else {
                if (column == 'FEC_INICIO') {
                    fnObtenerAlerta("Por favor ingrese la fecha inicio correctamente");
                    $(tblMantUIT).jqxGrid('getrows')[index].FEC_INICIO = '';
                }
                if (column == 'FEC_FIN') {
                    fnObtenerAlerta("Por favor ingrese la fecha fin correctamente");
                    $(tblMantUIT).jqxGrid('getrows')[index].FEC_FIN = '';
                }
                $(tblMantUIT).jqxGrid('refresh');
            }
        }
        const fnCrearTabla = function () {
            const fnClassEditer = function (row, datafield, value, rowdata) {
                if (rowdata.MODO == 1 || rowdata.MODO == 2) return 'editedRow';
            };
            $(tblMantUIT).CreateGrid({
                query: 'tbl_cuenta_mantenimiento_uit',
                items: {
                    BUSCAR: function () {
                        return $('#_buscar').val() || '';
                    }
                },
                hiddens: ['TIPO_UIT'],
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
                    'C_UIT': {
                        text: 'Código',
                        cellclassname: fnClassEditer,
                        cellsAlign: 'center',
                        width: 80,
                        editable: false
                    },
                    'FEC_INICIO': {
                        text: 'Fec. inicio',
                        cellclassname: fnClassEditer,
                        cellsAlign: 'center',
                        editable: editable,
                        width: 100
                    },
                    'FEC_FIN': {
                        text: 'Fec. fin',
                        cellclassname: fnClassEditer,
                        cellsAlign: 'center',
                        editable: editable,
                        width: 100
                    },
                    'ANIO': {
                        text: 'Año',
                        cellclassname: fnClassEditer,
                        cellsAlign: 'center',
                        editable: editable,
                        width: 80
                    },
                    'MONTO_UIT': {
                        text: 'Importe',
                        cellclassname: fnClassEditer,
                        cellsAlign: 'right',
                        cellsFormat: 'd2',
                        editable: editable,
                        columnType: 'numberinput',
                        width: 80
                    },
                    'BASE_LEGAL': {
                        text: 'Base legal',
                        editable: editable,
                        cellclassname: fnClassEditer,
                        width: 200
                    },
                    'TIPO_UIT': {
                        text: 'Tipo',
                        cellclassname: fnClassEditer,
                        editable: editable,
                        cellsAlign: 'center',
                        width: 150
                    },
                    'IND_ESTADO': {
                        text: 'Estado',
                        editable: editable,
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
                        width: 80,
                        cellsAlign: 'center'
                    }
                },
                config: {
                    height: 650,
                    pageSize: 100,
                    virtualmode: false,
                    columnsresize: true,
                    pageable: false,
                    sortable: true,
                    editable: true,
                    rendered: function () { }
                }
            });
            $(tblMantUIT).on('bindingcomplete', function () {
                $(tblMantUIT).jqxGrid('selectrow', 0);
                $(tblMantUIT).unbind("cellvaluechanged");
                $(tblMantUIT).on("cellvaluechanged", function (event) {

                    var args = event.args;
                    var datafield = event.args.datafield;
                    var rowBoundIndex = args.rowindex;
                    var value = args.newvalue;
                    var oldvalue = args.oldvalue;

                    if (event.args.newvalue != event.args.oldvalue) {
                        var row = event.args.rowindex;
                        if ($(tblMantUIT).jqxGrid('getrows')[row].MODO != 1) $(tblMantUIT).jqxGrid('getrows')[row].MODO = 2;
                    }

                    if (datafield == 'FEC_INICIO') {
                        if (value == '') { }
                        else {
                            validarFormatoFecha(value, rowBoundIndex, datafield);
                        }
                    }
                    if (datafield == 'FEC_FIN') {
                        if (value == '') { }
                        else {
                            validarFormatoFecha(value, rowBoundIndex, datafield);
                        }
                    }
                });
            });
        }

        // ACCIONES
        const actionNuevaUIT = function (e) {
            const fila = $(tblMantUIT).jqxGrid('getrows');
            if (fila.length > 0) {
                let ultimo = fila.length - 1;

                $.each(fila, function (i, v) {
                    if (v.IND_ESTADO == 'Activo') {
                        $(tblMantUIT).jqxGrid('getrows')[i].IND_ESTADO = 'Inactivo';
                        if ($(tblMantUIT).jqxGrid('getrows')[i].MODO == 1) { } else {
                            $(tblMantUIT).jqxGrid('getrows')[i].MODO = 2;
                        }
                    }
                });
                var uit = {
                    _rowNum: fila.length + 1,
                    MODO: 1,
                    C_UIT: '',
                    FEC_INICIO: '',
                    FEC_FIN: '',
                    ANIO: '',
                    MONTO_UIT: '',
                    BASE_LEGAL: '',
                    TIPO_UIT: '',
                    IND_ESTADO: 'Activo'
                };
                $(tblMantUIT).jqxGrid('addrow', null, uit);
                $(tblMantUIT).jqxGrid('selectrow', fila);
                $(tblMantUIT).jqxGrid('ensurerowvisible', fila);
            }
            else {
                var uit = {
                    _rowNum: fila.length + 1,
                    MODO: 1,
                    C_UIT: '',
                    FEC_INICIO: '',
                    FEC_FIN: '',
                    ANIO: '',
                    MONTO_UIT: '',
                    BASE_LEGAL: '',
                    TIPO_UIT: '',
                    IND_ESTADO: 'Activo'
                };
                $(tblMantUIT).jqxGrid('addrow', null, uit);
                $(tblMantUIT).jqxGrid('selectrow', fila);
                $(tblMantUIT).jqxGrid('ensurerowvisible', fila);
            }
        }
        const fnValidaciones = function () {
            alertify.confirm('Mensaje del sistema', '¿Desea Guardar la UIT?',
                function () {
                    fnGuardarCambios();
                },
                function () { }).set('labels', { ok: 'Si', cancel: 'No' }).set('defaultFocus', 'ok').set('closable', false);
        }
        const fnValidarCambios = function () {
            let indice = -1;
            let filas = $(tblMantUIT).jqxGrid('getrows');
            $.each(filas, function (i, v) {
                if (indice == -1) {
                    if (v.ANIO == '' || v.MONTO_UIT == '' || v.FEC_INICIO == '') {
                        indice = i;
                        return i;
                    }
                }
            });
            return indice;
        }
        const fnGuardarCambios = function () {
            const indice = fnValidarCambios();
            if (indice == -1) {
                const table = 'PLA.UIT';

                var insertUit = $(tblMantUIT).jqxGrid('getrows').filter(x => x['MODO'] == 1);
                var updateUit = $(tblMantUIT).jqxGrid('getrows').filter(x => x['MODO'] == 2);

                $.each(insertUit, function (i, uit) {
                    var type = 1;
                    const objUIT = {
                        C_UIT: uit['C_UIT'],
                        FEC_INICIO: uit['FEC_INICIO'],
                        FEC_FIN: uit['FEC_FIN'],
                        ANIO: uit['ANIO'],
                        MONTO_UIT: uit['MONTO_UIT'],
                        BASE_LEGAL: uit['BASE_LEGAL'],
                        TIPO_UIT: uit['TIPO_UIT'],
                        IND_ESTADO: (uit['IND_ESTADO'] == 'Activo' ? '*' : '&')
                    };
                    const extUIT = {
                        C_UIT: {
                            action: {
                                name: 'GetNextId',
                                args: $.ConvertObjectToArr({
                                    max_length: '6'
                                })
                            }
                        },
                    };
                    $.AddPetition({
                        type: type,
                        table: table,
                        items: $.ConvertObjectToArr(objUIT, extUIT)
                    });
                });
                $.each(updateUit, function (i, uit) {
                    var type = 2;
                    var condicionUIT = `C_UIT = '${uit['C_UIT']}'`
                    const objUIT = {
                        C_UIT: uit['C_UIT'],
                        FEC_INICIO: uit['FEC_INICIO'],
                        FEC_FIN: uit['FEC_FIN'],
                        ANIO: uit['ANIO'],
                        MONTO_UIT: uit['MONTO_UIT'],
                        BASE_LEGAL: uit['BASE_LEGAL'],
                        TIPO_UIT: uit['TIPO_UIT'],
                        IND_ESTADO: (uit['IND_ESTADO'] == 'Activo' ? '*' : '&')
                    };
                    $.AddPetition({
                        type: type,
                        table: table,
                        condition: condicionUIT,
                        items: $.ConvertObjectToArr(objUIT)
                    });
                });

                $.SendPetition({
                    connectToLogin: 'S',
                    onReady: function (result) {
                        $.CloseStatusBar();
                        $(tblMantUIT).jqxGrid('updatebounddata');
                        require(['bootbox', 'alertify'], function (bootbox, alertify) {
                            bootbox.hideAll();
                            alertify.success('Se registró la información.');
                        });
                    },
                    onBefore: function () {
                        $.DisplayStatusBar({ message: 'Realizando actualización' });
                    },
                    onError: function (_error) {
                        $.CloseStatusBar();
                        $.ShowError({ error: _error });
                    }
                });
            }
            else {
                alertify.alert('Mensaje del Sistema', 'Por favor rellena todos los campos de la fila ' + (indice + 1) + '.', function () { });
                $(tblMantUIT).jqxGrid('selectrow', indice);
                $(tblMantUIT).jqxGrid('ensurerowvisible', indice);
            }
        }

        // GENERALES
        $('a#btnAgregarMantUIT').bind('click', function (e) {
            actionNuevaUIT();
            e.preventDefault();
        });
        $('#btnGuardarMantUIT').bind('click', function (e) {
            fnValidaciones();
            e.preventDefault();
        });
        $('form[name=filtrosRegMantUIT]').ValidForm({
            type: -1,
            onReady: function (result, controls, form) {
                const rows = $(tblMantUIT).jqxGrid('getrows').filter(x => x['MODO'] != undefined);
                if (rows.length > 0) {
                    alertify.confirm('Mensaje del sistema', 'Existen filas sin guardar cambios, ¿Desea continuar?',
                        function () {
                            $(tblMantUIT).jqxGrid('updatebounddata');
                        },
                        function () {
                            alertify.error('Búsqueda cancelada');
                        })
                        .set('labels', { ok: 'Si', cancel: 'No' }).set('defaultFocus', 'ok').set('closable', false);
                }
                else {
                    $(tblMantUIT).jqxGrid('updatebounddata');
                }
            }
        });

        fnCrearTabla();

        if (!editable) {
            $('.borrar').remove();
            $('#btnGuardarMantUIT').remove();
        }

    });
});