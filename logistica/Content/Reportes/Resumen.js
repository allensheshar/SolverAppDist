require(['helper', 'chartjs', 'sortablejs', 'inputmask'], function () {
    require(['moment', 'numeral', 'bootbox'], function (moment, numeral, bootbox) {

        let mesesArray = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Set', 'Oct', 'Nov', 'Dic'];
        let mesesCompletosArray = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Setiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        let meses = {};
        let mesCurrent = parseInt(moment().format('MM'));
        let mycontrols = null;
        let reporte03 = [];
        let reporte04 = [];

        const fnReporte01 = function (content, labels, data) {
            var config = {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: 'COMPRAS',
                            backgroundColor: 'rgba(179,244,221)',
                            borderColor: 'rgb(22,219,147)',
                            pointBorderWidth: 1,
                            pointHitRadius: 3,
                            pointBorderColor: 'rgb(22,219,147)',
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
        const fnReporte02 = function (data) {
            var cabecera = '';
            var detalle = '';
            for (var i = 0; i < data.length; i++) {
                var row = data[i];
                cabecera += '<h5'
                if (i != 0) {
                    cabecera += ' class="mt-4"'
                }
                cabecera += `>${row.TIPO}`;
                cabecera += '</h5>'
            }


            for (var i = 0; i < data.length; i++) {
                var row = data[i];
                detalle += '<h5'
                if (i != 0) {
                    detalle += ' class="mt-4"'
                }
                detalle += `>${row.TOTAL} (${row.CONT})`;
                detalle += '</h5>'
            }


            $('#cab').html(cabecera);
            $('#det').html(detalle);
            //for (var item in data) {
            //    var inrow = data[item];
            //    console.log(inrow);
            //    //if (inrow.TIPO == 'BOLETA') {
            //    //    $('#bol').text(`${inrow.TOTAL} (${inrow.CANTIDAD})`);
            //    //}
            //    //if (inrow.TIPO == 'FACTURA') {
            //    //    $('#fac').text(`${inrow.TOTAL} (${inrow.CANTIDAD})`);
            //    //}
            //    //if (inrow.TIPO == 'NOTA DE CRÉDITO') {
            //    //    $('#nc').text(`${inrow.TOTAL} (${inrow.CANTIDAD})`);
            //    //}
            //    //if (inrow.TIPO == 'NOTA DE DÉBITO') {
            //    //    $('#nd').text(`${inrow.TOTAL} (${inrow.CANTIDAD})`);
            //    //}
            //    //if (inrow.TIPO == 'PENDIENTE') {
            //    //    $('#pen').text(`${inrow.TOTAL} (${inrow.CANTIDAD})`);
            //    //}
            //    //if (inrow.TIPO == 'OBSERVADAS') {
            //    //    $('#obs').text(`${inrow.TOTAL} (${inrow.CANTIDAD})`);
            //    //}
            //}
        };
        const fnReporte03 = function (content, labels, data) {
            var config = {
                type: 'horizontalBar',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: 'COMPRAS SEMANALES',
                            data: data,
                            pointBorderWidth: 1,
                            pointHitRadius: 3,
                            backgroundColor: [
                                '#62B7C9',
                                '#16DB93',
                                '#A072B9',
                                '#E5758F',
                                '#0000FF',
                                '#FEE074',
                                '#C81E3C'
                            ],
                            pointBackgroundColor: 'white',
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
                        display: false,
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
        const fnReporte04 = function (content, labels, data, data2) {
            var config = {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: mesesCompletosArray[parseInt($('#MES_ACTUAL').val()) - 1].toUpperCase(),
                            backgroundColor: 'rgba(247,236,197)',
                            borderColor: 'rgb(255,124,20)',
                            pointBorderWidth: 1,
                            pointHitRadius: 3,
                            pointBorderColor: 'rgb(255,124,20)',
                            pointBackgroundColor: 'white',
                            data: data,
                            fill: 'start',
                        },
                        {
                            label: mesesCompletosArray[parseInt($('#MES_ACTUAL').val()) - 2].toUpperCase(),
                            backgroundColor: 'rgba(235,187,193)',
                            borderColor: 'rgb(194,8,33)',
                            pointBorderWidth: 1,
                            pointHitRadius: 3,
                            pointBorderColor: 'rgb(194,8,33)',
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
            var ctx = document.getElementById(content).getContext('2d');
            var char = new Chart(ctx, config);
            return char;
        };
        const fnReporte05 = function (data) {
            for (var item in data) {
                var inrow = data[item];
                if (inrow.MES == '1') $('#ene').text(`${inrow.TOTAL}`);
                if (inrow.MES == '2') $('#feb').text(`${inrow.TOTAL}`);
                if (inrow.MES == '3') $('#mar').text(`${inrow.TOTAL}`);
                if (inrow.MES == '4') $('#abr').text(`${inrow.TOTAL}`);
                if (inrow.MES == '5') $('#may').text(`${inrow.TOTAL}`);
                if (inrow.MES == '6') $('#jun').text(`${inrow.TOTAL}`);
                if (inrow.MES == '7') $('#jul').text(`${inrow.TOTAL}`);
                if (inrow.MES == '8') $('#ago').text(`${inrow.TOTAL}`);
                if (inrow.MES == '9') $('#set').text(`${inrow.TOTAL}`);
                if (inrow.MES == '10') $('#oct').text(`${inrow.TOTAL}`);
                if (inrow.MES == '11') $('#nov').text(`${inrow.TOTAL}`);
                if (inrow.MES == '12') $('#dic').text(`${inrow.TOTAL}`);
            }
        }

        const fnObtenerData = function () {
            $.GetQuery({
                query: [
                    'q_logistica_reportes_resumen_mes',
                    'q_logistica_reportes_resumen_canttipodocs',
                    'q_logistica_reportes_resumen_totalcomprasmeses',
                    'q_logistica_reportes_resumen_varios_compras',
                    'q_logistica_reportes_resumen_compras_ultimos_meses',
                    'q_logistica_reportes_resumen_compras_ultimos_meses_pasado',
                    'q_logisticas_reportes_resumen_compras_semanal'
                ],
                items: [
                    { empresa: $.solver.session.SESSION_EMPRESA, anio: function () { return $(mycontrols.anio).val(); } },
                    { empresa: $.solver.session.SESSION_EMPRESA, anio: function () { return $(mycontrols.anio).val(); } },
                    { empresa: $.solver.session.SESSION_EMPRESA, anio: function () { return $(mycontrols.anio).val(); } },
                    { empresa: $.solver.session.SESSION_EMPRESA, anio: function () { return $(mycontrols.anio).val(); } },
                    { empresa: $.solver.session.SESSION_EMPRESA, anio: function () { return $(mycontrols.anio).val(); } },
                    { empresa: $.solver.session.SESSION_EMPRESA, anio: function () { return $(mycontrols.anio).val(); } },
                    { empresa: $.solver.session.SESSION_EMPRESA, anio: function () { return $(mycontrols.anio).val(); } }
                ],
                onBefore: function () {
                    $.DisplayStatusBar({
                        message: 'Actualizando reporte, espere un momento...'
                    });
                },
                onReady: function (result) {
                    var anio_compras = $(mycontrols.anio).val();
                    $('#anio_compras').text(`COMPRAS ${anio_compras}`)

                    meses = {
                        'Enero': {
                            color: 'rgba(20,100,80,20)',
                            reporte01: { num1: 0, num2: 0 },
                            reporte02: 0,
                            reporte03: 0,
                            reporte04: 0,
                        },
                        'Febrero': {
                            color: 'rgb(39,39,129,9)',
                            reporte01: { num1: 0, num2: 0 },
                            reporte02: 0,
                            reporte03: 0,
                            reporte04: 0,
                        },
                        'Marzo': {
                            color: 'rgb(255,145,11)',
                            reporte01: { num1: 0, num2: 0 },
                            reporte02: 0,
                            reporte03: 0,
                            reporte04: 0,
                        },
                        'Abril': {
                            color: 'rgb(135,145,11)',
                            reporte01: { num1: 0, num2: 0 },
                            reporte02: 0,
                            reporte03: 0,
                            reporte04: 0,
                        },
                        'Mayo': {
                            color: 'rgb(241,90,36)',
                            reporte01: { num1: 0, num2: 0 },
                            reporte02: 0,
                            reporte03: 0,
                            reporte04: 0,
                        },
                        'Junio': {
                            color: 'rgb(117,76,36)',
                            reporte01: { num1: 0, num2: 0 },
                            reporte02: 0,
                            reporte03: 0,
                            reporte04: 0,
                        },
                        'Julio': {
                            color: 'rgb(0,169,157)',
                            reporte01: { num1: 0, num2: 0 },
                            reporte02: 0,
                            reporte03: 0,
                            reporte04: 0,
                        },
                        'Agosto': {
                            color: 'rgb(27,20,100)',
                            reporte01: { num1: 0, num2: 0 },
                            reporte02: 0,
                            reporte03: 0,
                            reporte04: 0,
                        },
                        'Setiembre': {
                            color: 'rgb(0,113,188)',
                            reporte01: { num1: 0, num2: 0 },
                            reporte02: 0,
                            reporte03: 0,
                            reporte04: 0,
                        },
                        'Octubre': {
                            color: 'rgb(217,224,33)',
                            reporte01: { num1: 0, num2: 0 },
                            reporte02: 0,
                            reporte03: 0,
                            reporte04: 0,
                        },
                        'Noviembre': {
                            color: 'rgb(255,145,11)',
                            reporte01: { num1: 0, num2: 0 },
                            reporte02: 0,
                            reporte03: 0,
                            reporte04: 0,
                        },
                        'Diciembre': {
                            color: 'rgb(237,28,36)',
                            reporte01: { num1: 0, num2: 0 },
                            reporte02: 0,
                            reporte03: 0,
                            reporte04: 0,
                        }
                    };
                    $('#canvas-reporte-1').parent().html('<canvas id="canvas-reporte-1"></canvas>');
                    $('#card-data-4').parent().html('<canvas id="card-data-4"></canvas>');

                    $.CloseStatusBar();

                    //reporte orden de compra y compras en monto por mes

                    var myDataRpt1 = result['q_logistica_reportes_resumen_mes'].result.rows;
                    var myDataRpt1_1 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

                    if (myDataRpt1.length != 0) {
                        $('#noreporte1').hide();
                        $('#reporte1').show();

                        for (var item in myDataRpt1) {
                            var inrow = myDataRpt1[item];
                            myDataRpt1_1[inrow.MES - 1] = inrow.TOTAL;
                        }
                        fnReporte01('canvas-reporte-1', mesesArray, myDataRpt1_1);
                    }
                    else {
                        $('#noreporte1').show();
                        $('#reporte1').hide();
                    }

                    //cantidad de boletas y facturas al año
                    var myDataRpt2 = result['q_logistica_reportes_resumen_canttipodocs'].result.rows;
                    if (myDataRpt2.length != 0) {
                        var marcador = false;
                        for (var item in myDataRpt2) {
                            var inrow = myDataRpt2[item];
                            if (inrow.TOTAL != 0) {
                                marcador = true;
                            }
                        }
                        if (marcador) {
                            $('#noreporte2').hide();
                            $('#reporte2').show();
                            fnReporte02(myDataRpt2);
                        }
                        else {
                            $('#noreporte2').show();
                            $('#reporte2').hide();
                        }
                    }
                    else {
                        $('#noreporte2').show();
                        $('#reporte2').hide();
                    }

                    // reporte varios
                    var myDataRpt3 = result['q_logistica_reportes_resumen_varios_compras'].result.rows[0];
                    if (myDataRpt3.VENTAS_HOY_MONTO == 0 && myDataRpt3.VENTAS_MES_MONTO == 0 && myDataRpt3.VENTAS_ANUAL_MONTO == 0) {
                        $('#noreporte3').show();
                        $('#reporte3').hide();
                    }
                    else {
                        $('#reporte3').show();
                        $('#noreporte3').hide();
                        $('#ventas_hoy_monto').text(myDataRpt3.VENTAS_HOY_MONTO);
                        $('#ventas_hoy_cantidad').text(myDataRpt3.VENTAS_HOY_CANTIDAD + ' UND.');
                        $('#ventas_mes_monto').text(myDataRpt3.VENTAS_MES_MONTO);
                        $('#ventas_mes_cantidad').text(myDataRpt3.VENTAS_MES_CANTIDAD + ' UND.');
                        $('#ventas_anual_monto').text(myDataRpt3.VENTAS_ANUAL_MONTO);
                        $('#ventas_anual_cantidad').text(myDataRpt3.VENTAS_ANUAL_CANTIDAD + ' UND.');
                    }

                    // reporte ultimos 2 meses 
                    var myDataRpt4 = result['q_logistica_reportes_resumen_compras_ultimos_meses'].result.rows;
                    var myDataRpt4_1 = result['q_logistica_reportes_resumen_compras_ultimos_meses_pasado'].result.rows;

                    var arrDias = [];

                    if (myDataRpt4.map(item => (item.TOTAL)).reduce((prev, next) => prev + next) != 0 || myDataRpt4_1.map(item => (item.TOTAL)).reduce((prev, next) => prev + next) != 0) {
                        for (var i = 0; i < $('#DIA_ACTUAL').val(); i++) {
                            arrDias.push(myDataRpt4[i]['DIA']);
                        }

                        var myDataRpt4_data_1 = [];
                        for (var i = 0; i < myDataRpt4.length; i++) {
                            myDataRpt4_data_1.push(myDataRpt4[i]['TOTAL']);
                        }

                        var myDataRpt4_data_2 = [];
                        for (var i = 0; i < myDataRpt4_1.length; i++) {
                            myDataRpt4_data_2.push(myDataRpt4_1[i]['TOTAL']);
                        }

                        $('#reporte5').show();
                        $('#noreporte5').hide();
                        fnReporte04('card-data-4', arrDias, myDataRpt4_data_1, myDataRpt4_data_2);
                    }
                    else {
                        $('#noreporte5').show();
                        $('#reporte5').hide();
                    }

                    // reporte semanal
                    var myDataRpt5 = result['q_logisticas_reportes_resumen_compras_semanal'].result.rows;
                    var arrSemanas = [];
                    if (myDataRpt5.length != 0) {
                        var marcador2 = false;

                        for (var item in myDataRpt5) {
                            var inrow = myDataRpt5[item];
                            if (inrow.TOTAL != 0) {
                                marcador2 = true;
                            }
                        }
                        if (marcador2) {
                            $('#reporte4').show();
                            $('#noreporte4').hide();

                            var myDataRpt5_1 = [];
                            for (var i = 1; i <= ($('#SEMANA_ACTUAL_ANUAL').val() - $('#SEMANA_PRIMER_DIA_MES_ANUAL').val()) + 1; i++) {
                                arrSemanas.push("SEMANA " + i);
                                myDataRpt5_1.push(myDataRpt5[i - 1].TOTAL);
                            }
                            fnReporte03('canvas-reporte-3', arrSemanas, myDataRpt5_1);
                        }
                        else {
                            $('#noreporte4').show();
                            $('#reporte4').hide();
                        }
                    }
                    else {
                        $('#noreporte4').show();
                        $('#reporte4').hide();
                    }

                    var myDataRpt6 = result['q_logistica_reportes_resumen_totalcomprasmeses'].result.rows;
                    if (myDataRpt6.map(item => (parseFloat(item.TOTAL))).reduce((prev, next) => prev + next) != 0) {
                        $('#reporte6').show();
                        $('#noreporte6').hide();
                        fnReporte05(myDataRpt6);
                    }
                    else {
                        $('#noreporte6').show();
                        $('#reporte6').hide();
                    }

                },
                onError: function (error) {
                    $.CloseStatusBar();
                    $.ShowError({ error: error });
                }
            });
        };

        $('form[name=filterPeriodo]').ValidForm({
            type: -1,
            onDone: function (form, controls) {
                mycontrols = controls;
                fnObtenerData();
            },
            onReady: function () {
                fnObtenerData();
            }
        });

    });
});