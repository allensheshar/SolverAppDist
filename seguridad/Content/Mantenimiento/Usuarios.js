
require(['jqwidgets', "helper", "extras", 'bootstrap-select', 'fileinput.es'], function () {
    require(["alertify", "moment", "bootbox"], function (alertify, moment, bootbox) {

        alertify.set('notifier', 'position', 'top-center');

        var table01 = "#tableRegUsuarios";
        var GetFormEditer = function (url, condition) {

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

                    var LoadEmpresas = function (controls) {

                        $.GetQuery({
                            query: ['obtener_empresas_usuario', 'aus_documentoslaborales_administrarempresa_regsempresas'],
                            items: [{
                                c_usuario: function () {
                                    return $(controls.C_USUARIO).val() || '';
                                }
                            }, {
                                BUSCAR: ''
                            }],
                            onReady: function (data) {

                                var objListEmpresas = $('#tableEmpresas');
                                var ListEmpresas = data['aus_documentoslaborales_administrarempresa_regsempresas'].result.rows;
                                var ListPermisos = data['obtener_empresas_usuario'].result.rows;

                                //crear lista de empresas
                                objListEmpresas.html('<ul style="list-style: none;" class="p-0"></ul>');
                                for (var item in ListEmpresas) {
                                    var inRow = ListEmpresas[item];
                                    objListEmpresas.find('ul').append(`<li class="pt-2 pb-2 pl-2 border mb-1">${inRow.RazonSocial} <input type="checkbox" data-id="${inRow.Codigo}" id="check${inRow.Codigo}" value="1" class="float-right" /></li>`);
                                };

                                //aplicar permisos
                                for (var item in ListPermisos) {
                                    var inRow = ListPermisos[item];
                                    objListEmpresas.find(`input#check${inRow.C_EMPRESA}`).attr('checked', 'checked').attr('data-editar','1');
                                }

                            }
                        });

                    };

                    $(object).find('form[name=frmRegistroUsuarios]').ValidForm({
                        table: 'USUARIOS',
                        type: _type,
                        condition: _condition,
                        querySave: true,
                        queryDefault: {
                            query: ['editableUsuarios'],
                            type: [8],
                            items: [{
                                table: 'USUARIOS',
                                condition: _condition
                            }]
                        },
                        onDetail: function (form, controls) {

                            var objListEmpresas = $('#tableEmpresas');
                            objListEmpresas.find('input').each(function () {

                                if ($(this).is(':checked')) {

                                    var editer = $(this).attr('data-editar') || 0;

                                    if (editer == 0) {
                                        $.AddPetition({
                                            type: 1,
                                            table: 'USUARIOS_EMPRESA',
                                            items: $.ConvertObjectToArr({
                                                C_USUARIO: function () {
                                                    return $(controls.C_USUARIO).val();
                                                },
                                                C_EMPRESA: $(this).attr('data-id'),
                                                FEC_ASIGNACION: moment().format('DD/MM/YYYY'),
                                                C_USUARIO_ASIGNACION: $.solver.session.SESSION_ID
                                            })
                                        });
                                    };

                                } else {

                                    $.AddPetition({
                                        type: 3,
                                        table: 'USUARIOS_EMPRESA',
                                        condition: `C_EMPRESA='${$(this).attr('data-id')}' AND C_USUARIO='${$(controls.C_USUARIO).val()}'`
                                    });

                                }

                            });

                        },
                        onError: function (error) {
                            $.CloseStatusBar();
                            $.ShowError({ error: error });
                        },
                        onDone: function (form, controls) {
                            LoadEmpresas(controls);
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

        var totalLoad = 0;
        var updatingSelection = false;
        var updatingSelectionFromDataTable = false;
        var adaptador01 = new $.jqx.dataAdapter({
            dataType: "json",
            dataFields: [
                { name: 'Codigo', type: 'string' },
                { name: 'NOMBRES', type: 'string' },
                { name: 'Email', type: 'string' },
                { name: 'Telefono', type: 'string' },
                { name: 'Estado', type: 'string' },
                { name: 'FLAG_ADMINISTRADOR_TOTAL', type: 'string' },
                { name: 'C_USUARIO_REGISTRA', type: 'string' },
                { name: 'FECHA_MODIFICACION', type: 'string' },
                { name: 'DUPLICADO', type: 'string' }
            ],
            data: {
                BUSCAR: function () {
                    return $('input#_buscar').val() || '';
                }
            },
            id: 'id',
            type: 'POST',
            url: $.solver.services.api + "/Service/DataTables/aus_usuarios_administrarusuario_regusuarios/"
        });

        $(table01).jqxDataTable({
            serverProcessing: true,
            sortable: true,
            pageSize: 999,
            pageable: true,
            pagerButtonsCount: 10,
            source: adaptador01,
            columnsResize: true,
            editable: false,
            width: '100%',
            height: 780,
            columns: [
                {
                    text: 'Código', dataField: 'Codigo', width: '120', align: 'center', cellsalign: 'center'
                },
                {
                    text: 'Nombre de usuario', dataField: 'NOMBRES', width: '350', align: 'center', cellsalign: 'center'
                },
                {
                    text: 'Email', dataField: 'Email', width: '250', align: 'center', cellsalign: 'center'
                },
                //{
                //    text: 'Acceso Carga de Archivos', dataField: 'AccesoSistArchivos', width: '250', align: 'center', cellsalign: 'center'
                //},
                {
                    text: 'DUPLICADO', dataField: 'DUPLICADO', width: '250', align: 'center', cellsalign: 'center',
                    hidden: true
                },
                {
                    text: 'Teléfono', dataField: 'Telefono', width: '100', align: 'center', cellsalign: 'center'
                },
                {
                    text: 'Usu. modificación', dataField: 'C_USUARIO_REGISTRA', width: '150', align: 'center', cellsalign: 'center'
                },
                {
                    text: 'Fec. modificación', dataField: 'FECHA_MODIFICACION', width: '150', align: 'center', cellsalign: 'center'
                },
                {
                    text: 'Admin. total', dataField: 'FLAG_ADMINISTRADOR_TOTAL', width: '100', align: 'center', cellsalign: 'center', cellsRenderer: function (row, column, value, rowData) {
                        if (value == '*') return '<span style="color:green;" class="text-extra"> SI</span>';
                        if (value == '&') return '<span style="color:blue;" class="text-extra"> NO</span>';
                    }
                },
                {
                    text: 'Estado', dataField: 'Estado', width: '100', align: 'center', cellsalign: 'center', cellsRenderer: function (row, column, value, rowData) {
                        if (value == '*') return '<span style="color:blue;" class="text-extra"><i class="fa fa-check-circle" aria-hidden="true"></i> ACTIVO</span>';
                        if (value == '&') return '<span style="color:red;" class="text-extra"><i class="fa fa-exclamation-circle" aria-hidden="true"></i> INACTIVO</span>';
                    }
                }
            ],
            rendered: function () {
                if ($(table01 + " .form-check-row").length > 0) {
                    //Create Checkbox
                    $(table01 + " .form-check-row").jqxCheckBox({ checked: false });
                    //Activate Checkbox by Row
                    var selection = $(table01).jqxDataTable('getSelection');
                    for (var i = 0; i < selection.length; i++) {
                        // get a selected row.
                        var rowData = selection[i];
                        $(table01 + " #checkbox" + rowData.uid).jqxCheckBox({ checked: true });
                    };
                    //Event Change Checkbox
                    $(table01 + " .form-check-row").on('change', function (event) {
                        var parent = $(this).closest('div.form-check-row');
                        var args = event.args;
                        var _index = parseInt(parent.attr('data-row'));
                        if (args.checked) $(table01).jqxDataTable('selectRow', _index);
                        if (!args.checked) $(table01).jqxDataTable('unselectRow', _index);
                    });
                };
                totalLoad++;
            }
        });

        //Boton Buscar / Formulario Filter
        $('form[name=filtrosRegUsuarios]').submit(function () {
            $(table01).jqxDataTable('render');
        });
        //Accion Nueva Empresa
        $('a#btnNuevoUsuario').click(function (e) {
            document.location = $.solver.baseUrl + '/Mantenimiento/UsuariosRegistro/';
            e.preventDefault();
        });
        //Accion Editar
        $('a#btnEditarUsuario').bind('click', function (e) {
            var selection = $(table01).jqxDataTable('getSelection');
            if (selection.length != 0) {
                var id = selection[0].Codigo;
                var duplicado = selection[0].DUPLICADO;
                document.location = $.solver.baseUrl + '/Mantenimiento/UsuariosRegistro?id=' + id + '&duplicado=' + duplicado;
            } else {
                alertify.warning('Debes seleccionar un registro para editar.');
            }
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
                        codigo_formato: 'correo_auto_nuevo_boleta_usuario',
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
                usuario = selection[0].Codigo;
                email = selection[0].Email;
                enviarAccesos();
            } else {
                alertify.warning('Debes seleccionar un registro para reenviar sus accesos.');
            };

            e.preventDefault();
        });
    });
});