require(["helper", "extras", "datetimepicker", 'bootstrap-select', 'fileinput.es'], function () {
    require(["alertify", "bootbox", "moment", "codemirror", "codemirror.sql", "ckeditor"], function (alertify, bootbox, moment, CodeMirror, DecoupledDocumentEditor) {
        alertify.set('notifier', 'position', 'top-center');

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

        // ckeditor
        var fnCreateCheditor = function (controls) {

            var ckeditor = CKEDITOR.replace('EDITOR_COMENTARIO', {
                customConfig: '',
                height: 530,
                language: 'es',
                toolbarCanCollapse: false,
                //contentsCss: [
                //    'http://cdn.ckeditor.com/4.16.0/full-all/contents.css',
                //    'https://ckeditor.com/docs/ckeditor4/4.16.0/examples/assets/css/pastefromword.css'
                //],
                // This is optional, but will let us define multiple different styles for multiple editors using the same CSS file.
                //bodyClass: 'document-editor',
            });
            ckeditor.on('change', function (evt) {
                $(controls.COMENTARIO).val(CKEDITOR.instances.EDITOR_COMENTARIO.getData());
            });
            ckeditor.setData($(controls.COMENTARIO).val());

            return ckeditor;
        };

        $("#FEC_DOC").datetimepicker({
            format: 'DD/MM/YYYY',
            locale: 'es'
        });

        $('#FEC_DOC').val($('#FEC_ACTUAL').val());

        $('form[name=frmRegistroDocumentacion]').ValidForm({
            table: 'W_DOCUMENTACION_DB',
            type: 1,
            querySave: true,
            onDone: function (form, controls) {
                var NOMBRE_DOC = $(controls.NOMBRE_DOC).val();

                if (NOMBRE_DOC.length > 0)  $(controls.FEC_DOC).val(moment($(controls.FEC_DOC).val()).format('DD/MM/YYYY'));

                editor = fnCreateEditor(controls);

                $('#USU_DOC').val($.solver.session.SESSION_ID);

                $(controls.btnGuardar).click(function () {
                    editor.save();
                });

                fnCreateCheditor(controls);
            },
            onError: function (error) {
                $.CloseStatusBar();
                $.ShowError({ error: error });
            },
            onReady: function () {
                document.location = $.solver.baseUrl + '/Programador/Documentacion';
            }
        });
    });
});