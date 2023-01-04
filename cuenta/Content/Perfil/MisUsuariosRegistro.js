require(["helper", "extras", 'bootstrap-select', 'fileinput.es'], function () {
    require(["alertify", "bootbox", "moment"], function (alertify, bootbox, moment) {
        alertify.set('notifier', 'position', 'top-center');

        const c_empresa = $.solver.session.SESSION_EMPRESA;
        const c_usuario = $.solver.session.SESSION_ID;

        const form = 'form[name=frmRegistroUsuario]';
        const formPermisos = 'form[name=frmPermisos]';
        const table = '#tablePermisos';
        let buttonState = false;
        let _controls = null;

        const fnObtenerAlerta = function (message) {
            alertify.alert()
                .setting({
                    'title': 'Mensaje del Sistema',
                    'message': message,
                })
                .show();
        };

        const fnCrearCargaArchivo = function () {
            $("#input-b6").fileinput({
                language: 'es',
                showPreview: false,
                mainClass: "input-group-sm",
                uploadUrl: $.solver.services.api + "/Service/Upload/New",
                uploadAsync: true,
            });
            $("#input-b6").on("filebatchselected", function (event, files) {
                $("#input-b6").fileinput("upload");
            });
            $("#input-b6").on("fileuploaded", function (event, data, previewId, index) {
                $('input[name=C_ARCHIVO_FIRMA]').val(data.response.token);
                $('#C_ARCHIVO_FIRMA').trigger('change');
                $("#input-b6").fileinput('clear');
            });
        };
        const fnObtenerImagen = function () {
            if ($(_controls.C_ARCHIVO_FIRMA).val() != '') {
                $('#img').attr('src', '');
                $('#img').attr('src', $.solver.services.api + 'Service/ViewFile/' + $(_controls.C_ARCHIVO_FIRMA).val())
                $('#img').css({ 'display': 'block' });
            }
        };
        const fnObtenerCentroCosto = function () {
            var centroCosto = $(_controls.C_UNIDAD_NEGOCIO).val();
            if (centroCosto != '') {
                $.GetQuery({
                    query: ['gbl_obtener_centro_costo'],
                    items: [{
                        C_EMPRESA: c_empresa,
                        C_UNIDAD_NEGOCIO: centroCosto
                    }],
                    onReady: function (result) {
                        if (result.length > 0) {
                            $(_controls.NOMBRE_CENTRO_COSTO).val(result[0].NOMBRE);
                        }
                    }
                })
            }
        };
        const fnCambiarTipoDoc = function () {
            var tipoDoc = $(_controls.TIPO_DOCUMENTO).val();
            if (tipoDoc == '00017') {
                $(_controls.NRO_DOCUMENTO).attr('maxlength', 11);
                $(_controls.NRO_DOCUMENTO).attr('minlength', 11);
            }
            else if (tipoDoc == '00013') {
                $(_controls.NRO_DOCUMENTO).attr('maxlength', 8);
                $(_controls.NRO_DOCUMENTO).attr('minlength', 8);
            }
            else {
                $(_controls.NRO_DOCUMENTO).attr('maxlength', 15);
                $(_controls.NRO_DOCUMENTO).removeAttr('minlength');
            }
        };
        const fnCrearTabla = function () {
            $(table).CreateGrid({
                query: 'q_cuenta_mantenimiento_usuarioregistro_listarroles',
                hiddens: ['C_USUARIO', 'C_ROL', 'MODO', 'DESCRIPCION','DESCRIPCION_PARAMETRO'],
                items: {
                    CodUsuario: function () {
                        return $(_controls.C_USUARIO).val() || '';
                    },
                    BUSCAR: function () {
                        return $('#_buscar_serv').val() || '';
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
                    NOMBRE: { text: 'Nombre del Perfil', dataField: 'NOMBRE', width: '300', align: 'center', cellsalign: 'center' },
                    //DESCRIPCION: { text: 'Descripción', dataField: 'DESCRIPCION', width: '250', align: 'center', cellsalign: 'center' },
                    //DESCRIPCION_PARAMETRO: { text: 'Tipo rol', dataField: 'DESCRIPCION_PARAMETRO', width: '100', align: 'center', cellsalign: 'center' },
                    C_USUARIO_REGISTRA: { text: 'Usu. modificación', dataField: 'C_USUARIO_REGISTRA', width: '120', align: 'center', cellsalign: 'center' },
                    FEC_MODIF: { text: 'Fec. modificación', dataField: 'FEC_MODIF', width: '120', align: 'center', cellsalign: 'center' },
                    ACCION: {
                        text: 'Acción', width: '150', align: 'center', cellsalign: 'center',
                        createwidget: function (row, column, value, htmlElement) {
                            $(table).jqxGrid('refresh');
                        },
                        initwidget: function (rowIndex, column, value, htmlElement) {
                            var modo = $(table).jqxGrid('getrows')[rowIndex].MODO;

                            $(htmlElement).html('');
                            $(htmlElement).addClass('jqx-grid-cell-middle-align');
                            $(htmlElement).addClass('mt-1');

                            if (modo != 'Eliminado') {
                                let _btnEliminar;
                                _btnEliminar = $(`<a style="cursor: pointer;" class="jqx-grid-widget eliminar"><i class="fa fa-trash" aria-hidden="true"></i>&nbsp;Eliminar</a>`);
                                $(htmlElement).append(_btnEliminar);
                                $(htmlElement).find('a.eliminar').unbind('click');
                                $(htmlElement).find('a.eliminar').click(function () {
                                    var _rows = $(table).jqxGrid('getRows');
                                    _rows[rowIndex]["MODO"] = 'Eliminado';
                                    $(table).jqxGrid('refresh');
                                });
                            }
                            else {
                                $(htmlElement).append(`<span style="color: red"; title="No se eliminará hasta que guarde." class="text-extra"><i class="fa fa-exclamation-triangle" aria-hidden="true"></i> Por eliminar</span>`)
                            }
                        },
                    }
                },
                config: {
                    virtualmode: false,
                    height: 500,
                    pageSize: 999999,
                    pageable: false,
                    sortable: false,
                    rendered: function () {

                    }
                }
            });
        }
        const fnObtenerAcronimo = function () {
            $.GetQuery({
                query: ['gbl_obteneracronimo_empresa'],
                items: [{
                    C_EMPRESA: c_empresa
                }],
                onReady: function (result) {
                    if (result.length == 0) {
                        alertify.warning('El acrónimo aún no se ha creado.');
                        $('button[type=submit]').remove();
                    }
                    else if (result[0].ACRONIMO == '') {
                        alertify.warning('El acrónimo aún no se ha creado.');
                        $('button[type=submit]').remove();
                    }
                    else {
                        $(_controls.ACRONIMO).val(result[0].ACRONIMO);

                        if ($(_controls.C_USUARIO).val() == '') {
                            $(_controls.C_USUARIO).val(result[0].ACRONIMO + '_');
                        }
                    }
                },
                onError: function (error) {
                    $.CloseStatusBar();
                    $.ShowError({ error });
                },
            });

        };
        //const fnObtenerPermisos = function () {
        //    $.GetQuery({
        //        query: [''],
        //        items: [{
        //            C_USUARIO: function () {
        //                return $(_controls.C_USUARIO).val();
        //            }
        //        }],
        //        onReady: function (result) {
        //            console.log(result);
        //        },
        //        onError: function () {
        //            $.ShowError({ error });
        //        }
        //    });
        //}

        $('#centroCosto').click(function () {
            $.solver.fn.fnSeleccionarCentroCosto({
                input: $(_controls.C_UNIDAD_NEGOCIO),
                onCloseModal: function () {
                    fnObtenerCentroCosto();
                }
            });
        });
        $('#btnAgregarRol').click(function () {
            var iconButton = '<i class="fa fa-search" aria-hidden="true"></i>';
            var textButton = 'Buscar';
            var token = $.CreateToken();
            var dialog = bootbox.dialog({
                title: 'Agregar rol a usuario',
                message: `<div id="${token}"></div>`,
                onEscape: true
            });
            var controls = {
                buscar: {
                    class: 'col-lg-4',
                    html: '<input type="text" name="buscar" class="form-control form-control-sm" placeholder="Buscar nombre/descripcion/tipo rol" />'
                }
            };
            var statusButton = false;

            dialog.init(function () {
                setTimeout(function () {

                    $(dialog).find('.modal-dialog').css({ 'max-width': '80%' });

                    var objControls = null;
                    var fnCrearTabla = function () {
                        $(dialog).find('#' + token + '_table').CreateGrid({
                            query: 'GET_ROL_FIND_USUARIO_VENDEDOR',
                            items: {
                                C_EMPRESA: c_empresa,
                                BUSCAR: function () {
                                    return $(objControls.buscar).val() || '';
                                },
                                C_ROL: function () {
                                    var codigos = [];
                                    $.each($(table).jqxGrid('getrows'), function (i, v) {
                                        if (v.MODO != 'Eliminado') {
                                            codigos.push(v['C_ROL']);
                                        }
                                    });

                                    return codigos.join(',');
                                }
                            },
                            hiddens: ['C_ROL', 'C_EMPRESA', 'DESCRIPCION_PARAMETRO'],
                               columns: {
                                'NOMBRE': {
                                    text: 'Nombre',
                                    width: 350
                                },
                                'DESCRIPCION': {
                                    text: 'Descripción',
                                    width: 350
                                }
                            },
                            config: {
                                pageSize: 500,
                                height: 400,
                                pageable: true,
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
                        <div class="col-auto"><button type="submit" class="btn btn-sm btn-gray">${iconButton} ${textButton}</button></div>
                    `);
                    $(dialog).find('#' + token + '_form .site').append(`
                        <div class="col-auto"><button type="button" id="${token}_btnGuardar" class="btn btn-sm btn-danger"><i class="fa fa-floppy-o" aria-hidden="true"></i> Guardar</button></div>
                    `);

                    //Validamos formulario
                    $(dialog).find('#' + token + '_form').ValidForm({
                        type: -1,
                        onDone: function (form, controls) {
                            objControls = controls;
                            fnCrearTabla();

                            $(`#${token}_btnGuardar`).click(function () {
                                if (!statusButton) {
                                    statusButton = true;
                                    var indexes = $(dialog).find('#' + token + '_table').jqxGrid('getselectedrowindexes');
                                    var filas = [];
                                    var length = $(table).jqxGrid('getrows').length + 1;
                                    for (var index in indexes) {
                                        var row = $(dialog).find('#' + token + '_table').jqxGrid('getrows')[indexes[index]];
                                        filas.push({
                                            '_rowNum': length++,
                                            C_USUARIO: '',
                                            C_ROL: row.C_ROL,
                                            NOMBRE: row.NOMBRE,
                                            DESCRIPCION: row.DESCRIPCION,
                                            DESCRIPCION_PARAMETRO: row.DESCRIPCION_PARAMETRO,
                                            C_USUARIO_REGISTRA: c_usuario,
                                            FEC_MODIF: moment(new Date()).format("DD/MM/YYYY"),
                                            MODO: 'Nuevo'
                                        });
                                    }
                                    $(table).jqxGrid('addRow', null, filas);
                                    $(dialog).modal('hide');
                                }
                            });
                        },
                        onReady: function () {
                            $(dialog).find('#' + token + '_table').jqxGrid('updatebounddata');
                        }
                    });

                }, 150);
            });
        });
        $('#btnGuardarVendedor').click(function () {
            if (!buttonState) {
                buttonState = true;
                $(form).submit();
                buttonState = false;
            }
        });

        $(form).ValidForm({
            table: 'USUARIOS',
            type: 1,
            querySave: true,
            onSubmit: function (form, controls) {
                // Validar centro de costo
                //if ($(controls.C_UNIDAD_NEGOCIO).val() == '') {
                //    alertify.warning('Por favor seleccione el centro de costo');
                //    return false;
                //}

                // Validar que tengas mas de un permiso
                if ($(table).jqxGrid('getrows').filter(x => x['MODO'] != 'Eliminado').length == 0) {
                    alertify.warning('Por favor agregue permisos al usuario')
                    return false;
                }

                return true
            },
            onDetail: function (form, controls, token) {
                var rowsUser = $(table).jqxGrid('getrows');
                for (var item in rowsUser) {

                    var _rol = rowsUser[item];
                    var _method = 1;
                    var _condition = '';

                    if (_rol.MODO == 'Nuevo') {
                        $.AddPetition({
                            table: 'W_ROL_USUARIOS',
                            type: _method,
                            items: $.ConvertObjectToArr({
                                C_USUARIO: '',
                                C_ROL: _rol.C_ROL,
                                FLAG_ESTADO: '*',
                                C_USUARIO_REGISTRA: c_usuario
                            },
                                {
                                    C_USUARIO: {
                                        action: {
                                            name: 'GetParentId',
                                            args: $.ConvertObjectToArr({
                                                token: token,
                                                column: 'C_USUARIO'
                                            })
                                        }
                                    },
                                })
                        });
                    }

                    if (_rol.MODO == 'Eliminado') {
                        _method = 3;
                        _condition = "C_USUARIO='" + _rol.C_USUARIO + "' AND C_ROL='" + _rol.C_ROL + "'";

                        $.AddPetition({
                            table: 'W_ROL_USUARIOS',
                            type: _method,
                            condition: _condition,
                            items: $.ConvertObjectToArr({
                                C_USUARIO: '',
                                C_ROL: _rol.C_ROL
                            },
                                {
                                    C_USUARIO: {
                                        action: {
                                            name: 'GetParentId',
                                            args: $.ConvertObjectToArr({
                                                token: token,
                                                column: 'C_USUARIO'
                                            })
                                        }
                                    },
                                })
                        });
                    };
                };
            },
            onError: function (error) {
                $.CloseStatusBar();
                $.ShowError({ error });
            },
            onDone: function (form, controls) {
                _controls = controls;

                $(controls.C_EMPRESA).val(c_empresa);
                $(controls.RE_PASSWORD).val($(controls.PASSWORD).val());

                $(controls.C_ARCHIVO_FIRMA).change(function () {
                    fnObtenerImagen();
                });
                $(controls.TIPO_DOCUMENTO).change(function () {
                    fnCambiarTipoDoc();
                });
                $(controls.CHCK_PERMISO_ANULAR_VENTAS).change(function () {
                    if ($(controls.CHCK_PERMISO_ANULAR_VENTAS).is(':checked')) {
                        $(controls.FLAG_PERMISO_ANULAR_VENTAS).val('*')
                    }
                    else {
                        $(controls.FLAG_PERMISO_ANULAR_VENTAS).val('&')
                    }
                });
                $(controls.CHCK_PERMISO_REIMPRIMIR_COMPROBANTES).change(function () {
                    if ($(controls.CHCK_PERMISO_REIMPRIMIR_COMPROBANTES).is(':checked')) {
                        $(controls.FLAG_PERMISO_REIMPRIMIR_DOCUMENTOS).val('*')
                    }
                    else {
                        $(controls.FLAG_PERMISO_REIMPRIMIR_DOCUMENTOS).val('&')
                    }
                });
                $(controls.CHCK_PERMISO_ANULAR_PRODUCTO).change(function () {
                    if ($(controls.CHCK_PERMISO_ANULAR_PRODUCTO).is(':checked')) {
                        $(controls.FLAG_PERMISO_APLICA_ANULAR_PRODUCTO).val('*')
                    }
                    else {
                        $(controls.FLAG_PERMISO_APLICA_ANULAR_PRODUCTO).val('&')
                    }
                });
                $(controls.CHCK_PERMISO_APLICAR_DESCUENTO).change(function () {
                    if ($(controls.CHCK_PERMISO_APLICAR_DESCUENTO).is(':checked')) {
                        $(controls.FLAG_PERMISO_APLICA_DESCUENTO).val('*')
                    }
                    else {
                        $(controls.FLAG_PERMISO_APLICA_DESCUENTO).val('&')
                    }
                });
                $(controls.CHCK_PERMISO_APLICAR_CORTESIA).change(function () {
                    if ($(controls.CHCK_PERMISO_APLICAR_CORTESIA).is(':checked')) {
                        $(controls.FLAG_PERMISO_APLICA_CORTESIA).val('*')
                    }
                    else {
                        $(controls.FLAG_PERMISO_APLICA_CORTESIA).val('&')
                    }
                });
                $(controls.CHCK_PERMISO_CREAR_PEDIDOS).change(function () {
                    if ($(controls.CHCK_PERMISO_CREAR_PEDIDOS).is(':checked')) {
                        $(controls.FLAG_PERMISO_CREAR_PEDIDOS).val('*')
                    }
                    else {
                        $(controls.FLAG_PERMISO_CREAR_PEDIDOS).val('&')
                    }
                });

                if ($(controls.C_USUARIO).val() != '') {
                    $(controls.C_USUARIO).attr('readonly', 'readonly');
                };

                if ($(controls.FLAG_PERMISO_ANULAR_VENTAS).val() == '*') {
                    $(controls.CHCK_PERMISO_ANULAR_VENTAS).prop('checked', true);
                }
                else {
                    $(controls.CHCK_PERMISO_ANULAR_VENTAS).prop('checked', false);
                };

                if ($(controls.FLAG_PERMISO_REIMPRIMIR_DOCUMENTOS).val() == '*') {
                    $(controls.CHCK_PERMISO_REIMPRIMIR_COMPROBANTES).prop('checked', true);
                }
                else {
                    $(controls.CHCK_PERMISO_REIMPRIMIR_COMPROBANTES).prop('checked', false);
                };

                if ($(controls.FLAG_PERMISO_APLICA_ANULAR_PRODUCTO).val() == '*') {
                    $(controls.CHCK_PERMISO_ANULAR_PRODUCTO).prop('checked', true);
                }
                else {
                    $(controls.CHCK_PERMISO_ANULAR_PRODUCTO).prop('checked', false);
                };

                if ($(controls.FLAG_PERMISO_APLICA_CORTESIA).val() == '*') {
                    $(controls.CHCK_PERMISO_APLICAR_CORTESIA).prop('checked', true);
                }
                else {
                    $(controls.CHCK_PERMISO_APLICAR_CORTESIA).prop('checked', false);
                };

                if ($(controls.FLAG_PERMISO_APLICA_DESCUENTO).val() == '*') {
                    $(controls.CHCK_PERMISO_APLICAR_DESCUENTO).prop('checked', true);
                }
                else {
                    $(controls.CHCK_PERMISO_APLICAR_DESCUENTO).prop('checked', false);
                };

                if ($(controls.FLAG_PERMISO_CREAR_PEDIDOS).val() == '*') {
                    $(controls.CHCK_PERMISO_CREAR_PEDIDOS).prop('checked', true);
                }
                else {
                    $(controls.CHCK_PERMISO_CREAR_PEDIDOS).prop('checked', false);
                };

                fnCrearCargaArchivo();
                fnObtenerImagen();
                fnObtenerCentroCosto();
                fnObtenerAcronimo();
                //fnObtenerPermisos();

                $(formPermisos).ValidForm({
                    type: -1,
                    onDone: function () {
                        fnCrearTabla();
                    },
                    onReady: function () {
                        $(table).jqxGrid('updatebounddata')
                    }
                });
            },
            onReady: function (result, controls, form) {

                alertify.success('Usuario registrado correctamente');

                if ($(controls.FECHA_CREACION).val() == '') {
                    var email = $(controls.EMAIL).val()
                    $.AddPetition({
                        type: '7',
                        items: $.ConvertObjectToArr({
                            script: 'obtener_datos_usuario_empresa',
                            codigo: $(controls.C_USUARIO).val(),
                            codigo_formato: 'correo_auto_nuevo_boleta_usuario_empresa',
                            email: email
                        })
                    });
                    $.SendPetition({
                        onBefore: function () {
                            $.DisplayStatusBar({ message: 'Enviando correo de accesos' });
                        },
                        onReady: function () {
                            $.CloseStatusBar();
                            alertify.success('El correo fue enviado exitosamente a [' + email + '].');
                            document.location.href = $.solver.baseUrl + "/Perfil/MisUsuarios/";
                        },
                        onError: function () {
                            $.CloseStatusBar();
                            alertify.error('No se pudo entregar el correo de accesos a [' + email + '].');
                            document.location.href = $.solver.baseUrl + "/Perfil/MisUsuarios/";
                        }
                    });
                }
                else {
                    document.location.href = $.solver.baseUrl + "/Perfil/MisUsuarios/";
                };
            },
            rules: {
                'C_USUARIO': {
                    required: true,
                    runQuery: {
                        onStart: function () {
                            $.AddPetition({
                                items: $.ConvertObjectToArr({
                                    script: 'q_ventas_mantenimiento_vendedorregistro_validarusuario',
                                    C_USUARIO: function () {
                                        return $(_controls.C_USUARIO).val();
                                    }
                                })
                            });
                        },
                        //aqui se validan las respuestas (retornar true o false)
                        onReady: function (result) {
                            result = result[0].result.rows;

                            estado = false;
                            if (result.length == 0) {
                                estado = true;
                            }
                            else if (result.length == 1 && $(_controls.FECHA_CREACION).val() != '') {
                                estado = true;
                            }
                            else {
                                estado = false;
                            }
                            return estado;
                        }
                    },
                    maxlength: 15,
                },
                'EMAIL': {
                    validarCorreo: $('#EMAIL').val()
                }
            },
            messages: {
                'C_USUARIO': {
                    runQuery: 'El usuario ya esta siendo usado, por favor escoja otro.',
                },
            }
        });
    });
});