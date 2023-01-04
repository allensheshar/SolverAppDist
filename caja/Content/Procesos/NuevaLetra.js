require(["helper", "extras", "controls", "datetimepicker"], function () {
    require(["alertify", "moment", "bootbox"], function (alertify, moment, bootbox) {

        const tableDetalle = '#tableDetalle';
        const tableDetalleCuotas = '#tableDetalleCuotas';
        const frm = 'form[name=frm]'
        const c_empresa = $.solver.session.SESSION_EMPRESA;
        let _controls;
        let estado = false;
        let arrEliminadas = [];
        let arrCuotas = [];

        alertify.set('notifier', 'position', 'top-center');
        $('.c_empresa').attr('data-c_empresa', c_empresa);

        const fnPintarEmpresa = function () {
            $.GetQuery({
                query: ['q_ventas_procesos_nuevaventa_consultarempresa'],
                items: [{
                    C_EMPRESA: $(_controls.C_EMPRESA).val()
                }],
                onReady: function (result) {
                    const data = result[0]
                    $('#RAZON_SOCIAL').text(data['RAZON_SOCIAL']);
                    $('#DIRECCION_EMPRESA').text(data['DIRECCION']);
                    $('#RUC_EMPRESA').text('RUC N° ' + data['NRO_DOCUMENTO']);
                },
                onError: function (error) {
                    $.CloseStatusBar();
                    $.ShowError({ error });
                }
            })
            $.solver.fn.getImageLogoCompany('#IMAGEN_COMPANY');
        };
        const fnCrearTablaDetalle = function () {
            const fnBorrarFactura = function (indice) {
                alertify.confirm('Mensaje del sistema', '¿Estas seguro de eliminar la factura?',
                    function () {
                        const fila = $(tableDetalle).jqxGrid('getrows')[indice]
                        arrEliminadas.push(fila);
                        const rowid = $(tableDetalle).jqxGrid('getrowid', indice)
                        $(tableDetalle).jqxGrid('deleterow', rowid);
                        $(tableDetalleCuotas).jqxGrid('clear');
                    },
                    function () { alertify.error('Operación cancelada'); }
                ).set('labels', { ok: 'Si', cancel: 'No' }).set('defaultFocus', 'ok').set('closable', false);
            };
            $(tableDetalle).CreateGrid({
                query: 'tbl_caja_procesos_nuevaletra_listadetalle',
                items: {
                    C_EMPRESA: c_empresa,
                    C_LETRA: function () {
                        return $(_controls.C_LETRA).val()
                    }
                },
                hiddens: ['C_EMPRESA', 'C_LETRA', 'C_LETRA_DETALLE', 'C_DOCUMENTO'],
                columns: {
                    NRO_COMPROBANTE: { text: 'Nro comprobante' },
                    FECHA_EMISION: { text: 'Fecha emisión' },
                    MONTO_ORIGINAL: {
                        text: 'Monto original',
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
                    MONTO_PENDIENTE: {
                        text: 'Monto pendiente',
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
                    ELIMINAR: {
                        text: 'Acciones',
                        createwidget: function (row, column, value, htmlElement) {
                            $(tableDetalle).jqxGrid('refresh');
                        },
                        initwidget: function (rowIndex, column, value, htmlElement) {
                            if ($(htmlElement).children().length == 0) {

                                $(htmlElement).html('');
                                $(htmlElement).addClass('jqx-grid-cell-middle-align');
                                $(htmlElement).addClass('mt-1');

                                let _btnEliminar;
                                _btnEliminar = $(`<a id="eliminar" style="cursor: pointer;" class="jqx-grid-widget">&nbsp;Eliminar</a>`);
                                $(htmlElement).append(_btnEliminar);
                                $(htmlElement).find('a#eliminar').unbind('click');
                                $(htmlElement).find('a#eliminar').click(function () {
                                    fnBorrarFactura(rowIndex);
                                });
                            }
                        },
                        width: 80
                    }
                },
                config: {
                    virtualmode: false,
                    pageSize: 999999,
                    pageable: false,
                    sortable: false,
                    editable: false,
                    showaggregates: true,
                    showstatusbar: true,
                    statusbarheight: 20,
                    selectionmode: 'none',
                    rendered: function () {
                        $(tableDetalle).jqxGrid('selectrow', 0);

                        var rows = $(tableDetalle).jqxGrid('getrows');
                        var totalFraccion = 0.0;
                        $.each(rows, function (i, v) {
                            totalFraccion += v.MONTO_PENDIENTE;
                        });
                        $(_controls.TOTAL_FRACCION).val(totalFraccion);
                    }
                }
            });
        };
        const fnCrearTablaDetalleCuotas = function () {
            $(tableDetalleCuotas).CreateGrid({
                query: 'tbl_caja_procesos_nuevaletra_listadetallecuotas',
                items: {
                    C_EMPRESA: c_empresa,
                    C_LETRA: function () {
                        return $(_controls.C_LETRA).val()
                    },
                    C_LETRA_DETALLE: function () {
                        return $(_controls.C_LETRA_DETALLE).val()
                    }
                },
                hiddens: ['C_EMPRESA', 'C_LETRA'],
                columns: {
                    C_LETRA_CUOTA: {
                        text: 'N°',
                        width: 30,
                        cellsAlign: 'center',
                        editable: false,
                    },
                    MONTO_CUOTA: {
                        text: 'Monto cuota',
                        cellsAlign: 'right',
                        cellsFormat: 'd2',
                        width: 100,
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
                    FECHA_PAGO: { text: 'Fecha pago' },
                },
                config: {
                    virtualmode: false,
                    pageSize: 999999,
                    pageable: false,
                    sortable: false,
                    editable: true,
                    showaggregates: true,
                    showstatusbar: true,
                    statusbarheight: 20,
                    rendered: function () {
                        var totalLetra = 0.0;
                        $.each($(tableDetalleCuotas).jqxGrid('getrows'), function (i, v) { totalLetra += v.MONTO_CUOTA; });
                        $(_controls.TOTAL_LETRA).val(totalLetra);
                    }
                }
            });
            $(tableDetalleCuotas).on('cellvaluechanged', function (event) {
                var rows = $(tableDetalleCuotas).jqxGrid('getrows');
                var totalLetra = 0.0;
                $.each(rows, function (i, v) { totalLetra += v.MONTO_CUOTA; });
                arrCuotas = rows;
                $(_controls.TOTAL_LETRA).val(totalLetra);
            });
        };
        const fnObtenerCliente = function () {
            $.GetQuery({
                query: ['q_caja_procesos_nuevaletra_obtenercliente'],
                items: [{
                    C_EMPRESA: c_empresa,
                    C_CLIENTE: function () {
                        return $(_controls.C_CLIENTE).val();
                    }
                }],
                onReady: function (result) {
                    if (result.length > 0) {
                        const data = result[0];
                        $(frm + ' #NOMBRE').text(data.RAZON_SOCIAL);
                        $(frm + ' #DIRECCION').text(data.DIRECCION_FISCAL);
                        $(frm + ' #tipo_doc').text(data.TIPO_DOCUMENTO);
                        $(frm + ' #RUC').text(data.RUC_CLIENTE);
                    }
                },
                onError: function (error) {
                    $.CloseStatusBar();
                    $.ShowError({ error });
                }
            })
        };
        const fnBuscarCliente = function () {
            $.GetData({
                title: '<strong>BUSQUEDA DE CLIENTES</strong>',
                uriData: $.solver.baseUrl + '/Procesos/BusquedaCliente/',
                location: 'float',
                type: 'GET',
                isPage: true,
                onReady: function (object, modal) {
                    $(modal).find('.modal-dialog').css({ 'max-width': '60%' });
                    $(object).find('#table').CreateGrid({
                        query: 'gbl_listarclientes_con_ventas',
                        items: {
                            C_EMPRESA: c_empresa,
                            NOMBRE: function () {
                                return $('#_buscar').val() || '';
                            },
                        },
                        hiddens: ['C_CLIENTE', 'C_PARAMETRO_GENERAL_TIPO_DOCUMENTO', 'C_CATEGORIA_CLIENTE'],
                        columns: {
                            'RUC_CLIENTE': {
                                text: 'Nro Documento',
                                width: 100
                            },
                            'RAZON_SOCIAL': {
                                text: 'Razón Social',
                                width: 250
                            },
                            'NOMBRE_COMERCIAL': {
                                text: 'Nombre Comercial',
                                width: 250
                            },
                            'DIRECCION_FISCAL': {
                                text: 'Dirección Fiscal',
                                width: 250
                            }
                        },
                        config: {
                            pageable: false,
                            sortable: false,
                            editable: false,
                            pageSize: 999999,
                            height: 600,
                            rendered: function () {
                                $(object).find('#table').jqxGrid('selectrow', 0);
                            }
                        }
                    });
                    const actionElegir = function () {
                        const getselectedrowindexes = $(object).find('#table').jqxGrid('getselectedrowindexes');
                        if (getselectedrowindexes.length > 0) {
                            const selectedRowData = $(object).find('#table').jqxGrid('getrowdata', getselectedrowindexes[0]);
                            $(_controls.C_CLIENTE).val(selectedRowData['C_CLIENTE']);
                            fnObtenerCliente();
                            bootbox.hideAll();
                        }
                    }
                    $(object).find('#table').on("rowdoubleclick", function () {
                        actionElegir();
                    });
                },
                onCloseModal: function () { estado = false; }
            });
        };
        const fnBuscarFacturasPendientes = function () {
            $.GetData({
                title: '<strong>Busqueda de documentos de venta</strong>',
                uriData: $.solver.baseUrl + '/Procesos/BusquedaCliente/',
                location: 'float',
                type: 'GET',
                isPage: true,
                onReady: function (object, modal) {
                    $(modal).find('.modal-dialog').css({ 'max-width': '60%' });
                    $(object).find('#table').CreateGrid({
                        query: 'tbl_caja_procesos_nuevaletra_busquedafacturas',
                        items: {
                            C_EMPRESA: c_empresa,
                            C_CLIENTE: function () {
                                return $(_controls.C_CLIENTE).val();
                            },
                            C_MONEDA: function () {
                                return $(_controls.C_PARAMETRO_GENERAL_MONEDA).val();
                            },
                            C_VENTA: function () {
                                var c_ventas = [];
                                $.each($(tableDetalle).jqxGrid('getrows'), function (i, v) {
                                    c_ventas.push(v.C_DOCUMENTO);
                                });
                                return c_ventas.join(',')
                            },
                            BUSCAR: function () {
                                return $(object).find('#_buscar').val();
                            }
                        },
                        hiddens: [],
                        columns: {
                            'C_DOCUMENTO': { text: 'Código', width: 100, },
                            'FECHA_EMISION': { text: 'Fec. de emisión', width: 100, },
                            'TIPO_COMPROBANTE': { text: 'Tipo de doc.', width: 100, },
                            'NRO_COMPROBANTE': { text: 'Nro de doc.', width: 100, },
                            'MONTO_ORIGINAL': {
                                text: 'M. original', width: 100, width: 80,
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
                            'MONTO_PENDIENTE': {
                                text: 'M. pendiente', width: 100, width: 80,
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

                        },
                        config: {
                            pageable: false,
                            sortable: false,
                            editable: false,
                            pageSize: 999999,
                            height: 600,
                            rendered: function () {
                                $(object).find('#table').jqxGrid('selectrow', 0);
                            }
                        }
                    });
                    $(object).find('#buscar').click(function () {
                        $(object).find('#table').jqxGrid('updatebounddata')
                    });
                    const actionElegir = function () {
                        const getselectedrowindexes = $(object).find('#table').jqxGrid('getselectedrowindexes');
                        if (getselectedrowindexes.length > 0) {
                            const row = $(object).find('#table').jqxGrid('getrowdata', getselectedrowindexes[0]);
                            $(tableDetalle).jqxGrid('addrow', null, {
                                C_EMPRESA: c_empresa,
                                C_LETRA: '',
                                C_LETRA_DETALLE: '',
                                C_DOCUMENTO: row.C_DOCUMENTO,
                                NRO_COMPROBANTE: row.NRO_COMPROBANTE,
                                FECHA_EMISION: row.FECHA_EMISION,
                                MONTO_ORIGINAL: row.MONTO_ORIGINAL,
                                MONTO_PENDIENTE: row.MONTO_PENDIENTE
                            });
                            $(tableDetalleCuotas).jqxGrid('clear');
                            bootbox.hideAll();
                        }
                    }
                    $(object).find('#table').on("rowdoubleclick", function () {
                        actionElegir();
                    });
                },
                onCloseModal: function () { estado = false; }
            });
        };
        const fnAplicarCuotas = function () {
            if ($(_controls.NRO_CUOTAS).val() <= 0) alertify.warning('Las cuotas no pueden cero o menor.');
            else {
                var cuotas = $(_controls.NRO_CUOTAS).val()
                var totalFraccion = $(_controls.TOTAL_FRACCION).val();
                var montoParcial = totalFraccion / cuotas;
                arrCuotas = [];
                $(tableDetalleCuotas).jqxGrid('clear');
                var fecha;
                for (var i = 0; i < cuotas; i++) {
                    fecha = moment().clone().startOf('month').add(i + 1, 'month').format('DD/MM/YYYY');
                    arrCuotas.push({
                        C_EMPRESA: c_empresa,
                        C_LETRA: '',
                        C_LETRA_CUOTA: i + 1,
                        MONTO_CUOTA: montoParcial,
                        FECHA_PAGO: fecha
                    });
                }
                $(tableDetalleCuotas).jqxGrid('addrow', {}, arrCuotas);
            }
        }

        $(frm).ValidForm({
            table: 'CAJA.LETRA',
            type: 1,
            querySave: true,
            extras: {
                C_LETRA: {
                    action: {
                        name: 'GetNextId',
                        args: $.ConvertObjectToArr({
                            max_length: '10',
                            columns: 'C_EMPRESA'
                        })
                    }
                }
            },
            onSubmit: function (form, controls, objParent) {
                objParent.C_USUARIO = $.solver.session.SESSION_ID;

                if ($(controls.C_CLIENTE).val() == '') {
                    alertify.warning('Por favor seleccione el cliente.');
                    return false;
                }
                else if ($(tableDetalle).jqxGrid('getrows').length == 0) {
                    alertify.warning('Por favor agregue items al detalle.');
                    return false;
                }
                else if ($(tableDetalleCuotas).jqxGrid('getrows').map(item => item.MONTO_CUOTA).reduce((prev, next) => prev + next) != $(_controls.TOTAL_FRACCION).val()) {
                    alertify.warning('Por favor el monto total de las cuotas deben ser igual al total a fraccionar.');
                    return false;
                }
                return true;
            },
            onDetail: function (form, controls, token) {
                $.each(arrEliminadas, function (i, eliminado) {
                    const c_detalle = eliminado.C_DETALLE;
                    if (c_detalle != '') {
                        const objEli = {
                            C_EMPRESA: c_empresa,
                            C_LETRA: eliminado.C_LETRA,
                            C_LETRA_DETALLE: eliminado.C_LETRA_DETALLE,
                            IND_ESTADO: '&'
                        };
                        $.AddPetition({
                            table: 'CAJA.LETRA_DETALLE',
                            type: 2,
                            condition: `C_EMPRESA = '${c_empresa}' AND C_LETRA = '${eliminado['C_LETRA']}' AND C_LETRA_DETALLE = '${eliminado['C_LETRA_DETALLE']}'`,
                            items: $.ConvertObjectToArr(objEli)
                        });
                    }
                });

                var rowsDetalle = $(tableDetalle).jqxGrid('getrows');
                $.each(rowsDetalle, function (i, v) {
                    $.AddPetition({
                        table: 'CAJA.LETRA_DETALLE',
                        type: (v.C_LETRA_DETALLE == '' ? 1 : 2),
                        condition: (v.C_LETRA_DETALLE == '' ? '' : `C_EMPRESA = '${c_empresa}' AND C_LETRA = '${v.C_LETRA}' AND C_LETRA_DETALLE = '${v.C_LETRA_DETALLE}'`),
                        items: $.ConvertObjectToArr({
                            C_EMPRESA: c_empresa,
                            C_LETRA: v.C_LETRA,
                            C_LETRA_DETALLE: v.C_LETRA_DETALLE,
                            C_DOCUMENTO: v.C_DOCUMENTO,
                            MONTO_ORIGINAL: v.MONTO_ORIGINAL,
                            MONTO_PENDIENTE: v.MONTO_PENDIENTE,
                            IND_ESTADO: '*'
                        }, (v.C_LETRA_DETALLE == '' ? {
                            C_LETRA: {
                                action: {
                                    name: 'GetParentId',
                                    args: $.ConvertObjectToArr({
                                        token: token,
                                        column: 'C_LETRA'
                                    })
                                }
                            },
                            C_LETRA_DETALLE: {
                                action: {
                                    name: 'GetNextId',
                                    args: $.ConvertObjectToArr({
                                        columns: 'C_EMPRESA,C_LETRA',
                                        max_length: 10
                                    })
                                }
                            }
                        } : {}))
                    });
                });

                $.AddPetition({
                    type: 4,
                    items: $.ConvertObjectToArr({
                        script: 'spw_caja_nuevaletra_anularletracuota',
                        C_EMPRESA: c_empresa,
                        C_LETRA: ''
                    },
                        {
                            C_LETRA: {
                                action: {
                                    name: 'GetParentId',
                                    args: $.ConvertObjectToArr({
                                        token: token,
                                        column: 'C_LETRA'
                                    })
                                }
                            },
                        }),
                    transaction: true
                });

                $.each($(tableDetalleCuotas).jqxGrid('getrows'), function (i, v) {
                    $.AddPetition({
                        table: 'CAJA.LETRA_CUOTA',
                        type: 1,
                        items: $.ConvertObjectToArr({
                            C_EMPRESA: c_empresa,
                            C_LETRA: v.C_LETRA,
                            C_LETRA_CUOTA: v.C_LETRA_CUOTA,
                            MONTO_CUOTA: v.MONTO_CUOTA,
                            FECHA_PAGO: v.FECHA_PAGO,
                            IND_ESTADO: '*'
                        }, {
                            C_LETRA: {
                                action: {
                                    name: 'GetParentId',
                                    args: $.ConvertObjectToArr({
                                        token: token,
                                        column: 'C_LETRA'
                                    })
                                }
                            },
                            C_LETRA_CUOTA: {
                                action: {
                                    name: 'GetNextId',
                                    args: $.ConvertObjectToArr({
                                        columns: 'C_EMPRESA,C_LETRA'
                                    })
                                }
                            }
                        })
                    });
                });
            },
            onDone: function (form, controls) {
                _controls = controls;
                $(controls.C_EMPRESA).val(c_empresa);
                $('#LETRA').text($(controls.C_LETRA).val() == '' ? 'XXXX' : 'L-' + $(controls.C_LETRA).val());

                if ($(controls.C_LETRA).val() != '') {
                    $(controls.FECHA_EMISION).val(moment($(controls.FECHA_EMISION).val()).format('DD/MM/YYYY'));
                    fnObtenerCliente();
                }
                $(controls.FECHA_EMISION).datetimepicker({
                    format: 'DD/MM/YYYY',
                    locale: 'es'
                });

                fnPintarEmpresa();
                fnCrearTablaDetalle();
                fnCrearTablaDetalleCuotas();

                $(frm + ' #btnCliente').click(function () {
                    if (!estado) {
                        estado = true;
                        fnBuscarCliente();
                    }
                });

                $(frm + ' #btnVenta').click(function () {
                    if (!estado) {
                        estado = true;
                        fnBuscarFacturasPendientes();
                    }
                });

                $(frm + ' #btnAplicarCuotas').click(function () {
                    fnAplicarCuotas();
                });

                //$(frm + ' #btnAtras').click(function () {
                //    document.location = $.solver.baseUrl + '/Procesos/GeneracionLetra';
                //});
            },
            onReady: function (result) {
                alertify.success('Se guardaron la información.');
                //var c_letra = result.items.C_LETRA;
                //document.location = $.solver.baseUrl + '/Procesos/NuevaLetra/' + c_letra;
                document.location = $.solver.baseUrl + '/Procesos/GeneracionLetra';
            },
            onError: function (error) {
                $.CloseStatusBar();
                $.ShowError({ error });
            }
        });
    });
});