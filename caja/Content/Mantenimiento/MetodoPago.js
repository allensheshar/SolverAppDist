require(["jqwidgets", "helper", "controls", "extras"], function () {
    require(["alertify", "moment", "bootbox"], function (alertify, moment, bootbox) {
        alertify.set('notifier', 'position', 'top-center');
        const c_empresa = $.solver.session.SESSION_EMPRESA;
        let table = '#table';
        let frm = 'form[name=frm]'
        let _controls;
        let actions = '#actions'
        let estado = false;
        let pintoMoneda = false;
        let pintoBanco = false;

        const fnCrearTabla = function () {
            $(table).CreateGrid({
                query: 'tbl_caja_mantenimiento_metodopago_listametodos',
                items: {
                    C_EMPRESA: c_empresa,
                    BUSCAR: function () {
                        return $(_controls.buscar).val();
                    }
                },
                hiddens: ['C_EMPRESA', 'C_MONEDA', 'C_BANCO', 'C_CTA_BANCARIA', 'IND_ESTADO', 'IND_EFECTIVO', 'IND_TARJETA'],
                columns: {
                    'C_METODO_PAGO': {
                        text: 'Código'
                    },
                    'NOMBRE_METODO_PAGO': {
                        text: 'Nombre'
                    },
                    'DESCRIPCION_PARAMETRO': {
                        text: 'Moneda'
                    },
                    'NOMBRE_CORTO': {
                        text: 'Banco'
                    },
                    'NUMERO_CUENTA': {
                        text: 'Nro cuenta'
                    },
                    'ESTADO': {
                        text: 'Estado'
                    }
                },
                config: {

                }
            });
        };
        const fnCrearModal = function (index) {

            $.GetData({
                title: (index == undefined ? '<strong>Registro metodo de pago</strong>' : '<strong>Editar metodo de pago</strong>'),
                uriData: $.solver.baseUrl + '/Mantenimiento/MetodoPagoRegistro/',
                location: 'float',
                type: 'GET',
                isPage: true,
                onReady: function (object, modal) {
                    $(modal).find('.modal-dialog').css({ 'max-width': '40%' });

                    $(object).find('form[name=frm]').ValidForm({
                        type: -1,
                        onDone: function (form, controls) {
                            $(object).find('#C_PARAMETRO_GENERAL_MONEDA').change(function () {
                                $(object).find('#C_BANCO').attr('data-C_MONEDA', $(object).find('#C_PARAMETRO_GENERAL_MONEDA').val());
                                $(object).find('#C_BANCO').FieldLoadRemote({
                                    onReady: function () {
                                        if (index != undefined) {
                                            pintoMoneda = true;
                                            $(object).find('#C_BANCO').val(row['C_BANCO']).trigger('change');
                                        }
                                        else {
                                            $(object).find('#C_BANCO').trigger('change');
                                        }
                                    }
                                });
                            });
                            $(object).find('#C_BANCO').change(function () {
                                $(object).find('#NUMERO_CUENTA').attr('data-query', 'cb_caja_mantenimiento_metodopago_numeroscuenta');
                                $(object).find('#NUMERO_CUENTA').attr('data-field', 'NUMERO_CUENTA');
                                $(object).find('#NUMERO_CUENTA').attr('data-value', 'C_CUENTA_BANCARIA');
                                $(object).find('#NUMERO_CUENTA').attr('data-C_MONEDA', $(object).find('#C_PARAMETRO_GENERAL_MONEDA').val());
                                $(object).find('#NUMERO_CUENTA').attr('data-C_BANCO', $(object).find('#C_BANCO').val());
                                $(object).find('#NUMERO_CUENTA').FieldLoadRemote({
                                    onReady: function () {
                                        if (index != undefined) {
                                            pintoBanco = true;
                                            $(object).find('#NUMERO_CUENTA').val(row['C_CTA_BANCARIA']).trigger('change');
                                        }
                                    }
                                });
                            });
                            $(object).find('#CHECK_EFECTIVO').change(function () {
                                if ($(object).find('#CHECK_EFECTIVO').is(':checked')) $(object).find('#IND_EFECTIVO').val('*')
                                else $(object).find('#IND_EFECTIVO').val('&')
                            });
                            $(object).find('#CHECK_TARJETA').change(function () {
                                if ($(object).find('#CHECK_TARJETA').is(':checked')) $(object).find('#IND_TARJETA').val('*')
                                else $(object).find('#IND_TARJETA').val('&')
                            });
                            var row;
                            if (index != undefined) {
                                row = $(table).jqxGrid('getrows')[index];
                                $(object).find('#C_METODO_PAGO').val(row['C_METODO_PAGO']);
                                $(object).find('#NOMBRE').val(row['NOMBRE_METODO_PAGO']);
                                $(object).find('#C_PARAMETRO_GENERAL_MONEDA').val(row['C_MONEDA']).trigger('change');
                                $(object).find('#IND_ESTADO').val(row['IND_ESTADO']);
                                $(object).find('#IND_EFECTIVO').val(row['IND_EFECTIVO']);
                                $(object).find('#IND_TARJETA').val(row['IND_TARJETA']);

                                $(object).find('#CHECK_EFECTIVO').prop('checked', row['IND_EFECTIVO'] == '*')
                                $(object).find('#CHECK_TARJETA').prop('checked', row['IND_TARJETA'] == '*')
                            }

                            $(object).find('#btnGuardarMetodoPago').click(function () {
                                var obj = {
                                    C_EMPRESA: $(object).find('#C_EMPRESA').val(),
                                    C_METODO_PAGO: $(object).find('#C_METODO_PAGO').val(),
                                    C_MONEDA: $(object).find('#C_PARAMETRO_GENERAL_MONEDA').val(),
                                    C_BANCO: $(object).find('#C_BANCO').val(),
                                    C_CTA_BANCARIA: $(object).find('#NUMERO_CUENTA').val(),
                                    NOMBRE_METODO_PAGO: $(object).find('#NOMBRE').val(),
                                    IND_ESTADO: $(object).find('#IND_ESTADO').val(),
                                    IND_EFECTIVO: $(object).find('#IND_EFECTIVO').val(),
                                    IND_TARJETA: $(object).find('#IND_TARJETA').val()
                                };

                                $.AddPetition({
                                    table: 'CAJA.METODO_PAGO',
                                    type: (index == undefined ? 1 : 2),
                                    condition: (index == undefined ? '' : `C_EMPRESA = '${c_empresa}' AND C_METODO_PAGO = '${$(object).find('#C_METODO_PAGO').val()}'`),
                                    items: $.ConvertObjectToArr(obj, {
                                        C_METODO_PAGO: {
                                            action: {
                                                name: 'GetNextId',
                                                args: $.ConvertObjectToArr({
                                                    columns: 'C_EMPRESA',
                                                    max_length: '3'
                                                })
                                            }
                                        }
                                    })
                                });

                                $.SendPetition({
                                    onReady: function (result) {
                                        $.CloseStatusBar();
                                        alertify.success('Se guardó la información.');
                                        $(table).jqxGrid('updatebounddata');
                                        bootbox.hideAll();
                                    },
                                    onBefore: function () {
                                        $.DisplayStatusBar({ message: 'Guardando información.' });
                                    },
                                    onError: function (_error) {
                                        $.CloseStatusBar();
                                        $.ShowError({ error: _error });
                                    }
                                });
                            });
                        }
                    });
                },
                onCloseModal: function () {
                    estado = false;
                }
            })
        }
        const actionNuevo = function () {
            estado = true;
            fnCrearModal();
        }
        const actionEditar = function () {
            estado = true;
            var index = $(table).jqxGrid('getselectedrowindex');
            if (index != -1) {
                fnCrearModal(index);
            }
            else {
                alertify.warning('Por favor seleccione un registro')
            }
        }
        const fnCrearAcciones = function () {
            $(actions).CreateActions({
                text: 'Acciones',
                class: 'btn btn-sm btn-orange',
                actions: {
                    'Nuevo': {
                        callback: actionNuevo,
                        icon: 'fa fa-plus'
                    },
                    'Editar': {
                        callback: actionEditar,
                        icon: 'fa fa-pencil'
                    }
                }
            });
        }

        $(frm).ValidForm({
            type: -1,
            onDone: function (_, controls) {
                _controls = controls;
                fnCrearTabla();
                fnCrearAcciones();
            },
            onReady: function () {
                $(table).jqxGrid('updatebounddata');
            }
        });

    });
});