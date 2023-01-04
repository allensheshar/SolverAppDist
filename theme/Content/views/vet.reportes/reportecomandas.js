require(['helper', 'datetimepicker'], function () {
    require(['moment', 'numeral', 'bootbox', 'alertify'], function (moment, numeral, bootbox, alertify) {

        alertify.set('notifier', 'position', 'top-center');

        var _controls;
        var table = '#table';

        const fnCrearTabla = function () {
            $(table).CreateGrid({
                query: 'tbl_reportes_reportecomanda',
                items: {
                    C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                    COMANDA: function () {
                        return $(_controls.comanda).val();
                    },
                    NRO_PEDIDO: function () {
                        return $(_controls.pedido).val();
                    },
                    FECHA: function () {
                        return $(_controls.fecha).val();
                    },
                    BASE: $.solver.basePath
                },
                hiddens: ['C_PRODUCTO'],
                columns: {
                    'num': {
                        text: 'N°',
                        width: '30',
                        cellsAlign: 'center',
                        hidden: false,
                        pinned: true,
                        editable: false,
                        sortable: false
                    },
                    C_PEDIDO: {
                        columngroup: 'pedido',
                        text: 'Cod. Pedido',
                        width: '100',
                    },
                    NRO_PEDIDO: {
                        columngroup: 'pedido',
                        text: 'Nro. Pedido',
                        width: '80',
                    },
                    NOM_MESAS: {
                        columngroup: 'pedido',
                        text: 'Nom. mesa',
                        width: '100',
                    },
                    C_USUARIO: {
                        columngroup: 'pedido',
                        text: 'Usuario',
                        width: '100',
                    },
                    ESTADO_PEDIDO: {
                        columngroup: 'pedido',
                        text: 'Estado Ped.',
                        cellsrenderer: function (row, columnfield, value, defaulthtml, columnproperties) {
                            if (value == 'Pendiente') return '<div class="mt-2 jqx-grid-cell-middle-align"><span class="text-extra" style="color:blue;"><i class="fa fa-clock-o" aria-hidden="true"></i> ' + value + '</span></div>';
                            if (value == 'Facturado') return '<div class="mt-2 jqx-grid-cell-middle-align"><span class="text-extra" style="color:green;"><i class="fa fa-check-circle" aria-hidden="true"></i> ' + value + '</span></div>';
                            if (value == 'Anulado') return '<div class="mt-2 jqx-grid-cell-middle-align"><span class="text-extra" style="color:red;"><i class="fa fa-thumbs-o-down" aria-hidden="true"></i> ' + value + '</span></div>';
                        },
                        width: 80,
                    },
                    PEDIDO_FECHA_CREACION: {
                        columngroup: 'pedido',
                        text: 'Fec. Pedido Creac',
                        width: 120
                    },
                    PEDIDO_FECHA_MODIFICACION: {
                        columngroup: 'pedido',
                        text: 'Fec. Pedido Modif',
                        width: 120
                    },

                    c_detalle: {
                        columngroup: 'detalle',
                        text: 'Item',
                        width: '50',
                    },
                    CANTIDAD: {
                        columngroup: 'detalle',
                        text: 'Cantidad',
                        width: '60',
                        cellsAlign: 'right'
                    },
                    NOMBRE_PARA_VENTA: {
                        columngroup: 'detalle',
                        text: 'Producto',
                        width: '220',
                    },
                    ESTADO_PEDIDO_DETALLE: {
                        columngroup: 'detalle',
                        text: 'Estado Ped. Detalle',
                        width: 80,
                        cellsrenderer: function (row, columnfield, value, defaulthtml, columnproperties) {
                            if (value == 'Inactivo') return '<div class="mt-2 jqx-grid-cell-middle-align"><span class="text-extra" style="color:blue;"><i class="fa fa-ban" aria-hidden="true"></i> ' + value + '</span></div>';
                            if (value == 'Activo') return '<div class="mt-2 jqx-grid-cell-middle-align"><span class="text-extra" style="color:green;"><i class="fa fa-check" aria-hidden="true"></i> ' + value + '</span></div>';
                            if (value == 'Anulado') return '<div class="mt-2 jqx-grid-cell-middle-align"><span class="text-extra" style="color:red;"><i class="fa fa-thumbs-o-down" aria-hidden="true"></i> ' + value + '</span></div>';
                        },
                    },
                    ULT_USUARIO: {
                        columngroup: 'detalle',
                        text: 'Usuario',
                        width: '100',
                    },
                    PEDIDO_DETALLE_FECHA_CREACION: {
                        columngroup: 'detalle',
                        text: 'Fec. Ped. Det. Creac',
                        width: 120
                    },
                    PEDIDO_DETALLE_FECHA_MODIFICACION: {
                        columngroup: 'detalle',
                        text: 'Fec. Ped. Det. Modif',
                        width: 120
                    },

                    'EnviadoCocina': {
                        columngroup: 'comanda',
                        text: 'Enviado a cocina',
                        width: 80,
                        cellsAlign: 'center'
                    },
                    C_COMANDA: {
                        columngroup: 'comanda',
                        text: 'Comanda',
                        width: '60',
                        cellsrenderer: function (row, columnfield, value, defaulthtml, columnproperties) {
                            if (value != '') {
                                return `<div class="jqx-grid-cell-left-align" style="margin-top: 4px;">${value}&nbsp;&nbsp;<i class="fa fa-print" style="cursor: pointer;" onclick="$.ReimprimirComanda('${row}');"></i></div>`;
                            }
                        }
                    },
                    COMANDA_FECHA_CREACION: {
                        columngroup: 'comanda',
                        text: 'Fecha comanda',
                        width: '120',
                    },
                    NOMBRE_COCINA: {
                        columngroup: 'comanda',
                        width: '120',
                        text: 'Cocina',
                    },

                    C_USUARIO_FACTURA: {
                        columngroup: 'factura',
                        text: 'Usuario factura',
                        width: '100',
                    },
                    NRO_COMPROBANTE: {
                        columngroup: 'factura',
                        text: 'Nro comprobante',
                        width: '100',
                    },
                    FACTURA_FECHA_CREACION: {
                        columngroup: 'factura',
                        text: 'Fecha factura',
                        width: 120,
                    },
                },
                config: {
                    columngroups:
                    [
                        { text: 'Pedido', align: 'center', name: 'pedido' },
                        { text: 'Detalle', align: 'center', name: 'detalle' },
                        { text: 'Comanda', align: 'center', name: 'comanda' },
                        { text: 'Factura', align: 'center', name: 'factura' },
                    ],
                }
            })
        }

        $.ReimprimirComanda = function (rowIndex) {

            var row = $(table).jqxGrid('getrows')[rowIndex];
            const codPedido = row['C_PEDIDO'];
            const codComanda = row['C_COMANDA'];
            const codProducto = row['C_PRODUCTO'];

            $.GetQuery({
                query: ['q_obtener_datos_impresion_pdv', 'q_obtener_cocinas_para_impresion', 'q_obtener_cocina_producto'],
                items: [{
                    C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                    C_PEDIDO: codPedido,
                    C_CAJA: null

                }, {
                    empresa: $.solver.session.SESSION_EMPRESA,
                    pedido: codPedido,
                    comanda: codComanda
                }, {
                    C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                    C_PRODUCTO: codProducto
                }],
                onReady: function (result) {

                    if (result['q_obtener_datos_impresion_pdv'].result.rows.length == 0) {
                        alertify.warning('No se pudo generar la impresion.');
                        return;
                    };
                    if (result['q_obtener_cocinas_para_impresion'].result.rows.length == 0) {
                        alertify.warning('No hay cocinas para la impresion.');
                        return;
                    };
                    if (result['q_obtener_cocina_producto'].result.rows.length == 0) {
                        alertify.warning('No hay cocina para la impresion.');
                        return;
                    }

                    var object = result['q_obtener_datos_impresion_pdv'].result.rows[0];
                    var cocinas = result['q_obtener_cocinas_para_impresion'].result.rows;
                    var cocina = result['q_obtener_cocina_producto'].result.rows[0]['c_cocina'];
                    var fnRegImpresion = function (cocina) {

                        if (cocina.impresora_cocina == '') cocina.impresora_cocina = object.C_IMPRESORA;

                        //Envia Impresion de Documento al servicio
                        $.SendPrinter({
                            empresa: $.solver.session.SESSION_EMPRESA,
                            formato: 'formato_estandar_comanda_restaurant',
                            impresora: cocina.impresora_cocina,
                            copias: cocina.copias_comanda,
                            papel: 'Ticket80',
                            querys: [
                                {
                                    name: 'cabecera',
                                    args: $.ConvertObjectToArr({
                                        modeWork: 'd', //diccionario
                                        script: 'q_restaurant_print_comanda_cabecera',
                                        empresa: $.solver.session.SESSION_EMPRESA,
                                        pedido: codPedido,
                                        comanda: codComanda,
                                        cocina: cocina.c_cocina
                                    })
                                },
                                {
                                    name: 'detalle',
                                    args: $.ConvertObjectToArr({
                                        script: 'q_restaurant_print_comanda_detalle',
                                        empresa: $.solver.session.SESSION_EMPRESA,
                                        pedido: codPedido,
                                        comanda: codComanda,
                                        cocina: cocina.c_cocina
                                    })
                                }
                            ],
                            onReady: function (result) {
                                alertify.success('Documento enviado a impresión')
                            }
                        });
                        //*********************************************
                    };

                    for (var item in cocinas) {
                        var _cocina = cocinas[item];
                        //if (_cocina.c_cocina == cocina) {
                            fnRegImpresion(_cocina);
                        //}
                    };

                }
            });
        };

        $('form[name=filterPeriodo]').ValidForm({
            type: -1,
            onDone: function (form, controls) {
                _controls = controls;
                fnCrearTabla();

                $(controls.fecha).datetimepicker({
                    format: 'DD/MM/YYYY',
                    locale: 'es'
                });

                $('#descargarExcel').click(function () {
                    $.DownloadFile({
                        nameFile: 'Comandas',
                        query: 'dw_reportes_reportecomanda',
                        params: {
                            C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                            COMANDA: function () {
                                return $(_controls.comanda).val();
                            },
                            NRO_PEDIDO: function () {
                                return $(_controls.pedido).val();
                            },
                            FECHA: function () {
                                return $(_controls.fecha).val();
                            },
                            BASE: $.solver.basePath
                        }
                    });
                })
            },
            onReady: function () {
                $(table).jqxGrid('updatebounddata')
            }
        });
    });
});