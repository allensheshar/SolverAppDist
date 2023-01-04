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
                            label: 'VENTAS',
                            backgroundColor: 'rgba(184,227,236)',
                            borderColor: 'rgb(4,139,168)',
                            pointBorderWidth: 1,
                            pointHitRadius: 3,
                            pointBorderColor: 'rgb(4,139,168)',
                            pointBackgroundColor: 'white',
                            data: data,
                            fill: 'start',
                        },
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
        //const fnReporte02 = function (data) {
        //    for (var item in data) {
        //        var inrow = data[item];
        //        if (inrow.TIPO == 'BOLETA') {
        //            $('#bol').text(`${inrow.TOTAL} (${inrow.CANTIDAD})`);
        //        }
        //        if (inrow.TIPO == 'FACTURA') {
        //            $('#fac').text(`${inrow.TOTAL} (${inrow.CANTIDAD})`);
        //        }
        //        if (inrow.TIPO == 'PENDIENTE') {
        //            $('#pen').text(`${inrow.TOTAL} (${inrow.CANTIDAD})`);
        //        }
        //        if (inrow.TIPO == 'ANULADA') {
        //            $('#anu').text(`${inrow.TOTAL} (${inrow.CANTIDAD})`);
        //        }
        //    }
        //};
        const fnReporte03 = function (content, labels, data) {
            var config = {
                type: 'horizontalBar',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: 'VENTAS SEMANALES',
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
        const fnReporteMesPlato = function (content, labels, data, data2) {
            $('#canvas-reporte-mes-plato-padre').html('<canvas id="canvas-reporte-mes-plato"></canvas>');
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
        }

        const fnObtenerData = function () {
            $.GetQuery({
                query: [
                    'q_rest_reportes_resumen_ventas_mensual_grafico',
                    'q_rest_reportes_resumen_estados_pedidos',
                    'q_rest_reportes_resumen_totalventasmeses',
                    'q_rest_reportes_resumen_varios',
                    'q_rest_reportes_resumen_plato_ultimos_meses',
                    'q_rest_reportes_resumen_plato_ultimos_meses_pasado',
                    'q_ventas_reportes_resumen_ventas_semanal_v2'
                ],
                items: [
                    { empresa: $.solver.session.SESSION_EMPRESA, anio: function () { return $(mycontrols.anio).val(); } },
                    { empresa: $.solver.session.SESSION_EMPRESA, anio: function () { return $(mycontrols.anio).val(); } },
                    { empresa: $.solver.session.SESSION_EMPRESA, anio: function () { return $(mycontrols.anio).val(); } },
                    { empresa: $.solver.session.SESSION_EMPRESA, anio: function () { return $(mycontrols.anio).val(); } },
                    { empresa: $.solver.session.SESSION_EMPRESA, anio: function () { return $(mycontrols.anio).val(); }, plato: function () { return $('#plato').val(); } },
                    { empresa: $.solver.session.SESSION_EMPRESA, anio: function () { return $(mycontrols.anio).val(); }, plato: function () { return $('#plato').val(); } },
                    { empresa: $.solver.session.SESSION_EMPRESA, anio: function () { return $(mycontrols.anio).val(); } }
                ],
                onBefore: function () {
                    $.DisplayStatusBar({
                        message: 'Actualizando reporte, espere un momento...'
                    });
                },
                onReady: function (result) {
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

                    //reporte cotizaciones y ventas en monto por mes
                    var myDataRpt1 = result['q_rest_reportes_resumen_ventas_mensual_grafico'].result.rows;
                    var myDataRpt1_1 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

                    var myDataRpt1_data = []
                    for (var item in myDataRpt1){
                        if (myDataRpt1[item]['TOTAL'] != 0) {
                            myDataRpt1_data.push(myDataRpt1[item]);
                        }
                    }

                    if (myDataRpt1_data.length != 0) {
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

                    // reporte varios
                    var myDataRpt3 = result['q_rest_reportes_resumen_varios'].result.rows[0];

                    if (myDataRpt3.VENTAS_HOY_MONTO == 0 && myDataRpt3.VENTAS_MES_MONTO == 0 && myDataRpt3.VENTAS_ANUAL_MONTO == 0) {
                        $('#noreporte3').show();
                    }
                    else {
                        $('#reporte3').show();
                        $('#ventas_hoy_monto').text(myDataRpt3.VENTAS_HOY_MONTO);
                        $('#ventas_mes_monto').text(myDataRpt3.VENTAS_MES_MONTO);
                        $('#ventas_anual_monto').text(myDataRpt3.VENTAS_ANUAL_MONTO);
                    }

                    var myDataRpt6 = result['q_rest_reportes_resumen_totalventasmeses'].result.rows;

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
        const fnObtenerImagen = function () {
            const idPlato = $('#plato').val();
            $.GetQuery({
                query: ['q_rest_reportes_resumen_imagen_plato', 'q_rest_reportes_resumen_plato_ultimos_meses', 'q_rest_reportes_resumen_plato_ultimos_meses_pasado'],
                items: [
                    { C_EMPRESA: $.solver.session.SESSION_EMPRESA, IdPlato: idPlato },
                    { empresa: $.solver.session.SESSION_EMPRESA, anio: function () { return $(mycontrols.anio).val(); }, plato: idPlato },
                    { empresa: $.solver.session.SESSION_EMPRESA, anio: function () { return $(mycontrols.anio).val(); }, plato: idPlato },
                ],
                onError: function (error) {
                },
                onReady: function (result) {
                    var imgPlato = result['q_rest_reportes_resumen_imagen_plato'].result.rows;
                    var mes = result['q_rest_reportes_resumen_plato_ultimos_meses'].result.rows;
                    var mesPasado = result['q_rest_reportes_resumen_plato_ultimos_meses_pasado'].result.rows;
                    if (imgPlato[0].Imagen != '') {
                        $('#fotoPlato').attr('src', `${$.solver.services.api}service/viewfile/${imgPlato[0].Imagen}`);
                    }
                    else {
                        $('#fotoPlato').attr('src', `../Content/Images/no.png`);
                    }

                    var arrDias = [];

                    for (var i = 0; i < mes.length; i++) {
                        arrDias.push(mes[i]['DIA']);
                    }

                    var mes_data = [];
                    for (var i = 0; i < mes.length; i++) {
                        mes_data.push(mes[i]['TOTAL']);
                    }

                    var mes_data_pasado = [];
                    for (var i = 0; i < mesPasado.length; i++) {
                        mes_data_pasado.push(mesPasado[i]['TOTAL']);
                    }

                    fnReporteMesPlato('canvas-reporte-mes-plato', arrDias, mes_data, mes_data_pasado);
                }
            })

        }

        //$('form[name=filterPeriodo]').ValidForm({
        //    type: -1,
        //    onDone: function (form, controls) {
        //        mycontrols = controls;
        //        $('#plato').FieldLoadRemote({
        //            onReady: function () {
        //                fnObtenerImagen();
        //            }
        //        });

        //        $('#plato').change(function () {
        //            fnObtenerImagen();
        //        })

        //        fnObtenerData();
        //    },
        //    onReady: function () {
        //        fnObtenerData();
        //        $('#plato').trigger('change')
        //    }
        //});

    });
});