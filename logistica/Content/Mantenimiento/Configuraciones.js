require(["jqwidgets", "helper", "extras", "jstree", "fileinput.es"], function () {
    require(["alertify", "moment", "bootbox"], function (alertify, moment, bootbox) {
        alertify.set('notifier', 'position', 'top-center');
        const empresa = $.solver.session.SESSION_EMPRESA;
        let dataLocal = [];
        let currentId = "";
        const tblAlmacen = '#tblAlmacen'
        const tblTipoContacto = '#tblTipoContacto';
        let departamentos = [];
        let provincias = [];
        let distritos = [];
        let establecimientos = [];
        let arrEliminadosTipoContacto = [];
        let arrEliminadosAlmacen = [];
        const objValidarTablas = {
            tables: [
                {
                    table: tblAlmacen,
                    tableText: 'almacén',
                    items: ['NOMBRE_ALMACEN', 'DEPARTAMENTO', 'PROVINCIA', 'DISTRITO'],
                    itemsText: ['Nombre', 'Departamento', 'Provincia', 'Distrito']
                }
            ]
        }
        let estadoButton = false;

        const fnCrearCargaArchivo = function () {
            $("#input-b7").fileinput({
                language: 'es',
                maxFileCount: 1,
                showPreview: false,
                mainClass: "input-group-sm",
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
            fnObtenerImagen('C_ARCHIVO_LOGO', 'img');
            fnCrearCargaArchivo();
        };
        //const cargarChecksServicios = function (servicios) {
        //    $('#SERVICIOS').val(servicios);
        //    var arrServicios = [];
        //    if (servicios != null) {
        //        arrServicios = servicios.split('|');
        //    }
        //    $.GetQuery({
        //        query: ['q_administracion_mantenimiento_clienteregistro_obtenerpaquetes'],
        //        onReady: function (result) {
        //            $('#divchk').html('')
        //            var html = '';
        //            $.each(result, function (i, item) {
        //                html += `   <div class="form-check">
        //                                <input class="form-check-input" ${((arrServicios.filter(x => x == item['C_ROL']).length == 0) ? '' : 'checked')} type="checkbox" id="MOD_${i}" data-id="${item['C_ROL']}" data-desc="${item['DESCRIPCION']}" disabled="disabled">
        //                                <label class="form-check-label" for="MOD_${i}" disabled="disabled">
        //                                    ${item['DESCRIPCION']}
        //                                </label>
        //                            </div>`
        //            });
        //            $('#divchk').html(html);
        //        }
        //    })

        //}
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
        const openForm = function (codigo, title, callback) {
            let _codigo = codigo || '';
            $.GetData({
                title: `<i class="fa fa-file-code-o" aria-hidden="true"></i> ${title}`,
                uriData: `${$.solver.baseUrl}/Mantenimiento/CentroCostoRegistro/`,
                location: 'float',
                type: 'GET',
                isPage: true,
                onReady: function (object, modal) {
                    let _type = 1;
                    let _condition = "";
                    if (_codigo != '') {
                        _type = 2;
                        _condition = `C_UNIDAD_NEGOCIO = '${_codigo}' and C_EMPRESA = '${empresa}'`;
                    };
                    $(object).find('form').ValidForm({
                        type: _type,
                        condition: _condition,
                        table: 'UNIDAD_NEGOCIO',
                        queryDefault: {
                            query: ['editable_centro_costo'],
                            type: [8],
                            items: [{
                                table: 'UNIDAD_NEGOCIO',
                                condition: _condition
                            }]
                        },
                        extras: {
                            C_UNIDAD_NEGOCIO: {
                                action: {
                                    name: 'GetNextId',
                                    args: $.ConvertObjectToArr({
                                        columns: 'C_EMPRESA',
                                        max_length: 5
                                    })
                                }
                            }
                        },
                        onDone: function (form, controls) {
                            if (_type == 1) $(controls.C_UNIDAD_NEGOCIO_REF).val(currentId);
                            $(controls.C_EMPRESA).val(empresa);
                        },
                        onReady: function (result) {
                            $('#padre').html('<div id="html" class="demo"></div >');
                            $(modal).modal('hide');
                            getData();
                        },
                        onError: function (error) {
                            $.CloseStatusBar();
                            $.ShowError({ error: error });
                        },
                    });
                }
            });
        };
        const createNode = function () {
            openForm(null, 'Nuevo centro de costo', function (data) {
                $('#html').jstree().create_node('#' + currentId, {
                    "id": data.codigo,
                    "text": data.nombre,
                }, "last", function () {
                    let is_open = $("#html").jstree("is_open", $("#" + currentId));
                    if (!is_open) $("#html").jstree("open_node", $("#" + currentId));
                });
            });
        };
        const editerNode = function () {
            openForm(currentId, 'Editar centro de costo', function (data) {
                let filter = $.grep(dataLocal, function (n, i) { return n.id == currentId; });
                if (filter.length != 0) filter[0].text = data.nombre;
                $('#html').jstree(true).settings.core.data = dataLocal;
                $('#html').jstree(true).refresh();
            });
        };
        const customMenu = function (node) {
            let items = {
                'new': {
                    'label': 'Nuevo centro de costo',
                    'icon': 'fa fa-plus-circle',
                    'action': function (data) {
                        currentId = node.id;
                        createNode();
                    }
                },
                'update': {
                    'icon': 'fa fa-pencil-square',
                    'label': 'Modificar centro de costo',
                    'action': function (data) {
                        currentId = node.id;
                        editerNode();
                    }
                },
                'delete': {
                    'icon': 'fa fa-trash',
                    'label': 'Eliminar centro de costo',
                    'action': function (data) {
                        let inst = $.jstree.reference(data.reference);
                        let obj = inst.get_node(data.reference);
                        let uid = obj.id;
                        const fnActionEliminar = function () {
                            $.AddPetition({
                                type: '3',
                                table: 'UNIDAD_NEGOCIO',
                                condition: `C_UNIDAD_NEGOCIO = '${uid}' AND C_EMPRESA = '${empresa}'`
                            });
                            $.SendPetition({
                                onBefore: function () {
                                    $.DisplayStatusBar({ message: 'Eliminando centro de costo ...' });
                                },
                                onReady: function () {
                                    $.CloseStatusBar();
                                    alertify.success('El centro de costo fue eliminado correctamente.');
                                    $('#padre').html('<div id="html" class="demo"></div >');
                                    getData();
                                },
                                onError: function () {
                                    $.CloseStatusBar();
                                    alertify.error('No se pudo eliminar el centro de costo.');
                                }
                            });
                        };
                        alertify.confirm('Eliminación de centro de costo', 'Al anular el centro de costo será retirado del sistema. <br />¿Seguro de eliminar el centro de costo?',
                            function () {
                                fnActionEliminar()
                            },
                            function () {
                            }
                        ).set('labels', { ok: 'Si', cancel: 'No' });


                    }
                }
            };
            if (node.id == 'root') {
                delete items.update;
                delete items.delete;
            };
            return items;
        };
        const createTree = function () {
            $('#html').jstree({
                "core": {
                    "check_callback": true,
                    "data": dataLocal,
                    "themes": {
                        "variant": "large"
                    }
                },
                'plugins': ['contextmenu'],
                'contextmenu': {
                    'items': customMenu
                },
            }).on('changed.jstree', function (e, data) {
                if (typeof data.node != 'undefined') {
                    if (typeof data.node.id != 'undefined') currentId = data.node.id;
                }
            }).on('loaded.jstree', function () {
                $("#html").jstree('open_all');
            });;
            setTimeout(function () {
                $("#html").jstree("open_node", $("#00000"));
            }, 500);
        };
        const getData = function () {
            dataLocal = [{
                "id": "000",
                "parent": "#",
                "text": "Centro de costo"
            }];
            $.GetQuery({
                query: ['q_ventas_mantenimiento_centrocosto_obtenercentrocosto_tree'],
                items: [{ C_EMPRESA: empresa }],
                onReady: function (data) {
                    for (let item in data) {
                        dataLocal.push(data[item]);
                    };
                    createTree();
                },
                onError: function (error) {
                    $.CloseStatusBar();
                    $.ShowError({ error: error });
                }
            })
        };

        const cargarTablas = function () {
            const fnClassEditer = function (row, datafield, value, rowdata) {
                if (rowdata.MODO == 1 || rowdata.MODO == 2) return 'editedRow';
            };

            $(tblAlmacen).CreateGrid({
                query: 'tbl_logistica_mantenimiento_configuraciones_listaralmacenes',
                items: { C_EMPRESA: empresa },
                hiddens: ['C_EMPRESA', 'UBIGEO', 'C_ESTABLECIMIENTO'],
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
                    'C_ALMACEN': {
                        text: 'Código',
                        cellclassname: fnClassEditer,
                        width: 80,
                        editable: false
                    },
                    'NOMBRE_ALMACEN': {
                        text: 'Nombre',
                        cellclassname: fnClassEditer,
                        width: 150
                    },
                    'DIRECCION': {
                        text: 'Dirección',
                        cellclassname: fnClassEditer,
                        width: 300
                    },
                    'DEPARTAMENTO': {
                        text: 'Departamento',
                        columntype: 'dropdownlist',
                        cellclassname: fnClassEditer,
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
                                var index = $(tblAlmacen).jqxGrid('getselectedrowindex');
                                $(tblAlmacen).jqxGrid('getrows')[index].PROVINCIA = "";
                                $(tblAlmacen).jqxGrid('getrows')[index].DISTRITO = "";
                            }
                        }
                    },
                    'PROVINCIA': {
                        text: 'Provincia',
                        columntype: 'dropdownlist',
                        cellclassname: fnClassEditer,
                        createeditor: function (row, value, editor) {
                            var index = $(tblAlmacen).jqxGrid('getselectedrowindex');
                            var departamento = $(tblAlmacen).jqxGrid('getrows')[index].DEPARTAMENTO;
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
                            var index = $(tblAlmacen).jqxGrid('getselectedrowindex');
                            var departamento = $(tblAlmacen).jqxGrid('getrows')[index].DEPARTAMENTO;
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
                                var index = $(tblAlmacen).jqxGrid('getselectedrowindex');
                                $(tblAlmacen).jqxGrid('getrows')[index].DISTRITO = "";
                            }
                        }
                    },
                    'DISTRITO': {
                        text: 'Distrito',
                        columntype: 'dropdownlist',
                        cellclassname: fnClassEditer,
                        createeditor: function (row, value, editor) {
                            var index = $(tblAlmacen).jqxGrid('getselectedrowindex');
                            var provincia = $(tblAlmacen).jqxGrid('getrows')[index].PROVINCIA;
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
                            var index = $(tblAlmacen).jqxGrid('getselectedrowindex');
                            var provincia = $(tblAlmacen).jqxGrid('getrows')[index].PROVINCIA;
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
                    'NOMBRE_ESTABLECIMIENTO': {
                        text: 'Establecimiento',
                        columntype: 'dropdownlist',
                        cellclassname: fnClassEditer,
                        createeditor: function (row, value, editor) {
                            var estadoSource =
                            {
                                datatype: "array",
                                datafields: [
                                    { name: 'label', type: 'string' },
                                    { name: 'value', type: 'string' }
                                ],
                                localdata: establecimientos
                            };

                            var myadapter = new $.jqx.dataAdapter(estadoSource, { autoBind: true });

                            editor.jqxDropDownList({ source: myadapter, displayMember: 'label', valueMember: 'value' });
                        },
                        cellendedit: function (row, datafield, columntype, oldvalue, newvalue) {
                            $.each(establecimientos, function (i, v) {
                                if (v.label == newvalue) {
                                    $(tblAlmacen).jqxGrid('getrows')[row].C_ESTABLECIMIENTO = v.value;
                                }
                            });
                        }
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
            $(tblAlmacen).on('bindingcomplete', function () {
                $(tblAlmacen).unbind("cellvaluechanged");
                $(tblAlmacen).on("cellvaluechanged", function (event) {
                    if (event.args.newvalue != event.args.oldvalue) {
                        var row = event.args.rowindex;
                        if ($(tblAlmacen).jqxGrid('getrows')[row].MODO != 1) $(tblAlmacen).jqxGrid('getrows')[row].MODO = 2;
                    }
                });
            });
            $('#btnAgregarAlmacen').click(function () {
                const fila = $(tblAlmacen).jqxGrid('getrows').length;
                var almacen = {
                    _rowNum: fila + 1,
                    MODO: 1,
                    C_EMPRESA: empresa,
                    C_ALMACEN: '',
                    NOMBRE_ALMACEN: '',
                    UBIGEO: '',
                    DIRECCION: '',
                    DEPARTAMENTO: '',
                    PROVINCIA: '',
                    DISTRITO: '',
                    C_ESTABLECIMIENTO: '',
                    NOMBRE_ESTABLECIMIENTO: '',
                    IND_ESTADO: 'Activo'
                };
                $(tblAlmacen).jqxGrid('addrow', null, almacen);
                $(tblAlmacen).jqxGrid('selectrow', fila);
                $(tblAlmacen).jqxGrid('ensurerowvisible', fila);
            });
            $('#btnEliminarAlmacen').click(function () {
                var rows = $(tblAlmacen).jqxGrid('getrows');
                if (rows.length > 0) {
                    var selected = $(tblAlmacen).jqxGrid('getselectedrowindex')
                    if (selected != -1) {
                        if (rows[selected]['C_ALMACEN'] != '') {
                            arrEliminadosAlmacen.push(rows[selected]);
                        }
                        var rowId = $(tblAlmacen).jqxGrid('getrowid', selected);
                        $(tblAlmacen).jqxGrid('deleterow', rowId);
                        if (selected - 1 != -1) {
                            $(tblAlmacen).jqxGrid('selectrow', selected - 1);
                            $(tblAlmacen).jqxGrid('ensurerowvisible', selected - 1);
                        }
                        else {
                            if (rows.length > 0) {
                                $(tblAlmacen).jqxGrid('selectrow', selected);
                                $(tblAlmacen).jqxGrid('ensurerowvisible', selected);
                            }
                        }
                    }
                }
            });

            $(tblTipoContacto).CreateGrid({
                query: 'tbl_logistica_mantenimiento_configuraciones_listartipocontacto',
                items: { C_EMPRESA: $.solver.session.SESSION_EMPRESA },
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
                        width: 250
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
                    pageable: false,
                    rendered: function () { }
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
            };
            $.AddPetition({
                type: 2,
                table: 'EMPRESA',
                condition: `C_EMPRESA = '${empresa}'`,
                items: $.ConvertObjectToArr(objEmpresa)
            });

            //TABLA LOG.ALMACEN
            $.each($(tblAlmacen).jqxGrid('getrows'), function (i, dataAlmacen) {
                var tipo = 1;
                var condicion = '';
                if (dataAlmacen['C_ALMACEN'] == '') tipo = 1;
                else tipo = 2;
                if (tipo == 2) condicion = `C_EMPRESA = '${empresa}' AND C_ALMACEN = '${dataAlmacen['C_ALMACEN']}'`

                let codProvincia = '';
                let codDistrito = '';

                if (dataAlmacen.PROVINCIA != '' && dataAlmacen.PROVINCIA != null && dataAlmacen.DISTRITO != '' && dataAlmacen.DISTRITO != null) {
                    codProvincia = provincias.filter(x => x['label'] == dataAlmacen.PROVINCIA)[0].value;
                    let distritosFilter = distritos.filter(x => x['value'].substring(0, 4) == codProvincia);
                    codDistrito = distritosFilter.filter(x => (x['label'] == dataAlmacen.DISTRITO))[0].value;
                }

                const objAlmacen = {
                    C_EMPRESA: dataAlmacen['C_EMPRESA'],
                    C_ALMACEN: dataAlmacen['C_ALMACEN'],
                    NOMBRE_ALMACEN: dataAlmacen['NOMBRE_ALMACEN'],
                    DIRECCION: dataAlmacen['DIRECCION'],
                    UBIGEO: codDistrito,
                    IND_ESTADO: (dataAlmacen['IND_ESTADO'] == 'Activo' ? '*' : '&'),
                    C_ESTABLECIMIENTO: dataAlmacen['C_ESTABLECIMIENTO']
                };
                const extAlmacen = {
                    C_ALMACEN: {
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
                    table: 'LOG.ALMACEN',
                    condition: condicion,
                    items: $.ConvertObjectToArr(objAlmacen, extAlmacen)
                });
            });
            if (arrEliminadosAlmacen.length > 0) {
                $.each(arrEliminadosAlmacen, function (i, eliminados) {
                    const objEliEst = {
                        C_EMPRESA: eliminados.C_EMPRESA,
                        C_ALMACEN: eliminados.C_ALMACEN,
                        IND_ESTADO: 'E'
                    };
                    $.AddPetition({
                        table: 'LOG.ALMACEN',
                        type: 2,
                        condition: `C_EMPRESA = '${eliminados.C_EMPRESA}' AND C_ALMACEN = '${eliminados['C_ALMACEN']}'`,
                        items: $.ConvertObjectToArr(objEliEst)
                    });
                });
            }

            //TABLA LOG.PROVEEDOR_TIPO_CONTACTO
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

            $.SendPetition({
                onReady: function (result) {
                    $.CloseStatusBar();
                    require(['bootbox', 'alertify'], function (bootbox, alertify) {
                        bootbox.hideAll();
                        alertify.success('Se guardó la información.');
                        obtenerInfoEmpresa();
                        $(tblAlmacen).jqxGrid('updatebounddata');
                        $(tblTipoContacto).jqxGrid('updatebounddata');
                        arrEliminadosAlmacen = [];
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
            query: ['q_ventas_mantenimiento_clientesregistro_listarubigeo', 'q_ventas_mantenimiento_clientesregistro_obtenertipodocumentosserie', 'tbl_ventas_mantenimiento_configuraciones_obtenerestablecimiento'],
            items: [{}, {}, {
                C_EMPRESA: empresa
            }],
            onReady: function (result) {
                const dataUbigeo = result['q_ventas_mantenimiento_clientesregistro_listarubigeo'].result.rows;
                const dataTipoDoc = result['q_ventas_mantenimiento_clientesregistro_obtenertipodocumentosserie'].result.rows;
                const dataEstablecimiento = result['tbl_ventas_mantenimiento_configuraciones_obtenerestablecimiento'].result.rows;
                departamentos = dataUbigeo.filter(x => x['value'].length == 2);
                provincias = dataUbigeo.filter(x => x['value'].length == 4);
                distritos = dataUbigeo.filter(x => x['value'].length == 6);
                documentos = dataTipoDoc;
                obtenerInfoEmpresa();
                getData();
                cargarTablas();

                $.each(dataEstablecimiento, function (i, v) {
                    establecimientos.push({
                        value: v.C_ESTABLECIMIENTO,
                        label: v.NOMBRE_ESTABLECIMIENTO,
                    });
                });
            }
        });

        $('#btnGuardar').click(function () {

            if (!estadoButton) {
                estadoButton = true;
                var validacion = $.solver.fn.validarCondicionesTabla(objValidarTablas);
                if (validacion.estado) {
                    alertify.confirm('Confirmar Acción', '¿Seguro de guardar la información?', actionGuardar, null)
                        .set('labels', { ok: 'Si', cancel: 'No' }).set('defaultFocus', 'ok').set('closable', false);
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
        })

        $('#btnDescargarTipoContacto').click(function () {
            $.solver.fn.fnDescargarTipoContacto();
        });
    });
});