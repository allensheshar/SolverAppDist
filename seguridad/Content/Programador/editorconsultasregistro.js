require(["codemirror", "codemirror.sql", "helper"], function (CodeMirror) {

    let tableDetalleConsultas = '#tableDetalleConsultas';

    var editor = null;

    var fnCreateEditor = function (controls) {

        var editor = CodeMirror.fromTextArea($(controls.CADENA_SCRIPT)[0], {
            mode: 'text/x-sql',
            indentWithTabs: true,
            smartIndent: true,
            lineNumbers: true,
            matchBrackets: true,
            autofocus: true,
            extraKeys: { "Ctrl-Space": "autocomplete" },
            hintOptions: {
                tables: {
                    users: ["name", "score", "birthDate"],
                    countries: ["name", "population", "size"]
                }
            }
        });

        return editor;
    };

    const GetFormShowDetalleScript = function (url) {
        var _type = 1;
        var _title = "DETALLE SCRIPTS";

        $.GetData({
            title: _title,
            uriData: url,
            location: 'float',
            type: 'GET',
            isPage: true,
            onReady: function (object, modal) {
                $(modal).find('.modal-dialog').css({ 'max-width': '80%' });

                const fnCrearTablas = function () {
                    $(object).find(tableDetalleConsultas).CreateGrid({
                        query: 'tbl_detalleconsulta_programador_editorconsultasregistrodetalle',
                        items: {
                            C_SCRIPT: function () {
                                return $('#C_SCRIPT').val();
                            },
                            BUSCAR: function () {
                                return $('#_buscar').val();
                            },
                        },
                        hiddens: ['C_SCRIPT', 'C_SCRIPT_HISTORIA', 'CADENA_SCRIPT'],
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
                            'USU_ULTIMO_MODI': {
                                text: 'Usuario Modifico',
                                cellsAlign: 'center',
                                width: 150,
                            },
                            'FEC_HISTORIA': {
                                text: 'Fecha Modificación',
                                cellsAlign: 'center',
                                width: 150,
                            },
                            'NOM_SCRIPT': {
                                text: 'Nombre Consulta',
                                cellsAlign: 'center',
                                width: 400,
                            },
                            'COMENTARIO': {
                                text: 'Comentario Consulta',
                                width: 'auto',
                            },
                            'ACCIONES': {
                                text: 'Acciones',
                                width: 120,
                                createwidget: function (row, column, value, htmlElement) {
                                    $(tableDetalleConsultas).jqxGrid('refresh');
                                },
                                initwidget: function (rowIndex, column, value, htmlElement) {
                                    $(htmlElement).html('');
                                    $(htmlElement).addClass('jqx-grid-cell-middle-align');
                                    $(htmlElement).addClass('mt-1');

                                    var row = $(tableDetalleConsultas).jqxGrid('getrows')[rowIndex];

                                    let _btnShow;
                                    _btnShow = $(`<a id="ver" style="cursor: pointer;" class="jqx-grid-widget">&nbsp;Ver</a>`);
                                    $(htmlElement).append(_btnShow);
                                    $(htmlElement).find('a#ver').unbind('click');
                                    $(htmlElement).find('a#ver').click(function () {
                                        var _cadena_script = row["CADENA_SCRIPT"];
                                        var _nombre_script = row["NOM_SCRIPT"];
                                        var _comentario = row["COMENTARIO"];

                                        $('#NOM_SCRIPT').val(_nombre_script);
                                        $('#COMENTARIO').val(_comentario);

                                        editor.setValue(_cadena_script);

                                        $(object).parent().parent().parent().find('.close').trigger('click');
                                    });
                                }
                            }
                        },
                        config: {
                            height: 600,
                            pageSize: 100,
                            sortable: false,
                            editable: false
                        }
                    });

                };

                $('form[name=filtrosDetalleConsultas]').ValidForm({
                    type: -1,
                    onReady: function (result, controls, form) {
                        $(tableDetalleConsultas).jqxGrid('updatebounddata');
                    }
                });

                fnCrearTablas();
            }
        });
    }
    
    $('form[name=frmRegistroScripts]').ValidForm({
        table: 'W_SCRIPTS',
        type: 1,
        querySave: true,
        onDone: function (form, controls) {

            editor = fnCreateEditor(controls);

            $('#USU_ULTIMO_MODI').val($.solver.session.SESSION_ID)

            $(controls.btnGuardar).click(function () {
                editor.save();
            });

            $('a#btnShowCambios').bind('click', function (e) {
                GetFormShowDetalleScript($.solver.baseUrl + "/Programador/Detalleconsultas/");
                e.preventDefault();
            });
        },
        onError: function (error) {
            $.CloseStatusBar();
            $.ShowError({ error: error });
        },
        onReady: function () {
            document.location = $.solver.baseUrl + '/Programador/Editorconsultas';
        }
    });
});