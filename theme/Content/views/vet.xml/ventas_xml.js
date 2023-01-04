require(['helper', 'datetimepicker', 'inputmask', 'jqwidgets', 'extras', 'bootstrap-select', 'fileinput.es', 'jstree', 'controls'], function () {
    require(["moment", "alertify", "bootbox", "sweetalert"], function (moment, alertify, bootbox, Swal) {

        alertify.set('notifier', 'position', 'top-center');

        $.VerDocs = function (index) {
            fnMostarDocs(index);
        };
        $.VerDoc = function (c_archivo) {
            window.open($.solver.services.files + 'service/viewfile/' + c_archivo, '_blank');
        };
        $.VerInforme = function (index) {

            var index = $(tblSeguimiento).jqxGrid('getrowid', index);
            var row = $(tblSeguimiento).jqxGrid('getrows')[index];

            var settings = {
                "url": $.solver.services.api + `/AuditoriaT/InformeDocumento/${row['C_EMPRESA']}/${row['C_TIPO']}/${row['C_PROCESO']}`,
                "method": "POST",
                "timeout": 0,
                xhr: function () {
                    xhr = jQuery.ajaxSettings.xhr.apply(this, arguments);
                    return xhr;
                },
                xhrFields: {
                    responseType: 'blob'
                },
                beforeSend: function (xhr) {
                    $.DisplayStatusBar({
                        message: 'Procesando informe, espere por favor ...'
                    });
                },
                "headers": {
                    "Content-Type": "application/json"
                },
                "data": JSON.stringify({}),
            };

            $.ajax(settings).done(function (json) {

                $.CloseStatusBar();

                var blobUrl = URL.createObjectURL(xhr.response);

                var dialog = bootbox.dialog({
                    message: `<div class="embed-responsive embed-responsive-16by9"><iframe class= "embed-responsive-item" src="" allowfullscreen></iframe></div>`,
                    closeButton: true,
                    className: 'modal-75'
                });

                dialog.init(function () {
                    $(dialog).find('.embed-responsive-item').attr("src", blobUrl);
                });

            });

        };
        $.EditarConcepto = function (index) {
            fnEditarConcepto(index);
        };

        let myControlsFilter = null;
        let myControlsComprobantes = null;
        const tblComprobantes = '#table-comprobantes';
        const tblHomologar = '#table-homologar';

        const fnCrearTablas = function () {

            const fnClassEditer = function (row, datafield, value, rowdata) {
                if (datafield == 'VALIDACION_COMPROBANTE_ESTADO') {
                    if (rowdata['VALIDACION_COMPROBANTE_CODIGO'] != undefined && rowdata['VALIDACION_COMPROBANTE_CODIGO'] != null) {
                        if (rowdata['VALIDACION_COMPROBANTE_CODIGO'] == '1') return 'green'
                        if (rowdata['VALIDACION_COMPROBANTE_CODIGO'] == '2') return 'yellow'
                        return 'red'
                    }
                    return 'red';
                }
                if (datafield == 'VALIDACION_CONTRIBUYENTE_ESTADO') {
                    if (rowdata['VALIDACION_CONTRIBUYENTE_CODIGO'] != undefined && rowdata['VALIDACION_CONTRIBUYENTE_CODIGO'] != null) {
                        if (rowdata['VALIDACION_CONTRIBUYENTE_CODIGO'] == '00') return 'green'
                        if (rowdata['VALIDACION_CONTRIBUYENTE_CODIGO'] == '-') return ''
                        return 'red'
                    }
                    return 'red';
                }
                if (datafield == 'VALIDACION_DOMICILIARIA_ESTADO') {
                    if (rowdata['VALIDACION_DOMICILIARIA_CODIGO'] != undefined && rowdata['VALIDACION_DOMICILIARIA_CODIGO'] != null) {
                        if (rowdata['VALIDACION_DOMICILIARIA_CODIGO'] == '00') return 'green'
                        if (rowdata['VALIDACION_DOMICILIARIA_CODIGO'] == '-') return ''
                        return 'red'
                    }
                    return 'red';
                }
                return '';
            };

            $(tblComprobantes).CreateGrid({
                query: 'tbl_auditoriat_procesos_validaciondocs_detallado_3_ventas_migrar',
                items: {
                    C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                    ANIO: function () {
                        return $(myControlsFilter.anio).val();
                    },
                    DESDE: function () {
                        return $(myControlsFilter.mes).val();
                    },
                    HASTA: function () {
                        return $(myControlsFilter.mes).val();
                    },
                    LIBRO: function () {
                        return $(myControlsFilter.libro).val();
                    },
                    NOMBRE: function () {
                        return $(myControlsComprobantes.NOMBRE).val() || '';
                    },
                    TIPODOC: function () {
                        return $(myControlsComprobantes.TIPODOC).val() || '';
                    },
                    NUMERO: function () {
                        return $(myControlsComprobantes.NUMERO).val() || '';
                    },
                    FECHA_EMISION: function () {
                        return $(myControlsComprobantes.FECHA_EMISION).val() || '';
                    },
                    MONEDA: function () {
                        return $(myControlsComprobantes.MONEDA).val() || '';
                    },
                    FECHA_ENVIO: function () {
                        return $(myControlsComprobantes.FECHA_ENVIO).val() || '';
                    },
                    ESTADO_VALIDACION: function () {
                        return $(myControlsComprobantes.ESTADO_VALIDACION).val() || '';
                    },
                    ESTADO_COMPROBANTE: function () {
                        return $(myControlsComprobantes.ESTADO_COMPROBANTE).val() || '';
                    },
                    ESTADO_CONTRIBUYENTE: function () {
                        return $(myControlsComprobantes.ESTADO_CONTRIBUYENTE).val() || '';
                    },
                    CONDICION_DOM: function () {
                        return $(myControlsComprobantes.CONDICION_DOM).val() || '';
                    },
                    MODO_CARGA: function () {
                        return $(myControlsComprobantes.MODO_CARGA).val() || '';
                    },
                },
                hiddens: ['C_DOCUMENTO', 'LIBRO', 'C_DETALLE'],
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
                    'Periodo': {
                        text: 'Periodo',
                        width: 80,
                        cellsAlign: 'center'
                    },
                    'RUC': {
                        text: 'Ruc',
                        width: 90
                    },
                    'RazonSocial': {
                        text: 'Razón social',
                        width: 200
                    },
                    'TipoDoc': {
                        text: 'Tipo doc.',
                        width: 40,
                    },
                    'Serie': {
                        width: 40
                    },
                    'Numero': {
                        text: 'Número',
                        width: 70
                    },
                    'FechaEmision': {
                        text: 'Fec. emisión',
                        width: 80,
                        cellsAlign: 'center'
                    },
                    'Moneda': {
                        width: 60,
                    },
                    'Monto': {
                        width: 80,
                        cellsAlign: 'right',
                        cellsFormat: 'd2'
                    },
                    'XML': {
                        width: 40,
                        cellsAlign: 'center'
                    },
                    'PDF': {
                        width: 40,
                        cellsAlign: 'center'
                    },
                    'CDR': {
                        width: 40,
                        cellsAlign: 'center'
                    },
                    'Ver': {
                        width: 45,
                        cellsRenderer: function (row, columnfield, value, defaulthtml, columnproperties) {
                            var libro = $(myControlsFilter.libro).val();
                            if (libro == '048' || libro == '052')
                                return `<a href="#" onclick="$.VerDocs('${row}');" style="margin-top: 0.5rem;display: block;margin-left: 0.3rem;"><i class="fa fa-eye" aria-hidden="true"></i> Ver</a>`;
                            return '';
                        }
                    },
                    'FECHA_VALIDACION_SUNAT': {
                        text: 'Fec. valid. sunat ',
                        width: 120
                    },
                    'VALIDACION_COMPROBANTE_CODIGO': {
                        text: '',
                        columngroup: 'compro',
                        width: 30,
                        cellsrenderer: function (row, columnfield, value, defaulthtml, columnproperties) {
                            if (value == '1') return '<div class="mt-2 jqx-grid-cell-middle-align"><span class="text-extra" style="color:green;"><i class="fa fa-check" aria-hidden="true"></i></span></div>';
                            if (value == '2') return '<div class="mt-2 jqx-grid-cell-middle-align"><span class="text-extra" style="color:#FFBF00;"><i class="fa fa-exclamation-triangle" aria-hidden="true"></i></span></div>';
                            return '<div class="mt-2 jqx-grid-cell-middle-align"><span class="text-extra" style="color:red;"><i class="fa fa-close" aria-hidden="true"></i></span></div>';
                        }
                    },
                    'VALIDACION_COMPROBANTE_ESTADO': {
                        text: 'Estado',
                        cellclassname: fnClassEditer,
                        columngroup: 'compro',
                        width: 180,

                    },
                    'VALIDACION_CONTRIBUYENTE_CODIGO': {
                        text: '',
                        columngroup: 'contri',
                        width: 30,
                        cellsrenderer: function (row, columnfield, value, defaulthtml, columnproperties) {
                            if (value == '-') return '';
                            if (value == '00') return '<div class="mt-2 jqx-grid-cell-middle-align"><span class="text-extra" style="color:green;"><i class="fa fa-check" aria-hidden="true"></i></span></div>';
                            return '<div class="mt-2 jqx-grid-cell-middle-align"><span class="text-extra" style="color:red;"><i class="fa fa-close" aria-hidden="true"></i></span></div>';
                        }
                    },
                    'VALIDACION_CONTRIBUYENTE_ESTADO': {
                        text: 'Estado',
                        columngroup: 'contri',
                        cellclassname: fnClassEditer,
                        width: 180
                    },
                    'VALIDACION_DOMICILIARIA_CODIGO': {
                        text: '',
                        columngroup: 'condi',
                        width: 30,
                        cellsrenderer: function (row, columnfield, value, defaulthtml, columnproperties) {
                            if (value == '-') return '';
                            if (value == '00') return '<div class="mt-2 jqx-grid-cell-middle-align"><span class="text-extra" style="color:green;"><i class="fa fa-check" aria-hidden="true"></i></span></div>';
                            return '<div class="mt-2 jqx-grid-cell-middle-align"><span class="text-extra" style="color:red;"><i class="fa fa-close" aria-hidden="true"></i></span></div>';
                        }
                    },
                    'VALIDACION_DOMICILIARIA_ESTADO': {
                        text: 'Estado',
                        columngroup: 'condi',
                        width: 180,
                        cellclassname: fnClassEditer,
                    }
                },
                config: {
                    pageSize: 100,
                    height: 500,
                    columnsresize: true,
                    sortable: true,
                    editable: false,
                    selectionmode: 'checkbox',
                    columngroups:
                        [
                            { text: 'ESTADO DEL COMPROBANTE', align: 'center', name: 'compro' },
                            { text: 'ESTADO DEL CONTRIBUYENTE', align: 'center', name: 'contri' },
                            { text: 'CONDICIÓN DOMICILIARIA', align: 'center', name: 'condi' },
                        ]
                }
            });

            $(tblHomologar).CreateGrid({
                query: 'tbl_auditoriat_procesos_validaciondocs_detallado_3_homologar',
                items: {
                    C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                    ANIO: function () {
                        return $(myControlsFilter.anio).val();
                    },
                    DESDE: function () {
                        return $(myControlsFilter.mes).val();
                    },
                    HASTA: function () {
                        return $(myControlsFilter.mes).val();
                    },
                    LIBRO: function () {
                        return $(myControlsFilter.libro).val();
                    },
                    NOMBRE: function () {
                        return $(myControlsComprobantes.NOMBRE).val() || '';
                    },
                    TIPODOC: function () {
                        return $(myControlsComprobantes.TIPODOC).val() || '';
                    },
                    NUMERO: function () {
                        return $(myControlsComprobantes.NUMERO).val() || '';
                    },
                    FECHA_EMISION: function () {
                        return $(myControlsComprobantes.FECHA_EMISION).val() || '';
                    },
                    MONEDA: function () {
                        return $(myControlsComprobantes.MONEDA).val() || '';
                    },
                    FECHA_ENVIO: function () {
                        return $(myControlsComprobantes.FECHA_ENVIO).val() || '';
                    },
                    ESTADO_VALIDACION: function () {
                        return $(myControlsComprobantes.ESTADO_VALIDACION).val() || '';
                    },
                    ESTADO_COMPROBANTE: function () {
                        return $(myControlsComprobantes.ESTADO_COMPROBANTE).val() || '';
                    },
                    ESTADO_CONTRIBUYENTE: function () {
                        return $(myControlsComprobantes.ESTADO_CONTRIBUYENTE).val() || '';
                    },
                    CONDICION_DOM: function () {
                        return $(myControlsComprobantes.CONDICION_DOM).val() || '';
                    },
                    MODO_CARGA: function () {
                        return $(myControlsComprobantes.MODO_CARGA).val() || '';
                    },
                },
                hiddens: ['C_PRODUCTO'],
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
                    'DESCRIPCION_XML': {
                        text: 'Descripcion en XML',
                        width: 400
                    },
                    'TEXTO_HOMOLOGADO': {
                        text: 'Descripcion Homologada',
                        width: 400
                    },
                    '': {
                        width: 90,
                        cellsRenderer: function (row, columnfield, value, defaulthtml, columnproperties) {
                            var libro = $(myControlsFilter.libro).val();
                            if (libro == '048' || libro == '052')
                                return `<a href="#" onclick="$.EditarConcepto('${row}');" style="margin-top: 0.5rem;display: block;margin-left: 0.3rem;"><i class="fa fa-search" aria-hidden="true"></i> Concepto</a>`;
                            return '';
                        }
                    },
                },
                config: {
                    pageSize: 100,
                    height: 500,
                    columnsresize: true,
                    sortable: true,
                    editable: false,
                }
            });

        };
        const fnCrearFiltrosComprobante = function () {
            //formulario filtro de comprobantes
            $('form[name=filter_comprobantes]').ValidForm({
                type: -1,
                onDone: function (form, controls) {

                    myControlsComprobantes = controls;

                    $(controls._fec_emision).datetimepicker({
                        format: 'DD/MM/YYYY',
                        locale: 'es'
                    });
                    $(controls._fec_envio).datetimepicker({
                        format: 'DD/MM/YYYY',
                        locale: 'es'
                    });
                    $(controls._tipo_doc).selectpicker();
                    $(controls._serie).selectpicker();
                    $(controls.C_PARAMETRO_GENERAL_MONEDA).selectpicker();
                    $(controls._usuario_reg).selectpicker();
                    $(controls.IND_ESTADO).selectpicker();

                    $(controls._serie).attr('data-query', 'cb_archivos_cargaarchivos_procesar_serie');
                    $(controls._serie).attr('data-value', 'CODIGO');
                    $(controls._serie).attr('data-field', 'DESCRIPCION');
                    $(controls._serie).attr('data-C_EMPRESA', $.solver.session.SESSION_EMPRESA);
                    $(controls._serie).attr('data-PERIODO', function () {
                        var myPeriodo = $('#anio').val() + '-' + $('#mes').val();
                        return myPeriodo;
                    });
                    $(controls._serie).attr('data-TIPO_ARCHIVO', $(myControlsFilter.libro).val());
                    $(controls._serie).FieldLoadRemote({
                        onReady: function () {
                            $(controls._serie).selectpicker('refresh');
                        }
                    });

                    setTimeout(function () {
                        fnCrearTablas();
                    }, 500);

                    //acciones de comprobantes
                    let actions = {};
                    actions['Cargar Archivos XML'] = {
                        icon: 'fa fa-cloud-upload',
                        callback: function () {

                        }
                    };
                    actions['Validar Documentos'] = {
                        icon: 'fa fa-paper-plane',
                        callback: function () {

                        }
                    };
                    actions['Borrar documentos'] = {
                        icon: 'fa fa-trash-o',
                        callback: function () { fnActionBorrarDocumentos(); }
                    };
                    actions['Exportar Datos'] = {
                        icon: 'fa fa-search-plus',
                        callback: function () { fnActionExportarDocumentos(); }
                    };
                    actions['Procesar Periodo'] = {
                        icon: 'fa fa-search-plus',
                        callback: function () {

                            $.AddPetition({
                                type: '4',
                                transaction: true,
                                items: $.ConvertObjectToArr({
                                    script: 'sp_ventas_procesos_cargaxml_masivoventas_archivos',
                                    C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                                    ANIO: function () {
                                        return $(myControlsFilter.anio).val();
                                    },
                                    DESDE: function () {
                                        return $(myControlsFilter.mes).val();
                                    },
                                    HASTA: function () {
                                        return $(myControlsFilter.mes).val();
                                    },
                                    LIBRO: function () {
                                        return $(myControlsFilter.libro).val();
                                    },
                                    NOMBRE: function () {
                                        return $(myControlsComprobantes.NOMBRE).val() || '';
                                    },
                                    TIPODOC: function () {
                                        return $(myControlsComprobantes.TIPODOC).val() || '';
                                    },
                                    NUMERO: function () {
                                        return $(myControlsComprobantes.NUMERO).val() || '';
                                    },
                                    FECHA_EMISION: function () {
                                        return $(myControlsComprobantes.FECHA_EMISION).val() || '';
                                    },
                                    MONEDA: function () {
                                        return $(myControlsComprobantes.MONEDA).val() || '';
                                    },
                                    FECHA_ENVIO: function () {
                                        return $(myControlsComprobantes.FECHA_ENVIO).val() || '';
                                    },
                                    ESTADO_VALIDACION: function () {
                                        return $(myControlsComprobantes.ESTADO_VALIDACION).val() || '';
                                    },
                                    ESTADO_COMPROBANTE: function () {
                                        return $(myControlsComprobantes.ESTADO_COMPROBANTE).val() || '';
                                    },
                                    ESTADO_CONTRIBUYENTE: function () {
                                        return $(myControlsComprobantes.ESTADO_CONTRIBUYENTE).val() || '';
                                    },
                                    CONDICION_DOM: function () {
                                        return $(myControlsComprobantes.CONDICION_DOM).val() || '';
                                    },
                                    MODO_CARGA: function () {
                                        return $(myControlsComprobantes.MODO_CARGA).val() || '';
                                    },
                                })
                            });

                            $.AddPetition({
                                type: '4',
                                transaction: true,
                                items: $.ConvertObjectToArr({
                                    script: 'sp_ventas_procesos_cargaxml_masivoventas_a_registro',
                                    C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                                    MODULO: $.solver.basePath
                                })
                            });

                            $.SendPetition({
                                connectToLogin: 'S',
                                onReady: function (result) {
                                    $.CloseStatusBar();
                                    fnRefreshTablas();
                                },
                                onBefore: function () {
                                    $.DisplayStatusBar({ message: 'Se esta procesando la información de Ventas.' });
                                },
                                onError: function (_error) {
                                    $.CloseStatusBar();
                                    $.ShowError({ error: _error });
                                }
                            });

                        }
                    };
                    actions['Exportar Conceptos'] = {
                        icon: 'fa fa-download',
                        callback: function () {

                            $.DownloadFile({
                                nameFile: 'Conceptos',
                                query: 'tbl_auditoriat_procesos_validaciondocs_detallado_3_homologar',
                                params: {
                                    C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                                    ANIO: function () {
                                        return $(myControlsFilter.anio).val();
                                    },
                                    DESDE: function () {
                                        return $(myControlsFilter.mes).val();
                                    },
                                    HASTA: function () {
                                        return $(myControlsFilter.mes).val();
                                    },
                                    LIBRO: function () {
                                        return $(myControlsFilter.libro).val();
                                    },
                                    NOMBRE: function () {
                                        return $(myControlsComprobantes.NOMBRE).val() || '';
                                    },
                                    TIPODOC: function () {
                                        return $(myControlsComprobantes.TIPODOC).val() || '';
                                    },
                                    NUMERO: function () {
                                        return $(myControlsComprobantes.NUMERO).val() || '';
                                    },
                                    FECHA_EMISION: function () {
                                        return $(myControlsComprobantes.FECHA_EMISION).val() || '';
                                    },
                                    MONEDA: function () {
                                        return $(myControlsComprobantes.MONEDA).val() || '';
                                    },
                                    FECHA_ENVIO: function () {
                                        return $(myControlsComprobantes.FECHA_ENVIO).val() || '';
                                    },
                                    ESTADO_VALIDACION: function () {
                                        return $(myControlsComprobantes.ESTADO_VALIDACION).val() || '';
                                    },
                                    ESTADO_COMPROBANTE: function () {
                                        return $(myControlsComprobantes.ESTADO_COMPROBANTE).val() || '';
                                    },
                                    ESTADO_CONTRIBUYENTE: function () {
                                        return $(myControlsComprobantes.ESTADO_CONTRIBUYENTE).val() || '';
                                    },
                                    CONDICION_DOM: function () {
                                        return $(myControlsComprobantes.CONDICION_DOM).val() || '';
                                    },
                                    MODO_CARGA: function () {
                                        return $(myControlsComprobantes.MODO_CARGA).val() || '';
                                    },
                                }
                            });

                        }
                    };

                    $('#actionsComprobantes').CreateActions({
                        actions: actions
                    });

                },
                onReady: function () {

                    $(tblComprobantes).jqxGrid('clearselection');
                    $(tblComprobantes).jqxGrid('updatebounddata');
                    $(tblHomologar).jqxGrid('updatebounddata');

                }
            });
        };
        const fnCrearFiltrosPeriodo = function () {
            //formulario filtro de periodo
            $('form[name=filter_periodo]').ValidForm({
                type: -1,
                onDone: function (form, controls) {

                    myControlsFilter = controls;

                    $(controls.anio).change(function () {
                        $(form).submit();
                    });
                    $(controls.mes).change(function () {
                        $(form).submit();
                    });

                    fnCrearFiltrosComprobante();
                    //fnCrearFiltrosXMLvsPLE();
                    //fnCrearCheckList();

                },
                onReady: function () {

                    //fnCrearCheckList();
                    fnRefreshTablas();

                }
            });
        };
        const fnMostarDocs = function (indice) {

            var index = $(tblComprobantes).jqxGrid('getrowid', indice);
            var row = $(tblComprobantes).jqxGrid('getrows')[index];
            var documento = row['C_DOCUMENTO'];
            var token = $.CreateToken();

            let dialog = bootbox.dialog({
                title: 'Ver archivos',
                message: `<div id="${token}"></div>`,
                //className: 'modal-search-40 top-60',
                onEscape: true
            });

            dialog.init(function () {
                setTimeout(function () {
                    $(dialog).find('.modal-dialog').css({ 'max-width': '40%' });

                    // Agregamos html inicial
                    $(dialog).find(`#${token}`).html(`
                        <div id="tblArchivos"></div>
                    `);

                    // declaramos variables
                    $(dialog).find('#tblArchivos').CreateGrid({
                        query: 'q_archivos_obtener_archivos_ref',
                        items: {
                            empresa: $.solver.session.SESSION_EMPRESA,
                            documento: documento
                        },
                        hiddens: ['C_EMPRESA', 'C_DOCUMENTO', 'C_ITEM', 'C_TIPO_DOCUMENTO', 'C_ARCHIVO'],
                        columns: {
                            NOMBRE_ARCHIVO: {
                                text: 'Nombre',
                                width: 300
                            },
                            FEC_CARGA: {
                                text: 'Fecha de carga'
                            },
                            'Ver': {
                                width: 40,
                                cellsRenderer: function (row, columnfield, value, defaulthtml, columnproperties) {
                                    var _row = $(dialog).find('#tblArchivos').jqxGrid('getrows')[row]
                                    return `<a href="#" onclick="$.VerDoc('${_row['C_ARCHIVO']}');" style="margin-top: 0.5rem;display: block;margin-left: 0.3rem;"><i class="fa fa-eye" aria-hidden="true"></i></span> Ver`;
                                }
                            }
                        },
                        config: {
                            pageSize: 9999,
                            height: 350,
                            virtualmode: true,
                            sortable: true,
                            editable: false,
                        }
                    })

                });
            });

            $('.bootbox .modal-dialog').draggable({
                handle: '.modal-header'
            });
            $('.bootbox .modal-header').css('cursor', 'move');
            dialog.on('hide.bs.modal', function () { buttonState = false; });
        };
        const fnEditarConcepto = function (indice) {

            var indexback = $(tblHomologar).jqxGrid('getrowid', indice);
            var rowback = $(tblHomologar).jqxGrid('getrows')[indexback];
            var token = $.CreateToken();
            var iconButton = '<i class="fa fa-search" aria-hidden="true"></i>';
            var textButton = 'Buscar';
            var dialog = bootbox.dialog({
                title: 'Escoger producto',
                message: `<div id="${token}"></div>`,
                className: 'modal-search-80 modal-search-top-4'
            });
            var controls = {
                buscar: {
                    class: 'col-lg-6',
                    html: `<input type="text" value="${rowback.DESCRIPCION_XML}" name="buscar" class="form-control form-control-sm" placeholder="Ingrese busqueda..." />`
                }
            };

            dialog.init(function () {
                setTimeout(function () {

                    var objControls = null;
                    var fnActualizarHomologado = function (c_producto,texto_homologado) {

                        //$.AddPetition({
                        //    table: 'vet.PRODUCTO_HOMOLOGAR_XML',
                        //    type: 3,
                        //    condition: `C_EMPRESA='${$.solver.session.SESSION_EMPRESA}' AND C_PRODUCTO='${c_producto}'`,
                        //    items: $.ConvertObjectToArr({
                        //        C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                        //        C_PRODUCTO: c_producto
                        //    })
                        //});

                        $.AddPetition({
                            type: '4',
                            transaction: true,
                            items: $.ConvertObjectToArr({
                                script: 'sp_auditoriat_procesos_validaciondocs_eliminar_texto_homologado',
                                empresa: $.solver.session.SESSION_EMPRESA,
                                texto: texto_homologado
                            })
                        });

                        //sp_auditoriat_procesos_validaciondocs_eliminar_texto_homologado

                        var objectHomologar = {
                            C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                            C_PRODUCTO: c_producto,
                            C_ITEM: '',
                            TEXTO_HOMOLOGADO: texto_homologado
                        };
                        var extraHomologar = {
                            C_ITEM: {
                                action: {
                                    name: 'GetNextId',
                                    args: $.ConvertObjectToArr({
                                        max_length: 3,
                                        columns: 'C_EMPRESA,C_PRODUCTO'
                                    })
                                }
                            },
                        };

                        $.AddPetition({
                            table: 'vet.PRODUCTO_HOMOLOGAR_XML',
                            type: 1,
                            items: $.ConvertObjectToArr(objectHomologar, extraHomologar)
                        });

                        $.SendPetition({
                            onReady: function () {
                                alertify.success('Concepto registrado!');
                            }
                        });

                    };
                    var fnCrearTabla = function () {

                        $(dialog).find('#' + token + '_table').CreateGrid({
                            query: 'gbl_busqueda_producto_general',
                            items: {
                                BUSCAR: function () {
                                    return $('#' + token + '_form input[name=buscar]').val() || '';
                                },
                                C_EMPRESA: $.solver.session.SESSION_EMPRESA,
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

                            $(tblHomologar).jqxGrid('setcellvalue', indexback, "TEXTO_HOMOLOGADO", row.NOMBRE_PARA_VENTA);
                            fnActualizarHomologado(row.C_PRODUCTO, rowback.DESCRIPCION_XML);

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


        };
        const fnActionExportarDocumentos = function () {
            $.DownloadFile({
                nameFile: 'ReporteComprobantesAuditoria',
                query: 'tbl_auditoriat_procesos_validaciondocs_detallado_3',
                params: {
                    C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                    ANIO: function () {
                        return $(myControlsFilter.anio).val();
                    },
                    DESDE: function () {
                        return $(myControlsFilter.mes).val();
                    },
                    HASTA: function () {
                        return $(myControlsFilter.mes).val();
                    },
                    LIBRO: function () {
                        return $(myControlsFilter.libro).val();
                    },
                    NOMBRE: function () {
                        return $(myControlsComprobantes.NOMBRE).val() || '';
                    },
                    TIPODOC: function () {
                        return $(myControlsComprobantes.TIPODOC).val() || '';
                    },
                    NUMERO: function () {
                        return $(myControlsComprobantes.NUMERO).val() || '';
                    },
                    FECHA_EMISION: function () {
                        return $(myControlsComprobantes.FECHA_EMISION).val() || '';
                    },
                    MONEDA: function () {
                        return $(myControlsComprobantes.MONEDA).val() || '';
                    },
                    FECHA_ENVIO: function () {
                        return $(myControlsComprobantes.FECHA_ENVIO).val() || '';
                    },
                    ESTADO_VALIDACION: function () {
                        return $(myControlsComprobantes.ESTADO_VALIDACION).val() || '';
                    },
                    ESTADO_COMPROBANTE: function () {
                        return $(myControlsComprobantes.ESTADO_COMPROBANTE).val() || '';
                    },
                    ESTADO_CONTRIBUYENTE: function () {
                        return $(myControlsComprobantes.ESTADO_CONTRIBUYENTE).val() || '';
                    },
                    CONDICION_DOM: function () {
                        return $(myControlsComprobantes.CONDICION_DOM).val() || '';
                    },
                    MODO_CARGA: function () {
                        return $(myControlsComprobantes.MODO_CARGA).val() || '';
                    },
                }
            });
        };
        const fnActionBorrarDocumentos = function () {
            const rowIndexes = $(tblComprobantes).jqxGrid('getselectedrowindexes');

            // Validamos si hay documentos seleccionados.
            if (rowIndexes.length == 0) {
                alertify.warning('No hay documentos seleccionados.')
                return;
            }

            alertify.confirm('Confirmar Acción', '¿Está usted seguro de que desea borrar los documentos seleccionados?', function () {
                // Cargamos todos los documentos seleccionados en peticiones.
                rowIndexes.map(rowIndex => {
                    const rowId = $(tblComprobantes).jqxGrid('getrowid', rowIndex);
                    const rowData = $(tblComprobantes).jqxGrid('getrowdatabyid', rowId);

                    // Agregamos peticiones.
                    $.AddPetition({
                        table: 'DOCUMENTO',
                        type: 2,
                        condition: `C_EMPRESA = '${$.solver.session.SESSION_EMPRESA}' AND C_DOCUMENTO = '${rowData.C_DOCUMENTO}'`,
                        items: $.ConvertObjectToArr({
                            C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                            C_DOCUMENTO: rowData.C_DOCUMENTO,
                            IND_ESTADO: '&'
                        })
                    });
                });

                // Enviamos las peticiones cargadas previamente.
                $.SendPetition({
                    onBefore: function () {
                        $.DisplayStatusBar({ message: 'Borrando los documentos seleccionados...' });
                    },
                    onReady: function () {
                        alertify.success('Los documentos han sido borrados correctamente.');
                        $('form[name = filter_comprobantes]').submit();
                        $.CloseStatusBar();
                    },
                    onError: function (error) {
                        $.CloseStatusBar();
                        $.ShowError({ error: error });
                    }
                });
            }, null)
                .set('labels', { ok: 'Si', cancel: 'No' })
                .set('defaultFocus', 'cancel');
        };
        const fnRefreshTablas = function () {
            $(tblComprobantes).jqxGrid('updatebounddata');
            $(tblHomologar).jqxGrid('updatebounddata');
        };

        fnCrearFiltrosPeriodo();

    });
});