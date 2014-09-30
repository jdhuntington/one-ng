/// <reference path="interfaces.d.ts" />
define(["require", "exports", 'xmldom', './ViewTemplateDefinition'], function(require, exports, XMLDOM, ViewTemplateDefinition) {
    /// <summary>
    /// Represents a compiled view template. Provides a parse method to populate its public
    /// properties. The "errors" property will be populated with an array of strings, if any
    /// occur during parsing.
    /// </summary>
    var CompiledViewTemplate = (function () {
        function CompiledViewTemplate(templateContent) {
            this._blockCount = 0;
            this._annotationCount = 0;
            if (templateContent) {
                this.parse(templateContent);
            } else {
                this._reset();
            }
        }
        CompiledViewTemplate.prototype.parse = function (templateContent) {
            this._reset();
            this.parseRootElement(new XMLDOM.DOMParser().parseFromString(templateContent, 'application/xhtml+xml').documentElement);
        };

        CompiledViewTemplate.prototype.parseRootElement = function (element) {
            this.documentElement = element;
            this.fullType = element.getAttribute('js-type');
            this.name = this._stripPath(element.getAttribute('js-type'));
            this.isPassThrough = Boolean(element.getAttribute('js-passThrough')) || false;
            this.baseViewFullType = element.getAttribute('js-baseType') || '../onejs/View';
            this.baseViewType = this._stripPath(this.baseViewFullType);
            this.viewModelType = element.getAttribute('js-model') || '';
            this.options = element.getAttribute('js-options') || '';
            this.cssInclude = (element.getAttribute('js-css') || '');

            var requires = element.getAttribute('js-require');

            this.requireList = requires ? requires.split(/[ ,]+/) : [];

            // If root is js-view element, parse children. Else, parse this.
            if (element.tagName === 'js-view') {
                this._parseElementChildren(element);
            } else {
                this._parseElement(element);
            }

            element.removeAttribute('js-type');
            element.removeAttribute('js-baseType');
            element.removeAttribute('js-model');
            element.removeAttribute('js-options');
            element.removeAttribute('js-css');
            element.removeAttribute('js-require');
        };

        // Given a name that might be a directory path, return the basename
        // e.g. ../../Foo/Bar/Baz returns "Baz"
        CompiledViewTemplate.prototype._stripPath = function (name) {
            if (name.indexOf('/') > -1) {
                return name.substr(name.lastIndexOf('/') + 1);
            } else {
                return name;
            }
        };

        CompiledViewTemplate.prototype._parseElement = function (element) {
            // Do baseline validation and any custom validation stage for the specific element type.
            if (this._validateElementIsExpected(element) && this._validateAttributes(element) && this._performCustomStage('validate', element)) {
                // The element is valid, process it.
                this._performCustomStage('process', element);

                if (element.tagName !== 'js-view') {
                    this._parseElementChildren(element);
                }
            }
        };

        CompiledViewTemplate.prototype._parseElementChildren = function (element) {
            for (var i = 0; i < element.childNodes.length; i++) {
                var childElement = element.childNodes[i];

                switch (childElement.nodeType) {
                    case element.ELEMENT_NODE:
                        this._parseElement(childElement);
                        break;
                    case element.TEXT_NODE:
                        var value = childElement.textContent.trim();

                        // Remove dead text.
                        if (!value) {
                            element.removeChild(childElement);
                            i--;
                        }
                        break;
                }
            }
        };

        CompiledViewTemplate.prototype._reset = function () {
            this.name = '';
            this.fullType = '';
            this.viewModelType = '';
            this.options = '';
            this.annotations = {};
            this.childViews = {};
            this.properties = {};
            this.requireList = [];
            this.cssInclude = '';
            this.subTemplates = [];
            this.events = [];
            this.errors = [];
            this.documentElement = null;

            this._annotationCount = 0;
        };

        CompiledViewTemplate.prototype._addError = function (errorMessage, element) {
            var lineNumber = element ? element['lineNumber'] : undefined;
            var columnNumber = element ? element['columnNumber'] : undefined;
            var position = (lineNumber !== undefined && columnNumber !== undefined) ? ('(line: ' + lineNumber + ', col: ' + columnNumber + ') ') : '';

            this.errors.push(position + errorMessage);
        };

        CompiledViewTemplate.prototype._performCustomStage = function (stageName, element) {
            var elementDefinition = this._getDefinition(element);
            var isValid = true;
            var stageEventMethodName = '_' + stageName + this._getHandlerName(elementDefinition.id) + 'Element';

            if (!this[stageEventMethodName] || this[stageEventMethodName].call(this, element, elementDefinition)) {
                for (var attributeName in elementDefinition.attributes) {
                    var stageAttributeMethodName = '_' + stageName + this._getHandlerName(attributeName) + 'Attribute';
                    var attributeValue = element.getAttribute(attributeName);

                    if (this[stageAttributeMethodName] && attributeValue && this[stageAttributeMethodName].call(this, element, elementDefinition, attributeValue) === false) {
                        isValid = false;
                        break;
                    }
                }
            } else {
                isValid = false;
            }

            return isValid;
        };

        CompiledViewTemplate.prototype._validateElementIsExpected = function (element) {
            var elementDefinition = this._getDefinition(element);
            var isValid = true;
            var parentElement = element.parentNode;
            var parentDefinition = this._getDefinition(parentElement);

            if (parentDefinition && parentDefinition.children.indexOf(elementDefinition.id) === -1) {
                this._addError('The element "' + element.tagName + '" is not a valid child for the element "' + parentElement.tagName + '".', element);
                isValid = false;
            }

            return isValid;
        };

        CompiledViewTemplate.prototype._validateAttributes = function (element) {
            var isValid = true;
            var elementDefinition = this._getDefinition(element);

            for (var attributeName in elementDefinition.attributes) {
                var attribute = elementDefinition.attributes[attributeName];
                if (attribute.isRequired && !element.getAttribute(attributeName)) {
                    isValid = false;
                    this._addError('The element "' + element.tagName + '" was missing a required attribute "' + attributeName + '".', element);
                }
            }

            return isValid;
        };

        CompiledViewTemplate.prototype._validateRepeatAttribute = function (element, elementDefintion, attributeValue) {
            element.removeAttribute('js-repeat');

            var repeatParts = attributeValue.split(' in ');
            var repeatTarget = repeatParts[0];
            var repeatSource = repeatParts[1];
            var repeatIndex = '';

            if (repeatTarget.indexOf(',')) {
                repeatParts = repeatTarget.split(/[\s,]+/);
                repeatTarget = repeatParts[0];
                repeatIndex = repeatParts[1];
            }

            var itemTemplate = new CompiledViewTemplate();
            var blockCount = (this.parentTemplate ? this.parentTemplate._blockCount++ : this._blockCount++);
            var repeatBlockType = (this.parentTemplate ? this.parentTemplate.name : this.name) + 'Block' + blockCount;
            var repeatItemType = repeatBlockType + 'Item';
            var rootSurfaceElement = element.cloneNode(true);

            while (element.attributes.length) {
                element.removeAttribute(element.attributes[0].name);
            }

            while (element.childNodes.length) {
                element.removeChild(element.childNodes[0]);
            }

            var itemPlaceholderNode = element.cloneNode();

            element.tagName = 'js-view';

            var itemTemplateElement = element.cloneNode();

            element.setAttribute('js-name', this._toCamelCase(repeatBlockType));
            element.setAttribute('js-type', repeatBlockType);
            element.setAttribute('js-baseType', '../onejs/Repeater');
            element.setAttribute('js-passThrough', 'true');
            element.setAttribute('js-options', '{ childViewType: \'' + repeatItemType + '\', itemName: \'' + '"' + repeatTarget + '"' + '\'' + (repeatIndex ? (', itemIndex: \'' + '"' + repeatIndex + '"\'') : '') + ' }');

            element.setAttribute('js-data', '{ items: ' + repeatSource + ' }');

            itemTemplateElement.setAttribute('js-name', this._toCamelCase(repeatItemType));
            itemTemplateElement.setAttribute('js-type', repeatItemType);

            while (rootSurfaceElement.childNodes.length) {
                var childNode = rootSurfaceElement.childNodes[0];

                itemTemplateElement.appendChild(childNode);
            }

            itemPlaceholderNode.tagName = 'js-items';

            rootSurfaceElement.setAttribute('js-id', 'surface');
            rootSurfaceElement.appendChild(itemPlaceholderNode);

            element.appendChild(rootSurfaceElement);

            itemTemplate.parentTemplate = this.parentTemplate || this;
            itemTemplate.parseRootElement(itemTemplateElement);

            this.subTemplates.push(itemTemplate);

            //containerTemplate.parseRootElement(containerViewElement);
            //this.subTemplates.push(containerTemplate);
            return true;
        };

        CompiledViewTemplate.prototype._processViewElement = function (element) {
            var subTemplate = new CompiledViewTemplate();
            var name = element.getAttribute('js-name');

            subTemplate.parseRootElement(element);

            var childView = this.childViews[name] = {
                name: name,
                type: subTemplate.name || '',
                fullType: subTemplate.fullType || '',
                baseType: subTemplate.baseViewType,
                fullBaseType: subTemplate.baseViewFullType,
                options: subTemplate.options || '',
                data: element.getAttribute('js-data') || '',
                shouldImport: (element.childNodes.length == 0),
                template: subTemplate
            };

            if (!childView.shouldImport) {
                this.subTemplates.push(subTemplate);
            }

            return true;
        };

        /*
        private _validateSectionElement(element: HTMLElement, elementDefinition): boolean {
        var isValid = true;
        
        if (!element.getAttribute('js-if') && !element.getAttribute('js-repeat')) {
        this._addError('The element "js-section" requires either a "js-if" or "js-repeat" attribute.', element);
        isValid = false;
        }
        
        return isValid;
        }
        
        private _processViewElement(element): boolean {
        var annotation = this._getAnnotation(element);
        
        this.name = element.getAttribute('js-name');
        element.removeAttribute('js-name');
        
        this.viewModelType = element.getAttribute('js-model') || '';
        element.removeAttribute('js-model');
        
        this.cssInclude = (element.getAttribute('js-css') || '');
        element.removeAttribute('js-css');
        
        this.cssInclude
        if (this.name.indexOf('.') > -1) {
        var nameParts = this.name.split('.');
        this.name = nameParts[nameParts.length - 1];
        }
        
        return true;
        }
        
        private _processControlElement(element): boolean {
        var parentNode = element.parentNode;
        var name = element.getAttribute('js-name');
        
        if (this.childViews[name]) {
        this._addError('The is more than 1 control with the name "' + name + '".', element);
        } else {
        this.childViews[name] = {
        name: name,
        type: element.getAttribute('js-type') || '',
        data: element.getAttribute('js-data')
        };
        }
        
        return true;
        }
        */
        CompiledViewTemplate.prototype._processIdAttribute = function (element, elementDefinition, attributeValue) {
            var childId = element.getAttribute('js-id');
            var annotation;

            if (childId) {
                annotation = this._getAnnotation(element);
                annotation.childId = childId;
                element.removeAttribute('js-id');
            }

            return true;
        };

        CompiledViewTemplate.prototype._processBindAttribute = function (element, elementDefinition, attributeValue) {
            var _this = this;
            var annotation = _this._getAnnotation(element);

            // The current compiler allows semicolons or commas.
            attributeValue = attributeValue.replace(/;/g, ',');

            attributeValue.match(/([a-zA-Z0-9-_$:.]*\([^\)]+\)|[^,^(^)]+)/g).forEach(function (binding) {
                var bindingDestSource = binding.split(':');
                var dest = bindingDestSource[0].trim();
                var source = bindingDestSource[1].trim();
                var subDest = dest.split('.');

                if (subDest.length > 1) {
                    dest = subDest.shift();
                    subDest = subDest.join('.');
                } else {
                    subDest = dest;
                    dest = 'attr';
                }

                var expectedSourceType = (source.indexOf('is') == 0) ? 'boolean' : 'string';

                switch (dest) {
                    case 'attr':
                        if (subDest === 'text') {
                            annotation.text = source;
                        } else if (subDest === 'html') {
                            annotation.html = source;
                        } else {
                            var attributeBindings = annotation['attr'] = annotation['attr'] || {};

                            attributeBindings[subDest] = source;
                        }

                        break;

                    case 'className':
                        var classBindings = annotation['className'] = annotation['className'] || {};

                        expectedSourceType = 'boolean';
                        classBindings[subDest] = source;
                        break;

                    case 'css':
                        var styleBindings = annotation['css'] = annotation['css'] || {};

                        styleBindings[subDest.toLowerCase()] = source;
                        break;
                }

                if (!_this.properties[source]) {
                    _this.properties[source] = {
                        name: source,
                        type: expectedSourceType
                    };
                }

                element.removeAttribute('js-bind');
            });

            return true;
        };

        CompiledViewTemplate.prototype._processUserActionAttribute = function (element, elementDefinition, attributeValue) {
            var _this = this;
            var annotation = _this._getAnnotation(element);
            var events = annotation.events = annotation.events || {};

            // This match isn't quite right, doesn't ignore whitespace.
            attributeValue.match(/([a-zA-Z0-9-_$:.]*\([^\)]+\)|[^,^(^)]+)/g).forEach(function (event) {
                event = event.split(':');

                var eventName = event[0].trim();
                var callbackName = event[1].trim();

                events[eventName] = events[eventName] || [];
                events[eventName].push(callbackName);
            });

            element.removeAttribute('js-userAction');

            return true;
        };

        CompiledViewTemplate.prototype._getDefinition = function (element) {
            var definition = null;
            var definitionId = ViewTemplateDefinition[element.tagName] ? element.tagName : 'default';

            element = element.nodeType === element.DOCUMENT_NODE ? null : element;

            if (element) {
                definition = ViewTemplateDefinition[definitionId];
                definition.id = definitionId;
            }

            return definition;
        };

        CompiledViewTemplate.prototype._getHandlerName = function (propertyName) {
            if (propertyName.substr(0, 3) === 'js-') {
                propertyName = propertyName.substr(3);
            }

            propertyName = propertyName.substr(0, 1).toUpperCase() + propertyName.substr(1);

            return propertyName;
        };

        CompiledViewTemplate.prototype._getAnnotation = function (element) {
            if (!element['annotation']) {
                var id = String(this._annotationCount++);

                this.annotations[id] = element['annotation'] = {
                    id: id
                };
            }

            return element['annotation'];
        };

        CompiledViewTemplate.prototype._toCamelCase = function (val) {
            val = val || '';

            val = val[0].toLowerCase() + val.substr(1);

            return val;
        };
        return CompiledViewTemplate;
    })();

    
    return CompiledViewTemplate;
});
