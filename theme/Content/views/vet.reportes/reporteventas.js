require(["helper", "chartjs", "sortablejs", "extras", "controls", "datetimepicker"], function () {
    require(["alertify", "moment", "bootbox"], function (alertify, moment, bootbox) {
        alertify.set('notifier', 'position', 'top-center');

        let _controls;
        const table = '#table'
        var btnPrimary = 'secondary';
        var btnSecondary = 'warning';

        const fnDescargar = function () {
            var option = $('input[name=filtro]:checked').attr('data-label');
            var button = $($('.btn-reportes').filter(x => $($('.btn-reportes')[x]).hasClass('btn-' + btnSecondary))[0]).attr('data-reporte')
            $.GetQuery({
                query: ['q_gbl_obtener_filtros_ventas_tablas'],
                items: [{
                    flag: $.solver.basePath,
                    option,
                    button
                }],
                onReady: function (result) {
                    if (result.length > 0) {
                        var query = result[0].CODIGO_PARAMETRO_3.replace('q_', 'dw_');

                        $.DownloadFile({
                            nameFile: 'Ventas',
                            query,
                            params: {
                                C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                                FLAG: $.solver.basePath,
                                DESDE: function () {
                                    return $(_controls.desde).val();
                                },
                                HASTA: function () {
                                    return $(_controls.hasta).val();
                                },
                                TIPO: function () {
                                    return $(_controls.tipo).val();
                                }
                            }
                        });
                    }
                }
            });
        }
        const fnCrearBotones = function () {
            var reportes = $('input[name=filtro]:checked').attr('data-reportes');
            reportes = reportes.split(',');

            var html = '';
            var selected = '';
            $.each(reportes, function (i, reporte) {
                if (i == 0) selected = btnSecondary;
                else selected = btnPrimary;
                html += `
                    <button type="button" class="btn btn-lg btn-${selected} text-white btn-reportes" data-reporte="${reporte}">${reporte}</button>
                `;
            });
            $('#reportes').html(html);
            fnCrearTabla();

            $('.btn-reportes').unbind('click');
            $('.btn-reportes').bind('click', function () {
                $('.btn-reportes').each(function (i, v) {
                    $(v).removeClass('btn-' + btnSecondary);
                    $(v).removeClass('btn-' + btnSecondary);
                    $(v).addClass('btn-' + btnPrimary);
                });

                $(this).toggleClass('btn-' + btnSecondary);
                $(this).toggleClass('btn-' + btnPrimary);
                fnCrearTabla();
            });
        };
        const fnCrearTabla = function () {

            $('#divTable').html('<div id="table"></div>')

            var option = $('input[name=filtro]:checked').attr('data-label');
            var button = $($('.btn-reportes').filter(x => $($('.btn-reportes')[x]).hasClass('btn-' + btnSecondary))[0]).attr('data-reporte')
            $.GetQuery({
                query: ['q_gbl_obtener_filtros_ventas_tablas'],
                items: [{
                    flag: $.solver.basePath,
                    option,
                    button
                }],
                onReady: function (result) {
                    if (result.length > 0) {

                        var query = result[0].CODIGO_PARAMETRO_3;
                        var columns = result[0].CODIGO_PARAMETRO_4.split(',');

                        if (button == 'Resumen' && query != 'q_reportes_reporteventas_canal_resumen') {
                            columns = {
                                '_rowNum': {
                                    text: '#',
                                    width: '30',
                                    cellsAlign: 'center',
                                    hidden: false,
                                    pinned: true,
                                    editable: false,
                                    sortable: false
                                },
                                DESCRIPCION: {
                                    text: columns[0],
                                    width: 200,
                                    aggregatesRenderer: function (aggregates, column, element) {
                                        var formatNumber = aggregates.sum;
                                        if (formatNumber === undefined)
                                            formatNumber = '';
                                        return `<div class="h-30 d-flex justify-content-center align-items-center font-weight-bold">
                                            <strong> Total </strong>
                                        </div>`;
                                    }
                                },
                                TOTAL: {
                                    text: columns[1],
                                    width: 100,
                                    cellsAlign: 'right',
                                    cellsFormat: 'd2',
                                    aggregates: ['sum'],
                                    aggregatesRenderer: function (aggregates, column, element) {
                                        var formatNumber = aggregates.sum;
                                        if (formatNumber === undefined)
                                            formatNumber = '';
                                        return `<div class="d-flex justify-content-center font-weight-bold">
                                            <strong> ${formatNumber} </strong>
                                        </div>`;
                                    }
                                },
                                NRO_DOCS: {
                                    text: columns[2],
                                    width: 80,
                                    cellsAlign: 'right',
                                    cellsFormat: 'd',
                                    aggregates: ['sum'],
                                    aggregatesRenderer: function (aggregates, column, element) {
                                        var formatNumber = aggregates.sum;
                                        if (formatNumber === undefined)
                                            formatNumber = '';
                                        return `<div class="d-flex justify-content-center font-weight-bold">
                                            <strong> ${formatNumber} </strong>
                                        </div>`;
                                    }
                                },
                                '%': {
                                    width: 80,
                                    cellsrenderer: function (row, columnfield, value, defaulthtml, columnproperties) {
                                        var filas = $(table).jqxGrid('getrows');
                                        var num = filas[row].TOTAL;

                                        var total = 0;
                                        $.each(filas, function (i, v) {
                                            total += v.TOTAL;
                                        });

                                        return '<div class="jqx-grid-cell-middle-align" style="margin-top: 4px;">' + ((num / total) * 100).toFixed(2) + '%</div>'
                                    },
                                    aggregates: ['sum'], aggregatesRenderer: function (aggregates, column, element) {
                                        return `<div class="d-flex justify-content-center font-weight-bold">
                                                    <strong>100%</strong>
                                                </div>`;
                                    }
                                }
                            }
                        }

                        if (button == 'Resumen' && query == 'q_reportes_reporteventas_canal_resumen') {
                            columns = {
                                '_rowNum': {
                                    text: '#',
                                    width: '30',
                                    cellsAlign: 'center',
                                    hidden: false,
                                    pinned: true,
                                    editable: false,
                                    sortable: false
                                },
                                DESCRIPCION: {
                                    text: columns[0],
                                    width: 200,
                                    aggregatesRenderer: function (aggregates, column, element) {
                                        var formatNumber = aggregates.sum;
                                        if (formatNumber === undefined)
                                            formatNumber = '';
                                        return `<div class="h-30 d-flex justify-content-center align-items-center font-weight-bold">
                                            <strong> Total </strong>
                                        </div>`;
                                    }
                                },
                                TOTAL: {
                                    text: columns[1],
                                    width: 100,
                                    cellsAlign: 'right',
                                    cellsFormat: 'd2',
                                    aggregates: ['sum'],
                                    aggregatesRenderer: function (aggregates, column, element) {
                                        var formatNumber = aggregates.sum;
                                        if (formatNumber === undefined)
                                            formatNumber = '';
                                        return `<div class="d-flex justify-content-center font-weight-bold">
                                            <strong> ${formatNumber} </strong>
                                        </div>`;
                                    }
                                },
                                NRO_DOCS: {
                                    text: columns[2],
                                    width: 80,
                                    cellsAlign: 'right',
                                    cellsFormat: 'd',
                                    aggregates: ['sum'],
                                    aggregatesRenderer: function (aggregates, column, element) {
                                        var formatNumber = aggregates.sum;
                                        if (formatNumber === undefined)
                                            formatNumber = '';
                                        return `<div class="d-flex justify-content-center font-weight-bold">
                                            <strong> ${formatNumber} </strong>
                                        </div>`;
                                    }
                                },
                                PAX: {
                                    text: columns[3],
                                    width: 100,
                                    cellsAlign: 'right',
                                    cellsFormat: 'd2',
                                    aggregates: ['sum'],
                                    aggregatesRenderer: function (aggregates, column, element) {
                                        var formatNumber = aggregates.sum;
                                        if (formatNumber === undefined)
                                            formatNumber = '';
                                        return `<div class="d-flex justify-content-center font-weight-bold">
                                            <strong> ${formatNumber} </strong>
                                        </div>`;
                                    }
                                },
                                DELIVERY: {
                                    text: columns[4],
                                    width: 100,
                                    cellsAlign: 'right',
                                    cellsFormat: 'd2',
                                    aggregates: ['sum'],
                                    aggregatesRenderer: function (aggregates, column, element) {
                                        var formatNumber = aggregates.sum;
                                        if (formatNumber === undefined)
                                            formatNumber = '';
                                        return `<div class="d-flex justify-content-center font-weight-bold">
                                            <strong> ${formatNumber} </strong>
                                        </div>`;
                                    }
                                },
                                '%': {
                                    width: 80,
                                    cellsrenderer: function (row, columnfield, value, defaulthtml, columnproperties) {
                                        var filas = $(table).jqxGrid('getrows');
                                        var num = filas[row].TOTAL;

                                        var total = 0;
                                        $.each(filas, function (i, v) {
                                            total += v.TOTAL;
                                        });

                                        return '<div class="jqx-grid-cell-middle-align" style="margin-top: 4px;">' + ((num / total) * 100).toFixed(2) + '%</div>'
                                    },
                                    aggregates: ['sum'], aggregatesRenderer: function (aggregates, column, element) {
                                        return `<div class="d-flex justify-content-center font-weight-bold">
                                                    <strong>100%</strong>
                                                </div>`;
                                    }
                                }
                            }
                        }

                        if (button == 'Por Producto' || button == 'Por Plato' || button == 'Por Mesero' || button == 'Por Vendedor') {
                            columns = {
                                '_rowNum': {
                                    text: '#',
                                    width: '30',
                                    cellsAlign: 'center',
                                    hidden: false,
                                    pinned: true,
                                    editable: false,
                                    sortable: false
                                },
                                DESCRIPCION: {
                                    text: button,

                                },
                                PRODUCTO: {
                                    text: columns[0],
                                    width: 250,
                                    aggregatesRenderer: function (aggregates, column, element) {
                                        var formatNumber = aggregates.sum;
                                        if (formatNumber === undefined)
                                            formatNumber = '';
                                        return `<div class="h-30 d-flex justify-content-center align-items-center font-weight-bold">
                                            <strong> Total </strong>
                                        </div>`;
                                    }
                                },
                                TOTAL: {
                                    text: columns[1],
                                    width: 100,
                                    cellsAlign: 'right',
                                    cellsFormat: 'd2',
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
                                NRO_DOCS: {
                                    text: columns[2],
                                    width: 80,
                                    cellsAlign: 'right',
                                    cellsFormat: 'd',
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
                                '%': {
                                    width: 80,
                                    cellsrenderer: function (row, columnfield, value, defaulthtml, columnproperties) {
                                        var filas = $(table).jqxGrid('getrows');
                                        var num = filas[row].TOTAL;

                                        var total = 0;
                                        $.each(filas, function (i, v) {
                                            total += v.TOTAL;
                                        });

                                        return '<div class="jqx-grid-cell-middle-align" style="margin-top: 4px;">' + ((num / total) * 100).toFixed(2) + '%</div>'
                                    },
                                    aggregates: ['sum'], aggregatesRenderer: function (aggregates, column, element) {
                                        return `<div class="d-flex justify-content-center font-weight-bold">
                                                    <strong>100%</strong>
                                                </div>`;
                                    }
                                }
                            }
                        }

                        if (button == 'Por Documento' && query != 'q_reportes_reporteventas_plato_por_documento') {
                            columns = {
                                '_rowNum': {
                                    text: '#',
                                    width: '30',
                                    cellsAlign: 'center',
                                    hidden: false,
                                    pinned: true,
                                    editable: false,
                                    sortable: false
                                },
                                DESCRIPCION: {
                                    text: button
                                },
                                RUC_CLIENTE: {
                                    text: columns[0],
                                    width: 100,
                                    aggregatesRenderer: function (aggregates, column, element) {
                                        var formatNumber = aggregates.sum;
                                        if (formatNumber === undefined)
                                            formatNumber = '';
                                        return `<div class="h-30 d-flex justify-content-center align-items-center font-weight-bold">
                                            <strong> Total </strong>
                                        </div>`;
                                    }
                                },
                                RAZON_SOCIAL: {
                                    text: columns[1],
                                    width: 250
                                },
                                NRO_COMPROBANTE: {
                                    text: columns[2],
                                    width: 120
                                },
                                FECHA_EMISION: {
                                    text: columns[3],
                                    width: 100,
                                    cellsAlign: 'center'
                                },
                                TOTAL: {
                                    text: columns[4],
                                    width: 100,
                                    cellsAlign: 'right',
                                    cellsFormat: 'd2',
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
                                '%': {
                                    width: 80,
                                    cellsrenderer: function (row, columnfield, value, defaulthtml, columnproperties) {
                                        var filas = $(table).jqxGrid('getrows');
                                        var num = filas[row].TOTAL;

                                        var total = 0;
                                        $.each(filas, function (i, v) {
                                            total += v.TOTAL;
                                        });

                                        return '<div class="jqx-grid-cell-middle-align" style="margin-top: 4px;">' + ((num / total) * 100).toFixed(2) + '%</div>'
                                    },
                                    aggregates: ['sum'], aggregatesRenderer: function (aggregates, column, element) {
                                        return `<div class="d-flex justify-content-center font-weight-bold">
                                                    <strong>100%</strong>
                                                </div>`;
                                    }
                                }
                            }
                        }

                        if (button == 'Por Documento' && query == 'q_reportes_reporteventas_plato_por_documento') {
                            columns = {
                                '_rowNum': {
                                    text: '#',
                                    width: '30',
                                    cellsAlign: 'center',
                                    hidden: false,
                                    pinned: true,
                                    editable: false,
                                    sortable: false
                                },
                                DESCRIPCION: {
                                    text: button
                                },
                                RUC_CLIENTE: {
                                    text: columns[0],
                                    width: 100,
                                    aggregatesRenderer: function (aggregates, column, element) {
                                        var formatNumber = aggregates.sum;
                                        if (formatNumber === undefined)
                                            formatNumber = '';
                                        return `<div class="h-30 d-flex justify-content-center align-items-center font-weight-bold">
                                            <strong> Total </strong>
                                        </div>`;
                                    }
                                },
                                RAZON_SOCIAL: {
                                    text: columns[1],
                                    width: 250
                                },
                                NRO_COMPROBANTE: {
                                    text: columns[2],
                                    width: 120
                                },
                                FECHA_EMISION: {
                                    text: columns[3],
                                    width: 100,
                                    cellsAlign: 'center'
                                },
                                NRO_DOCS: {
                                    text: columns[4],
                                    width: 80,
                                    cellsAlign: 'right',
                                    cellsFormat: 'd',
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
                                TOTAL: {
                                    text: columns[5],
                                    width: 100,
                                    cellsAlign: 'right',
                                    cellsFormat: 'd2',
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
                                '%': {
                                    width: 80,
                                    cellsrenderer: function (row, columnfield, value, defaulthtml, columnproperties) {
                                        var filas = $(table).jqxGrid('getrows');
                                        var num = filas[row].TOTAL;

                                        var total = 0;
                                        $.each(filas, function (i, v) {
                                            total += v.TOTAL;
                                        });

                                        return '<div class="jqx-grid-cell-middle-align" style="margin-top: 4px;">' + ((num / total) * 100).toFixed(2) + '%</div>'
                                    },
                                    aggregates: ['sum'], aggregatesRenderer: function (aggregates, column, element) {
                                        return `<div class="d-flex justify-content-center font-weight-bold">
                                                    <strong>100%</strong>
                                                </div>`;
                                    }
                                }
                            }
                        }

                        if (button == 'Delivery' && query == 'q_reportes_reporteventas_canal_delivery') {
                            columns = {
                                '_rowNum': {
                                    text: '#',
                                    width: '30',
                                    cellsAlign: 'center',
                                    hidden: false,
                                    pinned: true,
                                    editable: false,
                                    sortable: false
                                },
                                NOMBRE: {
                                    text: 'Canal',
                                    width: 100,
                                    aggregatesRenderer: function (aggregates, column, element) {
                                        var formatNumber = aggregates.sum;
                                        if (formatNumber === undefined)
                                            formatNumber = '';
                                        return `<div class="h-30 d-flex justify-content-center align-items-center font-weight-bold">
                                            <strong> Total </strong>
                                        </div>`;
                                    }
                                },
                                TIPO_COMPROBANTE: {
                                    text: 'Tipo comprobante',
                                    width: 100
                                },
                                NRO_COMPROBANTE: {
                                    text: 'Nro comprobante',
                                    width: 120
                                },
                                FECHA_EMISION: {
                                    text: 'Fecha emision',
                                    width: 100,
                                    cellsAlign: 'center'
                                },
                                TOTAL: {
                                    text: 'Total',
                                    width: 80,
                                    cellsAlign: 'right',
                                    cellsFormat: 'd2',
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
                                TIPO_DOCUMENTO_DELIVERY: {
                                    text: 'Tipo doc delivery',
                                    width: 150,
                                },
                                RUC_DELIVERY: {
                                    text: 'Documento',
                                    width: 100,
                                },
                                NOMBRE_DELIVERY: {
                                    text: 'Nom. cliente',
                                    width: 120,
                                },
                                DIRECCION_ENTREGA: {
                                    text: 'Dirección',
                                    width: 120,
                                },
                                REFERENCIA_ENTREGA: {
                                    text: 'Referencia',
                                    width: 120,
                                },
                                TELEFONO_DELIVERY: {
                                    text: 'Teléfono',
                                    width: 90,
                                },
                                METODO_PAGO_DELIVERY: {
                                    text: 'Metodo pago',
                                    width: 80,
                                },
                            }
                        }
                        var isRendered = false;

                        $(table).CreateGrid({
                            query,
                            columns,
                            sortcolumn: 'TOTAL',
                            sortdirection: 'DESC',
                            hiddens: [(button == 'Resumen' || button == 'Delivery' ? '' : 'DESCRIPCION')],
                            items: {
                                C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                                FLAG: $.solver.basePath,
                                DESDE: function () {
                                    return $(_controls.desde).val();
                                },
                                HASTA: function () {
                                    return $(_controls.hasta).val();
                                },
                                TIPO: function () {
                                    return $(_controls.tipo).val();
                                }
                            },
                            config: {
                                pageSize: 100000,
                                showstatusbar: true,
                                statusbarheight: 20,
                                showaggregates: true,
                                groupable: (button == 'Resumen' ? false : true),
                                showgroupsheader: false,
                                closeablegroups: false,
                                rendered: function () {
                                    if (button == 'Resumen' || button == 'Delivery') {
                                        return;
                                    }
                                    if (!isRendered) {
                                        isRendered = true;
                                        $(table).jqxGrid('addgroup', 'DESCRIPCION');
                                    }
                                }
                            }
                        })
                        $(table).on('bindingcomplete', function () {

                            if (button == 'Resumen' || button == 'Delivery') {
                                return;
                            }

                            setTimeout(function () {
                                $(table).jqxGrid({ rowsheight: 30 });
                                $(table).jqxGrid('expandallgroups');
                            }, 350)

                        })

                    }
                }
            });
        }
        const fnObtenerDatosCanvas = function () {
            var query = $('input[name=filtro]:checked').attr('data-canvas');

            $.GetQuery({
                query: [query],
                items: [{
                    C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                    FLAG: $.solver.basePath,
                    DESDE: function () {
                        return $(_controls.desde).val();
                    },
                    HASTA: function () {
                        return $(_controls.hasta).val();
                    },
                    TIPO: function () {
                        return $(_controls.tipo).val();
                    }
                }],
                onReady: function (result) {
                    var labels = [];
                    var data = [];
                    if (result.length > 0) {
                        $.each(result, function (i, v) {
                            if (labels.indexOf(v.DESCRIPCION) == -1) {
                                labels.push(v.DESCRIPCION);
                            }
                            data.push(v.TOTAL);
                        });
                        $('#nografico').hide();
                        $('#grafico').show();
                        $('#grafico').html('<canvas id="canvas-reporte"></canvas>')
                        fnCrearCanvas('canvas-reporte', labels, data);
                    }
                    else {
                        $('#grafico').hide();
                        $('#nografico').show();
                    }
                }
            });
        }
        const fnCrearCanvas = function (content, labels, data) {
            var config = {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [
                        {
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
                        //yAxes: [{
                        //    display: true,
                        //    scaleLabel: {
                        //        display: false,
                        //        labelString: 'Archivos'
                        //    }
                        //}]
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
        }
        const fnCrearOpciones = function (result) {
            var filtros = '';
            var checked = '';
            $.each(result, function (i, filtro) {
                if (i == 0) checked = 'checked="checked"';
                else checked = '';
                filtros += `
                    <div class="custom-control custom-radio">
                        <input type="radio" id="cr${i}" name="filtro" class="custom-control-input" data-label="${filtro.CODIGO_PARAMETRO}" data-reportes="${filtro.CODIGO_PARAMETRO_2}" data-canvas="${filtro.CODIGO_PARAMETRO_3}" ${checked}>
                        <label class="custom-control-label" for="cr${i}">${filtro.CODIGO_PARAMETRO}</label>
                    </div>
                `;
            });
            $('#filtros').html(filtros);

            fnObtenerDatosCanvas();
            fnCrearBotones();

            $('input[name=filtro]').unbind('change');
            $('input[name=filtro]').bind('change', function () {
                fnObtenerDatosCanvas();
                fnCrearBotones();
            });
        }
        const fnObtenerDataInicial = function () {
            $.GetQuery({
                query: ['q_gbl_obtener_filtros_ventas'],
                items: [{
                    FLAG: $.solver.basePath
                }],
                onReady: function (result) {
                    if (result.length > 0) {
                        fnCrearOpciones(result);
                    }
                }
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
                fnObtenerDataInicial();

                $('#btnDescargarExcel').click(function () {
                    fnDescargar();
                })
            },
            onReady: function () {
                fnObtenerDataInicial();
            }
        });
    });
});