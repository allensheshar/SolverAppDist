require(["helper", "extras"], function () {

    var c_usuario = $.solver.session.SESSION_ID;
    var _controls = null;

    const fnArmarBoxEmpresa = function (empresa) {
        var url = $('#url').val();
        var html = '';

        html += `<div class="col-lg-2 col-md-3 col-sm-6 col-6 mb-4 animated bounceIn">
                    <div class="card card-sp hvrbox shadow-solver card-company">
                        <div class="card-body pt-4 pb-4 d-flex flex-column bg-solver">
                            ${empresa.C_ARCHIVO_LOGO == null ?
                               `<div class="row">
                                    <div class="col-12">
                                        <div class="text-center">
                                            <img src="/Content/Images/no.png" height="135" width="100%" class="shadow-sm rounded bg-white" />
                                        </div>
                                    </div>
                                </div>`
                            :
                               `<div class="row">
                                    <div class="col-12">
                                            <div class="text-center">
                                                <img data-source="${empresa.C_ARCHIVO_LOGO}" src="/Content/Images/no.png" height="135" width="100%" class="shadow-sm rounded bg-white" />
                                            </div>
                                        </div>
                                    </div>`
                            }
                                <div class="row justify-content-md-center mt-3">
                                    <div class="col-12 col-md-12">
                                        <div class="text-center" style="min-height: 3rem;">
                                            <h6 class="title font-weight-semibold text-grey m-0 p-0">${empresa.RAZON_SOCIAL}</h6>
                                        </div>
                                    </div>
                                </div>
                                <div class="row mt-4">
                                    <div class="col-12">
                                        <div class="text-center">
                                            <a href="${url}/${empresa.C_EMPRESA}" class="btn btn-md btn-orange btn-xs pl-2 pr-2"><i class="fa fa-paper-plane" aria-hidden="true"></i> ELEGIR</a>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>`
        return html;
    }
    const fnBuscarEmpresas = function () {
        $.GetQuery({
            query: ['gbl_obtener_clientes_habilitados_sistema_buscar'],
            items: [{
                CodUsuario: c_usuario,
                Buscar: function () {
                    return $(_controls.buscar).val();
                }
            }],
            onReady: function (result) {
                $.CloseStatusBar();
                $('#lstEmpresas').html('');

                var html = '';
                if (result.length != 0) {

                    $.each(result, function (i, row) {
                        html += fnArmarBoxEmpresa(row);
                    });

                    $('#lstEmpresas').html(html);

                    $('img').each(function () {
                        var source = $(this).attr('data-source') || '';
                        if (source != '') {
                            $(this).SetScaleImage(`${$.solver.services.files}service/viewfile2/${source}/App`);
                        };
                    });
                }
            },
            onError: function (error) {
                $.CloseStatusBar();
                $.ShowError({ error });
            },
            onBefore: function () {
                $.DisplayStatusBar({ message: 'Buscando empresas' });
            }
        })
    }

    $('form[name=frmBuscarEmpresa]').ValidForm({
        type: -1,
        onReady: function (_, controls) {
            fnBuscarEmpresas();
        },
        onDone: function (_, controls) {
            _controls = controls;
            fnBuscarEmpresas();
        }
    });

});