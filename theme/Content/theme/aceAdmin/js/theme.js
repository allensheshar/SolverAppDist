require(['jquery'], function () {
    $.extend({
        //Create Menu
        CreateMenuVertical: function () {

            //Creamos Opciones del Usuario Segun Path o Modulo (en sidebar)
            if ($($.solver.layout.menuSidebar).length) {

                //Accion Validacion y Click en Boton ocultar/mostrar Sidebar
                const config = {
                    sidebarMenu: {
                        active: ['col-xl-2', 'col-lg-2', 'col-md-3', 'd-md-block'],
                        inactive: ['d-none']
                    },
                    mainPage: {
                        active: ['col-md-9', 'col-xl-10', 'col-lg-10', 'offset-md-3', 'offset-lg-2'],
                        inactive: ['col-12']
                    }
                };
                const initSidebar = function () {

                    let sidebarStatus = localStorage.getItem('sidebarStatus') || 'active';
                    let status = '';

                    if (sidebarStatus == 'active') status = 'inactive';
                    if (sidebarStatus == 'inactive') status = 'active';

                    for (var item in config) {
                        var element = config[item];
                        $($.solver.layout[item]).removeClass(element[status]);
                        $($.solver.layout[item]).addClass(element[sidebarStatus]);
                    };

                };
                const startMenu = function () {
                    //activamos grupo de menu por defecto
                    var groupDefault = $($.solver.layout.menuSidebar).find('.option-item').first();
                    var foundAction = false;
                    var lastActionMenu = localStorage.getItem('lastActionMenu') || '';

                    $($.solver.layout.menuSidebar).find('a.action-solver').each(function () {
                        //buscamos grupo segun url
                        if ($(this).attr('href') == window.location.href) {
                            groupDefault = $($.solver.layout.menuSidebar).find('#' + $(this).attr('data-parent'));
                            foundAction = true;
                        };
                    });
                    if (lastActionMenu != '' && !foundAction) {
                        $($.solver.layout.menuSidebar).find('a.action-solver').each(function () {
                            //buscamos grupo segun ultima url usada por el usuario
                            if ($(this).attr('href') == lastActionMenu) {
                                groupDefault = $($.solver.layout.menuSidebar).find('#' + $(this).attr('data-parent'));
                                foundAction = true;
                            };
                        });
                    };
                    setTimeout(function () {
                        $(groupDefault).collapse('show');
                    }, 450);

                    //aplicamos eventos al collapse
                    $($.solver.layout.menuSidebar).find('.menu-solver .option-item').on('shown.bs.collapse', function () {
                        var referer = $(this).attr('data-ref');
                        $($.solver.layout.menuSidebar).find('.menu-solver .title-item').addClass('bg-solver-red');
                        $(referer).find('.title-item').removeClass('bg-solver-red');
                    });
                    $($.solver.layout.menuSidebar).find('.menu-solver .option-item').on('hidden.bs.collapse', function () {
                        $($.solver.layout.menuSidebar).find('.menu-solver .title-item').addClass('bg-solver-red');
                    });

                    //al hacer click muestra un mensaje de carga de la opcion
                    $($.solver.layout.menuSidebar).find('.menu-solver .option-item .box').click(function () {

                        var action = $(this).attr('data-action');
                        var title = $(this).attr('title');

                        $.DisplayStatusBar({
                            message: `Cargando opción [${title}]...`
                        });

                        localStorage.setItem('lastActionMenu', action);

                    });
                };

                //Obtenemos opciones del usuario
                $.GetOptionsUser({
                    modulo: $.solver.basePath.replace('/', ''),
                    onBefore: function () {
                        $($.solver.layout.menuSidebar).html('<span><i class="fa fa-spinner fa-pulse fa-fw"></i> Cargando opciones ...</span>');
                    },
                    onReady: function (options) {

                        let menu = '';
                        const colors = ["bg-solver-orange", "bg-solver-blue", "bg-solver-green", "bg-solver-red"];
                        let colorsCount = 0;
                        const urlDefPhoto = '/Content/Images/icon.png';

                        //create optiones menu
                        $($.solver.layout.menuSidebar).html(`<div id="menu-home" class="pl-0 pt-2 pb-2"></div>`);
                        for (var item in options) {

                            var option = options[item];

                            if (option['COD_MENU'] != menu) {
                                menu = option['COD_MENU'];
                                $('#menu-home').append(`
                                    <div id="${menu}" class="menu-solver mb-4 shadow-solver animated fadeInLeft">
                                        <div class="title-item title bg-solver-red p-2 pb-0" data-toggle="collapse" data-target="#opts_${menu}" aria-expanded="false" aria-controls="OPTS_${menu}">
                                            <span class="icon"><i class="fa fa-chevron-right" aria-hidden="true"></i></span>
                                            <span class="text text-uppercase">${option['NOM_MENU']}</span>
                                        </div>
                                        <div id="opts_${menu}" data-ref="#${menu}" class="option-item options p-0 pt-2 pb-2 collapse" aria-labelledby="${menu}" data-parent="#menu-home">
                                            <div class="container-fluid">
                                                <div class="row pl-2 pr-2" id="opts_${menu}_site"></div>
                                            </div>
                                        </div>
                                    </div>
                                `);
                            };

                            $(`#opts_${menu}_site`).append(`
                                <div class="col-xs-12 col-sm-6 col-md-6 col-lg-6 col-xl-4 col-xxl-3 p-1" >
                                    <a data-parent="opts_${menu}" href="${option['ACCION_OPCION']}" class="text-decoration-none action-solver">
                                        <div class="box ${colors[colorsCount]} p-1" title="${option['NOM_OPCION']}" data-action="${option['ACCION_OPCION']}">
                                            <div class="icon text-center mt-2 mb-2">
                                                <img width="30" height="30" src="${option['ICON_OPCION'].length!=0 ? `${$.solver.services.files}/Service/ViewFile2/${option['ICON_OPCION']}/App` : `${urlDefPhoto}`}" />
                                            </div>
                                            <div class="title text text-uppercase text-center mb-0">${option['NOM_OPCION']}</div>
                                        </div>
                                    </a>
                                </div>
                            `);

                            colorsCount++;
                            if (colorsCount > colors.length - 1) { colorsCount = 0; }

                        };

                        //button sider bar hide/show
                        $($.solver.layout.buttonSidebar).click(function () {

                            let sidebarStatus = localStorage.getItem('sidebarStatus') || 'active';
                            let status = '';

                            if (sidebarStatus == 'active') status = 'inactive';
                            if (sidebarStatus == 'inactive') status = 'active';

                            for (var item in config) {

                                var element = config[item];

                                $($.solver.layout[item]).removeClass(element[sidebarStatus]);
                                $($.solver.layout[item]).addClass(element[status]);

                            };

                            localStorage.setItem('sidebarStatus', status);

                        });

                        //start actions
                        initSidebar();
                        startMenu();

                    },
                    onError: function (error) {

                    }
                });

                //Mostramos icono cambio de modulos
                $($.solver.layout.changeApps).removeClass('d-none');

            } else {

                //Ocultamos icono cambio de modulos
                $($.solver.layout.changeApps).addClass('d-none');

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

            //Creamos Menu Vertical/Usuario
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

            //Check Session
            if (typeof $.solver.session.SESSION_ID != 'undefined') {
                $.CheckSession();
            };

            //Top 0 Window
            $(window).scrollTop(0);

            //Mensaje para recuperar contraseña
            require(["sweetalert"], function (Swal) {
                $('#recoveryPwd').click(function (e) {
                    Swal.fire({
                        icon: 'info',
                        title: 'Recuperar contraseña',
                        text: 'Para recuperar tu contraseña comunicate con mesadeayuda@solunet.com.pe',
                        timer: 8500,
                        confirmButtonText: 'Cerrar',
                        timerProgressBar: true
                    });
                });
            });

        },
    });
});