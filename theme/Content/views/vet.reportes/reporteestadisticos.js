require(["helper", "extras", "datetimepicker", "jqwidgets"], function () {
    require(["alertify", "bootbox", "numeral", "moment"], function (alertify, bootbox, numeral, moment) {
        var pdv = '';
        if ($.solver.basePath == '/puntoventa') pdv = '*';
        var isRendered = false;

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
                uriData: $.solver.baseUrl + '/Reportes/ModalEstadistico/',
                location: 'float',
                type: 'GET',
                isPage: true,
                onReady: function (object, modal) {

                    if ($.solver.basePath == '/ventas') {
                        $('#caj').parent().hide();
                    }

                    $(modal).find('form[name=frm]').ValidForm({
                        type: -1,
                        onDone: function () {
                            if (pdv == '*') {
                                $('.caja').show();
                            }
                        },
                        onReady: function (_, controls) {
                            var representacion = $('input:radio[name=estadistico]:checked').val();
                            var moneda = $('input:radio[name=moneda]:checked').val();
                            $('#t').html('<div id="table"></div>');

                            $('#lblPeriodo').text('Periodo: ' + $('#_anio').val());
                            $('#lblMoneda').text('Expresado en ' + moneda);

                            filtros = {
                                C_EMPRESA: c_empresa,
                                ANIO: $('#_anio').val() || '',
                                C_PRODUCTO: $('#_producto').val() || '',
                                CENTRO_COSTO: $('#_centro').val() || '',
                                C_CLIENTE: $('#_cliente').val() || '',
                                VENDEDOR: $('#_vendedor').val() || '',
                                MONEDA: moneda,
                                C_ESTABLECIMIENTO: $('#_establecimiento').val() || '',
                                BASE: $.solver.basePath,
                                C_CAJA: $('#_caja').val() || ''
                            };
                            query = '';
                            if (representacion == 'item') {
                                fnCrearItem(moneda);
                                query = 'q_ventas_reportes_estadisticoxitem'
                                titulo = 'Reporte estadístico por item';
                                $('#titulo').text(titulo);
                            }
                            else if (representacion == 'cliente') {
                                fnCrearCliente(moneda);
                                query = 'q_ventas_reportes_estadisticoxcliente'
                                titulo = 'Reporte estadístico por cliente';
                                $('#titulo').text(titulo);
                            }
                            else if (representacion == 'vendedor') {
                                fnCrearVendedor(moneda);
                                query = 'q_ventas_reportes_estadisticoxvendedor';
                                titulo = 'Reporte estadístico por vendedor';
                                $('#titulo').text(titulo);
                            }
                            else if (representacion == 'clienteitem') {
                                fnCrearClienteItem(moneda);
                                query = 'q_ventas_reportes_estadisticoxclienteitem'
                                titulo = 'Reporte estadístico por cliente item';
                                $('#titulo').text(titulo);
                            }
                            else if (representacion == 'centro') {
                                fnCrearCentro(moneda);
                                query = 'q_ventas_reportes_estadisticoxcentro'
                                titulo = 'Reporte estadístico por centro de costo';
                                $('#titulo').text(titulo);
                            }
                            else if (representacion == 'establecimiento') {
                                fnCrearEstablecimiento(moneda);
                                query = 'q_ventas_reportes_estadisticoxestablecimiento'
                                titulo = 'Reporte estadístico por establecimiento';
                                $('#titulo').text(titulo);
                            }
                            else if (representacion == 'caja') {
                                fnCrearCaja(moneda);
                                query = 'q_ventas_reportes_estadisticoxcaja'
                                titulo = 'Reporte estadístico por caja';
                                $('#titulo').text(titulo);
                            }
                        }
                    });
                }
            });
        };
        const fnCrearItem = function (moneda) {
            $('#table').CreateGrid({
                query: 'q_ventas_reportes_estadisticoxitem',
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
                    C_CLIENTE: function () {
                        return $('#_cliente').val() || '';
                    },
                    VENDEDOR: function () {
                        return $('#_vendedor').val() || '';
                    },
                    MONEDA: function () {
                        return moneda
                    },
                    C_ESTABLECIMIENTO: function () {
                        return $('#_establecimiento').val() || ''
                    },
                    BASE: $.solver.basePath,
                    C_CAJA: function () {
                        return $('#_caja').val() || ''
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
                    'Categoría': {
                        width: 200, aggregatesRenderer: function (aggregates, column, element) {
                            var formatNumber = aggregates.sum;
                            if (formatNumber === undefined)
                                formatNumber = '';
                            return `<div class="h-30 d-flex justify-content-center align-items-center font-weight-bold">
                                <strong id="totalDineroRecibido"> TOTAL </strong>
                            </div>`;
                        }
                    },
                    'Producto': {
                        width: 200
                    },
                    'Enero': {
                        sortable: false,
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
                    'Febrero': {
                        sortable: false,
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
                    'Marzo': {
                        sortable: false,
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
                    'Abril': {
                        sortable: false,
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
                    'Mayo': {
                        sortable: false,
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
                    'Junio': {
                        sortable: false,
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
                    'Julio': {
                        sortable: false,
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
                    'Agosto': {
                        sortable: false,
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
                    'Setiembre': {
                        sortable: false,
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
                    'Octubre': {
                        sortable: false,
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
                    'Noviembre': {
                        sortable: false,
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
                    'Diciembre': {
                        sortable: false,
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
                    'Total': {
                        sortable: false,
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
                                <strong id="totalDineroRecibido"> 100% </strong>
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
            });
        };
        const fnCrearCliente = function (moneda) {
            $('#table').CreateGrid({
                query: 'q_ventas_reportes_estadisticoxcliente',
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
                    C_CLIENTE: function () {
                        return $('#_cliente').val() || '';
                    },
                    VENDEDOR: function () {
                        return $('#_vendedor').val() || '';
                    },
                    MONEDA: function () {
                        return moneda
                    },
                    C_ESTABLECIMIENTO: function () {
                        return $('#_establecimiento').val() || ''
                    },
                    BASE: $.solver.basePath,
                    C_CAJA: function () {
                        return $('#_caja').val() || ''
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
                    'Razón social': {
                        width: 250, aggregatesRenderer: function (aggregates, column, element) {
                            var formatNumber = aggregates.sum;
                            if (formatNumber === undefined)
                                formatNumber = '';
                            return `<div class="h-30 d-flex justify-content-center align-items-center font-weight-bold">
                                <strong id="totalDineroRecibido"> TOTAL </strong>
                            </div>`;
                        }
                    },
                    'RUC': {
                        width: 100
                    },
                    'Enero': {
                        sortable: false,
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
                    'Febrero': {
                        sortable: false,
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
                    'Marzo': {
                        sortable: false,
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
                    'Abril': {
                        sortable: false,
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
                    'Mayo': {
                        sortable: false,
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
                    'Junio': {
                        sortable: false,
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
                    'Julio': {
                        sortable: false,
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
                    'Agosto': {
                        sortable: false,
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
                    'Setiembre': {
                        sortable: false,
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
                    'Octubre': {
                        sortable: false,
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
                    'Noviembre': {
                        sortable: false,
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
                    'Diciembre': {
                        sortable: false,
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
                    'Total': {
                        width: 100,
                        sortable: false,
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
            });
        };
        const fnCrearVendedor = function (moneda) {
            $('#table').CreateGrid({
                query: 'q_ventas_reportes_estadisticoxvendedor',
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
                    C_CLIENTE: function () {
                        return $('#_cliente').val() || '';
                    },
                    VENDEDOR: function () {
                        return $('#_vendedor').val() || '';
                    },
                    MONEDA: function () {
                        return moneda
                    },
                    C_ESTABLECIMIENTO: function () {
                        return $('#_establecimiento').val() || ''
                    },
                    BASE: $.solver.basePath,
                    C_CAJA: function () {
                        return $('#_caja').val() || ''
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
                    'Vendedor': {
                        width: 300, aggregatesRenderer: function (aggregates, column, element) {
                            var formatNumber = aggregates.sum;
                            if (formatNumber === undefined)
                                formatNumber = '';
                            return `<div class="h-30 d-flex justify-content-center align-items-center font-weight-bold">
                                <strong id="totalDineroRecibido"> TOTAL </strong>
                            </div>`;
                        }
                    },
                    'Enero': {
                        sortable: false,
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
                    'Febrero': {
                        sortable: false,
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
                    'Marzo': {
                        sortable: false,
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
                    'Abril': {
                        sortable: false,
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
                    'Mayo': {
                        sortable: false,
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
                    'Junio': {
                        sortable: false,
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
                    'Julio': {
                        sortable: false,
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
                    'Agosto': {
                        sortable: false,
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
                    'Setiembre': {
                        width: 100,
                        sortable: false,
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
                    'Octubre': {
                        sortable: false,
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
                    'Noviembre': {
                        sortable: false,
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
                    'Diciembre': {
                        sortable: false,
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
                    'Total': {
                        sortable: false,
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
                                <strong id="totalDineroRecibido"> 100% </strong>
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
            });
        };
        const fnCrearClienteItem = function (moneda) {
            $('#table').CreateGrid({
                query: 'q_ventas_reportes_estadisticoxclienteitem',
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
                    C_CLIENTE: function () {
                        return $('#_cliente').val() || '';
                    },
                    VENDEDOR: function () {
                        return $('#_vendedor').val() || '';
                    },
                    MONEDA: function () {
                        return moneda
                    },
                    C_ESTABLECIMIENTO: function () {
                        return $('#_establecimiento').val() || ''
                    },
                    BASE: $.solver.basePath,
                    C_CAJA: function () {
                        return $('#_caja').val() || ''
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
                    'Razón social': {
                        width: 250, aggregatesRenderer: function (aggregates, column, element) {
                            var formatNumber = aggregates.sum;
                            if (formatNumber === undefined)
                                formatNumber = '';
                            return `<div class="h-30 d-flex justify-content-center align-items-center font-weight-bold">
                                <strong id="totalDineroRecibido"> TOTAL </strong>
                            </div>`;
                        },
                    },
                    'RUC': {
                        width: 80,
                        cellsAlign: 'center'
                    },
                    'Vendedor': {
                        width: 160
                    },
                    'Categoría': {
                        width: 130
                    },
                    'Código producto': {
                        text: 'Cod. prod.',
                        width: 100
                    },
                    'Producto': {
                        width: 150
                    },
                    'Familia': {
                        width: 160
                    },
                    'Subfamilia': {
                        width: 160
                    },
                    'Enero': {
                        sortable: false,
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
                    'Febrero': {
                        sortable: false,
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
                    'Marzo': {
                        sortable: false,
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
                    'Abril': {
                        sortable: false,
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
                    'Mayo': {
                        sortable: false,
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
                    'Junio': {
                        sortable: false,
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
                    'Julio': {
                        sortable: false,
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
                    'Agosto': {
                        sortable: false,
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
                    'Setiembre': {
                        sortable: false,
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
                    'Octubre': {
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
                    'Noviembre': {
                        sortable: false,
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
                    'Diciembre': {
                        sortable: false,
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
                    'Total': {
                        sortable: false,
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
                },
                BASE: pdv,
                C_CAJA: function () {
                    return $('#_caja').val() || ''
                }
            });
        };
        const fnCrearCentro = function (moneda) {
            var _columns = {
                '_rowNum': {
                    text: 'N°',
                    width: '30',
                    cellsAlign: 'center',
                    hidden: false,
                    pinned: true,
                    editable: false,
                    sortable: false
                },
                'NOMBRE_2': {
                    text: 'Centro de costo'
                },
                'NOMBRE_1': {
                    text: 'Centro de costo'
                },

                'Centro de costo': {
                    width: 160, aggregatesRenderer: function (aggregates, column, element) {
                        var formatNumber = aggregates.sum;
                        if (formatNumber === undefined)
                            formatNumber = '';
                        return `<div class="h-30 d-flex justify-content-center align-items-center font-weight-bold">
                                <strong id="totalDineroRecibido"> TOTAL </strong>
                            </div>`;
                    }
                },
                //'Enero': {
                //    sortable: false,
                //    width: 100,
                //    cellsAlign: 'right',
                //    cellsFormat: 'd2',
                //    columnType: 'numberinput',
                //    aggregates: ['sum'], aggregatesRenderer: function (aggregates, column, element) {
                //        var formatNumber = aggregates.sum;
                //        if (formatNumber === undefined)
                //            formatNumber = '';
                //        return `<div class="h-30 d-flex justify-content-center align-items-center font-weight-bold">
                //                <strong id="totalDineroRecibido"> ${formatNumber} </strong>
                //            </div>`;
                //    }
                //},
                //'Febrero': {
                //    sortable: false,
                //    width: 100,
                //    cellsAlign: 'right',
                //    cellsFormat: 'd2',
                //    columnType: 'numberinput',
                //    aggregates: ['sum'], aggregatesRenderer: function (aggregates, column, element) {
                //        var formatNumber = aggregates.sum;
                //        if (formatNumber === undefined)
                //            formatNumber = '';
                //        return `<div class="h-30 d-flex justify-content-center align-items-center font-weight-bold">
                //                <strong id="totalDineroRecibido"> ${formatNumber} </strong>
                //            </div>`;
                //    }
                //},
                //'Marzo': {
                //    sortable: false,
                //    width: 100,
                //    cellsAlign: 'right',
                //    cellsFormat: 'd2',
                //    columnType: 'numberinput',
                //    aggregates: ['sum'], aggregatesRenderer: function (aggregates, column, element) {
                //        var formatNumber = aggregates.sum;
                //        if (formatNumber === undefined)
                //            formatNumber = '';
                //        return `<div class="h-30 d-flex justify-content-center align-items-center font-weight-bold">
                //                <strong id="totalDineroRecibido"> ${formatNumber} </strong>
                //            </div>`;
                //    }
                //},
                //'Abril': {
                //    sortable: false,
                //    width: 100,
                //    cellsAlign: 'right',
                //    cellsFormat: 'd2',
                //    columnType: 'numberinput',
                //    aggregates: ['sum'], aggregatesRenderer: function (aggregates, column, element) {
                //        var formatNumber = aggregates.sum;
                //        if (formatNumber === undefined)
                //            formatNumber = '';
                //        return `<div class="h-30 d-flex justify-content-center align-items-center font-weight-bold">
                //                <strong id="totalDineroRecibido"> ${formatNumber} </strong>
                //            </div>`;
                //    }
                //},
                //'Mayo': {
                //    sortable: false,
                //    width: 100,
                //    cellsAlign: 'right',
                //    cellsFormat: 'd2',
                //    columnType: 'numberinput',
                //    aggregates: ['sum'], aggregatesRenderer: function (aggregates, column, element) {
                //        var formatNumber = aggregates.sum;
                //        if (formatNumber === undefined)
                //            formatNumber = '';
                //        return `<div class="h-30 d-flex justify-content-center align-items-center font-weight-bold">
                //                <strong id="totalDineroRecibido"> ${formatNumber} </strong>
                //            </div>`;
                //    }
                //},
                //'Junio': {
                //    sortable: false,
                //    width: 100,
                //    cellsAlign: 'right',
                //    cellsFormat: 'd2',
                //    columnType: 'numberinput',
                //    aggregates: ['sum'], aggregatesRenderer: function (aggregates, column, element) {
                //        var formatNumber = aggregates.sum;
                //        if (formatNumber === undefined)
                //            formatNumber = '';
                //        return `<div class="h-30 d-flex justify-content-center align-items-center font-weight-bold">
                //                <strong id="totalDineroRecibido"> ${formatNumber} </strong>
                //            </div>`;
                //    }
                //},
                //'Julio': {
                //    sortable: false,
                //    width: 100,
                //    cellsAlign: 'right',
                //    cellsFormat: 'd2',
                //    columnType: 'numberinput',
                //    aggregates: ['sum'], aggregatesRenderer: function (aggregates, column, element) {
                //        var formatNumber = aggregates.sum;
                //        if (formatNumber === undefined)
                //            formatNumber = '';
                //        return `<div class="h-30 d-flex justify-content-center align-items-center font-weight-bold">
                //                <strong id="totalDineroRecibido"> ${formatNumber} </strong>
                //            </div>`;
                //    }
                //},
                //'Agosto': {
                //    sortable: false,
                //    width: 100,
                //    cellsAlign: 'right',
                //    cellsFormat: 'd2',
                //    columnType: 'numberinput',
                //    aggregates: ['sum'], aggregatesRenderer: function (aggregates, column, element) {
                //        var formatNumber = aggregates.sum;
                //        if (formatNumber === undefined)
                //            formatNumber = '';
                //        return `<div class="h-30 d-flex justify-content-center align-items-center font-weight-bold">
                //                <strong id="totalDineroRecibido"> ${formatNumber} </strong>
                //            </div>`;
                //    }
                //},
                //'Setiembre': {
                //    sortable: false,
                //    width: 100,
                //    cellsAlign: 'right',
                //    cellsFormat: 'd2',
                //    columnType: 'numberinput',
                //    aggregates: ['sum'], aggregatesRenderer: function (aggregates, column, element) {
                //        var formatNumber = aggregates.sum;
                //        if (formatNumber === undefined)
                //            formatNumber = '';
                //        return `<div class="h-30 d-flex justify-content-center align-items-center font-weight-bold">
                //                <strong id="totalDineroRecibido"> ${formatNumber} </strong>
                //            </div>`;
                //    }
                //},
                //'Octubre': {
                //    width: 100,
                //    cellsAlign: 'right',
                //    cellsFormat: 'd2',
                //    columnType: 'numberinput',
                //    aggregates: ['sum'], aggregatesRenderer: function (aggregates, column, element) {
                //        var formatNumber = aggregates.sum;
                //        if (formatNumber === undefined)
                //            formatNumber = '';
                //        return `<div class="h-30 d-flex justify-content-center align-items-center font-weight-bold">
                //                <strong id="totalDineroRecibido"> ${formatNumber} </strong>
                //            </div>`;
                //    }
                //},
                //'Noviembre': {
                //    sortable: false,
                //    width: 100,
                //    cellsAlign: 'right',
                //    cellsFormat: 'd2',
                //    columnType: 'numberinput',
                //    aggregates: ['sum'], aggregatesRenderer: function (aggregates, column, element) {
                //        var formatNumber = aggregates.sum;
                //        if (formatNumber === undefined)
                //            formatNumber = '';
                //        return `<div class="h-30 d-flex justify-content-center align-items-center font-weight-bold">
                //                <strong id="totalDineroRecibido"> ${formatNumber} </strong>
                //            </div>`;
                //    }
                //},
                //'Diciembre': {
                //    sortable: false,
                //    width: 100,
                //    cellsAlign: 'right',
                //    cellsFormat: 'd2',
                //    columnType: 'numberinput',
                //    aggregates: ['sum'], aggregatesRenderer: function (aggregates, column, element) {
                //        var formatNumber = aggregates.sum;
                //        if (formatNumber === undefined)
                //            formatNumber = '';
                //        return `<div class="h-30 d-flex justify-content-center align-items-center font-weight-bold">
                //                <strong id="totalDineroRecibido"> ${formatNumber} </strong>
                //            </div>`;
                //    }
                //},
                //'Total': {
                //    sortable: false,
                //    width: 100,
                //    cellsAlign: 'right',
                //    cellsFormat: 'd2',
                //    columnType: 'numberinput',
                //    aggregates: ['sum'], aggregatesRenderer: function (aggregates, column, element) {
                //        var formatNumber = aggregates.sum;
                //        if (formatNumber === undefined)
                //            formatNumber = '';
                //        return `<div class="h-30 d-flex justify-content-center align-items-center font-weight-bold">
                //                <strong id="totalDineroRecibido"> ${formatNumber} </strong>
                //            </div>`;
                //    }
                //},
                //'%': {
                //    width: 80,
                //    cellsrenderer: function (row, columnfield, value, defaulthtml, columnproperties) {
                //        var filas = $('#table').jqxGrid('getrows');
                //        var num = filas[row].Total;

                //        var total = 0;
                //        $.each(filas, function (i, v) {
                //            total += v.Total;
                //        });

                //        return '<div class="jqx-grid-cell-middle-align" style="margin-top: 4px;">' + ((num / total) * 100).toFixed(2) + '%</div>'
                //    },
                //    aggregates: ['sum'], aggregatesRenderer: function (aggregates, column, element) {
                //        var formatNumber = aggregates.sum;
                //        if (formatNumber === undefined)
                //            formatNumber = '';


                //        return `<div class="h-30 d-flex justify-content-center align-items-center font-weight-bold">
                //                <strong id="totalDineroRecibido"> 100%</strong>
                //            </div>`;
                //    }
                //}
            }
            var _adapter = {};
            var _items = {}
            $.GetQuery({
                query: ['q_ventas_reportes_estadisticoxcentro'],
                type: [0],
                items: [{
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
                    C_CLIENTE: function () {
                        return $('#_cliente').val() || '';
                    },
                    VENDEDOR: function () {
                        return $('#_vendedor').val() || '';
                    },
                    MONEDA: function () {
                        return moneda
                    },
                    C_ESTABLECIMIENTO: function () {
                        return $('#_establecimiento').val() || ''
                    },
                    BASE: $.solver.basePath,
                    C_CAJA: function () {
                        return $('#_caja').val() || ''
                    }
                }],
                onReady: function (data, _result) {

                    var _type = 0;
                    var _query = 'q_ventas_reportes_estadisticoxcentro';
                    var _hiddens = ['NOMBRE_2', 'NOMBRE_1', 'C_UNIDAD_NEGOCIO_REF', 'C_UNIDAD_NEGOCIO_REF_2', 'C_UNIDAD_NEGOCIO_REF_1']
                    var _config = {

                        //groupable: true,
                        pageable: false,
                        //virtualmode: false,
                        height: 550,
                        pageSize: 999999,
                        sortable: false,
                        editable: false,
                        //showgroupsheader: false,
                        //showaggregates: true,
                        showstatusbar: true,
                        //statusbarheight: 20,
                        //groupsrenderer: groupsrenderer,
                        //groups: ['NOMBRE_2', 'NOMBRE_1'],
                        rendered: function () {
                            bootbox.hideAll();
                        },
                        sortable: false,
                        //closeablegroups: false,
                    }
                    var adaptador = {
                        dataType: "json",
                        dataFields: [],
                        data: {
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
                            C_CLIENTE: function () {
                                return $('#_cliente').val() || '';
                            },
                            VENDEDOR: function () {
                                return $('#_vendedor').val() || '';
                            },
                            MONEDA: function () {
                                return moneda
                            },
                            C_ESTABLECIMIENTO: function () {
                                return $('#_establecimiento').val() || ''
                            },
                            BASE: pdv,
                            C_CAJA: function () {
                                return $('#_caja').val() || ''
                            }
                        },
                        id: 'id',
                        type: 'POST',
                        url: $.solver.services.api + '/Service/'
                    };
                    var adaptador_cols = [];
                    var colsRefer = {};

                    //Extend Adaptador
                    adaptador = $.extend(adaptador, _adapter);

                    //Extra Columns
                    for (var item in _columns) {
                        if (typeof _result.cols[item] == 'undefined') {
                            _result.cols[item] = { type: "string", name: item };
                        };
                    };

                    //Define Default Cols
                    for (var item in _result.cols) {
                        var col = _result.cols[item];
                        var defColTable = {
                            text: col.name,
                            dataField: col.name,
                            width: '150',
                            align: 'center',
                            cellsAlign: 'left',
                            hidden: false,
                            //cellsrenderer: function (row, columnfield, value, defaulthtml, columnproperties) {
                            //    return '<div class="jqx-grid-cell-middle-align" style="margin-top: 8px;">' + value + '</div>';
                            //}
                        };
                        var defColAdapter = { name: col.name, type: col.type };
                        //Validation Regular Expressions
                        if (col.type === 'int64' || col.type === 'int32') {
                            defColAdapter.type = 'int';
                        };
                        if (col.type === 'datetime') {
                            defColTable.cellsformat = 'DD/MM/YYYY HH:mm:ss';
                            defColTable.cellsRenderer = function (row, column, value, rowData) {
                                var _tempDate = '';
                                if (value != '') {
                                    _tempDate = moment(value).format('DD/MM/YYYY HH:mm:ss');
                                };
                                return '<div class="jqx-grid-cell-middle-align" style="margin-top: 8px;">' + _tempDate + '</div>';;
                            };
                            defColAdapter.type = 'date';
                        };
                        if (col.name === "_rowNum") {
                            defColTable.hidden = true;
                        };
                        if ($.inArray(item, _hiddens) != -1) {
                            defColTable.hidden = true;
                        };
                        //Default Config Cols Users
                        if (typeof _columns[item] !== 'undefined') {
                            defColTable = $.extend(defColTable, _columns[item]);
                        };
                        //Add Config to Var
                        adaptador_cols.push(defColTable);
                        adaptador.dataFields.push(defColAdapter);
                        //colsRefer
                        colsRefer[col.name] = '';
                    };

                    if (typeof _config.columns == 'undefined') _config.columns = [];

                    //Add Order Initial Columns
                    //if (_sortcolumn.length != 0) {
                    //    adaptador.sortcolumn = _sortcolumn;
                    //    adaptador.sortdirection = _sortdirection;
                    //};

                    //Set Method to Connect
                    //if (connectTo.length = 0) _items.ConnectTo = connectTo;

                    _items.TypeTo = _type;
                    //Set Values to Config
                    _config.source = new $.jqx.dataAdapter(adaptador, {
                        loadServerData: function (serverdata, source, callback) {

                            var getRemoteData = function () {
                                //Parameters
                                var optionsAtServer = JSON.parse(JSON.stringify(serverdata));
                                var optionsToServer = {
                                    items: [],
                                    filters: [],
                                    sorters: []
                                };
                                var optionsToServerItem = $.ConvertObjectToArr(source.data);
                                //var _query = '';

                                //if (typeof _arguments.query == 'function') {
                                //    _query = _arguments.query();
                                //} else {
                                //    _query = _arguments.query || '';
                                //};

                                //Add Items to Send
                                optionsToServer.items = optionsToServerItem;

                                //Elements Complementary
                                if (typeof optionsAtServer.pagenum != 'undefined')
                                    optionsToServer.items.push({ name: 'pagenum', value: optionsAtServer.pagenum });
                                if (typeof optionsAtServer.pagesize != 'undefined')
                                    optionsToServer.items.push({ name: 'pagesize', value: optionsAtServer.pagesize });
                                if (typeof optionsAtServer.sortdatafield != 'undefined')
                                    optionsToServer.items.push({ name: 'sortdatafield', value: optionsAtServer.sortdatafield });
                                if (typeof optionsAtServer.sortorder != 'undefined')
                                    optionsToServer.items.push({ name: 'sortorder', value: optionsAtServer.sortorder });

                                //Get data From Server
                                $.GetData({
                                    uriData: $.solver.services.api + "/Service/DataGrid/" + _query + "/",
                                    options: optionsToServer,
                                    onReady: function (result) {
                                        callback({ records: result.data, totalrecords: result.totalrecords });
                                    },
                                    onError: function (_error) {
                                        callback({ records: [], totalrecords: 0 });
                                        $.CloseStatusBar();
                                        $.ShowError({ error: _error });
                                    }
                                });

                            };

                            $('#table')[0]['args'] = _config;
                            $('#table')[0]['info'] = {
                                colsRefer: colsRefer
                            };

                            if (typeof _firstLoad == 'undefined') _firstLoad = true;
                            if (_firstLoad) getRemoteData();
                            if (!_firstLoad) {
                                _firstLoad = true;
                                callback({ records: [], totalrecords: 0 });
                            };

                        }
                    });
                    _config.columns = adaptador_cols;
                    _config.localization = $.SetLocatizationJQX();

                    //Create Table
                    $('#table').jqxTreeGrid(_config);
                    //$('#table').on('filter', function (event) {
                    //    $('#table').jqxGrid('updatebounddata');
                    //});
                    //$('#table').on('sort', function (event) {
                    //    $(_table).jqxGrid('updatebounddata');
                    //});











                }
            })
        }
        const fnCrearEstablecimiento = function (moneda) {
            $('#table').CreateGrid({
                query: 'q_ventas_reportes_estadisticoxestablecimiento',
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
                    C_CLIENTE: function () {
                        return $('#_cliente').val() || '';
                    },
                    VENDEDOR: function () {
                        return $('#_vendedor').val() || '';
                    },
                    MONEDA: function () {
                        return moneda
                    },
                    C_ESTABLECIMIENTO: function () {
                        return $('#_establecimiento').val() || ''
                    },
                    BASE: $.solver.basePath,
                    C_CAJA: function () {
                        return $('#_caja').val() || ''
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
                    'Establecimiento': {
                        width: 160, aggregatesRenderer: function (aggregates, column, element) {
                            var formatNumber = aggregates.sum;
                            if (formatNumber === undefined)
                                formatNumber = '';
                            return `<div class="h-30 d-flex justify-content-center align-items-center font-weight-bold">
                                <strong> TOTAL </strong>
                            </div>`;
                        }
                    },
                    'Enero': {
                        sortable: false,
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
                    'Febrero': {
                        sortable: false,
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
                    'Marzo': {
                        sortable: false,
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
                    'Abril': {
                        sortable: false,
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
                    'Mayo': {
                        sortable: false,
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
                    'Junio': {
                        sortable: false,
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
                    'Julio': {
                        sortable: false,
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
                    'Agosto': {
                        sortable: false,
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
                    'Setiembre': {
                        sortable: false,
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
                    'Octubre': {
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
                    'Noviembre': {
                        sortable: false,
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
                    'Diciembre': {
                        sortable: false,
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
                    'Total': {
                        sortable: false,
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
            });
        }
        const fnCrearCaja = function (moneda) {
            $('#table').CreateGrid({
                query: 'q_ventas_reportes_estadisticoxcaja',
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
                    C_CLIENTE: function () {
                        return $('#_cliente').val() || '';
                    },
                    VENDEDOR: function () {
                        return $('#_vendedor').val() || '';
                    },
                    MONEDA: function () {
                        return moneda
                    },
                    C_ESTABLECIMIENTO: function () {
                        return $('#_establecimiento').val() || ''
                    },
                    BASE: $.solver.basePath,
                    C_CAJA: function () {
                        return $('#_caja').val() || ''
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
                        width: 160, aggregatesRenderer: function (aggregates, column, element) {
                            var formatNumber = aggregates.sum;
                            if (formatNumber === undefined)
                                formatNumber = '';
                            return `<div class="h-30 d-flex justify-content-center align-items-center font-weight-bold">
                                <strong> TOTAL </strong>
                            </div>`;
                        }
                    },
                    'Enero': {
                        sortable: false,
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
                    'Febrero': {
                        sortable: false,
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
                    'Marzo': {
                        sortable: false,
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
                    'Abril': {
                        sortable: false,
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
                    'Mayo': {
                        sortable: false,
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
                    'Junio': {
                        sortable: false,
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
                    'Julio': {
                        sortable: false,
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
                    'Agosto': {
                        sortable: false,
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
                    'Setiembre': {
                        sortable: false,
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
                    'Octubre': {
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
                    'Noviembre': {
                        sortable: false,
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
                    'Diciembre': {
                        sortable: false,
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
                    'Total': {
                        sortable: false,
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

        $('#btnDescargarExcel').click(function () {
            if (query != '') {
                $.DownloadFile({
                    nameFile: titulo,
                    query: query,
                    params: filtros
                });
            }
        });

        $('#btnFiltros').click(function () {
            fnMostrarModal();
        })
    });
});