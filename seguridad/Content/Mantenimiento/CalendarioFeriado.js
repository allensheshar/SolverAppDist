require(["helper", "extras", 'bootstrap-select', 'fileinput.es'], function () {
    require(["alertify", "moment", "bootbox"], function (alertify, moment, bootbox) {
        alertify.set('notifier', 'position', 'top-center');

        // VARIABLES
        let _controls;
        const tblCalendarioFeriado = $('#tblCalendarioFeriado');

        // TABLAS
        const fnCrearTabla = function () {
            const fnClassEditer = function (row, datafield, value, rowdata) {
                if (rowdata.MODO == 1 || rowdata.MODO == 2) return 'editedRow';
            };
            $(tblCalendarioFeriado).CreateGrid({
                query: 'tbl_planilla_mantenimiento_calendarioferiado',
                items: {
                    AÑO: function () {
                        return $('#_anio').val() || '';
                    },
                    BUSCAR: function () {
                        return $('#_buscar').val() || '';
                    },
                },
                hiddens: ['C_FERIADO'],
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
                    'FEC_FERIADO': {
                        text: 'Fec. feriado',
                        cellclassname: fnClassEditer,
                        cellsAlign: 'center',
                        width: 100,
                    },
                    'NOM_FERIADO': {
                        text: 'Nom. feriado',
                        cellclassname: fnClassEditer,
                        width: 300
                    },
                    'DESCRIP': {
                        text: 'Descrip. feriado',
                        cellclassname: fnClassEditer,
                        width: 300
                    },
                    'IND_ESTADO': {
                        text: 'Estado',
                        columntype: 'dropdownlist',
                        createeditor: function (row, value, editor) {
                            const estados = [
                                { value: "*", label: "Activo" },
                                { value: "&", label: "Inactivo" }
                            ];
                            const estadoSource =
                            {
                                datatype: "array",
                                datafields: [
                                    { name: 'label', type: 'string' },
                                    { name: 'value', type: 'string' }
                                ],
                                localdata: estados
                            };
                            const myadapter = new $.jqx.dataAdapter(estadoSource, { autoBind: true });
                            editor.jqxDropDownList({ source: myadapter, displayMember: 'label', valueMember: 'value' });
                        },
                        cellclassname: fnClassEditer,
                        width: 100,
                        cellsAlign: 'center'
                    }
                },
                config: {
                    height: 650,
                    pageSize: 999999,
                    virtualmode: false,
                    columnsresize: true,
                    pageable: false,
                    sortable: false,
                    editable: false,
                    rendered: function () { }
                }
            });
            $(tblCalendarioFeriado).on('bindingcomplete', function () {
                $(tblCalendarioFeriado).jqxGrid('selectrow', 0);
                $(tblCalendarioFeriado).unbind("cellvaluechanged");
                $(tblCalendarioFeriado).on("cellvaluechanged", function (event) {
                    var args = event.args;
                    var datafield = event.args.datafield;
                    var rowBoundIndex = args.rowindex;
                    var value = args.newvalue;
                    var oldvalue = args.oldvalue;

                    if (datafield == 'FEC_FERIADO') {
                        validarFormatoFecha(value, rowBoundIndex, datafield);
                    }

                });
            });
        }
        const GetFormEditer = function (url, condition, planilla) {
            var _type = 1;
            var _condition = condition || '';
            var _title = "Nuevo feriado";
            if (_condition.length != 0) {
                _title = "Editar feriado";
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
                    $('form[name=frmRegistroCalendarioFeriado]').ValidForm({
                        table: 'CALENDARIO_FERIADOS',
                        type: _type,
                        condition: condition,
                        querySave: true,
                        extras: {
                            C_FERIADO: {
                                action: {
                                    name: 'GetNextId',
                                    args: $.ConvertObjectToArr({
                                        max_length: '6'
                                    })
                                }
                            },
                        },
                        queryDefault: {
                            query: ['editableCalendarioFeriado'],
                            type: [8],
                            items: [{
                                table: 'CALENDARIO_FERIADOS',
                                condition: _condition
                            }]
                        },
                        onDone: function (form, controls) {
                            _controls = controls;

                            if ($(_controls.FEC_FERIADO).val() == '' || $(_controls.FEC_FERIADO).val() == null) {
                                $(_controls.FEC_FERIADO).val(moment(new Date()).format("DD/MM/YYYY"));
                            }
                            else {
                                var Fer_Feriado = moment($(_controls.FEC_FERIADO).val()).format('DD/MM/YYYY');
                                $(_controls.FEC_FERIADO).val(Fer_Feriado);
                            }

                        },
                        onReady: function (result, controls, form) {
                            bootbox.hideAll();
                            $(tblCalendarioFeriado).jqxGrid('updatebounddata');
                            $('#_anio').attr('data-query', 'q_pla_mantenimiento_calendarioferiado_consultaranios');
                            $('#_anio').attr('data-value', 'ANIO');
                            $('#_anio').attr('data-field', 'ANIO');
                            $('#_anio').FieldLoadRemote({
                                onReady: function () {
                                    $('#_anio').trigger('change');
                                }
                            });
                        }
                    });

                }
            });
        };
        const fnEliminar = function () {
            if ($(tblCalendarioFeriado).jqxGrid('getrows').length == 0) {
                alertify.warning('Debes seleccionar un registro para editar.');
            }
            else {
                const index = $(tblCalendarioFeriado).jqxGrid('getselectedrowindex');
                const object = $(tblCalendarioFeriado).jqxGrid('getrows')[index];
                const C_FERIADO = object['C_FERIADO'];

                $.AddPetition({
                    table: 'CALENDARIO_FERIADOS',
                    type: 3,
                    condition: `C_FERIADO = '${C_FERIADO}'`,
                    items: $.ConvertObjectToArr({
                        C_FERIADO: object['C_FERIADO']
                    })
                });
                $.SendPetition({
                    connectToLogin: 'S',
                    onReady: function (result) {
                        $.CloseStatusBar();
                        alertify.success('Se eliminó el Feriado.');
                        $(tblCalendarioFeriado).jqxGrid('updatebounddata');
                    },
                    onBefore: function () {
                        $.DisplayStatusBar({ message: 'Inactivando Feriado.' });
                    },
                    onError: function (_error) {
                        $.CloseStatusBar();
                        $.ShowError({ error: _error });
                    }
                });
            }
        }
        // GENERALES
        $('#btnBuscar').bind('click', function (e) {
            $(tblCalendarioFeriado).jqxGrid('updatebounddata');
            e.preventDefault();
        });
        $('a#btnAgregarFeriado').bind('click', function (e) {
            GetFormEditer($.solver.baseUrl + "/Mantenimiento/CalendarioFeriadoRegistro/");
            e.preventDefault();
        });
        $('a#btnEliminarFeriado').bind('click', function (e) {
            alertify.confirm('Mensaje del sistema', '¿Desea eliminar el feriado?',
            function () {
                fnEliminar();
            },
            function () {
                alertify.error('Operación cancelada');
            })
            .set('labels', { ok: 'Si', cancel: 'No' }).set('defaultFocus', 'ok').set('closable', false);
            e.preventDefault();
        });

        $('form[name=filtrosRegCalendarioFeriado]').ValidForm({
            type: -1,
            onReady: function (result, controls, form) {
                const rows = $(tblCalendarioFeriado).jqxGrid('getrows').filter(x => x['MODO'] != undefined);
                if (rows.length > 0) {
                    alertify.confirm('Mensaje del sistema', 'Existen filas sin guardar cambios, ¿Desea continuar?',
                        function () {
                            $(tblCalendarioFeriado).jqxGrid('updatebounddata');
                            $('#_anio').attr('data-query', 'q_pla_mantenimiento_calendarioferiado_consultaranios');
                            $('#_anio').attr('data-value', 'ANIO');
                            $('#_anio').attr('data-field', 'ANIO');
                            $('#_anio').FieldLoadRemote({
                                onReady: function () {
                                    $('#_anio').trigger('change');
                                }
                            });
                        },
                        function () {
                            alertify.error('Búsqueda cancelada');
                        })
                        .set('labels', { ok: 'Si', cancel: 'No' }).set('defaultFocus', 'ok').set('closable', false);
                }
                else {
                    $(tblCalendarioFeriado).jqxGrid('updatebounddata');
                    $('#_anio').attr('data-query', 'q_pla_mantenimiento_calendarioferiado_consultaranios');
                    $('#_anio').attr('data-value', 'ANIO');
                    $('#_anio').attr('data-field', 'ANIO');
                    $('#_anio').FieldLoadRemote({
                        onReady: function () {
                            $('#_anio').trigger('change');
                        }
                    });
                }
            }
        });

        fnCrearTabla();

    });
});