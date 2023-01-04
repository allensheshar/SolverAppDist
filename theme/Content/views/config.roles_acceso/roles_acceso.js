require(["jqwidgets", "helper"], function () {

    let urlActionNuevo = '';
    const table01 = "#tableRegRoles";
    const fnCrearTabla = function () {
        $(table01).CreateTable({
            query: 'GET_ROLES_FULL_V2',
            items: {
                BUSCAR: function () {
                    return $('input#_buscar').val() || '';
                },
                TIPO: function () {
                    return $('select#TIPO_ROL').val() || '';
                },
                PATH: $.solver.basePath
            },
            hiddens: ['FEC_CREAC', 'USU_CREAC', 'HOST_CREAC', 'C_EMPRESA', 'HOST_MODIF', 'DESCRIPCION', 'TIPO_ROL', 'USU_MODIF', 'NOMBRE_EMPRESA'],
            //sortColumns: {
            //    FEC_MODIF: 'DESC'
            //},
            sortcolumn: 'FEC_MODIF',
            sortdirection: 'DESC',
            columns: {
                C_ROL: { text: 'Código', width: '60', align: 'center', cellsalign: 'center', cellsAlign: 'center' },
                NOMBRE_EMPRESA: { text: 'Empresa propietaria', width: '250', align: 'center', cellsalign: 'center' },
                NOMBRE: { text: 'Nombre del rol', width: '250', align: 'center', cellsalign: 'center' },
                FLAG_ESTADO: {
                    text: 'Estado', width: '100', align: 'center', cellsalign: 'center', cellsAlign: 'center',
                    cellsRenderer: function (row, column, value, rowData) {
                        if (value == '*') return '<span class="text-extra" style="color:green;"><i class="fa fa-check-circle" aria-hidden="true"></i> ACTIVO</span>';
                        if (value == '&') return '<span class="text-extra" style="color:red;"><i class="fa fa-exclamation-circle" aria-hidden="true"></i> INACTIVO</span>';
                    }
                },
                USU_CREAC: { text: 'Creador por', width: '150', align: 'center', cellsalign: 'center' },
                FEC_CREAC: { text: 'Fecha creación', width: '180', align: 'center', cellsalign: 'center', cellsformat: 'dd/MM/yyyy HH:mm:ss' },
                USU_MODIF: { text: 'Modificado por', width: '150', align: 'center', cellsalign: 'center' },
                FEC_MODIF: { text: 'Fecha modificación', width: '180', align: 'center', cellsalign: 'center', cellsformat: 'dd/MM/yyyy HH:mm:ss', cellsAlign: 'center' },
                DESCRIPCION_PARAMETRO: { text: 'Tipo de rol', width: '150', align: 'center', cellsalign: 'center', cellsAlign: 'center' },
                'Limite Usuarios': { width: '80', align: 'center', cellsAlign: 'center' },
                'Limite Operaciones': { width: '80', align: 'center', cellsAlign: 'center' },
                'Limite Locales': { width: '80', align: 'center', cellsAlign: 'center' },
                'Limite Almacenes': { width: '80', align: 'center', cellsAlign: 'center' },
                Accion: {
                    text: 'Acciones', width: '150', align: 'center', cellsalign: 'center', cellsRenderer: function (row, column, value, rowData) {
                        var _editar = '<a href="' + urlActionNuevo + '/' + rowData["C_ROL"] + '" data-id="' + rowData["C_ROL"] + '" class="btn-editar"><i class="fa fa-pencil-square" aria-hidden="true"></i> Editar</a>';
                        var _eliminar = '<a href="#" data-id="' + rowData["C_ROL"] + '" class="btn-eliminar"><i class="fa fa-times" aria-hidden="true"></i> Eliminar</a>';
                        return _editar + ' | ' + _eliminar;
                    },
                    pinned: true
                }
            },
            config: {
                pageSize: 500,
                rendered: function () {
                    $('a.btn-eliminar').unbind('click');
                    $('a.btn-eliminar').bind('click', function (e) {

                        var _rol = $(this).attr('data-id');

                        require(['alertify'], function (alertify) {
                            var _deleting = function () {

                                $.AddPetition({
                                    table: 'W_ELIMINA_ROL_MOD_SEGURIDAD',
                                    type: 6,
                                    items: $.ConvertObjectToArr({
                                        rol: _rol,
                                    })
                                });

                                $.SendPetition({
                                    onBefore: function () {
                                        $.DisplayStatusBar({ message: 'Espere porfavor, estamos eliminando tu registro...' });
                                    },
                                    onReady: function () {
                                        $.CloseStatusBar();
                                        $(table01).jqxDataTable('render');
                                    },
                                    onError: function (error) {
                                        $.CloseStatusBar();
                                        $.ShowError({ error: error });
                                    }
                                });

                            };

                            alertify.confirm('Confirmar Acción', '¿Seguro de Eliminar el Registro?', function () {
                                _deleting();
                            }, function () {
                                //console.log('Operacion cancelada...');
                            }).set('labels', { ok: 'Si', cancel: 'No' }).set('defaultFocus', 'cancel');

                        });

                        e.preventDefault();

                    });
                }
            }
        });
    };
    
    $('form[name=filtrosRegRoles]').ValidForm({
        type: -1,
        onDone: function (form, controls) {

            if ($.solver.basePath == '/administracion') {
                $(controls.TIPO_ROL).val('09708').attr('readonly', 'readonly').css({ 'pointer-events': 'none' });
            };

            fnCrearTabla();

        },
        onReady: function () {
            $(table01).jqxDataTable('render');
        }
    });

    if ($.solver.basePath == '/administracion') $('a#lnkNuevo').html('<i class="fa fa-plus-square" aria-hidden="true"></i> Nuevo Plan');
    if ($.solver.basePath == '/administracion') urlActionNuevo = $.solver.basePath + '/Mantenimiento/RolesRegistro';
    if ($.solver.basePath == '/seguridad') urlActionNuevo = $.solver.basePath + '/Configurar/RolesRegistro';

    $('a#lnkNuevo').attr('href', urlActionNuevo);

});