require(["helper", "chartjs", "sortablejs", "extras", "controls", "datetimepicker"], function () {
    require(["alertify", "moment", "bootbox"], function (alertify, moment, bootbox) {
        alertify.set('notifier', 'position', 'top-center');

        let _controls;
        const table = '#table';
        const form = 'form[name=form]';
        const actions = '#actions';

        $(form).ValidForm({
            type: -1,
            onDone: function (_, controls) {
                _controls = controls;

                $('.fecha').datetimepicker({
                    format: 'DD/MM/YYYY',
                    locale: 'es'
                });

                fnCrearTabla();
            },
            onReady: function () {
                $(table).jqxGrid('updatebounddata');
            }
        });

        $('#btnDescargarExcel').click(function () {
            $.DownloadFile({
                nameFile: 'ReporteCortesias',
                query: 'tbl_restaurant_reportes_cortesia_descuentos_anulaciones',
                params: {
                    C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                    DESDE: function () { return $(_controls.desde).val(); },
                    HASTA: function () { return $(_controls.hasta).val(); },
                    MESERO: function () { return $(_controls.mesero).val(); },
                    CAJERO: function () { return $(_controls.cajero).val(); },
                    CLIENTE: function () { return $(_controls.cliente).val(); },
                    TIPO_REPORTE: function () { return $(_controls.tiporeporte).val(); },
                    BASE: $.solver.basePath
                }
            })
        });

        const fnCrearTabla = function () {

            $(table).CreateGrid({
                query: 'tbl_restaurant_reportes_cortesia_descuentos_anulaciones',
                items: {
                    C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                    DESDE: function () { return $(_controls.desde).val(); },
                    HASTA: function () { return $(_controls.hasta).val(); },
                    MESERO: function () { return $(_controls.mesero).val(); },
                    CAJERO: function () { return $(_controls.cajero).val(); },
                    CLIENTE: function () { return $(_controls.cliente).val(); },
                    TIPO_REPORTE: function () { return $(_controls.tiporeporte).val(); },
                    BASE: $.solver.basePath
                },
                columns: {
                    'Codigo de Pedido': { width: '80'},
                    'Motivo': { width: '120'},
                    'Fecha Pedido': { width: '100', cellsAlign: 'center'},
                    'Mesero': { width: '120'},
                    'Nombre de Plato': { width: '150'},
                    'Cant': { width: '80', cellsAlign: 'right', cellsFormat: 'd2'},
                    'Precio Original': { width: '80', cellsAlign: 'right', cellsFormat: 'd2'},
                    'Porc. Dscto': { width: '80', cellsAlign: 'right', cellsFormat: 'd2'},
                    'Precio Final': {
                        width: '80', cellsAlign: 'right', cellsFormat: 'd2',
                        aggregates: ['sum'], aggregatesRenderer: function (aggregates, column, element) {
                            var formatNumber = aggregates.sum;
                            if (formatNumber === undefined)
                                formatNumber = '';
                            return `<div class="h-30 d-flex justify-content-center align-items-center font-weight-bold">
                                <strong id="totalDineroRecibido"> ${formatNumber} </strong>
                            </div>`;
                        }},
                    'Total Final': {
                        width: '80', cellsAlign: 'right', cellsFormat: 'd2',
                        aggregates: ['sum'], aggregatesRenderer: function (aggregates, column, element) {
                            var formatNumber = aggregates.sum;
                            if (formatNumber === undefined)
                                formatNumber = '';
                            return `<div class="h-30 d-flex justify-content-center align-items-center font-weight-bold">
                                <strong id="totalDineroRecibido"> ${formatNumber} </strong>
                            </div>`;
                        }},
                    'Nro de Comada': { width: '80'},
                    'Boleta de Venta': { text: 'Documento', width: '120'},
                    'Cajero': { width: '150' },
                    'Estado Comprobante': {
                        text: 'Estado Pedido'
                    },
                    'Codigo de Venta': {
                        text: 'Ticket',
                        width: 55,
                        cellsrenderer: function (row, columnfield, value, defaulthtml, columnproperties) {
                            if (value != '') {
                                return `
                                    <div class="jqx-grid-cell-middle-align" style="margin-top: 4px;">
                                        <a href="javascript:" onclick="$.VerPdf('${value}');" title="Ver ticket"><i class="fa fa-cloud-download" aria-hidden="true"></i></a>
                                    </div>`;
                            }
                        }
                    },
                },
                config: {
                    showaggregates: true,
                    showstatusbar: true,
                    statusbarheight: 20,
                }
            })

        }

        const actionReimprimirTicket = function (codPedido, codCaja, estado) {

            let empresa = $.solver.session.SESSION_EMPRESA

            let formato = 'formato_estandar_comprobante_caja_ticket';

            if (estado == 'F') {
                formato = 'formato_estandar_comprobante_caja_ticket';
            };
            if (estado == '&') {
                formato = 'formato_estandar_comprobante_caja_ticket_anulado'
            };

            $.GetQuery({
                query: ['q_obtener_datos_impresion_pdv'],
                items: [{
                    C_EMPRESA: empresa,
                    C_PEDIDO: codPedido,
                    C_CAJA: codCaja
                }],
                onReady: function (result) {

                    if (result.length == 0) return;

                    var object = result[0];

                    var settings = {
                        "url": `${$.solver.services.files}/Service/CreatePDFDocumentWithFile`,
                        "method": "POST",
                        "timeout": 0,
                        beforeSend: function (xhr) {
                            $.DisplayStatusBar({ message: 'Generando ticket.' });
                        },
                        xhr: function () {
                            xhr = jQuery.ajaxSettings.xhr.apply(this, arguments);
                            return xhr;
                        },
                        xhrFields: {
                            responseType: 'blob'
                        },
                        "headers": {
                            "Content-Type": "application/json"
                        },
                        "data": JSON.stringify({
                            "empresa": empresa,
                            "formato": formato,
                            "impresora": object.C_IMPRESORA,
                            querys: [
                                {
                                    name: 'cabecera',
                                    args: $.ConvertObjectToArr({
                                        modeWork: 'd',
                                        script: 'gbl_obtener_cabecera_comprobante_fte_2',
                                        C_PEDIDO: codPedido,
                                        C_EMPRESA: empresa
                                    })
                                },
                                {
                                    name: 'detalle',
                                    args: $.ConvertObjectToArr({
                                        script: 'gbl_obtener_detalle_comprobante_fte_2',
                                        C_PEDIDO: codPedido,
                                        C_EMPRESA: empresa
                                    })
                                },
                                {
                                    name: 'cobranza',
                                    args: $.ConvertObjectToArr({
                                        script: 'gbl_obtener_cobranza_doc_fte',
                                        pedido: codPedido,
                                        empresa: empresa
                                    })
                                }
                            ],
                            "copias": 1,
                            "papel": "Ticket80"
                        }),
                    };

                    $.ajax(settings)
                        .done(function (json) {
                            $.CloseStatusBar();

                        var blobUrl = URL.createObjectURL(xhr.response);

                        var dialog = bootbox.dialog({
                            message: `<div class="embed-responsive embed-responsive-16by9"><iframe class= "embed-responsive-item" src="" allowfullscreen></iframe></div>`,
                            closeButton: true,
                            className: 'modal-75'
                        });

                        dialog.init(function () {
                            $(dialog).find('.embed-responsive-item').attr("src", blobUrl);
                        })
                    });
                }
            });

        }

        $.VerPdf = function (codVenta) {
            $.GetQuery({
                query: ['q_gbl_obtener_pedido_para_reimprimir_ticket'],
                items: [{
                    C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                    C_VENTA: codVenta
                }],
                onReady: function (result) {
                    const pedido = result[0]
                    actionReimprimirTicket(pedido.C_PEDIDO, pedido.C_CAJA, pedido.IND_ESTADO);
                }
            })
        };
    })
});