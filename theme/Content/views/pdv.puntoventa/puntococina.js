require(["helper", "extras", "datetimepicker", "idle", "keyboard.es", "bootstrap-select"], function () {
    require(["alertify", "bootbox", "moment", "inputmask", "numeral", "sweetalert"], function (alertify, bootbox, moment, inputmask, numeral, Swal) {

        alertify.set('notifier', 'position', 'top-center');

        const fnArmarBoxComanda = function (comanda) {

            var html = '';
            var fila = '';

            var rows = $.grep(comanda, function (n, i) {
                return 
            });

            html += `<div class="col-lg-2 col-md-3 col-sm-6 col-6 mb-4 animated bounceIn">
                <div class="card card-sp hvrbox shadow-solver card-company">
                    <div class="card-body pt-4 pb-4 d-flex flex-column bg-solver">
                            <div class="row justify-content-md-center mt-3">
                                <div class="col-12 col-md-12">
                                    <div class="text-center" style="min-height: 3rem;">
                                        <h2 class="title font-weight-semibold text-grey text-center m-0 p-0">#: ${comanda.C_COMANDA}</h6>
                                        <h4 class="title font-weight-semibold text-grey m-0 p-0">MESERO: ${comanda.NOMBRE_MESERO}</h6>
                                        <h5 class="title font-weight-semibold text-grey m-0 p-0">MESAS: ${comanda.NOMBRE_MESERO}</h6>
                                    </div>
                                </div>
                            </div>
                            <div class="row mt-4">
                                <div class="col-12 site-listado">
                                    
                                </div>
                                <div class="col-12">
                                    <div class="text-center">
                                        <a href="#" class="btn btn-md btn-orange btn-xs pl-2 pr-2"><i class="fa fa-paper-plane" aria-hidden="true"></i> ATENDER</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>`;

            return html;
        };

        $.GetQuery({
            query: ['q_puntoventa_procesos_puntococina_obtiene_pedidos'],
            items: [{
                empresa: $.solver.session.SESSION_EMPRESA
            }],
            onReady: function (result) {

                var html = '';

                $.CloseStatusBar();
                $('#lstComandas').html('');

                if (result.length != 0) {

                    var codComanda = '';

                    $.each(result, function (i, row) {
                        if (row.C_COMANDA != codComanda) {
                            codComanda = row.C_COMANDA;
                            html += fnArmarBoxComanda(row);
                        };
                    });

                    $('#lstComandas').html(html);

                    /*$('img').each(function () {
                        var source = $(this).attr('data-source') || '';
                        if (source != '') {
                            $(this).SetScaleImage(`${$.solver.services.api}service/viewfile/${source}`);
                        };
                    });*/

                };

            },
            onError: function (error) {
                $.CloseStatusBar();
                $.ShowError({ error });
            },
            onBefore: function () {
                $.DisplayStatusBar({ message: 'Validando información' });
            }
        });

    });
});