require(["helper", "extras", 'bootstrap-select', 'fileinput.es'], function () {
    require(["alertify", "bootbox", "moment"], function (alertify, bootbox, moment) {
        alertify.set('notifier', 'position', 'top-center');

        // VARIABLES
        const tblSueldoMinimo = $('#tblSueldoMinimo');

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
                    $(tblSueldoMinimo).jqxGrid('getrows')[index].FEC_INICIO = '';
                }
                if (column == 'FEC_FIN') {
                    fnObtenerAlerta("Por favor ingrese la fecha fin correctamente");
                    $(tblSueldoMinimo).jqxGrid('getrows')[index].FEC_FIN = '';
                }
                $(tblSueldoMinimo).jqxGrid('refresh');
            }
        }
        const fnCrearTabla = function () {
            const fnClassEditer = function (row, datafield, value, rowdata) {
                if (rowdata.MODO == 1 || rowdata.MODO == 2) return 'editedRow';
            };
            $(tblSueldoMinimo).CreateGrid({
                query: 'tbl_cuenta_mantenimiento_sueldo_minimo',
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
                    'C_SUELDO_MINIMO': {
                        text: 'Cod. sueldo',
                        cellclassname: fnClassEditer,
                        cellsAlign: 'center',
                        width: 80,
                        editable: false
                    },
                    'MONTO_SUELDO_MINIMO': {
                        text: 'Sueldo mínimo',
                        cellclassname: fnClassEditer,
                        cellsAlign: 'right',
                        cellsFormat: 'd2',
                        columnType: 'numberinput',
                        width: 100
                    },
                    'RESOLUCION': {
                        text: 'Resolución',
                        cellclassname: fnClassEditer,
                        cellsAlign: 'left',
                        width: 300
                    },
                    'FEC_INICIO': {
                        text: 'Fec. inicio',
                        cellclassname: fnClassEditer,
                        cellsAlign: 'center',
                        width: 100
                    },
                    'FEC_FIN': {
                        text: 'Fec. fin',
                        cellclassname: fnClassEditer,
                        cellsAlign: 'center',
                        editable: true,
                        width: 100
                    },
                    'IND_ESTADO': {
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
                    height: 650,
                    pageSize: 999999,
                    virtualmode: false,
                    columnsresize: true,
                    pageable: false,
                    sortable: true,
                    editable: true,
                    rendered: function () { }
                }
            });
            $(tblSueldoMinimo).on('bindingcomplete', function () {
                $(tblSueldoMinimo).jqxGrid('selectrow', 0);
                $(tblSueldoMinimo).unbind("cellvaluechanged");
                $(tblSueldoMinimo).on("cellvaluechanged", function (event) {

                    var args = event.args;
                    var datafield = event.args.datafield;
                    var rowBoundIndex = args.rowindex;
                    var value = args.newvalue;
                    var oldvalue = args.oldvalue;

                    if (event.args.newvalue != event.args.oldvalue) {
                        var row = event.args.rowindex;
                        if ($(tblSueldoMinimo).jqxGrid('getrows')[row].MODO != 1) $(tblSueldoMinimo).jqxGrid('getrows')[row].MODO = 2;
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
        const actionNuevoSM = function (e) {

            let filas = $(tblSueldoMinimo).jqxGrid('getrows');
            let activos = 0;

            $.each(filas, function (i, v) {
                if (v.IND_ESTADO == 'Activo') {
                    activos++;
                }
            });

            if (activos > 0) {
                alertify.confirm('Mensaje del sistema', '¿Desea cambiar el sueldo mínimo?',
                    function () {
                        $.each(filas, function (i, v) {
                            if (v.IND_ESTADO == 'Activo') {
                                $(tblSueldoMinimo).jqxGrid('getrows')[i].FEC_FIN = moment(new Date(), 'DD/MM/YYYY').subtract(1, 'days').format("DD/MM/YYYY");
                                $(tblSueldoMinimo).jqxGrid('getrows')[i].IND_ESTADO = 'Inactivo';
                                if ($(tblSueldoMinimo).jqxGrid('getrows')[i].MODO == 1) { }
                                else { $(tblSueldoMinimo).jqxGrid('getrows')[i].MODO = 2; }
                            }
                        });

                        const tblsueldo = $(tblSueldoMinimo).jqxGrid('getrows').length;
                        var sueldo = {
                            _rowNum: tblsueldo + 1,
                            MODO: 1,
                            C_SUELDO_MINIMO: '',
                            MONTO_SUELDO_MINIMO: '',
                            RESOLUCION: '',
                            FEC_INICIO: moment().format("DD/MM/YYYY"),
                            FEC_FIN: '',
                            IND_ESTADO: 'Activo'
                        };
                        $(tblSueldoMinimo).jqxGrid('addrow', null, sueldo);
                        $(tblSueldoMinimo).jqxGrid('selectrow', tblsueldo);
                        $(tblSueldoMinimo).jqxGrid('ensurerowvisible', tblsueldo);

                    },
                    function () { }).set('labels', { ok: 'Si', cancel: 'No' }).set('defaultFocus', 'ok').set('closable', false);
            }
            else {
                const tblsueldo = $(tblSueldoMinimo).jqxGrid('getrows').length;
                var sueldo = {
                    _rowNum: tblsueldo + 1,
                    MODO: 1,
                    C_SUELDO_MINIMO: '',
                    MONTO_SUELDO_MINIMO: '',
                    RESOLUCION: '',
                    FEC_INICIO: moment().format("DD/MM/YYYY"),
                    FEC_FIN: '',
                    IND_ESTADO: 'Activo'
                };
                $(tblSueldoMinimo).jqxGrid('addrow', null, sueldo);
                $(tblSueldoMinimo).jqxGrid('selectrow', tblsueldo);
                $(tblSueldoMinimo).jqxGrid('ensurerowvisible', tblsueldo);
            }

        }
        const fnValidarCambios = function () {
            let indice = -1;
            let filas = $(tblSueldoMinimo).jqxGrid('getrows');
            $.each(filas, function (i, v) {
                if (indice == -1) {
                    if (v.MONTO_SUELDO_MINIMO == '' || v.RESOLUCION == '' || v.FEC_INICIO == '') {
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
                const table = 'PLA.SUELDO_MINIMO';

                var insertSueldoMinimo = $(tblSueldoMinimo).jqxGrid('getrows').filter(x => x['MODO'] == 1);
                var updateSueldoMinimo = $(tblSueldoMinimo).jqxGrid('getrows').filter(x => x['MODO'] == 2);

                $.each(insertSueldoMinimo, function (i, sueldo) {
                    var type = 1;
                    const objSueldoMinimo = {
                        C_SUELDO_MINIMO: sueldo['C_SUELDO_MINIMO'],
                        MONTO_SUELDO_MINIMO: sueldo['MONTO_SUELDO_MINIMO'],
                        RESOLUCION: sueldo['RESOLUCION'],
                        FEC_INICIO: sueldo['FEC_INICIO'],
                        FEC_FIN: sueldo['FEC_FIN'],
                        IND_ESTADO: (sueldo['IND_ESTADO'] == 'Activo' ? '*' : '&')
                    };
                    const extSueldoMinimo = {
                        C_SUELDO_MINIMO: {
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
                        items: $.ConvertObjectToArr(objSueldoMinimo, extSueldoMinimo)
                    });
                });
                $.each(updateSueldoMinimo, function (i, sueldo) {
                    var type = 2;
                    var condicionSueldoMinimo = `C_SUELDO_MINIMO = '${sueldo['C_SUELDO_MINIMO']}'`
                    const objSueldoMinimo = {
                        C_SUELDO_MINIMO: sueldo['C_SUELDO_MINIMO'],
                        MONTO_SUELDO_MINIMO: sueldo['MONTO_SUELDO_MINIMO'],
                        RESOLUCION: sueldo['RESOLUCION'],
                        FEC_INICIO: sueldo['FEC_INICIO'],
                        FEC_FIN: sueldo['FEC_FIN'],
                        IND_ESTADO: (sueldo['IND_ESTADO'] == 'Activo' ? '*' : '&')
                    };
                    $.AddPetition({
                        type: type,
                        table: table,
                        condition: condicionSueldoMinimo,
                        items: $.ConvertObjectToArr(objSueldoMinimo)
                    });
                });

                $.SendPetition({
                    connectToLogin: 'S',
                    onReady: function (result) {
                        $.CloseStatusBar();
                        $(tblSueldoMinimo).jqxGrid('updatebounddata');
                        require(['bootbox', 'alertify'], function (bootbox, alertify) {
                            bootbox.hideAll();
                            alertify.success('Se registró la información.');
                        });
                        $('#btnGuardarSM').css('display', 'none');
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
                $(tblSueldoMinimo).jqxGrid('selectrow', indice);
                $(tblSueldoMinimo).jqxGrid('ensurerowvisible', indice);
            }
        }

        // GENERALES
        $('a#btnRefrescar').bind('click', function (e) {
            $('form[name=filtrosRegSueldoMinimo]').submit();
            e.preventDefault();
        });
        $('a#btnAgregarSM').bind('click', function (e) {
            actionNuevoSM();
            e.preventDefault();
        });
        $('#btnGuardarSM').bind('click', function (e) {
            fnGuardarCambios();
            e.preventDefault();
        });
        $('form[name=filtrosRegSueldoMinimo]').ValidForm({
            type: -1,
            onReady: function (result, controls, form) {
                const rows = $(tblSueldoMinimo).jqxGrid('getrows').filter(x => x['MODO'] != undefined);
                if (rows.length > 0) {
                    alertify.confirm('Mensaje del sistema', 'Existen filas sin guardar cambios, ¿Desea continuar?',
                        function () {
                            $(tblSueldoMinimo).jqxGrid('updatebounddata');
                        },
                        function () {
                            alertify.error('Búsqueda cancelada');
                        })
                        .set('labels', { ok: 'Si', cancel: 'No' }).set('defaultFocus', 'ok').set('closable', false);
                }
                else {
                    $(tblSueldoMinimo).jqxGrid('updatebounddata');
                }
            }
        });

        fnCrearTabla();

    });
});