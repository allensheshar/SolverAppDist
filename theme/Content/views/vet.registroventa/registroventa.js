require(["helper", "extras", "datetimepicker", "fileinput.es", "bootstrap-select"], function () {
    require(["alertify", "bootbox", "moment"], function (alertify, bootbox, moment) {

        alertify.set('notifier', 'position', 'top-center');

        var editable = true;
        if ($.solver.basePath == '/puntoventa' || $.solver.basePath == '/restaurant') editable = false;

        $("._desde, ._hasta").datetimepicker({
            format: 'DD/MM/YYYY',
            locale: 'es'
        });

        let arrAfectacionIgv = [];
        let arrTipoOperacion = [];
        let arrTipoDetraccion = [];

        const empresa = $.solver.session.SESSION_EMPRESA;
        const session_id = $.solver.session.SESSION_ID;
        const tblVentas = '#tblVentas';
        const tblCotizacion = '#tblCotizacion';
        const tblCotizacionPeriodica = '#tblCotizacionPeriodica';
        const tblNotaPedido = '#tblNotaPedido';
        const direccionServicio = $.solver.services.api;
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
        const fnObtenerTotales = function () {
            $.GetQuery({
                query: ['tbl_ventas_procesos_registroventa_consultarventas_count'],
                items: [{
                    C_EMPRESA: empresa,
                    FEC_INI: function () {
                        return $('form[name=frmRegistroVentas] #_desde').val() || '';
                    },
                    FEC_FIN: function () {
                        return $('form[name=frmRegistroVentas] #_hasta').val() || '';
                    },
                    BASE: $.solver.basePath
                }],
                onError: function (error) {
                    $.ShowError({ error: _error });
                },
                onReady: function (result) {
                    const data = result;
                    let estado = [0, 0, 0, 0, 0, 0];
                    $.each(data, function (i, v) {
                        if (v['ESTADO'] == '*') estado[0] += v['CONT'];
                        if (v['ESTADO'] == 'C') estado[1] += v['CONT'];
                        if (v['ESTADO'] == 'O') estado[2] += v['CONT'];
                        if (v['ESTADO'] == 'A') estado[3] += v['CONT'];
                        if (v['ESTADO'] == 'J') estado[4] += v['CONT'];
                        if (v['ESTADO'] == '&') estado[5] += v['CONT'];
                    });
                    $('#estados').text(`Todos (${estado[0] + estado[1] + estado[2] + estado[3] + estado[4] + estado[5]}) | Pendiente (${estado[0]}) | En cola (${estado[1]}) | Observada (${estado[2]}) | Aprobada (${estado[3]}) | Pendiente anular (${estado[4]}) |Anulada (${estado[5]})`)
                }
            })
        };
        const fnCrearCargaArchivo = function (control) {

            $("#" + control).fileinput({
                language: 'es',
                maxFileCount: 1,
                showPreview: false,
                mainClass: "input-group-sm",
                allowedFileExtensions: ['xls', 'xlsx'],
                uploadUrl: $.solver.services.api + "/Service/Upload/New",
                uploadAsync: true,
            });

            $("#" + control).on("filebatchselected", function (event, files) {
                $("#" + control).fileinput("upload");
            });

            $("#" + control).on("fileuploaded", function (event, data, previewId, index) {

                var extras = {
                    C_MASIVO_PROCESO: {
                        action: {
                            name: 'GetNextId',
                            args: $.ConvertObjectToArr({
                                columns: 'C_EMPRESA',
                                max_length: '6'
                            })
                        }
                    },
                };

                $.AddPetition({
                    type: '1',
                    table: 'MASIVO_PROCESO',
                    items: $.ConvertObjectToArr({
                        C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                        C_MASIVO_PROCESO: '',
                        C_MASIVO: '0004',
                        C_ARCHIVO_MASIVO: data.response.token,
                        FEC_REGISTRO: moment().format('DD/MM/YYYY HH:mm:ss'),
                        IND_ESTADO: '&'
                    }, extras)
                });

                $("#" + control).fileinput('clear');

                $.SendPetition({
                    onBefore: function () {
                        $.DisplayStatusBar({
                            message: 'Registrando archivos para procesamiento...'
                        });
                    },
                    onReady: function () {
                        setTimeout(function () {

                            $('#modalUploadFiles').modal('hide');
                            $.CloseStatusBar();

                            $.AddPetition({
                                type: '4',
                                transaction: false,
                                items: $.ConvertObjectToArr({
                                    script: 'sp_ventas_procesos_registroventa_registrarventasaborradores',
                                    C_EMPRESA: empresa
                                })
                            });

                            $.SendPetition({
                                connectToLogin: 'S',
                                onReady: function (result) {

                                    $.CloseStatusBar();

                                    $.GetData({
                                        title: `<i class="fa fa-file-code-o" aria-hidden="true"></i> Lista de documentos`,
                                        uriData: `${$.solver.baseUrl}/Procesos/ListaDocumentosBorradores/`,
                                        location: 'float',
                                        type: 'GET',
                                        isPage: true,
                                        onReady: function (object, modal) {

                                            $.CloseStatusBar();

                                            $(modal).find('.modal-dialog').css({ 'max-width': '95%' });

                                            $(object).find('.bloqueTextoAdicional').show();

                                            const fnBorrarProducto = function (indice) {
                                                alertify.confirm('Mensaje del sistema', '¿Estas seguro de eliminar el producto?',
                                                    function () {
                                                        const rowid = $(object).find('#table').jqxGrid('getrowid', indice)
                                                        $(object).find('#table').jqxGrid('deleterow', rowid);
                                                    },
                                                    function () { alertify.error('Operación cancelada'); }
                                                ).set('labels', { ok: 'Si', cancel: 'No' }).set('defaultFocus', 'ok').set('closable', false);
                                            };

                                            $(object).find('#afectacion').FieldLoadRemote({
                                                onReady: function () {
                                                    $(object).find('#afectacion').change(function () {
                                                        var label = arrAfectacionIgv.filter(x => x['value'] == $(object).find('#afectacion').val())[0].label;
                                                        $.each($(object).find('#table').jqxGrid('getrows'), function (i, v) {
                                                            v.AFECTACION = label;
                                                        });

                                                        $(object).find('#table').jqxGrid('refresh')
                                                    });
                                                }
                                            });


                                            $(object).find('#table').CreateGrid({
                                                query: 'tbl_ventas_procesos_registroventa_consultarborrador',
                                                items: { C_EMPRESA: empresa },
                                                hiddens: ['C_DETALLE', 'CORREO_FACTURACION', 'PRODUCTO', 'FECHA_CREACION', 'C_VENTA', 'NRO_COTIZACION'],
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
                                                    //'C_VENTA': {
                                                    //    text: 'Cód. de venta',
                                                    //    width: 100,
                                                    //    editable: false
                                                    //},
                                                    'CLIENTE': {
                                                        text: 'Cliente',
                                                        width: 200,
                                                        editable: false
                                                    },
                                                    'FECHA_EMISION': {
                                                        text: 'Fecha emisión',
                                                        width: 100,
                                                        cellsAlign: 'center',
                                                        editable: false
                                                    },
                                                    'TIPO_DOCUMENTO': {
                                                        text: 'Tipo de doc.',
                                                        width: 90,
                                                        editable: false
                                                    },
                                                    'COMPROBANTE': {
                                                        text: 'Comprobante',
                                                        width: 100,
                                                        editable: false
                                                    },
                                                    'AFECTACION': {
                                                        text: 'Afectación igv',
                                                        editable: true,
                                                        width: 250,
                                                        columntype: 'dropdownlist',
                                                        createeditor: function (row, value, editor) {
                                                            var source =
                                                            {
                                                                datatype: "array",
                                                                datafields: [
                                                                    { name: 'label', type: 'string' },
                                                                    { name: 'value', type: 'string' }
                                                                ],
                                                                localdata: arrAfectacionIgv
                                                            };

                                                            var myadapter = new $.jqx.dataAdapter(source, { autoBind: true });

                                                            editor.jqxDropDownList({ source: myadapter, displayMember: 'label', valueMember: 'value' });
                                                        },
                                                        cellendedit: function (row, datafield, columntype, oldvalue, newvalue) {
                                                        }
                                                    },
                                                    'MONEDA': {
                                                        text: 'Moneda',
                                                        width: 100,
                                                        cellsAlign: 'center',
                                                        editable: false
                                                    },
                                                    'NOMBRE_PARA_VENTA': {
                                                        text: 'Producto / Servicio',
                                                        width: 180,
                                                        editable: false
                                                    },
                                                    'TEXTO_ADICIONAL': {
                                                        text: 'Texto adicional',
                                                        width: 250,
                                                    },
                                                    'PRECIO': {
                                                        text: 'Precio',
                                                        width: 80,
                                                        cellsAlign: 'right',
                                                        cellsFormat: 'd2',
                                                        columnType: 'numberinput',
                                                        editable: false,
                                                    },
                                                    'CANTIDAD': {
                                                        text: 'Cantidad',
                                                        width: 80,
                                                        cellsAlign: 'right',
                                                        cellsFormat: 'd2',
                                                        columnType: 'numberinput',
                                                        editable: false,
                                                    },
                                                    'PRECIO_TOTAL': {
                                                        text: 'Subtotal',
                                                        width: 80,
                                                        cellsAlign: 'right',
                                                        cellsFormat: 'd2',
                                                        columnType: 'numberinput',
                                                        editable: false,
                                                    },
                                                    'ELIMINAR': {
                                                        text: 'Acciones',
                                                        createwidget: function (row, column, value, htmlElement) {
                                                            $(object).find('#table').jqxGrid('refresh');
                                                        },
                                                        initwidget: function (rowIndex, column, value, htmlElement) {
                                                            if ($(htmlElement).children().length == 0) {
                                                                let _btnEliminar;
                                                                _btnEliminar = $(`<a id="eliminar" style="cursor: pointer;" class="jqx-grid-widget">&nbsp;Eliminar</a>`);
                                                                $(htmlElement).append(_btnEliminar);
                                                                $(htmlElement).find('a#eliminar').unbind('click');
                                                                $(htmlElement).find('a#eliminar').click(function () {
                                                                    fnBorrarProducto(rowIndex);
                                                                });
                                                            }
                                                        },
                                                        width: 80
                                                    }
                                                },
                                                config: {
                                                    virtualmode: false,
                                                    height: 550,
                                                    pageSize: 300,
                                                    sortable: false,
                                                    editable: true
                                                }
                                            });

                                            $(object).find('#btnProcesos').click(function () {

                                                var rows = $(object).find('#table').jqxGrid('getrows');
                                                var ventas = [];

                                                $.each(rows, function (i, v) {
                                                    if (ventas.indexOf(v.C_VENTA) == -1) {
                                                        ventas.push(v.C_VENTA);
                                                    };
                                                    $.AddPetition({
                                                        type: 2,
                                                        condition: `C_EMPRESA = '${empresa}' AND C_VENTA = '${v.C_VENTA}' AND C_DETALLE = '${v.C_DETALLE}'`,
                                                        table: 'VET.VENTA_DETALLE',
                                                        items: $.ConvertObjectToArr({
                                                            C_EMPRESA: empresa,
                                                            C_VENTA: v.C_VENTA,
                                                            C_DETALLE: v.C_DETALLE,
                                                            DESCRIPCION: v.TEXTO_ADICIONAL,
                                                            AFECTACION_IGV: arrAfectacionIgv.filter(x => x['label'] == v.AFECTACION)[0].value,
                                                        })
                                                    });
                                                });

                                                $.SendPetition({
                                                    connectToLogin: 'S',
                                                    onReady: function (result) {
                                                        $.AddPetition({
                                                            type: '4',
                                                            transaction: false,
                                                            items: $.ConvertObjectToArr({
                                                                script: 'spw_ventas_procesos_registroventa_registrarventasmasivas',
                                                                C_VENTAS: ventas.join(','),
                                                                C_EMPRESA: empresa
                                                            })
                                                        });

                                                        $.SendPetition({
                                                            connectToLogin: 'S',
                                                            onReady: function (result) {
                                                                $.CloseStatusBar();
                                                                bootbox.hideAll();
                                                                alertify.success('Sus comprobantes han sido enviado a la declaración satisfactoriamente, vaya al registro de ventas y realice el seguimiento.')
                                                                $('form[name=frmRegistroVentas]').submit();
                                                            },
                                                            onError: function (_error) {
                                                                $.CloseStatusBar();
                                                                $.ShowError({ error: _error });
                                                            }
                                                        });
                                                    },
                                                    onBefore: function () {
                                                        $.DisplayStatusBar({ message: 'Procesando documentos.' });
                                                    },
                                                    onError: function (_error) {
                                                        $.CloseStatusBar();
                                                        $.ShowError({ error: _error });
                                                    }
                                                });
                                            });

                                            $(object).find('#textoAdicional').keyup(function () {
                                                const texto = $(this).val();
                                                $.each($(object).find('#table').jqxGrid('getrows'), function (i, v) {
                                                    $(object).find('#table').jqxGrid('getrows')[i].TEXTO_ADICIONAL = texto;
                                                });
                                                $(object).find('#table').jqxGrid('refresh')
                                            })
                                        },
                                        onCloseModal: function () {

                                        }
                                    });

                                },
                                onError: function (_error) {
                                    $.CloseStatusBar();
                                    $.ShowError({ error: _error });
                                }
                            })

                            $.CloseStatusBar();
                        }, 10000);
                    },
                    onError: function (error) {
                        $.CloseStatusBar();
                        alertify.error('Ocurrio un error al registrar los archivos, intentelo nuevamente.');
                        $.ShowError({ error: error });
                    }
                });

            });

        };
        const fnCrearTabla = function () {
            $(tblVentas).CreateGrid({
                query: 'tbl_ventas_procesos_registroventa_consultarventas',
                items: {
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
                    USUARIO: function () {
                        return $('form[name=frmRegistroVentas] #_usuario').val() || '';
                    },
                    ESTADO: function () {
                        return $('form[name=frmRegistroVentas] #_estado').val() || '';
                    },
                    BUSCAR: function () {
                        return $('form[name=frmRegistroVentas] #_buscar').val() || '';
                    },
                    BASE: $.solver.basePath
                },
                hiddens: ['C_VENTA', 'CORREO_FACTURACION', 'C_CLIENTE', 'REF_C_VENTA', 'IND_ESTADO_VENTA', 'cod_tipo_doc', 'CENTRO', 'DIFERENCIA_DIAS', 'ID_EMISOR', 'MOTIVO_NOTA_CREDITO', 'C_COTIZACION', 'NRO_NC', 'NRO_ND', 'ID_COMPROBANTE', 'LINK_PDF_VENTA', 'MOTIVO_NOTA_DEBITO', 'C_TIPO_DOCUMENTO_REF'],
                sortcolumn: 'FECHA_CREACION',
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
                    },
                    'TIPO_DOCUMENTO': {
                        text: 'Tipo de documento',
                        width: 110
                    },
                    'NRO_COTIZACION': {
                        text: 'Nro. cotización',
                        width: 100,
                        cellsrenderer: function (row, columnfield, value, defaulthtml, columnproperties) {
                            if (value != '') {
                                var row = $(tblVentas).jqxGrid('getrows')[row];
                                if (
                                    ((row['cod_tipo_doc'] == '07236' || row['cod_tipo_doc'] == '07237') && row['IND_ESTADO_VENTA'] == 'A') ||
                                    ((row['cod_tipo_doc'] == '07236' || row['cod_tipo_doc'] == '07237') && row['IND_ESTADO_VENTA'] == '*') ||
                                    ((row['cod_tipo_doc'] == '07236' || row['cod_tipo_doc'] == '07237') && row['IND_ESTADO_VENTA'] == 'O') ||
                                    ((row['cod_tipo_doc'] == '07236' || row['cod_tipo_doc'] == '07237') && row['IND_ESTADO_VENTA'] == 'C')) {
                                    return '<div class="jqx-grid-cell-left-align" style="margin-top: 4px;">' + value + '</div>';
                                }
                                else return '';
                            }
                        }
                    },
                    'COMPROBANTE': {
                        text: 'Comprobante',
                        width: 110
                    },
                    'COMPROBANTE_VENTA': {
                        text: 'Comprobante ref.',
                        width: 110
                    },
                    'CLIENTE': {
                        text: 'Cliente',
                        width: 320
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
                        //aggregates: ['sum'],
                        //aggregatesRenderer: function (aggregates, column, element) {
                        //    var formatNumber = aggregates.sum;
                        //    if (formatNumber === undefined)
                        //        formatNumber = '';
                        //    return `<div class="h-30 d-flex justify-content-center align-items-center font-weight-bold">
                        //        <strong> ${formatNumber} </strong>
                        //    </div>`;
                        //}
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
                    'RUTA_ARCHIVO_CDR': {
                        text: 'CDR',
                        width: 35,
                        cellsrenderer: function (row, columnfield, value, defaulthtml, columnproperties) {
                            if (value == '') return '';
                            else return `<div class="jqx-grid-cell-middle-align" style="margin-top: 4px;"><a href="${$.solver.services.api}/service/downloadfile/${value}" target="_blank" title="Descargar CDR"><i class="fa fa-cloud-download" aria-hidden="true"></i></a></div>`;
                        }
                    },
                    'RUTA_ARCHIVO_XML': {
                        text: 'XML',
                        width: 35,
                        cellsrenderer: function (row, columnfield, value, defaulthtml, columnproperties) {
                            if (value == '') return '';
                            else return `<div class="jqx-grid-cell-middle-align" style="margin-top: 4px;"><a href="${$.solver.services.api}/service/downloadfile/${value}" target="_blank" title="Descargar XML"><i class="fa fa-cloud-download" aria-hidden="true"></i></a></div>`;
                        }
                    },
                    'RUTA_ARCHIVO_PDF': {
                        text: 'PDF',
                        width: 35,
                        cellsrenderer: function (row, columnfield, value, defaulthtml, columnproperties) {
                            if (value == '') return '';
                            else return `<div class="jqx-grid-cell-middle-align" style="margin-top: 4px;"><a href="${$.solver.services.api}/service/viewfile/${value}" target="_blank" title="Descargar PDF"><i class="fa fa-cloud-download" aria-hidden="true"></i></a></div>`;
                        }
                    },
                    'FECHA_CREACION': {
                        text: 'Fecha creación',
                        width: 130,
                        cellsAlign: 'center'
                    },
                    'C_USUARIO': {
                        text: 'Usuario',
                        width: 100
                    }
                },
                config: {
                    pageSize: 300,
                    height: 550,
                    virtualmode: true,
                    sortable: true,
                    editable: false,
                    //showstatusbar: true,
                    //statusbarheight: 20,
                    //showaggregates: true,
                }
            });
            $(tblVentas).on('bindingcomplete', function () {
                $(tblVentas).jqxGrid('selectrow', 0);
            });
            $(tblVentas).on('rowselect', function (event) {
                var args = event.args;
                var rowData = args.row;
                if (rowData != null) {
                    const tipoDoc = rowData['cod_tipo_doc'];
                    const estado = rowData['IND_ESTADO_VENTA'];
                    if (estado == '*') {
                        if (tipoDoc == '07241') {
                            fnCambiarDisplay('#btnNuevaVenta', true);
                            fnCambiarDisplay('#btnEditarVenta', true);
                            fnCambiarDisplay('#btnEnviarVenta', true);
                            fnCambiarDisplay('#btnAnularVenta', true);
                            fnCambiarDisplay('#btnNotaCredito', false);
                            fnCambiarDisplay('#btnNotaDebito', false);
                            fnCambiarDisplay('#btnReenviar', false);
                        }
                        else if (tipoDoc == '07242') {
                            fnCambiarDisplay('#btnNuevaVenta', true);
                            fnCambiarDisplay('#btnEditarVenta', true);
                            fnCambiarDisplay('#btnEnviarVenta', true);
                            fnCambiarDisplay('#btnAnularVenta', true);
                            fnCambiarDisplay('#btnNotaCredito', false);
                            fnCambiarDisplay('#btnNotaDebito', false);
                            fnCambiarDisplay('#btnReenviar', false);
                        }
                        else {
                            fnCambiarDisplay('#btnNuevaVenta', true);
                            fnCambiarDisplay('#btnEditarVenta', true);
                            fnCambiarDisplay('#btnEnviarVenta', true);
                            fnCambiarDisplay('#btnAnularVenta', true);
                            fnCambiarDisplay('#btnNotaCredito', false);
                            fnCambiarDisplay('#btnNotaDebito', false);
                            fnCambiarDisplay('#btnReenviar', false);
                        }
                    }
                    else if (estado == 'O') {
                        fnCambiarDisplay('#btnNuevaVenta', true);
                        fnCambiarDisplay('#btnEditarVenta', true);
                        fnCambiarDisplay('#btnEnviarVenta', true);
                        fnCambiarDisplay('#btnNotaCredito', false);
                        fnCambiarDisplay('#btnAnularVenta', true);
                        fnCambiarDisplay('#btnNotaDebito', false);
                        fnCambiarDisplay('#btnReenviar', false);
                    }
                    else if (estado == 'A') {
                        if (tipoDoc == '07241') {
                            fnCambiarDisplay('#btnNuevaVenta', true);
                            fnCambiarDisplay('#btnEditarVenta', true);
                            fnCambiarDisplay('#btnEnviarVenta', false);
                            fnCambiarDisplay('#btnAnularVenta', true);
                            fnCambiarDisplay('#btnNotaCredito', false);
                            fnCambiarDisplay('#btnNotaDebito', false);
                            fnCambiarDisplay('#btnReenviar', true);
                        }
                        else if (tipoDoc == '07242') {
                            fnCambiarDisplay('#btnNuevaVenta', true);
                            fnCambiarDisplay('#btnEditarVenta', true);
                            fnCambiarDisplay('#btnEnviarVenta', false);
                            fnCambiarDisplay('#btnAnularVenta', true);
                            fnCambiarDisplay('#btnNotaCredito', false);
                            fnCambiarDisplay('#btnNotaDebito', false);
                            fnCambiarDisplay('#btnReenviar', true);
                        }
                        else {
                            fnCambiarDisplay('#btnNuevaVenta', true);
                            fnCambiarDisplay('#btnEditarVenta', true);
                            fnCambiarDisplay('#btnEnviarVenta', false);
                            fnCambiarDisplay('#btnAnularVenta', true);
                            fnCambiarDisplay('#btnNotaDebito', true);
                            fnCambiarDisplay('#btnNotaCredito', true);
                            fnCambiarDisplay('#btnReenviar', true);
                        }
                    }
                    else if (estado == '&') {
                        fnCambiarDisplay('#btnNuevaVenta', true);
                        fnCambiarDisplay('#btnEditarVenta', true);
                        fnCambiarDisplay('#btnEnviarVenta', false);
                        fnCambiarDisplay('#btnNotaCredito', false);
                        fnCambiarDisplay('#btnNotaDebito', false);
                        fnCambiarDisplay('#btnAnularVenta', false);
                        fnCambiarDisplay('#btnReenviar', false);
                    }
                    else if (estado == 'B') {

                    }
                    else if (estado == 'C') {
                        fnCambiarDisplay('#btnNuevaVenta', true);
                        fnCambiarDisplay('#btnEditarVenta', true);
                        fnCambiarDisplay('#btnEnviarVenta', false);
                        fnCambiarDisplay('#btnAnularVenta', true);
                        fnCambiarDisplay('#btnNotaDebito', false);
                        fnCambiarDisplay('#btnNotaCredito', false);
                        fnCambiarDisplay('#btnReenviar', false);
                    }
                    fnCambiarDisplay('#btnDescargarVenta', true);
                }
            });
            $(tblVentas).on('rowdoubleclick', function (e) {
                actionEditarVenta();
            });

            $(tblCotizacion).CreateGrid({
                query: 'tbl_ventas_procesos_registroventa_consultarcotizaciones_aprobadas',
                items: {
                    C_EMPRESA: empresa,
                    FEC_INI: function () {
                        return $('form[name=frmRegistroCotizacion] #_desde').val() || '';
                    },
                    FEC_FIN: function () {
                        return $('form[name=frmRegistroCotizacion] #_hasta').val() || '';
                    },
                    CLIENTE: function () {
                        return $('form[name=frmRegistroCotizacion] #_cliente').val() || '';
                    },
                    CENTRO: function () {
                        return $('form[name=frmRegistroCotizacion] #_centro').val() || '';
                    },
                    USUARIO: function () {
                        return $('form[name=frmRegistroCotizacion] #_usuario').val() || '';
                    },
                    BUSCAR: function () {
                        return $('form[name=frmRegistroCotizacion] #_buscar').val() || '';
                    }
                },
                hiddens: ['C_VENTA', 'CORREO_FACTURACION', 'C_CLIENTE', 'CENTRO'],
                sortcolumn: 'FECHA_CREACION',
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
                    'NRO_COTIZACION': {
                        text: 'Nro. cotización',
                        width: 100
                    },
                    'CLIENTE': {
                        text: 'Cliente',
                        width: 250
                    },
                    'MONEDA': {
                        text: 'Moneda',
                        width: 100,
                        cellsAlign: 'center'
                    },
                    'CENTRO': {
                        text: 'Centro de costo',
                        width: 120
                    },
                    'TOTAL': {
                        text: 'Total',
                        width: 80,
                        cellsAlign: 'right',
                        cellsFormat: 'd2',
                        columnType: 'numberinput'
                    },
                    'FECHA_CREACION': {
                        text: 'Fecha creación',
                        width: 140,
                    },
                    'C_ARCHIVO_PDF_COTIZACION': {
                        text: 'Pdf cot.',
                        width: 70,
                        cellsrenderer: function (row, columnfield, value, defaulthtml, columnproperties) {
                            if (value == '') return '';
                            else return `<div class="jqx-grid-cell-middle-align" style="margin-top: 4px;">
                                            <a href="${direccionServicio}Service/ViewFile/${value}" target="_blank" style="text-decoration: none; color: black;">
                                                <i class="fa fa-eye" aria-hidden="true"></i>
                                            </a>
                                        </div>`;
                        }
                    },
                    'C_USUARIO': {
                        text: 'Usuario',
                        width: 100
                    }
                },
                config: {
                    //virtualmode: false,
                    height: 600,
                    pageSize: 500,
                    sortable: true,
                    //rendered: function () {
                    //    $('.btnVerPdf').unbind("click");
                    //    $('.btnVerPdf').on("click", function (event) {
                    //        window.open( + 'Service/ViewFile/' + $(this).data('id'));
                    //    });
                    //}
                }
            });
            $(tblCotizacion).on('bindingcomplete', function () {
                $(tblCotizacion).jqxGrid('selectrow', 0);
            });

            $(tblCotizacionPeriodica).CreateGrid({
                query: 'tbl_ventas_procesos_registroventa_consultarcotizaciones_periodicas',
                items: {
                    C_EMPRESA: empresa,
                    FEC_INI: function () {
                        return $('form[name=frmRegistroCotizacionPeriodica] #_desde').val() || '';
                    },
                    FEC_FIN: function () {
                        return $('form[name=frmRegistroCotizacionPeriodica] #_hasta').val() || '';
                    },
                    CLIENTE: function () {
                        return $('form[name=frmRegistroCotizacionPeriodica] #_cliente').val() || '';
                    },
                    CENTRO: function () {
                        return $('form[name=frmRegistroCotizacionPeriodica] #_centro').val() || '';
                    },
                    USUARIO: function () {
                        return $('form[name=frmRegistroCotizacionPeriodica] #_usuario').val() || '';
                    },
                    BUSCAR: function () {
                        return $('form[name=frmRegistroCotizacionPeriodica] #_buscar').val() || '';
                    }
                },
                hiddens: ['C_VENTA', 'CORREO_FACTURACION', 'C_CLIENTE', 'CENTRO', 'C_ARCHIVO_PDF_COTIZACION', 'ULTIMA_FACTURA'],
                sortcolumn: 'C_VENTA',
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
                    'NRO_COTIZACION': {
                        text: 'Nro. cotización',
                        width: 100
                    },
                    'CLIENTE': {
                        text: 'Cliente',
                        width: 250
                    },
                    'MONEDA': {
                        text: 'Moneda',
                        width: 100,
                        cellsAlign: 'center'
                    },
                    'CENTRO': {
                        text: 'Centro de costo',
                        width: 120
                    },
                    'TOTAL': {
                        text: 'Total',
                        width: 80,
                        cellsAlign: 'right',
                        cellsFormat: 'd2',
                        columnType: 'numberinput'
                    },
                    'C_ARCHIVO_PDF_COTIZACION': {
                        text: 'Pdf cot.',
                        width: 70,
                        cellsrenderer: function (row, columnfield, value, defaulthtml, columnproperties) {
                            if (value == '') return '';
                            else return `   <div class="btnVerPdf jqx-grid-cell-middle-align" style="margin-top: 4px;" data-id="${value}">
                                                <i class="fa fa-eye" aria-hidden="true"></i>
                                            </div>`;
                        }
                    },
                    'ULTIMA_FACTURA': {
                        text: 'Ult. factura',
                        width: 100
                    },
                    'C_USUARIO': {
                        text: 'Usuario',
                        width: 100
                    }
                },
                config: {
                    virtualmode: false,
                    height: 600,
                    pageSize: 500,
                    sortable: true,
                    editable: false,
                    selectionmode: 'checkbox',
                    rendered: function () {
                        $('.btnVerPdf').unbind("click");
                        $('.btnVerPdf').on("click", function (event) {
                            window.open(direccionServicio + 'Service/ViewFile/' + $(this).data('id'));
                        });
                    }
                }
            });

            $(tblNotaPedido).CreateGrid({
                query: 'tbl_ventas_procesos_registroventa_consultarnotaspedido_aprobadas',
                items: {
                    C_EMPRESA: empresa,
                    FEC_INI: function () {
                        return $('form[name=frmNotaPedido] #_desde').val() || '';
                    },
                    FEC_FIN: function () {
                        return $('form[name=frmNotaPedido] #_hasta').val() || '';
                    },
                    C_CLIENTE: function () {
                        return $('form[name=frmNotaPedido] #cliente').val() || '';
                    },
                    C_USUARIO: function () {
                        return $('form[name=frmNotaPedido] #usuario').val() || '';
                    },
                    BUSCAR: function () {
                        return $('form[name=frmNotaPedido] #_buscar').val() || '';
                    }
                },
                hiddens: ['C_VENTA', 'C_EMPRESA', 'IND_ESTADO_NOTA_PEDIDO'],
                sortcolumn: 'FECHA_CREACION',
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
                    'NRO_NOTA_PEDIDO': {
                        text: 'Nro. cotización',
                        width: 100
                    },
                    'RAZON_SOCIAL': {
                        text: 'Cliente',
                        width: 250
                    },
                    'MONEDA': {
                        text: 'Moneda',
                        width: 100,
                        cellsAlign: 'center'
                    },
                    'TOTAL': {
                        text: 'Total',
                        width: 80,
                        cellsAlign: 'right',
                        cellsFormat: 'd2',
                        columnType: 'numberinput'
                    },
                    'FECHA_CREACION': {
                        text: 'Fecha creación',
                        width: 140,
                    },
                    'C_USUARIO': {
                        text: 'Usuario',
                        width: 100
                    }
                },
                config: {
                    selectionmode: 'checkbox',
                    height: 600,
                    pageSize: 500,
                    sortable: true,
                }
            })

            fnObtenerTotales()
        };
        const actionNuevaVenta = function () {
            document.location = $.solver.baseUrl + '/Procesos/NuevaVenta/';
        };
        const actionEditarVenta = function () {
            const index = $(tblVentas).jqxGrid('getselectedrowindex');
            const data = $(tblVentas).jqxGrid('getrows')[index];
            const c_venta = data.C_VENTA;
            document.location = $.solver.baseUrl + '/Procesos/NuevaVenta/' + c_venta;
        };
        const actionVenderCotizacion = function () {
            const index = $(tblCotizacion).jqxGrid('getselectedrowindex');
            const data = $(tblCotizacion).jqxGrid('getrows')[index];
            const c_venta = data.C_VENTA;
            document.location = $.solver.baseUrl + '/Procesos/NuevaVenta/' + c_venta;
        };
        const actionEnviarVenta = function () {
            const indice = $(tblVentas).jqxGrid('getselectedrowindex');
            const fila = $(tblVentas).jqxGrid('getrows')[indice];
            const c_venta = fila['C_VENTA'];

            $.AddPetition({
                type: '4',
                transaction: true,
                items: $.ConvertObjectToArr({
                    script: 'spw_gbl_aprobar_movimiento_stock',
                    C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                    C_DOCUMENTO: c_venta,
                    FLAG_DOCUMENTO: 'ven',
                    C_USUARIO_REGISTRO: $.solver.session.SESSION_ID
                })
            });

            $.AddPetition({
                type: '4',
                transaction: true,
                items: $.ConvertObjectToArr({
                    script: 'spw_gbl_registrar_declaracion_sunat_venta_2',
                    C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                    C_DOCUMENTO: c_venta,
                    FLAG_DOCUMENTO: 'ven',
                    C_USUARIO_REGISTRO: $.solver.session.SESSION_ID
                })
            })

            $.SendPetition({
                onReady: function () {

                    $.GetQuery({
                        query: ['q_ventas_procesos_nuevaventa_obteneridcomprobante'],
                        items: [{
                            C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                            C_VENTA: c_venta
                        }],
                        onReady: function (result) {
                            result = result[0]
                            var emisor = result['ID_EMISOR'];
                            var comprobante = result['ID_COMPROBANTE'];

                            $.GetData({
                                uriData: $.solver.services.api + `/efacturacion/ProcesarComprobante/${emisor}/${comprobante}`,
                                type: 'GET',
                                isPage: true,
                                onError: function () {
                                    $.CloseStatusBar();
                                },
                                onReady: function (object) {
                                    $.CloseStatusBar();
                                    alertify.success('Estado del comprobante actualizado y movimiento generado correctamente.');
                                    $('form[name=frmRegistroVentas]').submit();
                                }
                            });
                        }
                    })
                },
                onError: function (_error) {
                    $.CloseStatusBar();
                    $.ShowError({ error: _error });
                },
                onBefore: function () {
                    $.DisplayStatusBar({ message: 'Actualizando el estado del comprobante y generando movimiento.' });
                },
            });
        };
        const actionAnularVenta = function () {
            const fnGuardarEstadoAnulado = function (c_venta, ref_c_venta) {
                alertify.confirm('Confirme operación', '¿Seguro que desea anular este documento?',
                    function () {
                        const objectVenta = {
                            C_VENTA: c_venta,
                            C_EMPRESA: empresa,
                            IND_ESTADO_VENTA: '&',
                            C_USUARIO: session_id
                        };
                        $.AddPetition({
                            table: 'VET.VENTA',
                            type: 2,
                            condition: `C_VENTA = '${c_venta}' AND C_EMPRESA = '${empresa}'`,
                            items: $.ConvertObjectToArr(objectVenta)
                        });
                        // Notas pedido
                        $.AddPetition({
                            type: 4,
                            transaction: true,
                            items: $.ConvertObjectToArr({
                                script: 'spw_ventas_cambiar_estado_notas_pedido',
                                C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                                C_VENTA: c_venta,
                                ESTADO: 'A'
                            })
                        })
                        $.AddPetition({
                            type: 4,
                            transaction: true,
                            items: $.ConvertObjectToArr({
                                script: 'spw_ventas_nuevaventa_cambiar_estado_notapedido_adjuntos_de_notadespacho',
                                C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                                C_VENTA: c_venta,
                                ESTADO: 'A'
                            })
                        })
                        $.AddPetition({
                            type: 4,
                            transaction: true,
                            items: $.ConvertObjectToArr({
                                script: 'spw_ventas_nuevaventa_borrar_despachos_adjuntos',
                                C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                                C_VENTA: c_venta
                            })
                        })
                        if (ref_c_venta != null) {
                            const objectVentaRef = {
                                C_VENTA: ref_c_venta,
                                C_EMPRESA: empresa,
                                IND_ESTADO_COTIZACION: 'A',
                                C_USUARIO: session_id
                            };
                            $.AddPetition({
                                table: 'VET.VENTA',
                                type: 2,
                                condition: `C_VENTA = '${ref_c_venta}' AND C_EMPRESA = '${empresa}'`,
                                items: $.ConvertObjectToArr(objectVentaRef)
                            });
                        }
                        $.SendPetition({
                            connectToLogin: 'S',
                            onBefore: function () {
                                $.DisplayStatusBar({ message: 'Anulando venta' });
                            },
                            onReady: function (result) {
                                $.CloseStatusBar();
                                alertify.success('Se anuló el comprobante.');
                                $('form[name=frmRegistroVentas]').submit();
                                $('form[name=frmRegistroCotizacion]').submit();
                            },
                            onError: function (_error) {
                                $.CloseStatusBar();
                                $.ShowError({ error: _error });
                            }
                        });
                    }, null).set('labels', { ok: 'Si', cancel: 'No' }).set('defaultFocus', 'ok').set('closable', false);
            }
            const fnRegistrarComunicadoBaja = function (idEmisor, cod_tipo_doc, nroComprobante, c_venta, ref_c_venta) {
                var tipo_doc;
                if (cod_tipo_doc == '07236') tipo_doc = 'FACTURA'
                else if (cod_tipo_doc == '07237') tipo_doc = 'BOLETA DE VENTA'
                else if (cod_tipo_doc == '07241') tipo_doc = 'NOTA DE CRÉDITO'
                else if (cod_tipo_doc == '07242') tipo_doc = 'NOTA DE DÉBITO'

                alertify.prompt('Mensaje del sistema', 'Por favor ingrese el motivo.', '',
                    function (evt, value) {
                        if (value == '') {
                            fnObtenerAlerta('Por favor indique el motivo');
                        }
                        else {
                            const token = $.AddPetition({
                                type: 5,
                                table: 'wsp_comunicado_baja_comprobante',
                                items: $.ConvertObjectToArr({
                                    emisor: idEmisor,
                                    tipo_doc: tipo_doc,
                                    numero: nroComprobante,
                                    motivo_baja: value,
                                    cod_emisor: c_venta
                                })
                            });
                            $.SendPetition({
                                connectTo: 'SRVSQL_FTE',
                                onBefore: function () {
                                    $.DisplayStatusBar({ message: 'Generando comunicado de baja' });
                                },
                                onReady: function (result) {
                                    $.CloseStatusBar();
                                    const id_comunicado = result[token].result.rows[0].ID_COMUNICADOBAJA;

                                    const objectVenta = {
                                        C_VENTA: c_venta,
                                        C_EMPRESA: empresa,
                                        IND_ESTADO_VENTA: 'J',
                                        ID_COMUNICADOBAJA: id_comunicado,
                                        C_USUARIO: session_id
                                    };
                                    $.AddPetition({
                                        table: 'VET.VENTA',
                                        type: 2,
                                        condition: `C_VENTA = '${c_venta}' AND C_EMPRESA = '${empresa}'`,
                                        items: $.ConvertObjectToArr(objectVenta)
                                    });
                                    if (ref_c_venta != null) {
                                        const objectVentaRef = {
                                            C_VENTA: ref_c_venta,
                                            C_EMPRESA: empresa,
                                            IND_ESTADO_COTIZACION: 'A',
                                            C_USUARIO: session_id
                                        };
                                        $.AddPetition({
                                            table: 'VET.VENTA',
                                            type: 2,
                                            condition: `C_VENTA = '${ref_c_venta}' AND C_EMPRESA = '${empresa}'`,
                                            items: $.ConvertObjectToArr(objectVentaRef)
                                        });
                                    }
                                    $.SendPetition({
                                        connectToLogin: 'S',
                                        onBefore: function () {
                                            $.DisplayStatusBar({ message: 'Anulando documento' });
                                        },
                                        onReady: function (result) {
                                            $.CloseStatusBar();
                                            alertify.success('Operación completada.');
                                            $('form[name=frmRegistroVentas]').submit();
                                            $('form[name=frmRegistroCotizacion]').submit();
                                        },
                                        onError: function (_error) {
                                            $.CloseStatusBar();
                                            $.ShowError({ error: _error });
                                        }
                                    });
                                },
                                onError: function (_error) {
                                    $.CloseStatusBar();
                                    $.ShowError({ error: _error });
                                }
                            });
                        }
                    }, null);
            }
            const fnAnularVenta = function () {
                const indice = $('#tblVentas').jqxGrid('getselectedrowindex');
                const fila = $('#tblVentas').jqxGrid('getrows')[indice];
                const c_venta = fila['C_VENTA'];
                const ref_c_venta = fila['REF_C_VENTA'];
                const cod_tipo_doc = fila['cod_tipo_doc'];
                const nroComprobante = fila['COMPROBANTE'];
                const idEmisor = fila['ID_EMISOR'];

                $.GetQuery({
                    //query: ['q_ventas_procesos_registroventa_consultarventas_consultarnotas'],
                    query: ['q_ventas_procesos_registroventa_validar_doc_para_anular'],
                    items: [{ C_VENTA: c_venta, C_EMPRESA: empresa }],
                    onReady: function (result) {

                        if (result.length != 0) {

                            var estado = result[0]['Estado'];

                            if (estado == 'ANULA') { //Anula el comprobante directamente
                                fnGuardarEstadoAnulado(c_venta, ref_c_venta);
                            };

                            if (estado == 'BLOQUEO') { //El documento no puede ser anulado
                                fnObtenerAlerta('El comprobante no puede ser anulado.');
                            };

                            if (estado == 'NC') { //El documento solo se puede anular por NC
                                fnObtenerAlerta('El comprobante ha superado el plazo maximo para ser anulado, debe anular el documento por una nota de crédito.');
                            };

                            if (estado == 'COMUNICADOBAJA') { //Generar comunicado de baja
                                fnRegistrarComunicadoBaja(idEmisor, cod_tipo_doc, nroComprobante, c_venta, ref_c_venta);
                            };

                        }
                        else {
                            fnObtenerAlerta('El comprobante no puede ser anulado.');
                        }
                    },
                    onError: function (error) {
                        $.CloseStatusBar();
                        $.ShowError({ error });
                    }
                });
            }
            fnAnularVenta();
        };
        const actionNotaCredito = function () {
            const indice = $('#tblVentas').jqxGrid('getselectedrowindex');
            const fila = $('#tblVentas').jqxGrid('getrows')[indice];
            const c_venta = fila['C_VENTA'];
            const cod_tipo_doc = fila['cod_tipo_doc'];
            let estado;
            let nro_nc, nro_nd;

            $.GetQuery({
                query: ['q_ventas_procesos_registroventa_consultarventas_consultarnotas'],
                items: [{ C_VENTA: c_venta, C_EMPRESA: empresa }],
                onReady: function (result) {
                    // Si está aprobado se va a sunat
                    nro_nc = result[0].NRO_NC;
                    nro_nd = result[0].NRO_ND;
                    estado = result[0].IND_ESTADO_VENTA;

                    //if (/*nro_nc == 0 && */nro_nd == 0) {
                        if (estado == 'A') {
                            if (cod_tipo_doc == '07237' || cod_tipo_doc == '07236') {
                                const direccion = $.solver.baseUrl + '/Procesos/NuevaVenta?id=' + c_venta + '&notacredito=anular';
                                document.location = direccion;
                            }
                        }
                    //}
                    //else {
                    //    fnObtenerAlerta('Este documento ya tiene nota de ' + (nro_nc > 0 ? 'crédito' : 'débito'))
                    //}
                }
            });
        };
        const actionNotaDebito = function () {
            const indice = $('#tblVentas').jqxGrid('getselectedrowindex');
            const fila = $('#tblVentas').jqxGrid('getrows')[indice];
            const c_venta = fila['C_VENTA'];
            const cod_tipo_doc = fila['cod_tipo_doc'];
            let estado;
            let nro_nc, nro_nd;

            $.GetQuery({
                query: ['q_ventas_procesos_registroventa_consultarventas_consultarnotas'],
                items: [{ C_VENTA: c_venta, C_EMPRESA: empresa }],
                onReady: function (result) {
                    // Si está aprobado se va a sunat
                    nro_nc = result[0].NRO_NC;
                    nro_nd = result[0].NRO_ND;
                    estado = result[0].IND_ESTADO_VENTA;

                    //if (nro_nc == 0 && nro_nd == 0) {
                        if (estado == 'A') {
                            if (cod_tipo_doc == '07237' || cod_tipo_doc == '07236') {
                                const direccion = $.solver.baseUrl + '/Procesos/NuevaVenta?id=' + c_venta + '&notadebito=debitar';
                                document.location = direccion;
                            }
                        }
                    //}
                    //else {
                    //    fnObtenerAlerta('Este documento ya tiene nota de ' + (nro_nc > 0 ? 'crédito' : 'débito'))
                    //}
                }
            });
        };
        const actionAprobar = function () {
            const fnAprobar = function () {
                const indice = $('#tblVentas').jqxGrid('getselectedrowindex');
                const fila = $('#tblVentas').jqxGrid('getrows')[indice];
                const c_venta = fila['C_VENTA'];
                const objectVenta = {
                    C_VENTA: c_venta,
                    C_EMPRESA: empresa,
                    IND_ESTADO_VENTA: 'A',
                    C_USUARIO: session_id
                };
                $.AddPetition({
                    table: 'VET.VENTA',
                    type: 2,
                    condition: `C_VENTA = '${c_venta}' AND C_EMPRESA = '${empresa}'`,
                    items: $.ConvertObjectToArr(objectVenta)
                });
                $.SendPetition({
                    connectToLogin: 'S',
                    onBefore: function () {
                        $.DisplayStatusBar({ message: 'Aprobando venta' });
                    },
                    onReady: function (result) {
                        $.CloseStatusBar();
                        alertify.success('Se aprobó el comprobante.');
                        $('form[name=frmRegistroVentas]').submit();
                    },
                    onError: function (_error) {
                        $.CloseStatusBar();
                        $.ShowError({ error: _error });
                    }
                });
            }
            fnAprobar();
        };
        const actionAnularCotizacion = function () {
            const fnAnularVenta = function () {
                const indice = $(tblCotizacion).jqxGrid('getselectedrowindex');
                const fila = $(tblCotizacion).jqxGrid('getrows')[indice];
                const c_venta = fila['C_VENTA'];
                const objectVenta = {
                    C_VENTA: c_venta,
                    C_EMPRESA: empresa,
                    IND_ESTADO_COTIZACION: '&',
                    C_USUARIO: session_id
                };
                $.AddPetition({
                    table: 'VET.VENTA',
                    type: 2,
                    condition: `C_VENTA = '${c_venta}' AND C_EMPRESA = '${empresa}'`,
                    items: $.ConvertObjectToArr(objectVenta)
                });
                $.SendPetition({
                    connectToLogin: 'S',
                    onBefore: function () {
                        $.DisplayStatusBar({ message: 'Anulando cotización' });
                    },
                    onReady: function (result) {
                        $.CloseStatusBar();
                        alertify.success('Se anuló la cotización.');
                        $('form[name=frmRegistroCotizacion]').submit();
                    },
                    onError: function (_error) {
                        $.CloseStatusBar();
                        $.ShowError({ error: _error });
                    }
                });
            }
            alertify.confirm('Confirme Operación!!', '¿Seguro que desea anular esta venta?', fnAnularVenta, null).set('labels', { ok: 'Si', cancel: 'No' }).set('defaultFocus', 'ok').set('closable', false);;
        };
        const actionReenviar = function () {

            var row = $(tblVentas).jqxGrid('getrows')[$(tblVentas).jqxGrid('getselectedrowindex')];
            var correo = row['CORREO_FACTURACION'];

            $.solver.fn.fnReenviarCorreo({
                correo: correo,
                flag: 'ven',
                emisor: row['ID_EMISOR'],
                comprobante: row['ID_COMPROBANTE']
            });

        };
        const actionVenderNotaPedido = function () {
            alertify.confirm('Mensaje del sistema', '¿Desea facturar las notas de pedido seleccionadas?',
                function () {
                    var c_ventas = [];
                    var ventas = $(tblNotaPedido).jqxGrid('getselectedrowindexes');
                    $.each(ventas, function (i, v) {
                        var row = $(tblNotaPedido).jqxGrid('getrows')[v];
                        c_ventas.push(row['C_VENTA']);
                    });
                    $.AddPetition({
                        type: '4',
                        transaction: true,
                        items: $.ConvertObjectToArr({
                            script: 'spw_ventas_procesos_registroventa_facturarnotasaprobadas',
                            C_NOTA_PEDIDO: c_ventas.join(','),
                            C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                            C_USUARIO: $.solver.session.SESSION_ID,
                            COD_MODULO: $.solver.basePath
                        })
                    });

                    $.SendPetition({
                        onReady: function (result) {
                            $.CloseStatusBar();
                            $.GetQuery({
                                query: ['q_ventas_procesos_registroventa_obtener_cventa_notaspedido'],
                                items: [{
                                    C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                                    C_NOTA_PEDIDO: c_ventas[0]
                                }],
                                onReady: function (result) {
                                    document.location = $.solver.baseUrl + '/Procesos/NuevaVenta/' + result[0].C_VENTA;
                                }
                            })
                        },
                        onBefore: function () {
                            $.DisplayStatusBar({ message: 'Generando documentos.' });
                        },
                        onError: function (_error) {
                            $.CloseStatusBar();
                            $.ShowError({ error: _error });
                        }
                    });
                },
                function () {
                    alertify.error('Operación cancelada');
                    $('form[name=frmNotaPedido]').submit();
                }
            ).set('labels', { ok: 'Si', cancel: 'No' }).set('defaultFocus', 'ok').set('closable', false);
            //const index = $(tblNotaPedido).jqxGrid('getselectedrowindex');
            //const data = $(tblNotaPedido).jqxGrid('getrows')[index];
            //const c_venta = data.C_VENTA;
            //document.location = $.solver.baseUrl + '/Procesos/NuevaVenta/' + c_venta;
        };
        const actionAnularNotaPedido = function () {

        };
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
                        xhr: function () {
                            xhr = jQuery.ajaxSettings.xhr.apply(this, arguments);
                            return xhr;
                        },
                        xhrFields: {
                            responseType: 'blob'
                        },
                        beforeSend: function (xhr) {
                            $.DisplayStatusBar({ message: 'Generando ticket.' });
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

                    $.ajax(settings).done(function (json) {
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

        };

        /** Método para duplicar documento seleccionado */
        const actionDuplicarDocumento = function () {

            // Obtenemos el c_venta
            const indice = $(tblVentas).jqxGrid('getselectedrowindex');
            const fila = $(tblVentas).jqxGrid('getrows')[indice];
            const c_venta = fila['C_VENTA'];

            // Enviamos al servidor los datos para duplicar un documento
            $.AddPetition({
                type: '4',
                transaction: true,
                items: $.ConvertObjectToArr({
                    script: 'spw_gbl_duplicar_comprobante',
                    C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                    C_VENTA: c_venta,
                    C_USUARIO: $.solver.session.SESSION_ID
                })
            });

            // Si no hubo errores, actualizamos el grid table
            $.SendPetition({
                onReady: function () {
                    $.CloseStatusBar();
                    alertify.success('El documento ha sido generado correctamente.');
                    $(tblVentas).jqxGrid('updatebounddata')
                },
                onError: function (_error) {
                    $.CloseStatusBar();
                    $.ShowError({ error: _error });
                },
                onBefore: function () {
                    $.DisplayStatusBar({ message: 'Duplicando documento.' });
                },
            });
        }

        $('.c_empresa').attr('data-c_empresa', empresa);

        $('#btnVenderCotizacion').click(function (e) {
            actionVenderCotizacion();
            e.preventDefault();
        });
        $('#btnAnularCotizacion').click(function (e) {
            actionAnularCotizacion();
            e.preventDefault();
        });
        $('#btnNuevaVenta').click(function (e) {
            actionNuevaVenta();
            e.preventDefault();
        });
        $('#btnEditarVenta').click(function (e) {
            actionEditarVenta();
            e.preventDefault();
        });
        $('#btnEnviarVenta').click(function (e) {
            alertify.confirm('Mensaje del sistema', '¿Desea hacer la declaración a sunat?',
                actionEnviarVenta,
                function () {
                    alertify.error('Operación cancelada');
                    $('form[name=frmRegistroVentas]').submit();
                }
            ).set('labels', { ok: 'Si', cancel: 'No' }).set('defaultFocus', 'ok').set('closable', false);
            e.preventDefault();
        });
        $('#btnAnularVenta').click(function (e) {
            e.preventDefault();
            actionAnularVenta();
        });
        $('#btnNotaCredito').click(function (e) {
            e.preventDefault();
            actionNotaCredito();
        });
        $('#btnNotaDebito').click(function (e) {
            e.preventDefault();
            actionNotaDebito();
        });
        $('#btnAprobar').click(function (e) {
            e.preventDefault();
            actionAprobar();
        });
        $('#btnReenviar').click(function (e) {
            e.preventDefault();
            actionReenviar();
        });
        $('#btnCabeceraConsisat').click(function () {
            $.DownloadFile({
                nameFile: 'CabeceraConsisat',
                query: 'q_ventas_procesos_registroventa_cabecera_consisat',
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
                    ESTADO: function () {
                        return $('form[name=frmRegistroVentas] #_estado').val() || '';
                    },
                    BUSCAR: function () {
                        return $('form[name=frmRegistroVentas] #_buscar').val() || '';
                    }
                }
            })

        });
        $('#btnDescargarVenta').click(function (e) {
            $.DownloadFile({
                nameFile: 'Ventas',
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
                    ESTADO: function () {
                        return $('form[name=frmRegistroVentas] #_estado').val() || '';
                    },
                    BUSCAR: function () {
                        return $('form[name=frmRegistroVentas] #_buscar').val() || '';
                    }
                }
            });
        });
        $('#btnVenderNotapedido').click(function (e) {
            actionVenderNotaPedido();
            e.preventDefault();
        });
        $('#btnAnularNotapedido').click(function (e) {
            actionAnularNotaPedido();
            e.preventDefault();
        });
        $('form[name=frmRegistroCotizacion]').ValidForm({
            type: -1,
            onReady: function (result) {
                $(tblCotizacion).jqxGrid('updatebounddata');
            },
            onDone: function () {
                $('form[name=frmRegistroCotizacion] #_cliente').selectpicker();
            }
        });
        $('form[name=frmRegistroVentas]').ValidForm({
            type: -1,
            onReady: function (result) {
                $(tblVentas).jqxGrid('updatebounddata');
                fnObtenerTotales();
            },
            onDone: function () {
                $('form[name=frmRegistroVentas] #_cliente').selectpicker();

                $.GetQuery({
                    query: [
                        'gbl_obtener_parametro_general',
                        'gbl_obtener_parametro_general_tipooperacion',
                        'gbl_obtener_parametro_general_detraccion'
                    ],
                    items: [
                        { tipoparametro: 'Código de tipo de afectación del IGV' },
                    ],
                    onError: function (error) {
                        $.CloseStatusBar();
                        $.ShowError({ error });
                    },
                    onReady: function (result) {
                        var _afectacion = result['gbl_obtener_parametro_general'].result.rows;
                        var _tipooperacion = result['gbl_obtener_parametro_general_tipooperacion'].result.rows;
                        var _detraccion = result['gbl_obtener_parametro_general_detraccion'].result.rows;
                        $.each(_afectacion, function (i, v) {
                            arrAfectacionIgv.push({
                                value: v.CODIGO,
                                label: v.DESCRIPCION
                            });
                        });
                        $.each(_tipooperacion, function (i, v) {
                            arrTipoOperacion.push({
                                value: v.CODIGO,
                                label: v.DESCRIPCION
                            });
                        });
                        $.each(_detraccion, function (i, v) {
                            arrTipoDetraccion.push({
                                value: v.CODIGO,
                                label: v.DESCRIPCION
                            });
                        });
                    }
                })
            }
        });
        $('form[name=frmRegistroCotizacionPeriodica]').ValidForm({
            type: -1,
            onReady: function (result) {
                $(tblCotizacionPeriodica).jqxGrid('updatebounddata');
            },
            onDone: function () {
                $('form[name=frmRegistroCotizacionPeriodica] #_cliente').selectpicker();
            }
        });
        $('form[name=frmNotaPedido]').ValidForm({
            type: -1,
            onReady: function (result) {
                $(tblNotaPedido).jqxGrid('updatebounddata');
            },
            onDone: function () {
                $('form[name=frmNotaPedido] #cliente').selectpicker();
            }
        });
        $('#btnVenderCotizacionPeriodica').click(function () {
            var c_ventas = [];
            var ventas = $(tblCotizacionPeriodica).jqxGrid('getselectedrowindexes');
            $.each(ventas, function (i, v) {
                var row = $(tblCotizacionPeriodica).jqxGrid('getrows')[v];
                c_ventas.push(row['C_VENTA']);
            });

            $.AddPetition({
                type: '4',
                transaction: true,
                items: $.ConvertObjectToArr({
                    script: 'spw_ventas_procesos_registroventa_registrarcotizacionesaborradoresventas',
                    C_VENTAS: c_ventas.join(','),
                    C_EMPRESA: empresa
                })
            });

            $.SendPetition({
                connectToLogin: 'S',
                onReady: function (result) {
                    $.GetData({
                        title: `<i class="fa fa-file-code-o" aria-hidden="true"></i> Lista de documentos`,
                        uriData: `${$.solver.baseUrl}/Procesos/ListaDocumentosBorradores/`,
                        location: 'float',
                        type: 'GET',
                        isPage: true,
                        onReady: function (object, modal) {
                            $.CloseStatusBar();

                            $(modal).find('.modal-dialog').css({ 'max-width': '95%' });

                            $(object).find('.bloqueTextoAdicional').show();

                            const fnBorrarProducto = function (indice) {
                                alertify.confirm('Mensaje del sistema', '¿Estas seguro de eliminar el producto?',
                                    function () {
                                        const rowid = $(object).find('#table').jqxGrid('getrowid', indice)
                                        $(object).find('#table').jqxGrid('deleterow', rowid);
                                    },
                                    function () { alertify.error('Operación cancelada'); }
                                ).set('labels', { ok: 'Si', cancel: 'No' }).set('defaultFocus', 'ok').set('closable', false);
                            };

                            $(object).find('#afectacion').FieldLoadRemote({
                                onReady: function () {
                                    $(object).find('#afectacion').change(function () {
                                        var label = arrAfectacionIgv.filter(x => x['value'] == $(object).find('#afectacion').val())[0].label;
                                        $.each($(object).find('#table').jqxGrid('getrows'), function (i, v) {
                                            $(object).find('#table').jqxGrid('getrows')[i].AFECTACION = label;
                                        });
                                        $(object).find('#table').jqxGrid('refresh')
                                    });
                                }
                            });

                            $(object).find('#tipooperacion').FieldLoadRemote({
                                onReady: function () {
                                    $(object).find('#tipooperacion').change(function () {
                                        var label = arrTipoOperacion.filter(x => x['value'] == $(object).find('#tipooperacion').val())[0].label;
                                        $.each($(object).find('#table').jqxGrid('getrows'), function (i, v) {
                                            $(object).find('#table').jqxGrid('getrows')[i].TIPO_OPERACION = label;
                                        });
                                        $.each($(object).find('#table').jqxGrid('getrows'), function (i, v) {
                                            $(object).find('#table').jqxGrid('getrows')[i].TIPO_DETRACCION = '';
                                        });

                                        if (label == 'Operación Sujeta a Detracción') {
                                            $(object).find('#tipodetraccion').val('')
                                            $(object).find('.bloqueTipoDetraccion').show()
                                            $(object).find('#table').jqxGrid('showcolumn', 'TIPO_DETRACCION');
                                        }
                                        else {
                                            $(object).find('#tipodetraccion').val('')
                                            $(object).find('.bloqueTipoDetraccion').hide()
                                            $(object).find('#table').jqxGrid('hidecolumn', 'TIPO_DETRACCION');
                                        }
                                        $(object).find('#table').jqxGrid('refresh')
                                    });
                                }
                            });

                            $(object).find('#tipodetraccion').FieldLoadRemote({
                                onReady: function () {
                                    $(object).find('#tipodetraccion').change(function () {
                                        var label = arrTipoDetraccion.filter(x => x['value'] == $(object).find('#tipodetraccion').val())[0].label;
                                        $.each($(object).find('#table').jqxGrid('getrows'), function (i, v) {
                                            $(object).find('#table').jqxGrid('getrows')[i].TIPO_DETRACCION = label;
                                        });
                                        $(object).find('#table').jqxGrid('refresh')
                                    });
                                }
                            });

                            $(object).find('#textoAdicional').keyup(function () {
                                const texto = $(this).val();
                                $.each($(object).find('#table').jqxGrid('getrows'), function (i, v) {
                                    $(object).find('#table').jqxGrid('getrows')[i].TEXTO_ADICIONAL = texto;
                                });
                                $(object).find('#table').jqxGrid('refresh')
                            })

                            $(object).find('#table').CreateGrid({
                                query: 'tbl_ventas_procesos_registroventa_consultarborrador',
                                items: { C_EMPRESA: empresa },
                                hiddens: ['C_VENTA', 'C_DETALLE', 'CORREO_FACTURACION', 'PRODUCTO', 'TIPO_DETRACCION'],
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
                                        editable: false
                                    },
                                    'TIPO_DOCUMENTO': {
                                        text: 'Tipo de doc.',
                                        width: 90,
                                        editable: false
                                    },
                                    'NRO_COTIZACION': {
                                        text: 'Nro. Cotización',
                                        width: 100,
                                        cellsrenderer: function (row, columnfield, value, defaulthtml, columnproperties) {
                                            '<div class="jqx-grid-cell-left-align" style="margin-top: 4px;">' + value + '</div>';
                                        },
                                        editable: false
                                    },
                                    'COMPROBANTE': {
                                        text: 'Comprobante',
                                        width: 100,
                                        editable: false
                                    },
                                    'CLIENTE': {
                                        text: 'Cliente',
                                        width: 250,
                                        editable: false
                                    },
                                    'TIPO_OPERACION': {
                                        text: 'Tipo de operación',
                                        editable: true,
                                        columntype: 'dropdownlist',
                                        width: 200,
                                        createeditor: function (row, value, editor) {
                                            var source =
                                            {
                                                datatype: "array",
                                                datafields: [
                                                    { name: 'label', type: 'string' },
                                                    { name: 'value', type: 'string' }
                                                ],
                                                localdata: arrTipoOperacion
                                            };

                                            var myadapter = new $.jqx.dataAdapter(source, { autoBind: true });

                                            editor.jqxDropDownList({ source: myadapter, displayMember: 'label', valueMember: 'value' });
                                        },
                                        cellendedit: function (row, datafield, columntype, oldvalue, newvalue) {
                                            if (newvalue == 'Operación Sujeta a Detracción') {
                                                $(object).find('#table').jqxGrid('showcolumn', 'TIPO_DETRACCION');
                                            }
                                            else {
                                                $(object).find('#table').jqxGrid('hidecolumn', 'TIPO_DETRACCION');
                                            }
                                            var rowData = $(object).find('#table').jqxGrid('getrows')[row];
                                            var rows = $(object).find('#table').jqxGrid('getrows');
                                            $.each(rows, function (i, v) {
                                                if (v.C_VENTA == rowData.C_VENTA) {
                                                    $(object).find('#table').jqxGrid('getrows')[i].TIPO_OPERACION = newvalue;
                                                    $(object).find('#table').jqxGrid('getrows')[i].TIPO_DETRACCION = '';
                                                }
                                            })
                                        }
                                    },
                                    'TIPO_DETRACCION': {
                                        text: 'Tipo de detracción',
                                        editable: true,
                                        columntype: 'dropdownlist',
                                        width: 200,
                                        createeditor: function (row, value, editor) {
                                            var source =
                                            {
                                                datatype: "array",
                                                datafields: [
                                                    { name: 'label', type: 'string' },
                                                    { name: 'value', type: 'string' }
                                                ],
                                                localdata: arrTipoDetraccion
                                            };

                                            var myadapter = new $.jqx.dataAdapter(source, { autoBind: true });

                                            editor.jqxDropDownList({ source: myadapter, displayMember: 'label', valueMember: 'value' });
                                        },
                                        cellendedit: function (row, datafield, columntype, oldvalue, newvalue) {
                                            var rowData = $(object).find('#table').jqxGrid('getrows')[row];
                                            var rows = $(object).find('#table').jqxGrid('getrows');
                                            $.each(rows, function (i, v) {
                                                if (v.C_VENTA == rowData.C_VENTA) {
                                                    $(object).find('#table').jqxGrid('getrows')[i].TIPO_DETRACCION = newvalue;
                                                }
                                            })
                                        }
                                    },
                                    'AFECTACION': {
                                        text: 'Afectación igv',
                                        editable: true,
                                        width: 250,
                                        columntype: 'dropdownlist',
                                        createeditor: function (row, value, editor) {
                                            var source =
                                            {
                                                datatype: "array",
                                                datafields: [
                                                    { name: 'label', type: 'string' },
                                                    { name: 'value', type: 'string' }
                                                ],
                                                localdata: arrAfectacionIgv
                                            };

                                            var myadapter = new $.jqx.dataAdapter(source, { autoBind: true });

                                            editor.jqxDropDownList({ source: myadapter, displayMember: 'label', valueMember: 'value' });
                                        },
                                        cellendedit: function (row, datafield, columntype, oldvalue, newvalue) {
                                        }
                                    },
                                    'MONEDA': {
                                        text: 'Moneda',
                                        width: 100,
                                        cellsAlign: 'center',
                                        editable: false
                                    },
                                    'NOMBRE_PARA_VENTA': {
                                        text: 'Producto',
                                        width: 150,
                                        editable: false
                                    },
                                    'TEXTO_ADICIONAL': {
                                        text: 'Texto adicional',
                                        width: 250,
                                    },
                                    'PRECIO': {
                                        text: 'Precio',
                                        width: 80,
                                        cellsAlign: 'right',
                                        cellsFormat: 'd2',
                                        columnType: 'numberinput',
                                        editable: false,
                                        //aggregates: ['sum'],
                                    },
                                    'CANTIDAD': {
                                        text: 'Cantidad',
                                        width: 80,
                                        cellsAlign: 'right',
                                        cellsFormat: 'd2',
                                        columnType: 'numberinput',
                                        editable: false,
                                    },
                                    'PRECIO_TOTAL': {
                                        text: 'Subtotal',
                                        width: 80,
                                        cellsAlign: 'right',
                                        cellsFormat: 'd2',
                                        columnType: 'numberinput',
                                        editable: false,
                                    },
                                    'FECHA_CREACION': {
                                        text: 'Fecha creación',
                                        width: 120,
                                        cellsAlign: 'center',
                                        editable: false
                                    },
                                    'ELIMINAR': {
                                        text: 'Acciones',
                                        cellsAlign: 'center',
                                        createwidget: function (row, column, value, htmlElement) {
                                            $(object).find('#table').jqxGrid('refresh');
                                        },
                                        initwidget: function (rowIndex, column, value, htmlElement) {
                                            if ($(htmlElement).children().length == 0) {
                                                let _btnEliminar;
                                                _btnEliminar = $(`<a id="eliminar" style="cursor: pointer;" class="jqx-grid-widget mt-3">&nbsp;Eliminar</a>`);
                                                $(htmlElement).append(_btnEliminar);
                                                $(htmlElement).find('a#eliminar').unbind('click');
                                                $(htmlElement).find('a#eliminar').click(function () {
                                                    fnBorrarProducto(rowIndex);
                                                });
                                            }
                                        }
                                    }
                                },
                                config: {
                                    pageSize: 300,
                                    height: 550,
                                    virtualmode: false,
                                    sortable: false,
                                    editable: true,
                                }
                            })

                            $(object).find('#btnProcesos').click(function () {
                                var rows = $(object).find('#table').jqxGrid('getrows');
                                var ventas = [];
                                $.each(rows, function (i, v) {
                                    if (ventas.indexOf(v.C_VENTA) == -1) {
                                        ventas.push(v.C_VENTA);

                                        $.AddPetition({
                                            type: 2,
                                            condition: `C_EMPRESA = '${empresa}' AND C_VENTA = '${v.C_VENTA}'`,
                                            table: 'VET.VENTA',
                                            items: $.ConvertObjectToArr({
                                                C_EMPRESA: empresa,
                                                C_VENTA: v.C_VENTA,
                                                TIPO_OPERACION: arrTipoOperacion.filter(x => x['label'] == v.TIPO_OPERACION)[0].value,
                                                TIPO_DETRACCION: (v.TIPO_DETRACCION == '' ? '' : arrTipoDetraccion.filter(x => x['label'] == v.TIPO_DETRACCION)[0].value),
                                            })
                                        });
                                    }

                                    $.AddPetition({
                                        type: 2,
                                        condition: `C_EMPRESA = '${empresa}' AND C_VENTA = '${v.C_VENTA}' AND C_DETALLE = '${v.C_DETALLE}'`,
                                        table: 'VET.VENTA_DETALLE',
                                        items: $.ConvertObjectToArr({
                                            C_EMPRESA: empresa,
                                            C_VENTA: v.C_VENTA,
                                            C_DETALLE: v.C_DETALLE,
                                            DESCRIPCION: v.TEXTO_ADICIONAL,
                                            AFECTACION_IGV: arrAfectacionIgv.filter(x => x['label'] == v.AFECTACION)[0].value,
                                        })
                                    });
                                });

                                $.SendPetition({
                                    connectToLogin: 'S',
                                    onReady: function (result) {
                                        $.AddPetition({
                                            type: '4',
                                            transaction: false,
                                            items: $.ConvertObjectToArr({
                                                script: 'spw_ventas_procesos_registroventa_registrarventasmasivas',
                                                C_VENTAS: ventas.join(','),
                                                C_EMPRESA: empresa
                                            })
                                        });

                                        $.SendPetition({
                                            connectToLogin: 'S',
                                            onReady: function (result) {
                                                $.CloseStatusBar();
                                                bootbox.hideAll();
                                                alertify.success('Sus comprobantes han sido enviado a la declaración satisfactoriamente, vaya al registro de ventas y realice el seguimiento.')
                                                $('form[name=frmRegistroVentas]').submit();
                                            },
                                            onBefore: function () {
                                                $.DisplayStatusBar({ message: 'Procesando documentos.' });
                                            },
                                            onError: function (_error) {
                                                $.CloseStatusBar();
                                                $.ShowError({ error: _error });
                                            }
                                        });
                                    },
                                    onBefore: function () {
                                        $.DisplayStatusBar({ message: 'Guardando últimos cambios.' });
                                    },
                                    onError: function (_error) {
                                        $.CloseStatusBar();
                                        $.ShowError({ error: _error });
                                    }
                                });
                            });
                        },
                        onCloseModal: function () {

                        }
                    });
                },
                onBefore: function () {
                    $.DisplayStatusBar({ message: 'Generando documentos.' });
                },
                onError: function (_error) {
                    $.CloseStatusBar();
                    $.ShowError({ error: _error });
                }
            });

        });
        $('#btnUpload').click(function () {
            $('#modalUploadFiles').modal('show');
        });
        $('#btnReimprimirTicket').click(function () {

            var index = $(tblVentas).jqxGrid('getselectedrowindex');
            const data = $(tblVentas).jqxGrid('getrows')[index];

            $.GetQuery({
                query: ['q_gbl_obtener_pedido_para_reimprimir_ticket'],
                items: [{
                    C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                    C_VENTA: data.C_VENTA
                }],
                onReady: function (result) {
                    const pedido = result[0]
                    actionReimprimirTicket(pedido.C_PEDIDO, pedido.C_CAJA, pedido.IND_ESTADO);
                }
            })

        });

        // Evento para duplicar documento
        $('#btnDuplicarDocumento').click(function (e) {

            alertify.confirm('Mensaje del sistema', '¿Está seguro de que desea duplicar el documento seleccionado?',
                function () {
                    actionDuplicarDocumento();
                },
                null).set('labels', { ok: 'Si', cancel: 'No' }).set('defaultFocus', 'ok').set('closable', false);

            e.preventDefault();
        })

        if ($.solver.session.SESSION_TIPO == 'EMPRESA') {
            $('#btnUpload').remove();
            $('#btnCabeceraConsisat').remove();
        };
        if ($.solver.basePath == '/ventas') {
            $('#btnReimprimirTicket').remove();
        };

        // Validamos los tabs, si el modulo fuera 
        if (!editable) {
            $('#cotizacion-aprobada-tab').attr('style', 'display:none;');
            $('#cotizacion-periodica-tab').attr('style', 'display:none;');
            $('#notapedido-tab').attr('style', 'display:none;');
        };

        fnCrearCargaArchivo('uploadVentas');
        fnCrearTabla();

    });
});