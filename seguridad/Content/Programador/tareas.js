require(["helper", "extras"], function () {
    require(["alertify"], function (alertify) {
        alertify.set('notifier', 'position', 'top-center');

        // VARIABLES
        const tblTareas = $('#tblTareas');
        let arrEliminadoTarea = [];

        // TABLAS
        const fnCrearTabla = function () {
            const fnClassEditer = function (row, datafield, value, rowdata) {
                if (rowdata.MODO == 1 || rowdata.MODO == 2) return 'editedRow';
            };

            $(tblTareas).CreateGrid({
                query: 'tbl_cuenta_programador_tareas',
                items: {
                    NOMBRE: function () {
                        return $('#_buscar').val() || '';
                    },
                },
                hiddens: ['ID'],
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
                    'NOMBRE': {
                        text: 'Nombre',
                        cellclassname: fnClassEditer,
                        width: 250,
                    },
                    'DESCRIPCION': {
                        text: 'Descripción',
                        cellclassname: fnClassEditer,
                        width: 200,
                        cellsAlign: 'center'
                    },
                    'INTERVALO': {
                        text: 'Intervalo', columntype: 'dropdownlist',
                        createeditor: function (row, value, editor) {
                            const intervalo = [
                                { value: "A LAS", label: "A LAS" },
                                { value: "CADA", label: "CADA" }
                            ];
                            const intervaloSource =
                            {
                                datatype: "array",
                                datafields: [
                                    { name: 'label', type: 'string' },
                                    { name: 'value', type: 'string' }
                                ],
                                localdata: intervalo
                            };
                            const myadapter = new $.jqx.dataAdapter(intervaloSource, { autoBind: true });
                            editor.jqxDropDownList({ source: myadapter, displayMember: 'label', valueMember: 'value' });
                        },
                        cellclassname: fnClassEditer,
                        width: 100,
                        cellsAlign: 'center'
                    },
                    'VALOR_INTERVALO': {
                        text: 'Valor intervalo',
                        cellclassname: fnClassEditer,
                        width: 100,
                        cellsAlign: 'center'
                    },
                    'FLAG_MULTIPLE_JOB': {
                        text: 'Múltiple job',
                        columntype: 'checkbox',
                        width: 100
                    },
                    'IND_ESTADO': {
                        text: 'Estado',
                        columntype: 'checkbox',
                        width: 60
                    }
                },
                config: {
                    virtualmode: false,
                    height: 400,
                    pageSize: 999999,
                    columnsresize: true,
                    editable: true,
                    sortable: false,
                    pageable: false,
                    rendered: function () { }
                }
            });
            $(tblTareas).on('bindingcomplete', function () {
                $(tblTareas).unbind("cellvaluechanged");
                $(tblTareas).on("cellvaluechanged", function (event) {
                    if (event.args.newvalue != event.args.oldvalue) {
                        var row = event.args.rowindex;
                        if ($(tblTareas).jqxGrid('getrows')[row].MODO != 1) $(tblTareas).jqxGrid('getrows')[row].MODO = 2;
                        $('#btnGuardarTareas').css('display', 'block');
                    }
                });
                $(tblTareas).jqxGrid({ selectedrowindex: 0 });
            });
        }

        // ACCIONES
        const actionNuevaTarea = function (e) {
            const fila = $(tblTareas).jqxGrid('getrows').length;
            var tareas = {
                _rowNum: fila + 1,
                MODO: 1,
                ID: 0,
                NOMBRE: '',
                DESCRIPCION: '',
                INTERVALO: 'A LAS',
                VALOR_INTERVALO: '',
                FLAG_MULTIPLE_JOB: 'true',
                IND_ESTADO: 'true'
            };
            $(tblTareas).jqxGrid('addrow', null, tareas);
            $(tblTareas).jqxGrid('selectrow', fila);
            $(tblTareas).jqxGrid('ensurerowvisible', fila);
        }
        const actionGuardarTareas = function (e) {
            const fnValidarCambios = function () {
                let indice = -1;
                let filas = $(tblTareas).jqxGrid('getrows');
                $.each(filas, function (i, v) {
                    if (indice == -1) {
                        if (v.NOMBRE == '' || v.INTERVALO == '' || v.VALOR_INTERVALO == '') {
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
                    const table = 'W_TAREAS';

                    let filas = $(tblTareas).jqxGrid('getrows').filter(x => x['MODO'] == 1 || x['MODO'] == 2);
                    
                    $.each(filas, function (i, v) {
                        $.AddPetition({
                            table,
                            type: (v.ID == 0 ? 1 : 2),
                            condition: (v.ID == 0 ? '' : `ID = '${v.ID}'`),
                            items: $.ConvertObjectToArr({
                                ID: v.ID,
                                NOMBRE: v.NOMBRE,
                                DESCRIPCION: v.DESCRIPCION,
                                INTERVALO: (v.INTERVALO == 'A LAS' ? 'A LAS' : 'CADA'),
                                VALOR_INTERVALO: v.VALOR_INTERVALO,
                                FLAG_MULTIPLE_JOB: (v.FLAG_MULTIPLE_JOB == 'true' || v.FLAG_MULTIPLE_JOB == true ? '*' : '&'),
                                FLAG_ESTADO: (v.IND_ESTADO == 'true' || v.IND_ESTADO == true ? '*' : '&')
                            })
                        });
                    });

                    if (arrEliminadoTarea.length > 0) {
                        $.each(arrEliminadoTarea, function (i, eliminado) {
                            const objEliTarea = {
                                ID: eliminado.ID
                            };
                            $.AddPetition({
                                table: 'W_TAREAS',
                                type: 3,
                                condition: `ID = '${eliminado.ID}'`,
                                items: $.ConvertObjectToArr(objEliTarea)
                            });
                        });
                    }
                    $.SendPetition({
                        connectToLogin: 'S',
                        onReady: function (result) {
                            $.CloseStatusBar();
                            $(tblTareas).jqxGrid('updatebounddata');
                            require(['bootbox', 'alertify'], function (bootbox, alertify) {
                                bootbox.hideAll();
                                alertify.success('Se registró la información.');
                            });
                            $('#btnGuardarTareas').css('display', 'none');
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
                    $(tblTareas).jqxGrid('selectrow', indice);
                    $(tblTareas).jqxGrid('ensurerowvisible', indice);
                }
            }
            alertify.confirm('Confirme Operación!!', '¿Seguro de actualizar la información?', fnGuardarCambios, null);
        }

        // GENERALES
        $('a#btnAgregarTareas').bind('click', function (e) {
            actionNuevaTarea();
            e.preventDefault();
        });
        $('a#btnGuardarTareas').bind('click', function (e) {
            actionGuardarTareas();
            e.preventDefault();
        });
        $('#btnEliminar').click(function () {
            var rows = $(tblTareas).jqxGrid('getrows');
            if (rows.length > 0) {
                var selected = $(tblTareas).jqxGrid('getselectedrowindex')
                if (selected != -1) {
                    if (rows[selected]['ID'] != '') {
                        $('#btnGuardarTareas').css('display', 'block');
                        arrEliminadoTarea.push(rows[selected]);
                    }
                    var rowId = $(tblTareas).jqxGrid('getrowid', selected);
                    $(tblTareas).jqxGrid('deleterow', rowId);
                    if (selected - 1 != -1) {
                        $(tblTareas).jqxGrid('selectrow', selected - 1);
                        $(tblTareas).jqxGrid('ensurerowvisible', selected - 1);
                    }
                    else {
                        if (rows.length > 0) {
                            $(tblTareas).jqxGrid('selectrow', selected);
                            $(tblTareas).jqxGrid('ensurerowvisible', selected);
                        }
                    }
                }
            }
        });

        $('form[name=filtrosRegTareas]').ValidForm({
            type: -1,
            onReady: function (result, controls, form) {
                const row = $(tblTareas).jqxGrid('getrows').filter(x => x['MODO'] != undefined);
                if (row.length > 0) {
                    alertify.confirm('Mensaje del sistema', 'Existen filas sin guardar cambios, ¿Desea continuar?',
                        function () {
                            $(tblTareas).jqxGrid('updatebounddata');
                            $('#btnGuardarTareas').css('display', 'none');
                        },
                        function () {
                            alertify.error('Búsqueda cancelada');
                        })
                        .set('labels', { ok: 'Si', cancel: 'No' }).set('defaultFocus', 'ok').set('closable', false);
                }
                else {
                    $(tblTareas).jqxGrid('updatebounddata');
                    $('#btnGuardarTareas').css('display', 'none');
                }
            }
        });

        fnCrearTabla();
    });
});