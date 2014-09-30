var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", './dummyModel', './dummyBase', '../onejs/DomUtils', './dummy.css'], function(require, exports, dummyModel, dummyBase, DomUtils, dummycss) {
    DomUtils.loadStyles(dummycss.styles);

    var dummy = (function (_super) {
        __extends(dummy, _super);
        function dummy() {
            _super.apply(this, arguments);
            this.viewName = 'dummy';
            this.viewModelType = dummyModel;
            this._bindings = [
                {
                    "id": "0",
                    "attr": {
                        "value": "exampleMessage"
                    }
                },
                {
                    "id": "1",
                    "text": "exampleMessage"
                },
                {
                    "id": "2",
                    "attr": {
                        "value": "amount"
                    }
                },
                {
                    "id": "3",
                    "text": "amount"
                },
                {
                    "id": "4",
                    "text": "amountTimesThree"
                }
            ];
        }
        dummy.prototype.onRender = function () {
            var _this = this;
            var bindings = _this._bindings;

            return (_this.element = _this._ce("div", ["class", "dummy"], null, [
                _this._ce("input", ["type", "text", "class", "inputBox"], bindings[0]),
                _this._ce("p", [], null, [
                    _this._ct("You've typed this value:"),
                    _this._ce("b", [], bindings[1])
                ]),
                _this._ce("input", ["type", "range", "class", "inputBox", "min", "0", "max", "100"], bindings[2]),
                _this._ce("p", [], null, [
                    _this._ct("You've selected this value:"),
                    _this._ce("b", [], bindings[3])
                ]),
                _this._ce("p", [], null, [
                    _this._ct("Here's that value times 3:"),
                    _this._ce("b", [], bindings[4])
                ])
            ]));
        };
        return dummy;
    })(dummyBase);

    
    return dummy;
});
