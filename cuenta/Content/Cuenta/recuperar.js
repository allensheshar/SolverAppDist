require(["jqwidgets", "helper", "extras", "jstree", "fileinput.es"], function () {
    require(["alertify", "moment", "bootbox", "datetimepicker"], function (alertify, moment, bootbox, datetimepicker) {
        alertify.set('notifier', 'position', 'top-center');

        //const usuario = $.solver.session.SESSION_ID;
        var usuario_datos = [];
        const GetFormEditer = function (url, usuario_datos, validador) {
            var _type = 1;
            var _condition = usuario_datos || '';
            var _title = "Código Validador";
            if (_condition.length != 0) {
                _title = "Código Validador";
                _type = 2;
            };

            $.GetData({
                title: _title,
                uriData: url,
                location: 'float',
                type: 'GET',
                isPage: true,
                onReady: function (object, modal) {
                    $(modal).find('.modal-dialog').css({ 'max-width': '40%' });
                    $(object).find('form[name=frmvalidador]').ValidForm({
                        type: -1,
                        onError: function (error) {
                            $.CloseStatusBar();
                            $.ShowError({ error: error });
                        },
                        onDone: function (form, controls) {
                            $(object).find('form[name=frmvalidador] #EMAIL').attr('readonly', 'readonly').css({ 'pointer-events': 'none' })
                            $(object).find('form[name=frmvalidador] #EMAIL').val(usuario_datos.EMAIL);

                            $(object).find('#btnGuardarCode').click(function () {
                                if ($(object).find('form[name=frmvalidador] #CODIGO').val() == validador) {
                                    var condition = `C_USUARIO = '${$('#C_USUARIO').val()}'`;
                                    var objusuariocontrasenia = {
                                        C_USUARIO: $('#C_USUARIO').val(),
                                        PASSWORD: $('#PASSWORD_NEW').val()
                                    };

                                    $.AddPetition({
                                        table: 'USUARIOS',
                                        type: $('#C_USUARIO').val() == '' ? 1 : 2,
                                        condition: $('#C_USUARIO').val() == '' ? '' : condition,
                                        items: $.ConvertObjectToArr(objusuariocontrasenia)
                                    });
                                    $.SendPetition({
                                        onBefore: function () {
                                            $.DisplayStatusBar({ message: 'Guardando información...' });
                                        },
                                        onReady: function () {
                                            $.GetQuery({
                                                query: ['cuenta_perfil_micuenta_historialcontrasena'],
                                                items: [{
                                                    C_USUARIO: function () { return $('#C_USUARIO').val(); },
                                                }],
                                                onReady: function (result) {
                                                    if (result[0].Column1 == 0) {
                                                        var objusuario_historial = {
                                                            C_USUARIO: $('#C_USUARIO').val(),
                                                            PASSWORD: usuario_datos.PASSWORD,
                                                            FEC_REGISTRO: moment(new Date()).format("DD/MM/YYYY")
                                                        };
                                                        $.AddPetition({
                                                            table: 'USUARIOS_CONTRASENA',
                                                            type: 1,
                                                            items: $.ConvertObjectToArr(objusuario_historial)
                                                        });
                                                    }
                                                    else {
                                                        var condition = `C_USUARIO = '${$('#C_USUARIO').val()}'`;
                                                        var objusuario_historial = {
                                                            C_USUARIO: $('#C_USUARIO').val(),
                                                            PASSWORD: usuario_datos.PASSWORD,
                                                            FEC_REGISTRO: moment(new Date()).format("DD/MM/YYYY")
                                                        };
                                                        $.AddPetition({
                                                            table: 'USUARIOS_CONTRASENA',
                                                            type: 2,
                                                            condition: condition,
                                                            items: $.ConvertObjectToArr(objusuario_historial)
                                                        });
                                                    }

                                                    $.SendPetition({
                                                        onBefore: function () {
                                                            $.DisplayStatusBar({ message: 'Guardando información...' });
                                                        },
                                                        onReady: function () {
                                                            $.CloseStatusBar();
                                                            $.AddPetition({
                                                                type: '7',
                                                                items: $.ConvertObjectToArr({
                                                                    script: 'cuenta_perfil_micuenta_datos_correo',
                                                                    codigo: $('#C_USUARIO').val(),
                                                                    codigo_formato: 'formato_cambio_contraseña',
                                                                    email: usuario_datos.EMAIL
                                                                })
                                                            });

                                                            $.SendPetition({
                                                                onBefore: function () {
                                                                    $.DisplayStatusBar({ message: 'Guardando información...' });
                                                                    $.DisplayStatusBar({ message: 'Enviando correo de accesos' });
                                                                },
                                                                onReady: function () {
                                                                    $.CloseStatusBar();
                                                                    require(['alertify'], function (alertify) {
                                                                        alertify.success('El correo fue enviado exitosamente a [' + usuario_datos.EMAIL + '].');
                                                                        usuario_datos = [];
                                                                        bootbox.hideAll();
                                                                        document.location = $.solver.baseUrl + '/Cuenta/Logout/';
                                                                    });
                                                                },
                                                                onError: function (_error) {
                                                                    $.CloseStatusBar();
                                                                    $.ShowError({ error: _error });
                                                                    require(['alertify'], function (alertify) {
                                                                        alertify.error('No se pudo entregar el correo de accesos a [' + usuario_datos.EMAIL + '].');
                                                                    });
                                                                }
                                                            });
                                                        },
                                                        onError: function (_error) {
                                                            $.ShowError({ error: _error });
                                                        }
                                                    });
                                                }
                                            });
                                        },
                                        onError: function (_error) {
                                            $.CloseStatusBar();
                                            $.ShowError({ error: _error });
                                        }
                                    });
                                }
                                else
                                {
                                    alertify.error('Código incorrecto.');
                                }
                            });
                        },
                        onReady: function (result, controls, form) {}
                    });
                }
            });
        };

        $("#C_USUARIO").blur(function () {
            if ($("#C_USUARIO").val() == '') { }
            else {
                $.GetQuery({
                    query: ['obtener_datos_usuario'],
                    items: [{ codigo: function () { return $('#C_USUARIO').val(); } }],
                    onBefore: function () {
                        //$.DisplayStatusBar({ message: 'Validando usuario...' });
                    },
                    onError: function (_error) {
                        $.CloseStatusBar();
                        $.ShowError({ error: _error });
                    },
                    onReady: function (result) {
                        //$.CloseStatusBar();
                        const data = result[0];
                        usuario_datos = data;

                        if (data == undefined) {
                            $("#C_USUARIO").val('');
                            alertify.error('El usuario ingresado no existe.');
                        }

                    }
                });
            }
        });
        $("#btnActualizar").bind('click', function () {
            if ($("#C_USUARIO").val() == '') {
                alertify.warning('Debe ingresar el usuario.');
            }
            else {
                if ($('#PASSWORD_NEW').val() == '') {
                    alertify.warning('Debe ingresar la nueva contraseña.');
                }
                else {
                    if ($('#PASSWORD_NEW_CONFIRMAR').val() == '') {
                        alertify.warning('Debe confirmar la nueva contraseña.');
                    }
                    else {
                        if ($("#PASSWORD_NEW").val() == $("#PASSWORD_NEW_CONFIRMAR").val()) {
                            if ($("#PASSWORD_NEW").val() && $("#PASSWORD_NEW_CONFIRMAR").val() == usuario_datos.PASSWORD) {
                                $("#PASSWORD_NEW").val('');
                                $("#PASSWORD_NEW_CONFIRMAR").val('');
                                alertify.error('La nueva contraseña no puede ser igual a la actual.');
                            }
                            else {
                                if (usuario_datos.EMAIL == '' || usuario_datos.EMAIL == null) {
                                    alertify.error('No tiene un correo asignado, comuníquese con el administrador.');
                                }
                                else {
                                    alertify.confirm('Mensaje del sistema', '¿Desea cambiar su contraseña?',
                                    function () {
                                        var _token = $.CreateToken();
                                        let code = _token.substring(0, 6);

                                        $.AddPetition({
                                            type: '7',
                                            items: $.ConvertObjectToArr({
                                                script: 'cuenta_cta_restablecercontrasenia_datos_correo_code',
                                                codigo: usuario_datos.C_USUARIO,
                                                validador: code,
                                                codigo_formato: 'formato_codigo_validador_contrasenia',
                                                email: usuario_datos.EMAIL
                                            })
                                        });
                                        $.SendPetition({
                                            onBefore: function () {
                                                $.DisplayStatusBar({ message: 'Enviando correo de accesos' });
                                            },
                                            onReady: function () {
                                                $.CloseStatusBar();
                                                require(['alertify'], function (alertify) {
                                                    alertify.success('El correo fue enviado exitosamente a [' + usuario_datos.EMAIL + '].');
                                                });
                                            },
                                            onError: function (_error) {
                                                $.CloseStatusBar();
                                                $.ShowError({ error: _error });
                                                require(['alertify'], function (alertify) {
                                                    alertify.error('No se pudo entregar el correo de accesos a [' + usuario_datos.EMAIL + '].');
                                                });
                                            }
                                        });

                                        GetFormEditer($.solver.baseUrl + "/Cuenta/ValidarCodigoEmail/", usuario_datos, code);
                                    },
                                    function () {
                                        alertify.error('Cambio cancelado');
                                    })
                                    .set('labels', { ok: 'Si', cancel: 'No' }).set('defaultFocus', 'ok').set('closable', false);
                                }
                            }
                        }
                        else {
                            $("#PASSWORD_NEW").val('');
                            $("#PASSWORD_NEW_CONFIRMAR").val('');
                            alertify.error('La nueva contraseña no coincide.');
                        }
                    }
                }
            }
        });

        $('form[name=frmRecuperarClave]').ValidForm({
            type: -1,
            onDone: function (form, controls) {
                _controls = controls;
            },
            onReady: function (result, controls, form) { }
        });

    });
});