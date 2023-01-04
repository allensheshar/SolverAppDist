require(["helper", "extras", "datetimepicker"], function () {
    require(["alertify", "bootbox"], function (alertify, bootbox) {
        alertify.set('notifier', 'position', 'top-center');

        // VARIABLES
        const tblArea = $('#tblArea');
        const tblCargo = $('#tblCargo');
        const tblComodin = $('#tblComodin');
        const tblTipoNovedades = $('#tblTipoNovedades');

        const fnClassEditer = function (row, datafield, value, rowdata) {
            if (rowdata.MODO == 1 || rowdata.MODO == 2) return 'editedRow';
        };

        let arrEliminadosArea = [];
        let arrEliminadosCargo = [];
        let arrEliminadosNovedad = [];

        let comodin = '';
        let incidencias = '';

        const fnCrearTabla = function () {
            $(tblArea).CreateGrid({
                query: 'tbl_cta_mantenimiento_area',
                hiddens: ['TIPO_PARAMETRO'],
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
                    'C_PARAMETRO_MANT': {
                        text: 'Cod. área',
                        width: 100,
                        editable: false
                    },
                    'DESCRIPCION_PARAMETRO': {
                        text: 'Área',
                        cellclassname: fnClassEditer,
                        width: 300
                    },
                    'CODIGO_PARAMETRO': {
                        text: 'Cód. SUNAT',
                        cellsAlign: 'center',
                        cellclassname: fnClassEditer,
                        width: 100
                    },
                    'FLAG_ESTADO': {
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
                    height: 600,
                    pageSize: 999999,
                    virtualmode: false,
                    columnsresize: true,
                    pageable: false,
                    sortable: false,
                    editable: true,
                    rendered: function () { }
                }
            });
            $(tblArea).on('bindingcomplete', function () {
                $(tblArea).jqxGrid('selectrow', 0);
                $(tblArea).unbind("cellvaluechanged");
                $(tblArea).on("cellvaluechanged", function (event) {
                    if (event.args.newvalue != event.args.oldvalue) {
                        var row = event.args.rowindex;
                        if ($(tblArea).jqxGrid('getrows')[row].MODO != 1) $(tblArea).jqxGrid('getrows')[row].MODO = 2;
                    }
                });
            });
            $('#btnAgregarArea').bind('click', function (e) {
                const fila = $(tblArea).jqxGrid('getrows').length;
                var objArea = {
                    _rowNum: fila + 1,
                    MODO: 1,
                    C_PARAMETRO_MANT: '',
                    TIPO_PARAMETRO: 'Código de Área',
                    DESCRIPCION_PARAMETRO: '',
                    FLAG_ESTADO: 'Activo',
                    CODIGO_PARAMETRO: ''
                };
                $(tblArea).jqxGrid('addrow', null, objArea);
                $(tblArea).jqxGrid('selectrow', fila);
                $(tblArea).jqxGrid('ensurerowvisible', fila);
            });
            $('#btnEliminarArea').bind('click', function (e) {
                var rows = $(tblArea).jqxGrid('getrows');
                if (rows.length > 0) {
                    var selected = $(tblArea).jqxGrid('getselectedrowindex')
                    if (selected != -1) {
                        if (rows[selected]['C_PARAMETRO_MANT'] != '') {
                            arrEliminadosArea.push(rows[selected]);
                        }
                        var rowId = $(tblArea).jqxGrid('getrowid', selected);
                        $(tblArea).jqxGrid('deleterow', rowId);
                        if (selected - 1 != -1) {
                            $(tblArea).jqxGrid('selectrow', selected - 1);
                            $(tblArea).jqxGrid('ensurerowvisible', selected - 1);
                        }
                        else {
                            if (rows.length > 0) {
                                $(tblArea).jqxGrid('selectrow', selected);
                                $(tblArea).jqxGrid('ensurerowvisible', selected);
                            }
                        }
                    }
                }
            });

            $(tblCargo).CreateGrid({
                query: 'tbl_cta_mantenimiento_cargo',
                hiddens: ['TIPO_PARAMETRO'],
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
                    'C_PARAMETRO_MANT': {
                        text: 'Cod. Cargo',
                        width: 100,
                        editable: false
                    },
                    'DESCRIPCION_PARAMETRO': {
                        text: 'Cargo',
                        cellclassname: fnClassEditer,
                        width: 300
                    },
                    'CODIGO_PARAMETRO': {
                        text: 'Cód. SUNAT',
                        cellsAlign: 'center',
                        cellclassname: fnClassEditer,
                        width: 100
                    },
                    'FLAG_ESTADO': {
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
                    height: 600,
                    pageSize: 999999,
                    virtualmode: false,
                    columnsresize: true,
                    pageable: false,
                    sortable: false,
                    editable: true,
                    rendered: function () { }
                }
            });
            $(tblCargo).on('bindingcomplete', function () {
                $(tblCargo).jqxGrid('selectrow', 0);
                $(tblCargo).unbind("cellvaluechanged");
                $(tblCargo).on("cellvaluechanged", function (event) {
                    if (event.args.newvalue != event.args.oldvalue) {
                        var row = event.args.rowindex;
                        if ($(tblCargo).jqxGrid('getrows')[row].MODO != 1) $(tblCargo).jqxGrid('getrows')[row].MODO = 2;
                    }
                });
            });
            $('#btnAgregarCargo').bind('click', function (e) {
                const fila = $(tblCargo).jqxGrid('getrows').length;
                var objCargo = {
                    _rowNum: fila + 1,
                    MODO: 1,
                    C_PARAMETRO_MANT: '',
                    TIPO_PARAMETRO: 'Código de Cargo',
                    DESCRIPCION_PARAMETRO: '',
                    FLAG_ESTADO: 'Activo',
                    CODIGO_PARAMETRO: ''
                };
                $(tblCargo).jqxGrid('addrow', null, objCargo);
                $(tblCargo).jqxGrid('selectrow', fila);
                $(tblCargo).jqxGrid('ensurerowvisible', fila);
            });
            $('#btnEliminarCargo').bind('click', function (e) {
                var rows = $(tblCargo).jqxGrid('getrows');
                if (rows.length > 0) {
                    var selected = $(tblCargo).jqxGrid('getselectedrowindex')
                    if (selected != -1) {
                        if (rows[selected]['C_PARAMETRO_MANT'] != '') {
                            arrEliminadosCargo.push(rows[selected]);
                        }
                        var rowId = $(tblCargo).jqxGrid('getrowid', selected);
                        $(tblCargo).jqxGrid('deleterow', rowId);
                        if (selected - 1 != -1) {
                            $(tblCargo).jqxGrid('selectrow', selected - 1);
                            $(tblCargo).jqxGrid('ensurerowvisible', selected - 1);
                        }
                        else {
                            if (rows.length > 0) {
                                $(tblCargo).jqxGrid('selectrow', selected);
                                $(tblCargo).jqxGrid('ensurerowvisible', selected);
                            }
                        }
                    }
                }
            });

            $.GetQuery({
                query: ['q_cuenta_mantenimiento_obtenercomodin', 'q_cuenta_mantenimiento_obtenertipoincidencia'],
                onReady: function (result) {
                    const dataComodin = result['q_cuenta_mantenimiento_obtenercomodin'].result.rows;
                    const dataIncidencia = result['q_cuenta_mantenimiento_obtenertipoincidencia'].result.rows;
                    comodin = dataComodin.filter(x => x['TIPO_PARAMETRO'] == 'Código Tipo de Comodín');
                    incidencias = dataIncidencia.filter(x => x['TIPO_PARAMETRO'] != 'Código Tipo de Comodín');
                }
            });

            $(tblComodin).CreateGrid({
                query: 'tbl_cuenta_mantenimiento_configurarplanilla_comodin',
                hiddens: ['C_TIPO'/*, 'TIPO_INCIDENCIA'*/],
                items: {
                    BUSCAR: function () {
                        return $('#_buscar').val() || '';
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
                    'C_COMODIN': {
                        text: 'Código',
                        editable: false,
                        cellsAlign: 'center',
                        width: 100
                    },
                    'NOMBRE': {
                        text: 'Nombre',
                        width: 200
                    },
                    'VARIABLE': {
                        text: 'Variable',
                        width: 200
                    },
                    'DESCRIPCION_PARAMETRO': {
                        text: 'Tipo Comodín',
                        width: 90,
                        cellsAlign: 'center',
                        columntype: 'dropdownlist',
                        createeditor: function (row, value, editor) {
                            var estadoSource =
                            {
                                datatype: "array",
                                datafields: [
                                    { name: 'label', type: 'string' },
                                    { name: 'value', type: 'string' }
                                ],
                                localdata: comodin
                            };
                            var myadapter = new $.jqx.dataAdapter(estadoSource, { autoBind: true });
                            editor.jqxDropDownList({ source: myadapter, displayMember: 'label', valueMember: 'value' });
                        },
                        cellendedit: function (row, datafield, columntype, oldvalue, newvalue) {
                            $.each(comodin, function (i, v) {
                                if (v.label == newvalue) {
                                    $(tblComodin).jqxGrid('getrows')[row].C_TIPO = v.value;
                                }
                            });
                        }
                    },
                    'VALOR': {
                        text: 'Valor',
                        width: 200
                    },
                    'ORDEN': {
                        text: 'Orden',
                        cellsAlign:'center',
                        width: 50
                    },
                    //'DESCRIPCION_INCIDENCIA': {
                    //    text: 'Tipo Incidencia',
                    //    width: 200,
                    //    cellsAlign: 'center',
                    //    columntype: 'dropdownlist',
                    //    createeditor: function (row, value, editor) {
                    //        var estadoSource =
                    //        {
                    //            datatype: "array",
                    //            datafields: [
                    //                { name: 'label', type: 'string' },
                    //                { name: 'value', type: 'string' }
                    //            ],
                    //            localdata: incidencias
                    //        };
                    //        var myadapter = new $.jqx.dataAdapter(estadoSource, { autoBind: true });
                    //        editor.jqxDropDownList({ source: myadapter, displayMember: 'label', valueMember: 'value' });
                    //    },
                    //    cellendedit: function (row, datafield, columntype, oldvalue, newvalue) {
                    //        $.each(incidencias, function (i, v) {
                    //            if (v.label == newvalue) {
                    //                $(tblComodin).jqxGrid('getrows')[row].TIPO_INCIDENCIA = v.value;
                    //            }
                    //        });
                    //    }
                    //},
                    'IND_ESTADO': {
                        text: 'Estado',
                        width: '80',
                        columntype: 'dropdownlist',
                        cellsAlign: 'center',
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
                    }
                },
                config: {
                    height: 600,
                    pageSize: 999999,
                    virtualmode: false,
                    columnsresize: true,
                    pageable: false,
                    sortable: true,
                    editable: true,
                    rendered: function () { }
                }
            });
            $(tblComodin).on('bindingcomplete', function () {
                $(tblComodin).jqxGrid('selectrow', 0);
                $(tblComodin).unbind("cellvaluechanged");
                $(tblComodin).on("cellvaluechanged", function (event) {
                    if (event.args.newvalue != event.args.oldvalue) {
                        var row = event.args.rowindex;
                        if ($(tblComodin).jqxGrid('getrows')[row].MODO != 1) $(tblComodin).jqxGrid('getrows')[row].MODO = 2;
                    }
                });
            });
            $('#btnAgregarComodin').bind('click', function (e) {
                const fila = $(tblComodin).jqxGrid('getrows').length;
                var obj = {
                    _rowNum: fila + 1,
                    MODO: 1,
                    C_COMODIN: '',
                    NOMBRE: '',
                    VARIABLE: '',
                    QUERY: '',
                    ORDEN: fila + 1,
                    IND_ESTADO: 'Activo',
                };
                $(tblComodin).jqxGrid('addrow', null, obj);
                $(tblComodin).jqxGrid('selectrow', fila);
                $(tblComodin).jqxGrid('ensurerowvisible', fila);
            });

            $('.number-input').on('input', function () {
                this.value = this.value.replace(/[^0-9]/g, '');
            });
            $(tblTipoNovedades).CreateGrid({
                query: 'tbl_cuenta_mantenimiento_configurarplanilla_listarnovedades',
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
                    'C_TIPO_NOVEDAD': {
                        text: 'Código',
                        editable: false,
                        cellsAlign: 'center',
                        width: 80
                    },
                    'DESCRIPCION': {
                        text: 'Novedad',
                        cellsAlign: 'left',
                        width: 200
                    },
                    'VISTA': {
                        text: 'Vista',
                        cellsAlign: 'left',
                        width: 200
                    },
                    'WIDTH': {
                        text: 'Ancho',
                        cellsAlign: 'center',
                        initeditor: function (row, column, editor) {
                            editor.attr('maxlength', 3);
                            editor.addClass('number-input');
                        },
                        width: 50
                    },
                    'DIF': {
                        text: 'Variable',
                        cellsAlign: 'center',
                        initeditor: function (row, column, editor) {
                            editor.attr('maxlength', 5);
                        },
                        width: 80
                    },
                    'TABLA': {
                        text: 'Tabla',
                        cellsAlign: 'left',
                        width: 300
                    },
                    'IND_ESTADO': {
                        text: 'Estado',
                        width: '80',
                        columntype: 'dropdownlist',
                        cellsAlign: 'center',
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
                    }
                },
                config: {
                    height: 600,
                    pageSize: 999999,
                    virtualmode: false,
                    columnsresize: true,
                    pageable: false,
                    sortable: true,
                    editable: true,
                    rendered: function () { }
                }
            });
            $(tblTipoNovedades).on('bindingcomplete', function () {
                $(tblTipoNovedades).jqxGrid('selectrow', 0);
                $(tblTipoNovedades).unbind("cellvaluechanged");
                $(tblTipoNovedades).on("cellvaluechanged", function (event) {
                    if (event.args.newvalue != event.args.oldvalue) {
                        var row = event.args.rowindex;
                        if ($(tblTipoNovedades).jqxGrid('getrows')[row].MODO != 1) $(tblTipoNovedades).jqxGrid('getrows')[row].MODO = 2;
                    }
                });
            });
            $('#btnAgregarNovedad').bind('click', function (e) {
                const fila = $(tblTipoNovedades).jqxGrid('getrows').length;
                var obj = {
                    _rowNum: fila + 1,
                    MODO: 1,
                    C_TIPO_NOVEDAD: '',
                    DESCRIPCION: '',
                    VISTA: '',
                    WIDTH: '',
                    DIF: '',
                    TABLA: '',
                    IND_ESTADO: 'Activo',
                };
                $(tblTipoNovedades).jqxGrid('addrow', null, obj);
                $(tblTipoNovedades).jqxGrid('selectrow', fila);
                $(tblTipoNovedades).jqxGrid('ensurerowvisible', fila);
            });
            $('#btnEliminarNovedad').bind('click', function (e) {
                var rows = $(tblTipoNovedades).jqxGrid('getrows');
                if (rows.length > 0) {
                    var selected = $(tblTipoNovedades).jqxGrid('getselectedrowindex')
                    if (selected != -1) {
                        if (rows[selected]['C_TIPO_NOVEDAD'] != '') {
                            arrEliminadosNovedad.push(rows[selected]);
                        }
                        var rowId = $(tblTipoNovedades).jqxGrid('getrowid', selected);
                        $(tblTipoNovedades).jqxGrid('deleterow', rowId);
                        if (selected - 1 != -1) {
                            $(tblTipoNovedades).jqxGrid('selectrow', selected - 1);
                            $(tblTipoNovedades).jqxGrid('ensurerowvisible', selected - 1);
                        }
                        else {
                            if (rows.length > 0) {
                                $(tblTipoNovedades).jqxGrid('selectrow', selected);
                                $(tblTipoNovedades).jqxGrid('ensurerowvisible', selected);
                            }
                        }
                    }
                }
            });
        }
        const actionGuardar = function () {
            let filasArea = $(tblArea).jqxGrid('getrows').filter(x => x['MODO'] == 1 || x['MODO'] == 2);
            const extArea = {
                C_PARAMETRO_MANT: {
                    action: {
                        name: 'GetNextId',
                        args: $.ConvertObjectToArr({
                            max_length: '5'
                        })
                    }
                }
            };
            $.each(filasArea, function (i, v) {
                $.AddPetition({
                    type: (v.C_PARAMETRO_MANT == '' ? 1 : 2),
                    table: 'PLA.TABLA_MAESTRA',
                    condition: (v.C_PARAMETRO_MANT == '' ? '' : `C_PARAMETRO_MANT = '${v.C_PARAMETRO_MANT}' AND TIPO_PARAMETRO = 'Código de Área'`),
                    items: $.ConvertObjectToArr({
                        C_PARAMETRO_MANT: v.C_PARAMETRO_MANT,
                        TIPO_PARAMETRO: v.TIPO_PARAMETRO,
                        DESCRIPCION_PARAMETRO: v.DESCRIPCION_PARAMETRO,
                        FLAG_ESTADO: (v.FLAG_ESTADO == 'Activo' ? '*' : '&'),
                        CODIGO_PARAMETRO: v.CODIGO_PARAMETRO
                    }, extArea)
                });
            });
            if (arrEliminadosArea.length > 0) {
                $.each(arrEliminadosArea, function (i, eliminados) {
                    if (eliminados.C_PARAMETRO_MANT != '' || eliminados.C_PARAMETRO_MANT != null) {
                        const objEliArea = {
                            C_PARAMETRO_MANT: eliminados.C_PARAMETRO_MANT,
                            FLAG_ESTADO: 'E'
                        };
                        $.AddPetition({
                            table: 'PLA.TABLA_MAESTRA',
                            type: 2,
                            condition: `C_PARAMETRO_MANT = '${eliminados.C_PARAMETRO_MANT}'`,
                            items: $.ConvertObjectToArr(objEliArea)
                        });
                    }
                });
            }

            let filasCargo = $(tblCargo).jqxGrid('getrows').filter(x => x['MODO'] == 1 || x['MODO'] == 2);
            const extCargo = {
                C_PARAMETRO_MANT: {
                    action: {
                        name: 'GetNextId',
                        args: $.ConvertObjectToArr({
                            max_length: '5'
                        })
                    }
                }
            };
            $.each(filasCargo, function (i, v) {
                $.AddPetition({
                    type: (v.C_PARAMETRO_MANT == '' ? 1 : 2),
                    table: 'PLA.TABLA_MAESTRA',
                    condition: (v.C_PARAMETRO_MANT == '' ? '' : `C_PARAMETRO_MANT = '${v.C_PARAMETRO_MANT}' AND TIPO_PARAMETRO = 'Código de Cargo'`),
                    items: $.ConvertObjectToArr({
                        C_PARAMETRO_MANT: v.C_PARAMETRO_MANT,
                        TIPO_PARAMETRO: v.TIPO_PARAMETRO,
                        DESCRIPCION_PARAMETRO: v.DESCRIPCION_PARAMETRO,
                        FLAG_ESTADO: (v.FLAG_ESTADO == 'Activo' ? '*' : '&'),
                        CODIGO_PARAMETRO: v.CODIGO_PARAMETRO
                    }, extCargo)
                });
            });
            if (arrEliminadosCargo.length > 0) {
                $.each(arrEliminadosCargo, function (i, eliminados) {
                    if (eliminados.C_PARAMETRO_MANT != '' || eliminados.C_PARAMETRO_MANT != null) {
                        const objEliCargo = {
                            C_PARAMETRO_MANT: eliminados.C_PARAMETRO_MANT,
                            FLAG_ESTADO: 'E'
                        };
                        $.AddPetition({
                            table: 'PLA.TABLA_MAESTRA',
                            type: 2,
                            condition: `C_PARAMETRO_MANT = '${eliminados.C_PARAMETRO_MANT}'`,
                            items: $.ConvertObjectToArr(objEliCargo)
                        });
                    }
                });
            }

            let filasComodin = $(tblComodin).jqxGrid('getrows').filter(x => x['MODO'] == 1 || x['MODO'] == 2);
            const extComodin = {
                C_COMODIN: {
                    action: {
                        name: 'GetNextId',
                        args: $.ConvertObjectToArr({
                            max_length: '4'
                        })
                    }
                }
            }
            $.each(filasComodin, function (i, v) {
                $.AddPetition({
                    type: (v.C_COMODIN == '' ? 1 : 2),
                    table: 'PLA.COMODIN',
                    condition: (v.C_COMODIN == '' ? '' : `C_COMODIN = '${v.C_COMODIN}'`),
                    items: $.ConvertObjectToArr({
                        C_COMODIN: v.C_COMODIN,
                        NOMBRE: v.NOMBRE,
                        VARIABLE: v.VARIABLE,
                        C_TIPO: v.C_TIPO,
                        VALOR: v.VALOR,
                        ORDEN: v.ORDEN,
                        IND_ESTADO: (v.IND_ESTADO == 'Activo' ? '*' : '&')
                    }, extComodin)
                });
            });

            let filasNovedad = $(tblTipoNovedades).jqxGrid('getrows').filter(x => x['MODO'] == 1 || x['MODO'] == 2);
            const extNovedad = {
                C_TIPO_NOVEDAD: {
                    action: {
                        name: 'GetNextId',
                        args: $.ConvertObjectToArr({
                            max_length: '3'
                        })
                    }
                }
            };
            $.each(filasNovedad, function (i, v) {
                $.AddPetition({
                    type: (v.C_TIPO_NOVEDAD == '' ? 1 : 2),
                    table: 'PLA.TIPO_NOVEDAD',
                    condition: (v.C_TIPO_NOVEDAD == '' ? '' : `C_TIPO_NOVEDAD = '${v.C_TIPO_NOVEDAD}'`),
                    items: $.ConvertObjectToArr({
                        C_TIPO_NOVEDAD: v.C_TIPO_NOVEDAD,
                        DESCRIPCION: v.DESCRIPCION,
                        VISTA: v.VISTA,
                        WIDTH: v.WIDTH,
                        DIF: v.DIF,
                        TABLA: v.TABLA,
                        IND_ESTADO: (v.IND_ESTADO == 'Activo' ? '*' : '&'),
                    }, extNovedad)
                });
            });
            if (arrEliminadosNovedad.length > 0) {
                $.each(arrEliminadosNovedad, function (i, eliminados) {
                    if (eliminados.C_TIPO_NOVEDAD != '' || eliminados.C_TIPO_NOVEDAD != null) {
                        const objEliNovedad = {
                            C_TIPO_NOVEDAD: eliminados.C_TIPO_NOVEDAD,
                            IND_ESTADO: 'E'
                        };
                        $.AddPetition({
                            table: 'PLA.TIPO_NOVEDAD',
                            type: 2,
                            condition: `C_TIPO_NOVEDAD = '${eliminados.C_TIPO_NOVEDAD}'`,
                            items: $.ConvertObjectToArr(objEliNovedad)
                        });
                    }
                });
            }

            $.SendPetition({
                onReady: function (result) {
                    $.CloseStatusBar();
                    alertify.success('Se guardó la información.');

                    $(tblArea).jqxGrid('updatebounddata');
                    $(tblCargo).jqxGrid('updatebounddata');
                    $(tblComodin).jqxGrid('updatebounddata');
                    $(tblTipoNovedades).jqxGrid('updatebounddata');

                    arrEliminadosArea = [];
                    arrEliminadosCargo = [];
                    arrEliminadosNovedad = [];
                },
                onBefore: function () {
                    $.DisplayStatusBar({ message: 'Guardando información.' });
                },
                onError: function (_error) {
                    $.CloseStatusBar();
                    $.ShowError({ error: _error });
                }
            })
        }

        $('#btnGuardar').click(function () {
            actionGuardar();
        })
        $('#btnComodin').click(function () {
            $(tblComodin).jqxGrid('updatebounddata');
        });

        fnCrearTabla();
    });
});