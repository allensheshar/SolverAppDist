require(["helper", "extras", "controls", "datetimepicker", "fileinput.es"], function () {
    require(["alertify", "moment", "bootbox", "numeral"], function (alertify, moment, bootbox, numeral) {

        $('#form').ValidForm({
            type: -1,
            onDone: function (form, controls) {
                objControls = controls;

                $("#input-b6").fileinput({
                    language: 'es',
                    maxFileCount: 1,
                    showPreview: true,
                    mainClass: "input-group-sm",
                    allowedFileExtensions: ['xlsx', 'xls'],
                    uploadUrl: $.solver.services.api + "/Service/Upload/New",
                    uploadAsync: true,
                });
                $("#input-b6").on("filebatchselected", function (event, files) {
                    $("#input-b6").fileinput("upload");
                    $.DisplayStatusBar({ message: 'Espere un momento se esta cargando su archivo ...' });
                });
                $("#input-b6").on("fileuploaded", function (event, data, previewId, index) {
                    var token = data.response.token;

                    var anio = $('#ANIO').val()
                    var mes = $('#MES').val()
                    var banco = $('#C_BANCO').val()
                    var cuenta = $('#C_CUENTA_BANCARIA').val()

                    $.GetData({
                        uriData: $.solver.services.api + `/Service/ProcesarFormatoConciliacion/${$.solver.session.SESSION_EMPRESA}/${anio}/${mes}/${banco}/${cuenta}/${token}`,
                        type: 'GET',
                        isPage: true,
                        onBefore: function () {
                            $.DisplayStatusBar({ message: 'Procesando archivo' });
                        },
                        onError: function () {
                            $.CloseStatusBar();
                            console.log(token);
                            alertify.error('Ocurrió un error al procesar el archivo.');
                            $(frm).submit();
                        },
                        onReady: function (object) {
                            if (object == `"OK"`) {
                                alertify.success('El documento fue procesado correctamente.');
                            }
                            else {
                                alertify.error("Ocurrió un error al procesar el archivo.")
                                console.log(object);
                                console.log($.solver.services.api + `/Service/ProcesarFormatoConciliacion/${$.solver.session.SESSION_EMPRESA}/${anio}/${mes}/${banco}/${cuenta}/${token}`);
                            }
                            $.CloseStatusBar();
                            $(dialog).modal('hide');
                            $(frm).submit();
                        }
                    });

                    $("#input-b6").fileinput('clear');
                });
            },
        });
    });
});