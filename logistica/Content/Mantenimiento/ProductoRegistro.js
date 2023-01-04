require(['jqwidgets', 'helper', 'extras', 'fileinput.es', 'bootstrap-select', 'controls'], function () {
    require(['bootbox', 'alertify'], function (bootbox, alertify) {

        alertify.set('notifier', 'position', 'top-center');

        const empresa = $.solver.session.SESSION_EMPRESA;
        let _controls;
        const tblPromo = '#tblPromo';

        const objValidarTablas = {
            tables: [
                {
                    table: tblPromo,
                    tableText: 'Productos del paquete',
                    items: ['CANTIDAD', 'UNIDAD_MEDIDA'],
                    itemsText: ['cantidad', 'unidad de medida'],
                    minimumOfRows: 1
                }
            ]
        };
        let buttonState = false;

        const fnCrearCargaArchivo = function () {
            $("#input-b6").fileinput({
                language: 'es',
                showPreview: false,
                mainClass: "input-group-sm",
                uploadUrl: $.solver.services.api + "/Service/Upload/New",
                uploadAsync: true,
            });
            $("#input-b6").on("filebatchselected", function (event, files) {
                $("#input-b6").fileinput("upload");
                $.DisplayStatusBar({
                    message: 'Espere un momento se esta cargando su archivo ...'
                });
            });
            $("#input-b6").on("fileuploaded", function (event, data, previewId, index) {
                $('input[name=C_ARCHIVO_FOTO]').val(data.response.token);
                $('#C_ARCHIVO_FOTO').trigger('change');
                $("#input-b6").fileinput('clear');
                $.CloseStatusBar();
            });

        };
        const fnObtenerCategoria = function () {
            $.GetQuery({
                query: ['q_ventas_mantenimiento_productos_obtenercategoria'],
                items: [{
                    C_PRODUCTO: function () { return $(_controls.C_PRODUCTO).val(); },
                    C_EMPRESA: empresa
                }],
                onError: function (error) {
                    $.ShowError({ error: error });
                },
                onReady: function (result) {
                    if (result.length > 0) {
                        const data = result[0];
                        $(_controls.FAMILIA).val(data['NOMBRE_FAMILIA']).trigger('change');
                        setTimeout(function () {
                            $(_controls.SUBFAMILIA).val(data['NOMBRE_SUB_FAMILIA']).trigger('change');
                            setTimeout(function () {
                                $(_controls.C_CATEGORIA).val(data['C_CATEGORIA']);
                            }, 500);
                        }, 500);
                    }
                }
            });
        };
        const fnObtenerCategoriaPersonas = function () {
            $.GetQuery({
                query: ['q_ventas_mantenimiento_productoregistro_obtenercategoriaclientes'],
                items: [
                    {
                        C_EMPRESA: empresa
                    }],
                onReady: function (result) {
                    categoriaClientes = result;
                    fnCrearTabla();
                }
            });
        };
        const fnObtenerImagen = function () {
            if ($(_controls.C_ARCHIVO_FOTO).val() != '') {
                $('#img').attr('src', '');
                $('#img').attr('src', $.solver.services.api + 'Service/ViewFile/' + $(_controls.C_ARCHIVO_FOTO).val())
                $('#img').css({ 'display': 'block' });
            }
        }
        const fnObtenerCubso = function () {
            var cubso = $(_controls.C_CUBSO).val();
            if (cubso != '') {
                $.GetQuery({
                    query: ['gbl_obtener_cubso'],
                    items: [{
                        C_CUBSO: function () {
                            return cubso;
                        }
                    }],
                    onReady: function (result) {
                        if (result.length > 0) {
                            const data = result[0];
                            $('#NOMBRE_CUBSO').val(data.NOMBRE);
                        }
                    }
                });
            }
        };
        const fnCrearTabla = function () {
            const fnClassEditer = function (row, datafield, value, rowdata) {
                if (rowdata.MODO == 1 || rowdata.MODO == 2) return 'editedRow';
            };

            $(tblPromo).CreateGrid({
                query: 'q_puntoventa_mantenimiento_productoregistro_listarproductopromocion',
                hiddens: ['C_EMPRESA', 'C_PRODUCTO_PROMO_DETALLE', 'C_UNIDAD_MEDIDA', 'C_UNIDAD_PRIN', 'UNIDAD_PRIN', 'C_UNIDAD_AUX', 'UNIDAD_AUX'],
                items: {
                    C_EMPRESA: empresa,
                    C_PRODUCTO: function () {
                        return $('#C_PRODUCTO').val();
                    }
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
                    'C_PRODUCTO': {
                        text: 'Cód. prod.',
                        width: 120,
                        editable: false
                    },
                    'NOMBRE_PARA_VENTA': {
                        text: 'Nombre',
                        width: 200,
                        editable: false
                    },
                    'UNIDAD_MEDIDA': {
                        text: 'Unidad medida.',
                        width: 100,
                        editable: true,
                        columntype: 'dropdownlist',
                        createeditor: function (row, value, editor) {
                            var rowData = $(tblPromo).jqxGrid('getrows')[row];
                            var unidades = [];

                            unidades.push({
                                value: rowData['C_UNIDAD_PRIN'],
                                label: rowData['UNIDAD_PRIN']
                            });

                            if (unidades[0].value != rowData['C_UNIDAD_AUX']) {
                                unidades.push({
                                    value: rowData['C_UNIDAD_AUX'],
                                    label: rowData['UNIDAD_AUX']
                                })
                            }

                            const estadoSource =
                            {
                                datatype: "array",
                                datafields: [
                                    { name: 'label', type: 'string' },
                                    { name: 'value', type: 'string' }
                                ],
                                localdata: unidades
                            };
                            const myadapter = new $.jqx.dataAdapter(estadoSource, { autoBind: true });
                            editor.jqxDropDownList({ source: myadapter, displayMember: 'label', valueMember: 'value' });
                        },
                        initeditor: function (row, value, editor) {
                            var rowData = $(tblPromo).jqxGrid('getrows')[row];
                            var unidades = [];

                            unidades.push({
                                value: rowData['C_UNIDAD_PRIN'],
                                label: rowData['UNIDAD_PRIN']
                            });

                            if (unidades[0].value != rowData['C_UNIDAD_AUX']) {
                                unidades.push({
                                    value: rowData['C_UNIDAD_AUX'],
                                    label: rowData['UNIDAD_AUX']
                                })
                            }

                            const estadoSource =
                            {
                                datatype: "array",
                                datafields: [
                                    { name: 'label', type: 'string' },
                                    { name: 'value', type: 'string' }
                                ],
                                localdata: unidades
                            };
                            const myadapter = new $.jqx.dataAdapter(estadoSource, { autoBind: true });
                            editor.jqxDropDownList({ source: myadapter, displayMember: 'label', valueMember: 'value' });
                        },
                        cellendedit: function (row, datafield, columntype, oldvalue, newvalue) {
                            var rowData = $(tblPromo).jqxGrid('getrows')[row];
                            var unidades = [];

                            unidades.push({
                                value: rowData['C_UNIDAD_PRIN'],
                                label: rowData['UNIDAD_PRIN']
                            });

                            if (unidades[0].value != rowData['C_UNIDAD_AUX']) {
                                unidades.push({
                                    value: rowData['C_UNIDAD_AUX'],
                                    label: rowData['UNIDAD_AUX']
                                })
                            }
                            $.each(unidades, function (i, v) {
                                if (v.label == newvalue) {
                                    $(tblPromo).jqxGrid('getrows')[row].C_UNIDAD_MEDIDA = v.value;
                                }
                            });
                        }
                    },
                    'CANTIDAD': {
                        text: 'Cantidad',
                        editable: true,
                        width: 130,
                        cellsFormat: 'd2',
                        cellsAlign: 'right',
                        columnType: 'numberinput',
                        validation: function (cell, value) {
                            if (value <= 0) {
                                return { result: false, message: 'Debe ser mayor a 0' };
                            }
                            return true;
                        }
                    }
                },
                config: {
                    virtualmode: false,
                    height: 200,
                    pageSize: 999999,
                    columnsresize: true,
                    editable: true,
                    sortable: false,
                    pageable: false,
                }
            });

            $(tblPromo).on('bindingcomplete', function () {
                $(tblPromo).unbind("cellvaluechanged");
                $(tblPromo).on("cellvaluechanged", function (event) {
                    if (event.args.newvalue != event.args.oldvalue) {
                        var row = event.args.rowindex;
                        if ($(tblPromo).jqxGrid('getrows')[row].MODO != 1) $(tblPromo).jqxGrid('getrows')[row].MODO = 2;
                    }
                });
            });
        };
        const fnChangeStockIlimitado = function () {
            if ($('#CHECK_STOCK').prop('checked')) {
                $('#STOCK_ILIMITADO').val('*')
            }
            else {
                $('#STOCK_ILIMITADO').val('&')
            }
        }
        const fnObtenerCtaContable = function (cuenta) {
            $.GetData({
                title: '<strong>Busqueda de plan contable</strong>',
                uriData: $.solver.baseUrl + '/Mantenimiento/BusquedaPlanContable/',
                location: 'float',
                type: 'GET',
                isPage: true,
                onReady: function (objectBuscarCuenta, modalBuscarCuenta) {
                    $(modalBuscarCuenta).find('.modal-dialog').css({ 'max-width': '40%' });
                    $(objectBuscarCuenta).find('#tblPlanContable').CreateGrid({
                        query: 'tbl_mantenimiento_obtenerplanes',
                        items: { C_EMPRESA: empresa },
                        hiddens: ['C_EMPRESA', 'CODIGO'],
                        columns: {
                            CODIGO_PLAN: {
                                text: 'Código',
                                width: 80
                            },
                            DESCRIPCION: {
                                text: 'Descripción de la cuenta',
                                width: 400
                            }
                        },
                        config: {
                            virtualmode: false,
                            height: 200,
                            pageSize: 999999,
                            pageable: false,
                            sortable: false,
                            editable: false,
                            rendered: function () {
                            }
                        }
                    });
                    $(objectBuscarCuenta).find('#tblPlanContable').on("rowdoubleclick", function () {
                        const getselectedrowindexes = $(objectBuscarCuenta).find('#tblPlanContable').jqxGrid('getselectedrowindexes');
                        if (getselectedrowindexes.length > 0) {
                            const codigo = $(objectBuscarCuenta).find('#tblPlanContable').jqxGrid('getrowdata', getselectedrowindexes[0])['CODIGO_PLAN'];
                            if (cuenta == 'compras') {
                                $(_controls.CTA_CONTABLE_COMPRAS).val(codigo);
                            }
                            else {
                                $(_controls.CTA_CONTABLE_VENTAS).val(codigo);
                            }

                            bootbox.hideAll();
                        }
                    });
                },
                onCloseModal: function () {
                    estado = false;
                }
            });
        }
        const fnBuscarProductosPromo = function () {

            var iconButton = '<i class="fa fa-search" aria-hidden="true"></i>';
            var textButton = 'Buscar';
            var token = $.CreateToken();
            var dialog = bootbox.dialog({
                title: 'Busqueda de producto',
                message: `<div id="${token}"></div>`,
                className: 'modal-search-70'
            });
            var controls = {
                buscar: {
                    class: 'col-12 col-sm-3 col-md-3',
                    html: '<input type="text" name="buscar" class="form-control form-control-sm" placeholder="Ingrese aquí su búsqueda..." autocomplete="off" />'
                }
            };

            dialog.init(function () {
                setTimeout(function () {
                    var objControls = null;

                    $(dialog).find('#' + token).html(`
                        <form id="${token}_form">
                            <div class="row site"></div>
                        </form>
                        <div class="row mt-3">
                            <div class="col-12">
                                <div id="${token}_table"></div>
                            </div>
                        </div>
                    `);
                    const tblBusqProdProm = $(dialog).find('#' + token + '_table');
                    const frmBusqProdProm = $(dialog).find('#' + token + '_form');

                    const fnEscogerProducto = function () {
                        const getselectedrowindex = $(tblBusqProdProm).jqxGrid('getselectedrowindex');
                        if (getselectedrowindex == -1) {
                            alertify.warning('Por favor seleccione 1 producto');
                        }
                        else {
                            var row = $(tblBusqProdProm).jqxGrid('getrows')[getselectedrowindex];
                            var fila = $(tblPromo).jqxGrid('getrows').length;
                            var producto = {
                                _rowNum: fila + 1,
                                C_EMPRESA: empresa,
                                C_PRODUCTO_PROMO_DETALLE: '',
                                C_PRODUCTO: row['C_PRODUCTO'],
                                NOMBRE_PARA_VENTA: row['NOMBRE_PARA_VENTA'],
                                C_UNIDAD_PRIN: row['C_UNIDAD_PRIN'],
                                UNIDAD_PRIN: row['UNIDAD_PRIN'],
                                C_UNIDAD_AUX: row['C_UNIDAD_AUX'],
                                UNIDAD_AUX: row['UNIDAD_AUX'],
                                CANTIDAD: 1
                            };
                            $(tblPromo).jqxGrid('addrow', null, producto);
                            $(tblPromo).jqxGrid('selectrow', fila);
                            $(tblPromo).jqxGrid('ensurerowvisible', fila);
                            buttonState = false;
                            $(dialog).modal('hide');
                        }
                    }
                    var fnCrearTabla = function () {
                        $(tblBusqProdProm).CreateGrid({
                            query: 'tbl_ventas_mantenimiento_productoregistro_obtener_productos',
                            hiddens: ['C_EMPRESA', 'C_UNIDAD_PRIN', 'C_UNIDAD_AUX'],
                            items: {
                                C_EMPRESA: empresa,
                                BUSCAR: function () {
                                    return $(objControls.buscar).val();
                                },
                                C_PRODUCTOS: function () {
                                    var codigosProducto = [];
                                    $.each($(tblPromo).jqxGrid('getrows'), function (i, v) { codigosProducto.push(v.C_PRODUCTO); });
                                    return codigosProducto.join(',');
                                },
                                C_PRODUCTO: function () {
                                    return $(_controls.C_PRODUCTO).val();
                                }
                            },
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
                                    text: 'Cód. prod.',
                                    width: 120
                                },
                                'NOMBRE_PARA_VENTA': {
                                    text: 'Nombre',
                                    width: 200
                                },
                                'UNIDAD_PRIN': {
                                    text: 'Unidad prin.',
                                    width: 100
                                },
                                'UNIDAD_AUX': {
                                    text: 'Unidad aux.',
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
                        $(tblBusqProdProm).on('rowdoubleclick', function (event) {
                            fnEscogerProducto();
                        });
                    };

                    //agregamos controles
                    for (var item in controls) {
                        var control = controls[item];
                        $(dialog).find('#' + token + '_form .site').append(`
                            <div class="${control.class}">${control.html}</div>
                        `);
                    };
                    $(frmBusqProdProm).find('.site').append(`
                        <div class="col-auto p-0 pr-1"><button type="submit" class="btn btn-sm btn-gray">${iconButton} ${textButton}</button></div>
                    `);
                    $(frmBusqProdProm).find('.site').append(`
                        <div class="col"><button type="button" class="float-right btn btn-sm btn-danger" id="btnAceptar"><i class="fa fa-floppy-o" aria-hidden="true"></i>&nbsp;Aceptar</button></div>
                    `);

                    //Validamos formulario
                    $(frmBusqProdProm).ValidForm({
                        type: -1,
                        onDone: function (form, controls) {
                            objControls = controls;
                            fnCrearTabla();

                            $(frmBusqProdProm).find('#btnAceptar').click(function () {
                                fnEscogerProducto();
                            });

                            setTimeout(function () {
                                $(controls.buscar).focus();
                            }, 300);
                        },
                        onReady: function () {
                            $(tblBusqProdProm).jqxGrid('updatebounddata');
                        }
                    });

                }, 150);
            });

            dialog.on('hide.bs.modal', function () {
                buttonState = false;
            });

        }
        const fnObtenerCentroCosto = function () {
            var centroCosto = $(_controls.C_UNIDAD_NEGOCIO).val();
            if (centroCosto != '') {
                $.GetQuery({
                    query: ['gbl_obtener_centro_costo'],
                    items: [{
                        C_EMPRESA: empresa,
                        C_UNIDAD_NEGOCIO: centroCosto
                    }],
                    onReady: function (result) {
                        if (result.length > 0) {
                            $(_controls.NOMBRE_CENTRO_COSTO).val(result[0].NOMBRE);
                        }
                    }
                })
            }
        };

        $('.number-input').on('input', function () {
            this.value = this.value.replace(/[^0-9]/g, '');
        });
        $('.c_empresa').attr('data-c_empresa', empresa);
        $('#C_ARCHIVO_FOTO').change(function (e) {
            fnObtenerImagen();
        });
        $('form[name=frmRegistroProducto]').ValidForm({
            table: 'VET.PRODUCTO',
            type: 1,
            querySave: true,
            extras: {
                C_PRODUCTO: {
                    action: {
                        name: 'GetNextId',
                        args: $.ConvertObjectToArr({
                            max_length: '6',
                            columns: 'C_EMPRESA'
                        })
                    }
                }
            },
            onSubmit: function (form, controls) {
                if ($(_controls.PROMOCION).val() == '*') objValidarTablas.tables[0]['minimumOfRows'] = 1
                else delete objValidarTablas.tables[0].minimumOfRows
                var validacion = $.solver.fn.validarCondicionesTabla(objValidarTablas);
                if (validacion.estado) {
                    if ($(controls.C_UNIDAD_NEGOCIO).val() == '') {
                        alertify.warning('Por favor seleccione el centro de costo.');
                        return false;
                    }

                    return true
                }
                else {
                    var mensaje = ''
                    $.each(validacion.mensajes, function (i, v) {
                        mensaje += v + '<br>'
                    });

                    alertify.warning(mensaje);
                    return false;
                }
            },
            onDetail: function (form, controls, token) {
                $.AddPetition({
                    type: 4,
                    items: $.ConvertObjectToArr({
                        script: 'spw_puntoventa_mantenimiento_registroproducto_eliminarpromocionesdetalle',
                        C_EMPRESA: empresa,
                        C_PRODUCTO: '',
                    },
                        {
                            C_PRODUCTO: {
                                action: {
                                    name: 'GetParentId',
                                    args: $.ConvertObjectToArr({
                                        token: token,
                                        column: 'C_PRODUCTO'
                                    })
                                }
                            },
                        }),
                    transaction: true
                });

                if ($(controls.PROMOCION).val() == '*') {
                    $.each($(tblPromo).jqxGrid('getrows'), function (i, v) {
                        $.AddPetition({
                            table: 'VET.PRODUCTO_PROMO_DETALLE',
                            type: 1,
                            items: $.ConvertObjectToArr({
                                C_EMPRESA: empresa,
                                C_PRODUCTO_REF: '',
                                C_PRODUCTO_PROMO_DETALLE: '',
                                C_PRODUCTO: v.C_PRODUCTO,
                                CANTIDAD: v.CANTIDAD,
                                C_UNIDAD_MEDIDA: v.C_UNIDAD_MEDIDA
                            }, {
                                C_PRODUCTO_REF: {
                                    action: {
                                        name: 'GetParentId',
                                        args: $.ConvertObjectToArr({
                                            token: token,
                                            column: 'C_PRODUCTO'
                                        })
                                    }
                                },
                                C_PRODUCTO_PROMO_DETALLE: {
                                    action: {
                                        name: 'GetNextId',
                                        args: $.ConvertObjectToArr({
                                            columns: 'C_EMPRESA,C_PRODUCTO_REF',
                                            max_length: 3
                                        })
                                    }
                                }
                            })
                        });
                    });
                }
            },
            onDone: function (form, controls, type, condition, object) {
                _controls = controls;

                $(_controls.C_EMPRESA).val(empresa);
                $(_controls.NOMBRE_PARA_VENTA).change(function () {
                    if ($(_controls.NOMBRE_GENERICO).val() == '') {
                        $(_controls.NOMBRE_GENERICO).val($(this).val());
                    }
                });
                $(_controls.FAMILIA).change(function () {
                    $('#SUBFAMILIA').attr('data-query', 'cb_ventas_mantenimiento_productos_listarsubfamilias')
                    $('#SUBFAMILIA').attr('data-value', 'NOMBRE_SUB_FAMILIA')
                    $('#SUBFAMILIA').attr('data-field', 'NOMBRE_SUB_FAMILIA')
                    $('#SUBFAMILIA').attr('data-NOMBRE_FAMILIA', $(this).val());
                    $('#SUBFAMILIA').attr('data-C_EMPRESA', empresa);
                    $('#SUBFAMILIA').FieldLoadRemote({
                        onReady: function () {
                            $(_controls.SUBFAMILIA).trigger('change');
                        }
                    });
                });
                $(_controls.SUBFAMILIA).change(function () {
                    $('#C_CATEGORIA').attr('data-query', 'cb_ventas_mantenimiento_productos_listarcategorias')
                    $('#C_CATEGORIA').attr('data-value', 'C_CATEGORIA')
                    $('#C_CATEGORIA').attr('data-field', 'NOMBRE_CATEGORIA')
                    $('#C_CATEGORIA').attr('data-NOMBRE_SUB_FAMILIA', $(this).val());
                    $('#C_CATEGORIA').attr('data-C_EMPRESA', empresa);
                    $('#C_CATEGORIA').FieldLoadRemote();
                });

                if ($(_controls.C_PRODUCTO).val() != '') {
                    $('#codigo').val($(_controls.C_PRODUCTO).val());
                    fnObtenerCategoria();
                } else {
                    $('#codigo').val('XXXX');
                }

                fnObtenerImagen();

                $(controls.C_PARAMETRO_GENERAL_SUJETO_DETRACCION).selectpicker();
                fnObtenerCategoriaPersonas();

                if ($(_controls.STOCK_ILIMITADO).val() == '*') {
                    $('#CHECK_STOCK').prop('checked', true);
                }
                else {
                    $('#CHECK_STOCK').prop('checked', false);
                }

                fnChangeStockIlimitado();

                $('#ctaContableCompras').click(function () {
                    estado = true;
                    fnObtenerCtaContable('compras')
                });

                if ($(controls.TIPO_UNIDAD).val() == 'U') {
                    $(controls.FACTOR).val(1);
                    $(controls.FACTOR).attr('readonly', 'readonly');

                    $(controls.C_PARAMETRO_GENERAL_UNIDAD_AUX).attr('readonly', 'readonly').css({ 'pointer-events': 'none' });
                    $(controls.C_PARAMETRO_GENERAL_UNIDAD_AUX).val($(controls.C_PARAMETRO_GENERAL_UNIDAD_PRIN).val())
                }
                else if ($(controls.TIPO_UNIDAD).val() == 'L') {
                    $(controls.FACTOR).removeAttr('readonly');
                }

                $(controls.TIPO_UNIDAD).change(function () {
                    const c_producto = $(controls.C_PRODUCTO).val();
                    $.solver.fn.fnValidarMovimientosProducto({
                        c_producto: c_producto,
                        callback: function (result) {
                            if (result[0].RESPUESTA == '*') {
                                alertify.warning('No se puede cambiar el tipo de unidad porque el producto ya tiene movimientos')
                                $(controls.TIPO_UNIDAD).val(object.rows[0].TIPO_UNIDAD);
                                return;
                            }

                            if ($(controls.TIPO_UNIDAD).val() == 'U') {
                                $(controls.FACTOR).val(1);
                                $(controls.FACTOR).attr('readonly', 'readonly');

                                $(controls.C_PARAMETRO_GENERAL_UNIDAD_PRIN).val('')
                                $(controls.C_PARAMETRO_GENERAL_UNIDAD_AUX).val('')
                                $(controls.C_PARAMETRO_GENERAL_UNIDAD_AUX).attr('readonly', 'readonly').css({ 'pointer-events': 'none' });
                            }
                            else if ($(controls.TIPO_UNIDAD).val() == 'L') {
                                $(controls.FACTOR).removeAttr('readonly');

                                $(controls.C_PARAMETRO_GENERAL_UNIDAD_PRIN).val('')
                                $(controls.C_PARAMETRO_GENERAL_UNIDAD_AUX).val('')
                                $(controls.C_PARAMETRO_GENERAL_UNIDAD_AUX).removeAttr('readonly').css({ 'pointer-events': 'auto' });
                            }

                            if ($(controls.PROMOCION).val() == '*') {
                                $(controls.C_PARAMETRO_GENERAL_UNIDAD_PRIN).val('07233').trigger('change');
                            }
                            else {
                                $(controls.C_PARAMETRO_GENERAL_UNIDAD_PRIN).val('')
                            }
                        }
                    });
                });

                $(controls.C_PARAMETRO_GENERAL_UNIDAD_PRIN).change(function () {
                    const c_producto = $(controls.C_PRODUCTO).val();
                    $.solver.fn.fnValidarMovimientosProducto({
                        c_producto: c_producto,
                        callback: function (result) {
                            if (result[0].RESPUESTA == '*') {
                                alertify.warning('No se puede cambiar la unidad de medida porque ya tiene movimientos')
                                $(controls.C_PARAMETRO_GENERAL_UNIDAD_PRIN).val(object.rows[0].C_PARAMETRO_GENERAL_UNIDAD_PRIN);
                                return;
                            }

                            if ($(controls.TIPO_UNIDAD).val() == 'U') {
                                $(controls.C_PARAMETRO_GENERAL_UNIDAD_AUX).val($(controls.C_PARAMETRO_GENERAL_UNIDAD_PRIN).val())
                            }

                        }
                    });
                });

                $(controls.C_PARAMETRO_GENERAL_UNIDAD_AUX).change(function (e) {
                    const c_producto = $(controls.C_PRODUCTO).val();
                    $.solver.fn.fnValidarMovimientosProducto({
                        c_producto: c_producto,
                        callback: function (result) {
                            if (result[0].RESPUESTA == '*') {
                                alertify.warning('No se puede cambiar la unidad de medida porque ya tiene movimientos')
                                $(controls.C_PARAMETRO_GENERAL_UNIDAD_AUX).val(object.rows[0].C_PARAMETRO_GENERAL_UNIDAD_AUX);
                                return;
                            }
                        }
                    });
                });

                $(controls.PROMOCION).change(function () {
                    if ($(controls.PROMOCION).val() == '*') {
                        $(controls.TIPO_UNIDAD).val('U').trigger('change').attr('readonly', 'readonly').css({ 'pointer-events': 'none' });
                        $('.zone-promo').show();

                        // Habilitamos el check y escondemos
                        $('.form-check').hide();
                    }
                    else {
                        $('.zone-promo').hide()
                        $(controls.TIPO_UNIDAD).removeAttr('readonly').css({ 'pointer-events': 'auto' });

                        // Habilitamos el check y mostramos
                        $('.form-check').show();
                    }
                });

                var check = $(controls.PROMOCION).val();
                if (check == null || check == '' || check == '&') {
                    $(controls.PROMOCION).val('&')
                    $('.zone-promo').hide()
                    $(controls.TIPO_UNIDAD).removeAttr('readonly').css({ 'pointer-events': 'auto' });
                    $('.form-check').show();
                }
                else {
                    $('.zone-promo').show();
                    $(controls.TIPO_UNIDAD).attr('readonly', 'readonly').css({ 'pointer-events': 'none' });
                    $('.form-check').hide();
                }

                fnObtenerCentroCosto();
                fnObtenerCubso();

                $.solver.fn.fnValidarMovimientosProducto({
                    c_producto: function () {
                        return $(controls.C_PRODUCTO).val()
                    },
                    callback: function (result) {
                        if (result[0].RESPUESTA == '*') {
                            $(controls.FACTOR).attr('disabled', 'disabled')
                            return;
                        }
                    }
                });
            },
            onReady: function (result, controls, form) {
                document.location = $.solver.baseUrl + '/Mantenimiento/Productos/';
            },
            onError: function (error) {
                $.CloseStatusBar();
                $.ShowError({ error: error });
            }
        });

        $('#btnAgregarProducto').click(function () {
            if (!buttonState) {
                buttonState = true;
                fnBuscarProductosPromo();
            }
        })
        $('#btnEliminarProducto').click(function () {
            var rows = $(tblPromo).jqxGrid('getrows');
            if (rows.length > 0) {
                var selected = $(tblPromo).jqxGrid('getselectedrowindex')
                if (selected != -1) {
                    var rowId = $(tblPromo).jqxGrid('getrowid', selected);
                    $(tblPromo).jqxGrid('deleterow', rowId);
                    if (selected - 1 != -1) {
                        $(tblPromo).jqxGrid('selectrow', selected - 1);
                        $(tblPromo).jqxGrid('ensurerowvisible', selected - 1);
                    }
                    else {
                        if (rows.length > 0) {
                            $(tblPromo).jqxGrid('selectrow', selected);
                            $(tblPromo).jqxGrid('ensurerowvisible', selected);
                        }
                    }
                }
            }
        })

        $('#CHECK_STOCK').change(function () {
            fnChangeStockIlimitado();
        });
        $('#centroCosto').click(function () {
            $.solver.fn.fnSeleccionarCentroCosto({
                input: $(_controls.C_UNIDAD_NEGOCIO),
                onCloseModal: function () {
                    fnObtenerCentroCosto();
                }
            });
        });
        $('#cubso').click(function () {
            $.solver.fn.fnSeleccionarCubso({
                input: $(_controls.C_CUBSO),
                onCloseModal: function () {
                    fnObtenerCubso();
                }
            });
        });

        fnCrearCargaArchivo();
    });
});