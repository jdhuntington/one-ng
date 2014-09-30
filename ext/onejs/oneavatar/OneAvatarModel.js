var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", '../onejs/ViewModel', './md5'], function(require, exports, ViewModel, MD5) {
    var OneAvatarModel = (function (_super) {
        __extends(OneAvatarModel, _super);
        function OneAvatarModel() {
            _super.apply(this, arguments);
            this.src = "#";
            this.className = "c-oneavatar";
            this.address = "uninitialized value";
            this.size = 400;
        }
        OneAvatarModel.prototype.setData = function (data, shouldFireChange) {
            if (data && data.address) {
                this.address = data.address;
                var hash = (new MD5()).md5(data.address);
                this.src = "http://www.gravatar.com/avatar/" + hash + "?s=" + this.size;
                this.change();
            }
            _super.prototype.setData.call(this, data, shouldFireChange);
        };
        return OneAvatarModel;
    })(ViewModel);

    
    return OneAvatarModel;
});
