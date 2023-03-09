require(["helper", "extras", "datetimepicker", "chartjs", "sortablejs"], function () {
    require(["alertify", "bootbox", "moment"], function (alertify, bootbox, moment) {
        const c_empresa = $.solver.session.SESSION_EMPRESA;
        const frm = 'form[name=frm]';
        let _controls;
        const tblGrafica = '#tblGrafica';
        const tblDetalle = '#tblDetalle';
        let mesesArray = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Set', 'Oct', 'Nov', 'Dic'];

        const fnCrearTabla = function () {
            $(tblGrafica).CreateGrid({
                query: 'tbl_ventas_reportes_reporteventasdetalladas_registrodeventas',
                items: {
                    C_EMPRESA: c_empresa,
                    ANIO: function () {
                        return $(_controls.anio).val();
                    },
                    MES: function () {
                        return $(_controls.mes).val();
                    },
                    MES_FIN: function () {
                        return $(_controls.mesfin).val();
                    },
                    C_CLIENTE: function () {
                        return $(_controls.cliente).val();
                    },
                    MONEDA: function () {
                        return $(_controls.moneda).val();
                    }
                },
                columns: {
                    'MES': {
                        text: 'N°',
                        width: '30',
                        cellsAlign: 'center',
                        hidden: false,
                        pinned: true,
                        editable: false,
                        sortable: false
                    },
                    'Periodo': {
                        width: 100,
                        aggregatesRenderer: function (aggregates, column, element) {
                            var formatNumber = aggregates.sum;
                            if (formatNumber === undefined)
                                formatNumber = '';
                            return `<div class="h-30 d-flex justify-content-center align-items-center font-weight-bold">
                                <strong id="totalDineroRecibido"> TOTAL </strong>
                            </div>`;
                        }
                    },
                    'Valor venta': {
                        cellsAlign: 'right',
                        cellsFormat: 'd2',
                        columnType: 'numberinput',
                        sortable: false,
                        width: 130,
                        aggregates: ['sum'], aggregatesRenderer: function (aggregates, column, element) {
                            var formatNumber = aggregates.sum;
                            if (formatNumber === undefined)
                                formatNumber = '';
                            return `<div class="h-30 d-flex justify-content-center align-items-center font-weight-bold">
                                <strong id="totalDineroRecibido"> ${formatNumber} </strong>
                            </div>`;
                        }
                    },
                    'Valor inafecta': {
                        cellsAlign: 'right',
                        cellsFormat: 'd2',
                        columnType: 'numberinput',
                        sortable: false,
                        width: 130,
                        aggregates: ['sum'], aggregatesRenderer: function (aggregates, column, element) {
                            var formatNumber = aggregates.sum;
                            if (formatNumber === undefined)
                                formatNumber = '';
                            return `<div class="h-30 d-flex justify-content-center align-items-center font-weight-bold">
                                <strong id="totalDineroRecibido"> ${formatNumber} </strong>
                            </div>`;
                        }
                    },
                    'I.G.V.': {
                        cellsAlign: 'right',
                        cellsFormat: 'd2',
                        columnType: 'numberinput',
                        sortable: false,
                        width: 130,
                        aggregates: ['sum'], aggregatesRenderer: function (aggregates, column, element) {
                            var formatNumber = aggregates.sum;
                            if (formatNumber === undefined)
                                formatNumber = '';
                            return `<div class="h-30 d-flex justify-content-center align-items-center font-weight-bold">
                                <strong id="totalDineroRecibido"> ${formatNumber} </strong>
                            </div>`;
                        }
                    },
                    'Precio de venta': {
                        cellsAlign: 'right',
                        cellsFormat: 'd2',
                        columnType: 'numberinput',
                        sortable: false,
                        width: 130,
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
                    virtualmode: true,
                    height: 400,
                    pageSize: 100,
                    pageable: false,
                    sortable: true,
                    editable: false,
                    showaggregates: true,
                    showstatusbar: true,
                    statusbarheight: 20,
                }
            });

        }
        const fnReporte = function (content, labels, data) {
            var config = {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: 'REGISTRO DE VENTAS',
                            backgroundColor: 'rgba(184,227,236)',
                            borderColor: 'rgb(4,139,168)',
                            pointBorderWidth: 1,
                            pointHitRadius: 3,
                            pointBorderColor: 'rgb(4,139,168)',
                            pointBackgroundColor: 'white',
                            data: data,
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
        };
        const fnBuscarData = function () {
            $.GetQuery({
                query: ['q_ventas_reportes_reporteventasdetalladas_registrodeventas'],
                items: [{
                    C_EMPRESA: c_empresa,
                    ANIO: function () {
                        return $(_controls.anio).val();
                    },
                    MES: function () {
                        return $(_controls.mes).val();
                    },
                    MES_FIN: function () {
                        return $(_controls.mesfin).val();
                    },
                    C_CLIENTE: function () {
                        return $(_controls.cliente).val();
                    },
                    MONEDA: function () {
                        return $(_controls.moneda).val();
                    }
                }],
                onReady: function (myDataRpt0) {
                    var myDataRpt0_0 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                    for (var item in myDataRpt0) {
                        var inrow = myDataRpt0[item];
                        myDataRpt0_0[inrow.MESES - 1] = inrow.PRECIO_VENTA;
                    }
                    fnReporte('canvas', mesesArray, myDataRpt0_0);
                }
            })
        }
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
        $(frm).ValidForm({
            type: -1,
            onReady: function () {
                if ($(_controls.mes)[0].args.data.filter(x => x['MES'] == $(_controls.mes).val())[0].NOMBRE == $(_controls.mesfin)[0].args.data.filter(x => x['MES'] == $(_controls.mesfin).val())[0].NOMBRE) {
                    $('#lblPeriodo').text('Periodo: ' + $(_controls.mes)[0].args.data.filter(x => x['MES'] == $(_controls.mes).val())[0].NOMBRE + ' ' + $(_controls.anio).val());
                }
                else {
                    $('#lblPeriodo').text('Periodo: ' + $(_controls.mes)[0].args.data.filter(x => x['MES'] == $(_controls.mes).val())[0].NOMBRE + ' a ' + $(_controls.mesfin)[0].args.data.filter(x => x['MES'] == $(_controls.mesfin).val())[0].NOMBRE + ' ' + $(_controls.anio).val());
                }
                $(tblGrafica).jqxGrid('updatebounddata');
                //$(tblDetalle).jqxGrid('updatebounddata');

                $('#grafico').html('<canvas id="canvas"></canvas>');
                fnBuscarData();
                $('#lblMoneda').text('Expresado en ' + ($(_controls.moneda).val() == 'soles' ? 'soles' : 'dolares'));
            },
            onDone: function (form, controls) {
                $(controls.mesfin).val($('#mes_actual').val());
                _controls = controls;
                if ($(_controls.mes)[0].args.data.filter(x => x['MES'] == $(_controls.mes).val())[0].NOMBRE == $(_controls.mes)[0].args.data.filter(x => x['MES'] == $(_controls.mesfin).val())[0].NOMBRE) {
                    $('#lblPeriodo').text('Periodo: ' + $(_controls.mes)[0].args.data.filter(x => x['MES'] == $(_controls.mes).val())[0].NOMBRE + ' ' + $(_controls.anio).val());
                }
                else {
                    $('#lblPeriodo').text('Periodo: ' + $(_controls.mes)[0].args.data.filter(x => x['MES'] == $(_controls.mes).val())[0].NOMBRE + ' a ' + $(_controls.mes)[0].args.data.filter(x => x['MES'] == $(_controls.mesfin).val())[0].NOMBRE + ' ' + $(_controls.anio).val());
                }
                fnCrearTabla();
                fnBuscarData();
                $('#lblMoneda').text('Expresado en soles');
            }
        });

        $('#btnDescargar').click(function () {
            $.DownloadFile({
                query: 'q_ventas_reportes_registroventasxperiodo',
                params: {
                    C_EMPRESA: c_empresa,
                    ANIO: function () {
                        return $(_controls.anio).val();
                    },
                    MES: function () {
                        return $(_controls.mes).val();
                    },
                    MES_FIN: function () {
                        return $(_controls.mesfin).val();
                    },
                    C_CLIENTE: function () {
                        return $(_controls.cliente).val();
                    },
                    MONEDA: function () {
                        return $(_controls.moneda).val();
                    }
                }
            });
        })
    });
});