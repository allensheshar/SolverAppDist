require(["helper", "extras", 'bootstrap-select', 'fileinput.es'], function () {
    require(["alertify", "bootbox"], function (alertify, bootbox) {
        alertify.set('notifier', 'position', 'top-center');

        //Variables
        const table = '#table';
        const table2 = '#table2';
        const empresa = $.solver.session.SESSION_EMPRESA;
        let _controls = null;
        let _controls2 = null;

        const fnObtenerAlerta = function (message) {
            alertify.alert()
                .setting({
                    'title': 'Mensaje del Sistema',
                    'message': message,
                }).show();
        };
        const fnCrearTabla = function () {
            $(table).CreateGrid({
                query: 'tbl_admusuarios_listarusuarios',
                items: {
                    BUSCAR: function () {
                        return $(_controls.buscar).val() || '';
                    },
                    C_EMPRESA: empresa
                },
                hiddens: [''],
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
                    'C_USUARIO': {
                        text: 'Cód. usuario',
                        width: 150
                    },
                    'NOMBRE': {
                        text: 'Nombres',
                        width: 200
                    },
                    'EMAIL': {
                        text: 'Email',
                        width: 200
                    },
                    'TELEFONO': {
                        text: 'Teléfono',
                        width: 100
                    },
                    'FIRMA': {
                        text: 'Firma',
                        columntype: 'checkbox',
                        width: 60
                    },
                    'ESTADO': {
                        text: 'Estado',
                        width: 100,
                        cellsRenderer: function (row, column, value, rowData) {
                            if (value == '*') return '<div class="mt-2 jqx-grid-cell-middle-align"><span class="text-extra" style="color:green;"><i class="fa fa-check-circle" aria-hidden="true"></i> ACTIVO</span></div>';
                            if (value == '&') return '<div class="mt-2 jqx-grid-cell-middle-align"><span class="text-extra" style="color:red;"><i class="fa fa-exclamation-circle" aria-hidden="true"></i> INACTIVO</span></div>';
                        }
                    }
                },
                config: {
                    sortable: true,
                    height: 400,
                    pageSize: 999999,
                    rendered: function () {
                    }
                }
            });
        };
        const fnCrearTabla2 = function () {
            $(table2).CreateGrid({
                query: 'tbl_admusuarios_listarperfil',
                items: {
                    BUSCAR: function () {
                        return $(_controls2.buscar).val() || '';
                    },
                    C_EMPRESA: empresa
                },
                hiddens: ['TIPO_ROL', 'DESCRIPCION', 'C_ROL'],
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
                    //'C_ROL': {
                    //    text: 'Cód. del Perfil',
                    //    width: 80
                    //},
                    'NOMBRE': {
                        text: 'Nombre del Perfil',
                        width: 350
                    },
                    //'DESCRIPCION': {
                    //    text: 'Descripción',
                    //    width: 350
                    //}
                },
                config: {
                    sortable: true,
                    height: 400,
                    pageSize: 999999,
                    rendered: function () {
                        //$(tblVendedor).jqxGrid('selectrow', 0);
                    }
                }
            });
        };

        $('a#btnAgregar').bind('click', function (e) {
            document.location.href = $.solver.baseUrl + "/Perfil/MisUsuariosRegistro/";
            e.preventDefault();
        });
        $('a#btnEditar').bind('click', function (e) {
            var index = $(table).jqxGrid('getselectedrowindex');
            if (index == -1) alertify.warning('Debes seleccionar un registro para editar.');
            else {
                var id = $(table).jqxGrid('getrows')[index].C_USUARIO;
                document.location.href = $.solver.baseUrl + `/Perfil/MisUsuariosRegistro/${id}`;
            }
            e.preventDefault();
        });
        $('a#btnDescargar').bind('click', function (e) {
            $.solver.fn.fnDescargarVendedor(function () { return $(_controls.buscar).val() || ''; })
            e.preventDefault();
        });
        $('a#btnAgregarPerfil').bind('click', function (e) {
            document.location.href = $.solver.baseUrl + "/Perfil/MisPerfilesRegistro/";
            e.preventDefault();
        });
        $('a#btnEditarPerfil').bind('click', function (e) {
            var index = $(table2).jqxGrid('getselectedrowindex');
            if (index == -1) alertify.warning('Debes seleccionar un registro para editar.');
            else {
                var id = $(table2).jqxGrid('getrows')[index].C_ROL;
                document.location.href = $.solver.baseUrl + `/Perfil/MisPerfilesRegistro/${id}`;
            }
            e.preventDefault();
        });
        $('a#btnDescargarPerfil').bind('click', function (e) {
            $.solver.fn.fnDescargarPerfilEmpresa(function () { return $(_controls.buscar).val() || ''; })
            e.preventDefault();
        });
        $('form[name=frmUsuarios]').ValidForm({
            type: -1,
            onReady: function (result) {
                $(table).jqxGrid('updatebounddata');
            },
            onDone: function (_, controls) {
                _controls = controls;
                fnCrearTabla();
            }
        });
        $('form[name=frmPerfil]').ValidForm({
            type: -1,
            onReady: function () {
                $(table2).jqxGrid('updatebounddata');
            },
            onDone: function (_, controls) {
                _controls2 = controls;
                fnCrearTabla2();
            }
        });

    });
});