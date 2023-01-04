require(["helper", "extras", 'bootstrap-select', 'fileinput.es'], function () {
    require(["alertify", "moment", "bootbox"], function (alertify, moment, bootbox) {

        alertify.set('notifier', 'position', 'top-center');

        let objFilesByLoad = {
            'client-file-load': { archivo: '', token: '0010' },
            'movimientos-file-load': { archivo: '', token: '0013' },
            'movimientos-detalle-file-load': { archivo: '', token: '0014' },
        };
        const fnCrearCargaArchivo = function (control) {

            $("#" + control).fileinput({
                language: 'es',
                maxFileCount: 1,
                showPreview: false,
                mainClass: "input-group-sm",
                allowedFileExtensions: ['xls', 'xlsx'],
                uploadUrl: $.solver.services.api + "/Service/Upload/New",
                uploadAsync: true,
            });

            $("#" + control).on("filebatchselected", function (event, files) {
                $("#" + control).fileinput("upload");
            });

            $("#" + control).on("fileuploaded", function (event, data, previewId, index) {
                objFilesByLoad[control].archivo = data.response.token;
                $('button.getProceso').removeAttr('disabled');
                $("#" + control).fileinput('clear');
                $('#' + control + '-lbl').html(`<a href="${$.solver.services.api}/service/viewfile/${data.response.token}" target="_blank"><i class="fa fa-check-circle" aria-hidden="true"></i> ${data.response.nameFile}</a>`);
            });

        };

        const fnGuardarParaProceso = function () {

            for (var item in objFilesByLoad) {

                var objInfo = objFilesByLoad[item];
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

                if (objInfo.archivo != '' && objInfo.token != '') {
                    $.AddPetition({
                        type: '1',
                        table: 'MASIVO_PROCESO',
                        items: $.ConvertObjectToArr({
                            C_EMPRESA: $.solver.session.SESSION_EMPRESA,
                            C_MASIVO_PROCESO: '',
                            C_MASIVO: objInfo.token,
                            C_ARCHIVO_MASIVO: objInfo.archivo,
                            FEC_REGISTRO: moment().format('DD/MM/YYYY HH:mm:ss'),
                            IND_ESTADO: '&'
                        }, extras)
                    });
                };

            };

            $.SendPetition({
                onBefore: function () {
                    $.DisplayStatusBar({
                        message: 'Registrando archivos para procesamiento...'
                    });
                },
                onReady: function () {
                    $.CloseStatusBar();
                    alertify.success('Los documentos se han procesado correctamente.');
                    location.reload();
                },
                onError: function (error) {
                    $.CloseStatusBar();
                    alertify.error('Ocurrio un error al registrar los archivos, intentelo nuevamente.');
                    $.ShowError({ error: error });
                }
            });

        };

        //creamos controles
        for (var nameControl in objFilesByLoad) {
            fnCrearCargaArchivo(nameControl);
        };

        //click guardar
        $('button.getProceso').click(function () {

            alertify.confirm(
                'Aprobar Procesamiento',
                '¿Seguro que desea procesar los archivos seleccionados?',
                function () {
                    fnGuardarParaProceso();
                },
                function () {
                    console.log("Operacion Anular Documento Detenida.");
                }
            ).set('labels', { ok: 'Si', cancel: 'No' });

        });

    });
});