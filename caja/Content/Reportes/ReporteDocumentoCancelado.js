require(["helper", "extras", "datetimepicker"], function () {
    require(["alertify", "bootbox"], function (alertify, bootbox) {

        const modal = '#modalFiltro';
        const table = '#table'
        const c_empresa = $.solver.session.SESSION_EMPRESA;

        const fnObtenerEmpresa = function () {
            $.GetQuery({
                query: ['q_ventas_procesos_nuevaventa_consultarempresa'],
                items: [{
                    C_EMPRESA: $.solver.session.SESSION_EMPRESA
                }],
                onError: function (error) {
                    $.ShowError({ error: error });
                },
                onReady: function (result) {
                    if (result.length > 0) {
                        const data = result[0];
                        $('#lblEmpresa').text('Empresa: ' + data.RAZON_SOCIAL)
                        $('#lblRuc').text('RUC: ' + data.NRO_DOCUMENTO)
                    }
                }
            });

            $.solver.fn.getImageLogoCompany('#IMAGEN_EMPRESA');
        }

        $('#btnFiltros').click(function () {
            $(modal).modal('show');

            $(frmEstadoCuenta).ValidForm({
                type: -1,
                onReady: function (_, controls) {

                    var tipocatalogo = $('input:radio[name=tipocatalogo]:checked').val();

                    $('#lblPeriodo').html(`Periodo: ${$('#_desde').val()} - ${$('#_hasta').val()}`)

                    $('#t').html('<div id="table"></div>');

                    $(table).CreateGrid({
                        query: 'tbl_caja_reportes_reportedocumentoscancelados',
                        items: {
                            TIPO_CATALOGO: tipocatalogo,
                            PERSONA: function () {
                                return $(controls.persona).val();
                            },
                            DESDE: function () {
                                return $('#_desde').val();
                            },
                            HASTA: function () {
                                return $('#_hasta').val();
                            },
                            C_EMPRESA: c_empresa
                        },
                        columns: {
                            'Fecha': { width: 80, cellsAlign: 'center' },
                            'Catálogo': { width: 220 },
                            'Tipo Comprobante': { width: 110 },
                            'Nro Comprobante': { width: 110 },
                            'Fecha Banco': {
                                text: 'Fec. de Cancelación',
                                width: 100,
                                cellsAlign: 'center'
                            },
                            'Nro Voucher': { width: 80 },
                            'M. Soles': {
                                width: 80,
                                cellsAlign: 'right',
                                cellsFormat: 'd2',
                                columnType: 'numberinput',
                                aggregates: ['sum'], aggregatesRenderer: function (aggregates, column, element) {
                                    var formatNumber = aggregates.sum;
                                    if (formatNumber === undefined)
                                        formatNumber = '';
                                    return `<div class="h-30 d-flex justify-content-center align-items-center font-weight-bold">
                                <strong id="totalDineroRecibido"> ${formatNumber} </strong>
                            </div>`;
                                }
                            },
                            'M. Dolares': {
                                width: 80,
                                cellsAlign: 'right',
                                cellsFormat: 'd2',
                                columnType: 'numberinput',
                                aggregates: ['sum'], aggregatesRenderer: function (aggregates, column, element) {
                                    var formatNumber = aggregates.sum;
                                    if (formatNumber === undefined)
                                        formatNumber = '';
                                    return `<div class="h-30 d-flex justify-content-center align-items-center font-weight-bold">
                                <strong id="totalDineroRecibido"> ${formatNumber} </strong>
                            </div>`;
                                }
                            },
                            'Cargo S/.': {
                                width: 80,
                                cellsAlign: 'right',
                                cellsFormat: 'd2',
                                columnType: 'numberinput',
                                aggregates: ['sum'], aggregatesRenderer: function (aggregates, column, element) {
                                    var formatNumber = aggregates.sum;
                                    if (formatNumber === undefined)
                                        formatNumber = '';
                                    return `<div class="h-30 d-flex justify-content-center align-items-center font-weight-bold">
                                <strong id="totalDineroRecibido"> ${formatNumber} </strong>
                            </div>`;
                                }
                            },
                            'Abono S/.': {
                                width: 80,
                                cellsAlign: 'right',
                                cellsFormat: 'd2',
                                columnType: 'numberinput',
                                aggregates: ['sum'], aggregatesRenderer: function (aggregates, column, element) {
                                    var formatNumber = aggregates.sum;
                                    if (formatNumber === undefined)
                                        formatNumber = '';
                                    return `<div class="h-30 d-flex justify-content-center align-items-center font-weight-bold">
                                <strong id="totalDineroRecibido"> ${formatNumber} </strong>
                            </div>`;
                                }
                            },
                            'Cargo US$': {
                                width: 80,
                                cellsAlign: 'right',
                                cellsFormat: 'd2',
                                columnType: 'numberinput',
                                aggregates: ['sum'], aggregatesRenderer: function (aggregates, column, element) {
                                    var formatNumber = aggregates.sum;
                                    if (formatNumber === undefined)
                                        formatNumber = '';
                                    return `<div class="h-30 d-flex justify-content-center align-items-center font-weight-bold">
                                <strong id="totalDineroRecibido"> ${formatNumber} </strong>
                            </div>`;
                                }
                            },
                            'Abono US$': {
                                width: 80,
                                cellsAlign: 'right',
                                cellsFormat: 'd2',
                                columnType: 'numberinput',
                                aggregates: ['sum'], aggregatesRenderer: function (aggregates, column, element) {
                                    var formatNumber = aggregates.sum;
                                    if (formatNumber === undefined)
                                        formatNumber = '';
                                    return `<div class="h-30 d-flex justify-content-center align-items-center font-weight-bold">
                                <strong id="totalDineroRecibido"> ${formatNumber} </strong>
                            </div>`;
                                }
                            },
                            'Total Cargos S/.': {
                                width: 100,
                                cellsAlign: 'right',
                                cellsFormat: 'd2',
                                columnType: 'numberinput',
                                aggregates: ['sum'], aggregatesRenderer: function (aggregates, column, element) {
                                    var formatNumber = aggregates.sum;
                                    if (formatNumber === undefined)
                                        formatNumber = '';
                                    return `<div class="h-30 d-flex justify-content-center align-items-center font-weight-bold">
                                <strong id="totalDineroRecibido"> ${formatNumber} </strong>
                            </div>`;
                                }
                            },
                            'Total Abonos S/.': {
                                width: 100,
                                cellsAlign: 'right',
                                cellsFormat: 'd2',
                                columnType: 'numberinput',
                                aggregates: ['sum'], aggregatesRenderer: function (aggregates, column, element) {
                                    var formatNumber = aggregates.sum;
                                    if (formatNumber === undefined)
                                        formatNumber = '';
                                    return `<div class="h-30 d-flex justify-content-center align-items-center font-weight-bold">
                                <strong id="totalDineroRecibido"> ${formatNumber} </strong>
                            </div>`;
                                }
                            },
                            'Bancos': {
                                width: 220,
                            },
                            'Cheque': {
                                width: 100
                            }
                        },
                        config: {
                            showaggregates: true,
                            showstatusbar: true,
                            statusbarheight: 20,
                            rendered: function () {
                            }
                        }
                    });

                    $(modal).modal('hide');

                },
                onDone: function (_, controls) {

                    $('#_ven').change(function () {
                        $('#_persona').attr('data-query', 'cb_ventas_procesos_filtroventa_listarclientes');
                        $('#_persona').attr('data-value', 'C_CLIENTE');
                        $('#_persona').attr('data-field', 'RAZON_SOCIAL');
                        $('#_persona').FieldLoadRemote();
                    })

                    $('#_com').change(function () {
                        $('#_persona').attr('data-query', 'cb_ventas_procesos_filtrocompras_listarproveedores');
                        $('#_persona').attr('data-value', 'C_PROVEEDOR');
                        $('#_persona').attr('data-field', 'RAZON_SOCIAL');
                        $('#_persona').FieldLoadRemote();
                    })

                    $('#_desde, #_hasta').datetimepicker({
                        format: 'DD/MM/YYYY',
                        locale: 'es'
                    });

                }
            });
        });
        fnObtenerEmpresa();

        $('#btnFiltros').trigger('click');

    });
});