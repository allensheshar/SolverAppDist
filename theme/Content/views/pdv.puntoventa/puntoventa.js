require(["helper", "extras", "datetimepicker", "idle", "keyboard.es", "bootstrap-select"], function () {
    require(["alertify", "bootbox", "moment", "inputmask", "numeral", "sweetalert"], function (alertify, bootbox, moment, inputmask, numeral, Swal) {

        alertify.set('notifier', 'position', 'top-center');

        let objBotones = {};
        let objPedido = {
            platos: []
        };
        let objMesa = [];
        let objMyCaja = {};
        let metodoPagoArr = [];
        let lstCategorias = [];
        let lstSalones = [];
        let buttonState = false;
        let isAlert = false;
        let baulPedidos = [];
        let objPermisos = {};
        let startIdle = false;

        /* ALERTAS */
        const fnObtenerAlerta = function (message) {

            Swal.fire({
                icon: 'info',
                html: `<h3 class="text-center">${message}</h3>`,
                timer: 2500,
                confirmButtonText: 'Cerrar',
                timerProgressBar: true
            });

        };
        const fnObtenerAlertaError = function (message) {

            Swal.fire({
                icon: 'error',
                html: message,
                timer: 2500,
                confirmButtonText: 'Cerrar',
                timerProgressBar: true
            });

        }
        const fnObtenerAlertaOk = function (message) {

            Swal.fire({
                icon: 'success',
                html: `<h3 class="text-center">${message}</h3>`,
                timer: 2500,
                showConfirmButton: false,
                timerProgressBar: true
            });

        }
        const fnObtenerAlertaWarning = function (message) {

            Swal.fire({
                icon: 'warning',
                html: `<h3 class="text-center">${message}</h3>`,
                timer: 2500,
                timerProgressBar: true
            });

        }
        const fnObtenerAlertaConfirm = function (title, message, success, cancel) {

            Swal.fire({
                title: title,
                html: `<h3 class="text-center">${message}</h3>`,
                showDenyButton: true,
                denyButtonText: `No`,
                confirmButtonText: 'Si',
                showCancelButton: false,
                customClass: {
                    'confirmButton': 'btn-confirm-sweetalert',
                    'denyButton': 'btn-deny-sweetalert'
                },
                showCloseButton: true,
            }).then((result) => {
                if (result.isConfirmed) {
                    success()
                } else if (result.isDenied) {
                    cancel();
                }
            })

        }
        /* ALERTAS */

        /* ACCIONES */
        const fnActionNuevo = function () {

            objPedido = {
                platos: []
            };
            objMesa = [];
            isAlert = false;

            $('#buscarProducto').val('');
            $('#observaciones').val('');
            $('#NRO_PEDIDO').val('');
            $('#C_PEDIDO').val('');
            $('#nroPedido').html('NRO PEDIDO XXX' + fnObtenerNombreMesa());
            $('#IND_ESTADO').val('*');
            $('#PORCENTAJE_DESCUENTO_GLOBAL').val('');
            $('#COMENTARIO_DESCUENTO_GLOBAL').val('');
            $('#MOTIVO_CORTESIA').val('');
            $('.mytable-pedido').find('.box-info-pedido').removeClass('border-danger');

            // Delivery
            $('#IND_DELIVERY').val('')
            $('#C_CLIENTE_DELIVERY').val('')
            $('#TIPO_DOCUMENTO_DELIVERY').val('')
            $('#RUC_DELIVERY').val('')
            $('#NOMBRE_DELIVERY').val('')
            $('#DIRECCION_ENTREGA').val('')
            $('#REFERENCIA_ENTREGA').val('')
            $('#TELEFONO').val('')
            $('#METODO_PAGO_DELIVERY').val('')
            $('#TIPO_COMPROBANTE').val('')

            fnObtenerPlatos();

            buttonState = false;

        };
        const fnAplicarCambioMesero = function (usuario, codPedido, callback) {
            $.AddPetition({
                table: 'PDV.PEDIDO',
                type: 2,
                condition: `C_EMPRESA = '${$.solver.session.SESSION_EMPRESA}' AND C_PEDIDO = '${codPedido}'`,
                items: $.ConvertObjectToArr({
                    C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                    C_PEDIDO: codPedido,
                    C_USUARIO: usuario
                })
            });

            $.SendPetition({
                onReady: function () {
                    if (typeof callback == 'function') {
                        callback();
                        return;
                    };
                },
                onError: function (_error) {
                    $.CloseStatusBar();
                    $.ShowError({ error: _error });
                }
            });
        }
        const fnActionGuardar = function (accion, callback) {

            const c_pedido = $('#C_PEDIDO').val();
            let tokenPadre = fnAgregarPeticionesPedido(null, null, null, c_pedido, null);

            $.SendPetition({
                onReady: function (result) {
                    $.CloseStatusBar();

                    $('#C_PEDIDO').val(result[tokenPadre].items.C_PEDIDO);
                    $('#IND_ESTADO').val(result[tokenPadre].items.IND_ESTADO);
                    $('#NRO_PEDIDO').val(result[tokenPadre].items.NRO_PEDIDO);
                    $('#nroPedido').html(`NRO PEDIDO ${result[tokenPadre].items.NRO_PEDIDO}` + fnObtenerNombreMesa());

                    fnObtenerDatosCaja();
                    fnValidarBotones();

                    if (typeof callback == 'function') {
                        callback(result[tokenPadre]);
                    };

                    buttonState = false;
                },
                onBefore: function () {
                    $.DisplayStatusBar({ message: 'Guardando pedido' });
                },
                onError: function (_error) {
                    $.CloseStatusBar();
                    $.ShowError({ error: _error });
                }
            });

        };
        const fnActionAnular = function (c_pedido, table, estado_pedido) {

            const codTipoAnulacionDefecto = '10105'; //codigo de parametro general (anular todo el pedido)
            const fnAnular = function (dialog, tipo_anulacion, motivo_anulacion, estado_pedido) {
                const objectPedido = {
                    script: 'spw_puntoventa_procesos_puntoventa_anularpedido_v2',
                    C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                    C_PEDIDO: c_pedido,
                    C_USUARIO: $.solver.session.SESSION_ID,
                    TIPO_ANULACION: tipo_anulacion,
                    MOTIVO_ANULACION: motivo_anulacion,
                    ESTADO_PEDIDO: estado_pedido
                };
                $.AddPetition({
                    type: 4,
                    items: $.ConvertObjectToArr(objectPedido),
                    transaction: true
                });
                $.SendPetition({
                    onBefore: function () {
                        $.DisplayStatusBar({ message: 'Anulando pedido.' });
                    },
                    onReady: function () {

                        $.CloseStatusBar();
                        fnObtenerAlertaOk('Pedido anulado');

                        var estadoAnterior = $('#IND_ESTADO').val();
                        $('#IND_ESTADO').val('&');

                        if (typeof table == 'string') $(table).jqxGrid('updatebounddata');

                        //fnValidarBotones();
                        //fnObtenerDatosCaja();
                        fnImprimirDocumentoAnulado($.solver.session.SESSION_EMPRESA, c_pedido, estadoAnterior);

                        baulPedidos = JSON.parse('[]');
                        $('.mytable-pedido').html('');

                        fnMostrarPedidos();
                        fnObtenerDatosCaja();
                        fnActionNuevo();

                        if (dialog != undefined) {
                            $(dialog).modal('hide')
                        };

                    },
                    onError: function (_error) {
                        $.CloseStatusBar();
                        $.ShowError({ error: _error });
                    }
                });
            };
            const fnPedirLoginParaAnular = function () {

                var tokenLogin = $.CreateToken();
                let dialogLogin = bootbox.dialog({
                    title: 'Anulación de Pedidos',
                    message: `<div id="${tokenLogin}"></div>`,
                    className: 'modal-search-40',
                    onEscape: true,
                    centerVertical: true
                });

                dialogLogin.init(function () {
                    setTimeout(function () {

                        // Agregamos html inicial ${tokenLogin}
                        let _html = $('#zoneHtmlAnular').html();
                        _html = _html.replace("{empresa}", $.solver.session.SESSION_EMPRESA);
                        $(dialogLogin).find(`#${tokenLogin}`).html(_html);

                        // declaramos variables
                        let _controls = null;
                        const form = $(dialogLogin).find(`form[name=my_form]`);
                        let dataTipoAnulacion = null;

                        form.ValidForm({
                            type: -1,
                            onDone: function (xform, controls) {

                                _controls = controls;
                                $(controls.CLAVE).focus();

                                $(controls.tipo_anulacion)
                                    .attr({
                                        'data-query': 'gbl_obtener_parametro_general',
                                        'data-value': 'CODIGO',
                                        'data-field': 'DESCRIPCION',
                                        'data-tipoParametro': 'Tipo de Anulación PDV y REST',
                                        'data-enabledefault': '0'
                                    }).FieldLoadRemote({
                                        onReady: function (_control, _data) {
                                            dataTipoAnulacion = _data;
                                            if (estado_pedido == '*') {
                                                $(controls.tipo_anulacion).val(codTipoAnulacionDefecto).attr('readonly', 'readonly').css({ 'pointer-events': 'none' });
                                            };
                                        }
                                    });

                            },
                            onReady: function () {
                                $.GetQuery({
                                    query: ['q_puntoventa_validar_usuario'],
                                    items: [{
                                        C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                                        C_USUARIO: function () {
                                            return $(_controls.USUARIO).val()
                                        },
                                        CLAVE: function () {
                                            return $(_controls.CLAVE).val()
                                        }
                                    }],
                                    onReady: function (result) {
                                        if (result.length == 0) {
                                            fnObtenerAlertaWarning('Usuario o contraseña incorrecta')
                                        }
                                        else {

                                            //obtenemos el estado final del pedido
                                            var code = $(_controls.tipo_anulacion).val();
                                            var search = $.grep(dataTipoAnulacion, function (n, i) {
                                                return n.CODIGO == code;
                                            });

                                            //ejecutamos proceso de anulacion
                                            fnAnular(dialogLogin, code, $(_controls.motivo_anulacion).val(), search[0].CODIGO_PARAMETRO);

                                        }
                                    }
                                })
                            },
                            onError: function (error) {
                                $.CloseStatusBar();
                                $.ShowError({ error });
                            }
                        });

                    });
                });

                $('.bootbox .modal-dialog').draggable({
                    handle: '.modal-header'
                });
                $('.bootbox .modal-header').css('cursor', 'move');

                dialogLogin.on('hide.bs.modal', function () { buttonState = false; });

            };

            fnPedirLoginParaAnular();

        };
        const fnActionVer = function () {
            //var estado = $('#IND_ESTADO').val();
            //if (estado == '*' && objPedido.platos.length > 0) {
            //    fnActionGuardar('');
            //};

            const token = $.CreateToken();
            let dialog = bootbox.dialog({
                title: 'Ver pedidos',
                message: `<div id="${token}"></div>`,
                className: 'modal-search-95',
                onEscape: true,
                //centerVertical: true
            });
            const controls = {
                buscar: {
                    class: 'col',
                    html: '<input class="form-control form-control-lg" name="buscar" placeholder="Buscar pedido..." autocomplete="off"/>'
                },
                buttonUnirCuenta: {
                    class: 'col-auto',
                    html: `<button type="button" class="btn btn-lg btn-dividir btn-secondary"><i class="fa fa-files-o" aria-hidden="true"></i> Unir Cuentas</button>`
                },
                buttonAcciones: {
                    class: 'col-auto',
                    html: `
                        <div class="btn-group" role="group" aria-label="Basic example">
                            <button type="button" class="btn btn-lg btn-orange btn-filtro-estado filtro-estado" data-estado="*"><i class="fa fa-files-o" aria-hidden="true"></i> Pendiente</button>
                            <button type="button" class="btn btn-lg btn-success btn-filtro-estado" data-estado="F"><i class="fa fa-check-circle-o" aria-hidden="true"></i> Facturado</button>
                            <button type="button" class="btn btn-lg btn-danger btn-filtro-estado" data-estado="&"><i class="fa fa-list-ul" aria-hidden="true"></i> Anulado</button>
                        </div>
                    `
                },
                //buttonFacturado: {
                //    class: 'col-auto',
                //    html: '<button type="button" class="btn btn-lg btn-success btn-filtro-estado" data-estado="F"><i class="fa fa-check-circle-o" aria-hidden="true"></i> Facturado</button>'
                //},
                //buttonAnulado: {
                //    class: 'col-auto',
                //    html: '<button type="button" class="btn btn-lg btn-danger btn-filtro-estado" data-estado="&"><i class="fa fa-list-ul" aria-hidden="true"></i> Anulado</button>'
                //}
            };

            dialog.init(function () {
                setTimeout(function () {

                    //reiniciar ventana
                    objPedido = {
                        platos: []
                    };

                    $('#buscarProducto').val('');
                    $('#observaciones').val('');
                    $('#NRO_PEDIDO').val('');
                    $('#C_PEDIDO').val('');
                    $('#nroPedido').html('NRO PEDIDO XXX' + fnObtenerNombreMesa());
                    $('#IND_ESTADO').val('*');
                    $('#PORCENTAJE_DESCUENTO_GLOBAL').val('');
                    $('#COMENTARIO_DESCUENTO_GLOBAL').val('');
                    $('#MOTIVO_CORTESIA').val('');


                    // Delivery
                    $('#IND_DELIVERY').val('')
                    $('#C_CLIENTE_DELIVERY').val('')
                    $('#TIPO_DOCUMENTO_DELIVERY').val('')
                    $('#RUC_DELIVERY').val('')
                    $('#NOMBRE_DELIVERY').val('')
                    $('#DIRECCION_ENTREGA').val('')
                    $('#REFERENCIA_ENTREGA').val('')
                    $('#TELEFONO').val('')
                    $('#METODO_PAGO_DELIVERY').val('')
                    $('#TIPO_COMPROBANTE').val('')

                    fnObtenerPlatos();

                    // Agregamos html inicial
                    $(dialog).find(`#${token}`).html(`
                        <form name="${token}_form">
                            <div class="row">
                                <div class="col-auto" id="sucursal"></div>
                            </div>
                            <div class="row mt-2 site"></div>
                        </form>
                        <div class="row mt-3">
                            <div class="col-12"><div id="${token}_table"></div></div>
                        </div>
                    `);

                    // Agregamos controles
                    for (var item in controls) {
                        var control = controls[item];
                        $(dialog).find(`form[name=${token}_form] .site`).append(`
                            <div class="${control.class}">${control.html}</div>
                        `);
                    };

                    // declaramos variables
                    let _controls = null;
                    const form = $(dialog).find(`form[name=${token}_form]`);
                    const table = $(dialog).find(`#${token}_table`);
                    const fnCrearTabla = function () {

                        table.CreateGrid({
                            query: 'tbl_puntoventa_procesos_puntoventa_obtenerpedidos',
                            items: {
                                C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                                IND_ESTADO: function () {
                                    var estado = $(form).find('.filtro-estado').attr('data-estado');
                                    return estado;
                                },
                                C_CAJA: function () {
                                    return $('#COD_CAJA').val();
                                },
                                BUSCAR: function () {
                                    return $(_controls.buscar).val();
                                },
                                MODULO: $.solver.basePath
                            },
                            hiddens: ['C_PEDIDO', 'IND_ESTADO', 'RUC_CLIENTE'],
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
                                'NRO_PEDIDO': {
                                    text: 'Cód. pedido',
                                    width: 80,
                                    cellsAlign: 'center'
                                },
                                'NOM_MESAS': {
                                    text: 'Mesa',
                                    width: 100,
                                    cellclassname: 'mesaGridText'
                                },
                                'C_USUARIO': {
                                    text: 'Usuario',
                                    width: 100
                                },
                                'NOMBRE_CAJA': {
                                    text: 'Caja',
                                    width: 80,
                                    cellsAlign: 'center'
                                },
                                'RAZON_SOCIAL': {
                                    text: 'Nombre cliente',
                                    width: 200
                                },
                                'NRO_COMPROBANTE': {
                                    text: 'Nro. comprobante',
                                    width: 120
                                },
                                'FECHA_EMISION': {
                                    text: 'Fec. emisión',
                                    width: 80
                                },
                                'FECHA_PEDIDO': {
                                    text: 'Fec. pedido',
                                    cellsAlign: 'center',
                                    width: 80
                                },
                                'OBSERVACION': {
                                    width: 200,
                                    text: 'Observación'
                                },
                                'CODIGO_PARAMETRO_2': {
                                    text: '',
                                    width: 30,
                                    cellsAlign: 'center'
                                },
                                'MONTO': {
                                    width: 100,
                                    text: 'Monto',
                                    cellsAlign: 'right',
                                    cellsFormat: 'd2',
                                    columnType: 'numberinput',
                                    aggregates: ['sum'], aggregatesRenderer: function (aggregates, column, element) {
                                        var formatNumber = aggregates.sum;
                                        if (formatNumber === undefined)
                                            formatNumber = '';
                                        return `<div class="h-30 d-flex justify-content-end align-items-center font-weight-bold">
                                                    <strong> ${formatNumber} </strong>
                                                </div>`;
                                    }
                                },
                                'ACCIONES': {
                                    text: 'Acciones',
                                    width: 300,
                                    createwidget: function (row, column, value, htmlElement) {
                                        table.jqxGrid('refresh');
                                    },
                                    initwidget: function (rowIndex, column, value, htmlElement) {

                                        var estado = $(form).find('.filtro-estado').attr('data-estado');

                                        $(htmlElement).html('');
                                        $(htmlElement).addClass('jqx-grid-cell-middle-align');
                                        $(htmlElement).addClass('mt-1');

                                        if (estado == '*') {
                                            $(htmlElement).html(`
                                                <div class="btn-group" role="group" aria-label="Basic example">
                                                    <button type="button" class="mt-1 btn btn-lg btn-success abrir_pedido"><i class="fa fa-folder-open-o" aria-hidden="true"></i> Abrir</button>
                                                    <button type="button" class="mt-1 btn btn-lg btn-warning detalle_pedido"><i class="fa fa-eye" aria-hidden="true"></i> Detalle</button>
                                                    <button type="button" class="mt-1 btn btn-lg btn-danger anular_pedido"><i class="fa fa-trash" aria-hidden="true"></i> Anular</button>
                                                </div>
                                            `);
                                        };
                                        if (estado == 'F') {
                                            $(htmlElement).html(`
                                                <div class="btn-group" role="group" aria-label="Basic example">
                                                    <button type="button" class="mt-1 btn btn-lg btn-warning detalle_pedido"><i class="fa fa-eye" aria-hidden="true"></i> Detalle</button>
                                                    <button type="button" class="mt-1 btn btn-lg btn-danger anular_pedido"><i class="fa fa-trash" aria-hidden="true"></i> Anular</button>
                                                    <button type="button" class="mt-1 btn btn-lg btn-warning imprimir_pedido"><i class="fa fa-print" aria-hidden="true"></i> Re-Imprimir</button>
                                                </div>
                                            `);
                                        };
                                        if (estado == '&') {
                                            $(htmlElement).html(`
                                                <div class="btn-group" role="group" aria-label="Basic example">
                                                    <button type="button" class="mt-1 btn btn-lg btn-warning detalle_pedido"><i class="fa fa-eye" aria-hidden="true"></i> Detalle</button>
                                                    <button type="button" class="mt-1 btn btn-lg btn-warning imprimir_pedido"><i class="fa fa-print" aria-hidden="true"></i> Re-Imprimir</button>
                                                </div>
                                            `);
                                        };

                                        //Acciones (ver pedido)
                                        if ($(htmlElement).find('button.abrir_pedido').length) {
                                            $(htmlElement).find('button.abrir_pedido').unbind('click');
                                            $(htmlElement).find('button.abrir_pedido').click(function () {

                                                const rowId = table.jqxGrid('getrowid', rowIndex);
                                                const row = table.jqxGrid('getrows')[rowId];
                                                const c_pedido = row.C_PEDIDO;
                                                const nroPedido = row.NRO_PEDIDO;
                                                const observacion = row.OBSERVACION;
                                                const indEstado = row.IND_ESTADO;

                                                $('#C_PEDIDO').val(c_pedido);
                                                $('#NRO_PEDIDO').val(nroPedido);
                                                $('#observaciones').val(observacion);
                                                $('#nroPedido').html(`NRO PEDIDO ${nroPedido}` + fnObtenerNombreMesa());
                                                $('#IND_ESTADO').val(indEstado);

                                                fnObtenerPedido();
                                                $(dialog).modal('hide');

                                            });
                                        };

                                        //Acciones (anular pedido)
                                        if ($(htmlElement).find('button.anular_pedido').length) {
                                            $(htmlElement).find('button.anular_pedido').unbind('click');
                                            $(htmlElement).find('button.anular_pedido').click(function () {

                                                const rowId = table.jqxGrid('getrowid', rowIndex);
                                                const row = table.jqxGrid('getrows')[rowId];
                                                const c_pedido = row.C_PEDIDO;
                                                const estado = $(form).find('.filtro-estado').attr('data-estado');

                                                fnActionAnular(c_pedido, `#${token}_table`, estado);

                                            });
                                        };

                                        //Acciones (anular re-imprimir)
                                        if ($(htmlElement).find('button.imprimir_pedido').length) {
                                            $(htmlElement).find('button.imprimir_pedido').unbind('click');
                                            $(htmlElement).find('button.imprimir_pedido').click(function () {

                                                const rowId = table.jqxGrid('getrowid', rowIndex);
                                                const row = table.jqxGrid('getrows')[rowId];
                                                const c_pedido = row.C_PEDIDO;
                                                const estado = $(form).find('.filtro-estado').attr('data-estado');

                                                fnReimprimir(c_pedido, estado);

                                            });
                                        };

                                        //Acciones (ver detalle)
                                        if ($(htmlElement).find('button.detalle_pedido').length) {
                                            $(htmlElement).find('button.detalle_pedido').unbind('click');
                                            $(htmlElement).find('button.detalle_pedido').click(function () {

                                                const rowId = table.jqxGrid('getrowid', rowIndex);
                                                const row = table.jqxGrid('getrows')[rowId];
                                                const c_pedido = row.C_PEDIDO;

                                                fnActionVerDetallado(c_pedido, row);

                                            });
                                        };

                                    },
                                }
                            },
                            config: {
                                selectionmode: 'checkbox',
                                pageable: true,
                                sortable: true,
                                height: 500,
                                //pageSize: 10,
                                rowsheight: 50,
                                showaggregates: true,
                                showstatusbar: true,
                                statusbarheight: 20,
                            }
                        });

                        table.on("bindingcomplete", function (event) {

                            var estado = $(form).find('.filtro-estado').attr('data-estado');

                            table.jqxGrid('hidecolumn', 'NOM_MESAS');
                            if ($.solver.basePath == '/restaurant') {
                                table.jqxGrid('showcolumn', 'NOM_MESAS');
                            };

                            if (estado == '*') {
                                table.jqxGrid('hidecolumn', 'RAZON_SOCIAL');
                                table.jqxGrid('hidecolumn', 'NRO_COMPROBANTE');
                                table.jqxGrid('hidecolumn', 'FECHA_EMISION');
                            } else if (estado == 'F') {
                                table.jqxGrid('showcolumn', 'RAZON_SOCIAL');
                                table.jqxGrid('showcolumn', 'NRO_COMPROBANTE');
                                table.jqxGrid('showcolumn', 'FECHA_EMISION');
                            } else if (estado == '&') {
                                table.jqxGrid('hidecolumn', 'RAZON_SOCIAL');
                                table.jqxGrid('showcolumn', 'NRO_COMPROBANTE');
                                table.jqxGrid('showcolumn', 'FECHA_EMISION');
                            };

                        });

                    };

                    form.ValidForm({
                        type: -1,
                        onDone: function (_, controls) {

                            _controls = controls;
                            $(form).find('#sucursal').html(`
                                <label class="col-form-label col-form-label-lg"><strong>SUCURSAL:</strong></label>
                                <label class="col-form-label col-form-label-lg">${$('#establecimiento').text()}</label>
                            `);

                            fnCrearTabla();

                            //filtrar querys
                            $(form).find('.btn-filtro-estado').unbind('click');
                            $(form).find('.btn-filtro-estado').bind('click', function () {
                                $.each($(form).find('.btn-filtro-estado'), function (i, v) {
                                    $(v).removeClass('filtro-estado');
                                });
                                $(this).addClass('filtro-estado');
                                form.submit();
                            });

                            //dividir cuenta
                            $(form).find('.btn-dividir ').unbind('click')
                            $(form).find('.btn-dividir ').bind('click', function () {
                                var indexes = $(table).jqxGrid('getselectedrowindexes') //datos selecionados;
                                if (indexes.length < 2) {
                                    fnObtenerAlertaError('Selecciona los pedidos que deseas unir')
                                } else {
                                    fnUnirCuenta(`#${token}_table`, indexes);
                                };
                            });

                        },
                        onReady: function () {
                            table.jqxGrid('updatebounddata');
                        },
                        onError: function (error) {
                            $.CloseStatusBar();
                            $.ShowError({ error });
                        }
                    });

                }, 150);
            });
            dialog.on('hide.bs.modal', function () { buttonState = false; });

            $('.bootbox .modal-dialog').draggable({
                handle: '.modal-header'
            });
            $('.bootbox .modal-header').css('cursor', 'move');

        };
        const fnActionMostrar = function () {
            $('#buscarProducto').val('');
            $('#C_CATEGORIA').val('');
            fnObtenerPlatos();
            buttonState = false;
        };
        const fnActionRapidoConModal = function () {

            const fnGuardarPedido = function (dialog) {
                const fnGuardar = function () {
                    $.GetQuery({
                        query: ['q_puntoventa_procesos_puntoventa_obtenerdatospordefecto'],
                        items: [{
                            C_EMPRESA: $.solver.session.SESSION_EMPRESA
                        }],
                        onError: function (error) {
                            $.CloseStatusBar();
                            $.ShowError({ error });
                        },
                        onBefore: function () {
                            $.DisplayStatusBar({ message: 'Obteniendo información.' });
                        },
                        onReady: function (result) {

                            $.CloseStatusBar();

                            var dataDefault = result[0];
                            var codTipoDoc = dataDefault.C_TIPO_DOC; //'07237'
                            var codCliente = dataDefault.C_CLIENTE; //'000001';
                            var codMoneda = dataDefault.C_MONEDA; //'07234';
                            //var codMetodoPago = dataDefault.C_METODO_PAGO; //'001'

                            var codMetodoPago = $(dialog).find('.active-box-tarjeta').attr('data-metodo');
                            var tarjeta = $(dialog).find('.active-box-tarjeta').attr('data-codigo');
                            tarjeta = (tarjeta == 'V' || tarjeta == 'M' || tarjeta == 'D' || tarjeta == 'A') ? tarjeta : null;
                            var totalPagado = parseFloat($(dialog).find('#TOTALPAGADO').val())
                            //var totalVuelto = parseFloat($(dialog).find('#totalVuelto').val())

                            var codPedido = $('#C_PEDIDO').val();
                            const codCaja = $('#COD_CAJA').val();
                            const codUsuario = $.solver.session.SESSION_ID;
                            const codOperacion = $('#C_OPERACION').val();
                            let precioTotal = 0.00;
                            let operacionesGratuitas = 0.00;
                            const tipoCambio = $(dialog).find('#tipoCambio').val();
                            const nroOperacion = $(dialog).find('#nro_operacion_2').val();

                            for (var index in objPedido.platos) {
                                var plato = objPedido.platos[index];
                                if (plato.Estado == '*') {
                                    var afectacion = parseInt(plato.AfectacionCabecera);
                                    if (afectacion == 0) operacionesGratuitas += (plato.Cantidad * plato.Precio);
                                    if (afectacion == 1) precioTotal += (plato.Cantidad * plato.Precio);
                                }
                            }

                            precioTotal = parseFloat(precioTotal.toFixed(2));
                            operacionesGratuitas = parseFloat(operacionesGratuitas.toFixed(2));

                            // Actualizamos pedido
                            const tokenPedido = fnActualizarPeticionesPedido(codTipoDoc, codCliente, '07234', codPedido, 0);

                            // Se agrega para control de almacen
                            const groupPlatos = JSON.parse(JSON.stringify(objPedido.platos));
                            // Agregamos detalle pedido
                            for (var index in groupPlatos) {

                                var itemPedidoDetalle = groupPlatos[index];

                                var modoPedidoDetalle = 1;
                                var condPedidoDetalle = '';
                                var extraPedidoDetalle = {
                                    C_PEDIDO: {
                                        action: {
                                            name: 'GetParentId',
                                            args: $.ConvertObjectToArr({
                                                column: 'C_PEDIDO',
                                                token: tokenPedido
                                            })
                                        }
                                    },
                                };
                                var objectPedidoDetalle = {
                                    C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                                    C_PEDIDO: codPedido,
                                    C_DETALLE: itemPedidoDetalle.C_DETALLE,
                                    C_PRODUCTO: itemPedidoDetalle.IdProducto,
                                    C_ALMACEN: ($('#C_ALMACEN_DEFECTO').val() == '' ? null : $('#C_ALMACEN_DEFECTO').val()),
                                };

                                if (itemPedidoDetalle.C_DETALLE == '') {
                                    let codigoDetalle = '000' + (parseInt(index) + 1);
                                    objPedido.platos[index].C_DETALLE = codigoDetalle.substring(codigoDetalle.length - 3, codigoDetalle.length);
                                    objectPedidoDetalle['C_DETALLE'] = objPedido.platos[index].C_DETALLE;
                                }
                                else {
                                    modoPedidoDetalle = 2;
                                    condPedidoDetalle = `C_EMPRESA='${$.solver.session.SESSION_EMPRESA}' AND C_PEDIDO='${codPedido}' AND C_DETALLE='${itemPedidoDetalle.C_DETALLE}'`;
                                };

                                $.AddPetition({
                                    table: 'PDV.PEDIDO_DETALLE',
                                    type: modoPedidoDetalle,
                                    condition: condPedidoDetalle,
                                    items: $.ConvertObjectToArr(objectPedidoDetalle, extraPedidoDetalle)
                                });

                            };


                            // Agregamos Cobranza detalle 
                            const objectDetailCobranza = {
                                C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                                C_CAJA: codCaja,
                                C_USUARIO: $.solver.session.SESSION_ID,
                                C_FECHA: objMyCaja.C_FECHA,
                                C_OPERACION: codOperacion,
                                C_DETALLE: '',
                                C_PEDIDO: codPedido,
                                C_METODO_PAGO: (precioTotal == 0 ? '001' : codMetodoPago),
                                TARJETA: tarjeta,
                                C_MONEDA: codMoneda,
                                MONTO_ORIGINAL: precioTotal,
                                A_PAGAR: precioTotal,
                                MONTO: totalPagado,
                                SALDO: 0,
                                VUELTO: totalPagado - precioTotal,
                                CALCULO: precioTotal,
                                TC: tipoCambio,
                                ACCION: 'R',
                                NRO_OPERACION: nroOperacion
                            };
                            const extraDetailCobranza = {
                                //C_FECHA: {
                                //    action: {
                                //        name: 'GetQueryId',
                                //        args: $.ConvertObjectToArr({
                                //            script: 'gbl_obtener_fecha_server',
                                //            column: 'FECHA_FORMATO'
                                //        })
                                //    }
                                //},
                                C_DETALLE: {
                                    action: {
                                        name: 'GetNextId',
                                        args: $.ConvertObjectToArr({
                                            columns: 'C_EMPRESA,C_CAJA,C_USUARIO,C_FECHA,C_OPERACION',
                                            max_length: 3
                                        })
                                    }
                                },
                                C_PEDIDO: {
                                    action: {
                                        name: 'GetParentId',
                                        args: $.ConvertObjectToArr({
                                            column: 'C_PEDIDO',
                                            token: tokenPedido,
                                        })
                                    }
                                }
                            };
                            $.AddPetition({
                                table: 'PDV.COBRANZA_DETALLE',
                                type: 1,
                                items: $.ConvertObjectToArr(objectDetailCobranza, extraDetailCobranza)
                            });

                            // Agregamos script para registrar la venta
                            const objectVenta = {
                                script: 'spw_gbl_registrar_venta',
                                C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                                C_PEDIDO: codPedido,
                                C_USUARIO: $.solver.session.SESSION_ID,
                                FLAG: 'pdv'
                            };
                            const extraVenta = {
                                C_PEDIDO: {
                                    action: {
                                        name: 'GetParentId',
                                        args: $.ConvertObjectToArr({
                                            column: 'C_PEDIDO',
                                            token: tokenPedido,
                                        })
                                    }
                                }
                            };
                            $.AddPetition({
                                type: 4,
                                transaction: true,
                                items: $.ConvertObjectToArr(objectVenta, extraVenta)
                            });

                            // Agregamos script para validar y registrar movimientos de recetas
                            //if ($.solver.basePath != '/restaurant') {
                            $.AddPetition({
                                type: '4',
                                transaction: true,
                                items: $.ConvertObjectToArr({
                                    script: 'spw_gbl_validar_registrar_movimientos_recetas_2',
                                    C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                                    C_DOCUMENTO: codPedido,
                                    FLAG_DOCUMENTO: 'pdv',
                                    C_USUARIO_REGISTRO: $.solver.session.SESSION_ID,
                                    MODULO: $.solver.basePath,
                                    C_COMANDA: '',
                                    VENTA: '&'
                                },
                                    {
                                        C_DOCUMENTO: {
                                            action: {
                                                name: 'GetParentId',
                                                args: $.ConvertObjectToArr({
                                                    column: 'C_PEDIDO',
                                                    token: tokenPedido,
                                                })
                                            }
                                        }
                                    }
                                )
                            });
                            //}

                            // Agregamos script para validar y registrar el movimiento stock
                            $.AddPetition({
                                type: '4',
                                transaction: true,
                                items: $.ConvertObjectToArr({
                                    script: 'spw_gbl_validar_registrar_movimiento_stock_v2',
                                    C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                                    C_DOCUMENTO: codPedido,
                                    FLAG_DOCUMENTO: 'pdv',
                                    C_USUARIO_REGISTRO: $.solver.session.SESSION_ID,
                                    FLAG_VALIDA_STOCK: '&'
                                },
                                    {
                                        C_DOCUMENTO: {
                                            action: {
                                                name: 'GetParentId',
                                                args: $.ConvertObjectToArr({
                                                    column: 'C_PEDIDO',
                                                    token: tokenPedido,
                                                })
                                            }
                                        }
                                    }
                                )
                            });

                            // Agregamos script para aprobar el movimiento de stock
                            $.AddPetition({
                                type: '4',
                                transaction: true,
                                items: $.ConvertObjectToArr({
                                    script: 'spw_gbl_aprobar_movimiento_stock',
                                    C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                                    C_DOCUMENTO: codPedido,
                                    FLAG_DOCUMENTO: 'pdv',
                                    C_USUARIO_REGISTRO: $.solver.session.SESSION_ID
                                }, {
                                    C_DOCUMENTO: {
                                        action: {
                                            name: 'GetParentId',
                                            args: $.ConvertObjectToArr({
                                                column: 'C_PEDIDO',
                                                token: tokenPedido,
                                            })
                                        }
                                    }
                                })
                            });

                            // Script para validar que todos los datos esten correctamente registrados
                            $.AddPetition({
                                type: '4',
                                transaction: true,
                                items: $.ConvertObjectToArr({
                                    script: 'spw_gbl_validar_movimientos_cobranza',
                                    C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                                    C_DOCUMENTO: codPedido,
                                }, {
                                    C_DOCUMENTO: {
                                        action: {
                                            name: 'GetParentId',
                                            args: $.ConvertObjectToArr({
                                                column: 'C_PEDIDO',
                                                token: tokenPedido,
                                            })
                                        }
                                    }
                                })
                            })

                            // Agregamos script para declarar la venta
                            //$.AddPetition({
                            //    type: '4',
                            //    transaction: true,
                            //    items: $.ConvertObjectToArr({
                            //        script: 'spw_gbl_registrar_declaracion_sunat_venta',
                            //        C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                            //        C_DOCUMENTO: codPedido,
                            //        FLAG_DOCUMENTO: 'pdv',
                            //        C_USUARIO_REGISTRO: $.solver.session.SESSION_ID
                            //    }, {
                            //        C_DOCUMENTO: {
                            //            action: {
                            //                name: 'GetParentId',
                            //                args: $.ConvertObjectToArr({
                            //                    column: 'C_PEDIDO',
                            //                    token: tokenPedido,
                            //                })
                            //            }
                            //        }
                            //    })
                            //})

                            // Enviamos peticiones
                            $.SendPetition({
                                onReady: function (result) {

                                    fnImprimirDocumento($.solver.session.SESSION_EMPRESA, $('#C_PEDIDO').val());

                                    fnValidarDpsGuardar(function () {

                                        $.CloseStatusBar();

                                        $(dialog).modal('hide');
                                        //fnObtenerAlertaOk('La venta ha sido registrada')
                                        fnActionNuevo();

                                        baulPedidos = JSON.parse('[]');
                                        $('.mytable-pedido').html('');

                                        fnObtenerDatosCaja();
                                        fnMostrarPedidos();

                                    });

                                },
                                onBefore: function () {
                                    $.DisplayStatusBar({ message: 'Registrando venta' });
                                },
                                onError: function (_error) {
                                    $.CloseStatusBar();
                                    fnObtenerAlertaError('Ha ocurrido un error, por favor vuelva a intentarlo.');
                                    //$.ShowError({ error: _error });
                                }
                            });

                        }
                    });
                }
                const fnValidar = function () {
                    var totalPagar = parseFloat($(dialog).find('#totalCuenta').val());
                    var totalPagado = $(dialog).find('#TOTALPAGADO').val()
                    totalPagado = totalPagado == '' ? 0 : totalPagado

                    if (totalPagar > totalPagado) {
                        fnObtenerAlertaWarning('Por favor ingrese monto a pagar')
                        return;
                    }

                    fnObtenerAlertaConfirm('PAGO RAPIDO', '¿Seguro de registrar el pago del pedido?', fnGuardar, null)
                }
                fnValidar();
                buttonState = false;
            };
            const fnPintarMetodosPago = function (dialogPagoRapido, dataMetodoPago, metodoPagoDefecto) {
                var index = 0;
                for (var item in dataMetodoPago) {
                    var classes = 'mr-1 ml-1';
                    if (index == 0) classes = 'mr-1'
                    if (index == dataMetodoPago.length - 1) classes = 'ml-1'
                    var row = dataMetodoPago[item];
                    var token = $.CreateToken();

                    // Efectivo
                    var efectivo = `
                        <div class="row">
                            <div data-codigo="10" data-efectivo="*" data-tarjeta="&" data-metodo="${row.idPago}" data-soles="*" class="offset-1 col-10 mt-2 mb-2 box-billete-soles box-billete-soles-10 box-tarjeta box-pago">
                                <div class="check-select"><i class="fa fa-check-square-o fa-1x" aria-hidden="true"></i></div>
                            </div>
                        </div>
                        <div class="row">
                            <div data-codigo="20" data-efectivo="*" data-tarjeta="&" data-metodo="${row.idPago}" data-soles="*" class="offset-1 col-10 mt-2 box-billete-soles box-billete-soles-20 box-tarjeta box-pago">
                                <div class="check-select"><i class="fa fa-check-square-o fa-1x" aria-hidden="true"></i></div>
                            </div>
                        </div>
                        <div class="row">
                            <div data-codigo="50" data-efectivo="*" data-tarjeta="&" data-metodo="${row.idPago}" data-soles="*" class="offset-1 col-10 mt-2 box-billete-soles box-billete-soles-50 box-tarjeta box-pago">
                                <div class="check-select"><i class="fa fa-check-square-o fa-1x" aria-hidden="true"></i></div>
                            </div>
                        </div>
                        <div class="row">
                            <div data-codigo="100" data-efectivo="*" data-tarjeta="&" data-metodo="${row.idPago}" data-soles="*" class="offset-1 col-10 mt-2 box-billete-soles box-billete-soles-100 box-tarjeta box-pago">
                                <div class="check-select"><i class="fa fa-check-square-o fa-1x" aria-hidden="true"></i></div>
                            </div>
                        </div>
                        <div class="row">
                            <div data-codigo="10" data-efectivo="*" data-tarjeta="&" data-metodo="${row.idPago}" data-soles="&" style="display:none;" class="offset-1 col-10 mt-2 mb-2 box-billete-dolares box-billete-dolares-10 box-tarjeta box-pago">
                                <div class="check-select"><i class="fa fa-check-square-o fa-1x" aria-hidden="true"></i></div>
                            </div>
                        </div>
                        <div class="row">
                            <div data-codigo="20" data-efectivo="*" data-tarjeta="&" data-metodo="${row.idPago}" data-soles="&" style="display:none;" class="offset-1 col-10 mt-2 box-billete-dolares box-billete-dolares-20 box-tarjeta box-pago">
                                <div class="check-select"><i class="fa fa-check-square-o fa-1x" aria-hidden="true"></i></div>
                            </div>
                        </div>
                        <div class="row">
                            <div data-codigo="50" data-efectivo="*" data-tarjeta="&" data-metodo="${row.idPago}" data-soles="&" style="display:none;" class="offset-1 col-10 mt-2 box-billete-dolares box-billete-dolares-50 box-tarjeta box-pago">
                                <div class="check-select"><i class="fa fa-check-square-o fa-1x" aria-hidden="true"></i></div>
                            </div>
                        </div>
                        <div class="row">
                            <div data-codigo="100" data-efectivo="*" data-tarjeta="&" data-metodo="${row.idPago}" data-soles="&" style="display:none;" class="offset-1 col-10 mt-2 box-billete-dolares box-billete-dolares-100 box-tarjeta box-pago">
                                <div class="check-select"><i class="fa fa-check-square-o fa-1x" aria-hidden="true"></i></div>
                            </div>
                        </div>
                        <div class="row">
                            <div data-codigo="x" data-efectivo="*" data-tarjeta="&" data-metodo="${row.idPago}" data-soles="*" class="offset-1 col-10 mt-2 box-tarjeta box-pago" style="background: #2E72B0;">
                                <label class="col-form-label col-form-label-lg"><strong>Contado:</strong></label>
                                <div class="check-select"><i class="fa fa-check-square-o fa-1x" aria-hidden="true"></i></div>
                            </div>
                        </div>
                    `

                    // Tarjetas
                    var tarjetas = `
                        <div class="row">
                            <div data-codigo="V" data-efectivo="&" data-tarjeta="*" data-metodo="${row.idPago}" class="offset-1 col-10 mt-2 box-tarjeta box-visa box-pago">
                                <div class="check-select"><i class="fa fa-check-square-o fa-1x" aria-hidden="true"></i></div>
                            </div>
                        </div>
                        <div class="row">
                            <div data-codigo="M" data-efectivo="&" data-tarjeta="*" data-metodo="${row.idPago}" class="offset-1 col-10 mt-2 box-tarjeta box-mastercard box-pago">
                                <div class="check-select"><i class="fa fa-check-square-o fa-1x" aria-hidden="true"></i></div>
                            </div>
                        </div>
                        <div class="row">
                            <div data-codigo="D" data-efectivo="&" data-tarjeta="*" data-metodo="${row.idPago}" class="offset-1 col-10 mt-2 box-tarjeta box-dinners box-pago">
                                <div class="check-select"><i class="fa fa-check-square-o fa-1x" aria-hidden="true"></i></div>
                            </div>
                        </div>
                        <div class="row">
                            <div data-codigo="A" data-efectivo="&" data-tarjeta="*" data-metodo="${row.idPago}" class="offset-1 col-10 mt-2 box-tarjeta box-american box-pago">
                                <div class="check-select"><i class="fa fa-check-square-o fa-1x" aria-hidden="true"></i></div>
                            </div>
                        </div>
                    `;

                    // Agregamos metodos de pago
                    $('#zone-pagoRapido .zonePago').append(`
                        <div id="${token}" class="col-3 box-tipo-pago">
                            <div class="row mt-2">
                                <div class="col-12">${row.NomPago}</div>
                            </div>
                            ${(row.IND_EFECTIVO == '*' ? efectivo : '')}
                            ${(row.IND_TARJETA == '*' ? tarjetas : '')}
                        </div>
                    `);
                }
            };
            const fnObtenerCliente = function (dialogPagoRapido, codCliente) {
                $.GetQuery({
                    query: ['q_puntoventa_procesos_puntoventa_obtenercliente'],
                    items: [{
                        C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                        C_CLIENTE: codCliente
                    }],
                    onReady: function (result) {
                        if (result.length > 0) {
                            const dataCliente = result[0];
                            const nombre = dataCliente.RAZON_SOCIAL;
                            $(dialogPagoRapido).find('#cliente').text(nombre);
                        }
                    }
                });
            };
            const fnMostrarModalRapido = function () {
                const tokenPagoRapido = $.CreateToken();
                let dialogPagoRapido = bootbox.dialog({
                    title: 'Pago rápido',
                    message: `<div id="${tokenPagoRapido}"></div>`,
                    className: 'modal-search-100',
                    onEscape: false
                });
                const controlsPagoRapido = {
                    buttonCancel: {
                        class: 'col-auto',
                        html: '<button type="button" id="btnCancelarPedido" class="btn btn-lg btn-gray float-left"><i class="fa fa-close"></i>&nbsp;Cancelar</button>'
                    },
                    buttonLimpiar: {
                        class: 'col-auto',
                        html: '<button type="button" id="btnLimpiarPedido" class="btn btn-lg btn-danger float-left"><i class="fa fa-eraser"></i>&nbsp;Limpiar</button>'
                    },
                    buttonAceptar: {
                        class: 'col',
                        html: '<button type="button" id="btnGuardarPedido" class="btn btn-lg btn-danger float-right"><i class="fa fa-floppy-o"></i>&nbsp;Pagar</button>'
                    }
                };

                dialogPagoRapido.init(function () {
                    setTimeout(function () {

                        // Agregamos html inicial
                        $(dialogPagoRapido).find(`#${tokenPagoRapido}`).html(`
                            <form name="${tokenPagoRapido}_form">
                                <div class="row mt-2 site"></div>
                            </form>
                        `);
                        $(dialogPagoRapido).find(`form[name=${tokenPagoRapido}_form]`).append(`
                            <hr />
                            <div class="row" id="zone-pagoRapido"></div>
                        `);

                        // Agregamos controles
                        for (var item in controlsPagoRapido) {
                            var control = controlsPagoRapido[item];
                            $(dialogPagoRapido).find(`form[name=${tokenPagoRapido}_form] .site`).append(`
                                <div class="${control.class}">${control.html}</div>
                            `);
                        };

                        // Pintamos html
                        var htmlPagoRapido = $('#divRapido').html();
                        $(dialogPagoRapido).find('#zone-pagoRapido').html(htmlPagoRapido);

                        $.GetQuery({
                            query: ['q_restaurant_obtener_metodospago', 'gbl_obtener_tipo_cambio', 'q_puntoventa_procesos_puntoventa_obtenerdatospordefecto'],
                            items: [
                                {
                                    C_EMPRESA: $.solver.session.SESSION_EMPRESA
                                },
                                {
                                    C_FECHA: moment(new Date()).format('DD/MM/YYYY')
                                },
                                {
                                    C_EMPRESA: $.solver.session.SESSION_EMPRESA
                                },
                            ],
                            onReady: function (result) {
                                $.CloseStatusBar();

                                const {
                                    C_TIPO_DOC,
                                    C_CLIENTE,
                                    C_MONEDA,
                                    C_METODO_PAGO
                                } = result['q_puntoventa_procesos_puntoventa_obtenerdatospordefecto'].result.rows[0];

                                let precioTotal = 0.00;
                                let operacionesGratuitas = 0.00;
                                for (var index in objPedido.platos) {
                                    var plato = objPedido.platos[index];
                                    if (plato.Estado == '*') {
                                        var afectacion = parseInt(plato.AfectacionCabecera);
                                        if (afectacion == 0) operacionesGratuitas += (plato.Cantidad * plato.Precio);
                                        if (afectacion == 1) precioTotal += (plato.Cantidad * plato.Precio);
                                    }
                                }

                                precioTotal = parseFloat(precioTotal.toFixed(2));
                                operacionesGratuitas = parseFloat(operacionesGratuitas.toFixed(2));

                                // Seteamos valores
                                $('#TOTALPAGAR').val(precioTotal)
                                $('#SALDOPAGAR').val(precioTotal)
                                $(dialogPagoRapido).find('#totalCuenta').val(numeral(precioTotal).format('0,0.00'));
                                $(dialogPagoRapido).find('#totalPagado').val(numeral(0).format('0,0.00'));
                                $(dialogPagoRapido).find('#totalVuelto').val(numeral(0).format('0,0.00'));

                                // Seteamos tipo de cambio
                                const dataTipoCambio = result['gbl_obtener_tipo_cambio'].result.rows[0];
                                $(dialogPagoRapido).find('#tipoCambio').val(dataTipoCambio.PRECIO_VENTA);

                                // Pintamos metodos de pago
                                const dataMetodoPago = result['q_restaurant_obtener_metodospago'].result.rows;
                                fnPintarMetodosPago(dialogPagoRapido, dataMetodoPago, C_METODO_PAGO);

                                fnObtenerCliente(dialogPagoRapido, C_CLIENTE);

                                // Eventos de opciones
                                $(dialogPagoRapido).find('div.box-tipo-moneda').click(function () {
                                    $.each($(dialogPagoRapido).find('.box-tipo-moneda'), function (i, v) {
                                        $(v).removeClass('active-box-moneda');
                                    });
                                    $(this).addClass('active-box-moneda');
                                    if ($(dialogPagoRapido).find('.active-box-moneda').attr('data-codigo') == '07235') {
                                        $(dialogPagoRapido).find('.tipoCambio').show();
                                        $(dialogPagoRapido).find('.box-billete-soles').hide();
                                        $(dialogPagoRapido).find('.box-billete-dolares').show();
                                    }
                                    else {
                                        $(dialogPagoRapido).find('.tipoCambio').hide();
                                        $(dialogPagoRapido).find('.box-billete-soles').show();
                                        $(dialogPagoRapido).find('.box-billete-dolares').hide();
                                    }
                                    $(dialogPagoRapido).find('#totalPagado').val(numeral(0).format('0,0.00'))
                                    $(dialogPagoRapido).find('#totalVuelto').val(numeral(0).format('0,0.00'))
                                    $.each($(dialogPagoRapido).find('.box-tarjeta'), function (i, v) {
                                        $(v).removeClass('active-box-tarjeta');
                                    });
                                });
                                $(dialogPagoRapido).find('.box-tarjeta').click(function () {
                                    $.each($(dialogPagoRapido).find('.box-tarjeta'), function (i, v) {
                                        $(v).removeClass('active-box-tarjeta');
                                    });
                                    $(this).addClass('active-box-tarjeta');
                                });
                                $(dialogPagoRapido).find('div.box-pago').click(function () {

                                    var efectivo = $(this).attr('data-efectivo')
                                    var tarjeta = $(this).attr('data-tarjeta')
                                    var codigo = $(this).attr('data-codigo')

                                    var totalPagar = $('#TOTALPAGAR').val();
                                    var totalPagado = $(dialogPagoRapido).find('#TOTALPAGADO').val();
                                    totalPagado = totalPagado == '' ? 0 : parseFloat(totalPagado);

                                    if (efectivo == '*') {

                                        $(dialogPagoRapido).find('#divOperacion').hide();
                                        $(dialogPagoRapido).find('#nro_operacion_2').removeAttr('required');

                                        var soles = $(this).attr('data-soles');
                                        var tipoCambio = parseFloat($(dialogPagoRapido).find('#tipoCambio').val())
                                        var totalVuelto = parseFloat($(dialogPagoRapido).find('#totalVuelto').val());

                                        if (codigo == 'x') {
                                            codigo = parseFloat(totalPagar);
                                            totalVuelto = 0;
                                            totalPagado = 0;
                                            totalPagadoReal = 0;
                                        }

                                        codigo = parseFloat(codigo) * (soles == '&' ? parseFloat(tipoCambio) : 1);
                                        totalPagado += parseFloat(codigo)

                                        totalVuelto = totalPagado - totalPagar;

                                        $(dialogPagoRapido).find('#totalPagado').val(numeral(totalPagado).format('0,0.00'))
                                        $(dialogPagoRapido).find('#TOTALPAGADO').val(totalPagado)

                                        if (totalPagado >= totalPagar) {
                                            $(dialogPagoRapido).find('#totalVuelto').val(numeral(totalVuelto).format('0,0.00'))
                                        }
                                    }
                                    if (tarjeta == '*') {
                                        $(dialogPagoRapido).find('#divOperacion').show();
                                        $(dialogPagoRapido).find('#nro_operacion_2').attr('required', 'required');
                                        $(dialogPagoRapido).find('#nro_operacion_2').focus();
                                        $(dialogPagoRapido).find('#totalPagado').val(numeral(totalPagar).format('0,0.00'))
                                        $(dialogPagoRapido).find('#TOTALPAGADO').val(totalPagar)
                                        $(dialogPagoRapido).find('#totalVuelto').val(numeral(0).format('0,0.00'))
                                    }
                                });
                                $(dialogPagoRapido).find('#btnGuardarPedido').click(function () {
                                    if (!buttonState) {
                                        buttonState = true;
                                        fnGuardarPedido(dialogPagoRapido);
                                    }
                                });
                                $(dialogPagoRapido).find('#btnCancelarPedido').click(function () {
                                    if (!buttonState) {
                                        buttonState = true;
                                        $(dialogPagoRapido).modal('hide');
                                        buttonState = false;
                                    }
                                });
                                $(dialogPagoRapido).find('#btnLimpiarPedido').click(function () {
                                    if (!buttonState) {
                                        buttonState = true;
                                        $(dialogPagoRapido).find('#totalPagado').val(numeral(0).format('0,0.00'));
                                        $(dialogPagoRapido).find('#totalVuelto').val(numeral(0).format('0,0.00'));

                                        $.each($(dialogPagoRapido).find('.box-tarjeta'), function (i, v) {
                                            $(v).removeClass('active-box-tarjeta');
                                        });

                                        buttonState = false;
                                    }
                                })

                                // Seteamos valores por defecto
                                if (C_MONEDA != '') {
                                    $('.box-tipo-moneda').removeClass('active-box-moneda');
                                    $.each($('.box-tipo-moneda'), function (i, v) {
                                        var codigo = $(v).attr('data-codigo');
                                        if (codigo == C_MONEDA) {
                                            $(v).trigger('click');
                                        }
                                    });
                                };

                                if (C_METODO_PAGO != '') {
                                    $('.box-tipo-pago').removeClass('active-box');
                                    $.each($('.box-tipo-pago'), function (i, v) {
                                        var codigo = $(v).attr('data-idpago');
                                        if (codigo == C_METODO_PAGO) {
                                            $(v).trigger('click');
                                        }
                                    });
                                };

                            },
                            onError: function (error) {
                                $.CloseStatusBar();
                                $.ShowError({ error });
                            },
                            onBefore: function () {
                                $.DisplayStatusBar({ message: 'Obteniendo información...' });
                            },
                        });

                    }, 150)
                });

                $('.bootbox .modal-dialog').draggable({
                    handle: '.modal-header'
                });
                $('.bootbox .modal-header').css('cursor', 'move');
            }

            let total = 0.00;

            for (var index in objPedido.platos) {
                var plato = objPedido.platos[index];
                if (plato.Estado == '*') {
                    var afectacion = parseInt(plato.AfectacionCabecera);
                    if (afectacion == 1) total += (plato.Cantidad * plato.Precio);
                }
            };

            if (total > 700) {

                fnObtenerAlerta('El monto es mayor a 700, por favor elija la opción <strong>PAGO DETALLADO<strong>');

            } else {

                fnMostrarModalRapido();

            };

            buttonState = false;

        };
        const fnActionDetallado = function () {

            const fnEditarCliente = function (dialogDetallado, codCliente = '') {

                $.solver.fn.fnEditarCliente({
                    codCliente,
                    onReady: function (result, controls, form, dialog) {
                        codCliente = result.items.C_CLIENTE;
                        $(dialogDetallado).find('#C_CLIENTE').val(codCliente);
                        fnObtenerCliente(dialogDetallado);
                        $(dialog).modal('hide');
                    },
                    onCloseModal: function () {
                        buttonState = false;
                    }
                })

            }
            const fnObtenerCliente = function (dialogPagoDetallado, codCliente = '') {
                $.GetQuery({
                    query: ['q_puntoventa_procesos_puntoventa_obtenercliente'],
                    items: [{
                        C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                        C_CLIENTE: function () {
                            return $(dialogPagoDetallado).find('#C_CLIENTE').val()
                        }
                    }],
                    onReady: function (result) {
                        if (result.length > 0) {
                            const dataCliente = result[0];
                            const nroDocumento = dataCliente.RUC_CLIENTE;
                            const nombre = dataCliente.RAZON_SOCIAL;
                            const tipoDocumento = dataCliente.C_PARAMETRO_GENERAL_TIPO_DOCUMENTO;
                            $(dialogPagoDetallado).find('#RUC').val(nroDocumento)
                            $(dialogPagoDetallado).find('#NOMBRE').val(nombre);
                            if (tipoDocumento == '00017') { //ruc
                                $(dialogPagoDetallado).find('#tipo_doc').text('Ruc:');
                                $.each($(dialogPagoDetallado).find('.box-tipo-comprobante'), function (i, v) {
                                    $(v).attr('data-selectable', '&');
                                    if ($(v).attr('data-codigo') == '07236') {
                                        $(v).attr('data-selectable', '*');
                                        $(v).trigger('click');
                                    }
                                });
                            }
                            else if (tipoDocumento == '00013') { //dni
                                $(dialogPagoDetallado).find('#tipo_doc').text('Dni:');
                                $.each($(dialogPagoDetallado).find('.box-tipo-comprobante'), function (i, v) {
                                    $(v).attr('data-selectable', '&');
                                    if ($(v).attr('data-codigo') == '07237') {
                                        $(v).attr('data-selectable', '*');
                                        $(v).trigger('click');
                                    }
                                });
                            }
                            else { //otros
                                $(dialogPagoDetallado).find('#tipo_doc').text('Documento:');
                                $.each($(dialogPagoDetallado).find('.box-tipo-comprobante'), function (i, v) {
                                    $(v).attr('data-selectable', '&');
                                    if ($(v).attr('data-codigo') == '07237') {
                                        $(v).attr('data-selectable', '*');
                                        $(v).trigger('click');
                                    }
                                });
                            }

                            if ($(dialogPagoDetallado).find('#C_CLIENTE').val() == codCliente) {
                                $(dialogPagoDetallado).find('#btnEditarCliente').css('display', 'none');
                            }
                            else {
                                $(dialogPagoDetallado).find('#btnEditarCliente').css('display', 'block');
                            }
                        }
                    }
                });
            };
            const fnPintarMetodosPago = function (dialogPagoDetallado, dataMetodoPago, metodoPagoDefecto) {
                let tokenPrimero;
                var index = 0;
                for (var item in dataMetodoPago) {
                    var classes = 'mr-1 ml-1';
                    if (index == 0) classes = 'mr-1'
                    if (index == dataMetodoPago.length - 1) classes = 'ml-1'
                    var row = dataMetodoPago[item];
                    var token = $.CreateToken();
                    if (row.idPago == metodoPagoDefecto) tokenPrimero = token;
                    $('#zone-pagoDetallado .zonePago').append(`
                        <div
                            id="${token}" class="col box-tipo-pago ${classes}"
                            data-token="${item}" data-idPago="${row.idPago}" data-NomPago="${row.NomPago}" data-efectivo="${row.IND_EFECTIVO}" data-tarjeta="${row.IND_TARJETA}">
                            ${row.NomPago}
                            <div class="check-select"><i class="fa fa-check-square-o fa-1x" aria-hidden="true"></i></div>
                        </div>
                    `);

                    $('div#' + token).click(function () {
                        if ($(this).hasClass('active-box')) {
                            var quitar = metodoPagoArr.indexOf($(this).attr('data-idPago'));
                            metodoPagoArr.splice(quitar, 1);
                            $(this).removeClass('active-box');
                            $('.billetes').hide();
                            $('.tarjetas').hide();
                        }
                        else {
                            metodoPagoArr = [];
                            let pago = $(this).attr('data-idPago');
                            $(this).addClass('active-box');
                            metodoPagoArr.push($(this).attr('data-idPago'));
                            $(dialogPagoDetallado).find('#zone-pagoDetallado .zonePago').find('.box-tipo-pago').each(function () {
                                if (pago != $(this).attr('data-idPago')) {
                                    $(this).removeClass('active-box');
                                }
                            });
                            const efectivo = $(this).attr('data-efectivo');
                            const tarjeta = $(this).attr('data-tarjeta');

                            $('.billetes').hide();
                            $('.tarjetas').hide();
                            if (efectivo == '*') {
                                $('.billetes').show();
                            }
                            else if (tarjeta == '*') {
                                $('.tarjetas').show();
                            }
                        }
                        $(dialogPagoDetallado).find('#operacion').hide();
                        $(dialogPagoDetallado).find('#nro_operacion').val('');
                        $(dialogPagoDetallado).find('.box-tarjeta').removeClass('active-box-tarjeta');
                    });

                    index++;
                };
                $('div#' + tokenPrimero).trigger('click');
                return tokenPrimero;
            };
            const fnCrearTabla = function (dialogPagoDetallado) {
                const fnBorrarPago = function (indice) {
                    const rowid = $(dialogPagoDetallado).find('#tblListaPagos').jqxGrid('getrowid', indice);
                    $(dialogPagoDetallado).find('#tblListaPagos').jqxGrid('deleterow', rowid);
                    fnCalcularMontos(dialogPagoDetallado);
                };
                $(dialogPagoDetallado).find('#tblListaPagos').CreateGrid({
                    query: 'tbl_puntoventa_procesos_puntocaja_listardetallemetodopago',
                    items: {
                        C_PEDIDO: function () {
                            return $('#C_PEDIDO').val();
                        },
                        C_EMPRESA: $.solver.session.SESSION_EMPRESA
                    },
                    hiddens: ['C_EMPRESA', 'C_CAJA', 'C_DETALLE', 'C_PEDIDO', 'C_METODO_PAGO', 'C_MONEDA', 'A_PAGAR', 'VUELTO', 'CALCULO', 'TC'],
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
                        'NOMBRE_METODO_PAGO': {
                            text: 'Método de Pago',
                            width: 250,
                            cellsAlign: 'center'
                        },
                        'NRO_OPERACION': {
                            text: 'Cod ref.',
                            width: 100,
                            editable: false
                        },
                        'MONEDA': {
                            text: 'Moneda',
                            width: 80,
                            cellsAlign: 'center'
                        },
                        'MONTO_ORIGINAL': {
                            text: 'Monto original',
                            width: 100,
                            cellsAlign: 'right',
                            columnType: 'numberinput',
                            cellsFormat: 'd2',
                        },
                        'MONTO': {
                            text: 'Monto',
                            width: 100,
                            cellsAlign: 'right',
                            columnType: 'numberinput',
                            cellsFormat: 'd2',
                        },
                        'SALDO': {
                            text: 'Saldo',
                            width: 100,
                            cellsAlign: 'right',
                            columnType: 'numberinput',
                            cellsFormat: 'd2',
                        },
                        '': {
                            width: 40,
                            createwidget: function (row, column, value, cellElement) {
                                $('div#tblListaPagos').jqxGrid('refresh');
                            },
                            initwidget: function (rowIndex, column, value, htmlElement) {
                                $(htmlElement).html('')
                                let _btnEliminar;
                                _btnEliminar = $(`<a id="eliminar" style="cursor: pointer;" class="jqx-grid-widget"><i class="fa fa-minus-circle fa-2x" aria-hidden="true"></i></a>`);
                                $(htmlElement).append(_btnEliminar);
                                $(htmlElement).find('a').css({
                                    'margin-top': '0.1rem',
                                    'margin-bottom': '0.2rem',
                                    'margin-left': '0.8rem',
                                    'margin-right': '0.2rem',
                                    'display': 'block'
                                });
                                $(htmlElement).find('a#eliminar').unbind('click');
                                $(htmlElement).find('a#eliminar').click(function () {
                                    fnBorrarPago(rowIndex);
                                });
                            }
                        }
                    },
                    config: {
                        virtualmode: false,
                        height: 290,
                        rowsheight: 28,
                        pageSize: 100,
                        editable: false,
                        //pageable: false,
                        sortable: false,
                        rendered: function () {
                            fnCalcularMontos(dialogPagoDetallado);
                        }
                    }
                });
            };
            const fnCalcularMontos = function (dialogPagoDetallado) {
                let totalPagar = 0.00;
                let saldo = 0.00;
                let montosPagos = 0.00;
                let vuelto = 0.00;

                totalPagar = parseFloat($('#TOTALPAGAR').val());
                $.each($(dialogPagoDetallado).find('#tblListaPagos').jqxGrid('getRows'), function (i, item) {
                    montosPagos += parseFloat(item.MONTO);
                });

                // Para calcular el saldo
                saldo = totalPagar - montosPagos;
                saldo = saldo < 0 ? 0 : saldo;

                // Para calcular el vuelto
                vuelto = (montosPagos - totalPagar);
                vuelto = vuelto < 0 ? 0 : vuelto;

                $(dialogPagoDetallado).find('#saldoPagar').val(numeral(saldo).format('0,0.00'));
                $(dialogPagoDetallado).find('#vuelto').val(numeral(vuelto).format('0,0.00'));
                $('#SALDOPAGAR').val(parseFloat(saldo.toFixed(2)));
            }
            const fnAgregarPago = function (dialogPagoDetallado) {

                var tipoPago = $(dialogPagoDetallado).find('.box-tipo-pago.active-box')[0];
                if (tipoPago == undefined) {
                    fnObtenerAlertaWarning('Por favor seleccione un método de pago')
                    return;
                }

                let totalPagar = 0.00;
                let saldo = 0.00;
                let montosPagos = 0.00;
                let vuelto = 0.00;
                let aPagar = 0.00;
                let montoOriginal = 0.00;

                aPagar = $(dialogPagoDetallado).find('#aPagar').val();
                totalPagar = parseFloat($('#TOTALPAGAR').val());

                $.each($(dialogPagoDetallado).find('#tblListaPagos').jqxGrid('getRows'), function (i, item) {
                    montosPagos += parseFloat(item.MONTO);
                });
                saldo = totalPagar - montosPagos;
                saldo = parseFloat(saldo.toFixed(2));

                if (saldo <= 0) {
                    $(dialogPagoDetallado).find('#aPagar').val('');
                    fnObtenerAlertaWarning('Pago completo')
                    return;
                }
                if (aPagar == '') {
                    fnObtenerAlertaWarning('Por favor ingrese un monto a pagar')
                    return;
                }
                if (parseFloat(aPagar) <= 0) {
                    fnObtenerAlertaWarning('El monto debe ser mayor a 0')
                    return;
                }
                aPagar = parseFloat(aPagar);
                montoOriginal = parseFloat(aPagar);

                var checkEfectivo = $(tipoPago).attr('data-efectivo');
                var checkTarjeta = $(tipoPago).attr('data-tarjeta');
                if (checkTarjeta == '*') {
                    if ($(dialogPagoDetallado).find('.active-box-tarjeta').length == 0) {
                        fnObtenerAlertaWarning('Por favor escoja la tarjeta')
                        return;
                    }
                    if ($(dialogPagoDetallado).find('#nro_operacion').val() == '') {
                        $(dialogPagoDetallado).find('#nro_operacion').focus();
                    }
                }

                var rowListaPagos = $(dialogPagoDetallado).find('#tblListaPagos').jqxGrid('getRows');
                const fila = rowListaPagos.length;
                const codCaja = $('#COD_CAJA').val();
                const codPedido = $('#C_PEDIDO').val();
                const codMoneda = $('.active-box-moneda').attr('data-codigo');
                const moneda = (codMoneda == '07234' ? 'Soles' : 'Dolares');
                const tipoCambio = parseFloat($(dialogPagoDetallado).find('#TC').val());
                let idPago = $(tipoPago).attr('data-idpago');
                let nomPago = $(tipoPago).attr('data-nompago');
                const nroOperacion = $(dialogPagoDetallado).find('#nro_operacion').val();
                const tarjeta = ($(dialogPagoDetallado).find('.active-box-tarjeta').length == 0) ? null : $(dialogPagoDetallado).find('.active-box-tarjeta').attr('data-codigo');
                vuelto = ((totalPagar - aPagar) > 0 ? 0 : (totalPagar - aPagar) * -1)

                $.GetQuery({
                    query: ['q_puntoventa_procesos_puntoventa_calculo_agregarpago'],
                    items: [{
                        SALDO: saldo,
                        MONEDA: codMoneda,
                        TIPOCAMBIO: tipoCambio,
                        PAGAR: aPagar
                    }],
                    onReady: function (result) {

                        const dataResultAddPago = result[0];

                        let _apagar = dataResultAddPago['APAGAR'];
                        let _monto = dataResultAddPago['MONTO'];
                        let _saldo = dataResultAddPago['SALDO'];
                        let _vuelto = dataResultAddPago['VUELTO'];
                        let _aregistrar = dataResultAddPago['CALCULO'];

                        //_apagar = saldo;
                        //_monto = aPagar * (codMoneda == '07234' ? 1 : tipoCambio);

                        //_calculo = _monto - _apagar;
                        //_saldo = _calculo >= 0 ? 0 : _calculo * -1;
                        //_vuelto = _calculo >= 0 ? _calculo : 0;
                        //_aregistrar = _monto - _vuelto;

                        var metodoPago = {
                            _rowNum: fila + 1,
                            MODO: 1,
                            C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                            C_CAJA: codCaja,
                            C_DETALLE: '',
                            C_PEDIDO: codPedido,
                            C_METODO_PAGO: idPago,
                            NOMBRE_METODO_PAGO: nomPago,
                            C_MONEDA: codMoneda,
                            MONEDA: moneda,
                            NRO_OPERACION: nroOperacion,
                            TARJETA: tarjeta,
                            TC: tipoCambio,
                            MONTO_ORIGINAL: montoOriginal,
                            A_PAGAR: _apagar,
                            MONTO: _monto,
                            SALDO: _saldo,
                            VUELTO: _vuelto,
                            CALCULO: _aregistrar
                        };

                        $(dialogPagoDetallado).find('#tblListaPagos').jqxGrid('addrow', null, metodoPago);
                        $(dialogPagoDetallado).find('#tblListaPagos').jqxGrid('selectrow', fila);
                        $(dialogPagoDetallado).find('#tblListaPagos').jqxGrid('ensurerowvisible', fila);
                        $(dialogPagoDetallado).find('#tblListaPagos').jqxGrid('refresh');
                        $(dialogPagoDetallado).find('#aPagar').val('');
                        $(dialogPagoDetallado).find('#nro_operacion').val('')
                        $(dialogPagoDetallado).find('#operacion').hide();
                        $(dialogPagoDetallado).find('.box-tarjeta').removeClass('active-box-tarjeta')

                        fnCalcularMontos(dialogPagoDetallado);
                        buttonState = false;
                    }
                })
            };
            const fnGuardarPedido = function (dialogPagoDetallado) {
                const fnGuardar = function () {

                    let codPedido = $('#C_PEDIDO').val();
                    const codTipoDoc = $(dialogPagoDetallado).find('.active-box-comprobante').attr('data-codigo')
                    const codCliente = $(dialogPagoDetallado).find('#C_CLIENTE').val();
                    const codMoneda = $(dialogPagoDetallado).find('.active-box-moneda').attr('data-codigo');
                    const codCaja = $('#COD_CAJA').val();
                    const codOperacion = $('#C_OPERACION').val();
                    const propina = $(dialogPagoDetallado).find('#propina').val();
                    let precioTotal = 0.00;
                    let operacionesGratuitas = 0.00;
                    for (var index in objPedido.platos) {
                        var plato = objPedido.platos[index];
                        if (plato.Estado == '*') {
                            var afectacion = parseInt(plato.AfectacionCabecera);
                            if (afectacion == 0) operacionesGratuitas += (plato.Cantidad * plato.Precio);
                            if (afectacion == 1) precioTotal += (plato.Cantidad * plato.Precio);
                        }
                    };

                    precioTotal = parseFloat(precioTotal.toFixed(2));
                    operacionesGratuitas = parseFloat(operacionesGratuitas.toFixed(2));

                    // actualizamos pedido
                    const tokenPedido = fnActualizarPeticionesPedido(codTipoDoc, codCliente, '07234', codPedido, propina)

                    // Se agrega para control de almacen
                    const groupPlatos = JSON.parse(JSON.stringify(objPedido.platos));
                    // Agregamos detalle pedido
                    for (var index in groupPlatos) {

                        var itemPedidoDetalle = groupPlatos[index];

                        var modoPedidoDetalle = 1;
                        var condPedidoDetalle = '';
                        var extraPedidoDetalle = {
                            C_PEDIDO: {
                                action: {
                                    name: 'GetParentId',
                                    args: $.ConvertObjectToArr({
                                        column: 'C_PEDIDO',
                                        token: tokenPedido
                                    })
                                }
                            },
                        };
                        var objectPedidoDetalle = {
                            C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                            C_PEDIDO: codPedido,
                            C_DETALLE: itemPedidoDetalle.C_DETALLE,
                            C_PRODUCTO: itemPedidoDetalle.IdProducto,
                            C_ALMACEN: ($('#C_ALMACEN_DEFECTO').val() == '' ? null : $('#C_ALMACEN_DEFECTO').val()),
                        };

                        if (itemPedidoDetalle.C_DETALLE == '') {
                            let codigoDetalle = '000' + (parseInt(index) + 1);
                            objPedido.platos[index].C_DETALLE = codigoDetalle.substring(codigoDetalle.length - 3, codigoDetalle.length);
                            objectPedidoDetalle['C_DETALLE'] = objPedido.platos[index].C_DETALLE;
                        }
                        else {
                            modoPedidoDetalle = 2;
                            condPedidoDetalle = `C_EMPRESA='${$.solver.session.SESSION_EMPRESA}' AND C_PEDIDO='${codPedido}' AND C_DETALLE='${itemPedidoDetalle.C_DETALLE}'`;
                        };

                        $.AddPetition({
                            table: 'PDV.PEDIDO_DETALLE',
                            type: modoPedidoDetalle,
                            condition: condPedidoDetalle,
                            items: $.ConvertObjectToArr(objectPedidoDetalle, extraPedidoDetalle)
                        });

                    };

                    // Agregamos Cobranza detalle 
                    const listaPagos = $(dialogPagoDetallado).find('#tblListaPagos').jqxGrid('getrows');
                    $.each(listaPagos, function (i, detalle) {
                        var type = 1;
                        $.AddPetition({
                            table: 'PDV.COBRANZA_DETALLE',
                            type: type,
                            items: $.ConvertObjectToArr({
                                C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                                C_CAJA: codCaja,
                                C_USUARIO: $.solver.session.SESSION_ID,
                                C_FECHA: objMyCaja.C_FECHA,
                                C_OPERACION: codOperacion,
                                C_DETALLE: '',
                                C_PEDIDO: codPedido,
                                C_METODO_PAGO: detalle.C_METODO_PAGO,
                                C_MONEDA: detalle.C_MONEDA,
                                NRO_OPERACION: detalle.NRO_OPERACION,
                                TARJETA: detalle.TARJETA,
                                TC: detalle.TC,
                                MONTO_ORIGINAL: detalle.MONTO_ORIGINAL,
                                A_PAGAR: detalle.A_PAGAR,
                                MONTO: detalle.MONTO,
                                SALDO: detalle.SALDO,
                                VUELTO: detalle.VUELTO,
                                CALCULO: detalle.CALCULO,
                                ACCION: 'D'
                            }, {
                                //C_FECHA: {
                                //    action: {
                                //        name: 'GetQueryId',
                                //        args: $.ConvertObjectToArr({
                                //            script: 'gbl_obtener_fecha_server',
                                //            column: 'FECHA_FORMATO'
                                //        })
                                //    }
                                //},
                                C_DETALLE: {
                                    action: {
                                        name: 'GetNextId',
                                        args: $.ConvertObjectToArr({
                                            columns: 'C_EMPRESA,C_CAJA,C_USUARIO,C_FECHA,C_OPERACION',
                                            max_length: 3
                                        })
                                    }
                                },
                                C_PEDIDO: {
                                    action: {
                                        name: 'GetParentId',
                                        args: $.ConvertObjectToArr({
                                            column: 'C_PEDIDO',
                                            token: tokenPedido,
                                        })
                                    }
                                }
                            })
                        });
                    });

                    if (precioTotal == 0) {
                        $.AddPetition({
                            table: 'PDV.COBRANZA_DETALLE',
                            type: 1,
                            items: $.ConvertObjectToArr({
                                C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                                C_CAJA: codCaja,
                                C_USUARIO: $.solver.session.SESSION_ID,
                                C_FECHA: objMyCaja.C_FECHA,
                                C_OPERACION: codOperacion,
                                C_DETALLE: '',
                                C_PEDIDO: codPedido,
                                C_METODO_PAGO: '001',
                                C_MONEDA: codMoneda,
                                NRO_OPERACION: null,
                                TARJETA: null,
                                TC: $(dialogPagoDetallado).find('#TC').val(),
                                MONTO_ORIGINAL: 0,
                                A_PAGAR: 0,
                                MONTO: 0,
                                SALDO: 0,
                                VUELTO: 0,
                                CALCULO: 0,
                                ACCION: 'D'
                            }, {
                                C_DETALLE: {
                                    action: {
                                        name: 'GetNextId',
                                        args: $.ConvertObjectToArr({
                                            columns: 'C_EMPRESA,C_CAJA,C_USUARIO,C_FECHA,C_OPERACION',
                                            max_length: 3
                                        })
                                    }
                                },
                                C_PEDIDO: {
                                    action: {
                                        name: 'GetParentId',
                                        args: $.ConvertObjectToArr({
                                            column: 'C_PEDIDO',
                                            token: tokenPedido,
                                        })
                                    }
                                }
                            })
                        });
                    }

                    const objectCorregirDetalleCobranza = {
                        script: 'spw_puntoventa_procesos_puntoventa_corregir_detalle_cobranza',
                        C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                        C_PEDIDO: codPedido
                    };
                    const extraCorregirDetalleCobranza = {
                        C_PEDIDO: {
                            action: {
                                name: 'GetParentId',
                                args: $.ConvertObjectToArr({
                                    column: 'C_PEDIDO',
                                    token: tokenPedido,
                                })
                            }
                        }
                    };
                    $.AddPetition({
                        type: 4,
                        transaction: true,
                        items: $.ConvertObjectToArr(objectCorregirDetalleCobranza, extraCorregirDetalleCobranza)
                    });

                    // Agregamos script para registrar la venta
                    const objectVenta = {
                        script: 'spw_gbl_registrar_venta',
                        C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                        C_PEDIDO: codPedido,
                        C_USUARIO: $.solver.session.SESSION_ID,
                        FLAG: 'pdv'
                    };
                    const extraVenta = {
                        C_PEDIDO: {
                            action: {
                                name: 'GetParentId',
                                args: $.ConvertObjectToArr({
                                    column: 'C_PEDIDO',
                                    token: tokenPedido,
                                })
                            }
                        }
                    };
                    $.AddPetition({
                        type: 4,
                        transaction: true,
                        items: $.ConvertObjectToArr(objectVenta, extraVenta)
                    });

                    // Agregamos script para validar y registrar movimientos de recetas
                    //if ($.solver.basePath != '/restaurant') {
                    $.AddPetition({
                        type: '4',
                        transaction: true,
                        items: $.ConvertObjectToArr({
                            script: 'spw_gbl_validar_registrar_movimientos_recetas_2',
                            C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                            C_DOCUMENTO: codPedido,
                            FLAG_DOCUMENTO: 'pdv',
                            C_USUARIO_REGISTRO: $.solver.session.SESSION_ID,
                            MODULO: $.solver.basePath,
                            C_COMANDA: '',
                            VENTA: '&'
                        },
                            {
                                C_DOCUMENTO: {
                                    action: {
                                        name: 'GetParentId',
                                        args: $.ConvertObjectToArr({
                                            column: 'C_PEDIDO',
                                            token: tokenPedido,
                                        })
                                    }
                                }
                            }
                        )
                    });
                    //}

                    // Agregamos script para validar y registrar el movimiento stock
                    $.AddPetition({
                        type: '4',
                        transaction: true,
                        items: $.ConvertObjectToArr({
                            script: 'spw_gbl_validar_registrar_movimiento_stock_v2',
                            C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                            C_DOCUMENTO: codPedido,
                            FLAG_DOCUMENTO: 'pdv',
                            C_USUARIO_REGISTRO: $.solver.session.SESSION_ID,
                            FLAG_VALIDA_STOCK: '&'
                        },
                            {
                                C_DOCUMENTO: {
                                    action: {
                                        name: 'GetParentId',
                                        args: $.ConvertObjectToArr({
                                            column: 'C_PEDIDO',
                                            token: tokenPedido,
                                        })
                                    }
                                }
                            }
                        )
                    });

                    // Agregamos script para aprobar el movimiento de stock
                    $.AddPetition({
                        type: '4',
                        transaction: true,
                        items: $.ConvertObjectToArr({
                            script: 'spw_gbl_aprobar_movimiento_stock',
                            C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                            C_DOCUMENTO: codPedido,
                            FLAG_DOCUMENTO: 'pdv',
                            C_USUARIO_REGISTRO: $.solver.session.SESSION_ID
                        }, {
                            C_DOCUMENTO: {
                                action: {
                                    name: 'GetParentId',
                                    args: $.ConvertObjectToArr({
                                        column: 'C_PEDIDO',
                                        token: tokenPedido,
                                    })
                                }
                            }
                        })
                    });

                    // Script para validar que todos los datos esten correctamente registrados
                    $.AddPetition({
                        type: '4',
                        transaction: true,
                        items: $.ConvertObjectToArr({
                            script: 'spw_gbl_validar_movimientos_cobranza',
                            C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                            C_DOCUMENTO: codPedido,
                        }, {
                            C_DOCUMENTO: {
                                action: {
                                    name: 'GetParentId',
                                    args: $.ConvertObjectToArr({
                                        column: 'C_PEDIDO',
                                        token: tokenPedido,
                                    })
                                }
                            }
                        })
                    })

                    // Agregamos script para declarar la venta
                    //var tokenDeclaracion = $.AddPetition({
                    //    type: '4',
                    //    transaction: true,
                    //    items: $.ConvertObjectToArr({
                    //        script: 'spw_gbl_registrar_declaracion_sunat_venta',
                    //        C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                    //        C_DOCUMENTO: codPedido,
                    //        FLAG_DOCUMENTO: 'pdv',
                    //        C_USUARIO_REGISTRO: $.solver.session.SESSION_ID
                    //    }, {
                    //        C_DOCUMENTO: {
                    //            action: {
                    //                name: 'GetParentId',
                    //                args: $.ConvertObjectToArr({
                    //                    column: 'C_PEDIDO',
                    //                    token: tokenPedido,
                    //                })
                    //            }
                    //        }
                    //    })
                    //});

                    // Enviamos peticiones
                    $.SendPetition({
                        onReady: function (result) {

                            fnImprimirDocumento($.solver.session.SESSION_EMPRESA, $('#C_PEDIDO').val());

                            fnValidarDpsGuardar(function () {

                                $.CloseStatusBar();
                                //fnObtenerAlertaOk('La venta ha sido registrada')
                                fnActionNuevo();

                                baulPedidos = JSON.parse('[]');
                                $('.mytable-pedido').html('');

                                fnObtenerDatosCaja();
                                fnMostrarPedidos();

                                $(dialogPagoDetallado).modal('hide');

                            });

                        },
                        onBefore: function () {
                            $.DisplayStatusBar({ message: 'Registrando venta' });
                        },
                        onError: function (_error) {
                            $.CloseStatusBar();
                            //$.ShowError({ error: _error });
                            fnObtenerAlertaError('Ha ocurrido un error, por favor vuelva a intentarlo.');
                        }
                    });

                }
                const fnValidar = function () {
                    var contMetodoPago = metodoPagoArr.length;
                    var contCliente = $(dialogPagoDetallado).find('#C_CLIENTE').val();
                    var totalPagar = $('#TOTALPAGAR').val();
                    var saldoPagar = $(dialogPagoDetallado).find('#saldoPagar').val();
                    var aPagar = $(dialogPagoDetallado).find('#aPagar').val();
                    var contPagos = $(dialogPagoDetallado).find('#tblListaPagos').jqxGrid('getrows').length;
                    var c_moneda = $(dialogPagoDetallado).find('.active-box-moneda').attr('data-codigo');
                    var tipoCambio = parseFloat($(dialogPagoDetallado).find('#TC').val());

                    if (contCliente == '') {
                        fnObtenerAlertaWarning('Por favor seleccione el cliente.')
                        return false;
                    };

                    if (saldoPagar != 0 && contPagos == 0) {
                        fnObtenerAlertaWarning('Por favor ingrese monto a pagar.')
                        return false;
                    } else {

                        if (saldoPagar != 0) {
                            fnObtenerAlertaWarning('Por favor ingrese monto a pagar.')
                            return false;
                        }

                        fnObtenerAlertaConfirm('Mensaje del sistema', '¿Seguro de registrar el pago del pedido?', fnGuardar, null)

                    };

                }
                fnValidar();
                buttonState = false;
            };
            const fnMostrarModalDetallado = function () {

                const tokenPagoDetallado = $.CreateToken();
                let dialogPagoDetallado = bootbox.dialog({
                    title: 'Pago detallado',
                    message: `<div id="${tokenPagoDetallado}"></div>`,
                    className: 'modal-search-100',
                    onEscape: false
                });
                const controlsPagoDetallado = {
                    buttonCancel: {
                        class: 'col-auto',
                        html: '<button type="button" id="btnCancelarPedido" class="btn btn-lg btn-gray float-left"><i class="fa fa-close"></i>&nbsp;Cancelar</button>'
                    },
                    buttonNuevoCliente: {
                        class: 'col-auto',
                        html: '<button type="button" id="btnNuevoCliente" class="btn btn-lg btn-orange float-left"><i class="fa fa-plus"></i>&nbsp;Nuevo Cliente</button>'
                    },
                    buttonEditar: {
                        class: 'col',
                        html: '<button type="button" id="btnEditarCliente" class="btn btn-lg btn-orange float-left" style="display: none;"><i class="fa fa-pencil-square-o" aria-hidden="true"></i>&nbsp;Editar Cliente</button>'
                    },
                    buttonAceptar: {
                        class: 'col',
                        html: '<button type="button" id="btnGuardarPedido" class="btn btn-lg btn-danger float-right"><i class="fa fa-floppy-o" aria-hidden="true"></i>&nbsp;Pagar</button>'
                    },
                };

                dialogPagoDetallado.init(function () {
                    setTimeout(function () {
                        // Agregamos html inicial
                        $(dialogPagoDetallado).find(`#${tokenPagoDetallado}`).html(`
                            <form name="${tokenPagoDetallado}_form">
                                <div class="row mt-2 site"></div>
                            </form>
                        `);

                        // Agregamos controles
                        for (var item in controlsPagoDetallado) {
                            var control = controlsPagoDetallado[item];
                            $(dialogPagoDetallado).find(`form[name=${tokenPagoDetallado}_form] .site`).append(`
                                <div class="${control.class}">${control.html}</div>
                            `);
                        };
                        $(dialogPagoDetallado).find(`form[name=${tokenPagoDetallado}_form]`).append(`
                            <hr />
                            <div class="row" id="zone-pagoDetallado"></div>
                        `);

                        // Pintamos html
                        var htmlPagoDetallado = $('#divDetallado').html();
                        $(dialogPagoDetallado).find('#zone-pagoDetallado').html(htmlPagoDetallado);

                        $.GetQuery({
                            query: ['q_restaurant_obtener_metodospago', 'gbl_obtener_tipo_cambio', 'q_puntoventa_procesos_puntoventa_obtenerdatospordefecto'],
                            items: [
                                {
                                    C_EMPRESA: $.solver.session.SESSION_EMPRESA
                                },
                                {
                                    C_FECHA: moment(new Date()).format('DD/MM/YYYY')
                                },
                                {
                                    C_EMPRESA: $.solver.session.SESSION_EMPRESA
                                },
                            ],
                            onReady: function (result) {

                                $.CloseStatusBar();

                                const {
                                    C_TIPO_DOC,
                                    C_CLIENTE,
                                    C_MONEDA,
                                    C_METODO_PAGO
                                } = result['q_puntoventa_procesos_puntoventa_obtenerdatospordefecto'].result.rows[0];

                                let precioTotal = 0.00;
                                let operacionesGratuitas = 0.00;
                                for (var index in objPedido.platos) {
                                    var plato = objPedido.platos[index];
                                    if (plato.Estado == '*') {
                                        var afectacion = parseInt(plato.AfectacionCabecera);
                                        if (afectacion == 0) operacionesGratuitas += (plato.Cantidad * plato.Precio);
                                        if (afectacion == 1) precioTotal += (plato.Cantidad * plato.Precio);
                                    }
                                }

                                precioTotal = parseFloat(precioTotal.toFixed(2));
                                operacionesGratuitas = parseFloat(operacionesGratuitas.toFixed(2));

                                // Seteamos valores
                                $('#TOTALPAGAR').val(precioTotal)
                                $('#SALDOPAGAR').val(precioTotal)
                                $(dialogPagoDetallado).find('#totalPagar').val(numeral(precioTotal).format('0,0.00'));
                                $(dialogPagoDetallado).find('#saldoPagar').val(numeral(precioTotal).format('0,0.00'));

                                // Seteamos tipo de cambio
                                const dataTipoCambio = result['gbl_obtener_tipo_cambio'].result.rows[0];
                                $(dialogPagoDetallado).find('#TC').val(dataTipoCambio.PRECIO_VENTA);

                                // Pintamos metodos de pago
                                const dataMetodoPago = result['q_restaurant_obtener_metodospago'].result.rows;
                                const tokenPrimero = fnPintarMetodosPago(dialogPagoDetallado, dataMetodoPago, C_METODO_PAGO);

                                // Eventos de opciones
                                $(dialogPagoDetallado).find('div.box-tipo-comprobante').click(function () {
                                    if ($(this).attr('data-selectable') == '*') {
                                        $.each($(dialogPagoDetallado).find('.box-tipo-comprobante'), function (i, v) {
                                            $(v).removeClass('active-box-comprobante');
                                        });
                                        $(this).addClass('active-box-comprobante');
                                    }
                                });
                                $(dialogPagoDetallado).find('div.box-tipo-moneda').click(function () {
                                    $.each($(dialogPagoDetallado).find('.box-tipo-moneda'), function (i, v) {
                                        $(v).removeClass('active-box-moneda');
                                    });
                                    $(this).addClass('active-box-moneda');
                                    if ($(dialogPagoDetallado).find('.active-box-moneda').attr('data-codigo') == '07235') {
                                        $(dialogPagoDetallado).find('.tipoCambio').show();
                                        $(dialogPagoDetallado).find('.box-billete-soles').hide();
                                        $(dialogPagoDetallado).find('.box-billete-dolares').show();
                                    }
                                    else {
                                        $(dialogPagoDetallado).find('.box-billete-soles').show();
                                        $(dialogPagoDetallado).find('.box-billete-dolares').hide();
                                        $(dialogPagoDetallado).find('.tipoCambio').hide();
                                    }
                                });
                                $(dialogPagoDetallado).find('div.box-billete-soles,div.box-billete-dolares').click(function () {
                                    let montosPagos = 0.00;
                                    let totalPagar = 0.00;
                                    $.each($(dialogPagoDetallado).find('#tblListaPagos').jqxGrid('getRows'), function (i, item) {
                                        montosPagos += parseFloat(item.MONTO);
                                    });
                                    totalPagar = parseFloat($('#TOTALPAGAR').val());

                                    if (parseFloat($('#SALDOPAGAR').val()) > 0 && montosPagos < totalPagar) {
                                        var monto = $(this).attr('data-codigo');
                                        //if (!$(dialogPagoDetallado).find('div#' + tokenPrimero).hasClass('active-box')) $(dialogPagoDetallado).find('div#' + tokenPrimero).trigger('click');
                                        $(dialogPagoDetallado).find('#aPagar').val(monto);
                                        $(dialogPagoDetallado).find('#btnAgregar').trigger('click');
                                    }
                                    else {
                                        fnObtenerAlertaWarning('Pago completo')
                                        $(dialogPagoDetallado).find('#aPagar').val('');
                                        fnCalcularMontos(dialogPagoDetallado);
                                    }
                                });
                                $(dialogPagoDetallado).find('.box-tarjeta').click(function () {
                                    if ($(this).hasClass('active-box-tarjeta')) {
                                        $(this).removeClass('active-box-tarjeta');
                                        $(dialogPagoDetallado).find('#operacion').hide();
                                        $(dialogPagoDetallado).find('#nro_operacion').removeAttr('required');
                                    }
                                    else {
                                        $.each($(dialogPagoDetallado).find('.box-tarjeta'), function (i, v) {
                                            $(v).removeClass('active-box-tarjeta');
                                        });
                                        $(this).addClass('active-box-tarjeta');
                                        $(dialogPagoDetallado).find('#operacion').show();
                                        $(dialogPagoDetallado).find('#nro_operacion').attr('required', 'required');
                                    }
                                });

                                /*
                                 * Christopher Baltazar
                                 * 
                                 * Consultamos por el nroDocumento la lista de clientes
                                 * Si devuelve 0 muestra error cliente no encontrado
                                 * Si devuelve 1 y el codCliente es el mismo que ya se muestra en pantalla, muestra modal con todos los clientes
                                 * Si devuelve 1 y el codCliente no coincide, obtiene datos del cliente y muestra en pantalla
                                 * Por defecto muestra modal de clientes
                                 * 
                                 */

                                $(dialogPagoDetallado).find('#btnBuscarCliente').click(function () {

                                    var nroDocumento = $(dialogPagoDetallado).find('#RUC').val()
                                    var codCliente = $(dialogPagoDetallado).find('#C_CLIENTE').val()

                                    // Validamos si el nroDocumento tiene resultados
                                    $.GetQuery({
                                        query: ['gbl_listarclientes'],
                                        items: [{
                                            C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                                            NOMBRE: nroDocumento
                                        }],
                                        onReady: function (result) {
                                            if (result.length == 0) {
                                                fnObtenerAlertaError('<i class="fa fa-exclamation-triangle" aria-hidden="true"></i>&nbsp;<label>CLIENTE NO ENCONTRADO</label>')
                                                return;
                                            }

                                            if (result.length == 1) {
                                                if (codCliente == result[0]['C_CLIENTE']) {
                                                    nroDocumento = '';
                                                }
                                                else {
                                                    $(dialogPagoDetallado).find('#C_CLIENTE').val(result[0]['C_CLIENTE'])
                                                    fnObtenerCliente(dialogPagoDetallado, C_CLIENTE);
                                                    return;
                                                }
                                            }

                                            $.solver.fn.busquedaCliente({
                                                buscar: nroDocumento,
                                                onSelected: function (row) {
                                                    $(dialogPagoDetallado).find('#C_CLIENTE').val(row['C_CLIENTE'])
                                                    fnObtenerCliente(dialogPagoDetallado, C_CLIENTE);
                                                }
                                            })
                                        }
                                    });
                                });

                                /*
                                 * Christopher Baltazar
                                 * 
                                 * Nuevo cliente y editar cliente utilizan la misma función
                                 * 
                                 */
                                $(dialogPagoDetallado).find('#btnNuevoCliente').click(function () {
                                    if (!buttonState) {
                                        buttonState = true;
                                        fnEditarCliente(dialogPagoDetallado);
                                    }
                                })
                                $(dialogPagoDetallado).find('#btnEditarCliente').click(function (e) {
                                    if (!buttonState) {
                                        buttonState = true;
                                        var codCliente = $(dialogPagoDetallado).find('#C_CLIENTE').val()
                                        fnEditarCliente(dialogPagoDetallado, codCliente);
                                    }
                                });
                                $(dialogPagoDetallado).find('#btnAgregar').click(function () {
                                    if (!buttonState) {
                                        buttonState = true;
                                        fnAgregarPago(dialogPagoDetallado);
                                        $(dialogPagoDetallado).find('#btnCancelarPedido').focus();
                                        buttonState = false;
                                    }
                                });
                                $(dialogPagoDetallado).find('#btnCompletar').click(function () {
                                    if (!buttonState) {
                                        buttonState = true;
                                        $(dialogPagoDetallado).find('#aPagar').val(parseFloat($('#SALDOPAGAR').val()));
                                        buttonState = false;
                                        $(dialogPagoDetallado).find('#btnAgregar').trigger('click');
                                    }
                                });
                                $(dialogPagoDetallado).find('#btnGuardarPedido').click(function () {
                                    if (!buttonState) {
                                        buttonState = true;
                                        fnGuardarPedido(dialogPagoDetallado);
                                    }
                                });
                                $(dialogPagoDetallado).find('#btnCancelarPedido').click(function () {
                                    if (!buttonState) {
                                        buttonState = true;
                                        $(dialogPagoDetallado).modal('hide');
                                        buttonState = false;
                                    }
                                });
                                $(dialogPagoDetallado).find('#aPagar').keyup(function (event) {
                                    if (event.keyCode == 13) $(dialogPagoDetallado).find('#btnAgregar').trigger('click');
                                });
                                $(dialogPagoDetallado).find('#RUC').keyup(function () {
                                    $(dialogPagoDetallado).find('#NOMBRE').val('')
                                    $(dialogPagoDetallado).find('#C_CLIENTE').val('')
                                })

                                fnCrearTabla(dialogPagoDetallado);

                                // Seteamos valores por defecto

                                if (precioTotal <= 700 && $('#C_CLIENTE_DELIVERY').val() == '') {
                                    if (C_CLIENTE != '') {
                                        $(dialogPagoDetallado).find('#C_CLIENTE').val(C_CLIENTE);
                                        fnObtenerCliente(dialogPagoDetallado, C_CLIENTE);
                                    }
                                }

                                if ($('#C_CLIENTE_DELIVERY').val() != '') {
                                    $(dialogPagoDetallado).find('#C_CLIENTE').val($('#C_CLIENTE_DELIVERY').val());
                                    fnObtenerCliente(dialogPagoDetallado, $('#C_CLIENTE_DELIVERY').val());
                                }

                                if (C_TIPO_DOC != '' && $('#TIPO_COMPROBANTE').val() == '') {
                                    $('.box-tipo-comprobante').removeClass('active-box-comprobante');
                                    $.each($('.box-tipo-comprobante'), function (i, v) {
                                        var codigo = $(v).attr('data-codigo');
                                        if (codigo == C_TIPO_DOC) {
                                            $(v).trigger('click');
                                        }
                                    });
                                };
                                if ($('#TIPO_COMPROBANTE').val() != '') {
                                    $('.box-tipo-comprobante').removeClass('active-box-comprobante');
                                    $.each($('.box-tipo-comprobante'), function (i, v) {
                                        var codigo = $(v).attr('data-codigo');
                                        if (codigo == $('#TIPO_COMPROBANTE').val()) {
                                            $(v).trigger('click');
                                        }
                                    });
                                }

                                if (C_MONEDA != '') {
                                    $('.box-tipo-moneda').removeClass('active-box-moneda');
                                    $.each($('.box-tipo-moneda'), function (i, v) {
                                        var codigo = $(v).attr('data-codigo');
                                        if (codigo == C_MONEDA) {
                                            $(v).trigger('click');
                                        }
                                    });
                                };

                                if (C_METODO_PAGO != '' && $('#METODO_PAGO_DELIVERY').val() == '') {
                                    $('.box-tipo-pago').removeClass('active-box');
                                    $.each($('.box-tipo-pago'), function (i, v) {
                                        var codigo = $(v).attr('data-idpago');
                                        if (codigo == C_METODO_PAGO) {
                                            $(v).trigger('click');
                                        }
                                    });
                                };
                                if ($('#METODO_PAGO_DELIVERY').val() != '') {
                                    $('.box-tipo-pago').removeClass('active-box');
                                    $.each($('.box-tipo-pago'), function (i, v) {
                                        var codigo = $(v).attr('data-idpago');
                                        if (codigo == $('#METODO_PAGO_DELIVERY').val()) {
                                            $(v).trigger('click');
                                        }
                                    });
                                }

                            },
                            onError: function (error) {
                                $.CloseStatusBar();
                                $.ShowError({ error });
                            },
                            onBefore: function () {
                                $.DisplayStatusBar({ message: 'Obteniendo información...' });
                            },
                        });

                    }, 150);
                });

                $('.bootbox .modal-dialog').draggable({
                    handle: '.modal-header'
                });
                $('.bootbox .modal-header').css('cursor', 'move');
            };

            fnMostrarModalDetallado();
            buttonState = false;

        };
        const fnActionVerDetallado = function (c_pedido, data_pedido) {

            const empresa = $.solver.session.SESSION_EMPRESA;

            const token = $.CreateToken();
            let dialog = bootbox.dialog({
                title: `Detalle de Pedido [${data_pedido.NRO_PEDIDO}]`,
                message: `<div id="${token}"></div>`,
                className: 'modal-search-60',
                onEscape: true,
                centerVertical: true
            });
            const controls = {
                cod_pedido: {
                    class: 'col',
                    html: `
                        <label><strong>NRO PEDIDO:</strong></label><br/>
                        <input class="form-control form-control-md" name="cod_pedido" value="${data_pedido.NRO_PEDIDO}" autocomplete="off" readonly="readonly"/>
                    `
                },
                mesa_pedido: {
                    class: 'col',
                    html: `
                        <label><strong>MESA(S):</strong></label><br/>
                        <input class="form-control form-control-md" name="mesa_pedido" value="${data_pedido.NOM_MESAS}" autocomplete="off" readonly="readonly"/>
                    `
                },
                caja_pedido: {
                    class: 'col',
                    html: `
                        <label><strong>CAJA:</strong></label><br/>
                        <input class="form-control form-control-md" name="caja_pedido" value="${data_pedido.NOMBRE_CAJA}" autocomplete="off" readonly="readonly"/>
                    `
                },
                fec_pedido: {
                    class: 'col',
                    html: `
                        <label><strong>FECHA PEDIDO:</strong></label><br/>
                        <input class="form-control form-control-md" name="fec_pedido" value="${data_pedido.FECHA_PEDIDO}" autocomplete="off" readonly="readonly"/>
                    `
                },
                usu_pedido: {
                    class: 'col',
                    html: `
                        <label><strong>USUARIO:</strong></label><br/>
                        <input class="form-control form-control-md" name="usu_pedido" value="${data_pedido.C_USUARIO}" autocomplete="off" readonly="readonly"/>
                    `
                },
            };

            dialog.init(function () {
                setTimeout(function () {

                    // Agregamos html inicial
                    $(dialog).find(`#${token}`).html(`
                                <form name="${token}_form">
                                    <div class="row mt-2 site"></div>
                                </form>
                                <div class="row mt-3">
                                    <div class="col-12"><div id="${token}_table"></div></div>
                                </div>
                            `);

                    // Agregamos controles
                    for (var item in controls) {
                        var control = controls[item];
                        $(dialog).find(`form[name=${token}_form] .site`).append(`
                                    <div class="${control.class}">${control.html}</div>
                                `);
                    };

                    // declaramos variables
                    let _controls = null;
                    const form = $(dialog).find(`form[name=${token}_form]`);
                    const table = $(dialog).find(`#${token}_table`);
                    const fnCrearTabla = function () {

                        table.CreateGrid({
                            query: 'q_puntoventa_procesos_puntoventa_obtenerdetallepedido_view',
                            items: {
                                C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                                C_PEDIDO: c_pedido
                            },
                            hiddens: ['CORTESIA'],
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
                                'Codigo': {
                                    width: 80,
                                    cellsAlign: 'center'
                                },
                                'Nombre Producto': {
                                    width: 300,
                                    cellsAlign: 'left'
                                },
                                'Precio': {
                                    width: 80,
                                    cellsAlign: 'left',
                                    cellsAlign: 'right',
                                    cellsFormat: 'd2',
                                    columnType: 'numberinput',
                                },
                                'Cantidad': {
                                    width: 80,
                                    cellsAlign: 'left',
                                    cellsAlign: 'right',
                                    cellsFormat: 'd2',
                                    columnType: 'numberinput',
                                },
                                'SubTotal': {
                                    width: 80,
                                    cellsAlign: 'left',
                                    cellsAlign: 'right',
                                    cellsFormat: 'd2',
                                    columnType: 'numberinput',
                                    aggregates: ['sum'], aggregatesRenderer: function (aggregates, column, element) {
                                        var formatNumber = aggregates.sum;
                                        if (formatNumber === undefined)
                                            formatNumber = '';
                                        return `<div class="h-30 d-flex justify-content-end align-items-center font-weight-bold">
                                                    <strong> ${formatNumber} </strong>
                                                </div>`;
                                    }
                                },
                                'Nro Comanda': {
                                    text: 'Comanda',
                                    width: 80,
                                    cellsAlign: 'center'
                                },
                            },
                            config: {
                                pageable: true,
                                sortable: true,
                                height: 300,
                                //pageSize: 10,
                                rowsheight: 53,
                                showaggregates: true,
                                showstatusbar: true,
                                statusbarheight: 20,
                            }
                        });


                    };

                    fnCrearTabla();

                }, 150);
            });

        };
        const fnValidarDpsGuardar = function (callback) {

            const codPedido = $('#C_PEDIDO').val();

            if (codPedido == '') {
                fnObtenerAlertaWarning('Primero debes guardar el pedido.')
                return;
            };

            $.GetQuery({
                query: ['q_obtener_datos_impresion_pdv'],
                items: [{
                    C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                    C_PEDIDO: codPedido,
                    C_CAJA: function () {
                        return objMyCaja.C_CAJA || null;
                    }
                }],
                onReady: function (result) {

                    var object = result[0];

                    if (object.IND_PRINT_COMANDA_DPS_PAGO == '*') {
                        fnEnviarPedido(function () {
                            if (typeof callback == 'function') callback();
                        });
                    } else {
                        if (typeof callback == 'function') callback();
                    };

                }
            });

        };
        /* ACCIONES */

        /* IMPRIMIR */
        const fnMostrarPdf = function (token) {
            bootbox.dialog({
                message: `<div class="embed-responsive embed-responsive-16by9"><iframe class= "embed-responsive-item" src="https://api.solver.com.pe/v1//service/ViewFile/${token}/" allowfullscreen></iframe></div>`,
                closeButton: true,
                className: 'modal-75'
            });
        };
        const fnImprimirBaloteo = function () {

            $.DisplayStatusBar({ message: 'Generando pdf.' });

            $.CreatePDFDocument({
                empresa: $.solver.session.SESSION_EMPRESA,
                formato: 'formato_estandar_resumen_caja',
                papel: 'Ticket80',
                querys: [
                    {
                        name: 'cabecera',
                        args: $.ConvertObjectToArr({
                            modeWork: 'd', //diccionario
                            script: 'q_puntoventa_procesos_baloteo_de_caja_cabecera',
                            C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                            C_CAJA: objMyCaja.C_CAJA,
                            C_USUARIO: objMyCaja.C_USUARIO,
                            C_FECHA: objMyCaja.C_FECHA,
                            C_OPERACION: objMyCaja.C_OPERACION,
                            TIPO_RESULTADO: 'LISTA-PRODUCTOS',
                        })
                    },
                    {
                        name: 'productos_vendidos',
                        args: $.ConvertObjectToArr({
                            //modeWork: 'd', //diccionario
                            script: 'q_puntoventa_procesos_baloteo_de_caja',
                            C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                            C_CAJA: objMyCaja.C_CAJA,
                            C_USUARIO: objMyCaja.C_USUARIO,
                            C_FECHA: objMyCaja.C_FECHA,
                            C_OPERACION: objMyCaja.C_OPERACION,
                            TIPO_RESULTADO: 'LISTA-PRODUCTOS',
                        })
                    },
                    {
                        name: 'productos_cortesia',
                        args: $.ConvertObjectToArr({
                            //modeWork: 'd', //diccionario
                            script: 'q_puntoventa_procesos_baloteo_de_caja',
                            C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                            C_CAJA: objMyCaja.C_CAJA,
                            C_USUARIO: objMyCaja.C_USUARIO,
                            C_FECHA: objMyCaja.C_FECHA,
                            C_OPERACION: objMyCaja.C_OPERACION,
                            TIPO_RESULTADO: 'LISTA-PRODUCTOS-CORTESIA',
                        })
                    },
                    {
                        name: 'metodos_pago',
                        args: $.ConvertObjectToArr({
                            //modeWork: 'd', //diccionario
                            script: 'q_puntoventa_procesos_baloteo_de_caja',
                            C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                            C_CAJA: objMyCaja.C_CAJA,
                            C_USUARIO: objMyCaja.C_USUARIO,
                            C_FECHA: objMyCaja.C_FECHA,
                            C_OPERACION: objMyCaja.C_OPERACION,
                            TIPO_RESULTADO: 'LISTA-METODOS-PAGO',
                        })
                    },
                    {
                        name: 'comprobantes_ok',
                        args: $.ConvertObjectToArr({
                            //modeWork: 'd', //diccionario
                            script: 'q_puntoventa_procesos_baloteo_de_caja',
                            C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                            C_CAJA: objMyCaja.C_CAJA,
                            C_USUARIO: objMyCaja.C_USUARIO,
                            C_FECHA: objMyCaja.C_FECHA,
                            C_OPERACION: objMyCaja.C_OPERACION,
                            TIPO_RESULTADO: 'LISTA-COMPROBANTES-OK',
                        })
                    },
                    //{
                    //    name: 'comprobantes_anulados',
                    //    args: $.ConvertObjectToArr({
                    //        //modeWork: 'd', //diccionario
                    //        script: 'q_puntoventa_procesos_baloteo_de_caja',
                    //        C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                    //        C_CAJA: objMyCaja.C_CAJA,
                    //        C_USUARIO: objMyCaja.C_USUARIO,
                    //        C_FECHA: objMyCaja.C_FECHA,
                    //        C_OPERACION: objMyCaja.C_OPERACION,
                    //        TIPO_RESULTADO: 'LISTA-COMPROBANTES-ANULADOS',
                    //    })
                    //},
                    {
                        name: 'productos_anulados',
                        args: $.ConvertObjectToArr({
                            //modeWork: 'd', //diccionario
                            script: 'q_puntoventa_procesos_baloteo_de_caja',
                            C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                            C_CAJA: objMyCaja.C_CAJA,
                            C_USUARIO: objMyCaja.C_USUARIO,
                            C_FECHA: objMyCaja.C_FECHA,
                            C_OPERACION: objMyCaja.C_OPERACION,
                            TIPO_RESULTADO: 'LISTA-COMPROBANTES-ANULADOS-PRODUCTO',
                        })
                    },
                    {
                        name: 'cuentas_anuladas',
                        args: $.ConvertObjectToArr({
                            //modeWork: 'd', //diccionario
                            script: 'q_puntoventa_procesos_baloteo_de_caja',
                            C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                            C_CAJA: objMyCaja.C_CAJA,
                            C_USUARIO: objMyCaja.C_USUARIO,
                            C_FECHA: objMyCaja.C_FECHA,
                            C_OPERACION: objMyCaja.C_OPERACION,
                            TIPO_RESULTADO: 'LISTA-COMPROBANTES-ANULADOS-CUENTA',
                        })
                    },
                    {
                        name: 'documentos_anulados',
                        args: $.ConvertObjectToArr({
                            //modeWork: 'd', //diccionario
                            script: 'q_puntoventa_procesos_baloteo_de_caja',
                            C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                            C_CAJA: objMyCaja.C_CAJA,
                            C_USUARIO: objMyCaja.C_USUARIO,
                            C_FECHA: objMyCaja.C_FECHA,
                            C_OPERACION: objMyCaja.C_OPERACION,
                            TIPO_RESULTADO: 'LISTA-COMPROBANTES-ANULADOS-DOCUMENTO',
                        })
                    },
                    {
                        name: 'comprobantes_por_hora',
                        args: $.ConvertObjectToArr({
                            //modeWork: 'd', //diccionario
                            script: 'q_puntoventa_procesos_baloteo_de_caja',
                            C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                            C_CAJA: objMyCaja.C_CAJA,
                            C_USUARIO: objMyCaja.C_USUARIO,
                            C_FECHA: objMyCaja.C_FECHA,
                            C_OPERACION: objMyCaja.C_OPERACION,
                            TIPO_RESULTADO: 'LISTA-COMPROBANTE-HORA',
                        })
                    },
                    {
                        name: 'comprobante_por_metodopago',
                        args: $.ConvertObjectToArr({
                            //modeWork: 'd', //diccionario
                            script: 'q_puntoventa_procesos_baloteo_de_caja',
                            C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                            C_CAJA: objMyCaja.C_CAJA,
                            C_USUARIO: objMyCaja.C_USUARIO,
                            C_FECHA: objMyCaja.C_FECHA,
                            C_OPERACION: objMyCaja.C_OPERACION,
                            TIPO_RESULTADO: 'LISTA-COMPROBANTE-METODOS-PAGO',
                        })
                    },
                    {
                        name: 'tblCocinas',
                        args: $.ConvertObjectToArr({
                            //modeWork: 'd', //diccionario
                            script: 'q_puntoventa_procesos_baloteo_de_caja',
                            C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                            C_CAJA: objMyCaja.C_CAJA,
                            C_USUARIO: objMyCaja.C_USUARIO,
                            C_FECHA: objMyCaja.C_FECHA,
                            C_OPERACION: objMyCaja.C_OPERACION,
                            TIPO_RESULTADO: 'LISTA-COCINA',
                        })
                    },

                ],
                onReady: function (result) {
                    fnMostrarPdf(result.token)
                    $.CloseStatusBar();
                }
            });

        };
        const fnImprimirComanda = function (codComanda) {

            const codPedido = $('#C_PEDIDO').val();

            if (codPedido == '') {
                fnObtenerAlertaWarning('Primero debes guardar el pedido.')
                return;
            };

            $.GetQuery({
                query: ['q_obtener_datos_impresion_pdv', 'q_obtener_cocinas_para_impresion_v3'],
                items: [
                    {
                        C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                        C_PEDIDO: codPedido,
                        C_CAJA: function () {
                            return objMyCaja.C_CAJA || null;
                        }
                    }, {
                        empresa: $.solver.session.SESSION_EMPRESA,
                        pedido: codPedido,
                        comanda: codComanda,
                        caja: function () {
                            return objMyCaja.C_CAJA || null;
                        }
                    }
                ],
                onReady: function (result) {

                    if (result['q_obtener_datos_impresion_pdv'].result.rows.length == 0) {
                        fnObtenerAlertaWarning('No se pudo generar la impresion.')
                        return;
                    };
                    if (result['q_obtener_cocinas_para_impresion_v3'].result.rows.length == 0) {
                        fnObtenerAlertaWarning('No hay cocinas para la impresion.')
                        return;
                    };

                    var object = result['q_obtener_datos_impresion_pdv'].result.rows[0];
                    var cocinas = result['q_obtener_cocinas_para_impresion_v3'].result.rows;
                    var fnRegImpresion = function (cocina) {

                        if (cocina.impresora_cocina == '') cocina.impresora_cocina = object.C_IMPRESORA; //si no hay impresora para la cocina
                        //if (object.IND_IMPRIME_COMANDA == '*') cocina.impresora_cocina = object.C_IMPRESORA; //si la comanda debe ir a la misma impresora de caja

                        if (cocina.impresora_cocina == '') {
                            fnObtenerAlertaWarning('No hay impresoras para imprimir comanda.');
                        }
                        else {
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
                                            script: 'q_restaurant_print_comanda_detalle_v3',
                                            empresa: $.solver.session.SESSION_EMPRESA,
                                            pedido: codPedido,
                                            comanda: codComanda,
                                            cocina: cocina.c_cocina,
                                            separado: cocina.print_separado,
                                            caja: function () {
                                                return objMyCaja.C_CAJA || null;
                                            }
                                        })
                                    }
                                ],
                                onReady: function () {
                                    fnObtenerAlertaOk('Pedido enviado satisfactoriamente.');
                                }
                            });
                            //*********************************************
                        };

                    };

                    for (var item in cocinas) {
                        var cocina = cocinas[item];
                        fnRegImpresion(cocina);
                    };

                },
                onError: function (_error) {
                    $.CloseStatusBar();
                    $.ShowError({ error: _error });
                }
            });

        };
        const fnImprimirPreCuenta = function (empresa, codPedido) {
            if (codPedido == '') {
                fnObtenerAlertaWarning('Primero debes guardar el pedido.')
                return;
            };

            if (objPedido.platos.filter(x => x['EnviadCocina'] == '&' && x['Estado'] == '*').length > 0) {
                fnObtenerAlertaWarning('Aún hay platos sin enviar a cocina.')
                return;
            }

            $.GetQuery({
                query: ['q_obtener_datos_impresion_pdv'],
                items: [{
                    C_EMPRESA: empresa,
                    C_PEDIDO: codPedido,
                    C_CAJA: function () {
                        return objMyCaja.C_CAJA || null;
                    }
                }],
                onReady: function (result) {

                    if (result.length == 0) {

                        fnObtenerAlertaWarning('No se pudo generar la impresion.');

                    } else {

                        var object = result[0];

                        if (object.C_IMPRESORA == '') {
                            fnObtenerAlertaWarning('No hay impresoras para imprimir pre-cuenta.');
                        } else {

                            //Envia Impresion de Documento al servicio
                            $.SendPrinter({
                                empresa: empresa,
                                formato: 'formato_estandar_precuenta_pdv',
                                impresora: object.C_IMPRESORA,
                                copias: object.COPIAS_PRE_CUENTA,
                                papel: 'Ticket80',
                                querys: [
                                    {
                                        name: 'cabecera',
                                        args: $.ConvertObjectToArr({
                                            modeWork: 'd', //diccionario
                                            script: 'q_puntoventa_procesos_puntoventa_precuenta_print_cabecera',
                                            empresa: empresa,
                                            pedido: codPedido
                                        })
                                    },
                                    {
                                        name: 'detalle',
                                        args: $.ConvertObjectToArr({
                                            script: 'q_puntoventa_procesos_puntoventa_precuenta_print_detalle',
                                            empresa: empresa,
                                            pedido: codPedido
                                        })
                                    },
                                ],
                                onReady: function () {
                                    fnObtenerAlertaOk('Pre-Cuenta enviado a impresión.')
                                }
                            });
                            //*********************************************

                        };

                    };

                },
                onError: function (_error) {
                    $.CloseStatusBar();
                    $.ShowError({ error: _error });
                }
            });

        };
        const fnImprimirDocumento = function (empresa, codPedido) {

            $.GetQuery({
                query: ['q_obtener_datos_impresion_pdv'],
                items: [{
                    C_EMPRESA: empresa,
                    C_PEDIDO: codPedido,
                    C_CAJA: function () {
                        return objMyCaja.C_CAJA || null;
                    }
                }],
                onReady: function (result) {

                    if (result.length != 0) {

                        var object = result[0];

                        if (object.C_IMPRESORA == '') {

                            fnObtenerAlertaWarning('No hay impresoras para imprimir comprobante.');

                        } else {

                            //Envia Impresion de Documento al servicio
                            $.SendPrinter({
                                empresa: empresa,
                                formato: 'formato_estandar_comprobante_caja_ticket',
                                impresora: object.C_IMPRESORA,
                                copias: object.COPIAS_COMPROBANTE,
                                papel: 'Ticket80',
                                querys: [
                                    {
                                        name: 'cabecera',
                                        args: $.ConvertObjectToArr({
                                            ///connectTo: 'SRVSQL_FTE',
                                            modeWork: 'd', //diccionario
                                            script: 'gbl_obtener_cabecera_comprobante_fte_2',
                                            C_PEDIDO: codPedido,
                                            C_EMPRESA: empresa
                                        })
                                    },
                                    {
                                        name: 'detalle',
                                        args: $.ConvertObjectToArr({
                                            //connectTo: 'SRVSQL_FTE',
                                            script: 'gbl_obtener_detalle_comprobante_fte_2',
                                            C_PEDIDO: codPedido,
                                            C_EMPRESA: empresa
                                        })
                                    },
                                    {
                                        name: 'cobranza',
                                        args: $.ConvertObjectToArr({
                                            //connectTo: 'SRVSQL_FTE',
                                            script: 'gbl_obtener_cobranza_doc_fte',
                                            pedido: codPedido,
                                            empresa: empresa
                                        })
                                    }
                                ],
                                onReady: function () {
                                    fnObtenerAlertaOk('Documento enviado a impresión.')
                                }
                            });
                            //*********************************************
                        };

                    };

                },
                onError: function (_error) {
                    $.CloseStatusBar();
                    $.ShowError({ error: _error });
                }
            });

        };
        const fnImprimirDocumentoAnulado = function (empresa, codPedido, estadoAnterior) {

            $.GetQuery({
                query: ['q_obtener_datos_impresion_pdv'],
                items: [{
                    C_EMPRESA: empresa,
                    C_PEDIDO: codPedido,
                    C_CAJA: function () {
                        return objMyCaja.C_CAJA || null;
                    }
                }],
                onReady: function (result) {

                    if (result.length != 0) {

                        var object = result[0];

                        if (object.C_IMPRESORA == '') {

                            fnObtenerAlertaWarning('No hay impresoras para imprimir anulación de comprobante.');

                        } else {

                            var scriptFormato = estadoAnterior == '*' ? 'formato_estandar_anulado_ticket' : 'formato_estandar_comprobante_caja_ticket_anulado';
                            var scriptCabecera = estadoAnterior == '*' ? 'q_gbl_formato_ticket_anulado' : 'gbl_obtener_cabecera_comprobante_fte_2'
                            var scriptDetalle = estadoAnterior == '*' ? 'q_gbl_formato_ticket_anulado_detalle' : 'gbl_obtener_detalle_comprobante_fte_2'

                            //Envia Impresion de Documento al servicio
                            $.SendPrinter({
                                empresa: empresa,
                                formato: scriptFormato,
                                impresora: object.C_IMPRESORA,
                                copias: object.COPIAS_ANULACION,
                                papel: 'Ticket80',
                                querys: [
                                    {
                                        name: 'cabecera',
                                        args: $.ConvertObjectToArr({
                                            //connectTo: 'SRVSQL_FTE',
                                            modeWork: 'd', //diccionario
                                            script: scriptCabecera,
                                            C_PEDIDO: codPedido,
                                            C_EMPRESA: empresa
                                        })
                                    },
                                    {
                                        name: 'detalle',
                                        args: $.ConvertObjectToArr({
                                            //connectTo: 'SRVSQL_FTE',
                                            script: scriptDetalle,
                                            C_PEDIDO: codPedido,
                                            C_EMPRESA: empresa
                                        })
                                    },
                                    {
                                        name: 'cobranza',
                                        args: $.ConvertObjectToArr({
                                            //connectTo: 'SRVSQL_FTE',
                                            script: 'gbl_obtener_cobranza_doc_fte',
                                            pedido: codPedido,
                                            empresa: empresa
                                        })
                                    }
                                ],
                                onReady: function () {
                                    fnObtenerAlertaOk('Documento enviado a impresión.')
                                }
                            });
                            //*********************************************

                        };

                    };

                },
                onError: function (_error) {
                    $.CloseStatusBar();
                    $.ShowError({ error: _error });
                }
            });

        };
        const fnReimprimirDocumentos = function (empresa, codPedido, estado) {

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
                    C_CAJA: function () {
                        return objMyCaja.C_CAJA || null;
                    }
                }],
                onReady: function (result) {

                    if (result.length != 0) {

                        var object = result[0];

                        if (object.C_IMPRESORA == '') {

                            fnObtenerAlertaWarning('No hay impresoras para re-imprimir comprobante.');

                        } else {

                            //Envia Impresion de Documento al servicio
                            $.SendPrinter({
                                empresa: empresa,
                                formato: formato,
                                impresora: object.C_IMPRESORA,
                                copias: 1,
                                papel: 'Ticket80',
                                querys: [
                                    {
                                        name: 'cabecera',
                                        args: $.ConvertObjectToArr({
                                            //connectTo: 'SRVSQL_FTE',
                                            modeWork: 'd', //diccionario
                                            script: 'gbl_obtener_cabecera_comprobante_fte_2',
                                            C_PEDIDO: codPedido,
                                            C_EMPRESA: empresa
                                        })
                                    },
                                    {
                                        name: 'detalle',
                                        args: $.ConvertObjectToArr({
                                            //connectTo: 'SRVSQL_FTE',
                                            script: 'gbl_obtener_detalle_comprobante_fte_2',
                                            C_PEDIDO: codPedido,
                                            C_EMPRESA: empresa
                                        })
                                    },
                                    {
                                        name: 'cobranza',
                                        args: $.ConvertObjectToArr({
                                            //connectTo: 'SRVSQL_FTE',
                                            script: 'gbl_obtener_cobranza_doc_fte',
                                            pedido: codPedido,
                                            empresa: empresa
                                        })
                                    }
                                ],
                                onReady: function () {
                                    fnObtenerAlertaOk('Pedido enviado a impresión.')
                                }
                            });
                            //*********************************************

                        };

                    };

                },
                onError: function (_error) {
                    $.CloseStatusBar();
                    $.ShowError({ error: _error });
                }
            });

        };
        const fnReimprimir = function (c_pedido, estado) {

            fnAutorizarAccion('Reimprimir', function (datausuario) {
                fnReimprimirDocumentos($.solver.session.SESSION_EMPRESA, c_pedido, estado);
            });

        };
        /* IMPRIMIR */

        /* FUNCIONES VARIAS */
        const fnPermisosUsuario = function () {
            $.GetQuery({
                query: ['q_pdv_permisos_usuario'],
                items: [{ usuario: $.solver.session.SESSION_ID }],
                onReady: function (permisos) {
                    //Capturamos permisos
                    objPermisos = permisos[0];
                    //Lanzamos funcions de inicio
                    fnValidarConfiguracion();
                }
            });
        };
        const fnValidarConfiguracion = function () {
            //*** valida que el sistema este correctamente configurado
            $.GetQuery({
                query: ['q_gbl_validar_configuracion'],
                items: [{
                    C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                    VENTANA: 'PDV'
                }],
                onError: function (error) {
                    $.CloseStatusBar();
                    $.ShowError({ error });
                },
                onReady: function (result) {

                    var validacion = result[0].MENSAJE;

                    $('#pdvBox .blocked').css({ display: 'none' });

                    if (validacion == 'PDV') {

                        $('#pdvBox .blocked').css({ display: 'block' });
                        $('#pdvBox .blocked .text').html('<i class="fa fa-exclamation-triangle text-danger" aria-hidden="true"></i> Hola <strong>' + $.solver.session.SESSION_NOMBRE + '</strong>, hemos detectado que el sistema no esta configurado correctamente.<br />' + result[0].TEXTOMENSAJE
                            + '<br /><br />Contacta con tu administrador.');

                        isAlert = true;

                    };

                    fnObtenerEstablecimientos();

                }
            });
        };
        const fnObtenerEstablecimientos = function () {
            //*** valida que haya una caja aperturada para el usuario
            $.GetQuery({
                query: ['q_puntoventa_procesos_puntoventa_validarcaja_usuario'],
                items: [{
                    C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                    C_USUARIO: $.solver.session.SESSION_ID,
                    MODULO: $.solver.basePath
                }],
                onReady: function (result) {
                    $.CloseStatusBar();

                    $('#COD_CAJA').val('');
                    $('#C_OPERACION').val('');

                    if (result.length == 0 && objPermisos.FLAG_PERMISO_CREAR_PEDIDOS == '&' && !isAlert) {
                        isAlert = true;
                        $('#pdvBox .blocked').css({ display: 'block' });
                        $('#pdvBox .blocked .text').html('<i class="fa fa-exclamation-triangle text-danger" aria-hidden="true"></i> Hola <strong>' + $.solver.session.SESSION_NOMBRE + '</strong>, no tienes aperturada una caja, solicitala con tu administrador.');
                    };

                    if (result.length == 0 && objPermisos.FLAG_PERMISO_CREAR_PEDIDOS == '*') {
                        $('#pdvBox .blocked').css({ display: 'none' });
                    };

                    if (result.length > 0) {
                        $('#COD_CAJA').val(result[0].C_CAJA);
                        $('#C_OPERACION').val(result[0].C_OPERACION);
                        $('#C_ALMACEN_DEFECTO').val(result[0].C_ALMACEN);
                        objMyCaja = result[0];
                    };

                    $('#zone-establecimiento').hide();
                    $('#zone-actions').show();
                    $('#zone-Cat').show();
                    $('#zone-salones').show();
                    $('#resumen').show();
                    $('#zone-search').show();

                    fnMostrarPedidos(); //mostramos pedidos en barra lateral izquierda
                    fnObtenerDatosCaja(); //mostramos informacion de totales de venta de la caja
                    fnObtenerPlatos(); //obtenemos los productos
                    fnObtenerBotones(); //validamos los botones de la aplicacion

                },
                onError: function (error) {
                    $.CloseStatusBar();
                    $.ShowError({ error });
                },
                onBefore: function () {
                    $.DisplayStatusBar({ message: 'Validando información' });
                }
            });

        };
        const fnMostrarPedidos = function () {

            var fnObtenerPedidos = function () {
                $.GetQuery({
                    query: ['q_puntoventa_procesos_puntoventa_obtenerpedidos_v2'],
                    items: [{
                        C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                        IND_ESTADO: function () {
                            return $('#zone-actions-pedido').find('button.btn-orange').attr('data-estado') || '*';
                        },
                        C_CAJA: function () {
                            return $('#COD_CAJA').val();
                        },
                        BUSCAR: '%',
                        MODULO: function () {
                            if ($('#COD_CAJA').val() == '' && objPermisos.FLAG_PERMISO_CREAR_PEDIDOS == '&') {
                                return '/blocked';
                            };
                            return $.solver.basePath;
                        },
                        C_OPERACION: function () {
                            return $('#C_OPERACION').val();
                        },
                        C_FECHA: function () {
                            return objMyCaja.C_FECHA;
                        },
                        C_USUARIO_CAJA: function () {
                            return objMyCaja.C_USUARIO;
                        },
                        C_USUARIO: $.solver.session.SESSION_ID,
                        C_SALON: function () {
                            return (($('#zone-actions-pedido').find('button.btn-orange').attr('data-estado') || '*') == '*' ? $('#C_SALON').val() : '')
                        }
                    }],
                    onReady: function (pedidos) {

                        var nuevosPedidos = [];
                        var pedidoCurrent = $('#C_PEDIDO').val() || '';

                        if ($('#USUARIO_CONSTANTE').val() == '*' && $('#C_MESERO').val() != '') {
                            $('.mytable-pedido-filter').html(`
                                <div class="card bg-light mt-1 btn-orange animated bounceInRight box-info-pedido text-center">
                                    <strong><label class="col-form-label col-form-label-lg text-dark">${$('#C_MESERO').val()}</label></strong>
                                </div>
                            `)

                            $('.mytable-pedido').html('')
                            nuevosPedidos = [];
                            baulPedidos = [];
                            pedidos = pedidos.filter(x => x['C_USUARIO'] == $('#C_MESERO').val());
                        }
                        else {
                            $('.mytable-pedido-filter').html(``)
                        }

                        //fnMostrarPedidos();

                        //retiramos pedidos del menu lateral
                        for (var item in baulPedidos) {
                            var inrow = baulPedidos[item];
                            var search = $.grep(pedidos, function (n, i) {
                                return n.C_PEDIDO == inrow.C_PEDIDO;
                            });
                            if (search.length == 0) {
                                $('#pedido-box-' + inrow.C_PEDIDO).remove();
                            };
                        };

                        //analizamos pedidos nuevos o por retirar
                        for (var item in pedidos) {
                            var inrow = pedidos[item];
                            var search = $.grep(baulPedidos, function (n, i) {
                                return n.C_PEDIDO == inrow.C_PEDIDO;
                            });
                            if (search.length == 0) {
                                baulPedidos.push(inrow);
                                nuevosPedidos.push(inrow);
                            };
                        };

                        //agregamos pedidos al menu lateral
                        for (var item in nuevosPedidos) {

                            var inrow = nuevosPedidos[item];
                            var classBoxSelected = '';

                            if (inrow.C_PEDIDO == pedidoCurrent) {
                                $('.mytable-pedido').find('.box-info-pedido').removeClass('border-danger');
                                classBoxSelected = 'border-danger';
                            };

                            $('.mytable-pedido').prepend(`
                                <div id="pedido-box-${inrow.C_PEDIDO}" data-ref="${inrow.C_PEDIDO}" class="card bg-light mt-1 animated bounceInRight box-info-pedido ${classBoxSelected}">
                                    <div id="pedido-${inrow.C_PEDIDO}" class="card-body pt-1 pb-1">  
                                    </div>
                                </div>
                            `);

                            if (inrow.IND_ESTADO == '*' && $('#COD_CAJA').val() != '') {
                                $('div#pedido-' + inrow.C_PEDIDO).append(`
                                    <div class="form-check float-right mt-2">
                                        <input class="check-pedido" type="checkbox" value="" data-ref="${inrow.C_PEDIDO}">
                                    </div>
                                `);
                            };
                            if ($.solver.basePath == '/restaurant') {
                                $('div#pedido-' + inrow.C_PEDIDO).append(`
                                    <div class="text-normal"><strong>Pedido:</strong> <span class="text-danger text-nroPedido">${inrow.NRO_PEDIDO}</span></div>
                                    <div class="text-normal"><strong>Fecha:</strong> <span class="text-dark">${inrow.FECHA_PEDIDO_CON_HORA}</span></div>
                                    <div class="text-normal"><strong>Mesa(s):</strong> <span class="text-primary mesas">${inrow.NOM_MESAS}</span></div>
                                    <div class="text-normal"><strong>Personas:</strong> <span class="text-dark nropersonas">${inrow.NRO_PERSONAS}</span></div>
                                    <div class="text-normal"><strong>Mesero:</strong> <span class="text-dark mesero">${inrow.C_USUARIO}</span></div>
                                `);
                            } else {
                                $('div#pedido-' + inrow.C_PEDIDO).append(`
                                    <div class="text-normal"><strong>Pedido:</strong> <span class="text-danger text-nroPedido">${inrow.NRO_PEDIDO}</span></div>
                                    <div class="text-normal"><strong>Fecha:</strong> <span class="text-dark">${inrow.FECHA_PEDIDO_CON_HORA}</span></div>
                                    <div class="text-normal"><strong>Usuario:</strong> <span class="text-dark">${inrow.C_USUARIO}</span></div>
                                `);
                            };
                            if (inrow.NRO_COMPROBANTE != '' && inrow.IND_ESTADO != '*') {
                                $('div#pedido-' + inrow.C_PEDIDO).append(`<div class="text-normal"><strong>Comprobante:</strong> <span class="text-dark">${inrow.NRO_COMPROBANTE}</span></div>`);
                            };
                            if (inrow.RAZON_SOCIAL != '' && inrow.IND_ESTADO != '*') {
                                $('div#pedido-' + inrow.C_PEDIDO).append(`<div class="text-normal"><strong>Cliente:</strong> <span class="text-dark">${inrow.RAZON_SOCIAL}</span></div>`);
                            };
                            if (inrow.IND_ESTADO == '&') {
                                $('div#pedido-' + inrow.C_PEDIDO).append(`<div class="text-normal"><strong>Usu. Anula:</strong> <span class="text-dark">${inrow.USUARIO_ANULA}</span></div>`);
                                $('div#pedido-' + inrow.C_PEDIDO).append(`<div class="text-normal"><strong>Motivo Anulacion:</strong> <span class="text-dark">${inrow.MOTIVO_ANULACION}</span></div>`);
                            };

                            $('div#pedido-' + inrow.C_PEDIDO).append(`<div class="mt-2"><h4 class="text-danger">${inrow.CODIGO_PARAMETRO_2} <span class="total">${inrow.MONTO}</span> <span class="estado">${inrow.ESTADO_PEDIDO}</span></h4></div>`);

                        };

                        //evento al presionar pedido
                        $('.mytable-pedido').find('.box-info-pedido').unbind('click');
                        $('.mytable-pedido').find('.box-info-pedido').bind('click', function () {

                            var dataRef = $(this).attr('data-ref') || '';
                            var search = $.grep(baulPedidos, function (n, i) {
                                return n.C_PEDIDO == dataRef;
                            });

                            $('.mytable-pedido').find('.box-info-pedido').removeClass('border-danger');
                            $(this).addClass('border-danger');

                            if (search.length != 0) {
                                $('#C_PEDIDO').val(dataRef);
                                $('#pdvBox .blocked').css({ display: 'none' });
                                fnObtenerPedido();
                            };

                        });

                        //si baul pedido es vacio
                        $('.mytable-pedido').find('div.table-message').remove();
                        if (baulPedidos.length == 0) {
                            $('.mytable-pedido').append('<div class="table-message"><div class="text"><i class="fa fa-info-circle" aria-hidden="true"></i> No hay pedidos para mostrar</div></div>');
                        };

                    }
                });
            };

            //cambia color boton seleccionado y obtiene pedidos segun el boton seleccionado
            $('button.btn-filter-pedidos').unbind('click');
            $('button.btn-filter-pedidos').bind('click', function () {
                $('#C_MESERO').val('')
                $('#USUARIO_CONSTANTE').val('&')
                $('button.btn-filter-pedidos').removeClass('btn-orange');
                $(this).addClass('btn-orange');
                baulPedidos = JSON.parse('[]');
                $('.mytable-pedido').html('');
                fnObtenerPedidos();
                fnObtenerDatosCaja();
                fnActionNuevo();
            });

            //obtenemos pedidos
            fnObtenerPedidos();

        };
        const fnObtenerDatosCaja = function () {

            $.GetQuery({
                query: ['q_puntoventa_procesos_puntoventa_obtenerinfocaja_2', 'q_puntoventa_procesos_puntoventa_tipodocs_detallado'],
                items: [{
                    C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                    C_CAJA: objMyCaja.C_CAJA,
                    C_OPERACION: objMyCaja.C_OPERACION,
                    C_FECHA: objMyCaja.C_FECHA,
                    C_USUARIO: $.solver.session.SESSION_ID,
                    MODULO: $.solver.basePath
                }, {
                    C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                    C_CAJA: function () {
                        return $('#COD_CAJA').val();
                    }
                }],
                onReady: function (result) {

                    var resultInfoCaja = result['q_puntoventa_procesos_puntoventa_obtenerinfocaja_2'].result.rows
                    var resultInfoTComprobante = result['q_puntoventa_procesos_puntoventa_tipodocs_detallado'].result.rows

                    var htmlInfoCaja = '';
                    //mostramos informacion de la caja
                    if (resultInfoCaja.length != 0) {
                        htmlInfoCaja = `
                            <div class="col-6 bg-danger">SUCURSAL:</div><div class="col-6">${resultInfoCaja[0].ESTABLECIMIENTO}</div>
                            <div class="col-6">CAJA:</div><div class="col-6">${resultInfoCaja[0].CAJA}</div>
                            <div class="col-6">PENDIENTE:</div><div class="col-6">S/. ${resultInfoCaja[0].PENDIENTE}</div>
                            <div class="col-6">COBRADO:</div><div class="col-6">S/. ${resultInfoCaja[0].TOTAL}</div>
                        `;
                    }

                    $('#lblDatosCaja').html(htmlInfoCaja);

                    //Informacion de tipos de documento (para pago detallado)
                    $('div.tipoDocDetallado').html('');
                    var index = 0;
                    for (var item in resultInfoTComprobante) {
                        var classes = 'mr-1 ml-1';
                        if (index == 0) classes = 'mr-1'
                        if (index == resultInfoTComprobante.length - 1) classes = 'ml-1'
                        var tipoDocRow = resultInfoTComprobante[item];
                        var tipoDocClass = '';
                        if (item == 0) tipoDocClass = 'active-box-comprobante';
                        $('div.tipoDocDetallado').append(`
                            <div data-codigo="${tipoDocRow.TIPO_DOC_COD}" data-selectable="*" class="col box-tipo-comprobante ${tipoDocClass} ${classes}">
                                ${tipoDocRow.TIPO_DOC_NOM_CORTO}
                                <div class="check-select"><i class="fa fa-check-square-o fa-1x" aria-hidden="true"></i></div>
                            </div>
                        `);
                        index++;
                    };

                },
                onError: function (error) {
                    $.CloseStatusBar();
                    $.ShowError({ error });
                }
            });

        };
        const fnObtenerPlatos = function () {
            //obtiene productos (platos)
            $.GetQuery({
                query: ['q_puntoventa_procesos_puntoventa_obtenerproductos'],
                items: [
                    {
                        C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                        BUSCAR: function () {
                            return $('#buscarProducto').val()
                        },
                        MONEDA: '',
                        CATEGORIA: function () {
                            return $('#C_CATEGORIA').val() || ''
                        },
                        MODULO: $.solver.basePath
                    }],
                onError: function (error) {
                    $.CloseStatusBar();
                    $.ShowError({ error });
                },
                onBefore: function () {
                    $.DisplayStatusBar({ message: 'Cargando productos y servicios.' });
                },
                onReady: function (result) {

                    $.CloseStatusBar();

                    $('#zone-venta').show();
                    $('#zone-actions').show();
                    $('#zone-venta .zoneProds').html('');

                    var producto = result
                    var totalCols = 0;

                    for (var item in producto) {
                        var row = producto[item];
                        var token = $.CreateToken();

                        totalCols++;

                        if (row.C_ARCHIVO_FOTO != '') {
                            row.C_ARCHIVO_FOTO = `style="background-image: url('${$.solver.services.api}/service/viewfile/${row.C_ARCHIVO_FOTO}');"`;
                        };

                        $('#zone-venta .zoneProds').append(`
                            <div id="${token}" data-token="${item}" class="col-md-2 col-sm-2 box-plato mt-1">
                                <div class="border item" ${row.C_ARCHIVO_FOTO}>
                                    <div class="nombre">${row.NOMBRE_PARA_VENTA.toUpperCase()}</div>
                                    <div class="precio pt-1">S/.${numeral(row.PRECIO_VENTA).format('0.00')}</div>
                                </div>
                            </div>
                        `);

                        if (totalCols == 6) {
                            totalCols = 0;
                            $('div#' + token).addClass('pl-0');
                        } else {
                            if (totalCols == 1) {
                                $('div#' + token).addClass('pr-1');
                            } else {
                                $('div#' + token).addClass('pr-1 pl-0');
                            }
                        };

                        $('div#' + token).click(function () {
                            if ($('#IND_ESTADO').val() == '' || $('#IND_ESTADO').val() == '*') {
                                var refToken = $(this).attr('data-token');
                                //fnSeleccionarProducto(producto, refToken);
                                fnSeleccionarAgregarProducto(producto, refToken);
                            }
                        });

                    };

                    $('#buscarProducto').val('')

                    fnArmarCategorias();
                    fnMostrarResumen();
                    fnValidarBotones();

                }
            });

            //obtiene mesas
            if ($.solver.basePath == '/restaurant') {
                $.GetQuery({
                    query: ['q_rest_procesos_lista_mesas_v2'],
                    items: [{
                        empresa: $.solver.session.SESSION_EMPRESA,
                        C_SALON: function () {
                            return $('#C_SALON').val();
                        }
                    }],
                    onReady: function (mesas) {

                        if (!isAlert) {

                            isAlert = true;
                            $('#pdvBox .blocked').css({ display: 'block' });
                            $('#pdvBox .blocked .text').html('<div class="zoneMesasFloat row"></div>');

                            var titulo = '';
                            var btnCrearMesa = '';
                            if (mesas.length == 0) {
                                titulo = 'No existen mesas'
                            }
                            else {
                                titulo = '<i class="fa fa-check-square" aria-hidden="true"></i> SELECCIONA TU MESA'
                            }

                            if ($('#C_SALON').val() != '' && $('#COD_CAJA').val() != '') {
                                if (lstSalones.filter(x => x['C_SALON'] == $('#C_SALON').val())[0].IND_CREAR_MESA == '*') {
                                    btnCrearMesa = `<a id="btnCrearMesa" data-token="-1" class="float-right btn btn-orange rounded pt-1 pb-1 border"><i class="fa fa-plus" aria-hidden="true"></i> CREAR MESA</a>`;
                                }
                            }

                            $('.zoneMesasFloat').append(`
                                <div class="col-md-12 mb-2">
                                    <h4 class="title-header">${titulo}
                                        ${btnCrearMesa}
                                    </h4>
                                </div>
                            `);

                            var lastMesa = '';
                            for (var item in mesas) {
                                var mesa = mesas[item];

                                const grupo = mesa['NRO_PEDIDO_GRUPO']
                                //if (mesa.C_MESA != lastMesa) {
                                lastMesa = mesa.C_MESA;
                                let myClassButton = 'btn-orange';
                                let myTextPersonas = `<br />S/. ${mesa.TOTAL}`;
                                let textMozo = mesa.C_USUARIO;
                                let indexOfMozo = textMozo.indexOf('_');
                                let myMozo = `<br />${textMozo.substring(indexOfMozo + 1, textMozo.length)}`
                                if (mesa.C_PEDIDO != '') myClassButton = 'btn-danger';
                                //if (mesa.TOTAL > 0) myTextPersonas = `<br />S/. ${mesa.TOTAL}`;
                                $('.zoneMesasFloat').append(`
                                        <div id="mesa${item}" class="col-md-2 col-sm-2 box-plato mt-1">
                                            <button data-token="${item}" class="btn ${myClassButton} btn-block rounded pt-3 pb-3 border btn-mesa">
                                                ${mesa['NOMBRE_MESA_ADIC'].toUpperCase() + (grupo == '' ? '' : ' - ' + grupo) + myTextPersonas + myMozo}
                                            </button>
                                        </div>
                                    `);
                                //};
                            };

                            $('.zoneMesasFloat').find('button').click(function () {
                                var index = $(this).attr('data-token');
                                var hasOcupied = $(this).hasClass('btn-danger');
                                if (!hasOcupied) {

                                    fnEditarMesa(mesas[index], function (data) {
                                        objMesa.push(data);
                                        $('#nroPedido').html('NRO PEDIDO XXX' + fnObtenerNombreMesa());
                                        $('#pdvBox .blocked').css({ display: 'none' });
                                    });

                                }
                                else {

                                    if ($('#COD_CAJA').val() == '' && objPermisos.FLAG_PERMISO_CREAR_PEDIDOS == '*') {
                                        $.GetQuery({
                                            query: ['q_puntoventa_procesos_puntoventa_obtenerpedido'],
                                            items: [{
                                                C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                                                C_PEDIDO: mesas[index].C_PEDIDO
                                            }],
                                            onReady: function (result) {
                                                const c_mesero = result[0]['C_USUARIO'];
                                                if (c_mesero == $.solver.session.SESSION_ID) {
                                                    $('#C_PEDIDO').val(mesas[index].C_PEDIDO);
                                                    $('#pdvBox .blocked').css({ display: 'none' });

                                                    fnObtenerPedido();
                                                    fnMostrarPedidos();

                                                    $('.mytable-pedido').find('.box-info-pedido').removeClass('border-danger');
                                                    $('#pedido-' + mesas[index].C_PEDIDO).addClass('border-danger');
                                                }
                                                else {
                                                    fnObtenerAlertaError('No puedes modificar una mesa de otro mozo.')
                                                }
                                            }
                                        })
                                    }
                                    else {

                                        $('#C_PEDIDO').val(mesas[index].C_PEDIDO);
                                        $('#pdvBox .blocked').css({ display: 'none' });

                                        fnObtenerPedido();
                                        fnMostrarPedidos();

                                        $('.mytable-pedido').find('.box-info-pedido').removeClass('border-danger');
                                        $('#pedido-' + mesas[index].C_PEDIDO).addClass('border-danger');
                                    }
                                };
                            });
                            $('.zoneMesasFloat').find('#btnCrearMesa').click(function () {
                                fnEditarMesa({}, function (data) {
                                    objMesa.push(data);
                                    $('#nroPedido').html('NRO PEDIDO XXX' + fnObtenerNombreMesa());
                                    $('#pdvBox .blocked').css({ display: 'none' });
                                });
                            })
                        }

                    }
                });
            };

        };
        const fnEditarMesa = function (data, callback, editar = '&') {
            var tokenLogin = $.CreateToken();
            let dialogMesa = bootbox.dialog({
                title: 'Edicion de Mesa',
                message: `<div id="${tokenLogin}"></div>`,
                className: 'modal-search-40',
                onEscape: true,
                centerVertical: true
            });

            dialogMesa.init(function () {
                setTimeout(function () {

                    // funcion para mostrar campos
                    const fnValidarCamposDelivery = function () {
                        var isDelivery = $(dialogMesa).find('#CHECK_DELIVERY').prop('checked')
                        if (isDelivery) {
                            $(dialogMesa).find('.delivery').show();
                            $(dialogMesa).find('.no-delivery').hide();
                        }
                        else {
                            $(dialogMesa).find('.no-delivery').show();
                            $(dialogMesa).find('.delivery').hide();
                        }
                    }
                    const fnObtenerCliente = function (codCliente = '') {
                        $.GetQuery({
                            query: ['q_puntoventa_procesos_puntoventa_obtenercliente'],
                            items: [{
                                C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                                C_CLIENTE: function () {
                                    return $(dialogMesa).find('#C_CLIENTE_DELIVERY').val()
                                }
                            }],
                            onReady: function (result) {
                                if (result.length > 0) {
                                    const dataCliente = result[0];
                                    const nroDocumento = dataCliente.RUC_CLIENTE;
                                    const nombre = dataCliente.RAZON_SOCIAL;
                                    const tipoDocumento = dataCliente.C_PARAMETRO_GENERAL_TIPO_DOCUMENTO;
                                    const direccion = dataCliente.DIRECCION_FISCAL;
                                    $(dialogMesa).find('#TIPO_DOCUMENTO_DELIVERY').val(tipoDocumento)
                                    $(dialogMesa).find('#RUC_DELIVERY').val(nroDocumento)
                                    $(dialogMesa).find('#NOMBRE_DELIVERY').val(nombre);
                                    $(dialogMesa).find('#DIRECCION_ENTREGA').val(direccion);

                                    if (tipoDocumento == '00017') { //ruc
                                        $.each($(dialogMesa).find('#TIPO_COMPROBANTE option'), function (i, v) {
                                            $(v).attr('disabled', 'disabled')
                                            if ($(v).attr('value') == '07236') {
                                                $(v).removeAttr('disabled');
                                                $(dialogMesa).find('#TIPO_COMPROBANTE').val('07236');
                                            }
                                        });
                                    }
                                    else if (tipoDocumento == '00013') { //dni
                                        $.each($(dialogMesa).find('#TIPO_COMPROBANTE option'), function (i, v) {
                                            $(v).attr('disabled', 'disabled')
                                            if ($(v).attr('value') == '07237') {
                                                $(v).removeAttr('disabled');
                                                $(dialogMesa).find('#TIPO_COMPROBANTE').val('07237');
                                            }
                                        });
                                    }
                                    else { //otros
                                        $.each($(dialogMesa).find('#TIPO_COMPROBANTE option'), function (i, v) {
                                            $(v).attr('disabled', 'disabled')
                                            if ($(v).attr('value') == '07237') {
                                                $(v).removeAttr('disabled');
                                                $(dialogMesa).find('#TIPO_COMPROBANTE').val('07237');
                                            }
                                        });
                                    }
                                }
                            }
                        });
                    };
                    const fnEditarCliente = function (codCliente = '') {
                        $.solver.fn.fnEditarCliente({
                            codCliente,
                            onReady: function (result, controls, form, dialog) {
                                codCliente = result.items.C_CLIENTE;
                                $(dialogMesa).find('#C_CLIENTE_DELIVERY').val(codCliente);
                                fnObtenerCliente(dialogMesa);
                                $(dialog).modal('hide');
                            }
                        })
                    };
                    const setearInfo = function (odata, callback) {
                        if (odata.NRO_PERSONAS == '') odata.NRO_PERSONAS = 0;

                        data['Nombre de Mesa'] = odata.NOMBRE_MESA;
                        data['NRO_PERSONAS'] = odata.NRO_PERSONAS;
                        $('#C_MESERO').val(odata.C_MESERO);

                        // Cambios para delivery
                        $('#IND_DELIVERY').val($(dialogMesa).find('#CHECK_DELIVERY').prop('checked') ? '*' : '&');
                        $('#C_CLIENTE_DELIVERY').val($(dialogMesa).find('#C_CLIENTE_DELIVERY').val())
                        $('#TIPO_DOCUMENTO_DELIVERY').val($(dialogMesa).find('#TIPO_DOCUMENTO_DELIVERY').val())
                        $('#RUC_DELIVERY').val($(dialogMesa).find('#RUC_DELIVERY').val())
                        $('#NOMBRE_DELIVERY').val($(dialogMesa).find('#NOMBRE_DELIVERY').val())
                        $('#DIRECCION_ENTREGA').val($(dialogMesa).find('#DIRECCION_ENTREGA').val())
                        $('#REFERENCIA_ENTREGA').val($(dialogMesa).find('#REFERENCIA_ENTREGA').val())
                        $('#TELEFONO').val($(dialogMesa).find('#TELEFONO').val())
                        $('#METODO_PAGO_DELIVERY').val($(dialogMesa).find('#METODO_PAGO_DELIVERY').val())
                        $('#TIPO_COMPROBANTE').val($(dialogMesa).find('#TIPO_COMPROBANTE').val())

                        if (typeof callback == 'function') callback(data);

                        $(dialogMesa).modal('hide');
                    }

                    // Agregamos html inicial ${tokenLogin}
                    let _html = $('#zoneEditarMesa').html();
                    _html = _html.replace("{empresa}", $.solver.session.SESSION_EMPRESA);
                    $(dialogMesa).find(`#${tokenLogin}`).html(_html);

                    // declaramos variables
                    const form = $(dialogMesa).find(`form[name=my_form]`);

                    //valid form
                    form.ValidForm({
                        type: -1,
                        onDone: function (xform, controls) {

                            $.GetQuery({
                                query: ['q_puntoventa_procesos_puntoventa_tipodocs_detallado', 'q_puntoventa_procesos_puntoventa_obtenerdatospordefecto'],
                                items: [{
                                    C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                                    C_CAJA: function () {
                                        return $('#COD_CAJA').val();
                                    }
                                }, {
                                    C_EMPRESA: $.solver.session.SESSION_EMPRESA
                                }],
                                onReady: function (resultData) {
                                    var result = resultData['q_puntoventa_procesos_puntoventa_tipodocs_detallado'].result.rows
                                    var resultDefecto = resultData['q_puntoventa_procesos_puntoventa_obtenerdatospordefecto'].result.rows[0]
                                    var html = ''
                                    if (result.length != 0) {
                                        for (var i = 0; i < result.length; i++) {
                                            var item = result[i];
                                            html += `<option value="${item.TIPO_DOC_COD}">${item.TIPO_DOC_NOM_CORTO}</option>`
                                        }
                                    }
                                    $(dialogMesa).find('#TIPO_COMPROBANTE').html(html);
                                    $(dialogMesa).find('#C_CLIENTE_DELIVERY').val(resultDefecto['C_CLIENTE'])
                                    fnObtenerCliente();

                                }
                            })

                            if (lstSalones.filter(x => x['C_SALON'] == $('#C_SALON').val())[0].IND_DELIVERY == '*') {
                                $(dialogMesa).find('#CHECK_DELIVERY').prop('checked', true)
                            }

                            $(dialogMesa).find('#CHECK_DELIVERY').change(function () {
                                fnValidarCamposDelivery();
                            })

                            if (editar == '&') {
                                $(controls.NOMBRE_MESA).val(data['Nombre de Mesa']);
                            }
                            else {
                                $(controls.NOMBRE_MESA).val(data.NOMBRE_MESA_ADIC);
                                $(controls.C_MESERO).val($.solver.session.SESSION_ID);
                            }

                            if ($('#COD_CAJA').val() == '' && objPermisos.FLAG_PERMISO_CREAR_PEDIDOS == '*') {
                                $(controls.NRO_PERSONAS).keyboard({
                                    layout: 'num',
                                    restrictInput: true, // Prevent keys not in the displayed keyboard from being typed in
                                    preventPaste: true,  // prevent ctrl-v and right click
                                    autoAccept: true
                                });
                            }

                            if (!$.isEmptyObject(data)) {
                                $(controls.NRO_PERSONAS).val(data.NRO_PERSONAS).focus();
                            }

                            const meseroCount = $(controls.C_MESERO)[0].args.data.filter(x => x['SESSION_ID'] == $.solver.session.SESSION_ID).length
                            if (meseroCount != 0) {
                                $(controls.C_MESERO).val($.solver.session.SESSION_ID);
                            }
                            if (editar == '*') {
                                $(controls.C_MESERO).val(data['C_USUARIO']);
                                $(controls.C_MESERO).attr('disabled', 'disabled')

                                // Seteamos valores de delivery
                                $(dialogMesa).find('#C_CLIENTE_DELIVERY').val($('#C_CLIENTE_DELIVERY').val())
                                $(dialogMesa).find('#TIPO_DOCUMENTO_DELIVERY').val($('#TIPO_DOCUMENTO_DELIVERY').val())
                                $(dialogMesa).find('#RUC_DELIVERY').val($('#RUC_DELIVERY').val())
                                $(dialogMesa).find('#NOMBRE_DELIVERY').val($('#NOMBRE_DELIVERY').val())
                                $(dialogMesa).find('#DIRECCION_ENTREGA').val($('#DIRECCION_ENTREGA').val())
                                $(dialogMesa).find('#REFERENCIA_ENTREGA').val($('#REFERENCIA_ENTREGA').val())
                                $(dialogMesa).find('#TELEFONO').val($('#TELEFONO').val())
                                $(dialogMesa).find('#METODO_PAGO_DELIVERY').val($('#METODO_PAGO_DELIVERY').val())
                                $(dialogMesa).find('#TIPO_COMPROBANTE').val($('#TIPO_COMPROBANTE').val())
                                $(dialogMesa).find('#CHECK_DELIVERY').prop('checked', ($('#IND_DELIVERY').val() == '*' ? true : false))

                                setTimeout(function () {
                                    var tipoDocumento = $('#TIPO_DOCUMENTO_DELIVERY').val();
                                    if (tipoDocumento == '00017') { //ruc
                                        $.each($(dialogMesa).find('#TIPO_COMPROBANTE option'), function (i, v) {
                                            $(v).attr('disabled', 'disabled')
                                            if ($(v).attr('value') == '07236') {
                                                $(v).removeAttr('disabled');
                                                $(dialogMesa).find('#TIPO_COMPROBANTE').val('07236');
                                            }
                                        });
                                    }
                                    else if (tipoDocumento == '00013') { //dni
                                        $.each($(dialogMesa).find('#TIPO_COMPROBANTE option'), function (i, v) {
                                            $(v).attr('disabled', 'disabled')
                                            if ($(v).attr('value') == '07237') {
                                                $(v).removeAttr('disabled');
                                                $(dialogMesa).find('#TIPO_COMPROBANTE').val('07237');
                                            }
                                        });
                                    }
                                    else { //otros
                                        $.each($(dialogMesa).find('#TIPO_COMPROBANTE option'), function (i, v) {
                                            $(v).attr('disabled', 'disabled')
                                            if ($(v).attr('value') == '07237') {
                                                $(v).removeAttr('disabled');
                                                $(dialogMesa).find('#TIPO_COMPROBANTE').val('07237');
                                            }
                                        });
                                    }
                                }, 500)
                            }

                            fnValidarCamposDelivery();

                            $(dialogMesa).find('#btnNuevoCliente').click(function () {
                                fnEditarCliente('');
                            })
                            $(dialogMesa).find('#btnBuscarCliente').click(function () {

                                var nroDocumento = $(dialogMesa).find('#RUC_DELIVERY').val()
                                var codCliente = $(dialogMesa).find('#C_CLIENTE_DELIVERY').val()

                                // Validamos si el nroDocumento tiene resultados
                                $.GetQuery({
                                    query: ['gbl_listarclientes'],
                                    items: [{
                                        C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                                        NOMBRE: nroDocumento
                                    }],
                                    onReady: function (result) {
                                        if (result.length == 0) {
                                            fnObtenerAlertaError('<i class="fa fa-exclamation-triangle" aria-hidden="true"></i>&nbsp;<label>CLIENTE NO ENCONTRADO</label>')
                                            return;
                                        }

                                        if (result.length == 1) {
                                            if (codCliente == result[0]['C_CLIENTE']) {
                                                nroDocumento = '';
                                            }
                                            else {
                                                $(dialogMesa).find('#C_CLIENTE_DELIVERY').val(result[0]['C_CLIENTE'])
                                                fnObtenerCliente(dialogMesa, C_CLIENTE);
                                                return;
                                            }
                                        }

                                        $.solver.fn.busquedaCliente({
                                            buscar: nroDocumento,
                                            onSelected: function (row) {
                                                $(dialogMesa).find('#C_CLIENTE_DELIVERY').val(row['C_CLIENTE'])
                                                fnObtenerCliente(dialogMesa, C_CLIENTE);
                                            }
                                        })
                                    }
                                });
                            });

                        },
                        onReady: function (q, q, odata) {
                            if ($.isEmptyObject(data)) {
                                var c_salon = $('#C_SALON').val();
                                var tokenMesa = $.AddPetition({
                                    type: 1,
                                    table: 'REST.MESA',
                                    items: $.ConvertObjectToArr({
                                        C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                                        C_ESTABLECIMIENTO: objMyCaja.C_ESTABLECIMIENTO,
                                        C_MESA: '',
                                        NOMBRE_MESA: odata.NOMBRE_MESA,
                                        IND_ESTADO: '*',
                                        C_SALON: c_salon,
                                        C_CAJA: objMyCaja.C_CAJA,
                                        C_USUARIO: objMyCaja.C_USUARIO,
                                        C_FECHA: objMyCaja.C_FECHA,
                                        C_OPERACION: objMyCaja.C_OPERACION
                                    }, {
                                        C_MESA: {
                                            action: {
                                                name: 'GetNextId',
                                                args: $.ConvertObjectToArr({
                                                    columns: 'C_EMPRESA,C_ESTABLECIMIENTO',
                                                    max_length: '3'
                                                })
                                            }
                                        }
                                    })
                                })
                                $.SendPetition({
                                    onBefore: function () {
                                        $.DisplayStatusBar({ message: 'Creando mesa.' });
                                    },
                                    onReady: function (result) {
                                        $.CloseStatusBar();
                                        $.GetQuery({
                                            query: ['q_rest_procesos_obtener_mesa_creada'],
                                            items: [{
                                                empresa: $.solver.session.SESSION_EMPRESA,
                                                C_SALON: c_salon,
                                                C_MESA: result[tokenMesa].items.C_MESA
                                            }],
                                            onReady: function (res) {
                                                data = res[0];
                                                setearInfo(odata, callback)
                                            }
                                        })

                                    },
                                    onError: function (_error) {
                                        $.CloseStatusBar();
                                        $.ShowError({ error: _error });
                                    }
                                })
                            }
                            else {
                                setearInfo(odata, callback)
                            }


                        },
                        onError: function (error) {
                            $.CloseStatusBar();
                            $.ShowError({ error });
                        }
                    });

                });
            });

            dialogMesa.on('hide.bs.modal', function () { buttonState = false; });

            $('.bootbox .modal-dialog').draggable({
                handle: '.modal-header'
            });
            $('.bootbox .modal-header').css('cursor', 'move');

        };
        const fnArmarCategorias = function () {
            $.GetQuery({
                query: ['q_puntoventa_procesos_puntoventa_obtenercategorias'],
                items: [{
                    C_EMPRESA: $.solver.session.SESSION_EMPRESA
                }],
                onReady: function (result) {

                    lstCategorias = result;

                    $('.zone-Cat').html(`<a class="dropdown-item" data-token="todos" href="#"><i class="fa fa-chevron-circle-right" aria-hidden="true"></i> Todos</a>`);

                    for (var item in result) {

                        var row = result[item];
                        var token = $.CreateToken();

                        $('.zone-Cat').append(`<a class="dropdown-item" id="${token}" data-token="${item}" href="#"><i class="fa fa-chevron-circle-right" aria-hidden="true"></i> ${row.NOMBRE_CATEGORIA}</a>`);

                    };

                    $('.zone-Cat a').click(function (e) {

                        var refToken = $(this).attr('data-token');

                        if (refToken == 'todos') {
                            $('#C_CATEGORIA').val('');
                        } else {
                            $('#C_CATEGORIA').val(lstCategorias[refToken]['C_CATEGORIA'])
                        };

                        fnObtenerPlatos();

                        e.preventDefault();

                    });

                }
            })
        };
        const fnObtenerBotones = function () {

            $('#zone-actions').find('button').each(function () {
                objBotones[$(this).attr('name')] = $(this);
            });
            $('#zone-actions-resumen').find('button').each(function () {
                objBotones[$(this).attr('name')] = $(this);
            });
            $('#zone-search').find('button').each(function () {
                objBotones[$(this).attr('name')] = $(this);
            });
            $('#zone-actions-pedido').find('button').each(function () {
                objBotones[$(this).attr('name')] = $(this);
            });
            $('#zone-actions-extras').find('button').each(function () {
                objBotones[$(this).attr('name')] = $(this);
            });

            $(objBotones.btnNuevo).unbind('click');
            $(objBotones.btnNuevo).bind('click', function () {
                if (!buttonState) {
                    buttonState = true;
                    fnActionNuevo();
                }
            });

            $(objBotones.btnVer).unbind('click');
            $(objBotones.btnVer).bind('click', function () {
                if (!buttonState) {
                    buttonState = true;
                    fnActionVer();
                }
            });

            $(objBotones.btnRapido).unbind('click');
            $(objBotones.btnRapido).bind('click', function () {

                if (!buttonState) {
                    buttonState = true;
                    //Validar si algún item del detalle que aún no ha sido enviado a cocina
                    if (objPedido.platos.filter(x => x['EnviadCocina'] == '&' && x['Estado'] == '*').length > 0 && $.solver.basePath == '/restaurant') {
                        fnAutorizarAccion('VentaRapida', function (datausuario) {
                            fnActionRapidoConModal();
                        });
                    }
                    else {
                        fnActionRapidoConModal();
                    }
                };

            });

            $(objBotones.btnDetallado).unbind('click');
            $(objBotones.btnDetallado).bind('click', function () {

                if (!buttonState) {

                    buttonState = true;

                    if (objPedido.platos.filter(x => x['EnviadCocina'] == '&' && x['Estado'] == '*').length > 0 && $.solver.basePath == '/restaurant') {
                        fnAutorizarAccion('VentaDetallada', function (datausuario) {
                            fnActionDetallado();
                        });
                    } else {
                        fnActionDetallado();
                    };

                };

            });

            $(objBotones.btnPreCuenta).unbind('click');
            $(objBotones.btnPreCuenta).click(function () {
                const c_pedido = $('#C_PEDIDO').val() || '';
                fnImprimirPreCuenta($.solver.session.SESSION_EMPRESA, c_pedido);
            });

            $(objBotones.btnUnirCuentas).unbind('click');
            $(objBotones.btnUnirCuentas).click(function () {
                fnUnirCuenta();
            });

            $(objBotones.btnAnular).unbind('click');
            $(objBotones.btnAnular).click(function () {
                fnActionAnular($('#C_PEDIDO').val(), null, $('#IND_ESTADO').val());
            });

            $(objBotones.btnReimprimir).unbind('click');
            $(objBotones.btnReimprimir).click(function () {
                fnReimprimir($('#C_PEDIDO').val(), $('#IND_ESTADO').val());
            });

            $(objBotones.btnEnviar).unbind('click');
            $(objBotones.btnEnviar).click(function () {
                fnEnviarPedido();
            });

            $(objBotones.btnCambiarUsuario).unbind('click');
            $(objBotones.btnCambiarUsuario).click(function () {
                $.ChangeSession();
            });

            $(objBotones.btnPaloteo).unbind('click');
            $(objBotones.btnPaloteo).click(function () {
                fnImprimirBaloteo();
            });

            $(objBotones.btnVerMeseros).unbind('click');
            $(objBotones.btnVerMeseros).click(function () {
                fnActionVerMeseros();
            })

            $(objBotones.btnVerMesas).unbind('click');
            $(objBotones.btnVerMesas).click(function () {
                fnActionNuevo();
            });

            $(objBotones.btnCambiarProductos).unbind('click');
            $(objBotones.btnCambiarProductos).click(function () {
                fnCambiarProductos();
            });

            $(objBotones.btnCambiarMesa).unbind('click');
            $(objBotones.btnCambiarMesa).click(function () {
                fnCambiarMesa();
            });

            $(objBotones.btnCambiarMesero).unbind('click');
            $(objBotones.btnCambiarMesero).click(function () {
                fnCambiarMesero();
            });

            $(objBotones.btnCerrarCaja).unbind('click');
            $(objBotones.btnCerrarCaja).click(function () {

                fnCerrarCaja();

            });

            $(objBotones.btnSalir).unbind('click');
            $(objBotones.btnSalir).click(function () {
                fnSalirSession();
            });

            $(objBotones.btnEditarMesa).unbind('click');
            $(objBotones.btnEditarMesa).click(function () {

                if ($('#C_PEDIDO').val() == '') {
                    fnObtenerAlertaWarning('Por favor guarde el pedido primero')
                    return;
                }

                if (objMesa.length > 1) {
                    fnObtenerAlertaWarning('No se puede editar porque la mesa tiene mas de 2 mesas.')
                    return;
                }

                $.GetQuery({
                    query: ['q_rest_procesos_lista_mesas_v2'],
                    items: [{
                        empresa: $.solver.session.SESSION_EMPRESA, C_SALON: function () {
                            return $('#C_SALON').val();
                        }
                    }],
                    onReady: function (mesas) {

                        var pedido = mesas.find(x => x['C_PEDIDO'] == $('#C_PEDIDO').val());

                        fnEditarMesa(pedido, function (data) {

                            $.AddPetition({
                                table: 'PDV.PEDIDO',
                                type: 2,
                                condition: `C_EMPRESA = '${$.solver.session.SESSION_EMPRESA}' AND C_PEDIDO = '${$('#C_PEDIDO').val()}'`,
                                items: $.ConvertObjectToArr({
                                    C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                                    C_PEDIDO: $('#C_PEDIDO').val(),
                                    NOM_MESAS: data['Nombre de Mesa'],

                                    IND_DELIVERY: $('#IND_DELIVERY').val(),
                                    C_CLIENTE_DELIVERY: $('#C_CLIENTE_DELIVERY').val(),
                                    TIPO_DOCUMENTO_DELIVERY: $('#TIPO_DOCUMENTO_DELIVERY').val(),
                                    RUC_DELIVERY: $('#RUC_DELIVERY').val(),
                                    NOMBRE_DELIVERY: $('#NOMBRE_DELIVERY').val(),
                                    DIRECCION_ENTREGA: $('#DIRECCION_ENTREGA').val(),
                                    REFERENCIA_ENTREGA: $('#REFERENCIA_ENTREGA').val(),
                                    TELEFONO: $('#TELEFONO').val(),
                                    METODO_PAGO_DELIVERY: $('#METODO_PAGO_DELIVERY').val(),
                                    TIPO_COMPROBANTE: $('#TIPO_COMPROBANTE').val()
                                })
                            })

                            $.AddPetition({
                                table: 'REST.PEDIDO_MESA',
                                type: 2,
                                condition: `C_EMPRESA = '${$.solver.session.SESSION_EMPRESA}' AND C_PEDIDO = '${$('#C_PEDIDO').val()}' AND C_MESA = '${pedido.C_MESA}'`,
                                items: $.ConvertObjectToArr({
                                    C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                                    C_PEDIDO: $('#C_PEDIDO').val(),
                                    C_MESA: pedido.C_MESA,
                                    NOMBRE_MESA: data['Nombre de Mesa'],
                                    NRO_PERSONAS: data.NRO_PERSONAS
                                })
                            })

                            $.SendPetition({
                                onReady: function (result) {
                                    $.CloseStatusBar();

                                    objMesa.find(x => x['C_MESA'] == pedido.C_MESA)['Nombre de Mesa'] = data['Nombre de Mesa']

                                    $('#nroPedido').html(`NRO PEDIDO ${pedido.NRO_PEDIDO}` + fnObtenerNombreMesa());
                                    $(`#pedido-${$('#C_PEDIDO').val()} .mesas`).html(fnObtenerNombreMesa('S'))
                                    $(`#pedido-${$('#C_PEDIDO').val()} .nropersonas`).html(data.NRO_PERSONAS)

                                    fnValidarBotones();
                                },
                                onBefore: function () {
                                    $.DisplayStatusBar({ message: 'Guardando pedido' });
                                },
                                onError: function (_error) {
                                    $.CloseStatusBar();
                                    $.ShowError({ error: _error });
                                }
                            });

                            // Actualizamos datos en pdv.pedido y rest.pedido_mesa
                            //$('#nroPedido').html('NRO PEDIDO XXX' + fnObtenerNombreMesa());
                            //$('#pdvBox .blocked').css({ display: 'none' });
                        }, '*');

                    }
                });
            })
        };
        const fnValidarBotones = function (event) {

            $('#zone-actions').find('button').closest('div').addClass('d-none');
            $('#zone-actions-pedido').find('button').closest('div').addClass('d-none');

            $(objBotones.btnNuevo).closest('div').removeClass('d-none');
            $(objBotones.btnEnviar).closest('div').removeClass('d-none');
            $(objBotones.btnDetallado).closest('div').removeClass('d-none');
            $(objBotones.btnRapido).closest('div').removeClass('d-none');
            $(objBotones.btnPreCuenta).closest('div').removeClass('d-none');
            $(objBotones.btnAnular).closest('div').removeClass('d-none');

            //si no hay caja aperturada (controla filtros superiores)
            if ($('#COD_CAJA').val() != '') {
                $(objBotones.btnPendiente).closest('div').removeClass('d-none');
                $(objBotones.btnFacturado).closest('div').removeClass('d-none');
                $(objBotones.btnAnulado).closest('div').removeClass('d-none');
            } else {
                $(objBotones.btnPendiente).closest('div').removeClass('d-none');
                fnCheckIddle();
            };

            if ($('#COD_CAJA').val() == '' && objPermisos.FLAG_PERMISO_CREAR_PEDIDOS == '&') {
                $(objBotones.btnPendiente).attr('disabled', 'disabled');
            };

            //boton generales
            $(objBotones.btnEnviar).attr('disabled', 'disabled');
            $(objBotones.btnDetallado).attr('disabled', 'disabled');
            $(objBotones.btnRapido).attr('disabled', 'disabled');
            $(objBotones.btnPreCuenta).attr('disabled', 'disabled');
            $(objBotones.btnAnular).attr('disabled', 'disabled');

            //botones resumen
            $(objBotones.btnReimprimir).attr('disabled', 'disabled');
            $(objBotones.btnCambiarMesa).attr('disabled', 'disabled');
            $(objBotones.btnCambiarMesero).attr('disabled', 'disabled');
            $(objBotones.btnEditarMesa).attr('disabled', 'disabled');

            if ($.solver.basePath != '/restaurant') {
                //$(objBotones.btnReimprimir).closest('div').removeClass('pr-0');
                $(objBotones.btnCambiarMesa).attr('disabled', 'disabled');
                $(objBotones.btnCambiarMesero).attr('disabled', 'disabled');
                $(objBotones.btnEditarMesa).attr('disabled', 'disabled');
                $(objBotones.btnCambiarProductos).attr('disabled', 'disabled');
            };

            //botones extras
            $(objBotones.btnUnirCuentas).attr('disabled', 'disabled');
            $(objBotones.btnVerMesas).attr('disabled', 'disabled');
            $(objBotones.btnVerMeseros).attr('disabled', 'disabled');
            $(objBotones.btnCambiarUsuario).attr('disabled', 'disabled');
            $(objBotones.btnVerMesas).closest('div').addClass('d-none');
            $(objBotones.btnVerMeseros).closest('div').addClass('d-none');
            $(objBotones.btnPaloteo).attr('disabled', 'disabled');
            $(objBotones.btnCerrarCaja).attr('disabled', 'disabled');

            $(objBotones.btnSalir).removeAttr('disabled');

            if (($('#COD_CAJA').val() == '' && objPermisos.FLAG_PERMISO_CREAR_PEDIDOS == '*') || $('#COD_CAJA').val() != '') {
                if ($('#COD_CAJA').val() == '' && objPermisos.FLAG_PERMISO_CREAR_PEDIDOS == '*') {
                    $('#buscarProducto').keyboard({
                        language: 'es',
                        visible: function (e, keyboard) {
                            //initTypeAhead(keyboard);
                            $('.ui-keyboard-preview').val('')
                        },
                        change: function (e, keyboard) {
                            // trigger "input" required for typeahead to recognize a change
                            e.type = 'input';
                            keyboard.$preview.trigger(e);
                        },
                        accepted: function (e, keyboard, el) {
                            //alert('The content "' + el.value + '" was accepted!');
                            fnBuscarProductos();
                        }
                    });

                    $('#nota').keyboard({
                        language: 'es',
                        visible: function (e, keyboard) {
                            //initTypeAhead(keyboard);
                        },
                        change: function (e, keyboard) {
                            // trigger "input" required for typeahead to recognize a change
                            e.type = 'input';
                            keyboard.$preview.trigger(e);
                        }
                    });
                }
                //$(objBotones.btnUnirCuentas).removeAttr('disabled');
                $(objBotones.btnCambiarUsuario).removeAttr('disabled');
                if ($.solver.basePath != '/restaurant') $(objBotones.btnVerMesas).closest('div').addClass('d-none');
                if ($.solver.basePath != '/puntoventa') $(objBotones.btnVerMeseros).closest('div').addClass('d-none');
                if ($.solver.basePath == '/restaurant') {
                    $(objBotones.btnVerMesas).closest('div').removeClass('d-none');
                    $(objBotones.btnVerMesas).removeAttr('disabled');
                };
                if ($.solver.basePath == '/puntoventa') {
                    $(objBotones.btnVerMeseros).closest('div').removeClass('d-none');
                    $(objBotones.btnVerMeseros).removeAttr('disabled');
                };
            };
            if ($('#COD_CAJA').val() != '') {
                $(objBotones.btnPaloteo).removeAttr('disabled');
                $(objBotones.btnCerrarCaja).removeAttr('disabled');
            };

            //pedido pendiente o nuevo
            if ($('#IND_ESTADO').val() == '*') {
                if (objPedido.platos.length != 0) {
                    $(objBotones.btnPreCuenta).removeAttr('disabled');
                    if ($.solver.basePath == '/restaurant') $(objBotones.btnCambiarMesa).removeAttr('disabled');
                };
                //si hay caja habilitamos botones de cobranza
                if ($('#COD_CAJA').val() != '' && $('#C_PEDIDO').val() != '') {
                    $(objBotones.btnDetallado).removeAttr('disabled');
                    $(objBotones.btnRapido).removeAttr('disabled');
                    $(objBotones.btnUnirCuentas).removeAttr('disabled');
                    if ($.solver.basePath == '/restaurant') $(objBotones.btnCambiarMesero).removeAttr('disabled');
                    if ($.solver.basePath == '/restaurant') $(objBotones.btnEditarMesa).removeAttr('disabled');
                };
                if ($('#C_PEDIDO').val() != '') {
                    $(objBotones.btnAnular).removeAttr('disabled');
                };
                //validamos si activamos el boton enviar
                //if ($.solver.basePath == '/restaurant') {
                for (var item in objPedido.platos) {
                    var plato = objPedido.platos[item];
                    if (plato.EnviadCocina == '&' && plato.Estado == '*') {
                        var pedidoCurrent = $('#C_PEDIDO').val() || '';
                        if (pedidoCurrent != '') {
                            $('#pedido-' + pedidoCurrent).find('.estado').html('<span class="badge badge-warning float-right">Pendiente</span>');
                        };
                        $(objBotones.btnEnviar).removeAttr('disabled');
                    };
                };
                if (objPedido.platos.length == 0) {
                    $('#pedido-' + pedidoCurrent).find('.estado').html('<span class="badge badge-warning float-right">Sin Productos</span>');
                };
                //};
            };

            //pedido anulado
            if ($('#IND_ESTADO').val() == '&') {
                if (objPedido.platos.length != 0) {
                    $(objBotones.btnReimprimir).removeAttr('disabled');
                };
            };

            //pedido facturado
            if ($('#IND_ESTADO').val() == 'F') {
                if (objPedido.platos.length != 0) {
                    $(objBotones.btnAnular).removeAttr('disabled');
                    $(objBotones.btnReimprimir).removeAttr('disabled');
                };
            };

        };
        const fnValidarSalones = function () {
            $('#C_SALON').change(function () {
                fnActionNuevo();
                $('button[name=btnPendiente]').trigger('click')
            })
            $.GetQuery({
                query: ['q_puntoventa_procesos_puntoventa_obtenersalones'],
                items: [{
                    C_EMPRESA: $.solver.session.SESSION_EMPRESA
                }],
                onReady: function (result) {
                    lstSalones = result;
                    var html = ''
                    for (var i = 0; i < result.length; i++) {
                        var item = result[i];
                        var selected = (item.IND_DEFECTO == '*' ? 'selected' : '')
                        html += `<option value="${item.C_SALON}" ${selected}>${item.NOMBRE}</option>`
                    }
                    $('#C_SALON').html(html)
                }
            })
        }
        /* FUNCIONES VARIAS */

        /* AGREGAR PETICIONES */
        const fnActualizarPeticionesPedido = function (codTipoDoc, codCliente, codMoneda, codPedido, propina) {

            let precioTotal = 0.00;
            let operacionesGratuitas = 0.00;

            for (var index in objPedido.platos) {
                var plato = objPedido.platos[index];
                if (plato.Estado == '*') {
                    var afectacion = parseInt(plato.AfectacionCabecera);
                    if (afectacion == 0) operacionesGratuitas += (plato.Cantidad * plato.Precio);
                    if (afectacion == 1) precioTotal += (plato.Cantidad * plato.Precio);
                    if (plato.NroComanda == '') creaComanda = true; //para control restaurant
                }
            };

            precioTotal = parseFloat(precioTotal.toFixed(2));
            operacionesGratuitas = parseFloat(operacionesGratuitas.toFixed(2));

            const codCaja = $('#COD_CAJA').val();
            const nroPedido = $('#NRO_PEDIDO').val();
            const codUsuario = $.solver.session.SESSION_ID;
            const observacion = $('#observaciones').val();

            // Agregamos cabecera pedido
            const conditionPedido = (codPedido == '' ? '' : `C_EMPRESA = '${$.solver.session.SESSION_EMPRESA}' AND C_PEDIDO = '${codPedido}'`);
            const extraPedido = {
                C_PEDIDO: {
                    action: {
                        name: 'GetNextId',
                        args: $.ConvertObjectToArr({
                            columns: 'C_EMPRESA',
                            max_length: 10
                        })
                    }
                },
                FECHA_PEDIDO: {
                    action: {
                        name: 'GetQueryId',
                        args: $.ConvertObjectToArr({
                            script: 'gbl_obtener_fecha_server',
                            column: 'FECHA_FORMATO'
                        })
                    }
                },
                C_USUARIO_CAJA: {
                    action: {
                        name: 'GetQueryId',
                        args: $.ConvertObjectToArr({
                            script: 'spw_puntoventa_procesos_puntoventa_obtener_datos_caja',
                            column: 'C_USUARIO',
                            C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                            C_USUARIO: $.solver.session.SESSION_ID,
                            C_CAJA: '',
                            MODULO: $.solver.basePath
                        })
                    }
                },
                C_FECHA: {
                    action: {
                        name: 'GetQueryId',
                        args: $.ConvertObjectToArr({
                            script: 'spw_puntoventa_procesos_puntoventa_obtener_datos_caja',
                            column: 'C_FECHA',
                            C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                            C_USUARIO: $.solver.session.SESSION_ID,
                            C_CAJA: '',
                            MODULO: $.solver.basePath
                        })
                    }
                },
                C_OPERACION: {
                    action: {
                        name: 'GetQueryId',
                        args: $.ConvertObjectToArr({
                            script: 'spw_puntoventa_procesos_puntoventa_obtener_datos_caja',
                            column: 'C_OPERACION',
                            C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                            C_USUARIO: $.solver.session.SESSION_ID,
                            C_CAJA: '',
                            MODULO: $.solver.basePath
                        })
                    }
                },
                C_CAJA: {
                    action: {
                        name: 'GetQueryId',
                        args: $.ConvertObjectToArr({
                            script: 'spw_puntoventa_procesos_puntoventa_obtener_datos_caja',
                            column: 'C_CAJA',
                            C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                            C_USUARIO: $.solver.session.SESSION_ID,
                            C_CAJA: '',
                            MODULO: $.solver.basePath
                        })
                    }
                },
            };
            const objectPedido = {
                C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                C_PEDIDO: codPedido,
                FECHA_PEDIDO: '',
                C_CAJA: codCaja == '' ? null : codCaja,
                NRO_PEDIDO: nroPedido,
                C_TIPO_DOCUMENTO: codTipoDoc,
                C_MONEDA: codMoneda,
                C_CLIENTE: codCliente,
                //C_USUARIO: codUsuario,
                PRECIO_BASE: numeral(precioTotal / 1.18).format('0.0000000000'),
                DESCUENTO: 0,
                IGV: numeral(precioTotal - (precioTotal / 1.18)).format('0.0000000000'),
                PRECIO_TOTAL: precioTotal,
                OPERACIONES_GRATUITAS: operacionesGratuitas,
                IND_ESTADO: '*',
                OBSERVACION: observacion,
                PROPINA: (propina == '' ? 0 : propina),
                COD_MODULO: function () {
                    return $.solver.basePath;
                },
                C_ESTABLECIMIENTO: function () {
                    return objMyCaja.C_ESTABLECIMIENTO;
                },
                PORCENTAJE_DESCUENTO_GLOBAL: ($('#PORCENTAJE_DESCUENTO_GLOBAL').val() == '' ? null : $('#PORCENTAJE_DESCUENTO_GLOBAL').val()),
                COMENTARIO_DESCUENTO_GLOBAL: ($('#COMENTARIO_DESCUENTO_GLOBAL').val() == '' ? null : $('#COMENTARIO_DESCUENTO_GLOBAL').val()),
                MOTIVO_CORTESIA: ($('#MOTIVO_CORTESIA').val() == '' ? null : $('#MOTIVO_CORTESIA').val()),
                USUARIO_DESCUENTO_GLOBAL: ($('#PORCENTAJE_DESCUENTO_GLOBAL').val() == '' ? null : $.solver.session.SESSION_ID),
                FECHA_DESCUENTO_GLOBAL: ($('#PORCENTAJE_DESCUENTO_GLOBAL').val() == '' ? null : (moment(new Date()).format("DD/MM/YYYY HH:mm:ss"))),
                NOM_MESAS: function () {
                    return fnObtenerNombreMesa('G');
                },
                C_FECHA: '',
                C_OPERACION: '',
                C_USUARIO_CAJA: '',

                IND_DELIVERY: $('#IND_DELIVERY').val(),
                C_CLIENTE_DELIVERY: $('#C_CLIENTE_DELIVERY').val(),
                TIPO_DOCUMENTO_DELIVERY: $('#TIPO_DOCUMENTO_DELIVERY').val(),
                RUC_DELIVERY: $('#RUC_DELIVERY').val(),
                NOMBRE_DELIVERY: $('#NOMBRE_DELIVERY').val(),
                DIRECCION_ENTREGA: $('#DIRECCION_ENTREGA').val(),
                REFERENCIA_ENTREGA: $('#REFERENCIA_ENTREGA').val(),
                TELEFONO: $('#TELEFONO').val(),
                METODO_PAGO_DELIVERY: $('#METODO_PAGO_DELIVERY').val(),
                TIPO_COMPROBANTE: $('#TIPO_COMPROBANTE').val()
            };
            const typePedido = (codPedido == '' ? 1 : 2);

            if (typePedido == 1) {
                objectPedido['C_USUARIO'] = codUsuario;

                if ($('#C_MESERO').val() != '') {
                    objectPedido['C_USUARIO'] = $('#C_MESERO').val();
                    $('#C_MESERO').val('');
                }
                //objectPedido['IND_ESTADO'] = "*";
            };
            if (nroPedido.length == 0) {
                extraPedido['NRO_PEDIDO'] = {
                    action: {
                        name: 'GetNextId',
                        args: $.ConvertObjectToArr({
                            columns: 'C_EMPRESA,FECHA_PEDIDO',
                            max_length: 4
                        })
                    }
                };
            };

            const tokenPedido = $.AddPetition({
                table: 'PDV.PEDIDO',
                type: typePedido,
                condition: conditionPedido,
                items: $.ConvertObjectToArr(objectPedido, extraPedido)
            });

            return tokenPedido;
        };
        const fnAgregarPeticionesPedido = function (codTipoDoc, codCliente, codMoneda, codPedido, propina) {

            // Crear o Actualizar cabecera del pedido
            const tokenPedido = fnActualizarPeticionesPedido(codTipoDoc, codCliente, codMoneda, codPedido, propina);
            const groupPlatos = JSON.parse(JSON.stringify(objPedido.platos));

            // Seccion solo en modo restaurant (mesas)
            if ($.solver.basePath == '/restaurant') {

                //agregamos mesas al pedido
                for (var item in objMesa) {
                    var inRow = objMesa[item];
                    $.AddPetition({
                        type: 4,
                        items: $.ConvertObjectToArr(
                            {
                                script: 'spw_restaurant_agregar_mesa',
                                C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                                C_PEDIDO: '',
                                C_MESA: inRow.C_MESA,
                                C_USUARIO: $.solver.session.SESSION_ID,
                                NOMBRE_MESA: inRow['Nombre de Mesa'],
                                NRO_PERSONAS: inRow.NRO_PERSONAS
                            },
                            {
                                C_PEDIDO: {
                                    action: {
                                        name: 'GetParentId',
                                        args: $.ConvertObjectToArr({
                                            token: tokenPedido,
                                            column: 'C_PEDIDO'
                                        })
                                    }
                                },
                            }),
                        transaction: true
                    });
                };
            };
            // Agregamos detalle pedido
            for (var index in groupPlatos) {

                var itemPedidoDetalle = groupPlatos[index];

                var modoPedidoDetalle = 1;
                var condPedidoDetalle = '';
                var extraPedidoDetalle = {
                    C_PEDIDO: {
                        action: {
                            name: 'GetParentId',
                            args: $.ConvertObjectToArr({
                                column: 'C_PEDIDO',
                                token: tokenPedido
                            })
                        }
                    }
                };
                var objectPedidoDetalle = {
                    C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                    C_PEDIDO: codPedido,
                    C_DETALLE: itemPedidoDetalle.C_DETALLE,
                    C_PRODUCTO: itemPedidoDetalle.IdProducto,
                    DESCRIPCION: '',
                    CANTIDAD: itemPedidoDetalle.Cantidad,
                    PRECIO: numeral(itemPedidoDetalle.Precio).format('0.000'),
                    PORC_DSCTO: itemPedidoDetalle.PorcDscto || 0,
                    INCLUYE_IGV: '*',
                    AFECTACION_IGV: itemPedidoDetalle.Afectacion,
                    IND_SERVICIO: (itemPedidoDetalle.TipoProducto == '07229' ? '*' : '&'),
                    C_PRODUCTO_PRECIO: itemPedidoDetalle.IdProductoPrecio,
                    IND_ESTADO: itemPedidoDetalle.Estado,
                    C_ALMACEN: (itemPedidoDetalle.C_ALMACEN == '' ? null : itemPedidoDetalle.C_ALMACEN),
                    STOCK: itemPedidoDetalle.STOCK,
                    C_PARAMETRO_GENERAL_UNIDAD: itemPedidoDetalle.C_UNIDAD_MEDIDA,
                    PRECIO_ORIGINAL: itemPedidoDetalle.PrecioOriginal,
                    AFECTACION_IGV_ORIGINAL: itemPedidoDetalle.AfectacionIgvOriginal,
                    CORTESIA: itemPedidoDetalle.Cortesia,
                    C_COMANDA: (itemPedidoDetalle.NroComanda == '' ? null : itemPedidoDetalle.NroComanda),
                    C_FECHA: (itemPedidoDetalle.FechaComanda == '' ? null : itemPedidoDetalle.FechaComanda),
                    IND_ENVIADO_COCINA: (itemPedidoDetalle.EnviadCocina == '' ? '&' : itemPedidoDetalle.EnviadCocina),
                    NOTA: (itemPedidoDetalle.Nota == '' ? null : itemPedidoDetalle.Nota),
                    C_USUARIO: $.solver.session.SESSION_ID,
                    C_COCINA: itemPedidoDetalle.C_COCINA,
                    FEC_CREAC: itemPedidoDetalle.FechaPedidoDetalle,
                    NOTA_2: itemPedidoDetalle.Nota2
                };

                if (itemPedidoDetalle.C_DETALLE == '') {
                    let codigoDetalle = '000' + (parseInt(index) + 1);
                    objPedido.platos[index].C_DETALLE = codigoDetalle.substring(codigoDetalle.length - 3, codigoDetalle.length);
                    objectPedidoDetalle['C_DETALLE'] = objPedido.platos[index].C_DETALLE;
                }
                else {
                    modoPedidoDetalle = 2;
                    condPedidoDetalle = `C_EMPRESA='${$.solver.session.SESSION_EMPRESA}' AND C_PEDIDO='${codPedido}' AND C_DETALLE='${itemPedidoDetalle.C_DETALLE}'`;
                };

                var tokenPedidoDetalle = $.AddPetition({
                    table: 'PDV.PEDIDO_DETALLE',
                    type: modoPedidoDetalle,
                    condition: condPedidoDetalle,
                    items: $.ConvertObjectToArr(objectPedidoDetalle, extraPedidoDetalle)
                });

                for (var i = 0; i < itemPedidoDetalle.PROMOCION.length; i++) {
                    var itemPedidoPromoDetalle = itemPedidoDetalle.PROMOCION[i];

                    var modoPedidoPromoDetalle = 1;
                    var condPedidoPromoDetalle = '';
                    var extraPedidoPromoDetalle = {
                        C_PEDIDO: {
                            action: {
                                name: 'GetParentId',
                                args: $.ConvertObjectToArr({
                                    column: 'C_PEDIDO',
                                    token: tokenPedido
                                })
                            }
                        },
                        C_DETALLE: {
                            action: {
                                name: 'GetParentId',
                                args: $.ConvertObjectToArr({
                                    column: 'C_DETALLE',
                                    token: tokenPedidoDetalle
                                })
                            }
                        }
                    };
                    var objectPedidoPromoDetalle = {
                        C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                        C_PEDIDO: codPedido,
                        C_DETALLE: itemPedidoPromoDetalle.C_DETALLE,
                        C_DETALLE_PROMO: itemPedidoPromoDetalle.C_DETALLE_PROMO,
                        C_PRODUCTO_REF: itemPedidoDetalle.IdProducto,
                        C_PRODUCTO_PROMO_DETALLE: itemPedidoPromoDetalle.C_PRODUCTO_PROMO_DETALLE,
                        C_PRODUCTO: itemPedidoPromoDetalle.C_PRODUCTO,
                        PRECIO: itemPedidoPromoDetalle.PRECIO,
                        CANTIDAD: itemPedidoPromoDetalle.CANTIDAD,
                        C_UNIDAD_MEDIDA: itemPedidoPromoDetalle.C_UNIDAD_MEDIDA
                    }

                    if (itemPedidoPromoDetalle.C_DETALLE_PROMO == '') {
                        let codigoDetalle = '000' + (parseInt(i) + 1);
                        objPedido.platos[index].PROMOCION[i].C_DETALLE_PROMO = codigoDetalle.substring(codigoDetalle.length - 3, codigoDetalle.length)
                        objectPedidoPromoDetalle.C_DETALLE_PROMO = objPedido.platos[index].PROMOCION[i].C_DETALLE_PROMO;
                    }
                    else {
                        modoPedidoPromoDetalle = 2;
                        condPedidoPromoDetalle = `C_EMPRESA='${$.solver.session.SESSION_EMPRESA}' AND C_PEDIDO='${codPedido}' AND C_DETALLE='${itemPedidoDetalle.C_DETALLE}' AND C_DETALLE_PROMO='${objectPedidoPromoDetalle.C_DETALLE_PROMO}'`;
                    }

                    $.AddPetition({
                        table: 'PDV.PEDIDO_DETALLE_PROMOCION',
                        type: modoPedidoPromoDetalle,
                        condition: condPedidoPromoDetalle,
                        items: $.ConvertObjectToArr(objectPedidoPromoDetalle, extraPedidoPromoDetalle)
                    })
                }

            };

            return tokenPedido;
        };
        /* AGREGAR PETICIONES */

        /* FUNCIONES PARA AGREGAR PRODUCTO */
        const fnReiniciarModalSeleccionarProducto = function () {
            $('#producto').html('');
            $('#cantidad').val('')
            $('#gratuito').html('');
            $('#promocion').html('');
            $('#stock').html('');
            $('#stockActual').text('');
            $('#nota').val('');
            $('#divStock').hide();
            $('#divAlmacen').hide();
            $('#divTipoCliente').hide();
            $('#divUnidadMedida').hide();
            $('#cantidad').removeAttr('max');
            $('.calculoPrecio').hide();
        };
        const fnMostrarLabelPromocion = function () {
            var rows = $('#tablePrecios').jqxGrid('getrows');
            var html = '<strong>Estos productos se descontaran: </strong><br />'
            var prods = [];
            for (var i = 0; i < rows.length; i++) {
                var item = rows[i];
                prods.push(item.NOMBRE_PARA_VENTA);
            }
            html += prods.join(`<strong> + </strong>`)
            $('#promocion').html(html);
        };
        const fnObtenerTipoCliente = function (C_PRODUCTO, C_UNIDAD_MEDIDA) {

            $('#tipoCliente').attr('data-query', 'cb_puntoventa_procesos_puntoventa_obtener_tipo_cliente')
            $('#tipoCliente').attr('data-C_PRODUCTO', C_PRODUCTO)
            $('#tipoCliente').attr('data-C_UNIDAD_MEDIDA', C_UNIDAD_MEDIDA)
            $('#tipoCliente').FieldLoadRemote({
                onReady: function () {
                    if ($('#tipoCliente')[0].args.data.length != 0) {
                        $('#divTipoCliente').show();
                        var PRECIO = $('#tipoCliente')[0].args.data.filter(x => x['CODIGO'] == $('#tipoCliente').val())[0].PRECIO;
                        var PRECIO_PRODUCTO = $('#tipoCliente')[0].args.data.filter(x => x['CODIGO'] == $('#tipoCliente').val())[0].PRECIO_PRODUCTO;
                        $('#precio').text(PRECIO);
                        $('#precioProducto').val(PRECIO_PRODUCTO);
                    }
                }
            })

            $('#tipoCliente').unbind('change')
            $('#tipoCliente').change(function () {
                var PRECIO = $('#tipoCliente')[0].args.data.filter(x => x['CODIGO'] == $('#tipoCliente').val())[0].PRECIO;
                var PRECIO_PRODUCTO = $('#tipoCliente')[0].args.data.filter(x => x['CODIGO'] == $('#tipoCliente').val())[0].PRECIO_PRODUCTO;
                $('#precio').text(PRECIO);
                $('#precioProducto').val(PRECIO_PRODUCTO);
            });

        };
        const fnObtenerTipoClienteStock = function (C_PRODUCTO, C_UNIDAD_MEDIDA, C_ALMACEN) {
            $('#tipoCliente').attr('data-query', 'cb_puntoventa_procesos_puntoventa_obtener_tipo_cliente_stock')
            $('#tipoCliente').attr('data-C_PRODUCTO', C_PRODUCTO)
            $('#tipoCliente').attr('data-C_UNIDAD_MEDIDA', C_UNIDAD_MEDIDA)
            $('#tipoCliente').attr('data-C_ALMACEN', C_ALMACEN)
            $('#tipoCliente').FieldLoadRemote({
                onReady: function () {
                    $('#divTipoCliente').show();
                    var PRECIO = $('#tipoCliente')[0].args.data.filter(x => x['CODIGO'] == $('#tipoCliente').val())[0].PRECIO;
                    var PRECIO_PRODUCTO = $('#tipoCliente')[0].args.data.filter(x => x['CODIGO'] == $('#tipoCliente').val())[0].PRECIO_PRODUCTO;
                    $('#precio').text(PRECIO);
                    $('#precioProducto').val(PRECIO_PRODUCTO);
                }
            })

            $('#tipoCliente').unbind('change')
            $('#tipoCliente').change(function () {
                var PRECIO = $('#tipoCliente')[0].args.data.filter(x => x['CODIGO'] == $('#tipoCliente').val())[0].PRECIO;
                var PRECIO_PRODUCTO = $('#tipoCliente')[0].args.data.filter(x => x['CODIGO'] == $('#tipoCliente').val())[0].PRECIO_PRODUCTO;
                $('#precio').text(PRECIO);
                $('#precioProducto').val(PRECIO_PRODUCTO);
            });
        };
        const fnObtenerStockActual = function (C_PRODUCTO, C_UNIDAD_MEDIDA, C_ALMACEN) {
            $.GetQuery({
                query: ['q_puntoventa_procesos_puntoventa_obtener_stock_actual'],
                items: [{
                    C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                    C_PRODUCTO,
                    C_UNIDAD_MEDIDA,
                    C_ALMACEN
                }],
                onReady: function (result) {
                    var stock = result[0];
                    $('#divStock').show();
                    $('#stock').text(stock.STOCK);
                    $('#stockActual').text(stock.STOCK);
                    $('#cantidad').attr('max', stock.STOCK)
                    if ($('#cantidad').val() > stock.STOCK) {
                        $('#cantidad').val(stock.STOCK);
                    }
                }
            })
        };
        const fnObtenerMedida = function (C_PRODUCTO) {
            $.GetQuery({
                query: ['cb_puntoventa_obtener_unidades_medida'],
                items: [{
                    C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                    C_PRODUCTO,
                }],
                onReady: function (unidades_medida) {

                    $('#divUnidadMedida').show();

                    var html = '';
                    $.each(unidades_medida, function (i, unidad) {
                        var checked = '';
                        if (i == 0) checked = 'active-box-unidad'
                        html += `
                            <div class="col">
                                <div class="unidad-box ${checked}" data-codigo="${unidad.CODIGO}" data-nombre="${unidad.NOMBRE}">
                                    ${unidad.NOMBRE}
                                    <div class="check-select"><i class="fa fa-check-square-o fa-1x" aria-hidden="true"></i></div>
                                </div>
                            </div>
                        `;
                    });

                    $('#lstUnidadMedida').html(html);

                    $('.unidad-box').unbind('click')
                    $('.unidad-box').click(function () {
                        if ($(this).attr('data-codigo') != $('.active-box-unidad').attr('data-codigo')) {
                            $.each($('.unidad-box'), function (i, v) {
                                $(v).removeClass('active-box-unidad');
                            });
                            $(this).addClass('active-box-unidad');
                            fnObtenerTipoCliente(C_PRODUCTO, $('.active-box-unidad').attr('data-codigo'));
                        }
                    });

                    fnObtenerTipoCliente(C_PRODUCTO, $('.active-box-unidad').attr('data-codigo'));
                }
            });
        };
        const fnObtenerMedidaStock = function (C_PRODUCTO) {
            $.GetQuery({
                query: ['cb_puntoventa_obtener_unidades_medida_stock'],
                items: [{
                    C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                    C_PRODUCTO,
                    C_ALMACEN: function () {
                        return $('#almacen').val() || '';
                    }
                }],
                onReady: function (unidades_medida) {
                    $('#divUnidadMedida').show();

                    var html = '';
                    $.each(unidades_medida, function (i, unidad) {
                        var checked = '';
                        if (i == 0) checked = 'active-box-unidad'
                        html += `
                            <div class="col">
                                <div class="unidad-box ${checked}" data-codigo="${unidad.CODIGO}" data-nombre="${unidad.NOMBRE}">
                                    ${unidad.NOMBRE}
                                    <div class="check-select"><i class="fa fa-check-square-o fa-1x" aria-hidden="true"></i></div>
                                </div>
                            </div>
                        `;
                    });
                    $('#lstUnidadMedida').html(html);

                    $('.unidad-box').unbind('click');
                    $('.unidad-box').click(function () {
                        if ($(this).attr('data-codigo') != $('.active-box-unidad').attr('data-codigo')) {
                            $.each($('.unidad-box'), function (i, v) {
                                $(v).removeClass('active-box-unidad')
                            });
                            $(this).addClass('active-box-unidad');
                            fnObtenerStockActual(C_PRODUCTO, $('.active-box-unidad').attr('data-codigo'), $('#almacen').val());
                            fnObtenerTipoClienteStock(C_PRODUCTO, $('.active-box-unidad').attr('data-codigo'), $('#almacen').val());
                        }
                    });

                    fnObtenerTipoClienteStock(C_PRODUCTO, $('.active-box-unidad').attr('data-codigo'), $('#almacen').val());
                    fnObtenerStockActual(C_PRODUCTO, $('.active-box-unidad').attr('data-codigo'), $('#almacen').val());
                }
            });
        };
        // Acciones
        const fnSeleccionarProducto = function (productos, refToken) {
            $.GetQuery({
                query: [
                    'q_puntoventa_procesos_puntoventa_obtenerproducto_porid',
                    'q_puntoventa_procesos_puntoventa_obtenerproducto_validarstock',
                    'q_puntoventa_procesos_puntoventa_obtenerdetalle_promo'
                ],
                items: [
                    {
                        C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                        C_PRODUCTO: productos[refToken].C_PRODUCTO
                    },
                    {
                        C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                        C_PRODUCTO: productos[refToken].C_PRODUCTO,
                        C_CAJA: function () {
                            return $('#COD_CAJA').val()
                        }
                    },
                    {
                        C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                        C_PRODUCTO: productos[refToken].C_PRODUCTO
                    },
                ],
                onReady: function (producto) {

                    var validarStock = producto['q_puntoventa_procesos_puntoventa_obtenerproducto_validarstock'].result.rows
                    var {
                        C_PRODUCTO,
                        NOMBRE_PARA_VENTA,
                        C_PARAMETRO_GENERAL_TIPO_PRODUCTO,
                        PROMOCION,
                        CALCULO_PRECIO,
                        STOCK_ILIMITADO,
                        C_PARAMETRO_GENERAL_AFECTACION_IGV,
                        CODIGO_AFECTACION_IGV,
                        PRECIO_REF
                    } = producto['q_puntoventa_procesos_puntoventa_obtenerproducto_porid'].result.rows[0];
                    var productosPromo = producto['q_puntoventa_procesos_puntoventa_obtenerdetalle_promo'].result.rows

                    fnReiniciarModalSeleccionarProducto();

                    if (C_PARAMETRO_GENERAL_TIPO_PRODUCTO == '07229') {

                        $('#modalProducto').modal('show');
                        $('#cbo_nota').FieldLoadRemote({
                            onReady: function () {
                                $('#cbo_nota').selectpicker('destroy');
                                $('#cbo_nota').selectpicker();
                            }
                        });

                        $('#producto').text(NOMBRE_PARA_VENTA);
                        $('#precio').text(PRECIO_REF);
                        $('#precioProducto').val(PRECIO_REF);

                        if (parseInt(CODIGO_AFECTACION_IGV) == 0) $('#gratuito').html('<strong><label>** Este producto es gratuito</label></strong>')

                        setTimeout(function () {
                            $('#cantidad').val(1);
                        }, 250);

                    }
                    else {

                        if (STOCK_ILIMITADO == '*') {

                            $('#modalProducto').modal('show');
                            $('#cbo_nota').FieldLoadRemote({
                                onReady: function () {
                                    $('#cbo_nota').selectpicker('destroy');
                                    $('#cbo_nota').selectpicker();
                                }
                            });
                            $('#producto').text(NOMBRE_PARA_VENTA);
                            if (parseInt(CODIGO_AFECTACION_IGV) == 0) $('#gratuito').html('<strong><label>** Este producto es gratuito</label></strong>')

                            setTimeout(function () {
                                $('#cantidad').val(1);
                            }, 250);

                            fnObtenerMedida(C_PRODUCTO);

                        }
                        else {

                            if (validarStock.length == 0) {
                                fnObtenerAlertaWarning('Producto sin stock');
                            }
                            else if (validarStock[0].C_ALMACEN != '') {

                                $('#modalProducto').modal('show');
                                $('#cbo_nota').FieldLoadRemote({
                                    onReady: function () {
                                        $('#cbo_nota').selectpicker('destroy');
                                        $('#cbo_nota').selectpicker();
                                    }
                                });

                                var html = '';

                                $.each(validarStock, function (i, almacen) {
                                    html += `<option ${(i == 0 ? 'selected="selected"' : '')} value="${almacen.C_ALMACEN}">${almacen.NOMBRE_ALMACEN}</option>`;
                                });

                                $('#divAlmacen').show();
                                $('#almacen').html(html)

                                $('#almacen').unbind('change')
                                $('#almacen').change(function () {
                                    fnObtenerMedidaStock(C_PRODUCTO);
                                });

                                $('#producto').text(NOMBRE_PARA_VENTA);

                                if (parseInt(CODIGO_AFECTACION_IGV) == 0) $('#gratuito').html('<strong><label>** Este producto es gratuito</label></strong>')

                                setTimeout(function () {
                                    $('#cantidad').val(1);
                                }, 250);

                                fnObtenerMedidaStock(C_PRODUCTO);
                            };

                        };

                    };

                    if (PROMOCION == '*' && (productosPromo.filter(x => x['IND_CAMBIAR_PROD'] == '*').length != 0 || CALCULO_PRECIO != '')) {

                        $('.calculoPrecio').show();
                        $('#modalProducto').find('.modal-dialog').css({ 'max-width': '90%' });

                        $('#divTable').html('<div id="tablePrecios"></div>')

                        var hiddens = [];
                        if (CALCULO_PRECIO == '10255') hiddens = ['C_PRODUCTO', 'C_EMPRESA', 'C_PRODUCTO_PROMO_DETALLE', 'SUBTOTAL', 'C_CATEGORIA', 'C_UNIDAD_MEDIDA']
                        else hiddens = ['C_PRODUCTO', 'C_EMPRESA', 'C_PRODUCTO_PROMO_DETALLE', 'PRECIO', 'SUBTOTAL', 'C_CATEGORIA', 'C_UNIDAD_MEDIDA']

                        $('#tablePrecios').CreateGrid({
                            query: 'tbl_puntoventa_procesos_puntoventa_obtenerdetallepromo',
                            hiddens: hiddens,
                            items: {
                                C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                                C_PRODUCTO: C_PRODUCTO
                            },
                            columns: {
                                '_rowNum': {
                                    text: '#',
                                    width: '30',
                                    cellsAlign: 'center',
                                    cellsalign: 'center',
                                    hidden: false,
                                    pinned: true,
                                    editable: false,
                                    sortable: false
                                },
                                NOMBRE_PARA_VENTA: {
                                    editable: false,
                                    text: 'Producto',
                                    width: 200
                                },
                                CANTIDAD: {
                                    editable: false,
                                    text: 'Cant',
                                    cellsFormat: 'd2',
                                    cellsAlign: 'right',
                                    columnType: 'numberinput',
                                    width: 90
                                },
                                UNIDAD_MEDIDA: {
                                    editable: false,
                                    text: 'U.M',
                                    cellsFormat: 'd2',
                                    cellsAlign: 'right',
                                    width: 100
                                },
                                PRECIO: {
                                    editable: false,
                                    text: 'Precio',
                                    cellsFormat: 'd2',
                                    cellsAlign: 'right',
                                    width: 80
                                },
                                SUBTOTAL: {
                                    editable: false,
                                    text: 'Subtotal',
                                    cellsFormat: 'd2',
                                    cellsAlign: 'right',
                                    width: 80,
                                    aggregates: ['sum'],
                                    aggregatesRenderer: function (aggregates, column, element) {
                                        var formatNumber = aggregates.sum;
                                        if (formatNumber === undefined)
                                            formatNumber = '';
                                        return `<div class="h-30 d-flex justify-content-end align-items-center font-weight-bold">
                                                    <strong> ${formatNumber} </strong>
                                                </div>`;
                                    }
                                },
                                IND_CAMBIAR_PROD: {
                                    editable: false,
                                    text: '',
                                    width: 100,
                                    cellsrenderer: function (index, columnfield, value, defaulthtml, columnproperties) {
                                        if (value == '*') {
                                            var botones = ''
                                            botones += `<a class="btn btn-orange" onclick="$.CambiarProducto('${index}', '${CALCULO_PRECIO}');" style="cursor: pointer;"><i class="fa fa-edit"> Cambiar</i></a>`
                                            return `<div class="jqx-grid-cell-middle-align" style="margin-top: 7px;">${botones}</div>`;
                                        }
                                        else {
                                            return '';
                                        }
                                    }
                                }
                            },
                            config: {
                                editable: true,
                                height: 400,
                                rowsheight: 45,
                                showaggregates: true,
                                showstatusbar: true,
                                statusbarheight: 20,
                                sortable: false
                            }
                        });
                        $('#tablePrecios').on('bindingcomplete', function () {
                            var rows = $('#tablePrecios').jqxGrid('getrows');
                            if (CALCULO_PRECIO == '10255') {
                                var mayor = 0;
                                $.each(rows, function (i, v) {
                                    if (v.PRECIO * v.CANTIDAD >= mayor) {
                                        mayor = v.PRECIO;
                                    }
                                })
                                $('#precio').text('S/ ' + numeral(mayor).format('0.00'))
                                $('#precioProducto').val(mayor)
                            }
                            var cambiaProducto = false;
                            for (var i = 0; i < rows.length; i++) {
                                var item = rows[i];
                                if (item.IND_CAMBIAR_PROD == '*') {
                                    cambiaProducto = true;
                                }
                            }
                            setTimeout(function () {
                                if (!cambiaProducto) {
                                    $('#tablePrecios').jqxGrid('hidecolumn', 'IND_CAMBIAR_PROD');
                                }
                            }, 250)
                            fnMostrarLabelPromocion();
                        });
                    }
                    else {
                        $('#modalProducto').find('.modal-dialog').css({ 'max-width': '30%' });
                    }

                    $('#btnAgregarProducto').unbind('click');
                    $('#btnAgregarProducto').bind('click', function () {
                        if ($('#cantidad').val() == '' || $('#cantidad').val() == 0) {
                            fnObtenerAlertaError('Faltan rellenar campos');
                        }
                        else if (parseFloat($('#cantidad').val()) < 0) {
                            fnObtenerAlertaError('La cantidad no puede ser menor a 0');
                        }
                        else {

                            var C_UNIDAD_MEDIDA = ''
                            var UNIDAD_MEDIDA = ''
                            var TIPO_CLIENTE = ''
                            var PRECIO = $('#precioProducto').val();
                            var CANTIDAD = parseFloat($('#cantidad').val());
                            var C_PRODUCTO_PRECIO = ''

                            if (C_PARAMETRO_GENERAL_TIPO_PRODUCTO != '07229') {

                                var precios = $('#tipoCliente')[0].args.data.filter(x => x['CODIGO'] == $('#tipoCliente').val());

                                C_UNIDAD_MEDIDA = $('.active-box-unidad').attr('data-codigo');
                                UNIDAD_MEDIDA = $('.active-box-unidad').attr('data-nombre');
                                TIPO_CLIENTE = $('#tipoCliente').val();
                                PRECIO = $('#precioProducto').val();
                                C_PRODUCTO_PRECIO = (precios.length > 0 ? precios[0].C_PRODUCTO_PRECIO : '');

                            };

                            if (PROMOCION == '*' && (productosPromo.filter(x => x['IND_CAMBIAR_PROD'] == '*').length != 0 || CALCULO_PRECIO != '')) {
                                productosPromo = [];
                                var promos = $('#tablePrecios').jqxGrid('getrows')
                                for (var i = 0; i < promos.length; i++) {
                                    var item = promos[i];
                                    productosPromo.push({
                                        C_DETALLE: '',
                                        C_DETALLE_PROMO: '',
                                        C_PRODUCTO_REF: C_PRODUCTO,
                                        C_PRODUCTO_PROMO_DETALLE: item.C_PRODUCTO_PROMO_DETALLE,
                                        C_PRODUCTO: item.C_PRODUCTO,
                                        PRECIO: item.PRECIO,
                                        CANTIDAD: item.CANTIDAD,
                                        C_UNIDAD_MEDIDA: item.C_UNIDAD_MEDIDA,
                                        NOMBRE_PARA_VENTA: item.NOMBRE_PARA_VENTA
                                    })
                                }
                            }

                            fnAgregarProducto({
                                C_PRODUCTO, NOMBRE_PARA_VENTA, PROMOCION, STOCK_ILIMITADO,
                                C_PARAMETRO_GENERAL_AFECTACION_IGV, CODIGO_AFECTACION_IGV,
                                C_UNIDAD_MEDIDA, UNIDAD_MEDIDA, TIPO_CLIENTE, PRECIO,
                                C_PRODUCTO_PRECIO, C_PARAMETRO_GENERAL_TIPO_PRODUCTO, CANTIDAD,
                                PROMOCION: productosPromo
                            });

                        }
                    });

                    $('#btnCancelarProducto').unbind('click');
                    $('#btnCancelarProducto').bind('click', function () {
                        $('#modalProducto').modal('hide');
                        //$('#buscarProducto').focus();
                    });

                    $('#btnMenos').unbind('click');
                    $('#btnMenos').bind('click', function () {
                        var cantidad = parseFloat($('#cantidad').val());
                        if (cantidad != '' && cantidad > 0) {
                            if ((cantidad - 1) == 0) {
                                $('#cantidad').val(1);
                            }
                            else {
                                $('#cantidad').val(cantidad - 1);
                            };
                        }
                        else {
                            $('#cantidad').val(1);
                        }
                        if (PROMOCION == '*') {
                            $('#tablePrecios').jqxGrid('refresh')
                            if (CALCULO_PRECIO == '10255') {
                                var rows = $('#tablePrecios').jqxGrid('getrows');
                                var mayor = 0;
                                $.each(rows, function (i, v) {
                                    if (v.PRECIO >= mayor) {
                                        mayor = v.PRECIO;
                                    }
                                })
                                $('#precio').text('S/ ' + numeral(mayor).format('0.00'))
                                $('#precioProducto').val(mayor)
                            }
                        }
                    });

                    $('#btnMas').unbind('click');
                    $('#btnMas').bind('click', function () {
                        var cantidad = parseFloat($('#cantidad').val());
                        var limite = $('#cantidad').attr('max')
                        if (limite != undefined) {
                            if (cantidad + 1 <= limite) {
                                $('#cantidad').val(cantidad + 1);
                            }
                        }
                        else {
                            $('#cantidad').val(cantidad + 1);
                        }
                        if (PROMOCION == '*') {
                            $('#tablePrecios').jqxGrid('refresh')
                            if (CALCULO_PRECIO == '10255') {
                                var rows = $('#tablePrecios').jqxGrid('getrows');
                                var mayor = 0;
                                $.each(rows, function (i, v) {
                                    if (v.PRECIO >= mayor) {
                                        mayor = v.PRECIO;
                                    }
                                })
                                $('#precio').text('S/ ' + numeral(mayor).format('0.00'))
                                $('#precioProducto').val(mayor)
                            }
                        }
                    });

                    $('#cantidad').unbind('keyup');
                    $('#cantidad').keyup(function () {
                        var cantidad = parseFloat($('#cantidad').val());
                        var limite = $('#cantidad').attr('max')
                        if (cantidad < 0) {
                            $('#cantidad').val('')
                        }
                        if (cantidad >= limite) {
                            $('#cantidad').val(limite);
                        }
                    });

                    $('#cbo_nota').unbind('change');
                    $('#cbo_nota').change(function () {
                        const nota = $('#cbo_nota').val();
                        $('#nota').val(nota)
                    })

                }
            });
        };
        const fnSeleccionarAgregarProducto = function (productos, refToken) {

            $.GetQuery({
                query: [
                    'q_puntoventa_procesos_puntoventa_obtenerproducto_porid',
                    'q_puntoventa_procesos_puntoventa_obtenerproducto_validarstock'
                ],
                items: [
                    {
                        C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                        C_PRODUCTO: productos[refToken].C_PRODUCTO
                    },
                    {
                        C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                        C_PRODUCTO: productos[refToken].C_PRODUCTO,
                        C_CAJA: function () {
                            return $('#COD_CAJA').val()
                        }
                    }
                ],
                onReady: function (producto) {

                    if ($.solver.basePath == '/restaurant') {
                        fnSeleccionarProducto(productos, refToken);
                        return;
                    };

                    var validarStock = producto['q_puntoventa_procesos_puntoventa_obtenerproducto_validarstock'].result.rows;
                    var { C_PRODUCTO,
                        NOMBRE_PARA_VENTA,
                        C_PARAMETRO_GENERAL_TIPO_PRODUCTO,
                        PROMOCION,
                        STOCK_ILIMITADO,
                        C_PARAMETRO_GENERAL_AFECTACION_IGV,
                        CODIGO_AFECTACION_IGV,
                        PRECIO_REF
                    } = producto['q_puntoventa_procesos_puntoventa_obtenerproducto_porid'].result.rows[0];

                    if (C_PARAMETRO_GENERAL_TIPO_PRODUCTO == '07229') {

                        var C_UNIDAD_MEDIDA = ''
                        var UNIDAD_MEDIDA = ''
                        var TIPO_CLIENTE = ''
                        var PRECIO = PRECIO_REF
                        var C_PRODUCTO_PRECIO = ''
                        var CANTIDAD = 1;

                        fnAgregarProducto({ C_PRODUCTO, NOMBRE_PARA_VENTA, PROMOCION, STOCK_ILIMITADO, C_PARAMETRO_GENERAL_AFECTACION_IGV, CODIGO_AFECTACION_IGV, C_UNIDAD_MEDIDA, UNIDAD_MEDIDA, TIPO_CLIENTE, PRECIO, C_PRODUCTO_PRECIO, C_PARAMETRO_GENERAL_TIPO_PRODUCTO, CANTIDAD });
                        //fnMostrarResumen();
                        //fnValidarBotones();
                        //fnObtenerPlatos();

                    }
                    else {

                        if (STOCK_ILIMITADO == '*') {

                            // Si es ilimitado solo se verifica si la unidad de medida y el tipo cliente son 1
                            $.GetQuery({
                                query: ['cb_puntoventa_obtener_unidades_medida'],
                                items: [{
                                    C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                                    C_PRODUCTO,
                                }],
                                onReady: function (unidades_medida) {
                                    if (unidades_medida.length == 1) {
                                        var codigoMedida = unidades_medida[0].CODIGO;
                                        var nombreMedida = unidades_medida[0].NOMBRE;
                                        $.GetQuery({
                                            query: ['cb_puntoventa_procesos_puntoventa_obtener_tipo_cliente'],
                                            items: [{
                                                C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                                                C_PRODUCTO: C_PRODUCTO,
                                                C_UNIDAD_MEDIDA: codigoMedida,
                                            }],
                                            onReady: function (tipoCliente) {
                                                if (tipoCliente.length == 1) {
                                                    var codigoTipoCliente = tipoCliente[0].CODIGO;
                                                    var codigoPrecioProducto = tipoCliente[0].C_PRODUCTO_PRECIO;
                                                    var precio = tipoCliente[0].PRECIO_PRODUCTO;

                                                    var C_UNIDAD_MEDIDA = codigoMedida
                                                    var UNIDAD_MEDIDA = nombreMedida
                                                    var TIPO_CLIENTE = codigoTipoCliente
                                                    var PRECIO = precio
                                                    var C_PRODUCTO_PRECIO = codigoPrecioProducto
                                                    var CANTIDAD = 1;
                                                    fnAgregarProducto({ C_PRODUCTO, NOMBRE_PARA_VENTA, PROMOCION, STOCK_ILIMITADO, C_PARAMETRO_GENERAL_AFECTACION_IGV, CODIGO_AFECTACION_IGV, C_UNIDAD_MEDIDA, UNIDAD_MEDIDA, TIPO_CLIENTE, PRECIO, C_PRODUCTO_PRECIO, C_PARAMETRO_GENERAL_TIPO_PRODUCTO, CANTIDAD });
                                                    //fnMostrarResumen();
                                                    //fnValidarBotones();
                                                    //$('#buscarProducto').val('');
                                                    //fnObtenerPlatos();
                                                }
                                                else {
                                                    fnSeleccionarProducto(productos, refToken);
                                                }
                                            }
                                        });
                                    }
                                    else {
                                        fnSeleccionarProducto(productos, refToken);
                                    }
                                }
                            });

                        }
                        else {

                            if (validarStock.length == 0) {
                                fnObtenerAlertaWarning('Producto sin stock');
                            }
                            else if (validarStock[0].C_ALMACEN != '') {
                                if (validarStock.length == 1) {

                                    var c_almacen = validarStock[0].C_ALMACEN;
                                    var almacen = validarStock[0].NOMBRE_ALMACEN;

                                    $.GetQuery({
                                        query: ['cb_puntoventa_obtener_unidades_medida_stock'],
                                        items: [{
                                            C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                                            C_PRODUCTO,
                                            C_ALMACEN: c_almacen
                                        }],
                                        onReady: function (unidades_medida) {
                                            if (unidades_medida.length == 1) {

                                                var codigoMedida = unidades_medida[0].CODIGO
                                                var nombreMedida = unidades_medida[0].NOMBRE

                                                $.GetQuery({
                                                    query: ['cb_puntoventa_procesos_puntoventa_obtener_tipo_cliente_stock'],
                                                    items: [{
                                                        C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                                                        C_PRODUCTO,
                                                        C_UNIDAD_MEDIDA: codigoMedida,
                                                        C_ALMACEN: c_almacen
                                                    }],
                                                    onReady: function (tipoCliente) {
                                                        if (tipoCliente.length == 1) {
                                                            var codigoTipoCliente = tipoCliente[0].CODIGO;
                                                            var codigoPrecioProducto = tipoCliente[0].C_PRODUCTO_PRECIO;
                                                            var precio = tipoCliente[0].PRECIO_PRODUCTO;

                                                            var C_UNIDAD_MEDIDA = codigoMedida
                                                            var UNIDAD_MEDIDA = nombreMedida
                                                            var TIPO_CLIENTE = codigoTipoCliente
                                                            var PRECIO = precio
                                                            var C_PRODUCTO_PRECIO = codigoPrecioProducto
                                                            var CANTIDAD = 1;
                                                            fnAgregarProducto({ C_PRODUCTO, NOMBRE_PARA_VENTA, PROMOCION, STOCK_ILIMITADO, C_PARAMETRO_GENERAL_AFECTACION_IGV, CODIGO_AFECTACION_IGV, C_UNIDAD_MEDIDA, UNIDAD_MEDIDA, TIPO_CLIENTE, PRECIO, C_PRODUCTO_PRECIO, C_PARAMETRO_GENERAL_TIPO_PRODUCTO, CANTIDAD });
                                                            //fnMostrarResumen();
                                                            //fnValidarBotones();
                                                            //$('#buscarProducto').val('');
                                                            //fnObtenerPlatos();
                                                        }
                                                        else {
                                                            fnSeleccionarProducto(productos, refToken);
                                                        }
                                                    }
                                                })
                                            }
                                            else {
                                                fnSeleccionarProducto(productos, refToken);
                                            }
                                        }
                                    });

                                }
                                else {
                                    fnSeleccionarProducto(productos, refToken);
                                }
                            }

                        }

                    }
                }
            });

        };
        const fnAgregarProducto = function (data) {

            var c_almacen = $('#almacen').val();
            if (c_almacen == null || c_almacen == '') {
                c_almacen = $('#C_ALMACEN_DEFECTO').val();
            };
            if (c_almacen == null || c_almacen == '') {
                c_almacen = null;
            };

            var PlatoContar = objPedido.platos.length + 1;
            var nota2 = data.PROMOCION.map(function (x) {
                return x.CANTIDAD + ' ' + x.NOMBRE_PARA_VENTA;
            }).join('<br>');
            var Plato = {
                Fila: PlatoContar,
                IdPedido: '',
                IdProducto: data.C_PRODUCTO,
                Nombre: data.NOMBRE_PARA_VENTA + (nota2 == '' ? '' : '<br/><span class="text-primary">' + nota2 + '</span>') + ($('#nota').val() == '' ? '' : '<br/><span class="text-danger">&nbsp;' + $('#nota').val() + '</span>'),
                NombreCorto: data.NOMBRE_PARA_VENTA,
                Precio: data.PRECIO,
                AfectacionCabecera: data.CODIGO_AFECTACION_IGV,
                AfectacionCabeceraOriginal: data.CODIGO_AFECTACION_IGV,
                Cantidad: data.CANTIDAD,
                Afectacion: data.C_PARAMETRO_GENERAL_AFECTACION_IGV,
                TipoProducto: data.C_PARAMETRO_GENERAL_TIPO_PRODUCTO,
                IdProductoPrecio: data.C_PRODUCTO_PRECIO,
                C_ALMACEN: c_almacen,
                NOM_ALMACEN: '',
                STOCK: (data.C_PARAMETRO_GENERAL_TIPO_PRODUCTO == '07229' ? null : parseFloat($('#stock').val())),
                Estado: '*',
                C_UNIDAD_MEDIDA: (data.C_PARAMETRO_GENERAL_TIPO_PRODUCTO == '07229' ? null : data.C_UNIDAD_MEDIDA),
                C_PRODUCTO_PRECIO: (data.C_PARAMETRO_GENERAL_TIPO_PRODUCTO == '07229' ? null : data.C_PRODUCTO_PRECIO),
                PrecioOriginal: data.PRECIO,
                AfectacionIgvOriginal: data.C_PARAMETRO_GENERAL_AFECTACION_IGV,
                Cortesia: '&',
                NroComanda: '',
                FechaComanda: '',
                Guardado: false,
                EnviadCocina: '&',
                Nota: $('#nota').val(),
                C_DETALLE: '',
                FechaPedidoDetalle: moment(new Date()).format('DD/MM/YYYY HH:mm:ss'),
                PROMOCION: data.PROMOCION,
                Nota2: nota2
            };

            var search = objPedido.platos.find(x =>
                x.IdProducto == data.C_PRODUCTO &&
                x.IdProductoPrecio == data.C_PRODUCTO_PRECIO &&
                x.C_ALMACEN == Plato.C_ALMACEN &&
                x.NroComanda == '' &&
                x.Estado == '*' &&
                x.Nota == Plato.Nota &&
                JSON.stringify(x.PROMOCION.map(({ C_PRODUCTO_REF, C_PRODUCTO, CANTIDAD }) => ({ C_PRODUCTO_REF: C_PRODUCTO_REF, C_PRODUCTO: C_PRODUCTO, CANTIDAD: CANTIDAD }))) == JSON.stringify(Plato.PROMOCION.map(({ C_PRODUCTO_REF, C_PRODUCTO, CANTIDAD }) => ({ C_PRODUCTO_REF: C_PRODUCTO_REF, C_PRODUCTO: C_PRODUCTO, CANTIDAD: CANTIDAD })))
            );

            if (search == undefined) {
                objPedido.platos.push(Plato);
            }
            else {
                search.Cantidad += parseFloat($('#cantidad').val());
            };

            $('#modalProducto').modal('hide');

            //para ir guardando automaticamente
            fnActionGuardar(null, function () {
                fnMostrarPedidos();
                fnMostrarResumen();
            });

        };
        /* FUNCIONES PARA AGREGAR PRODUCTO */

        /* FUNCIONES PARA RESUMEN */
        const fnMostrarResumen = function () {

            var siteResumen = $('#zoneResumen');
            var actions = `
            <tr>
                <th colspan="4" class="p-0">
                    <div class="row">
                        <div class="col-4 pr-0 text-truncate">
                            <button name="btnSepararCuentas" class="btn btn-lg btn-orange btn-block rounded-0 pl-1 pr-1 text-truncate"><i class="fa fa-random" aria-hidden="true"></i> Dividir Cuenta</button>
                        </div>
                        <div class="col-4 pl-0 pr-0 text-truncate">
                            <button name="btnAplicarCortesia" class="btn btn-lg btn-orange btn-block rounded-0 pl-1 pr-1 text-truncate"><i class="fa fa-scissors" aria-hidden="true"></i> Cortesias</button>
                        </div>
                        <div class="col-4 pl-0 text-truncate">
                            <button name="btnAplicarDescuento" class="btn btn-lg btn-orange btn-block rounded-0 pl-1 pr-1 text-truncate"><i class="fa fa-window-restore" aria-hidden="true"></i> Descuentos</button>
                        </div>
                    </div>
                </th>
            </tr>`;

            siteResumen.empty();

            var rows = '';
            let precio = 0.00;

            // Mostramos solo productos con estado *
            $.each(objPedido.platos, function (i, item) {
                var platoPendiente = 'white'
                if (item.NroComanda == '') platoPendiente = '#FFC107';

                if (item.Estado == '*') {
                    rows += `
                        <tr style="background-color:${platoPendiente}">
                            <td align="center" style="width:5%">${(($('#IND_ESTADO').val() == '' || $('#IND_ESTADO').val() == '*') ? `<a href="#" class="Eliminar text-danger" data-index="${i}" data-IdProducto="${item.IdProducto}" style="font-size: 1.8rem;"><i class="fa fa-times-circle" aria-hidden="true"></i></a>` : '')}</td>
                            <td align="center" style="width:20%">${item.Cantidad}</td>
                            <td align="left" style="width:65%">${item.Nombre}</td>
                            <td align="left" style="text-align: right;width:30%;">${numeral((item.Precio * item.Cantidad) * parseInt(item.AfectacionCabecera)).format('0,0.00')}</td>
                        </tr>`;
                    precio += (item.Precio * item.Cantidad) * parseInt(item.AfectacionCabecera);
                }
            });

            // Si no hay filas muestra mensaje no hay productos
            if (rows == '') {
                rows += `
                <tr>
                    <td align="center" colspan="4"><i class="fa fa-exclamation-circle" aria-hidden="true"></i> No hay productos seleccionados</td>
                </tr>`;
                actions = '';
            };

            // Si el pedido es facturado o anulado no muestra opciones
            if ($('#IND_ESTADO').val() == 'F' || $('#IND_ESTADO').val() == '&') {
                actions = '';
            };

            if ($('#IND_ESTADO').val() == '*' && $('#COD_CAJA').val() == '' && objPermisos.FLAG_PERMISO_CREAR_PEDIDOS == '*') {
                actions = `<tr>
                    <th colspan="4" class="p-0">
                        <div class="row">
                            <div class="col text-truncate">
                                <button name="btnSepararCuentas" class="btn btn-lg btn-orange btn-block rounded-0 pl-1 pr-1 text-truncate"><i class="fa fa-random" aria-hidden="true"></i> Dividir Cuenta</button>
                            </div>
                        </div>
                    </th>
                </tr>`;
            };

            var table = `<div class="col">
                            <table id="tblPlatos" class="table table-striped table-responsive table-hover m-0 mytable-resumen">
                                <thead>  
                                    <tr style="width:100%" class="bg-solver-red">
                                        <th align="center" style="width:5%"></th>  
                                        <th align="center" style="width:20%">CANT.</th>  
                                        <th align="left" style="width:65%">ARTICULO</th>  
                                        <th align="left" style="width:30%">PRECIO</th>
                                    </tr>  
                                </thead>
                                <tbody class="tbody">
                                    ${rows} 
                                </tbody>
                                <tfoot>
                                    ${actions}
                                    <tr>
                                        <th colspan="3">SUB-TOTAL</th>
                                        <th style="text-align: right;">${numeral(precio).format('0,0.00')}</th>
                                    </tr>
                                </tfood>
                            </table>
                        </div>`;

            var pedidoCurrent = $('#C_PEDIDO').val() || '';
            if (pedidoCurrent != '') {
                $('#pedido-' + pedidoCurrent).find('.total').html(numeral(precio).format('0,0.00'));
            };

            siteResumen.append(table);

            $("a.Eliminar").unbind("click");
            $("a.Eliminar").bind("click", function (e) {
                let IndexProducto = $(this).attr("data-index");
                var search = objPedido.platos[IndexProducto];

                // Anteriormente se creaba un nuevo arreglo sin el plato seleccionado
                // Ahora solo se modifica el Estado a &
                const eliminarProducto = function (textMotivo, datausuario) {
                    search.Estado = '&';

                    const c_pedido = $('#C_PEDIDO').val();

                    if (objPedido.platos.filter(x => x['Estado'] == '*').length == 0) {
                        fnObtenerAlertaConfirm('Mensaje del sistema', 'El pedido se quedará sin productos, ¿Desea anular el pedido?',
                            function () {
                                fnActualizarPeticionesPedido(null, null, null, c_pedido, null);
                                const objectPedido = {
                                    script: 'spw_puntoventa_procesos_puntoventa_anularpedido_v2',
                                    C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                                    C_PEDIDO: c_pedido,
                                    C_USUARIO: $.solver.session.SESSION_ID,
                                    TIPO_ANULACION: '10104',
                                    MOTIVO_ANULACION: 'Anulado por pedido sin productos',
                                    ESTADO_PEDIDO: '&'
                                };
                                $.AddPetition({
                                    type: 4,
                                    items: $.ConvertObjectToArr(objectPedido),
                                    transaction: true
                                });
                                $.AddPetition({
                                    table: 'PDV.PEDIDO_DETALLE',
                                    type: 2,
                                    condition: `C_EMPRESA = '${$.solver.session.SESSION_EMPRESA}' AND C_PEDIDO = '${c_pedido}' AND C_DETALLE = '${search.C_DETALLE}'`,
                                    items: $.ConvertObjectToArr({
                                        C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                                        C_PEDIDO: c_pedido,
                                        C_DETALLE: search.C_DETALLE,
                                        IND_ESTADO: '&',
                                        ANULACION_MOTIVO: textMotivo || '',
                                        C_USUARIO_ANULA: (datausuario == undefined ? $.solver.session.SESSION_ID : datausuario[0].C_USUARIO)
                                    })
                                })
                                $.SendPetition({
                                    onBefore: function () {
                                        $.DisplayStatusBar({ message: 'Anulando pedido.' });
                                    },
                                    onReady: function () {

                                        $.CloseStatusBar();
                                        fnObtenerAlertaOk('Pedido anulado');

                                        $('#IND_ESTADO').val('&');

                                        baulPedidos = JSON.parse('[]');
                                        $('.mytable-pedido').html('');

                                        fnMostrarPedidos();
                                        fnObtenerDatosCaja();
                                        fnActionNuevo();

                                    },
                                    onError: function (_error) {
                                        $.CloseStatusBar();
                                        $.ShowError({ error: _error });
                                    }
                                });
                            },
                            function () {
                                fnActualizarPeticionesPedido(null, null, null, c_pedido, null);

                                $.AddPetition({
                                    table: 'PDV.PEDIDO_DETALLE',
                                    type: 2,
                                    condition: `C_EMPRESA = '${$.solver.session.SESSION_EMPRESA}' AND C_PEDIDO = '${c_pedido}' AND C_DETALLE = '${search.C_DETALLE}'`,
                                    items: $.ConvertObjectToArr({
                                        C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                                        C_PEDIDO: c_pedido,
                                        C_DETALLE: search.C_DETALLE,
                                        IND_ESTADO: '&',
                                        ANULACION_MOTIVO: textMotivo || '',
                                        C_USUARIO_ANULA: (datausuario == undefined ? $.solver.session.SESSION_ID : datausuario[0].C_USUARIO)
                                    })
                                })

                                $.SendPetition({
                                    onReady: function (result) {

                                        $.CloseStatusBar();
                                        fnMostrarResumen();

                                    },
                                    onBefore: function () {
                                        $.DisplayStatusBar({ message: 'Actualizando pedido' });
                                    },
                                    onError: function (_error) {
                                        $.CloseStatusBar();
                                        $.ShowError({ error: _error });
                                    }
                                });
                            });
                    }
                    else {
                        fnActualizarPeticionesPedido(null, null, null, c_pedido, null);

                        $.AddPetition({
                            table: 'PDV.PEDIDO_DETALLE',
                            type: 2,
                            condition: `C_EMPRESA = '${$.solver.session.SESSION_EMPRESA}' AND C_PEDIDO = '${c_pedido}' AND C_DETALLE = '${search.C_DETALLE}'`,
                            items: $.ConvertObjectToArr({
                                C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                                C_PEDIDO: c_pedido,
                                C_DETALLE: search.C_DETALLE,
                                IND_ESTADO: '&',
                                ANULACION_MOTIVO: textMotivo || '',
                                C_USUARIO_ANULA: (datausuario == undefined ? $.solver.session.SESSION_ID : datausuario[0].C_USUARIO)
                            })
                        })

                        $.SendPetition({
                            onReady: function (result) {

                                $.CloseStatusBar();
                                fnMostrarResumen();

                            },
                            onBefore: function () {
                                $.DisplayStatusBar({ message: 'Actualizando pedido' });
                            },
                            onError: function (_error) {
                                $.CloseStatusBar();
                                $.ShowError({ error: _error });
                            }
                        });
                    }
                };

                // Si el módulo es restaurant y el pedido esta enviado a cocina, valida autorización
                if ($.solver.basePath == '/restaurant' && search.EnviadCocina == '*') {
                    fnAutorizarAccion('AnularProducto', function (datausuario, textMotivo) {
                        eliminarProducto(textMotivo, datausuario);
                    }, 'S', 'Motivo eliminación:');
                } else {
                    eliminarProducto('Eliminado manualmente.');
                };

                e.preventDefault();
            });

            $("button[name=btnAplicarCortesia]").unbind('click');
            $("button[name=btnAplicarCortesia]").click(function () {
                fnAplicarCortesia();
            });

            $("button[name=btnAplicarDescuento]").unbind('click');
            $("button[name=btnAplicarDescuento]").click(function () {
                fnAplicarDescuento();
            });

            $("button[name=btnSepararCuentas]").unbind('click');
            $("button[name=btnSepararCuentas]").click(function () {
                fnDividirCuenta();
            });

        };
        const fnObtenerPedido = function (callback) {

            objPedido = {
                platos: []
            };

            $.GetQuery({
                query: [
                    'q_puntoventa_procesos_puntoventa_obtenerpedido',
                    'q_puntoventa_procesos_puntoventa_obtenerdetallepedido',
                    'q_puntoventa_procesos_puntoventa_obtenerdetallemesas',
                    'q_puntoventa_procesos_puntoventa_obtenerdetallepromo',
                ],
                items: [
                    {
                        C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                        C_PEDIDO: function () {
                            return $('#C_PEDIDO').val()
                        }
                    },
                    {
                        C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                        C_PEDIDO: function () {
                            return $('#C_PEDIDO').val()
                        }
                    },
                    {
                        C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                        C_PEDIDO: function () {
                            return $('#C_PEDIDO').val()
                        }
                    },
                    {
                        C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                        C_PEDIDO: function () {
                            return $('#C_PEDIDO').val()
                        }
                    }
                ],
                onReady: function (result) {
                    var dataPedido = result['q_puntoventa_procesos_puntoventa_obtenerpedido'].result.rows[0];
                    var dataPedidoDetalle = result['q_puntoventa_procesos_puntoventa_obtenerdetallepedido'].result.rows;
                    var dataPedidoMesas = result['q_puntoventa_procesos_puntoventa_obtenerdetallemesas'].result.rows;
                    var dataPedidoDetallePromo = result['q_puntoventa_procesos_puntoventa_obtenerdetallepromo'].result.rows;

                    //cargamos mesas del pedido
                    objMesa = dataPedidoMesas;

                    //cargamos detalle pedido
                    $.each(dataPedidoDetalle, function (PlatoContar, data) {
                        var PlatoContar = objPedido.platos.length + 1;
                        var productosPromo = dataPedidoDetallePromo.filter(x => x.C_DETALLE == data.C_DETALLE)
                        var Plato = {
                            Fila: PlatoContar,
                            IdPedido: '',
                            IdProducto: data.C_PRODUCTO,
                            Nombre: data.NOMBRE_PARA_VENTA + (data.NOTA_2 == '' ? '' : '<br/><span class="text-primary">' + data.NOTA_2 + '</span>') + (data.NOTA == '' ? '' : '<br/><span class="text-danger">&nbsp;' + data.NOTA + '</span>'),
                            NombreCorto: data.NOMBRE_PARA_VENTA,
                            Precio: data.PRECIO,
                            PorcDscto: data.PORC_DSCTO,
                            AfectacionCabecera: data.AFECTACION_IGV_CABECERA,
                            AfectacionCabeceraOriginal: data.AFECTACION_IGV_CABECERA_ORIGINAL,
                            Cantidad: data.CANTIDAD,
                            Afectacion: data.AFECTACION_IGV,
                            TipoProducto: data.C_PARAMETRO_GENERAL_TIPO_PRODUCTO,
                            IdProductoPrecio: data.C_PRODUCTO_PRECIO,
                            C_ALMACEN: data.C_ALMACEN,
                            NOM_ALMACEN: data.NOMBRE_ALMACEN,
                            STOCK: parseFloat(data.STOCK),
                            Estado: data.IND_ESTADO,
                            C_UNIDAD_MEDIDA: data.C_UNIDAD_MEDIDA,
                            C_PRODUCTO_PRECIO: (data.C_PARAMETRO_GENERAL_TIPO_PRODUCTO == '07229' ? null : data.C_PRODUCTO_PRECIO),
                            PrecioOriginal: data.PRECIO_ORIGINAL,
                            AfectacionIgvOriginal: data.AFECTACION_IGV_ORIGINAL,
                            Cortesia: data.CORTESIA,
                            NroComanda: data.C_COMANDA,
                            FechaComanda: data.C_FECHA,
                            Guardado: true,
                            EnviadCocina: data.ENVIADO_COCINA,
                            Nota: data.NOTA,
                            C_DETALLE: data.C_DETALLE,
                            C_COCINA: data.C_COCINA,
                            FechaPedidoDetalle: data.FEC_CREAC,
                            PROMOCION: productosPromo,
                            Nota2: data.NOTA_2
                        };
                        objPedido.platos.push(Plato);
                    });

                    //cargamos informacion del pedido
                    $('#C_PEDIDO').val(dataPedido.C_PEDIDO);
                    $('#NRO_PEDIDO').val(dataPedido.NRO_PEDIDO);
                    $('#observaciones').val(dataPedido.OBSERVACION);
                    $('#nroPedido').html(`NRO PEDIDO ${dataPedido.NRO_PEDIDO}` + fnObtenerNombreMesa());
                    $('#IND_ESTADO').val(dataPedido.IND_ESTADO);
                    $('#PORCENTAJE_DESCUENTO_GLOBAL').val(dataPedido['PORCENTAJE_DESCUENTO_GLOBAL']);
                    $('#COMENTARIO_DESCUENTO_GLOBAL').val(dataPedido['COMENTARIO_DESCUENTO_GLOBAL']);
                    $('#MOTIVO_CORTESIA').val(dataPedido['MOTIVO_CORTESIA']);

                    // Campos de delivery
                    $('#IND_DELIVERY').val(dataPedido['IND_DELIVERY'])
                    $('#C_CLIENTE_DELIVERY').val(dataPedido['C_CLIENTE_DELIVERY'])
                    $('#TIPO_DOCUMENTO_DELIVERY').val(dataPedido['TIPO_DOCUMENTO_DELIVERY'])
                    $('#RUC_DELIVERY').val(dataPedido['RUC_DELIVERY'])
                    $('#NOMBRE_DELIVERY').val(dataPedido['NOMBRE_DELIVERY'])
                    $('#DIRECCION_ENTREGA').val(dataPedido['DIRECCION_ENTREGA'])
                    $('#REFERENCIA_ENTREGA').val(dataPedido['REFERENCIA_ENTREGA'])
                    $('#TELEFONO').val(dataPedido['TELEFONO'])
                    $('#METODO_PAGO_DELIVERY').val(dataPedido['METODO_PAGO_DELIVERY'])
                    $('#TIPO_COMPROBANTE').val(dataPedido['TIPO_COMPROBANTE'])

                    //reiniciar controles
                    fnMostrarResumen();
                    fnValidarBotones();

                    $('#modalVerPedido').modal('hide');

                    if (typeof callback == 'function') {
                        callback();
                        return;
                    };

                }
            });

        };
        /* FUNCIONES PARA RESUMEN */

        /* FUNCIONES DE ACCIONES */
        const fnObtenerNombreMesa = function (mode) {
            var grupo = baulPedidos.find(x => x['C_PEDIDO'] == $('#C_PEDIDO').val())
            if (grupo != undefined) {
                grupo = grupo.NRO_PEDIDO_GRUPO
            }
            let mesasName = "";
            for (var item in objMesa) {
                var dataMesa = objMesa[item];
                if (typeof dataMesa.C_MESA != 'undefined') {
                    if (mesasName.length != 0) mesasName += ',';
                    mesasName += dataMesa['Nombre de Mesa'];
                };
            };

            mesasName += (grupo == '' || grupo == undefined ? '' : '-' + grupo)

            var indexOf = mesasName.indexOf('-');
            if (mode == 'S') return mesasName;
            if (mode == 'G') return mesasName.substring(0, (indexOf == -1 ? mesasName.length : indexOf));
            if (mesasName != '') return ` <br /><span class="color-red">(${mesasName})</span>`;
            return '';
        };
        const fnAplicarCortesia = function () {
            const fnEditorCortesia = function () {

                const tokenCortesia = $.CreateToken();
                let dialogCortesia = bootbox.dialog({
                    title: 'Aplicar cortesia',
                    message: `<div id="${tokenCortesia}"></div>`,
                    className: 'modal-search-60',
                    onEscape: true
                });

                dialogCortesia.init(function () {
                    setTimeout(function () {
                        $(dialogCortesia).find(`#${tokenCortesia}`).html(`
                            <div class="row">
                                <div class="col">
                                    <label class="col-form-label col-form-label-lg">Selecciona los productos que deseas ofrecer como cortesía</label>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col">
                                    <div class="text-danger">Puedes editar la cantidad de la cortesia que deseas aplicar.</div>
                                    <div id="tableCortesia">
                                    </div>
                                </div>
                            </div>
                            <div class="row mt-2">
                                <div class="col">
                                    <textarea class="form-control form-control-lg" maxlength="200" rows="3" id="motivo" placeholder="Motivo de cortesía"></textarea>
                                </div>
                            </div>
                            <div class="row mt-2">
                                <div class="col">
                                    <button type="button" data-dismiss="modal" aria-label="Close" class="btn btn-lg btn-gray float-left"><i class="fa fa-close"></i>&nbsp;Cancelar</button>
                                </div>
                                <div class="col-auto">
                                    <button data-mode="1" type="button" class="btn btn-lg btn-danger float-right btnAplicarCortesia"><i class="fa fa-money" aria-hidden="true"></i>&nbsp;Aplicar y Pagar</button>
                                </div>
                                <div class="col-auto">
                                    <button data-mode="2" type="button" class="btn btn-lg btn-orange float-right btnAplicarCortesia"><i class="fa fa-floppy-o" aria-hidden="true"></i>&nbsp;Aplicar Solo</button>
                                </div>
                            </div>
                        `);
                        $(dialogCortesia).find(`#${tokenCortesia} #tableCortesia`).CreateGrid({
                            query: 'tbl_restaurant_procesos_puntocaja_tblcortesia',
                            hiddens: ['IdDetalle', 'SubTotal'],
                            columns: {
                                '_rowNum': {
                                    text: '#',
                                    width: '30',
                                    cellsAlign: 'center',
                                    cellsalign: 'center',
                                    hidden: false,
                                    pinned: true,
                                    editable: false,
                                    sortable: false
                                },
                                'CantidadOriginal': {
                                    text: 'Cant. Pedido',
                                    width: 120,
                                    cellsAlign: 'center',
                                    editable: false
                                },
                                'Cantidad': {
                                    text: 'Cant. Cortesía',
                                    width: 120,
                                    cellsAlign: 'center',
                                    columnType: 'numberinput',
                                    cellclassname: 'cell-editable',
                                    editable: true,
                                    createeditor: function (row, cellvalue, editor, cellText, width, height) {
                                        editor.jqxNumberInput({
                                            spinButtons: false,
                                            decimalDigits: 0
                                        });
                                    },
                                    validation: function (cell, value) {
                                        const rowId = $(dialogCortesia).find(`#${tokenCortesia} #tableCortesia`).jqxGrid('getrowid', cell.row);
                                        const row = $(dialogCortesia).find(`#${tokenCortesia} #tableCortesia`).jqxGrid('getrows')[rowId];
                                        if (value <= 0 || value > row.CantidadOriginal) {
                                            return { result: false, message: "La cantidad ingresada es incorrecta." };
                                        };
                                        return true;
                                    }
                                },
                                'NombrePlato': {
                                    text: 'Nombre de Producto',
                                    width: 200,
                                    editable: false
                                },
                                'Precio': {
                                    //text: 'Cantidad',
                                    width: 100,
                                    cellsAlign: 'right',
                                    columnType: 'numberinput',
                                    cellsFormat: 'd2',
                                    editable: false
                                },
                                //'SubTotal': {
                                //    text: 'Sub-Total',
                                //    width: 100,
                                //    cellsAlign: 'right',
                                //    columnType: 'numberinput',
                                //    cellsFormat: 'd2',
                                //    editable: false
                                //},
                                'a': {
                                    text: '<i class="fa fa-minus" aria-hidden="true"></i>',
                                    width: 50,
                                    createwidget: function (row, column, value, htmlElement) {
                                        $(dialogCortesia).find(`#${tokenCortesia} #tableCortesia`).jqxGrid('refresh');
                                    },
                                    initwidget: function (rowIndex, column, value, htmlElement) {

                                        $(htmlElement).html('');
                                        $(htmlElement).addClass('jqx-grid-cell-middle-align');
                                        $(htmlElement).css({ 'margin-top': '10px' });

                                        $(htmlElement).html(`<button type="button" class="btn btn-sm btn-success restar" style="width: 30px;">&nbsp;<i class="fa fa-minus" aria-hidden="true"></i>&nbsp;</button>`);

                                        //Acciones (restar)
                                        if ($(htmlElement).find('button.restar').length) {
                                            $(htmlElement).find('button.restar').unbind('click');
                                            $(htmlElement).find('button.restar').click(function () {

                                                const rowId = $(dialogCortesia).find(`#${tokenCortesia} #tableCortesia`).jqxGrid('getrowid', rowIndex);
                                                const row = $(dialogCortesia).find(`#${tokenCortesia} #tableCortesia`).jqxGrid('getrows')[rowId];

                                                var nuevaCantidad = row.Cantidad - 1;
                                                if (nuevaCantidad > 0) {
                                                    row.Cantidad = nuevaCantidad;
                                                    row.SubTotal = row.Precio * (row.CantidadOriginal - row.Cantidad);
                                                    $(dialogCortesia).find(`#${tokenCortesia} #tableCortesia`).jqxGrid('refresh')
                                                    return;
                                                }

                                            });
                                        };

                                    },
                                },
                                'b': {
                                    text: '<i class="fa fa-plus" aria-hidden="true"></i>',
                                    width: 50,
                                    createwidget: function (row, column, value, htmlElement) {
                                        $(dialogCortesia).find(`#${tokenCortesia} #tableCortesia`).jqxGrid('refresh');
                                    },
                                    initwidget: function (rowIndex, column, value, htmlElement) {

                                        $(htmlElement).html('');
                                        $(htmlElement).addClass('jqx-grid-cell-middle-align');
                                        $(htmlElement).css({ 'margin-top': '10px' });

                                        $(htmlElement).html(`<button type="button" class="btn btn-sm btn-success sumar" style="width: 30px;">&nbsp;<i class="fa fa-plus" aria-hidden="true"></i>&nbsp;</button>`);

                                        //Acciones (sumar)
                                        if ($(htmlElement).find('button.sumar').length) {
                                            $(htmlElement).find('button.sumar').unbind('click');
                                            $(htmlElement).find('button.sumar').click(function () {

                                                const rowId = $(dialogCortesia).find(`#${tokenCortesia} #tableCortesia`).jqxGrid('getrowid', rowIndex);
                                                const row = $(dialogCortesia).find(`#${tokenCortesia} #tableCortesia`).jqxGrid('getrows')[rowId];

                                                var nuevaCantidad = row.Cantidad + 1;
                                                var cantidadPedido = row.CantidadOriginal
                                                if (nuevaCantidad <= cantidadPedido) {
                                                    row.Cantidad = nuevaCantidad;
                                                    row.SubTotal = row.Precio * (row.CantidadOriginal - row.Cantidad);
                                                    $(dialogCortesia).find(`#${tokenCortesia} #tableCortesia`).jqxGrid('refresh')
                                                    return;
                                                }
                                            });
                                        };

                                    },
                                }
                            },
                            config: {
                                selectionmode: 'checkbox',
                                virtualmode: false,
                                height: 400,
                                rowsheight: 45,
                                pageSize: 100,
                                pageable: false,
                                sortable: false,
                                editable: true,
                            }
                        });
                        $(dialogCortesia).find(`#${tokenCortesia} #tableCortesia`).on('bindingcomplete', function () {
                            var arrCortesia = [];
                            $.each(objPedido.platos, function (i, plato) {
                                if (plato.Estado == '*') {
                                    var objeto = {
                                        _rowNum: arrCortesia.length + 1,
                                        IdDetalle: plato.C_DETALLE,
                                        NombrePlato: plato.Nombre,
                                        CantidadOriginal: plato.Cantidad,
                                        Cantidad: plato.Cantidad,
                                        Precio: plato.PrecioOriginal,
                                        SubTotal: 0,
                                        Selected: plato.Cortesia,
                                    };
                                    arrCortesia.push(objeto);
                                }
                            });
                            $(dialogCortesia).find(`#${tokenCortesia} #tableCortesia`).jqxGrid('addrow', null, arrCortesia);

                            var _platos = objPedido.platos.filter(x => x.Estado == '*');
                            $.each(_platos, function (i, plato) {
                                if (plato.Cortesia == '*') {
                                    $(dialogCortesia).find(`#${tokenCortesia} #tableCortesia`).jqxGrid('selectrow', i);
                                }
                            });
                            $.each($(dialogCortesia).find(`#${tokenCortesia} #tableCortesia .jqx-checkbox-default`), function (i, v) {
                                $(v).css({ 'margin': '-1px 0 0 1px' })
                                $(v).children().css({ 'width': '20px', 'height': '20px', });
                                $(v).children().children().css({ 'width': '20px', 'height': '20px', });
                            })
                        });
                        $(dialogCortesia).find(`#${tokenCortesia} button.btnAplicarCortesia`).click(function () {
                            if ($.trim($('#motivo').val()) == '') {
                                fnObtenerAlertaWarning('Por favor ingrese el motivo');
                                return;
                            }

                            var modo = $(this).attr('data-mode') || 1;

                            $.GetQuery({
                                query: ['q_restaurant_procesos_puntocaja_obtenerdatoscortesia'],
                                items: [{
                                    C_EMPRESA: $.solver.session.SESSION_EMPRESA
                                }],
                                onReady: function (result) {

                                    var nuevaAfectacion = result[0].C_PARAMETRO_GENERAL_AFECTACION_IGV_CORTESIA; //nueva afectacion
                                    var nuevoMultitplicador = result[0].CODIGO_PARAMETRO_3; //multitplicador
                                    var indexes = $(dialogCortesia).find(`#${tokenCortesia} #tableCortesia`).jqxGrid('getselectedrowindexes'); //datos selecionados;
                                    var newPlatoCortesia = {};

                                    //if (indexes.length == 0) {
                                    //    fnObtenerAlertaWarning('Por favor seleccione los productos a aplicar la cortesía')
                                    //    return;
                                    //}

                                    // Regresamos a la normalidad todos los productos
                                    $.each(objPedido.platos, function (i, plato) {
                                        plato.Cortesia = '&';
                                        plato.AfectacionCabecera = plato.AfectacionCabeceraOriginal;
                                        plato.Afectacion = plato.AfectacionIgvOriginal;
                                    });

                                    $.each(indexes, function (i, index) {

                                        const rowId = $(dialogCortesia).find(`#${tokenCortesia} #tableCortesia`).jqxGrid('getrowid', index);
                                        const row = $(dialogCortesia).find(`#${tokenCortesia} #tableCortesia`).jqxGrid('getrows')[rowId];

                                        const plato = objPedido.platos.find(x => x['C_DETALLE'] == row['IdDetalle']);

                                        // Si la cantidad de cortesia es la misma del producto, se aplica la cortesia a todo el detalle
                                        if (row.Cantidad == plato.Cantidad) {
                                            plato.Cortesia = '*';
                                            plato.AfectacionCabecera = nuevoMultitplicador;
                                            plato.Afectacion = nuevaAfectacion;
                                            plato.Precio = plato.PrecioOriginal;
                                            plato.PorcDscto = 0;
                                        };

                                        // Si la cantidad de cortesia no es la misma del producto, se crea un nuevo detalle y se resta la cantidad al original
                                        if (row.Cantidad < objPedido.platos[index].Cantidad) {
                                            var promociones = [];
                                            for (var i = 0; i < plato.PROMOCION.length; i++) {
                                                var newDetallePromo = JSON.parse(JSON.stringify(plato.PROMOCION[i]));
                                                newDetallePromo.C_DETALLE = '';
                                                newDetallePromo.C_DETALLE_PROMO = '';
                                                promociones.push(newDetallePromo);
                                            }

                                            newPlatoCortesia = JSON.parse(JSON.stringify(plato));
                                            newPlatoCortesia.Cortesia = '*';
                                            newPlatoCortesia.AfectacionCabecera = nuevoMultitplicador;
                                            newPlatoCortesia.Afectacion = nuevaAfectacion;
                                            newPlatoCortesia.Cantidad = row.Cantidad;
                                            newPlatoCortesia.Guardado = false;
                                            newPlatoCortesia.C_DETALLE = ''
                                            newPlatoCortesia.PROMOCION = promociones

                                            plato.Cantidad = plato.Cantidad - row.Cantidad;
                                            objPedido.platos.push(newPlatoCortesia);
                                        };

                                    });

                                    $('#MOTIVO_CORTESIA').val($('#motivo').val());

                                    fnActionGuardar(null, function () {
                                        fnMostrarResumen();
                                        if (modo == 1) fnActionDetallado();
                                        $(dialogCortesia).modal('hide');
                                    });

                                }
                            });
                        });
                        $('#motivo').val($('#MOTIVO_CORTESIA').val());
                    }, 150)
                });

                $('.bootbox .modal-dialog').draggable({
                    handle: '.modal-header'
                });
                $('.bootbox .modal-header').css('cursor', 'move');

                buttonState = false;
            };

            fnAutorizarAccion('AplicarCortesia', function (datausuario) {
                fnEditorCortesia();
            });
        };
        const fnAplicarDescuento = function () {

            const fnGuardarDescuento = function () {

                const tokenDescuento = $.CreateToken();
                let dialogDescuento = bootbox.dialog({
                    title: 'Aplicar descuento',
                    message: `<div id="${tokenDescuento}"></div>`,
                    className: 'modal-search-60',
                    onEscape: true
                });

                dialogDescuento.init(function () {
                    setTimeout(function () {

                        $(dialogDescuento).find(`#${tokenDescuento}`).html(`
                            <div class="row">
                                <div class="col">
                                    <label class="col-form-label col-form-label-lg">Selecciona los productos que deseas aplicar descuento</label>
                                </div>
                            </div>
                            <div id="tableDescuento"></div>
                            <form name="frmDescuento" autocomplete="off">
                                <div class="text-danger">Seleccione el porcentaje de descuento o ingresa el monto manualmente.</div>
                                <div class="row">
                                    <div class="col-auto">
                                        <label class="col-form-label col-form-label-lg">Seleccione: </label>
                                    </div>
                                    <div class="col">
                                        <select id="txtDescuentoPorItem_Select" class="form-control form-control-lg">
                                            <option value="0" selected>Sin descuento</option>
                                            <option value="5">5%</option>
                                            <option value="10">10%</option>
                                            <option value="25">25%</option>
                                            <option value="30">30%</option>
                                            <option value="50">50%</option>
                                            <option value="P">Por Monto</option>
                                            <option value="%">Otro Porcentaje</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="row mt-2">
                                    <div class="col-auto">
                                        <label class="col-form-label col-form-label-lg">Porc. Descuento</label>
                                    </div>
                                    <div class="col-3">
                                        <input class="form-control form-control-lg" type="text" id="txtDescuentoPorItem" name="txtDescuentoPorItem" value="0" readonly />
                                    </div>
                                </div>
                                <div class="row mt-2">
                                    <div class="col">
                                        <textarea class="form-control form-control-lg" rows="3" maxlength="200" name="comentarios" placeholder="Motivo del descuento" required></textarea>
                                    </div>
                                </div>
                                <div class="row mt-2">
                                    <div class="col">
                                        <button type="button" data-dismiss="modal" aria-label="Close" class="btn btn-lg btn-gray float-left"><i class="fa fa-close"></i>&nbsp;Cancelar</button>
                                    </div>
                                    <div class="col-auto">
                                        <button data-mode="1" type="button" class="btn btn-lg btn-danger float-right btnAplicarDscto"><i class="fa fa-money" aria-hidden="true"></i>&nbsp;Aplicar y Pagar</button>
                                    </div>
                                    <div class="col-auto">
                                        <button data-mode="2" type="button" class="btn btn-lg btn-danger float-right btnAplicarDscto"><i class="fa fa-floppy-o" aria-hidden="true"></i>&nbsp;Aplicar Solo</button>
                                    </div>
                                </div>
                                
                            </form>
                        `);

                        $(dialogDescuento).find(`#${tokenDescuento} form[name=frmDescuento]`).ValidForm({
                            type: -1,
                            onDone: function (_, controls) {

                                $(dialogDescuento).find(`#${tokenDescuento} #tableDescuento`).CreateGrid({
                                    query: 'tbl_restaurant_procesos_puntocaja_tblcortesia',
                                    hiddens: ['IdDetalle', 'SubTotal', 'Cantidad'],
                                    columns: {
                                        '_rowNum': {
                                            text: '#',
                                            width: '30',
                                            cellsAlign: 'center',
                                            cellsalign: 'center',
                                            hidden: false,
                                            pinned: true,
                                            editable: false,
                                            sortable: false
                                        },
                                        'CantidadOriginal': {
                                            text: 'Cant. Pedido',
                                            width: 120,
                                            cellsAlign: 'center',
                                            editable: false
                                        },
                                        //'Cantidad': {
                                        //    text: 'Porc. Descuento',
                                        //    width: 120,
                                        //    cellsAlign: 'center',
                                        //    columnType: 'numberinput',
                                        //    cellclassname: 'cell-editable',
                                        //    editable: true,
                                        //    createeditor: function (row, cellvalue, editor, cellText, width, height) {
                                        //        editor.jqxNumberInput({
                                        //            spinButtons: false,
                                        //            decimalDigits: 0
                                        //        });
                                        //    },
                                        //    validation: function (cell, value) {
                                        //        const rowId = $(dialogDescuento).find(`#${tokenDescuento} #tableDescuento`).jqxGrid('getrowid', cell.row);
                                        //        const row = $(dialogDescuento).find(`#${tokenDescuento} #tableDescuento`).jqxGrid('getrows')[rowId];
                                        //        if (value < 0 || value >= 100) {
                                        //            return { result: false, message: "La cantidad ingresada es incorrecta. (0-100)" };
                                        //        };
                                        //        return true;
                                        //    }
                                        //},
                                        'NombrePlato': {
                                            text: 'Nombre de Producto',
                                            width: 200,
                                            editable: false
                                        },
                                        'Precio': {
                                            width: 100,
                                            cellsAlign: 'right',
                                            columnType: 'numberinput',
                                            cellsFormat: 'd2',
                                            editable: false
                                        }
                                    },
                                    config: {
                                        selectionmode: 'checkbox',
                                        virtualmode: false,
                                        height: 400,
                                        rowsheight: 45,
                                        pageSize: 100,
                                        pageable: false,
                                        sortable: false,
                                        editable: true,
                                    }
                                })
                                $(dialogDescuento).find(`#${tokenDescuento} #tableDescuento`).on('bindingcomplete', function () {

                                    var arrDescuento = [];

                                    $.each(objPedido.platos, function (i, plato) {
                                        if (plato.Estado == '*' && plato.Cortesia == '&') {
                                            var objeto = {
                                                _rowNum: arrDescuento.length + 1,
                                                IdDetalle: plato.C_DETALLE,
                                                NombrePlato: plato.Nombre,
                                                CantidadOriginal: plato.Cantidad,
                                                Cantidad: plato.PorcDscto == null ? 0 : plato.PorcDscto,
                                                Precio: plato.PrecioOriginal,
                                                SubTotal: 0,
                                                Selected: '&',
                                            };
                                            arrDescuento.push(objeto);
                                        }
                                    });
                                    $(dialogDescuento).find(`#${tokenDescuento} #tableDescuento`).jqxGrid('addrow', null, arrDescuento);
                                    var _platos = objPedido.platos.filter(x => x.Estado == '*');
                                    $.each(_platos, function (i, plato) {
                                        if ((plato.PorcDscto == null ? 0 : plato.PorcDscto) != 0) {
                                            $(dialogDescuento).find(`#${tokenDescuento} #tableDescuento`).jqxGrid('selectrow', i);
                                        }
                                    });
                                    $.each($(dialogDescuento).find(`#${tokenDescuento} #tableDescuento .jqx-checkbox-default`), function (i, v) {
                                        $(v).css({ 'margin': '-1px 0 0 1px' })
                                        $(v).children().css({ 'width': '20px', 'height': '20px', });
                                        $(v).children().children().css({ 'width': '20px', 'height': '20px', });
                                    });

                                });
                                $(dialogDescuento).find(`#${tokenDescuento} #tableDescuento`).on('rowselect', function () {
                                    if ($(dialogDescuento).find('#txtDescuentoPorItem_Select').val() == 'P') {
                                        $('#txtDescuentoPorItem').val(0);
                                    }
                                });
                                $(dialogDescuento).find(`#${tokenDescuento} #tableDescuento`).on('rowunselect', function () {
                                    if ($(dialogDescuento).find('#txtDescuentoPorItem_Select').val() == 'P') {
                                        $('#txtDescuentoPorItem').val(0);
                                    }
                                });

                                var descuento = $('#PORCENTAJE_DESCUENTO_GLOBAL').val();
                                $('#txtDescuentoPorItem').val(descuento == '' ? 0 : descuento);
                                $('#txtDescuentoPorItem_Select').val(descuento == '' ? 0 : descuento);

                                if ($('#txtDescuentoPorItem_Select').val() == null) {
                                    $('#txtDescuentoPorItem_Select').val('%');
                                };

                                $(controls.comentarios).val($('#COMENTARIO_DESCUENTO_GLOBAL').val());

                                //$('#txtDescuentoPorItem').inputmask("9999.99", { "placeholder": "####.##" });

                                $(dialogDescuento).find('#txtDescuentoPorItem_Select').change(function () {
                                    if ($(this).val() == '%') {

                                        bootbox.prompt({
                                            title: "Ingrese porcentaje descuento (Maximo hasta 60%)",
                                            inputType: 'number',
                                            callback: function (result) {

                                                if (result > 60) {
                                                    fnObtenerAlertaWarning('El porcentaje ingresado no debe ser mayor a 60%.')
                                                    return;
                                                };

                                                //var percent = result / 100;
                                                $('#txtDescuentoPorItem').val(result);

                                            }
                                        });

                                    }
                                    else if ($(this).val() == 'P') {

                                        bootbox.prompt({
                                            title: "Ingrese monto de descuento",
                                            //inputType: 'number',
                                            callback: function (result) {
                                                if (result != null) {
                                                    if (!(!isNaN(parseFloat(result)) && isFinite(result))) {
                                                        return false;
                                                    }

                                                    var totalventa = 0;
                                                    var percent = 0;
                                                    //var platos = objPedido.platos.filter(x => x.Estado == '*');
                                                    var platos = [];
                                                    var indexes = $(dialogDescuento).find(`#${tokenDescuento} #tableDescuento`).jqxGrid('getselectedrowindexes');
                                                    $.each(indexes, function (i, index) {
                                                        const rowId = $(dialogDescuento).find(`#${tokenDescuento} #tableDescuento`).jqxGrid('getrowid', index);
                                                        const row = $(dialogDescuento).find(`#${tokenDescuento} #tableDescuento`).jqxGrid('getrows')[rowId];
                                                        const plato = objPedido.platos.find(x => x['C_DETALLE'] == row['IdDetalle']);
                                                        platos.push(plato);
                                                    });

                                                    $.each(platos, function (i, plato) {
                                                        totalventa += plato.PrecioOriginal * plato.Cantidad;
                                                    });

                                                    percent = result / totalventa;

                                                    //if ((percent * 100) > 60) {
                                                    //    fnObtenerAlertaWarning('El porcentaje ingresado no debe ser mayor a 60%.')
                                                    //    return;
                                                    //};

                                                    $('#txtDescuentoPorItem').val(parseFloat(percent * 100).toFixed(10));
                                                }

                                            }
                                        });

                                    } else {
                                        $('#txtDescuentoPorItem').val($(this).val());
                                    }
                                });

                                $(dialogDescuento).find(`button.btnAplicarDscto`).click(function () {

                                    var modo = $(this).attr('data-mode') || 1;
                                    var porcDscto = $('#txtDescuentoPorItem').val();

                                    if ($(controls.comentarios).val() == '' && porcDscto != 0) {
                                        fnObtenerAlertaWarning('Por favor ingrese el motivo del descuento')
                                        return;
                                    };

                                    $('#PORCENTAJE_DESCUENTO_GLOBAL').val(porcDscto);
                                    $('#COMENTARIO_DESCUENTO_GLOBAL').val($(controls.comentarios).val());

                                    var descuento = porcDscto == '' ? 0 : parseFloat(porcDscto) || 0;

                                    var platos = objPedido.platos.filter(x => x.Estado == '*');
                                    $.each(platos, function (i, plato) {
                                        plato.Precio = plato.PrecioOriginal;
                                        plato.PorcDscto = 0;
                                    });

                                    var indexes = $(dialogDescuento).find(`#${tokenDescuento} #tableDescuento`).jqxGrid('getselectedrowindexes');
                                    if (indexes.length == 0) {
                                        fnObtenerAlertaWarning('Por favor seleccione los productos a aplicar el descuento')
                                        return;
                                    }
                                    $.each(indexes, function (i, index) {

                                        const rowId = $(dialogDescuento).find(`#${tokenDescuento} #tableDescuento`).jqxGrid('getrowid', index);
                                        const row = $(dialogDescuento).find(`#${tokenDescuento} #tableDescuento`).jqxGrid('getrows')[rowId];

                                        if (descuento != 0) {

                                            const plato = objPedido.platos.find(x => x['C_DETALLE'] == row['IdDetalle']);

                                            var descuentoLinea = parseFloat(descuento / 100);
                                            var precioOriginal = parseFloat(plato.PrecioOriginal);
                                            var precioDescuento = precioOriginal * descuentoLinea;
                                            var nuevoPrecio = precioOriginal - precioDescuento;

                                            //nuevoPrecio = parseFloat(nuevoPrecio);
                                            plato.Precio = parseFloat(numeral(nuevoPrecio).format('0.000'));
                                            plato.PorcDscto = descuento;

                                        }

                                    });

                                    fnActionGuardar(null, function () {

                                        fnMostrarResumen();
                                        fnObtenerDatosCaja();

                                        if (modo == 1) fnActionDetallado();
                                        $(dialogDescuento).modal('hide');

                                    });

                                });

                            },
                            onReady: function (_, controls) {

                            }
                        });

                    }, 150)
                });

                $('.bootbox .modal-dialog').draggable({
                    handle: '.modal-header'
                });
                $('.bootbox .modal-header').css('cursor', 'move');

                buttonState = false;
            };

            fnAutorizarAccion('AplicarDescuento', function (datausuario) {
                fnGuardarDescuento();
            });

        };
        const fnDividirCuenta = function () {

            const tokenDividirCuenta = $.CreateToken();
            const fnActualizarCodRefs = function (c_usuario, callback) {
                //llamamos a servicio
                const objectPedido = {
                    script: 'spw_puntoventa_procesos_puntoventa_actualizar_grupopedido',
                    empresa: $.solver.session.SESSION_EMPRESA,
                    pedido: function () {
                        return $('#C_PEDIDO').val();
                    },
                    c_usuario: c_usuario
                };
                $.AddPetition({
                    type: 4,
                    items: $.ConvertObjectToArr(objectPedido),
                    transaction: true
                });
                $.SendPetition({
                    onReady: function () {
                        if (typeof callback == 'function') {
                            callback();
                        };
                    },
                    onError: function (_error) {
                        $.CloseStatusBar();
                        $.ShowError({ error: _error });
                    }
                });
            };

            let dialogCortesia = bootbox.dialog({
                title: 'Dividir Pedido',
                message: `<div id="${tokenDividirCuenta}"></div>`,
                className: 'modal-search-60',
                onEscape: true
            });

            dialogCortesia.init(function () {
                setTimeout(function () {

                    var htmlSeleccionarMozo = `
                        <div class="col-4 text-right">
                            <label class="col-form-label col-form-label-lg">Seleccione mozo</label>
                        </div>
                        <div class="col">
                            <div class="form-group-rm">
                                <select
                                    name="MESERO" class="form-control form-control-lg"
                                    data-query="q_puntoventa_procesos_obtener_mozos" data-value="SESSION_ID" data-field="SESSION_NOMBRE"
                                    data-empresa="${$.solver.session.SESSION_EMPRESA}" required></select>
                            </div>
                        </div>
                    `;

                    // Si el módulo es puntoventa, no se muestra
                    if ($.solver.basePath == '/puntoventa') htmlSeleccionarMozo = '<div class="col"></div>';

                    $(dialogCortesia).find(`#${tokenDividirCuenta}`).html(`
                        <div class="row">
                            <div class="col">
                                <div class="form-group-rm">
                                    <label class="col-form-label col-form-label-lg">Selecciona los productos que pasaran a otra cuenta</label>
                                </div>
                            </div>
                        </div>
                        <div class="row mt-2">
                            <div class="col">
                                <div id="tableDividir">
                                </div>
                            </div>
                        </div>
                        <div class="row mt-2">
                            <div class="col-auto">
                                <button type="button" data-dismiss="modal" aria-label="Close" class="btn btn-lg btn-gray float-left"><i class="fa fa-close"></i>&nbsp;Cancelar</button>
                            </div>
                            ${htmlSeleccionarMozo}
                            <div class="col-auto">
                                <button type="button" id="btnAplicarDivision" class="btn btn-lg btn-danger float-right"><i class="fa fa-floppy-o" aria-hidden="true"></i>&nbsp;Dividir Cuenta</button>
                            </div>
                        </div>
                    `);
                    $(dialogCortesia).find(`#${tokenDividirCuenta} #tableDividir`).CreateGrid({
                        query: 'tbl_restaurant_procesos_puntocaja_tblcortesia',
                        hiddens: ['IdDetalle', 'SubTotal'],
                        columns: {
                            '_rowNum': {
                                text: '#',
                                width: '30',
                                cellsAlign: 'center',
                                cellsalign: 'center',
                                hidden: false,
                                pinned: true,
                                editable: false,
                                sortable: false
                            },
                            'CantidadOriginal': {
                                text: 'Cant. Pedido',
                                width: 120,
                                cellsAlign: 'center',
                                cellsFormat: 'd',
                                editable: false
                            },
                            'Cantidad': {
                                text: 'Cant. Div.',
                                width: 120,
                                cellsAlign: 'center',
                                cellclassname: 'cell-editable',
                                columnType: 'numberinput',
                                editable: true,
                                createeditor: function (row, cellvalue, editor, cellText, width, height) {
                                    editor.jqxNumberInput({
                                        spinButtons: false,
                                        decimalDigits: 0
                                    });
                                },
                                validation: function (cell, value) {
                                    const rowId = $(dialogCortesia).find(`#${tokenDividirCuenta} #tableDividir`).jqxGrid('getrowid', cell.row);
                                    const row = $(dialogCortesia).find(`#${tokenDividirCuenta} #tableDividir`).jqxGrid('getrows')[rowId];

                                    if (value <= 0 || value > row.CantidadOriginal) {
                                        return { result: false, message: "La cantidad ingresada es incorrecta." };
                                    };

                                    return true;
                                }
                            },
                            'NombrePlato': {
                                text: 'Nombre de Producto',
                                width: 200,
                                editable: false,
                            },
                            'Precio': {
                                //text: 'Cantidad',
                                width: 100,
                                cellsAlign: 'right',
                                columnType: 'numberinput',
                                cellsFormat: 'd2',
                                editable: false,
                            },
                            //'SubTotal': {
                            //    text: 'Sub-Total',
                            //    width: 100,
                            //    cellsAlign: 'right',
                            //    columnType: 'numberinput',
                            //    cellsFormat: 'd2',
                            //    editable: false,
                            //},
                            'a': {
                                text: '<i class="fa fa-minus" aria-hidden="true"></i>',
                                width: 50,
                                createwidget: function (row, column, value, htmlElement) {
                                    $(dialogCortesia).find(`#${tokenDividirCuenta} #tableDividir`).jqxGrid('refresh');
                                },
                                initwidget: function (rowIndex, column, value, htmlElement) {

                                    $(htmlElement).html('');
                                    $(htmlElement).addClass('jqx-grid-cell-middle-align');
                                    $(htmlElement).css({ 'margin-top': '10px' });

                                    $(htmlElement).html(`<button type="button" class="btn btn-sm btn-success restar" style="width: 30px;">&nbsp;<i class="fa fa-minus" aria-hidden="true"></i>&nbsp;</button>`);

                                    //Acciones (restar)
                                    if ($(htmlElement).find('button.restar').length) {
                                        $(htmlElement).find('button.restar').unbind('click');
                                        $(htmlElement).find('button.restar').click(function () {

                                            const rowId = $(dialogCortesia).find(`#${tokenDividirCuenta} #tableDividir`).jqxGrid('getrowid', rowIndex);
                                            const row = $(dialogCortesia).find(`#${tokenDividirCuenta} #tableDividir`).jqxGrid('getrows')[rowId];

                                            var nuevaCantidad = row.Cantidad - 1;
                                            if (nuevaCantidad > 0) {
                                                row.Cantidad = nuevaCantidad;
                                                row.SubTotal = row.Precio * (row.CantidadOriginal - row.Cantidad);
                                                $(dialogCortesia).find(`#${tokenDividirCuenta} #tableDividir`).jqxGrid('refresh')
                                                return;
                                            }

                                        });
                                    };

                                },
                            },
                            'b': {
                                text: '<i class="fa fa-plus" aria-hidden="true"></i>',
                                width: 50,
                                createwidget: function (row, column, value, htmlElement) {
                                    $(dialogCortesia).find(`#${tokenDividirCuenta} #tableDividir`).jqxGrid('refresh');
                                },
                                initwidget: function (rowIndex, column, value, htmlElement) {

                                    $(htmlElement).html('');
                                    $(htmlElement).addClass('jqx-grid-cell-middle-align');
                                    $(htmlElement).css({ 'margin-top': '10px' });

                                    $(htmlElement).html(`<button type="button" class="btn btn-sm btn-success sumar" style="width: 30px;">&nbsp;<i class="fa fa-plus" aria-hidden="true"></i>&nbsp;</button>`);

                                    //Acciones (sumar)
                                    if ($(htmlElement).find('button.sumar').length) {
                                        $(htmlElement).find('button.sumar').unbind('click');
                                        $(htmlElement).find('button.sumar').click(function () {

                                            const rowId = $(dialogCortesia).find(`#${tokenDividirCuenta} #tableDividir`).jqxGrid('getrowid', rowIndex);
                                            const row = $(dialogCortesia).find(`#${tokenDividirCuenta} #tableDividir`).jqxGrid('getrows')[rowId];

                                            var nuevaCantidad = row.Cantidad + 1;
                                            var cantidadPedido = row.CantidadOriginal
                                            if (nuevaCantidad <= cantidadPedido) {
                                                row.Cantidad = nuevaCantidad;
                                                row.SubTotal = row.Precio * (row.CantidadOriginal - row.Cantidad);
                                                $(dialogCortesia).find(`#${tokenDividirCuenta} #tableDividir`).jqxGrid('refresh')
                                                return;
                                            }
                                        });
                                    };

                                },
                            }
                        },
                        config: {
                            selectionmode: 'checkbox',
                            virtualmode: false,
                            height: 400,
                            rowsheight: 45,
                            pageSize: 100,
                            pageable: false,
                            sortable: false,
                            editable: true,
                        }
                    });
                    $(dialogCortesia).find(`#${tokenDividirCuenta} #tableDividir`).on('bindingcomplete', function () {
                        var arrCortesia = [];
                        $.each(objPedido.platos, function (i, plato) {
                            if (plato.Estado == '*') {
                                var objeto = {
                                    _rowNum: arrCortesia.length + 1,
                                    IdDetalle: plato.C_DETALLE,
                                    NombrePlato: plato.Nombre,
                                    CantidadOriginal: plato.Cantidad,
                                    Cantidad: plato.Cantidad,
                                    Precio: plato.PrecioOriginal,
                                    SubTotal: 0,
                                    Selected: plato.Cortesia
                                }
                                arrCortesia.push(objeto);
                            }
                        });
                        $(dialogCortesia).find(`#${tokenDividirCuenta} #tableDividir`).jqxGrid('addrow', null, arrCortesia);

                        $.each($(dialogCortesia).find(`#${tokenDividirCuenta} #tableDividir .jqx-checkbox-default`), function (i, v) {
                            $(v).css({ 'margin': '-1px 0 0 1px' })
                            $(v).children().css({ 'width': '20px', 'height': '20px', });
                            $(v).children().children().css({ 'width': '20px', 'height': '20px', });
                        })
                    });
                    $(dialogCortesia).find(`#${tokenDividirCuenta} #btnAplicarDivision`).click(function () {
                        var indexes = $(dialogCortesia).find(`#${tokenDividirCuenta} #tableDividir`).jqxGrid('getselectedrowindexes') //datos selecionados;
                        var new_platos = [];
                        var total_platos = objPedido.platos.filter(x => x.Estado == '*').length;

                        $.each(indexes, function (i, index) {

                            var cantidad = $(dialogCortesia).find(`#${tokenDividirCuenta} #tableDividir`).jqxGrid('getrows')[index]['Cantidad'];
                            var idDetalle = $(dialogCortesia).find(`#${tokenDividirCuenta} #tableDividir`).jqxGrid('getrows')[index]['IdDetalle'];

                            var plato = objPedido.platos.find(x => x['C_DETALLE'] == idDetalle);
                            var indexPlato = objPedido.platos.findIndex(x => x['C_DETALLE'] == idDetalle);

                            //var plato = objPedido.platos[index];

                            if (cantidad != undefined) {

                                var cantidadOriginal = plato['Cantidad'];
                                var diferencia = cantidadOriginal - cantidad;
                                plato.Cantidad = diferencia;

                                // Limpiamos las promociones
                                var promociones = [];
                                for (var i = 0; i < plato.PROMOCION.length; i++) {
                                    var newDetallePromo = JSON.parse(JSON.stringify(plato.PROMOCION[i]));
                                    newDetallePromo.C_DETALLE = '';
                                    newDetallePromo.C_DETALLE_PROMO = '';
                                    promociones.push(newDetallePromo);
                                }

                                var new_plato = {}
                                new_plato = JSON.parse(JSON.stringify(plato));
                                new_plato.Cantidad = cantidad;
                                new_plato.C_DETALLE = '';
                                new_plato.PROMOCION = promociones

                                new_platos.push(JSON.parse(JSON.stringify(new_plato)));

                                if (diferencia == 0) {
                                    objPedido.platos[indexPlato].Estado = '&'
                                    total_platos--;
                                }
                            }
                        });

                        if (new_platos.length == 0) {
                            fnObtenerAlertaError('Selecciona tus productos para dividir cuenta.');
                        }
                        else {
                            if (total_platos == 0) {
                                fnObtenerAlertaError('No puedes retirar todos los productos.');
                            }
                            else {
                                //guardamos pedido actual con los cambios
                                fnActionGuardar(null, function () {

                                    $('#C_PEDIDO').val('');

                                    //guardamos nuevo pedido
                                    objPedido.platos = new_platos;
                                    fnActionGuardar(null, function () {

                                        fnMostrarResumen();

                                        fnActualizarCodRefs(null, function () {

                                            let mesero = $.solver.session.SESSION_ID;
                                            if ($.solver.basePath == '/restaurant') mesero = $(dialogCortesia).find(`#${tokenDividirCuenta} select[name=MESERO]`).val();
                                            if (mesero == '' || mesero == undefined || mesero == null) mesero = $.solver.session.SESSION_ID

                                            fnAplicarCambioMesero(mesero, $('#C_PEDIDO').val(), function () {

                                                baulPedidos = JSON.parse('[]');
                                                $('.mytable-pedido').html('');
                                                fnMostrarPedidos();

                                                fnObtenerAlertaOk('Pedido dividido satisfactoriamente.');

                                            });

                                        });

                                        $(dialogCortesia).modal('hide');

                                    });

                                });

                            }
                        };

                    });
                    $(dialogCortesia).find(`#${tokenDividirCuenta} select[name=MESERO]`).FieldLoadRemote({
                        onReady: function () {
                            const c_mesero = $($('.mytable-pedido').find('.border-danger')[0]).find('.mesero').text();
                            $(dialogCortesia).find(`#${tokenDividirCuenta} select[name=MESERO]`).val(c_mesero).trigger('change');
                        }
                    });

                }, 150)
            });

            $('.bootbox .modal-dialog').draggable({
                handle: '.modal-header'
            });
            $('.bootbox .modal-header').css('cursor', 'move');

            buttonState = false;

        };
        const fnAutorizarAccion = function (flag, callback, flagMotivo, textFlagMotivo) {

            var tokenLogin = $.CreateToken();
            let dialogLogin = bootbox.dialog({
                title: 'Autorización de Usuarios',
                message: `<div id="${tokenLogin}"></div>`,
                className: 'modal-search-40',
                onEscape: true,
                centerVertical: true
            });

            dialogLogin.init(function () {
                setTimeout(function () {

                    // Agregamos html inicial ${tokenLogin}
                    let _html = $('#zoneAutorizacion').html();
                    _html = _html.replace("{empresa}", $.solver.session.SESSION_EMPRESA);
                    $(dialogLogin).find(`#${tokenLogin}`).html(_html);

                    // declaramos variables
                    let _controls = null;
                    const form = $(dialogLogin).find(`form[name=my_form]`);
                    let dataTipoAnulacion = null;
                    let textMotivo = textFlagMotivo || 'Motivo de Autorización:';
                    let nFlagMotivo = flagMotivo || 'N';

                    //para mostrar input de motivo autorizacion
                    if (nFlagMotivo == 'S') {
                        $(dialogLogin).find('.editer-motivo').removeClass('d-none');
                        $(dialogLogin).find('.editer-motivo-text').html(textMotivo);
                        $(dialogLogin).find('textarea[name=motivo_autorizacion]').attr('required', 'required');
                    };

                    form.ValidForm({
                        type: -1,
                        onDone: function (xform, controls) {
                            _controls = controls;
                            $(controls.CLAVE).focus();
                        },
                        onReady: function () {
                            $.GetQuery({
                                query: ['q_puntoventa_validar_usuario'],
                                items: [{
                                    C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                                    C_USUARIO: function () {
                                        return $(_controls.USUARIO).val()
                                    },
                                    CLAVE: function () {
                                        return $(_controls.CLAVE).val()
                                    }
                                }],
                                onReady: function (result) {

                                    if (result.length == 0) {
                                        fnObtenerAlertaWarning('Usuario o contraseña incorrecta')
                                    } else {
                                        if (typeof callback == 'function') {
                                            let motivoAutorizacion = $(_controls.motivo_autorizacion).val() || '';
                                            callback(result, motivoAutorizacion);
                                        };
                                        $(dialogLogin).modal('hide');
                                    };

                                }
                            })
                        },
                        onError: function (error) {
                            $.CloseStatusBar();
                            $.ShowError({ error });
                        }
                    });

                });
            });

            $('.bootbox .modal-dialog').draggable({
                handle: '.modal-header'
            });
            $('.bootbox .modal-header').css('cursor', 'move');

            dialogLogin.on('hide.bs.modal', function () { buttonState = false; });

        };
        const fnSeleccionarMesero = function (flag, callback) {
            var tokenLogin = $.CreateToken();
            let dialogLogin = bootbox.dialog({
                title: 'Cambiar de mesero',
                message: `<div id="${tokenLogin}"></div>`,
                className: 'modal-search-40',
                onEscape: true,
                centerVertical: true
            });

            dialogLogin.init(function () {
                setTimeout(function () {

                    // Agregamos html inicial ${tokenLogin}
                    let _html = $('#zoneCambiarMesero').html();
                    _html = _html.replace("{empresa}", $.solver.session.SESSION_EMPRESA);
                    $(dialogLogin).find(`#${tokenLogin}`).html(_html);

                    // declaramos variables
                    let _controls = null;
                    const form = $(dialogLogin).find(`form[name=my_form]`);

                    form.ValidForm({
                        type: -1,
                        onDone: function (xform, controls) {
                            _controls = controls;
                        },
                        onReady: function () {
                            if (typeof callback == 'function') {
                                callback($(_controls.USUARIO).val());
                            };
                            $(dialogLogin).modal('hide');
                        },
                        onError: function (error) {
                            $.CloseStatusBar();
                            $.ShowError({ error });
                        }
                    });

                });
            });

            $('.bootbox .modal-dialog').draggable({
                handle: '.modal-header'
            });
            $('.bootbox .modal-header').css('cursor', 'move');

            dialogLogin.on('hide.bs.modal', function () { buttonState = false; });
        }
        const fnUnirCuenta = function () {

            var c_pedidos = '';
            var count_pedidos = 0;

            //obtenemos pedidos y validamos
            $('.mytable-pedido').find('input.check-pedido:checked').each(function () {
                if (c_pedidos.length != 0) c_pedidos += ';';
                c_pedidos += $(this).attr('data-ref');
                count_pedidos++;
            });

            if (c_pedidos == '') {
                fnObtenerAlertaWarning('Debes seleccionar los pedidos que deseas unir.')
                return;
            };
            if (count_pedidos == 1) {
                fnObtenerAlertaWarning('Debes seleccionar mas de un pedido para unir.')
                return;
            };

            var fnAplicaUnionCuenta = function () {
                //llamamos a servicio
                const objectPedido = {
                    script: 'spw_puntoventa_procesos_puntoventa_unirpedidos_2',
                    C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                    C_PEDIDOS: c_pedidos,
                    C_USUARIO: $.solver.session.SESSION_ID
                };
                $.AddPetition({
                    type: 4,
                    items: $.ConvertObjectToArr(objectPedido),
                    transaction: true
                });
                $.SendPetition({
                    onBefore: function () {
                        $.DisplayStatusBar({ message: 'Uniendo pedidos ...' });
                    },
                    onReady: function () {

                        baulPedidos = JSON.parse('[]');
                        $('.mytable-pedido').html('');

                        fnMostrarPedidos();
                        fnActionNuevo();

                        $.CloseStatusBar();
                        fnObtenerAlertaOk('Pedidos unidos satisfactoriamente.');

                    },
                    onError: function (_error) {
                        $.CloseStatusBar();
                        $.ShowError({ error: _error });
                    }
                });
            };

            fnAutorizarAccion('UnirCuentas', function (datausuario) {
                fnAplicaUnionCuenta();
            });

        };
        const fnEnviarPedido = function (callback) {

            //creamos nueva comanda, si hay productos sin comanda
            let tokenComanda = 'peticion_nro_comanda'; //para control restaurant
            $.AddPetition({
                token: tokenComanda,
                type: 1,
                table: 'rest.COMANDA',
                items: $.ConvertObjectToArr(
                    {
                        C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                        C_FECHA: '',
                        C_COMANDA: ''
                    },
                    {
                        C_FECHA: {
                            action: {
                                name: 'GetQueryId',
                                args: $.ConvertObjectToArr({
                                    script: 'gbl_obtener_fecha_server',
                                    column: 'FECHA_FORMATO'
                                })
                            }
                        },
                        C_COMANDA: {
                            action: {
                                name: 'GetNextId',
                                args: $.ConvertObjectToArr({
                                    columns: 'C_EMPRESA,C_FECHA',
                                    max_length: 4
                                })
                            }
                        },
                    })
            });

            //creamos peticion para enviar pedidos a zona de preparacion
            const objectPedido = {
                script: 'spw_puntoventa_procesos_enviar_comanda',
                C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                C_PEDIDO: function () {
                    return $('#C_PEDIDO').val();
                },
                C_FECHA: '',
                C_COMANDA: ''
            };
            $.AddPetition({
                type: 4,
                items: $.ConvertObjectToArr(objectPedido, {
                    C_FECHA: {
                        action: {
                            name: 'GetParentId',
                            args: $.ConvertObjectToArr({
                                token: tokenComanda,
                                column: 'C_FECHA'
                            })
                        }
                    },
                    C_COMANDA: {
                        action: {
                            name: 'GetParentId',
                            args: $.ConvertObjectToArr({
                                token: tokenComanda,
                                column: 'C_COMANDA'
                            })
                        }
                    }
                }),
                transaction: true
            });

            if ($.solver.basePath = '/restaurant') {
                $.AddPetition({
                    type: '4',
                    transaction: true,
                    items: $.ConvertObjectToArr({
                        script: 'spw_gbl_validar_registrar_movimientos_recetas_2',
                        C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                        C_DOCUMENTO: function () {
                            return $('#C_PEDIDO').val();
                        },
                        FLAG_DOCUMENTO: 'pdv',
                        C_USUARIO_REGISTRO: $.solver.session.SESSION_ID,
                        MODULO: $.solver.basePath,
                        C_COMANDA: '',
                        VENTA: '&'
                    },
                        {
                            C_COMANDA: {
                                action: {
                                    name: 'GetParentId',
                                    args: $.ConvertObjectToArr({
                                        token: tokenComanda,
                                        column: 'C_COMANDA'
                                    })
                                }
                            }
                        }
                    )
                });
            }

            $.SendPetition({
                onBefore: function () {
                    $.DisplayStatusBar({ message: 'Enviando pedido ...' });
                },
                onReady: function (result) {

                    if (typeof callback == 'function') {
                        callback();
                        return;
                    };

                    fnImprimirComanda(result[tokenComanda].items.C_COMANDA);
                    fnObtenerPedido();
                    fnMostrarPedidos();

                    var pedidoCurrent = $('#C_PEDIDO').val() || '';
                    if (pedidoCurrent != '') {
                        $('#pedido-' + pedidoCurrent).find('.estado').html('<span class="badge badge-primary float-right">Preparacion</span>');
                    };

                    $.CloseStatusBar();

                },
                onError: function (_error) {
                    $.CloseStatusBar();
                    $.ShowError({ error: _error });
                }
            });

        };
        const fnCambiarProductos = function () {

            const fnAplicarCambioEstado = function (c_pedido, estado, callback) {
                $.AddPetition({
                    table: 'PDV.PEDIDO',
                    type: 2,
                    condition: `C_EMPRESA = '${$.solver.session.SESSION_EMPRESA}' AND C_PEDIDO = '${c_pedido}'`,
                    items: $.ConvertObjectToArr({
                        C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                        C_PEDIDO: c_pedido,
                        IND_ESTADO: estado,
                        USUARIO_ANULA: $.solver.session.SESSION_ID,
                        MOTIVO_ANULACION: 'Traspaso a otra mesa'
                    })
                })

                $.SendPetition({
                    onBefore: function () {
                        //$.DisplayStatusBar({ message: 'Actualizando pedido.' });
                    },
                    onReady: function () {

                        if (typeof callback == 'function') {
                            callback();
                        };

                        $.CloseStatusBar();
                    },
                    onError: function (_error) {
                        $.CloseStatusBar();
                        $.ShowError({ error: _error });
                    }
                });
            }
            const fnAplicarCambioProductos = function (c_pedido1, c_usuario1, items1, c_pedido2, c_usuario2, items2, mesa, nroPedido1, nroPedido2) {

                $('#C_PEDIDO').val(c_pedido1);
                $('#NRO_PEDIDO').val(nroPedido1);
                objPedido.platos = items1;

                //guardamos pedido actual con los cambios
                fnActionGuardar(null, function () {

                    fnAplicarCambioMesero(c_usuario1, c_pedido1, function () {

                        if (items1.filter(x => x.Estado == '*').length == 0) fnAplicarCambioEstado(c_pedido1, '&')

                        $('#C_PEDIDO').val(c_pedido2);
                        $('#NRO_PEDIDO').val(nroPedido2)
                        objPedido.platos = items2;
                        objMesa = [mesa];

                        fnActionGuardar(null, function (pedido) {

                            c_pedido2 = pedido.items.C_PEDIDO;

                            fnAplicarCambioMesero(c_usuario2, c_pedido2, function () {

                                baulPedidos = JSON.parse('[]');
                                $('.mytable-pedido').html('');

                                if (items2.length == 0 && c_pedido2 != '') {
                                    fnAplicarCambioEstado(c_pedido2, '&', function () {
                                        $('#C_PEDIDO').val(c_pedido1);
                                        fnObtenerPedido();
                                        fnMostrarPedidos();
                                    })
                                }
                                else {
                                    fnObtenerPedido();
                                    fnMostrarPedidos();
                                }
                                fnObtenerAlertaOk('Se actualizaron los pedidos correctamente.');
                                $(dialogCambiarProductos).modal('hide');

                            });

                        });

                    });

                });
            }

            const tokenCambiarProductos = $.CreateToken();
            let dialogCambiarProductos = bootbox.dialog({
                title: 'Cambiar productos',
                message: `<div id="${tokenCambiarProductos}"></div>`,
                className: 'modal-search-100',
                onEscape: true
            });
            dialogCambiarProductos.init(function () {
                setTimeout(function () {

                    var oldProductos = [];
                    var newProductos = [];

                    const fnRellenarTabla = function (productos, tabla) {
                        var arrPedidos = [];
                        $.each(productos, function (i, plato) {
                            if (plato.Estado == '*') {
                                var objeto = {
                                    _rowNum: arrPedidos.length + 1,
                                    IdDetalle: plato.C_DETALLE,
                                    NombrePlato: plato.Nombre,
                                    CantidadOriginal: plato.Cantidad,
                                    Cantidad: plato.Cantidad,
                                    Precio: plato.PrecioOriginal,
                                    SubTotal: plato.PrecioOriginal * (plato.PrecioOriginal - plato.Precio) * plato.AfectacionCabeceraOriginal
                                };
                                arrPedidos.push(objeto);
                            }
                        });

                        $(dialogCambiarProductos).find(`#${tokenCambiarProductos} #${tabla}`).jqxGrid('clearselection');
                        $(dialogCambiarProductos).find(`#${tokenCambiarProductos} #${tabla}`).jqxGrid('clear');
                        $(dialogCambiarProductos).find(`#${tokenCambiarProductos} #${tabla}`).jqxGrid('addrow', null, arrPedidos);
                    };

                    $(dialogCambiarProductos).find(`#${tokenCambiarProductos}`).html(`
                        <form name="frmCambiarProductos">
                            <div class="row">
                                <div class="col">
                                    <div class="row">
                                        <div class="col-4">
                                            <div class="form-group-rm">
                                                <label class="col-form-label col-form-label-lg">Seleccionar mesa ocupada</label>
                                                <select
                                                    name="MESA1" class="form-control form-control-lg"
                                                    data-query="q_puntoventa_procesos_lista_mesas_ocupadas" data-value="C_PEDIDO" data-field="NOMBRE_MESA_ADIC"
                                                    data-empresa="${$.solver.session.SESSION_EMPRESA}"></select>
                                            </div>
                                        </div>
                                        <div class="col-4">
                                            <div class="form-group-rm">
                                                <label class="col-form-label col-form-label-lg">&nbsp;</label>
                                                <select
                                                    name="MESERO1" class="form-control form-control-lg"
                                                    data-query="q_puntoventa_procesos_obtener_mozos" data-value="SESSION_ID" data-field="SESSION_NOMBRE"
                                                    data-empresa="${$.solver.session.SESSION_EMPRESA}"></select>
                                            </div>
                                        </div>
                                        <div class="offset-3 col-1">
                                            <div class="form-group-rm">
                                                <label class="col-form-label col-form-label-lg">&nbsp;</label>
                                                <button type="button" data-type="1" class="btn btn-lg btn-success btn-block btnMover">>></button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="col">
                                    <div class="row">
                                        <div class="col-1">
                                            &nbsp;
                                        </div>
                                        <div class="offset-3 col-4">
                                            <div class="form-group-rm">
                                                <label class="col-form-label col-form-label-lg">Seleccionar mesa (TODAS)</label>
                                                <select
                                                    name="MESA2" class="form-control form-control-lg"
                                                    data-query="q_puntoventa_procesos_lista_mesas_todas" data-value="C_PEDIDO" data-field="NOMBRE_MESA_ADIC"
                                                    data-empresa="${$.solver.session.SESSION_EMPRESA}" data-C_PEDIDO="" required></select>
                                            </div>
                                        </div>
                                        <div class="col-4">
                                            <div class="form-group-rm">
                                                <label class="col-form-label col-form-label-lg">&nbsp;</label>
                                                <select
                                                    name="MESERO2" class="form-control form-control-lg"
                                                    data-query="q_puntoventa_procesos_obtener_mozos" data-value="SESSION_ID" data-field="SESSION_NOMBRE"
                                                    data-empresa="${$.solver.session.SESSION_EMPRESA}"></select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                        <div class="row mt-2">
                            <div class="col">
                                <div id="tablePedido1">
                                </div>
                            </div>
                            <div class="col">
                                <div id="tablePedido2">
                                </div>
                            </div>
                        </div>
                        <div class="row mt-2">
                            <div class="col-auto">
                                <button type="button" data-dismiss="modal" aria-label="Close" class="btn btn-lg btn-gray float-left"><i class="fa fa-close"></i>&nbsp;Cancelar</button>
                            </div>
                            <div class="col">
                                <button type="button" id="btnAplicarCambioProducto" class="btn btn-lg btn-danger float-right"><i class="fa fa-floppy-o" aria-hidden="true"></i>&nbsp;Grabar</button>
                            </div>
                        </div>
                    `);
                    $(dialogCambiarProductos).find(`#${tokenCambiarProductos}`).find('form[name=frmCambiarProductos]').ValidForm({
                        type: -1,
                        onDone: function (form, controls) {
                            var estadoTabla1 = false;

                            var c_pedido = $('#C_PEDIDO').val();
                            if (c_pedido != undefined) {
                                $(controls.MESA1).val(c_pedido).trigger('change')
                            }

                            // Creamos y llenamos las tablas
                            $(dialogCambiarProductos).find(`#${tokenCambiarProductos} #tablePedido1`).CreateGrid({
                                query: 'tbl_restaurant_procesos_puntocaja_tblcortesia',
                                hiddens: ['IdDetalle', 'SubTotal'],
                                columns: {
                                    '_rowNum': {
                                        text: '#',
                                        width: '30',
                                        cellsAlign: 'center',
                                        cellsalign: 'center',
                                        hidden: false,
                                        pinned: true,
                                        editable: false,
                                        sortable: false
                                    },
                                    'CantidadOriginal': {
                                        text: 'Cant. Pedido',
                                        width: 120,
                                        cellsAlign: 'center',
                                        editable: false
                                    },
                                    'Cantidad': {
                                        text: 'Cant. Mover',
                                        width: 120,
                                        cellsAlign: 'center',
                                        columnType: 'numberinput',
                                        cellclassname: 'cell-editable',
                                        editable: true,
                                        createeditor: function (row, cellvalue, editor, cellText, width, height) {
                                            editor.jqxNumberInput({
                                                spinButtons: false,
                                                decimalDigits: 0
                                            });
                                        },
                                        validation: function (cell, value) {
                                            const rowId = $(dialogCambiarProductos).find(`#${tokenCambiarProductos} #tablePedido1`).jqxGrid('getrowid', cell.row);
                                            const row = $(dialogCambiarProductos).find(`#${tokenCambiarProductos} #tablePedido1`).jqxGrid('getrows')[rowId];
                                            if (value <= 0 || value > row.CantidadOriginal) {
                                                return { result: false, message: "La cantidad ingresada es incorrecta." };
                                            };
                                            return true;
                                        }
                                    },
                                    'NombrePlato': {
                                        text: 'Nombre de Producto',
                                        width: 200,
                                        editable: false
                                    },
                                    'Precio': {
                                        width: 100,
                                        cellsAlign: 'right',
                                        columnType: 'numberinput',
                                        cellsFormat: 'd2',
                                        editable: false
                                    },
                                    //'SubTotal': {
                                    //    text: 'Sub-Total',
                                    //    width: 100,
                                    //    cellsAlign: 'right',
                                    //    columnType: 'numberinput',
                                    //    cellsFormat: 'd2',
                                    //    editable: false
                                    //},
                                    'a': {
                                        text: '<i class="fa fa-minus" aria-hidden="true"></i>',
                                        width: 50,
                                        createwidget: function (row, column, value, htmlElement) {
                                            $(dialogCambiarProductos).find(`#${tokenCambiarProductos} #tablePedido1`).jqxGrid('refresh');
                                        },
                                        initwidget: function (rowIndex, column, value, htmlElement) {

                                            $(htmlElement).html('');
                                            $(htmlElement).addClass('jqx-grid-cell-middle-align');
                                            $(htmlElement).css({ 'margin-top': '10px' });

                                            $(htmlElement).html(`<button type="button" class="btn btn-sm btn-success restar" style="width: 30px;">&nbsp;<i class="fa fa-minus" aria-hidden="true"></i>&nbsp;</button>`);

                                            //Acciones (restar)
                                            if ($(htmlElement).find('button.restar').length) {
                                                $(htmlElement).find('button.restar').unbind('click');
                                                $(htmlElement).find('button.restar').click(function () {

                                                    const rowId = $(dialogCambiarProductos).find(`#${tokenCambiarProductos} #tablePedido1`).jqxGrid('getrowid', rowIndex);
                                                    const row = $(dialogCambiarProductos).find(`#${tokenCambiarProductos} #tablePedido1`).jqxGrid('getrows')[rowId];

                                                    var nuevaCantidad = row.Cantidad - 1;
                                                    if (nuevaCantidad > 0) {
                                                        row.Cantidad = nuevaCantidad;
                                                        row.SubTotal = row.Precio * (row.CantidadOriginal - row.Cantidad)
                                                        $(dialogCambiarProductos).find(`#${tokenCambiarProductos} #tablePedido1`).jqxGrid('refresh')
                                                    }

                                                });
                                            };

                                        },
                                    },
                                    'b': {
                                        text: '<i class="fa fa-plus" aria-hidden="true"></i>',
                                        width: 50,
                                        createwidget: function (row, column, value, htmlElement) {
                                            $(dialogCambiarProductos).find(`#${tokenCambiarProductos} #tablePedido1`).jqxGrid('refresh');
                                        },
                                        initwidget: function (rowIndex, column, value, htmlElement) {

                                            $(htmlElement).html('');
                                            $(htmlElement).addClass('jqx-grid-cell-middle-align');
                                            $(htmlElement).css({ 'margin-top': '10px' });

                                            $(htmlElement).html(`<button type="button" class="btn btn-sm btn-success sumar" style="width: 30px;">&nbsp;<i class="fa fa-plus" aria-hidden="true"></i>&nbsp;</button>`);

                                            //Acciones (sumar)
                                            if ($(htmlElement).find('button.sumar').length) {
                                                $(htmlElement).find('button.sumar').unbind('click');
                                                $(htmlElement).find('button.sumar').click(function () {

                                                    const rowId = $(dialogCambiarProductos).find(`#${tokenCambiarProductos} #tablePedido1`).jqxGrid('getrowid', rowIndex);
                                                    const row = $(dialogCambiarProductos).find(`#${tokenCambiarProductos} #tablePedido1`).jqxGrid('getrows')[rowId];

                                                    var nuevaCantidad = row.Cantidad + 1;
                                                    var cantidadPedido = row.CantidadOriginal
                                                    if (nuevaCantidad <= cantidadPedido) {
                                                        row.Cantidad = nuevaCantidad;
                                                        row.SubTotal = row.Precio * (row.CantidadOriginal - row.Cantidad)
                                                        $(dialogCambiarProductos).find(`#${tokenCambiarProductos} #tablePedido1`).jqxGrid('refresh')
                                                    }
                                                });
                                            };

                                        },
                                    }
                                },
                                config: {
                                    selectionmode: 'checkbox',
                                    virtualmode: false,
                                    height: 400,
                                    rowsheight: 45,
                                    pageSize: 100,
                                    pageable: false,
                                    sortable: false,
                                    editable: true,
                                }
                            });
                            $(dialogCambiarProductos).find(`#${tokenCambiarProductos} #tablePedido2`).CreateGrid({
                                query: 'tbl_restaurant_procesos_puntocaja_tblcortesia',
                                hiddens: ['IdDetalle', 'SubTotal'],
                                columns: {
                                    '_rowNum': {
                                        text: '#',
                                        width: '30',
                                        cellsAlign: 'center',
                                        cellsalign: 'center',
                                        hidden: false,
                                        pinned: true,
                                        editable: false,
                                        sortable: false
                                    },
                                    'CantidadOriginal': {
                                        text: 'Cant. Pedido',
                                        width: 120,
                                        cellsAlign: 'center',
                                        editable: false
                                    },
                                    'Cantidad': {
                                        text: 'Cant. Mover',
                                        width: 120,
                                        cellsAlign: 'center',
                                        columnType: 'numberinput',
                                        cellclassname: 'cell-editable',
                                        editable: true,
                                        createeditor: function (row, cellvalue, editor, cellText, width, height) {
                                            editor.jqxNumberInput({
                                                spinButtons: false,
                                                decimalDigits: 0
                                            });
                                        },
                                        validation: function (cell, value) {
                                            const rowId = $(dialogCambiarProductos).find(`#${tokenCambiarProductos} #tablePedido2`).jqxGrid('getrowid', cell.row);
                                            const row = $(dialogCambiarProductos).find(`#${tokenCambiarProductos} #tablePedido2`).jqxGrid('getrows')[rowId];
                                            if (value <= 0 || value > row.CantidadOriginal) {
                                                return { result: false, message: "La cantidad ingresada es incorrecta." };
                                            };
                                            return true;
                                        }
                                    },
                                    'NombrePlato': {
                                        text: 'Nombre de Producto',
                                        width: 200,
                                        editable: false
                                    },
                                    'Precio': {
                                        width: 100,
                                        cellsAlign: 'right',
                                        columnType: 'numberinput',
                                        cellsFormat: 'd2',
                                        editable: false
                                    },
                                    //'SubTotal': {
                                    //    text: 'Sub-Total',
                                    //    width: 100,
                                    //    cellsAlign: 'right',
                                    //    columnType: 'numberinput',
                                    //    cellsFormat: 'd2',
                                    //    editable: false
                                    //},
                                    'a': {
                                        text: '<i class="fa fa-minus" aria-hidden="true"></i>',
                                        width: 50,
                                        createwidget: function (row, column, value, htmlElement) {
                                            $(dialogCambiarProductos).find(`#${tokenCambiarProductos} #tablePedido2`).jqxGrid('refresh');
                                        },
                                        initwidget: function (rowIndex, column, value, htmlElement) {

                                            $(htmlElement).html('');
                                            $(htmlElement).addClass('jqx-grid-cell-middle-align');
                                            $(htmlElement).css({ 'margin-top': '10px' });

                                            $(htmlElement).html(`<button type="button" class="btn btn-sm btn-success restar" style="width: 30px;">&nbsp;<i class="fa fa-minus" aria-hidden="true"></i>&nbsp;</button>`);

                                            //Acciones (restar)
                                            if ($(htmlElement).find('button.restar').length) {
                                                $(htmlElement).find('button.restar').unbind('click');
                                                $(htmlElement).find('button.restar').click(function () {

                                                    const rowId = $(dialogCambiarProductos).find(`#${tokenCambiarProductos} #tablePedido2`).jqxGrid('getrowid', rowIndex);
                                                    const row = $(dialogCambiarProductos).find(`#${tokenCambiarProductos} #tablePedido2`).jqxGrid('getrows')[rowId];

                                                    var nuevaCantidad = row.Cantidad - 1;
                                                    if (nuevaCantidad > 0) {
                                                        row.Cantidad = nuevaCantidad;
                                                        $(dialogCambiarProductos).find(`#${tokenCambiarProductos} #tablePedido2`).jqxGrid('refresh')
                                                        return;
                                                    }

                                                });
                                            };

                                        },
                                    },
                                    'b': {
                                        text: '<i class="fa fa-plus" aria-hidden="true"></i>',
                                        width: 50,
                                        createwidget: function (row, column, value, htmlElement) {
                                            $(dialogCambiarProductos).find(`#${tokenCambiarProductos} #tablePedido2`).jqxGrid('refresh');
                                        },
                                        initwidget: function (rowIndex, column, value, htmlElement) {

                                            $(htmlElement).html('');
                                            $(htmlElement).addClass('jqx-grid-cell-middle-align');
                                            $(htmlElement).css({ 'margin-top': '10px' });

                                            $(htmlElement).html(`<button type="button" class="btn btn-sm btn-success sumar" style="width: 30px;">&nbsp;<i class="fa fa-plus" aria-hidden="true"></i>&nbsp;</button>`);

                                            //Acciones (sumar)
                                            if ($(htmlElement).find('button.sumar').length) {
                                                $(htmlElement).find('button.sumar').unbind('click');
                                                $(htmlElement).find('button.sumar').click(function () {

                                                    const rowId = $(dialogCambiarProductos).find(`#${tokenCambiarProductos} #tablePedido2`).jqxGrid('getrowid', rowIndex);
                                                    const row = $(dialogCambiarProductos).find(`#${tokenCambiarProductos} #tablePedido2`).jqxGrid('getrows')[rowId];

                                                    var nuevaCantidad = row.Cantidad + 1;
                                                    var cantidadPedido = row.CantidadOriginal
                                                    if (nuevaCantidad <= cantidadPedido) {
                                                        row.Cantidad = nuevaCantidad;
                                                        $(dialogCambiarProductos).find(`#${tokenCambiarProductos} #tablePedido2`).jqxGrid('refresh')
                                                        return;
                                                    }
                                                });
                                            };

                                        },
                                    }
                                },
                                config: {
                                    selectionmode: 'checkbox',
                                    virtualmode: false,
                                    height: 400,
                                    rowsheight: 45,
                                    pageSize: 100,
                                    pageable: false,
                                    sortable: false,
                                    editable: true,
                                }
                            });
                            $(dialogCambiarProductos).find(`#${tokenCambiarProductos} #tablePedido1`).on('bindingcomplete', function () {
                                if (!estadoTabla1) {
                                    $(controls.MESA1).trigger('change');
                                    estadoTabla1 = true;
                                }

                                $.each($(dialogCambiarProductos).find(`#${tokenCambiarProductos} #tablePedido1 .jqx-checkbox-default`), function (i, v) {
                                    $(v).css({ 'margin': '-1px 0 0 1px' })
                                    $(v).children().css({ 'width': '20px', 'height': '20px', });
                                    $(v).children().children().css({ 'width': '20px', 'height': '20px', });
                                });
                            });

                            $(controls.MESA1).change(function () {
                                const c_pedido = $(controls.MESA1).val();

                                if (c_pedido == '') return;

                                const c_mesero = $(controls.MESA1)[0].args.data.filter(x => x['C_PEDIDO'] == c_pedido)[0].C_USUARIO;

                                $(controls.MESA2).attr('data-C_PEDIDO', c_pedido);
                                $(controls.MESA2).FieldLoadRemote();

                                $(controls.MESERO1).val(c_mesero).trigger('change').attr('readonly', 'readonly').css({
                                    'pointer-events': 'none'
                                });

                                $.GetQuery({
                                    query: [
                                        'q_puntoventa_procesos_puntoventa_obtenerdetallepedido',
                                        'q_puntoventa_procesos_puntoventa_obtenerdetallepromo'
                                    ],
                                    items: [
                                        {
                                            C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                                            C_PEDIDO: c_pedido
                                        },
                                        {
                                            C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                                            C_PEDIDO: c_pedido
                                        }
                                    ],
                                    onReady: function (resultQuery) {
                                        var result = resultQuery['q_puntoventa_procesos_puntoventa_obtenerdetallepedido'].result.rows;
                                        var dataPedidoDetallePromo = resultQuery['q_puntoventa_procesos_puntoventa_obtenerdetallepromo'].result.rows;
                                        var platosArr = [];
                                        $.each(result, function (i, data) {
                                            var PlatoContar = platosArr.length + 1;
                                            var productosPromo = dataPedidoDetallePromo.filter(x => x.C_DETALLE == data.C_DETALLE)
                                            var Plato = {
                                                Fila: PlatoContar,
                                                IdPedido: '',
                                                IdProducto: data.C_PRODUCTO,
                                                Nombre: data.NOMBRE_PARA_VENTA + (data.NOTA_2 == '' ? '' : '<br/><span class="text-primary">' + data.NOTA_2 + '</span>') + (data.NOTA == '' ? '' : '<br/><span class="text-danger">&nbsp;' + data.NOTA + '</span>'),
                                                NombreCorto: data.NOMBRE_PARA_VENTA,
                                                Precio: data.PRECIO,
                                                AfectacionCabecera: data.AFECTACION_IGV_CABECERA,
                                                AfectacionCabeceraOriginal: data.AFECTACION_IGV_CABECERA_ORIGINAL,
                                                Cantidad: data.CANTIDAD,
                                                Afectacion: data.AFECTACION_IGV,
                                                TipoProducto: data.C_PARAMETRO_GENERAL_TIPO_PRODUCTO,
                                                IdProductoPrecio: data.C_PRODUCTO_PRECIO,
                                                C_ALMACEN: data.C_ALMACEN,
                                                NOM_ALMACEN: data.NOMBRE_ALMACEN,
                                                STOCK: parseFloat(data.STOCK),
                                                Estado: data.IND_ESTADO,
                                                C_UNIDAD_MEDIDA: data.C_UNIDAD_MEDIDA,
                                                C_PRODUCTO_PRECIO: (data.C_PARAMETRO_GENERAL_TIPO_PRODUCTO == '07229' ? null : data.C_PRODUCTO_PRECIO),
                                                PrecioOriginal: data.PRECIO_ORIGINAL,
                                                AfectacionIgvOriginal: data.AFECTACION_IGV_ORIGINAL,
                                                Cortesia: data.CORTESIA,
                                                NroComanda: data.C_COMANDA,
                                                FechaComanda: data.C_FECHA,
                                                Guardado: true,
                                                EnviadCocina: data.ENVIADO_COCINA,
                                                Nota: data.NOTA,
                                                C_DETALLE: data.C_DETALLE,
                                                C_COCINA: data.C_COCINA,
                                                FechaPedidoDetalle: data.FEC_CREAC,
                                                PROMOCION: productosPromo,
                                                Nota2: data.NOTA_2
                                            };
                                            platosArr.push(Plato);
                                        });

                                        oldProductos = platosArr;
                                        fnRellenarTabla(platosArr, 'tablePedido1');
                                    }
                                });
                            });
                            $(controls.MESA2).change(function () {
                                const c_pedido = $(controls.MESA2).val();
                                if (c_pedido != '') {
                                    const c_mesero = $(controls.MESA2)[0].args.data.filter(x => x['C_PEDIDO'] == c_pedido)[0].C_USUARIO;

                                    $(controls.MESERO2).val(c_mesero).trigger('change')
                                    if (c_mesero != null) {
                                        $(controls.MESERO2).attr('readonly', 'readonly').css({
                                            'pointer-events': 'none'
                                        });
                                    }
                                    else {
                                        $(controls.MESERO2).removeAttr('readonly').css({
                                            'pointer-events': 'auto'
                                        });
                                    }

                                }
                                $.GetQuery({
                                    query: [
                                        'q_puntoventa_procesos_puntoventa_obtenerdetallepedido',
                                        'q_puntoventa_procesos_puntoventa_obtenerdetallepromo'
                                    ],
                                    items: [
                                        {
                                            C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                                            C_PEDIDO: c_pedido
                                        },
                                        {
                                            C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                                            C_PEDIDO: c_pedido
                                        }
                                    ],
                                    onReady: function (resultQuery) {
                                        var result = resultQuery['q_puntoventa_procesos_puntoventa_obtenerdetallepedido'].result.rows;
                                        var dataPedidoDetallePromo = resultQuery['q_puntoventa_procesos_puntoventa_obtenerdetallepromo'].result.rows;
                                        var platosArr = [];
                                        $.each(result, function (i, data) {
                                            var PlatoContar = platosArr.length + 1;
                                            var productosPromo = dataPedidoDetallePromo.filter(x => x.C_DETALLE == data.C_DETALLE)
                                            var Plato = {
                                                Fila: PlatoContar,
                                                IdPedido: '',
                                                IdProducto: data.C_PRODUCTO,
                                                Nombre: data.NOMBRE_PARA_VENTA + (data.NOTA_2 == '' ? '' : '<br/><span class="text-primary">' + data.NOTA_2 + '</span>') + (data.NOTA == '' ? '' : '<br/><span class="text-danger">&nbsp;' + data.NOTA + '</span>'),
                                                NombreCorto: data.NOMBRE_PARA_VENTA,
                                                Precio: data.PRECIO,
                                                AfectacionCabecera: data.AFECTACION_IGV_CABECERA,
                                                AfectacionCabeceraOriginal: data.AFECTACION_IGV_CABECERA_ORIGINAL,
                                                Cantidad: data.CANTIDAD,
                                                Afectacion: data.AFECTACION_IGV,
                                                TipoProducto: data.C_PARAMETRO_GENERAL_TIPO_PRODUCTO,
                                                IdProductoPrecio: data.C_PRODUCTO_PRECIO,
                                                C_ALMACEN: data.C_ALMACEN,
                                                NOM_ALMACEN: data.NOMBRE_ALMACEN,
                                                STOCK: parseFloat(data.STOCK),
                                                Estado: data.IND_ESTADO,
                                                C_UNIDAD_MEDIDA: data.C_UNIDAD_MEDIDA,
                                                C_PRODUCTO_PRECIO: (data.C_PARAMETRO_GENERAL_TIPO_PRODUCTO == '07229' ? null : data.C_PRODUCTO_PRECIO),
                                                PrecioOriginal: data.PRECIO_ORIGINAL,
                                                AfectacionIgvOriginal: data.AFECTACION_IGV_ORIGINAL,
                                                Cortesia: data.CORTESIA,
                                                NroComanda: data.C_COMANDA,
                                                FechaComanda: data.C_FECHA,
                                                Guardado: true,
                                                EnviadCocina: data.ENVIADO_COCINA,
                                                Nota: data.NOTA,
                                                C_DETALLE: data.C_DETALLE,
                                                C_COCINA: data.C_COCINA,
                                                FechaPedidoDetalle: data.FEC_CREAC,
                                                PROMOCION: productosPromo,
                                                Nota2: data.NOTA_2
                                            };
                                            platosArr.push(Plato);
                                        });

                                        newProductos = platosArr;
                                        fnRellenarTabla(platosArr, 'tablePedido2');
                                    }
                                });

                                $.GetQuery({
                                    query: [
                                        'q_puntoventa_procesos_puntoventa_obtenerdetallepedido',
                                        'q_puntoventa_procesos_puntoventa_obtenerdetallepromo'
                                    ],
                                    items: [
                                        {
                                            C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                                            C_PEDIDO: function () {
                                                return $(controls.MESA1).val();
                                            },
                                        },
                                        {
                                            C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                                            C_PEDIDO: function () {
                                                return $(controls.MESA1).val();
                                            },
                                        }
                                    ],
                                    onReady: function (resultQuery) {
                                        var result = resultQuery['q_puntoventa_procesos_puntoventa_obtenerdetallepedido'].result.rows;
                                        var dataPedidoDetallePromo = resultQuery['q_puntoventa_procesos_puntoventa_obtenerdetallepromo'].result.rows;
                                        var platosArr = [];
                                        $.each(result, function (PlatoContar, data) {
                                            var PlatoContar = objPedido.platos.length + 1;
                                            var productosPromo = dataPedidoDetallePromo.filter(x => x.C_DETALLE == data.C_DETALLE)
                                            var Plato = {
                                                Fila: PlatoContar,
                                                IdPedido: '',
                                                IdProducto: data.C_PRODUCTO,
                                                Nombre: data.NOMBRE_PARA_VENTA + (data.NOTA_2 == '' ? '' : '<br/><span class="text-primary">' + data.NOTA_2 + '</span>') + (data.NOTA == '' ? '' : '<br/><span class="text-danger">&nbsp;' + data.NOTA + '</span>'),
                                                NombreCorto: data.NOMBRE_PARA_VENTA,
                                                Precio: data.PRECIO,
                                                AfectacionCabecera: data.AFECTACION_IGV_CABECERA,
                                                AfectacionCabeceraOriginal: data.AFECTACION_IGV_CABECERA_ORIGINAL,
                                                Cantidad: data.CANTIDAD,
                                                Afectacion: data.AFECTACION_IGV,
                                                TipoProducto: data.C_PARAMETRO_GENERAL_TIPO_PRODUCTO,
                                                IdProductoPrecio: data.C_PRODUCTO_PRECIO,
                                                C_ALMACEN: data.C_ALMACEN,
                                                NOM_ALMACEN: data.NOMBRE_ALMACEN,
                                                STOCK: parseFloat(data.STOCK),
                                                Estado: data.IND_ESTADO,
                                                C_UNIDAD_MEDIDA: data.C_UNIDAD_MEDIDA,
                                                C_PRODUCTO_PRECIO: (data.C_PARAMETRO_GENERAL_TIPO_PRODUCTO == '07229' ? null : data.C_PRODUCTO_PRECIO),
                                                PrecioOriginal: data.PRECIO_ORIGINAL,
                                                AfectacionIgvOriginal: data.AFECTACION_IGV_ORIGINAL,
                                                Cortesia: data.CORTESIA,
                                                NroComanda: data.C_COMANDA,
                                                FechaComanda: data.C_FECHA,
                                                Guardado: true,
                                                EnviadCocina: data.ENVIADO_COCINA,
                                                Nota: data.NOTA,
                                                C_DETALLE: data.C_DETALLE,
                                                C_COCINA: data.C_COCINA,
                                                FechaPedidoDetalle: data.FEC_CREAC,
                                                PROMOCION: productosPromo
                                            };
                                            platosArr.push(Plato);
                                        });

                                        oldProductos = platosArr;
                                        fnRellenarTabla(platosArr, 'tablePedido1');
                                    }
                                });
                            });

                            $('.btnMover').click(function () {

                                if ($(controls.MESA2).find('option:selected').attr('data-index') == '0') {
                                    fnObtenerAlertaWarning('Seleccione una mesa');
                                    return;
                                }

                                var type = $(this).attr('data-type');

                                var origen = (type == 1 ? 'tablePedido1' : 'tablePedido2');
                                var destino = (type == 1 ? 'tablePedido2' : 'tablePedido1');

                                var _oldProductos = (type == 1 ? oldProductos : newProductos);
                                var _newProductos = (type == 1 ? newProductos : oldProductos);

                                var indexOrigen = $(dialogCambiarProductos).find(`#${tokenCambiarProductos} #${origen}`).jqxGrid('getselectedrowindexes');
                                if (indexOrigen.length == 0) return;

                                $.each(indexOrigen, function (i, index) {
                                    // Seteamos valores de tabla origen
                                    var codDetalle = $(dialogCambiarProductos).find(`#${tokenCambiarProductos} #${origen}`).jqxGrid('getrows')[index]['IdDetalle']
                                    var plato = _oldProductos.find(x => x['C_DETALLE'] == codDetalle);
                                    var cantidad = $(dialogCambiarProductos).find(`#${tokenCambiarProductos} #${origen}`).jqxGrid('getrows')[index]['Cantidad'];

                                    if (cantidad == undefined) return;

                                    var cantidadOriginal = plato['Cantidad'];
                                    var diferencia = cantidadOriginal - cantidad;
                                    plato.Cantidad = diferencia;

                                    // Limpiamos las promociones
                                    var promociones = [];
                                    for (var i = 0; i < plato.PROMOCION.length; i++) {
                                        var newDetallePromo = JSON.parse(JSON.stringify(plato.PROMOCION[i]));
                                        newDetallePromo.C_DETALLE = '';
                                        newDetallePromo.C_DETALLE_PROMO = '';
                                        promociones.push(newDetallePromo);
                                    }

                                    var new_plato = {};
                                    new_plato = JSON.parse(JSON.stringify(plato));
                                    new_plato.Cantidad = cantidad;
                                    new_plato.C_DETALLE = '';
                                    new_plato.PROMOCION = promociones

                                    _newProductos.push(JSON.parse(JSON.stringify(new_plato)));

                                    if (diferencia == 0) plato.Estado = '&';

                                })

                                oldProductos = [];
                                newProductos = [];

                                $.each(_oldProductos, function (i, plato) {
                                    if (plato != undefined) {
                                        if (type == 1) {
                                            oldProductos.push(plato);
                                        }
                                        else {
                                            newProductos.push(plato)
                                        }
                                    }
                                });
                                $.each(_newProductos, function (i, plato) {
                                    if (plato != undefined) {
                                        if (type == 1) {
                                            newProductos.push(plato)
                                        }
                                        else {
                                            oldProductos.push(plato);
                                        }
                                    }
                                })

                                fnRellenarTabla(oldProductos, 'tablePedido1');
                                fnRellenarTabla(newProductos, 'tablePedido2');

                            })
                            $('#btnAplicarCambioProducto').click(function () {
                                $(dialogCambiarProductos).find(`#${tokenCambiarProductos}`).find('form[name=frmCambiarProductos]').submit();
                            })
                        },
                        onReady: function (form, controls) {
                            const c_pedido1 = $(controls.MESA1).val();
                            const c_pedido2 = $(controls.MESA2).val();
                            let c_usuario1 = $(controls.MESERO1).val();
                            let c_usuario2 = $(controls.MESERO2).val();

                            if (c_usuario1 == '' || c_usuario1 == null || c_usuario1 == undefined) c_usuario1 = $.solver.session.SESSION_ID;
                            if (c_usuario2 == '' || c_usuario2 == null || c_usuario2 == undefined) c_usuario2 = $.solver.session.SESSION_ID;

                            var mesa = $(controls.MESA2)[0].args.data[parseInt($(controls.MESA2).find('option:selected').attr('data-row'))];
                            var nroPedido1 = $(controls.MESA1)[0].args.data[parseInt($(controls.MESA1).find('option:selected').attr('data-row'))]['NRO_PEDIDO'];
                            var nroPedido2 = $(controls.MESA2)[0].args.data[parseInt($(controls.MESA2).find('option:selected').attr('data-row'))]['NRO_PEDIDO'];

                            fnAplicarCambioProductos(c_pedido1, c_usuario1, oldProductos, (c_pedido2 == '-' ? '' : c_pedido2), c_usuario2, newProductos, mesa, nroPedido1, nroPedido2);
                        }
                    })

                }, 150)
            })

            $('.bootbox .modal-dialog').draggable({
                handle: '.modal-header'
            });
            $('.bootbox .modal-header').css('cursor', 'move');

        }
        const fnCambiarMesa = function () {

            const codPedido = $('#C_PEDIDO').val() || '';
            const fnCambiarPedidoMesa = function (mesa) {
                $.AddPetition({
                    type: 4,
                    items: $.ConvertObjectToArr({
                        script: 'spw_puntoventa_procesos_puntoventa_cambio_de_mesa',
                        empresa: $.solver.session.SESSION_EMPRESA,
                        pedido: codPedido,
                        mesa: mesa.C_MESA,
                        usuario: $.solver.session.SESSION_ID,
                    }),
                    transaction: true
                });

                $.SendPetition({
                    onBefore: function () {
                        $.DisplayStatusBar({ message: 'Actualizando pedido.' });
                    },
                    onReady: function () {

                        fnObtenerPedido(function () {
                            $('#pedido-' + codPedido).find('.mesas').html(fnObtenerNombreMesa('S'));
                        });
                        fnMostrarPedidos();
                        fnMostrarResumen();

                        $.CloseStatusBar();
                        fnObtenerAlertaOk('Pedido actualizado.');

                    },
                    onError: function (_error) {
                        $.CloseStatusBar();
                        $.ShowError({ error: _error });
                    }
                });
            };

            if (codPedido == '') {
                fnObtenerAlertaWarning('Primero debes guardar el pedido.');
                return;
            };

            if (objMesa.length > 1) {
                fnObtenerAlertaWarning('El pedido tiene mas de 2 mesas.')
                return;
            }

            $.GetQuery({
                query: ['q_rest_procesos_lista_mesas_v2'],
                items: [{
                    empresa: $.solver.session.SESSION_EMPRESA, C_SALON: function () {
                        return $('#C_SALON').val();
                    }
                }],
                onReady: function (mesas) {

                    $('#pdvBox .blocked').css({ display: 'block' });
                    $('#pdvBox .blocked .text').html('<div class="zoneMesasFloat row"></div>');

                    $('.zoneMesasFloat').append(`
                        <div class="col-md-12 mb-2">
                            <h4 class="title-header text-left">
                                <i class="fa fa-check-square" aria-hidden="true"></i> SELECCIONA LA MESA PARA EL CAMBIO
                                <button type="button" class="close close_aditional" aria-label="Close">
                                  <span aria-hidden="true">&times;</span>
                                </button>
                            </h4>
                        </div>
                    `);

                    var lastMesa = '';
                    for (var item in mesas) {
                        var mesa = mesas[item];
                        if (mesa.C_MESA != lastMesa) {
                            lastMesa = mesa.C_MESA;
                            let myClassButton = 'btn-orange';
                            let myTextPersonas = `<br /><i class="fa fa-users" aria-hidden="true"></i> 0 pers.`;
                            if (mesa.NRO_PEDIDO != '') myClassButton = 'btn-danger';
                            if (mesa.NRO_PERSONAS > 0) myTextPersonas = `<br /><i class="fa fa-users" aria-hidden="true"></i> ${mesa.NRO_PERSONAS} pers.`;
                            $('.zoneMesasFloat').append(`
                                    <div id="mesa${item}" class="col-md-2 col-sm-2 box-plato mt-1">
                                        <button data-token="${item}" class="btn ${myClassButton} btn-block rounded pt-3 pb-3 border mesabox">${mesa['NOMBRE_MESA_ADIC'].toUpperCase() + myTextPersonas}</button>
                                    </div>
                                `);
                            if (mesa.NRO_PEDIDO != '') {
                                $('.zoneMesasFloat').find('button').last().attr('disabled', 'disabled');
                            };
                        };
                    };

                    $('.zoneMesasFloat').find('button.close').click(function () {
                        $('#pdvBox .blocked').css({ display: 'none' });
                    });

                    $('.zoneMesasFloat').find('button.mesabox').click(function () {

                        var index = $(this).attr('data-token');
                        var hasOcupied = $(this).hasClass('btn-danger');

                        if (!hasOcupied) {
                            $('#pdvBox .blocked').css({ display: 'none' });
                            fnCambiarPedidoMesa(mesas[index]);
                        }
                        else {
                            fnObtenerAlertaWarning('<i class="fa fa-exclamation-triangle" aria-hidden="true"></i> No puedes elegir esta mesa.');
                        };

                    });

                }
            });

        };
        const fnCambiarMesero = function () {

            fnSeleccionarMesero('CambiarMesero', function (datausuario) {
                fnAplicarCambioMesero(datausuario, $('#C_PEDIDO').val(), function () {
                    fnObtenerPedido();
                    fnMostrarPedidos();
                    fnMostrarResumen();
                    $('#pedido-' + $('#C_PEDIDO').val()).find('.mesero').html(`<span class="text-dark">${datausuario}</span>`);
                    fnObtenerAlertaOk('Se cambió el mesero del pedido correctamente.');
                });
            });

        }
        const fnCerrarCaja = function () {

            $.GetQuery({
                query: ['q_puntoventa_procesos_arqueo_obtenerinfocaja'],
                items: [{
                    C_FECHA: objMyCaja.C_FECHA,
                    C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                    C_CAJA: objMyCaja.C_CAJA,
                    C_OPERACION: objMyCaja.C_OPERACION,
                    MODULO: $.solver.basePath
                }],
                onReady: function (result) {
                    //if (result.length == 0 || result[0].PENDIENTE == '0.00') {

                    fnAutorizarAccion('CerrarCaja', function (datausuario) {
                        $.AddPetition({
                            type: 4,
                            items: $.ConvertObjectToArr({
                                script: 'spw_arqueocaja_cerrar_caja',
                                C_FECHA: objMyCaja.C_FECHA,
                                C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                                C_CAJA: objMyCaja.C_CAJA,
                                C_USUARIO: objMyCaja.C_USUARIO,
                            })
                        });
                        $.SendPetition({
                            onReady: function () {
                                $.CloseStatusBar();
                                fnObtenerAlertaOk('La caja ha sido cerrada.');

                                document.location.reload()
                            },
                            onBefore: function () {
                                $.DisplayStatusBar({ message: 'Cerrando caja' });
                            },
                            onError: function (_error) {
                                $.CloseStatusBar();
                                $.ShowError({ error: _error });
                            }
                        });
                    });

                    //}
                    //else {
                    //alertify.error('No se puede cerrar la caja porque tiene pedidos pendientes.')
                    //}
                }
            });

        };
        const fnBuscarProductos = function () {
            $.GetQuery({
                query: ['q_puntoventa_procesos_puntoventa_buscarproducto'],
                items: [{
                    BUSCAR: function () {
                        return $('#buscarProducto').val();
                    },
                    C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                    MODULO: $.solver.basePath
                }],
                onReady: function (result) {
                    if (result.length == 1) {
                        $('#buscarProducto').val('');
                        fnSeleccionarProducto(result, 0);
                    }
                    else {
                        fnObtenerPlatos();
                    }
                }
            });
        };
        const fnSalirSession = function () {
            $.LogoutSession({
                onBefore: function () {
                    $.DisplayStatusBar({
                        message: `Cerrando las credenciales de [${$.solver.session.SESSION_NOMBRE}]...`
                    });
                },
                onReady: function () {
                    let modePath = $.solver.basePath.replace('/', '');
                    let modeTheme = 'aceAdmin';
                    if (typeof $.solver.session.SESSION_PDV_MODO != 'undefined') {
                        modePath = $.solver.session.SESSION_PDV_MODO;
                    };
                    if (typeof $.solver.session.SESSION_FORCE_THEME != 'undefined') {
                        modeTheme = $.solver.session.SESSION_FORCE_THEME;
                    };
                    document.location = $.solver.domainUrl + `/Cuenta/LoginDesktop/${$.solver.session.SESSION_EMPRESA}/${modePath}/${modeTheme}`;
                }
            });
        };
        const fnCheckIddle = function () {

            if (startIdle) return;

            $(document).idle({
                onIdle: function () {
                    fnSalirSession();
                    $(document).trigger('idle:stop');
                },
                //keepTracking: false,
                startAtIdle: true,
                events: 'mouseover mouseout',
                idle: 60000
            });

            startIdle = true;

        };
        const fnActionVerMeseros = function () {
            //obtiene productos (platos)
            $.GetQuery({
                query: ['q_puntoventa_procesos_puntoventa_obtenerproductos'],
                items: [
                    {
                        C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                        BUSCAR: function () {
                            return $('#buscarProducto').val()
                        },
                        MONEDA: '',
                        CATEGORIA: function () {
                            return $('#C_CATEGORIA').val() || ''
                        },
                        MODULO: $.solver.basePath
                    }],
                onError: function (error) {
                    $.CloseStatusBar();
                    $.ShowError({ error });
                },
                onBefore: function () {
                    $.DisplayStatusBar({ message: 'Cargando productos y servicios.' });
                },
                onReady: function (result) {

                    $.CloseStatusBar();

                    $('#zone-venta').show();
                    $('#zone-actions').show();
                    $('#zone-venta .zoneProds').html('');

                    var producto = result
                    var totalCols = 0;

                    for (var item in producto) {
                        var row = producto[item];
                        var token = $.CreateToken();

                        totalCols++;

                        if (row.C_ARCHIVO_FOTO != '') {
                            row.C_ARCHIVO_FOTO = `style="background-image: url('${$.solver.services.api}/service/viewfile/${row.C_ARCHIVO_FOTO}');"`;
                        };

                        $('#zone-venta .zoneProds').append(`
                            <div id="${token}" data-token="${item}" class="col-md-2 col-sm-2 box-plato mt-1">
                                <div class="border item" ${row.C_ARCHIVO_FOTO}>
                                    <div class="nombre">${row.NOMBRE_PARA_VENTA.toUpperCase()}</div>
                                    <div class="precio pt-1">S/.${numeral(row.PRECIO_VENTA).format('0.00')}</div>
                                </div>
                            </div>
                        `);

                        if (totalCols == 6) {
                            totalCols = 0;
                            $('div#' + token).addClass('pl-0');
                        } else {
                            if (totalCols == 1) {
                                $('div#' + token).addClass('pr-1');
                            } else {
                                $('div#' + token).addClass('pr-1 pl-0');
                            }
                        };

                        $('div#' + token).click(function () {
                            if ($('#IND_ESTADO').val() == '' || $('#IND_ESTADO').val() == '*') {
                                var refToken = $(this).attr('data-token');
                                //fnSeleccionarProducto(producto, refToken);
                                fnSeleccionarAgregarProducto(producto, refToken);
                            }
                        });

                    };

                    fnArmarCategorias();
                    fnMostrarResumen();
                    fnValidarBotones();

                }
            });

            //obtiene mesas
            if ($.solver.basePath == '/puntoventa') {
                $.GetQuery({
                    query: ['q_pdv_procesos_lista_ver_usuarios'],
                    items: [{ empresa: $.solver.session.SESSION_EMPRESA }],
                    onReady: function (mesas) {

                        if (!isAlert) {

                            isAlert = true;
                            $('#pdvBox .blocked').css({ display: 'block' });
                            $('#pdvBox .blocked .text').html('<div class="zoneMesasFloat row"></div>');

                            $('.zoneMesasFloat').append(`
                                <div class="col-md-12 mb-2">
                                    <h4 class="title-header"><i class="fa fa-check-square" aria-hidden="true"></i> SELECCIONA TU MESA</h4>
                                </div>
                            `);

                            var lastMesa = '';
                            for (var item in mesas) {
                                var mesa = mesas[item];
                                if (mesa.C_USUARIO != lastMesa) {
                                    lastMesa = mesa.C_USUARIO;
                                    let myClassButton = 'btn-orange';
                                    let myTextPersonas = `S/. ${mesa.TOTAL}`;
                                    let myMozo = `<br />${mesa.C_USUARIO}`
                                    $('.zoneMesasFloat').append(`
                                        <div id="mesa${item}" class="col-md-2 col-sm-2 box-plato mt-1">
                                            <button data-token="${item}" class="btn ${myClassButton} btn-block rounded pt-3 pb-3 border">
                                                ${myTextPersonas + myMozo}
                                            </button>
                                        </div>
                                    `);
                                };
                            };

                            $('.zoneMesasFloat').find('button').click(function () {
                                var index = $(this).attr('data-token');
                                var usuario = mesas[index]['C_USUARIO']

                                $('#USUARIO_CONSTANTE').val('*');
                                $('#C_MESERO').val(usuario);
                                $('#pdvBox .blocked').css({ display: 'none' });
                                fnActionNuevo();
                                fnMostrarPedidos();
                            });

                        }

                    }
                });
            };
        }
        /* FUNCIONES DE ACCIONES */

        //Obtenemos permiso de usuario
        fnPermisosUsuario();

        //Campo para buscar producto
        $('#buscarProducto').keypress(function (event) {
            var keycode = (event.keyCode ? event.keyCode : event.which);
            if (keycode == '13') {

                fnBuscarProductos();

            };
        });
        $('#btnSearchProducts').click(function () {
            fnBuscarProductos();
        });

        $.CambiarProducto = function (index, CALCULO_PRECIO) {
            var row = $('#tablePrecios').jqxGrid('getrows')[index];
            var categoria = row['C_CATEGORIA'];
            $.solver.fn.fnAbrirModal({
                query: 'tbl_restaurant_procesos_puntoventa_obtenerproductosparareemplazarenpromocion',
                items: {
                    CATEGORIA: (categoria == null ? '' : categoria)
                },
                hiddens: ['ROW', 'C_PRODUCTO', 'TIPO', 'C_PARAMETRO_GENERAL_TIPO_PRODUCTO', 'CODIGO_AFECTACION_IGV', 'C_ARCHIVO_FOTO', 'PROMOCION', 'STOCK_ILIMITADO', 'C_PRODUCTO_PRECIO'],
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
                    NOMBRE_PARA_VENTA: {
                        text: 'Producto'
                    },
                    PRECIO_VENTA: {
                        text: 'Precio',
                        cellsFormat: 'd2',
                        cellsAlign: 'right'
                    },
                },
                controlsAfter: {
                    procesar: {
                        class: 'col-auto',
                        html: `<button id="btnProcesar" type="button" class="btn btn-lg btn-danger"><i class="fa fa-floppy-o" aria-hidden="true"></i> Aceptar</button>`
                    }
                },
                onAfter: function (token, dialog) {
                    $(dialog).find('.modal-dialog').css({ 'max-width': '50%' })
                    $(dialog).find('.modal-dialog').css({ 'margin-top': '5%' })
                },
                onSelected: function (rowData) {
                    $('#tablePrecios').jqxGrid('getrows')[index].C_PRODUCTO = rowData['C_PRODUCTO'];
                    $('#tablePrecios').jqxGrid('getrows')[index].NOMBRE_PARA_VENTA = rowData['NOMBRE_PARA_VENTA'];
                    $('#tablePrecios').jqxGrid('getrows')[index].PRECIO = rowData['PRECIO_VENTA'];
                    $('#tablePrecios').jqxGrid('getrows')[index].SUBTOTAL = rowData['PRECIO_VENTA'];

                    if (CALCULO_PRECIO == '10255') {
                        var rows = $('#tablePrecios').jqxGrid('getrows');
                        var mayor = 0;
                        $.each(rows, function (i, v) {
                            if (v.PRECIO >= mayor) {
                                mayor = v.PRECIO;
                            }
                        })
                        $('#precio').text('S/ ' + numeral(mayor).format('0.00'))
                        $('#precioProducto').val(mayor)
                    }
                    fnMostrarLabelPromocion();
                    $('#tablePrecios').jqxGrid('refresh')
                },
                onReady: function (form, controls, formToken, dialog) {
                    $(form).find('#btnProcesar').click(function () {
                        var rowData = $(`#${formToken}_table`).jqxGrid('getrows')[$(`#${formToken}_table`).jqxGrid('getselectedrowindex')];
                        if (rowData == undefined) {
                            fnObtenerAlertaWarning('Por favor seleccione un producto')
                            return;
                        }
                        $(`#tablePrecios`).jqxGrid('getrows')[index].C_PRODUCTO = rowData['C_PRODUCTO'];
                        $(`#tablePrecios`).jqxGrid('getrows')[index].NOMBRE_PARA_VENTA = rowData['NOMBRE_PARA_VENTA'];
                        $(`#tablePrecios`).jqxGrid('getrows')[index].PRECIO = rowData['PRECIO_VENTA'];
                        $(`#tablePrecios`).jqxGrid('getrows')[index].SUBTOTAL = rowData['PRECIO_VENTA'];

                        if (CALCULO_PRECIO == '10255') {
                            var rows = $('#tablePrecios').jqxGrid('getrows');
                            var mayor = 0;
                            $.each(rows, function (i, v) {
                                if (v.PRECIO >= mayor) {
                                    mayor = v.PRECIO;
                                }
                            })
                            $('#precio').text('S/ ' + numeral(mayor).format('0.00'))
                            $('#precioProducto').val(mayor)
                        }
                        fnMostrarLabelPromocion();
                        $(dialog).modal('hide')
                        $('#tablePrecios').jqxGrid('refresh')
                    })
                },
                config: {
                    pageable: true,
                    sortable: true,
                    height: 600,
                    pageSize: 100,
                    rowsheight: 45,
                },
                showSearch: false,
                controls: {
                    buscar: {
                        class: 'col-lg-4',
                        html: `<input type="text" name="buscar" class="form-control form-control-lg" placeholder="Ingrese busqueda..." autocomplete="off" value="" />`
                    },
                    btn: {
                        class: 'col-lg',
                        html: `<button type="submit" class="btn btn-lg btn-gray"><i class="fa fa-search" aria-hidden="true"></i> Buscar</button>`
                    }
                }
            })
        }

        fnValidarSalones();
    });
});