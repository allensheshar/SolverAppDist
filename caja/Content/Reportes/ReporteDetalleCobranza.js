require(["helper", "extras", "datetimepicker"], function () {
    require(["alertify", "bootbox"], function (alertify, bootbox) {

        const modal = '#modalFiltro';
        const table = '#table'
        const c_empresa = $.solver.session.SESSION_EMPRESA;
        $('.empresa').attr('data-C_EMPRESA', c_empresa)

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

                    var moneda = $('input:radio[name=moneda]:checked').val();
                    $('#lblPeriodo').html(`Periodo: ${$(controls.anio).val()} - ${$(controls.mes).val()}`)
                    $('#lblMoneda').html(`Moneda: ${$('input:radio[name=moneda]:checked').val()}`)

                    $('#t').html('<div id="table"></div>');

                    $(table).CreateGrid({
                        query: 'tbl_caja_reportes_reportedetallecobranza',
                        items: {
                            MONEDA: function () {
                                return moneda
                            },
                            ANIO: function () {
                                return $(controls.anio).val();
                            },
                            MES: function () {
                                return $(controls.mes).val();
                            },
                            C_EMPRESA: c_empresa
                        },
                        columns: {
                            'Emisión': { width: 80, cellsAlign: 'center' },
                            'RUC o DNI': { width: 80 },
                            'Cliente': { width: 250 },
                            'Comprobante': { width: 100 },
                            'Moneda': {
                                text: '',
                                width: 30, },
                            'Monto Original': {
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
                                } },
                            'Cobranza': { width: 100, cellsAlign: 'center' },
                            'Soles': {
                                width: 60,
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
                                } },
                            'Dolares': {
                                width: 60,
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
                                } },
                            'Consolidado': {
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
                                }},
                            'Cuenta': { width: 100 },
                            'Forma de pago': { width: 140 },
                            'Descripción': { width: 150 },
                            'Número': { width: 80, cellsAlign: 'center' },
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
                    var mes = $('#mes_actual').val();
                    $('#_mes').val(mes).trigger('change');

                }
            });
        });

        $('#btnFiltros').trigger('click');
        fnObtenerEmpresa();
    });
}); 