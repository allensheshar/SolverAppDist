require(['jquery'], function () {
    $.extend({
        //Create Menu
        CreateMenuVertical: function () {

            //Creamos Opciones del Usuario Segun Path o Modulo (en sidebar)
            if ($($.solver.layout.menuSidebar).length) {

                //Obtenemos opciones del usuario
                $.GetOptionsUser({
                    modulo: $.solver.basePath.replace('/', ''),
                    onBefore: function () {
                        //$($.solver.layout.menuSidebar).html('<span><i class="fa fa-spinner fa-pulse fa-fw"></i> Cargando opciones ...</span>');
                    },
                    onReady: function (options) {

                        let menu = '';
                        const urlDefPhoto = '/Content/Images/icon.png';

                        //create optiones menu
                        for (var item in options) {

                            var option = options[item];

                            if (option['COD_MENU'] != menu) {
                                menu = option['COD_MENU'];

                                $($.solver.layout.menuSidebar).append(`
                                    <li id="${menu}" class="nav-item dropdown">
                                        <a class="nav-link dropdown-toggle" href="#" id="dropdown${menu}" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                            <img class="d-none d-lg-inline-block mr-1 animated fadeIn" src="${option['ICON_MENU'].length != 0 ? `${$.solver.services.files}/Service/ViewFile2/${option['ICON_MENU']}/App` : `${urlDefPhoto}`}" height="36" width="36">
                                            <span class="color-red me-1 text-uppercase">${option['NOM_MENU']}</span>
                                            <i class="fa fa-chevron-down color-red" aria-hidden="true"></i>
                                        </a>
                                        <div id="opts_${menu}_site" class="dropdown-menu dropdown-menu-end" aria-labelledby="dropdown${menu}">
                                            
                                        </div>
                                    </li>
                                `);

                            };

                            $(`#opts_${menu}_site`).append(`
                                <a class="dropdown-item action-item" data-parent="opts_${menu}" title="${option['NOM_OPCION']}" href="${option['ACCION_OPCION']}">
                                    <img src="${option['ICON_OPCION'].length != 0 ? `${$.solver.services.files}/Service/ViewFile2/${option['ICON_OPCION']}/App` : `${urlDefPhoto}`}" height="20" width="20" /> 
                                    <span>${option['NOM_OPCION']}</span>
                                </a>
                            `);

                        };

                        //Mostramos icono cambio de modulos
                        if (options.length != 0) {
                            $($.solver.layout.changeApps).removeClass('d-none');
                        };

                        //Accion Validacion y Click en Boton ocultar/mostrar Sidebar
                        $($.solver.layout.menuSidebar).find('a.action-item').click(function () {
                            var title = $(this).attr('title');
                            $.DisplayStatusBar({
                                message: `Cargando opción [${title}]...`
                            });
                        });

                    },
                    onError: function (error) {

                    }
                });

            };

        },
        CreateMenuUser: function () {

            if ($($.solver.layout.menuUser).length) {

                $.GetOptionsUser({
                    modulo: 'f7fe3', //codigo interno menu usuario
                    onBefore: function () {
                        //$($.solver.layout.menuSidebar).html('<span><i class="fa fa-spinner fa-pulse fa-fw"></i> Cargando opciones ...</span>');
                    },
                    onReady: function (options) {

                        if (options.length != 0) {

                            let nomMenu = options[0].COD_MENU;

                            $($.solver.layout.menuUser).html('');

                            for (var item in options) {

                                var option = options[item];
                                var defHtmlIcon = '<i class="fa fa-chevron-right" aria-hidden="true"></i>';

                                if (option.ICON_OPCION_HTML != '') {
                                    defHtmlIcon = option.ICON_OPCION_HTML;
                                };

                                if (nomMenu != option.COD_MENU) {
                                    nomMenu = option.COD_MENU;
                                    $($.solver.layout.menuUser).append(`<li><hr class="dropdown-divider"></li>`);
                                };

                                $($.solver.layout.menuUser).append(`<li><a class="dropdown-item company" href="${option['ACCION_OPCION']}">${defHtmlIcon} ${option.NOM_OPCION}</a></li>`);

                            };

                            //agregamos cambio de empresa y logout
                            $($.solver.layout.menuUser).append(`<li><hr class="dropdown-divider"></li>`);
                            if (typeof $.solver.session.SESSION_TIPO != 'undefined') {
                                if ($.solver.session.SESSION_TIPO == 'SISTEMA') {
                                    $($.solver.layout.menuUser).append(`<li><a class="dropdown-item" href="/Home/ElijeEmpresa"><i class="fa fa-exchange text-primary-m1 text-105 mr-1" aria-hidden="true"></i> Cambiar Empresa</a></li>`);
                                }
                            }
                            $($.solver.layout.menuUser).append(`<li><a class="dropdown-item logout" href="/Cuenta/Logout"><i class="fa fa-power-off text-warning-d1 text-105 mr-1"></i> Salir del Sistema</a></li>`);

                        };

                    }
                });

            };

        },
        //Start Application
        InitApplication: function () {

            //Asignamos Url del Dominio Principal / Parametros por Defecto Pagina
            if ($($.solver.layout.linkHome).length) $($.solver.layout.linkHome).attr('href', $.solver.domainUrl + '/Home/ElijeModulo');
            if ($($.solver.layout.userName).length) $($.solver.layout.userName).html($.solver.session.SESSION_NOMBRE);

            //Obtenemos datos de empresa seleccionada
            if (typeof $.solver.session.SESSION_EMPRESA != 'undefined') {
                if ($.solver.session.SESSION_EMPRESA != '') {
                    $.solver.fn.getDataCompany({
                        onReady: function (result) {
                            $($.solver.layout.subTitleHeader).html(`${result[0].NRO_DOCUMENTO} - ${result[0].RAZON_SOCIAL}`);
                        }
                    });
                };
            };

            //Creamos Menu Vertical
            $.CreateMenuVertical();
            $.CreateMenuUser();

            //Obtenemos Logo de la Empresa Activa
            $.solver.fn.getImageLogoCompany('img#ImageCompany');

            //Asignamos temporalmente una imagen de usuario
            if ($.solver.session.SESSION_FOTO == '') {
                $($.solver.layout.imageUser).SetScaleImage('https://theme.solver.com.pe//content/images/login1/employee.png', 'cover');
            } else {
                $($.solver.layout.imageUser).SetScaleImage($.solver.services.files + 'service/viewfile2/' + $.solver.session.SESSION_FOTO + '/App', 'cover');
            };
            $($.solver.layout.imageUser).attr('title', $.solver.session.SESSION_NAME);

            //Evaluando datos de la session
            if (typeof $.solver.session.SESSION_ID != 'undefined') {

                $.CheckSession();

                if ($('#UserItem').length) {
                    $('#UserItem').removeClass('d-none');
                };

                $($.solver.layout.menuUser).removeClass('d-none');
                if ($($.solver.layout.menuUser).length) {
                    $($.solver.layout.menuUser).find('a.logout').attr('href','#');
                    $($.solver.layout.menuUser).find('a.logout').click(function (e) {
                        if (typeof $.solver.session.SESSION_PDV_MODO != 'undefined') {
                            $.LogoutSession({
                                onBefore: function () {
                                    $.DisplayStatusBar({
                                        message: `Cerrando las credenciales de [${$.solver.session.SESSION_NOMBRE}]...`
                                    });
                                },
                                onReady: function () {
                                    document.location = $.solver.domainUrl + `/Cuenta/LoginDesktop/${$.solver.session.SESSION_EMPRESA}/${$.solver.session.SESSION_PDV_MODO}`;
                                }
                            });
                        } else {
                            document.location = $.solver.domainUrl + '/Cuenta/Logout';
                        };
                        e.preventDefault();
                    });
                };

            };

            //Top 0 Window
            $(window).scrollTop(0);

        },
    });
});