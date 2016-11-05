/*
 * Copyright (C) 2016 Language Technology Group and Interactive Graphics Systems Group, Technische Universität Darmstadt, Germany
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

define([
    'angular',
    'angularMoment',
    'd3',
    'awesome-slider',
    'toggle-switch'
], function (angular) {
    'use strict';

    angular.module('myApp.tools', ['play.routing', 'angularMoment', 'angularAwesomeSlider', 'toggle-switch']);
    angular.module('myApp.tools')
    .controller('ToolController',
    [
        '$scope',
        '$uibModal',
        'toolShareService',
        'graphPropertiesShareService',
        function(
            $scope,
            $uibModal,
            toolShareService,
            graphPropertiesShareService
        )
        {
            toolShareService.enableOrDisableButtons();

            function createSliderOptions(value, text)
            {
                return {
                    value: "3",
                    options: {
                        from: 1,
                        to: 100,
                        step: 1,
                        dimension: text,
                        limits: false,
                        scale: [1, 100],
                        css: {
                            background: {"background-color": "silver"},
                            before: {"background-color": "#7CB5EC"},
                            default: {"background-color": "silver"},
                            after: {"background-color": "#7CB5EC"},
                            pointer: {"background-color": "#2759AC"}
                        },
                        callback: function(value, released){
                            toolShareService.updateGraph();
                        }
                    }
                }
            }

            $scope.sliderCountriesCitiesAmount = createSliderOptions("3", " countries/cities");
            $scope.sliderOrganizationsAmount = createSliderOptions("3", " organizations");
            $scope.sliderPersonsAmount = createSliderOptions("3", " persons");
            $scope.sliderMiscellaneousAmount = createSliderOptions("3", " miscellaneous");

            toolShareService.sliderLocationsValue = function(){return $scope.sliderCountriesCitiesAmount.value;};
            toolShareService.sliderOrganizationsValue = function(){return $scope.sliderOrganizationsAmount.value;};
            toolShareService.sliderPersonsValue = function(){return $scope.sliderPersonsAmount.value;};
            toolShareService.sliderMiscellaneousValue = function(){return $scope.sliderMiscellaneousAmount.value;};

            toolShareService.sliderEdgeMinFreq = function(){return $scope.sliderEdgeFrequency.value.split(";")[0]};
            toolShareService.sliderEdgeMaxFreq = function(){return $scope.sliderEdgeFrequency.value.split(";")[1]};

            toolShareService.sliderEdgeAmount = function () {return $scope.sliderEdgeAmount.value};
            toolShareService.sliderEdgesPerNode = function () {return $scope.sliderEdgesPerNode.value};

            $scope.toolShareService = toolShareService;

            $scope.categories = [{name:'', img: '', color: ''},{name:'PER', img: 'person'/*'face'*/, val: 1, color: '#bebada', singular: 'Person'}
                ,{name:'ORG', img: 'account_balance', val: 1, color:'#fb8072', singular: 'Organisation'},
                {name:'LOC', img: 'place', val: 1, color: '#8dd3c7', singular: 'Location'},
                {name:'MISC', img: 'reorder', val: 1, color: '#ffffb3', singular: 'Miscellaneous'}];

            $scope.UIitems = function () {
                return toolShareService.UIitems
            };

            $scope.prioToColor = function () {
                return toolShareService.priorityToColor
            };

            $scope.prioToIcon = function () {
                return toolShareService.priorityToIcon
            };

            $scope.updateGuidance = function () {
                if(document.getElementById("settings-button").getAttribute("aria-expanded")){
                    document.getElementById("settings-button").setAttribute("aria-expanded", false);
                    toolShareService.updateGuidance();
                }
            };

            $scope.undoGuidanceStep = function () {
                toolShareService.undoGuidance()
            };
            $scope.redoGuidanceStep = function () {
                toolShareService.redoGuidance()
            };
            $scope.undoAvailable = function () {
                return toolShareService.undoAvailable()
            };
            $scope.redoAvailable = function () {
                return toolShareService.redoAvailable()
            };

            var UIgeneralItems = [1,1,1,1];
            // var priorityToColor = ["white","white","#83a2d6","#2759ac"];

            function updateToolDisplay(efreq, epn) {
                $scope.sliderEdgeAmount.value = efreq.toString();
                $scope.sliderEdgesPerNode.value = epn.toString();
            };
            toolShareService.updateToolDisplay = updateToolDisplay;


            $scope.setUI = function (x,y) {
                toolShareService.UIitemsChanged = true;
                if ((x==0 || y==0) && !(x==0 && y==0)){ //Wenn ein Icon angeklickt wurde
                    var prio = (UIgeneralItems[x + y -1] + 1) % 4;
                    UIgeneralItems[x + y -1] = prio;
                    x = x+y;
                    document.getElementById(x+'.0').style.borderColor = toolShareService.priorityToColorBorder[prio];
                    document.getElementById('0.'+x).style.borderColor = toolShareService.priorityToColorBorder[prio];
                    for (var i = 0; i<UIgeneralItems.length; i++){
                        toolShareService.UIitems[i][x - 1] = prio;
                        toolShareService.UIitems[x - 1][i] = prio;
                    }
                } else {
                    var prio = (toolShareService.UIitems[x - 1][y - 1] + 1) % 4;
                    toolShareService.UIitems[y - 1][x - 1] = prio;
                    toolShareService.UIitems[x - 1][y - 1] = prio;
                }
            //console.log(toolShareService.UIitems);
            };

            // A slider for choosing the minimum and maximum frequency of a displayed edge.
            $scope.sliderEdgeFrequency = {
                //value: "1500;"+$scope.maxEdgeFreq,
                value: "1500;81337",
                options: {
                    from: 1,
                    to: 81337,
                    step: 1,
                    dimension: " Connections between entities",
                    limits: false,
                    scale: [1, /*$scope.maxEdgeFreq*/ 81337],
                    css: {
                        background: {"background-color": "silver"},
                        range: {"background-color": "#7CB5EC"},
                        default: {"background-color": "silver"},
                        after: {"background-color": "#7CB5EC"},
                        pointer: {"background-color": "#2759AC"}
                    },
                    callback: function(value, released){
                        toolShareService.updateGraph();
                    }
                }
            };
            $scope.sliderEdgeAmount = {
                //value: "1500;"+$scope.maxEdgeFreq,
                value: "20",
                options: {
                    from: 5,
                    to: 40,
                    step: 1,
                    dimension: " displayed Edges",
                    limits: false,
                    scale: [5, /*$scope.maxEdgeFreq*/ 40],
                    css: {
                        background: {"background-color": "silver"},
                        range: {"background-color": "#7CB5EC"},
                        default: {"background-color": "silver"},
                        after: {"background-color": "#7CB5EC"},
                        pointer: {"background-color": "#2759AC"}
                    },
                    callback: function(value, released){
                        //toolShareService.updateGraph();
                    }
                }
            };
            $scope.sliderEdgesPerNode = {
                //value: "1500;"+$scope.maxEdgeFreq,
                value: "4",
                options: {
                    from: 1,
                    to: 10,
                    step: 1,
                    dimension: " Edges per Node (max)",
                    limits: false,
                    scale: [1, 10],
                    css: {
                        background: {"background-color": "silver"},
                        range: {"background-color": "#7CB5EC"},
                        default: {"background-color": "silver"},
                        after: {"background-color": "#7CB5EC"},
                        pointer: {"background-color": "#2759AC"}
                    },
                    callback: function(value, released){
                        //toolShareService.updateGraph();
                    }
                }
            };

            $scope.getEgoNetwork = function()
            {
                var listener = toolShareService.getEgoNetworkListener

                listener.forEach
                (
                    function(l)
                    {
                        l(toolShareService.getSelectedNodes()[0]);
                    }
                )
            }

            $scope.hide = function()
            {
                var listener = toolShareService.editNameListener

                listener.forEach
                (
                    function(l)
                    {
                        l(toolShareService.getSelectedNodes());
                    }
                )
            }

            $scope.editOpen = function()
            {
            	var modal = $uibModal.open(
            		{
            			animation: true,
            			templateUrl: 'editModal',
            			controller: 'EditModalController',
            			size: 'sm',
            			resolve:
            			{
            				text: function(){return toolShareService.getSelectedElementsText();},
            				type: function(){return toolShareService.getSelectedNodes()[0].type;},
            				node: function(){return toolShareService.getSelectedNodes()[0];}
            			}
            		}
            	);

            	modal.result.then(function(result)
            	{
            	    if(result.node.name != result.text)
            	    {
            	        var listener = toolShareService.editNameListener

            	        listener.forEach
            	        (
            	            function(l)
            	            {
            	                l(result.node, result.text);
            	            }
            	        )
            	    }

            	    if(result.node.type != result.type)
                    {
                        var listener = toolShareService.editTypeListener

                        listener.forEach
                        (
                            function(l)
                            {
                                l(result.node, result.type);
                            }
                        )
                    }
            	});
            }

            $scope.annotateOpen = function()
            {
                var modal = $uibModal.open(
            	{
                    animation: true,
                    templateUrl: 'annotateModal',
                    controller: 'TextModalController',
                    size: 'lg',
                    resolve:
                    {
                        text: function(){return ""},
                        node: function(){return toolShareService.getSelectedNodes()[0];}
                    }
                }
                );

                modal.result.then(function(result)
                {
                    var listener = toolShareService.annotateListener;

                    listener.forEach
                    (
                        function(l)
                        {
                            l(result.node, result.text)
                        }
                    )
                });
            }

            $scope.mergeOpen = function()
            {
            	var modal = $uibModal.open(
                	{
                		animation: true,
                		templateUrl: 'mergeModal',
                		controller: 'MergeModalController',
                		size: 'lg',
                		resolve:
                		{
                			selectedNodes: function(){return toolShareService.getSelectedNodes();}
                		}
                	}
                );

                modal.result.then(function(result)
                {
                    var listener = toolShareService.mergeListener;
                    var nodes = toolShareService.getSelectedNodes()

                    listener.forEach
                    (
                        function(l)
                        {
                            l(result.focalNode, nodes)
                        }
                    )
                }
                );
            }

            $scope.deleteOpen = function()
            {
                var modal = $uibModal.open(
                	{
                		animation: true,
                		templateUrl: 'deleteModal',
                		controller: 'ConfirmModalController',
                		size: 'sm',
                		resolve:
                		{
                			text: function(){return "Do you really want to delete these Elements?";},
                			nodes: function(){return toolShareService.getSelectedNodes();}
                		}
                	}
                );

                modal.result.then(function(result)
                {
                    var listener = toolShareService.deleteListener;

                    listener.forEach
                    (
                        function(l)
                        {
                            l(result.nodes);
                        }
                    );
                });
            }
        }
    ]);
});