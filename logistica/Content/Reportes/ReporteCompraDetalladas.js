require(["helper", "extras", "datetimepicker", "bootstrap-select"], function () {
    require(["alertify", "bootbox"], function (alertify, bootbox) {

        const c_empresa = $.solver.session.SESSION_EMPRESA;
        var filtros, query, titulo;

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
        const fnMostrarModal = function () {
            $.GetData({
                title: '<strong>Filtros</strong>',
                uriData: $.solver.baseUrl + '/Reportes/ModalDetallado/',
                location: 'float',
                type: 'GET',
                isPage: true,
                onReady: function (object, modal) {
                    $(modal).find('form[name=frm]').ValidForm({
                        type: -1,
                        onDone: function (_, controls) {
                            $(controls.mesfin).val($('#mes_actual').val())
                            $(controls.producto).selectpicker();
                            $(controls.proveedor).selectpicker();
                        },
                        onReady: function (_, controls) {
                            var representacion = $('input:radio[name=estadistico]:checked').val();
                            var moneda = $('input:radio[name=moneda]:checked').val();
                            $('#t').html('<div id="table"></div>');

                            if ($('#mes')[0].args.data.filter(x => x['MES'] == $('#mes').val())[0].NOMBRE == $('#mesfin')[0].args.data.filter(x => x['MES'] == $('#mesfin').val())[0].NOMBRE) {
                                $('#lblPeriodo').text('Periodo: ' + $('#mes')[0].args.data.filter(x => x['MES'] == $('#mes').val())[0].NOMBRE + ' ' + $('#_anio').val());
                            }
                            else {
                                $('#lblPeriodo').text('Periodo: ' + $('#mes')[0].args.data.filter(x => x['MES'] == $('#mes').val())[0].NOMBRE + ' a ' + $('#mesfin')[0].args.data.filter(x => x['MES'] == $('#mesfin').val())[0].NOMBRE + ' ' + $('#_anio').val());
                            }

                            $('#lblMoneda').text('Expresado en ' + moneda);
                            filtros = {
                                C_EMPRESA: c_empresa,
                                ANIO: $('#_anio').val(),
                                C_PRODUCTO: $('#_producto').val() || '',
                                CENTRO_COSTO: $('#_centro').val() || '',
                                C_PROVEEDOR: $('#_proveedor').val() || '',
                                MONEDA: moneda,
                                MES: $('#mes').val() || '',
                                MES_FIN: $('#mesfin').val() || ''
                            };
                            query = '';
                            titulo = '';
                            if (representacion == 'item') {
                                fnCrearItem(moneda);
                                query = 'tbl_logistica_reportes_detalladasxitem';
                                titulo = 'Reporte detallado por item'
                                $('#titulo').text(titulo);
                            }
                            else if (representacion == 'proveedor') {
                                fnCrearProveedor(moneda);
                                query = 'tbl_logistica_reportes_detalladaxproveedor';
                                titulo = 'Reporte detallado por proveedor'
                                $('#titulo').text(titulo);
                            }
                            else if (representacion == 'centro') {
                                fnCrearCentro(moneda);
                                query = 'tbl_logistica_reportes_detalladaxcentro';
                                titulo = 'Reporte detallado por centro de costo'
                                $('#titulo').text(titulo);
                            }
                        }
                    });
                }
            });
        }
        const fnCrearItem = function (moneda) {
            $('#table').CreateGrid({
                query: 'tbl_logistica_reportes_detalladasxitem',
                items: {
                    C_EMPRESA: c_empresa,
                    ANIO: function () {
                        return $('#_anio').val();
                    },
                    C_PRODUCTO: function () {
                        return $('#_producto').val() || '';
                    },
                    CENTRO_COSTO: function () {
                        return $('#_centro').val() || '';
                    },
                    C_PROVEEDOR: function () {
                        return $('#_proveedor').val() || '';
                    },
                    MONEDA: function () {
                        return moneda
                    },
                    MES: function () {
                        return $('#mes').val() || '';
                    },
                    MES_FIN: function () {
                        return $('#mesfin').val() || '';
                    }
                },
                columns: {
                    '_rowNum': {
                        text: 'N°',
                        width: '30',
                        cellsAlign: 'center',
                        hidden: false,
                        pinned: true,
                        editable: false,
                        sortable: false
                    },
                    'Nombre': {
                        width: 400, aggregatesRenderer: function (aggregates, column, element) {
                            var formatNumber = aggregates.sum;
                            if (formatNumber === undefined)
                                formatNumber = '';
                            return `<div class="h-30 d-flex justify-content-center align-items-center font-weight-bold">
                                <strong id="totalDineroRecibido"> TOTAL </strong>
                            </div>`;
                        }
                    },
                    'Subtotal': {
                        width: 150,
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
                    'Igv': {
                        width: 150,
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
                    'Total': {
                        width: 150,
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
                    '%': {
                        width: 80,
                        cellsrenderer: function (row, columnfield, value, defaulthtml, columnproperties) {
                            var filas = $('#table').jqxGrid('getrows');
                            var num = filas[row].Total;

                            var total = 0;
                            $.each(filas, function (i, v) {
                                total += v.Total;
                            });

                            return '<div class="jqx-grid-cell-middle-align" style="margin-top: 4px;">' + ((num / total) * 100).toFixed(2) + '%</div>'
                        },
                        aggregates: ['sum'], aggregatesRenderer: function (aggregates, column, element) {
                            var formatNumber = aggregates.sum;
                            if (formatNumber === undefined)
                                formatNumber = '';


                            return `<div class="h-30 d-flex justify-content-center align-items-center font-weight-bold">
                                <strong id="totalDineroRecibido"> 100%</strong>
                            </div>`;
                        }
                    }
                },
                config: {
                    virtualmode: false,
                    height: 550,
                    pageSize: 999999,
                    sortable: false,
                    editable: false,
                    showaggregates: true,
                    showstatusbar: true,
                    statusbarheight: 20,
                    rendered: function () {
                        bootbox.hideAll();
                    }
                }
            })
        }
        const fnCrearProveedor = function (moneda) {
            $('#table').CreateGrid({
                query: 'tbl_logistica_reportes_detalladaxproveedor',
                items: {
                    C_EMPRESA: c_empresa,
                    ANIO: function () {
                        return $('#_anio').val();
                    },
                    C_PRODUCTO: function () {
                        return $('#_producto').val() || '';
                    },
                    CENTRO_COSTO: function () {
                        return $('#_centro').val() || '';
                    },
                    C_PROVEEDOR: function () {
                        return $('#_proveedor').val() || '';
                    },
                    MONEDA: function () {
                        return moneda
                    },
                    MES: function () {
                        return $('#mes').val() || '';
                    },
                    MES_FIN: function () {
                        return $('#mesfin').val() || '';
                    }
                },
                columns: {
                    '_rowNum': {
                        text: 'N°',
                        width: '30',
                        cellsAlign: 'center',
                        hidden: false,
                        pinned: true,
                        editable: false,
                        sortable: false
                    },
                    'Nombre': {
                        width: 400, aggregatesRenderer: function (aggregates, column, element) {
                            var formatNumber = aggregates.sum;
                            if (formatNumber === undefined)
                                formatNumber = '';
                            return `<div class="h-30 d-flex justify-content-center align-items-center font-weight-bold">
                                <strong id="totalDineroRecibido"> TOTAL </strong>
                            </div>`;
                        }
                    },
                    'Total': {
                        width: 150,
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
                    '%': {
                        width: 80,
                        cellsrenderer: function (row, columnfield, value, defaulthtml, columnproperties) {
                            var filas = $('#table').jqxGrid('getrows');
                            var num = filas[row].Total;

                            var total = 0;
                            $.each(filas, function (i, v) {
                                total += v.Total;
                            });

                            return '<div class="jqx-grid-cell-middle-align" style="margin-top: 4px;">' + ((num / total) * 100).toFixed(2) + '%</div>'
                        },
                        aggregates: ['sum'], aggregatesRenderer: function (aggregates, column, element) {
                            var formatNumber = aggregates.sum;
                            if (formatNumber === undefined)
                                formatNumber = '';


                            return `<div class="h-30 d-flex justify-content-center align-items-center font-weight-bold">
                                <strong id="totalDineroRecibido"> 100%</strong>
                            </div>`;
                        }
                    }
                },
                config: {
                    virtualmode: false,
                    height: 550,
                    pageSize: 999999,
                    sortable: false,
                    editable: false,
                    showaggregates: true,
                    showstatusbar: true,
                    statusbarheight: 20,
                    rendered: function () {
                        bootbox.hideAll();
                    }
                }
            })
        }
        const fnCrearCentro = function (moneda) {
            $('#table').CreateGrid({
                query: 'tbl_logistica_reportes_detalladaxcentro',
                items: {
                    C_EMPRESA: c_empresa,
                    ANIO: function () {
                        return $('#_anio').val();
                    },
                    C_PRODUCTO: function () {
                        return $('#_producto').val() || '';
                    },
                    CENTRO_COSTO: function () {
                        return $('#_centro').val() || '';
                    },
                    C_PROVEEDOR: function () {
                        return $('#_proveedor').val() || '';
                    },
                    MONEDA: function () {
                        return moneda
                    },
                    MES: function () {
                        return $('#mes').val() || '';
                    },
                    MES_FIN: function () {
                        return $('#mesfin').val() || '';
                    }
                },
                columns: {
                    '_rowNum': {
                        text: 'N°',
                        width: '30',
                        cellsAlign: 'center',
                        hidden: false,
                        pinned: true,
                        editable: false,
                        sortable: false
                    },
                    'Nombre': {
                        width: 400, aggregatesRenderer: function (aggregates, column, element) {
                            var formatNumber = aggregates.sum;
                            if (formatNumber === undefined)
                                formatNumber = '';
                            return `<div class="h-30 d-flex justify-content-center align-items-center font-weight-bold">
                                <strong id="totalDineroRecibido"> TOTAL </strong>
                            </div>`;
                        }
                    },
                    'Total': {
                        width: 150,
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
                    '%': {
                        width: 80,
                        cellsrenderer: function (row, columnfield, value, defaulthtml, columnproperties) {
                            var filas = $('#table').jqxGrid('getrows');
                            var num = filas[row].Total;

                            var total = 0;
                            $.each(filas, function (i, v) {
                                total += v.Total;
                            });

                            return '<div class="jqx-grid-cell-middle-align" style="margin-top: 4px;">' + ((num / total) * 100).toFixed(2) + '%</div>'
                        },
                        aggregates: ['sum'], aggregatesRenderer: function (aggregates, column, element) {
                            var formatNumber = aggregates.sum;
                            if (formatNumber === undefined)
                                formatNumber = '';


                            return `<div class="h-30 d-flex justify-content-center align-items-center font-weight-bold">
                                <strong id="totalDineroRecibido"> 100%</strong>
                            </div>`;
                        }
                    }
                },
                config: {
                    virtualmode: false,
                    height: 550,
                    pageSize: 999999,
                    sortable: false,
                    editable: false,
                    showaggregates: true,
                    showstatusbar: true,
                    statusbarheight: 20,
                    rendered: function () {
                        bootbox.hideAll();
                    }
                }
            })
        }

        fnMostrarModal();

        $('#btnFiltros').click(function () {
            fnMostrarModal();
        })
        $('#btnDescargarExcel').click(function () {
            if (query != '') {
                $.DownloadFile({
                    nameFile: titulo,
                    query: query,
                    params: filtros
                });
            }
        })
    });
});

