require(["jqwidgets", "helper", "extras", "jstree", "fileinput.es"], function () {
    require(["alertify", "moment", "bootbox"], function (alertify, moment, bootbox) {
        alertify.set('notifier', 'position', 'top-center');

        const empresa = $.solver.session.SESSION_EMPRESA;

        let tblTipoMovimiento = '#tblTipoMovimiento';
        const tblTipoContacto = '#tblTipoContacto'
        const tblTipoGasto = '#tblTipoGasto'

        let arrEliminadosTipoMovimiento = [];
        let arrEliminadosTipoContacto = [];

        let flagModulo = [];

        const fnCrearCargaArchivo = function () {
            $("#input-b7").fileinput({
                language: 'es',
                maxFileCount: 1,
                showPreview: false,
                mainClass: "input-group-sm",
                //allowedFileExtensions: ['png', 'jpeg', 'jpg'],
                uploadUrl: $.solver.services.api + "/Service/Upload/New",
                uploadAsync: true,
            });

            $("#input-b7").on("filebatchselected", function (event, files) {
                $("#input-b7").fileinput("upload");
            });

            $("#input-b7").on("fileuploaded", function (event, data, previewId, index) {
                $('#C_ARCHIVO_LOGO').val(data.response.token);
                fnObtenerImagen('C_ARCHIVO_LOGO', 'img');
                $("#input-b7").fileinput('clear');
            });
        };
        const fnObtenerAlerta = function (message) {
            alertify.alert()
                .setting({
                    'title': 'Mensaje del Sistema',
                    'message': message,
                }).show();
        };
        const fnObtenerImagen = function (c_archivo, img) {
            if ($('#' + c_archivo).val() != '') {
                $('#' + img).attr('src', '');
                $('#' + img).attr('src', $.solver.services.api + 'Service/ViewFile/' + $('#' + c_archivo).val())
                $('#' + img).css({ 'display': 'block' });
            }
            else {
                $('#' + img).css({ 'display': 'none' });
            }
        }
        const cargarEmpresa = function (data) {
            $('#C_EMPRESA').val(data['C_EMPRESA']);
            $('#C_ARCHIVO_LOGO').val(data['C_ARCHIVO_LOGO']);
            $('#NRO_DOCUMENTO').val(data['NRO_DOCUMENTO']);
            $('#RAZON_SOCIAL').val(data['RAZON_SOCIAL']);
            $('#DIRECCION').val(data['DIRECCION']);
            $('#NOMBRE_FIRMA_BE').val(data['NOMBRE_FIRMA_BE']);
            $('#EMAIL_FIRMANTE_BE').val(data['EMAIL_FIRMANTE_BE']);
            $('#CUENTA_BANCARIA').val(data['CUENTA_BANCARIA']);
            fnObtenerImagen('C_ARCHIVO_LOGO', 'img');
            fnCrearCargaArchivo();
        };
        const obtenerInfoEmpresa = function () {
            $.GetQuery({
                query: ['q_ventas_mantenimiento_configuraciones_obtenerdatosempresa'],
                items: [
                    { C_EMPRESA: empresa }
                ],
                onReady: function (result) {
                    const data = result[0];
                    cargarEmpresa(data);
                    //cargarChecksServicios(data['SERVICIOS']);
                }
            })
        };

        const cargarTablas = function () {
            const fnClassEditer = function (row, datafield, value, rowdata) {
                if (rowdata.MODO == 1 || rowdata.MODO == 2) return 'editedRow';
            };
            $.GetQuery({
                query: ['q_caja_mantenimiento_configuraciones_parametrogeneral'],
                onReady: function (result) {
                    flagModulo = result.filter(x => x['value'].length == 3);
                }
            });
            $(tblTipoMovimiento).CreateGrid({
                query: 'tbl_caja_mant_configuraciones_tipo_movimiento',
                items: { C_EMPRESA: empresa },
                hiddens: ['C_EMPRESA'],
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
                    'C_TIPO_MOVIMIENTO_CTA_BANCARIA': {
                        text: 'Código',
                        cellclassname: fnClassEditer,
                        width: 60,
                        editable: false
                    },
                    'NOMBRE_TIPO_MOVIMIENTO': {
                        text: 'Nombre',
                        cellclassname: fnClassEditer,
                        width: 150
                    },
                    'COD_TIPO': {
                        text: 'Cod. Tipo',
                        columntype: 'dropdownlist',
                        createeditor: function (row, value, editor) {
                            const tipo = [
                                { value: "I", label: "Ingreso" },
                                { value: "E", label: "Egreso" }
                            ];
                            const estadoSource =
                            {
                                datatype: "array",
                                datafields: [
                                    { name: 'label', type: 'string' },
                                    { name: 'value', type: 'string' }
                                ],
                                localdata: tipo
                            };
                            const myadapter = new $.jqx.dataAdapter(estadoSource, { autoBind: true });
                            editor.jqxDropDownList({ source: myadapter, displayMember: 'label', valueMember: 'value' });
                        },
                        cellclassname: fnClassEditer,
                        width: 100,
                        cellsAlign: 'center'
                    },
                    'CTA_CONTABLE': {
                        text: 'Cta. Contable',
                        cellclassname: fnClassEditer,
                        width: 100
                    },
                    'OBSERVACIONES': {
                        text: 'Observaciones',
                        cellclassname: fnClassEditer,
                        width: 140
                    },
                    'REQ_APROB': {
                        text: 'Req. Aprob.',
                        columntype: 'checkbox',
                        width: 80
                    },
                    'FLAG': {
                        text: 'Flag',
                        width: 200,
                        columntype: 'dropdownlist',
                        createeditor: function (row, value, editor) {
                            var estadoSource =
                            {
                                datatype: "array",
                                datafields: [
                                    { name: 'label', type: 'string' },
                                    { name: 'value', type: 'string' }
                                ],
                                localdata: flagModulo
                            };
                            var myadapter = new $.jqx.dataAdapter(estadoSource, { autoBind: true });
                            editor.jqxDropDownList({ source: myadapter, displayMember: 'label', valueMember: 'value' });
                        },
                    },
                    'DOCS': {
                        text: 'Docs',
                        width: 80,
                        columntype: 'checkbox',
                    },
                    'BANCOS': {
                        text: 'Bancos',
                        width: 80,
                        columntype: 'checkbox',
                    },
                    'GASTOS': {
                        text: 'Gastos',
                        width: 80,
                        columntype: 'checkbox',
                    },
                    'NOM_COLUMNA_DOCS_CARGO': {
                        text: 'Doc cargo',
                        width: 100,
                    },
                    'NOM_COLUMNA_DOCS_ABONO': {
                        text: 'Doc abono',
                        width: 100,
                    },
                    'NOM_COLUMNA_BANC_CARGO': {
                        text: 'Banco cargo',
                        width: 100,
                    },
                    'NOM_COLUMNA_BANC_ABONO': {
                        text: 'Banco abono',
                        width: 100,
                    },
                    'NOM_COLUMNA_GASTOS_CARGO': {
                        text: 'Gasto cargo',
                        width: 100,
                    },
                    'NOM_COLUMNA_GASTOS_ABONO': {
                        text: 'Gasto abono',
                        width: 100,
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
                    },
                },
                config: {
                    virtualmode: false,
                    height: 600,
                    pageSize: 999999,
                    columnsresize: true,
                    editable: true,
                    sortable: false,
                    pageable: false
                }
            });
            $(tblTipoMovimiento).on('bindingcomplete', function () {
                $(tblTipoMovimiento).unbind("cellvaluechanged");
                $(tblTipoMovimiento).on("cellvaluechanged", function (event) {
                    if (event.args.newvalue != event.args.oldvalue) {
                        var row = event.args.rowindex;
                        if ($(tblTipoMovimiento).jqxGrid('getrows')[row].MODO != 1) $(tblTipoMovimiento).jqxGrid('getrows')[row].MODO = 2;
                    }
                });

                $(tblTipoMovimiento).unbind("celldoubleclick");
                $(tblTipoMovimiento).on("celldoubleclick", function (event) {
                    // event arguments.
                    var args = event.args;
                    // row's bound index.
                    var rowBoundIndex = args.rowindex;
                    // row's visible index.
                    var rowVisibleIndex = args.visibleindex;
                    // right click.
                    var rightClick = args.rightclick;
                    // original event.
                    var ev = args.originalEvent;
                    // column index.
                    var columnIndex = args.columnindex;
                    // column data field.
                    var dataField = args.datafield;
                    // cell value
                    var value = args.value;

                    if (dataField == 'CTA_CONTABLE') {

                        $.solver.fn.fnAbrirModal({
                            query: 'gbl_mantenimiento_obtenerplanes',
                            hiddens: ['C_EMPRESA', 'CODIGO'],
                            title: 'Busqueda de plan contable',
                            onEscape: true,
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
                            onSelected: function (row) {
                                const codigo = row['CODIGO_PLAN'];
                                $(tblTipoMovimiento).jqxGrid('getrows')[args.row.bounddata.uid].CTA_CONTABLE = codigo;
                                $(tblTipoMovimiento).jqxGrid('refresh');
                            }
                        });
                    }
                });
            });
            $('#btnAgregarMovimiento').click(function () {
                const fila = $(tblTipoMovimiento).jqxGrid('getrows').length;
                var tipoMovimiento = {
                    _rowNum: fila + 1,
                    MODO: 1,
                    C_EMPRESA: empresa,
                    C_TIPO_MOVIMIENTO_CTA_BANCARIA: '',
                    NOMBRE_TIPO_MOVIMIENTO: '',
                    COD_TIPO: '',
                    CTA_CONTABLE: '',
                    OBSERVACIONES: '',
                    FLAG: '',
                    IND_ESTADO: 'Activo',
                    DOCS: 'false',
                    BANCOS: 'false',
                    GASTOS: 'false',
                    NOM_COLUMNA_DOCS_CARGO: '',
                    NOM_COLUMNA_DOCS_ABONO: '',
                    NOM_COLUMNA_BANC_CARGO: '',
                    NOM_COLUMNA_BANC_ABONO: '',
                    NOM_COLUMNA_GASTOS_CARGO: '',
                    NOM_COLUMNA_GASTOS_ABONO: '',
                };
                $(tblTipoMovimiento).jqxGrid('addrow', null, tipoMovimiento);
                $(tblTipoMovimiento).jqxGrid('selectrow', fila);
                $(tblTipoMovimiento).jqxGrid('ensurerowvisible', fila);
            });
            $('#btnEliminarMovimiento').click(function () {
                var rows = $(tblTipoMovimiento).jqxGrid('getrows');
                if (rows.length > 0) {
                    var selected = $(tblTipoMovimiento).jqxGrid('getselectedrowindex')
                    if (selected != -1) {
                        if (rows[selected]['C_TIPO_MOVIMIENTO_CTA_BANCARIA'] != '') {
                            arrEliminadosTipoMovimiento.push(rows[selected]);
                        }
                        var rowId = $(tblTipoMovimiento).jqxGrid('getrowid', selected);
                        $(tblTipoMovimiento).jqxGrid('deleterow', rowId);
                        if (selected - 1 != -1) {
                            $(tblTipoMovimiento).jqxGrid('selectrow', selected - 1);
                            $(tblTipoMovimiento).jqxGrid('ensurerowvisible', selected - 1);
                        }
                        else {
                            if (rows.length > 0) {
                                $(tblTipoMovimiento).jqxGrid('selectrow', selected);
                                $(tblTipoMovimiento).jqxGrid('ensurerowvisible', selected);
                            }
                        }
                    }
                }
            });

            $(tblTipoGasto).CreateGrid({
                query: 'tbl_caja_mantenimiento_configuraciones_tipo_gasto',
                items: {
                    C_EMPRESA: $.solver.session.SESSION_EMPRESA
                },
                hiddens: ['C_EMPRESA', 'C_USUARIO'],
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
                        cellclassname: fnClassEditer,
                        width: 80,
                        editable: false
                    },
                    NOMBRE_GASTO: {
                        text: 'Nombre',
                        cellclassname: fnClassEditer,
                        width: 150
                    },
                    DESCRIPCION: {
                        text: 'Descripción',
                        cellclassname: fnClassEditer,
                        width: 150
                    },
                    CTA_CONTABLE: {
                        text: 'Cta contable',
                        cellclassname: fnClassEditer,
                        width: 150
                    },
                    IND_REDONDEO: {
                        text: 'Redondeo',
                        width: 80,
                        columntype: 'checkbox',
                    },
                    IND_ESTADO: {
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
                    virtualmode: false,
                    height: 600,
                    pageSize: 999999,
                    columnsresize: true,
                    editable: true,
                    sortable: false,
                    pageable: false
                }
            })
            $(tblTipoGasto).on('bindingcomplete', function () {
                $(tblTipoGasto).unbind("cellvaluechanged");
                $(tblTipoGasto).on("cellvaluechanged", function (event) {
                    if (event.args.newvalue != event.args.oldvalue) {
                        var row = event.args.rowindex;
                        if ($(tblTipoGasto).jqxGrid('getrows')[row].MODO != 1) $(tblTipoGasto).jqxGrid('getrows')[row].MODO = 2;
                    }
                });

                $(tblTipoGasto).unbind("celldoubleclick");
                $(tblTipoGasto).on("celldoubleclick", function (event) {
                    var args = event.args;
                    var dataField = args.datafield;
                    if (dataField == 'CTA_CONTABLE') {
                        $.solver.fn.fnAbrirModal({
                            query: 'gbl_mantenimiento_obtenerplanes',
                            hiddens: ['C_EMPRESA', 'CODIGO'],
                            title: 'Busqueda de plan contable',
                            onEscape: true,
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
                            onSelected: function (row) {
                                const codigo = row['CODIGO_PLAN'];
                                $(tblTipoGasto).jqxGrid('getrows')[args.row.bounddata.uid].CTA_CONTABLE = codigo;
                                $(tblTipoGasto).jqxGrid('refresh');
                            }
                        });
                    }
                });
            });
            $('#btnAgregarTipoGasto').click(function () {
                const fila = $(tblTipoGasto).jqxGrid('getrows').length;
                var almacen = {
                    _rowNum: fila + 1,
                    MODO: 1,
                    C_EMPRESA: empresa,
                    C_TIPO_GASTO: '',
                    NOMBRE_GASTO: '',
                    DESCRIPCION: '',
                    CTA_CONTABLE: '',
                    IND_REDONDEO: 'false',
                    IND_ESTADO: 'Activo',
                    C_USUARIO: $.solver.session.SESSION_ID
                };
                $(tblTipoGasto).jqxGrid('addrow', null, almacen);
                $(tblTipoGasto).jqxGrid('selectrow', fila);
                $(tblTipoGasto).jqxGrid('ensurerowvisible', fila);
            });

            $(tblTipoContacto).CreateGrid({
                query: 'tbl_logistica_mantenimiento_configuraciones_listartipocontacto',
                items: { C_EMPRESA: empresa },
                hiddens: ['C_EMPRESA'],
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
                    'C_TIPO_CONTACTO': {
                        text: 'Código',
                        cellclassname: fnClassEditer,
                        width: 80,
                        editable: false
                    },
                    'NOMBRE': {
                        text: 'Nombre',
                        cellclassname: fnClassEditer,
                        width: 150
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
                    virtualmode: false,
                    height: 600,
                    pageSize: 999999,
                    columnsresize: true,
                    editable: true,
                    sortable: false,
                    pageable: false
                }
            });
            $(tblTipoContacto).on('bindingcomplete', function () {
                $(tblTipoContacto).unbind("cellvaluechanged");
                $(tblTipoContacto).on("cellvaluechanged", function (event) {
                    if (event.args.newvalue != event.args.oldvalue) {
                        var row = event.args.rowindex;
                        if ($(tblTipoContacto).jqxGrid('getrows')[row].MODO != 1) $(tblTipoContacto).jqxGrid('getrows')[row].MODO = 2;
                    }
                });
            });
            $('#btnAgregarTipoContacto').click(function () {
                const fila = $(tblTipoContacto).jqxGrid('getrows').length;
                var almacen = {
                    _rowNum: fila + 1,
                    MODO: 1,
                    C_EMPRESA: empresa,
                    C_TIPO_CONTACTO: '',
                    NOMBRE: '',
                    IND_ESTADO: 'Activo'
                };
                $(tblTipoContacto).jqxGrid('addrow', null, almacen);
                $(tblTipoContacto).jqxGrid('selectrow', fila);
                $(tblTipoContacto).jqxGrid('ensurerowvisible', fila);
            });
            $('#btnEliminarTipoContacto').click(function () {
                var rows = $(tblTipoContacto).jqxGrid('getrows');
                if (rows.length > 0) {
                    var selected = $(tblTipoContacto).jqxGrid('getselectedrowindex')
                    if (selected != -1) {
                        if (rows[selected]['C_ALMACEN'] != '') {
                            arrEliminadosTipoContacto.push(rows[selected]);
                        }
                        var rowId = $(tblTipoContacto).jqxGrid('getrowid', selected);
                        $(tblTipoContacto).jqxGrid('deleterow', rowId);
                        if (selected - 1 != -1) {
                            $(tblTipoContacto).jqxGrid('selectrow', selected - 1);
                            $(tblTipoContacto).jqxGrid('ensurerowvisible', selected - 1);
                        }
                        else {
                            if (rows.length > 0) {
                                $(tblTipoContacto).jqxGrid('selectrow', selected);
                                $(tblTipoContacto).jqxGrid('ensurerowvisible', selected);
                            }
                        }
                    }
                }
            });
        };
        const actionGuardar = function () {
            const objEmpresa = {
                C_EMPRESA: empresa,
                C_ARCHIVO_LOGO: $('#C_ARCHIVO_LOGO').val(),
                DIRECCION: $('#DIRECCION').val(),
                NOMBRE_FIRMA_BE: $('#NOMBRE_FIRMA_BE').val(),
                EMAIL_FIRMANTE_BE: $('#EMAIL_FIRMANTE_BE').val(),
                CUENTA_BANCARIA: $('#CUENTA_BANCARIA').val()
            };
            $.AddPetition({
                type: 2,
                table: 'EMPRESA',
                condition: `C_EMPRESA = '${empresa}'`,
                items: $.ConvertObjectToArr(objEmpresa)
            });

            //ELIMINADOS
            if (arrEliminadosTipoMovimiento.length > 0) {
                $.each(arrEliminadosTipoMovimiento, function (i, eliminados) {
                    const objEliTipoMov = {
                        C_EMPRESA: eliminados.C_EMPRESA,
                        C_TIPO_MOVIMIENTO_CTA_BANCARIA: eliminados.C_TIPO_MOVIMIENTO_CTA_BANCARIA,
                        IND_ESTADO: 'E'
                    };
                    $.AddPetition({
                        table: 'CAJA.TIPO_MOVIMIENTO_CTA_BANCARIA',
                        type: 2,
                        condition: `C_EMPRESA = '${eliminados.C_EMPRESA}' AND C_TIPO_MOVIMIENTO_CTA_BANCARIA = '${eliminados['C_TIPO_MOVIMIENTO_CTA_BANCARIA']}'`,
                        items: $.ConvertObjectToArr(objEliTipoMov)
                    });
                });
            }
            //TABLA CAJA.TIPO_MOVIMIENTO_CTA_BANCARIA
            $.each($(tblTipoMovimiento).jqxGrid('getrows'), function (i, dataTipoMovi) {
                var tipo = 1;
                var condicion = '';
                if (dataTipoMovi['C_TIPO_MOVIMIENTO_CTA_BANCARIA'] == '') tipo = 1;
                else tipo = 2;
                if (tipo == 2) condicion = `C_EMPRESA = '${empresa}' AND C_TIPO_MOVIMIENTO_CTA_BANCARIA = '${dataTipoMovi['C_TIPO_MOVIMIENTO_CTA_BANCARIA']}'`;

                const objTipoMovimiento = {
                    C_EMPRESA: dataTipoMovi['C_EMPRESA'],
                    C_TIPO_MOVIMIENTO_CTA_BANCARIA: dataTipoMovi['C_TIPO_MOVIMIENTO_CTA_BANCARIA'],
                    NOMBRE_TIPO_MOVIMIENTO: dataTipoMovi['NOMBRE_TIPO_MOVIMIENTO'],
                    COD_TIPO: (dataTipoMovi['COD_TIPO'] == 'Ingreso' ? 'I' : 'E'),
                    CTA_CONTABLE: dataTipoMovi['CTA_CONTABLE'],
                    OBSERVACIONES: dataTipoMovi['OBSERVACIONES'],
                    REQ_APROB: (dataTipoMovi['REQ_APROB'] == 'true' || dataTipoMovi['REQ_APROB'] == true ? '*' : '&'),
                    FLAG: (dataTipoMovi['FLAG'] != '' ? flagModulo.filter(x => x['label'] == dataTipoMovi['FLAG'])[0].value : ''),
                    IND_ESTADO: (dataTipoMovi['IND_ESTADO'] == 'Activo' ? '*' : '&'),
                    DOCS: (dataTipoMovi['DOCS'] == 'true' || dataTipoMovi['DOCS'] == true ? '*' : '&'),
                    BANCOS: (dataTipoMovi['BANCOS'] == 'true' || dataTipoMovi['BANCOS'] == true ? '*' : '&'),
                    GASTOS: (dataTipoMovi['GASTOS'] == 'true' || dataTipoMovi['GASTOS'] == true ? '*' : '&'),
                    NOM_COLUMNA_DOCS_CARGO: $.trim(dataTipoMovi['NOM_COLUMNA_DOCS_CARGO']),
                    NOM_COLUMNA_DOCS_ABONO: $.trim(dataTipoMovi['NOM_COLUMNA_DOCS_ABONO']),
                    NOM_COLUMNA_BANC_CARGO: $.trim(dataTipoMovi['NOM_COLUMNA_BANC_CARGO']),
                    NOM_COLUMNA_BANC_ABONO: $.trim(dataTipoMovi['NOM_COLUMNA_BANC_ABONO']),
                    NOM_COLUMNA_GASTOS_CARGO: $.trim(dataTipoMovi['NOM_COLUMNA_GASTOS_CARGO']),
                    NOM_COLUMNA_GASTOS_ABONO: $.trim(dataTipoMovi['NOM_COLUMNA_GASTOS_ABONO']),
                };
                const extTipoMovimiento = {
                    C_TIPO_MOVIMIENTO_CTA_BANCARIA: {
                        action: {
                            name: 'GetNextId',
                            args: $.ConvertObjectToArr({
                                columns: 'C_EMPRESA',
                                max_length: '4'
                            })
                        }
                    }
                };
                $.AddPetition({
                    type: tipo,
                    table: 'CAJA.TIPO_MOVIMIENTO_CTA_BANCARIA',
                    condition: condicion,
                    items: $.ConvertObjectToArr(objTipoMovimiento, extTipoMovimiento)
                });
            });

            if (arrEliminadosTipoContacto.length > 0) {
                $.each(arrEliminadosTipoContacto, function (i, eliminados) {
                    const objEliEst = {
                        C_EMPRESA: eliminados.C_EMPRESA,
                        C_TIPO_CONTACTO: eliminados.C_TIPO_CONTACTO,
                        IND_ESTADO: 'E'
                    };
                    $.AddPetition({
                        table: 'LOG.PROVEEDOR_TIPO_CONTACTO',
                        type: 2,
                        condition: `C_EMPRESA = '${eliminados.C_EMPRESA}' AND C_TIPO_CONTACTO = '${eliminados['C_TIPO_CONTACTO']}'`,
                        items: $.ConvertObjectToArr(objEliEst)
                    });
                });
            }
            //TABLA LOG.PROVEEDOR_TIPO_CONTACTO
            $.each($(tblTipoContacto).jqxGrid('getrows'), function (i, dataTipoContacto) {
                var tipo = 1;
                var condicion = '';
                if (dataTipoContacto['C_TIPO_CONTACTO'] == '') tipo = 1;
                else tipo = 2;
                if (tipo == 2) condicion = `C_EMPRESA = '${empresa}' AND C_TIPO_CONTACTO = '${dataTipoContacto['C_TIPO_CONTACTO']}'`

                const objTipoContacto = {
                    C_EMPRESA: dataTipoContacto['C_EMPRESA'],
                    C_TIPO_CONTACTO: dataTipoContacto['C_TIPO_CONTACTO'],
                    NOMBRE: dataTipoContacto['NOMBRE'],
                    IND_ESTADO: (dataTipoContacto['IND_ESTADO'] == 'Activo' ? '*' : '&'),
                };
                const extTipoContacto = {
                    C_TIPO_CONTACTO: {
                        action: {
                            name: 'GetNextId',
                            args: $.ConvertObjectToArr({
                                columns: 'C_EMPRESA',
                                max_length: '3'
                            })
                        }
                    }
                };
                $.AddPetition({
                    type: tipo,
                    table: 'LOG.PROVEEDOR_TIPO_CONTACTO',
                    condition: condicion,
                    items: $.ConvertObjectToArr(objTipoContacto, extTipoContacto)
                });
            });

            $.each($(tblTipoGasto).jqxGrid('getrows'), function (i, dataTipoGasto) {
                var tipo = 1;
                var condicion = '';
                if (dataTipoGasto['C_TIPO_GASTO'] == '') tipo = 1;
                else tipo = 2;
                if (tipo == 2) condicion = `C_EMPRESA = '${$.solver.session.SESSION_EMPRESA}' AND C_TIPO_GASTO = '${dataTipoGasto['C_TIPO_GASTO']}'`;

                const objTipoGasto = {
                    C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                    C_TIPO_GASTO: dataTipoGasto['C_TIPO_GASTO'],
                    NOMBRE_GASTO: dataTipoGasto['NOMBRE_GASTO'],
                    DESCRIPCION: dataTipoGasto['DESCRIPCION'],
                    CTA_CONTABLE: dataTipoGasto['CTA_CONTABLE'],
                    IND_REDONDEO: (dataTipoGasto['IND_REDONDEO'] == true || dataTipoGasto['IND_REDONDEO'] == 'true' ? '*': '&'),
                    IND_ESTADO: (dataTipoGasto['IND_ESTADO'] == 'Activo' ? '*' : '&'),
                    C_USUARIO: dataTipoGasto['C_USUARIO']
                }
                const extTipoGasto = {
                    C_TIPO_GASTO: {
                        action: {
                            name: 'GetNextId',
                            args: $.ConvertObjectToArr({
                                columns: 'C_EMPRESA',
                                max_length: '3'
                            })
                        }
                    }
                };

                $.AddPetition({
                    type: tipo,
                    table: 'CAJA.TIPO_GASTO',
                    condition: condicion,
                    items: $.ConvertObjectToArr(objTipoGasto, extTipoGasto)
                });
            });

            $.SendPetition({
                onReady: function (result) {
                    $.CloseStatusBar();
                    require(['bootbox', 'alertify'], function (bootbox, alertify) {
                        alertify.success('Se guardó la información.');
                        obtenerInfoEmpresa();
                        $(tblTipoMovimiento).jqxGrid('updatebounddata');
                        $(tblTipoContacto).jqxGrid('updatebounddata');
                        $(tblTipoGasto).jqxGrid('updatebounddata');
                        arrEliminadosTipoMovimiento = [];
                        arrEliminadosTipoContacto = [];
                    });
                },
                onBefore: function () {
                    $.DisplayStatusBar({ message: 'Guardando información.' });
                },
                onError: function (_error) {
                    $.CloseStatusBar();
                    $.ShowError({ error: _error });
                }
            })
        };

        $.GetQuery({
            query: ['q_ventas_mantenimiento_clientesregistro_listarubigeo', 'q_ventas_mantenimiento_clientesregistro_obtenertipodocumentosserie'],
            onReady: function (result) {
                const dataUbigeo = result['q_ventas_mantenimiento_clientesregistro_listarubigeo'].result.rows;
                const dataTipoDoc = result['q_ventas_mantenimiento_clientesregistro_obtenertipodocumentosserie'].result.rows;
                departamentos = dataUbigeo.filter(x => x['value'].length == 2);
                provincias = dataUbigeo.filter(x => x['value'].length == 4);
                distritos = dataUbigeo.filter(x => x['value'].length == 6);
                documentos = dataTipoDoc;
                //getData();
                obtenerInfoEmpresa();
                cargarTablas();
            }
        });

        $('#btnGuardar').click(function () {
            const fnValidar = function () {
                var valido = true;

                $.each($(tblTipoMovimiento).jqxGrid('getrows'), function (v, item) {
                    if (item['NOMBRE_TIPO_MOVIMIENTO'] == '') {
                        fnObtenerAlerta('Falta rellenar todos los campos Nombre en la tabla de Tipo de Movimiento');
                        valido = false;
                    }
                    if (item['COD_TIPO'] == '') {
                        fnObtenerAlerta('Falta rellenar todos los campos Nombre en la tabla de Tipo de Movimiento');
                        valido = false;
                    }
                });

                $.each($(tblTipoContacto).jqxGrid('getrows'), function (v, item) {
                    if (item['NOMBRE'] == '') {
                        fnObtenerAlerta('Falta rellenar todos los campos Nombre en la tabla de tipo de contactos');
                        valido = false;
                    }
                });

                return valido;
            }

            if (fnValidar()) {

                alertify.confirm('Confirmar Acción', '¿Seguro de Guardar la información?', actionGuardar, null)
                    .set('labels', { ok: 'Si', cancel: 'No' }).set('defaultFocus', 'ok').set('closable', false);

            }
        })
    });
});