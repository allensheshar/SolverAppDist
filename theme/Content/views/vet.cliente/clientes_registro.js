require(["jqwidgets", "helper", "extras"], function () {
    require(["alertify"], function (alertify) {

        alertify.set('notifier', 'position', 'top-center');

        const empresa = $.solver.session.SESSION_EMPRESA;
        const tblContacto = 'form[name=frmRegistroCliente] #tblContacto';
        const tblDireccion = 'form[name=frmRegistroCliente] #tblDireccion';
        let departamentos = [];
        let provincias = [];
        let distritos = [];
        let tiposContactos = [];
        let estado = false;
        let arrContactosEliminados = [];
        let arrDireccionesEliminados = [];
        const objValidarTablas = {
            tables: [
                {
                    table: tblContacto,
                    tableText: 'contactos',
                    items: ['APELLIDO', 'NOMBRE', 'CORREO'],
                    itemsText: ['Apellidos', 'Nombres', 'Correo electrónico']
                },
                {
                    table: tblDireccion,
                    tableText: 'direcciones',
                    items: ['DEPARTAMENTO', 'PROVINCIA', 'DISTRITO', 'DIRECCION'],
                    itemsText: ['Departamento', 'Provincia', 'Distrito', 'Dirección']
                }
            ]
        }

        $('form[name=frmRegistroCliente] #C_CATEGORIA_CLIENTE').attr('data-C_EMPRESA', empresa);
        $('form[name=frmRegistroCliente] #C_EMPRESA').val(empresa);

        const fnCrearTablas = function () {
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
                        text: 'Anexo'
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
                                DEPARTAMENTO: '',
                                PROVINCIA: '',
                                DIRECCION: '',
                                OBS_PLANTA: '',
                                ESTADO: 'Activo'
                            };

                            const fila = $(tblDireccion).jqxGrid('getrows').length;
                            $(tblDireccion).jqxGrid('addrow', null, nuevo);
                            $(tblDireccion).jqxGrid('selectrow', fila);
                            $(tblDireccion).jqxGrid('ensurerowvisible', fila);

                        });

                        $('button.btn-delete-dir').unbind('click');
                        $('button.btn-delete-dir').bind('click', function () {
                            var rows = $(tblDireccion).jqxGrid('getrows')
                            var index = $(tblDireccion).jqxGrid('getSelectedRowIndex')

                            if (index >= 0 && rows.length > 0) {
                                if (rows[index]['C_CLIENTE_DIRECCION'] != '') {
                                    arrDireccionesEliminados.push(rows[index]);
                                }
                                var rowId = $(tblDireccion).jqxGrid('getrowid', index);
                                $(tblDireccion).jqxGrid('deleterow', rowId);
                            }
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
            if (!estado) {
                estado = true;
                var validacion = $.solver.fn.validarCondicionesTabla(objValidarTablas);
                if (validacion.estado) {
                    $.GetQuery({
                        query: ['q_ventas_mantenimiento_clienteregistro_validardocumento'],
                        items: [{
                            C_EMPRESA: empresa,
                            DOCUMENTO: function () {
                                return $('form[name=frmRegistroCliente] #RUC_CLIENTE').val();
                            },
                            C_CLIENTE: function () {
                                return $('form[name=frmRegistroCliente] #C_CLIENTE').val()
                            }
                        }],
                        onError: function (error) {
                            estado = false;
                            $.ShowError({ error });
                        },
                        onReady: function (result) {
                            estado = false;
                            if (result.length == 0) {
                                $('form[name=frmRegistroCliente]').submit();
                            }
                            else if (result.length == 1 && $('form[name=frmRegistroCliente] #C_CLIENTE').val() == '') {
                                alertify.warning('El documento ya se encuentra registrado.');
                            }
                            else if (result.length == 1 && $('form[name=frmRegistroCliente] #C_CLIENTE').val() != '') {
                                alertify.warning('El documento ya se encuentra registrado.');
                            }
                            else if (result.length == 2 && $('form[name=frmRegistroCliente] #C_CLIENTE').val() != '') {
                                $('form[name=frmRegistroCliente]').submit();
                            }
                        }
                    });
                }
                else {
                    var mensaje = ''
                    $.each(validacion.mensajes, function (i, v) {
                        mensaje += v + '<br>'
                    });

                    alertify.warning(mensaje);
                }
                estado = false;
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
                var tableContacto = 'vet.CLIENTE_CONTACTO';
                var tableDireccion = 'vet.CLIENTE_DIRECCION';

                if ($(tblContacto).jqxGrid('getrows').length > 0) {
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
                                C_TIPO_CONTACTO: (v.TIPO != '' && v.TIPO != null ? tiposContactos.filter(x => x['label'] == v.TIPO)[0]['value'] : ''),
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

                if (arrContactosEliminados.length > 0) {

                    // Eliminar
                    $.each(arrContactosEliminados, function (i, v) {
                        $.AddPetition({
                            table: tableContacto,
                            type: 2,
                            condition: `C_CLIENTE_CONTACTO = '${v.C_CLIENTE_CONTACTO}' AND C_CLIENTE = '${v.C_CLIENTE}' AND C_EMPRESA = '${empresa}'`,
                            items: $.ConvertObjectToArr({
                                C_EMPRESA: v.C_EMPRESA,
                                C_CLIENTE: v.C_CLIENTE,
                                C_CLIENTE_CONTACTO: v.C_CLIENTE_CONTACTO,
                                IND_ESTADO: 'E'
                            })
                        });
                    });
                }

                if ($(tblDireccion).jqxGrid('getrows').length > 0) {
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

                        if (v.DEPARTAMENTO != '' && v.DEPARTAMENTO != null && v.PROVINCIA != '' && v.PROVINCIA != null && v.DISTRITO != '' && v.DISTRITO != null) {
                            codDepartamento = departamentos.filter(x => x['label'] == v.DEPARTAMENTO)[0].value;
                            codProvincia = provincias.filter(x => x['label'] == v.PROVINCIA)[0].value;
                            let distritosFilter = distritos.filter(x => x['value'].substring(0, 4) == codProvincia);
                            codDistrito = distritosFilter.filter(x => (x['label'] == v.DISTRITO))[0].value;
                        }

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

                if (arrDireccionesEliminados.length > 0) {

                    // Eliminar
                    $.each(arrDireccionesEliminados, function (i, v) {
                        $.AddPetition({
                            table: tableDireccion,
                            type: 2,
                            condition: `C_CLIENTE_DIRECCION = '${v.C_CLIENTE_DIRECCION}' AND C_CLIENTE = '${v.C_CLIENTE}' AND C_EMPRESA = '${empresa}'`,
                            items: $.ConvertObjectToArr({
                                C_EMPRESA: v.C_EMPRESA,
                                C_CLIENTE: v.C_CLIENTE,
                                C_CLIENTE_DIRECCION: v.C_CLIENTE_DIRECCION,
                                IND_ESTADO: 'E'
                            })
                        });
                    });
                }

            },
            onDone: function (form, controls) {

                $(controls.C_PARAMETRO_GENERAL_TIPO_DOCUMENTO).change(function () {
                    const tipo_doc = $(controls.C_PARAMETRO_GENERAL_TIPO_DOCUMENTO).val();
                    if (tipo_doc == '') $(controls.RUC_CLIENTE).removeAttr('maxlength');
                    else if (tipo_doc == '00013') {
                        $(controls.RUC_CLIENTE).attr('maxlength', '8');
                        $(controls.RUC_CLIENTE).attr('minlength', '8');
                    }
                    else if (tipo_doc == '00017') {
                        $(controls.RUC_CLIENTE).attr('maxlength', '11');
                        $(controls.RUC_CLIENTE).attr('minlength', '11');
                    }
                    else {
                        $(controls.RUC_CLIENTE).attr('maxlength', '15');
                        $(controls.RUC_CLIENTE).removeAttr('minlength');
                    }
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

                    $(controls.RUC_CLIENTE).trigger('keyup');
                });
                $(controls.C_PARAMETRO_GENERAL_TIPO_DOCUMENTO).trigger('change');
                $(controls.RUC_CLIENTE).keyup(function () {
                    $.GetQuery({
                        query: ['q_ventas_mantenimiento_clienteregistro_validardocumento'],
                        items: [{
                            C_EMPRESA: empresa,
                            DOCUMENTO: function () {
                                return $('form[name=frmRegistroCliente] #RUC_CLIENTE').val();
                            },
                            C_CLIENTE: function () {
                                return $('form[name=frmRegistroCliente] #C_CLIENTE').val()
                            }
                        }],
                        onReady: function (result) {
                            if (result.length > 0 && $(controls.C_CLIENTE).val() == '') {
                                alertify.warning('El documento ya se encuentra registrado.');
                                $(controls.RAZON_SOCIAL).val('')
                                $(controls.DIRECCION_FISCAL).val('')
                                $(controls.DEPARTAMENTO_REF).val('')
                                $(controls.PROVINCIA_REF).val('')
                                $(controls.DISTRITO_REF).val('')
                            }
                            else {
                                var tipo = $(controls.C_PARAMETRO_GENERAL_TIPO_DOCUMENTO).val();
                                switch (tipo) {
                                    case '00017':
                                        if ($(controls.RUC_CLIENTE).val().length == 11) {
                                            $.GetQuery({
                                                uriData: 'https://api.solver.com.pe/v1/service',
                                                query: ['q_ventas_mantenimiento_clientes_obtenerpadron_ruc'],
                                                items: [{ RUC: function () { return $(controls.RUC_CLIENTE).val(); } }],
                                                onBefore: function () {
                                                    $.DisplayStatusBar({ message: 'Buscando ruc ...' })
                                                },
                                                onError: function (error) {
                                                    $.CloseStatusBar();
                                                    $.ShowError({ error: error });
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
                                                        alertify.error('RUC no encontrado.')
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
                                    case '00013':
                                        if ($(controls.RUC_CLIENTE).val().length == 8) {
                                            $.GetQuery({
                                                query: ['q_ventas_mantenimiento_clientes_obtenerpadron_dni'],
                                                items: [{ DNI: function () { return $(controls.RUC_CLIENTE).val(); } }],
                                                onBefore: function () {
                                                    $.DisplayStatusBar({ message: 'Buscando dni ...' })
                                                },
                                                onError: function (error) {
                                                    $.CloseStatusBar();
                                                    $.ShowError({ error: error });
                                                },
                                                onReady: function (result) {
                                                    $.CloseStatusBar();
                                                    if (result.length > 0) {
                                                        alertify.success('DNI encontrado.')
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
                                                        alertify.error('DNI no encontrado.')
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
                            }
                        }
                    });
                });


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

                fnObtenerUbigeo();
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
                arrContactosEliminados = [];
                arrDireccionesEliminados = [];
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