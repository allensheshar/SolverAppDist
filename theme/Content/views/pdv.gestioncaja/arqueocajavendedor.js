require(["helper", "extras", "datetimepicker"], function () {
    require(["alertify", "bootbox", "moment", "inputmask", "numeral"], function (alertify, bootbox, moment, inputmask, numeral) {
        alertify.set('notifier', 'position', 'top-center');

        const c_empresa = $.solver.session.SESSION_EMPRESA;
        const c_usuario = $.solver.session.SESSION_ID;
        const c_caja = $('#caja').val();
        const c_vendedor = $('#vendedor').val();
        const c_fecha = $('#fecha').val();
        const c_operacion = $('#operacion').val();

        const table = '#table';
        const table1 = '#table1';
        const table2 = '#table2';
        const table3 = '#table3';
        let buttonStatus = false;

        const fnCrearTablaDetalle = function () {
            $(table3).CreateGrid({
                query: 'tbl_puntoventa_procesos_arqueocaja_vendedor_detalle',
                items: {
                    C_EMPRESA: c_empresa,
                    C_CAJA: function () {
                        return $('#caja').val();
                    },
                    C_VENDEDOR: function () {
                        return $('#vendedor').val();
                    },
                    C_FECHA: function () {
                        return $('#fecha').val().replaceAll('-', '/');
                    },
                    C_OPERACION: function () {
                        return $('#operacion').val();
                    },
                },
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
                    NRO_COMPROBANTE: {
                        text: 'Nro. comprobante',
                        width: 120
                    },
                    DESCRIPCION_PARAMETRO: {
                        text: 'Moneda',
                        width: 100,
                    },
                    TOTAL: {
                        text: 'Total',
                        cellsAlign: 'right',
                        width: 60,
                        editable: true,
                        cellsFormat: 'd2',
                    }
                },
                config: {
                    height: 700,
                }
            });
        }
        const fnCrearTablaResumen = function () {
            $(table).CreateGrid({
                query: 'tbl_puntoventa_procesos_arqueocaja_vendedor',
                items: {
                    C_EMPRESA: c_empresa,
                    C_CAJA: function () {
                        return $('#caja').val();
                    },
                    C_VENDEDOR: function () {
                        return $('#vendedor').val();
                    },
                    FECHA: function () {
                        return $('#fecha').val().replaceAll('-', '/');
                    },
                    C_OPERACION: function () {
                        return $('#operacion').val();
                    },
                },
                columns: {
                    'NOMBRE_METODO_PAGO': {
                        text: 'Metodo de pago',
                        width: 200
                    },
                    'FACTURADO_SOLES': {
                        columngroup: 'soles',
                        text: 'Facturado soles',
                        width: 130,
                        cellsAlign: 'right',
                        cellsFormat: 'd2',
                        columnType: 'numberinput',
                        aggregates: ['sum'], aggregatesRenderer: function (aggregates, column, element) {
                            var formatNumber = aggregates.sum;
                            if (formatNumber === undefined)
                                formatNumber = '';
                            return `<div class="h-30 d-flex justify-content-center align-items-center font-weight-bold">
                                <strong> ${formatNumber} </strong>
                            </div>`;
                        }
                    },
                    'FACTURADO_DOLARES': {
                        columngroup: 'dolares',
                        text: 'Facturado dolares',
                        width: 130,
                        cellsAlign: 'right',
                        cellsFormat: 'd2',
                        columnType: 'numberinput',
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
                    autorowheight: true,
                    altrows: true,
                    columnsresize: true,
                    showaggregates: true,
                    showstatusbar: true,
                    statusbarheight: 20,
                    height: 300,
                    selectionmode: 'singlecell',
                }
            });
        };
        const fnCrearTablaSoles = function () {
            const cellbeginedit = function (row, datafield, columntype, value) {
                var rowData = $(table1).jqxGrid('getrows')[row];
                var estado = $('#estado').val();
                if (estado == 'A') {
                    return false;
                }
                if (datafield == 'CANT') {
                    if (rowData['CALCULO'] <= 0) {
                        return false;
                    }
                }
                if (datafield == 'TOTAL') {
                    if (rowData['CALCULO'] == -1) return true;
                    else return false;
                }
                return true;
            }
            const validation = function (cell, value) {
                if (parseInt(value) < 0) {
                    //if (Number.isInteger(Number(value)) == false || parseInt(value) < 0) {
                    return { result: false, message: "El monto no puede ser negativo." };
                }
                return true;
            }
            const cellclassname = function (row, column, value, data) {
                var rowData = $(table1).jqxGrid('getrows')[row];
                if (column == 'CANT') {
                    if (rowData['CALCULO'] <= 0) {
                        return 'cell-disabled';
                    }
                }
                if (column == 'TOTAL') {
                    if (rowData['CALCULO'] == -1) {
                        return 'cell-editable'
                    }
                    else {
                        return 'cell-disabled';
                    };
                }
                return 'cell-editable';
            }
            $(table1).CreateGrid({
                query: 'tbl_puntoventa_procesos_arqueocaja_vendedor_monedasoles',
                items: {
                    C_EMPRESA: c_empresa,
                    C_CAJA: function () {
                        return $('#caja').val();
                    },
                    C_USUARIO: function () {
                        return $('#vendedor').val();
                    },
                    C_FECHA: function () {
                        return $('#fecha').val().replaceAll('-', '/');
                    },
                    C_OPERACION: function () {
                        return $('#operacion').val();
                    }
                },
                hiddens: ['ORDEN', 'C_MONEDA', 'CALCULO'],
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
                    COD_TIPO_MONEDA: {
                        text: 'Monedas',
                        cellsAlign: 'right',
                        editable: false,
                        width: 200,
                    },
                    CANT: {
                        text: 'Cantidad',
                        cellsAlign: 'right',
                        width: 100,
                        editable: true,
                        cellbeginedit,
                        cellclassname,
                        validation,
                    },
                    TOTAL: {
                        text: 'Monto',
                        cellsAlign: 'right',
                        width: 100,
                        editable: true,
                        cellbeginedit,
                        cellsFormat: 'd2',
                        cellclassname,
                        validation,
                    }
                },
                config: {
                    editable: true,
                    height: 600,
                    selectionmode: 'singlecell',
                    sortable: false
                }
            });
            $(table1).on('cellendedit', function (event) {
                var args = event.args;
                var dataField = event.args.datafield;
                var oldvalue = args.oldvalue;
                var value = args.value;
                var rowData = args.row;

                if ((oldvalue == null ? '' : oldvalue) != value) {
                    if (value != null && value != '') {
                        if (dataField == 'CANT') {
                            value = parseInt(value);
                            rowData.TOTAL = rowData.CALCULO * value;
                        }
                        if (dataField == 'TOTAL') {
                            value = parseFloat(value);
                            rowData.TOTAL = value;
                        }
                    }
                    else rowData.TOTAL = 0;

                    var a = calcularMontosSoles();
                    var b = calcularMontosDolares();

                    $(table2).jqxGrid('refreshdata');
                }

            });
        }
        const fnCrearTablaDolares = function () {
            const cellbeginedit = function (row, datafield, columntype, value) {
                var rowData = $(table2).jqxGrid('getrows')[row];
                var estado = $('#estado').val();
                if (estado == 'A') {
                    return false;
                }
                if (datafield == 'CANT') {
                    if (rowData['CALCULO'] <= 0) {
                        return false;
                    }
                }
                if (datafield == 'TOTAL') {
                    if (rowData['CALCULO'] == -1) return true;
                    else return false;
                }
                return true;
            }
            const cellclassname = function (row, column, value, data) {
                var rowData = $(table2).jqxGrid('getrows')[row];
                if (column == 'CANT') {
                    if (rowData['CALCULO'] <= 0) {
                        return 'cell-disabled';
                    }
                }
                if (column == 'TOTAL') {
                    if (rowData['CALCULO'] == -1) {
                        return 'cell-editable'
                    }
                    else {
                        return 'cell-disabled';
                    };
                }
                return 'cell-editable';
            }
            const validation = function (cell, value) {
                if (parseInt(value) < 0) {
                    //if (Number.isInteger(Number(value)) == false || parseInt(value) < 0) {
                    return { result: false, message: "El monto no puede ser negativo." };
                }
                return true;
            }
            $(table2).CreateGrid({
                query: 'tbl_puntoventa_procesos_arqueocaja_vendedor_monedadolares',
                items: {
                    C_EMPRESA: c_empresa,
                    C_CAJA: function () {
                        return $('#caja').val();
                    },
                    C_USUARIO: function () {
                        return $('#vendedor').val();
                    },
                    C_FECHA: function () {
                        return $('#fecha').val().replaceAll('-', '/');
                    },
                    C_OPERACION: function () {
                        return $('#operacion').val();
                    }
                },
                hiddens: ['ORDEN', 'C_MONEDA', 'CALCULO'],
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
                    COD_TIPO_MONEDA: {
                        text: 'Monedas',
                        cellsAlign: 'right',
                        editable: false,
                        width: 200,
                    },
                    CANT: {
                        text: 'Cantidad',
                        cellsAlign: 'right',
                        width: 100,
                        editable: true,
                        cellbeginedit,
                        cellclassname,
                        validation,
                    },
                    TOTAL: {
                        text: 'Monto',
                        cellsAlign: 'right',
                        width: 100,
                        editable: true,
                        cellsFormat: 'd2',
                        cellbeginedit,
                        cellclassname,
                        validation,
                    }
                },
                config: {
                    editable: true,
                    height: 600,
                    selectionmode: 'singlecell',
                    sortable: false
                }
            });
            $(table2).on('cellendedit', function (event) {
                var args = event.args;
                var dataField = event.args.datafield;
                var oldvalue = args.oldvalue;
                var value = args.value;
                var rowData = args.row;
                if ((oldvalue == null ? '' : oldvalue) != value) {
                    if (value != null && value != '') {
                        if (dataField == 'CANT') {
                            value = parseInt(value);
                            rowData.TOTAL = rowData.CALCULO * value;
                        }
                        if (dataField == 'TOTAL') {
                            value = parseFloat(value);
                            rowData.TOTAL = value;
                        }
                    }
                    else rowData.TOTAL = 0;
                    var a = calcularMontosDolares();
                    var b = calcularMontosSoles();
                    $(table1).jqxGrid('refreshdata');
                }
            });
        }
        const fnObtenerDatosArqueo = function () {
            $.GetQuery({
                query: ['q_puntoventa_procesos_arqueocajavendedor_obtenerinfo'],
                items: [{
                    C_EMPRESA: c_empresa,
                    C_CAJA: function () {
                        return $('#caja').val();
                    },
                    C_USUARIO: function () {
                        return $('#vendedor').val();
                    },
                    C_FECHA: function () {
                        return $('#fecha').val().replaceAll('-', '/');
                    },
                    C_OPERACION: function () {
                        return $('#operacion').val();
                    }
                }],
                onReady: function (result) {
                    $.CloseStatusBar();
                    if (result.length > 0) {
                        const data = result[0];
                        $('#lblEmpresa').html('<strong>Empresa: </strong>' + data.RAZON_SOCIAL);
                        $('#lblEstablecimiento').html('<strong>Establecimiento: </strong>' + data.NOMBRE_ESTABLECIMIENTO);
                        $('#lblCaja').html('<strong>Caja: </strong>' + data.NOMBRE_CAJA);
                        $('#lblVendedor').html('<strong>Vendedor: </strong>' + data.NOMBRE);
                        $('#lblFecha').html('<strong>Fecha: </strong>' + $('#fecha').val().replaceAll('-', '/'));
                        $('#lblOperacion').html('<strong>Nro. operacion: </strong>' + $('#operacion').val());
                        $('#tipoCambio').html('<strong>Tipo de cambio: </strong>' + data.C_TC);
                        $('#tc').val(data.C_TC);
                        $('#NOTAS').val(data.COMENTARIOS);
                        $('#estado').val(data.IND_ESTADO);

                        if (data.IND_ESTADO == 'A') {
                            $('#NOTAS').attr('disabled', 'disabled');
                            $('#btnGuardar').remove();
                            $('#btnFinalizar').remove();
                        }
                    }
                    $.solver.fn.getImageLogoCompany('#IMAGEN_EMPRESA');

                },
                onError: function (error) {
                    $.CloseStatusBar();
                    $.ShowError({ error });
                },
                onBefore: function () {
                    $.DisplayStatusBar({ message: 'Cargando información' });
                }
            });
        };
        const calcularMontosSoles = function () {
            var resumen = $(table).jqxGrid('getrows');
            var soles = $(table1).jqxGrid('getrows');
            var total = 0.00;
            var diferencia = 0.00;
            var ajusteportc = 0.00;
            var saldofinal = 0.00;
            var indiceTotal = $(table1).jqxGrid('getrows').length;
            var indiceTotal2 = $(table2).jqxGrid('getrows').length;
            var totalDolares = 0.00;

            $.each(soles, function (i, v) {
                if (v.CALCULO > 0 || v.CALCULO == -1) {
                    if (v.TOTAL != null && v.TOTAL != '') {
                        total += v.TOTAL;
                    }
                }
            });

            diferencia = total;
            $.each(resumen, function (i, v) {
                diferencia -= v.FACTURADO_SOLES;
                totalDolares += v.FACTURADO_DOLARES;
            });
            ajusteportc = (diferencia < 0 ? $(table2).jqxGrid('getrows')[indiceTotal2 - 3].TOTAL * $('#tc').val() : diferencia * -1);
            saldofinal = total + ajusteportc;


            $(table1).jqxGrid('getrows')[indiceTotal - 4].TOTAL = total; //15
            $(table1).jqxGrid('getrows')[indiceTotal - 3].TOTAL = diferencia; //16
            $(table1).jqxGrid('getrows')[indiceTotal - 2].TOTAL = (totalDolares == 0 ? 0 : ajusteportc); //17
            $(table1).jqxGrid('getrows')[indiceTotal - 1].TOTAL = saldofinal; //18
            return true;
        }
        const calcularMontosDolares = function () {
            var resumen = $(table).jqxGrid('getrows');
            var soles = $(table2).jqxGrid('getrows');
            var total = 0.00;
            var diferencia = 0.00;
            var ajusteportc = 0.00;
            var saldofinal = 0.00;
            var indiceTotal = $(table2).jqxGrid('getrows').length;
            var indiceTotal2 = $(table1).jqxGrid('getrows').length;
            var totalSoles = 0.00

            $.each(soles, function (i, v) {
                if (v.CALCULO > 0 || v.CALCULO == -1) {
                    if (v.TOTAL != null && v.TOTAL != '') {
                        total += v.TOTAL;
                    }
                }
            });

            diferencia = total;
            $.each(resumen, function (i, v) {
                diferencia -= v.FACTURADO_DOLARES;
                totalSoles += v.FACTURADO_SOLES
            });
            ajusteportc = (diferencia < 0 ? $(table2).jqxGrid('getrows')[indiceTotal2 - 3].TOTAL / $('#tc').val() : diferencia * -1);
            saldofinal = total + ajusteportc;

            $(table2).jqxGrid('getrows')[indiceTotal - 4].TOTAL = total;
            $(table2).jqxGrid('getrows')[indiceTotal - 3].TOTAL = diferencia;
            $(table2).jqxGrid('getrows')[indiceTotal - 2].TOTAL = (totalSoles == 0 ? 0 : ajusteportc);
            $(table2).jqxGrid('getrows')[indiceTotal - 1].TOTAL = saldofinal;

            return true;
        }
        const fnFinalizar = function () {
            const objectCobranza = {
                C_EMPRESA: c_empresa,
                C_CAJA: c_caja,
                C_USUARIO: c_vendedor,
                C_FECHA: c_fecha,
                C_OPERACION: c_operacion,
                IND_ESTADO: 'A',
                COMENTARIOS: $('#NOTAS').val(),
                FECHA_ARQUEO: '',
                C_USUARIO_ARQUEO: c_usuario
            };
            const extraCobranza = {
                FECHA_ARQUEO: {
                    action: {
                        name: 'GetQueryId',
                        args: $.ConvertObjectToArr({
                            script: 'gbl_obtener_fecha_server',
                            column: 'FECHA'
                        })
                    }
                }
            }
            $.AddPetition({
                table: 'PDV.COBRANZA',
                type: 2,
                condition: `C_EMPRESA = '${c_empresa}' AND C_CAJA = '${c_caja}' AND C_USUARIO = '${c_vendedor}' AND C_FECHA = '${c_fecha}' AND C_OPERACION = '${c_operacion}'`,
                items: $.ConvertObjectToArr(objectCobranza, extraCobranza)
            });
            const objectBorrarCobranzaArqueo = {
                script: 'spw_delete_detalle_cobranza_arqueo',
                C_EMPRESA: c_empresa,
                C_CAJA: c_caja,
                C_USUARIO: c_vendedor,
                C_FECHA: c_fecha,
                C_OPERACION: c_operacion
            }
            $.AddPetition({
                type: 4,
                transaction: true,
                items: $.ConvertObjectToArr(objectBorrarCobranzaArqueo)
            })

            $.each($(table1).jqxGrid('getrows'), function (i, data) {
                const objectCobranzaArqueo = {
                    C_EMPRESA: c_empresa,
                    C_CAJA: c_caja,
                    C_USUARIO: c_vendedor,
                    C_FECHA: c_fecha,
                    C_OPERACION: c_operacion,
                    C_DETALLE: '',
                    ORDEN: data.ORDEN,
                    COD_MONEDA: data.C_MONEDA,
                    COD_TIPO_MONEDA: data.COD_TIPO_MONEDA,
                    CANT: ((data.CANT != '' && data.CANT != 0) ? data.CANT : null),
                    TOTAL: ((data.TOTAL != '' && data.TOTAL != 0) ? data.TOTAL : null),
                    CALCULO: data.CALCULO,
                };
                const extraCobranzaArqueo = {
                    C_DETALLE: {
                        action: {
                            name: 'GetNextId',
                            args: $.ConvertObjectToArr({
                                columns: 'C_EMPRESA,C_CAJA,C_USUARIO,C_FECHA,C_OPERACION',
                                max_length: 3
                            })
                        }
                    }
                };
                $.AddPetition({
                    type: 1,
                    table: 'PDV.COBRANZA_ARQUEO',
                    items: $.ConvertObjectToArr(objectCobranzaArqueo, extraCobranzaArqueo)
                });
            });
            $.each($(table2).jqxGrid('getrows'), function (i, data) {
                const objectCobranzaArqueo = {
                    C_EMPRESA: c_empresa,
                    C_CAJA: c_caja,
                    C_USUARIO: c_vendedor,
                    C_FECHA: c_fecha,
                    C_OPERACION: c_operacion,
                    C_DETALLE: '',
                    ORDEN: data.ORDEN,
                    COD_MONEDA: data.C_MONEDA,
                    COD_TIPO_MONEDA: data.COD_TIPO_MONEDA,
                    CANT: ((data.CANT != '' && data.CANT != 0) ? data.CANT : null),
                    TOTAL: ((data.TOTAL != '' && data.TOTAL != 0) ? data.TOTAL : null),
                    CALCULO: data.CALCULO,
                };
                const extraCobranzaArqueo = {
                    C_DETALLE: {
                        action: {
                            name: 'GetNextId',
                            args: $.ConvertObjectToArr({
                                columns: 'C_EMPRESA,C_CAJA,C_USUARIO,C_FECHA,C_OPERACION',
                                max_length: 3
                            })
                        }
                    }
                };
                $.AddPetition({
                    type: 1,
                    table: 'PDV.COBRANZA_ARQUEO',
                    items: $.ConvertObjectToArr(objectCobranzaArqueo, extraCobranzaArqueo)
                });
            });

            $.AddPetition({
                type: 4,
                transaction: true,
                items: $.ConvertObjectToArr({
                    script: 'spw_procesos_arqueocajavendedor_registrarmovscajas',
                    C_EMPRESA: c_empresa,
                    C_CAJA: c_caja,
                    C_USUARIO: c_vendedor,
                    C_FECHA: c_fecha,
                    C_OPERACION: c_operacion
                })
            });
            $.SendPetition({
                onReady: function () {
                    $.CloseStatusBar();
                    alertify.success('El arqueo ha sido cerrado.');
                    $('#btnFinalizar').hide();
                    document.location.href = $.solver.baseUrl + `/Procesos/GestionCaja`;
                },
                onBefore: function () {
                    $.DisplayStatusBar({ message: 'Cerrando caja' });
                },
                onError: function (_error) {
                    $.CloseStatusBar();
                    $.ShowError({ error: _error });
                }
            });
        };
        const fnGuardar = function () {
            const objectCobranza = {
                C_EMPRESA: c_empresa,
                C_CAJA: c_caja,
                C_USUARIO: c_vendedor,
                C_FECHA: c_fecha,
                C_OPERACION: c_operacion,
                IND_ESTADO: 'C',
                COMENTARIOS: $('#NOTAS').val(),
                FECHA_ARQUEO: '',
                C_USUARIO_ARQUEO: c_usuario
            };
            const extraCobranza = {
                FECHA_ARQUEO: {
                    action: {
                        name: 'GetQueryId',
                        args: $.ConvertObjectToArr({
                            script: 'gbl_obtener_fecha_server',
                            column: 'FECHA'
                        })
                    }
                }
            }
            $.AddPetition({
                table: 'PDV.COBRANZA',
                type: 2,
                condition: `C_EMPRESA = '${c_empresa}' AND C_CAJA = '${c_caja}' AND C_USUARIO = '${c_vendedor}' AND C_FECHA = '${c_fecha}' AND C_OPERACION = '${c_operacion}'`,
                items: $.ConvertObjectToArr(objectCobranza, extraCobranza)
            });
            const objectBorrarCobranzaArqueo = {
                script: 'spw_delete_detalle_cobranza_arqueo',
                C_EMPRESA: c_empresa,
                C_CAJA: c_caja,
                C_USUARIO: c_vendedor,
                C_FECHA: c_fecha,
                C_OPERACION: c_operacion
            }
            $.AddPetition({
                type: 4,
                transaction: true,
                items: $.ConvertObjectToArr(objectBorrarCobranzaArqueo)
            })
            $.each($(table1).jqxGrid('getrows'), function (i, data) {
                const objectCobranzaArqueo = {
                    C_EMPRESA: c_empresa,
                    C_CAJA: c_caja,
                    C_USUARIO: c_vendedor,
                    C_FECHA: c_fecha,
                    C_OPERACION: c_operacion,
                    C_DETALLE: '',
                    ORDEN: data.ORDEN,
                    COD_MONEDA: data.C_MONEDA,
                    COD_TIPO_MONEDA: data.COD_TIPO_MONEDA,
                    CANT: ((data.CANT != '') ? data.CANT : null),
                    TOTAL: ((data.TOTAL != '') ? data.TOTAL : null),
                    CALCULO: data.CALCULO,
                };
                const extraCobranzaArqueo = {
                    C_DETALLE: {
                        action: {
                            name: 'GetNextId',
                            args: $.ConvertObjectToArr({
                                columns: 'C_EMPRESA,C_CAJA,C_USUARIO,C_FECHA,C_OPERACION',
                                max_length: 3
                            })
                        }
                    }
                };
                $.AddPetition({
                    type: 1,
                    table: 'PDV.COBRANZA_ARQUEO',
                    items: $.ConvertObjectToArr(objectCobranzaArqueo, extraCobranzaArqueo)
                });
            });
            $.each($(table2).jqxGrid('getrows'), function (i, data) {
                const objectCobranzaArqueo = {
                    C_EMPRESA: c_empresa,
                    C_CAJA: c_caja,
                    C_USUARIO: c_vendedor,
                    C_FECHA: c_fecha,
                    C_OPERACION: c_operacion,
                    C_DETALLE: '',
                    ORDEN: data.ORDEN,
                    COD_MONEDA: data.C_MONEDA,
                    COD_TIPO_MONEDA: data.COD_TIPO_MONEDA,
                    CANT: ((data.CANT != '') ? data.CANT : null),
                    TOTAL: ((data.TOTAL != '') ? data.TOTAL : null),
                    CALCULO: data.CALCULO,
                };
                const extraCobranzaArqueo = {
                    C_DETALLE: {
                        action: {
                            name: 'GetNextId',
                            args: $.ConvertObjectToArr({
                                columns: 'C_EMPRESA,C_CAJA,C_USUARIO,C_FECHA,C_OPERACION',
                                max_length: 3
                            })
                        }
                    }
                };
                $.AddPetition({
                    type: 1,
                    table: 'PDV.COBRANZA_ARQUEO',
                    items: $.ConvertObjectToArr(objectCobranzaArqueo, extraCobranzaArqueo)
                });
            });
            $.SendPetition({
                onReady: function () {
                    $.CloseStatusBar();
                    alertify.success('El arqueo ha sido guardado.');
                    //$('#btnGuardar').hide();
                    //document.location.href = $.solver.baseUrl + `/Procesos/GestionCaja`;
                },
                onBefore: function () {
                    $.DisplayStatusBar({ message: 'Guardando arqueo de caja' });
                },
                onError: function (_error) {
                    $.CloseStatusBar();
                    $.ShowError({ error: _error });
                }
            });
        }

        fnObtenerDatosArqueo();
        fnCrearTablaResumen();
        fnCrearTablaSoles();
        fnCrearTablaDolares();
        fnCrearTablaDetalle();

        $('#btnFinalizar').click(function () {
            if (!buttonStatus) {
                buttonStatus = true;
                alertify
                    .confirm('Finalizar arqueo', '<h3 class="text-center">¿Seguro de finalizar el arqueo?</h3>', fnFinalizar, null)
                    .set('labels', { ok: 'Si', cancel: 'No' }).set('defaultFocus', 'ok').set('closable', false);
                buttonStatus = false;
            }
        });

        $('#btnGuardar').click(function () {
            if (!buttonStatus) {
                buttonStatus = true;
                fnGuardar();
                buttonStatus = false;
            }
        });
    });
});