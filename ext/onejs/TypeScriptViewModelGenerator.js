var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", './BaseGenerator'], function(require, exports, BaseGenerator) {
    /// <summary>
    /// Generates a TypeScript view model interface from a OneJS template.
    /// </summary>
    var TypeScriptViewModelGenerator = (function (_super) {
        __extends(TypeScriptViewModelGenerator, _super);
        function TypeScriptViewModelGenerator() {
            _super.apply(this, arguments);
        }
        TypeScriptViewModelGenerator.prototype.generate = function (templateContent) {
            var _this = this;
            var template = this._getTemplate(templateContent);
            var interfaceName = 'I' + template.name + 'Model';

            _this._addLine('interface ' + interfaceName + ' {');

            /*
            // Add properties being bound to.
            for (var propertyName in template.properties) {
            _this._addLine(propertyName + ': ' + template.properties[propertyName].type + ';', 1);
            }
            
            // Add events being bound to.
            if (template.events.length) {
            _this._addLine();
            template.events.forEach(function(eventName) {
            _this._addLine(eventName + '(eventArgs?: any): boolean;', 1);
            });
            }
            */
            _this._addLine('}');
            _this._addLine();
            _this._addLine('export = ' + interfaceName + ';');

            return _this.output;
        };
        return TypeScriptViewModelGenerator;
    })(BaseGenerator);

    
    return TypeScriptViewModelGenerator;
});
