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
                    var moneda = $('input:radio[name=moneda]:checked').val();
                    var presentacion = $('input:radio[name=presentacion]:checked').val();

                    $('#lblMoneda').html('Moneda: ' + moneda);
                    $('#lblPeriodo').html('Periodo: ' + $('#_desde').val() + ' - ' + $('#_hasta').val())

                    $('#t').html('<div id="table"></div>');

                    if (presentacion == 're') {
                        $(table).CreateGrid({
                            query: 'tbl_caja_reportes_reporteestadocuenta_resumen',
                            items: {
                                TIPO_CATALOGO: tipocatalogo,
                                PERSONA: function () {
                                    return $(controls.persona).val();
                                },
                                MONEDA: function () {
                                    return moneda
                                },
                                //CENTRO_COSTO: function () {
                                //    return $(controls.centrocosto).val();
                                //},
                                //VENDEDOR: function () {
                                //    return $(controls.vendedor).val();
                                //},
                                DESDE: function () {
                                    return $('#_desde').val();
                                },
                                HASTA: function () {
                                    return $('#_hasta').val();
                                },
                                C_EMPRESA: c_empresa
                            },
                            hiddens: ['N°'],
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
                                'R.U.C.': { width: 120 },
                                'Descripción': { width: 300 },
                                'Total': {
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
                            },
                            config: {
                                showaggregates: true,
                                showstatusbar: true,
                                statusbarheight: 20,
                                rendered: function () {
                                }
                            }
                        });
                    }
                    else {
                        $(table).CreateGrid({
                            query: 'tbl_caja_reportes_reporteestadocuenta_detallado',
                            items: {
                                TIPO_CATALOGO: tipocatalogo,
                                PERSONA: function () {
                                    return $(controls.persona).val();
                                },
                                MONEDA: function () {
                                    return moneda
                                },
                                //CENTRO_COSTO: function () {
                                //    return $(controls.centrocosto).val();
                                //},
                                //VENDEDOR: function () {
                                //    return $(controls.vendedor).val();
                                //},
                                DESDE: function () {
                                    return $('#_desde').val();
                                },
                                HASTA: function () {
                                    return $('#_hasta').val();
                                },
                                C_EMPRESA: c_empresa
                            },
                            hiddens: ['N°'],
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
                                'Tipo': { width: 100, cellsAlign: 'center' },
                                'Emisión': { width: 100, cellsAlign: 'center' },
                                'Vencimiento': { width: 100, cellsAlign: 'center' },
                                'Comprobante': { width: 100 },
                                'Moneda': { width: 60, cellsAlign: 'center' },
                                'Importe': {
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

                            },
                            config: {
                                showaggregates: true,
                                showstatusbar: true,
                                statusbarheight: 20,
                                rendered: function () {
                                }
                            }
                        });
                    }

                    $(modal).modal('hide');

                },
                onDone: function (_, controls) {

                    $('#_desde, #_hasta').datetimepicker({
                        format: 'DD/MM/YYYY',
                        locale: 'es'
                    });

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


                }
            });
        });

        fnObtenerEmpresa();

        $('#btnFiltros').trigger('click');

    });
}); 