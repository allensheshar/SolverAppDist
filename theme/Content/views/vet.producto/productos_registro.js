require(['jqwidgets', 'helper', 'extras', 'fileinput.es', 'bootstrap-select', 'controls'], function () {
    require(['bootbox', 'alertify'], function (bootbox, alertify) {

        alertify.set('notifier', 'position', 'top-center');

        let _controls;
        let productos = [];
        let arrEliminadoPrecio = [];
        let buttonState = false;
        let categoriaClientes = [];

        const empresa = $.solver.session.SESSION_EMPRESA;
        const tblPrecios = '#tblPrecios';
        const tblPromo = '#tblPromo';
        const objValidarTablas = {
            tables: [
                {
                    table: tblPromo,
                    tableText: 'Productos del paquete',
                    items: ['CANTIDAD', 'UNIDAD_MEDIDA'],
                    itemsText: ['cantidad', 'unidad de medida'],
                    minimumOfRows: 1
                },
                {
                    table: tblPrecios,
                    tableText: 'Lista de precios',
                    items: ['C_CLIENTE_CATEGORIA', 'MONEDA', 'PRECIO'],
                    itemsText: ['categoría', 'moneda', 'precio']
                }
            ]
        };

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
            $(tblPrecios).CreateGrid({
                query: 'tbl_ventas_mantenimiento_productoregistro_listarprecios',
                hiddens: ['C_EMPRESA', 'C_PRODUCTO', 'C_PRODUCTO_PRECIO', 'CODIGO', 'MARCA', 'C_PARAMETRO_GENERAL_UNIDAD', 'TIPO_CONFIG', 'HORA_DESDE', 'HORA_HASTA'],
                columns: {
                    'C_CLIENTE_CATEGORIA': {
                        text: 'Categoria',
                        columntype: 'dropdownlist',
                        cellclassname: fnClassEditer,
                        createeditor: function (row, value, editor) {
                            var estadoSource =
                            {
                                datatype: "array",
                                datafields: [
                                    { name: 'label', type: 'string' },
                                    { name: 'value', type: 'string' }
                                ],
                                localdata: categoriaClientes
                            };
                            var myadapter = new $.jqx.dataAdapter(estadoSource, { autoBind: true });
                            editor.jqxDropDownList({ source: myadapter, displayMember: 'label', valueMember: 'value' });
                        },
                        cellendedit: function (row, datafield, columntype, oldvalue, newvalue) { }
                    },
                    'MONEDA': {
                        text: 'Moneda',
                        columntype: 'dropdownlist',
                        createeditor: function (row, value, editor) {
                            const moneda = [
                                { value: "S", label: "Soles" },
                                { value: "D", label: "Dolar" }
                            ];
                            const monedaSource =
                            {
                                datatype: "array",
                                datafields: [
                                    { name: 'label', type: 'string' },
                                    { name: 'value', type: 'string' }
                                ],
                                localdata: moneda
                            };
                            const myadapter = new $.jqx.dataAdapter(monedaSource, { autoBind: true });
                            editor.jqxDropDownList({ source: myadapter, displayMember: 'label', valueMember: 'value' });
                        },
                        cellclassname: fnClassEditer,
                        width: 100,
                        cellsAlign: 'center'
                    },
                    'UNIDAD': {
                        text: 'Unidad',
                        columntype: 'dropdownlist',
                        createeditor: function (row, value, editor) {

                            var unidades = [];

                            unidades.push({
                                value: $(_controls.C_PARAMETRO_GENERAL_UNIDAD_PRIN).val(),
                                label: $(_controls.C_PARAMETRO_GENERAL_UNIDAD_PRIN)[0].args.data.filter(x => x['CODIGO'] == $(_controls.C_PARAMETRO_GENERAL_UNIDAD_PRIN).val())[0].DESCRIPCION
                            });

                            if (unidades[0].value != $(_controls.C_PARAMETRO_GENERAL_UNIDAD_AUX).val()) {
                                unidades.push({
                                    value: $(_controls.C_PARAMETRO_GENERAL_UNIDAD_AUX).val(),
                                    label: $(_controls.C_PARAMETRO_GENERAL_UNIDAD_AUX)[0].args.data.filter(x => x['CODIGO'] == $(_controls.C_PARAMETRO_GENERAL_UNIDAD_AUX).val())[0].DESCRIPCION
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
                            var unidades = [];

                            unidades.push({
                                value: $(_controls.C_PARAMETRO_GENERAL_UNIDAD_PRIN).val(),
                                label: $(_controls.C_PARAMETRO_GENERAL_UNIDAD_PRIN)[0].args.data.filter(x => x['CODIGO'] == $(_controls.C_PARAMETRO_GENERAL_UNIDAD_PRIN).val())[0].DESCRIPCION
                            });

                            if (unidades[0].value != $(_controls.C_PARAMETRO_GENERAL_UNIDAD_AUX).val()) {
                                unidades.push({
                                    value: $(_controls.C_PARAMETRO_GENERAL_UNIDAD_AUX).val(),
                                    label: $(_controls.C_PARAMETRO_GENERAL_UNIDAD_AUX)[0].args.data.filter(x => x['CODIGO'] == $(_controls.C_PARAMETRO_GENERAL_UNIDAD_AUX).val())[0].DESCRIPCION
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
                            var unidades = [];

                            unidades.push({
                                value: $(_controls.C_PARAMETRO_GENERAL_UNIDAD_PRIN).val(),
                                label: $(_controls.C_PARAMETRO_GENERAL_UNIDAD_PRIN)[0].args.data.filter(x => x['CODIGO'] == $(_controls.C_PARAMETRO_GENERAL_UNIDAD_PRIN).val())[0].DESCRIPCION
                            });

                            if (unidades[0].value != $(_controls.C_PARAMETRO_GENERAL_UNIDAD_AUX).val()) {
                                unidades.push({
                                    value: $(_controls.C_PARAMETRO_GENERAL_UNIDAD_AUX).val(),
                                    label: $(_controls.C_PARAMETRO_GENERAL_UNIDAD_AUX)[0].args.data.filter(x => x['CODIGO'] == $(_controls.C_PARAMETRO_GENERAL_UNIDAD_AUX).val())[0].DESCRIPCION
                                })
                            }
                            $.each(unidades, function (i, v) {
                                if (v.label == newvalue) {
                                    $(tblPrecios).jqxGrid('getrows')[row].C_PARAMETRO_GENERAL_UNIDAD = v.value;
                                }
                            });
                        },
                        cellclassname: fnClassEditer,
                        width: 100,
                        cellsAlign: 'center',
                    },
                    'PRECIO': {
                        text: 'Precio',
                        width: 100,
                        cellsAlign: 'right',
                        cellsFormat: 'd2',
                        cellclassname: fnClassEditer,
                        columnType: 'numberinput',
                    },
                    'PRECIO_COMPRA': {
                        text: 'Precio compra',
                        width: 100,
                        cellsAlign: 'right',
                        cellsFormat: 'd2',
                        editable: false,
                        cellclassname: fnClassEditer,
                    },
                    'IND_ESTADO': {
                        text: 'Estado',
                        columntype: 'dropdownlist',
                        createeditor: function (row, value, editor) {
                            const estados = [
                                { value: "*", label: "Activo" },
                                { value: "&", label: "Inactivo" }
                            ];
                            const estadoSource =
                            {
                                datatype: "array",
                                datafields: [
                                    { name: 'label', type: 'string' },
                                    { name: 'value', type: 'string' }
                                ],
                                localdata: estados
                            };
                            const myadapter = new $.jqx.dataAdapter(estadoSource, { autoBind: true });
                            editor.jqxDropDownList({ source: myadapter, displayMember: 'label', valueMember: 'value' });
                        },
                        cellclassname: fnClassEditer,
                        width: 100,
                        cellsAlign: 'center'
                    },
                    'MODIFICA_PRECIO': {
                        text: 'Modificar precio',
                        width: 100,
                        cellclassname: fnClassEditer,
                        columnType: 'checkbox'
                    },
                },
                items: {
                    C_EMPRESA: empresa,
                    C_PRODUCTO: function () {
                        return $('#C_PRODUCTO').val();
                    }
                },
                config: {
                    virtualmode: false,
                    height: 500,
                    pageSize: 999999,
                    columnsresize: true,
                    editable: true,
                    sortable: false,
                    pageable: false
                }
            });
            $(tblPrecios).on('bindingcomplete', function () {
                $(tblPrecios).unbind("cellvaluechanged");
                $(tblPrecios).on("cellvaluechanged", function (event) {
                    if (event.args.newvalue != event.args.oldvalue) {
                        var row = event.args.rowindex;
                        if ($(tblPrecios).jqxGrid('getrows')[row].MODO != 1) $(tblPrecios).jqxGrid('getrows')[row].MODO = 2;
                    }
                });
            });

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
                    },
                    'IND_CAMBIAR_PROD': {
                        text: 'Camb. prod.',
                        columntype: 'checkbox'
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
        };
        const fnChangePrintSeparado = function () {
            if ($('#CHECK_PRINT_SEPARADO').prop('checked')) {
                $('#PRINT_SEPARADO').val('*')
            }
            else {
                $('#PRINT_SEPARADO').val('&')
            }
        };
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
        };
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

        };
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
        const fnValidarMovimientos = function (callback) {
            
        }

        //set values
        $('.c_empresa').attr('data-c_empresa', empresa);
        $('#C_ARCHIVO_FOTO').change(function (e) {
            fnObtenerImagen();
        });

        //methods
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
                if ($(_controls.CALCULO_PRECIO).val() != '') {
                    objValidarTablas.tables.splice(1, 1)
                }
                else {
                    if ($(_controls.PROMOCION).val() == '*') objValidarTablas.tables[0]['minimumOfRows'] = 1
                    else delete objValidarTablas.tables[0].minimumOfRows
                }
                var validacion = $.solver.fn.validarCondicionesTabla(objValidarTablas);
                if (validacion.estado) {
                    if ($(controls.C_UNIDAD_NEGOCIO).val() == '') {
                        alertify.warning('Por favor seleccione el centro de costo.');
                        return false;
                    }

                    //if ($(tblPrecios).jqxGrid('getrows').filter(x => x['PRECIO'] <= 0).length > 0) {
                    //    alertify.warning('Los montos de los precios tienen que ser mayor a cero.');
                    //    return false;
                    //}

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
                var inserts = $(tblPrecios).jqxGrid('getrows').filter(x => x['MODO'] == 1);
                var update = $(tblPrecios).jqxGrid('getrows').filter(x => x['MODO'] == 2);
                if ($(_controls.CALCULO_PRECIO).val() == '') {
                    $.each(inserts, function (i, precio) {
                        var type = 1;
                        var condition = '';
                        var codCliente = (precio.C_CLIENTE_CATEGORIA == '' ? null : categoriaClientes.filter(x => x['label'] == precio.C_CLIENTE_CATEGORIA)[0].value);
                        var objPrecio = {
                            C_EMPRESA: precio.C_EMPRESA,
                            C_PRODUCTO: precio.C_PRODUCTO,
                            C_PRODUCTO_PRECIO: precio.C_PRODUCTO_PRECIO,
                            C_CLIENTE_CATEGORIA: codCliente,
                            MONEDA: (precio.MONEDA == 'Soles' ? 'S' : 'D'),
                            PRECIO: (precio.PRECIO == '' ? null : precio.PRECIO),
                            CODIGO: (precio.CODIGO == '' ? null : precio.CODIGO),
                            MARCA: (precio.MARCA == '' ? null : precio.MARCA),
                            IND_ESTADO: (precio.IND_ESTADO == 'Activo' ? '*' : '&'),
                            CONDICION: precio.CONDICION,
                            C_PARAMETRO_GENERAL_UNIDAD: precio.C_PARAMETRO_GENERAL_UNIDAD,
                            MODIFICA_PRECIO: (precio.MODIFICA_PRECIO == 'true' || precio.MODIFICA_PRECIO == true ? '*' : '&'),
                            TIPO_CONFIG: '09995',
                            HORA_DESDE: '00: 00: 00',
                            HORA_HASTA: '23: 59: 59',
                            C_USUARIO_REGISTRO: $.solver.session.SESSION_ID
                        };
                        var extPrecio = {
                            C_PRODUCTO: {
                                action: {
                                    name: 'GetParentId',
                                    args: $.ConvertObjectToArr({
                                        token: token,
                                        column: 'C_PRODUCTO'
                                    })
                                }
                            },
                            C_PRODUCTO_PRECIO: {
                                action: {
                                    name: 'GetNextId',
                                    args: $.ConvertObjectToArr({
                                        columns: 'C_EMPRESA,C_PRODUCTO',
                                        max_length: 3
                                    })
                                }
                            }
                        };
                        $.AddPetition({
                            table: 'VET.PRODUCTO_PRECIO',
                            type: type,
                            condition: condition,
                            items: $.ConvertObjectToArr(objPrecio, extPrecio)
                        });
                    });

                    $.each(update, function (i, precio) {
                        var type = 2;
                        var condition = `C_EMPRESA = '${empresa}' AND C_PRODUCTO = '${precio['C_PRODUCTO']}' AND C_PRODUCTO_PRECIO = '${precio['C_PRODUCTO_PRECIO']}'`;
                        var codCliente = (precio.C_CLIENTE_CATEGORIA == '' ? null : categoriaClientes.filter(x => x['label'] == precio.C_CLIENTE_CATEGORIA)[0].value);
                        var objPrecio = {
                            C_EMPRESA: precio.C_EMPRESA,
                            C_PRODUCTO: precio.C_PRODUCTO,
                            C_PRODUCTO_PRECIO: precio.C_PRODUCTO_PRECIO,
                            C_CLIENTE_CATEGORIA: codCliente,
                            MONEDA: (precio.MONEDA == 'Soles' ? 'S' : 'D'),
                            PRECIO: precio.PRECIO,
                            CODIGO: (precio.CODIGO == '' ? null : precio.CODIGO),
                            MARCA: (precio.MARCA == '' ? null : precio.MARCA),
                            IND_ESTADO: (precio.IND_ESTADO == 'Activo' ? '*' : '&'),
                            CONDICION: precio.CONDICION,
                            C_PARAMETRO_GENERAL_UNIDAD: precio.C_PARAMETRO_GENERAL_UNIDAD,
                            MODIFICA_PRECIO: (precio.MODIFICA_PRECIO == 'true' || precio.MODIFICA_PRECIO == true ? '*' : '&'),
                            TIPO_CONFIG: precio.TIPO_CONFIG,
                            HORA_DESDE: precio.HORA_DESDE,
                            HORA_HASTA: precio.HORA_HASTA,
                            C_USUARIO_REGISTRO: $.solver.session.SESSION_ID
                        };
                        $.AddPetition({
                            table: 'VET.PRODUCTO_PRECIO',
                            type: type,
                            condition: condition,
                            items: $.ConvertObjectToArr(objPrecio)
                        });
                    });
                }

                if ($(_controls.CALCULO_PRECIO).val() != '') {
                    var rows = $(tblPrecios).jqxGrid('getrows');
                    $.each(rows, function (i, v) {
                        if (v['C_PRODUCTO_PRECIO'] != '') {
                            arrEliminadoPrecio.push(v);
                        }
                    })
                }

                if (arrEliminadoPrecio.length > 0) {
                    $.each(arrEliminadoPrecio, function (i, eliminado) {
                        const c_producto = eliminado['C_PRODUCTO'];
                        if (c_producto != '') {
                            const objEliPrec = {
                                C_EMPRESA: empresa,
                                C_PRODUCTO: eliminado.C_PRODUCTO,
                                C_PRODUCTO_PRECIO: eliminado.C_PRODUCTO_PRECIO,
                                IND_ESTADO: 'E'
                            };
                            $.AddPetition({
                                table: 'VET.PRODUCTO_PRECIO',
                                type: 2,
                                condition: `C_EMPRESA = '${empresa}' AND C_PRODUCTO = '${eliminado.C_PRODUCTO}' AND C_PRODUCTO_PRECIO = '${eliminado['C_PRODUCTO_PRECIO']}'`,
                                items: $.ConvertObjectToArr(objEliPrec)
                            });
                        }
                    });
                }

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
                                C_UNIDAD_MEDIDA: v.C_UNIDAD_MEDIDA,
                                IND_CAMBIAR_PROD: (v.IND_CAMBIAR_PROD == 'true' || v.IND_CAMBIAR_PROD == true ? '*' : '&')
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

                $.AddPetition({
                    type: 4,
                    items: $.ConvertObjectToArr({
                        script: 'spw_gbl_mantenimiento_listaprecios_validarduplicados',
                        C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                        C_PRODUCTO: '',
                    }, {
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
            },
            onDone: function (form, controls, type, condition, object) {

                _controls = controls;

                $(_controls.C_EMPRESA).val(empresa);
                $(_controls.FAMILIA).change(function () {
                    $('#SUBFAMILIA').attr('data-query', 'cb_ventas_mantenimiento_productos_listarsubfamilias')
                    $('#SUBFAMILIA').attr('data-value', 'NOMBRE_SUB_FAMILIA')
                    $('#SUBFAMILIA').attr('data-field', 'NOMBRE_SUB_FAMILIA')
                    $('#SUBFAMILIA').attr('data-NOMBRE_FAMILIA', $(this).val());
                    $('#SUBFAMILIA').attr('data-C_EMPRESA', empresa);
                    $('#SUBFAMILIA').FieldLoadRemote({
                        onReady: function () {
                            if ($(_controls.SUBFAMILIA)[0].args.data.length == 1) {
                                const first = $(_controls.SUBFAMILIA)[0].args.data[0].NOMBRE_SUB_FAMILIA;
                                $(_controls.SUBFAMILIA).val(first);
                            }
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
                    $('#C_CATEGORIA').FieldLoadRemote({
                        onReady: function () {
                            if ($(_controls.C_CATEGORIA)[0].args.data.length == 1) {
                                const first = $(_controls.C_CATEGORIA)[0].args.data[0].C_CATEGORIA;
                                $(_controls.C_CATEGORIA).val(first);
                            }

                            if ($(_controls.C_CATEGORIA)[0].args.data.length > 0) {
                                $(_controls.C_CATEGORIA).attr('required', 'required')
                            }
                            else {
                                $(_controls.C_CATEGORIA).removeAttr('required')
                            }
                        }
                    });
                });

                if ($.solver.basePath == '/ventas') {
                    $(_controls.C_COCINA).closest('div').addClass('d-none');
                };

                //cargamos combo de tipo de producto
                $(_controls.C_PARAMETRO_GENERAL_TIPO_PRODUCTO).attr('data-query', 'cb_logistica_mantenimiento_productos_listatipoproducto_v2');
                $(_controls.C_PARAMETRO_GENERAL_TIPO_PRODUCTO).attr('data-value', 'C_PARAMETRO_GENERAL');
                $(_controls.C_PARAMETRO_GENERAL_TIPO_PRODUCTO).attr('data-field', 'DESCRIPCION_PARAMETRO');
                $(_controls.C_PARAMETRO_GENERAL_TIPO_PRODUCTO).FieldLoadRemote({
                    onReady: function (control) {
                        if ($(controls.C_PRODUCTO).val() == '') {
                            if ($.solver.basePath == '/ventas') {
                                $(control).val('07228');
                            };
                            if ($.solver.basePath == '/puntoventa') {
                                $(control).val('07228');
                            };
                            if ($.solver.basePath == '/restaurant') {
                                $(control).val('09994');
                            };
                        }
                        else {
                            const tipo = object.rows[0].C_PARAMETRO_GENERAL_TIPO_PRODUCTO;
                            $(control).val(tipo)
                        }
                    }
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
                };

                if ($(_controls.PRINT_SEPARADO).val() == '*') {
                    $('#CHECK_PRINT_SEPARADO').prop('checked', true);
                }
                else {
                    $('#CHECK_PRINT_SEPARADO').prop('checked', false);
                };

                fnChangeStockIlimitado();
                fnChangePrintSeparado();

                $('#ctaContableVentas').click(function () {
                    estado = true;
                    fnObtenerCtaContable('ventas')
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

                $(controls.C_PARAMETRO_GENERAL_UNIDAD_PRIN).change(function (e) {
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

                        $('#groupCocina').hide();
                        $(controls.C_COCINA).attr('disabled', 'disabled')

                        $('.calculoPrecio').show();
                    }
                    else {
                        $('.zone-promo').hide()
                        $(controls.TIPO_UNIDAD).removeAttr('readonly').css({ 'pointer-events': 'auto' });

                        // Habilitamos el check y mostramos
                        $('.form-check').show();

                        $('#groupCocina').show();
                        $(controls.C_COCINA).removeAttr('disabled')
                        $('.calculoPrecio').hide();
                    }
                });

                var check = $(controls.PROMOCION).val();

                if (check == null || check == '' || check == '&') {
                    $(controls.PROMOCION).val('&')
                    $('.zone-promo').hide()
                    $(controls.TIPO_UNIDAD).removeAttr('readonly').css({ 'pointer-events': 'auto' });
                    $('.form-check').show();
                    $('#groupCocina').show();
                    $(controls.C_COCINA).removeAttr('disabled')
                    $('.calculoPrecio').hide();
                }
                else {
                    $('.zone-promo').show();
                    $(controls.TIPO_UNIDAD).attr('readonly', 'readonly').css({ 'pointer-events': 'none' });
                    $('.form-check').hide();
                    $('#groupCocina').hide();
                    $(controls.C_COCINA).attr('disabled', 'disabled')
                    $('.calculoPrecio').show();
                };

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

                if ($(controls.CALCULO_PRECIO).val() == '') {
                    $('#listaprecios-tab').show();
                }
                else {
                    $('#listaprecios-tab').hide();
                }

                $(controls.CALCULO_PRECIO).change(function () {
                    if ($(controls.CALCULO_PRECIO).val() == '') {
                        $('#listaprecios-tab').show();
                    }
                    else {
                        $('#listaprecios-tab').hide();
                    }
                })

            },
            onReady: function (result, controls, form) {
                document.location = $.solver.baseUrl + '/Mantenimiento/Productos/';
            },
            onError: function (error) {
                $.CloseStatusBar();
                $.ShowError({ error: error });
            }
        });

        //events
        $('#btnAgregar').click(function () {
            $.GetQuery({
                query: ['q_gbl_productoregistro_obtenerprecio_compra_paquete'],
                items: [{
                    C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                    C_PRODUCTO: function () {
                        return $(_controls.C_PRODUCTO).val();
                    },
                    PROMOCION: function () {
                        return $(_controls.PROMOCION).val();
                    }
                }],
                onReady: function (producto) {
                    var precioCompra = 0;

                    if (producto.length > 0) {
                        precioCompra = producto[0].PRECIO_TOTAL;
                    }

                    var unidades = [];

                    unidades.push({
                        value: $(_controls.C_PARAMETRO_GENERAL_UNIDAD_PRIN).val(),
                        label: $(_controls.C_PARAMETRO_GENERAL_UNIDAD_PRIN)[0].args.data.filter(x => x['CODIGO'] == $(_controls.C_PARAMETRO_GENERAL_UNIDAD_PRIN).val())[0].DESCRIPCION
                    });

                    const fila = $(tblPrecios).jqxGrid('getrows').length;
                    var precios = {
                        _rowNum: fila + 1,
                        MODO: 1,
                        C_EMPRESA: empresa,
                        C_PRODUCTO: $('#C_PRODUCTO').val(),
                        C_PRODUCTO_PRECIO: '',
                        C_CLIENTE_CATEGORIA: categoriaClientes[0].label,
                        MONEDA: 'Soles',
                        PRECIO: '',
                        PRECIO_COMPRA: precioCompra,
                        FEC_INI: '',
                        FEC_FIN: '',
                        IND_ESTADO: 'Activo',
                        CODIGO: '',
                        MARCA: '',
                        CONDICION: '',
                        UNIDAD: unidades[0].label,
                        C_PARAMETRO_GENERAL_UNIDAD: unidades[0].value
                    };
                    $(tblPrecios).jqxGrid('addrow', null, precios);
                    $(tblPrecios).jqxGrid('selectrow', fila);
                    $(tblPrecios).jqxGrid('ensurerowvisible', fila);
                }
            })

        });
        $('#btnEliminar').click(function () {
            var rows = $(tblPrecios).jqxGrid('getrows');
            if (rows.length > 0) {
                var selected = $(tblPrecios).jqxGrid('getselectedrowindex')
                if (selected != -1) {
                    if (rows[selected]['C_PRODUCTO_PRECIO'] != '') {
                        arrEliminadoPrecio.push(rows[selected]);
                    }
                    var rowId = $(tblPrecios).jqxGrid('getrowid', selected);
                    $(tblPrecios).jqxGrid('deleterow', rowId);
                    if (selected - 1 != -1) {
                        $(tblPrecios).jqxGrid('selectrow', selected - 1);
                        $(tblPrecios).jqxGrid('ensurerowvisible', selected - 1);
                    }
                    else {
                        if (rows.length > 0) {
                            $(tblPrecios).jqxGrid('selectrow', selected);
                            $(tblPrecios).jqxGrid('ensurerowvisible', selected);
                        }
                    }
                }
            }
        });
        $('#btnAgregarProducto').click(function () {
            if (!buttonState) {
                buttonState = true;
                fnBuscarProductosPromo();
            }
        });
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
        });
        $('#CHECK_STOCK').change(function () {
            fnChangeStockIlimitado();
        });
        $('#CHECK_PRINT_SEPARADO').change(function () {
            fnChangePrintSeparado();
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
        $('.number-input').on('input', function () {
            this.value = this.value.replace(/[^0-9]/g, '');
        });
        $('#guardar').click(function () {
            $.GetQuery({
                query: ['q_ventas_mantenimiento_clienteproducto_validarnombres'],
                items: [{
                    C_EMPRESA: empresa,
                    NOMBRE_PARA_VENTA: function () {
                        return $('form[name=frmRegistroProducto] #NOMBRE_PARA_VENTA').val();
                    },
                    NOMBRE_GENERICO: function () {
                        return $('form[name=frmRegistroProducto] #NOMBRE_GENERICO').val();
                    },
                    C_PRODUCTO: function () {
                        return $('form[name=frmRegistroProducto] #C_PRODUCTO').val()
                    }
                }],
                onError: function (error) {
                    $.ShowError({ error });
                },
                onReady: function (result) {
                    if (result.length == 0) {
                        $('form[name=frmRegistroProducto]').submit();
                    }
                    else if (result.length == 1 && $('form[name=frmRegistroProducto] #C_PRODUCTO').val() == '') {
                        alertify.warning('El producto ya se encuentra registrado.');
                    }
                    else if (result.length == 1 && $('form[name=frmRegistroProducto] #C_PRODUCTO').val() != '') {
                        alertify.warning('El producto ya se encuentra registrado.');
                    }
                    else if (result.length == 2 && $('form[name=frmRegistroProducto] #C_PRODUCTO').val() != '') {
                        $('form[name=frmRegistroProducto]').submit();
                    }
                }
            })
        })

        fnCrearCargaArchivo();

    });
});