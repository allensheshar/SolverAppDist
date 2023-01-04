require(["helper", "extras", "datetimepicker"], function () {
    require(["alertify", "bootbox", "moment"], function (alertify, bootbox, moment) {
        const c_empresa = $.solver.session.SESSION_EMPRESA;

        $('#_desde, #_hasta').datetimepicker({
            format: 'DD/MM/YYYY',
            locale: 'es'
        });
        $('.clsEmpresa').attr('data-c_empresa', c_empresa);

        const fnObtenerEmpresa = function () {
            $.GetQuery({
                query: ['q_ventas_procesos_nuevaventa_consultarempresa'],
                items: [{
                    C_EMPRESA: c_empresa
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

        fnObtenerEmpresa();


        /* -- SEG COMPRA  --*/
        const fnCrearTablaSegCompra = function () {
            $('#tblSegCompras').CreateGrid({
                query: 'q_logistica_reportes_segpedidosxfechas',
                items: {
                    C_EMPRESA: c_empresa,
                    ANIO: function () {
                        return $('form[name=frmSegCompras] #_anio').val() || '';
                    },
                    MES: function () {
                        return $('form[name=frmSegCompras] #_mes').val() || '';
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
                    'PROVEEDOR': {
                        width: 300
                    },
                    'ORDEN DE COMPRA': {
                        width: 100,
                        cellsAlign: 'center',
                        aggregates: ['sum'], aggregatesRenderer: function (aggregates, column, element) {
                            var formatNumber = aggregates.sum;
                            if (formatNumber === undefined)
                                formatNumber = '';
                            return `<div class="h-30 d-flex justify-content-center align-items-center font-weight-bold">
                                <strong id="totalDineroRecibido"> ${formatNumber} </strong>
                            </div>`;
                        }
                    },
                    'PEDIDOS': {
                        width: 100,
                        cellsAlign: 'center',
                        aggregates: ['sum'], aggregatesRenderer: function (aggregates, column, element) {
                            var formatNumber = aggregates.sum;
                            if (formatNumber === undefined)
                                formatNumber = '';
                            return `<div class="h-30 d-flex justify-content-center align-items-center font-weight-bold">
                                <strong id="totalDineroRecibido"> ${formatNumber} </strong>
                            </div>`;
                        }
                    },
                    'GUIAS': {
                        width: 100,
                        cellsAlign: 'center',
                        aggregates: ['sum'], aggregatesRenderer: function (aggregates, column, element) {
                            var formatNumber = aggregates.sum;
                            if (formatNumber === undefined)
                                formatNumber = '';
                            return `<div class="h-30 d-flex justify-content-center align-items-center font-weight-bold">
                                <strong id="totalDineroRecibido"> ${formatNumber} </strong>
                            </div>`;
                        }
                    },
                    'FACTURADAS': {
                        width: 100,
                        cellsAlign: 'center',
                        aggregates: ['sum'], aggregatesRenderer: function (aggregates, column, element) {
                            var formatNumber = aggregates.sum;
                            if (formatNumber === undefined)
                                formatNumber = '';
                            return `<div class="h-30 d-flex justify-content-center align-items-center font-weight-bold">
                                <strong id="totalDineroRecibido"> ${formatNumber} </strong>
                            </div>`;
                        }
                    }
                },
                config: {
                    virtualmode: false,
                    height: 550,
                    pageSize: 999999,
                    pageable: false,
                    sortable: false,
                    editable: false,
                    showaggregates: true,
                    showstatusbar: true,
                    statusbarheight: 20,
                }
            })
        }
        $('form[name=frmSegCompras]').ValidForm({
            type: -1,
            onDone: function () {
                $('#_mes').val($('#mes_actual').val());
                fnCrearTablaSegCompra();
                $('#btnDescargarSegCompras').click(function () {
                    $.DownloadFile({
                        query: 'q_logistica_reportes_segpedidosxfechas',
                        params: {
                            C_EMPRESA: c_empresa,
                            ANIO: function () {
                                return $('form[name=frmSegCompras] #_anio').val() || '';
                            },
                            MES: function () {
                                return $('form[name=frmSegCompras] #_mes').val() || '';
                            },
                        }
                    });
                });

                $('#lblPeriodo').text('Periodo: ' + $('#_anio').val())
                $('#lblMes').text('Mes: ' + $('#_mes')[0].args.data.filter(x => x['MES'] == $('#_mes').val())[0].NOMBRE);
            },
            onReady: function (result) {
                $('#tblSegCompras').jqxGrid('updatebounddata');

                $('#lblPeriodo').text('Periodo: ' + $('#_anio').val())
                $('#lblMes').text('Mes: ' + $('#_mes')[0].args.data.filter(x => x['MES'] == $('#_mes').val())[0].NOMBRE);
            }
        });
    });
});