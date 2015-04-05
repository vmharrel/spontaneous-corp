// jQuery
$(document).ready(function() {
    $('.hidden-section').slideUp('fast');
    $('.fancybox').fancybox();
    $(function() {
        AppShowcase.init();
    });
    // Animated Scroll
    $('body').plusAnchor({
        easing: 'easeInOutExpo',
        speed: 1000
    });
    // Nav-Menu
    $('#nav-menu a').click(function() {
        $('#nav-menu a.active').removeClass('active');
        $(this).addClass('active');
    });
    // Responsive Nav-Menu
    $('.menu-trigger').click(function() {
        $('#nav-menu').slideToggle('slow');
    });
    // Hidden-Section
    $('.hidden-section').slideUp();
    $('.hs-trigger').click(function() {
        $('.hidden-section').slideToggle('slow', function() {
            if ($(this).is(":visible")) {
                $('.hs-trigger').text('SlideUp');
            } else {
                $('.hs-trigger').text('Show Reviews');
            }
        });
    });
    $('.carousel').carousel({
        interval: 4000
    });
    // Subscription-Form
    $(".mail-input").keypress(function() {
        $(".mail-input").css({
            "background-color": "#fafafa"
        });
    });
    $(".mail-input").blur(function() {
        $(".mail-input").css({
            "background-color": "#FAFAFA"
        });
    });
    $(".mail-input").focus(function() {
        $(".mail-input").css({
            "background-color": "#fafafa"
        });
        $(".mail-input").css({
            "color": "#333"
        });
        $('.mail-input').val("");
    });
    $(function() {
        $(".submit-btn").click(function() {
            var x = $(".mail-input").val();
            var atpos = x.indexOf("@");
            var dotpos = x.lastIndexOf(".");
            var email = $(".mail-input").val();
            var dataString = 'email=' + email;
            if (atpos < 1 || dotpos < atpos + 2 ||
                dotpos + 2 >= x.length) {
                $(".mail-input").css({
                    "background-color": "rgba(216, 70, 55, 0.64)"
                });
            } else {
	            	$.ajaxSetup({
	            		beforeSend: function(xhr) {
	            			xhr.setRequestHeader('Access-Control-Allow-Origin', 'http://www.oneclickshiplogistics.com');
	            			xhr.setRequestHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
	            			xhr.setRequestHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
	            			xhr.setRequestHeader('Access-Control-Allow-Credentials', true);
	            			console.log('XHR: ' + JSON.stringify(xhr));
	            		}
	            	});
                $.ajax({
                    type: "POST",
                    url: "http://www.oneclickshiplogistics.us10.list-manage.com/subscribe/post?u=30dd04a79da8f1df4501ec370&amp;id=056ddfb38b",
                    //url: "mail.php",
                    headers:
                    	{ 'Access-Control-Allow-Origin': '*' },
                    data: dataString,
                    success: function() {
                        $('.mail-input').val(
                            "Done! You will get latest news about OneClickShip."
                        );
                        $(".mail-input").css({
                            "background-color": "rgba(12, 162, 42, 1)"
                        });
                        $(".mail-input").css({
                            "color": "#fafafa"
                        });
                    }
                });
            }
            return false;
        });
    });
});