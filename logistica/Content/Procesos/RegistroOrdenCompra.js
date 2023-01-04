require(["helper", "extras", "datetimepicker"], function () {
    require(["alertify", "bootbox", "moment"], function (alertify, bootbox, moment) {
        alertify.set('notifier', 'position', 'top-center');

        const empresa = $.solver.session.SESSION_EMPRESA;
        const direccionServicio = $.solver.services.api;
        const direccion = $.solver.baseUrl;
        const table = '#tblOrdenCompra';

        $('.c_empresa').attr('data-c_empresa', empresa);
        $('.c_empresa').attr('data-empresa', empresa);
        $("._desde, ._hasta").datetimepicker({
            format: 'DD/MM/YYYY',
            locale: 'es'
        });

        const fnCambiarDisplay = function (element, estado) {
            let display = '';
            if (estado) display = 'block';
            else display = 'none';
            $(element).css({ 'display': display });
        }
        const fnMostrarPdf = function (token) {
            bootbox.dialog({
                message: `<div class="embed-responsive embed-responsive-16by9"><iframe class= "embed-responsive-item" src="https://api.solver.com.pe/v1//service/ViewFile/${token}/" allowfullscreen></iframe></div>`,
                closeButton: true,
                className: 'modal-75'
            });
        }
        const fnCrearTabla = function () {
            $(table).CreateGrid({
                query: 'tbl_logistica_procesos_registroordencompra_obtenerordencompra',
                items: {
                    C_EMPRESA: empresa,
                    DESDE: function () { return $('#_desde').val() },
                    HASTA: function () { return $('#_hasta').val() },
                    PROVEEDOR: function () { return $('#_proveedor').val() },
                    TIPO_TRANSACCION: function () { return $('#_tipo').val() },
                    UNIDAD_NEGOCIO: function () { return $('#_centro').val() },
                    ALMACEN: function () { return $('#_almacen').val() },
                    ESTADO: function () { return $('#_estado').val() },
                    NRO_OC: function () { return $('#_buscar').val() },
                },
                hiddens: ['C_ORDEN_COMPRA', 'CORREO_FACTURACION', 'C_ARCHIVO_PDF_ORDEN_COMPRA', 'C_PROVEEDOR', 'CORREO_CONTACTO', 'NOMBRE_CONTACTO_COMPRAS', 'C_PIA'],
                sortcolumn: 'COMPROBANTE',
                sortdirection: 'DESC',
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
                    'COMPROBANTE': {
                        text: 'Comprobante',
                        width: 130
                    },
                    'FECHA_EMISION': {
                        text: 'Fecha emisión',
                        width: 100,
                        cellsAlign: 'center',
                    },
                    'RAZON_SOCIAL': {
                        text: 'Proveedor',
                        width: 330
                    },
                    'TIPO_TRANSACCION': {
                        text: 'Tipo transacción',
                        width: 120
                    },
                    'ALMACEN': {
                        text: 'Almacen',
                        width: 150
                    },
                    'MONEDA': {
                        text: 'Moneda',
                        width: 100
                    },
                    'TOTAL': {
                        text: 'Total a pagar',
                        width: 120,
                        cellsAlign: 'right',
                        cellsFormat: 'd2',
                        columnType: 'numberinput'
                    },
                    'IND_ESTADO_COMPRA': {
                        text: 'Estado',
                        width: 100,
                        cellsAlign: 'center',
                        cellsrenderer: function (row, columnfield, value, defaulthtml, columnproperties) {
                            if (value == 'Pendiente') return '<div class="mt-2 jqx-grid-cell-middle-align"><span class="text-extra" style="color:blue;"><i class="fa fa-asterisk" aria-hidden="true"></i> ' + value + '</span></div>';
                            if (value == 'Heredada') return '<div class="mt-2 jqx-grid-cell-middle-align"><span class="text-extra" style="color:blue;"><i class="fa fa-asterisk" aria-hidden="true"></i> ' + value + '</span></div>';
                            if (value == 'Modificada') return '<div class="mt-2 jqx-grid-cell-middle-align"><span class="text-extra" style="color:blue;"><i class="fa fa-pencil-square-o" aria-hidden="true"></i> ' + value + '</span></div>';
                            if (value == 'Observada') return '<div class="mt-2 jqx-grid-cell-middle-align"><span class="text-extra" style="color:#ffc107;"><i class="fa fa-exclamation-triangle" aria-hidden="true"></i> ' + value + '</span></div>';
                            if (value == 'Enviada al Proveedor') return '<div class="mt-2 jqx-grid-cell-middle-align"><span class="text-extra" style="color:green;"><i class="fa fa-envelope-o" aria-hidden="true"></i> ' + value + '</span></div>';
                            if (value == 'Aprobada') return '<div class="mt-2 jqx-grid-cell-middle-align"><span class="text-extra" style="color:green;"><i class="fa fa-check-circle" aria-hidden="true"></i> ' + value + '</span></div>';
                            if (value == 'Anulada') return '<div class="mt-2 jqx-grid-cell-middle-align"><span class="text-extra" style="color:red;"><i class="fa fa-trash" aria-hidden="true"></i> ' + value + '</span></div>';
                            if (value == 'Rechazada') return '<div class="mt-2 jqx-grid-cell-middle-align"><span class="text-extra" style="color:red;"><i class="fa fa-times" aria-hidden="true"></i> ' + value + '</span></div>';
                        }
                    },
                    'IND_COMPRA': { text: 'Compra', columntype: 'checkbox', width: 80 },
                    'IND_GUIA': { text: 'Guia', columntype: 'checkbox', width: 80 },
                    'IND_PIA': { text: 'P.I.A', columntype: 'checkbox', width: 80 },
                    'Pdf': {
                        width: 45,
                        cellsRenderer: function (row, columnfield, value, defaulthtml, columnproperties) {
                            if (value != '') {
                                return `<a href="#" onclick="$.VerPdf('${value}');" style="margin-top: 0.5rem;display: block;margin-left: 0.3rem;"><i class="fa fa-eye" aria-hidden="true"></i></span> Ver`;
                            }
                        },
                        sortable: false,
                    }
                },
                config: {
                    pageSize: 99999,
                    sortable: true,
                    editable: false,
                }
            });
            $(table).on('bindingcomplete', function () {
                $(table).jqxGrid('selectrow', 0);
            });
            $(table).on('rowselect', function (event) {
                var args = event.args;
                var rowBoundIndex = args.rowindex;
                var rowData = args.row;

                if (rowData != undefined) {
                    const estado = rowData['IND_ESTADO_COMPRA'];
                    if (estado == 'Pendiente') {
                        fnCambiarDisplay('#btnEditar', true);
                        fnCambiarDisplay('#btnEnviar', true);
                        fnCambiarDisplay('#btnDuplicar', true);
                        fnCambiarDisplay('#btnAnular', true);
                        fnCambiarDisplay('#btnAprobar', true);
                        fnCambiarDisplay('#btnReprocesarPdf', true);
                    }
                    else if (estado == 'Heredada') {
                        fnCambiarDisplay('#btnEditar', true);
                        fnCambiarDisplay('#btnEnviar', true);
                        fnCambiarDisplay('#btnDuplicar', true);
                        fnCambiarDisplay('#btnAnular', true);
                        fnCambiarDisplay('#btnAprobar', true);
                        fnCambiarDisplay('#btnReprocesarPdf', true);
                    }
                    else if (estado == 'Enviada al Proveedor') {
                        fnCambiarDisplay('#btnEditar', true);
                        fnCambiarDisplay('#btnEnviar', true);
                        fnCambiarDisplay('#btnDuplicar', true);
                        fnCambiarDisplay('#btnAnular', true);
                        fnCambiarDisplay('#btnAprobar', true);
                        fnCambiarDisplay('#btnReprocesarPdf', true);
                    }
                    else if (estado == 'Rechazada') {
                        fnCambiarDisplay('#btnEditar', true);
                        fnCambiarDisplay('#btnEnviar', false);
                        fnCambiarDisplay('#btnDuplicar', true);
                        fnCambiarDisplay('#btnAnular', false);
                        fnCambiarDisplay('#btnAprobar', false);
                        fnCambiarDisplay('#btnReprocesarPdf', true);
                    }
                    else if (estado == 'Observada') {
                        fnCambiarDisplay('#btnEditar', true);
                        fnCambiarDisplay('#btnEnviar', true);
                        fnCambiarDisplay('#btnDuplicar', true);
                        fnCambiarDisplay('#btnAnular', true);
                        fnCambiarDisplay('#btnAprobar', false);
                        fnCambiarDisplay('#btnReprocesarPdf', true);
                    }
                    else if (estado == 'Modificada') {
                        fnCambiarDisplay('#btnEditar', true);
                        fnCambiarDisplay('#btnEnviar', true);
                        fnCambiarDisplay('#btnDuplicar', true);
                        fnCambiarDisplay('#btnAnular', true);
                        fnCambiarDisplay('#btnAprobar', true);
                        fnCambiarDisplay('#btnReprocesarPdf', true);
                    }
                    else if (estado == 'Aprobada') {
                        fnCambiarDisplay('#btnEditar', true);
                        fnCambiarDisplay('#btnEnviar', true);
                        fnCambiarDisplay('#btnDuplicar', true);
                        fnCambiarDisplay('#btnAnular', true);
                        fnCambiarDisplay('#btnAprobar', false);
                        fnCambiarDisplay('#btnReprocesarPdf', false);
                    }
                    else if (estado == 'Anulada') {
                        fnCambiarDisplay('#btnEditar', true);
                        fnCambiarDisplay('#btnEnviar', false);
                        fnCambiarDisplay('#btnDuplicar', true);
                        fnCambiarDisplay('#btnAnular', false);
                        fnCambiarDisplay('#btnAprobar', false);
                        fnCambiarDisplay('#btnReprocesarPdf', false);
                    }
                }

            });
            $(table).on('rowdoubleclick', function () {
                const indice = $(table).jqxGrid('getselectedrowindex');
                const fila = $(table).jqxGrid('getrows')[indice];
                const c_orden_compra = fila['C_ORDEN_COMPRA'];
                document.location = $.solver.baseUrl + '/Procesos/NuevaOrdenCompra/' + c_orden_compra;
            })
        };
        const fnEnviarEmail = function (fila, archivoPdf) {

            const c_orden_compra = fila['C_ORDEN_COMPRA'];
            const email_contacto_proveedor = fila['CORREO_CONTACTO'];
            const nombre_contacto_proveedor = fila['NOMBRE_CONTACTO_COMPRAS']
            let c_archivo = [];

            if (archivoPdf == undefined) c_archivo.push(fila['C_ARCHIVO_PDF_ORDEN_COMPRA']);
            else c_archivo.push(archivoPdf);

            $.GetData({
                title: '<strong>Enviar orden de compra</strong>',
                uriData: $.solver.baseUrl + '/Procesos/EnviarEmailOc/',
                location: 'float',
                type: 'GET',
                isPage: true,
                onReady: function (object, modal) {
                    $(modal).find('.modal-dialog').css({ 'max-width': '40%' });

                    var mensaje = 'Estimado, se le enviará esta orden de compra al contacto del proveedor <strong> ' + nombre_contacto_proveedor + '</strong> con el siguiente correo:'
                    $(object).find('#correo').val(email_contacto_proveedor);
                    $(object).find('#correo_destino').html(mensaje);

                    $(object).find('#btnEnviar').click(function () {
                        var lstCorreos = [];
                        lstCorreos.push($(object).find('#correo').val());

                        $.each($(object).find('.correos'), function (i, v) {
                            lstCorreos.push($(v).val());
                        });

                        $.AddPetition({
                            type: '7',
                            items: $.ConvertObjectToArr({
                                script: 'obtener_datos_proveedor',
                                c_empresa: empresa,
                                c_orden_compra: c_orden_compra,
                                link: $.solver.services.api,
                                codigo_formato: 'formato_estandar_ordencompra_correo',
                                email: lstCorreos.join(','),
                                attachment: c_archivo,
                                url: direccionServicio,
                                baseUrl: $.solver.baseUrl
                            })
                        });
                        $.SendPetition({
                            onBefore: function () {
                                $.DisplayStatusBar({ message: 'Enviando correo al cliente.' });
                            },
                            onReady: function () {
                                $.CloseStatusBar();
                                require(['alertify'], function (alertify) {

                                    $.CloseStatusBar();
                                    const objectOrdenCompra = {
                                        C_ORDEN_COMPRA: c_orden_compra,
                                        C_EMPRESA: empresa,
                                        IND_ESTADO_COMPRA: 'E'
                                    };
                                    $.AddPetition({
                                        table: 'LOG.ORDEN_COMPRA',
                                        type: 2,
                                        condition: `C_ORDEN_COMPRA = '${c_orden_compra}' AND C_EMPRESA = '${empresa}'`,
                                        items: $.ConvertObjectToArr(objectOrdenCompra)
                                    });
                                    $.SendPetition({
                                        connectToLogin: 'S',
                                        onBefore: function () {
                                            $.DisplayStatusBar({ message: 'Espere un momento por favor.' });
                                            alertify.success('El correo fue enviado exitosamente.');
                                        },
                                        onReady: function (result) {
                                            $.CloseStatusBar();
                                            bootbox.hideAll();
                                            $('form[name=frmOrdenCompras]').submit();
                                        },
                                        onError: function (_error) {
                                            $.CloseStatusBar();
                                            $.ShowError({ error: _error });
                                        }
                                    });
                                });
                            },
                            onError: function () {
                                $.CloseStatusBar();
                                require(['alertify'], function (alertify) {
                                    alertify.error('No se pudo entregar el correo.');
                                });
                            }
                        });
                    });

                    $(object).find('#btnAgregar').click(function () {
                        $(object).find('#lstCorreos').append(
                            `   <input type="text" class="form-control mt-2 correos" />`
                        )
                    });
                }
            });
        };
        const fnGenerarPdf = function () {

            var index = $(table).jqxGrid('getselectedrowindex');
            var row = $(table).jqxGrid('getrows')[index];
            var c_orden_compra = row['C_ORDEN_COMPRA'];
            $.DisplayStatusBar({ message: 'Generando pdf.' });

            $.CreatePDFDocument({
                empresa: $.solver.session.SESSION_EMPRESA,
                formato: 'formato_estandar_comprobante_orden_compra',
                papel: 'A4',
                querys: [
                    {
                        name: 'cabecera',
                        args: $.ConvertObjectToArr({
                            modeWork: 'd', //diccionario
                            script: 'gbl_lista_formato_orden_compra_pdf_cabecera',
                            C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                            C_ORDEN_COMPRA: c_orden_compra,
                        })
                    },
                    {
                        name: 'detalle',
                        args: $.ConvertObjectToArr({
                            script: 'gbl_lista_formato_orden_compra_pdf_detalle',
                            C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                            C_ORDEN_COMPRA: c_orden_compra,
                        })
                    },
                ],
                onReady: function (result) {
                    const archivoPdf = result.token;
                    const objectOrdenCompra = {
                        C_ORDEN_COMPRA: c_orden_compra,
                        C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                        C_ARCHIVO_PDF_ORDEN_COMPRA: archivoPdf
                    };
                    $.AddPetition({
                        table: 'LOG.ORDEN_COMPRA',
                        type: 2,
                        condition: `C_ORDEN_COMPRA = '${c_orden_compra}' AND C_EMPRESA = '${$.solver.session.SESSION_EMPRESA}'`,
                        items: $.ConvertObjectToArr(objectOrdenCompra)
                    });
                    $.SendPetition({
                        connectToLogin: 'S',
                        onBefore: function () {
                            $.DisplayStatusBar({ message: 'Guardando el formato PDF.' });
                        },
                        onReady: function (result) {
                            $.CloseStatusBar();
                            alertify.success('Se guardó el formato PDF.');
                            $('form[name=frmOrdenCompras]').submit();
                            //fnEnviarEmail(row, archivoPdf);
                        },
                        onError: function (_error) {
                            $.CloseStatusBar();
                            $.ShowError({ error: _error });
                        }
                    });
                }
            })
        }
        const actionEnviar = function () {
            const indice = $(table).jqxGrid('getselectedrowindex');
            const fila = $(table).jqxGrid('getrows')[indice];
            const c_orden_compra = fila['C_ORDEN_COMPRA'];
            const estado = fila['IND_ESTADO_COMPRA'];

            $.GetQuery({
                query: ['q_logistica_procesos_registroordencompra_comprobarpdf'],
                items: [{
                    C_ORDEN_COMPRA: c_orden_compra,
                    C_EMPRESA: empresa
                }],
                onReady: function (result) {
                    if (result.length > 0) {
                        if (result[0].CONT > 0) {
                            // Creamos pdf y enviamos pdf
                            //if (estado == 'Modificada') {
                            //    fnGenerarPdf()
                            //}
                            //else {
                                fnEnviarEmail(fila)
                            //}
                        }
                        else {
                            alertify.warning('Por favor procese el pdf');
                            // Existe pdf y enviamos pdf
                            //fnGenerarPdf()
                        }
                    }
                }
            })

        };
        const actionAprobar = function () {
            const indice = $(table).jqxGrid('getselectedrowindex');
            const fila = $(table).jqxGrid('getrows')[indice];
            const c_orden_compra = fila['C_ORDEN_COMPRA'];
            const objectOrdenCompra = {
                C_ORDEN_COMPRA: c_orden_compra,
                C_EMPRESA: empresa,
                IND_ESTADO_COMPRA: 'A'
            };
            $.AddPetition({
                table: 'LOG.ORDEN_COMPRA',
                type: 2,
                condition: `C_ORDEN_COMPRA = '${c_orden_compra}' AND C_EMPRESA = '${empresa}'`,
                items: $.ConvertObjectToArr(objectOrdenCompra)
            });
            $.SendPetition({
                connectToLogin: 'S',
                onBefore: function () {
                    $.DisplayStatusBar({ message: 'Aprobando orden de compra.' });
                },
                onReady: function (result) {
                    $.CloseStatusBar();
                    alertify.success('Se aprobó la orden de compra.');
                    $('form[name=frmOrdenCompras]').submit();
                },
                onError: function (_error) {
                    $.CloseStatusBar();
                    $.ShowError({ error: _error });
                }
            });
        };
        const actionDuplicar = function () {
            const indice = $(table).jqxGrid('getselectedrowindex');
            const fila = $(table).jqxGrid('getrows')[indice];
            let c_orden_compra = fila['C_ORDEN_COMPRA'];
            $.GetQuery({
                query: ['q_logistica_procesos_registroordencompra_obtenercabeceraoc', 'q_logistica_procesos_registroordencompra_obtenerdetalleoc'],
                items: [
                    { C_ORDEN_COMPRA: c_orden_compra, C_EMPRESA: empresa },
                    { C_ORDEN_COMPRA: c_orden_compra, C_EMPRESA: empresa }
                ],
                onError: function (error) {
                    $.CloseStatusBar();
                    $.ShowError({ error: error });
                },
                onReady: function (result) {
                    const cabecera = result['q_logistica_procesos_registroordencompra_obtenercabeceraoc'].result.rows[0];
                    const detalle = result['q_logistica_procesos_registroordencompra_obtenerdetalleoc'].result.rows;
                    const extraOrdenCompra = {
                        C_ORDEN_COMPRA: {
                            action: {
                                name: 'GetNextId',
                                args: $.ConvertObjectToArr({
                                    columns: 'C_EMPRESA',
                                    max_length: '10'
                                })
                            }
                        }
                    };
                    const objectOrdenCompra = {
                        C_EMPRESA: cabecera.C_EMPRESA,
                        C_ORDEN_COMPRA: cabecera.C_ORDEN_COMPRA,
                        C_TIPO_TRANSACCION: cabecera.C_TIPO_TRANSACCION,
                        C_UNIDAD_NEGOCIO: cabecera.C_UNIDAD_NEGOCIO,
                        C_ALMACEN: cabecera.C_ALMACEN,
                        C_PARAMETRO_GENERAL_MONEDA: cabecera.C_PARAMETRO_GENERAL_MONEDA,
                        TC: cabecera.TC,
                        C_PROVEEDOR: cabecera.C_PROVEEDOR,
                        OBS_ADICIONAL: cabecera.OBS_ADICIONAL,
                        IND_ORDEN_COMPRA: cabecera.IND_ORDEN_COMPRA,
                        IND_ESTADO_COMPRA: cabecera.IND_ESTADO_COMPRA,
                        FECHA_EMISION: cabecera.FECHA_EMISION,
                        FECHA_ENTREGA: cabecera.FECHA_ENTREGA,
                        TOTAL_A_PAGAR: cabecera.TOTAL_A_PAGAR,
                        FLAG_COMPRA: cabecera.FLAG_COMPRA,
                        FLAG_GUIA: cabecera.FLAG_GUIA,
                        PRECIO_BASE: cabecera.PRECIO_BASE,
                        IGV: cabecera.IGV,
                        C_ARCHIVO_PDF_ORDEN_COMPRA: cabecera.C_ARCHIVO_PDF_ORDEN_COMPRA,
                    }
                    const tokenOrdenCompra = $.AddPetition({
                        table: 'LOG.ORDEN_COMPRA',
                        type: 1,
                        items: $.ConvertObjectToArr(objectOrdenCompra, extraOrdenCompra)
                    });
                    $.each(detalle, function (k, v) {
                        const extraOrdenCompraDetalle = {
                            C_ORDEN_COMPRA: {
                                action: {
                                    name: 'GetParentId',
                                    args: $.ConvertObjectToArr({
                                        token: tokenOrdenCompra,
                                        column: 'C_ORDEN_COMPRA'
                                    })
                                }
                            },
                            C_DETALLE: {
                                action: {
                                    name: 'GetNextId',
                                    args: $.ConvertObjectToArr({
                                        columns: 'C_ORDEN_COMPRA,C_EMPRESA',
                                        max_length: '10'
                                    })
                                }
                            },
                        };
                        let objectOrdenCompraDetalle = {
                            C_EMPRESA: v.C_EMPRESA,
                            C_ORDEN_COMPRA: v.C_ORDEN_COMPRA,
                            C_DETALLE: v.C_DETALLE,
                            C_UNIDAD_NEGOCIO: v.C_UNIDAD_NEGOCIO,
                            C_PRODUCTO: v.C_PRODUCTO,
                            CANTIDAD: v.CANTIDAD,
                            VALOR_VENTA_UNITARIO: v.VALOR_VENTA_UNITARIO,
                            VALOR_PARCIAL: v.VALOR_PARCIAL,
                            IGV: v.IGV,
                            IND_ESTADO: v.IND_ESTADO,
                            AFECTO_IGV: v.AFECTO_IGV
                        };
                        $.AddPetition({
                            table: 'LOG.ORDEN_COMPRA_DETALLE',
                            type: 1,
                            items: $.ConvertObjectToArr(objectOrdenCompraDetalle, extraOrdenCompraDetalle)
                        });
                    });
                    $.SendPetition({
                        connectToLogin: 'S',
                        onReady: function (result) {
                            $.CloseStatusBar();
                            bootbox.hideAll();
                            alertify.success('Se duplicó la orden de compra.');
                            c_orden_compra = result[tokenOrdenCompra].items.C_ORDEN_COMPRA;
                            $.ajax({
                                url: direccion + '/procesos/GenerarPdfOrdenCompra/' + c_orden_compra,
                                type: 'GET',
                                dataType: 'json',
                                data: 'data',
                                beforeSend: function () {
                                    $.DisplayStatusBar({ message: 'Generando el formato PDF.' });
                                },
                                success: function (data) {
                                    $.CloseStatusBar();
                                    const objectOrdenCompra = {
                                        C_ORDEN_COMPRA: c_orden_compra,
                                        C_EMPRESA: empresa,
                                        C_ARCHIVO_PDF_ORDEN_COMPRA: data.data
                                    };
                                    $.AddPetition({
                                        table: 'LOG.ORDEN_COMPRA',
                                        type: 2,
                                        condition: `C_ORDEN_COMPRA = '${c_orden_compra}' AND C_EMPRESA = '${empresa}'`,
                                        items: $.ConvertObjectToArr(objectOrdenCompra)
                                    });
                                    $.SendPetition({
                                        connectToLogin: 'S',
                                        onBefore: function () {
                                            $.DisplayStatusBar({ message: 'Guardando el formato PDF.' });
                                        },
                                        onReady: function (result) {
                                            $.CloseStatusBar();
                                            alertify.success('Se guardó el formato PDF.');
                                        },
                                        onError: function (_error) {
                                            $.CloseStatusBar();
                                            $.ShowError({ error: _error });
                                        }
                                    });
                                },
                                error: function (error) {
                                    alertify.error('Ocurrió un error al generar el formato PDF.');
                                },
                                complete: function () {
                                    $.CloseStatusBar();
                                    $('form[name=frmOrdenCompras]').submit();
                                }
                            });
                        },
                        onBefore: function () {
                            $.DisplayStatusBar({ message: 'Duplicando orden de compra.' });
                        },
                        onError: function (_error) {
                            $.CloseStatusBar();
                            $.ShowError({ error: _error });
                        }
                    });
                }
            });
        };
        const actionAnular = function () {
            const fnAnularOrdenCompra = function () {
                const indice = $(table).jqxGrid('getselectedrowindex');
                const fila = $(table).jqxGrid('getrows')[indice];
                const c_orden_compra = fila['C_ORDEN_COMPRA'];
                const c_pia = fila['C_PIA'];
                const objectOrdenCompra = {
                    C_ORDEN_COMPRA: c_orden_compra,
                    C_EMPRESA: empresa,
                    C_PIA: null,
                    IND_ESTADO_COMPRA: '&'
                };
                $.AddPetition({
                    table: 'LOG.ORDEN_COMPRA',
                    type: 2,
                    condition: `C_ORDEN_COMPRA = '${c_orden_compra}' AND C_EMPRESA = '${empresa}'`,
                    items: $.ConvertObjectToArr(objectOrdenCompra)
                });

                if (c_pia != null) {
                    $.AddPetition({
                        table: 'LOG.PEDIDO_INTERNO',
                        type: 2,
                        condition: `C_EMPRESA = '${empresa}' AND C_PIA = '${c_pia}'`,
                        items: $.ConvertObjectToArr({
                            C_EMPRESA: empresa,
                            C_PIA: c_pia,
                            IND_ESTADO: 'R'
                        })
                    });
                }

                $.SendPetition({
                    connectToLogin: 'S',
                    onBefore: function () {
                        $.DisplayStatusBar({ message: 'Anulando orden de compra' });
                    },
                    onReady: function (result) {
                        $.CloseStatusBar();
                        alertify.success('Se anuló la orden de compra.');
                        $('form[name=frmOrdenCompras]').submit();
                    },
                    onError: function (_error) {
                        $.CloseStatusBar();
                        $.ShowError({ error: _error });
                    }
                });
            }
            alertify.confirm('¡Confirme Operación!', '¿Seguro que desea anular esta orden de compra?', fnAnularOrdenCompra, null);
        }

        $.VerPdf = function (token) {
            fnMostrarPdf(token);
        };

        $('form[name=frmOrdenCompras]').ValidForm({
            type: -1,
            onReady: function (result) { $(table).jqxGrid('updatebounddata'); },
            onDone: function (form, controls) {
                fnCrearTabla();

                $('#btnNueva').click(function () {
                    document.location = $.solver.baseUrl + '/Procesos/NuevaOrdenCompra';
                });

                $('#btnEditar').click(function () {
                    const indice = $(table).jqxGrid('getselectedrowindex');
                    const fila = $(table).jqxGrid('getrows')[indice];
                    const c_orden_compra = fila['C_ORDEN_COMPRA'];
                    document.location = $.solver.baseUrl + '/Procesos/NuevaOrdenCompra/' + c_orden_compra;
                });

                $('#btnEnviar').click(function (e) {
                    e.preventDefault();
                    actionEnviar();
                });
                $('#btnAprobar').click(function (e) {
                    e.preventDefault();
                    actionAprobar();
                });
                $('#btnDuplicar').click(function (e) {
                    e.preventDefault();
                    actionDuplicar();
                });
                $('#btnAnular').click(function (e) {
                    e.preventDefault();
                    actionAnular();
                });
                $('#btnReprocesarPdf').click(function (e) {
                    e.preventDefault();
                    fnGenerarPdf();
                })
                $('#btnDescargarCotizacion').click(function () {
                    $.DownloadFile({
                        nameFile: 'Cotizaciones',
                        query: 'dw_ventas_procesos_registrocotizacion_descargacotizaciones',
                        params: {
                            C_EMPRESA: empresa,
                            FEC_INI: function () {
                                return $('#_desde').val() || '';
                            },
                            FEC_FIN: function () {
                                return $('#_hasta').val() || '';
                            },
                            CLIENTE: function () {
                                return $('#_cliente').val() || '';
                            },
                            VENDEDOR: function () {
                                return $('#_vendedor').val() || '';
                            },
                            TIPO: function () {
                                return $('#_tipo').val() || '';
                            }
                        }
                    });
                });
            }
        });
    });
});