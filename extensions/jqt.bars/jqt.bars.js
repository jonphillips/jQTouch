/*

            _/    _/_/    _/_/_/_/_/                              _/       
               _/    _/      _/      _/_/    _/    _/    _/_/_/  _/_/_/    
          _/  _/  _/_/      _/    _/    _/  _/    _/  _/        _/    _/   
         _/  _/    _/      _/    _/    _/  _/    _/  _/        _/    _/    
        _/    _/_/  _/    _/      _/_/      _/_/_/    _/_/_/  _/    _/     
       _/                                                                  
    _/

    Created by David Kaneda <http://www.davidkaneda.com>
    Documentation and issue tracking on Google Code <http://code.google.com/p/jqtouch/>
    
    Special thanks to Jonathan Stark <http://jonathanstark.com/>
    and pinch/zoom <http://www.pinchzoom.com/>
    
    (c) 2009 by jQTouch project members.
    See LICENSE.txt for license.

=======
jqt.bars.js - Daniel J. Pinter - DataZombies

Integration of iScroll 3.6 into jQT with tab bar and tool bar implementations 

iScroll Integration
------------------------------------------------------------

jQT page format

  <div id="jqt">
    <div id="ANY_ID" class="s-pane">
      <div class="toolbar">
        <h1>TITLE</h1>
      </div>
      <div id="ANY_ID-wrapper" class="s-scrollwrapper">
        <div id="ANY_ID-pane" class="s-scrollpane">
  
          <!-- your content -->
  
        </div>
      </div>
    </div>
  
    <!-- more pages -->
  
  </div>

The important parts are the s-pane class on the second div and the two inner
divs with s-scrollwrapper and s-scrollpane classes. The s-scrollwrapper and
s-scrollpane divs must have unique IDs. I got in the habbit of using the page ID
as the prefix for those unique IDs.

This script will auto-load iscroll-min.js as long as that file is in the same
directory as this script. It will also auto-instantiate iScroll for the entire app.

To add iScroll to AJAX loaded pages use this at the bottom of the file...

  </div>
  <script type="text/javascript" charset="utf-8">
  $(document).ready(function(){
    jQT.init_iScroll($('#long'));
  });
  </script>
  <div></div>

See ajax_long.html.

To resize a page after an event, like the ones in #events, use...

  jQT.setPageHeight();

See the swipe or tab functions in index.html.

Please note that jQT is the variable I used to instantiate jQTouch in...

  var jQT = new $.jQTouch({
    ...
  });

You can choose to use any variable you want. Just make sure to substitute that
variable name for "jQT" in the jqt.bars function calls.

*/

(function ($) {
  if ($.jQTouch) {
    $.jQTouch.addExtension(function bars(jQT) {

      var d = document, init_iScroll, initTabbar, initToolbar, setBarWidth, setPageHeight, win = window;
      /*******************
       css section
       *******************/
      $('.s-scrollwrapper').css('position', 'relative');
      $('.s-scrollwrapper').css('z-index', '1');

      /*******************
       function section
       *******************/
      // Begin setBarWidth()
      setBarWidth = function ($bars) {
        var h = parseInt(win.innerHeight > win.innerWidth ? win.innerHeight : win.innerWidth, 10),
          w = parseInt(win.innerWidth < win.innerHeight ? win.innerWidth : win.innerHeight, 10);
        if (jQT.getOrientation() === 'portrait') {
          h += 20;
        } else {
          w += 20;
        }

        if ($bars === null || $bars === undefined) {
          $bars = $('#tabbar, .tabbar');
        }
        $bars.each(function () {
          var min_w1 = parseFloat($('li, td', this).css('min-width')),
            min_w2 = 1.05 * min_w1,
            numOfTabs = $('a', this).length,
            pane = $('> div', this).attr('id'),
            scroll = $(this).data('iscroll');

          if (min_w1 <= w / numOfTabs) {
          // Tab width is a percentage of tabbar - no scrolling
            $(this).removeData('iscroll');
            $('#' + pane + ', table, ul', this).width('100%');
            $('li, td', this).width(100 / numOfTabs + '%');
          } else if (w / numOfTabs < min_w1 && min_w1 <= h / numOfTabs) {
          // Tab width based on longest dimension - scrolling
            $('#' + pane + ', table, ul', this).width(h + 'px');
            $('li, td', this).width(h / numOfTabs + 'px');
          } else {
          // Tab width is min-width + 5% - scrolling
            $('#' + pane + ', table, ul', this).width(min_w2 * numOfTabs + 'px');
            $('li, td', this).width(min_w2 + 'px');
          }
          if (min_w1 > w / numOfTabs) {
            if (scroll === null || scroll === undefined) {
              $(this).data('iscroll', new iScroll(pane, {
                checkDOMChanges: true,
                desktopCompatibility: true,
                hScrollbar: false,
                momentum: false,
                snap: false,
                vScrollbar: false
              }));
            }
          }
        });
      };
      // End setBarWidth()

      // Begin setPageHeight()
      setPageHeight = function ($current_page) {
        if ($current_page === null || $current_page === undefined) {
          $current_page = $('.current');
        }
        $current_page.each(function () {
          var $navbar, navbarH, scroll, $tabbar, tabbarH, $toolbar, toolbarH, $wrapper;

          // Navigation Bar
          $navbar = $('.toolbar', this);
          navbarH = $navbar.length > 0 ? ($navbar.length > 0 ? $navbar.outerHeight() : 0) : 0;

          // Tool Bar (tabbar class) <the toolbar class is already being used by jQT>
          $toolbar = $('.tabbar', this);
          toolbarH = $toolbar.length > 0 ? ($toolbar.css('display') !== 'none' ? $toolbar.outerHeight() : 0) : 0;

          // Tab Bar (tabbar id)
          $tabbar = $('#tabbar');
          tabbarH = $tabbar.length > 0 ? ($tabbar.css('display') !== 'none' ? $tabbar.outerHeight() : 0) : 0;

          $wrapper = $('.s-scrollwrapper', this);
          $wrapper.height(parseInt(win.innerHeight - navbarH - toolbarH - tabbarH, 10));
          $wrapper.css('margin-bottom', parseInt(toolbarH + tabbarH, 10) + 'px');

          scroll = $(this).data('iscroll');
          if (scroll !== null && scroll !== undefined) {
            setTimeout(function () {
              scroll.refresh();
            },
            0);
          }
        });
      };
      // End setPageHeight()

      // Begin init_iScroll()
      init_iScroll = function ($page) {
        if ($page === null || $page === undefined) {
          $page = $('#jqt > div, #jqt > form').has('.s-scrollpane');
        }
        $page.each(function () {
          var scroll = new iScroll($('.s-scrollpane', this).attr('id'), {
            hScrollbar: false,
            checkDOMChanges: true,
            desktopCompatibility: true,
            snap: false
          });
          $(this).data('iscroll', scroll);

          // Scroll to the top of the page when <h1> is touched
          $('.toolbar h1', this).click(function () {
            $('.current').data('iscroll').scrollTo(0, 0, 0);
          });

          // Resize on animation event
          $(this).bind('pageAnimationEnd', function (e, data) {
            if (data.direction === 'in') {
              setPageHeight();
            }
          });
        });

        // Resize on rotation
        $('#jqt').bind('turn', function (e, data) {
          setPageHeight();
        });

        setPageHeight();
      };
      // End init_iScroll()

      // Begin initTabbar()
      initTabbar = function () {
        if ($('#tabbar').length > 0) {

          // Find current class or 1st page in #jqt & the last stylesheet
          var firstPageID = '#' + ($('#jqt > .current').length === 0 ? $('#jqt > *:first') : $('#jqt > .current:first')).attr('id'),
            sheet = d.styleSheets[d.styleSheets.length - 1];

          // Make sure that the tabbar is not visible while its being built
          $('#tabbar').hide();

          $('#tabbar a').each(function (index) {

            // Enummerate the tabbar anchor tags
            $(this).attr('id', 'tabbar_' + index);

            // If this is the button for the page with the current class then enable it
            if ($(this).attr('href') === firstPageID) {
              $(this).addClass('enabled');
            }

            // Put href target into data('default_target') and void href
            $(this).data('default_target', $(this).attr('href'));
            $(this).attr('href', 'javascript:void(0);');

            // Create css masks from the anchor's mask property
            sheet.insertRule("a#tabbar_" + index + "::after, a#tabbar_" + index + "::before {-webkit-mask-image:url('" + $(this).attr('mask') + "')}", sheet.cssRules.length);

            // tabbar touches
            $(this).click(function () {
              var $me = $(this),
                t;
              if (!$me.hasClass('enabled')) {
                t = $me.data('default_target');
                jQT.goTo(t);
                $('#tabbar a').each(function () {
                  $(this).toggleClass('enabled', ($me.get(0) === $(this).get(0)));
                });
              }
            });
          });

          // Hide tabbar when page has a form or any form element except when the page's parent div has the keep_tabbar class
          $('#jqt > div, #jqt > form').has('button, datalist, fieldset, form, input, keygen, label, legend, meter, optgroup, option, output, progress, select, textarea').each(function () {

            // Hide when in a form
            $(this).bind('pageAnimationEnd', function (e, data) {
              if (data.direction === 'in' && !$(this).hasClass('keep_tabbar')) {
                $('#tabbar').hide(function () {
                  setPageHeight();
                });
              }
            });

            // Show when starting to leave a form
            $(this).bind('pageAnimationStart', function (e, data) {
              if (data.direction === 'out') {
                $('#tabbar').show(function () {
                  setPageHeight();
                });
              }
            });
          });

          // Scroll to enabled tab on rotation
          $('#jqt').bind('turn', function (e, data) {
            var scroll = $('#tabbar').data('iscroll');
            if (scroll !== null && scroll !== undefined) {
              setTimeout(function () {
                if ($('.enabled').offset().left + $('.enabled').width() >= win.innerWidth) {
                  scroll.scrollToElement('#' + $('.enabled').attr('id'), '0ms');
                }
              },
              0);
            }
          });

          // Show tabbar now that it's been built
          $('#tabbar').show(function () {
            setPageHeight();
            setBarWidth();
          });
        }
      };
      // End initTabbar()

      // Begin loading iscroll-min.js
      (function () {
        var filename = 'iscroll-min.js', getPath, key = 'iScroll';

        // Begin getPath()
        getPath = function () {
          var path;
          $('script').each(function () {
            path = $(this).attr('src');
            var i = path.indexOf('/jqt.bars.js');
            if (i > 0) {
              path = path.substring(0, path.lastIndexOf('/') + 1);
              return false;
            }
          });
          return path;
        };
        // End getPath()

        $.getScript(getPath() + filename, function () {
          d.addEventListener('touchmove', function (e) {
            e.preventDefault();
          });
          init_iScroll();
          initTabbar();
          //initToolbar()
        });
      })();
      // End loading iscroll-min.js

      return {
        init_iScroll: init_iScroll,
        setPageHeight: setPageHeight
      };

    });
  }
})(jQuery);