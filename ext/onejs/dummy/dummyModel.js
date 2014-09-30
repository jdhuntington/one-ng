var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", '../onejs/ViewModel'], function(require, exports, ViewModel) {
    var dummyModel = (function (_super) {
        __extends(dummyModel, _super);
        function dummyModel() {
            _super.apply(this, arguments);
            /// <summary>
            /// View model class for defining the observable data contract for the dummy view.
            ///
            /// This class is optional and can be removed if unnecessary. Remove the
            /// js-model attribute from the dummy.html template's root element if you do.
            /// </summary>
            this.exampleMessage = "This is the exampleMessage value in dummyModel.ts.";
            this.amount = '0';
        }
        dummyModel.prototype.amountTimesThree = function () {
            return String(Number(this.amount) * 3);
        };
        return dummyModel;
    })(ViewModel);

    
    return dummyModel;
});
