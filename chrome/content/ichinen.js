if ("undefined" == typeof (kutunesirka))
    var kutunesirka = {};
if ("undefined" == typeof (kutunesirka.ichinen_search))
    kutunesirka.ichinen_search = {};

kutunesirka.ichinen_search.init = {
    // https://developer.mozilla.org/ja/docs/Code_snippets/Progress_Listeners
    oldURL: null,
    prefix: "extensions.googleichinen-search.",
    getPrefs: function () {
        return Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
    },
    onLoad: function () {

        var prefs = this.getPrefs();
        var pref_firstRun = prefs.getBoolPref(this.prefix + "firstRun");
        if (pref_firstRun === true) {
            this.addButton();
            prefs.setBoolPref(this.prefix + "firstRun", false);
        }
        gBrowser.addProgressListener(myExt_urlBarListener,
                Components.interfaces.nsIWebProgress.NOTIFY_STATE_DOCUMENT);

    },
    unLoad: function () {
        gBrowser.removeProgressListener(myExt_urlBarListener);
    },
    processNewURL: function (aURI) {
        if (aURI.spec == this.oldURL)
            return;

        // now we know the url is new...
        // alert(aURI.spec);
        // Firebug.Console.log(aURI.spec);
        this.oldURL = aURI.spec;
        this.reflectButton(aURI.spec);
    },
    pageReflect: function (baseurl, onoff, time_range, search_type) { // search
        var fordUrl = baseurl;

        var url = baseurl.replace(/&as_qdr=(.+?)(&.*|#.*|$)/g, "&");
        url = url.replace(/&tbs=(.+?)(&.*|#.*|$)/g, "&");
        if (onoff == "on" || search_type) {
            fordUrl = url + "&tbs=qdr:" + time_range;
        } else {
            fordUrl = url;
        }

        // https://developer.mozilla.org/ja/docs/Code_snippets/Tabbed_browser
        openUILinkIn(fordUrl, "current");

        // new tab
        // gBrowser.selectedTab = gBrowser.addTab(fordUrl);
    },
    searchPursue: function (time_range, search_type) {
        var browser = gBrowser.getBrowserForTab(gBrowser.selectedTab);
        var url = browser.currentURI.spec;

// config get
        if (search_type === false) {
            var prefs = this.getPrefs();
            var pref_searchbutton = prefs.getCharPref(this.prefix + "searchbutton");
            if (pref_searchbutton) {
                time_range = pref_searchbutton;
            }
        }

        var toolbar = document.getElementById("toolbar-search");
        if (toolbar) {
            var icontype = toolbar.getAttribute("icontype");
            if (icontype == "on") {
                this.pageReflect(url, "off", time_range, search_type);
            } else {
                this.pageReflect(url, "on", time_range, search_type);
            }
        }
    },
    reflectButton: function (url) {
        var toolbar = document.getElementById("toolbar-search");
        var toolbar_contextmenu = document.getElementById("toolbar-search-contextmenu");
        var is_google = this.isGoogle(url);
        var is_as_qdr = this.getParam(url, "as_qdr");
        var is_tbs = this.getParam(url, "tbs");

        if (toolbar && toolbar_contextmenu) {
            if (is_google) {
                toolbar.removeAttribute("disabled");
                toolbar_contextmenu.removeAttribute("disabled");
                if (is_google && (is_as_qdr || is_tbs)) {
                    toolbar.setAttribute("icontype", "on");
                } else {
                    toolbar.setAttribute("icontype", "off");
                }
            } else {
                toolbar.setAttribute("disabled", true);
                toolbar_contextmenu.setAttribute("disabled", true);
            }

        }
        var button = document.getElementById("tabautoreload-button");

        if (button) {
            var tooltipText;

            try {
                tooltipText = document.getElementById("context_ichinen_search_" + browser.reloadIntvl).label;
            } catch (e) {
                tooltipText = document.getElementById("context_ichinen_search_user").label;
            }
            button.setAttribute("tooltiptext", tooltipText);

            button.setAttribute("stop", !(browser.autoReloading));
        }
    },
    isGoogle: function (url) {
        return url
                .match(/https?:\/\/www\.google[^\/]+?(\/#|\/search|\/webhp|$)/) != null;
    },
    getGoogleQuery: function (url) {
        var quPattern = new RegExp(/http.*\?.*&qu=(.+?)(&.*|#.*|$)/);
        var qPattern = new RegExp(/http.*\?.*&q=(.+?)(&.*|#.*|$)/);

        url = url.replace(/\+/g, " ");

        url = decodeURIComponent(url);
        if (url.match(quPattern) || url.match(qPattern)) {
            return RegExp.$1;
        } else {
            return "";
        }
    },
    getParam: function (url, name) {
        var pattern = new RegExp("http.*\?(.*&)?" + name + "=(.+?)(&.*|#.*|$)");

        url = decodeURIComponent(url);
        if (url.match(pattern)) {
            return RegExp.$2;
        } else {
            return "";
        }
    },
    addButton: function () {
        toolbarButton = 'toolbar-search';
        navBar = document.getElementById('nav-bar');
        currentSet = navBar.getAttribute('currentset');
        if (!currentSet) {
            currentSet = navBar.currentSet;
        }
        curSet = currentSet.split(',');
        if (curSet.indexOf(toolbarButton) == -1) {
            set = curSet.concat(toolbarButton);
            navBar.setAttribute("currentset", set.join(','));
            navBar.currentSet = set.join(',');
            document.persist(navBar.id, 'currentset');
            try {
                BrowserToolboxCustomizeDone(true);
            } catch (e) {
            }
        }
    },
};

var myExt_urlBarListener = {
    QueryInterface: function (aIID)
    {
        if (aIID.equals(Components.interfaces.nsIWebProgressListener) ||
                aIID.equals(Components.interfaces.nsISupportsWeakReference) ||
                aIID.equals(Components.interfaces.nsISupports))
            return this;
        throw Components.results.NS_NOINTERFACE;
    },
    onLocationChange: function (aProgress, aRequest, aURI)
    {
        kutunesirka.ichinen_search.init.processNewURL(aURI);
    },
    onStateChange: function () {
    },
    onProgressChange: function () {
    },
    onStatusChange: function () {
    },
    onSecurityChange: function () {
    },
    onLinkIconAvailable: function () {
    }
};

window.addEventListener("load",  function () { kutunesirka.ichinen_search.init.onLoad(); }, false);
window.addEventListener("unload",  function () { kutunesirka.ichinen_search.init.unLoad(); }, false);
