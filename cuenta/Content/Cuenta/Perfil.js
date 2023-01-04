require(['helper'], function () {
    require(["alertify"], function (alertify) {

        alertify.set('notifier', 'delay', 4);
        alertify.set('notifier', 'position', 'top-center');

        $.GetQuery({
            query: ['q_aus_acceso_micuenta_descripcion_usu'],
            items: [{
                USUARIO: function () {
                    return $.solver.session.SESSION_ID;
                }
            }],
            onBefore: function () { },
            onReady: function (result) {
                if (result.length > 0) {

                    $('#_NOMBREAPELLIDO').html(result[0].NOMBRE_COMPLETO);
                    $('#_AREA').html(result[0].AREA);
                    $('#_CARGO').html(result[0].CARGO);

                    $.GetQuery({
                        query: ['q_aus_acceso_micuenta_modulos_usu'],
                        items: [{
                            USUARIO: function () {
                                return $.solver.session.SESSION_ID;
                            }
                        }],
                        onBefore: function () { },
                        onReady: function (result) {

                            let html = '';
                            if (result.length > 0) {
                                $.each(result, function (kModulo, vModulo) {
                                    html = '';
                                    html += `<span class="badge badge-pill badge-outline-theme-2 m-1" style="font-size: .90rem;"><i class="fa fa-check-circle" aria-hidden="true"></i> ${vModulo.NOMBRE_MODULO}</span>`;
                                    $('#_MODULOS').append(html);
                                });
                            }

                        }
                    });

                }
            }
        });

        $('.user-img').prop('src', 'https://theme.solver.com.pe//content/images/login1/employee.png');

    });

});