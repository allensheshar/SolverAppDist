require(["jqwidgets", "helper", "extras"], function () {
    require(["alertify"], function (alertify) {
        alertify.set('notifier', 'position', 'top-center');
        const empresa = $.solver.session.SESSION_EMPRESA;
        const form = 'form[name=frmRegistroProveedor]';
        const usuario = $.solver.session.SESSION_ID;

        let tiposContactos = [];

        let arrContactosEliminados = [];
        const tblContacto = '#tblContacto';
        const tblCuentaBancaria = '#tblCuentaBancaria';

        var estadoButton = false;

        const objValidarTablas = {
            tables: [
                {
                    table: tblContacto,
                    tableText: 'contactos',
                    items: ['APELLIDO', 'NOMBRE', 'CORREO'],
                    itemsText: ['Apellidos', 'Nombres', 'Correo electrónico']
                }
            ]
        }

        const fnCrearTabla = function () {
            var emailValido = function (value) {
                let esValido = true;
                const regex = /[\w-\.]{2,}@([\w-]{2,}\.)*([\w-]{2,}\.)[\w-]{2,4}/;
                if (value === '' || value === null) {
                    esValido = true;
                } else {
                    if (regex.test(value.trim())) {
                        esValido = true;
                    } else {
                        esValido = false;
                    }
                }
                return esValido;
            }
            var validateFunc = function (cell, value) {
                switch (cell.datafield) {
                    case "CORREO":
                        if (!emailValido(value)) {
                            return { message: "Por favor ingrese un email valido.", result: false };
                        }
                        return true;
                }
                return true;
            }
            $(tblContacto).CreateGrid({
                query: 'q_logistica_mantenimiento_proveedoresregistro_listarcontactos',
                items: {
                    C_PROVEEDOR: function () { return $('form[name=frmRegistroProveedor] #C_PROVEEDOR').val() || ''; },
                    C_EMPRESA: empresa
                },
                hiddens: ['C_PROVEEDOR_CONTACTO', 'C_PROVEEDOR', 'C_EMPRESA'],
                columns: {
                    'TIPO': {
                        text: 'Tipo contacto',
                        columntype: 'dropdownlist',
                        createeditor: function (row, value, editor) {
                            const tipoContactoSource = {
                                datatype: "array",
                                datafields: [
                                    { name: 'label', type: 'string' },
                                    { name: 'value', type: 'string' }
                                ],
                                localdata: tiposContactos
                            };
                            const myadapter = new $.jqx.dataAdapter(tipoContactoSource, { autoBind: true });
                            editor.jqxDropDownList({ source: myadapter, displayMember: 'label', valueMember: 'value' });
                        }
                    },
                    'APELLIDO': { text: 'Apellidos' },
                    'NOMBRE': { text: 'Nombres' },
                    'PUESTO': { text: 'Puesto' },
                    'TELEFONO': { text: 'Teléfono' },
                    'CORREO': {
                        text: 'Correo electrónico', width: 250,
                        validation: validateFunc
                    },
                    'ESTADO': {
                        text: 'Estado',
                        columntype: 'dropdownlist',
                        createeditor: function (row, value, editor) {
                            const estados = [
                                { value: "*", label: "Activo" },
                                { value: "&", label: "Inactivo" }
                            ];
                            const estadoSource = {
                                datatype: "array",
                                datafields: [
                                    { name: 'label', type: 'string' },
                                    { name: 'value', type: 'string' }
                                ],
                                localdata: estados
                            };
                            const myadapter = new $.jqx.dataAdapter(estadoSource, { autoBind: true });
                            editor.jqxDropDownList({ source: myadapter, displayMember: 'label', valueMember: 'value' });
                        }
                    }
                },
                config: {
                    virtualmode: false,
                    height: 550,
                    columnsresize: true,
                    editable: true,
                    sortable: false,
                    pageable: false,
                    rendered: function () {
                        $(tblContacto).jqxGrid('selectrow', 0);

                        $('button.btn-add-contact').unbind('click');
                        $('button.btn-add-contact').bind('click', function () {
                            var nuevo = {
                                MODO: 1,
                                C_EMPRESA: empresa,
                                C_PROVEEDOR_CONTACTO: '',
                                C_PROVEEDOR: '',
                                TIPO: '',
                                APELLIDO: '',
                                NOMBRE: '',
                                PUESTO: '',
                                TELEFONO: '',
                                CORREO: '',
                                ESTADO: 'Activo'
                            };

                            const fila = $(tblContacto).jqxGrid('getrows').length;
                            $(tblContacto).jqxGrid('addrow', null, nuevo);
                            $(tblContacto).jqxGrid('selectrow', fila);
                            $(tblContacto).jqxGrid('ensurerowvisible', fila);
                        });

                        $('button.btn-delete-contact').unbind('click');
                        $('button.btn-delete-contact').bind('click', function () {
                            var rows = $(tblContacto).jqxGrid('getrows')
                            var index = $(tblContacto).jqxGrid('getSelectedRowIndex')

                            if (index >= 0 && rows.length > 0) {
                                if (rows[index]['C_CLIENTE_CONTACTO'] != '') {
                                    arrContactosEliminados.push(rows[index]);
                                }
                                var rowId = $(tblContacto).jqxGrid('getrowid', index);
                                $(tblContacto).jqxGrid('deleterow', rowId);
                            }
                        });
                    }
                }
            });
            $(tblContacto).on('bindingcomplete', function () {
                $(tblContacto).unbind("cellendedit");
                $(tblContacto).on("cellendedit", function (event) {
                    if (event.args.newvalue != event.args.oldvalue) {
                        var row = event.args.rowindex;
                        if ($(tblContacto).jqxGrid('getrows')[row].MODO != 1) {
                            $(tblContacto).jqxGrid('getrows')[row].MODO = 2;
                        }
                    }
                });
            });

            $.GetQuery({
                query: ['q_planilla_mantenimiento_proveedor_bancos'],
                onReady: function (result) {
                    bancos = result.filter(x => x['value'].length == 6);
                }
            });
            $.GetQuery({
                query: ['q_caja_mantenimiento_proveedor_listar_parametrogeneral'],
                onReady: function (result) {
                    moneda = result.filter(x => x['TIPO_PARAMETRO'] == 'Moneda');
                    cuenta = result.filter(x => x['TIPO_PARAMETRO'] == 'Tipo de Cuenta');
                }
            });

            $(tblCuentaBancaria).CreateGrid({
                query: 'tbl_caja_mantenimiento_proveedores_cuentas_bancarias',
                items: {
                    C_PROVEEDOR: function () { return $('form[name=frmRegistroProveedor] #C_PROVEEDOR').val() || ''; },
                    C_EMPRESA: empresa
                },
                hiddens: ['C_PROVEEDOR_CUENTA_BANCARIA', 'C_PROVEEDOR', 'C_EMPRESA', 'C_PARAMETRO_GENERAL_TIPO_CUENTA', 'C_PARAMETRO_GENERAL_MONEDA', 'C_USUARIO', 'C_BANCO'],
                columns: {
                    'RAZON_SOCIAL': {
                        text: 'Banco',
                        width: 300,
                        columntype: 'dropdownlist',
                        createeditor: function (row, value, editor) {
                            var estadoSource =
                            {
                                datatype: "array",
                                datafields: [
                                    { name: 'label', type: 'string' },
                                    { name: 'value', type: 'string' }
                                ],
                                localdata: bancos
                            };
                            var myadapter = new $.jqx.dataAdapter(estadoSource, { autoBind: true });
                            editor.jqxDropDownList({ source: myadapter, displayMember: 'label', valueMember: 'value' });
                        },
                        cellendedit: function (row, datafield, columntype, oldvalue, newvalue) {
                            $.each(bancos, function (i, v) {
                                if (v.label == newvalue) {
                                    $(tblCuentaBancaria).jqxGrid('getrows')[row].C_BANCO = v.value;
                                }
                            });
                        }
                    },
                    'NUMERO_CUENTA': {
                        text: 'Nro. Cuenta',
                        width: 100
                    },
                    'CCI_CUENTA': {
                        text: 'Nro. C.C.I.',
                        width: 150
                    },
                    'NOM_MONEDA': {
                        text: 'Moneda',
                        width: 80,
                        columntype: 'dropdownlist',
                        createeditor: function (row, value, editor) {
                            var estadoSource =
                            {
                                datatype: "array",
                                datafields: [
                                    { name: 'label', type: 'string' },
                                    { name: 'value', type: 'string' }
                                ],
                                localdata: moneda
                            };
                            var myadapter = new $.jqx.dataAdapter(estadoSource, { autoBind: true });
                            editor.jqxDropDownList({ source: myadapter, displayMember: 'label', valueMember: 'value' });
                        },
                        cellendedit: function (row, datafield, columntype, oldvalue, newvalue) {
                            $.each(moneda, function (i, v) {
                                if (v.label == newvalue) {
                                    $(tblCuentaBancaria).jqxGrid('getrows')[row].C_PARAMETRO_GENERAL_MONEDA = v.value;
                                }
                            });
                        }
                    },
                    'NOM_CUENTA': {
                        text: 'Tipo Cuenta',
                        columntype: 'dropdownlist',
                        createeditor: function (row, value, editor) {
                            var estadoSource =
                            {
                                datatype: "array",
                                datafields: [
                                    { name: 'label', type: 'string' },
                                    { name: 'value', type: 'string' }
                                ],
                                localdata: cuenta
                            };
                            var myadapter = new $.jqx.dataAdapter(estadoSource, { autoBind: true });
                            editor.jqxDropDownList({ source: myadapter, displayMember: 'label', valueMember: 'value' });
                        },
                        cellendedit: function (row, datafield, columntype, oldvalue, newvalue) {
                            $.each(cuenta, function (i, v) {
                                if (v.label == newvalue) {
                                    $(tblCuentaBancaria).jqxGrid('getrows')[row].C_PARAMETRO_GENERAL_TIPO_CUENTA = v.value;
                                }
                            });
                        }
                    },
                    'FEC_REGISTRO': {
                        text: 'Fec. Registro',
                        editable: false,
                        cellsAlign: 'center',
                        width: 100
                    },
                    'C_USUARIO': {
                        text: 'Usuario',
                        editable: false,
                        width: 100
                    },
                    'IND_ESTADO': {
                        text: 'Estado',
                        width: 80,
                        cellsAlign: 'center',
                        columntype: 'dropdownlist',
                        createeditor: function (row, value, editor) {
                            const estados = [
                                { value: "*", label: "Activo" },
                                { value: "&", label: "Inactivo" }
                            ];
                            const estadoSource = {
                                datatype: "array",
                                datafields: [
                                    { name: 'label', type: 'string' },
                                    { name: 'value', type: 'string' }
                                ],
                                localdata: estados
                            };
                            const myadapter = new $.jqx.dataAdapter(estadoSource, { autoBind: true });
                            editor.jqxDropDownList({ source: myadapter, displayMember: 'label', valueMember: 'value' });
                        }
                    }
                },
                config: {
                    virtualmode: false,
                    height: 550,
                    columnsresize: true,
                    editable: true,
                    sortable: false,
                    pageable: false,
                    rendered: function () {
                        $(tblCuentaBancaria).jqxGrid('selectrow', 0);

                        $('button.btn-add-cuenta-bancaria').unbind('click');
                        $('button.btn-add-cuenta-bancaria').bind('click', function () {

                            var today = new Date();
                            var dd = today.getDate();
                            var mm = today.getMonth() + 1;
                            var yyyy = today.getFullYear();

                            if (dd < 10) {
                                dd = '0' + dd;
                            }
                            if (mm < 10) {
                                mm = '0' + mm;
                            }

                            today = dd + '/' + mm + '/' + yyyy;

                            var nuevo = {
                                MODO: 1,
                                C_EMPRESA: empresa,
                                C_PROVEEDOR: '',
                                C_PROVEEDOR_CUENTA_BANCARIA: '',
                                NUMERO_CUENTA: '',
                                CCI_CUENTA: '',
                                C_PARAMETRO_GENERAL_TIPO_CUENTA: '',
                                C_PARAMETRO_GENERAL_MONEDA: '',
                                FEC_REGISTRO: today,
                                C_USUARIO: usuario,
                                IND_ESTADO: 'Activo'
                            };

                            const fila = $(tblCuentaBancaria).jqxGrid('getrows').length;
                            $(tblCuentaBancaria).jqxGrid('addrow', null, nuevo);
                            $(tblCuentaBancaria).jqxGrid('selectrow', fila);
                            $(tblCuentaBancaria).jqxGrid('ensurerowvisible', fila);
                        });

                    }
                }
            });
            $(tblCuentaBancaria).on('bindingcomplete', function () {
                $(tblCuentaBancaria).unbind("cellendedit");
                $(tblCuentaBancaria).on("cellendedit", function (event) {
                    if (event.args.newvalue != event.args.oldvalue) {
                        var row = event.args.rowindex;
                        if ($(tblCuentaBancaria).jqxGrid('getrows')[row].MODO != 1) {
                            $(tblCuentaBancaria).jqxGrid('getrows')[row].MODO = 2;
                        }
                    }
                });
                $(tblCuentaBancaria).unbind("cellvaluechanged");
                $(tblCuentaBancaria).on("cellvaluechanged", function (event) {
                    // event arguments.
                    var args = event.args;
                    // column data field.
                    var datafield = event.args.datafield;
                    // row's bound index.
                    var rowBoundIndex = args.rowindex;
                    // new cell value.
                    var value = args.newvalue;
                    // old cell value.
                    var oldvalue = args.oldvalue;

                    if (datafield == 'FEC_REGISTRO') {
                        if (value == '') { }
                        else {
                            validarFormatoFecha(value, rowBoundIndex, datafield);
                        }
                    }
                });
            });
        }

        $(form).ValidForm({
            table: 'LOG.PROVEEDORES',
            type: 1,
            querySave: true,
            extras: {
                C_PROVEEDOR: {
                    action: {
                        name: 'GetNextId',
                        args: $.ConvertObjectToArr({
                            columns: 'C_EMPRESA',
                            max_length: '6'
                        })
                    }
                }
            },
            rules: {
                CORREO_FACTURACION: {
                    validarCorreo: $('#CORREO_FACTURACION').val()
                }
            },
            onDetail: function (form, controls, token) {
                var c_proveedor = $(controls.C_PROVEEDOR).val();
                if ($(tblContacto).jqxGrid('getrows').length > 0) {
                    var tableContacto = 'LOG.PROVEEDOR_CONTACTO';
                    var rows = $(tblContacto).jqxGrid('getrows');

                    // Extra
                    const extraClienteContacto = {
                        C_PROVEEDOR: {
                            action: {
                                name: 'GetParentId',
                                args: $.ConvertObjectToArr({
                                    token: token,
                                    column: 'C_PROVEEDOR'
                                })
                            }
                        },
                        C_PROVEEDOR_CONTACTO: {
                            action: {
                                name: 'GetNextId',
                                args: $.ConvertObjectToArr({
                                    columns: 'C_EMPRESA,C_PROVEEDOR',
                                    max_length: '3'
                                })
                            }
                        }
                    };

                    // Insertar
                    $.each(rows, function (i, v) {
                        $.AddPetition({
                            table: tableContacto,
                            type: (v.C_PROVEEDOR_CONTACTO == '' ? 1 : 2),
                            condition: ((v.C_PROVEEDOR_CONTACTO == '') ? '' : `C_PROVEEDOR_CONTACTO = '${v.C_PROVEEDOR_CONTACTO}' AND C_PROVEEDOR = '${v.C_PROVEEDOR}' AND C_EMPRESA = '${empresa}'`),
                            items: $.ConvertObjectToArr({
                                C_EMPRESA: v.C_EMPRESA,
                                C_PROVEEDOR: c_proveedor,
                                C_PROVEEDOR_CONTACTO: v.C_PROVEEDOR_CONTACTO,
                                C_TIPO_CONTACTO: (v.TIPO != '' && v.TIPO != null ? tiposContactos.filter(x => x['label'] == v.TIPO)[0]['value'] : null),
                                NOMBRE: v.NOMBRE,
                                APELLIDO: v.APELLIDO,
                                PUESTO: v.PUESTO,
                                TELEFONO: v.TELEFONO,
                                CORREO: v.CORREO,
                                IND_ESTADO: (v.ESTADO == 'Activo' ? '*' : '&')
                            }, extraClienteContacto)
                        });
                    });
                }

                if ($(tblCuentaBancaria).jqxGrid('getrows').length > 0) {
                    var tableCuentaBancaria = 'LOG.PROVEEDOR_CUENTA_BANCARIA';
                    var rows = $(tblCuentaBancaria).jqxGrid('getrows');

                    // Extra
                    const extraCuentaProveedor = {
                        C_PROVEEDOR: {
                            action: {
                                name: 'GetParentId',
                                args: $.ConvertObjectToArr({
                                    token: token,
                                    column: 'C_PROVEEDOR'
                                })
                            }
                        },
                        C_PROVEEDOR_CUENTA_BANCARIA: {
                            action: {
                                name: 'GetNextId',
                                args: $.ConvertObjectToArr({
                                    columns: 'C_EMPRESA,C_PROVEEDOR',
                                    max_length: '3'
                                })
                            }
                        }
                    };

                    // Insertar
                    $.each(rows, function (i, v) {
                        $.AddPetition({
                            table: tableCuentaBancaria,
                            type: (v.C_PROVEEDOR_CUENTA_BANCARIA == '' ? 1 : 2),
                            condition: ((v.C_PROVEEDOR_CUENTA_BANCARIA == '') ? '' : `C_PROVEEDOR_CUENTA_BANCARIA = '${v.C_PROVEEDOR_CUENTA_BANCARIA}' AND C_PROVEEDOR = '${v.C_PROVEEDOR}' AND C_EMPRESA = '${empresa}'`),
                            items: $.ConvertObjectToArr({
                                C_EMPRESA: v.C_EMPRESA,
                                C_PROVEEDOR: c_proveedor,
                                C_PROVEEDOR_CUENTA_BANCARIA: v.C_PROVEEDOR_CUENTA_BANCARIA,
                                C_BANCO: v.C_BANCO,
                                NUMERO_CUENTA: v.NUMERO_CUENTA,
                                CCI_CUENTA: v.CCI_CUENTA,
                                C_PARAMETRO_GENERAL_TIPO_CUENTA: v.C_PARAMETRO_GENERAL_TIPO_CUENTA,
                                C_PARAMETRO_GENERAL_MONEDA: v.C_PARAMETRO_GENERAL_MONEDA,
                                FEC_REGISTRO: v.FEC_REGISTRO,
                                C_USUARIO: v.C_USUARIO,
                                IND_ESTADO: (v.IND_ESTADO == 'Activo' ? '*' : '&')
                            }, extraCuentaProveedor)
                        });
                    });
                }
            },
            onDone: function (_form, controls) {
                $(controls.C_EMPRESA).val(empresa);

                $(controls.C_PARAMETRO_GENERAL_TIPO_DOCUMENTO).change(function () {
                    const tipo_doc = $(controls.C_PARAMETRO_GENERAL_TIPO_DOCUMENTO).val();
                    if (tipo_doc == '') $(controls.RUC_CLIENTE).removeAttr('maxlength');
                    else if (tipo_doc == '00013') $(controls.RUC_CLIENTE).attr('maxlength', '8');
                    else if (tipo_doc == '00017') $(controls.RUC_CLIENTE).attr('maxlength', '11');
                    else $(controls.RUC_CLIENTE).removeAttr('maxlength')

                    if (tipo_doc == '00018' || tipo_doc == '00021' || tipo_doc == '00016') {
                        $(controls.C_PARAMETRO_GENERAL_PROCEDENCIA).val('07231');
                    }
                    else {
                        $(controls.C_PARAMETRO_GENERAL_PROCEDENCIA).val('07230');
                    }
                    if (tipo_doc == '00017') {
                        $(form + ' #bloque_nombre_comercial').css({ 'display': 'block' });
                        $(form + ' #bloque_datos_representante').css({ 'display': 'block' });
                    }
                    else {
                        $(form + ' #bloque_nombre_comercial').css({ 'display': 'none' });
                        $(form + ' #bloque_datos_representante').css({ 'display': 'none' });
                        $(controls.APE_PAT_REPRESENTANTE).val('');
                        $(controls.APE_MAT_REPRESENTANTE).val('');
                        $(controls.NOMBRES_REPRESENTANTE).val('');
                        $(controls.C_PARAMETRO_GENERAL_TIPO_DOCUMENTO_REPRESENTANTE).val('');
                        $(controls.NRO_DOCUMENTO_REPRESENTANTE).val('');
                        $(controls.EMAIL_REPRESENTANTE).val('');
                    }
                });
                $(controls.C_PARAMETRO_GENERAL_TIPO_DOCUMENTO).trigger('change');
                $(controls.RUC_CLIENTE).keyup(function () {
                    var tipo = $(controls.C_PARAMETRO_GENERAL_TIPO_DOCUMENTO).val();
                    switch (tipo) {
                        case '00017':
                            if ($(controls.RUC_CLIENTE).val().length == 11) {
                                $.GetQuery({
                                    query: ['q_ventas_mantenimiento_clientes_obtenerpadron_ruc'],
                                    items: [{ RUC: function () { return $(controls.RUC_CLIENTE).val(); } }],
                                    onError: function (error) { $.ShowError({ error: error }); },
                                    onBefore: function () {
                                        $.CloseStatusBar();
                                        $.DisplayStatusBar({ message: 'Buscando ruc ...' })
                                    },
                                    onReady: function (result) {
                                        $.CloseStatusBar();
                                        if (result.length > 0) {
                                            alertify.success('RUC encontrado.')
                                            $(controls.RAZON_SOCIAL).val(result[0].RAZON_SOCIAL);
                                            $(controls.DIRECCION_FISCAL).val(result[0].DIRECCION);
                                            if (result[0].DEPARTAMENTO != null) $(controls.DEPARTAMENTO).val(result[0].DEPARTAMENTO);
                                            if (result[0].PROVINCIA != null) $(controls.PROVINCIA).val(result[0].PROVINCIA);
                                            if (result[0].DISTRITO != null) $(controls.DISTRITO).val(result[0].DISTRITO);

                                            if (result[0].DEPARTAMENTO != null) {
                                                $(controls.DEPARTAMENTO_REF).val(result[0].DEPARTAMENTO).trigger('change')
                                            }
                                            else {
                                                $(controls.DEPARTAMENTO_REF).val('').trigger('change')
                                            }
                                        }
                                        else {
                                            alertify.success('RUC no encontrado.')
                                            $(controls.RAZON_SOCIAL).val('')
                                            $(controls.DIRECCION_FISCAL).val('')
                                            $(controls.DEPARTAMENTO_REF).val('')
                                            $(controls.PROVINCIA_REF).val('')
                                            $(controls.DISTRITO_REF).val('')
                                        }
                                    }
                                });
                            }
                            break;
                        default:
                            break;
                    }
                });

                if ($('#CREAR').val() != "") $('#btnSalir').css('display', 'none');
                $('.number-input').on('input', function () {
                    this.value = this.value.replace(/[^0-9]/g, '');
                });

                $.GetQuery({
                    query: ['q_logistica_mantenimiento_proveedoresregistro_listartipocontacto'],
                    items: [{ C_EMPRESA: empresa }],
                    onReady: function (result) {
                        $.each(result, function (i, v) {
                            tiposContactos.push({
                                value: v.C_TIPO_CONTACTO,
                                label: v.NOMBRE
                            });
                        });
                        fnCrearTabla();
                    }

                })

                $(controls.DEPARTAMENTO_REF).change(function () {
                    $(controls.DEPARTAMENTO).val($(controls.DEPARTAMENTO_REF).val())

                    $(controls.PROVINCIA_REF).attr('data-query', 'gbl_obtener_provincia');
                    $(controls.PROVINCIA_REF).attr('data-value', 'DESCRIPCION');
                    $(controls.PROVINCIA_REF).attr('data-field', 'DESCRIPCION');
                    $(controls.PROVINCIA_REF).attr('data-DEPARTAMENTO', $(controls.DEPARTAMENTO_REF).val());
                    $(controls.PROVINCIA_REF).attr('data-tipoparametro', 'Provincia');
                    $(controls.PROVINCIA_REF).FieldLoadRemote({
                        onReady: function () {
                            if ($(controls.PROVINCIA).val() != '') {
                                $(controls.PROVINCIA_REF).val($(controls.PROVINCIA).val());
                                $(controls.PROVINCIA_REF).trigger('change');
                            }
                        }
                    });
                });

                $(controls.PROVINCIA_REF).change(function () {
                    $(controls.PROVINCIA).val($(controls.PROVINCIA_REF).val())

                    $(controls.DISTRITO_REF).attr('data-query', 'gbl_obtener_distrito');
                    $(controls.DISTRITO_REF).attr('data-value', 'DESCRIPCION');
                    $(controls.DISTRITO_REF).attr('data-field', 'DESCRIPCION');
                    $(controls.DISTRITO_REF).attr('data-DEPARTAMENTO', $(controls.DEPARTAMENTO_REF).val());
                    $(controls.DISTRITO_REF).attr('data-PROVINCIA', $(controls.PROVINCIA_REF).val());
                    $(controls.DISTRITO_REF).attr('data-tipoparametro', 'Distrito');
                    $(controls.DISTRITO_REF).FieldLoadRemote({
                        onReady: function () {
                            if ($(controls.DISTRITO).val() != '') {
                                $(controls.DISTRITO_REF).val($(controls.DISTRITO).val());
                                $(controls.DISTRITO_REF).trigger('change');
                            }
                        }
                    });
                });

                $(controls.DISTRITO_REF).change(function () {
                    $(controls.DISTRITO).val($(controls.DISTRITO_REF).val())
                });

                if ($(controls.C_PROVEEDOR).val() != '') {
                    if ($(controls.DEPARTAMENTO).val() != '') {
                        $(controls.DEPARTAMENTO_REF).val($(controls.DEPARTAMENTO).val());
                        $(controls.DEPARTAMENTO_REF).trigger('change');
                    }
                }

                $(form + ' #btnGuardar').click(function () {

                    if (!estadoButton) {
                        estadoButton = true;
                        var validacion = $.solver.fn.validarCondicionesTabla(objValidarTablas);
                        if (validacion.estado) {
                            $.GetQuery({
                                query: ['q_logistica_mantenimiento_proveedoresregistro_comprobarproveedor'],
                                items: [{
                                    C_EMPRESA: empresa,
                                    C_PROVEEDOR: function () {
                                        return $(controls.C_PROVEEDOR).val();
                                    },
                                    DOCUMENTO: function () {
                                        return $(controls.RUC_CLIENTE).val();
                                    }
                                }],
                                onError: function (error) {
                                    estado = false;
                                    $.ShowError({ error });
                                },
                                onReady: function (result) {
                                    estado = false;
                                    if (result.length == 0) {
                                        $(form).submit();
                                    }
                                    else if (result.length == 1 && $(form + ' #C_PROVEEDOR').val() == '') {
                                        alertify.warning('El documento ya se encuentra registrado.');
                                    }
                                    else if (result.length == 1 && $(form + ' #C_PROVEEDOR').val() != '') {
                                        alertify.warning('El documento ya se encuentra registrado.');
                                    }
                                    else if (result.length == 2 && $(form + ' #C_PROVEEDOR').val() != '') {
                                        $(form).submit();
                                    }
                                }
                            })
                        }
                        else {
                            var mensaje = ''
                            $.each(validacion.mensajes, function (i, v) {
                                mensaje += v + '<br>'
                            });

                            alertify.warning(mensaje);
                        }
                        estadoButton = false;
                    }



                });
            },
            onReady: function (result, controls, form) {
                $(controls.C_PROVEEDOR).val(result.items.C_PROVEEDOR);
                $(controls.C_PROVEEDOR).trigger('change');
                if ($('#CREAR').val() == '') {
                    document.location = $.solver.baseUrl + '/Mantenimiento/Proveedores/';
                    alertify.success('Se registró la información.');
                }
                $('.btn-save-proveedor').css('display', 'none');
            },
            onError: function (error) {
                $.CloseStatusBar();
                $.ShowError({ error: error });
            }
        });
    });
});





//require(["jqwidgets", "helper", "extras"], function () {
//    require(["alertify"], function (alertify) {
//        alertify.set('notifier', 'position', 'top-center');
//        const empresa = $.solver.session.SESSION_EMPRESA;
//        const usuario = $.solver.session.SESSION_ID;

//        const form = 'form[name=frmRegistroProveedor]';

//        const tblContacto = '#tblContacto';
//        const tblCuentaBancaria = '#tblCuentaBancaria';

//        let tiposContactos = [];
//        let estado = false;

//        var _type = 1;
//        var condition = $('#CONDITION').val();
//        if (condition.length != 0) _type = 2;

//        const fnObtenerAlerta = function (message) {
//            alertify.alert()
//                .setting({
//                    'title': 'Mensaje del Sistema',
//                    'message': message,
//                }).show();
//        }
//        const validarFormatoFecha = function (fecha, index, column) {
//            var RegExPattern = /^\d{1,2}\/\d{1,2}\/\d{2,4}$/;
//            if ((fecha.match(RegExPattern)) && (fecha != '')) { }
//            else {
//                if (column == 'FEC_REGISTRO') {
//                    fnObtenerAlerta("Por favor ingrese la fecha registro correctamente");
//                    $(tblCuentaBancaria).jqxGrid('getrows')[index].FEC_REGISTRO = '';
//                }
//                $(tblCuentaBancaria).jqxGrid('refresh');
//            }
//        }
//        const validarIsEmail = function (email) {
//            var regex = /^([a-zA-Z0-9_\.\-\+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
//            if (!regex.test(email)) {
//                return false;
//            } else {
//                return true;
//            }
//        }

//        const fnCrearTabla = function () {

            

//            $(tblContacto).CreateGrid({
//                query: 'q_logistica_mantenimiento_proveedoresregistro_listarcontactos',
//                items: {
//                    C_PROVEEDOR: function () { return $('form[name=frmRegistroProveedor] #C_PROVEEDOR').val() || ''; },
//                    C_EMPRESA: empresa
//                },
//                hiddens: ['C_PROVEEDOR_CONTACTO', 'C_PROVEEDOR', 'C_EMPRESA'],
//                columns: {
//                    'TIPO': {
//                        text: 'Tipo contacto',
//                        columntype: 'dropdownlist',
//                        createeditor: function (row, value, editor) {
//                            const tipoContactoSource = {
//                                datatype: "array",
//                                datafields: [
//                                    { name: 'label', type: 'string' },
//                                    { name: 'value', type: 'string' }
//                                ],
//                                localdata: tiposContactos
//                            };
//                            const myadapter = new $.jqx.dataAdapter(tipoContactoSource, { autoBind: true });
//                            editor.jqxDropDownList({ source: myadapter, displayMember: 'label', valueMember: 'value' });
//                        }
//                    },
//                    'APELLIDO': { text: 'Apellidos' },
//                    'NOMBRE': { text: 'Nombres' },
//                    'PUESTO': { text: 'Puesto' },
//                    'TELEFONO': { text: 'Teléfono' },
//                    'CORREO': { text: 'Correo electrónico', width: 250 },
//                    'ESTADO': {
//                        text: 'Estado',
//                        width: 80,
//                        cellsAlign: 'center',
//                        columntype: 'dropdownlist',
//                        createeditor: function (row, value, editor) {
//                            const estados = [
//                                { value: "*", label: "Activo" },
//                                { value: "&", label: "Inactivo" }
//                            ];
//                            const estadoSource = {
//                                datatype: "array",
//                                datafields: [
//                                    { name: 'label', type: 'string' },
//                                    { name: 'value', type: 'string' }
//                                ],
//                                localdata: estados
//                            };
//                            const myadapter = new $.jqx.dataAdapter(estadoSource, { autoBind: true });
//                            editor.jqxDropDownList({ source: myadapter, displayMember: 'label', valueMember: 'value' });
//                        }
//                    }
//                },
//                config: {
//                    virtualmode: false,
//                    height: 550,
//                    columnsresize: true,
//                    editable: true,
//                    sortable: false,
//                    pageable: false,
//                    rendered: function () {
//                        $(tblContacto).jqxGrid('selectrow', 0);

//                        $('button.btn-add-contact').unbind('click');
//                        $('button.btn-add-contact').bind('click', function () {
//                            var nuevo = {
//                                MODO: 1,
//                                C_EMPRESA: empresa,
//                                C_PROVEEDOR_CONTACTO: '',
//                                C_PROVEEDOR: '',
//                                APELLIDO: '',
//                                NOMBRE: '',
//                                PUESTO: '',
//                                TELEFONO: '',
//                                CORREO: '',
//                                ESTADO: 'Activo'
//                            };

//                            const fila = $(tblContacto).jqxGrid('getrows').length;
//                            $(tblContacto).jqxGrid('addrow', null, nuevo);
//                            $(tblContacto).jqxGrid('selectrow', fila);
//                            $(tblContacto).jqxGrid('ensurerowvisible', fila);
//                        });
//                    }
//                }
//            });
//            $(tblContacto).on('bindingcomplete', function () {
//                $(tblContacto).unbind("cellendedit");
//                $(tblContacto).on("cellendedit", function (event) {
//                    if (event.args.newvalue != event.args.oldvalue) {
//                        var row = event.args.rowindex;
//                        if ($(tblContacto).jqxGrid('getrows')[row].MODO != 1) {
//                            $(tblContacto).jqxGrid('getrows')[row].MODO = 2;
//                        }
//                    }
//                });
//                $(tblContacto).unbind("cellvaluechanged");
//                $(tblContacto).on("cellvaluechanged", function (event) {
//                    var args = event.args;
//                    var datafield = event.args.datafield;
//                    var rowBoundIndex = args.rowindex;
//                    var value = args.newvalue;
//                    var oldvalue = args.oldvalue;

//                    if (datafield == 'CORREO') {
//                        if (value == '') { }
//                        else {
//                            if (validarIsEmail(value) == false) {
//                                fnObtenerAlerta("Por favor ingrese el correo correctamente");
//                                $(tblContacto).jqxGrid('getrows')[rowBoundIndex].CORREO = '';
//                            }
//                        }
//                    }
//                });
//            });
//        }

//        $('#RUC_CLIENTE').change(function () {
//            if ($('#DUPLICADO').val() == 'Existe') {
//                $('#VALIDADOR').val('No');
//            }
//        });

//        $(form).ValidForm({
//            table: 'LOG.PROVEEDORES',
//            type: _type,
//            condition: condition,
//            querySave: true,
//            queryDefault: {
//                query: ['editableProveedores'],
//                type: [8],
//                items: [{
//                    table: 'LOG.PROVEEDORES',
//                    condition: condition
//                }]
//            },
//            extras: {
//                C_PROVEEDOR: {
//                    action: {
//                        name: 'GetNextId',
//                        args: $.ConvertObjectToArr({
//                            columns: 'C_EMPRESA',
//                            max_length: '6'
//                        })
//                    }
//                }
//            },
//            rules: {
//                CORREO_FACTURACION: {
//                    validarCorreo: $('#CORREO_FACTURACION').val()
//                }
//            },
//            onDetail: function (form, controls, token) {

//                var c_proveedor = $(controls.C_PROVEEDOR).val();

//                if ($(tblContacto).jqxGrid('getrows').length > 0) {
//                    var tableContacto = 'LOG.PROVEEDOR_CONTACTO';
//                    var rows = $(tblContacto).jqxGrid('getrows');

//                    // Extra
//                    const extraClienteContacto = {
//                        C_PROVEEDOR: {
//                            action: {
//                                name: 'GetParentId',
//                                args: $.ConvertObjectToArr({
//                                    token: token,
//                                    column: 'C_PROVEEDOR'
//                                })
//                            }
//                        },
//                        C_PROVEEDOR_CONTACTO: {
//                            action: {
//                                name: 'GetNextId',
//                                args: $.ConvertObjectToArr({
//                                    columns: 'C_EMPRESA,C_PROVEEDOR',
//                                    max_length: '3'
//                                })
//                            }
//                        }
//                    };

//                    // Insertar
//                    $.each(rows, function (i, v) {
//                        $.AddPetition({
//                            table: tableContacto,
//                            type: (v.C_PROVEEDOR_CONTACTO == '' ? 1 : 2),
//                            condition: ((v.C_PROVEEDOR_CONTACTO == '') ? '' : `C_PROVEEDOR_CONTACTO = '${v.C_PROVEEDOR_CONTACTO}' AND C_PROVEEDOR = '${v.C_PROVEEDOR}' AND C_EMPRESA = '${empresa}'`),
//                            items: $.ConvertObjectToArr({
//                                C_EMPRESA: v.C_EMPRESA,
//                                C_PROVEEDOR: c_proveedor,
//                                C_PROVEEDOR_CONTACTO: v.C_PROVEEDOR_CONTACTO,
//                                C_TIPO_CONTACTO: (v.TIPO != '' && v.TIPO != null ? tiposContactos.filter(x => x['label'] == v.TIPO)[0]['value'] : ''),
//                                NOMBRE: v.NOMBRE,
//                                APELLIDO: v.APELLIDO,
//                                PUESTO: v.PUESTO,
//                                TELEFONO: v.TELEFONO,
//                                CORREO: v.CORREO,
//                                IND_ESTADO: (v.ESTADO == 'Activo' ? '*' : '&')
//                            }, extraClienteContacto)
//                        });
//                    });
//                }

                

//            },
//            onDone: function (_form, controls) {
//                $(controls.C_EMPRESA).val(empresa);
//                $(controls.C_PARAMETRO_GENERAL_TIPO_DOCUMENTO).change(function () {
//                    const tipo_doc = $(controls.C_PARAMETRO_GENERAL_TIPO_DOCUMENTO).val();
//                    if (tipo_doc == '') $(controls.RUC_CLIENTE).removeAttr('maxlength');
//                    else if (tipo_doc == '00013') $(controls.RUC_CLIENTE).attr('maxlength', '8');
//                    else if (tipo_doc == '00017') $(controls.RUC_CLIENTE).attr('maxlength', '11');
//                    else $(controls.RUC_CLIENTE).removeAttr('maxlength')

//                    if (tipo_doc == '00018' || tipo_doc == '00021' || tipo_doc == '00016') {
//                        $(controls.C_PARAMETRO_GENERAL_PROCEDENCIA).val('07231');
//                    }
//                    else {
//                        $(controls.C_PARAMETRO_GENERAL_PROCEDENCIA).val('07230');
//                    }
//                    if (tipo_doc == '00017') {
//                        $(form + ' #bloque_nombre_comercial').css({ 'display': 'block' });
//                        $(form + ' #bloque_datos_representante').css({ 'display': 'block' });
//                    }
//                    else {
//                        $(form + ' #bloque_nombre_comercial').css({ 'display': 'none' });
//                        $(form + ' #bloque_datos_representante').css({ 'display': 'none' });
//                        $(controls.APE_PAT_REPRESENTANTE).val('');
//                        $(controls.APE_MAT_REPRESENTANTE).val('');
//                        $(controls.NOMBRES_REPRESENTANTE).val('');
//                        $(controls.C_PARAMETRO_GENERAL_TIPO_DOCUMENTO_REPRESENTANTE).val('');
//                        $(controls.NRO_DOCUMENTO_REPRESENTANTE).val('');
//                        $(controls.EMAIL_REPRESENTANTE).val('');
//                    }
//                });
//                $(controls.C_PARAMETRO_GENERAL_TIPO_DOCUMENTO).trigger('change');
//                $(controls.RUC_CLIENTE).keyup(function () {
//                    var tipo = $(controls.C_PARAMETRO_GENERAL_TIPO_DOCUMENTO).val();
//                    switch (tipo) {
//                        case '00017':
//                            if ($(controls.RUC_CLIENTE).val().length == 11) {
//                                $.GetQuery({
//                                    query: ['q_ventas_mantenimiento_clientes_obtenerpadron_ruc'],
//                                    items: [{ RUC: function () { return $(controls.RUC_CLIENTE).val(); } }],
//                                    onError: function (error) { },
//                                    onReady: function (result) {
//                                        if (result.length > 0) {
//                                            $(controls.RAZON_SOCIAL).val(result[0].RAZON_SOCIAL);
//                                            $(controls.DIRECCION_FISCAL).val(result[0].DIRECCION);
//                                            if (result[0].DEPARTAMENTO != null) $(controls.DEPARTAMENTO).val(result[0].DEPARTAMENTO);
//                                            if (result[0].PROVINCIA != null) $(controls.PROVINCIA).val(result[0].PROVINCIA);
//                                            if (result[0].DISTRITO != null) $(controls.DISTRITO).val(result[0].DISTRITO);

//                                            if (result[0].DEPARTAMENTO != null) {
//                                                $(controls.DEPARTAMENTO_REF).val(result[0].DEPARTAMENTO).trigger('change')
//                                            }
//                                            else {
//                                                $(controls.DEPARTAMENTO_REF).val('').trigger('change')
//                                            }
//                                        }
//                                    }
//                                });
//                            }
//                            break;
//                        default:
//                            break;
//                    }
//                });

//                $('#RUC_CLIENTE_VALIDADOR').val($(controls.RUC_CLIENTE).val());
//                $('#RAZON_SOCIAL_VALIDADOR').val($(controls.RAZON_SOCIAL).val());
//                $('#C_PARAMETRO_GENERAL_TIPO_DOCUMENTO_CLIENTE_VALIDADOR').val($(controls.C_PARAMETRO_GENERAL_TIPO_DOCUMENTO).val());

//                if ($('#CREAR').val() != "") $('#btnSalir').css('display', 'none');

//                $.GetQuery({
//                    query: ['q_logistica_mantenimiento_proveedoresregistro_listartipocontacto'],
//                    items: [{ C_EMPRESA: empresa }],
//                    onReady: function (result) {
//                        $.each(result, function (i, v) {
//                            tiposContactos.push({
//                                value: v.C_TIPO_CONTACTO,
//                                label: v.NOMBRE
//                            });
//                        });
//                        fnCrearTabla();
//                    }

//                })

//                $(controls.DEPARTAMENTO_REF).change(function () {
//                    $(controls.DEPARTAMENTO).val($(controls.DEPARTAMENTO_REF).val())

//                    $(controls.PROVINCIA_REF).attr('data-query', 'gbl_obtener_provincia');
//                    $(controls.PROVINCIA_REF).attr('data-value', 'DESCRIPCION');
//                    $(controls.PROVINCIA_REF).attr('data-field', 'DESCRIPCION');
//                    $(controls.PROVINCIA_REF).attr('data-DEPARTAMENTO', $(controls.DEPARTAMENTO_REF).val());
//                    $(controls.PROVINCIA_REF).attr('data-tipoparametro', 'Provincia');
//                    $(controls.PROVINCIA_REF).FieldLoadRemote({
//                        onReady: function () {
//                            if ($(controls.PROVINCIA).val() != '') {
//                                $(controls.PROVINCIA_REF).val($(controls.PROVINCIA).val());
//                                $(controls.PROVINCIA_REF).trigger('change');
//                            }
//                        }
//                    });
//                });

//                $(controls.PROVINCIA_REF).change(function () {
//                    $(controls.PROVINCIA).val($(controls.PROVINCIA_REF).val())

//                    $(controls.DISTRITO_REF).attr('data-query', 'gbl_obtener_distrito');
//                    $(controls.DISTRITO_REF).attr('data-value', 'DESCRIPCION');
//                    $(controls.DISTRITO_REF).attr('data-field', 'DESCRIPCION');
//                    $(controls.DISTRITO_REF).attr('data-DEPARTAMENTO', $(controls.DEPARTAMENTO_REF).val());
//                    $(controls.DISTRITO_REF).attr('data-PROVINCIA', $(controls.PROVINCIA_REF).val());
//                    $(controls.DISTRITO_REF).attr('data-tipoparametro', 'Distrito');
//                    $(controls.DISTRITO_REF).FieldLoadRemote({
//                        onReady: function () {
//                            if ($(controls.DISTRITO).val() != '') {
//                                $(controls.DISTRITO_REF).val($(controls.DISTRITO).val());
//                                $(controls.DISTRITO_REF).trigger('change');
//                            }
//                        }
//                    });
//                });

//                $(controls.DISTRITO_REF).change(function () {
//                    $(controls.DISTRITO).val($(controls.DISTRITO_REF).val())
//                });

//                if ($(controls.C_PROVEEDOR).val() != '') {
//                    if ($(controls.DEPARTAMENTO).val() != '') {
//                        $(controls.DEPARTAMENTO_REF).val($(controls.DEPARTAMENTO).val());
//                        $(controls.DEPARTAMENTO_REF).trigger('change');
//                    }
//                }

//                $('#btnGuardar').click(function () {
//                    if (!estado) {
//                        estado = true;
//                        if ($(tblContacto).jqxGrid('getrows').filter(x => x['CORREO'] == '').length > 0) 
//                        {
//                            alertify.warning('Todos los contactos deben tener correo.')
//                            estado = false;
//                        }
//                        else {
//                            $.GetQuery({
//                                query: ['q_logistica_mantenimiento_proveedoresregistro_comprobarproveedor'],
//                                items: [{
//                                    RUC_CLIENTE: function () { return $(controls.RUC_CLIENTE).val(); },
//                                    C_EMPRESA: empresa
//                                }],
//                                onReady: function (result) {
//                                    estado = false;
//                                    if (result.length > 0) {
//                                        if ($('#DUPLICADO').val() == 'Existe') {
//                                            if ($('#VALIDADOR').val() == 'Si') {
//                                                $(form).submit();
//                                            }
//                                            else {
//                                                alertify.alert('El proveedor ' + $('#RAZON_SOCIAL').val() + ' ya está registrado.');
//                                                $('#VALIDADOR').val('Si');
//                                                $('#RUC_CLIENTE').val($('#RUC_CLIENTE_VALIDADOR').val());
//                                                $('#RAZON_SOCIAL').val($('#RAZON_SOCIAL_VALIDADOR').val());
//                                                $('#C_PARAMETRO_GENERAL_TIPO_DOCUMENTO_CLIENTE').val($('#C_PARAMETRO_GENERAL_TIPO_DOCUMENTO_CLIENTE_VALIDADOR').val()).trigger('change');
//                                            }
//                                        }
//                                        else {
//                                            if (result[0].CONT == 0) {
//                                                $(form).submit();
//                                            }
//                                            else {
//                                                alertify.alert('El proveedor ' + $('#RUC_CLIENTE').val() + ' ya está registrado.');
//                                                $('#RUC_CLIENTE').val('');
//                                                $('#RAZON_SOCIAL').val('');
//                                                $('#C_PARAMETRO_GENERAL_TIPO_DOCUMENTO_CLIENTE').val('').trigger('change');
//                                            }
//                                        }
//                                    }
//                                }
//                            })
//                        }
//                    }
//                });
//            },
//            onReady: function (result, controls, form) {
//                $(controls.C_PROVEEDOR).val(result.items.C_PROVEEDOR);
//                $(controls.C_PROVEEDOR).trigger('change');
//                if ($('#CREAR').val() == '') {
//                    document.location = $.solver.baseUrl + '/Mantenimiento/Proveedores/';
//                    alertify.success('Se registró la información.');
//                }
//                $('.btn-save-proveedor').css('display', 'none');
//            },
//            onError: function (error) {
//                $.CloseStatusBar();
//                $.ShowError({ error: error });
//            }
//        });
//    });
//});