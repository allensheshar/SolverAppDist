require(["helper", "extras", "controls", "datetimepicker"], function () {
    require(["alertify", "moment", "bootbox"], function (alertify, moment, bootbox) {

        let cod_tipo;

        alertify.set('notifier', 'position', 'top-center');

        const fnCambiarDisplay = function (element, estado) {
            let display = '';
            if (estado) display = 'block';
            else display = 'none';
            $(element).css({ 'display': display });
        };
        const fnCrearTabla = function () {
            $(table).CreateGrid({
                query: 'tbl_caja_procesos_movimientos_listamovimientos',
                items: {
                    C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                    DESDE: function () {
                        return $(_controls.DESDE).val();
                    },
                    HASTA: function () {
                        return $(_controls.HASTA).val();
                    },
                    TIPO: function () {
                        return $(_controls.TIPO).val();
                    },
                    BUSCAR: function () {
                        return $(_controls.BUSCAR).val()
                    },
                    ESTADO: function () {
                        return $(_controls.ESTADO).val()
                    },
                    COD_TIPO: function () {
                        return $(_controls.COD_TIPO).val();
                    }
                },
                hiddens: ['C_MOVIMIENTO'],
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
                    'NOMBRE_TIPO_MOVIMIENTO': { text: 'Tipo de movimiento', width: 200 },
                    'NRO_OPERACION': { text: 'Nro operación', width: 100 },
                    'FECHA': { text: 'Fecha registro', width: 100 },
                    'FECHA_BANCO': { text: 'Fecha banco', width: 100 },
                    'DESCRIPCION': { text: 'Descripción', width: 300 },
                    'IND_ESTADO': {
                        text: 'Estado   ', width: 100,
                        cellsrenderer: function (row, columnfield, value, defaulthtml, columnproperties) {
                            if (value == 'Pendiente') return '<div class="mt-2 jqx-grid-cell-middle-align"><span class="text-extra" style="color:blue;"><i class="fa fa-asterisk" aria-hidden="true"></i> ' + value + '</span></div>';
                            if (value == 'Aprobado') return '<div class="mt-2 jqx-grid-cell-middle-align"><span class="text-extra" style="color:green;"><i class="fa fa-check-circle" aria-hidden="true"></i> ' + value + '</span></div>';
                            if (value == 'Rechazado') return '<div class="mt-2 jqx-grid-cell-middle-align"><span class="text-extra" style="color:red;"><i class="fa fa-close" aria-hidden="true"></i> ' + value + '</span></div>';
                        }
                    },
                },
                config: {
                    pageSize: 100,
                    showaggregates: true,
                    showstatusbar: true,
                    statusbarheight: 20,
                    rendered: function () {
                    }
                }
            });
            $(table).on('rowselect', function (event) {
                var args = event.args;
                var rowData = args.row;
                if (rowData != null) {
                    const estado = rowData['IND_ESTADO'];
                    if (estado == 'Pendiente') {
                        fnCambiarDisplay('.btnEditarIngreso', true);
                        fnCambiarDisplay('.btnAprobarIngreso', true);
                        fnCambiarDisplay('.btnAnularIngreso', true);
                    }
                    else if (estado == 'Aprobado') {
                        fnCambiarDisplay('.btnEditarIngreso', true);
                        fnCambiarDisplay('.btnAprobarIngreso', false);
                        fnCambiarDisplay('.btnAnularIngreso', false);
                    }
                    else if (estado == 'Rechazado') {
                        fnCambiarDisplay('.btnEditarIngreso', false);
                        fnCambiarDisplay('.btnAprobarIngreso', false);
                        fnCambiarDisplay('.btnAnularIngreso', false);
                    }
                }
            });
            $(table).on('rowdoubleclick', function () {
                if ($(table).jqxGrid('getrows').length == 0) {
                    alertify.warning('Debes seleccionar un registro para editar.');
                }
                else {
                    const index = $(table).jqxGrid('getselectedrowindex');
                    const data = $(table).jqxGrid('getrows')[index];
                    const c_movimiento = data.C_MOVIMIENTO;

                    if (cod_tipo == 'I') {
                        document.location = $.solver.baseUrl + `/Procesos/NuevoMovimientoIngreso?a=${c_movimiento}`;
                    }

                    if (cod_tipo == 'E') {
                        document.location = $.solver.baseUrl + `/Procesos/NuevoMovimientoEgreso?a=${c_movimiento}`;
                    }
                }
            });
        }
        const actionNuevo = function () {
            if (cod_tipo == 'I') {
                document.location.href = $.solver.baseUrl + '/Procesos/NuevoMovimientoIngreso';
            }

            if (cod_tipo == 'E') {
                document.location.href = $.solver.baseUrl + '/Procesos/NuevoMovimientoEgreso';
            }
        }
        const actionEditar = function () {
            if ($(table).jqxGrid('getrows').length == 0) {
                alertify.warning('Debes seleccionar un registro para editar.');
            }
            else {
                const index = $(table).jqxGrid('getselectedrowindex');
                const data = $(table).jqxGrid('getrows')[index];
                const c_movimiento = data.C_MOVIMIENTO;

                if (cod_tipo == 'I') {
                    document.location = $.solver.baseUrl + `/Procesos/NuevoMovimientoIngreso?a=${c_movimiento}`;
                }

                if (cod_tipo == 'E') {
                    document.location = $.solver.baseUrl + `/Procesos/NuevoMovimientoEgreso?a=${c_movimiento}`;
                }
            }
        }
        const actionAprobar = function () {
            if ($(table).jqxGrid('getrows').length == 0) {
                alertify.warning('Debes seleccionar un registro para aprobar.');
            }
            else {
                const index = $(table).jqxGrid('getselectedrowindex');
                const data = $(table).jqxGrid('getrows')[index];
                const c_movimiento = data.C_MOVIMIENTO;
                //const req_aprob = data.REQ_APROB;

                $.AddPetition({
                    table: 'CAJA.MOVIMIENTO',
                    type: 2,
                    condition: `C_MOVIMIENTO = '${c_movimiento}' AND C_EMPRESA = '${$.solver.session.SESSION_EMPRESA}'`,
                    items: $.ConvertObjectToArr({
                        C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                        C_MOVIMIENTO: c_movimiento,
                        IND_ESTADO: 'A'//(req_aprob == '*' ? 'P' : 'A')
                    })
                });

                $.SendPetition({
                    onBefore: function () {
                        $.DisplayStatusBar({
                            message: 'Aprobando movimiento...'
                        });
                    },
                    onReady: function (result) {
                        $(frm).submit();
                        $.CloseStatusBar();
                        alertify.success('Se aprobó el movimiento');
                    },
                    onError: function (_error) {
                        $.CloseStatusBar();
                        $.ShowError({ error: _error });
                    }
                });
            }
        }
        const actionAnular = function () {
            if ($(table).jqxGrid('getrows').length == 0) {
                alertify.warning('Debes seleccionar un registro para anular.');
            }
            else {

                alertify.prompt('Mensaje del sistema', 'Por favor ingrese el motivo.', ''
                    , function (evt, value) {
                        if (value == '') {
                            fnObtenerAlerta('Por favor indique el motivo');
                        }
                        else {
                            const index = $(table).jqxGrid('getselectedrowindexes');
                            $.each(index, function (i, v) {
                                const data = $(table).jqxGrid('getrows')[index];
                                const c_movimiento = data.C_MOVIMIENTO;

                                $.AddPetition({
                                    table: 'CAJA.MOVIMIENTO',
                                    type: 2,
                                    condition: `C_MOVIMIENTO = '${c_movimiento}' AND C_EMPRESA = '${$.solver.session.SESSION_EMPRESA}'`,
                                    items: $.ConvertObjectToArr({
                                        C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                                        C_MOVIMIENTO: c_movimiento,
                                        IND_ESTADO: '&',
                                        MOTIVO_RECHAZADO: value
                                    })
                                });
                            });


                            $.SendPetition({
                                onBefore: function () {
                                    $.DisplayStatusBar({
                                        message: 'Rechazando movimiento...'
                                    });
                                },
                                onReady: function (result) {
                                    $(frm).submit();
                                    $.CloseStatusBar();
                                    alertify.success('El movimiento fue rechazado.')
                                },
                                onError: function (_error) {
                                    $.CloseStatusBar();
                                    $.ShowError({ error: _error });
                                }
                            });
                        }
                    }, null);
            }
        }
        const actionVoucher = function () {
            var index = $(table).jqxGrid('getselectedrowindex');
            if (index == -1) {
                alertify.warning('Por favor seleccione un registro')
                return;
            }

            var row = $(table).jqxGrid('getrows')[index];
            if (row['IND_ESTADO'] != 'Aprobado') {
                alertify.warning('El movimiento tiene que estar aprobado');
                return;
            }

            var row = $(table).jqxGrid('getrows')[index];
            $.DisplayStatusBar({ message: 'Generando pdf.' });

            var formato = '';
            var scriptCabecera = '';
            var scriptDetalle = '';

            formato = (cod_tipo == 'I' ? 'formato_estandar_voucher_movimiento_caja' : 'formato_estandar_voucher_movimiento_caja_egreso')
            scriptCabecera = (cod_tipo == 'I' ? 'q_gbl_obtener_movimiento_ingreso_voucher' : 'q_gbl_obtener_movimiento_ingreso_voucher_egreso')
            scriptDetalle = (cod_tipo == 'I' ? 'q_gbl_obtener_movimiento_ingreso_voucher_detalle' : 'q_gbl_obtener_movimiento_ingreso_voucher_detalle_egreso')

            $.CreatePDFDocument({
                empresa: $.solver.session.SESSION_EMPRESA,
                formato: formato,
                papel: 'A3',
                querys: [
                    {
                        name: 'cabecera',
                        args: $.ConvertObjectToArr({
                            modeWork: 'd', //diccionario
                            script: scriptCabecera,
                            C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                            C_MOVIMIENTO: row['C_MOVIMIENTO']
                        })
                    },
                    {
                        name: 'detalle',
                        args: $.ConvertObjectToArr({
                            script: scriptDetalle,
                            C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                            C_MOVIMIENTO: row['C_MOVIMIENTO']
                        })
                    },
                ],
                onReady: function (result) {
                    window.open(`${$.solver.services.api}/service/viewfile/${result.token}`);
                    $.CloseStatusBar();

                }
            })
            
        }
        const fnValidarConfiguracion = function () {
            $.GetQuery({
                query: ['q_gbl_validar_configuracion'],
                items: [{
                    C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                    VENTANA: (cod_tipo == 'I' ? 'MOVIMIENTO_INGRESO' : 'MOVIMIENTO_EGRESO')
                }],
                onError: function (error) {
                    $.CloseStatusBar();
                    $.ShowError({ error });
                },
                onReady: function (result) {
                    var validacion = result[0].MENSAJE;

                    if (validacion == 'CUENTABANCARIA') {
                        alertify.alert('Mensaje del sistema', result[0].TEXTOMENSAJE, function () {
                            document.location = $.solver.baseUrl + '/Mantenimiento/CuentaBancaria';
                        });
                    }

                    if (validacion == 'TIPOMOVIMIENTO') {
                        alertify.alert('Mensaje del sistema', result[0].TEXTOMENSAJE, function () {
                            document.location = $.solver.baseUrl + '/Mantenimiento/Configuraciones';
                        });
                    }

                }
            });
        }

        $(frm).ValidForm({
            type: -1,
            onDone: function (_, controls) {
                _controls = controls;

                cod_tipo = $(controls.COD_TIPO).val();

                $(controls.DESDE).datetimepicker({
                    format: 'DD/MM/YYYY',
                    locale: 'es'
                });
                $(controls.HASTA).datetimepicker({
                    format: 'DD/MM/YYYY',
                    locale: 'es'
                });
                fnCrearTabla();

                fnValidarConfiguracion();

                
                const nuevo = cod_tipo == 'I' ? 'Nuevo ingreso' : 'Nuevo egreso';
                const editar = cod_tipo == 'I' ? 'Editar ingreso' : 'Editar egreso';
                const aprobar = cod_tipo == 'I' ? 'Aprobar ingreso' : 'Aprobar egreso';
                const rechazar = cod_tipo == 'I' ? 'Rechazar ingreso' : 'Rechazar egreso';

                $(actions).CreateActions({
                    text: 'Acciones',
                    class: 'btn btn-sm btn-orange',
                    actions: {
                        'Nuevo': {
                            text: nuevo,
                            callback: actionNuevo,
                            subClass: 'btnNuevoIngreso'
                        },
                        'Editar': {
                            text: editar,
                            callback: actionEditar,
                            subClass: 'btnEditarIngreso',
                            icon: 'fa fa-pencil'
                        },
                        'Aprobar': {
                            text: aprobar,
                            callback: actionAprobar,
                            subClass: 'btnAprobarIngreso',
                            icon: 'fa fa-check'
                        },
                        'Rechazar': {
                            text: rechazar,
                            callback: actionAnular,
                            subClass: 'btnAnularIngreso',
                            icon: 'fa fa-times'
                        },
                        'Voucher': {
                            text: 'Voucher',
                            callback: actionVoucher,
                            icon: 'fa fa-file-pdf-o'
                        }
                    }
                });
            },
            onReady: function () {
                $(table).jqxGrid('updatebounddata');
            }
        });

    });
});