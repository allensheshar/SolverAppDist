require(["helper", "extras", "datetimepicker", "bootstrap-select"], function () {
    require(["alertify", "bootbox", "moment"], function (alertify, bootbox, moment) {
        alertify.set('notifier', 'position', 'top-center');

        const empresa = $.solver.session.SESSION_EMPRESA;
        const table = '#tblDetalle';
        const form = 'form[name=frmCompra]';
        let estado = false;
        let arrEliminadas = [];
        let _controls;

        $('.c_empresa').attr('data-empresa', empresa);

        const fnObtenerAlerta = function (message) {
            alertify.alert().setting({
                'title': 'Mensaje del Sistema',
                'message': message,
            }).show();
        };
        const fnBuscarProducto = function (indice) {
            $.GetData({
                title: '<strong>BUSQUEDA DE PRODUCTO</strong>',
                uriData: $.solver.baseUrl + '/Mantenimiento/BusquedaProductoGuia/',
                location: 'float',
                type: 'GET',
                isPage: true,
                onReady: function (objectBuscarProducto, modalBuscarProducto) {
                    $(modalBuscarProducto).find('.modal-dialog').css({ 'max-width': '60%' });

                    const formBuscarProducto = $(objectBuscarProducto).find('form[name=frmBusquedaProducto]');

                    $(formBuscarProducto).ValidForm({
                        type: -1,
                        onDone: function (formBusquedaProducto, controlsBusquedaProducto) {
                            $(controlsBusquedaProducto.PRODUCTO).attr('data-query', 'cb_logistica_mantenimiento_busquedaproductoordencompra_obteneritems');
                            $(controlsBusquedaProducto.PRODUCTO).attr('data-value', 'C_PRODUCTO');
                            $(controlsBusquedaProducto.PRODUCTO).attr('data-field', 'NOMBRE_PARA_VENTA');
                            $(controlsBusquedaProducto.PRODUCTO).attr('data-C_EMPRESA', empresa);
                            $(controlsBusquedaProducto.PRODUCTO).FieldLoadRemote({
                                onReady: function () {
                                    $(controlsBusquedaProducto.PRODUCTO).selectpicker();
                                    $(controlsBusquedaProducto.CENTRO_COSTO).attr('data-query', 'q_ventas_procesos_ventaregistro_obtenercentrocosto');
                                    $(controlsBusquedaProducto.CENTRO_COSTO).attr('data-value', 'C_UNIDAD_NEGOCIO');
                                    $(controlsBusquedaProducto.CENTRO_COSTO).attr('data-field', 'NOMBRE');
                                    $(controlsBusquedaProducto.CENTRO_COSTO).attr('data-EMPRESA', empresa);
                                    $(controlsBusquedaProducto.CENTRO_COSTO).FieldLoadRemote({
                                        onReady: function () {
                                            if (indice != undefined) {
                                                const fila = $(table).jqxGrid('getrows')[indice];
                                                const c_producto = fila['C_PRODUCTO'];
                                                const centro_costo = fila['C_UNIDAD_NEGOCIO'];
                                                const cantidad = parseFloat(fila['CANTIDAD']);
                                                const descripcion = fila['DESCRIPCION']
                                                $(controlsBusquedaProducto.PRODUCTO).val(c_producto).trigger('change');
                                                $(controlsBusquedaProducto.CENTRO_COSTO).val(centro_costo);
                                                $(controlsBusquedaProducto.CANTIDAD).val(cantidad);
                                                $(controlsBusquedaProducto.DESCRIPCION).val(descripcion);
                                            }
                                        }
                                    });
                                }
                            });

                            $(formBusquedaProducto).find('#btnGuardar').click(function (e) {
                                const fila = $(tblDetalle).jqxGrid('getrows')[indice];
                                const c_producto = $(controlsBusquedaProducto.PRODUCTO).val();
                                if (c_producto == '') {
                                    fnObtenerAlerta('Por favor seleccione un producto');
                                }
                                else if (
                                    // Si es nuevo 
                                    (indice == undefined && $(table).jqxGrid('getrows').filter(x => x['C_PRODUCTO'] == c_producto).length > 0)
                                    ||
                                    // Si es editar
                                    (indice != undefined && (fila['C_PRODUCTO'] != c_producto && $(table).jqxGrid('getrows').filter(x => x['C_PRODUCTO'] == c_producto).length > 0))) {
                                    fnObtenerAlerta('No se puede agregar un mismo producto al detalle.');
                                }
                                else if ($(controlsBusquedaProducto.CANTIDAD).val() == '') {
                                    fnObtenerAlerta('Por favor ingrese una cantidad.');
                                }
                                else if ($(controlsBusquedaProducto.CENTRO_COSTO).val() == '') {
                                    fnObtenerAlerta('Por favor ingrese el centro de costo.');
                                }
                                else {
                                    
                                    const producto = $(controlsBusquedaProducto.PRODUCTO)[0].args.data.filter(x => x['C_PRODUCTO'] == c_producto)[0];
                                    const c_unidad_negocio = $(controlsBusquedaProducto.CENTRO_COSTO).val();
                                    const unidad_negocio = $(controlsBusquedaProducto.CENTRO_COSTO)[0].args.data.filter(x => x['C_UNIDAD_NEGOCIO'] == c_unidad_negocio)[0];
                                    const cantidad = parseFloat($(controlsBusquedaProducto.CANTIDAD).val().replace('.', ''));
                                    const descripcion = $(controlsBusquedaProducto.DESCRIPCION).val();

                                    if (indice != undefined) {
                                        $(table).jqxGrid('getrows')[indice]['C_UNIDAD_NEGOCIO'] = c_unidad_negocio;
                                        $(table).jqxGrid('getrows')[indice]['C_PRODUCTO'] = c_producto;
                                        $(table).jqxGrid('getrows')[indice]['NOMBRE_PARA_VENTA'] = producto['NOMBRE_PARA_VENTA'] + (descripcion == '' ? '' : ' - ' + descripcion);
                                        $(table).jqxGrid('getrows')[indice]['DESCRIPCION'] = descripcion;
                                        $(table).jqxGrid('getrows')[indice]['CANTIDAD'] = cantidad;
                                        $(table).jqxGrid('getrows')[indice]['NOMBRE_UNIDAD_NEGOCIO'] = unidad_negocio['NOMBRE'];

                                        $(table).jqxGrid('refresh');
                                    }
                                    else {
                                        $(table).jqxGrid('addrow', null, {
                                            _rowNum: $(table).jqxGrid('getrows').length + 1,
                                            C_DETALLE: '',
                                            C_COMPRA: '',
                                            C_EMPRESA: empresa,
                                            C_UNIDAD_NEGOCIO: unidad_negocio['C_UNIDAD_NEGOCIO'],
                                            C_PRODUCTO: c_producto,
                                            NOMBRE_PARA_VENTA: producto['NOMBRE_PARA_VENTA'] + (descripcion == '' ? '' : ' - ' + descripcion),
                                            DESCRIPCION: descripcion,
                                            CANTIDAD: cantidad,
                                            NOMBRE_UNIDAD_NEGOCIO: unidad_negocio['NOMBRE']
                                        });
                                    }
                                    bootbox.hideAll();
                                }
                                e.preventDefault();
                            });
                            $(objectBuscarProducto).find('.number-input').on('input', function () {
                                this.value = this.value.replace(/[^0-9]/g, '');
                            });
                        },
                    });
                },
                onCloseModal: function () {
                    estado = false;
                }
            });
        };
        const fnObtenerTipoCambio = function () {
            if ($(_controls.C_COMPRA).val() == '') {
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
        const fnCrearTabla = function () {
            const fnBorrarProducto = function (indice) {
                alertify.confirm('Mensaje del sistema', '¿Estas seguro de eliminar el producto?',
                    function () {
                        const fila = $(tblDetalle).jqxGrid('getrows')[indice]
                        arrEliminadas.push(fila);
                        const rowid = $(tblDetalle).jqxGrid('getrowid', indice)
                        $(tblDetalle).jqxGrid('deleterow', rowid);
                    },
                    function () { alertify.error('Operación cancelada'); }
                ).set('labels', { ok: 'Si', cancel: 'No' }).set('defaultFocus', 'ok').set('closable', false);
            };
            const fnEditarProducto = function (indice) {
                fnBuscarProducto(indice);
            }
            $(table).CreateGrid({
                query: 'tbl_logistica_procesos_nuevaguia_obtenerdetalle',
                items: {
                    C_COMPRA: function () { return $(_controls.C_COMPRA).val(); },
                    C_EMPRESA: empresa
                },
                hiddens: ['C_DETALLE', 'C_COMPRA', 'C_EMPRESA', 'C_UNIDAD_NEGOCIO', 'DESCRIPCION'],
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
                        width: 100
                    },
                    'NOMBRE_PARA_VENTA': {
                        text: 'Producto',
                        width: 250
                    },
                    'CANTIDAD': {
                        text: 'Cantidad',
                        width: 100,
                        cellsAlign: 'right',
                        columnType: 'numberinput'
                    },
                    'NOMBRE_UNIDAD_NEGOCIO': {
                        text: 'Unidad de negocio',
                        width: 150
                    },
                    'ACCIONES': {
                        text: 'Acciones',
                        width: 120,
                        createwidget: function (row, column, value, htmlElement) {
                            $(tblDetalle).jqxGrid('refresh');
                        },
                        initwidget: function (rowIndex, column, value, htmlElement) {
                            $(htmlElement).html('');
                            $(htmlElement).addClass('jqx-grid-cell-middle-align');
                            $(htmlElement).addClass('mt-1');

                            let _btnEditar;
                            _btnEditar = $(`<a id="editar" style="cursor: pointer;" class="jqx-grid-widget">&nbsp;Editar</a>`);
                            $(htmlElement).append(_btnEditar);
                            $(htmlElement).find('a#editar').unbind('click');
                            $(htmlElement).find('a#editar').click(function () {
                                fnEditarProducto(rowIndex);
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
                    selectionmode: 'none'
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
                    //$('#RUC_EMPRESA').text('RUC N° ' + data['NRO_DOCUMENTO']);
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
                    }
                },
                onError: function (error) { $.ShowError({ error: error }); }
            });
        };
        const fnBuscarProveedor = function () {
            $.GetData({
                title: '<strong>BUSQUEDA DE PROVEEDOR</strong>',
                uriData: $.solver.baseUrl + '/Mantenimiento/BusquedaProveedor/',
                location: 'float',
                type: 'GET',
                isPage: true,
                onReady: function (objectBuscarProveedor, modalBuscarProveedor) {
                    $(modalBuscarProveedor).find('.modal-dialog').css({ 'max-width': '60%' });

                    const formBuscarProveedor = $(objectBuscarProveedor).find('form[name=frmBusquedaProveedor]');
                    const tableBuscarProveedor = $(objectBuscarProveedor).find('#tblBusquedaProveedor');
                    const btnCrearProveedor = $(objectBuscarProveedor).find('#btnCrearProveedor');

                    $(formBuscarProveedor).ValidForm({
                        type: -1,
                        onReady: function (form, controls) { tableBuscarProveedor.jqxGrid('updatebounddata'); },
                        onDone: function () {
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
                                const getselectedrowindexes = $(tableBuscarProveedor).jqxGrid('getselectedrowindexes');
                                if (getselectedrowindexes.length > 0) {
                                    const c_proveedor = $(tableBuscarProveedor).jqxGrid('getrowdata', getselectedrowindexes[0])['C_PROVEEDOR'];
                                    $(_controls.C_PROVEEDOR).val(c_proveedor);
                                    fnObtenerProveedor();
                                    bootbox.hideAll();
                                }
                            });
                            $(btnCrearProveedor).click(function () {
                                $.GetData({
                                    title: '<strong>REGISTRO DE PROVEEDOR</strong>',
                                    uriData: $.solver.baseUrl + '/Mantenimiento/ProveedoresRegistro/crear',
                                    location: 'float',
                                    type: 'GET',
                                    isPage: true,
                                    onReady: function (objectCrearProveedor, modalCrearProveedor) {
                                        $(modalCrearProveedor).find('.modal-dialog').css({ 'max-width': '90%' });

                                        $('form[name=frmRegistroProveedor] #C_PROVEEDOR').change(function () {
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
                        },
                        onError: function (error) { $.ShowError({ error: error }); }
                    });
                },
                onCloseModal: function () { estado = false; }
            });
        };
        const fnBuscarOrdenCompra = function () {
            $.GetData({
                title: '<strong>BUSQUEDA DE ORDENES DE COMPRA</strong>',
                uriData: $.solver.baseUrl + '/Procesos/BusquedaOrdenCompra/',
                location: 'float',
                type: 'GET',
                isPage: true,
                onReady: function (objectBuscarOc, modalBuscarOc) {
                    $(modalBuscarOc).find('.modal-dialog').css({ 'max-width': '60%' });

                    const formBuscarOrdenCompra = $(objectBuscarOc).find('form[name=frmBusquedaOrdenCompra]');
                    const tableBuscarOrdenCompra = $(objectBuscarOc).find('#table');

                    $(formBuscarOrdenCompra).ValidForm({
                        type: -1,
                        onReady: function (form, controls) { tableBuscarOrdenCompra.jqxGrid('updatebounddata'); },
                        onDone: function () {
                            $(tableBuscarOrdenCompra).CreateGrid({
                                query: 'tbl_logistica_procesos_buscarordencompra_listaordencompra',
                                columns: {
                                    'CODIGO': { text: 'Código', width: 120 },
                                    'RUC_CLIENTE': { text: 'Doc. Proveedor', width: 100 },
                                    'RAZON_SOCIAL': { text: 'Nom. Proveedor', width: 330 },
                                    'NOMBRE': { text: 'Centro costo', width: 90 },
                                    'NOMBRE_ALMACEN': { text: 'Almacen', width: 130 },
                                    'DESCRIPCION_PARAMETRO': { text: 'Moneda', width: 90 },
                                    'TOTAL_A_PAGAR': { text: 'Total', width: 90 },
                                },
                                hiddens: ['C_ORDEN_COMPRA', 'C_PARAMETRO_GENERAL_MONEDA', 'C_PROVEEDOR', 'OBS_ADICIONAL', 'C_ALMACEN'],
                                items: { C_EMPRESA: empresa, BUSCAR: function () { return $('#_buscar').val(); }, FLAG_COMPRA: '', FLAG_GUIA: '&' },
                                config: {
                                    virtualmode: false,
                                    height: 500,
                                    pageSize: 999999,
                                    pageable: false,
                                    sortable: false,
                                    editable: false,
                                }
                            });
                            $(tableBuscarOrdenCompra).on('bindingcomplete', function () { $(tableBuscarOrdenCompra).jqxGrid('selectrow', 0); });
                            $(tableBuscarOrdenCompra).on('rowdoubleclick', function (event) {
                                const getselectedrowindexes = $(tableBuscarOrdenCompra).jqxGrid('getselectedrowindexes');
                                if (getselectedrowindexes.length > 0) {
                                    var row = $(tableBuscarOrdenCompra).jqxGrid('getrowdata', getselectedrowindexes[0]);

                                    $.GetQuery({
                                        query: ['q_logistica_procesos_nuevacompra_obtenerdetalleordendecompra_guia'],
                                        items: [{
                                            C_EMPRESA: empresa,
                                            C_ORDEN_COMPRA: row['C_ORDEN_COMPRA']
                                        }],
                                        onReady: function (result) {
                                            $(table).jqxGrid('clear');
                                            $(table).jqxGrid('addrow', null, result);
                                            $(_controls.REF_ORDEN_COMPRA).val(row['C_ORDEN_COMPRA']).trigger('change');
                                            $(_controls.C_PROVEEDOR).val(row['C_PROVEEDOR']);
                                            $(_controls.OBS_ADICIONAL).val(row['OBS_ADICIONAL']);
                                            $(_controls.OBS_IMPRIMIR).val(row['OBS_IMPRIMIR']);
                                            fnObtenerProveedor();
                                            bootbox.hideAll();
                                        }
                                    })
                                }
                            });
                        },
                        onError: function (error) { $.ShowError({ error: error }); }
                    });
                },
                onCloseModal: function () { estado = false; }
            });
        };
        const fnObtenerCompra = function () {
            $.GetQuery({
                query: ['q_logistica_procesos_nuevaguia_obtenernrocompraadjunta'],
                items: [{
                    C_COMPRA: function () {
                        return $(_controls.C_COMPRA).val();
                    },
                    C_EMPRESA: empresa
                }],
                onReady: function (result) {
                    if (result.length > 0) {
                        $(_controls.NRO_COMPROBANTE_COMPRA).val(result[0].NRO_COMPROBANTE);
                    }
                }
            })
        }
        const fnBuscarCompra = function () {
            $.GetData({
                title: '<strong>BUSQUEDA DE COMPRA</strong>',
                uriData: $.solver.baseUrl + '/Procesos/BusquedaOrdenCompra/',
                location: 'float',
                type: 'GET',
                isPage: true,
                onReady: function (objectBuscarOc, modalBuscarOc) {
                    $(modalBuscarOc).find('.modal-dialog').css({ 'max-width': '60%' });

                    const formBuscarOrdenCompra = $(objectBuscarOc).find('form[name=frmBusquedaOrdenCompra]');
                    const tableBuscarOrdenCompra = $(objectBuscarOc).find('#table');

                    $(formBuscarOrdenCompra).ValidForm({
                        type: -1,
                        onReady: function (form, controls) { tableBuscarOrdenCompra.jqxGrid('updatebounddata'); },
                        onDone: function () {
                            $(tableBuscarOrdenCompra).CreateGrid({
                                query: 'tbl_logistica_procesos_nuevaguia_obtenercompras',
                                columns: {
                                    'C_COMPRA': { text: 'Código', width: 120 },
                                    'DESCRIPCION_PARAMETRO': { text: 'Tipo documento', width: 100 },
                                    'RAZON_SOCIAL': { text: 'Nom. proveedor', width: 330 },
                                    'NRO_COMPROBANTE': { text: 'Nro comprobante', width: 90 },
                                    'TOTAL': { text: 'Total', width: 130 },
                                    'FECHA_EMISION': { text: 'Fecha emisión', width: 90 },
                                    'PERIODO': { text: 'Periodo', width: 90 },
                                },
                                hiddens: ['C_PROVEEDOR'],
                                items: { C_EMPRESA: empresa, BUSCAR: function () { return $('#_buscar').val(); } },
                                config: {
                                    virtualmode: false,
                                    height: 500,
                                    pageSize: 999999,
                                    pageable: false,
                                    sortable: false,
                                    editable: false,
                                }
                            });
                            $(tableBuscarOrdenCompra).on('bindingcomplete', function () { $(tableBuscarOrdenCompra).jqxGrid('selectrow', 0); });
                            $(tableBuscarOrdenCompra).on('rowdoubleclick', function (event) {
                                const getselectedrowindexes = $(tableBuscarOrdenCompra).jqxGrid('getselectedrowindexes');
                                if (getselectedrowindexes.length > 0) {
                                    var row = $(tableBuscarOrdenCompra).jqxGrid('getrowdata', getselectedrowindexes[0]);
                                    $(_controls.REF_C_COMPRA).val(row.C_COMPRA);
                                    $(_controls.NRO_COMPROBANTE_COMPRA).val(row.NRO_COMPROBANTE);
                                    bootbox.hideAll();
                                }
                            });
                        },
                        onError: function (error) { $.ShowError({ error: error }); }
                    });
                },
                onCloseModal: function () { estado = false; }
            });
        };

        $(form).ValidForm({
            table: 'LOG.COMPRA',
            type: 1,
            querySave: true,
            extras: {
                C_COMPRA: {
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
                var inserts = $(table).jqxGrid('getrows').filter(x => x['C_DETALLE'] == '');
                var update = $(table).jqxGrid('getrows').filter(x => x['C_DETALLE'] != '');

                $.each(inserts, function (i, detalle) {
                    var type = 1;
                    var objDetalle = {
                        C_EMPRESA: empresa,
                        C_COMPRA: '',
                        C_DETALLE: '',
                        C_UNIDAD_NEGOCIO: detalle['C_UNIDAD_NEGOCIO'],
                        DESCRIPCION: detalle['DESCRIPCION'],
                        C_PRODUCTO: detalle['C_PRODUCTO'],
                        CANTIDAD: detalle['CANTIDAD'],
                        IND_ESTADO: '*'
                    };
                    var extDetalle = {
                        C_COMPRA: {
                            action: {
                                name: 'GetParentId',
                                args: $.ConvertObjectToArr({
                                    token: token,
                                    column: 'C_COMPRA'
                                })
                            }
                        },
                        C_DETALLE: {
                            action: {
                                name: 'GetNextId',
                                args: $.ConvertObjectToArr({
                                    columns: 'C_EMPRESA,C_COMPRA',
                                    max_length: 10
                                })
                            }
                        }
                    };
                    $.AddPetition({
                        table: 'LOG.COMPRA_DETALLE',
                        type: type,
                        items: $.ConvertObjectToArr(objDetalle, extDetalle)
                    });
                });

                $.each(update, function (i, detalle) {
                    var type = 2;
                    var condition = `C_EMPRESA = '${empresa}' AND C_COMPRA = '${detalle['C_COMPRA']}' AND C_DETALLE = '${detalle['C_DETALLE']}'`;
                    var objDetalle = {
                        C_EMPRESA: empresa,
                        C_COMPRA: detalle['C_COMPRA'],
                        C_DETALLE: detalle['C_DETALLE'],
                        C_UNIDAD_NEGOCIO: detalle['C_UNIDAD_NEGOCIO'],
                        DESCRIPCION: detalle['DESCRIPCION'],
                        C_PRODUCTO: detalle['C_PRODUCTO'],
                        CANTIDAD: detalle['CANTIDAD'],
                        IND_ESTADO: '*'
                    };
                    $.AddPetition({
                        table: 'LOG.COMPRA_DETALLE',
                        type: type,
                        condition: condition,
                        items: $.ConvertObjectToArr(objDetalle)
                    });
                });

                if (arrEliminadas.length > 0) {
                    $.each(arrEliminadas, function (i, eliminado) {
                        const c_detalle = eliminado.C_DETALLE;
                        if (c_detalle != '') {
                            const objEli = {
                                C_EMPRESA: empresa,
                                C_COMPRA: eliminado.C_COMPRA,
                                C_DETALLE: eliminado.C_DETALLE,
                                IND_ESTADO: 'E'
                            };
                            $.AddPetition({
                                table: 'LOG.COMPRA_DETALLE',
                                type: 2,
                                condition: `C_EMPRESA = '${empresa}' AND C_COMPRA = '${eliminado['C_COMPRA']}' AND C_DETALLE = '${eliminado['C_DETALLE']}'`,
                                items: $.ConvertObjectToArr(objEli)
                            });
                        }
                    });
                }

                $.AddPetition({
                    table: 'LOG.ORDEN_COMPRA',
                    type: 2,
                    condition: `C_EMPRESA = '${empresa}' AND C_ORDEN_COMPRA = '${$(controls.REF_ORDEN_COMPRA).val()}'`,
                    items: $.ConvertObjectToArr({
                        C_EMPRESA: empresa,
                        C_ORDEN_COMPRA: $(controls.REF_ORDEN_COMPRA).val(),
                        FLAG_GUIA: '*'
                    })
                });
            },
            onReady: function (result) {
                alertify.success('Se registró la información.');
                var c_compra = result.items.C_COMPRA;
                document.location = $.solver.baseUrl + '/Procesos/NuevaGuia/' + c_compra;
            },
            onDone: function (_form, controls) {
                _controls = controls;

                $(controls.C_EMPRESA).val(empresa);

                if ($(controls.C_COMPRA).val() != '') {
                    $(controls.FECHA_EMISION).val(moment($(controls.FECHA_EMISION).val()).format('DD/MM/YYYY'));
                    $(controls.FECHA_INGRESO_STOCK).val(moment($(controls.FECHA_INGRESO_STOCK).val()).format('DD/MM/YYYY'));
                    fnObtenerProveedor();
                }
                $(controls.FECHA_EMISION).datetimepicker({
                    format: 'DD/MM/YYYY',
                    locale: 'es'
                }).on('dp.change', function () { fnObtenerTipoCambio(); });
                $(controls.FECHA_INGRESO_STOCK).datetimepicker({
                    format: 'DD/MM/YYYY',
                    locale: 'es'
                });

                fnCrearTabla();
                fnObtenerTipoCambio();
                fnObtenerDatosEmpresa();
                fnObtenerCompra();

                
                $(form + ' #btnProveedor').click(function () {
                    if (!estado) {
                        estado = true;
                        fnBuscarProveedor();
                    }
                });
                $(form + ' #btnProducto').click(function () {
                    if (!estado) {
                        estado = true;
                        fnBuscarProducto();
                    }
                });
                $(form + ' #btnOrdenCompra').click(function () {
                    if (!estado) {
                        estado = true;
                        fnBuscarOrdenCompra();
                    }
                });
                $(form + ' #btnAtras').click(function (e) {
                    e.preventDefault();
                    document.location = $.solver.baseUrl + '/Procesos/RegistroGuia/';
                });
                $(form + ' #btnAgregarReferenciaCompra').click(function (e) {
                    e.preventDefault();
                    if (!estado) {
                        estado = true;
                        fnBuscarCompra();
                    }
                });
            },
            onError: function (error) {
                $.CloseStatusBar();
                $.ShowError({ error: error });
            }
        });
    });
});