// version 3.2

window.module = window.module || {};
window.module.lp = window.module.lp || {};
window.module.lp.form = window.module.lp.form || {};
window.module.lp.form.data = null;

lp.jQuery(document).ready(function() {
  var formContainer = '#'+window.module.lp.form.data.formContainerId;
  var formButton = '#'+window.module.lp.form.data.formButtonId;
  var errorContainer = '#'+window.module.lp.form.data.errorContainerId;
  var errorLabelContainer = errorContainer + ' ul';
  var formSelector = formContainer + ' form';

  lp.jQuery('form').keypress(function(e) {
    if(e.which === 13 && e.target.nodeName.toLowerCase() !== 'textarea') {
      e.preventDefault();
      lp.jQuery('form').submit();
    }
  });

  var positionErrors = function() {
    var errorWidth = lp.jQuery(errorContainer).outerWidth(true);
    var formWidth = lp.jQuery(formContainer).outerWidth(true);
    if(formWidth + errorWidth < lp.jQuery(window).width()) {
      positionErrorsOnMonitors(formWidth);
    } else {
      positionErrorsSmallScreens();
    }
  };

  var positionErrorsOnMonitors = function(formWidth) {
    var formOffset = lp.jQuery(formContainer).offset();
    var docWidth = lp.jQuery(document).width();
    var left =  (docWidth - (formOffset.left + formWidth + 16)) < 280 ? formOffset.left - 296 : formOffset.left + formWidth + 16;
    var container = lp.jQuery(errorContainer);
    container.css({
      left: left + "px",
      top: Math.max(formOffset.top, lp.jQuery(document).scrollTop()+4) + "px",
      width: "280px"
    });

    window.onscroll = function() {
      handlePositioning(formOffset, container);
    };
  };

  var handlePositioning = function(formPosition, container) {
    var docViewTop = lp.jQuery(window).scrollTop();
    var docViewBottom = docViewTop + lp.jQuery(window).height();
    var errorElTop = container.offset().top;
    var formElBottom = Math.round(errorElTop + container.innerHeight());
    var formHeight = lp.jQuery(formContainer).innerHeight();
    var formBottom = formPosition.top + formHeight;

    if(formBottom < formElBottom && formPosition.top < lp.jQuery(document).scrollTop()) {
      container.css({position: 'absolute'});
    } else if(formPosition.top < lp.jQuery(document).scrollTop()) {
      container.css({position: 'absolute', top: lp.jQuery(document).scrollTop()});
    } else {
      container.css({position: 'absolute', top: formPosition.top});
    }
  };

  //Small screen error positioning is so that the error will display properly on mobile
  //devices.
  var positionErrorsSmallScreens = function() {
    lp.jQuery(errorContainer).css({
      position: "fixed",
      left: "0px",
      right: "0px",
      top: "0px"
    });
  };

  var getScrollBarWidth = function() {
    var inner = document.createElement('p');
    inner.style.width = "100%";
    inner.style.height = "200px";

    var outer = document.createElement('div');
    outer.style.position = "absolute";
    outer.style.top = "0px";
    outer.style.left = "0px";
    outer.style.visibility = "hidden";
    outer.style.width = "200px";
    outer.style.height = "150px";
    outer.style.overflow = "hidden";
    outer.appendChild (inner);

    document.body.appendChild (outer);
    var w1 = inner.offsetWidth;
    outer.style.overflow = 'scroll';
    var w2 = inner.offsetWidth;
    if (w1 == w2) { w2 = outer.clientWidth; }

    document.body.removeChild (outer);

    return (w1 - w2);
  };

  var showSuccessModal = function(data, form) {
    var operator = /\?/.test( data.url ) ? '&' : '?';
    var url = data.url + operator + lp.jQuery( form ).serialize();
    lp.jQuery.ubpoverlay({
      href: url,
      padding:0,
      type: 'iframe',
      onOverlayClick: false,
      width: data.size.width,
      height: data.size.height,
      onComplete: function() {
        if (data.size.height > lp.jQuery('#ubpoverlay-content').height()) {
          var content = lp.jQuery('#ubpoverlay-content')[0];
          var outer = lp.jQuery('#ubpoverlay-outer')[0];
          content.style.width = (data.size.width + getScrollBarWidth()) + 'px';
          outer.style.width = (data.size.width + getScrollBarWidth()) + 'px';
        }
      }
    });
  };

  var getSuccessURL = function( url, form ) {
    if( window.module.lp.form.data.passParams ) {
      var regex = /\?/;
      var operator = regex.test( url ) ? '&' : '?';
      url += operator + lp.jQuery.param(lp.jQuery.map(lp.jQuery('form').serializeArray(),
        function(param){
          return ('pageId' === param.name || 'pageVariant' === param.name) ? null : param;
        }));
    }
    return  url;
  };


  var enableForm = function() {
    lp.jQuery(formButton).removeClass('disabled');
  };

  var disableForm = function() {
    lp.jQuery(formButton).addClass('disabled');
  };

  var isFormDisabled = function() {
    return lp.jQuery(formButton).hasClass('disabled');
  };

  var getFormAction = function(form) {
    var action = form.getAttribute('action');
    if (typeof action === 'object' && action.nodeType === 1) {
      var parent = action.parentNode;
      var node = parent.removeChild(action);
      action = getFormAction(form);
      parent.appendChild(node);
    }
    return action;
  };

  var setFormAction = function(form, url) {
    var action = form.getAttribute('action');
    if (typeof action === 'object' && action.nodeType === 1) {
      var parent = action.parentNode;
      var node = parent.removeChild(action);
      action = setFormAction(form, url);
      parent.appendChild(node);
    }
    form.setAttribute('action', url);
  };

  var stripEmailField = function(validationRules) {
    lp.jQuery.each(validationRules, function(key, value){
      if(value.email) {
        validationRules[key] = {
          required: {
            depends: function(e){
              if(/\W$/.test(lp.jQuery(this).val())) {
                lp.jQuery(this).val(lp.jQuery.trim(lp.jQuery(this).val()));
              }
              return value.required;
            }
          },
          email: true
        };
      }
    });
    return validationRules;
  };

  var phoneValidator = function(type) {
    lp.jQuery.validator.addMethod('phone', function(value, element) {
      value = value.replace(/([. \-()+])/g, '');
      if(type === 'uk') {
        return this.optional(element) || value.length > 9 &&
         value.match(/^((44?(0)?)|(0))([0-9]{3,4}){3}$/);
      } else if(type === 'australian') {
        return this.optional(element) || (value.length  > 5 && value.length < 16) &&
          value.match(/^((0|61)(2|4|3|7|8)){0,1}[0-9]{2}[0-9]{2}[0-9]{1}[0-9]{3}$/);
      } else if(type === 'generic') {
        return this.optional(element) || (value.length > 5 && value.length < 16) && !isNaN(value);
      } else {
        //North American
        return this.optional(element) || (value.length > 9) && value.match(/^(1-?)?(\([2-9]\d{2}\)|[2-9]\d{2})-?[2-9]\d{2}-?\d{4}$/);
      }
      return phoneValidators[type](value, element, this.optional);
    }, 'Please specify a valid phone number');
  };

  var setValidateRules = function(validationData) {
    var validationType = validationData.validationType;
    var validationRules = ['generic', 'australian', 'uk', 'north-american'];
    if((validationType && lp.jQuery.inArray(validationType, validationRules) > -1)) {
      phoneValidator(validationType);
    }
  };

  var notFormPostOrRedirect = function() {
    var action = window.module.lp.form.data.confirmAction;
    return lp.jQuery.inArray(action, ['url', 'post']) === -1;
  };

  var initialize = function() {

    positionErrors();

    setValidateRules(window.module.lp.form.data);

    lp.jQuery(formSelector).validate( {
      rules: stripEmailField(window.module.lp.form.data.validationRules),
      messages: window.module.lp.form.data.validationMessages,
      errorContainer: errorContainer,
      errorLabelContainer: errorLabelContainer,
      wrapper: 'li',
      onFocusOut: positionErrors,
      invalidHandler: positionErrors,
      focusInvalid:false,
      submitHandler: function(form) {
        if (isFormDisabled()) {
          return;
        }

        disableForm();

        lp.jQuery.ajax({
          url: getFormAction(lp.jQuery(form).get(0))+'&lp-form-submit-method=ajax',
          type: 'POST',
          data: lp.jQuery(form).serialize(),
          debug:true,
          error: function() {
            alert(window.module.lp.form.data.errorMessage ||
              'We\'re sorry the form could not be submitted because something went wrong. Please try again.');
          },
          success: function(data) {
            if (data.protected_assets) {
              window.module.lp.form.responseData = {
                protectedAssets: data.protected_assets
              };
            }
            var $form = lp.jQuery('#'+window.module.lp.form.data.formContainerId+' form');
            switch (window.module.lp.form.data.confirmAction) {
              case 'url':
                var url = getSuccessURL( window.module.lp.form.data.confirmData, form );
                window.location.href = url.replace(/\+/g, '%20');
                break;
              case 'message':
                alert(window.module.lp.form.data.confirmData);
                break;
              case 'modal':
                showSuccessModal(window.module.lp.form.data.confirmData, form);
                break;
              case 'post':
                $form.unbind();
                setFormAction($form.get(0), window.module.lp.form.data.confirmData);
                $form.submit();
                break;
            }
          },
          complete: function() {
            if(notFormPostOrRedirect()) {
              enableForm();
              form.blur();
              form.reset();
            }
          }
        });
      }
    });
  };

  var getUrlParams = function() {
    var params = {}, hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    var i;
    for (i=0; i<hashes.length; i++) {
      hash = hashes[i].split('=');
      params[hash[0]] = hash[1];
    }
    return params;
  };

  var copyURLParamsToFields = function() {
    var params = getUrlParams();
    var form = lp.jQuery('#'+window.module.lp.form.data.formContainerId+' form');
    var field;
    var excludeFields = ['pageid', 'pagevariant'];
    for (var param in params) {
      field = lp.jQuery(form).find('input[name='+param+']')[0] || lp.jQuery(form).find('textarea[name='+param+']')[0];
      var isExcludedField = lp.jQuery.inArray( excludeFields, param.toLowerCase() );
      if (typeof field !== 'undefined' && isExcludedField === -1 ) {
        if (field.type === 'text' || field.type === 'hidden' || field.type === 'textarea') {
          field.value = decodeURIComponent(params[param]);
        }
      }
    }
  };

  initialize();
  copyURLParamsToFields();

  //Handle ie8 select box not large enough issue as noted by lp-2467
  if(lp.jQuery.browser.msie && parseInt(lp.jQuery.browser.version,10) < 9) {
    var el;
    lp.jQuery('select').each(function(){
      el = lp.jQuery(this);
      el.data('origWidth', el.outerWidth());
    }).mousedown(function(){
      lp.jQuery(this).css('width', 'auto');
    }).bind("blur change", function(){
      el = lp.jQuery(this);
      el.css('width', el.data('origWidth'));
    });
  }

});

//Adjust Label width to make up for font size differences in browsers.
lp.jQuery(document).ready(function(){

  var adjustLabelHeight = function(e, designHeight) {
    if(e.offsetHeight > designHeight) {
      var adjust = 1;
      var maxAdjust = 30;
      var w = parseInt(e.style.width, 10);
      while(lp.jQuery(e).height() > designHeight && maxAdjust > adjust) {
        e.style.width = (w + adjust) + 'px';
        adjust++;
      }
    }
  };

  lp.jQuery(".lp-pom-form label").each(function(i, e) {
    if(e.style.height) {
      var designHeight = parseInt(e.style.height);
      e.style.height = 'auto';
      adjustLabelHeight(e, designHeight);
    }
  });
});

