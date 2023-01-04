require(['helper', 'chartjs', 'sortablejs', 'inputmask'], function () {
    require(['moment', 'numeral', 'bootbox'], function (moment, numeral, bootbox) {

        const c_empresa = $.solver.session.SESSION_EMPRESA;
        let mesesArray = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Set', 'Oct', 'Nov', 'Dic'];
        let colores = ['4,139,168', '22,219,147', '89,204,228', '242,158,76', '149,132,194', '217,104,148', '200,30,60']

        const fnObtenerData = function () {
            $.GetQuery({
                query:
                    [
                        'q_caja_reportes_resumen_obteneringresoyegresos',
                        'q_caja_reportes_resumen_obteneringresosmensuales',
                        'q_caja_reportes_resumen_obteneregresosmensuales',
                        'q_caja_reportes_resumen_obtenerotros',
                        'q_caja_reportes_resumen_obtenersaldosbanco'
                    ],
                items:
                    [
                        { C_EMPRESA: c_empresa, ANIO: function () { return $('#anio').val() } },
                        { C_EMPRESA: c_empresa, ANIO: function () { return $('#anio').val() } },
                        { C_EMPRESA: c_empresa, ANIO: function () { return $('#anio').val() } },
                        { C_EMPRESA: c_empresa, ANIO: function () { return $('#anio').val() } },
                        { C_EMPRESA: c_empresa },
                    ],
                onReady: function (result) {
                    $.CloseStatusBar();
                    $('#canvas-reporte-ingreso-egreso').parent().html('<canvas id="canvas-reporte-ingreso-egreso"></canvas>');
                    $('#canvas-reporte-ingreso-egreso-mensuales').parent().html('<canvas id="canvas-reporte-ingreso-egreso-mensuales"></canvas>');

                    var ingresosEgresos = result['q_caja_reportes_resumen_obteneringresoyegresos'].result.rows;
                    var ingresosMensuales = result['q_caja_reportes_resumen_obteneringresosmensuales'].result.rows;
                    var egresosMensuales = result['q_caja_reportes_resumen_obteneregresosmensuales'].result.rows;
                    var otros = result['q_caja_reportes_resumen_obtenerotros'].result.rows;
                    var saldoBancos = result['q_caja_reportes_resumen_obtenersaldosbanco'].result.rows;

                    fnCrearReporteIngresoEgresos(ingresosEgresos);
                    fnCrearReporteIngresoEgresoMensuales(ingresosMensuales, egresosMensuales);
                    fnCrearReporteOtros(otros);
                    fnCrearReporteSaldoBancos(saldoBancos);
                },
                onError: function (error) {
                    $.CloseStatusBar();
                    $.ShowError({ error: error });
                }
            });
        }

        const fnCrearReporteIngresoEgresos = function (ingresosEgresos) {
            if (ingresosEgresos.length == 0) {
                $('#noReporteIngresoEgreso').show();
                $('#reporteIngresoEgreso').hide();
            }
            else {
                $('#noReporteIngresoEgreso').hide();
                $('#reporteIngresoEgreso').show();

                var data01 = [0, 0];
                var data02 = ['EGRESOS S/. 0', 'INGRESOS S/. 0'];

                for (var item in ingresosEgresos) {
                    var inrow = ingresosEgresos[item];
                    if (inrow.TIPO == 'EGRESOS') {
                        data01[0] = inrow.TOTAL;
                        data02[0] = `EGRESOS S/. ${inrow.TOTAL}`;
                    }
                    if (inrow.TIPO == 'INGRESOS') {
                        data01[1] = inrow.TOTAL;
                        data02[1] = `INGRESOS S/. ${inrow.TOTAL}`;
                    }
                }
                fnArmarReporte('canvas-reporte-ingreso-egreso', data01, data02);
            }
        }
        const fnCrearReporteIngresoEgresoMensuales = function (ingresosMensuales, egresosMensuales) {
            var data01 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            var data02 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            for (var item in ingresosMensuales) {
                var inrow = ingresosMensuales[item];
                data01[inrow.CODIGO_PARAMETRO - 1] = inrow.TOTAL;
            }
            for (var item in egresosMensuales) {
                var inrow = egresosMensuales[item];
                data02[inrow.CODIGO_PARAMETRO - 1] = inrow.TOTAL;
            }
            fnArmarReporte1('canvas-reporte-ingreso-egreso-mensuales', mesesArray, data01, data02);
        }
        const fnCrearReporteOtros = function (otros) {
            var data = otros[0];
            $('#cuentasporcobrar').html(`<h3>S/. ${numeral(data['VENTAS_COBRAR']).format('0.00')}</h3>`);
            $('#cuentasporpagar').html(`<h3>S/. ${numeral(data['COMPRAS_PAGAR']).format('0.00')}</h3>`);
            $('#cobranzasporvencer').html(`<h3>S/. ${numeral(data['VENTAS_POR_VENCER']).format('0.00')}</h3>`);
            $('#pagosvencidos').html(`<h3>S/. ${numeral(data['PAGOS_VENCIDOS']).format('0.00')}</h3>`);
        }
        const fnCrearReporteSaldoBancos = function (saldoBancos) {
            if (saldoBancos.length == 0) {
                $('#noReporteBancos').show();
                $('#reporteBancos').hide();
            }
            else {
                $('#noReporteBancos').hide();
                $('#reporteBancos').show();
                var html = '<div class="row">';
                $.each(saldoBancos, function (i, banco) {
                    html += `<div class="m-3 p-3 col-3 text-white" style="background-color: rgb(${colores[i]})">
                                <h2 >${banco['NOMBRE_CORTO']} S/. ${banco['TOTAL'].toFixed(2)}</h2>
                            </div>`;
                });
                html += '</div>';
                $('#reporteBancos').html(html);
            }
        }
        const fnArmarReporte = function (content, data, labels) {
            var config = {
                type: 'doughnut',
                data: {
                    datasets: [{
                        data: data,
                        backgroundColor: [
                            'rgb(22,219,147)',
                            'rgb(4,139,168)',
                        ],
                        label: 'Dataset 1'
                    }],
                    labels: labels
                },
                options: {
                    responsive: true,
                    legend: {
                        position: 'right',
                        labels: {
                            fontSize: 12,
                            fontStyle: 'bold',
                            fontColor: '#000000'
                        }
                    },
                    labels: {
                        usePointStyle: true,
                    }
                }
            };

            var ctx = document.getElementById(content).getContext('2d');
            var char = new Chart(ctx, config);

            return char;
        }
        const fnArmarReporte1 = function (content, labels, data, data2) {
            var config = {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: 'INGRESOS',
                            backgroundColor: 'rgba(184,227,236)',
                            borderColor: 'rgb(4,139,168)',
                            pointBorderWidth: 1,
                            pointHitRadius: 3,
                            pointBorderColor: 'rgb(4,139,168)',
                            pointBackgroundColor: 'white',
                            data: data,
                            fill: 'start',
                        },
                        {
                            label: 'EGRESOS',
                            backgroundColor: 'rgba(179,244,221)',
                            borderColor: 'rgb(22,219,147)',
                            pointBorderWidth: 1,
                            pointHitRadius: 3,
                            pointBorderColor: 'rgb(22,219,147)',
                            pointBackgroundColor: 'white',
                            data: data2,
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
                                labelString: 'Mes'
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
            var ctx = document.getElementById(content).getContext('2d');
            var char = new Chart(ctx, config);
            return char;
        }

        $('form[name=filterPeriodo]').ValidForm({
            type: -1,
            onReady: function () {
                $.DisplayStatusBar({ message: 'Actualizando información.' });
                fnObtenerData();
            },
            onDone: function () {
                fnObtenerData();
                $('#btnCobranzasPorVencer').click(function () {
                    $.solver.fn.fnAbrirModal({
                        query: 'tbl_caja_reportes_resumen_obtenercobranzasporvencer',
                        title: 'Busqueda de documentos por vencer',
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
                            RAZON_SOCIAL: {
                                text: 'Cliente',
                                width: 700,
                            },
                            TIPO_DOCUMENTO: {
                                text: 'Tipo de documento',
                                cellsAlign: 'center',
                                width: 120,
                            },
                            DOCUMENTO: {
                                text: 'Documento',
                                cellsAlign: 'center',
                                width: 100,
                            },
                            FECHA_VENCIMIENTO: {
                                text: 'Fecha venc.',
                                cellsAlign: 'center',
                                width: 80,
                            },
                            MONEDA: {
                                text: 'Moneda',
                                width: 70,
                            },
                            TOTAL: {
                                text: 'Monto',
                                width: 80,
                                cellsAlign: 'right',
                                cellsFormat: 'd2'
                            }
                        }
                    })
                });

                $('#btnPagosVencidos').click(function () {
                    $.solver.fn.fnAbrirModal({
                        query: 'tbl_caja_reportes_resumen_obtenerpagosvencidos',
                        title: 'Busqueda de pagos vencidos',
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
                            RAZON_SOCIAL: {
                                text: 'Cliente',
                                width: 700,
                            },
                            TIPO_DOCUMENTO: {
                                text: 'Tipo de documento',
                                cellsAlign: 'center',
                                width: 120,
                            },
                            DOCUMENTO: {
                                text: 'Documento',
                                cellsAlign: 'center',
                                width: 100,
                            },
                            FECHA_VENCIMIENTO: {
                                text: 'Fecha venc.',
                                cellsAlign: 'center',
                                width: 80,
                            },
                            MONEDA: {
                                text: 'Moneda',
                                width: 70,
                            },
                            TOTAL: {
                                text: 'Monto',
                                width: 80,
                                cellsAlign: 'right',
                                cellsFormat: 'd2'
                            }
                        }
                    })
                })
            }
        })
    });
});