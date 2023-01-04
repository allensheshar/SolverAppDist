require(["helper", "extras", "controls", "datetimepicker"], function () {
    require(["alertify", "moment", "bootbox"], function (alertify, moment, bootbox) {
        const table = '#table';
        const frm = 'form[name=frm]'
        const actions = '#actions';
        const c_empresa = $.solver.session.SESSION_EMPRESA;
        let _controls;

        alertify.set('notifier', 'position', 'top-center');
        $('.c_empresa').attr('data-c_empresa', c_empresa);

        const fnCambiarDisplay = function (element, estado) {
            let display = '';
            if (estado) display = 'block';
            else display = 'none';
            $(element).css({ 'display': display });
        };
        const fnCrearTabla = function () {
            $(table).CreateGrid({
                query: 'tbl_caja_procesos_generacionletra_listaletras',
                items: {
                    C_EMPRESA: c_empresa,
                    FECHA_INICIO: function () {
                        return $(_controls.desde).val();
                    },
                    FECHA_FIN: function () {
                        return $(_controls.hasta).val();
                    },
                    BUSCAR: function () {
                        return $(_controls.buscar).val()
                    },
                    ESTADO: function () {
                        return $(_controls.estado).val()
                    }
                },
                hiddens: ['C_LETRA'],
                columns: {
                    'FECHA_EMISION': { text: 'Fec. de emisión', width: 100 },
                    'COMPROBANTE': { text: 'Comprobante', width: 150 },
                    'RAZON_SOCIAL': { text: 'Cliente', width: 250 },
                    'DESCRIPCION_PARAMETRO': { text: 'Moneda', width: 80 },
                    'TOTAL_FRACCION': {
                        text: 'Total.', width: 80,
                        cellsAlign: 'right',
                        cellsFormat: 'd2',
                        columnType: 'numberinput',
                        aggregates: ['sum'], aggregatesRenderer: function (aggregates, column, element) {
                            var formatNumber = aggregates.sum;
                            if (formatNumber === undefined)
                                formatNumber = '';
                            return `<div class="h-30 d-flex justify-content-center align-items-center font-weight-bold">
                                <strong id="totalDineroRecibido"> ${formatNumber} </strong>
                            </div>`;
                        }
                    },
                    'ESTADO': {
                        text: 'Estado   ', width: 100,
                        cellsrenderer: function (row, columnfield, value, defaulthtml, columnproperties) {
                            if (value == 'Pendiente') return '<div class="mt-2 jqx-grid-cell-middle-align"><span class="text-extra" style="color:blue;"><i class="fa fa-asterisk" aria-hidden="true"></i> ' + value + '</span></div>';
                            if (value == 'Aprobado') return '<div class="mt-2 jqx-grid-cell-middle-align"><span class="text-extra" style="color:green;"><i class="fa fa-check-circle" aria-hidden="true"></i> ' + value + '</span></div>';
                            if (value == 'Anulado') return '<div class="mt-2 jqx-grid-cell-middle-align"><span class="text-extra" style="color:red;"><i class="fa fa-close" aria-hidden="true"></i> ' + value + '</span></div>';
                        }
                    },
                    'FECHA_REGISTRO': { text: 'Fecha registro', width: 150 }
                },
                config: {
                    pageSize: 99999,
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
                        fnCambiarDisplay('.btnEditarIngreso', false);
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
            $(table).on('rowdoubleclick', function (event) {
                actionEditar();
            })
        };

        const actionNuevo = function () {
            document.location.href = $.solver.baseUrl + '/Procesos/NuevaLetra';
        };
        const actionEditar = function () {
            if ($(table).jqxGrid('getrows').length == 0) {
                alertify.warning('Debes seleccionar un registro para editar.');
            }
            else {
                const index = $(table).jqxGrid('getselectedrowindex');
                const data = $(table).jqxGrid('getrows')[index];
                const c_letra = data.C_LETRA;
                document.location = $.solver.baseUrl + '/Procesos/NuevaLetra/' + c_letra;
            }
        };
        const actionAprobar = function () {
            if ($(table).jqxGrid('getrows').length == 0) {
                alertify.warning('Debes seleccionar un registro para aprobar.');
            }
            else {
                const index = $(table).jqxGrid('getselectedrowindexes');
                $.each(index, function (i, v) {
                    const data = $(table).jqxGrid('getrows')[v];
                    const c_letra = data.C_LETRA;

                    $.AddPetition({
                        table: 'CAJA.LETRA',
                        type: 2,
                        condition: `C_LETRA = '${c_letra}' AND C_EMPRESA = '${c_empresa}'`,
                        items: $.ConvertObjectToArr({
                            C_EMPRESA: c_empresa,
                            C_LETRA: c_letra,
                            IND_ESTADO: 'A'
                        })
                    });

                    $.SendPetition({
                        onBefore: function () {
                            $.DisplayStatusBar({
                                message: 'Aprobando letra...'
                            });
                        },
                        onReady: function (result) {
                            $(frm).submit();
                            $.CloseStatusBar();
                            alertify.success('Se aprobó la letra');
                        },
                        onError: function (_error) {
                            $.CloseStatusBar();
                            $.ShowError({ error: _error });
                        }
                    });
                })
            }
        };
        const actionAnular = function () {
            if ($(table).jqxGrid('getrows').length == 0) {
                alertify.warning('Debes seleccionar un registro para anular.');
            }
            else {

                //alertify.prompt('Mensaje del sistema', 'Por favor ingrese el motivo.', ''
                //    , function (evt, value) {
                //        if (value == '') {
                //            fnObtenerAlerta('Por favor indique el motivo');
                //        }
                //        else {
                            const index = $(table).jqxGrid('getselectedrowindexes');
                            $.each(index, function (i, v) {
                                const data = $(table).jqxGrid('getrows')[index];
                                const c_letra = data.C_LETRA;

                                $.AddPetition({
                                    table: 'CAJA.LETRA',
                                    type: 2,
                                    condition: `C_LETRA = '${c_letra}' AND C_EMPRESA = '${c_empresa}'`,
                                    items: $.ConvertObjectToArr({
                                        C_EMPRESA: c_empresa,
                                        C_LETRA: c_letra,
                                        IND_ESTADO: 'R',
                                        //MOTIVO_RECHAZADO: value
                                    })
                                });
                            });


                            $.SendPetition({
                                onBefore: function () {
                                    $.DisplayStatusBar({
                                        message: 'Rechazando letra...'
                                    });
                                },
                                onReady: function (result) {
                                    $(frm).submit();
                                    $.CloseStatusBar();
                                    alertify.success('La letra fue rechazada.')
                                },
                                onError: function (_error) {
                                    $.CloseStatusBar();
                                    $.ShowError({ error: _error });
                                }
                            });
                    //    }
                    //}, null);
            }
        };
        $(actions).CreateActions({
            text: 'Acciones',
            class: 'btn btn-sm btn-orange',
            actions: {
                'Nueva letra': {
                    callback: actionNuevo,
                    subClass: 'btnNuevaLetra'
                },
                'Editar letra': {
                    callback: actionEditar,
                    subClass: 'btnEditarLetra',
                    icon: 'fa fa-pencil'
                },
                'Aprobar letra': {
                    callback: actionAprobar,
                    subClass: 'btnAprobarLetra',
                    icon: 'fa fa-check'
                },
                'Anular letra': {
                    callback: actionAnular,
                    subClass: 'btnAnularLetra',
                    icon: 'fa fa-times'
                }
            }
        });
        $(frm).ValidForm({
            type: -1,
            onDone: function (_, controls) {
                _controls = controls;
                $(controls.desde).datetimepicker({
                    format: 'DD/MM/YYYY',
                    locale: 'es'
                });
                $(controls.hasta).datetimepicker({
                    format: 'DD/MM/YYYY',
                    locale: 'es'
                });
                fnCrearTabla();
            },
            onReady: function () {
                $(table).jqxGrid('updatebounddata');
            }
        });
    });
});