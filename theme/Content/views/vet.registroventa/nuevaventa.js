require(["helper", "extras", "datetimepicker", "bootstrap-select", "inputmask"], function () {
    require(["alertify", "bootbox", "moment", "numeral"], function (alertify, bootbox, moment, numeral) {

        alertify.set('notifier', 'position', 'top-center');
        
        // Variables
        let fechaActual = $('#FECHA_ACTUAL').val().split('/');
        let porcIgv = 0.18;
        const empresa = $.solver.session.SESSION_EMPRESA;
        const session_id = $.solver.session.SESSION_ID;
        let dataVenta = {};
        let arrEliminadas = [];
        let codigos = [];
        let anticipos = [];
        let arrAnticiposEliminados = [];
        let estadoProducto = false;
        let primeraVezOperacion = true;
        let primeraVezDetraccion = true;
        const tblProductos = '#tblProductos';
        const tblCuotas = '#tblCuotas';
        const notaCredito = $('#NC').val();
        const notaDebito = $('#ND').val();
        const vistaPrevia = $('#VISTAPREVIA').val();
        const notaPedido = $('#NOTAPEDIDO').val();

        if (notaPedido == '*') {
            $('#btnAtras').attr('href', $.solver.basePath + '/Procesos/RegistroNotaPedido')
        }

        // Funciones
        const fnObtenerAlerta = function (message) {
            alertify.alert()
                .setting({
                    'title': 'Mensaje del Sistema',
                    'message': message,
                }).show();
        };
        const fnCalcularTotales = function () {
            const filas = $(tblProductos).jqxGrid('getrows');
            const simboloMoneda = $('#C_PARAMETRO_GENERAL_MONEDA')[0].args.data.filter(x => x['CODIGO'] == $('#C_PARAMETRO_GENERAL_MONEDA').val())[0].CODIGO_PARAMETRO_2;
            const tipoOperacion = $('#TIPO_OPERACION').val();
            const tipoDetraccion = $('#TIPO_DETRACCION').val();
            const emisorRetenedor = $('#EMISOR_RETENEDOR').val();
            const emisorBuenContribuyente = $('#EMISOR_BUEN_CONTRIBUYENTE').val();
            const clienteRetenedor = $('#CLIENTE_RETENEDOR').val();
            const clienteBuenContribuyente = $('#CLIENTE_BUEN_CONTRIBUYENTE').val();

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

            // Para anticipos
            let opAnticiposTotal = 0.00;
            let restaIgv = 0.00;
            let restaRc = 0.00;

            $.each(anticipos.filter(x => x['IND_ESTADO'] == '*'), function (i, v) {
                opAnticiposTotal += v.TOTAL;
                restaIgv += v.IGV;
                restaRc += v.RC;
            })

            $.each(filas, function (i, v) {
                var codAfectacion = parseFloat(v.CODIGO_AFECTACION_IGV_CABECERA)
                if (v.CODIGO_AFECTACION_IGV == '01') {
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

            if (($('#C_PARAMETRO_GENERAL_MONEDA').val() == '07235' ? (importeTotal * parseFloat($('#TC').val())) : importeTotal) > 700) {
                if (tipoOperacion == '07400' && tipoDetraccion != '') {
                    var calculoDetraccion = $('#TIPO_DETRACCION')[0].args.data.filter(x => x['CODIGO'] == tipoDetraccion)[0].CALCULO
                    opDetraccion = importeTotal * (calculoDetraccion / 100);
                }

                // Si el emisor no es retenedor y cliente si
                if (emisorRetenedor == '&' && clienteRetenedor == '*' && !(tipoOperacion == '07400')) {
                    var calculoRetencion = 3;
                    opRetencion = importeTotal * (calculoRetencion / 100);
                }

            }

            // Para vista de anticipos
            //opGravadas -= restaOpGravadas;
            igv -= restaIgv;
            recargoConsumoTotal -= restaRc;
            importeTotal -= opAnticiposTotal;


            $('.SIGNO_MONEDA').text(simboloMoneda);
            $('#OP_GRAVADAS').text(opGravadas.toFixed(2));
            $('#IGV').text(igv.toFixed(2));
            $('#OP_INAFECTA').text(opInafecta.toFixed(2));
            $('#OP_EXONERADA').text(opExonerada.toFixed(2));
            $('#ANTICIPOS').text(opAnticiposTotal.toFixed(2));
            $('#TOTAL').text(importeTotal.toFixed(2));
            $('#OPE_GRATUITAS').text(opGratuitas.toFixed(2));
            $('#DESCUENTOS').text(descuentos.toFixed(2));
            $('#OP_EXPORTACION').text(opExportacion.toFixed(2));

            $('#OP_DETRACCION').text(opDetraccion.toFixed(2));
            $('#OP_RETENCION').text(opRetencion.toFixed(2));
            $('#RECARGO_CONSUMO').text(recargoConsumoTotal.toFixed(2))

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
        };

        const fnEscogerAlmacenProducto = function (data, object, objectParent, row) {
            var token = $.CreateToken();
            var dialog = bootbox.dialog({
                title: 'Seleccione almacen',
                message: `<div id="${token}"></div>`,
                className: 'modal-search-60'
            });

            dialog.init(function () {
                setTimeout(function () {
                    $(dialog).find('#' + token).html(`
                        <div class="row">
                            <div class="ml-4 col-auto">
                                <h3><strong>Producto: </strong>${row['NOMBRE_PARA_VENTA']}</h3>
                            </div>
                        </div>
                        <div class="row mt-2" id="${token}_almacenes">
                        </div>
                    `);
                    const almacenes = $(dialog).find(`#${token}_almacenes`);

                    const fnEscogerAlmacen = function (c_almacen, nom_almacen, stock) {
                        $(objectParent).find('#C_PRODUCTO').val(row['C_PRODUCTO']);
                        $(objectParent).find('#PRODUCTO').val(row['NOMBRE_PARA_VENTA']);
                        $(objectParent).find('#NOMBRE_PARA_VENTA').val(row['NOMBRE_PARA_VENTA']);
                        $(objectParent).find('#C_UNIDAD_MEDIDA').val(row['C_UNIDAD_MEDIDA']);
                        $(objectParent).find('#UNIDAD_MEDIDA').val(row['UNIDAD_MEDIDA']);
                        $(objectParent).find('#C_PRODUCTO_PRECIO').val(row['C_PRODUCTO_PRECIO']);
                        $(objectParent).find('#C_PARAMETRO_GENERAL_TIPO_PRODUCTO').val(row['C_PARAMETRO_GENERAL_TIPO_PRODUCTO']);
                        if ($(objectParent).find('#AFECTACION_IGV')[0].args.data.filter(x => x['CODIGO'] == row['C_PARAMETRO_GENERAL_AFECTACION_IGV']).length > 0) {
                            $(objectParent).find('#AFECTACION_IGV').val(row['C_PARAMETRO_GENERAL_AFECTACION_IGV']);
                        }
                        $(objectParent).find('#C_ALMACEN').val(c_almacen);
                        $(objectParent).find('#NOM_ALMACEN').val(nom_almacen);
                        //$(objectParent).find('#STOCK').val(stock);
                        //$(objectParent).find('#CANTIDAD').attr('max', stock)
                        if (row['C_PARAMETRO_GENERAL_TIPO_PRODUCTO'] == '07229') {
                            $(objectParent).find('#CANTIDAD').val(1);
                            $(objectParent).find('#CANTIDAD').removeAttr('readonly');
                            $(objectParent).find('#PRECIO').val(row['PRECIO_VENTA']);
                            $('#PRECIO').focus();
                            $('#PRECIO').trigger('keyup');
                        }
                        else {
                            $(objectParent).find('#PRECIO').val(row['PRECIO_VENTA']);
                            $(objectParent).find('#CANTIDAD').removeAttr('readonly');
                            $(objectParent).find('#CANTIDAD').val('');
                            $('#CANTIDAD').focus();
                            $('#CANTIDAD').trigger('keyup');
                        }
                        $(objectParent).find('#C_UNIDAD_MEDIDA').attr('data-c_producto', row['C_PRODUCTO']).FieldLoadRemote({
                            onReady: function () {
                                if (row['C_UNIDAD_MEDIDA'] != null) {
                                    $(objectParent).find('#C_UNIDAD_MEDIDA').val(row['C_UNIDAD_MEDIDA']);
                                }
                            }
                        });

                        buttonState = false;
                        $(dialog).modal('hide');
                        $(object).parent().parent().parent().find('.close').trigger('click');
                    }

                    $.each(data, function (i, v) {
                        almacenes.append(`
                            <div class="${token}_almacen almacen-box col-3 ml-5 mr-5 mt-3 p-3" data-codigo="${v.C_ALMACEN}" data-stock="${v.CANTIDAD}" data-almacen="${v.NOMBRE_ALMACEN}">
                                <h4>${v.NOMBRE_ALMACEN}</h4>
                                <h5 class="text-center">${v.CANTIDAD} UND.</h5>
                            </div>
                        `);
                    });

                    $(`.${token}_almacen`).click(function () {
                        var c_almacen = $(this).attr('data-codigo');
                        var nom_almacen = $(this).attr('data-almacen');
                        var stock = $(this).attr('data-stock');
                        fnEscogerAlmacen(c_almacen, nom_almacen, stock)
                    });
                }, 150);
            });
        };
        const fnEscogerProducto = function (_object) {
            $.GetData({
                title: 'Escoger producto',
                uriData: $.solver.currentUrl + 'Ventas/Procesos/EscogerProducto/',
                location: 'float',
                type: 'GET',
                isPage: true,
                onReady: function (object, modal) {
                    const actionElegir = function () {
                        const getselectedrowindex = $(object).find('#tableEscogerProducto').jqxGrid('getselectedrowindex');
                        var row = $(object).find('#tableEscogerProducto').jqxGrid('getrows')[getselectedrowindex];
                        const { C_PRODUCTO, C_PRODUCTO_PRECIO, MODIFICA_PRECIO } = row;

                        $.GetQuery({
                            query: ['tbl_ventas_procesos_escogerproducto_comprobarproductos'],
                            items: [{
                                C_EMPRESA: empresa,
                                BUSCAR: function () {
                                    return $(object).find('#buscar').val();
                                }
                            }],
                            onBefore: function () {
                                $.DisplayStatusBar({ message: `Obteniendo última información del producto ${C_PRODUCTO}` });
                            },
                            onError: function (error) {
                                $.CloseStatusBar();
                                $.ShowError({ error });
                            },
                            onReady: function (productos) {

                                $.CloseStatusBar();
                                const producto = productos.filter((_producto) => {
                                    return _producto.C_PRODUCTO == C_PRODUCTO && _producto.C_PRODUCTO_PRECIO == C_PRODUCTO_PRECIO;
                                });
                                
                                if (producto.length == 0) {
                                    console.log(`No se encontró información del producto ${C_PRODUCTO}`);
                                }
                                else {
                                    const { STOCK_ILIMITADO, PROMOCION } = producto[0];

                                    if ((PROMOCION == 'Si' || PROMOCION == '*') && notaPedido == '*') {
                                        $.GetQuery({
                                            query: ['q_ventas_procesos_nuevaventa_obtenerinfostockpromo'],
                                            items: [{
                                                C_EMPRESA: empresa,
                                                C_PRODUCTO: C_PRODUCTO
                                            }],
                                            onBefore: function () {
                                                $.DisplayStatusBar({ message: `Obteniendo información de la promoción y stock los productos relacionados ${C_PRODUCTO}` });
                                            },
                                            onError: function (error) {
                                                $.CloseStatusBar();
                                                $.ShowError({ error });
                                            },
                                            onReady: function (result) {
                                                $.CloseStatusBar();
                                                if (result.length == 0) {
                                                    alertify.warning('Producto sin stock');
                                                }
                                                else {
                                                    $.GetQuery({
                                                        query: ['q_ventas_procesos_nuevaventa_validarconceptoalmacenventa_promo'],
                                                        items: [{
                                                            C_EMPRESA: empresa,
                                                            C_PRODUCTO: C_PRODUCTO
                                                        }],
                                                        onReady: function (concepto) {
                                                            if (concepto.length == 0) {
                                                                alertify.warning('No ha configurado el concepto de almacén de entrega de mercadería');
                                                            }
                                                            else {
                                                                if (result.length == 1) {
                                                                    const { C_ALMACEN, NOMBRE_ALMACEN, CANTIDAD } = result[0];

                                                                    $(_object).find('#C_PRODUCTO').val(row['C_PRODUCTO']);
                                                                    $(_object).find('#PRODUCTO').val(row['NOMBRE_PARA_VENTA']);
                                                                    $(_object).find('#NOMBRE_PARA_VENTA').val(row['NOMBRE_PARA_VENTA']);
                                                                    $(_object).find('#C_UNIDAD_MEDIDA').val(row['C_UNIDAD_MEDIDA']);
                                                                    $(_object).find('#UNIDAD_MEDIDA').val(row['UNIDAD_MEDIDA']);
                                                                    $(_object).find('#C_PRODUCTO_PRECIO').val(row['C_PRODUCTO_PRECIO']);
                                                                    $(_object).find('#C_PARAMETRO_GENERAL_TIPO_PRODUCTO').val(row['C_PARAMETRO_GENERAL_TIPO_PRODUCTO']);
                                                                    if ($(_object).find('#AFECTACION_IGV')[0].args.data.filter(x => x['CODIGO'] == row['C_PARAMETRO_GENERAL_AFECTACION_IGV']).length > 0) {
                                                                        $(_object).find('#AFECTACION_IGV').val(row['C_PARAMETRO_GENERAL_AFECTACION_IGV']);
                                                                    }
                                                                    $(_object).find('#C_ALMACEN').val(C_ALMACEN);
                                                                    $(_object).find('#NOM_ALMACEN').val(NOMBRE_ALMACEN);
                                                                    if (CANTIDAD == 99999) {
                                                                        $(_object).find('#STOCK').val('');
                                                                        $(_object).find('#CANTIDAD').removeAttr('max')
                                                                    }
                                                                    else {
                                                                        //$(_object).find('#STOCK').val(CANTIDAD);
                                                                        //$(_object).find('#CANTIDAD').attr('max', CANTIDAD)
                                                                    }
                                                                    $(_object).find('#C_UNIDAD_MEDIDA').attr('data-c_producto', row['C_PRODUCTO']).FieldLoadRemote({
                                                                        onReady: function () {
                                                                            if (row['C_UNIDAD_MEDIDA'] != null) {
                                                                                $(_object).find('#C_UNIDAD_MEDIDA').val(row['C_UNIDAD_MEDIDA']);
                                                                            }
                                                                        }
                                                                    });
                                                                    if (row['C_PARAMETRO_GENERAL_TIPO_PRODUCTO'] == '07229') {
                                                                        $(_object).find('#CANTIDAD').val(1);
                                                                        $(_object).find('#CANTIDAD').removeAttr('readonly');
                                                                        if (parseFloat(row['PRECIO_VENTA']) == 0) {
                                                                            $(_object).find('#PRECIO').val('');
                                                                        }
                                                                        else {
                                                                            $(_object).find('#PRECIO').val(row['PRECIO_VENTA']);
                                                                        }
                                                                        $('#PRECIO').focus();
                                                                        $('#PRECIO').trigger('keyup');
                                                                    }
                                                                    else {
                                                                        if (parseFloat(row['PRECIO_VENTA']) == 0) {
                                                                            $(_object).find('#PRECIO').val('');
                                                                        }
                                                                        else {
                                                                            $(_object).find('#PRECIO').val(row['PRECIO_VENTA']);
                                                                        }
                                                                        $(_object).find('#CANTIDAD').removeAttr('readonly');
                                                                        $(_object).find('#CANTIDAD').val('');
                                                                        $(_object).find('#CANTIDAD').focus();
                                                                        $(_object).find('#CANTIDAD').trigger('keyup');
                                                                    }

                                                                    const codAfectacionCab = parseFloat($(_object).find('#AFECTACION_IGV')[0].args.data.filter(x => x['CODIGO'] == $(_object).find('#AFECTACION_IGV').val())[0].CODIGO_PARAMETRO_3);
                                                                    if (codAfectacionCab == 0) {
                                                                        $(_object).find('#PORC_DSCTO').val('');
                                                                        $(_object).find('#PORC_DSCTO').attr('readonly', 'readonly');
                                                                    }
                                                                    else {
                                                                        $(_object).find('#PORC_DSCTO').removeAttr('readonly');
                                                                    }
                                                                    $(object).parent().parent().parent().find('.close').trigger('click');
                                                                }
                                                                else {
                                                                    fnEscogerAlmacenProducto(result, object, _object, row)
                                                                }
                                                            }
                                                        }
                                                    })
                                                }
                                            }
                                        });
                                    }
                                    else {
                                        if (STOCK_ILIMITADO == 'Si' || STOCK_ILIMITADO == '*') {
                                            $(_object).find('#C_PRODUCTO').val(row['C_PRODUCTO']);
                                            $(_object).find('#PRODUCTO').val(row['NOMBRE_PARA_VENTA']);
                                            $(_object).find('#NOMBRE_PARA_VENTA').val(row['NOMBRE_PARA_VENTA']);
                                            $(_object).find('#C_UNIDAD_MEDIDA').val(row['C_UNIDAD_MEDIDA']);
                                            $(_object).find('#UNIDAD_MEDIDA').val(row['UNIDAD_MEDIDA']);
                                            $(_object).find('#C_PRODUCTO_PRECIO').val(row['C_PRODUCTO_PRECIO']);
                                            $(_object).find('#C_PARAMETRO_GENERAL_TIPO_PRODUCTO').val(row['C_PARAMETRO_GENERAL_TIPO_PRODUCTO']);
                                            $(_object).find('#C_SUJETO_DETRACCION').val(row['C_SUJETO_DETRACCION']);
                                            if ($(_object).find('#AFECTACION_IGV')[0].args.data.filter(x => x['CODIGO'] == row['C_PARAMETRO_GENERAL_AFECTACION_IGV']).length > 0) {
                                                $(_object).find('#AFECTACION_IGV').val(row['C_PARAMETRO_GENERAL_AFECTACION_IGV']);
                                            }
                                            $(_object).find('#CANTIDAD').removeAttr('max')
                                            $(_object).find('#C_UNIDAD_MEDIDA').attr('data-c_producto', row['C_PRODUCTO']).FieldLoadRemote({
                                                onReady: function () {
                                                    if (row['C_UNIDAD_MEDIDA'] != null) {
                                                        $(_object).find('#C_UNIDAD_MEDIDA').val(row['C_UNIDAD_MEDIDA']);
                                                    }
                                                }
                                            });
                                            if (row['C_PARAMETRO_GENERAL_TIPO_PRODUCTO'] == '07229') {
                                                $(_object).find('#CANTIDAD').val(1);
                                                $(_object).find('#CANTIDAD').removeAttr('readonly');
                                                if (parseFloat(row['PRECIO_VENTA']) == 0) {
                                                    $(_object).find('#PRECIO').val('');
                                                }
                                                else {
                                                    $(_object).find('#PRECIO').val(row['PRECIO_VENTA']);
                                                }
                                                $('#PRECIO').focus();
                                                $('#PRECIO').trigger('keyup');
                                            }
                                            else {
                                                if (parseFloat(row['PRECIO_VENTA']) == 0) {
                                                    $(_object).find('#PRECIO').val('');
                                                }
                                                else {
                                                    $(_object).find('#PRECIO').val(row['PRECIO_VENTA']);
                                                }
                                                $(_object).find('#CANTIDAD').removeAttr('readonly');
                                                $(_object).find('#CANTIDAD').val('');
                                                $('#CANTIDAD').focus();
                                                $('#CANTIDAD').trigger('keyup');
                                            }

                                            $(_object).find('#STOCK').val('');
                                            $(_object).find('#C_ALMACEN').val('');
                                            $(_object).find('#NOM_ALMACEN').val('');
                                            if ($(_object).find('#AFECTACION_IGV').val() != null) {
                                                const codAfectacionCab = parseFloat($(_object).find('#AFECTACION_IGV')[0].args.data.filter(x => x['CODIGO'] == $(_object).find('#AFECTACION_IGV').val())[0].CODIGO_PARAMETRO_3);
                                                if (codAfectacionCab == 0) {
                                                    $(_object).find('#PORC_DSCTO').val('');
                                                    $(_object).find('#PORC_DSCTO').attr('readonly', 'readonly');
                                                }
                                                else {
                                                    $(_object).find('#PORC_DSCTO').removeAttr('readonly');
                                                }
                                            }
                                            $(object).parent().parent().parent().find('.close').trigger('click');
                                        }
                                        else if (STOCK_ILIMITADO == 'No' || STOCK_ILIMITADO == '&') {
                                            $.GetQuery({
                                                query: ['q_ventas_procesos_nuevaventa_obteneralmacenes_producto'],
                                                items: [{
                                                    C_EMPRESA: empresa,
                                                    C_PRODUCTO: row['C_PRODUCTO'],
                                                    C_UNIDAD_MEDIDA: (row['C_UNIDAD_MEDIDA'] == null ? row['C_UNIDAD_PRIN'] : row['C_UNIDAD_MEDIDA'])
                                                }],
                                                onReady: function (result) {
                                                    if (result.length == 0 && notaPedido == '') {
                                                        alertify.warning('Producto sin stock')
                                                    }
                                                    else {
                                                        $.GetQuery({
                                                            query: ['q_ventas_procesos_nuevaventa_validarconceptoalmacenventa'],
                                                            items: [{
                                                                C_EMPRESA: empresa
                                                            }],
                                                            onReady: function (concepto) {
                                                                if (concepto.length == 0) {
                                                                    alertify.warning('No ha configurado el concepto de almacén de entrega de mercadería');
                                                                }
                                                                else {
                                                                    if (result.length == 1) {
                                                                        const almacen = result[0];
                                                                        const c_almacen = almacen.C_ALMACEN;
                                                                        const nom_almacen = almacen.NOMBRE_ALMACEN;
                                                                        const stock = almacen.CANTIDAD;
                                                                        $(_object).find('#C_PRODUCTO').val(row['C_PRODUCTO']);
                                                                        $(_object).find('#PRODUCTO').val(row['NOMBRE_PARA_VENTA']);
                                                                        $(_object).find('#NOMBRE_PARA_VENTA').val(row['NOMBRE_PARA_VENTA']);
                                                                        $(_object).find('#C_UNIDAD_MEDIDA').attr('data-c_producto', row['C_PRODUCTO']).FieldLoadRemote({
                                                                            onReady: function () {
                                                                                if (row['C_UNIDAD_MEDIDA'] != null) {
                                                                                    $(_object).find('#C_UNIDAD_MEDIDA').val(row['C_UNIDAD_MEDIDA']);
                                                                                }
                                                                            }
                                                                        });
                                                                        //$(_object).find('#C_UNIDAD_MEDIDA').val(row['C_UNIDAD_MEDIDA']);
                                                                        $(_object).find('#UNIDAD_MEDIDA').val(row['UNIDAD_MEDIDA']);
                                                                        $(_object).find('#C_PRODUCTO_PRECIO').val(row['C_PRODUCTO_PRECIO']);
                                                                        $(_object).find('#C_SUJETO_DETRACCION').val(row['C_SUJETO_DETRACCION']);
                                                                        $(_object).find('#C_PARAMETRO_GENERAL_TIPO_PRODUCTO').val(row['C_PARAMETRO_GENERAL_TIPO_PRODUCTO']);
                                                                        if ($(_object).find('#AFECTACION_IGV')[0].args.data.filter(x => x['CODIGO'] == row['C_PARAMETRO_GENERAL_AFECTACION_IGV']).length > 0) {
                                                                            $(_object).find('#AFECTACION_IGV').val(row['C_PARAMETRO_GENERAL_AFECTACION_IGV']);
                                                                        }
                                                                        $(_object).find('#C_ALMACEN').val(c_almacen);
                                                                        $(_object).find('#NOM_ALMACEN').val(nom_almacen);
                                                                        //$(_object).find('#STOCK').val(stock);
                                                                        //$(_object).find('#CANTIDAD').attr('max', stock)
                                                                        if (row['C_PARAMETRO_GENERAL_TIPO_PRODUCTO'] == '07229') {
                                                                            $(_object).find('#CANTIDAD').val(1);
                                                                            $(_object).find('#CANTIDAD').removeAttr('readonly');
                                                                            if (parseFloat(row['PRECIO_VENTA']) == 0) {
                                                                                $(_object).find('#PRECIO').val('');
                                                                            }
                                                                            else {
                                                                                $(_object).find('#PRECIO').val(row['PRECIO_VENTA']);
                                                                            }
                                                                            $('#PRECIO').focus();
                                                                            $('#PRECIO').trigger('keyup');
                                                                        }
                                                                        else {
                                                                            if (parseFloat(row['PRECIO_VENTA']) == 0) {
                                                                                $(_object).find('#PRECIO').val('');
                                                                            }
                                                                            else {
                                                                                $(_object).find('#PRECIO').val(row['PRECIO_VENTA']);
                                                                            }
                                                                            $(_object).find('#CANTIDAD').removeAttr('readonly');
                                                                            $(_object).find('#CANTIDAD').val('');
                                                                            $(_object).find('#CANTIDAD').focus();
                                                                            $(_object).find('#CANTIDAD').trigger('keyup');
                                                                        }
                                                                        const codAfectacionCab = parseFloat($(_object).find('#AFECTACION_IGV')[0].args.data.filter(x => x['CODIGO'] == $(_object).find('#AFECTACION_IGV').val())[0].CODIGO_PARAMETRO_3);
                                                                        if (codAfectacionCab == 0) {
                                                                            $(_object).find('#PORC_DSCTO').val('');
                                                                            $(_object).find('#PORC_DSCTO').attr('readonly', 'readonly');
                                                                        }
                                                                        else {
                                                                            $(_object).find('#PORC_DSCTO').removeAttr('readonly');
                                                                        }
                                                                        $(object).parent().parent().parent().find('.close').trigger('click');
                                                                    }
                                                                    else {
                                                                        fnEscogerAlmacenProducto(result, object, _object, row)
                                                                    }
                                                                }
                                                            }
                                                        });
                                                    }
                                                },
                                                onError: function (error) {
                                                    $.CloseStatusBar();
                                                    $.ShowError({ error });
                                                }
                                            });
                                        }
                                    }
                                    $(_object).find('#STOCK_ILIMITADO').val(row['STOCK_ILIMITADO']);
                                    $(_object).find('#PROMOCION').val(row['PROMOCION']);
                                    $(_object).find('#MODIFICA_PRECIO').val(row['MODIFICA_PRECIO']);
                                    if (MODIFICA_PRECIO == '&') {
                                        $(_object).find('#PRECIO').attr('readonly', 'readonly')
                                    }
                                    else {
                                        $(_object).find('#PRECIO').removeAttr('readonly')
                                    }
                                }
                            }
                        });
                    }

                    $(modal).find('.modal-dialog').attr('style', 'max-width: 80% !important; margin-top: 4%');
                    $(object).find('form[name=frmEscogerProducto]').ValidForm({
                        type: -1,
                        onReady: function () {
                            $(object).find('#tableEscogerProducto').jqxGrid('updatebounddata')
                        },
                        onDone: function () {
                            $(object).find('#tableEscogerProducto').CreateGrid({
                                query: 'tbl_ventas_procesos_escogerproducto_listaproductos',
                                items: {
                                    C_EMPRESA: empresa,
                                    BUSCAR: function () {
                                        return $(object).find('#buscar').val();
                                    },
                                    MONEDA: function () {
                                        return ''
                                    }
                                },
                                hiddens: [
                                    'C_PARAMETRO_GENERAL_TIPO_PRODUCTO', 'C_UNIDAD_MEDIDA', 'C_PRODUCTO_PRECIO',
                                    'C_PARAMETRO_GENERAL_AFECTACION_IGV', 'C_UNIDAD_NEGOCIO', 'SIGNO_MONEDA',
                                    'MODIFICA_PRECIO', 'C_SUJETO_DETRACCION', 'CALCULO', 'C_UNIDAD_PRIN', 'C_UNIDAD_AUX'],
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
                                        width: '80'
                                    },
                                    'NOMBRE_PARA_VENTA': {
                                        text: 'Nombre artículo',
                                        width: 300
                                    },
                                    'TIPO': {
                                        text: 'Tipo',
                                        width: 100
                                    },
                                    'TIPO_CLIENTE': {
                                        text: 'Tipo cliente',
                                        width: 120
                                    },
                                    'STOCK_ILIMITADO': {
                                        text: 'Stock ilim.',
                                        width: 80
                                    },
                                    'PROMOCION': {
                                        text: 'Paquete',
                                        width: 80
                                    },
                                    'UNIDAD_MEDIDA': {
                                        text: 'Und. med.',
                                        width: 100
                                    },
                                    'STOCK': {
                                        text: 'Stock',
                                        width: 60,
                                        cellsAlign: 'right',
                                        cellsFormat: 'd',
                                        columnType: 'numberinput',
                                    },
                                    'MONEDA': {
                                        text: 'Moneda',
                                        width: 80
                                    },
                                    'PRECIO_VENTA': {
                                        text: 'Precio venta',
                                        width: 80,
                                        cellsAlign: 'right',
                                        cellsFormat: 'd2',
                                        columnType: 'numberinput',
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
                            //$(object).find('#buscar').change(function () {
                            //    $(object).find('form[name=frmEscogerProducto]').submit();
                            //});
                        }
                    });
                },
                onCloseModal: function () {
                    $('#btnEscogerProducto').attr('disabled', false);
                }
            });
        };
        const buscarProductos = function (indice) {
            var myControls = null;
            $.GetData({
                title: 'Busqueda de productos',
                uriData: $.solver.currentUrl + 'Ventas/Mantenimiento/BusquedaProducto/',
                location: 'float',
                type: 'GET',
                isPage: true,
                onReady: function (object, modal) {
                    $(modal).find('.modal-dialog').css({ 'max-width': '75%' });
                    $(object).find('#btnEscogerProducto').click(function () {
                        $('#btnEscogerProducto').attr('disabled', true);
                        fnEscogerProducto(object);
                    });
                    $(object).find('form[name=frmBusquedaProducto]').ValidForm({
                        type: -1,
                        onDone: function (form, controls) {
                            myControls = form;

                            var tipoOperacionCabecera = $('#TIPO_OPERACION').val();
                            var tipoAfectacion = '1'
                            if (tipoOperacionCabecera == '07385') {
                                tipoAfectacion = '2'
                            }
                            else {
                                tipoAfectacion = '1'
                            }

                            $(form).find('#AFECTACION_IGV')
                                .attr('data-tipoafectacion', tipoAfectacion)
                                .FieldLoadRemote({
                                    onReady: function () {
                                        if (indice != undefined) {
                                            const fila = $(tblProductos).jqxGrid('getrows')[indice];
                                            const c_producto = fila['C_PRODUCTO'];
                                            const nomProducto = fila['NOMBRE_ORIGINAL'];
                                            const descripcion = fila['DESCRIPCION'];
                                            const cantidad = fila['CANTIDAD'];
                                            const precio = parseFloat(fila['PRECIO'])
                                            const porc_dscto = fila['PORC_DSCTO'];
                                            const prod_precio = fila['C_PRODUCTO_PRECIO'];
                                            const afectacion = fila['AFECTACION_IGV'];
                                            const incluyeIgv = fila['INCLUYE_IGV'];
                                            const c_tipo_producto = fila['C_PARAMETRO_GENERAL_TIPO_PRODUCTO'];
                                            const c_unidad_medida = fila['C_UNIDAD_MEDIDA'];
                                            const unidad_medida = fila['UNIDAD_MEDIDA'];
                                            const c_almacen = fila['C_ALMACEN'];
                                            const almacen = fila['NOMBRE_ALMACEN'];
                                            const stock = fila['STOCK'];
                                            const stockIlimitado = fila['STOCK_ILIMITADO'];
                                            const promocion = fila['PROMOCION'];
                                            const modificaPrecio = fila['MODIFICA_PRECIO'];
                                            const porc_igv = fila['PORC_IGV'];
                                            const porc_rc = fila['PORC_RC'];

                                            if (fila['C_DESPACHO'] != undefined) {
                                                if (fila['C_DESPACHO'] != null && fila['C_DESPACHO'] != '') {
                                                    $(controls.CANTIDAD).attr('readonly', 'readonly')
                                                }
                                            }

                                            $(form).find('#C_UNIDAD_MEDIDA')
                                                .attr('data-C_PRODUCTO', c_producto)
                                                .FieldLoadRemote({
                                                    onReady: function () {
                                                        $(form).find('#C_PRODUCTO').val(c_producto);
                                                        $(form).find('#NOMBRE_PARA_VENTA').val(nomProducto);
                                                        $(form).find('#PRODUCTO').val(nomProducto);
                                                        $(form).find('#DESCRIPCION').val(descripcion);
                                                        $(form).find('#CANTIDAD').val(cantidad);
                                                        $(form).find('#PRECIO').val(precio);
                                                        $(form).find('#PORC_DSCTO').val((porc_dscto == 0 ? '' : porc_dscto));
                                                        $(form).find('#C_PRODUCTO_PRECIO').val(prod_precio);
                                                        $(form).find('#AFECTACION_IGV').val(afectacion);
                                                        $(form).find('#CHECK_IGV').attr('checked', (incluyeIgv == 'false' || !incluyeIgv ? false : true));
                                                        $(form).find('#C_PARAMETRO_GENERAL_TIPO_PRODUCTO').val(c_tipo_producto);
                                                        $(form).find('#C_UNIDAD_MEDIDA').val(c_unidad_medida);
                                                        $(form).find('#UNIDAD_MEDIDA').val(unidad_medida);
                                                        $(form).find('#C_ALMACEN').val(c_almacen);
                                                        $(form).find('#NOM_ALMACEN').val(almacen);
                                                        //$(form).find('#STOCK').val(stock);
                                                        $(form).find('#STOCK_ILIMITADO').val(stockIlimitado);
                                                        $(form).find('#PROMOCION').val(promocion);
                                                        $(form).find('#MODIFICA_PRECIO').val(modificaPrecio);
                                                        $(form).find('#PORC_IGV').val(porc_igv)
                                                        $(form).find('#PORC_RC').val(porc_rc)
                                                        if (modificaPrecio == '&') {
                                                            $(form).find('#PRECIO').attr('readonly', 'readonly')
                                                        }
                                                        else {
                                                            $(form).find('#PRECIO').removeAttr('readonly')
                                                        }
                                                        if (c_tipo_producto == '07229') {
                                                            $(form).find('.porcentajes').hide()
                                                        }
                                                    }
                                                })

                                            const codAfectacionCab = parseFloat($(form).find('#AFECTACION_IGV')[0].args.data.filter(x => x['CODIGO'] == $(form).find('#AFECTACION_IGV').val())[0].CODIGO_PARAMETRO_3);
                                            if (codAfectacionCab == 0) {
                                                $(form).find('#PORC_DSCTO').val('');
                                                $(form).find('#PORC_DSCTO').attr('readonly', 'readonly');
                                            }
                                            else {
                                                $(form).find('#PORC_DSCTO').removeAttr('readonly');
                                            }

                                            if (!$('#C_PARAMETRO_GENERAL_TIPO_DOCUMENTO').val() == '07242' && !$('#C_PARAMETRO_GENERAL_TIPO_DOCUMENTO').val() == '07241') {

                                                if (promocion == 'Si' || promocion == '*') {
                                                    $.GetQuery({
                                                        query: ['q_ventas_procesos_nuevaventa_obtenerinfostockpromo'],
                                                        items: [{
                                                            C_EMPRESA: empresa,
                                                            C_PRODUCTO: c_producto
                                                        }],
                                                        onBefore: function () {
                                                            $.DisplayStatusBar({ message: `Obteniendo información de la promoción y stock los productos relacionados ${C_PRODUCTO}` });
                                                        },
                                                        onError: function (error) {
                                                            $.CloseStatusBar();
                                                            $.ShowError({ error });
                                                        },
                                                        onReady: function (result) {
                                                            $.CloseStatusBar();
                                                            const almacen = result.filter((_almacen) => {
                                                                return _almacen.C_ALMACEN == c_almacen;
                                                            });
                                                            if (almacen.length > 0) {
                                                                const data = almacen[0];
                                                                //$(form).find('#STOCK').val(data.CANTIDAD);
                                                                //$(form).find('#CANTIDAD').attr('max', data.CANTIDAD);
                                                            }
                                                            else {
                                                                //$(form).find('#STOCK').val(0);
                                                                //$(form).find('#CANTIDAD').attr('max', 0);
                                                            }
                                                        }
                                                    });
                                                }
                                                else {
                                                    if (stockIlimitado == 'No' || stockIlimitado == '&') {
                                                        if (c_almacen != '' && c_almacen != null) {
                                                            $.GetQuery({
                                                                query: ['gbl_validar_stock_producto_para_venta'],
                                                                items: [{
                                                                    C_EMPRESA: empresa,
                                                                    C_PRODUCTO: c_producto,
                                                                    C_ALMACEN: c_almacen,
                                                                    C_UNIDAD_MEDIDA: c_unidad_medida
                                                                }],
                                                                onReady: function (result) {
                                                                    if (result.length > 0) {
                                                                        const data = result[0];

                                                                        //$(form).find('#STOCK').val(data.CANTIDAD);
                                                                        //$(form).find('#CANTIDAD').attr('max', data.CANTIDAD);
                                                                    }
                                                                    else {
                                                                        //$(form).find('#STOCK').val(0);
                                                                        //$(form).find('#CANTIDAD').attr('max', 0);
                                                                    }
                                                                }
                                                            })
                                                        }
                                                    }
                                                }

                                            }
                                        }
                                        else {
                                            $(object).find('#btnEscogerProducto').trigger('click');
                                        }
                                    }
                                })

                            $(form).find('.number-input').on('input', function () {
                                this.value = this.value.replace(/[^0-9]/g, '');
                            });

                            $(form).find('#AFECTACION_IGV').change(function () {
                                const codAfectacionCab = parseFloat($(this)[0].args.data.filter(x => x['CODIGO'] == $(this).val())[0].CODIGO_PARAMETRO_3);
                                if (codAfectacionCab == 0) {
                                    $(form).find('#PORC_DSCTO').val('').trigger('change');
                                    $(form).find('#PORC_DSCTO').attr('readonly', 'readonly');
                                }
                                else {
                                    $(form).find('#PORC_DSCTO').removeAttr('readonly');
                                }
                            });

                            $(form).find('#C_UNIDAD_MEDIDA').change(function () {
                                $.GetQuery({
                                    query: ['q_ventas_obtener_stock_precio_por_medida_unidad'],
                                    items: [{
                                        C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                                        C_UNIDAD_MEDIDA: function () {
                                            return $('#C_UNIDAD_MEDIDA').val();
                                        },
                                        C_PRODUCTO: function () {
                                            return $('#C_PRODUCTO').val();
                                        }
                                    }],
                                    onReady: function (result) {
                                        if (result.length == 0) {
                                            $('#STOCK').val('')
                                            $('#CANTIDAD').removeAttr('max')
                                            $('#PRECIO').val('').trigger('change')
                                        }
                                        else {
                                            //$('#STOCK').val(result[0].STOCK)
                                            //$('#CANTIDAD').attr('max', result[0].STOCK)
                                            $('#PRECIO').val(result[0].PRECIO).trigger('change')
                                        }
                                    }
                                });
                            });
                        },
                        onReady: function () {
                            const C_PRODUCTO = $(myControls).find('#C_PRODUCTO').val();
                            const C_ALMACEN = $(myControls).find('#C_ALMACEN').val();
                            const C_UNIDAD_MEDIDA = $(myControls).find('#C_UNIDAD_MEDIDA').val();

                            $.GetQuery({
                                query: ['tbl_ventas_procesos_escogerproducto_comprobarproductos'],
                                items: [{
                                    C_EMPRESA: empresa,
                                    BUSCAR: '',
                                }],
                                onBefore: function () {
                                    $.DisplayStatusBar({ message: `Obteniendo última información del producto ${C_PRODUCTO}` });
                                },
                                onError: function (error) {
                                    $.CloseStatusBar();
                                    $.ShowError({ error });
                                },
                                onReady: function (productos) {
                                    $.CloseStatusBar();

                                    const producto = productos.filter((_producto) => {
                                        return _producto.C_PRODUCTO == C_PRODUCTO
                                    });

                                    if (producto.length == 0) {
                                        console.log(`No se encontró información del producto ${C_PRODUCTO}`);
                                    }
                                    else {
                                        const { PROMOCION, STOCK_ILIMITADO } = producto[0];

                                        if (!$('#C_PARAMETRO_GENERAL_TIPO_DOCUMENTO').val() == '07242' && !$('#C_PARAMETRO_GENERAL_TIPO_DOCUMENTO').val() == '07241') {
                                            if (PROMOCION == 'Si' || PROMOCION == '*') {
                                                $.GetQuery({
                                                    query: ['q_ventas_procesos_nuevaventa_obtenerinfostockpromo'],
                                                    items: [{
                                                        C_EMPRESA: empresa,
                                                        C_PRODUCTO: C_PRODUCTO
                                                    }],
                                                    onBefore: function () {
                                                        $.DisplayStatusBar({ message: `Obteniendo información de la promoción y stock los productos relacionados ${C_PRODUCTO}` });
                                                    },
                                                    onError: function (error) {
                                                        $.CloseStatusBar();
                                                        $.ShowError({ error });
                                                    },
                                                    onReady: function (result) {
                                                        $.CloseStatusBar();
                                                        if (result.length == 0) {
                                                            alertify.warning('Producto sin stock');
                                                        }
                                                        else if (result.length > 0) {

                                                            var almacen = result.filter((_almacen) => {
                                                                return _almacen.C_ALMACEN == C_ALMACEN;
                                                            });

                                                            const data = almacen[0];

                                                            if (data.CANTIDAD > 0 && parseFloat($(myControls).find('#CANTIDAD').val()) <= data.CANTIDAD) {
                                                                fnGuardarDetalle();
                                                            }
                                                            else {
                                                                alertify.warning('No hay stock suficiente en el almacen <strong>' + $(myControls).find('#NOM_ALMACEN').val() + '</strong>');
                                                                $(myControls).find('#CANTIDAD').attr('max', data.CANTIDAD)
                                                            }
                                                        }
                                                    }
                                                })
                                            }
                                            else {
                                                if (STOCK_ILIMITADO == 'Si' || STOCK_ILIMITADO == '*') {
                                                    fnGuardarDetalle();
                                                }
                                                else {
                                                    $.GetQuery({
                                                        query: ['gbl_validar_stock_producto_para_venta'],
                                                        items: [{
                                                            C_EMPRESA: empresa,
                                                            C_PRODUCTO: function () {
                                                                return C_PRODUCTO;
                                                            },
                                                            C_ALMACEN: function () {
                                                                return C_ALMACEN;
                                                            },
                                                            C_UNIDAD_MEDIDA: function () {
                                                                return C_UNIDAD_MEDIDA
                                                            }
                                                        }],
                                                        onReady: function (result) {
                                                            if (result.length > 0) {
                                                                const data = result[0];
                                                                if (data.CANTIDAD > 0 && parseFloat($(myControls).find('#CANTIDAD').val()) <= data.CANTIDAD) {
                                                                    fnGuardarDetalle();
                                                                }
                                                                else {
                                                                    alertify.warning('No hay stock suficiente en el almacen <strong>' + $(myControls).find('#NOM_ALMACEN').val() + '</strong>');
                                                                    $(myControls).find('#CANTIDAD').attr('max', data.CANTIDAD)
                                                                }
                                                            }
                                                        },
                                                        onError: function (error) {
                                                            $.CloseStatusBar();
                                                            $.ShowError({ error });
                                                        }

                                                    })
                                                }
                                            }
                                        }
                                        else {
                                            fnGuardarDetalle();
                                        }

                                    }
                                }
                            });

                            const fnGuardarDetalle = function () {
                                const fila = $(tblProductos).jqxGrid('getrows')[indice];
                                const c_producto = $(myControls).find('#C_PRODUCTO').val();
                                const c_unidad_medida = $(myControls).find('#C_UNIDAD_MEDIDA').val();

                                // Solo si es nota de crédito 
                                var validarCeros = (notaCredito == '*' || $('#MOTIVO_NOTA_CREDITO').val() != '' ? false : true);

                                if (c_producto == '') {
                                    fnObtenerAlerta('Por favor seleccione un producto');
                                }
                                else if (
                                    ($(myControls).find('#C_PARAMETRO_GENERAL_TIPO_PRODUCTO').val() != '07229') &&
                                    (
                                        (indice == undefined && $(tblProductos).jqxGrid('getrows').filter(x => x['C_PRODUCTO'] == c_producto && x['C_UNIDAD_MEDIDA'] == c_unidad_medida).length > 0) ||
                                        (indice != undefined && (fila['C_PRODUCTO'] != c_producto && $(tblProductos).jqxGrid('getrows').filter(x => x['C_PRODUCTO'] == c_producto).length > 0))
                                    )
                                ) {
                                    alertify.warning('No se puede agregar un mismo producto al detalle.');
                                }
                                else if ($(myControls).find('#CANTIDAD').val() <= 0) {
                                    alertify.warning('Por favor ingrese una cantidad mayor a 0.');
                                }
                                else if ((validarCeros == true && $(myControls).find('#PRECIO').val() <= 0)) {
                                    alertify.warning('Por favor ingrese un precio mayor a 0.');
                                }
                                else {
                                    const descripcion = $(myControls).find('#DESCRIPCION').val();
                                    const cantidad = parseFloat($(myControls).find('#CANTIDAD').val());
                                    let precio = parseFloat($(myControls).find('#PRECIO').val());
                                    const nomProducto = $(myControls).find('#NOMBRE_PARA_VENTA').val();
                                    const modifica_precio = $(myControls).find('#MODIFICA_PRECIO').val();
                                    let unidad_medida = ''
                                    if (c_unidad_medida != '' && c_unidad_medida != null) {
                                        unidad_medida = $(myControls).find('#C_UNIDAD_MEDIDA')[0].args.data.filter(x => x['CODIGO'] == $(myControls).find('#C_UNIDAD_MEDIDA').val())[0].NOMBRE;
                                    }
                                    const nomProductoCompleto = $(myControls).find('#NOMBRE_PARA_VENTA').val() + (unidad_medida == '' ? '' : ' - ' + unidad_medida);

                                    const c_almacen = $(myControls).find('#C_ALMACEN').val();
                                    const nomAlmacen = $(myControls).find('#NOM_ALMACEN').val();
                                    const stock = $(myControls).find('#STOCK').val();

                                    let c_producto_precio = $(myControls).find('#C_PRODUCTO_PRECIO').val();
                                    let c_tipo_producto = $(myControls).find('#C_PARAMETRO_GENERAL_TIPO_PRODUCTO').val();

                                    const baseImponible = precio * cantidad;
                                    const incluyeIgv = $(myControls).find('#CHECK_IGV').is(':checked');
                                    const porcDescuento = parseFloat(($(myControls).find('#PORC_DSCTO').val() == '' ? 0 : $(myControls).find('#PORC_DSCTO').val()));
                                    const afectacion_igv = $(myControls).find('#AFECTACION_IGV').val();
                                    const c_sujeto_detraccion = $(myControls).find('#C_SUJETO_DETRACCION').val();

                                    const stockIlimitado = $(myControls).find('#STOCK_ILIMITADO').val();
                                    const promocion = $(myControls).find('#PROMOCION').val();

                                    var porc_igv = parseFloat($('#PORC_IGV').val());
                                    porc_igv = porc_igv / 100;
                                    var porc_recargo_consumo = $('#PORC_RC').val();
                                    porc_recargo_consumo = parseFloat(porc_recargo_consumo == '' ? 0 : porc_recargo_consumo / 100);

                                    var valorUnitario = 0;
                                    var codigoAfectacionIgv = $(myControls).find('#AFECTACION_IGV')[0].args.data.filter(x => x['CODIGO'] == $(myControls).find('#AFECTACION_IGV').val())[0]['CODIGO_PARAMETRO_2']
                                    var codigoAfectacionIgvCab = $(myControls).find('#AFECTACION_IGV')[0].args.data.filter(x => x['CODIGO'] == $(myControls).find('#AFECTACION_IGV').val())[0]['CODIGO_PARAMETRO_3']
                                    if (incluyeIgv && codigoAfectacionIgv == '01') valorUnitario = precio / ((1 + porc_igv) + (porc_recargo_consumo));
                                    else valorUnitario = precio;

                                    valorUnitario = parseFloat(numeral(valorUnitario).format('0.0000000000'))

                                    const dsctoUnitario = valorUnitario * (porcDescuento / 100);
                                    const valorVentaUnitario = valorUnitario - dsctoUnitario;
                                    var igvUnitario = 0;
                                    if (codigoAfectacionIgv == '01') igvUnitario = valorVentaUnitario * porc_igv;
                                    else igvUnitario = 0;

                                    igvUnitario = parseFloat(numeral(igvUnitario).format('0.0000000000'))

                                    var recargo_consumo = (valorUnitario * (porc_recargo_consumo) * cantidad)
                                    recargo_consumo = parseFloat(numeral(recargo_consumo).format('0.0000000000'))

                                    var dsctoUnitarioIgv = 0;
                                    if (codigoAfectacionIgv == '01') dsctoUnitarioIgv = dsctoUnitario * porc_igv;
                                    else dsctoUnitarioIgv = 0;

                                    let precioBase = valorVentaUnitario * cantidad;
                                    precioBase = parseFloat(numeral(precioBase).format('0.00000'))
                                    let igv = igvUnitario * cantidad;
                                    igv = parseFloat(numeral(igv).format('0.00000'))
                                    let precioTotal = igv + precioBase + parseFloat(numeral(recargo_consumo).format('0.00000'));
                                    precioTotal = parseFloat(numeral(precioTotal).format('0.00000'))
                                    let dsctoParcial = (dsctoUnitario + dsctoUnitarioIgv) * cantidad;
                                    dsctoParcial = parseFloat(numeral(dsctoParcial).format('0.00000'))

                                    if (indice != undefined) {
                                        $(tblProductos).jqxGrid('getrows')[indice]['IND_SERVICIO'] = (c_tipo_producto == '07229' ? '*' : '&');

                                        $(tblProductos).jqxGrid('getrows')[indice]['C_PRODUCTO'] = c_producto;
                                        $(tblProductos).jqxGrid('getrows')[indice]['NOMBRE_PARA_VENTA'] = nomProductoCompleto + (descripcion == '' ? '' : ($.solver.session.SESSION_EMPRESA == 'eac1260e-1' ? '' : ' - ') + descripcion);
                                        $(tblProductos).jqxGrid('getrows')[indice]['NOMBRE_ORIGINAL'] = nomProducto;
                                        $(tblProductos).jqxGrid('getrows')[indice]['DESCRIPCION'] = descripcion;
                                        $(tblProductos).jqxGrid('getrows')[indice]['CANTIDAD'] = cantidad;
                                        $(tblProductos).jqxGrid('getrows')[indice]['PRECIO'] = precio;
                                        $(tblProductos).jqxGrid('getrows')[indice]['BASE_IMPONIBLE'] = baseImponible;
                                        $(tblProductos).jqxGrid('getrows')[indice]['INCLUYE_IGV'] = incluyeIgv;
                                        $(tblProductos).jqxGrid('getrows')[indice]['VALOR_UNITARIO'] = valorUnitario;
                                        $(tblProductos).jqxGrid('getrows')[indice]['PORC_DSCTO'] = porcDescuento;
                                        $(tblProductos).jqxGrid('getrows')[indice]['DSCTO_UNITARIO'] = dsctoUnitario;
                                        $(tblProductos).jqxGrid('getrows')[indice]['VALOR_VENTA_UNITARIO'] = valorVentaUnitario;
                                        $(tblProductos).jqxGrid('getrows')[indice]['AFECTACION_IGV'] = afectacion_igv;
                                        $(tblProductos).jqxGrid('getrows')[indice]['CODIGO_AFECTACION_IGV'] = codigoAfectacionIgv;
                                        $(tblProductos).jqxGrid('getrows')[indice]['CODIGO_AFECTACION_IGV_CABECERA'] = codigoAfectacionIgvCab;
                                        $(tblProductos).jqxGrid('getrows')[indice]['IGV_UNITARIO'] = igvUnitario;
                                        $(tblProductos).jqxGrid('getrows')[indice]['PRECIO_BASE'] = precioBase;
                                        $(tblProductos).jqxGrid('getrows')[indice]['IGV'] = igv;
                                        $(tblProductos).jqxGrid('getrows')[indice]['PRECIO_TOTAL'] = precioTotal;
                                        $(tblProductos).jqxGrid('getrows')[indice]['DSCTO_PARCIAL'] = dsctoParcial;
                                        $(tblProductos).jqxGrid('getrows')[indice]['DSCTO_UNITARIO_IGV'] = dsctoUnitarioIgv;
                                        $(tblProductos).jqxGrid('getrows')[indice]['C_PRODUCTO_PRECIO'] = c_producto_precio;
                                        $(tblProductos).jqxGrid('getrows')[indice]['C_PARAMETRO_GENERAL_TIPO_PRODUCTO'] = c_tipo_producto;
                                        $(tblProductos).jqxGrid('getrows')[indice]['C_UNIDAD_MEDIDA'] = c_unidad_medida;
                                        $(tblProductos).jqxGrid('getrows')[indice]['UNIDAD_MEDIDA'] = unidad_medida;
                                        $(tblProductos).jqxGrid('getrows')[indice]['C_ALMACEN'] = c_almacen;
                                        $(tblProductos).jqxGrid('getrows')[indice]['NOMBRE_ALMACEN'] = nomAlmacen;
                                        $(tblProductos).jqxGrid('getrows')[indice]['STOCK'] = stock;
                                        $(tblProductos).jqxGrid('getrows')[indice]['STOCK_ILIMITADO'] = stockIlimitado;
                                        $(tblProductos).jqxGrid('getrows')[indice]['PROMOCION'] = promocion;
                                        $(tblProductos).jqxGrid('getrows')[indice]['MODIFICA_PRECIO'] = modifica_precio;
                                        $(tblProductos).jqxGrid('getrows')[indice]['C_SUJETO_DETRACCION'] = c_sujeto_detraccion;
                                        $(tblProductos).jqxGrid('getrows')[indice]['RECARGO_CONSUMO'] = recargo_consumo;
                                        $(tblProductos).jqxGrid('getrows')[indice]['PORC_IGV'] = porc_igv;
                                        $(tblProductos).jqxGrid('getrows')[indice]['PORC_RC'] = porc_recargo_consumo;

                                        $(tblProductos).jqxGrid('refresh');
                                    }
                                    else {
                                        $(tblProductos).jqxGrid('addrow', null, {
                                            _rowNum: $(tblProductos).jqxGrid('getrows').length + 1,
                                            C_EMPRESA: empresa,
                                            C_VENTA: '',
                                            C_DETALLE: '',
                                            IND_SERVICIO: (c_tipo_producto == '07229' ? '*' : '&'),

                                            C_PRODUCTO: c_producto,
                                            NOMBRE_PARA_VENTA: nomProductoCompleto + (descripcion == '' ? '' : ($.solver.session.SESSION_EMPRESA == 'eac1260e-1' ? ' ' : ' - ') + descripcion),
                                            NOMBRE_ORIGINAL: nomProducto,
                                            DESCRIPCION: descripcion,
                                            CANTIDAD: cantidad,
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
                                            C_PRODUCTO_PRECIO: c_producto_precio,
                                            C_PARAMETRO_GENERAL_TIPO_PRODUCTO: c_tipo_producto,
                                            C_UNIDAD_MEDIDA: c_unidad_medida,
                                            UNIDAD_MEDIDA: unidad_medida,
                                            C_ALMACEN: c_almacen,
                                            NOMBRE_ALMACEN: nomAlmacen,
                                            STOCK: stock,
                                            STOCK_ILIMITADO: stockIlimitado,
                                            PROMOCION: promocion,
                                            MODIFICA_PRECIO: modifica_precio,
                                            C_SUJETO_DETRACCION: c_sujeto_detraccion,
                                            RECARGO_CONSUMO: recargo_consumo,
                                            PORC_IGV: porc_igv,
                                            PORC_RC: porc_recargo_consumo
                                        });
                                    }

                                    var arrDetraccion = $(tblProductos).jqxGrid('getrows').filter(x => x['C_SUJETO_DETRACCION'] != '').map((e) => {
                                        return $('#TIPO_DETRACCION')[0].args.data.filter(x => x['CODIGO'] == e.C_SUJETO_DETRACCION)[0]
                                    }).sort(function (a, b) {
                                        return b.CALCULO - a.CALCULO
                                    });

                                    if ($('#TIPO_OPERACION').val() == '07400') {
                                        if (arrDetraccion.length != 0) $('#TIPO_DETRACCION').val(arrDetraccion[0].CODIGO).trigger('change');
                                    }
                                    fnCalcularTotales();
                                    bootbox.hideAll();
                                }
                            }
                        }
                    });
                },
                onCloseModal: function () {
                    estadoProducto = false;
                    $('#btnBusquedaProducto').attr('disabled', false)
                }
            });
        };
        const fnCambiaTipoDocCliente = function () {
            $('#serie').attr('data-C_ESTABLECIMIENTO', $('#C_ESTABLECIMIENTO').val());
            $('#serie').attr('data-C_TIPO_DOC', $('#C_PARAMETRO_GENERAL_TIPO_DOCUMENTO').val() == null ? '' : $('#C_PARAMETRO_GENERAL_TIPO_DOCUMENTO').val());
            $('#serie').FieldLoadRemote({
                onReady: function () {
                    if (notaCredito == '*') {
                        $('#C_PARAMETRO_GENERAL_TIPO_DOCUMENTO').html('<option value="07241">Nota de crédito</option>');
                        $('.bloque_orden_compra').hide();
                        $('.bloque-tipodetraccion').hide();
                        const tipo_doc = $('#TIPO_DOC_CLIENTE').val();
                        if (tipo_doc == '00013') { //DNI
                            $('#tipo_doc').text('Dni:');
                        }
                        else if (tipo_doc == '00017') { // RUC
                            $('#tipo_doc').text('Ruc:');
                        }
                    }
                    else if (notaDebito == '*') {
                        $('#C_PARAMETRO_GENERAL_TIPO_DOCUMENTO').html('<option value="07242">Nota de débito</option>');
                        $('.bloque_orden_compra').hide();
                        $('.bloque-tipodetraccion').hide();
                        const tipo_doc = $('#TIPO_DOC_CLIENTE').val();
                        if (tipo_doc == '00013') { //DNI
                            $('#tipo_doc').text('Dni:');
                        }
                        else if (tipo_doc == '00017') { // RUC
                            $('#tipo_doc').text('Ruc:');
                        }
                    }
                    if ((dataVenta['IND_ESTADO_VENTA'] == '*' || dataVenta['IND_ESTADO_VENTA'] == 'B' || dataVenta['IND_ESTADO_VENTA'] == 'O') && $('#TIPO_NOTA_CREDITO').val() == '') {
                        $('#C_PARAMETRO_GENERAL_TIPO_DOCUMENTO').attr('disabled', 'disabled');
                        $('#serie').attr('disabled', 'disabled')
                    }
                    //if (dataVenta['IND_COTIZACION'] != null) {
                    //    $('#btnCliente').hide();
                    //}
                }
            });

        };
        const fnRecalcularMontos = function (callback) {

            //if (notaCredito == '*') {

            $.each($(tblProductos).jqxGrid('getrows'), function (i, v) {

                const cantidad = v.CANTIDAD;
                let precio = v.PRECIO;

                const baseImponible = precio * cantidad;
                const incluyeIgv = (v.INCLUYE_IGV === 'true' || v.INCLUYE_IGV === true ? true : false);
                const porcDescuento = v.PORC_DSCTO;

                var porc_igv = parseFloat($('#PORC_IGV').val());
                porc_igv = porc_igv / 100;
                var porc_recargo_consumo = $('#PORC_RC').val();
                porc_recargo_consumo = parseFloat(porc_recargo_consumo == '' ? 0 : porc_recargo_consumo / 100);

                //if ($.solver.basePath == '/restaurant') porc_recargo_consumo = 0;
                var valorUnitario = 0;
                var codigoAfectacionIgv = v.CODIGO_AFECTACION_IGV

                if (incluyeIgv && codigoAfectacionIgv == '01') valorUnitario = precio / ((1 + porc_igv) + (porc_recargo_consumo));
                else valorUnitario = precio;

                const dsctoUnitario = valorUnitario * (porcDescuento / 100);
                const valorVentaUnitario = valorUnitario - dsctoUnitario;
                var igvUnitario = 0;
                if (codigoAfectacionIgv == '01') igvUnitario = valorVentaUnitario * porc_igv;
                else igvUnitario = 0;

                var recargo_consumo = (valorUnitario * (porc_recargo_consumo) * cantidad)

                var dsctoUnitarioIgv = 0;
                if (codigoAfectacionIgv == '01') dsctoUnitarioIgv = dsctoUnitario * porc_igv;
                else dsctoUnitarioIgv = 0;

                const precioBase = valorVentaUnitario * cantidad;
                const igv = igvUnitario * cantidad;
                const precioTotal = igv + precioBase + recargo_consumo;
                const dsctoParcial = (dsctoUnitario + dsctoUnitarioIgv) * cantidad;

                $(tblProductos).jqxGrid('getrows')[i]['CANTIDAD'] = cantidad;
                $(tblProductos).jqxGrid('getrows')[i]['PRECIO'] = precio;
                $(tblProductos).jqxGrid('getrows')[i]['BASE_IMPONIBLE'] = baseImponible;
                $(tblProductos).jqxGrid('getrows')[i]['VALOR_UNITARIO'] = valorUnitario;
                $(tblProductos).jqxGrid('getrows')[i]['PORC_DSCTO'] = porcDescuento;
                $(tblProductos).jqxGrid('getrows')[i]['DSCTO_UNITARIO'] = dsctoUnitario;
                $(tblProductos).jqxGrid('getrows')[i]['VALOR_VENTA_UNITARIO'] = valorVentaUnitario;
                $(tblProductos).jqxGrid('getrows')[i]['IGV_UNITARIO'] = igvUnitario;
                $(tblProductos).jqxGrid('getrows')[i]['PRECIO_BASE'] = precioBase;
                $(tblProductos).jqxGrid('getrows')[i]['IGV'] = igv;
                $(tblProductos).jqxGrid('getrows')[i]['PRECIO_TOTAL'] = precioTotal;
                $(tblProductos).jqxGrid('getrows')[i]['DSCTO_PARCIAL'] = dsctoParcial;
                $(tblProductos).jqxGrid('getrows')[i]['DSCTO_UNITARIO_IGV'] = dsctoUnitarioIgv;
                $(tblProductos).jqxGrid('getrows')[i]['RECARGO_CONSUMO'] = recargo_consumo;
                $(tblProductos).jqxGrid('getrows')[i]['PORC_IGV'] = porc_igv;
                $(tblProductos).jqxGrid('getrows')[i]['PORC_RC'] = porc_recargo_consumo;

                $(tblProductos).jqxGrid('refresh');

            })

            //}

            if (typeof callback == 'function') callback();

        }

        // Obtener datos de empresa, cabecera, detalle, despacho, tipo cambio
        const fnObtenerDatosEmpresa = function (callback) {
            $.GetQuery({
                query: ['q_ventas_procesos_nuevaventa_consultarempresa_establecimiento'],
                items: [{
                    C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                    C_ESTABLECIMIENTO: function () {
                        return $('#C_ESTABLECIMIENTO').val();
                    }
                }],
                onError: function (error) {
                    $.ShowError({ error: error });
                },
                onReady: function (result) {
                    
                    const data = result[0]

                    $('#RAZON_SOCIAL').text(data['RAZON_SOCIAL']);
                    $('#DIRECCION_EMPRESA').text(data['DIRECCION']);
                    $('.RUC_EMPRESA').text('RUC N° ' + data['NRO_DOCUMENTO']);
                    $('#CUENTA_BANCARIA').val(data['CUENTA_BANCARIA']);
                    if ($('#CUENTA_BANCARIA').val() == '') {
                        $('#CUENTA_BANCARIA').val(data['CUENTA_BANCARIA']);
                    };
                    porcIgv = parseFloat(data['PORC_IGV']);
                    if (Object.keys(dataVenta).length == 0) {
                        $('#porcIgv').html(numeral(porcIgv).format('0%'));
                        $('#PORC_IGV').val(parseInt(porcIgv * 100));
                        $('#PORC_RC').val(parseInt(data['PORC_RECARGO_CONSUMO'] * 100));
                    }

                    if (typeof callback == 'function') {
                        callback();
                    };

                }
            });
            $.solver.fn.getImageLogoCompany('#IMAGEN_COMPANY');
        };
        const fnObtenerDatosCabecera = function () {
            const c_venta = $('#C_VENTA').val();
            if (c_venta != '') {
                $('#C_PARAMETRO_GENERAL_MONEDA').css('display', 'none');
                $.GetQuery({
                    query: ['q_ventas_procesos_nuevaventa_consultarventa'],
                    items: [{
                        C_VENTA: function () { return $('#C_VENTA').val() },
                        C_EMPRESA: empresa
                    }],
                    onBefore: function () {
                        $.DisplayStatusBar({ message: 'Obteniendo información.' });
                    },
                    onError: function (error) {
                        $.CloseStatusBar();
                        $.ShowError({ error: error });
                    },
                    onReady: function (result) {
                        
                        $.CloseStatusBar();

                        const data = result[0];

                        const id_comprobante = data['ID_COMPROBANTE'];

                        if (data['COD_MODULO'] != null && data['COD_MODULO'] != '') {
                            $('#COD_MODULO').val(data['COD_MODULO']);
                        };
                        $('#NOMBRE').val(data['RAZON_SOCIAL']);
                        $('#RUC').val(data['RUC_CLIENTE']).attr('disabled', 'disabled');
                        $('#DIRECCION').val(data['DIRECCION_FISCAL']);
                        $('#CORREO_ELECTRONICO').val(data['CORREO_ELECTRONICO']);
                        if (notaCredito == '*' || notaDebito == '*') {
                            var fec_em = data['FECHA_EMISION'].split('/');
                            $('#FECHAEMISION').datetimepicker('minDate', moment(new Date(fec_em[2], parseFloat(fec_em[1]) - 1, fec_em[0])).subtract(6, 'days'));
                        }
                        else if (!(data['TIPO_NOTA_CREDITO'] == '' || data['TIPO_NOTA_CREDITO'] == null)) {
                            $('#FECHAEMISION').val(data['FECHA_EMISION']);

                            if (data['FECHA_EMISION_ORIGINAL'] != '' && data['FECHA_EMISION_ORIGINAL'] != null) {
                                var fec_em = data['FECHA_EMISION_ORIGINAL'].split('/');
                                $('#FECHAEMISION').datetimepicker('minDate', moment(new Date(fec_em[2], parseFloat(fec_em[1]) - 1, fec_em[0])).subtract(6, 'days'));
                            }
                        }
                        else {
                            $('#FECHAEMISION').val(data['FECHA_EMISION']);
                            var fec_em = data['FECHA_EMISION'].split('/');
                            $('#FECHAEMISION').datetimepicker('minDate', moment(new Date(fec_em[2], parseFloat(fec_em[1]) - 1, fec_em[0])).subtract(6, 'days'));
                        };

                        $('#ORDEN_COMPRA').val(data['ORDEN_COMPRA']);
                        $('#C_PARAMETRO_GENERAL_MONEDA').val(data['C_PARAMETRO_GENERAL_MONEDA']);
                        $('#MONEDA').text(data['MONEDA_DESCRIPCION']);
                        $('#MONEDA').show();
                        $('#OBSERVACION_VENTA').text(data['OBS_VENTA']);
                        $('#OBSERVACION_COTIZACION').text(data['OBS_COTIZACION']);
                        $('#IND_COTIZACION').val(data['IND_COTIZACION']);
                        $('#IND_NOTA_PEDIDO').val(data['IND_NOTA_PEDIDO']);
                        $('#REF_C_VENTA').val(data['REF_C_VENTA']);
                        $('#CUENTA_BANCARIA').val(data['CUENTA_BANCARIA']);
                        $('#REF_EXPORTACION').val(data['REF_EXPORTACION'])

                        if (data['REF_EXPORTACION'] != '') {
                            fnObtenerDatosExportacion();
                        }

                        var _comprobante = data['NRO_COMPROBANTE'];
                        $('#NRO_COMPROBANTE').text(_comprobante == '' || _comprobante == null || notaCredito == '*' || notaDebito == '*' ? 'XXXX' : (_comprobante));

                        $('#NRO_SERIE_COMPROBANTE').val(data['SERIE']);
                        if (data['SERIE'] != null) {
                            $('#serie').val(data['SERIE']).trigger('change');
                        }
                        if (data['IND_ESTADO_VENTA'] == 'A') {
                            $('#serie').attr('disabled', true);
                            //$('#serie').attr('readonly', 'readonly');
                            //$('#serie').css('pointer-events', 'none');
                        }
                        $('#TC').val(data['TC']);
                        $('#C_CLIENTE').val(data['C_CLIENTE']);
                        $('#SIMBOLO_MONEDA').val(data['SIMBOLO_MONEDA']);
                        $('#IND_ESTADO_VENTA').val(data['IND_ESTADO_VENTA']);
                        $('#IND_ESTADO_COTIZACION').val(data['IND_ESTADO_COTIZACION']);
                        $('#C_ARCHIVO_PDF_COTIZACION').val(data['C_ARCHIVO_PDF_COTIZACION']);
                        $('#ID_EMISOR').val(data['ID_EMISOR']);
                        if (data['TIPO_OPERACION'] != null) {
                            $('#TIPO_OPERACION').val(data['TIPO_OPERACION']);
                            setTimeout(function () {
                                $('#TIPO_OPERACION').trigger('change')
                            }, 250)
                        }
                        if (data['TIPO_DOC_REF'] != null && data['TIPO_DOC_REF'] != '') {
                            $('#TIPO_DOC_REF').val(data['TIPO_DOC_REF']).attr('disabled', 'disabled');
                        }
                        if (data['NRO_DOC_REF'] != null && data['NRO_DOC_REF'] != '') {
                            $('#NRO_DOC_REF').val(data['NRO_DOC_REF']).attr('disabled', 'disabled');
                        }

                        if (data['FECHA_VENCIMIENTO'] != null) $('#FECHA_VENCIMIENTO').val(data['FECHA_VENCIMIENTO']);
                        dataVenta = data;
                        if (data['IND_ESTADO_VENTA'] == 'O' || data['IND_ESTADO_VENTA'] == '*' || data['IND_ESTADO_VENTA'] == 'B') {
                            var fec = data['FECHA_EMISION'].split('/');
                            $('#FECHA_VENCIMIENTO').datetimepicker('minDate', moment(new Date(fec[2], parseFloat(fec[1]) - 1, fec[0])).subtract(6, 'days'));
                        }
                        if (!(data['TIPO_NOTA_CREDITO'] == null || data['TIPO_NOTA_CREDITO'] == '')) {
                            $('.fecha_venc').hide();
                            //$('#btnBusquedaProducto').hide();
                            $('#btnCliente').hide();
                        }
                        if (!(data['TIPO_NOTA_DEBITO'] == null || data['TIPO_NOTA_DEBITO'] == '')) {
                            //$('.fecha_venc').hide();
                            //$('#btnBusquedaProducto').hide();
                            $('#btnCliente').hide();
                        }

                        if (notaCredito == '*' || notaDebito == '*' || $('#TIPO_NOTA_CREDITO').val() != '' || $('#TIPO_NOTA_DEBITO').val() != '') {
                            $('#GUARDAR_GUIA').val('&')
                            $('#guiaremision').hide();
                            $('.bloque-nota-credito-debito').show();

                            // Cargamos doc de ref
                            $('#TIPO_DOC_REF').val(data['C_PARAMETRO_GENERAL_TIPO_DOCUMENTO']).attr('disabled', 'disabled')
                            $('#NRO_DOC_REF').val(data['SERIE'] + '-' + data['NRO_COMPROBANTE']).attr('disabled', 'disabled')
                        }
                        else {
                            $('#GUARDAR_GUIA').val('*')
                            $('#GUIA_REMISION').val(data['GUIA_REMISION']);
                            $('#guiaremision').show();
                        }
                        fnValidarGuiadeRemision();

                        if ((data['IND_ESTADO_COTIZACION'] == 'A' && data['IND_ESTADO_VENTA'] == null) | (data['IND_ESTADO_NOTA_PEDIDO'] == 'A' && data['IND_ESTADO_VENTA'] == null)) {
                            //$('#btnCliente').hide()
                        }
                        else if (data['IND_ESTADO_VENTA'] == 'B' && data['IND_NOTA_PEDIDO'] == '*') {
                        }
                        else if (data['IND_ESTADO_VENTA'] == '*' || data['IND_ESTADO_VENTA'] == 'O' || data['IND_ESTADO_VENTA'] == 'B') {
                            $('#C_PARAMETRO_GENERAL_TIPO_DOCUMENTO').attr('disabled', 'disabled');
                        }
                        else {
                            $('#btnCliente').hide();
                            //$('#btnBusquedaProducto').hide();
                            $('#FECHA_VENCIMIENTO').attr('disabled', 'disabled');
                            if (notaDebito == '*') {
                                $('#FECHA_VENCIMIENTO').attr('disabled', false);
                            }
                            $('#TIPO_OPERACION').attr('disabled', 'disabled');
                            $('#OBSERVACION_VENTA').attr('disabled', 'disabled');
                            $('#OBSERVACION_COTIZACION').attr('disabled', 'disabled');
                            $('#ORDEN_COMPRA').attr('disabled', 'disabled');
                            $('#CUENTA_BANCARIA').attr('disabled', 'disabled');
                            $('#C_PARAMETRO_GENERAL_TIPO_DOCUMENTO').attr('disabled', 'disabled');
                            $('#FORMA_PAGO').attr('disabled', 'disabled');
                            $('#GUIA_REMISION').attr('disabled', 'disabled');
                            $('#TIPO_DETRACCION').attr('disabled', 'disabled');
                            $('#btnBuscarExportacion').hide();
                            if (notaCredito == '' && notaDebito == '' && notaPedido != '*') {
                                $('#btnGuardar').hide();
                                $('#btnVistaPrevia').hide();
                            }
                        }

                        if (notaCredito == '*' || notaDebito == '*') {
                            $('#FECHAEMISION').show();
                            if (notaCredito == '*') {
                                $('.fecha_venc').hide();
                            }
                            $('#OBSERVACION_VENTA').attr('disabled', false);
                            $('#OBSERVACION_COTIZACION').attr('disabled', false);
                        }

                        $('#TIPO_DOC_CLIENTE').val(data['TIPO_DOC_CLIENTE']);

                        fnCambiaTipoDocCliente();
                        if (notaCredito == '*') {
                            $('#bloque_nota_credito').show();
                            $('#btnBusquedaProducto').show();
                            $('#bloque-nota-credito-debito').show();
                        }
                        else if (notaDebito == '*') {
                            $('#bloque_nota_dedito').show();
                            $('#btnBusquedaProducto').show();
                            $('#bloque-nota-credito-debito').show();
                        }
                        else {
                            if (data['TIPO_NOTA_CREDITO'] == null || data['TIPO_NOTA_CREDITO'] == '') {
                                $('#bloque_nota_credito').hide();
                            }
                            else {
                                $('.bloque-nota-credito-debito').show();
                                $('#bloque_nota_credito').show();
                                $('#TIPO_NOTA_CREDITO').val(data['TIPO_NOTA_CREDITO']);
                                $('#MOTIVO_NOTA_CREDITO').val(data['MOTIVO_NOTA_CREDITO']);
                                $('#C_PARAMETRO_GENERAL_TIPO_DOCUMENTO').html('<option value="07241">Nota de crédito</option>');
                                $('#guiaremision').hide();
                                $('.bloque_orden_compra').hide();
                                $('#C_PARAMETRO_GENERAL_TIPO_DOCUMENTO').attr('disabled', 'disabled');
                                $('#TIPO_OPERACION').attr('disabled', 'disabled');
                                if (dataVenta['IND_ESTADO_VENTA'] != 'A') {
                                    $('#btnGuardar').show();
                                }
                            }

                            if (data['TIPO_NOTA_DEBITO'] == null || data['TIPO_NOTA_DEBITO'] == '') {
                                $('#bloque_nota_debito').hide();
                            }
                            else {
                                $('.bloque-nota-credito-debito').show();
                                $('#bloque_nota_debito').show();
                                $('#TIPO_NOTA_DEBITO').val(data['TIPO_NOTA_DEBITO']);
                                $('#MOTIVO_NOTA_DEBITO').val(data['MOTIVO_NOTA_DEBITO']);
                                $('#C_PARAMETRO_GENERAL_TIPO_DOCUMENTO').html('<option value="07242">Nota de débito</option>');
                                $('#guiaremision').hide();
                                $('.bloque_orden_compra').hide();
                                $('#TIPO_OPERACION').attr('disabled', 'disabled');
                                $('#C_PARAMETRO_GENERAL_TIPO_DOCUMENTO').attr('disabled', 'disabled');
                                if (dataVenta['IND_ESTADO_VENTA'] != 'A') {
                                    $('#btnGuardar').show();
                                }
                            }
                        }

                        if (!(notaCredito == '*' || vistaPrevia == '*' || notaDebito == '*' || $('#TIPO_NOTA_CREDITO').val() != '')) {
                            if ($('#IND_COTIZACION').val() == '*') {
                                $('#FECHAEMISION').val($('#FECHA_ACTUAL').val());
                            }

                            if (dataVenta['IND_ESTADO_VENTA'] == 'A' || dataVenta['IND_ESTADO_VENTA'] == '&' || dataVenta['IND_ESTADO_VENTA'] == 'C') {
                                $('#FECHAEMISION').attr('disabled', 'disabled');
                            }
                            //$('#btnCliente').hide();
                        }

                        if ($('#TIPO_NOTA_CREDITO').val() != '' && dataVenta['IND_ESTADO_VENTA'] == 'A') {
                            $('#FECHAEMISION').attr('disabled', 'disabled');
                            $('#MOTIVO_NOTA_CREDITO').attr('disabled', 'disabled');
                            $('#TIPO_NOTA_CREDITO').attr('disabled', 'disabled');
                            $('#btnCliente').hide();
                        }

                        if ($('#TIPO_NOTA_DEBITO').val() != '' && dataVenta['IND_ESTADO_VENTA'] == 'A') {
                            $('#FECHAEMISION').attr('disabled', 'disabled');
                            $('#MOTIVO_NOTA_DEBITO').attr('disabled', 'disabled');
                            $('#TIPO_NOTA_DEBITO').attr('disabled', 'disabled');
                            $('#btnCliente').hide();
                        }

                        if (data['FORMA_PAGO'] != '' && data['FORMA_PAGO'] != null) {
                            $('#FORMA_PAGO').val(data['FORMA_PAGO']).trigger('change');
                        }

                        if ($('#IND_ESTADO_VENTA').val() != '' && notaCredito != '*' && notaDebito != '*') {
                            $('#C_ESTABLECIMIENTO').val(data['C_ESTABLECIMIENTO']);

                            fnObtenerDatosEmpresa(function () {
                                porcIgv = parseFloat(data['PORC_IGV']);
                                $('#porcIgv').html(numeral(porcIgv).format('0%'));
                            });

                            if (data['IND_ESTADO_VENTA'] != 'B' && data['IND_NOTA_PEDIDO'] != '*') {
                                $('#C_ESTABLECIMIENTO').attr('disabled', 'disabled')
                            }
                            $('#C_PARAMETRO_GENERAL_TIPO_DOCUMENTO').attr('data-C_ESTABLECIMIENTO', data['C_ESTABLECIMIENTO']);
                            $('#C_PARAMETRO_GENERAL_TIPO_DOCUMENTO').attr('data-query', 'gbl_obtener_tipo_documento_ventas_nuevaventa_docs');
                            $('#C_PARAMETRO_GENERAL_TIPO_DOCUMENTO').FieldLoadRemote({
                                onReady: function () {
                                    $('#C_PARAMETRO_GENERAL_TIPO_DOCUMENTO').val(data['C_PARAMETRO_GENERAL_TIPO_DOCUMENTO'])
                                    $('#serie')
                                        .attr('data-query', 'cb_ventas_procesos_nuevaventa_obtenerseries_porempresa')
                                        .attr('data-C_ESTABLECIMIENTO', data['C_ESTABLECIMIENTO'])
                                        .attr('data-C_TIPO_DOC', $('#C_PARAMETRO_GENERAL_TIPO_DOCUMENTO').val())
                                        .FieldLoadRemote({
                                            onReady: function () {
                                                if (data['IND_ESTADO_VENTA'] != 'B' && data['IND_NOTA_PEDIDO'] != '*') {
                                                    $('#serie').val(data['SERIE']);
                                                    $('#serie').attr('disabled', 'disabled');
                                                    $('#C_PARAMETRO_GENERAL_TIPO_DOCUMENTO').attr('disabled', 'disabled')
                                                }
                                            }
                                        });
                                }
                            });
                        }

                        if (notaCredito == '*' || notaDebito == '*' || $('#TIPO_NOTA_DEBITO').val() != '' || $('#TIPO_NOTA_CREDITO').val() != '') {
                            $('#C_ESTABLECIMIENTO').val(data['C_ESTABLECIMIENTO']);
                            $('#C_ESTABLECIMIENTO').attr('disabled', 'disabled');
                            $('#C_PARAMETRO_GENERAL_TIPO_DOCUMENTO').attr('data-C_ESTABLECIMIENTO', data['C_ESTABLECIMIENTO']);
                            $('#C_PARAMETRO_GENERAL_TIPO_DOCUMENTO').attr('data-query', 'gbl_obtener_tipo_documento_ventas_nuevaventa_docs');
                            $('#C_PARAMETRO_GENERAL_TIPO_DOCUMENTO').FieldLoadRemote({
                                onReady: function () {
                                    $('#C_PARAMETRO_GENERAL_TIPO_DOCUMENTO').val(data['C_PARAMETRO_GENERAL_TIPO_DOCUMENTO'])
                                    $('#serie')
                                        .attr('data-query', 'cb_ventas_procesos_nuevaventa_obtenerseries_porempresa')
                                        .attr('data-C_ESTABLECIMIENTO', data['C_ESTABLECIMIENTO'])
                                        .attr('data-C_TIPO_DOC', $('#C_PARAMETRO_GENERAL_TIPO_DOCUMENTO').val())
                                        .FieldLoadRemote({
                                            onReady: function () {
                                                $('#serie').val(data['SERIE']);
                                                $('#serie').attr('disabled', 'disabled');
                                                $('#C_PARAMETRO_GENERAL_TIPO_DOCUMENTO').attr('disabled', 'disabled')

                                                if (notaCredito == '*' || $('#TIPO_NOTA_CREDITO').val() != '') {
                                                    $('#C_PARAMETRO_GENERAL_TIPO_DOCUMENTO').html('<option value="07241">Nota de crédito</option>');
                                                    $('.bloque_orden_compra').hide();
                                                }
                                                else if (notaDebito == '*' || $('#TIPO_NOTA_DEBITO').val() != '') {
                                                    $('#C_PARAMETRO_GENERAL_TIPO_DOCUMENTO').html('<option value="07242">Nota de débito</option>');
                                                    $('.bloque_orden_compra').hide();
                                                }
                                            }
                                        });
                                }
                            });
                        }

                        fnValidarExportacion();

                        if (($('#IND_ESTADO_VENTA').val() == 'C' || ($('#IND_ESTADO_VENTA').val() == 'A') && $('#TIPO_NOTA_CREDITO').val() != '') || ($('#IND_ESTADO_VENTA').val() == 'A' && $('#TIPO_NOTA_DEBITO').val() != '')) {
                            $('#btnGuardar').hide();
                            $('#btnVistaPrevia').hide();

                            $('#TIPO_NOTA_DEBITO').attr('disabled', 'disabled');
                            $('#MOTIVO_NOTA_DEBITO').attr('disabled', 'disabled');
                            $('#TIPO_NOTA_CREDITO').attr('disabled', 'disabled');
                            $('#MOTIVO_NOTA_CREDITO').attr('disabled', 'disabled');
                            $('#FORMA_PAGO').attr('disabled', 'disabled');

                            $('#btnBuscarExportacion').hide();
                        }

                        if ($('#FORMA_PAGO').val() == '09913' && $('#C_PARAMETRO_GENERAL_TIPO_DOCUMENTO').val() == '07236') {
                            $('.zone-cuotas').show();
                            fnCrearTablaCuotas();
                            $('#FECHA_VENCIMIENTO').removeAttr('disabled');
                        }
                        else {
                            if (vistaPrevia == '*') {
                                $('#FECHA_VENCIMIENTO').attr('disabled', 'disabled');
                            }
                        }

                        setTimeout(function () {
                            if ($('#TIPO_OPERACION').val() == '07400' && ($('#C_PARAMETRO_GENERAL_TIPO_DOCUMENTO').val() == '07236' || $('#C_PARAMETRO_GENERAL_TIPO_DOCUMENTO').val() == '07237')) {
                                $('.bloque-tipodetraccion').show();
                                if (data['TIPO_DETRACCION'] != null) {
                                    $('#TIPO_DETRACCION').val(data['TIPO_DETRACCION']);
                                    $('#TIPO_DETRACCION').trigger('change')
                                }
                            } else {
                                $('.bloque-tipodetraccion').hide();
                            }
                        }, 250)

                        if (vistaPrevia != '') {

                            var dialogFTE = bootbox.dialog({
                                message: `<div class="embed-responsive embed-responsive-16by9"><iframe class= "embed-responsive-item" src="https://api.solver.com.pe/v1//efacturacion/ProcesarPDF/${$('#ID_EMISOR').val()}/${id_comprobante}" allowfullscreen></iframe></div>`,
                                closeButton: true,
                                className: 'modal-75'
                            });

                        };

                        porcIgv = parseFloat(data['PORC_IGV']);
                        $('#porcIgv').html(numeral(porcIgv).format('0%'));

                        $('#PORC_IGV').val(parseInt(parseFloat(data['PORC_IGV']) * 100));
                        $('#PORC_RC').val(parseInt(parseFloat(data['PORC_RC']) * 100));

                        $.GetQuery({
                            query: ['tbl_ventas_procesos_nuevaventa_obtener_detalle_anticipos'],
                            items: [{
                                C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                                C_VENTA: function () {
                                    return $('#C_VENTA').val()
                                }
                            }],
                            onReady: function (result) {
                                $.each(anticipos, function (i, v) {
                                    if (v.C_DETALLE != '') {
                                        arrAnticiposEliminados.push({
                                            C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                                            C_VENTA: v.C_VENTA,
                                            C_DETALLE: v.C_DETALLE
                                        })
                                    }
                                })
                                anticipos = [];
                                $.each(result, function (i, v) {
                                    anticipos.push({
                                        C_EMPRESA: v.C_EMPRESA,
                                        C_VENTA: v.C_VENTA,
                                        C_DETALLE: v.C_DETALLE,
                                        C_VENTA_REF: v.C_VENTA_REF,
                                        FECHA_EMISION: v.FECHA_EMISION,
                                        NUMERO: v.NRO_COMPROBANTE,
                                        COD_TIPO: v.COD_TIPO,
                                        TIPO: v.TIPO,
                                        MONEDA: v.MONEDA,
                                        BASE: v.BASE,
                                        IGV: v.IGV,
                                        RC: v.RC,
                                        TOTAL: v.TOTAL,
                                        DESCRIPCION: v.DESCRIPCION,
                                        IND_ESTADO: v.IND_ESTADO
                                    })
                                })
                                if (anticipos.length != 0) {
                                    fnValidarMostrarAnticipos();
                                }
                            }

                        })

                        if (notaPedido == '') {
                            $('.facturas').show();
                        }
                        else {
                            $('.notaspedido').show();
                            $('#TIPO_OPERACION')
                                .attr('readonly', 'readonly')
                                .css('pointer-events', 'none');
                            $('#buscarAnticipos').hide();
                            $('#guiaremision').hide();
                            $('#btnCliente').show();
                        }

                        $('#ANIO_NOTA_PEDIDO').val(data['ANIO_NOTA_PEDIDO'])
                        $('#NRO_NOTA_PEDIDO').val(data['NRO_NOTA_PEDIDO'])
                        $('#IND_NOTA_PEDIDO').val(data['IND_NOTA_PEDIDO'])
                        $('#IND_ESTADO_NOTA_PEDIDO').val(data['IND_ESTADO_NOTA_PEDIDO'])

                        $('#NRO_OPERACION_NOTA_PEDIDO').text(data['ANIO_NOTA_PEDIDO'] + '-' + data['NRO_NOTA_PEDIDO'])

                    }
                });
            }
            else {
                $('#bloque_venta').show();
                $('#GUARDAR_GUIA').val('*')
                $('#guiaremision').show();
                if ($('#FORMA_PAGO').val() == '09913') {
                    $('.zone-cuotas').show();
                    fnCrearTablaCuotas();
                    $('#FECHA_VENCIMIENTO').removeAttr('disabled');
                } else {
                    $('#FECHA_VENCIMIENTO').attr('disabled', 'disabled');
                }

                if (notaPedido == '') {
                    $('.facturas').show();
                }
                else {
                    $('.notaspedido').show();
                    $('#TIPO_OPERACION')
                        .attr('readonly', 'readonly')
                        .css('pointer-events', 'none');
                    $('#buscarAnticipos').hide();
                    $('#guiaremision').hide();
                    $('#bloque_venta').hide();
                }
            };
        };
        const fnCrearTabla = function () {
            const fnBorrarProducto = function (indice) {
                alertify.confirm('Mensaje del sistema', '¿Estas seguro de eliminar el producto?',
                    function () {
                        const fila = $(tblProductos).jqxGrid('getrows')[indice]
                        arrEliminadas.push(fila);
                        const rowid = $(tblProductos).jqxGrid('getrowid', indice)
                        $(tblProductos).jqxGrid('deleterow', rowid);
                        fnCalcularTotales();
                    },
                    function () { alertify.error('Operación cancelada'); }
                ).set('labels', { ok: 'Si', cancel: 'No' }).set('defaultFocus', 'ok').set('closable', false);
            };
            const fnEditarProducto = function (indice) {
                buscarProductos(indice);
            }
            $(tblProductos).CreateGrid({
                query: 'q_ventas_procesos_nuevaventa_consultardetalle',
                items: {
                    C_VENTA: function () { return $('#C_VENTA').val(); },
                    C_EMPRESA: empresa
                },
                hiddens: [
                    'C_DETALLE', 'C_VENTA', 'C_EMPRESA', 'C_PRODUCTO_PRECIO', 'IND_SERVICIO', 'MONEDA', 'CODIGO_AFECTACION_IGV',
                    'BASE_IMPONIBLE', 'INCLUYE_IGV', 'VALOR_UNITARIO', 'DSCTO_UNITARIO', 'VALOR_VENTA_UNITARIO', 'AFECTACION_IGV',
                    'IGV_UNITARIO', 'DESCRIPCION', 'NUM', 'DSCTO_UNITARIO_IGV', 'NOMBRE_ORIGINAL', 'C_PARAMETRO_GENERAL_TIPO_PRODUCTO',
                    'C_ALMACEN', 'NOMBRE_ALMACEN', 'STOCK', 'STOCK_ILIMITADO', 'PROMOCION', 'CODIGO_AFECTACION_IGV_CABECERA', 'C_UNIDAD_MEDIDA',
                    'UNIDAD_MEDIDA', 'MODIFICA_PRECIO', 'C_TIPO', 'C_DESPACHO', 'C_SUJETO_DETRACCION', 'PORC_IGV', 'PORC_RC'//, ($.solver.basePath == '/restaurant' ? '' : 'RECARGO_CONSUMO')
                ],
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
                    'PRECIO': {
                        text: 'Precio',
                        width: 100,
                        cellsAlign: 'right',
                        cellsFormat: 'd2',
                        columnType: 'numberinput',
                        cellsFormat: 'd2',
                    },
                    'PORC_DSCTO': {
                        text: 'Porc. dscto',
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
                    'RECARGO_CONSUMO': {
                        text: 'RC',
                        width: 100,
                        cellsAlign: 'right',
                        columnType: 'numberinput',
                        cellsFormat: 'd2'
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
                    'DSCTO_PARCIAL': {
                        text: 'Dscto parcial',
                        width: 100,
                        cellsAlign: 'right',
                        columnType: 'numberinput',
                        cellsFormat: 'd2',
                    },
                    'ACCIONES': {
                        text: 'Acciones',
                        width: 120,
                        createwidget: function (row, column, value, htmlElement) {
                            $(tblProductos).jqxGrid('refresh');
                        },
                        initwidget: function (rowIndex, column, value, htmlElement) {
                            const estado = $('#IND_ESTADO_VENTA').val();
                            var row = $(tblProductos).jqxGrid('getrows')[rowIndex];
                            if (estado == '*' || estado == 'B' || estado == 'O' || estado == '' || notaCredito == '*' || notaDebito == '*') {

                                $(htmlElement).html('');
                                $(htmlElement).addClass('jqx-grid-cell-middle-align');
                                $(htmlElement).addClass('mt-1');
                                if (
                                    true
                                    //notaCredito != '*' && notaDebito != '*' &&
                                    //(dataVenta['TIPO_NOTA_CREDITO'] == null || dataVenta['TIPO_NOTA_CREDITO'] == '') && (dataVenta['TIPO_NOTA_DEBITO'] == null || dataVenta['TIPO_NOTA_DEBITO'] == '')
                                ) {
                                    let _btnEditar;
                                    _btnEditar = $(`<a id="editar" style="cursor: pointer;" class="jqx-grid-widget">&nbsp;Editar</a>`);
                                    $(htmlElement).append(_btnEditar);
                                    $(htmlElement).find('a#editar').unbind('click');
                                    $(htmlElement).find('a#editar').click(function () {
                                        if (!estadoProducto) {
                                            estadoProducto = true;
                                            fnEditarProducto(rowIndex);
                                        }
                                    });
                                }

                                if (row['C_DESPACHO'] == undefined || row['C_DESPACHO'] == null || row['C_DESPACHO'] == '') {
                                    let _btnEliminar;
                                    _btnEliminar = $(`<a id="eliminar" style="cursor: pointer;" class="jqx-grid-widget">&nbsp;Eliminar</a>`);
                                    $(htmlElement).append(_btnEliminar);
                                    $(htmlElement).find('a#eliminar').unbind('click');
                                    $(htmlElement).find('a#eliminar').click(function () {
                                        fnBorrarProducto(rowIndex);
                                    });
                                }
                            }
                        },
                    }
                },
                config: {
                    virtualmode: false,
                    height: 305,
                    pageSize: 100,
                    pageable: false,
                    sortable: false,
                    editable: false,
                }
            });
            $(tblProductos).on('bindingcomplete', function () {

                fnRecalcularMontos(function () {
                    fnCalcularTotales();
                });

            });
            $(tblProductos).on('rowdoubleclick', function () {
                const estado = $('#IND_ESTADO_VENTA').val();
                if (estado == '*' || estado == 'O' || estado == '' || notaCredito == '*' || notaDebito == '*') {
                    const rowIndex = $(tblProductos).jqxGrid('getselectedrowindex');
                    if (!estadoProducto) {
                        estadoProducto = true;
                        fnEditarProducto(rowIndex);
                    }
                }
            });
        };
        const fnObtenerDatosDespacho = function () {
            $.GetQuery({
                query: ['q_ventas_procesos_nuevaventa_consultardespachos_adjuntos'],
                items: [{
                    C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                    C_VENTA: function () {
                        return $('#C_VENTA').val();
                    }
                }],
                onReady: function (result) {
                    if (result.length == 0) {
                        return;
                    }

                    $('#GUIA_REMISION').attr('readonly', 'readonly');
                    codigos = result;
                }
            })
        }
        const fnObtenerTipoCambio = function () {
            const c_venta = $('#C_VENTA').val();
            if (c_venta == '') {
                $.solver.fn.getTipoCambio({
                    fecha: function () {
                        return $('#FECHAEMISION').val();
                    },
                    onError: function (error) {
                        $.ShowError({ error: error });
                    },
                    onReady: function (result) {
                        $('#TC').val(result[0]['PRECIO_VENTA']);
                    }
                });
            }
        };

        // Otras funciones
        const buscarCliente = function () {
            $.GetData({
                title: 'Busqueda de cliente',
                uriData: $.solver.domainUrl + '/Ventas/Mantenimiento/BusquedaCliente/',
                location: 'float',
                type: 'GET',
                isPage: true,
                onReady: function (object, modal) {
                    $(modal).find('.modal-dialog').css({ 'max-width': '80%' });
                    const actionElegir = function () {
                        const getselectedrowindexes = $(object).find('#tblBusquedaCliente').jqxGrid('getselectedrowindexes');
                        if (getselectedrowindexes.length > 0) {
                            const selectedRowData = $(object).find('#tblBusquedaCliente').jqxGrid('getrowdata', getselectedrowindexes[0]);
                            $('#C_PARAMETRO_GENERAL_TIPO_DOCUMENTO').FieldLoadRemote({
                                onReady: function () {
                                    $('#C_CLIENTE').val(selectedRowData['C_CLIENTE']);
                                    $('#C_CATEGORIA_CLIENTE').val(selectedRowData['C_CATEGORIA_CLIENTE']);
                                    $('#RUC').val(selectedRowData['RUC_CLIENTE'])
                                    $('#NOMBRE').val(selectedRowData['RAZON_SOCIAL']);
                                    $('#DIRECCION').val(selectedRowData['DIRECCION_FISCAL']);
                                    $('#TIPO_DOC_CLIENTE').val(selectedRowData['C_PARAMETRO_GENERAL_TIPO_DOCUMENTO']);
                                    $('#CORREO_ELECTRONICO').val(selectedRowData['CORREO_FACTURACION']);
                                    if (selectedRowData['Cta. bancaria'] != '') {
                                        $('#CUENTA_BANCARIA').val(selectedRowData['Cta. bancaria']);
                                    }
                                    if (selectedRowData['C_PARAMETRO_GENERAL_TIPO_DOCUMENTO'] == '00017' || selectedRowData['C_PARAMETRO_GENERAL_TIPO_DOCUMENTO'] == '09900') {
                                        if (selectedRowData['C_PARAMETRO_GENERAL_TIPO_DOCUMENTO'] == '00017') {
                                            $('#tipo_doc').text('Ruc:');
                                        }
                                        else {
                                            $('#tipo_doc').text('Documento:');
                                        }
                                        if ($('#C_PARAMETRO_GENERAL_TIPO_DOCUMENTO').val() == null) {
                                            var opcionesDocumento = $('#C_PARAMETRO_GENERAL_TIPO_DOCUMENTO')[0].args.data[0].CODIGO;
                                            $('#C_PARAMETRO_GENERAL_TIPO_DOCUMENTO').val(opcionesDocumento).trigger('change');
                                        }
                                        $('#C_PARAMETRO_GENERAL_TIPO_DOCUMENTO').attr('disabled', false);
                                    }
                                    else if (selectedRowData['C_PARAMETRO_GENERAL_TIPO_DOCUMENTO'] == '00013') {
                                        $('#tipo_doc').text('Dni:')
                                        $('#C_PARAMETRO_GENERAL_TIPO_DOCUMENTO').val('07237').trigger('change');
                                        //$('#C_PARAMETRO_GENERAL_TIPO_DOCUMENTO').attr('disabled', 'disabled');
                                        var factura = $('#C_PARAMETRO_GENERAL_TIPO_DOCUMENTO option').filter(x => $($('#C_PARAMETRO_GENERAL_TIPO_DOCUMENTO option')[x]).attr('value') == '07236')
                                        if (factura.length > 0) {
                                            $('#C_PARAMETRO_GENERAL_TIPO_DOCUMENTO option').filter(x => $($('#C_PARAMETRO_GENERAL_TIPO_DOCUMENTO option')[x]).attr('value') == '07236')[0].remove()
                                        }
                                    }
                                    else {
                                        $('#C_PARAMETRO_GENERAL_TIPO_DOCUMENTO').val('07237').trigger('change');
                                        $('#C_PARAMETRO_GENERAL_TIPO_DOCUMENTO').attr('disabled', 'disabled');
                                        $('#tipo_doc').text('Documento:')
                                    }

                                    $('#C_PARAMETRO_GENERAL_TIPO_DOCUMENTO').trigger('change')
                                }
                            });
                        }
                    }
                    $(object).find('#tblBusquedaCliente').CreateGrid({
                        query: 'gbl_listarclientes',
                        items: {
                            NOMBRE: function () {
                                return $('#_buscar').val() || '';
                            },
                            C_EMPRESA: empresa
                        },
                        sortcolumn: 'RAZON_SOCIAL',
                        sortdirection: 'ASC',
                        hiddens: ['C_PARAMETRO_GENERAL_TIPO_DOCUMENTO', 'C_CATEGORIA_CLIENTE', 'NOMBRE_COMERCIAL', 'CORREO_FACTURACION', 'Cta. bancaria'],
                        columns: {
                            'C_CLIENTE': {
                                text: 'Código',
                                width: 70
                            },
                            'DESCRIPCION_PARAMETRO': {
                                text: 'Tipo doc.',
                                width: 200
                            },
                            'RUC_CLIENTE': {
                                text: 'Nro documento',
                                width: 100
                            },
                            'RAZON_SOCIAL': {
                                text: 'Razón social',
                                width: 350
                            },
                            'NOMBRE_COMERCIAL': {
                                text: 'Nombre comercial',
                                width: 250
                            },
                            'DIRECCION_FISCAL': {
                                text: 'Dirección fiscal',
                                width: 250
                            }
                        },
                        config: {
                            pageable: true,
                            sortable: true,
                            height: 600,
                            pageSize: 100
                        }
                    });
                    $(object).find('#tblBusquedaCliente').on("rowdoubleclick", function () {
                        actionElegir();
                        bootbox.hideAll();
                    });
                    $(object).find('form[name=frmBusquedaCliente]').ValidForm({
                        type: -1,
                        onReady: function (form, controls) {
                            $(object).find('#tblBusquedaCliente').jqxGrid('updatebounddata');
                        },
                        onError: function (error) {
                            $.CloseStatusBar();
                            $.ShowError({ error: error });
                        }
                    });
                    $(object).find('#btnCrearCliente').click(function () {
                        $.GetData({
                            title: '<strong>Registro de cliente</strong>',
                            uriData: $.solver.currentUrl + 'Ventas/Mantenimiento/ClientesRegistro/crear',
                            location: 'float',
                            type: 'GET',
                            isPage: true,
                            onReady: function (object2, modal2) {
                                $(modal2).find('.modal-dialog').css({
                                    'max-width': '90%'
                                });
                                $('form[name=frmRegistroCliente] #C_CLIENTE').change(function () {
                                    $(object2).find('.btn-save-cliente').remove();
                                    $(object2).parent().parent().parent().find('.close').trigger('click');
                                });
                            },
                            onCloseModal: function () {
                                const c_cliente = $('form[name=frmRegistroCliente] #C_CLIENTE').val();
                                const ruc = $('form[name=frmRegistroCliente] #RUC_CLIENTE').val();
                                const razon = $('form[name=frmRegistroCliente] #RAZON_SOCIAL').val();
                                const direccion = $('form[name=frmRegistroCliente] #DIRECCION_FISCAL').val();
                                const c_tipo_doc = $('form[name=frmRegistroCliente] #C_PARAMETRO_GENERAL_TIPO_DOCUMENTO_CLIENTE').val();
                                const categoria = $('form[name=frmRegistroCliente] #C_CATEGORIA_CLIENTE').val();
                                const correo = $('form[name=frmRegistroCliente] #CORREO_FACTURACION').val();
                                const ctaBancaria = $('form[name=frmRegistroCliente] #CUENTA_BANCARIA').val();
                                if (c_cliente != '') {

                                    $('#C_PARAMETRO_GENERAL_TIPO_DOCUMENTO').FieldLoadRemote({
                                        onReady: function () {
                                            $('form[name=frmVenta] #C_CLIENTE').val(c_cliente);
                                            $('form[name=frmVenta] #RUC').val(ruc);
                                            $('form[name=frmVenta] #NOMBRE').val(razon);
                                            $('form[name=frmVenta] #DIRECCION').val(direccion);
                                            $('form[name=frmVenta] #C_CATEGORIA_CLIENTE').val(categoria)
                                            $('form[name=frmVenta] #TIPO_DOC_CLIENTE').val(c_tipo_doc);
                                            $('form[name=frmVenta] #CORREO_ELECTRONICO').val(correo);
                                            if (ctaBancaria != '') {
                                                $('form[name=frmVenta] #CUENTA_BANCARIA').val(ctaBancaria);
                                            }
                                            if (c_tipo_doc == '00017' || c_tipo_doc == '09900') {
                                                if (c_tipo_doc == '00017') {
                                                    $('#tipo_doc').text('Ruc:');
                                                }
                                                else {
                                                    $('#tipo_doc').text('Documento:');
                                                }
                                                if ($('#C_PARAMETRO_GENERAL_TIPO_DOCUMENTO').val() == null) {
                                                    var opcionesDocumento = $('#C_PARAMETRO_GENERAL_TIPO_DOCUMENTO')[0].args.data[0].CODIGO;
                                                    $('#C_PARAMETRO_GENERAL_TIPO_DOCUMENTO').val(opcionesDocumento).trigger('change');
                                                }
                                                $('#C_PARAMETRO_GENERAL_TIPO_DOCUMENTO').attr('disabled', false);
                                            }
                                            else if (c_tipo_doc == '00013') {
                                                $('#tipo_doc').text('Dni:');
                                                $('#C_PARAMETRO_GENERAL_TIPO_DOCUMENTO').val('07237').trigger('change');
                                                var factura = $('#C_PARAMETRO_GENERAL_TIPO_DOCUMENTO option').filter(x => $($('#C_PARAMETRO_GENERAL_TIPO_DOCUMENTO option')[x]).attr('value') == '07236')
                                                if (factura.length > 0) {
                                                    $('#C_PARAMETRO_GENERAL_TIPO_DOCUMENTO option').filter(x => $($('#C_PARAMETRO_GENERAL_TIPO_DOCUMENTO option')[x]).attr('value') == '07236')[0].remove()
                                                }
                                            }
                                            else {
                                                $('#C_PARAMETRO_GENERAL_TIPO_DOCUMENTO').val('07237').trigger('change');
                                                $('#C_PARAMETRO_GENERAL_TIPO_DOCUMENTO').attr('disabled', 'disabled');
                                                $('#tipo_doc').text('Documento:')
                                            }
                                            $('#C_PARAMETRO_GENERAL_TIPO_DOCUMENTO').trigger('change')
                                            $(object).parent().parent().parent().find('.close').trigger('click');

                                        }
                                    })

                                }
                            }
                        });
                    });
                    $(object).find('#btnAceptar').click(function () {
                        actionElegir();
                        bootbox.hideAll();
                    })
                },
                onCloseModal: function () {
                    $('#btnCliente').attr('disabled', false)
                }
            });
        };
        const actionEnviarVenta = function (c_venta) {

            // Agregamos script para validar y registrar movimientos de recetas
            $.AddPetition({
                type: '4',
                transaction: true,
                items: $.ConvertObjectToArr({
                    script: 'spw_gbl_validar_registrar_movimientos_recetas_2',
                    C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                    C_DOCUMENTO: c_venta,
                    FLAG_DOCUMENTO: 'ven',
                    C_USUARIO_REGISTRO: $.solver.session.SESSION_ID,
                    MODULO: $.solver.basePath,
                    C_COMANDA: '',
                    VENTA: '*'
                })
            });

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
            });

            $.SendPetition({
                onReady: function () {

                    $.GetQuery({
                        query: ['q_ventas_procesos_nuevaventa_obteneridcomprobante'],
                        items: [{
                            C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                            C_VENTA: function () {
                                return $('#C_VENTA').val();
                            }
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
                                    document.location = $.solver.baseUrl + '/Procesos/RegistroVenta';
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
        const fnValidarGuiadeRemision = function () {
            $.GetQuery({
                query: ['q_ventas_procesos_nuevaventa_consultarguias'],
                items: [{
                    C_EMPRESA: empresa,
                    C_VENTA: function () {
                        return $('#C_VENTA').val();
                    },
                    C_VENTA_REF: function () {
                        return $('#REF_C_VENTA').val();
                    }
                }],
                onReady: function (result) {

                    if (result.length > 0) {
                        var arr = [];
                        $.each(result, function (i, v) {
                            arr.push(v.NRO_COMPROBANTE);
                        })
                        $('#GUIA_REMISION').val(arr.join(', '))
                    }
                }
            })
        };
        const fnObtenerDatosExportacion = function () {
            if ($('#REF_EXPORTACION').val() != '') {
                $.GetQuery({
                    query: ['q_logistica_procesos_nuevacompra_obtenerexportacion'],
                    items: [{
                        C_EMPRESA: empresa,
                        ID_OPERACION: function () {
                            return $('#REF_EXPORTACION').val();
                        }
                    }],
                    onReady: function (result) {
                        if (result.length > 0) {
                            var data = result[0];
                            $('#EXPORTACION_REF').val(data['NOMBRE']);
                        }
                    },
                    onError: function (error) {
                        $.CloseStatusBar();
                        $.ShowError({ error });
                    }
                });
            }
        };
        const fnBuscarExportacion = function () {
            $.GetData({
                title: 'Adjuntar exportación',
                uriData: $.solver.currentUrl + 'Ventas/Procesos/BusquedaExportacion',
                location: 'float',
                type: 'GET',
                isPage: true,
                onReady: function (objectAdjuntarExportacion, modalAdjuntarExportacion) {
                    $(modalAdjuntarExportacion).find('.modal-dialog').css({ 'max-width': '80%' });
                    const tableAdjuntarExportacion = $(objectAdjuntarExportacion).find('#tblBusquedaExportacion');

                    var formExportacion = $(modalAdjuntarExportacion).find('form[name=frmBusquedaExportacion]');

                    $(formExportacion).ValidForm({
                        type: -1,
                        onReady: function () {
                            $(tableAdjuntarExportacion).jqxGrid('updatebounddata')
                        },
                        onDone: function (_, controls) {
                            $(controls.desde).datetimepicker({
                                format: 'DD/MM/YYYY',
                                locale: 'es'
                            });
                            $(controls.hasta).datetimepicker({
                                format: 'DD/MM/YYYY',
                                locale: 'es'
                            });

                            $(tableAdjuntarExportacion).CreateGrid({
                                query: 'tbl_logistica_procesos_exportaciones_listar',
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
                                    FLAG_TIPO: 'E'
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
                                    pageSize: 100,
                                }
                            });
                            const actionElegir = function () {
                                const index = $(tableAdjuntarExportacion).jqxGrid('getselectedrowindex');
                                if (index != -1) {
                                    var row = $(tableAdjuntarExportacion).jqxGrid('getrowdata', index);
                                    $('#REF_EXPORTACION').val(row['ID_OPERACION']);
                                    fnObtenerDatosExportacion();
                                }
                            }
                            $(tableAdjuntarExportacion).on("rowdoubleclick", function () {
                                actionElegir();
                                bootbox.hideAll();
                            });
                            $(objectAdjuntarExportacion).find('form[name=frmBusquedaExportacion] #btnAceptar').click(function () {
                                actionElegir();
                                bootbox.hideAll();
                            })
                        }
                    });
                },
                onCloseModal: function () { estadoProducto = false; }
            })
        };
        const fnBuscarDespachos = function () {
            var iconButton = '<i class="fa fa-search" aria-hidden="true"></i>';
            var textButton = 'Buscar';
            var token = $.CreateToken();
            var dialog = bootbox.dialog({
                title: 'Busqueda de despachos',
                message: `<div id="${token}"></div>`,
                className: 'modal-search-80 modal-search-top-4'
            });
            var controls = {
                buscar: {
                    class: 'col-lg-4',
                    html: '<input type="text" name="buscar" class="form-control form-control-sm" placeholder="Ingrese busqueda..." autocomplete="off" />'
                }
            };

            dialog.init(function () {
                setTimeout(function () {
                    var objControls = null;
                    var fnCrearTabla = function () {
                        $(dialog).find('#' + token + '_table').CreateGrid({
                            query: 'tbl_ventas_procesos_nuevaventa_busquedaadjuntos',
                            hiddens: ['C_EMPRESA', 'C_ALMACEN', 'C_TIPO', 'C_DESPACHO'],
                            items: {
                                BUSCAR: function () {
                                    return $('#' + token + '_form input[name=buscar]').val() || '';
                                },
                                C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                                C_CLIENTE: function () {
                                    return $('#C_CLIENTE').val()
                                }
                            },
                            sortcolumn: 'FECHA_CREACION',
                            sortdirection: 'DESC',
                            columns: {
                                FECHA_CREACION: {
                                    text: 'Fecha creación',
                                    width: 120,
                                },
                                NOMBRE_ALMACEN: {
                                    text: 'Almacén',
                                    width: 120,
                                },
                                TIPO: {
                                    text: 'Tipo',
                                    width: 180,
                                },
                                NRO_OPERACION: {
                                    text: 'Nro documento',
                                    width: 120,
                                    cellsAlign: 'center',
                                },
                                NRO_NOTA_PEDIDO: {
                                    text: 'Nro nota pedido',
                                    width: 120
                                },
                                RAZON_SOCIAL: {
                                    text: 'Razón social',
                                    width: 250,
                                },
                                OBSERVACIONES: {
                                    text: 'Observaciones',
                                    width: 250,
                                }
                            },
                            config: {
                                pageable: true,
                                sortable: true,
                                height: 500,
                                pageSize: 100,
                                selectionmode: 'checkbox'
                            }
                        });
                    };

                    $(dialog).find('#' + token).html(`
                            <form id="${token}_form">
                                <div class="row site"></div>
                            </form>
                            <div class="row mt-3">
                                <div class="col-12"><div id="${token}_table"></div></div>
                            </div>
                        `);

                    //agregamos controles
                    for (var item in controls) {
                        var control = controls[item];
                        $(dialog).find('#' + token + '_form .site').append(`
                            <div class="${control.class}">${control.html}</div>
                        `);
                    };
                    $(dialog).find('#' + token + '_form .site').append(`
                        <div class="col-2"><button type="submit" class="btn btn-sm btn-gray">${iconButton} ${textButton}</button></div>
                        <div class="col-6"><button type="button" id="btnGuardar" class="btn btn-sm btn-danger float-right"><i class="fa fa-floppy-o" aria-hidden="true"></i>&nbsp;Guardar</button></div>
                    `);

                    //Validamos formulario
                    $(dialog).find('#' + token + '_form').ValidForm({
                        type: -1,
                        onDone: function (form, controls) {
                            objControls = controls;
                            fnCrearTabla();

                            $(dialog).find('#' + token + '_form #btnGuardar').click(function () {
                                var indexes = $(dialog).find('#' + token + '_table').jqxGrid('getselectedrowindexes');
                                if (indexes.length == 0) {
                                    alertify.warning('Por favor seleccione un registro');
                                    return;
                                }

                                codigos = [];
                                var rows = $(dialog).find('#' + token + '_table').jqxGrid('getrows');
                                var despachosAdjuntos = [];
                                $.each(indexes, function (i, v) {
                                    var row = rows[v];
                                    codigos.push({
                                        c_empresa: $.solver.session.SESSION_EMPRESA,
                                        c_almacen: row.C_ALMACEN,
                                        c_tipo: row.C_TIPO,
                                        c_despacho: row.C_DESPACHO
                                    })
                                    despachosAdjuntos.push(row.NRO_OPERACION);
                                });

                                $.GetQuery({
                                    query: ['q_ventas_procesos_nuevaventa_obtener_detalles_despachos'],
                                    items: [{
                                        C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                                        DESPACHOS: JSON.stringify(codigos)
                                    }],
                                    onReady: function (result) {
                                        
                                        $('#GUIA_REMISION').val(despachosAdjuntos.join(', '));
                                        $('#GUIA_REMISION').attr('disabled', 'disabled')

                                        $.each($(tblProductos).jqxGrid('getrows'), function (i, v) {
                                            arrEliminadas.push(v);
                                        })

                                        $(tblProductos).jqxGrid('clear');
                                        $(tblProductos).jqxGrid('addrow', {}, result);

                                        $(dialog).modal('hide')

                                        fnCalcularTotales();
                                    }
                                })
                            })
                        },
                        onReady: function () {
                            $(dialog).find('#' + token + '_table').jqxGrid('updatebounddata');
                        }
                    });

                }, 150);
            });
            $('.bootbox .modal-dialog').draggable({
                handle: '.modal-header'
            });
            $('.bootbox .modal-header').css('cursor', 'move');
            dialog.on('hide.bs.modal', function () { estadoProducto = false; });
        };
        const fnValidarExportacion = function () {
            if (
                notaCredito != '*' && notaDebito != '*' &&
                (dataVenta['TIPO_NOTA_DEBITO'] == null || dataVenta['TIPO_NOTA_DEBITO'] == '') && (dataVenta['TIPO_NOTA_CREDITO'] == null || dataVenta['TIPO_NOTA_CREDITO'] == '')) {
                $('#bloque_venta').show()
            }
        };
        const validarFormatoFecha = function (fecha, index, column, oldvalue) {
            var RegExPattern = /^\d{1,2}\/\d{1,2}\/\d{2,4}$/;
            if ((fecha.match(RegExPattern)) && (fecha != '')) { }
            else {
                if (column == 'FECHA_VENCIMIENTO') {
                    $(tblCuotas).jqxGrid('getrows')[index].FECHA_VENCIMIENTO = oldvalue;
                    $(tblCuotas).jqxGrid('refresh');
                }
            }
        };
        const fnCrearTablaCuotas = function () {
            $('#divTblCuotas').html('<div id="tblCuotas"></div>');
            setTimeout(function () {
                $(tblCuotas).CreateGrid({
                    query: 'tbl_ventas_procesos_nuevaventa_cuotas',
                    items: {
                        C_EMPRESA: empresa,
                        C_VENTA: function () {
                            return $('#C_VENTA').val();
                        }
                    },
                    hiddens: ['C_EMPRESA', 'C_VENTA', 'C_CUOTA'],
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
                        height: 135,
                        sortable: false,
                        editable: true,
                        showaggregates: true,
                        showstatusbar: true,
                        statusbarheight: 20,
                        rendered: function () {
                            var lengthRows = $(tblCuotas).jqxGrid('getrows').length
                            if (lengthRows > 0) {
                                $('#NRO_CUOTAS').val(lengthRows);
                            }
                        }
                    }
                });
                $(tblCuotas).on('cellvaluechanged', function (event) {
                    var lengthRows = $(tblCuotas).jqxGrid('getrows').length
                    if (lengthRows > 0) {
                        var fecha = $(tblCuotas).jqxGrid('getrows')[lengthRows - 1]['FECHA_VENCIMIENTO'];
                        if (fecha != '') {
                            $('#FECHA_VENCIMIENTO').val(fecha).trigger('change');
                        }
                    }

                    var args = event.args;
                    var datafield = event.args.datafield;
                    var rowBoundIndex = args.rowindex;
                    var value = args.newvalue;
                    var oldvalue = args.oldvalue;

                    if (datafield == 'FECHA_VENCIMIENTO') {
                        validarFormatoFecha(value, rowBoundIndex, datafield, oldvalue);
                    }
                });
            }, 250)
        };
        const fnValidarMostrarAnticipos = function () {
            if (anticipos.length != 0) {
                $('.zone-anticipos').show();
                $('#divTblAnticipos').html('<div id="tblAnticipos"></div>')
                setTimeout(function () {
                    $('#tblAnticipos').CreateGrid({
                        query: 'tbl_ventas_procesos_nuevaventa_anticipos',
                        items: {
                            C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                            C_VENTA: function () {
                                return $('#C_VENTA').val()
                            }
                        },
                        hiddens: ['C_EMPRESA', 'C_VENTA', 'C_DETALLE', 'C_VENTA_REF', 'COD_TIPO', 'IND_ESTADO'],
                        columns: {
                            DESCRIPCION: {
                                text: 'Descripción',
                                width: 150
                            },
                            FECHA_EMISION: {
                                text: 'Fec. emisión',
                                width: 100,
                                cellsAlign: 'center'
                            },
                            TIPO: {
                                text: 'Tipo',
                                width: 80,
                            },
                            MONEDA: {
                                text: 'Moneda',
                                width: 80
                            },
                            NUMERO: {
                                text: 'Nro. doc.',
                                width: 110
                            },
                            BASE: {
                                text: 'Base',
                                width: 80,
                                cellsAlign: 'right',
                                cellsFormat: 'd2',
                                aggregates: ['sum'],
                                aggregatesRenderer: function (aggregates, column, element) {
                                    var formatNumber = aggregates.sum;
                                    if (formatNumber === undefined)
                                        formatNumber = '';
                                    return `<div class="h-30 d-flex justify-content-center align-items-center font-weight-bold">
                                                    <strong id="totalDineroRecibido"> ${formatNumber} </strong>
                                                </div>`;
                                }
                            },
                            IGV: {
                                text: 'Igv',
                                width: 80,
                                cellsAlign: 'right',
                                cellsFormat: 'd2',
                                aggregates: ['sum'],
                                aggregatesRenderer: function (aggregates, column, element) {
                                    var formatNumber = aggregates.sum;
                                    if (formatNumber === undefined)
                                        formatNumber = '';
                                    return `<div class="h-30 d-flex justify-content-center align-items-center font-weight-bold">
                                                    <strong id="totalDineroRecibido"> ${formatNumber} </strong>
                                                </div>`;
                                }
                            },
                            RC: {
                                text: 'Rc',
                                width: 80,
                                cellsAlign: 'right',
                                cellsFormat: 'd2',
                                aggregates: ['sum'],
                                aggregatesRenderer: function (aggregates, column, element) {
                                    var formatNumber = aggregates.sum;
                                    if (formatNumber === undefined)
                                        formatNumber = '';
                                    return `<div class="h-30 d-flex justify-content-center align-items-center font-weight-bold">
                                                    <strong id="totalDineroRecibido"> ${formatNumber} </strong>
                                                </div>`;
                                }
                            },
                            TOTAL: {
                                text: 'Total',
                                width: 80,
                                cellsAlign: 'right',
                                cellsFormat: 'd2',
                                aggregates: ['sum'],
                                aggregatesRenderer: function (aggregates, column, element) {
                                    var formatNumber = aggregates.sum;
                                    if (formatNumber === undefined)
                                        formatNumber = '';
                                    return `<div class="h-30 d-flex justify-content-center align-items-center font-weight-bold">
                                                    <strong id="totalDineroRecibido"> ${formatNumber} </strong>
                                                </div>`;
                                }
                            },
                        },
                        config: {
                            height: 135,
                            virtualmode: false,
                            pageSize: 100,
                            pageable: false,
                            sortable: false,
                            editable: false,
                            showaggregates: true,
                            showstatusbar: true,
                            statusbarheight: 20,
                        }
                    })
                    $('#tblAnticipos').on('bindingcomplete', function () {
                        if (anticipos.length != 0) {
                            $('#tblAnticipos').jqxGrid('addrow', {}, anticipos.filter(x => x['IND_ESTADO'] == '*'));
                            $('#tblAnticipos').jqxGrid('refresh');
                        }
                        fnCalcularTotales();
                    })

                }, 250)
            }
            else {
                $('.zone-anticipos').hide();
                $('#divTblAnticipos').html('')
            }
        }
        const fnAplicarCuotas = function () {
            if ($('#NRO_CUOTAS').val() <= 0) alertify.warning('Las cuotas no pueden cero o menor.');
            else {

                if ($(tblCuotas).jqxGrid('getrows').length > 0) {
                    alertify.confirm('Mensaje del sistema', '¿Desea volver a calcular las cuotas?',
                        function () {
                            const rows = $('#tblProductos').jqxGrid('getrows');
                            var cuotas = $('#NRO_CUOTAS').val();
                            var precioTotal = 0;
                            $.each(rows, function (i, v) {
                                var codAfectacion = parseFloat(v.CODIGO_AFECTACION_IGV_CABECERA)
                                precioTotal += (v.PRECIO_TOTAL * codAfectacion);
                            });
                            if (precioTotal > 0) {

                                const tipoOperacion = $('#TIPO_OPERACION').val();
                                const tipoDetraccion = $('#TIPO_DETRACCION').val();
                                const emisorRetenedor = $('#EMISOR_RETENEDOR').val();
                                const emisorBuenContribuyente = $('#EMISOR_BUEN_CONTRIBUYENTE').val();
                                const clienteRetenedor = $('#CLIENTE_RETENEDOR').val();
                                const clienteBuenContribuyente = $('#CLIENTE_BUEN_CONTRIBUYENTE').val();

                                if (($('#C_PARAMETRO_GENERAL_MONEDA').val() == '07235' ? (precioTotal * parseFloat($('#TC').val())) : precioTotal) > 700) {
                                    if (tipoOperacion == '07400' && tipoDetraccion != '') {
                                        var calculoDetraccion = $('#TIPO_DETRACCION')[0].args.data.filter(x => x['CODIGO'] == tipoDetraccion)[0].CALCULO
                                        precioTotal -= precioTotal * (calculoDetraccion / 100);
                                    }

                                    // Si el emisor no es retenedor y cliente si
                                    if (emisorRetenedor == '&' && clienteRetenedor == '*' && !(tipoOperacion == '07400')) {
                                        var calculoRetencion = 3;
                                        precioTotal -= precioTotal * (calculoRetencion / 100);
                                    }
                                }

                                var montoParcial = precioTotal / cuotas;
                                var arrCuotas = [];
                                $(tblCuotas).jqxGrid('clear');
                                var fecha;
                                for (var i = 0; i < cuotas; i++) {
                                    fecha = $('#FECHA_VENCIMIENTO').val();
                                    //fecha = moment().clone().startOf('month').add(i + 1, 'month').format('DD/MM/YYYY');
                                    arrCuotas.push({
                                        _rowNum: i + 1,
                                        C_EMPRESA: empresa,
                                        C_VENTA: '',
                                        C_CUOTA: '',
                                        FECHA_VENCIMIENTO: fecha,
                                        MONTO_CUOTA: montoParcial,
                                    });
                                }
                                $(tblCuotas).jqxGrid('addrow', {}, arrCuotas);
                                $('#FECHA_VENCIMIENTO').val(fecha).trigger('change');
                            }
                        },
                        null).set('labels', { ok: 'Si', cancel: 'No' }).set('defaultFocus', 'ok').set('closable', false);
                }
                else {

                    const rows = $('#tblProductos').jqxGrid('getrows');

                    var cuotas = $('#NRO_CUOTAS').val();
                    var precioTotal = 0;

                    $.each(rows, function (i, v) {
                        var codAfectacion = parseFloat(v.CODIGO_AFECTACION_IGV_CABECERA)
                        precioTotal += (v.PRECIO_TOTAL * codAfectacion);
                    });

                    if (precioTotal > 0) {

                        const tipoOperacion = $('#TIPO_OPERACION').val();
                        const tipoDetraccion = $('#TIPO_DETRACCION').val();
                        const emisorRetenedor = $('#EMISOR_RETENEDOR').val();
                        const emisorBuenContribuyente = $('#EMISOR_BUEN_CONTRIBUYENTE').val();
                        const clienteRetenedor = $('#CLIENTE_RETENEDOR').val();
                        const clienteBuenContribuyente = $('#CLIENTE_BUEN_CONTRIBUYENTE').val();

                        if (($('#C_PARAMETRO_GENERAL_MONEDA').val() == '07235' ? (precioTotal * parseFloat($('#TC').val())) : precioTotal) > 700) {

                            if (tipoOperacion == '07400' && tipoDetraccion != '') {
                                var calculoDetraccion = $('#TIPO_DETRACCION')[0].args.data.filter(x => x['CODIGO'] == tipoDetraccion)[0].CALCULO
                                precioTotal -= precioTotal * (calculoDetraccion / 100);
                            }

                            // Si el emisor no es retenedor y cliente si
                            if (emisorRetenedor == '&' && clienteRetenedor == '*' && !(tipoOperacion == '07400')) {
                                var calculoRetencion = 3;
                                precioTotal -= precioTotal * (calculoRetencion / 100);
                            }

                        }

                        var montoParcial = precioTotal / cuotas;
                        var arrCuotas = [];

                        $(tblCuotas).jqxGrid('clear');

                        var fecha;

                        for (var i = 0; i < cuotas; i++) {
                            fecha = $('#FECHA_VENCIMIENTO').val();
                            //fecha = moment().clone().startOf('month').add(i + 1, 'month').format('DD/MM/YYYY');
                            arrCuotas.push({
                                _rowNum: i + 1,
                                C_EMPRESA: empresa,
                                C_VENTA: '',
                                C_CUOTA: '',
                                FECHA_VENCIMIENTO: fecha,
                                MONTO_CUOTA: montoParcial,
                            });
                        }
                        $(tblCuotas).jqxGrid('addrow', {}, arrCuotas);
                        $('#FECHA_VENCIMIENTO').val(fecha).trigger('change');
                    }
                }
            }
        };
        const actionGuardar = function (vistaprevia) {

            const fnValidarDocRef = function () {
                var nro = $('#NRO_DOC_REF').val();
                var partes = $.trim(nro.replace(new RegExp('#', 'g'), ' ')).split('-')
                var serie = $.trim(partes[0]);
                var nroComprobante = $.trim(partes[1]);

                if (serie.length != 4) return false;

                if (nroComprobante.length == 0) return false;

                nroComprobante = '00000000' + nroComprobante;
                nroComprobante = nroComprobante.substring(nroComprobante.length - 8, nroComprobante.length);

                $('#NRO_DOC_REF').val((serie + '-' + nroComprobante).toUpperCase())

                return true;
            };
            const fnGuardar = function () {
                const rows = $('#tblProductos').jqxGrid('getrows');
                let precioBase = 0;
                let precioDescuento = 0;
                let precioIgv = 0;
                let precioTotal = 0;
                let opGratuitas = 0;
                let opExportacion = 0.00;
                let opDetraccion = 0.00;
                let opRetencion = 0.00;
                let recargoConsumoTotal = 0.00;

                const tipoOperacion = $('#TIPO_OPERACION').val();
                const tipoDetraccion = $('#TIPO_DETRACCION').val();

                const emisorRetenedor = $('#EMISOR_RETENEDOR').val();
                const emisorBuenContribuyente = $('#EMISOR_BUEN_CONTRIBUYENTE').val();
                const clienteRetenedor = $('#CLIENTE_RETENEDOR').val();
                const clienteBuenContribuyente = $('#CLIENTE_BUEN_CONTRIBUYENTE').val();

                let porcRecConsumo = $('#PORC_RC').val();
                if (porcRecConsumo == '' || porcRecConsumo == 0) {
                    porcRecConsumo = 0;
                }
                else {
                    porcRecConsumo = parseFloat(porcRecConsumo) / 100.0
                }

                $.each(rows, function (i, v) {
                    let codAfectacion = parseFloat(v.CODIGO_AFECTACION_IGV_CABECERA);
                    precioBase += (v.PRECIO_BASE * codAfectacion);
                    precioDescuento += ((v.DSCTO_UNITARIO) * v.CANTIDAD);
                    precioIgv += (v.IGV * codAfectacion);
                    precioTotal += (v.PRECIO_TOTAL * codAfectacion);
                    recargoConsumoTotal += v.RECARGO_CONSUMO;
                    if (codAfectacion == '0') {
                        opGratuitas += v.PRECIO_TOTAL;
                    }
                    if (v.CODIGO_AFECTACION_IGV == '04') {
                        opExportacion += (v.PRECIO_BASE * codAfectacion)
                    }
                });

                if (($('#C_PARAMETRO_GENERAL_MONEDA').val() == '07235' ? (precioTotal * parseFloat($('#TC').val())) : precioTotal) > 700) {
                    if (tipoOperacion == '07400' && tipoDetraccion != '') {
                        var calculoDetraccion = $('#TIPO_DETRACCION')[0].args.data.filter(x => x['CODIGO'] == tipoDetraccion)[0].CALCULO
                        opDetraccion = precioTotal * (calculoDetraccion / 100)
                    }

                    // Si el emisor no es retenedor y cliente si
                    if (emisorRetenedor == '&' && clienteRetenedor == '*' && !(tipoOperacion == '07400')) {
                        var calculoRetencion = 3;
                        opRetencion = precioTotal * (calculoRetencion / 100);
                    }
                }

                let c_venta = $('#C_VENTA').val();
                const estadoVenta = $('#IND_ESTADO_VENTA').val();
                
                let actualiza = false;
                if (notaCredito == '*' || notaDebito == '*') {
                    actualiza = false;
                }
                else {
                    if (estadoVenta == 'O' || estadoVenta == '*' || estadoVenta == 'B' ||
                        (!(dataVenta['TIPO_NOTA_CREDITO'] == null || dataVenta['TIPO_NOTA_CREDITO'] == '')) ||
                        (!(dataVenta['TIPO_NOTA_DEBITO'] == null || dataVenta['TIPO_NOTA_DEBITO'] == ''))
                    ) {
                        actualiza = true;
                    }
                }
                if (notaPedido == '*' && c_venta != '') {
                    actualiza = true;
                }

                // Comprobante
                let serie = '';
                serie = $('#serie').val();
                if (serie == '' || serie == null) {
                    serie = $('#NRO_DOC_REF').val().split('-')[0];
                }
                let extraVenta = {
                    C_VENTA: {
                        action: {
                            name: 'GetNextId',
                            args: $.ConvertObjectToArr({
                                columns: 'C_EMPRESA',
                                max_length: '10'
                            })
                        }
                    },
                    NRO_COMPROBANTE: {
                        action: {
                            name: 'GetQueryId',
                            args: $.ConvertObjectToArr({
                                script: 'spw_generar_correlativo_comprobante',
                                column: 'NRO_COMPROBANTE',
                                C_PARAMETRO_GENERAL_TIPO_DOCUMENTO: $('#C_PARAMETRO_GENERAL_TIPO_DOCUMENTO').val(),
                                C_EMPRESA: empresa,
                                SERIE: serie,
                                C_VENTA: ((notaCredito == '*' || notaDebito == '*' || $('#MOTIVO_NOTA_CREDITO').val() != '' || $('#MOTIVO_NOTA_DEBITO').val() != '') ? '' : c_venta),
                                NUEVO_ESTADO: (vistaprevia == '*' ? 'B' : '*')
                            })
                        }
                    },
                    C_CLIENTE: {
                        action: {
                            name: 'GetQueryId',
                            args: $.ConvertObjectToArr({
                                script: 'spw_guardar_cliente_desde_venta',
                                column: 'C_CLIENTE',
                                C_EMPRESA: empresa,
                                NOMBRE: $('#NOMBRE').val(),
                                DOCUMENTO: $('#RUC').val(),
                                DIRECCION: $('#DIRECCION').val(),
                                CORREO_ELECTRONICO: $('#CORREO_ELECTRONICO').val(),
                                DEPARTAMENTO: $('#DEPARTAMENTO').val(),
                                PROVINCIA: $('#PROVINCIA').val(),
                                DISTRITO: $('#DISTRITO').val(),
                            })
                        }
                    }
                }

                // Vista previa
                if (vistaprevia == '*') {
                    extraVenta = {
                        C_VENTA: {
                            action: {
                                name: 'GetNextId',
                                args: $.ConvertObjectToArr({
                                    columns: 'C_EMPRESA',
                                    max_length: '10'
                                })
                            }
                        },
                        C_CLIENTE: {
                            action: {
                                name: 'GetQueryId',
                                args: $.ConvertObjectToArr({
                                    script: 'spw_guardar_cliente_desde_venta',
                                    column: 'C_CLIENTE',
                                    C_EMPRESA: empresa,
                                    NOMBRE: $('#NOMBRE').val(),
                                    DOCUMENTO: $('#RUC').val(),
                                    DIRECCION: $('#DIRECCION').val(),
                                    CORREO_ELECTRONICO: $('#CORREO_ELECTRONICO').val(),
                                    DEPARTAMENTO: $('#DEPARTAMENTO').val(),
                                    PROVINCIA: $('#PROVINCIA').val(),
                                    DISTRITO: $('#DISTRITO').val(),
                                })
                            }
                        }
                    }
                }

                // Nota pedido
                if (notaPedido == '*') {
                    extraVenta = {
                        C_VENTA: {
                            action: {
                                name: 'GetNextId',
                                args: $.ConvertObjectToArr({
                                    columns: 'C_EMPRESA',
                                    max_length: '10'
                                })
                            }
                        },
                        NRO_NOTA_PEDIDO: {
                            action: {
                                name: 'GetNextId',
                                args: $.ConvertObjectToArr({
                                    columns: 'ANIO_NOTA_PEDIDO',
                                    max_length: '6'
                                })
                            }
                        },
                        C_CLIENTE: {
                            action: {
                                name: 'GetQueryId',
                                args: $.ConvertObjectToArr({
                                    script: 'spw_guardar_cliente_desde_venta',
                                    column: 'C_CLIENTE',
                                    C_EMPRESA: empresa,
                                    NOMBRE: $('#NOMBRE').val(),
                                    DOCUMENTO: $('#RUC').val(),
                                    DIRECCION: $('#DIRECCION').val(),
                                    CORREO_ELECTRONICO: $('#CORREO_ELECTRONICO').val(),
                                    DEPARTAMENTO: $('#DEPARTAMENTO').val(),
                                    PROVINCIA: $('#PROVINCIA').val(),
                                    DISTRITO: $('#DISTRITO').val(),
                                })
                            }
                        }
                    }
                }

                // obtenemos total anticipos
                var opAnticiposTotal = 0.00;
                var restaIgv = 0.00;
                var restaRc = 0.00;

                $.each(anticipos.filter(x => x['IND_ESTADO'] == '*'), function (i, v) {
                    opAnticiposTotal += v.TOTAL;
                    restaIgv += v.IGV;
                    restaRc += v.RC;
                });

                precioIgv -= restaIgv;
                recargoConsumoTotal -= restaRc;
                precioTotal -= opAnticiposTotal;

                const objectVenta = {
                    C_EMPRESA: empresa,
                    C_VENTA: (actualiza == true ? c_venta : ''),
                    FECHA_EMISION: ((notaCredito == '*' || notaDebito == '*' || $('#MOTIVO_NOTA_CREDITO').val() != '' || $('#MOTIVO_NOTA_DEBITO').val() != '') ? $('#FECHAEMISION').val() : (c_venta == '' ? $('#FECHAEMISION').val() : $('#FECHAEMISION').val())),
                    C_PARAMETRO_GENERAL_MONEDA: (c_venta == '' ? $('#C_PARAMETRO_GENERAL_MONEDA').val() : dataVenta['C_PARAMETRO_GENERAL_MONEDA']),
                    C_PARAMETRO_GENERAL_TIPO_DOCUMENTO: (notaPedido == '*' ? '09903' : $('#C_PARAMETRO_GENERAL_TIPO_DOCUMENTO').val()),
                    NRO_COMPROBANTE: (vistaprevia == '*' ? ((dataVenta['NRO_COMPROBANTE'] == '' || dataVenta['NRO_COMPROBANTE'] == null || dataVenta['NRO_COMPROBANTE'] == undefined) ? '00000000' : dataVenta['NRO_COMPROBANTE']) : (actualiza == true ? dataVenta['NRO_COMPROBANTE'] : '')),
                    NRO_COTIZACION: (c_venta == '' ? null : dataVenta['NRO_COTIZACION']),
                    C_CLIENTE: $('#C_CLIENTE').val(),
                    TC: (c_venta == '' ? $('#TC').val() : dataVenta['TC']),
                    BASE_IMPONIBLE: numeral(precioBase).format('0.000'),
                    DESCUENTO: numeral(precioDescuento).format('0.000'),
                    IGV: numeral(precioIgv).format('0.000'),
                    TOTAL: numeral(precioTotal).format('0.000'),
                    IND_COTIZACION: (c_venta == '' ? null : dataVenta['IND_COTIZACION']),
                    IND_ESTADO_COTIZACION: (c_venta == '' ? null : dataVenta['IND_ESTADO_COTIZACION']),
                    IND_VENTA: (notaPedido == '' ? '*' : null),
                    IND_ESTADO_VENTA: (notaPedido == '' ? (c_venta == '' ? (vistaprevia == '*' ? 'B' : '*') : '*') : null),
                    REF_C_VENTA: (notaPedido == '*' ? null : (actualiza == true ? dataVenta['REF_C_VENTA'] : (c_venta == '' ? null : c_venta))),
                    OBS_VENTA: $('#OBSERVACION_VENTA').val(),
                    OBS_COTIZACION: $('#OBSERVACION_COTIZACION').val(),
                    CUENTA_BANCARIA: $('#CUENTA_BANCARIA').val(),
                    FECHA_VENCIMIENTO: ((notaCredito == '*' || $('#TIPO_NOTA_CREDITO').val() != '') ? '' : $('#FECHA_VENCIMIENTO').val()),
                    C_ARCHIVO_PDF_COTIZACION: $('#C_ARCHIVO_PDF_COTIZACION').val(),
                    SERIE: (notaPedido == '' ? serie : ''),
                    TIPO_NOTA_CREDITO: $('#TIPO_NOTA_CREDITO').val(),
                    MOTIVO_NOTA_CREDITO: $('#MOTIVO_NOTA_CREDITO').val(),
                    TIPO_NOTA_DEBITO: $('#TIPO_NOTA_DEBITO').val(),
                    MOTIVO_NOTA_DEBITO: $('#MOTIVO_NOTA_DEBITO').val(),
                    TIPO_OPERACION: $('#TIPO_OPERACION').val(),
                    C_USUARIO: session_id,
                    ORDEN_COMPRA: $('#ORDEN_COMPRA').val(),
                    GUIA_REMISION: ($('#GUARDAR_GUIA').val() == '*' ? $('#GUIA_REMISION').val() : null),
                    REF_EXPORTACION: ($('#REF_EXPORTACION').val() == '' ? null : $('#REF_EXPORTACION').val()),
                    FORMA_PAGO: $('#FORMA_PAGO').val(),//((notaCredito == '*' || $('#TIPO_NOTA_CREDITO').val() != '') ? null : $('#FORMA_PAGO').val()),
                    C_ESTABLECIMIENTO: (dataVenta['C_ESTABLECIMIENTO'] == '' || dataVenta['C_ESTABLECIMIENTO'] == null ? $('#C_ESTABLECIMIENTO').val() : dataVenta['C_ESTABLECIMIENTO']),
                    OPERACIONES_GRATUITAS: numeral(opGratuitas).format('0.0000000000'),
                    CORREO_ELECTRONICO: $('#CORREO_ELECTRONICO').val(),
                    TOTAL_EXPORTACION: numeral(opExportacion).format('0.0000000000'),
                    TOTAL_DETRACCION: numeral(opDetraccion).format('0.0000000000'),
                    TOTAL_RETENCION: numeral(opRetencion).format('0.0000000000'),
                    TIPO_DOC_REF: $('#TIPO_DOC_REF').val(),
                    NRO_DOC_REF: $('#NRO_DOC_REF').val(),
                    TOTAL_ANTICIPOS: opAnticiposTotal,
                    TIPO_DETRACCION: ($('#TIPO_OPERACION').val() == '' ? null : $('#TIPO_DETRACCION').val()),
                    COD_MODULO: $('#COD_MODULO').val() == '' ? $.solver.basePath : $('#COD_MODULO').val(),
                    RECARGO_CONSUMO_TOTAL: recargoConsumoTotal,
                    PORC_IGV: ($('#PORC_IGV').val() == '' ? 0 : parseInt($('#PORC_IGV').val()) / 100),
                    PORC_REC_CONSUMO: ($('#PORC_RC').val() == '' ? 0 : parseInt($('#PORC_RC').val()) / 100),

                    NRO_NOTA_PEDIDO: (notaPedido == '*' ? $('#NRO_NOTA_PEDIDO').val() : null),
                    IND_NOTA_PEDIDO: (notaPedido == '*' ? '*' : null),
                    IND_ESTADO_NOTA_PEDIDO: (notaPedido == '*' ? '*' : (c_venta == '' ? null : dataVenta['IND_ESTADO_NOTA_PEDIDO'])),
                    ANIO_NOTA_PEDIDO: (notaPedido == '*' ? $('#ANIO_NOTA_PEDIDO').val() : null),
                };
                var typeVenta = 0;
                if (notaCredito == '*' || notaDebito == '*') {
                    typeVenta = 1;
                }
                else {
                    if ($('#IND_COTIZACION').val() == '*' && $('#IND_ESTADO_VENTA').val() == '') {
                        typeVenta = 1;
                    }
                    else {
                        if (actualiza == true) {
                            typeVenta = 2;
                        }
                        else {
                            typeVenta = 1;
                        }
                    }
                }

                // Venta y detalle
                var tokenVenta = $.AddPetition({
                    type: typeVenta,
                    table: 'VET.VENTA',
                    condition: `C_VENTA = '${c_venta}' AND C_EMPRESA = '${empresa}'`,
                    items: $.ConvertObjectToArr(objectVenta, extraVenta)
                });
                $.each(rows, function (i, v) {
                    const extraVentaDetalle = {
                        C_VENTA: {
                            action: {
                                name: 'GetParentId',
                                args: $.ConvertObjectToArr({
                                    token: tokenVenta,
                                    column: 'C_VENTA'
                                })
                            }
                        },
                        C_DETALLE: {
                            action: {
                                name: 'GetNextId',
                                args: $.ConvertObjectToArr({
                                    columns: 'C_VENTA,C_EMPRESA',
                                    max_length: '10'
                                })
                            }
                        },
                    };
                    const c_detalle = v.C_DETALLE
                    let objectVentaDetalle = {
                        C_EMPRESA: empresa,
                        C_VENTA: v.C_VENTA,
                        C_DETALLE: c_detalle,
                        C_PRODUCTO: v.C_PRODUCTO,
                        DESCRIPCION: v.DESCRIPCION,
                        CANTIDAD: numeral(v.CANTIDAD).format('0.0000000000'),
                        PRECIO: numeral(v.PRECIO).format('0.0000000000'),
                        BASE_IMPONIBLE: numeral(v.BASE_IMPONIBLE).format('0.00000'),
                        INCLUYE_IGV: ((v.INCLUYE_IGV == true || v.INCLUYE_IGV == 'true') ? '*' : '&'),
                        VALOR_UNITARIO: numeral(v.VALOR_UNITARIO).format('0.0000000000'),
                        PORC_DSCTO: v.PORC_DSCTO,
                        DSCTO_UNITARIO: numeral(v.DSCTO_UNITARIO).format('0.0000000000'),
                        VALOR_VENTA_UNITARIO: numeral(v.VALOR_VENTA_UNITARIO).format('0.0000000000'),
                        AFECTACION_IGV: v.AFECTACION_IGV,
                        IGV_UNITARIO: numeral(v.IGV_UNITARIO).format('0.0000000000'),
                        PRECIO_BASE: numeral(v.PRECIO_BASE).format('0.00000'),
                        IGV: numeral(v.IGV).format('0.00000'),
                        PRECIO_TOTAL: numeral(v.PRECIO_TOTAL).format('0.00000'),
                        DSCTO_PARCIAL: numeral(v.DSCTO_PARCIAL).format('0.00000'),
                        C_PRODUCTO_PRECIO: v.C_PRODUCTO_PRECIO,
                        IND_ESTADO: '*',
                        IND_SERVICIO: v.IND_SERVICIO,
                        AFECTACION_IGV: v.AFECTACION_IGV,
                        DSCTO_UNITARIO_IGV: numeral(v.DSCTO_UNITARIO_IGV).format('0.0000000000'),
                        C_ALMACEN: (v.C_ALMACEN == '' ? null : v.C_ALMACEN),
                        STOCK: (v.STOCK == '' || v.STOCK == null ? null : v.STOCK),
                        C_PARAMETRO_GENERAL_UNIDAD: v.C_UNIDAD_MEDIDA,
                        C_TIPO: v.C_TIPO,
                        C_DESPACHO: v.C_DESPACHO,
                        C_SUJETO_DETRACCION: v.C_SUJETO_DETRACCION,
                        RECARGO_CONSUMO: numeral(v.RECARGO_CONSUMO).format('0.0000000000'),
                        PORC_IGV: v.PORC_IGV,
                        PORC_RC: v.PORC_RC
                    };
                    var typeVentaDetalle = 0;
                    if (notaCredito == '*' || notaDebito == '*') {
                        typeVentaDetalle = 1;
                    }
                    else {
                        if (($('#IND_COTIZACION').val() == '*' && $('#IND_ESTADO_VENTA').val() == '') || $('#IND_NOTA_PEDIDO').val() == '*' && $('#IND_ESTADO_VENTA').val() == '') {
                            typeVentaDetalle = 1;
                        }
                        else {
                            if (c_detalle == '') {
                                typeVentaDetalle = 1;
                            }
                            else {
                                typeVentaDetalle = 2;
                            }
                        }
                    }
                    if (notaPedido == '*' && c_venta != '') {
                        typeVentaDetalle = 2;
                    }
                    $.AddPetition({
                        type: typeVentaDetalle,
                        condition: `C_DETALLE = '${c_detalle}' AND C_VENTA = '${c_venta}' AND C_EMPRESA = '${empresa}'`,
                        table: 'VET.VENTA_DETALLE',
                        items: $.ConvertObjectToArr(objectVentaDetalle, extraVentaDetalle)
                    });
                });

                // despacho
                $.AddPetition({
                    type: 4,
                    items: $.ConvertObjectToArr({
                        script: 'spw_ventas_nuevaventa_borrar_despachos_adjuntos',
                        C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                        C_VENTA: '',
                    },
                        {
                            C_VENTA: {
                                action: {
                                    name: 'GetParentId',
                                    args: $.ConvertObjectToArr({
                                        token: tokenVenta,
                                        column: 'C_VENTA'
                                    })
                                }
                            },
                        }),
                    transaction: true
                });
                if (codigos.length != 0) {
                    $.each(codigos, function (i, v) {
                        $.AddPetition({
                            type: 1,
                            table: 'VET.VENTA_DESPACHO_ALMACEN',
                            items: $.ConvertObjectToArr({
                                C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                                C_VENTA: c_venta,
                                C_ALMACEN: v.c_almacen,
                                C_TIPO: v.c_tipo,
                                C_DESPACHO: v.c_despacho,
                                C_USUARIO_CREACION: $.solver.session.SESSION_ID
                            }, {
                                C_VENTA: {
                                    action: {
                                        name: 'GetParentId',
                                        args: $.ConvertObjectToArr({
                                            token: tokenVenta,
                                            column: 'C_VENTA'
                                        })
                                    }
                                },
                            })
                        });
                    });
                    $.AddPetition({
                        type: 4,
                        items: $.ConvertObjectToArr({
                            script: 'spw_ventas_nuevaventa_cambiar_estado_notapedido_adjuntos_de_notadespacho',
                            C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                            C_VENTA: '',
                            ESTADO: 'F'
                        },
                            {
                                C_VENTA: {
                                    action: {
                                        name: 'GetParentId',
                                        args: $.ConvertObjectToArr({
                                            token: tokenVenta,
                                            column: 'C_VENTA'
                                        })
                                    }
                                },
                            }),
                        transaction: true
                    });
                }

                // movimientos de almacen
                if (vistaprevia != '*' && notaPedido != '*') {
                    if (($('#C_PARAMETRO_GENERAL_TIPO_DOCUMENTO').val() == '07236' || $('#C_PARAMETRO_GENERAL_TIPO_DOCUMENTO').val() == '07237')) {

                        $.AddPetition({
                            type: '4',
                            transaction: true,
                            items: $.ConvertObjectToArr({
                                script: 'spw_gbl_validar_registrar_movimiento_stock_v2',
                                C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                                C_DOCUMENTO: '',
                                FLAG_DOCUMENTO: 'ven',
                                C_USUARIO_REGISTRO: $.solver.session.SESSION_ID,
                                FLAG_VALIDA_STOCK: '&'
                            },
                                {
                                    C_DOCUMENTO: {
                                        action: {
                                            name: 'GetParentId',
                                            args: $.ConvertObjectToArr({
                                                token: tokenVenta,
                                                column: 'C_VENTA'
                                            })
                                        }
                                    },
                                }
                            )
                        });
                    }
                }

                // Actualizar estados de cotización o nota de pedido
                if (notaCredito == '') {
                    $.each(arrEliminadas, function (i, v) {
                        const c_detalle = v.C_DETALLE;
                        if (c_detalle != '') {
                            let objectVentaDetalle = {
                                C_EMPRESA: empresa,
                                C_VENTA: v.C_VENTA,
                                C_DETALLE: c_detalle,
                                C_PRODUCTO: v.C_PRODUCTO,
                                IND_ESTADO: '&'
                            };
                            $.AddPetition({
                                table: 'VET.VENTA_DETALLE',
                                type: 2,
                                condition: `C_DETALLE = '${c_detalle}' AND C_VENTA = '${c_venta}' AND C_EMPRESA = '${empresa}'`,
                                items: $.ConvertObjectToArr(objectVentaDetalle)
                            });
                        }
                    });

                    if ($('#IND_COTIZACION').val() == '*' && notaCredito == '') {
                        const objectCotizacion = {
                            C_VENTA: c_venta,
                            C_EMPRESA: empresa,
                            IND_ESTADO_COTIZACION: 'F',
                            C_USUARIO: session_id
                        }
                        $.AddPetition({
                            type: 2,
                            table: 'VET.VENTA',
                            condition: `C_VENTA = '${c_venta}' AND C_EMPRESA = '${empresa}'`,
                            items: $.ConvertObjectToArr(objectCotizacion)
                        });
                    }

                    if ($('#IND_NOTA_PEDIDO').val() == '*' && notaCredito == '' && notaPedido != '*') {
                        const objectCotizacion = {
                            C_VENTA: c_venta,
                            C_EMPRESA: empresa,
                            IND_ESTADO_NOTA_PEDIDO: 'F',
                            C_USUARIO: session_id
                        }
                        $.AddPetition({
                            type: 2,
                            table: 'VET.VENTA',
                            condition: `C_VENTA = '${c_venta}' AND C_EMPRESA = '${empresa}'`,
                            items: $.ConvertObjectToArr(objectCotizacion)
                        });
                    }

                };
                $.AddPetition({
                    type: 4,
                    transaction: true,
                    items: $.ConvertObjectToArr({
                        script: 'spw_ventas_cambiar_estado_notas_pedido',
                        C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                        C_VENTA: c_venta,
                        ESTADO: 'F'
                    }, {
                        C_VENTA: {
                            action: {
                                name: 'GetParentId',
                                args: $.ConvertObjectToArr({
                                    token: tokenVenta,
                                    column: 'C_VENTA'
                                })
                            }
                        },
                    })
                })

                // Cuotas
                $.AddPetition({
                    type: 4,
                    items: $.ConvertObjectToArr({
                        script: 'spw_ventas_nuevaventa_borrar_cuotas',
                        C_EMPRESA: empresa,
                        C_VENTA: c_venta,
                    },
                        {
                            C_VENTA: {
                                action: {
                                    name: 'GetParentId',
                                    args: $.ConvertObjectToArr({
                                        token: tokenVenta,
                                        column: 'C_VENTA'
                                    })
                                }
                            },
                        }),
                    transaction: true
                });
                if ($('#FORMA_PAGO').val() == '09913' && ($('#C_PARAMETRO_GENERAL_TIPO_DOCUMENTO').val() == '07236' || $('#C_PARAMETRO_GENERAL_TIPO_DOCUMENTO').val() == '07241')) {
                    if ($('#divTblCuotas')[0].children.length > 0) {
                        $.each($(tblCuotas).jqxGrid('getrows'), function (i, v) {
                            $.AddPetition({
                                type: 1,
                                table: 'VET.VENTA_CUOTA',
                                items: $.ConvertObjectToArr(
                                    {
                                        C_EMPRESA: empresa,
                                        C_VENTA: '',
                                        C_CUOTA: '',
                                        FECHA_VENCIMIENTO: v.FECHA_VENCIMIENTO,
                                        MONTO_CUOTA: v.MONTO_CUOTA
                                    },
                                    {
                                        C_VENTA: {
                                            action: {
                                                name: 'GetParentId',
                                                args: $.ConvertObjectToArr({
                                                    token: tokenVenta,
                                                    column: 'C_VENTA'
                                                })
                                            }
                                        },
                                        C_CUOTA: {
                                            action: {
                                                name: 'GetNextId',
                                                args: $.ConvertObjectToArr({
                                                    columns: 'C_VENTA,C_EMPRESA',
                                                    max_length: '3'
                                                })
                                            }
                                        },
                                    })
                            });
                        });
                    }
                }

                // Genera pdf si es vista previa
                if (vistaprevia == '*') {
                    $.AddPetition({
                        type: '4',
                        transaction: true,
                        items: $.ConvertObjectToArr({
                            script: 'spw_gbl_registrar_declaracion_sunat_venta_2',
                            C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                            C_DOCUMENTO: c_venta,
                            FLAG_DOCUMENTO: 'ven',
                            C_USUARIO_REGISTRO: $.solver.session.SESSION_ID
                        }, {
                            C_DOCUMENTO: {
                                action: {
                                    name: 'GetParentId',
                                    args: $.ConvertObjectToArr({
                                        token: tokenVenta,
                                        column: 'C_VENTA'
                                    })
                                }
                            }
                        })
                    })
                }

                // anticipos
                $.each(arrAnticiposEliminados, function (i, v) {
                    $.AddPetition({
                        type: 2,
                        table: 'VET.VENTA_ANTICIPO',
                        condition: `C_EMPRESA = '${$.solver.session.SESSION_EMPRESA}' AND C_VENTA = '${v.C_VENTA}' AND C_DETALLE = '${v.C_DETALLE}'`,
                        items: $.ConvertObjectToArr({
                            C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                            C_VENTA: v.C_VENTA,
                            C_DETALLE: v.C_DETALLE,
                            IND_ESTADO: '&'
                        }),
                    });
                });
                $.each(anticipos, function (i, v) {
                    $.AddPetition({
                        table: 'VET.VENTA_ANTICIPO',
                        type: (v.C_DETALLE == '' ? 1 : 2),
                        condition: (v.C_DETALLE == '' ? '' : `C_EMPRESA = '${$.solver.session.SESSION_EMPRESA}' AND C_VENTA = '${v.C_VENTA}' AND C_DETALLE = '${v.C_DETALLE}'`),
                        items: $.ConvertObjectToArr({
                            C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                            C_VENTA: v.C_VENTA,
                            C_DETALLE: v.C_DETALLE,
                            C_VENTA_REF: v.C_VENTA_REF,
                            FECHA_EMISION: v.FECHA_EMISION,
                            COD_TIPO: v.COD_TIPO,
                            TIPO: v.TIPO,
                            NUMERO: v.NUMERO,
                            MONEDA: v.MONEDA,
                            BASE: v.BASE,
                            IGV: v.IGV,
                            RC: v.RC,
                            TOTAL: v.TOTAL,
                            DESCRIPCION: v.DESCRIPCION,
                            IND_ESTADO: v.IND_ESTADO,
                            PORC_IGV: $('#PORC_IGV').val() == '' ? 0 : parseInt($('#PORC_IGV').val()) / 100,
                            PORC_RC: $('#PORC_RC').val() == '' ? 0 : parseInt($('#PORC_RC').val()) / 100
                        },
                            (v.C_DETALLE == '' ? {
                                C_VENTA: {
                                    action: {
                                        name: 'GetParentId',
                                        args: $.ConvertObjectToArr({
                                            token: tokenVenta,
                                            column: 'C_VENTA'
                                        })
                                    }
                                },
                                C_DETALLE: {
                                    action: {
                                        name: 'GetNextId',
                                        args: $.ConvertObjectToArr({
                                            columns: 'C_VENTA,C_EMPRESA',
                                            max_length: '3'
                                        })
                                    }
                                }
                            } : {})),
                    });
                });

                $.SendPetition({
                    connectToLogin: 'S',
                    onReady: function (result) {
                        $.CloseStatusBar();
                        bootbox.hideAll();
                        alertify.success('Se registró la información.');

                        if (notaPedido == '*') {
                            document.location = $.solver.baseUrl + '/Procesos/RegistroNotaPedido';
                            return;
                        }
                        c_venta = result[tokenVenta].items.C_VENTA;
                        if (notaCredito == '' || notaDebito == '') {
                            $('#C_VENTA').val(result[tokenVenta].items.C_VENTA);
                            $('#NRO_COMPROBANTE').text(result[tokenVenta].items.NRO_COMPROBANTE);
                            $('#btnGuardar').css('display', 'none');
                            $('#btnCliente').hide();
                            $('#C_PARAMETRO_GENERAL_TIPO_DOCUMENTO').attr('disabled', 'disabled');
                            $('#FECHAEMISION').attr('disabled', 'disabled');
                            $('#FECHA_VENCIMIENTO').attr('disabled', 'disabled');
                            $('#C_PARAMETRO_GENERAL_MONEDA').attr('disabled', 'disabled');
                            $('#CUENTA_BANCARIA').attr('disabled', 'disabled');
                            $('#OBSERVACION_COTIZACION').attr('disabled', 'disabled');
                            $('#OBSERVACION_VENTA').attr('disabled', 'disabled');
                            //$('#btnBusquedaProducto').hide();
                        }
                        else {
                            $('#NRO_COMPROBANTE').text(result[tokenVenta].items.NRO_COMPROBANTE);
                            $('#btnGuardar').css('display', 'none');
                            $('#TIPO_NOTA_CREDITO').css('disabled', 'disabled');
                            $('#MOTIVO_NOTA_CREDITO').css('disabled', 'disabled');
                            $('#TIPO_NOTA_DEBITO').css('disabled', 'disabled');
                            $('#MOTIVO_NOTA_DEBITO').css('disabled', 'disabled');
                            $('#FECHAEMISION').attr('disabled', 'disabled')
                        }

                        if (vistaprevia == '*') {
                            document.location = $.solver.baseUrl + '/Procesos/NuevaVenta/' + result[tokenVenta].items.C_VENTA + '?vistaprevia=*';
                        }
                        else {
                            alertify.confirm('Mensaje del sistema', '¿Desea hacer la declaración a sunat?',
                                function () {
                                    $.GetQuery({
                                        query: ['tbl_ventas_procesos_registroventa_consultarventas_cventa'],
                                        items: [{
                                            C_VENTA: result[tokenVenta].items.C_VENTA,
                                            C_EMPRESA: empresa
                                        }],
                                        onError: function (error) {
                                            $.ShowError({ error: _error });
                                        },
                                        onReady: function (result) {
                                            const fila = result[0];

                                            const c_venta = fila['C_VENTA'];
                                            actionEnviarVenta(c_venta);
                                        }
                                    });
                                },
                                function () {
                                    document.location = $.solver.baseUrl + '/Procesos/RegistroVenta';
                                }
                            ).set('labels', { ok: 'Si', cancel: 'No' }).set('defaultFocus', 'ok').set('closable', false);
                        }
                    },
                    onBefore: function () {
                        $.DisplayStatusBar({ message: 'Registrando.' });
                    },
                    onError: function (_error) {
                        $.CloseStatusBar();
                        $.ShowError({ error: _error });
                    }
                });

            };
            const fnValidar = function () {

                // Validamos el nro de doc ref
                if (!fnValidarDocRef() && (($('#C_PARAMETRO_GENERAL_TIPO_DOCUMENTO').val() == '07241' || $('#C_PARAMETRO_GENERAL_TIPO_DOCUMENTO').val() == '07242') && $('#REF_C_VENTA').val() != '')) {
                    fnObtenerAlerta('Por favor ingrese el campo nro de comprobante de referencia.')
                    return;
                }

                $.GetQuery({
                    query: ['q_calcular_diferencia_fechas_dia'],
                    items: [{
                        FEC_INICIO: function () {
                            return $('#FECHAEMISION').val()
                        },
                        FEC_FIN: function () {
                            return $('#FECHA_VENCIMIENTO').val()
                        }
                    }],
                    onReady: function (result) {

                        if ((result[0].DIA >= 0 && ($('#C_PARAMETRO_GENERAL_TIPO_DOCUMENTO').val() == '07236' || $('#C_PARAMETRO_GENERAL_TIPO_DOCUMENTO').val() == '07237')) || true) {

                            var guardar = false;

                            if ($('#FORMA_PAGO').val() == '09913') {

                                if ($('#divTblCuotas')[0].children.length > 0) {

                                    if ($(tblCuotas).jqxGrid('getrows').length == 0) {
                                        fnObtenerAlerta('Por favor ingrese las cuotas');
                                        return false;
                                    }

                                    let suma = 0;
                                    $.each($(tblCuotas).jqxGrid('getrows'), function (i, v) {
                                        suma += v['MONTO_CUOTA'];
                                    });

                                    const filas = $(tblProductos).jqxGrid('getrows');
                                    let importeTotal = 0;
                                    $.each(filas, function (i, v) {
                                        var codAfectacion = parseFloat(v.CODIGO_AFECTACION_IGV_CABECERA)
                                        importeTotal += (v.PRECIO_TOTAL * codAfectacion);
                                    });

                                    const tipoOperacion = $('#TIPO_OPERACION').val();
                                    const tipoDetraccion = $('#TIPO_DETRACCION').val();

                                    if (tipoOperacion == '07400') {
                                        if (tipoDetraccion != '') {
                                            var calculoDetraccion = $('#TIPO_DETRACCION')[0].args.data.filter(x => x['CODIGO'] == tipoDetraccion)[0].CALCULO
                                            opDetraccion = importeTotal * (calculoDetraccion / 100);

                                            //if (parseFloat(suma.toFixed(2)) != parseFloat((parseFloat(importeTotal.toFixed(2)) - parseFloat(opDetraccion.toFixed(2))).toFixed(2))) {
                                            if (suma != (importeTotal - opDetraccion)) {
                                                //fnObtenerAlerta('La suma de las cuotas y el total no coinciden');
                                                //return false;
                                            }

                                        }
                                    }
                                }

                                if ($('#divTblCuotas')[0].children.length > 0) {
                                    var primeraFila = $(tblCuotas).jqxGrid('getrows')[0];
                                    var ultimaFila = $(tblCuotas).jqxGrid('getrows')[$(tblCuotas).jqxGrid('getrows').length - 1];
                                    if (ultimaFila['FECHA_VENCIMIENTO'] != $('#FECHA_VENCIMIENTO').val()) {
                                        fnObtenerAlerta('La fecha de vencimiento no debe ser diferente a la fecha de la última cuota');
                                        guardar = false;
                                        return;
                                    }

                                    var _fechaVencimiento = primeraFila['FECHA_VENCIMIENTO'].split('/');
                                    var _fechaEmision = $('#FECHAEMISION').val().split('/');
                                    var fechaVenMoment = moment(new Date(_fechaVencimiento[2], parseFloat(_fechaVencimiento[1]) - 1, _fechaVencimiento[0]));
                                    var fechaEmiMoment = moment(new Date(_fechaEmision[2], parseFloat(_fechaEmision[1]) - 1, _fechaEmision[0]));
                                    if (fechaVenMoment.diff(fechaEmiMoment,'days') < 1) {
                                        fnObtenerAlerta('La primera fecha de pago no debe ser diferente a la fecha de emisión del comprobante');
                                        guardar = false;
                                        return;
                                    }
                                }
                            }

                            if ($('#C_VENTA').val() == '') {
                                if ($('#C_PARAMETRO_GENERAL_TIPO_DOCUMENTO').val() == '' || $('#C_PARAMETRO_GENERAL_TIPO_DOCUMENTO').val() == null) {
                                    fnObtenerAlerta('Por favor seleccione el tipo de documento.')
                                }
                                else if (/*$('#CORREO_ELECTRONICO').val() == '' || */$('#NOMBRE').val() == '' || $('#RUC').val() == '') {
                                    //if ($('#CORREO_ELECTRONICO').val() == '') {
                                    //    fnObtenerAlerta('Por favor complete el correo del cliente.');
                                    //}
                                    //else
                                    if ($('#NOMBRE').val() == '') {
                                        fnObtenerAlerta('Por favor complete el nombre del cliente.');
                                    }
                                    else if ($('#RUC').val() == '') {
                                        fnObtenerAlerta('Por favor complete el ruc del cliente.');
                                    }
                                }
                                else if ($('#C_PARAMETRO_GENERAL_MONEDA').val() == '' || $('#C_PARAMETRO_GENERAL_MONEDA').val() == null) {
                                    fnObtenerAlerta('Por favor seleccione la moneda.');
                                }
                                //else if (
                                //    ($('#NRO_DOC_REF').val().length == 0) || ($('#NRO_DOC_REF').val().length == 0 && ($('#serie').val() == '' || $('#serie').val() == null))
                                //) {
                                //    fnObtenerAlerta('Por favor seleccione la serie.');
                                //}
                                else if ($(tblProductos).jqxGrid('getrows').length == 0) {
                                    fnObtenerAlerta('Por favor agregue productos al detalle.');
                                }
                                else {
                                    if (notaCredito != '' || $('#C_PARAMETRO_GENERAL_TIPO_DOCUMENTO').val() == '07241') {
                                        if ($('#TIPO_NOTA_CREDITO').val() == '') {
                                            fnObtenerAlerta('Por favor seleccione el tipo de nota de crédito.');
                                        }
                                        else if ($('#MOTIVO_NOTA_CREDITO').val() == '') {
                                            fnObtenerAlerta('Por favor rellene los motivo de la nota de crédito.');
                                        }
                                        else {

                                            guardar = true;

                                            //alertify.confirm('Mensaje del sistema', '¿Seguro de guardar el comprobante?',
                                            //    function () {
                                            //        fnGuardar();
                                            //    },
                                            //    function () {
                                            //        alertify.error('Operación cancelada');
                                            //        //$('#btnGuardar').attr('disabled', false)
                                            //    }
                                            //).set('labels', { ok: 'Si', cancel: 'No' }).set('defaultFocus', 'ok').set('closable', false);

                                        }
                                    }
                                    else if (notaDebito != '' || $('#C_PARAMETRO_GENERAL_TIPO_DOCUMENTO').val() == '07242') {
                                        if ($('#TIPO_NOTA_DEBITO').val() == '') {
                                            fnObtenerAlerta('Por favor seleccione el tipo de nota de débito.');
                                        }
                                        else if ($('#MOTIVO_NOTA_DEBITO').val() == '') {
                                            fnObtenerAlerta('Por favor rellene los motivo de la nota de débito.');
                                        }
                                        else {

                                            guardar = true;

                                            //alertify.confirm('Mensaje del sistema', '¿Seguro de guardar el comprobante?',
                                            //    function () {
                                            //        fnGuardar();
                                            //    },
                                            //    function () {
                                            //        alertify.error('Operación cancelada');
                                            //    }
                                            //).set('labels', { ok: 'Si', cancel: 'No' }).set('defaultFocus', 'ok').set('closable', false);

                                        }
                                    }
                                    else {

                                        guardar = true;

                                        //alertify.confirm('Mensaje del sistema', '¿Seguro de guardar el comprobante?',
                                        //    function () {
                                        //        fnGuardar();
                                        //    },
                                        //    function () {
                                        //        alertify.error('Operación cancelada');
                                        //        //$('#btnGuardar').attr('disabled', false)
                                        //    }
                                        //).set('labels', { ok: 'Si', cancel: 'No' }).set('defaultFocus', 'ok').set('closable', false);

                                    }
                                }
                            }
                            else {
                                if ($('#C_PARAMETRO_GENERAL_TIPO_DOCUMENTO').val() == '') {
                                    fnObtenerAlerta('Por favor seleccione el tipo de documento.')
                                }
                                else if (/*$('#CORREO_ELECTRONICO').val() == '' || */$('#NOMBRE').val() == '' || $('#RUC').val() == '') {
                                    fnObtenerAlerta('Por favor complete la información del cliente.');
                                }
                                else {
                                    if (notaCredito != '' || $('#C_PARAMETRO_GENERAL_TIPO_DOCUMENTO').val() == '07241') {
                                        if ($('#TIPO_NOTA_CREDITO').val() == '') {
                                            fnObtenerAlerta('Por favor seleccione el tipo de nota de crédito.');
                                        }
                                        else if ($('#MOTIVO_NOTA_CREDITO').val() == '') {
                                            fnObtenerAlerta('Por favor rellene los motivo de la nota de crédito.');
                                        }
                                        else {

                                            guardar = true;

                                            //alertify.confirm('Mensaje del sistema', '¿Seguro de guardar el comprobante?',
                                            //    function () {
                                            //        fnGuardar();
                                            //    },
                                            //    function () {
                                            //        alertify.error('Operación cancelada');
                                            //        //$('#btnGuardar').attr('disabled', false)
                                            //    }
                                            //).set('labels', { ok: 'Si', cancel: 'No' }).set('defaultFocus', 'ok').set('closable', false);
                                        }
                                    }
                                    else if (notaDebito != '' || $('#C_PARAMETRO_GENERAL_TIPO_DOCUMENTO').val() == '07242') {
                                        if ($('#TIPO_NOTA_DEBITO').val() == '') {
                                            fnObtenerAlerta('Por favor seleccione el tipo de nota de débito.');
                                        }
                                        else if ($('#MOTIVO_NOTA_DEBITO').val() == '') {
                                            fnObtenerAlerta('Por favor rellene los motivo de la nota de débito.');
                                        }
                                        else {

                                            guardar = true;

                                            //alertify.confirm('Mensaje del sistema', '¿Seguro de guardar el comprobante?',
                                            //    function () {
                                            //        fnGuardar();
                                            //    },
                                            //    function () {
                                            //        alertify.error('Operación cancelada');
                                            //        //$('#btnGuardar').attr('disabled', false)
                                            //    }
                                            //).set('labels', { ok: 'Si', cancel: 'No' }).set('defaultFocus', 'ok').set('closable', false);
                                        }
                                    }
                                    else {

                                        guardar = true;

                                        //alertify.confirm('Mensaje del sistema', '¿Seguro de guardar el comprobante?',
                                        //    function () {
                                        //        fnGuardar();
                                        //    },
                                        //    function () {
                                        //        alertify.error('Operación cancelada');
                                        //        //$('#btnGuardar').attr('disabled', false)
                                        //    }
                                        //).set('labels', { ok: 'Si', cancel: 'No' }).set('defaultFocus', 'ok').set('closable', false);
                                    }
                                }
                            };

                            //validamos si debemos grabar
                            if (guardar) {
                                if (vistaprevia == '*') {
                                    fnGuardar();
                                } else {
                                    alertify.confirm('Mensaje del sistema', '¿Seguro de guardar el comprobante?',
                                        function () {
                                            fnGuardar();
                                        },
                                        function () {
                                            alertify.error('Operación cancelada');
                                            //$('#btnGuardar').attr('disabled', false)
                                        }
                                    ).set('labels', { ok: 'Si', cancel: 'No' }).set('defaultFocus', 'ok').set('closable', false);
                                };
                            };

                        }
                        else {
                            fnObtenerAlerta('La fecha de vencimiento no puede ser menor a la fecha de emisión')
                        }
                    }
                })
            };

            fnValidar();
        };

        // Validar configuración
        const fnValidarConfiguracion = function () {
            $.GetQuery({
                query: ['q_gbl_validar_configuracion'],
                items: [{
                    C_EMPRESA: empresa,
                    VENTANA: 'VENTAS'
                }],
                onError: function (error) {
                    $.CloseStatusBar();
                    $.ShowError({ error });
                },
                onReady: function (result) {

                    var validacion = result[0].MENSAJE;

                    if (validacion == 'TIPO_DOC') {
                        alertify.alert('Mensaje del sistema', 'No se definido ningún tipo de documento. Por favor crearlos en configuración (Establecimientos y series).', function () {
                            document.location = $.solver.baseUrl + '/Mantenimiento/Configuraciones';
                        });
                    };

                    if (validacion == 'PRODUCTO') {
                        alertify.alert('Mensaje del sistema', 'No se ha creado ningún producto/servicio. Por favor crearlos.', function () {
                            document.location = $.solver.baseUrl + '/Mantenimiento/Productos';
                        });
                    };

                }
            });
        };

        // Asignacion de Fechas 
        $("#FECHAEMISION, #FECHA_VENCIMIENTO").datetimepicker({
            format: 'DD/MM/YYYY',
            locale: 'es'
        });
        $('#FECHAEMISION').datetimepicker('minDate', moment(new Date(fechaActual[2], parseFloat(fechaActual[1]) - 1, fechaActual[0])).subtract(7, 'days'));
        $('#FECHA_VENCIMIENTO').datetimepicker('minDate', moment(new Date(fechaActual[2], parseFloat(fechaActual[1]) - 1, fechaActual[0])).subtract(7, 'days'));
        $('#FECHAEMISION').datetimepicker('maxDate', moment(new Date(fechaActual[2], parseFloat(fechaActual[1]) - 1, fechaActual[0])));

        // Formulario
        $('form[name=frmVenta]').ValidForm({
            type: -1,
            onDone: function (form, controls) {

                $('.number-input').on('input', function () {
                    this.value = this.value.replace(/[^0-9]/g, '');
                });

                fnValidarConfiguracion();

                $('#C_ESTABLECIMIENTO').change(function () {

                    //setTimeout(function () {
                    //    fnObtenerDatosEmpresa();
                    //}, 250);

                    $('#C_PARAMETRO_GENERAL_TIPO_DOCUMENTO').attr('data-C_ESTABLECIMIENTO', $('#C_ESTABLECIMIENTO').val());
                    $('#C_PARAMETRO_GENERAL_TIPO_DOCUMENTO').FieldLoadRemote({
                        onReady: function () {
                            var c_tipo_doc = $('#TIPO_DOC_CLIENTE').val();
                            if (c_tipo_doc != '') {
                                if (c_tipo_doc == '00017' || c_tipo_doc == '09900') {
                                    //$('#C_PARAMETRO_GENERAL_TIPO_DOCUMENTO').trigger('change');
                                    $('#C_PARAMETRO_GENERAL_TIPO_DOCUMENTO').attr('disabled', false);
                                }
                                else if (c_tipo_doc == '00013') {
                                    $('#C_PARAMETRO_GENERAL_TIPO_DOCUMENTO').val('07237').trigger('change');
                                    $('#C_PARAMETRO_GENERAL_TIPO_DOCUMENTO').attr('disabled', 'disabled');
                                }
                                else {
                                    $('#C_PARAMETRO_GENERAL_TIPO_DOCUMENTO').val('07237').trigger('change');
                                    $('#C_PARAMETRO_GENERAL_TIPO_DOCUMENTO').attr('disabled', 'disabled');
                                }
                            }
                            $('#C_PARAMETRO_GENERAL_TIPO_DOCUMENTO').trigger('change');
                        }
                    });
                });

                $('#C_PARAMETRO_GENERAL_TIPO_DOCUMENTO').attr('data-C_ESTABLECIMIENTO', $('#C_ESTABLECIMIENTO').val());
                $('#C_PARAMETRO_GENERAL_TIPO_DOCUMENTO').FieldLoadRemote({
                    onReady: function () {
                        
                        $('#serie').attr('data-C_ESTABLECIMIENTO', $('#C_ESTABLECIMIENTO').val());
                        $('#serie').attr('data-C_TIPO_DOC', $('#C_PARAMETRO_GENERAL_TIPO_DOCUMENTO').val() == null ? '' : $('#C_PARAMETRO_GENERAL_TIPO_DOCUMENTO').val());
                        $('#serie').FieldLoadRemote({
                            onReady: function () {

                                if (notaCredito == '*') {
                                    $('#bloque_nota_credito').show();
                                }
                                else $('#bloque_nota_credito').hide();
                                if (notaDebito == '*') {
                                    $('#bloque_nota_debito').show();
                                }
                                else $('#bloque_nota_debito').hide();

                                fnObtenerDatosEmpresa(function () {
                                    fnObtenerDatosCabecera();
                                    fnObtenerDatosDespacho();
                                });

                                fnCrearTabla();

                                if ($('#C_VENTA').val() == '' && notaCredito == '') {
                                    fnObtenerTipoCambio();
                                };

                                $('#FECHAEMISION').on('dp.change', function (e) {
                                    if ($('#FORMA_PAGO').val() == '09912') {
                                        var fecha = $('#FECHAEMISION').val();
                                        $('#FECHA_VENCIMIENTO').val(fecha);
                                    };
                                    fnObtenerTipoCambio();
                                });

                                $('#C_PARAMETRO_GENERAL_TIPO_DOCUMENTO').change(function () {

                                    $('#bloque_nota_credito').hide();
                                    $('#bloque_nota_debito').hide();
                                    $('.bloque-nota-credito-debito').hide();
                                    $('.fecha_venc').show();

                                    var tipoDoc = $(this).val();
                                    var codtipoDoc = $('#C_PARAMETRO_GENERAL_TIPO_DOCUMENTO').val();

                                    if (tipoDoc == '07237') {
                                        $('#FORMA_PAGO').val('09912').trigger('change').attr('disabled', 'disabled');
                                    }
                                    else if (tipoDoc == '07241') {
                                        $('#TIPO_OPERACION').val('07382').trigger('change');
                                        $('#guiaremision').hide();
                                        $('#bloque_nota_credito').show();
                                        $('.bloque-nota-credito-debito').show();
                                        $('#bloque_venta').hide();
                                        codtipoDoc = $('#TIPO_DOC_REF').val();
                                        $('.fecha_venc').hide();
                                    }
                                    else if (tipoDoc == '07242') {
                                        $('#TIPO_OPERACION').val('07382').trigger('change');
                                        $('#guiaremision').hide();
                                        $('#bloque_nota_debito').show();
                                        $('.bloque-nota-credito-debito').show();
                                        $('#bloque_venta').hide();
                                        codtipoDoc = $('#TIPO_DOC_REF').val();
                                        $('.fecha_venc').hide();
                                    }
                                    else {
                                        $('#FORMA_PAGO').val('09912').trigger('change').removeAttr('disabled');
                                    };

                                    $('#serie').attr('data-C_ESTABLECIMIENTO', $('#C_ESTABLECIMIENTO').val());
                                    $('#serie').attr('data-C_TIPO_DOC', codtipoDoc);
                                    $('#serie').FieldLoadRemote({
                                        onReady: function () {

                                            var tipoDoc = $('#C_PARAMETRO_GENERAL_TIPO_DOCUMENTO').val();

                                            if (tipoDoc == '07236' || tipoDoc == '07237') {
                                                $('.bloque_orden_compra').show();
                                                if (tipoDoc == '07236') {
                                                    var serie = $('#serie').val();
                                                    if (serie != '' && serie != null) {
                                                        serie = serie.substring(1, 4);
                                                        $('#serie').val('F' + serie).trigger('change');
                                                    }
                                                }
                                                else {
                                                    var serie = $('#serie').val();
                                                    if (serie != '' && serie != null) {
                                                        serie = serie.substring(1, 4);
                                                        $('#serie').val('B' + serie).trigger('change');
                                                    }
                                                }
                                            } else {
                                                $('.bloque_orden_compra').hide();
                                            };

                                        }
                                    })

                                });

                            }
                        });
                    }
                });

                $('#NRO_DOC_REF').inputmask("****-99999999", { "placeholder": "####-########" });
                $('#NRO_DOC_REF').change(function () {
                    // validamos que el nro doc ref tenga un formato correcto
                    var nro = $('#NRO_DOC_REF').val();
                    var partes = $.trim(nro.replace(new RegExp('#', 'g'), ' ')).split('-')
                    var serie = $.trim(partes[0]);
                    var nroComprobante = $.trim(partes[1]);

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

                    $('#NRO_DOC_REF').val((serie + '-' + nroComprobante).toUpperCase())

                });

                $('#TIPO_DOC_REF').change(function () {
                    $('#C_PARAMETRO_GENERAL_TIPO_DOCUMENTO').trigger('change')
                });

                //if ($.solver.basePath == '/restaurant') {
                $('.restaurant').show();
                //};

            },
            onError: function (error) {
                $.CloseStatusBar();
                $.ShowError({ error: error });
            }
        });

        // Eventos
        $('#TIPO_NOTA_CREDITO').change(function () {
            if ($(this).val() == '09985' && $('#FORMA_PAGO').val() == '09913') {
                alertify.confirm('Mensaje del sistema', 'Esta operación afecta los precios del detalle. <br /> ¿Desea continuar?',
                    function () {
                        $('.zone-cuotas').show();
                        fnCrearTablaCuotas();
                        $.each($(tblProductos).jqxGrid('getrows'), function (indice, v) {
                            var cantidad = $(tblProductos).jqxGrid('getrows')[indice]['CANTIDAD'];
                            var precio = 0;

                            const baseImponible = precio * cantidad;
                            const incluyeIgv = $(tblProductos).jqxGrid('getrows')[indice]['INCLUYE_IGV'];
                            const porcDescuento = $(tblProductos).jqxGrid('getrows')[indice]['PORC_DSCTO'];
                            const afectacion_igv = $(tblProductos).jqxGrid('getrows')[indice]['AFECTACION_IGV']

                            var valorUnitario = 0;
                            var codigoAfectacionIgv = $(tblProductos).jqxGrid('getrows')[indice]['CODIGO_AFECTACION_IGV']
                            var codigoAfectacionIgvCab = $(tblProductos).jqxGrid('getrows')[indice]['CODIGO_AFECTACION_IGV_CABECERA']
                            if (incluyeIgv == 'true' && codigoAfectacionIgv == '01') valorUnitario = precio / (1 + porcIgv);
                            else valorUnitario = precio;

                            const dsctoUnitario = valorUnitario * (porcDescuento / 100);
                            const valorVentaUnitario = valorUnitario - dsctoUnitario;
                            var igvUnitario = 0;
                            if (codigoAfectacionIgv == '01') igvUnitario = valorVentaUnitario * porcIgv;
                            else igvUnitario = 0;

                            var dsctoUnitarioIgv = 0;
                            if (codigoAfectacionIgv == '01') dsctoUnitarioIgv = dsctoUnitario * porcIgv;
                            else dsctoUnitarioIgv = 0;

                            const precioBase = valorVentaUnitario * cantidad;
                            const igv = igvUnitario * cantidad;
                            const precioTotal = igv + precioBase;
                            const dsctoParcial = (dsctoUnitario + dsctoUnitarioIgv) * cantidad;

                            $(tblProductos).jqxGrid('getrows')[indice]['PRECIO'] = precio;
                            $(tblProductos).jqxGrid('getrows')[indice]['BASE_IMPONIBLE'] = baseImponible;
                            $(tblProductos).jqxGrid('getrows')[indice]['VALOR_UNITARIO'] = valorUnitario;
                            $(tblProductos).jqxGrid('getrows')[indice]['PORC_DSCTO'] = porcDescuento;
                            $(tblProductos).jqxGrid('getrows')[indice]['DSCTO_UNITARIO'] = dsctoUnitario;
                            $(tblProductos).jqxGrid('getrows')[indice]['VALOR_VENTA_UNITARIO'] = valorVentaUnitario;
                            $(tblProductos).jqxGrid('getrows')[indice]['IGV_UNITARIO'] = igvUnitario;
                            $(tblProductos).jqxGrid('getrows')[indice]['PRECIO_BASE'] = precioBase;
                            $(tblProductos).jqxGrid('getrows')[indice]['IGV'] = igv;
                            $(tblProductos).jqxGrid('getrows')[indice]['PRECIO_TOTAL'] = precioTotal;
                            $(tblProductos).jqxGrid('getrows')[indice]['DSCTO_PARCIAL'] = dsctoParcial;
                            $(tblProductos).jqxGrid('getrows')[indice]['DSCTO_UNITARIO_IGV'] = dsctoUnitarioIgv;
                        });
                        $(tblProductos).jqxGrid('refresh');
                        fnCalcularTotales();
                    },
                    null).set('labels', { ok: 'Si', cancel: 'No' }).set('defaultFocus', 'ok').set('closable', false);
                $('#MOTIVO_NOTA_CREDITO').focus();
            }
            else {
                $('#MOTIVO_NOTA_CREDITO').focus();
                $('.zone-cuotas').hide();
            }

        });
        $('#RUC').keyup(function (event) {
            if (event.keyCode == 32) {
                event.preventDefault();
            }
            if ((event.keyCode <= 90 && event.keyCode >= 48) || (event.keyCode <= 96 && event.keyCode >= 105) || event.keyCode == 8) {
                $('#C_CLIENTE').val('');
                $('#NOMBRE').val('');
                $('#DIRECCION').val('');
                $('#CORREO_ELECTRONICO').val('');
                $('#DEPARTAMENTO').val('');
                $('#PROVINCIA').val('');
                $('#DISTRITO').val('');
                $('#DIRECCION').removeAttr('readonly')
                $('#CORREO_ELECTRONICO').removeAttr('readonly')
            }
        });
        $('#RUC').keypress(function (event) {
            var keycode = (event.keyCode ? event.keyCode : event.which);
            if (keycode == 13) {
                if ($(this).val().length == 8 || $(this).val().length == 11) {
                    $.GetQuery({
                        query: ['q_ventas_procesos_nuevaventa_obtenercliente'],
                        items: [{
                            DOCUMENTO: function () {
                                return $('#RUC').val();
                            },
                            C_EMPRESA: empresa
                        }],
                        onBefore: function () {
                            $.DisplayStatusBar({ message: 'Buscando cliente...' })
                        },
                        onError: function (error) {
                            $.CloseStatusBar();
                            $.ShowError({ error: error });
                        },
                        onReady: function (result) {
                            $.CloseStatusBar();
                            if (result.length > 0) {
                                const data = result[0];
                                $('#C_CLIENTE').val(data.C_CLIENTE);
                                $('#NOMBRE').val(data.RAZON_SOCIAL);
                                $('#DIRECCION').val(data.DIRECCION_FISCAL);
                                $('#CORREO_ELECTRONICO').val(data.CORREO_FACTURACION);
                                $('#NOMBRE').attr('readonly', 'readonly')
                                $('#DIRECCION').attr('readonly', 'readonly')
                            }
                            else {
                                alertify.confirm('Mensaje del sistema', '¿Desea crear nuevo cliente?',
                                    function () {
                                        $('#NOMBRE').removeAttr('readonly');
                                        $('#DIRECCION').removeAttr('readonly');
                                        $('#CORREO_ELECTRONICO').removeAttr('readonly');

                                        if ($('#RUC').val().length == 8) {
                                            $.GetQuery({
                                                query: ['q_ventas_mantenimiento_clientes_obtenerpadron_dni'],
                                                items: [{
                                                    DNI: function () {
                                                        return $('#RUC').val();
                                                    }
                                                }],
                                                onBefore: function () {
                                                    $.DisplayStatusBar({ message: 'Buscando dni ...' })
                                                },
                                                onError: function (error) {
                                                    $.CloseStatusBar();
                                                    $.ShowError({ error: error });
                                                },
                                                onReady: function (result) {
                                                    $.CloseStatusBar();
                                                    if (result.length > 0) {
                                                        alertify.success('DNI encontrado.');
                                                        $('#NOMBRE').val(result[0].RAZON_SOCIAL);
                                                        $('#DIRECCION').val(result[0].DIRECCION);
                                                        $('#CORREO_ELECTRONICO').val('');
                                                        if (result[0].DEPARTAMENTO != null) $('#DEPARTAMENTO').val(result[0].DEPARTAMENTO);
                                                        if (result[0].PROVINCIA != null) $('#PROVINCIA').val(result[0].PROVINCIA);
                                                        if (result[0].DISTRITO != null) $('#DISTRITO').val(result[0].DISTRITO);
                                                    }
                                                    else {
                                                        alertify.error('DNI no encontrado.');
                                                        $('#NOMBRE').val('')
                                                        $('#DIRECCION').val('')
                                                        $('#CORREO_ELECTRONICO').val('');
                                                        $('#DEPARTAMENTO').val('')
                                                        $('#PROVINCIA').val('')
                                                        $('#DISTRITO').val('')
                                                    }
                                                }
                                            });
                                        }
                                        else if ($('#RUC').val().length == 11) {
                                            $.GetQuery({
                                                query: ['q_ventas_mantenimiento_clientes_obtenerpadron_ruc'],
                                                items: [{
                                                    RUC: function () {
                                                        return $('#RUC').val();
                                                    }
                                                }],
                                                onBefore: function () {
                                                    $.DisplayStatusBar({ message: 'Buscando RUC ...' })
                                                },
                                                onError: function (error) {
                                                    $.CloseStatusBar();
                                                    $.ShowError({ error: error });
                                                },
                                                onReady: function (result) {
                                                    $.CloseStatusBar();
                                                    if (result.length > 0) {
                                                        alertify.success('RUC encontrado.');
                                                        $('#NOMBRE').val(result[0].RAZON_SOCIAL);
                                                        $('#DIRECCION').val(result[0].DIRECCION);
                                                        $('#CORREO_ELECTRONICO').val(result[0].CORREO_FACTURACION);
                                                        if (result[0].DEPARTAMENTO != null) $('#DEPARTAMENTO').val(result[0].DEPARTAMENTO);
                                                        if (result[0].PROVINCIA != null) $('#PROVINCIA').val(result[0].PROVINCIA);
                                                        if (result[0].DISTRITO != null) $('#DISTRITO').val(result[0].DISTRITO);
                                                    }
                                                    else {
                                                        alertify.error('RUC no encontrado.');
                                                        $('#NOMBRE').val('')
                                                        $('#DIRECCION').val('')
                                                        $('#CORREO_ELECTRONICO').val('');
                                                        $('#DEPARTAMENTO').val('')
                                                        $('#PROVINCIA').val('')
                                                        $('#DISTRITO').val('')
                                                    }
                                                }
                                            });
                                        }
                                    },
                                    null
                                ).set('labels', { ok: 'Si', cancel: 'No' }).set('defaultFocus', 'ok').set('closable', false);
                            }
                        }
                    });
                }
                else {
                    $('#NOMBRE').val('');
                    $('#DIRECCION').val('');
                    $('#C_CLIENTE').val('');
                    $('#CORREO_ELECTRONICO').val('');
                    $('#DEPARTAMENTO').val('')
                    $('#PROVINCIA').val('')
                    $('#DISTRITO').val('')
                }
            }
        });
        $('#C_PARAMETRO_GENERAL_MONEDA').change(function (e) {
            fnCalcularTotales();
        });
        $('#FORMA_PAGO').change(function () {
            var formaPago = $('#FORMA_PAGO').val();
            if (formaPago == '09913' && ($('#C_PARAMETRO_GENERAL_TIPO_DOCUMENTO').val() == '07236' && notaCredito == '') || ($('#C_PARAMETRO_GENERAL_TIPO_DOCUMENTO').val() == '07241' && $('#TIPO_NOTA_CREDITO').val() == '09985')) {
                $('.zone-cuotas').show();
                fnCrearTablaCuotas();
                $('#FECHA_VENCIMIENTO').removeAttr('disabled');
            }
            else {
                $('.zone-cuotas').hide();
                $('#NRO_CUOTAS').val('')
                $('#FECHA_VENCIMIENTO').attr('disabled', 'disabled');
                $('#FECHA_VENCIMIENTO').val($('#FECHAEMISION').val()).trigger('change');
            }

            var fechaEmision = $('#FECHAEMISION').val().split('/')
            if (formaPago == '09913') {
                $('#FECHA_VENCIMIENTO').datetimepicker('minDate', moment(new Date(fechaEmision[2], parseFloat(fechaEmision[1]) - 1, fechaEmision[0])).subtract(-1, 'days'));
                if (dataVenta['FECHA_VENCIMIENTO'] != '') {
                    $('#FECHA_VENCIMIENTO').val(dataVenta['FECHA_VENCIMIENTO']);
                }
            }
            else {
                $('#FECHA_VENCIMIENTO').val($('#FECHAEMISION').val())
            }
        });
        $('#TIPO_OPERACION').change(function () {
            if ($('#TIPO_OPERACION').val() == '07400') $('.bloque-tipodetraccion').show();
            else $('.bloque-tipodetraccion').hide();

            if ($('#TIPO_OPERACION').val() == '07382' || $('#TIPO_OPERACION').val() == '07400') {
                $('#buscarAnticipos').show()
            }
            else {
                $('#buscarAnticipos').hide()
                $.each(anticipos, function (i, v) {
                    if (v.C_DETALLE != '') {
                        arrAnticiposEliminados.push({
                            C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                            C_VENTA: v.C_VENTA,
                            C_DETALLE: v.C_DETALLE
                        })
                    }
                })
                anticipos = [];
                fnValidarMostrarAnticipos();
            }

            setTimeout(function () {
                if ($('#IND_ESTADO_VENTA').val() != 'A' && !primeraVezOperacion) {
                    if ($('#divTblCuotas')[0].children.length > 0) {
                        $('#NRO_CUOTAS').val('');
                        $(tblCuotas).jqxGrid('clear');
                    }
                }
                primeraVezOperacion = false;
                fnCalcularTotales();
            }, 250);
        });
        $('#TIPO_DETRACCION').change(function () {
            setTimeout(function () {
                if ($('#IND_ESTADO_VENTA').val() != 'A' && !primeraVezDetraccion) {
                    if ($('#divTblCuotas')[0].children.length > 0) {
                        $('#NRO_CUOTAS').val('');
                        $(tblCuotas).jqxGrid('clear');
                    }
                }
                primeraVezDetraccion = false
                fnCalcularTotales();
            }, 250)
        });

        // Botones
        $('#btnGuardar').click(function (e) {

            // Si se aprieta el botón guardar no se genera vista previa
            actionGuardar('&');
            e.preventDefault();

        });
        $('#btnBusquedaProducto').click(function (e) {
            $('#btnBusquedaProducto').attr('disabled', true)
            buscarProductos();
            e.preventDefault();
        });
        $('#btnCliente').click(function (e) {
            $('#btnCliente').attr('disabled', true)
            buscarCliente();
            e.preventDefault();
        });
        $('#btnBuscarExportacion').click(function () {
            if (!estadoProducto) {
                estadoProducto = true;
                fnBuscarExportacion();
            }
        });
        $('#btnAplicarCuotas').click(function () {
            fnAplicarCuotas();
        });
        $('#btnBuscarDespachos').click(function () {
            if (!estadoProducto) {
                estadoProducto = true;

                if ($('#C_CLIENTE').val() == '') {
                    alertify.warning('Por favor seleccione al cliente')
                    estadoProducto = false;
                    return;
                }

                fnBuscarDespachos();
            }
        });
        $('#btnVistaPrevia').click(function () {

            // Si se aprieta el botón vista previa se guardan todos los datos con el estado B
            // Si el documento no tiene nro de documento se pone automaticamente 0
            actionGuardar('*');

        });
        $('#buscarAnticipos').click(function () {
            $.solver.fn.fnAbrirModal({
                onEscape: true,
                query: 'tbl_ventas_procesos_nuevaventa_obteneranticipos',
                items: {
                    C_CLIENTE: function () {
                        return $('#C_CLIENTE').val()
                    },
                    C_VENTA: function () {
                        return $('#C_VENTA').val()
                    }
                },
                hiddens: ['C_VENTA', 'COD_TIPO', 'DESCRIPCION'],
                columns: {
                    TIPO: {
                        text: 'Tipo',
                        width: 100,
                    },
                    NRO_COMPROBANTE: {
                        text: 'Nro comprobante',
                        width: 120
                    },
                    FECHA_EMISION: {
                        text: 'Fecha emisión',
                        cellsAlign: 'center',
                        width: 100
                    },
                    MONEDA: {
                        text: 'Moneda',
                        width: 100
                    },
                    BASE_IMPONIBLE: {
                        text: 'Monto base',
                        cellsFormat: 'd2',
                        cellsAlign: 'right',
                        width: 80
                    },
                    IGV: {
                        text: 'Igv',
                        cellsFormat: 'd2',
                        cellsAlign: 'right',
                        width: 80
                    },
                    RECARGO_CONSUMO_TOTAL: {
                        text: 'Rc',
                        cellsFormat: 'd2',
                        cellsAlign: 'right',
                        width: 80
                    },
                    TOTAL: {
                        text: 'Total',
                        cellsFormat: 'd2',
                        cellsAlign: 'right',
                        width: 80
                    }
                },
                config: {
                    virtualmode: false,
                    height: 600,
                    pageSize: 100,
                    pageable: false,
                    sortable: false,
                    editable: false,
                    selectionMode: 'checkbox',
                },
                controlsAfter: {
                    procesar: {
                        class: 'col-auto',
                        html: `<button id="btnProcesar" type="button" class="btn btn-sm btn-danger"><i class="fa fa-floppy-o" aria-hidden="true"></i> Aceptar</button>`
                    }
                },
                onReady: function (form, controls, formToken, dialog) {
                    $(form).find('#btnProcesar').click(function () {
                        var getselectedrowindexes = $(`#${formToken}_table`).jqxGrid('getselectedrowindexes');

                        $.each(anticipos, function (i, v) {
                            if (v.C_DETALLE != '') {
                                arrAnticiposEliminados.push({
                                    C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                                    C_VENTA: v.C_VENTA,
                                    C_DETALLE: v.C_DETALLE
                                })
                            }
                        })

                        anticipos = [];
                        $.each(getselectedrowindexes, function (i, v) {
                            const row = $(`#${formToken}_table`).jqxGrid('getrows')[v];

                            anticipos.push({
                                C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                                C_VENTA: $('#C_VENTA').val(),
                                C_DETALLE: '',
                                C_VENTA_REF: row.C_VENTA,
                                FECHA_EMISION: row.FECHA_EMISION,
                                NUMERO: row.NRO_COMPROBANTE,
                                COD_TIPO: row.COD_TIPO,
                                TIPO: row.TIPO,
                                MONEDA: row.MONEDA,
                                BASE: row.BASE_IMPONIBLE,
                                IGV: row.IGV,
                                RC: row.RECARGO_CONSUMO_TOTAL,
                                TOTAL: row.TOTAL,
                                DESCRIPCION: row.DESCRIPCION,
                                IND_ESTADO: '*'
                            })
                        })
                        $(dialog).modal('hide')
                        fnValidarMostrarAnticipos();
                    })
                }
            })
        })
        $('#PORC_IGV').change(function () {
            $('#porcIgv').text($('#PORC_IGV').val() + '%')
            fnRecalcularMontos(function () {
                fnCalcularTotales();
            })
        })
        $('#PORC_RC').change(function () {
            fnRecalcularMontos(function () {
                fnCalcularTotales();
            })
        })
    });
});