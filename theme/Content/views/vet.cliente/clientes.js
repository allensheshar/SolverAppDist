require(["helper", "extras"], function () {
    require(["alertify", "bootbox"], function (alertify, bootbox) {
        alertify.set('notifier', 'position', 'top-center');

        //Variables
        const empresa = $.solver.session.SESSION_EMPRESA;
        const tblClientes = $('#tblClientes');

        const fnCrearTabla = function () {
            $(tblClientes).CreateGrid({
                query: 'tbl_ventas_mantenimiento_clientes_listarclientes',
                items: {
                    NOMBRE: function () {
                        return $('#_buscar').val() || '';
                    },
                    C_EMPRESA: empresa
                },
                sortcolumn: 'C_CLIENTE',
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
                    'C_CLIENTE': {
                        text: 'Cód. del cliente',
                        width: 100
                    },
                    'RAZON_SOCIAL': {
                        text: 'Razón social',
                        width: 200
                    },
                    'DESCRIPCION_PARAMETRO': {
                        text: 'Tipo de doc.',
                        width: 100,
                        cellsAlign: 'center'
                    },
                    'RUC_CLIENTE': {
                        text: 'Nro. doc.',
                        width: 150,
                        cellsAlign: 'center'
                    },
                    'PROCEDENCIA': {
                        text: 'Procedencia',
                        width: 100,
                        cellsAlign: 'center'
                    },
                    'CORREO_FACTURACION': {
                        text: 'Correo de facturación',
                        width: 250,
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
                config: {
                    sortable: true,
                    height: 600,
                    pageSize: 999999,
                    rendered: function () { }
                }
            });
        }
        const fnEliminarCliente = function () {
            const index = $(tblClientes).jqxGrid('getselectedrowindex');
            const object = $(tblClientes).jqxGrid('getrows')[index];
            const id = object['C_CLIENTE'];
            $.AddPetition({
                table: 'vet.CLIENTE',
                type: 2,
                condition: `C_CLIENTE = '${id}' AND C_EMPRESA = '${empresa}'`,
                items: $.ConvertObjectToArr({
                    C_CLIENTE: id,
                    C_EMPRESA: empresa,
                    IND_ESTADO: 'E'
                })
            });
            $.SendPetition({
                connectToLogin: 'S',
                onReady: function (result) {
                    $.CloseStatusBar();
                    bootbox.hideAll();
                    alertify.success('Se eliminó el cliente.');
                    $('form[name=filtrosRegClientes]').submit();
                },
                onBefore: function () {
                    $.DisplayStatusBar({ message: 'Eliminando cliente.' });
                },
                onError: function (_error) {
                    $.CloseStatusBar();
                    $.ShowError({ error: _error });
                }
            });
        }
        const fnValidarCategorias = function () {
            $.GetQuery({
                query: ['q_ventas_mantenimiento_clienteregistro_validarcategoria'],
                items: [{
                    EMPRESA: empresa
                }],
                onReady: function (result) {
                    if (result.length == 0) {
                        alertify.alert('Mensaje del sistema', 'No se definido ningún tipo de cliente. Por favor crearlas.', function () {
                            document.location = $.solver.baseUrl + '/Mantenimiento/Configuraciones';
                        });
                    }
                }
            })
        }

        $('a#btnEditarCli').bind('click', function (e) {
            var index = $(tblClientes).jqxGrid('getselectedrowindex');
            if (index == -1) {
                alertify.warning('Debes seleccionar un registro para editar.');
            } else {
                document.location = $.solver.baseUrl + '/Mantenimiento/ClientesRegistro/' + $(tblClientes).jqxGrid('getrows')[index].C_CLIENTE;
            }
            e.preventDefault();
        });
        $('a#btnEliminarCli').bind('click', function (e) {
            var index = $(tblClientes).jqxGrid('getselectedrowindex');
            if (index == -1) {
                alertify.warning('Debes seleccionar un registro para editar.');
            } else {
                alertify.confirm('Confirmar acción', '¿Seguro que desea eliminar al cliente seleccionado?', fnEliminarCliente, null)
                    .set('labels', { ok: 'Si', cancel: 'No' }).set('defaultFocus', 'ok').set('closable', false);
            }
            e.preventDefault();
        });
        $('a#btnDescargar').bind('click', function (e) {
            $.solver.fn.fnDescargarCliente(function () { return $('#_buscar').val() || ''; });
            e.preventDefault();
        });
        $('form[name=filtrosRegClientes]').ValidForm({
            type: -1,
            onReady: function (result) {
                $(tblClientes).jqxGrid('updatebounddata');
            }
        });

        fnValidarCategorias();
        fnCrearTabla();
    });
});