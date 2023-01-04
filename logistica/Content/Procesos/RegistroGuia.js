require(["helper", "extras", "datetimepicker"], function () {
    require(["alertify", "bootbox", "moment"], function (alertify, bootbox, moment) {
        alertify.set('notifier', 'position', 'top-center');

        $("._desde, ._hasta").datetimepicker({
            format: 'DD/MM/YYYY',
            locale: 'es'
        });

        const empresa = $.solver.session.SESSION_EMPRESA;
        const tblCompras = '#tblCompras';

        const fnCambiarDisplay = function (element, estado) {
            let display = '';
            if (estado) display = 'block';
            else display = 'none';
            $(element).css({ 'display': display });
        };
        const fnObtenerAlerta = function (message) {
            alertify.alert()
                .setting({
                    'title': 'Mensaje del Sistema',
                    'message': message,
                }).show();
        };

        const actionNueva = function () {
            document.location = $.solver.baseUrl + '/Procesos/NuevaGuia/';
        };
        const actionEditar = function () {
            if ($(tblCompras).jqxGrid('getrows').length == 0) {
                alertify.warning('Debes seleccionar un registro para editar.');
            }
            else {
                const index = $(tblCompras).jqxGrid('getselectedrowindex');
                const data = $(tblCompras).jqxGrid('getrows')[index];
                const c_compra = data.C_COMPRA;
                document.location = $.solver.baseUrl + '/Procesos/NuevaGuia/' + c_compra;
            }
        };
        const actionAnular = function () {
            const index = $(tblCompras).jqxGrid('getselectedrowindex');
            const data = $(tblCompras).jqxGrid('getrows')[index];
            const c_compra = data.C_COMPRA;
            const c_orden_compra = data.REF_ORDEN_COMPRA;

            alertify.confirm('Confirme Operación!!', '¿Seguro que desea anular esta guía?', function () {
                const objCompra = {
                    C_COMPRA: c_compra,
                    C_EMPRESA: empresa,
                    REF_C_COMPRA: null,
                    IND_ESTADO_COMPRA: '&',
                    REF_ORDEN_COMPRA: null
                };
                $.AddPetition({
                    table: 'LOG.COMPRA',
                    type: 2,
                    condition: `C_COMPRA = '${c_compra}' AND C_EMPRESA = '${empresa}'`,
                    items: $.ConvertObjectToArr(objCompra)
                });
                if (c_orden_compra != '') {
                    const objOrdenCompra = {
                        C_ORDEN_COMPRA: c_orden_compra,
                        C_EMPRESA: empresa,
                        FLAG_GUIA: '&'
                    };
                    $.AddPetition({
                        table: 'LOG.ORDEN_COMPRA',
                        type: 2,
                        condition: `C_ORDEN_COMPRA = '${c_orden_compra}' AND C_EMPRESA = '${empresa}'`,
                        items: $.ConvertObjectToArr(objOrdenCompra)
                    });
                }
                $.SendPetition({
                    connectToLogin: 'S',
                    onBefore: function () { $.DisplayStatusBar({ message: 'Anulando compra' }); },
                    onReady: function (result) {
                        $.CloseStatusBar();
                        alertify.success('Se anuló la compra.');
                        $('form[name=frmRegistroCompras]').submit();
                    },
                    onError: function (_error) {
                        $.CloseStatusBar();
                        $.ShowError({ error: _error });
                    }
                });
            }, null);
        }
        const fnCrearTabla = function () {
            $(tblCompras).CreateGrid({
                query: 'tbl_ventas_procesos_registrocompra_consultarcompras',
                items: {
                    C_EMPRESA: empresa,
                    FEC_INI: function () {
                        return $('form[name=frmRegistroCompras] #_desde').val() || '';
                    },
                    FEC_FIN: function () {
                        return $('form[name=frmRegistroCompras] #_hasta').val() || '';
                    },
                    PROVEEDOR: function () {
                        return $('form[name=frmRegistroCompras] #_proveedor').val() || '';
                    },
                    TIPO_INGRESO: function () {
                        return $('form[name=frmRegistroCompras] #_tipoingreso').val() || '';
                    },
                    DOCUMENTO: function () {
                        return $('form[name=frmRegistroCompras] #_tipo').val() || '';
                    },
                    CENTRO: function () {
                        return $('form[name=frmRegistroCompras] #_centro').val() || '';
                    },
                    ESTADO: function () {
                        return $('form[name=frmRegistroCompras] #_estado').val() || '';
                    },
                    BUSCAR: function () {
                        return $('form[name=frmRegistroCompras] #_buscar').val() || '';
                    },
                    FLAG_TIPO: 'G'
                },
                hiddens: ['IND_ESTADO_COMPRA', 'RUTA_ARCHIVO_CDR', 'RUTA_ARCHIVO_XML', 'RUTA_ARCHIVO_PDF', 'C_COMPRA', 'CENTRO', 'MONEDA', 'TOTAL', 'REF_C_COMPRA', 'GUIA_C_COMPRA'],
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
                    'FECHA_EMISION': {
                        text: 'Fecha emisión',
                        width: 100,
                        cellsAlign: 'center',
                    },
                    'REF_ORDEN_COMPRA': {
                        text: 'Orden de compra',
                        width: 130
                    },
                    'REF_COMPRA': {
                        text: 'Comprobante de compra',
                        width: 180
                    },
                    'TIPO_DOCUMENTO': {
                        text: 'Tipo de documento',
                        width: 200
                    },
                    'COMPROBANTE': {
                        text: 'Nro de guía',
                        width: 100
                    },
                    'PROVEEDOR': {
                        text: 'Proveedor',
                        width: 250
                    },
                    'TIPO_INGRESO': {
                        text: 'Tipo de ingreso'
                    },
                    'ESTADO': {
                        text: 'Estado',
                        width: 100,
                        cellsAlign: 'center',
                        cellsrenderer: function (row, columnfield, value, defaulthtml, columnproperties) {
                            if (value == 'Registrada') return '<div class="mt-2 jqx-grid-cell-middle-align"><span class="text-extra" style="color:green;"><i class="fa fa-check-circle" aria-hidden="true"></i> ' + value + '</span></div>';
                            if (value == 'Modificada') return '<div class="mt-2 jqx-grid-cell-middle-align"><span class="text-extra" style="color:blue;"><i class="fa fa-asterisk" aria-hidden="true"></i> ' + value + '</span></div>';
                            if (value == 'Anulada') return '<div class="mt-2 jqx-grid-cell-middle-align"><span class="text-extra" style="color:red;"><i class="fa fa-close" aria-hidden="true"></i> ' + value + '</span></div>';
                        }
                    },
                },
                config: {
                    virtualmode: false,
                    height: 520,
                    pageSize: 500,
                    sortable: true,
                    editable: false,
                    rendered: function () {
                        //$('a.docDownload').unbind('click');
                        //$('a.docDownload').bind('click', function (e) {
                        //    e.preventDefault();
                        //    var _fichero = $(this).attr('href');
                        //    $.DownloadFile({
                        //        uri: $.solver.services.api + '/Service/DownloadFile/' + _fichero
                        //    });
                        //    return false;
                        //});

                        var rows = $(tblCompras).jqxGrid('getrows');
                        let estado = [0, 0];
                        $.each(rows, function (i, v) {
                            if (v['IND_ESTADO_COMPRA'] == 'R') estado[0]++;
                            if (v['IND_ESTADO_COMPRA'] == 'M') estado[1]++;
                        });

                        $('#estados').text(`Todos (${estado[0] + estado[1]}) | Registrada (${estado[0]}) | Modificada (${estado[1]})`)
                    }
                }
            });
            $(tblCompras).on('bindingcomplete', function () {
                $(tblCompras).jqxGrid('selectrow', 0);
            });
            $(tblCompras).on('rowselect', function (event) {
                var args = event.args;
                var rowData = args.row;
                if (rowData != null) {
                    const estado = rowData['IND_ESTADO_COMPRA'];
                    if (estado == 'R') {
                        fnCambiarDisplay('#btnEditar', true);
                        fnCambiarDisplay('#btnAnular', true);
                    }
                    else if (estado == 'M') {
                        fnCambiarDisplay('#btnEditar', true);
                        fnCambiarDisplay('#btnAnular', true);
                    }
                    else if (estado == '&') {
                        fnCambiarDisplay('#btnEditar', false);
                        fnCambiarDisplay('#btnAnular', false);
                    }
                }
            });
        };

        $('.c_empresa').attr('data-c_empresa', empresa);
        $('#btnNueva').click(function (e) {
            actionNueva();
            e.preventDefault();
        });
        $('#btnEditar').click(function (e) {
            actionEditar();
            e.preventDefault();
        });
        $('#btnAnular').click(function (e) {
            actionAnular();
            e.preventDefault();
        });
        $('#btnDescargar').click(function (e) {
            $.DownloadFile({
                nameFile: 'Compras',
                query: 'd_ventas_procesos_registroventa_consultarventas',
                params: {
                    C_EMPRESA: empresa,
                    FEC_INI: function () {
                        return $('form[name=frmRegistroVentas] #_desde').val() || '';
                    },
                    FEC_FIN: function () {
                        return $('form[name=frmRegistroVentas] #_hasta').val() || '';
                    },
                    CLIENTE: function () {
                        return $('form[name=frmRegistroVentas] #_cliente').val() || '';
                    },
                    DOCUMENTO: function () {
                        return $('form[name=frmRegistroVentas] #_tipo').val() || '';
                    },
                    CENTRO: function () {
                        return $('form[name=frmRegistroVentas] #_centro').val() || '';
                    },
                    VENDEDOR: function () {
                        return $('form[name=frmRegistroVentas] #_vendedor').val() || '';
                    },
                    BUSCAR: function () {
                        return $('form[name=frmRegistroVentas] #_buscar').val() || '';
                    }
                }
            });
        });
        $('form[name=frmRegistroCompras]').ValidForm({
            type: -1,
            onReady: function (result) {
                $(tblCompras).jqxGrid('updatebounddata');
            }
        });

        fnCrearTabla();
    });
});