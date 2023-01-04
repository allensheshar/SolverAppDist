require(['helper', 'chartjs', 'sortablejs', 'inputmask', 'bootstrap-select'], function () {
    require(['moment', 'numeral', 'bootbox', 'alertify'], function (moment, numeral, bootbox, alertify) {

        alertify.set('notifier', 'position', 'top-center');

        if ($.solver.basePath != '/ventas') {
            $('#title-card-reporte-1').text('Estatus de Pedidos y ventas')
        }

        const mesesArray = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Set', 'Oct', 'Nov', 'Dic'];
        const mesesCompletosArray = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Setiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        let mycontrols = null;

        const fnObtenerData = function () {

            var items = {
                base: $.solver.basePath,
                empresa: $.solver.session.SESSION_EMPRESA,
                anio: function () { return $(mycontrols.anio).val(); },
                mes: function () { return $(mycontrols.mes).val(); },
                mesero: function () { return '%' + ($(mycontrols.mesero).val() || '') + '%'; },
                cajero: function () { return '%' + $(mycontrols.cajero).val() + '%'; },
                cliente: function () { return '%' + $(mycontrols.cliente).val() + '%' },
                tipo: function () { return $(mycontrols.tipo).val() }
            }

            $.GetQuery({
                query: [
                    'q_ventas_reportes_resumen_cotizaciones_mes_v2',
                    'q_ventas_reportes_resumen_ventas_mes_v2',
                    'q_ventas_reportes_resumen_detalle_mes_v2',
                    'q_ventas_reportes_resument_canttipodocs_v2',
                    'q_ventas_reportes_resumen_totalventasmeses',
                    'q_ventas_reportes_resumen_varios_ventas_v2',
                    'q_ventas_reportes_resumen_ventas_ultimos_meses',
                    'q_ventas_reportes_resumen_ventas_ultimos_meses_pasado',
                    'q_ventas_reportes_resumen_ventas_semanal_v2'
                ],
                items: [
                    items,
                    items,
                    items,
                    items,
                    items,
                    items,
                    items,
                    items,
                    items,
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
                    $('#canvas-reporte-3').parent().html('<canvas id="canvas-reporte-3"></canvas>');
                    $('#card-data-4').parent().html('<canvas id="card-data-4"></canvas>');

                    $.CloseStatusBar();

                    //reporte cotizaciones y ventas en monto por mes
                    var myDataRpt0 = result['q_ventas_reportes_resumen_cotizaciones_mes_v2'].result.rows;
                    var myDataRpt0_0 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

                    var myDataRpt1 = result['q_ventas_reportes_resumen_ventas_mes_v2'].result.rows;
                    var myDataRpt1_1 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

                    var dataReporteDetalle = result['q_ventas_reportes_resumen_detalle_mes_v2'].result.rows;
                    var dataReporteDetalle_1 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

                    if (myDataRpt0.length != 0 || myDataRpt1.length != 0 || dataReporteDetalle.length != 0) {
                        $('#noreporte1').hide();
                        $('#reporte1').show();

                        for (var item in myDataRpt1) {
                            var inrow = myDataRpt1[item];
                            myDataRpt1_1[inrow.MES - 1] = inrow.TOTAL;
                        }

                        for (var item in myDataRpt0) {
                            var inrow = myDataRpt0[item];
                            myDataRpt0_0[inrow.MES - 1] = inrow.TOTAL;
                        }

                        for (var item in dataReporteDetalle) {
                            var inrow = dataReporteDetalle[item];
                            dataReporteDetalle_1[inrow.MES - 1] = inrow.TOTAL;
                        }

                        fnReporte01('canvas-reporte-1', mesesArray, myDataRpt0_0, myDataRpt1_1, dataReporteDetalle_1);
                    }
                    else {
                        $('#noreporte1').show();
                        $('#reporte1').hide();
                    }

                    //cantidad de boletas y facturas al año
                    var myDataRpt2 = result['q_ventas_reportes_resument_canttipodocs_v2'].result.rows;
                    if (myDataRpt2.map(item => (parseFloat(item.TOTAL))).reduce((prev, next) => prev + next) != 0) {
                        $('#noreporte2').hide();
                        $('#reporte2').show();
                        fnReporte02(myDataRpt2);
                    }
                    else {
                        $('#noreporte2').show();
                        $('#reporte2').hide();
                    }

                    // reporte varios
                    var myDataRpt3 = result['q_ventas_reportes_resumen_varios_ventas_v2'].result.rows[0];

                    if (myDataRpt3.VENTAS_HOY_MONTO == 0 && myDataRpt3.VENTAS_MES_MONTO == 0 && myDataRpt3.VENTAS_ANUAL_MONTO == 0) {
                        $('#reporte3').hide();
                        $('#noreporte3').show();
                    }
                    else {
                        $('#reporte3').show();
                        $('#noreporte3').hide();
                        $('#ventas_hoy_monto').text(numeral(myDataRpt3.VENTAS_HOY_MONTO).format('0,0.00'));
                        $('#ventas_mes_monto').text(numeral(myDataRpt3.VENTAS_MES_MONTO).format('0,0.00'));
                        $('#ventas_anual_monto').text(numeral(myDataRpt3.VENTAS_ANUAL_MONTO).format('0,0.00'));
                        $('#cantidad_hoy_monto').text(numeral(myDataRpt3.VENTAS_HOY_CANTIDAD).format('0,0'));
                        $('#cantidad_mes_monto').text(numeral(myDataRpt3.VENTAS_MES_CANTIDAD).format('0,0'));
                        $('#cantidad_anual_monto').text(numeral(myDataRpt3.VENTAS_ANUAL_CANTIDAD).format('0,0'));
                    }

                    // reporte ultimos 2 meses 
                    var myDataRpt4 = result['q_ventas_reportes_resumen_ventas_ultimos_meses'].result.rows;
                    var myDataRpt4_1 = result['q_ventas_reportes_resumen_ventas_ultimos_meses_pasado'].result.rows;

                    var arrDias = [];

                    if (myDataRpt4.map(item => (item.TOTAL)).reduce((prev, next) => prev + next) != 0 || myDataRpt4_1.map(item => (item.TOTAL)).reduce((prev, next) => prev + next) != 0) {
                        for (var i = 0; i < $('#DIA_ACTUAL').val(); i++) {
                            if (i < myDataRpt4.length) {
                                arrDias.push(myDataRpt4[i]['DIA']);
                            }
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
                    var myDataRpt5 = result['q_ventas_reportes_resumen_ventas_semanal_v2'].result.rows;
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
                        $('#noreporte4').hide();
                        $('#reporte4').hide();
                    }

                    var myDataRpt6 = result['q_ventas_reportes_resumen_totalventasmeses'].result.rows;

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
        const fnReporte01 = function (content, labels, data, data2, data3) {
            var datasets = [];

            if ($.solver.basePath == '/ventas') {
                datasets.push({
                    label: 'COTIZACIONES',
                    backgroundColor: 'rgba(184,227,236)',
                    borderColor: 'rgb(4,139,168)',
                    pointBorderWidth: 1,
                    pointHitRadius: 3,
                    pointBorderColor: 'rgb(4,139,168)',
                    pointBackgroundColor: 'white',
                    data: data,
                    fill: 'start',
                })
            }

            var buttonSelected = $('.btn-tipo-grafico-selected').attr('data-id')

            if (buttonSelected == 'V' || buttonSelected == '') {
                datasets.push({
                    label: 'VENTAS',
                    backgroundColor: 'rgba(179,244,221)',
                    borderColor: 'rgb(22,219,147)',
                    pointBorderWidth: 1,
                    pointHitRadius: 3,
                    pointBorderColor: 'rgb(22,219,147)',
                    pointBackgroundColor: 'white',
                    data: data2,
                    fill: 'start',
                })
            }

            if (buttonSelected == 'P') {
                datasets.push({
                    label: 'PEDIDOS',
                    backgroundColor: 'rgba(247,236,197)',
                    borderColor: 'rgb(255,124,20)',
                    pointBorderWidth: 1,
                    pointHitRadius: 3,
                    pointBorderColor: 'rgb(255,124,20)',
                    pointBackgroundColor: 'white',
                    data: data3,
                    fill: 'start',
                })
            }

            var config = {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: datasets
                },
                actions: [{
                    name: 'Randomize',
                    handler(chart) {
                        chart.data.datasets.forEach(dataset => {
                            dataset.data = Utils.numbers({ count: chart.data.labels.length, min: -100, max: 100 });
                        });
                        chart.update();
                    }
                }],
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
        const fnReporte02 = function (data) {
            var totalMonto = 0;
            var totalCantidad = 0;

            for (var item in data) {
                var inrow = data[item];
                var total = numeral(inrow.TOTAL).format('0,0.00')
                var cantidad = numeral(inrow.CANTIDAD).value()
                if (inrow.TIPO == 'BOLETA') {
                    $('#bol').text(total);
                    $('#cbol').text(cantidad);
                }
                if (inrow.TIPO == 'FACTURA') {
                    $('#fac').text(total);
                    $('#cfac').text(cantidad);
                }
                if (inrow.TIPO == 'NOTA DE CRÉDITO') {
                    $('#nc').text(total);
                    $('#cnc').text(cantidad);
                }
                if (inrow.TIPO == 'NOTA DE DÉBITO') {
                    $('#nd').text(total);
                    $('#cnd').text(cantidad);
                }
                if (inrow.TIPO == 'PENDIENTE') {
                    $('#pen').text(total);
                    $('#cpen').text(cantidad);
                }
                if (inrow.TIPO == 'OBSERVADAS') {
                    $('#obs').text(total);
                    $('#cobs').text(cantidad);
                }
                if (inrow.TIPO == 'BOLETA' || inrow.TIPO == 'FACTURA' || inrow.TIPO == 'NOTA DE DÉBITO') {
                    totalMonto += numeral(inrow.TOTAL).value()
                    totalCantidad += cantidad;
                }
                if (inrow.TIPO == 'NOTA DE CRÉDITO') {
                    totalMonto -= inrow.TOTAL;
                    totalCantidad += inrow.CANTIDAD;
                }
            }
            $('#tot_monto').text(numeral(totalMonto).format('0,0.00'))
            $('#tot_cant').text(numeral(totalCantidad).value())
        };
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
                        callbacks: {
                            label: function (tooltipItem, data) {
                                return tooltipItem.xLabel.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
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
                        display: false,
                        labels: {
                            fontSize: 12,
                            fontStyle: 'bold',
                            fontColor: '#000000'
                        }
                    },

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
                            label: mesesCompletosArray[(parseInt($('#MES_ACTUAL').val()) - 1 == 0 ? 11 : parseInt($('#MES_ACTUAL').val()) - 2)].toUpperCase(),
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
            var ctx = document.getElementById(content).getContext('2d');
            var char = new Chart(ctx, config);
            return char;
        };
        const fnReporte05 = function (data) {
            for (var item in data) {
                var inrow = data[item];
                var total = numeral(inrow.TOTAL).format('0,0.00');
                if (inrow.MES == '1') $('#ene').text(total);
                if (inrow.MES == '2') $('#feb').text(total);
                if (inrow.MES == '3') $('#mar').text(total);
                if (inrow.MES == '4') $('#abr').text(total);
                if (inrow.MES == '5') $('#may').text(total);
                if (inrow.MES == '6') $('#jun').text(total);
                if (inrow.MES == '7') $('#jul').text(total);
                if (inrow.MES == '8') $('#ago').text(total);
                if (inrow.MES == '9') $('#set').text(total);
                if (inrow.MES == '10') $('#oct').text(total);
                if (inrow.MES == '11') $('#nov').text(total);
                if (inrow.MES == '12') $('#dic').text(total);
            }
        };

        if ($.solver.basePath == '/ventas') {
            $('select[name=tipo]').val('E').attr('disabled','disabled')
        }

        $('form[name=filterPeriodo]').ValidForm({
            type: -1,
            onDone: function (form, controls) {

                $.GetQuery({
                    query: ['q_ventas_reportes_resumen_obtener_data_inicial'],
                    onReady: function (res) {

                        $('#SEMANA_ACTUAL_ANUAL').val(res[0].SEMANA_ACTUAL_ANUAL)
                        $('#SEMANA_PRIMER_DIA_MES_ANUAL').val(res[0].SEMANA_PRIMER_DIA_MES_ANUAL)

                        $(controls.cliente).selectpicker();

                        mycontrols = controls;
                        fnObtenerData();

                        if ($.solver.basePath == '/restaurant') {
                            $('#canva-actions').show();
                            $('.restaurant').show();
                        }
                        else {
                            $('.no-restaurant').addClass('mt-5')
                            $('#canva-actions').hide();
                        }

                        $('.btn-tipo-grafico').click(function () {
                            $('.btn-tipo-grafico').removeClass('btn-secondary')
                            $('.btn-tipo-grafico').addClass('btn-outline-secondary')
                            $('.btn-tipo-grafico').removeClass('btn-tipo-grafico-selected')

                            $(this).removeClass('btn-outline-secondary')
                            $(this).addClass('btn-secondary')
                            $(this).addClass('btn-tipo-grafico-selected')

                            fnObtenerData();
                        })

                    }
                })

            },
            onReady: function () {
                fnObtenerData();
            }
        });

        // Mostrar Resumen de Comprobantes pendientes (Pedido por Julio)
        // Christopher Baltazar 10/03/2022
        // Esto solo se mostrará si esta en el modulo de ventas
        const fnMostrarComprobantesPendientes = function () {
            $.solver.fn.fnAbrirModal({
                query: 'gbl_ventas_procesos_resumen_comprobantes_pendientes',
                hiddens: [''],
                title: 'Comprobantes pendientes',
                columns: {
                    _rowNum: {
                        text: '#',
                        width: '30',
                        cellsAlign: 'center',
                        hidden: false,
                        pinned: true,
                        editable: false,
                        sortable: false
                    },
                    'FECHA_EMISION': {
                        text: 'Fecha emisión',
                        width: 90,
                        cellsAlign: 'center',
                    },
                    'TIPO_DOCUMENTO': {
                        text: 'Tipo de documento',
                        width: 110
                    },
                    'COMPROBANTE': {
                        text: 'Comprobante',
                        width: 100
                    },
                    'COMPROBANTE_VENTA': {
                        text: 'Comprobante ref.',
                        width: 100
                    },
                    'CLIENTE': {
                        text: 'Cliente',
                        width: 150
                    },
                    'MONEDA': {
                        text: 'Moneda',
                        width: 90,
                        cellsAlign: 'center'
                    },
                    'TOTAL': {
                        text: 'Total',
                        width: 80,
                        cellsAlign: 'right',
                        cellsFormat: 'd2',
                        columnType: 'numberinput',
                        aggregates: ['sum'],
                        aggregatesRenderer: function (aggregates, column, element) {
                            var formatNumber = aggregates.sum;
                            if (formatNumber === undefined)
                                formatNumber = '';
                            return `<div class="h-30 d-flex justify-content-center align-items-center font-weight-bold">
                                <strong> ${formatNumber} </strong>
                            </div>`;
                        }
                    },
                    'ESTADO': {
                        text: 'Estado',
                        width: 100,
                        cellsAlign: 'center',
                        cellsrenderer: function (row, columnfield, value, defaulthtml, columnproperties) {
                            if (value == 'Pendiente') return '<div class="mt-2 jqx-grid-cell-middle-align"><span class="text-extra" style="color:blue;"><i class="fa fa-asterisk" aria-hidden="true"></i> ' + value + '</span></div>';
                            if (value == 'En cola') return '<div class="mt-2 jqx-grid-cell-middle-align"><span class="text-extra" style="color:blue;"><i class="fa fa-asterisk" aria-hidden="true"></i> ' + value + '</span></div>';
                            if (value == 'Aprobada') return '<div class="mt-2 jqx-grid-cell-middle-align"><span class="text-extra" style="color:green;"><i class="fa fa-check-circle" aria-hidden="true"></i> ' + value + '</span></div>';
                            if (value == 'Enviada') return '<div class="mt-2 jqx-grid-cell-middle-align"><span class="text-extra" style="color:red;"><i class="fa fa-exclamation-circle" aria-hidden="true"></i> ' + value + '</span></div>';
                            if (value == 'Observada') return '<div class="mt-2 jqx-grid-cell-middle-align"><span class="text-extra" style="color:#ffc107;"><i class="fa fa-exclamation-triangle" aria-hidden="true"></i> ' + value + '</span></div>';
                            if (value == 'Anulada') return '<div class="mt-2 jqx-grid-cell-middle-align"><span class="text-extra" style="color:red;"><i class="fa fa-trash" aria-hidden="true"></i> ' + value + '</span></div>';
                            if (value == 'Pendiente anular') return '<div class="mt-2 jqx-grid-cell-middle-align"><span class="text-extra" style="color:blue;"><i class="fa fa-asterisk" aria-hidden="true"></i> ' + value + '</span></div>';
                        }
                    },
                    'FECHA_CREACION': {
                        text: 'Fecha creación',
                        width: 130,
                        cellsAlign: 'center'
                    },
                    'C_USUARIO': {
                        text: 'Usuario',
                        width: 150
                    }
                },
                config: {
                    pageSize: 300,
                    height: 550,
                    virtualmode: true,
                    sortable: true,
                    editable: false,
                    showstatusbar: true,
                    statusbarheight: 20,
                    showaggregates: true,
                },
                onAfter: function (token, dialog) {
                    $(dialog).find('.modal-dialog').css({ 'max-width': '95%' })
                    $(dialog).find('.modal-dialog').css({ 'margin-top': '4%' })
                }
            });
        };

        //if ($.solver.basePath == '/ventas') {
        //    $.GetQuery({
        //        query: ['gbl_ventas_procesos_resumen_comprobantes_pendientes'],
        //        items: [{
        //            C_EMPRESA: $.solver.session.SESSION_EMPRESA,
        //            BUSCAR: ''
        //        }],
        //        onReady: function (result) {
        //            if (result.length > 0) fnMostrarComprobantesPendientes();
        //        }
        //    })
        //}

        const fnReprocesarXmlGelato = function () {

            let index = -1;

            const fnReprocesarXml = function (result) {

                if (result.length == index) {
                    $.CloseStatusBar();

                    return;
                }

                const data = result[index];
                const emisor = data.ID_EMISOR
                const comprobante = data.ID_COMPROBANTE;

                $.GetData({
                    uriData: $.solver.services.api + `/efacturacion/XmlComprobante/${emisor}/${comprobante}`,
                    isPage: true,
                    onError: function () {
                        $.CloseStatusBar();
                    },
                    onReady: function (res) {
                        alertify.success(res)
                        fnReprocesarXml(result, index++);
                    }
                })

            }

            $.GetQuery({
                query: ['q_gbl_reprocesar_comprobantes_gelato'],
                
                onReady: function (result) {
                    $.DisplayStatusBar({
                        message: 'Reenviando comprobante, espere por favor...'
                    });

                    const length = result.length;
                    //SRVSQL_FTE
                    fnReprocesarXml(result, index++);
                }
            })
        }
    });
});