require(["helper", "extras", "datetimepicker"], function () {
    require(["alertify", "bootbox", "moment"], function (alertify, bootbox, moment) {
        alertify.set('notifier', 'position', 'top-center');

        const c_empresa = $.solver.session.SESSION_EMPRESA;
        const table = '#table';
        var form = 'form[name=frm]';
        var _controls;
        var estado = false;

        const fnCrearTabla = function () {
            $(table).CreateGrid({
                query: 'tbl_logistica_procesos_listar',
                hiddens: ['ID_OPERACION'],
                items: {
                    C_EMPRESA: c_empresa,
                    DESDE: function () {
                        return $(_controls.desde).val();
                    },
                    HASTA: function () {
                        return $(_controls.hasta).val();
                    },
                    NOMBRE: function () {
                        return $(_controls.nombre).val();
                    },
                    C_PAIS: function () {
                        return $(_controls.pais).val();
                    },
                    C_CANAL: function () {
                        return $(_controls.canal).val();
                    },
                    ESTADO: function () {
                        return $(_controls.estado).val();
                    },
                    FLAG_TIPO: 'I',
                },
                sortdirection: 'DESC',
                sortcolumn: 'NRO_OPERACION',
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
                    'NRO_OPERACION': {
                        text: 'Nro. operación',
                        width: 110
                    },
                    'RAZON_SOCIAL': {
                        text: 'Razón social',
                        width: 300
                    },
                    'NOMBRE': {
                        text: 'Nombre',
                        width: 150
                    },
                    'DUA': {
                        text: 'Dua',
                        width: 150
                    },
                    'PAIS': {
                        text: 'Pais',
                        width: 200
                    },
                    'FECHA': {
                        text: 'Fecha',
                        width: 100
                    },
                    'CANAL': {
                        text: 'Canal',
                        width: 120
                    },
                    'ESTADO': {
                        text: 'Estado',
                        width: 130
                    },
                },
                config: {

                }
            });
        }
        const actionNuevo = function () {
            location.href = $.solver.baseUrl + '/Procesos/ImportacionesRegistro'
        }
        const actionEditar = function () {
            var rows = $(table).jqxGrid('getrows');

            if (rows.length > 0) {
                var index = $(table).jqxGrid('getselectedrowindex');
                if (index == -1) {
                    alertify.warning('Por favor seleccione un registro')
                }
                else {
                    var id = $(table).jqxGrid('getrows')[index]['ID_OPERACION'];
                    location.href = $.solver.baseUrl + '/Procesos/ImportacionesRegistro/' + id;
                }
            }
            else {
                alertify.warning('No hay registros');
            }
        }

        $(form).ValidForm({
            type: -1,
            onReady: function () {
                $(table).jqxGrid('updatebounddata')
            },
            onDone: function (_, controls) {
                _controls = controls;
                fnCrearTabla();

                $('#acciones').CreateActions({
                    text: 'Acciones',
                    class: 'btn btn-sm btn-orange btn-block',
                    actions: {
                        'Nuevo': {
                            callback: actionNuevo
                        },
                        'Editar': {
                            callback: actionEditar
                        }
                    }
                })

                $(controls.desde).datetimepicker({
                    format: 'DD/MM/YYYY',
                    locale: 'es'
                });

                $(controls.hasta).datetimepicker({
                    format: 'DD/MM/YYYY',
                    locale: 'es'
                });
            }
        })

    });
});