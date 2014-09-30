define(["require", "exports", './CompiledViewTemplate'], function(require, exports, CompiledViewTemplate) {
    var CRLF = '\r\n';
    var INDENT = '    ';

    /// <summary>
    /// Base generator class that others generators can subclass from. Contains common
    /// generator utilities that can be reused, like _addLine, _getIndent, etc. Output
    /// is always accessible via the public output property, resulting compiled template
    /// is accessible from the template property.
    /// </summary>
    var BaseGenerator = (function () {
        function BaseGenerator() {
            this.output = '';
        }
        BaseGenerator.prototype._getTemplate = function (templateContent) {
            this._reset();

            this.template = new CompiledViewTemplate(templateContent);

            if (this.template.errors.length) {
                var errorMessage = this.template.errors.join('\n');

                throw errorMessage;
            }

            return this.template;
        };

        BaseGenerator.prototype._reset = function () {
            this.output = '';
            this.template = null;
        };

        BaseGenerator.prototype._addLine = function (message, indentDepth) {
            this.output += this._getIndent(indentDepth || 0) + (message || '') + CRLF;
        };

        BaseGenerator.prototype._getIndent = function (depth) {
            var _output = '';

            for (var i = 0; i < depth; i++) {
                _output += INDENT;
            }

            return _output;
        };

        BaseGenerator.prototype._toTitleCase = function (val) {
            return val.substr(0, 1).toUpperCase() + val.substr(1);
        };
        return BaseGenerator;
    })();

    
    return BaseGenerator;
});
