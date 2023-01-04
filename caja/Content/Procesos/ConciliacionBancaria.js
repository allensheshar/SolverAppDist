require(["helper", "extras", "controls", "datetimepicker"], function () {
    require(["alertify", "moment", "bootbox", "numeral"], function (alertify, moment, bootbox, numeral) {
        const table = '#table';
        const tableBanco = '#tableBanco';
        const tableSistema = '#tableSistema';
        const frm = 'form[name=frm]'
        const actions = '#actions';
        let _controls;

        alertify.set('notifier', 'position', 'top-center');

        const fnImportarArchivo = function () {
            $.GetData({
                uriData: `${$.solver.currentUrl}/Mantenimiento/SubirArchivo`,
                title: `Importar archivo`,
                location: 'float',
                type: 'GET',
                isPage: true,
                onReady: function (object, modal) {
                    $(modal).find('.modal-dialog').css({ 'max-width': '40%' });
                }
            });
        };

        const fnConciliarRegistros = function () {
            var rows = $(table).jqxGrid('getrows');
            if (rows.filter(x => x['NRO_CONCILIADO'] != '').length > 0) {
                alertify.warning('Ya ha conciliado este periodo')
                return;
            }

            $.GetQuery({
                query: ['q_caja_procesos_conciliacionbancaria_conciliar'],
                items: [{
                    C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                    ANIO: function () {
                        return $(_controls.ANIO).val();
                    },
                    MES: function () {
                        return $(_controls.MES).val();
                    },
                    C_BANCO: function () {
                        return $(_controls.C_BANCO).val();
                    },
                    C_CUENTA_BANCARIA: function () {
                        return $(_controls.C_CUENTA_BANCARIA).val();
                    },
                }],
                onReady: function () {
                    alertify.success('Conciliación realizada');
                    $(table).jqxGrid('updatebounddata')
                    $(tableBanco).jqxGrid('updatebounddata')
                    $(tableSistema).jqxGrid('updatebounddata')
                }
            })
        }
        const fnVerSaldoInicial = function () {
            var token = $.CreateToken();
            var dialog = bootbox.dialog({
                title: 'Saldo inicial',
                message: `<div id="${token}"></div>`,
                onEscape: false
            });
            dialog.init(function () {
                setTimeout(function () {
                    // Agregando estilos al modal
                    $(dialog).find('.modal-dialog').css({ 'max-width': '30%' })
                    $(dialog).find('.modal-dialog').css({ 'margin-top': '4%' })

                    var objControls = null;
                    $(dialog).find('#' + token).html(`
                        <div class="row">
                            <div class="col">
                                <div class="form-group row">
                                    <div class="col text-center">
                                        <h3 class="control-label label-bold" id="saldoInicial">0</h3>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `);

                    $.GetQuery({
                        query: ['q_caja_procesos_conciliacionbancaria_saldo_inicial'],
                        items: [{
                            C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                            ANIO: function () {
                                return $(_controls.ANIO).val();
                            },
                            MES: function () {
                                return $(_controls.MES).val();
                            },
                            C_BANCO: function () {
                                return $(_controls.C_BANCO).val();
                            },
                            C_CUENTA_BANCARIA: function () {
                                return $(_controls.C_CUENTA_BANCARIA).val();
                            },
                        }],
                        onReady: function (result) {
                            if (result.length > 0) {
                                $(dialog).find('#saldoInicial').html(`SALDO INICIAL: ${result[0].MONEDA} ${numeral(result[0].SALDO_INICIAL).format('0.00')}`)
                            }
                        }
                    })


                    $('.bootbox .modal-dialog').draggable({
                        handle: '.modal-header'
                    });
                    $('.bootbox .modal-header').css('cursor', 'move');
                }, 150);
            })
        }
        const fnEditarMovimiento = function (c_movimiento, tipo) {
            var rows = $(table).jqxGrid('getrows').filter(x => x['NRO_CONCILIACION'] != '');

            if (rows.length > 0) {
                alertify.warning('Ya ha conciliado este periodo')
                return;
            }

            let url = '';
            let title = ''
            if (tipo == 'I') {
                url = `${$.solver.baseUrl}/Procesos/NuevoMovimientoIngreso?a=${c_movimiento}&b=editar`;
                title = 'Editar movimiento ingreso'
            }
            else {
                url = `${$.solver.baseUrl}/Procesos/NuevoMovimientoEgreso?a=${c_movimiento}&b=editar`;
                title = 'Editar movimiento egreso'
            }

            $.GetData({
                uriData: url,
                title: `${title}`,
                location: 'float',
                type: 'GET',
                isPage: true,
                onReady: function (object, modal) {
                    $(modal).find('.modal-dialog').css({ 'max-width': '80%' });

                    $('#EDITAR').change(function () {
                        bootbox.hideAll();
                    });
                }
            });

            $('.bootbox .modal-dialog').draggable({ handle: '.modal-header' });
            $('.bootbox .modal-header').css('cursor', 'move');
        }

        const fnCrearTabla = function () {
            $(table).CreateGrid({
                query: 'tbl_caja_procesos_conciliacionbancaria',
                hiddens: ['COD_TIPO', 'C_MOVIMIENTO'],
                items: {
                    C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                    ANIO: function () {
                        return $(_controls.ANIO).val();
                    },
                    MES: function () {
                        return $(_controls.MES).val();
                    },
                    C_BANCO: function () {
                        return $(_controls.C_BANCO).val();
                    },
                    C_CUENTA_BANCARIA: function () {
                        return $(_controls.C_CUENTA_BANCARIA).val();
                    },
                },
                columns: {
                    BANCO_FECHA_OPERACION: {
                        text: 'Fec. Operación',
                        width: 100,
                        cellsAlign: 'center'
                    },
                    BANCO_FECHA_PROCESO: {
                        text: 'Fec. Proceso',
                        width: 100,
                        cellsAlign: 'center'
                    },
                    BANCO_REFERENCIA: {
                        text: 'Referencia',
                        width: 200,
                    },
                    BANCO_CARGO: {
                        text: 'Cargo',
                        width: 80,
                        cellsFormat: 'd2',
                        cellsAlign: 'right'
                    },
                    BANCO_ABONO: {
                        text: 'Abono',
                        width: 80,
                        cellsFormat: 'd2',
                        cellsAlign: 'right'
                    },
                    BANCO_OPERACION: {
                        text: '#Operación',
                        width: 100,
                    },
                    CONCILIADO: {
                        text: '',
                        width: 30,
                        columntype: 'checkbox',
                    },
                    NRO_CONCILIADO: {
                        text: '#Conciliación',
                        width: 100,
                    },
                    SISTEMA_NRO_OPERACION: {
                        text: 'Nro. voucher',
                        width: 100,
                    },
                    SISTEMA_DESCRIPCION: {
                        text: 'Descripción',
                        width: 100,
                    },
                    SISTEMA_NUMERO: {
                        text: 'Número',
                        width: 100,
                    },
                    SISTEMA_FECHA_BANCO: {
                        text: 'Fecha',
                        width: 100,
                        cellsAlign: 'center'
                    },
                    SISTEMA_CARGO: {
                        text: 'Cargo',
                        width: 80,
                        cellsFormat: 'd2',
                        cellsAlign: 'right'
                    },
                    SISTEMA_ABONO: {
                        text: 'Abono',
                        width: 80,
                        cellsFormat: 'd2',
                        cellsAlign: 'right'
                    },
                    NOMBRE_TIPO_MOVIMIENTO: {
                        text: 'Tipo mov.',
                        width: 200,
                    },
                },
                config: { pageable: true, sortable: true, height: 450, pageSize: 100 }
            });
            $(table).on('rowdoubleclick', function (event) {
                var args = event.args;
                var boundIndex = args.rowindex;

                const row = $(table).jqxGrid('getrows')[boundIndex];
                const c_movimiento = row['C_MOVIMIENTO'];
                const cod_tipo = row['COD_TIPO'];

                fnEditarMovimiento(c_movimiento, cod_tipo);
            });
            $(tableBanco).CreateGrid({
                query: 'tbl_caja_procesos_conciliacionbancaria_banco_noencontrado',
                items: {
                    C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                    ANIO: function () {
                        return $(_controls.ANIO).val();
                    },
                    MES: function () {
                        return $(_controls.MES).val();
                    },
                    C_BANCO: function () {
                        return $(_controls.C_BANCO).val();
                    },
                    C_CUENTA_BANCARIA: function () {
                        return $(_controls.C_CUENTA_BANCARIA).val();
                    },
                },
                columns: {
                    FECHA_OPERACION: {
                        text: 'Fec. Operación',
                        width: 100,
                        cellsAlign: 'center'
                    },
                    FECHA_PROCESO: {
                        text: 'Fec. Proceso',
                        width: 100,
                        cellsAlign: 'center'
                    },
                    REFERENCIA: {
                        text: 'Referencia',
                        width: 200,
                    },
                    CARGO: {
                        text: 'Cargo',
                        width: 80,
                        cellsFormat: 'd2',
                        cellsAlign: 'right'
                    },
                    ABONO: {
                        text: 'Abono',
                        width: 80,
                        cellsFormat: 'd2',
                        cellsAlign: 'right'
                    },
                    OPERACION: {
                        text: '#Operación',
                        width: 100,
                    },
                },
                config: { pageable: true, sortable: true, height: 300, pageSize: 100 }
            });
            $(tableSistema).CreateGrid({
                query: 'tbl_caja_procesos_conciliacionbancaria_sistema_noencontrado',
                hiddens: ['COD_TIPO', 'C_MOVIMIENTO'],
                items: {
                    C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                    ANIO: function () {
                        return $(_controls.ANIO).val();
                    },
                    MES: function () {
                        return $(_controls.MES).val();
                    },
                    C_BANCO: function () {
                        return $(_controls.C_BANCO).val();
                    },
                    C_CUENTA_BANCARIA: function () {
                        return $(_controls.C_CUENTA_BANCARIA).val();
                    },
                },
                columns: {
                    FECHA_OPERACION: {
                        text: 'Fec. Operación',
                        width: 100,
                        cellsAlign: 'center'
                    },
                    FECHA_PROCESO: {
                        text: 'Fec. Proceso',
                        width: 100,
                        cellsAlign: 'center'
                    },
                    REFERENCIA: {
                        text: 'Referencia',
                        width: 200,
                    },
                    CARGO: {
                        text: 'Cargo',
                        width: 80,
                        cellsFormat: 'd2',
                        cellsAlign: 'right'
                    },
                    ABONO: {
                        text: 'Abono',
                        width: 80,
                        cellsFormat: 'd2',
                        cellsAlign: 'right'
                    },
                    OPERACION: {
                        text: '#Operación',
                        width: 100,
                    },
                },
                config: { pageable: true, sortable: true, height: 300, pageSize: 100 }
            });
            $(tableSistema).on('rowdoubleclick', function (event) {
                var args = event.args;
                var boundIndex = args.rowindex;

                const row = $(tableSistema).jqxGrid('getrows')[boundIndex];
                const c_movimiento = row['C_MOVIMIENTO'];
                const cod_tipo = row['COD_TIPO'];

                fnEditarMovimiento(c_movimiento, cod_tipo);
            });
        }

        $(frm).ValidForm({
            type: -1,
            onDone: function (form, controls) {
                _controls = controls;

                $(controls.C_BANCO).change(function () {
                    $(controls.C_CUENTA_BANCARIA).attr('data-C_BANCO', $(controls.C_BANCO).val());
                    $(controls.C_CUENTA_BANCARIA).FieldLoadRemote()
                });

                $(controls.MES).change(function () {
                    var mes = $(controls.MES).val();
                    mes = '00' + mes;
                    mes = mes.substring(mes.length - 2, mes.length)
                    $(controls.MES).val(mes);
                });

                $(actions).CreateActions({
                    text: 'Acciones',
                    class: 'btn btn-sm btn-orange',
                    actions: {
                        'Importar archivo': {
                            callback: function () {
                                if (
                                    $(_controls.ANIO).val() == '' ||
                                    $(_controls.ANIO).val() == '' ||
                                    $(_controls.ANIO).val() == '' ||
                                    $(_controls.ANIO).val() == ''
                                ) {
                                    alertify.error('Por favor completar los campos obligatorios');
                                    return;
                                }

                                var rowsLenght = $(table).jqxGrid('getrows').filter(x => x['NRO_CONCILIADO'] != '').length
                                if (rowsLenght > 0) {
                                    alertify.warning('Ya ha conciliado este periodo');
                                    return;
                                }
                                fnImportarArchivo();
                            }
                        },
                        'Conciliar': {
                            callback: function () {
                                if ($(table).jqxGrid('getrows').length == 0) {
                                    alertify.warning('No hay registros para conciliar');
                                    return;
                                }

                                fnConciliarRegistros();
                            }
                        },
                        'Saldo inicial': {
                            callback: fnVerSaldoInicial
                        }
                    }
                })

                fnCrearTabla();
            },
            onReady: function () {
                $.GetQuery({
                    query: ['gbl_procesar_conciliacion_sistema_vs_banco'],
                    items: [{
                        C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                        ANIO: function () {
                            return $(_controls.ANIO).val();
                        },
                        MES: function () {
                            return $(_controls.MES).val();
                        },
                        C_BANCO: function () {
                            return $(_controls.C_BANCO).val();
                        },
                        C_CUENTA_BANCARIA: function () {
                            return $(_controls.C_CUENTA_BANCARIA).val();
                        },
                    }],
                    onBefore: function () {
                        $.DisplayStatusBar({ message: 'Obteniendo información' });
                    },
                    onReady: function (result) {
                        $(table).jqxGrid('updatebounddata')
                        $(tableBanco).jqxGrid('updatebounddata')
                        $(tableSistema).jqxGrid('updatebounddata')
                        $.CloseStatusBar();
                    }
                })
            }
        })

    });
});