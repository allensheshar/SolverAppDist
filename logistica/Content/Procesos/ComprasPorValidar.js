require(["helper", "extras", "datetimepicker"], function () {
    require(["alertify", "bootbox", "moment"], function (alertify, bootbox, moment) {

        alertify.set('notifier', 'position', 'top-center');
        const empresa = $.solver.session.SESSION_EMPRESA;
        const table = '#table';
        const table1 = '#table1';
        const arrProducto = [];
        const arrCentro = [];
        const arrTipoIngreso = [];
        let _controls;

        const fnCrearTabla = function () {
            $(table).CreateGrid({
                query: 'tbl_logistica_procesos_comprasporvalidar_listacomprasborradores',
                items: {
                    C_EMPRESA: empresa,
                    C_TIPO_FILTRO: function () {
                        return $(_controls.C_TIPO_FILTRO).val()
                    },
                    DESDE: function () {
                        return $(_controls.DESDE).val()
                    },
                    HASTA: function () {
                        return $(_controls.HASTA).val()
                    },
                    C_PROVEEDOR: function () {
                        return $(_controls.C_PROVEEDOR).val()
                    },
                    BUSCAR: function () {
                        return $(_controls.BUSCAR).val()
                    },
                    C_DOC: function () {
                        return $(_controls.C_DOC).val()
                    },
                },
                hiddens: ['C_DETALLE', 'NUM'],
                columns: {
                    'C_COMPRA': { text: 'Código', editable: false, width: 100 },
                    'MONEDA': { text: 'Moneda', editable: false, width: 80 },
                    'RAZON_SOCIAL': { text: 'Proveedor', editable: false, width: 300 },
                    'TIPO_DOCUMENTO': { text: 'Tipo de doc.', editable: false, width: 80 },
                    'NRO_COMPROBANTE': { text: 'Nro de comprobante', editable: false, width: 150 },
                    //'FECHA_EMISION': { text: 'Fecha emisión', editable: false},
                    //'FECHA_INGRESO_STOCK': { text: 'Fecha ingreso', editable: false},
                    'CANTIDAD': { text: 'Cantidad', editable: false, cellsAlign: 'right', columnType: 'numberinput', cellsFormat: 'd2', width: 80 },
                    'VALOR_VENTA_UNITARIO': { text: 'Precio', editable: false, cellsAlign: 'right', columnType: 'numberinput', cellsFormat: 'd2', width: 100 },
                    'IGV': { text: 'Igv', editable: false, cellsAlign: 'right', columnType: 'numberinput', cellsFormat: 'd2', width: 100 },
                    'PRECIO': { text: 'Total', editable: false, cellsAlign: 'right', columnType: 'numberinput', cellsFormat: 'd2', width: 100 },
                    'TIPO_INGRESO': {
                        text: 'Tipo de ingreso',
                        editable: true,
                        width: 150,
                        columntype: 'dropdownlist',
                        createeditor: function (row, value, editor) {
                            var estadoSource =
                            {
                                datatype: "array",
                                datafields: [
                                    { name: 'label', type: 'string' },
                                    { name: 'value', type: 'string' }
                                ],
                                localdata: arrTipoIngreso
                            };

                            var myadapter = new $.jqx.dataAdapter(estadoSource, { autoBind: true });

                            editor.jqxDropDownList({ source: myadapter, displayMember: 'label', valueMember: 'value' });
                        },
                        cellendedit: function (row, datafield, columntype, oldvalue, newvalue) {
                        }
                    },
                    'CENTRO_COSTO': {
                        text: 'Centro de costo',
                        editable: true,
                        width: 150,
                        columntype: 'dropdownlist',
                        createeditor: function (row, value, editor) {
                            var estadoSource =
                            {
                                datatype: "array",
                                datafields: [
                                    { name: 'label', type: 'string' },
                                    { name: 'value', type: 'string' }
                                ],
                                localdata: arrCentro
                            };

                            var myadapter = new $.jqx.dataAdapter(estadoSource, { autoBind: false });

                            editor.jqxDropDownList({ source: myadapter, displayMember: 'label', valueMember: 'value' });
                        }
                    },
                    'NOMBRE_PARA_VENTA': {
                        text: 'Producto',
                        editable: true,
                        width: 150,
                        columntype: 'dropdownlist',
                        createeditor: function (row, value, editor) {
                            var estadoSource =
                            {
                                datatype: "array",
                                datafields: [
                                    { name: 'label', type: 'string' },
                                    { name: 'value', type: 'string' }
                                ],
                                localdata: arrProducto
                            };

                            var myadapter = new $.jqx.dataAdapter(estadoSource, { autoBind: true });

                            editor.jqxDropDownList({ source: myadapter, displayMember: 'label', valueMember: 'value' });
                        },
                        cellendedit: function (row, datafield, columntype, oldvalue, newvalue) {
                        }
                    },
                    'DESCRIPCION': { text: 'Descripcion', width: 300, editable: false },
                },
                config: {
                    virtualmode: false,
                    height: 700,
                    pageSize: 999999,
                    pageable: false,
                    sortable: false,
                    editable: true,
                    selectionmode: 'checkbox',
                }
            });

            $(table1).CreateGrid({
                query: 'tbl_logistica_procesos_comprasporvalidar_listacomprasqr',
                items: {
                    C_EMPRESA: empresa,
                    C_TIPO_FILTRO: function () {
                        return $(_controls.C_TIPO_FILTRO).val()
                    },
                    DESDE: function () {
                        return $(_controls.DESDE).val()
                    },
                    HASTA: function () {
                        return $(_controls.HASTA).val()
                    },
                    C_PROVEEDOR: function () {
                        return $(_controls.C_PROVEEDOR).val()
                    },
                    BUSCAR: function () {
                        return $(_controls.BUSCAR).val()
                    },
                    C_DOC: function () {
                        return $(_controls.C_DOC).val()
                    },
                },
                sortcolumn: 'C_COMPRA',
                sortdirection: 'DESC',
                columns: {
                    'C_COMPRA': { text: 'Código', width: 90 },
                    'RUC': { text: 'Ruc', width: 80 },
                    'RAZON_SOCIAL': { text: 'Proveedor', width: 300 },
                    'TIPO_DOCUMENTO': { text: 'Tipo de doc.', width: 150 },
                    'SERIE': { text: 'Serie', width: 80 },
                    'COMPROBANTE': { text: 'Nro de comprobante', width: 150 },
                    'FECHA_EMISION': { text: 'Fecha emisión', width: 100 },
                    'IGV': {
                        text: 'Igv', width: 100,
                        cellsAlign: 'right',
                        cellsFormat: 'd2',
                        columnType: 'numberinput',
                    },
                    'TOTAL_COMPROBANTE': {
                        text: 'Total',
                        width: 100,
                        cellsAlign: 'right',
                        cellsFormat: 'd2',
                        columnType: 'numberinput',
                    },
                    'C_ARCHIVO_FOTO': {
                        width: 100,
                        text: 'Ver',
                        cellsrenderer: function (row, columnfield, value, defaulthtml, columnproperties) {
                            return `<div class="mt-1 jqx-grid-cell-middle-align"><a href="${$.solver.services.api}/Service/ViewFile/${value}" target="_blank" style="margin-bottom: 2px;">Ver documento</a></div>`;
                        }},

                },
                config: {
                    height: 700,
                    pageSize: 999999,
                }
            });

        };

        $('.c_empresa').attr('data-c_empresa', empresa);

        $('form[name=frm]').ValidForm({
            type: -1,
            onReady: function () {
                $(table).jqxGrid('updatebounddata')
                $(table1).jqxGrid('updatebounddata')
            },
            onDone: function (_, controls) {
                $(controls.DESDE).datetimepicker({
                    format: 'DD/MM/YYYY',
                    locale: 'es'
                });
                $(controls.HASTA).datetimepicker({
                    format: 'DD/MM/YYYY',
                    locale: 'es'
                });

                _controls = controls;
                $.GetQuery({
                    query: ['q_logistica_procesos_comprasporvalidar_obtenerproductos', 'q_ventas_procesos_ventaregistro_obtenercentrocosto'],
                    items: [{ C_EMPRESA: empresa }, { EMPRESA: empresa }],
                    onReady: function (result) {
                        var res1 = result['q_logistica_procesos_comprasporvalidar_obtenerproductos'].result.rows;
                        var res2 = result['q_ventas_procesos_ventaregistro_obtenercentrocosto'].result.rows;
                        $.each(res1, function (i, v) {
                            arrProducto.push({
                                value: v.C_PRODUCTO,
                                label: v.NOMBRE
                            })
                        });
                        $.each(res2, function (i, v) {
                            arrCentro.push({
                                value: v.C_UNIDAD_NEGOCIO,
                                label: v.NOMBRE
                            });
                        });

                        arrTipoIngreso.push({ value: 'M', label: 'Mercadería' })
                        arrTipoIngreso.push({ value: 'A', label: 'Activo' })

                        fnCrearTabla();
                    }
                });
            }
        })

        $('#btnProcesar').click(function () {
            var rows = $(table).jqxGrid('getselectedrowindexes');
            $.each(rows, function (i, v) {
                var row = $(table).jqxGrid('getrows')[v];
                if (row.TIPO_INGRESO != '' && row.NOMBRE_PARA_VENTA != '' && row.CENTRO_COSTO != '') {
                    $.AddPetition({
                        table: 'LOG.COMPRA',
                        type: 2,
                        condition: `C_EMPRESA = '${empresa}' AND C_COMPRA = '${row.C_COMPRA}'`,
                        items: $.ConvertObjectToArr({
                            C_EMPRESA: empresa,
                            C_COMPRA: row.C_COMPRA,
                            IND_ESTADO_COMPRA: 'R',
                            TIPO_INGRESO: arrTipoIngreso.filter(x => x['label'] == row.TIPO_INGRESO)[0].value
                        })
                    });
                    $.AddPetition({
                        table: 'LOG.COMPRA_DETALLE',
                        type: 2,
                        condition: `C_EMPRESA = '${empresa}' AND C_COMPRA = '${row.C_COMPRA}' AND C_DETALLE = '${row.C_DETALLE}'`,
                        items: $.ConvertObjectToArr({
                            C_EMPRESA: empresa,
                            C_COMPRA: row.C_COMPRA,
                            C_DETALLE: row.C_DETALLE,
                            C_PRODUCTO: arrProducto.filter(x => x['label'] == row.NOMBRE_PARA_VENTA)[0].value,
                            C_UNIDAD_NEGOCIO: arrCentro.filter(x => x['label'] == row.CENTRO_COSTO)[0].value
                        })
                    });
                }
            });

            if (rows.length > 0) {
                $.SendPetition({
                    connectToLogin: 'S',
                    onBefore: function () { $.DisplayStatusBar({ message: 'Actualizando documentos' }); },
                    onReady: function (result) {
                        $.CloseStatusBar();
                        alertify.success('Se actualizaron los documentos.');
                        $(table).jqxGrid('updatebounddata');
                    },
                    onError: function (_error) {
                        $.CloseStatusBar();
                        $.ShowError({ error: _error });
                    }
                });
            }
        });


        $('#btnDescargar').click(function () {
            if ($('.active').attr('id') == 'archivo-tab') {
                $.DownloadFile({
                    query: 'dw_logistica_procesos_comprasporvalidar_listacomprasborradores',
                    params: {
                        C_EMPRESA: empresa,
                        C_TIPO_FILTRO: function () {
                            return $(_controls.C_TIPO_FILTRO).val()
                        },
                        DESDE: function () {
                            return $(_controls.DESDE).val()
                        },
                        HASTA: function () {
                            return $(_controls.HASTA).val()
                        },
                        C_PROVEEDOR: function () {
                            return $(_controls.C_PROVEEDOR).val()
                        },
                        BUSCAR: function () {
                            return $(_controls.BUSCAR).val()
                        },
                        C_DOC: function () {
                            return $(_controls.C_DOC).val()
                        },
                    },
                    nameFile: 'Desde archivo'
                });
            }
            else {
                $.DownloadFile({
                    query: 'dw_logistica_procesos_comprasporvalidar_listacomprasqr',
                    params: {
                        C_EMPRESA: empresa,
                        C_TIPO_FILTRO: function () {
                            return $(_controls.C_TIPO_FILTRO).val()
                        },
                        DESDE: function () {
                            return $(_controls.DESDE).val()
                        },
                        HASTA: function () {
                            return $(_controls.HASTA).val()
                        },
                        C_PROVEEDOR: function () {
                            return $(_controls.C_PROVEEDOR).val()
                        },
                        BUSCAR: function () {
                            return $(_controls.BUSCAR).val()
                        },
                        C_DOC: function () {
                            return $(_controls.C_DOC).val()
                        },
                    },
                    nameFile: 'Desde qr'
                });
            }

        })

    });
});