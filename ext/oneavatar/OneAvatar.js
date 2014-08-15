var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", 'OneAvatarModel', 'View', 'DomUtils', 'OneAvatar.css'], function(require, exports, OneAvatarModel, View, DomUtils, OneAvatarcss) {
    DomUtils.loadStyles(OneAvatarcss.styles);

    var OneAvatar = (function (_super) {
        __extends(OneAvatar, _super);
        function OneAvatar() {
            _super.apply(this, arguments);
            this.viewName = 'OneAvatar';
            this.viewModelType = OneAvatarModel;
            this._bindings = [
                {
                    "id": "0",
                    "attr": {
                        "src": "src",
                        "class": "className"
                    }
                }
            ];
        }
        OneAvatar.prototype.onRenderHtml = function () {
            return '' + '<img id="' + this.id + '_0" ' + this._genAttr('', ['src', 'src', 'class', 'className']) + '></img>' + '';
        };
        return OneAvatar;
    })(View);

    
    return OneAvatar;
});
