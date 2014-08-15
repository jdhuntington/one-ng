requirejs.config({
    paths: {
        'ext': '../ext'
    }
});

require(['ext/ng/angular', 'ext/oneavatar/OneAvatar'], function(dontcare, OneAvatar) {
    angular.module('MyApp', []);

    angular.module('MyApp').controller('HelloController', HelloController);

    angular.module('MyApp').controller('AvatarController', AvatarController);

    angular.module('MyApp').directive('onejsControl', onejsControl);

    angular.bootstrap(document, ['MyApp']);

    function HelloController() {
        // nop
    }

    function AvatarController() {
        var c = this;
        c.doStuff = doStuff;

        function doStuff() {
            alert("doing stuff.");
        }
    }

    function onejsControl() {
        return {
            restrict: 'E',
            require: '^ngModel',
            scope: {
                ngModel: '='
            },
            template: '<div></div>',
            link: function(scope, el, attr) {
		var oneControl = new OneAvatar();
		el.html(oneControl.renderHtml());
		oneControl.activate();

		scope.$watch('ngModel.address', function(val) {
		    oneControl.setData({ address: val });
		});
            }
        }
    }
});
