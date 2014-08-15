define(["require", "exports", 'EventGroup'], function(require, exports, EventGroup) {
    var ViewModel = (function () {
        function ViewModel(data) {
            this.__id = ViewModel.__instanceCount++;
            this.__events = new EventGroup(this);
            this.__events.declare('change');
            this.setData(data);
        }
        ViewModel.prototype.dispose = function () {
            this.__events.dispose();
        };

        ViewModel.prototype.setData = function (data, shouldFireChange) {
            var hasChanged = false;

            for (var i in data) {
                if (data.hasOwnProperty(i) && i.indexOf('__') !== 0 && i !== 'setData' && i !== 'dispose' && i !== 'change') {
                    var oldValue = this[i];
                    var newValue = data[i];

                    if (oldValue !== newValue) {
                        if (oldValue && EventGroup.isDeclared(oldValue, 'change')) {
                            this.__events.off(oldValue);
                        }
                        this[i] = newValue;
                        hasChanged = true;
                        if (newValue && EventGroup.isDeclared(newValue, 'change')) {
                            this.__events.on(newValue, 'change', this.change);
                        }
                    }
                }
            }

            if ((hasChanged && shouldFireChange !== false) || shouldFireChange === true) {
                this.__events.raise('change');
            }
        };

        ViewModel.prototype.onInitialize = function () {
        };

        ViewModel.prototype.change = function (args) {
            this.__events.raise('change', args);
        };
        ViewModel.__instanceCount = 0;
        return ViewModel;
    })();

    
    return ViewModel;
});
