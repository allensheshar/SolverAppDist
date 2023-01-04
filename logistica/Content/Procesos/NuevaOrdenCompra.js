require(["helper", "extras", "datetimepicker", "bootstrap-select"], function () {
    require(["alertify", "bootbox", "moment", "numeral"], function (alertify, bootbox, moment, numeral) {

        alertify.set('notifier', 'position', 'top-center');

        const empresa = $.solver.session.SESSION_EMPRESA;
        const table = '#tblDetalle';
        const form = 'form[name=frmOrdenCompra]';
        const direccion = $.solver.baseUrl;
        const direccionServicio = $.solver.services.api;
        let estado = false;
        let arrEliminadas = [];
        let _controls;

        $('.c_empresa').attr('data-empresa', empresa);

        const fnObtenerAlerta = function (message) {
            alertify.alert()
                .setting({
                    'title': 'Mensaje del Sistema',
                    'message': message,
                }).show();
        };
        const fnCalcularTotales = function () {
            const filas = $(tblDetalle).jqxGrid('getrows');
            const simboloMoneda = $(_controls.C_PARAMETRO_GENERAL_MONEDA)[0].args.data.filter(x => x['CODIGO'] == $(_controls.C_PARAMETRO_GENERAL_MONEDA).val())[0].CODIGO_PARAMETRO_2;

            let opGravadas = 0.00;
            let igv = 0.00;
            let opInafecta = 0.00;
            let opExonerada = 0.00;
            let importeTotal = 0.00;
            let opGratuitas = 0.00;
            let descuentos = 0.00;

            $.each(filas, function (i, v) {
                var codAfectacion = parseFloat(v.CODIGO_AFECTACION_IGV_CABECERA)
                if (v.CODIGO_AFECTACION_IGV == '01') {
                    opGravadas += (v.PRECIO_BASE * codAfectacion)
                }
                if (v.CODIGO_AFECTACION_IGV == '02') {
                    opInafecta += (v.PRECIO_BASE * codAfectacion)
                }
                if (v.CODIGO_AFECTACION_IGV == '03') {
                    opExonerada += (v.PRECIO_BASE * codAfectacion)
                }
                if (v.CODIGO_AFECTACION_IGV_CABECERA == '0') {
                    opGratuitas += v.PRECIO_TOTAL;
                }
                descuentos += v.DSCTO_PARCIAL;

                igv += (v.IGV * codAfectacion);
                importeTotal += (v.PRECIO_TOTAL * codAfectacion);
            });

            $(form + ' .SIGNO_MONEDA').text(simboloMoneda);
            $(form + ' #OP_GRAVADAS').text(opGravadas.toFixed(2));
            $(form + ' #IGV').text(igv.toFixed(2));
            $(form + ' #OP_INAFECTA').text(opInafecta.toFixed(2));
            $(form + ' #OP_EXONERADA').text(opExonerada.toFixed(2));
            $(form + ' #TOTAL').text(importeTotal.toFixed(2));
            $(form + ' #OPE_GRATUITAS').text(opGratuitas.toFixed(2));
            $(form + ' #DESCUENTOS').text(descuentos.toFixed(2));

            let precioBase = 0;
            let precioDescuento = 0;
            let precioIgv = 0;
            let precioTotal = 0;
            opGratuitas = 0;

            $.each(filas, function (i, v) {
                let codAfectacion = parseFloat(v.CODIGO_AFECTACION_IGV_CABECERA);
                precioBase += (v.PRECIO_BASE * codAfectacion);
                precioDescuento += (v.DSCTO_UNITARIO * v.CANTIDAD);
                precioIgv += (v.IGV * codAfectacion);
                precioTotal += (v.PRECIO_TOTAL * codAfectacion);

                if (codAfectacion == '0') {
                    opGratuitas += v.PRECIO_TOTAL;
                }
            });

            $(_controls.BASE_IMPONIBLE).val(numeral(precioBase).format('0.000'));
            $(_controls.IGV).val(numeral(precioIgv).format('0.000'));
            $(_controls.DESCUENTO).val(numeral(precioDescuento).format('0.000'));
            $(_controls.TOTAL).val(numeral(precioTotal).format('0.000'));
            $(_controls.OPERACIONES_GRATUITAS).val(opGratuitas);
        };
        const fnCrearTabla = function () {
            const fnBorrarProducto = function (indice) {
                alertify.confirm('Mensaje del sistema', '¿Estas seguro de eliminar el producto?',
                    function () {
                        const fila = $(table).jqxGrid('getrows')[indice]
                        arrEliminadas.push(fila);
                        const rowid = $(table).jqxGrid('getrowid', indice)
                        $(table).jqxGrid('deleterow', rowid);
                    }, null
                ).set('labels', { ok: 'Si', cancel: 'No' }).set('defaultFocus', 'ok').set('closable', false);
            };
            const fnEditarProducto = function (indice) {
                fnBuscarProducto(indice);
            };
            $(table).CreateGrid({
                query: 'tbl_logistica_procesos_nuevaordencompra_obtenerdetalle',
                items: { C_EMPRESA: empresa, C_ORDEN_COMPRA: function () { return $(_controls.C_ORDEN_COMPRA).val(); } },
                hiddens: ['C_DETALLE', 'C_ORDEN_COMPRA', 'C_EMPRESA', 'C_PRODUCTO_PRECIO', 'IND_SERVICIO', 'BASE_IMPONIBLE', 'INCLUYE_IGV',
                    'VALOR_UNITARIO', 'VALOR_VENTA_UNITARIO', 'IGV_UNITARIO', 'C_UNIDAD_NEGOCIO', 'DESCRIPCION', 'NUM', 'NOMBRE_ORIGINAL',
                    'C_PARAMETRO_GENERAL_TIPO_PRODUCTO', 'UNIDAD_AUX', 'CODIGO_AFECTACION_IGV_CABECERA', 'DSCTO_UNITARIO_IGV', 'C_UND_PRIN', 'UND_PRIN',
                    'C_UNIDAD_MEDIDA', 'CODIGO_AFECTACION_IGV',
                    'C_UND_AUX', 'UND_AUX', 'STOCK_PRIN', 'STOCK_AUX', 'FACTOR', 'C_PARAMETRO_GENERAL_UNIDAD', 'PORC_DSCTO', 'DSCTO_PARCIAL'],
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
                    'C_PRODUCTO': {
                        text: 'Cód. producto',
                        cellsAlign: 'left',
                        width: 100
                    },
                    'NOMBRE_PARA_VENTA': {
                        text: 'Producto',
                        cellsAlign: 'left',
                        width: 250
                    },
                    'UNIDAD': {
                        text: 'Und. medida',
                        width: 100,
                    },
                    'CANTIDAD': {
                        text: 'Cantidad',
                        width: 100,
                        cellsAlign: 'right',
                        columnType: 'numberinput',
                        cellsFormat: 'd2',
                    },
                    'PRECIO': {
                        text: 'Precio',
                        width: 100,
                        cellsAlign: 'right',
                        cellsFormat: 'd2',
                        columnType: 'numberinput',
                        cellsFormat: 'd2',
                    },
                    'PRECIO_BASE': {
                        text: 'Precio base',
                        width: 100,
                        cellsAlign: 'right',
                        columnType: 'numberinput',
                        cellsFormat: 'd2',
                    },
                    'IGV': {
                        text: 'IGV',
                        width: 100,
                        cellsAlign: 'right',
                        columnType: 'numberinput',
                        cellsFormat: 'd2',
                    },
                    'PRECIO_TOTAL': {
                        text: 'Precio total',
                        width: 100,
                        cellsAlign: 'right',
                        columnType: 'numberinput',
                        cellsFormat: 'd2',
                    },
                    'ACCIONES': {
                        text: 'Acciones',
                        width: 120,
                        createwidget: function (row, column, value, htmlElement) { $(table).jqxGrid('refresh'); },
                        initwidget: function (rowIndex, column, value, htmlElement) {
                            $(htmlElement).html('');
                            $(htmlElement).addClass('jqx-grid-cell-middle-align');
                            $(htmlElement).addClass('mt-1');

                            let _btnEditar;
                            _btnEditar = $(`<a id="editar" style="cursor: pointer;" class="jqx-grid-widget">&nbsp;Editar</a>`);
                            $(htmlElement).append(_btnEditar);
                            $(htmlElement).find('a#editar').unbind('click');
                            $(htmlElement).find('a#editar').click(function () {
                                if (!estado) {
                                    estado = true;
                                    fnEditarProducto(rowIndex);
                                }
                            });

                            let _btnEliminar;
                            _btnEliminar = $(`<a id="eliminar" style="cursor: pointer;" class="jqx-grid-widget">&nbsp;Eliminar</a>`);
                            $(htmlElement).append(_btnEliminar);
                            $(htmlElement).find('a#eliminar').unbind('click');
                            $(htmlElement).find('a#eliminar').click(function () {
                                fnBorrarProducto(rowIndex);
                            });
                        },
                    }
                },
                config: {
                    virtualmode: false,
                    height: 200,
                    pageSize: 999999,
                    pageable: false,
                    sortable: false,
                    editable: false,
                    selectionmode: 'none',
                    rendered: function () {
                        fnCalcularTotales();
                    }
                }
            });
        };
        const fnObtenerDatosEmpresa = function () {
            $.GetQuery({
                query: ['q_ventas_procesos_nuevaventa_consultarempresa'],
                items: [{
                    C_EMPRESA: $.solver.session.SESSION_EMPRESA
                }],
                onError: function (error) {
                    $.ShowError({ error: error });
                },
                onReady: function (result) {
                    const data = result[0]
                    $('#RAZON_SOCIAL').text(data['RAZON_SOCIAL']);
                    $('#DIRECCION_EMPRESA').text(data['DIRECCION']);
                }
            });
            $.solver.fn.getImageLogoCompany('#IMAGEN_COMPANY');
        };
        const fnObtenerProveedor = function () {
            $.GetQuery({
                query: ['q_logistica_procesos_nuevaordencompra_obtenerproveedor_porid'],
                items: [{
                    C_PROVEEDOR: function () { return $(_controls.C_PROVEEDOR).val(); },
                    C_EMPRESA: empresa
                }],
                onReady: function (result) {
                    if (result.length == 0) {
                        alertify.error('No se pudo obtener los datos del proveedor');
                    }
                    else {
                        const dataProveedor = result[0];
                        $(form + ' #NOMBRE').text(dataProveedor['RAZON_SOCIAL']);
                        $(form + ' #DIRECCION').text(dataProveedor['DIRECCION_FISCAL']);
                        $(form + ' #TIPO_DOC').text(dataProveedor['TIPO_DOCUMENTO']);
                        $(form + ' #RUC').text(dataProveedor['RUC_CLIENTE']);

                        fnObtenerListaContactos();
                    }
                },
                onError: function (error) { $.ShowError({ error: error }); }
            })
        };
        const fnBuscarProveedor = function () {
            $.GetData({
                title: 'Busqueda de proveedor',
                uriData: $.solver.baseUrl + '/Mantenimiento/BusquedaProveedor/',
                location: 'float',
                type: 'GET',
                isPage: true,
                onReady: function (objectBuscarProveedor, modalBuscarProveedor) {
                    $(modalBuscarProveedor).find('.modal-dialog').css({ 'max-width': '75%' });

                    const formBuscarProveedor = $(objectBuscarProveedor).find('form[name=frmBusquedaProveedor]');
                    const tableBuscarProveedor = $(objectBuscarProveedor).find('#tblBusquedaProveedor');
                    const btnCrearProveedor = $(objectBuscarProveedor).find('#btnCrearProveedor');
                    const btnAceptar = $(objectBuscarProveedor).find('#btnAceptar');
                    const actionElegir = function () {
                        const getselectedrowindexes = $(tableBuscarProveedor).jqxGrid('getselectedrowindexes');
                        if (getselectedrowindexes.length > 0) {
                            const c_proveedor = $(tableBuscarProveedor).jqxGrid('getrowdata', getselectedrowindexes[0])['C_PROVEEDOR'];
                            $(_controls.C_PROVEEDOR).val(c_proveedor);
                            fnObtenerProveedor();
                            bootbox.hideAll();
                        }
                    }

                    $(formBuscarProveedor).ValidForm({
                        type: -1,
                        onReady: function (form, controls) {
                            tableBuscarProveedor.jqxGrid('updatebounddata');
                        },
                        onError: function (error) { $.ShowError({ error: error }); }
                    });
                    $(tableBuscarProveedor).CreateGrid({
                        query: 'gbl_listarproveedores',
                        items: {
                            NOMBRE: function () { return $('#_buscar').val() || ''; },
                            C_EMPRESA: empresa
                        },
                        hiddens: ['C_PROVEEDOR', 'C_PARAMETRO_GENERAL_TIPO_DOCUMENTO'],
                        columns: {
                            'RUC_CLIENTE': { text: 'Nro Documento', width: 100 },
                            'RAZON_SOCIAL': { text: 'Razón Social', width: 250 },
                            'NOMBRE_COMERCIAL': { text: 'Nombre Comercial', width: 250 },
                            'DIRECCION_FISCAL': { text: 'Dirección Fiscal', width: 250 }
                        },
                        config: {
                            pageable: false,
                            sortable: false,
                            editable: false,
                            pageSize: 999999,
                            height: 600,
                            rendered: function () { $(tableBuscarProveedor).jqxGrid('selectrow', 0); }
                        }
                    });
                    $(tableBuscarProveedor).on("rowdoubleclick", function () {
                        actionElegir();
                        bootbox.hideAll();
                    });
                    $(btnCrearProveedor).click(function () {
                        $.GetData({
                            title: 'Registro de proveedor',
                            uriData: $.solver.baseUrl + '/Mantenimiento/ProveedoresRegistro/crear',
                            location: 'float',
                            type: 'GET',
                            isPage: true,
                            onReady: function (objectCrearProveedor, modalCrearProveedor) {
                                $(modalCrearProveedor).find('.modal-dialog').css({ 'max-width': '90%' });

                                $('form[name=frmRegistroProveedor] #C_PROVEEDOR').change(function () {
                                    $(objectCrearProveedor).find('.btn-save-cliente').remove();
                                    $(objectCrearProveedor).parent().parent().parent().find('.close').trigger('click');
                                });
                            },
                            onCloseModal: function () {
                                const c_proveedor = $('form[name=frmRegistroProveedor] #C_PROVEEDOR').val();
                                if (c_proveedor != '') {
                                    $(_controls.C_PROVEEDOR).val(c_proveedor);
                                    fnObtenerProveedor();
                                    $(objectBuscarProveedor).parent().parent().parent().find('.close').trigger('click');
                                }
                            }
                        });
                    });
                    $(btnAceptar).click(function () {
                        actionElegir();
                        bootbox.hideAll();
                    });
                },
                onCloseModal: function () {
                    estado = false;
                }
            });
        };

        const fnEscogerProducto = function (_object) {
            $.GetData({
                title: 'Escoger producto',
                uriData: $.solver.baseUrl + '/Procesos/EscogerProducto/',
                location: 'float',
                type: 'GET',
                isPage: true,
                onReady: function (object, modal) {
                    const actionElegir = function () {
                        const getselectedrowindex = $(object).find('#tableEscogerProducto').jqxGrid('getselectedrowindex');
                        var row = $(object).find('#tableEscogerProducto').jqxGrid('getrows')[getselectedrowindex];

                        $(_object).find('#C_PRODUCTO').val(row['C_PRODUCTO']);
                        $(_object).find('#PRODUCTO').val(row['NOMBRE_PARA_VENTA']);
                        $(_object).find('#NOMBRE_PARA_VENTA').val(row['NOMBRE_PARA_VENTA']);
                        $(_object).find('#C_PARAMETRO_GENERAL_TIPO_PRODUCTO').val(row['C_PARAMETRO_GENERAL_TIPO_PRODUCTO']);
                        $(_object).find('#AFECTACION_IGV').val(row['C_PARAMETRO_GENERAL_AFECTACION_IGV']);
                        $(_object).find('#CENTRO_COSTO').val(row['C_UNIDAD_NEGOCIO']);

                        $(_object).find('#C_UNIDAD_PRIN').val(row['C_UNIDAD_PRIN']);
                        $(_object).find('#UNIDAD_PRIN').val(row['UNIDAD_PRIN']);
                        $(_object).find('#C_UNIDAD_AUX').val(row['C_UNIDAD_AUX']);
                        $(_object).find('#UNIDAD_AUX').val(row['UNIDAD_AUX']);
                        $(_object).find('#FACTOR').val(row['FACTOR']);

                        if (row['C_PARAMETRO_GENERAL_TIPO_PRODUCTO'] == '07229') {
                            $(_object).find('#CANTIDAD').val(1);
                            $(_object).find('#CANTIDAD').removeAttr('readonly');
                            $('#PRECIO').focus();
                            $('#PRECIO').trigger('keyup');
                        }
                        else {
                            $(_object).find('#CANTIDAD').removeAttr('readonly');
                            $(_object).find('#CANTIDAD').val('');
                            $('#CANTIDAD').focus();
                            $('#CANTIDAD').trigger('keyup');
                        }

                        $(_object).find('#C_PARAMETRO_GENERAL_UNIDAD')
                            .attr('data-C_PRODUCTO', row['C_PRODUCTO'])
                            .FieldLoadRemote();

                        setTimeout(function () {
                            $(_object).find('#CANTIDAD').trigger('focus')
                        }, 300)
                        $(modal).modal('hide');

                        $.GetQuery({
                            query: ['q_gbl_obtener_ultimo_precio_compra_producto'],
                            items: [{
                                C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                                C_PRODUCTO: row['C_PRODUCTO']
                            }],
                            onReady: function (result) {
                                if (result.length != 0) {
                                    $(_object).find('#PRECIO').val(result[0]['PRECIO']);
                                }
                            }
                        })
                    }

                    $(modal).find('.modal-dialog').attr('style', 'max-width: 80% !important; margin-top: 4%');
                    $(object).find('form[name=frmEscogerProducto]').ValidForm({
                        type: -1,
                        onReady: function () {
                            $(object).find('#tableEscogerProducto').jqxGrid('updatebounddata')
                        },
                        onDone: function () {
                            $(object).find('#tableEscogerProducto').CreateGrid({
                                query: 'tbl_logistica_procesos_escogerproducto_listaproductos',
                                items: {
                                    C_EMPRESA: empresa,
                                    BUSCAR: function () {
                                        return $(object).find('#buscar').val();
                                    },
                                    MONEDA: function () {
                                        return ''
                                    }
                                },
                                hiddens: ['C_PARAMETRO_GENERAL_TIPO_PRODUCTO', 'C_PARAMETRO_GENERAL_AFECTACION_IGV', 'C_PRODUCTO_PRECIO', 'C_ARCHIVO_FOTO', 'C_UNIDAD_NEGOCIO',
                                    'C_UNIDAD_PRIN', 'C_UNIDAD_AUX', 'FACTOR'],
                                columns: {
                                    '_rowNum': {
                                        text: '#',
                                        width: 30,
                                        cellsAlign: 'center',
                                        hidden: false,
                                        pinned: true,
                                        editable: false,
                                        sortable: false
                                    },
                                    'C_PRODUCTO': {
                                        text: 'Código',
                                        width: '80'
                                    },
                                    'NOMBRE_PARA_VENTA': {
                                        text: 'Nombre artículo',
                                        width: 300
                                    },
                                    'UNIDAD_PRIN': {
                                        text: 'Und. prin',
                                        width: 100
                                    },
                                    'UNIDAD_AUX': {
                                        text: 'Und. aux',
                                        width: 100
                                    },
                                    'TIPO': {
                                        text: 'Tipo',
                                        width: 100
                                    },
                                },
                                config: {
                                    pageable: true,
                                    sortable: true,
                                    height: 510,
                                    pageSize: 100
                                }
                            });
                            $(object).find('#tableEscogerProducto').on('rowdoubleclick', function () {
                                actionElegir();
                            });
                        }
                    })
                },
                onCloseModal: function () {
                    $('#btnEscogerProducto').attr('disabled', false);
                }
            });
        };
        const fnBuscarProducto = function (indice) {
            $.GetData({
                title: 'Busqueda de productos',
                uriData: $.solver.baseUrl + '/Mantenimiento/BusquedaProductoOrdenCompra/',
                location: 'float',
                type: 'GET',
                isPage: true,
                onReady: function (objectBuscarProducto, modalBuscarProducto) {
                    $(modalBuscarProducto).find('.modal-dialog').css({ 'max-width': '75%' });
                    $(objectBuscarProducto).find('#btnEscogerProducto').click(function () {
                        $('#btnEscogerProducto').attr('disabled', true);
                        fnEscogerProducto(objectBuscarProducto);
                    });

                    const formBuscarProducto = $(objectBuscarProducto).find('form[name=frmBusquedaProducto]');

                    $(formBuscarProducto).ValidForm({
                        type: -1,
                        onDone: function (formBusquedaProducto, controlsBusquedaProducto) {
                            $(controlsBusquedaProducto.CENTRO_COSTO).attr('data-query', 'q_ventas_procesos_ventaregistro_obtenercentrocosto')
                            $(controlsBusquedaProducto.CENTRO_COSTO).attr('data-value', 'C_UNIDAD_NEGOCIO')
                            $(controlsBusquedaProducto.CENTRO_COSTO).attr('data-field', 'NOMBRE')
                            $(controlsBusquedaProducto.CENTRO_COSTO).attr('data-EMPRESA', empresa);
                            $(controlsBusquedaProducto.CENTRO_COSTO).FieldLoadRemote({
                                onReady: function () {
                                    if (indice != undefined) {
                                        const fila = $(table).jqxGrid('getrows')[indice];
                                        const c_producto = fila['C_PRODUCTO'];
                                        const nomProducto = fila['NOMBRE_ORIGINAL'];
                                        const descripcion = fila['DESCRIPCION'];
                                        const incluyeIgv = fila['INCLUYE_IGV'];
                                        const centro_costo = fila['C_UNIDAD_NEGOCIO'];
                                        const cantidad = fila['CANTIDAD'];
                                        const precio = parseFloat(fila['PRECIO']).toFixed(2);
                                        const c_tipo_producto = fila['C_PARAMETRO_GENERAL_TIPO_PRODUCTO'];
                                        const c_unidad = fila['C_UNIDAD_MEDIDA'];
                                        const unidadPrin = fila['UND_PRIN'];
                                        const cUnidadPrin = fila['C_UND_PRIN'];
                                        const unidadAux = fila['UND_AUX'];
                                        const cUnidadAux = fila['C_UND_AUX'];
                                        const factor = fila['FACTOR'];

                                        $(controlsBusquedaProducto.C_PRODUCTO).val(c_producto);
                                        $(controlsBusquedaProducto.NOMBRE_PARA_VENTA).val(nomProducto);
                                        $(controlsBusquedaProducto.PRODUCTO).val(nomProducto);
                                        $(controlsBusquedaProducto.DESCRIPCION).val(descripcion);
                                        $(controlsBusquedaProducto.CENTRO_COSTO).val(centro_costo);
                                        $(controlsBusquedaProducto.CHECK_IGV).attr('checked', incluyeIgv ? true : false);
                                        $(controlsBusquedaProducto.CANTIDAD).val(cantidad);
                                        $(controlsBusquedaProducto.PRECIO).val(precio);
                                        $(controlsBusquedaProducto.C_PARAMETRO_GENERAL_TIPO_PRODUCTO).val(c_tipo_producto);
                                        $(controlsBusquedaProducto.C_UNIDAD_PRIN).val(cUnidadPrin);
                                        $(controlsBusquedaProducto.UNIDAD_PRIN).val(unidadPrin);
                                        $(controlsBusquedaProducto.C_UNIDAD_AUX).val(cUnidadAux);
                                        $(controlsBusquedaProducto.UNIDAD_AUX).val(unidadAux);
                                        $(controlsBusquedaProducto.FACTOR).val(factor);
                                        $(controlsBusquedaProducto.C_PARAMETRO_GENERAL_UNIDAD).attr('data-C_PRODUCTO', c_producto);
                                        $(controlsBusquedaProducto.C_PARAMETRO_GENERAL_UNIDAD).FieldLoadRemote({
                                            onReady: function () {
                                                $(controlsBusquedaProducto.C_PARAMETRO_GENERAL_UNIDAD).val(c_unidad);
                                            }
                                        });
                                    }
                                    else {
                                        $(objectBuscarProducto).find('#btnEscogerProducto').trigger('click');
                                    }
                                }
                            });
                            $(objectBuscarProducto).find('.number-input').on('input', function () {
                                this.value = this.value.replace(/[^0-9]/g, '');
                            });
                        },
                        onReady: function (resultBusquedaProducto, controlsBusquedaProducto, objectBuscarProducto) {
                            const fila = $(table).jqxGrid('getrows')[indice];
                            const c_producto = $(controlsBusquedaProducto.C_PRODUCTO).val();

                            if (
                                ($(controlsBusquedaProducto.C_PARAMETRO_GENERAL_TIPO_PRODUCTO).val() != '07229') &&
                                ((indice == undefined && $(table).jqxGrid('getrows').filter(x => x['C_PRODUCTO'] == c_producto).length > 0) || (indice != undefined && (fila['C_PRODUCTO'] != c_producto && $(table).jqxGrid('getrows').filter(x => x['C_PRODUCTO'] == c_producto).length > 0)))
                            ) {
                                fnObtenerAlerta('No se puede agregar un mismo producto al detalle.');
                            }
                            else {
                                const descripcion = $(controlsBusquedaProducto.DESCRIPCION).val();
                                const cantidad = parseFloat($(controlsBusquedaProducto.CANTIDAD).val());
                                let precio = parseFloat($(controlsBusquedaProducto.PRECIO).val());
                                const nomProducto = $(controlsBusquedaProducto.NOMBRE_PARA_VENTA).val();
                                const nomProductoCompleto = $(controlsBusquedaProducto.NOMBRE_PARA_VENTA).val();
                                const unidadAuxiliar = $(controlsBusquedaProducto.UNIDAD_AUX).val();


                                let c_tipo_producto = $(controlsBusquedaProducto.C_PARAMETRO_GENERAL_TIPO_PRODUCTO).val();

                                const baseImponible = precio * cantidad;
                                const incluyeIgv = $(controlsBusquedaProducto.CHECK_IGV).is(':checked');
                                const porcDescuento = 0;
                                const afectacion_igv = $(controlsBusquedaProducto.AFECTACION_IGV).val();

                                var valorUnitario = 0;
                                var codigoAfectacionIgv = '01';
                                var codigoAfectacionIgvCab = 1
                                if (incluyeIgv && codigoAfectacionIgv == '01') valorUnitario = precio / 1.18;
                                else valorUnitario = precio;

                                const dsctoUnitario = valorUnitario * (porcDescuento / 100);
                                const valorVentaUnitario = valorUnitario - dsctoUnitario;
                                var igvUnitario = 0;
                                if (codigoAfectacionIgv == '01') igvUnitario = valorVentaUnitario * 0.18;
                                else igvUnitario = 0;

                                var dsctoUnitarioIgv = 0;
                                if (codigoAfectacionIgv == '01') dsctoUnitarioIgv = dsctoUnitario * 0.18;
                                else dsctoUnitarioIgv = 0;

                                const precioBase = valorVentaUnitario * cantidad;
                                const igv = igvUnitario * cantidad;
                                const precioTotal = igv + precioBase;
                                const dsctoParcial = (dsctoUnitario + dsctoUnitarioIgv) * cantidad;

                                const c_unidad = $(controlsBusquedaProducto.C_PARAMETRO_GENERAL_UNIDAD).val();
                                const unidad = $(controlsBusquedaProducto.C_PARAMETRO_GENERAL_UNIDAD)[0].args.data.filter(x => x['CODIGO'] == $(controlsBusquedaProducto.C_PARAMETRO_GENERAL_UNIDAD).val())[0].DESCRIPCION;
                                const c_unidad_negocio = $(controlsBusquedaProducto.CENTRO_COSTO).val();
                                const unidad_negocio = $(controlsBusquedaProducto.CENTRO_COSTO)[0].args.data.filter(x => x['C_UNIDAD_NEGOCIO'] == c_unidad_negocio)[0];

                                const c_unidadPrin = $(controlsBusquedaProducto.C_UNIDAD_PRIN).val();
                                const c_unidadAux = $(controlsBusquedaProducto.C_UNIDAD_AUX).val();
                                const unidadPrin = $(controlsBusquedaProducto.UNIDAD_PRIN).val();
                                const unidadAux = $(controlsBusquedaProducto.UNIDAD_AUX).val();

                                const factor = parseFloat($(controlsBusquedaProducto.FACTOR).val())

                                let stockPrin = 0;
                                let stockAux = 0;

                                if (c_unidad == c_unidadPrin) stockPrin = cantidad
                                else stockPrin = cantidad / factor

                                if (c_unidad == c_unidadPrin) stockAux = cantidad * factor
                                else stockAux = cantidad

                                if (indice != undefined) {

                                    $(table).jqxGrid('getrows')[indice]['IND_SERVICIO'] = (c_tipo_producto == '07229' ? '*' : '&');

                                    $(table).jqxGrid('getrows')[indice]['C_PRODUCTO'] = c_producto;
                                    $(table).jqxGrid('getrows')[indice]['NOMBRE_PARA_VENTA'] = nomProductoCompleto + (descripcion == '' ? '' : ' - ' + descripcion);
                                    $(table).jqxGrid('getrows')[indice]['NOMBRE_ORIGINAL'] = nomProducto;
                                    $(table).jqxGrid('getrows')[indice]['DESCRIPCION'] = descripcion;
                                    $(table).jqxGrid('getrows')[indice]['CANTIDAD'] = cantidad;
                                    $(table).jqxGrid('getrows')[indice]['PRECIO'] = precio;
                                    $(table).jqxGrid('getrows')[indice]['BASE_IMPONIBLE'] = baseImponible;
                                    $(table).jqxGrid('getrows')[indice]['INCLUYE_IGV'] = incluyeIgv;
                                    $(table).jqxGrid('getrows')[indice]['VALOR_UNITARIO'] = valorUnitario;
                                    $(table).jqxGrid('getrows')[indice]['PORC_DSCTO'] = porcDescuento;
                                    $(table).jqxGrid('getrows')[indice]['DSCTO_UNITARIO'] = dsctoUnitario;
                                    $(table).jqxGrid('getrows')[indice]['VALOR_VENTA_UNITARIO'] = valorVentaUnitario;
                                    $(table).jqxGrid('getrows')[indice]['AFECTACION_IGV'] = afectacion_igv;
                                    $(table).jqxGrid('getrows')[indice]['CODIGO_AFECTACION_IGV'] = codigoAfectacionIgv;
                                    $(table).jqxGrid('getrows')[indice]['CODIGO_AFECTACION_IGV_CABECERA'] = codigoAfectacionIgvCab;
                                    $(table).jqxGrid('getrows')[indice]['IGV_UNITARIO'] = igvUnitario;
                                    $(table).jqxGrid('getrows')[indice]['PRECIO_BASE'] = precioBase;
                                    $(table).jqxGrid('getrows')[indice]['IGV'] = igv;
                                    $(table).jqxGrid('getrows')[indice]['PRECIO_TOTAL'] = precioTotal;
                                    $(table).jqxGrid('getrows')[indice]['DSCTO_PARCIAL'] = dsctoParcial;
                                    $(table).jqxGrid('getrows')[indice]['DSCTO_UNITARIO_IGV'] = dsctoUnitarioIgv;

                                    $(table).jqxGrid('getrows')[indice]['CANTIDAD'] = cantidad;
                                    $(table).jqxGrid('getrows')[indice]['NOMBRE_UNIDAD_NEGOCIO'] = unidad_negocio['NOMBRE'];

                                    $(table).jqxGrid('getrows')[indice]['C_PARAMETRO_GENERAL_TIPO_PRODUCTO'] = c_tipo_producto;

                                    $(table).jqxGrid('getrows')[indice]['C_UNIDAD_MEDIDA'] = c_unidad;
                                    $(table).jqxGrid('getrows')[indice]['UNIDAD'] = unidad;
                                    $(table).jqxGrid('getrows')[indice]['C_UND_PRIN'] = c_unidadPrin;
                                    $(table).jqxGrid('getrows')[indice]['UND_PRIN'] = unidadPrin;
                                    $(table).jqxGrid('getrows')[indice]['C_UND_AUX'] = c_unidadAux;
                                    $(table).jqxGrid('getrows')[indice]['UND_AUX'] = unidadAux;
                                    $(table).jqxGrid('getrows')[indice]['STOCK_PRIN'] = stockPrin;
                                    $(table).jqxGrid('getrows')[indice]['STOCK_AUX'] = stockAux;
                                    $(table).jqxGrid('getrows')[indice]['FACTOR'] = factor;

                                    $(table).jqxGrid('refresh');
                                }
                                else {
                                    const objProducto = {
                                        _rowNum: $(table).jqxGrid('getrows').length + 1,
                                        C_EMPRESA: empresa,
                                        C_ORDEN_COMPRA: '',
                                        C_DETALLE: '',
                                        IND_SERVICIO: (c_tipo_producto == '07229' ? '*' : '&'),

                                        C_PRODUCTO: c_producto,
                                        NOMBRE_PARA_VENTA: nomProductoCompleto + (descripcion == '' ? '' : ' - ' + descripcion),
                                        NOMBRE_ORIGINAL: nomProducto,
                                        DESCRIPCION: descripcion,
                                        CANTIDAD: cantidad,
                                        C_UNIDAD_NEGOCIO: c_unidad_negocio,
                                        NOMBRE_UNIDAD_NEGOCIO: unidad_negocio['NOMBRE'],
                                        PRECIO: precio,
                                        BASE_IMPONIBLE: baseImponible,
                                        INCLUYE_IGV: incluyeIgv,
                                        VALOR_UNITARIO: valorUnitario,
                                        PORC_DSCTO: porcDescuento,
                                        DSCTO_UNITARIO: dsctoUnitario,
                                        VALOR_VENTA_UNITARIO: valorVentaUnitario,
                                        AFECTACION_IGV: afectacion_igv,
                                        CODIGO_AFECTACION_IGV: codigoAfectacionIgv,
                                        CODIGO_AFECTACION_IGV_CABECERA: codigoAfectacionIgvCab,
                                        IGV_UNITARIO: igvUnitario,
                                        PRECIO_BASE: precioBase,
                                        IGV: igv,
                                        PRECIO_TOTAL: precioTotal,
                                        DSCTO_PARCIAL: dsctoParcial,
                                        DSCTO_UNITARIO_IGV: dsctoUnitarioIgv,

                                        C_PARAMETRO_GENERAL_TIPO_PRODUCTO: c_tipo_producto,

                                        UNIDAD: unidad,
                                        C_UNIDAD_MEDIDA: c_unidad,
                                        UND_PRIN: unidadPrin,
                                        UND_AUX: unidadAux,
                                        C_UND_PRIN: c_unidadPrin,
                                        C_UND_AUX: c_unidadAux,
                                        STOCK_PRIN: stockPrin,
                                        STOCK_AUX: stockAux,
                                        FACTOR: factor
                                    }
                                    $(table).jqxGrid('addrow', null, objProducto);
                                }
                                bootbox.hideAll();
                            }
                        }
                    });
                },
                onCloseModal: function () {
                    estado = false;
                    var rows = $(table).jqxGrid('getrows');
                    var baseImponible = 0;
                    var total = 0;
                    var igv = 0;
                    $.each(rows, function (i, v) {
                        baseImponible += v['PRECIO_BASE'];
                        igv += v['IGV'];
                        total += v['PRECIO_TOTAL'];

                    });
                    $(_controls.BASE_IMPONIBLE).val(baseImponible);
                    $(_controls.IGV).val(igv);
                    $(_controls.TOTAL).val(total);
                    fnCalcularTotales();
                }
            });
        };

        const fnObtenerTipoCambio = function () {
            if ($(_controls.C_ORDEN_COMPRA).val() == '') {
                $.solver.fn.getTipoCambio({
                    fecha: function () {
                        return $(_controls.FECHA_EMISION).val()
                    },
                    onError: function (error) { $.ShowError({ error: error }); },
                    onReady: function (result) {
                        $(_controls.TC).val(result[0]['PRECIO_VENTA']);
                    }
                });
            }
        };
        const fnObtenerListaContactos = function () {
            $(_controls.CONTACTO).attr('data-query', 'q_logistica_procesos_nuevaordencompra_listaproveedor')
            $(_controls.CONTACTO).attr('data-value', 'C_PROVEEDOR_CONTACTO')
            $(_controls.CONTACTO).attr('data-field', 'NOMBRES')
            $(_controls.CONTACTO).attr('data-C_EMPRESA', empresa);
            $(_controls.CONTACTO).attr('data-C_PROVEEDOR', $(_controls.C_PROVEEDOR).val())
            $(_controls.CONTACTO).FieldLoadRemote({
                onReady: function () {
                    if ($(_controls.C_PROVEEDOR_CONTACTO).val() != '') {
                        $(_controls.CONTACTO).val($(_controls.C_PROVEEDOR_CONTACTO).val());
                    }
                }
            });
        }
        const fnBuscarPia = function () {
            $.GetData({
                title: 'Busqueda de pedido interno',
                uriData: $.solver.baseUrl + '/Procesos/BusquedaPedidoInterno',
                location: 'float',
                type: 'GET',
                isPage: true,
                onReady: function (objectBuscarProveedor, modalBuscarProveedor) {
                    $(modalBuscarProveedor).find('.modal-dialog').css({ 'max-width': '75%' });

                    const formBuscarPedido = $(objectBuscarProveedor).find('form[name=frmBusquedaPedido]');
                    const tableBuscarPedido = $(objectBuscarProveedor).find('#tblBusquedaPedido');

                    $(formBuscarPedido).ValidForm({
                        type: -1,
                        onReady: function (form, controls) {
                            tableBuscarPedido.jqxGrid('updatebounddata');
                        },
                        onDone: function () {
                            $(tableBuscarPedido).CreateGrid({
                                query: 'tbl_logistica_procesos_nuevaordencompra_buscarpiaspendientes',
                                items: {
                                    BUSCAR: function () { return $('#_buscar').val() || ''; },
                                    C_EMPRESA: empresa
                                },
                                hiddens: ['C_PROVEEDOR', 'C_PARAMETRO_GENERAL_TIPO_DOCUMENTO'],
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
                                    'C_PIA': { text: 'Código', width: 85 },
                                    'TIPO_DOC': { text: 'Tipo doc.', width: 150 },
                                    'NRO_COMPROBANTE': { text: 'Nro pedido', width: 95 },
                                    'FECHA_EMISION': { text: 'Fec. emisión', width: 90 },
                                    'NOMBRE_ALMACEN': { text: 'Almacen', width: 130 },
                                    'TIPO_TRANSACCION': { text: 'Tipo Trans.', width: 75 },
                                    'TOTAL': {
                                        text: 'Total', width: 100,
                                        cellsAlign: 'right',
                                        columnType: 'numberinput',
                                        cellsFormat: 'd2',
                                    }
                                },
                                config: {
                                    pageable: false,
                                    sortable: false,
                                    editable: false,
                                    pageSize: 999999,
                                    height: 600,
                                    rendered: function () { $(tableBuscarPedido).jqxGrid('selectrow', 0); }
                                }
                            });
                            $(tableBuscarPedido).on("rowdoubleclick", function () {
                                const getselectedrowindexes = $(tableBuscarPedido).jqxGrid('getselectedrowindexes');
                                if (getselectedrowindexes.length > 0) {
                                    const c_pia = $(tableBuscarPedido).jqxGrid('getrowdata', getselectedrowindexes[0])['C_PIA'];
                                    $(_controls.C_PIA).val(c_pia);
                                    fnObtenerPia();
                                    fnObtenerDetallePia();
                                    bootbox.hideAll();
                                }
                            });
                        },
                        onError: function (error) { $.ShowError({ error: error }); }
                    });
                },
                onCloseModal: function () {
                    estado = false;
                }
            });
        }
        const fnObtenerPia = function () {
            $.GetQuery({
                query: ['q_logistica_procesos_nuevaordencompra_obtenerpia'],
                items: [{
                    C_EMPRESA: empresa,
                    C_PIA: function () {
                        return $(_controls.C_PIA).val();
                    }
                }],
                onReady: function (result) {
                    if (result.length > 0) {
                        $(_controls.PIA_REF).val(result[0].DOC);
                        $(_controls.C_ALMACEN).val(result[0].C_ALMACEN_SOL).trigger('change');
                        $(_controls.C_TIPO_TRANSACCION).val(result[0].C_TIPO_TRANSACCION).trigger('change');
                        $(_controls.OBS_ADICIONAL).val(result[0].OBS_ADICIONAL);
                    }
                },
                onError: function (error) { $.ShowError({ error: error }); }
            })
        }
        const fnObtenerDetallePia = function () {
            $.GetQuery({
                query: ['tbl_logistica_procesos_nuevaordencompra_obtenerpiadetalle'],
                items: [{
                    C_EMPRESA: empresa,
                    C_PIA: function () {
                        return $(_controls.C_PIA).val();
                    }
                }],
                onReady: function (result) {
                    $.each($(table).jqxGrid('getrows'), function (i, v) {
                        arrEliminadas.push(v);
                    });

                    $(table).jqxGrid('clear');
                    $(table).jqxGrid('addrow', null, result);
                }
            })
        }
        const fnValidarConfiguracion = function () {
            $.GetQuery({
                query: ['q_gbl_validar_configuracion'],
                items: [{
                    C_EMPRESA: empresa,
                    VENTANA: 'ORDENCOMPRA'
                }],
                onError: function (error) {
                    $.CloseStatusBar();
                    $.ShowError({ error });
                },
                onReady: function (result) {
                    var validacion = result[0].MENSAJE;

                    if (validacion == 'ALMACEN') {
                        alertify.alert('Mensaje del sistema', result[0].TEXTOMENSAJE, function () {
                            document.location = $.solver.baseUrl + '/Mantenimiento/Configuraciones';
                        });
                    }

                    if (validacion == 'PRODUCTO') {
                        alertify.alert('Mensaje del sistema', result[0].TEXTOMENSAJE, function () {
                            document.location = $.solver.baseUrl + '/Mantenimiento/Productos';
                        });
                    }

                    if (validacion == 'CENTROCOSTO') {
                        alertify.alert('Mensaje del sistema', result[0].TEXTOMENSAJE, function () {
                            document.location = $.solver.baseUrl + '/Mantenimiento/Configuraciones';
                        });
                    }
                }
            });
        }

        $(form).ValidForm({
            table: 'LOG.ORDEN_COMPRA',
            type: 1,
            querySave: true,
            extras: {
                C_ORDEN_COMPRA: {
                    action: {
                        name: 'GetNextId',
                        args: $.ConvertObjectToArr({
                            max_length: '10',
                            columns: 'C_EMPRESA'
                        })
                    }
                }
            },
            onSubmit: function (form, controls) {
                if ($(controls.C_PROVEEDOR).val() == '') {
                    alertify.warning('Por favor seleccione el proveedor.');
                    return false;
                }
                else if ($(table).jqxGrid('getrows').length == 0) {
                    alertify.warning('Por favor agregue items al detalle.');
                    return false;
                }
                else return true;
            },
            onDetail: function (form, controls, token) {
                var rows = $(table).jqxGrid('getrows');
                var inserts = $(table).jqxGrid('getrows').filter(x => x['C_DETALLE'] == '');
                var update = $(table).jqxGrid('getrows').filter(x => x['C_DETALLE'] != '');
                $.each(inserts, function (i, detalle) {
                    var type = 1;
                    var objDetalle = {
                        C_EMPRESA: empresa,
                        C_ORDEN_COMPRA: '',
                        C_DETALLE: '',
                        C_PRODUCTO: detalle['C_PRODUCTO'],
                        C_UNIDAD_NEGOCIO: detalle['C_UNIDAD_NEGOCIO'],

                        DESCRIPCION: detalle['DESCRIPCION'],
                        CANTIDAD: detalle['CANTIDAD'],
                        PRECIO: detalle['PRECIO'],

                        BASE_IMPONIBLE: detalle['BASE_IMPONIBLE'],
                        INCLUYE_IGV: ((detalle['INCLUYE_IGV'] == true || detalle['INCLUYE_IGV'] == 'true') ? '*' : '&'),
                        VALOR_UNITARIO: detalle['VALOR_UNITARIO'],
                        VALOR_VENTA_UNITARIO: detalle['VALOR_VENTA_UNITARIO'],
                        IGV_UNITARIO: detalle['IGV_UNITARIO'],
                        PRECIO_BASE: detalle['PRECIO_BASE'],
                        IGV: detalle['IGV'],
                        PRECIO_TOTAL: detalle['PRECIO_TOTAL'],

                        IND_ESTADO: '*',
                        IND_SERVICIO: detalle['IND_SERVICIO'],

                        C_UNIDAD_MEDIDA: detalle['C_UNIDAD_MEDIDA']
                    };
                    var extDetalle = {
                        C_ORDEN_COMPRA: {
                            action: {
                                name: 'GetParentId',
                                args: $.ConvertObjectToArr({
                                    token: token,
                                    column: 'C_ORDEN_COMPRA'
                                })
                            }
                        },
                        C_DETALLE: {
                            action: {
                                name: 'GetNextId',
                                args: $.ConvertObjectToArr({
                                    columns: 'C_EMPRESA,C_ORDEN_COMPRA',
                                    max_length: 10
                                })
                            }
                        }
                    };
                    $.AddPetition({
                        table: 'LOG.ORDEN_COMPRA_DETALLE',
                        type: type,
                        items: $.ConvertObjectToArr(objDetalle, extDetalle)
                    });
                });

                $.each(update, function (i, detalle) {
                    var type = 2;
                    var condition = `C_EMPRESA = '${empresa}' AND C_ORDEN_COMPRA = '${detalle['C_ORDEN_COMPRA']}' AND C_DETALLE = '${detalle['C_DETALLE']}'`;
                    var objDetalle = {
                        C_EMPRESA: empresa,
                        C_ORDEN_COMPRA: detalle['C_ORDEN_COMPRA'],
                        C_DETALLE: detalle['C_DETALLE'],
                        C_PRODUCTO: detalle['C_PRODUCTO'],
                        C_UNIDAD_NEGOCIO: detalle['C_UNIDAD_NEGOCIO'],

                        DESCRIPCION: detalle['DESCRIPCION'],
                        CANTIDAD: detalle['CANTIDAD'],
                        PRECIO: detalle['PRECIO'],

                        BASE_IMPONIBLE: detalle['BASE_IMPONIBLE'],
                        INCLUYE_IGV: ((detalle['INCLUYE_IGV'] == true || detalle['INCLUYE_IGV'] == 'true') ? '*' : '&'),
                        VALOR_UNITARIO: detalle['VALOR_UNITARIO'],
                        VALOR_VENTA_UNITARIO: detalle['VALOR_VENTA_UNITARIO'],
                        IGV_UNITARIO: detalle['IGV_UNITARIO'],
                        PRECIO_BASE: detalle['PRECIO_BASE'],
                        IGV: detalle['IGV'],
                        PRECIO_TOTAL: detalle['PRECIO_TOTAL'],

                        IND_ESTADO: '*',
                        IND_SERVICIO: detalle['IND_SERVICIO'],
                        C_UNIDAD_MEDIDA: detalle['C_UNIDAD_MEDIDA']
                    };
                    $.AddPetition({
                        table: 'LOG.ORDEN_COMPRA_DETALLE',
                        type: type,
                        condition: condition,
                        items: $.ConvertObjectToArr(objDetalle)
                    });
                });

                if ($(controls.PIA_REF) != '') {
                    $.AddPetition({
                        table: 'LOG.PEDIDO_INTERNO',
                        type: 2,
                        condition: `C_EMPRESA = '${empresa}' AND C_PIA = '${$(controls.C_PIA).val()}'`,
                        items: $.ConvertObjectToArr({
                            C_EMPRESA: empresa,
                            C_PIA: $(controls.C_PIA).val(),
                            IND_ESTADO: 'G'
                        })
                    });
                }

                if (arrEliminadas.length > 0) {
                    $.each(arrEliminadas, function (i, eliminado) {
                        const c_detalle = eliminado.C_DETALLE;
                        if (c_detalle != '') {
                            const objEli = {
                                C_EMPRESA: empresa,
                                C_ORDEN_COMPRA: eliminado.C_ORDEN_COMPRA,
                                C_DETALLE: eliminado.C_DETALLE,
                                IND_ESTADO: 'E'
                            };
                            $.AddPetition({
                                table: 'LOG.ORDEN_COMPRA_DETALLE',
                                type: 2,
                                condition: `C_EMPRESA = '${empresa}' AND C_ORDEN_COMPRA = '${eliminado['C_ORDEN_COMPRA']}' AND C_DETALLE = '${eliminado['C_DETALLE']}'`,
                                items: $.ConvertObjectToArr(objEli)
                            });
                        }
                    });
                }
            },
            onReady: function (result) {
                alertify.success('Se registró la información.');
                document.location = $.solver.baseUrl + '/Procesos/RegistroOrdenCompra';
            },
            onDone: function (_, controls) {
                fnValidarConfiguracion();
                _controls = controls;

                $(controls.C_EMPRESA).val(empresa);

                if ($(controls.C_ORDEN_COMPRA).val() != '') {
                    $(controls.FECHA_EMISION).val(moment($(controls.FECHA_EMISION).val()).format('DD/MM/YYYY'));
                    $(controls.FECHA_ENTREGA).val(moment($(controls.FECHA_ENTREGA).val()).format('DD/MM/YYYY'));
                    fnObtenerProveedor();
                    $(controls.IND_ESTADO_COMPRA).val('M');
                    $(form + ' #NUM_ORDEN_COMPRA').val('O/C N° ' + $(controls.C_ORDEN_COMPRA).val())

                    if ($(controls.C_ARCHIVO_PDF_ORDEN_COMPRA).val() != '') {
                        $(form + ' #btnVerPdf').show();
                    }
                    //fnObtenerListaContactos();
                }
                if ($(controls.C_PIA).val() != '') {
                    fnObtenerPia();
                }

                $(controls.FECHA_EMISION).datetimepicker({
                    format: 'DD/MM/YYYY',
                    locale: 'es'
                }).on('dp.change', function () { fnObtenerTipoCambio(); });
                $(controls.FECHA_ENTREGA).datetimepicker({
                    format: 'DD/MM/YYYY',
                    locale: 'es'
                });
                $(controls.CONTACTO).change(function () {
                    $(controls.C_PROVEEDOR_CONTACTO).val($(controls.CONTACTO).val());
                });

                fnObtenerDatosEmpresa();
                fnCrearTabla();
                fnObtenerTipoCambio();

                $(form + ' #btnBusquedaProveedor').click(function () {
                    if (!estado) {
                        estado = true;
                        fnBuscarProveedor();
                    }
                });
                $(form + ' #btnBusquedaProducto').click(function () {
                    if (!estado) {
                        estado = true;
                        fnBuscarProducto();
                    }
                });
                $(form + ' #btnVerPdf').click(function () {
                    const c_archivo = $(controls.C_ARCHIVO_PDF_ORDEN_COMPRA).val();
                    window.open(direccionServicio + 'Service/ViewFile/' + c_archivo);
                });
                //$(form + ' #btnAtras').click(function (e) {
                //    e.preventDefault();
                //    document.location = $.solver.baseUrl + '/Procesos/RegistroOrdenCompra/';
                //});
                $(form + ' #btnBuscarPia').click(function (e) {
                    if (!estado) {
                        estado = true;
                        fnBuscarPia();
                    }
                })
            },
            onError: function (error) {
                $.CloseStatusBar();
                $.ShowError({ error: error });
            }
        })

    });
});