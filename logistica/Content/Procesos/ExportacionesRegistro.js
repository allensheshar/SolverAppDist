require(["helper", "extras", "datetimepicker"], function () {
    require(["alertify", "bootbox", "moment"], function (alertify, bootbox, moment) {
        alertify.set('notifier', 'position', 'top-center');

        const c_empresa = $.solver.session.SESSION_EMPRESA;
        var form = 'form[name=frm]';
        var _controls;
        var estado = false;

        const fnObtenerCliente = function () {
            if ($(_controls.C_PERSONA).val() != '') {
                $.GetQuery({
                    query: ['q_logistica_procesos_procesos_obtenercliente_porid'],
                    items: [{
                        C_EMPRESA: c_empresa,
                        C_CLIENTE: function () {
                            return $(_controls.C_PERSONA).val();
                        }
                    }],
                    onReady: function (result) {
                        if (result.length == 0) {
                            alertify.error('No se pudo obtener los datos del cliente');
                        }
                        else {
                            const dataCliente = result[0];
                            $(_controls.C_PERSONA_DETALLE).val(dataCliente['RAZON_SOCIAL'] + ' - ' + dataCliente['TIPO_DOCUMENTO'] + ': ' + dataCliente['RUC_CLIENTE']);
                        }
                    },
                    onError: function (error) {
                        $.CloseStatusBar();
                        $.ShowError({ error });
                    }
                })
            }
        };
        const fnBuscarCliente = function () {
            $.GetData({
                title: '<strong>Busqueda de clientes</strong>',
                uriData: $.solver.baseUrl + '/Mantenimiento/BusquedaCliente/',
                location: 'float',
                type: 'GET',
                isPage: true,
                onReady: function (objectBuscarCliente, modalBuscarCliente) {
                    $(modalBuscarCliente).find('.modal-dialog').css({ 'max-width': '60%' });

                    const formBuscarCliente = $(objectBuscarCliente).find('form[name=frmBusquedaCliente]');
                    const tableBuscarCliente = $(objectBuscarCliente).find('#tblBusquedaCliente');
                    const btnCrearCliente = $(objectBuscarCliente).find('#btnCrearCliente');
                    const btnAceptar = $(objectBuscarCliente).find('#btnAceptar');

                    $(formBuscarCliente).ValidForm({
                        type: -1,
                        onReady: function (form, controls) { tableBuscarCliente.jqxGrid('updatebounddata'); },
                        onDone: function () {
                            const actionElegir = function () {
                                const getselectedrowindexes = $(tableBuscarCliente).jqxGrid('getselectedrowindexes');
                                if (getselectedrowindexes.length > 0) {
                                    const c_cliente = $(tableBuscarCliente).jqxGrid('getrowdata', getselectedrowindexes[0])['C_CLIENTE'];
                                    $(_controls.C_PERSONA).val(c_cliente);
                                    fnObtenerCliente();
                                }
                            }

                            $(tableBuscarCliente).CreateGrid({
                                query: 'gbl_listarclientes',
                                items: {
                                    NOMBRE: function () { return $('#_buscar').val() || ''; },
                                    C_EMPRESA: c_empresa
                                },
                                hiddens: ['C_CLIENTE', 'C_CATEGORIA_CLIENTE', 'C_PARAMETRO_GENERAL_TIPO_DOCUMENTO', 'CORREO_FACTURACION'],
                                columns: {
                                    'RUC_CLIENTE': { text: 'Nro Documento', width: 100 },
                                    'RAZON_SOCIAL': { text: 'Razón Social', width: 250 },
                                    'NOMBRE_COMERCIAL': { text: 'Nombre Comercial', width: 250 },
                                    'DIRECCION_FISCAL': { text: 'Dirección Fiscal', width: 250 }
                                },
                                config: {
                                    pageSize: 999999,
                                    height: 600,
                                }
                            });
                            $(tableBuscarCliente).on("rowdoubleclick", function () {
                                actionElegir();
                                bootbox.hideAll();
                            });
                            $(btnAceptar).click(function () {
                                actionElegir();
                                bootbox.hideAll();
                            });
                            $(btnCrearCliente).click(function () {
                                $.GetData({
                                    title: '<strong>Registro de cliente</strong>',
                                    uriData: $.solver.baseUrl + '/Mantenimiento/ClientesRegistro/crear',
                                    location: 'float',
                                    type: 'GET',
                                    isPage: true,
                                    onReady: function (objectCrearCliente, modalCrearCliente) {
                                        $(modalCrearCliente).find('.modal-dialog').css({ 'max-width': '90%' });

                                        $('form[name=frmRegistroCliente] #C_CLIENTE').change(function () {
                                            $(objectCrearCliente).parent().parent().parent().find('.close').trigger('click');
                                        });
                                    },
                                    onCloseModal: function () {
                                        const c_cliente = $('form[name=frmRegistroCliente] #C_CLIENTE').val();
                                        if (c_cliente != '') {
                                            $(_controls.C_PERSONA).val(c_cliente);
                                            fnObtenerCliente();
                                            $(objectBuscarCliente).parent().parent().parent().find('.close').trigger('click');
                                        }
                                    }
                                });
                            });
                        },
                        onError: function (error) { $.ShowError({ error: error }); }
                    });
                },
                onCloseModal: function () {
                    estado = false;
                }
            })
        };
        const fnPintarEmpresa = function () {
            $.GetQuery({
                query: ['q_ventas_procesos_nuevaventa_consultarempresa'],
                items: [{
                    C_EMPRESA: $(_controls.C_EMPRESA).val()
                }],
                onReady: function (result) {
                    const data = result[0];
                    $('#RUC_EMPRESA').text('RUC N° ' + data['NRO_DOCUMENTO']);
                },
                onError: function (error) {
                    $.CloseStatusBar();
                    $.ShowError({ error });
                }
            })
            $.solver.fn.getImageLogoCompany('#imageEmpresa');
        };

        $(form).ValidForm({
            type: 1,
            table: 'LOG.OPERACION_INTERNACIONAL',
            querySave: true,
            extras: {
                ID_OPERACION: {
                    action: {
                        name: 'GetNextId',
                        args: $.ConvertObjectToArr({
                            max_length: 10,
                            columns: 'C_EMPRESA'
                        })
                    }
                },
                NRO_OPERACION: {
                    action: {
                        name: 'GetNextId',
                        args: $.ConvertObjectToArr({
                            max_length: 6,
                            columns: 'C_EMPRESA,ANIO,FLAG_TIPO'
                        })
                    }
                }
            },
            onReady: function (_, controls, tokenParent, objParent) {
                location.href = $.solver.baseUrl + '/Procesos/Exportaciones'
            },
            onDone: function (_, controls) {
                _controls = controls;

                $(controls.C_EMPRESA).val(c_empresa);

                if ($(controls.ID_OPERACION).val() != '') {
                    $(controls.FECHA).val(moment($(controls.FECHA).val()).format('DD/MM/YYYY'));

                    $('#OPERACION').text($(controls.ANIO).val() + '-' + $(controls.NRO_OPERACION).val())
                }

                $(controls.FECHA).datetimepicker({
                    format: 'DD/MM/YYYY',
                    locale: 'es'
                });

                $(form + ' #btnBuscarCliente').click(function () {
                    if (!estado) {
                        estado = true;
                        fnBuscarCliente();
                    }
                });

                fnObtenerCliente();
                fnPintarEmpresa();
            },
            onError: function (error) {
                $.CloseStatusBar();
                $.ShowError({ error });
            }
        });

    });
});