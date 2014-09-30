requirejs.config({
    paths: {
        'ext': '../ext'
    }
});

require(['ext/ng/angular'], function(dontcare) {
    angular.module('MyApp', []);

    angular.module('MyApp').controller('HelloController', HelloController);

    angular.module('MyApp').controller('AvatarController', AvatarController);

    angular.module('MyApp').controller('DummyController', DummyController);

    angular.module('MyApp').directive('onejsControl', ['$timeout', onejsControl]);

    angular.bootstrap(document, ['MyApp']);

    function HelloController() {
        // nop
    }

    function AvatarController() {

    }

    function DummyController($scope) {
        var vm = this;

        vm.test = { 'a': "B" };
        vm.other = { foo: 'bar' };
    }

    function onejsControl($timeout) {
        return {
            restrict: 'E',
            require: '^ngModel',
            scope: {
                ngModel: '=',
                outbound: '='
            },
            template: '<div></div>',
            link: function(scope, el, attr) {
                scope.ngModel = {};
                var controlName = attr.onejsControlName;
                require(['ext/onejs/' + controlName + '/' + controlName], function(Control) {
                    var oneControl = new Control();
                    el.append(oneControl.render());
                    oneControl.activate();
                    scope.$watch('ngModel', function(model) {
                        oneControl.setData(model);
                    }, true);

                    oneControl.events.on(oneControl._viewModel, 'change', function() {
                        $timeout(function() {
                            for(var key in oneControl._viewModel) {
                                if(key[0] !== '_' && oneControl._viewModel.hasOwnProperty(key)) {
                                    scope.ngModel[key] = oneControl._viewModel[key];
                                }
                            }
                        });
                    });

                });
            }
        }
    }
});
