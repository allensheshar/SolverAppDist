require(["jqwidgets", "helper", "extras"], function () {
    require(["alertify"], function (alertify) {

        alertify.set('notifier', 'position', 'top-center');

        const empresa = $.solver.session.SESSION_EMPRESA;
        const tblContacto = '#tblContacto';
        const tblDireccion = '#tblDireccion';
        let departamentos = [];
        let provincias = [];
        let distritos = [];
        let tiposContactos = [];

        $('form[name=frmRegistroCliente] #C_CATEGORIA_CLIENTE').attr('data-C_EMPRESA', empresa);
        $('form[name=frmRegistroCliente] #C_EMPRESA').val(empresa);

        const fnCrearTablas = function () {
            $(tblContacto).CreateGrid({
                query: 'q_ventas_mantenimiento_clientesregistro_listarcontactos',
                items: {
                    C_CLIENTE: function () {
                        return $('form[name=frmRegistroCliente] #C_CLIENTE').val() || '';
                    },
                    C_EMPRESA: empresa
                },
                hiddens: ['C_CLIENTE_CONTACTO', 'C_CLIENTE', 'C_EMPRESA'],
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
                    'APELLIDO': {
                        text: 'Apellidos'
                    },
                    'NOMBRE': {
                        text: 'Nombres'
                    },
                    'PUESTO': {
                        text: 'Puesto'
                    },
                    'TELEFONO': {
                        text: 'Teléfono'
                    },
                    'CORREO': { text: 'Correo electrónico', width: 250 },
                    'ESTADO': {
                        text: 'Estado',
                        columntype: 'dropdownlist',
                        createeditor: function (row, value, editor) {
                            const estados = [
                                { value: "*", label: "Activo" },
                                { value: "&", label: "Inactivo" }
                            ];

                            var estadoSource =
                            {
                                datatype: "array",
                                datafields: [
                                    { name: 'label', type: 'string' },
                                    { name: 'value', type: 'string' }
                                ],
                                localdata: estados
                            };

                            var myadapter = new $.jqx.dataAdapter(estadoSource, { autoBind: true });

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
                                C_CLIENTE: '',
                                C_CLIENTE_CONTACTO: '',
                                C_TIPO_CONTACTO: '',
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

            $(tblDireccion).CreateGrid({
                query: 'q_ventas_mantenimiento_clientesregistro_listardirecciones',
                items: {
                    C_CLIENTE: function () {
                        return $('form[name=frmRegistroCliente] #C_CLIENTE').val() || '';
                    },
                    C_EMPRESA: empresa
                },
                hiddens: ['C_CLIENTE_DIRECCION', 'C_CLIENTE', 'C_EMPRESA'],
                columns: {
                    'DEPARTAMENTO': {
                        text: 'Departamento',
                        columntype: 'dropdownlist',
                        createeditor: function (row, value, editor) {
                            var estadoSource =
                            {
                                datatype: "array",
                                datafields: [
                                    { name: 'label', type: 'string' },
                                    { name: 'value', type: 'string' }
                                ],
                                localdata: departamentos
                            };

                            var myadapter = new $.jqx.dataAdapter(estadoSource, { autoBind: true });

                            editor.jqxDropDownList({ source: myadapter, displayMember: 'label', valueMember: 'value' });
                        },
                        cellendedit: function (row, datafield, columntype, oldvalue, newvalue) {
                            if (oldvalue != newvalue) {
                                var index = $(tblDireccion).jqxGrid('getselectedrowindex');
                                $(tblDireccion).jqxGrid('getrows')[index].PROVINCIA = "";
                                $(tblDireccion).jqxGrid('getrows')[index].DISTRITO = "";
                            }
                        }
                    },
                    'PROVINCIA': {
                        text: 'Provincia',
                        columntype: 'dropdownlist',
                        createeditor: function (row, value, editor) {
                            var index = $(tblDireccion).jqxGrid('getselectedrowindex');
                            var departamento = $(tblDireccion).jqxGrid('getrows')[index].DEPARTAMENTO;
                            var codigoDepartamento = departamentos.filter(x => x['label'] == departamento);
                            var lstProvincias = [];
                            if (codigoDepartamento.length != 0) {
                                lstProvincias = provincias.filter(x => x['value'].substring(0, 2) == codigoDepartamento[0].value);
                            }
                            var estadoSource =
                            {
                                datatype: "array",
                                datafields: [
                                    { name: 'label', type: 'string' },
                                    { name: 'value', type: 'string' }
                                ],
                                localdata: lstProvincias
                            };

                            var myadapter = new $.jqx.dataAdapter(estadoSource, { autoBind: true });

                            editor.jqxDropDownList({ source: myadapter, displayMember: 'label', valueMember: 'value' });
                        },
                        initeditor: function (row, value, editor) {
                            var index = $(tblDireccion).jqxGrid('getselectedrowindex');
                            var departamento = $(tblDireccion).jqxGrid('getrows')[index].DEPARTAMENTO;
                            var codigoDepartamento = departamentos.filter(x => x['label'] == departamento);
                            var lstProvincias = [];
                            if (codigoDepartamento.length != 0) {
                                lstProvincias = provincias.filter(x => x['value'].substring(0, 2) == codigoDepartamento[0].value);
                            }
                            var estadoSource =
                            {
                                datatype: "array",
                                datafields: [
                                    { name: 'label', type: 'string' },
                                    { name: 'value', type: 'string' }
                                ],
                                localdata: lstProvincias
                            };

                            var myadapter = new $.jqx.dataAdapter(estadoSource, { autoBind: true });

                            editor.jqxDropDownList({ source: myadapter, displayMember: 'label', valueMember: 'value' });
                        },
                        cellendedit: function (row, datafield, columntype, oldvalue, newvalue) {
                            if (oldvalue != newvalue) {
                                var index = $(tblDireccion).jqxGrid('getselectedrowindex');
                                $(tblDireccion).jqxGrid('getrows')[index].DISTRITO = "";
                            }
                        }
                    },
                    'DISTRITO': {
                        text: 'Distrito',
                        columntype: 'dropdownlist',
                        createeditor: function (row, value, editor) {
                            var index = $(tblDireccion).jqxGrid('getselectedrowindex');
                            var provincia = $(tblDireccion).jqxGrid('getrows')[index].PROVINCIA;
                            var codigoProvincia = provincias.filter(x => x['label'] == provincia);
                            var lstDistrito = [];
                            if (codigoProvincia.length != 0) {
                                lstDistrito = distritos.filter(x => x['value'].substring(0, 4) == codigoProvincia[0].value);
                            }
                            var estadoSource =
                            {
                                datatype: "array",
                                datafields: [
                                    { name: 'label', type: 'string' },
                                    { name: 'value', type: 'string' }
                                ],
                                localdata: lstDistrito
                            };

                            var myadapter = new $.jqx.dataAdapter(estadoSource, { autoBind: true });

                            editor.jqxDropDownList({ source: myadapter, displayMember: 'label', valueMember: 'value' });
                        },
                        initeditor: function (row, value, editor) {
                            var index = $(tblDireccion).jqxGrid('getselectedrowindex');
                            var provincia = $(tblDireccion).jqxGrid('getrows')[index].PROVINCIA;
                            var codigoProvincia = provincias.filter(x => x['label'] == provincia);
                            var lstDistrito = [];
                            if (codigoProvincia.length != 0) {
                                lstDistrito = distritos.filter(x => x['value'].substring(0, 4) == codigoProvincia[0].value);
                            }
                            var estadoSource =
                            {
                                datatype: "array",
                                datafields: [
                                    { name: 'label', type: 'string' },
                                    { name: 'value', type: 'string' }
                                ],
                                localdata: lstDistrito
                            };

                            var myadapter = new $.jqx.dataAdapter(estadoSource, { autoBind: true });

                            editor.jqxDropDownList({ source: myadapter, displayMember: 'label', valueMember: 'value' });
                        }
                    },
                    'DIRECCION': {
                        text: 'Dirección'
                    },
                    'OBS_PLANTA': {
                        text: 'Planta'
                    },
                    'ESTADO': {
                        text: 'Estado',
                        columntype: 'dropdownlist',
                        createeditor: function (row, value, editor) {
                            const estados = [
                                { value: "*", label: "Activo" },
                                { value: "&", label: "Inactivo" }
                            ];

                            var estadoSource =
                            {
                                datatype: "array",
                                datafields: [
                                    { name: 'label', type: 'string' },
                                    { name: 'value', type: 'string' }
                                ],
                                localdata: estados
                            };

                            var myadapter = new $.jqx.dataAdapter(estadoSource, { autoBind: true });

                            editor.jqxDropDownList({ source: myadapter, displayMember: 'label', valueMember: 'value' });
                        }
                    },
                },
                config: {
                    virtualmode: false,
                    height: 550,
                    columnsresize: true,
                    editable: true,
                    sortable: false,
                    pageable: false,
                    rendered: function () {
                        $(tblDireccion).jqxGrid('selectrow', 0);

                        $('button.btn-add-dir').unbind('click');
                        $('button.btn-add-dir').bind('click', function () {

                            var nuevo = {
                                MODO: 1,
                                C_CLIENTE_DIRECCION: '',
                                C_EMPRESA: empresa,
                                ESTADO: 'Activo'
                            };

                            const fila = $(tblDireccion).jqxGrid('getrows').length;
                            $(tblDireccion).jqxGrid('addrow', null, nuevo);
                            $(tblDireccion).jqxGrid('selectrow', fila);
                            $(tblDireccion).jqxGrid('ensurerowvisible', fila);

                        });
                    }
                }
            });
            $(tblDireccion).on('bindingcomplete', function () {
                $(tblDireccion).unbind("cellendedit");
                $(tblDireccion).on("cellendedit", function (event) {
                    if (event.args.value != event.args.oldvalue) {
                        var row = event.args.rowindex;
                        if ($(tblDireccion).jqxGrid('getrows')[row].MODO != 1) {
                            $(tblDireccion).jqxGrid('getrows')[row].MODO = 2;
                        }
                    }
                });
            });
        }
        const fnObtenerUbigeo = function () {
            $.GetQuery({
                query: ['q_ventas_mantenimiento_clientesregistro_listarubigeo'],
                onReady: function (result) {
                    departamentos = result.filter(x => x['value'].length == 2);
                    provincias = result.filter(x => x['value'].length == 4);
                    distritos = result.filter(x => x['value'].length == 6);
                }
            });
        }
        const fnObtenerAlerta = function (message) {
            alertify.alert()
                .setting({
                    'title': 'Mensaje del Sistema',
                    'message': message,
                }).show();
        }

        $('.btn-save-cliente').click(function () {
            if ($(tblContacto).jqxGrid('getrows').filter(x => x['CORREO'] == '').length > 0) alertify.warning('Todos los contactos deben tener correo.')
            else {
                $.GetQuery({
                    query: ['q_ventas_mantenimiento_clienteregistro_validardocumento'],
                    items: [{
                        C_EMPRESA: empresa,
                        DOCUMENTO: $('form[name=frmRegistroCliente] #RUC_CLIENTE').val()
                    }],
                    onReady: function (result) {
                        if (result.length > 0 && $('form[name=frmRegistroCliente] #C_CLIENTE').val() == '') {
                            fnObtenerAlerta('El documento ya se encuentra registrado.');
                            $('form[name=frmRegistroCliente] #RUC_CLIENTE').trigger('focus')
                        }
                        else {
                            $('form[name=frmRegistroCliente]').submit();
                        }
                    }
                });
            }
        });

        if ($('#CREAR').val() != "") {
            $('#btnSalir').css('display', 'none');
        }

        $('form[name=frmRegistroCliente]').ValidForm({
            table: 'VET.CLIENTE',
            type: 1,
            querySave: true,
            extras: {
                C_CLIENTE: {
                    action: {
                        name: 'GetNextId',
                        args: $.ConvertObjectToArr({
                            columns: 'C_EMPRESA',
                            max_length: '6'
                        })
                    }
                }
            },
            onDetail: function (form, controls, token) {
                var c_cliente = $(controls.C_CLIENTE).val();
                if ($(tblContacto).jqxGrid('getrows').length > 0) {
                    var tableContacto = 'vet.CLIENTE_CONTACTO';
                    var rows = $(tblContacto).jqxGrid('getrows');

                    // Extra
                    const extraClienteContacto = {
                        C_CLIENTE: {
                            action: {
                                name: 'GetParentId',
                                args: $.ConvertObjectToArr({
                                    token: token,
                                    column: 'C_CLIENTE'
                                })
                            }
                        },
                        C_CLIENTE_CONTACTO: {
                            action: {
                                name: 'GetNextId',
                                args: $.ConvertObjectToArr({
                                    columns: 'C_EMPRESA,C_CLIENTE',
                                    max_length: '3'
                                })
                            }
                        }
                    };

                    // Insertar
                    $.each(rows, function (i, v) {
                        $.AddPetition({
                            table: tableContacto,
                            type: (v.C_CLIENTE_CONTACTO == '' ? 1 : 2),
                            condition: ((v.C_CLIENTE_CONTACTO == '') ? '' : `C_CLIENTE_CONTACTO = '${v.C_CLIENTE_CONTACTO}' AND C_CLIENTE = '${v.C_CLIENTE}' AND C_EMPRESA = '${empresa}'`),
                            items: $.ConvertObjectToArr({
                                C_EMPRESA: v.C_EMPRESA,
                                C_CLIENTE: c_cliente,
                                C_CLIENTE_CONTACTO: v.C_CLIENTE_CONTACTO,
                                C_TIPO_CONTACTO: tiposContactos.filter(x => x['label'] == v.TIPO)[0]['value'],
                                NOMBRE: v.NOMBRE,
                                APELLIDO: v.APELLIDO,
                                PUESTO: v.PUESTO,
                                TELEFONO: v.TELEFONO,
                                CORREO: v.CORREO,
                                IND_ESTADO: (v.ESTADO == 'Activo' ? '*' : '&'),

                            }, extraClienteContacto)
                        });
                    });
                }
                if ($(tblDireccion).jqxGrid('getrows').length > 0) {
                    var tableDireccion = 'vet.CLIENTE_DIRECCION';
                    var rows = $(tblDireccion).jqxGrid('getrows');

                    // Extras
                    const extraClienteDireccion = {
                        C_CLIENTE: {
                            action: {
                                name: 'GetParentId',
                                args: $.ConvertObjectToArr({
                                    token: token,
                                    column: 'C_CLIENTE'
                                })
                            }
                        },
                        C_CLIENTE_DIRECCION: {
                            action: {
                                name: 'GetNextId',
                                args: $.ConvertObjectToArr({
                                    columns: 'C_EMPRESA,C_CLIENTE',
                                    max_length: '3'
                                })
                            }
                        },
                    };

                    $.each(rows, function (i, v) {
                        let codDepartamento = '';
                        let codProvincia = '';
                        let codDistrito = '';

                        codDepartamento = departamentos.filter(x => x['label'] == v.DEPARTAMENTO)[0].value;
                        codProvincia = provincias.filter(x => x['label'] == v.PROVINCIA)[0].value;
                        let distritosFilter = distritos.filter(x => x['value'].substring(0, 4) == codProvincia);
                        codDistrito = distritosFilter.filter(x => (x['label'] == v.DISTRITO))[0].value;

                        $.AddPetition({
                            table: tableDireccion,
                            type: (v.C_CLIENTE_DIRECCION == '' ? 1 : 2),
                            condition: ((v.C_CLIENTE_DIRECCION == '') ? '' : `C_CLIENTE_DIRECCION = '${v.C_CLIENTE_DIRECCION}' AND C_CLIENTE = '${v.C_CLIENTE}' AND C_EMPRESA = '${empresa}'`),
                            items: $.ConvertObjectToArr({
                                C_EMPRESA: v.C_EMPRESA,
                                C_CLIENTE: c_cliente,
                                C_CLIENTE_DIRECCION: v.C_CLIENTE_DIRECCION,
                                DEPARTAMENTO: codDepartamento,
                                PROVINCIA: codProvincia,
                                DISTRITO: codDistrito,
                                DIRECCION: v.DIRECCION,
                                OBS_PLANTA: v.OBS_PLANTA,
                                IND_ESTADO: (v.ESTADO == 'Activo' ? '*' : '&'),
                            }, extraClienteDireccion)
                        });
                    });
                }
            },
            onDone: function (form, controls) {
                $(controls.C_PARAMETRO_GENERAL_TIPO_DOCUMENTO).change(function () {
                    const tipo_doc = $(controls.C_PARAMETRO_GENERAL_TIPO_DOCUMENTO).val();
                    if (tipo_doc == '') $(controls.RUC_CLIENTE).removeAttr('maxlength');
                    else if (tipo_doc == '00013') $(controls.RUC_CLIENTE).attr('maxlength', '8');
                    else if (tipo_doc == '00017') $(controls.RUC_CLIENTE).attr('maxlength', '11');
                    else $(controls.RUC_CLIENTE).removeAttr('maxlength');
                    if (tipo_doc == '00018' || tipo_doc == '00021' || tipo_doc == '00016') $(controls.C_PARAMETRO_GENERAL_PROCEDENCIA).val('07231');
                    else $(controls.C_PARAMETRO_GENERAL_PROCEDENCIA).val('07230');
                    if (tipo_doc == '00017') {
                        $('form[name=frmRegistroCliente] #bloque_nombre_comercial').css({ 'display': 'block' });
                        $('form[name=frmRegistroCliente] #bloque_datos_representante').css({ 'display': 'block' });
                    }
                    else {
                        $('form[name=frmRegistroCliente] #bloque_nombre_comercial').css({ 'display': 'none' });
                        $('form[name=frmRegistroCliente] #bloque_datos_representante').css({ 'display': 'none' });
                        $(controls.NOMBRE_COMERCIAL).val('')
                        $(controls.APE_PAT_REPRESENTANTE).val('');
                        $(controls.APE_MAT_REPRESENTANTE).val('');
                        $(controls.NOMBRES_REPRESENTANTE).val('');
                        $(controls.C_PARAMETRO_GENERAL_TIPO_DOCUMENTO_REPRESENTANTE).val('');
                        $(controls.NRO_DOCUMENTO_REPRESENTANTE).val('');
                        $(controls.EMAIL_REPRESENTANTE).val('');
                    }
                });
                $(controls.RUC_CLIENTE).keyup(function () {
                    $.GetQuery({
                        query: ['q_ventas_mantenimiento_clienteregistro_validardocumento'],
                        items: [{
                            C_EMPRESA: empresa,
                            DOCUMENTO: $(controls.RUC_CLIENTE).val()
                        }],
                        onReady: function (result) {
                            if (result.length > 0 && $(controls.C_CLIENTE).val() == '') {
                                alertify.warning('El documento ya se encuentra registrado.');
                            }
                            else {
                                var tipo = $(controls.C_PARAMETRO_GENERAL_TIPO_DOCUMENTO).val();
                                switch (tipo) {
                                    case '00017':
                                        if ($(controls.RUC_CLIENTE).val().length == 11) {
                                            $.GetQuery({
                                                query: ['q_ventas_mantenimiento_clientes_obtenerpadron_ruc'],
                                                items: [{ RUC: function () { return $(controls.RUC_CLIENTE).val(); } }],
                                                onError: function (error) { $.ShowError({ error: error }); },
                                                onReady: function (result) {
                                                    if (result.length > 0) {
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
                                                }
                                            });
                                        }
                                        break;
                                    default:
                                        break;
                                }
                            }
                        }
                    });
                });

                fnObtenerUbigeo();

                $(controls.C_PARAMETRO_GENERAL_TIPO_DOCUMENTO).trigger('change');
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
                        fnCrearTablas();
                    }

                });

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

                if ($(controls.C_CLIENTE).val() != '') {
                    if ($(controls.DEPARTAMENTO).val() != '') {
                        $(controls.DEPARTAMENTO_REF).val($(controls.DEPARTAMENTO).val());
                        $(controls.DEPARTAMENTO_REF).trigger('change');
                    }
                }
            },
            rules: {
                CORREO_FACTURACION: {
                    validarCorreo: $('#CORREO_FACTURACION').val()
                }
            },
            onReady: function (result, controls, form) {
                $(controls.C_CLIENTE).val(result.items.C_CLIENTE);
                $(controls.C_CLIENTE).trigger('change');
                if ($('#CREAR').val() == '') {
                    document.location = $.solver.baseUrl + '/Mantenimiento/Clientes/';
                    alertify.success('Se registró la información.');
                }
                $('.btn-save-cliente').css('display', 'none');
            },
            onError: function (error) {
                $.CloseStatusBar();
                $.ShowError({ error: error });
            }
        });

    });
});