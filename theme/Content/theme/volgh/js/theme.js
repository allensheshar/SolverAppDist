require(['jquery', 'perfect.scrollbar', 'sidebar'], function () {

    //Extend Functions
    $.extend({

        //SideMenu Left
        SideMenu: function () {

            var slideMenu = $('.side-menu');

            // Toggle Sidebar
            $('[data-toggle="sidebar"]').click(function (event) {
                event.preventDefault();
                $('.app').toggleClass('sidenav-toggled');
            });

            $(window).on('load resize', function () {
                if ($(window).width() < 739) {
                    $('.side-menu').hover(function (event) {
                        event.preventDefault();
                        $('.app').addClass('sidenav-toggled');
                    });
                }
                if ($(window).width() > 739) {
                    $('.side-menu').hover(function (event) {
                        event.preventDefault();
                        $('.app').removeClass('sidenav-toggled');
                    });
                }
            });

            // Activate sidebar slide toggle
            /*
             * CÓDIGO PARA MENÚ DESPLEGABLE
             * 
            $("[data-toggle='slide']").on('click', function (e) {
                var $this = $(this);
                var checkElement = $this.next();
                var animationSpeed = 300,
                    slideMenuSelector = '.slide-menu';
                if (checkElement.is(slideMenuSelector) && checkElement.is(':visible')) {
                    checkElement.slideUp(animationSpeed, function () {
                        checkElement.removeClass('open');
                    });
                    checkElement.parent("li").removeClass("is-expanded");
                }
                else if ((checkElement.is(slideMenuSelector)) && (!checkElement.is(':visible'))) {
                    var parent = $this.parents('ul').first();
                    var ul = parent.find('ul:visible').slideUp(animationSpeed);
                    ul.removeClass('open');
                    var parent_li = $this.parent("li");
                    checkElement.slideDown(animationSpeed, function () {
                        checkElement.addClass('open');
                        parent.find('li.is-expanded').removeClass('is-expanded');
                        parent_li.addClass('is-expanded');
                    });
                }
                if (checkElement.is(slideMenuSelector)) {
                    e.preventDefault();
                }
            }); */

            //Activate bootstrip tooltips
            $("[data-toggle='tooltip']").tooltip();


            // ______________Active Class
            $(".app-sidebar li a").each(function () {
                var pageUrl = window.location.href.split(/[?#]/)[0];
                if (this.href == pageUrl) {
                    $(this).addClass("active");
                    $(this).parent().addClass("active"); // add active to li of the current link
                    $(this).parent().parent().prev().addClass("active"); // add active class to an anchor
                    $(this).parent().parent().prev().click(); // click the item to make it drop
                }
            });

        },

        //Custom Page
        CustomPage: function () {

            let stickyElement = $(".sticky"),
                stickyClass = "sticky-pin",
                stickyPos = 0, //Distance from the top of the window.
                stickyHeight = 0;

            const jumpsPrevent = function () {
                stickyHeight = stickyElement.innerHeight();
                stickyElement.css({ "margin-bottom": "-" + stickyHeight + "px" });
                stickyElement.next().css({ "padding-top": + stickyHeight + "px" });
            };
            const stickerFn = function () {
                var winTop = $(window).scrollTop();
                winTop >= stickyPos ? stickyElement.addClass(stickyClass) : stickyElement.removeClass(stickyClass);
                if ($(window).scrollTop() >= 1) {
                    $('body').addClass('stiky-menu');
                } else {
                    $('body').removeClass('stiky-menu');
                };
            };
            const checkScrollTop = function () {
                if ($(window).scrollTop() > 0) {
                    $('#back-to-top').fadeIn('slow');
                } else {
                    $('#back-to-top').fadeOut('slow');
                }
            };

            //Page After Loading
            $("#global-loader").fadeOut("slow");

            //Function trigger:
            $(window).resize(function () {
                if (stickyElement.length) jumpsPrevent();
            });
            $(window).on("scroll", function (e) {
                checkScrollTop();
                if (stickyElement.length) stickerFn();
            });
            $(document).on("click", "#back-to-top", function (e) {
                $("html, body").animate({
                    scrollTop: 0
                }, 600);
                e.preventDefault();
            });

            //Imagen Cover
            $(".cover-image").each(function () {
                var attr = $(this).attr('data-image-src');
                if (typeof attr !== typeof undefined && attr !== false) {
                    $(this).css('background', 'url(' + attr + ') center center');
                }
            });

            //Full screen
            $(document).on("click", ".fullscreen-button", function toggleFullScreen() {
                $('html').addClass('fullscreen-button');
                if ((document.fullScreenElement !== undefined && document.fullScreenElement === null) || (document.msFullscreenElement !== undefined && document.msFullscreenElement === null) || (document.mozFullScreen !== undefined && !document.mozFullScreen) || (document.webkitIsFullScreen !== undefined && !document.webkitIsFullScreen)) {
                    if (document.documentElement.requestFullScreen) {
                        document.documentElement.requestFullScreen();
                    } else if (document.documentElement.mozRequestFullScreen) {
                        document.documentElement.mozRequestFullScreen();
                    } else if (document.documentElement.webkitRequestFullScreen) {
                        document.documentElement.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
                    } else if (document.documentElement.msRequestFullscreen) {
                        document.documentElement.msRequestFullscreen();
                    }
                } else {
                    $('html').removeClass('fullscreen-button');
                    if (document.cancelFullScreen) {
                        document.cancelFullScreen();
                    } else if (document.mozCancelFullScreen) {
                        document.mozCancelFullScreen();
                    } else if (document.webkitCancelFullScreen) {
                        document.webkitCancelFullScreen();
                    } else if (document.msExitFullscreen) {
                        document.msExitFullscreen();
                    }
                }
            });

            //Run
            if (stickyElement.length) {
                stickyElement.after('<div class="jumps-prevent"></div>');
                stickyPos = stickyElement.offset().top;
                jumpsPrevent();
                stickerFn();
            };
            checkScrollTop();

        },

        //Start Application
        InitApplication: function () {

            $.SideMenu();
            $.CustomPage();

            if ($($.solver.layout.userName).length) $($.solver.layout.userName).html($.solver.session.SESSION_EMAIL);
            if ($($.solver.layout.userName).length) $('#UserNameWeb').html($.solver.session.SESSION_EMAIL);
            if ($($.solver.layout.userName).length) $('#UserNameMobile').html($.solver.session.SESSION_EMAIL);

            if ($($.solver.layout.menuUser).length) $($.solver.layout.menuUser).find('a.logout').attr('href', $.solver.domainUrl + '/Cuenta/Logout');
            if ($($.solver.layout.menuUser).length) $($.solver.layout.menuUser).find('a.profile').attr('href', $.solver.domainUrl + '/Perfil/MiCuenta');
            
            if ($.solver.session.SESSION_FOTO == '') {
                $($.solver.layout.imageUser).SetScaleImage('https://theme.solver.com.pe//content/images/login1/employee.png', 'cover');
                $('#UserPhotoMobile').SetScaleImage('https://theme.solver.com.pe//content/images/login1/employee.png', 'cover');
                $('#UserPhotoWeb').SetScaleImage('https://theme.solver.com.pe//content/images/login1/employee.png', 'cover');
            } else {
                $($.solver.layout.imageUser).SetScaleImage($.solver.services.api + 'service/viewfile/' + $.solver.session.SESSION_FOTO, 'cover');
                $('#UserPhotoMobile').SetScaleImage($.solver.services.api + 'service/viewfile/' + $.solver.session.SESSION_FOTO, 'cover');
                $('#UserPhotoWeb').SetScaleImage($.solver.services.api + 'service/viewfile/' + $.solver.session.SESSION_FOTO, 'cover');
            };
            $($.solver.layout.imageUser).attr('title', $.solver.session.SESSION_NOMBRE);

            $(window).scrollTop(0);

        },

    });

});

