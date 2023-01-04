require(["helper", "extras", "controls", "datetimepicker"], function () {
    require(["alertify", "moment", "bootbox"], function (alertify, moment, bootbox) {
        alertify.set('notifier', 'position', 'top-center');

        const tablePadre = '#tablePadre';
        const table = '#table';
        const frm = 'form[name=frm]'
        const actions = '#actions';
        const c_empresa = $.solver.session.SESSION_EMPRESA
        let _controls;

        $('.c_empresa').attr('data-c_empresa', c_empresa)

        const fnCrearTablaPadre = function () {
            $(tablePadre).CreateGrid({
                query: 'tbl_caja_procesos_aprobarpago_obteneregresos',
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
                    }
                },
                hiddens: ['C_EMPRESA', 'C_MOVIMIENTO', 'C_CUENTA_BANCARIA', 'C_TIPO_MOVIMIENTO_CTA_BANCARIA', 'IND_ESTADO', 'REQ_APROB'],
                columns: {
                    'NRO_OPERACION': { text: 'Nro. ope', width: 80 },
                    'NUMERO_CUENTA': { text: 'Nro de cuenta', width: 250 },
                    'DESCRIPCION': { text: 'Descripción', width: 200 },
                    'NOMBRE_TIPO_MOVIMIENTO': { text: 'Tipo de movimiento', width: 150 },
                    'FECHA_REGISTRO': { text: 'Fecha registro', width: 100 },
                    'MONTO_MOV': {
                        text: 'Monto mov.', width: 80,
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
                },
                config: {
                    virtualmode: false,
                    height: 400,
                    pageSize: 999999,
                    pageable: false,
                    sortable: false,
                    editable: false,
                    showaggregates: true,
                    selectionMode: 'checkbox',
                    showstatusbar: true,
                    statusbarheight: 20,
                    rendered: function () {
                        fnCrearTabla();
                    }
                }
            });
            $(tablePadre).on('rowselect', function (event) {
                //if ($(table)[0].children.length > 0) {
                $(table).jqxGrid('updatebounddata')
                //}
                //else {
                //    fnCrearTabla();
                //}
            });
        }


        const fnCrearTabla = function () {
            $(table).CreateGrid({
                query: 'tbl_caja_procesos_aprobarpago_obteneregresos_detalle',
                items: {
                    C_EMPRESA: c_empresa,
                    C_MOVIMIENTO: function () {
                        var index = $(tablePadre).jqxGrid('getselectedrowindex');
                        if (index == -1) {
                            return ''
                        }
                        else {
                            var row = $(tablePadre).jqxGrid('getrows')[index];
                            if (row != undefined) {
                                return row['C_MOVIMIENTO']
                            }
                            else {
                                return ''
                            }
                        }
                    },
                    C_CUENTA_BANCARIA: function () {
                        var index = $(tablePadre).jqxGrid('getselectedrowindex');
                        if (index == -1) {
                            return ''
                        }
                        else {
                            var row = $(tablePadre).jqxGrid('getrows')[index];
                            if (row != undefined) {
                                return row['C_CUENTA_BANCARIA'];
                            }
                            else {
                                return ''
                            }
                        }
                    },
                    C_TIPO_MOVIMIENTO_CTA_BANCARIA: function () {
                        var index = $(tablePadre).jqxGrid('getselectedrowindex');
                        if (index == -1) {
                            return ''
                        }
                        else {
                            var row = $(tablePadre).jqxGrid('getrows')[index];
                            if (row != undefined) {
                                return row['C_TIPO_MOVIMIENTO_CTA_BANCARIA'];
                            }
                            else {
                                return ''
                            }
                        }
                    },
                },
                hiddens: ['C_EMPRESA', 'C_MOVIMIENTO', 'C_CUENTA_BANCARIA', 'C_TIPO_MOVIMIENTO_CTA_BANCARIA', 'C_MOVIMIENTO_DETALLE'],
                columns: {
                    'NRO_OPERACION': { text: 'Nro. ope', width: 80 },
                    'NUMERO_CUENTA': { text: 'Tipo de cuenta', width: 250 },
                    'NOMBRE_TIPO_MOVIMIENTO': { text: 'Tipo de movimiento', width: 150 },
                    'FECHA_REGISTRO': { text: 'Fecha registro', width: 100 },
                    'DESCRIPCION': { text: 'Descripción', width: 200 },
                    'MONTO_PAGO': {
                        text: 'Monto', width: 80,
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
                    'MONTO_DOC': {
                        text: 'Monto doc.', width: 80,
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
                    'SALDO': {
                        text: 'Monto saldo.', width: 80,
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
                    'TIPO_DOCUMENTO': { text: 'Tipo documento', width: 100 },
                    'NRO_COMPROBANTE': { text: 'Nro documento', width: 100 },
                    'PROVEEDOR': { text: 'Proveedor', width: 200 },


                },
                config: {
                    virtualmode: false,
                    height: 400,
                    pageSize: 999999,
                    pageable: false,
                    sortable: false,
                    editable: false,
                    showaggregates: true,
                    showstatusbar: true,
                    statusbarheight: 20,
                    rendered: function () {
                    }
                }
            });
        }

        const actionAprobarPago = function () {
            const getselectedrowindexes = $(tablePadre).jqxGrid('getselectedrowindexes');
            if (getselectedrowindexes.length > 0) {
                $.each(getselectedrowindexes, function (i, v) {
                    var fila = $(tablePadre).jqxGrid('getrows')[v];
                    var condition = `C_EMPRESA = '${c_empresa}' AND C_MOVIMIENTO = '${fila['C_MOVIMIENTO']}' AND C_CUENTA_BANCARIA = '${fila['C_CUENTA_BANCARIA']}' AND C_TIPO_MOVIMIENTO_CTA_BANCARIA = '${fila['C_TIPO_MOVIMIENTO_CTA_BANCARIA']}'`;
                    $.AddPetition({
                        type: 2,
                        table: 'CAJA.MOVIMIENTO_CTA_BANCARIA',
                        condition: condition,
                        items: $.ConvertObjectToArr({
                            C_EMPRESA: fila['C_EMPRESA'],
                            C_MOVIMIENTO: fila['C_MOVIMIENTO'],
                            C_CUENTA_BANCARIA: fila['C_CUENTA_BANCARIA'],
                            C_TIPO_MOVIMIENTO_CTA_BANCARIA: fila['C_TIPO_MOVIMIENTO_CTA_BANCARIA'],
                            IND_ESTADO: 'A'
                        })
                    });
                });

                $.SendPetition({
                    onBefore: function () {
                        $.DisplayStatusBar({ message: 'Aprobando pagos.' });
                    },
                    onReady: function (result) {
                        $.CloseStatusBar();
                        alertify.success('Los pagos han sido aprobados correctamente.');
                        $(tablePadre).jqxGrid('updatebounddata')
                    },
                    onError: function (error) {
                        $.CloseStatusBar();
                        $.ShowError({ error: error });
                    }
                })
            }
        }

        $(actions).CreateActions({
            text: 'Acciones',
            class: 'btn btn-sm btn-orange',
            actions: {
                'Aprobar pagos': {
                    callback: actionAprobarPago,
                    icon: 'fa fa-check'
                },
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
                fnCrearTablaPadre();
                //fnCrearTabla();
            },
            onReady: function () {
                $(tablePadre).jqxGrid('updatebounddata');
            }
        })
    });
});