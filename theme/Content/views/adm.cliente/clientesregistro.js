require(["helper", "extras", 'bootstrap-select', 'fileinput.es', 'datetimepicker', 'tagsinput'], function () {
    require(["alertify", "bootbox", "moment"], function (alertify, bootbox, moment) {
        alertify.set('notifier', 'position', 'top-center');

        var editable = true;
        if ($.solver.basePath == '/tareaje') editable = false;

        const empresa = $.solver.session.SESSION_EMPRESA;
        const usu = $.solver.session.SESSION_ID;
        var table01 = "#tableRegUsuarios";
        var table02 = "#tblServicios";
        let validador = '';

        var userToken = $.CreateToken();
        var fnValidarPfx = function (codigo_file, codigo_empresa, clave_file) {
            $.GetData({
                uriData: $.solver.baseUrl + '/Mantenimiento/ClientesValidarCargaPfx/' + codigo_file + '/?clave=' + clave_file,
                type: 'GET',
                isPage: true,
                onBefore: function () {
                    $.DisplayStatusBar({
                        message: 'Validando Archivo de Firma Digital Pfx'
                    });
                },
                onError: function (error) {
                    $.CloseStatusBar();
                    $.ShowError({ error: error });
                },
                onReady: function (object) {
                    var result = object.split(',');
                    $('#FEC_VENC_FIRMA').val(result[0]).trigger('change');
                    $('#HASH_FIRMA').val(result[1]).trigger('change');
                    $.CloseStatusBar();
                    alertify.success('Su certificado se validó correctamente.');
                    let usuarios = $(table01).jqxGrid('getrows');
                    let contador = 0;
                    $.each(usuarios, function (i, v) {
                        if (v.FLAG_PRINCIPAL == true || v.FLAG_PRINCIPAL == 'true') {
                            contador++;
                        }
                    });
                    if (contador > 0) {
                        $('form[name=frmRegistroEmpresa]').submit();
                    }
                    else {
                        alertify.alert('¡Debe tener un usuario principal!');
                    }
                }
            });
        };
        var fnCrearCargaArchivo = function () {
            $("#input-b7").fileinput({
                language: 'es',
                maxFileCount: 1,
                showPreview: false,
                mainClass: "input-group-sm",
                allowedFileExtensions: ['png', 'jpg', 'jfif'],
                uploadUrl: $.solver.services.files + "/Service/Upload2/App",
                uploadAsync: true,
            });
            $("#input-b7").on("filebatchselected", function (event, files) {
                $("#input-b7").fileinput("upload");
            });
            $("#input-b7").on("fileuploaded", function (event, data, previewId, index) {
                $('input[name=C_ARCHIVO_LOGO]').val(data.response.token);
                fnObtenerImagen('C_ARCHIVO_LOGO', 'img-company');
                $("#input-b7").fileinput('clear');
            });
        };
        var fnCrearCargaArchivoGeneral = function () {
            $("#input-b7-ficha-ruc").fileinput({
                language: 'es',
                maxFileCount: 1,
                showPreview: false,
                mainClass: "input-group-sm",
                uploadUrl: $.solver.services.api + "/Service/Upload/New",
                uploadAsync: true,
            });
            $("#input-b7-ficha-ruc").on("filebatchselected", function (event, files) {
                $("#input-b7-ficha-ruc").fileinput("upload");
            });
            $("#input-b7-ficha-ruc").on("fileuploaded", function (event, data, previewId, index) {
                $('input[name=C_ARCHIVO_FICHA_RUC]').val(data.response.token);
                $("#input-b7-ficha-ruc").fileinput('clear');
                $('#C_ARCHIVO_FICHA_RUC').trigger('change');
            });

            $("#input-b7-dni-repre-legal").fileinput({
                language: 'es',
                maxFileCount: 1,
                showPreview: false,
                mainClass: "input-group-sm",
                uploadUrl: $.solver.services.api + "/Service/Upload/New",
                uploadAsync: true,
            });
            $("#input-b7-dni-repre-legal").on("filebatchselected", function (event, files) {
                $("#input-b7-dni-repre-legal").fileinput("upload");
            });
            $("#input-b7-dni-repre-legal").on("fileuploaded", function (event, data, previewId, index) {
                $('input[name=C_ARCHIVO_DNI_REPRESENTANTE_LEGAL]').val(data.response.token);
                $("#input-b7-dni-repre-legal").fileinput('clear');
                $('#C_ARCHIVO_DNI_REPRESENTANTE_LEGAL').trigger('change');
            });

            $("#input-b7-copia-literal").fileinput({
                language: 'es',
                maxFileCount: 1,
                showPreview: false,
                mainClass: "input-group-sm",
                uploadUrl: $.solver.services.api + "/Service/Upload/New",
                uploadAsync: true,
            });
            $("#input-b7-copia-literal").on("filebatchselected", function (event, files) {
                $("#input-b7-copia-literal").fileinput("upload");
            });
            $("#input-b7-copia-literal").on("fileuploaded", function (event, data, previewId, index) {
                $('input[name=C_ARCHIVO_COPIA_LITERAL]').val(data.response.token);
                $("#input-b7-copia-literal").fileinput('clear');
                $('#C_ARCHIVO_COPIA_LITERAL').trigger('change');
            });
        };
        var fnCrearCargaArchivoContable = function () {
            $("#input-b7-reg-ventas").fileinput({
                language: 'es',
                maxFileCount: 1,
                showPreview: false,
                mainClass: "input-group-sm",
                uploadUrl: $.solver.services.api + "/Service/Upload/New",
                uploadAsync: true,
            });
            $("#input-b7-reg-ventas").on("filebatchselected", function (event, files) {
                $("#input-b7-reg-ventas").fileinput("upload");
            });
            $("#input-b7-reg-ventas").on("fileuploaded", function (event, data, previewId, index) {
                $('input[name=C_ARCHIVO_REGISTRO_VET]').val(data.response.token);
                $("#input-b7-reg-ventas").fileinput('clear');
                $('#C_ARCHIVO_REGISTRO_VET').trigger('change');
            });

            $("#input-b7-reg-compras").fileinput({
                language: 'es',
                maxFileCount: 1,
                showPreview: false,
                mainClass: "input-group-sm",
                uploadUrl: $.solver.services.api + "/Service/Upload/New",
                uploadAsync: true,
            });
            $("#input-b7-reg-compras").on("filebatchselected", function (event, files) {
                $("#input-b7-reg-compras").fileinput("upload");
            });
            $("#input-b7-reg-compras").on("fileuploaded", function (event, data, previewId, index) {
                $('input[name=C_ARCHIVO_REGISTRO_COM]').val(data.response.token);
                $("#input-b7-reg-compras").fileinput('clear');
                $('#C_ARCHIVO_REGISTRO_COM').trigger('change');
            });
        };
        var fnCrearCargaArchivoComercial = function () {
            $("#input-b7-reg-prod-vet").fileinput({
                language: 'es',
                maxFileCount: 1,
                showPreview: false,
                mainClass: "input-group-sm",
                uploadUrl: $.solver.services.api + "/Service/Upload/New",
                uploadAsync: true,
            });
            $("#input-b7-reg-prod-vet").on("filebatchselected", function (event, files) {
                $("#input-b7-reg-prod-vet").fileinput("upload");
            });
            $("#input-b7-reg-prod-vet").on("fileuploaded", function (event, data, previewId, index) {
                $('input[name=C_ARCHIVO_REGISTRO_PROD_SERV]').val(data.response.token);
                $("#input-b7-reg-prod-vet").fileinput('clear');
                $('#C_ARCHIVO_REGISTRO_PROD_SERV').trigger('change');
            });

            $("#input-b7-reg-cliente").fileinput({
                language: 'es',
                maxFileCount: 1,
                showPreview: false,
                mainClass: "input-group-sm",
                uploadUrl: $.solver.services.api + "/Service/Upload/New",
                uploadAsync: true,
            });
            $("#input-b7-reg-cliente").on("filebatchselected", function (event, files) {
                $("#input-b7-reg-cliente").fileinput("upload");
            });
            $("#input-b7-reg-cliente").on("fileuploaded", function (event, data, previewId, index) {
                $('input[name=C_ARCHIVO_REGISTRO_CLI]').val(data.response.token);
                $("#input-b7-reg-cliente").fileinput('clear');
                $('#C_ARCHIVO_REGISTRO_CLI').trigger('change');
            });

            $("#input-b7-reg-proveedor").fileinput({
                language: 'es',
                maxFileCount: 1,
                showPreview: false,
                mainClass: "input-group-sm",
                uploadUrl: $.solver.services.api + "/Service/Upload/New",
                uploadAsync: true,
            });
            $("#input-b7-reg-proveedor").on("filebatchselected", function (event, files) {
                $("#input-b7-reg-proveedor").fileinput("upload");
            });
            $("#input-b7-reg-proveedor").on("fileuploaded", function (event, data, previewId, index) {
                $('input[name=C_ARCHIVO_REGISTRO_PRO]').val(data.response.token);
                $("#input-b7-reg-proveedor").fileinput('clear');
                $('#C_ARCHIVO_REGISTRO_PRO').trigger('change');
            });
        };
        var fnCrearCargaArchivoFacturador = function () {
            $("#input-b7-cons-asoc-pse-solunet").fileinput({
                language: 'es',
                maxFileCount: 1,
                showPreview: false,
                mainClass: "input-group-sm",
                uploadUrl: $.solver.services.api + "/Service/Upload/New",
                uploadAsync: true,
            });
            $("#input-b7-cons-asoc-pse-solunet").on("filebatchselected", function (event, files) {
                $("#input-b7-cons-asoc-pse-solunet").fileinput("upload");
            });
            $("#input-b7-cons-asoc-pse-solunet").on("fileuploaded", function (event, data, previewId, index) {
                $('input[name=C_ARCHIVO_CONSTANCIA_ASOC_PSE_SOLUNET]').val(data.response.token);
                $("#input-b7-cons-asoc-pse-solunet").fileinput('clear');
                $('#C_ARCHIVO_CONSTANCIA_ASOC_PSE_SOLUNET').trigger('change');
            });
        };
        var fnCrearCargaArchivoFte = function () {
            $("#input-b7-fte").fileinput({
                language: 'es',
                maxFileCount: 1,
                showPreview: false,
                mainClass: "input-group-sm",
                allowedFileExtensions: ['png', 'jpg', 'jfif'],
                uploadUrl: $.solver.services.files + "/Service/Upload2/App",
                uploadAsync: true,
            });
            $("#input-b7-fte").on("filebatchselected", function (event, files) {
                $("#input-b7-fte").fileinput("upload");
            });
            $("#input-b7-fte").on("fileuploaded", function (event, data, previewId, index) {
                $('#C_ARCHIVO_LOGO_FTE').val(data.response.token);
                fnObtenerImagen('C_ARCHIVO_LOGO_FTE', 'imgfte');
                $("#input-b7-fte").fileinput('clear');
            });
        };
        var fnCrearCargaArchivoPfx = function () {
            $("#input-b6").fileinput({
                language: 'es',
                maxFileCount: 1,
                showPreview: false,
                mainClass: "input-group-sm",
                uploadUrl: $.solver.services.api + "/Service/Upload/New",
                uploadAsync: true,
            });
            $("#input-b6").on("filebatchselected", function (event, files) {
                $("#input-b6").fileinput("upload");
            });
            $("#input-b6").on("fileuploaded", function (event, data, previewId, index) {
                $('#C_ARCHIVO').val(data.response.token);
                $("#input-b6").fileinput('clear');
                $('#C_ARCHIVO').trigger('change');
            });
        };
        var buscarPorRuc = function () {
            $.GetQuery({
                query: ['q_ventas_mantenimiento_clientes_obtenerpadron_ruc'],
                items: [{ RUC: function () { return $('#NRO_DOCUMENTO').val(); } }],
                onError: function () {
                    $.CloseStatusBar();
                    $.ShowError({ error: error });
                },
                onReady: function (result) {
                    $.CloseStatusBar();
                    const data = result[0]
                    $('#TIPO_DOC_FTE').val('RUC');
                    $('#NRO_DOCUMENTO_FTE').val($('#NRO_DOCUMENTO').val());
                    $('#RAZON_SOCIAL_FTE').val(data['RAZON_SOCIAL']);
                    $('#NOMBRE_COMERCIAL_FTE').val(data['RAZON_SOCIAL']);
                    $('#DOMICILIO_FISCAL_FTE').val(data['DIRECCION']);
                    $('#UBIGEO').val(data['UBIGEO']);
                    const codDepartamento = data['UBIGEO'].substring(0, 2);
                    const codProvincia = data['UBIGEO'].substring(0, 4);
                    const codDistrito = data['UBIGEO'].substring(0, 6);
                    $('#DEPARTAMENTO').val(codDepartamento);
                    $('#PROVINCIA').attr('data-query', 'gbl_obtenerprovincias')
                    $('#PROVINCIA').attr('data-value', 'CODIGO_PARAMETRO')
                    $('#PROVINCIA').attr('data-field', 'DESCRIPCION_PARAMETRO')
                    $('#PROVINCIA').attr('data-COD', codDepartamento);
                    $('#PROVINCIA').FieldLoadRemote({
                        onReady: function () {
                            $('#PROVINCIA').val(codProvincia);
                            $('#DISTRITO').attr('data-query', 'gbl_obtenerdistritos')
                            $('#DISTRITO').attr('data-value', 'CODIGO_PARAMETRO')
                            $('#DISTRITO').attr('data-field', 'DESCRIPCION_PARAMETRO')
                            $('#DISTRITO').attr('data-COD', codProvincia);
                            $('#DISTRITO').FieldLoadRemote({
                                onReady: function () {
                                    $('#DISTRITO').val(codDistrito);
                                }
                            });
                        }
                    });

                    $('#CLAVE_PFX').val(data.CLAVE_PFX);
                    $('#USUARIO_SUNAT').val(data.USUARIO_SUNAT);
                    $('#CLAVE_SUNAT').val(data.CLAVE_SUNAT);
                    $('#URL_SERVICIO_SUNAT').val(data.URL_SERVICIO_SUNAT);

                }
            });
        };
        var fnObtenerTabs = function () {
            $.GetQuery({
                query: ['q_administracion_mantenimiento_clienteregistro_servicios'],
                items: [{
                    C_EMPRESA: function () {
                        return $('#C_EMPRESA').val();
                    },
                    BUSCAR: function () {
                        return '';
                    }
                }],
                onReady: function (result) {
                    //$('#divchk').html('')
                    //var html = '';
                    //$.each(result, function (i, item) {
                    //    html += `   <div class="form-check">
                    //                    <input class="form-check-input" type="checkbox" id="MOD_${i}" data-id="${item['C_ROL']}" data-desc="${item['DESCRIPCION']}">
                    //                    <label class="form-check-label" for="MOD_${i}">
                    //                        ${item['DESCRIPCION']}
                    //                    </label>
                    //                </div>`
                    //});
                    //$('#divchk').html(html);
                    //if ($('#SERVICIOS').val() != '') {
                    //    var c_roles = $('#SERVICIOS').val().split('|')

                    $.each(result, function (i, rol) {
                        //var rol = result.filter(x => x['C_ROL'] == c_rol)
                        //var desc = rol[0]['DESCRIPCION'];
                        $.each($('#myTabRoles').children(), function (i, tabs) {
                            let tabsServicios = $.trim($(tabs).text());
                            if (rol.DESCRIPCION == tabsServicios) {
                                // hacemos el check
                                //$.each($($('#divchk').children()), function (i, v) {
                                //    if (desc == $($(v).find('input:checkbox')[0]).attr('data-desc')) {
                                //        $($(v).find('input:checkbox')[0]).attr('checked', 'checked')
                                //    }
                                //});
                                // termina el check
                                $(tabs).show();
                            }
                        });
                    });
                    //}
                    //$.each(result, function (i, item) {
                    //    $(`#MOD_${i}`).change(function () {
                    //        var des = item['DESCRIPCION']
                    //        var tabs = $('#myTabRoles').children();
                    //        $.each(tabs, function (x, tab) {
                    //            var _des = $.trim($(tab).text());
                    //            if (_des == des) {
                    //                if ($(`#MOD_${i}`).is(':checked')) {
                    //                    $(tab).show();
                    //                    fnVerificarTabs();
                    //                }
                    //                else {
                    //                    $(tab).hide();
                    //                }
                    //            }
                    //        });
                    //    });
                    //});
                    fnVerificarTabs();
                }
            })
        };
        var fnVerificarTabs = function () {
            if ($('#facturacion-tab').is(":hidden") == false) {
                //$('#FLAG_MOD_FACTURACION').val('*')
                if ($('#ID_EMISOR').val() == '') {
                    buscarPorRuc();
                }
                else {
                    $.GetQuery({
                        connectTo: 'SRVSQL_FTE',
                        query: ['q_cuenta_mantenimiento_clientesregistro_obtenerinfoemisor'],
                        items: [{
                            ID_EMISOR: function () { return $('#ID_EMISOR').val(); },
                            RUC: function () { return $('#NRO_DOCUMENTO').val(); }
                        }],
                        onError: function () {
                            $.CloseStatusBar();
                            $.ShowError({ error: error });
                        },
                        onReady: function (result) {
                            $.CloseStatusBar();
                            if (result.length > 0) {
                                const data = result[0];
                                $('#ID_EMISOR').val(data['ID_EMISOR']);
                                $('#TIPO_DOC_FTE').val('RUC');
                                $('#NRO_DOCUMENTO_FTE').val(data['NRO_DOC_IDENTIDAD']);
                                $('#RAZON_SOCIAL_FTE').val(data['RAZON_SOCIAL']);
                                $('#NOMBRE_COMERCIAL_FTE').val(data['NOMBRE_COMERCIAL']);
                                $('#DOMICILIO_FISCAL_FTE').val(data['DOMICILIO_FISCAL']);
                                $('#PATH_PFX_FTE').val(data['PATHPFX']);
                                $('#CLAVE_PFX').val(data['CLAVEPFX']);
                                $('#USUARIO_SUNAT').val(data['USUARIOSUNAT']);
                                $('#CLAVE_SUNAT').val(data['CLAVESUNAT']);
                                $('#EMAIL_ENVIO').val(data['EMAILENVIO']);
                                $('#NOMBRE_ENVIO').val(data['NOMBREENVIO']);
                                $('#URL_SERVICIO_SUNAT').val(data['URL_SERVICIO_SUNAT']);
                                $('#C_ARCHIVO_LOGO_FTE').val(data['C_ARCHIVO_LOGO']);

                                $('#FORMATO_FT_BT').val(data['FORMATO_FT_BT']);
                                $('#FORMATO_NC_ND').val(data['FORMATO_NC_ND']);
                                $('#FORMATO_NO_DOMICILIADO').val(data['FORMATO_NO_DOMICILIADO']);
                                $('#FORMATO_NO_DOMICILIADO_NC_ND').val(data['FORMATO_NO_DOMICILIADO_NC_ND']);

                                $('#CORREOS_EN_COPIA').tagsinput('add', data['CORREOS_EN_COPIA'], { preventPost: true });

                                fnObtenerImagen('C_ARCHIVO_LOGO_FTE', 'imgfte');

                                $('#UBIGEO').val(data['DOMICILIO_FISCAL_UBIGEO']);

                                if (data['DOMICILIO_FISCAL_DEPARTAMENTO'] != null && data['DOMICILIO_FISCAL_DEPARTAMENTO'] != '') {
                                    var codDepartamento = $('#DEPARTAMENTO')[0].args.data.filter(x => x['DESCRIPCION_PARAMETRO'] == data['DOMICILIO_FISCAL_DEPARTAMENTO'])[0]['CODIGO_PARAMETRO'];
                                    $('#DEPARTAMENTO').val(codDepartamento)
                                    $('#PROVINCIA').attr('data-query', 'gbl_obtenerprovincias')
                                    $('#PROVINCIA').attr('data-value', 'CODIGO_PARAMETRO')
                                    $('#PROVINCIA').attr('data-field', 'DESCRIPCION_PARAMETRO')
                                    $('#PROVINCIA').attr('data-COD', $('#DEPARTAMENTO').val());
                                    $('#PROVINCIA').FieldLoadRemote({
                                        onReady: function () {
                                            if (data['DOMICILIO_FISCAL_PROVINCIA'] != null && data['DOMICILIO_FISCAL_PROVINCIA'] != '') {
                                                var codProvincia = $('#PROVINCIA')[0].args.data.filter(x => x['DESCRIPCION_PARAMETRO'] == data['DOMICILIO_FISCAL_PROVINCIA'])[0]['CODIGO_PARAMETRO'];
                                                $('#PROVINCIA').val(codProvincia)
                                                $('#DISTRITO').attr('data-query', 'gbl_obtenerdistritos')
                                                $('#DISTRITO').attr('data-value', 'CODIGO_PARAMETRO')
                                                $('#DISTRITO').attr('data-field', 'DESCRIPCION_PARAMETRO')
                                                $('#DISTRITO').attr('data-COD', codProvincia);
                                                $('#DISTRITO').FieldLoadRemote({
                                                    onReady: function () {
                                                        if (data['DOMICILIO_FISCAL_DISTRITO'] != null && data['DOMICILIO_FISCAL_DISTRITO'] != '') {
                                                            var codDistrito = $('#DISTRITO')[0].args.data.filter(x => x['DESCRIPCION_PARAMETRO'] == data['DOMICILIO_FISCAL_DISTRITO'])[0]['CODIGO_PARAMETRO']
                                                            $('#DISTRITO').val(codDistrito);
                                                        }
                                                    }
                                                });
                                            }
                                        }
                                    });
                                }
                            }
                            else {
                                buscarPorRuc();
                            }
                        }
                    });
                }
            }
        };
        var fnGuardarCliente = function () {
            //var checkboxes = $('#divchk').children();
            //var servicios = [];
            //$.each(checkboxes, function (i, checkbox) {
            //    var check = $($(checkbox).find('input:checkbox')[0]);
            //    if (check.is(':checked')) {
            //        var id = check.attr('data-id');
            //        servicios.push(id);
            //    }
            //});

            //$('#SERVICIOS').val(servicios.join('|'));

            if ($('#facturacion-tab').is(":hidden") == false) {
                const id_emisor = $('#ID_EMISOR').val() == '0' ? '' : $('#ID_EMISOR').val();
                var objectEmisor = {
                    ID_EMISOR: id_emisor,
                    ID_TIPO_DOC_IDENTIDAD: 1111,
                    NRO_DOC_IDENTIDAD: $('#NRO_DOCUMENTO_FTE').val(),
                    RAZON_SOCIAL: $('#RAZON_SOCIAL_FTE').val(),
                    NOMBRE_COMERCIAL: $('#NOMBRE_COMERCIAL_FTE').val(),
                    DOMICILIO_FISCAL: $('#DOMICILIO_FISCAL_FTE').val(),
                    DOMICILIO_FISCAL_UBIGEO: $('#UBIGEO').val(),
                    DOMICILIO_FISCAL_DEPARTAMENTO: $('#DEPARTAMENTO option:selected').text(),
                    DOMICILIO_FISCAL_PROVINCIA: $('#PROVINCIA option:selected').text(),
                    DOMICILIO_FISCAL_DISTRITO: $('#DISTRITO option:selected').text(),
                    DOMICILIO_FISCAL_PAIS: 'PE',
                    PATHPFX: $('#PATH_PFX_FTE').val(),
                    CLAVEPFX: $('#CLAVE_PFX').val(),
                    USUARIOSUNAT: $('#USUARIO_SUNAT').val(),
                    CLAVESUNAT: $('#CLAVE_SUNAT').val(),
                    EMAILENVIO: $('#EMAIL_ENVIO').val(),
                    NOMBREENVIO: $('#NOMBRE_ENVIO').val(),
                    URL_SERVICIO_SUNAT: $('#URL_SERVICIO_SUNAT').val(),
                    C_ARCHIVO_LOGO: $('#C_ARCHIVO_LOGO_FTE').val(),
                    FORMATO_FT_BT: $('#FORMATO_FT_BT').val(),
                    FORMATO_NC_ND: $('#FORMATO_NC_ND').val(),
                    FORMATO_NO_DOMICILIADO: $('#FORMATO_NO_DOMICILIADO').val(),
                    FORMATO_NO_DOMICILIADO_NC_ND: $('#FORMATO_NO_DOMICILIADO_NC_ND').val(),
                    CORREOS_EN_COPIA: $('#CORREOS_EN_COPIA').val()
                }
                var _type = 1;
                if (id_emisor != '' && id_emisor != '0') _type = 2;
                const extraEmisor = {
                    ID_EMISOR: {
                        action: {
                            name: 'GetNextId',
                            args: $.ConvertObjectToArr({})
                        }
                    }
                };
                var tokenEmisor = $.AddPetition({
                    table: 'EMISOR',
                    condition: `ID_EMISOR = ${id_emisor}`,
                    type: _type,
                    items: $.ConvertObjectToArr(objectEmisor, extraEmisor)
                });
                $.SendPetition({
                    connectToLogin: 'S',
                    connectTo: 'SRVSQL_FTE',
                    onReady: function (result) {
                        $('#ID_EMISOR').val(result[tokenEmisor].items.ID_EMISOR);

                        if ($('#C_ARCHIVO').val() != '') {
                            fnValidarPfx($('#C_ARCHIVO').val(), $('#C_EMPRESA').val(), $('#CLAVE').val());
                        }
                        else {
                            let usuarios = $(table01).jqxGrid('getrows');
                            let contador = 0;
                            $.each(usuarios, function (i, v) {
                                if (v.FLAG_PRINCIPAL == true || v.FLAG_PRINCIPAL == 'true') {
                                    contador++;
                                }
                            });
                            if (contador > 0) {
                                $('form[name=frmRegistroEmpresa]').submit();
                            }
                            else {
                                alertify.alert('¡Debe tener un usuario principal!');
                            }
                        }
                    },
                    onError: function (_error) {
                        $.ShowError({ error: _error });
                    }
                });
            }
            else {
                if ($('#C_ARCHIVO').val() != '') {
                    fnValidarPfx($('#C_ARCHIVO').val(), $('#C_EMPRESA').val(), $('#CLAVE').val());
                }
                else {
                    let usuarios = $(table01).jqxGrid('getrows');
                    let contador = 0;
                    $.each(usuarios, function (i, v) {
                        if (v.FLAG_PRINCIPAL == true || v.FLAG_PRINCIPAL == 'true') {
                            contador++;
                        }
                    });
                    if (contador > 0) {
                        $('form[name=frmRegistroEmpresa]').submit();
                    }
                    else {
                        alertify.alert('¡Debe tener un usuario principal!');
                    }
                }
            }
        };
        const fnObtenerImagen = function (c_archivo, img) {
            if ($('#' + c_archivo).val() != '') {
                $('#' + img).attr('src', '');
                $('#' + img).attr('src', $.solver.services.files + 'Service/ViewFile2/' + $('#' + c_archivo).val() + '/App')
                $('#' + img).css({ 'display': 'block' });
            }
            else {
                $('#' + img).css({ 'display': 'none' });
            }
        };
        var condition = $('#CONDITION').val();
        var _type = 1;

        if (condition.length != 0) _type = 2;

        const validarTabUsuario = function () {
            if ($('form[name=frmRegistroUsuarios] #CHECK_PRINCIPAL').is(':checked')) {
                $('form[name=frmRegistroUsuarios] #FLAG_PRINCIPAL').val(true)
            }
            else {
                $('form[name=frmRegistroUsuarios] #FLAG_PRINCIPAL').val(false);
            }

            if ($('form[name=frmRegistroUsuarios] #CHECK_APP_MOVIL_SOLVER').is(':checked')) {
                $('form[name=frmRegistroUsuarios] #FLAG_ACCESO_APP_MOVIL_SOLVER').val(true)
            }
            else {
                $('form[name=frmRegistroUsuarios] #FLAG_ACCESO_APP_MOVIL_SOLVER').val(false);
            }

            if ($('form[name=frmRegistroUsuarios] #CHECK_CREAR_USUARIOS').is(':checked')) {
                $('form[name=frmRegistroUsuarios] #FLAG_CREAR_USUARIO').val(true)
            }
            else {
                $('form[name=frmRegistroUsuarios] #FLAG_CREAR_USUARIO').val(false);
            }
        }
        const fnCrearTabla = function () {
            const fnClassEditer = function (row, datafield, value, rowdata) {
                if (rowdata.MODO == 1 || rowdata.MODO == 2) return 'editedRow';
            };
            $(table01).CreateGrid({
                query: 'adm_mantenimiento_clienteregistro_reg_usuarios',
                items: {
                    BUSCAR: function () {
                        return $('#_buscar').val() || '';
                    },
                    C_EMPRESA: function () {
                        return $('form[name=frmRegistroEmpresa] #C_EMPRESA').val();
                    }
                },
                hiddens: ['C_EMPRESA', 'CONTRASENA', 'MODO'],
                columns: {
                    C_USUARIO: {
                        text: 'Usuario',
                        width: '120',
                    },
                    NOMBRE: {
                        text: 'Nombre de usuario',
                        width: '300'
                    },
                    EMAIL: {
                        text: 'Correo electrónico',
                        width: '200'
                    },
                    TELEFONO: {
                        text: 'Teléfono',
                        width: '100'
                    },
                    C_USUARIO_REGISTRA: {
                        text: 'Usu. modificación',
                        width: '120',
                        cellsAlign: 'center'
                    },
                    FECHA_MODIFICACION: {
                        text: 'Fec. modificación',
                        width: '120',
                        cellsAlign: 'center'
                    },
                    FLAG_PRINCIPAL: {
                        text: 'Principal',
                        columntype: 'checkbox',
                        width: 60
                    },
                    FLAG_ACCESO_APP_MOVIL_SOLVER: {
                        text: 'Móvil',
                        columntype: 'checkbox',
                        width: 60
                    },
                    FLAG_CREAR_USUARIO: {
                        text: 'Crear usu.',
                        columntype: 'checkbox',
                        width: 60
                    },
                    FLAG_ESTADO: {
                        text: 'Estado',
                        width: '100',
                        align: 'center',
                        cellsalign: 'center',
                        cellsRenderer: function (row, column, value, rowData) {
                            if (value == '*') return '<span class="text-extra" style="color:green;"><i class="fa fa-check-circle" aria-hidden="true"></i> ACTIVO</span>';
                            if (value == '&') return '<span class="text-extra" style="color:red;"><i class="fa fa-exclamation-circle" aria-hidden="true"></i> INACTIVO</span>';
                        }
                    },
                },
                config: {
                    virtualmode: false,
                    height: 500,
                    pageSize: 999999,
                    columnsresize: true,
                    editable: false,
                    sortable: false,
                    pageable: false
                }
            });
            $(table01).on('bindingcomplete', function () {
                $(table01).unbind("cellvaluechanged");
                $(table01).on("cellvaluechanged", function (event) {
                    if (event.args.newvalue != event.args.oldvalue) {
                        var row = event.args.rowindex;
                        if ($(table01).jqxGrid('getrows')[row].MODO != 1) $(table01).jqxGrid('getrows')[row].MODO = 2;
                    }
                });
            });

            $(table02).CreateTable({
                serverProcessing: true,
                sortable: true,
                pageSize: 999,
                pageable: true,
                pagerButtonsCount: 10,
                columnsResize: true,
                width: '100%',
                query: 'q_administracion_mantenimiento_clienteregistro_servicios',
                items: {
                    C_EMPRESA: function () {
                        return $('form[name=frmRegistroEmpresa] #C_EMPRESA').val();
                    },
                    BUSCAR: function () {
                        return $('#_buscar_serv').val() || '';
                    }
                },
                hiddens: ['C_EMPRESA', 'C_ROL', 'MODO'],
                columns: {
                    NOMBRE: { text: 'Nombre', dataField: 'NOMBRE', width: '300', align: 'center', cellsalign: 'center' },
                    DESCRIPCION: { text: 'Descripción', dataField: 'DESCRIPCION', width: '200', align: 'center', cellsalign: 'center' },
                    FEC_INICIO: { text: 'Fec. inicio', dataField: 'FEC_INICIO', width: '100', align: 'center', cellsalign: 'center' },
                    FEC_FIN: { text: 'Fec. fin', dataField: 'FEC_FIN', width: '100', align: 'center', cellsalign: 'center' },
                    C_USUARIO_REGISTRA: { text: 'Usu. modificación', dataField: 'C_USUARIO_REGISTRA', width: '100', align: 'center', cellsalign: 'center' },
                    FECHA_MODIFICACION: { text: 'Fec. modificación', dataField: 'FECHA_MODIFICACION', width: '100', align: 'center', cellsalign: 'center' },
                    IND_ESTADO: {
                        text: 'Estado', dataField: 'IND_ESTADO', width: '100', align: 'center', cellsalign: 'center', cellsRenderer: function (row, column, value, rowData) {
                            if (value == '*') return '<span style="color:blue;" class="text-extra"><i class="fa fa-check-circle" aria-hidden="true"></i> ACTIVO</span>';
                            if (value == '&') return '<span style="color:red;" class="text-extra"><i class="fa fa-exclamation-circle" aria-hidden="true"></i> INACTIVO</span>';
                        }
                    },
                    ACCION: {
                        text: 'Acción', width: '150', align: 'center', cellsalign: 'center', cellsRenderer: function (row, column, value, rowData) {
                            if (editable) {
                                if (rowData.MODO != 'Eliminado') {
                                    return '<a href="#" data-index="' + row + '" class="delete"><i class="fa fa-pencil-square" aria-hidden="true"></i> Quitar</a>';
                                } else {
                                    return "<span style='color:red;' style='No se eliminará hasta que guarde.' class='text-extra'><i class='fa fa-exclamation-triangle' aria-hidden='true'></i> Por Eliminar</span>"
                                }
                            }
                            else {
                                return '';
                            }
                        }
                    }
                },
                config: {
                    height: 700,
                    rendered: function () {
                        $('a.delete').unbind('click');
                        $('a.delete').click(function (e) {

                            var _index = $(this).attr('data-index');
                            var _rows = $(table02).jqxDataTable('getRows');

                            _rows[_index].MODO = 'Eliminado';
                            $(table02).jqxDataTable('endUpdate');

                            require(["alertify"], function (alertify) {
                                alertify.notify('Registro Eliminado....', 'success', 5, function () { });
                            });

                            e.preventDefault();

                        });
                    }
                }
            });
        }
        var GetFormEditer = function (url, condition, usuario) {

            var _type = 1;
            var _condition = condition || '';
            var _title = "Nuevo Usuario";
            if (_condition.length != 0) {
                _title = "Editar Usuario";
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

                    $(object).find('form[name=frmRegistroUsuarios]').ValidForm({
                        type: -1,
                        onDone: function (form, controls) {
                            $(object).find('#C_EMPRESA_USUARIO').val($('#C_EMPRESA').val());
                            $(object).find('#C_USUARIO_REGISTRA').val(usu);

                            if (usuario.length != 0) {
                                $(object).find('form[name=frmRegistroUsuarios] #C_EMPRESA_USUARIO').val(usuario.C_EMPRESA);
                                $(object).find('form[name=frmRegistroUsuarios] #C_USUARIO').val(usuario.C_USUARIO);
                                $(object).find('form[name=frmRegistroUsuarios] #NOMBRE').val(usuario.NOMBRE);
                                $(object).find('form[name=frmRegistroUsuarios] #TELEFONO').val(usuario.TELEFONO);
                                $(object).find('form[name=frmRegistroUsuarios] #EMAIL').val(usuario.EMAIL);
                                $(object).find('form[name=frmRegistroUsuarios] #PASSWORD').val(usuario.CONTRASENA);
                                $(object).find('form[name=frmRegistroUsuarios] #FLAG_ESTADO').val(usuario.FLAG_ESTADO);
                                $(object).find('form[name=frmRegistroUsuarios] #FLAG_PRINCIPAL').val(usuario.FLAG_PRINCIPAL);
                                $(object).find('form[name=frmRegistroUsuarios] #FLAG_ACCESO_APP_MOVIL_SOLVER').val(usuario.FLAG_ACCESO_APP_MOVIL_SOLVER);
                            }

                            $("#CHECK_PRINCIPAL").prop("checked", usuario.FLAG_PRINCIPAL == 'false' || usuario.FLAG_PRINCIPAL == undefined || usuario.FLAG_PRINCIPAL == false ? false : true);
                            $("#CHECK_APP_MOVIL_SOLVER").prop("checked", usuario.FLAG_ACCESO_APP_MOVIL_SOLVER == 'false' || usuario.FLAG_ACCESO_APP_MOVIL_SOLVER == undefined || usuario.FLAG_ACCESO_APP_MOVIL_SOLVER == false ? false : true);
                            $("#CHECK_CREAR_USUARIOS").prop("checked", usuario.FLAG_CREAR_USUARIO == 'false' || usuario.FLAG_CREAR_USUARIO == undefined || usuario.FLAG_CREAR_USUARIO == false ? false : true);

                            let principal = true;
                            $('#CHECK_PRINCIPAL').change(function () {

                                let usuarios = $(table01).jqxGrid('getrows');
                                let contador = 0;
                                $.each(usuarios, function (i, v) {
                                    if (v.FLAG_PRINCIPAL == true || v.FLAG_PRINCIPAL == 'true') {
                                        contador++;
                                    }
                                });

                                if (contador > 0) {
                                    alertify.confirm('Mensaje del sistema', '¿Desea cambiar el principal?',
                                        function () {
                                            $.each(usuarios, function (i, v) {
                                                v.FLAG_PRINCIPAL = false;
                                                if (v.MODO == undefined || v.MODO == '') {
                                                    v.MODO = 2;
                                                    principal = false;
                                                }
                                            });
                                            $(table01).jqxGrid('refresh');
                                        },
                                        function () {
                                            $("#CHECK_PRINCIPAL").prop("checked", false);
                                            alertify.error('Cambio cancelado');
                                        })
                                        .set('labels', { ok: 'Si', cancel: 'No' }).set('defaultFocus', 'ok').set('closable', false);
                                }

                                validarTabUsuario();
                            });
                            $('#CHECK_APP_MOVIL_SOLVER').change(function () {
                                validarTabUsuario();
                            });
                            $('#CHECK_CREAR_USUARIOS').change(function () {
                                validarTabUsuario();
                            });

                            validarTabUsuario();

                            $(object).find('#btnGuardarUsuario').click(function () {

                                let usuarios = $(table01).jqxGrid('getrows');
                                let contador = 0;
                                $.each(usuarios, function (i, v) {
                                    if (v.FLAG_PRINCIPAL == true || v.FLAG_PRINCIPAL == 'true') {
                                        contador++;
                                    }
                                });
                                if (contador > 0) {
                                    if (principal == false) {
                                        if ($('#FLAG_PRINCIPAL').val() == 'true' || $('#FLAG_PRINCIPAL').val() == true) {
                                            $.GetQuery({
                                                query: ['adm_mantenimiento_clienteregistro_validar_duplicado_usuario'],
                                                items: [{
                                                    USUARIO: function () {
                                                        return $('form[name=frmRegistroUsuarios] #C_USUARIO').val();
                                                    }
                                                }],
                                                onError: function (error) { },
                                                onReady: function (result) {
                                                    if (result.length > 0) {
                                                        if (validador == 'Editar') {
                                                            var index = $(table01).jqxGrid('getselectedrowindex');
                                                            var row = $(table01).jqxGrid('getRows')[index];
                                                            if (row.MODO != 1) {
                                                                row.MODO = 2;
                                                            }
                                                            row.C_EMPRESA = $(object).find('form[name=frmRegistroUsuarios] #C_EMPRESA_USUARIO').val();
                                                            row.C_USUARIO = $(object).find('form[name=frmRegistroUsuarios] #C_USUARIO').val();
                                                            row.NOMBRE = $(object).find('form[name=frmRegistroUsuarios] #NOMBRE').val();
                                                            row.TELEFONO = $(object).find('form[name=frmRegistroUsuarios] #TELEFONO').val();
                                                            row.EMAIL = $(object).find('form[name=frmRegistroUsuarios] #EMAIL').val();
                                                            row.CONTRASENA = $(object).find('form[name=frmRegistroUsuarios] #PASSWORD').val();
                                                            row.FLAG_ESTADO = $(object).find('form[name=frmRegistroUsuarios] #FLAG_ESTADO').val();
                                                            row.C_USUARIO_REGISTRA = $(object).find('form[name=frmRegistroUsuarios] #C_USUARIO_REGISTRA').val();
                                                            row.FECHA_MODIFICACION = moment(new Date()).format("DD/MM/YYYY");
                                                            row.FLAG_PRINCIPAL = $(object).find('form[name=frmRegistroUsuarios] #FLAG_PRINCIPAL').val();
                                                            row.FLAG_ACCESO_APP_MOVIL_SOLVER = $(object).find('form[name=frmRegistroUsuarios] #FLAG_ACCESO_APP_MOVIL_SOLVER').val();
                                                            row.FLAG_CREAR_USUARIO = $(object).find('form[name=frmRegistroUsuarios] #FLAG_CREAR_USUARIO').val();

                                                            $(table01).jqxGrid('refresh');
                                                            bootbox.hideAll();
                                                        }
                                                        else {
                                                            alertify.alert('El usuario ' + result[0].NOMBRES + ' ya está registrado.');
                                                        }
                                                    }
                                                    else {
                                                        const fila = $(table01).jqxGrid('getrows').length;

                                                        if (usuario.length != 0) {
                                                            var index = $(table01).jqxGrid('getselectedrowindex');
                                                            var row = $(table01).jqxGrid('getRows')[index];
                                                            if (row.MODO != 1) {
                                                                row.MODO = 2;
                                                            }
                                                            row.C_EMPRESA = $(object).find('form[name=frmRegistroUsuarios] #C_EMPRESA_USUARIO').val();
                                                            row.C_USUARIO = $(object).find('form[name=frmRegistroUsuarios] #C_USUARIO').val();
                                                            row.NOMBRE = $(object).find('form[name=frmRegistroUsuarios] #NOMBRE').val();
                                                            row.TELEFONO = $(object).find('form[name=frmRegistroUsuarios] #TELEFONO').val();
                                                            row.EMAIL = $(object).find('form[name=frmRegistroUsuarios] #EMAIL').val();
                                                            row.CONTRASENA = $(object).find('form[name=frmRegistroUsuarios] #PASSWORD').val();
                                                            row.FLAG_ESTADO = $(object).find('form[name=frmRegistroUsuarios] #FLAG_ESTADO').val();
                                                            row.C_USUARIO_REGISTRA = $(object).find('form[name=frmRegistroUsuarios] #C_USUARIO_REGISTRA').val();
                                                            row.FECHA_MODIFICACION = moment(new Date()).format("DD/MM/YYYY");
                                                            row.FLAG_PRINCIPAL = $(object).find('form[name=frmRegistroUsuarios] #FLAG_PRINCIPAL').val();
                                                            row.FLAG_ACCESO_APP_MOVIL_SOLVER = $(object).find('form[name=frmRegistroUsuarios] #FLAG_ACCESO_APP_MOVIL_SOLVER').val();
                                                            row.FLAG_CREAR_USUARIO = $(object).find('form[name=frmRegistroUsuarios] #FLAG_CREAR_USUARIO').val();

                                                            $(table01).jqxGrid('refresh');
                                                            bootbox.hideAll();
                                                        }
                                                        else {
                                                            var objUsuario = {
                                                                _rowNum: fila + 1,
                                                                MODO: 1,
                                                                C_EMPRESA: $(object).find('form[name=frmRegistroUsuarios] #C_EMPRESA_USUARIO').val(),
                                                                C_USUARIO: $(object).find('form[name=frmRegistroUsuarios] #C_USUARIO').val(),
                                                                NOMBRE: $(object).find('form[name=frmRegistroUsuarios] #NOMBRE').val(),
                                                                TELEFONO: $(object).find('form[name=frmRegistroUsuarios] #TELEFONO').val(),
                                                                EMAIL: $(object).find('form[name=frmRegistroUsuarios] #EMAIL').val(),
                                                                CONTRASENA: $(object).find('form[name=frmRegistroUsuarios] #PASSWORD').val(),
                                                                FLAG_ESTADO: $(object).find('form[name=frmRegistroUsuarios] #FLAG_ESTADO').val(),
                                                                C_USUARIO_REGISTRA: $(object).find('form[name=frmRegistroUsuarios] #C_USUARIO_REGISTRA').val(),
                                                                FECHA_MODIFICACION: moment(new Date()).format("DD/MM/YYYY"),
                                                                FLAG_PRINCIPAL: $(object).find('form[name=frmRegistroUsuarios] #FLAG_PRINCIPAL').val(),
                                                                FLAG_ACCESO_APP_MOVIL_SOLVER: $(object).find('form[name=frmRegistroUsuarios] #FLAG_ACCESO_APP_MOVIL_SOLVER').val(),
                                                                FLAG_CREAR_USUARIO: $(object).find('form[name=frmRegistroUsuarios] #FLAG_CREAR_USUARIO').val(),
                                                            };

                                                            $(table01).jqxGrid('addrow', null, objUsuario);
                                                            $(table01).jqxGrid('selectrow', fila);
                                                            $(table01).jqxGrid('ensurerowvisible', fila);
                                                            bootbox.hideAll();
                                                        }

                                                    }
                                                }
                                            });
                                        }
                                        else {
                                            alertify.alert('¡Debe tener un usuario principal!');
                                        }
                                    }
                                    else {
                                        $.GetQuery({
                                            query: ['adm_mantenimiento_clienteregistro_validar_duplicado_usuario'],
                                            items: [{
                                                USUARIO: function () {
                                                    return $('form[name=frmRegistroUsuarios] #C_USUARIO').val();
                                                }
                                            }],
                                            onError: function (error) { },
                                            onReady: function (result) {
                                                if (result.length > 0) {
                                                    if (validador == 'Editar') {
                                                        var index = $(table01).jqxGrid('getselectedrowindex');
                                                        var row = $(table01).jqxGrid('getRows')[index];
                                                        if (row.MODO != 1) {
                                                            row.MODO = 2;
                                                        }
                                                        row.C_EMPRESA = $(object).find('form[name=frmRegistroUsuarios] #C_EMPRESA_USUARIO').val();
                                                        row.C_USUARIO = $(object).find('form[name=frmRegistroUsuarios] #C_USUARIO').val();
                                                        row.NOMBRE = $(object).find('form[name=frmRegistroUsuarios] #NOMBRE').val();
                                                        row.TELEFONO = $(object).find('form[name=frmRegistroUsuarios] #TELEFONO').val();
                                                        row.EMAIL = $(object).find('form[name=frmRegistroUsuarios] #EMAIL').val();
                                                        row.CONTRASENA = $(object).find('form[name=frmRegistroUsuarios] #PASSWORD').val();
                                                        row.FLAG_ESTADO = $(object).find('form[name=frmRegistroUsuarios] #FLAG_ESTADO').val();
                                                        row.C_USUARIO_REGISTRA = $(object).find('form[name=frmRegistroUsuarios] #C_USUARIO_REGISTRA').val();
                                                        row.FECHA_MODIFICACION = moment(new Date()).format("DD/MM/YYYY");
                                                        row.FLAG_PRINCIPAL = $(object).find('form[name=frmRegistroUsuarios] #FLAG_PRINCIPAL').val();
                                                        row.FLAG_ACCESO_APP_MOVIL_SOLVER = $(object).find('form[name=frmRegistroUsuarios] #FLAG_ACCESO_APP_MOVIL_SOLVER').val();
                                                        row.FLAG_CREAR_USUARIO = $(object).find('form[name=frmRegistroUsuarios] #FLAG_CREAR_USUARIO').val();

                                                        $(table01).jqxGrid('refresh');
                                                        bootbox.hideAll();
                                                    }
                                                    else {
                                                        alertify.alert('El usuario ' + result[0].NOMBRES + ' ya está registrado.');
                                                    }
                                                }
                                                else {
                                                    const fila = $(table01).jqxGrid('getrows').length;

                                                    if (usuario.length != 0) {
                                                        var index = $(table01).jqxGrid('getselectedrowindex');
                                                        var row = $(table01).jqxGrid('getRows')[index];
                                                        if (row.MODO != 1) {
                                                            row.MODO = 2;
                                                        }
                                                        row.C_EMPRESA = $(object).find('form[name=frmRegistroUsuarios] #C_EMPRESA_USUARIO').val();
                                                        row.C_USUARIO = $(object).find('form[name=frmRegistroUsuarios] #C_USUARIO').val();
                                                        row.NOMBRE = $(object).find('form[name=frmRegistroUsuarios] #NOMBRE').val();
                                                        row.TELEFONO = $(object).find('form[name=frmRegistroUsuarios] #TELEFONO').val();
                                                        row.EMAIL = $(object).find('form[name=frmRegistroUsuarios] #EMAIL').val();
                                                        row.CONTRASENA = $(object).find('form[name=frmRegistroUsuarios] #PASSWORD').val();
                                                        row.FLAG_ESTADO = $(object).find('form[name=frmRegistroUsuarios] #FLAG_ESTADO').val();
                                                        row.C_USUARIO_REGISTRA = $(object).find('form[name=frmRegistroUsuarios] #C_USUARIO_REGISTRA').val();
                                                        row.FECHA_MODIFICACION = moment(new Date()).format("DD/MM/YYYY");
                                                        row.FLAG_PRINCIPAL = $(object).find('form[name=frmRegistroUsuarios] #FLAG_PRINCIPAL').val();
                                                        row.FLAG_ACCESO_APP_MOVIL_SOLVER = $(object).find('form[name=frmRegistroUsuarios] #FLAG_ACCESO_APP_MOVIL_SOLVER').val();
                                                        row.FLAG_CREAR_USUARIO = $(object).find('form[name=frmRegistroUsuarios] #FLAG_CREAR_USUARIO').val();

                                                        $(table01).jqxGrid('refresh');
                                                        bootbox.hideAll();
                                                    }
                                                    else {
                                                        var objUsuario = {
                                                            _rowNum: fila + 1,
                                                            MODO: 1,
                                                            C_EMPRESA: $(object).find('form[name=frmRegistroUsuarios] #C_EMPRESA_USUARIO').val(),
                                                            C_USUARIO: $(object).find('form[name=frmRegistroUsuarios] #C_USUARIO').val(),
                                                            NOMBRE: $(object).find('form[name=frmRegistroUsuarios] #NOMBRE').val(),
                                                            TELEFONO: $(object).find('form[name=frmRegistroUsuarios] #TELEFONO').val(),
                                                            EMAIL: $(object).find('form[name=frmRegistroUsuarios] #EMAIL').val(),
                                                            CONTRASENA: $(object).find('form[name=frmRegistroUsuarios] #PASSWORD').val(),
                                                            FLAG_ESTADO: $(object).find('form[name=frmRegistroUsuarios] #FLAG_ESTADO').val(),
                                                            C_USUARIO_REGISTRA: $(object).find('form[name=frmRegistroUsuarios] #C_USUARIO_REGISTRA').val(),
                                                            FECHA_MODIFICACION: moment(new Date()).format("DD/MM/YYYY"),
                                                            FLAG_PRINCIPAL: $(object).find('form[name=frmRegistroUsuarios] #FLAG_PRINCIPAL').val(),
                                                            FLAG_ACCESO_APP_MOVIL_SOLVER: $(object).find('form[name=frmRegistroUsuarios] #FLAG_ACCESO_APP_MOVIL_SOLVER').val(),
                                                            FLAG_CREAR_USUARIO: $(object).find('form[name=frmRegistroUsuarios] #FLAG_CREAR_USUARIO').val()
                                                        };

                                                        $(table01).jqxGrid('addrow', null, objUsuario);
                                                        $(table01).jqxGrid('selectrow', fila);
                                                        $(table01).jqxGrid('ensurerowvisible', fila);
                                                        bootbox.hideAll();
                                                    }

                                                }
                                            }
                                        });
                                    }
                                }
                                else {
                                    if ($('#FLAG_PRINCIPAL').val() == 'true' || $('#FLAG_PRINCIPAL').val() == true) {
                                        if (principal == false) {
                                            if ($('#FLAG_PRINCIPAL').val() == 'true' || $('#FLAG_PRINCIPAL').val() == true) {
                                                $.GetQuery({
                                                    query: ['adm_mantenimiento_clienteregistro_validar_duplicado_usuario'],
                                                    items: [{
                                                        USUARIO: function () {
                                                            return $('form[name=frmRegistroUsuarios] #C_USUARIO').val();
                                                        }
                                                    }],
                                                    onError: function (error) { },
                                                    onReady: function (result) {
                                                        if (result.length > 0) {
                                                            if (validador == 'Editar') {
                                                                var index = $(table01).jqxGrid('getselectedrowindex');
                                                                var row = $(table01).jqxGrid('getRows')[index];
                                                                if (row.MODO != 1) {
                                                                    row.MODO = 2;
                                                                }
                                                                row.C_EMPRESA = $(object).find('form[name=frmRegistroUsuarios] #C_EMPRESA_USUARIO').val();
                                                                row.C_USUARIO = $(object).find('form[name=frmRegistroUsuarios] #C_USUARIO').val();
                                                                row.NOMBRE = $(object).find('form[name=frmRegistroUsuarios] #NOMBRE').val();
                                                                row.TELEFONO = $(object).find('form[name=frmRegistroUsuarios] #TELEFONO').val();
                                                                row.EMAIL = $(object).find('form[name=frmRegistroUsuarios] #EMAIL').val();
                                                                row.CONTRASENA = $(object).find('form[name=frmRegistroUsuarios] #PASSWORD').val();
                                                                row.FLAG_ESTADO = $(object).find('form[name=frmRegistroUsuarios] #FLAG_ESTADO').val();
                                                                row.C_USUARIO_REGISTRA = $(object).find('form[name=frmRegistroUsuarios] #C_USUARIO_REGISTRA').val();
                                                                row.FECHA_MODIFICACION = moment(new Date()).format("DD/MM/YYYY");
                                                                row.FLAG_PRINCIPAL = $(object).find('form[name=frmRegistroUsuarios] #FLAG_PRINCIPAL').val();
                                                                row.FLAG_ACCESO_APP_MOVIL_SOLVER = $(object).find('form[name=frmRegistroUsuarios] #FLAG_ACCESO_APP_MOVIL_SOLVER').val();
                                                                row.FLAG_CREAR_USUARIO = $(object).find('form[name=frmRegistroUsuarios] #FLAG_CREAR_USUARIO').val();

                                                                $(table01).jqxGrid('refresh');
                                                                bootbox.hideAll();
                                                            }
                                                            else {
                                                                alertify.alert('El usuario ' + result[0].NOMBRES + ' ya está registrado.');
                                                            }
                                                        }
                                                        else {
                                                            const fila = $(table01).jqxGrid('getrows').length;

                                                            if (usuario.length != 0) {
                                                                var index = $(table01).jqxGrid('getselectedrowindex');
                                                                var row = $(table01).jqxGrid('getRows')[index];
                                                                if (row.MODO != 1) {
                                                                    row.MODO = 2;
                                                                }
                                                                row.C_EMPRESA = $(object).find('form[name=frmRegistroUsuarios] #C_EMPRESA_USUARIO').val();
                                                                row.C_USUARIO = $(object).find('form[name=frmRegistroUsuarios] #C_USUARIO').val();
                                                                row.NOMBRE = $(object).find('form[name=frmRegistroUsuarios] #NOMBRE').val();
                                                                row.TELEFONO = $(object).find('form[name=frmRegistroUsuarios] #TELEFONO').val();
                                                                row.EMAIL = $(object).find('form[name=frmRegistroUsuarios] #EMAIL').val();
                                                                row.CONTRASENA = $(object).find('form[name=frmRegistroUsuarios] #PASSWORD').val();
                                                                row.FLAG_ESTADO = $(object).find('form[name=frmRegistroUsuarios] #FLAG_ESTADO').val();
                                                                row.C_USUARIO_REGISTRA = $(object).find('form[name=frmRegistroUsuarios] #C_USUARIO_REGISTRA').val();
                                                                row.FECHA_MODIFICACION = moment(new Date()).format("DD/MM/YYYY");
                                                                row.FLAG_PRINCIPAL = $(object).find('form[name=frmRegistroUsuarios] #FLAG_PRINCIPAL').val();
                                                                row.FLAG_ACCESO_APP_MOVIL_SOLVER = $(object).find('form[name=frmRegistroUsuarios] #FLAG_ACCESO_APP_MOVIL_SOLVER').val();
                                                                row.FLAG_CREAR_USUARIO = $(object).find('form[name=frmRegistroUsuarios] #FLAG_CREAR_USUARIO').val();

                                                                $(table01).jqxGrid('refresh');
                                                                bootbox.hideAll();
                                                            }
                                                            else {
                                                                var objUsuario = {
                                                                    _rowNum: fila + 1,
                                                                    MODO: 1,
                                                                    C_EMPRESA: $(object).find('form[name=frmRegistroUsuarios] #C_EMPRESA_USUARIO').val(),
                                                                    C_USUARIO: $(object).find('form[name=frmRegistroUsuarios] #C_USUARIO').val(),
                                                                    NOMBRE: $(object).find('form[name=frmRegistroUsuarios] #NOMBRE').val(),
                                                                    TELEFONO: $(object).find('form[name=frmRegistroUsuarios] #TELEFONO').val(),
                                                                    EMAIL: $(object).find('form[name=frmRegistroUsuarios] #EMAIL').val(),
                                                                    CONTRASENA: $(object).find('form[name=frmRegistroUsuarios] #PASSWORD').val(),
                                                                    FLAG_ESTADO: $(object).find('form[name=frmRegistroUsuarios] #FLAG_ESTADO').val(),
                                                                    C_USUARIO_REGISTRA: $(object).find('form[name=frmRegistroUsuarios] #C_USUARIO_REGISTRA').val(),
                                                                    FECHA_MODIFICACION: moment(new Date()).format("DD/MM/YYYY"),
                                                                    FLAG_PRINCIPAL: $(object).find('form[name=frmRegistroUsuarios] #FLAG_PRINCIPAL').val(),
                                                                    FLAG_ACCESO_APP_MOVIL_SOLVER: $(object).find('form[name=frmRegistroUsuarios] #FLAG_ACCESO_APP_MOVIL_SOLVER').val(),
                                                                    FLAG_CREAR_USUARIO: $(object).find('form[name=frmRegistroUsuarios] #FLAG_CREAR_USUARIO').val()
                                                                };

                                                                $(table01).jqxGrid('addrow', null, objUsuario);
                                                                $(table01).jqxGrid('selectrow', fila);
                                                                $(table01).jqxGrid('ensurerowvisible', fila);
                                                                bootbox.hideAll();
                                                            }

                                                        }
                                                    }
                                                });
                                            }
                                            else {
                                                alertify.alert('¡Debe tener un usuario principal!');
                                            }
                                        }
                                        else {
                                            $.GetQuery({
                                                query: ['adm_mantenimiento_clienteregistro_validar_duplicado_usuario'],
                                                items: [{
                                                    USUARIO: function () {
                                                        return $('form[name=frmRegistroUsuarios] #C_USUARIO').val();
                                                    }
                                                }],
                                                onError: function (error) { },
                                                onReady: function (result) {
                                                    if (result.length > 0) {
                                                        if (validador == 'Editar') {
                                                            var index = $(table01).jqxGrid('getselectedrowindex');
                                                            var row = $(table01).jqxGrid('getRows')[index];
                                                            if (row.MODO != 1) {
                                                                row.MODO = 2;
                                                            }
                                                            row.C_EMPRESA = $(object).find('form[name=frmRegistroUsuarios] #C_EMPRESA_USUARIO').val();
                                                            row.C_USUARIO = $(object).find('form[name=frmRegistroUsuarios] #C_USUARIO').val();
                                                            row.NOMBRE = $(object).find('form[name=frmRegistroUsuarios] #NOMBRE').val();
                                                            row.TELEFONO = $(object).find('form[name=frmRegistroUsuarios] #TELEFONO').val();
                                                            row.EMAIL = $(object).find('form[name=frmRegistroUsuarios] #EMAIL').val();
                                                            row.CONTRASENA = $(object).find('form[name=frmRegistroUsuarios] #PASSWORD').val();
                                                            row.FLAG_ESTADO = $(object).find('form[name=frmRegistroUsuarios] #FLAG_ESTADO').val();
                                                            row.C_USUARIO_REGISTRA = $(object).find('form[name=frmRegistroUsuarios] #C_USUARIO_REGISTRA').val();
                                                            row.FECHA_MODIFICACION = moment(new Date()).format("DD/MM/YYYY");
                                                            row.FLAG_PRINCIPAL = $(object).find('form[name=frmRegistroUsuarios] #FLAG_PRINCIPAL').val();
                                                            row.FLAG_ACCESO_APP_MOVIL_SOLVER = $(object).find('form[name=frmRegistroUsuarios] #FLAG_ACCESO_APP_MOVIL_SOLVER').val();
                                                            row.FLAG_CREAR_USUARIO = $(object).find('form[name=frmRegistroUsuarios] #FLAG_CREAR_USUARIO').val();

                                                            $(table01).jqxGrid('refresh');
                                                            bootbox.hideAll();
                                                        }
                                                        else {
                                                            alertify.alert('El usuario ' + result[0].NOMBRES + ' ya está registrado.');
                                                        }
                                                    }
                                                    else {
                                                        const fila = $(table01).jqxGrid('getrows').length;

                                                        if (usuario.length != 0) {
                                                            var index = $(table01).jqxGrid('getselectedrowindex');
                                                            var row = $(table01).jqxGrid('getRows')[index];
                                                            if (row.MODO != 1) {
                                                                row.MODO = 2;
                                                            }
                                                            row.C_EMPRESA = $(object).find('form[name=frmRegistroUsuarios] #C_EMPRESA_USUARIO').val();
                                                            row.C_USUARIO = $(object).find('form[name=frmRegistroUsuarios] #C_USUARIO').val();
                                                            row.NOMBRE = $(object).find('form[name=frmRegistroUsuarios] #NOMBRE').val();
                                                            row.TELEFONO = $(object).find('form[name=frmRegistroUsuarios] #TELEFONO').val();
                                                            row.EMAIL = $(object).find('form[name=frmRegistroUsuarios] #EMAIL').val();
                                                            row.CONTRASENA = $(object).find('form[name=frmRegistroUsuarios] #PASSWORD').val();
                                                            row.FLAG_ESTADO = $(object).find('form[name=frmRegistroUsuarios] #FLAG_ESTADO').val();
                                                            row.C_USUARIO_REGISTRA = $(object).find('form[name=frmRegistroUsuarios] #C_USUARIO_REGISTRA').val();
                                                            row.FECHA_MODIFICACION = moment(new Date()).format("DD/MM/YYYY");
                                                            row.FLAG_PRINCIPAL = $(object).find('form[name=frmRegistroUsuarios] #FLAG_PRINCIPAL').val();
                                                            row.FLAG_ACCESO_APP_MOVIL_SOLVER = $(object).find('form[name=frmRegistroUsuarios] #FLAG_ACCESO_APP_MOVIL_SOLVER').val();
                                                            row.FLAG_CREAR_USUARIO = $(object).find('form[name=frmRegistroUsuarios] #FLAG_CREAR_USUARIO').val();

                                                            $(table01).jqxGrid('refresh');
                                                            bootbox.hideAll();
                                                        }
                                                        else {
                                                            var objUsuario = {
                                                                _rowNum: fila + 1,
                                                                MODO: 1,
                                                                C_EMPRESA: $(object).find('form[name=frmRegistroUsuarios] #C_EMPRESA_USUARIO').val(),
                                                                C_USUARIO: $(object).find('form[name=frmRegistroUsuarios] #C_USUARIO').val(),
                                                                NOMBRE: $(object).find('form[name=frmRegistroUsuarios] #NOMBRE').val(),
                                                                TELEFONO: $(object).find('form[name=frmRegistroUsuarios] #TELEFONO').val(),
                                                                EMAIL: $(object).find('form[name=frmRegistroUsuarios] #EMAIL').val(),
                                                                CONTRASENA: $(object).find('form[name=frmRegistroUsuarios] #PASSWORD').val(),
                                                                FLAG_ESTADO: $(object).find('form[name=frmRegistroUsuarios] #FLAG_ESTADO').val(),
                                                                C_USUARIO_REGISTRA: $(object).find('form[name=frmRegistroUsuarios] #C_USUARIO_REGISTRA').val(),
                                                                FECHA_MODIFICACION: moment(new Date()).format("DD/MM/YYYY"),
                                                                FLAG_PRINCIPAL: $(object).find('form[name=frmRegistroUsuarios] #FLAG_PRINCIPAL').val(),
                                                                FLAG_ACCESO_APP_MOVIL_SOLVER: $(object).find('form[name=frmRegistroUsuarios] #FLAG_ACCESO_APP_MOVIL_SOLVER').val(),
                                                                FLAG_CREAR_USUARIO: $(object).find('form[name=frmRegistroUsuarios] #FLAG_CREAR_USUARIO').val()
                                                            };

                                                            $(table01).jqxGrid('addrow', null, objUsuario);
                                                            $(table01).jqxGrid('selectrow', fila);
                                                            $(table01).jqxGrid('ensurerowvisible', fila);
                                                            bootbox.hideAll();
                                                        }

                                                    }
                                                }
                                            });
                                        }
                                    }
                                    else {
                                        alertify.alert('¡Debe tener un usuario principal!');
                                    }
                                }

                            });
                        },
                        onReady: function (result, controls, form) {

                            //Cerramos modal y actualizamos tabla
                            $.CloseStatusBar();
                            bootbox.hideAll();

                        },
                        onError: function (error) {
                            $.CloseStatusBar();
                            $.ShowError({ error: error });
                        }
                    });
                    $.CloseStatusBar();

                }
            });

        };

        var addOptionsUsers = function (EMPRESA, token) {
            //Agregando Data de Servicios
            var rowsUser = $(table02).jqxDataTable('getRows');
            for (var item in rowsUser) {

                var _rol = rowsUser[item];
                var _method = 1;
                var _condition = '';

                if (_rol.MODO == 'Nuevo') {
                    $.AddPetition({
                        table: 'EMPRESA_W_ROL',
                        type: _method,
                        condition: _condition,
                        items: $.ConvertObjectToArr({
                            C_EMPRESA: _rol.C_EMPRESA,
                            C_ROL: _rol.C_ROL,
                            FEC_INICIO: _rol.FEC_INICIO,
                            FEC_FIN: _rol.FEC_FIN,
                            C_USUARIO_REGISTRA: _rol.C_USUARIO_REGISTRA,
                            IND_ESTADO: _rol.IND_ESTADO
                        })
                    });
                }

                if (_rol.MODO == 'Eliminado') {
                    _method = 3;
                    _condition = "C_EMPRESA='" + _rol.C_EMPRESA + "' AND C_ROL='" + _rol.C_ROL + "'";

                    $.AddPetition({
                        table: 'EMPRESA_W_ROL',
                        type: _method,
                        condition: _condition,
                        items: $.ConvertObjectToArr({
                            C_EMPRESA: _rol.C_EMPRESA,
                            C_ROL: _rol.C_ROL,
                            FEC_INICIO: _rol.FEC_INICIO,
                            FEC_FIN: _rol.FEC_FIN,
                            IND_ESTADO: _rol.IND_ESTADO
                        })
                    });
                };

                if (_rol.MODO != 'Nuevo' && _rol.MODO != 'Eliminado') {
                    _method = 2;
                    _condition = "C_EMPRESA='" + _rol.C_EMPRESA + "' AND C_ROL='" + _rol.C_ROL + "'";
                    $.AddPetition({
                        table: 'EMPRESA_W_ROL',
                        type: _method,
                        condition: _condition,
                        items: $.ConvertObjectToArr({
                            C_EMPRESA: _rol.C_EMPRESA,
                            C_ROL: _rol.C_ROL,
                            FEC_INICIO: _rol.FEC_INICIO,
                            FEC_FIN: _rol.FEC_FIN,
                            C_USUARIO_REGISTRA: usu,
                            IND_ESTADO: _rol.IND_ESTADO
                        })
                    });
                }
            };
        };
        var fnObtenerEmpresa = function () {
            $.GetQuery({
                query: ['q_boleta_solicitud_correoempresa'],
                items: [{
                    C_EMPRESA: function () { return $("#C_EMPRESA").val(); },
                }],
                onError: function () {
                    $.CloseStatusBar();
                    $.ShowError({ error: error });
                },
                onReady: function (result) {
                    $.CloseStatusBar();
                    if (result.length != 0) {
                        $('#EMAIL_ADM_SOLICITUD').tagsinput('add', result[0].EMAIL_ADM_SOLICITUD, { preventPost: true });
                        $('#CORREO_COPIA_BOLETA').tagsinput('add', result[0].CORREO_COPIA_BOLETA, { preventPost: true });
                    }
                }
            });
        }

        //Accion Nueva Empresa
        $('a#btnNuevoUsuario').click(function (e) {
            validador = 'Nuevo';
            GetFormEditer($.solver.baseUrl + "/Mantenimiento/UsuariosRegistro/", '', '');
            e.preventDefault();
        });

        $('#btnAgregarRol').click(function () {
            $.GetData({
                title: '<i class="fa fa-user" aria-hidden="true"></i> Agregar Paquete a Empresa',
                uriData: $.solver.baseUrl + '/Mantenimiento/UsuariobuscarRol',
                location: 'float',
                size: 'large',
                type: 'GET',
                isPage: true,
                onReady: function (object) { }
            });
        });

        //Accion Editar
        $('a#btnEditarUsuario').bind('click', function (e) {
            validador = 'Editar';

            var index = $(table01).jqxGrid('getselectedrowindex');
            var selection = $(table01).jqxGrid('getRows')[index];
            if (selection != undefined) {
                if (selection.length != 0) {
                    GetFormEditer($.solver.baseUrl + `/Mantenimiento/UsuariosRegistro/${selection}`, 1, selection);
                } else {
                    alertify.warning('Debes seleccionar un registro para editar.');
                }
            } else {
                alertify.warning('Debes seleccionar un registro para editar.');
            }

            e.preventDefault();
        });

        $('#btnBuscarUsuario').click(function () {
            $(table01).jqxGrid('updatebounddata');
        });

        //Accion Reenviar Correo
        $('a#btnReenviarAccesos').bind('click', function (e) {

            var usuario = '';
            var email = '';
            var enviarAccesos = function () {
                $.AddPetition({
                    type: '7',
                    items: $.ConvertObjectToArr({
                        script: 'obtener_datos_usuario_empresa',
                        codigo: usuario,
                        codigo_formato: 'correo_auto_nuevo_boleta_usuario_empresa',
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

            var selection = $(table01).jqxGrid('getselectedrowindex');
            let row = $(table01).jqxGrid('getRows')[selection];

            if (selection != -1) {
                usuario = row.C_USUARIO;
                email = row.EMAIL;
                enviarAccesos();
            } else {
                alertify.warning('Debes seleccionar un registro para reenviar sus accesos.');
            };

            e.preventDefault();
        });

        $('form[name=frmRegistroEmpresa]').ValidForm({
            table: 'EMPRESA',
            type: _type,
            condition: condition,
            querySave: true,
            onDetail: function (form, controls, token) {

                // Agregar - Editar usuarios por empresa
                var inserts = $(table01).jqxGrid('getrows').filter(x => x['MODO'] == 1);
                var update = $(table01).jqxGrid('getrows').filter(x => x['MODO'] == 2);

                $.each(inserts, function (i, usuario) {
                    var type = 1;
                    var condition = '';
                    var objInsetUsuario = {
                        C_USUARIO: usuario.C_USUARIO,
                        NOMBRE: usuario.NOMBRE,
                        FLAG_ESTADO: usuario.FLAG_ESTADO,
                        PASSWORD: usuario.CONTRASENA,
                        EMAIL: usuario.EMAIL,
                        C_EMPRESA: usuario.C_EMPRESA,
                        TELEFONO: usuario.TELEFONO,
                        C_USUARIO_REGISTRA: usu,
                        FLAG_PRINCIPAL: (usuario.FLAG_PRINCIPAL == 'true' || usuario.FLAG_PRINCIPAL == true ? '*' : '&'),
                        FLAG_ACCESO_APP_MOVIL_SOLVER: (usuario.FLAG_ACCESO_APP_MOVIL_SOLVER == 'true' || usuario.FLAG_ACCESO_APP_MOVIL_SOLVER == true ? '*' : '&'),
                        FLAG_CREAR_USUARIO: (usuario.FLAG_CREAR_USUARIO == 'true' || usuario.FLAG_CREAR_USUARIO == true ? '*' : '&')
                    };
                    var extInsetUsuario = {
                        C_EMPRESA: {
                            action: {
                                name: 'GetParentId',
                                args: $.ConvertObjectToArr({
                                    token: token,
                                    column: 'C_EMPRESA'
                                })
                            }
                        }
                    };
                    $.AddPetition({
                        table: 'USUARIOS',
                        type: type,
                        condition: condition,
                        items: $.ConvertObjectToArr(objInsetUsuario, extInsetUsuario)
                    });
                });
                $.each(update, function (i, usuario) {
                    var type = 2;
                    var condition = `C_EMPRESA = '${usuario['C_EMPRESA']}' AND C_USUARIO = '${usuario['C_USUARIO']}'`;
                    var objUpdateUsuario = {
                        C_USUARIO: usuario.C_USUARIO,
                        NOMBRE: usuario.NOMBRE,
                        FLAG_ESTADO: usuario.FLAG_ESTADO,
                        PASSWORD: usuario.CONTRASENA,
                        EMAIL: usuario.EMAIL,
                        C_EMPRESA: usuario.C_EMPRESA,
                        TELEFONO: usuario.TELEFONO,
                        C_USUARIO_REGISTRA: usu,
                        FLAG_PRINCIPAL: (usuario.FLAG_PRINCIPAL == 'true' || usuario.FLAG_PRINCIPAL == true ? '*' : '&'),
                        FLAG_ACCESO_APP_MOVIL_SOLVER: (usuario.FLAG_ACCESO_APP_MOVIL_SOLVER == 'true' || usuario.FLAG_ACCESO_APP_MOVIL_SOLVER == true ? '*' : '&'),
                        FLAG_CREAR_USUARIO: (usuario.FLAG_CREAR_USUARIO == 'true' || usuario.FLAG_CREAR_USUARIO == true ? '*' : '&')
                    };
                    $.AddPetition({
                        table: 'USUARIOS',
                        type: type,
                        condition: condition,
                        items: $.ConvertObjectToArr(objUpdateUsuario)
                    });
                });

                // Para registrar los valores por defecto
                if (_type == 1) {
                    $.AddPetition({
                        type: 4,
                        transaction: true,
                        items: $.ConvertObjectToArr({
                            script: 'q_gbl_crear_valores_defecto_empresa_primera_vez',
                            C_EMPRESA: function () { return $(controls.C_EMPRESA).val(); }
                        })
                    });
                };

                addOptionsUsers($(controls.C_EMPRESA).val(), token);

            },
            onError: function (error) {
                $.CloseStatusBar();
                $.ShowError({ error: error });
            },
            onDone: function (form, controls) {
                _controls = controls
                
                fnObtenerEmpresa();
                $(_controls.C_USUARIO_REGISTRA).val(usu);
                fnObtenerImagen('C_ARCHIVO_LOGO', 'img-company');
                fnCrearCargaArchivo();
                fnObtenerTabs();

                $('#DEPARTAMENTO').unbind('change');
                $('#DEPARTAMENTO').change(function () {
                    $('#PROVINCIA').attr('data-query', 'gbl_obtenerprovincias')
                    $('#PROVINCIA').attr('data-value', 'CODIGO_PARAMETRO')
                    $('#PROVINCIA').attr('data-field', 'DESCRIPCION_PARAMETRO')
                    $('#PROVINCIA').attr('data-COD', $(this).val());
                    $('#PROVINCIA').FieldLoadRemote();
                });

                $('#PROVINCIA').unbind('change');
                $('#PROVINCIA').change(function () {
                    $('#DISTRITO').attr('data-query', 'gbl_obtenerdistritos')
                    $('#DISTRITO').attr('data-value', 'CODIGO_PARAMETRO')
                    $('#DISTRITO').attr('data-field', 'DESCRIPCION_PARAMETRO')
                    $('#DISTRITO').attr('data-COD', $(this).val());
                    $('#DISTRITO').FieldLoadRemote();
                });

                fnObtenerImagen('C_ARCHIVO_LOGO_FTE', 'imgfte');
                fnCrearCargaArchivoFte();
                fnCrearCargaArchivoGeneral();
                fnCrearCargaArchivoContable();
                fnCrearCargaArchivoComercial();
                fnCrearCargaArchivoFacturador();
                fnCrearCargaArchivoPfx();

                $('#C_ARCHIVO, #C_ARCHIVO_FICHA_RUC, #C_ARCHIVO_DNI_REPRESENTANTE_LEGAL, #C_ARCHIVO_COPIA_LITERAL, #C_ARCHIVO_REGISTRO_VET, #C_ARCHIVO_REGISTRO_COM, #C_ARCHIVO_REGISTRO_PROD_SERV, #C_ARCHIVO_REGISTRO_CLI, #C_ARCHIVO_REGISTRO_PRO, #C_ARCHIVO_CONSTANCIA_ASOC_PSE_SOLUNET').trigger('change');
                if ($("#FECHA_INICIO_ACTIVIDADES").val() != '') {
                    $.GetQuery({
                        query: ['q_administracion_mantenimiento_clienteregistro_obtenerfechainiciocliente'],
                        items: [{
                            C_EMPRESA: function () {
                                return $('#C_EMPRESA').val();
                            }
                        }],
                        onReady: function (result) {
                            const data = result[0];
                            $('#FECHA_INICIO_ACTIVIDADES').val(data['FECHA']);
                            $("#FECHA_INICIO_ACTIVIDADES").datetimepicker({
                                format: 'DD/MM/YYYY',
                                locale: 'es'
                            });
                        }
                    });
                }
                else {
                    $("#FECHA_INICIO_ACTIVIDADES").datetimepicker({
                        format: 'DD/MM/YYYY',
                        locale: 'es'
                    });
                }

                if ($(controls.ACRONIMO).val() != '') {
                    $(controls.ACRONIMO).attr('readonly', 'readonly');
                }

                fnCrearTabla();
            },
            onReady: function (result, controls, form) {
                
                $.CloseStatusBar();
                alertify.success('Se registró la información.');
                document.location = $.solver.baseUrl + '/Mantenimiento/Clientes/';

            },
            rules: {
                'ACRONIMO': {
                    required: true,
                    runQuery: {
                        onStart: function () {
                            //agregamos peticion
                            $.AddPetition({
                                items: $.ConvertObjectToArr({
                                    script: 'q_administracion_mantenimiento_clienteregistro_validaracronimo',
                                    C_EMPRESA: function () {
                                        return $('#C_EMPRESA').val();
                                    },
                                    ACRONIMO: function () {
                                        return $('#ACRONIMO').val();
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
                            } else if (result.length == 1 && $('#C_EMPRESA').val() == '') {
                                estado = false;
                            } else if (result.length == 1 && $('#C_EMPRESA').val() != '') {
                                estado = false;
                            } else if (result.length == 2 && $('#C_EMPRESA').val() != '') {
                                estado = true;
                            };

                            return estado;

                        }
                    }
                }
            },
            messages: {
                'ACRONIMO': {
                    runQuery: 'El acrónimo ya esta siendo usado por otra empresa, por favor escoja otro.',
                }
            }
        });

        $('#NRO_DOCUMENTO').keyup(function () {
            if ($(this).val().length == 11) {
                $.GetQuery({
                    query: ['q_ventas_mantenimiento_clientes_obtenerpadron_ruc'],
                    items: [{ RUC: function () { return $('#NRO_DOCUMENTO').val(); } }],
                    onError: function () {
                        $.CloseStatusBar();
                        $.ShowError({ error: error });
                    },
                    onReady: function (result) {
                        $.CloseStatusBar();
                        if (result.length != 0) {
                            const data = result[0]
                            $('#RAZON_SOCIAL').val(data['RAZON_SOCIAL']);
                            $('#DIRECCION').val(data['DIRECCION']);
                            $('#UBIGEO').val(data['UBIGEO']);
                        }
                        else {
                            $('#RAZON_SOCIAL').val('');
                            $('#DIRECCION').val('');
                            $('#UBIGEO').val('');
                        }
                    }
                });
            }
            $('#C_USUARIO').val($(this).val());
        });
        $('#C_ARCHIVO, #C_ARCHIVO_FICHA_RUC, #C_ARCHIVO_DNI_REPRESENTANTE_LEGAL, #C_ARCHIVO_COPIA_LITERAL, #C_ARCHIVO_REGISTRO_VET, #C_ARCHIVO_REGISTRO_COM, #C_ARCHIVO_REGISTRO_PROD_SERV, #C_ARCHIVO_REGISTRO_CLI, #C_ARCHIVO_REGISTRO_PRO, #C_ARCHIVO_CONSTANCIA_ASOC_PSE_SOLUNET').change(function () {

            var url = `${$.solver.services.api}/service/viewfile/`;
            var url_download = `${$.solver.services.api}/service/downloadfile/`;

            if ($('#C_ARCHIVO_FICHA_RUC').val() == '') $('#show-ficha-ruc').hide();
            else {
                $('#show-ficha-ruc').attr('href', url + $('#C_ARCHIVO_FICHA_RUC').val())
                $('#show-ficha-ruc').show();
            }

            if ($('#C_ARCHIVO').val() == '') $('#show-pfx').hide();
            else {
                $('#show-pfx').attr('href', url_download + $('#C_ARCHIVO').val())
                $('#show-pfx').show();
            }

            if ($('#C_ARCHIVO_DNI_REPRESENTANTE_LEGAL').val() == '') $('#show-dni-repre-legal').hide();
            else {
                $('#show-dni-repre-legal').attr('href', url + $('#C_ARCHIVO_DNI_REPRESENTANTE_LEGAL').val())
                $('#show-dni-repre-legal').show();
            }

            if ($('#C_ARCHIVO_COPIA_LITERAL').val() == '') $('#show-copia-literal').hide();
            else {
                $('#show-copia-literal').attr('href', url + $('#C_ARCHIVO_COPIA_LITERAL').val())
                $('#show-copia-literal').show();
            }

            if ($('#C_ARCHIVO_REGISTRO_VET').val() == '') $('#show-reg-ventas').hide();
            else {
                $('#show-reg-ventas').attr('href', url + $('#C_ARCHIVO_REGISTRO_VET').val())
                $('#show-reg-ventas').show();
            }

            if ($('#C_ARCHIVO_REGISTRO_COM').val() == '') $('#show-reg-compras').hide();
            else {
                $('#show-reg-compras').attr('href', url + $('#C_ARCHIVO_REGISTRO_COM').val())
                $('#show-reg-compras').show();
            }

            if ($('#C_ARCHIVO_REGISTRO_PROD_SERV').val() == '') $('#show-reg-prod-vet').hide();
            else {
                $('#show-reg-prod-vet').attr('href', url + $('#C_ARCHIVO_REGISTRO_PROD_SERV').val())
                $('#show-reg-prod-vet').show();
            }

            if ($('#C_ARCHIVO_REGISTRO_CLI').val() == '') $('#show-reg-cliente').hide();
            else {
                $('#show-reg-cliente').attr('href', url + $('#C_ARCHIVO_REGISTRO_CLI').val())
                $('#show-reg-cliente').show();
            }

            if ($('#C_ARCHIVO_REGISTRO_PRO').val() == '') $('#show-reg-proveedor').hide();
            else {
                $('#show-reg-proveedor').attr('href', url + $('#C_ARCHIVO_REGISTRO_PRO').val())
                $('#show-reg-proveedor').show();
            }

            if ($('#C_ARCHIVO_CONSTANCIA_ASOC_PSE_SOLUNET').val() == '') $('#show-cons-asoc-pse-solunet').hide();
            else {
                $('#show-cons-asoc-pse-solunet').attr('href', url + $('#C_ARCHIVO_CONSTANCIA_ASOC_PSE_SOLUNET').val())
                $('#show-cons-asoc-pse-solunet').show();
            }
        });
        $('#btnGuardar').click(function () {
            fnGuardarCliente();
        });
        $('#btnFicha').click(function () {

            $.DisplayStatusBar({ message: 'Generando pdf.' });
            $.CreatePDFDocument({
                empresa: $('#C_EMPRESA').val(),
                formato: 'formato_estandar_ficha_cliente',
                papel: 'A4',
                querys: [
                    {
                        name: 'cabecera',
                        args: $.ConvertObjectToArr({
                            modeWork: 'd', //diccionario
                            script: 'gbl_obtener_formato_ficha_cliente_cabecera',
                            C_EMPRESA: function () {
                                return $('#C_EMPRESA').val();
                            }
                        })
                    },
                    {
                        name: 'tblServicio',
                        args: $.ConvertObjectToArr({
                            script: 'gbl_obtener_formato_ficha_cliente_servicios',
                            C_EMPRESA: function () {
                                return $('#C_EMPRESA').val();
                            }
                        })
                    },
                    {
                        name: 'tblUsuario',
                        args: $.ConvertObjectToArr({
                            script: 'gbl_obtener_formato_ficha_cliente_usuarios',
                            C_EMPRESA: function () {
                                return $('#C_EMPRESA').val();
                            }
                        })
                    },
                ],
                onReady: function (result) {
                    $.CloseStatusBar();

                    bootbox.dialog({
                        message: `<div class="embed-responsive embed-responsive-16by9"><iframe class= "embed-responsive-item" src="https://api.solver.com.pe/v1//service/ViewFile/${result.token}/" allowfullscreen></iframe></div>`,
                        closeButton: true,
                        className: 'modal-75'
                    });
                },
                onError: function () {
                    $.CloseStatusBar();
                    alertify.warning('No se pudo generar formato pdf')
                }
            });

        });

        setTimeout(function () {
            if (!editable) {

                $('.tab-cons-comer').attr('style', 'display:none;');
                $('.tab-cons-cont').attr('style', 'display:none;');
                $('.tab-cons-fac').attr('style', 'display:none;');
                $('.tab-cons-pla').attr('style', 'display:none;');
                $('.tab-boletas').attr('style', 'display:none;');
                $('.tab-archivos').attr('style', 'display:none;');
                $('.tab-facturacion').attr('style', 'display:none;');
                $('.tab-ventas').attr('style', 'display:none;');
                $('#btnAgregarRol').remove();
                $('.borrar').remove();
                $('#btnFicha').show();

            }
        }, 1000);

    });
});