require(["helper", "extras", "datetimepicker", 'bootstrap-select', 'fileinput.es'], function () {
    require(["alertify", "bootbox", "moment"], function (alertify, bootbox, moment) {
        alertify.set('notifier', 'position', 'top-center');

        const table = '#tblCargaEstructura'
        const actions = '#actions'
        let _controls;

        const fnCrearTabla = function () {
            $(table).CreateGrid({
                query: 'tbl_cuenta_mantenimiento_configurarestructuraconciliacion_banco',
                items: {
                    BUSCAR: function () {
                        return $(_controls._buscar).val();
                    },
                },
                hiddens: ['C_EMPRESA', 'C_COLABORADOR', 'DESCRIPCION'],
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
                    'C_ESTRUCTURA': {
                        text: 'Cod. masivo',
                        cellsAlign: 'center',
                        width: 100,
                    },
                    'NOMBRE_ESTRUCTURA': {
                        text: 'Nom. masivo',
                        width: 300,
                    },
                    'NOMBRE_CORTO': {
                        text: 'Banco',
                        width: 150
                    },
                    'FILA': {
                        text: 'Fila',
                        width: 60,
                        cellsAlign: 'right'
                    },
                    'FEC_INICIO': {
                        text: 'Fec. inicio',
                        cellsAlign: 'center',
                        width: 100
                    },
                    'FEC_REGISTRO': {
                        text: 'Fec. registro',
                        cellsAlign: 'center',
                        width: 130
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
                        width: 100,
                        cellsAlign: 'center'
                    }
                },
                config: {
                    pageable: true,
                    sortable: true,
                    height: 600,
                    pageSize: 100
                }
            });
        }

        const actionEditarMasivo = function (row, index) {
            var type = 1;
            var condition = '';
            var title = 'Registro de estructura'

            if (index != undefined) {
                type = 2;
                condition = `C_ESTRUCTURA = '${row['C_ESTRUCTURA']}'`
                title = 'Editar estructura'
            }

            var token = $.CreateToken();
            var dialog = bootbox.dialog({
                title: title,
                message: `<div id="${token}"></div>`,
                onEscape: false
            });
            dialog.init(function () {
                setTimeout(function () {
                    // Agregando estilos al modal
                    $(dialog).find('.modal-dialog').css({ 'max-width': '60%' })

                    var objControls = null;

                    const fnCrearTablaDetalle = function () {
                        $(dialog).find('#' + token + '_table').CreateGrid({
                            query: 'tbl_cuenta_mantenimiento_configurarestructuraconciliacion_banco_detalle',
                            hiddens: ['C_ESTRUCTURA'],
                            items: {
                                C_ESTRUCTURA: function () {
                                    return $(objControls.C_ESTRUCTURA).val() || '';
                                },
                            },
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
                                'C_DETALLE': {
                                    text: 'Cod. detalle',
                                    cellsAlign: 'center',
                                    editable: false,
                                    width: 100,
                                },
                                'NUM_COLUMNA': {
                                    text: 'Núm columna',
                                    width: 100
                                },
                                'NOMBRE_COLUMNA': {
                                    text: 'Columna',
                                    width: 125
                                },
                                'NOMBRE_CAMPO': {
                                    text: 'Campo',
                                    width: 300
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
                                    width: 100,
                                    cellsAlign: 'center'
                                }
                            },
                            config: {
                                height: 550,
                                pageSize: 999999,
                                virtualmode: false,
                                columnsresize: true,
                                editable: true,
                                sortable: false,
                                pageable: false
                            }
                        });
                    }

                    $(dialog).find('#' + token).html(`
                        <form id="${token}_form" action="#" method="post" data-table="CAJA.BANCO_CONCILIACION_ESTRUCTURA" data-condition="${condition}" data-setUpdate="1" autocomplete="off">
                            <input type="hidden" name="C_ESTRUCTURA" />
                            <div class="row mb-2">
                                <div class="col-3">
                                    <label class="col-form-label"> Nombre estructura</label>
                                    <input type="text" class="form-control form-control-sm" name="NOMBRE_ESTRUCTURA" required />
                                </div>
                                <div class="col-2">
                                    <label class="col-form-label"> Banco</label>
                                    <select class="form-control form-control-sm" name="C_BANCO" data-query="cb_planilla_mantenimiento_personaregistro_laboral_bancos" data-value="CODIGO" data-field="DESCRIPCION" required></select>
                                </div>
                                <div class="col-2">
                                    <label class="col-form-label"> Fecha inicio</label>
                                    <input type="text" class="form-control form-control-sm" name="FEC_INICIO" />
                                </div>
                                <div class="col-auto">
                                    <label class="col-form-label"> Fila</label>
                                    <input type="number" class="form-control form-control-sm" name="FILA" required />
                                </div>
                                <div class="col-2">
                                    <label class="col-form-label"> Estado</label>
                                    <select class="form-control form-control-sm" name="IND_ESTADO" required>
                                        <option value="*"> Activo</option>
                                        <option value="&"> Inactivo</option>
                                    </select>
                                </div>
                                <div class="col-auto" style="margin-top:10px;">
                                    <span class="help-block text-muted small-font">&nbsp;</span>
                                    <button type="button" id="btnAgregarDetalle" class="btn btn-sm btn-info btn-block"><i class="fa fa-plus-circle" aria-hidden="true"></i>&nbsp;Agregar</button>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col">
                                    <label class="col-form-label"> Descripción</label>
                                    <textarea type="text" class="form-control form-control-sm" name="DESCRIPCION"></textarea>
                                </div>
                            </div>
                        </form>
                        <div class="row mt-2">
                            <div class="col">
                                <div id="${token}_table"></div>
                            </div>
                        </div>
                        <button type="button" id="btnGuardar" class="btn btn-danger float-right btn-sm mt-2"><i class="fa fa-save" aria-hidden="true"></i>&nbsp;Guardar</button>
                    `);

                    //Validamos formulario
                    $(dialog).find('#' + token + '_form').ValidForm({
                        table: 'CAJA.BANCO_CONCILIACION_ESTRUCTURA',
                        type: type,
                        condition: condition,
                        querySave: true,
                        extras: {
                            C_ESTRUCTURA: {
                                action: {
                                    name: 'GetNextId',
                                    args: $.ConvertObjectToArr({
                                        max_length: 4
                                    })
                                }
                            }
                        },
                        queryDefault: {
                            query: ['editableCargaEstructura'],
                            type: [8],
                            items: [{
                                table: 'CAJA.BANCO_CONCILIACION_ESTRUCTURA',
                                condition: condition
                            }]
                        },
                        onDone: function (form, controls) {
                            objControls = controls;

                            if ($(controls.C_ESTRUCTURA).val() != '') {
                                $(controls.FEC_INICIO).val(moment($(_controls.FEC_INICIO).val()).format('DD/MM/YYYY'))
                            }
                            $(controls.FEC_INICIO).datetimepicker({
                                format: 'DD/MM/YYYY',
                                locale: 'es'
                            });

                            $('#btnAgregarDetalle').click(function () {
                                const Detalle = $(dialog).find('#' + token + '_table').jqxGrid('getrows').length;
                                var objDetalle = {
                                    _rowNum: Detalle + 1,
                                    MODO: 1,
                                    C_ESTRUCTURA: '',
                                    C_DETALLE: '',
                                    NOMBRE_COLUMNA: '',
                                    NOMBRE_CAMPO: '',
                                    IND_ESTADO: $(objControls.IND_ESTADO).val() == '*' ? 'Activo' : 'Inactivo',
                                };
                                $(dialog).find('#' + token + '_table').jqxGrid('addrow', null, objDetalle);
                                $(dialog).find('#' + token + '_table').jqxGrid('selectrow', Detalle);
                                $(dialog).find('#' + token + '_table').jqxGrid('ensurerowvisible', Detalle);
                            });

                            fnCrearTablaDetalle();

                            $('#btnGuardar').click(function () {
                                $(dialog).find('#' + token + '_form').submit();
                            });
                        },
                        onDetail: function (form, controls, tokenParent, objParent) {
                            var extraEliminar = {
                                C_ESTRUCTURA: {
                                    action: {
                                        name: 'GetParentId',
                                        args: $.ConvertObjectToArr({
                                            token: tokenParent,
                                            column: 'C_ESTRUCTURA'
                                        })
                                    }
                                },
                            };

                            $.AddPetition({
                                type: 4,
                                items: $.ConvertObjectToArr({
                                    script: 'spw_banco_nuevaestructura_eliminardetalle',
                                    C_ESTRUCTURA: '',
                                }, extraEliminar),
                                transaction: true
                            });

                            var extraDetalle = {
                                C_ESTRUCTURA: {
                                    action: {
                                        name: 'GetParentId',
                                        args: $.ConvertObjectToArr({
                                            token: tokenParent,
                                            column: 'C_ESTRUCTURA'
                                        })
                                    }
                                },
                                C_DETALLE: {
                                    action: {
                                        name: 'GetNextId',
                                        args: $.ConvertObjectToArr({
                                            columns: 'C_ESTRUCTURA',
                                            max_length: '3'
                                        })
                                    }
                                }
                            }

                            $.each($(dialog).find('#' + token + '_table').jqxGrid('getrows'), function (i, v) {
                                $.AddPetition({
                                    table: 'CAJA.BANCO_CONCILIACION_ESTRUCTURA_DETALLE',
                                    type: 1,
                                    items: $.ConvertObjectToArr({
                                        C_ESTRUCTURA: '',
                                        C_DETALLE: '',
                                        NUM_COLUMNA: (v['NUM_COLUMNA'] == '' ? 0 : v['NUM_COLUMNA']),
                                        NOMBRE_COLUMNA: v['NOMBRE_COLUMNA'],
                                        NOMBRE_CAMPO: v['NOMBRE_CAMPO'],
                                        IND_ESTADO: v['IND_ESTADO'] == 'Activo' ? '*' : '&',
                                    }, extraDetalle)
                                });
                            });
                        },
                        onReady: function (result, controls, object) {
                            $(dialog).modal('hide');
                            $('form[name=form]').submit()
                        }
                    });

                    $('.bootbox .modal-dialog').draggable({
                        handle: '.modal-header'
                    });
                    $('.bootbox .modal-header').css('cursor', 'move');
                }, 150);
            });
        }

        $('form[name=form]').ValidForm({
            type: -1,
            onReady: function () {
                $(table).jqxGrid('updatebounddata');
            },
            onDone: function (form, controls) {
                _controls = controls;
                fnCrearTabla();

                $(actions).CreateActions({
                    text: 'Acciones',
                    class: 'btn btn-sm btn-orange',
                    actions: {
                        'Crear Masivo': {

                            icon: 'fa fa-cog',
                            callback: function () {
                                actionEditarMasivo()
                            }
                        },
                        'Editar Masivo': {
                            icon: 'fa fa-edit',
                            callback: function () {
                                const index = $(table).jqxGrid('getselectedrowindex');
                                const row = $(table).jqxGrid('getrows')[index]
                                actionEditarMasivo(row, index);
                            }
                        }
                    }
                })
            }
        });

    });
});