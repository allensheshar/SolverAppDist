require(["helper", "extras", "datetimepicker", "bootstrap-select", "inputmask"], function () {
    require(["alertify", "bootbox", "moment", "numeral"], function (alertify, bootbox, moment, numeral) {
        alertify.set('notifier', 'position', 'top-center');

        const empresa = $.solver.session.SESSION_EMPRESA;
        const table = '#tblDetalle';
        const tblGuia = '#tblGuia';
        const form = 'form[name=frmCompra]';
        let estado = false;
        let arrEliminadas = [];
        let arrEliminadasGuia = [];
        let arrRetenciones = [];
        let _controls;

        $('.c_empresa').attr('data-empresa', empresa);

        const fnObtenerAlerta = function (message) {
            alertify.alert().setting({
                'title': 'Mensaje del Sistema',
                'message': message,
            }).show();
        };
        const fnCalcularTotales = function () {
            const filas = $(tblDetalle).jqxGrid('getrows');
            const simboloMoneda = $(_controls.C_PARAMETRO_GENERAL_MONEDA)[0].args.data.filter(x => x['CODIGO'] == $(_controls.C_PARAMETRO_GENERAL_MONEDA).val())[0].CODIGO_PARAMETRO_2;
            const tipoOperacion = $('#TIPO_OPERACION').val();
            const tipoDetraccion = $('#TIPO_DETRACCION').val();

            let opGravadas = 0.00;
            let igv = 0.00;
            let opInafecta = 0.00;
            let opExonerada = 0.00;
            let importeTotal = 0.00;
            let opGratuitas = 0.00;
            let descuentos = 0.00;
            let opExportacion = 0.00;
            let opDetraccion = 0.00;
            let opRetencion = 0.00;
            let recargoConsumoTotal = 0.00;
            let impuesto_retencion = 0.00;

            const tipoDocumento = $(_controls.C_PARAMETRO_GENERAL_TIPO_DOCUMENTO).val();
            $.each(filas, function (i, v) {
                var codAfectacion = parseFloat(v.CODIGO_AFECTACION_IGV_CABECERA)
                if (v.CODIGO_AFECTACION_IGV == '01' || v.CODIGO_AFECTACION_IGV == '05') {
                    opGravadas += (v.PRECIO_BASE * codAfectacion)
                    recargoConsumoTotal += v.RECARGO_CONSUMO;
                }
                if (v.CODIGO_AFECTACION_IGV == '02') {
                    opInafecta += (v.PRECIO_BASE * codAfectacion)
                }
                if (v.CODIGO_AFECTACION_IGV == '03') {
                    opExonerada += (v.PRECIO_BASE * codAfectacion)
                }
                if (v.CODIGO_AFECTACION_IGV == '04') {
                    opExportacion += (v.PRECIO_BASE * codAfectacion)
                }
                if (v.CODIGO_AFECTACION_IGV_CABECERA == '0') {
                    opGratuitas += v.PRECIO_TOTAL;
                }

                descuentos += v.DSCTO_PARCIAL;

                igv += (v.IGV * codAfectacion);

               
                importeTotal += (v.PRECIO_TOTAL * codAfectacion);
            });

            //if (($('#C_PARAMETRO_GENERAL_MONEDA').val() == '07235' ? (importeTotal * parseFloat($('#TC').val())) : importeTotal) > 700) {
                if (tipoOperacion == '07400' && tipoDetraccion != '') {
                    var calculoDetraccion = $('#TIPO_DETRACCION')[0].args.data.filter(x => x['CODIGO'] == tipoDetraccion)[0].CALCULO
                    opDetraccion = importeTotal * (calculoDetraccion / 100);
                }

                // Si el emisor no es retenedor y cliente si
                //if (emisorRetenedor == '&' && clienteRetenedor == '*' && !(tipoOperacion == '07400')) {
                //    var calculoRetencion = 3;
                //    opRetencion = importeTotal * (calculoRetencion / 100);
                //}
            //}
            if (tipoDocumento == '10245' && importeTotal > 1500 && $(_controls.CONSTANCIA_REF).val() == '') {
                impuesto_retencion = importeTotal * 0.08;
                importeTotal = importeTotal - impuesto_retencion;
            }

            $(form + ' .SIGNO_MONEDA').text(simboloMoneda);
            $(form + ' #OP_GRAVADAS').text(opGravadas.toFixed(2));
            $(form + ' #IGV').text(igv.toFixed(2));
            $(form + ' #OP_INAFECTA').text(opInafecta.toFixed(2));
            $(form + ' #OP_EXONERADA').text(opExonerada.toFixed(2));
            $(form + ' #TOTAL').text(importeTotal.toFixed(2));
            $(form + ' #OPE_GRATUITAS').text(opGratuitas.toFixed(2));
            $(form + ' #DESCUENTOS').text(descuentos.toFixed(2));
            $(form + ' #OP_EXPORTACION').text(opExportacion.toFixed(2));
            $(form + ' #IMPUESTO_RETENCION').text(impuesto_retencion.toFixed(2));

            $(form + ' #RECARGO_CONSUMO').text(recargoConsumoTotal.toFixed(2))
            $(form + ' #OP_DETRACCION').text(opDetraccion.toFixed(2));
            $(form + ' #OP_RETENCION').text(opRetencion.toFixed(2));

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

            if (tipoOperacion != '07400') {
                $('.detraccion').hide();
            }
            else {
                $('.detraccion').show();
            }

            if (opRetencion > 0) {
                $('.retencion').show();
            }
            else {
                $('.retencion').hide();
            }

            $(_controls.BASE_IMPONIBLE).val(numeral(precioBase).format('0.000'));
            $(_controls.IGV).val(numeral(precioIgv).format('0.000'));
            $(_controls.DESCUENTO).val(numeral(precioDescuento).format('0.000'));
            $(_controls.TOTAL).val(numeral(precioTotal).format('0.000'));
            $(_controls.OPERACIONES_GRATUITAS).val(opGratuitas);
        };
        const fnEscogerProducto = function (_object) {
            $.GetData({
                title: 'Producto',
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

                        //$(_object).find('#AFECTACION_IGV').val(row['C_PARAMETRO_GENERAL_AFECTACION_IGV']);
                        if ($(_object).find('#AFECTACION_IGV')[0].args.data.filter(x => x['CODIGO'] == row['C_PARAMETRO_GENERAL_AFECTACION_IGV']).length > 0) {
                            $(_object).find('#AFECTACION_IGV').val(row['C_PARAMETRO_GENERAL_AFECTACION_IGV']);
                        }


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
                            $(_object).find('.divAlmacen').hide();
                            $(_object).find('#FLAG_GENERA_STOCK_AUT').val('&')
                            $(_object).find('#C_ALMACEN').removeAttr('required');
                        }
                        else {
                            $(_object).find('#CANTIDAD').removeAttr('readonly');
                            $(_object).find('#CANTIDAD').val('');
                            $('#CANTIDAD').focus();
                            $('#CANTIDAD').trigger('keyup');
                            var tipoIngreso = $(_controls.TIPO_INGRESO).val()
                            if (tipoIngreso == 'M' || tipoIngreso == 'A') {
                                $(object).find('.divAlmacen').show();
                            }
                            else {
                                $(object).find('.divAlmacen').hide();
                            }
                            $(_object).find('#C_ALMACEN').attr('required');
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

                    $(modal).find('.modal-dialog').attr('style', 'max-width: 65% !important; margin-top: 4%');
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
                                hiddens: ['C_PARAMETRO_GENERAL_TIPO_PRODUCTO', 'C_PARAMETRO_GENERAL_AFECTACION_IGV', 'C_ARCHIVO_FOTO', 'C_UNIDAD_NEGOCIO', 'C_UNIDAD_PRIN', 'C_UNIDAD_AUX', 'FACTOR'],
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
                uriData: $.solver.baseUrl + '/Mantenimiento/BusquedaProductoCompra/',
                location: 'float',
                type: 'GET',
                isPage: true,
                onReady: function (object, modalBuscar) {
                    $(modalBuscar).find('.modal-dialog').css({ 'max-width': '75%' });

                    $(modalBuscar).find('#btnEscogerProducto').click(function () {
                        $('#btnEscogerProducto').attr('disabled', true);
                        fnEscogerProducto(object);
                    });

                    $(object).find('form[name=frmBusquedaProducto]').ValidForm({
                        type: -1,
                        onDone: function (controls) {
                            var tipoOperacionCabecera = $('#TIPO_OPERACION').val();
                            var tipoAfectacion = '1'
                            if (tipoOperacionCabecera == '07385') {
                                tipoAfectacion = '2'
                            }
                            else if (tipoOperacionCabecera == '10246') {
                                tipoAfectacion = '3'
                            }
                            else {
                                tipoAfectacion = '1'
                            }

                            $(object).find('#AFECTACION_IGV').attr('data-tipoafectacion', tipoAfectacion).FieldLoadRemote({
                                onReady: function () {
                                    if (indice != undefined) {
                                        const fila = $(tblDetalle).jqxGrid('getrows')[indice];
                                        const c_producto = fila['C_PRODUCTO'];
                                        const nomProducto = fila['NOMBRE_ORIGINAL'];
                                        const descripcion = fila['DESCRIPCION'];
                                        const incluyeIgv = fila['INCLUYE_IGV'];
                                        const centro_costo = fila['C_UNIDAD_NEGOCIO'];
                                        const cantidad = fila['CANTIDAD'];
                                        const precio = parseFloat(fila['PRECIO']);
                                        const c_tipo_producto = fila['C_PARAMETRO_GENERAL_TIPO_PRODUCTO'];
                                        const c_unidad = fila['C_PARAMETRO_GENERAL_UNIDAD'];
                                        const unidad = fila['UNIDAD'];
                                        const unidadPrin = fila['UND_PRIN'];
                                        const cUnidadPrin = fila['C_UND_PRIN'];
                                        const unidadAux = fila['UND_AUX'];
                                        const cUnidadAux = fila['C_UND_AUX'];
                                        const factor = fila['FACTOR'];
                                        const c_almacen = fila['C_ALMACEN'];
                                        const flag_genera_stock = fila['FLAG_GENERA_STOCK_AUT'];
                                        const afectacion_igv = fila['AFECTACION_IGV'];

                                        const recargo_consumo = fila['RECARGO_CONSUMO'];
                                        const porc_igv = fila['PORC_IGV'];
                                        const porc_rc = fila['PORC_RC'];
                                        const flag_icbper = fila['FLAG_ICBPER'];

                                        $(controls).find('#C_PRODUCTO').val(c_producto);
                                        $(controls).find('#NOMBRE_PARA_VENTA').val(nomProducto);
                                        $(controls).find('#PRODUCTO').val(nomProducto);
                                        $(controls).find('#DESCRIPCION').val(descripcion);
                                        $(controls).find('#CANTIDAD').val(cantidad);
                                        $(controls).find('#PRECIO').val(precio);
                                        $(controls).find('#CHECK_IGV').attr('checked', (incluyeIgv == 'true' || incluyeIgv == true) ? true : false);
                                        $(controls).find('#CENTRO_COSTO').val(centro_costo);
                                        $(controls).find('#UNIDAD_PRIN').val(unidadPrin);
                                        $(controls).find('#C_UNIDAD_PRIN').val(cUnidadPrin);
                                        $(controls).find('#UNIDAD_AUX').val(unidadAux);
                                        $(controls).find('#C_UNIDAD_AUX').val(cUnidadAux);
                                        $(controls).find('#FACTOR').val(factor);
                                        $(controls).find('#C_PARAMETRO_GENERAL_TIPO_PRODUCTO').val(c_tipo_producto);
                                        if (c_almacen != '') {
                                            $(controls).find('#C_ALMACEN').val(c_almacen);
                                        }
                                        $(controls).find('#FLAG_GENERA_STOCK_AUT').val(flag_genera_stock);
                                        $(controls).find('#AFECTACION_IGV').val(afectacion_igv);

                                        $(controls).find('#C_PARAMETRO_GENERAL_UNIDAD').attr('data-C_PRODUCTO', c_producto);
                                        $(controls).find('#C_PARAMETRO_GENERAL_UNIDAD').FieldLoadRemote({
                                            onReady: function () {
                                                $(controls).find('#C_PARAMETRO_GENERAL_UNIDAD').val(c_unidad);
                                            }
                                        });

                                        $(controls).find('#PORCENTAJE_IGV').val(porc_igv);
                                        $(controls).find('#PORCENTAJE_RC').val(porc_rc);
                                        $(controls).find('#FLAG_ICBPER').prop('checked', (flag_icbper == '*' ? true : false))
                                    }
                                    else {
                                        $(modalBuscar).find('#btnEscogerProducto').trigger('click');
                                    }

                                    $(object).find('.number-input').on('input', function () {
                                        this.value = this.value.replace(/[^0-9]/g, '');
                                    });

                                    if ($(controls).find('#FLAG_GENERA_STOCK_AUT').val() == '*') {
                                        $(object).find('.almacen').show()
                                        $(object).find('#CHECK_GENERA_STOCK').prop('checked', 'checked')
                                        $(object).find('#C_ALMACEN').attr('required', 'required');
                                    }
                                    else {
                                        $(object).find('.almacen').hide()
                                        $(object).find('#C_ALMACEN').removeAttr('required');
                                    }

                                    $(object).find('#CHECK_GENERA_STOCK').change(function () {
                                        if ($(object).find('#CHECK_GENERA_STOCK').is(':checked')) {
                                            $(object).find('.almacen').show()
                                            $(controls).find('#FLAG_GENERA_STOCK_AUT').val('*')
                                            $(object).find('#C_ALMACEN').attr('required', 'required');
                                        }
                                        else {
                                            $(object).find('.almacen').hide()
                                            $(controls).find('#FLAG_GENERA_STOCK_AUT').val('&')
                                            $(object).find('#C_ALMACEN').removeAttr('required');
                                        }
                                    });

                                    if ($('#C_PARAMETRO_GENERAL_TIPO_PRODUCTO').val() == '07229') {
                                        $('.divAlmacen').hide();
                                        $(controls).find('#FLAG_GENERA_STOCK_AUT').val('&')
                                    }
                                    else {
                                        $('.divAlmacen').show();
                                    }

                                    $(object).find('.checkbox').change(function () {
                                        $(object).find('.checkbox').prop('checked', false)
                                        $(this).prop('checked', true);
                                    });

                                    if (tipoAfectacion == '3') {
                                        $(object).find('.porcentajes').hide();
                                    }

                                    var tipoIngreso = $(_controls.TIPO_INGRESO).val()

                                    if (tipoIngreso == 'S') {
                                        $(object).find('.servicios').hide();
                                    }

                                    if (tipoIngreso == 'M' || tipoIngreso == 'A') {
                                        $(object).find('.divAlmacen').show();
                                    }
                                    else {
                                        $(object).find('.divAlmacen').hide();
                                    }

                                    if (tipoOperacionCabecera == '07385') {
                                        $(object).find('.porcentajes').hide();
                                    }

                                    $(controls).find('#TOTAL').removeAttr('readonly')
                                }
                            })
                        },
                        onReady: function (_, controls) {
                            const fila = $(tblDetalle).jqxGrid('getrows')[indice];
                            const c_producto = $(controls.C_PRODUCTO).val();
                            const c_unidad_medida = $(controls.C_PARAMETRO_GENERAL_UNIDAD).val();
                            if (c_producto == '') {
                                fnObtenerAlerta('Por favor seleccione un producto');
                            }
                            else if (
                                ($(controls.C_PARAMETRO_GENERAL_TIPO_PRODUCTO).val() != '07229') &&
                                (
                                    (indice == undefined && $(tblDetalle).jqxGrid('getrows').filter(x => x['C_PRODUCTO'] == c_producto && x['C_PARAMETRO_GENERAL_UNIDAD'] == c_unidad_medida).length > 0) ||
                                    (indice != undefined && (fila['C_PRODUCTO'] != c_producto && $(tblDetalle).jqxGrid('getrows').filter(x => x['C_PRODUCTO'] == c_producto).length > 0))
                                )
                            ) {
                                alertify.warning('No se puede agregar un mismo producto al detalle.');
                            }
                            else if ($(controls.CANTIDAD).val() <= 0) {
                                fnObtenerAlerta('Por favor ingrese una cantidad.');
                            }
                            else if ($(controls.PRECIO).val() <= 0) {
                                fnObtenerAlerta('Por favor ingrese el precio.');
                            }
                            else {
                                const descripcion = $(controls.DESCRIPCION).val();
                                const cantidad = parseFloat($(controls.CANTIDAD).val());
                                const precio = parseFloat($(controls.PRECIO).val());
                                const nomProducto = $(controls.NOMBRE_PARA_VENTA).val();
                                const nomProductoCompleto = $(controls.NOMBRE_PARA_VENTA).val();

                                const flag_genera_stock = $(controls.FLAG_GENERA_STOCK_AUT).val();
                                let c_almacen = '';
                                let nombre_almacen = ''

                                if (flag_genera_stock == '*') {
                                    c_almacen = $(controls.C_ALMACEN).val();
                                    nombre_almacen = $(controls.C_ALMACEN)[0].args.data.filter(x => x['C_ALMACEN'] == c_almacen)[0].NOMBRE_ALMACEN;
                                }

                                let c_tipo_producto = $(controls.C_PARAMETRO_GENERAL_TIPO_PRODUCTO).val();

                                const baseImponible = precio * cantidad;
                                const incluyeIgv = $(controls.CHECK_IGV).is(':checked');
                                const porcDescuento = 0;
                                const afectacion_igv = $(controls.AFECTACION_IGV).val();

                                const porc_recargo_consumo = parseFloat($(controls.PORCENTAJE_RC).val());
                                const porc_igv = parseFloat($(controls.PORCENTAJE_IGV).val())

                                var valorUnitario = 0;
                                var codigoAfectacionIgv = $(controls.AFECTACION_IGV)[0].args.data.filter(x => x['CODIGO'] == $(controls.AFECTACION_IGV).val())[0]['CODIGO_PARAMETRO_2'];
                                var codigoAfectacionIgvCab = $(controls.AFECTACION_IGV)[0].args.data.filter(x => x['CODIGO'] == $(controls.AFECTACION_IGV).val())[0]['CODIGO_PARAMETRO_3'];
                                if (incluyeIgv && codigoAfectacionIgv == '01') valorUnitario = precio / ((1 + (porc_igv / 100)) + (porc_recargo_consumo / 100));
                                else valorUnitario = precio;

                                const dsctoUnitario = valorUnitario * (porcDescuento / 100);
                                const valorVentaUnitario = valorUnitario - dsctoUnitario;
                                var igvUnitario = 0;
                                if (codigoAfectacionIgv == '01') igvUnitario = valorVentaUnitario * (porc_igv / 100);
                                else igvUnitario = 0;

                                var recargo_consumo = (valorUnitario * (porc_recargo_consumo / 100) * cantidad)

                                var dsctoUnitarioIgv = 0;
                                if (codigoAfectacionIgv == '01') dsctoUnitarioIgv = dsctoUnitario * (porc_igv / 100);
                                else dsctoUnitarioIgv = 0;

                                const precioBase = valorVentaUnitario * cantidad;
                                const igv = igvUnitario * cantidad;
                                const precioTotal = igv + precioBase + recargo_consumo;
                                const dsctoParcial = (dsctoUnitario + dsctoUnitarioIgv) * cantidad;

                                const c_unidad = $(controls.C_PARAMETRO_GENERAL_UNIDAD).val();
                                let unidad = '';
                                if (c_unidad != null) {
                                    unidad = $(controls.C_PARAMETRO_GENERAL_UNIDAD)[0].args.data.filter(x => x['CODIGO'] == $(controls.C_PARAMETRO_GENERAL_UNIDAD).val())[0].DESCRIPCION;
                                }
                                const c_unidad_negocio = $(controls.CENTRO_COSTO).val();
                                const unidad_negocio = $(controls.CENTRO_COSTO)[0].args.data.filter(x => x['C_UNIDAD_NEGOCIO'] == c_unidad_negocio)[0];

                                const c_unidadPrin = $(controls.C_UNIDAD_PRIN).val();
                                const c_unidadAux = $(controls.C_UNIDAD_AUX).val();
                                const unidadPrin = $(controls.UNIDAD_PRIN).val();
                                const unidadAux = $(controls.UNIDAD_AUX).val();

                                const factor = parseFloat($(controls.FACTOR).val())

                                let stockPrin = 0;
                                let stockAux = 0;

                                if (c_unidad == c_unidadPrin) stockPrin = cantidad
                                else stockPrin = cantidad / factor

                                if (c_unidad == c_unidadPrin) stockAux = cantidad * factor
                                else stockAux = cantidad

                                const flag_icbper = $(controls.FLAG_ICBPER).is(':checked');

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
                                    $(table).jqxGrid('getrows')[indice]['C_ALMACEN'] = c_almacen;
                                    $(table).jqxGrid('getrows')[indice]['NOMBRE_ALMACEN'] = nombre_almacen;

                                    $(table).jqxGrid('getrows')[indice]['C_PARAMETRO_GENERAL_UNIDAD'] = c_unidad;
                                    $(table).jqxGrid('getrows')[indice]['UNIDAD'] = unidad;
                                    $(table).jqxGrid('getrows')[indice]['C_UND_PRIN'] = c_unidadPrin;
                                    $(table).jqxGrid('getrows')[indice]['UND_PRIN'] = unidadPrin;
                                    $(table).jqxGrid('getrows')[indice]['C_UND_AUX'] = c_unidadAux;
                                    $(table).jqxGrid('getrows')[indice]['UND_AUX'] = unidadAux;
                                    $(table).jqxGrid('getrows')[indice]['STOCK_PRIN'] = stockPrin;
                                    $(table).jqxGrid('getrows')[indice]['STOCK_AUX'] = stockAux;
                                    $(table).jqxGrid('getrows')[indice]['FACTOR'] = factor;
                                    $(table).jqxGrid('getrows')[indice]['FLAG_GENERA_STOCK_AUT'] = flag_genera_stock;

                                    $(table).jqxGrid('getrows')[indice]['RECARGO_CONSUMO'] = recargo_consumo;
                                    $(table).jqxGrid('getrows')[indice]['PORC_IGV'] = porc_igv;
                                    $(table).jqxGrid('getrows')[indice]['PORC_RC'] = porc_recargo_consumo;
                                    $(table).jqxGrid('getrows')[indice]['FLAG_ICBPER'] = (flag_icbper ? '*' : '&');

                                    $(table).jqxGrid('refresh');


                                }
                                else {
                                    $(table).jqxGrid('addrow', null, {
                                        _rowNum: $(table).jqxGrid('getrows').length + 1,
                                        C_EMPRESA: empresa,
                                        C_COMPRA: '',
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
                                        C_ALMACEN: c_almacen,
                                        NOMBRE_ALMACEN: nombre_almacen,

                                        UNIDAD: unidad,
                                        C_PARAMETRO_GENERAL_UNIDAD: c_unidad,
                                        UND_PRIN: unidadPrin,
                                        UND_AUX: unidadAux,
                                        C_UND_PRIN: c_unidadPrin,
                                        C_UND_AUX: c_unidadAux,
                                        STOCK_PRIN: stockPrin,
                                        STOCK_AUX: stockAux,
                                        FACTOR: factor,
                                        FLAG_GENERA_STOCK_AUT: flag_genera_stock,

                                        RECARGO_CONSUMO: recargo_consumo,
                                        PORC_IGV: porc_igv,
                                        PORC_RC: porc_recargo_consumo,
                                        FLAG_ICBPER: (flag_icbper ? '*' : '&'),
                                    });
                                }
                                fnCalcularTotales();
                                bootbox.hideAll();
                            }
                        }
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
                        fnCalcularTotales();
                    },
                    function () { alertify.error('Operación cancelada'); }
                ).set('labels', { ok: 'Si', cancel: 'No' }).set('defaultFocus', 'ok').set('closable', false);
            };
            const fnEditarProducto = function (indice) {
                fnBuscarProducto(indice);
            }
            $(table).CreateGrid({
                query: 'q_ventas_procesos_nuevacompra_consultardetalle',
                items: {
                    C_COMPRA: function () { return $(_controls.C_COMPRA).val(); },
                    C_EMPRESA: empresa
                },
                hiddens: ['C_DETALLE', 'C_COMPRA', 'C_EMPRESA', 'IND_SERVICIO', 'MONEDA', 'CODIGO_AFECTACION_IGV', 'BASE_IMPONIBLE', 'INCLUYE_IGV',
                    'VALOR_UNITARIO', 'DSCTO_UNITARIO', 'VALOR_VENTA_UNITARIO', 'AFECTACION_IGV', 'IGV_UNITARIO', 'DESCRIPCION', 'NUM', 'NOMBRE_ORIGINAL',
                    'C_PARAMETRO_GENERAL_TIPO_PRODUCTO', 'UNIDAD_AUX', 'CODIGO_AFECTACION_IGV_CABECERA', 'DSCTO_UNITARIO_IGV', 'C_UND_PRIN', 'UND_PRIN',
                    'C_UND_AUX', 'UND_AUX', 'STOCK_PRIN', 'STOCK_AUX', 'FACTOR', 'C_UNIDAD_NEGOCIO', 'C_PARAMETRO_GENERAL_UNIDAD', 'PORC_DSCTO', 'DSCTO_PARCIAL',
                    'C_ALMACEN', 'FLAG_GENERA_STOCK_AUT', 'RECARGO_CONSUMO', 'PORC_IGV', 'PORC_RC', 'FLAG_ICBPER'],
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
                    'CANTIDAD': {
                        text: 'Cantidad',
                        width: 100,
                        cellsAlign: 'right',
                        columnType: 'numberinput',
                        cellsFormat: 'd2',
                    },
                    'NOMBRE_UNIDAD_NEGOCIO': {
                        text: 'Unidad de negocio',
                        width: 150
                    },
                    'UNIDAD': {
                        text: 'Und. medida',
                        width: 100,
                    },
                    'PRECIO': {
                        text: 'Precio',
                        width: 100,
                        cellsAlign: 'right',
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
                    'NOMBRE_ALMACEN': {
                        text: 'Almacén',
                        width: 120
                    },
                    'ACCIONES': {
                        text: 'Acciones',
                        width: 120,
                        createwidget: function (row, column, value, htmlElement) {
                            $(tblDetalle).jqxGrid('refresh');
                        },
                        initwidget: function (rowIndex, column, value, htmlElement) {
                            if ($(_controls.IND_ESTADO_COMPRA).val() != '&') {
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
                            }



                        },
                    }
                },
                config: {
                    virtualmode: false,
                    height: 305,
                    pageSize: 999999,
                    pageable: false,
                    sortable: false,
                    editable: false,
                }
            });
            $(table).on('bindingcomplete', function () {
                fnCalcularTotales();
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
                        $(form + ' #NOMBRE').val(dataProveedor['RAZON_SOCIAL']);
                        $(form + ' #DIRECCION').val(dataProveedor['DIRECCION_FISCAL']);
                        $(form + ' #TIPO_DOC').text(dataProveedor['TIPO_DOCUMENTO']);
                        $(form + ' #RUC').text(dataProveedor['RUC_CLIENTE']);
                    }
                },
                onError: function (error) { $.ShowError({ error: error }); }
            });
        };
        const fnBuscarProveedor = function () {
            $.GetData({
                title: 'Busqueda de proveedor',
                uriData: $.solver.baseUrl + '/Mantenimiento/BusquedaProveedor/',
                location: 'float',
                type: 'GET',
                isPage: true,
                onReady: function (objectBuscarProveedor, modalBuscarProveedor) {
                    $(modalBuscarProveedor).find('.modal-dialog').css({ 'max-width': '60%' });

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
                        onReady: function (form, controls) { tableBuscarProveedor.jqxGrid('updatebounddata'); },
                        onError: function (error) { $.ShowError({ error: error }); }
                    });
                    $(tableBuscarProveedor).CreateGrid({
                        query: 'gbl_listarproveedores',
                        items: {
                            NOMBRE: function () { return $('#_buscar').val() || ''; },
                            C_EMPRESA: empresa
                        },
                        hiddens: ['C_PROVEEDOR', 'C_PARAMETRO_GENERAL_TIPO_DOCUMENTO', 'NOMBRE_COMERCIAL'],
                        columns: {
                            'RUC_CLIENTE': { text: 'Nro Documento', width: 100 },
                            'RAZON_SOCIAL': { text: 'Razón Social', width: 350 },
                            'DIRECCION_FISCAL': { text: 'Dirección Fiscal', width: 350 }
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
                            title: '<strong>Registro de proveedor</strong>',
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
        const fnBuscarOrdenCompra = function () {
            $.GetData({
                title: '<strong>Busqueda de ordenes de compra</strong>',
                uriData: $.solver.baseUrl + '/Procesos/BusquedaOrdenCompra/',
                location: 'float',
                type: 'GET',
                isPage: true,
                onReady: function (objectBuscarOc, modalBuscarOc) {
                    $(modalBuscarOc).find('.modal-dialog').css({ 'max-width': '75%' });

                    const formBuscarOrdenCompra = $(objectBuscarOc).find('form[name=frmBusquedaOrdenCompra]');
                    const tableBuscarOrdenCompra = $(objectBuscarOc).find('#table');

                    $(formBuscarOrdenCompra).ValidForm({
                        type: -1,
                        onReady: function (form, controls) { tableBuscarOrdenCompra.jqxGrid('updatebounddata'); },
                        onDone: function () {
                            $(tableBuscarOrdenCompra).CreateGrid({
                                query: 'tbl_logistica_procesos_buscarordencompra_listaordencompra',
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
                                    'CODIGO': { text: 'Código', width: 120 },
                                    'RUC_CLIENTE': { text: 'Doc. Proveedor', width: 100 },
                                    'RAZON_SOCIAL': { text: 'Nom. Proveedor', width: 330 },
                                    'NOMBRE_ALMACEN': { text: 'Almacen', width: 130 },
                                    'DESCRIPCION_PARAMETRO': { text: 'Moneda', width: 90 },
                                    'TOTAL': { text: 'Total', width: 90 },
                                },
                                hiddens: ['C_ORDEN_COMPRA', 'C_PARAMETRO_GENERAL_MONEDA', 'C_PROVEEDOR', 'OBS_IMPRIMIR', 'OBS_ADICIONAL', 'C_ALMACEN'],
                                items: { C_EMPRESA: empresa, BUSCAR: function () { return $('#_buscar').val(); }, FLAG_COMPRA: '&', FLAG_GUIA: '' },
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
                                        query: ['q_logistica_procesos_nuevacompra_obtenerdetalleordendecompra_compra'],
                                        items: [{
                                            C_EMPRESA: empresa,
                                            C_ORDEN_COMPRA: row['C_ORDEN_COMPRA']
                                        }],
                                        onReady: function (result) {

                                            $.each($(table).jqxGrid('getrows'), function (i, v) {
                                                arrEliminadas.push(v);
                                            });

                                            $(table).jqxGrid('clear');
                                            $(table).jqxGrid('addrow', null, result);

                                            $(_controls.C_PARAMETRO_GENERAL_MONEDA).val(row['C_PARAMETRO_GENERAL_MONEDA']).trigger('change')
                                            $(_controls.REF_ORDEN_COMPRA).val(row['C_ORDEN_COMPRA']).trigger('change');
                                            $(_controls.C_PROVEEDOR).val(row['C_PROVEEDOR']);
                                            $(_controls.OBS_ADICIONAL).val(row['OBS_ADICIONAL']);
                                            $(_controls.OBS_IMPRIMIR).val(row['OBS_IMPRIMIR']);
                                            fnCalcularTotales();
                                            fnObtenerProveedor();
                                            bootbox.hideAll();
                                        }
                                    });
                                }
                            });
                        },
                        onError: function (error) { $.ShowError({ error: error }); }
                    });
                },
                onCloseModal: function () { estado = false; }
            });
        };
        const fnCrearTablaGuia = function () {
            $(tblGuia).CreateGrid({
                query: 'tbl_logistica_procesos_nuevacompra_obtenerguiasadjuntas',
                items: {
                    C_COMPRA: $(_controls.C_COMPRA).val(),
                    C_EMPRESA: empresa
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
                    'C_COMPRA': { text: 'Código', width: 100 },
                    'TIPO': { text: 'Tipo de guía', width: 300 },
                    'NRO_COMPROBANTE': { text: 'Nro. de guía', width: 100 }
                },
                config: {
                    virtualmode: false,
                    height: 150,
                    pageable: false,
                    sortable: false,
                    editable: false,
                    selectionmode: 'none'
                }
            });
        }
        const fnCrearGuia = function () {
            $.GetData({
                title: '<strong>CREAR GUIA</strong>',
                uriData: $.solver.baseUrl + '/Procesos/AdjuntarGuia/',
                location: 'float',
                type: 'GET',
                isPage: true,
                onReady: function (objectAdjuntarGuia, modalAdjuntarGuia) {
                    $(modalAdjuntarGuia).find('.modal-dialog').css({ 'max-width': '60%' });
                    $(objectAdjuntarGuia).find('#crearguia').show();
                    const formAdjuntarGuia = $(objectAdjuntarGuia).find('form[name=frmAdjuntarGuia]');

                    $(formAdjuntarGuia).ValidForm({
                        type: -1,
                        onReady: function (form, controls) {
                            $.each($(tblGuia).jqxGrid('getrows'), function (i, v) {
                                if (v.C_COMPRA != 'XXXX') {
                                    arrEliminadasGuia.push(v);
                                }
                            })
                            $(tblGuia).jqxGrid('clear')
                            $(tblGuia).jqxGrid('addrow', null, {
                                _rowNum: $(tblGuia).jqxGrid('getrows').length + 1,
                                C_COMPRA: 'XXXX',
                                TIPO: $(controls.TIPO_DOC)[0].args.data.filter(x => x['C_PARAMETRO_GENERAL'] == $(controls.TIPO_DOC).val())[0].DESCRIPCION_PARAMETRO,
                                C_TIPO: $(controls.TIPO_DOC).val(),
                                NRO_COMPROBANTE: $(controls.NUMERO).val(),
                                CENTRO_COSTO: $(controls.CENTRO_COSTO).val()
                            });
                            bootbox.hideAll();
                        },
                        onError: function (error) { $.ShowError({ error: error }); }
                    })
                },
                onCloseModal: function () { estado = false; }
            })
        }
        const fnBuscarGuia = function () {
            $.GetData({
                title: '<strong>Adjuntar guía</strong>',
                uriData: $.solver.baseUrl + '/Procesos/AdjuntarGuia/',
                location: 'float',
                type: 'GET',
                isPage: true,
                onReady: function (objectAdjuntarGuia, modalAdjuntarGuia) {
                    $(modalAdjuntarGuia).find('.modal-dialog').css({ 'max-width': '60%' });
                    $(objectAdjuntarGuia).find('#btnGuardar').hide();
                    const formAdjuntarGuia = $(objectAdjuntarGuia).find('form[name=frmAdjuntarGuia]');
                    const tableAdjuntarGuia = $(objectAdjuntarGuia).find(tblGuia);

                    $(tableAdjuntarGuia).CreateGrid({
                        query: 'tbl_logistica_procesos_nuevaordencompra_obtenerguias',
                        items: {
                            C_EMPRESA: empresa,
                            C_PROVEEDOR: function () {
                                return $(_controls.C_PROVEEDOR).val()
                            }
                        },
                        hiddens: ['C_PARAMETRO_GENERAL_TIPO_DOCUMENTO'],
                        columns: {
                            C_COMPRA: {
                                text: 'Código'
                            },
                            DESCRIPCION_PARAMETRO: {
                                text: 'Tipo de guía'
                            },
                            NRO_COMPROBANTE: {
                                text: 'Nro. de guía'
                            },
                            FECHA_EMISION: {
                                text: 'Fec. emisión'
                            },
                            FECHA_INGRESO_STOCK: {
                                text: 'Fec. ingreso stock'
                            }
                        },
                        config: {
                            virtualmode: false,
                            height: 400,
                            pageSize: 999999,
                            pageable: false,
                            sortable: false,
                            editable: false,
                        }
                    })

                    $(tableAdjuntarGuia).on("rowdoubleclick", function () {
                        const getselectedrowindexes = $(tableAdjuntarGuia).jqxGrid('getselectedrowindexes');
                        if (getselectedrowindexes.length > 0) {
                            var row = $(tableAdjuntarGuia).jqxGrid('getrowdata', getselectedrowindexes[0]);
                            $.each($(tblGuia).jqxGrid('getrows'), function (i, v) {
                                if (v.C_COMPRA != 'XXXX') {
                                    arrEliminadasGuia.push(v);
                                }
                            })
                            $(tblGuia).jqxGrid('clear')
                            $(tblGuia).jqxGrid('addrow', null, {
                                _rowNum: $(tblGuia).jqxGrid('getrows').length + 1,
                                C_COMPRA: row.C_COMPRA,
                                TIPO: row.DESCRIPCION_PARAMETRO,
                                C_TIPO: row.C_PARAMETRO_GENERAL_TIPO_DOCUMENTO,
                                NRO_COMPROBANTE: row.NRO_COMPROBANTE
                            });
                            bootbox.hideAll();
                        }
                    });
                },
                onCloseModal: function () { estado = false; }
            })
        }
        const fnObtenerDatosImportacion = function () {
            if ($(_controls.REF_IMPORTACION).val() != '') {
                $.GetQuery({
                    query: ['q_logistica_procesos_nuevacompra_obtenerimportacion'],
                    items: [{
                        C_EMPRESA: empresa,
                        ID_OPERACION: function () {
                            return $(_controls.REF_IMPORTACION).val();
                        }
                    }],
                    onReady: function (result) {
                        if (result.length > 0) {
                            var data = result[0];
                            $(_controls.IMPORTACION_REF).val(data['NOMBRE']);
                        }
                    },
                    onError: function (error) {
                        $.CloseStatusBar();
                        $.ShowError({ error });
                    }
                });
            }
        }
        const fnBuscarImportacion = function () {
            $.GetData({
                title: 'Adjuntar importación',
                uriData: $.solver.baseUrl + '/Procesos/BusquedaImportacion',
                location: 'float',
                type: 'GET',
                isPage: true,
                onReady: function (objectAdjuntarImportacion, modalAdjuntarImportacion) {
                    $(modalAdjuntarImportacion).find('.modal-dialog').css({ 'max-width': '80%' });
                    const tableAdjuntarImportacion = $(objectAdjuntarImportacion).find('#tblBusquedaImportacion');

                    var formImportacion = $(modalAdjuntarImportacion).find('form[name=frmBusquedaImportacion]');

                    $(formImportacion).ValidForm({
                        type: -1,
                        onReady: function () {
                            $(tableAdjuntarImportacion).jqxGrid('updatebounddata')
                        },
                        onDone: function (_, controls) {
                            $(tableAdjuntarImportacion).CreateGrid({
                                query: 'tbl_logistica_procesos_importaciones_listar',
                                items: {
                                    C_EMPRESA: empresa,
                                    DESDE: function () {
                                        return $(controls.desde).val()
                                    },
                                    HASTA: function () {
                                        return $(controls.hasta).val()
                                    },
                                    NOMBRE: function () {
                                        return $(controls.nombre).val()
                                    },
                                    C_PAIS: function () {
                                        return $(controls.pais).val()
                                    },
                                    C_CANAL: function () {
                                        return $(controls.canal).val()
                                    },
                                    ESTADO: function () {
                                        return $(controls.estado).val()
                                    },
                                    FLAG_TIPO: 'I'
                                },
                                hiddens: ['ID_OPERACION'],
                                sortdirection: 'DESC',
                                sortcolumn: 'NRO_OPERACION',
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
                                    'NRO_OPERACION': {
                                        text: 'Nro. operación',
                                        width: 110
                                    },
                                    'RAZON_SOCIAL': {
                                        text: 'Razón social',
                                        width: 300
                                    },
                                    'NOMBRE': {
                                        text: 'Nombre',
                                        width: 150
                                    },
                                    'DUA': {
                                        text: 'Dua',
                                        width: 150
                                    },
                                    'PAIS': {
                                        text: 'Pais',
                                        width: 200
                                    },
                                    'FECHA': {
                                        text: 'Fecha',
                                        width: 100
                                    },
                                    'CANAL': {
                                        text: 'Canal',
                                        width: 120
                                    },
                                    'ESTADO': {
                                        text: 'Estado',
                                        width: 130
                                    },
                                },
                                config: {
                                    height: 500,
                                    pageSize: 999999,
                                }
                            });
                            const actionElegir = function () {
                                const index = $(tableAdjuntarImportacion).jqxGrid('getselectedrowindex');
                                if (index != -1) {
                                    var row = $(tableAdjuntarImportacion).jqxGrid('getrowdata', index);
                                    $(_controls.REF_IMPORTACION).val(row['ID_OPERACION']);
                                    fnObtenerDatosImportacion();
                                }
                            }
                            $(tableAdjuntarImportacion).on("rowdoubleclick", function () {
                                actionElegir();
                                bootbox.hideAll();
                            });
                            $(objectAdjuntarImportacion).find('form[name=frmBusquedaImportacion] #btnAceptar').click(function () {
                                actionElegir();
                                bootbox.hideAll();
                            })
                        }
                    });
                },
                onCloseModal: function () { estado = false; }
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
        const fnCrearTablaCuotas = function () {
            $('#tblCuotas').CreateGrid({
                query: 'tbl_compras_procesos_nuevacompra_cuotas',
                items: {
                    C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                    C_COMPRA: function () {
                        return $(_controls.C_COMPRA).val();
                    }
                },
                hiddens: ['C_EMPRESA', 'C_COMPRA', 'C_CUOTA'],
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
                    FECHA_VENCIMIENTO: {
                        text: 'Fecha pago',
                    },
                    MONTO_CUOTA: {
                        text: 'Monto cuota',
                        cellsAlign: 'right',
                        cellsFormat: 'd2',
                        width: 100,
                        columnType: 'numberinput',
                        aggregates: ['sum'], aggregatesRenderer: function (aggregates, column, element) {
                            var formatNumber = aggregates.sum;
                            if (formatNumber === undefined)
                                formatNumber = '';
                            return `<div class="h-30 d-flex justify-content-center align-items-center font-weight-bold">
                                            <strong> ${formatNumber} </strong>
                                        </div>`;
                        }
                    },
                },
                config: {
                    virtualmode: false,
                    pageSize: 100,
                    pageable: false,
                    height: 130,
                    sortable: false,
                    editable: true,
                    showaggregates: true,
                    showstatusbar: true,
                    statusbarheight: 20,
                }
            })
            $('#tblCuotas').on('cellvaluechanged', function (event) {
                var args = event.args;
                var datafield = event.args.datafield;
                var rowBoundIndex = args.rowindex;
                var value = args.newvalue;
                var oldvalue = args.oldvalue;

                if (datafield == 'FECHA_VENCIMIENTO') {
                    validarFormatoFecha(value, rowBoundIndex, datafield, oldvalue);
                }
            });
        }
        const validarFormatoFecha = function (fecha, index, column, oldvalue) {
            var RegExPattern = /^\d{1,2}\/\d{1,2}\/\d{2,4}$/;
            if ((fecha.match(RegExPattern)) && (fecha != '')) { }
            else {
                if (column == 'FECHA_VENCIMIENTO') {
                    $('#tblCuotas').jqxGrid('getrows')[index].FECHA_VENCIMIENTO = oldvalue;
                    $('#tblCuotas').jqxGrid('refresh');
                }
            }
        }
        const fnBuscarDocumentoReferencia = function () {
            $.solver.fn.fnAbrirModal({
                title: 'Busqueda de documentos',
                query: 'tbl_logistica_procesos_nuevacompra_lista_documentos',
                hiddens: ['C_COMPRA'],
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
                    'RAZON_SOCIAL': {
                        text: 'Razón social',
                        width: '300'
                    },
                    'TIPO_COMPROBANTE': {
                        text: 'Tipo comprobante',
                        width: '120'
                    },
                    'NRO_COMPROBANTE': {
                        text: 'Nro comprobante',
                        width: '120'
                    },
                    'FECHA_EMISION': {
                        text: 'Fecha emisión',
                        width: '100',
                        cellsAlign: 'center'
                    },
                    'MONEDA': {
                        text: 'Moneda',
                        width: '80'
                    },
                    'TOTAL': {
                        text: 'Total',
                        width: 80,
                        cellsAlign: 'right',
                        cellsFormat: 'd2'
                    },
                },
                onSelected: function (row) {
                    $(_controls.C_COMPRA_REF).val(row['C_COMPRA']);
                    $(_controls.DOCUMENTO_REF).val(row['NRO_COMPROBANTE']);

                    $.GetQuery({
                        query: ['q_ventas_procesos_nuevacompra_consultardetalle'],
                        items: [{
                            C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                            C_COMPRA: row['C_COMPRA']
                        }],
                        onReady: function (result) {
                            var _result = [];

                            $.each(result, function (i, v) {
                                v['_rowNum'] = i + 1;
                                _result.push(v);
                            })

                            $(table).jqxGrid('clear');
                            $(table).jqxGrid('addrow', null, _result);
                        }
                    })
                }
            })
        }
        const fnBuscarConstanciaRef = function () {
            $.solver.fn.fnAbrirModal({
                title: 'Busqueda de suspención de renta',
                query: 'tbl_logistica_procesos_nuevacompra_lista_suspencion_renta',
                hiddens: ['C_CONSTANCIA', 'C_PROVEEDOR'],
                items: {
                    C_PROVEEDOR: function () {
                        return $(_controls.C_PROVEEDOR).val();
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
                    'NUMERO': {
                        text: 'Número',
                        width: 130
                    },
                    'FECHA': {
                        text: 'Fecha',
                        width: 100,
                        cellsAlign: 'center'
                    }
                },
                sortcolumn: 'FECHA',
                sortdirection: 'DESC',
                onSelected: function (row) {
                    $(_controls.C_CONSTANCIA).val(row['C_CONSTANCIA']);
                    $(_controls.CONSTANCIA_REF).val(row['NUMERO']);
                    fnCalcularTotales();
                },
                onReady: function (form, controls, token, dialog) {
                    $(dialog).find('#btnRegistrar').click(function () {
                        fnEditarConstancia(dialog);
                    })
                },
                controlsAfter: {
                    btnRegistro: {
                        class: 'col-lg-4',
                        html: `<button type="button" id="btnRegistrar" class="btn btn-sm btn-orange"><i class="fa fa-plus-circle" aria-hidden="true"></i> Registrar</button>`
                    }
                }
            })
        }
        const fnEditarConstancia = function (_dialog, codigo) {

            let type = 1;
            let condition = '';
            let c_proveedor = $(_controls.C_PROVEEDOR).val();

            if (codigo != undefined) {
                type = 2;
                condition = `C_EMPRESA = '${$.solver.session.SESSION_EMPRESA}' AND C_PROVEEDOR = '${c_proveedor}' AND C_CONSTANCIA = '${codigo}'`
            }

            var token = $.CreateToken();
            var dialog = bootbox.dialog({
                title: 'Registro de constancia de suspención de renta',
                message: `<div id="${token}"></div>`,
                onEscape: true
            });

            dialog.init(function () {
                setTimeout(function () {

                    var objControls = null;

                    $(dialog).find('#' + token).html(`
                        <form id="${token}_form">
                            <input type="hidden" name="C_EMPRESA" value="${$.solver.session.SESSION_EMPRESA}"/>
                            <input type="hidden" name="C_PROVEEDOR" value="${c_proveedor}"/>
                            <input type="hidden" name="C_CONSTANCIA" value="${codigo}"/>
                            <input type="hidden" name="IND_ESTADO" value="*"/>

                            <div class="row">
                                <div class="col-6">
                                    <label>Ruc: </label>
                                </div>
                                <div class="col-6">
                                    <input class="form-control form-control-sm" name="RUC" value="${$('#RUC').text()}" data-nosend="1" disabled/>
                                </div>
                            </div>
                            <div class="row mt-2">
                                <div class="col-6">
                                    <label>Nro const. susp.: </label>
                                </div>
                                <div class="col-6">
                                    <input class="form-control form-control-sm" name="NUMERO" maxlength="8"/>
                                </div>
                            </div>
                            <div class="row mt-2">
                                <div class="col-6">
                                    <label>Fecha oper.: </label>
                                </div>
                                <div class="col-6">
                                    <input class="form-control form-control-sm" name="FECHA" />
                                </div>
                            </div>
                            <div class="row mt-2">
                                <div class="col">
                                    <button type="submit" class="btn btn-sm btn-danger float-right"><i class="fa fa-floppy-o" aria-hidden="true"></i> Guardar</button>
                                </div>
                            </div>
                        </form>
                    `);

                    //Validamos formulario
                    $(dialog).find('#' + token + '_form').ValidForm({
                        type: type,
                        condition: condition,
                        table: 'LOG.PROVEEDORES_CONSTANCIA_SUSPENCION',
                        queryDefault: {
                            query: ['editable_constancia'],
                            type: [8],
                            items: [{
                                table: 'LOG.PROVEEDORES_CONSTANCIA_SUSPENCION',
                                condition: condition
                            }]
                        },
                        extras: {
                            C_CONSTANCIA: {
                                action: {
                                    name: 'GetNextId',
                                    args: $.ConvertObjectToArr({
                                        columns: 'C_EMPRESA,C_PROVEEDOR',
                                        max_length: 3
                                    })
                                }
                            }
                        },
                        onDone: function (form, controls) {
                            objControls = controls;

                            $(controls.FECHA).datetimepicker({
                                format: 'DD/MM/YYYY',
                                locale: 'es'
                            });

                            $(controls.NUMERO).focus();
                        },
                        onReady: function (result, controls) {
                            $(dialog).modal('hide');
                            $(_dialog).modal('hide');
                            $(_controls.C_CONSTANCIA).val(result.items.C_CONSTANCIA);
                            $(_controls.CONSTANCIA_REF).val(result.items.NUMERO);
                            fnCalcularTotales();
                        }
                    });

                    $(dialog).find('.modal-dialog').css({ 'max-width': '30%' })
                    $(dialog).find('.modal-dialog').css({ 'margin-top': '7%' })

                    $('.bootbox .modal-dialog').draggable({
                        handle: '.modal-header'
                    });
                    $('.bootbox .modal-header').css('cursor', 'move');
                }, 150);
            });
        }
        const fnMostrarDetraccion = function () {
            var token = $.CreateToken();
            var dialog = bootbox.dialog({
                title: 'Tasa de detracción',
                message: `<div id="${token}"></div>`,
                onEscape: true
            });

            dialog.init(function () {
                setTimeout(function () {

                    function process(date) {
                        var parts = date.split("/");
                        return new Date(parts[2], parts[1] - 1, parts[0]);
                    }

                    var objControls = null;

                    $(dialog).find('#' + token).html(`
                        <form id="${token}_form">
                            <div class="row">
                                <div class="col-6">
                                    <label>Tasa de detracción: </label>
                                </div>
                                <div class="col-6">
                                    <select class="form-control form-control-sm" name="C_DETRACCION"
                                        data-query="gbl_obtener_parametro_general_detraccion" data-value="CODIGO" data-field="DESCRIPCION"
                                        data-textdefault="No aplica bienes ni servicios" data-live-search="true" data-style="btn-light" data-size="10"
                                        required></select>
                                </div>
                            </div>
                            <div class="row mt-2">
                                <div class="col-6">
                                    <label>Fecha de la detracción: </label>
                                </div>
                                <div class="col-6">
                                    <input class="form-control form-control-sm" name="FECHA" />
                                </div>
                            </div>
                            <div class="row mt-2">
                                <div class="col-6">
                                    <label>Nro. de constancia de la detracción: </label>
                                </div>
                                <div class="col-6">
                                    <input class="form-control form-control-sm" name="NUMERO" maxlength="10"/>
                                </div>
                            </div>
                            <div class="row mt-2">
                                <div class="col">
                                    <button type="submit" class="btn btn-sm btn-danger float-right"><i class="fa fa-floppy-o" aria-hidden="true"></i> Guardar</button>
                                </div>
                            </div>
                        </form>
                    `);

                    //Validamos formulario
                    $(dialog).find('#' + token + '_form').ValidForm({
                        type: -1,
                        onDone: function (form, controls) {
                            objControls = controls;
                            $(controls.FECHA).datetimepicker({
                                format: 'DD/MM/YYYY',
                                locale: 'es'
                            });
                            $(controls.C_DETRACCION).selectpicker();
                        },
                        onSubmit: function (form, controls) {
                            const fechaEmision = process($(_controls.FECHA_EMISION).val());
                            const fechaDetraccion = process($(controls.FECHA).val());

                            if (fechaEmision > fechaDetraccion) {
                                alertify.warning('La fecha de emisión no puede ser mayor a la fecha de detracción');
                                return false;
                            }
                            return true;
                        },
                        onReady: function (result, controls) {
                            $(_controls.C_SUJETO_DETRACCION).val($(controls.C_DETRACCION).val());
                            $(_controls.FECHA_DETRACCION).val($(controls.FECHA).val());
                            $(_controls.NUMERO_DETRACCION).val($(controls.NUMERO).val());
                            $(dialog).modal('hide');
                            $(form).submit();
                        }
                    });

                    $(dialog).find('.modal-dialog').css({ 'max-width': '30%' })
                    $(dialog).find('.modal-dialog').css({ 'margin-top': '7%' })

                    $('.bootbox .modal-dialog').draggable({
                        handle: '.modal-header'
                    });
                    $('.bootbox .modal-header').css('cursor', 'move');
                }, 150);
            });
        }
        const fnBuscarDocumentosRetencion = function () {
            $.solver.fn.fnAbrirModal({
                title: 'Seleccione docs. de referencia',
                query: 'tbl_logistica_procesos_nuevacompra_lista_docs_referencia',
                hiddens: ['C_COMPRA'],
                items: {
                    C_PROVEEDOR: function () {
                        return $(_controls.C_PROVEEDOR).val();
                    },
                    C_COMPRA: function () {
                        return $(_controls.C_COMPRA).val();
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
                    'ANIO': {
                        text: 'Año',
                        width: 60
                    },
                    'MES': {
                        text: 'Mes',
                        width: 100,
                    },
                    'EMISION': {
                        text: 'Fecha emisión',
                        width: 100,
                        cellsAlign: 'center'
                    },
                    'TIPO_COMPROBANTE': {
                        text: 'Tipo comprobante',
                        width: 150,
                    },
                    'NRO_COMPROBANTE': {
                        text: 'Número comprobante',
                        width: 120,
                    },
                    'TOTAL': {
                        text: 'Total',
                        width: 100,
                        cellsAlign: 'right',
                        cellsFormat: 'd2'
                    },
                    'TIPO_COMPRA': {
                        text: 'Tipo de compra',
                        width: 100,
                    },
                },
                onSelected: function (row) {
                    $(_controls.C_CONSTANCIA).val(row['C_CONSTANCIA']);
                    $(_controls.CONSTANCIA_REF).val(row['NUMERO']);
                },
                onReady: function (form, controls, token, dialog) {
                    setTimeout(function () {
                        arrRetenciones.map(retencion => {
                            var rowIndex = $(dialog).find('#' + token + '_table').jqxGrid('getrows').findIndex(x => x['C_COMPRA'] == retencion.C_COMPRA_REF)
                            $(dialog).find('#' + token + '_table').jqxGrid('selectrow', rowIndex);
                        })
                    }, 250)

                    $(dialog).find('#btnAceptar').click(function () {
                        var indexes = $(dialog).find('#' + token + '_table').jqxGrid('getselectedrowindexes')
                        indexes.map(index => {
                            var rowid = $(dialog).find('#' + token + '_table').jqxGrid('getrowid', index)
                            var data = $(dialog).find('#' + token + '_table').jqxGrid('getrowdatabyid', rowid);

                            if ($(_controls.RETENCION).val() == '') $(_controls.RETENCION).val('Ref. ' + data.NRO_COMPROBANTE)

                            arrRetenciones.push({
                                C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                                C_COMPRA: $(_controls.C_COMPRA).val(),
                                C_RETENCION: '',
                                C_COMPRA_REF: data.C_COMPRA,
                                IND_ESTADO: '*'
                            })
                        })

                        $(dialog).modal('hide');
                    })
                },
                controlsAfter: {
                    btnAceptar: {
                        class: 'col-lg-4',
                        html: `<button type="button" id="btnAceptar" class="btn btn-sm btn-orange"><i class="fa fa-floppy-o" aria-hidden="true"></i> Aceptar</button>`
                    }
                },
                config: {
                    pageable: true, sortable: true, height: 600, pageSize: 100,
                    selectionmode: 'checkbox'
                }
            })
        }
        const fnObtenerRetenciones = function () {
            $.GetQuery({
                query: ['q_logistica_procesos_nuevacompra_obtenerretenciones'],
                items: [{
                    C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                    C_COMPRA: function () {
                        return $(_controls.C_COMPRA).val();
                    }
                }],
                onReady: function (result) {
                    arrRetenciones = result;
                }
            })
        }
        const fnBuscarTransformacionAsociada = function () {
            $.solver.fn.fnAbrirModal({
                title: 'Seleccione transformacion',
                query: 'tbl_logistica_procesos_nuevacompra_lista_transformaciones',
                hiddens: ['C_TIPO_TRANSFORMACION', 'C_TRANSFORMACION'],
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
                },
                onSelected: function (row) {
                    $(_controls.TRANSFORMACION_ASOCIADA).val(row['NRO_OPERACION'])
                    $(_controls.C_TRANSFORMACION).val(row['C_TRANSFORMACION'])
                    $(_controls.C_TIPO_TRANSFORMACION).val(row['C_TIPO_TRANSFORMACION'])
                },
                onReady: function (form, controls, token, dialog) {
                    $(dialog).find('#btnAceptar').click(function () {
                        var index = $(dialog).find('#' + token + '_table').jqxGrid('getselectedrowindex')
                        var row = $(dialog).find('#' + token + '_table').jqxGrid('getrows')[index]

                        $(_controls.TRANSFORMACION_ASOCIADA).val(row['NRO_OPERACION'])
                        $(_controls.C_TRANSFORMACION).val(row['C_TRANSFORMACION'])
                        $(_controls.C_TIPO_TRANSFORMACION).val(row['C_TIPO_TRANSFORMACION'])

                        $(dialog).modal('hide');
                    })
                },
                controlsAfter: {
                    btnAceptar: {
                        class: 'col-lg-4',
                        html: `<button type="button" id="btnAceptar" class="btn btn-sm btn-orange"><i class="fa fa-floppy-o" aria-hidden="true"></i> Aceptar</button>`
                    }
                },
                config: {
                    pageable: true, sortable: true, height: 600, pageSize: 100,
                }
            })
        }

        $(form).ValidForm({
            table: 'LOG.COMPRA',
            type: 1,
            querySaveText: function () {
                if ($('#CHCK_STOCK').is(':checked')) {
                    return `<label class="text-danger"><strong>** Esta compra generará una guía de entrada automaticamente <br/>
                                Se ha indicado al sistema que debe generar automáticamente el stock <br/>
                                Solo se registrará el stock a los productos con almacen de destino</label></strong>
                                <br />
                                <br />
                                <label> ¿Seguro de registrar la compra?</label>`
                }
                else {
                    return '¿Seguro de guardar el registro?'
                }
            },
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
            onSubmit: function (form, controls, objParent) {
                if ($(controls.RETENCION_USUARIO).val() == '') {
                    objParent.RETENCION_USUARIO = 0;
                }

                if ($(controls.FECHA_DETRACCION).val() == '') {
                    objParent.FECHA_DETRACCION = null;
                }

                if ($(controls.C_PROVEEDOR).val() == '') {
                    alertify.warning('Por favor seleccione el proveedor.');
                    return false;
                }
                else if ($(table).jqxGrid('getrows').length == 0) {
                    alertify.warning('Por favor agregue items al detalle.');
                    return false;
                }
                else if ($.trim($(_controls.NRO_COMPROBANTE).val().replace(new RegExp('#', 'g'), ' ')).length != 13) {
                    alertify.warning('Por favor ingrese el campo nro de comprobante.');
                    return false;
                }
                return true;
            },
            onDetail: function (form, controls, token) {
                $.each(arrEliminadasGuia, function (i, v) {
                    $.AddPetition({
                        table: 'LOG.COMPRA',
                        type: 2,
                        condition: `C_EMPRESA = '${empresa}' AND C_COMPRA = '${v.C_COMPRA}'`,
                        items: $.ConvertObjectToArr({
                            C_EMPRESA: empresa,
                            C_COMPRA: v.C_COMPRA,
                            REF_C_COMPRA: null
                        })
                    });
                });

                var inserts = $(table).jqxGrid('getrows').filter(x => x['C_DETALLE'] == '');
                var update = $(table).jqxGrid('getrows').filter(x => x['C_DETALLE'] != '');
                $.each(inserts, function (i, detalle) {
                    var type = 1;
                    var objDetalle = {
                        C_EMPRESA: empresa,
                        C_COMPRA: '',
                        C_DETALLE: '',
                        C_PRODUCTO: detalle['C_PRODUCTO'],
                        DESCRIPCION: detalle['DESCRIPCION'],

                        CANTIDAD: detalle['CANTIDAD'],
                        PRECIO: detalle['PRECIO'],

                        C_UNIDAD_NEGOCIO: detalle['C_UNIDAD_NEGOCIO'],

                        BASE_IMPONIBLE: numeral(detalle['BASE_IMPONIBLE']).format('0.000'),
                        INCLUYE_IGV: ((detalle['INCLUYE_IGV'] == true || detalle['INCLUYE_IGV'] == 'true') ? '*' : '&'),
                        VALOR_UNITARIO: numeral(detalle['VALOR_UNITARIO']).format('0.0000000000'),
                        PORC_DSCTO: detalle['PORC_DSCTO'],
                        DSCTO_UNITARIO: numeral(detalle['DSCTO_UNITARIO']).format('0.0000000000'),
                        VALOR_VENTA_UNITARIO: numeral(detalle['VALOR_VENTA_UNITARIO']).format('0.0000000000'),
                        AFECTACION_IGV: detalle['AFECTACION_IGV'],
                        IGV_UNITARIO: numeral(detalle['IGV_UNITARIO']).format('0.0000000000'),
                        PRECIO_BASE: numeral(detalle['PRECIO_BASE']).format('0.000'),
                        IGV: numeral(detalle['IGV']).format('0.000'),
                        PRECIO_TOTAL: numeral(detalle['PRECIO_TOTAL']).format('0.000'),
                        DSCTO_PARCIAL: numeral(detalle['DSCTO_PARCIAL']).format('0.000'),

                        IND_ESTADO: '*',
                        IND_SERVICIO: detalle['IND_SERVICIO'],
                        AFECTACION_IGV: detalle['AFECTACION_IGV'],
                        DSCTO_UNITARIO_IGV: numeral(detalle['DSCTO_UNITARIO_IGV']).format('0.0000000000'),

                        C_PARAMETRO_GENERAL_UNIDAD: detalle['C_PARAMETRO_GENERAL_UNIDAD'],
                        STOCK_PRIN: detalle['STOCK_PRIN'],
                        STOCK_AUX: detalle['STOCK_AUX'],
                        FACTOR: detalle['FACTOR'],
                        C_ALMACEN: detalle['C_ALMACEN'],
                        FLAG_GENERA_STOCK_AUT: detalle['FLAG_GENERA_STOCK_AUT'],

                        RECARGO_CONSUMO: detalle['RECARGO_CONSUMO'],
                        PORC_IGV: detalle['PORC_IGV'],
                        PORC_RC: detalle['PORC_RC'],
                        FLAG_ICBPER: detalle['FLAG_ICBPER'],
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
                        C_PRODUCTO: detalle['C_PRODUCTO'],
                        DESCRIPCION: detalle['DESCRIPCION'],

                        CANTIDAD: detalle['CANTIDAD'],
                        PRECIO: detalle['PRECIO'],

                        C_UNIDAD_NEGOCIO: detalle['C_UNIDAD_NEGOCIO'],

                        BASE_IMPONIBLE: numeral(detalle['BASE_IMPONIBLE']).format('0.000'),
                        INCLUYE_IGV: ((detalle['INCLUYE_IGV'] == true || detalle['INCLUYE_IGV'] == 'true') ? '*' : '&'),
                        VALOR_UNITARIO: numeral(detalle['VALOR_UNITARIO']).format('0.0000000000'),
                        PORC_DSCTO: detalle['PORC_DSCTO'],
                        DSCTO_UNITARIO: numeral(detalle['DSCTO_UNITARIO']).format('0.0000000000'),
                        VALOR_VENTA_UNITARIO: numeral(detalle['VALOR_VENTA_UNITARIO']).format('0.0000000000'),
                        AFECTACION_IGV: detalle['AFECTACION_IGV'],
                        IGV_UNITARIO: numeral(detalle['IGV_UNITARIO']).format('0.0000000000'),
                        PRECIO_BASE: numeral(detalle['PRECIO_BASE']).format('0.000'),
                        IGV: numeral(detalle['IGV']).format('0.000'),
                        PRECIO_TOTAL: numeral(detalle['PRECIO_TOTAL']).format('0.000'),
                        DSCTO_PARCIAL: numeral(detalle['DSCTO_PARCIAL']).format('0.000'),

                        IND_ESTADO: '*',
                        IND_SERVICIO: detalle['IND_SERVICIO'],
                        AFECTACION_IGV: detalle['AFECTACION_IGV'],
                        DSCTO_UNITARIO_IGV: numeral(detalle['DSCTO_UNITARIO_IGV']).format('0.0000000000'),

                        C_PARAMETRO_GENERAL_UNIDAD: detalle['C_PARAMETRO_GENERAL_UNIDAD'],
                        STOCK_PRIN: detalle['STOCK_PRIN'],
                        STOCK_AUX: detalle['STOCK_AUX'],
                        FACTOR: detalle['FACTOR'],
                        C_ALMACEN: detalle['C_ALMACEN'],
                        FLAG_GENERA_STOCK_AUT: detalle['FLAG_GENERA_STOCK_AUT'],

                        RECARGO_CONSUMO: detalle['RECARGO_CONSUMO'],
                        PORC_IGV: detalle['PORC_IGV'],
                        PORC_RC: detalle['PORC_RC'],
                        FLAG_ICBPER: detalle['FLAG_ICBPER'],
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

                if ($(controls.REF_ORDEN_COMPRA).val() != '') {
                    $.AddPetition({
                        table: 'LOG.ORDEN_COMPRA',
                        type: 2,
                        condition: `C_EMPRESA = '${empresa}' AND C_ORDEN_COMPRA = '${$(controls.REF_ORDEN_COMPRA).val()}'`,
                        items: $.ConvertObjectToArr({
                            C_EMPRESA: empresa,
                            C_ORDEN_COMPRA: $(controls.REF_ORDEN_COMPRA).val(),
                            FLAG_COMPRA: '*'
                        })
                    });
                }

                $.AddPetition({
                    type: '4',
                    transaction: true,
                    items: $.ConvertObjectToArr({
                        script: 'spw_compras_nuevacompra_anulardocumentosrelacionados',
                        C_EMPRESA: empresa,
                        C_COMPRA: ''
                    },
                        {
                            C_COMPRA: {
                                action: {
                                    name: 'GetParentId',
                                    args: $.ConvertObjectToArr({
                                        token: token,
                                        column: 'C_COMPRA'
                                    })
                                }
                            }
                        })
                })

                $.AddPetition({
                    type: '4',
                    transaction: true,
                    items: $.ConvertObjectToArr({
                        script: 'spw_logistica_procesos_nuevacompra_generarguias_movimientos_stock',
                        C_EMPRESA: empresa,
                        C_DOCUMENTO: '',
                        C_USUARIO_REGISTRO: $.solver.session.SESSION_ID
                    },
                        {
                            C_DOCUMENTO: {
                                action: {
                                    name: 'GetParentId',
                                    args: $.ConvertObjectToArr({
                                        token: token,
                                        column: 'C_COMPRA'
                                    })
                                }
                            }
                        })
                });

                $.AddPetition({
                    type: 4,
                    items: $.ConvertObjectToArr({
                        script: 'spw_compras_nuevacompra_borrar_cuotas',
                        C_EMPRESA: empresa,
                        C_COMPRA: '',
                    },
                        {
                            C_COMPRA: {
                                action: {
                                    name: 'GetParentId',
                                    args: $.ConvertObjectToArr({
                                        token: token,
                                        column: 'C_COMPRA'
                                    })
                                }
                            },
                        }),
                    transaction: true
                });

                if ($(controls.FORMA_PAGO).val() == '09913') {
                    if ($('#divTblCuotas')[0].children.length > 0) {
                        $.each($('#tblCuotas').jqxGrid('getrows'), function (i, v) {
                            $.AddPetition({
                                type: 1,
                                table: 'LOG.COMPRA_CUOTA',
                                items: $.ConvertObjectToArr(
                                    {
                                        C_EMPRESA: empresa,
                                        C_COMPRA: '',
                                        C_CUOTA: '',
                                        FECHA_VENCIMIENTO: v.FECHA_VENCIMIENTO,
                                        MONTO_CUOTA: v.MONTO_CUOTA
                                    },
                                    {
                                        C_COMPRA: {
                                            action: {
                                                name: 'GetParentId',
                                                args: $.ConvertObjectToArr({
                                                    token: token,
                                                    column: 'C_COMPRA'
                                                })
                                            }
                                        },
                                        C_CUOTA: {
                                            action: {
                                                name: 'GetNextId',
                                                args: $.ConvertObjectToArr({
                                                    columns: 'C_COMPRA,C_EMPRESA',
                                                    max_length: '3'
                                                })
                                            }
                                        },
                                    })
                            });
                        });
                    }
                }

                $.each(arrRetenciones, function (i, detalle) {
                    var type = 1;
                    var condition = ''
                    var extra = {
                        C_COMPRA: {
                            action: {
                                name: 'GetParentId',
                                args: $.ConvertObjectToArr({
                                    token: token,
                                    column: 'C_COMPRA'
                                })
                            }
                        },
                        C_RETENCION: {
                            action: {
                                name: 'GetNextId',
                                args: $.ConvertObjectToArr({
                                    columns: 'C_EMPRESA,C_COMPRA',
                                    max_length: 3
                                })
                            }
                        }
                    }

                    if (detalle.C_RETENCION != '') {
                        type = 2;
                        condition = `C_EMPRESA = '${$.solver.session.SESSION_EMPRESA}' AND C_COMPRA = '${detalle.C_COMPRA}' AND C_RETENCION = '${detalle.C_RETENCION}'`;
                        extra = {}
                    }

                    var object = {
                        C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                        C_COMPRA: detalle['C_COMPRA'],
                        C_RETENCION: detalle['C_RETENCION'],
                        C_COMPRA_REF: detalle['C_COMPRA_REF'],
                        IND_ESTADO: detalle['IND_ESTADO']
                    }

                    $.AddPetition({
                        table: 'LOG.COMPRA_RETENCION',
                        type: type,
                        condition: condition,
                        items: $.ConvertObjectToArr(object, extra)
                    });
                })
            },
            onReady: function (result) {
                alertify.success('Se registró la información.');
                document.location = $.solver.baseUrl + '/Procesos/RegistroCompra';
            },
            onDone: function (_form, controls, type, condition, result) {
                fnValidarConfiguracion();

                _controls = controls;

                $(controls.C_EMPRESA).val(empresa);

                if ($(controls.C_COMPRA).val() != '') {
                    $(controls.FECHA_EMISION).val(moment($(controls.FECHA_EMISION).val()).format('DD/MM/YYYY'));
                    $(controls.FECHA_INGRESO_STOCK).val(moment($(controls.FECHA_INGRESO_STOCK).val()).format('DD/MM/YYYY'));
                    $(controls.FECHA_VENCIMIENTO).val(moment($(controls.FECHA_VENCIMIENTO).val()).format('DD/MM/YYYY'));
                    $(controls.FECHA_DETRACCION).val(moment($(controls.FECHA_DETRACCION).val()).format('DD/MM/YYYY'));
                    fnObtenerProveedor();

                    var periodo = $(controls.PERIODO).val()
                    if (periodo != '') {
                        $(controls.ANIO).val(periodo.split('/')[0]);
                        var mes = periodo.split('/')[1];
                        $(controls.MES).val((mes.substring(0, 1) == '0' ? mes.substring(1, 2) : mes));
                    }
                }
                else {
                    $(controls.MES).val($(controls.MES_ACTUAL).val());
                    var periodo = $(controls.ANIO).val() + '/' + ($(controls.MES).val().length == 1 ? '0' + $(controls.MES).val() : $(controls.MES).val());
                    $(controls.PERIODO).val(periodo);
                }

                if ($(controls.IND_ESTADO_COMPRA).val() == '&') {
                    $('#btnGuardar').hide();
                    $.each(controls, function (i, v) {
                        $(v).attr('disabled', 'disabled')
                    })
                }

                $(controls.FECHA_EMISION).datetimepicker({
                    format: 'DD/MM/YYYY',
                    locale: 'es'
                }).on('dp.change', function () { fnObtenerTipoCambio(); });
                $(controls.FECHA_INGRESO_STOCK).datetimepicker({
                    format: 'DD/MM/YYYY',
                    locale: 'es'
                });
                $(controls.FECHA_VENCIMIENTO).datetimepicker({
                    format: 'DD/MM/YYYY',
                    locale: 'es'
                });
                $(controls.FECHA_DETRACCION).datetimepicker({
                    format: 'DD/MM/YYYY',
                    locale: 'es'
                });
                $(controls.NRO_COMPROBANTE).inputmask("****-99999999", { "placeholder": "####-########" });
                $(controls.NRO_COMPROBANTE).change(function () {
                    const nro = $(controls.NRO_COMPROBANTE).val();
                    const partes = $.trim(nro.replace(new RegExp('#', 'g'), ' ')).split('-')
                    const serie = $.trim(partes[0]);
                    let nroComprobante = $.trim(partes[1]);

                    if (serie.length != 4) {
                        alertify.warning('Por favor ingrese la serie de referencia')
                        return;
                    }
                    if (nroComprobante.length == 0) {
                        alertify.warning('Por favor ingrese el nro de documento de referencia')
                        return;
                    }

                    nroComprobante = '00000000' + nroComprobante;
                    nroComprobante = nroComprobante.substring(nroComprobante.length - 8, nroComprobante.length);

                    $(controls.NRO_COMPROBANTE).val((serie + '-' + nroComprobante).toUpperCase())
                });

                fnCrearTabla();
                fnCrearTablaGuia();
                fnObtenerTipoCambio();
                fnObtenerDatosEmpresa();
                fnObtenerDatosImportacion();
                fnObtenerRetenciones();

                $(controls.C_PARAMETRO_GENERAL_MONEDA).change(function () {
                    const moneda = $(controls.C_PARAMETRO_GENERAL_MONEDA).val();
                    if (moneda == '') $(controls.SIMBOLO_MONEDA).val('')
                    else if (moneda == '07234') $(controls.SIMBOLO_MONEDA).val('S/ ')
                    else if (moneda == '07235') $(controls.SIMBOLO_MONEDA).val('$ ')
                    fnCalcularTotales();
                });

                $(controls.ANIO).change(function () {
                    var periodo = $(controls.ANIO).val() + '/' + ($(controls.MES).val().length == 1 ? '0' + $(controls.MES).val() : $(controls.MES).val());
                    $(controls.PERIODO).val(periodo);
                });

                $(controls.MES).change(function () {
                    var periodo = $(controls.ANIO).val() + '/' + ($(controls.MES).val().length == 1 ? '0' + $(controls.MES).val() : $(controls.MES).val());
                    $(controls.PERIODO).val(periodo);
                });

                $(controls.C_PARAMETRO_GENERAL_TIPO_DOCUMENTO).change(function () {
                    var tipoDocumento = $(controls.C_PARAMETRO_GENERAL_TIPO_DOCUMENTO).val();
                    if (tipoDocumento == '07241' || tipoDocumento == '07242') $('.nc').show();
                    else $('.nc').hide();
                    if (tipoDocumento == '10245') {
                        $('.rh').show();
                        $(controls.TIPO_OPERACION).html('<option value="10246">Recibo por honorario</option>').attr('readonly', 'readonly').css('pointer-events', 'none').trigger('change')
                        $(controls.TIPO_INGRESO).val('S').attr('readonly', 'readonly').css('pointer-events', 'none');
                    }
                    else {
                        $('.rh').hide();
                        $(controls.TIPO_OPERACION).FieldLoadRemote().removeAttr('readonly').css('pointer-events', 'auto')
                        $(controls.TIPO_INGRESO).removeAttr('readonly').css('pointer-events', 'auto');
                    }
                    if (tipoDocumento == '07252') $('.retencion').show();
                    else $('.retencion').hide();
                });
                var tipoDocumento = $(controls.C_PARAMETRO_GENERAL_TIPO_DOCUMENTO).val();
                if (tipoDocumento == '07241' || tipoDocumento == '07242') $('.nc').show();
                else $('.nc').hide();
                if (tipoDocumento == '10245') {
                    $('.rh').show();
                    $(controls.TIPO_OPERACION).html('<option value="10246">Recibo por honorario</option>').attr('readonly', 'readonly').css('pointer-events', 'none').trigger('change')
                    $(controls.TIPO_INGRESO).val('S').attr('readonly', 'readonly').css('pointer-events', 'none');
                }
                else {
                    $('.rh').hide();
                }
                if (tipoDocumento == '07252') $('.retencion').show();
                else $('.retencion').hide();

                if ($(controls.FORMA_PAGO).val() == '09913') {
                    $('.btn-cuotas').show();
                    fnCrearTablaCuotas();
                }

                $(controls.FORMA_PAGO).change(function () {
                    $('#divTblCuotas').html('<div id="tblCuotas"></div>');
                    if ($(controls.FORMA_PAGO).val() == '09913') {
                        $('.btn-cuotas').show();
                        fnCrearTablaCuotas();
                    }
                    else {
                        $('.btn-cuotas').hide();
                    }
                });

                $(controls.TIPO_OPERACION).change(function () {
                    var tipoOperacion = $(controls.TIPO_OPERACION).val()
                    if (tipoOperacion == '07400') {
                        $('.bloque-tipodetraccion').show();
                    }
                    else {
                        $('.bloque-tipodetraccion').hide();
                    }

                    setTimeout(function () {
                        fnCalcularTotales();
                    }, 250);

                })
                var tipoOperacion = $(controls.TIPO_OPERACION).val()
                if (tipoOperacion == '07400') {
                    $('.bloque-tipodetraccion').show();
                }
                else {
                    $('.bloque-tipodetraccion').hide();
                }

                $(controls.TIPO_INGRESO).change(function () {
                    var tipoIngreso = $(controls.TIPO_INGRESO).val();
                    if (tipoIngreso == 'M' || tipoIngreso == 'A') {
                        $('.fechaingresostock').show();
                    }
                    else {
                        $('.fechaingresostock').hide();
                    }
                })
                var tipoIngreso = $(controls.TIPO_INGRESO).val();
                if (tipoIngreso == 'M' || tipoIngreso == 'A') {
                    $('.fechaingresostock').show();
                }
                else {
                    $('.fechaingresostock').hide();
                }

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
                $(form + ' #btnCrearGuia').click(function (e) {
                    e.preventDefault();
                    if (!estado) {
                        estado = true;
                        fnCrearGuia();
                    }
                });
                $(form + ' #btnAdjuntarGuia').click(function (e) {
                    e.preventDefault();
                    if (!estado) {
                        estado = true;
                        fnBuscarGuia();
                    }
                });
                $(form + ' #btnBuscarImportacion').click(function (e) {
                    e.preventDefault();
                    if (!estado) {
                        estado = true;
                        fnBuscarImportacion();
                    }
                })
                $(form + ' #btnAgregarCuota').click(function () {
                    var fecha = $(controls.FECHA_VENCIMIENTO).val();

                    const rows = $(table).jqxGrid('getrows');
                    var precioTotal = 0;
                    $.each(rows, function (i, v) {
                        var codAfectacion = parseFloat(v.CODIGO_AFECTACION_IGV_CABECERA)
                        precioTotal += (v.PRECIO_TOTAL * codAfectacion);
                    });

                    var i = $('#tblCuotas').jqxGrid('getrows').length;

                    var arrCuotas = [{
                        _rowNum: i + 1,
                        C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                        C_COMPRA: '',
                        C_CUOTA: '',
                        FECHA_VENCIMIENTO: fecha,
                        MONTO_CUOTA: precioTotal,
                    }]
                    $('#tblCuotas').jqxGrid('addrow', {}, arrCuotas);
                })
                $(form + ' #btnEliminarCuota').click(function () {
                    const fila = $('#tblCuotas').jqxGrid('getselectedrowindex')
                    const rowid = $('#tblCuotas').jqxGrid('getrowid', fila)
                    $('#tblCuotas').jqxGrid('deleterow', rowid);
                })
                $(form + ' #btnBuscarDocumentoRef').click(function (e) {
                    e.preventDefault();
                    fnBuscarDocumentoReferencia();
                });
                $(form + ' #btnBuscarConstanciaRef').click(function () {
                    if ($(controls.C_PROVEEDOR).val() == '') {
                        alertify.warning('Por favor seleccione al proveedor')
                        return;
                    }
                    fnBuscarConstanciaRef();
                });
                $(form + ' #btnDeleteConstanciaRef').click(function () {
                    $(_controls.C_CONSTANCIA).val('');
                    $(_controls.CONSTANCIA_REF).val('');
                    fnCalcularTotales();

                });
                $(form + ' #btnBuscarRetencion').click(function () {
                    if ($(controls.C_PROVEEDOR).val() == '') {
                        alertify.warning('Por favor seleccione al proveedor')
                        return;
                    }
                    fnBuscarDocumentosRetencion();
                });
                $(form + ' #btnDeleteRetencion').click(function () {
                    arrRetenciones.map(doc => {
                        doc.IND_ESTADO = '&'
                    });
                    $(_controls.RETENCION).val('')
                });
                $(form + ' #btnBuscarTransformacionAsociada').click(function () {
                    fnBuscarTransformacionAsociada();
                });
                $(form + ' #btnDeleteTransformacionAsociada').click(function () {
                    $(_controls.TRANSFORMACION_ASOCIADA).val('')
                    $(_controls.C_TRANSFORMACION).val('')
                    $(_controls.C_TIPO_TRANSFORMACION).val('')
                });
                $(form + ' #btnGuardar').click(function () {
                    //var tipo_documento = $(_controls.C_PARAMETRO_GENERAL_TIPO_DOCUMENTO).val();
                    //if (tipo_documento == '07236' || tipo_documento == '07236') {
                    //    alertify.confirm('Mensaje del sistema', '¿El comprobante de pago esta sujeto a detracción?',
                    //        function () {
                    //            fnMostrarDetraccion();
                    //        },
                    //        function () {
                    //            $(form).submit();
                    //        }
                    //    ).set('labels', { ok: 'Si', cancel: 'No' }).set('defaultFocus', 'ok').set('closable', false);
                    //}
                    //else {
                        $(form).submit();
                    //}
                });
            },
            onError: function (error) {
                $.CloseStatusBar();
                $.ShowError({ error: error });
            },
            rules: {
                'NRO_COMPROBANTE': {
                    required: true,
                    runQuery: {
                        onStart: function () {

                            const nro = $(_controls.NRO_COMPROBANTE).val();
                            const partes = $.trim(nro.replace(new RegExp('#', 'g'), ' ')).split('-')
                            const serie = $.trim(partes[0]);
                            let nroComprobante = $.trim(partes[1]);

                            //if (serie.length != 4) {
                            //    alertify.warning('Por favor ingrese la serie de referencia')
                            //    return;
                            //}
                            //if (nroComprobante.length == 0) {
                            //    alertify.warning('Por favor ingrese el nro de documento de referencia')
                            //    return;
                            //}

                            nroComprobante = '00000000' + nroComprobante;
                            nroComprobante = nroComprobante.substring(nroComprobante.length - 8, nroComprobante.length);

                            //agregamos peticion
                            $.AddPetition({
                                items: $.ConvertObjectToArr({
                                    script: 'q_logistica_procesos_nuevacompra_validarnrocomprobante',
                                    C_EMPRESA: function () {
                                        return $('#C_EMPRESA').val();
                                    },
                                    C_PARAMETRO_GENERAL_TIPO_DOCUMENTO: function () {
                                        return $('#C_PARAMETRO_GENERAL_TIPO_DOCUMENTO').val();
                                    },
                                    NRO_COMPROBANTE: (serie + '-' + nroComprobante).toUpperCase(),
                                    C_PROVEEDOR: function () {
                                        return $('#C_PROVEEDOR').val();
                                    },
                                    C_COMPRA: function () {
                                        return $('#C_COMPRA').val();
                                    }
                                })
                            });
                        },
                        //aqui se validan las respuestas (retornar true o false)
                        onReady: function (result) {
                            result = result[0].result.rows;

                            var estado = false;

                            if (result.length == 0) {
                                estado = true;
                            } else if (result.length == 1 && $('#C_COMPRA').val() == '') {
                                estado = false;
                            } else if (result.length == 1 && $('#C_COMPRA').val() != '') {
                                estado = false;
                            } else if (result.length == 2 && $('#C_COMPRA').val() != '') {
                                estado = true;
                            };

                            return estado;

                        }
                    }
                }
            },
            messages: {
                'NRO_COMPROBANTE': {
                    runQuery: 'El nro comprobante ya esta registrado para este proveedor'
                }
            }
        });
    });
});