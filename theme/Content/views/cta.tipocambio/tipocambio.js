require(["helper", "extras", "datetimepicker"], function () {
    require(["alertify", 'bootbox', "moment"], function (alertify, bootbox, moment) {
        alertify.set('notifier', 'position', 'top-center');

        var editable = true;
        if ($.solver.basePath == '/auditoriat') editable = false;

        // VARIABLES
        let c_afp = '';
        const tblTipoCambio = $('#tblTipoCambio');
        const empresa = $.solver.session.SESSION_EMPRESA;

        // TABLAS
        const fnCrearTabla = function () {
            const fnClassEditer = function (row, datafield, value, rowdata) {
                if (rowdata.MODO == 1 || rowdata.MODO == 2) return 'editedRow';
            };
            $(tblTipoCambio).CreateGrid({
                query: 'tbl_contab_mantenimiento_tipocambio_listarcambios',
                items: {
                    FEC_INICIO: function () {
                        return $('#FEC_INICIO').val();
                    },
                    FEC_FIN: function () {
                        return $('#FEC_FIN').val();
                    },
                    MONEDA: function () {
                        return $('#C_MONEDA').val();
                    },
                },
                hiddens: ['C_MONEDA', 'row_num'],
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
                    'C_FECHA': {
                        text: 'Fecha',
                        cellclassname: fnClassEditer,
                        editable: false,
                        width: 100,
                        cellsAlign: 'center'
                    },
                    'CODIGO_PARAMETRO': {
                        text: 'Moneda',
                        cellclassname: fnClassEditer,
                        editable: false,
                        width: 80,
                        cellsAlign: 'center'
                    },
                    'PRECIO_VENTA': {
                        text: 'Precio venta',
                        cellclassname: fnClassEditer,
                        width: 100,
                        cellsFormat: 'd3',
                        columnType: 'numberinput',
                        cellsAlign: 'center'
                    },
                    'PRECIO_COMPRA': {
                        text: 'Precio compra',
                        cellclassname: fnClassEditer,
                        width: 100,
                        cellsFormat: 'd3',
                        columnType: 'numberinput',
                        cellsAlign: 'center'
                    },
                },
                config: {
                    pageSize: 999999,
                    columnsresize: true,
                    rendered: function () { }
                }
            });
            $(tblTipoCambio).on('bindingcomplete', function () {
                $(tblTipoCambio).unbind("cellvaluechanged");
                $(tblTipoCambio).on("cellvaluechanged", function (event) {
                    if (event.args.newvalue != event.args.oldvalue) {
                        var row = event.args.rowindex;
                        if ($(tblTipoCambio).jqxGrid('getrows')[row].MODO != 1) $(tblTipoCambio).jqxGrid('getrows')[row].MODO = 2;
                    }
                });
                $(tblTipoCambio).jqxGrid({ selectedrowindex: 0 });
            });
        }
        const GetFormEditer = function (url, condition) {
            var _type = 1;
            var _condition = condition || '';
            var _title = "Nuevo Tipo de Cambio";
            if (_condition.length != 0) {
                _title = "Editar Tipo de Cambio";
                _type = 2;
            };

            $.GetData({
                title: _title,
                uriData: url,
                location: 'float',
                type: 'GET',
                isPage: true,
                onReady: function (object, modal) {

                    $(modal).find('.modal-dialog').css({ 'max-width': '40%' });
                    $(object).find('.number-input').on('input', function () {
                        this.value = this.value.replace(/[^0-9]/g, '');
                    });
                    $('form[name=frmRegistroTipoCambio]').ValidForm({
                        table: 'PADRON_TC',
                        type: _type,
                        condition: condition,
                        querySave: true,
                        queryDefault: {
                            query: ['editableTipoCambio'],
                            type: [8],
                            items: [{
                                table: 'PADRON_TC',
                                condition: _condition
                            }]
                        },
                        onError: function (error) {
                            $.CloseStatusBar();
                            $.ShowError({ error: error });
                        },
                        onDone: function (form, controls) {
                            _controls = controls;

                            $(_controls.C_EMPRESA).val(empresa);
                            $(_controls.C_FECHA).val(moment(new Date()).format("DD/MM/YYYY"));
                            $(_controls.C_FECHA).datetimepicker({ format: 'DD/MM/YYYY', locale: 'es', maxDate: new Date() });

                            if ($(_controls.PRECIO_VENTA).val() == '') { $(_controls.PRECIO_VENTA).val('0.0000') }
                            else { $(_controls.PRECIO_VENTA).val(parseFloat($(_controls.PRECIO_VENTA).val()).toFixed(4)); }

                            if ($(_controls.PRECIO_COMPRA).val() == '') { $(_controls.PRECIO_COMPRA).val('0.0000') }
                            else { $(_controls.PRECIO_VPRECIO_COMPRAENTA).val(parseFloat($(_controls.PRECIO_COMPRA).val()).toFixed(4)); }

                            $(object).find('#btnGuardarTipoCambio').click(function () {

                                $.GetQuery({
                                    query: ['q_contab_mantenimiento_tipocambio_validarduplicado'],
                                    items: [
                                        {
                                            C_FECHA: function () { return $(_controls.C_FECHA).val(); },
                                            C_MONEDA: function () { return $(controls.C_MONEDA).val(); }
                                        }],
                                    onError: function (error) { },
                                    onReady: function (result) {
                                        if (result[0].Column1 == 0) {
                                            $('form[name=frmRegistroTipoCambio]').submit();
                                        }
                                        else {
                                            alertify.warning('El registro ingresado ya existe.');
                                        }
                                    }
                                });

                            });

                        },
                        onReady: function (result, controls, form) {
                            $(tblTipoCambio).jqxGrid('updatebounddata');
                            bootbox.hideAll();
                        }
                    });

                }
            });
        };
        const fnEliminar = function () {
            if ($(tblTipoCambio).jqxGrid('getrows').length == 0) {
                alertify.warning('Debes seleccionar un registro para editar.');
            }
            else {
                const index = $(tblTipoCambio).jqxGrid('getselectedrowindex');
                const object = $(tblTipoCambio).jqxGrid('getrows')[index];
                const c_fecha = object['C_FECHA'];
                const c_moneda = object['C_MONEDA'];

                $.AddPetition({
                    table: 'PADRON_TC',
                    type: 3,
                    condition: `C_MONEDA = '${c_moneda}' AND C_FECHA = '${c_fecha}'`,
                    items: $.ConvertObjectToArr({
                        C_MONEDA: object['C_MONEDA'],
                        C_FECHA: object['C_FECHA']
                    })
                });

                $.SendPetition({
                    connectToLogin: 'S',
                    onReady: function (result) {
                        $.CloseStatusBar();
                        alertify.success('Se eliminó el Tipo de Cambio.');
                        $(tblTipoCambio).jqxGrid('updatebounddata');
                    },
                    onBefore: function () {
                        $.DisplayStatusBar({ message: 'Inactivando Tipo de Cambio.' });
                    },
                    onError: function (_error) {
                        $.CloseStatusBar();
                        $.ShowError({ error: _error });
                    }
                });
            }
        }

        // GENERALES
        $('a#btnAgregar').bind('click', function (e) {
            GetFormEditer($.solver.baseUrl + "/Mantenimiento/TipoCambioRegistro/", '');
            e.preventDefault();
        });
        $('a#btnEliminar').bind('click', function (e) {
            alertify.confirm('Confirmar Acción', '¿Seguro de Eliminar la información?', fnEliminar, null)
                .set('labels', { ok: 'Si', cancel: 'No' }).set('defaultFocus', 'ok').set('closable', false);
            e.preventDefault();
        });

        $('form[name=filtrosRegTipoCambio]').ValidForm({
            type: -1,
            onDone: function (form, controls) {
                _controls = controls

                var date = new Date(), y = date.getFullYear(), m = date.getMonth();
                var firstDay = new Date(y, m, 1);

                $(_controls.FEC_INICIO).datetimepicker({ format: 'DD/MM/YYYY', locale: 'es', maxDate: new Date() });
                $(_controls.FEC_INICIO).val(moment(firstDay).format("DD/MM/YYYY"));

                $(_controls.FEC_FIN).val(moment(new Date()).format("DD/MM/YYYY")).datetimepicker({ format: 'DD/MM/YYYY', locale: 'es', maxDate: new Date() });

                fnCrearTabla();

            },
            onReady: function (result, controls, form) {
                $(tblTipoCambio).jqxGrid('updatebounddata');
            }
        });

        if (!editable) {
            $('.borrar').remove();
        }

    });
});