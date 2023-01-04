require(["helper", "extras", 'bootstrap-select', 'fileinput.es', 'datetimepicker'], function () {
    require(["alertify", "bootbox"], function (alertify, bootbox) {

        alertify.set('notifier', 'position', 'top-center');

        let _controls;

        const obtenerDatosRUC = function () {
            $.GetQuery({
                query: ['q_ventas_mantenimiento_clientes_obtenerpadron_ruc'],
                items: [{ RUC: function () { return $('#NRO_DOCUMENTO').val(); } }],
                onBefore: function () {
                    $.DisplayStatusBar({ message: 'Buscando ruc ...' })
                },
                onError: function () {
                    $.CloseStatusBar();
                    $.ShowError({ error: error });
                },
                onReady: function (result) {
                    $.CloseStatusBar();
                    if (result.length != 0) {
                        const data = result[0]
                        $(_controls.RAZON_SOCIAL).val(data['RAZON_SOCIAL']);
                        $(_controls.DIRECCION).val(data['DIRECCION']);

                        fnSwitchEnable(true);
                    }
                    else {
                        $(_controls.RAZON_SOCIAL).val('');
                        $(_controls.DIRECCION).val('');

                        fnSwitchEnable(false);
                    }
                }
            });
        };

        // Para habilitar o deshabilitar los inputs
        const fnSwitchEnable = function (estado) {
            if (estado) {
                $(_controls.RAZON_SOCIAL).removeAttr('readonly')
                $(_controls.NOMBRE_RESPONSABLE).removeAttr('readonly')
                $(_controls.CORREO_RESPONSABLE).removeAttr('readonly')
                $(_controls.TELEFONO_RESPONSABLE).removeAttr('readonly')
                $(_controls.C_GIRO).removeAttr('readonly').css({ 'pointer-events': 'auto' })
                $(_controls.CHECK_AUTORIZO).removeAttr('disabled')
                $('button[type=submit]').removeAttr('disabled')
            }
            else {
                $(_controls.RAZON_SOCIAL).attr('readonly', 'readonly')
                $(_controls.NOMBRE_RESPONSABLE).attr('readonly', 'readonly')
                $(_controls.CORREO_RESPONSABLE).attr('readonly', 'readonly')
                $(_controls.TELEFONO_RESPONSABLE).attr('readonly', 'readonly')
                $(_controls.C_GIRO).attr('readonly', 'readonly').css({ 'pointer-events': 'none' })
                $(_controls.CHECK_AUTORIZO).attr('disabled', 'disabled')
                $('button[type=submit]').attr('disabled', 'disabled')
            }
        }

        $('form[name=frmRegistroEmpresa]').ValidForm({
            table: 'EMPRESA',
            type: 1,
            querySave: false,
            onDetail: function (form, controls, token) {

                // Query para crear usuario
                $.AddPetition({
                    type: 4,
                    transaction: true,
                    items: $.ConvertObjectToArr({
                        script: 'q_gbl_crear_usuario_empresa_primera_vez',
                        C_EMPRESA: function () { return $(controls.C_EMPRESA).val(); }
                    })
                });

                // Para agregar los roles
                $.AddPetition({
                    type: 4,
                    transaction: true,
                    items: $.ConvertObjectToArr({
                        script: 'q_gbl_crear_configuraciones_empresa_primera_vez',
                        C_EMPRESA: function () { return $(controls.C_EMPRESA).val(); }
                    })
                });

                // Para registrar los valores por defecto
                $.AddPetition({
                    type: 4,
                    transaction: true,
                    items: $.ConvertObjectToArr({
                        script: 'q_gbl_crear_valores_defecto_empresa_primera_vez',
                        C_EMPRESA: function () { return $(controls.C_EMPRESA).val(); }
                    })
                });

            },
            onError: function (error) {
                $.CloseStatusBar();
                $.ShowError({ error: error });
            },
            onDone: function (form, controls) {
                _controls = controls;

                $(controls.C_USUARIO_REGISTRA).val($.solver.session.SESSION_ID);

                $(controls.CHECK_AUTORIZO).change(function () {
                    var valor = $(this).is(':checked')
                    $(controls.FLAG_AUTORIZO).val((valor ? '*' : '&'));
                });

                $('#btnValidarRuc').unbind('click')
                $('#btnValidarRuc').click(function () {

                    var ruc = $(_controls.NRO_DOCUMENTO).val();
                    if (ruc.length != 11) {
                        alertify.error('Por favor, no escribas menos de 11 caracteres.')
                        return;
                    }

                    // Validamos que el ruc exista
                    $.GetQuery({
                        query: ['q_cuenta_validar_empresa_ruc'],
                        items: [{ ruc }],
                        onError: function (error) {

                            $.ShowError({ error: error });

                        },
                        onReady: function (result) {

                            var data = result;
                            if (data.length != 0) {
                                alertify.error('El numero de RUC ya existe');
                                return;
                            }

                            obtenerDatosRUC();

                        }
                    })
                })
            },
            onReady: function (result, controls, form) {

                $.DisplayStatusBar({ message: 'Enviando correos...' })

                $.GetQuery({
                    query: ['gbl_obtener_correos_nuevo_registro'],
                    onReady: function (result) {
                        

                        var correos = '';

                        if (result.length > 0) {
                            correos = result[0].CORREOS;
                        };

                        $.AddPetition({
                            type: '7',
                            items: $.ConvertObjectToArr({
                                script: 'q_cuenta_miempresa_crearcuenta_obtenerempresa',
                                codigo_formato: 'formato_post_registro_cliente_aut',
                                email: function () {
                                    return $(controls.CORREO_RESPONSABLE).val();
                                },
                                C_EMPRESA: function () {
                                    return $(controls.C_EMPRESA).val();
                                }
                            })
                        });

                        $.AddPetition({
                            type: '7',
                            items: $.ConvertObjectToArr({
                                script: 'q_cuenta_miempresa_crearcuenta_obtenerempresa_registrada',
                                codigo_formato: 'formato_aviso_registro_cliente',
                                email: correos,
                                C_EMPRESA: function () {
                                    return $(controls.C_EMPRESA).val();
                                }
                            })
                        });

                        $.SendPetition({
                            onError: function (_error) {

                                $.ShowError({ error: error });
                                $.CloseStatusBar();
                                //console.log(_error);

                            },
                            onReady: function (result) {

                                //console.log('result', result);
                                $.CloseStatusBar();
                                alertify.success('Se registró la información.');
                                document.location.href = $.solver.baseUrl;

                            }
                        });

                    }
                });

            },
            rules: {
                CORREO_RESPONSABLE: {
                    validarCorreo: $('#CORREO_RESPONSABLE').val()
                }
            },
            messages: {
                CORREO_RESPONSABLE: {
                    validarCorreo: 'Ingrese un correo válido.'
                },
            }
        });

        $('#btnGuardar').click(function () {
            $('form[name=frmRegistroEmpresa]').submit();
        });

    });
});