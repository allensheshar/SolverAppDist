require(['jqwidgets', "helper", "extras", 'bootstrap-select', 'fileinput.es', 'datetimepicker'], function () {
    require(["alertify", "bootbox", "moment"], function (alertify, bootbox, moment) {

        alertify.set('notifier', 'position', 'top-center');

        var table01 = "#tableUsuarioEmpresas";
        var table02 = "#tblServicios";

        var condition = $('#CONDITION').val();
        var usu = $.solver.session.SESSION_ID;
        var fechaAsignacion = moment(new Date()).format("DD/MM/YYYY");

        var _type = 1;
        let _administrador = false;
        if (condition.length != 0) _type = 2;

        let inicio = 0;

        var fnValidarTabs = function () {
            if ($('form[name=frmRegistroUsuarios] #CHECK_APP_MOVIL_SOLVER').is(':checked')) {
                $('form[name=frmRegistroUsuarios] #FLAG_ACCESO_APP_MOVIL_SOLVER').val('*')
            }
            else {
                $('form[name=frmRegistroUsuarios] #FLAG_ACCESO_APP_MOVIL_SOLVER').val('&');
            }
        }
        var fnValidarTabs2 = function () {
            if (inicio == 0) {
                if ($('form[name=frmRegistroUsuarios] #CHECK_ADMINISTRADOR_TOTAL').is(':checked')) {
                    $('form[name=frmRegistroUsuarios] #FLAG_ADMINISTRADOR_TOTAL').val('*')
                }
                else {
                    $('form[name=frmRegistroUsuarios] #FLAG_ADMINISTRADOR_TOTAL').val('&');
                    $('#div-empresa').css({ 'display': 'block' });
                }
            }
            else {
                if ($('form[name=frmRegistroUsuarios] #CHECK_ADMINISTRADOR_TOTAL').is(':checked')) {
                    alertify.confirm('Mensaje del sistema', '¿Desea cambiar a usuario administrador? Se borrarán todas las empresas.',
                        function () {
                            $('#div-empresa').css({ 'display': 'none' });
                            $('form[name=frmRegistroUsuarios] #FLAG_ADMINISTRADOR_TOTAL').val('*');
                            _administrador = true;
                        },
                        function () {
                            $("#CHECK_ADMINISTRADOR_TOTAL").prop("checked", false);
                            $('form[name=frmRegistroUsuarios] #FLAG_ADMINISTRADOR_TOTAL').val('&');
                            $('#div-empresa').css({ 'display': 'block' });

                            _administrador = false;

                            alertify.error('Cambio cancelado');
                        }).set('labels', { ok: 'Si', cancel: 'No' }).set('defaultFocus', 'ok').set('closable', false);
                }
                else {
                    _administrador = false;
                    $('form[name=frmRegistroUsuarios] #FLAG_ADMINISTRADOR_TOTAL').val('&');
                    $('#div-empresa').css({ 'display': 'block' });
                }
            }

            if (inicio == 0) {
                inicio = inicio += 1;
            }
        }
            
        const CrearTablas = function (controls) {
            $(table01).CreateTable({
                serverProcessing: true,
                sortable: true,
                pageSize: 999,
                pageable: true,
                pagerButtonsCount: 10,
                columnsResize: true,
                width: '100%',
                query: 'cta_mantenimiento_usuarioregistro_obtenerusuarios',
                items: {
                    usuario: function () {
                        return $(controls.C_USUARIO).val() || '';
                    }
                },
                hiddens: ['CODIGO', 'RUC', 'DIRECCION', 'NOMBREFIRMANTE', 'C_USUARIO', 'EMAIL_FIRMANTE_BE', 'FIRMA', 'MODO'],
                columns: {
                    RAZONSOCIAL: { text: 'Nombre empresa', dataField: 'RAZONSOCIAL', width: '400', align: 'center', cellsalign: 'center' },
                    C_USUARIO_REGISTRA: { text: 'Usu. modificación', dataField: 'C_USUARIO_REGISTRA', width: '120', align: 'center', cellsalign: 'center' },
                    FECHA_MODIFICACION: { text: 'Fec. modificación', dataField: 'FECHA_MODIFICACION', width: '120', align: 'center', cellsalign: 'center' },
                    IND_ESTADO: {
                        text: 'Estado', dataField: 'IND_ESTADO', width: '100', align: 'center', cellsalign: 'center', cellsRenderer: function (row, column, value, rowData) {
                            if (value == '*') return '<span style="color:blue;" class="text-extra"><i class="fa fa-check-circle" aria-hidden="true"></i> ACTIVO</span>';
                            if (value == '&') return '<span style="color:red;" class="text-extra"><i class="fa fa-exclamation-circle" aria-hidden="true"></i> INACTIVO</span>';
                        }
                    },
                    ACCION: {
                        text: 'Acción', width: '150', align: 'center', cellsalign: 'center', cellsRenderer: function (row, column, value, rowData) {
                            if (rowData.MODO != 'Eliminado') {
                                return '<a href="/Configurar/Rolesregistro/' + rowData["C_ROL"] + '" data-index="' + row + '" class="delete1"><i class="fa fa-pencil-square" aria-hidden="true"></i> Quitar</a>';
                            } else {
                                return "<span style='color:red;' style='No se eliminará hasta que guarde.' class='text-extra'><i class='fa fa-exclamation-triangle' aria-hidden='true'></i> Por Eliminar</span>"
                            }
                        }
                    }
                },
                config: {
                    height: 700,
                    rendered: function () {
                        $('a.delete1').unbind('click');
                        $('a.delete1').click(function (e) {

                            var _index = $(this).attr('data-index');
                            var _rows = $(table01).jqxDataTable('getRows');

                            _rows[_index]["MODO"] = 'Eliminado';
                            $(table01).jqxDataTable('endUpdate');

                            require(["alertify"], function (alertify) {
                                alertify.notify('Registro Eliminado....', 'success', 5, function () { });
                            });

                            e.preventDefault();

                        });
                    }
                }
            });
            $(table02).CreateTable({
                serverProcessing: true,
                sortable: true,
                pageSize: 999,
                pageable: true,
                pagerButtonsCount: 10,
                columnsResize: true,
                width: '100%',
                query: 'q_cuenta_mantenimiento_usuarioregistro_listarroles',
                items: {
                    CodUsuario: function () {
                        return $(controls.C_USUARIO).val() || '';
                    },
                    BUSCAR: function () {
                        return $('#_buscar_serv').val() || '';
                    }
                },
                hiddens: ['C_USUARIO', 'C_ROL', 'MODO'],
                columns: {
                    NOMBRE: { text: 'Nombre', dataField: 'NOMBRE', width: '300', align: 'center', cellsalign: 'center' },
                    DESCRIPCION: { text: 'Descripción', dataField: 'DESCRIPCION', width: '250', align: 'center', cellsalign: 'center' },
                    DESCRIPCION_PARAMETRO: { text: 'Tipo rol', dataField: 'DESCRIPCION_PARAMETRO', width: '100', align: 'center', cellsalign: 'center' },
                    C_USUARIO_REGISTRA: { text: 'Usu. modificación', dataField: 'C_USUARIO_REGISTRA', width: '120', align: 'center', cellsalign: 'center' },
                    FEC_MODIF: { text: 'Fec. modificación', dataField: 'FEC_MODIF', width: '120', align: 'center', cellsalign: 'center' },
                    ACCION: {
                        text: 'Acción', width: '150', align: 'center', cellsalign: 'center', cellsRenderer: function (row, column, value, rowData) {
                            if (rowData.MODO != 'Eliminado') {
                                return '<a href="#" data-index="' + row + '" class="delete2"><i class="fa fa-pencil-square" aria-hidden="true"></i> Quitar</a>';
                            } else {
                                return "<span style='color:red;' style='No se eliminará hasta que guarde.' class='text-extra'><i class='fa fa-exclamation-triangle' aria-hidden='true'></i> Por Eliminar</span>"
                            }
                        }
                    }
                },
                config: {
                    height: 700,
                    rendered: function () {
                        $('a.delete2').unbind('click');
                        $('a.delete2').click(function (e) {

                            var _index = $(this).attr('data-index');
                            var _rows = $(table02).jqxDataTable('getRows');

                            _rows[_index]["MODO"] = 'Eliminado';
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
        var actionsButtons = function (controls) {
            //Agregar nuevo usuario
            $('button.btn-add-empresa').click(function () {
                $.GetData({
                    title: '<i class="fa fa-user" aria-hidden="true"></i> Agregar empresa a usuario',
                    uriData: '/Seguridad/Mantenimiento/UsuariobuscarEmpresa',
                    location: 'float',
                    size: 'large',
                    type: 'GET',
                    isPage: true,
                    onReady: function (object) { }
                });
            });
        };
        var addOptionsUsers = function (EMPRESA, token) {

            //SP Update campo FLAG_ADMINISTRADOR_TOTAL = '&'
            if (_administrador == true) {

                $.AddPetition({
                    type: '3',
                    table: 'USUARIOS_EMPRESA',
                    condition: `C_USUARIO = '${$('#C_USUARIO').val()}'`
                });

                //$.AddPetition({
                //    type: '3',
                //    transaction: true,
                //    items: $.ConvertObjectToArr({
                //        script: 'sp_cta_mantenimiento_usuarioregistro_update_administrador',
                //        C_USUARIO: $('#C_USUARIO').val() || ''
                //    })
                //});
            }

            //Agregando Data de Usuarios
            var rowsUser = $(table01).jqxDataTable('getRows');
            for (var item in rowsUser) {

                var _user = rowsUser[item];
                var _method = 1;
                var _condition = '';

                if (_administrador == false) {
                    if (_user.MODO == 'Nuevo') {
                        let extra = {
                            C_USUARIO: {
                                action: {
                                    name: 'GetParentId',
                                    args: $.ConvertObjectToArr({
                                        token: token,
                                        column: 'C_USUARIO'
                                    })
                                }
                            },
                        }

                        $.AddPetition({
                            table: 'USUARIOS_EMPRESA',
                            type: _method,
                            condition: _condition,
                            items: $.ConvertObjectToArr({
                                C_EMPRESA: _user.CODIGO,
                                C_USUARIO: '',
                                C_USUARIO_REGISTRA: usu
                            }, extra)
                        });
                    }
                    if (_user.MODO == 'Eliminado') {
                        _method = 3;
                        _condition = "C_EMPRESA='" + _user.CODIGO + "' AND C_USUARIO='" + _user.C_USUARIO + "'";

                        $.AddPetition({
                            table: 'USUARIOS_EMPRESA',
                            type: _method,
                            condition: _condition,
                            items: $.ConvertObjectToArr({
                                C_EMPRESA: _user.CODIGO,
                                C_USUARIO: _user.C_USUARIO
                            })
                        });
                    };
                    //if (_user.MODO != 'Nuevo' && _user.MODO != 'Eliminado') {
                    //    _method = 2;
                    //    _condition = "C_EMPRESA='" + _user.CODIGO + "' AND C_USUARIO='" + _user.C_USUARIO + "'";
                    //    $.AddPetition({
                    //        table: 'USUARIOS_EMPRESA',
                    //        type: _method,
                    //        condition: _condition,
                    //        items: $.ConvertObjectToArr({
                    //            C_EMPRESA: _user.CODIGO,
                    //            C_USUARIO: _user.C_USUARIO,
                    //            C_USUARIO_REGISTRA: usu
                    //        })
                    //    });
                    //}
                }
            };

        };
        var addOptionsRoles2 = function (USUARIO, token) {
            //Agregando Data de Servicios
            var rowsUser = $(table02).jqxDataTable('getRows');
            for (var item in rowsUser) {
                
                var _rol = rowsUser[item];
                var _method = 1;
                var _condition = '';

                if (_rol.MODO == 'Nuevo') {
                    $.AddPetition({
                        table: 'W_ROL_USUARIOS',
                        type: _method,
                        condition: _condition,
                        items: $.ConvertObjectToArr({
                            C_USUARIO: _rol.C_USUARIO,
                            C_ROL: _rol.C_ROL,
                            FLAG_ESTADO: _rol.IND_ESTADO,
                            C_USUARIO_REGISTRA: usu
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
                            C_USUARIO: _rol.C_USUARIO,
                            C_ROL: _rol.C_ROL
                        })
                    });
                };

                //if (_rol.MODO != 'Nuevo' && _rol.MODO != 'Eliminado') {
                //    _method = 2;
                //    _condition = "C_USUARIO='" + _rol.C_USUARIO + "' AND C_ROL='" + _rol.C_ROL + "'";
                //    $.AddPetition({
                //        table: 'W_ROL_USUARIOS',
                //        type: _method,
                //        condition: _condition,
                //        items: $.ConvertObjectToArr({
                //            C_USUARIO: _rol.C_USUARIO,
                //            C_ROL: _rol.C_ROL,
                //            FLAG_ESTADO: _rol.IND_ESTADO,
                //            C_USUARIO_REGISTRA: usu
                //        })
                //    });
                //}
            };
        };
        var checkCountDetail = function () {

            var data_usuarios = $(table01).jqxDataTable('getRows');
            var contar_usuarios = 0;
            var contar_opciones = 0;
            var continuar = true;

            if (_administrador == false) {
                //checks users load
                for (var item in data_usuarios) {
                    var _user = data_usuarios[item];
                    if (_user.MODO != 'Eliminado') {
                        contar_usuarios++;
                    }
                }

                if (contar_usuarios == 0 && continuar == true && $('#C_USUARIO').val() != '') {
                    require(["alertify"], function (alertify) {
                        alertify.set('notifier', 'position', 'top-right');
                        alertify.error('El usuario debe tener como minimo una Empresa Registrada.');
                    });
                    continuar = false;
                };
            }

            return continuar;

        };

        $('.number-input').on('input', function () {
            this.value = this.value.replace(/[^0-9]/g, '');
        });

        $('#C_USUARIO').change(function () {
            if ($('#DUPLICADO').val() == 'Existe') {
                $('#VALIDADOR').val('No');
            }
        });
        $('#btnGuardarUsuario').click(function () {
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
                        if ($('#DUPLICADO').val() == 'Existe') {
                            if ($('#VALIDADOR').val() == 'Si') {
                                $('form[name=frmRegistroUsuarios]').submit();
                            }
                            else {
                                alertify.alert('El usuario ' + result[0].NOMBRES + ' ya está registrado.');
                                $('#VALIDADOR').val('Si');
                                $('#C_USUARIO').val($('#C_USUARIO_VALIDADOR').val());
                            }
                        }
                        else {
                            alertify.alert('El usuario ' + result[0].NOMBRES + ' ya está registrado.');
                        }
                    }
                    else {
                        $('form[name=frmRegistroUsuarios]').submit();
                    }
                }
            });
        });

        $("#btnServicio").click(function () {
            $(table02).jqxDataTable('render');
        });
        $('#btnAgregarRol').click(function () {
            $.GetData({
                title: '<i class="fa fa-user" aria-hidden="true"></i> Agregar rol a usuario',
                uriData: $.solver.baseUrl + '/Mantenimiento/UsuariobuscarRol',
                location: 'float',
                size: 'large',
                type: 'GET',
                isPage: true,
                onReady: function (object) { }
            });
        });

        $('form[name=filtrosRegRol]').submit(function () {
            $(table02).jqxDataTable('render');
        });
        $('form[name=frmRegistroUsuarios]').ValidForm({
            table: 'USUARIOS',
            type: _type,
            condition: condition,
            querySave: true,
            queryDefault: {
                query: ['editableUsuarios'],
                type: [8],
                items: [{
                    table: 'USUARIOS',
                    condition: condition
                }]
            },
            onDone: function (form, controls) {

                _controls = controls;
                $(_controls.C_USUARIO_REGISTRA).val(usu);

                $("#CHECK_ADMINISTRADOR_TOTAL").prop("checked", $('#FLAG_ADMINISTRADOR_TOTAL').val() == '*' ? true : false);
                $("#CHECK_APP_MOVIL_SOLVER").prop("checked", $('#FLAG_ACCESO_APP_MOVIL_SOLVER').val() == '*' ? true : false);

                $('#CHECK_ADMINISTRADOR_TOTAL').change(function () {
                    fnValidarTabs2();
                });
                $('#CHECK_APP_MOVIL_SOLVER').change(function () {
                    fnValidarTabs();
                });
                
                if ($(_controls.FLAG_ADMINISTRADOR_TOTAL).val() == '&' || $(_controls.FLAG_ADMINISTRADOR_TOTAL).val() == '' || $(_controls.FLAG_ADMINISTRADOR_TOTAL).val() == null) {
                    $('#div-empresa').css({ 'display': 'block' });
                    _administrador = false;
                }
                else {
                    $('#div-empresa').css({ 'display': 'none' });
                    _administrador = true;
                }

                CrearTablas(controls);
                actionsButtons(controls);
                fnValidarTabs();
                fnValidarTabs2();

                $('#C_USUARIO_VALIDADOR').val($(controls.C_USUARIO).val());
            },
            onSubmit: function () {
                return checkCountDetail();
            },
            onDetail: function (form, controls, token) {
                addOptionsUsers($(controls.C_USUARIO).val(), token);
                addOptionsRoles2($(controls.C_USUARIO).val(), token);
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
                document.location = $.solver.baseUrl + '/Mantenimiento/Usuarios/';

            },
            onError: function (error) {
                $.CloseStatusBar();
                $.ShowError({ error: error });
            },
        });

    });
});