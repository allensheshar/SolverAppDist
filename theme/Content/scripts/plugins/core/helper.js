'use strict';

//Configuración Global de la Aplicación
$.solver = {
    services: {},
    session: {},
    config: {},
    petitions: {},
    layout: {
        formLogin: '#frmLogin',
        homePage: '#HomePage',
        linkHome: '#LinkHome',
        menuSidebar: '#MenuSidebar',
        menuUser: '#MenuUser',
        userName: '#UserName',
        titleHeader: 'span.title-header',
        subTitleHeader: 'span.subtitle-header',
        imageCompany: "#ImageCompany",
        imageUser: 'img#UserPhoto',
        changeApps: '#changeApps',
        mainPage: '#mainPage',
        buttonSidebar: '#buttonSidebar',
        sidebarMenu: '#sidebarMenu'
    },
    fn: {
        getImageLogoCompany: function (container) {
            $.GetQuery({
                query: ['gbl_obtiene_informacion_empresa'],
                items: [{
                    empresa: $.solver.session.SESSION_EMPRESA
                }],
                onBefore: function () {

                    //$(container).attr('src', '/Content/Images/no.png');
                    $(container).removeClass('animated');
                    $(container).removeClass('bounceIn');

                },
                onReady: function (result) {

                    var logo = "";

                    if (result.length != 0) {
                        logo = result[0].C_ARCHIVO_LOGO;
                    };

                    if (logo != null) {
                        if (logo != '' && logo != 'null') {
                            $(container).SetScaleImage(`${$.solver.services.files}/service/viewfile2/${logo}/App`);
                        };
                    };

                }
            });
        },
        getDataCompany: function () {
            var _arguments = $.GetArgs({}, arguments);
            $.GetQuery({
                query: ['gbl_obtiene_informacion_empresa'],
                items: [{
                    empresa: $.solver.session.SESSION_EMPRESA
                }],
                onReady: function (_result) {
                    if (typeof _arguments.onReady === 'function') _arguments.onReady(_result);
                }
            });
        },
        getTipoCambio: function () {
            var _arguments = $.GetArgs({}, arguments);
            var _fecha = _arguments.fecha || '';

            if (_fecha == '') {
                if (typeof _arguments.onError === 'function') _arguments.onError(_fecha == '' ? 'Falta parametro fecha' : '');
                return;
            }

            $.GetQuery({
                query: ['gbl_obtener_tipo_cambio'],
                items: [{
                    C_FECHA: _fecha
                }],
                onBefore: function () {
                    if (typeof _arguments.onBefore === 'function') _arguments.onBefore();
                },
                onError: function (error) {
                    if (typeof _arguments.onError === 'function') _arguments.onError(error);
                },
                onReady: function (result) {
                    if (typeof _arguments.onReady === 'function') _arguments.onReady(result);
                }
            });

        },
        setMasiveData: function (codigo_masivo, parametros) {

            require(["fileinput.es"], function () {
                require(["bootbox", "moment"], function (bootbox, moment) {

                    let tokenLogin = $.CreateToken();
                    let dialogLogin = bootbox.dialog({
                        title: 'Cargar Masiva de Datos',
                        message: `<div id="${tokenLogin}"></div>`,
                        //className: 'modal-search-40',
                        onEscape: true,
                        //centerVertical: true
                    });

                    const fnProcesarCargaMasiva = function (codigo_masivo, token) {
                        var extras = {
                            C_MASIVO_PROCESO: {
                                action: {
                                    name: 'GetNextId',
                                    args: $.ConvertObjectToArr({
                                        columns: 'C_EMPRESA',
                                        max_length: '6'
                                    })
                                }
                            },
                        };
                        $.AddPetition({
                            type: '1',
                            table: 'MASIVO_PROCESO',
                            items: $.ConvertObjectToArr({
                                C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                                C_MASIVO_PROCESO: '',
                                C_MASIVO: codigo_masivo,
                                C_ARCHIVO_MASIVO: token,
                                FEC_REGISTRO: moment().format('DD/MM/YYYY HH:mm:ss'),
                                IND_ESTADO: '&',
                                PARAMETROS: JSON.stringify(parametros)
                            }, extras)
                        });
                        $.SendPetition({
                            onBefore: function () {
                                $.DisplayStatusBar({ message: 'Procesando archivo masivo...' });
                            },
                            onReady: function (result) {
                                $(dialogLogin).modal('hide');
                                $.CloseStatusBar();
                            },
                            onError: function (error) {
                                $.CloseStatusBar();
                                $.ShowError({ error: error });
                            }
                        });
                    };

                    const fnCrearCargaArchivo = function () {

                        $('#' + tokenLogin).find(".input-b6").fileinput({
                            language: 'es',
                            maxFileCount: 1,
                            showPreview: true,
                            mainClass: "input-group-sm",
                            allowedFileExtensions: ['xlsx'],
                            uploadUrl: $.solver.services.api + "/Service/Upload/New",
                            uploadAsync: true,
                        });

                        $('#' + tokenLogin).find(".input-b6").on("filebatchselected", function (event, files) {
                            $('#' + tokenLogin).find(".input-b6").fileinput("upload");
                            $.DisplayStatusBar({
                                message: 'Espere un momento se esta cargando su archivo ...'
                            });
                        });

                        $('#' + tokenLogin).find('.input-b6').on('fileuploaderror', function (event, data, msg) {
                            $.CloseStatusBar();
                        });

                        $('#' + tokenLogin).find(".input-b6").on("fileuploaded", function (event, data, previewId, index) {
                            fnProcesarCargaMasiva(codigo_masivo, data.response.token);
                            $('#' + tokenLogin).find(".input-b6").fileinput('clear');
                        });

                    };

                    dialogLogin.init(function () {
                        setTimeout(function () {

                            // Agregamos html inicial ${tokenLogin}
                            let _html = `
                                <div class="row">
                                    <div class="col-12">
                                        <div class="alert alert-warning rounded p-3 fs-2" role="alert">
                                            Para iniciar la operación de carga, <a class="descarga_novedad" target="_blank" href="">descargue aquí</a> su modelo de plantilla y complete la información necesaria.
                                        </div>
                                    </div>
                                    <div class="col">
                                        <div class="form-group row">
                                            <div class="col-sm-12">
                                                <label class="control-label label-bold">(*) Arrastre y suelte sus Archivos:</label>
                                                <div class="file-loading">
                                                    <input class="input-b6" type="file" multiple required>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            `;

                            $(dialogLogin).find(`#${tokenLogin}`).html(_html);
                            $(dialogLogin).find('.descarga_novedad').attr('href', $.solver.services.api + 'Service/DownloadTemplate/' + codigo_masivo + '/plantilla/' + $.solver.session.SESSION_EMPRESA);

                            fnCrearCargaArchivo();

                        }, 100);
                    });

                });
            });

        },
        busquedaCliente: function () {
            var _arguments = $.GetArgs({}, arguments);
            var _buscar = _arguments.buscar || ''

            require(["alertify", "moment", "bootbox"], function (alertify, moment, bootbox) {

                var iconButton = '<i class="fa fa-search" aria-hidden="true"></i>';
                var textButton = 'Buscar';
                var token = $.CreateToken();
                var dialog = bootbox.dialog({
                    title: 'Busqueda de clientes',
                    message: `<div id="${token}"></div>`,
                    className: 'modal-search-70'
                });
                var controls = {
                    buscar: {
                        class: 'col-lg-4',
                        html: '<input type="text" name="buscar" class="form-control form-control-lg" placeholder="Ingrese busqueda..." value="' + _buscar + '" autocomplete="off" />'
                    }
                };

                dialog.init(function () {
                    setTimeout(function () {

                        var objControls = null;
                        var fnCrearTabla = function () {

                            $(dialog).find('#' + token + '_table').CreateGrid({
                                query: 'gbl_listarclientes',
                                hiddens: ['C_PARAMETRO_GENERAL_TIPO_DOCUMENTO', 'C_CATEGORIA_CLIENTE', 'NOMBRE_COMERCIAL', 'CORREO_FACTURACION', 'DIRECCION_FISCAL'],
                                sortcolumn: 'RAZON_SOCIAL',
                                sortdirection: 'ASC',
                                items: {
                                    NOMBRE: function () {
                                        return $('#' + token + '_form input[name=buscar]').val() || '';
                                    },
                                    C_EMPRESA: $.solver.session.SESSION_EMPRESA
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
                                    'C_CLIENTE': {
                                        text: 'Código',
                                        width: 70
                                    },
                                    'DESCRIPCION_PARAMETRO': {
                                        text: 'Tipo doc.',
                                        width: 200
                                    },
                                    'RUC_CLIENTE': {
                                        text: 'Nro documento',
                                        width: 100
                                    },
                                    'RAZON_SOCIAL': {
                                        text: 'Razón social',
                                        width: 350
                                    }
                                },
                                config: {
                                    pageable: true,
                                    sortable: true,
                                    height: 600,
                                    pageSize: 100
                                }
                            });

                            $(dialog).find('#' + token + '_table').on('rowdoubleclick', function (event) {

                                var args = event.args;
                                var boundIndex = args.rowindex;
                                var visibleIndex = args.visibleindex;
                                var rightclick = args.rightclick;
                                var ev = args.originalEvent;

                                const row = $(dialog).find('#' + token + '_table').jqxGrid('getrows')[boundIndex];

                                if (typeof _arguments.onSelected === 'function') {
                                    _arguments.onSelected(row);
                                }

                                $(dialog).modal('hide');
                            });

                        };

                        $(dialog).find('#' + token).html(`
                            <form id="${token}_form">
                                <div class="row site"></div>
                            </form>
                            <div class="row mt-3">
                                <div class="col-12"><div id="${token}_table"></div></div>
                            </div>
                        `);

                        //agregamos controles
                        for (var item in controls) {
                            var control = controls[item];
                            $(dialog).find('#' + token + '_form .site').append(`
                                <div class="${control.class}">${control.html}</div>
                            `);
                        };
                        $(dialog).find('#' + token + '_form .site').append(`
                            <div class="col-auto"><button type="submit" class="btn btn-lg btn-orange">${iconButton} ${textButton}</button></div>
                        `);

                        //Validamos formulario
                        $(dialog).find('#' + token + '_form').ValidForm({
                            type: -1,
                            onDone: function (form, controls) {
                                objControls = controls;
                                fnCrearTabla();
                            },
                            onReady: function () {
                                $(dialog).find('#' + token + '_table').jqxGrid('updatebounddata');
                            }
                        });

                        // Agregando estilos al modal
                        if (typeof _arguments.onAfter === 'function') {
                            _arguments.onAfter(token, dialog);
                        }
                        else {
                            $(dialog).find('.modal-dialog').css({ 'max-width': '80%' })
                            $(dialog).find('.modal-dialog').css({ 'margin-top': '4%' })
                        }

                        $('.bootbox .modal-dialog').draggable({
                            handle: '.modal-header'
                        });
                        $('.bootbox .modal-header').css('cursor', 'move');

                    }, 150);
                });
            });
        },
        busquedaProductoStock: function () {
            var _arguments = $.GetArgs({}, arguments);
            var _param = _arguments.param || ''
            var _almacen = _arguments.almacen || ''
            require(["alertify", "moment", "bootbox"], function (alertify, moment, bootbox) {
                var iconButton = '<i class="fa fa-search" aria-hidden="true"></i>';
                var textButton = 'Buscar';
                var token = $.CreateToken();
                var dialog = bootbox.dialog({
                    title: 'Escoger producto',
                    message: `<div id="${token}"></div>`,
                    className: 'modal-search-80 modal-search-top-4'
                });
                var controls = {
                    buscar: {
                        class: 'col-lg-4',
                        html: '<input type="text" name="buscar" class="form-control form-control-sm" placeholder="Ingrese busqueda..." />'
                    }
                };
                dialog.init(function () {
                    setTimeout(function () {
                        var objControls = null;
                        var fnCrearTabla = function () {

                            $(dialog).find('#' + token + '_table').CreateGrid({
                                query: 'gbl_busqueda_producto_con_stock',
                                hiddens: ['C_PARAMETRO_GENERAL_TIPO_PRODUCTO', 'C_UNIDAD', 'C_UNIDAD_PRIN', 'UNIDAD_PRIN', 'C_UNIDAD_AUX', 'UNIDAD_AUX', 'FACTOR', 'C_PRODUCTO_PRECIO', 'C_UNIDAD_NEGOCIO', 'C_ALMACEN', 'NOMBRE_ALMACEN'],
                                items: {
                                    BUSCAR: function () {
                                        return $('#' + token + '_form input[name=buscar]').val() || '';
                                    },
                                    C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                                    C_ALMACEN: _almacen,
                                    PARAMETRO: _param,
                                },
                                columns: {
                                    _rowNum: {
                                        text: '#',
                                        width: 30,
                                        cellsAlign: 'center',
                                        hidden: false,
                                        pinned: true,
                                        editable: false,
                                        sortable: false
                                    },
                                    C_PRODUCTO: {
                                        text: 'Cód. prod.',
                                        width: '80'
                                    },
                                    NOMBRE_PARA_VENTA: {
                                        text: 'Nombre artículo',
                                        width: 300
                                    },
                                    TIPO_CLIENTE: {
                                        text: 'Tipo cliente',
                                        width: 120
                                    },
                                    UNIDAD: {
                                        text: 'Und. med.',
                                        width: 100
                                    },
                                    STOCK: {
                                        text: 'Stock',
                                        width: 80,
                                        cellsAlign: 'right',
                                        cellsFormat: 'd',
                                    },
                                    PRECIO: {
                                        text: 'Precio venta',
                                        width: 80,
                                        cellsAlign: 'right',
                                        cellsFormat: 'd2',
                                    },
                                },
                                config: {
                                    pageable: true,
                                    sortable: true,
                                    height: 600,
                                    pageSize: 100
                                }
                            });

                            $(dialog).find('#' + token + '_table').on('rowdoubleclick', function (event) {

                                var args = event.args;
                                var boundIndex = args.rowindex;
                                var visibleIndex = args.visibleindex;
                                var rightclick = args.rightclick;
                                var ev = args.originalEvent;

                                const row = $(dialog).find('#' + token + '_table').jqxGrid('getrows')[boundIndex];

                                if (typeof _arguments.onSelected === 'function') {
                                    _arguments.onSelected(row);
                                }

                                $(dialog).modal('hide');
                            });

                        };

                        $(dialog).find('#' + token).html(`
                            <form id="${token}_form">
                                <div class="row site"></div>
                            </form>
                            <div class="row mt-3">
                                <div class="col-12"><div id="${token}_table"></div></div>
                            </div>
                        `);

                        //agregamos controles
                        for (var item in controls) {
                            var control = controls[item];
                            $(dialog).find('#' + token + '_form .site').append(`
                                <div class="${control.class}">${control.html}</div>
                            `);
                        };
                        $(dialog).find('#' + token + '_form .site').append(`
                            <div class="col-auto"><button type="submit" class="btn btn-sm btn-gray">${iconButton} ${textButton}</button></div>
                        `);

                        //Validamos formulario
                        $(dialog).find('#' + token + '_form').ValidForm({
                            type: -1,
                            onDone: function (form, controls) {
                                objControls = controls;
                                fnCrearTabla();
                            },
                            onReady: function () {
                                $(dialog).find('#' + token + '_table').jqxGrid('updatebounddata');
                            }
                        });

                    }, 150);
                });
            });
        },
        busquedaProductos: function () {
            var _arguments = $.GetArgs({}, arguments);
            var _url = '/restaurant/Mantenimiento/BusquedaProducto';
            $.GetData({
                title: 'Busqueda - productos',
                uriData: `${_url}`,
                location: 'float',
                type: 'GET',
                isPage: true,
                onBefore: function () {
                    if (typeof _arguments.onBefore === 'function') _arguments.onBefore();
                },
                onReady: function (object, modal) {
                    $(modal).find('.modal-dialog').css({ 'max-width': '60%' });

                    const table = $(object).find('#tblProductos');
                    const buttonRecuperar = $(object).find('#btnBusqueda');

                    const actionElegir = function () {
                        const getselectedrowindexes = table.jqxGrid('getselectedrowindexes');
                        if (getselectedrowindexes.length > 0) {
                            const selectedRowData = table.jqxGrid('getrowdata', getselectedrowindexes[0]);
                            if (typeof _arguments.onSelected === 'function') {
                                _arguments.onSelected(selectedRowData);
                            }
                        }
                    }

                    table.on("rowdoubleclick", function () {
                        actionElegir();
                    });

                    buttonRecuperar.click(function () {
                        table.jqxGrid('updatebounddata');
                        table.jqxGrid('scrolloffset', 0, 0);
                    })

                },
                onCloseModal: function () {
                    if (typeof _arguments.onCloseModal === 'function') _arguments.onCloseModal();
                },
                onError: function (error) {
                    if (typeof _arguments.onError === 'function') _arguments.onError();
                }
            });
        },
        busquedaUsuario: function () {
            var _arguments = $.GetArgs({}, arguments);
            var _url = '/tareaje/Mantenimiento/BusquedaUsuario';
            $.GetData({
                title: 'Busqueda - Usuario',
                uriData: `${_url}`,
                location: 'float',
                type: 'GET',
                isPage: true,
                onBefore: function () {
                    if (typeof _arguments.onBefore === 'function') _arguments.onBefore();
                },
                onReady: function (object) {

                    const table = $(object).find('#tblUsuarios');
                    const buttonRecuperar = $(object).find('#btnBusqueda');
                    const actionElegir = function () {
                        const getselectedrowindexes = table.jqxGrid('getselectedrowindexes');
                        if (getselectedrowindexes.length > 0) {
                            const selectedRowData = table.jqxGrid('getrowdata', getselectedrowindexes[0]);
                            if (typeof _arguments.onSelected === 'function') {
                                _arguments.onSelected(selectedRowData, object);
                            }
                        }
                    }

                    table.on("rowdoubleclick", function () {
                        actionElegir();
                    });
                    buttonRecuperar.click(function () {
                        table.jqxGrid('updatebounddata');
                        table.jqxGrid('scrolloffset', 0, 0);
                    })

                },
                onCloseModal: function () {
                    if (typeof _arguments.onCloseModal === 'function') _arguments.onCloseModal();
                },
                onError: function (error) {
                    if (typeof _arguments.onError === 'function') _arguments.onError();
                }
            });
        },
        validarCondicionesTabla: function (objValidarTablas) {
            let validacion = {
                estado: true,
                mensajes: []
            };
            if (objValidarTablas.tables.length > 0) {
                try {
                    $(objValidarTablas.tables).each(function (x, tabla) {
                        var rows = $(tabla.table).jqxGrid('getrows');
                        $(tabla.items).each(function (i, columna) {
                            if (rows.length == 0 && tabla['minimumOfRows'] != undefined) {
                                validacion.estado = false;
                                validacion.mensajes.push('La tabla ' + tabla.tableText + ' debe tener mas de ' + tabla.minimumOfRows + ' registro(s)');
                            }
                            if (rows.length > 0 && rows.filter(x => x[columna] == '' || x[columna] == null).length > 0) {
                                validacion.estado = false;
                                validacion.mensajes.push('Falta rellenar el campo ' + (tabla.itemsText[i]) + ' de la tabla ' + tabla.tableText);
                            }
                        })
                    });
                } catch (e) {
                    console.log(e);
                    return false;
                }
            }
            return validacion;
        },
        fnSeleccionarCentroCosto: function () {
            var _arguments = $.GetArgs({}, arguments);
            var _title = _arguments.title || 'Seleccione centro de costo';
            var _className = _arguments.className || null;
            var _closeButton = _arguments.closeButton || true;
            var _onEscape = _arguments.onEscape || true;
            var _input = _arguments.input;

            require(['jstree'], function () {
                require(['bootbox'], function (bootbox) {
                    const token = $.CreateToken();
                    let dataLocal = [];
                    let dialog = bootbox.dialog({
                        title: _title,
                        className: _className,
                        closeButton: _closeButton,
                        onEscape: _onEscape,
                        size: 'normal',
                        message: `<div id="${token}"></div>`,
                    });
                    dialog.init(function () {
                        $(dialog).find(`#${token}`).html(`
                        <div id="padre">
                                <div id="html" class="demo">
                                </div>
                            </div>
                        `);

                        const createTree = function () {
                            $.jstree.plugins.noclose = function () {
                                this.close_node = $.noop;
                            };

                            $('#html').jstree({
                                "core": {
                                    "check_callback": true,
                                    "data": dataLocal,
                                    "themes": {
                                        "variant": "large"
                                    }
                                },
                                'plugins': ['noclose'],
                            }).on('loaded.jstree', function () {
                                $("#html").jstree('open_all');
                            }).on('dblclick.jstree', function (e) {
                                var tree = $('#html').jstree();
                                var node = $(e.target).closest("li");
                                var item = node[0].id;

                                if (item != '' && !tree.is_parent(item)) {
                                    $(_input).val(item);
                                    $(dialog).modal('hide');
                                }
                            });
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
                                items: [{ C_EMPRESA: $.solver.session.SESSION_EMPRESA }],
                                onReady: function (data) {
                                    for (let item in data) {
                                        dataLocal.push(data[item]);
                                    };
                                    createTree();
                                },
                                onError: function (error) {
                                    $.CloseStatusBar();
                                    $.ShowError({ error });
                                }
                            });
                        };
                        getData();
                    });

                    if (typeof _arguments.onCloseModal === 'function') {
                        $(dialog).on('hide.bs.modal', _arguments.onCloseModal);
                    };
                });
            });
        },
        fnSeleccionarCubso: function () {
            var _arguments = $.GetArgs({}, arguments);
            var _title = _arguments.title || 'Seleccione cubso';
            var _className = _arguments.className || null;
            var _closeButton = _arguments.closeButton || true;
            var _onEscape = _arguments.onEscape || true;
            var _input = _arguments.input;

            require(['jstree'], function () {
                require(['bootbox'], function (bootbox) {
                    const token = $.CreateToken();
                    let dialog = bootbox.dialog({
                        title: _title,
                        className: _className,
                        closeButton: _closeButton,
                        onEscape: _onEscape,
                        size: 'normal',
                        message: `<div id="${token}"></div>`,
                    });
                    const controls = {
                        buscar: {
                            class: 'col',
                            html: '<input class="form-control form-control-sm" name="buscar" placeholder="Buscar cubso..." autocomplete="off"/>'
                        },
                    }
                    dialog.init(function () {
                        setTimeout(function () {
                            $(dialog).find('.modal-dialog').attr('style', 'max-width: 100% !important;');

                            // Agregamos html inicial
                            $(dialog).find(`#${token}`).html(`
                                <form name="${token}_form">
                                    <div class="row mt-2 site"></div>
                                </form>
                                <div class="row mt-3">
                                    <div class="col-12"><div id="${token}_table"></div></div>
                                </div>
                            `);

                            // Agregamos controles
                            for (var item in controls) {
                                var control = controls[item];
                                $(dialog).find(`form[name=${token}_form] .site`).append(`
                                    <div class="${control.class}">${control.html}</div>
                                `);
                            };
                            $(dialog).find(`form[name=${token}_form] .site`).append(`
                                <div class="col"><button type="submit" class="btn btn-sm btn-orange"><i class="fa fa-search" aria-hidden="true"></i> Buscar</button></div>
                                <div class="col-auto"><button type="button" id="btnAceptar" class="float-right btn btn-sm btn-danger"><i class="fa fa-floppy-o" aria-hidden="true"></i> Aceptar</button></div>
                            `);

                            // declaramos variables
                            let _controls = null;
                            const form = $(dialog).find(`form[name=${token}_form]`);
                            const table = $(dialog).find(`#${token}_table`);

                            const fnElegir = function () {
                                var rowIndex = table.jqxGrid('getselectedrowindex');
                                if (rowIndex != -1) {
                                    var rowId = table.jqxGrid('getrowid', rowIndex);
                                    var row = table.jqxGrid('getrows')[rowId];
                                    $(_input).val(row['COD_CUBSO']);
                                    $(dialog).modal('hide')
                                }
                            }
                            const fnCrearTabla = function () {
                                table.CreateGrid({
                                    query: 'gbl_buscar_cubso',
                                    items: {
                                        BUSCAR: function () {
                                            return $(_controls.buscar).val();
                                        }
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
                                        'COD_CUBSO': {
                                            text: 'Cod. cubso',
                                            cellsAlign: 'center',
                                            width: 130
                                        },
                                        'SEGMENTO': {
                                            text: 'Segmento',
                                            width: 250,
                                        },
                                        'FAMILIA': {
                                            text: 'Familia',
                                            width: 300,
                                        },
                                        'CLASE': {
                                            width: 300,
                                            text: 'Clase'
                                        },
                                        'PRODUCTO': {
                                            width: 300,
                                            text: 'Producto'
                                        },
                                        'CUBSO': {
                                            width: 350,
                                            text: 'Cubso'
                                        },
                                    },
                                    config: {
                                        pageable: true,
                                        sortable: true,
                                        height: 700,
                                        pageSize: 100
                                    }
                                });
                                table.on('rowdoubleclick', function () {
                                    fnElegir();
                                });
                            }

                            form.ValidForm({
                                type: -1,
                                onDone: function (_, controls) {
                                    _controls = controls;
                                    fnCrearTabla();

                                    setTimeout(function () {
                                        $(controls.buscar).focus();
                                    }, 150);

                                    $(_).find('#btnAceptar').click(function () {
                                        fnElegir();
                                    })
                                },
                                onReady: function () {
                                    table.jqxGrid('updatebounddata');
                                },
                                onError: function (error) {
                                    $.CloseStatusBar();
                                    $.ShowError({ error });
                                }
                            });
                        }, 150);
                    });

                    if (typeof _arguments.onCloseModal === 'function') {
                        $(dialog).on('hide.bs.modal', _arguments.onCloseModal);
                    };

                    $('.bootbox .modal-dialog').draggable({ handle: '.modal-header' });
                    $('.bootbox .modal-header').css('cursor', 'move');
                });
            });
        },
        fnDescargarCentroCosto: function () {
            $.DownloadFile({
                query: 'dw_descargar_centro_costo',
                params: {
                    C_EMPRESA: $.solver.session.SESSION_EMPRESA
                },
                nameFile: 'Centros de costo'
            });
        },
        fnDescargarTipoCliente: function () {
            $.DownloadFile({
                query: 'dw_descargar_cat_cliente',
                params: {
                    C_EMPRESA: $.solver.session.SESSION_EMPRESA
                },
                nameFile: 'Tipo de clientes'
            });
        },
        fnDescargarCategoria: function (buscar) {
            $.DownloadFile({
                query: 'dw_ventas_mantenimiento_categorias_listarcategorias',
                params: {
                    NOMBRE: buscar,
                    C_EMPRESA: $.solver.session.SESSION_EMPRESA
                },
                nameFile: 'Categorias'
            });
        },
        fnDescargarProductosMercaderia: function (buscar, tipo) {
            $.DownloadFile({
                query: 'dw_ventas_mantenimiento_productos_listarproductos',
                params: {
                    NOMBRE: buscar,
                    C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                    TIPO_PRODUCTO: tipo
                },
                nameFile: 'Productos'
            });
        },
        fnDescargarServiciosServicio: function (buscar) {
            $.DownloadFile({
                query: 'dw_ventas_mantenimiento_servicios_listarservicios',
                params: {
                    NOMBRE: buscar,
                    C_EMPRESA: $.solver.session.SESSION_EMPRESA
                },
                nameFile: 'Servicios'
            });
        },
        fnDescargarCliente: function (buscar) {
            $.DownloadFile({
                query: 'dw_ventas_mantenimiento_clientes_listarclientes',
                params: {
                    NOMBRE: buscar,
                    C_EMPRESA: $.solver.session.SESSION_EMPRESA
                },
                nameFile: 'Clientes'
            });
        },
        fnDescargarVendedor: function (buscar) {
            $.DownloadFile({
                query: 'dw_ventas_mantenimiento_vendedor_listarvendedores',
                params: {
                    NOMBRE: buscar,
                    C_EMPRESA: $.solver.session.SESSION_EMPRESA
                },
                nameFile: 'Vendedor'
            });
        },
        fnDescargarEstablecimientosSeries: function () {
            $.DownloadFile({
                query: 'dw_descargar_establecimientosseries',
                params: {
                    C_EMPRESA: $.solver.session.SESSION_EMPRESA
                },
                nameFile: 'Establecimientos y series'
            });
        },
        fnDescargarPdvCajas: function () {
            $.DownloadFile({
                query: 'dw_descargar_pdv_cajas',
                params: {
                    C_EMPRESA: $.solver.session.SESSION_EMPRESA
                },
                nameFile: 'Punto de venta - cajas'
            });
        },
        fnDescargarTipoContacto: function () {
            $.DownloadFile({
                query: 'dw_descargar_tipocontacto',
                params: {
                    C_EMPRESA: $.solver.session.SESSION_EMPRESA
                },
                nameFile: 'Tipos de contactos'
            });
        },
        fnDescargarAlmacen: function () {
            $.DownloadFile({
                query: 'dw_descargar_almacenes',
                params: {
                    C_EMPRESA: $.solver.session.SESSION_EMPRESA
                },
                nameFile: 'Almacen'
            });
        },
        fnDescargarTipoTrasladoAlm: function () {
            $.DownloadFile({
                query: 'dw_descargar_tipo_traslado_almacen',
                params: {
                    C_EMPRESA: $.solver.session.SESSION_EMPRESA
                },
                nameFile: 'Tipo de traslado almacen'
            });
        },
        fnDescargarPerfilEmpresa: function (buscar) {
            $.DownloadFile({
                query: 'dw_descargar_rol_empresa',
                params: {
                    BUSCAR: buscar,
                    C_EMPRESA: $.solver.session.SESSION_EMPRESA
                },
                nameFile: 'Roles de empresa'
            });
        },
        fnDescargarPdvMetodosPago: function () {
            $.DownloadFile({
                query: 'dw_caja_mantenimiento_metodopago_listametodos',
                params: {
                    C_EMPRESA: $.solver.session.SESSION_EMPRESA
                },
                nameFile: 'Punto de venta - Metodos Pago'
            });
        },
        fnAbrirModal: function () {
            var _arguments = $.GetArgs({}, arguments);
            var _query = _arguments.query || ''
            var _hiddens = _arguments.hiddens || []
            var _title = _arguments.title || 'Busqueda'
            var _items = _arguments.items || {}
            var _onEscape = _arguments.onEscape == undefined ? true : _arguments.onEscape
            var _columns = _arguments.columns || {}
            var _controls = _arguments.controls || {}
            var _controlsAfter = _arguments.controlsAfter || {}
            var _config = _arguments.config || { pageable: true, sortable: true, height: 600, pageSize: 100 }
            var _buscar = _arguments.buscar || '';
            var _showSearch = _arguments.showSearch == undefined ? true : _arguments.showSearch

            require(["alertify", "moment", "bootbox"], function (alertify, moment, bootbox) {
                var iconButton = '<i class="fa fa-search" aria-hidden="true"></i>';
                var textButton = 'Buscar';
                var token = $.CreateToken();
                var dialog = bootbox.dialog({
                    title: _title,
                    message: `<div id="${token}"></div>`,
                    onEscape: _onEscape
                    //className: 'modal-search-80 modal-search-top-4'
                });
                var controls = {
                    buscar: {
                        class: 'col-lg-4',
                        html: `<input type="text" name="buscar" class="form-control form-control-sm" placeholder="Ingrese busqueda..." autocomplete="off" value="${_buscar}" />`
                    }
                };

                if (!_showSearch) controls = {}

                dialog.init(function () {
                    setTimeout(function () {

                        var objControls = null;
                        var fnCrearTabla = function () {

                            // Agregamos items por defecto
                            _items['BUSCAR'] = function () { return $('#' + token + '_form input[name=buscar]').val() || ''; }
                            _items['C_EMPRESA'] = $.solver.session.SESSION_EMPRESA

                            for (var item in _controls) {
                                if (_controls[item].hasOwnProperty('control')) {
                                    _items[item] = function () { return $('#' + token + '_form ' + _controls[item].control + '[name=' + item + ']').val() || ''; }
                                }
                            };

                            var _sortcolumn = _arguments.sortcolumn == undefined ? null : _arguments.sortcolumn;
                            var _sortdirection = _arguments.sortdirection == undefined ? null : _arguments.sortdirection;
                            let grid = {
                                query: _query,
                                hiddens: _hiddens,
                                items: _items,
                                columns: _columns,
                                config: _config
                            }

                            if (_sortcolumn != null) {
                                grid['sortcolumn'] = _sortcolumn;
                                if (_sortdirection != null) {
                                    grid['sortdirection'] = _sortdirection;
                                }
                            }

                            $(dialog).find('#' + token + '_table').CreateGrid(grid);

                            $(dialog).find('#' + token + '_table').on('rowdoubleclick', function (event) {
                                var args = event.args;
                                var boundIndex = args.rowindex;
                                const row = $(dialog).find('#' + token + '_table').jqxGrid('getrows')[boundIndex];
                                if (typeof _arguments.onSelected === 'function') {
                                    _arguments.onSelected(row);
                                    $(dialog).modal('hide');
                                }
                            });
                            $(dialog).find('#' + token + '_table').bind('rowselect', function (event) {
                                if (typeof _arguments.onRowSelect === 'function') {
                                    _arguments.onRowSelect(event, $(dialog).find('#' + token + '_table'), token);
                                }
                            });
                            $(dialog).find('#' + token + '_table').bind('rowunselect', function (event) {
                                if (typeof _arguments.onRowUnSelect === 'function') {
                                    _arguments.onRowUnSelect(event, $(dialog).find('#' + token + '_table'), token);
                                }
                            });

                        };

                        $(dialog).find('#' + token).html(`
                            <form id="${token}_form">
                                <div class="row site"></div>
                            </form>
                            <div class="row mt-3">
                                <div class="col-12"><div id="${token}_table"></div></div>
                            </div>
                        `);

                        //agregamos controles
                        for (var item in _controls) {
                            var control = _controls[item];
                            $(dialog).find('#' + token + '_form .site').append(`
                                <div class="${control.class}">${control.html}</div>
                            `);
                        };
                        for (var item in controls) {
                            var control = controls[item];
                            $(dialog).find('#' + token + '_form .site').append(`
                                <div class="${control.class}">${control.html}</div>
                            `);
                        };
                        if (_showSearch) {
                            $(dialog).find('#' + token + '_form .site').append(`
                                <div class="col-auto"><button type="submit" class="btn btn-sm btn-gray">${iconButton} ${textButton}</button></div>
                            `);
                        }
                        for (var item in _controlsAfter) {
                            var control = _controlsAfter[item];
                            $(dialog).find('#' + token + '_form .site').append(`
                                <div class="${control.class}">${control.html}</div>
                            `);
                        };

                        //Validamos formulario
                        $(dialog).find('#' + token + '_form').ValidForm({
                            type: -1,
                            onDone: function (form, controls) {
                                objControls = controls;
                                fnCrearTabla();

                                if (typeof _arguments.onReady === 'function') {
                                    _arguments.onReady(form, controls, token, dialog);
                                }
                            },
                            onReady: function () {
                                $(dialog).find('#' + token + '_table').jqxGrid('updatebounddata');
                            }
                        });

                        // Agregando estilos al modal
                        if (typeof _arguments.onAfter === 'function') {
                            _arguments.onAfter(token, dialog);
                        }
                        else {
                            $(dialog).find('.modal-dialog').css({ 'max-width': '80%' })
                            $(dialog).find('.modal-dialog').css({ 'margin-top': '4%' })
                        }

                        $('.bootbox .modal-dialog').draggable({
                            handle: '.modal-header'
                        });
                        $('.bootbox .modal-header').css('cursor', 'move');
                    }, 150);
                });
            });

        },
        fnObtenerValoresDefecto: function () {
            var _arguments = $.GetArgs({}, arguments);
            var _codEmpresa = _arguments.codEmpresa || ''
            $.GetQuery({
                query: ['gbl_obtener_datos_empresa_por_codigo'],
                items: [{
                    C_EMPRESA: _codEmpresa
                }],
                onReady: function (result) {
                    if (typeof _arguments.onReady === 'function') {
                        _arguments.onReady(result);
                    }
                }
            })
        },
        fnEditarCliente: function () {
            var _arguments = $.GetArgs({}, arguments);
            var _title = _arguments.title || 'Registro Cliente'
            var _onEscape = _arguments.onEscape == undefined ? true : _arguments.onEscape
            var _codCliente = _arguments.codCliente || ''

            require(["alertify", "moment", "bootbox"], function (alertify, moment, bootbox) {
                var token = $.CreateToken();
                var dialog = bootbox.dialog({
                    title: _title,
                    message: `<div id="${token}"></div>`,
                    onEscape: _onEscape
                });

                dialog.init(function () {
                    setTimeout(function () {

                        // Funciones
                        const fnCerrarModal = function () {
                            $(dialog).modal('hide');
                        }

                        var objControls = null;

                        // Agregamos html
                        $(dialog).find('#' + token).html(`
                            <form id="${token}_form" autocomplete="off">
                                <input type="hidden" name="C_EMPRESA" value="${$.solver.session.SESSION_EMPRESA}" />
                                <input type="hidden" name="C_CLIENTE" />
                                <input type="hidden" name="C_PARAMETRO_GENERAL_PROCEDENCIA" value="07230"/>
                                <input type="hidden" name="C_CATEGORIA_CLIENTE" />
                                <input type="hidden" name="DEPARTAMENTO" />
                                <input type="hidden" name="PROVINCIA" />
                                <input type="hidden" name="DISTRITO" />
                                <input type="hidden" name="IND_ESTADO" value="*"/>

                                <div class="row">
                                    <div class="col-auto">
                                        <button type="button" id="btnCancelar" class="btn btn-lg btn-gray float-left"><i class="fa fa-close"></i>&nbsp;Cancelar</button>
                                    </div>
                                    <div class="col">
                                        <button type="submit" class="btn btn-lg btn-danger float-right"><i class="fa fa-floppy-o"></i>&nbsp;Grabar</button>
                                    </div>
                                </div>
                                <hr />
                                <div class="row">
                                    <div class="col">
                                        <div class="form-group">
                                            <label for="C_PARAMETRO_GENERAL_TIPO_DOCUMENTO">Tipo de documento</label>
                                            <select
                                                name="C_PARAMETRO_GENERAL_TIPO_DOCUMENTO" class="form-control form-control-sm"
                                                data-query="q_movil_ventas_clientes_obtenertipodoc" data-value="C_PARAMETRO_GENERAL" data-field="DESCRIPCION_PARAMETRO" data-tipoparametro="Tipos de Documentos"
                                                data-enabledefault="0"
                                                required></select>
                                        </div>
                                    </div>
                                    <div class="col">
                                        <div class="form-group">
                                            <label for="RUC_CLIENTE">Nro de documento</label>
                                            <div class="input-group">
                                                <input type="text" name="RUC_CLIENTE" class="number-input form-control form-control-sm" maxlength="11" minlength="11" />
                                                <div class="input-group-append">
                                                    <button id="btnBuscarSunat" class="btn btn-orange btn-sm btn-filter" type="button"><i class="fa fa-search"></i> Sunat</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col">
                                        <div class="form-group">
                                            <label for="RAZON_SOCIAL">Razón social</label>
                                            <input type="text" name="RAZON_SOCIAL" class="form-control form-control-sm" required />
                                        </div>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col">
                                        <div class="form-group">
                                            <label for="DIRECCION_FISCAL">Dirección fiscal</label>
                                            <input type="text" name="DIRECCION_FISCAL" class="form-control form-control-sm" />
                                        </div>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col">
                                        <div class="form-group">
                                            <label for="CORREO_FACTURACION">Correo de facturación</label>
                                            <input type="email" name="CORREO_FACTURACION" id="CORREO_FACTURACION" class="form-control form-control-sm" />
                                        </div>
                                    </div>
                                </div>
                            </form>
                        `);

                        // Agregando estilos al modal
                        if (typeof _arguments.onAfter === 'function') {
                            _arguments.onAfter(token, dialog);
                        }
                        else {
                            $(dialog).find('.modal-dialog').css({ 'max-width': '60%' })
                            $(dialog).find('.modal-dialog').css({ 'margin-top': '4%' })
                        }

                        // Validamos tipo de formulario, condicion, etc
                        var _type = 1;
                        var _condition = '';
                        if (_codCliente != '') {
                            _type = 2;
                            _condition = `C_EMPRESA = '${$.solver.session.SESSION_EMPRESA}' AND C_CLIENTE = '${_codCliente}'`
                        }

                        //Validamos formulario
                        $(dialog).find('#' + token + '_form').ValidForm({
                            type: _type,
                            condition: _condition,
                            table: 'VET.CLIENTE',
                            queryDefault: {
                                query: ['editable_cliente'],
                                type: [8],
                                items: [{
                                    table: 'VET.CLIENTE',
                                    condition: _condition
                                }]
                            },
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
                            onSubmit: function (form, controls, objParent) {
                                objParent.CORREO_FACTURACION = objParent.CORREO_FACTURACION.toLowerCase();
                            },
                            onDone: function (form, controls) {
                                objControls = controls;

                                if (typeof _arguments.onDone === 'function') {
                                    _arguments.onReady(form, controls, token, dialog);
                                }

                                $('#btnBuscarSunat').click(function () {
                                    var estadoBusqueda = false;
                                    setTimeout(function () {
                                        if (!estadoBusqueda) {
                                            estadoBusqueda = true;
                                            $.CloseStatusBar();
                                            alertify.warning('No se encuentra el cliente, por favor llenarlo a mano')
                                        }
                                    }, 10000)

                                    $(controls.RAZON_SOCIAL).val('')
                                    $(controls.DIRECCION_FISCAL).val('')
                                    if (
                                        ($(controls.RUC_CLIENTE).val().length == 11 && $(controls.C_PARAMETRO_GENERAL_TIPO_DOCUMENTO).val() == '00017') ||
                                        ($(controls.RUC_CLIENTE).val().length == 8 && $(controls.C_PARAMETRO_GENERAL_TIPO_DOCUMENTO).val() == '00013')
                                    ) {
                                        $.GetQuery({
                                            query: ['q_ventas_mantenimiento_clienteregistro_validardocumento'],
                                            items: [{
                                                C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                                                DOCUMENTO: function () {
                                                    return $(controls.RUC_CLIENTE).val();
                                                },
                                                C_CLIENTE: function () {
                                                    return $(controls.C_CLIENTE).val();
                                                }
                                            }],
                                            onReady: function (result) {
                                                if (result.length > 0 && $(controls.C_CLIENTE).val() == '') {
                                                    estadoBusqueda = true;
                                                    alertify.warning('El documento ya se encuentra registrado.');
                                                    $(controls.RAZON_SOCIAL).val('')
                                                    $(controls.DIRECCION_FISCAL).val('')
                                                    $(controls.DEPARTAMENTO).val('')
                                                    $(controls.PROVINCIA).val('')
                                                    $(controls.DISTRITO).val('')
                                                }
                                                else {
                                                    var tipo = $(controls.C_PARAMETRO_GENERAL_TIPO_DOCUMENTO).val();
                                                    switch (tipo) {
                                                        case '00017':
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
                                                                    if (!estadoBusqueda) {
                                                                        estadoBusqueda = true;
                                                                        $.CloseStatusBar();
                                                                        if (result.length > 0) {
                                                                            alertify.success('RUC encontrado.')
                                                                            $(controls.RAZON_SOCIAL).val(result[0].RAZON_SOCIAL);
                                                                            $(controls.DIRECCION_FISCAL).val(result[0].DIRECCION);
                                                                            if (result[0].DEPARTAMENTO != null) $(controls.DEPARTAMENTO).val(result[0].DEPARTAMENTO);
                                                                            if (result[0].PROVINCIA != null) $(controls.PROVINCIA).val(result[0].PROVINCIA);
                                                                            if (result[0].DISTRITO != null) $(controls.DISTRITO).val(result[0].DISTRITO);
                                                                            setTimeout(function () {
                                                                                $(controls.CORREO_FACTURACION).focus();
                                                                            }, 200)
                                                                        }
                                                                        else {
                                                                            alertify.error('RUC no encontrado.')
                                                                            $(controls.RAZON_SOCIAL).val('')
                                                                            $(controls.DIRECCION_FISCAL).val('')
                                                                            $(controls.DEPARTAMENTO).val('')
                                                                            $(controls.PROVINCIA).val('')
                                                                            $(controls.DISTRITO).val('')
                                                                        }
                                                                    }
                                                                }
                                                            });
                                                            break;
                                                        case '00013':
                                                            $.GetQuery({
                                                                uriData: 'https://api.solver.com.pe/v1/service',
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
                                                                    if (!estadoBusqueda) {
                                                                        estadoBusqueda = true;
                                                                        $.CloseStatusBar();
                                                                        if (result.length > 0) {
                                                                            alertify.success('DNI encontrado.')
                                                                            $(controls.RAZON_SOCIAL).val(result[0].RAZON_SOCIAL);
                                                                            $(controls.DIRECCION_FISCAL).val(result[0].DIRECCION);
                                                                            if (result[0].DEPARTAMENTO != null) $(controls.DEPARTAMENTO).val(result[0].DEPARTAMENTO);
                                                                            if (result[0].PROVINCIA != null) $(controls.PROVINCIA).val(result[0].PROVINCIA);
                                                                            if (result[0].DISTRITO != null) $(controls.DISTRITO).val(result[0].DISTRITO);
                                                                            setTimeout(function () {
                                                                                $(controls.CORREO_FACTURACION).focus();
                                                                            }, 200)
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
                                                                }
                                                            });
                                                            break;
                                                    }

                                                }
                                            }
                                        })
                                    }

                                })
                                $(controls.C_PARAMETRO_GENERAL_TIPO_DOCUMENTO).change(function () {
                                    $(controls.RUC_CLIENTE).val('')
                                    $(controls.RAZON_SOCIAL).val('')
                                    $(controls.DIRECCION_FISCAL).val('')
                                    if ($(this).val() == '00013') {
                                        $(controls.RUC_CLIENTE).attr('maxlength', '8');
                                        $(controls.RUC_CLIENTE).attr('minlength', '8');
                                        return;
                                    }
                                    if ($(this).val() == '00017') {
                                        $(controls.RUC_CLIENTE).attr('maxlength', '11');
                                        $(controls.RUC_CLIENTE).attr('minlength', '11');
                                        return;
                                    }

                                    $(controls.RUC_CLIENTE).attr('maxlength', '15');
                                    $(controls.RUC_CLIENTE).removeAttr('minlength');
                                })

                                // Focus en nro documento - por defecto ruc
                                setTimeout(function () {
                                    $(controls.RUC_CLIENTE).focus();
                                }, 150);

                                // Obtenemos el 1er cliente categoria
                                $.GetQuery({
                                    query: ['q_gbl_obtener_cliente_categoria_por_defecto'],
                                    items: [{
                                        C_EMPRESA: $.solver.session.SESSION_EMPRESA
                                    }],
                                    onReady: function (result) {
                                        $(controls.C_CATEGORIA_CLIENTE).val(result[0]['C_CLIENTE_CATEGORIA'])
                                    }
                                });

                                // Evento cancelar
                                $(dialog).find('#' + token + '_form').find('#btnCancelar').click(function () {
                                    fnCerrarModal();
                                })

                                if ($(controls.C_PARAMETRO_GENERAL_TIPO_DOCUMENTO).val() == '00013') {
                                    $(controls.RUC_CLIENTE).attr('maxlength', '8');
                                    $(controls.RUC_CLIENTE).attr('minlength', '8');
                                    return;
                                }
                                if ($(controls.C_PARAMETRO_GENERAL_TIPO_DOCUMENTO).val() == '00017') {
                                    $(controls.RUC_CLIENTE).attr('maxlength', '11');
                                    $(controls.RUC_CLIENTE).attr('minlength', '11');
                                    return;
                                }

                                $(controls.RUC_CLIENTE).attr('maxlength', '15');
                                $(controls.RUC_CLIENTE).removeAttr('minlength');

                            },
                            onReady: function (result, controls, form) {
                                alertify.success('Se registró la información.');
                                if (typeof _arguments.onReady === 'function') {
                                    _arguments.onReady(result, controls, form, dialog);
                                }
                            },
                            rules: {
                                CORREO_FACTURACION: {
                                    validarCorreo: $('#CORREO_FACTURACION').val()
                                }
                            },
                            onError: function (error) {
                                $.CloseStatusBar();
                                $.ShowError({ error: error });
                            }
                        });

                        dialog.on('hide.bs.modal', function () {
                            if (typeof _arguments.onCloseModal === 'function') {
                                _arguments.onCloseModal(token, dialog);
                            }
                        });

                        $('.bootbox .modal-dialog').draggable({
                            handle: '.modal-header'
                        });
                        $('.bootbox .modal-header').css('cursor', 'move');
                    }, 150)
                })
            });
        },
        fnEditarTareas: function () {
            var _arguments = $.GetArgs({}, arguments);
            var _codTarea = _arguments.codTarea || '';
            var _config = _arguments.config || { pageable: true, sortable: true, height: 600, pageSize: 100 }

            require(['alertify', 'moment', 'bootbox'], function (alertify, moment, bootbox) {

                var _title = (_codTarea == '' ? 'Registrar Tareas' : 'Editar Tareas');

                var token = $.CreateToken();
                var dialog = bootbox.dialog({ title: _title, message: `<div id="${token}"></div>`, onEscape: true });
                dialog.init(function () {
                    setTimeout(function () {

                        // Variables
                        var form = `form[name=${token}_form]`;
                        var table = `${token}_table`;


                        $(dialog).find('#' + token).html(`
                            <form name="${token}_form">
                                <div class="row site"></div>
                            </form>
                            <div class="row mt-3">
                                <div class="col-12"><div id="${token}_table"></div></div>
                            </div>
                        `);

                        $('.bootbox .modal-dialog').draggable({ handle: '.modal-header' });
                        $('.bootbox .modal-header').css('cursor', 'move');
                    }, 150)
                })

            });
        },
        fnReenviarCorreo: function () {
            var _arguments = $.GetArgs({}, arguments);
            var _title = _arguments.title || 'Reenviar correo'
            var _correo = _arguments.correo || ''
            var _flag = _arguments.flag || ''

            require(["alertify", "moment", "bootbox"], function (alertify, moment, bootbox) {

                var token = $.CreateToken();
                var dialog = bootbox.dialog({
                    title: _title,
                    message: `<div id="${token}"></div>`,
                    onEscape: true
                });

                dialog.init(function () {
                    setTimeout(function () {

                        $(dialog).find('#' + token).html(`
                            <form name="form${token}">
                                <div class="row">
                                    <div class="col" id="lstCorreos">
                                        <div class="input-group mb-1">
                                            <input type="email" class="form-control form-control-lg" />
                                            <div class="input-group-append">
                                                <button type="button" class="btn btn-gray btn-lg" id="btnAgregar"><i class="fa fa-plus" aria-hidden="true"></i>&nbsp;Agregar</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="row mt-2">
                                    <div class="col-12">
                                        <button type="submit" class="float-right btn btn-lg btn-orange"><i class="fa fa-paper-plane" aria-hidden="true"></i>&nbsp;Enviar Email</button>
                                    </div>
                                </div>
                            </form>
                            
                        `);

                        // Seteamos el correo de facturación default
                        $(dialog).find('#' + token).find('input[type=email]').val(_correo);

                        $(dialog).find('#' + token).find(`form[name=form${token}]`).ValidForm({
                            type: -1,
                            onDone: function () {
                                $(dialog).find('#' + token).find('#btnAgregar').click(function () {
                                    var buttonToken = $.CreateToken();
                                    $(dialog).find('#' + token).find('#lstCorreos').append(`
                                        <div class="input-group mb-2">
                                            <input name="${buttonToken}" type="email" class="form-control form-control-lg input-correo" required />
                                            <div class="input-group-append">
                                                <button class="btn btn-gray btn-lg" id="btnClose-${buttonToken}"><i class="fa fa-close" aria-hidden="true"></i></button>
                                            </div>
                                        </div>
                                    `);
                                    $(dialog).find('#' + token).find(`#btnClose-${buttonToken}`).click(function () {
                                        $(this).parent().parent().remove();
                                    });
                                });
                            },
                            onReady: function () {
                                var correos = $(dialog).find('#' + token).find('input[type=email]');
                                var arrCorreos = []
                                $.each(correos, function (i, v) {
                                    var correo = $(v).val();
                                    if (correo != '') arrCorreos.push(correo);
                                });
                                correos = arrCorreos.join(';');

                                if (_flag == 'ven') {
                                    $.GetData({
                                        uriData: $.solver.services.api + `/efacturacion/EnviarComprobante/${_arguments.emisor}/${_arguments.comprobante}/`,
                                        options: correos,
                                        isPage: true,
                                        onBefore: function () {
                                            $.DisplayStatusBar({
                                                message: 'Reenviando comprobante, espere por favor...'
                                            });
                                        },
                                        onError: function () {
                                            $.CloseStatusBar();
                                        },
                                        onReady: function (res) {
                                            res = JSON.parse(res);

                                            $.CloseStatusBar();
                                            alertify.success(res.email)
                                            $(dialog).modal('hide');
                                        }
                                    });
                                }
                            }
                        })

                        $(dialog).find('.modal-dialog').css({ 'max-width': '30%' })
                        $('.bootbox .modal-dialog').draggable({
                            handle: '.modal-header'
                        });
                        $('.bootbox .modal-header').css('cursor', 'move');

                    }, 150)
                })

            });
        },
        fnEditarChofer: function () {
            var _arguments = $.GetArgs({}, arguments);
            var _codigo = _arguments.codigo || ''

            require(["alertify", "moment", "bootbox"], function (alertify, moment, bootbox) {

                var token = $.CreateToken();
                var dialog = bootbox.dialog({
                    title: 'Nuevo chofer',
                    message: `<div id="${token}"></div>`,
                    onEscape: true
                });

                dialog.init(function () {
                    setTimeout(function () {

                        $(dialog).find('#' + token).html(`
                            <form name="frmRegistro" action="#" method="post">
                                <input type="hidden" name="C_EMPRESA" value="${$.solver.session.SESSION_EMPRESA}" />
                                <input type="hidden" name="C_CHOFER" />
                                <input type="hidden" name="C_USUARIO_REGISTRO" value="${$.solver.session.SESSION_ID}" />

                                <div class="row">
                                    <div class="col">
                                        <div class="form-group">
                                            <label for="nombre">Tipo documento</label>
                                            <select name="TIPO_DOC" class="form-control form-control-sm" data-query="q_movil_ventas_clientes_obtenertipodoc"
                                                    data-value="C_PARAMETRO_GENERAL" data-field="DESCRIPCION_PARAMETRO" data-tipoparametro="Tipos de Documentos" required></select>
                                        </div>
                                    </div>
                                    <div class="col">
                                        <div class="form-group">
                                            <label for="nombre">Nro. Documento</label>
                                            <input type="text" class="form-control form-control-sm" name="DOCUMENTO" placeholder="Nro documento" required autocomplete="off">
                                        </div>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col">
                                        <div class="form-group">
                                            <label for="nombre">Nombres</label>
                                            <input type="text" class="form-control form-control-sm" name="NOMBRES" placeholder="Nombres" required autocomplete="off">
                                        </div>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col">
                                        <div class="form-group">
                                            <label for="nombre">Dirección</label>
                                            <input type="text" class="form-control form-control-sm" name="DIRECCION" placeholder="Dirección" autocomplete="off">
                                        </div>
                                    </div>
                                    <div class="col">
                                        <div class="form-group">
                                            <label for="nombre">Teléfono</label>
                                            <input type="text" class="form-control form-control-sm" name="TELEFONO" placeholder="Teléfono" autocomplete="off">
                                        </div>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col">
                                        <div class="form-group">
                                            <label for="nombre">Estado</label>
                                            <select name="IND_ESTADO" class="form-control form-control-sm">
                                                <option value="*" selected="selected">Activo</option>
                                                <option value="&">Inactivo</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <button type="submit" class="btn pull-right btn-danger btn-sm"><i class="fa fa-floppy-o" aria-hidden="true"></i>&nbsp;Guardar</button>
                            </form>
                        `);

                        let _type = 1;
                        let _condition = "";
                        if (_codigo != '') {
                            _type = 2;
                            _condition = `C_EMPRESA = '${$.solver.session.SESSION_EMPRESA}' AND C_CHOFER = '${_codigo}'`;
                        };

                        $(dialog).find('form[name=frmRegistro]').ValidForm({
                            type: _type,
                            condition: _condition,
                            table: 'LOG.CHOFER',
                            queryDefault: {
                                query: ['editable_chofer'],
                                type: [8],
                                items: [{
                                    table: 'LOG.CHOFER',
                                    condition: _condition
                                }]
                            },
                            extras: {
                                C_CHOFER: {
                                    action: {
                                        name: 'GetNextId',
                                        args: $.ConvertObjectToArr({
                                            columns: 'C_EMPRESA',
                                            max_length: 4
                                        })
                                    }
                                }
                            },
                            onDone: function (form, controls) {

                                $(controls.C_EMPRESA).val($.solver.session.SESSION_EMPRESA);

                            },
                            onReady: function (result, controls) {
                                alertify.success('Se registró la información.');
                                if (typeof _arguments.onReady === 'function') {
                                    _arguments.onReady(result, controls, dialog);
                                }
                            },
                            onError: function (error) {
                                $.CloseStatusBar();
                                $.ShowError({ error: error });
                            },
                        });

                        dialog.on('hide.bs.modal', function () {
                            if (typeof _arguments.onCloseModal === 'function') {
                                _arguments.onCloseModal(token, dialog);
                            }
                        });

                        $('.bootbox .modal-dialog').draggable({ handle: '.modal-header' });
                        $('.bootbox .modal-header').css('cursor', 'move');

                    }, 150)
                })

            });
        },
        fnEditarVehiculo: function () {
            var _arguments = $.GetArgs({}, arguments);
            var _codigo = _arguments.codigo || ''

            require(["alertify", "moment", "bootbox"], function (alertify, moment, bootbox) {

                var token = $.CreateToken();
                var dialog = bootbox.dialog({
                    title: 'Nuevo vehículo',
                    message: `<div id="${token}"></div>`,
                    onEscape: true
                });

                dialog.init(function () {
                    setTimeout(function () {

                        $(dialog).find('#' + token).html(`
                            <form name="frmRegistro" action="#" method="post">
                                <input type="hidden" name="C_EMPRESA" value="${$.solver.session.SESSION_EMPRESA}" />
                                <input type="hidden" name="C_VEHICULO" />
                                <input type="hidden" name="C_USUARIO_REGISTRO" value="${$.solver.session.SESSION_ID}" />

                                <div class="row">
                                    <div class="col">
                                        <div class="form-group">
                                            <label for="nombre">Placa</label>
                                            <input type="text" class="form-control form-control-sm" name="PLACA" placeholder="Placa" required autocomplete="off">
                                        </div>
                                    </div>
                                    <div class="col">
                                        <div class="form-group">
                                            <label for="nombre">Marca</label>
                                            <input type="text" class="form-control form-control-sm" name="MARCA" placeholder="Marca" required autocomplete="off">
                                        </div>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col">
                                        <div class="form-group">
                                            <label for="nombre">Modelo</label>
                                            <input type="text" class="form-control form-control-sm" name="MODELO" placeholder="Modelo" required autocomplete="off">
                                        </div>
                                    </div>
                                    <div class="col">
                                        <div class="form-group">
                                            <label for="nombre">Certificado</label>
                                            <input type="text" class="form-control form-control-sm" name="CERTIFICADO" placeholder="Certificado" autocomplete="off">
                                        </div>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col">
                                        <div class="form-group">
                                            <label for="nombre">Tipo</label>
                                            <select name="TIPO" class="form-control form-control-sm">
                                                <option value="Propio" selected="selected">Propio</option>
                                                <option value="Tercero">Tercero</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div class="row tercero" style="display:none">
                                    <div class="col">
                                        <div class="form-group">
                                            <label for="nombre">Ruc</label>
                                            <input type="text" class="form-control form-control-sm" name="RUC" placeholder="Teléfono" autocomplete="off">
                                        </div>
                                        <div class="form-group">
                                            <label for="nombre">Empresa</label>
                                            <input type="text" class="form-control form-control-sm" name="EMPRESA" placeholder="Teléfono" autocomplete="off">
                                        </div>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col">
                                        <div class="form-group">
                                            <label for="nombre">Estado</label>
                                            <select name="IND_ESTADO" class="form-control form-control-sm">
                                                <option value="*" selected="selected">Activo</option>
                                                <option value="&">Inactivo</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <button type="submit" class="btn pull-right btn-danger btn-sm"><i class="fa fa-floppy-o" aria-hidden="true"></i>&nbsp;Guardar</button>
                            </form>
                        `);

                        let _type = 1;
                        let _condition = "";
                        if (_codigo != '') {
                            _type = 2;
                            _condition = `C_EMPRESA = '${$.solver.session.SESSION_EMPRESA}' AND C_VEHICULO = '${_codigo}'`;
                        };

                        $(dialog).find('form[name=frmRegistro]').ValidForm({
                            type: _type,
                            condition: _condition,
                            table: 'LOG.VEHICULO',
                            queryDefault: {
                                query: ['editable_vehiculo'],
                                type: [8],
                                items: [{
                                    table: 'LOG.VEHICULO',
                                    condition: _condition
                                }]
                            },
                            extras: {
                                C_VEHICULO: {
                                    action: {
                                        name: 'GetNextId',
                                        args: $.ConvertObjectToArr({
                                            columns: 'C_EMPRESA',
                                            max_length: 4
                                        })
                                    }
                                }
                            },
                            onDone: function (form, controls) {

                                $(controls.C_EMPRESA).val($.solver.session.SESSION_EMPRESA);

                                if ($(controls.TIPO).val() == 'Tercero') {
                                    $('.tercero').show();
                                }

                                $(controls.TIPO).change(function () {
                                    if ($(controls.TIPO).val() == 'Tercero') {
                                        $('.tercero').show();
                                    }
                                    else {
                                        $('.tercero').hide();
                                    }
                                })

                            },
                            onReady: function (result, controls) {
                                alertify.success('Se registró la información.');
                                if (typeof _arguments.onReady === 'function') {
                                    _arguments.onReady(result, controls, dialog);
                                }
                            },
                            onError: function (error) {
                                $.CloseStatusBar();
                                $.ShowError({ error: error });
                            },
                        });

                        dialog.on('hide.bs.modal', function () {
                            if (typeof _arguments.onCloseModal === 'function') {
                                _arguments.onCloseModal(token, dialog);
                            }
                        });

                        $('.bootbox .modal-dialog').draggable({ handle: '.modal-header' });
                        $('.bootbox .modal-header').css('cursor', 'move');

                    }, 150)

                })
            });
        },
        fnActivarFechas: function (...controls) {
            require(["datetimepicker"], function () {
                controls.forEach(control => {
                    $(control).datetimepicker({
                        format: 'DD/MM/YYYY',
                        locale: 'es'
                    });
                });
            });
        },
        /**
         * Método para crear conceptos desde cualquier módulo
         * */
        fnCrearConcepto: function () {
            const _arguments = $.GetArgs({}, arguments);
            const module = _arguments.module || '';
            const title = _arguments.title || 'Nuevo concepto';
            const code = _arguments.code || '';

            if (module == '') {
                console.error('Parametro módulo es requerido.');
                return;
            }

            require(["bootbox"], function (bootbox) {

                // Variables
                const token = $.CreateToken();
                const dialog = bootbox.dialog({
                    title: title,
                    message: `<div id="${token}"></div>`,
                    onEscape: true
                });
                const form = `form[name=form${token}]`
                const table = 'LOG.CONCEPTOS_ALMACEN'
                const type = (code == '' ? 1 : 2)
                const condition = (code == '' ? '' : `C_EMPRESA = '${$.solver.session.SESSION_EMPRESA}' AND C_CONCEPTO_ALMACEN = '${code}'`)
                const html = `  <form name="form${token}" action="#" method="post" autocomplete="off">
                                    <input type="hidden" name="C_EMPRESA" value="${$.solver.session.SESSION_EMPRESA}" />
                                    <input type="hidden" name="C_CONCEPTO_ALMACEN" />
                                    <input type="hidden" name="REQ_APROB" value="&" />

                                    <div class="row">
                                        <div class="col-9">
                                            <div class="form-group">
                                                <label class="col-form-label col-form-label-sm" for="NOMBRE_CONCEPTO_ALMACEN">Nombre concepto</label>
                                                <input type="text" id="NOMBRE_CONCEPTO_ALMACEN" name="NOMBRE_CONCEPTO_ALMACEN" class="form-control form-control-sm" maxlength="250" required />
                                            </div>
                                        </div>
                                        <div class="col-3">
                                            <div class="form-group">
                                                <label class="col-form-label col-form-label-sm">Tipo</label>
                                                <select class="form-control form-control-sm" name="C_PARAMETRO_GENERAL_COD_TIPO"
                                                        data-query="gbl_obtener_parametro_general" data-value="CODIGO" data-field="DESCRIPCION"
                                                        data-tipoParametro="Tipo Concepto Almacén" required></select>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="row">
                                        <div class="col-3">
                                            <div class="form-group">
                                                <label class="col-form-label col-form-label-sm">Cuenta contable</label>
                                                <div class="input-group mb-3">
                                                    <input type="text" name="CTA_CONTABLE" class="form-control form-control-sm"
                                                            aria-describedby="basic-addon2" readonly />
                                                    <div class="input-group-append">
                                                        <button type="button" name="deleteCtaContable" class="btn btn-gray btn-sm"><i class="fa fa-close"></i></button>
                                                        <button type="button" name="searchCtaContable" class="btn btn-orange btn-sm"><i class="fa fa-search-plus"></i></button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="col-4">
                                            <div class="form-group">
                                                <label class="col-form-label col-form-label-sm">Flag concepto</label>
                                                <select name="FLAG" class="form-control form-control-sm"
                                                        data-query="gbl_obtener_parametro_general" data-value="CODIGO_PARAMETRO" data-field="DESCRIPCION"
                                                        data-tipoParametro="Flag Módulo" required></select>
                                            </div>
                                        </div>
                                        <div class="col-2">
                                            <label class="col-form-label col-form-label-sm">Req. aprobación</label>
                                            <div class="form-check">
                                                <input type="checkbox" id="CHECK_REQ_APROB" name="CHECK_REQ_APROB" class="form-check-input" data-nosend="1"/>
                                                <label class="form-check-label" for="CHECK_REQ_APROB">Si</label>
                                            </div>
                                        </div>
                                        <div class="col-3">
                                            <div class="form-group">
                                                <label class="col-form-label col-form-label-sm">Estado</label>
                                                <select name="IND_ESTADO" class="form-control form-control-sm" required>
                                                    <option value="*"> Activo</option>
                                                    <option value="&"> Inactivo</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="row">
                                        <div class="col">
                                            <div class="form-group">
                                                <label class="col-form-label col-form-label-sm" for="OBSERVACIONES">Observaciones</label>
                                                <input type="text" name="OBSERVACIONES" id="OBSERVACIONES" class="form-control form-control-sm" />
                                            </div>
                                        </div>
                                    </div>
                                    <div class="row">
                                        <div class="col">
                                             <div class="form-group">
                                                <button type="submit" class="btn btn-danger btn-sm pull-right"><i class="fa fa-floppy-o" aria-hidden="true"></i> Guardar</button>
                                            </div>
                                        </div>
                                    </div>
                                </form>`;

                let _controls;

                // Método para marcar el checkbox req aprob.
                const verifyCheckBox = function () {
                    const boolReqAprob = $(_controls.REQ_APROB).val() == '*' ? true : false;
                    $(_controls.CHECK_REQ_APROB).prop('checked', boolReqAprob);
                }

                dialog.init(function () {
                    setTimeout(function () {

                        // Insertamos html
                        $(dialog).find('#' + token).html(html);

                        // Ejecutamos formulario
                        $(dialog).find(form).ValidForm({
                            table: table,
                            type: type,
                            condition: condition,
                            extras: {
                                C_CONCEPTO_ALMACEN: {
                                    action: {
                                        name: 'GetNextId',
                                        args: $.ConvertObjectToArr({
                                            columns: 'C_EMPRESA',
                                            max_length: '3'
                                        })
                                    }
                                }
                            },
                            querySave: true,
                            queryDefault: {
                                query: ['editableConceptosAlmacen'],
                                type: [8],
                                items: [{
                                    table: table,
                                    condition: condition
                                }]
                            },
                            onDone: function (_, controls) {
                                _controls = controls;

                                verifyCheckBox();

                                // Eventos
                                $(controls.CHECK_REQ_APROB).change(function () {
                                    const reqAprob = $(controls.CHECK_REQ_APROB).prop('checked') ? '*' : '&';
                                    $(controls.REQ_APROB).val(reqAprob)
                                    verifyCheckBox();
                                });
                                $(controls.searchCtaContable).click(function () {
                                    $.solver.fn.fnSeleccionarCtaContable({
                                        onReady: function (row) {
                                            $(controls.CTA_CONTABLE).val(row.CODIGO_PLAN);
                                        }
                                    });
                                });
                                $(controls.deleteCtaContable).click(function () {
                                    $(controls.CTA_CONTABLE).val('')
                                });
                            },
                            onReady: function (result, controls, form) {
                                if (typeof _arguments.onReady === 'function') {
                                    _arguments.onReady(form, controls, token, dialog);
                                }
                                $(dialog).modal('hide');
                            },
                            onError: function (error) {
                                $.CloseStatusBar();
                                $.ShowError({ error: error });
                            }
                        })

                        $(dialog).find('.modal-dialog').css({ 'max-width': '40%' })
                        $('.bootbox .modal-dialog').draggable({ handle: '.modal-header' });
                        $('.bootbox .modal-header').css('cursor', 'move');
                    })
                })
            });
        },
        fnEliminarConcepto: function () {
            const _arguments = $.GetArgs({}, arguments);
            const code = _arguments.code || '';

            if (code == '') {
                console.error('Parametro code es requerido.');
                return;
            }

            require(["alertify"], function (alertify) {
                // Variables
                const table = 'LOG.CONCEPTOS_ALMACEN'
                const type = 2;
                const condition = `C_CONCEPTO_ALMACEN = '${code}' AND C_EMPRESA = '${$.solver.session.SESSION_EMPRESA}'`;
                const items = $.ConvertObjectToArr({
                    C_CONCEPTO_ALMACEN: code,
                    C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                    IND_ESTADO: 'E'
                });

                $.AddPetition({
                    table,
                    type,
                    condition,
                    items
                });
                $.SendPetition({
                    connectToLogin: 'S',
                    onReady: function () {
                        $.CloseStatusBar();
                        if (typeof _arguments.onReady === 'function') {
                            _arguments.onReady();
                        }
                    },
                    onBefore: function () {
                        $.DisplayStatusBar({ message: 'Eliminando concepto.' });
                    },
                    onError: function (_error) {
                        $.CloseStatusBar();
                        $.ShowError({ error: _error });
                    }
                });
            });
        },
        fnSeleccionarCtaContable: function () {
            const _arguments = $.GetArgs({}, arguments);

            $.solver.fn.fnAbrirModal({
                title: 'Busqueda de plan contable',
                query: 'tbl_mantenimiento_obtenerplanes',
                hiddens: ['C_EMPRESA', 'CODIGO'],
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
                    if (typeof _arguments.onReady === 'function') {
                        _arguments.onReady(row);
                    }
                }
            })
        },
        fnValidarMovimientosProducto: function () {
            const _arguments = $.GetArgs({}, arguments);
            const c_producto = _arguments.c_producto;

            $.GetQuery({
                query: ['gbl_validar_movimientos_producto'],
                items: [{
                    C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                    C_PRODUCTO: c_producto
                }],
                onReady: function (result) {
                    if (typeof _arguments.callback === 'function') {
                        _arguments.callback(result);
                    }
                }
            })

        }
    }
};

//Funcciones Extendidas de JQuery
$.extend({

    //Convierte un objeto a un array
    ConvertObjectToArr: function (object, params) {

        var new_obecjt = [];
        var new_extras = params || {};

        for (var item in object) {

            var inrow = object[item];
            var inc_data = { name: item, value: '', _localtype: typeof inrow };

            if (typeof new_extras[item] != 'undefined') {
                if (typeof new_extras[item] == 'object') {
                    inc_data = $.extend(inc_data, new_extras[item]);
                }
            };

            if (inrow == null) {
                inc_data.value = null;
            } else if (typeof (inrow) == 'object') {
                inc_data.value = inrow.toString();
            } else if (typeof (inrow) == 'function') {
                inc_data.value = inrow();
            } else {
                inc_data.value = inrow
            };

            new_obecjt.push(inc_data);

        };

        return new_obecjt;
    },
    //Create Error
    AddError: function (message, options) {
        var arrError = [];
        var objError = {};
        //Validate Error Global
        if (typeof $.solver.errors === 'undefined') {
            $.solver.errors = [];
        }
        arrError = $.solver.errors;
        //Agregate Error
        if (message.length !== 0) {
            objError = { message: message, options: options || {} };
            arrError.push(objError);
        }
    },
    //Get Arguments
    GetArgs: function (_default, _arguments) {

        var argsDefault = $.extend({ options: {} }, _default);
        var argsTempory = {};

        if (_arguments.length === 1) {
            if (typeof _arguments[0] === 'object') {
                return $.extend(argsDefault, _arguments[0]);
            }
            if (typeof _arguments[0] === 'string') {
                argsTempory['GetMethod'] = _arguments[0];
                return $.extend(argsDefault, argsTempory);
            }
        };

        if (_arguments.length === 2) {

            if (typeof _arguments[0] === 'string') {
                argsTempory['GetMethod'] = _arguments[0];
            }
            argsTempory['DataMethod'] = _arguments[1];

            return $.extend(argsDefault, argsTempory);
        };

        return argsDefault;
    },
    //Creador de Token Dinamico
    CreateToken: function (ObjectName, PropertyName) {

        var EncodeText = '';
        var RFornName = ObjectName || Math.floor((Math.random() * 1000) + 1);
        var RCtrlName = PropertyName || Math.floor((Math.random() * 100) + 1);

        EncodeText = md5(RFornName + '-' + RCtrlName);

        return EncodeText;
    },

    //Get Data Remote
    GetData: function () {

        var _arguments = $.GetArgs({}, arguments);
        var _title = _arguments.title || '';
        var _location = _arguments.location || $.solver.layout.homePage;
        var _isPage = _arguments.isPage || false;
        var _type = _arguments.type || 'POST';
        var _contentType = _arguments.contentType || 'text/plain';
        var _dataType = _arguments.dataType || 'json';
        var _uriData = _arguments.uriData || $.solver.services.api + '/Service/';
        var _closeButton = _arguments.closeButton || true;
        var _ready = function (_result) {
            //Validate Web Page or Direct Attention
            if (_isPage == true) {
                if (_location == 'float') {
                    _location = $.CreateToken();
                    require(['bootbox'], function (bootbox) {
                        var dialog = bootbox.dialog({
                            title: _title,
                            message: '<div id="' + _location + '">Cargando...</div>',
                            closeButton: _closeButton,
                            size: _arguments.size || 'normal',
                            className: _arguments.className || null,
                            onEscape: true
                        });
                        dialog.init(function () {
                            _location = '#' + _location;
                            $.SetPage({
                                location: _location,
                                html: _result,
                                onReady: function (_object) {
                                    //Si existe Evento OnReady
                                    if (typeof _arguments.onReady === 'function') _arguments.onReady(_object, dialog);
                                }
                            });
                        });
                        if (typeof _arguments.onCloseModal === 'function') {
                            $(dialog).on('hide.bs.modal', _arguments.onCloseModal);
                        };
                    });
                } else {
                    if (typeof _arguments.onReady === 'function') _arguments.onReady(_result);
                };
            } else {
                //Si existe Evento OnReady
                if (typeof _arguments.onReady === 'function') _arguments.onReady(_result);
            };
        };
        var _error = function (textStatus, error) {
            //Add Error
            var objErr = { textStatus: textStatus, error: error };
            $.AddError('Ha ocurrido un error al comunicarse a ' + _uriData + '.', objErr);
            //Si existe Evento OnError
            if (typeof _arguments.onError === 'function') _arguments.onError(objErr);
        };
        var _before = function () {
            //Si existe Evento onBefore
            if (typeof _arguments.onBefore === 'function') _arguments.onBefore();
        };
        var _config = {};
        var _options = null;

        if (_isPage == true) {
            _dataType = 'html';
        };
        if ($.browser.mobile) {
            _contentType = "application/json; charset=utf-8";
        };
        if (_dataType == 'json') {
            _options = JSON.stringify(_arguments.options);
        } else {
            _options = _arguments.options;
            _contentType = false;
        };

        _config = {
            type: _type,
            url: _uriData,
            data: _options,
            dataType: _dataType,
            contentType: _contentType,
            processData: false,
            global: true,
            async: true,
            cache: false,
            beforeSend: _before,
            success: _ready,
            error: _error,
            xhrFields: {
                withCredentials: false
            },
            crossDomain: true,
            headers: { 'Authorization': 'Berer dXN1YXJpbzpjbGF2ZQ==' },
        };

        if (_uriData.length !== 0) {
            $.ajax(_config);
        } else {
            $.AddError('Error al obtener datos, no se ha definido la url de captura.', _arguments);
        };

    },
    //Add Petition
    AddPetition: function () {

        var _token = $.CreateToken();
        var _default = {
            token: _token,
            table: '',
            type: 0,
            condition: '',
            items: [],
            state: 0,
            transaction: false
        };
        var _arguments = $.GetArgs(_default, arguments);

        $.solver.petitions[_arguments.token] = _arguments;

        return _token;

    },
    //Send Petition to Service
    SendPetition: function () {

        var onSessionTemp = {};
        var _token = $.CreateToken();
        var _petition = {
            token: _token,
            browser: $.ConvertObjectToArr($.browser),
            session: [],
            petitions: []
        };
        var _default = {
            onBefore: function () { console.log(_petition); },
            onReady: function (data) { console.log(data); },
            onError: function (textStatus, error) {
                var objErr = { textStatus: textStatus, error: error };
                $.AddError('Hay ocurrido un error al momento de obtener tu peticion.', objErr);
            }
        };
        var _arguments = $.GetArgs(_default, arguments);
        var connectTo = _arguments.connectTo || '';
        var connectToLogin = _arguments.connectToLogin || 'C';
        var _readyPetition = function (data) {

            var _readyPetition = {};

            //Asignamos Resultados a Cada Peticion
            for (var item in data) {

                var inRow = data[item];
                var petition = $.solver.petitions[inRow.token];

                petition.state = 2;
                petition.result = inRow.result;
                petition.errors = inRow.errors;

                var _itemsFromServer = {};
                for (var i in inRow.items) {
                    var _fila = inRow.items[i];
                    _itemsFromServer[_fila.name] = _fila.value;
                };
                petition.items = _itemsFromServer;

                _readyPetition[inRow.token] = petition;

            };
            //Si existe Evento OnReady
            if (typeof _arguments.onReady === 'function') _arguments.onReady(_readyPetition);
        };
        var _uriData = _arguments.uriData || $.solver.services.api + '/Service/';

        //Asignamos Sessiones Locales
        _petition.sessions = $.ConvertObjectToArr($.solver.session);

        //Agregamos Peticiones
        for (var item in $.solver.petitions) {
            var _object = $.solver.petitions[item];
            if (_object.state == 0) {
                _object.state = 1;
                _petition.petitions.push(_object);
            };
        };

        //Validate ConnectTo
        if (connectTo != '') {
            _petition.connectTo = connectTo;
        };

        //Mode Login
        _petition.connectToLogin = connectToLogin;

        //Llamamos a Servicio API
        $.GetData({
            uriData: _uriData,
            options: _petition,
            onBefore: _arguments.onBefore,
            onReady: _readyPetition,
            onError: _arguments.onError
        });

        return _token;

    },
    //Helpers Functions
    GetQuery: function () {

        var _arguments = $.GetArgs({}, arguments);
        var _query = _arguments.query || [];
        var _items = _arguments.items || [];
        var _type = _arguments.type || [];
        var _connectTo = _arguments.connectTo || '';
        var _connectToLogin = _arguments.connectToLogin || 'S';
        var _transaction = _arguments.transaction || false;
        var _uriData = _arguments.uriData || $.solver.services.api + '/Service/';

        if (_query.length != 0) {

            for (var iQuery in _query) {

                var _nQuery = _query[iQuery];
                var _pQuery = _items[iQuery] || {};
                var _tQuery = _type[iQuery] || 0;
                var _tblQuery = '';

                if (_tQuery == 0 || _tQuery == 4) _pQuery.script = _nQuery;
                if (_tQuery == 5 || _tQuery == 6) _tblQuery = _nQuery;

                $.AddPetition({
                    token: _nQuery,
                    type: _tQuery,
                    table: _tblQuery,
                    items: $.ConvertObjectToArr(_pQuery),
                    transaction: _transaction
                });

            }

            $.SendPetition({
                uriData: _uriData,
                connectTo: _connectTo,
                connectToLogin: _connectToLogin,
                onBefore: function () {
                    //console.log('Obteniendo Query ...', _query);
                    if (typeof _arguments.onBefore === 'function') _arguments.onBefore();
                },
                onError: function (_error) {
                    //console.log('Error al obtener Query ...', _query);
                    if (typeof _arguments.onError === 'function') _arguments.onError(_error);
                },
                onReady: function (_result) {

                    var _data;
                    var _object;

                    if (_query.length == 1) {
                        _data = _result[_query[0]].result.rows;
                        _object = _result[_query[0]].result;
                    } else {
                        _data = _result;
                        _object = _result;
                    };

                    if (typeof _arguments.onReady === 'function') _arguments.onReady(_data, _object, _result);

                }
            });

        } else {

            //console.log('No se ha definido el codigo o nombre del query a procesar ...');
            if (typeof _arguments.onError === 'function') _arguments.onError();

        }

    },

    //Upload File (consume servicio: files)
    UploadFile: function () {

        var _arguments = $.GetArgs({}, arguments);
        var _destino = _arguments.destino || 'Files';
        var _table = _arguments.table || 'App';
        var _temporal = _arguments.temporal || 'N';
        var _log = _arguments.log || 'N';
        var _title = _arguments.title || 'Carga de archivos';
        var _extFiles = _arguments.extFiles || [];

        require(['helper', 'fileinput.es'], function () {
            require(["bootbox"], function (bootbox) {

                const token = $.CreateToken();
                let dialog = bootbox.dialog({
                    title: _title,
                    message: `<div id="${token}"></div>`,
                    onEscape: true
                });

                dialog.init(function () {

                    //Creamos Html
                    $(dialog).find(`#${token}`).html(`
                        <div class="form-group row">
                            <div class="col-sm-12">
                                <label class="control-label label-bold">(*) Haga click en examinar o arrastre y suelte sus archivos:</label>
                                <div class="file-loading">
                                    <input id="input-${token}" name="input-${token}" type="file" multiple required>
                                </div>
                            </div>
                        </div>
                    `);

                    //Creamos FileInput
                    $(dialog).find(`#input-${token}`).fileinput({
                        language: 'es',
                        maxFileCount: 1,
                        showPreview: true,
                        mainClass: "input-group-sm",
                        uploadUrl: $.solver.services.files + `/Service/Upload2/${_destino}/${_table}/${_temporal}/${_log}`,
                        uploadAsync: true,
                        allowedFileExtensions: _extFiles,
                    });

                    //Despues de cargar archivos enviamos al servicio
                    $(dialog).find(`#input-${token}`).on("filebatchselected", function (event, files) {
                        $(dialog).find(`#input-${token}`).fileinput("upload");
                        $.DisplayStatusBar({
                            message: 'Espere un momento se esta cargando su archivo ...'
                        });
                    });

                    //Si ocurre un error en la subida
                    $(dialog).find(`#input-${token}`).on('fileuploaderror', function (event, data, msg) {
                        $.CloseStatusBar();
                        if (typeof _arguments.onError === 'function') _arguments.onError({ event, data, msg });
                    });

                    //Si el proceso fue correcto enviamos token a la respuesta
                    $(dialog).find(`#input-${token}`).on("fileuploaded", function (event, data, previewId, index) {
                        $.CloseStatusBar();
                        $(dialog).modal('hide');
                        if (typeof _arguments.onReady === 'function') _arguments.onReady(data.response.token);
                    });

                });

            });
        });

    },
    //Descargar Excel File From Query
    DownloadFile: function () {

        var _arguments = $.GetArgs({}, arguments);
        var _uri = _arguments.uri || $.solver.services.api + "/Service/DownloadExcel/";
        var _nameFile = _arguments.nameFile || 'Descarga';
        var _query = _arguments.query || '';
        var _params = _arguments.params || {};
        var _action = _uri + _query;
        var _form = null;
        var _formToken = $.CreateToken();
        var _type = _arguments.type || 0;
        var _method = _arguments.method || 'post';

        //Set Property Actions
        $('body').append('<iframe style="display:none;" name="' + _formToken + '"></iframe>');
        $('body').append('<form id="' + _formToken + '" target="' + _formToken + '"></form>');
        _form = $('body').find('form#' + _formToken);
        _form.attr('action', _action).attr('method', _method).addClass('d-none');
        //Agregamos Parametros a Formulario
        _params['TypeTo'] = _type;
        _params['namefile'] = _nameFile;
        for (var _name in _params) {
            var _valor = '';
            if (typeof _params[_name] == 'function') {
                _valor = _params[_name]();
            } else {
                _valor = _params[_name];
            }
            //Add input
            _form.append('<input type="hidden" name="' + _name + '" value="' + _valor + '" />');
        };
        //Launch Form
        _form.submit();
    },
    //Send Printer (consume servicio: files)
    SendPrinter: function () {

        var _arguments = $.GetArgs({}, arguments);
        var _empresa = _arguments.empresa || '';
        var _formato = _arguments.formato || '';
        var _impresora = _arguments.impresora || '';
        var _copias = _arguments.copias || 1;
        var _papel = _arguments.papel || 'A4';
        var _querys = _arguments.querys || [];

        if (_empresa != '' && _formato != '' && _impresora != '') {

            var optionsToServer = {
                empresa: _empresa,
                formato: _formato,
                impresora: _impresora,
                querys: _querys,
                copias: _copias,
                papel: _papel
            };

            $.GetData({
                uriData: $.solver.services.files + "/Service/SendPrinter",
                options: optionsToServer,
                onBefore: function () {
                    if (typeof _arguments.onBefore === 'function') _arguments.onBefore();
                },
                onReady: function (result) {
                    if (typeof _arguments.onReady === 'function') _arguments.onReady(result);
                },
                onError: function (_error) {
                    if (typeof _arguments.onError === 'function') _arguments.onError(_error);
                }
            });

        } else {

            if (typeof _arguments.onError === 'function') _arguments.onError();

        };

    },
    //Create PDF Document (consume servicio: files)
    CreatePDFDocument: function () {

        var _arguments = $.GetArgs({}, arguments);
        var _empresa = _arguments.empresa || '';
        var _formato = _arguments.formato || '';
        var _papel = _arguments.papel || 'A4';
        var _querys = _arguments.querys || [];

        if (_empresa != '' && _formato != '') {

            var optionsToServer = {
                empresa: _empresa,
                formato: _formato,
                querys: _querys,
                papel: _papel
            };

            $.GetData({
                uriData: $.solver.services.files + "/Service/CreatePDFDocument",
                options: optionsToServer,
                onBefore: function () {
                    if (typeof _arguments.onBefore === 'function') _arguments.onBefore();
                },
                onReady: function (result) {
                    if (typeof _arguments.onReady === 'function') _arguments.onReady(result);
                },
                onError: function (_error) {
                    if (typeof _arguments.onError === 'function') _arguments.onError(_error);
                }
            });

        } else {

            if (typeof _arguments.onError === 'function') _arguments.onError();

        };

    },

    //Show Status Bar
    DisplayStatusBar: function () {

        var _default = {};
        var _arguments = $.GetArgs(_default, arguments);
        var _message = _arguments.message || 'Cargando aplicación...';
        var _code = _arguments.code || 'status-bar-app';
        var _class = _arguments.class || 'fa fa-refresh fa-spin fa-fw';
        var _timeout = _arguments.timeout || 0;
        var _object = null;
        var _progressBar = _arguments.progressbar || false;
        var _maxValue = _arguments.maxvalue || 100;
        var _setValue = _arguments.setvalue;

        if (!$('div.' + _code).length) {
            $('body').append('<div class="' + _code + '"></div>');
        };

        _object = $('div.status-bar-app');
        _object.html('<div class="text"><div><i class="' + _class + '"></i> ' + _message + '</div></div>');

        if (_progressBar) {
            _object.find('.text').append(`
                <div class="row mt-3 justify-content-center">
                    <div class="col-6">
                        <div class="progress">
                          <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow="${_setValue}" aria-valuemin="0" aria-valuemax="${_maxValue}" style="width: ${_setValue}%"></div>
                        </div>
                    </div>
                </div>
            `);
        };

        if (_timeout != 0) {
            setTimeout(function () {
                _object.remove();
                if (typeof _arguments.onReady === 'function') _arguments.onReady();
            }, _timeout);
        };

    },
    //Hide Status Bar
    CloseStatusBar: function () {

        var _default = {};
        var _arguments = $.GetArgs(_default, arguments);
        var _code = _arguments.code || 'status-bar-app';

        if ($('div.' + _code).length) {
            $('div.' + _code).remove();
        };

    },

    //Show Status Bar
    DisplayErrorConnect: function () {

        var _default = {};
        var _arguments = $.GetArgs(_default, arguments);
        var _message = _arguments.message || 'No hay conexión con el servicio...';
        var _code = _arguments.code || 'error-connection';
        var _class = _arguments.class || 'fa fa-exclamation';
        var _timeout = _arguments.timeout || 0;
        var _object = null;

        if (!$('div.' + _code).length) {
            $('body').append('<div class="' + _code + '"></div>');
        };

        _object = $('div.error-connection');
        _object.html('<div class="text"><i class="' + _class + '"></i> ' + _message + '</div>');

        if (_timeout != 0) {
            setTimeout(function () {
                _object.remove();
                if (typeof _arguments.onReady === 'function') _arguments.onReady();
            }, _timeout);
        };

    },
    //Hide Status Bar
    CloseErrorConnect: function () {

        var _default = {};
        var _arguments = $.GetArgs(_default, arguments);
        var _code = _arguments.code || 'error-connection';

        if ($('div.' + _code).length) {
            $('div.' + _code).remove();
        };

    },
    //Set HTML on Site
    SetPage: function () {

        var _arguments = $.GetArgs({}, arguments);
        var _location = _arguments.location || 'body';
        var _html = _arguments.html || '';
        var _deps = _arguments.deps || [];
        var _path = _arguments.path || '';
        //var uriTheme = 'theme/' + $.solver.theme + '/';

        //Set HTML on Page
        if (_html.length !== '') {
            $(_location).html(_html);
        };

        //Load Dependencies
        //for (var item in _deps) {
        //    var deps = _deps[item];
        //    if (typeof deps.type !== 'undefined') {
        //        if (deps.type === 'css') $.LoadCss(uriTheme + deps.path + "?version=" + (new Date()).getTime());
        //        if (deps.type === 'js') require([uriTheme + deps.path]);
        //    }
        //}

        //OnReady
        if (typeof _arguments.onReady === 'function') _arguments.onReady($(_location));

    },
    //Show Error
    ShowError: function () {

        var _default = {};
        var _arguments = $.GetArgs(_default, arguments);
        var _error = _arguments.error || { textStatus: {} };
        var _response = _error.textStatus;
        var _responseJSON = _response.responseJSON || [];
        var _textError = '';

        for (var item in _responseJSON) {
            var _rowError = _responseJSON[item];
            var _index = parseInt(item) + 1;
            if (_textError.length != 0) _textError += '<br />';
            _textError += '<span style="font-size:0.8rem;"><strong>' + _index + ')</strong> ' + _rowError.message + '</span>';
        }

        require(['alertify'], function (alertify) {

            alertify.alert('Closable: false').set('closable', false);
            alertify.alert().setting({
                'title': '<span style="color:red;"><i class="fa fa-exclamation-triangle" aria-hidden="true"></i> No se completó la operación debido a los siguientes errores</span>',
                'label': 'Cerrar',
                'message': _textError
            }).show();

        });

    },

    //Set Localization ES-jqxDataTable
    SetLocatizationJQX: function () {

        var localizationobj = {};
        var days = {
            names: ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sábado", "Domingo"],
            namesAbbr: ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"],
            namesShort: ["Lu", "Ma", "Mi", "Ju", "Vi", "Sa", "Do"]
        };
        var months = {
            names: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Setiembre", "Octubre", "Noviembre", "Diciembre", ""],
            namesAbbr: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic", ""]
        };
        var patterns = {
            d: "dd.MM.yyyy",
            D: "dddd, d. MMMM yyyy",
            t: "HH:mm",
            T: "HH:mm:ss",
            f: "dddd, d. MMMM yyyy HH:mm",
            F: "dddd, d. MMMM yyyy HH:mm:ss",
            M: "dd MMMM",
            Y: "MMMM yyyy"
        }

        localizationobj.pagerGoToPageString = "Ir a:";
        localizationobj.pagerShowRowsString = "Mostrar línea:";
        localizationobj.pagerRangeString = " de ";
        localizationobj.pagerNextButtonString = "Siguiente";
        localizationobj.pagerFirstButtonString = "Primero";
        localizationobj.pagerLastButtonString = "Último";
        localizationobj.pagerPreviousButtonString = "Anterior";
        localizationobj.sortAscendingString = "Ordenar ascendente";
        localizationobj.sortDescendingString = "Ordenar descendente";
        localizationobj.sortRemoveString = "Eliminar clasificación";
        localizationobj.emptydatastring = "No se muestran datos";
        localizationobj.firstDay = 1;
        localizationobj.percentSymbol = "%";
        localizationobj.currencySymbol = "S/";
        localizationobj.currencySymbolPosition = "before";
        localizationobj.decimalSeparator = ".";
        localizationobj.thousandsSeparator = ",";
        localizationobj.days = days;
        localizationobj.months = months;
        localizationobj.patterns = patterns;
        localizationobj.loadtext = "Cargando";

        return localizationobj;

    },

    //Check User Session
    CheckSession: function () {

        if (!$('body').find('img#session_solver').length) {
            $('body').append(`<img id="session_solver" title="Solver Web" src="${$.solver.domainUrl}/Cuenta/CheckSession/${$.CreateToken()}" class="d-none" />`);
        };

        setInterval(function () {
            $('img#session_solver').attr('src', `${$.solver.domainUrl}/Cuenta/CheckSession/${$.CreateToken()}`);
        }, 125000);

    },
    //Logout User Session
    LogoutSession: function () {

        var _arguments = $.GetArgs({}, arguments);

        $.GetData({
            type: 'GET',
            dataType: 'html',
            uriData: "/Cuenta/Logout",
            onBefore: function () {
                $.DisplayStatusBar({ message: 'Cerrando cuenta de usuario.' });
            },
            onReady: function () {
                $.CloseStatusBar();
                if (typeof _arguments.onReady === 'function') _arguments.onReady();
            },
            onError: function () {
                $.CloseStatusBar();
                if (typeof _arguments.onError === 'function') _arguments.onError();
            }
        });

    },
    //Set User Session
    SetUserSession: function () {

        var _arguments = $.GetArgs({}, arguments);
        var _username = _arguments.username || '';
        var _password = _arguments.password || '';

        $.GetData({
            type: 'GET',
            dataType: 'html',
            uriData: "/Cuenta/SetSession",
            options: $.param({ username: _username, password: _password }),
            onBefore: function () {
                $.DisplayStatusBar({ message: 'Validando accesos del usuario ...' });
            },
            onReady: function () {
                $.CloseStatusBar();
                if (typeof _arguments.onReady === 'function') _arguments.onReady();
            },
            onError: function () {
                $.CloseStatusBar();
                if (typeof _arguments.onError === 'function') _arguments.onError();
            }
        });

    },
    //Change User Session
    ChangeSession: function (onscape) {

        const formLogin = function () {

            require(["alertify", "bootbox", "keyboard"], function (alertify, bootbox) {

                const tokenLogin = $.CreateToken();
                let dialogLogin = bootbox.dialog({
                    message: `<div id="${tokenLogin}"></div>`,
                    onEscape: onscape,
                    closeButton: onscape
                    //centerVertical: true
                });

                alertify.set('notifier', 'position', 'top-center');

                dialogLogin.init(function () {
                    setTimeout(function () {

                        let _urlActual = window.location.href;
                        let _html = `
                            <form id="frmLogin" class="form-row p-3 rounded" method="post" action="/Cuenta/Login">

                                <div class="form-group col-md-12 mb-4">
                                    <center>
                                        <h4 class="font-raleway"><strong>INICIO DE SESI&Oacute;N</strong></h4>
                                    </center>
                                </div>

                                <div class="form-group col-md-12 mb-4">
                                    <div class="logo-theme-img"></div>
                                </div>

                                <div class="form-group col-md-12 mt-2">
                                    <div class="d-flex align-items-center">
                                        <select name="username" type="text" class="form-control form-control-lg pr-4 shadow-none" id="id-login-username" required data-query="q_puntoventa_procesos_obtener_usuarios" data-value="SESSION_ID" data-field="SESSION_NOMBRE" data-empresa="${$.solver.session.SESSION_EMPRESA}"></select>
                                    </div>
                                </div>

                                <div class="form-group col-md-12 mt-2">
                                    <div class="d-flex align-items-center">
                                        <input name="password" type="password" class="form-control form-control-lg pr-4 shadow-none" placeholder="Contraseña" id="id-login-password" autocomplete="off" required />
                                    </div>
                                </div>

                                <div class="form-group col-md-12">
                                    <div class="d-grid gap-2">
                                        <button type="submit" class="btn btn-danger btn-lg btn-block btn-bold mt-1 mb-0">
                                            ACCEDER
                                        </button>
                                    </div>
                                </div>

                                <input type="hidden" name="redirect" value="${_urlActual}" />

                            </form>
                        `;

                        $(dialogLogin).find(`#${tokenLogin}`).html(_html);
                        $(dialogLogin).find(`#${tokenLogin}`).find('#frmLogin').ValidForm({
                            type: -1,
                            onDone: function (form, control) {

                                $(control.username).change(function () {
                                    $(control.password).focus();
                                });

                                //$(control.password).keyboard({
                                //layout: 'num',
                                //restrictInput: true, // Prevent keys not in the displayed keyboard from being typed in
                                //preventPaste: true,  // prevent ctrl-v and right click
                                //autoAccept: true
                                //});

                            },
                            onReady: function (form, control, data) {

                                $.SetUserSession({
                                    username: data.username,
                                    password: data.password,
                                    onReady: function () {

                                        $.DisplayStatusBar({ message: 'Actualizando página.' });

                                        location.reload();

                                    },
                                    onError: function () {
                                        alertify.error('El usuario y contraseña no coinciden.');
                                    }
                                });

                            }
                        });

                    });
                });

            });

        };

        formLogin();

    },
    //Start User Session
    StartSession: function () {

        var CallInitApp = function (result) {
            if (result != null) {
                for (var key in result) {
                    $.solver.session[key] = result[key];
                    localStorage.setItem(key, result[key]);
                };
            };
            $.InitApplication();
        };

        //asignamos los datos locales de la web
        if (localStorage.getItem("SESSION_ID") != null) {
            for (var key in localStorage) {
                $.solver.session[key] = localStorage.getItem(key);
            };
        };

        //obtenemos datos de la session del usuario
        $.GetData({
            uriData: `${$.solver.domainUrl}/Cuenta/GetSession`,
            onReady: function (result) {
                CallInitApp(result);
            },
            onError: function () {
                if (localStorage.getItem("SESSION_ID") != null) {
                    localStorage.clear();
                    document.location = `${$.solver.domainUrl}/Cuenta/Logout`;
                };
            }
        });

    },
    //Get Options for User
    GetOptionsUser: function () {

        var _arguments = $.GetArgs({}, arguments);
        var _modulo = _arguments.modulo || '';
        var _menu = _arguments.menu || '';
        var _opcion = _arguments.opcion || '';

        $.GetQuery({
            query: ['gbl_obtener_opciones_modulo_usuario_empresa'],
            items: [{
                filter_modulo: _modulo,
                filter_menu: _menu,
                filter_opcion: _opcion,
                modo: '&',
                usuario: $.solver.session.SESSION_ID,
                empresa: $.solver.session.SESSION_EMPRESA
            }],
            onBefore: function () {
                if (typeof _arguments.onBefore === 'function') _arguments.onBefore();
            },
            onReady: function (result) {
                if (typeof _arguments.onReady === 'function') _arguments.onReady(result);
            },
            onError: function (error) {
                if (typeof _arguments.onError === 'function') _arguments.onError(error);
            }
        });

    }
});

//Funcciones Extendidas de JQuery + Selecctores
$.fn.extend({
    GetDataAtrributte: function () {
        var data = {};
        [].forEach.call(this.get(0).attributes, function (attr) {
            if (/^data-/.test(attr.name)) {
                var camelCaseName = attr.name.substr(5).replace(/-(.)/g, function ($0, $1) {
                    return $1;
                });
                data[camelCaseName] = attr.value;
            }
        });
        return data;
    },
    FieldIsRequired: function () {
        return this.each(function () {
            var form = $(this).closest('form');
            var name = $(this).attr('name') || $.CreateToken();
            var label = form.find('label[for=' + name + ']');
            if (label.length) {
                label.find('span').remove();
                //label.removeClass('text-danger');
                if ($(this).is('[required]')) {
                    var text = label.text();
                    label.prepend('<span>(*) </span>');
                    //label.addClass('text-danger');
                };
            };
        });
    },
    FieldLoadRemote: function () {

        var _arguments = $.GetArgs({}, arguments);

        return this.each(function () {

            var _form = $(this).closest('form');
            var _control = $(this);
            var _name = $(this).attr('name') || $.CreateToken();
            var _query = $(this).attr('data-query') || '';
            var _value = $(this).attr('data-value') || '';
            var _field = $(this).attr('data-field') || '';
            var _selected = $(this).attr('data-selected') || 0;
            var _text = $(this).attr('data-text') || '';
            var _token = '';
            var _textDefault = $(this).attr('data-textDefault') || '--seleccione--'; //texto por defecto combo
            var _enableDefault = $(this).attr('data-enableDefault') || 1; //habilita el texto por defecto
            var _data = $(this).GetDataAtrributte();
            var _mode = $(this).attr('data-mode') || '';
            var _connectTo = $(this).attr('data-connectTo') || '';

            if (_query != '' && _mode == '') {
                _data.script = _query;
                _token = $.AddPetition({
                    items: $.ConvertObjectToArr(_data)
                });
                $.SendPetition({
                    connectTo: _connectTo,
                    onError: function (error) {
                        //Agregate Indicator Success Form (1)
                        if (_form.length) {
                            _form.data("task")[_name] = 0;
                        }
                        if (typeof _arguments.onError === 'function') _arguments.onError(error);
                    },
                    onBefore: function () {
                        //Agregate Indicator Pending Form (0)
                        if (_form.length) {
                            var _data = _form.data("task") || {};
                            _data[_name] = 1;
                            _form.data("task", _data);
                        }
                        _control.html('');
                        _control.attr('disabled', 'readonly');
                        //call action referential
                        if (typeof _arguments.onBefore === 'function') _arguments.onBefore(_control);
                    },
                    onReady: function (_result) {

                        var _data = _result[_token].result.rows;
                        var _index = 0;

                        _control.html('');

                        //Process Rows to Select
                        if (_enableDefault == 1) _control.append('<option data-index="' + _index + '" value="">' + _textDefault + '</option>');
                        for (var item in _data) {
                            var _inRow = _data[item];
                            _index++;
                            _control.append('<option data-row="' + item + '" data-index="' + _index + '" value="' + _inRow[_value] + '">' + _inRow[_field] + '</option>');
                        };

                        _control.find('option[data-index=' + _selected + ']').attr('selected', 'selected');

                        if (_data.length != 0) {
                            _control.removeAttr('readonly');
                            _control.removeAttr('disabled');
                        };

                        _control[0].args = { data: _data };

                        if (_text != '') _control.val(_text);

                        //Agregate Indicator Success Form (1)
                        if (_form.length) {
                            _form.data("task")[_name] = 0;
                        }

                        //call action referential
                        if (typeof _arguments.onReady === 'function') _arguments.onReady(_control, _data, _index);

                    }
                });
            };

        });

    },
    GetJsonForm: function () {

        var _arguments = $.GetArgs({}, arguments);
        var _serialize = $(this).serializeArray();
        var _controls = $(this).GetControlsForm();
        var _jsonForm = {};

        $.each(_serialize, function (i, field) {

            var _control = _controls[field.name];
            var _controlData = null;

            if (typeof _control != 'undefined') {
                _controlData = $(_control).GetDataAtrributte();
                if (typeof _controlData.nosend == 'undefined') _controlData.nosend = 0;
                if (parseInt(_controlData.nosend) == 0) _jsonForm[field.name] = field.value;
            };

        });

        return _jsonForm;
    },
    GetControlsForm: function () {

        var _controls = {};
        var _form = $(this);

        if (typeof $(this)[0].args != 'undefined') {
            if (typeof $(this)[0].args.controls != 'undefined') {
                return $(this)[0].args.controls;
            };
        };

        _form.find('input,textarea,select,button').each(function (index, element) {

            var name_control = $(element).attr('name') || '';

            if (name_control == '') {
                name_control = $.CreateToken();
                $(element).attr('name', name_control);
                $(element).attr("data-nosend", "1");
            };

            if ($(element).prop('tagName') == 'BUTTON') {
                $(element).attr("data-nosend", "1");
            };

            if (!$(element).is('[data-nosend]')) {
                $(element).attr("data-nosend", "0");
            };

            _controls[name_control] = $(element);

        });

        $(this)[0].args = { controls: _controls };

        return _controls;

    },
    ValidForm: function () {

        var _arguments = $.GetArgs({}, arguments);

        return this.each(function () {

            var myResult
            var _form = $(this);
            var _controls = $(this).GetControlsForm();
            var _rules = _arguments.rules || {};
            var _messages = _arguments.messages || {};
            var _table = _arguments.table || '';
            var _type = _arguments.type || 0;
            var _condition = _arguments.condition || '';
            var _querySave = _arguments.querySave || false;
            var _querySaveText = _arguments.querySaveText || '¿Seguro de Guardar el Registro?';
            var _queryDefault = _arguments.queryDefault || {};
            var _connectTo = _arguments.connectTo || '';
            var _connectToLogin = _arguments.connectToLogin || 'C';
            var _extras = _arguments.extras || {};
            var _configControls = _arguments.configControls || {};
            var _checkPending = function () {
                var _timer = setInterval(function () {

                    var _data = _form.data("task") || {};
                    var _total = 0;
                    var _success = function () {
                        //Clear Timer
                        clearInterval(_timer);
                        //On Done
                        if (typeof _arguments.onDone === 'function') _arguments.onDone(_form, _controls, _type, _condition, myResult);
                    };
                    var _checkQueyDefault = function () {

                        if (typeof _queryDefault.query == 'undefined') {
                            _success();
                        } else {
                            //asignamos al formulario que hay un task en curso
                            var _data = _form.data("task") || {};
                            _data["queryDefault"] = 1;
                            _form.data("task", _data);

                            //creamos los querys que se necesitan por defecto en el formulario
                            //Mejora agregando connectTo: _connectTo, para que se vaya a consultar a la bd que se indica en el validform
                            $.GetQuery({
                                connectTo: _connectTo,
                                query: _queryDefault.query,
                                type: _queryDefault.type,
                                items: _queryDefault.items,
                                onError: function () {

                                    //borramos para no continuar con la tarea
                                    _queryDefault = [];

                                    //task terminado
                                    _form.data("task")["queryDefault"] = 0;

                                },
                                onReady: function (data, object, result) {

                                    //recorremos querys recibidos
                                    for (var item in _queryDefault.query) {
                                        myResult = result[_queryDefault.query[item]].result;
                                        if (myResult.rows.length != 0) {
                                            for (var columna in myResult.rows[0]) {
                                                if (typeof _controls[columna] != 'undefined') {
                                                    $(_controls[columna]).val(myResult.rows[0][columna]);
                                                }
                                            }
                                        }
                                    }

                                    //borramos para no continuar con la tarea
                                    _queryDefault = [];

                                    //task terminado
                                    _form.data("task")["queryDefault"] = 0;
                                }
                            });
                        };

                    };

                    for (var item in _data) {
                        _total += _data[item];
                    };

                    if (_total == 0) {
                        _checkQueyDefault();
                    };

                }, 100);
            };
            var _checkForDefault = function () {
                if (typeof _queryDefault.query == 'undefined') {

                    var _tableAttr = _form.attr('data-table') || '';
                    var _tableCondition = _form.attr('data-condition') || '';
                    var _dataSetUpdate = _form.attr('data-setupdate') || '0';

                    if (_tableAttr != '' && _tableCondition != '') {
                        _queryDefault = {
                            query: ['editableDynamic'],
                            type: [8],
                            items: [{
                                table: _tableAttr,
                                condition: _tableCondition
                            }]
                        }
                    };

                    //eliminamos atributos por seguridad
                    _form.removeAttr('data-table');
                    _form.removeAttr('data-condition');

                    if (_dataSetUpdate == '1' && _tableAttr != '' && _tableCondition != '') {
                        _type = 2;
                        _condition = _tableCondition;
                    };

                }
            };

            require(['controls'], function () {

                //Establish is Requirement or Other Validations
                _form.find('input,textarea,select').each(function (index, element) {

                    var _mode = $(this).attr('data-mode') || '';
                    var _configControl = _configControls[$(element).attr('name')] || {};

                    //se comento para validar si hace doble funcionalidad
                    $(element).FieldIsRequired();

                    switch (_mode) {
                        case 'ListBox':
                            $(element).CreateListBox(_configControl);
                            break;
                        case 'Autocomplete':
                            $(element).CreateAutocomplete();
                            break;
                        default:
                            $(element).FieldLoadRemote(_configControl);
                            break;
                    };

                });

                //Set Validate
                _form.validate({
                    rules: _rules,
                    ignore: "span.editer",
                    messages: _messages,
                    errorClass: 'error',
                    validClass: 'success',
                    highlight: function (element, errorClass, validClass) {
                        $(element).closest('.form-group').addClass('has-error').removeClass('has-success');
                    },
                    unhighlight: function (element, errorClass, validClass) {
                        $(element).closest('.form-group').removeClass('has-error').addClass('has-success');
                    },
                    submitHandler: function (form) {

                        var _tokenSubmit = '';
                        var _objectForm = $(form).GetJsonForm();
                        var _objectAction = function () {
                            if (_type > -1) {

                                _tokenSubmit = $.AddPetition({
                                    table: _table,
                                    type: _type,
                                    condition: _condition,
                                    items: $.ConvertObjectToArr(_objectForm, _extras)
                                });

                                if (typeof _arguments.onDetail === 'function') {
                                    _continueSubmit = _arguments.onDetail(form, _controls, _tokenSubmit, _objectForm);
                                    if (typeof _continueSubmit === 'undefined') _continueSubmit = true;
                                };

                                if (_continueSubmit) {
                                    $.SendPetition({
                                        connectTo: _connectTo,
                                        connectToLogin: _connectToLogin,
                                        onBefore: function () {
                                            $.DisplayStatusBar({ message: 'Espere por favor ...' });
                                        },
                                        onReady: function (_result) {
                                            setTimeout(function () {
                                                $.CloseStatusBar();
                                                if (typeof _arguments.onReady === 'function') _arguments.onReady(_result[_tokenSubmit], _controls, _objectForm);
                                            }, 250);
                                        },
                                        onError: function (_error) {
                                            if (typeof _arguments.onError === 'function') _arguments.onError(_error);
                                        }
                                    });
                                };

                            } else {
                                if (typeof _arguments.onReady === 'function') _arguments.onReady({}, _controls, _objectForm);
                            };
                        };
                        var _continueSubmit = true;

                        if (typeof _arguments.type == 'function') _type = _arguments.type();
                        if (typeof _arguments.condition == 'function') _condition = _arguments.condition();

                        //Check Function onSubmit is continue submit
                        if (typeof _arguments.onSubmit === 'function') {
                            _continueSubmit = _arguments.onSubmit(form, _controls, _objectForm);
                            if (typeof _continueSubmit === 'undefined') _continueSubmit = true;
                        };

                        //Query Saving and Check is continue
                        if (_continueSubmit == true) {
                            if (_querySave == true) {
                                require(["alertify"], function (alertify) {

                                    var _querySaveTextShow = '';

                                    if (typeof _querySaveText == 'function') {
                                        _querySaveTextShow = _querySaveText();
                                    } else {
                                        _querySaveTextShow = _querySaveText;
                                    };

                                    alertify.confirm('Confirmar Acción', _querySaveTextShow, function () {
                                        _objectAction();
                                    }, function () {
                                        //alertify.set('notifier', 'position', 'top-right');
                                        //alertify.error('Se ha detenido la operación solicitada.');
                                    }).set('labels', { ok: 'Si', cancel: 'No' });
                                });
                            } else {
                                _objectAction();
                            };
                        };

                    },
                    invalidHandler: function (event, validator) {
                        var errors = validator.numberOfInvalids();
                        if (errors) {
                            //require(["alertify"], function (alertify) {
                            //    if (typeof _arguments.onValidError === 'function') _arguments.onValidError(_objectForm, _controls);
                            //    alertify.set('notifier', 'position', 'top-center');
                            //    alertify.error('Por favor completar los campos obligarorios.');
                            //});
                            require(["sweetalert"], function (Swal) {
                                Swal.fire({
                                    icon: 'error',
                                    //title: 'Faltan datos importantes',
                                    text: 'Por favor completar los campos obligarorios!',
                                    timer: 2500,
                                    confirmButtonText: 'Cerrar',
                                    timerProgressBar: true
                                    //footer: '<a href="">Why do I have this issue?</a>'
                                });
                            });
                        }
                    }
                });

                //Evaluate is default query is defined
                _checkForDefault();

                //Evaluate is Pending Working in Form
                _checkPending();

            });

        });

    },
    CreateTable: function () {

        var _default = {};
        var _arguments = $.GetArgs(_default, arguments);
        var connectTo = _arguments.connectTo || '';
        var connectToLogin = _arguments.connectToLogin || 'C';
        var _query = _arguments.query || '';
        var _firstLoad = _arguments.firstLoad;
        var _items = _arguments.items || {};
        var _type = _arguments.type || 0;
        var _config = _arguments.config || {};
        var _columns = _arguments.columns || {};
        var _hiddens = _arguments.hiddens || [];
        var _sortcolumn = _arguments.sortcolumn || '';
        var _sortdirection = _arguments.sortdirection || 'ASC';
        var _adapter = _arguments.adapter || {};
        var _runTable = function (_result, _table) {

            delete _items.script;
            delete _items.pagesize;
            delete _items.pagenum;
            delete _items.connectTo;
            delete _items.connectToLogin;

            require(["jqwidgets", "helper"], function () {

                require(["moment"], function (moment) {

                    var adaptador = {
                        dataType: "json",
                        dataFields: [],
                        data: _items,
                        id: 'id',
                        type: 'POST',
                        url: $.solver.services.api + "/Service/DataGrid/" + _query + "/"
                    };
                    var adaptador_cols = [];

                    //Extend Adaptador
                    adaptador = $.extend(adaptador, _adapter);

                    //Define Default Cols
                    for (var item in _result.cols) {
                        var col = _result.cols[item];
                        var defColTable = { text: col.name, dataField: col.name, width: '150', align: 'center', cellsAlign: 'left', hidden: false };
                        var defColAdapter = { name: col.name, type: col.type };
                        //Validation Regular Expressions
                        if (col.type === 'int64' || col.type === 'int32') {
                            defColAdapter.type = 'int';
                        };
                        if (col.type === 'datetime') {
                            defColTable.cellsformat = 'DD/MM/YYYY HH:mm:ss';
                            defColTable.cellsRenderer = function (row, column, value, rowData) {
                                var _tempDate = '';
                                if (value != '') {
                                    _tempDate = moment(value).format('DD/MM/YYYY HH:mm:ss');
                                };
                                return _tempDate;
                            };
                            defColAdapter.type = 'date';
                        };
                        if (col.name === "_rowNum") {
                            defColTable.hidden = true;
                        };
                        if ($.inArray(item, _hiddens) != -1) {
                            defColTable.hidden = true;
                        };
                        //Default Config Cols Users
                        if (typeof _columns[item] !== 'undefined') {
                            defColTable = $.extend(defColTable, _columns[item]);
                        };
                        //Add Config to Var
                        adaptador_cols.push(defColTable);
                        adaptador.dataFields.push(defColAdapter);
                    };

                    if (typeof _config.columns == 'undefined') _config.columns = [];
                    //Extra Columns
                    for (var item in _columns) {
                        if (typeof _result.cols[item] == 'undefined') {
                            if ($.inArray(item, _hiddens) != -1) {
                                _columns[item].hidden = true;
                            };
                            adaptador_cols.push(_columns[item]);
                        };
                    };
                    //Add Order Initial Columns
                    if (_sortcolumn.length != 0) {
                        adaptador.sortcolumn = _sortcolumn;
                        adaptador.sortdirection = _sortdirection;
                    };
                    //Set Method to Connect
                    if (connectTo.length != 0) _items.ConnectTo = connectTo;
                    _items.TypeTo = _type;
                    //Set Values to Config
                    _config.source = new $.jqx.dataAdapter(adaptador, {
                        loadServerData: function (serverdata, source, callback) {

                            _table[0]['args'] = _config;

                            var getRemoteData = function () {
                                //Parameters
                                var optionsAtServer = JSON.parse(JSON.stringify(serverdata));
                                var optionsToServer = {
                                    items: [],
                                    filters: [],
                                    sorters: []
                                };
                                var optionsToServerItem = $.ConvertObjectToArr(source.data);

                                //Add Items to Send
                                optionsToServer.items = optionsToServerItem;

                                //Elements Complementary
                                if (typeof optionsAtServer.pagenum != 'undefined')
                                    optionsToServer.items.push({ name: 'pagenum', value: optionsAtServer.pagenum });
                                if (typeof optionsAtServer.pagesize != 'undefined')
                                    optionsToServer.items.push({ name: 'pagesize', value: optionsAtServer.pagesize });
                                if (typeof optionsAtServer.sortdatafield != 'undefined')
                                    optionsToServer.items.push({ name: 'sortdatafield', value: optionsAtServer.sortdatafield });
                                if (typeof optionsAtServer.sortorder != 'undefined')
                                    optionsToServer.items.push({ name: 'sortorder', value: optionsAtServer.sortorder });

                                //Get data From Server
                                $.GetData({
                                    uriData: source.url,
                                    options: optionsToServer,
                                    onReady: function (result) {
                                        callback({ records: result.data, totalrecords: result.totalrecords });
                                    },
                                    onError: function (_error) {
                                        callback({ records: [], totalrecords: 0 });
                                        $.CloseStatusBar();
                                        $.ShowError({ error: _error });
                                    }
                                });

                            };

                            if (typeof _firstLoad == 'undefined') _firstLoad = true;
                            if (_firstLoad) getRemoteData();
                            if (!_firstLoad) {
                                _firstLoad = true;
                                callback({ records: [], totalrecords: 0 });
                            };

                        }
                    });
                    _config.columns = adaptador_cols;
                    _config.localization = $.SetLocatizationJQX();

                    //Create Table
                    $(_table).jqxDataTable(_config);

                });

            });

        };

        return this.each(function () {

            var _table = $(this);
            var _table_distance = $(_table).offset().top;

            _items.pagesize = 0;
            _items.pagenum = 0;

            _config = $.extend({
                theme: 'bootstrap',
                //theme: 'arctic',
                serverProcessing: true,
                sortable: true,
                pageSize: 100,
                pageable: true,
                pagerButtonsCount: 100,
                columnsResize: true,
                //enablebrowserselection: true,
                width: '100%',
                height: 'calc(100vh - (' + _table_distance + 'px + 2.2rem))'
            }, _config);

            $.GetQuery({
                connectTo: connectTo,
                connectToLogin: connectToLogin,
                query: [_query],
                items: [_items],
                type: [_type],
                onBefore: function () {
                    _table.append('<i class="fa fa-spinner fa-pulse fa-fw"></i> Cargando tabla...');
                },
                onReady: function (data, result) {
                    _runTable(result, _table);
                },
                onError: function (error) {
                    $.ShowError({ error: error });
                }
            });



        });

    },
    CreateGrid: function () {

        var _default = {};
        var _arguments = $.GetArgs(_default, arguments);
        var connectTo = _arguments.connectTo || '';
        var connectToLogin = _arguments.connectToLogin || 'C';
        var _query = '';
        var _firstLoad = _arguments.firstLoad;
        var _items = _arguments.items || {};
        var _type = _arguments.type || 0;
        var _config = _arguments.config || {};
        var _columns = _arguments.columns || {};
        var _hiddens = _arguments.hiddens || [];
        var _sortcolumn = _arguments.sortcolumn || '';
        var _sortdirection = _arguments.sortdirection || 'ASC';
        var _adapter = _arguments.adapter || {};
        var _runTable = function (_result, _table) {

            delete _items.script;
            delete _items.pagesize;
            delete _items.pagenum;
            delete _items.connectTo;
            delete _items.connectToLogin;

            require(["jqwidgets", "helper"], function () {

                require(["moment"], function (moment) {

                    var adaptador = {
                        dataType: "json",
                        dataFields: [],
                        data: _items,
                        id: 'id',
                        type: 'POST',
                        url: $.solver.services.api + '/Service/'
                    };
                    var adaptador_cols = [];
                    var colsRefer = {};

                    //Extend Adaptador
                    adaptador = $.extend(adaptador, _adapter);

                    //Extra Columns
                    for (var item in _columns) {
                        if (typeof _result.cols[item] == 'undefined') {
                            _result.cols[item] = { type: "string", name: item };
                        };
                    };

                    //Define Default Cols
                    for (var item in _result.cols) {
                        var col = _result.cols[item];
                        var defColTable = {
                            text: col.name,
                            dataField: col.name,
                            width: '150',
                            align: 'center',
                            cellsAlign: 'left',
                            hidden: false,
                            //cellsrenderer: function (row, columnfield, value, defaulthtml, columnproperties) {
                            //    return '<div class="jqx-grid-cell-middle-align" style="margin-top: 8px;">' + value + '</div>';
                            //}
                        };
                        var defColAdapter = { name: col.name, type: col.type };
                        //Validation Regular Expressions
                        if (col.type === 'int64' || col.type === 'int32') {
                            defColAdapter.type = 'int';
                        };
                        if (col.type === 'datetime') {
                            defColTable.cellsformat = 'DD/MM/YYYY HH:mm:ss';
                            defColTable.cellsRenderer = function (row, column, value, rowData) {
                                var _tempDate = '';
                                if (value != '') {
                                    _tempDate = moment(value).format('DD/MM/YYYY HH:mm:ss');
                                };
                                return '<div class="jqx-grid-cell-middle-align" style="margin-top: 8px;">' + _tempDate + '</div>';;
                            };
                            defColAdapter.type = 'date';
                        };
                        if (col.name === "_rowNum") {
                            defColTable.hidden = true;
                        };
                        if ($.inArray(item, _hiddens) != -1) {
                            defColTable.hidden = true;
                        };
                        //Default Config Cols Users
                        if (typeof _columns[item] !== 'undefined') {
                            defColTable = $.extend(defColTable, _columns[item]);
                        };
                        //Add Config to Var
                        adaptador_cols.push(defColTable);
                        adaptador.dataFields.push(defColAdapter);
                        //colsRefer
                        colsRefer[col.name] = '';
                    };

                    if (typeof _config.columns == 'undefined') _config.columns = [];

                    //Add Order Initial Columns
                    if (_sortcolumn.length != 0) {
                        adaptador.sortcolumn = _sortcolumn;
                        adaptador.sortdirection = _sortdirection;
                    };
                    //Set Method to Connect
                    if (connectTo.length != 0) _items.ConnectTo = connectTo;
                    _items.TypeTo = _type;
                    //Set Values to Config
                    _config.source = new $.jqx.dataAdapter(adaptador, {
                        loadServerData: function (serverdata, source, callback) {

                            var getRemoteData = function () {
                                //Parameters
                                var optionsAtServer = JSON.parse(JSON.stringify(serverdata));
                                var optionsToServer = {
                                    items: [],
                                    filters: [],
                                    sorters: []
                                };
                                var optionsToServerItem = $.ConvertObjectToArr(source.data);
                                var _query = '';

                                if (typeof _arguments.query == 'function') {
                                    _query = _arguments.query();
                                } else {
                                    _query = _arguments.query || '';
                                };

                                //Add Items to Send
                                optionsToServer.items = optionsToServerItem;

                                //Elements Complementary
                                if (typeof optionsAtServer.pagenum != 'undefined')
                                    optionsToServer.items.push({ name: 'pagenum', value: optionsAtServer.pagenum });
                                if (typeof optionsAtServer.pagesize != 'undefined')
                                    optionsToServer.items.push({ name: 'pagesize', value: optionsAtServer.pagesize });
                                if (typeof optionsAtServer.sortdatafield != 'undefined')
                                    optionsToServer.items.push({ name: 'sortdatafield', value: optionsAtServer.sortdatafield });
                                if (typeof optionsAtServer.sortorder != 'undefined')
                                    optionsToServer.items.push({ name: 'sortorder', value: optionsAtServer.sortorder });

                                //Get data From Server
                                $.GetData({
                                    uriData: $.solver.services.api + "/Service/DataGrid/" + _query + "/",
                                    options: optionsToServer,
                                    onReady: function (result) {
                                        callback({ records: result.data, totalrecords: result.totalrecords });
                                    },
                                    onError: function (_error) {
                                        callback({ records: [], totalrecords: 0 });
                                        $.CloseStatusBar();
                                        $.ShowError({ error: _error });
                                    }
                                });

                            };

                            _table[0]['args'] = _config;
                            _table[0]['info'] = {
                                colsRefer: colsRefer
                            };

                            if (typeof _firstLoad == 'undefined') _firstLoad = true;
                            if (_firstLoad) getRemoteData();
                            if (!_firstLoad) {
                                _firstLoad = true;
                                callback({ records: [], totalrecords: 0 });
                            };

                        }
                    });
                    _config.columns = adaptador_cols;
                    _config.localization = $.SetLocatizationJQX();

                    //Create Table
                    $(_table).jqxGrid(_config);
                    $(_table).on('filter', function (event) {
                        $(_table).jqxGrid('updatebounddata');
                    });
                    $(_table).on('sort', function (event) {
                        $(_table).jqxGrid('updatebounddata');
                    });
                    //$(_table).on('pagechanged', function (event) {
                    //    $(_table).jqxGrid('updatebounddata');
                    //});
                    //$(_table).on('pagesizechanged', function (event) {
                    //    $(_table).jqxGrid('updatebounddata');
                    //});

                });

            });

        };

        if (typeof _arguments.query == 'function') {
            _query = _arguments.query();
        } else {
            _query = _arguments.query || '';
        };

        return this.each(function () {

            var _table = $(this);
            var _table_distance = $(_table).offset().top;
            var _table_wrap = $.CreateToken();
            var _table_height = _config.height || 0;

            _items.pagesize = 0;
            _items.pagenum = 0;

            if (_table_height == 0) {
                _table.wrap('<div id="' + _table_wrap + '" style="height:calc(100vh - (' + _table_distance + 'px + 2.2rem));"></div>');
            };

            _config = $.extend({
                theme: 'bootstrap',
                sortable: true,
                pageSize: 1000,
                pageable: true,
                pagerButtonsCount: 10,
                scrollmode: 'logical',
                columnsResize: true,
                //enablebrowserselection: true,
                width: '100%',
                //height: 'calc(100vh - (' + _table_distance + 'px + 2.2rem))',
                virtualmode: true,
                columnsmenu: false,
                rowsheight: 23,
                rendergridrows: function (result) {
                    return result.data;
                }
            }, _config);
            
            $.GetQuery({
                connectTo: connectTo,
                connectToLogin: connectToLogin,
                query: [_query],
                items: [_items],
                type: [_type],
                onBefore: function () {
                    _table.append('<i class="fa fa-spinner fa-pulse fa-fw"></i> Cargando tabla...');
                },
                onReady: function (data, result) {
                    _table_height = _config.height || $('div#' + _table_wrap).outerHeight(true);
                    _config.height = _table_height;

                    _runTable(result, _table);

                },
                onError: function (error) {
                    $.ShowError({ error: error });
                }
            });

        });

    },
    CreateTreeGrid: function () {

        var _default = {};
        var _arguments = $.GetArgs(_default, arguments);
        var connectTo = _arguments.connectTo || '';
        var connectToLogin = _arguments.connectToLogin || 'C';
        var _query = '';
        var _firstLoad = _arguments.firstLoad;
        var _items = _arguments.items || {};
        var _type = _arguments.type || 0;
        var _config = _arguments.config || {};
        var _columns = _arguments.columns || {};
        var _hiddens = _arguments.hiddens || [];
        var _sortcolumn = _arguments.sortcolumn || '';
        var _sortdirection = _arguments.sortdirection || 'ASC';
        var _adapter = _arguments.adapter || {};
        var _runTable = function (_result, _table) {

            delete _items.script;
            delete _items.pagesize;
            delete _items.pagenum;
            delete _items.connectTo;
            delete _items.connectToLogin;

            require(["jqwidgets", "helper"], function () {

                require(["moment"], function (moment) {

                    var adaptador = {
                        dataType: "json",
                        dataFields: [],
                        data: _items,
                        id: 'id',
                        type: 'POST',
                        url: $.solver.services.api + '/Service/'
                    };
                    var adaptador_cols = [];
                    var colsRefer = {};

                    //Extend Adaptador
                    adaptador = $.extend(adaptador, _adapter);

                    //Extra Columns
                    for (var item in _columns) {
                        if (typeof _result.cols[item] == 'undefined') {
                            _result.cols[item] = { type: "string", name: item };
                        };
                    };

                    //Define Default Cols
                    for (var item in _result.cols) {
                        var col = _result.cols[item];
                        var defColTable = {
                            text: col.name,
                            dataField: col.name,
                            width: '150',
                            align: 'center',
                            cellsAlign: 'left',
                            hidden: false,
                            //cellsrenderer: function (row, columnfield, value, defaulthtml, columnproperties) {
                            //    return '<div class="jqx-grid-cell-middle-align" style="margin-top: 8px;">' + value + '</div>';
                            //}
                        };
                        var defColAdapter = { name: col.name, type: col.type };
                        //Validation Regular Expressions
                        if (col.type === 'int64' || col.type === 'int32') {
                            defColAdapter.type = 'int';
                        };
                        if (col.type === 'datetime') {
                            defColTable.cellsformat = 'DD/MM/YYYY HH:mm:ss';
                            defColTable.cellsRenderer = function (row, column, value, rowData) {
                                var _tempDate = '';
                                if (value != '') {
                                    _tempDate = moment(value).format('DD/MM/YYYY HH:mm:ss');
                                };
                                return '<div class="jqx-grid-cell-middle-align" style="margin-top: 8px;">' + _tempDate + '</div>';;
                            };
                            defColAdapter.type = 'date';
                        };
                        if (col.name === "_rowNum") {
                            defColTable.hidden = true;
                        };
                        if ($.inArray(item, _hiddens) != -1) {
                            defColTable.hidden = true;
                        };
                        //Default Config Cols Users
                        if (typeof _columns[item] !== 'undefined') {
                            defColTable = $.extend(defColTable, _columns[item]);
                        };
                        //Add Config to Var
                        adaptador_cols.push(defColTable);
                        adaptador.dataFields.push(defColAdapter);
                        //colsRefer
                        colsRefer[col.name] = '';
                    };

                    if (typeof _config.columns == 'undefined') _config.columns = [];

                    //Add Order Initial Columns
                    if (_sortcolumn.length != 0) {
                        adaptador.sortcolumn = _sortcolumn;
                        adaptador.sortdirection = _sortdirection;
                    };
                    //Set Method to Connect
                    if (connectTo.length != 0) _items.ConnectTo = connectTo;
                    _items.TypeTo = _type;
                    //Set Values to Config
                    _config.source = new $.jqx.dataAdapter(adaptador, {
                        loadServerData: function (serverdata, source, callback) {

                            var getRemoteData = function () {
                                //Parameters
                                var optionsAtServer = JSON.parse(JSON.stringify(serverdata));
                                var optionsToServer = {
                                    items: [],
                                    filters: [],
                                    sorters: []
                                };
                                var optionsToServerItem = $.ConvertObjectToArr(source.data);
                                var _query = '';

                                if (typeof _arguments.query == 'function') {
                                    _query = _arguments.query();
                                } else {
                                    _query = _arguments.query || '';
                                };

                                //Add Items to Send
                                optionsToServer.items = optionsToServerItem;

                                //Elements Complementary
                                if (typeof optionsAtServer.pagenum != 'undefined')
                                    optionsToServer.items.push({ name: 'pagenum', value: optionsAtServer.pagenum });
                                if (typeof optionsAtServer.pagesize != 'undefined')
                                    optionsToServer.items.push({ name: 'pagesize', value: optionsAtServer.pagesize });
                                if (typeof optionsAtServer.sortdatafield != 'undefined')
                                    optionsToServer.items.push({ name: 'sortdatafield', value: optionsAtServer.sortdatafield });
                                if (typeof optionsAtServer.sortorder != 'undefined')
                                    optionsToServer.items.push({ name: 'sortorder', value: optionsAtServer.sortorder });

                                //Get data From Server
                                $.GetData({
                                    uriData: $.solver.services.api + "/Service/DataTreeGrid/" + _query + "/",
                                    options: optionsToServer,
                                    onReady: function (result) {
                                        callback({ records: result.data, totalrecords: result.totalrecords });
                                    },
                                    onError: function (_error) {
                                        callback({ records: [], totalrecords: 0 });
                                        $.CloseStatusBar();
                                        $.ShowError({ error: _error });
                                    }
                                });

                            };

                            _table[0]['args'] = _config;
                            _table[0]['info'] = {
                                colsRefer: colsRefer
                            };

                            if (typeof _firstLoad == 'undefined') _firstLoad = true;
                            if (_firstLoad) getRemoteData();
                            if (!_firstLoad) {
                                _firstLoad = true;
                                callback({ records: [], totalrecords: 0 });
                            };

                        }
                    });
                    _config.columns = adaptador_cols;
                    _config.localization = $.SetLocatizationJQX();

                    //Create Table
                    $(_table).jqxTreeGrid(_config);
                    $(_table).on('filter', function (event) {
                        $(_table).jqxGrid('updatebounddata');
                    });
                    $(_table).on('sort', function (event) {
                        $(_table).jqxGrid('updatebounddata');
                    });
                    //$(_table).on('pagechanged', function (event) {
                    //    $(_table).jqxGrid('updatebounddata');
                    //});
                    //$(_table).on('pagesizechanged', function (event) {
                    //    $(_table).jqxGrid('updatebounddata');
                    //});

                });

            });

        };

        if (typeof _arguments.query == 'function') {
            _query = _arguments.query();
        } else {
            _query = _arguments.query || '';
        };

        return this.each(function () {

            var _table = $(this);
            var _table_distance = $(_table).offset().top;
            var _table_wrap = $.CreateToken();
            var _table_height = _config.height || 0;

            _items.pagesize = 0;
            _items.pagenum = 0;

            if (_table_height == 0) {
                _table.wrap('<div id="' + _table_wrap + '" style="height:calc(100vh - (' + _table_distance + 'px + 2.2rem));"></div>');
            };

            _config = $.extend({
                theme: 'bootstrap',
                sortable: true,
                pageSize: 1000,
                pageable: true,
                pagerButtonsCount: 10,
                //scrollmode: 'logical',
                columnsResize: true,
                //enablebrowserselection: true,
                width: '100%',
                //height: 'calc(100vh - (' + _table_distance + 'px + 2.2rem))',
                //virtualmode: true,
                //columnsmenu: false,
                //rowsheight: 23,
                //rendergridrows: function (result) {
                //    return result.data;
                //}
            }, _config);

            $.GetQuery({
                connectTo: connectTo,
                connectToLogin: connectToLogin,
                query: [_query],
                items: [_items],
                type: [_type],
                onBefore: function () {
                    _table.append('<i class="fa fa-spinner fa-pulse fa-fw"></i> Cargando tabla...');
                },
                onReady: function (data, result) {

                    _table_height = _config.height || $('div#' + _table_wrap).outerHeight(true);
                    _config.height = _table_height;

                    _runTable(result, _table);

                },
                onError: function (error) {
                    $.ShowError({ error: error });
                }
            });

        });

    },
    SetScaleImage: function (urlImage, size) {

        return this.each(function () {

            var _size = size || 'contain';

            $(this).attr('src', '/Content/Images/no-white.png');

            $(this).css({
                'background-image': `url('${urlImage}')`,
                'background-size': _size,
                'background-repeat': 'no-repeat',
                'background-position': 'center',
                //'min-height': '10rem',
                //'min-width': '100%'
            });

            $(this).addClass('animated');
            $(this).addClass('bounceIn');

        });

    },
});