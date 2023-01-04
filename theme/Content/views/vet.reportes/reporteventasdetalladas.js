require(["helper", "extras", "datetimepicker", "jqwidgets"], function () {
    require(["alertify", "bootbox", "numeral", "moment"], function (alertify, bootbox, numeral, moment) {

        var pdv = '';
        if ($.solver.basePath == '/puntoventa') pdv = '*';

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

                            if (pdv == '*') {
                                $('.caja').show();
                            }
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
                                C_CLIENTE: $('#_cliente').val() || '',
                                VENDEDOR: $('#_vendedor').val() || '',
                                MONEDA: moneda,
                                MES: $('#mes').val() || '',
                                MES_FIN: $('#mesfin').val() || '',
                                C_ESTABLECIMIENTO: $('#_establecimiento').val() || '',
                                BASE: $.solver.basePath,
                                C_CAJA: $('#_caja').val() || ''
                            };
                            query = '';
                            titulo = '';
                            if (representacion == 'item') {
                                fnCrearItem(moneda);
                                query = 'tbl_ventas_reportes_detalladasxitem';
                                titulo = 'Reporte detallado por item'
                                $('#titulo').text(titulo);
                            }
                            else if (representacion == 'cliente') {
                                fnCrearCliente(moneda);
                                query = 'tbl_ventas_reportes_detalladaxcliente';
                                titulo = 'Reporte detallado por cliente'
                                $('#titulo').text(titulo);
                            }
                            else if (representacion == 'vendedor') {
                                fnCrearVendedor(moneda);
                                query = 'tbl_ventas_reportes_detalladaxvendedor';
                                titulo = 'Reporte detallado por vendedor'
                                $('#titulo').text(titulo);
                            }
                            else if (representacion == 'centro') {
                                fnCrearCentro(moneda);
                                query = 'tbl_ventas_reportes_detalladaxcentro';
                                titulo = 'Reporte detallado por centro de costo'
                                $('#titulo').text(titulo);
                            }
                            else if (representacion == 'establecimiento') {
                                fnCrearEstablecimiento(moneda);
                                query = 'tbl_ventas_reportes_detalladaxestablecimiento';
                                titulo = 'Reporte detallado por establecimiento'
                                $('#titulo').text(titulo);
                            }
                            else if (representacion == 'caja') {
                                fnCrearCaja(moneda);
                                query = 'tbl_ventas_reportes_detalladaxcaja';
                                titulo = 'Reporte detallado por caja'
                                $('#titulo').text(titulo);
                            }
                        }
                    });
                }
            });
        };
        const fnCrearItem = function (moneda) {
            $('#table').CreateGrid({
                query: 'tbl_ventas_reportes_detalladasxitem',
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
                    MES: function () {
                        return $('#mes').val() || '';
                    },
                    MES_FIN: function () {
                        return $('#mesfin').val() || '';
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
        };
        const fnCrearCliente = function (moneda) {
            $('#table').CreateGrid({
                query: 'tbl_ventas_reportes_detalladaxcliente',
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
                    MES: function () {
                        return $('#mes').val() || '';
                    },
                    MES_FIN: function () {
                        return $('#mesfin').val() || '';
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
        };
        const fnCrearVendedor = function (moneda) {
            $('#table').CreateGrid({
                query: 'tbl_ventas_reportes_detalladaxvendedor',
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
                    MES: function () {
                        return $('#mes').val() || '';
                    },
                    MES_FIN: function () {
                        return $('#mesfin').val() || '';
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
        };
        const fnCrearCentro_3 = function (moneda) {

            var anio = $('#_anio').val();
            var mes = $('#mes').val() || '';
            var mes_fin = $('#mesfin').val() || '';
            var c_producto = $('#_producto').val();
            var c_unidad_negocio = $('#_centro').val();
            var c_cliente = $('#_cliente').val();
            var c_vendedor = $('#_vendedor').val();
            var c_establecimiento = $('#_establecimiento').val() || '';
            var modulo = pdv;
            var c_caja = $('#_caja').val() || ''



            $.GetData({
                uriData: $.solver.services.api + `Service/ObtenerCentroCostoDetallado/${$.solver.session.SESSION_EMPRESA}/${anio}/${moneda}/${mes}/${mes_fin}/${c_producto}/${c_unidad_negocio}/${c_cliente}/${c_vendedor}/${c_establecimiento}/${modulo}/${c_caja}`,
                type: 'GET',
                isPage: true,
                onBefore: function () {
                    $.DisplayStatusBar({
                        message: 'Validando documento'
                    });
                },
                onError: function (error) {
                    $.CloseStatusBar();
                    alertify.error('Ocurrió un error.');
                },
                onReady: function (object) {

                    var json = JSON.parse(object);

                    var source =
                    {
                        dataType: "json",
                        dataFields: [
                            { name: "c_unidad", type: "string" },
                            { name: "c_unidad_ref", type: "string" },
                            { name: "nombre", type: "string" },
                            { name: "childrens", type: "array" },
                            { name: "total", type: "number" }
                        ],
                        hierarchy:
                        {
                            root: "childrens"
                        },
                        localData: json,
                        id: "c_unidad"
                    };
                    var dataAdapter = new $.jqx.dataAdapter(source, {
                        loadComplete: function () {
                        }
                    });

                    // create jqxTreeGrid.
                    $('#table').jqxTreeGrid({
                        localization: $.SetLocatizationJQX(),
                        source: dataAdapter,
                        altRows: false,
                        columnsResize: false,
                        ready: function () {
                            //$("#treegrid").jqxTreeGrid('expandRow', '1');
                            //$("#treegrid").jqxTreeGrid('expandRow', '2');
                        },
                        columns: [
                            { text: "Centro de Costo", align: "center", dataField: "nombre", width: 300 },
                            { text: "Total", cellsAlign: "center", align: "center", dataField: "total", cellsFormat: "c2", width: 250 },
                            //{ text: "Location", dataField: "location", cellsAlign: "center", align: "center", width: 250 }
                        ],
                        //columnGroups:[
                        //    { text: "JST Corp.", name: "JSTCorp", align: "center" }
                        //]
                    });

                    //var _columns = {
                    //    'nombre': {
                    //        text: 'Nombre'
                    //    },
                    //    'total': {
                    //        text: 'Total'
                    //    },
                    //}
                    //var _adapter = {};
                    //var _items = {}

                    //var _type = 0;
                    //var _query = 'q_ventas_reportes_estadisticoxcentro';
                    //var _hiddens = ['NOMBRE_2', 'NOMBRE_1', 'C_UNIDAD_NEGOCIO_REF', 'C_UNIDAD_NEGOCIO_REF_2', 'C_UNIDAD_NEGOCIO_REF_1']
                    //var _config = {
                    //    pageable: false,
                    //    height: 550,
                    //    pageSize: 999999,
                    //    sortable: false,
                    //    editable: false,
                    //    showstatusbar: true,
                    //    rendered: function () {
                    //        bootbox.hideAll();
                    //    },
                    //    sortable: false,
                    //}
                    //var adaptador = {
                    //    dataType: "json",
                    //    dataFields: [],
                    //    id: 'id',
                    //    localData: json,
                    //    //type: 'POST',
                    //    //url: $.solver.services.api + '/Service/'
                    //};
                    //var adaptador_cols = [];
                    //var colsRefer = {};

                    ////Extend Adaptador
                    //adaptador = $.extend(adaptador, _adapter);

                    ////Extra Columns
                    ////for (var item in _columns) {
                    ////    if (typeof _result.cols[item] == 'undefined') {
                    ////        _result.cols[item] = { type: "string", name: item };
                    ////    };
                    ////};

                    ////Define Default Cols
                    ////for (var item in _result.cols) {
                    ////    var col = _result.cols[item];
                    ////    var defColTable = {
                    ////        text: col.name,
                    ////        dataField: col.name,
                    ////        width: '150',
                    ////        align: 'center',
                    ////        cellsAlign: 'left',
                    ////        hidden: false,
                    ////    };
                    ////    var defColAdapter = { name: col.name, type: col.type };
                    ////    //Validation Regular Expressions
                    ////    if (col.type === 'int64' || col.type === 'int32') {
                    ////        defColAdapter.type = 'int';
                    ////    };
                    ////    if (col.type === 'datetime') {
                    ////        defColTable.cellsformat = 'DD/MM/YYYY HH:mm:ss';
                    ////        defColTable.cellsRenderer = function (row, column, value, rowData) {
                    ////            var _tempDate = '';
                    ////            if (value != '') {
                    ////                _tempDate = moment(value).format('DD/MM/YYYY HH:mm:ss');
                    ////            };
                    ////            return '<div class="jqx-grid-cell-middle-align" style="margin-top: 8px;">' + _tempDate + '</div>';;
                    ////        };
                    ////        defColAdapter.type = 'date';
                    ////    };
                    ////    if (col.name === "_rowNum") {
                    ////        defColTable.hidden = true;
                    ////    };
                    ////    if ($.inArray(item, _hiddens) != -1) {
                    ////        defColTable.hidden = true;
                    ////    };
                    ////    //Default Config Cols Users
                    ////    if (typeof _columns[item] !== 'undefined') {
                    ////        defColTable = $.extend(defColTable, _columns[item]);
                    ////    };
                    ////    //Add Config to Var
                    ////    adaptador_cols.push(defColTable);
                    ////    adaptador.dataFields.push(defColAdapter);
                    ////    //colsRefer
                    ////    colsRefer[col.name] = '';
                    ////};

                    //if (typeof _config.columns == 'undefined') _config.columns = [];

                    //_items.TypeTo = _type;
                    //_config.source = new $.jqx.dataAdapter(adaptador, {
                    //    loadServerData: function (serverdata, source, callback) {

                    //        var getRemoteData = function () {
                    //            //Parameters
                    //            var optionsAtServer = JSON.parse(JSON.stringify(serverdata));
                    //            var optionsToServer = {
                    //                items: [],
                    //                filters: [],
                    //                sorters: []
                    //            };
                    //            var optionsToServerItem = $.ConvertObjectToArr(source.data);
                    //            //Add Items to Send
                    //            optionsToServer.items = optionsToServerItem;

                    //            //Elements Complementary
                    //            if (typeof optionsAtServer.pagenum != 'undefined')
                    //                optionsToServer.items.push({ name: 'pagenum', value: optionsAtServer.pagenum });
                    //            if (typeof optionsAtServer.pagesize != 'undefined')
                    //                optionsToServer.items.push({ name: 'pagesize', value: optionsAtServer.pagesize });
                    //            if (typeof optionsAtServer.sortdatafield != 'undefined')
                    //                optionsToServer.items.push({ name: 'sortdatafield', value: optionsAtServer.sortdatafield });
                    //            if (typeof optionsAtServer.sortorder != 'undefined')
                    //                optionsToServer.items.push({ name: 'sortorder', value: optionsAtServer.sortorder });

                    //            //Get data From Server
                    //            $.GetData({
                    //                uriData: $.solver.services.api + "/Service/DataGrid/" + _query + "/",
                    //                options: optionsToServer,
                    //                onReady: function (result) {
                    //                    callback({ records: result.data, totalrecords: result.totalrecords });
                    //                },
                    //                onError: function (_error) {
                    //                    callback({ records: [], totalrecords: 0 });
                    //                    $.CloseStatusBar();
                    //                    $.ShowError({ error: _error });
                    //                }
                    //            });

                    //        };

                    //        $('#table')[0]['args'] = _config;
                    //        $('#table')[0]['info'] = {
                    //            colsRefer: colsRefer
                    //        };

                    //        if (typeof _firstLoad == 'undefined') _firstLoad = true;
                    //        if (_firstLoad) getRemoteData();
                    //        if (!_firstLoad) {
                    //            _firstLoad = true;
                    //            callback({ records: [], totalrecords: 0 });
                    //        };

                    //    }
                    //});
                    //_config.columns = adaptador_cols;
                    //_config.localization = $.SetLocatizationJQX();

                    //$('#table').jqxTreeGrid(_config);

                    $.CloseStatusBar();
                }
            });

        };
        const fnCrearCentro = function (moneda) {

            var groupsrenderer = function (text, group, expanded, data) {
                if (data.groupcolumn.datafield == 'NOMBRE_1' || data.groupcolumn.datafield == 'NOMBRE_2') {
                    var rows = [0];
                    var getRows = function (group, rows) {
                        if (group.subGroups.length > 0) {
                            for (var i = 0; i < group.subGroups.length; i++) {
                                getRows(group.subGroups[i], rows);
                            }
                        }
                        else {
                            for (var i = 0; i < group.subItems.length; i++) {
                                var data = group.subItems[i];
                                rows[0] += data.Total;
                            }
                        }
                    }
                    getRows(data, rows);

                    var total = `&nbsp;<strong>Total:</strong> ${numeral(rows[0]).format('0,000.00')}`;

                    return `<div class="mt-1" style="position: absolute;"><span>${$.trim(text)}</span>${total}</div>`;
                }
                else {
                    return '<div class="mt-1" style="position: absolute;"><span>' + text + '</span>';
                }
            }

            $('#table').CreateTreeGrid({
                query: 'tbl_ventas_reportes_detalladaxcentro',
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
                    MES: function () {
                        return $('#mes').val() || '';
                    },
                    MES_FIN: function () {
                        return $('#mesfin').val() || '';
                    },
                    C_ESTABLECIMIENTO: function () {
                        return $('#_establecimiento').val() || ''
                    },
                    BASE: $.solver.basePath,
                    C_CAJA: function () {
                        return $('#_caja').val() || ''
                    }
                },
                //hiddens: ['NOMBRE_2', 'NOMBRE_1', 'C_UNIDAD_NEGOCIO_REF', 'C_UNIDAD_NEGOCIO_REF_2', 'C_UNIDAD_NEGOCIO_REF_1'],
                columns: {
                    //'NOMBRE_2': {
                    //    text: 'Centro de costo'
                    //},
                    //'NOMBRE_1': {
                    //    text: 'Centro de costo'
                    //},
                    //'_rowNum': {
                    //    text: 'N°',
                    //    width: '30',
                    //    cellsAlign: 'center',
                    //    hidden: false,
                    //    pinned: true,
                    //    editable: false,
                    //    sortable: false
                    //},
                    //'Nombre': {
                    //    width: 400, aggregatesRenderer: function (aggregates, column, element) {
                    //        var formatNumber = aggregates.sum;
                    //        if (formatNumber === undefined)
                    //            formatNumber = '';
                    //        return `<div class="h-30 d-flex justify-content-center align-items-center font-weight-bold">
                    //            <strong id="totalDineroRecibido"> TOTAL </strong>
                    //        </div>`;
                    //    }
                    //},
                    //'Total': {
                    //    width: 150,
                    //    cellsAlign: 'right',
                    //    cellsFormat: 'd2',
                    //    columnType: 'numberinput',
                    //    aggregates: ['sum'], aggregatesRenderer: function (aggregates, column, element) {
                    //        var formatNumber = aggregates.sum;
                    //        if (formatNumber === undefined)
                    //            formatNumber = '';
                    //        return `<div class="h-30 d-flex justify-content-center align-items-center font-weight-bold">
                    //            <strong id="totalDineroRecibido"> ${formatNumber} </strong>
                    //        </div>`;
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
                    //            <strong id="totalDineroRecibido"> 100%</strong>
                    //        </div>`;
                    //    }
                    //}
                },
                config: {
                    //groupable: true,
                    //pageable: false,
                    //virtualmode: false,
                    //height: 550,
                    //pageSize: 999999,
                    //editable: false,
                    //showgroupsheader: false,
                    //showaggregates: true,
                    //showstatusbar: true,
                    //statusbarheight: 20,
                    //groups: ['NOMBRE_2', 'NOMBRE_1'],
                    //rendered: function () {
                    //    bootbox.hideAll();
                    //},
                    //groupsrenderer: groupsrenderer,
                    //sortable: false,
                    //closeablegroups: false,
                }
            });

        };
        const fnCrearEstablecimiento = function (moneda) {
            $('#table').CreateGrid({
                query: 'tbl_ventas_reportes_detalladaxestablecimiento',
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
                    MES: function () {
                        return $('#mes').val() || '';
                    },
                    MES_FIN: function () {
                        return $('#mesfin').val() || '';
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
        };
        const fnCrearCaja = function (moneda) {
            $('#table').CreateGrid({
                query: 'tbl_ventas_reportes_detalladaxcaja',
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
                    MES: function () {
                        return $('#mes').val() || '';
                    },
                    MES_FIN: function () {
                        return $('#mesfin').val() || '';
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
        };

        fnMostrarModal();

        $('#btnFiltros').click(function () {
            fnMostrarModal();
        });

        $('#btnDescargarExcel').click(function () {
            if (query != '') {
                $.DownloadFile({
                    nameFile: titulo,
                    query: query,
                    params: filtros
                });
            }
        });

    });
});