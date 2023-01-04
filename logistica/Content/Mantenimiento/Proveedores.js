require(["helper", "extras"], function () {
    require(["alertify", "bootbox"], function (alertify, bootbox) {
        alertify.set('notifier', 'position', 'top-center');

        //Variables
        const empresa = $.solver.session.SESSION_EMPRESA;
        const tblProveedores = $('#tblProveedores');

        const fnCrearTabla = function () {
            $(tblProveedores).CreateGrid({
                query: 'tbl_ventas_mantenimiento_clientes_listarproveedores',
                items: {
                    NOMBRE: function () {
                        return $('#_buscar').val() || '';
                    },
                    C_EMPRESA: empresa
                },
                sortcolumn: 'C_PROVEEDOR',
                sortdirection: 'DESC',
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
                    'C_PROVEEDOR': {
                        text: 'Cód. del proveedor',
                        width: 100
                    },
                    'RAZON_SOCIAL': {
                        text: 'Razón social',
                        width: 200
                    },
                    'DESCRIPCION_PARAMETRO': {
                        text: 'Tipo de documento',
                        width: 150
                    },
                    'RUC_CLIENTE': {
                        text: 'Nro. documento',
                        width: 150
                    },
                    'TELEFONO': {
                        text: 'Teléfono',
                        width: 120
                    },
                    'PROCEDENCIA': {
                        text: 'Procedencia',
                        width: 100
                    },
                    'CORREO_FACTURACION': {
                        text: 'Email',
                        width: 200
                    },
                    'IND_ESTADO': {
                        text: 'Estado',
                        width: 100,
                        cellsRenderer: function (row, column, value, rowData) {
                            if (value == '*') return '<div class="mt-2 jqx-grid-cell-middle-align"><span class="text-extra" style="color:green;"><i class="fa fa-check-circle" aria-hidden="true"></i> ACTIVO</span></div>';
                            if (value == '&') return '<div class="mt-2 jqx-grid-cell-middle-align"><span class="text-extra" style="color:red;"><i class="fa fa-exclamation-circle" aria-hidden="true"></i> INACTIVO</span></div>';
                        }
                    }
                },
                hiddens: ['TELEFONO'],
                config: {
                    sortable: true,
                    height: 600,
                    pageSize: 999999,
                    rendered: function () { }
                }
            });
        }
        const fnEliminarProveedor = function () {
            if ($(tblProveedores).jqxGrid('getrows').length == 0) {
                alertify.warning('Debes seleccionar un registro para editar.');
            }
            else {
                const index = $(tblProveedores).jqxGrid('getselectedrowindex');
                const object = $(tblProveedores).jqxGrid('getrows')[index];
                const id = object['C_PROVEEDOR'];

                $.AddPetition({
                    table: 'vet.PROVEEDORES',
                    type: 2,
                    condition: `C_PROVEEDOR = '${id}' AND C_EMPRESA = '${empresa}'`,
                    items: $.ConvertObjectToArr({
                        C_PROVEEDOR: object['C_PROVEEDOR'],
                        C_EMPRESA: empresa,
                        IND_ESTADO: '&'
                    })
                });
                $.SendPetition({
                    connectToLogin: 'S',
                    onReady: function (result) {
                        $.CloseStatusBar();
                        bootbox.hideAll();
                        alertify.success('Se desactivo el proveedor.');
                        $('form[name=filtrosRegProveedores]').submit();
                    },
                    onBefore: function () {
                        $.DisplayStatusBar({ message: 'Inactivando proveedor.' });
                    },
                    onError: function (_error) {
                        $.CloseStatusBar();
                        $.ShowError({ error: _error });
                    }
                });
            }
        }

        $('a#btnEditarPro').bind('click', function (e) {
            if ($(tblProveedores).jqxGrid('getrows').length == 0) {
                alertify.warning('Debes seleccionar un registro para editar.');
            }
            else {
                var index = $(tblProveedores).jqxGrid('getselectedrowindex');
                var id = $(tblProveedores).jqxGrid('getrows')[index].C_PROVEEDOR;
                document.location = $.solver.baseUrl + '/Mantenimiento/ProveedoresRegistro/'+ id;
            }
            e.preventDefault();
        });
        $('a#btnEliminarPro').bind('click', function (e) {
            fnEliminarProveedor();
            e.preventDefault();
        });

        $('form[name=filtrosRegProveedores]').ValidForm({
            type: -1,
            onReady: function (result) {
                $(tblProveedores).jqxGrid('updatebounddata');
            }
        });

        fnCrearTabla();
    });
});