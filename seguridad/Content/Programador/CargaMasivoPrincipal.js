require(["helper", "extras", "datetimepicker", 'bootstrap-select', 'fileinput.es'], function () {
    require(["alertify", "bootbox", "moment"], function (alertify, bootbox, moment) {
        alertify.set('notifier', 'position', 'top-center');

        // VARIABLES
        const tblCargaMasiva = $('#tblCargaMasiva');
        const empresa = $.solver.session.SESSION_EMPRESA;

        // TABLAS
        const fnClassEditer = function (row, datafield, value, rowdata) {
            if (rowdata.MODO == 1 || rowdata.MODO == 2) return 'editedRow';
        };
        const fnCrearTabla = function () {
            $(tblCargaMasiva).CreateGrid({
                query: 'tbl_cuenta_mantenimiento_cargamasiva',
                items: {
                    BUSCAR: function () {
                        return $("#_buscar").val();
                    },
                },
                hiddens: ['C_EMPRESA', 'C_COLABORADOR', 'DESCRIPCION'],
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
                    'C_MASIVO': {
                        text: 'Cod. masivo',
                        cellsAlign: 'center',
                        width: 100,
                    },
                    'NOMBRE_MASIVO': {
                        text: 'Nom. masivo',
                        width: 300,
                    },
                    'DESCRIPCION': {
                        text: 'Descripción',
                        width: 150
                    },
                    'NOMBRE_TABLA': {
                        text: 'Tabla',
                        width: 300
                    },
                    'FEC_REGISTRO': {
                        text: 'Fec. registro',
                        cellsAlign: 'center',
                        width: 100
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
                    sortable: true,
                    editable: false,
                    rendered: function () { }
                }
            });
            $(tblCargaMasiva).on('bindingcomplete', function () {
                $(tblCargaMasiva).jqxGrid('selectrow', 0);
            });
        }
        const GetFormEditer = function (url, condition) {
            var _type = 1;
            var _condition = condition || '';
            var _title = "Nueva carga masiva";
            if (_condition.length != 0) {
                _title = "Editar carga masiva";
                _type = 2;
            };

            $.GetData({
                title: _title,
                uriData: url,
                location: 'float',
                type: 'GET',
                isPage: true,
                onReady: function (object, modal) {
                    $(modal).find('.modal-dialog').css({ 'max-width': '80%' });
                    $(object).find('.number-input').on('input', function () {
                        this.value = this.value.replace(/[^0-9]/g, '');
                    });

                    $(object).find('form[name=frmRegistroCargaMasivaDetalle]').ValidForm({
                        table: 'MASIVO',
                        type: _type,
                        condition: condition,
                        querySave: true,
                        extras: {
                            C_MASIVO: {
                                action: {
                                    name: 'GetNextId',
                                    args: $.ConvertObjectToArr({
                                        max_length: 4
                                    })
                                }
                            }
                        },
                        queryDefault: {
                            query: ['editableCargaMasiva'],
                            type: [8],
                            items: [{
                                table: 'MASIVO',
                                condition: _condition
                            }]
                        },
                        onDetail: function (form, controls, token) {

                            _controls = controls;

                            var inserts = $(tblCargaMasivaDetalle).jqxGrid('getrows').filter(x => x['MODO'] == 1);
                            var update = $(tblCargaMasivaDetalle).jqxGrid('getrows').filter(x => x['MODO'] == 2);

                            $.each(inserts, function (i, detalle) {
                                var type = 1;
                                var condition = '';
                                var objInsetDetalle = {
                                    C_MASIVO: detalle.C_MASIVO,
                                    C_DETALLE: detalle.C_DETALLE,
                                    NOMBRE_COLUMNA: detalle.NOMBRE_COLUMNA,
                                    NOMBRE_CAMPO: detalle.NOMBRE_CAMPO,
                                    PARAMETROS: detalle.PARAMETROS,
                                    NOM_SCRIPT: detalle.NOM_SCRIPT,
                                    TIPO_DATO: detalle.TIPO_DATO,
                                    VALOR_DEFECTO: detalle.VALOR_DEFECTO,
                                    IND_ESTADO: detalle.IND_ESTADO == 'Activo' ? '*' : '&',
                                };
                                var extInsetDetalle = {
                                    C_MASIVO: {
                                        action: {
                                            name: 'GetParentId',
                                            args: $.ConvertObjectToArr({
                                                token: token,
                                                column: 'C_MASIVO'
                                            })
                                        }
                                    },
                                    C_DETALLE: {
                                        action: {
                                            name: 'GetNextId',
                                            args: $.ConvertObjectToArr({
                                                columns: 'C_MASIVO',
                                                max_length: 4
                                            })
                                        }
                                    }
                                };
                                $.AddPetition({
                                    table: 'MASIVO_DETALLE',
                                    type: type,
                                    condition: condition,
                                    items: $.ConvertObjectToArr(objInsetDetalle, extInsetDetalle)
                                });
                            });
                            $.each(update, function (i, detalle) {
                                var type = 2;
                                var condition = `C_MASIVO = '${detalle['C_MASIVO']}' AND C_DETALLE = '${detalle['C_DETALLE']}'`;
                                var objUpdateDetalle = {
                                    C_MASIVO: detalle.C_MASIVO,
                                    C_DETALLE: detalle.C_DETALLE,
                                    NOMBRE_COLUMNA: detalle.NOMBRE_COLUMNA,
                                    NOMBRE_CAMPO: detalle.NOMBRE_CAMPO,
                                    PARAMETROS: detalle.PARAMETROS,
                                    NOM_SCRIPT: detalle.NOM_SCRIPT,
                                    TIPO_DATO: detalle.TIPO_DATO,
                                    VALOR_DEFECTO: detalle.VALOR_DEFECTO,
                                    IND_ESTADO: detalle.IND_ESTADO == 'Activo' ? '*' : '&',
                                };
                                $.AddPetition({
                                    table: 'MASIVO_DETALLE',
                                    type: type,
                                    condition: condition,
                                    items: $.ConvertObjectToArr(objUpdateDetalle)
                                });
                            });

                        },
                        onDone: function (form, controls) {
                            _controls = controls;

                            $(_controls.FEC_REGISTRO).datetimepicker({
                                format: 'DD/MM/YYYY',
                                locale: 'es'
                            });

                            if ($(_controls.FEC_REGISTRO).val() == '' || $(_controls.FEC_REGISTRO).val() == null) {
                                $(_controls.FEC_REGISTRO).val(moment(new Date()).format("DD/MM/YYYY"));
                            }
                            else {
                                var Fec_Reg = moment($(_controls.FEC_REGISTRO).val()).format('DD/MM/YYYY');
                                $(_controls.FEC_REGISTRO).val(Fec_Reg);
                            }

                            $(object).find(tblCargaMasivaDetalle).CreateGrid({
                                query: 'tbl_cuenta_mantenimiento_cargamasiva_detalle',
                                hiddens: ['C_MASIVO', 'C_DETALLE'],
                                items: {
                                    C_MASIVO: function () {
                                        return $(_controls.C_MASIVO).val() || '';
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
                                    'C_MASIVO': {
                                        text: 'Cod. masivo',
                                        cellsAlign: 'center',
                                        editable: false,
                                        width: 100,
                                    },
                                    'C_DETALLE': {
                                        text: 'Cod. detalle',
                                        cellsAlign: 'center',
                                        editable: false,
                                        width: 100,
                                    },
                                    'NOMBRE_COLUMNA': {
                                        text: 'Columna',
                                        cellclassname: fnClassEditer,
                                        width: 125
                                    },
                                    'NOMBRE_CAMPO': {
                                        text: 'Campo',
                                        cellclassname: fnClassEditer,
                                        width: 300
                                    },
                                    'TIPO_DATO': {
                                        text: 'Tipo Dato',
                                        cellsAlign: 'center',
                                        cellclassname: fnClassEditer,
                                        width: 100,
                                        columntype: 'dropdownlist',
                                        createeditor: function (row, value, editor) {
                                            const estados = [
                                                { value: "TEXTO", label: "TEXTO" },
                                                { value: "NUMERO", label: "NUMERO" },
                                                { value: "FECHA", label: "FECHA" },
                                                { value: "EMAIL", label: "EMAIL" },
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
                                    },
                                    'PARAMETROS': {
                                        text: 'Parámetros',
                                        //cellsAlign: 'center',
                                        cellclassname: fnClassEditer,
                                        width: 250
                                    },
                                    'NOM_SCRIPT': {
                                        text: 'Nom. Script',
                                        //cellsAlign: 'center',
                                        cellclassname: fnClassEditer,
                                        width: 250
                                    },
                                    'VALOR_DEFECTO': {
                                        text: 'Valor Defecto',
                                        //cellsAlign: 'center',
                                        cellclassname: fnClassEditer,
                                        width: 100
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
                                    height: 550,
                                    pageSize: 999999,
                                    virtualmode: false,
                                    columnsresize: true,
                                    editable: true,
                                    sortable: true,
                                    pageable: false
                                }
                            });
                            $(object).find(tblCargaMasivaDetalle).on('bindingcomplete', function () {
                                $(tblCargaMasivaDetalle).unbind("cellvaluechanged");
                                $(tblCargaMasivaDetalle).on("cellvaluechanged", function (event) {
                                    if (event.args.newvalue != event.args.oldvalue) {
                                        var row = event.args.rowindex;
                                        if ($(tblCargaMasivaDetalle).jqxGrid('getrows')[row].MODO != 1) $(tblCargaMasivaDetalle).jqxGrid('getrows')[row].MODO = 2;
                                    }
                                });
                                $(tblCargaMasivaDetalle).jqxGrid({ selectedrowindex: 0 });
                            });
                            $(object).find('#btnAgregarDetalle').bind('click', function (e) {
                                fnAgregarDetalle();
                                e.preventDefault();
                            });
                        },
                        onReady: function (result, controls, form) {
                            bootbox.hideAll();
                            $(tblCargaMasiva).jqxGrid('updatebounddata');
                        },
                        onError: function (error) {
                            $.CloseStatusBar();
                            $.ShowError({ error: error });
                        }
                    });
                }
            });
        };
        const fnAgregarDetalle = function () {
            const Detalle = $(tblCargaMasivaDetalle).jqxGrid('getrows').length;
            var objDetalle = {
                _rowNum: Detalle + 1,
                MODO: 1,
                C_MASIVO: '0',
                C_DETALLE: '0',
                NOMBRE_COLUMNA: '',
                NOMBRE_CAMPO: '',
                TIPO_DATO: 'TEXTO',
                PARAMETROS: '',
                NOM_SCRIPT: '',
                VALOR_DEFECTO: '',
                IND_ESTADO: $(_controls.IND_ESTADO).val() == '*' ? 'Activo' : 'Inactivo',
            };
            $(tblCargaMasivaDetalle).jqxGrid('addrow', null, objDetalle);
            $(tblCargaMasivaDetalle).jqxGrid('selectrow', Detalle);
            $(tblCargaMasivaDetalle).jqxGrid('ensurerowvisible', Detalle);
        }

        // GENERALES
        $('a#btnAgregarMasivo').bind('click', function (e) {
            GetFormEditer($.solver.baseUrl + "/Programador/CargaMasivoPrincipalDetalle/");
            e.preventDefault();
        });
        $('a#btnEditarMasivo').bind('click', function (e) {
            var index = $(tblCargaMasiva).jqxGrid('getselectedrowindex');

            var c_masivo = $(tblCargaMasiva).jqxGrid('getRows')[index].C_MASIVO;

            if (c_masivo.length != 0) {
                GetFormEditer($.solver.baseUrl + `/Programador/CargaMasivoPrincipalDetalle/${c_masivo}`, `C_MASIVO = '${c_masivo}'`);
            }
            else {
                alertify.warning('Debes seleccionar un registro para editar.');
            }
            e.preventDefault();
        });

        $('form[name=filtrosRegCargaMasiva]').ValidForm({
            type: -1,
            onReady: function (result, controls, form) {
                $(tblCargaMasiva).jqxGrid('updatebounddata');
            }
        });

        fnCrearTabla();

    });
});