define(["require", "exports"], function(require, exports) {
    /// <summary>
    /// Schema for a OneJS template, describes the element structure, what attributes are expected
    /// and how they are parsed.
    /// </summary>
    /// <remarks>
    /// TODO: There should be regex matches defined for attributes so that we can validate
    /// they are acceptable.
    /// </remarks>
    var ViewTemplateDefinition = {
        'js-view': {
            description: '',
            attributes: {
                'js-name': {
                    description: 'Defines the member name for the control.',
                    example: 'listView'
                },
                'js-type': {
                    description: 'Defines the child view type.',
                    example: 'ListView'
                },
                'js-model': {},
                'js-css': {},
                'js-options': {}
            },
            children: ['default', 'js-view']
        },
        'js-control': {
            description: 'Indicates that a child view should be placed here.',
            example: '<js-control js-name="listView" js-type="ListView" />',
            attributes: {
                'js-name': {
                    description: 'Defines the member name for the control.',
                    example: 'listView',
                    isRequired: true
                },
                'js-type': {
                    description: 'Defines the child view type.',
                    example: 'ListView',
                    isRequired: true
                },
                'js-data': {
                    description: 'Provides control-specific options to use for initialization.',
                    example: '{ color: \'black\'}'
                }
            },
            children: []
        },
        'js-state': {
            attribute: {
                'js-name': {
                    description: 'Defines the state to expose from the viewModel for testing purposes.',
                    example: 'isVideoPlaying'
                }
            },
            children: []
        },
        'default': {
            description: 'Match for any html element.',
            example: '<div></div>',
            attributes: {
                'js-bind': {
                    description: 'Defines bindings to apply to the given element.',
                    example: 'href:linkUrl, text:linkText, className.isEnabled:isLinkEnabled, style.display:isVisible'
                },
                'js-userAction': {
                    description: 'Defines events to apply to the given element.',
                    example: 'click:onClick, mousemove:onMouseMove'
                },
                'js-id': {
                    description: 'Defines an id for the element so that on activation the view can find the element and provide it to the view model on activation.'
                },
                'js-repeat': {
                    description: 'Indicates which collection property to repeat the section for, and how to identify the item/index.',
                    example: 'item,itemIndex in items'
                }
            },
            children: [
                'js-section',
                'js-control',
                'js-view',
                'default'
            ]
        }
    };

    
    return ViewTemplateDefinition;
});
