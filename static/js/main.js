var getQueryStringRegExp = function (name) {
    var reg = new RegExp("(^|\\?|&)" + name + "=([^&]*)(\\s|&|$)", "i");
    if (reg.test(location.href)) return unescape(RegExp.$2.replace(/\+/g, " "));
    return null;
};

var docCookies = {
    getItem: function (sKey) {
        return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
    },
    setItem: function (sKey, sValue, vEnd, sPath, sDomain, bSecure) {
        if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) {
            return false;
        }
        var sExpires = "";
        if (vEnd) {
            switch (vEnd.constructor) {
                case Number:
                    sExpires = vEnd === Infinity ? "; expires=Fri, 31 Dec 9999 23:59:59 GMT" : "; max-age=" + vEnd;
                    break;
                case String:
                    sExpires = "; expires=" + vEnd;
                    break;
                case Date:
                    sExpires = "; expires=" + vEnd.toUTCString();
                    break;
            }
        }
        document.cookie = encodeURIComponent(sKey) + "=" + encodeURIComponent(sValue) + sExpires + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "") + (bSecure ? "; secure" : "");
        return true;
    },
    removeItem: function (sKey, sPath, sDomain) {
        if (!sKey || !this.hasItem(sKey)) {
            return false;
        }
        document.cookie = encodeURIComponent(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" + ( sDomain ? "; domain=" + sDomain : "") + ( sPath ? "; path=" + sPath : "");
        return true;
    },
    hasItem: function (sKey) {
        return (new RegExp("(?:^|;\\s*)" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
    },
    keys: /* optional method: you can safely remove it! */ function () {
        var aKeys = document.cookie.replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g, "").split(/\s*(?:\=[^;]*)?;\s*/);
        for (var nIdx = 0; nIdx < aKeys.length; nIdx++) {
            aKeys[nIdx] = decodeURIComponent(aKeys[nIdx]);
        }
        return aKeys;
    }
};

$(function () {
    var va_code = getQueryStringRegExp('code');
    var access_token = docCookies.getItem('access_token');
    var repos = $('#repo-list');
    var progress_bar = $('.progress-bar');
    if (va_code && !access_token) {
        $.post('/', {
            'code': va_code
        }, function (resp) {
            var data = $.parseJSON(resp);
            if (data['access_token']) {
                docCookies.setItem('access_token', data['access_token']);
                console.log('set cookie of access token.');
            }
            else {
                console.log('error');
            }
        });
    }
    if (access_token && !va_code) {
        console.log('access token already exists.');
    }
    $('#get-repo-list').click(function (e) {
        e.preventDefault();
        var tar_user = $('#tar-user').val();
        if (tar_user) {
            if (repos.length) {
                $('#repo-list').empty();
                $('.progress-bar').width('0');
            }
            $.get('https://api.github.com/users/' + tar_user + '/starred?per_page=100', function (resp) {
                var add_repo_list = [];
                for (var i = 0; i < resp.length; i++) {
                    var name = resp[i].full_name;
                    var add_repo = '<li class="col-md-6 repos"><input class="repo-check" type="checkbox" data-repo="' + name + '" checked><a href="https://github.com/' + name + '">' + name + '</a></li>';
                    add_repo_list.push(add_repo);
                }
                $('#repo-list').append(add_repo_list);
                progress_bar.width('5%');
            });
        } else {
            $('#tar-user').focus();
        }
    });
    $('#run').click(function (e) {
        e.preventDefault();
        if (repos.length) {
            $('.repo-check:checked').each(function (i, e) {
                var $e = $(e);
                var rp = $e.data('repo');
                $.post('/starring', {
                    'repo': rp,
                    'accessToken': access_token
                }, function (resp) {
                    if (resp === '200') {
                        $e.parent().children('a').css('color', '#27ae60');
                    } else {
                        $e.parent().children('a').css('color', '#c0392b');
                    }
                });
            });
        }
    });
    $('#reset').click(function (e) {
        e.preventDefault();
        repos.empty();
        progress_bar.width('0');
    });
});