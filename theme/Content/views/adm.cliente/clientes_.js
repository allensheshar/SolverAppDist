require(["helper", "extras", 'bootstrap-select', 'fileinput.es'], function () {
    require(["alertify", "moment", "bootbox"], function (alertify, moment, bootbox) {

        alertify.set('notifier', 'position', 'top-center');

        var table01 = "#tableRegClientes";
        var GetFormEditer = function (url, condition) {

            var _type = 1;
            var _condition = condition || '';
            var _title = "Nueva empresa";

            if (_condition.length != 0) {
                _title = "Editar empresa";
                _type = 2;
            };

            $.DisplayStatusBar();

            $.GetData({
                title: '<i class="fa fa-user" aria-hidden="true"></i> ' + _title,
                uriData: url,
                location: 'float',
                type: 'GET',
                isPage: true,
                onReady: function (object) {

                    var userToken = $.CreateToken();
                    var fnCrearCargaArchivo = function () {

                        $("#input-b7").fileinput({
                            language: 'es',
                            maxFileCount: 1,
                            showPreview: false,
                            mainClass: "input-group-sm",
                            allowedFileExtensions: ['png', 'jpg'],
                            uploadUrl: $.solver.services.api + "/Service/Upload/New",
                            uploadAsync: true,
                        });

                        $("#input-b7").on("filebatchselected", function (event, files) {
                            $("#input-b7").fileinput("upload");
                        });

                        $("#input-b7").on("fileuploaded", function (event, data, previewId, index) {
                            $('input[name=C_ARCHIVO_LOGO]').val(data.response.token);
                        });

                    };

                    $(object).find('form[name=frmRegistroEmpresa]').ValidForm({
                        table: 'EMPRESA',
                        type: _type,
                        condition: condition,
                        querySave: true,
                        queryDefault: {
                            query: ['editableEmpresa'],
                            type: [8],
                            items: [{
                                table: 'EMPRESA',
                                condition: _condition
                            }]
                        },
                        onDetail: function (form, controls) {
                            if (_type == 1) {
                                $.AddPetition({
                                    type: '4',
                                    transaction: true,
                                    items: $.ConvertObjectToArr({
                                        script: 'crear_usuario_empresas_null',
                                        clave: userToken.substring(0, 20)
                                    })
                                });
                            }
                        },
                        onError: function (error) {
                            $.CloseStatusBar();
                            $.ShowError({ error: error });
                        },
                        onDone: function (form, controls) {

                            $(controls.NRO_DOCUMENTO).change(function () {
                                $(controls.C_USUARIO).val($(this).val());
                            }).trigger('change');

                            fnCrearCargaArchivo();
                        },
                        onReady: function (result, controls, form) {

                            if (_type == 1) {
                                //Enviamos email usuario nuevo
                                $.AddPetition({
                                    type: '7',
                                    items: $.ConvertObjectToArr({
                                        script: 'obtener_datos_usuario',
                                        codigo: function () {
                                            return $(controls.C_USUARIO).val();
                                        },
                                        codigo_formato: 'correo_auto_nuevo_usuario_boleta_elec',
                                        email: function () {
                                            return $(controls.EMAIL_FIRMANTE_BE).val();
                                        }
                                    })
                                });
                                $.SendPetition({
                                    onError: function () {
                                        alertify.error('No se pudo entregar el correo de accesos a [' + $(controls.EMAIL_FIRMANTE_BE).val() + '].');
                                    }
                                });
                            };

                            //Cerramos modal y actualizamos tabla
                            $.CloseStatusBar();
                            bootbox.hideAll();
                            $(table01).jqxDataTable('render');

                        }
                    });

                    $.CloseStatusBar();
                }
            });

        };
        var fnValidarPfx = function (codigo_file, codigo_empresa, clave_file) {
            $.GetData({
                uriData: $.solver.baseUrl + '/Mantenimiento/ClientesValidarCargaPfx/' + codigo_file + '/?empresa=' + codigo_empresa + "&clave=" + clave_file,
                type: 'GET',
                isPage: true,
                onBefore: function () {
                    $.DisplayStatusBar({
                        message: 'Validando Archivo de Firma Digital Pfx'
                    });
                },
                onError: function () {
                    $.CloseStatusBar();
                    alertify.error('Ocurrió un error al validar la firma digital, vuelva a intentarlo.');
                    $(table01).jqxDataTable('render');
                },
                onReady: function (object) {
                    $.CloseStatusBar();
                    alertify.success('Su archivo fue procesando correctamente.');
                    $(table01).jqxDataTable('render');
                }
            });
        }
        var fnCrearCargaArchivoPfx = function () {

            var myControls = null;

            $("#input-b6").fileinput({
                language: 'es',
                maxFileCount: 1,
                showPreview: false,
                mainClass: "input-group-sm",
                allowedFileExtensions: ['pfx'],
                uploadUrl: $.solver.services.api + "/Service/Upload/New",
                uploadAsync: true,
            });

            $("#input-b6").on("filebatchselected", function (event, files) {
                $("#input-b6").fileinput("upload");
            });

            $("#input-b6").on("fileuploaded", function (event, data, previewId, index) {
                $(myControls.C_ARCHIVO).val(data.response.token);
            });

            $('#registraPfx').ValidForm({
                type: -1,
                onDone: function (form, controls) {
                    myControls = controls;
                },
                onReady: function (result, controls) {
                    $("#input-b6").fileinput('clear');
                    $('#modalUploadSigner').modal('hide');
                    fnValidarPfx($(myControls.C_ARCHIVO).val(), $(myControls.C_EMPRESA).val(), $(myControls.CLAVE).val());
                }
            });

        };

        $(table01).CreateTable({
            query: 'aus_documentoslaborales_administrarempresa_regsempresas',
            items: {
                BUSCAR: function () {
                    return $('input#_buscar').val() || '';
                },
                BASE: $.solver.basePath
            },
            hiddens: ['Codigo', 'Dirección'],
            columns: {
                RUC: {
                    width: '100',
                },
                RazonSocial: {
                    width: '350',
                    text: 'Razón social'
                },
                Direccion: {
                    text: 'Dirección',
                    width: 400
                },
                'Repre. Legal': {
                    text: 'Repre. legal'
                },
                'Email Repre.': {
                    text: 'Repre. legal'
                },
                C_USUARIO_REGISTRA: {
                    width: '120',
                    text: 'Usu. modificación', cellsalign: 'center'
                },
                FECHA_MODIFICACION: {
                    width: '120',
                    text: 'Fec. modificación', cellsalign: 'center'
                },
                IND_ESTADO: {
                    text: 'Estado',
                    width: 80,
                    cellsrenderer: function (row, columnfield, value, defaulthtml, columnproperties) {
                        if (value == '*') return '<div class="mt-2 jqx-grid-cell-middle-align"><span class="text-extra" style="color:green;"><i class="fa fa-check-circle" aria-hidden="true"></i> ACTIVO</span></div>';
                        if (value == '&') return '<div class="mt-2 jqx-grid-cell-middle-align"><span class="text-extra" style="color:red;"><i class="fa fa-exclamation-circle" aria-hidden="true"></i> INACTIVO</span></div>';
                        if (value == 'P') return '<div class="mt-2 jqx-grid-cell-middle-align"><span class="text-extra" style="color:blue;"><i class="fa fa-asterisk" aria-hidden="true"></i> PENDIENTE</span></div>';
                    }
                }
            },
            config: {
                theme: 'bootstrap',
                selectionMode: 'singleRow'
            }
        });

        //Boton Buscar / Formulario Filter
        $('form[name=filtrosRegClientes]').submit(function () {
            $(table01).jqxDataTable('render');
        });

        //Accion Nueva Empresa
        $('a#btnNuevaEmpresa').click(function (e) {
            document.location = $.solver.baseUrl + '/Mantenimiento/ClientesRegistro/';
            e.preventDefault();
        });

        //Accion Editar
        $('a#btnEditarEmpresa').bind('click', function (e) {
            var selection = $(table01).jqxDataTable('getSelection');
            if (selection.length != 0) {
                var id = selection[0].Codigo;
                document.location = $.solver.baseUrl + '/Mantenimiento/ClientesRegistro/' + id;
            } else {
                alertify.warning('Debes seleccionar un registro para editar.');
            }
            e.preventDefault();
        });

        //Accion Cargar Firma
        $('a#btnCargarFirma').bind('click', function (e) {

            var selection = $(table01).jqxDataTable('getSelection');

            if (selection.length != 0) {
                var id = selection[0].Codigo;
                $('#C_EMPRESA').val(id);
                $('#modalUploadSigner').modal('show');
            } else {
                alertify.warning('Debes seleccionar un registro para cargar su firma digital.');
            };

            e.preventDefault();

        });

        //Accion Reenviar Correo
        $('a#btnReenviarAccesos').bind('click', function (e) {

            var usuario = '';
            var email = '';
            var enviarAccesos = function () {
                $.AddPetition({
                    type: '7',
                    items: $.ConvertObjectToArr({
                        script: 'obtener_datos_usuario',
                        codigo: usuario,
                        codigo_formato: 'correo_auto_nuevo_usuario_boleta_elec',
                        email: email
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
                            alertify.success('El correo fue enviado exitosamente a [' + email + '].');
                        });
                    },
                    onError: function () {
                        $.CloseStatusBar();
                        require(['alertify'], function (alertify) {
                            alertify.error('No se pudo entregar el correo de accesos a [' + email + '].');
                        });
                    }
                });
            };
            var selection = $(table01).jqxDataTable('getSelection');

            if (selection.length != 0) {
                usuario = selection[0].C_USUARIO;
                email = selection[0].EMAIL_FIRMANTE_BE;
                enviarAccesos();
            } else {
                alertify.warning('Debes seleccionar un registro para reenviar sus accesos.');
            };

            e.preventDefault();
        });

        $('a#btnValidarConfiguracion').bind('click', function (e) {

            var selection = $(table01).jqxDataTable('getSelection');

            if (selection.length != 0) {
                var c_empresa = selection[0].Codigo;

                $.AddPetition({
                    type: 4,
                    items: $.ConvertObjectToArr({
                        script: 'q_gbl_crear_valores_defecto_empresa_primera_vez',
                        C_EMPRESA: c_empresa,
                    }),
                    transaction: true
                });

                $.SendPetition({
                    onReady: function (result) {
                        $.CloseStatusBar();
                        bootbox.hideAll();
                        alertify.success('Se actualizó la información la información.');
                    },
                    onBefore: function () {
                        $.DisplayStatusBar({ message: 'Validando y actualizando información.' });
                    },
                    onError: function (_error) {
                        $.CloseStatusBar();
                        $.ShowError({ error: _error });
                    }
                });
            } else {
                alertify.warning('Debes seleccionar un registro para reenviar sus accesos.');
            };

            e.preventDefault();
        })

        //Crear Carga de Archivo
        fnCrearCargaArchivoPfx();

    });
});