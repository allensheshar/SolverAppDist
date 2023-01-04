require(["jqwidgets", "helper", "extras", "jstree"], function () {
    require(["alertify", "moment", "bootbox", "datetimepicker"], function (alertify, moment, bootbox, datetimepicker) {

        alertify.set('notifier', 'position', 'top-center');

        const usuario = $.solver.session.SESSION_ID;

        const fnObtenerImagen = function () {
            var myImage = $('#img').attr('data-image') || '';
            if (myImage != '') {
                $('#img').SetScaleImage(myImage, 'cover');
            }
        };
        const fnCrearCargaArchivo = function () {
            require(["fileinput.es"], function () {
                $("#input-b6").fileinput({
                    language: 'es',
                    showPreview: false,
                    showCaption: false,
                    mainClass: "input-group-sm",
                    allowedFileExtensions: ['jpg', 'png'],
                    uploadUrl: $.solver.services.files + "/Service/Upload2/App",
                    uploadAsync: true,
                });
                $("#input-b6").on("filebatchselected", function (event, files) {
                    $("#input-b6").fileinput("upload");
                    $.DisplayStatusBar({
                        message: 'Espere un momento se esta cargando su archivo ...'
                    });
                });
                $("#input-b6").on("fileuploaded", function (event, data, previewId, index) {
                    $('input[name=C_ARCHIVO]').val(data.response.token);
                    $('#C_ARCHIVO').trigger('change');
                    $("#input-b6").fileinput('clear');
                    $('#img').attr('data-image', `${$.solver.services.files}Service/ViewFile2/${$('#C_ARCHIVO').val()}/App`);
                    fnObtenerImagen();
                    $.CloseStatusBar();
                });
            });
        };
        const fnValidarClave = function () {
            $.GetQuery({
                query: ['q_cuenta_validar_existencia_clave'],
                items: [{
                    USUARIO: function () { return usuario; },
                    CLAVE: function () { return $('#PASSWORD_NEW').val(); }
                }],
                onReady: function (result, data) {
                    if (result[0].VALIDACION == 0) fnActualizaClave();
                    if (result[0].VALIDACION != 0) {
                        alertify.alert('Validación de datos', '<span class="text-danger"><i class="fa fa-exclamation-circle" aria-hidden="true"></i> Por tu seguridad no puedes usar la misma contraseña o una anterior.</span>').set('label', 'Conforme');
                    }
                },
                onError: function (_error) {
                    $.CloseStatusBar();
                    $.ShowError({ error: _error });
                }
            });
        };
        const fnActualizaClave = function () {

            var fnGuardar = function () {
                var objusuario = {
                    C_USUARIO: $('#C_USUARIO').val(),
                    PASSWORD: $('#PASSWORD_NEW').val(),
                    C_USUARIO_REGISTRA: $('#C_USUARIO').val()
                };
                var objusuario_contrasenia = {
                    C_USUARIO: $('#C_USUARIO').val(),
                    PASSWORD: $('#PASSWORD_USU').val(),
                    FEC_REGISTRO: moment(new Date()).format("DD/MM/YYYY")
                };
                var objusuario_log_extras = {
                    C_LOG: {
                        action: {
                            name: 'GetNextId',
                            args: $.ConvertObjectToArr({
                                columns: 'C_USUARIO,C_FECHA',
                                max_length: '5'
                            })
                        }
                    },
                };
                var objusuario_log = {
                    C_USUARIO: $('#C_USUARIO').val(),
                    C_FECHA: moment(new Date()).format("DD/MM/YYYY"),
                    C_LOG: '',
                    C_TIPO: '03' //Actualizacion de Clave
                };

                $.AddPetition({
                    table: 'USUARIOS',
                    type: $('#C_USUARIO').val() == '' ? 1 : 2,
                    condition: `C_USUARIO = '${usuario}'`,
                    items: $.ConvertObjectToArr(objusuario)
                });
                $.AddPetition({
                    table: 'USUARIOS_CONTRASENA',
                    type: 1,
                    items: $.ConvertObjectToArr(objusuario_contrasenia)
                });
                $.AddPetition({
                    table: 'USUARIOS_LOG',
                    type: 1,
                    items: $.ConvertObjectToArr(objusuario_log, objusuario_log_extras)
                });

                $.SendPetition({
                    onBefore: function () {
                        $.DisplayStatusBar({ message: 'Actualizando tu contraseña...' });
                    },
                    onReady: function () {

                        $.AddPetition({
                            //transaction: true,
                            type: '7',
                            items: $.ConvertObjectToArr({
                                script: 'cuenta_perfil_micuenta_datos_correo',
                                codigo: function () {
                                    return usuario;
                                },
                                codigo_formato: 'formato_cambio_contraseña',
                                email: function () {
                                    return $('#EMAIL').val();
                                }
                            })
                        });

                        $.SendPetition({
                            onError: function (_error) {
                                $.CloseStatusBar();
                                $.ShowError({ error: _error });
                            },
                            onReady: function () {
                                $.CloseStatusBar();
                                alertify.alert('Datos Actualizados', `<span class="text-dark"><i class="fa fa-information-circle" aria-hidden="true"></i> Tu contraseña se ha actualizado correctamente.`, function () {

                                    $("#PASSWORD_NEW").attr('readonly', 'readonly');
                                    $("#PASSWORD_NEW_CONFIRMAR").attr('readonly', 'readonly');
                                    $('#PASSWORD').val('');
                                    $('#PASSWORD_NEW').val('');
                                    $('#PASSWORD_NEW_CONFIRMAR').val('');

                                }).set('label', 'Conforme');
                            }
                        });

                    },
                    onError: function (_error) {
                        $.CloseStatusBar();
                        $.ShowError({ error: _error });
                    }
                });
            };

            alertify.confirm('Mensaje del sistema', '¿Desea actualizar su contraseña?',
                function () {
                    fnGuardar();
                },
                function () {
                    alertify.error('Cambio cancelado');
                })
                .set('labels', { ok: 'Si', cancel: 'No' }).set('defaultFocus', 'ok').set('closable', false);

        };
        const fnActualizaDatos = function () {

            alertify.confirm('Mensaje del sistema', '¿Desea guardar los cambios?',
                function () {

                    var condition = `C_USUARIO = '${usuario}'`;
                    var objusuario = {
                        C_USUARIO: $('#C_USUARIO').val(),
                        NOMBRE: $('#NOMBRES').val(),
                        EMAIL: $('#EMAIL').val(),
                        TELEFONO: $('#TELEFONO').val(),
                        FEC_NACIMIENTO: $('#FEC_NAC').val(),
                        C_ARCHIVO: $('#C_ARCHIVO').val()
                    };

                    $.AddPetition({
                        table: 'USUARIOS',
                        type: $('#C_USUARIO').val() == '' ? 1 : 2,
                        condition: $('#C_USUARIO').val() == '' ? '' : condition,
                        items: $.ConvertObjectToArr(objusuario)
                    });
                    $.SendPetition({
                        onBefore: function () {
                            $.DisplayStatusBar({ message: 'Guardando información...' });
                        },
                        onReady: function () {
                            $.CloseStatusBar();
                            alertify.success('Se guardó la información.');
                        },
                        onError: function () {
                            $.CloseStatusBar();
                            $.ShowError({ error: _error });
                        }
                    });
                },
                function () {
                    alertify.error('Cambio cancelado');
                })
                .set('labels', { ok: 'Si', cancel: 'No' }).set('defaultFocus', 'ok').set('closable', false);
        };

        const ObtenerDatos = function () {
            $.GetQuery({
                query: ['cuenta_perfil_micuenta_buscarusuario'],
                items: [{
                    C_USUARIO: function () { return usuario; },
                }],
                onReady: function (result) {
                    if (result[0].EMPRESA == '' || result[0].EMPRESA == null) { $('#div-empresa').css({ 'display': 'none' }); }
                    else { $('#div-empresa').css({ 'display': 'block' }); }

                    $("#C_USUARIO").val(result[0].C_USUARIO);
                    $("#NOMBRES").val(result[0].NOMBRE);
                    $("#EMPRESA").val(result[0].EMPRESA);
                    $("#EMAIL").val(result[0].EMAIL);
                    $("#TELEFONO").val(result[0].TELEFONO);
                    $("#FEC_NAC").val(result[0].FEC_NACIMIENTO);
                    $("#C_ARCHIVO").val(result[0].C_ARCHIVO);
                    $("#PASSWORD_USU").val(result[0].PASSWORD);

                    $("#C_USUARIO").attr('readonly', 'readonly').css({ 'pointer-events': 'none' });
                    $("#EMPRESA").attr('readonly', 'readonly').css({ 'pointer-events': 'none' });

                    if ($("#C_ARCHIVO").val() != '') {
                        $('#img').attr('data-image', `${$.solver.services.files}Service/ViewFile2/${$('#C_ARCHIVO').val()}/App`);
                        fnObtenerImagen();
                    };

                }
            });
        };
        const ObtenerTabs = function () {
            $.GetQuery({
                query: ['gbl_obtener_clientes_habilitados_sistema'],
                items: [{
                    CodUsuario: function () { return usuario; },
                }],
                onReady: function (result) {
                    if (result.length == 0) { }
                    else {
                        $.each($('#myTabRoles').children(), function (i, tabs) {
                            $(tabs).show();
                        });
                    }
                }
            });
        };
        const GetFormEditer = function (url, correo, validador) {
            var _type = 1;
            var _condition = correo || '';
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
                            $(object).find('form[name=frmvalidador] #EMAIL').val(correo);

                            $(object).find('#btnGuardarCode').click(function () {
                                if ($(object).find('form[name=frmvalidador] #CODIGO').val() == validador) {

                                    var condition = `C_USUARIO = '${usuario}'`;
                                    var objusuario = {
                                        C_USUARIO: $('#C_USUARIO').val(),
                                        PASSWORD: $('#PASSWORD_NEW').val()
                                    };
                                    $.AddPetition({
                                        table: 'USUARIOS',
                                        type: $('#C_USUARIO').val() == '' ? 1 : 2,
                                        condition: $('#C_USUARIO').val() == '' ? '' : condition,
                                        items: $.ConvertObjectToArr(objusuario)
                                    });
                                    $.SendPetition({
                                        onBefore: function () {
                                            $.DisplayStatusBar({ message: 'Guardando información...' });
                                        },
                                        onReady: function () {
                                            $.GetQuery({
                                                query: ['cuenta_perfil_micuenta_historialcontrasena'],
                                                items: [{
                                                    CODIGO: function () { return usuario; },
                                                }],
                                                onReady: function (result) {
                                                    if (result[0].Column1 == 0) {
                                                        var condition = `C_USUARIO = '${usuario}'`;
                                                        var objusuario = {
                                                            C_USUARIO: $('#C_USUARIO').val(),
                                                            PASSWORD: $('#PASSWORD_USU').val(),
                                                            FEC_REGISTRO: moment(new Date()).format("DD/MM/YYYY")
                                                        };
                                                        $.AddPetition({
                                                            table: 'USUARIOS_CONTRASENA',
                                                            type: 1,
                                                            items: $.ConvertObjectToArr(objusuario)
                                                        });
                                                    }
                                                    else {
                                                        var condition = `C_USUARIO = '${usuario}'`;
                                                        var objusuario = {
                                                            C_USUARIO: $('#C_USUARIO').val(),
                                                            PASSWORD: $('#PASSWORD_USU').val(),
                                                            FEC_REGISTRO: moment(new Date()).format("DD/MM/YYYY")
                                                        };
                                                        $.AddPetition({
                                                            table: 'USUARIOS_CONTRASENA',
                                                            type: 2,
                                                            condition: condition,
                                                            items: $.ConvertObjectToArr(objusuario)
                                                        });
                                                    }

                                                    $.SendPetition({
                                                        onReady: function () {
                                                            $.CloseStatusBar();
                                                            $("#PASSWORD_USU").val($("#PASSWORD_NEW").val());
                                                            $("#PASSWORD").val('')
                                                            $("#PASSWORD_NEW").val('');
                                                            $("#PASSWORD_NEW_CONFIRMAR").val('');

                                                            $("#PASSWORD_NEW").attr('disabled', true);
                                                            $("#PASSWORD_NEW_CONFIRMAR").attr('disabled', true);

                                                            alertify.success('Se guardó la información.');

                                                            $.AddPetition({
                                                                type: '7',
                                                                items: $.ConvertObjectToArr({
                                                                    script: 'cuenta_perfil_micuenta_datos_correo',
                                                                    codigo: function () {
                                                                        return usuario;
                                                                    },
                                                                    codigo_formato: 'formato_cambio_contraseña',
                                                                    email: function () {
                                                                        return $('form[name=filtrosMiCuenta] #EMAIL').val();
                                                                    }
                                                                })
                                                            });

                                                            $.SendPetition({
                                                                onBefore: function () {
                                                                    $.DisplayStatusBar({
                                                                        message: 'Enviando correo de accesos'
                                                                    });
                                                                },
                                                                onReady: function () {
                                                                    $.CloseStatusBar();
                                                                    require(['alertify'], function (alertify) {
                                                                        alertify.success('El correo fue enviado exitosamente a [' + $('form[name=filtrosMiCuenta] #EMAIL').val() + '].');
                                                                        bootbox.hideAll();
                                                                        $('#micuenta-tab').tab('show');
                                                                    });
                                                                },
                                                                onError: function () {
                                                                    $.CloseStatusBar();
                                                                    require(['alertify'], function (alertify) {
                                                                        alertify.error('No se pudo entregar el correo de accesos a [' + $('form[name=filtrosMiCuenta] #EMAIL').val() + '].');
                                                                    });
                                                                }
                                                            });
                                                        },
                                                        onError: function () {
                                                            $.ShowError({ error: _error });
                                                        }
                                                    });
                                                }
                                            });
                                        },
                                        onError: function () {
                                            $.CloseStatusBar();
                                            $.ShowError({ error: _error });
                                        }
                                    });
                                }
                                else {
                                    alertify.error('Código incorrecto.');
                                }
                            });
                        },
                        onReady: function (result, controls, form) { }
                    });
                }
            });
        };
        const fnObtenerFicha = function (empresa) {
            $.GetData({
                title: 'Ver ficha de cliente',
                uriData: $.solver.baseUrl + 'administracion/Mantenimiento/ClientesRegistro?id=' + empresa + '&ver=ver',
                location: 'float',
                type: 'GET',
                isPage: true,
                onReady: function (object, modal) {

                    /*$(object).find('form[name=frmRegistroEmpresa]').ValidForm({
                        type: -1,
                        onDone: function (_, controls) {
                            var obj = $(controls)[0];
                            for (const prop in obj) { $(obj[prop]).attr('disabled', 'disabled') }

                            $(modal).find('.modal-dialog').css({ 'max-width': '80%' });
                            $(modal).find('#btnGuardar').remove();
                            $(modal).find('.tab-servicios').remove();
                            $(modal).find('.tab-usuario').remove();
                            $(modal).find('#servicios').remove();
                            $(modal).find('#usuario').remove();
                        }
                    });*/

                    $(modal).find('form').find('input, select,button').attr('disabled', 'disabled');
                    $(modal).find('.modal-dialog').css({ 'max-width': '80%' });
                    $(modal).find('#btnGuardar').remove();
                    $(modal).find('.tab-servicios').remove();
                    $(modal).find('.tab-usuario').remove();
                    $(modal).find('#servicios').remove();
                    $(modal).find('#usuario').remove();

                }
            })
        }

        $('img.client').each(function () {
            var source = $(this).attr('data-source') || '';
            if (source != '') {
                $(this).SetScaleImage(`${$.solver.services.files}service/viewfile2/${source}/App`);
            };
        });
        $('.number-input').on('input', function () {
            this.value = this.value.replace(/[^0-9]/g, '');
        });

        $('form[name=filtrosMiCuenta]').ValidForm({
            type: -1,
            onDone: function (form, controls) {
                var _controls = controls;

                $(_controls.FEC_NAC).datetimepicker({ format: 'DD/MM/YYYY', locale: 'es' });
                ObtenerTabs();
                ObtenerDatos();

                $('#img').attr('data-image', 'https://theme.solver.com.pe//content/images/login1/employee.png');
                fnObtenerImagen();

                $(_controls.C_ARCHIVO).change(function (e) {
                    fnObtenerImagen();
                });

            },
            onReady: function (result, controls, form) {
                fnActualizaDatos();
            }
        });

        $('form[name=filtrosContraseña]').ValidForm({
            type: -1,
            onDone: function (form, controls) {

            },
            onReady: function (result, controls, form) {
                fnValidarClave();
            },
            rules: {
                'PASSWORD': {
                    required: true,
                    runQuery: {
                        //aqui debemos agregar todas la peticiones
                        onStart: function () {
                            //agregamos peticion
                            $.AddPetition({
                                items: $.ConvertObjectToArr({
                                    script: 'q_cuenta_validar_usuario_clave',
                                    usuario: $.solver.session.SESSION_ID,
                                    clave: function () {
                                        return $('#PASSWORD').val();
                                    }
                                })
                            });
                        },
                        //aqui se validan las respuestas (retornar true o false)
                        onReady: function (result) {

                            var data = result[0].result.rows;

                            if (data.length != 0) {
                                if (data[0].VALIDACION != 0) {

                                    $("#PASSWORD_NEW").removeAttr('readonly');
                                    $("#PASSWORD_NEW_CONFIRMAR").removeAttr('readonly');
                                    $("#PASSWORD_NEW").focus();

                                    return true;
                                } 
                            };

                            $("#PASSWORD_NEW").attr('readonly', 'readonly');
                            $("#PASSWORD_NEW_CONFIRMAR").attr('readonly', 'readonly');

                            return false;
                        }
                    }
                },
                PASSWORD_NEW_CONFIRMAR: {
                    equalTo: '#PASSWORD_NEW'
                }
            },
            messages: {
                'PASSWORD': {
                    runQuery: 'La contraseña ingresada no es válida.',
                },
                PASSWORD_NEW_CONFIRMAR: {
                    equalTo: 'Por favor ingresa la contraseña anterior.'
                }
            }
        });

        fnCrearCargaArchivo();

        $('.btnVerFicha').click(function () {
            var empresa = $(this).attr('data-empresa');
            fnObtenerFicha(empresa);
        })
    });
});