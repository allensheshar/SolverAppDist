require(["jqwidgets", "helper", "extras", "jstree", "fileinput.es"], function () {
    require(["alertify", "moment", "bootbox"], function (alertify, moment, bootbox) {

        alertify.set('notifier', 'position', 'top-center');

        let dataLocal = [];
        let currentId = "";
        let tblClienteCategoria = '#tblClienteCategoria';
        let tblEstablecimiento = '#tblEstablecimiento';
        let tblMetodoPago = '#tblMetodoPago';
        let tblSerie = '#tblSerie';
        let tblCaja = '#tblCaja';
        let tblMesas = '#tblMesa';
        let tblSalon = '#tblSalon';
        let tblCocinas = '#tblCocina';
        let Caja = true;

        let departamentos = [];
        let provincias = [];
        let distritos = [];
        let documentos = [];
        let arrEliminadosCaja = [];
        let arrEliminadosCategoria = [];
        let arrEliminadosMetodoPago = [];
        let arrEliminadosSalon = [];
        let arrEliminadosMesas = [];
        let arrEliminadosCocinas = [];
        let arrEliminadosEstablecimientos = [];
        let establecimientos = [];
        let almacenes = [];
        let impresoras = [];
        let salones = [];
        let estadoButton = false;

        const empresa = $.solver.session.SESSION_EMPRESA;
        const objValidarTablas = {
            tables: [
                {
                    table: tblEstablecimiento,
                    tableText: 'establecimiento',
                    items: ['NOMBRE_ESTABLECIMIENTO', 'DIRECCION', 'DEPARTAMENTO', 'PROVINCIA', 'DISTRITO'],
                    itemsText: ['Nombre', 'Dirección', 'Departamento', 'Provincia', 'Distrito']
                },
                {
                    table: tblClienteCategoria,
                    tableText: 'tipo de clientes',
                    items: ['NOMBRE'],
                    itemsText: ['Nombre']
                },
                {
                    table: tblCaja,
                    tableText: 'caja',
                    items: ['NOMBRE_ESTABLECIMIENTO', 'NOMBRE_CAJA'],
                    itemsText: ['Establecimiento', 'Nombre']
                },
                //{
                //    table: tblMesas,
                //    tableText: 'mesas',
                //    items: ['Salón', 'Nombre de Mesa'],
                //    itemsText: ['Salón', 'Nombre de Mesa']
                //}
            ]
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
        const obtenerInfoEmpresa = function () {
            $.GetQuery({
                query: ['q_ventas_mantenimiento_configuraciones_obtenerdatosempresa'],
                items: [
                    { C_EMPRESA: empresa }
                ],
                onReady: function (result) {

                    const data = result[0];

                    cargarEmpresa(data);
                    cargarConfigDefecto(data);
                    //cargarChecksServicios(data['SERVICIOS']);
                }
            })
        };
        const fnCrearCargaArchivo = function () {
            $("#input-b7").fileinput({
                language: 'es',
                maxFileCount: 1,
                showPreview: false,
                mainClass: "input-group-sm",
                uploadUrl: $.solver.services.files + "/Service/Upload2/App",
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
                $('#' + img).attr('src', $.solver.services.files + 'Service/ViewFile2/' + $('#' + c_archivo).val() + '/App');
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
            $('#CTA_DETRACCION').val(data['CTA_DETRACCION']);
            fnObtenerImagen('C_ARCHIVO_LOGO', 'img');
            fnCrearCargaArchivo();
        };
        const openForm2 = function (codigo, title, callback) {
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
        const openForm = function (codigo, title, callback) {
            let _codigo = codigo || '';
            let _type = 1;
            let _condition = "";
            if (_codigo != '') {
                _type = 2;
                _condition = `C_UNIDAD_NEGOCIO = '${_codigo}' and C_EMPRESA = '${empresa}'`;
            }

            var token = $.CreateToken();
            var dialog = bootbox.dialog({
                title: `<i class="fa fa-file-code-o" aria-hidden="true"></i> ${title}`,
                message: `<div id="${token}"></div>`,
                className: 'modal-search-60',
                onEscape: true
            });

            dialog.init(function () {
                setTimeout(function () {
                    $(dialog).find('.modal-dialog').attr('style', 'max-width: 30% !important;');
                    $(dialog).find('#' + token).html(`
                        <form name="${token}_form" action="#" method="post">
                            <input type="hidden" name="C_EMPRESA" id="C_EMPRESA" />
                            <input type="hidden" name="C_UNIDAD_NEGOCIO" id="C_UNIDAD_NEGOCIO" />
                            <input type="hidden" name="C_UNIDAD_NEGOCIO_REF" id="C_UNIDAD_NEGOCIO_REF" />
                            <input type="hidden" name="IND_ESTADO" id="IND_ESTADO" value="*" />

                            <div class="form-group">
                                <label for="nombre">Nombre centro de costo</label>
                                <input type="text" class="form-control form-control-sm" id="NOMBRE" name="NOMBRE" placeholder="Nombre centro de costo" maxlength="50" required autocomplete="off">
                            </div>
                            <button type="submit" class="btn pull-right btn-danger btn-sm"><i class="fa fa-floppy-o" aria-hidden="true"></i>&nbsp;Guardar</button>
                        </form>
                    `);

                    //Validamos formulario
                    $(dialog).find('form[name=' + token + '_form]').ValidForm({
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
                            setTimeout(function () {
                                $(controls.NOMBRE).trigger('focus')
                            }, 250)
                        },
                        onReady: function () {
                            $('#padre').html('<div id="html" class="demo"></div >');
                            $(dialog).modal('hide');
                            getData();
                        },
                        onError: function (error) {
                            $.CloseStatusBar();
                            $.ShowError({ error: error });
                        },
                    });
                }, 150);
                $('.bootbox .modal-dialog').draggable({
                    handle: '.modal-header'
                });
                $('.bootbox .modal-header').css('cursor', 'move');
            });
        }
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
                        alertify.confirm('Eliminación de centro de costo', 'Al eliminar el centro de costo será retirado del sistema. <br />¿Seguro de eliminar el centro de costo?',
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
        const cargarTablas = function () {

            const fnClassEditer = function (row, datafield, value, rowdata) {
                if (rowdata.MODO == 1 || rowdata.MODO == 2) return 'editedRow';
            };
            const fnEditarSeries = function (indice) {
                var row = $(tblEstablecimiento).jqxGrid('getrows')[indice];

                $.GetData({
                    title: `<i class="fa fa-file-code-o" aria-hidden="true"></i> Configuración de Series`,
                    uriData: `${$.solver.baseUrl}/Mantenimiento/ConfiguracionSerie/`,
                    location: 'float',
                    type: 'GET',
                    isPage: true,
                    onReady: function (object, modal) {

                        $(modal).find('.modal-dialog').css({ 'max-width': '40%' });

                        $(object).find(tblSerie).CreateGrid({
                            query: 'tbl_ventas_mantenimiento_configuraciones_mascaraserie',
                            hiddens: ['C_EMPRESA', 'C_ESTABLECIMIENTO'],
                            columns: {
                                'C_SERIE': {
                                    text: 'Código',
                                    width: 60,
                                    editable: false
                                },
                                'TIPO_DOC': {
                                    text: 'Tipo de Documento',
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
                                            localdata: documentos
                                        };
                                        var myadapter = new $.jqx.dataAdapter(estadoSource, { autoBind: true });
                                        editor.jqxDropDownList({ source: myadapter, displayMember: 'label', valueMember: 'value' });
                                    },
                                    cellendedit: function (row, datafield, columntype, oldvalue, newvalue) { }
                                },
                                'SERIE': {
                                    text: 'Serie',
                                    width: 60,
                                    validation: function (cell, value) {
                                        boolValidarCambiosSerie = true;
                                        let isnum = /^\d+$/.test(value);
                                        if (!isnum) {
                                            return { result: false, message: "Solo puede ingresar números" };
                                        }
                                        if (value.length > 3) {
                                            return { result: false, message: "Máximo de dígitos: 3" };
                                        }
                                        if (value.length < 3) {
                                            return { result: false, message: "Minimo de dígitos: 3" };
                                        }
                                        return true;
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
                                },
                            },
                            config: {
                                virtualmode: false,
                                height: 400,
                                pageSize: 100,
                                columnsresize: true,
                                editable: true,
                                sortable: false,
                                pageable: false
                            }
                        });

                        $(object).find(tblSerie).on('bindingcomplete', function () {
                            // Obtengo la info dependiendo si es editar o nuevo
                            if (row['JSON_Serie'] == undefined) {
                                $.GetQuery({
                                    query: ['q_ventas_mantenimiento_configuraciones_obtenerseries'],
                                    items: [{
                                        C_EMPRESA: empresa,
                                        C_ESTABLECIMIENTO: row['C_ESTABLECIMIENTO']
                                    }],
                                    onReady: function (result) {
                                        if (result.length > 0) {
                                            var arrData = [];
                                            $.each(result, function (i, v) {
                                                var fila = {
                                                    C_EMPRESA: v['C_EMPRESA'],
                                                    C_SERIE: v['C_SERIE'],
                                                    C_ESTABLECIMIENTO: v['C_ESTABLECIMIENTO'],
                                                    TIPO_DOC: v['TIPO_DOC'],
                                                    SERIE: v['SERIE'],
                                                    IND_ESTADO: v['IND_ESTADO']
                                                }
                                                arrData.push(fila)
                                            });
                                            $(object).find(tblSerie).jqxGrid('addrow', null, arrData)
                                        }
                                    }
                                });
                            }
                            else {
                                var lstSeries = JSON.parse(row['JSON_Serie']);
                                var arrData = [];
                                $.each(lstSeries, function (i, v) {
                                    var fila = {
                                        C_EMPRESA: v['C_EMPRESA'],
                                        C_SERIE: v['C_SERIE'],
                                        C_ESTABLECIMIENTO: v['C_ESTABLECIMIENTO'],
                                        TIPO_DOC: v['TIPO_DOC'],
                                        SERIE: v['SERIE'],
                                        IND_ESTADO: v['IND_ESTADO']
                                    }
                                    arrData.push(fila)
                                });
                                $(object).find(tblSerie).jqxGrid('addrow', null, arrData)
                            }

                            $(object).find('#btnAgregarSerie').click(function () {
                                const fila = $(object).find(tblSerie).jqxGrid('getrows').length;
                                var serie = {
                                    _rowNum: fila + 1,
                                    MODO: 1,
                                    C_EMPRESA: empresa,
                                    C_SERIE: '',
                                    C_ESTABLECIMIENTO: row['C_ESTABLECIMIENTO'],
                                    TIPO_DOC: '',
                                    SERIE: '',
                                    IND_ESTADO: 'Activo'
                                };
                                $(object).find(tblSerie).jqxGrid('addrow', null, serie);
                                $(object).find(tblSerie).jqxGrid('selectrow', fila);
                                $(object).find(tblSerie).jqxGrid('ensurerowvisible', fila);
                            });
                        });

                        $(object).find('#btnGuardarSerie').click(function () {
                            var rows = $(object).find(tblSerie).jqxGrid('getrows');

                            if (rows.filter(x => x.TIPO_DOC == '' || x.SERIE == '').length > 0) {
                                fnObtenerAlerta('Por favor ingrese todos los campos');
                            }
                            else {
                                $.GetQuery({
                                    query: ['q_ventas_mantenimiento_configuraciones_obtenerlistaseries'],
                                    items: [{ C_EMPRESA: empresa }],
                                    onError: function (error) {
                                        $.CloseStatusBar();
                                        $.ShowError({ error });
                                    },
                                    onReady: function (result) {
                                        var establecimientos = $(tblEstablecimiento).jqxGrid('getrows');
                                        var encontro = false;

                                        // Asignar series a establecimientos que aun no se ha editado ninguna serie
                                        $.each(establecimientos, function (i, establecimiento) {
                                            if (establecimiento.JSON_Serie == undefined) {
                                                establecimiento.SERIES = (result.filter(x => x['C_ESTABLECIMIENTO'] == establecimiento.C_ESTABLECIMIENTO));
                                            }
                                        });

                                        $.each($(object).find(tblSerie).jqxGrid('getrows'), function (i, v) {
                                            var series = $(object).find(tblSerie).jqxGrid('getrows').filter(x => x.TIPO_DOC.substring(0, 1) + x.SERIE == v.TIPO_DOC.substring(0, 1) + v.SERIE);
                                            if (series.length > 1) {
                                                fnObtenerAlerta('La serie ' + series[0].TIPO_DOC.substring(0, 1) + series[0].SERIE + ' no se puede repetir');
                                                encontro = true;
                                                return false;
                                            }
                                        });

                                        $.each($(object).find(tblSerie).jqxGrid('getrows'), function (i, v) {
                                            if (row['C_ESTABLECIMIENTO'] == '') {
                                                $.each(establecimientos, function (_, establecimiento) {
                                                    if (establecimiento.JSON_Serie == undefined) {
                                                        var series = establecimiento.SERIES.filter(x => x.SERIE_COMPLETA == v.TIPO_DOC.substring(0, 1) + v.SERIE);
                                                        if (series.length > 0) {
                                                            fnObtenerAlerta('La serie ' + series[0].SERIE_COMPLETA + ' está siendo usada en otro establecimiento');
                                                            encontro = true;
                                                            return false;
                                                        }
                                                    }
                                                    else {
                                                        if (row['_rowNum'] != establecimiento['_rowNum']) {
                                                            var series = (JSON.parse(establecimiento.JSON_Serie)).filter(x => x.TIPO_DOC.substring(0, 1) + x.SERIE == v.TIPO_DOC.substring(0, 1) + v.SERIE);

                                                            if (series.length > 0) {
                                                                fnObtenerAlerta('La serie ' + series[0].TIPO_DOC.substring(0, 1) + series[0].SERIE + ' está siendo usada en otro establecimiento');
                                                                encontro = true;
                                                                return false;
                                                            }
                                                        }
                                                    }
                                                });
                                            }
                                            else {
                                                $.each(establecimientos, function (_, establecimiento) {
                                                    if (establecimiento.JSON_Serie == undefined) {
                                                        var series = establecimiento.SERIES.filter(x => x.SERIE_COMPLETA == v.TIPO_DOC.substring(0, 1) + v.SERIE && x.C_ESTABLECIMIENTO != v.C_ESTABLECIMIENTO);
                                                        if (series.length > 0) {
                                                            fnObtenerAlerta('La serie ' + series[0].SERIE_COMPLETA + ' está siendo usada en otro establecimiento');
                                                            encontro = true;
                                                            return false;
                                                        }
                                                    }
                                                    else {
                                                        if (row['C_ESTABLECIMIENTO'] != establecimiento['C_ESTABLECIMIENTO']) {
                                                            var series = (JSON.parse(establecimiento.JSON_Serie)).filter(x => x.TIPO_DOC.substring(0, 1) + x.SERIE == v.TIPO_DOC.substring(0, 1) + v.SERIE);

                                                            if (series.length > 0) {
                                                                fnObtenerAlerta('La serie ' + series[0].TIPO_DOC.substring(0, 1) + series[0].SERIE + ' está siendo usada en otro establecimiento');
                                                                encontro = true;
                                                                return false;
                                                            }
                                                        }
                                                    }
                                                });
                                            }
                                        });

                                        if (!encontro) {
                                            var JSON_Serie = JSON.stringify($(object).find(tblSerie).jqxGrid('getrows'));
                                            $(tblEstablecimiento).jqxGrid('getrows')[indice]['JSON_Serie'] = JSON_Serie;
                                            boolValidarCambiosSerie = false;
                                            $(modal).modal('hide');
                                        }
                                    }
                                })
                            }
                        });

                    }
                });
            };

            $.GetQuery({
                query: ['q_pdv_mantenimiento_configuraciones_obtenerestablecimientos_2', 'q_pdv_mantenimiento_configuraciones_impresoras', 'q_pdv_mantenimiento_configuraciones_almacenes', 'q_pdv_mantenimiento_configuraciones_salones'],
                items: [
                    {
                        C_EMPRESA: function () { return empresa; },
                    },
                    {
                        C_EMPRESA: function () { return empresa; },
                    },
                    {
                        C_EMPRESA: function () { return empresa; },
                    },
                    {
                        C_EMPRESA: function () { return empresa; },
                    },
                ],
                onReady: function (result) {
                    establecimientos = result['q_pdv_mantenimiento_configuraciones_obtenerestablecimientos_2'].result.rows.filter(x => x['value'].length == 3);
                    impresoras = result['q_pdv_mantenimiento_configuraciones_impresoras'].result.rows;
                    almacenes = result['q_pdv_mantenimiento_configuraciones_almacenes'].result.rows;
                    salones = result['q_pdv_mantenimiento_configuraciones_salones'].result.rows;
                },
                onError: function (error) {
                    console.log(error);
                }
            });
            $.GetQuery({
                query: ['tbl_ventas_mantenimiento_configuraciones_obtenerestablecimiento'],
                items: [{
                    C_EMPRESA: function () { return empresa; }
                }],
                onReady: function (result) {
                    if (result.length != '') {
                        Caja = true;
                        $('#caja-tab').css('display', 'block');
                    }
                    else {
                        Caja = false;
                    }
                }
            });

            //categoria de clientes
            $(tblClienteCategoria).CreateGrid({
                query: 'tbl_ventas_mantenimiento_configuraciones_obtenerclientecategoria',
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
                    'C_CLIENTE_CATEGORIA': {
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
                    'DESCRIPCION': {
                        text: 'Descripción',
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
                    virtualmode: false,
                    height: 600,
                    pageSize: 100,
                    columnsresize: true,
                    editable: true,
                    sortable: false,
                    pageable: false
                }
            });
            $(tblClienteCategoria).on('bindingcomplete', function () {
                $(tblClienteCategoria).unbind("cellvaluechanged");
                $(tblClienteCategoria).on("cellvaluechanged", function (event) {
                    if (event.args.newvalue != event.args.oldvalue) {
                        var row = event.args.rowindex;
                        if ($(tblClienteCategoria).jqxGrid('getrows')[row].MODO != 1) $(tblClienteCategoria).jqxGrid('getrows')[row].MODO = 2;
                    }
                });
            });
            $('#btnAgregarCategoria').click(function () {
                const fila = $(tblClienteCategoria).jqxGrid('getrows').length;
                var clienteCategoria = {
                    _rowNum: fila + 1,
                    MODO: 1,
                    C_EMPRESA: empresa,
                    C_CLIENTE_CATEGORIA: '',
                    NOMBRE: '',
                    DESCRIPCION: '',
                    IND_ESTADO: 'Activo'
                };
                $(tblClienteCategoria).jqxGrid('addrow', null, clienteCategoria);
                $(tblClienteCategoria).jqxGrid('selectrow', fila);
                $(tblClienteCategoria).jqxGrid('ensurerowvisible', fila);
            });
            $('#btnEliminarCategoria').click(function () {
                var rows = $(tblClienteCategoria).jqxGrid('getrows');
                if (rows.length > 0) {
                    var selected = $(tblClienteCategoria).jqxGrid('getselectedrowindex')
                    if (selected != -1) {
                        if (rows[selected]['C_CLIENTE_CATEGORIA'] != '') {
                            arrEliminadosCategoria.push(rows[selected]);
                        }
                        var rowId = $(tblClienteCategoria).jqxGrid('getrowid', selected);
                        $(tblClienteCategoria).jqxGrid('deleterow', rowId);
                        if (selected - 1 != -1) {
                            $(tblClienteCategoria).jqxGrid('selectrow', selected - 1);
                            $(tblClienteCategoria).jqxGrid('ensurerowvisible', selected - 1);
                        }
                        else {
                            if (rows.length > 0) {
                                $(tblClienteCategoria).jqxGrid('selectrow', selected);
                                $(tblClienteCategoria).jqxGrid('ensurerowvisible', selected);
                            }
                        }
                    }
                }
            });

            //cajas
            $(tblCaja).CreateGrid({
                query: 'tbl_puntoventa_mantenimiento_configuraciones_listarcajas',
                items: { C_EMPRESA: empresa },
                hiddens: ['C_EMPRESA', 'C_ESTABLECIMIENTO', 'C_IMPRESORA', 'C_ALMACEN'],
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
                    'C_CAJA': {
                        text: 'Código',
                        cellclassname: fnClassEditer,
                        width: 80,
                        cellsAlign: 'center',
                        editable: false
                    },
                    'NOMBRE_CAJA': {
                        text: 'Nombre caja',
                        cellclassname: fnClassEditer,
                        width: 100,
                        editable: true
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
                                    $(tblCaja).jqxGrid('getrows')[row].C_ESTABLECIMIENTO = v.value;
                                }
                            });
                        }
                    },
                    'NOMBRE_ALMACEN': {
                        text: 'Almacen por defecto',
                        columntype: 'dropdownlist',
                        width: 200,
                        cellclassname: fnClassEditer,
                        createeditor: function (row, value, editor) {
                            var estadoSource =
                            {
                                datatype: "array",
                                datafields: [
                                    { name: 'label', type: 'string' },
                                    { name: 'value', type: 'string' }
                                ],
                                localdata: almacenes
                            };

                            var myadapter = new $.jqx.dataAdapter(estadoSource, { autoBind: true });

                            editor.jqxDropDownList({ source: myadapter, displayMember: 'label', valueMember: 'value' });
                        },
                        cellendedit: function (row, datafield, columntype, oldvalue, newvalue) {
                            $.each(almacenes, function (i, v) {
                                if (v.label == newvalue) {
                                    $(tblCaja).jqxGrid('getrows')[row].C_ALMACEN = v.value;
                                }
                            });
                        }
                    },
                    'NOMBRE_IMPRESORA': {
                        text: 'Impresora por defecto',
                        columntype: 'dropdownlist',
                        width: 400,
                        cellclassname: fnClassEditer,
                        createeditor: function (row, value, editor) {
                            var estadoSource =
                            {
                                datatype: "array",
                                datafields: [
                                    { name: 'label', type: 'string' },
                                    { name: 'value', type: 'string' }
                                ],
                                localdata: impresoras
                            };

                            var myadapter = new $.jqx.dataAdapter(estadoSource, { autoBind: true });

                            editor.jqxDropDownList({ source: myadapter, displayMember: 'label', valueMember: 'value' });
                        },
                        cellendedit: function (row, datafield, columntype, oldvalue, newvalue) {
                            $.each(impresoras, function (i, v) {
                                if (v.label == newvalue) {
                                    $(tblCaja).jqxGrid('getrows')[row].C_IMPRESORA = v.value;
                                }
                            });
                        }
                    },
                    'IND_IMPRIME_COMANDA': {
                        text: 'Imprime Comanda?',
                        columntype: 'dropdownlist',
                        createeditor: function (row, value, editor) {
                            const estados = [
                                { value: "*", label: "SI" },
                                { value: "&", label: "NO" }
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
                        width: 150,
                        cellsAlign: 'center'
                    },
                },
                config: {
                    virtualmode: false,
                    height: 600,
                    pageSize: 100,
                    columnsresize: true,
                    editable: true,
                    sortable: false,
                    pageable: false
                }
            });
            $(tblCaja).on('bindingcomplete', function () {
                $(tblCaja).unbind("cellvaluechanged");
                $(tblCaja).on("cellvaluechanged", function (event) {
                    var args = event.args;
                    var datafield = event.args.datafield;
                    var rowBoundIndex = args.rowindex;
                    var value = args.newvalue;
                    var oldvalue = args.oldvalue;

                    if (event.args.newvalue != event.args.oldvalue) {
                        var row = event.args.rowindex;
                        if ($(tblCaja).jqxGrid('getrows')[row].MODO != 1) $(tblCaja).jqxGrid('getrows')[row].MODO = 2;
                    }

                });
            });
            $('#btnAgregarCaja').click(function () {
                const fila = $(tblCaja).jqxGrid('getrows').length;
                var caja = {
                    _rowNum: fila + 1,
                    MODO: 1,
                    C_EMPRESA: empresa,
                    C_CAJA: '',
                    NOMBRE_CAJA: '',
                    C_ESTABLECIMIENTO: '',
                    NOMBRE_ESTABLECIMIENTO: '',
                    C_ALMACEN: '',
                    NOMBRE_ALMACEN: '',
                    C_IMPRESORA: '',
                    NOMBRE_IMPRESORA: '',
                    IND_IMPRIME_COMANDA: 'NO'
                };
                $(tblCaja).jqxGrid('addrow', null, caja);
                $(tblCaja).jqxGrid('selectrow', fila);
                $(tblCaja).jqxGrid('ensurerowvisible', fila);
            });
            $('#btnEliminarCaja').click(function () {
                var rows = $(tblCaja).jqxGrid('getrows');
                if (rows.length > 0) {
                    var selected = $(tblCaja).jqxGrid('getselectedrowindex')
                    if (selected != -1) {
                        if (rows[selected]['C_CAJA'] != '') {
                            arrEliminadosCaja.push(rows[selected]);
                        }
                        var rowId = $(tblCaja).jqxGrid('getrowid', selected);
                        $(tblCaja).jqxGrid('deleterow', rowId);
                        if (selected - 1 != -1) {
                            $(tblCaja).jqxGrid('selectrow', selected - 1);
                            $(tblCaja).jqxGrid('ensurerowvisible', selected - 1);
                        }
                        else {
                            if (rows.length > 0) {
                                $(tblCaja).jqxGrid('selectrow', selected);
                                $(tblCaja).jqxGrid('ensurerowvisible', selected);
                            }
                        }
                    }
                }
            });

            //establecimientos y series
            $(tblEstablecimiento).CreateGrid({
                query: 'tbl_ventas_mantenimiento_configuraciones_obtenerestablecimiento',
                items: { C_EMPRESA: empresa },
                hiddens: ['C_EMPRESA', 'UBIGEO', 'C_IMPRESORA', 'NOMBRE_IMPRESORA'],
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
                    'C_ESTABLECIMIENTO': {
                        text: 'Código',
                        cellclassname: fnClassEditer,
                        width: 80,
                        editable: false
                    },
                    'NOMBRE_ESTABLECIMIENTO': {
                        text: 'Nombre',
                        cellclassname: fnClassEditer,
                        width: 150
                    },
                    'DIRECCION': {
                        text: 'Dirección',
                        cellclassname: fnClassEditer,
                        width: 250
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
                                var index = $(tblEstablecimiento).jqxGrid('getselectedrowindex');
                                $(tblEstablecimiento).jqxGrid('getrows')[index].PROVINCIA = "";
                                $(tblEstablecimiento).jqxGrid('getrows')[index].DISTRITO = "";
                            }
                        }
                    },
                    'PROVINCIA': {
                        text: 'Provincia',
                        columntype: 'dropdownlist',
                        cellclassname: fnClassEditer,
                        createeditor: function (row, value, editor) {
                            var index = $(tblEstablecimiento).jqxGrid('getselectedrowindex');
                            var departamento = $(tblEstablecimiento).jqxGrid('getrows')[index].DEPARTAMENTO;
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
                            var index = $(tblEstablecimiento).jqxGrid('getselectedrowindex');
                            var departamento = $(tblEstablecimiento).jqxGrid('getrows')[index].DEPARTAMENTO;
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
                                var index = $(tblEstablecimiento).jqxGrid('getselectedrowindex');
                                $(tblEstablecimiento).jqxGrid('getrows')[index].DISTRITO = "";
                            }
                        }
                    },
                    'DISTRITO': {
                        text: 'Distrito',
                        columntype: 'dropdownlist',
                        cellclassname: fnClassEditer,
                        createeditor: function (row, value, editor) {
                            var index = $(tblEstablecimiento).jqxGrid('getselectedrowindex');
                            var provincia = $(tblEstablecimiento).jqxGrid('getrows')[index].PROVINCIA;
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
                            var index = $(tblEstablecimiento).jqxGrid('getselectedrowindex');
                            var provincia = $(tblEstablecimiento).jqxGrid('getrows')[index].PROVINCIA;
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
                    'SERIES': {
                        text: 'Series',
                        width: 100,
                        createwidget: function (row, column, value, htmlElement) {
                            $(tblEstablecimiento).jqxGrid('refresh');
                        },
                        initwidget: function (rowIndex, column, value, htmlElement) {

                            $(htmlElement).html('');
                            $(htmlElement).addClass('jqx-grid-cell-middle-align');
                            $(htmlElement).addClass('mt-1');

                            let _btnEditar;
                            _btnEditar = $(`<a id="editar" style="cursor: pointer;" class="jqx-grid-widget">&nbsp;Editar</a>`);
                            $(htmlElement).append(_btnEditar);
                            $(htmlElement).find('a#editar').unbind('click');
                            $(htmlElement).find('a#editar').click(function () {
                                fnEditarSeries(rowIndex);
                            });
                        },
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
                    pageSize: 100,
                    columnsresize: true,
                    editable: true,
                    sortable: false,
                    pageable: false
                }
            });
            $(tblEstablecimiento).on('bindingcomplete', function () {
                $(tblEstablecimiento).unbind("cellvaluechanged");
                $(tblEstablecimiento).on("cellvaluechanged", function (event) {
                    if (event.args.newvalue != event.args.oldvalue) {
                        var row = event.args.rowindex;
                        if ($(tblEstablecimiento).jqxGrid('getrows')[row].MODO != 1) $(tblEstablecimiento).jqxGrid('getrows')[row].MODO = 2;
                    }
                });
            });
            $('#btnAgregarEstablecimiento').click(function () {
                const fila = $(tblEstablecimiento).jqxGrid('getrows').length;
                var establecimiento = {
                    _rowNum: fila + 1,
                    MODO: 1,
                    C_EMPRESA: empresa,
                    C_ESTABLECIMIENTO: '',
                    NOMBRE_ESTABLECIMIENTO: '',
                    UBIGEO: '',
                    DIRECCION: '',
                    DEPARTAMENTO: '',
                    PROVINCIA: '',
                    DISTRITO: '',
                    IND_ESTADO: 'Activo'
                };
                $(tblEstablecimiento).jqxGrid('addrow', null, establecimiento);
                $(tblEstablecimiento).jqxGrid('selectrow', fila);
                $(tblEstablecimiento).jqxGrid('ensurerowvisible', fila);
            });
            $('#btnEliminarEstablecimiento').click(function () {
                var rows = $(tblEstablecimiento).jqxGrid('getrows');
                if (rows.length > 0) {
                    var selected = $(tblEstablecimiento).jqxGrid('getselectedrowindex')
                    if (selected != -1) {
                        if (rows[selected]['C_ESTABLECIMIENTO'] != '') {
                            arrEliminadosEstablecimientos.push(rows[selected]);
                        }
                        var rowId = $(tblEstablecimiento).jqxGrid('getrowid', selected);
                        $(tblEstablecimiento).jqxGrid('deleterow', rowId);
                        if (selected - 1 != -1) {
                            $(tblEstablecimiento).jqxGrid('selectrow', selected - 1);
                            $(tblEstablecimiento).jqxGrid('ensurerowvisible', selected - 1);
                        }
                        else {
                            if (rows.length > 0) {
                                $(tblEstablecimiento).jqxGrid('selectrow', selected);
                                $(tblEstablecimiento).jqxGrid('ensurerowvisible', selected);
                            }
                        }
                    }
                }
            });

            //metodos de pago
            $(tblMetodoPago).CreateGrid({
                query: 'tbl_caja_mantenimiento_metodopago_listametodos',
                items: { C_EMPRESA: empresa },
                hiddens: ['C_EMPRESA', 'C_METODO_PAGO'],
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
                    //'C_METODO_PAGO': {
                    //    text: 'Código',
                    //    width: 50
                    //},
                    'NOMBRE_METODO_PAGO': {
                        text: 'Nombre del Método de Pago',
                        width: 250,
                        cellclassname: fnClassEditer
                    },
                    'IND_DEFECTO': {
                        text: 'Defecto',
                        columntype: 'checkbox',
                        width: 67,
                        cellclassname: fnClassEditer,
                        columngroup: 'comportamiento'
                    },
                    'IND_EFECTIVO': {
                        text: 'Efectivo',
                        columntype: 'checkbox',
                        width: 67,
                        cellclassname: fnClassEditer,
                        columngroup: 'comportamiento'
                    },
                    'IND_TARJETA': {
                        text: 'Tarjetas',
                        columntype: 'checkbox',
                        width: 67,
                        cellclassname: fnClassEditer,
                        columngroup: 'comportamiento'
                    },
                    'IND_CREDITO': {
                        text: 'Crédito',
                        columntype: 'checkbox',
                        width: 67,
                        cellclassname: fnClassEditer,
                        columngroup: 'comportamiento'
                    },
                    'IND_BANCOS': {
                        text: 'Bancos',
                        columntype: 'checkbox',
                        width: 67,
                        cellclassname: fnClassEditer,
                        columngroup: 'comportamiento'
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
                    columngroups: [
                        { text: 'Comportamiento en Caja', align: 'center', name: 'comportamiento' },
                    ],
                    virtualmode: false,
                    height: 600,
                    pageSize: 100,
                    columnsresize: true,
                    editable: true,
                    sortable: false,
                    pageable: false
                }
            });
            $('#btnAgregarMetodoPago').click(function () {
                const fila = $(tblMetodoPago).jqxGrid('getrows').length;
                var metodoPago = {
                    _rowNum: fila + 1,
                    MODO: 1,
                    C_EMPRESA: empresa,
                    C_METODO_PAGO: '',
                    NOMBRE_METODO_PAGO: '',
                    IND_EFECTIVO: false,
                    IND_TARJETA: false,
                    IND_CREDITO: false,
                    IND_BANCOS: false,
                    IND_DEFECTO: false,
                    IND_ESTADO: 'Activo'
                };
                $(tblMetodoPago).jqxGrid('addrow', null, metodoPago);
                $(tblMetodoPago).jqxGrid('selectrow', fila);
                $(tblMetodoPago).jqxGrid('ensurerowvisible', fila);
            });
            $('#btnEliminarMetodoPago').click(function () {
                var rows = $(tblMetodoPago).jqxGrid('getrows');
                if (rows.length > 0) {
                    var selected = $(tblMetodoPago).jqxGrid('getselectedrowindex')
                    if (selected != -1) {
                        if (rows[selected]['C_METODO_PAGO'] != '') {
                            arrEliminadosMetodoPago.push(rows[selected]);
                        };
                        var rowId = $(tblMetodoPago).jqxGrid('getrowid', selected);
                        $(tblMetodoPago).jqxGrid('deleterow', rowId);
                        if (selected - 1 != -1) {
                            $(tblMetodoPago).jqxGrid('selectrow', selected - 1);
                            $(tblMetodoPago).jqxGrid('ensurerowvisible', selected - 1);
                        }
                        else {
                            if (rows.length > 0) {
                                $(tblMetodoPago).jqxGrid('selectrow', selected);
                                $(tblMetodoPago).jqxGrid('ensurerowvisible', selected);
                            }
                        }
                    }
                }
            });

            //listado de salones
            $(tblSalon).CreateGrid({
                query: 'tbl_rest_mantenimiento_lista_salon',
                items: { C_EMPRESA: empresa },
                hiddens: ['C_EMPRESA', 'C_SALON'],
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
                    'NOMBRE': {
                        text: 'Nombre',
                        width: 300,
                        cellclassname: fnClassEditer
                    },
                    'IND_DEFECTO': {
                        text: 'Defecto',
                        width: 100,
                        columntype: 'checkbox',
                    },
                    'IND_CREAR_MESA': {
                        text: 'Crear Mesa',
                        width: 100,
                        columntype: 'checkbox',
                    },
                    'IND_DELIVERY': {
                        text: 'Delivery',
                        width: 100,
                        columntype: 'checkbox',
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
                    pageSize: 100,
                    columnsresize: true,
                    editable: true,
                    sortable: false,
                    pageable: false
                }
            });
            $(tblSalon).on('cellvaluechanged', function (event) {
                var args = event.args;
                var datafield = args.datafield;
                var rowIndex = args.rowindex;
                var value = args.newvalue;

                if (datafield == 'IND_DEFECTO') {
                    var rows = $(tblSalon).jqxGrid('getrows')
                    for (var i = 0; i < rows.length; i++) {
                        if (i != rowIndex) {
                            $(tblSalon).jqxGrid('getrows')[i].IND_DEFECTO = false;
                        }
                    }
                    $(tblSalon).jqxGrid('refresh')
                }
            });
            $('#btnAgregarSalon').click(function () {
                const fila = $(tblSalon).jqxGrid('getrows').length;
                var mesa = {
                    _rowNum: fila + 1,
                    MODO: 1,
                    C_EMPRESA: empresa,
                    C_SALON: '',
                    NOMBRE: '',
                    IND_DEFECTO: false,
                    IND_CREAR_MESA: false,
                    IND_DELIVERY: false,
                    IND_ESTADO: 'Activo'
                };
                $(tblSalon).jqxGrid('addrow', null, mesa);
                $(tblSalon).jqxGrid('selectrow', fila);
                $(tblSalon).jqxGrid('ensurerowvisible', fila);
            });
            $('#btnEliminarSalon').click(function () {
                var rows = $(tblSalon).jqxGrid('getrows');
                if (rows.length > 0) {
                    var selected = $(tblSalon).jqxGrid('getselectedrowindex')
                    if (selected != -1) {
                        if (rows[selected]['Codigo'] != '') {
                            arrEliminadosSalon.push(rows[selected]);
                        };
                        var rowId = $(tblSalon).jqxGrid('getrowid', selected);
                        $(tblSalon).jqxGrid('deleterow', rowId);
                        if (selected - 1 != -1) {
                            $(tblSalon).jqxGrid('selectrow', selected - 1);
                            $(tblSalon).jqxGrid('ensurerowvisible', selected - 1);
                        }
                        else {
                            if (rows.length > 0) {
                                $(tblSalon).jqxGrid('selectrow', selected);
                                $(tblSalon).jqxGrid('ensurerowvisible', selected);
                            }
                        }
                    }
                }
            });

            //listado de mesas
            $(tblMesas).CreateGrid({
                query: 'tbl_rest_mantenimiento_lista_mesas',
                items: { C_EMPRESA: empresa },
                hiddens: ['C_EMPRESA', 'C_ESTABLECIMIENTO', 'Codigo', 'C_SALON'],
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
                    'NOMBRE_ESTABLECIMIENTO': {
                        width: 300,
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
                                    $(tblMesas).jqxGrid('getrows')[row].C_ESTABLECIMIENTO = v.value;
                                }
                            });
                        }
                    },
                    'Salón': {
                        width: 300,
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
                                localdata: salones
                            };

                            var myadapter = new $.jqx.dataAdapter(estadoSource, { autoBind: true });

                            editor.jqxDropDownList({ source: myadapter, displayMember: 'label', valueMember: 'value' });
                        },
                        cellendedit: function (row, datafield, columntype, oldvalue, newvalue) {
                            $.each(salones, function (i, v) {
                                if (v.label == newvalue) {
                                    $(tblMesas).jqxGrid('getrows')[row].C_SALON = v.value;
                                }
                            });
                        }
                    },
                    'Nombre de Mesa': {
                        width: 300,
                        cellclassname: fnClassEditer
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
                    pageSize: 100,
                    columnsresize: true,
                    editable: true,
                    sortable: false,
                    pageable: false
                }
            });
            
            $('#btnAgregarMesa').click(function () {
                const fila = $(tblMesas).jqxGrid('getrows').length;
                var mesa = {
                    _rowNum: fila + 1,
                    MODO: 1,
                    C_EMPRESA: empresa,
                    C_ESTABLECIMIENTO: '',
                    NOMBRE_ESTABLECIMIENTO: '',
                    'Codigo': '',
                    'Nombre de Mesa': '',
                    IND_ESTADO: 'Activo'
                };
                $(tblMesas).jqxGrid('addrow', null, mesa);
                $(tblMesas).jqxGrid('selectrow', fila);
                $(tblMesas).jqxGrid('ensurerowvisible', fila);
            });
            $('#btnEliminarMesa').click(function () {
                var rows = $(tblMesas).jqxGrid('getrows');
                if (rows.length > 0) {
                    var selected = $(tblMesas).jqxGrid('getselectedrowindex')
                    if (selected != -1) {
                        if (rows[selected]['Codigo'] != '') {
                            arrEliminadosMesas.push(rows[selected]);
                        };
                        var rowId = $(tblMesas).jqxGrid('getrowid', selected);
                        $(tblMesas).jqxGrid('deleterow', rowId);
                        if (selected - 1 != -1) {
                            $(tblMesas).jqxGrid('selectrow', selected - 1);
                            $(tblMesas).jqxGrid('ensurerowvisible', selected - 1);
                        }
                        else {
                            if (rows.length > 0) {
                                $(tblMesas).jqxGrid('selectrow', selected);
                                $(tblMesas).jqxGrid('ensurerowvisible', selected);
                            }
                        }
                    }
                }
            });

            //listado de cocinas
            $(tblCocinas).CreateGrid({
                query: 'tbl_rest_mantenimiento_lista_cocinas',
                items: { C_EMPRESA: empresa },
                hiddens: ['C_EMPRESA', 'C_ESTABLECIMIENTO', 'C_IMPRESORA', 'Codigo'],
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
                    'NOMBRE_ESTABLECIMIENTO': {
                        text: 'Establecimiento',
                        columntype: 'dropdownlist',
                        cellclassname: fnClassEditer,
                        width: 300,
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
                                    $(tblCocinas).jqxGrid('getrows')[row].C_ESTABLECIMIENTO = v.value;
                                }
                            });
                        }
                    },
                    'Nombre de Cocina': {
                        text: 'Zona Preparación',
                        width: 250,
                        cellclassname: fnClassEditer
                    },
                    'NOMBRE_IMPRESORA': {
                        text: 'Impresora por defecto',
                        columntype: 'dropdownlist',
                        width: 300,
                        cellclassname: fnClassEditer,
                        createeditor: function (row, value, editor) {
                            var estadoSource =
                            {
                                datatype: "array",
                                datafields: [
                                    { name: 'label', type: 'string' },
                                    { name: 'value', type: 'string' }
                                ],
                                localdata: impresoras
                            };

                            var myadapter = new $.jqx.dataAdapter(estadoSource, { autoBind: true });

                            editor.jqxDropDownList({ source: myadapter, displayMember: 'label', valueMember: 'value' });
                        },
                        cellendedit: function (row, datafield, columntype, oldvalue, newvalue) {
                            $.each(impresoras, function (i, v) {
                                if (v.label == newvalue) {
                                    $(tblCocinas).jqxGrid('getrows')[row].C_IMPRESORA = v.value;
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
                    pageSize: 100,
                    columnsresize: true,
                    editable: true,
                    sortable: false,
                    pageable: false
                }
            });
            $('#btnAgregarCocina').click(function () {
                const fila = $(tblCocinas).jqxGrid('getrows').length;
                var cocina = {
                    _rowNum: fila + 1,
                    MODO: 1,
                    C_EMPRESA: empresa,
                    C_ESTABLECIMIENTO: '',
                    C_IMPRESORA: '',
                    NOMBRE_ESTABLECIMIENTO: '',
                    'Codigo': '',
                    'Nombre de Cocina': '',
                    'NOMBRE_IMPRESORA': '',
                    IND_ESTADO: 'Activo'
                };
                $(tblCocinas).jqxGrid('addrow', null, cocina);
                $(tblCocinas).jqxGrid('selectrow', fila);
                $(tblCocinas).jqxGrid('ensurerowvisible', fila);
            });
            $('#btnEliminarCocina').click(function () {
                var rows = $(tblCocinas).jqxGrid('getrows');
                if (rows.length > 0) {
                    var selected = $(tblCocinas).jqxGrid('getselectedrowindex')
                    if (selected != -1) {
                        if (rows[selected]['Codigo'] != '') {
                            arrEliminadosCocinas.push(rows[selected]);
                        };
                        var rowId = $(tblCocinas).jqxGrid('getrowid', selected);
                        $(tblCocinas).jqxGrid('deleterow', rowId);
                        if (selected - 1 != -1) {
                            $(tblCocinas).jqxGrid('selectrow', selected - 1);
                            $(tblCocinas).jqxGrid('ensurerowvisible', selected - 1);
                        }
                        else {
                            if (rows.length > 0) {
                                $(tblCocinas).jqxGrid('selectrow', selected);
                                $(tblCocinas).jqxGrid('ensurerowvisible', selected);
                            }
                        }
                    }
                }
            });

        };
        const actionGuardar = function () {

            //DATOS DE EMPRESA
            const objEmpresa = {
                C_EMPRESA: empresa,
                C_ARCHIVO_LOGO: $('#C_ARCHIVO_LOGO').val(),
                DIRECCION: $('#DIRECCION').val(),
                NOMBRE_FIRMA_BE: $('#NOMBRE_FIRMA_BE').val(),
                EMAIL_FIRMANTE_BE: $('#EMAIL_FIRMANTE_BE').val(),
                CUENTA_BANCARIA: $('#CUENTA_BANCARIA').val(),
                CTA_DETRACCION: $('#CTA_DETRACCION').val(),
                C_CLIENTE_DEFECTO: $('#cliente').val(),
                C_MONEDA_DEFECTO: $('#moneda').val(),
                C_METODO_PAGO_DEFECTO: $('#metodopago').val(),
                C_PARAMETRO_GENERAL_AFECTACION_IGV_CORTESIA: $('#cortesia').val(),
                PORC_RECARGO_CONSUMO: $('#recargoConsumo').val(),
                C_IMPRESORA_DEFECTO_PDV: $('#impresoraDefecto').val(),
                COPIAS_PRE_CUENTA: $('#copyprecuenta').val(),
                COPIAS_COMPROBANTE: $('#copycomprobante').val(),
                COPIAS_ANULACION: $('#copyanulaciones').val(),
                COPIAS_COMANDA: $('#copycomanda').val(),
                IND_PRINT_COMANDA_DPS_PAGO: $('#comandapago').val(),
                PORC_IGV: $('#porc_igv').val()
            };
            $.AddPetition({
                type: 2,
                table: 'EMPRESA',
                condition: `C_EMPRESA = '${empresa}'`,
                items: $.ConvertObjectToArr(objEmpresa)
            });

            //TABLA REST.CAJA
            if (Caja == true) {
                $.each($(tblCaja).jqxGrid('getrows'), function (i, dataCaja) {
                    var tipo = 1;
                    var condicion = '';
                    if (dataCaja['C_CAJA'] == '') tipo = 1;
                    else tipo = 2;
                    if (tipo == 2) condicion = `C_EMPRESA = '${empresa}' AND C_CAJA = '${dataCaja['C_CAJA']}'`;

                    const objCaja = {
                        C_EMPRESA: dataCaja['C_EMPRESA'],
                        C_CAJA: dataCaja['C_CAJA'],
                        NOMBRE_CAJA: dataCaja['NOMBRE_CAJA'],
                        C_ESTABLECIMIENTO: dataCaja['C_ESTABLECIMIENTO'],
                        C_IMPRESORA: (dataCaja['C_IMPRESORA'] == '' ? null : dataCaja['C_IMPRESORA']),
                        C_ALMACEN: (dataCaja['C_ALMACEN'] == '' ? null : dataCaja['C_ALMACEN']),
                        IND_IMPRIME_COMANDA: (dataCaja['IND_IMPRIME_COMANDA'] == 'SI' ? '*' : '&')
                    };
                    const extCaja = {
                        C_CAJA: {
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
                        table: 'PDV.CAJA',
                        condition: condicion,
                        items: $.ConvertObjectToArr(objCaja, extCaja)
                    });
                });
                //ELIMINADOS
                if (arrEliminadosCaja.length > 0) {
                    $.each(arrEliminadosCaja, function (i, eliminados) {
                        const objEliCaja = {
                            C_EMPRESA: eliminados.C_EMPRESA,
                            C_CAJA: eliminados.C_CAJA
                        };
                        $.AddPetition({
                            table: 'PDV.CAJA',
                            type: 3,
                            condition: `C_EMPRESA = '${eliminados.C_EMPRESA}' AND C_CAJA = '${eliminados['C_CAJA']}'`,
                            items: $.ConvertObjectToArr(objEliCaja)
                        });
                    });
                }
            };

            //TABLA VET.CLIENTE_CATEGORIA
            $.each($(tblClienteCategoria).jqxGrid('getrows'), function (i, dataClienteCat) {
                var tipo = 1;
                var condicion = '';
                if (dataClienteCat['C_CLIENTE_CATEGORIA'] == '') tipo = 1;
                else tipo = 2;
                if (tipo == 2) condicion = `C_EMPRESA = '${empresa}' AND C_CLIENTE_CATEGORIA = '${dataClienteCat['C_CLIENTE_CATEGORIA']}'`;

                const objClienteCat = {
                    C_EMPRESA: dataClienteCat['C_EMPRESA'],
                    C_CLIENTE_CATEGORIA: dataClienteCat['C_CLIENTE_CATEGORIA'],
                    NOMBRE: dataClienteCat['NOMBRE'],
                    DESCRIPCION: dataClienteCat['DESCRIPCION'],
                    IND_ESTADO: (dataClienteCat['IND_ESTADO'] == 'Activo' ? '*' : '&')
                };
                const extClienteCat = {
                    C_CLIENTE_CATEGORIA: {
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
                    table: 'VET.CLIENTE_CATEGORIA',
                    condition: condicion,
                    items: $.ConvertObjectToArr(objClienteCat, extClienteCat)
                });
            });
            if (arrEliminadosCategoria.length > 0) {
                $.each(arrEliminadosCategoria, function (i, eliminados) {
                    const objEliCategoria = {
                        C_EMPRESA: eliminados.C_EMPRESA,
                        C_CLIENTE_CATEGORIA: eliminados.C_CLIENTE_CATEGORIA,
                        IND_ESTADO: 'E'
                    };
                    $.AddPetition({
                        table: 'VET.CLIENTE_CATEGORIA',
                        type: 2,
                        condition: `C_EMPRESA = '${eliminados.C_EMPRESA}' AND C_CLIENTE_CATEGORIA = '${eliminados['C_CLIENTE_CATEGORIA']}'`,
                        items: $.ConvertObjectToArr(objEliCategoria)
                    });
                });
            }

            //TABLA VET.ESTABLECIMIENTO
            $.each($(tblEstablecimiento).jqxGrid('getrows'), function (i, dataEstablecimiento) {
                var tipo = 1;
                var condicion = '';
                if (dataEstablecimiento['C_ESTABLECIMIENTO'] == '') tipo = 1;
                else tipo = 2;
                if (tipo == 2) condicion = `C_EMPRESA = '${empresa}' AND C_ESTABLECIMIENTO = '${dataEstablecimiento['C_ESTABLECIMIENTO']}'`

                let codProvincia = '';
                let codDistrito = '';

                if (dataEstablecimiento.PROVINCIA != '' && dataEstablecimiento.PROVINCIA != null && dataEstablecimiento.DISTRITO != '' && dataEstablecimiento.DISTRITO != null) {
                    codProvincia = provincias.filter(x => x['label'] == dataEstablecimiento.PROVINCIA)[0].value;
                    let distritosFilter = distritos.filter(x => x['value'].substring(0, 4) == codProvincia);
                    codDistrito = distritosFilter.filter(x => (x['label'] == dataEstablecimiento.DISTRITO))[0].value;
                }

                const objEstablecimiento = {
                    C_EMPRESA: dataEstablecimiento['C_EMPRESA'],
                    C_ESTABLECIMIENTO: dataEstablecimiento['C_ESTABLECIMIENTO'],
                    NOMBRE_ESTABLECIMIENTO: dataEstablecimiento['NOMBRE_ESTABLECIMIENTO'],
                    DIRECCION: dataEstablecimiento['DIRECCION'],
                    UBIGEO: codDistrito,
                    IND_ESTADO: (dataEstablecimiento['IND_ESTADO'] == 'Activo' ? '*' : '&'),
                };
                const extEstablecimiento = {
                    C_ESTABLECIMIENTO: {
                        action: {
                            name: 'GetNextId',
                            args: $.ConvertObjectToArr({
                                columns: 'C_EMPRESA',
                                max_length: '3'
                            })
                        }
                    }
                };
                let tokenEst = $.AddPetition({
                    type: tipo,
                    table: 'VET.ESTABLECIMIENTO',
                    condition: condicion,
                    items: $.ConvertObjectToArr(objEstablecimiento, extEstablecimiento)
                });

                // TABLA VET.ESTABLECIMIENTO_SERIE
                if (dataEstablecimiento['JSON_Serie'] != undefined) {
                    var arrEst = JSON.parse(dataEstablecimiento['JSON_Serie']);
                    $.each(arrEst, function (i, serie) {
                        var tipoSerie = 1;
                        var condicionSerie = '';
                        if (serie['C_SERIE'] == '') tipo = 1;
                        else tipoSerie = 2;
                        if (tipoSerie == 2) condicionSerie = `C_EMPRESA = '${serie['C_EMPRESA']}' AND C_SERIE = '${serie['C_SERIE']}' AND C_ESTABLECIMIENTO = '${serie['C_ESTABLECIMIENTO']}'`

                        const objEstSerie = {
                            C_EMPRESA: empresa,
                            C_ESTABLECIMIENTO: serie['C_ESTABLECIMIENTO'],
                            C_SERIE: serie['C_SERIE'],
                            TIPO_DOC: documentos.filter(x => x['label'] == serie['TIPO_DOC'])[0]['value'],
                            SERIE: serie['SERIE'],
                            IND_ESTADO: (serie['IND_ESTADO'] == 'Activo' ? '*' : '&')
                        };
                        const extEstSerie = {
                            C_ESTABLECIMIENTO: {
                                action: {
                                    name: 'GetParentId',
                                    args: $.ConvertObjectToArr({
                                        token: tokenEst,
                                        column: 'C_ESTABLECIMIENTO',
                                    })
                                }
                            },
                            C_SERIE: {
                                action: {
                                    name: 'GetNextId',
                                    args: $.ConvertObjectToArr({
                                        columns: 'C_EMPRESA',
                                        max_length: 3
                                    })
                                }
                            }
                        };
                        $.AddPetition({
                            type: tipo,
                            table: 'VET.ESTABLECIMIENTO_SERIE',
                            condition: condicionSerie,
                            items: $.ConvertObjectToArr(objEstSerie, extEstSerie)
                        });
                    });
                }

            });
            if (arrEliminadosEstablecimientos.length > 0) {
                $.each(arrEliminadosEstablecimientos, function (i, eliminados) {
                    const objEliEst = {
                        C_EMPRESA: eliminados.C_EMPRESA,
                        C_ESTABLECIMIENTO: eliminados.C_ESTABLECIMIENTO,
                        IND_ESTADO: 'E'
                    };
                    $.AddPetition({
                        table: 'VET.ESTABLECIMIENTO',
                        type: 2,
                        condition: `C_EMPRESA = '${eliminados.C_EMPRESA}' AND C_ESTABLECIMIENTO = '${eliminados['C_ESTABLECIMIENTO']}'`,
                        items: $.ConvertObjectToArr(objEliEst)
                    });
                });
            }

            //TABLA CAJA.METODO_PAGO
            $.each($(tblMetodoPago).jqxGrid('getrows'), function (i, dataMetodoPago) {

                var tipo = 1;
                var condicion = '';

                //console.log(dataMetodoPago);

                if (dataMetodoPago['C_METODO_PAGO'] == '') tipo = 1;
                else tipo = 2;
                if (tipo == 2) condicion = `C_EMPRESA = '${empresa}' AND C_METODO_PAGO = '${dataMetodoPago['C_METODO_PAGO']}'`;

                const objMetodoPago = {
                    C_EMPRESA: dataMetodoPago['C_EMPRESA'],
                    C_METODO_PAGO: dataMetodoPago['C_METODO_PAGO'],
                    NOMBRE_METODO_PAGO: dataMetodoPago['NOMBRE_METODO_PAGO'],
                    IND_EFECTIVO: (dataMetodoPago['IND_EFECTIVO'] == true || dataMetodoPago['IND_EFECTIVO'] == 'true' ? '*' : null),
                    IND_TARJETA: (dataMetodoPago['IND_TARJETA'] == true || dataMetodoPago['IND_TARJETA'] == 'true' ? '*' : null),
                    IND_CREDITO: (dataMetodoPago['IND_CREDITO'] == true || dataMetodoPago['IND_CREDITO'] == 'true' ? '*' : null),
                    IND_BANCOS: (dataMetodoPago['IND_BANCOS'] == true || dataMetodoPago['IND_BANCOS'] == 'true' ? '*' : null),
                    IND_DEFECTO: (dataMetodoPago['IND_DEFECTO'] == true || dataMetodoPago['IND_DEFECTO'] == 'true' ? '*' : null),
                    IND_ESTADO: (dataMetodoPago['IND_ESTADO'] == 'Activo' ? '*' : null)
                };
                const extMetodoPago = {
                    C_METODO_PAGO: {
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
                    table: 'CAJA.METODO_PAGO',
                    condition: condicion,
                    items: $.ConvertObjectToArr(objMetodoPago, extMetodoPago)
                });
            });
            if (arrEliminadosMetodoPago.length > 0) {
                $.each(arrEliminadosMetodoPago, function (i, eliminados) {
                    const objEliMetodoPago = {
                        C_EMPRESA: eliminados.C_EMPRESA,
                        C_METODO_PAGO: eliminados.C_METODO_PAGO,
                        IND_ESTADO: 'E'
                    };
                    $.AddPetition({
                        table: 'CAJA.METODO_PAGO',
                        type: 3,
                        condition: `C_EMPRESA = '${eliminados.C_EMPRESA}' AND C_METODO_PAGO = '${eliminados['C_METODO_PAGO']}'`,
                        items: $.ConvertObjectToArr(objEliMetodoPago)
                    });
                });
            };

            //TABLA rest.SALON
            $.each($(tblSalon).jqxGrid('getrows'), function (i, dataMesa) {

                var tipo = 1;
                var condicion = '';

                if (dataMesa['C_SALON'] == '') tipo = 1;
                else tipo = 2;
                if (tipo == 2) condicion = `C_EMPRESA = '${empresa}' AND C_SALON='${dataMesa['C_SALON']}'`;

                const objMesa = {
                    C_EMPRESA: dataMesa['C_EMPRESA'],
                    C_SALON: dataMesa['C_SALON'],
                    NOMBRE: dataMesa['NOMBRE'],
                    IND_ESTADO: (dataMesa['IND_ESTADO'] == 'Activo' ? '*' : null),
                    IND_DEFECTO: (dataMesa['IND_DEFECTO'] == true || dataMesa['IND_DEFECTO'] == 'true' ? '*' : '&'),
                    IND_CREAR_MESA: (dataMesa['IND_CREAR_MESA'] == true || dataMesa['IND_CREAR_MESA'] == 'true' ? '*' : '&'),
                    IND_DELIVERY: (dataMesa['IND_DELIVERY'] == true || dataMesa['IND_DELIVERY'] == 'true' ? '*' : '&')
                };
                const extMesa = {
                    C_SALON: {
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
                    table: 'rest.SALON',
                    condition: condicion,
                    items: $.ConvertObjectToArr(objMesa, extMesa)
                });
            });
            if (arrEliminadosSalon.length > 0) {
                $.each(arrEliminadosSalon, function (i, eliminados) {
                    const objEliMesa = {
                        C_EMPRESA: eliminados.C_EMPRESA,
                        C_SALON: eliminados.C_SALON,
                        IND_ESTADO: 'E'
                    };
                    $.AddPetition({
                        table: 'rest.SALON',
                        type: 3,
                        condition: `C_EMPRESA = '${empresa}' AND C_SALON='${eliminados['C_SALON']}'`,
                        items: $.ConvertObjectToArr(objEliMesa)
                    });
                });
            };

            //TABLA rest.MESA
            $.each($(tblMesas).jqxGrid('getrows'), function (i, dataMesa) {

                var tipo = 1;
                var condicion = '';

                if (dataMesa['Codigo'] == '') tipo = 1;
                else tipo = 2;
                if (tipo == 2) condicion = `C_EMPRESA = '${empresa}' AND C_ESTABLECIMIENTO = '${dataMesa['C_ESTABLECIMIENTO']}' and C_MESA='${dataMesa['Codigo']}'`;

                const objMesa = {
                    C_EMPRESA: dataMesa['C_EMPRESA'],
                    C_ESTABLECIMIENTO: dataMesa['C_ESTABLECIMIENTO'],
                    C_MESA: dataMesa['Codigo'],
                    C_SALON: dataMesa['C_SALON'],
                    NOMBRE_MESA: dataMesa['Nombre de Mesa'],
                    IND_ESTADO: (dataMesa['IND_ESTADO'] == 'Activo' ? '*' : null)
                };
                const extMesa = {
                    C_MESA: {
                        action: {
                            name: 'GetNextId',
                            args: $.ConvertObjectToArr({
                                columns: 'C_EMPRESA,C_ESTABLECIMIENTO',
                                max_length: '3'
                            })
                        }
                    }
                };
                $.AddPetition({
                    type: tipo,
                    table: 'rest.MESA',
                    condition: condicion,
                    items: $.ConvertObjectToArr(objMesa, extMesa)
                });
            });
            if (arrEliminadosMesas.length > 0) {
                $.each(arrEliminadosMesas, function (i, eliminados) {
                    const objEliMesa = {
                        C_EMPRESA: eliminados.C_EMPRESA,
                        C_ESTABLECIMIENTO: eliminados.C_ESTABLECIMIENTO,
                        C_MESA: eliminados.Codigo,
                        IND_ESTADO: 'E'
                    };
                    $.AddPetition({
                        table: 'rest.MESA',
                        type: 3,
                        condition: `C_EMPRESA = '${empresa}' AND C_ESTABLECIMIENTO = '${eliminados['C_ESTABLECIMIENTO']}' and C_MESA='${eliminados['Codigo']}'`,
                        items: $.ConvertObjectToArr(objEliMesa)
                    });
                });
            };

            //TABLA rest.COCINA
            $.each($(tblCocinas).jqxGrid('getrows'), function (i, dataCocina) {

                var tipo = 1;
                var condicion = '';

                //console.log(dataMetodoPago);

                if (dataCocina['Codigo'] == '') tipo = 1;
                else tipo = 2;
                if (tipo == 2) condicion = `C_EMPRESA = '${empresa}' AND C_ESTABLECIMIENTO = '${dataCocina['C_ESTABLECIMIENTO']}' and C_COCINA='${dataCocina['Codigo']}'`;

                const objCocina = {
                    C_EMPRESA: dataCocina['C_EMPRESA'],
                    C_ESTABLECIMIENTO: dataCocina['C_ESTABLECIMIENTO'],
                    C_COCINA: dataCocina['Codigo'],
                    C_IMPRESORA: dataCocina['C_IMPRESORA'],
                    NOMBRE_COCINA: dataCocina['Nombre de Cocina'],
                    IND_ESTADO: (dataCocina['IND_ESTADO'] == 'Activo' ? '*' : null)
                };
                const extCocina = {
                    C_COCINA: {
                        action: {
                            name: 'GetNextId',
                            args: $.ConvertObjectToArr({
                                columns: 'C_EMPRESA,C_ESTABLECIMIENTO',
                                max_length: '3'
                            })
                        }
                    }
                };
                $.AddPetition({
                    type: tipo,
                    table: 'rest.COCINA',
                    condition: condicion,
                    items: $.ConvertObjectToArr(objCocina, extCocina)
                });
            });
            if (arrEliminadosCocinas.length > 0) {
                $.each(arrEliminadosCocinas, function (i, eliminados) {
                    const objEliCocina = {
                        C_EMPRESA: eliminados.C_EMPRESA,
                        C_ESTABLECIMIENTO: eliminados.C_ESTABLECIMIENTO,
                        C_COCINA: eliminados.Codigo,
                        IND_ESTADO: 'E'
                    };
                    $.AddPetition({
                        table: 'rest.COCINA',
                        type: 3,
                        condition: `C_EMPRESA = '${empresa}' AND C_ESTABLECIMIENTO = '${eliminados['C_ESTABLECIMIENTO']}' and C_COCINA='${eliminados['Codigo']}'`,
                        items: $.ConvertObjectToArr(objEliCocina)
                    });
                });
            };

            $.SendPetition({
                onReady: function (result) {

                    $.CloseStatusBar();

                    bootbox.hideAll();

                    alertify.success('Se guardó la información.');

                    $(tblClienteCategoria).jqxGrid('updatebounddata');
                    $(tblEstablecimiento).jqxGrid('updatebounddata');
                    $(tblCaja).jqxGrid('updatebounddata');
                    $(tblMetodoPago).jqxGrid('updatebounddata');
                    $(tblMesas).jqxGrid('updatebounddata');
                    $(tblCocinas).jqxGrid('updatebounddata');
                    $(tblSalon).jqxGrid('updatebounddata');

                    arrEliminadosCaja = [];
                    arrEliminadosCategoria = [];
                    arrEliminadosEstablecimientos = [];
                    arrEliminadosMetodoPago = [];
                    arrEliminadosCocinas = [];
                    arrEliminadosMesas = [];
                    arrEliminadosSalon = [];

                    obtenerInfoEmpresa();
                    $.GetQuery({
                        query: ['q_pdv_mantenimiento_configuraciones_obtenerestablecimientos_2'],
                        items: [{
                            C_EMPRESA: function () { return empresa; }
                        }],
                        onReady: function (result) {
                            establecimientos = result.filter(x => x['value'].length == 3);
                        },
                        onError: function (error) {
                            console.log(error);
                        }
                    });

                },
                onBefore: function () {
                    $.DisplayStatusBar({ message: 'Guardando información.' });
                },
                onError: function (_error) {
                    $.CloseStatusBar();
                    $.ShowError({ error: _error });
                }
            });

        };
        const cargarConfigDefecto = function (data) {

            const { COPIAS_PRE_CUENTA, COPIAS_COMPROBANTE, COPIAS_ANULACION, COPIAS_COMANDA, IND_PRINT_COMANDA_DPS_PAGO, PORC_IGV } = data;

            $('#copyprecuenta').val(COPIAS_PRE_CUENTA);
            $('#copycomprobante').val(COPIAS_COMPROBANTE);
            $('#copyanulaciones').val(COPIAS_ANULACION);
            $('#copycomanda').val(COPIAS_COMANDA);
            $('#comandapago').val(IND_PRINT_COMANDA_DPS_PAGO);
            $('#porc_igv').val(PORC_IGV);

            $('#cliente').FieldLoadRemote({
                onReady: function () {

                    $('#metodopago').FieldLoadRemote({
                        onReady: function () {

                            const { C_CLIENTE_DEFECTO, C_MONEDA_DEFECTO, C_METODO_PAGO_DEFECTO, PORC_RECARGO_CONSUMO } = data;

                            if (C_CLIENTE_DEFECTO != null) {
                                $('#cliente').val(C_CLIENTE_DEFECTO);
                            };

                            if (C_MONEDA_DEFECTO != null) {
                                $('#moneda').val(C_MONEDA_DEFECTO);
                            };

                            if (C_METODO_PAGO_DEFECTO != null) {
                                $('#metodopago').val(C_METODO_PAGO_DEFECTO)
                            };

                            if (PORC_RECARGO_CONSUMO != null) {
                                $('#recargoConsumo').val(PORC_RECARGO_CONSUMO);
                            };

                        }
                    });

                    $('#cortesia').FieldLoadRemote({
                        onReady: function () {

                            const { C_PARAMETRO_GENERAL_AFECTACION_IGV_CORTESIA } = data;

                            if (C_PARAMETRO_GENERAL_AFECTACION_IGV_CORTESIA != null) {
                                $('#cortesia').val(C_PARAMETRO_GENERAL_AFECTACION_IGV_CORTESIA);
                            }

                        }
                    });

                    $('#impresoraDefecto').FieldLoadRemote({
                        onReady: function () {

                            const { C_IMPRESORA_DEFECTO_PDV } = data;

                            if (C_IMPRESORA_DEFECTO_PDV != null) {
                                $('#impresoraDefecto').val(C_IMPRESORA_DEFECTO_PDV);
                            }

                        }
                    });

                }
            });



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

                getData();
                obtenerInfoEmpresa();
                cargarTablas();

                //validacion de restaurant
                if ($.solver.basePath == '/restaurant') {
                    $('#salon-tab').css({ 'display': 'block' });
                    $('#mesa-tab').css({ 'display': 'block' });
                    $('#cocina-tab').css({ 'display': 'block' });
                    $('#pmetodopago-tab').css({ 'display': 'block' });
                };
                if ($.solver.basePath == '/puntoventa') {
                    $('#cocina-tab').css({ 'display': 'block' });
                    $('#pmetodopago-tab').css({ 'display': 'block' });
                };

            }
        });

        $('#btnGuardar').click(function () {
            if (!estadoButton) {
                var validacion = $.solver.fn.validarCondicionesTabla(objValidarTablas);
                if (validacion.estado) {
                    alertify.confirm('Confirmar Acción', '¿Seguro de Guardar la información?', actionGuardar, null);
                }
                else {
                    var mensaje = ''
                    $.each(validacion.mensajes, function (i, v) {
                        mensaje += v + '<br>'
                    });

                    alertify.warning(mensaje);
                }
            }
        })
        $('#btnDescargarCc').click(function () {
            $.solver.fn.fnDescargarCentroCosto();
        });
        $('#btnDescargarTipoCliente').click(function () {
            $.solver.fn.fnDescargarTipoCliente();
        });
        $('#btnDescargarEstSeries').click(function () {
            $.solver.fn.fnDescargarEstablecimientosSeries();
        });
        $('#btnDescargarCaja').click(function () {
            $.solver.fn.fnDescargarPdvCajas();
        });
        $('#btnDescargarMetodoPago').click(function () {
            $.solver.fn.fnDescargarPdvMetodosPago();
        });

    });
});