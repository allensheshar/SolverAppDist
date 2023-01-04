require(["helper", "chartjs", "sortablejs", "extras", "controls", "datetimepicker"], function () {
    require(["alertify", "moment", "bootbox"], function (alertify, moment, bootbox) {
        alertify.set('notifier', 'position', 'top-center');

        const tableCortesia = '#tableCortesia';
        const tableAnulado = '#tableAnulado';
        const tableDescuento = '#tableDescuento';
        const tableFormaPago = '#tableFormaPago';
        const tableLiquidacionSoles = '#tableLiquidacionSoles';
        const tableLiquidacionDolares = '#tableLiquidacionDolares';
        const tablePorCategorias = '#tablePorCategorias';
        const tableResumenDia = '#tableResumenDia';
        const tableCajas = '#tableCajas';
        const table = '#table'
        const table1 = '#table1'
        const form = 'form[name=form]'
        let _controls;
        let primeraVez = true;
        let primeraVezGrafico = true;
        let chart;
        let isRendered = false

        const fnObtenerDatos = function () {
            $.GetQuery({
                query: [
                    'q_ventas_reportes_reportegerencial_resumen',
                    'q_ventas_reportes_reportegerencial_ventadia'
                ],
                items: [
                    {
                        C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                        DESDE: function () {
                            return $(_controls.desde).val()
                        },
                        HASTA: function () {
                            return $(_controls.hasta).val()
                        },
                        BASE: $.solver.basePath
                    },
                    {
                        C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                        DESDE: function () {
                            return $(_controls.desde).val()
                        },
                        HASTA: function () {
                            return $(_controls.hasta).val()
                        },
                        BASE: $.solver.basePath
                    }
                ],
                onBefore: function () {
                    $.DisplayStatusBar({
                        message: 'Actualizando reporte, espere un momento...'
                    });
                },
                onReady: function (result) {
                    $.CloseStatusBar();

                    var result_resumen = result['q_ventas_reportes_reportegerencial_resumen'].result.rows;
                    var result_ventadia = result['q_ventas_reportes_reportegerencial_ventadia'].result.rows;

                    var posventa = result_resumen[0]['Total posventa'];
                    var cobrados = result_resumen[0]['Total cobrados'];
                    var porcobrar = result_resumen[0]['Por Cobrar'];
                    var prodanulados = result_resumen[0]['Productos Anulados'];
                    var cuentaanuladas = result_resumen[0]['Cuentas anuladas'];
                    var documentosanulados = result_resumen[0]['Documentos anulados'];
                    var cortesias = result_resumen[0]['Cortesias'];
                    var descuentos = result_resumen[0]['Descuentos'];
                    var pax = result_resumen[0]['PAX'];

                    var html = '';

                    html += `
                        <tr>
                            <td>Total posventa</td>
                            <td class="text-right">S/. ${posventa}</td>
                        </tr>
                        <tr>
                            <td>Total cobrados</td>
                            <td class="text-right">S/. ${cobrados}</td>
                        </tr>
                        <tr>
                            <td>Total x cobrar</td>
                            <td class="text-right">S/. ${porcobrar}</td>
                        </tr>
                        <tr>
                            <td>Total productos anulados</td>
                            <td class="text-right">S/. ${prodanulados}</td>
                        </tr>
                        <tr>
                            <td>Total cuentas anuladas</td>
                            <td class="text-right">S/. ${cuentaanuladas}</td>
                        </tr>
                        <tr>
                            <td>Total documentos anulados</td>
                            <td class="text-right">S/. ${documentosanulados}</td>
                        </tr>
                        <tr>
                            <td>Total cortesias</td>
                            <td class="text-right">S/. ${cortesias}</td>
                        </tr>
                        <tr>
                            <td>Total descuentos</td>
                            <td class="text-right">S/. ${descuentos}</td>
                        </tr>
                    `;

                    $('#tbody').html(html)

                    $('#totalResumenDia').text(`Mes total venta: S/.${cobrados}`);
                    $('#tot_liquidacionventa').text(cobrados);

                    if (primeraVez) {
                        primeraVez = false;
                        fnCrearTablas();
                    }
                    else {
                        $(tableAnulado).jqxGrid('updatebounddata')
                        $(tableCortesia).jqxGrid('updatebounddata')
                        $(tableDescuento).jqxGrid('updatebounddata')
                        $(tableFormaPago).jqxGrid('updatebounddata')
                        $(tableLiquidacionSoles).jqxGrid('updatebounddata')
                        $(tableLiquidacionDolares).jqxGrid('updatebounddata')
                        $(tablePorCategorias).jqxGrid('updatebounddata')
                        $(tableVentaDia).jqxGrid('updatebounddata')
                        $(tableResumenDia).jqxGrid('updatebounddata')
                        $(tableCajas).jqxGrid('updatebounddata')
                        if (primeraVezGrafico) {
                            fnCrearGraficos(result_ventadia);
                        }
                        else {
                            fnActualizarGraficos(result_ventadia);
                        }
                    }
                }
            })
        }
        const fnCrearGraficos = function (venta_dia) {
            $('#graficoPorDia').html('<canvas id="graf_ventapordia"></canvas>');
            var labelsVentaDia = []
            var totales = [];
            venta_dia.map(dia => {
                labelsVentaDia.push(dia.C_FECHA);
                totales.push(dia.TOTAL)
            });

            var config = {
                type: 'bar',
                data: {
                    labels: labelsVentaDia,
                    datasets: [
                        {
                            label: 'FECHAS',
                            backgroundColor: 'rgba(235,187,193)',
                            borderColor: 'rgb(194,8,33)',
                            pointBorderWidth: 1,
                            pointHitRadius: 3,
                            pointBorderColor: 'rgb(194,8,33)',
                            pointBackgroundColor: 'white',
                            data: totales,
                            fill: 'start',
                        }
                    ]
                },
                options: {
                    maintainAspectRatio: false,
                    spanGaps: false,
                    plugins: {
                        filler: {
                            propagate: false
                        }
                    },
                    responsive: true,
                    title: {
                        display: false,
                        text: ''
                    },
                    tooltips: {
                        mode: 'index',
                        intersect: true,
                        callbacks: {
                            label: function (tooltipItem, data) {
                                return tooltipItem.yLabel.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
                            }
                        }
                    },
                    hover: {
                        mode: 'nearest',
                        intersect: true
                    },
                    scales: {
                        xAxes: [{
                            display: true,
                            scaleLabel: {
                                display: false,
                                labelString: 'Dia'
                            },
                            ticks: {
                                autoSkip: false,
                                maxRotation: 0
                            }
                        }],
                        yAxes: [{
                            display: true,
                            scaleLabel: {
                                display: false,
                                labelString: 'Archivos'
                            }
                        }]
                    },
                    legend: {
                        position: 'right',
                        labels: {
                            fontSize: 12,
                            fontStyle: 'bold',
                            fontColor: '#000000'
                        }
                    }
                }
            };
            var ctx = document.getElementById('graf_ventapordia').getContext('2d');
            chart = new Chart(ctx, config);
        }
        const fnActualizarGraficos = function (venta_dia) {
            var labelsVentaDia = []
            var totales = [];
            venta_dia.map(dia => {
                labelsVentaDia.push(dia.C_FECHA);
                totales.push(dia.TOTAL)
            });
            chart.data.datasets[0].data = totales;
            chart.update();
        }
        const fnCrearTablas = function () {

            $(tableDescuento).CreateGrid({
                query: 'q_ventas_reportes_reportegerencial_descuentos',
                items: {
                    C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                    DESDE: function () {
                        return $(_controls.desde).val()
                    },
                    HASTA: function () {
                        return $(_controls.hasta).val()
                    },
                    BASE: $.solver.basePath
                },
                columns: {
                    'Codigo de Pedido': { width: '80' },
                    'Motivo': { width: '120' },
                    'Fecha Pedido': { width: '100', cellsAlign: 'center' },
                    'Mesero': { width: '120' },
                    'Nombre de Plato': { width: '150' },
                    'Cant': { width: '80', cellsAlign: 'right', cellsFormat: 'd2' },
                    'Precio Original': { width: '80', cellsAlign: 'right', cellsFormat: 'd2' },
                    'Porc. Dscto': { width: '80', cellsAlign: 'right', cellsFormat: 'd2' },
                    'Precio Final': {
                        width: '80', cellsAlign: 'right', cellsFormat: 'd2',
                        aggregates: ['sum'], aggregatesRenderer: function (aggregates, column, element) {
                            var formatNumber = aggregates.sum;
                            if (formatNumber === undefined)
                                formatNumber = '';
                            return `<div class="h-30 d-flex justify-content-center align-items-center font-weight-bold">
                                <strong> ${formatNumber} </strong>
                            </div>`;
                        }
                    },
                    'Total Final': { width: '80', cellsAlign: 'right', cellsFormat: 'd2' },
                    'Nro de Comada': { width: '80' },
                    'Boleta de Venta': { text: 'Comprobante', width: '120' },
                    'Cajero': { width: '150' }
                },
                config: {
                    height: 680,
                    showaggregates: true,
                    showstatusbar: true,
                    statusbarheight: 25,
                }
            });
            $(tableCortesia).CreateGrid({
                query: 'q_ventas_reportes_reportegerencial_cortesias',
                items: {
                    C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                    DESDE: function () {
                        return $(_controls.desde).val()
                    },
                    HASTA: function () {
                        return $(_controls.hasta).val()
                    },
                    BASE: $.solver.basePath
                },
                columns: {
                    'Codigo de Pedido': { width: '80' },
                    'Motivo': { width: '120' },
                    'Fecha Pedido': { width: '100', cellsAlign: 'center' },
                    'Mesero': { width: '120' },
                    'Nombre de Plato': { width: '150' },
                    'Cant': { width: '80', cellsAlign: 'right', cellsFormat: 'd2' },
                    'Precio Original': { width: '80', cellsAlign: 'right', cellsFormat: 'd2' },
                    'Porc. Dscto': { width: '80', cellsAlign: 'right', cellsFormat: 'd2' },
                    'Precio Final': {
                        width: '80', cellsAlign: 'right', cellsFormat: 'd2',
                        aggregates: ['sum'], aggregatesRenderer: function (aggregates, column, element) {
                            var formatNumber = aggregates.sum;
                            if (formatNumber === undefined)
                                formatNumber = '';
                            return `<div class="h-30 d-flex justify-content-center align-items-center font-weight-bold">
                                <strong> ${formatNumber} </strong>
                            </div>`;
                        }
                    },
                    'Total Final': { width: '80', cellsAlign: 'right', cellsFormat: 'd2' },
                    'Nro de Comada': { width: '80' },
                    'Boleta de Venta': { text: 'Comprobante', width: '120' },
                    'Cajero': { width: '150' }
                },
                config: {
                    height: 680,
                    showaggregates: true,
                    showstatusbar: true,
                    statusbarheight: 25,
                }
            });
            $(tableAnulado).CreateGrid({
                query: 'q_ventas_reportes_reportegerencial_anulados',
                items: {
                    C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                    DESDE: function () {
                        return $(_controls.desde).val()
                    },
                    HASTA: function () {
                        return $(_controls.hasta).val()
                    },
                    BASE: $.solver.basePath,
                    TIPO: function () {
                        return $('#tipo_anulacion').val()
                    }
                },
                columns: {
                    'Codigo de Pedido': { width: '80' },
                    'Motivo': { width: '120' },
                    'Fecha Pedido': { width: '100', cellsAlign: 'center' },
                    'Mesero': { width: '120' },
                    'Nombre de Plato': { width: '150' },
                    'Cant': { width: '80', cellsAlign: 'right', cellsFormat: 'd2' },
                    'Precio Original': { width: '80', cellsAlign: 'right', cellsFormat: 'd2' },
                    'Porc. Dscto': { width: '80', cellsAlign: 'right', cellsFormat: 'd2' },
                    'Precio Final': {
                        width: '80', cellsAlign: 'right', cellsFormat: 'd2',
                        aggregates: ['sum'], aggregatesRenderer: function (aggregates, column, element) {
                            var formatNumber = aggregates.sum;
                            if (formatNumber === undefined)
                                formatNumber = '';
                            return `<div class="h-30 d-flex justify-content-center align-items-center font-weight-bold">
                                <strong> ${formatNumber} </strong>
                            </div>`;
                        }
                    },
                    'Total Final': { width: '80', cellsAlign: 'right', cellsFormat: 'd2' },
                    'Nro de Comada': { width: '80' },
                    'Boleta de Venta': { text: 'Comprobante', width: '120' },
                    'Cajero': { width: '150' }
                },
                config: {
                    height: 647,
                    showaggregates: true,
                    showstatusbar: true,
                    statusbarheight: 25,
                }
            })
            $(tableFormaPago).CreateGrid({
                query: 'q_ventas_reportes_reportegerencial_forma_pago',
                items: {
                    C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                    DESDE: function () {
                        return $(_controls.desde).val()
                    },
                    HASTA: function () {
                        return $(_controls.hasta).val()
                    },
                    BASE: $.solver.basePath
                },
                columns: {
                    cont: {
                        text: '#',
                        cellsAlign: 'right',
                        width: 60,
                        aggregates: ['sum'], aggregatesRenderer: function (aggregates, column, element) {
                            var formatNumber = aggregates.sum;
                            if (formatNumber === undefined)
                                formatNumber = '';
                            return `<div class="h-30 d-flex justify-content-center align-items-center font-weight-bold">
                                <strong> ${formatNumber} </strong>
                            </div>`;
                        }
                    },
                    Monto: {
                        text: 'Total',
                        width: 80,
                        cellsAlign: 'right',
                        cellsFormat: 'd2',
                        aggregates: ['sum'], aggregatesRenderer: function (aggregates, column, element) {
                            var formatNumber = aggregates.sum;
                            if (formatNumber === undefined)
                                formatNumber = '';
                            return `<div class="h-30 d-flex justify-content-center align-items-center font-weight-bold">
                                <strong> ${formatNumber} </strong>
                            </div>`;
                        }
                    }
                },
                config: {
                    height: 680,
                    showaggregates: true,
                    showstatusbar: true,
                    statusbarheight: 25,
                }
            });
            $(tableLiquidacionSoles).CreateGrid({
                query: 'q_ventas_reportes_reportegerencial_arqueo_moneda',
                items: {
                    C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                    DESDE: function () {
                        return $(_controls.desde).val()
                    },
                    HASTA: function () {
                        return $(_controls.hasta).val()
                    },
                    BASE: $.solver.basePath,
                    MONEDA: '07234'
                },
                hiddens: ['fila', 'ORDEN'],
                columns: {
                    'COD_TIPO_MONEDA': {
                        text: 'Monedas',
                        cellsAlign: 'right',
                        editable: false,
                        width: 200,
                    },
                    'CANT': {
                        text: 'Cantidad',
                        cellsAlign: 'right',
                        width: 100,
                    },
                    'TOTAL': {
                        text: 'Monto',
                        cellsAlign: 'right',
                        width: 100,
                        cellsFormat: 'd2',
                        aggregates: ['sum'], aggregatesRenderer: function (aggregates, column, element) {
                            var formatNumber = aggregates.sum;
                            if (formatNumber === undefined)
                                formatNumber = '';
                            return `<div class="h-30 d-flex justify-content-center align-items-center font-weight-bold">
                                <strong> ${formatNumber} </strong>
                            </div>`;
                        }
                    }
                },
                config: {
                    height: 300,
                    showaggregates: true,
                    showstatusbar: true,
                    statusbarheight: 25,
                }
            });
            $(tableLiquidacionDolares).CreateGrid({
                query: 'q_ventas_reportes_reportegerencial_arqueo_moneda',
                items: {
                    C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                    DESDE: function () {
                        return $(_controls.desde).val()
                    },
                    HASTA: function () {
                        return $(_controls.hasta).val()
                    },
                    BASE: $.solver.basePath,
                    MONEDA: '07235'
                },
                hiddens: ['fila', 'ORDEN'],
                columns: {
                    'COD_TIPO_MONEDA': {
                        text: 'Monedas',
                        cellsAlign: 'right',
                        editable: false,
                        width: 200,
                    },
                    'CANT': {
                        text: 'Cantidad',
                        cellsAlign: 'right',
                        width: 100,
                    },
                    'TOTAL': {
                        text: 'Monto',
                        cellsAlign: 'right',
                        width: 100,
                        cellsFormat: 'd2',
                        aggregates: ['sum'], aggregatesRenderer: function (aggregates, column, element) {
                            var formatNumber = aggregates.sum;
                            if (formatNumber === undefined)
                                formatNumber = '';
                            return `<div class="h-30 d-flex justify-content-center align-items-center font-weight-bold">
                                <strong> ${formatNumber} </strong>
                            </div>`;
                        }
                    }
                },
                config: {
                    height: 300,
                    showaggregates: true,
                    showstatusbar: true,
                    statusbarheight: 25,
                }
            });
            $(tablePorCategorias).CreateGrid({
                query: 'q_ventas_reportes_reportegerencial_categorias',
                items: {
                    C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                    DESDE: function () {
                        return $(_controls.desde).val()
                    },
                    HASTA: function () {
                        return $(_controls.hasta).val()
                    },
                    BASE: $.solver.basePath
                },
                columns: {
                    'NOMBRE_CATEGORIA': {
                        text: 'Categoria',
                        width: 250
                    },
                    'NOMBRE_PARA_VENTA': {
                        text: 'Producto',
                        width: 400
                    },
                    'PRECIO': {
                        text: 'Precio',
                        cellsFormat: 'd2',
                        cellsAlign: 'right',
                        width: 80,
                        aggregates: ['sum'], aggregatesRenderer: function (aggregates, column, element) {
                            var formatNumber = aggregates.sum;
                            if (formatNumber === undefined)
                                formatNumber = '';
                            return `<div class="h-30 d-flex justify-content-center align-items-center font-weight-bold">
                                <strong> ${formatNumber} </strong>
                            </div>`;
                        }
                    },
                    'CANTIDAD': {
                        text: 'Cantidad',
                        cellsFormat: 'd2',
                        cellsAlign: 'right',
                        width: 80,
                        aggregates: ['sum'], aggregatesRenderer: function (aggregates, column, element) {
                            var formatNumber = aggregates.sum;
                            if (formatNumber === undefined)
                                formatNumber = '';
                            return `<div class="h-30 d-flex justify-content-center align-items-center font-weight-bold">
                                <strong> ${formatNumber} </strong>
                            </div>`;
                        }
                    }
                },
                config: {
                    height: 680,
                    showaggregates: true,
                    showstatusbar: true,
                    statusbarheight: 25,
                    pageable: false,
                    virtualmode: false,
                    showgroupsheader: false,
                    sortable: false,
                    groupable: true,
                    closeablegroups: false,
                    rendered: function () {
                        $(tablePorCategorias).jqxGrid('refresh');
                        $(tablePorCategorias).on('groupexpand', function (event) {
                            $(tablePorCategorias).jqxGrid('refresh');
                        })
                        $(tablePorCategorias).on('groupcollapse', function (event) {
                            $(tablePorCategorias).jqxGrid('refresh');
                        });
                        if (!isRendered) {
                            isRendered = true;
                            setTimeout(function () {
                                $(tablePorCategorias).jqxGrid('removegroup', 'NOMBRE_CATEGORIA');
                                $(tablePorCategorias).jqxGrid('addgroup', 'NOMBRE_CATEGORIA');
                                $(tablePorCategorias).jqxGrid('refresh');
                                $(tablePorCategorias).jqxGrid({ rowsheight: 30 });
                                //$(tablePorCategorias).jqxGrid('expandallgroups');
                                $(tablePorCategorias).jqxGrid('collapseallgroups');
                            }, 100)
                        }
                    }
                }
            });
            $(tableVentaDia).CreateGrid({
                type: 5,
                query: 'SP_VENTAS_REPORTEGERENCIAL_VENTADIA',
                items: {
                    C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                    DESDE: function () {
                        return $(_controls.desde).val()
                    },
                    HASTA: function () {
                        return $(_controls.hasta).val()
                    },
                    BASE: $.solver.basePath
                },
                columns: {
                    'Semana': {
                        width: 120
                    },
                    'Lunes': {
                        width: 100,
                        cellsFormat: 'd2',
                        cellsAlign: 'right',
                        aggregates: ['sum'], aggregatesRenderer: function (aggregates, column, element) {
                            var formatNumber = aggregates.sum;
                            if (formatNumber === undefined)
                                formatNumber = '';
                            return `<div class="h-30 d-flex justify-content-center align-items-center font-weight-bold">
                                <strong> ${formatNumber} </strong>
                            </div>`;
                        }
                    },
                    'Martes': {
                        width: 100,
                        cellsFormat: 'd2',
                        cellsAlign: 'right',
                        aggregates: ['sum'], aggregatesRenderer: function (aggregates, column, element) {
                            var formatNumber = aggregates.sum;
                            if (formatNumber === undefined)
                                formatNumber = '';
                            return `<div class="h-30 d-flex justify-content-center align-items-center font-weight-bold">
                                <strong> ${formatNumber} </strong>
                            </div>`;
                        }
                    },
                    'Miércoles': {
                        width: 100,
                        cellsFormat: 'd2',
                        cellsAlign: 'right',
                        aggregates: ['sum'], aggregatesRenderer: function (aggregates, column, element) {
                            var formatNumber = aggregates.sum;
                            if (formatNumber === undefined)
                                formatNumber = '';
                            return `<div class="h-30 d-flex justify-content-center align-items-center font-weight-bold">
                                <strong> ${formatNumber} </strong>
                            </div>`;
                        }
                    },
                    'Jueves': {
                        width: 100,
                        cellsFormat: 'd2',
                        cellsAlign: 'right',
                        aggregates: ['sum'], aggregatesRenderer: function (aggregates, column, element) {
                            var formatNumber = aggregates.sum;
                            if (formatNumber === undefined)
                                formatNumber = '';
                            return `<div class="h-30 d-flex justify-content-center align-items-center font-weight-bold">
                                <strong> ${formatNumber} </strong>
                            </div>`;
                        }
                    },
                    'Viernes': {
                        width: 100,
                        cellsFormat: 'd2',
                        cellsAlign: 'right',
                        aggregates: ['sum'], aggregatesRenderer: function (aggregates, column, element) {
                            var formatNumber = aggregates.sum;
                            if (formatNumber === undefined)
                                formatNumber = '';
                            return `<div class="h-30 d-flex justify-content-center align-items-center font-weight-bold">
                                <strong> ${formatNumber} </strong>
                            </div>`;
                        }
                    },
                    'Sábado': {
                        width: 100,
                        cellsFormat: 'd2',
                        cellsAlign: 'right',
                        aggregates: ['sum'], aggregatesRenderer: function (aggregates, column, element) {
                            var formatNumber = aggregates.sum;
                            if (formatNumber === undefined)
                                formatNumber = '';
                            return `<div class="h-30 d-flex justify-content-center align-items-center font-weight-bold">
                                <strong> ${formatNumber} </strong>
                            </div>`;
                        }
                    },
                    'Domingo': {
                        width: 100,
                        cellsFormat: 'd2',
                        cellsAlign: 'right',
                        aggregates: ['sum'], aggregatesRenderer: function (aggregates, column, element) {
                            var formatNumber = aggregates.sum;
                            if (formatNumber === undefined)
                                formatNumber = '';
                            return `<div class="h-30 d-flex justify-content-center align-items-center font-weight-bold">
                                <strong> ${formatNumber} </strong>
                            </div>`;
                        }
                    },
                },
                config: {
                    height: 400,
                    showaggregates: true,
                    showstatusbar: true,
                    statusbarheight: 25,
                }
            })
            $(tableCajas).CreateGrid({
                query: 'q_ventas_reportes_reportegerencial_cajas',
                items: {
                    C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                    DESDE: function () {
                        return $(_controls.desde).val()
                    },
                    HASTA: function () {
                        return $(_controls.hasta).val()
                    },
                    BASE: $.solver.basePath
                },
                columns: {
                    'NOMBRE_CAJA': {
                        width: 120,
                        text: 'Caja'
                    },
                    'TOTAL': {
                        text: 'Total',
                        width: 100,
                        cellsFormat: 'd2',
                        cellsAlign: 'right',
                        aggregates: ['sum'], aggregatesRenderer: function (aggregates, column, element) {
                            var formatNumber = aggregates.sum;
                            if (formatNumber === undefined)
                                formatNumber = '';
                            return `<div class="h-30 d-flex justify-content-center align-items-center font-weight-bold">
                                <strong> ${formatNumber} </strong>
                            </div>`;
                        }
                    },
                },
                config: {
                    height: 300,
                    showaggregates: true,
                    showstatusbar: true,
                    statusbarheight: 25,
                }
            })
            $(tableResumenDia).CreateGrid({
                type: 5,
                query: 'SP_REPORTES_REPORTEVENTAS_HORAS',
                items: {
                    C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                    DESDE: function () {
                        return $(_controls.desde).val()
                    },
                    HASTA: function () {
                        return $(_controls.hasta).val()
                    },
                    BASE: $.solver.basePath
                },
                hiddens: ['POSICION'],
                columns: {
                    'DESCRIPCION': {
                        width: 120,
                        text: ''
                    },
                    'NRO_DOCS': {
                        text: 'Cantidad',
                        width: 100,
                        cellsFormat: 'd2',
                        cellsAlign: 'right',
                        aggregates: ['sum'], aggregatesRenderer: function (aggregates, column, element) {
                            var formatNumber = aggregates.sum;
                            if (formatNumber === undefined)
                                formatNumber = '';
                            return `<div class="h-30 d-flex justify-content-center align-items-center font-weight-bold">
                                <strong> ${formatNumber} </strong>
                            </div>`;
                        }
                    },
                    'TOTAL': {
                        text: 'Total',
                        width: 100,
                        cellsFormat: 'd2',
                        cellsAlign: 'right',
                        aggregates: ['sum'], aggregatesRenderer: function (aggregates, column, element) {
                            var formatNumber = aggregates.sum;
                            if (formatNumber === undefined)
                                formatNumber = '';
                            return `<div class="h-30 d-flex justify-content-center align-items-center font-weight-bold">
                                <strong> ${formatNumber} </strong>
                            </div>`;
                        }
                    },
                    'PORCENTAJE': {
                        text: '%',
                        width: 100,
                        cellsFormat: 'd2',
                        cellsAlign: 'right',
                        aggregates: ['sum'], aggregatesRenderer: function (aggregates, column, element) {
                            var formatNumber = aggregates.sum;
                            if (formatNumber === undefined)
                                formatNumber = '';
                            return `<div class="h-30 d-flex justify-content-center align-items-center font-weight-bold">
                                <strong> ${formatNumber} </strong>
                            </div>`;
                        }
                    }
                },
                config: {
                    height: 400,
                    showaggregates: true,
                    showstatusbar: true,
                    statusbarheight: 25,
                }
            })
            $(table).CreateGrid({
                type: 5,
                query: 'SP_RESTAURANT_REPORTES_COMPARATIVO',
                items: {
                    empresa: $.solver.session.SESSION_EMPRESA,
                    base: $.solver.basePath,
                    desde: function () {
                        return $(_controls.desde).val();
                    },
                    hasta: function () {
                        return $(_controls.hasta).val();
                    }
                },
                columns: {
                    'DIA': {
                        text: 'Día',
                        width: 120
                    },
                    'TOTAL': {
                        text: 'Total',
                        cellsAlign: 'right',
                        cellsFormat: 'd2',
                        width: 100
                    },
                    'PERSONAS': {
                        text: 'Personas',
                        cellsAlign: 'right',
                        width: 100
                    },
                    'TICKET_PROMEDIO': {
                        text: 'Ticket promedio',
                        cellsAlign: 'right',
                        cellsFormat: 'd2',
                        width: 100
                    }
                },
                config: {
                    height: 400,
                    sortable: false,
                    editable: false,
                    pageSize: 100,
                    rendered: function () { },
                }
            })
            $(table1).CreateGrid({
                type: 5,
                query: 'SP_RESTAURANT_REPORTES_COMPARATIVO_MES_ANTERIOR',
                items: {
                    empresa: $.solver.session.SESSION_EMPRESA,
                    base: $.solver.basePath,
                    desde: function () {
                        return $(_controls.desde).val();
                    },
                    hasta: function () {
                        return $(_controls.hasta).val();
                    }
                },
                columns: {
                    'DIA': {
                        text: 'Día',
                        width: 120
                    },
                    'TOTAL': {
                        text: 'Total',
                        cellsAlign: 'right',
                        cellsFormat: 'd2',
                        width: 100
                    },
                    'PERSONAS': {
                        text: 'Personas',
                        cellsAlign: 'right',
                        width: 100
                    },
                    'TICKET_PROMEDIO': {
                        text: 'Ticket promedio',
                        cellsAlign: 'right',
                        cellsFormat: 'd2',
                        width: 100
                    }
                },
                config: {
                    height: 400,
                    sortable: false,
                    editable: false,
                    pageSize: 100,
                    rendered: function () { },
                }
            })

        }
        const fnMostrarPdf = function (token) {
            bootbox.dialog({
                message: `<div class="embed-responsive embed-responsive-16by9"><iframe class= "embed-responsive-item" src="https://api.solver.com.pe/v1//service/ViewFile/${token}/" allowfullscreen></iframe></div>`,
                closeButton: true,
                className: 'modal-75'
            });
        }

        $(form).ValidForm({
            type: -1,
            onDone: function (_, controls) {
                _controls = controls;

                $(controls.desde).datetimepicker({
                    format: 'DD/MM/YYYY',
                    locale: 'es'
                });
                $(controls.hasta).datetimepicker({
                    format: 'DD/MM/YYYY',
                    locale: 'es'
                });
                fnObtenerDatos();

                $('#tipo_anulacion').change(function () {
                    $(tableAnulado).jqxGrid('updatebounddata')
                })

                $('#ventapordia-tab').click(function () {
                    $(form).submit();
                })

                $('#btnExportar').click(function () {
                    $.DisplayStatusBar({
                        message: 'Generando pdf, espere un momento...'
                    });

                    var canvas = $("#graf_ventapordia").get(0);
                    var dataURL;
                    if (canvas != undefined) {
                        dataURL = canvas.toDataURL('image/jpeg');
                    }

                    $.CreatePDFDocument({
                        empresa: $.solver.session.SESSION_EMPRESA,
                        formato: 'formato_estandar_reporte_gerencial',
                        papel: 'A4',
                        querys: [
                            {
                                name: 'cabecera',
                                args: $.ConvertObjectToArr({
                                    modeWork: 'd',
                                    script: 'q_ventas_reportes_reportegerencial_resumen_pdf',
                                    C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                                    DESDE: function () {
                                        return $(_controls.desde).val()
                                    },
                                    HASTA: function () {
                                        return $(_controls.hasta).val()
                                    },
                                    BASE: $.solver.basePath,
                                    BASE64: dataURL
                                })
                            },
                            {
                                name: 'productos_anulados',
                                args: $.ConvertObjectToArr({
                                    script: 'q_ventas_reportes_reportegerencial_anulados_pdf',
                                    C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                                    DESDE: function () {
                                        return $(_controls.desde).val()
                                    },
                                    HASTA: function () {
                                        return $(_controls.hasta).val()
                                    },
                                    BASE: $.solver.basePath,
                                    TIPO: 'P'
                                })
                            },
                            {
                                name: 'cuentas_anuladas',
                                args: $.ConvertObjectToArr({
                                    script: 'q_ventas_reportes_reportegerencial_anulados_pdf',
                                    C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                                    DESDE: function () {
                                        return $(_controls.desde).val()
                                    },
                                    HASTA: function () {
                                        return $(_controls.hasta).val()
                                    },
                                    BASE: $.solver.basePath,
                                    TIPO: 'C'
                                })
                            },
                            {
                                name: 'documentos_anulados',
                                args: $.ConvertObjectToArr({
                                    script: 'q_ventas_reportes_reportegerencial_anulados_pdf',
                                    C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                                    DESDE: function () {
                                        return $(_controls.desde).val()
                                    },
                                    HASTA: function () {
                                        return $(_controls.hasta).val()
                                    },
                                    BASE: $.solver.basePath,
                                    TIPO: 'D'
                                })
                            },
                            {
                                name: 'cortesias',
                                args: $.ConvertObjectToArr({
                                    script: 'q_ventas_reportes_reportegerencial_cortesias_pdf',
                                    C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                                    DESDE: function () {
                                        return $(_controls.desde).val()
                                    },
                                    HASTA: function () {
                                        return $(_controls.hasta).val()
                                    },
                                    BASE: $.solver.basePath
                                })
                            },
                            {
                                name: 'descuentos',
                                args: $.ConvertObjectToArr({
                                    script: 'q_ventas_reportes_reportegerencial_descuentos_pdf',
                                    C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                                    DESDE: function () {
                                        return $(_controls.desde).val()
                                    },
                                    HASTA: function () {
                                        return $(_controls.hasta).val()
                                    },
                                    BASE: $.solver.basePath
                                })
                            },
                            {
                                name: 'forma_pago',
                                args: $.ConvertObjectToArr({
                                    script: 'q_ventas_reportes_reportegerencial_forma_pago_pdf',
                                    C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                                    DESDE: function () {
                                        return $(_controls.desde).val()
                                    },
                                    HASTA: function () {
                                        return $(_controls.hasta).val()
                                    },
                                    BASE: $.solver.basePath
                                })
                            },
                            {
                                name: 'soles',
                                args: $.ConvertObjectToArr({
                                    script: 'q_ventas_reportes_reportegerencial_arqueo_moneda_pdf',
                                    C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                                    DESDE: function () {
                                        return $(_controls.desde).val()
                                    },
                                    HASTA: function () {
                                        return $(_controls.hasta).val()
                                    },
                                    BASE: $.solver.basePath,
                                    MONEDA: '07234'
                                })
                            },
                            {
                                name: 'dolares',
                                args: $.ConvertObjectToArr({
                                    script: 'q_ventas_reportes_reportegerencial_arqueo_moneda_pdf',
                                    C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                                    DESDE: function () {
                                        return $(_controls.desde).val()
                                    },
                                    HASTA: function () {
                                        return $(_controls.hasta).val()
                                    },
                                    BASE: $.solver.basePath,
                                    MONEDA: '07235'
                                })
                            },
                            {
                                name: 'categorias',
                                args: $.ConvertObjectToArr({
                                    script: 'q_ventas_reportes_reportegerencial_categorias_pdf',
                                    C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                                    DESDE: function () {
                                        return $(_controls.desde).val()
                                    },
                                    HASTA: function () {
                                        return $(_controls.hasta).val()
                                    },
                                    BASE: $.solver.basePath
                                })
                            },
                            {
                                name: 'venta_dia_semana',
                                args: $.ConvertObjectToArr({
                                    script: 'SP_VENTAS_REPORTEGERENCIAL_VENTADIA',
                                    C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                                    DESDE: function () {
                                        return $(_controls.desde).val()
                                    },
                                    HASTA: function () {
                                        return $(_controls.hasta).val()
                                    },
                                    BASE: $.solver.basePath
                                })
                            },
                            {
                                name: 'caja',
                                args: $.ConvertObjectToArr({
                                    script: 'q_ventas_reportes_reportegerencial_cajas_pdf',
                                    C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                                    DESDE: function () {
                                        return $(_controls.desde).val()
                                    },
                                    HASTA: function () {
                                        return $(_controls.hasta).val()
                                    },
                                    BASE: $.solver.basePath
                                })
                            },
                            {
                                name: 'resumen_dia',
                                args: $.ConvertObjectToArr({
                                    script: 'SP_REPORTES_REPORTEVENTAS_HORAS',
                                    C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                                    DESDE: function () {
                                        return $(_controls.desde).val()
                                    },
                                    HASTA: function () {
                                        return $(_controls.hasta).val()
                                    },
                                    BASE: $.solver.basePath
                                })
                            },
                        ],
                        onReady: function (result) {
                            fnMostrarPdf(result.token)
                            $.CloseStatusBar();
                        }
                    });
                });
            },
            onReady: function () {
                fnObtenerDatos();
                isRendered = false

            }
        });
    });
});