require(["helper", "extras", 'bootstrap-select', 'fileinput.es', 'datetimepicker'], function () {
    require(["alertify", "bootbox"], function (alertify, bootbox) {

        alertify.set('notifier', 'position', 'top-center');

        const fnLoginUser = function (usuario) {

            var dialog = bootbox.dialog({
                centerVertical: true,
                size: 'small',
                message: `  
                <form name="frmSetLogin">
                    <div class="row">
                        <div class="col-12">
                            ${usuario.C_ARCHIVO == null ?
                                `<div class="row justify-content-md-center">
                                    <div class="col-6">
                                        <div class="text-center">
                                            <img src="/Content/Images/userlogin.png" height="135" width="100%" class="shadow-sm rounded-circle bg-white" />
                                        </div>
                                    </div>
                                </div>`
                                :
                                `<div class="row justify-content-md-center">
                                    <div class="col-6">
                                            <div class="text-center">
                                                <img data-source="${usuario.C_ARCHIVO}" src="/Content/Images/userlogin.png" height="135" width="100%" class="shadow-sm rounded-circle bg-white" />
                                            </div>
                                        </div>
                                    </div>`
                            }
                            <div class="row justify-content-md-center mt-3">
                                <div class="col-12 col-md-12">
                                    <div class="text-center">
                                        <h3 class="title font-weight-semibold text-grey m-0 p-0">${usuario.NOMBRE.toUpperCase()}</h3>
                                    </div>
                                </div>
                            </div>
                            <div class="row justify-content-md-center mt-3">
                                <div class="col-12 col-md-12">
                                    <input name="password" type="password" value="" class="form-control form-control-lg pr-4 shadow-none" placeholder="Contraseña" id="id-login-password" autocomplete="off" required="required">
                                </div>
                                <div class="form-group col-md-12 text-center text-danger d-none text-error">
                                    <span><i class="fa fa-exclamation-triangle" aria-hidden="true"></i> El usuario y contraseña no coinciden en nuestro registros.</span>
                                </div>
                            </div>
                        
                            <div class="row mt-2">
                                <div class="col-12">
                                    <div class="text-center">
                                        <button type="submit" class="btn btn-danger btn-lg btn-block btn-bold mt-1 mb-0">
                                            ACCEDER
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <input type="hidden" name="username" value="${usuario.C_USUARIO}">
                </form>`,
                closeButton: true,
                title: 'Ingresa tu clave'
            });

            $(dialog).init(function () {
                $(this).find('form').ValidForm({
                    type: -1,
                    onDone: function (form, controls) {
                        $(controls.password).focus();
                    },
                    onReady: function (result, controls, objectForm) {
                        
                        $('div.text-error').addClass('d-none');

                        $.SetUserSession({
                            username: objectForm.username,
                            password: objectForm.password,
                            onReady: function () {

                                $.DisplayStatusBar({ message: 'Redirigiendo a punto de venta...' });

                                //aqui redirigimos al punto de venta correcto
                                if ($.solver.session.SESSION_PDV_MODO == 'pdv') document.location = "/puntoventa/Procesos/PuntoVenta";
                                if ($.solver.session.SESSION_PDV_MODO == 'restaurant') document.location = "/restaurant/Procesos/PuntoVenta";
                                if ($.solver.session.SESSION_PDV_MODO == 'cocina') document.location = "/restaurant/Procesos/PuntoCocina";
                            },
                            onError: function () {
                                $(controls.password).focus();
                                $('div.text-error').removeClass('d-none');
                            }
                        });

                    }
                });
            });

        };
        const fnArmarBoxUsuario = function (index, usuario) {

            var html = `<div class="col-lg-2 col-md-3 col-sm-6 col-6 mb-4 animated bounceIn">
                    <div class="card card-sp hvrbox shadow-solver card-company">
                        <div class="card-body pt-4 pb-4 d-flex flex-column bg-solver">
                                ${usuario.C_ARCHIVO == null ?
                    `<div class="row">
                                        <div class="col-12">
                                            <div class="text-center">
                                                <img src="/Content/Images/userlogin.png" height="135" width="100%" class="shadow-sm rounded-circle bg-white" />
                                            </div>
                                        </div>
                                    </div>`
                    :
                    `<div class="row">
                                        <div class="col-12">
                                                <div class="text-center">
                                                    <img data-source="${usuario.C_ARCHIVO}" src="/Content/Images/userlogin.png" height="135" width="100%" class="shadow-sm rounded-circle bg-white" />
                                                </div>
                                            </div>
                                        </div>`
                }
                                <div class="row justify-content-md-center mt-3">
                                    <div class="col-12 col-md-12">
                                        <div class="text-center" style="min-height: 3rem;">
                                            <h6 class="title font-weight-semibold text-grey m-0 p-0">${usuario.NOMBRE.toUpperCase()}</h6>
                                        </div>
                                    </div>
                                </div>
                                <div class="row mt-4">
                                    <div class="col-12">
                                        <div class="text-center">
                                            <a href="#" data-index="${index}" data-token="${usuario.C_USUARIO}" class="btn btn-md btn-orange btn-xs pl-2 pr-2 login"><i class="fa fa-paper-plane" aria-hidden="true"></i> INGRESAR</a>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>`;

            return html;

        };
        const fnBuscarUsuarios = function (buscar) {
            $.GetQuery({
                query: ['gbl_obtener_usuarios_habilitados_sistema_pdv'],
                items: [{
                    empresa: $.solver.session.SESSION_EMPRESA,
                    buscar: function () {
                        return buscar;
                    }
                }],
                onReady: function (result) {

                    $.CloseStatusBar();

                    $('#lstUsuarios').html('');

                    var html = '';

                    if (result.length != 0) {

                        $.each(result, function (i, row) {
                            html += fnArmarBoxUsuario(i, row);
                        });

                        $('#lstUsuarios').html(html);

                        $('img').each(function () {
                            var source = $(this).attr('data-source') || '';
                            if (source != '') {
                                $(this).SetScaleImage(`${$.solver.services.api}service/viewfile/${source}`);
                            };
                        });

                        $('#lstUsuarios').find('a.login').click(function (e) {
                            var index = $(this).attr('data-index');
                            var usuario = result[index];
                            fnLoginUser(usuario);
                            e.preventDefault();
                        });

                    };

                },
                onError: function (error) {
                    $.CloseStatusBar();
                    $.ShowError({ error });
                },
                onBefore: function () {
                    $.DisplayStatusBar({ message: 'Buscando usuarios' });
                }
            });
        };

        $('form[name=frmBuscarUsuarios]').ValidForm({
            type: -1,
            onReady: function (form, controls) {
                var buscar = $(controls.buscar).val();
                fnBuscarUsuarios(buscar);
            },
            onDone: function () {
                fnBuscarUsuarios('');
            }
        });

    });
});