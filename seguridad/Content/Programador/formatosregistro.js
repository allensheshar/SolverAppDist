require(['helper'], function () {
	require(['ckeditor'], function (DecoupledDocumentEditor) {

        var _controls;

		var fnCreateEditor = function (controls) {

            var editor = CKEDITOR.replace('editor', {
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
            editor.on('change', function (evt) {
                $(controls.CONTENIDO).val(CKEDITOR.instances.editor.getData());
            });
            editor.setData($(controls.CONTENIDO).val());

            return editor;
        };

        $('form[name=frmEditarFormato]').ValidForm({
            type: 1,
            table: 'W_FORMATOS',
            extras: {
                C_FORMATO: {
                    action: {
                        name: 'GetNextId',
                        args: $.ConvertObjectToArr({
                            max_length: 10
                        })
                    }
                }
            },
            querySave: true,
            onDone: function (form, controls) {
                _controls = controls;
				fnCreateEditor(controls);
            },
            onReady: function () {
                //if ($(_controls.C_FORMATO).val() == '') {
                    document.location = document.location = $.solver.baseUrl + '/Programador/Formatos';
                //}
            },
            onError: function (error) {
                $.CloseStatusBar();
                $.ShowError({ error: error });
            }
        });

    });
});