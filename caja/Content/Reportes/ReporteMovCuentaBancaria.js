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

        $('.empresa').attr('data-C_EMPRESA', c_empresa)

        $('#btnFiltros').click(function () {
            $(modal).modal('show');

            $(frmEstadoCuenta).ValidForm({
                type: -1,
                onReady: function (_, controls) {

                    $('#lblPeriodo').html('Periodo: ' + $('#_desde').val() + ' - ' + $('#_hasta').val())
                    $('#lblBanco').html('Banco: ' + $('#_banco')[0].args.data.filter(x => x['C_BANCO'] == $('#_banco').val())[0].RAZON_SOCIAL)
                    var cuenta = $('#_cuenta')[0].args.data.filter(x => x['C_CUENTA_BANCARIA'] == $('#_cuenta').val())[0];
                    $('#lblCuenta').html('Cuenta: ' + cuenta.NUMERO_CUENTA_2)
                    $('#lblMoneda').html('Moneda: ' + cuenta.MONEDA)

                    $(table).CreateGrid({
                        query: 'tbl_caja_reportes_reportemovcuentabancaria',
                        items: {
                            C_BANCO: function () {
                                return $(controls.banco).val();
                            },
                            C_CUENTA_BANCARIA: function () {
                                return $(controls.cuenta).val();
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
                            'N° Voucher': { width: 80 },
                            'Descripción': { width: 300 },
                            'Número': { width: 100 },
                            'Fecha': { width: 80, cellsAlign: 'center' },
                            'Cargo': {
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
                            'Abono': {
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
                            'Tipo movimiento': { width: 200 },

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

                    $('#_desde, #_hasta').datetimepicker({
                        format: 'DD/MM/YYYY',
                        locale: 'es'
                    });

                    $(controls.banco).change(function () {

                        $(controls.cuenta).attr('data-query', 'gbl_obtener_numerocuentas_moneda');
                        $(controls.cuenta).attr('data-value', 'C_CUENTA_BANCARIA');
                        $(controls.cuenta).attr('data-field', 'NUMERO_CUENTA');
                        $(controls.cuenta).attr('data-C_BANCO', $(controls.banco).val());
                        $(controls.cuenta).attr('data-C_EMPRESA', c_empresa);
                        $(controls.cuenta).attr('data-textdefault', "-- Seleccione --");

                        $(controls.cuenta).FieldLoadRemote();

                    });

                    
                }
            });
        });

        fnObtenerEmpresa();
        $('#btnFiltros').trigger('click');

    });
}); 