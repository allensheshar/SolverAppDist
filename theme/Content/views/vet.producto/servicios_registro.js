require(['jqwidgets', 'helper', 'extras', 'bootstrap-select'], function () {
    require(['bootbox', 'alertify'], function (bootbox, alertify) {

        alertify.set('notifier', 'position', 'top-center');

        const empresa = $.solver.session.SESSION_EMPRESA;
        let _controls;
        let _cubso;

        const fnObtenerCategoria = function () {
            $.GetQuery({
                query: ['q_ventas_mantenimiento_productos_obtenercategoria'],
                items: [{
                    C_PRODUCTO: function () { return $(_controls.C_PRODUCTO).val(); },
                    C_EMPRESA: empresa
                }],
                onError: function (error) {
                    $.ShowError({ error: error });
                },
                onReady: function (result) {
                    if (result.length > 0) {
                        const data = result[0];
                        $(_controls.FAMILIA).val(data['NOMBRE_FAMILIA']).trigger('change');
                        setTimeout(function () {
                            $(_controls.SUBFAMILIA).val(data['NOMBRE_SUB_FAMILIA']).trigger('change');
                            setTimeout(function () {
                                $(_controls.C_CATEGORIA).val(data['C_CATEGORIA']);
                            }, 500);
                        }, 500);
                    }
                }
            });
        };
        const fnObtenerCubso = function () {
            var cubso = $(_controls.C_CUBSO).val();
            if (cubso != '') {
                $.GetQuery({
                    query: ['gbl_obtener_cubso'],
                    items: [{
                        C_CUBSO: function () {
                            return cubso;
                        }
                    }],
                    onReady: function (result) {
                        if (result.length > 0) {
                            const data = result[0];
                            $('#NOMBRE_CUBSO').val(data.NOMBRE);
                        }
                    }
                });
            }
        };
        const fnObtenerCtaContable = function (cuenta) {
            $.GetData({
                title: '<strong>Busqueda de plan contable</strong>',
                uriData: $.solver.baseUrl + '/Mantenimiento/BusquedaPlanContable/',
                location: 'float',
                type: 'GET',
                isPage: true,
                onReady: function (objectBuscarCuenta, modalBuscarCuenta) {
                    $(modalBuscarCuenta).find('.modal-dialog').css({ 'max-width': '40%' });
                    $(objectBuscarCuenta).find('#tblPlanContable').CreateGrid({
                        query: 'tbl_mantenimiento_obtenerplanes',
                        items: { C_EMPRESA: empresa },
                        hiddens: ['C_EMPRESA', 'CODIGO'],
                        columns: {
                            CODIGO_PLAN: {
                                text: 'Código',
                                width: 80
                            },
                            DESCRIPCION: {
                                text: 'Descripción de la cuenta',
                                width: 400
                            }
                        },
                        config: {
                            virtualmode: false,
                            height: 200,
                            pageSize: 100,
                            pageable: false,
                            sortable: false,
                            editable: false,
                            rendered: function () {
                            }
                        }
                    });
                    $(objectBuscarCuenta).find('#tblPlanContable').on("rowdoubleclick", function () {
                        const getselectedrowindexes = $(objectBuscarCuenta).find('#tblPlanContable').jqxGrid('getselectedrowindexes');
                        if (getselectedrowindexes.length > 0) {
                            const codigo = $(objectBuscarCuenta).find('#tblPlanContable').jqxGrid('getrowdata', getselectedrowindexes[0])['CODIGO_PLAN'];
                            if (cuenta == 'compras') {
                                $(_controls.CTA_CONTABLE_COMPRAS).val(codigo);
                            }
                            else {
                                $(_controls.CTA_CONTABLE_VENTAS).val(codigo);
                            }

                            bootbox.hideAll();
                        }
                    });
                },
                onCloseModal: function () {
                    estado = false;
                }
            });
        }
        const fnObtenerCentroCosto = function () {
            var centroCosto = $(_controls.C_UNIDAD_NEGOCIO).val();
            if (centroCosto != '') {
                $.GetQuery({
                    query: ['gbl_obtener_centro_costo'],
                    items: [{
                        C_EMPRESA: empresa,
                        C_UNIDAD_NEGOCIO: centroCosto
                    }],
                    onReady: function (result) {
                        if (result.length > 0) {
                            $(_controls.NOMBRE_CENTRO_COSTO).val(result[0].NOMBRE);
                        }
                    }
                })
            }
        }

        $('.c_empresa').attr('data-c_empresa', empresa);
        $('form[name=frmRegistroServicio]').ValidForm({
            table: 'VET.PRODUCTO',
            type: 1,
            querySave: true,
            extras: {
                C_PRODUCTO: {
                    action: {
                        name: 'GetNextId',
                        args: $.ConvertObjectToArr({
                            max_length: '6',
                            columns: 'C_EMPRESA'
                        })
                    }
                }
            },
            onSubmit: function (form, controls, objParent) {

                if ($(controls.C_UNIDAD_NEGOCIO).val() == '') {
                    alertify.warning('Por favor seleccione el centro de costo');
                    return false;
                }
                if ($(controls.PRECIO_REF).val() == '') {
                    objParent.PRECIO_REF = 0;
                }
                return true
            },
            onDone: function (form, controls) {
                _controls = controls;
                if ($(_controls.C_CUBSO).val() != '') {
                    fnObtenerCubso();
                };

                $(controls.C_EMPRESA).val(empresa);

                $(controls.NOMBRE_PARA_VENTA).keyup(function () {
                    $(controls.NOMBRE_GENERICO).val($(this).val());
                });

                if ($(_controls.C_PRODUCTO).val() != '') {
                    $('#codigo').val($(_controls.C_PRODUCTO).val());
                    fnObtenerCategoria();
                }
                else {
                    $('#codigo').val('XXXX');
                }

                $(_controls.C_PARAMETRO_GENERAL_TIPO_PRODUCTO).attr('readonly', 'readonly').css({ 'pointer-events': 'none' });

                $(_controls.FAMILIA).change(function () {
                    $('#SUBFAMILIA').attr('data-query', 'cb_ventas_mantenimiento_productos_listarsubfamilias')
                    $('#SUBFAMILIA').attr('data-value', 'NOMBRE_SUB_FAMILIA')
                    $('#SUBFAMILIA').attr('data-field', 'NOMBRE_SUB_FAMILIA')
                    $('#SUBFAMILIA').attr('data-NOMBRE_FAMILIA', $(this).val());
                    $('#SUBFAMILIA').attr('data-C_EMPRESA', empresa);
                    $('#SUBFAMILIA').FieldLoadRemote({
                        onReady: function () {
                            $(_controls.SUBFAMILIA).trigger('change');
                        }
                    });
                });
                $(_controls.SUBFAMILIA).change(function () {
                    $('#C_CATEGORIA').attr('data-query', 'cb_ventas_mantenimiento_productos_listarcategorias')
                    $('#C_CATEGORIA').attr('data-value', 'C_CATEGORIA')
                    $('#C_CATEGORIA').attr('data-field', 'NOMBRE_CATEGORIA')
                    $('#C_CATEGORIA').attr('data-NOMBRE_SUB_FAMILIA', $(this).val());
                    $('#C_CATEGORIA').attr('data-C_EMPRESA', empresa);
                    $('#C_CATEGORIA').FieldLoadRemote();
                });

                $(controls.C_PARAMETRO_GENERAL_SUJETO_DETRACCION).selectpicker();
                $('#ctaContableCompras').click(function () {
                    estado = true;
                    fnObtenerCtaContable('compras')
                });

                $('#ctaContableVentas').click(function () {
                    estado = true;
                    fnObtenerCtaContable('ventas')
                });

                if ($(controls.PRECIO_REF).val() == '') {
                    $(controls.PRECIO_REF).val(0)
                }

                fnObtenerCentroCosto();
            },
            onReady: function (result, controls, form) {
                document.location = $.solver.baseUrl + '/Mantenimiento/Servicio/';
            },
            onError: function (error) {
                $.CloseStatusBar();
                $.ShowError({ error: error });
            },
        });

        $('#centroCosto').click(function () {
            $.solver.fn.fnSeleccionarCentroCosto({
                input: $(_controls.C_UNIDAD_NEGOCIO),
                onCloseModal: function () {
                    fnObtenerCentroCosto();
                }
            });
        });
        $('#cubso').click(function () {
            $.solver.fn.fnSeleccionarCubso({
                input: $(_controls.C_CUBSO),
                onCloseModal: function () {
                    fnObtenerCubso();
                }
            });
        });
        $('#guardar').click(function () {
            $.GetQuery({
                query: ['q_ventas_mantenimiento_clienteproducto_validarnombres_servicio'],
                items: [{
                    C_EMPRESA: empresa,
                    NOMBRE_PARA_VENTA: function () {
                        return $('form[name=frmRegistroServicio] #NOMBRE_PARA_VENTA').val();
                    },
                    NOMBRE_GENERICO: function () {
                        return $('form[name=frmRegistroServicio] #NOMBRE_GENERICO').val();
                    },
                    C_PRODUCTO: function () {
                        return $('form[name=frmRegistroServicio] #C_PRODUCTO').val()
                    }
                }],
                onError: function (error) {
                    $.ShowError({ error });
                },
                onReady: function (result) {
                    if (result.length == 0) {
                        $('form[name=frmRegistroServicio]').submit();
                    }
                    else if (result.length == 1 && $('form[name=frmRegistroServicio] #C_PRODUCTO').val() == '') {
                        alertify.warning('El servicio ya se encuentra registrado.');
                    }
                    else if (result.length == 1 && $('form[name=frmRegistroServicio] #C_PRODUCTO').val() != '') {
                        alertify.warning('El servicio ya se encuentra registrado.');
                    }
                    else if (result.length == 2 && $('form[name=frmRegistroServicio] #C_PRODUCTO').val() != '') {
                        $('form[name=frmRegistroServicio]').submit();
                    }
                }
            })
        })
    });
});