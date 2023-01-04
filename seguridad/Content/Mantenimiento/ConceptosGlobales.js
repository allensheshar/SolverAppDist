require(["helper", "extras", "datetimepicker"], function () {
    require(["alertify", "bootbox"], function (alertify, bootbox) {
        alertify.set('notifier', 'position', 'top-center');

        // VARIABLES
        const tblConceptos = $('#tblConceptos');

        // TABLAS
        const fnCrearTabla = function () {
            $(tblConceptos).CreateGrid({
                query: 'tbl_cuenta_mantenimiento_conceptosglobales',
                items: {
                    BUSCAR: function () {
                        return $('#_buscar').val() || '';
                    },
                    FLAG_GRUPO_CONCEPTO: function () {
                        return $('#FLAG_GRUPO_CONCEPTO').val() || '';
                    },
                    TIPO_CALCULO: function () {
                        return $('#TIPO_CALCULO').val() || '';
                    },
                },
                hiddens: ['NOMBRE_LIQUIDACION', 'TIPO_CONCEPTO', 'C_TIPO_CALCULO', 'TIPO_CALCULO', 'NOM_CORTO_PLA'],
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
                    'C_CONCEPTO_GLOBAL': {
                        text: 'Código',
                        cellsAlign: 'center',
                        width: 80
                    },
                    'NOMBRE_CONCEPTO': {
                        text: 'Descripción',
                        width: 300
                    },
                    'NOM_CORTO_BOL': {
                        text: 'Nombre corto boleta',
                        width: 200
                    },
                    'DESCRIP_FORMULA': {
                        text: 'Fórmula',
                        cellsAlign: 'left',
                        width: 250
                    },
                    'COD_PLAME': {
                        text: 'Plame',
                        cellsAlign: 'center',
                        width: 80
                    },
                    'IND_ESTADO': {
                        text: 'Estado',
                        width: 80,
                        cellsRenderer: function (row, column, value, rowData) {
                            if (value == '*') return '<div class="mt-2 jqx-grid-cell-middle-align"><span class="text-extra" style="color:green;"><i class="fa fa-check-circle" aria-hidden="true"></i> ACTIVO</span></div>';
                            if (value == '&') return '<div class="mt-2 jqx-grid-cell-middle-align"><span class="text-extra" style="color:red;"><i class="fa fa-exclamation-circle" aria-hidden="true"></i> INACTIVO</span></div>';
                        }
                    },
                },
                config: {
                    pageSize: 999999,
                    virtualmode: false,
                    columnsresize: true,
                    pageable: false,
                    sortable: false,
                    editable: false,
                    rendered: function () {
                        $(tblConceptos).jqxGrid('selectrow', 0);
                    }
                }
            });
        }
        const fnEliminarConcepto = function () {
            const index = $(tblConceptos).jqxGrid('getselectedrowindex');
            const object = $(tblConceptos).jqxGrid('getrows')[index];
            const id = object['C_CONCEPTO_GLOBAL'];

            if (object['C_CONCEPTO_GLOBAL'].length != 0) {
                $.AddPetition({
                    table: 'PLA.CONCEPTO_GLOBAL',
                    type: 3,
                    condition: `C_CONCEPTO_GLOBAL = '${id}'`,
                    items: $.ConvertObjectToArr({
                        C_CONCEPTO_GLOBAL: object['C_CONCEPTO_GLOBAL']
                    })
                });
                $.SendPetition({
                    connectToLogin: 'S',
                    onReady: function (result) {
                        $.CloseStatusBar();
                        bootbox.hideAll();
                        alertify.success('Se eliminó el concepto.');
                        $('form[name=filtrosRegConceptosGlobales]').submit();
                    },
                    onBefore: function () {
                        $.DisplayStatusBar({ message: 'Eliminando concepto...' });
                    },
                    onError: function (_error) {
                        $.CloseStatusBar();
                        $.ShowError({ error: _error });
                    }
                });
            }
            else {
                alertify.warning('Debes seleccionar un registro para eliminar.');
            }
        }

        // GENERALES
        $('a#btnRefrescar').bind('click', function (e) {
            $('form[name=filtrosRegConceptosGlobales]').submit();
            e.preventDefault();
        });
        $('a#btnEditarConcepto').bind('click', function (e) {
            var index = $(tblConceptos).jqxGrid('getselectedrowindex');
            var id = $(tblConceptos).jqxGrid('getrows')[index].C_CONCEPTO_GLOBAL;
            if (id.length != 0) {
                document.location = $.solver.baseUrl + '/Mantenimiento/RegistroConceptosGlobales/' + id;
            }
            else {
                alertify.warning('Debes seleccionar un registro para editar.');
            }
            e.preventDefault();
        });
        $('a#btnEliminarConcepto').bind('click', function (e) {
            alertify.confirm('Mensaje del sistema', '¿Seguro de eliminar el concepto?',
                function () {
                    fnEliminarConcepto();
                },
                function () {
                }
            ).set('labels', { ok: 'Si', cancel: 'No' }).set('defaultFocus', 'ok').set('closable', false);
            e.preventDefault();
        });

        $('a#btnDescargar').bind('click', function (e) {
            $.DownloadFile({
                query: 'dw_cuenta_mantenimiento_conceptosglobales',
                params: {
                    BUSCAR: function () {
                        return $('#_buscar').val() || '';
                    },
                    FLAG_GRUPO_CONCEPTO: function () {
                        return $('#FLAG_GRUPO_CONCEPTO').val() || '';
                    },
                    TIPO_CALCULO: function () {
                        return $('#TIPO_CALCULO').val() || '';
                    }
                },
                nameFile: 'Conceptos Globales'
            });
            e.preventDefault();
        });

        $('form[name=filtrosRegConceptosGlobales]').ValidForm({
            type: -1,
            onDone: function (form, controls) {
                _controls = controls;
                $(_controls.FLAG_GRUPO_CONCEPTO).val('0100')
            },
            onReady: function (result, controls, form) {
                $(tblConceptos).jqxGrid('updatebounddata');
            }
        });

        fnCrearTabla();
    });
});