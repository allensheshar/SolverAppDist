require(["helper", "extras", "datetimepicker"], function () {
    require(["alertify", "bootbox"], function (alertify, bootbox) {
        alertify.set('notifier', 'position', 'top-center');

        // VARIABLES
        const table = $('#table');
        const fnClassEditer = function (row, datafield, value, rowdata) {
            if (rowdata.MODO == 1 || rowdata.MODO == 2) return 'editedRow';
        };

        let arrEliminados = [];

        const fnCrearTabla = function () {

            $(table).CreateGrid({
                query: 'tbl_mantenimiento_configurar_detracciones',
                hiddens: ['CODIGO'],
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
                    'CODIGO_DETRACCION': { text: 'Código', width: 100 },
                    'NOMBRE': { text: 'Nombre', cellclassname: fnClassEditer, width: 300 },
                    'DESCRIPCION': { text: 'Descripcion', cellclassname: fnClassEditer, width: 200 },
                    'FACTOR': { text: 'Factor', cellclassname: fnClassEditer, width: 100 },
                    'RESOLUCION': { text: 'Resolución', cellclassname: fnClassEditer, width: 100 },
                    'FECHA_INICIO': { text: 'Fecha inicio', cellclassname: fnClassEditer, width: 100 },
                    'FECHA_FIN': { text: 'Fecha fin', cellclassname: fnClassEditer, width: 100 },
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
                        width: 80,
                        cellsAlign: 'center'
                    }
                },
                config: {
                    height: 600,
                    pageSize: 999999,
                    virtualmode: false,
                    columnsresize: true,
                    pageable: false,
                    sortable: false,
                    editable: true,
                    rendered: function () { }
                }
            });
            $(table).on('bindingcomplete', function () {
                $(table).jqxGrid('selectrow', 0);
                $(table).unbind("cellvaluechanged");
                $(table).on("cellvaluechanged", function (event) {
                    if (event.args.newvalue != event.args.oldvalue) {
                        var row = event.args.rowindex;
                        if ($(table).jqxGrid('getrows')[row].MODO != 1) $(table).jqxGrid('getrows')[row].MODO = 2;
                    }
                });
            });
            $('#btnAgregar').bind('click', function (e) {
                const fila = $(table).jqxGrid('getrows').length;
                var obj = {
                    _rowNum: fila + 1,
                    MODO: 1,
                    CODIGO: '',
                    CODIGO_DETRACCION: '',
                    NOMBRE: '',
                    DESCRIPCION: '',
                    FACTOR: '',
                    RESOLUCION: '',
                    FECHA_INICIO: '',
                    FECHA_FIN: '',
                    IND_ESTADO: 'Activo'
                };
                $(table).jqxGrid('addrow', null, obj);
                $(table).jqxGrid('selectrow', fila);
                $(table).jqxGrid('ensurerowvisible', fila);
            });
            $('#btnEliminar').bind('click', function (e) {
                var rows = $(table).jqxGrid('getrows');
                if (rows.length > 0) {
                    var selected = $(table).jqxGrid('getselectedrowindex')
                    if (selected != -1) {
                        if (rows[selected]['CODIGO_DETRACCION'] != '') {
                            arrEliminados.push(rows[selected]);
                        }
                        var rowId = $(table).jqxGrid('getrowid', selected);
                        $(table).jqxGrid('deleterow', rowId);
                        if (selected - 1 != -1) {
                            $(table).jqxGrid('selectrow', selected - 1);
                            $(table).jqxGrid('ensurerowvisible', selected - 1);
                        }
                        else {
                            if (rows.length > 0) {
                                $(table).jqxGrid('selectrow', selected);
                                $(table).jqxGrid('ensurerowvisible', selected);
                            }
                        }
                    }
                }
            });
        }
        const actionGuardar = function () {

            let filas = $(table).jqxGrid('getrows').filter(x => x['MODO'] == 1 || x['MODO'] == 2);
            const extra = {
                CODIGO: {
                    action: {
                        name: 'GetNextId',
                        args: $.ConvertObjectToArr({
                            max_length: '5'
                        })
                    }
                }
            };
            $.each(filas, function (i, v) {
                $.AddPetition({
                    type: (v.CODIGO == '' ? 1 : 2),
                    table: 'CONTAB.TABLA_DETRACCION',
                    condition: (v.CODIGO == '' ? '' : `CODIGO = '${v.CODIGO}'`),
                    items: $.ConvertObjectToArr({
                        CODIGO: v.CODIGO,
                        CODIGO_DETRACCION: v.CODIGO_DETRACCION,
                        NOMBRE: v.NOMBRE,
                        DESCRIPCION: v.DESCRIPCION,
                        FACTOR: v.FACTOR,
                        RESOLUCION: v.RESOLUCION,
                        FECHA_INICIO: v.FECHA_INICIO,
                        FECHA_FIN: v.FECHA_FIN,
                        IND_ESTADO: (v.IND_ESTADO == 'Activo' ? '*' : '&'),
                    }, extra)
                });
            });
            if (arrEliminados.length > 0) {
                $.each(arrEliminados, function (i, eliminados) {
                    if (eliminados.CODIGO != '' || eliminados.CODIGO != null) {
                        const obj = {
                            CODIGO: eliminados.CODIGO,
                            IND_ESTADO: 'E'
                        };
                        $.AddPetition({
                            table: 'CONTAB.TABLA_DETRACCION',
                            type: 2,
                            condition: `CODIGO = '${eliminados.CODIGO}'`,
                            items: $.ConvertObjectToArr(obj)
                        });
                    }
                });
            }

            $.SendPetition({
                onReady: function (result) {
                    $.CloseStatusBar();
                    alertify.success('Se guardó la información.');
                    $(table).jqxGrid('updatebounddata');
                    arrEliminados = [];
                },
                onBefore: function () {
                    $.DisplayStatusBar({ message: 'Guardando información.' });
                },
                onError: function (_error) {
                    $.CloseStatusBar();
                    $.ShowError({ error: _error });
                }
            })

        }

        $('#btnGuardar').click(function () {
            actionGuardar();
        })
        fnCrearTabla();
    });
});