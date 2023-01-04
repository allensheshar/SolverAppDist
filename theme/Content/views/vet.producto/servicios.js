require(["helper", "extras"], function () {
    require(["alertify"], function (alertify) {
        alertify.set('notifier', 'position', 'top-center');

        //Variables
        const tblServicios = $('#tblServicios');
        const empresa = $.solver.session.SESSION_EMPRESA;

        const fnCrearTabla = function () {
            $(tblServicios).CreateGrid({
                query: 'tbl_ventas_mantenimiento_servicios_listarservicios',
                items: {
                    NOMBRE: function () {
                        return $('#_buscar').val() || '';
                    },
                    C_EMPRESA: empresa
                },
                hiddens: ['C_EMPRESA', 'NOMBRE_GENERICO', 'C_UNIDAD_NEGOCIO_REF', 'AFECTACION_IGV', 'DETRACCION'],
                sortcolumn: 'C_PRODUCTO',
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
                    'C_PRODUCTO': {
                        text: 'Cód. serv.',
                        width: 80
                    },
                    'C_PRODUCTO_REF': {
                        text: 'Cód. de ref.',
                        width: 80
                    },
                    'DESCRIPCION_PARAMETRO': {
                        text: 'Tipo de producto',
                        width: 100,
                    },
                    'NOMBRE_PARA_VENTA': {
                        text: 'Nombre',
                        width: 160
                    },
                    'CENTRO': {
                        text: 'Centro de costo',
                        width: 120
                    },
                    'NOMBRE_CATEGORIA': {
                        text: 'Categoría',
                        width: 220
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
                    pageSize: 999999,
                    rendered: function () {
                        $(tblServicios).jqxGrid('selectrow', 0);
                    }
                }
            });
            $(tblServicios).on('rowdoubleclick', function () {
                actionEditarServicio();
            })
        };
        const actionEditarServicio = function () {
            var index = $(tblServicios).jqxGrid('getselectedrowindex');
            var id = $(tblServicios).jqxGrid('getrows')[index].C_PRODUCTO;
            if (id.length != 0) document.location = $.solver.baseUrl + '/Mantenimiento/ServicioRegistro/' + id;
            else alertify.warning('Debes seleccionar un registro para editar.');
        }

        $('a#btnEditarServ').bind('click', function (e) {
            actionEditarServicio();
            e.preventDefault();
        });
        $('a#btnDescargar').bind('click', function (e) {
            $.solver.fn.fnDescargarServiciosServicio(function () { return $('#_buscar').val() || ''; });
            e.preventDefault();
        });
        $('form[name=filtrosRegServicio]').ValidForm({
            type: -1,
            onReady: function (result) {
                $(tblServicios).jqxGrid('updatebounddata');
            }
        });

        fnCrearTabla();
    });
});