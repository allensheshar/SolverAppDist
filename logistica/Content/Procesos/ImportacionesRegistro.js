require(["helper", "extras", "datetimepicker"], function () {
    require(["alertify", "bootbox", "moment"], function (alertify, bootbox, moment) {
        alertify.set('notifier', 'position', 'top-center');

        const c_empresa = $.solver.session.SESSION_EMPRESA;
        var form = 'form[name=frm]';
        var _controls;
        var estado = false;
        const table = '#table'
        var isRendered = false;

        const fnObtenerProveedor = function () {
            if ($(_controls.C_PERSONA).val() != '') {
                $.GetQuery({
                    query: ['q_logistica_procesos_nuevaordencompra_obtenerproveedor_porid'],
                    items: [{
                        C_EMPRESA: c_empresa,
                        C_PROVEEDOR: function () {
                            return $(_controls.C_PERSONA).val();
                        }
                    }],
                    onReady: function (result) {
                        if (result.length == 0) {
                            alertify.error('No se pudo obtener los datos del proveedor');
                        }
                        else {
                            const dataProveedor = result[0];
                            $(_controls.C_PERSONA_DETALLE).val(dataProveedor['RAZON_SOCIAL'] + ' - ' + dataProveedor['TIPO_DOCUMENTO'] + ': ' + dataProveedor['RUC_CLIENTE']);
                        }
                    },
                    onError: function (error) {
                        $.CloseStatusBar();
                        $.ShowError({ error });
                    }
                })
            }
        };
        const fnBuscarProveedor = function () {
            $.GetData({
                title: '<strong>Busqueda de proveedores</strong>',
                uriData: $.solver.baseUrl + '/Mantenimiento/BusquedaProveedor/',
                location: 'float',
                type: 'GET',
                isPage: true,
                onReady: function (objectBuscarProveedor, modalBuscarProveedor) {
                    $(modalBuscarProveedor).find('.modal-dialog').css({ 'max-width': '60%' });

                    const formBuscarProveedor = $(objectBuscarProveedor).find('form[name=frmBusquedaProveedor]');
                    const tableBuscarProveedor = $(objectBuscarProveedor).find('#tblBusquedaProveedor');
                    const btnCrearProveedor = $(objectBuscarProveedor).find('#btnCrearProveedor');
                    const btnAceptar = $(objectBuscarProveedor).find('#btnAceptar');

                    $(formBuscarProveedor).ValidForm({
                        type: -1,
                        onReady: function (form, controls) { tableBuscarProveedor.jqxGrid('updatebounddata'); },
                        onDone: function () {
                            const actionElegir = function () {
                                const getselectedrowindexes = $(tableBuscarProveedor).jqxGrid('getselectedrowindexes');
                                if (getselectedrowindexes.length > 0) {
                                    const c_proveedor = $(tableBuscarProveedor).jqxGrid('getrowdata', getselectedrowindexes[0])['C_PROVEEDOR'];
                                    $(_controls.C_PERSONA).val(c_proveedor);
                                    fnObtenerProveedor();
                                }
                            }

                            $(tableBuscarProveedor).CreateGrid({
                                query: 'gbl_listarproveedores',
                                items: {
                                    NOMBRE: function () { return $('#_buscar').val() || ''; },
                                    C_EMPRESA: c_empresa
                                },
                                hiddens: ['C_PROVEEDOR', 'C_PARAMETRO_GENERAL_TIPO_DOCUMENTO'],
                                columns: {
                                    'RUC_CLIENTE': { text: 'Nro Documento', width: 100 },
                                    'RAZON_SOCIAL': { text: 'Razón Social', width: 250 },
                                    'NOMBRE_COMERCIAL': { text: 'Nombre Comercial', width: 250 },
                                    'DIRECCION_FISCAL': { text: 'Dirección Fiscal', width: 250 }
                                },
                                config: {
                                    pageSize: 999999,
                                    height: 600,
                                }
                            });
                            $(tableBuscarProveedor).on("rowdoubleclick", function () {
                                actionElegir();
                                bootbox.hideAll();
                            });
                            $(btnAceptar).click(function () {
                                actionElegir();
                                bootbox.hideAll();
                            });
                            $(btnCrearProveedor).click(function () {
                                $.GetData({
                                    title: '<strong>Registro de proveedores</strong>',
                                    uriData: $.solver.baseUrl + '/Mantenimiento/ProveedoresRegistro/crear',
                                    location: 'float',
                                    type: 'GET',
                                    isPage: true,
                                    onReady: function (objectCrearProveedor, modalCrearProveedor) {
                                        $(modalCrearProveedor).find('.modal-dialog').css({ 'max-width': '90%' });

                                        $('form[name=frmRegistroProveedor] #C_PROVEEDOR').change(function () {
                                            $(objectCrearProveedor).parent().parent().parent().find('.close').trigger('click');
                                        });
                                    },
                                    onCloseModal: function () {
                                        const c_proveedor = $('form[name=frmRegistroProveedor] #C_PROVEEDOR').val();
                                        if (c_proveedor != '') {
                                            $(_controls.C_PERSONA).val(c_proveedor);
                                            fnObtenerProveedor();
                                            $(objectBuscarProveedor).parent().parent().parent().find('.close').trigger('click');
                                        }
                                    }
                                });
                            });
                        },
                        onError: function (error) { $.ShowError({ error: error }); }
                    });
                },
                onCloseModal: function () {
                    estado = false;
                }
            })
        };
        const fnPintarEmpresa = function () {
            $.GetQuery({
                query: ['q_ventas_procesos_nuevaventa_consultarempresa'],
                items: [{
                    C_EMPRESA: $(_controls.C_EMPRESA).val()
                }],
                onReady: function (result) {
                    const data = result[0];
                    $('#RUC_EMPRESA').text('RUC N° ' + data['NRO_DOCUMENTO']);
                },
                onError: function (error) {
                    $.CloseStatusBar();
                    $.ShowError({ error });
                }
            })
            $.solver.fn.getImageLogoCompany('#imageEmpresa');
        };
        const fnCrearTabla = function () {
            $(table).CreateGrid({
                query: 'tbl_logistica_procesos_importacion_listarcomprasadjuntos',
                items: {
                    C_EMPRESA: c_empresa,
                    ID_OPERACION: function () {
                        return $(_controls.ID_OPERACION).val()
                    }
                },
                hiddens: ['TIPO_DOCUMENTO'],
                columns: {
                    'TIPO_DOCUMENTO': {
                        text: 'Tipo documento'
                    },
                    'RAZON_SOCIAL': {
                        text: 'Razón social',
                        width: 360
                    },
                    'NRO_COMPROBANTE': {
                        text: 'Nro. comprobante',
                    },
                    'FECHA_EMISION': {
                        text: 'Fecha emisión',
                        width: 100
                    },
                    'TOTAL': {
                        text: 'Total',
                        cellsAlign: 'right',
                        width: 100
                    }
                },
                config: {
                    virtualmode: false,
                    height: 500,
                    groupable: true,
                    sortable: false,
                    closeablegroups: false,
                    showgroupsheader: false,
                    pageable: false,
                    rendered: function () {
                        $(table).jqxGrid('refresh');
                        $(table).on('groupexpand', function (event) {
                            $(table).jqxGrid('refresh');
                        })
                        $(table).on('groupcollapse', function (event) {
                            $(table).jqxGrid('refresh');
                        });
                        if (!isRendered) {
                            isRendered = true;
                            setTimeout(function () {
                                $(table).jqxGrid('removegroup', 'TIPO_DOCUMENTO');
                                $(table).jqxGrid('addgroup', 'TIPO_DOCUMENTO');
                                $(table).jqxGrid('refresh');
                                $(table).jqxGrid({ rowsheight: 30 });
                                $(table).jqxGrid('expandallgroups');
                            }, 100)
                        }
                    }
                }
            });
        }

        $(form).ValidForm({
            type: 1,
            table: 'LOG.OPERACION_INTERNACIONAL',
            querySave: true,
            extras: {
                ID_OPERACION: {
                    action: {
                        name: 'GetNextId',
                        args: $.ConvertObjectToArr({
                            max_length: 10,
                            columns: 'C_EMPRESA'
                        })
                    }
                },
                NRO_OPERACION: {
                    action: {
                        name: 'GetNextId',
                        args: $.ConvertObjectToArr({
                            max_length: 6,
                            columns: 'C_EMPRESA,ANIO,FLAG_TIPO'
                        })
                    }
                }
            },
            onReady: function (_, controls, tokenParent, objParent) {
                location.href = $.solver.baseUrl + '/Procesos/Importaciones'
            },
            onDone: function (_, controls) {
                _controls = controls;

                $(controls.C_EMPRESA).val(c_empresa);

                if ($(controls.ID_OPERACION).val() != '') {
                    $(controls.FECHA).val(moment($(controls.FECHA).val()).format('DD/MM/YYYY'));

                    $('#OPERACION').text($(controls.ANIO).val() + '-' + $(controls.NRO_OPERACION).val())
                }

                $(controls.FECHA).datetimepicker({
                    format: 'DD/MM/YYYY',
                    locale: 'es'
                });

                $(form + ' #btnBuscarProveedor').click(function () {
                    if (!estado) {
                        estado = true;
                        fnBuscarProveedor();
                    }
                });

                fnObtenerProveedor();
                fnPintarEmpresa();
                fnCrearTabla();
            },
            onError: function (error) {
                $.CloseStatusBar();
                $.ShowError({ error });
            }
        });

    });
});