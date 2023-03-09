require(["helper", "extras", 'bootstrap-select', 'fileinput.es'], function () {
    require(["alertify", "moment"], function (alertify, moment) {
        alertify.set('notifier', 'position', 'top-center');

        // Variables
        const empresa = $.solver.session.SESSION_EMPRESA;
        const tblCategoria = '#tblCategoria';

        const actionNuevaCat = function (e) {
            const fila = $(tblCategoria).jqxGrid('getrows').length;
            var categoria = {
                _rowNum: fila + 1,
                MODO: 1,
                C_CATEGORIA: 0,
                C_EMPRESA: '',
                NOMBRE_FAMILIA: '',
                NOMBRE_SUB_FAMILIA: '',
                NOMBRE_CATEGORIA: '',
                ESTADO: 'Activo'
            };
            $(tblCategoria).jqxGrid('addrow', null, categoria);
            $(tblCategoria).jqxGrid('selectrow', fila);
            $(tblCategoria).jqxGrid('ensurerowvisible', fila);
        }
        const actionGuardarCat = function (e) {
            const fnValidarCambios = function () {
                let indice = -1;
                let filas = $(tblCategoria).jqxGrid('getrows');
                $.each(filas, function (i, v) {
                    if (indice == -1) {
                        if (v.NOMBRE_FAMILIA == '' || v.NOMBRE_SUB_FAMILIA == '' || v.NOMBRE_CATEGORIA == '') {
                            indice = i;
                            return i;
                        }
                    }
                });
                return indice;
            }
            const fnGuardarCambios = function () {
                const table = 'VET.PRODUCTO_CATEGORIA';
                let filas = $(tblCategoria).jqxGrid('getrows').filter(x => x['MODO'] == 1 || x['MODO'] == 2);
                let extras = {
                    C_CATEGORIA: {
                        action: {
                            name: 'GetNextId',
                            args: $.ConvertObjectToArr({
                                columns: 'C_EMPRESA',
                                max_length: 10
                            })
                        }
                    }
                };
                $.each(filas, function (i, v) {
                    $.AddPetition({
                        table,
                        type: (v.C_CATEGORIA == 0 ? 1 : 2),
                        condition: (v.C_CATEGORIA == 0 ? '' : `C_CATEGORIA = '${v.C_CATEGORIA}' AND C_EMPRESA = '${empresa}'`),
                        items: $.ConvertObjectToArr({
                            C_CATEGORIA: v.C_CATEGORIA,
                            NOMBRE_CATEGORIA: v.NOMBRE_CATEGORIA,
                            NOMBRE_FAMILIA: v.NOMBRE_FAMILIA,
                            NOMBRE_SUB_FAMILIA: v.NOMBRE_SUB_FAMILIA,
                            IND_ESTADO: (v.ESTADO == 'Activo' ? '*' : '&'),
                            C_EMPRESA: empresa
                        }, extras)
                    });
                });
                $.SendPetition({
                    connectToLogin: 'S',
                    onReady: function (result) {
                        $.CloseStatusBar();
                        $(tblCategoria).jqxGrid('updatebounddata');
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

            const indice = fnValidarCambios();
            if (indice == -1) {
                alertify.confirm('Confirme operación', '¿Seguro de actualizar la información?', fnGuardarCambios, null)
                    .set('labels', { ok: 'Si', cancel: 'No' }).set('defaultFocus', 'ok').set('closable', false);
            }
            else {
                alertify.alert('Mensaje del Sistema', 'Por favor rellena todos los campos de la fila ' + (indice + 1) + '.', function () { });
                $(tblCategoria).jqxGrid('selectrow', indice);
                $(tblCategoria).jqxGrid('ensurerowvisible', indice);
            }
        }
        const fnCrearTabla = function () {
            const fnClassEditer = function (row, datafield, value, rowdata) {
                if (rowdata.MODO == 1 || rowdata.MODO == 2) return 'editedRow';
            };
            $(tblCategoria).CreateGrid({
                query: 'tbl_ventas_mantenimiento_categorias_listarcategorias',
                items: {
                    NOMBRE: function () { return $('#_buscar').val() || ''; },
                    C_EMPRESA: empresa
                },
                hiddens: ['C_CATEGORIA', 'IND_ESTADO', 'C_EMPRESA'],
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
                    'NOMBRE_FAMILIA': {
                        text: 'Familia',
                        cellclassname: fnClassEditer,
                        width: 150
                    },
                    'NOMBRE_SUB_FAMILIA': {
                        text: 'Subfamilia',
                        cellclassname: fnClassEditer,
                        width: 150
                    },
                    'NOMBRE_CATEGORIA': {
                        text: 'Categoría',
                        cellclassname: fnClassEditer,
                        width: 150
                    },
                    'ESTADO': {
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
                    height: 500,
                    pageSize: 100,
                    columnsresize: true,
                    editable: true,
                    sortable: false,
                    pageable: false
                }
            });
            $(tblCategoria).on('bindingcomplete', function () {
                $(tblCategoria).unbind("cellvaluechanged");
                $(tblCategoria).on("cellvaluechanged", function (event) {
                    if (event.args.newvalue != event.args.oldvalue) {
                        var row = event.args.rowindex;
                        if ($(tblCategoria).jqxGrid('getrows')[row].MODO != 1) $(tblCategoria).jqxGrid('getrows')[row].MODO = 2;
                    }
                });
            });
        }

        $('a#btnNuevaCat').bind('click', function (e) {
            actionNuevaCat();
            e.preventDefault();
        });
        $('#btnGuardarCat').bind('click', function (e) {
            actionGuardarCat();
            e.preventDefault();
        });
        $('a#btnDescargar').bind('click', function (e) {
            $.solver.fn.fnDescargarCategoria(function () { return $('#_buscar').val() || ''; });
            e.preventDefault();
        })
        $('form[name=filtrosRegCategorias]').ValidForm({
            type: -1,
            onReady: function (result, controls, form) {
                const rows = $(tblCategoria).jqxGrid('getrows').filter(x => x['MODO'] != undefined);
                if (rows.length > 0) {
                    alertify.confirm('Mensaje del sistema', 'Existen filas sin guardar cambios, ¿Desea continuar?',
                        function () {
                            $(tblCategoria).jqxGrid('updatebounddata');
                        },
                        function () {
                            alertify.error('Búsqueda cancelada');
                        })
                        .set('labels', { ok: 'Si', cancel: 'No' }).set('defaultFocus', 'ok').set('closable', false);
                }
                else {
                    $(tblCategoria).jqxGrid('updatebounddata');
                }
            }
        });

        fnCrearTabla();
    });
});