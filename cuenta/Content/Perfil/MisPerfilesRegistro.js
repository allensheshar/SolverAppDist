require(['jqwidgets', 'helper', 'extras'], function () {

    //var table01 = "#tableRegUsuarios";
    var modulesCurrent = [];
    //var tableLoadUser = function (controls) {

    //    $(table01).CreateTable({
    //        query: 'USUARIOS_ROL_FULL',
    //        items: {
    //            rol: function () {
    //                return $(controls.C_ROL).val() || '';
    //            }
    //        },
    //        hiddens: ['FEC_CREAC', 'FEC_INI_VIGENCIA', 'FEC_FIN_VIGENCIA', 'MODO'],
    //        columns: {
    //            C_USUARIO: { text: 'Codigo', dataField: 'C_USUARIO', width: '120', align: 'center', cellsalign: 'center' },
    //            NOMBRE: { text: 'Nombre Usuario', dataField: 'NOMBRE', width: '250', align: 'center', cellsalign: 'center' },
    //            EMAIL: { text: 'Email', dataField: 'EMAIL', width: '250', align: 'center', cellsalign: 'center' },
    //            FLAG_ESTADO: {
    //                text: 'Estado', dataField: 'FLAG_ESTADO', width: '100', align: 'center', cellsalign: 'center', cellsRenderer: function (row, column, value, rowData) {
    //                    if (value == '*') return '<span style="color:blue;" class="text-extra"><i class="fa fa-check-circle" aria-hidden="true"></i> ACTIVO</span>';
    //                    if (value == '&') return '<span style="color:red;" class="text-extra"><i class="fa fa-exclamation-circle" aria-hidden="true"></i> INACTIVO</span>';
    //                }
    //            },
    //            ACCION: {
    //                text: 'Acción', width: '150', align: 'center', cellsalign: 'center', cellsRenderer: function (row, column, value, rowData) {
    //                    if (rowData.MODO != 'Eliminado') {
    //                        return '<a href="/Configurar/Rolesregistro/' + rowData["C_ROL"] + '" data-index="' + row + '" class="delete"><i class="fa fa-pencil-square" aria-hidden="true"></i> Quitar</a>';
    //                    } else {
    //                        return "<span style='color:red;' style='No se eliminará hasta que guarde.' class='text-extra'><i class='fa fa-exclamation-triangle' aria-hidden='true'></i> Por Eliminar</span>"
    //                    }
    //                }
    //            }
    //        },
    //        config: {
    //            height: '300',
    //            rendered: function () {
    //                $('a.delete').unbind('click');
    //                $('a.delete').click(function (e) {

    //                    var _index = $(this).attr('data-index');
    //                    var _rows = $(table01).jqxDataTable('getRows');

    //                    _rows[_index].MODO = 'Eliminado';
    //                    $(table01).jqxDataTable('endUpdate');

    //                    require(["alertify"], function (alertify) {
    //                        alertify.notify('Registro Eliminado....', 'success', 5, function () { });
    //                    });

    //                    e.preventDefault();

    //                });
    //            }
    //        }
    //    });

    //};
    var actionsButtons = function (controls) {

        //Agregar nuevo usuario
        $('button.btn-add-user').click(function () {
            $.GetData({
                title: '<i class="fa fa-user" aria-hidden="true"></i> Agregar usuario a rol',
                uriData: '/Configurar/Rolesbuscarusuario',
                location: 'float',
                size: 'large',
                type: 'GET',
                isPage: true,
                onReady: function (object) { }
            });
        });

        //Send Form
        //$('button.btn-save-rol').click(function () {
        //    $('form[name=frmRegistroEmpresa]').trigger('submit');
        //});

    };
    var addOptionsUsers = function (C_ROL) {

        //Agregando Data de Acciones
        $('.zone-opciones').find('li.option').each(function () {

            var _uid = $(this).attr('data-uid');
            var _texto = $(this).find('span.text-name').first().text();
            var _accion = $(this).find('span.text-accion').first().text();
            var _orden = $(this).attr('data-index-show');
            var _padre = $(this).attr('data-parent-uid');
            var _fk = $(this).attr('data-fk');
            var _fk_1 = $(this).attr('data-fk-1');
            var _method = $(this).attr('data-method');
            var _condition = '';
            var _data = {};
            var _table = '';
            var _state = $(this).attr('data-state') || '*';
            var _orden_repair = 0;
            var _orden_arr = _orden.split('.');
            var _orden_text = '';
            var _continuar = true;

            for (var x in _orden_arr) {
                if (x == 1) _orden_text += '.';
                _orden_text += _orden_arr[x];
            };

            _orden_repair = parseFloat(_orden_text);

            //Nivel 3
            if ($(this).hasClass('level-03')) {
                _table = 'W_ROL_OPCION_MENU';
                _data = {
                    C_MODULO: _fk_1,
                    C_MENU: _fk,
                    C_OPCION: _uid,
                    C_ROL: C_ROL,
                    FLAG_ESTADO: _state
                }
                if (_method == '2') {
                    _condition = "C_MODULO='" + _fk_1 + "' and C_MENU='" + _fk + "' and C_OPCION='" + _uid + "' AND C_ROL='" + C_ROL + "'";
                };
                if (_method == '2' && _state == '&') {
                    _method = 3;
                };
                if (_method == '1' && _state == '&') {
                    _continuar = false;
                };
            };

            if (_table != '' && _continuar == true) {
                $.AddPetition({
                    table: _table,
                    type: _method,
                    condition: _condition,
                    items: $.ConvertObjectToArr(_data)
                });
            };

        });

        //Agregando Data de Usuarios
        //var rowsUser = $(table01).jqxDataTable('getRows');
        //for (var item in rowsUser) {

        //    var _user = rowsUser[item];
        //    var _method = 1;
        //    var _condition = '';

        //    if (_user.MODO == 'Editar') {
        //        _method = 2;
        //        _condition = "C_ROL='" + C_ROL + "' AND C_USUARIO='" + _user.C_USUARIO + "'";
        //    };
        //    if (_user.MODO == 'Eliminado') {
        //        _method = 3;
        //        _condition = "C_ROL='" + C_ROL + "' AND C_USUARIO='" + _user.C_USUARIO + "'";
        //    };

        //    $.AddPetition({
        //        table: 'W_ROL_USUARIOS',
        //        type: _method,
        //        condition: _condition,
        //        items: $.ConvertObjectToArr({
        //            C_ROL: C_ROL,
        //            C_USUARIO: _user.C_USUARIO,
        //            FLAG_ESTADO: '*',
        //        })
        //    });

        //};

    };
    var checkCountDetail = function () {

        //var data_usuarios = $(table01).jqxDataTable('getRows');
        //var contar_usuarios = 0;
        var contar_opciones = 0;
        var continuar = true;

        //checks users load
        //for (var item in data_usuarios) {
        //    var _user = data_usuarios[item];
        //    if (_user.MODO != 'Eliminado') {
        //        contar_usuarios++;
        //    }
        //}
        //check options
        $('.zone-opciones').find('li.level-03').each(function () {
            var checked = $(this).attr('data-checked') || '&';
            if (checked == '*') {
                contar_opciones++;
            }
        });

        if (contar_opciones == 0 && continuar == true) {
            require(["alertify"], function (alertify) {
                alertify.set('notifier', 'position', 'top-center');
                alertify.error('El perfil debe tener como mínimo un acceso habilitado.');
            });
            continuar = false;
        };

        //if (contar_usuarios == 0 && continuar == true && $('#TIPO_ROL').val() != '09708' && $('#TIPO_ROL').val() != '09709') {
        //    require(["alertify"], function (alertify) {
        //        alertify.set('notifier', 'position', 'top-right');
        //        alertify.error('El rol debe tener como minimo un Usuario Registrado.');
        //    });
        //    continuar = false;
        //};

        return continuar;

    };

    //Form Create Rol
    $('form[name=frmRegistroRol]').ValidForm({
        table: 'W_ROL',
        type: 1,
        querySave: true,
        onDone: function (form, controls) {
            //if ($(controls.C_ROL).val() != '') {
            //    $(controls.C_EMPRESA).attr('disabled', 'disabled')
            //    $(controls.TIPO_ROL).attr('disabled', 'disabled')
            //}

            //Cargando tabla de usuarios
            //tableLoadUser(controls);
            //Aplicando acciones a los botones usuario y opcion
            actionsButtons(controls);
            //Opciones por Empresa
            $(controls.C_EMPRESA).change(function () {
                var _buscar = $(this).val();
                $.GetQuery({
                    query: ['GET_FULL_MODULES_ROL_EMPRESA'],
                    items: [{
                        empresa: $.solver.session.SESSION_EMPRESA,
                        rol: $(controls.C_ROL).val()
                    }],
                    onBefore: function () {
                        $('button.btn-add-option').attr('disabled', 'disabled');
                    },
                    onReady: function (result) {
                        $('button.btn-add-option').removeAttr('disabled');
                        $.GenerateOptions(result, '.zone-opciones', 'S', 'N', 'N');
                    }
                });
            }).trigger('change');

            if ($(controls.TIPO_ROL).val() == '09708' || $(controls.TIPO_ROL).val() == '09709') {
                $('#contact-tab').parent().hide();
            }
            else {
                $('#contact-tab').parent().show();
            }

            $(controls.TIPO_ROL).change(function () {
                if ($(controls.TIPO_ROL).val() == '09708' || $(controls.TIPO_ROL).val() == '09709') {
                    $('#contact-tab').parent().hide();
                }
                else {
                    $('#contact-tab').parent().show();
                }
            });
        },
        onSubmit: function () {
            return checkCountDetail();
        },
        onDetail: function (form, controls) {
            addOptionsUsers($(controls.C_ROL).val());
            if ($(controls.FEC_CREAC).val() == '') {
                $.AddPetition({
                    type: 1,
                    table: 'EMPRESA_W_ROL',
                    items: $.ConvertObjectToArr({
                        C_EMPRESA: $(controls.COD_EMPRESA).val(),
                        C_ROL: $(controls.C_ROL).val(),
                        C_USUARIO_REGISTRA: $.solver.session.SESSION_ID,
                        IND_ESTADO: '*',
                        FEC_INICIO: '',
                        FEC_FIN: '',
                    }, {
                        FEC_INICIO: {
                            action: {
                                name: 'GetQueryId',
                                args: $.ConvertObjectToArr({
                                    script: 'gbl_obtener_fecha_server',
                                    column: 'FECHA_FORMATO',
                                })
                            }
                        },
                        FEC_FIN: {
                            action: {
                                name: 'GetQueryId',
                                args: $.ConvertObjectToArr({
                                    script: 'gbl_obtener_fecha_server',
                                    column: 'FECHA_FORMATO',
                                })
                            }
                        }
                    })
                });
            }
        },
        onReady: function () {
            document.location = $.solver.baseUrl + '/Perfil/MisUsuarios/';
        },
        onError: function (error) {
            $.CloseStatusBar();
            $.ShowError({ error: error });
        }
    });

    $('button.btn-save-rol').click(function () {
        $('form[name=frmRegistroRol]').submit();
    });

});