require(["helper", "extras"], function () {
    require(["alertify"], function (alertify) {
        alertify.set('notifier', 'position', 'top-center');

        //Variables
        const tblProductos = $('#tblProductos');
        let _controls;

        const fnCrearTabla = function () {
            $(tblProductos).CreateGrid({
                query: 'q_logistica_mantenimiento_productos_listaproductos_v2',
                items: {
                    C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                    C_CATEGORIA: function () {
                        return $(_controls.C_CATEGORIA).val() || '';
                    },
                    TIPO_PRODUCTO: function () {
                        return $(_controls.C_PARAMETRO_GENERAL_TIPO_PRODUCTO).val() || '';
                    },
                    IND_ESTADO: function () {
                        return $(_controls.IND_ESTADO).val();
                    },
                    PROMOCION: function () {
                        return $(_controls.PROMOCION).val();
                    },
                    STOCK_ILIMITADO: function () {
                        return $(_controls.STOCK_ILIMITADO).val();
                    },
                    NOMBRE: function () {
                        return $(_controls.buscar).val() || '';
                    },
                },
                sortcolumn: 'C_PRODUCTO',
                sortdirection: 'DESC',
                hiddens: ['CENTRO', 'C_UNIDAD_NEGOCIO_REF', 'AFECTACION_IGV', 'DETRACCION', 'TIPO_UNIDAD'],
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
                        text: 'Cód. prod.',
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
                    'NOMBRE': {
                        text: 'Nombre',
                        width: 160
                    },
                    'STOCK_ILIMITADO': {
                        text: 'Stock ilimitado',
                        width: 80
                    },
                    'PROMOCION': {
                        text: 'Promoción',
                        width: 80
                    },
                    'CENTRO': {
                        text: 'Centro de costo',
                        width: 120
                    },
                    'NOMBRE_CATEGORIA': {
                        text: 'Categoría',
                        width: 220
                    },
                    'FACTOR': {
                        text: 'Factor',
                        width: 60,
                        cellsAlign: 'right',
                        cellsFormat: 'd2'
                    },
                    'PRINCIPAL': {
                        text: 'Und. principal',
                        width: 100
                    },
                    'AUXILIAR': {
                        text: 'Und. auxiliar',
                        width: 100
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
                    pageSize: 100,
                    rendered: function () {
                        $(tblProductos).jqxGrid('selectrow', 0);
                    }
                }
            });
            $(tblProductos).on('rowdoubleclick', function () {
                actionEditarProducto();
            });
        }
        const actionEditarProducto = function () {
            var index = $(tblProductos).jqxGrid('getselectedrowindex');
            if (index != -1) document.location = $.solver.baseUrl + '/Mantenimiento/ProductoRegistro/' + $(tblProductos).jqxGrid('getrows')[index].C_PRODUCTO;
            else alertify.warning('Debes seleccionar un registro para editar.');
        }

        $('a#btnEditarProd').bind('click', function (e) {
            actionEditarProducto();
            e.preventDefault();
        });
        $('a#btnDescargar').bind('click', function (e) {
            $.solver.fn.fnDescargarProductosMercaderia(
                function () {
                    return $('#_buscar').val() || '';
                },
                function () {
                    if ($.solver.basePath == '/ventas') return '07228';
                    if ($.solver.basePath == '/puntoventa') return '07228';
                    if ($.solver.basePath == '/restaurant') return '09994';
                }
            );
            e.preventDefault();
        });
        $('form[name=filtrosRegProductos]').ValidForm({
            type: -1,
            onDone: function (_, controls) {
                _controls = controls;
                fnCrearTabla();
            },
            onReady: function (result) {
                $(tblProductos).jqxGrid('updatebounddata');
            }
        });


    });
});