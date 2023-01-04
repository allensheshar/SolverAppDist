require(["helper", "extras", "datetimepicker", "bootstrap-select"], function () {
    require(["alertify", "bootbox", "moment", "inputmask", "numeral"], function (alertify, bootbox, moment, inputmask, numeral) {
        alertify.set('notifier', 'position', 'top-center');
        const table = '#table';
        const frm = 'form[name=frm]';
        let _controls = null;

        const fnCrearTabla = function () {
            $(table).CreateGrid({
                query: 'tbl_puntoventa_mantenimiento_listaprecio',
                items: {
                    C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                    C_PRODUCTO: function () {
                        return $(_controls.C_PRODUCTO).val();
                    },
                    C_CLIENTE_CATEGORIA: function () {
                        return $(_controls.C_CLIENTE_CATEGORIA).val();
                    },
                    TIPO_CONFIG: function () {
                        return $(_controls.TIPO_CONFIG).val();
                    },
                },
                hiddens: ['C_PRODUCTO_PRECIO', 'IND_ESTADO'],
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
                        text: 'Cod. prod.',
                        width: 80
                    },
                    'NOMBRE_PARA_VENTA': {
                        text: 'Producto',
                        width: 200,
                    },
                    'TIPO_CLIENTE': {
                        text: 'Tipo cliente',
                        width: 110,
                    },
                    'UNIDAD': {
                        text: 'Unidad',
                        width: 100,
                    },
                    'MONEDA': {
                        text: 'Moneda',
                        width: 80,
                    },
                    'PRECIO': {
                        text: 'Precio',
                        cellsAlign: 'right',
                        cellsFormat: 'd2',
                        width: 60,
                    },
                    'TIPO': {
                        text: 'Tipo',
                        width: 150,
                    },
                    'MODO': {
                        text: 'Modo',
                        width: 200,
                    },
                    'HORA': {
                        text: 'Hora',
                        width: 150,
                    },
                    'C_USUARIO_REGISTRO': {
                        text: 'Usuario'
                    },
                    'ACCIONES': {
                        text: 'Acciones',
                        width: 180,
                        createwidget: function (row, column, value, htmlElement) {
                            $(table).jqxGrid('refresh');
                        },
                        initwidget: function (rowIndex, column, value, htmlElement) {
                            var row = $(table).jqxGrid('getrows')[rowIndex];

                            $(htmlElement).html('');
                            $(htmlElement).addClass('jqx-grid-cell-left-align');
                            $(htmlElement).addClass('mt-1');

                            if (row['IND_ESTADO'] == '*') {
                                let _btnEditar;
                                _btnEditar = $(`<a id="editar" style="cursor: pointer;" class="jqx-grid-widget">&nbsp;Editar</a>`);
                                $(htmlElement).append(_btnEditar);
                                $(htmlElement).find('a#editar').unbind('click');
                                $(htmlElement).find('a#editar').click(function () {
                                    fnAgregarPrecio(2, rowIndex);
                                });
                                $(htmlElement).append(' / ')

                                let _btnDuplicar;
                                _btnDuplicar = $(`<a id="duplicar" style="cursor: pointer;" class="jqx-grid-widget">&nbsp;Duplicar</a>`);
                                $(htmlElement).append(_btnDuplicar);
                                $(htmlElement).find('a#duplicar').unbind('click');
                                $(htmlElement).find('a#duplicar').click(function () {
                                    fnDuplicar(rowIndex);
                                });

                                $(htmlElement).append(' / ')
                                let _btnEliminar;
                                _btnEliminar = $(`<a id="eliminar" style="cursor: pointer;" class="jqx-grid-widget">&nbsp;Eliminar</a>`);
                                $(htmlElement).append(_btnEliminar);
                                $(htmlElement).find('a#eliminar').unbind('click');
                                $(htmlElement).find('a#eliminar').click(function () {
                                    fnEliminar(rowIndex);
                                });
                            }

                        },
                    }
                },
                config: {
                    pageSize: 100,
                    editable: false
                }
            })
        }
        const fnAgregarPrecio = function (type, index) {
            var condicion;
            var rowIndex;
            var row;

            if (type == 1) {
                rowIndex = $(table).jqxGrid('getselectedrowindex');
                row = $(table).jqxGrid('getrows')[rowIndex];
            }
            if (type == 2) {
                row = $(table).jqxGrid('getrows')[index];
                condicion = `C_EMPRESA = '${$.solver.session.SESSION_EMPRESA}' AND C_PRODUCTO = '${row['C_PRODUCTO']}' AND C_PRODUCTO_PRECIO = '${row["C_PRODUCTO_PRECIO"]}'`
            }

            var c_producto = row['C_PRODUCTO'];
            var nombre_producto = row['NOMBRE_PARA_VENTA'];

            $.GetData({
                title: '<strong>Registro de precio</strong>',
                uriData: $.solver.baseUrl + '/Mantenimiento/ListaPrecioRegistro/',
                location: 'float',
                type: 'GET',
                isPage: true,
                onReady: function (objectPrecio, modalPrecio) {
                    var _controlsPrecio = null;
                    $(modalPrecio).find('.modal-dialog').css({ 'max-width': '40%' });

                    $(objectPrecio).find('input[name=C_PRODUCTO]').val(c_producto);
                    $(objectPrecio).find('#nombre_producto').text('Producto: ' + nombre_producto);
                    $(objectPrecio).find('select[name=C_PARAMETRO_GENERAL_UNIDAD]').attr('data-C_PRODUCTO', c_producto)

                    $(objectPrecio).find('form[name=frmPrecio]').ValidForm({
                        table: 'VET.PRODUCTO_PRECIO',
                        type: type,
                        condition: condicion,
                        querySave: true,
                        extras: {
                            C_PRODUCTO_PRECIO: {
                                action: {
                                    name: 'GetNextId',
                                    args: $.ConvertObjectToArr({
                                        columns: 'C_EMPRESA,C_PRODUCTO',
                                        max_length: 3
                                    })
                                }
                            }
                        },
                        queryDefault: {
                            query: ['editablePrecio'],
                            type: [8],
                            items: [{
                                table: 'VET.PRODUCTO_PRECIO',
                                condition: condicion
                            }]
                        },
                        onDetail: function () {

                            $.AddPetition({
                                type: 4,
                                items: $.ConvertObjectToArr({
                                    script: 'spw_gbl_mantenimiento_listaprecios_validarduplicados',
                                    C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                                    C_PRODUCTO: c_producto,
                                }),
                                transaction: true
                            });

                        },
                        onSubmit: function (form, controls, objParent) {
                            var dias = [];
                            var tipoConfig = $(form).find('input[type=radio][name=tipoprecio]:checked').val();
                            objParent.TIPO_CONFIG = tipoConfig
                            objParent.C_USUARIO_REGISTRO = $.solver.session.SESSION_ID

                            if (tipoConfig == '09995') {
                                objParent.DIAS = null
                                objParent.FECHA_DESDE = null
                                objParent.FECHA_HASTA = null
                            }
                            if (tipoConfig == '09996') {
                                objParent.DIAS = null
                            }
                            if (tipoConfig == '09997') {
                                $.each($(form).find('input[type=checkbox]'), function (i, dia) {
                                    if ($(dia).is(':checked')) {
                                        dias.push($(dia).attr('data-value'));
                                    }
                                })
                                objParent.DIAS = dias.join('|')

                                objParent.FECHA_DESDE = null
                                objParent.FECHA_HASTA = null
                            }

                            if (objParent.FECHA_DESDE == '') objParent.FECHA_DESDE = null
                            if (objParent.FECHA_HASTA == '') objParent.FECHA_HASTA = null

                        },
                        onReady: function () {
                            $(frm).submit();
                            $(modalPrecio).modal('hide');
                        },
                        onDone: function (_, controls) {
                            _controlsPrecio = controls;

                            $('.porfecha').hide();
                            $('.pordia').hide();

                            $(objectPrecio).find('input[type=radio][name=tipoprecio]').change(function () {
                                $('.porfecha').hide();
                                $('.pordia').hide();
                                if ($(this).val() == '09996') $('.porfecha').show()
                                if ($(this).val() == '09997') $('.pordia').show()
                            });

                            if ($(controls.TIPO_CONFIG).val() != '') {
                                $(objectPrecio).find('input[type=radio][name=tipoprecio]').filter(
                                    x => $($(objectPrecio).find('input[type=radio][name=tipoprecio]')[x]).val() == $(controls.TIPO_CONFIG).val()
                                ).trigger('click');

                                if ($(controls.TIPO_CONFIG).val() == '09997') {
                                    var dias = $(controls.DIAS).val().split('|')
                                    if (dias.length > 0) {
                                        $.each(dias, function (i, dia) {
                                            $($(objectPrecio).find('input[type=checkbox]').filter(
                                                x => $($(objectPrecio).find('input[type=checkbox]')[x]).attr('data-value') == dia
                                            )[0]).prop('checked', true);
                                        })
                                    }
                                }
                            }

                            if ($(controls.FECHA_DESDE).val() != '') {
                                $(controls.FECHA_DESDE).val(moment($(controls.FECHA_DESDE).val()).format('DD/MM/YYYY'));
                            }
                            if ($(controls.FECHA_HASTA).val() != '') {
                                $(controls.FECHA_HASTA).val(moment($(controls.FECHA_HASTA).val()).format('DD/MM/YYYY'));
                            }
                            $(controls.FECHA_DESDE).datetimepicker({
                                format: 'DD/MM/YYYY',
                                locale: 'es'
                            });
                            $(controls.FECHA_HASTA).datetimepicker({
                                format: 'DD/MM/YYYY',
                                locale: 'es'
                            });

                            $(controls.HORA_DESDE).datetimepicker({
                                format: 'HH:mm:ss',
                                locale: 'es'
                            });
                            $(controls.HORA_HASTA).datetimepicker({
                                format: 'HH:mm:ss',
                                locale: 'es'
                            });
                        },
                        onError: function (error) {
                            $.CloseStatusBar();
                            $.ShowError({ error: error });
                        },
                    })

                    $('.bootbox .modal-dialog').draggable({
                        handle: '.modal-header'
                    });
                    $('.bootbox .modal-header').css('cursor', 'move');
                },
                onCloseModal: function () {
                }
            });
        }
        const fnDuplicar = function (index) {
            alertify.confirm('Mensaje del sistema', '¿Seguro de duplicar este registro?',
                function () {
                    var row = $(table).jqxGrid('getrows')[index];
                    $.AddPetition({
                        type: '4',
                        transaction: true,
                        items: $.ConvertObjectToArr({
                            script: 'spw_puntoventa_mantenimiento_listaprecio_duplicarprecio',
                            C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                            C_PRODUCTO: row['C_PRODUCTO'],
                            C_PRODUCTO_PRECIO: row['C_PRODUCTO_PRECIO'],
                            C_USUARIO: $.solver.session.SESSION_ID,
                        })
                    });
                    $.SendPetition({
                        onReady: function () {
                            $.CloseStatusBar();
                            alertify.success('El registro ha sido duplicado.');
                            $(frm).submit();
                        },
                        onError: function (_error) {
                            $.CloseStatusBar();
                            $.ShowError({ error: _error });
                        },
                        onBefore: function () {
                            $.DisplayStatusBar({ message: 'Duplicando registro.' });
                        },
                    });
                },
                function () { }
            ).set('labels', { ok: 'Si', cancel: 'No' }).set('defaultFocus', 'ok').set('closable', false);
        }
        const fnEliminar = function (index) {
            alertify.confirm('Mensaje del sistema', '¿Seguro de duplicar este registro?',
                function () {
                    var row = $(table).jqxGrid('getrows')[index];
                    $.AddPetition({
                        table: 'VET.PRODUCTO_PRECIO',
                        type: 2,
                        condition: `C_EMPRESA = '${$.solver.session.SESSION_EMPRESA}' AND C_PRODUCTO = '${row['C_PRODUCTO']}' AND C_PRODUCTO_PRECIO = '${row['C_PRODUCTO_PRECIO']}'`,
                        items: $.ConvertObjectToArr({
                            C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                            C_PRODUCTO: row['C_PRODUCTO'],
                            C_PRODUCTO_PRECIO: row['C_PRODUCTO_PRECIO'],
                            IND_ESTADO: 'E'
                        })
                    })
                    $.SendPetition({
                        onReady: function () {
                            $.CloseStatusBar();
                            alertify.success('Registro eliminado.');
                            $(frm).submit();
                        },
                        onError: function (_error) {
                            $.CloseStatusBar();
                            $.ShowError({ error: _error });
                        },
                        onBefore: function () {
                            $.DisplayStatusBar({ message: 'Eliminando registro.' });
                        },
                    });
                },
                function () { }
            ).set('labels', { ok: 'Si', cancel: 'No' }).set('defaultFocus', 'ok').set('closable', false);
        }

        $(frm).ValidForm({
            type: -1,
            onReady: function () {
                $(table).jqxGrid('updatebounddata')
            },
            onDone: function (_, controls) {
                _controls = controls;

                fnCrearTabla();

                $(controls.C_PRODUCTO).selectpicker();

                $('#btnAgregarPrecio').click(function () {
                    var rowindex = $(table).jqxGrid('getselectedrowindex');

                    if (rowindex != -1) {
                        fnAgregarPrecio(1, null);
                    }
                });

                $('#btnDescargarPrecio').click(function () {
                    $.DownloadFile({
                        query: 'dw_puntoventa_mantenimiento_listaprecio',
                        params: {
                            C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                            C_PRODUCTO: function () {
                                return $(_controls.C_PRODUCTO).val();
                            },
                            C_CLIENTE_CATEGORIA: function () {
                                return $(_controls.C_CLIENTE_CATEGORIA).val();
                            },
                            TIPO_CONFIG: function () {
                                return $(_controls.TIPO_CONFIG).val();
                            },
                        },
                        nameFile: 'Lista de precios'
                    });
                })
            }
        })

    });
});