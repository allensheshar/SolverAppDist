require(["helper", "extras", "controls", "datetimepicker", "bootstrap-select"], function () {
    require(["alertify", "moment", "bootbox", "numeral"], function (alertify, moment, bootbox, numeral) {

        alertify.set('notifier', 'position', 'top-center');

        let _controls;
        const frm = 'form[name=frame]'
        const actionsMovimientosDocumentos = '#actionsMovimientosDocumentos';
        const actionsMovimientosCaja = '#actionsMovimientosCaja';
        const actionsDetalleGastos = '#actionsDetalleGastos';
        const tblMovDoc = '#tblMovDoc';
        const tblMovCaja = '#tblMovCaja';
        const tblMovGastos = '#tblMovGastos';
        let datos;
        let codTipo;
        let editar;

        const fnCrearTabla = function () {
            if (datos['DOCS'] == '*') {
                $('#divTblMovDoc').html(`
                    <div class="row mt-3">
                        <div class="col-12">
                            <h3>Movimiento de documentos</h3>
                            <div id="actionsMovimientosDocumentos"></div>
                            <div id="tblMovDoc"></div>
                        </div>
                    </div>
                `);
                $(tblMovDoc).CreateGrid({
                    query: 'tbl_caja_procesos_movimiento_documentos',
                    items: {
                        C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                        C_MOVIMIENTO: function () {
                            return $(_controls.C_MOVIMIENTO).val();
                        },

                    },
                    hiddens: ['C_MOVIMIENTO', 'C_DOCUMENTO', 'C_MONEDA', 'C_LETRA_CUOTA'],
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
                        'RAZON_SOCIAL': {
                            text: 'Cliente / Proveedor',
                            editable: false,
                            width: 400
                        },
                        'TIPO_COMPROBANTE': {
                            text: 'Tipo comprobante',
                            editable: false,
                            width: 140,
                        },
                        'NRO_COMPROBANTE': {
                            text: 'Comprobante',
                            editable: false,
                            width: 120
                        },
                        'FECHA_EMISION': {
                            text: 'Emision',
                            cellsAlign: 'center',
                            editable: false,
                            width: 90
                        },
                        'MONEDA': {
                            text: '',
                            editable: false,
                            width: 30,
                            cellsAlign: 'center'
                        },
                        'TOTAL': {
                            text: 'Saldo',
                            width: 70,
                            editable: false,
                            cellsAlign: 'right',
                            cellsFormat: 'd2'
                        },
                        'PAGO': {
                            text: datos['NOM_COLUMNA_DOCS_CARGO'],
                            width: 70,
                            cellsAlign: 'right',
                            editable: true,
                            columnType: 'numberinput',
                            cellsFormat: 'd2',
                            aggregates: ['sum'], aggregatesRenderer: function (aggregates, column, element) {
                                var formatNumber = aggregates.sum;
                                if (formatNumber === undefined)
                                    formatNumber = '';
                                return `<div class="h-30 d-flex justify-content-center align-items-center font-weight-bold">
                                    <strong id="totalDineroRecibido"> ${formatNumber} </strong>
                                </div>`;
                            }
                        },
                        'COBRANZA': {
                            text: datos['NOM_COLUMNA_DOCS_ABONO'],
                            width: 70,
                            cellsAlign: 'right',
                            editable: true,
                            columnType: 'numberinput',
                            cellsFormat: 'd2',
                            aggregates: ['sum'], aggregatesRenderer: function (aggregates, column, element) {
                                var formatNumber = aggregates.sum;
                                if (formatNumber === undefined)
                                    formatNumber = '';
                                return `<div class="h-30 d-flex justify-content-center align-items-center font-weight-bold">
                                    <strong id="totalDineroRecibido"> ${formatNumber} </strong>
                                </div>`;
                            }
                        },
                        'ACCION': {
                            text: '',
                            editable: false,
                            width: 25,
                            cellsRenderer: function (row, columnfield, value, defaulthtml, columnproperties) {
                                return `<a href="javascript:;" onclick="$.BorrarDocumento('${row}');" style="margin-top: 0.4rem;display: block;margin-left: 0.6rem;"><i class="fa fa-trash" aria-hidden="true"></i></span>`;
                            },
                            sortable: false,
                        }
                    },
                    config: {
                        virtualmode: false,
                        height: 220,
                        pageSize: 100,
                        pageable: false,
                        sortable: false,
                        editable: true,

                        showaggregates: true,
                        showstatusbar: true,
                        statusbarheight: 20,
                    }
                });
                $(actionsMovimientosDocumentos).CreateActions({
                    text: 'Acciones',
                    class: 'btn btn-sm btn-orange',
                    actions: {
                        'Insertar': {
                            callback: actionInsertarDocumentos
                        },
                    }
                })
            }

            if (datos['BANCOS'] == '*') {
                $('#divTblMovCaja').html(`
                        <div class="row mt-3">
                            <div class="col-12">
                                <h3>Movimiento de Caja / Bancos</h3>
                                <div id="actionsMovimientosCaja"></div>
                                <div id="tblMovCaja"></div>
                            </div>
                        </div>
                    `);
                $(tblMovCaja).CreateGrid({
                    query: 'tbl_caja_procesos_movimiento_bancos',
                    hiddens: ['C_MOVIMIENTO', 'C_BANCO', 'C_CUENTA_BANCARIA', 'PAGUESE_A_ORDEN', 'C_TIPO_DOCUMENTO'],
                    items: {
                        C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                        C_MOVIMIENTO: function () {
                            return $(_controls.C_MOVIMIENTO).val();
                        }
                    },
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
                        'RAZON_SOCIAL': {
                            text: 'Banco',
                            editable: false,
                            width: 250
                        },
                        'CUENTA': {
                            text: 'Cuenta',
                            editable: false,
                            width: 200
                        },
                        'NUMERO': {
                            text: 'Número',
                            editable: true,
                            width: 100
                        },
                        'DESCRIPCION': {
                            text: 'Descripción',
                            editable: true,
                            width: 300
                        },
                        'COBRANZA': {
                            text: datos['NOM_COLUMNA_BANC_CARGO'],
                            editable: true,
                            width: 70,
                            cellsAlign: 'right',
                            columnType: 'numberinput',
                            cellsFormat: 'd2',
                            aggregates: ['sum'], aggregatesRenderer: function (aggregates, column, element) {
                                var formatNumber = aggregates.sum;
                                if (formatNumber === undefined)
                                    formatNumber = '';
                                return `<div class="h-30 d-flex justify-content-center align-items-center font-weight-bold">
                                <strong id="totalDineroRecibido"> ${formatNumber} </strong>
                            </div>`;
                            }
                        },
                        'PAGO': {
                            text: datos['NOM_COLUMNA_BANC_ABONO'],
                            editable: true,
                            width: 70,
                            cellsAlign: 'right',
                            columnType: 'numberinput',
                            cellsFormat: 'd2',
                            aggregates: ['sum'], aggregatesRenderer: function (aggregates, column, element) {
                                var formatNumber = aggregates.sum;
                                if (formatNumber === undefined)
                                    formatNumber = '';
                                return `<div class="h-30 d-flex justify-content-center align-items-center font-weight-bold">
                                <strong id="totalDineroRecibido"> ${formatNumber} </strong>
                            </div>`;
                            }
                        },
                        'ACCION': {
                            text: '',
                            editable: false,
                            width: 25,
                            cellsRenderer: function (row, columnfield, value, defaulthtml, columnproperties) {
                                return `<a href="javascript:;" onclick="$.BorrarCaja('${row}');" style="margin-top: 0.4rem;display: block;margin-left: 0.6rem;"><i class="fa fa-trash" aria-hidden="true"></i></span>`;
                            },
                            sortable: false,
                        }
                    },
                    config: {
                        virtualmode: false,
                        height: 150,
                        pageSize: 100,
                        pageable: false,
                        sortable: false,
                        editable: false,

                        showaggregates: true,
                        showstatusbar: true,
                        statusbarheight: 20,
                    }
                });
                $(tblMovCaja).on('rowdoubleclick', function (event) {
                    var args = event.args;
                    var boundIndex = args.rowindex;

                    const row = $(tblMovCaja).jqxGrid('getrows')[boundIndex];
                    actionInsertarCaja(row, boundIndex);
                })
                $(actionsMovimientosCaja).CreateActions({
                    text: 'Acciones',
                    class: 'btn btn-sm btn-orange',
                    actions: {
                        'Insertar': {
                            callback: actionInsertarCaja
                        },
                    }
                })
            }

            if (datos['GASTOS'] == '*') {
                $('#divTblMovGastos').html(`
                        <div class="row mt-3">
                            <div class="col-12">
                                <h3>Detalle de Gastos</h3>
                                <div id="actionsDetalleGastos"></div>
                                <div id="tblMovGastos"></div>
                            </div>
                        </div>
                    `);
                $(tblMovGastos).CreateGrid({
                    query: 'tbl_caja_procesos_movimiento_gastos',
                    hiddens: ['C_MOVIMIENTO', 'C_TIPO_GASTO', 'C_TIPO_DOCUMENTO', 'NUMERO_DOC'],
                    items: {
                        C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                        C_MOVIMIENTO: function () {
                            return $(_controls.C_MOVIMIENTO).val();
                        }
                    },
                    columns: {
                        '_rowNum': {
                            text: '#',
                            width: '30',
                            cellsAlign: 'center',
                            hidden: false,
                            pinned: true,
                            sortable: false
                        },
                        'CUENTA': {
                            text: 'Cuenta',
                            width: 170
                        },
                        'NOMBRE_CUENTA': {
                            text: 'Nombre cuenta',
                            width: 370
                        },
                        'DESCRIPCION': {
                            text: 'Descripción',
                            width: 310
                        },
                        'GASTO': {
                            text: datos['NOM_COLUMNA_GASTOS_CARGO'],
                            width: 70,
                            cellsAlign: 'right',
                            columnType: 'numberinput',
                            cellsFormat: 'd2',
                            aggregates: ['sum'], aggregatesRenderer: function (aggregates, column, element) {
                                var formatNumber = aggregates.sum;
                                if (formatNumber === undefined)
                                    formatNumber = '';
                                return `<div class="h-30 d-flex justify-content-center align-items-center font-weight-bold">
                                <strong id="totalDineroRecibido"> ${formatNumber} </strong>
                            </div>`;
                            }
                        },
                        'INGRESO': {
                            text: datos['NOM_COLUMNA_GASTOS_ABONO'],
                            width: 70,
                            cellsAlign: 'right',
                            columnType: 'numberinput',
                            cellsFormat: 'd2',
                            aggregates: ['sum'], aggregatesRenderer: function (aggregates, column, element) {
                                var formatNumber = aggregates.sum;
                                if (formatNumber === undefined)
                                    formatNumber = '';
                                return `<div class="h-30 d-flex justify-content-center align-items-center font-weight-bold">
                                <strong id="totalDineroRecibido"> ${formatNumber} </strong>
                            </div>`;
                            }
                        },
                        'ACCION': {
                            text: '',
                            editable: false,
                            width: 25,
                            cellsRenderer: function (row, columnfield, value, defaulthtml, columnproperties) {
                                return `<a href="javascript:;" onclick="$.BorrarGasto('${row}');" style="margin-top: 0.4rem;display: block;margin-left: 0.6rem;"><i class="fa fa-trash" aria-hidden="true"></i></span>`;
                            },
                            sortable: false,
                        }
                    },
                    config: {
                        virtualmode: false,
                        height: 150,
                        pageSize: 100,
                        pageable: false,
                        sortable: false,
                        editable: false,

                        showaggregates: true,
                        showstatusbar: true,
                        statusbarheight: 20,
                    }
                });
                $(tblMovGastos).on('rowdoubleclick', function (event) {
                    var args = event.args;
                    var boundIndex = args.rowindex;

                    const row = $(tblMovGastos).jqxGrid('getrows')[boundIndex];
                    actionInsertarGasto(row, boundIndex);
                })
                $(actionsDetalleGastos).CreateActions({
                    text: 'Acciones',
                    class: 'btn btn-sm btn-orange',
                    actions: {
                        'Insertar': {
                            callback: actionInsertarGasto
                        },
                    }
                })
            }
        }

        const actionInsertarDocumentos = function () {
            if ($(_controls.C_MONEDA).val() != '') {
                let queryTable = '';
                let queryCliente = '';

                $.GetQuery({
                    query: ['q_caja_procesos_nuevomovimiento_obtenerquerys_por_flag'],
                    items: [{
                        FLAG: function () {
                            return $(_controls.TIPO)[0].args.data.filter(x => x['C_TIPO_MOVIMIENTO_CTA_BANCARIA'] == $(_controls.TIPO).val())[0].FLAG;
                        }
                    }],
                    onReady: function (result) {
                        queryCliente = result[0]['CODIGO_PARAMETRO_2'];
                        queryTable = result[0]['CODIGO_PARAMETRO_3'];

                        $.solver.fn.fnAbrirModal({
                            query: queryTable,
                            title: 'Busqueda de documentos',
                            hiddens: ['SIGNO_MONEDA', 'C_TIPO_COMPROBANTE', 'PAGO', 'COBRANZA', 'C_MONEDA', 'C_LETRA_CUOTA'],
                            items: {
                                CODIGOS: function () {
                                    var codigos = []
                                    $.each($(tblMovDoc).jqxGrid('getrows'), function (i, v) {
                                        codigos.push(v.C_DOCUMENTO);
                                    });
                                    return codigos.join(',');
                                },
                                MONEDA: function () {
                                    return $(_controls.C_MONEDA).val();
                                }
                            },
                            columns: {
                                C_VENTA: {
                                    text: 'Código',
                                    width: 80
                                },
                                RAZON_SOCIAL: {
                                    text: 'Cliente',
                                    width: 700,
                                },
                                TIPO_DOCUMENTO: {
                                    text: 'Tipo de documento',
                                    cellsAlign: 'center',
                                    width: 120,
                                },
                                DOCUMENTO: {
                                    text: 'Documento',
                                    cellsAlign: 'center',
                                    width: 100,
                                },
                                FECHA_EMISION: {
                                    text: 'Fecha emic.',
                                    cellsAlign: 'center',
                                    width: 80,
                                },
                                FECHA_VENCIMIENTO: {
                                    text: 'Fecha venc.',
                                    cellsAlign: 'center',
                                    width: 80,
                                },
                                MONEDA: {
                                    text: 'Moneda',
                                    width: 70,
                                },
                                TOTAL: {
                                    text: 'Monto',
                                    width: 80,
                                    cellsAlign: 'right',
                                    cellsFormat: 'd2'
                                },
                            },
                            controls: {
                                cliente: {
                                    class: 'col-lg-4',
                                    html: `<select class="form-control form-control-sm" name="cliente" data-textDefault="-- Seleccione --" data-live-search="true" data-style="btn-light" data-size="10" data-query="${queryCliente}" data-field="RAZON_SOCIAL" data-value="C_CLIENTE" data-C_EMPRESA="${$.solver.session.SESSION_EMPRESA}"></select>`,
                                    control: 'select'
                                },
                            },
                            controlsAfter: {
                                procesar: {
                                    class: 'col-auto',
                                    html: `<button id="btnProcesar" type="button" class="btn btn-sm btn-danger"><i class="fa fa-floppy-o" aria-hidden="true"></i> Aceptar</button>`
                                },
                                total: {
                                    class: 'col',
                                    html: `<span id="monto" class="float-right" style="font-size:20px;"></span>`
                                }
                            },
                            onEscape: true,
                            config: {
                                virtualmode: false,
                                height: 600,
                                pageSize: 100,
                                pageable: false,
                                sortable: false,
                                editable: false,
                                selectionMode: 'checkbox',
                            },
                            onReady: function (form, controls, formToken, dialog) {
                                $(controls.cliente).selectpicker();
                                $(controls.cliente).change(function () {
                                    $(form).submit();
                                });
                                $(form).find('#btnProcesar').click(function () {
                                    var getselectedrowindexes = $(`#${formToken}_table`).jqxGrid('getselectedrowindexes');
                                    $.each(getselectedrowindexes, function (i, v) {
                                        const row = $(`#${formToken}_table`).jqxGrid('getrows')[v];
                                        var c_tipo_doc = row['C_TIPO_COMPROBANTE']
                                        var total = row['TOTAL'] * (c_tipo_doc == '07241' ? -1 : 1);
                                        $(tblMovDoc).jqxGrid('addrow', null, {
                                            '_rowNum': $(tblMovDoc).jqxGrid('getrows').length + 1,
                                            'C_MOVIMIENTO': '',
                                            'C_MOVIMIENTO_DETALLE': '',
                                            'RAZON_SOCIAL': row['RAZON_SOCIAL'],
                                            'TIPO_COMPROBANTE': row['TIPO_DOCUMENTO'],
                                            'NRO_COMPROBANTE': row['DOCUMENTO'],
                                            'FECHA_EMISION': row['FECHA_EMISION'],
                                            'MONEDA': row['SIGNO_MONEDA'],
                                            'TOTAL': total,
                                            'PAGO': row['PAGO'],
                                            'COBRANZA': row['COBRANZA'],
                                            'C_DOCUMENTO': row['C_VENTA'],
                                            'C_MONEDA': row['C_MONEDA'],
                                            'C_LETRA_CUOTA': row['C_LETRA_CUOTA']
                                        });
                                        $(tblMovDoc).jqxGrid('refresh');

                                        $(_controls.C_PERSONA).val($(controls.cliente).val());
                                        $(dialog).modal('hide')
                                    })
                                })

                                if ($(_controls.C_PERSONA).val() != '' && $(tblMovDoc).jqxGrid('getrows').length > 0) {
                                    $(controls.cliente).val($(_controls.C_PERSONA).val()).trigger('change');
                                    $(controls.cliente).attr('disabled', 'disabled');
                                }
                            },
                            onRowSelect: function (event, table, formToken) {
                                var c_moneda = $(_controls.C_MONEDA).val();
                                var signo_moneda = $(_controls.C_MONEDA)[0].args.data.filter(x => x['CODIGO'] == c_moneda)[0].CODIGO_PARAMETRO_2;
                                var monto = 0;
                                $.each($(table).jqxGrid('getselectedrowindexes'), function (i, v) {
                                    if (codTipo == 'I') {
                                        monto += ($(table).jqxGrid('getrows')[v]['COBRANZA'] - $(table).jqxGrid('getrows')[v]['PAGO']);
                                    }
                                    else {
                                        monto += ($(table).jqxGrid('getrows')[v]['PAGO'] - $(table).jqxGrid('getrows')[v]['COBRANZA']);
                                    }
                                });
                                $(`#${formToken}_form #monto`).html('Total a cancelar: <strong>' + signo_moneda + ' ' + monto.toFixed(2) + '</strong > ');
                            },
                            onRowUnSelect: function (event, table, formToken) {
                                var c_moneda = $(_controls.C_MONEDA).val();
                                var signo_moneda = $(_controls.C_MONEDA)[0].args.data.filter(x => x['CODIGO'] == c_moneda)[0].CODIGO_PARAMETRO_2;
                                var monto = 0;
                                $.each($(table).jqxGrid('getselectedrowindexes'), function (i, v) {
                                    if (codTipo == 'I') {
                                        monto += ($(table).jqxGrid('getrows')[v]['COBRANZA'] - $(table).jqxGrid('getrows')[v]['PAGO']);
                                    }
                                    else {
                                        monto += ($(table).jqxGrid('getrows')[v]['PAGO'] - $(table).jqxGrid('getrows')[v]['COBRANZA']);
                                    }
                                });
                                $(`#${formToken}_form #monto`).html('Total a cancelar: <strong>' + signo_moneda + ' ' + monto.toFixed(2) + '</strong > ');
                            },
                        });
                    }
                });
            }
            else {
                alertify.warning('Por favor seleccione la moneda.');
            }
        }
        const fnBorrarDocumento = function (index) {
            const rowid = $(tblMovDoc).jqxGrid('getrowid', index)
            $(tblMovDoc).jqxGrid('deleterow', rowid);
        }

        const actionInsertarCaja = function (row, index) {
            if ($(_controls.C_MONEDA).val() != '') {
                var token = $.CreateToken();
                var dialog = bootbox.dialog({
                    title: 'Ingresar movimiento',
                    message: `<div id="${token}"></div>`,
                    onEscape: true
                });
                dialog.init(function () {
                    setTimeout(function () {
                        // Agregando estilos al modal
                        $(dialog).find('.modal-dialog').css({ 'max-width': '30%' })
                        $(dialog).find('.modal-dialog').css({ 'margin-top': '4%' })

                        var objControls = null;
                        $(dialog).find('#' + token).html(`
                            <form id="${token}_form" autocomplete="off">
                                <div class="row">
                                    <div class="col">
                                        <div class="form-group">
                                            <label class="col-form-label">Banco</label>
                                            <select
                                                name="C_BANCO" class="form-control form-control-sm"
                                                data-query="gbl_lista_obtenerbancos" data-value="C_BANCO" data-field="RAZON_SOCIAL"
                                                data-C_EMPRESA="${$.solver.session.SESSION_EMPRESA}" data-textdefault="--seleccione--" required></select>
                                        </div>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col">
                                        <div class="form-group">
                                            <label class="col-form-label">Cuenta Bancaria</label>
                                            <select
                                                name="C_CUENTA_BANCARIA" class="form-control form-control-sm"
                                                data-query="gbl_obtener_numerocuentas_moneda" data-value="C_CUENTA_BANCARIA" data-field="NUMERO_CUENTA"
                                                data-C_BANCO="" data-C_EMPRESA="${$.solver.session.SESSION_EMPRESA}"
                                                data-textdefault="--seleccione--" required></select>
                                        </div>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col">
                                        <div class="form-group">
                                            <label class="col-form-label">Tipo de documento</label>
                                            <select name="C_TIPO_DOCUMENTO" class="form-control form-control-sm" data-query="gbl_obtener_tipo_documento_movimiento" data-value="C_PARAMETRO_GENERAL" data-field="DESCRIPCION_PARAMETRO" data-textdefault="--seleccione--" required></select>
                                        </div>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col">
                                        <div class="form-group">
                                            <label class="col-form-label">Número de documento</label>
                                            <input type="text" class="form-control form-control-sm" name="NUMERO_DOC" required>
                                        </div>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col">
                                        <div class="form-group">
                                            <label class="col-form-label">Cargo</label>
                                            <input type="number" class="form-control form-control-sm" name="CARGO" placeholder="0.00" style="text-align: end;">
                                        </div>
                                    </div>
                                    <div class="col">
                                        <div class="form-group">
                                            <label class="col-form-label">Abono</label>
                                            <input type="number" class="form-control form-control-sm" name="ABONO" placeholder="0.00" style="text-align: end;">
                                        </div>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col">
                                        <div class="form-group">
                                            <label class="col-form-label">Descripción</label>
                                            <textarea class="form-control form-control-sm" rows="3" cols="45" name="DESCRIPCION"></textarea>
                                        </div>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col">
                                        <div class="form-group">
                                            <label class="col-form-label">Páguese a la orden de: (Apellido Paterno + Materno + Nombres)</label>
                                            <input class="form-control form-control-sm" name="PAGUESE_A_ORDEN" required>
                                        </div>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col">
                                        <button type="submit" class="btn btn-danger btn-sm float-right"><i class="fa fa-floppy-o" aria-hidden="true"></i> Guardar</button>
                                    </div>
                                </div>
                            </form>
                        `);

                        //Validamos formulario
                        $(dialog).find('#' + token + '_form').ValidForm({
                            type: -1,
                            onDone: function (form, controls) {
                                objControls = controls;

                                $(controls.C_BANCO).change(function () {
                                    $(controls.C_CUENTA_BANCARIA).attr('data-C_BANCO', $(controls.C_BANCO).val()).FieldLoadRemote();
                                })

                                if (row != undefined) {
                                    $(controls.C_BANCO).val(row['C_BANCO']);
                                    $(controls.C_CUENTA_BANCARIA).attr('data-C_BANCO', (row['C_BANCO'] == null ? '' : row['C_BANCO'])).FieldLoadRemote({
                                        onReady: function () {
                                            $(controls.C_CUENTA_BANCARIA).val(row['C_CUENTA_BANCARIA'])
                                        }
                                    });
                                    $(controls.C_TIPO_DOCUMENTO).val(row['C_TIPO_DOCUMENTO']);
                                    $(controls.NUMERO_DOC).val(row['NUMERO']);
                                    $(controls.CARGO).val(row['COBRANZA']);
                                    $(controls.ABONO).val(row['PAGO']);
                                    $(controls.DESCRIPCION).val(row['DESCRIPCION']);
                                    $(controls.PAGUESE_A_ORDEN).val(row['PAGUESE_A_ORDEN']);
                                }
                            },
                            onReady: function (result, controls, object) {
                                var c_banco = $(controls.C_BANCO).val();
                                var c_cuenta_bancaria = $(controls.C_CUENTA_BANCARIA).val();
                                var razon_social = $(controls.C_BANCO)[0].args.data.filter(x => x['C_BANCO'] == c_banco);
                                if (razon_social.length != 0) {
                                    razon_social = razon_social[0].RAZON_SOCIAL
                                }
                                var cuentaBancaria = $(controls.C_CUENTA_BANCARIA)[0].args.data.filter(x => (x['C_BANCO'] == null ? '' : x['C_BANCO']) == c_banco && x['C_CUENTA_BANCARIA'] == c_cuenta_bancaria);
                                var cuenta = cuentaBancaria[0].NUMERO_CUENTA_2
                                if (razon_social.length == 0) {
                                    cuenta = cuentaBancaria[0].MONEDA;
                                    razon_social = cuentaBancaria[0].NUMERO_CUENTA_2;
                                }
                                var descripcion = $(controls.DESCRIPCION).val()
                                var gasto = ($(controls.CARGO).val() == '' ? 0 : parseFloat($(controls.CARGO).val()))
                                var ingreso = ($(controls.ABONO).val() == '' ? 0 : parseFloat($(controls.ABONO).val()))
                                var c_tipo_documento = $(controls.C_TIPO_DOCUMENTO).val();
                                var numero_doc = $(controls.NUMERO_DOC).val();
                                var paguese_a_orden = $(controls.PAGUESE_A_ORDEN).val();

                                if (row == undefined) {
                                    $(tblMovCaja).jqxGrid('addrow', null, {
                                        '_rowNum': $(tblMovCaja).jqxGrid('getrows').length + 1,
                                        'C_MOVIMIENTO': '',
                                        'C_MOVIMIENTO_DETALLE': '',
                                        'C_BANCO': c_banco,
                                        'C_CUENTA_BANCARIA': c_cuenta_bancaria,
                                        'RAZON_SOCIAL': razon_social,
                                        'CUENTA': cuenta,
                                        'DESCRIPCION': descripcion,
                                        'COBRANZA': gasto,
                                        'PAGO': ingreso,
                                        'C_TIPO_DOCUMENTO': c_tipo_documento,
                                        'NUMERO': numero_doc,
                                        'PAGUESE_A_ORDEN': paguese_a_orden,
                                    });
                                }
                                else {
                                    $(tblMovCaja).jqxGrid('getrows')[index]['C_BANCO'] = c_banco;
                                    $(tblMovCaja).jqxGrid('getrows')[index]['C_CUENTA_BANCARIA'] = c_cuenta_bancaria;
                                    $(tblMovCaja).jqxGrid('getrows')[index]['RAZON_SOCIAL'] = razon_social;
                                    $(tblMovCaja).jqxGrid('getrows')[index]['CUENTA'] = cuenta;
                                    $(tblMovCaja).jqxGrid('getrows')[index]['DESCRIPCION'] = descripcion;
                                    $(tblMovCaja).jqxGrid('getrows')[index]['COBRANZA'] = gasto;
                                    $(tblMovCaja).jqxGrid('getrows')[index]['PAGO'] = ingreso;
                                    $(tblMovCaja).jqxGrid('getrows')[index]['C_TIPO_DOCUMENTO'] = c_tipo_documento;
                                    $(tblMovCaja).jqxGrid('getrows')[index]['NUMERO'] = numero_doc;
                                    $(tblMovCaja).jqxGrid('getrows')[index]['PAGUESE_A_ORDEN'] = paguese_a_orden;
                                }
                                $(tblMovCaja).jqxGrid('refresh');
                                $(dialog).modal('hide');
                            }
                        });

                        $('.bootbox .modal-dialog').draggable({
                            handle: '.modal-header'
                        });
                        $('.bootbox .modal-header').css('cursor', 'move');

                    }, 150);
                })
            }
            else {
                alertify.warning('Por favor seleccione la moneda.');
            }
        }
        const fnBorrarCaja = function (index) {
            const rowid = $(tblMovCaja).jqxGrid('getrowid', index)
            $(tblMovCaja).jqxGrid('deleterow', rowid);
        }

        const actionInsertarGasto = function (row, index) {
            var token = $.CreateToken();
            var dialog = bootbox.dialog({
                title: 'Ingresar gasto',
                message: `<div id="${token}"></div>`,
                onEscape: true
            });
            dialog.init(function () {
                setTimeout(function () {
                    // Agregando estilos al modal
                    $(dialog).find('.modal-dialog').css({ 'max-width': '30%' })
                    $(dialog).find('.modal-dialog').css({ 'margin-top': '4%' })

                    var objControls = null;
                    $(dialog).find('#' + token).html(`
                        <form id="${token}_form" autocomplete="off">
                            <input type="hidden" name="C_TIPO_GASTO" />
                            <div class="row">
                                <div class="col">
                                    <div class="form-group">
                                        <label class="col-form-label">Tipo de egreso</label>
                                        <div class="input-group">
                                            <input class="form-control form-control-sm" type="text" name="NOMBRE_GASTO" readonly="readonly" required>
                                            <div class="input-group-append">
                                                <button id="btnTipoEgreso" class="btn btn-orange btn-sm btn-filter" type="button"><i class="fa fa-search"></i></button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col">
                                    <div class="form-group">
                                        <label class="col-form-label">Tipo de documento</label>
                                        <select name="C_TIPO_DOCUMENTO" class="form-control form-control-sm" data-query="gbl_obtener_tipo_documento_compras_nuevacompra" data-value="C_PARAMETRO_GENERAL" data-field="DESCRIPCION_PARAMETRO" data-textdefault="--seleccione--"></select>
                                    </div>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col">
                                    <div class="form-group">
                                        <label class="col-form-label">Número de documento</label>
                                        <input type="text" class="form-control form-control-sm" name="NUMERO_DOC">
                                    </div>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col">
                                    <div class="form-group">
                                        <label class="col-form-label">Gasto</label>
                                        <input type="number" class="form-control form-control-sm" name="GASTO" placeholder="0.00" style="text-align: end;">
                                    </div>
                                </div>
                                <div class="col">
                                    <div class="form-group">
                                        <label class="col-form-label">Ingreso</label>
                                        <input type="number" class="form-control form-control-sm" name="INGRESO" placeholder="0.00" style="text-align: end;">
                                    </div>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col">
                                    <div class="form-group">
                                        <label class="col-form-label">Descripción</label>
                                        <textarea class="form-control form-control-sm" rows="3" cols="45" name="DESCRIPCION"></textarea>
                                    </div>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col">
                                    <button type="submit" class="btn btn-danger btn-sm float-right"><i class="fa fa-floppy-o" aria-hidden="true"></i> Guardar</button>
                                </div>
                            </div>
                        </form>
                    `);

                    //Validamos formulario
                    $(dialog).find('#' + token + '_form').ValidForm({
                        type: -1,
                        onDone: function (form, controls) {
                            objControls = controls;

                            $('#btnTipoEgreso').click(function () {
                                $.solver.fn.fnAbrirModal({
                                    query: 'tbl_caja_procesos_movimiento_buscargasto',
                                    title: 'Busqueda de bancos y cuentas bancarias',
                                    hiddens: ['C_EMPRESA'],
                                    items: {
                                        CODIGOS: function () {
                                            var codigos = []
                                            $.each($(tblMovGastos).jqxGrid('getrows'), function (i, v) {
                                                codigos.push(v.C_TIPO_GASTO);
                                            });
                                            return codigos.join(',');
                                        },
                                    },
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
                                        C_TIPO_GASTO: {
                                            text: 'Código',
                                            width: 60,
                                        },
                                        NOMBRE_GASTO: {
                                            text: 'Nombre gasto',
                                            width: 200,
                                        },
                                        DESCRIPCION: {
                                            text: 'Descripción',
                                            width: 400,
                                        },
                                    },
                                    onEscape: true,
                                    config: {
                                        virtualmode: false,
                                        height: 600,
                                        pageSize: 100,
                                        pageable: false,
                                        sortable: false,
                                        editable: false,
                                    },
                                    onSelected: function (row) {
                                        $(controls.NOMBRE_GASTO).val(row['NOMBRE_GASTO']);
                                        $(controls.C_TIPO_GASTO).val(row['C_TIPO_GASTO']);
                                    }
                                });
                            });

                            if (row != undefined) {
                                $(controls.C_TIPO_GASTO).val(row['C_TIPO_GASTO']);
                                $(controls.NOMBRE_GASTO).val(row['NOMBRE_CUENTA']);
                                $(controls.C_TIPO_DOCUMENTO).val(row['C_TIPO_DOCUMENTO']).trigger('change');
                                $(controls.NUMERO_DOC).val(row['NUMERO_DOC']);
                                $(controls.GASTO).val(row['GASTO']);
                                $(controls.INGRESO).val(row['INGRESO']);
                                $(controls.DESCRIPCION).val(row['DESCRIPCION']);
                            }
                        },
                        onReady: function (result, controls, object) {
                            var cuenta = $(controls.NOMBRE_GASTO).val()
                            var descripcion = $(controls.DESCRIPCION).val()
                            var gasto = ($(controls.GASTO).val() == '' ? 0 : parseFloat($(controls.GASTO).val()))
                            var ingreso = ($(controls.INGRESO).val() == '' ? 0 : parseFloat($(controls.INGRESO).val()))
                            var c_tipo_gasto = $(controls.C_TIPO_GASTO).val();
                            var c_tipo_documento = $(controls.C_TIPO_DOCUMENTO).val();
                            var numero_doc = $(controls.NUMERO_DOC).val();

                            if (row == undefined) {
                                $(tblMovGastos).jqxGrid('addrow', null, {
                                    '_rowNum': $(tblMovGastos).jqxGrid('getrows').length + 1,
                                    'C_MOVIMIENTO': '',
                                    'C_MOVIMIENTO_DETALLE': '',
                                    'CUENTA': '',
                                    'NOMBRE_CUENTA': cuenta,
                                    'DESCRIPCION': descripcion,
                                    'GASTO': gasto,
                                    'INGRESO': ingreso,
                                    'C_TIPO_GASTO': c_tipo_gasto,
                                    'C_TIPO_DOCUMENTO': c_tipo_documento,
                                    'NUMERO_DOC': numero_doc
                                });
                            }
                            else {
                                $(tblMovGastos).jqxGrid('getrows')[index]['NOMBRE_CUENTA'] = cuenta;
                                $(tblMovGastos).jqxGrid('getrows')[index]['DESCRIPCION'] = descripcion;
                                $(tblMovGastos).jqxGrid('getrows')[index]['GASTO'] = gasto;
                                $(tblMovGastos).jqxGrid('getrows')[index]['INGRESO'] = ingreso;
                                $(tblMovGastos).jqxGrid('getrows')[index]['C_TIPO_GASTO'] = c_tipo_gasto;
                                $(tblMovGastos).jqxGrid('getrows')[index]['C_TIPO_DOCUMENTO'] = c_tipo_documento;
                                $(tblMovGastos).jqxGrid('getrows')[index]['NUMERO_DOC'] = numero_doc;
                            }
                            $(tblMovGastos).jqxGrid('refresh');
                            $(dialog).modal('hide');
                        }
                    });

                    $('.bootbox .modal-dialog').draggable({
                        handle: '.modal-header'
                    });
                    $('.bootbox .modal-header').css('cursor', 'move');
                }, 150);
            })
        }
        const fnBorrarGasto = function (index) {
            const rowid = $(tblMovGastos).jqxGrid('getrowid', index)
            $(tblMovGastos).jqxGrid('deleterow', rowid);
        }

        const fnObtenerTipoCambio = function () {
            $.solver.fn.getTipoCambio({
                fecha: $(_controls.FECHA_BANCO).val(),
                onReady: function (result) {
                    $(_controls.TC).val(result[0]['PRECIO_VENTA']);
                }
            })
        }

        const fnRedondear = function () {
            var rowsDocs = [];
            var rowsCaja = [];
            var rowsGasto = [];

            if ($('#tblMovDoc').hasClass('jqx-grid')) {
                rowsDocs = $(tblMovDoc).jqxGrid('getrows')
            }

            if ($('#tblMovCaja').hasClass('jqx-grid')) {
                rowsCaja = $(tblMovCaja).jqxGrid('getrows');
            }

            if ($('#tblMovGastos').hasClass('jqx-grid')) {
                rowsGasto = $(tblMovGastos).jqxGrid('getrows');
            }

            var sumatoria1 = 0;
            var sumatoria2 = 0;

            $.each(rowsDocs, function (i, v) {
                sumatoria1 += v['PAGO'];
                sumatoria2 += v['COBRANZA'];
            });

            $.each(rowsCaja, function (i, v) {
                sumatoria1 += v['COBRANZA'];
                sumatoria2 += v['PAGO'];
            });

            $.each(rowsGasto, function (i, v) {
                sumatoria1 += v['GASTO'];
                sumatoria2 += v['INGRESO'];
            });

            var nroRedondear = numeral(sumatoria1).format('0.00') - numeral(sumatoria2).format('0.00');

            $.GetQuery({
                query: ['q_caja_procesos_nuevomovimiento_obtener_redondeo_defecto'],
                items: [{
                    C_EMPRESA: $.solver.session.SESSION_EMPRESA
                }],
                onReady: function (result) {
                    if (result.length == 0) {
                        alertify.warning('No se ha configurado el tipo de gasto - redondeo, por favor configurarlo o hacerlo manual.')
                        return;
                    }

                    const data = result[0];
                    let c_tipo_gasto = data['C_TIPO_GASTO'];
                    let nombre_gasto = data['NOMBRE_GASTO'];
                    let gasto = nroRedondear < 0 ? nroRedondear * -1 : 0;
                    let ingreso = nroRedondear > 0 ? nroRedondear : 0;

                    $(tblMovGastos).jqxGrid('addrow', null, {
                        '_rowNum': $(tblMovGastos).jqxGrid('getrows').length + 1,
                        'C_MOVIMIENTO': '',
                        'C_MOVIMIENTO_DETALLE': '',
                        'CUENTA': '',
                        'NOMBRE_CUENTA': nombre_gasto,
                        'DESCRIPCION': null,
                        'GASTO': gasto,
                        'INGRESO': ingreso,
                        'C_TIPO_GASTO': c_tipo_gasto,
                        'C_TIPO_DOCUMENTO': null,
                        'NUMERO_DOC': null
                    });
                }
            })
        }

        $.BorrarDocumento = function (index) {
            fnBorrarDocumento(index);
        };
        $.BorrarCaja = function (index) {
            fnBorrarCaja(index)
        }
        $.BorrarGasto = function (index) {
            fnBorrarGasto(index)
        }

        $(frm).ValidForm({
            type: 1,
            table: 'CAJA.MOVIMIENTO',
            querySave: true,
            querySaveText: '¿Seguro de registrar el movimiento?',
            extras: {
                C_MOVIMIENTO: {
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
                            columns: 'C_EMPRESA,ANIO'
                        })
                    }
                },
            },
            onDone: function (_, controls) {
                _controls = controls;

                codTipo = $(controls.COD_TIPO).val();
                editar = $(controls.EDITAR).val();

                if ($(controls.C_MOVIMIENTO).val() != '') {
                    $(controls.FECHA).val(moment($(controls.FECHA).val()).format('DD/MM/YYYY'));
                    $(controls.FECHA_BANCO).val(moment($(controls.FECHA_BANCO).val()).format('DD/MM/YYYY'));
                }

                $(controls.FECHA).datetimepicker({
                    format: 'DD/MM/YYYY',
                    locale: 'es'
                });
                $(controls.FECHA_BANCO).datetimepicker({
                    format: 'DD/MM/YYYY',
                    locale: 'es'
                });
                $(controls.FECHA_BANCO).on('dp.change', function () {
                    fnObtenerTipoCambio();
                })

                if ($(controls.TIPO).val() != '') {
                    $.GetQuery({
                        query: ['q_caja_procesos_nuevomovimiento_obtenerdatostipo'],
                        items: [{
                            C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                            C_TIPO_MOVIMIENTO_CTA_BANCARIA: function () {
                                return $(controls.TIPO).val();
                            }
                        }],
                        onReady: function (result) {
                            datos = result[0]
                            fnCrearTabla();
                        }
                    })
                }

                $(controls.TIPO).change(function () {
                    if ($(controls.TIPO).val() != '') {
                        $.GetQuery({
                            query: ['q_caja_procesos_nuevomovimiento_obtenerdatostipo'],
                            items: [{
                                C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                                C_TIPO_MOVIMIENTO_CTA_BANCARIA: function () {
                                    return $(controls.TIPO).val();
                                }
                            }],
                            onReady: function (result) {
                                datos = result[0];
                                fnCrearTabla();
                            }
                        })
                    }
                })

                $(controls.C_MONEDA).change(function (e) {
                    e.preventDefault();

                    var rowsDocs = [];
                    var rowsCaja = [];
                    var rowsGasto = [];

                    if ($('#tblMovDoc').hasClass('jqx-grid')) {
                        rowsDocs = $(tblMovDoc).jqxGrid('getrows')
                        if (rowsDocs.length > 0) {
                            $(tblMovDoc).jqxGrid('clear')
                        }
                    }
                    if ($('#tblMovCaja').hasClass('jqx-grid')) {
                        rowsCaja = $(tblMovCaja).jqxGrid('getrows');
                        if (rowsCaja.length > 0) {
                            $(tblMovCaja).jqxGrid('clear')
                        }
                    }

                    if ($('#tblMovGastos').hasClass('jqx-grid')) {
                        rowsGasto = $(tblMovGastos).jqxGrid('getrows');
                        if (rowsGasto.length > 0) {
                            $(tblMovGastos).jqxGrid('clear')
                        }
                    }

                    //if ($('#tblMovDoc').hasClass('jqx-grid')) {
                    //    rowsDocs = $(tblMovDoc).jqxGrid('getrows')
                    //    const moneda = $(controls.C_MONEDA).val();

                    //    $.each(rowsDocs, function (i, v) {
                    //        if (v['C_MONEDA'] != moneda) rowsDocs[i]['COBRANZA'] = v['COBRANZA'] * $(controls.TC).val();
                    //        if (v['C_MONEDA'] == moneda) rowsDocs[i]['COBRANZA'] = v['COBRANZA'] / $(controls.TC).val();
                    //    });

                    //    $(tblMovDoc).jqxGrid('refresh')
                    //}

                    //if ($('#tblMovCaja').hasClass('jqx-grid')) {
                    //    rowsCaja = $(tblMovCaja).jqxGrid('getrows');
                    //}

                    //if ($('#tblMovGastos').hasClass('jqx-grid')) {
                    //    rowsGasto = $(tblMovGastos).jqxGrid('getrows');
                    //}

                });

                fnObtenerTipoCambio();

            },
            onSubmit: function (form, controls, objParent) {

                var rowsDocs = [];
                var rowsCaja = [];
                var rowsGasto = [];

                if ($('#tblMovDoc').hasClass('jqx-grid')) {
                    rowsDocs = $(tblMovDoc).jqxGrid('getrows')
                }

                if ($('#tblMovCaja').hasClass('jqx-grid')) {
                    rowsCaja = $(tblMovCaja).jqxGrid('getrows');
                }

                if ($('#tblMovGastos').hasClass('jqx-grid')) {
                    rowsGasto = $(tblMovGastos).jqxGrid('getrows');
                }

                var sumatoria1 = 0;
                var sumatoria2 = 0;

                $.each(rowsDocs, function (i, v) {
                    sumatoria1 += v['PAGO'];
                    sumatoria2 += v['COBRANZA'];
                });

                $.each(rowsCaja, function (i, v) {
                    sumatoria1 += v['COBRANZA'];
                    sumatoria2 += v['PAGO'];
                });

                $.each(rowsGasto, function (i, v) {
                    sumatoria1 += v['GASTO'];
                    sumatoria2 += v['INGRESO'];
                });

                if (numeral(sumatoria1).format('0.00') - numeral(sumatoria2).format('0.00') != 0) {
                    alertify.confirm('Confirm Title', `El movimiento no cuadra por ${numeral(sumatoria1).format('0.00') - numeral(sumatoria2).format('0.00')} <br /> <br />¿Desea que el sistema realize el ajuste?`,
                        function () {
                            fnRedondear();
                        },
                        function () {
                            alertify.warning('Por favor revisar los montos');
                        });
                    return false;
                }
            },
            onDetail: function (form, controls, tokenParent, objParent) {
                var rowsDocumentos = $(tblMovDoc).jqxGrid('getrows');
                var rowsBancos = $(tblMovCaja).jqxGrid('getrows');
                var rowsGastos = $(tblMovGastos).jqxGrid('getrows');

                var extraEliminar = {
                    C_MOVIMIENTO: {
                        action: {
                            name: 'GetParentId',
                            args: $.ConvertObjectToArr({
                                token: tokenParent,
                                column: 'C_MOVIMIENTO'
                            })
                        }
                    },
                };

                $.AddPetition({
                    type: 4,
                    items: $.ConvertObjectToArr({
                        script: 'spw_caja_nuevomovimiento_eliminardetalle',
                        C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                        C_MOVIMIENTO: '',
                    }, extraEliminar),
                    transaction: true
                });

                var extraDetalle = {
                    C_MOVIMIENTO: {
                        action: {
                            name: 'GetParentId',
                            args: $.ConvertObjectToArr({
                                token: tokenParent,
                                column: 'C_MOVIMIENTO'
                            })
                        }
                    },
                    C_MOVIMIENTO_DETALLE: {
                        action: {
                            name: 'GetNextId',
                            args: $.ConvertObjectToArr({
                                columns: 'C_EMPRESA,C_MOVIMIENTO',
                                max_length: '3'
                            })
                        }
                    }
                }

                $.each(rowsDocumentos, function (i, v) {

                    $.AddPetition({
                        table: 'CAJA.MOVIMIENTO_DETALLE',
                        type: 1,
                        items: $.ConvertObjectToArr({
                            C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                            C_MOVIMIENTO: '',
                            C_MOVIMIENTO_DETALLE: '',
                            TIPO: 'D',
                            C_DOCUMENTO: v['C_DOCUMENTO'],
                            SALDO_DOCUMENTO: v['TOTAL'],
                            SUMATORIA_1: v['PAGO'],
                            SUMATORIA_2: v['COBRANZA'],
                            C_LETRA_CUOTA: v['C_LETRA_CUOTA']
                        }, extraDetalle)
                    });

                });

                $.each(rowsBancos, function (i, v) {
                    $.AddPetition({
                        table: 'CAJA.MOVIMIENTO_DETALLE',
                        type: 1,
                        items: $.ConvertObjectToArr({
                            C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                            C_MOVIMIENTO: '',
                            C_MOVIMIENTO_DETALLE: '',
                            TIPO: 'B',
                            C_BANCO: v['C_BANCO'],
                            C_CUENTA_BANCARIA: v['C_CUENTA_BANCARIA'],

                            C_TIPO_DOCUMENTO: v['C_TIPO_DOCUMENTO'],
                            NUMERO: v['NUMERO'],
                            DESCRIPCION: v['DESCRIPCION'],
                            SUMATORIA_1: v['COBRANZA'],
                            SUMATORIA_2: v['PAGO'],
                            PAGUESE_A_ORDEN: v['PAGUESE_A_ORDEN']
                        }, extraDetalle)
                    });
                });

                $.each(rowsGastos, function (i, v) {
                    $.AddPetition({
                        table: 'CAJA.MOVIMIENTO_DETALLE',
                        type: 1,
                        items: $.ConvertObjectToArr({
                            C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                            C_MOVIMIENTO: '',
                            C_MOVIMIENTO_DETALLE: '',
                            TIPO: 'G',

                            CUENTA: v['CUENTA'],
                            NOMBRE_CUENTA: v['NOMBRE_CUENTA'],

                            DESCRIPCION: v['DESCRIPCION'],
                            SUMATORIA_1: v['GASTO'],
                            SUMATORIA_2: v['INGRESO'],

                            C_TIPO_GASTO: v['C_TIPO_GASTO'],
                            C_TIPO_DOCUMENTO: v['C_TIPO_DOCUMENTO'],
                            NUMERO_DOC: v['NUMERO_DOC']
                        }, extraDetalle)
                    });
                });

            },
            onReady: function () {
                if (editar == 'editar') {
                    $(_controls.EDITAR).trigger('change')
                    return;
                }
                if (codTipo == 'I') {
                    document.location = $.solver.baseUrl + `/Procesos/MovimientoIngreso`;
                }
                if (codTipo == 'E') {
                    document.location = $.solver.baseUrl + `/Procesos/MovimientoEgreso`;
                }
            }
        });

    });
});